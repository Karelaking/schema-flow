/**
 * Supported database dialects in Schema Flow.
 */
export type DatabaseDialect = "sqlite" | "postgres" | "mysql";

/**
 * Bitwise flags representing column constraint flags.
 */
export enum ColumnFlag {
    None = 0,
    PrimaryKey = 1 << 0,
    Nullable = 1 << 1,
    Unique = 1 << 2,
    AutoIncrement = 1 << 3,
}

/**
 * Configuration settings for a schema project.
 */
export interface ProjectSettings {
    dialect: DatabaseDialect;
    theme: "dark" | "light";
    autoAddId?: boolean;
    autoAddTimestamps?: boolean;
    storageMode?: "database" | "lotus-local" | "lotus-cloud";
    lotusFileHint?: string;
    lastCloudSync?: string;
    lotusFileVersion?: number;
}

/**
 * Metadata defining project details.
 */
export interface ProjectMetadata {
    id: string;
    name: string;
    description?: string;
    dialect?: DatabaseDialect;
    createdAt: string;
    updatedAt: string;
}

/**
 * Custom database enum definition.
 */
export interface EnumDefinition {
    id: string;
    name: string;
    values: string[];
    description?: string;
    color?: string;
}

/**
 * Column-level database constraints.
 */
export interface ColumnConstraint {
    flags?: ColumnFlag;
    isPrimaryKey: boolean;
    isNullable: boolean;
    isUnique: boolean;
    isAutoIncrement: boolean;
    defaultValue?: string;
    checkConstraint?: string;
}

/**
 * Schema column definition.
 */
export interface Column {
    id: string;
    name: string;
    type: string;
    constraints: ColumnConstraint;
    comment?: string;
    length?: number;
    precision?: number;
    scale?: number;
    enumId?: string;
}

/**
 * Index column sorting and specification.
 */
export interface IndexColumn {
    columnName: string;
    order?: "ASC" | "DESC";
}

/**
 * Table-level index definition.
 */
export interface Index {
    id: string;
    name: string;
    columns: IndexColumn[];
    isUnique: boolean;
}

/**
 * Table schema definition in AST.
 */
export interface Table {
    id: string;
    name: string;
    description?: string;
    comment?: string;
    color?: string;
    position: { x: number; y: number };
    columns: Column[];
    indexes?: Index[];
}

/**
 * Relationship constraint between table columns.
 */
export interface Relation {
    id: string;
    name?: string;
    description?: string;
    comment?: string;
    sourceTableId: string;
    sourceColumnId: string;
    targetTableId: string;
    targetColumnId: string;
    type: "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many";
    onDelete?: "cascade" | "restrict" | "set-null" | "no-action";
    onUpdate?: "cascade" | "restrict" | "set-null" | "no-action";
}

/**
 * Root Schema Abstract Syntax Tree (AST).
 */
export interface SchemaAST {
    project: ProjectMetadata;
    settings: ProjectSettings;
    tables: Record<string, Table>;
    relations: Record<string, Relation>;
    enums: Record<string, EnumDefinition>;
}
