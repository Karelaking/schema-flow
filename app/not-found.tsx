import React from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

/**
 * Next.js App Router 404 Not Found Page Component.
 */
export default function NotFound(): React.ReactElement {
  return (
    <main className="flex-1 w-full bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
      <div className="size-16 rounded-2xl bg-destructive/15 flex items-center justify-center mb-6">
        <AlertCircle className="size-8 text-destructive" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">404 - Page Not Found</h1>
      <p className="text-muted-foreground text-sm max-w-md mb-6 leading-relaxed">
        The page or schema project you are looking for does not exist or has been moved.
      </p>
      <Link href="/" className={buttonVariants({ variant: "default" })}>
        <ArrowLeft className="size-4" data-icon="inline-start" />
        Back to Workspace
      </Link>
    </main>
  );
}
