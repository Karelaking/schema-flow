import { create } from "zustand";
import { Table, Relation, Column, Index, IndexColumn, DatabaseDialect, SchemaAST, EnumDefinition } from "@/packages/schema-core";
import { CanvasHistoryState, ProjectStore } from "@/types/store.interface";

export const useStore = create<ProjectStore>((set, get) => ({
  // Initial state
  projectId: null,
  projectName: "",
  projectDescription: "",
  dialect: "sqlite",

  theme: "dark",
  autoAddId: true,
  autoAddTimestamps: true,
  tables: {},
  relations: {},
  enums: {},
  showLeftSidebar: true,
  showRightSidebar: true,
  selectedTableId: null,
  selectedRelationId: null,
  past: [],
  future: [],

  toggleLeftSidebar: (): void => set(state => ({ showLeftSidebar: !state.showLeftSidebar })),
  toggleRightSidebar: (): void => set(state => ({ showRightSidebar: !state.showRightSidebar })),
  setLeftSidebar: (showLeftSidebar): void => set({ showLeftSidebar }),
  setRightSidebar: (showRightSidebar): void => set({ showRightSidebar }),

  loadProject: (ast): void => {
    set({
      projectId: ast.project.id,
      projectName: ast.project.name,
      projectDescription: ast.project.description || "",
      dialect: ast.settings.dialect,
      theme: ast.settings.theme,
      autoAddId: ast.settings.autoAddId ?? true,
      autoAddTimestamps: ast.settings.autoAddTimestamps ?? true,
      tables: ast.tables || {},
      relations: ast.relations || {},
      enums: ast.enums || {},
      selectedTableId: null,
      selectedRelationId: null,
      past: [],
      future: []
    });
  },

  setProjectDetails: (name, description, dialect): void => {
    get().pushHistory();
    set({
      projectName: name,
      projectDescription: description,
      dialect
    });
  },

  setTheme: (theme): void => {
    set({ theme });
  },

  setAutoAddId: (autoAddId): void => set({ autoAddId }),
  setAutoAddTimestamps: (autoAddTimestamps): void => set({ autoAddTimestamps }),

  // History helper
  pushHistory: () : void => {
    const { tables, relations, enums, past } = get();
    // Stringify deep copy to avoid object reference mutations
    const snap: CanvasHistoryState = JSON.parse(JSON.stringify({ tables, relations, enums }));
    
    // Limit stack size to 50 items
    const newPast = past.length >= 50 ? past.slice(1) : past;
    
    set({
      past: [...newPast, snap],
      future: []
    });
  },

  undo: (): void => {
    const { past, future, tables, relations, enums } = get();
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    const currentSnap: CanvasHistoryState = JSON.parse(JSON.stringify({ tables, relations, enums }));

    set({
      tables: previous.tables,
      relations: previous.relations,
      enums: previous.enums,
      past: newPast,
      future: [currentSnap, ...future],
      selectedTableId: null,
      selectedRelationId: null
    });
  },

  redo: (): void => {
    const { past, future, tables, relations, enums } = get();
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);
    const currentSnap: CanvasHistoryState = JSON.parse(JSON.stringify({ tables, relations, enums }));

    set({
      tables: next.tables,
      relations: next.relations,
      enums: next.enums,
      past: [...past, currentSnap],
      future: newFuture,
      selectedTableId: null,
      selectedRelationId: null
    });
  },

  clearHistory: (): void => {
    set({ past: [], future: [] });
  },

  // Table actions
  addTable: (name: string, x: number, y: number):string => {
    get().pushHistory();
    const uniqueSuffix = Math.random().toString(36).substring(2, 7);
    const id = `table-${Date.now()}-${uniqueSuffix}`;
    const autoAddId = get().autoAddId ?? true;
    const autoAddTimestamps = get().autoAddTimestamps ?? true;

    const columns: Column[] = [];
    const now = Date.now();

    if (autoAddId) {
      columns.push({
        id: `col-${now}-id-${uniqueSuffix}`,
        name: "id",
        type: "INTEGER",
        constraints: {
          isPrimaryKey: true,
          isNullable: false,
          isUnique: false,
          isAutoIncrement: true
        }
      });
    }

    if (autoAddTimestamps) {
      columns.push(
        {
          id: `col-${now}-created_at`,
          name: "created_at",
          type: "TIMESTAMP",
          constraints: {
            isPrimaryKey: false,
            isNullable: false,
            isUnique: false,
            isAutoIncrement: false,
            defaultValue: "CURRENT_TIMESTAMP"
          }
        },
        {
          id: `col-${now}-updated_at`,
          name: "updated_at",
          type: "TIMESTAMP",
          constraints: {
            isPrimaryKey: false,
            isNullable: false,
            isUnique: false,
            isAutoIncrement: false,
            defaultValue: "CURRENT_TIMESTAMP"
          }
        }
      );
    }

    const existingTables = Object.values(get().tables);
    const count = existingTables.length;
    const finalX = (x === 0 && y === 0) ? 60 + (count % 3) * 340 : x;
    const finalY = (x === 0 && y === 0) ? 60 + Math.floor(count / 3) * 260 : y;

    const newTable: Table = {
      id,
      name,
      description: "",
      color: "#3b82f6", // Default blue
      position: { x: finalX, y: finalY },
      columns,
      indexes: []
    };

    set(state => ({
      tables: { ...state.tables, [id]: newTable },
      selectedTableId: id,
      selectedRelationId: null
    }));

    return id;
  },

  updateTable: (id, updates): void => {
    get().pushHistory();
    set(state => {
      const table = state.tables[id];
      if (!table) return state;

      return {
        tables: {
          ...state.tables,
          [id]: { ...table, ...updates }
        }
      };
    });
  },

  updateTablePosition: (id, x, y): void => {
    // Note: Position updates do not push to history directly, 
    // instead pushHistory is called on drag start / end from the UI.
    set(state => {
      const table = state.tables[id];
      if (!table) return state;

      return {
        tables: {
          ...state.tables,
          [id]: {
            ...table,
            position: { x, y }
          }
        }
      };
    });
  },

  deleteTable: (id): void => {
    get().pushHistory();
    set(state => {
      const newTables = { ...state.tables };
      delete newTables[id];

      // Remove any relationships referencing this table
      const newRelations = { ...state.relations };
      for (const relId in newRelations) {
        const rel = newRelations[relId];
        if (rel.sourceTableId === id || rel.targetTableId === id) {
          delete newRelations[relId];
        }
      }

      return {
        tables: newTables,
        relations: newRelations,
        selectedTableId: state.selectedTableId === id ? null : state.selectedTableId
      };
    });
  },

  duplicateTable: (id): void => {
    get().pushHistory();
    const sourceTable = get().tables[id];
    if (!sourceTable) return;

    const newId = `table-${Date.now()}`;
    const duplicatedTable: Table = JSON.parse(JSON.stringify(sourceTable));
    duplicatedTable.id = newId;
    duplicatedTable.name = `${sourceTable.name}_copy`;
    duplicatedTable.position.x += 40;
    duplicatedTable.position.y += 40;

    // Regereate column IDs to ensure uniqueness
    duplicatedTable.columns = duplicatedTable.columns.map(col => ({
      ...col,
      id: `col-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    }));

    set(state => ({
      tables: { ...state.tables, [newId]: duplicatedTable },
      selectedTableId: newId,
      selectedRelationId: null
    }));
  },

  // Column actions
  addColumn: (tableId, col): string => {
    get().pushHistory();
    const colId = `col-${Date.now()}`;
    const newCol: Column = {
      ...col,
      id: colId
    };

    set(state => {
      const table = state.tables[tableId];
      if (!table) return state;

      // Find the insertion index: after the auto-id column but before
      // the auto-generated timestamp columns (created_at / updated_at).
      // This keeps the order: [id, ...user fields..., created_at, updated_at]
      const columns = [...table.columns];
      const timestampNames = new Set(["created_at", "updated_at"]);

      // Find where the trailing timestamp block starts
      let insertIndex = columns.length;
      for (let i = columns.length - 1; i >= 0; i--) {
        if (timestampNames.has(columns[i].name)) {
          insertIndex = i;
        } else {
          break;
        }
      }

      // If insertIndex is 0 (no id column found either), just insert at the end
      // Otherwise insert right before the timestamps
      columns.splice(insertIndex, 0, newCol);

      return {
        tables: {
          ...state.tables,
          [tableId]: {
            ...table,
            columns
          }
        }
      };
    });

    return colId;
  },

  updateColumn: (tableId, colId, updates): void => {
    get().pushHistory();
    set(state => {
      const table = state.tables[tableId];
      if (!table) return state;

      const newCols = table.columns.map(col => {
        if (col.id === colId) {
          const mergedConstraints = {
            ...col.constraints,
            ...(updates.constraints || {})
          };

          // If defaultValue is provided and non-empty, automatically set isNullable to false
          const hasDefault = mergedConstraints.defaultValue !== undefined &&
            mergedConstraints.defaultValue !== null &&
            mergedConstraints.defaultValue.trim() !== "";

          if (hasDefault) {
            mergedConstraints.isNullable = false;
          }

          return {
            ...col,
            ...updates,
            constraints: mergedConstraints
          };
        }
        return col;
      });

      return {
        tables: {
          ...state.tables,
          [tableId]: {
            ...table,
            columns: newCols
          }
        }
      };
    });
  },

  deleteColumn: (tableId, colId): void => {
    get().pushHistory();
    set(state => {
      const table = state.tables[tableId];
      if (!table) return state;

      const newCols = table.columns.filter(col => col.id !== colId);

      // Clean up relations referencing this column
      const newRelations = { ...state.relations };
      for (const relId in newRelations) {
        const rel = newRelations[relId];
        if (
          (rel.sourceTableId === tableId && rel.sourceColumnId === colId) ||
          (rel.targetTableId === tableId && rel.targetColumnId === colId)
        ) {
          delete newRelations[relId];
        }
      }

      return {
        tables: {
          ...state.tables,
          [tableId]: {
            ...table,
            columns: newCols
          }
        },
        relations: newRelations
      };
    });
  },

  reorderColumns: (tableId, columns): void => {
    get().pushHistory();
    set(state => {
      const table = state.tables[tableId];
      if (!table) return state;

      return {
        tables: {
          ...state.tables,
          [tableId]: { ...table, columns }
        }
      };
    });
  },

  addIndex: (tableId, name, columns, isUnique): string => {
    get().pushHistory();
    const indexId = `idx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    set(state => {
      const table = state.tables[tableId];
      if (!table) return state;
      const indexes = table.indexes || [];
      const newIndex: Index = { id: indexId, name, columns, isUnique };
      return {
        tables: {
          ...state.tables,
          [tableId]: { ...table, indexes: [...indexes, newIndex] }
        }
      };
    });
    return indexId;
  },

  updateIndex: (tableId, indexId, updates): void => {
    get().pushHistory();
    set(state => {
      const table = state.tables[tableId];
      if (!table || !table.indexes) return state;
      const indexes = table.indexes.map(idx => idx.id === indexId ? { ...idx, ...updates } : idx);
      return {
        tables: {
          ...state.tables,
          [tableId]: { ...table, indexes }
        }
      };
    });
  },

  deleteIndex: (tableId, indexId): void => {
    get().pushHistory();
    set(state => {
      const table = state.tables[tableId];
      if (!table || !table.indexes) return state;
      const indexes = table.indexes.filter(idx => idx.id !== indexId);
      return {
        tables: {
          ...state.tables,
          [tableId]: { ...table, indexes }
        }
      };
    });
  },

  autoLayoutTables: (): void => {
    get().pushHistory();
    set(state => {
      const tableList = Object.values(state.tables);
      if (tableList.length === 0) return state;

      const cols = Math.max(2, Math.ceil(Math.sqrt(tableList.length)));
      const colWidth = 340;
      const rowHeight = 260;
      const marginX = 60;
      const marginY = 60;

      const updatedTables = { ...state.tables };
      tableList.forEach((tbl, idx) => {
        const gridCol = idx % cols;
        const gridRow = Math.floor(idx / cols);
        updatedTables[tbl.id] = {
          ...tbl,
          position: {
            x: marginX + gridCol * colWidth,
            y: marginY + gridRow * rowHeight
          }
        };
      });

      return { tables: updatedTables };
    });
  },

  // Relationship actions
  addRelation: (rel): string => {
    get().pushHistory();
    const id = `relation-${Date.now()}`;
    const newRelation: Relation = {
      ...rel,
      id
    };

    set(state => ({
      relations: { ...state.relations, [id]: newRelation },
      selectedRelationId: id,
      selectedTableId: null
    }));

    return id;
  },

  updateRelation: (id, updates): void => {
    get().pushHistory();
    set(state => {
      const rel = state.relations[id];
      if (!rel) return state;

      return {
        relations: {
          ...state.relations,
          [id]: { ...rel, ...updates }
        }
      };
    });
  },

  deleteRelation: (id): void => {
    get().pushHistory();
    set(state => {
      const newRelations = { ...state.relations };
      delete newRelations[id];

      return {
        relations: newRelations,
        selectedRelationId: state.selectedRelationId === id ? null : state.selectedRelationId
      };
    });
  },

  // Enum actions
  addEnum: (name, values): string => {
    get().pushHistory();
    const id = `enum-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newEnum: EnumDefinition = {
      id,
      name,
      values,
    };

    set(state => ({
      enums: { ...state.enums, [id]: newEnum }
    }));

    return id;
  },

  updateEnum: (id, updates): void => {
    get().pushHistory();
    set(state => {
      const enumDef = state.enums[id];
      if (!enumDef) return state;

      return {
        enums: {
          ...state.enums,
          [id]: { ...enumDef, ...updates }
        }
      };
    });
  },

  deleteEnum: (id): void => {
    get().pushHistory();
    set(state => {
      const newEnums = { ...state.enums };
      delete newEnums[id];

      // Clear enumId from any columns that reference this enum
      const newTables = { ...state.tables };
      for (const tableId in newTables) {
        const table = newTables[tableId];
        const hasEnumCol = table.columns.some(col => col.enumId === id);
        if (hasEnumCol) {
          newTables[tableId] = {
            ...table,
            columns: table.columns.map(col =>
              col.enumId === id
                ? { ...col, type: "VARCHAR", enumId: undefined }
                : col
            )
          };
        }
      }

      return { enums: newEnums, tables: newTables };
    });
  },

  // Selection actions
  selectTable: (id): void => {
    set({
      selectedTableId: id,
      selectedRelationId: null
    });
  },

  selectRelation: (id): void => {
    set({
      selectedRelationId: id,
      selectedTableId: null
    });
  }
}));
