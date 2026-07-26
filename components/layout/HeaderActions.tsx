"use client";

import React from "react";
import { Download, Upload, Sun, Moon, MoreVertical, ChevronDown, Image, Save, Sparkles } from "lucide-react";
import { useAIStore } from "@/lib/ai-store";
import { useStore } from "@/lib/store";
import { exportCanvasToPng } from "@/lib/export-image";
import { useTheme } from "@/providers/ThemeProvider";
import { useProjectActions } from "@/hooks/useProjectActions";

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
 * Props for HeaderActions component.
 */
export interface HeaderActionsProps {
    className?: string;
}

/**
 * Manages export, import, theme toggle, and mobile menu actions.
 */
export const HeaderActions: React.FC<HeaderActionsProps> = ({ className = "" }): React.ReactElement => {
    const { theme, toggleTheme } = useTheme();
    const projectName = useStore(state => state.projectName);
    const toggleAIDrawer = useAIStore(state => state.toggleDrawer);
    const isAIOpen = useAIStore(state => state.isOpen);

    const {
        isSaving,
        saveMessage,
        exportSchema,
        importSchema,
        saveProject
    } = useProjectActions();

    const triggerImport = (): void => {
        document.getElementById("header-import-file-input")?.click();
    };

    return (
        <div className={`flex items-center gap-1 sm:gap-2 ${className}`}>
            <input
                id="header-import-file-input"
                type="file"
                accept=".json"
                onChange={importSchema}
                className="hidden"
            />

            <Button
                variant="default"
                size="sm"
                className="hidden sm:flex gap-1.5 h-8 text-xs cursor-pointer font-medium"
                onClick={saveProject}
                disabled={isSaving}
            >
                <Save className="size-3.5" />
                {isSaving ? "Saving..." : "Save Database"}
            </Button>

            {saveMessage && (
                <span className="hidden md:inline-block text-xs font-medium text-emerald-500 animate-fade-in">
                    {saveMessage}
                </span>
            )}

            <Separator orientation="vertical" className="h-10 mx-1 hidden sm:block" />

            <DropdownMenu>
                <DropdownMenuTrigger render={
                    <Button
                        variant="outline"
                        size="sm"
                        className="hidden lg:flex gap-1.5 h-8 text-xs cursor-pointer"
                    >
                        <Download className="size-3.5" />
                        Export
                        <ChevronDown className="size-3 text-muted-foreground ml-0.5" />
                    </Button>
                } />
                <DropdownMenuContent align="end" className="w-44 bg-card border shadow-md p-1 rounded-md text-foreground z-50">
                    <DropdownMenuItem
                        onClick={exportSchema}
                        className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs"
                    >
                        <Download className="size-3.5 text-muted-foreground" />
                        Export JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => exportCanvasToPng(projectName)}
                        className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs"
                    >
                        <Image className="size-3.5 text-muted-foreground" />
                        Export Diagram (PNG)
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Button
                variant="outline"
                size="sm"
                className="hidden lg:flex gap-1.5 h-8 text-xs cursor-pointer"
                onClick={triggerImport}
            >
                <Upload className="size-3.5" />
                Import JSON
            </Button>

            <Button
                variant={isAIOpen ? "secondary" : "outline"}
                size="sm"
                className="flex items-center gap-1.5 h-8 text-xs cursor-pointer relative font-medium border-violet-500/30 hover:border-violet-500/60"
                onClick={toggleAIDrawer}
            >
                <Sparkles className="size-3.5 text-violet-500 animate-pulse" />
                <span className="hidden sm:inline">AI Architect</span>
            </Button>

            <Button
                variant="ghost"
                size="icon"
                className="size-8 cursor-pointer text-muted-foreground hover:text-foreground"
                onClick={toggleTheme}
                aria-label="Toggle Theme"
                title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            >
                {theme === "dark" ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-slate-700" />}
            </Button>

            <div className="lg:hidden">
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
                            className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs font-semibold text-primary"
                        >
                            <Save className="size-3.5" />
                            {isSaving ? "Saving..." : "Save Database"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={exportSchema}
                            className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs"
                        >
                            <Download className="size-3.5 text-muted-foreground" />
                            Export JSON Schema
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => exportCanvasToPng(projectName)}
                            className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs"
                        >
                            <Image className="size-3.5 text-muted-foreground" />
                            Export PNG Diagram
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={triggerImport}
                            className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs"
                        >
                            <Upload className="size-3.5 text-muted-foreground" />
                            Import JSON Schema
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};
