"use client";

import React from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, Palette } from "lucide-react";
import { useStore } from "@/lib/store";
import { Table, Column } from "@/packages/schema-core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const PRESET_COLORS = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#10b981" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Pink", value: "#ec4899" },
  { name: "Orange", value: "#f97316" },
  { name: "Red", value: "#ef4444" },
  { name: "Slate", value: "#64748b" }
];

export interface TableInspectorProps {
  /** Selected table instance */
  selectedTable: Table;
  /** Currently active column ID inside the table form */
  selectedColId: string | null;
  /** Callback to set selected column ID */
  setSelectedColId: (id: string | null) => void;
}

/**
 * SRP Component: Manages table metadata editing, color picking, and column CRUD operations.
 */
export function TableInspector({ selectedTable, selectedColId, setSelectedColId }: TableInspectorProps) {
  const updateTable = useStore(state => state.updateTable);
  const deleteTable = useStore(state => state.deleteTable);
  const addColumn = useStore(state => state.addColumn);
  const updateColumn = useStore(state => state.updateColumn);
  const deleteColumn = useStore(state => state.deleteColumn);
  const reorderColumns = useStore(state => state.reorderColumns);

  const selectedCol = selectedTable.columns.find(c => c.id === selectedColId);

  const handleAddColumn = () => {
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

  const handleMoveColumn = (index: number, direction: 'up' | 'down') => {
    const newColumns = [...selectedTable.columns];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newColumns.length) return;
    
    const [moved] = newColumns.splice(index, 1);
    newColumns.splice(targetIndex, 0, moved);
    
    reorderColumns(selectedTable.id, newColumns);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Table Metadata Form */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Table Details
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
            onClick={() => deleteTable(selectedTable.id)}
            title="Delete Table"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="table-name" className="text-xs">Table Name</Label>
          <Input 
            id="table-name" 
            value={selectedTable.name}
            onChange={(e) => updateTable(selectedTable.id, { name: e.target.value })}
            className="h-8 text-xs"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="table-desc" className="text-xs">Description</Label>
          <Textarea 
            id="table-desc" 
            value={selectedTable.description || ""}
            onChange={(e) => updateTable(selectedTable.id, { description: e.target.value })}
            rows={2}
            className="text-xs min-h-[50px]"
            placeholder="Optional table comment..."
          />
        </div>

        {/* Color presets */}
        <div className="flex flex-col gap-2">
          <Label className="text-xs flex items-center gap-1.5">
            <Palette className="size-3 text-muted-foreground" />
            Header Color
          </Label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {PRESET_COLORS.map(c => (
              <button
                key={c.value}
                onClick={() => updateTable(selectedTable.id, { color: c.value })}
                className="size-5 rounded-full border border-border transition-transform hover:scale-110 cursor-pointer"
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>
        </div>
      </div>

      <Separator />

      {/* Columns List & Add Action */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Columns ({selectedTable.columns.length})
          </span>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-7 text-xs gap-1 cursor-pointer"
            onClick={handleAddColumn}
          >
            <Plus className="size-3.5" />
            Add Column
          </Button>
        </div>

        <div className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1">
          {selectedTable.columns.map((col, idx) => (
            <div 
              key={col.id}
              onClick={() => setSelectedColId(col.id)}
              className={`flex items-center justify-between p-2 rounded-md border text-xs cursor-pointer transition-colors ${
                selectedColId === col.id ? "border-primary bg-primary/5 font-semibold" : "border-border hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="truncate">{col.name}</span>
                <Badge variant="secondary" className="text-[9px] px-1 py-0 uppercase shrink-0 font-mono">
                  {col.type}
                </Badge>
                {col.constraints.isPrimaryKey && (
                  <Badge className="text-[8px] px-1 py-0 bg-amber-500/20 text-amber-500 border-amber-500/30 uppercase shrink-0">
                    PK
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); handleMoveColumn(idx, 'up'); }}
                  disabled={idx === 0}
                  className="size-5 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                  title="Move Up"
                >
                  <ArrowUp className="size-3" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleMoveColumn(idx, 'down'); }}
                  disabled={idx === selectedTable.columns.length - 1}
                  className="size-5 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                  title="Move Down"
                >
                  <ArrowDown className="size-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteColumn(selectedTable.id, col.id);
                    if (selectedColId === col.id) setSelectedColId(null);
                  }}
                  className="size-5 flex items-center justify-center text-muted-foreground hover:text-destructive cursor-pointer"
                  title="Delete Column"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Column Properties Form */}
      {selectedCol && (
        <Card className="border shadow-2xs">
          <CardContent className="p-3 flex flex-col gap-3">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Edit Column: {selectedCol.name}
            </span>

            <div className="flex flex-col gap-2">
              <Label className="text-xs">Column Name</Label>
              <Input 
                value={selectedCol.name}
                onChange={(e) => updateColumn(selectedTable.id, selectedCol.id, { name: e.target.value })}
                className="h-8 text-xs"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-xs">Data Type</Label>
              <Select 
                value={selectedCol.type} 
                onValueChange={(val) => { if (val) updateColumn(selectedTable.id, selectedCol.id, { type: val }); }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INTEGER">INTEGER</SelectItem>
                  <SelectItem value="VARCHAR">VARCHAR</SelectItem>
                  <SelectItem value="TEXT">TEXT</SelectItem>
                  <SelectItem value="BOOLEAN">BOOLEAN</SelectItem>
                  <SelectItem value="DATETIME">DATETIME</SelectItem>
                  <SelectItem value="TIMESTAMP">TIMESTAMP</SelectItem>
                  <SelectItem value="DECIMAL">DECIMAL</SelectItem>
                  <SelectItem value="JSON">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-xs">Default Value</Label>
              <Input 
                value={selectedCol.constraints.defaultValue || ""}
                onChange={(e) => updateColumn(selectedTable.id, selectedCol.id, {
                  constraints: { ...selectedCol.constraints, defaultValue: e.target.value }
                })}
                className="h-8 text-xs font-mono"
                placeholder="NULL, CURRENT_TIMESTAMP..."
              />
            </div>

            {/* Constraints Toggles */}
            <div className="flex flex-col gap-2.5 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs cursor-pointer">Primary Key</Label>
                <Switch 
                  checked={selectedCol.constraints.isPrimaryKey}
                  onCheckedChange={(val) => updateColumn(selectedTable.id, selectedCol.id, {
                    constraints: { ...selectedCol.constraints, isPrimaryKey: val }
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs cursor-pointer">Nullable</Label>
                <Switch 
                  checked={selectedCol.constraints.isNullable}
                  onCheckedChange={(val) => updateColumn(selectedTable.id, selectedCol.id, {
                    constraints: { ...selectedCol.constraints, isNullable: val }
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs cursor-pointer">Unique</Label>
                <Switch 
                  checked={selectedCol.constraints.isUnique}
                  onCheckedChange={(val) => updateColumn(selectedTable.id, selectedCol.id, {
                    constraints: { ...selectedCol.constraints, isUnique: val }
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs cursor-pointer">Auto Increment</Label>
                <Switch 
                  checked={selectedCol.constraints.isAutoIncrement}
                  onCheckedChange={(val) => updateColumn(selectedTable.id, selectedCol.id, {
                    constraints: { ...selectedCol.constraints, isAutoIncrement: val }
                  })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
