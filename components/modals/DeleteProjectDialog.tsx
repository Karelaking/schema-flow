"use client";

import React, { useState } from "react";
import { deleteProjectAction } from "@/app/actions/projects";
import { Button } from "@/components/ui/button";
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
 * Manages confirmation dialog and execution for project deletion.
 */
export const DeleteProjectDialog: React.FC<DeleteProjectDialogProps> = ({ targetProject, onOpenChange, onDeleted }): React.ReactElement => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);

    const handleDelete = async (): Promise<void> => {
        if (!targetProject) {
            return;
        }
        setIsDeleting(true);
        setError(undefined);

        const result = await deleteProjectAction(targetProject.id);

        if (result.success) {
            onOpenChange(false);
            onDeleted?.(targetProject.id);
        }
        else {
            setError(result.error || "Failed to delete project");
        }
        setIsDeleting(false);
    };

    return (
        <Dialog open={Boolean(targetProject)} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle className="text-destructive">Delete Project</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to permanently delete{" "}
                        <span className="font-semibold text-foreground">{targetProject?.name}</span>?
                        This action cannot be undone. All tables, relations, and generated code will be lost.
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="p-2 text-xs font-medium text-destructive bg-destructive/10 rounded-md">
                        {error}
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0 mt-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="cursor-pointer"
                    >
                        {isDeleting ? "Deleting..." : "Delete Project"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
