"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, HardDrive, Server, Key, ArrowRight } from "lucide-react";
import { CustomDbConnectionDialog } from "@/components/modals/CustomDbConnectionDialog";

/**
 * Open Source Storage Options section styled in Hero grid theme.
 */
export function PricingSection(): React.JSX.Element {
    const [customDbOpen, setCustomDbOpen] = useState<boolean>(false);

    return (
        <section id="pricing" className="relative w-full border-b border-border/40 bg-background overflow-hidden">
            <div className="mx-auto max-w-7xl border-x border-border/40 py-16 md:py-24">
                
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16 px-4">
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                        Flexible Storage: Local Disk or Your Own Database
                    </h2>
                    <p className="mt-4 text-muted-foreground text-sm sm:text-base">
                        Schema Flow is completely free and open-source. Save encrypted .lotus files locally on disk or connect your own database with your API Key / Auth Token. Zero vendor lock-in.
                    </p>
                </div>

                {/* 2-Column Framed Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 border-t border-border/40">
                    
                    {/* Option 1: Local Disk Storage */}
                    <div className="p-8 sm:p-12 flex flex-col justify-between space-y-8 border-b md:border-b-0 md:border-r border-border/40 hover:bg-muted/5 transition-colors">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-extrabold text-foreground flex items-center gap-2">
                                    <HardDrive className="size-5 text-primary" />
                                    Local Disk Storage (.lotus)
                                </h3>
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 rounded-full">
                                    100% Offline
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Save encrypted schema files directly on your file system. 100% offline and secure.
                            </p>

                            <div className="mt-6 flex items-baseline gap-1">
                                <span className="text-4xl font-extrabold text-foreground">Free</span>
                                <span className="text-xs text-muted-foreground">/ Open Source</span>
                            </div>

                            <ul className="mt-8 space-y-3 text-xs text-foreground font-medium">
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
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-border/80 bg-background text-foreground font-bold px-6 py-3 text-xs sm:text-sm hover:bg-muted transition-all cursor-pointer w-full text-center"
                        >
                            <span>Launch Local Workspace</span>
                            <ArrowRight className="size-3.5" />
                        </Link>
                    </div>

                    {/* Option 2: Bring Your Own Database */}
                    <div className="p-8 sm:p-12 flex flex-col justify-between space-y-8 hover:bg-muted/5 transition-colors">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-extrabold text-foreground flex items-center gap-2">
                                    <Server className="size-5 text-primary" />
                                    Bring Your Own Database
                                </h3>
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded-full">
                                    BYO Key
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Connect Schema Flow to your own Turso, LibSQL, or SQLite database using your own URL & API Key.
                            </p>

                            <div className="mt-6 flex items-baseline gap-1">
                                <span className="text-4xl font-extrabold text-foreground">BYO Key</span>
                                <span className="text-xs text-muted-foreground">/ Your Database</span>
                            </div>

                            <ul className="mt-8 space-y-3 text-xs text-foreground font-medium">
                                <li className="flex items-center gap-2">
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

                        <button
                            type="button"
                            onClick={() => setCustomDbOpen(true)}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background font-bold px-6 py-3 text-xs sm:text-sm shadow-md hover:opacity-90 transition-all cursor-pointer w-full"
                        >
                            <span>Configure Database Credentials</span>
                            <ArrowRight className="size-3.5" />
                        </button>
                    </div>

                </div>
            </div>

            <CustomDbConnectionDialog open={customDbOpen} onOpenChange={setCustomDbOpen} />
        </section>
    );
}
