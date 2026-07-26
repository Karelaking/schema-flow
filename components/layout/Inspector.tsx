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
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
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

/**
 * Inspector Coordinator Component: Delegates panel rendering to TableInspector, RelationInspector, CodePreviewTab, ValidationTab, or QueryBuilderTab.
 */
export const Inspector: React.FC<InspectorProps> = ({ className, style }): React.ReactElement => {
    const tables = useStore(state => state.tables);
    const relations = useStore(state => state.relations);
    const selectedTableId = useStore(state => state.selectedTableId);
    const selectedRelationId = useStore(state => state.selectedRelationId);

    const [activeTab, setActiveTab] = useState<string>("inspector");
    const [selectedColId, setSelectedColId] = useState<string | undefined>(undefined);

    const selectedTable = selectedTableId ? tables[selectedTableId] : undefined;
    const selectedRelation = selectedRelationId ? relations[selectedRelationId] : undefined;

    return (
        <aside style={style} className={cn("sidebar-panel bg-card text-card-foreground flex flex-col shrink-0 select-none border-l overflow-hidden", className)}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
                <div className="p-3 border-b flex items-center justify-between gap-2 shrink-0">
                    <TabsList className="grid w-full grid-cols-4 h-8 text-xs flex-1">
                        <TabsTrigger value="inspector" className="gap-1 text-[10px] sm:text-[11px] cursor-pointer px-1">
                            <Layers className="size-3.5" />
                            Inspector
                        </TabsTrigger>
                        <TabsTrigger value="code" className="gap-1 text-[10px] sm:text-[11px] cursor-pointer px-1">
                            <Code className="size-3.5" />
                            Code
                        </TabsTrigger>
                        <TabsTrigger value="query" className="gap-1 text-[10px] sm:text-[11px] cursor-pointer px-1">
                            <Terminal className="size-3.5" />
                            Queries
                        </TabsTrigger>
                        <TabsTrigger value="validation" className="gap-1 text-[10px] sm:text-[11px] cursor-pointer px-1">
                            <AlertTriangle className="size-3.5" />
                            Validation
                        </TabsTrigger>
                    </TabsList>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => useStore.getState().toggleRightSidebar()}
                        className="size-7 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                        title="Hide Right Sidebar"
                    >
                        <PanelRightClose className="size-3.5" />
                    </Button>
                </div>

                <TabsContent value="inspector" className="flex-1 overflow-y-auto p-4 m-0">
                    {selectedTable ? (
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
                        <div className="h-full flex flex-col items-center justify-center gap-2 text-center text-muted-foreground p-6">
                            <Info className="size-8 text-muted-foreground/50" />
                            <span className="text-xs font-semibold">No Selection</span>
                            <p className="text-[11px] leading-relaxed max-w-[200px]">
                                Click on any table or relation line on the canvas to inspect its configuration.
                            </p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="code" className="flex-1 overflow-y-auto p-4 m-0">
                    <CodePreviewTab />
                </TabsContent>

                <TabsContent value="query" className="flex-1 overflow-y-auto p-4 m-0">
                    <QueryBuilderTab />
                </TabsContent>

                <TabsContent value="validation" className="flex-1 overflow-y-auto p-4 m-0">
                    <ValidationTab />
                </TabsContent>
            </Tabs>
        </aside>
    );
};
