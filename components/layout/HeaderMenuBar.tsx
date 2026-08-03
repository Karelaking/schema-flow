"use client";

import React, { useState, useEffect } from "react";
import {
    Menu,
    Folder,
    FolderOpen,
    Plus,
    Settings,
    Save,
    Download,
    Upload,
    Image as ImageIcon,
    Undo2,
    Redo2,
    LayoutGrid,
    PanelLeft,
    PanelRight,
    Sun,
    Moon,
    Sparkles,
    Check,
    Trash2,
    FileText,
    Edit3,
    Eye,
    Wrench,
    Table,
    HardDrive,
    Lock,
    Share2,
    RefreshCw,
    Server,
    Key,
    GitBranch,
} from "lucide-react";

import { useStore } from "@/lib/store";
import { useAIStore } from "@/lib/ai-store";
import { useTheme } from "@/providers/ThemeProvider";
import { useProjectActions } from "@/hooks/useProjectActions";
import { exportCanvasToPng } from "@/lib/export-image";

import dynamic from "next/dynamic";
import { StorageModeIndicator } from "@/components/layout/StorageModeIndicator";
import { Button } from "@/components/ui/button";

const CreateProjectDialog = dynamic(
    () => import("@/components/modals/CreateProjectDialog").then(m => m.CreateProjectDialog),
    { ssr: false }
);
const ProjectSettingsDialog = dynamic(
    () => import("@/components/modals/ProjectSettingsDialog").then(m => m.ProjectSettingsDialog),
    { ssr: false }
);
const DeleteProjectDialog = dynamic(
    () => import("@/components/modals/DeleteProjectDialog").then(m => m.DeleteProjectDialog),
    { ssr: false }
);
const SaveLotusDialog = dynamic(
    () => import("@/components/modals/SaveLotusDialog").then(m => m.SaveLotusDialog),
    { ssr: false }
);
const OpenLotusDialog = dynamic(
    () => import("@/components/modals/OpenLotusDialog").then(m => m.OpenLotusDialog),
    { ssr: false }
);
const CustomDbConnectionDialog = dynamic(
    () => import("@/components/modals/CustomDbConnectionDialog").then(m => m.CustomDbConnectionDialog),
    { ssr: false }
);
const OpenWorkspaceFolderModal = dynamic(
    () => import("@/components/modals/OpenWorkspaceFolderModal").then(m => m.OpenWorkspaceFolderModal),
    { ssr: false }
);
import { Kbd } from "@/components/ui/kbd";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";

/**
 * Props for HeaderMenuBar component.
 */
export interface HeaderMenuBarProps {
    className?: string;
}

/**
 * Responsive application menu bar providing File, Edit, View, and Tools submenus.
 */
