"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";
import { Button } from "./button";
import { Kbd } from "./kbd";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./tooltip";

/**
 * Props for the ThemeToggle component.
 */
export interface ThemeToggleProps {
    /** Optional custom class name. */
    className?: string;
    /** Whether to show the Kbd badge directly on the button (defaults to true). */
    showKbd?: boolean;
}

/**
 * Shared keyboard event handler for theme toggling.
 * Extracted for DRY — used by both ThemeToggle and FloatingThemeToggle.
 *
 * @param toggleTheme - The callback to invoke when the theme shortcut is pressed.
 * @returns A keyboard event handler function.
 */
export const createThemeKeyHandler = (toggleTheme: () => void) => {
    return (e: KeyboardEvent): void => {
        const target = e.target as HTMLElement | undefined;
        if (
            target &&
            (target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.tagName === "SELECT" ||
                target.isContentEditable)
        ) {
            return;
        }
        const isControl = e.metaKey || e.ctrlKey;
        const isDKey = e.key && e.key.toLowerCase() === "d";
        if ((isDKey && !isControl && !e.altKey && !e.shiftKey) || (isDKey && isControl && e.shiftKey)) {
            e.preventDefault();
            toggleTheme();
        }
    };
};

/**
 * ThemeToggle component — button with keyboard shortcut badge for switching themes.
 * Follows SRP: keyboard shortcut logic is extracted to createThemeKeyHandler.
 *
 * @param props - ThemeToggle configuration props.
 * @returns A theme toggle button element.
 */
export const ThemeToggle = ({ className, showKbd = true }: ThemeToggleProps = {}): React.JSX.Element => {
    const { theme, toggleTheme } = useTheme();

    React.useEffect(() => {
        const handleKeyDown = createThemeKeyHandler(toggleTheme);
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [toggleTheme]);

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger render={
                    <Button
                        variant="ghost"
                        size={showKbd ? "sm" : "icon"}
                        onClick={toggleTheme}
                        className={`h-9 px-2 gap-1.5 rounded-lg transition-transform active:scale-95 cursor-pointer ${className || ""}`}
                        aria-label="Toggle color theme (Key: D)"
                        data-slot="button"
                    >
                        {theme === "dark" ? (
                            <Sun className="size-4 text-amber-400 transition-all" data-slot="icon" data-icon="inline-start" aria-hidden="true" />
                        ) : (
                            <Moon className="size-4 text-slate-700 transition-all" data-slot="icon" data-icon="inline-start" aria-hidden="true" />
                        )}
                        {showKbd && (
                            <Kbd className="h-4 px-1 text-[9px] font-mono leading-none shadow-2xs">
                                Ctrl+Shift+D
                            </Kbd>
                        )}
                    </Button>
                } />
                <TooltipContent side="bottom" className="flex items-center gap-1.5 text-xs">
                    <span>Toggle Theme</span>
                    <Kbd>Ctrl+Shift+D</Kbd>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
