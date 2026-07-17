"use client";

import React, { useState } from "react";
import { 
  Layers, 
  Code, 
  AlertTriangle, 
  Info
} from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
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

export interface InspectorProps {
  /** Optional custom CSS class name */
  className?: string;
  /** Optional inline CSS styles (e.g. resizable width) */
  style?: React.CSSProperties;
}

/**
 * Inspector Coordinator Component: Delegates panel rendering to TableInspector, RelationInspector, CodePreviewTab, or ValidationTab based on active selections and tabs.
 */
export function Inspector({ className, style }: InspectorProps = {}) {
  const tables = useStore(state => state.tables);
  const relations = useStore(state => state.relations);
  const selectedTableId = useStore(state => state.selectedTableId);
  const selectedRelationId = useStore(state => state.selectedRelationId);

  const [activeTab, setActiveTab] = useState<string>("inspector");
  const [selectedColId, setSelectedColId] = useState<string | null>(null);

  const selectedTable = selectedTableId ? tables[selectedTableId] : null;
  const selectedRelation = selectedRelationId ? relations[selectedRelationId] : null;

  return (
    <aside style={style} className={cn("sidebar-panel bg-card text-card-foreground flex flex-col shrink-0 select-none border-l overflow-hidden", className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        {/* Inspector Header Tabs */}
        <div className="p-3 border-b flex items-center justify-between shrink-0">
          <TabsList className="grid w-full grid-cols-3 h-8 text-xs">
            <TabsTrigger value="inspector" className="gap-1 text-[11px] cursor-pointer">
              <Layers className="size-3.5" />
              Inspector
            </TabsTrigger>
            <TabsTrigger value="code" className="gap-1 text-[11px] cursor-pointer">
              <Code className="size-3.5" />
              Code
            </TabsTrigger>
            <TabsTrigger value="validation" className="gap-1 text-[11px] cursor-pointer">
              <AlertTriangle className="size-3.5" />
              Validation
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Selection Inspector */}
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
                Click on a table node or relationship line on the canvas to inspect and edit properties.
              </p>
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Code Preview Generator */}
        <TabsContent value="code" className="flex-1 overflow-hidden p-4 m-0 flex flex-col">
          <CodePreviewTab />
        </TabsContent>

        {/* Tab 3: Diagnostics & Validation */}
        <TabsContent value="validation" className="flex-1 overflow-y-auto p-4 m-0">
          <ValidationTab />
        </TabsContent>
      </Tabs>
    </aside>
  );
}
