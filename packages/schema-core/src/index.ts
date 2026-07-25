export type DatabaseDialect = 'sqlite' | 'postgres' | 'mysql' | 'postgres';

export interface ProjectSettings {
  dialect: DatabaseDialect;
  theme: 'dark' | 'light';
}

export interface ProjectMetadata {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnumDefinition {
  id: string;
  name: string;
  values: string[];
  description?: string;
  color?: string;
}

export interface ColumnConstraint {
  isPrimaryKey: boolean;
  isNullable: boolean;
  isUnique: boolean;
  isAutoIncrement: boolean;
  defaultValue?: string;
  checkConstraint?: string;
}

export interface Column {
  id: string;
  name: string;
  type: string; // Dialect-specific type, e.g. TEXT, INTEGER
  constraints: ColumnConstraint;
  comment?: string;
  length?: number;
  precision?: number;
  scale?: number;
  enumId?: string; // References an EnumDefinition by ID
}

export interface Table {
  id: string;
  name: string;
  description?: string;
  color?: string;
  position: { x: number; y: number };
  columns: Column[];
}

export interface Relation {
  id: string;
  name?: string;
  sourceTableId: string;
  sourceColumnId: string;
  targetTableId: string;
  targetColumnId: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
  onDelete?: 'cascade' | 'restrict' | 'set-null' | 'no-action';
  onUpdate?: 'cascade' | 'restrict' | 'set-null' | 'no-action';
}

export interface SchemaAST {
  project: ProjectMetadata;
  settings: ProjectSettings;
  tables: Record<string, Table>;
  relations: Record<string, Relation>;
  enums: Record<string, EnumDefinition>;
}

