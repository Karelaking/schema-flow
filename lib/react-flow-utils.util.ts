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
 * Automatically resolves table and column references by ID or name to prevent missing handle edge failures.
 * @param relations Record of relations.
 * @param tables Record of tables.
 * @param selectedRelationId Currently selected relation ID.
 * @returns Array of React Flow RelationEdges.
 */
export function convertRelationsToEdges(
    relations: Record<string, Relation>,
    tables: Record<string, Table> = {},
    selectedRelationId?: string
): RelationEdge[] {
    if (!relations) {
        return [];
    }

    const tableList = Object.values(tables);
    const tableNameMap = new Map<string, Table>();
    for (const t of tableList) {
        if (t?.name) {
            tableNameMap.set(t.name, t);
        }
    }

    const edges: RelationEdge[] = [];

    for (const rel of Object.values(relations)) {
        if (!rel || !rel.sourceTableId || !rel.targetTableId) {
            continue;
        }

        const isSelected = rel.id === selectedRelationId;

        // Resolve source and target table objects (by ID or O(1) Map lookup)
        const sourceTable = tables[rel.sourceTableId] || tableNameMap.get(rel.sourceTableId);
        const targetTable = tables[rel.targetTableId] || tableNameMap.get(rel.targetTableId);

        const sourceTableId = sourceTable ? sourceTable.id : rel.sourceTableId;
        const targetTableId = targetTable ? targetTable.id : rel.targetTableId;

        // Resolve source and target columns (by ID or name)
        const sourceCol = sourceTable?.columns.find(c => c.id === rel.sourceColumnId || c.name === rel.sourceColumnId);
        const targetCol = targetTable?.columns.find(c => c.id === rel.targetColumnId || c.name === rel.targetColumnId);

        const sourceColId = sourceCol ? sourceCol.id : rel.sourceColumnId;
        const targetColId = targetCol ? targetCol.id : rel.targetColumnId;

        edges.push({
            id: rel.id,
            source: sourceTableId,
            target: targetTableId,
            sourceHandle: `col-right-${sourceColId}`,
            targetHandle: `col-left-${targetColId}`,
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
        });
    }

    return edges;
}
