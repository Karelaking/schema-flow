"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, Check, Trash2, Plus, Settings } from "lucide-react";

import { useStore } from "@/lib/store";
import { useProjectActions } from "@/hooks/useProjectActions";
import { CreateProjectDialog } from "@/components/modals/CreateProjectDialog";
import { ProjectSettingsDialog } from "@/components/modals/ProjectSettingsDialog";
import { DeleteProjectDialog } from "@/components/modals/DeleteProjectDialog";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

/**
 * Props for ProjectSwitcher component.
 */
export interface ProjectSwitcherProps {
    className?: string;
}

/**
 * Handles project selection, dialect display, and project management dialogs.
 */
export const ProjectSwitcher: React.FC<ProjectSwitcherProps> = ({ className = "" }): React.ReactElement => {
    const projectId = useStore(state => state.projectId);
    const projectName = useStore(state => state.projectName);
    const dialect = useStore(state => state.dialect);
    const loadProject = useStore(state => state.loadProject);

    const { projectsList, fetchProjects, switchProject } = useProjectActions();

    const [createProjectOpen, setCreateProjectOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | undefined>(undefined);

    const handleProjectDeleted = async (deletedId: string): Promise<void> => {
        setDeleteTarget(undefined);
        if (deletedId === projectId) {
            const remaining = projectsList.filter(p => p.id !== deletedId);
            if (remaining.length > 0) {
                await switchProject(remaining[0].id);
            }
            else {
                loadProject({
                    project: { id: "", name: "", description: "", createdAt: "", updatedAt: "" },
                    settings: { dialect: "sqlite", theme: "dark" },
                    tables: {},
                    relations: {},
                    enums: {},
                });
            }
        }
        await fetchProjects();
    };

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <DropdownMenu>
                <DropdownMenuTrigger render={
                    <Button
                        variant="ghost"
                        className="flex items-center gap-2 px-2.5 h-9 font-normal hover:bg-muted cursor-pointer max-w-50 sm:max-w-70"
                    >
                        <div className="flex flex-col items-start min-w-0 text-left">
                            <div className="flex items-center gap-1.5 w-full">
                                <span className="font-semibold text-xs truncate">{projectName || "Untitled Schema"}</span>
                                <ChevronDown className="size-3 text-muted-foreground shrink-0" />
                            </div>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mt-0.5 hidden sm:block">
                                {dialect} Dialect
                            </span>
                        </div>
                    </Button>
                } />
                <DropdownMenuContent align="start" className="w-56 bg-card border shadow-md p-1 rounded-md text-foreground max-h-80 overflow-y-auto z-50">
                    <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Switch Project
                    </div>
                    <div className="flex flex-col">
                        {projectsList.map(p => (
                            <DropdownMenuItem
                                key={p.id}
                                onClick={() => switchProject(p.id)}
                                className="flex items-center justify-between cursor-pointer p-2 hover:bg-muted text-xs rounded-sm group"
                            >
                                <div className="flex flex-col min-w-0 flex-1 pr-2">
                                    <span className="font-medium truncate">{p.name}</span>
                                    <span className="text-[8px] text-muted-foreground uppercase">{p.dialect}</span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    {p.id === projectId && <Check className="size-3.5 text-primary" />}
                                    <button
                                        type="button"
                                        onClick={e => {
                                            e.stopPropagation();
                                            setDeleteTarget({ id: p.id, name: p.name });
                                        }}
                                        className="size-6 min-h-6 min-w-6 flex items-center justify-center text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        title="Delete project"
                                        aria-label={`Delete project ${p.name}`}
                                    >
                                        <Trash2 className="size-3" />
                                    </button>
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </div>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onClick={() => setCreateProjectOpen(true)}
                        className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs font-semibold text-primary"
                    >
                        <Plus className="size-3.5 text-primary" />
                        Create New Project
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Button
                variant="ghost"
                size="icon"
                className="size-8 cursor-pointer text-muted-foreground hover:text-foreground"
                onClick={() => setSettingsOpen(true)}
                aria-label="Project Settings"
                title="Configure Project & Dialect Settings"
            >
                <Settings className="size-4" />
            </Button>

            <CreateProjectDialog open={createProjectOpen} onOpenChange={setCreateProjectOpen} />
            <ProjectSettingsDialog
                open={settingsOpen}
                onOpenChange={setSettingsOpen}
                onDeleteRequest={projectId ? () => setDeleteTarget({ id: projectId, name: projectName }) : undefined}
            />
            <DeleteProjectDialog
                targetProject={deleteTarget}
                onOpenChange={open => {
                    if (!open) {
                        setDeleteTarget(undefined);
                    }
                }}
                onDeleted={handleProjectDeleted}
            />
        </div>
    );
};