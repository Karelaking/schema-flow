import { describe, it, expect } from "vitest";
import { SchemaValidator } from "../packages/validation";
import { SchemaAST } from "../packages/schema-core";

describe("SchemaValidator", () => {
  const validator = new SchemaValidator();

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
      relations: {}
    };
    const errors = validator.validate(ast);
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
          name: "users", // duplicate
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
      relations: {}
    };
    const errors = validator.validate(ast);
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
              name: "email", // duplicate column
              type: "TEXT",
              constraints: { isPrimaryKey: false, isNullable: false, isUnique: false, isAutoIncrement: false }
            }
          ]
        }
      },
      relations: {}
    };
    const errors = validator.validate(ast);
    const colErrors = errors.filter(e => e.path === "tables.users.columns.email");
    expect(colErrors).toHaveLength(1);
    expect(colErrors[0].type).toBe("error");
    expect(colErrors[0].message).toContain("Duplicate column name");
  });

  it("should flag a warning for tables without a primary key", () => {
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
            }
          ]
        }
      },
      relations: {}
    };
    const errors = validator.validate(ast);
    const tableErrors = errors.filter(e => e.path === "tables.users");
    expect(tableErrors).toHaveLength(1);
    expect(tableErrors[0].type).toBe("warning");
    expect(tableErrors[0].message).toContain("missing a primary key");
  });

  it("should flag an error for relationships referencing non-existent tables or columns", () => {
    const ast: SchemaAST = {
      project: { id: "1", name: "Test", createdAt: "", updatedAt: "" },
      settings: { dialect: "sqlite", theme: "dark" },
      tables: {
        "t1": {
          id: "t1",
          name: "posts",
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
      relations: {
        "r1": {
          id: "r1",
          sourceTableId: "t1",
          sourceColumnId: "c1",
          targetTableId: "t_invalid", // invalid target table
          targetColumnId: "c_invalid",
          type: "many-to-one"
        }
      }
    };
    const errors = validator.validate(ast);
    const relErrors = errors.filter(e => e.path.startsWith("relations.r1"));
    expect(relErrors.length).toBeGreaterThan(0);
    expect(relErrors[0].type).toBe("error");
    expect(relErrors[0].message).toContain("references an invalid target table");
  });
});
