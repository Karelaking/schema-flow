"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, AlignJustify } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

/**
 * Type representation for a navigation menu section link.
 */
export type NavigationSection = {
  title: string;
  href: string;
};

/**
 * Default navigation section links for Schema Flow.
 */
const navigationData: NavigationSection[] = [
  {
    title: "Features",
    href: "#features",
  },
  {
    title: "Integration",
    href: "#showcase",
  },
  {
    title: "Support",
    href: "#drizzle",
  },
  {
    title: "Docs",
    href: "#code",
  },
  {
    title: "Pricing",
    href: "#pricing",
  },
];

/**
 * Props for CollaborateButton component.
 */
export type CollaborateButtonProps = {
  className?: string;
};

/**
 * Interactive call-to-action button for collaboration and workspace navigation.
 */
const CollaborateButton = ({ className = "" }: CollaborateButtonProps): React.JSX.Element => (
  <Link
    href="https://github.com/karelaking/schema-flow"
    target="_blank"
    rel="noopener noreferrer"
    className={cn(
      "relative inline-flex items-center justify-center text-xs font-semibold rounded-full h-10 p-1 ps-4 pe-12 group transition-all duration-500 hover:ps-12 hover:pe-4 w-fit overflow-hidden bg-foreground text-background hover:bg-foreground/90 cursor-pointer shadow-xs border border-transparent select-none",
      className
    )}
  >
    <span className="relative z-10 transition-all duration-500 whitespace-nowrap">
      Let's Contribute
    </span>
    <div className="absolute right-1 size-8 bg-background text-foreground rounded-full flex items-center justify-center transition-all duration-500 group-hover:right-[calc(100%-36px)] group-hover:rotate-45 shrink-0">
      <ArrowUpRight size={16} />
    </div>
  </Link>
);

/**
 * Main Navbar component adhering to the block-based grid theme and border container structure.
 */
export const Navbar = (): React.JSX.Element => {
  const [sticky, setSticky] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleScroll = useCallback((): void => {
    setSticky(window.scrollY >= 20);
  }, []);

  const handleResize = useCallback((): void => {
    if (window.innerWidth >= 768) {
      setIsOpen(false);
    }
  }, []);

  useEffect((): (() => void) => {
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return (): void => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [handleScroll, handleResize]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/40 transition-all duration-300",
        sticky
          ? "bg-background/95 backdrop-blur-md shadow-xs"
          : "bg-background/60 backdrop-blur-xs"
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 border-x border-border/40">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group transition-opacity hover:opacity-90 shrink-0">
          <div className="flex size-8 items-center justify-center rounded-full bg-foreground text-background font-bold shadow-xs transition-transform group-hover:scale-105">
            <span className="text-xs font-mono font-black tracking-tighter">sf.</span>
          </div>
          <span className="font-extrabold text-lg tracking-tight text-foreground">
            schemaflow<span className="text-primary font-black">.</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center">
          <NavigationMenu aria-label="Main Navigation" className="bg-muted/50 p-1 rounded-full border border-border/40 shadow-2xs">
            <NavigationMenuList className="flex gap-1">
              {navigationData.map(navItem => (
                <NavigationMenuItem key={navItem.title}>
                  <NavigationMenuLink
                    href={navItem.href}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-full text-muted-foreground hover:text-foreground hover:bg-background transition-all"
                  >
                    {navItem.title}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          <CollaborateButton />
        </div>

        {/* Mobile Controls */}
        <div className="md:hidden flex items-center gap-2">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger
              aria-label="Toggle Navigation Menu"
              className="rounded-full bg-background border border-border p-2 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex items-center justify-center cursor-pointer transition-colors hover:bg-muted"
            >
              <AlignJustify size={18} />
              <span className="sr-only">Toggle Navigation Menu</span>
            </SheetTrigger>

            <SheetContent side="right" className="w-80 p-6 bg-card border-l border-border shadow-xl">
              <SheetHeader className="pb-4 border-b border-border/40 mb-4 text-left">
                <SheetTitle className="text-base font-bold">Navigation</SheetTitle>
              </SheetHeader>
              <nav aria-label="Mobile Navigation Menu" className="flex flex-col gap-2">
                {navigationData.map(item => (
                  <a
                    key={item.title}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="w-full cursor-pointer text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-muted transition-colors text-foreground block"
                  >
                    {item.title}
                  </a>
                ))}
              </nav>
              <div className="pt-6 border-t border-border/50 mt-6">
                <CollaborateButton className="w-full h-11" />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;



