"use client";

import React from "react";
import { Database, Zap, Layers, Cpu, Server, Code2, ShieldCheck, Sparkles } from "lucide-react";

/**
 * Prominent, high-impact Logo Cloud section with an infinitely running marquee animation.
 * Features enlarged tech stack logos (Drizzle, Postgres, Supabase, Next.js, Turso, SQLite, MySQL).
 */
export function LogoCloudSection(): React.JSX.Element {
  const logos = [
    {
      id: "drizzle",
      content: (
        <div className="flex items-center gap-3 font-extrabold text-base sm:text-lg md:text-xl text-foreground tracking-tight hover:opacity-100 transition-opacity">
          <div className="size-8 sm:size-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
            <Zap className="size-5 sm:size-6" />
          </div>
          <span className="font-mono font-black tracking-tighter text-foreground">drizzle.orm</span>
        </div>
      ),
    },
    {
      id: "postgresql",
      content: (
        <div className="flex items-center gap-3 font-extrabold text-base sm:text-lg md:text-xl text-foreground tracking-tight hover:opacity-100 transition-opacity">
          <div className="size-8 sm:size-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <Database className="size-5 sm:size-6" />
          </div>
          <span className="font-sans font-black tracking-tight text-foreground">PostgreSQL</span>
        </div>
      ),
    },
    {
      id: "nextjs",
      content: (
        <div className="flex items-center gap-3 font-extrabold text-base sm:text-lg md:text-xl text-foreground tracking-tight hover:opacity-100 transition-opacity">
          <div className="size-8 sm:size-9 rounded-xl bg-foreground text-background flex items-center justify-center font-mono font-black text-sm sm:text-base shrink-0 shadow-sm">
            N
          </div>
          <span className="font-sans font-black tracking-tight text-foreground">Next.js</span>
        </div>
      ),
    },
    {
      id: "supabase",
      content: (
        <div className="flex items-center gap-3 font-extrabold text-base sm:text-lg md:text-xl text-foreground tracking-tight hover:opacity-100 transition-opacity">
          <div className="size-8 sm:size-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Sparkles className="size-5 sm:size-6" />
          </div>
          <span className="font-sans font-black tracking-tight text-foreground">Supabase</span>
        </div>
      ),
    },
    {
      id: "turso",
      content: (
        <div className="flex items-center gap-3 font-extrabold text-base sm:text-lg md:text-xl text-foreground tracking-tight hover:opacity-100 transition-opacity">
          <div className="size-8 sm:size-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
            <Server className="size-5 sm:size-6" />
          </div>
          <span className="font-sans font-black tracking-tight text-foreground">Turso</span>
        </div>
      ),
    },
    {
      id: "sqlite",
      content: (
        <div className="flex items-center gap-3 font-extrabold text-base sm:text-lg md:text-xl text-foreground tracking-tight hover:opacity-100 transition-opacity">
          <div className="size-8 sm:size-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Layers className="size-5 sm:size-6" />
          </div>
          <span className="font-mono font-black tracking-tight text-foreground">SQLite</span>
        </div>
      ),
    },
    {
      id: "mysql",
      content: (
        <div className="flex items-center gap-3 font-extrabold text-base sm:text-lg md:text-xl text-foreground tracking-tight hover:opacity-100 transition-opacity">
          <div className="size-8 sm:size-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Cpu className="size-5 sm:size-6" />
          </div>
          <span className="font-sans font-black tracking-tight text-foreground">MySQL</span>
        </div>
      ),
    },
  ];

  return (
    <section className="relative w-full border-b border-border/40 bg-background overflow-hidden">
      <div className="mx-auto max-w-7xl border-x border-border/40 px-6 sm:px-10 py-8 sm:py-10 flex flex-col items-center justify-center">

        {/* Infinite Scrolling Marquee Container */}
        <div className="relative flex-1 overflow-hidden w-full py-2">
          
          {/* Gradient Masks on Edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-linear-to-r from-background via-background/80 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-linear-to-l from-background via-background/80 to-transparent z-10" />

          {/* Marquee Track */}
          <div className="flex w-max animate-[marquee_35s_linear_infinite] hover:paused gap-16 sm:gap-24 items-center">
            {/* Set 1 */}
            {logos.map((logo, idx) => (
              <React.Fragment key={`logo-1-${idx}`}>
                {logo.content}
              </React.Fragment>
            ))}

            {/* Set 2 (Duplicate for Seamless Loop) */}
            {logos.map((logo, idx) => (
              <React.Fragment key={`logo-2-${idx}`}>
                {logo.content}
              </React.Fragment>
            ))}

            {/* Set 3 (Triple for Ultra-Wide Screens) */}
            {logos.map((logo, idx) => (
              <React.Fragment key={`logo-3-${idx}`}>
                {logo.content}
              </React.Fragment>
            ))}
          </div>

        </div>

      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
      `}</style>
    </section>
  );
}
