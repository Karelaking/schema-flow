"use client";

import React, { useState, useEffect } from "react";
import { 
  FolderOpen, 
  FileCode, 
  Save, 
  Folder, 
  User, 
  Database,
  Plus
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  openWorkspaceDirectoryPicker,
  getActiveWorkspaceDirectoryHandle,
  ensureWorkspaceYaml,
  writeWorkspaceYaml,
  listWorkspaceDirectoryFiles,
  readWorkspaceFileContent,
  writeWorkspaceFileContent,
  WorkspaceYamlConfig,
} from "@/lib/local-workspace.service";
import { toast } from "sonner";
import { useStore } from "@/lib/store";

interface OpenWorkspaceFolderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OpenWorkspaceFolderModal({ open, onOpenChange }: OpenWorkspaceFolderModalProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<"files" | "yaml">("files");
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [files, setFiles] = useState<{ name: string; isDirectory: boolean }[]>([]);
  const [yamlConfig, setYamlConfig] = useState<WorkspaceYamlConfig | null>(null);
  const [newFileName, setNewFileName] = useState("");
  const [savingYaml, setSavingYaml] = useState(false);

  const loadProject = useStore((state) => state.loadProject);

  // Load active handle on open
  useEffect(() => {
    if (open) {
      const currentHandle = getActiveWorkspaceDirectoryHandle();
      if (currentHandle) {
        setDirHandle(currentHandle);
        refreshWorkspaceData(currentHandle);
      }
    }
  }, [open]);

  const refreshWorkspaceData = async (handle: FileSystemDirectoryHandle) => {
    try {
      const fileList = await listWorkspaceDirectoryFiles(handle);
      setFiles(fileList);
      const config = await ensureWorkspaceYaml(handle);
      setYamlConfig(config);
    } catch (err: unknown) {
      console.error("Failed to refresh workspace data:", err);
    }
  };

  const handlePickDirectory = async () => {
    try {
      const handle = await openWorkspaceDirectoryPicker();
      if (handle) {
        setDirHandle(handle);
        await refreshWorkspaceData(handle);
        toast.success(`Opened local workspace: ${handle.name}`);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to open directory");
    }
  };

  const handleSaveYamlConfig = async () => {
    if (!dirHandle || !yamlConfig) return;
    setSavingYaml(true);
    try {
      await writeWorkspaceYaml(dirHandle, yamlConfig);
      toast.success("Saved workspace.yaml configuration");
      await refreshWorkspaceData(dirHandle);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save workspace.yaml");
    } finally {
      setSavingYaml(false);
    }
  };

  const handleCreateNewFile = async () => {
    if (!dirHandle || !newFileName.trim()) return;
    try {
      const filename = newFileName.endsWith(".lotus") ? newFileName : `${newFileName}.lotus`;
      await writeWorkspaceFileContent(dirHandle, filename, JSON.stringify({ version: "1.0.0", schema: { tables: [], relations: [] } }));
      setNewFileName("");
      toast.success(`Created file: ${filename}`);
      await refreshWorkspaceData(dirHandle);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create file");
    }
  };

  const handleOpenFileIntoCanvas = async (filename: string) => {
    if (!dirHandle) return;
    try {
      const content = await readWorkspaceFileContent(dirHandle, filename);
      if (filename.endsWith(".lotus")) {
        try {
          const parsed = JSON.parse(content);
          if (parsed && (parsed.tables || parsed.schema)) {
            loadProject({
              project: parsed.project || { id: "ws-proj", name: filename, description: "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
              settings: parsed.settings || { dialect: "sqlite", theme: "dark" },
              tables: parsed.tables || parsed.schema?.tables || {},
              relations: parsed.relations || parsed.schema?.relations || {},
              enums: parsed.enums || {},
            });
            toast.success(`Loaded schema from ${filename}`);
            onOpenChange(false);
          } else {
            toast.info(`Opened schema file: ${filename}`);
          }
        } catch {
          toast.info(`Opened schema file: ${filename}`);
        }
      } else {
        toast.info(`Opened text file: ${filename}`);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to read file");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-card border-border/80 text-foreground p-6 shadow-2xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <FolderOpen className="size-5 text-primary" />
            <span>Local Workspace Directory</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Manage multi-file schema projects and `workspace.yaml` metadata configuration.
          </DialogDescription>
        </DialogHeader>

        {/* Directory Picker Header Banner */}
        <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 p-3.5">
          <div className="flex items-center gap-2.5">
            <Folder className="size-5 text-amber-500" />
            <div>
              <p className="text-xs font-bold text-foreground">
                {dirHandle ? dirHandle.name : "No Folder Selected"}
              </p>
              <p className="text-[10px] text-muted-foreground font-mono">
                {dirHandle ? "Connected File System Access Handle" : "Click 'Select Folder' to open local workspace"}
              </p>
            </div>
          </div>
          <Button size="sm" onClick={handlePickDirectory} className="rounded-full text-xs font-bold gap-1.5 cursor-pointer">
            <FolderOpen className="size-3.5" />
            <span>{dirHandle ? "Change Folder" : "Select Folder"}</span>
          </Button>
        </div>

        {dirHandle && (
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "files" | "yaml")} className="w-full pt-2">
            <TabsList className="grid grid-cols-2 w-full rounded-lg bg-muted/30 p-1">
              <TabsTrigger value="files" className="text-xs font-semibold gap-1.5 cursor-pointer">
                <FileCode className="size-3.5" />
                <span>Files ({files.length})</span>
              </TabsTrigger>
              <TabsTrigger value="yaml" className="text-xs font-semibold gap-1.5 cursor-pointer">
                <Database className="size-3.5" />
                <span>workspace.yaml</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: File Browser */}
            <TabsContent value="files" className="space-y-4 pt-4">
              <div className="flex items-center gap-2">
                <Input
                  id="new-workspace-file-name"
                  aria-label="New file name"
                  placeholder="New file name (e.g. ecommerce.lotus)"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="h-8 text-xs font-mono"
                />
                <Button size="sm" onClick={handleCreateNewFile} className="h-8 text-xs font-bold gap-1 rounded-full cursor-pointer">
                  <Plus className="size-3.5" data-icon="inline-start" />
                  <span>Create File</span>
                </Button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1.5 border border-border/40 rounded-xl p-2 bg-muted/10 font-mono text-xs">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-2">
                      <FileCode className="size-4 text-sky-400" />
                      <span className="font-bold text-foreground">{f.name}</span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleOpenFileIntoCanvas(f.name)}
                      className="h-7 text-[11px] font-sans font-bold hover:bg-primary/10 hover:text-primary rounded-full cursor-pointer"
                    >
                      Open in Canvas
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Tab 2: workspace.yaml Config */}
            <TabsContent value="yaml" className="space-y-4 pt-4">
              {yamlConfig && (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="workspace-config-name" className="text-xs font-bold">Workspace Name</Label>
                      <Input
                        id="workspace-config-name"
                        aria-label="Workspace Name"
                        value={yamlConfig.name}
                        onChange={(e) => setYamlConfig({ ...yamlConfig, name: e.target.value })}
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="workspace-config-dialect" className="text-xs font-bold">Default Dialect</Label>
                      <Input
                        id="workspace-config-dialect"
                        aria-label="Default Dialect"
                        value={yamlConfig.settings?.dialect || "sqlite"}
                        onChange={(e) => setYamlConfig({ ...yamlConfig, settings: { ...yamlConfig.settings, dialect: e.target.value } })}
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="workspace-config-user-name" className="text-xs font-bold flex items-center gap-1">
                        <User className="size-3 text-muted-foreground" />
                        <span>Developer Name</span>
                      </Label>
                      <Input
                        id="workspace-config-user-name"
                        aria-label="Developer Name"
                        autoComplete="name"
                        value={yamlConfig.user?.name || ""}
                        onChange={(e) => setYamlConfig({ ...yamlConfig, user: { ...yamlConfig.user, name: e.target.value } })}
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="workspace-config-user-email" className="text-xs font-bold">Developer Email</Label>
                      <Input
                        id="workspace-config-user-email"
                        aria-label="Developer Email"
                        autoComplete="email"
                        value={yamlConfig.user?.email || ""}
                        onChange={(e) => setYamlConfig({ ...yamlConfig, user: { ...yamlConfig.user, email: e.target.value } })}
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button size="sm" onClick={handleSaveYamlConfig} disabled={savingYaml} className="h-8 text-xs font-bold gap-1 rounded-full cursor-pointer">
                      <Save className="size-3.5" data-icon="inline-start" />
                      <span>{savingYaml ? "Saving..." : "Save workspace.yaml"}</span>
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter className="pt-4 border-t border-border/40">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="rounded-full text-xs cursor-pointer">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
