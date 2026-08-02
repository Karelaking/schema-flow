"use client";

import React from "react";
import { AlertTriangle, HardDrive, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

/**
 * Conflict item data interface.
 */
export interface SyncConflictData {
    projectId: string;
    projectName: string;
    localVersion: number;
    cloudVersion: number;
    localTimestamp: string;
    cloudTimestamp?: string;
}

/**
 * Props for SyncConflictDialog component.
 */
export interface SyncConflictDialogProps {
    open: boolean;
    conflict?: SyncConflictData;
    onOpenChange: (open: boolean) => void;
    onResolve: (action: "keep-local" | "keep-cloud" | "keep-both") => void;
}

/**
 * Modal dialog for resolving multi-device cloud sync conflicts.
 */
export const SyncConflictDialog: React.FC<SyncConflictDialogProps> = ({
    open,
    conflict,
    onOpenChange,
    onResolve,
}): React.ReactElement => {
    if (!conflict) {
        return <></>;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card border shadow-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-amber-500">
                        <AlertTriangle className="size-5" />
                        Sync Conflict Detected
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-xs">
                        This project was modified on another device while you were working offline.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                            <div className="flex items-center gap-1.5 font-semibold text-foreground">
                                <HardDrive className="size-3.5 text-primary" />
                                Local Version
                            </div>
                            <div className="text-muted-foreground text-[11px]">
                                Version: v{conflict.localVersion}
                            </div>
                        </div>

                        <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                            <div className="flex items-center gap-1.5 font-semibold text-foreground">
                                <Cloud className="size-3.5 text-sky-500" />
                                Cloud Version
                            </div>
                            <div className="text-muted-foreground text-[11px]">
                                Version: v{conflict.cloudVersion}
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onResolve("keep-local")}
                        className="text-xs"
                    >
                        Overwrite Cloud
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onResolve("keep-cloud")}
                        className="text-xs"
                    >
                        Use Cloud Version
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => onResolve("keep-both")}
                        className="text-xs font-semibold"
                    >
                        Keep Both (Copy)
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
