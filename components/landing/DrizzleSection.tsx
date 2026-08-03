"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Terminal, CheckCircle2 } from "lucide-react";

/**
 * Drizzle ORM integration section styled in Hero grid theme.
 */
export function DrizzleSection(): React.JSX.Element {
  return (
    <section id="drizzle" className="relative w-full border-b border-border/40 bg-background overflow-hidden">
      {/* Background Ambient Radial Glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="size-125 rounded-full bg-linear-to-tr from-sky-600/10 via-indigo-500/10 to-blue-500/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl border-x border-border/40 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border/40">
          
          {/* Left Column Text */}
          <div className="lg:col-span-6 p-8 sm:p-12 lg:p-16 flex flex-col justify-between space-y-6">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight mb-6">
                Type-Safe Data Modeling with Drizzle ORM & Drizzle Kit
              </h2>

              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-6">
                Schema Flow integrates directly with Drizzle ORM (`drizzle-orm/libsql`). Define your tables visually and immediately run migrations or push updates with standard Drizzle CLI tools.
              </p>

              <ul className="space-y-3 text-xs sm:text-sm text-foreground font-medium">
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
              </ul>
            </div>

            <Link href="/workspace" className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background font-bold px-7 py-3 text-xs sm:text-sm shadow-md hover:opacity-90 transition-all cursor-pointer w-fit">
              <span>Start Building with Drizzle ORM</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {/* Right Column: Terminal Window */}
          <div className="lg:col-span-6 p-8 sm:p-12 lg:p-16 flex items-center justify-center bg-card/40 backdrop-blur-md">
            <div className="w-full max-w-lg rounded-2xl border border-border/80 bg-background/95 text-foreground p-5 shadow-2xl font-mono text-xs space-y-4">
              
              <div className="flex items-center justify-between border-b border-border/60 pb-3 font-sans">
                <div className="flex items-center gap-2">
                  <Terminal className="size-4 text-sky-400" />
                  <span className="font-semibold text-foreground">Terminal & Drizzle CLI</span>
                </div>
                <span className="text-[11px] text-muted-foreground font-mono">drizzle-kit v0.31</span>
              </div>

              <div className="space-y-2 text-muted-foreground">
                <div className="flex items-center gap-2 text-emerald-400">
                  <span>$</span>
                  <span className="text-foreground font-semibold">pnpm run db:push</span>
                </div>
                <p className="text-muted-foreground/80 text-[11px]">
                  [drizzle-kit] Reading schema file: ./packages/db/schema.ts <br />
                  [drizzle-kit] Connecting to Turso database: libsql://schema-flow... <br />
                  <span className="text-emerald-400 font-semibold">✓ Database schema is up to date!</span>
                </p>

                <div className="flex items-center gap-2 text-emerald-400 pt-3">
                  <span>$</span>
                  <span className="text-foreground font-semibold">pnpm run db:studio</span>
                </div>
                <p className="text-muted-foreground/80 text-[11px]">
                  [drizzle-studio] Drizzle Studio is running on <span className="text-sky-400 underline">https://local.drizzle.team</span>
                </p>
              </div>

              {/* Code Snippet */}
              <div className="border-t border-border/40 pt-4 space-y-1 text-muted-foreground">
                <div className="text-muted-foreground/60">// Query using Drizzle ORM Relational API</div>
                <div><span className="text-sky-400">const</span> project = <span className="text-sky-400">await</span> db.query.projects.findFirst(&#123;</div>
                <div className="pl-4">where: eq(projects.id, <span className="text-amber-400">"proj-1"</span>),</div>
                <div className="pl-4">with: &#123; tables: &#123; with: &#123; columns: <span className="text-sky-400">true</span> &#125; &#125; &#125;,</div>
                <div>&#125;);</div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
