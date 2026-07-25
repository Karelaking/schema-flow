"use client";

import React, { useMemo } from "react";
import { AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { SchemaAST } from "@/packages/schema-core";
import { SchemaValidator } from "@/packages/validation";
import { Card, CardContent } from "@/components/ui/card";

/**
 * SRP Component: Displays schema validation diagnostics, warnings, and error reports.
 */
export function ValidationTab(): React.ReactNode {
  const projectId = useStore(state => state.projectId);
  const projectName = useStore(state => state.projectName);
  const projectDescription = useStore(state => state.projectDescription);
  const dialect = useStore(state => state.dialect);
  const autoAddId = useStore(state => state.autoAddId);
  const autoAddTimestamps = useStore(state => state.autoAddTimestamps);
  const tables = useStore(state => state.tables);
  const relations = useStore(state => state.relations);
  const enums = useStore(state => state.enums);

  const currentAST: SchemaAST = useMemo(() => ({
    project: {
      id: projectId || "temp-id",
      name: projectName,
      description: projectDescription,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    settings: {
      dialect,
      theme: "dark",
      autoAddId,
      autoAddTimestamps,
    },
    tables,
    relations,
    enums,
  }), [projectId, projectName, projectDescription, dialect, autoAddId, autoAddTimestamps, tables, relations, enums]);

  const validationResult = useMemo(() => {
    const validator = new SchemaValidator();
    const issues = validator.validate(currentAST);
    const errors = issues.filter(i => i.type === "error");
    const warnings = issues.filter(i => i.type === "warning");
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [currentAST]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Diagnostic Report
        </span>
        <span className="text-xs text-muted-foreground">
          {validationResult.errors.length} errors, {validationResult.warnings.length} warnings
        </span>
      </div>

      {validationResult.isValid && validationResult.warnings.length === 0 ? (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-emerald-500">Schema is Valid</span>
              <span className="text-[11px] text-muted-foreground">No errors or warnings detected in database structure.</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
          {/* Errors list */}
          {validationResult.errors.map((err, i) => (
            <Card key={`err-${i}`} className="border-destructive/30 bg-destructive/5">
              <CardContent className="p-3 flex items-start gap-2.5">
                <AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-destructive">Error</span>
                  <span className="text-xs text-foreground/90">{err.message}</span>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Warnings list */}
          {validationResult.warnings.map((warn, i) => (
            <Card key={`warn-${i}`} className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-3 flex items-start gap-2.5">
                <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-amber-500">Warning</span>
                  <span className="text-xs text-foreground/90">{warn.message}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
