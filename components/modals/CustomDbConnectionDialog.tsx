"use client";

import React, { useState, useEffect } from "react";
import { Database, Key, Check, Info, Server, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const LS_CUSTOM_DB_URL = "schema-flow:custom-db-url";
const LS_CUSTOM_DB_TOKEN = "schema-flow:custom-db-token";

/**
 * Props for CustomDbConnectionDialog component.
 */
export interface CustomDbConnectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * Modal dialog for configuring custom remote database URL and Auth Token / API Key (BYO Key).
 * Allows connecting Schema Flow to user-hosted Turso, LibSQL, or remote database.
 */
export const CustomDbConnectionDialog: React.FC<CustomDbConnectionDialogProps> = ({ open, onOpenChange }): React.ReactElement => {
    const [dbUrl, setDbUrl] = useState<string>("");
    const [authToken, setAuthToken] = useState<string>("");
    const [isSaving, setIsSaving] = useState<boolean>(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedUrl = localStorage.getItem(LS_CUSTOM_DB_URL) || "";
            const savedToken = localStorage.getItem(LS_CUSTOM_DB_TOKEN) || "";
            setDbUrl(savedUrl);
            setAuthToken(savedToken);
        }
    }, [open]);

    const handleSaveConnection = (): void => {
        setIsSaving(true);
        try {
            if (typeof window !== "undefined") {
                if (dbUrl.trim() !== "") {
                    localStorage.setItem(LS_CUSTOM_DB_URL, dbUrl.trim());
                } else {
                    localStorage.removeItem(LS_CUSTOM_DB_URL);
                }

                if (authToken.trim() !== "") {
                    localStorage.setItem(LS_CUSTOM_DB_TOKEN, authToken.trim());
                } else {
                    localStorage.removeItem(LS_CUSTOM_DB_TOKEN);
                }
            }
            toast.success("Database connection settings saved!");
            onOpenChange(false);
        }
        catch (err: unknown) {
            toast.error("Failed to save database credentials.");
        }
        finally {
            setIsSaving(false);
        }
    };

    const handleClearConnection = (): void => {
        if (typeof window !== "undefined") {
            localStorage.removeItem(LS_CUSTOM_DB_URL);
            localStorage.removeItem(LS_CUSTOM_DB_TOKEN);
        }
        setDbUrl("");
        setAuthToken("");
        toast.info("Cleared custom database credentials. Defaulting to local SQLite file.");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg bg-card border shadow-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-foreground">
                        <Server className="size-5 text-primary" />
                        Connect Your Database (BYO Key)
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-xs">
                        Connect Schema Flow directly to your own remote database (Turso / LibSQL). 100% open-source with zero vendor lock-in.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="custom-db-url" className="text-xs font-semibold flex items-center gap-1.5">
                            <Database className="size-3.5 text-primary" />
                            Database Connection URL
                        </Label>
                        <Input
                            id="custom-db-url"
                            placeholder="libsql://your-database-org.turso.io or file:./data/schema-flow.db"
                            value={dbUrl}
                            onChange={e => setDbUrl(e.target.value)}
                            className="font-mono text-xs"
                        />
                        <p className="text-[11px] text-muted-foreground">
                            Enter your Turso / LibSQL URL or local SQLite file path.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="custom-db-token" className="text-xs font-semibold flex items-center gap-1.5">
                            <Key className="size-3.5 text-primary" />
                            Auth Token / API Key
                        </Label>
                        <Input
                            id="custom-db-token"
                            type="password"
                            autoComplete="current-password"
                            placeholder="ey..."
                            value={authToken}
                            onChange={e => setAuthToken(e.target.value)}
                            className="font-mono text-xs"
                        />
                        <p className="text-[11px] text-muted-foreground">
                            Required for remote <code className="text-foreground font-mono">libsql://</code> connections.
                        </p>
                    </div>

                    <div className="rounded-lg border bg-muted/40 p-3 text-xs space-y-1.5">
                        <div className="flex items-center gap-1.5 font-semibold text-foreground">
                            <Info className="size-3.5 text-primary shrink-0" />
                            <span>How to get a free Turso Database URL & Auth Token:</span>
                        </div>
                        <ol className="list-decimal list-inside space-y-0.5 text-muted-foreground text-[11px] pl-1">
                            <li>Install Turso CLI: <code className="text-foreground">turso auth login</code></li>
                            <li>Get Database URL: <code className="text-foreground">turso db show &lt;db-name&gt;</code></li>
                            <li>Create Auth Token: <code className="text-foreground">turso db tokens create &lt;db-name&gt;</code></li>
                        </ol>
                    </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Button variant="ghost" size="sm" onClick={handleClearConnection} className="text-xs text-muted-foreground">
                        Clear Credentials
                    </Button>
                    <div className="flex items-center gap-2 ml-auto">
                        <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
                            Cancel
                        </Button>
                        <Button size="sm" onClick={handleSaveConnection} disabled={isSaving} className="text-xs font-semibold gap-1.5">
                            {isSaving && <Loader2 className="size-3.5 animate-spin" data-icon="inline-start" />}
                            <span>{isSaving ? "Saving..." : "Save Connection"}</span>
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
