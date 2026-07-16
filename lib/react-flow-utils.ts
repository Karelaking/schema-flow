import { Table, Relation } from "@/packages/schema-core";
import { TableNode, RelationEdge } from "@/types";
import { MarkerType } from "@xyflow/react";

/**
 * Converts Schema AST Table records into React Flow Nodes.
 */
export function convertTablesToNodes(
  tables: Record<string, Table>,
  selectedTableId: string | null
): TableNode[] {
  return Object.values(tables).map(table => ({
    id: table.id,
    type: "table",
    position: table.position,
    selected: table.id === selectedTableId,
    data: {
      table,
      selectedColumnId: null
    }
  }));
}

/**
 * Converts Schema AST Relation records into React Flow Edges with cardinality styles.
 */
export function convertRelationsToEdges(
  relations: Record<string, Relation>,
  selectedRelationId: string | null
): RelationEdge[] {
  return Object.values(relations).map(rel => {
    const isSelected = rel.id === selectedRelationId;
    
    return {
      id: rel.id,
      source: rel.sourceTableId,
      target: rel.targetTableId,
      sourceHandle: `col-right-${rel.sourceColumnId}`,
      targetHandle: `col-left-${rel.targetColumnId}`,
      type: "smoothstep",
      selected: isSelected,
      animated: isSelected, // Premium detail: animate selected edges!
      style: {
        strokeWidth: isSelected ? 3 : 1.5,
        stroke: isSelected ? "#3b82f6" : "#64748b",
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 15,
        height: 15,
        color: isSelected ? "#3b82f6" : "#64748b"
      }
    };
  });
}
