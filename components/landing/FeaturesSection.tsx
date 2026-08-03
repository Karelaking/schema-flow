"use client";

import React, { useEffect, useRef } from "react";
import { 
  Zap, 
  Code2, 
  Cloud, 
  Layers, 
  Terminal, 
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

export function FeaturesSection(): React.JSX.Element {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    import("gsap").then(({ default: gsap }) => {
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
          if (cardsGridRef.current) {
            const cards = cardsGridRef.current.children;
            gsap.fromTo(
              cards,
              { y: 35, opacity: 0, scale: 0.96 },
              {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.8,
                stagger: 0.12,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: cardsGridRef.current,
                  start: "top 85%",
                  toggleActions: "play none none reverse",
                },
              }
            );
          }
        }, sectionRef);

        return () => ctx.revert();
      }).catch(() => {});
    }).catch(() => {});
  }, []);

  const features = [
    {
      icon: Zap,
      badge: "AST Core",
      title: "Visual SQL & Schema Architecture",
      description: "Transform interactive ERD diagrams into production-grade database DDLs, relational mappings, and type-safe schemas instantly.",
      iconColor: "text-sky-400",
      iconBg: "bg-sky-500/15 border-sky-500/30",
    },
    {
      icon: Code2,
      badge: "Multi-Dialect",
      title: "Multi-Dialect Code Export",
      description: "Seamlessly convert schemas between Drizzle ORM, SQLite, PostgreSQL, and MySQL dialects with a single click.",
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/15 border-blue-500/30",
    },
    {
      icon: Cloud,
      badge: "BYO Key",
      title: "Turso & Local File Storage",
      description: "Supports local SQLite databases (`file:./data/schema-flow.db`) and Turso Edge Cloud databases (`libsql://...`).",
      iconColor: "text-cyan-400",
      iconBg: "bg-cyan-500/15 border-cyan-500/30",
    },
    {
      icon: Layers,
      badge: "Visual ERD",
      title: "Interactive ERD Node Canvas",
      description: "Drag and drop tables, customize column types, set primary/foreign keys, auto-arrange layouts, and export visual diagram images.",
      iconColor: "text-indigo-400",
      iconBg: "bg-indigo-500/15 border-indigo-500/30",
    },
    {
      icon: Terminal,
      badge: "Queries",
      title: "Interactive Query Builder",
      description: "Generate SELECT, INSERT, UPDATE, and DELETE queries for any table in your project with customizable parameters.",
      iconColor: "text-amber-400",
      iconBg: "bg-amber-500/15 border-amber-500/30",
    },
    {
      icon: ShieldAlert,
      badge: "Validator",
      title: "Real-Time AST Validator",
      description: "Automatic background checks flag missing foreign keys, duplicate column names, circular dependencies, and invalid indexes.",
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/15 border-emerald-500/30",
    },
  ];

  return (
    <section ref={sectionRef} id="features" className="relative w-full border-b border-border/40 bg-background overflow-hidden">
      {/* Background Ambient Radial Glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="size-125 rounded-full bg-linear-to-tr from-blue-600/10 via-indigo-500/10 to-cyan-400/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl border-x border-border/40 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto pt-16 md:pt-24 pb-14 px-4 space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            Everything You Need for Modern Database Architecture
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Built from the ground up to empower developers, database administrators, and software architects with visual, type-safe tools.
          </p>
        </div>

        {/* 6-Grid Framed Card Matrix with Perfect Grid Borders & Micro-Animations */}
        <div ref={cardsGridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-border/40">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx}
                className="relative px-6 sm:px-8 py-5 sm:py-6 flex flex-col justify-between space-y-4 border-b border-r border-border/40 lg:nth-[3n]:border-r-0 md:max-lg:nth-[2n]:border-r-0 lg:nth-[n+4]:border-b-0 bg-card/30 hover:bg-card/75 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-sky-500/5 group overflow-hidden"
              >
                {/* Micro-Animation: Ambient Card Hover Glow */}
                <div className="absolute -top-24 -right-24 size-48 rounded-full bg-linear-to-br from-blue-500/10 via-indigo-500/10 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3.5">
                    {/* Micro-Animation: Icon Container Scale & Rotate */}
                    <div className={`size-10 rounded-xl border flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-md ${feat.iconBg}`}>
                      <Icon className={`size-4.5 transition-transform duration-300 group-hover:scale-110 ${feat.iconColor}`} />
                    </div>

                    {/* Micro-Animation: Badge Hover Transition */}
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground px-2.5 py-0.5 rounded-full border border-border/60 bg-muted/40 group-hover:border-border group-hover:text-foreground transition-all duration-300">
                      {feat.badge}
                    </span>
                  </div>

                  {/* Micro-Animation: Title Slide & Accent */}
                  <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground transition-all duration-300 group-hover:translate-x-0.5 mb-1.5">
                    {feat.title}
                  </h3>

                  <p className="text-xs text-muted-foreground leading-relaxed transition-colors duration-300 group-hover:text-foreground/80">
                    {feat.description}
                  </p>
                </div>

                {/* Micro-Animation: Full-Width High-Contrast Action CTA Bar */}
                <div className="relative z-10 pt-3 border-t border-border/40">
                  <div className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg bg-muted/40 group-hover:bg-foreground group-hover:text-background border border-border/60 group-hover:border-foreground transition-all duration-300 text-xs font-bold cursor-pointer shadow-xs">
                    <span>Explore Feature</span>
                    <div className="size-5 rounded bg-background group-hover:bg-background/20 flex items-center justify-center shrink-0 border border-border/60 group-hover:border-background/30 transition-colors">
                      <ArrowRight className="size-3 text-foreground group-hover:text-background group-hover:translate-x-0.5 transition-all duration-300" />
                    </div>
                  </div>
                </div>

                {/* Micro-Animation: Expandable Bottom Laser Line Beam */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-sky-400 via-indigo-400 to-cyan-300 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
