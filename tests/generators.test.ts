import { describe, it, expect } from "vitest";
import { GeneratorFactory } from "../packages/generators/factory/GeneratorFactory";
import { TypeScriptGenerator } from "../packages/generators/typescript/TypeScriptGenerator";
import { SchemaAST } from "../packages/schema-core";

describe("GeneratorFactory", () => {
  it("should return an SQLite generator for the 'sqlite' dialect", () => {
    const generator = GeneratorFactory.getGenerator("sqlite");
    expect(generator).toBeDefined();
    expect(generator.constructor.name).toBe("SQLiteGenerator");
  });
});

describe("SQLiteGenerator", () => {
  const sqliteGenerator = GeneratorFactory.getGenerator("sqlite");

  it("should generate a simple table DDL", () => {
    const ast: SchemaAST = {
      project: { id: "p1", name: "Test Project", createdAt: "", updatedAt: "" },
      settings: { dialect: "sqlite", theme: "dark" },
      tables: {
        "users": {
          id: "users",
          name: "users",
          position: { x: 0, y: 0 },
          columns: [
            {
              id: "id",
              name: "id",
              type: "INTEGER",
              constraints: { isPrimaryKey: true, isNullable: false, isUnique: false, isAutoIncrement: true }
            },
            {
              id: "name",
              name: "name",
              type: "TEXT",
              constraints: { isPrimaryKey: false, isNullable: false, isUnique: false, isAutoIncrement: false }
            },
            {
              id: "email",
              name: "email",
              type: "TEXT",
              constraints: { isPrimaryKey: false, isNullable: true, isUnique: true, isAutoIncrement: false },
              comment: "User email address"
            }
          ]
        }
      },
      relations: {}
    };

    const sql = sqliteGenerator.generate(ast);
    
    // Check main CREATE TABLE statement
    expect(sql).toContain("CREATE TABLE users");
    expect(sql).toContain("id INTEGER PRIMARY KEY AUTOINCREMENT");
    expect(sql).toContain("name TEXT NOT NULL");
    expect(sql).toContain("email TEXT UNIQUE");
    expect(sql).toContain("/* User email address */");
  });

  it("should generate foreign key constraints correctly", () => {
    const ast: SchemaAST = {
      project: { id: "p1", name: "Test Project", createdAt: "", updatedAt: "" },
      settings: { dialect: "sqlite", theme: "dark" },
      tables: {
        "users": {
          id: "users",
          name: "users",
          position: { x: 0, y: 0 },
          columns: [
            {
              id: "u_id",
              name: "id",
              type: "INTEGER",
              constraints: { isPrimaryKey: true, isNullable: false, isUnique: false, isAutoIncrement: true }
            }
          ]
        },
        "posts": {
          id: "posts",
          name: "posts",
          position: { x: 100, y: 100 },
          columns: [
            {
              id: "p_id",
              name: "id",
              type: "INTEGER",
              constraints: { isPrimaryKey: true, isNullable: false, isUnique: false, isAutoIncrement: true }
            },
            {
              id: "p_user_id",
              name: "user_id",
              type: "INTEGER",
              constraints: { isPrimaryKey: false, isNullable: false, isUnique: false, isAutoIncrement: false }
            }
          ]
        }
      },
      relations: {
        "rel1": {
          id: "rel1",
          sourceTableId: "posts",
          sourceColumnId: "p_user_id",
          targetTableId: "users",
          targetColumnId: "u_id",
          type: "many-to-one",
          onDelete: "cascade",
          onUpdate: "restrict"
        }
      }
    };

    const sql = sqliteGenerator.generate(ast);
    
    // Check foreign key constraint output
    expect(sql).toContain("FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE RESTRICT");
  });

  it("should generate composite primary keys", () => {
    const ast: SchemaAST = {
      project: { id: "p1", name: "Test Project", createdAt: "", updatedAt: "" },
      settings: { dialect: "sqlite", theme: "dark" },
      tables: {
        "post_tags": {
          id: "post_tags",
          name: "post_tags",
          position: { x: 0, y: 0 },
          columns: [
            {
              id: "post_id",
              name: "post_id",
              type: "INTEGER",
              constraints: { isPrimaryKey: true, isNullable: false, isUnique: false, isAutoIncrement: false }
            },
            {
              id: "tag_id",
              name: "tag_id",
              type: "INTEGER",
              constraints: { isPrimaryKey: true, isNullable: false, isUnique: false, isAutoIncrement: false }
            }
          ]
        }
      },
      relations: {}
    };

    const sql = sqliteGenerator.generate(ast);
    expect(sql).toContain("PRIMARY KEY (post_id, tag_id)");
  });

  it("should generate CREATE INDEX statements for configured table indexes", () => {
    const ast: SchemaAST = {
      project: { id: "p1", name: "Test Project", createdAt: "", updatedAt: "" },
      settings: { dialect: "sqlite", theme: "dark" },
      tables: {
        "users": {
          id: "users",
          name: "users",
          position: { x: 0, y: 0 },
          columns: [
            { id: "id", name: "id", type: "INTEGER", constraints: { isPrimaryKey: true, isNullable: false, isUnique: false, isAutoIncrement: true } },
            { id: "email", name: "email", type: "VARCHAR", constraints: { isPrimaryKey: false, isNullable: false, isUnique: false, isAutoIncrement: false } }
          ],
          indexes: [
            {
              id: "idx1",
              name: "idx_users_email",
              columns: [{ columnName: "email", order: "DESC" }],
              isUnique: true
            }
          ]
        }
      },
      relations: {}
    };

    const sql = sqliteGenerator.generate(ast);
    expect(sql).toContain("CREATE UNIQUE INDEX idx_users_email ON users (email DESC);");
  });
});

