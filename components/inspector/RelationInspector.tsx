"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { Relation } from "@/packages/schema-core";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface RelationInspectorProps {
  /** Selected relation instance */
  selectedRelation: Relation;
}

/**
 * SRP Component: Manages foreign key relationship configuration and constraint updates.
 */
export function RelationInspector({ selectedRelation }: RelationInspectorProps) {
  const tables = useStore(state => state.tables);
  const updateRelation = useStore(state => state.updateRelation);
  const deleteRelation = useStore(state => state.deleteRelation);

  const sourceTable = tables[selectedRelation.sourceTableId];
  const targetTable = tables[selectedRelation.targetTableId];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Relationship Details
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
          onClick={() => deleteRelation(selectedRelation.id)}
          title="Delete Relationship"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      <div className="flex flex-col gap-2 p-3 bg-muted/40 rounded-md border text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Source Table:</span>
          <span className="font-semibold">{sourceTable?.name || "Unknown"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Target Table:</span>
          <span className="font-semibold">{targetTable?.name || "Unknown"}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-xs">Relationship Type</Label>
        <Select 
          value={selectedRelation.type} 
          onValueChange={(val: any) => { if (val) updateRelation(selectedRelation.id, { type: val }); }}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="one-to-one">One-to-One (1:1)</SelectItem>
            <SelectItem value="one-to-many">One-to-Many (1:N)</SelectItem>
            <SelectItem value="many-to-one">Many-to-One (N:1)</SelectItem>
            <SelectItem value="many-to-many">Many-to-Many (N:M)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-xs">On Delete Constraint</Label>
        <Select 
          value={selectedRelation.onDelete || "no-action"} 
          onValueChange={(val: any) => { if (val) updateRelation(selectedRelation.id, { onDelete: val }); }}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Select constraint" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cascade">CASCADE</SelectItem>
            <SelectItem value="restrict">RESTRICT</SelectItem>
            <SelectItem value="set-null">SET NULL</SelectItem>
            <SelectItem value="no-action">NO ACTION</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-xs">On Update Constraint</Label>
        <Select 
          value={selectedRelation.onUpdate || "no-action"} 
          onValueChange={(val: any) => { if (val) updateRelation(selectedRelation.id, { onUpdate: val }); }}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Select constraint" />
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
  );
}
