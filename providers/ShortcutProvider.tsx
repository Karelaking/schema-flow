"use client";

import React, { useEffect } from "react";
import { useStore } from "@/lib/store";
import { useTheme } from "@/providers/ThemeProvider";

/**
 * Props for ShortcutProvider.
 */
export interface ShortcutProviderProps {
    /** Child nodes to wrap */
    children: React.ReactNode;
}

/**
 * Global Keyboard Shortcut Provider.
 * Listens for app-wide keyboard shortcuts (Ctrl+Z / Cmd+Z for Undo, Ctrl+Y / Cmd+Y / Ctrl+Shift+Z for Redo).
 */
export function ShortcutProvider({ children }: ShortcutProviderProps): React.ReactElement {
    const { toggleTheme } = useTheme();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent): void => {
            const target = e.target as HTMLElement | null;

            // Do not override native undo/redo if user is actively typing in a form input/textarea/editable element
            if (
                target &&
                (target.tagName === "INPUT" ||
                    target.tagName === "TEXTAREA" ||
                    target.tagName === "SELECT" ||
                    target.isContentEditable ||
                    Boolean(target.closest && target.closest("input, textarea, select, [contenteditable='true']")))
            ) {
                return;
            }

            const code = e.code;
            const keyLower = e.key ? e.key.toLowerCase() : "";
            const isControl = e.metaKey || e.ctrlKey;

            // Undo: Ctrl+Z or Cmd+Z (without Shift)
            const isUndo = isControl && !e.shiftKey && (code === "KeyZ" || keyLower === "z");
            if (isUndo) {
                e.preventDefault();
                const past = useStore.getState().past;
                if (past.length > 0) {
                    useStore.getState().undo();
                }
                return;
            }

            // Redo: Ctrl+Y, Cmd+Y, or Ctrl+Shift+Z / Cmd+Shift+Z
            const isCtrlY = isControl && (code === "KeyY" || keyLower === "y");
            const isCtrlShiftZ = isControl && e.shiftKey && (code === "KeyZ" || keyLower === "z");

            if (isCtrlY || isCtrlShiftZ) {
                e.preventDefault();
                const future = useStore.getState().future;
                if (future.length > 0) {
                    useStore.getState().redo();
                }
                return;
            }

            // Create New Table Modal: Ctrl+Shift+N, Cmd+Shift+N, Alt+N, or Ctrl+N
            const isCreateShortcut =
                (isControl && e.shiftKey && (code === "KeyN" || keyLower === "n")) ||
                (e.altKey && (code === "KeyN" || keyLower === "n"));

            if (isCreateShortcut) {
                e.preventDefault();
                useStore.getState().setCreateTableOpen(true);
                return;
            }

            // Duplicate Selected Table: Ctrl+Shift+C or Alt+D
            const isDuplicateShortcut =
                (isControl && e.shiftKey && (code === "KeyC" || keyLower === "c")) ||
                (e.altKey && (code === "KeyD" || keyLower === "d"));

            if (isDuplicateShortcut) {
                const selectedTableId = useStore.getState().selectedTableId;
                if (selectedTableId) {
                    e.preventDefault();
                    useStore.getState().duplicateTable(selectedTableId);
                }
                return;
            }

            // Delete Selected Node or Relation: Delete or Backspace key
            const isDeleteKey = code === "Delete" || code === "Backspace" || keyLower === "delete" || keyLower === "backspace";
            if (isDeleteKey) {
                const selectedTableId = useStore.getState().selectedTableId;
                const selectedRelationId = useStore.getState().selectedRelationId;

                if (selectedTableId) {
                    e.preventDefault();
                    useStore.getState().deleteTable(selectedTableId);
                    return;
                }

                if (selectedRelationId) {
                    e.preventDefault();
                    useStore.getState().deleteRelation(selectedRelationId);
                    return;
                }
            }

            // Deselect: Escape key
            const isEscapeKey = code === "Escape" || keyLower === "escape";
            if (isEscapeKey) {
                const state = useStore.getState();
                if (state.selectedTableId || state.selectedRelationId) {
                    e.preventDefault();
                    state.selectTable(undefined);
                    state.selectRelation(undefined);
                }
                return;
            }

            // Toggle Theme: D key (standalone) or Ctrl/Cmd+Shift+D
            const isSingleD = keyLower === "d" && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey;
            const isCmdShiftD = isControl && e.shiftKey && keyLower === "d";

            if (isSingleD || isCmdShiftD) {
                e.preventDefault();
                toggleTheme();
                return;
            }
        };

        window.addEventListener("keydown", handleKeyDown, { capture: true });
        return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
    }, [toggleTheme]);

    return <>{children}</>;
}
