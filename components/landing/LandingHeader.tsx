"use client";

import React from "react";
import Link from "next/link";
import { Database, Sparkles, ArrowRight, Layers, Cpu, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function LandingHeader(): React.JSX.Element {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md backdrop-saturate-150 transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group transition-opacity hover:opacity-90">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20 group-hover:scale-105 transition-transform duration-200">
            <Database className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight leading-none bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
              Schema Flow
            </span>
            <span className="text-[10px] font-medium text-primary tracking-wider uppercase font-mono mt-0.5">
              Drizzle ORM Ready
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#showcase" className="transition-colors hover:text-foreground">
            Live Preview
          </a>
          <a href="#drizzle" className="flex items-center gap-1.5 transition-colors hover:text-foreground">
            <Sparkles className="size-3.5 text-amber-500" />
            <span>Drizzle ORM</span>
          </a>
          <a href="#code" className="transition-colors hover:text-foreground">
            Code Output
          </a>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/workspace">
            <Button size="sm" className="gap-2 font-semibold shadow-md shadow-primary/20 hover:scale-102 transition-all cursor-pointer">
              <span>Launch Workspace</span>
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
