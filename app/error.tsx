"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
      <div className="size-16 rounded-2xl bg-amber-500/15 flex items-center justify-center mb-6">
        <AlertTriangle className="size-8 text-amber-500" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-2">Something went wrong!</h1>
      <p className="text-muted-foreground text-sm max-w-md mb-6 leading-relaxed">
        {error.message || "An unexpected application error occurred."}
      </p>
      <Button variant="default" onClick={reset} className="gap-2">
        <RefreshCw className="size-4" data-icon="inline-start" />
        Try Again
      </Button>
    </div>
  );
}
