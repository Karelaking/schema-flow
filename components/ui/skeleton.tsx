import React from "react";
import { cn } from "@/lib/utils";

/**
 * Shadcn UI Skeleton component for pulse loading states.
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted/60", className)}
      {...props}
    />
  );
}

export { Skeleton };
