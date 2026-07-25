"use client";

import React, { useState } from "react";
import { Plus, Search, TableProperties, SlidersHorizontal, Key, Clock, Check, Eye, RefreshCw, PanelLeftClose, List, Trash2, X, Pencil } from "lucide-react";
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
import { ExplorerProps } from "@/types/Explorer.interface";
import { useAIStore } from "@/lib/ai-store";
import { Badge } from "@/components/ui/badge";

export function Explorer({ className, style }: ExplorerProps = {}): React.ReactNode {
  const tables = useStore(state => state.tables);
  const addTable = useStore(state => state.addTable);
  const selectTable = useStore(state => state.selectTable);
  const selectedTableId = useStore(state => state.selectedTableId);
  const autoAddId = useStore(state => state.autoAddId);
  const autoAddTimestamps = useStore(state => state.autoAddTimestamps);
  const setAutoAddId = useStore(state => state.setAutoAddId);
  const setAutoAddTimestamps = useStore(state => state.setAutoAddTimestamps);
  const pendingPatch = useAIStore(state => state.pendingPatch);

  // Enum state
  const enums = useStore(state => state.enums);
  const addEnum = useStore(state => state.addEnum);
  const updateEnum = useStore(state => state.updateEnum);
  const deleteEnum = useStore(state => state.deleteEnum);

  const activeTables = pendingPatch ? pendingPatch.proposedAST.tables : tables;

  const [search, setSearch] = useState("");
  const [editingEnumId, setEditingEnumId] = useState<string | null>(null);
  const [newEnumValueInput, setNewEnumValueInput] = useState("");

  const filteredTables = Object.values(activeTables).filter(table =>
    table.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredEnums = Object.values(enums).filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddTable = (): void => {
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

  const handleAddEnum = (): void => {
    let count = Object.keys(enums).length + 1;
    let name = `new_enum_${count}`;
    while (Object.values(enums).some(e => e.name === name)) {
      count++;
      name = `new_enum_${count}`;
    }
    const id = addEnum(name, []);
    setEditingEnumId(id);
  };

  const handleAddEnumValue = (enumId: string): void => {
    const trimmed = newEnumValueInput.trim();
    if (!trimmed) return;

    const enumDef = enums[enumId];
    if (!enumDef) return;

    // Prevent duplicates
    if (enumDef.values.includes(trimmed)) {
      setNewEnumValueInput("");
      return;
    }

    updateEnum(enumId, { values: [...enumDef.values, trimmed] });
    setNewEnumValueInput("");
  };

  const handleRemoveEnumValue = (enumId: string, value: string): void => {
    const enumDef = enums[enumId];
    if (!enumDef) return;
    updateEnum(enumId, { values: enumDef.values.filter(v => v !== value) });
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => useStore.getState().toggleLeftSidebar()}
              className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Hide Left Sidebar"
            >
              <PanelLeftClose className="size-3.5" />
            </Button>

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

          {/* Section: Enums */}
          <div className="border-t my-2" />
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <List className="size-3" />
              Enums ({Object.keys(enums).length})
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 text-primary hover:text-primary-foreground hover:bg-primary transition-colors cursor-pointer"
              onClick={handleAddEnum}
              title="Create Enum"
            >
              <Plus className="size-3.5" />
            </Button>
          </div>

          <div className="flex flex-col gap-1 pl-1.5">
            {filteredEnums.length === 0 ? (
              <span className="px-3 py-2 text-xs text-muted-foreground italic">
                {search ? "No matches found" : "No enums defined yet"}
              </span>
            ) : (
              filteredEnums.map(enumDef => {
                const isEditing = editingEnumId === enumDef.id;

                return (
                  <div key={enumDef.id} className="flex flex-col gap-1">
                    {/* Enum row */}
                    <div
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between gap-1.5 min-w-0",
                        isEditing
                          ? "bg-violet-500/10 border border-violet-500/30"
                          : "hover:bg-muted text-foreground cursor-pointer"
                      )}
                    >
                      <div
                        className="flex items-center gap-1.5 min-w-0 flex-1 cursor-pointer"
                        onClick={() => setEditingEnumId(isEditing ? null : enumDef.id)}
                      >
                        <List className="size-3 text-violet-500 shrink-0" />
                        <span className="truncate min-w-0 flex-1">{enumDef.name}</span>
                        <span className="text-[10px] uppercase font-mono text-muted-foreground shrink-0">
                          {enumDef.values.length} vals
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          onClick={() => setEditingEnumId(isEditing ? null : enumDef.id)}
                          className="size-5 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                          title="Edit Enum"
                        >
                          <Pencil className="size-3" />
                        </button>
                        <button
                          onClick={() => {
                            deleteEnum(enumDef.id);
                            if (editingEnumId === enumDef.id) setEditingEnumId(null);
                          }}
                          className="size-5 flex items-center justify-center text-muted-foreground hover:text-destructive cursor-pointer"
                          title="Delete Enum"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    </div>

                    {/* Inline editor */}
                    {isEditing && (
                      <div className="ml-2 mr-1 p-2.5 rounded-md border border-border bg-muted/20 flex flex-col gap-2">
                        {/* Enum name */}
                        <Input
                          value={enumDef.name}
                          onChange={(e) => updateEnum(enumDef.id, { name: e.target.value })}
                          className="h-7 text-xs font-mono"
                          placeholder="enum_name"
                        />

                        {/* Existing values as badges */}
                        {enumDef.values.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {enumDef.values.map((val) => (
                              <Badge
                                key={val}
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0.5 gap-1 font-mono"
                              >
                                {val}
                                <button
                                  onClick={() => handleRemoveEnumValue(enumDef.id, val)}
                                  className="hover:text-destructive cursor-pointer ml-0.5"
                                  title={`Remove "${val}"`}
                                >
                                  <X className="size-2.5" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Add value input */}
                        <div className="flex items-center gap-1">
                          <Input
                            value={newEnumValueInput}
                            onChange={(e) => setNewEnumValueInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddEnumValue(enumDef.id);
                              }
                            }}
                            className="h-7 text-xs font-mono flex-1"
                            placeholder="Add value..."
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-7 shrink-0 cursor-pointer"
                            onClick={() => handleAddEnumValue(enumDef.id)}
                          >
                            <Plus className="size-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Section: Views (Placeholder) */}
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

