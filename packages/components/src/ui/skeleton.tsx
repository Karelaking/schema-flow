import React from "react";
import { cn } from "../lib/utils";

/**
 * Skeleton component for pulse loading placeholder states.
 * Renders a shimmer animation to indicate loading content.
 *
 * @param props - Standard div element props.
 * @returns A styled skeleton placeholder element.
 */
const Skeleton = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element => {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-muted/60", className)}
            {...props}
        />
    );
};

export { Skeleton };
