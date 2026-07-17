"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Terminal, CheckCircle2, Cpu, FileCode2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DrizzleSection(): React.JSX.Element {
  return (
    <section id="drizzle" className="py-16 md:py-24 bg-gradient-to-b from-background via-primary/5 to-background relative overflow-hidden">
      
      {/* Glow Blur */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[450px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column Text */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <Sparkles className="size-3.5" />
              <span>Built for Drizzle ORM Developers</span>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl leading-tight">
              Type-Safe Data Modeling with Drizzle ORM & Drizzle Kit
            </h2>

            <p className="text-muted-foreground text-base leading-relaxed">
              Schema Flow integrates directly with Drizzle ORM (`drizzle-orm/libsql`). Define your tables visually and immediately run migrations or push updates with standard Drizzle CLI tools.
            </p>

            <ul className="space-y-3 text-sm text-foreground">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                <span>Zero-overhead TypeScript models with `sqliteTable`, `pgTable`, `mysqlTable`</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                <span>Seamless Drizzle Kit CLI migrations via `pnpm run db:push` and `db:studio`</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                <span>Automatic 1:1, 1:N, and N:M `relations` mapping for relational queries</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                <span>Full compatibility with Turso Cloud Edge and local SQLite database files</span>
              </li>
            </ul>

            <div className="pt-4">
              <Link href="/workspace">
                <Button size="lg" className="gap-2 font-semibold shadow-lg shadow-primary/20 cursor-pointer">
                  <span>Start Building with Drizzle ORM</span>
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Code Window */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-border/80 bg-slate-950 text-slate-100 p-5 shadow-2xl font-mono text-xs space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-sans">
                <div className="flex items-center gap-2">
                  <Terminal className="size-4 text-amber-400" />
                  <span className="font-semibold text-slate-200">Terminal & Drizzle CLI</span>
                </div>
                <span className="text-[11px] text-slate-400">drizzle-kit v0.31</span>
              </div>

              <div className="space-y-2 text-slate-300">
                <div className="flex items-center gap-2 text-emerald-400">
                  <span>$</span>
                  <span className="text-slate-100">pnpm run db:push</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  [drizzle-kit] Reading schema file: ./packages/db/schema.ts <br />
                  [drizzle-kit] Connecting to Turso database: libsql://schema-flow... <br />
                  <span className="text-emerald-400">✓ Database schema is up to date!</span>
                </p>

                <div className="flex items-center gap-2 text-emerald-400 pt-3">
                  <span>$</span>
                  <span className="text-slate-100">pnpm run db:studio</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  [drizzle-studio] Drizzle Studio is running on <span className="text-sky-400 underline">https://local.drizzle.team</span>
                </p>
              </div>

              {/* Code Snippet */}
              <div className="border-t border-slate-800 pt-4 space-y-1 text-slate-400">
                <div className="text-amber-400">// Query using Drizzle ORM Relational API</div>
                <div><span className="text-purple-400">const</span> project = <span className="text-purple-400">await</span> db.query.projects.findFirst(&#123;</div>
                <div className="pl-4">where: eq(projects.id, <span className="text-amber-300">"proj-1"</span>),</div>
                <div className="pl-4">with: &#123; tables: &#123; with: &#123; columns: <span className="text-purple-400">true</span> &#125; &#125; &#125;,</div>
                <div>&#125;);</div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
