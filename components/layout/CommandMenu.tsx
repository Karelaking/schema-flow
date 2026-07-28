"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Search,
    Plus,
    Sun,
    Moon,
    Download,
    Trash2,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useTheme } from "@/providers/ThemeProvider";
import { useProjectActions } from "@/hooks/project-actions.hook";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";

export interface CommandMenuProps {
    /** Optional open override */
    open?: boolean;
    /** Optional onOpenChange callback */
    onOpenChange?: (open: boolean) => void;
}

/**
 * App-level Command Menu (Cmd/Ctrl+K dialog) for quick action navigation.
 */
export const CommandMenu: React.FC<CommandMenuProps> = ({
    open: externalOpen,
    onOpenChange: externalOnOpenChange,
}): React.ReactElement => {
    const [internalOpen, setInternalOpen] = useState<boolean>(false);
    const [query, setQuery] = useState<string>("");

    const isControlled = externalOpen !== undefined;
    const isOpen = isControlled ? externalOpen : internalOpen;

    const setOpen = useCallback(
        (value: boolean): void => {
            if (!isControlled) {
                setInternalOpen(value);
            }
            if (externalOnOpenChange) {
                externalOnOpenChange(value);
            }
        },
        [isControlled, externalOnOpenChange]
    );

    const { theme, toggleTheme } = useTheme();
    const addTable = useStore(state => state.addTable);
    const tables = useStore(state => state.tables);
    const setCreateTableOpen = useStore(state => state.setCreateTableOpen);
    const loadProject = useStore(state => state.loadProject);
    const { exportSchema } = useProjectActions();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent): void => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                const target = e.target as HTMLElement | null;
                if (
                    target &&
                    (target.tagName === "INPUT" ||
                        target.tagName === "TEXTAREA" ||
                        target.tagName === "SELECT" ||
                        target.isContentEditable)
                ) {
                    // Prevent browser search/default and open menu even in inputs
                }
                e.preventDefault();
                setOpen(!isOpen);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, setOpen]);

    const handleAction = (action: () => void): void => {
        action();
        setOpen(false);
        setQuery("");
    };

    const tableList = Object.values(tables);

    const filteredTables = query.trim()
        ? tableList.filter(t => t.name.toLowerCase().includes(query.toLowerCase()))
        : tableList;

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent className="max-w-xl p-0 overflow-hidden bg-card border shadow-2xl rounded-xl">
                <DialogTitle className="sr-only">Quick Command Menu</DialogTitle>
                <div className="flex items-center gap-3 border-b px-4 py-3 bg-muted/20">
                    <Search className="size-4 text-muted-foreground shrink-0" />
                    <input
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Type a command or search tables..."
                        aria-label="Search commands or tables"
                        className="flex-1 bg-transparent text-sm focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring rounded-md px-2 py-1 placeholder:text-muted-foreground font-medium"
                        autoFocus
                    />
                    <Kbd className="hidden sm:inline-flex">ESC</Kbd>
                </div>

                <div className="max-h-80 overflow-y-auto p-2 flex flex-col gap-1 text-xs">
                    {query.trim() !== "" && filteredTables.length > 0 && (
                        <div className="flex flex-col gap-1">
                            <span className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Tables ({filteredTables.length})
                            </span>
                            {filteredTables.map(t => (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => handleAction(() => {})}
                                    className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-accent text-left transition-colors cursor-pointer"
                                >
                                    <span className="font-mono font-medium">{t.name}</span>
                                    <span className="text-[10px] text-muted-foreground">{t.columns.length} columns</span>
                                </button>
                            ))}
                        </div>
                    )}

                    <span className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Actions
                    </span>

                    <button
                        type="button"
                        onClick={() => handleAction(() => {
                            setCreateTableOpen(true);
                        })}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-primary/10 hover:text-primary text-left transition-colors cursor-pointer font-medium"
                    >
                        <div className="flex items-center gap-2.5">
                            <Plus className="size-4 text-primary" data-icon="inline-start" />
                            <span>Create New Table</span>
                        </div>
                        <Kbd>Ctrl+N</Kbd>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleAction(() => toggleTheme())}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-accent text-left transition-colors cursor-pointer"
                    >
                        <div className="flex items-center gap-2.5">
                            {theme === "dark" ? (
                                <Sun className="size-4 text-amber-500" data-icon="inline-start" />
                            ) : (
                                <Moon className="size-4 text-indigo-500" data-icon="inline-start" />
                            )}
                            <span>Toggle Theme</span>
                        </div>
                        <Kbd>Ctrl+Shift+D</Kbd>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleAction(() => exportSchema())}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-accent text-left transition-colors cursor-pointer"
                    >
                        <div className="flex items-center gap-2.5">
                            <Download className="size-4 text-muted-foreground" data-icon="inline-start" />
                            <span>Export Schema JSON</span>
                        </div>
                        <Kbd>Ctrl+E</Kbd>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleAction(() => {
                            loadProject({
                                project: { id: "temp-id", name: "Untitled", description: "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                                settings: { dialect: "sqlite", theme: "dark" },
                                tables: {},
                                relations: {},
                                enums: {},
                            });
                        })}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-destructive/10 hover:text-destructive text-left transition-colors cursor-pointer"
                    >
                        <div className="flex items-center gap-2.5">
                            <Trash2 className="size-4 text-destructive" data-icon="inline-start" />
                            <span>Clear All Canvas Tables</span>
                        </div>
                        <Kbd>Ctrl+Del</Kbd>
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
