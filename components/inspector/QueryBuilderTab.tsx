"use client";

import React, { useState, useMemo, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Copy, Check, Terminal, Plus, Trash2, Layers, Filter, ArrowUpDown } from "lucide-react";
import { useStore } from "@/lib/store";
import { useTheme } from "@/providers/ThemeProvider";
import { Table } from "@/packages/schema-core";
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

/**
 * Filter condition item interface for query builder.
 */
export interface WhereCondition {
    id: string;
    column: string;
    operator: "=" | "!=" | ">" | "<" | ">=" | "<=" | "LIKE" | "ILIKE" | "IN" | "NOT IN" | "IS NULL" | "IS NOT NULL";
    value: string;
}

/**
 * Sorting specification interface for query builder.
 */
export interface SortOption {
    column: string;
    direction: "ASC" | "DESC";
}

/**
 * Table join specification interface for query builder.
 */
export interface JoinOption {
    id: string;
    joinType: "INNER JOIN" | "LEFT JOIN" | "RIGHT JOIN";
    targetTableId: string;
    sourceColumn: string;
    targetColumn: string;
}

/**
 * Advanced, dialect-aware SQL query generator with JOINs, filters, sorting, aggregation, and live Monaco code editor.
 */
export const QueryBuilderTab: React.FC = (): React.ReactElement => {
    const { theme } = useTheme();
    const tables = useStore(state => state.tables);
    const relations = useStore(state => state.relations);
    const dialect = useStore(state => state.dialect);
    const selectedTableId = useStore(state => state.selectedTableId);

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

    useEffect(() => {
        if (selectedTableId && tables[selectedTableId]) {
            setActiveTableId(selectedTableId);
        }
    }, [selectedTableId, tables]);

    useEffect(() => {
        if (activeTable) {
            setSelectedColumns(activeTable.columns.map(c => c.name));
            setJoins([]);
            setConditions([]);
            setSortOptions([]);
            setGroupByColumns([]);
        }
    }, [activeTableId]);

    const availableRelations = useMemo(() => {
        if (!activeTable) {
            return [];
        }
        return Object.values(relations).filter(rel => rel.sourceTableId === activeTable.id || rel.targetTableId === activeTable.id);
    }, [relations, activeTable]);

    const quoteIdentifier = (name: string): string => {
        if (dialect === "postgres") {
            return `"${name}"`;
        }
        if (dialect === "mysql") {
            return `\`${name}\``;
        }
        return `"${name}"`;
    };

    const handleToggleColumn = (colName: string): void => {
        setSelectedColumns(prev =>
            prev.includes(colName) ? prev.filter(c => c !== colName) : [...prev, colName]
        );
    };

    const handleSelectAllColumns = (): void => {
        if (!activeTable) {
            return;
        }
        if (selectedColumns.length === activeTable.columns.length) {
            setSelectedColumns([]);
        }
        else {
            setSelectedColumns(activeTable.columns.map(c => c.name));
        }
    };

    const handleAddJoin = (): void => {
        if (!activeTable) {
            return;
        }

        const rel = availableRelations.find(r => !joins.some(j => j.id === r.id));
        if (rel) {
            const isSource = rel.sourceTableId === activeTable.id;
            const targetTableId = isSource ? rel.targetTableId : rel.sourceTableId;
            const sourceCol = isSource ? rel.sourceColumnId : rel.targetColumnId;
            const targetCol = isSource ? rel.targetColumnId : rel.sourceColumnId;

            const sourceColName = activeTable.columns.find(c => c.id === sourceCol)?.name || "";
            const targetTable = tables[targetTableId];
            const targetColName = targetTable?.columns.find(c => c.id === targetCol)?.name || "";

            setJoins(prev => [
                ...prev,
                {
                    id: rel.id,
                    joinType: "LEFT JOIN",
                    targetTableId,
                    sourceColumn: sourceColName,
                    targetColumn: targetColName,
                },
            ]);
        }
    };

    const handleRemoveJoin = (id: string): void => {
        setJoins(prev => prev.filter(j => j.id !== id));
    };

    const handleAddCondition = (): void => {
        if (!activeTable || activeTable.columns.length === 0) {
            return;
        }
        const firstCol = activeTable.columns[0].name;
        setConditions(prev => [
            ...prev,
            {
                id: `cond_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                column: firstCol,
                operator: "=",
                value: "",
            },
        ]);
    };

    const handleRemoveCondition = (id: string): void => {
        setConditions(prev => prev.filter(c => c.id !== id));
    };

    const handleUpdateCondition = (id: string, updates: Partial<WhereCondition>): void => {
        setConditions(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
    };

    const handleAddSort = (): void => {
        if (!activeTable || activeTable.columns.length === 0) {
            return;
        }
        const availableCols = activeTable.columns.filter(c => !sortOptions.some(s => s.column === c.name));
        if (availableCols.length > 0) {
            setSortOptions(prev => [...prev, { column: availableCols[0].name, direction: "ASC" }]);
        }
    };

    const handleRemoveSort = (colName: string): void => {
        setSortOptions(prev => prev.filter(s => s.column !== colName));
    };

    const handleToggleSortDirection = (colName: string): void => {
        setSortOptions(prev =>
            prev.map(s => (s.column === colName ? { ...s, direction: s.direction === "ASC" ? "DESC" : "ASC" } : s))
        );
    };

    const handleToggleGroupBy = (colName: string): void => {
        setGroupByColumns(prev =>
            prev.includes(colName) ? prev.filter(c => c !== colName) : [...prev, colName]
        );
    };

    const generatedQuery = useMemo(() => {
        if (!activeTable) {
            return "-- No active table selected";
        }

        const tableName = quoteIdentifier(activeTable.name);

        try {
            if (queryType === "SELECT") {
                const cols = selectedColumns.length > 0
                    ? selectedColumns.map(c => `${tableName}.${quoteIdentifier(c)}`).join(", ")
                    : "*";

                let sql = `SELECT ${cols} FROM ${tableName}`;

                joins.forEach(join => {
                    const targetTable = tables[join.targetTableId];
                    if (targetTable) {
                        const targetName = quoteIdentifier(targetTable.name);
                        const srcCol = quoteIdentifier(join.sourceColumn);
                        const tgtCol = quoteIdentifier(join.targetColumn);
                        sql += `\n${join.joinType} ${targetName} ON ${tableName}.${srcCol} = ${targetName}.${tgtCol}`;
                    }
                });

                if (conditions.length > 0) {
                    const condStrings = conditions
                        .filter(c => c.column)
                        .map(c => {
                            const col = `${tableName}.${quoteIdentifier(c.column)}`;
                            if (c.operator === "IS NULL" || c.operator === "IS NOT NULL") {
                                return `${col} ${c.operator}`;
                            }
                            const val = isNaN(Number(c.value)) ? `'${c.value}'` : c.value;
                            return `${col} ${c.operator} ${val || "''"}`;
                        });

                    if (condStrings.length > 0) {
                        sql += `\nWHERE ${condStrings.join(" AND ")}`;
                    }
                }

                if (groupByColumns.length > 0) {
                    const groupCols = groupByColumns.map(c => `${tableName}.${quoteIdentifier(c)}`).join(", ");
                    sql += `\nGROUP BY ${groupCols}`;
                }

                if (sortOptions.length > 0) {
                    const sortStrings = sortOptions.map(s => `${tableName}.${quoteIdentifier(s.column)} ${s.direction}`);
                    sql += `\nORDER BY ${sortStrings.join(", ")}`;
                }

                if (limit && !isNaN(Number(limit))) {
                    sql += `\nLIMIT ${limit}`;
                }
                if (offset && !isNaN(Number(offset)) && Number(offset) > 0) {
                    sql += ` OFFSET ${offset}`;
                }

                sql += ";";

                return format(sql, {
                    language: dialect === "postgres" ? "postgresql" : dialect === "mysql" ? "mysql" : "sqlite",
                    keywordCase: "upper",
                });
            }

            if (queryType === "INSERT") {
                const cols = activeTable.columns.map(c => quoteIdentifier(c.name)).join(", ");
                const valPlaceholders = activeTable.columns.map(c => {
                    if (c.constraints.isAutoIncrement) {
                        return "DEFAULT";
                    }
                    if (c.constraints.defaultValue) {
                        return c.constraints.defaultValue;
                    }
                    return `'sample_${c.name}'`;
                }).join(", ");

                const sql = `INSERT INTO ${tableName} (${cols})\nVALUES (${valPlaceholders});`;
                return format(sql, {
                    language: dialect === "postgres" ? "postgresql" : dialect === "mysql" ? "mysql" : "sqlite",
                    keywordCase: "upper",
                });
            }

            if (queryType === "UPDATE") {
                const setLines = activeTable.columns
                    .filter(c => !c.constraints.isPrimaryKey)
                    .map(c => `${quoteIdentifier(c.name)} = 'new_value'`)
                    .join(", ");

                const pkCol = activeTable.columns.find(c => c.constraints.isPrimaryKey);
                const whereClause = pkCol ? `\nWHERE ${quoteIdentifier(pkCol.name)} = 1` : "";

                const sql = `UPDATE ${tableName}\nSET ${setLines}${whereClause};`;
                return format(sql, {
                    language: dialect === "postgres" ? "postgresql" : dialect === "mysql" ? "mysql" : "sqlite",
                    keywordCase: "upper",
                });
            }

            if (queryType === "DELETE") {
                const pkCol = activeTable.columns.find(c => c.constraints.isPrimaryKey);
                const whereClause = pkCol ? `\nWHERE ${quoteIdentifier(pkCol.name)} = 1` : "";

                const sql = `DELETE FROM ${tableName}${whereClause};`;
                return format(sql, {
                    language: dialect === "postgres" ? "postgresql" : dialect === "mysql" ? "mysql" : "sqlite",
                    keywordCase: "upper",
                });
            }

            return "";
        }
        catch (err: unknown) {
            return `-- Query Generation Error: ${err instanceof Error ? err.message : String(err)}`;
        }
    }, [activeTable, queryType, selectedColumns, joins, conditions, sortOptions, groupByColumns, limit, offset, dialect]);

    const handleCopy = (): void => {
        navigator.clipboard.writeText(generatedQuery);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!activeTable) {
        return (
            <div className="flex flex-col items-center justify-center h-48 text-center p-4 text-muted-foreground">
                <Terminal className="size-8 mb-2 opacity-50" />
                <span className="text-xs font-semibold">No Tables Available</span>
                <p className="text-[11px]">Create at least one table in the workspace to start building SQL queries.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">
                    <Terminal className="size-3.5 text-primary" />
                    Visual Query Builder
                </div>

                <Badge variant="outline" className="text-[10px] uppercase font-mono bg-muted/30">
                    {dialect}
                </Badge>
            </div>

            <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                        <Label className="text-xs">Target Table</Label>
                        <Select value={activeTableId} onValueChange={val => {
                            if (val) {
                                setActiveTableId(val);
                            }
                        }}>
                            <SelectTrigger className="h-8 text-xs font-semibold">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="z-50">
                                {tableList.map(t => (
                                    <SelectItem key={t.id} value={t.id} className="text-xs cursor-pointer font-mono">
                                        {t.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label className="text-xs">Query Type</Label>
                        <Select value={queryType} onValueChange={val => {
                            if (val) {
                                setQueryType(val as typeof queryType);
                            }
                        }}>
                            <SelectTrigger className="h-8 text-xs font-bold font-mono">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="z-50">
                                <SelectItem value="SELECT" className="text-xs font-mono font-bold text-blue-500">SELECT</SelectItem>
                                <SelectItem value="INSERT" className="text-xs font-mono font-bold text-emerald-500">INSERT</SelectItem>
                                <SelectItem value="UPDATE" className="text-xs font-mono font-bold text-amber-500">UPDATE</SelectItem>
                                <SelectItem value="DELETE" className="text-xs font-mono font-bold text-destructive">DELETE</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {queryType === "SELECT" && (
                    <div className="flex flex-col gap-1.5 border rounded-md p-2.5 bg-muted/10">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold flex items-center gap-1">
                                <Layers className="size-3 text-muted-foreground" />
                                Select Columns
                            </span>
                            <Button size="sm" variant="ghost" className="h-5 text-[10px] px-1.5 cursor-pointer" onClick={handleSelectAllColumns}>
                                {selectedColumns.length === activeTable.columns.length ? "Deselect All" : "Select All"}
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {activeTable.columns.map(c => {
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

                {queryType === "SELECT" && availableRelations.length > 0 && (
                    <div className="flex flex-col gap-2 border rounded-md p-2.5 bg-muted/10">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold">Table Joins</span>
                            <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1 cursor-pointer" onClick={handleAddJoin}>
                                <Plus className="size-3" />
                                Add Join
                            </Button>
                        </div>

                        {joins.length === 0 ? (
                            <span className="text-[11px] text-muted-foreground italic">No joins added.</span>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {joins.map(join => {
                                    const targetTable = tables[join.targetTableId];
                                    return (
                                        <div key={join.id} className="flex items-center gap-1.5 bg-background p-1.5 rounded border">
                                            <Select value={join.joinType} onValueChange={val => {
                                                if (val) {
                                                    setJoins(prev => prev.map(j => (j.id === join.id ? { ...j, joinType: val as JoinOption["joinType"] } : j)));
                                                }
                                            }}>
                                                <SelectTrigger className="h-6 text-[10px] font-mono w-24">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="z-50">
                                                    <SelectItem value="INNER JOIN" className="text-xs">INNER JOIN</SelectItem>
                                                    <SelectItem value="LEFT JOIN" className="text-xs">LEFT JOIN</SelectItem>
                                                    <SelectItem value="RIGHT JOIN" className="text-xs">RIGHT JOIN</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <span className="font-mono text-[11px] font-semibold">{targetTable?.name}</span>
                                            <Button size="icon" variant="ghost" className="h-5 w-5 text-destructive ml-auto" onClick={() => handleRemoveJoin(join.id)}>
                                                <Trash2 className="size-3" />
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {queryType === "SELECT" && (
                    <div className="flex flex-col gap-2 border rounded-md p-2.5 bg-muted/10">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold flex items-center gap-1">
                                <Filter className="size-3 text-muted-foreground" />
                                WHERE Filters
                            </span>
                            <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1 cursor-pointer" onClick={handleAddCondition}>
                                <Plus className="size-3" />
                                Add Filter
                            </Button>
                        </div>

                        {conditions.length === 0 ? (
                            <span className="text-[11px] text-muted-foreground italic">No filter conditions added.</span>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {conditions.map(cond => (
                                    <div key={cond.id} className="grid grid-cols-12 gap-1 items-center bg-background p-1.5 rounded border">
                                        <div className="col-span-4">
                                            <Select value={cond.column} onValueChange={val => {
                                                if (val) {
                                                    handleUpdateCondition(cond.id, { column: val });
                                                }
                                            }}>
                                                <SelectTrigger className="h-6 text-[10px] font-mono">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="z-50">
                                                    {activeTable.columns.map(c => (
                                                        <SelectItem key={c.id} value={c.name} className="text-xs font-mono">{c.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="col-span-3">
                                            <Select value={cond.operator} onValueChange={val => {
                                                if (val) {
                                                    handleUpdateCondition(cond.id, { operator: val as WhereCondition["operator"] });
                                                }
                                            }}>
                                                <SelectTrigger className="h-6 text-[10px] font-mono">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="z-50">
                                                    <SelectItem value="=" className="text-xs">=</SelectItem>
                                                    <SelectItem value="!=" className="text-xs">!=</SelectItem>
                                                    <SelectItem value=">" className="text-xs">&gt;</SelectItem>
                                                    <SelectItem value="<" className="text-xs">&lt;</SelectItem>
                                                    <SelectItem value=">=" className="text-xs">&gt;=</SelectItem>
                                                    <SelectItem value="<=" className="text-xs">&lt;=</SelectItem>
                                                    <SelectItem value="LIKE" className="text-xs">LIKE</SelectItem>
                                                    <SelectItem value="IS NULL" className="text-xs">IS NULL</SelectItem>
                                                    <SelectItem value="IS NOT NULL" className="text-xs">NOT NULL</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="col-span-4">
                                            <Input
                                                value={cond.value}
                                                onChange={e => handleUpdateCondition(cond.id, { value: e.target.value })}
                                                disabled={cond.operator === "IS NULL" || cond.operator === "IS NOT NULL"}
                                                placeholder="value..."
                                                className="h-6 text-[10px] font-mono"
                                            />
                                        </div>

                                        <div className="col-span-1 flex justify-end">
                                            <Button size="icon" variant="ghost" className="h-5 w-5 text-destructive" onClick={() => handleRemoveCondition(cond.id)}>
                                                <Trash2 className="size-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {queryType === "SELECT" && (
                    <div className="flex flex-col gap-2 border rounded-md p-2.5 bg-muted/10">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold flex items-center gap-1">
                                <ArrowUpDown className="size-3 text-muted-foreground" />
                                ORDER BY Sorting
                            </span>
                            <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1 cursor-pointer" onClick={handleAddSort}>
                                <Plus className="size-3" />
                                Add Sort
                            </Button>
                        </div>

                        {sortOptions.length === 0 ? (
                            <span className="text-[11px] text-muted-foreground italic">No sorting applied.</span>
                        ) : (
                            <div className="flex flex-wrap gap-1">
                                {sortOptions.map(sort => (
                                    <div key={sort.column} className="flex items-center gap-1 bg-background border px-2 py-1 rounded">
                                        <span className="font-mono text-[10px] font-semibold">{sort.column}</span>
                                        <Badge
                                            variant="secondary"
                                            onClick={() => handleToggleSortDirection(sort.column)}
                                            className="cursor-pointer text-[9px] px-1 py-0 font-mono"
                                        >
                                            {sort.direction}
                                        </Badge>
                                        <Button size="icon" variant="ghost" className="h-4 w-4 text-destructive ml-1" onClick={() => handleRemoveSort(sort.column)}>
                                            <Trash2 className="size-2.5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {queryType === "SELECT" && (
                    <div className="flex flex-col gap-1.5 border rounded-md p-2.5 bg-muted/10">
                        <span className="text-[11px] font-semibold">GROUP BY Aggregation</span>
                        <div className="flex flex-wrap gap-1">
                            {activeTable.columns.map(c => {
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

                {queryType === "SELECT" && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="flex flex-col gap-1">
                            <Label className="text-xs">LIMIT</Label>
                            <Input value={limit} onChange={e => setLimit(e.target.value)} className="h-7 text-xs font-mono" placeholder="50" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <Label className="text-xs">OFFSET</Label>
                            <Input value={offset} onChange={e => setOffset(e.target.value)} className="h-7 text-xs font-mono" placeholder="0" />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">Generated SQL Query</Label>
                    <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1 cursor-pointer" onClick={handleCopy}>
                        {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                        {copied ? "Copied" : "Copy"}
                    </Button>
                </div>
                <div className="min-h-40 h-44 border rounded-md overflow-hidden bg-background">
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
};
