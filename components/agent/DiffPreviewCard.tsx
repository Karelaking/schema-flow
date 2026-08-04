"use client";

import React from "react";
import { Check, X, RotateCcw, Plus, Minus, Pencil, Table2, Columns3, Link2, Hash } from "lucide-react";
import { useAIStore } from "@/lib/ai-store";
import type { DiffItem } from "@/lib/ai/types";
import { Button } from "@schema-flow/components/ui/button";

/**
 * Returns icon representation for a diff item entity.
 */
function getDiffIcon(item: DiffItem): React.ReactNode {
    const entityIcons: Record<string, React.ReactNode> = {
        table: <Table2 className="size-3" />,
        column: <Columns3 className="size-3" />,
        relation: <Link2 className="size-3" />,
        index: <Hash className="size-3" />,
    };

    const typeIcons: Record<string, React.ReactNode> = {
        added: <Plus className="size-2.5" />,
        removed: <Minus className="size-2.5" />,
        modified: <Pencil className="size-2.5" />,
    };

    return (
        <span className="flex items-center gap-0.5">
            {typeIcons[item.type]}
            {entityIcons[item.entity]}
        </span>
    );
}

/**
 * Returns CSS color class for diff item type.
 */
function getDiffColors(type: DiffItem["type"]): string {
    switch (type) {
        case "added":
            return "text-emerald-600 bg-emerald-500/10 border-emerald-500/20";
        case "removed":
            return "text-red-500 bg-red-500/10 border-red-500/20";
        case "modified":
            return "text-amber-600 bg-amber-500/10 border-amber-500/20";
        default:
            return "text-muted-foreground bg-muted border-border";
    }
}

/**
 * Returns uppercase badge label for diff item type.
 */
function getDiffLabel(type: DiffItem["type"]): string {
    switch (type) {
        case "added":
            return "ADD";
        case "removed":
            return "DEL";
        case "modified":
            return "MOD";
        default:
            return "";
    }
}

/**
 * Renders diff preview card for AI proposed schema patches.
 */
export const DiffPreviewCard: React.FC = (): React.ReactElement | null => {
    const pendingPatch = useAIStore(s => s.pendingPatch);
    const approvePatch = useAIStore(s => s.approvePatch);
    const rejectPatch = useAIStore(s => s.rejectPatch);

    if (!pendingPatch || pendingPatch.diffs.length === 0) {
        return null;
    }

    const { diffs } = pendingPatch;

    const addedCount = diffs.filter(d => d.type === "added").length;
    const modifiedCount = diffs.filter(d => d.type === "modified").length;
    const removedCount = diffs.filter(d => d.type === "removed").length;

    return (
        <div className="mx-2 my-2 rounded-xl border border-primary/20 bg-card shadow-lg overflow-hidden">
            <div className="px-3 py-2.5 bg-primary/5 border-b border-primary/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="size-6 rounded-md bg-primary/10 flex items-center justify-center">
                            <RotateCcw className="size-3.5 text-primary" />
                        </div>
                        <div>
                            <h4 className="text-xs font-semibold">Schema Changes Preview</h4>
                            <p className="text-[10px] text-muted-foreground">
                                Review before applying to canvas
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-medium">
                        {addedCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600">
                                +{addedCount}
                            </span>
                        )}
                        {modifiedCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600">
                                ~{modifiedCount}
                            </span>
                        )}
                        {removedCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-red-500/15 text-red-500">
                                -{removedCount}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="px-3 py-2 max-h-48 overflow-y-auto">
                <div className="flex flex-col gap-1">
                    {diffs.map((diff, idx) => (
                        <div
                            key={idx}
                            className={`flex items-center gap-2 px-2 py-1.5 rounded-md border text-[11px] ${getDiffColors(diff.type)}`}
                        >
                            {getDiffIcon(diff)}
                            <span className="font-mono font-semibold text-[9px] uppercase tracking-wider opacity-70 w-6">
                                {getDiffLabel(diff.type)}
                            </span>
                            <span className="flex-1 truncate">{diff.details}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="px-3 py-2.5 border-t border-primary/10 bg-primary/5 flex items-center gap-2 justify-end">
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={rejectPatch}
                    className="h-7 text-xs gap-1 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                >
                    <X className="size-3" data-icon="inline-start" />
                    Reject
                </Button>
                <Button
                    size="sm"
                    onClick={approvePatch}
                    className="h-7 text-xs gap-1.5 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                    <Check className="size-3" data-icon="inline-start" />
                    Approve &amp; Apply
                </Button>
            </div>
        </div>
    );
};
