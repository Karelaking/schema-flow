"use client";

import React from "react";
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Layers, 
  Link2, 
  Info,
  Palette
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

export function Inspector() {
  const selectedTableId = useStore(state => state.selectedTableId);
  const selectedRelationId = useStore(state => state.selectedRelationId);
  const tables = useStore(state => state.tables);
  const relations = useStore(state => state.relations);

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

  // Selected entities
  const table = selectedTableId ? tables[selectedTableId] : null;
  const relation = selectedRelationId ? relations[selectedRelationId] : null;

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

  // 1. RELATIONSHIP INSPECTOR VIEW
  if (relation) {
    const sourceTable = tables[relation.sourceTableId];
    const targetTable = tables[relation.targetTableId];
    const sourceCol = sourceTable?.columns.find(c => c.id === relation.sourceColumnId);
    const targetCol = targetTable?.columns.find(c => c.id === relation.targetColumnId);

    return (
      <aside className="w-80 border-l bg-card text-card-foreground flex flex-col shrink-0 select-none overflow-y-auto p-4 gap-4">
        <div>
          <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
            Relation Inspector
          </span>
          <h3 className="font-bold text-sm tracking-tight truncate mt-1 flex items-center gap-1.5">
            <Link2 className="size-4 text-primary" />
            {sourceTable?.name}.{sourceCol?.name} &rarr; {targetTable?.name}.{targetCol?.name}
          </h3>
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
      </aside>
    );
  }

  // 2. TABLE INSPECTOR VIEW
  if (table) {
    return (
      <aside className="w-80 border-l bg-card text-card-foreground flex flex-col shrink-0 select-none overflow-y-auto">
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
                    <div className="flex items-center justify-between">
                      <Input
                        value={col.name}
                        onChange={(e) => updateColumn(table.id, col.id, { name: e.target.value })}
                        className="h-7 w-[60%] text-xs font-mono border-none focus-visible:ring-1 focus-visible:ring-muted p-0 px-1 bg-transparent hover:bg-muted/30"
                        placeholder="column_name"
                      />
                      
                      {/* Control buttons */}
                      <div className="flex items-center gap-0.5">
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
                    <div className="grid grid-cols-2 gap-2">
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
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-1">
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
      </aside>
    );
  }

  // 3. EMPTY STATE VIEW
  return (
    <aside className="w-80 border-l bg-card text-card-foreground flex flex-col justify-center items-center shrink-0 p-6 select-none">
      <div className="flex flex-col items-center text-center gap-3">
        <div className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          <Info className="size-5" />
        </div>
        <span className="font-semibold text-sm">No Selection</span>
        <p className="text-xs text-muted-foreground max-w-48 leading-relaxed">
          Select a table node or a relationship edge on the canvas to inspect and edit details.
        </p>
      </div>
    </aside>
  );
}
