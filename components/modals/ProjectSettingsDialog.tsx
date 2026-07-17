"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { projectSettingsSchema, ProjectSettingsInput } from "@/lib/schemas";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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

export interface ProjectSettingsDialogProps {
  /** Visibility state of the modal dialog */
  open: boolean;
  /** Callback to change modal visibility */
  onOpenChange: (open: boolean) => void;
  /** Callback fired when user clicks Delete Project inside settings */
  onDeleteRequest?: () => void;
}

/**
 * SRP Modal Component: Manages project settings form inputs, column defaults, and store synchronization.
 */
export function ProjectSettingsDialog({ open, onOpenChange, onDeleteRequest }: ProjectSettingsDialogProps) {
  const projectId = useStore(state => state.projectId);
  const projectName = useStore(state => state.projectName);
  const projectDescription = useStore(state => state.projectDescription);
  const dialect = useStore(state => state.dialect);
  const autoAddId = useStore(state => state.autoAddId);
  const autoAddTimestamps = useStore(state => state.autoAddTimestamps);

  const setProjectDetails = useStore(state => state.setProjectDetails);
  const setAutoAddId = useStore(state => state.setAutoAddId);
  const setAutoAddTimestamps = useStore(state => state.setAutoAddTimestamps);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<ProjectSettingsInput>({
    resolver: zodResolver(projectSettingsSchema),
    defaultValues: {
      name: projectName,
      description: projectDescription,
      dialect,
      autoAddId,
      autoAddTimestamps
    }
  });

  const selectedDialect = watch("dialect");
  const watchAutoAddId = watch("autoAddId");
  const watchAutoAddTimestamps = watch("autoAddTimestamps");

  // Sync form values whenever settings dialog is opened or project details change
  useEffect(() => {
    if (open) {
      reset({
        name: projectName,
        description: projectDescription,
        dialect,
        autoAddId,
        autoAddTimestamps
      });
    }
  }, [open, projectName, projectDescription, dialect, autoAddId, autoAddTimestamps, reset]);

  const onSubmit = (data: ProjectSettingsInput) => {
    setProjectDetails(data.name, data.description || "", data.dialect);
    setAutoAddId(data.autoAddId);
    setAutoAddTimestamps(data.autoAddTimestamps);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
          <DialogDescription>
            Configure the metadata and dialect settings for this database project.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-proj-name">Project Name</Label>
            <Input 
              id="edit-proj-name" 
              {...register("name")}
            />
            {errors.name && (
              <span className="text-[11px] text-destructive font-medium">{errors.name.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-proj-desc">Description</Label>
            <Textarea 
              id="edit-proj-desc" 
              rows={3}
              {...register("description")}
            />
            {errors.description && (
              <span className="text-[11px] text-destructive font-medium">{errors.description.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-proj-dialect">Database Dialect</Label>
            <Select 
              value={selectedDialect} 
              onValueChange={(val: any) => setValue("dialect", val)}
            >
              <SelectTrigger id="edit-proj-dialect">
                <SelectValue placeholder="Select dialect" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sqlite">SQLite</SelectItem>
                <SelectItem value="postgres">PostgreSQL</SelectItem>
                <SelectItem value="mysql">MySQL</SelectItem>
              </SelectContent>
            </Select>
            {errors.dialect && (
              <span className="text-[11px] text-destructive font-medium">{errors.dialect.message}</span>
            )}
          </div>

          <div className="border-t pt-3 mt-1 flex flex-col gap-3">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Default Node Columns
            </span>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="settings-auto-id" className="text-xs font-medium cursor-pointer">Auto-add Primary Key (id)</Label>
                <span className="text-[10px] text-muted-foreground">Add id INTEGER PRIMARY KEY to new tables</span>
              </div>
              <Switch 
                id="settings-auto-id"
                checked={watchAutoAddId}
                onCheckedChange={(val) => setValue("autoAddId", val)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="settings-auto-ts" className="text-xs font-medium cursor-pointer">Auto-add Timestamps</Label>
                <span className="text-[10px] text-muted-foreground">Add created_at & updated_at to new tables</span>
              </div>
              <Switch 
                id="settings-auto-ts"
                checked={watchAutoAddTimestamps}
                onCheckedChange={(val) => setValue("autoAddTimestamps", val)}
              />
            </div>
          </div>

          {/* Danger Zone */}
          {projectId && onDeleteRequest && (
            <div className="border-t border-destructive/20 pt-4 mt-2">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-destructive">Danger Zone</span>
                  <span className="text-[10px] text-muted-foreground">Permanently delete this project and all its data.</span>
                </div>
                <Button 
                  type="button"
                  variant="destructive" 
                  size="sm"
                  className="gap-1.5 shrink-0 cursor-pointer"
                  onClick={() => {
                    onOpenChange(false);
                    onDeleteRequest();
                  }}
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </Button>
              </div>
            </div>
          )}

          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Apply Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
