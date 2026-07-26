import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

/**
 * Projects database table schema.
 */
export const projects = sqliteTable("projects", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    dialect: text("dialect").notNull().default("sqlite"),
    theme: text("theme").notNull().default("dark"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
});

/**
 * DB Tables schema in SQLite database.
 */
export const dbTables = sqliteTable("db_tables", {
    id: text("id").primaryKey(),
    projectId: text("project_id")
        .notNull()
        .references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    color: text("color"),
    positionX: real("position_x").notNull(),
    positionY: real("position_y").notNull(),
});

/**
 * DB Enums schema in SQLite database.
 */
export const dbEnums = sqliteTable("db_enums", {
    id: text("id").primaryKey(),
    projectId: text("project_id")
        .notNull()
        .references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    valuesJson: text("values_json").notNull(),
    description: text("description"),
    color: text("color"),
});

/**
 * DB Columns schema in SQLite database.
 */
export const dbColumns = sqliteTable("db_columns", {
    id: text("id").primaryKey(),
    tableId: text("table_id")
        .notNull()
        .references(() => dbTables.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type").notNull(),
    isPrimaryKey: integer("is_primary_key").notNull().default(0),
    isNullable: integer("is_nullable").notNull().default(1),
    isUnique: integer("is_unique").notNull().default(0),
    isAutoIncrement: integer("is_auto_increment").notNull().default(0),
    defaultValue: text("default_value"),
    checkConstraint: text("check_constraint"),
    comment: text("comment"),
    sortOrder: integer("sort_order").notNull().default(0),
    enumId: text("enum_id"),
});

/**
 * DB Relations schema in SQLite database.
 */
export const dbRelations = sqliteTable("db_relations", {
    id: text("id").primaryKey(),
    projectId: text("project_id")
        .notNull()
        .references(() => projects.id, { onDelete: "cascade" }),
    sourceTableId: text("source_table_id")
        .notNull()
        .references(() => dbTables.id, { onDelete: "cascade" }),
    sourceColumnId: text("source_column_id").notNull(),
    targetTableId: text("target_table_id")
        .notNull()
        .references(() => dbTables.id, { onDelete: "cascade" }),
    targetColumnId: text("target_column_id").notNull(),
    type: text("type").notNull(),
    onDelete: text("on_delete").default("no-action"),
    onUpdate: text("on_update").default("no-action"),
});

/**
 * DB Indexes schema in SQLite database.
 */
export const dbIndexes = sqliteTable("db_indexes", {
    id: text("id").primaryKey(),
    tableId: text("table_id")
        .notNull()
        .references(() => dbTables.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    columnsJson: text("columns_json").notNull(),
    isUnique: integer("is_unique").notNull().default(0),
});

// Drizzle Relational Mappings

/**
 * Relational mapping for projects.
 */
export const projectsRelations = relations(projects, ({ many }) => ({
    tables: many(dbTables),
    relations: many(dbRelations),
    enums: many(dbEnums),
}));

/**
 * Relational mapping for dbEnums.
 */
export const dbEnumsRelations = relations(dbEnums, ({ one }) => ({
    project: one(projects, {
        fields: [dbEnums.projectId],
        references: [projects.id],
    }),
}));

/**
 * Relational mapping for dbTables.
 */
export const dbTablesRelations = relations(dbTables, ({ one, many }) => ({
    project: one(projects, {
        fields: [dbTables.projectId],
        references: [projects.id],
    }),
    columns: many(dbColumns),
    indexes: many(dbIndexes),
}));

/**
 * Relational mapping for dbColumns.
 */
export const dbColumnsRelations = relations(dbColumns, ({ one }) => ({
    table: one(dbTables, {
        fields: [dbColumns.tableId],
        references: [dbTables.id],
    }),
}));

/**
 * Relational mapping for dbRelations.
 */
export const dbRelationsRelations = relations(dbRelations, ({ one }) => ({
    project: one(projects, {
        fields: [dbRelations.projectId],
        references: [projects.id],
    }),
    sourceTable: one(dbTables, {
        fields: [dbRelations.sourceTableId],
        references: [dbTables.id],
    }),
    targetTable: one(dbTables, {
        fields: [dbRelations.targetTableId],
        references: [dbTables.id],
    }),
}));

/**
 * Relational mapping for dbIndexes.
 */
export const dbIndexesRelations = relations(dbIndexes, ({ one }) => ({
    table: one(dbTables, {
        fields: [dbIndexes.tableId],
        references: [dbTables.id],
    }),
}));
