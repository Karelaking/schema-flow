import { SchemaAST, Table, Relation } from "@/packages/schema-core";
import { BaseGenerator } from "../base/Generator";

export class SQLiteGenerator extends BaseGenerator {
  public generate(ast: SchemaAST): string {
    const statements: string[] = [];

    // Filter and sort tables to try to create dependencies first
    const tables = Object.values(ast.tables);
    const sortedTables = this.sortTablesByDependency(tables, Object.values(ast.relations));

    for (const table of sortedTables) {
      statements.push(this.generateTable(table, ast));
    }

    return statements.join("\n\n");
  }

  private generateTable(table: Table, ast: SchemaAST): string {
    const lines: string[] = [];
    const pkColumns = table.columns.filter(col => col.constraints.isPrimaryKey);
    const isCompositePk = pkColumns.length > 1;

    // 1. Columns definitions
    for (const col of table.columns) {
      let colDef = `  ${col.name} ${col.type}`;

      // Single column primary key
      if (col.constraints.isPrimaryKey && !isCompositePk) {
        colDef += " PRIMARY KEY";
        if (col.type.toUpperCase() === "INTEGER" && col.constraints.isAutoIncrement) {
          colDef += " AUTOINCREMENT";
        }
      }

      if (!col.constraints.isNullable && !(col.constraints.isPrimaryKey && !isCompositePk)) {
        colDef += " NOT NULL";
      }

      if (col.constraints.isUnique) {
        colDef += " UNIQUE";
      }

      if (col.constraints.defaultValue !== undefined && col.constraints.defaultValue !== null && col.constraints.defaultValue !== "") {
        colDef += ` DEFAULT ${col.constraints.defaultValue}`;
      }

      if (col.constraints.checkConstraint) {
        colDef += ` CHECK (${col.constraints.checkConstraint})`;
      }

      // Add column comment if present
      if (col.comment) {
        colDef += ` /* ${col.comment} */`;
      }

      lines.push(colDef);
    }

    // 2. Table-level Primary Key (Composite)
    if (isCompositePk) {
      const pkNames = pkColumns.map(col => col.name).join(", ");
      lines.push(`  PRIMARY KEY (${pkNames})`);
    }

    // 3. Table-level Foreign Keys
    const tableRelations = Object.values(ast.relations).filter(
      rel => rel.sourceTableId === table.id
    );

    for (const rel of tableRelations) {
      const sourceCol = table.columns.find(c => c.id === rel.sourceColumnId);
      const targetTable = ast.tables[rel.targetTableId];
      const targetCol = targetTable?.columns.find(c => c.id === rel.targetColumnId);

      if (sourceCol && targetTable && targetCol) {
        let fkDef = `  FOREIGN KEY (${sourceCol.name}) REFERENCES ${targetTable.name} (${targetCol.name})`;
        if (rel.onDelete && rel.onDelete !== "no-action") {
          fkDef += ` ON DELETE ${rel.onDelete.toUpperCase()}`;
        }
        if (rel.onUpdate && rel.onUpdate !== "no-action") {
          fkDef += ` ON UPDATE ${rel.onUpdate.toUpperCase()}`;
        }
        lines.push(fkDef);
      }
    }

    const tableComment = table.description ? `-- ${table.description}\n` : "";
    let createTable = `${tableComment}CREATE TABLE ${table.name} (\n${lines.join(",\n")}\n);`;

    if (table.indexes && table.indexes.length > 0) {
      const idxLines: string[] = [];
      for (const idx of table.indexes) {
        if (!idx.columns || idx.columns.length === 0) continue;
        const colList = idx.columns.map(c => `${c.columnName}${c.order ? ` ${c.order}` : ""}`).join(", ");
        const uniqueKw = idx.isUnique ? "UNIQUE " : "";
        idxLines.push(`CREATE ${uniqueKw}INDEX ${idx.name} ON ${table.name} (${colList});`);
      }
      if (idxLines.length > 0) {
        createTable += "\n" + idxLines.join("\n");
      }
    }

    return createTable;
  }

  // A simple dependency sorting helper to generate target tables before source tables
  private sortTablesByDependency(tables: Table[], relations: Relation[]): Table[] {
    const visited = new Set<string>();
    const temp = new Set<string>();
    const result: Table[] = [];

    const visit = (tableId: string) => {
      if (visited.has(tableId)) return;
      if (temp.has(tableId)) {
        return;
      }

      temp.add(tableId);

      // Find tables that this table references (dependencies)
      const dependencies = relations
        .filter(rel => rel.sourceTableId === tableId)
        .map(rel => rel.targetTableId);

      for (const depId of dependencies) {
        if (depId !== tableId && tables.some(t => t.id === depId)) {
          visit(depId);
        }
      }

      temp.delete(tableId);
      visited.add(tableId);
      
      const tbl = tables.find(t => t.id === tableId);
      if (tbl) result.push(tbl);
    };

    for (const table of tables) {
      visit(table.id);
    }

    return result;
  }
}
