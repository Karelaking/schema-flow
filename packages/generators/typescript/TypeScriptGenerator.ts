import { SchemaAST, Table } from "@/packages/schema-core";
import { CodeGenerator } from "../base/Generator";

export class TypeScriptGenerator implements CodeGenerator {
  public generate(ast: SchemaAST): string {
    const outputs: string[] = [];

    for (const table of Object.values(ast.tables)) {
      const typeName = this.toPascalCaseSingular(table.name);
      
      const entityInterface = this.generateEntityInterface(typeName, table);
      const insertInterface = this.generateInsertInterface(typeName, table);
      const updateInterface = this.generateUpdateInterface(typeName, table);

      outputs.push(`${entityInterface}\n\n${insertInterface}\n\n${updateInterface}`);
    }

    return outputs.join("\n\n// ==========================================\n\n");
  }

  private generateEntityInterface(typeName: string, table: Table): string {
    const lines: string[] = [];

    if (table.description) {
      lines.push(`/**\n * ${table.description}\n */`);
    }

    lines.push(`export interface ${typeName} {`);

    for (const col of table.columns) {
      const tsType = this.mapType(col.type);
      const isNullable = col.constraints.isNullable;
      const comment = col.comment ? ` // ${col.comment}` : "";
      
      lines.push(`  ${col.name}: ${tsType}${isNullable ? " | null" : ""};${comment}`);
    }

    lines.push(`}`);
    return lines.join("\n");
  }

  private generateInsertInterface(typeName: string, table: Table): string {
    const lines: string[] = [];
    lines.push(`export interface ${typeName}Insert {`);

    for (const col of table.columns) {
      const tsType = this.mapType(col.type);
      const isNullable = col.constraints.isNullable;
      const hasDefault = col.constraints.defaultValue !== undefined && col.constraints.defaultValue !== null && col.constraints.defaultValue !== "";
      const isAutoInc = col.constraints.isAutoIncrement;
      
      // Optional if nullable, auto increment, or has default
      const isOptional = isNullable || isAutoInc || hasDefault;
      const comment = col.comment ? ` // ${col.comment}` : "";

      lines.push(`  ${col.name}${isOptional ? "?" : ""}: ${tsType}${isNullable ? " | null" : ""};${comment}`);
    }

    lines.push(`}`);
    return lines.join("\n");
  }

  private generateUpdateInterface(typeName: string, table: Table): string {
    const lines: string[] = [];
    lines.push(`export interface ${typeName}Update {`);

    for (const col of table.columns) {
      const tsType = this.mapType(col.type);
      const isNullable = col.constraints.isNullable;
      const comment = col.comment ? ` // ${col.comment}` : "";

      // Everything is optional on updates
      lines.push(`  ${col.name}?: ${tsType}${isNullable ? " | null" : ""};${comment}`);
    }

    lines.push(`}`);
    return lines.join("\n");
  }

  private mapType(dbType: string): string {
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
      return "any";
    }
    return "string"; // Default fallback
  }

  private toPascalCaseSingular(str: string): string {
    if (!str) return "Entity";

    // Split by underscore or hyphen or spaces
    const parts = str.split(/[_\-\s]+/);
    let result = parts
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join("");

    // Simple singularization: strip trailing 's' if it doesn't end in 'ss' or 'us' or 'is'
    if (result.endsWith("s") && !result.endsWith("ss") && !result.endsWith("us") && !result.endsWith("is") && !result.endsWith("as") && !result.endsWith("os")) {
      result = result.slice(0, -1);
    }

    return result;
  }
}
