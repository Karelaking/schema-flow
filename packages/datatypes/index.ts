import { DatabaseDialect } from "@/packages/schema-core";

export type DataTypeCategory = "numeric" | "string" | "datetime" | "boolean" | "complex" | "other";

export interface DataTypeDefinition {
  /** Column data type string used in DDL SQL (e.g. INTEGER, VARCHAR, TIMESTAMPTZ) */
  type: string;
  /** Human readable label displayed in UI components */
  label: string;
  /** Category classification for UI grouping */
  category: DataTypeCategory;
  /** Optional explanation of the data type */
  description?: string;
  /** TypeScript primitive type equivalent */
  tsEquivalent?: string;
}

export interface DataTypeCategoryGroup {
  category: DataTypeCategory;
  label: string;
  types: DataTypeDefinition[];
}

export interface DialectDataTypeStrategy {
  dialect: DatabaseDialect;
  defaultType: string;
  getDataTypes(): DataTypeDefinition[];
  getCategories(): DataTypeCategoryGroup[];
}

const CATEGORY_LABELS: Record<DataTypeCategory, string> = {
  numeric: "Numeric Types",
  string: "String & Character Types",
  datetime: "Date & Time Types",
  boolean: "Boolean Types",
  complex: "JSON & Complex Types",
  other: "Binary & Other Types",
};

/**
 * Strategy implementation for SQLite column data types.
 */
export class SQLiteDataTypeStrategy implements DialectDataTypeStrategy {
  public dialect: DatabaseDialect = "sqlite";
  public defaultType: string = "INTEGER";

  public getDataTypes(): DataTypeDefinition[] {
    return [
      { type: "INTEGER", label: "INTEGER", category: "numeric", description: "Signed 8-byte integer", tsEquivalent: "number" },
      { type: "REAL", label: "REAL", category: "numeric", description: "8-byte IEEE floating point", tsEquivalent: "number" },
      { type: "NUMERIC", label: "NUMERIC", category: "numeric", description: "Exact numeric with fixed precision", tsEquivalent: "number" },
      { type: "TEXT", label: "TEXT", category: "string", description: "Variable length text string", tsEquivalent: "string" },
      { type: "VARCHAR", label: "VARCHAR", category: "string", description: "Variable length text string with max length", tsEquivalent: "string" },
      { type: "DATETIME", label: "DATETIME", category: "datetime", description: "ISO8601 Date and time string", tsEquivalent: "string" },
      { type: "DATE", label: "DATE", category: "datetime", description: "ISO8601 Date string (YYYY-MM-DD)", tsEquivalent: "string" },
      { type: "BOOLEAN", label: "BOOLEAN", category: "boolean", description: "Numeric boolean (0 or 1)", tsEquivalent: "boolean" },
      { type: "BLOB", label: "BLOB", category: "other", description: "Raw binary data payload", tsEquivalent: "Uint8Array" },
    ];
  }

  public getCategories(): DataTypeCategoryGroup[] {
    return groupDataTypes(this.getDataTypes());
  }
}

/**
 * Strategy implementation for PostgreSQL column data types.
 */
export class PostgreSQLDataTypeStrategy implements DialectDataTypeStrategy {
  public dialect: DatabaseDialect = "postgres";
  public defaultType: string = "INTEGER";

  public getDataTypes(): DataTypeDefinition[] {
    return [
      { type: "INTEGER", label: "INTEGER (INT4)", category: "numeric", description: "Signed 4-byte integer", tsEquivalent: "number" },
      { type: "BIGINT", label: "BIGINT (INT8)", category: "numeric", description: "Signed 8-byte integer", tsEquivalent: "number" },
      { type: "SMALLINT", label: "SMALLINT (INT2)", category: "numeric", description: "Signed 2-byte integer", tsEquivalent: "number" },
      { type: "SERIAL", label: "SERIAL", category: "numeric", description: "Auto-incrementing 4-byte integer", tsEquivalent: "number" },
      { type: "BIGSERIAL", label: "BIGSERIAL", category: "numeric", description: "Auto-incrementing 8-byte integer", tsEquivalent: "number" },
      { type: "NUMERIC", label: "NUMERIC / DECIMAL", category: "numeric", description: "Exact numeric of selectable precision", tsEquivalent: "number" },
      { type: "REAL", label: "REAL (FLOAT4)", category: "numeric", description: "Single precision floating-point number", tsEquivalent: "number" },
      { type: "DOUBLE PRECISION", label: "DOUBLE PRECISION", category: "numeric", description: "Double precision floating-point number", tsEquivalent: "number" },
      
      { type: "VARCHAR", label: "VARCHAR", category: "string", description: "Variable-length character string", tsEquivalent: "string" },
      { type: "TEXT", label: "TEXT", category: "string", description: "Unlimited variable-length character string", tsEquivalent: "string" },
      { type: "CHAR", label: "CHAR", category: "string", description: "Fixed-length character string", tsEquivalent: "string" },
      { type: "UUID", label: "UUID", category: "string", description: "Universally Unique Identifier", tsEquivalent: "string" },

      { type: "TIMESTAMP", label: "TIMESTAMP", category: "datetime", description: "Date and time without time zone", tsEquivalent: "string" },
      { type: "TIMESTAMPTZ", label: "TIMESTAMPTZ", category: "datetime", description: "Date and time with time zone", tsEquivalent: "string" },
      { type: "DATE", label: "DATE", category: "datetime", description: "Calendar date (year, month, day)", tsEquivalent: "string" },
      { type: "TIME", label: "TIME", category: "datetime", description: "Time of day without time zone", tsEquivalent: "string" },

      { type: "BOOLEAN", label: "BOOLEAN", category: "boolean", description: "Logical boolean (true/false)", tsEquivalent: "boolean" },

      { type: "JSON", label: "JSON", category: "complex", description: "Textual JSON data storage", tsEquivalent: "any" },
      { type: "JSONB", label: "JSONB", category: "complex", description: "Deconstructed binary JSON data storage", tsEquivalent: "any" },
      { type: "BYTEA", label: "BYTEA", category: "other", description: "Binary data string", tsEquivalent: "Uint8Array" },
      { type: "INET", label: "INET", category: "other", description: "IPv4 or IPv6 network address", tsEquivalent: "string" },
    ];
  }

