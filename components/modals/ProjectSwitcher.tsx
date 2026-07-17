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

export interface ProjectSwitcherProps {
  className?: string;
}

/**
 * Isolated Client Component: Handles project selection, dialect display, and project management dialogs.
 */
export function ProjectSwitcher({ className = "" }: ProjectSwitcherProps): React.JSX.Element {
  const projectId = useStore(state => state.projectId);
  const projectName = useStore(state => state.projectName);
  const dialect = useStore(state => state.dialect);
  const loadProject = useStore(state => state.loadProject);

  const { projectsList, fetchProjects, switchProject } = useProjectActions();

  // Internal modal visibility states
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Sync projects list whenever active project ID changes
  useEffect(() => {
    fetchProjects();
  }, [projectId, fetchProjects]);

  const handleProjectDeleted = async (deletedId: string): Promise<void> => {
    setDeleteTarget(null);
    if (deletedId === projectId) {
      const remaining = projectsList.filter(p => p.id !== deletedId);
      if (remaining.length > 0) {
        await switchProject(remaining[0].id);
      } else {
        loadProject({
          project: { id: "", name: "", description: "", createdAt: "", updatedAt: "" },
          settings: { dialect: "sqlite", theme: "dark" },
          tables: {},
          relations: {}
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
            className="flex items-center gap-2 px-2.5 h-9 font-normal hover:bg-muted cursor-pointer max-w-[200px] sm:max-w-[280px]"
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget({ id: p.id, name: p.name });
                    }}
                    className="size-5 flex items-center justify-center rounded-sm opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all cursor-pointer"
                    title={`Delete ${p.name}`}
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              </DropdownMenuItem>
            ))}
          </div>

          <DropdownMenuSeparator className="my-1 border-t" />

          <DropdownMenuItem 
            onClick={() => setCreateProjectOpen(true)}
            className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs font-semibold text-primary rounded-sm"
          >
            <Plus className="size-3.5" />
            Create New Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button 
        variant="ghost" 
        size="icon" 
        className="size-7 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
        onClick={() => setSettingsOpen(true)}
        title="Project Settings"
      >
        <Settings className="size-3.5" />
      </Button>

      {/* Project Management Dialogs */}
      <CreateProjectDialog 
        open={createProjectOpen} 
        onOpenChange={setCreateProjectOpen} 
        onSuccess={fetchProjects}
      />

      <ProjectSettingsDialog 
        open={settingsOpen} 
        onOpenChange={setSettingsOpen}
        onDeleteRequest={() => {
          if (projectId) {
            setDeleteTarget({ id: projectId, name: projectName });
          }
        }}
      />

      <DeleteProjectDialog 
        targetProject={deleteTarget} 
        onOpenChange={(val) => { if (!val) setDeleteTarget(null); }} 
        onDeleted={handleProjectDeleted}
      />
    </div>
  );
}