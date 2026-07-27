"use client";

import React, { useState } from "react";
import { deleteProjectAction } from "@/app/actions/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

/**
 * Props for DeleteProjectDialog component.
 */
export interface DeleteProjectDialogProps {
    /** Target project metadata to delete */
    targetProject?: { id: string; name: string };
    /** Callback to change modal visibility */
    onOpenChange: (open: boolean) => void;
    /** Optional callback fired after successful deletion */
    onDeleted?: (deletedId: string) => void;
}

/**
 * Manages two-step confirmation dialog and server execution for project deletion.
 */
export const DeleteProjectDialog: React.FC<DeleteProjectDialogProps> = ({ targetProject, onOpenChange, onDeleted }): React.ReactElement => {
    const [typedName, setTypedName] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);

    const isMatch = targetProject ? typedName.trim() === targetProject.name.trim() : false;

    const handleClose = (open: boolean): void => {
        if (!open) {
            setTypedName("");
            setError(undefined);
        }
        onOpenChange(open);
    };

    const handleDelete = async (): Promise<void> => {
        if (!targetProject || !isMatch) {
            return;
        }
        setIsDeleting(true);
        setError(undefined);

        const result = await deleteProjectAction(targetProject.id, typedName);

        if (result.success) {
            setTypedName("");
            onOpenChange(false);
            onDeleted?.(targetProject.id);
        }
        else {
            setError(result.error || "Failed to delete project");
        }
        setIsDeleting(false);
    };

    return (
        <Dialog open={Boolean(targetProject)} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-105">
                <DialogHeader>
                    <DialogTitle className="text-destructive font-semibold">Delete Project (2-Step Verification)</DialogTitle>
                    <DialogDescription className="text-xs">
                        Are you sure you want to permanently delete{" "}
                        <strong className="text-foreground">{targetProject?.name}</strong>?
                        This action cannot be undone. All tables, relations, and generated code will be erased.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2 py-2">
                    <label className="text-xs font-medium text-muted-foreground block">
                        To confirm, type <span className="font-semibold text-foreground select-all">&quot;{targetProject?.name}&quot;</span> below:
                    </label>
                    <Input
                        type="text"
                        value={typedName}
                        onChange={e => setTypedName(e.target.value)}
                        placeholder={targetProject?.name}
                        className="h-9 text-xs"
                    />
                </div>

                {error && (
                    <div className="p-2 text-xs font-medium text-destructive bg-destructive/10 rounded-md">
                        {error}
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0 mt-2">
                    <Button variant="outline" onClick={() => handleClose(false)} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting || !isMatch}
                        className="cursor-pointer"
                    >
                        {isDeleting ? "Deleting..." : "Permanently Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
