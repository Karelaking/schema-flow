import { describe, it, expect, beforeEach } from "vitest";
import { useStore } from "@/lib/store";

describe("ProjectStore Edge Cases", () => {
  beforeEach(() => {
    // Reset store state before each test
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
      selectedTableId: null,
      selectedRelationId: null,
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

    // Add new column
    const colId = useStore.getState().addColumn(tableId, {
      name: "price",
      type: "DECIMAL",
      constraints: { isPrimaryKey: false, isNullable: false, isUnique: false, isAutoIncrement: false }
    });

    let table = useStore.getState().tables[tableId];
    expect(table.columns.some(c => c.id === colId && c.name === "price")).toBe(true);

    // Update column
    useStore.getState().updateColumn(tableId, colId, { name: "unit_price", type: "NUMERIC" });
    table = useStore.getState().tables[tableId];
    const updatedCol = table.columns.find(c => c.id === colId);
    expect(updatedCol?.name).toBe("unit_price");
    expect(updatedCol?.type).toBe("NUMERIC");

    // Delete column
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
    expect(useStore.getState().selectedTableId).toBeNull();
  });

  it("should manage Undo and Redo history stack correctly", () => {
    expect(useStore.getState().past.length).toBe(0);

    const t1 = useStore.getState().addTable("table_1", 0, 0);
    expect(useStore.getState().past.length).toBe(1);

    const t2 = useStore.getState().addTable("table_2", 100, 100);
    expect(useStore.getState().past.length).toBe(2);

    // Undo
    useStore.getState().undo();
    expect(useStore.getState().tables[t2]).toBeUndefined();
    expect(useStore.getState().tables[t1]).toBeDefined();
    expect(useStore.getState().future.length).toBe(1);

    // Redo
    useStore.getState().redo();
    expect(useStore.getState().tables[t2]).toBeDefined();
    expect(useStore.getState().future.length).toBe(0);
  });
});
