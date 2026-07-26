import { describe, it, expect } from "vitest";
import { validateSchema } from "@/packages/validation";
import { SchemaAST } from "@/packages/schema-core";

describe("validateSchema", () => {
    it("should validate a valid schema with no errors or warnings", () => {
        const ast: SchemaAST = {
            project: { id: "1", name: "Test", createdAt: "", updatedAt: "" },
            settings: { dialect: "sqlite", theme: "dark" },
            tables: {
                "t1": {
                    id: "t1",
                    name: "users",
                    position: { x: 0, y: 0 },
                    columns: [
                        {
                            id: "c1",
                            name: "id",
                            type: "INTEGER",
                            constraints: { isPrimaryKey: true, isNullable: false, isUnique: false, isAutoIncrement: true }
                        }
                    ]
                }
            },
            relations: {},
            enums: {},
        };
        const errors = validateSchema(ast);
        expect(errors).toHaveLength(0);
    });

    it("should flag an error for duplicate table names", () => {
        const ast: SchemaAST = {
            project: { id: "1", name: "Test", createdAt: "", updatedAt: "" },
            settings: { dialect: "sqlite", theme: "dark" },
            tables: {
                "t1": {
                    id: "t1",
                    name: "users",
                    position: { x: 0, y: 0 },
                    columns: [
                        {
                            id: "c1",
                            name: "id",
                            type: "INTEGER",
                            constraints: { isPrimaryKey: true, isNullable: false, isUnique: false, isAutoIncrement: true }
                        }
                    ]
                },
                "t2": {
                    id: "t2",
                    name: "users",
                    position: { x: 100, y: 100 },
                    columns: [
                        {
                            id: "c2",
                            name: "id",
                            type: "INTEGER",
                            constraints: { isPrimaryKey: true, isNullable: false, isUnique: false, isAutoIncrement: true }
                        }
                    ]
                }
            },
            relations: {},
            enums: {},
        };
        const errors = validateSchema(ast);
        const tableErrors = errors.filter(e => e.path === "tables.users");
        expect(tableErrors).toHaveLength(2);
        expect(tableErrors[0].type).toBe("error");
        expect(tableErrors[0].message).toContain("Duplicate table name");
    });

    it("should flag an error for duplicate column names in a table", () => {
        const ast: SchemaAST = {
            project: { id: "1", name: "Test", createdAt: "", updatedAt: "" },
            settings: { dialect: "sqlite", theme: "dark" },
            tables: {
                "t1": {
                    id: "t1",
                    name: "users",
                    position: { x: 0, y: 0 },
                    columns: [
                        {
                            id: "c1",
                            name: "email",
                            type: "TEXT",
                            constraints: { isPrimaryKey: false, isNullable: false, isUnique: true, isAutoIncrement: false }
                        },
                        {
                            id: "c2",
                            name: "email",
                            type: "TEXT",
                            constraints: { isPrimaryKey: false, isNullable: false, isUnique: false, isAutoIncrement: false }
                        }
                    ]
                }
            },
            relations: {},
            enums: {},
        };
        const errors = validateSchema(ast);
        const colErrors = errors.filter(e => e.path === "tables.users.columns.email");
        expect(colErrors).toHaveLength(1);
        expect(colErrors[0].type).toBe("error");
        expect(colErrors[0].message).toContain("Duplicate column name");
    });

    it("should flag a warning for table missing a primary key", () => {
        const ast: SchemaAST = {
            project: { id: "1", name: "Test", createdAt: "", updatedAt: "" },
            settings: { dialect: "sqlite", theme: "dark" },
            tables: {
                "t1": {
                    id: "t1",
                    name: "logs",
                    position: { x: 0, y: 0 },
                    columns: [
                        {
                            id: "c1",
                            name: "message",
                            type: "TEXT",
                            constraints: { isPrimaryKey: false, isNullable: true, isUnique: false, isAutoIncrement: false }
                        }
                    ]
                }
            },
            relations: {},
            enums: {},
        };
        const errors = validateSchema(ast);
        const pkWarnings = errors.filter(e => e.path === "tables.logs" && e.type === "warning");
        expect(pkWarnings).toHaveLength(1);
        expect(pkWarnings[0].message).toContain("missing a primary key");
    });
});
