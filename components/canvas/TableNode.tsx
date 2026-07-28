"use client";

import React from "react";
import { Handle, Position } from "@xyflow/react";
import { Key, Link as LinkIcon, Fingerprint, List, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Table } from "@/packages/schema-core";
import { resolveRelationFK } from "@/lib/react-flow-utils";

/**
 * Props interface for TableNode component.
 */
interface TableNodeProps {
    id: string;
    data: {
        table: Table;
    };
    selected?: boolean;
}

/**
 * React Flow node rendering database table schema card.
 */
export const TableNode: React.FC<TableNodeProps> = ({ id, data, selected }): React.ReactElement => {
    const table = data.table;
    const selectTable = useStore(state => state.selectTable);
    const deleteTable = useStore(state => state.deleteTable);
    const relations = useStore(state => state.relations);
    const tables = useStore(state => state.tables);
    const enums = useStore(state => state.enums);

    const isForeignKey = (colId: string): boolean => {
        return Object.values(relations).some(rel => {
            const resolved = resolveRelationFK(rel, tables);
            return resolved.fkTableId === id && resolved.fkColumnId === colId;
        });
    };

    const handleNodeClick = (event: React.MouseEvent): void => {
        event.stopPropagation();
        selectTable(id);
    };

    const headerColor = table.color || "#3b82f6";

    return (
        <div
            role="button"
            tabIndex={0}
            aria-label={`Table node ${table.name}`}
            onClick={handleNodeClick}
            onKeyDown={e => {
                if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    selectTable(id);
                }
            }}
            className={cn(
                "group/node min-w-64 rounded-xl border bg-card text-card-foreground shadow-lg transition-all duration-200 select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary",
                selected
                    ? "border-primary ring-2 ring-primary/20 scale-[1.01]"
                    : "border-border hover:border-muted-foreground/30"
            )}
        >
            <div
                className="h-2 rounded-t-xl"
                style={{ backgroundColor: headerColor }}
            />

            <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b bg-muted/20">
                <div className="flex flex-col gap-0.5 min-w-0 pr-1">
                    <span className="font-semibold text-sm tracking-tight truncate">{table.name}</span>
                    {table.description && (
                        <span className="text-[10px] text-muted-foreground line-clamp-1">
                            {table.description}
                        </span>
                    )}
                </div>

                <button
                    type="button"
                    aria-label={`Delete table ${table.name}`}
                    title="Delete selected table"
                    onClick={e => {
                        e.stopPropagation();
                        deleteTable(id);
                    }}
                    className={cn(
                        "p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/15 rounded transition-all shrink-0 focus-visible:ring-1 focus-visible:ring-destructive outline-none",
                        selected ? "opacity-100" : "opacity-0 group-hover/node:opacity-100 focus:opacity-100"
                    )}
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>

            <div className="flex flex-col py-1.5">
                {table.columns.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-muted-foreground text-center italic">
                        No columns defined
                    </div>
                ) : (
                    table.columns.map(column => {
                        const isPk = column.constraints.isPrimaryKey;
                        const isFk = isForeignKey(column.id);
                        const isUq = column.constraints.isUnique;

                        return (
                            <div
                                key={column.id}
                                className={cn(
                                    "relative flex items-center justify-between px-4 py-1.5 text-xs group",
                                    "hover:bg-muted/40 transition-colors"
                                )}
                            >
                                <Handle
                                    type="target"
                                    position={Position.Left}
                                    id={`col-left-${column.id}`}
                                    className="size-2! bg-muted-foreground/40! border-border! hover:bg-primary! transition-colors"
                                    style={{ left: "-4px" }}
                                />

                                <div className="flex items-center gap-2 pr-4 truncate">
                                    <div className="flex items-center gap-0.5 min-w-4 text-muted-foreground">
                                        {isPk && (
                                            <span title="Primary Key">
                                                <Key className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                            </span>
                                        )}
                                        {isFk && !isPk && (
                                            <span title="Foreign Key">
                                                <LinkIcon className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                            </span>
                                        )}
                                        {isUq && !isPk && (
                                            <span title="Unique Constraint">
                                                <Fingerprint className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                                            </span>
                                        )}
                                    </div>

                                    <span
                                        className={cn(
                                            "truncate font-mono text-[11px]",
                                            isPk && "font-semibold text-foreground",
                                            !isPk && "text-foreground/80"
                                        )}
                                    >
                                        {column.name}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground shrink-0 pl-2">
                                    {column.enumId && enums[column.enumId] ? (
                                        <span className="text-purple-400 font-semibold flex items-center gap-1">
                                            <List className="h-2.5 w-2.5" />
                                            {enums[column.enumId].name}
                                        </span>
                                    ) : (
                                        <span>{column.type.toLowerCase()}</span>
                                    )}

                                    <span className="text-[9px] opacity-70">
                                        {column.constraints.isNullable ? "NULL" : "NN"}
                                    </span>
                                </div>

                                <Handle
                                    type="source"
                                    position={Position.Right}
                                    id={`col-right-${column.id}`}
                                    className="size-2! bg-muted-foreground/40! border-border! hover:bg-primary! transition-colors"
                                    style={{ right: "-4px" }}
                                />
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
