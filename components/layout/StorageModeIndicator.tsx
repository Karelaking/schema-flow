"use client";

import React from "react";
import { HardDrive, Database, Cloud, AlertCircle } from "lucide-react";
import { useStore } from "@/lib/store";
import { isFileSystemAccessSupported } from "@/lib/lotus-file.service";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * Props for StorageModeIndicator component.
 */
export interface StorageModeIndicatorProps {
    className?: string;
}

/**
 * Displays active storage mode (Database, Lotus Local, or Cloud) badge in workspace header.
 */
export const StorageModeIndicator: React.FC<StorageModeIndicatorProps> = ({ className = "" }): React.ReactElement => {
    const storageMode = useStore(state => state.storageMode);
    const lotusUnsavedChanges = useStore(state => state.lotusUnsavedChanges);
    const lotusFileHandle = useStore(state => state.lotusFileHandle);
    const isProSubscribed = useStore(state => state.isProSubscribed);

    const hasFsa = isFileSystemAccessSupported();

    if (storageMode === "lotus-local") {
        const handleName = lotusFileHandle?.name || "Local .lotus";
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger render={
                        <Badge
                            variant="outline"
                            className={`flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 cursor-default ${className}`}
                        >
                            <HardDrive className="size-3" />
                            <span className="truncate max-w-28 sm:max-w-36">{handleName}</span>
                            {lotusUnsavedChanges && <span className="font-bold text-amber-500">*</span>}
                            {!hasFsa && <AlertCircle className="size-3 text-amber-500 shrink-0" />}
                        </Badge>
                    } />
                    <TooltipContent align="start" className="text-xs max-w-xs">
                        {hasFsa
                            ? `Lotus File Mode: Changes are automatically saved to ${handleName}.`
                            : "Lotus File Mode (Manual Download): Browser does not support direct background file write."}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    if (storageMode === "lotus-cloud") {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger render={
                        <Badge
                            variant="outline"
                            className={`flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-medium bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20 cursor-default ${className}`}
                        >
                            <Cloud className="size-3" />
                            <span>Cloud Synced</span>
                            {isProSubscribed && <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400">Pro</span>}
                        </Badge>
                    } />
                    <TooltipContent align="start" className="text-xs">
                        Cloud Sync Active: Synced with R2 cloud storage.
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    // Default: Database mode
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger render={
                    <Badge
                        variant="outline"
                        className={`flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground border-border/40 cursor-default ${className}`}
                    >
                        <Database className="size-3" />
                        <span>Database</span>
                    </Badge>
                } />
                <TooltipContent align="start" className="text-xs">
                    SQLite / Turso Database Storage Mode.
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
