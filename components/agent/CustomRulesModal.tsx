"use client";

import React, { useState } from "react";
import { Plus, Trash2, BookOpen, ToggleLeft, ToggleRight, Pencil, X, Check } from "lucide-react";
import { useAIStore } from "@/lib/ai-store";
import { RULE_PRESETS } from "@/lib/ai/types";
import type { CustomRule } from "@/lib/ai/types";
import { Button } from "@schema-flow/components/ui/button";
import { Input } from "@schema-flow/components/ui/input";
import { Label } from "@schema-flow/components/ui/label";
import { Textarea } from "@schema-flow/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@schema-flow/components/ui/dialog";

/**
 * Props for CustomRulesModal component.
 */
export interface CustomRulesModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * Modal component allowing users to manage custom agent rules and rule presets.
 */
export const CustomRulesModal: React.FC<CustomRulesModalProps> = ({ open, onOpenChange }): React.ReactElement => {
    const customRules = useAIStore(s => s.customRules);
    const addRule = useAIStore(s => s.addRule);
    const updateRule = useAIStore(s => s.updateRule);
    const deleteRule = useAIStore(s => s.deleteRule);
    const toggleRule = useAIStore(s => s.toggleRule);

    const [isAdding, setIsAdding] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");
    const [editingId, setEditingId] = useState<string | undefined>(undefined);
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");

    const handleAddRule = (): void => {
        if (!newTitle.trim() || !newContent.trim()) {
            return;
        }
        addRule(newTitle.trim(), newContent.trim());
        setNewTitle("");
        setNewContent("");
        setIsAdding(false);
    };

    const handleAddPreset = (preset: (typeof RULE_PRESETS)[number]): void => {
        const isDuplicate = customRules.some(
            r => r.title === preset.title && r.content === preset.content
        );
        if (isDuplicate) {
            return;
        }
        addRule(preset.title, preset.content);
    };

    const startEditing = (rule: CustomRule): void => {
        setEditingId(rule.id);
        setEditTitle(rule.title);
        setEditContent(rule.content);
    };

    const saveEdit = (): void => {
        if (!editingId || !editTitle.trim() || !editContent.trim()) {
            return;
        }
        updateRule(editingId, { title: editTitle.trim(), content: editContent.trim() });
        setEditingId(undefined);
    };

    const cancelEdit = (): void => {
        setEditingId(undefined);
    };

    const activeCount = customRules.filter(r => r.isEnabled).length;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-140 max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BookOpen className="size-4" />
                        Custom Design Rules
                    </DialogTitle>
                    <DialogDescription>
                        Define rules the AI agent must follow when designing or modifying your schema.
                        {activeCount > 0 && (
                            <span className="ml-1 text-emerald-600 font-medium">
                                ({activeCount} active)
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto flex flex-col gap-3 py-2 min-h-0">
                    {customRules.length === 0 && !isAdding && (
                        <div className="text-center py-8 text-muted-foreground">
                            <BookOpen className="size-8 mx-auto mb-2 opacity-40" />
                            <p className="text-sm">No custom rules defined yet.</p>
                            <p className="text-xs mt-1">Add rules or pick from presets below.</p>
                        </div>
                    )}

                    {customRules.map(rule => (
                        <div
                            key={rule.id}
                            className={`rounded-lg border p-3 transition-all ${
                                rule.isEnabled
                                    ? "border-emerald-500/30 bg-emerald-500/5"
                                    : "border-border bg-muted/30 opacity-60"
                            }`}
                        >
                            {editingId === rule.id ? (
                                <div className="flex flex-col gap-2">
                                    <Input
                                        value={editTitle}
                                        onChange={e => setEditTitle(e.target.value)}
                                        placeholder="Rule title"
                                        aria-label="Edit rule title"
                                        className="text-xs h-8"
                                    />
                                    <Textarea
                                        value={editContent}
                                        onChange={e => setEditContent(e.target.value)}
                                        placeholder="Rule description..."
                                        aria-label="Edit rule description"
                                        rows={2}
                                        className="text-xs"
                                    />
                                    <div className="flex gap-1.5 justify-end">
                                        <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-7 text-xs gap-1">
                                            <X className="size-3" data-icon="inline-start" /> Cancel
                                        </Button>
                                        <Button size="sm" onClick={saveEdit} className="h-7 text-xs gap-1">
                                            <Check className="size-3" data-icon="inline-start" /> Save
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start gap-2">
                                    <button
                                        onClick={() => toggleRule(rule.id)}
                                        className="mt-0.5 shrink-0 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                                        title={rule.isEnabled ? "Disable rule" : "Enable rule"}
                                    >
                                        {rule.isEnabled ? (
                                            <ToggleRight className="size-5 text-emerald-500" />
                                        ) : (
                                            <ToggleLeft className="size-5" />
                                        )}
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-semibold">{rule.title}</div>
                                        <div className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                                            {rule.content}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-0.5 shrink-0">
                                        <button
                                            onClick={() => startEditing(rule)}
                                            className="p-1 rounded hover:bg-muted cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                                            title="Edit rule"
                                        >
                                            <Pencil className="size-3" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (window.confirm(`Are you sure you want to delete the rule "${rule.title}"?`)) {
                                                    deleteRule(rule.id);
                                                }
                                            }}
                                            className="p-1 rounded hover:bg-destructive/10 cursor-pointer text-muted-foreground hover:text-destructive transition-colors"
                                            title="Delete rule"
                                            aria-label={`Delete rule ${rule.title}`}
                                        >
                                            <Trash2 className="size-3" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {isAdding && (
                        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 flex flex-col gap-2">
                            <Label className="text-xs font-semibold">New Rule</Label>
                            <Input
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                                placeholder="Rule title (e.g., 'UUID Primary Keys')"
                                aria-label="New rule title"
                                className="text-xs h-8"
                                autoFocus
                            />
                            <Textarea
                                value={newContent}
                                onChange={e => setNewContent(e.target.value)}
                                placeholder="Rule description (e.g., 'Always use UUID v4 for primary keys instead of auto-incrementing integers.')"
                                aria-label="New rule description"
                                rows={2}
                                className="text-xs"
                            />
                            <div className="flex gap-1.5 justify-end">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                        setIsAdding(false);
                                        setNewTitle("");
                                        setNewContent("");
                                    }}
                                    className="h-7 text-xs"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleAddRule}
                                    disabled={!newTitle.trim() || !newContent.trim()}
                                    className="h-7 text-xs gap-1"
                                >
                                    <Plus className="size-3" data-icon="inline-start" /> Add Rule
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="border-t pt-3 mt-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Quick Presets
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {RULE_PRESETS.map(preset => {
                                const isAlreadyAdded = customRules.some(
                                    r => r.title === preset.title && r.content === preset.content
                                );
                                return (
                                    <button
                                        key={preset.title}
                                        type="button"
                                        onClick={() => handleAddPreset(preset)}
                                        disabled={isAlreadyAdded}
                                        className={`text-[10px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                                            isAlreadyAdded
                                                ? "bg-muted text-muted-foreground border-border opacity-50 cursor-not-allowed"
                                                : "bg-card hover:bg-primary/10 hover:border-primary/30 text-foreground border-border"
                                        }`}
                                        title={preset.content}
                                    >
                                        {isAlreadyAdded ? "✓ " : "+ "}
                                        {preset.title}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <DialogFooter className="mt-2">
                    {!isAdding && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsAdding(true)}
                            className="gap-1 mr-auto"
                        >
                            <Plus className="size-3.5" data-icon="inline-start" />
                            Add Custom Rule
                        </Button>
                    )}
                    <Button onClick={() => onOpenChange(false)}>Done</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
