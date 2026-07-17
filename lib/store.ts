import { create } from "zustand";
import { SchemaAST, Table, Relation, Column, DatabaseDialect } from "@/packages/schema-core";

export interface CanvasHistoryState {
  tables: Record<string, Table>;
  relations: Record<string, Relation>;
}

export interface ProjectStore {
  // Project details
  projectId: string | null;
  projectName: string;
  projectDescription: string;
  dialect: DatabaseDialect;
  theme: "dark" | "light";
  autoAddId: boolean;
  autoAddTimestamps: boolean;

  // Schema state
  tables: Record<string, Table>;
  relations: Record<string, Relation>;

  // UI Selection context
  selectedTableId: string | null;
  selectedRelationId: string | null;

  // Undo/Redo Stacks
  past: CanvasHistoryState[];
  future: CanvasHistoryState[];

  // General actions
  loadProject: (ast: SchemaAST) => void;
  setProjectDetails: (name: string, description: string, dialect: DatabaseDialect) => void;
  setTheme: (theme: "dark" | "light") => void;
  setAutoAddId: (enabled: boolean) => void;
  setAutoAddTimestamps: (enabled: boolean) => void;

  // Table actions
  addTable: (name: string, x: number, y: number) => string;
  updateTable: (id: string, updates: Partial<Omit<Table, "id" | "columns">>) => void;
  updateTablePosition: (id: string, x: number, y: number) => void;
  deleteTable: (id: string) => void;
  duplicateTable: (id: string) => void;

  // Column actions
  addColumn: (tableId: string, col: Omit<Column, "id">) => string;
  updateColumn: (tableId: string, colId: string, updates: Partial<Omit<Column, "id">>) => void;
  deleteColumn: (tableId: string, colId: string) => void;
  reorderColumns: (tableId: string, columns: Column[]) => void;

  // Relationship actions
  addRelation: (rel: Omit<Relation, "id">) => string;
  updateRelation: (id: string, updates: Partial<Omit<Relation, "id">>) => void;
  deleteRelation: (id: string) => void;

  // Selection actions
  selectTable: (id: string | null) => void;
  selectRelation: (id: string | null) => void;

  // History control
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
}

export const useStore = create<ProjectStore>((set, get) => ({
  // Initial state
  projectId: null,
  projectName: "Untitled Schema",
  projectDescription: "",
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

  loadProject: (ast) => {
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
      selectedTableId: null,
      selectedRelationId: null,
      past: [],
      future: []
    });
  },

  setProjectDetails: (name, description, dialect) => {
    get().pushHistory();
    set({
      projectName: name,
      projectDescription: description,
      dialect
    });
  },

  setTheme: (theme) => {
    set({ theme });
  },

  setAutoAddId: (autoAddId) => set({ autoAddId }),
  setAutoAddTimestamps: (autoAddTimestamps) => set({ autoAddTimestamps }),

  // History helper
  pushHistory: () => {
    const { tables, relations, past } = get();
    // Stringify deep copy to avoid object reference mutations
    const snap: CanvasHistoryState = JSON.parse(JSON.stringify({ tables, relations }));
    
    // Limit stack size to 50 items
    const newPast = past.length >= 50 ? past.slice(1) : past;
    
    set({
      past: [...newPast, snap],
      future: []
    });
  },

  undo: () => {
    const { past, future, tables, relations } = get();
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    const currentSnap: CanvasHistoryState = JSON.parse(JSON.stringify({ tables, relations }));

    set({
      tables: previous.tables,
      relations: previous.relations,
      past: newPast,
      future: [currentSnap, ...future],
      selectedTableId: null,
      selectedRelationId: null
    });
  },

  redo: () => {
    const { past, future, tables, relations } = get();
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);
    const currentSnap: CanvasHistoryState = JSON.parse(JSON.stringify({ tables, relations }));

    set({
      tables: next.tables,
      relations: next.relations,
      past: [...past, currentSnap],
      future: newFuture,
      selectedTableId: null,
      selectedRelationId: null
    });
  },

  clearHistory: () => {
    set({ past: [], future: [] });
  },

  // Table actions
  addTable: (name, x, y) => {
    get().pushHistory();
    const id = `table-${Date.now()}`;
    const autoAddId = get().autoAddId ?? true;
    const autoAddTimestamps = get().autoAddTimestamps ?? true;

    const columns: Column[] = [];
    const now = Date.now();

    if (autoAddId) {
      columns.push({
        id: `col-${now}-id`,
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

    const newTable: Table = {
      id,
      name,
      description: "",
      color: "#3b82f6", // Default blue
      position: { x, y },
      columns
    };

    set(state => ({
      tables: { ...state.tables, [id]: newTable },
      selectedTableId: id,
      selectedRelationId: null
    }));

    return id;
  },

  updateTable: (id, updates) => {
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

  updateTablePosition: (id, x, y) => {
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

  deleteTable: (id) => {
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

  duplicateTable: (id) => {
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
  addColumn: (tableId, col) => {
    get().pushHistory();
    const colId = `col-${Date.now()}`;
    const newCol: Column = {
      ...col,
      id: colId
    };

    set(state => {
      const table = state.tables[tableId];
      if (!table) return state;

      return {
        tables: {
          ...state.tables,
          [tableId]: {
            ...table,
            columns: [...table.columns, newCol]
          }
        }
      };
    });

    return colId;
  },

  updateColumn: (tableId, colId, updates) => {
    get().pushHistory();
    set(state => {
      const table = state.tables[tableId];
      if (!table) return state;

      const newCols = table.columns.map(col => {
        if (col.id === colId) {
          return {
            ...col,
            ...updates,
            constraints: {
              ...col.constraints,
              ...(updates.constraints || {})
            }
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

  deleteColumn: (tableId, colId) => {
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

  reorderColumns: (tableId, columns) => {
    get().pushHistory();
    set(state => {
      const table = state.tables[tableId];
      if (!table) return state;

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
  },

  // Relationship actions
  addRelation: (rel) => {
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

  updateRelation: (id, updates) => {
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

  deleteRelation: (id) => {
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

  // Selection actions
  selectTable: (id) => {
    set({
      selectedTableId: id,
      selectedRelationId: null
    });
  },

  selectRelation: (id) => {
    set({
      selectedRelationId: id,
      selectedTableId: null
    });
  }
}));
