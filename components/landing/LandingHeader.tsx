"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Database, Sparkles, ArrowRight, Menu } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from "@/components/ui/sheet";

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";

export function LandingHeader(): React.JSX.Element {
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  const { isSignedIn } = useUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md backdrop-saturate-150 transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group transition-opacity hover:opacity-90">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20 group-hover:scale-105 transition-transform duration-200">
            <Database className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight leading-none bg-linear-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
              Schema Flow
            </span>
            <span className="text-[10px] font-medium text-primary tracking-wider uppercase font-mono mt-0.5">
              Drizzle ORM Ready
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#pricing" className="transition-colors hover:text-foreground">
            Pricing
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

          {isSignedIn ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm" className="text-xs font-semibold cursor-pointer">
                Sign In
              </Button>
            </SignInButton>
          )}

          <Link href="/workspace" className={buttonVariants({ size: "sm", className: "font-semibold shadow-md shadow-primary/20 hover:scale-102 transition-all cursor-pointer hidden sm:inline-flex" })}>
            <span>Launch Workspace</span>
            <ArrowRight className="size-4" data-icon="inline-end" />
          </Link>

          {/* Mobile Nav Trigger */}
          <div className="md:hidden flex items-center">
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger render={
                <Button variant="ghost" size="icon" aria-label="Toggle Mobile Navigation" className="h-9 w-9">
                  <Menu className="size-5" />
                </Button>
              } />
              <SheetContent side="right" className="p-6 flex flex-col gap-6">
                <SheetTitle className="text-base font-bold flex items-center gap-2">
                  <Database className="size-5 text-primary" />
                  Navigation
                </SheetTitle>
                <nav aria-label="Mobile navigation" className="flex flex-col gap-4 text-sm font-medium text-muted-foreground">
                  <a href="#features" onClick={() => setMobileNavOpen(false)} className="transition-colors hover:text-foreground py-1">
                    Features
                  </a>
                  <a href="#showcase" onClick={() => setMobileNavOpen(false)} className="transition-colors hover:text-foreground py-1">
                    Live Preview
                  </a>
                  <a href="#drizzle" onClick={() => setMobileNavOpen(false)} className="flex items-center gap-1.5 transition-colors hover:text-foreground py-1">
                    <Sparkles className="size-4 text-amber-500" />
                    <span>Drizzle ORM</span>
                  </a>
                  <a href="#code" onClick={() => setMobileNavOpen(false)} className="transition-colors hover:text-foreground py-1">
                    Code Output
                  </a>
                </nav>
                <Link href="/workspace" onClick={() => setMobileNavOpen(false)} className={buttonVariants({ size: "default", className: "w-full font-semibold mt-4 gap-2" })}>
                  <span>Launch Workspace</span>
                  <ArrowRight className="size-4" data-icon="inline-end" />
                </Link>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
