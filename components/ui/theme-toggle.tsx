"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";
import { Button } from "@/components/ui/button";

export function ThemeToggle(): React.JSX.Element {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="size-9 rounded-lg transition-transform active:scale-95 cursor-pointer"
      aria-label="Toggle color theme"
    >
      {theme === "dark" ? (
        <Sun className="size-4 text-amber-400 transition-all" />
      ) : (
        <Moon className="size-4 text-slate-700 transition-all" />
      )}
    </Button>
  );
}
