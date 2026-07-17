
"use client";

import React from "react";
import { Undo2, Redo2, LayoutGrid } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export interface CenterControlsProps {
  className?: string;
}

/**
 * Isolated Client Component: Provides Undo, Redo, and Auto-Layout actions.
 */
export function CenterControls({ className = "" }: CenterControlsProps): React.JSX.Element {
  const undo = useStore(state => state.undo);
  const redo = useStore(state => state.redo);
  const past = useStore(state => state.past);
  const future = useStore(state => state.future);
  const autoLayoutTables = useStore(state => state.autoLayoutTables);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Button 
        variant="ghost" 
        size="icon" 
        disabled={past.length === 0} 
        onClick={undo}
        title="Undo"
        className="size-8 cursor-pointer"
      >
        <Undo2 className="size-4" />
      </Button>

      <Button 
        variant="ghost" 
        size="icon" 
        disabled={future.length === 0} 
        onClick={redo}
        title="Redo"
        className="size-8 cursor-pointer"
      >
        <Redo2 className="size-4" />
      </Button>

      <Button 
        variant="ghost" 
        size="icon" 
        onClick={autoLayoutTables}
        title="Auto Layout Diagram"
        className="size-8 cursor-pointer"
      >
        <LayoutGrid className="size-4" />
      </Button>
    </div>
  );
}
