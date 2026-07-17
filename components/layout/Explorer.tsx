"use client";

import React, { useState } from "react";
import { Plus, Search, TableProperties, SlidersHorizontal, Key, Clock, Check, Eye, RefreshCw } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { cn } from "@/lib/utils";

interface ExplorerProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Explorer({ className, style }: ExplorerProps = {}) {
  const tables = useStore(state => state.tables);
  const addTable = useStore(state => state.addTable);
  const selectTable = useStore(state => state.selectTable);
  const selectedTableId = useStore(state => state.selectedTableId);
  const autoAddId = useStore(state => state.autoAddId);
  const autoAddTimestamps = useStore(state => state.autoAddTimestamps);
  const setAutoAddId = useStore(state => state.setAutoAddId);
  const setAutoAddTimestamps = useStore(state => state.setAutoAddTimestamps);

  const [search, setSearch] = useState("");

  const filteredTables = Object.values(tables).filter(table =>
    table.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddTable = () => {
    // Generate position in central canvas
    const x = Math.floor(Math.random() * 200) + 150;
    const y = Math.floor(Math.random() * 200) + 150;
    
    // Pick unique table name
    let count = Object.keys(tables).length + 1;
    let name = `new_table_${count}`;
    while (Object.values(tables).some(t => t.name === name)) {
      count++;
      name = `new_table_${count}`;
    }

    addTable(name, x, y);
  };

  return (
    <aside style={style} className={cn("sidebar-panel bg-card text-card-foreground flex flex-col shrink-0 select-none", className)}>
      {/* Search & Actions Header */}
      <div className="p-4 border-b flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="explorer-title font-semibold text-xs uppercase tracking-wider text-muted-foreground truncate">
            Explorer
          </span>
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Node Defaults Settings"
                >
                  <SlidersHorizontal className="size-3.5" />
                </Button>
              } />
              <DropdownMenuContent align="end" className="w-56 bg-card border shadow-md p-2 rounded-md text-foreground z-50">
                <div className="px-1 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  New Node Defaults
                </div>
                
                <DropdownMenuItem
                  onClick={() => setAutoAddId(!autoAddId)}
                  className="flex items-center justify-between cursor-pointer p-2 hover:bg-muted text-xs rounded-sm"
                >
                  <div className="flex items-center gap-2">
                    <Key className="size-3.5 text-amber-500" />
                    <span>Auto Primary Key (id)</span>
                  </div>
                  {autoAddId && <Check className="size-3.5 text-primary" />}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setAutoAddTimestamps(!autoAddTimestamps)}
                  className="flex items-center justify-between cursor-pointer p-2 hover:bg-muted text-xs rounded-sm"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="size-3.5 text-blue-500" />
                    <span>Auto Timestamps</span>
                  </div>
                  {autoAddTimestamps && <Check className="size-3.5 text-primary" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="ghost" 
              size="icon" 
              className="size-7 text-primary hover:text-primary-foreground hover:bg-primary transition-colors cursor-pointer"
              onClick={handleAddTable}
              title="Create Table"
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </div>

        {/* Filter input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Filter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs bg-muted/30 border-border"
          />
        </div>
      </div>

      {/* Explorer Lists */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="flex flex-col gap-1.5">
          {/* Section: Tables */}
          <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            <TableProperties className="size-3" />
            Tables ({Object.keys(tables).length})
          </div>

          <div className="flex flex-col gap-0.5 pl-1.5">
            {filteredTables.length === 0 ? (
              <span className="px-3 py-2 text-xs text-muted-foreground italic">
                {search ? "No matches found" : "No tables created yet"}
              </span>
            ) : (
              filteredTables.map(table => {
                const isSelected = table.id === selectedTableId;
                
                return (
                  <button
                    key={table.id}
                    onClick={() => selectTable(table.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between gap-1.5 min-w-0 ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <span className="truncate min-w-0 flex-1">{table.name}</span>
                    <span className={`text-[10px] uppercase font-mono shrink-0 ${
                      isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}>
                      {table.columns.length} cols
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Section: Views (Placeholder for premium explorer layout) */}
          <div className="border-t my-2" />
          <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider opacity-60">
            <Eye className="size-3" />
            Views (0)
          </div>
          
          <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider opacity-60">
            <RefreshCw className="size-3" />
            Triggers (0)
          </div>
        </div>
      </div>
    </aside>
  );
}
