import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { SchemaAST, ProjectMetadata } from "@/packages/schema-core";

export class DatabaseService {
  private db: Database.Database;

  constructor(dbPath: string = process.env.DATABASE_PATH || process.env.DATABASE_FILE || process.env.DATABASE_URL || "./data/schema-flow.db") {
    const dir = path.dirname(dbPath);
    if (dir && dir !== "." && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    this.db = new Database(dbPath);
    this.init();
  }

  private init() {
    // Enable foreign keys
    this.db.pragma("foreign_keys = ON");

    // Create tables
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        dialect TEXT NOT NULL DEFAULT 'sqlite',
        theme TEXT NOT NULL DEFAULT 'dark',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS db_tables (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        color TEXT,
        position_x REAL NOT NULL,
        position_y REAL NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS db_columns (
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
      );

      CREATE TABLE IF NOT EXISTS db_relations (
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
      );
    `);
  }

  public listProjects(): ProjectMetadata[] {
    const rows = this.db.prepare(`
      SELECT id, name, description, created_at as createdAt, updated_at as updatedAt 
      FROM projects 
      ORDER BY updated_at DESC
    `).all() as any[];

    return rows.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description || undefined,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }));
  }

  public getProject(id: string): SchemaAST | null {
    const project = this.db.prepare("SELECT * FROM projects WHERE id = ?").get(id) as any;
    if (!project) return null;

    const tables = this.db.prepare("SELECT * FROM db_tables WHERE project_id = ?").all(id) as any[];
    const relations = this.db.prepare("SELECT * FROM db_relations WHERE project_id = ?").all(id) as any[];

    const schemaTables: Record<string, any> = {};
    for (const tbl of tables) {
      const columns = this.db.prepare("SELECT * FROM db_columns WHERE table_id = ? ORDER BY sort_order ASC").all(tbl.id) as any[];
      schemaTables[tbl.id] = {
        id: tbl.id,
        name: tbl.name,
        description: tbl.description || undefined,
        color: tbl.color || undefined,
        position: { x: tbl.position_x, y: tbl.position_y },
        columns: columns.map(c => ({
          id: c.id,
          name: c.name,
          type: c.type,
          constraints: {
            isPrimaryKey: Boolean(c.is_primary_key),
            isNullable: Boolean(c.is_nullable),
            isUnique: Boolean(c.is_unique),
            isAutoIncrement: Boolean(c.is_auto_increment),
            defaultValue: c.default_value || undefined,
            checkConstraint: c.check_constraint || undefined
          },
          comment: c.comment || undefined
        }))
      };
    }

    const schemaRelations: Record<string, any> = {};
    for (const rel of relations) {
      schemaRelations[rel.id] = {
        id: rel.id,
        sourceTableId: rel.source_table_id,
        sourceColumnId: rel.source_column_id,
        targetTableId: rel.target_table_id,
        targetColumnId: rel.target_column_id,
        type: rel.type,
        onDelete: rel.on_delete,
        onUpdate: rel.on_update
      };
    }

    return {
      project: {
        id: project.id,
        name: project.name,
        description: project.description || undefined,
        createdAt: project.created_at,
        updatedAt: project.updated_at
      },
      settings: {
        dialect: project.dialect,
        theme: project.theme
      },
      tables: schemaTables,
      relations: schemaRelations
    };
  }

  public saveProject(id: string, ast: SchemaAST): void {
    const transaction = this.db.transaction(() => {
      // 1. Upsert project
      const projectExists = this.db.prepare("SELECT 1 FROM projects WHERE id = ?").get(id);
      const now = new Date().toISOString();
      if (projectExists) {
        this.db.prepare(`
          UPDATE projects 
          SET name = ?, description = ?, dialect = ?, theme = ?, updated_at = ? 
          WHERE id = ?
        `).run(ast.project.name, ast.project.description || null, ast.settings.dialect, ast.settings.theme, now, id);
      } else {
        this.db.prepare(`
          INSERT INTO projects (id, name, description, dialect, theme, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(id, ast.project.name, ast.project.description || null, ast.settings.dialect, ast.settings.theme, ast.project.createdAt || now, now);
      }

      // 2. Delete existing tables, columns, relations to overwrite
      // Note: Foreign keys will cascade delete db_columns, but we delete db_tables first
      this.db.prepare("DELETE FROM db_tables WHERE project_id = ?").run(id);
      this.db.prepare("DELETE FROM db_relations WHERE project_id = ?").run(id);

      // 3. Insert tables and columns
      const insertTable = this.db.prepare(`
        INSERT INTO db_tables (id, project_id, name, description, color, position_x, position_y) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const insertColumn = this.db.prepare(`
        INSERT INTO db_columns (id, table_id, name, type, is_primary_key, is_nullable, is_unique, is_auto_increment, default_value, check_constraint, comment, sort_order) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const table of Object.values(ast.tables)) {
        insertTable.run(table.id, id, table.name, table.description || null, table.color || null, table.position.x, table.position.y);
        
        table.columns.forEach((col, idx) => {
          insertColumn.run(
            col.id,
            table.id,
            col.name,
            col.type,
            col.constraints.isPrimaryKey ? 1 : 0,
            col.constraints.isNullable ? 1 : 0,
            col.constraints.isUnique ? 1 : 0,
            col.constraints.isAutoIncrement ? 1 : 0,
            col.constraints.defaultValue || null,
            col.constraints.checkConstraint || null,
            col.comment || null,
            idx
          );
        });
      }

      // 4. Insert relations
      const insertRelation = this.db.prepare(`
        INSERT INTO db_relations (id, project_id, source_table_id, source_column_id, target_table_id, target_column_id, type, on_delete, on_update) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const rel of Object.values(ast.relations)) {
        insertRelation.run(
          rel.id,
          id,
          rel.sourceTableId,
          rel.sourceColumnId,
          rel.targetTableId,
          rel.targetColumnId,
          rel.type,
          rel.onDelete || "no-action",
          rel.onUpdate || "no-action"
        );
      }
    });

    transaction();
  }

  public deleteProject(id: string): void {
    this.db.prepare("DELETE FROM projects WHERE id = ?").run(id);
  }
}

// Global instance resolver for Server Actions/API routes (SRP)
declare global {
  var dbServiceInstance: DatabaseService | undefined;
}

export function getDbService(): DatabaseService {
  if (!globalThis.dbServiceInstance) {
    const dbPath = process.env.DATABASE_PATH || process.env.DATABASE_FILE || process.env.DATABASE_URL || "./data/schema-flow.db";
    globalThis.dbServiceInstance = new DatabaseService(dbPath);
  }
  return globalThis.dbServiceInstance;
}
