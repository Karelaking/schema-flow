import { createClient, Client } from "@libsql/client";
import { drizzle, LibSQLDatabase } from "drizzle-orm/libsql";
import { eq, desc, inArray } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { SchemaAST, ProjectMetadata, Table, Relation, DatabaseDialect } from "@/packages/schema-core";
import * as schema from "./schema";

export * from "./schema";

/**
 * Multi-Environment Unified Database Service using Drizzle ORM + @libsql/client (LibSQL / Turso).
 * Supports 3 deployment modes seamlessly:
 * 1. Local Machine: file:./data/schema-flow.db
 * 2. Vercel Serverless / Edge Cloud: Turso URL (libsql://...) + TURSO_AUTH_TOKEN
 * 3. Docker Container: file:/app/data/schema-flow.db
 */
export class DatabaseService {
  private client: Client;
  public db: LibSQLDatabase<typeof schema>;
  private initialized: boolean = false;

  constructor(customUrl?: string) {
    const rawUrl = customUrl || process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || process.env.DATABASE_PATH;
    const envToken = process.env.TURSO_AUTH_TOKEN || process.env.TURSO_TOKEN || process.env.DATABASE_AUTH_TOKEN;

    let url = rawUrl && rawUrl.trim() !== "" ? rawUrl.trim() : "file:./data/schema-flow.db";
    let authToken: string | undefined = envToken && envToken.trim() !== "" ? envToken.trim() : undefined;

    const isRemote = url.startsWith("libsql:") || url.startsWith("http:") || url.startsWith("https:");

    // If remote Turso URL is specified but no auth token is provided, fallback to local SQLite for local dev
    if (isRemote && !authToken) {
      console.warn("[DatabaseService] Remote database URL provided without TURSO_AUTH_TOKEN. Falling back to local SQLite database (file:./data/schema-flow.db).");
      url = "file:./data/schema-flow.db";
    }

    if (!url.startsWith("file:") && !url.startsWith("libsql:") && !url.startsWith("http:") && !url.startsWith("https:")) {
      url = `file:${url}`;
    }

    if (url.startsWith("file:")) {
      const filePath = url.replace("file:", "");
      const dir = path.dirname(filePath);
      if (dir && dir !== "." && !fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      authToken = undefined;
    }

    if (process.env.NODE_ENV === "development") {
      console.log(`[DatabaseService] Connecting to ${url} (Auth Token: ${authToken ? "Present" : "Missing"})`);
    }

    this.client = createClient({
      url,
      authToken,
    });

    this.db = drizzle(this.client, { schema });
  }

  /**
   * Lazily initializes database tables.
   */
  public async init(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.client.batch([
        `CREATE TABLE IF NOT EXISTS projects (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          dialect TEXT NOT NULL DEFAULT 'sqlite',
          theme TEXT NOT NULL DEFAULT 'dark',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );`,
        `CREATE TABLE IF NOT EXISTS db_tables (
          id TEXT PRIMARY KEY,
          project_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          color TEXT,
          position_x REAL NOT NULL,
          position_y REAL NOT NULL,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );`,
        `CREATE TABLE IF NOT EXISTS db_columns (
          id TEXT PRIMARY KEY,
          table_id TEXT NOT NULL,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          is_primary_key INTEGER NOT NULL DEFAULT 0,
          is_nullable INTEGER NOT NULL DEFAULT 1,
          is_unique INTEGER NOT NULL DEFAULT 0,
          is_auto_increment INTEGER NOT NULL DEFAULT 0,
          default_value TEXT,
          check_constraint TEXT,
          comment TEXT,
          sort_order INTEGER NOT NULL DEFAULT 0,
          FOREIGN KEY (table_id) REFERENCES db_tables(id) ON DELETE CASCADE
        );`,
        `CREATE TABLE IF NOT EXISTS db_relations (
          id TEXT PRIMARY KEY,
          project_id TEXT NOT NULL,
          source_table_id TEXT NOT NULL,
          source_column_id TEXT NOT NULL,
          target_table_id TEXT NOT NULL,
          target_column_id TEXT NOT NULL,
          type TEXT NOT NULL,
          on_delete TEXT DEFAULT 'no-action',
          on_update TEXT DEFAULT 'no-action',
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
          FOREIGN KEY (source_table_id) REFERENCES db_tables(id) ON DELETE CASCADE,
          FOREIGN KEY (target_table_id) REFERENCES db_tables(id) ON DELETE CASCADE
        );`,
        `CREATE TABLE IF NOT EXISTS db_indexes (
          id TEXT PRIMARY KEY,
          table_id TEXT NOT NULL,
          name TEXT NOT NULL,
          columns_json TEXT NOT NULL,
          is_unique INTEGER NOT NULL DEFAULT 0,
          FOREIGN KEY (table_id) REFERENCES db_tables(id) ON DELETE CASCADE
        );`
      ], "write");

      this.initialized = true;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes("401") || errMsg.includes("Unauthorized")) {
        throw new Error(
          `Database Connection Error (401 Unauthorized): Failed to authenticate with remote database. ` +
          `Please check TURSO_AUTH_TOKEN in your .env.local file or set DATABASE_URL="file:./data/schema-flow.db" for local development.`
        );
      }
      throw err;
    }
  }

  public async listProjects(): Promise<ProjectMetadata[]> {
    await this.init();

    const rows = await this.db
      .select({
        id: schema.projects.id,
        name: schema.projects.name,
        description: schema.projects.description,
        dialect: schema.projects.dialect,
        createdAt: schema.projects.createdAt,
        updatedAt: schema.projects.updatedAt,
      })
      .from(schema.projects)
      .orderBy(desc(schema.projects.updatedAt));

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description ?? undefined,
      dialect: row.dialect as DatabaseDialect,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  }

  public async getProject(id: string): Promise<SchemaAST | null> {
    await this.init();

    const projectRow = await this.db.query.projects.findFirst({
      where: eq(schema.projects.id, id),
      with: {
        tables: {
          with: {
            columns: {
              orderBy: (cols, { asc }) => [asc(cols.sortOrder)],
            },
            indexes: true,
          },
        },
        relations: true,
      },
    });

    if (!projectRow) return null;

    const schemaTables: Record<string, Table> = {};
    for (const tbl of projectRow.tables) {
      schemaTables[tbl.id] = {
        id: tbl.id,
        name: tbl.name,
        description: tbl.description ?? undefined,
        color: tbl.color ?? undefined,
        position: { x: tbl.positionX, y: tbl.positionY },
        columns: tbl.columns.map((c) => ({
          id: c.id,
          name: c.name,
          type: c.type,
          constraints: {
            isPrimaryKey: Boolean(c.isPrimaryKey),
            isNullable: Boolean(c.isNullable),
            isUnique: Boolean(c.isUnique),
            isAutoIncrement: Boolean(c.isAutoIncrement),
            defaultValue: c.defaultValue ?? undefined,
            checkConstraint: c.checkConstraint ?? undefined,
          },
          comment: c.comment ?? undefined,
        })),
        indexes: tbl.indexes.map((idx) => ({
          id: idx.id,
          name: idx.name,
          columns: JSON.parse(idx.columnsJson),
          isUnique: Boolean(idx.isUnique),
        })),
      };
    }

    const schemaRelations: Record<string, Relation> = {};
    for (const rel of projectRow.relations) {
      schemaRelations[rel.id] = {
        id: rel.id,
        sourceTableId: rel.sourceTableId,
        sourceColumnId: rel.sourceColumnId,
        targetTableId: rel.targetTableId,
        targetColumnId: rel.targetColumnId,
        type: rel.type as Relation["type"],
        onDelete: (rel.onDelete ?? "no-action") as Relation["onDelete"],
        onUpdate: (rel.onUpdate ?? "no-action") as Relation["onUpdate"],
      };
    }

    return {
      project: {
        id: projectRow.id,
        name: projectRow.name,
        description: projectRow.description ?? undefined,
        createdAt: projectRow.createdAt,
        updatedAt: projectRow.updatedAt,
      },
      settings: {
        dialect: projectRow.dialect as DatabaseDialect,
        theme: projectRow.theme as "dark" | "light",
      },
      tables: schemaTables,
      relations: schemaRelations,
    };
  }

  public async saveProject(id: string, ast: SchemaAST): Promise<void> {
    await this.init();
    const now = new Date().toISOString();

    const existing = await this.db
      .select({ id: schema.projects.id })
      .from(schema.projects)
      .where(eq(schema.projects.id, id))
      .limit(1);

    if (existing.length > 0) {
      await this.db
        .update(schema.projects)
        .set({
          name: ast.project.name,
          description: ast.project.description ?? null,
          dialect: ast.settings.dialect,
          theme: ast.settings.theme,
          updatedAt: now,
        })
        .where(eq(schema.projects.id, id));
    } else {
      await this.db.insert(schema.projects).values({
        id,
        name: ast.project.name,
        description: ast.project.description ?? null,
        dialect: ast.settings.dialect,
        theme: ast.settings.theme,
        createdAt: ast.project.createdAt || now,
        updatedAt: now,
      });
    }

    // Clean up existing tables, columns, indexes, and relations for this project ID
    const existingTables = await this.db
      .select({ id: schema.dbTables.id })
      .from(schema.dbTables)
      .where(eq(schema.dbTables.projectId, id));

    const existingTableIds = existingTables.map((t) => t.id);

    if (existingTableIds.length > 0) {
      await this.db.delete(schema.dbIndexes).where(inArray(schema.dbIndexes.tableId, existingTableIds));
      await this.db.delete(schema.dbColumns).where(inArray(schema.dbColumns.tableId, existingTableIds));
    }
    await this.db.delete(schema.dbTables).where(eq(schema.dbTables.projectId, id));
    await this.db.delete(schema.dbRelations).where(eq(schema.dbRelations.projectId, id));

    // Re-insert tables, columns, and indexes
    for (const table of Object.values(ast.tables)) {
      await this.db.insert(schema.dbTables).values({
        id: table.id,
        projectId: id,
        name: table.name,
        description: table.description ?? null,
        color: table.color ?? null,
        positionX: table.position.x,
        positionY: table.position.y,
      });

      if (table.columns.length > 0) {
        await this.db.insert(schema.dbColumns).values(
          table.columns.map((col, idx) => ({
            id: col.id,
            tableId: table.id,
            name: col.name,
            type: col.type,
            isPrimaryKey: col.constraints.isPrimaryKey ? 1 : 0,
            isNullable: col.constraints.isNullable ? 1 : 0,
            isUnique: col.constraints.isUnique ? 1 : 0,
            isAutoIncrement: col.constraints.isAutoIncrement ? 1 : 0,
            defaultValue: col.constraints.defaultValue ?? null,
            checkConstraint: col.constraints.checkConstraint ?? null,
            comment: col.comment ?? null,
            sortOrder: idx,
          }))
        );
      }

      if (table.indexes && table.indexes.length > 0) {
        await this.db.insert(schema.dbIndexes).values(
          table.indexes.map((idx) => ({
            id: idx.id,
            tableId: table.id,
            name: idx.name,
            columnsJson: JSON.stringify(idx.columns),
            isUnique: idx.isUnique ? 1 : 0,
          }))
        );
      }
    }

    // Re-insert relations
    const relationsToInsert = Object.values(ast.relations);
    if (relationsToInsert.length > 0) {
      await this.db.insert(schema.dbRelations).values(
        relationsToInsert.map((rel) => ({
          id: rel.id,
          projectId: id,
          sourceTableId: rel.sourceTableId,
          sourceColumnId: rel.sourceColumnId,
          targetTableId: rel.targetTableId,
          targetColumnId: rel.targetColumnId,
          type: rel.type,
          onDelete: rel.onDelete || "no-action",
          onUpdate: rel.onUpdate || "no-action",
        }))
      );
    }
  }

  public async deleteProject(id: string): Promise<void> {
    await this.init();
    await this.db.delete(schema.projects).where(eq(schema.projects.id, id));
  }

  public close(): void {
    this.client.close();
  }
}

declare global {
  var dbServiceInstance: DatabaseService | undefined;
}

export function getDbService(): DatabaseService {
  if (process.env.NODE_ENV === "development") {
    return new DatabaseService();
  }
  if (!globalThis.dbServiceInstance) {
    globalThis.dbServiceInstance = new DatabaseService();
  }
  return globalThis.dbServiceInstance;
}

export function closeDbService(): void {
  if (globalThis.dbServiceInstance) {
    globalThis.dbServiceInstance.close();
    globalThis.dbServiceInstance = undefined;
  }
}
