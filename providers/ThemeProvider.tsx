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
        else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            setThemeState("dark");
        }
        else {
            setThemeState("light");
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
