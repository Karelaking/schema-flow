"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Landing page Footer styled in Hero grid theme.
 */
export function Footer(): React.JSX.Element {
  return (
    <footer className="relative w-full border-b border-border/40 bg-background text-foreground overflow-hidden" aria-label="Site Footer">
      
      {/* Bottom Call to Action Grid Section */}
      <div className="mx-auto max-w-7xl border-x border-border/40 relative z-10">
        
        {/* Background Ambient Radial Glow */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="size-125 rounded-full bg-linear-to-tr from-blue-600/15 via-indigo-500/10 to-cyan-400/15 blur-3xl animate-pulse" />
        </div>

        <section className="p-10 sm:p-16 lg:p-24 text-center space-y-6 relative z-10" aria-label="Call to action">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground max-w-3xl mx-auto leading-tight">
            Ready to Architect Your Database <br className="hidden sm:inline" />
            at the Speed of Thought?
          </h2>

          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Launch Schema Flow in 1-click. Build interactive ERD diagrams visually, auto-generate multi-dialect SQL schemas, and export type-safe Drizzle ORM models instantly.
          </p>

          <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/workspace"
              aria-label="Launch Workspace Now"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background font-bold px-8 py-3.5 text-sm shadow-xl hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Launch Workspace Now</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>

            <a
              href="https://github.com/karelaking/schema-flow"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View Schema Flow GitHub Repository"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border/80 bg-background/80 hover:bg-muted/60 text-foreground font-semibold px-6 py-3.5 text-sm backdrop-blur-xs transition-all hover:border-foreground/30 cursor-pointer"
            >
              <span>GitHub Repository</span>
            </a>
          </div>
        </section>

        {/* Footer Sub-Bar with Links and Copyright */}
        <div className="border-t border-border/40 px-6 sm:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-medium">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-full bg-foreground text-background flex items-center justify-center font-mono font-bold text-[10px]">
              sf.
            </div>
            <span className="font-bold text-foreground">schemaflow.studio</span>
            <p className="text-center">© 2026 Schema Flow Studio. Crafted by <a href="https://mk-katiyar.in" target="_blank" rel="noopener noreferrer" className="font-bold text-foreground hover:underline">MRADUL KUMAR Katiyar</a>.</p>
          </div>  

          <nav className="flex items-center gap-6" aria-label="Footer Navigation">
            <a href="#showcase" className="hover:text-foreground transition-colors">Interactive Demo</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#drizzle" className="hover:text-foreground transition-colors">Drizzle ORM</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Storage & Pricing</a>
            <Link href={"/cookies" as any} className="hover:text-foreground transition-colors">Cookie Policy</Link>
            <a href="https://github.com/karelaking/schema-flow" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
          </nav>
        </div>
      </div>

    </footer>
  );
}
