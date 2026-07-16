"use client";

import React, { useMemo, useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { 
  Database, 
  Code, 
  AlertTriangle, 
  Terminal, 
  Copy, 
  Check, 
  AlertCircle
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useTheme } from "@/providers/ThemeProvider";
import { GeneratorFactory } from "@/packages/generators/factory/GeneratorFactory";
import { TypeScriptGenerator } from "@/packages/generators/typescript/TypeScriptGenerator";
import { SchemaValidator, ValidationError } from "@/packages/validation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { format } from "sql-formatter";

export function Console() {
  const { theme } = useTheme();
  
  // Zustand State
  const tables = useStore(state => state.tables);
  const relations = useStore(state => state.relations);
  const dialect = useStore(state => state.dialect);
  const projectName = useStore(state => state.projectName);
  const projectId = useStore(state => state.projectId);
  const past = useStore(state => state.past);
  const future = useStore(state => state.future);

  // local logs
  const [logs, setLogs] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("sql");

  // Re-construct the full AST for generators and validators
  const ast = useMemo(() => {
    return {
      project: {
        id: projectId || "temp",
        name: projectName,
        createdAt: "",
        updatedAt: ""
      },
      settings: {
        dialect,
        theme
      },
      tables,
      relations
    };
  }, [projectId, projectName, dialect, theme, tables, relations]);

  // Real-time SQL code generation
  const generatedSql = useMemo(() => {
    try {
      const generator = GeneratorFactory.getGenerator(dialect);
      const rawSql = generator.generate(ast);
      if (!rawSql) return "-- Define tables to generate SQL DDL.";
      
      // Attempt formatting
      return format(rawSql, { language: "sqlite" });
    } catch (err: any) {
      return `-- Code Generation Error: ${err.message}`;
    }
  }, [dialect, ast]);

  // Real-time TypeScript code generation
  const generatedTs = useMemo(() => {
    try {
      const generator = new TypeScriptGenerator();
      const rawTs = generator.generate(ast);
      if (!rawTs) return "// Define tables to generate TypeScript interfaces.";
      return rawTs;
    } catch (err: any) {
      return `// Code Generation Error: ${err.message}`;
    }
  }, [ast]);

  // Real-time validation
  const validationErrors = useMemo(() => {
    const validator = new SchemaValidator();
    return validator.validate(ast);
  }, [ast]);

  // Copy code to clipboard helper
  const handleCopy = () => {
    const textToCopy = activeTab === "sql" ? generatedSql : generatedTs;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate operation logs based on history movements
  useEffect(() => {
    const tableCount = Object.keys(tables).length;
    const relCount = Object.keys(relations).length;
    const timestamp = new Date().toLocaleTimeString();

    setLogs(prev => [
      `[${timestamp}] State updated: ${tableCount} tables, ${relCount} relations loaded.`,
      ...prev.slice(0, 49) // Keep last 50 logs
    ]);
  }, [tables, relations]);

  // Log history undos/redos
  useEffect(() => {
    if (past.length > 0) {
      const timestamp = new Date().toLocaleTimeString();
      setLogs(prev => [
        `[${timestamp}] Action pushed to history stack (Stack size: ${past.length}).`,
        ...prev.slice(0, 49)
      ]);
    }
  }, [past.length]);

  return (
    <div className="h-64 border-t bg-card text-card-foreground flex flex-col select-none overflow-hidden shrink-0">
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full flex-1 flex flex-col"
      >
        {/* Tabs Bar */}
        <div className="h-10 px-6 border-b bg-muted/10 flex items-center justify-between shrink-0">
          <TabsList className="h-8">
            <TabsTrigger value="sql" className="text-xs gap-1.5 h-7">
              <Database className="size-3.5" />
              SQL DDL
            </TabsTrigger>
            <TabsTrigger value="types" className="text-xs gap-1.5 h-7">
              <Code className="size-3.5" />
              TypeScript
            </TabsTrigger>
            <TabsTrigger value="errors" className="text-xs gap-1.5 h-7 relative">
              <AlertTriangle className="size-3.5" />
              Errors
              {validationErrors.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                  {validationErrors.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="logs" className="text-xs gap-1.5 h-7">
              <Terminal className="size-3.5" />
              Console Logs
            </TabsTrigger>
          </TabsList>

          {/* Copy Button (Only for SQL & TypeScript) */}
          {(activeTab === "sql" || activeTab === "types") && (
            <Button
              variant="outline"
              size="xs"
              className="h-7 px-2.5 gap-1.5 text-[11px] font-medium"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-emerald-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  Copy Output
                </>
              )}
            </Button>
          )}
        </div>

        {/* Tab content panel */}
        <div className="flex-1 overflow-hidden relative">
          {/* SQL Panel */}
          <TabsContent value="sql" className="absolute inset-0 p-0 m-0">
            <Editor
              language="sql"
              value={generatedSql}
              theme={theme === "dark" ? "vs-dark" : "light"}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 12,
                fontFamily: "var(--font-mono, monospace)",
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 12, bottom: 12 }
              }}
            />
          </TabsContent>

          {/* TypeScript Panel */}
          <TabsContent value="types" className="absolute inset-0 p-0 m-0">
            <Editor
              language="typescript"
              value={generatedTs}
              theme={theme === "dark" ? "vs-dark" : "light"}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 12,
                fontFamily: "var(--font-mono, monospace)",
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 12, bottom: 12 }
              }}
            />
          </TabsContent>

          {/* Validation Errors Panel */}
          <TabsContent value="errors" className="absolute inset-0 overflow-y-auto p-4 flex flex-col">
            {validationErrors.length === 0 ? (
              <div className="flex-1 flex flex-col justify-center items-center text-center gap-2 p-6">
                <div className="size-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Check className="size-4" />
                </div>
                <span className="font-semibold text-xs text-foreground">Validation Passed</span>
                <p className="text-[11px] text-muted-foreground">
                  No errors or warnings. The database schema design is correct and deployment-ready.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {validationErrors.map((err, idx) => (
                  <div 
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-muted/10 text-xs"
                  >
                    {err.type === "error" ? (
                      <AlertCircle className="size-4.5 text-destructive shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="size-4.5 text-yellow-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={err.type === "error" ? "destructive" : "secondary"}
                          className="h-4.5 px-1.5 text-[9px] uppercase font-bold"
                        >
                          {err.type}
                        </Badge>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          Path: {err.path}
                        </span>
                      </div>
                      <p className="text-foreground leading-relaxed">
                        {err.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Application Operation Logs Panel */}
          <TabsContent value="logs" className="absolute inset-0 overflow-y-auto p-4 flex flex-col bg-muted/5 font-mono text-[11px] text-muted-foreground gap-1">
            {logs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-1 select-text">
                <span className="text-primary shrink-0">&gt;</span>
                <p>{log}</p>
              </div>
            ))}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
