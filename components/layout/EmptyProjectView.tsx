"use client";

import React, { useState } from "react";
import { Plus, Database } from "lucide-react";
import { DatabaseDialect } from "@/packages/schema-core";
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
 * Props for EmptyProjectView component.
 */
export interface EmptyProjectViewProps {
    onProjectCreated?: () => void;
}

/**
 * Rendered when no database projects exist, providing initial project creation workflows.
 */
export const EmptyProjectView: React.FC<EmptyProjectViewProps> = ({ onProjectCreated }): React.ReactElement => {
    const loadProject = useStore(state => state.loadProject);

    const [createOpen, setCreateOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newDialect, setNewDialect] = useState<DatabaseDialect>("sqlite");
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateProject = async (): Promise<void> => {
        if (!newName.trim()) {
            return;
        }
        setIsCreating(true);
        try {
            const newProj = {
                id: `proj-${Date.now()}`,
                name: newName.trim(),
                description: newDesc.trim(),
                dialect: newDialect
            };

            const response = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newProj)
            });
            const data = await response.json();

            if (data.success) {
                const projectResponse = await fetch(`/api/projects/${newProj.id}`);
                const projectData = await projectResponse.json();
                if (projectData.success) {
                    loadProject(projectData.project);
                    setCreateOpen(false);
                    setNewName("");
                    setNewDesc("");
                    setNewDialect("sqlite");
                    onProjectCreated?.();
                }
            }
        }
        catch (err: unknown) {
            console.error("Failed to create project:", err);
        }
        finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="h-full flex-1 w-full flex flex-col justify-center items-center gap-6 bg-background text-foreground p-6 text-center select-none">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Database className="size-8" />
            </div>
            <div className="flex flex-col gap-1.5 max-w-sm">
                <h2 className="text-lg font-bold tracking-tight">No Projects Yet</h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Create your first database schema project to get started designing tables, columns, and relationships visually.
                </p>
            </div>
            <Button
                onClick={() => setCreateOpen(true)}
                className="gap-2 px-6 cursor-pointer"
            >
                <Plus className="size-4" data-icon="inline-start" />
                Create New Project
            </Button>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="sm:max-w-106.25">
                    <DialogHeader>
                        <DialogTitle>Create New Project</DialogTitle>
                        <DialogDescription>
                            Start a new database schema design workspace.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-2">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="empty-proj-name">Project Name</Label>
                            <Input
                                id="empty-proj-name"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                placeholder="my_database"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="empty-proj-desc">Description</Label>
                            <Textarea
                                id="empty-proj-desc"
                                value={newDesc}
                                onChange={e => setNewDesc(e.target.value)}
                                placeholder="Optional project description..."
                                rows={3}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>SQL Dialect</Label>
                            <Select
                                value={newDialect}
                                onValueChange={val => setNewDialect(val as DatabaseDialect)}
                            >
                                <SelectTrigger className="w-full" aria-label="SQL Dialect">
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
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0 mt-2">
                        <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={isCreating}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateProject} disabled={!newName.trim() || isCreating} className="cursor-pointer">
                            {isCreating ? "Creating..." : "Create Project"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
