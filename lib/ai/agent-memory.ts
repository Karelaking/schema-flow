// =============================================================================
// AI DB Architect Agent — Memory Engine (Per-Project Persistence)
// =============================================================================
//
// Manages long-term conversation history and architectural decision logs per
// project. Restores past memory when switching projects in the workspace.
// =============================================================================

import type { ChatMessage } from "./types";
import type { SchemaAST } from "@/packages/schema-core";

// ---------------------------------------------------------------------------
// Memory Interfaces
// ---------------------------------------------------------------------------

export interface ArchitecturalDecision {
  id: string;
  timestamp: number;
  summary: string;
  category: "table" | "column" | "relation" | "convention" | "pattern";
}

export interface ProjectMemory {
  projectId: string;
  messages: ChatMessage[];
  decisions: ArchitecturalDecision[];
  lastUpdated: number;
}

const MEMORY_PREFIX = "schema-flow:ai-memory:";

// ---------------------------------------------------------------------------
// Memory Persistence Functions
// ---------------------------------------------------------------------------

/** Loads the persistent memory for a given project ID */
export function loadProjectMemory(projectId: string): ProjectMemory {
  if (typeof window === "undefined" || !projectId) {
    return createEmptyMemory(projectId);
  }

  try {
    const raw = localStorage.getItem(`${MEMORY_PREFIX}${projectId}`);
    if (!raw) return createEmptyMemory(projectId);
    const memory = JSON.parse(raw) as ProjectMemory;
    return memory;
  } catch {
    return createEmptyMemory(projectId);
  }
}

/** Saves the conversation messages and extracts architectural decisions for a project */
export function saveProjectMemory(
  projectId: string,
  messages: ChatMessage[],
  schemaAST?: SchemaAST
): void {
  if (typeof window === "undefined" || !projectId) return;

  try {
    const existing = loadProjectMemory(projectId);
    const newDecisions = extractDecisions(messages, schemaAST, existing.decisions);

    const memory: ProjectMemory = {
      projectId,
      messages: messages.slice(-50), // Retain last 50 messages to keep storage light
      decisions: newDecisions.slice(-20), // Retain top 20 decision highlights
      lastUpdated: Date.now(),
    };

    localStorage.setItem(`${MEMORY_PREFIX}${projectId}`, JSON.stringify(memory));
  } catch {
    // Handle quota exceeded gracefully
  }
}

/** Clears all memory for a specific project */
export function clearProjectMemory(projectId: string): void {
  if (typeof window === "undefined" || !projectId) return;
  try {
    localStorage.removeItem(`${MEMORY_PREFIX}${projectId}`);
  } catch {
    // Ignore storage errors
  }
}

/** Formats past memory into system prompt context */
export function buildMemoryPromptContext(memory: ProjectMemory): string {
  if (!memory || (memory.messages.length === 0 && memory.decisions.length === 0)) {
    return "";
  }

  const lines: string[] = ["\n## Long-Term Project Memory & Decision History"];

  if (memory.decisions.length > 0) {
    lines.push("### Key Architectural Decisions Made So Far:");
    memory.decisions.forEach((d) => {
      lines.push(`- **[${d.category.toUpperCase()}]** ${d.summary}`);
    });
  }

  // Include recent user requests to help the AI recall user intent across sessions
  const userMessages = memory.messages.filter((m) => m.role === "user");
  if (userMessages.length > 0) {
    lines.push("\n### Past User Requests in this Project:");
    userMessages.slice(-5).forEach((m) => {
      lines.push(`- "${m.content}"`);
    });
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createEmptyMemory(projectId: string): ProjectMemory {
  return {
    projectId,
    messages: [],
    decisions: [],
    lastUpdated: Date.now(),
  };
}

/** Analyzes tool call history and schema state to log key decisions */
function extractDecisions(
  messages: ChatMessage[],
  schemaAST?: SchemaAST,
  existingDecisions: ArchitecturalDecision[] = []
): ArchitecturalDecision[] {
  const decisions = [...existingDecisions];
  const existingSummaries = new Set(decisions.map((d) => d.summary.toLowerCase()));

  // Extract from tool calls in messages
  for (const msg of messages) {
    if (!msg.toolCalls) continue;
    for (const tc of msg.toolCalls) {
      const fn = tc.function.name;
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(tc.function.arguments);
      } catch {
        continue;
      }

      let summary = "";
      let category: ArchitecturalDecision["category"] = "pattern";

      if (fn === "create_table" && args.name) {
        summary = `Created table '${args.name}'`;
        category = "table";
      } else if (fn === "add_relation" && args.sourceTableId && args.targetTableId) {
        summary = `Established ${args.type ?? "foreign key"} relation from '${args.sourceTableId}' to '${args.targetTableId}'`;
        category = "relation";
      } else if (fn === "add_index" && args.name && args.tableId) {
        summary = `Added ${args.isUnique ? "UNIQUE " : ""}index '${args.name}' on '${args.tableId}'`;
        category = "column";
      }

      if (summary && !existingSummaries.has(summary.toLowerCase())) {
        existingSummaries.add(summary.toLowerCase());
        decisions.push({
          id: `dec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: Date.now(),
          summary,
          category,
        });
      }
    }
  }

  // Also extract from current SchemaAST if available
  if (schemaAST) {
    const tableCount = Object.keys(schemaAST.tables).length;
    const relCount = Object.keys(schemaAST.relations).length;
    const summary = `Current project scope: ${tableCount} tables, ${relCount} relationships (${schemaAST.settings?.dialect ?? "sqlite"} dialect)`;

    if (!existingSummaries.has(summary.toLowerCase())) {
      decisions.push({
        id: `dec-scope-${Date.now()}`,
        timestamp: Date.now(),
        summary,
        category: "convention",
      });
    }
  }

  return decisions;
}
