"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2, Loader2 } from "lucide-react";
import { projectSettingsSchema, ProjectSettingsInput } from "@/lib/schemas";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
 * Props for ProjectSettingsDialog component.
 */
export interface ProjectSettingsDialogProps {
    /** Visibility state of the modal dialog */
    open: boolean;
    /** Callback to change modal visibility */
    onOpenChange: (open: boolean) => void;
    /** Callback fired when user clicks Delete Project inside settings */
    onDeleteRequest?: () => void;
}

/**
 * Manages project settings form inputs, column defaults, and store synchronization.
 */
export const ProjectSettingsDialog: React.FC<ProjectSettingsDialogProps> = ({ open, onOpenChange, onDeleteRequest }): React.ReactElement => {
    const projectName = useStore(state => state.projectName);
    const projectDescription = useStore(state => state.projectDescription);
    const dialect = useStore(state => state.dialect);
    const autoAddId = useStore(state => state.autoAddId);
    const autoAddTimestamps = useStore(state => state.autoAddTimestamps);

    const setProjectDetails = useStore(state => state.setProjectDetails);
    const setAutoAddId = useStore(state => state.setAutoAddId);
    const setAutoAddTimestamps = useStore(state => state.setAutoAddTimestamps);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors }
    } = useForm<ProjectSettingsInput>({
        resolver: zodResolver(projectSettingsSchema),
        defaultValues: {
            name: projectName,
            description: projectDescription,
            dialect,
            autoAddId,
            autoAddTimestamps
        }
    });

    const selectedDialect = watch("dialect");
    const watchAutoAddId = watch("autoAddId");
    const watchAutoAddTimestamps = watch("autoAddTimestamps");

    useEffect(() => {
        if (open) {
            reset({
                name: projectName,
                description: projectDescription,
                dialect,
                autoAddId,
                autoAddTimestamps
            });
        }
    }, [open, projectName, projectDescription, dialect, autoAddId, autoAddTimestamps, reset]);

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const onSubmit = async (data: ProjectSettingsInput): Promise<void> => {
        setIsSubmitting(true);
        try {
            setProjectDetails(data.name, data.description || "", data.dialect);
            setAutoAddId(data.autoAddId);
            setAutoAddTimestamps(data.autoAddTimestamps);
            onOpenChange(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <DialogTitle>Project Settings</DialogTitle>
                    <DialogDescription>
                        Configure database dialect, project details, and table creation defaults.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-2">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="settings-proj-name">Project Name</Label>
                        <Input
                            id="settings-proj-name"
                            {...register("name")}
                        />
                        {errors.name && (
                            <span className="text-[11px] font-medium text-destructive">{errors.name.message}</span>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="settings-proj-desc">Description</Label>
                        <Textarea
                            id="settings-proj-desc"
                            rows={3}
                            {...register("description")}
                        />
                        {errors.description && (
                            <span className="text-[11px] font-medium text-destructive">{errors.description.message}</span>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="settings-proj-dialect">SQL Dialect</Label>
                        <Select
                            value={selectedDialect}
                            onValueChange={val => setValue("dialect", val as ProjectSettingsInput["dialect"])}
                        >
                            <SelectTrigger id="settings-proj-dialect" className="w-full">
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

                    <div className="flex flex-col gap-3 pt-2 border-t">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                            Table Defaults
                        </span>

                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <Label htmlFor="setting-auto-id" className="text-xs cursor-pointer">Auto-add Primary Key</Label>
                                <span className="text-[11px] text-muted-foreground">Add &quot;id&quot; column to new tables</span>
                            </div>
                            <Switch
                                id="setting-auto-id"
                                aria-label="Auto-add Primary Key"
                                checked={watchAutoAddId}
                                onCheckedChange={val => setValue("autoAddId", val)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <Label htmlFor="setting-auto-timestamps" className="text-xs cursor-pointer">Auto-add Timestamps</Label>
                                <span className="text-[11px] text-muted-foreground">Add created_at &amp; updated_at</span>
                            </div>
                            <Switch
                                id="setting-auto-timestamps"
                                aria-label="Auto-add Timestamps"
                                checked={watchAutoAddTimestamps}
                                onCheckedChange={val => setValue("autoAddTimestamps", val)}
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex-col sm:flex-row items-center justify-between gap-2 border-t pt-4 mt-2">
                        {onDeleteRequest ? (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer w-full sm:w-auto"
                                onClick={() => {
                                    onOpenChange(false);
                                    onDeleteRequest();
                                }}
                                aria-label="Delete Project"
                                data-slot="button"
                            >
                                <Trash2 className="size-3.5" data-slot="icon" data-icon="inline-start" aria-hidden="true" />
                                <span>Delete Project</span>
                            </Button>
                        ) : <div />}

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="size-3.5 animate-spin" data-icon="inline-start" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
