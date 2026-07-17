"use client";

import React, { useState } from "react";
import { 
  Undo2, 
  Redo2, 
  Save, 
  Download, 
  Upload, 
  Database, 
  Moon, 
  Sun, 
  Settings,
  MoreVertical,
  ChevronDown,
  Check,
  Plus,
  Trash2
} from "lucide-react";
import { useStore } from "@/lib/store";
import { DatabaseDialect } from "@/packages/schema-core";
import { useTheme } from "@/providers/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  
  // Zustand Store
  const projectId = useStore(state => state.projectId);
  const projectName = useStore(state => state.projectName);
  const projectDescription = useStore(state => state.projectDescription);
  const dialect = useStore(state => state.dialect);
  const tables = useStore(state => state.tables);
  const relations = useStore(state => state.relations);
  const setProjectDetails = useStore(state => state.setProjectDetails);
  const loadProject = useStore(state => state.loadProject);
  
  const undo = useStore(state => state.undo);
  const redo = useStore(state => state.redo);
  const past = useStore(state => state.past);
  const future = useStore(state => state.future);
  const autoAddId = useStore(state => state.autoAddId);
  const autoAddTimestamps = useStore(state => state.autoAddTimestamps);
  const setAutoAddId = useStore(state => state.setAutoAddId);
  const setAutoAddTimestamps = useStore(state => state.setAutoAddTimestamps);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [editName, setEditName] = useState(projectName);
  const [editDesc, setEditDesc] = useState(projectDescription);
  const [editDialect, setEditDialect] = useState(dialect);
  const [editAutoAddId, setEditAutoAddId] = useState(autoAddId);
  const [editAutoAddTimestamps, setEditAutoAddTimestamps] = useState(autoAddTimestamps);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Projects Switcher & Creator state
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [newProjName, setNewProjName] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [newProjDialect, setNewProjDialect] = useState<DatabaseDialect>("sqlite");
  const [isCreating, setIsCreating] = useState(false);

  // Delete project state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetProject, setDeleteTargetProject] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      const data = await response.json();
      if (data.success) {
        setProjectsList(data.projects);
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    }
  };

  React.useEffect(() => {
    fetchProjects();
  }, [projectId]);

  const handleSwitchProject = async (projId: string) => {
    try {
      const response = await fetch(`/api/projects/${projId}`);
      const data = await response.json();
      if (data.success) {
        loadProject(data.project);
      }
    } catch (err) {
      console.error("Failed to switch project:", err);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjName.trim()) return;
    setIsCreating(true);
    try {
      const newProj = {
        id: `proj-${Date.now()}`,
        name: newProjName.trim(),
        description: newProjDesc.trim(),
        dialect: newProjDialect
      };
      
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProj)
      });
      const data = await response.json();
      
      if (data.success) {
        // Load the newly created project
        const projectResponse = await fetch(`/api/projects/${newProj.id}`);
        const projectData = await projectResponse.json();
        if (projectData.success) {
          loadProject(projectData.project);
          setCreateProjectOpen(false);
          // Reset form fields
          setNewProjName("");
          setNewProjDesc("");
          setNewProjDialect("sqlite");
        }
      }
    } catch (err) {
      console.error("Failed to create project:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const confirmDeleteProject = (projId: string, projName: string) => {
    setDeleteTargetProject({ id: projId, name: projName });
    setDeleteConfirmOpen(true);
  };

  const handleDeleteProject = async () => {
    if (!deleteTargetProject) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/projects/${deleteTargetProject.id}`, {
        method: "DELETE"
      });
      const data = await response.json();

      if (data.success) {
        // If deleted project is the active one, switch to another
        if (deleteTargetProject.id === projectId) {
          const remaining = projectsList.filter(p => p.id !== deleteTargetProject.id);
          if (remaining.length > 0) {
            await handleSwitchProject(remaining[0].id);
          } else {
            // No projects left — clear store so empty state renders
            loadProject({
              project: { id: "", name: "", description: "", createdAt: "", updatedAt: "" },
              settings: { dialect: "sqlite", theme: "dark" },
              tables: {},
              relations: {}
            });
          }
        }
        await fetchProjects();
        setDeleteConfirmOpen(false);
        setDeleteTargetProject(null);
      }
    } catch (err) {
      console.error("Failed to delete project:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Save schema to backend SQLite
  const handleSave = async () => {
    if (!projectId) return;
    setIsSaving(true);
    setSaveMessage("Saving database...");

    try {
      const ast = {
        project: {
          id: projectId,
          name: projectName,
          description: projectDescription,
          createdAt: new Date().toISOString(), // Fallback
          updatedAt: new Date().toISOString()
        },
        settings: {
          dialect,
          theme,
          autoAddId,
          autoAddTimestamps
        },
        tables,
        relations
      };

      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(ast)
      });

      const data = await response.json();
      if (data.success) {
        setSaveMessage("Saved successfully!");
        setTimeout(() => setSaveMessage(""), 2000);
      } else {
        setSaveMessage(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setSaveMessage(`Failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Export JSON AST
  const handleExport = () => {
    const ast = {
      project: {
        id: projectId || `proj-${Date.now()}`,
        name: projectName,
        description: projectDescription,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      settings: {
        dialect,
        theme,
        autoAddId,
        autoAddTimestamps
      },
      tables,
      relations
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(ast, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${projectName.toLowerCase().replace(/\s+/g, "_")}_schema.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON AST
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const ast = JSON.parse(event.target?.result as string);
        if (ast && ast.project && ast.tables && ast.relations) {
          loadProject(ast);
        } else {
          alert("Invalid file format. File must contain project, tables, and relations properties.");
        }
      } catch (err) {
        alert("Failed to parse JSON schema file.");
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = "";
  };

  const handleApplySettings = () => {
    setProjectDetails(editName, editDesc, editDialect);
    setAutoAddId(editAutoAddId);
    setAutoAddTimestamps(editAutoAddTimestamps);
    setSettingsOpen(false);
  };

  const openSettings = () => {
    setEditName(projectName);
    setEditDesc(projectDescription);
    setEditDialect(dialect);
    setEditAutoAddId(autoAddId);
    setEditAutoAddTimestamps(autoAddTimestamps);
    setSettingsOpen(true);
  };

  const triggerImport = () => {
    document.getElementById("hidden-import-input")?.click();
  };

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-6 text-card-foreground">
      {/* Brand & Project Metadata */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Database className="size-4" />
          </div>
          <span className="font-bold text-base tracking-tight bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent hidden sm:inline">
            Schema Flow
          </span>
        </div>
        <Separator orientation="vertical" className="h-6 hidden sm:block" />
        {/* Project Switcher Dropdown */}
        <div className="flex items-center gap-1 animate-fade-in">
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button 
                variant="ghost" 
                className="flex items-center gap-1.5 px-2 py-1 h-auto text-left hover:bg-muted/60 transition-colors shrink-0 cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-sm leading-none flex items-center gap-1">
                    {projectName}
                    <ChevronDown className="size-3 text-muted-foreground shrink-0" />
                  </span>
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
                    onClick={() => handleSwitchProject(p.id)}
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
                          confirmDeleteProject(p.id, p.name);
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
            onClick={openSettings}
            title="Project Settings"
          >
            <Settings className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Hidden file input for mobile/desktop trigger */}
      <input 
        id="hidden-import-input" 
        type="file" 
        accept=".json" 
        onChange={handleImport} 
        className="hidden" 
      />

      {/* Center Controls: Undo, Redo, Save (Desktop only) */}
      <div className="hidden md:flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="icon" 
          disabled={past.length === 0} 
          onClick={undo}
          title="Undo"
          className="size-8"
        >
          <Undo2 className="size-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          disabled={future.length === 0} 
          onClick={redo}
          title="Redo"
          className="size-8"
        >
          <Redo2 className="size-4" />
        </Button>
        <Separator orientation="vertical" className="mx-1 h-5" />
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSave}
          disabled={isSaving || !projectId}
          className="gap-2"
          title="Save Project"
        >
          <Save className="size-3.5" />
          <span className="hidden sm:inline">Save</span>
        </Button>
        {saveMessage && (
          <span className="text-xs font-medium text-muted-foreground ml-2 animate-fade-in">
            {saveMessage}
          </span>
        )}
      </div>

      {/* Right Controls: Import, Export, Theme, Help (Desktop only) */}
      <div className="hidden md:flex items-center gap-2">
        <label className="cursor-pointer">
          <input 
            type="file" 
            accept=".json" 
            onChange={handleImport} 
            className="hidden" 
          />
          <span className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-accent hover:text-accent-foreground transition-colors gap-1.5 shadow-sm" title="Import JSON Schema">
            <Upload className="size-3.5" />
            <span className="hidden sm:inline">Import</span>
          </span>
        </label>
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5" title="Export JSON Schema">
          <Download className="size-3.5" />
          <span className="hidden sm:inline">Export</span>
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="size-9">
          {theme === "dark" ? (
            <Sun className="size-4 text-amber-500 fill-amber-500/10" />
          ) : (
            <Moon className="size-4 text-indigo-500" />
          )}
        </Button>
      </div>

      {/* Mobile Controls: Clean theme switcher and collapsible menu */}
      <div className="flex md:hidden items-center gap-1 animate-fade-in">
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="size-8">
          {theme === "dark" ? (
            <Sun className="size-4 text-amber-500 fill-amber-500/10" />
          ) : (
            <Moon className="size-4 text-indigo-500" />
          )}
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="ghost" size="icon" className="size-8 cursor-pointer">
              <MoreVertical className="size-4" />
            </Button>
          } />
          <DropdownMenuContent align="end" className="w-48 bg-card border shadow-md p-1 rounded-md text-foreground">
            <DropdownMenuItem 
              onClick={handleSave} 
              disabled={isSaving || !projectId} 
              className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs rounded-sm"
            >
              <Save className="size-3.5 text-muted-foreground" />
              <span>Save Project</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1 border-t" />

            <DropdownMenuItem 
              onClick={undo} 
              disabled={past.length === 0} 
              className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs rounded-sm"
            >
              <Undo2 className="size-3.5 text-muted-foreground" />
              <span>Undo</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={redo} 
              disabled={future.length === 0} 
              className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs rounded-sm"
            >
              <Redo2 className="size-3.5 text-muted-foreground" />
              <span>Redo</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1 border-t" />

            <DropdownMenuItem 
              onClick={openSettings} 
              className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs rounded-sm"
            >
              <Settings className="size-3.5 text-muted-foreground" />
              <span>Project Settings</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1 border-t" />

            <DropdownMenuItem 
              onClick={triggerImport} 
              className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs rounded-sm"
            >
              <Upload className="size-3.5 text-muted-foreground" />
              <span>Import Schema JSON</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={handleExport} 
              className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs rounded-sm"
            >
              <Download className="size-3.5 text-muted-foreground" />
              <span>Export Schema JSON</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Project Settings Modal */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Project Settings</DialogTitle>
            <DialogDescription>
              Configure the metadata and dialect settings for this database project.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="proj-name">Project Name</Label>
              <Input 
                id="proj-name" 
                value={editName} 
                onChange={(e) => setEditName(e.target.value)} 
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="proj-desc">Description</Label>
              <Textarea 
                id="proj-desc" 
                value={editDesc} 
                onChange={(e) => setEditDesc(e.target.value)} 
                rows={3}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="proj-dialect">Database Dialect</Label>
              <Select 
                value={editDialect} 
                onValueChange={(val: any) => setEditDialect(val)}
              >
                <SelectTrigger id="proj-dialect">
                  <SelectValue placeholder="Select dialect" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sqlite">SQLite</SelectItem>
                  <SelectItem value="postgres">PostgreSQL</SelectItem>
                  <SelectItem value="mysql">MySQL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-3 mt-1 flex flex-col gap-3">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Default Node Columns
              </span>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <Label htmlFor="auto-add-id" className="text-xs font-medium cursor-pointer">Auto-add Primary Key (id)</Label>
                  <span className="text-[10px] text-muted-foreground">Add id INTEGER PRIMARY KEY to new tables</span>
                </div>
                <Switch 
                  id="auto-add-id"
                  checked={editAutoAddId}
                  onCheckedChange={setEditAutoAddId}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <Label htmlFor="auto-add-timestamps" className="text-xs font-medium cursor-pointer">Auto-add Timestamps</Label>
                  <span className="text-[10px] text-muted-foreground">Add created_at & updated_at to new tables</span>
                </div>
                <Switch 
                  id="auto-add-timestamps"
                  checked={editAutoAddTimestamps}
                  onCheckedChange={setEditAutoAddTimestamps}
                />
              </div>
            </div>
          </div>
          {/* Danger Zone */}
          <div className="border-t border-destructive/20 pt-4 mt-2">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-destructive">Danger Zone</span>
                <span className="text-[10px] text-muted-foreground">Permanently delete this project and all its data.</span>
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                className="gap-1.5 shrink-0"
                onClick={() => {
                  setSettingsOpen(false);
                  confirmDeleteProject(projectId!, projectName);
                }}
              >
                <Trash2 className="size-3.5" />
                Delete
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>Cancel</Button>
            <Button onClick={handleApplySettings}>Apply Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Project Modal */}
      <Dialog open={createProjectOpen} onOpenChange={setCreateProjectOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Start a new database schema design workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-proj-name">Project Name</Label>
              <Input 
                id="new-proj-name" 
                placeholder="my_database"
                value={newProjName} 
                onChange={(e) => setNewProjName(e.target.value)} 
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-proj-desc">Description</Label>
              <Textarea 
                id="new-proj-desc" 
                placeholder="Optional database description..."
                value={newProjDesc} 
                onChange={(e) => setNewProjDesc(e.target.value)} 
                rows={3}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-proj-dialect">Database Dialect</Label>
              <Select 
                value={newProjDialect} 
                onValueChange={(val: any) => setNewProjDialect(val)}
              >
                <SelectTrigger id="new-proj-dialect">
                  <SelectValue placeholder="Select dialect" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sqlite">SQLite</SelectItem>
                  <SelectItem value="postgres">PostgreSQL</SelectItem>
                  <SelectItem value="mysql">MySQL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateProjectOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateProject} disabled={isCreating || !newProjName.trim()}>
              {isCreating ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Project Confirmation Modal */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-foreground">{deleteTargetProject?.name}</span>?
              This action cannot be undone. All tables, relations, and generated code will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => { setDeleteConfirmOpen(false); setDeleteTargetProject(null); }}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteProject} 
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
