import { SchemaAST, Table, Relation } from "@/packages/schema-core";
import { CodeGenerator, formatSqlComment } from "../base/base.generator";
import { resolveRelationFK } from "@/lib/react-flow-utils";

/**
 * Helper closure to sort tables by foreign key dependency order.
 * @param tables Array of table definitions.
 * @param relations Array of relation definitions.
 * @returns Sorted array of tables.
 */
export const sortTablesByDependency = (tables: Table[], relations: Relation[]): Table[] => {
    const visited = new Set<string>();
    const temporary = new Set<string>();
    const result: Table[] = [];
    const tableMap = new Map(tables.map(table => [table.id, table]));

    const visit = (tableId: string): void => {
        if (visited.has(tableId)) {
            return;
        }
        if (temporary.has(tableId)) {
            return;
        }

        temporary.add(tableId);

        const dependencies = relations
            .filter(rel => {
                const resolved = resolveRelationFK(rel, tableMap as unknown as Record<string, Table>);
                return resolved.fkTableId === tableId;
            })
            .map(rel => {
                const resolved = resolveRelationFK(rel, tableMap as unknown as Record<string, Table>);
                return resolved.pkTableId;
            });

        for (const dependencyId of dependencies) {
            if (dependencyId !== tableId && tableMap.has(dependencyId)) {
                visit(dependencyId);
            }
        }

        temporary.delete(tableId);
        visited.add(tableId);

        const foundTable = tableMap.get(tableId);
        if (foundTable) {
            result.push(foundTable);
        }
    };

    for (const table of tables) {
        visit(table.id);
    }

    return result;
};

/**
 * Closure function generating SQL for a single SQLite table.
 * @param table Target table definition.
 * @param ast Root Schema AST.
 * @returns Generated SQL CREATE TABLE statement.
 */
export const generateSqliteTable = (table: Table, ast: SchemaAST): string => {
    const lines: string[] = [];
    const pkColumns = table.columns.filter(column => column.constraints.isPrimaryKey);
    const isCompositePk = pkColumns.length > 1;

    for (const column of table.columns) {
        let columnType = column.type;
        let enumCheckConstraint = "";

        if (column.enumId && ast.enums && ast.enums[column.enumId]) {
            const enumDef = ast.enums[column.enumId];
            columnType = "TEXT";
            const values = enumDef.values.map(val => `'${val}'`).join(", ");
            enumCheckConstraint = `${column.name} IN (${values})`;
        }

        let columnDef = `  ${column.name} ${columnType}`;

        if (column.constraints.isPrimaryKey && !isCompositePk) {
            columnDef += " PRIMARY KEY";
            if (column.type.toUpperCase() === "INTEGER" && column.constraints.isAutoIncrement) {
                columnDef += " AUTOINCREMENT";
            }
        }

        if (!column.constraints.isNullable && !(column.constraints.isPrimaryKey && !isCompositePk)) {
            columnDef += " NOT NULL";
        }

        if (column.constraints.isUnique) {
            columnDef += " UNIQUE";
        }

        if (column.constraints.defaultValue !== undefined && column.constraints.defaultValue !== "") {
            const defaultValue = column.constraints.defaultValue;
            if (column.enumId && ast.enums && ast.enums[column.enumId]) {
                const formatted = defaultValue.startsWith("'") ? defaultValue : `'${defaultValue}'`;
                columnDef += ` DEFAULT ${formatted}`;
            }
            else {
                columnDef += ` DEFAULT ${defaultValue}`;
            }
        }

        if (column.constraints.checkConstraint) {
            columnDef += ` CHECK (${column.constraints.checkConstraint})`;
        }
        else if (enumCheckConstraint) {
            columnDef += ` CHECK (${enumCheckConstraint})`;
        }

        if (column.comment) {
            columnDef += ` /* ${column.comment} */`;
        }

        lines.push(columnDef);
    }

    if (isCompositePk) {
        const pkNames = pkColumns.map(column => column.name).join(", ");
        lines.push(`  PRIMARY KEY (${pkNames})`);
    }

    const tableRelations = Object.values(ast.relations || {}).filter(rel => {
        const resolved = resolveRelationFK(rel, ast.tables);
        return resolved.fkTableId === table.id;
    });

    for (const relation of tableRelations) {
        const resolved = resolveRelationFK(relation, ast.tables);
        const sourceColumn = table.columns.find(col => col.id === resolved.fkColumnId);
        const targetTable = ast.tables[resolved.pkTableId];
        const targetColumn = targetTable?.columns.find(col => col.id === resolved.pkColumnId);

        if (sourceColumn && targetTable && targetColumn) {
            let fkDef = `  FOREIGN KEY (${sourceColumn.name}) REFERENCES ${targetTable.name} (${targetColumn.name})`;
            if (relation.onDelete && relation.onDelete !== "no-action") {
                fkDef += ` ON DELETE ${relation.onDelete.toUpperCase()}`;
            }
            if (relation.onUpdate && relation.onUpdate !== "no-action") {
                fkDef += ` ON UPDATE ${relation.onUpdate.toUpperCase()}`;
            }
            lines.push(fkDef);
        }
    }

    const tableComment = table.description ? `${formatSqlComment(table.description)}\n` : "";
    let createTable = `${tableComment}CREATE TABLE ${table.name} (\n${lines.join(",\n")}\n);`;

    if (table.indexes && table.indexes.length > 0) {
        const indexLines: string[] = [];
        for (const index of table.indexes) {
            if (!index.columns || index.columns.length === 0) {
                continue;
            }
            const colList = index.columns.map(column => `${column.columnName}${column.order ? ` ${column.order}` : ""}`).join(", ");
            const uniqueKeyword = index.isUnique ? "UNIQUE " : "";
            indexLines.push(`CREATE ${uniqueKeyword}INDEX ${index.name} ON ${table.name} (${colList});`);
        }
        if (indexLines.length > 0) {
            createTable += "\n" + indexLines.join("\n");
        }
    }

    return createTable;
};

/**
 * Creates a SQLite CodeGenerator function closure instance.
 * @returns CodeGenerator closure.
 */
export const createSqliteGenerator = (): CodeGenerator => {
    const generate = (ast: SchemaAST): string => {
        const statements: string[] = [];
        const tables = Object.values(ast.tables);
        const sortedTables = sortTablesByDependency(tables, Object.values(ast.relations || {}));

        for (const table of sortedTables) {
            statements.push(generateSqliteTable(table, ast));
        }

        return statements.join("\n\n");
    };

    return { generate };
};
