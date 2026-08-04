"use client";

import React, { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

/**
 * Mobile-responsive development notification banner rendered at the top of the site.
 * Adapts layout, typography, badge sizing, and touch targets seamlessly
 * from mobile to desktop viewports.
 *
 * Follows SRP: only manages banner visibility state.
 *
 * @returns A development warning banner element, or empty fragment when dismissed.
 */
export const DevelopmentBanner: React.FC = (): React.ReactElement => {
    const [isVisible, setIsVisible] = useState<boolean>(true);

    if (!isVisible) {
        return <></>;
    }

    return (
        <aside
            aria-label="Development environment warning"
            className="w-full bg-card/95 dark:bg-card/85 border-b border-border text-foreground px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium flex items-center justify-between gap-2 sm:gap-3 shrink-0 z-50 backdrop-blur-md transition-colors select-none"
        >
            <div className="flex-1 min-w-0 flex items-center justify-center gap-1.5 sm:gap-2 text-center flex-wrap sm:flex-nowrap">
                <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-amber-500/10 dark:bg-amber-400/10 px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20 dark:border-amber-400/20 shrink-0">
                    <AlertTriangle className="size-3 sm:size-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="whitespace-nowrap">Under Development</span>
                </span>
                <p className="text-muted-foreground text-[11px] leading-tight sm:text-xs md:text-sm">
                    <span className="hidden lg:inline">
                        Schema Flow Studio is under active development. Saved schemas and local project data may be corrupted or lost in future updates.
                    </span>
                    <span className="hidden sm:inline lg:hidden">
                        Under active development. Saved schemas and project data may be corrupted or lost in future updates.
                    </span>
                    <span className="sm:hidden">
                        Data may be corrupted or lost in future updates.
                    </span>
                </p>
            </div>
            <button
                type="button"
                onClick={() => setIsVisible(false)}
                className="rounded-md p-1 sm:p-1.5 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors shrink-0 cursor-pointer flex items-center justify-center min-w-6 min-h-6"
                aria-label="Dismiss warning banner"
            >
                <X className="size-3.5" />
            </button>
        </aside>
    );
};
