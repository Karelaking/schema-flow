import { SchemaAST } from "@/packages/schema-core";

/**
 * Validation error/warning item interface.
 */
export interface ValidationError {
    type: "error" | "warning";
    path: string;
    message: string;
}

/**
 * Interface defining a schema validation rule closure.
 */
export interface ValidationRule {
    validate: (ast: SchemaAST) => ValidationError[];
}

/**
 * Validation rule checking for duplicate table names in schema.
 */
export const validateDuplicateTables = (ast: SchemaAST): ValidationError[] => {
    const errors: ValidationError[] = [];
    const nameMap = new Map<string, string[]>();

    for (const table of Object.values(ast.tables)) {
        const name = table.name.toLowerCase();
        const existing = nameMap.get(name) || [];
        existing.push(table.id);
        nameMap.set(name, existing);
    }

    for (const [, ids] of nameMap.entries()) {
        if (ids.length > 1) {
            for (const id of ids) {
                const table = ast.tables[id];
                errors.push({
                    type: "error",
                    path: `tables.${table.name}`,
                    message: `Duplicate table name: "${table.name}". Table names must be unique in the schema.`
                });
            }
        }
    }

    return errors;
};

/**
 * Validation rule checking for duplicate column names within tables.
 */
export const validateDuplicateColumns = (ast: SchemaAST): ValidationError[] => {
    const errors: ValidationError[] = [];

    for (const table of Object.values(ast.tables)) {
        const nameMap = new Map<string, string[]>();

        for (const column of table.columns) {
            const name = column.name.toLowerCase();
            const existing = nameMap.get(name) || [];
            existing.push(column.id);
            nameMap.set(name, existing);
        }

        for (const [name, ids] of nameMap.entries()) {
            if (ids.length > 1) {
                errors.push({
                    type: "error",
                    path: `tables.${table.name}.columns.${name}`,
                    message: `Duplicate column name: "${name}" in table "${table.name}". Column names must be unique within a table.`
                });
            }
        }
    }

    return errors;
};

/**
 * Validation rule warning if tables lack primary keys.
 */
export const validatePrimaryKeys = (ast: SchemaAST): ValidationError[] => {
    const errors: ValidationError[] = [];

    for (const table of Object.values(ast.tables)) {
        const hasPK = table.columns.some(col => col.constraints.isPrimaryKey);
        if (!hasPK && table.columns.length > 0) {
            errors.push({
                type: "warning",
                path: `tables.${table.name}`,
                message: `Table "${table.name}" is missing a primary key. It is recommended to define a primary key for each table.`
            });
        }
    }

    return errors;
};

/**
 * Validation rule checking for broken foreign key references.
 */
export const validateForeignKeyReferences = (ast: SchemaAST): ValidationError[] => {
    const errors: ValidationError[] = [];

    for (const rel of Object.values(ast.relations)) {
        const sourceTable = ast.tables[rel.sourceTableId];
        const targetTable = ast.tables[rel.targetTableId];

        if (!sourceTable) {
            errors.push({
                type: "error",
                path: `relations.${rel.id}`,
                message: `Relationship "${rel.id}" references an invalid source table ID: "${rel.sourceTableId}".`
            });
            continue;
        }

        if (!targetTable) {
            errors.push({
                type: "error",
                path: `relations.${rel.id}`,
                message: `Relationship "${rel.id}" references an invalid target table: "${rel.targetTableId}".`
            });
            continue;
        }

        const sourceCol = sourceTable.columns.find(col => col.id === rel.sourceColumnId);
        const targetCol = targetTable.columns.find(col => col.id === rel.targetColumnId);

        if (!sourceCol) {
            errors.push({
                type: "error",
                path: `relations.${rel.id}`,
                message: `Relationship "${rel.id}" references an invalid source column: "${rel.sourceColumnId}" in table "${sourceTable.name}".`
            });
        }

        if (!targetCol) {
            errors.push({
                type: "error",
                path: `relations.${rel.id}`,
                message: `Relationship "${rel.id}" references an invalid target column: "${rel.targetColumnId}" in table "${targetTable.name}".`
            });
        }
    }

    return errors;
};

/**
 * Validation rule checking for duplicate enum names.
 */
export const validateDuplicateEnums = (ast: SchemaAST): ValidationError[] => {
    const errors: ValidationError[] = [];
    if (!ast.enums) {
        return errors;
    }

    const nameMap = new Map<string, string[]>();

    for (const enumDef of Object.values(ast.enums)) {
        const name = enumDef.name.toLowerCase();
        const existing = nameMap.get(name) || [];
        existing.push(enumDef.id);
        nameMap.set(name, existing);
    }

    for (const [, ids] of nameMap.entries()) {
        if (ids.length > 1) {
            for (const id of ids) {
                const enumDef = ast.enums[id];
                errors.push({
                    type: "error",
                    path: `enums.${enumDef.name}`,
                    message: `Duplicate enum name: "${enumDef.name}". Enum names must be unique in the schema.`
                });
            }
        }
    }

    return errors;
};

/**
 * Validation rule warning if an enum has no values.
 */
export const validateEmptyEnums = (ast: SchemaAST): ValidationError[] => {
    const errors: ValidationError[] = [];
    if (!ast.enums) {
        return errors;
    }

    for (const enumDef of Object.values(ast.enums)) {
        if (enumDef.values.length === 0) {
            errors.push({
                type: "warning",
                path: `enums.${enumDef.name}`,
                message: `Enum "${enumDef.name}" has no values defined. Add at least one value.`
            });
        }
    }

    return errors;
};

/**
 * Validation rule checking if column references a missing enum.
 */
export const validateOrphanEnumColumns = (ast: SchemaAST): ValidationError[] => {
    const errors: ValidationError[] = [];

    for (const table of Object.values(ast.tables)) {
        for (const col of table.columns) {
            if (col.enumId && (!ast.enums || !ast.enums[col.enumId])) {
                errors.push({
                    type: "error",
                    path: `tables.${table.name}.columns.${col.name}`,
                    message: `Column "${col.name}" in table "${table.name}" references a missing enum (ID: "${col.enumId}"). Change the column type or recreate the enum.`
                });
            }
        }
    }

    return errors;
};

/**
 * Runs full schema validation suite against a SchemaAST payload.
 * @param ast Schema AST definition.
 * @param customRules Optional custom array of validation rule closures.
 * @returns Array of validation errors and warnings.
 */
export const validateSchema = (ast: SchemaAST, customRules?: ValidationRule[]): ValidationError[] => {
    const rules: ValidationRule[] = customRules || [
        { validate: validateDuplicateTables },
        { validate: validateDuplicateColumns },
        { validate: validatePrimaryKeys },
        { validate: validateForeignKeyReferences },
        { validate: validateDuplicateEnums },
        { validate: validateEmptyEnums },
        { validate: validateOrphanEnumColumns },
    ];

    const errors: ValidationError[] = [];
    for (const rule of rules) {
        try {
            errors.push(...rule.validate(ast));
        }
        catch (err: unknown) {
            console.error("Validation rule failed:", err);
        }
    }

    return errors;
};
