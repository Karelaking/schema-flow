"use client";

import React, { useState, useEffect } from "react";
import { Settings, Eye, EyeOff, CheckCircle2, Zap, Crown, Loader2, RefreshCw, Search } from "lucide-react";
import { useAIStore } from "@/lib/ai-store";
import type { AIProvider, LiveModel } from "@/lib/ai/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ---------------------------------------------------------------------------
// Provider Metadata
// ---------------------------------------------------------------------------

const PROVIDER_OPTIONS: Array<{ value: AIProvider; label: string; description: string }> = [
  { value: "openrouter", label: "OpenRouter", description: "Multi-model gateway — free & paid models" },
  { value: "gemini", label: "Google Gemini", description: "Google AI Studio" },
  { value: "claude", label: "Anthropic Claude", description: "Claude API" },
  { value: "openai", label: "OpenAI", description: "GPT models" },
  { value: "custom", label: "Custom Endpoint", description: "OpenAI-compatible API" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface ProviderSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProviderSettingsModal({ open, onOpenChange }: ProviderSettingsModalProps) {
  const provider = useAIStore((s) => s.provider);
  const model = useAIStore((s) => s.model);
  const apiKeys = useAIStore((s) => s.apiKeys);
  const customEndpoint = useAIStore((s) => s.customEndpoint);
  const availableModels = useAIStore((s) => s.availableModels);
  const isLoadingModels = useAIStore((s) => s.isLoadingModels);
  const setProvider = useAIStore((s) => s.setProvider);
  const setModel = useAIStore((s) => s.setModel);
  const setApiKey = useAIStore((s) => s.setApiKey);
  const setCustomEndpoint = useAIStore((s) => s.setCustomEndpoint);
  const fetchModels = useAIStore((s) => s.fetchModels);

  const [localKey, setLocalKey] = useState("");
  const [localEndpoint, setLocalEndpoint] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [modelSearch, setModelSearch] = useState("");

  // Sync local state when modal opens
  useEffect(() => {
    if (open) {
      setLocalKey(apiKeys[provider] ?? "");
      setLocalEndpoint(customEndpoint);
      setShowKey(false);
      setModelSearch("");
    }
  }, [open, provider, apiKeys, customEndpoint]);

  const handleSaveKey = () => {
    if (localKey.trim()) {
      setApiKey(provider, localKey.trim());
      // Fetch models after saving key
      setTimeout(() => {
        useAIStore.getState().fetchModels();
      }, 100);
    }
    if (provider === "custom" && localEndpoint.trim()) {
      setCustomEndpoint(localEndpoint.trim());
    }
  };

  const handleSave = () => {
    handleSaveKey();
    onOpenChange(false);
  };

  // Filter models by search term
  const freeModels = availableModels.filter(
    (m) => m.isFree && m.name.toLowerCase().includes(modelSearch.toLowerCase())
  );
  const premiumModels = availableModels.filter(
    (m) => !m.isFree && m.name.toLowerCase().includes(modelSearch.toLowerCase())
  );

  const currentModel = availableModels.find((m) => m.id === model);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="size-4" />
            AI Provider Settings
          </DialogTitle>
          <DialogDescription>
            Configure your AI provider, API key, and model.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto flex flex-col gap-4 py-2 min-h-0">
          {/* Provider Selection */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="ai-provider-select">Provider</Label>
            <Select
              value={provider}
              onValueChange={(val: AIProvider | null) => {
                if (!val) return;
                setProvider(val);
                setLocalKey(apiKeys[val] ?? "");
              }}
            >
              <SelectTrigger id="ai-provider-select">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {PROVIDER_OPTIONS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-[10px] text-muted-foreground">
              {PROVIDER_OPTIONS.find((p) => p.value === provider)?.description}
            </span>
          </div>

          {/* API Key Input */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="ai-api-key">API Key</Label>
            <div className="flex gap-1.5">
              <div className="relative flex-1">
                <Input
                  id="ai-api-key"
                  type={showKey ? "text" : "password"}
                  value={localKey}
                  onChange={(e) => setLocalKey(e.target.value)}
                  placeholder="Enter your API key"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveKey}
                disabled={!localKey.trim()}
                className="h-9 text-xs gap-1 cursor-pointer shrink-0"
              >
                <RefreshCw className={`size-3 ${isLoadingModels ? "animate-spin" : ""}`} />
                Load Models
              </Button>
            </div>
            <span className="text-[10px] text-muted-foreground">
              Keys are stored locally in your browser.
              {provider === "openrouter" && (
                <> Get a free key at <strong>openrouter.ai/keys</strong></>
              )}
            </span>
          </div>

          {/* Custom Endpoint (only for custom provider) */}
          {provider === "custom" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="ai-custom-endpoint">Custom Endpoint URL</Label>
              <Input
                id="ai-custom-endpoint"
                type="url"
                value={localEndpoint}
                onChange={(e) => setLocalEndpoint(e.target.value)}
                placeholder="https://localhost:11434/v1"
              />
              <span className="text-[10px] text-muted-foreground">
                Must be an OpenAI-compatible API endpoint (e.g., Ollama, LM Studio, vLLM).
              </span>
            </div>
          )}

          {/* Model Selection — Live Models */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>Model</Label>
              {isLoadingModels && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Loader2 className="size-3 animate-spin" />
                  Loading models...
                </span>
              )}
            </div>

            {availableModels.length === 0 && !isLoadingModels ? (
              <div className="text-center py-4 text-muted-foreground border rounded-lg bg-muted/30">
                <p className="text-xs">No models loaded yet.</p>
                <p className="text-[10px] mt-0.5">Enter your API key and click <strong>Load Models</strong></p>
              </div>
            ) : availableModels.length > 0 ? (
              <>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search models..."
                    value={modelSearch}
                    onChange={(e) => setModelSearch(e.target.value)}
                    className="pl-8 h-8 text-xs"
                  />
                </div>

                {/* Model List */}
                <div className="max-h-56 overflow-y-auto rounded-lg border bg-card">
                  {/* Free Models */}
                  {freeModels.length > 0 && (
                    <>
                      <div className="px-2.5 py-1.5 bg-emerald-500/5 border-b sticky top-0 z-10">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                          <Zap className="size-3" />
                          Free Models ({freeModels.length})
                        </span>
                      </div>
                      {freeModels.map((m) => (
                        <ModelRow
                          key={m.id}
                          model={m}
                          isSelected={model === m.id}
                          onSelect={() => setModel(m.id)}
                        />
                      ))}
                    </>
                  )}

                  {/* Premium Models */}
                  {premiumModels.length > 0 && (
                    <>
                      <div className="px-2.5 py-1.5 bg-amber-500/5 border-b border-t sticky top-0 z-10">
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
                          <Crown className="size-3" />
                          Premium Models ({premiumModels.length})
                        </span>
                      </div>
                      {premiumModels.map((m) => (
                        <ModelRow
                          key={m.id}
                          model={m}
                          isSelected={model === m.id}
                          onSelect={() => setModel(m.id)}
                        />
                      ))}
                    </>
                  )}

                  {freeModels.length === 0 && premiumModels.length === 0 && (
                    <div className="py-4 text-center text-xs text-muted-foreground">
                      No models match &quot;{modelSearch}&quot;
                    </div>
                  )}
                </div>

                {/* Selected Model Info */}
                {currentModel && (
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="size-3 text-emerald-500 shrink-0" />
                    <span className="truncate">
                      <strong>{currentModel.name}</strong>
                      {" · "}
                      {currentModel.isFree ? "Free" : `$${currentModel.promptCost.toFixed(6)}/token`}
                      {" · "}
                      {(currentModel.contextLength / 1000).toFixed(0)}K context
                    </span>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// ModelRow — Single model in the list
// ---------------------------------------------------------------------------

function ModelRow({
  model,
  isSelected,
  onSelect,
}: {
  model: LiveModel;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-left transition-colors cursor-pointer border-b border-border/50 last:border-b-0 ${
        isSelected
          ? "bg-primary/10 text-foreground"
          : "hover:bg-muted/50 text-foreground/80"
      }`}
    >
      <div className={`size-3 rounded-full border-2 shrink-0 ${
        isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
      }`} />
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-medium truncate">{model.name}</div>
        <div className="text-[9px] text-muted-foreground flex items-center gap-1.5">
          <span>{model.id}</span>
          <span>·</span>
          <span>{(model.contextLength / 1000).toFixed(0)}K ctx</span>
        </div>
      </div>
      {model.isFree ? (
        <span className="text-[8px] bg-emerald-500/15 text-emerald-600 px-1.5 py-0.5 rounded-full font-bold shrink-0">
          FREE
        </span>
      ) : (
        <span className="text-[8px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full font-medium shrink-0">
          ${model.promptCost.toFixed(4)}
        </span>
      )}
    </button>
  );
}
