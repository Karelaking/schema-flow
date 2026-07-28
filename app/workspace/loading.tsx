import React from "react";
import { WorkspaceSkeleton } from "@/components/layout/WorkspaceSkeleton";

/**
 * Next.js App Router automatic Suspense boundary fallback for /workspace.
 */
export default function WorkspaceLoading():React.JSX.Element {
  return <WorkspaceSkeleton />;
}
