"use client";

import React from "react";
import { useProjectActions } from "@/hooks/useProjectActions";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

export interface HeaderActionsProps {
    className?: string;
}

export const HeaderActions: React.FC<HeaderActionsProps> = ({ className = "" }): React.ReactElement => {
    const { isSaving, saveMessage, saveProject } = useProjectActions();

    return (
        <div className={`flex items-center gap-1.5 sm:gap-2 ${className}`}>
            {saveMessage && (
                <span className="hidden md:inline-block text-xs font-medium text-emerald-500 animate-fade-in">
                    {saveMessage}
                </span>
            )}

            <Button
                variant="default"
                size="sm"
                className="hidden sm:flex gap-1.5 h-8 text-xs cursor-pointer font-medium"
                onClick={saveProject}
                disabled={isSaving}
                aria-label="Save Database Project"
                data-slot="button"
            >
                <Save className="size-3.5" data-slot="icon" data-icon="inline-start" aria-hidden="true" />
                <span>{isSaving ? "Saving..." : "Save Database"}</span>
            </Button>
        </div>
    );
};

