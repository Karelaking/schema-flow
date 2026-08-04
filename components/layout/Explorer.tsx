"use client";

import React, { useState } from "react";
import { Plus, Search, TableProperties, SlidersHorizontal, Key, Clock, Check, Eye, RefreshCw, PanelLeftClose, List, Trash2, X, Pencil } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@schema-flow/components/ui/button";
import { Input } from "@schema-flow/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuItem,
} from "@schema-flow/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ExplorerProps } from "@/types";
import { useAIStore } from "@/lib/ai-store";
import { Badge } from "@schema-flow/components/ui/badge";

/**
 * Explorer sidebar component rendering tables and enums lists.
 */
export const Explorer: React.FC<ExplorerProps> = ({ className, style }): React.ReactNode => {
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
    const [editingEnumId, setEditingEnumId] = useState<string | undefined>(undefined);
    const [newEnumValueInput, setNewEnumValueInput] = useState("");

    const searchLower = search.trim().toLowerCase();
    const filteredTables = Object.values(activeTables).filter(table => {
        if (!searchLower) {
            return true;
        }
        const matchesTableName = table.name.toLowerCase().includes(searchLower);
        const matchesColumnName = table.columns?.some(col => col.name.toLowerCase().includes(searchLower));
        return matchesTableName || matchesColumnName;
    });

    const filteredEnums = Object.values(enums).filter(enumItem =>
        !searchLower || enumItem.name.toLowerCase().includes(searchLower)
    );

    const setCreateTableOpen = useStore(state => state.setCreateTableOpen);

    const handleAddTable = (): void => {
        setCreateTableOpen(true);
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
        if (!trimmed) {
            return;
        }
        const targetEnum = enums[enumId];
        if (targetEnum && !targetEnum.values.includes(trimmed)) {
            updateEnum(enumId, { values: [...targetEnum.values, trimmed] });
        }
        setNewEnumValueInput("");
    };

    const handleRemoveEnumValue = (enumId: string, valToRemove: string): void => {
        const targetEnum = enums[enumId];
        if (targetEnum) {
            updateEnum(enumId, { values: targetEnum.values.filter(v => v !== valToRemove) });
        }
    };

    return (
        <aside
            className={cn("w-64 border-r border-border bg-card flex flex-col h-full select-none shrink-0", className)}
            style={style}
        >
            {/* Explorer Header */}
            <div className="p-3 border-b border-border flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                    <TableProperties className="h-4 w-4 text-primary" />
                    <span>Explorer</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                        {Object.keys(activeTables).length}
                    </Badge>
                </div>

                <div className="flex items-center gap-1">
                    {/* Settings Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                                    <SlidersHorizontal className="h-3.5 w-3.5" />
                                    <span className="sr-only">Canvas Auto-defaults</span>
                                </Button>
                            }
                        />
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuGroup>
                                <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                    Table Defaults
                                </DropdownMenuLabel>
                                <DropdownMenuItem
                                    onClick={() => setAutoAddId(!autoAddId)}
                                    className="flex items-center justify-between text-xs cursor-pointer"
                                >
                                    <span className="flex items-center gap-2">
                                        <Key className="h-3.5 w-3.5 text-amber-500" />
                                        Auto-add `id` PK
                                    </span>
                                    {autoAddId && <Check className="h-3.5 w-3.5 text-primary" />}
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    onClick={() => setAutoAddTimestamps(!autoAddTimestamps)}
                                    className="flex items-center justify-between text-xs cursor-pointer"
                                >
                                    <span className="flex items-center gap-2">
                                        <Clock className="h-3.5 w-3.5 text-blue-500" />
                                        Auto-add Timestamps
                                    </span>
                                    {autoAddTimestamps && <Check className="h-3.5 w-3.5 text-primary" />}
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Add Table Button */}
                    <Button
                        onClick={handleAddTable}
                        size="icon"
                        className="h-7 w-7 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm cursor-pointer"
                        title="Add Table"
                        aria-label="Add Table"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>

                    <Button
                        onClick={() => useStore.getState().setLeftSidebar(false)}
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground md:hidden cursor-pointer"
                        title="Collapse sidebar"
                        aria-label="Collapse sidebar"
                    >
                        <PanelLeftClose className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="p-2 border-b border-border">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Filter tables & enums..."
                        aria-label="Filter tables & enums"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-8 h-8 text-xs bg-background"
                    />
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto p-2 space-y-4">
                {/* Tables Section */}
                <div>
                    <div className="flex items-center justify-between px-2 py-1 mb-1 text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">
                        <span>Tables ({filteredTables.length})</span>
                    </div>

                    {filteredTables.length === 0 ? (
                        <div className="px-2 py-3 text-center text-xs text-muted-foreground italic">
                            No tables match filtering
                        </div>
                    ) : (
                        <div className="space-y-0.5">
                            {filteredTables.map(table => {
                                const isSelected = selectedTableId === table.id;
                                const isAiProposed = Boolean(pendingPatch?.proposedAST.tables[table.id] && !tables[table.id]);
                                const isAiModified = Boolean(pendingPatch?.proposedAST.tables[table.id] && tables[table.id] && JSON.stringify(tables[table.id]) !== JSON.stringify(pendingPatch.proposedAST.tables[table.id]));

                                return (
                                    <div
                                        key={table.id}
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`Select table ${table.name}`}
                                        onClick={() => selectTable(table.id)}
                                        onKeyDown={e => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                selectTable(table.id);
                                            }
                                        }}
                                        className={cn(
                                            "group flex items-center justify-between px-2 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                            isSelected
                                                ? "bg-accent text-accent-foreground font-semibold"
                                                : "text-foreground hover:bg-muted/60",
                                            isAiProposed && "border border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300",
                                            isAiModified && "border border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-300"
                                        )}
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span
                                                className="w-2 h-2 rounded-full shrink-0"
                                                style={{ backgroundColor: table.color || "#3b82f6" }}
                                            />
                                            <span className="truncate">{table.name}</span>
                                        </div>

                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground group-hover:text-foreground">
                                            {isAiProposed && (
                                                <span className="px-1 py-0.5 bg-amber-500 text-black font-semibold rounded text-[9px] leading-none">
                                                    NEW
                                                </span>
                                            )}
                                            {isAiModified && (
                                                <span className="px-1 py-0.5 bg-blue-500 text-white font-semibold rounded text-[9px] leading-none">
                                                    MOD
                                                </span>
                                            )}
                                            <span>{table.columns.length} cols</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Custom Enums Section */}
                <div>
                    <div className="flex items-center justify-between px-2 py-1 mb-1 text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">
                        <span>Enums ({filteredEnums.length})</span>
                        <Button
                            onClick={handleAddEnum}
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Add Enum"
                            aria-label="Add Enum"
                        >
                            <Plus className="h-3.5 w-3.5" />
                        </Button>
                    </div>

                    {filteredEnums.length === 0 ? (
                        <div className="px-2 py-2 text-center text-xs text-muted-foreground italic">
                            No custom enums defined
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredEnums.map(enumItem => {
                                const isEditing = editingEnumId === enumItem.id;

                                return (
                                    <div
                                        key={enumItem.id}
                                        className="border border-border rounded-md p-2 bg-muted/20 text-xs space-y-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 font-medium text-foreground min-w-0">
                                                <List className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                                                {isEditing ? (
                                                    <Input
                                                        type="text"
                                                        value={enumItem.name}
                                                        onChange={e => updateEnum(enumItem.id, { name: e.target.value })}
                                                        aria-label="Enum name"
                                                        className="h-6 text-xs px-1.5 font-medium bg-background"
                                                    />
                                                ) : (
                                                    <span className="truncate">{enumItem.name}</span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-0.5 shrink-0">
                                                <Button
                                                    onClick={() => setEditingEnumId(isEditing ? undefined : enumItem.id)}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
                                                    aria-label={isEditing ? "Done editing enum" : "Edit enum"}
                                                    title={isEditing ? "Done editing enum" : "Edit enum"}
                                                >
                                                    <Pencil className="h-3 w-3" />
                                                </Button>

                                                <Button
                                                    onClick={() => deleteEnum(enumItem.id)}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-muted-foreground hover:text-destructive cursor-pointer"
                                                    aria-label="Delete enum"
                                                    title="Delete enum"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Enum Values Pills */}
                                        <div className="flex flex-wrap gap-1">
                                            {enumItem.values.map(val => (
                                                <Badge
                                                    key={val}
                                                    variant="outline"
                                                    className="text-[10px] px-1.5 py-0 font-mono bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300 flex items-center gap-1"
                                                >
                                                    <span>{val}</span>
                                                    {isEditing && (
                                                        <X
                                                            onClick={() => handleRemoveEnumValue(enumItem.id, val)}
                                                            className="h-2.5 w-2.5 cursor-pointer hover:text-red-400"
                                                        />
                                                    )}
                                                </Badge>
                                            ))}

                                            {enumItem.values.length === 0 && (
                                                <span className="text-[10px] text-muted-foreground italic">Empty values</span>
                                            )}
                                        </div>

                                        {/* Add Value Input if Editing */}
                                        {isEditing && (
                                            <div className="flex items-center gap-1 pt-1">
                                                <Input
                                                    type="text"
                                                    placeholder="Add value..."
                                                    aria-label="Add enum value"
                                                    value={newEnumValueInput}
                                                    onChange={e => setNewEnumValueInput(e.target.value)}
                                                    onKeyDown={e => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault();
                                                            handleAddEnumValue(enumItem.id);
                                                        }
                                                    }}
                                                    className="h-6 text-[11px] px-2 bg-background"
                                                />
                                                <Button
                                                    onClick={() => handleAddEnumValue(enumItem.id)}
                                                    size="icon"
                                                    aria-label="Add value"
                                                    className="h-6 w-6 bg-purple-600 hover:bg-purple-700 text-white shrink-0 cursor-pointer"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};
