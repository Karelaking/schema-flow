import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Full-page Workspace Skeleton fallback UI rendered inside React Suspense boundary.
 */
export const WorkspaceSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col h-full flex-1 w-full overflow-hidden bg-background text-foreground">
      {/* Top Header Toolbar Skeleton */}
      <header className="h-14 border-b border-border bg-card/50 backdrop-blur px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Skeleton className="h-7 w-32 rounded-lg" />
          <div className="h-4 w-px bg-border" />
          <div className="flex gap-2">
            <Skeleton className="h-7 w-16 rounded-md" />
            <Skeleton className="h-7 w-16 rounded-md" />
            <Skeleton className="h-7 w-16 rounded-md" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </header>

      {/* Main Workspace Area Skeleton */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Left Explorer Sidebar Skeleton */}
        <aside className="w-64 border-r border-border bg-card/30 p-3 flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-6 w-6 rounded-md" />
          </div>
          <Skeleton className="h-9 w-full rounded-md" />
          <div className="space-y-2 mt-2">
            <Skeleton className="h-8 w-full rounded-md" />
            <Skeleton className="h-8 w-full rounded-md" />
            <Skeleton className="h-8 w-full rounded-md" />
            <Skeleton className="h-8 w-full rounded-md" />
          </div>
        </aside>

        {/* Central Canvas Skeleton */}
        <main className="flex-1 relative bg-background/50 p-6 flex items-center justify-center overflow-hidden">
          {/* Simulated Canvas Node Skeletons */}
          <div className="absolute top-16 left-20 w-72 border border-border/40 bg-card/40 rounded-xl p-4 shadow-sm flex flex-col gap-3 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-md" />
              <Skeleton className="h-5 w-36" />
            </div>
            <div className="space-y-2 pt-2">
              <Skeleton className="h-6 w-full rounded" />
              <Skeleton className="h-6 w-full rounded" />
              <Skeleton className="h-6 w-full rounded" />
            </div>
          </div>

          <div className="absolute top-36 right-32 w-80 border border-border/40 bg-card/40 rounded-xl p-4 shadow-sm flex flex-col gap-3 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-md" />
              <Skeleton className="h-5 w-40" />
            </div>
            <div className="space-y-2 pt-2">
              <Skeleton className="h-6 w-full rounded" />
              <Skeleton className="h-6 w-full rounded" />
              <Skeleton className="h-6 w-full rounded" />
              <Skeleton className="h-6 w-full rounded" />
            </div>
          </div>
        </main>

        {/* Right Inspector Sidebar Skeleton */}
        <aside className="w-80 border-l border-border bg-card/30 p-4 flex flex-col gap-4 shrink-0">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-full rounded-md" />
          <div className="space-y-3 pt-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-full rounded-md" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-20 w-full rounded-md" />
          </div>
        </aside>
      </div>
    </div>
  );
};
