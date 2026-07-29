"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";

/**
 * Global keyboard shortcuts hook for managing undo, redo, deletion, search focus, and auto-layout.
 */
export const useKeyboardShortcuts = (): void => {
    const undo = useStore(state => state.undo);
    const redo = useStore(state => state.redo);
    const selectedTableId = useStore(state => state.selectedTableId);
    const selectedRelationId = useStore(state => state.selectedRelationId);
    const deleteTable = useStore(state => state.deleteTable);
    const deleteRelation = useStore(state => state.deleteRelation);
    const autoLayoutTables = useStore(state => state.autoLayoutTables);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent): void => {
            // Do not trigger shortcuts when user is typing inside an input, textarea, or contentEditable element
            const target = event.target as HTMLElement | null;
            if (
                target &&
                (target.tagName === "INPUT" ||
                    target.tagName === "TEXTAREA" ||
                    target.tagName === "SELECT" ||
                    target.isContentEditable)
            ) {
                return;
            }

            const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().includes("MAC");
            const modifierKey = isMac ? event.metaKey : event.ctrlKey;

            // Undo: Cmd+Z or Ctrl+Z
            if (modifierKey && !event.shiftKey && event.key.toLowerCase() === "z") {
                event.preventDefault();
                undo();
                return;
            }

            // Redo: Cmd+Shift+Z or Ctrl+Y / Ctrl+Shift+Z
            if (
                (modifierKey && event.shiftKey && event.key.toLowerCase() === "z") ||
                (modifierKey && event.key.toLowerCase() === "y")
            ) {
                event.preventDefault();
                redo();
                return;
            }

            // Focus Search: Cmd+F or Ctrl+F
            if (modifierKey && event.key.toLowerCase() === "f") {
                event.preventDefault();
                const searchInput = document.querySelector<HTMLInputElement>("input[placeholder*='Search']");
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
                return;
            }

            // Auto-layout: Cmd+Shift+L or Ctrl+Shift+L
            if (modifierKey && event.shiftKey && event.key.toLowerCase() === "l") {
                event.preventDefault();
                autoLayoutTables("LR");
                return;
                }

            // Delete selected table or relation: Delete or Backspace
            if (event.key === "Delete" || event.key === "Backspace") {
                if (selectedTableId) {
                    event.preventDefault();
                    deleteTable(selectedTableId);
                } else if (selectedRelationId) {
                    event.preventDefault();
                    deleteRelation(selectedRelationId);
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [undo, redo, selectedTableId, selectedRelationId, deleteTable, deleteRelation, autoLayoutTables]);
};
