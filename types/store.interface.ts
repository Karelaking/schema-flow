import {
  Table,
  Relation,
  Column,
  Index,
  IndexColumn,
  DatabaseDialect,
  SchemaAST
} from "@/packages/schema-core";

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
  autoLayoutTables: () => void;

  // Column actions
  addColumn: (tableId: string, col: Omit<Column, "id">) => string;
  updateColumn: (tableId: string, colId: string, updates: Partial<Omit<Column, "id">>) => void;
  deleteColumn: (tableId: string, colId: string) => void;
  reorderColumns: (tableId: string, columns: Column[]) => void;

  // Index actions
  addIndex: (tableId: string, name: string, columns: IndexColumn[], isUnique: boolean) => string;
  updateIndex: (tableId: string, indexId: string, updates: Partial<Omit<Index, "id">>) => void;
  deleteIndex: (tableId: string, indexId: string) => void;

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