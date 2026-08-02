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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 border-x border-border/40">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group transition-opacity hover:opacity-90">
          <div className="flex size-8 items-center justify-center rounded-full bg-foreground text-background font-bold shadow-xs transition-transform group-hover:scale-105">
            <span className="text-xs font-mono font-black tracking-tighter">sf.</span>
          </div>
          <span className="font-extrabold text-lg tracking-tight text-foreground">
            schemaflow<span className="text-primary font-black">.</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-7 text-xs font-semibold text-muted-foreground">
          <a href="#features" className="transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#showcase" className="transition-colors hover:text-foreground">
            Integration
          </a>
          <a href="#drizzle" className="transition-colors hover:text-foreground">
            Support
          </a>
          <a href="#code" className="transition-colors hover:text-foreground">
            Docs
          </a>
          <a href="#pricing" className="transition-colors hover:text-foreground">
            Pricing
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

          <Link href="/workspace" className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background px-4 py-2 text-xs font-semibold text-foreground shadow-xs hover:bg-muted transition-all cursor-pointer">
            <span>Launch Workspace</span>
            <ArrowRight className="size-3.5" />
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
                    Integration
                  </a>
                  <a href="#drizzle" onClick={() => setMobileNavOpen(false)} className="transition-colors hover:text-foreground py-1">
                    Support
                  </a>
                  <a href="#code" onClick={() => setMobileNavOpen(false)} className="transition-colors hover:text-foreground py-1">
                    Docs
                  </a>
                  <a href="#pricing" onClick={() => setMobileNavOpen(false)} className="transition-colors hover:text-foreground py-1">
                    Pricing
                  </a>
                </nav>
                <Link href="/workspace" onClick={() => setMobileNavOpen(false)} className={buttonVariants({ size: "default", className: "w-full font-semibold mt-4 gap-2 rounded-full" })}>
                  <span>Launch Workspace</span>
                  <ArrowRight className="size-4" />
                </Link>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
