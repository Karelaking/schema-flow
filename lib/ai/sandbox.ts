// =============================================================================
// AI DB Architect Agent — Isolated Sandbox AST Engine
// =============================================================================
//
// All AI tool calls are executed here against an in-memory clone of the live
// SchemaAST. The live workspace is never mutated until the user explicitly
// approves the proposed changes via the Preview & Approve workflow.
// =============================================================================

import type { SchemaAST, Table, Column, Relation, Index, IndexColumn } from "@/packages/schema-core";
import type { ToolCall, DiffItem, SandboxResult } from "./types";

// ---------------------------------------------------------------------------
// Deep Clone Utility
// ---------------------------------------------------------------------------

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// ---------------------------------------------------------------------------
// Unique ID Generator (mirrors store.ts pattern)
// ---------------------------------------------------------------------------

function generateId(prefix: string): string {
  const timestamp = Date.now();
  const suffix = Math.random().toString(36).substring(2, 7);
  return `${prefix}-${timestamp}-${suffix}`;
}

// ---------------------------------------------------------------------------
// Tool Call Executor — Applies a single tool call to the sandbox AST
// ---------------------------------------------------------------------------

interface ToolExecutionResult {
  success: boolean;
  message: string;
  /** Map of AI-referenced IDs back to generated IDs for cross-referencing */
  generatedIds?: Record<string, string>;
}

/**
 * Executes a single tool call against the mutable sandbox AST.
 * Returns a result message for the AI to receive as tool response.
 */
function executeToolCall(
  ast: SchemaAST,
  toolName: string,
  args: Record<string, unknown>,
  /** Accumulated ID mappings from previous tool calls in the same batch */
  idMap: Map<string, string>
): ToolExecutionResult {
  switch (toolName) {
    case "create_table":
      return executeCreateTable(ast, args, idMap);
    case "update_table":
      return executeUpdateTable(ast, args, idMap);
    case "delete_table":
      return executeDeleteTable(ast, args, idMap);
    case "add_column":
      return executeAddColumn(ast, args, idMap);
    case "update_column":
      return executeUpdateColumn(ast, args, idMap);
    case "delete_column":
      return executeDeleteColumn(ast, args, idMap);
    case "add_relation":
      return executeAddRelation(ast, args, idMap);
    case "delete_relation":
      return executeDeleteRelation(ast, args, idMap);
    case "add_index":
      return executeAddIndex(ast, args, idMap);
    case "delete_index":
      return executeDeleteIndex(ast, args, idMap);
    case "analyze_schema":
      return executeAnalyzeSchema(ast);
    default:
      return { success: false, message: `Unknown tool: ${toolName}` };
  }
}

/** Resolve a table ID by checking idMap, direct table ID in AST, or matching table name */
function resolveTableId(
  ast: SchemaAST,
  idOrName: string | undefined,
  idMap: Map<string, string>
): string {
  if (!idOrName) return "";

  // 1. Check idMap
  const mapped = idMap.get(idOrName);
  if (mapped && ast.tables[mapped]) return mapped;

  // 2. Direct ID match
  if (ast.tables[idOrName]) return idOrName;

  // 3. Case-insensitive name match
  const found = Object.values(ast.tables).find(
    (t) => t.name.toLowerCase() === idOrName.toLowerCase() || t.id === idOrName
  );
  if (found) return found.id;

  return idOrName;
}

/** Resolve a column ID by checking idMap, direct column ID in table, or matching column name */
function resolveColumnId(
  table: Table | undefined,
  colIdOrName: string | undefined,
  idMap: Map<string, string>
): string {
  if (!table || !colIdOrName) return colIdOrName ?? "";

  // 1. Check idMap
  const mapped = idMap.get(colIdOrName) ?? idMap.get(`${table.name}.${colIdOrName}`);
  if (mapped && table.columns.some((c) => c.id === mapped)) return mapped;

  // 2. Direct ID match
  const direct = table.columns.find((c) => c.id === colIdOrName);
  if (direct) return direct.id;

  // 3. Case-insensitive name match
  const found = table.columns.find(
    (c) => c.name.toLowerCase() === colIdOrName.toLowerCase()
  );
  if (found) return found.id;

  return colIdOrName;
}

