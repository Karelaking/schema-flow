import React, { useState, useCallback, useMemo } from "react";
import {
    ReactFlow,
    Background,
    NodeChange,
    EdgeChange,
    Connection,
    BackgroundVariant,
    useReactFlow,
    Node,
    Edge,
    OnNodeDrag,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useStore } from "@/lib/store";
import { useAIStore } from "@/lib/ai-store";
import { useTheme } from "@/providers/ThemeProvider";
import { convertTablesToNodes, convertRelationsToEdges } from "@/lib/react-flow-utils";
import { TableNode } from "./TableNode";
import { CanvasContextMenu } from "./CanvasContextMenu";
import { CommentDialog } from "@/components/modals/CommentDialog";
import { EditTableInfoDialog } from "@/components/modals/EditTableInfoDialog";

const nodeTypes = {
    table: TableNode
};

/**
 * Inner React Flow canvas rendering nodes, edges, background, controls, context menu, and dialogs.
 */
export const CanvasInner: React.FC = (): React.ReactElement => {
    const { theme } = useTheme();
    const { screenToFlowPosition } = useReactFlow();
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

    const [menuState, setMenuState] = useState<{
        x: number;
        y: number;
        flowPosition: { x: number; y: number };
        targetType: "pane" | "node" | "edge";
        targetId?: string;
    } | null>(null);

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
                if (change.type === "select") {
                    selectTable(change.selected ? change.id : undefined);
                }
                if (change.type === "remove") {
                    deleteTable(change.id);
                }
            });
        },
        [selectTable, deleteTable]
    );

    const onNodeDragStop = useCallback(
        (_event: React.MouseEvent | MouseEvent | TouchEvent, node: Node, draggedNodes: Node[]) => {
            const targets = draggedNodes && draggedNodes.length > 0 ? draggedNodes : [node];
            targets.forEach(n => {
                if (n && n.position) {
                    updateTablePosition(n.id, n.position.x, n.position.y);
                }
            });
        },
        [updateTablePosition]
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
        setMenuState(null);
    }, [selectTable, selectRelation]);

    const onPaneContextMenu = useCallback((event: MouseEvent | React.MouseEvent) => {
        event.preventDefault();
        const flowPosition = screenToFlowPosition({ x: event.clientX, y: event.clientY });
        setMenuState({
            x: event.clientX,
            y: event.clientY,
            flowPosition,
            targetType: "pane",
        });
    }, [screenToFlowPosition]);

    const onNodeContextMenu = useCallback((event: MouseEvent | React.MouseEvent, node: Node) => {
        event.preventDefault();
        selectTable(node.id);
        const flowPosition = screenToFlowPosition({ x: event.clientX, y: event.clientY });
        setMenuState({
            x: event.clientX,
            y: event.clientY,
            flowPosition,
            targetType: "node",
            targetId: node.id,
        });
    }, [screenToFlowPosition, selectTable]);

    const onEdgeContextMenu = useCallback((event: MouseEvent | React.MouseEvent, edge: Edge) => {
        event.preventDefault();
        selectRelation(edge.id);
        const flowPosition = screenToFlowPosition({ x: event.clientX, y: event.clientY });
        setMenuState({
            x: event.clientX,
            y: event.clientY,
            flowPosition,
            targetType: "edge",
            targetId: edge.id,
        });
    }, [screenToFlowPosition, selectRelation]);

    return (
        <div className="w-full h-full bg-background relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeDragStart={() => {
                    pushHistory();
                    setMenuState(null);
                }}
                onNodeDragStop={onNodeDragStop}
                onMoveStart={() => setMenuState(null)}
                onPaneClick={onPaneClick}
                onPaneContextMenu={onPaneContextMenu}
                onNodeContextMenu={onNodeContextMenu}
                onEdgeContextMenu={onEdgeContextMenu}
                onlyRenderVisibleElements={true}
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
                proOptions={{ hideAttribution: true }}
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={20}
                    size={1.5}
                    color={theme === "dark" ? "#475569" : "#94a3b8"}
                />
            </ReactFlow>

            {menuState && (
                <CanvasContextMenu
                    x={menuState.x}
                    y={menuState.y}
                    flowPosition={menuState.flowPosition}
                    targetType={menuState.targetType}
                    targetId={menuState.targetId}
                    onClose={() => setMenuState(null)}
                />
            )}

            <CommentDialog />
            <EditTableInfoDialog />
        </div>
    );
};