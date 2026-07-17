"use client";

import React, { useState, useMemo, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Copy, Check, Terminal, Plus, Trash2, Layers, Filter, ArrowUpDown } from "lucide-react";
import { useStore } from "@/lib/store";
import { useTheme } from "@/providers/ThemeProvider";
import { Table, Relation } from "@/packages/schema-core";
import { format } from "sql-formatter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

export interface WhereCondition {
  id: string;
  column: string;
  operator: "=" | "!=" | ">" | "<" | ">=" | "<=" | "LIKE" | "ILIKE" | "IN" | "NOT IN" | "IS NULL" | "IS NOT NULL";
  value: string;
}

export interface SortOption {
  column: string;
  direction: "ASC" | "DESC";
}

export interface JoinOption {
  id: string;
  joinType: "INNER JOIN" | "LEFT JOIN" | "RIGHT JOIN";
  targetTableId: string;
  sourceColumn: string;
  targetColumn: string;
}

/**
 * QueryBuilderTab Component: Advanced, dialect-aware SQL query generator with JOINs, filters, sorting, aggregation, and live Monaco code editor.
 */
export function QueryBuilderTab(): React.JSX.Element {
  const { theme } = useTheme();
  const tables = useStore((state) => state.tables);
  const relations = useStore((state) => state.relations);
  const dialect = useStore((state) => state.dialect);
  const selectedTableId = useStore((state) => state.selectedTableId);

  const tableList = useMemo(() => Object.values(tables), [tables]);
  const defaultTableId = selectedTableId && tables[selectedTableId] ? selectedTableId : tableList[0]?.id || "";

  const [activeTableId, setActiveTableId] = useState<string>(defaultTableId);
  const [queryType, setQueryType] = useState<"SELECT" | "INSERT" | "UPDATE" | "DELETE">("SELECT");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [joins, setJoins] = useState<JoinOption[]>([]);
  const [conditions, setConditions] = useState<WhereCondition[]>([]);
  const [sortOptions, setSortOptions] = useState<SortOption[]>([]);
  const [groupByColumns, setGroupByColumns] = useState<string[]>([]);
  const [limit, setLimit] = useState<string>("50");
  const [offset, setOffset] = useState<string>("0");
  const [copied, setCopied] = useState(false);

  const activeTable: Table | undefined = tables[activeTableId] || tableList[0];

  // Sync active table if selected table in canvas changes
  useEffect(() => {
    if (selectedTableId && tables[selectedTableId]) {
      setActiveTableId(selectedTableId);
    }
  }, [selectedTableId, tables]);

  // Reset selected columns when active table changes
  useEffect(() => {
    if (activeTable) {
      setSelectedColumns(activeTable.columns.map((c) => c.name));
      setJoins([]);
      setConditions([]);
      setSortOptions([]);
      setGroupByColumns([]);
    }
  }, [activeTableId]);

  const handleToggleColumn = (colName: string) => {
    setSelectedColumns((prev) =>
      prev.includes(colName) ? prev.filter((c) => c !== colName) : [...prev, colName]
    );
  };

  const handleToggleGroupBy = (colName: string) => {
    setGroupByColumns((prev) =>
      prev.includes(colName) ? prev.filter((c) => c !== colName) : [...prev, colName]
    );
  };

  const handleAddJoin = () => {
    const otherTables = tableList.filter((t) => t.id !== activeTableId);
    if (otherTables.length === 0 || !activeTable || activeTable.columns.length === 0) return;

    const target = otherTables[0];
    const newJoin: JoinOption = {
      id: `join-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      joinType: "INNER JOIN",
      targetTableId: target.id,
      sourceColumn: activeTable.columns[0]?.name || "id",
      targetColumn: target.columns[0]?.name || "id",
    };
    setJoins((prev) => [...prev, newJoin]);
  };

  const handleUpdateJoin = (id: string, updates: Partial<JoinOption>) => {
    setJoins((prev) => prev.map((j) => (j.id === id ? { ...j, ...updates } : j)));
  };

  const handleDeleteJoin = (id: string) => {
    setJoins((prev) => prev.filter((j) => j.id !== id));
  };

  const handleAddCondition = () => {
    if (!activeTable || activeTable.columns.length === 0) return;
    const newCond: WhereCondition = {
      id: `cond-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      column: activeTable.columns[0].name,
      operator: "=",
      value: "",
    };
    setConditions((prev) => [...prev, newCond]);
  };

  const handleUpdateCondition = (id: string, updates: Partial<WhereCondition>) => {
    setConditions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const handleDeleteCondition = (id: string) => {
    setConditions((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAddSortOption = () => {
    if (!activeTable || activeTable.columns.length === 0) return;
    const newSort: SortOption = {
      column: activeTable.columns[0].name,
      direction: "ASC",
    };
    setSortOptions((prev) => [...prev, newSort]);
  };

  const handleDeleteSortOption = (index: number) => {
    setSortOptions((prev) => prev.filter((_, i) => i !== index));
  };

  // Generate SQL query string based on configuration
  const generatedQuery = useMemo(() => {
    if (!activeTable) {
      return "-- Please add at least one table to the schema to generate queries.";
    }

    const tableName = activeTable.name;

    const joinClauses = joins
      .map((j) => {
        const targetTable = tables[j.targetTableId];
        if (!targetTable) return "";
        return `${j.joinType} ${targetTable.name} ON ${tableName}.${j.sourceColumn} = ${targetTable.name}.${j.targetColumn}`;
      })
      .filter(Boolean)
      .join("\n");

    const whereClause =
      conditions.length > 0
        ? "WHERE " +
          conditions
            .map((c) => {
              if (c.operator === "IS NULL") return `${c.column} IS NULL`;
              if (c.operator === "IS NOT NULL") return `${c.column} IS NOT NULL`;
              const formattedVal = isNaN(Number(c.value)) ? `'${c.value}'` : c.value;
              return `${c.column} ${c.operator} ${formattedVal || "''"}`;
            })
            .join(" AND ")
        : "";

    const groupByClause =
      groupByColumns.length > 0 ? "GROUP BY " + groupByColumns.join(", ") : "";

    const orderByClause =
      sortOptions.length > 0
        ? "ORDER BY " + sortOptions.map((s) => `${s.column} ${s.direction}`).join(", ")
        : "";

    const limitClause = limit && !isNaN(Number(limit)) && Number(limit) > 0 ? `LIMIT ${limit}` : "";
    const offsetClause =
      offset && !isNaN(Number(offset)) && Number(offset) > 0 ? `OFFSET ${offset}` : "";

    let rawQuery = "";

    if (queryType === "SELECT") {
      const cols = selectedColumns.length > 0 ? selectedColumns.join(", ") : "*";
      const parts = [`SELECT ${cols}`, `FROM ${tableName}`];
      if (joinClauses) parts.push(joinClauses);
      if (whereClause) parts.push(whereClause);
      if (groupByClause) parts.push(groupByClause);
      if (orderByClause) parts.push(orderByClause);
      if (limitClause) parts.push(limitClause);
      if (offsetClause) parts.push(offsetClause);
      rawQuery = parts.join("\n") + ";";
    } else if (queryType === "INSERT") {
      const colList = activeTable.columns.map((c) => c.name).join(", ");
      const valList = activeTable.columns
        .map((c) => (c.constraints.isAutoIncrement ? "NULL" : `:${c.name}`))
        .join(", ");
      rawQuery = `INSERT INTO ${tableName} (${colList})\nVALUES (${valList});`;
    } else if (queryType === "UPDATE") {
      const setClause =
        activeTable.columns
          .filter((c) => !c.constraints.isPrimaryKey)
          .map((c) => `  ${c.name} = :${c.name}`)
          .join(",\n") || "  column_name = :value";
      const parts = [`UPDATE ${tableName}`, `SET\n${setClause}`];
      if (whereClause) parts.push(whereClause);
      rawQuery = parts.join("\n") + ";";
    } else if (queryType === "DELETE") {
      const parts = [`DELETE FROM ${tableName}`];
      if (whereClause) parts.push(whereClause);
      rawQuery = parts.join("\n") + ";";
    }

    try {
      return format(rawQuery, {
        language: dialect === "postgres" ? "postgresql" : dialect === "mysql" ? "mysql" : "sqlite",
        keywordCase: "upper",
      });
    } catch {
      return rawQuery;
    }
  }, [activeTable, queryType, selectedColumns, joins, conditions, sortOptions, groupByColumns, limit, offset, dialect, tables]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedQuery);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto pr-1">
      {/* Query Configuration Options */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Terminal className="size-3" />
            Query Builder ({dialect.toUpperCase()})
          </span>
          <Badge variant="outline" className="text-[9px] uppercase font-mono">
            {queryType}
          </Badge>
        </div>

        {/* Target Table & Query Type Pickers */}
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Target Table</Label>
            <Select value={activeTableId} onValueChange={(val) => { if (val) setActiveTableId(val); }}>
              <SelectTrigger className="h-8 text-xs w-full">
                <SelectValue placeholder="Select table">
                  {activeTable?.name || "Select table"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-60 z-50">
                {tableList.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <Label className="text-xs">Query Type</Label>
            <Select value={queryType} onValueChange={(val: any) => { if (val) setQueryType(val); }}>
              <SelectTrigger className="h-8 text-xs w-full">
                <SelectValue placeholder="Select type">
                  {queryType}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="SELECT">SELECT</SelectItem>
                <SelectItem value="INSERT">INSERT</SelectItem>
                <SelectItem value="UPDATE">UPDATE</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>


        {/* SELECT Columns Selector */}
        {queryType === "SELECT" && activeTable && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Select Columns ({selectedColumns.length})</Label>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSelectedColumns(activeTable.columns.map((c) => c.name))}
                  className="text-[10px] text-primary hover:underline cursor-pointer"
                >
                  All
                </button>
                <span className="text-[10px] text-muted-foreground">•</span>
                <button
                  onClick={() => setSelectedColumns([])}
                  className="text-[10px] text-muted-foreground hover:underline cursor-pointer"
                >
                  None
                </button>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {activeTable.columns.map((c) => {
                const isSelected = selectedColumns.includes(c.name);
                return (
                  <Badge
                    key={c.id}
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => handleToggleColumn(c.name)}
                    className="cursor-pointer text-[10px] px-2 py-0.5 select-none transition-colors"
                  >
                    {c.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Table JOINs */}
        {queryType === "SELECT" && tableList.length > 1 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs flex items-center gap-1">
                <Layers className="size-3 text-muted-foreground" />
                Table JOINs ({joins.length})
              </Label>
              <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1 cursor-pointer" onClick={handleAddJoin}>
                <Plus className="size-3" />
                Add JOIN
              </Button>
            </div>

            {joins.map((j) => {
              const targetTable = tables[j.targetTableId];
              return (
                <div key={j.id} className="flex flex-col gap-1.5 p-2 rounded-md border border-border bg-muted/20 text-xs">
                  <div className="flex items-center justify-between gap-1">
                    <Select value={j.joinType} onValueChange={(val: any) => { if (val) handleUpdateJoin(j.id, { joinType: val }); }}>
                      <SelectTrigger className="h-7 text-[11px] w-28">
                        <SelectValue>{j.joinType}</SelectValue>
                      </SelectTrigger>
                      <SelectContent className="z-50">
                        <SelectItem value="INNER JOIN">INNER JOIN</SelectItem>
                        <SelectItem value="LEFT JOIN">LEFT JOIN</SelectItem>
                        <SelectItem value="RIGHT JOIN">RIGHT JOIN</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={j.targetTableId} onValueChange={(val) => { if (val) handleUpdateJoin(j.id, { targetTableId: val }); }}>
                      <SelectTrigger className="h-7 text-[11px] flex-1">
                        <SelectValue>{targetTable?.name || "Target Table"}</SelectValue>
                      </SelectTrigger>
                      <SelectContent className="z-50">
                        {tableList.filter((t) => t.id !== activeTableId).map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <button
                      onClick={() => handleDeleteJoin(j.id)}
                      className="size-5 flex items-center justify-center text-muted-foreground hover:text-destructive cursor-pointer shrink-0"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>

                  {targetTable && activeTable && (
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <span>ON</span>
                      <Select value={j.sourceColumn} onValueChange={(val) => { if (val) handleUpdateJoin(j.id, { sourceColumn: val }); }}>
                        <SelectTrigger className="h-6 text-[10px] flex-1">
                          <SelectValue>{j.sourceColumn}</SelectValue>
                        </SelectTrigger>
                        <SelectContent className="z-50">
                          {activeTable.columns.map((col) => (
                            <SelectItem key={col.id} value={col.name}>
                              {col.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span>=</span>
                      <Select value={j.targetColumn} onValueChange={(val) => { if (val) handleUpdateJoin(j.id, { targetColumn: val }); }}>
                        <SelectTrigger className="h-6 text-[10px] flex-1">
                          <SelectValue>{j.targetColumn}</SelectValue>
                        </SelectTrigger>
                        <SelectContent className="z-50">
                          {targetTable.columns.map((col) => (
                            <SelectItem key={col.id} value={col.name}>
                              {col.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* WHERE Conditions */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs flex items-center gap-1">
              <Filter className="size-3 text-muted-foreground" />
              WHERE Filters ({conditions.length})
            </Label>
            <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1 cursor-pointer" onClick={handleAddCondition}>
              <Plus className="size-3" />
              Add Filter
            </Button>
          </div>

          {conditions.map((cond) => (
            <div key={cond.id} className="flex items-center gap-1.5 p-1.5 rounded-md border border-border bg-muted/30">
              <Select value={cond.column} onValueChange={(val) => { if (val) handleUpdateCondition(cond.id, { column: val }); }}>
                <SelectTrigger className="h-7 text-[11px] w-28">
                  <SelectValue>{cond.column}</SelectValue>
                </SelectTrigger>
                <SelectContent className="z-50">
                  {activeTable?.columns.map((col) => (
                    <SelectItem key={col.id} value={col.name}>
                      {col.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={cond.operator} onValueChange={(val: any) => { if (val) handleUpdateCondition(cond.id, { operator: val }); }}>
                <SelectTrigger className="h-7 text-[11px] w-24">
                  <SelectValue>{cond.operator}</SelectValue>
                </SelectTrigger>
                <SelectContent className="z-50">
                  <SelectItem value="=">=</SelectItem>
                  <SelectItem value="!=">!=</SelectItem>
                  <SelectItem value=">">&gt;</SelectItem>
                  <SelectItem value="<">&lt;</SelectItem>
                  <SelectItem value=">=">&gt;=</SelectItem>
                  <SelectItem value="<=">&lt;=</SelectItem>
                  <SelectItem value="LIKE">LIKE</SelectItem>
                  <SelectItem value="ILIKE">ILIKE</SelectItem>
                  <SelectItem value="IN">IN</SelectItem>
                  <SelectItem value="NOT IN">NOT IN</SelectItem>
                  <SelectItem value="IS NULL">IS NULL</SelectItem>
                  <SelectItem value="IS NOT NULL">IS NOT NULL</SelectItem>
                </SelectContent>
              </Select>

              {cond.operator !== "IS NULL" && cond.operator !== "IS NOT NULL" && (
                <Input
                  value={cond.value}
                  onChange={(e) => handleUpdateCondition(cond.id, { value: e.target.value })}
                  placeholder="value"
                  className="h-7 text-[11px] flex-1 font-mono"
                />
              )}

              <button
                onClick={() => handleDeleteCondition(cond.id)}
                className="size-5 flex items-center justify-center text-muted-foreground hover:text-destructive cursor-pointer shrink-0"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          ))}
        </div>

        {/* ORDER BY Sort Options */}
        {queryType === "SELECT" && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs flex items-center gap-1">
                <ArrowUpDown className="size-3 text-muted-foreground" />
                ORDER BY Sorting ({sortOptions.length})
              </Label>
              <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1 cursor-pointer" onClick={handleAddSortOption}>
                <Plus className="size-3" />
                Add Sort
              </Button>
            </div>

            {sortOptions.map((sort, idx) => (
              <div key={idx} className="flex items-center gap-1.5 p-1.5 rounded-md border border-border bg-muted/30">
                <Select value={sort.column} onValueChange={(val) => { if (val) setSortOptions((prev) => prev.map((s, i) => (i === idx ? { ...s, column: val } : s))); }}>
                  <SelectTrigger className="h-7 text-[11px] flex-1">
                    <SelectValue>{sort.column}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {activeTable?.columns.map((col) => (
                      <SelectItem key={col.id} value={col.name}>
                        {col.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sort.direction} onValueChange={(val: any) => { if (val) setSortOptions((prev) => prev.map((s, i) => (i === idx ? { ...s, direction: val } : s))); }}>
                  <SelectTrigger className="h-7 text-[11px] w-20">
                    <SelectValue>{sort.direction}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    <SelectItem value="ASC">ASC</SelectItem>
                    <SelectItem value="DESC">DESC</SelectItem>
                  </SelectContent>
                </Select>


                <button
                  onClick={() => handleDeleteSortOption(idx)}
                  className="size-5 flex items-center justify-center text-muted-foreground hover:text-destructive cursor-pointer shrink-0"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* GROUP BY Columns */}
        {queryType === "SELECT" && activeTable && (
          <div className="flex flex-col gap-2">
            <Label className="text-xs">GROUP BY Columns</Label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {activeTable.columns.map((c) => {
                const isGrouped = groupByColumns.includes(c.name);
                return (
                  <Badge
                    key={c.id}
                    variant={isGrouped ? "default" : "secondary"}
                    onClick={() => handleToggleGroupBy(c.name)}
                    className="cursor-pointer text-[10px] px-2 py-0.5 select-none transition-colors"
                  >
                    {c.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* LIMIT & OFFSET */}
        {queryType === "SELECT" && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="flex flex-col gap-1">
              <Label className="text-xs">LIMIT</Label>
              <Input value={limit} onChange={(e) => setLimit(e.target.value)} className="h-7 text-xs font-mono" placeholder="50" />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs">OFFSET</Label>
              <Input value={offset} onChange={(e) => setOffset(e.target.value)} className="h-7 text-xs font-mono" placeholder="0" />
            </div>
          </div>
        )}
      </div>

      {/* Generated SQL Code Preview with Monaco Editor */}
      <div className="flex flex-col gap-2 pt-2 border-t">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold">Generated SQL Query</Label>
          <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1 cursor-pointer" onClick={handleCopy}>
            {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <div className="min-h-[160px] h-44 border rounded-md overflow-hidden bg-background">
          <Editor
            height="100%"
            language="sql"
            theme={theme === "dark" ? "vs-dark" : "light"}
            value={generatedQuery}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 12,
              fontFamily: "var(--font-mono)",
              scrollBeyondLastLine: false,
              wordWrap: "on",
              lineNumbers: "on",
              folding: false,
              renderLineHighlight: "all",
            }}
          />
        </div>
      </div>
    </div>
  );
}