// ---------------------------------------------------------------------------
// Tool Implementations
// ---------------------------------------------------------------------------

function executeCreateTable(
  ast: SchemaAST,
  args: Record<string, unknown>,
  idMap: Map<string, string>
): ToolExecutionResult {
  const name = args.name as string;
  const description = (args.description as string) ?? "";
  const rawColumns = (args.columns as Record<string, unknown>[]) ?? [];

  const tableId = generateId("table");
  const existingCount = Object.keys(ast.tables).length;

  const columns: Column[] = rawColumns.map((col, idx) => ({
    id: generateId("col"),
    name: (col.name as string) ?? `column_${idx}`,
    type: (col.type as string) ?? "TEXT",
    constraints: {
      isPrimaryKey: (col.isPrimaryKey as boolean) ?? false,
      isNullable: (col.isNullable as boolean) ?? true,
      isUnique: (col.isUnique as boolean) ?? false,
      isAutoIncrement: (col.isAutoIncrement as boolean) ?? false,
      defaultValue: col.defaultValue as string | undefined,
    },
  }));

  const table: Table = {
    id: tableId,
    name,
    description,
    color: "#3b82f6",
    position: {
      x: 60 + (existingCount % 3) * 340,
      y: 60 + Math.floor(existingCount / 3) * 260,
    },
    columns,
    indexes: [],
  };

  ast.tables[tableId] = table;

  // Map the table name to the generated ID so subsequent tool calls can reference it
  idMap.set(name, tableId);
  // Also map column names to their IDs for relation creation
  for (const col of columns) {
    idMap.set(`${name}.${col.name}`, col.id);
  }

  const colNames = columns.map((c) => c.name).join(", ");
  return {
    success: true,
    message: `Created table '${name}' (ID: ${tableId}) with columns: ${colNames}`,
    generatedIds: { [name]: tableId },
  };
}

function executeUpdateTable(
  ast: SchemaAST,
  args: Record<string, unknown>,
  idMap: Map<string, string>
): ToolExecutionResult {
  const tableRef = (args.tableId ?? args.tableName ?? args.id ?? args.table_id ?? args.table) as string;
  const tableId = resolveTableId(ast, tableRef, idMap);
  const table = ast.tables[tableId];
  if (!table) return { success: false, message: `Table not found: '${tableRef ?? "unspecified"}'` };

  const oldName = table.name;
  if (args.name !== undefined) table.name = args.name as string;
  if (args.newName !== undefined) table.name = args.newName as string;
  if (args.description !== undefined) table.description = args.description as string;
  if (args.color !== undefined) table.color = args.color as string;

  // Update idMap if name changed
  if (oldName !== table.name) {
    idMap.set(table.name, tableId);
  }

  return { success: true, message: `Updated table '${oldName}' -> '${table.name}'` };
}

function executeDeleteTable(
  ast: SchemaAST,
  args: Record<string, unknown>,
  idMap: Map<string, string>
): ToolExecutionResult {
  const tableRef = (args.tableId ?? args.tableName ?? args.id ?? args.table_id ?? args.name) as string;
  const tableId = resolveTableId(ast, tableRef, idMap);
  const table = ast.tables[tableId];
  if (!table) return { success: false, message: `Table not found: '${tableRef ?? "unspecified"}'` };

  const tableName = table.name;
  delete ast.tables[tableId];

  // Clean up relations referencing this table
  for (const relId of Object.keys(ast.relations)) {
    const rel = ast.relations[relId];
    if (rel.sourceTableId === tableId || rel.targetTableId === tableId) {
      delete ast.relations[relId];
    }
  }

  return { success: true, message: `Deleted table '${tableName}' and its connected relations` };
}

