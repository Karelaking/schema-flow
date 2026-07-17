"use client";

import React, { useEffect, useState } from "react";
import { 
  Database, 
  Save, 
  Download, 
  Upload, 
  Undo2, 
  Redo2, 
  Sun, 
  Moon, 
  Settings, 
  MoreVertical, 
  ChevronDown, 
  Check, 
  Plus, 
  Trash2 
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useTheme } from "@/providers/ThemeProvider";
import { useProjectActions } from "@/hooks/useProjectActions";
import { CreateProjectDialog } from "@/components/modals/CreateProjectDialog";
import { ProjectSettingsDialog } from "@/components/modals/ProjectSettingsDialog";
import { DeleteProjectDialog } from "@/components/modals/DeleteProjectDialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

/**
 * Top-level Header Component: Coordinates project switching, undo/redo, saving, export/import, theme toggling, and dialog triggers.
 */
export function Header() {
  const { theme, toggleTheme } = useTheme();
  
  // Zustand Store Selectors
  const projectId = useStore(state => state.projectId);
  const projectName = useStore(state => state.projectName);
  const dialect = useStore(state => state.dialect);
  const loadProject = useStore(state => state.loadProject);
  const undo = useStore(state => state.undo);
  const redo = useStore(state => state.redo);
  const past = useStore(state => state.past);
  const future = useStore(state => state.future);

  // Custom Hook for Server Actions & project persistence
  const {
    projectsList,
    isSaving,
    saveMessage,
    fetchProjects,
    switchProject,
    saveProject,
    exportSchema,
    importSchema
  } = useProjectActions();

  // Modal Visibility States
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Fetch project list when active project changes
  useEffect(() => {
    fetchProjects();
  }, [projectId, fetchProjects]);

  const triggerImport = () => {
    document.getElementById("header-import-file-input")?.click();
  };

  const handleProjectDeleted = async (deletedId: string) => {
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
    <header className="flex h-14 items-center justify-between border-b bg-card px-6 text-card-foreground">
      {/* Left: Project Branding & Switcher */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-xs">
            <Database className="size-4" />
          </div>
          <span className="font-bold text-sm tracking-tight hidden sm:inline-block">Schema Flow</span>
        </div>

        <Separator orientation="vertical" className="h-6 hidden sm:block" />

        {/* Project Switcher Dropdown */}
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="ghost" className="flex items-center gap-2 px-2.5 h-9 font-normal hover:bg-muted cursor-pointer max-w-[200px] sm:max-w-[280px]">
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
        </div>
      </div>

      {/* Hidden file input for import */}
      <input 
        id="header-import-file-input" 
        type="file" 
        accept=".json" 
        onChange={importSchema} 
        className="hidden" 
      />

      {/* Center Controls: Undo, Redo, Save (Desktop) */}
      <div className="hidden md:flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="icon" 
          disabled={past.length === 0} 
          onClick={undo}
          title="Undo"
          className="size-8 cursor-pointer"
        >
          <Undo2 className="size-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          disabled={future.length === 0} 
          onClick={redo}
          title="Redo"
          className="size-8 cursor-pointer"
        >
          <Redo2 className="size-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-4 mx-1" />

        <Button 
          variant="default" 
          size="sm" 
          className="gap-1.5 h-8 text-xs cursor-pointer" 
          onClick={saveProject}
          disabled={isSaving}
        >
          <Save className="size-3.5" />
          {isSaving ? "Saving..." : "Save Database"}
        </Button>

        {saveMessage && (
          <span className="text-xs font-medium text-emerald-500 ml-2 animate-fade-in">
            {saveMessage}
          </span>
        )}
      </div>

      {/* Right Controls: Export, Import, Theme Toggle */}
      <div className="flex items-center gap-1 sm:gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={exportSchema}
          title="Export Schema JSON"
          className="hidden lg:flex gap-1.5 h-8 text-xs cursor-pointer"
        >
          <Download className="size-3.5" />
          Export JSON
        </Button>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={triggerImport}
          title="Import Schema JSON"
          className="hidden lg:flex gap-1.5 h-8 text-xs cursor-pointer"
        >
          <Upload className="size-3.5" />
          Import JSON
        </Button>

        <Separator orientation="vertical" className="h-4 mx-1 hidden lg:block" />

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="size-8 cursor-pointer"
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>

        {/* Mobile Actions Menu Dropdown */}
        <div className="flex lg:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="ghost" size="icon" className="size-8 cursor-pointer">
                <MoreVertical className="size-4" />
              </Button>
            } />
            <DropdownMenuContent align="end" className="w-48 bg-card border shadow-md p-1 rounded-md text-foreground z-50">
              <DropdownMenuItem 
                onClick={saveProject}
                disabled={isSaving}
                className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs font-semibold"
              >
                <Save className="size-3.5" />
                Save Database
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 border-t" />

              <DropdownMenuItem 
                onClick={exportSchema}
                className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs"
              >
                <Download className="size-3.5" />
                Export JSON
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={triggerImport}
                className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs"
              >
                <Upload className="size-3.5" />
                Import JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Modular Dialog Components */}
      <CreateProjectDialog 
        open={createProjectOpen} 
        onOpenChange={setCreateProjectOpen} 
        onSuccess={fetchProjects}
      />

      <ProjectSettingsDialog 
        open={settingsOpen} 
        onOpenChange={setSettingsOpen}
        onDeleteRequest={() => setDeleteTarget({ id: projectId!, name: projectName })}
      />

      <DeleteProjectDialog 
        targetProject={deleteTarget} 
        onOpenChange={(val) => { if (!val) setDeleteTarget(null); }} 
        onDeleted={handleProjectDeleted}
      />
    </header>
  );
}
