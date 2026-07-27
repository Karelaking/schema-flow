"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Database, Code, ShieldCheck, Zap, Layers } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

/**
 * Hero section component for the landing page.
 */
export const HeroSection: React.FC = (): React.ReactElement => {
    return (
        <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-28">
            <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-125 w-200 -translate-x-1/2 rounded-full bg-linear-to-tr from-primary/20 via-sky-500/10 to-violet-500/20 blur-3xl opacity-70" />
            <div className="pointer-events-none absolute top-1/3 -right-20 -z-10 h-87.5 w-87.5 rounded-full bg-violet-600/10 blur-3xl" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary backdrop-blur-md mb-8 animate-fade-in">
                    <Sparkles className="size-3.5 text-amber-500 animate-pulse" />
                    <span>Integrated with Drizzle ORM &amp; Turso Cloud</span>
                    <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-mono font-bold">v0.45</span>
                </div>

                <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl leading-[1.1]">
                    Visually Design Databases. <br className="hidden sm:inline" />
                    <span className="bg-linear-to-r from-primary via-violet-500 to-sky-500 bg-clip-text text-transparent">
                        Export Drizzle ORM
                    </span>{" "}
                    &amp; SQL in Seconds.
                </h1>

                <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
                    Schema Flow is a modern, interactive visual ERD designer. Drag and drop tables, define relations,
                    generate production-ready Drizzle ORM TypeScript models, SQL migrations, and sync effortlessly with Turso Edge Cloud or SQLite.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/workspace"
                        className={buttonVariants({
                            size: "lg",
                            className: "w-full sm:w-auto h-12 px-8 text-base font-semibold shadow-lg shadow-primary/25 hover:scale-103 transition-all cursor-pointer",
                        })}
                    >
                        <span>Launch Interactive Workspace</span>
                        <ArrowRight className="size-4 ml-2" data-icon="inline-end" />
                    </Link>
                    <a
                        href="#showcase"
                        className={buttonVariants({
                            variant: "outline",
                            size: "lg",
                            className: "w-full sm:w-auto h-12 px-6 text-base font-medium border-border/80 hover:bg-muted/50 cursor-pointer",
                        })}
                    >
                        <Code className="size-4 mr-2 text-primary" data-icon="inline-start" />
                        <span>Explore Live Preview</span>
                    </a>
                </div>

                <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-muted-foreground border-t border-border/40 pt-8 max-w-3xl mx-auto">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="size-4 text-emerald-500" />
                        <span>Type-Safe Drizzle ORM</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Zap className="size-4 text-amber-500" />
                        <span>Turso &amp; SQLite Engine</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Layers className="size-4 text-sky-500" />
                        <span>PostgreSQL &amp; MySQL Dialects</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Database className="size-4 text-violet-500" />
                        <span>Visual Relational AST</span>
                    </div>
                </div>
            </div>
        </section>
    );
};
