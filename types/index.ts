import { Table, Relation } from "@/packages/schema-core";
import { Node, Edge } from "@xyflow/react";

export interface TableNodeData extends Record<string, unknown> {
  table: Table;
  selectedColumnId: string | null;
}

export type TableNode = Node<TableNodeData, 'table'>;
export type RelationEdge = Edge;

export interface CanvasHistoryState {
  tables: Record<string, Table>;
  relations: Record<string, Relation>;
}
