"use client";

import React, { useState, useMemo } from "react";
import { Copy, Check, Terminal, Plus, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { DatabaseDialect, Table } from "@/packages/schema-core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface WhereCondition {
  id: string;
  column: string;
  operator: "=" | "!=" | ">" | "<" | ">=" | "<=" | "LIKE" | "IN" | "IS NULL";
  value: string;
}

export interface SortOption {
  column: string;
  direction: "ASC" | "DESC";
}

/**
 * QueryBuilderTab Component: Interactive query builder allowing users to generate custom SELECT, INSERT, UPDATE, and DELETE SQL queries with filters, sorting, and limits.
 */
export function QueryBuilderTab() {
  const tables = useStore((state) => state.tables);
  const dialect = useStore((state) => state.dialect);
  const selectedTableId = useStore((state) => state.selectedTableId);

  const tableList = useMemo(() => Object.values(tables), [tables]);
  const defaultTableId = selectedTableId && tables[selectedTableId] ? selectedTableId : tableList[0]?.id || "";

  const [activeTableId, setActiveTableId] = useState<string>(defaultTableId);
  const [queryType, setQueryType] = useState<"SELECT" | "INSERT" | "UPDATE" | "DELETE">("SELECT");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [conditions, setConditions] = useState<WhereCondition[]>([]);
  const [sortOptions, setSortOptions] = useState<SortOption[]>([]);
  const [limit, setLimit] = useState<string>("50");
  const [offset, setOffset] = useState<string>("0");
  const [copied, setCopied] = useState(false);

  const activeTable: Table | undefined = tables[activeTableId] || tableList[0];

  // Auto-select all columns when table changes if selectedColumns is empty
  React.useEffect(() => {
    if (activeTable) {
      setSelectedColumns(activeTable.columns.map((c) => c.name));
    }
  }, [activeTableId]);

  const handleToggleColumn = (colName: string) => {
    setSelectedColumns((prev) =>
      prev.includes(colName) ? prev.filter((c) => c !== colName) : [...prev, colName]
    );
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
    const whereClause =
      conditions.length > 0
        ? "WHERE " +
          conditions
            .map((c) => {
              if (c.operator === "IS NULL") return `${c.column} IS NULL`;
              const formattedVal = isNaN(Number(c.value)) ? `'${c.value}'` : c.value;
              return `${c.column} ${c.operator} ${formattedVal || "''"}`;
            })
            .join(" AND ")
        : "";

    const orderByClause =
      sortOptions.length > 0
        ? "ORDER BY " + sortOptions.map((s) => `${s.column} ${s.direction}`).join(", ")
        : "";

    const limitClause = limit && !isNaN(Number(limit)) && Number(limit) > 0 ? `LIMIT ${limit}` : "";
    const offsetClause =
      offset && !isNaN(Number(offset)) && Number(offset) > 0 ? `OFFSET ${offset}` : "";

    if (queryType === "SELECT") {
      const cols = selectedColumns.length > 0 ? selectedColumns.join(", ") : "*";
      const parts = [`SELECT ${cols}`, `FROM ${tableName}`];
      if (whereClause) parts.push(whereClause);
      if (orderByClause) parts.push(orderByClause);
      if (limitClause) parts.push(limitClause);
      if (offsetClause) parts.push(offsetClause);
      return parts.join("\n") + ";";
    }

    if (queryType === "INSERT") {
      const colList = activeTable.columns.map((c) => c.name).join(", ");
      const valList = activeTable.columns
        .map((c) => (c.constraints.isAutoIncrement ? "NULL" : `:${c.name}`))
        .join(", ");
      return `INSERT INTO ${tableName} (${colList})\nVALUES (${valList});`;
    }

    if (queryType === "UPDATE") {
      const setClause =
        activeTable.columns
          .filter((c) => !c.constraints.isPrimaryKey)
          .map((c) => `  ${c.name} = :${c.name}`)
          .join(",\n") || "  column_name = :value";
      const parts = [`UPDATE ${tableName}`, `SET\n${setClause}`];
      if (whereClause) parts.push(whereClause);
      return parts.join("\n") + ";";
    }

    if (queryType === "DELETE") {
      const parts = [`DELETE FROM ${tableName}`];
      if (whereClause) parts.push(whereClause);
      return parts.join("\n") + ";";
    }

    return "";
  }, [activeTable, queryType, selectedColumns, conditions, sortOptions, limit, offset]);

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

        {/* Table & Query Type Pickers */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Target Table</Label>
            <Select value={activeTableId} onValueChange={(val) => { if (val) setActiveTableId(val); }}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select table" />
              </SelectTrigger>
              <SelectContent>
                {tableList.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Query Type</Label>
            <Select value={queryType} onValueChange={(val: any) => { if (val) setQueryType(val); }}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
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
            <Label className="text-xs">Fields / Columns</Label>
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

        {/* WHERE Conditions */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">WHERE Filters ({conditions.length})</Label>
            <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1 cursor-pointer" onClick={handleAddCondition}>
              <Plus className="size-3" />
              Add Filter
            </Button>
          </div>

          {conditions.map((cond) => (
            <div key={cond.id} className="flex items-center gap-1.5 p-1.5 rounded-md border border-border bg-muted/30">
              <Select value={cond.column} onValueChange={(val) => { if (val) handleUpdateCondition(cond.id, { column: val }); }}>
                <SelectTrigger className="h-7 text-[11px] w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {activeTable?.columns.map((col) => (
                    <SelectItem key={col.id} value={col.name}>
                      {col.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={cond.operator} onValueChange={(val: any) => { if (val) handleUpdateCondition(cond.id, { operator: val }); }}>
                <SelectTrigger className="h-7 text-[11px] w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="=">=</SelectItem>
                  <SelectItem value="!=">!=</SelectItem>
                  <SelectItem value=">">&gt;</SelectItem>
                  <SelectItem value="<">&lt;</SelectItem>
                  <SelectItem value=">=">&gt;=</SelectItem>
                  <SelectItem value="<=">&lt;=</SelectItem>
                  <SelectItem value="LIKE">LIKE</SelectItem>
                  <SelectItem value="IS NULL">IS NULL</SelectItem>
                </SelectContent>
              </Select>

              {cond.operator !== "IS NULL" && (
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
              <Label className="text-xs">ORDER BY Sorting ({sortOptions.length})</Label>
              <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1 cursor-pointer" onClick={handleAddSortOption}>
                <Plus className="size-3" />
                Add Sort
              </Button>
            </div>

            {sortOptions.map((sort, idx) => (
              <div key={idx} className="flex items-center gap-1.5 p-1.5 rounded-md border border-border bg-muted/30">
                <Select value={sort.column} onValueChange={(val) => { if (val) setSortOptions((prev) => prev.map((s, i) => (i === idx ? { ...s, column: val } : s))); }}>
                  <SelectTrigger className="h-7 text-[11px] flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {activeTable?.columns.map((col) => (
                      <SelectItem key={col.id} value={col.name}>
                        {col.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sort.direction} onValueChange={(val: any) => { if (val) setSortOptions((prev) => prev.map((s, i) => (i === idx ? { ...s, direction: val } : s))); }}>
                  <SelectTrigger className="h-7 text-[11px] w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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

      {/* Generated SQL Code Preview */}
      <div className="flex flex-col gap-2 pt-2 border-t">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold">Generated SQL Query</Label>
          <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1 cursor-pointer" onClick={handleCopy}>
            {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <pre className="p-3 rounded-md bg-muted font-mono text-xs overflow-x-auto text-foreground whitespace-pre-wrap leading-relaxed border border-border">
          {generatedQuery}
        </pre>
      </div>
    </div>
  );
}
