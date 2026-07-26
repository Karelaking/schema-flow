import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DatabaseService } from "@/packages/db";
import { SchemaAST } from "@/packages/schema-core";
import fs from "fs";
import path from "path";

describe("DatabaseService Edge Cases", () => {
    const testDbFile = path.join(__dirname, "test_temp_db.db");
    const testDbUrl = `file:${testDbFile}`;
    let dbService: DatabaseService;

    beforeEach(() => {
        if (fs.existsSync(testDbFile)) {
            try {
                fs.unlinkSync(testDbFile);
            }
            catch {}
        }
        dbService = new DatabaseService(testDbUrl);
    });

    afterEach(() => {
        if (dbService) {
            dbService.close();
        }
        if (fs.existsSync(testDbFile)) {
            try {
                fs.unlinkSync(testDbFile);
            }
            catch {}
        }
    });

    it("should return empty list when no projects exist", async () => {
        const projects = await dbService.listProjects();
        expect(projects).toEqual([]);
    });

    it("should return undefined when querying non-existent project ID", async () => {
        const project = await dbService.getProject("non-existent-id");
        expect(project).toBeUndefined();
    });

    it("should save and retrieve a full project AST with tables and relations", async () => {
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
            relations: {},
            enums: {},
        };

        await dbService.saveProject("p-101", ast);

        const projectsList = await dbService.listProjects();
        expect(projectsList.length).toBe(1);
        expect(projectsList[0].name).toBe("E-Commerce DB");

        const loaded = await dbService.getProject("p-101");
        expect(loaded).toBeDefined();
        expect(loaded?.project.name).toBe("E-Commerce DB");
        expect(loaded?.tables["tbl-users"]).toBeDefined();
        expect(loaded?.tables["tbl-users"].columns[0].name).toBe("id");
        expect(loaded?.tables["tbl-users"].indexes?.length).toBe(1);
        expect(loaded?.tables["tbl-users"].indexes?.[0].name).toBe("idx_users_id");
        expect(loaded?.tables["tbl-users"].indexes?.[0].isUnique).toBe(true);
    });

    it("should overwrite project on save and handle project deletion", async () => {
        const initialAst: SchemaAST = {
            project: { id: "p-202", name: "Version 1", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            settings: { dialect: "postgres", theme: "dark" },
            tables: {},
            relations: {},
            enums: {},
        };

        await dbService.saveProject("p-202", initialAst);
        let loaded = await dbService.getProject("p-202");
        expect(loaded?.project.name).toBe("Version 1");

        const updatedAst: SchemaAST = {
            ...initialAst,
            project: { ...initialAst.project, name: "Version 2" },
        };

        await dbService.saveProject("p-202", updatedAst);
        loaded = await dbService.getProject("p-202");
        expect(loaded?.project.name).toBe("Version 2");

        await dbService.deleteProject("p-202");
        loaded = await dbService.getProject("p-202");
        expect(loaded).toBeUndefined();
    });
});
