"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface ThemeToggleProps {
  /** Optional custom class name */
  className?: string;
  /** Whether to show the Kbd badge directly on the button (defaults to true) */
  showKbd?: boolean;
}

export function ThemeToggle({ className, showKbd = true }: ThemeToggleProps = {}): React.JSX.Element {
  const { theme, toggleTheme } = useTheme();

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
}
