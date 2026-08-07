"use client";

import React, { useState } from "react";
import { Loader2, HardDrive, Key, Cloud, Lock, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProjectSchema, CreateProjectInput } from "@/lib/schemas";
import { createProjectAction } from "@/app/actions/projects";
import { useStore } from "@/lib/store";
import { Button } from "@schema-flow/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@schema-flow/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@schema-flow/components/ui/select";
import { Input } from "@schema-flow/components/ui/input";
import { Label } from "@schema-flow/components/ui/label";
import { Textarea } from "@schema-flow/components/ui/textarea";
import { Badge } from "@schema-flow/components/ui/badge";

/**
 * Storage mode option type for the radio card selection.
 */
type StorageModeOption = "database" | "byok-cloud" | "lotus-cloud";

/**
 * Props for CreateProjectDialog component.
 */
export interface CreateProjectDialogProps {
    /** Visibility state of the modal dialog */
    open: boolean;
    /** Callback to change modal visibility */
    onOpenChange: (open: boolean) => void;
    /** Optional callback fired when project is successfully created */
    onSuccess?: () => void;
}

/**
 * Handles project creation form input, Zod validation, and Server Action execution.
 * Includes storage mode selection (Local File, BYOK Cloud, Managed Cloud).
 */
export const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({ open, onOpenChange, onSuccess }): React.ReactElement => {
    const loadProject = useStore(state => state.loadProject);
    const isProSubscribed = useStore(state => state.isProSubscribed);
    const setByokCredentials = useStore(state => state.setByokCredentials);
    const setStorageMode = useStore(state => state.setStorageMode);
    const [submitError, setSubmitError] = useState<string | undefined>(undefined);
    const [selectedStorage, setSelectedStorage] = useState<StorageModeOption>("database");
    const [byokApiKey, setByokApiKey] = useState<string>("");
    const [byokEndpoint, setByokEndpoint] = useState<string>("");

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(createProjectSchema),
        defaultValues: {
            name: "",
            description: "",
            dialect: "sqlite" as const,
            storageMode: "database" as const
        }
    });

    const selectedDialect = watch("dialect");

    /**
     * Handles selecting a storage mode card.
     * Blocks managed cloud selection if user is not Pro subscribed.
     */
    const handleStorageSelect = (mode: StorageModeOption): void => {
        if (mode === "lotus-cloud" && !isProSubscribed) {
            return;
        }
        setSelectedStorage(mode);
        setValue("storageMode", mode);
    };

    const onSubmit = async (data: Record<string, unknown>): Promise<void> => {
        setSubmitError(undefined);

        if (selectedStorage === "byok-cloud" && !byokApiKey.trim()) {
            setSubmitError("API Key is required for custom cloud storage.");
            return;
        }

        const payload = { ...data, storageMode: selectedStorage } as CreateProjectInput;
        const result = await createProjectAction(payload);

        if (result.success && result.project) {
            if (selectedStorage === "byok-cloud") {
                setByokCredentials(byokApiKey.trim(), byokEndpoint.trim());
            }
            setStorageMode(selectedStorage);
            loadProject(result.project);
            resetForm();
            onOpenChange(false);
            onSuccess?.();
        }
        else {
            setSubmitError(result.error || "Failed to create project");
        }
    };

    const resetForm = (): void => {
        reset();
        setSelectedStorage("database");
        setByokApiKey("");
        setByokEndpoint("");
        setSubmitError(undefined);
    };

    return (
        <Dialog open={open} onOpenChange={val => {
            if (!val) {
                resetForm();
            }
            onOpenChange(val);
        }}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                        Start a new database schema design workspace.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-2">
                    {submitError && (
                        <div className="p-2 text-xs font-medium text-destructive bg-destructive/10 rounded-md">
                            {submitError}
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="create-proj-name">Project Name</Label>
                        <Input
                            id="create-proj-name"
                            placeholder="my_database"
                            {...register("name")}
                        />
                        {errors.name && (
                            <span className="text-[11px] font-medium text-destructive">{errors.name.message}</span>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="create-proj-desc">Description</Label>
                        <Textarea
                            id="create-proj-desc"
                            placeholder="Optional project description..."
                            rows={2}
                            {...register("description")}
                        />
                        {errors.description && (
                            <span className="text-[11px] font-medium text-destructive">{errors.description.message}</span>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="create-proj-dialect">SQL Dialect</Label>
                        <Select
                            value={selectedDialect}
                            onValueChange={val => setValue("dialect", val as CreateProjectInput["dialect"])}
                        >
                            <SelectTrigger id="create-proj-dialect" className="w-full">
                                <SelectValue placeholder="Select dialect..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="sqlite">SQLite</SelectItem>
                                    <SelectItem value="postgres">PostgreSQL</SelectItem>
                                    <SelectItem value="mysql">MySQL</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        {errors.dialect && (
                            <span className="text-[11px] font-medium text-destructive">{errors.dialect.message}</span>
                        )}
                    </div>

                    {/* Storage Mode Selection */}
                    <div className="flex flex-col gap-2">
                        <Label className="text-xs font-semibold">Storage Provider</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {/* Local File Storage Card */}
                            <button
                                type="button"
                                onClick={() => handleStorageSelect("database")}
                                className={`relative flex flex-col items-center gap-1.5 p-3 rounded-lg border text-center cursor-pointer transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                                    selectedStorage === "database"
                                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                                        : "border-border hover:border-muted-foreground/40 hover:bg-muted/30"
                                }`}
                            >
                                {selectedStorage === "database" && (
                                    <CheckCircle2 className="absolute top-1.5 right-1.5 size-3.5 text-primary" />
                                )}
                                <HardDrive className={`size-5 ${selectedStorage === "database" ? "text-primary" : "text-muted-foreground"}`} />
                                <span className="text-[11px] font-semibold text-foreground">Local File</span>
                                <span className="text-[9px] text-muted-foreground leading-tight">Free &bull; Offline</span>
                            </button>

                            {/* BYOK Custom Cloud Card */}
                            <button
                                type="button"
                                onClick={() => handleStorageSelect("byok-cloud")}
                                className={`relative flex flex-col items-center gap-1.5 p-3 rounded-lg border text-center cursor-pointer transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                                    selectedStorage === "byok-cloud"
                                        ? "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/30"
                                        : "border-border hover:border-muted-foreground/40 hover:bg-muted/30"
                                }`}
                            >
                                {selectedStorage === "byok-cloud" && (
                                    <CheckCircle2 className="absolute top-1.5 right-1.5 size-3.5 text-amber-500" />
                                )}
                                <Key className={`size-5 ${selectedStorage === "byok-cloud" ? "text-amber-500" : "text-muted-foreground"}`} />
                                <span className="text-[11px] font-semibold text-foreground">Your API Key</span>
                                <span className="text-[9px] text-muted-foreground leading-tight">Free &bull; Own Cloud</span>
                            </button>

                            {/* Managed Cloud Card */}
                            <button
                                type="button"
                                onClick={() => handleStorageSelect("lotus-cloud")}
                                className={`relative flex flex-col items-center gap-1.5 p-3 rounded-lg border text-center transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                                    !isProSubscribed
                                        ? "cursor-not-allowed opacity-60 border-border"
                                        : selectedStorage === "lotus-cloud"
                                            ? "border-sky-500 bg-sky-500/5 ring-1 ring-sky-500/30 cursor-pointer"
                                            : "border-border hover:border-muted-foreground/40 hover:bg-muted/30 cursor-pointer"
                                }`}
                            >
                                {selectedStorage === "lotus-cloud" && isProSubscribed && (
                                    <CheckCircle2 className="absolute top-1.5 right-1.5 size-3.5 text-sky-500" />
                                )}
                                {!isProSubscribed && (
                                    <Lock className="absolute top-1.5 right-1.5 size-3 text-muted-foreground" />
                                )}
                                <Cloud className={`size-5 ${selectedStorage === "lotus-cloud" ? "text-sky-500" : "text-muted-foreground"}`} />
                                <span className="text-[11px] font-semibold text-foreground">Managed Cloud</span>
                                {isProSubscribed ? (
                                    <span className="text-[9px] text-muted-foreground leading-tight">Pro &bull; Auto Sync</span>
                                ) : (
                                    <Badge variant="outline" className="text-[8px] px-1 py-0 font-medium text-muted-foreground border-muted-foreground/30">
                                        Pro Only
                                    </Badge>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* BYOK API Key Input (shown when BYOK is selected) */}
                    {selectedStorage === "byok-cloud" && (
                        <div className="flex flex-col gap-3 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="byok-endpoint" className="text-xs font-semibold flex items-center gap-1.5">
                                    <Key className="size-3 text-amber-500" />
                                    Storage Endpoint URL
                                </Label>
                                <Input
                                    id="byok-endpoint"
                                    placeholder="libsql://your-database-org.turso.io"
                                    value={byokEndpoint}
                                    onChange={e => setByokEndpoint(e.target.value)}
                                    className="font-mono text-xs"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="byok-api-key" className="text-xs font-semibold flex items-center gap-1.5">
                                    <Key className="size-3 text-amber-500" />
                                    API Key / Auth Token
                                </Label>
                                <Input
                                    id="byok-api-key"
                                    type="password"
                                    autoComplete="off"
                                    placeholder="ey..."
                                    value={byokApiKey}
                                    onChange={e => setByokApiKey(e.target.value)}
                                    className="font-mono text-xs"
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    Your key is stored securely in local browser storage. It never leaves your device.
                                </p>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0 mt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="cursor-pointer font-semibold gap-1.5">
                            {isSubmitting && <Loader2 className="size-3.5 animate-spin" data-icon="inline-start" />}
                            <span>{isSubmitting ? "Creating..." : "Create Project"}</span>
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
