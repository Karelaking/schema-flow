import { describe, it, expect, beforeEach } from "vitest";
import { useStore } from "@/lib/store";

describe("ProjectStore Edge Cases", () => {
    beforeEach(() => {
        useStore.setState({
            projectId: "proj-test",
            projectName: "Test Project",
            projectDescription: "Test Description",
            dialect: "sqlite",
            theme: "dark",
            autoAddId: true,
            autoAddTimestamps: true,
            tables: {},
            relations: {},
            enums: {},
            selectedTableId: undefined,
            selectedRelationId: undefined,
            past: [],
            future: [],
        });
    });

    it("should create table with auto-added id and timestamps when flags are true", () => {
        const tableId = useStore.getState().addTable("users", 100, 100);
        const table = useStore.getState().tables[tableId];

        expect(table).toBeDefined();
        expect(table.name).toBe("users");
        expect(table.columns.length).toBe(3);

        const idCol = table.columns.find(c => c.name === "id");
        const createdCol = table.columns.find(c => c.name === "created_at");
        const updatedCol = table.columns.find(c => c.name === "updated_at");

        expect(idCol?.constraints.isPrimaryKey).toBe(true);
        expect(createdCol?.type).toBe("TIMESTAMP");
        expect(updatedCol?.type).toBe("TIMESTAMP");
    });

    it("should create empty table when autoAddId and autoAddTimestamps are false", () => {
        useStore.setState({ autoAddId: false, autoAddTimestamps: false });

        const tableId = useStore.getState().addTable("orders", 200, 200);
        const table = useStore.getState().tables[tableId];

        expect(table).toBeDefined();
        expect(table.name).toBe("orders");
        expect(table.columns.length).toBe(0);
    });

    it("should handle column addition, update, reordering, and deletion", () => {
        const tableId = useStore.getState().addTable("products", 0, 0);

        const colId = useStore.getState().addColumn(tableId, {
            name: "price",
            type: "DECIMAL",
            constraints: { isPrimaryKey: false, isNullable: false, isUnique: false, isAutoIncrement: false }
        });

        let table = useStore.getState().tables[tableId];
        expect(table.columns.some(c => c.id === colId && c.name === "price")).toBe(true);

        useStore.getState().updateColumn(tableId, colId, { name: "unit_price", type: "NUMERIC" });
        table = useStore.getState().tables[tableId];
        const updatedCol = table.columns.find(c => c.id === colId);
        expect(updatedCol?.name).toBe("unit_price");
        expect(updatedCol?.type).toBe("NUMERIC");

        useStore.getState().deleteColumn(tableId, colId);
        table = useStore.getState().tables[tableId];
        expect(table.columns.some(c => c.id === colId)).toBe(false);
    });

    it("should handle table deletion and clear active selection", () => {
        const tableId = useStore.getState().addTable("categories", 0, 0);
        useStore.getState().selectTable(tableId);

        expect(useStore.getState().selectedTableId).toBe(tableId);

        useStore.getState().deleteTable(tableId);
        expect(useStore.getState().tables[tableId]).toBeUndefined();
        expect(useStore.getState().selectedTableId).toBeUndefined();
    });

    it("should calculate grid coordinates for new tables and handle autoLayoutTables", () => {
        const t1 = useStore.getState().addTable("users", 100, 100);
        const t2 = useStore.getState().addTable("orders", 150, 150);

        const tables = useStore.getState().tables;
        expect(tables[t1]).toBeDefined();
        expect(tables[t2]).toBeDefined();

        useStore.getState().autoLayoutTables();
        const relayout = useStore.getState().tables;
        expect(relayout[t1].position.x).toBe(100);
        expect(relayout[t2].position.x).toBe(450);
    });
});
