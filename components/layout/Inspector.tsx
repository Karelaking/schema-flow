"use client";

import React, { useMemo, useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Layers, 
  Link2, 
  Info,
  Palette,
  Database,
  Code,
  AlertTriangle,
  Terminal,
  Copy,
  Check,
  AlertCircle
} from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Column, Table, Relation } from "@/packages/schema-core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/providers/ThemeProvider";
import { GeneratorFactory } from "@/packages/generators/factory/GeneratorFactory";
import { TypeScriptGenerator } from "@/packages/generators/typescript/TypeScriptGenerator";
import { SchemaValidator } from "@/packages/validation";
import { format } from "sql-formatter";

// Preset colors for tables
const PRESET_COLORS = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#10b981" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Pink", value: "#ec4899" },
  { name: "Orange", value: "#f97316" },
  { name: "Red", value: "#ef4444" },
  { name: "Slate", value: "#64748b" }
];

interface InspectorProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Inspector({ className, style }: InspectorProps = {}) {
  const { theme } = useTheme();

  // Zustand State
  const selectedTableId = useStore(state => state.selectedTableId);
  const selectedRelationId = useStore(state => state.selectedRelationId);
  const tables = useStore(state => state.tables);
  const relations = useStore(state => state.relations);
  const dialect = useStore(state => state.dialect);
  const projectName = useStore(state => state.projectName);
  const projectId = useStore(state => state.projectId);
  const past = useStore(state => state.past);
  const future = useStore(state => state.future);

  // Zustand Actions
  const updateTable = useStore(state => state.updateTable);
  const deleteTable = useStore(state => state.deleteTable);
  const duplicateTable = useStore(state => state.duplicateTable);

  const addColumn = useStore(state => state.addColumn);
  const updateColumn = useStore(state => state.updateColumn);
  const deleteColumn = useStore(state => state.deleteColumn);
  const reorderColumns = useStore(state => state.reorderColumns);

  const updateRelation = useStore(state => state.updateRelation);
  const deleteRelation = useStore(state => state.deleteRelation);

