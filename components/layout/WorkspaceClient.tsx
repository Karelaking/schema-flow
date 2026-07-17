"use client";

import React, { useEffect, useState } from "react";
import { Menu, SlidersHorizontal, LayoutGrid, FolderTree, Plus, Database } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Explorer } from "@/components/layout/Explorer";
import { Canvas } from "@/components/canvas/Canvas";
import { Inspector } from "@/components/layout/Inspector";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatabaseDialect, ProjectMetadata, SchemaAST } from "@/packages/schema-core";

interface WorkspaceClientProps {
  initialProjectsList: ProjectMetadata[];
  initialProject: SchemaAST | null;
}

export function WorkspaceClient({ initialProjectsList, initialProject }: WorkspaceClientProps) {
  const loadProject = useStore(state => state.loadProject);
  const projectId = useStore(state => state.projectId);
  const selectedTableId = useStore(state => state.selectedTableId);
  const selectedRelationId = useStore(state => state.selectedRelationId);

  const [isEmpty, setIsEmpty] = useState(!initialProject && initialProjectsList.length === 0);
  const [leftWidth, setLeftWidth] = useState(256);
  const [rightWidth, setRightWidth] = useState(400);
  const [resizingSide, setResizingSide] = useState<'left' | 'right' | null>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'explorer' | 'canvas' | 'inspector'>('canvas');

  // Create project dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDialect, setNewDialect] = useState<DatabaseDialect>("sqlite");
  const [isCreating, setIsCreating] = useState(false);

  // Initialize Zustand store with initial server payload
  useEffect(() => {
    if (initialProject) {
      loadProject(initialProject);
      setIsEmpty(false);
    } else if (initialProjectsList.length === 0) {
      setIsEmpty(true);
    }
  }, [initialProject, initialProjectsList, loadProject]);

  const handleCreateProject = async () => {
    if (!newName.trim()) return;
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
          setIsEmpty(false);
          setNewName("");
          setNewDesc("");
          setNewDialect("sqlite");
        }
      }
    } catch (err) {
      console.error("Failed to create project:", err);
    } finally {
      setIsCreating(false);
    }
  };

  // Screen size tracking
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-switch to Inspector on mobile when a node/relation is selected
  useEffect(() => {
    if (isMobile && (selectedTableId || selectedRelationId)) {
      setActiveMobileTab('inspector');
    }
  }, [selectedTableId, selectedRelationId, isMobile]);

  // Load sidebar widths from localStorage on mount
  useEffect(() => {
    const savedLeft = localStorage.getItem("schema-flow:left-width");
    const savedRight = localStorage.getItem("schema-flow:right-width");
    if (savedLeft) setLeftWidth(parseInt(savedLeft, 10));
    if (savedRight) setRightWidth(parseInt(savedRight, 10));
  }, []);

  // Resizable split handles effect
  useEffect(() => {
    if (!resizingSide) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (resizingSide === 'left') {
        const newWidth = Math.max(180, Math.min(400, e.clientX));
        setLeftWidth(newWidth);
        localStorage.setItem("schema-flow:left-width", String(newWidth));
      } else if (resizingSide === 'right') {
        const newWidth = Math.max(320, Math.min(600, window.innerWidth - e.clientX));
        setRightWidth(newWidth);
        localStorage.setItem("schema-flow:right-width", String(newWidth));
      }
    };

    const handleMouseUp = () => {
      setResizingSide(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [resizingSide]);

  if (isEmpty || (!projectId && !initialProject)) {
    return (
      <div className="h-screen w-full flex flex-col justify-center items-center gap-6 bg-background text-foreground p-6 text-center select-none">
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
          <Plus className="size-4" />
          Create New Project
        </Button>

        {/* Create Project Dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Start a new database schema design workspace.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="empty-proj-name">Project Name</Label>
                <Input 
                  id="empty-proj-name" 
                  placeholder="my_database"
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="empty-proj-desc">Description</Label>
                <Textarea 
                  id="empty-proj-desc" 
                  placeholder="Optional database description..."
                  value={newDesc} 
                  onChange={(e) => setNewDesc(e.target.value)} 
                  rows={3}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="empty-proj-dialect">Database Dialect</Label>
                <Select 
                  value={newDialect} 
                  onValueChange={(val: any) => setNewDialect(val)}
                >
                  <SelectTrigger id="empty-proj-dialect">
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
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateProject} disabled={isCreating || !newName.trim()}>
                {isCreating ? "Creating..." : "Create Project"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-background">
      {/* Header Toolbar */}
      <Header />

      {/* Main Workspace Split */}
      <div className="flex-1 flex overflow-hidden relative min-h-0">
        {!isMobile ? (
          <>
            {/* Left Sidebar: Explorer */}
            <Explorer style={{ width: leftWidth }} />

            {/* Left Resizer Handle */}
            <div 
              className={cn(
                "w-[3px] hover:w-[5px] bg-border hover:bg-primary/50 active:bg-primary transition-all cursor-col-resize h-full select-none z-50 shrink-0",
                resizingSide === 'left' && "bg-primary w-[5px]"
              )}
              onMouseDown={() => setResizingSide('left')}
            />

            {/* Center: React Flow Canvas */}
            <div className="flex-1 relative overflow-hidden h-full" style={{ pointerEvents: resizingSide ? "none" : "auto" }}>
              <Canvas />
            </div>

            {/* Right Resizer Handle */}
            <div 
              className={cn(
                "w-[3px] hover:w-[5px] bg-border hover:bg-primary/50 active:bg-primary transition-all cursor-col-resize h-full select-none z-50 shrink-0",
                resizingSide === 'right' && "bg-primary w-[5px]"
              )}
              onMouseDown={() => setResizingSide('right')}
            />

            {/* Right Sidebar: Inspector */}
            <Inspector style={{ width: rightWidth }} />
          </>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 h-full w-full relative">
            {/* Active mobile tab content */}
            <div className="flex-1 relative min-h-0 overflow-hidden w-full h-full">
              {activeMobileTab === "explorer" && <Explorer className="w-full h-full border-0" />}
              {activeMobileTab === "canvas" && <Canvas />}
              {activeMobileTab === "inspector" && <Inspector className="w-full h-full border-0" />}
            </div>

            {/* Mobile Bottom Tab Bar */}
            <div className="h-14 bg-card/90 border-t border-border backdrop-blur-xs flex items-center justify-around z-40 shrink-0 select-none w-full">
              <button
                onClick={() => setActiveMobileTab('explorer')}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 w-20 h-full transition-colors cursor-pointer",
                  activeMobileTab === 'explorer' ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <FolderTree className="size-4.5" />
                <span className="text-[9px] tracking-wide mt-0.5">Explorer</span>
              </button>

              <button
                onClick={() => setActiveMobileTab('canvas')}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 w-20 h-full transition-colors cursor-pointer",
                  activeMobileTab === 'canvas' ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid className="size-4.5" />
                <span className="text-[9px] tracking-wide mt-0.5">Canvas</span>
              </button>

              <button
                onClick={() => setActiveMobileTab('inspector')}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 w-20 h-full transition-colors cursor-pointer",
                  activeMobileTab === 'inspector' ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <SlidersHorizontal className="size-4.5" />
                <span className="text-[9px] tracking-wide mt-0.5">Inspect</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
