"use client";

import React, { useState, useEffect } from "react";
import { MessageSquarePlus, Trash2, Check, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

/**
 * Props for CommentDialog component.
 */
export interface CommentDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

/**
 * Reusable modal dialog for creating and updating comments/descriptions on database tables.
 */
export const CommentDialog: React.FC<CommentDialogProps> = ({ open, onOpenChange }): React.ReactElement => {
    const isCommentDialogOpen = useStore(state => state.isCommentDialogOpen);
    const commentDialogTargetId = useStore(state => state.commentDialogTargetId);
    const setCommentDialogOpen = useStore(state => state.setCommentDialogOpen);
    const tables = useStore(state => state.tables);
    const updateTable = useStore(state => state.updateTable);
    const pushHistory = useStore(state => state.pushHistory);

    const isOpen = open !== undefined ? open : isCommentDialogOpen;
    const handleClose = (newOpen: boolean): void => {
        if (onOpenChange) {
            onOpenChange(newOpen);
        } else {
            setCommentDialogOpen(newOpen);
        }
    };

    const targetTable = commentDialogTargetId ? tables[commentDialogTargetId] : undefined;
    const existingComment = targetTable?.description || "";

    const [commentText, setCommentText] = useState<string>(existingComment);

    useEffect(() => {
        if (isOpen) {
            setCommentText(existingComment);
        }
    }, [isOpen, existingComment]);

    const handleSave = (): void => {
        if (!commentDialogTargetId || !targetTable) {
            handleClose(false);
            return;
        }

        pushHistory();
        updateTable(commentDialogTargetId, {
            description: commentText.trim() ? commentText.trim() : undefined
        });
        handleClose(false);
    };

    const handleRemove = (): void => {
        if (!commentDialogTargetId || !targetTable) {
            handleClose(false);
            return;
        }

        pushHistory();
        updateTable(commentDialogTargetId, {
            description: undefined
        });
        handleClose(false);
    };

    const isUpdating = Boolean(existingComment);

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md bg-card border shadow-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-foreground text-base">
                        <MessageSquarePlus className="size-4 text-primary shrink-0" />
                        <span>{isUpdating ? "Update Comment" : "Add Comment"}</span>
                        {targetTable && (
                            <span className="text-xs font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground font-normal truncate max-w-40">
                                {targetTable.name}
                            </span>
                        )}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        {isUpdating
                            ? "Modify or clear the description comment for this table schema."
                            : "Add notes or a documentation comment for this table schema."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="comment-text-area" className="text-xs font-medium text-foreground">
                            Comment / Description
                        </Label>
                        <Textarea
                            id="comment-text-area"
                            rows={4}
                            placeholder="e.g. Primary table storing user profiles, security credentials, and preferences..."
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
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
