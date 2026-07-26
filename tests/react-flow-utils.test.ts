import { describe, it, expect } from "vitest";
import { convertRelationsToEdges } from "@/lib/react-flow-utils.util";
import { Table, Relation } from "@/packages/schema-core";

describe("convertRelationsToEdges", () => {
    it("resolves edges correctly when relations reference column IDs", () => {
        const tables: Record<string, Table> = {
            t1: {
                id: "t1",
                name: "users",
                position: { x: 0, y: 0 },
                columns: [{ id: "c1", name: "id", type: "INTEGER", constraints: { isPrimaryKey: true, isNullable: false, isUnique: true, isAutoIncrement: true } }],
            },
            t2: {
                id: "t2",
                name: "orders",
                position: { x: 100, y: 100 },
                columns: [{ id: "c2", name: "user_id", type: "INTEGER", constraints: { isPrimaryKey: false, isNullable: false, isUnique: false, isAutoIncrement: false } }],
            },
        };

        const relations: Record<string, Relation> = {
            r1: {
                id: "r1",
                sourceTableId: "t1",
                sourceColumnId: "c1",
                targetTableId: "t2",
                targetColumnId: "c2",
                type: "one-to-many",
            },
        };

        const edges = convertRelationsToEdges(relations, tables);
        expect(edges).toHaveLength(1);
        expect(edges[0].sourceHandle).toBe("col-right-c1");
        expect(edges[0].targetHandle).toBe("col-left-c2");
    });

    it("resolves edges correctly when relations reference column names instead of IDs", () => {
        const tables: Record<string, Table> = {
            t1: {
                id: "t1",
                name: "users",
                position: { x: 0, y: 0 },
                columns: [{ id: "c1_generated_id", name: "id", type: "INTEGER", constraints: { isPrimaryKey: true, isNullable: false, isUnique: true, isAutoIncrement: true } }],
            },
            t2: {
                id: "t2",
                name: "orders",
                position: { x: 100, y: 100 },
                columns: [{ id: "c2_generated_user_id", name: "user_id", type: "INTEGER", constraints: { isPrimaryKey: false, isNullable: false, isUnique: false, isAutoIncrement: false } }],
            },
        };

        const relations: Record<string, Relation> = {
            r1: {
                id: "r1",
                sourceTableId: "users",
                sourceColumnId: "id",
                targetTableId: "orders",
                targetColumnId: "user_id",
                type: "one-to-many",
            },
        };

        const edges = convertRelationsToEdges(relations, tables);
        expect(edges).toHaveLength(1);
        expect(edges[0].source).toBe("t1");
        expect(edges[0].target).toBe("t2");
        expect(edges[0].sourceHandle).toBe("col-right-c1_generated_id");
        expect(edges[0].targetHandle).toBe("col-left-c2_generated_user_id");
    });
});
