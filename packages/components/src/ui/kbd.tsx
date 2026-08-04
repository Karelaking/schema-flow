import * as React from "react";
import { cn } from "../lib/utils";

/**
 * Props for the Kbd component.
 */
export interface KbdProps extends React.ComponentProps<"kbd"> {
    /** Additional class names */
    className?: string;
}

/**
 * Kbd component for rendering keyboard shortcut key indicators.
 * Provides a consistent visual treatment for keyboard shortcuts across the UI.
 *
 * @param props - Standard kbd element props.
 * @returns A styled kbd element.
 */
const Kbd = ({ className, ...props }: KbdProps): React.ReactElement => {
    return (
        <kbd
            data-slot="kbd"
            className={cn(
                "pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 shadow-2xs",
                className
            )}
            {...props}
        />
    );
};

export { Kbd };
