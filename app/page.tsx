"use client";

import React, { useEffect, useState } from "react";
import { Menu, SlidersHorizontal, LayoutGrid, FolderTree } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Explorer } from "@/components/layout/Explorer";
import { Canvas } from "@/components/canvas/Canvas";
import { Inspector } from "@/components/layout/Inspector";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function Page() {
  const loadProject = useStore(state => state.loadProject);
  const selectedTableId = useStore(state => state.selectedTableId);
  const selectedRelationId = useStore(state => state.selectedRelationId);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [leftWidth, setLeftWidth] = useState(256);
  const [rightWidth, setRightWidth] = useState(400);
  const [resizingSide, setResizingSide] = useState<'left' | 'right' | null>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'explorer' | 'canvas' | 'inspector'>('canvas');

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

  // Load from localStorage on mount
  useEffect(() => {
    const savedLeft = localStorage.getItem("schema-flow:left-width");
    const savedRight = localStorage.getItem("schema-flow:right-width");
    if (savedLeft) setLeftWidth(parseInt(savedLeft, 10));
    if (savedRight) setRightWidth(parseInt(savedRight, 10));
  }, []);

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

    // Prevent text selection and force cursor while dragging
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [resizingSide]);

  useEffect(() => {
    async function initializeProject() {
      try {
        setLoading(true);
        // 1. Fetch available projects
        const response = await fetch("/api/projects");
        const data = await response.json();
        
        if (data.success && data.projects.length > 0) {
          // Load the most recent project
          const latestProj = data.projects[0];
          const projectResponse = await fetch(`/api/projects/${latestProj.id}`);
          const projectData = await projectResponse.json();
          
          if (projectData.success) {
            loadProject(projectData.project);
          } else {
            setError("Failed to load project details");
          }
        } else {
          // No projects exist, create a default ecommerce project
          const defaultProj = {
            id: `proj-${Date.now()}`,
            name: "e-commerce_db",
            description: "Default visual database schema for e-commerce applications",
            dialect: "sqlite"
          };
          
          const createResponse = await fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(defaultProj)
          });
          const createData = await createResponse.json();
          
          if (createData.success) {
            // Load the newly created default project structure
            const newProjectResponse = await fetch(`/api/projects/${defaultProj.id}`);
            const newProjectData = await newProjectResponse.json();
            if (newProjectData.success) {
              loadProject(newProjectData.project);
            } else {
              setError("Failed to load newly created project");
            }
          } else {
            setError("Failed to initialize default project");
          }
        }
      } catch (err: any) {
        setError(`Initialization error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    initializeProject();
  }, [loadProject]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col justify-center items-center gap-3 bg-background text-foreground">
        <div className="animate-spin size-8 rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
          Initializing Workspace...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex flex-col justify-center items-center gap-3 bg-background text-foreground p-6 text-center">
        <div className="text-destructive font-semibold">Workspace Loading Failed</div>
        <p className="text-xs text-muted-foreground max-w-sm">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-xs font-semibold px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 animate-fade-in"
        >
          Retry Load
        </button>
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
