import { SchemaAST, Table } from "@/packages/schema-core";
import { BaseGenerator } from "../base/Generator";

export class PostgreSQLGenerator extends BaseGenerator {
  public generate(ast: SchemaAST): string {
    const statements: string[] = [];

    // Generate enum type definitions first
    if (ast.enums) {
      for (const enumDef of Object.values(ast.enums)) {
        if (enumDef.values.length > 0) {
          const values = enumDef.values.map(v => `'${v}'`).join(", ");
          statements.push(`CREATE TYPE "${enumDef.name}" AS ENUM (${values});`);
        }
      }
    }

    const tables = Object.values(ast.tables);
    for (const table of tables) {
      statements.push(this.generateTable(table, ast));
    }

    return statements.join("\n\n");
  }

  private generateTable(table: Table, ast: SchemaAST): string {
    const lines: string[] = [];
    const pkColumns = table.columns.filter(col => col.constraints.isPrimaryKey);
    const isCompositePk = pkColumns.length > 1;

    for (const col of table.columns) {
      let pgType = col.type;

      // Resolve enum type
      if (col.enumId && ast.enums && ast.enums[col.enumId]) {
        pgType = `"${ast.enums[col.enumId].name}"`;
      } else if (col.constraints.isAutoIncrement) {
        pgType = col.type.toUpperCase() === "INTEGER" ? "SERIAL" : "BIGSERIAL";
      }

      let colDef = `  "${col.name}" ${pgType}`;

      if (col.constraints.isPrimaryKey && !isCompositePk) {
        colDef += " PRIMARY KEY";
      }

      if (!col.constraints.isNullable && !(col.constraints.isPrimaryKey && !isCompositePk)) {
        colDef += " NOT NULL";
      }

      if (col.constraints.isUnique) {
        colDef += " UNIQUE";
      }

      if (col.constraints.defaultValue) {
        // For enum columns, wrap default value in quotes
        if (col.enumId && ast.enums && ast.enums[col.enumId]) {
          colDef += ` DEFAULT '${col.constraints.defaultValue}'`;
        } else {
          colDef += ` DEFAULT ${col.constraints.defaultValue}`;
        }
      }

      lines.push(colDef);
    }

    if (isCompositePk) {
      const pkNames = pkColumns.map(col => `"${col.name}"`).join(", ");
      lines.push(`  PRIMARY KEY (${pkNames})`);
    }

    const tableComment = table.description ? `-- ${table.description}\n` : "";
    let createTable = `${tableComment}CREATE TABLE "${table.name}" (\n${lines.join(",\n")}\n);`;

    if (table.indexes && table.indexes.length > 0) {
      const idxLines: string[] = [];
      for (const idx of table.indexes) {
        if (!idx.columns || idx.columns.length === 0) continue;
        const colList = idx.columns.map(c => `"${c.columnName}"${c.order ? ` ${c.order}` : ""}`).join(", ");
        const uniqueKw = idx.isUnique ? "UNIQUE " : "";
        idxLines.push(`CREATE ${uniqueKw}INDEX "${idx.name}" ON "${table.name}" (${colList});`);
      }
      if (idxLines.length > 0) {
        createTable += "\n" + idxLines.join("\n");
      }
    }

    return createTable;
  }
}

