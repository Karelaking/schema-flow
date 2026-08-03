// =============================================================================
// AI DB Architect Agent — Autonomous Multi-Step Orchestrator
// =============================================================================
//
// Manages the multi-step goal decomposition, RAG retrieval, multi-turn tool
// execution in sandbox, self-evaluation audit loop, and auto-correction.
// Does not stop until the user's task is fully accomplished and verified.
// =============================================================================

import { buildSystemPrompt } from "./prompts";
import { SCHEMA_TOOLS } from "./tools";
import { buildRequest, parseOpenAIStream } from "./provider-client";
import { runInSandbox } from "./sandbox";
import { evaluateSchemaAST, buildAuditFeedbackPrompt } from "./evaluator";
import { queryKnowledgeBase, buildRAGPromptContext } from "@/lib/rag/rag-engine";
import { loadProjectMemory, buildMemoryPromptContext, saveProjectMemory } from "./agent-memory";
import type { AIProvider, ChatMessage, CustomRule, SandboxResult, ToolCall } from "./types";
import type { SchemaAST } from "@/packages/schema-core";
import type { ProviderMessage } from "./provider-client";
import type { SchemaAuditReport } from "./evaluator";

export interface OrchestratorPhase {
  step: "memory" | "rag" | "thinking" | "executing" | "evaluating" | "fixing" | "complete";
  message: string;
  iteration: number;
}

export interface OrchestrationResult {
  assistantResponse: string;
  sandboxResult: SandboxResult | null;
  auditReport: SchemaAuditReport | null;
  ragContextUsed: boolean;
  iterationsRun: number;
}

export interface OrchestrateOptions {
  prompt: string;
  schemaAST: SchemaAST;
  messages: ChatMessage[];
  customRules: CustomRule[];
  provider: AIProvider;
  model: string;
  apiKey: string;
  customEndpoint?: string;
  isGoalMode: boolean; // True for autonomous self-evaluation loop
  onPhaseUpdate?: (phase: OrchestratorPhase) => void;
  onTextChunk?: (chunk: string) => void;
}

/**
 * Executes the autonomous multi-step orchestration loop.
 */
export async function runAutonomousOrchestration(
  options: OrchestrateOptions
): Promise<OrchestrationResult> {
  const {
    prompt,
    schemaAST,
    messages,
    customRules,
    provider,
    model,
    apiKey,
    customEndpoint,
    isGoalMode,
    onPhaseUpdate,
    onTextChunk,
  } = options;

  const projectId = schemaAST.project.id;
  const dialect = schemaAST.settings?.dialect ?? "sqlite";

  // 1. Load Project Memory
  onPhaseUpdate?.({ step: "memory", message: "Loading project chat history...", iteration: 1 });
  const memory = loadProjectMemory(projectId);
  const memoryContext = buildMemoryPromptContext(memory);

  // 2. Query RAG Knowledge Base (Top 2 for speed)
  onPhaseUpdate?.({ step: "rag", message: "Searching domain knowledge...", iteration: 1 });
  const ragResults = queryKnowledgeBase({ query: prompt, dialect, topK: 2 });
  const ragContext = buildRAGPromptContext(ragResults);

  // 3. Build Dynamic System Prompt with Memory + RAG + Rules
  const systemPrompt = [
    buildSystemPrompt(schemaAST, customRules, dialect),
    memoryContext,
    ragContext,
  ].filter(Boolean).join("\n\n");

  const providerMessages: ProviderMessage[] = [
    { role: "system", content: systemPrompt },
  ];

  // Include recent conversation context (last 10 turns for speed)
  const recentMessages = messages.slice(-10);
  for (const msg of recentMessages) {
    if (msg.role === "system") continue;
    providerMessages.push({
      role: msg.role as ProviderMessage["role"],
      content: msg.content,
      tool_calls: msg.toolCalls,
      tool_call_id: msg.toolCallId,
    });
  }

  // Max iterations: 2 in goal mode, 1 in standard mode
  const maxIterations = isGoalMode ? 2 : 1;
  let currentIteration = 1;
  let currentAST = schemaAST;
  let finalAssistantText = "";
  let currentSandboxResult: SandboxResult | null = null;
  let finalAuditReport: SchemaAuditReport | null = null;

  while (currentIteration <= maxIterations) {
    onPhaseUpdate?.({
      step: "thinking",
      message: `Designing schema (Pass ${currentIteration}/${maxIterations})...`,
      iteration: currentIteration,
    });

    // Build API request
    const supportsTools = !model.includes("deepseek-r1");
    const { url, init } = buildRequest({
      provider,
      model,
      apiKey,
      messages: providerMessages,
      tools: supportsTools ? SCHEMA_TOOLS : undefined,
      customEndpoint,
    });

    const response = await fetch(url, init);
    if (!response.ok) {
      const errorText = await response.text();
      let statusMsg = "";
      try {
        const jsonErr = JSON.parse(errorText);
        statusMsg = jsonErr.statusMessage || jsonErr.error || "";
      } catch {
        statusMsg = errorText.slice(0, 300);
      }
      throw new Error(statusMsg || `Provider returned ${response.status}`);
    }

    if (!response.body) throw new Error("No response body received from provider");

    // Stream response
    const reader = response.body.getReader();
    let iterText = "";
    const iterToolCalls: ToolCall[] = [];

    for await (const chunk of parseOpenAIStream(reader)) {
      if (chunk.type === "text" && chunk.content) {
        iterText += chunk.content;
        onTextChunk?.(chunk.content);
      } else if (chunk.type === "tool_call" && chunk.toolCall) {
        iterToolCalls.push(chunk.toolCall);
      } else if (chunk.type === "error") {
        throw new Error(chunk.error ?? "Streaming error");
      }
    }

    finalAssistantText += iterText;

    if (iterToolCalls.length > 0) {
      onPhaseUpdate?.({
        step: "executing",
        message: `Executing ${iterToolCalls.length} schema operation(s)...`,
        iteration: currentIteration,
      });

      // Run tool calls in isolated sandbox
      currentSandboxResult = runInSandbox(currentAST, iterToolCalls);
      currentAST = currentSandboxResult.proposedAST;

      // 4. Run Self-Evaluation Audit Engine
      onPhaseUpdate?.({
        step: "evaluating",
        message: "Auditing schema quality...",
        iteration: currentIteration,
      });

      finalAuditReport = evaluateSchemaAST(currentAST, customRules);

      // Check if self-correction is needed (only if critical errors exist)
      if (isGoalMode && finalAuditReport.errorCount > 0 && currentIteration < maxIterations) {
        onPhaseUpdate?.({
          step: "fixing",
          message: `Detected ${finalAuditReport.errorCount} error(s). Auto-correcting...`,
          iteration: currentIteration,
        });

        // Feed audit feedback back to model for next iteration
        const feedback = buildAuditFeedbackPrompt(finalAuditReport);
        providerMessages.push({ role: "assistant", content: iterText, tool_calls: iterToolCalls });
        providerMessages.push({ role: "user", content: feedback });

        currentIteration++;
        continue;
      }
    }

    break; // Complete if no tool calls or passed audit
  }

  // Save updated conversation memory for project
  saveProjectMemory(projectId, messages, currentAST);

  onPhaseUpdate?.({
    step: "complete",
    message: finalAuditReport?.passed ? "Goal completed with 0 errors!" : "Schema generation complete.",
    iteration: currentIteration,
  });

  return {
    assistantResponse: finalAssistantText,
    sandboxResult: currentSandboxResult,
    auditReport: finalAuditReport,
    ragContextUsed: ragResults.length > 0,
    iterationsRun: currentIteration,
  };
}
