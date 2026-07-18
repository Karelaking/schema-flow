"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Bot,
  Send,
  Trash2,
  Settings,
  BookOpen,
  X,
  Loader2,
  Sparkles,
  Zap,
  AlertCircle,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAIStore } from "@/lib/ai-store";
import { useStore } from "@/lib/store";
import type { ChatMessage } from "@/lib/ai/types";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ProviderSettingsModal } from "./ProviderSettingsModal";
import { CustomRulesModal } from "./CustomRulesModal";
import { DiffPreviewCard } from "./DiffPreviewCard";

// ---------------------------------------------------------------------------
// Quick Action Chips
// ---------------------------------------------------------------------------

const QUICK_ACTIONS = [
  { label: "Audit Schema", prompt: "Analyze the current schema for design issues, missing indexes, and normalization violations." },
  { label: "Add Auth Tables", prompt: "Add authentication tables (users, sessions, roles, permissions) with proper relations." },
  { label: "Check Biasness", prompt: "Check the schema for single-tenant bias, missing audit trails, and domain logic issues." },
  { label: "Optimize Indexes", prompt: "Review and suggest optimal indexes for query performance on the current schema." },
];

// ---------------------------------------------------------------------------
// Message Bubble Component
// ---------------------------------------------------------------------------

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const isTool = message.role === "tool";

  if (isTool) {
    return (
      <div className="flex items-start gap-2 px-3 py-1.5">
        <div className="size-5 rounded bg-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
          <Wrench className="size-3 text-amber-600" />
        </div>
        <div className="text-[11px] text-muted-foreground font-mono bg-muted/50 rounded-md px-2 py-1 max-w-full overflow-x-auto">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex gap-2 px-3 py-2", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div
        className={cn(
          "size-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
          isUser ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
        )}
      >
        {isUser ? (
          <span className="text-[10px] font-bold">U</span>
        ) : (
          <Bot className="size-3.5" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          "rounded-xl px-3 py-2 max-w-[85%] text-xs leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-muted/50 text-foreground rounded-tl-sm"
        )}
      >
        {/* Tool call indicators */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {message.toolCalls.map((tc) => (
              <span
                key={tc.id}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[9px] font-mono font-medium"
              >
                <Wrench className="size-2.5" />
                {tc.function.name}
              </span>
            ))}
          </div>
        )}

        {/* Text content with basic markdown rendering */}
        <div className="whitespace-pre-wrap break-words">
          {renderMarkdown(message.content)}
        </div>
      </div>
    </div>
  );
}

