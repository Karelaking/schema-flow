"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useStore } from "@/lib/store";

type Theme = "dark" | "light";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }): React.ReactElement {
    const [theme, setThemeState] = useState<Theme>("dark");
    const storeTheme = useStore(state => state.theme);

    useEffect(() => {
        const saved = localStorage.getItem("schema-flow-theme") as Theme;
        if (saved && (saved === "dark" || saved === "light")) {
            setThemeState(saved);
        }
        else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
            setThemeState("light");
        }
        else {
            setThemeState("dark");
        }
    }, []);

    useEffect(() => {
        if (storeTheme && (storeTheme === "dark" || storeTheme === "light")) {
            setThemeState(storeTheme);
        }
    }, [storeTheme]);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(theme);
        localStorage.setItem("schema-flow-theme", theme);
        useStore.getState().setTheme(theme);
    }, [theme]);

    const toggleTheme = (): void => {
        setThemeState(prev => (prev === "dark" ? "light" : "dark"));
    };

    const setTheme = (newTheme: Theme): void => {
        setThemeState(newTheme);
    };

    // Dark-mode keyboard shortcut listener ('d' or Cmd+Shift+D) ignoring interactive input elements
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent): void => {
            const target = e.target as HTMLElement | null;
            if (!target) {
                return;
            }

            const isInputTarget =
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.tagName === "SELECT" ||
                target.isContentEditable ||
                Boolean(target.closest && target.closest("input, textarea, select, [contenteditable='true']"));

            if (isInputTarget) {
                return;
            }

            const key = e.key ? e.key.toLowerCase() : "";
            const isControl = e.metaKey || e.ctrlKey;

            const isSingleD = key === "d" && !isControl && !e.altKey && !e.shiftKey;
            const isCmdShiftD = key === "d" && isControl && e.shiftKey;

            if (isSingleD || isCmdShiftD) {
                e.preventDefault();
                toggleTheme();
            }
        };

        window.addEventListener("keydown", handleKeyDown, { capture: true });
        return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
    }, [toggleTheme]);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextType {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within ThemeProvider");
    }
    return context;
}

export type { Theme };
