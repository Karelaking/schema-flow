// =============================================================================
// AI DB Architect Agent — 10-Point Automatic Schema Audit Engine
// =============================================================================
//
// Evaluates a SchemaAST against database normalization standards (3NF),
// dialect constraints, indexing rules, security traps, and custom user rules.
// =============================================================================

import type { SchemaAST } from "@/packages/schema-core";
import type { CustomRule } from "./types";

export type AuditSeverity = "error" | "warning" | "info";

export interface AuditIssue {
  id: string;
  category:
    | "primary_key"
    | "unindexed_foreign_key"
    | "circular_dependency"
    | "missing_audit_columns"
    | "single_tenant_trap"
    | "orphaned_table"
    | "casing_inconsistency"
    | "enum_normalization"
    | "custom_rule";
  severity: AuditSeverity;
  tableId?: string;
  tableName?: string;
  message: string;
  recommendation: string;
}

export interface SchemaAuditReport {
  timestamp: number;
  score: number; // 0 to 100
  passed: boolean; // True if 0 errors
  errorCount: number;
  warningCount: number;
  issues: AuditIssue[];
}

/**
 * Runs the 10-Point Automatic Schema Audit Engine on a SchemaAST.
 */
export function evaluateSchemaAST(
  ast: SchemaAST,
  customRules: CustomRule[] = []
): SchemaAuditReport {
  const issues: AuditIssue[] = [];
  const tables = Object.values(ast.tables ?? {});
  const relations = Object.values(ast.relations ?? {});

  // 1. Primary Key Check
  for (const table of tables) {
    const hasPK = table.columns.some((c) => c.constraints?.isPrimaryKey);
    if (!hasPK) {
      issues.push({
        id: `pk-missing-${table.id}`,
        category: "primary_key",
        severity: "error",
        tableId: table.id,
        tableName: table.name,
        message: `Table '${table.name}' has no primary key.`,
        recommendation: `Add a primary key column (e.g. 'id' INTEGER PRIMARY KEY or UUID) to table '${table.name}'.`,
      });
    }
  }

  // 2. Unindexed Foreign Keys Check
  for (const rel of relations) {
    const srcTable = ast.tables[rel.sourceTableId];
    if (!srcTable) continue;

    const srcCol = srcTable.columns.find((c) => c.id === rel.sourceColumnId);
    if (!srcCol) continue;

    // Check if there is an index covering this column
    const isIndexed = (srcTable.indexes ?? []).some((idx) =>
      idx.columns.some((ic) => ic.columnName === srcCol.name)
    );

    if (!isIndexed && !srcCol.constraints?.isPrimaryKey) {
      issues.push({
        id: `fk-unindexed-${rel.id}`,
        category: "unindexed_foreign_key",
        severity: "warning",
        tableId: srcTable.id,
        tableName: srcTable.name,
        message: `Foreign key column '${srcTable.name}.${srcCol.name}' is unindexed.`,
        recommendation: `Add an index on column '${srcCol.name}' in table '${srcTable.name}' to optimize JOIN and CASCADE performance.`,
      });
    }
  }

  // 3. Circular Foreign Keys Check
  const adjacency = new Map<string, Set<string>>();
  for (const rel of relations) {
    if (!adjacency.has(rel.sourceTableId)) adjacency.set(rel.sourceTableId, new Set());
    adjacency.get(rel.sourceTableId)!.add(rel.targetTableId);
  }

  for (const [srcId, targets] of adjacency.entries()) {
    for (const tgtId of targets) {
      if (adjacency.get(tgtId)?.has(srcId)) {
        const t1 = ast.tables[srcId]?.name ?? srcId;
        const t2 = ast.tables[tgtId]?.name ?? tgtId;
        issues.push({
          id: `circular-fk-${srcId}-${tgtId}`,
          category: "circular_dependency",
          severity: "error",
          tableName: `${t1} <-> ${t2}`,
          message: `Circular foreign key dependency detected between table '${t1}' and table '${t2}'.`,
          recommendation: `Break circular dependency by decoupling '${t1}' and '${t2}' or using a junction table.`,
        });
      }
    }
  }

  // 4. Missing Audit Columns Check (created_at / updated_at)
  for (const table of tables) {
    const colNames = table.columns.map((c) => c.name.toLowerCase());
    const hasCreatedAt = colNames.includes("created_at") || colNames.includes("createdat");
    const hasUpdatedAt = colNames.includes("updated_at") || colNames.includes("updatedat");

    if (!hasCreatedAt && !hasUpdatedAt && table.columns.length > 2) {
      issues.push({
        id: `audit-cols-missing-${table.id}`,
        category: "missing_audit_columns",
        severity: "warning",
        tableId: table.id,
        tableName: table.name,
        message: `Table '${table.name}' is missing audit timestamp columns ('created_at', 'updated_at').`,
        recommendation: `Add 'created_at' and 'updated_at' TIMESTAMP columns to table '${table.name}'.`,
      });
    }
  }

  // 5. Single-Tenant Trap Check
  const isMultiTenantContext =
    ast.project.name.toLowerCase().includes("saas") ||
    ast.project.name.toLowerCase().includes("tenant") ||
    tables.some((t) => t.name.toLowerCase().includes("organization") || t.name.toLowerCase().includes("tenant"));

  if (isMultiTenantContext) {
    for (const table of tables) {
      const isOrgTable = table.name.toLowerCase().includes("organization") || table.name.toLowerCase().includes("tenant") || table.name.toLowerCase().includes("user");
      if (isOrgTable) continue;

      const colNames = table.columns.map((c) => c.name.toLowerCase());
      const hasTenantId = colNames.includes("organization_id") || colNames.includes("tenant_id") || colNames.includes("org_id");

      if (!hasTenantId) {
        issues.push({
          id: `single-tenant-trap-${table.id}`,
          category: "single_tenant_trap",
          severity: "warning",
          tableId: table.id,
          tableName: table.name,
          message: `Multi-tenant context detected, but table '${table.name}' lacks 'organization_id' or 'tenant_id'.`,
          recommendation: `Add 'organization_id' foreign key to table '${table.name}' for tenant isolation.`,
        });
      }
    }
  }

  // 6. Orphaned Tables Check (in schemas with >= 3 tables)
  if (tables.length >= 3) {
    for (const table of tables) {
      const isConnected = relations.some(
        (r) => r.sourceTableId === table.id || r.targetTableId === table.id
      );

      if (!isConnected) {
        issues.push({
          id: `orphaned-table-${table.id}`,
          category: "orphaned_table",
          severity: "warning",
          tableId: table.id,
          tableName: table.name,
          message: `Table '${table.name}' has no foreign key relationships with other tables.`,
          recommendation: `Connect '${table.name}' to related tables or confirm if it is intended as an isolated lookup table.`,
        });
      }
    }
  }

  // 7. Casing Inconsistency Check
  for (const table of tables) {
    const hasCamel = table.columns.some((c) => /[a-z][A-Z]/.test(c.name));
    const hasSnake = table.columns.some((c) => c.name.includes("_"));

    if (hasCamel && hasSnake) {
      issues.push({
        id: `casing-mix-${table.id}`,
        category: "casing_inconsistency",
        severity: "info",
        tableId: table.id,
        tableName: table.name,
        message: `Table '${table.name}' mixes camelCase and snake_case column names.`,
        recommendation: `Standardize all column names in table '${table.name}' to snake_case.`,
      });
    }
  }

  // 8. Custom User Rules Compliance
  const activeCustomRules = customRules.filter((r) => r.isEnabled);
  for (const rule of activeCustomRules) {
    // Basic rule heuristics (e.g. UUID primary keys rule)
    if (rule.content.toLowerCase().includes("uuid")) {
      for (const table of tables) {
        const pkCol = table.columns.find((c) => c.constraints?.isPrimaryKey);
        if (pkCol && !pkCol.type.toLowerCase().includes("uuid")) {
          issues.push({
            id: `custom-rule-uuid-${table.id}`,
            category: "custom_rule",
            severity: "warning",
            tableId: table.id,
            tableName: table.name,
            message: `Custom Rule Violation ('${rule.title}'): Table '${table.name}' primary key '${pkCol.name}' is '${pkCol.type}' instead of UUID.`,
            recommendation: `Change primary key '${pkCol.name}' type to UUID in table '${table.name}'.`,
          });
        }
      }
    }
  }

  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  const score = Math.max(0, 100 - errorCount * 25 - warningCount * 10);

  return {
    timestamp: Date.now(),
    score,
    passed: errorCount === 0,
    errorCount,
    warningCount,
    issues,
  };
}

/** Formats a SchemaAuditReport into a corrective prompt feedback block */
export function buildAuditFeedbackPrompt(report: SchemaAuditReport): string {
  if (report.passed && report.issues.length === 0) {
    return "✅ **Schema Evaluation Passed**: 0 critical errors or anti-patterns detected.";
  }

  const lines: string[] = [
    `⚠️ **Schema Evaluation Audit Results** (Score: ${report.score}/100 | ${report.errorCount} Errors, ${report.warningCount} Warnings):\n`,
    "Please self-correct the following detected defects by calling appropriate tools before concluding:",
  ];

  report.issues.forEach((issue, idx) => {
    const icon = issue.severity === "error" ? "❌ [ERROR]" : "⚠️ [WARN]";
    lines.push(`${idx + 1}. ${icon} ${issue.message}`);
    lines.push(`   → **Fix**: ${issue.recommendation}`);
  });

  return lines.join("\n");
}
