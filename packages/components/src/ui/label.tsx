"use client";

import * as React from "react";

import { cn } from "../lib/utils";

/**
 * Label component for form field accessibility.
 * Automatically adjusts to disabled and peer-disabled states.
 *
 * @param props - Standard label element props.
 * @returns A styled label element.
 */
const Label = ({ className, ...props }: React.ComponentProps<"label">): React.JSX.Element => {
    return (
        <label
            data-slot="label"
            className={cn(
                "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
                className
            )}
            {...props}
        />
    );
};

export { Label };
