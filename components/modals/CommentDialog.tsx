"use client";

import React, { useState, useEffect } from "react";
import { MessageSquarePlus, FileText, Trash2, Check, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@schema-flow/components/ui/dialog";
import { Button } from "@schema-flow/components/ui/button";
import { Textarea } from "@schema-flow/components/ui/textarea";
import { Label } from "@schema-flow/components/ui/label";
import { resolveRelationFK } from "@/lib/react-flow-utils";

/**
 * Props for CommentDialog component.
 */
export interface CommentDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

/**
 * Reusable modal dialog for creating and updating descriptions and comments on database tables and relations.
 */
export const CommentDialog: React.FC<CommentDialogProps> = ({ open, onOpenChange }): React.ReactElement => {
    const isCommentDialogOpen = useStore(state => state.isCommentDialogOpen);
    const commentDialogTargetId = useStore(state => state.commentDialogTargetId);
    const targetType = useStore(state => state.commentDialogTargetType || "node");
    const mode = useStore(state => state.commentDialogMode || "description");
    const setCommentDialogOpen = useStore(state => state.setCommentDialogOpen);
    const tables = useStore(state => state.tables);
    const relations = useStore(state => state.relations);
    const updateTable = useStore(state => state.updateTable);
    const updateRelation = useStore(state => state.updateRelation);
    const pushHistory = useStore(state => state.pushHistory);

    const isOpen = open !== undefined ? open : isCommentDialogOpen;
    const handleClose = (newOpen: boolean): void => {
        if (onOpenChange) {
            onOpenChange(newOpen);
        } else {
            setCommentDialogOpen(newOpen);
        }
    };

    const targetTable = targetType === "node" && commentDialogTargetId ? tables[commentDialogTargetId] : undefined;
    const targetRelation = targetType === "edge" && commentDialogTargetId ? relations[commentDialogTargetId] : undefined;

    let existingText = "";
    if (targetType === "node" && targetTable) {
        existingText = mode === "description" ? (targetTable.description || "") : (targetTable.comment || "");
    } else if (targetType === "edge" && targetRelation) {
        existingText = mode === "description" ? (targetRelation.description || "") : (targetRelation.comment || "");
    }

    const [textValue, setTextValue] = useState<string>(existingText);

    useEffect(() => {
        if (isOpen) {
            setTextValue(existingText);
        }
    }, [isOpen, existingText]);

    const handleSave = (): void => {
        if (!commentDialogTargetId) {
            handleClose(false);
            return;
        }

        pushHistory();
        const valueToSave = textValue.trim() ? textValue.trim() : undefined;

        if (targetType === "node" && targetTable) {
            if (mode === "description") {
                updateTable(commentDialogTargetId, { description: valueToSave });
            } else {
                updateTable(commentDialogTargetId, { comment: valueToSave });
            }
        } else if (targetType === "edge" && targetRelation) {
            if (mode === "description") {
                updateRelation(commentDialogTargetId, { description: valueToSave });
            } else {
                updateRelation(commentDialogTargetId, { comment: valueToSave });
            }
        }

        handleClose(false);
    };

    const handleRemove = (): void => {
        if (!commentDialogTargetId) {
            handleClose(false);
            return;
        }

        pushHistory();
        if (targetType === "node" && targetTable) {
            if (mode === "description") {
                updateTable(commentDialogTargetId, { description: undefined });
            } else {
                updateTable(commentDialogTargetId, { comment: undefined });
            }
        } else if (targetType === "edge" && targetRelation) {
            if (mode === "description") {
                updateRelation(commentDialogTargetId, { description: undefined });
            } else {
                updateRelation(commentDialogTargetId, { comment: undefined });
            }
        }

        handleClose(false);
    };

    let targetName = "";
    if (targetType === "node" && targetTable) {
        targetName = targetTable.name;
    } else if (targetType === "edge" && targetRelation) {
        const resolved = resolveRelationFK(targetRelation, tables);
        const fkTable = tables[resolved.fkTableId];
        const fkCol = fkTable?.columns.find(c => c.id === resolved.fkColumnId);
        const pkTable = tables[resolved.pkTableId];
        const pkCol = pkTable?.columns.find(c => c.id === resolved.pkColumnId);
        targetName = fkTable && pkTable ? `${fkTable.name}.${fkCol?.name} → ${pkTable.name}.${pkCol?.name}` : "Relation";
    }

    const isUpdating = Boolean(existingText);
    const fieldLabel = mode === "description" ? "Description" : "Comment";
    const entityType = targetType === "node" ? "Table" : "Relation";
    const dialogTitle = `${isUpdating ? "Update" : "Add"} ${entityType} ${fieldLabel}`;
    const DialogIcon = mode === "description" ? FileText : MessageSquarePlus;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md bg-card border shadow-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-foreground text-base">
                        <DialogIcon className="size-4 text-primary shrink-0" />
                        <span>{dialogTitle}</span>
                        {targetName && (
                            <span className="text-xs font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground font-normal truncate max-w-48">
                                {targetName}
                            </span>
                        )}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        {mode === "description"
                            ? `Documentation description for this ${entityType.toLowerCase()} schema.`
                            : `Internal notes or visual canvas annotations for this ${entityType.toLowerCase()}.`}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="comment-text-area" className="text-xs font-medium text-foreground">
                            {fieldLabel}
                        </Label>
                        <Textarea
                            id="comment-text-area"
                            rows={4}
                            placeholder={
                                mode === "description"
                                    ? `e.g. Stores documentation and structural metadata for ${targetName || entityType}...`
                                    : `e.g. Note: Check cascade behavior or indexed query performance...`
                            }
                            value={textValue}
                            onChange={e => setTextValue(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                                    e.preventDefault();
                                    handleSave();
                                }
                            }}
                            className="text-xs bg-background resize-none focus-visible:ring-1"
                        />
                        <span className="text-[10px] text-muted-foreground block text-right">
                            Press <kbd className="font-mono bg-muted px-1 rounded">Ctrl+Enter</kbd> to save
                        </span>
                    </div>
                </div>

                <DialogFooter className="flex items-center justify-between sm:justify-between gap-2 border-t pt-3">
                    {isUpdating ? (
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={handleRemove}
                            className="text-xs gap-1.5 cursor-pointer"
                        >
                            <Trash2 className="size-3.5" data-icon="inline-start" />
                            <span>Remove</span>
                        </Button>
                    ) : (
                        <div />
                    )}

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleClose(false)}
                            className="text-xs cursor-pointer"
                        >
                            <X className="size-3.5" data-icon="inline-start" />
                            <span>Cancel</span>
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleSave}
                            className="text-xs gap-1.5 cursor-pointer"
                        >
                            <Check className="size-3.5" data-icon="inline-start" />
                            <span>{isUpdating ? "Update" : "Save"}</span>
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
