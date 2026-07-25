import { SchemaAST, Table, Relation } from "@/packages/schema-core";

export interface ValidationError {
  type: 'error' | 'warning';
  path: string; // e.g. "tables.users" or "tables.users.columns.email"
  message: string;
}

export interface ValidationRule {
  validate(ast: SchemaAST): ValidationError[];
}

// 1. Rule to check for duplicate table names
export class DuplicateTableRule implements ValidationRule {
  public validate(ast: SchemaAST): ValidationError[] {
    const errors: ValidationError[] = [];
    const nameMap = new Map<string, string[]>(); // name -> array of table IDs

    for (const table of Object.values(ast.tables)) {
      const name = table.name.toLowerCase();
      const existing = nameMap.get(name) || [];
      existing.push(table.id);
      nameMap.set(name, existing);
    }

    for (const [name, ids] of nameMap.entries()) {
      if (ids.length > 1) {
        for (const id of ids) {
          const table = ast.tables[id];
          errors.push({
            type: 'error',
            path: `tables.${table.name}`,
            message: `Duplicate table name: "${table.name}". Table names must be unique in the schema.`
          });
        }
      }
    }

    return errors;
  }
}

// 2. Rule to check for duplicate column names in each table
export class DuplicateColumnRule implements ValidationRule {
  public validate(ast: SchemaAST): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const table of Object.values(ast.tables)) {
      const nameMap = new Map<string, string[]>(); // name -> array of column IDs

      for (const col of table.columns) {
        const name = col.name.toLowerCase();
        const existing = nameMap.get(name) || [];
        existing.push(col.id);
        nameMap.set(name, existing);
      }

      for (const [name, ids] of nameMap.entries()) {
        if (ids.length > 1) {
          errors.push({
            type: 'error',
            path: `tables.${table.name}.columns.${name}`,
            message: `Duplicate column name: "${name}" in table "${table.name}". Column names must be unique within a table.`
          });
        }
      }
    }

    return errors;
  }
}

// 3. Rule to check if a table is missing a primary key
export class PrimaryKeyRule implements ValidationRule {
  public validate(ast: SchemaAST): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const table of Object.values(ast.tables)) {
      const hasPK = table.columns.some(col => col.constraints.isPrimaryKey);
      if (!hasPK && table.columns.length > 0) {
        errors.push({
          type: 'warning',
          path: `tables.${table.name}`,
          message: `Table "${table.name}" is missing a primary key. It is recommended to define a primary key for each table.`
        });
      }
    }

    return errors;
  }
}

// 4. Rule to check if relation references valid tables and columns
export class ForeignKeyReferenceRule implements ValidationRule {
  public validate(ast: SchemaAST): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const rel of Object.values(ast.relations)) {
      const sourceTable = ast.tables[rel.sourceTableId];
      const targetTable = ast.tables[rel.targetTableId];

      if (!sourceTable) {
        errors.push({
          type: 'error',
          path: `relations.${rel.id}`,
          message: `Relationship "${rel.id}" references an invalid source table ID: "${rel.sourceTableId}".`
        });
        continue;
      }

      if (!targetTable) {
        errors.push({
          type: 'error',
          path: `relations.${rel.id}`,
          message: `Relationship "${rel.id}" references an invalid target table: "${rel.targetTableId}".`
        });
        continue;
      }

      const sourceCol = sourceTable.columns.find(c => c.id === rel.sourceColumnId);
      const targetCol = targetTable.columns.find(c => c.id === rel.targetColumnId);

      if (!sourceCol) {
        errors.push({
          type: 'error',
          path: `relations.${rel.id}`,
          message: `Relationship "${rel.id}" references an invalid source column: "${rel.sourceColumnId}" in table "${sourceTable.name}".`
        });
      }

      if (!targetCol) {
        errors.push({
          type: 'error',
          path: `relations.${rel.id}`,
          message: `Relationship "${rel.id}" references an invalid target column: "${rel.targetColumnId}" in table "${targetTable.name}".`
        });
      }
    }

    return errors;
  }
}

// 5. Rule to check for duplicate enum names
export class DuplicateEnumRule implements ValidationRule {
  public validate(ast: SchemaAST): ValidationError[] {
    const errors: ValidationError[] = [];
    if (!ast.enums) return errors;

    const nameMap = new Map<string, string[]>();

    for (const enumDef of Object.values(ast.enums)) {
      const name = enumDef.name.toLowerCase();
      const existing = nameMap.get(name) || [];
      existing.push(enumDef.id);
      nameMap.set(name, existing);
    }

    for (const [name, ids] of nameMap.entries()) {
      if (ids.length > 1) {
        for (const id of ids) {
          const enumDef = ast.enums[id];
          errors.push({
            type: 'error',
            path: `enums.${enumDef.name}`,
            message: `Duplicate enum name: "${enumDef.name}". Enum names must be unique in the schema.`
          });
        }
      }
    }

    return errors;
  }
}

// 6. Rule to warn if an enum has no values
export class EmptyEnumRule implements ValidationRule {
  public validate(ast: SchemaAST): ValidationError[] {
    const errors: ValidationError[] = [];
    if (!ast.enums) return errors;

    for (const enumDef of Object.values(ast.enums)) {
      if (enumDef.values.length === 0) {
        errors.push({
          type: 'warning',
          path: `enums.${enumDef.name}`,
          message: `Enum "${enumDef.name}" has no values defined. Add at least one value.`
        });
      }
    }

    return errors;
  }
}

// 7. Rule to check if a column references a non-existent enum
export class OrphanEnumColumnRule implements ValidationRule {
  public validate(ast: SchemaAST): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const table of Object.values(ast.tables)) {
      for (const col of table.columns) {
        if (col.enumId && (!ast.enums || !ast.enums[col.enumId])) {
          errors.push({
            type: 'error',
            path: `tables.${table.name}.columns.${col.name}`,
            message: `Column "${col.name}" in table "${table.name}" references a missing enum (ID: "${col.enumId}"). Change the column type or recreate the enum.`
          });
        }
      }
    }

    return errors;
  }
}

// The main validation runner coordinator class (DIP & OCP)
export class SchemaValidator {
  private rules: ValidationRule[];

  constructor(customRules?: ValidationRule[]) {
    this.rules = customRules || [
      new DuplicateTableRule(),
      new DuplicateColumnRule(),
      new PrimaryKeyRule(),
      new ForeignKeyReferenceRule(),
      new DuplicateEnumRule(),
      new EmptyEnumRule(),
      new OrphanEnumColumnRule()
    ];
  }

  public validate(ast: SchemaAST): ValidationError[] {
    const errors: ValidationError[] = [];
    for (const rule of this.rules) {
      try {
        errors.push(...rule.validate(ast));
      } catch (err) {
        console.error("Validation rule failed:", err);
      }
    }
    return errors;
  }
}

