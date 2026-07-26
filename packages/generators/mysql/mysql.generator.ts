import { SchemaAST, Table } from "@/packages/schema-core";
import { CodeGenerator, formatSqlComment } from "../base/base.generator";
import { resolveRelationFK } from "@/lib/react-flow-utils";
import { sortTablesByDependency } from "../sqlite/sqlite.generator";

/**
 * Closure function generating SQL for a single MySQL table.
 * @param table Target table definition.
 * @param ast Root Schema AST.
 * @returns Generated SQL CREATE TABLE statement.
 */
export const generateMysqlTable = (table: Table, ast: SchemaAST): string => {
    const lines: string[] = [];
    const pkColumns = table.columns.filter(column => column.constraints.isPrimaryKey);
    const isCompositePk = pkColumns.length > 1;

    for (const column of table.columns) {
        let columnDef = `  \`${column.name}\` `;

        if (column.enumId && ast.enums && ast.enums[column.enumId]) {
            const enumDef = ast.enums[column.enumId];
            const values = enumDef.values.map(val => `'${val}'`).join(", ");
            columnDef += `ENUM(${values})`;
        }
        else {
            columnDef += column.type;
        }

        if (column.constraints.isPrimaryKey && !isCompositePk) {
            columnDef += " PRIMARY KEY";
        }

        if (column.constraints.isAutoIncrement) {
            columnDef += " AUTO_INCREMENT";
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

        if (column.comment) {
            columnDef += ` COMMENT '${column.comment}'`;
        }

        lines.push(columnDef);
    }

    if (isCompositePk) {
        const pkNames = pkColumns.map(column => `\`${column.name}\``).join(", ");
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
            let fkDef = `  CONSTRAINT \`fk_${table.name}_${sourceColumn.name}\` FOREIGN KEY (\`${sourceColumn.name}\`) REFERENCES \`${targetTable.name}\` (\`${targetColumn.name}\`)`;
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
    let createTable = `${tableComment}CREATE TABLE \`${table.name}\` (\n${lines.join(",\n")}\n);`;

    if (table.indexes && table.indexes.length > 0) {
        const indexLines: string[] = [];
        for (const index of table.indexes) {
            if (!index.columns || index.columns.length === 0) {
                continue;
            }
            const colList = index.columns.map(column => `\`${column.columnName}\`${column.order ? ` ${column.order}` : ""}`).join(", ");
            const uniqueKeyword = index.isUnique ? "UNIQUE " : "";
            indexLines.push(`CREATE ${uniqueKeyword}INDEX \`${index.name}\` ON \`${table.name}\` (${colList});`);
        }
        if (indexLines.length > 0) {
            createTable += "\n" + indexLines.join("\n");
        }
    }

    return createTable;
};

/**
 * Creates a MySQL CodeGenerator function closure instance.
 * @returns CodeGenerator closure.
 */
export const createMysqlGenerator = (): CodeGenerator => {
    const generate = (ast: SchemaAST): string => {
        const statements: string[] = [];

        const tables = Object.values(ast.tables);
        const sortedTables = sortTablesByDependency(tables, Object.values(ast.relations || {}));

        for (const table of sortedTables) {
            statements.push(generateMysqlTable(table, ast));
        }

        return statements.join("\n\n");
    };

    return { generate };
};
