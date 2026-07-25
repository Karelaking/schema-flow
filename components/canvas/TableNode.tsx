"use client";

import React from "react";
import { Handle, Position } from "@xyflow/react";
import { Key, Link as LinkIcon, Fingerprint, List } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Table } from "@/packages/schema-core";

import { resolveRelationFK } from "@/lib/react-flow-utils";

interface TableNodeProps {
  id: string;
  data: {
    table: Table;
  };
  selected?: boolean;
}

export function TableNode({ id, data, selected }: TableNodeProps) {
  const table = data.table;
  const selectTable = useStore(state => state.selectTable);
  const relations = useStore(state => state.relations);
  const tables = useStore(state => state.tables);
  const enums = useStore(state => state.enums);

  // Check if a column is a Foreign Key
  const isForeignKey = (colId: string) => {
    return Object.values(relations).some(rel => {
      const resolved = resolveRelationFK(rel, tables);
      return resolved.fkTableId === id && resolved.fkColumnId === colId;
    });
  };

  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectTable(id);
  };

  const headerColor = table.color || "#3b82f6";

  return (
    <div
      onClick={handleNodeClick}
      className={cn(
        "min-w-64 rounded-xl border bg-card text-card-foreground shadow-lg transition-all duration-200 select-none",
        selected 
          ? "border-primary ring-2 ring-primary/20 scale-[1.01]" 
          : "border-border hover:border-muted-foreground/30"
      )}
    >
      {/* Table Color Header Accent */}
      <div 
        className="h-2 rounded-t-xl" 
        style={{ backgroundColor: headerColor }}
      />

      {/* Table Title Block */}
      <div className="flex flex-col gap-0.5 px-4 py-3 border-b bg-muted/20">
        <span className="font-semibold text-sm tracking-tight truncate">{table.name}</span>
        {table.description && (
          <span className="text-[10px] text-muted-foreground line-clamp-1">
            {table.description}
          </span>
        )}
      </div>

      {/* Columns List */}
      <div className="flex flex-col py-1.5">
        {table.columns.length === 0 ? (
          <div className="px-4 py-3 text-xs text-muted-foreground text-center italic">
            No columns defined
          </div>
        ) : (
          table.columns.map((col) => {
            const isPk = col.constraints.isPrimaryKey;
            const isFk = isForeignKey(col.id);
            const isUq = col.constraints.isUnique;

            return (
              <div
                key={col.id}
                className={cn(
                  "relative flex items-center justify-between px-4 py-1.5 text-xs group",
                  "hover:bg-muted/40 transition-colors"
                )}
              >
                {/* Left Handle (Target) */}
                <Handle
                  type="target"
                  position={Position.Left}
                  id={`col-left-${col.id}`}
                  className="!size-2 !bg-muted-foreground/40 !border-border hover:!bg-primary transition-colors"
                  style={{ left: "-4px" }}
                />

                {/* Column details (Left side) */}
                <div className="flex items-center gap-2 pr-4 truncate">
                  {/* Constraint Icons */}
                  <div className="flex items-center gap-0.5 min-w-4 text-muted-foreground">
                    {isPk && (
                      <span title="Primary Key">
                        <Key className="size-3 text-yellow-500 fill-yellow-500/20" />
                      </span>
                    )}
                    {isFk && (
                      <span title="Foreign Key">
                        <LinkIcon className="size-3 text-blue-500" />
                      </span>
                    )}
                    {isUq && !isPk && (
                      <span title="Unique">
                        <Fingerprint className="size-3 text-emerald-500" />
                      </span>
                    )}
                  </div>

                  {/* Column Name */}
                  <span className={cn(
                    "font-medium truncate",
                    isPk && "text-foreground font-semibold"
                  )}>
                    {col.name}
                    {col.constraints.isNullable ? "" : "*"}
                  </span>
                </div>

                {/* Column Type & Default Value (Right side) */}
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className={cn(
                    "text-[10px] font-mono uppercase",
                    col.enumId && enums[col.enumId] ? "text-violet-500 font-semibold" : "text-muted-foreground"
                  )}>
                    {col.enumId && enums[col.enumId] ? (
                      <span className="flex items-center gap-0.5">
                        <List className="size-2.5" />
                        {enums[col.enumId].name}
                      </span>
                    ) : (
                      col.type
                    )}
                  </span>

                  {col.constraints.defaultValue !== undefined &&
                   col.constraints.defaultValue !== null &&
                   col.constraints.defaultValue.trim() !== "" && (
                    <span
                      className="text-[9px] font-mono text-amber-500/90 bg-amber-500/10 px-1 py-0.2 rounded border border-amber-500/20 truncate max-w-[100px]"
                      title={`Default: ${col.constraints.defaultValue}`}
                    >
                      = {col.constraints.defaultValue}
                    </span>
                  )}
                </div>

                {/* Right Handle (Source) */}
                <Handle
                  type="source"
                  position={Position.Right}
                  id={`col-right-${col.id}`}
                  className="!size-2 !bg-muted-foreground/40 !border-border hover:!bg-primary transition-colors"
                  style={{ right: "-4px" }}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
