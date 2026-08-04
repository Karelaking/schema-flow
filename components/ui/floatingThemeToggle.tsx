"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * Floating theme toggle button rendered in the bottom right corner of the site.
 * Allows smooth theme switching between light and dark modes with accessibility tooltip.
 */
export const FloatingThemeToggle: React.FC = (): React.ReactElement => {
    const { theme, toggleTheme } = useTheme();

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent): void => {
            const target = e.target as HTMLElement | null;
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
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [toggleTheme]);

    return (
        <div className="fixed bottom-5 right-5 z-50 select-none">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger render={
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="size-11 rounded-full bg-card hover:bg-accent text-card-foreground border border-border shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-md focus:outline-hidden focus:ring-2 focus:ring-ring"
                            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode (Key: D)`}
                        >
                            {theme === "dark" ? (
                                <Sun className="size-5 text-amber-400 transition-transform duration-300 hover:rotate-45" data-icon="inline-start" />
                            ) : (
                                <Moon className="size-5 text-slate-700 dark:text-slate-300 transition-transform duration-300 hover:-rotate-12" data-icon="inline-start" />
                            )}
                        </button>
                    } />
                    <TooltipContent side="left" className="text-xs font-medium">
                        Switch to {theme === "dark" ? "Light" : "Dark"} Mode
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
};
