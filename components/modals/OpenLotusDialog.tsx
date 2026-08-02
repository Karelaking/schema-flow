"use client";

import React, { useState } from "react";
import { FolderOpen, FileCheck, AlertCircle } from "lucide-react";
import { useStore } from "@/lib/store";
import { toast } from "@/components/ui/sonner";
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
 * Props for OpenLotusDialog component.
 */
export interface OpenLotusDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * Modal dialog for opening and decrypting local .lotus files.
 */
export const OpenLotusDialog: React.FC<OpenLotusDialogProps> = ({ open, onOpenChange }): React.ReactElement => {
    const openLotusFile = useStore(state => state.openLotusFile);
    const [isLoading, setIsLoading] = useState(false);

    const handleOpen = async (): Promise<void> => {
        setIsLoading(true);
        try {
            await openLotusFile();
            toast.success("Lotus project loaded successfully");
            onOpenChange(false);
        }
        catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Failed to open .lotus file");
        }
        finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card border shadow-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-foreground">
                        <FolderOpen className="size-5 text-primary" />
                        Open from Disk (.lotus)
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-xs">
                        Open an encrypted or portable .lotus file from your local machine.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-3 text-center">
                    <div className="border-2 border-dashed border-border/60 rounded-xl p-6 bg-muted/20 flex flex-col items-center justify-center gap-2">
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <FileCheck className="size-5" />
                        </div>
                        <div className="text-xs font-semibold text-foreground">
                            Select a .lotus file from your disk
                        </div>
                        <p className="text-[11px] text-muted-foreground max-w-xs">
                            Supports standard AES-256-GCM encrypted projects and portable .lotus files.
                        </p>
                        <Button
                            type="button"
                            onClick={handleOpen}
                            disabled={isLoading}
                            className="mt-2 text-xs font-medium cursor-pointer"
                        >
                            {isLoading ? "Decrypting..." : "Choose File..."}
                        </Button>
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