/** Basic markdown renderer for chat messages */
function renderMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  // Split by code blocks
  const parts = text.split(/(```[\s\S]*?```)/g);

  return parts.map((part, i) => {
    // Code blocks
    if (part.startsWith("```") && part.endsWith("```")) {
      const content = part.slice(3, -3);
      const firstNewline = content.indexOf("\n");
      const code = firstNewline > -1 ? content.slice(firstNewline + 1) : content;
      return (
        <pre key={i} className="bg-background/60 rounded-md p-2 my-1.5 overflow-x-auto text-[10px] font-mono border">
          <code>{code}</code>
        </pre>
      );
    }

    // Inline formatting
    return (
      <span key={i}>
        {part.split(/(\*\*[^*]+\*\*)/g).map((segment, j) => {
          if (segment.startsWith("**") && segment.endsWith("**")) {
            return <strong key={j}>{segment.slice(2, -2)}</strong>;
          }
          return segment.split(/(`[^`]+`)/g).map((inline, k) => {
            if (inline.startsWith("`") && inline.endsWith("`")) {
              return (
                <code key={k} className="px-1 py-0.5 bg-muted rounded text-[10px] font-mono">
                  {inline.slice(1, -1)}
                </code>
              );
            }
            return inline;
          });
        })}
      </span>
    );
  });
}

// ---------------------------------------------------------------------------
// AgentChatDrawer Component
// ---------------------------------------------------------------------------

export interface AgentChatDrawerProps {
  className?: string;
  style?: React.CSSProperties;
}

export function AgentChatDrawer({ className, style }: AgentChatDrawerProps) {
  const isOpen = useAIStore((s) => s.isOpen);
  const messages = useAIStore((s) => s.messages);
  const isGenerating = useAIStore((s) => s.isGenerating);
  const error = useAIStore((s) => s.error);
  const model = useAIStore((s) => s.model);
  const provider = useAIStore((s) => s.provider);
  const apiKeys = useAIStore((s) => s.apiKeys);
  const availableModels = useAIStore((s) => s.availableModels);
  const pendingPatch = useAIStore((s) => s.pendingPatch);
  const sendMessage = useAIStore((s) => s.sendMessage);
  const clearChat = useAIStore((s) => s.clearChat);
  const clearError = useAIStore((s) => s.clearError);
  const hydrate = useAIStore((s) => s.hydrate);

  // Get current schema from live store
  const projectId = useStore((s) => s.projectId);
  const projectName = useStore((s) => s.projectName);
  const projectDescription = useStore((s) => s.projectDescription);
  const dialect = useStore((s) => s.dialect);
  const theme = useStore((s) => s.theme);
  const autoAddId = useStore((s) => s.autoAddId);
  const autoAddTimestamps = useStore((s) => s.autoAddTimestamps);
  const tables = useStore((s) => s.tables);
  const relations = useStore((s) => s.relations);

  const [input, setInput] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Hydrate AI store from localStorage on mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pendingPatch]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  if (!isOpen) return null;

  const currentModelPreset = availableModels.find((m) => m.id === model);

  const buildSchemaAST = () => ({
    project: {
      id: projectId ?? "",
      name: projectName,
      description: projectDescription,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    settings: { dialect, theme, autoAddId, autoAddTimestamps },
    tables,
    relations,
  });

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isGenerating) return;
    setInput("");
    sendMessage(trimmed, buildSchemaAST());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (prompt: string) => {
    if (isGenerating) return;
    sendMessage(prompt, buildSchemaAST());
  };

  return (
    <>
      <div
        className={cn(
          "h-full flex flex-col bg-card border-l overflow-hidden",
          className
        )}
        style={style}
      >
        {/* ---- Header ---- */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b bg-card shrink-0">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <Sparkles className="size-3.5 text-white" />
            </div>
            <div>
              <h3 className="text-xs font-bold">Schema Architect</h3>
              <div className="flex items-center gap-1">
                {currentModelPreset?.isFree ? (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 font-semibold flex items-center gap-0.5">
                    <Zap className="size-2" />
                    FREE
                  </span>
                ) : (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 font-semibold">
                    PRO
                  </span>
                )}
                <span className="text-[9px] text-muted-foreground truncate max-w-24">
                  {currentModelPreset?.name ?? model}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-0.5">
            <TooltipProvider delay={300}>
              <Tooltip>
                <TooltipTrigger render={
                  <button
                    onClick={() => setRulesOpen(true)}
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <BookOpen className="size-3.5" />
                  </button>
                } />
                <TooltipContent side="bottom"><p className="text-xs">Custom Rules</p></TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger render={
                  <button
                    onClick={() => setSettingsOpen(true)}
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <Settings className="size-3.5" />
                  </button>
                } />
                <TooltipContent side="bottom"><p className="text-xs">AI Settings</p></TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger render={
                  <button
                    onClick={clearChat}
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    disabled={messages.length === 0}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                } />
                <TooltipContent side="bottom"><p className="text-xs">Clear Chat</p></TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger render={
                  <button
                    onClick={() => useAIStore.getState().setOpen(false)}
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <X className="size-3.5" />
                  </button>
                } />
                <TooltipContent side="bottom"><p className="text-xs">Close</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* ---- Messages ---- */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {messages.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-full px-4 py-8">
              <div className="size-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-600/20 flex items-center justify-center mb-4">
                <Bot className="size-7 text-primary opacity-60" />
              </div>
              <h4 className="text-sm font-semibold mb-1">Schema Architect</h4>
              <p className="text-[11px] text-muted-foreground text-center max-w-52 mb-3 leading-relaxed">
                I can help you design, modify, and optimize your database schema. Try a quick action below.
              </p>

              {/* API Key Reminder */}
              {!apiKeys[provider] && (
                <button
                  onClick={() => setSettingsOpen(true)}
                  className="text-[10px] text-center text-amber-600 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 mb-4 max-w-56 cursor-pointer hover:bg-amber-500/15 transition-colors"
                >
                  ⚙️ Add your <strong>OpenRouter API key</strong> in Settings to get started.
                  <span className="block text-muted-foreground mt-0.5">Free keys available at openrouter.ai/keys</span>
                </button>
              )}

              {/* Quick Actions */}
              <div className="flex flex-col gap-1.5 w-full max-w-56">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action.prompt)}
                    disabled={isGenerating}
                    className="text-[11px] text-left px-3 py-2 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span className="font-medium">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <div className="py-2">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}

              {/* Streaming indicator */}
              {isGenerating && (
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="size-6 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Loader2 className="size-3.5 text-primary animate-spin" />
                  </div>
                  <span className="text-[11px] text-muted-foreground animate-pulse">
                    Thinking...
                  </span>
                </div>
              )}

              {/* Diff Preview Card */}
              {pendingPatch && <DiffPreviewCard />}

              {/* Error Display */}
              {error && (
                <div className="mx-3 my-2 rounded-lg border border-destructive/30 bg-destructive/5 p-2.5 flex items-start gap-2">
                  <AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-destructive font-medium">Error</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{error}</p>
                  </div>
                  <button
                    onClick={clearError}
                    className="p-0.5 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ---- Input Bar ---- */}
        <div className="shrink-0 border-t bg-card p-2.5">
          <div className="flex items-end gap-1.5 bg-muted/50 rounded-xl px-3 py-2 border border-border focus-within:border-primary/30 transition-colors">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask the Schema Architect..."
              rows={1}
              className="flex-1 bg-transparent text-xs resize-none outline-none placeholder:text-muted-foreground min-h-[20px] max-h-[120px] py-0.5"
              disabled={isGenerating}
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || isGenerating}
              className="size-7 rounded-lg shrink-0 cursor-pointer"
            >
              {isGenerating ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Send className="size-3.5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProviderSettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      <CustomRulesModal open={rulesOpen} onOpenChange={setRulesOpen} />
    </>
  );
}
