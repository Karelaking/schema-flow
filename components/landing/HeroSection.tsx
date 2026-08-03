"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Database, Layers, ShieldCheck, Cpu, Sparkles, Zap, CheckCircle2 } from "lucide-react";
import { AnimatedCounter } from "@/components/landing/AnimatedCounter";
import { Hero3DModel } from "@/components/landing/Hero3DModel";
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

    useEffect(() => {
        if (typeof window === "undefined") return;

        // Dynamically load GSAP to ensure smooth execution without dev build module errors
        import("gsap").then(({ default: gsap }) => {
            import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
                gsap.registerPlugin(ScrollTrigger);

                const ctx = gsap.context(() => {
                    if (leftColRef.current) {
                        const elements = leftColRef.current.querySelectorAll(".gsap-animate");
                        gsap.fromTo(
                            elements,
                            { y: 24, opacity: 0 },
                            {
                                y: 0,
                                opacity: 1,
                                duration: 0.8,
                                stagger: 0.1,
                                ease: "power3.out",
                            }
                        );
                    }

                    if (graphicBlockRef.current) {
                        gsap.fromTo(
                            graphicBlockRef.current,
                            { scale: 0.85, opacity: 0 },
                            {
                                scale: 1,
                                opacity: 1,
                                duration: 1,
                                ease: "back.out(1.4)",
                                delay: 0.2,
                            }
                        );

                        gsap.to(graphicBlockRef.current, {
                            y: -10,
                            duration: 2.8,
                            repeat: -1,
                            yoyo: true,
                            ease: "sine.easeInOut",
                        });
                    }

                    if (statsContainerRef.current) {
                        const statCards = statsContainerRef.current.children;
                        gsap.fromTo(
                            statCards,
                            { y: 30, opacity: 0 },
                            {
                                y: 0,
                                opacity: 1,
                                duration: 0.8,
                                stagger: 0.25,
                                ease: "power3.out",
                                scrollTrigger: {
                                    trigger: statsContainerRef.current,
                                    start: "top 90%",
                                    toggleActions: "play none none reverse",
                                },
                            }
                        );
                    }
                }, sectionRef);

                return () => ctx.revert();
            }).catch(() => { });
        }).catch(() => { });
    }, []);

    return (
        <section ref={sectionRef} className="relative w-full border-b border-border/40 bg-background overflow-hidden">
            {/* Main 2-Column Grid */}
            <div className="mx-auto max-w-7xl border-x border-border/40">
                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border/40">

                    {/* Left Column — Content & Copy */}
                    <div ref={leftColRef} className="relative p-5 sm:p-10 lg:p-14 flex flex-col justify-between space-y-6 sm:space-y-8 overflow-hidden">
                        {/* Background Ambient Radial Glow */}
                        <div className="absolute -top-12 -left-12 size-96 rounded-full bg-linear-to-br from-blue-600/15 via-indigo-500/10 to-transparent blur-3xl pointer-events-none" />
                        <div className="absolute bottom-4 right-8 size-72 rounded-full bg-linear-to-tr from-cyan-400/10 via-sky-500/10 to-transparent blur-2xl pointer-events-none" />

                        <div className="relative z-10 space-y-6">
                            {/* Headline with Dynamic Animated Words */}
                            <div className="gsap-animate">
                                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
                                    <span className="block mb-1">
                                        <span className="relative inline-block overflow-hidden h-[1.18em] align-top max-w-full w-[13.5ch]">
                                            <span
                                                key={rotatingIndex}
                                                className="inline-block animate-in slide-in-from-bottom-4 fade-in duration-500 bg-linear-to-r from-blue-600 via-indigo-500 to-cyan-400 dark:from-blue-400 dark:via-indigo-400 dark:to-cyan-300 bg-clip-text text-transparent"
                                            >
                                                {ROTATING_WORDS[rotatingIndex]}
                                            </span>
                                        </span>{" "}
                                        Databases
                                    </span>
                                    <span className="block text-foreground">
                                        at the Speed of Thought.
                                    </span>
                                </h1>
                            </div>

                            {/* Subheadline Body */}
                            <p className="gsap-animate text-muted-foreground text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl">
                                Transform complex database ideas into interactive visual flows. Auto-generate type-safe Drizzle ORM models, export instant SQL migrations, and sync edge databases seamlessly.
                            </p>

                            {/* CTA Cluster */}
                            <div className="gsap-animate flex flex-wrap items-center gap-3.5 pt-2">
                                <CollaborateButton />

                                <Link
                                    href="/workspace"
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-border/60 bg-background/80 hover:bg-muted/50 text-foreground font-semibold px-6 py-3.5 text-xs sm:text-sm backdrop-blur-xs transition-all hover:border-foreground/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                                >
                                    <Layers className="size-4 text-muted-foreground" />
                                    <span>Explore Demo</span>
                                </Link>
                            </div>
                        </div>
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
                    <div className="p-6 sm:p-7 space-y-1.5 flex flex-col justify-between">
                        <div>
                            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono">
                                <AnimatedCounter targetValue={100} suffix="%" duration={1600} delay={0} />
                            </div>
                            <div className="text-[11px] font-bold text-foreground uppercase tracking-wider mt-1">
                                LOCAL & PRIVATE
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                            Zero server storage. Schema ASTs and API keys stay strictly in your browser.
                        </p>
                    </div>

                    {/* Metric 2 */}
                    <div className="p-6 sm:p-7 space-y-1.5 flex flex-col justify-between">
                        <div>
                            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono">
                                <AnimatedCounter targetValue={4} suffix=" Dialects" duration={1600} delay={200} />
                            </div>
                            <div className="text-[11px] font-bold text-foreground uppercase tracking-wider mt-1">
                                NATIVE SQL ENGINES
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                            Full syntax & type support for PostgreSQL, MySQL, SQLite, and LibSQL / Turso.
                        </p>
                    </div>

                    {/* Metric 3 */}
                    <div className="p-6 sm:p-7 space-y-1.5 flex flex-col justify-between">
                        <div>
                            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono">
                                <AnimatedCounter targetValue={10} suffix="x Faster" duration={1600} delay={400} />
                            </div>
                            <div className="text-[11px] font-bold text-foreground uppercase tracking-wider mt-1">
                                VISUAL PROTOTYPING
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                            Instant visual ERD creation with 1-click Drizzle ORM & TypeScript export.
                        </p>
                    </div>

                    {/* Metric 4 */}
                    <div className="p-6 sm:p-7 space-y-1.5 flex flex-col justify-between">
                        <div>
                            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono">
                                <AnimatedCounter targetValue={100} suffix="% Automated" duration={1600} delay={600} />
                            </div>
                            <div className="text-[11px] font-bold text-foreground uppercase tracking-wider mt-1">
                                AI SCHEMA AUDITING
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                            AI DB Architect scans for missing indexes, normalization, and relation issues.
                        </p>
                    </div>

                </div>
            </div>
        </section>
    );
};