  // Local state
  const [activeTab, setActiveTab] = useState("inspector");
  const [logs, setLogs] = useState<string[]>([]);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedTs, setCopiedTs] = useState(false);

  // Selected entities
  const table = selectedTableId ? tables[selectedTableId] : null;
  const relation = selectedRelationId ? relations[selectedRelationId] : null;

  // Auto-switch to inspector tab when selection changes
  useEffect(() => {
    if (selectedTableId || selectedRelationId) {
      setActiveTab("inspector");
    }
  }, [selectedTableId, selectedRelationId]);

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

  // Copy helpers
  const handleCopySql = () => {
    navigator.clipboard.writeText(generatedSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleCopyTs = () => {
    navigator.clipboard.writeText(generatedTs);
    setCopiedTs(true);
    setTimeout(() => setCopiedTs(false), 2000);
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

  // Handle reordering columns (SRP)
  const moveColumn = (index: number, direction: "up" | "down") => {
    if (!table) return;
    const newCols = [...table.columns];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newCols.length) return;

    // Swap elements
    const temp = newCols[index];
    newCols[index] = newCols[targetIndex];
    newCols[targetIndex] = temp;

    reorderColumns(table.id, newCols);
  };

  const handleAddColumn = () => {
    if (!table) return;
    
    // Choose unique name
    let count = table.columns.length + 1;
    let colName = `column_${count}`;
    while (table.columns.some(c => c.name === colName)) {
      count++;
      colName = `column_${count}`;
    }

    addColumn(table.id, {
      name: colName,
      type: "TEXT",
      constraints: {
        isPrimaryKey: false,
        isNullable: true,
        isUnique: false,
        isAutoIncrement: false
      }
    });
  };

  return (
    <aside style={style} className={cn("sidebar-panel bg-card text-card-foreground flex flex-col shrink-0 select-none overflow-hidden h-full", className)}>
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full flex-1 flex flex-col overflow-hidden"
      >
        {/* Top Tab List */}
        <div className="px-4 py-2 border-b bg-muted/10 shrink-0">
          <TabsList className="grid grid-cols-5 w-full h-8">
            <TabsTrigger value="inspector" className="text-[11px] gap-1 px-0 flex items-center justify-center">
              <Info className="size-3.5 inspector-tab-icon" />
              <span className="inspector-tab-text">Inspect</span>
            </TabsTrigger>
            <TabsTrigger value="sql" className="text-[11px] gap-1 px-0 flex items-center justify-center">
              <Database className="size-3.5 inspector-tab-icon" />
              <span className="inspector-tab-text">SQL</span>
            </TabsTrigger>
            <TabsTrigger value="types" className="text-[11px] gap-1 px-0 flex items-center justify-center">
              <Code className="size-3.5 inspector-tab-icon" />
              <span className="inspector-tab-text">TS</span>
            </TabsTrigger>
            <TabsTrigger value="errors" className="text-[11px] gap-1 px-0 relative flex items-center justify-center">
              <AlertTriangle className="size-3.5 inspector-tab-icon" />
              <span className="inspector-tab-text">Errors</span>
              {validationErrors.length > 0 && (
                <span className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                  {validationErrors.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="logs" className="text-[11px] gap-1 px-0 flex items-center justify-center">
              <Terminal className="size-3.5 inspector-tab-icon" />
              <span className="inspector-tab-text">Logs</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Inspector Content */}
        <TabsContent value="inspector" className="flex-1 overflow-y-auto flex flex-col min-h-0 m-0">
          {relation ? (
            /* RELATIONSHIP INSPECTOR VIEW */
            <div className="flex flex-col p-4 gap-4 flex-1">
              <div>
                <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                  Relation Inspector
                </span>
                {(() => {
                  const sourceTable = tables[relation.sourceTableId];
                  const targetTable = tables[relation.targetTableId];
                  const sourceCol = sourceTable?.columns.find(c => c.id === relation.sourceColumnId);
                  const targetCol = targetTable?.columns.find(c => c.id === relation.targetColumnId);

                  return (
                    <h3 className="font-bold text-sm tracking-tight truncate mt-1 flex items-center gap-1.5">
                      <Link2 className="size-4 text-primary" />
                      {sourceTable?.name}.{sourceCol?.name} &rarr; {targetTable?.name}.{targetCol?.name}
                    </h3>
                  );
                })()}
              </div>
              <Separator />

              <div className="flex flex-col gap-4">
                {/* Relation Type */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="rel-type" className="text-xs font-semibold">Cardinality</Label>
                  <Select
                    value={relation.type}
                    onValueChange={(val: any) => updateRelation(relation.id, { type: val })}
                  >
                    <SelectTrigger id="rel-type">
                      <SelectValue placeholder="Relation type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one-to-one">One-to-One (1:1)</SelectItem>
                      <SelectItem value="one-to-many">One-to-Many (1:N)</SelectItem>
                      <SelectItem value="many-to-one">Many-to-One (N:1)</SelectItem>
                      <SelectItem value="many-to-many">Many-to-Many (N:M)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Delete Action */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="rel-on-delete" className="text-xs font-semibold">On Delete</Label>
                  <Select
                    value={relation.onDelete || "no-action"}
                    onValueChange={(val: any) => updateRelation(relation.id, { onDelete: val })}
                  >
                    <SelectTrigger id="rel-on-delete">
                      <SelectValue placeholder="Delete Action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cascade">CASCADE</SelectItem>
                      <SelectItem value="restrict">RESTRICT</SelectItem>
                      <SelectItem value="set-null">SET NULL</SelectItem>
                      <SelectItem value="no-action">NO ACTION</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Update Action */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="rel-on-update" className="text-xs font-semibold">On Update</Label>
                  <Select
                    value={relation.onUpdate || "no-action"}
                    onValueChange={(val: any) => updateRelation(relation.id, { onUpdate: val })}
                  >
                    <SelectTrigger id="rel-on-update">
                      <SelectValue placeholder="Update Action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cascade">CASCADE</SelectItem>
                      <SelectItem value="restrict">RESTRICT</SelectItem>
                      <SelectItem value="set-null">SET NULL</SelectItem>
                      <SelectItem value="no-action">NO ACTION</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-auto border-t pt-4">
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="w-full gap-1.5"
                  onClick={() => deleteRelation(relation.id)}
                >
                  <Trash2 className="size-4" />
                  Delete Relationship
                </Button>
              </div>
            </div>
          ) : table ? (
            /* TABLE INSPECTOR VIEW */
            <Tabs defaultValue="properties" className="w-full flex-1 flex flex-col">
              {/* Tabs header */}
              <div className="px-4 pt-3 pb-1 border-b">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="properties" className="text-xs">Meta</TabsTrigger>
                  <TabsTrigger value="columns" className="text-xs">Columns</TabsTrigger>
                  <TabsTrigger value="relations" className="text-xs">Links</TabsTrigger>
                </TabsList>
              </div>

              {/* Tab 1: Properties */}
              <TabsContent value="properties" className="p-4 flex flex-col gap-4 flex-1">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="table-name" className="text-xs font-semibold">Table Name</Label>
                  <Input
                    id="table-name"
                    value={table.name}
                    onChange={(e) => updateTable(table.id, { name: e.target.value })}
                    className="h-8 text-xs font-mono"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="table-desc" className="text-xs font-semibold">Description</Label>
                  <Textarea
                    id="table-desc"
                    value={table.description || ""}
                    onChange={(e) => updateTable(table.id, { description: e.target.value })}
                    className="text-xs"
                    placeholder="Database table description..."
                    rows={3}
                  />
                </div>

                {/* Colors picker */}
                <div className="flex flex-col gap-2.5">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Palette className="size-3.5 text-muted-foreground" />
                    Node Color
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map(c => (
                      <button
                        key={c.value}
                        onClick={() => updateTable(table.id, { color: c.value })}
                        className={cn(
                          "size-5.5 rounded-full border border-border shadow-sm relative transition-transform hover:scale-110",
                          table.color === c.value && "ring-2 ring-primary ring-offset-2"
                        )}
                        style={{ backgroundColor: c.value }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                <Separator className="my-2" />

                <div className="flex flex-col gap-2 mt-auto">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full gap-1.5"
                    onClick={() => duplicateTable(table.id)}
                  >
                    Duplicate Table
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full gap-1.5"
                    onClick={() => deleteTable(table.id)}
                  >
                    <Trash2 className="size-4" />
                    Delete Table
                  </Button>
                </div>
              </TabsContent>

              {/* Tab 2: Columns Editor */}
              <TabsContent value="columns" className="flex flex-col flex-1 p-0">
                {/* Header toolbar */}
                <div className="px-4 py-2 border-b bg-muted/20 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Columns ({table.columns.length})
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="size-7 text-primary hover:bg-primary hover:text-primary-foreground"
                    onClick={handleAddColumn}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5">
                  {table.columns.map((col, idx) => (
                    <Card key={col.id} className="border bg-card shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-3 flex flex-col gap-3">
                        {/* Header */}
                        <div className="flex items-center justify-between gap-2 min-w-0">
                          <Input
                            value={col.name}
                            onChange={(e) => updateColumn(table.id, col.id, { name: e.target.value })}
                            className="h-7 flex-1 min-w-0 text-xs font-mono border-none focus-visible:ring-1 focus-visible:ring-muted p-0 px-1 bg-transparent hover:bg-muted/30"
                            placeholder="column_name"
                          />
                          
                          {/* Control buttons */}
                          <div className="flex items-center gap-0.5 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-6 text-muted-foreground"
                              onClick={() => moveColumn(idx, "up")}
                              disabled={idx === 0}
                            >
                              <ArrowUp className="size-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-6 text-muted-foreground"
                              onClick={() => moveColumn(idx, "down")}
                              disabled={idx === table.columns.length - 1}
                            >
                              <ArrowDown className="size-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-6 text-destructive"
                              onClick={() => deleteColumn(table.id, col.id)}
                            >
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Column type / constraints */}
                        <div className="grid grid-cols-2 gap-2 column-settings-grid">
                          <div className="flex flex-col gap-1">
                            <Label className="text-[10px] text-muted-foreground font-semibold">Type</Label>
                            <Select
                              value={col.type}
                              onValueChange={(val) => {
                                if (val) updateColumn(table.id, col.id, { type: val });
                              }}
                            >
                              <SelectTrigger className="h-7 text-[10px]">
                                <SelectValue placeholder="Type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="INTEGER">INTEGER</SelectItem>
                                <SelectItem value="TEXT">TEXT</SelectItem>
                                <SelectItem value="REAL">REAL</SelectItem>
                                <SelectItem value="BLOB">BLOB</SelectItem>
                                <SelectItem value="BOOLEAN">BOOLEAN</SelectItem>
                                <SelectItem value="DATE">DATE</SelectItem>
                                <SelectItem value="DATETIME">DATETIME</SelectItem>
                                <SelectItem value="JSON">JSON</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex flex-col gap-1">
                            <Label className="text-[10px] text-muted-foreground font-semibold">Default</Label>
                            <Input
                              value={col.constraints.defaultValue || ""}
                              onChange={(e) => updateColumn(table.id, col.id, { 
                                constraints: { ...col.constraints, defaultValue: e.target.value || undefined } 
                              })}
                              className="h-7 text-[10px] font-mono"
                              placeholder="NULL"
                            />
                          </div>
                        </div>

                        {/* Checkboxes for key constraints */}
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-1 column-constraints-grid">
                          <div className="flex items-center justify-between">
                            <Label className="text-[10px] font-semibold cursor-pointer">Primary Key (PK)</Label>
                            <Switch
                              checked={col.constraints.isPrimaryKey}
                              onCheckedChange={(val) => updateColumn(table.id, col.id, {
                                constraints: { ...col.constraints, isPrimaryKey: val, isNullable: val ? false : col.constraints.isNullable }
                              })}
                              className="scale-75"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label className="text-[10px] font-semibold cursor-pointer">Nullable (NULL)</Label>
                            <Switch
                              checked={col.constraints.isNullable}
                              disabled={col.constraints.isPrimaryKey}
                              onCheckedChange={(val) => updateColumn(table.id, col.id, {
                                constraints: { ...col.constraints, isNullable: val }
                              })}
                              className="scale-75"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label className="text-[10px] font-semibold cursor-pointer">Unique (UQ)</Label>
                            <Switch
                              checked={col.constraints.isUnique}
                              onCheckedChange={(val) => updateColumn(table.id, col.id, {
                                constraints: { ...col.constraints, isUnique: val }
                              })}
                              className="scale-75"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label className="text-[10px] font-semibold cursor-pointer">Auto-Inc (AI)</Label>
                            <Switch
                              checked={col.constraints.isAutoIncrement}
                              disabled={col.type !== "INTEGER"}
                              onCheckedChange={(val) => updateColumn(table.id, col.id, {
                                constraints: { ...col.constraints, isAutoIncrement: val }
                              })}
                              className="scale-75"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Tab 3: Relations List */}
              <TabsContent value="relations" className="p-4 flex flex-col gap-3.5 flex-1">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Connected Relations
                </span>

                <div className="flex flex-col gap-2">
                  {Object.values(relations)
                    .filter(rel => rel.sourceTableId === table.id || rel.targetTableId === table.id)
                    .map(rel => {
                      const sTable = tables[rel.sourceTableId];
                      const tTable = tables[rel.targetTableId];
                      const sCol = sTable?.columns.find(c => c.id === rel.sourceColumnId);
                      const tCol = tTable?.columns.find(c => c.id === rel.targetColumnId);
                      
                      return (
                        <div 
                          key={rel.id}
                          onClick={() => useStore.getState().selectRelation(rel.id)}
                          className="p-2.5 rounded-lg border bg-muted/20 hover:bg-muted/40 cursor-pointer text-xs flex flex-col gap-1 transition-colors"
                        >
                          <div className="font-semibold flex items-center justify-between">
                            <span className="text-primary uppercase tracking-wider text-[9px] font-bold">
                              {rel.type}
                            </span>
                            <span className="text-muted-foreground font-mono text-[10px]">
                              {rel.onDelete ? `ON DEL: ${rel.onDelete}` : ""}
                            </span>
                          </div>
                          <div className="truncate font-mono text-muted-foreground">
                            {sTable?.name}.{sCol?.name} &rarr; {tTable?.name}.{tCol?.name}
                          </div>
                        </div>
                      );
                    })}

                  {Object.values(relations).filter(
                    rel => rel.sourceTableId === table.id || rel.targetTableId === table.id
                  ).length === 0 && (
                    <div className="text-xs text-muted-foreground italic p-2.5 text-center">
                      No relationships referencing this table. Drag connections between handles to create one.
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            /* EMPTY STATE VIEW */
            <div className="flex-1 flex flex-col justify-center items-center p-6 text-center gap-3">
              <div className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Info className="size-5" />
              </div>
              <span className="font-semibold text-sm">No Selection</span>
              <p className="text-xs text-muted-foreground max-w-48 leading-relaxed">
                Select a table node or a relationship edge on the canvas to inspect and edit details.
              </p>
            </div>
          )}
        </TabsContent>

        {/* Tab 2: SQL Content */}
        <TabsContent value="sql" className="flex-1 overflow-hidden p-0 m-0 relative min-h-0 flex flex-col">
          <div className="h-9 px-4 border-b flex items-center justify-between bg-muted/5 shrink-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">SQL DDL ({dialect.toUpperCase()})</span>
            <Button
              variant="outline"
              size="xs"
              className="h-6 px-2 gap-1 text-[10px]"
              onClick={handleCopySql}
            >
              {copiedSql ? (
                <>
                  <Check className="size-3 text-emerald-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="size-3" />
                  Copy Output
                </>
              )}
            </Button>
          </div>
          <div className="flex-1 min-h-0 relative">
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
                padding: { top: 12, bottom: 12 },
                folding: true,
                foldingHighlight: true,
                showFoldingControls: "always",
                foldingStrategy: "indentation"
              }}
            />
          </div>
        </TabsContent>

        {/* Tab 3: TypeScript Content */}
        <TabsContent value="types" className="flex-1 overflow-hidden p-0 m-0 relative min-h-0 flex flex-col">
          <div className="h-9 px-4 border-b flex items-center justify-between bg-muted/5 shrink-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">TypeScript</span>
            <Button
              variant="outline"
              size="xs"
              className="h-6 px-2 gap-1 text-[10px]"
              onClick={handleCopyTs}
            >
              {copiedTs ? (
                <>
                  <Check className="size-3 text-emerald-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="size-3" />
                  Copy Output
                </>
              )}
            </Button>
          </div>
          <div className="flex-1 min-h-0 relative">
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
                padding: { top: 12, bottom: 12 },
                folding: true,
                foldingHighlight: true,
                showFoldingControls: "always",
                foldingStrategy: "indentation"
              }}
            />
          </div>
        </TabsContent>

        {/* Tab 4: Validation Errors Content */}
        <TabsContent value="errors" className="flex-1 overflow-y-auto p-4 flex flex-col min-h-0 m-0">
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

        {/* Tab 5: Application Operation Logs Content */}
        <TabsContent value="logs" className="flex-1 overflow-y-auto p-4 flex flex-col bg-muted/5 font-mono text-[11px] text-muted-foreground gap-1 min-h-0 m-0 select-text">
          {logs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-1">
              <span className="text-primary shrink-0">&gt;</span>
              <p>{log}</p>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </aside>
  );
}
