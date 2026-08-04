"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@schema-flow/components/ui/button";

export interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Next.js App Router Error Boundary Page Component.
 */
export default function Error({
  error,
  reset,
}: ErrorPageProps): React.ReactElement {
  useEffect(() => {
    console.error("Application runtime error:", error);
  }, [error]);

  return (
    <main className="flex-1 w-full bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
      <div className="size-16 rounded-2xl bg-destructive/15 flex items-center justify-center mb-6">
        <AlertTriangle className="size-8 text-destructive" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-2">Something went wrong!</h1>
      <p className="text-muted-foreground text-sm max-w-md mb-6 leading-relaxed">
        {error?.message || "An unexpected application error occurred."}
      </p>
      <Button variant="default" size="lg" onClick={() => reset()} className="gap-2 h-10 min-w-32 cursor-pointer font-semibold">
        <RefreshCw className="size-4" data-icon="inline-start" />
        <span>Try Again</span>
      </Button>
    </main>
  );
}
