"use client";

import React from "react";
import { FolderTree, LayoutGrid, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Props for MobileNavigation component.
 */
export interface MobileNavigationProps {
    activeTab: "explorer" | "canvas" | "inspector";
    onTabChange: (tab: "explorer" | "canvas" | "inspector") => void;
}

/**
 * Renders bottom tab bar for mobile viewports.
 */
export const MobileNavigation: React.FC<MobileNavigationProps> = ({ activeTab, onTabChange }): React.ReactElement => {
    return (
        <div className="h-14 bg-card/90 border-t border-border backdrop-blur-xs flex items-center justify-around z-40 shrink-0 select-none w-full">
            <button
                onClick={() => onTabChange("explorer")}
                className={cn(
                    "flex flex-col items-center justify-center gap-0.5 w-20 h-full transition-colors cursor-pointer",
                    activeTab === "explorer" ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
                )}
            >
                <FolderTree className="size-4.5" />
                <span className="text-[9px] tracking-wide mt-0.5">Explorer</span>
            </button>

            <button
                onClick={() => onTabChange("canvas")}
                className={cn(
                    "flex flex-col items-center justify-center gap-0.5 w-20 h-full transition-colors cursor-pointer",
                    activeTab === "canvas" ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
                )}
            >
                <LayoutGrid className="size-4.5" />
                <span className="text-[9px] tracking-wide mt-0.5">Canvas</span>
            </button>

            <button
                onClick={() => onTabChange("inspector")}
                className={cn(
                    "flex flex-col items-center justify-center gap-0.5 w-20 h-full transition-colors cursor-pointer",
                    activeTab === "inspector" ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
                )}
            >
                <SlidersHorizontal className="size-4.5" />
                <span className="text-[9px] tracking-wide mt-0.5">Inspect</span>
            </button>
        </div>
    );
};
