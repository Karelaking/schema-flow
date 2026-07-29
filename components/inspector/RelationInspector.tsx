"use client";

import React from "react";
import { Trash2, ArrowLeftRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { Relation } from "@/packages/schema-core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { resolveRelationFK } from "@/lib/react-flow-utils";

/**
 * Props for RelationInspector component.
 */
export interface RelationInspectorProps {
    /** Selected relation instance */
    selectedRelation: Relation;
}

/**
 * Manages foreign key relationship configuration and constraint updates.
 */
export const RelationInspector: React.FC<RelationInspectorProps> = ({ selectedRelation }): React.ReactElement => {
    const tables = useStore(state => state.tables);
    const updateRelation = useStore(state => state.updateRelation);
    const deleteRelation = useStore(state => state.deleteRelation);

    const sourceTable = tables[selectedRelation.sourceTableId];
    const targetTable = tables[selectedRelation.targetTableId];

    const resolved = resolveRelationFK(selectedRelation, tables);
    const fkTable = tables[resolved.fkTableId];
    const fkCol = fkTable?.columns.find(c => c.id === resolved.fkColumnId);
    const pkTable = tables[resolved.pkTableId];
    const pkCol = pkTable?.columns.find(c => c.id === resolved.pkColumnId);

    const handleSwapDirection = (): void => {
        updateRelation(selectedRelation.id, {
            sourceTableId: selectedRelation.targetTableId,
            sourceColumnId: selectedRelation.targetColumnId,
            targetTableId: selectedRelation.sourceTableId,
            targetColumnId: selectedRelation.sourceColumnId,
        });
    };

    return (
        <div className="flex flex-col gap-4" data-slot="relation-inspector">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider" data-slot="section-header">
                    Relationship Details
                </span>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                    onClick={() => deleteRelation(selectedRelation.id)}
                    title="Delete Relationship"
                    aria-label="Delete Relationship"
                    data-slot="button"
                >
                    <Trash2 className="size-3.5" data-slot="icon" aria-hidden="true" />
                </Button>
            </div>

            <div className="flex flex-col gap-2 p-3 bg-primary/5 rounded-md border border-primary/20 text-xs" data-slot="fk-summary">
                <div className="flex items-center justify-between font-semibold text-primary">
                    <span data-slot="label">FK Constraint Location:</span>
                    <span data-slot="value">{fkTable?.name}.{fkCol?.name}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                    <span data-slot="label">References:</span>
                    <span className="font-mono text-foreground" data-slot="value">{pkTable?.name}.{pkCol?.name}</span>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSwapDirection}
                    aria-label="Swap Relationship Direction"
                    data-slot="button"
                    className="h-7 text-xs gap-1.5 mt-1 cursor-pointer w-full"
                >
                    <ArrowLeftRight className="size-3.5" data-slot="icon" data-icon="inline-start" aria-hidden="true" />
                    <span>Swap Relationship Direction</span>
                </Button>
            </div>

            <div className="flex flex-col gap-2 p-3 bg-muted/40 rounded-md border text-xs" data-slot="table-info">
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground" data-slot="label">Source Table:</span>
                    <span className="font-semibold" data-slot="value">{sourceTable?.name || "Unknown"}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground" data-slot="label">Target Table:</span>
                    <span className="font-semibold" data-slot="value">{targetTable?.name || "Unknown"}</span>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="rel-type-select" className="text-xs" data-slot="label">Relationship Type</Label>
                <Select
                    value={selectedRelation.type}
                    onValueChange={val => {
                        if (val) {
                            updateRelation(selectedRelation.id, { type: val as Relation["type"] });
                        }
                    }}
                >
                    <SelectTrigger id="rel-type-select" className="h-8 text-xs" data-slot="select-trigger" aria-label="Relationship Type">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent data-slot="select-content">
                        <SelectGroup>
                            <SelectItem value="one-to-one" className="text-xs">One-to-One (1:1)</SelectItem>
                            <SelectItem value="one-to-many" className="text-xs">One-to-Many (1:N)</SelectItem>
                            <SelectItem value="many-to-one" className="text-xs">Many-to-One (N:1)</SelectItem>
                            <SelectItem value="many-to-many" className="text-xs">Many-to-Many (N:M)</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="on-delete-select" className="text-xs" data-slot="label">ON DELETE Action</Label>
                <Select
                    value={selectedRelation.onDelete || "no-action"}
                    onValueChange={val => {
                        if (val) {
                            updateRelation(selectedRelation.id, { onDelete: val as Relation["onDelete"] });
                        }
                    }}
                >
                    <SelectTrigger id="on-delete-select" className="h-8 text-xs font-mono" data-slot="select-trigger" aria-label="ON DELETE Action">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent data-slot="select-content">
                        <SelectGroup>
                            <SelectItem value="cascade" className="text-xs">CASCADE</SelectItem>
                            <SelectItem value="restrict" className="text-xs">RESTRICT</SelectItem>
                            <SelectItem value="set-null" className="text-xs">SET NULL</SelectItem>
                            <SelectItem value="no-action" className="text-xs">NO ACTION</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="on-update-select" className="text-xs" data-slot="label">ON UPDATE Action</Label>
                <Select
                    value={selectedRelation.onUpdate || "no-action"}
                    onValueChange={val => {
                        if (val) {
                            updateRelation(selectedRelation.id, { onUpdate: val as Relation["onUpdate"] });
                        }
                    }}
                >
                    <SelectTrigger id="on-update-select" className="h-8 text-xs font-mono" data-slot="select-trigger" aria-label="ON UPDATE Action">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent data-slot="select-content">
                        <SelectGroup>
                            <SelectItem value="cascade" className="text-xs">CASCADE</SelectItem>
                            <SelectItem value="restrict" className="text-xs">RESTRICT</SelectItem>
                            <SelectItem value="set-null" className="text-xs">SET NULL</SelectItem>
                            <SelectItem value="no-action" className="text-xs">NO ACTION</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col gap-2 pt-1">
                <Label htmlFor="rel-description-input" className="text-xs">Description</Label>
                <Input
                    id="rel-description-input"
                    value={selectedRelation.description || ""}
                    onChange={e => updateRelation(selectedRelation.id, { description: e.target.value.trim() ? e.target.value : undefined })}
                    placeholder="Documentation for this relationship..."
                    className="h-8 text-xs"
                />
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="rel-comment-input" className="text-xs">Comment</Label>
                <Input
                    id="rel-comment-input"
                    value={selectedRelation.comment || ""}
                    onChange={e => updateRelation(selectedRelation.id, { comment: e.target.value.trim() ? e.target.value : undefined })}
                    placeholder="Internal note or visual annotation..."
                    className="h-8 text-xs"
                />
            </div>
        </div>
    );
};