function executeAddColumn(
  ast: SchemaAST,
  args: Record<string, unknown>,
  idMap: Map<string, string>
): ToolExecutionResult {
  const tableRef = (args.tableId ?? args.tableName ?? args.id ?? args.table_id ?? args.table) as string;
  const tableId = resolveTableId(ast, tableRef, idMap);
  const table = ast.tables[tableId];
  if (!table) return { success: false, message: `Table not found: '${tableRef ?? "unspecified"}'` };

  const colId = generateId("col");
  const column: Column = {
    id: colId,
    name: args.name as string,
    type: args.type as string,
    constraints: {
      isPrimaryKey: (args.isPrimaryKey as boolean) ?? false,
      isNullable: (args.isNullable as boolean) ?? true,
      isUnique: (args.isUnique as boolean) ?? false,
      isAutoIncrement: (args.isAutoIncrement as boolean) ?? false,
      defaultValue: args.defaultValue as string | undefined,
    },
  };

  table.columns.push(column);
  idMap.set(`${table.name}.${column.name}`, colId);

  return {
    success: true,
    message: `Added column '${column.name}' (${column.type}) to table '${table.name}'`,
    generatedIds: { [`${table.name}.${column.name}`]: colId },
  };
}

function executeUpdateColumn(
  ast: SchemaAST,
  args: Record<string, unknown>,
  idMap: Map<string, string>
): ToolExecutionResult {
  const tableRef = (args.tableId ?? args.tableName ?? args.id ?? args.table_id ?? args.table) as string;
  const tableId = resolveTableId(ast, tableRef, idMap);
  const table = ast.tables[tableId];
  if (!table) return { success: false, message: `Table not found: '${tableRef ?? "unspecified"}'` };

  const colRef = (args.columnId ?? args.columnName ?? args.id ?? args.column_id ?? args.name) as string;
  const columnId = resolveColumnId(table, colRef, idMap);
  const column = table.columns.find((c) => c.id === columnId);
  if (!column) return { success: false, message: `Column not found: '${colRef}' in table '${table.name}'` };

  if (args.newName !== undefined) column.name = args.newName as string;
  else if (args.name !== undefined && args.columnName && args.name !== args.columnName) column.name = args.name as string;
  
  if (args.type !== undefined) column.type = args.type as string;
  if (args.isPrimaryKey !== undefined) column.constraints.isPrimaryKey = args.isPrimaryKey as boolean;
  if (args.isNullable !== undefined) column.constraints.isNullable = args.isNullable as boolean;
  if (args.isUnique !== undefined) column.constraints.isUnique = args.isUnique as boolean;
  if (args.isAutoIncrement !== undefined) column.constraints.isAutoIncrement = args.isAutoIncrement as boolean;
  if (args.defaultValue !== undefined) column.constraints.defaultValue = args.defaultValue as string;

  return { success: true, message: `Updated column '${column.name}' in table '${table.name}'` };
}

function executeDeleteColumn(
  ast: SchemaAST,
  args: Record<string, unknown>,
  idMap: Map<string, string>
): ToolExecutionResult {
  const tableRef = (args.tableId ?? args.tableName ?? args.id ?? args.table_id ?? args.table) as string;
  const tableId = resolveTableId(ast, tableRef, idMap);
  const table = ast.tables[tableId];
  if (!table) return { success: false, message: `Table not found: '${tableRef ?? "unspecified"}'` };

  const colRef = (args.columnId ?? args.columnName ?? args.id ?? args.column_id ?? args.name) as string;
  const columnId = resolveColumnId(table, colRef, idMap);
  const colIdx = table.columns.findIndex((c) => c.id === columnId);
  if (colIdx === -1) return { success: false, message: `Column not found: '${colRef}' in table '${table.name}'` };

  const colName = table.columns[colIdx].name;
  table.columns.splice(colIdx, 1);

  // Clean up relations referencing this column
  for (const relId of Object.keys(ast.relations)) {
    const rel = ast.relations[relId];
    if (
      (rel.sourceTableId === tableId && rel.sourceColumnId === columnId) ||
      (rel.targetTableId === tableId && rel.targetColumnId === columnId)
    ) {
      delete ast.relations[relId];
    }
  }

  return { success: true, message: `Deleted column '${colName}' from table '${table.name}'` };
}

