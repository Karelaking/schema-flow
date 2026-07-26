import { Table } from "@/packages/schema-core";
import { Node, Edge } from "@xyflow/react";

/**
 * Data associated with React Flow Table Node.
 */
export interface TableNodeData extends Record<string, unknown> {
    table: Table;
    selectedColumnId?: string;
}

/**
 * Type alias for React Flow Table Node.
 */
export type TableNode = Node<TableNodeData, "table">;

/**
 * Type alias for React Flow Relation Edge.
 */
export type RelationEdge = Edge;

