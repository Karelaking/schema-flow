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

export interface HeaderActionsProps {
  className?: string;
}

/**
 * Isolated Client Component: Manages export, import, theme toggle, and mobile menu actions.
 */
export function HeaderActions({ className = "" }: HeaderActionsProps): React.JSX.Element {
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
      {/* Hidden file input for import */}
      <input
        id="header-import-file-input"
        type="file" 
        accept=".json" 
        onChange={importSchema} 
        className="hidden" 
      />

      {/* Desktop Save Button */}
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

      {/* Export Dropdown */}
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
            onClick={() => exportCanvasToPng(`${projectName || "schema"}-diagram.png`)}
            className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs"
          >
            <Image className="size-3.5 text-muted-foreground" />
            Export PNG Image
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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

      <Separator orientation="vertical" className="h-10 mx-1 hidden lg:block" />

      {/* AI Architect Toggle */}
      <Button
        variant={isAIOpen ? "default" : "outline"}
        size="sm"
        onClick={toggleAIDrawer}
        title="Toggle AI Schema Architect"
        className="gap-1.5 h-8 text-xs cursor-pointer hidden sm:flex"
      >
        <Sparkles className="size-3.5" />
        <span className="hidden lg:inline">AI Architect</span>
      </Button>


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
              onClick={() => exportCanvasToPng(`${projectName || "schema"}-diagram.png`)}
              className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted text-xs"
            >
              <Image className="size-3.5" />
              Export PNG Image
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
  );
}