function executeAddRelation(
  ast: SchemaAST,
  args: Record<string, unknown>,
  idMap: Map<string, string>
): ToolExecutionResult {
  const srcTableRef = (args.sourceTableId ?? args.sourceTable ?? args.sourceTableName) as string;
  const sourceTableId = resolveTableId(ast, srcTableRef, idMap);
  const srcTable = ast.tables[sourceTableId];
  if (!srcTable) return { success: false, message: `Source table not found: '${srcTableRef}'` };

  const tgtTableRef = (args.targetTableId ?? args.targetTable ?? args.targetTableName) as string;
  const targetTableId = resolveTableId(ast, tgtTableRef, idMap);
  const tgtTable = ast.tables[targetTableId];
  if (!tgtTable) return { success: false, message: `Target table not found: '${tgtTableRef}'` };

  const srcColRef = (args.sourceColumnId ?? args.sourceColumn ?? args.sourceColumnName) as string;
  const sourceColumnId = resolveColumnId(srcTable, srcColRef, idMap);

  const tgtColRef = (args.targetColumnId ?? args.targetColumn ?? args.targetColumnName) as string;
  const targetColumnId = resolveColumnId(tgtTable, tgtColRef, idMap);

  const relId = generateId("relation");
  const relation: Relation = {
    id: relId,
    name: (args.name as string) ?? undefined,
    sourceTableId,
    sourceColumnId,
    targetTableId,
    targetColumnId,
    type: (args.type as Relation["type"]) ?? "one-to-many",
    onDelete: (args.onDelete as Relation["onDelete"]) ?? "no-action",
    onUpdate: (args.onUpdate as Relation["onUpdate"]) ?? "no-action",
  };

  ast.relations[relId] = relation;

  return { success: true, message: `Created ${relation.type} relation from '${srcTable.name}' to '${tgtTable.name}'` };
}

function executeDeleteRelation(
  ast: SchemaAST,
  args: Record<string, unknown>,
  idMap: Map<string, string>
): ToolExecutionResult {
  const relRef = (args.relationId ?? args.id ?? args.name) as string;
  const relationId = idMap.get(relRef) ?? relRef;
  const relation = ast.relations[relationId] ?? Object.values(ast.relations).find((r) => r.id === relRef || r.name === relRef);

  if (!relation) return { success: false, message: `Relation not found: '${relRef}'` };

  delete ast.relations[relation.id];
  return { success: true, message: `Deleted relation '${relation.name ?? relation.id}'` };
}

function executeAddIndex(
  ast: SchemaAST,
  args: Record<string, unknown>,
  idMap: Map<string, string>
): ToolExecutionResult {
  const tableRef = (args.tableId ?? args.tableName ?? args.id ?? args.table_id ?? args.table) as string;
  const tableId = resolveTableId(ast, tableRef, idMap);
  const table = ast.tables[tableId];
  if (!table) return { success: false, message: `Table not found: '${tableRef ?? "unspecified"}'` };

  const indexId = generateId("idx");
  const columns: IndexColumn[] = ((args.columns as Record<string, unknown>[]) ?? []).map((c) => ({
    columnName: (c.columnName ?? c.name ?? c.column) as string,
    order: (c.order as "ASC" | "DESC") ?? "ASC",
  }));

  const index: Index = {
    id: indexId,
    name: args.name as string,
    columns,
    isUnique: (args.isUnique as boolean) ?? false,
  };

  if (!table.indexes) table.indexes = [];
  table.indexes.push(index);

  return { success: true, message: `Created index '${index.name}' on table '${table.name}'` };
}

function executeDeleteIndex(
  ast: SchemaAST,
  args: Record<string, unknown>,
  idMap: Map<string, string>
): ToolExecutionResult {
  const tableRef = (args.tableId ?? args.tableName ?? args.id ?? args.table_id ?? args.table) as string;
  const tableId = resolveTableId(ast, tableRef, idMap);
  const table = ast.tables[tableId];
  if (!table) return { success: false, message: `Table not found: '${tableRef ?? "unspecified"}'` };

  if (!table.indexes) return { success: false, message: `No indexes on table '${table.name}'` };

  const idxRef = (args.indexId ?? args.name ?? args.id) as string;
  const indexId = idMap.get(idxRef) ?? idxRef;
  const idxPos = table.indexes.findIndex((i) => i.id === indexId || i.name.toLowerCase() === idxRef.toLowerCase());
  if (idxPos === -1) return { success: false, message: `Index not found: '${idxRef}'` };

  const idxName = table.indexes[idxPos].name;
  table.indexes.splice(idxPos, 1);
  return { success: true, message: `Deleted index '${idxName}' from table '${table.name}'` };
}

