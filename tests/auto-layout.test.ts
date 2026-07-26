import { describe, it, expect } from "vitest";
import { getLayoutedElements, calculateTableDimensions } from "@/lib/auto-layout";
import { Table, Relation } from "@/packages/schema-core";

describe("Auto Layout Engine", () => {
    it("calculates dynamic table node dimensions accurately", () => {
        const mockTable: Table = {
            id: "table_users",
            name: "users",
            position: { x: 0, y: 0 },
            columns: [
                {
                    id: "col_1",
                    name: "id",
                    type: "INTEGER",
                    constraints: { isPrimaryKey: true, isNullable: false, isUnique: true, isAutoIncrement: true },
                },
                {
                    id: "col_2",
                    name: "email",
                    type: "VARCHAR",
                    constraints: { isPrimaryKey: false, isNullable: false, isUnique: true, isAutoIncrement: false },
                },
            ],
            indexes: [],
        };

        const dims = calculateTableDimensions(mockTable);
        expect(dims.width).toBe(300);
        expect(dims.height).toBe(50 + 2 * 38 + 0 * 28 + 20);
    });

    it("arranges parent and child tables without overlap in Left-to-Right layout", () => {
        const tables: Record<string, Table> = {
            users: {
                id: "users",
                name: "users",
                position: { x: 0, y: 0 },
                columns: [
                    { id: "c1", name: "id", type: "INTEGER", constraints: { isPrimaryKey: true, isNullable: false, isUnique: true, isAutoIncrement: true } },
                ],
            },
            orders: {
                id: "orders",
                name: "orders",
                position: { x: 0, y: 0 },
                columns: [
                    { id: "o1", name: "id", type: "INTEGER", constraints: { isPrimaryKey: true, isNullable: false, isUnique: true, isAutoIncrement: true } },
                    { id: "o2", name: "user_id", type: "INTEGER", constraints: { isPrimaryKey: false, isNullable: false, isUnique: false, isAutoIncrement: false } },
                ],
            },
        };

        const relations: Record<string, Relation> = {
            rel_1: {
                id: "rel_1",
                sourceTableId: "users",
                sourceColumnId: "c1",
                targetTableId: "orders",
                targetColumnId: "o2",
                type: "one-to-many",
            },
        };

        const layouted = getLayoutedElements(tables, relations, "LR");

        expect(layouted.users).toBeDefined();
        expect(layouted.orders).toBeDefined();

        // Parent table (users) should be at rank 0 (left), child table (orders) at rank 1 (right)
        expect(layouted.orders.position.x).toBeGreaterThan(layouted.users.position.x);
    });
});
