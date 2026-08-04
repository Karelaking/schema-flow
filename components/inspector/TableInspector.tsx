"use client";

import React, { useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, GripVertical, BookmarkPlus, List } from "lucide-react";
import { useStore } from "@/lib/store";
import { TableInspectorProps } from "@/types";
import { Button } from "@schema-flow/components/ui/button";
import { Input } from "@schema-flow/components/ui/input";
import { Label } from "@schema-flow/components/ui/label";
import { Switch } from "@schema-flow/components/ui/switch";
import { Separator } from "@schema-flow/components/ui/separator";
import { Badge } from "@schema-flow/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@schema-flow/components/ui/select";
import { Card, CardContent } from "@schema-flow/components/ui/card";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@schema-flow/components/ui/tooltip";
import { useDialectDataTypes } from "@/hooks/useDialectDataTypes";
import { cn } from "@/lib/utils";

const PRESET_COLORS: { name: string; value: string }[] = [
    { name: "Blue", value: "#3b82f6" },
    { name: "Green", value: "#10b981" },
    { name: "Purple", value: "#8b5cf6" },
    { name: "Pink", value: "#ec4899" },
    { name: "Orange", value: "#f97316" },
    { name: "Red", value: "#ef4444" },
    { name: "Slate", value: "#64748b" },
    { name: "Yellow", value: "#facc15" },
    { name: "Cyan", value: "#06b6d4" },
    { name: "Lime", value: "#84cc16" },
    { name: "Turquoise", value: "#38bdf8" },
    { name: "Indigo", value: "#6366f1" },
    { name: "Rose", value: "#f43f5e" },
    { name: "Amber", value: "#f59e0b" },
    { name: "Zinc", value: "#71717a" },
    { name: "Gray", value: "#6b7280" },
    { name: "Stone", value: "#78716c" },
];

/**
 * Manages table metadata editing, color picking, column drag-and-drop, and table indexes.
 */