function executeAnalyzeSchema(ast: SchemaAST): ToolExecutionResult {
  // Analysis is primarily handled by the AI's reasoning.
  // We provide a structured summary for the AI to reference.
  const tableCount = Object.keys(ast.tables).length;
  const relationCount = Object.keys(ast.relations).length;
  const tables = Object.values(ast.tables);
  const totalColumns = tables.reduce((sum, t) => sum + t.columns.length, 0);
  const totalIndexes = tables.reduce((sum, t) => sum + (t.indexes?.length ?? 0), 0);

  return {
    success: true,
    message: `Schema analysis context: ${tableCount} tables, ${totalColumns} columns, ${relationCount} relations, ${totalIndexes} indexes. The full schema details are available in the system context. Please analyze and provide recommendations.`,
  };
}

// ---------------------------------------------------------------------------
// Diff Computation — Compares original & proposed ASTs
// ---------------------------------------------------------------------------

function computeDiffs(original: SchemaAST, proposed: SchemaAST): DiffItem[] {
  const diffs: DiffItem[] = [];
  const originalTableIds = new Set(Object.keys(original.tables));
  const proposedTableIds = new Set(Object.keys(proposed.tables));

  // Added tables
  for (const id of proposedTableIds) {
    if (!originalTableIds.has(id)) {
      const table = proposed.tables[id];
      diffs.push({
        type: "added",
        entity: "table",
        tableName: table.name,
        details: `New table '${table.name}' with ${table.columns.length} column(s)`,
      });
      // Also list added columns within new tables
      for (const col of table.columns) {
        diffs.push({
          type: "added",
          entity: "column",
          tableName: table.name,
          columnName: col.name,
          details: `${col.name}: ${col.type}${col.constraints.isPrimaryKey ? " (PK)" : ""}`,
        });
      }
    }
  }

  // Removed tables
  for (const id of originalTableIds) {
    if (!proposedTableIds.has(id)) {
      const table = original.tables[id];
      diffs.push({
        type: "removed",
        entity: "table",
        tableName: table.name,
        details: `Removed table '${table.name}' (${table.columns.length} columns)`,
      });
    }
  }

  // Modified tables — check column-level changes
  for (const id of proposedTableIds) {
    if (!originalTableIds.has(id)) continue;
    const origTable = original.tables[id];
    const propTable = proposed.tables[id];

    // Table-level changes (name, description)
    if (origTable.name !== propTable.name || origTable.description !== propTable.description) {
      diffs.push({
        type: "modified",
        entity: "table",
        tableName: propTable.name,
        details: origTable.name !== propTable.name
          ? `Renamed from '${origTable.name}' to '${propTable.name}'`
          : `Updated description`,
      });
    }

    // Column changes
    const origColIds = new Set(origTable.columns.map((c) => c.id));
    const propColIds = new Set(propTable.columns.map((c) => c.id));

    for (const col of propTable.columns) {
      if (!origColIds.has(col.id)) {
        diffs.push({
          type: "added",
          entity: "column",
          tableName: propTable.name,
          columnName: col.name,
          details: `${col.name}: ${col.type}`,
        });
      }
    }

    for (const col of origTable.columns) {
      if (!propColIds.has(col.id)) {
        diffs.push({
          type: "removed",
          entity: "column",
          tableName: propTable.name,
          columnName: col.name,
          details: `Removed column '${col.name}'`,
        });
      }
    }

    // Modified columns
    for (const propCol of propTable.columns) {
      const origCol = origTable.columns.find((c) => c.id === propCol.id);
      if (!origCol) continue;
      if (
        origCol.name !== propCol.name ||
        origCol.type !== propCol.type ||
        JSON.stringify(origCol.constraints) !== JSON.stringify(propCol.constraints)
      ) {
        diffs.push({
          type: "modified",
          entity: "column",
          tableName: propTable.name,
          columnName: propCol.name,
          details: `Modified '${origCol.name}' → '${propCol.name}' (${propCol.type})`,
        });
      }
    }

    // Index changes
    const origIndexIds = new Set((origTable.indexes ?? []).map((i) => i.id));
    const propIndexIds = new Set((propTable.indexes ?? []).map((i) => i.id));

    for (const idx of propTable.indexes ?? []) {
      if (!origIndexIds.has(idx.id)) {
        diffs.push({
          type: "added",
          entity: "index",
          tableName: propTable.name,
          indexName: idx.name,
          details: `New index '${idx.name}'${idx.isUnique ? " (UNIQUE)" : ""}`,
        });
      }
    }

    for (const idx of origTable.indexes ?? []) {
      if (!propIndexIds.has(idx.id)) {
        diffs.push({
          type: "removed",
          entity: "index",
          tableName: propTable.name,
          indexName: idx.name,
          details: `Removed index '${idx.name}'`,
        });
      }
    }
  }

  // Relation changes
  const origRelIds = new Set(Object.keys(original.relations));
  const propRelIds = new Set(Object.keys(proposed.relations));

  for (const id of propRelIds) {
    if (!origRelIds.has(id)) {
      const rel = proposed.relations[id];
      const srcName = proposed.tables[rel.sourceTableId]?.name ?? rel.sourceTableId;
      const tgtName = proposed.tables[rel.targetTableId]?.name ?? rel.targetTableId;
      diffs.push({
        type: "added",
        entity: "relation",
        relationName: rel.name ?? `${srcName} → ${tgtName}`,
        details: `${rel.type}: ${srcName} → ${tgtName}`,
      });
    }
  }

  for (const id of origRelIds) {
    if (!propRelIds.has(id)) {
      const rel = original.relations[id];
      const srcName = original.tables[rel.sourceTableId]?.name ?? rel.sourceTableId;
      const tgtName = original.tables[rel.targetTableId]?.name ?? rel.targetTableId;
      diffs.push({
        type: "removed",
        entity: "relation",
        relationName: rel.name ?? `${srcName} → ${tgtName}`,
        details: `Removed: ${srcName} → ${tgtName}`,
      });
    }
  }

  return diffs;
}

