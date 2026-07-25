"use client";

import React, { useEffect, useState, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { Explorer } from "@/components/layout/Explorer";
import { Canvas } from "@/components/canvas/Canvas";
import { Inspector } from "@/components/layout/Inspector";
import { EmptyProjectView } from "@/components/layout/EmptyProjectView";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ProjectMetadata, SchemaAST } from "@/packages/schema-core";
import { saveProjectAction } from "@/app/actions/projects";
import { AgentChatDrawer } from "@/components/agent/AgentChatDrawer";
import { useAIStore } from "@/lib/ai-store";

interface WorkspaceClientProps {
  initialProjectsList: ProjectMetadata[];
  initialProject: SchemaAST | null;
}

export function WorkspaceClient({ initialProjectsList, initialProject }: WorkspaceClientProps): React.JSX.Element {
  const loadProject = useStore(state => state.loadProject);
  const projectId = useStore(state => state.projectId);
  const projectName = useStore(state => state.projectName);
  const projectDescription = useStore(state => state.projectDescription);
  const dialect = useStore(state => state.dialect);
  const theme = useStore(state => state.theme);
  const autoAddId = useStore(state => state.autoAddId);
  const autoAddTimestamps = useStore(state => state.autoAddTimestamps);
  const tables = useStore(state => state.tables);
  const relations = useStore(state => state.relations);
  const selectedTableId = useStore(state => state.selectedTableId);
  const selectedRelationId = useStore(state => state.selectedRelationId);
  const showLeftSidebar = useStore(state => state.showLeftSidebar);
  const showRightSidebar = useStore(state => state.showRightSidebar);
  const toggleLeftSidebar = useStore(state => state.toggleLeftSidebar);
  const toggleRightSidebar = useStore(state => state.toggleRightSidebar);
  const enums = useStore(state => state.enums);

  const [isEmpty, setIsEmpty] = useState(!initialProject && initialProjectsList.length === 0);
  const [leftWidth, setLeftWidth] = useState(256);
  const [rightWidth, setRightWidth] = useState(400);
  const [resizingSide, setResizingSide] = useState<'left' | 'right' | null>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'explorer' | 'canvas' | 'inspector'>('canvas');

  const isAIOpen = useAIStore(state => state.isOpen);
  const [aiDrawerWidth, setAIDrawerWidth] = useState(380);

  const isLoadedRef = useRef(false);

  // Initialize Zustand store with initial server payload
  useEffect(() => {
    if (initialProject) {
      loadProject(initialProject);
      setIsEmpty(false);
      setTimeout(() => {
        isLoadedRef.current = true;
      }, 100);
    } else if (initialProjectsList.length === 0) {
      setIsEmpty(true);
      isLoadedRef.current = true;
    } else {
      isLoadedRef.current = true;
    }
  }, [initialProject, initialProjectsList, loadProject]);

  // Debounced auto-save effect (saves changes to SQLite DB in background)
  useEffect(() => {
    if (!isLoadedRef.current || !projectId) return;

    const timer = setTimeout(async () => {
      const ast: SchemaAST = {
        project: {
          id: projectId,
          name: projectName,
          description: projectDescription,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        settings: {
          dialect,
          theme,
          autoAddId,
          autoAddTimestamps,
        },
        tables,
        relations,
        enums,
      };
      await saveProjectAction(projectId, ast);
    }, 800);

    return () => clearTimeout(timer);
  }, [projectId, projectName, projectDescription, dialect, theme, autoAddId, autoAddTimestamps, tables, relations, enums]);

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

  if (isEmpty || !projectId) {
    return <EmptyProjectView onProjectCreated={() => setIsEmpty(false)} />;
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
            {showLeftSidebar && (
              <>
                <Explorer style={{ width: leftWidth }} />

                {/* Left Resizer Handle */}
                <div 
                  className={cn(
                    "w-[3px] hover:w-[5px] bg-border hover:bg-primary/50 active:bg-primary transition-all cursor-col-resize h-full select-none z-50 shrink-0",
                    resizingSide === 'left' && "bg-primary w-[5px]"
                  )}
                  onMouseDown={() => setResizingSide('left')}
                />
              </>
            )}

            {/* Center: React Flow Canvas */}
            <div className="flex-1 relative overflow-hidden h-full" style={{ pointerEvents: resizingSide ? "none" : "auto" }}>
              <Canvas />
            </div>

            {/* Right Sidebar: Inspector */}
            {showRightSidebar && (
              <>
                {/* Right Resizer Handle */}
                <div 
                  className={cn(
                    "w-[3px] hover:w-[5px] bg-border hover:bg-primary/50 active:bg-primary transition-all cursor-col-resize h-full select-none z-50 shrink-0",
                    resizingSide === 'right' && "bg-primary w-[5px]"
                  )}
                  onMouseDown={() => setResizingSide('right')}
                />

                <Inspector style={{ width: rightWidth }} />
              </>
            )}

            {/* AI Agent Chat Drawer (desktop) */}
            {isAIOpen && (
              <>
                <div
                  className={cn(
                    "w-[3px] hover:w-[5px] bg-border hover:bg-violet-500/50 active:bg-violet-500 transition-all cursor-col-resize h-full select-none z-50 shrink-0"
                  )}
                />
                <AgentChatDrawer style={{ width: aiDrawerWidth }} />
              </>
            )}
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
            <MobileNavigation activeTab={activeMobileTab} onTabChange={setActiveMobileTab} />
          </div>
        )}
      </div>
    </div>
  );
}
