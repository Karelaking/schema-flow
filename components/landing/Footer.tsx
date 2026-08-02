"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Landing page Footer styled in Hero grid theme.
 */
export function Footer(): React.JSX.Element {
  return (
    <footer className="relative w-full border-b border-border/40 bg-background text-foreground overflow-hidden">
      
      {/* Bottom Call to Action Grid Section */}
      <div className="mx-auto max-w-7xl border-x border-border/40">
        <div className="p-8 sm:p-14 lg:p-20 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground max-w-3xl mx-auto leading-tight">
            Ready to Design Your Database Architecture?
          </h2>

          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Launch Schema Flow now, build your ERD visually, and export type-safe Drizzle ORM code in seconds.
          </p>

          <div className="pt-2 flex items-center justify-center">
            <Link
              href="/workspace"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background font-bold px-8 py-3.5 text-sm shadow-lg hover:opacity-90 transition-all cursor-pointer"
            >
              <span>Launch Workspace Now</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* Footer Sub-Bar with Links and Copyright */}
        <div className="border-t border-border/40 px-6 sm:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-medium">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-full bg-foreground text-background flex items-center justify-center font-mono font-bold text-[10px]">
              sf.
            </div>
            <span className="font-bold text-foreground">schemaflow.</span>
            <span>© {new Date().getFullYear()} Schema Flow. Open source & self-hostable.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#showcase" className="hover:text-foreground transition-colors">Integration</a>
            <a href="#drizzle" className="hover:text-foreground transition-colors">Drizzle ORM</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Storage</a>
          </div>
        </div>
      </div>

    </footer>
  );
}
