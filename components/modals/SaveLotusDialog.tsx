"use client";

import React, { useState } from "react";
import { HardDrive, Download, Lock, Share2, Info } from "lucide-react";
import { useStore } from "@/lib/store";
import { isFileSystemAccessSupported } from "@/lib/lotus-file.service";
import { toast } from "@schema-flow/components/ui/sonner";
import { Button } from "@schema-flow/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@schema-flow/components/ui/dialog";

/**
 * Props for SaveLotusDialog component.
 */
export interface SaveLotusDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * Modal dialog for saving project as encrypted or portable .lotus file.
 */
export const SaveLotusDialog: React.FC<SaveLotusDialogProps> = ({ open, onOpenChange }): React.ReactElement => {
    const projectName = useStore(state => state.projectName);
    const saveLotusFile = useStore(state => state.saveLotusFile);
    const saveLotusPortable = useStore(state => state.saveLotusPortable);
    const setStorageMode = useStore(state => state.setStorageMode);

    const [isSaving, setIsSaving] = useState(false);
    const hasFsa = isFileSystemAccessSupported();

    const suggestedName = `${projectName ? projectName.toLowerCase().replace(/\s+/g, "_") : "untitled_schema"}.lotus`;

    const handleSaveStandard = async (): Promise<void> => {
        setIsSaving(true);
        try {
            setStorageMode("lotus-local");
            await saveLotusFile();
            toast.success("Project saved as encrypted .lotus file");
            onOpenChange(false);
        }
        catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Failed to save .lotus file");
        }
        finally {
            setIsSaving(false);
        }
    };

    const handleSavePortable = async (): Promise<void> => {
        setIsSaving(true);
        try {
            await saveLotusPortable();
            toast.success("Portable .lotus file downloaded");
            onOpenChange(false);
        }
        catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Failed to save portable .lotus file");
        }
        finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card border shadow-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-foreground">
                        <HardDrive className="size-5 text-primary" />
                        Save to Disk (.lotus)
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-xs">
                        Store your visual database design on your local file system as an encrypted .lotus file.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="rounded-lg border bg-muted/40 p-3 text-xs space-y-1">
                        <div className="flex items-center justify-between font-semibold text-foreground">
                            <span>Target Filename:</span>
                            <span className="font-mono text-primary">{suggestedName}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            {hasFsa
                                ? "Your browser supports auto-save. Re-saves will update this file directly on disk."
                                : "Your browser supports manual download. Use Chrome or Edge for automatic background disk sync."}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        <button
                            type="button"
                            onClick={handleSaveStandard}
                            disabled={isSaving}
                            className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-left cursor-pointer group"
                        >
                            <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                                <Lock className="size-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="font-medium text-xs text-foreground group-hover:text-primary transition-colors">
                                    Standard Encrypted (.lotus)
                                </div>
                                <div className="text-[11px] text-muted-foreground mt-0.5">
                                    Encrypted using AES-256-GCM. Unlocks automatically when opened in Schema Flow.
                                </div>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={handleSavePortable}
                            disabled={isSaving}
                            className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-left cursor-pointer group"
                        >
                            <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                                <Share2 className="size-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="font-medium text-xs text-foreground group-hover:text-primary transition-colors">
                                    Portable (.lotus)
                                </div>
                                <div className="text-[11px] text-muted-foreground mt-0.5">
                                    Includes embedded key envelope. Shareable across different Schema Flow deployments.
                                </div>
                            </div>
                        </button>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
