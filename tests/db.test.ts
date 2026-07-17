import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DatabaseService } from "@/packages/db";
import { SchemaAST } from "@/packages/schema-core";
import fs from "fs";
import path from "path";

describe("DatabaseService Edge Cases", () => {
  const testDbPath = path.join(__dirname, "test_temp_db.db");
  let dbService: DatabaseService;

  beforeEach(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    dbService = new DatabaseService(testDbPath);
  });

  afterEach(() => {
    if (dbService) {
      dbService.close();
    }
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  it("should return empty list when no projects exist", () => {
    const projects = dbService.listProjects();
    expect(projects).toEqual([]);
  });

  it("should return null when querying non-existent project ID", () => {
    const project = dbService.getProject("non-existent-id");
    expect(project).toBeNull();
  });

  it("should save and retrieve a full project AST with tables and relations", () => {
    const ast: SchemaAST = {
      project: {
        id: "p-101",
        name: "E-Commerce DB",
        description: "Main store database",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      settings: {
        dialect: "sqlite",
        theme: "dark",
        autoAddId: true,
        autoAddTimestamps: true,
      },
      tables: {
        "tbl-users": {
          id: "tbl-users",
          name: "users",
          position: { x: 50, y: 50 },
          columns: [
            {
              id: "col-id",
              name: "id",
              type: "INTEGER",
              constraints: { isPrimaryKey: true, isNullable: false, isUnique: false, isAutoIncrement: true }
            }
          ],
          indexes: [
            {
              id: "idx-user-id",
              name: "idx_users_id",
              columns: [{ columnName: "id", order: "ASC" }],
              isUnique: true
            }
          ]
        }
      },
      relations: {}
    };

    dbService.saveProject("p-101", ast);

    const projectsList = dbService.listProjects();
    expect(projectsList.length).toBe(1);
    expect(projectsList[0].name).toBe("E-Commerce DB");

    const loaded = dbService.getProject("p-101");
    expect(loaded).toBeDefined();
    expect(loaded?.project.name).toBe("E-Commerce DB");
    expect(loaded?.tables["tbl-users"]).toBeDefined();
    expect(loaded?.tables["tbl-users"].columns[0].name).toBe("id");
    expect(loaded?.tables["tbl-users"].indexes?.length).toBe(1);
    expect(loaded?.tables["tbl-users"].indexes?.[0].name).toBe("idx_users_id");
    expect(loaded?.tables["tbl-users"].indexes?.[0].isUnique).toBe(true);
  });

  it("should overwrite project on save and handle project deletion", () => {
    const initialAst: SchemaAST = {
      project: { id: "p-202", name: "Version 1", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      settings: { dialect: "postgres", theme: "dark" },
      tables: {},
      relations: {}
    };

    dbService.saveProject("p-202", initialAst);
    let loaded = dbService.getProject("p-202");
    expect(loaded?.project.name).toBe("Version 1");

    // Overwrite with Version 2
    const updatedAst: SchemaAST = {
      ...initialAst,
      project: { ...initialAst.project, name: "Version 2" }
    };
    dbService.saveProject("p-202", updatedAst);

    loaded = dbService.getProject("p-202");
    expect(loaded?.project.name).toBe("Version 2");

    // Delete
    dbService.deleteProject("p-202");
    expect(dbService.getProject("p-202")).toBeNull();
  });
});
