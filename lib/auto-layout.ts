import { Table, Relation } from "@/packages/schema-core";

/**
 * Direction orientation for the automatic graph layout.
 */
export type LayoutDirection = "LR" | "TB";

/**
 * Dynamic calculated dimensions for a table node.
 */
export interface TableDimensions {
    width: number;
    height: number;
}

/**
 * Calculates dynamic pixel dimensions for a table node based on its column and index count.
 * @param table Target table.
 * @returns Calculated width and height in pixels.
 */
export const calculateTableDimensions = (table: Table): TableDimensions => {
    const width = 300;
    const columnCount = table.columns ? table.columns.length : 0;
    const indexCount = table.indexes ? table.indexes.length : 0;
    const height = 50 + columnCount * 38 + indexCount * 28 + 20;

    return { width, height };
};

/**
 * Computes dynamic, relationship-aware hierarchical layout positions for schema tables.
 * @param tables Map of table objects keyed by ID.
 * @param relations Map of relation objects keyed by ID.
 * @param direction Layout orientation ("LR" for Left-to-Right, "TB" for Top-to-Bottom).
 * @returns Updated map of table objects with calculated (x, y) coordinates.
 */
export const getLayoutedElements = (
    tables: Record<string, Table>,
    relations: Record<string, Relation>,
    direction: LayoutDirection = "LR"
): Record<string, Table> => {
    const tableList = Object.values(tables);
    if (tableList.length === 0) {
        return {};
    }

    const relationList = Object.values(relations);

    // Build adjacency maps and calculate in-degrees
    const inDegree: Record<string, number> = {};
    const childrenMap: Record<string, string[]> = {};

    tableList.forEach(t => {
        inDegree[t.id] = 0;
        childrenMap[t.id] = [];
    });

    relationList.forEach(rel => {
        if (tables[rel.sourceTableId] && tables[rel.targetTableId]) {
            childrenMap[rel.sourceTableId].push(rel.targetTableId);
            inDegree[rel.targetTableId] = (inDegree[rel.targetTableId] || 0) + 1;
        }
    });

    // Compute topological ranks (depth levels)
    const ranks: Record<string, number> = {};
    const visited = new Set<string>();

    // Initialize root nodes (inDegree === 0) at rank 0
    const queue: string[] = [];
    tableList.forEach(t => {
        if (inDegree[t.id] === 0) {
            ranks[t.id] = 0;
            queue.push(t.id);
            visited.add(t.id);
        }
    });

    // Handle potential cycles or disconnected components
    if (queue.length === 0 && tableList.length > 0) {
        ranks[tableList[0].id] = 0;
        queue.push(tableList[0].id);
        visited.add(tableList[0].id);
    }

    // BFS to assign hierarchy ranks
    while (queue.length > 0) {
        const currentId = queue.shift()!;
        const currentRank = ranks[currentId] || 0;

        const children = childrenMap[currentId] || [];
        children.forEach(childId => {
            const newRank = currentRank + 1;
            if (!visited.has(childId) || newRank > (ranks[childId] || 0)) {
                ranks[childId] = newRank;
                visited.add(childId);
                queue.push(childId);
            }
        });
    }

    // Fallback for any unvisited isolated nodes
    tableList.forEach(t => {
        if (ranks[t.id] === undefined) {
            ranks[t.id] = 0;
        }
    });

    // Group tables into layers by rank
    const maxRank = Math.max(...Object.values(ranks), 0);
    const layers: Table[][] = Array.from({ length: maxRank + 1 }, () => []);

    tableList.forEach(t => {
        const rank = ranks[t.id] || 0;
        layers[rank].push(t);
    });

    const updatedTables: Record<string, Table> = {};
    const START_X = 100;
    const START_Y = 100;

    if (direction === "LR") {
        const COLUMN_SPACING = 120;
        const ROW_SPACING = 40;

        let currentX = START_X;

        layers.forEach(layer => {
            let currentY = START_Y;
            let maxLayerWidth = 0;

            layer.forEach(table => {
                const { width, height } = calculateTableDimensions(table);
                maxLayerWidth = Math.max(maxLayerWidth, width);

                updatedTables[table.id] = {
                    ...table,
                    position: {
                        x: currentX,
                        y: currentY,
                    },
                };

                currentY += height + ROW_SPACING;
            });

            currentX += maxLayerWidth + COLUMN_SPACING;
        });
    }
    else {
        // Top-to-Bottom ("TB")
        const ROW_SPACING = 60;
        const COLUMN_SPACING = 40;

        let currentY = START_Y;

        layers.forEach(layer => {
            let currentX = START_X;
            let maxLayerHeight = 0;

            layer.forEach(table => {
                const { width, height } = calculateTableDimensions(table);
                maxLayerHeight = Math.max(maxLayerHeight, height);

                updatedTables[table.id] = {
                    ...table,
                    position: {
                        x: currentX,
                        y: currentY,
                    },
                };

                currentX += width + COLUMN_SPACING;
            });

            currentY += maxLayerHeight + ROW_SPACING;
        });
    }

    return updatedTables;
};
