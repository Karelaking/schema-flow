// =============================================================================
// AI DB Architect Agent — Zustand Store
// =============================================================================
//
// Manages chat state, AI provider configuration, custom rules,
// sandbox preview state, and streaming control.
// All API keys and rules are persisted in localStorage (client-only).
// =============================================================================

import { create } from "zustand";
import type {
  AIProvider,
  ChatMessage,
  CustomRule,
  SandboxResult,
  ToolCall,
  LiveModel,
} from "./ai/types";
import {
  DEFAULT_MODEL_ID,
  DEFAULT_PROVIDER,
} from "./ai/types";
import { parseOpenAIStream } from "./ai/provider-client";
import { runInSandbox, getToolResultMessages } from "./ai/sandbox";
import { loadProjectMemory, saveProjectMemory, clearProjectMemory } from "./ai/agent-memory";
import { runAutonomousOrchestration, type OrchestratorPhase } from "./ai/orchestrator";
import type { SchemaAuditReport } from "./ai/evaluator";
import type { SchemaAST } from "@/packages/schema-core";
import { useStore } from "./store";

// ---------------------------------------------------------------------------
// LocalStorage Keys
// ---------------------------------------------------------------------------

const LS_KEYS = {
  apiKeys: "schema-flow:ai-keys",
  rules: "schema-flow:ai-rules",
  provider: "schema-flow:ai-provider",
  model: "schema-flow:ai-model",
  customEndpoint: "schema-flow:ai-custom-endpoint",
  goalMode: "schema-flow:ai-goal-mode",
} as const;

// ---------------------------------------------------------------------------
// Store Interface
// ---------------------------------------------------------------------------

export interface AIStore {
  // Chat state
  isOpen: boolean;
  messages: ChatMessage[];
  isGenerating: boolean;
  error: string | null;

  // Provider config
  provider: AIProvider;
  model: string;
  apiKeys: Record<string, string>;
  customEndpoint: string;

  // Autonomous Goal Mode & Orchestrator State
  isGoalMode: boolean;
  currentPhase: OrchestratorPhase | null;
  auditReport: SchemaAuditReport | null;

  // Live models from OpenRouter
  availableModels: LiveModel[];
  isLoadingModels: boolean;

  // Custom rules
  customRules: CustomRule[];

  // Sandbox preview
  pendingPatch: SandboxResult | null;

  // Active Project Memory Context
  activeProjectId: string | null;

  // Actions — UI
  toggleDrawer: () => void;
  setOpen: (open: boolean) => void;
  clearChat: () => void;
  clearError: () => void;
  toggleGoalMode: () => void;

  // Actions — Memory
  loadProjectMemoryForCurrentProject: (projectId: string) => void;
  clearProjectMemoryForCurrentProject: () => void;

  // Actions — Provider
  setProvider: (provider: AIProvider) => void;
  setModel: (model: string) => void;
  setApiKey: (provider: string, key: string) => void;
  getApiKey: (provider: string) => string;
  setCustomEndpoint: (endpoint: string) => void;
  fetchModels: () => Promise<void>;

  // Actions — Custom Rules
  addRule: (title: string, content: string) => void;
  updateRule: (id: string, updates: Partial<Pick<CustomRule, "title" | "content" | "isEnabled">>) => void;
  deleteRule: (id: string) => void;
  toggleRule: (id: string) => void;

  // Actions — Chat
  sendMessage: (content: string, schemaAST: SchemaAST) => Promise<void>;

  // Actions — Sandbox
  approvePatch: () => void;
  rejectPatch: () => void;

  // Hydrate from localStorage
  hydrate: () => void;
}

// ---------------------------------------------------------------------------
// Helper — Generate unique IDs
// ---------------------------------------------------------------------------

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

// ---------------------------------------------------------------------------
// LocalStorage Helpers
// ---------------------------------------------------------------------------

function loadFromLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToLS(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage might be full or unavailable
  }
}

// ---------------------------------------------------------------------------
// Store Implementation
// ---------------------------------------------------------------------------