describe("TypeScriptGenerator", () => {
  const tsGenerator = new TypeScriptGenerator();

  it("should generate typescript interfaces, insert, and update types", () => {
    const ast: SchemaAST = {
      project: { id: "p1", name: "Test Project", createdAt: "", updatedAt: "" },
      settings: { dialect: "sqlite", theme: "dark" },
      tables: {
        "users": {
          id: "users",
          name: "users",
          position: { x: 0, y: 0 },
          columns: [
            {
              id: "id",
              name: "id",
              type: "INTEGER",
              constraints: { isPrimaryKey: true, isNullable: false, isUnique: false, isAutoIncrement: true }
            },
            {
              id: "email",
              name: "email",
              type: "TEXT",
              constraints: { isPrimaryKey: false, isNullable: false, isUnique: true, isAutoIncrement: false }
            },
            {
              id: "created_at",
              name: "created_at",
              type: "DATETIME",
              constraints: { isPrimaryKey: false, isNullable: true, isUnique: false, isAutoIncrement: false, defaultValue: "CURRENT_TIMESTAMP" }
            }
          ]
        }
      },
      relations: {}
    };

    const tsCode = tsGenerator.generate(ast);
    
    // Test base interface
    expect(tsCode).toContain("export interface User {");
    expect(tsCode).toContain("id: number;");
    expect(tsCode).toContain("email: string;");
    expect(tsCode).toContain("created_at: string | null;");

    // Test Insert type
    expect(tsCode).toContain("export interface UserInsert {");
    expect(tsCode).toContain("id?: number;");
    expect(tsCode).toContain("email: string;");
    expect(tsCode).toContain("created_at?: string | null;");

    // Test Update type
    expect(tsCode).toContain("export interface UserUpdate {");
    expect(tsCode).toContain("id?: number;");
    expect(tsCode).toContain("email?: string;");
    expect(tsCode).toContain("created_at?: string | null;");
  });

  it("should generate union types for enums", () => {
    const ast: SchemaAST = {
      project: { id: "p1", name: "Test Project", createdAt: "", updatedAt: "" },
      settings: { dialect: "postgres", theme: "dark" },
      enums: {
        "enum-gender": { id: "enum-gender", name: "gender", values: ["male", "female", "other"] }
      },
      tables: {
        "users": {
          id: "users",
          name: "users",
          position: { x: 0, y: 0 },
          columns: [
            {
              id: "gender",
              name: "gender",
              type: "ENUM",
              enumId: "enum-gender",
              constraints: { isPrimaryKey: false, isNullable: true, isUnique: false, isAutoIncrement: false }
            }
          ]
        }
      },
      relations: {}
    };

    const tsCode = tsGenerator.generate(ast);
    expect(tsCode).toContain("export type GenderEnum = 'male' | 'female' | 'other';");
    expect(tsCode).toContain("gender: GenderEnum | null;");
  });
});

