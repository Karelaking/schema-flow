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
        <section id="pricing" aria-label="Storage Options and Licensing" className="relative w-full border-b border-border/40 bg-background overflow-hidden">
            {/* Background Ambient Radial Glow */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="size-125 rounded-full bg-linear-to-tr from-blue-600/10 via-indigo-500/10 to-cyan-400/10 blur-3xl" />
            </div>

            <div className="mx-auto max-w-7xl border-x border-border/40 relative z-10">
                
                {/* Section Header */}
                <header className="text-center max-w-3xl mx-auto pt-16 md:pt-24 pb-14 px-4 space-y-4">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                        100% Free & Open Source. <br className="hidden sm:inline" />
                        Zero Vendor Lock-in.
                    </h2>
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
                        Save encrypted database schemas directly on your local disk or connect your own edge database with your private credentials. You retain 100% ownership of your data.
                    </p>
                </header>

                {/* 2-Column Framed Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 border-t border-border/40 divide-y md:divide-y-0 md:divide-x divide-border/40">
                    
                    {/* Option 1: Local Disk Storage */}
                    <article className="p-8 sm:p-12 flex flex-col justify-between space-y-8 bg-card/30 hover:bg-card/60 transition-colors">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-extrabold text-foreground flex items-center gap-2">
                                    <HardDrive className="size-5 text-sky-400" aria-hidden="true" />
                                    Local File System
                                </h3>
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground bg-muted/60 border border-border/60 px-2.5 py-0.5 rounded-full">
                                    100% Private
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Store encrypted schema ASTs directly on your local computer. Operates completely offline with zero server requirements.
                            </p>

                            <div className="mt-6 flex items-baseline gap-1">
                                <span className="text-4xl font-extrabold text-foreground font-mono">$0</span>
                                <span className="text-xs text-muted-foreground">/ Free & Open Source</span>
                            </div>

                            <ul className="mt-8 space-y-3 text-xs text-foreground font-medium">
                                <li className="flex items-center gap-2">
                                    <Check className="size-4 text-emerald-500 shrink-0" aria-hidden="true" />
                                    <span>Client-side AES-256-GCM browser encryption</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="size-4 text-emerald-500 shrink-0" aria-hidden="true" />
                                    <span>Instant local auto-save & Chromium workspace sync</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="size-4 text-emerald-500 shrink-0" aria-hidden="true" />
                                    <span>Portable single-file .schema export & import</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="size-4 text-emerald-500 shrink-0" aria-hidden="true" />
                                    <span>Zero registration, zero telemetries, zero lock-in</span>
                                </li>
                            </ul>
                        </div>

                        <Link
                            href="/workspace"
                            aria-label="Launch Local Workspace"
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-border/80 bg-background text-foreground font-bold px-6 py-3 text-xs sm:text-sm hover:bg-muted transition-all cursor-pointer w-full text-center shadow-xs"
                        >
                            <span>Launch Local Workspace</span>
                            <ArrowRight className="size-3.5" aria-hidden="true" />
                        </Link>
                    </article>

                    {/* Option 2: Bring Your Own Database */}
                    <article className="p-8 sm:p-12 flex flex-col justify-between space-y-8 bg-card/30 hover:bg-card/60 transition-colors">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-extrabold text-foreground flex items-center gap-2">
                                    <Server className="size-5 text-indigo-400" aria-hidden="true" />
                                    Bring Your Own Database (BYODB)
                                </h3>
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground bg-muted/60 border border-border/60 px-2.5 py-0.5 rounded-full">
                                    Self-Hosted
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Connect Schema Flow to your own PostgreSQL, MySQL, SQLite, or Turso instance with your private URL & API Key.
                            </p>

                            <div className="mt-6 flex items-baseline gap-1">
                                <span className="text-4xl font-extrabold text-foreground font-mono">BYO Credentials</span>
                            </div>

                            <ul className="mt-8 space-y-3 text-xs text-foreground font-medium">
                                <li className="flex items-center gap-2">
                                    <Key className="size-4 text-sky-400 shrink-0" aria-hidden="true" />
                                    <span>Direct connection to Turso, LibSQL, or local SQLite</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="size-4 text-emerald-500 shrink-0" aria-hidden="true" />
                                    <span>Multi-device real-time database schema persistence</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="size-4 text-emerald-500 shrink-0" aria-hidden="true" />
                                    <span>Complete control over encryption keys & credentials</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="size-4 text-emerald-500 shrink-0" aria-hidden="true" />
                                    <span>Self-host anywhere: Vercel, Docker, or local Node.js</span>
                                </li>
                            </ul>
                        </div>

                        <button
                            type="button"
                            onClick={() => setCustomDbOpen(true)}
                            aria-label="Configure Database Credentials"
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background font-bold px-6 py-3 text-xs sm:text-sm shadow-md hover:opacity-90 transition-all cursor-pointer w-full"
                        >
                            <span>Configure Database Credentials</span>
                            <ArrowRight className="size-3.5" aria-hidden="true" />
                        </button>
                    </article>

                </div>
            </div>

        </section>
    );
}
