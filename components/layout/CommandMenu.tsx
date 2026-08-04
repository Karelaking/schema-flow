"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Plus,
    Sun,
    Moon,
    Download,
    Trash2,
    PanelLeft,
    PanelRight,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useTheme } from "@/providers/ThemeProvider";
import { useProjectActions } from "@/hooks/project-actions.hook";
import {
    CommandDialog,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandShortcut,
} from "@schema-flow/components/ui/command";
import { Kbd } from "@schema-flow/components/ui/kbd";
import { toast } from "@schema-flow/components/ui/sonner";

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
    const tables = useStore(state => state.tables);
    const setCreateTableOpen = useStore(state => state.setCreateTableOpen);
    const loadProject = useStore(state => state.loadProject);
    const { exportSchema } = useProjectActions();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent): void => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
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
    };

    const tableList = Object.values(tables);

    return (
        <CommandDialog open={isOpen} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search tables..." />
            <CommandList>
                <CommandEmpty>No matching commands or tables found.</CommandEmpty>

                {tableList.length > 0 && (
                    <CommandGroup heading="Tables">
                        {tableList.map(t => (
                            <CommandItem
                                key={t.id}
                                onSelect={() => handleAction(() => {
                                    useStore.getState().selectTable(t.id);
                                    toast.info(`Selected table: ${t.name}`);
                                })}
                            >
                                <span className="font-mono font-medium">{t.name}</span>
                                <CommandShortcut>{t.columns.length} columns</CommandShortcut>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}

                <CommandGroup heading="Actions">
                    <CommandItem
                        onSelect={() => handleAction(() => {
                            setCreateTableOpen(true);
                        })}
                    >
                        <Plus className="mr-2 size-4 text-primary" data-icon="inline-start" />
                        <span>Create New Table</span>
                        <CommandShortcut><Kbd>Ctrl+N</Kbd></CommandShortcut>
                    </CommandItem>

                    <CommandItem
                        onSelect={() => handleAction(() => {
                            toggleTheme();
                            toast.info(`Theme set to ${theme === "dark" ? "light" : "dark"}`);
                        })}
                    >
                        {theme === "dark" ? (
                            <Sun className="mr-2 size-4 text-amber-500" data-icon="inline-start" />
                        ) : (
                            <Moon className="mr-2 size-4 text-indigo-500" data-icon="inline-start" />
                        )}
                        <span>Toggle Theme</span>
                        <CommandShortcut><Kbd>Ctrl+Shift+D</Kbd></CommandShortcut>
                    </CommandItem>

                    <CommandItem
                        onSelect={() => handleAction(() => {
                            useStore.getState().toggleLeftSidebar();
                        })}
                    >
                        <PanelLeft className="mr-2 size-4 text-muted-foreground" data-icon="inline-start" />
                        <span>Toggle Left Sidebar (Explorer)</span>
                        <CommandShortcut><Kbd>Ctrl+V</Kbd></CommandShortcut>
                    </CommandItem>

                    <CommandItem
                        onSelect={() => handleAction(() => {
                            useStore.getState().toggleRightSidebar();
                        })}
                    >
                        <PanelRight className="mr-2 size-4 text-muted-foreground" data-icon="inline-start" />
                        <span>Toggle Right Sidebar (Inspector)</span>
                        <CommandShortcut><Kbd>Ctrl+B</Kbd></CommandShortcut>
                    </CommandItem>

                    <CommandItem
                        onSelect={() => handleAction(() => {
                            exportSchema();
                            toast.success("Schema exported");
                        })}
                    >
                        <Download className="mr-2 size-4 text-muted-foreground" data-icon="inline-start" />
                        <span>Export Schema JSON</span>
                        <CommandShortcut><Kbd>Ctrl+E</Kbd></CommandShortcut>
                    </CommandItem>

                    <CommandItem
                        onSelect={() => handleAction(() => {
                            loadProject({
                                project: { id: "temp-id", name: "Untitled", description: "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                                settings: { dialect: "sqlite", theme: "dark" },
                                tables: {},
                                relations: {},
                                enums: {},
                            });
                            toast.success("Created new project");
                        })}
                    >
                        <Trash2 className="mr-2 size-4 text-destructive" data-icon="inline-start" />
                        <span>Reset Canvas (New Project)</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
};