export const TableInspector: React.FC<TableInspectorProps> = ({ selectedTable, selectedColId, setSelectedColId }): React.ReactElement => {
    const updateTable = useStore(state => state.updateTable);
    const deleteTable = useStore(state => state.deleteTable);
    const addColumn = useStore(state => state.addColumn);
    const updateColumn = useStore(state => state.updateColumn);
    const deleteColumn = useStore(state => state.deleteColumn);
    const reorderColumns = useStore(state => state.reorderColumns);
    const addIndex = useStore(state => state.addIndex);
    const updateIndex = useStore(state => state.updateIndex);
    const deleteIndex = useStore(state => state.deleteIndex);
    const enums = useStore(state => state.enums);

    const { categories, dialect, getTypeDescription } = useDialectDataTypes();

    const enumList = Object.values(enums);

    const [draggedColIndex, setDraggedColIndex] = useState<number | undefined>(undefined);

    const selectedCol = selectedTable.columns.find(column => column.id === selectedColId);
    const selectedColEnum = selectedCol?.enumId ? enums[selectedCol.enumId] : undefined;

    const handleAddColumn = (): void => {
        const colCount = selectedTable.columns.length + 1;
        const newColId = addColumn(selectedTable.id, {
            name: `col_${colCount}`,
            type: "VARCHAR",
            constraints: {
                isPrimaryKey: false,
                isNullable: true,
                isUnique: false,
                isAutoIncrement: false
            }
        });
        setSelectedColId(newColId);
    };

    const handleMoveColumn = (index: number, direction: "up" | "down"): void => {
        const newColumns = [...selectedTable.columns];
        const targetIndex = direction === "up" ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newColumns.length) {
            return;
        }

        const [moved] = newColumns.splice(index, 1);
        newColumns.splice(targetIndex, 0, moved);

        reorderColumns(selectedTable.id, newColumns);
    };

    const handleDragStart = (e: React.DragEvent, index: number): void => {
        setDraggedColIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent): void => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number): void => {
        e.preventDefault();
        if (draggedColIndex === undefined || draggedColIndex === dropIndex) {
            return;
        }

        const newColumns = [...selectedTable.columns];
        const [draggedItem] = newColumns.splice(draggedColIndex, 1);
        newColumns.splice(dropIndex, 0, draggedItem);

        reorderColumns(selectedTable.id, newColumns);
        setDraggedColIndex(undefined);
    };

    const handleAddIndex = (): void => {
        if (selectedTable.columns.length === 0) {
            return;
        }
        const firstCol = selectedTable.columns[0].name;
        const idxName = `idx_${selectedTable.name}_${firstCol}`;
        addIndex(selectedTable.id, idxName, [{ columnName: firstCol }], false);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Table Documentation & Notes
                </span>
                <div className="grid grid-cols-1 gap-2 p-3 bg-muted/30 rounded-md border text-xs">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="table-description-input" className="text-xs font-medium">Description</Label>
                        <Input
                            id="table-description-input"
                            value={selectedTable.description || ""}
                            onChange={e => updateTable(selectedTable.id, { description: e.target.value.trim() ? e.target.value : undefined })}
                            placeholder="Documentation describing table structure/purpose..."
                            className="h-8 text-xs bg-background"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="table-comment-input" className="text-xs font-medium">Comment</Label>
                        <Input
                            id="table-comment-input"
                            value={selectedTable.comment || ""}
                            onChange={e => updateTable(selectedTable.id, { comment: e.target.value.trim() ? e.target.value : undefined })}
                            placeholder="Internal notes or canvas annotations..."
                            className="h-8 text-xs bg-background"
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between" data-slot="section-header">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider" data-slot="label">
                        Columns ({selectedTable.columns.length})
                    </span>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1 cursor-pointer"
                        onClick={handleAddColumn}
                        aria-label="Add Column"
                        data-slot="button"
                    >
                        <Plus className="size-3.5" data-slot="icon" data-icon="inline-start" aria-hidden="true" />
                        <span>Add Column</span>
                    </Button>
                </div>

                <div className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1">
                    {selectedTable.columns.map((col, idx) => (
                        <div
                            key={col.id}
                            role="button"
                            tabIndex={0}
                            aria-label={`Select column ${col.name}`}
                            draggable
                            onDragStart={e => handleDragStart(e, idx)}
                            onDragOver={handleDragOver}
                            onDrop={e => handleDrop(e, idx)}
                            onClick={() => setSelectedColId(col.id)}
                            onKeyDown={e => {
                                if (e.key === "Enter" || e.key === " ") {
                                    setSelectedColId(col.id);
                                }
                            }}
                            className={`flex items-center justify-between p-2 rounded-md border text-xs cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                                selectedColId === col.id ? "border-primary bg-primary/5 font-semibold" : "border-border hover:bg-muted/50"
                            } ${draggedColIndex === idx ? "opacity-40 border-dashed" : ""}`}
                        >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                <GripVertical className="size-3 text-muted-foreground shrink-0 cursor-grab active:cursor-grabbing" />
                                <span className="truncate">{col.name}</span>
                                <TooltipProvider delay={150}>
                                    <Tooltip>
                                        <TooltipTrigger render={
                                            <Badge
                                                variant="secondary"
                                                className={cn(
                                                    "text-[9px] px-1 py-0 uppercase shrink-0 font-mono cursor-pointer",
                                                    col.enumId && enums[col.enumId] && "bg-violet-500/15 text-violet-500 border-violet-500/30 font-semibold"
                                                )}
                                            >
                                                {col.enumId && enums[col.enumId] ? enums[col.enumId].name : col.type}
                                            </Badge>
                                        } />
                                        <TooltipContent side="right" className="bg-popover text-popover-foreground border shadow-md max-w-xs text-xs z-50">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-semibold text-foreground">
                                                    {col.enumId && enums[col.enumId] ? `Enum: ${enums[col.enumId].name}` : col.type}
                                                </span>
                                                <span className="text-[11px] text-muted-foreground">
                                                    {col.enumId && enums[col.enumId]
                                                        ? `Values: ${enums[col.enumId].values.join(", ")}`
                                                        : getTypeDescription(col.type)}
                                                </span>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                {col.constraints.isPrimaryKey && (
                                    <Badge className="text-[8px] px-1 py-0 bg-amber-500/20 text-amber-500 border-amber-500/30 uppercase shrink-0">
                                        PK
                                    </Badge>
                                )}
                                {col.enumId && enums[col.enumId] && (
                                    <Badge className="text-[8px] px-1 py-0 bg-violet-500/20 text-violet-500 border-violet-500/30 uppercase shrink-0 gap-0.5">
                                        <List className="size-2" />
                                        ENUM
                                    </Badge>
                                )}
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                    type="button"
                                    onClick={e => {
                                        e.stopPropagation();
                                        handleMoveColumn(idx, "up");
                                    }}
                                    disabled={idx === 0}
                                    className="size-6 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                                    title="Move Up"
                                    aria-label={`Move column ${col.name} up`}
                                >
                                    <ArrowUp className="size-3" />
                                </button>
                                <button
                                    type="button"
                                    onClick={e => {
                                        e.stopPropagation();
                                        handleMoveColumn(idx, "down");
                                    }}
                                    disabled={idx === selectedTable.columns.length - 1}
                                    className="size-6 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                                    title="Move Down"
                                    aria-label={`Move column ${col.name} down`}
                                >
                                    <ArrowDown className="size-3" />
                                </button>
                                <button
                                    type="button"
                                    onClick={e => {
                                        e.stopPropagation();
                                        deleteColumn(selectedTable.id, col.id);
                                        if (selectedColId === col.id) {
                                            setSelectedColId(undefined);
                                        }
                                    }}
                                    className="size-6 flex items-center justify-center text-muted-foreground hover:text-destructive cursor-pointer"
                                    title="Delete Column"
                                    aria-label={`Delete column ${col.name}`}
                                >
                                    <Trash2 className="size-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedCol && (
                <Card className="border shadow-2xs">
                    <CardContent className="p-3 flex flex-col gap-3">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Edit Column: {selectedCol.name}
                        </span>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="inspector-col-name" className="text-xs">Column Name</Label>
                            <Input
                                id="inspector-col-name"
                                value={selectedCol.name}
                                onChange={e => updateColumn(selectedTable.id, selectedCol.id, { name: e.target.value })}
                                aria-label="Column Name"
                                className="h-8 text-xs"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs">Data Type</Label>
                                <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                                    {dialect} Types
                                </span>
                            </div>
                            <Select
                                value={selectedCol.enumId ? `enum:${selectedCol.enumId}` : selectedCol.type}
                                onValueChange={val => {
                                    if (!val) {
                                        return;
                                    }
                                    if (val.startsWith("enum:")) {
                                        const enumId = val.slice(5);
                                        updateColumn(selectedTable.id, selectedCol.id, { type: "ENUM", enumId, constraints: { ...selectedCol.constraints, defaultValue: "" } });
                                    }
                                    else {
                                        updateColumn(selectedTable.id, selectedCol.id, { type: val, enumId: undefined });
                                    }
                                }}
                            >
                                <SelectTrigger aria-label="Column data type" className="h-8 text-xs font-mono">
                                    <SelectValue placeholder="Select type">
                                        {selectedColEnum ? (
                                            <span className="flex items-center gap-1.5 text-violet-500 font-semibold">
                                                <List className="size-3 shrink-0" />
                                                {selectedColEnum.name}
                                            </span>
                                        ) : (
                                            selectedCol.type
                                        )}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="max-h-72 w-(--radix-select-trigger-width) min-w-55 max-w-75 overflow-y-auto z-50">
                                    {enumList.length > 0 && (
                                        <SelectGroup>
                                            <SelectLabel className="text-[10px] font-bold uppercase tracking-wider text-violet-500 px-1 py-0.5">
                                                Enum Types
                                            </SelectLabel>
                                            {enumList.map(e => (
                                                <SelectItem
                                                    key={`enum:${e.id}`}
                                                    value={`enum:${e.id}`}
                                                    className="text-xs cursor-pointer py-1.5"
                                                >
                                                    <div className="flex items-center justify-between w-full gap-2 min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <List className="size-3 text-violet-500 shrink-0" />
                                                            <span className="font-mono font-medium">{e.name}</span>
                                                        </div>
                                                        <span className="text-[10px] text-muted-foreground shrink-0">
                                                            {e.values.length} vals
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    )}

                                    {categories.map(group => (
                                        <SelectGroup key={group.category}>
                                            <SelectLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1 py-0.5">
                                                {group.label}
                                            </SelectLabel>
                                            {group.types.map(t => (
                                                <SelectItem
                                                    key={t.type}
                                                    value={t.type}
                                                    className="text-xs cursor-pointer py-1.5"
                                                >
                                                    <TooltipProvider delay={150}>
                                                        <Tooltip>
                                                            <TooltipTrigger render={
                                                                <div className="flex items-center justify-between w-full gap-2 min-w-0">
                                                                    <span className="font-mono font-medium shrink-0">{t.type}</span>
                                                                    {t.description && (
                                                                        <span className="text-[10px] text-muted-foreground truncate max-w-27.5">
                                                                            {t.description}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            } />
                                                            {t.description && (
                                                                <TooltipContent side="left" className="bg-popover text-popover-foreground border shadow-md max-w-xs text-xs z-50">
                                                                    <div className="flex flex-col gap-0.5">
                                                                        <span className="font-semibold text-foreground">{t.type}</span>
                                                                        <span className="text-[11px] text-muted-foreground">{t.description}</span>
                                                                    </div>
                                                                </TooltipContent>
                                                            )}
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    ))}
                                </SelectContent>
                            </Select>

                            {selectedColEnum && (
                                <div className="flex flex-wrap gap-1 pt-1">
                                    {selectedColEnum.values.map(v => (
                                        <Badge key={v} variant="secondary" className="text-[9px] px-1.5 py-0 font-mono bg-violet-500/10 text-violet-500 border-violet-500/20">
                                            {v}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>

                        {(() => {
                            const isBooleanType = ["BOOLEAN", "BOOL", "TINYINT(1)"].includes(selectedCol.type.toUpperCase());
                            const hasDefaultValue = Boolean(
                                selectedCol.constraints.defaultValue !== undefined &&
                                selectedCol.constraints.defaultValue.trim() !== ""
                            );

                            return (
                                <>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="inspector-col-default" className="text-xs">Default Value</Label>
                                        {selectedColEnum ? (
                                            <Select
                                                value={selectedCol.constraints.defaultValue || "__none__"}
                                                onValueChange={val => updateColumn(selectedTable.id, selectedCol.id, {
                                                    constraints: { ...selectedCol.constraints, defaultValue: val === "__none__" ? "" : val ?? undefined }
                                                })}
                                            >
                                                <SelectTrigger id="inspector-col-default" aria-label="Default Value" className="h-8 text-xs font-mono">
                                                    <SelectValue placeholder="Select default..." />
                                                </SelectTrigger>
                                                <SelectContent className="z-50">
                                                    <SelectGroup>
                                                        <SelectItem value="__none__" className="text-xs cursor-pointer text-muted-foreground italic">
                                                            No default
                                                        </SelectItem>
                                                        {selectedColEnum.values.map(v => (
                                                            <SelectItem key={v} value={v} className="text-xs cursor-pointer font-mono">
                                                                {v}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        ) : isBooleanType ? (
                                            <Select
                                                value={selectedCol.constraints.defaultValue ? selectedCol.constraints.defaultValue.toUpperCase() : "__none__"}
                                                onValueChange={val => updateColumn(selectedTable.id, selectedCol.id, {
                                                    constraints: { ...selectedCol.constraints, defaultValue: val === "__none__" ? "" : val ?? undefined }
                                                })}
                                            >
                                                <SelectTrigger id="inspector-col-default" aria-label="Default Value" className="h-8 text-xs font-mono">
                                                    <SelectValue placeholder="Select boolean default..." />
                                                </SelectTrigger>
                                                <SelectContent className="z-50">
                                                    <SelectGroup>
                                                        <SelectItem value="__none__" className="text-xs cursor-pointer text-muted-foreground italic">
                                                            No default
                                                        </SelectItem>
                                                        <SelectItem value="TRUE" className="text-xs cursor-pointer font-mono">
                                                            TRUE
                                                        </SelectItem>
                                                        <SelectItem value="FALSE" className="text-xs cursor-pointer font-mono">
                                                            FALSE
                                                        </SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Input
                                                id="inspector-col-default"
                                                value={selectedCol.constraints.defaultValue || ""}
                                                onChange={e => updateColumn(selectedTable.id, selectedCol.id, {
                                                    constraints: { ...selectedCol.constraints, defaultValue: e.target.value }
                                                })}
                                                aria-label="Default Value"
                                                className="h-8 text-xs font-mono"
                                                placeholder="NULL, CURRENT_TIMESTAMP..."
                                            />
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2.5 pt-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs cursor-pointer">Primary Key</Label>
                                            <Switch
                                                checked={selectedCol.constraints.isPrimaryKey}
                                                aria-label="Primary Key"
                                                onCheckedChange={val => updateColumn(selectedTable.id, selectedCol.id, {
                                                    constraints: { ...selectedCol.constraints, isPrimaryKey: val }
                                                })}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <Label className="text-xs cursor-pointer">Nullable</Label>
                                                {hasDefaultValue && (
                                                    <span className="text-[9px] text-amber-500 font-medium">
                                                        Not Null (Default set)
                                                    </span>
                                                )}
                                            </div>
                                            <Switch
                                                checked={selectedCol.constraints.isNullable && !hasDefaultValue}
                                                disabled={hasDefaultValue}
                                                aria-label="Nullable"
                                                onCheckedChange={val => updateColumn(selectedTable.id, selectedCol.id, {
                                                    constraints: { ...selectedCol.constraints, isNullable: val }
                                                })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs cursor-pointer">Unique</Label>
                                            <Switch
                                                checked={selectedCol.constraints.isUnique}
                                                aria-label="Unique"
                                                onCheckedChange={val => updateColumn(selectedTable.id, selectedCol.id, {
                                                    constraints: { ...selectedCol.constraints, isUnique: val }
                                                })}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs cursor-pointer">Auto Increment</Label>
                                            <Switch
                                                checked={selectedCol.constraints.isAutoIncrement}
                                                aria-label="Auto Increment"
                                                onCheckedChange={val => updateColumn(selectedTable.id, selectedCol.id, {
                                                    constraints: { ...selectedCol.constraints, isAutoIncrement: val }
                                                })}
                                            />
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                    </CardContent>
                </Card>
            )}

            <Separator />

            <div className="flex flex-col gap-3" data-slot="indexes-section">
                <div className="flex items-center justify-between" data-slot="section-header">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1" data-slot="label">
                        <BookmarkPlus className="size-3" data-slot="icon" aria-hidden="true" />
                        <span>Indexes ({selectedTable.indexes?.length || 0})</span>
                    </span>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1 cursor-pointer"
                        onClick={handleAddIndex}
                        disabled={selectedTable.columns.length === 0}
                        aria-label="Add Index"
                        data-slot="button"
                    >
                        <Plus className="size-3.5" data-slot="icon" data-icon="inline-start" aria-hidden="true" />
                        <span>Add Index</span>
                    </Button>
                </div>

                <div className="flex flex-col gap-2">
                    {(!selectedTable.indexes || selectedTable.indexes.length === 0) && (
                        <span className="text-xs text-muted-foreground italic">No indexes configured.</span>
                    )}
                    {selectedTable.indexes?.map(idx => (
                        <Card key={idx.id} className="border shadow-2xs">
                            <CardContent className="p-3 flex flex-col gap-2.5">
                                <div className="flex items-center justify-between gap-2">
                                    <Input
                                        value={idx.name}
                                        onChange={e => updateIndex(selectedTable.id, idx.id, { name: e.target.value })}
                                        aria-label="Index name"
                                        className="h-7 text-xs font-mono flex-1"
                                        placeholder="index_name"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => deleteIndex(selectedTable.id, idx.id)}
                                        aria-label="Delete Index"
                                        className="size-6 min-h-6 min-w-6 flex items-center justify-center text-muted-foreground hover:text-destructive cursor-pointer shrink-0"
                                        title="Delete Index"
                                    >
                                        <Trash2 className="size-3" />
                                    </button>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label className="text-[11px] text-muted-foreground">Index Columns</Label>
                                    <div className="flex flex-wrap gap-1">
                                        {selectedTable.columns.map(col => {
                                            const indexedCol = idx.columns.find(c => c.columnName === col.name);
                                            const isIndexed = Boolean(indexedCol);
                                            return (
                                                <div key={col.id} className="flex items-center gap-1">
                                                    <Badge
                                                        variant={isIndexed ? "default" : "outline"}
                                                        className="cursor-pointer text-[10px] px-1.5 py-0.5"
                                                        onClick={() => {
                                                            const newCols = isIndexed
                                                                ? idx.columns.filter(c => c.columnName !== col.name)
                                                                : [...idx.columns, { columnName: col.name, order: "ASC" as const }];
                                                            updateIndex(selectedTable.id, idx.id, { columns: newCols });
                                                        }}
                                                    >
                                                        {col.name} {isIndexed ? (indexedCol?.order || "ASC") : ""}
                                                    </Badge>
                                                    {isIndexed && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newCols = idx.columns.map(c =>
                                                                    c.columnName === col.name
                                                                        ? { ...c, order: (c.order === "DESC" ? "ASC" : "DESC") as "ASC" | "DESC" }
                                                                        : c
                                                                );
                                                                updateIndex(selectedTable.id, idx.id, { columns: newCols });
                                                            }}
                                                            className="text-[9px] font-mono text-muted-foreground hover:text-foreground cursor-pointer"
                                                            title="Toggle ASC/DESC"
                                                        >
                                                            ⚙
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                    <Label className="text-[11px] cursor-pointer">Unique Index</Label>
                                    <Switch
                                        checked={idx.isUnique}
                                        aria-label="Unique Index"
                                        onCheckedChange={val => updateIndex(selectedTable.id, idx.id, { isUnique: val })}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};
