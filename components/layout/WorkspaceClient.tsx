"use client";

import React, { useEffect, useState, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { Canvas } from "@/components/canvas/Canvas";
import { EmptyProjectView } from "@/components/layout/EmptyProjectView";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ProjectMetadata, SchemaAST } from "@/packages/schema-core";
import dynamic from "next/dynamic";
import { saveProjectAction } from "@/app/actions/projects";
import { useAIStore } from "@/lib/ai-store";
import { Skeleton } from "@/components/ui/skeleton";

const Explorer = dynamic(
    () => import("@/components/layout/Explorer").then(mod => mod.Explorer),
    {
        ssr: false,
        loading: () => <Skeleton className="w-64 h-full rounded-none shrink-0" />,
    }
);

const Inspector = dynamic(
    () => import("@/components/layout/Inspector").then(mod => mod.Inspector),
    {
        ssr: false,
        loading: () => <Skeleton className="w-80 h-full rounded-none shrink-0" />,
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
    const enums = useStore(state => state.enums);
    const crudVersion = useStore(state => state.crudVersion);

    const [isEmpty, setIsEmpty] = useState(!initialProject && initialProjectsList.length === 0);
    const [leftWidth, setLeftWidth] = useState(256);
    const [rightWidth, setRightWidth] = useState(400);
    const [resizingSide, setResizingSide] = useState<"left" | "right" | undefined>(undefined);

    const [isMobile, setIsMobile] = useState(false);
    const [activeMobileTab, setActiveMobileTab] = useState<"explorer" | "canvas" | "inspector">("canvas");

    const isAIOpen = useAIStore(state => state.isOpen);
    const [aiDrawerWidth] = useState(380);

    const isLoadedRef = useRef(false);

    useEffect(() => {
        isLoadedRef.current = false;
        if (initialProject) {
            loadProject(initialProject);
            setIsEmpty(false);
            isLoadedRef.current = true;
        }
        else if (initialProjectsList.length === 0) {
            setIsEmpty(true);
            isLoadedRef.current = true;
        }
        else {
            isLoadedRef.current = true;
        }
    }, [initialProject, initialProjectsList, loadProject]);

    useEffect(() => {
        if (!isLoadedRef.current || !projectId || crudVersion === 0) {
            return;
        }

        const timer = setTimeout(async () => {
            try {
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
            }
            catch (err: unknown) {
                console.warn("[WorkspaceClient] Auto-save background sync postponed:", err);
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, [projectId, crudVersion]);

    useEffect(() => {
        const checkMobile = (): void => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        if (isMobile && (selectedTableId || selectedRelationId)) {
            setActiveMobileTab("inspector");
        }
    }, [selectedTableId, selectedRelationId, isMobile]);

    useEffect(() => {
        const savedLeft = localStorage.getItem("schema-flow:left-width");
        const savedRight = localStorage.getItem("schema-flow:right-width");
        if (savedLeft) {
            setLeftWidth(parseInt(savedLeft, 10));
        }
        if (savedRight) {
            setRightWidth(parseInt(savedRight, 10));
        }
    }, []);

    useEffect(() => {
        if (!resizingSide) {
            return;
        }

        const winWidth = window.innerWidth;
        let rafId: number | null = null;
        let currentLeft = leftWidth;
        let currentRight = rightWidth;

        const handleMouseMove = (e: MouseEvent): void => {
            const clientX = e.clientX;
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
            }

            rafId = requestAnimationFrame(() => {
                if (resizingSide === "left") {
                    const newWidth = Math.max(180, Math.min(400, clientX));
                    currentLeft = newWidth;
                    setLeftWidth(newWidth);
                }
                else if (resizingSide === "right") {
                    const newWidth = Math.max(320, Math.min(600, winWidth - clientX));
                    currentRight = newWidth;
                    setRightWidth(newWidth);
                }
            });
        };

        const handleMouseUp = (): void => {
            if (resizingSide === "left") {
                localStorage.setItem("schema-flow:left-width", String(currentLeft));
            }
            else if (resizingSide === "right") {
                localStorage.setItem("schema-flow:right-width", String(currentRight));
            }
            setResizingSide(undefined);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        document.body.style.userSelect = "none";
        document.body.style.cursor = "col-resize";

        return () => {
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
            }
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            document.body.style.userSelect = "";
            document.body.style.cursor = "";
        };
    }, [resizingSide, leftWidth, rightWidth]);

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
                                <Explorer style={{ width: leftWidth }} />

                                <div
                                    className={cn(
                                        "w-0.75 hover:w-1.25 bg-border hover:bg-primary/50 active:bg-primary transition-all cursor-col-resize h-full select-none z-50 shrink-0",
                                        resizingSide === "left" && "bg-primary w-1.25"
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
                                        "w-0.75 hover:w-1.25 bg-border hover:bg-primary/50 active:bg-primary transition-all cursor-col-resize h-full select-none z-50 shrink-0",
                                        resizingSide === "right" && "bg-primary w-1.25"
                                    )}
                                    onMouseDown={() => setResizingSide("right")}
                                />

                                <Inspector style={{ width: rightWidth }} />
                            </>
                        )}

                        {isAIOpen && (
                            <>
                                <div
                                    className={cn(
                                        "w-0.75 hover:w-1.25 bg-border hover:bg-violet-500/50 active:bg-violet-500 transition-all cursor-col-resize h-full select-none z-50 shrink-0"
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
