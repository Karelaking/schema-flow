import React, { useCallback, useMemo } from "react";
import {
    ReactFlow,
    Background,
    NodeChange,
    EdgeChange,
    Connection,
    BackgroundVariant
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useStore } from "@/lib/store";
import { useAIStore } from "@/lib/ai-store";
import { useTheme } from "@/providers/ThemeProvider";
import { convertTablesToNodes, convertRelationsToEdges } from "@/lib/react-flow-utils";
import { TableNode } from "./TableNode";

const nodeTypes = {
    table: TableNode
};

/**
 * Inner React Flow canvas rendering nodes, edges, background, and controls.
 */
export const CanvasInner: React.FC = (): React.ReactElement => {
    const { theme } = useTheme();
    const tables = useStore(state => state.tables);
    const relations = useStore(state => state.relations);
    const selectedTableId = useStore(state => state.selectedTableId);
    const selectedRelationId = useStore(state => state.selectedRelationId);
    const pendingPatch = useAIStore(state => state.pendingPatch);

    const activeTables = pendingPatch ? pendingPatch.proposedAST.tables : tables;
    const activeRelations = pendingPatch ? pendingPatch.proposedAST.relations : relations;

    const updateTablePosition = useStore(state => state.updateTablePosition);
    const selectTable = useStore(state => state.selectTable);
    const deleteTable = useStore(state => state.deleteTable);
    const selectRelation = useStore(state => state.selectRelation);
    const addRelation = useStore(state => state.addRelation);
    const deleteRelation = useStore(state => state.deleteRelation);
    const pushHistory = useStore(state => state.pushHistory);

    const nodes = useMemo(
        () => convertTablesToNodes(activeTables, selectedTableId),
        [activeTables, selectedTableId]
    );

    const edges = useMemo(
        () => convertRelationsToEdges(activeRelations, activeTables, selectedRelationId),
        [activeRelations, activeTables, selectedRelationId]
    );

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => {
            changes.forEach(change => {
                if (change.type === "position" && change.position) {
                    updateTablePosition(change.id, change.position.x, change.position.y);
                }
                if (change.type === "select") {
                    selectTable(change.selected ? change.id : undefined);
                }
                if (change.type === "remove") {
                    deleteTable(change.id);
                }
            });
        },
        [updateTablePosition, selectTable, deleteTable]
    );

    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => {
            changes.forEach(change => {
                if (change.type === "select") {
                    selectRelation(change.selected ? change.id : undefined);
                }
                if (change.type === "remove") {
                    deleteRelation(change.id);
                }
            });
        },
        [selectRelation, deleteRelation]
    );

    const onConnect = useCallback(
        (connection: Connection) => {
            if (!connection.sourceHandle || !connection.targetHandle) {
                return;
            }

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

    const onPaneClick = useCallback(() => {
        selectTable(undefined);
        selectRelation(undefined);
    }, [selectTable, selectRelation]);

    return (
        <div className="w-full h-full bg-background relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeDragStart={() => pushHistory()}
                onPaneClick={onPaneClick}
                colorMode={theme === "dark" ? "dark" : "light"}
                fitView
                snapToGrid
                snapGrid={[15, 15]}
                minZoom={0.05}
                maxZoom={2.5}
                defaultEdgeOptions={{
                    type: "smoothstep",
                    animated: true
                }}
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={20}
                    size={1.5}
                    color={theme === "dark" ? "#334155" : "#cbd5e1"}
                />
            </ReactFlow>
        </div>
    );
};