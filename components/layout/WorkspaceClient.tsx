"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Canvas } from "@/components/canvas/Canvas";
import { EmptyProjectView } from "@/components/layout/EmptyProjectView";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ProjectMetadata, SchemaAST } from "@/packages/schema-core";
import dynamic from "next/dynamic";
import { useAIStore } from "@/lib/ai-store";
import { Skeleton } from "@/components/ui/skeleton";
import { usePanelResizing } from "@/hooks/usePanelResizing";
import { useAutoSave } from "@/hooks/useAutoSave";

const Explorer = dynamic(
    () => import("@/components/layout/Explorer").then(mod => mod.Explorer),
    {
        ssr: false,
        loading: () => <Skeleton className="w-full h-full rounded-none shrink-0" />,
    }
);

const Inspector = dynamic(
    () => import("@/components/layout/Inspector").then(mod => mod.Inspector),
    {
        ssr: false,
        loading: () => <Skeleton className="w-full h-full rounded-none shrink-0" />,
    }
);

const AgentChatDrawer = dynamic(
    () => import("@/components/agent/AgentChatDrawer").then(mod => mod.AgentChatDrawer),
    { ssr: false }
);

/**
 * Props for WorkspaceClient component.
 */
interface WorkspaceClientProps {
    initialProjectsList: ProjectMetadata[];
    initialProject?: SchemaAST;
}

/**
 * Main client component for managing workspace layouts, sidebars, and auto-save.
 */
export const WorkspaceClient: React.FC<WorkspaceClientProps> = ({ initialProjectsList, initialProject }): React.ReactElement => {
    const loadProject = useStore(state => state.loadProject);
    const projectId = useStore(state => state.projectId);
    const selectedTableId = useStore(state => state.selectedTableId);
    const selectedRelationId = useStore(state => state.selectedRelationId);
    const showLeftSidebar = useStore(state => state.showLeftSidebar);
    const showRightSidebar = useStore(state => state.showRightSidebar);

    const [isEmpty, setIsEmpty] = useState(!initialProject && initialProjectsList.length === 0);
    const [isMobile, setIsMobile] = useState(false);
    const [activeMobileTab, setActiveMobileTab] = useState<"explorer" | "canvas" | "inspector">("canvas");

    const isAIOpen = useAIStore(state => state.isOpen);
    const [aiDrawerWidth] = useState(380);
    const [isLoaded, setIsLoaded] = useState(false);

    // Dynamic Sidebar Resizing and settings state hook
    const { leftWidth, rightWidth, resizingSide, setResizingSide } = usePanelResizing();

    // Load initial project properties
    useEffect(() => {
        setIsLoaded(false);
        if (initialProject) {
            loadProject(initialProject);
            setIsEmpty(false);
            setIsLoaded(true);
        }
        else if (initialProjectsList.length === 0) {
            setIsEmpty(true);
            setIsLoaded(true);
        }
        else {
            setIsLoaded(true);
        }
    }, [initialProject, initialProjectsList, loadProject]);

    // Background Auto-Save Hook
    useAutoSave(isLoaded);

    // Responsive Mobile layout detection
    useEffect(() => {
        const checkMobile = (): void => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Redirect to inspector tab on table selection (Mobile UI only)
    useEffect(() => {
        if (isMobile && (selectedTableId || selectedRelationId)) {
            setActiveMobileTab("inspector");
        }
    }, [selectedTableId, selectedRelationId, isMobile]);

    if (isEmpty || !projectId) {
        return <EmptyProjectView onProjectCreated={() => setIsEmpty(false)} />;
    }

    return (
        <div className="h-screen w-full flex flex-col overflow-hidden bg-background">
            <Header />

            <div className="flex-1 flex overflow-hidden relative min-h-0">
                {!isMobile ? (
                    <>
                        {showLeftSidebar && (
                            <>
                                <div style={{ width: leftWidth }} className="h-full shrink-0 flex flex-col min-w-0">
                                    <Explorer style={{ width: leftWidth }} />
                                </div>

                                <div
                                    className={cn(
                                        "w-1 bg-border hover:bg-primary/50 active:bg-primary transition-colors duration-150 cursor-col-resize h-full select-none z-50 shrink-0",
                                        resizingSide === "left" && "bg-primary"
                                    )}
                                    onMouseDown={() => setResizingSide("left")}
                                />
                            </>
                        )}

                        <div className="flex-1 relative overflow-hidden h-full" style={{ pointerEvents: resizingSide ? "none" : "auto" }}>
                            <Canvas />
                        </div>

                        {showRightSidebar && (
                            <>
                                <div
                                    className={cn(
                                        "w-1 bg-border hover:bg-primary/50 active:bg-primary transition-colors duration-150 cursor-col-resize h-full select-none z-50 shrink-0",
                                        resizingSide === "right" && "bg-primary"
                                    )}
                                    onMouseDown={() => setResizingSide("right")}
                                />

                                <div style={{ width: rightWidth }} className="h-full shrink-0 flex flex-col min-w-0">
                                    <Inspector style={{ width: rightWidth }} />
                                </div>
                            </>
                        )}

                        {isAIOpen && (
                            <>
                                <div
                                    className={cn(
                                        "w-1 bg-border hover:bg-violet-500/50 active:bg-violet-500 transition-colors duration-150 cursor-col-resize h-full select-none z-50 shrink-0"
                                    )}
                                />
                                <AgentChatDrawer style={{ width: aiDrawerWidth }} />
                            </>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col min-h-0 h-full w-full relative">
                        <div className="flex-1 relative min-h-0 overflow-hidden w-full h-full">
                            {activeMobileTab === "explorer" && <Explorer className="w-full h-full border-0" />}
                            {activeMobileTab === "canvas" && <Canvas />}
                            {activeMobileTab === "inspector" && <Inspector className="w-full h-full border-0" />}
                        </div>

                        <MobileNavigation activeTab={activeMobileTab} onTabChange={setActiveMobileTab} />
                    </div>
                )}
            </div>
        </div>
    );
};
