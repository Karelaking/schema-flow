"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Database, Layers, ShieldCheck, Cpu, Sparkles, Zap, CheckCircle2 } from "lucide-react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const Hero3DModel = dynamic(
    () => import("@/components/landing/Hero3DModel").then(mod => mod.Hero3DModel),
    {
        ssr: false,
        loading: () => <Skeleton className="w-full h-115 rounded-3xl" />,
    }
);
import { AnimatedCounter } from "@/components/landing/AnimatedCounter";
import { cn } from "@/lib/utils";

const ROTATING_WORDS = ["Architect", "Visualise", "Auto-Generate", "Deploy"] as const;

/**
 * Props for CollaborateButton component.
 */
export type CollaborateButtonProps = {
    className?: string;
};

/**
 * Interactive call-to-action button for GitHub collaboration and workspace navigation.
 */
export const CollaborateButton = ({ className = "" }: CollaborateButtonProps): React.JSX.Element => (
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
            Try Now
        </span>
        <div className="absolute right-1 size-8 bg-background text-foreground rounded-full flex items-center justify-center transition-all duration-500 group-hover:right-[calc(100%-36px)] group-hover:rotate-45 shrink-0">
            <ArrowUpRight size={16} />
        </div>
    </Link>
);

/**
 * Modern 2-column split hero section with bottom stats matrix & animated number counting.
 */
export const HeroSection: React.FC = (): React.ReactElement => {
    const [rotatingIndex, setRotatingIndex] = useState<number>(0);
    const sectionRef = useRef<HTMLDivElement>(null);
    const leftColRef = useRef<HTMLDivElement>(null);
    const graphicBlockRef = useRef<HTMLDivElement>(null);
    const statsContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setRotatingIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
        }, 2800);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <section ref={sectionRef} id="hero" aria-label="Hero Introduction" className="relative w-full border-b border-border/40 bg-background overflow-hidden">
            {/* Main 2-Column Grid */}
            <div className="mx-auto max-w-7xl border-x border-border/40">
                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border/40">

                    {/* Left Column — Content & Copy */}
                    <div ref={leftColRef} className="relative p-5 sm:p-10 lg:p-14 flex flex-col justify-between space-y-6 sm:space-y-8 overflow-hidden">
                        {/* Background Ambient Radial Glow */}
                        <div className="absolute -top-12 -left-12 size-96 rounded-full bg-linear-to-br from-blue-600/15 via-indigo-500/10 to-transparent blur-3xl pointer-events-none" />
                        <div className="absolute bottom-4 right-8 size-72 rounded-full bg-linear-to-tr from-cyan-400/10 via-sky-500/10 to-transparent blur-2xl pointer-events-none" />

                        <header className="relative z-10 space-y-6">
                            {/* Headline with Zero Layout Shift Rotating Words */}
                            <div className="gsap-animate">
                                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
                                    <span className="block h-[1.2em] overflow-hidden my-0.5 text-transparent bg-linear-to-r from-blue-600 via-indigo-500 to-cyan-400 dark:from-blue-400 dark:via-indigo-400 dark:to-cyan-300 bg-clip-text">
                                        <span
                                            key={rotatingIndex}
                                            className="block animate-in slide-in-from-bottom-4 fade-in duration-500"
                                        >
                                            {ROTATING_WORDS[rotatingIndex]}
                                        </span>
                                    </span>
                                    <span className="block text-foreground">
                                        Databases at the Speed of Thought.
                                    </span>
                                </h1>
                            </div>

                            {/* Subheadline Body */}
                            <p className="gsap-animate text-muted-foreground text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl">
                                Transform complex database ideas into interactive visual ERDs. Auto-generate type-safe Drizzle ORM models, export instant multi-dialect SQL DDL migrations, and sync edge databases seamlessly.
                            </p>

                            {/* CTA Cluster */}
                            <div className="gsap-animate flex flex-wrap items-center gap-3.5 pt-2">
                                <CollaborateButton />

                                <Link
                                    href="/workspace"
                                    aria-label="Launch interactive schema workspace"
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-border/60 bg-background/80 hover:bg-muted/50 text-foreground font-semibold px-6 py-3.5 text-xs sm:text-sm backdrop-blur-xs transition-all hover:border-foreground/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                                >
                                    <Layers className="size-4 text-muted-foreground" aria-hidden="true" />
                                    <span>Launch Workspace</span>
                                </Link>
                            </div>
                        </header>
                    </div>

                    {/* Right Column — Interactive 3D Schema & Drizzle Model */}
                    <div className="p-2 sm:p-8 lg:p-12 flex items-center justify-center relative bg-muted/5 min-h-85 sm:min-h-95 lg:min-h-130 overflow-hidden">
                        {/* Background Grid Pattern */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]" />

                        {/* Interactive 3D Model Component */}
                        <div ref={graphicBlockRef} className="w-full h-full flex items-center justify-center">
                            <Hero3DModel />
                        </div>
                    </div>
                </div>

                {/* Bottom Feature & Metrics Matrix Bar */}
                <div ref={statsContainerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-border/40 divide-y sm:divide-y-0 sm:divide-x divide-border/40">

                    {/* Metric 1 */}
                    <article className="p-6 sm:p-7 space-y-1.5 flex flex-col justify-between">
                        <div>
                            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono">
                                <AnimatedCounter targetValue={100} suffix="%" duration={1600} delay={0} />
                            </div>
                            <h2 className="text-[11px] font-bold text-foreground uppercase tracking-wider mt-1">
                                LOCAL & PRIVATE
                            </h2>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                            Zero server storage. Schema ASTs and API keys stay strictly in your local browser storage.
                        </p>
                    </article>

                    {/* Metric 2 */}
                    <article className="p-6 sm:p-7 space-y-1.5 flex flex-col justify-between">
                        <div>
                            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono">
                                <AnimatedCounter targetValue={4} suffix=" Dialects" duration={1600} delay={200} />
                            </div>
                            <h2 className="text-[11px] font-bold text-foreground uppercase tracking-wider mt-1">
                                NATIVE SQL ENGINES
                            </h2>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                            Full syntax & type support for PostgreSQL, MySQL, SQLite, and LibSQL / Turso.
                        </p>
                    </article>

                    {/* Metric 3 */}
                    <article className="p-6 sm:p-7 space-y-1.5 flex flex-col justify-between">
                        <div>
                            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono">
                                <AnimatedCounter targetValue={10} suffix="x Faster" duration={1600} delay={400} />
                            </div>
                            <h2 className="text-[11px] font-bold text-foreground uppercase tracking-wider mt-1">
                                VISUAL PROTOTYPING
                            </h2>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                            Instant visual ERD creation with 1-click Drizzle ORM & TypeScript code export.
                        </p>
                    </article>

                    {/* Metric 4 */}
                    <article className="p-6 sm:p-7 space-y-1.5 flex flex-col justify-between">
                        <div>
                            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono">
                                <AnimatedCounter targetValue={100} suffix="% Automated" duration={1600} delay={600} />
                            </div>
                            <h2 className="text-[11px] font-bold text-foreground uppercase tracking-wider mt-1">
                                REAL-TIME AST VALIDATION
                            </h2>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                            Automatic background checks scan for missing indexes, foreign key constraints, and relation issues.
                        </p>
                    </article>

                </div>
            </div>
        </section>
    );
};
