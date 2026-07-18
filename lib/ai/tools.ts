// =============================================================================
// AI DB Architect Agent — Function Calling Tool Definitions
// =============================================================================

/**
 * OpenAI-compatible function/tool definitions that the AI agent can invoke
 * to manipulate the schema canvas (tables, columns, indexes, relations).
 *
 * These definitions are sent to the AI provider as part of the `tools` array,
 * and tool calls are executed inside the Sandbox AST (never directly on live store).
 */

export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

// ---------------------------------------------------------------------------
// Tool Definitions Array
// ---------------------------------------------------------------------------

export const SCHEMA_TOOLS: ToolDefinition[] = [
  // ---- Table Operations ----
  {
    type: "function",
    function: {
      name: "create_table",
      description:
        "Create a new database table with columns. Always include a primary key column. The table will appear on the visual canvas.",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Table name in snake_case (e.g., 'users', 'order_items')",
          },
          description: {
            type: "string",
            description: "Brief description of the table's purpose",
          },
          columns: {
            type: "array",
            description: "Array of column definitions for the table",
            items: {
              type: "object",
              properties: {
                name: { type: "string", description: "Column name in snake_case" },
                type: {
                  type: "string",
                  description: "SQL data type (e.g., INTEGER, VARCHAR, TEXT, TIMESTAMP, BOOLEAN, UUID, DECIMAL, SERIAL, BIGINT)",
                },
                isPrimaryKey: { type: "boolean", description: "Whether this is the primary key" },
                isNullable: { type: "boolean", description: "Whether the column allows NULL values" },
                isUnique: { type: "boolean", description: "Whether the column has a UNIQUE constraint" },
                isAutoIncrement: { type: "boolean", description: "Whether the column auto-increments" },
                defaultValue: { type: "string", description: "Default value expression (e.g., 'CURRENT_TIMESTAMP', '0', 'true')" },
              },
              required: ["name", "type"],
            },
          },
        },
        required: ["name", "columns"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_table",
      description: "Update an existing table's name, description, or color.",
      parameters: {
        type: "object",
        properties: {
          tableId: { type: "string", description: "The ID or name of the table to update" },
          name: { type: "string", description: "New table name" },
          description: { type: "string", description: "New table description" },
          color: { type: "string", description: "Hex color code for the table header (e.g., '#3b82f6')" },
        },
        required: ["tableId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_table",
      description:
        "Delete a table from the schema. This will also remove any relations connected to this table. Use with caution.",
      parameters: {
        type: "object",
        properties: {
          tableId: { type: "string", description: "The ID or name of the table to delete" },
        },
        required: ["tableId"],
      },
    },
  },

  // ---- Column Operations ----
  {
    type: "function",
    function: {
      name: "add_column",
      description: "Add a new column to an existing table.",
      parameters: {
        type: "object",
        properties: {
          tableId: { type: "string", description: "The ID or name of the table to add the column to" },
          name: { type: "string", description: "Column name in snake_case" },
          type: { type: "string", description: "SQL data type (e.g., INTEGER, VARCHAR, TEXT, TIMESTAMP)" },
          isPrimaryKey: { type: "boolean" },
          isNullable: { type: "boolean" },
          isUnique: { type: "boolean" },
          isAutoIncrement: { type: "boolean" },
          defaultValue: { type: "string", description: "Default value expression" },
        },
        required: ["tableId", "name", "type"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_column",
      description: "Modify an existing column's name, type, or constraints.",
      parameters: {
        type: "object",
        properties: {
          tableId: { type: "string", description: "The ID or name of the table containing the column" },
          columnId: { type: "string", description: "The ID or name of the column to update" },
          name: { type: "string", description: "New column name" },
          type: { type: "string", description: "New SQL data type" },
          isPrimaryKey: { type: "boolean" },
          isNullable: { type: "boolean" },
          isUnique: { type: "boolean" },
          isAutoIncrement: { type: "boolean" },
          defaultValue: { type: "string" },
        },
        required: ["tableId", "columnId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_column",
      description: "Remove a column from a table. Also removes any relations referencing this column.",
      parameters: {
        type: "object",
        properties: {
          tableId: { type: "string", description: "The ID or name of the table" },
          columnId: { type: "string", description: "The ID or name of the column to remove" },
        },
        required: ["tableId", "columnId"],
      },
    },
  },

  // ---- Relation Operations ----
  {
    type: "function",
    function: {
      name: "add_relation",
      description:
        "Create a foreign key relationship between two tables. The source column references the target column.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Optional name for the relation (e.g., 'fk_orders_user_id')" },
          sourceTableId: { type: "string", description: "ID or name of the table with the foreign key column" },
          sourceColumnId: { type: "string", description: "ID or name of the foreign key column" },
          targetTableId: { type: "string", description: "ID or name of the referenced table" },
          targetColumnId: { type: "string", description: "ID or name of the referenced column (usually the PK)" },
          type: {
            type: "string",
            enum: ["one-to-one", "one-to-many", "many-to-one", "many-to-many"],
            description: "Relationship cardinality",
          },
          onDelete: {
            type: "string",
            enum: ["cascade", "restrict", "set-null", "no-action"],
            description: "ON DELETE action",
          },
          onUpdate: {
            type: "string",
            enum: ["cascade", "restrict", "set-null", "no-action"],
            description: "ON UPDATE action",
          },
        },
        required: ["sourceTableId", "sourceColumnId", "targetTableId", "targetColumnId", "type"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_relation",
      description: "Remove a foreign key relationship.",
      parameters: {
        type: "object",
        properties: {
          relationId: { type: "string", description: "The ID of the relation to remove" },
        },
        required: ["relationId"],
      },
    },
  },

  // ---- Index Operations ----
  {
    type: "function",
    function: {
      name: "add_index",
      description: "Create a single or composite index on a table for query optimization.",
      parameters: {
        type: "object",
        properties: {
          tableId: { type: "string", description: "The ID of the table" },
          name: { type: "string", description: "Index name (e.g., 'idx_users_email')" },
          columns: {
            type: "array",
            description: "Columns to include in the index",
            items: {
              type: "object",
              properties: {
                columnName: { type: "string" },
                order: { type: "string", enum: ["ASC", "DESC"] },
              },
              required: ["columnName"],
            },
          },
          isUnique: { type: "boolean", description: "Whether this is a unique index" },
        },
        required: ["tableId", "name", "columns", "isUnique"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_index",
      description: "Remove an index from a table.",
      parameters: {
        type: "object",
        properties: {
          tableId: { type: "string", description: "The ID of the table" },
          indexId: { type: "string", description: "The ID of the index to remove" },
        },
        required: ["tableId", "indexId"],
      },
    },
  },

  // ---- Analysis ----
  {
    type: "function",
    function: {
      name: "analyze_schema",
      description:
        "Analyze the current schema for design issues, anti-patterns, missing indexes, normalization violations, bias indicators, and suggest improvements. Call this when the user asks you to audit, review, or optimize their schema.",
      parameters: {
        type: "object",
        properties: {
          focusAreas: {
            type: "array",
            description: "Specific areas to focus on",
            items: {
              type: "string",
              enum: [
                "normalization",
                "performance",
                "naming",
                "relationships",
                "indexes",
                "security",
                "audit-trail",
                "soft-deletes",
                "bias-detection",
                "scalability",
              ],
            },
          },
        },
        required: [],
      },
    },
  },
];
