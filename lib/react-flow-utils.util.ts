import { Table, Relation } from "@/packages/schema-core";
import { TableNode, RelationEdge } from "@/types";
import { MarkerType } from "@xyflow/react";

/**
 * Foreign key resolution result interface.
 */
export interface ResolvedRelationFK {
    fkTableId: string;
    fkColumnId: string;
    pkTableId: string;
    pkColumnId: string;
}

/**
 * Resolves which table and column hold the Foreign Key constraint
 * versus the referenced Primary Key.
 * @param rel Relation definition.
 * @param tables Record of tables.
 * @returns Resolved foreign key interface.
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
 * @param tables Record of tables.
 * @param selectedTableId Currently selected table ID.
 * @returns Array of React Flow TableNodes.
 */
export function convertTablesToNodes(
    tables: Record<string, Table>,
    selectedTableId?: string
): TableNode[] {
    return Object.values(tables).map(table => ({
        id: table.id,
        type: "table",
        position: table.position,
        selected: table.id === selectedTableId,
        data: {
            table,
            selectedColumnId: undefined
        }
    }));
}

/**
 * Converts Schema AST Relation records into React Flow Edges with cardinality styles.
 * @param relations Record of relations.
 * @param selectedRelationId Currently selected relation ID.
 * @returns Array of React Flow RelationEdges.
 */
export function convertRelationsToEdges(
    relations: Record<string, Relation>,
    selectedRelationId?: string
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
            animated: isSelected,
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
