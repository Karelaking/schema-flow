"use client";

import React from "react";
import { Undo2, Redo2, LayoutGrid, PanelLeft, PanelRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@schema-flow/components/ui/button";
import { Separator } from "@schema-flow/components/ui/separator";

/**
 * Props for CenterControls component.
 */
export interface CenterControlsProps {
    className?: string;
}

/**
 * Provides Sidebar Toggles, Undo, Redo, and Auto-Layout actions.
 */
export const CenterControls: React.FC<CenterControlsProps> = ({ className = "" }): React.ReactElement => {
    const undo = useStore(state => state.undo);
    const redo = useStore(state => state.redo);
    const past = useStore(state => state.past);
    const future = useStore(state => state.future);
    const autoLayoutTables = useStore(state => state.autoLayoutTables);
    const showLeftSidebar = useStore(state => state.showLeftSidebar);
    const showRightSidebar = useStore(state => state.showRightSidebar);
    const toggleLeftSidebar = useStore(state => state.toggleLeftSidebar);
    const toggleRightSidebar = useStore(state => state.toggleRightSidebar);

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <Button
                variant={showLeftSidebar ? "secondary" : "ghost"}
                size="icon"
                onClick={toggleLeftSidebar}
                title={showLeftSidebar ? "Hide Left Sidebar (Ctrl+V)" : "Show Left Sidebar (Ctrl+V)"}
                aria-label={showLeftSidebar ? "Hide Left Sidebar (Ctrl+V)" : "Show Left Sidebar (Ctrl+V)"}
                className="size-8 cursor-pointer"
            >
                <PanelLeft className="size-4" />
            </Button>
            
            <Button
                variant={showRightSidebar ? "secondary" : "ghost"}
                size="icon"
                onClick={toggleRightSidebar}
                title={showRightSidebar ? "Hide Right Sidebar (Ctrl+B)" : "Show Right Sidebar (Ctrl+B)"}
                aria-label={showRightSidebar ? "Hide Right Sidebar (Ctrl+B)" : "Show Right Sidebar (Ctrl+B)"}
                className="size-8 cursor-pointer"
            >
                <PanelRight className="size-4" />
            </Button>

            <Separator orientation="vertical" className="h-10 mx-0.5" />

            <Button
                variant="ghost"
                size="icon"
                disabled={past.length === 0}
                onClick={undo}
                title="Undo (Ctrl+Z)"
                aria-label="Undo"
                className="size-8 cursor-pointer"
            >
                <Undo2 className="size-4" />
            </Button>

            <Button
                variant="ghost"
                size="icon"
                disabled={future.length === 0}
                onClick={redo}
                title="Redo (Ctrl+Y)"
                aria-label="Redo"
                className="size-8 cursor-pointer"
            >
                <Redo2 className="size-4" />
            </Button>

            <Separator orientation="vertical" className="h-10 mx-0.5" />
            <Button
                variant="ghost"
                size="icon"
                onClick={() => autoLayoutTables()}
                title="Auto Layout Diagram"
                aria-label="Auto Layout Diagram"
                className="size-8 cursor-pointer"
            >
                <LayoutGrid className="size-4" />
            </Button>
        </div>
    );
};
