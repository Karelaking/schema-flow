"use client";

import React, { useEffect, useRef } from "react";
import {
    Plus,
    MessageSquarePlus,
    Pencil,
    Copy,
    Trash2,
    Save,
    LayoutGrid,
    Sparkles,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useProjectActions } from "@/hooks/project-actions.hook";
import { cn } from "@/lib/utils";

/**
 * Props for CanvasContextMenu component.
 */
export interface CanvasContextMenuProps {
    x: number;
    y: number;
    flowPosition: { x: number; y: number };
    targetType: "pane" | "node" | "edge";
    targetId?: string;
    onClose: () => void;
}

/**
 * Floating Context Menu for React Flow canvas, table nodes, and relation edges.
 */
export const CanvasContextMenu: React.FC<CanvasContextMenuProps> = ({
    x,
    y,
    flowPosition,
    targetType,
    targetId,
    onClose,
}): React.ReactElement => {
    const menuRef = useRef<HTMLDivElement>(null);
    const tables = useStore(state => state.tables);
    const setCreateTableOpen = useStore(state => state.setCreateTableOpen);
    const setCommentDialogOpen = useStore(state => state.setCommentDialogOpen);
    const deleteTable = useStore(state => state.deleteTable);
    const duplicateTable = useStore(state => state.duplicateTable);
    const deleteRelation = useStore(state => state.deleteRelation);
    const autoLayoutTables = useStore(state => state.autoLayoutTables);
    const addTable = useStore(state => state.addTable);
    const pushHistory = useStore(state => state.pushHistory);

    const { saveProject, isSaving } = useProjectActions();

    const activeTable = targetId && tables[targetId] ? tables[targetId] : undefined;
    const hasComment = Boolean(activeTable?.description);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent): void => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        const handleKeyDown = (e: KeyboardEvent): void => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    // Boundary check so menu doesn't overflow screen
    const menuWidth = 210;
    const menuHeight = 260;
    const adjustedX = Math.min(x, (typeof window !== "undefined" ? window.innerWidth : 1000) - menuWidth - 10);
    const adjustedY = Math.min(y, (typeof window !== "undefined" ? window.innerHeight : 1000) - menuHeight - 10);

    const handleCreateNewTable = (): void => {
        onClose();
        setCreateTableOpen(true);
    };

    const handleQuickAddTableAtPosition = (): void => {
        onClose();
        pushHistory();
        let count = Object.keys(tables).length + 1;
        let tableName = `table_${count}`;
        while (Object.values(tables).some(t => t.name === tableName)) {
            count++;
            tableName = `table_${count}`;
        }
        addTable(tableName, Math.round(flowPosition.x), Math.round(flowPosition.y));
    };

    const handleCommentAction = (): void => {
        onClose();
        if (targetId) {
            setCommentDialogOpen(true, targetId);
        }
    };

    const handleDuplicateAction = (): void => {
        onClose();
        if (targetId) {
            duplicateTable(targetId);
        }
    };

    const handleDeleteAction = (): void => {
        onClose();
        if (targetType === "node" && targetId) {
            deleteTable(targetId);
        } else if (targetType === "edge" && targetId) {
            deleteRelation(targetId);
        }
    };

    const handleSaveDatabaseAction = async (): Promise<void> => {
        onClose();
        await saveProject();
    };

    const handleAutoLayoutAction = (): void => {
        onClose();
        autoLayoutTables("LR");
    };

    return (
        <div
            ref={menuRef}
            style={{ top: adjustedY, left: adjustedX }}
            className="fixed z-50 w-52 rounded-lg border bg-card/95 p-1 text-card-foreground shadow-xl backdrop-blur-md animate-in fade-in-0 zoom-in-95 select-none"
        >
            {targetType === "node" && activeTable && (
                <div className="px-2 py-1.5 border-b mb-1">
                    <span className="text-xs font-semibold text-foreground truncate block">
                        {activeTable.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground block truncate">
                        {activeTable.columns.length} column(s)
                    </span>
                </div>
            )}

            <div className="space-y-0.5">
                {/* Create Table Options */}
                {targetType === "pane" && (
                    <>
                        <button
                            type="button"
                            onClick={handleQuickAddTableAtPosition}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-primary/10 hover:text-primary text-xs font-medium cursor-pointer transition-colors text-left"
                        >
                            <Plus className="size-3.5 text-primary shrink-0" />
                            <span>Create Table Here</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleCreateNewTable}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent text-xs cursor-pointer transition-colors text-left"
                        >
                            <Sparkles className="size-3.5 text-amber-500 shrink-0" />
                            <span>Create Table (Dialog)</span>
                        </button>
                    </>
                )}

                {/* Node-specific Actions */}
                {targetType === "node" && (
                    <>
                        <button
                            type="button"
                            onClick={handleCommentAction}
                            className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-accent text-xs cursor-pointer transition-colors text-left"
                        >
                            <div className="flex items-center gap-2">
                                {hasComment ? (
                                    <Pencil className="size-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                                ) : (
                                    <MessageSquarePlus className="size-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                                )}
                                <span>{hasComment ? "Update Comment" : "Add Comment"}</span>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={handleDuplicateAction}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent text-xs cursor-pointer transition-colors text-left"
                        >
                            <Copy className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                            <span>Duplicate Table</span>
                        </button>
                    </>
                )}

                {/* Delete Action for node or edge */}
                {(targetType === "node" || targetType === "edge") && (
                    <button
                        type="button"
                        onClick={handleDeleteAction}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-destructive/10 text-destructive text-xs cursor-pointer transition-colors text-left"
                    >
                        <Trash2 className="size-3.5 shrink-0" />
                        <span>Delete {targetType === "node" ? "Table" : "Relation"}</span>
                    </button>
                )}

                <div className="h-px bg-border my-1" />

                {/* Shared Actions: Save Database & Auto Layout */}
                <button
                    type="button"
                    onClick={handleSaveDatabaseAction}
                    disabled={isSaving}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-accent text-xs cursor-pointer transition-colors text-left"
                >
                    <div className="flex items-center gap-2">
                        <Save className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Save Database</span>
                    </div>
                </button>

                <button
                    type="button"
                    onClick={handleAutoLayoutAction}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent text-xs cursor-pointer transition-colors text-left"
                >
                    <LayoutGrid className="size-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>Auto Layout Nodes</span>
                </button>
            </div>
        </div>
    );
};
