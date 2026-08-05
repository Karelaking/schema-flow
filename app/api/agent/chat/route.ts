// =============================================================================
// AI DB Architect Agent — Streaming Chat API Route
// =============================================================================
//
// POST /api/agent/chat
// Accepts messages, schema context, custom rules, and provider config.
// Proxies to the selected AI provider and streams back text + tool calls.
// =============================================================================

import { NextRequest } from "next/server";
import { buildSystemPrompt } from "@/lib/ai/prompts";
import { SCHEMA_TOOLS } from "@/lib/ai/tools";
import { buildRequest } from "@/lib/ai/provider-client";
import { queryKnowledgeBase, buildRAGPromptContext } from "@/lib/rag/rag-engine";
import { loadProjectMemory, buildMemoryPromptContext } from "@/lib/ai/agent-memory";
import type { AIProvider, ChatMessage, CustomRule } from "@/lib/ai/types";
import type { SchemaAST } from "@/packages/schema-core";
import type { ProviderMessage } from "@/lib/ai/provider-client";
import { captureException } from "@/lib/sentry.util";

export const runtime = "nodejs";

interface ChatRequestBody {
  messages: ChatMessage[];
  schemaAST: SchemaAST;
  customRules: CustomRule[];
  provider: AIProvider;
  model: string;
  customEndpoint?: string;
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = (await request.json()) as ChatRequestBody;
    const { messages, schemaAST, customRules, provider, model, customEndpoint } = body;

    // Extract API key from header (never stored server-side)
    const apiKey = request.headers.get("x-api-key") ?? "";

    // All providers (including OpenRouter free models) require an API key for authentication.
    // OpenRouter free models cost $0 but still need a valid key.
    if (!apiKey) {
      const isFreeModel = model.endsWith(":free");
      const hint = isFreeModel
        ? "Free models still require an OpenRouter API key (it's free to create). Go to openrouter.ai/keys to get one, then add it in AI Settings (⚙️ icon)."
        : "Add your API key in AI Settings (⚙️ icon in the chat header).";
      const statusMessage = `API key required. ${hint}`;
      return Response.json(
        { error: statusMessage, statusMessage },
        { status: 401 }
      );
    }

    // 1. Fetch RAG Context for latest user message
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
    const dialect = schemaAST.settings?.dialect ?? "sqlite";
    const ragResults = queryKnowledgeBase({ query: lastUserMessage, dialect, topK: 3 });
    const ragContext = buildRAGPromptContext(ragResults);

    // 2. Fetch Project Memory Context
    const memory = loadProjectMemory(schemaAST.project.id);
    const memoryContext = buildMemoryPromptContext(memory);

    // 3. Build the combined system prompt (Base + Memory + RAG + Custom Rules)
    const basePrompt = buildSystemPrompt(schemaAST, customRules, dialect);
    const systemPrompt = [basePrompt, memoryContext, ragContext].filter(Boolean).join("\n\n");

    // Convert ChatMessages to provider-compatible format
    const providerMessages: ProviderMessage[] = [
      { role: "system", content: systemPrompt },
    ];

    for (const msg of messages) {
      if (msg.role === "system") continue; // We build our own system prompt

      const providerMsg: ProviderMessage = {
        role: msg.role as ProviderMessage["role"],
        content: msg.content,
      };

      if (msg.toolCalls && msg.toolCalls.length > 0) {
        providerMsg.tool_calls = msg.toolCalls;
      }

      if (msg.toolCallId) {
        providerMsg.tool_call_id = msg.toolCallId;
      }

      providerMessages.push(providerMsg);
    }

    // Determine if this model supports tool calls
    const supportsTools = !model.includes("deepseek-r1");

    // Build the provider request
    const { url, init } = buildRequest({
      provider,
      model,
      apiKey,
      messages: providerMessages,
      tools: supportsTools ? SCHEMA_TOOLS : undefined,
      customEndpoint,
    });

    // Make the upstream request
    const upstreamResponse = await fetch(url, init);

    if (!upstreamResponse.ok) {
      const errorText = await upstreamResponse.text();
      let errorMessage = `Provider returned ${upstreamResponse.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message ?? errorJson.message ?? errorMessage;
      } catch {
        errorMessage = errorText.slice(0, 500) || errorMessage;
      }

      return Response.json(
        { error: errorMessage, statusMessage: errorMessage },
        { status: upstreamResponse.status }
      );
    }

    // Stream the response back to the client
    if (!upstreamResponse.body) {
      return Response.json(
        { error: "No response body from provider", statusMessage: "No response body from provider" },
        { status: 502 }
      );
    }

    // Pass through the SSE stream directly
    return new Response(upstreamResponse.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    captureException(error, { endpoint: "/api/agent/chat", method: "POST" });
    const message = error instanceof Error ? error.message : "Internal server error";
    return Response.json({ error: message, statusMessage: message }, { status: 500 });
  }
}

