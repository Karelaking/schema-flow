"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProjectSchema, CreateProjectInput } from "@/lib/schemas";
import { createProjectAction } from "@/app/actions/projects";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/**
 * Props for CreateProjectDialog component.
 */
export interface CreateProjectDialogProps {
    /** Visibility state of the modal dialog */
    open: boolean;
    /** Callback to change modal visibility */
    onOpenChange: (open: boolean) => void;
    /** Optional callback fired when project is successfully created */
    onSuccess?: () => void;
}

/**
 * Handles project creation form input, Zod validation, and Server Action execution.
 */
export const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({ open, onOpenChange, onSuccess }): React.ReactElement => {
    const loadProject = useStore(state => state.loadProject);
    const [submitError, setSubmitError] = useState<string | undefined>(undefined);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<CreateProjectInput>({
        resolver: zodResolver(createProjectSchema),
        defaultValues: {
            name: "",
            description: "",
            dialect: "sqlite"
        }
    });

    const selectedDialect = watch("dialect");

    const onSubmit = async (data: CreateProjectInput): Promise<void> => {
        setSubmitError(undefined);
        const result = await createProjectAction(data);

        if (result.success && result.project) {
            loadProject(result.project);
            reset();
            onOpenChange(false);
            onSuccess?.();
        }
        else {
            setSubmitError(result.error || "Failed to create project");
        }
    };

    return (
        <Dialog open={open} onOpenChange={val => {
            if (!val) {
                reset();
            }
            onOpenChange(val);
        }}>
            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                        Start a new database schema design workspace.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-2">
                    {submitError && (
                        <div className="p-2 text-xs font-medium text-destructive bg-destructive/10 rounded-md">
                            {submitError}
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="create-proj-name">Project Name</Label>
                        <Input
                            id="create-proj-name"
                            placeholder="my_database"
                            {...register("name")}
                        />
                        {errors.name && (
                            <span className="text-[11px] font-medium text-destructive">{errors.name.message}</span>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="create-proj-desc">Description</Label>
                        <Textarea
                            id="create-proj-desc"
                            placeholder="Optional project description..."
                            rows={3}
                            {...register("description")}
                        />
                        {errors.description && (
                            <span className="text-[11px] font-medium text-destructive">{errors.description.message}</span>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="create-proj-dialect">SQL Dialect</Label>
                        <Select
                            value={selectedDialect}
                            onValueChange={val => setValue("dialect", val as CreateProjectInput["dialect"])}
                        >
                            <SelectTrigger id="create-proj-dialect" className="w-full">
                                <SelectValue placeholder="Select dialect..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="sqlite">SQLite</SelectItem>
                                    <SelectItem value="postgres">PostgreSQL</SelectItem>
                                    <SelectItem value="mysql">MySQL</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        {errors.dialect && (
                            <span className="text-[11px] font-medium text-destructive">{errors.dialect.message}</span>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 mt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
                            {isSubmitting ? "Creating..." : "Create Project"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
