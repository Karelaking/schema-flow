"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, HardDrive, Database, Server, Key, Sparkles } from "lucide-react";
import { buttonVariants, Button } from "@/components/ui/button";
import { CustomDbConnectionDialog } from "@/components/modals/CustomDbConnectionDialog";

/**
 * Open Source Storage Options section on the landing page.
 * Highlights local .lotus disk encryption and Bring Your Own Database (BYO Key) support.
 */
export function PricingSection(): React.JSX.Element {
    const [customDbOpen, setCustomDbOpen] = useState<boolean>(false);

    return (
        <section id="pricing" className="py-20 bg-muted/20 border-t border-border/40 relative">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        <Sparkles className="size-3.5" />
                        <span>100% Free & Open Source</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                        Flexible Storage: Local Disk or Your Own Database
                    </h2>
                    <p className="text-muted-foreground text-sm sm:text-base">
                        Schema Flow is completely free and open-source. Save encrypted .lotus files locally on disk or connect your own database with your API Key / Auth Token. Zero vendor lock-in.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Option 1: Local Disk Storage */}
                    <div className="rounded-2xl border border-border/60 bg-card p-8 flex flex-col justify-between shadow-sm relative">
                        <div>
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                    <HardDrive className="size-5 text-primary" />
                                    Local Disk Storage (.lotus)
                                </h3>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Save encrypted schema files directly on your file system. 100% offline and secure.
                            </p>

                            <div className="mt-6 flex items-baseline gap-1">
                                <span className="text-4xl font-extrabold text-foreground">Free</span>
                                <span className="text-xs text-muted-foreground">/ Open Source</span>
                            </div>

                            <ul className="mt-8 space-y-3 text-xs text-foreground">
                                <li className="flex items-center gap-2">
                                    <Check className="size-4 text-emerald-500 shrink-0" />
                                    <span>Client-side AES-256-GCM encryption</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="size-4 text-emerald-500 shrink-0" />
                                    <span>Automatic disk auto-save (Chromium browsers)</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="size-4 text-emerald-500 shrink-0" />
                                    <span>Portable .lotus file export for sharing</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="size-4 text-emerald-500 shrink-0" />
                                    <span>Zero account or registration needed</span>
                                </li>
                            </ul>
                        </div>

                        <Link
                            href="/workspace"
                            className={buttonVariants({ variant: "outline", className: "w-full mt-8 font-semibold text-xs" })}
                        >
                            Launch Workspace
                        </Link>
                    </div>

                    {/* Option 2: Bring Your Own Database */}
                    <div className="rounded-2xl border-2 border-primary/40 bg-card p-8 flex flex-col justify-between shadow-md relative">
                        <div>
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                    <Server className="size-5 text-primary" />
                                    Bring Your Own Database
                                </h3>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Connect Schema Flow to your own Turso, LibSQL, or SQLite database using your own URL & API Key.
                            </p>

                            <div className="mt-6 flex items-baseline gap-1">
                                <span className="text-4xl font-extrabold text-foreground">BYO Key</span>
                                <span className="text-xs text-muted-foreground">/ Your Database</span>
                            </div>

                            <ul className="mt-8 space-y-3 text-xs text-foreground">
                                <li className="flex items-center gap-2 font-medium text-foreground">
                                    <Key className="size-4 text-primary shrink-0" />
                                    <span>Connect with your own Turso URL & Auth Token</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="size-4 text-emerald-500 shrink-0" />
                                    <span>Multi-device database persistence</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="size-4 text-emerald-500 shrink-0" />
                                    <span>Full control over database credentials & security</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="size-4 text-emerald-500 shrink-0" />
                                    <span>Self-host on Vercel, Docker, or local machine</span>
                                </li>
                            </ul>
                        </div>

                        <Button
                            type="button"
                            onClick={() => setCustomDbOpen(true)}
                            className="w-full mt-8 font-semibold text-xs shadow-md shadow-primary/10 cursor-pointer"
                        >
                            Configure Database Connection
                        </Button>
                    </div>
                </div>
            </div>

            <CustomDbConnectionDialog open={customDbOpen} onOpenChange={setCustomDbOpen} />
        </section>
    );
}
