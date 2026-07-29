"use client";

import React, { useState, useEffect } from "react";
import { Table, Palette, Check, Settings } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const PRESET_COLORS: { name: string; value: string }[] = [
    { name: "Blue", value: "#3b82f6" },
    { name: "Green", value: "#10b981" },
    { name: "Purple", value: "#8b5cf6" },
    { name: "Pink", value: "#ec4899" },
    { name: "Orange", value: "#f97316" },
    { name: "Slate", value: "#64748b" },
    { name: "Red", value: "#ef4444" },
    { name: "Cyan", value: "#06b6d4" },
    { name: "Indigo", value: "#6366f1" },
    { name: "Amber", value: "#f59e0b" },
    { name: "Rose", value: "#f43f5e" },
    { name: "Teal", value: "#14b8a6" },
];

export interface EditTableInfoDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

/**
 * Modal dialog for updating table information including Name, Description, and Header Color.
 */
export const EditTableInfoDialog: React.FC<EditTableInfoDialogProps> = ({
    open,
    onOpenChange,
}): React.ReactElement => {
    const isEditTableInfoOpen = useStore(state => state.isEditTableInfoOpen);
    const editTableInfoTargetId = useStore(state => state.editTableInfoTargetId);
    const setEditTableInfoOpen = useStore(state => state.setEditTableInfoOpen);
    const tables = useStore(state => state.tables);
    const updateTable = useStore(state => state.updateTable);
    const pushHistory = useStore(state => state.pushHistory);

    const isOpen = open !== undefined ? open : isEditTableInfoOpen;
    const handleClose = (newOpen: boolean): void => {
        if (onOpenChange) {
            onOpenChange(newOpen);
        } else {
            setEditTableInfoOpen(newOpen);
        }
    };

    const targetTable = editTableInfoTargetId ? tables[editTableInfoTargetId] : undefined;

    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [color, setColor] = useState<string>("#3b82f6");
    const [error, setError] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (isOpen && targetTable) {
            setName(targetTable.name || "");
            setDescription(targetTable.description || "");
            setColor(targetTable.color || "#3b82f6");
            setError(undefined);
        }
    }, [isOpen, targetTable]);

    const handleSubmit = (e: React.FormEvent): void => {
        e.preventDefault();
        if (!editTableInfoTargetId || !targetTable) {
            handleClose(false);
            return;
        }

        const trimmedName = name.trim();
        if (!trimmedName) {
            setError("Table name is required.");
            return;
        }

        // Check duplicate name across other tables
        const duplicateExists = Object.values(tables).some(
            t => t.id !== editTableInfoTargetId && t.name.toLowerCase() === trimmedName.toLowerCase()
        );

        if (duplicateExists) {
            setError(`A table with the name "${trimmedName}" already exists.`);
            return;
        }

        pushHistory();
        updateTable(editTableInfoTargetId, {
            name: trimmedName,
            description: description.trim() ? description.trim() : undefined,
            color,
        });

        handleClose(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md bg-card border shadow-lg text-card-foreground">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                        <Settings className="size-5 text-primary" />
                        <span>Edit Table Info</span>
                        {targetTable && (
                            <span className="text-xs font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground font-normal truncate max-w-40">
                                {targetTable.name}
                            </span>
                        )}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Update the table name, documentation description, and header color style.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
                    {/* Table Name Input */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="edit-table-name" className="text-xs font-semibold">
                            Table Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="edit-table-name"
                            required
                            minLength={1}
                            aria-required="true"
                            aria-invalid={Boolean(error)}
                            aria-describedby={error ? "edit-table-name-error" : undefined}
                            value={name}
                            onChange={e => {
                                setName(e.target.value);
                                if (error) setError(undefined);
                            }}
                            placeholder="e.g. users, orders, products"
                            className="h-9 text-xs"
                            autoFocus
                        />
                        {error && (
                            <span
                                id="edit-table-name-error"
                                role="alert"
                                aria-live="polite"
                                className="text-[11px] font-medium text-destructive mt-0.5"
                            >
                                {error}
                            </span>
                        )}
                    </div>

                    {/* Table Description Textarea */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="edit-table-desc" className="text-xs font-semibold">
                            Description
                        </Label>
                        <Textarea
                            id="edit-table-desc"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Documentation describing table structure or purpose..."
                            rows={3}
                            className="text-xs min-h-16 resize-none"
                        />
                    </div>

                    {/* Header Color Picker Grid */}
                    <div className="flex flex-col gap-2">
                        <Label className="text-xs font-semibold flex items-center gap-1.5">
                            <Palette className="size-3.5 text-muted-foreground" />
                            <span>Header Color</span>
                        </Label>
                        <div className="flex items-center gap-2 flex-wrap pt-1">
                            {PRESET_COLORS.map(c => (
                                <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => setColor(c.value)}
                                    className="size-7 rounded-full border border-border flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-xs"
                                    style={{ backgroundColor: c.value }}
                                    title={c.name}
                                    aria-label={`Select color ${c.name}`}
                                >
                                    {color === c.value && (
                                        <Check className="size-4 text-white drop-shadow-md" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 mt-3">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleClose(false)}
                            className="cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={!name.trim()}
                            className="cursor-pointer font-semibold"
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
