import { SchemaAST, Table, Relation } from "@/packages/schema-core";
import { BaseGenerator } from "../base/Generator";
import { resolveRelationFK } from "@/lib/react-flow-utils";

export class SQLiteGenerator extends BaseGenerator {
  public generate(ast: SchemaAST): string {
    const statements: string[] = [];

    // Filter and sort tables to try to create dependencies first
    const tables = Object.values(ast.tables);
    const sortedTables = this.sortTablesByDependency(tables, Object.values(ast.relations || {}));

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
      let colType = col.type;
      let enumCheckConstraint = '';

      // Resolve enum type to TEXT + CHECK constraint for SQLite
      if (col.enumId && ast.enums && ast.enums[col.enumId]) {
        const enumDef = ast.enums[col.enumId];
        colType = 'TEXT';
        const values = enumDef.values.map(v => `'${v}'`).join(", ");
        enumCheckConstraint = `${col.name} IN (${values})`;
      }

      let colDef = `  ${col.name} ${colType}`;

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
        const defVal = col.constraints.defaultValue;
        if (col.enumId && ast.enums && ast.enums[col.enumId]) {
          const formatted = defVal.startsWith("'") ? defVal : `'${defVal}'`;
          colDef += ` DEFAULT ${formatted}`;
        } else {
          colDef += ` DEFAULT ${defVal}`;
        }
      }

      if (col.constraints.checkConstraint) {
        colDef += ` CHECK (${col.constraints.checkConstraint})`;
      } else if (enumCheckConstraint) {
        colDef += ` CHECK (${enumCheckConstraint})`;
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

    // 3. Table-level Foreign Keys based on relation resolution
    const tableRelations = Object.values(ast.relations || {}).filter(rel => {
      const resolved = resolveRelationFK(rel, ast.tables);
      return resolved.fkTableId === table.id;
    });

    for (const rel of tableRelations) {
      const resolved = resolveRelationFK(rel, ast.tables);
      const sourceCol = table.columns.find(c => c.id === resolved.fkColumnId);
      const targetTable = ast.tables[resolved.pkTableId];
      const targetCol = targetTable?.columns.find(c => c.id === resolved.pkColumnId);

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

  private sortTablesByDependency(tables: Table[], relations: Relation[]): Table[] {
    const visited = new Set<string>();
    const temp = new Set<string>();
    const result: Table[] = [];
    const tableMap = new Map(tables.map(t => [t.id, t]));

    const visit = (tableId: string) => {
      if (visited.has(tableId)) return;
      if (temp.has(tableId)) return;

      temp.add(tableId);

      // Find all tables that this table DEPENDS ON (the PK tables referenced by this table's FKs)
      const dependencies = relations
        .filter(rel => {
          const resolved = resolveRelationFK(rel, tableMap as unknown as Record<string, Table>);
          return resolved.fkTableId === tableId;
        })
        .map(rel => {
          const resolved = resolveRelationFK(rel, tableMap as unknown as Record<string, Table>);
          return resolved.pkTableId;
        });

      for (const depId of dependencies) {
        if (depId !== tableId && tableMap.has(depId)) {
          visit(depId);
        }
      }

      temp.delete(tableId);
      visited.add(tableId);

      const tbl = tableMap.get(tableId);
      if (tbl) result.push(tbl);
    };

    for (const table of tables) {
      visit(table.id);
    }

    return result;
  }
}
