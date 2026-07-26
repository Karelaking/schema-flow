import { SchemaAST, Table } from "@/packages/schema-core";
import { CodeGenerator } from "../base/base.generator";

/**
 * Helper to convert table/enum string name to singular PascalCase.
 * @param str Input string.
 * @returns Singularized PascalCase string.
 */
export const toPascalCaseSingular = (str: string): string => {
    if (!str) {
        return "Entity";
    }

    const parts = str.split(/[_\-\s]+/);
    let result = parts
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join("");

    if (result.endsWith("s") && !result.endsWith("ss") && !result.endsWith("us") && !result.endsWith("is") && !result.endsWith("as") && !result.endsWith("os")) {
        result = result.slice(0, -1);
    }

    return result;
};

/**
 * Helper to map SQL types to TypeScript types.
 * @param dbType Database column type.
 * @param enumId Optional enum ID reference.
 * @param ast Root Schema AST.
 * @returns Mapped TypeScript type string.
 */
export const mapTypeToTypeScript = (dbType: string, enumId?: string, ast?: SchemaAST): string => {
    if (enumId && ast?.enums && ast.enums[enumId]) {
        return toPascalCaseSingular(ast.enums[enumId].name) + "Enum";
    }

    const upper = dbType.toUpperCase();
    if (["INTEGER", "REAL", "NUMERIC", "DOUBLE", "FLOAT", "DECIMAL"].includes(upper)) {
        return "number";
    }
    if (["TEXT", "VARCHAR", "CHAR", "DATE", "TIME", "DATETIME", "TIMESTAMP"].includes(upper)) {
        return "string";
    }
    if (["BOOLEAN", "BOOL"].includes(upper)) {
        return "boolean";
    }
    if (["BLOB", "BINARY", "VARBINARY"].includes(upper)) {
        return "Uint8Array";
    }
    if (["JSON", "JSONB"].includes(upper)) {
        return "Record<string, unknown>";
    }
    return "string";
};

/**
 * Generates main entity interface string for a table.
 * @param typeName TypeScript interface name.
 * @param table Table schema.
 * @param ast Root Schema AST.
 * @returns Interface code block string.
 */
export const generateEntityInterface = (typeName: string, table: Table, ast: SchemaAST): string => {
    const lines: string[] = [];

    if (table.description) {
        lines.push(`/**\n * ${table.description}\n */`);
    }

    lines.push(`export interface ${typeName} {`);

    for (const column of table.columns) {
        const tsType = mapTypeToTypeScript(column.type, column.enumId, ast);
        const isNullable = column.constraints.isNullable;
        const comment = column.comment ? ` // ${column.comment}` : "";

        lines.push(`  ${column.name}: ${tsType}${isNullable ? " | null" : ""};${comment}`);
    }

    lines.push(`}`);
    return lines.join("\n");
};

/**
 * Generates insert DTO interface string for a table.
 * @param typeName TypeScript interface name.
 * @param table Table schema.
 * @param ast Root Schema AST.
 * @returns Insert interface code block string.
 */
export const generateInsertInterface = (typeName: string, table: Table, ast: SchemaAST): string => {
    const lines: string[] = [];
    lines.push(`export interface ${typeName}Insert {`);

    for (const column of table.columns) {
        const tsType = mapTypeToTypeScript(column.type, column.enumId, ast);
        const isNullable = column.constraints.isNullable;
        const hasDefault = column.constraints.defaultValue !== undefined && column.constraints.defaultValue !== "";
        const isAutoInc = column.constraints.isAutoIncrement;

        const isOptional = isNullable || isAutoInc || hasDefault;
        const comment = column.comment ? ` // ${column.comment}` : "";

        lines.push(`  ${column.name}${isOptional ? "?" : ""}: ${tsType}${isNullable ? " | null" : ""};${comment}`);
    }

    lines.push(`}`);
    return lines.join("\n");
};

/**
 * Generates update DTO interface string for a table.
 * @param typeName TypeScript interface name.
 * @param table Table schema.
 * @param ast Root Schema AST.
 * @returns Update interface code block string.
 */
export const generateUpdateInterface = (typeName: string, table: Table, ast: SchemaAST): string => {
    const lines: string[] = [];
    lines.push(`export interface ${typeName}Update {`);

    for (const column of table.columns) {
        const tsType = mapTypeToTypeScript(column.type, column.enumId, ast);
        const isNullable = column.constraints.isNullable;
        const comment = column.comment ? ` // ${column.comment}` : "";

        lines.push(`  ${column.name}?: ${tsType}${isNullable ? " | null" : ""};${comment}`);
    }

    lines.push(`}`);
    return lines.join("\n");
};

/**
 * Creates a TypeScript CodeGenerator function closure instance.
 * @returns CodeGenerator closure.
 */
export const createTypescriptGenerator = (): CodeGenerator => {
    const generate = (ast: SchemaAST): string => {
        const outputs: string[] = [];

        if (ast.enums) {
            for (const enumDef of Object.values(ast.enums)) {
                if (enumDef.values.length > 0) {
                    const unionType = enumDef.values.map(val => `'${val}'`).join(" | ");
                    const typeName = toPascalCaseSingular(enumDef.name) + "Enum";
                    if (enumDef.description) {
                        outputs.push(`/** ${enumDef.description} */\nexport type ${typeName} = ${unionType};`);
                    }
                    else {
                        outputs.push(`export type ${typeName} = ${unionType};`);
                    }
                }
            }
        }

        for (const table of Object.values(ast.tables)) {
            const typeName = toPascalCaseSingular(table.name);

            const entityInterface = generateEntityInterface(typeName, table, ast);
            const insertInterface = generateInsertInterface(typeName, table, ast);
            const updateInterface = generateUpdateInterface(typeName, table, ast);

            outputs.push(`${entityInterface}\n\n${insertInterface}\n\n${updateInterface}`);
        }

        return outputs.join("\n\n// ==========================================\n\n");
    };

    return { generate };
};