// ---------------------------------------------------------------------------
// Public API — Run tool calls in sandbox and produce diff
// ---------------------------------------------------------------------------

/**
 * Executes a batch of tool calls against an isolated copy of the schema AST.
 * Returns the proposed AST and a structured diff for Preview & Approve.
 */
export function runInSandbox(
  liveAST: SchemaAST,
  toolCalls: ToolCall[]
): SandboxResult {
  const originalAST = deepClone(liveAST);
  const sandboxAST = deepClone(liveAST);
  const idMap = new Map<string, string>();

  for (const tc of toolCalls) {
    const fnName = tc.function.name;
    let args: Record<string, unknown> = {};

    try {
      args = JSON.parse(tc.function.arguments);
    } catch {
      // If arg parsing fails, skip this tool call
      continue;
    }

    executeToolCall(sandboxAST, fnName, args, idMap);
  }

  const diffs = computeDiffs(originalAST, sandboxAST);

  return {
    originalAST,
    proposedAST: sandboxAST,
    diffs,
    appliedToolCalls: toolCalls,
  };
}

/**
 * Returns tool execution result messages for a batch of tool calls
 * (used to build tool response messages for the AI conversation).
 */
export function getToolResultMessages(
  liveAST: SchemaAST,
  toolCalls: ToolCall[]
): Array<{ toolCallId: string; result: string }> {
  const sandboxAST = deepClone(liveAST);
  const idMap = new Map<string, string>();
  const results: Array<{ toolCallId: string; result: string }> = [];

  for (const tc of toolCalls) {
    const fnName = tc.function.name;
    let args: Record<string, unknown> = {};

    try {
      args = JSON.parse(tc.function.arguments);
    } catch {
      results.push({ toolCallId: tc.id, result: `Error: Failed to parse arguments` });
      continue;
    }

    const result = executeToolCall(sandboxAST, fnName, args, idMap);
    results.push({
      toolCallId: tc.id,
      result: result.success ? result.message : `Error: ${result.message}`,
    });
  }

  return results;
}
