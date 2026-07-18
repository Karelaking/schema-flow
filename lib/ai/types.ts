// =============================================================================
// AI DB Architect Agent — Type Definitions
// =============================================================================

import type { Table, Relation, Column, Index, IndexColumn, SchemaAST } from "@/packages/schema-core";

// ---------------------------------------------------------------------------
// Provider & Model Types
// ---------------------------------------------------------------------------

/** Supported AI provider identifiers */
export type AIProvider = "openrouter" | "gemini" | "claude" | "openai" | "custom";

/** Live model fetched from OpenRouter /api/v1/models */
export interface LiveModel {
  id: string;
  name: string;
  isFree: boolean;
  contextLength: number;
  promptCost: number;
  completionCost: number;
}

/** Fallback default model ID (used before live fetch completes) */
export const DEFAULT_MODEL_ID = "google/gemini-2.5-flash:free";
export const DEFAULT_PROVIDER: AIProvider = "openrouter";

// ---------------------------------------------------------------------------
// Chat Message Types
// ---------------------------------------------------------------------------

export type ChatRole = "user" | "assistant" | "system" | "tool";

export interface ToolCallFunction {
  name: string;
  arguments: string; // JSON-encoded arguments
}

export interface ToolCall {
  id: string;
  type: "function";
  function: ToolCallFunction;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  toolCalls?: ToolCall[];
  toolCallId?: string; // For tool result messages
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Schema Patch / Diff Types (Sandbox Results)
// ---------------------------------------------------------------------------

export type DiffActionType = "added" | "modified" | "removed";

export interface DiffItem {
  type: DiffActionType;
  entity: "table" | "column" | "relation" | "index";
  tableName?: string;
  columnName?: string;
  relationName?: string;
  indexName?: string;
  details: string;
}

export interface SandboxResult {
  /** The original AST snapshot before changes */
  originalAST: SchemaAST;
  /** The proposed AST after applying all tool calls */
  proposedAST: SchemaAST;
  /** Structured diff summary */
  diffs: DiffItem[];
  /** Tool calls that produced this result */
  appliedToolCalls: ToolCall[];
}

// ---------------------------------------------------------------------------
// Custom Rules
// ---------------------------------------------------------------------------

export interface CustomRule {
  id: string;
  title: string;
  content: string;
  isEnabled: boolean;
  createdAt: number;
}

/** Pre-defined rule presets users can quickly add */
export const RULE_PRESETS: Omit<CustomRule, "id" | "createdAt">[] = [
  {
    title: "UUID Primary Keys",
    content: "Always use UUID (v4) for primary key columns instead of auto-incrementing integers.",
    isEnabled: false,
  },
  {
    title: "Soft Deletes",
    content: "Include a 'deleted_at' TIMESTAMP column on every table for soft delete support.",
    isEnabled: false,
  },
  {
    title: "Snake Case Naming",
    content: "Use snake_case for all table names and column names. Never use camelCase or PascalCase.",
    isEnabled: false,
  },
  {
    title: "Index Foreign Keys",
    content: "Always create an index on every foreign key column for query performance.",
    isEnabled: false,
  },
  {
    title: "Audit Timestamps",
    content: "Every table must have 'created_at' and 'updated_at' TIMESTAMP columns with defaults.",
    isEnabled: false,
  },
  {
    title: "No Nullable Foreign Keys",
    content: "Foreign key columns should never be nullable. Use a junction/bridge table for optional relationships.",
    isEnabled: false,
  },
];

// ---------------------------------------------------------------------------
// Provider Settings
// ---------------------------------------------------------------------------

export interface ProviderConfig {
  provider: AIProvider;
  model: string;
  apiKey: string;
  customEndpoint?: string;
}
