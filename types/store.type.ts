import {
    Table,
    Relation,
    Column,
    Index,
    IndexColumn,
    DatabaseDialect,
    SchemaAST,
    EnumDefinition,
    ProjectMetadata,
} from "@/packages/schema-core";

/**
 * Historical snapshot state for canvas history (undo/redo).
 */
export interface CanvasHistoryState {
    tables: Record<string, Table>;
    relations: Record<string, Relation>;
    enums: Record<string, EnumDefinition>;
}

/**
 * Zustand global project state store interface.
 */
export interface ProjectStore {
    // Project details
    projectId?: string;
    projectName: string;
    projectDescription: string;
    dialect: DatabaseDialect;
    theme: "dark" | "light";
    autoAddId: boolean;
    autoAddTimestamps: boolean;

    // Lotus storage state
    storageMode: "database" | "lotus-local" | "lotus-cloud";
    lotusFileHandle?: FileSystemFileHandle;
    isProSubscribed: boolean;
    lotusUnsavedChanges: boolean;
    lotusFileVersion: number;
    lotusDeviceId: string;
    cloudStorageUsedBytes: number;

    // Lotus storage actions
    setStorageMode: (mode: "database" | "lotus-local" | "lotus-cloud") => void;
    setLotusFileHandle: (handle?: FileSystemFileHandle) => void;
    setProSubscribed: (subscribed: boolean) => void;
    setLotusUnsavedChanges: (unsaved: boolean) => void;
    incrementLotusFileVersion: () => number;
    saveLotusFile: () => Promise<void>;
    openLotusFile: () => Promise<void>;
    saveLotusPortable: () => Promise<void>;
    convertToLotus: () => Promise<void>;
    importLotusToDatabase: () => Promise<void>;

    // Schema state
    projectsList: ProjectMetadata[];
    tables: Record<string, Table>;
    relations: Record<string, Relation>;
    enums: Record<string, EnumDefinition>;
    crudVersion: number;
    setProjectsList: (projects: ProjectMetadata[]) => void;

    // UI Sidebar Visibility & Selection context
    showLeftSidebar: boolean;
    showRightSidebar: boolean;
    isCreateTableOpen: boolean;
    isEditTableInfoOpen: boolean;
    editTableInfoTargetId?: string;
    isCommentDialogOpen: boolean;
    commentDialogTargetId?: string;
    commentDialogTargetType?: "node" | "edge";
    commentDialogMode?: "description" | "comment";
    selectedTableId?: string;
    selectedRelationId?: string;

    // Undo/Redo Stacks
    past: CanvasHistoryState[];
    future: CanvasHistoryState[];

    // Sidebar actions
    toggleLeftSidebar: () => void;
    toggleRightSidebar: () => void;
    setLeftSidebar: (show: boolean) => void;
    setRightSidebar: (show: boolean) => void;
    setCreateTableOpen: (open: boolean) => void;
    setEditTableInfoOpen: (open: boolean, targetId?: string) => void;
    setCommentDialogOpen: (
        open: boolean,
        targetId?: string,
        targetType?: "node" | "edge",
        mode?: "description" | "comment"
    ) => void;

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
    autoLayoutTables: (direction?: "LR" | "TB") => void;

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

    // Enum actions
    addEnum: (name: string, values: string[]) => string;
    updateEnum: (id: string, updates: Partial<Omit<EnumDefinition, "id">>) => void;
    deleteEnum: (id: string) => void;

    // Selection actions
    selectTable: (id?: string) => void;
    selectRelation: (id?: string) => void;

    // History control
    pushHistory: () => void;
    undo: () => void;
    redo: () => void;
    clearHistory: () => void;
}