  public getCategories(): DataTypeCategoryGroup[] {
    return groupDataTypes(this.getDataTypes());
  }
}

/**
 * Strategy implementation for MySQL column data types.
 */
export class MySQLDataTypeStrategy implements DialectDataTypeStrategy {
  public dialect: DatabaseDialect = "mysql";
  public defaultType: string = "INT";

  public getDataTypes(): DataTypeDefinition[] {
    return [
      { type: "INT", label: "INT", category: "numeric", description: "Standard 4-byte integer", tsEquivalent: "number" },
      { type: "BIGINT", label: "BIGINT", category: "numeric", description: "Large 8-byte integer", tsEquivalent: "number" },
      { type: "TINYINT", label: "TINYINT", category: "numeric", description: "Very small 1-byte integer", tsEquivalent: "number" },
      { type: "SMALLINT", label: "SMALLINT", category: "numeric", description: "Small 2-byte integer", tsEquivalent: "number" },
      { type: "DECIMAL", label: "DECIMAL", category: "numeric", description: "Exact fixed-point decimal number", tsEquivalent: "number" },
      { type: "FLOAT", label: "FLOAT", category: "numeric", description: "Single-precision floating-point number", tsEquivalent: "number" },
      { type: "DOUBLE", label: "DOUBLE", category: "numeric", description: "Double-precision floating-point number", tsEquivalent: "number" },

      { type: "VARCHAR", label: "VARCHAR", category: "string", description: "Variable-length character string", tsEquivalent: "string" },
      { type: "TEXT", label: "TEXT", category: "string", description: "Standard text column (up to 64KB)", tsEquivalent: "string" },
      { type: "LONGTEXT", label: "LONGTEXT", category: "string", description: "Large text column (up to 4GB)", tsEquivalent: "string" },
      { type: "CHAR", label: "CHAR", category: "string", description: "Fixed-length character string", tsEquivalent: "string" },

      { type: "DATETIME", label: "DATETIME", category: "datetime", description: "Date and time combination", tsEquivalent: "string" },
      { type: "TIMESTAMP", label: "TIMESTAMP", category: "datetime", description: "UTC timestamp value", tsEquivalent: "string" },
      { type: "DATE", label: "DATE", category: "datetime", description: "Calendar date (YYYY-MM-DD)", tsEquivalent: "string" },
      { type: "TIME", label: "TIME", category: "datetime", description: "Time of day (HH:MM:SS)", tsEquivalent: "string" },

      { type: "BOOLEAN", label: "BOOLEAN / TINYINT(1)", category: "boolean", description: "Boolean flag (0 or 1)", tsEquivalent: "boolean" },

      { type: "JSON", label: "JSON", category: "complex", description: "Native JSON document format", tsEquivalent: "any" },
      { type: "BLOB", label: "BLOB", category: "other", description: "Binary Large Object", tsEquivalent: "Uint8Array" },
    ];
  }

  public getCategories(): DataTypeCategoryGroup[] {
    return groupDataTypes(this.getDataTypes());
  }
}

/**
 * Helper to group data types by category.
 */
function groupDataTypes(types: DataTypeDefinition[]): DataTypeCategoryGroup[] {
  const map = new Map<DataTypeCategory, DataTypeDefinition[]>();

  for (const t of types) {
    if (!map.has(t.category)) {
      map.set(t.category, []);
    }
    map.get(t.category)!.push(t);
  }

  const result: DataTypeCategoryGroup[] = [];
  for (const [category, categoryTypes] of map.entries()) {
    result.push({
      category,
      label: CATEGORY_LABELS[category] || category,
      types: categoryTypes,
    });
  }
  return result;
}

/**
 * Registry class providing Strategy resolution for database data types.
 */
export class DataTypeRegistry {
  private static strategies = new Map<DatabaseDialect, DialectDataTypeStrategy>([
    ["sqlite", new SQLiteDataTypeStrategy()],
    ["postgres", new PostgreSQLDataTypeStrategy()],
    ["mysql", new MySQLDataTypeStrategy()],
  ]);

  /**
   * Registers a custom or new database dialect strategy at runtime.
   */
  public static register(strategy: DialectDataTypeStrategy): void {
    DataTypeRegistry.strategies.set(strategy.dialect, strategy);
  }

  /**
   * Retrieves the strategy instance registered for a given dialect.
   */
  public static getStrategy(dialect: DatabaseDialect): DialectDataTypeStrategy {
    const strategy = DataTypeRegistry.strategies.get(dialect);
    if (!strategy) {
      return DataTypeRegistry.strategies.get("sqlite")!;
    }
    return strategy;
  }

  /**
   * Gets flat array of data types available for a specific dialect.
   */
  public static getDataTypes(dialect: DatabaseDialect): DataTypeDefinition[] {
    return DataTypeRegistry.getStrategy(dialect).getDataTypes();
  }

  /**
   * Gets grouped categories of data types available for a specific dialect.
   */
  public static getCategories(dialect: DatabaseDialect): DataTypeCategoryGroup[] {
    return DataTypeRegistry.getStrategy(dialect).getCategories();
  }
}
