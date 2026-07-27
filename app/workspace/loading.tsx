import React from "react";
import { Loader2 } from "lucide-react";

export default function WorkspaceLoading(): React.ReactElement {
    return (
        <div className="flex-1 flex items-center justify-center" role="status" aria-live="polite">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="size-6 text-primary animate-spin" />
                <p className="text-xs text-muted-foreground">Loading workspace...</p>
            </div>
        </div>
    );
}
