"use client";

import React, { useState } from "react";
import {
    Layers,
    Code,
    AlertTriangle,
    Terminal,
    Info,
    PanelRightClose
} from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TableInspector } from "@/components/inspector/TableInspector";
import { RelationInspector } from "@/components/inspector/RelationInspector";
import { CodePreviewTab } from "@/components/inspector/CodePreviewTab";
import { ValidationTab } from "@/components/inspector/ValidationTab";
import { QueryBuilderTab } from "@/components/inspector/QueryBuilderTab";

export interface InspectorProps {
    /** Optional custom CSS class name */
    className?: string;
    /** Optional inline CSS styles (e.g. resizable width) */
    style?: React.CSSProperties;
}

export type InspectorView = "inspector" | "code" | "query" | "validation";

/**
 * Inspector Coordinator Component: Uses shadcn Select dropdown to switch views and delegate rendering to inspector tabs.
 */
export const Inspector: React.FC<InspectorProps> = ({ className, style }): React.ReactElement => {
    const tables = useStore(state => state.tables);
    const relations = useStore(state => state.relations);
    const selectedTableId = useStore(state => state.selectedTableId);
    const selectedRelationId = useStore(state => state.selectedRelationId);

    const [activeView, setActiveView] = useState<InspectorView>("inspector");
    const [selectedColId, setSelectedColId] = useState<string | undefined>(undefined);

    const selectedTable = selectedTableId ? tables[selectedTableId] : undefined;
    const selectedRelation = selectedRelationId ? relations[selectedRelationId] : undefined;

    const handleSelectChange = (value: InspectorView | null): void => {
        if (value) {
            setActiveView(value);
        }
    };

    return (
        <aside style={style} className={cn("sidebar-panel bg-card text-card-foreground flex flex-col shrink-0 select-none border-l overflow-hidden", className)}>
            {/* Inspector Header with Select Dropdown */}
            <div className="p-3 border-b flex items-center justify-between gap-2 shrink-0 bg-muted/10">
                <div className="flex-1 min-w-0">
                    <Select value={activeView} onValueChange={handleSelectChange}>
                        <SelectTrigger className="w-full h-8 text-xs font-medium bg-background border-border shadow-xs">
                            <SelectValue placeholder="Select View..." />
                        </SelectTrigger>
                        <SelectContent align="start" className="w-(--anchor-width) min-w-48 bg-card border shadow-md z-50 p-1">
                            <SelectGroup>
                                <SelectItem value="inspector" className="text-xs cursor-pointer py-1.5">
                                    <div className="flex items-center gap-2">
                                        <Layers className="size-3.5 text-blue-500" />
                                        <span>Inspector & Attributes</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="code" className="text-xs cursor-pointer py-1.5">
                                    <div className="flex items-center gap-2">
                                        <Code className="size-3.5 text-emerald-500" />
                                        <span>Generated Code</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="query" className="text-xs cursor-pointer py-1.5">
                                    <div className="flex items-center gap-2">
                                        <Terminal className="size-3.5 text-purple-500" />
                                        <span>Query Builder</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="validation" className="text-xs cursor-pointer py-1.5">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="size-3.5 text-amber-500" />
                                        <span>Schema Validation</span>
                                    </div>
                                </SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => useStore.getState().toggleRightSidebar()}
                    className="size-8 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                    title="Hide Right Sidebar"
                >
                    <PanelRightClose className="size-4" />
                </Button>
            </div>

            {/* View Content Body */}
            <div className="flex-1 overflow-y-auto p-4">
                {activeView === "inspector" && (
                    selectedTable ? (
                        <TableInspector
                            selectedTable={selectedTable}
                            selectedColId={selectedColId}
                            setSelectedColId={setSelectedColId}
                        />
                    ) : selectedRelation ? (
                        <RelationInspector
                            selectedRelation={selectedRelation}
                        />
                    ) : (
                        <div className="h-full min-h-62.5 flex flex-col items-center justify-center gap-2 text-center text-muted-foreground p-6">
                            <Info className="size-8 text-muted-foreground/50" />
                            <span className="text-xs font-semibold">No Selection</span>
                            <p className="text-[11px] leading-relaxed max-w-50">
                                Click on any table or relation line on the canvas to inspect its configuration.
                            </p>
                        </div>
                    )
                )}

                {activeView === "code" && <CodePreviewTab />}

                {activeView === "query" && <QueryBuilderTab />}

                {activeView === "validation" && <ValidationTab />}
            </div>
        </aside>
    );
};
