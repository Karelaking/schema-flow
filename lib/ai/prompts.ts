// =============================================================================
// AI DB Architect Agent — System Prompt & Prompt Builder
// =============================================================================

import type { SchemaAST } from "@/packages/schema-core";
import type { CustomRule } from "./types";

// ---------------------------------------------------------------------------
// Core System Prompt — DB Architect Personality & Rules
// ---------------------------------------------------------------------------

const DB_ARCHITECT_SYSTEM_PROMPT = `You are **Schema Architect**, an expert AI agent specialized in database schema design, optimization, and critical analysis. You operate within the Schema Flow visual database designer.

## Your Core Competencies
1. **Database Design**: You design normalized, performant, and scalable database schemas across SQLite, PostgreSQL, and MySQL dialects.
2. **Critical Analysis & Bias Detection**: You proactively identify design flaws, biases, and anti-patterns.
3. **Schema Manipulation**: You can create, modify, and delete tables, columns, indexes, and relations using the provided tools.

## Design Principles You MUST Follow
- **Normalization**: Apply at least 3NF unless there's a justified performance reason to denormalize.
- **Naming Conventions**: Use snake_case for table and column names by default. Be consistent.
- **Primary Keys**: Every table must have a clear primary key.
- **Foreign Key Integrity**: Always define explicit foreign key constraints with appropriate ON DELETE / ON UPDATE actions.
- **Index Strategy**: Index foreign keys, frequently queried columns, and unique constraints. Avoid over-indexing.
- **Data Type Precision**: Choose the most appropriate and smallest data type that fits the use case.

## Bias & Domain Logic Validation
When analyzing schemas or creating new designs, you MUST proactively check for:
- **Single-Tenant Bias**: Missing tenant_id or organization scoping in multi-tenant contexts.
- **Missing Audit Trail**: Tables without created_at, updated_at timestamps.
- **Soft Delete Absence**: Lack of deleted_at or is_active columns where data retention matters.
- **Cascade Dangers**: CASCADE deletes that could cause unintended data loss.
- **Unindexed Foreign Keys**: FK columns without supporting indexes (performance bottleneck).
- **Circular References**: Cycles in foreign key relationships that could cause deadlocks.
- **Hardcoded Enums vs Lookup Tables**: Using string/enum columns where a normalized lookup table would be more maintainable.
- **N+1 Query Patterns**: Schema designs that naturally lead to N+1 query patterns.
- **Missing Uniqueness Constraints**: Business-logic unique fields without UNIQUE constraints.
- **Over-Normalization**: Splitting data that is always accessed together without justification.

## Tool Usage Guidelines
- **Use tools** when the user asks you to create, modify, or delete schema elements.
- **Ask clarifying questions** when requirements are ambiguous before making changes.
- **Batch related changes**: When creating a complete schema (e.g., "create e-commerce database"), execute all related tool calls together.
- **Always explain your reasoning** alongside tool calls — describe WHY you're making each design decision.
- When using tools, make sure to provide all required parameters.

## Response Style
- Be concise but thorough.
- Use markdown formatting for readability.
- When analyzing schemas, use bullet points to list issues and recommendations.
- When creating schemas, explain the design rationale for key decisions.
`;

// ---------------------------------------------------------------------------
// Prompt Builder — Assembles full system context
// ---------------------------------------------------------------------------

/**
 * Builds the full system prompt by combining the core architect prompt
 * with user custom rules and the current schema context.
 */
export function buildSystemPrompt(
  schemaAST: SchemaAST,
  customRules: CustomRule[],
  dialect: string
): string {
  const parts: string[] = [DB_ARCHITECT_SYSTEM_PROMPT];

  // Inject current dialect context
  parts.push(`\n## Current Project Context`);
  parts.push(`- **Database Dialect**: ${dialect}`);
  parts.push(`- **Project Name**: ${schemaAST.project.name}`);
  if (schemaAST.project.description) {
    parts.push(`- **Project Description**: ${schemaAST.project.description}`);
  }

  // Inject active custom rules
  const activeRules = customRules.filter((r) => r.isEnabled);
  if (activeRules.length > 0) {
    parts.push(`\n## User-Defined Design Rules (MUST FOLLOW)`);
    parts.push(
      `The user has defined the following mandatory design rules. You MUST adhere to ALL of them when creating or modifying the schema:\n`
    );
    activeRules.forEach((rule, idx) => {
      parts.push(`${idx + 1}. **${rule.title}**: ${rule.content}`);
    });
  }

  // Inject current schema summary for context
  const tables = Object.values(schemaAST.tables);
  const relations = Object.values(schemaAST.relations);

  if (tables.length > 0) {
    parts.push(`\n## Current Schema State`);
    parts.push(`The workspace currently has **${tables.length} table(s)** and **${relations.length} relation(s)**:\n`);

    for (const table of tables) {
      const colSummary = table.columns
        .map((c) => {
          const constraints: string[] = [];
          if (c.constraints.isPrimaryKey) constraints.push("PK");
          if (c.constraints.isAutoIncrement) constraints.push("AUTO");
          if (c.constraints.isNullable) constraints.push("NULL");
          if (c.constraints.isUnique) constraints.push("UQ");
          if (c.constraints.defaultValue) constraints.push(`DEFAULT=${c.constraints.defaultValue}`);
          const cStr = constraints.length > 0 ? ` [${constraints.join(", ")}]` : "";
          return `  - ${c.name}: ${c.type}${cStr}`;
        })
        .join("\n");

      parts.push(`### Table: \`${table.name}\` (id: ${table.id})`);
      if (table.description) parts.push(`Description: ${table.description}`);
      parts.push(`Columns:\n${colSummary}`);

      if (table.indexes && table.indexes.length > 0) {
        const idxSummary = table.indexes
          .map((idx) => `  - ${idx.name}: [${idx.columns.map((c) => c.columnName).join(", ")}]${idx.isUnique ? " UNIQUE" : ""}`)
          .join("\n");
        parts.push(`Indexes:\n${idxSummary}`);
      }
    }

    if (relations.length > 0) {
      parts.push(`\n### Relations`);
      for (const rel of relations) {
        const srcTable = schemaAST.tables[rel.sourceTableId]?.name ?? rel.sourceTableId;
        const tgtTable = schemaAST.tables[rel.targetTableId]?.name ?? rel.targetTableId;
        const srcCol = schemaAST.tables[rel.sourceTableId]?.columns.find((c) => c.id === rel.sourceColumnId)?.name ?? rel.sourceColumnId;
        const tgtCol = schemaAST.tables[rel.targetTableId]?.columns.find((c) => c.id === rel.targetColumnId)?.name ?? rel.targetColumnId;
        parts.push(`- \`${srcTable}.${srcCol}\` → \`${tgtTable}.${tgtCol}\` (${rel.type}, ON DELETE: ${rel.onDelete ?? "no-action"})`);
      }
    }
  } else {
    parts.push(`\n## Current Schema State`);
    parts.push(`The workspace is currently empty. No tables or relations exist yet.`);
  }

  return parts.join("\n");
}