export const useAIStore = create<AIStore>((set, get) => ({
  // Initial state
  isOpen: false,
  messages: [],
  isGenerating: false,
  error: null,

  provider: DEFAULT_PROVIDER,
  model: DEFAULT_MODEL_ID,
  apiKeys: {},
  customEndpoint: "",

  isGoalMode: false,
  currentPhase: null,
  auditReport: null,

  availableModels: [],
  isLoadingModels: false,

  customRules: [],
  pendingPatch: null,
  activeProjectId: null,

  // ---- UI Actions ----

  toggleDrawer: () => set((s) => ({ isOpen: !s.isOpen })),
  setOpen: (open) => set({ isOpen: open }),

  toggleGoalMode: () => {
    const next = !get().isGoalMode;
    set({ isGoalMode: next });
    saveToLS(LS_KEYS.goalMode, next);
  },

  clearChat: () => {
    const { activeProjectId } = get();
    if (activeProjectId) {
      clearProjectMemory(activeProjectId);
    }
    set({ messages: [], pendingPatch: null, error: null, currentPhase: null, auditReport: null });
  },

  clearError: () => set({ error: null }),

  // ---- Memory Actions ----

  loadProjectMemoryForCurrentProject: (projectId: string) => {
    if (!projectId) return;
    const memory = loadProjectMemory(projectId);
    set({
      activeProjectId: projectId,
      messages: memory.messages,
      pendingPatch: null,
      error: null,
    });
  },

  clearProjectMemoryForCurrentProject: () => {
    const { activeProjectId } = get();
    if (activeProjectId) {
      clearProjectMemory(activeProjectId);
      set({ messages: [], pendingPatch: null, error: null, auditReport: null });
    }
  },

  // ---- Provider Actions ----

  setProvider: (provider) => {
    set({ provider });
    saveToLS(LS_KEYS.provider, provider);
  },

  setModel: (model) => {
    set({ model });
    saveToLS(LS_KEYS.model, model);
  },

  setApiKey: (provider, key) => {
    const keys = { ...get().apiKeys, [provider]: key };
    set({ apiKeys: keys });
    saveToLS(LS_KEYS.apiKeys, keys);
  },

  getApiKey: (provider) => get().apiKeys[provider] ?? "",

  fetchModels: async () => {
    const { apiKeys, provider } = get();
    const apiKey = apiKeys[provider] ?? "";
    if (!apiKey) return;

    set({ isLoadingModels: true });
    try {
      const res = await fetch("/api/agent/models", {
        headers: { "x-api-key": apiKey },
      });
      if (!res.ok) throw new Error("Failed to fetch models");
      const data = await res.json();
      const models: LiveModel[] = data.models ?? [];
      set({ availableModels: models, isLoadingModels: false });

      // Auto-select first free model if current model not in the list
      const currentModel = get().model;
      const modelExists = models.some((m) => m.id === currentModel);
      if (!modelExists && models.length > 0) {
        const firstFree = models.find((m) => m.isFree);
        const fallback = firstFree?.id ?? models[0].id;
        set({ model: fallback });
        saveToLS(LS_KEYS.model, fallback);
      }
    } catch {
      set({ isLoadingModels: false });
    }
  },

  setCustomEndpoint: (endpoint) => {
    set({ customEndpoint: endpoint });
    saveToLS(LS_KEYS.customEndpoint, endpoint);
  },

  // ---- Custom Rules Actions ----

  addRule: (title, content) => {
    const rule: CustomRule = {
      id: uid(),
      title,
      content,
      isEnabled: true,
      createdAt: Date.now(),
    };
    const rules = [...get().customRules, rule];
    set({ customRules: rules });
    saveToLS(LS_KEYS.rules, rules);
  },

  updateRule: (id, updates) => {
    const rules = get().customRules.map((r) =>
      r.id === id ? { ...r, ...updates } : r
    );
    set({ customRules: rules });
    saveToLS(LS_KEYS.rules, rules);
  },

  deleteRule: (id) => {
    const rules = get().customRules.filter((r) => r.id !== id);
    set({ customRules: rules });
    saveToLS(LS_KEYS.rules, rules);
  },

  toggleRule: (id) => {
    const rules = get().customRules.map((r) =>
      r.id === id ? { ...r, isEnabled: !r.isEnabled } : r
    );
    set({ customRules: rules });
    saveToLS(LS_KEYS.rules, rules);
  },

  // ---- Chat Action ----

  sendMessage: async (content, schemaAST) => {
    const { provider, model, apiKeys, customEndpoint, customRules, messages, isGoalMode } = get();

    // Create user message
    const userMessage: ChatMessage = {
      id: uid(),
      role: "user",
      content,
      timestamp: Date.now(),
    };

    // Create assistant placeholder message for live token streaming
    const assistantPlaceholderId = uid();
    const assistantPlaceholder: ChatMessage = {
      id: assistantPlaceholderId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage, assistantPlaceholder];
    set({
      messages: updatedMessages,
      isGenerating: true,
      error: null,
      pendingPatch: null,
      currentPhase: null,
      auditReport: null,
    });

    let liveText = "";

    try {
      const apiKey = apiKeys[provider] ?? "";
      const isFreeModel = model.endsWith(":free");
      if (!apiKey && !isFreeModel) {
        throw new Error("API key required. Please configure your key in AI Settings (⚙️ icon).");
      }

      // Run Autonomous Multi-Step Orchestration Engine
      const result = await runAutonomousOrchestration({
        prompt: content,
        schemaAST,
        messages: updatedMessages.slice(0, -1),
        customRules,
        provider,
        model,
        apiKey,
        customEndpoint,
        isGoalMode,
        onPhaseUpdate: (phase) => {
          set({ currentPhase: phase });
        },
        onTextChunk: (chunk) => {
          liveText += chunk;
          set((s) => ({
            messages: s.messages.map((m) =>
              m.id === assistantPlaceholderId ? { ...m, content: liveText } : m
            ),
          }));
        },
      });

      // Update the assistant placeholder message in place with full response text and tool call badges
      const finalMessages = get().messages.map((m) =>
        m.id === assistantPlaceholderId
          ? {
              ...m,
              content: result.assistantResponse,
              toolCalls: result.sandboxResult ? result.sandboxResult.diffs.map((d, i) => ({
                id: `tc-${i}`,
                type: "function" as const,
                function: { name: d.type, arguments: "{}" },
              })) : undefined,
            }
          : m
      );

      // If tool calls produced a sandbox result, attach patch and audit report
      if (result.sandboxResult) {
        set({
          messages: finalMessages,
          pendingPatch: result.sandboxResult,
          auditReport: result.auditReport,
          isGenerating: false,
        });
      } else {
        set({
          messages: finalMessages,
          auditReport: result.auditReport,
          isGenerating: false,
        });
      }

      // Save project memory
      if (schemaAST.project?.id) {
        saveProjectMemory(schemaAST.project.id, finalMessages, result.sandboxResult?.proposedAST);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      set({
        error: errorMessage,
        isGenerating: false,
        currentPhase: null,
      });
    }
  },

  // ---- Sandbox Actions ----

  approvePatch: () => {
    const { pendingPatch } = get();
    if (!pendingPatch) return;

    // Apply the proposed AST to the live Zustand store
    const projectStore = useStore.getState();
    projectStore.pushHistory(); // Push undo point before applying changes

    const proposed = pendingPatch.proposedAST;

    // Batch-apply the proposed tables and relations to the live store
    useStore.setState({
      tables: proposed.tables,
      relations: proposed.relations,
    });

    // Add an approval confirmation message
    const approvalMsg: ChatMessage = {
      id: uid(),
      role: "assistant",
      content: `✅ **Changes applied successfully!** ${pendingPatch.diffs.length} change(s) committed to the canvas. You can undo with Ctrl+Z.`,
      timestamp: Date.now(),
    };

    const finalMessages = [...get().messages, approvalMsg];
    set({
      messages: finalMessages,
      pendingPatch: null,
    });

    // Save project memory
    if (proposed.project?.id) {
      saveProjectMemory(proposed.project.id, finalMessages, proposed);
    }
  },

  rejectPatch: () => {
    const rejectionMsg: ChatMessage = {
      id: uid(),
      role: "assistant",
      content: "❌ **Changes rejected.** No modifications were applied to the canvas. Feel free to ask me to revise the approach.",
      timestamp: Date.now(),
    };

    const finalMessages = [...get().messages, rejectionMsg];
    set({
      messages: finalMessages,
      pendingPatch: null,
    });

    const { activeProjectId } = get();
    if (activeProjectId) {
      saveProjectMemory(activeProjectId, finalMessages);
    }
  },

  // ---- Hydrate from localStorage ----

  hydrate: () => {
    set({
      apiKeys: loadFromLS(LS_KEYS.apiKeys, {}),
      customRules: loadFromLS(LS_KEYS.rules, []),
      provider: loadFromLS(LS_KEYS.provider, DEFAULT_PROVIDER),
      model: loadFromLS(LS_KEYS.model, DEFAULT_MODEL_ID),
      customEndpoint: loadFromLS(LS_KEYS.customEndpoint, ""),
      isGoalMode: loadFromLS(LS_KEYS.goalMode, true),
    });

    // Auto-fetch models if API key is available
    const apiKey = get().apiKeys[get().provider];
    if (apiKey) {
      get().fetchModels();
    }
  },
}));
