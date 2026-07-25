import { Table, Relation } from "@/packages/schema-core";
import { TableNode, RelationEdge } from "@/types";
import { MarkerType } from "@xyflow/react";

export interface ResolvedRelationFK {
  fkTableId: string;
  fkColumnId: string;
  pkTableId: string;
  pkColumnId: string;
}

/**
 * Resolves which table and column hold the Foreign Key constraint
 * versus the referenced Primary Key.
 *
 * Rules:
 * - If source column is PK and target is NOT PK -> Target holds the FK constraint.
 * - Otherwise (source is NOT PK, or both/neither are PK) -> Source holds the FK constraint.
 */
export function resolveRelationFK(
  rel: Relation,
  tables: Record<string, Table>
): ResolvedRelationFK {
  const sourceTable = tables[rel.sourceTableId];
  const targetTable = tables[rel.targetTableId];

  const sourceCol = sourceTable?.columns.find(c => c.id === rel.sourceColumnId);
  const targetCol = targetTable?.columns.find(c => c.id === rel.targetColumnId);

  const sourceIsPk = Boolean(sourceCol?.constraints?.isPrimaryKey);
  const targetIsPk = Boolean(targetCol?.constraints?.isPrimaryKey);

  if (sourceIsPk && !targetIsPk) {
    return {
      fkTableId: rel.targetTableId,
      fkColumnId: rel.targetColumnId,
      pkTableId: rel.sourceTableId,
      pkColumnId: rel.sourceColumnId,
    };
  }

  return {
    fkTableId: rel.sourceTableId,
    fkColumnId: rel.sourceColumnId,
    pkTableId: rel.targetTableId,
    pkColumnId: rel.targetColumnId,
  };
}

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

