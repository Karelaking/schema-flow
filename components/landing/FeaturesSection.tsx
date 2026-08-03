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
      badge: "Drizzle Core",
      title: "Drizzle ORM Native Integration",
      description: "Generate type-safe Drizzle ORM schemas, relational mappings (`relations`), and migration DDLs instantly from your visual diagram.",
    },
    {
      icon: Code2,
      badge: "Multi-Dialect",
      title: "Multi-Dialect Code Export",
      description: "Seamlessly convert schemas between Drizzle ORM, SQLite, PostgreSQL, and MySQL dialects with a single click.",
    },
    {
      icon: Cloud,
      badge: "BYO Key",
      title: "Turso & Local File Storage",
      description: "Supports local SQLite databases (`file:./data/schema-flow.db`) and Turso Edge Cloud databases (`libsql://...`).",
    },
    {
      icon: Layers,
      badge: "Visual ERD",
      title: "Interactive ERD Node Canvas",
      description: "Drag and drop tables, customize column types, set primary/foreign keys, auto-arrange layouts, and export visual diagram images.",
    },
    {
      icon: Terminal,
      badge: "Queries",
      title: "Interactive Query Builder",
      description: "Generate SELECT, INSERT, UPDATE, and DELETE queries for any table in your project with customizable parameters.",
    },
    {
      icon: ShieldAlert,
      badge: "Validator",
      title: "Real-Time AST Validator",
      description: "Automatic background checks flag missing foreign keys, duplicate column names, circular dependencies, and invalid indexes.",
    },
  ];

  return (
    <section ref={sectionRef} id="features" className="relative w-full border-b border-border/40 bg-background overflow-hidden">
      <div className="mx-auto max-w-7xl border-x border-border/40 py-16 md:py-24">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 px-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Everything You Need for Modern Database Architecture
          </h2>
          <p className="mt-4 text-muted-foreground text-sm sm:text-base">
            Built from the ground up to empower developers, database administrators, and software architects.
          </p>
        </div>

        {/* 6-Grid Framed Card Matrix */}
        <div ref={cardsGridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-border/40">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx}
                className="p-8 sm:p-10 flex flex-col justify-between space-y-6 border-b border-r border-border/40 hover:bg-muted/10 transition-colors group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="size-10 rounded-full bg-foreground/5 border border-border/60 flex items-center justify-center text-foreground group-hover:scale-105 transition-transform">
                      <Icon className="size-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground px-2.5 py-0.5 rounded-full border border-border/40">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors mb-2">
                    {feat.title}
                  </h3>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-border/30 flex items-center gap-1.5 text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                  <span>Explore Feature</span>
                  <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
