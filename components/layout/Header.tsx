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
  Sparkles,
  HelpCircle
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useTheme } from "@/providers/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [editName, setEditName] = useState(projectName);
  const [editDesc, setEditDesc] = useState(projectDescription);
  const [editDialect, setEditDialect] = useState(dialect);
  const [settingsOpen, setSettingsOpen] = useState(false);

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
          theme
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
        theme
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
    setSettingsOpen(false);
  };

  const openSettings = () => {
    setEditName(projectName);
    setEditDesc(projectDescription);
    setEditDialect(dialect);
    setSettingsOpen(true);
  };

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-6 text-card-foreground">
      {/* Brand & Project Metadata */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Database className="size-4" />
          </div>
          <span className="font-bold text-base tracking-tight bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
            Schema Flow
          </span>
        </div>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="font-semibold text-sm leading-none">{projectName}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mt-0.5">
              {dialect} Dialect
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="size-7 text-muted-foreground hover:text-foreground"
            onClick={openSettings}
          >
            <Settings className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Center Controls: Undo, Redo, Save */}
      <div className="flex items-center gap-1">
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
        >
          <Save className="size-3.5" />
          Save
        </Button>
        {saveMessage && (
          <span className="text-xs font-medium text-muted-foreground ml-2 animate-fade-in">
            {saveMessage}
          </span>
        )}
      </div>

      {/* Right Controls: Import, Export, Theme, Help */}
      <div className="flex items-center gap-2">
        <label className="cursor-pointer">
          <input 
            type="file" 
            accept=".json" 
            onChange={handleImport} 
            className="hidden" 
          />
          <span className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-accent hover:text-accent-foreground transition-colors gap-1.5 shadow-sm">
            <Upload className="size-3.5" />
            Import
          </span>
        </label>
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
          <Download className="size-3.5" />
          Export
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>Cancel</Button>
            <Button onClick={handleApplySettings}>Apply Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
