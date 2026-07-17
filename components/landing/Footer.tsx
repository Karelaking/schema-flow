"use client";

import React from "react";
import Link from "next/link";
import { Database, ArrowRight, Heart, Github, Terminal, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer(): React.JSX.Element {
  return (
    <footer className="border-t border-border/60 bg-card/50 text-card-foreground">
      
      {/* Bottom CTA Banner */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-3xl border border-primary/20 bg-linear-to-r from-primary/10 via-violet-500/10 to-sky-500/10 p-8 sm:p-12 text-center relative overflow-hidden shadow-xl">
          <div className="max-w-2xl mx-auto space-y-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to Design Your Database Architecture?
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base">
              Launch Schema Flow now, build your ERD visually, and export type-safe Drizzle ORM code in seconds.
            </p>
            <div className="pt-2">
              <Link href="/workspace">
                <Button size="lg" className="h-12 px-8 font-semibold shadow-lg shadow-primary/25 cursor-pointer hover:scale-103 transition-transform">
                  <span>Launch Workspace Now</span>
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Sub-links */}
        <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-border/40 pt-8 text-xs text-muted-foreground">
          
          <div className="flex items-center gap-3">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-xs">
              <Database className="size-3.5" />
            </div>
            <span className="font-bold text-sm tracking-tight text-foreground">Schema Flow</span>
            <span className="text-muted-foreground">© {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <Link href="/workspace" className="hover:text-foreground transition-colors">
              Workspace Editor
            </Link>
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#drizzle" className="hover:text-foreground transition-colors">
              Drizzle ORM
            </a>
          </div>

          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Operational & Status OK</span>
          </div>

        </div>
      </div>

    </footer>
  );
}