export const HeaderMenuBar: React.FC<HeaderMenuBarProps> = ({ className = "" }): React.ReactElement => {
    const projectId = useStore(state => state.projectId);
    const projectName = useStore(state => state.projectName);
    const tables = useStore(state => state.tables);
    const addTable = useStore(state => state.addTable);
    const loadProject = useStore(state => state.loadProject);
    const undo = useStore(state => state.undo);
    const redo = useStore(state => state.redo);
    const past = useStore(state => state.past);
    const future = useStore(state => state.future);
    const autoLayoutTables = useStore(state => state.autoLayoutTables);
    const showLeftSidebar = useStore(state => state.showLeftSidebar);
    const showRightSidebar = useStore(state => state.showRightSidebar);
    const toggleLeftSidebar = useStore(state => state.toggleLeftSidebar);
    const toggleRightSidebar = useStore(state => state.toggleRightSidebar);

    const { theme, toggleTheme } = useTheme();
    const toggleAIDrawer = useAIStore(state => state.toggleDrawer);
    const isAIOpen = useAIStore(state => state.isOpen);

    const {
        projectsList,
        fetchProjects,
        switchProject,
        isSaving,
        exportSchema,
        importSchema,
        saveProject,
    } = useProjectActions();

    const [createProjectOpen, setCreateProjectOpen] = useState<boolean>(false);
    const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | undefined>(undefined);
    const [saveLotusOpen, setSaveLotusOpen] = useState<boolean>(false);
    const [openLotusOpen, setOpenLotusOpen] = useState<boolean>(false);
    const [customDbOpen, setCustomDbOpen] = useState<boolean>(false);
    const [workspaceFolderModalOpen, setWorkspaceFolderModalOpen] = useState<boolean>(false);

    const saveLotusFile = useStore(state => state.saveLotusFile);
    const saveLotusPortable = useStore(state => state.saveLotusPortable);
    const convertToLotus = useStore(state => state.convertToLotus);
    const importLotusToDatabase = useStore(state => state.importLotusToDatabase);
    const storageMode = useStore(state => state.storageMode);

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

    const triggerImport = (): void => {
        document.getElementById("header-menubar-import-file-input")?.click();
    };

    const setCreateTableOpen = useStore(state => state.setCreateTableOpen);

    const handleAddTable = (): void => {
        setCreateTableOpen(true);
    };

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <input
                id="header-menubar-import-file-input"
                type="file"
                accept=".json"
                aria-label="Import Schema JSON File"
                onChange={importSchema}
                className="hidden"
            />

            {/* Desktop View: Horizontal Menu Bar */}
            <div className="hidden md:flex items-center gap-0.5 sm:gap-1 md:absolute md:left-1/2 md:-translate-x-1/2">
                {/* File Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger render={
                        <Button variant="ghost" size="sm" aria-label="File menu" data-slot="button" className="h-8 px-2 sm:px-2.5 gap-1.5 text-xs font-medium cursor-pointer hover:bg-muted">
                            <Folder className="size-3.5 text-muted-foreground" data-slot="icon" data-icon="inline-start" aria-hidden="true" />
                            <span>File</span>
                        </Button>
                    } />
                    <DropdownMenuContent align="start" className="w-56 bg-card border shadow-md p-1 rounded-md text-foreground z-50">
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs">
                                <FolderOpen className="size-3.5 text-muted-foreground" />
                                <span>Switch Project</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-56 bg-card border shadow-md p-1 rounded-md text-foreground max-h-80 overflow-y-auto z-50">
                                <DropdownMenuGroup>
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
                                </DropdownMenuGroup>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>

                        <DropdownMenuGroup>
                            <DropdownMenuItem
                                onClick={() => setCreateProjectOpen(true)}
                                className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs"
                            >
                                <Plus className="size-3.5 text-muted-foreground" />
                                <span>New Project</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={handleAddTable}
                                className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs font-medium text-primary"
                            >
                                <Table className="size-3.5 text-primary" />
                                <span>Create New Table</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() => setSettingsOpen(true)}
                                className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs"
                            >
                                <Settings className="size-3.5 text-muted-foreground" />
                                <span>Project Settings</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() => setCustomDbOpen(true)}
                                className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs font-medium text-primary"
                            >
                                <Server className="size-3.5 text-primary" />
                                <span>Database Credentials (BYO Key)</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                onClick={() => setSaveLotusOpen(true)}
                                className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs font-medium"
                            >
                                <HardDrive className="size-3.5 text-emerald-500" />
                                <span>Save to Disk</span>
                                <DropdownMenuShortcut><Kbd>Ctrl+Shift+S</Kbd></DropdownMenuShortcut>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() => setOpenLotusOpen(true)}
                                className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs font-medium"
                            >
                                <FolderOpen className="size-3.5 text-emerald-500" />
                                <span>Open File from Disk</span>
                                <DropdownMenuShortcut><Kbd>Ctrl+Shift+O</Kbd></DropdownMenuShortcut>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() => setWorkspaceFolderModalOpen(true)}
                                className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs font-semibold text-emerald-500"
                            >
                                <Folder className="size-3.5 text-emerald-500" />
                                <span>Open Workspace</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={saveLotusPortable}
                                className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs"
                            >
                                <Share2 className="size-3.5 text-muted-foreground" />
                                <span>Export Portable .lotus</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {storageMode === "database" ? (
                                <DropdownMenuItem
                                    onClick={convertToLotus}
                                    className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs"
                                >
                                    <RefreshCw className="size-3.5 text-muted-foreground" />
                                    <span>Convert to .lotus File Mode</span>
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem
                                    onClick={importLotusToDatabase}
                                    className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs"
                                >
                                    <RefreshCw className="size-3.5 text-muted-foreground" />
                                    <span>Import to SQLite Database</span>
                                </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                onClick={saveProject}
                                disabled={isSaving}
                                className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs font-medium"
                            >
                                <Save className="size-3.5 text-primary" />
                                <span>{isSaving ? "Saving..." : "Save Database"}</span>
                                <DropdownMenuShortcut><Kbd>Ctrl+S</Kbd></DropdownMenuShortcut>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                onClick={triggerImport}
                                className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs"
                            >
                                <Upload className="size-3.5 text-muted-foreground" />
                                <span>Import JSON</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={exportSchema}
                                className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs"
                            >
                                <Download className="size-3.5 text-muted-foreground" />
                                <span>Export JSON</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() => exportCanvasToPng(projectName)}
                                className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs"
                            >
                                <ImageIcon className="size-3.5 text-muted-foreground" aria-hidden="true" />
                                <span>Export Diagram (PNG)</span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Edit Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger render={
                        <Button variant="ghost" size="sm" aria-label="Edit menu" data-slot="button" className="h-8 px-2 sm:px-2.5 gap-1.5 text-xs font-medium cursor-pointer hover:bg-muted">
                            <Edit3 className="size-3.5 text-muted-foreground" data-slot="icon" data-icon="inline-start" aria-hidden="true" />
                            <span>Edit</span>
                        </Button>
                    } />
                    <DropdownMenuContent align="start" className="w-52 bg-card border shadow-md p-1 rounded-md text-foreground z-50">
                        <DropdownMenuGroup>
                            <DropdownMenuItem
                                onClick={handleAddTable}
                                className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs font-medium text-primary"
                            >
                                <Table className="size-3.5 text-primary" />
                                <span>Create New Table</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                onClick={undo}
                                disabled={past.length === 0}
                                className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs"
                            >
                                <Undo2 className="size-3.5 text-muted-foreground" />
                                <span>Undo</span>
                                <DropdownMenuShortcut><Kbd>Ctrl+Z</Kbd></DropdownMenuShortcut>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={redo}
                                disabled={future.length === 0}
                                className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs"
                            >
                                <Redo2 className="size-3.5 text-muted-foreground" />
                                <span>Redo</span>
                                <DropdownMenuShortcut><Kbd>Ctrl+Y</Kbd></DropdownMenuShortcut>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs">
                                <LayoutGrid className="size-3.5 text-muted-foreground" />
                                <span>Auto-Layout Diagram</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-52 bg-card border shadow-md p-1 rounded-md text-foreground z-50">
                                <DropdownMenuItem
                                    onClick={() => autoLayoutTables("LR")}
                                    className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs"
                                >
                                    <LayoutGrid className="size-3.5 text-muted-foreground" />
                                    <span>Left to Right</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => autoLayoutTables("TB")}
                                    className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs"
                                >
                                    <LayoutGrid className="size-3.5 text-muted-foreground" />
                                    <span>Top to Bottom</span>
                                </DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger render={
                        <Button variant="ghost" size="sm" aria-label="View menu" data-slot="button" className="h-8 px-2 sm:px-2.5 gap-1.5 text-xs font-medium cursor-pointer hover:bg-muted">
                            <Eye className="size-3.5 text-muted-foreground" data-slot="icon" data-icon="inline-start" aria-hidden="true" />
                            <span>View</span>
                        </Button>
                    } />
                    <DropdownMenuContent align="start" className="w-56 bg-card border shadow-md p-1 rounded-md text-foreground z-50">
                        <DropdownMenuGroup>
                            <DropdownMenuItem
                                onClick={toggleLeftSidebar}
                                className="flex items-center justify-between cursor-pointer p-2 hover:bg-muted text-xs"
                            >
                                <div className="flex items-center gap-2">
                                    <PanelLeft className="size-3.5 text-muted-foreground" />
                                    <span>Explorer Sidebar</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DropdownMenuShortcut><Kbd>Ctrl+V</Kbd></DropdownMenuShortcut>
                                    {showLeftSidebar && <Check className="size-3.5 text-primary" />}
                                </div>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={toggleRightSidebar}
                                className="flex items-center justify-between cursor-pointer p-2 hover:bg-muted text-xs"
                            >
                                <div className="flex items-center gap-2">
                                    <PanelRight className="size-3.5 text-muted-foreground" />
                                    <span>Inspector Sidebar</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DropdownMenuShortcut><Kbd>Ctrl+B</Kbd></DropdownMenuShortcut>
                                    {showRightSidebar && <Check className="size-3.5 text-primary" />}
                                </div>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                onClick={toggleTheme}
                                aria-label="Toggle Theme"
                                className="flex items-center justify-between cursor-pointer p-2 hover:bg-muted text-xs"
                            >
                                {theme === "dark" ? (
                                    <Sun className="size-3.5 text-amber-400" />
                                ) : (
                                    <Moon className="size-3.5 text-slate-700" />
                                )}
                                <DropdownMenuShortcut><Kbd>Ctrl+Shift+D</Kbd></DropdownMenuShortcut>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Tools Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger render={
                        <Button variant="ghost" size="sm" aria-label="Tools menu" data-slot="button" className="h-8 px-2 sm:px-2.5 gap-1.5 text-xs font-medium cursor-pointer hover:bg-muted">
                            <Wrench className="size-3.5 text-muted-foreground" data-slot="icon" data-icon="inline-start" aria-hidden="true" />
                            <span>Tools</span>
                        </Button>
                    } />
                    <DropdownMenuContent align="start" className="w-48 bg-card border shadow-md p-1 rounded-md text-foreground z-50">
                        <DropdownMenuGroup>
                            <DropdownMenuItem
                                onClick={toggleAIDrawer}
                                className="flex items-center justify-between cursor-pointer p-2 hover:bg-muted text-xs font-medium"
                            >
                                <div className="flex items-center gap-2">
                                    <Sparkles className="size-3.5 text-violet-500" />
                                    <span>AI Architect</span>
                                </div>
                                {isAIOpen && <Check className="size-3.5 text-violet-500" />}
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Mobile View: Compact Single Menu Dropdown */}
            <div className="md:hidden flex items-center">
                <DropdownMenu>
                    <DropdownMenuTrigger render={
                        <Button variant="outline" size="sm" aria-label="Mobile menu" data-slot="button" className="h-8 px-2.5 gap-1.5 text-xs font-medium cursor-pointer border-border">
                            <Menu className="size-3.5" data-slot="icon" data-icon="inline-start" aria-hidden="true" />
                            <span>Menu</span>
                        </Button>
                    } />
                    <DropdownMenuContent align="end" className="w-60 bg-card border shadow-md p-1 rounded-md text-foreground z-50 max-h-[85vh] overflow-y-auto">
                        <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Navigation Menu
                        </div>
                        <DropdownMenuSeparator />

                        {/* File Category */}
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs font-medium">
                                <FileText className="size-3.5 text-primary" />
                                <span>File</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-56 bg-card border shadow-md p-1 rounded-md text-foreground z-50">
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs">
                                        <FolderOpen className="size-3.5 text-muted-foreground" />
                                        <span>Switch Project</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent className="w-56 bg-card border shadow-md p-1 rounded-md text-foreground max-h-80 overflow-y-auto z-50">
                                        <DropdownMenuGroup aria-label="Projects list">
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
                                                    {p.id === projectId && <Check className="size-3.5 text-primary" />}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuGroup>
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>

                                <DropdownMenuGroup aria-label="File management actions">
                                    <DropdownMenuItem
                                        onClick={() => setCreateProjectOpen(true)}
                                        className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs"
                                    >
                                        <Plus className="size-3.5 text-muted-foreground" />
                                        <span>New Project</span>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        onClick={handleAddTable}
                                        className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs font-medium text-primary"
                                    >
                                        <Table className="size-3.5 text-primary" />
                                        <span>Create New Table</span>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        onClick={() => setSettingsOpen(true)}
                                        className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs"
                                    >
                                        <Settings className="size-3.5 text-muted-foreground" />
                                        <span>Project Settings</span>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>

                                <DropdownMenuSeparator />

                                <DropdownMenuGroup aria-label="Save actions">
                                    <DropdownMenuItem
                                        onClick={saveProject}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs font-medium"
                                    >
                                        <Save className="size-3.5 text-primary" />
                                        <span>{isSaving ? "Saving..." : "Save Database"}</span>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>

                                <DropdownMenuSeparator />

                                <DropdownMenuGroup aria-label="Import and Export actions">
                                    <DropdownMenuItem
                                        onClick={triggerImport}
                                        className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs"
                                    >
                                        <Upload className="size-3.5 text-muted-foreground" />
                                        <span>Import JSON</span>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        onClick={exportSchema}
                                        className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs"
                                    >
                                        <Download className="size-3.5 text-muted-foreground" />
                                        <span>Export JSON</span>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        onClick={() => exportCanvasToPng(projectName)}
                                        className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs"
                                    >
                                        <ImageIcon className="size-3.5 text-muted-foreground" aria-hidden="true" />
                                        <span>Export Diagram (PNG)</span>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>

                        {/* Edit Category */}
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs font-medium">
                                <Edit3 className="size-3.5 text-primary" />
                                <span>Edit</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-52 bg-card border shadow-md p-1 rounded-md text-foreground z-50">
                                <DropdownMenuItem
                                    onClick={handleAddTable}
                                    className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs font-medium text-primary"
                                >
                                    <Table className="size-3.5 text-primary" />
                                    <span>Create New Table</span>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuGroup aria-label="History actions">
                                    <DropdownMenuItem
                                        onClick={undo}
                                        disabled={past.length === 0}
                                        className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs"
                                    >
                                        <Undo2 className="size-3.5 text-muted-foreground" />
                                        <span>Undo</span>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        onClick={redo}
                                        disabled={future.length === 0}
                                        className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs"
                                    >
                                        <Redo2 className="size-3.5 text-muted-foreground" />
                                        <span>Redo</span>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>

                                <DropdownMenuSeparator />

                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs">
                                        <LayoutGrid className="size-3.5 text-muted-foreground" />
                                        <span>Auto-Layout Diagram</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent className="w-52 bg-card border shadow-md p-1 rounded-md text-foreground z-50">
                                        <DropdownMenuItem
                                            onClick={() => autoLayoutTables("LR")}
                                            className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs"
                                        >
                                            <LayoutGrid className="size-3.5 text-muted-foreground" />
                                            <span>Left to Right</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => autoLayoutTables("TB")}
                                            className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs"
                                        >
                                            <LayoutGrid className="size-3.5 text-muted-foreground" />
                                            <span>Top to Bottom</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>

                        {/* View Category */}
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs font-medium">
                                <Eye className="size-3.5 text-primary" />
                                <span>View</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-56 bg-card border shadow-md p-1 rounded-md text-foreground z-50">
                                <DropdownMenuItem
                                    onClick={toggleLeftSidebar}
                                    className="flex items-center justify-between cursor-pointer p-2 hover:bg-muted text-xs"
                                >
                                    <div className="flex items-center gap-2">
                                        <PanelLeft className="size-3.5 text-muted-foreground" />
                                        <span>Explorer Sidebar</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DropdownMenuShortcut><Kbd>Ctrl+V</Kbd></DropdownMenuShortcut>
                                        {showLeftSidebar && <Check className="size-3.5 text-primary" />}
                                    </div>
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    onClick={toggleRightSidebar}
                                    className="flex items-center justify-between cursor-pointer p-2 hover:bg-muted text-xs"
                                >
                                    <div className="flex items-center gap-2">
                                        <PanelRight className="size-3.5 text-muted-foreground" />
                                        <span>Inspector Sidebar</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DropdownMenuShortcut><Kbd>Ctrl+B</Kbd></DropdownMenuShortcut>
                                        {showRightSidebar && <Check className="size-3.5 text-primary" />}
                                    </div>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                    onClick={toggleTheme}
                                    aria-label="Toggle Theme"
                                    className="flex items-center justify-between cursor-pointer p-2 hover:bg-muted text-xs"
                                >
                                    {theme === "dark" ? (
                                        <Sun className="size-3.5 text-amber-400" />
                                    ) : (
                                        <Moon className="size-3.5 text-slate-700" />
                                    )}
                                    <DropdownMenuShortcut><Kbd>Ctrl+Shift+D</Kbd></DropdownMenuShortcut>
                                </DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>

                        {/* Tools Category */}
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs font-medium">
                                <Wrench className="size-3.5 text-primary" />
                                <span>Tools</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-48 bg-card border shadow-md p-1 rounded-md text-foreground z-50">
                                <DropdownMenuItem
                                    onClick={toggleAIDrawer}
                                    className="flex items-center justify-between cursor-pointer p-2 hover:bg-muted text-xs font-medium"
                                >
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="size-3.5 text-violet-500" />
                                        <span>AI Architect</span>
                                    </div>
                                    {isAIOpen && <Check className="size-3.5 text-violet-500" />}
                                </DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            onClick={toggleTheme}
                            className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs"
                        >
                            {theme === "dark" ? (
                                <Sun className="size-3.5 text-amber-400" />
                            ) : (
                                <Moon className="size-3.5 text-slate-700" />
                            )}
                            <span>Toggle {theme === "dark" ? "Light" : "Dark"} Mode</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <StorageModeIndicator className="hidden sm:flex" />

            <React.Suspense fallback={null}>
                {createProjectOpen && (
                    <CreateProjectDialog open={createProjectOpen} onOpenChange={setCreateProjectOpen} />
                )}
                {settingsOpen && (
                    <ProjectSettingsDialog
                        open={settingsOpen}
                        onOpenChange={setSettingsOpen}
                        onDeleteRequest={projectId ? () => setDeleteTarget({ id: projectId, name: projectName }) : undefined}
                    />
                )}
                {deleteTarget && (
                    <DeleteProjectDialog
                        targetProject={deleteTarget}
                        onOpenChange={open => {
                            if (!open) {
                                setDeleteTarget(undefined);
                            }
                        }}
                        onDeleted={handleProjectDeleted}
                    />
                )}
                {saveLotusOpen && (
                    <SaveLotusDialog open={saveLotusOpen} onOpenChange={setSaveLotusOpen} />
                )}
                {openLotusOpen && (
                    <OpenLotusDialog open={openLotusOpen} onOpenChange={setOpenLotusOpen} />
                )}
                {customDbOpen && (
                    <CustomDbConnectionDialog open={customDbOpen} onOpenChange={setCustomDbOpen} />
                )}
                {workspaceFolderModalOpen && (
                    <OpenWorkspaceFolderModal open={workspaceFolderModalOpen} onOpenChange={setWorkspaceFolderModalOpen} />
                )}
            </React.Suspense>
        </div>
    );
};
