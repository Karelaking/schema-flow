"use client";

import React, { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  NodeChange,
  EdgeChange,
  Connection,
  ReactFlowProvider,
  BackgroundVariant
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useStore } from "@/lib/store";
import { convertTablesToNodes, convertRelationsToEdges } from "@/lib/react-flow-utils";
import { TableNode } from "./TableNode";

// Define custom node types
const nodeTypes = {
  table: TableNode
};

function CanvasInner() {
  const tables = useStore(state => state.tables);
  const relations = useStore(state => state.relations);
  const selectedTableId = useStore(state => state.selectedTableId);
  const selectedRelationId = useStore(state => state.selectedRelationId);
  const theme = useStore(state => state.theme);

  // Actions
  const updateTablePosition = useStore(state => state.updateTablePosition);
  const selectTable = useStore(state => state.selectTable);
  const selectRelation = useStore(state => state.selectRelation);
  const addRelation = useStore(state => state.addRelation);
  const deleteRelation = useStore(state => state.deleteRelation);
  const pushHistory = useStore(state => state.pushHistory);

  // Memoize converted nodes and edges
  const nodes = useMemo(
    () => convertTablesToNodes(tables, selectedTableId),
    [tables, selectedTableId]
  );
  
  const edges = useMemo(
    () => convertRelationsToEdges(relations, selectedRelationId),
    [relations, selectedRelationId]
  );

  // Synchronize node drag movements (SRP)
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      changes.forEach(change => {
        if (change.type === "position" && change.position) {
          updateTablePosition(change.id, change.position.x, change.position.y);
        }
        if (change.type === "select") {
          selectTable(change.selected ? change.id : null);
        }
      });
    },
    [updateTablePosition, selectTable]
  );

  // Synchronize edge selection/deletion (SRP)
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      changes.forEach(change => {
        if (change.type === "select") {
          selectRelation(change.selected ? change.id : null);
        }
        if (change.type === "remove") {
          deleteRelation(change.id);
        }
      });
    },
    [selectRelation, deleteRelation]
  );

  // Spawn new relationship on handle connections
  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.sourceHandle || !connection.targetHandle) return;

      const sourceColId = connection.sourceHandle.replace("col-right-", "");
      const targetColId = connection.targetHandle.replace("col-left-", "");

      addRelation({
        sourceTableId: connection.source,
        sourceColumnId: sourceColId,
        targetTableId: connection.target,
        targetColumnId: targetColId,
        type: "many-to-one",
        onDelete: "cascade",
        onUpdate: "restrict"
      });
    },
    [addRelation]
  );

  // Push to history when drag begins to capture undo coordinates
  const onNodeDragStart = useCallback(() => {
    pushHistory();
  }, [pushHistory]);

  const onPaneClick = useCallback(() => {
    selectTable(null);
    selectRelation(null);
  }, [selectTable, selectRelation]);

  return (
    <div className="flex-1 h-full bg-muted/10 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStart={onNodeDragStart}
        onPaneClick={onPaneClick}
        fitView
        className="w-full h-full"
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={16} 
          size={1} 
          color={theme === "dark" ? "#334155" : "#cbd5e1"} 
        />
        <Controls showInteractive={false} className="!bg-card !border-border !text-foreground" />
        <MiniMap 
          nodeColor={node => {
            const tableNode = node.data as { table?: { color?: string } } | undefined;
            return tableNode?.table?.color || "#3b82f6";
          }}
          maskColor={theme === "dark" ? "rgba(15, 23, 42, 0.6)" : "rgba(255, 255, 255, 0.6)"}
          className="!bg-card !border-border !text-foreground"
        />
      </ReactFlow>
    </div>
  );
}

export function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
export default Canvas;
