"use client";

import React, { useEffect } from "react";
import { useStore } from "@/lib/store";

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

            const keyLower = e.key.toLowerCase();
            const isControl = e.metaKey || e.ctrlKey;

            // Undo: Ctrl+Z or Cmd+Z (without Shift)
            if (isControl && !e.shiftKey && keyLower === "z") {
                e.preventDefault();
                const past = useStore.getState().past;
                if (past.length > 0) {
                    useStore.getState().undo();
                }
                return;
            }

            // Redo: Ctrl+Y, Cmd+Y, or Ctrl+Shift+Z / Cmd+Shift+Z
            const isCtrlY = isControl && keyLower === "y";
            const isCtrlShiftZ = isControl && e.shiftKey && keyLower === "z";

            if (isCtrlY || isCtrlShiftZ) {
                e.preventDefault();
                const future = useStore.getState().future;
                if (future.length > 0) {
                    useStore.getState().redo();
                }
                return;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return <>{children}</>;
}
