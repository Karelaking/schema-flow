"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Database, Layers, ShieldCheck, Cpu } from "lucide-react";
import { AnimatedCounter } from "@/components/landing/AnimatedCounter";

/**
 * Modern 2-column split hero section with bottom stats matrix & animated number counting.
 */
export const HeroSection: React.FC = (): React.ReactElement => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const leftColRef = useRef<HTMLDivElement>(null);
    const graphicBlockRef = useRef<HTMLDivElement>(null);
    const statsContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        // Dynamically load GSAP to ensure smooth execution without dev build module errors
        import("gsap").then(({ default: gsap }) => {
            import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
                gsap.registerPlugin(ScrollTrigger);

                const ctx = gsap.context(() => {
                    if (leftColRef.current) {
                        const elements = leftColRef.current.children;
                        gsap.fromTo(
                            elements,
                            { y: 30, opacity: 0 },
                            {
                                y: 0,
                                opacity: 1,
                                duration: 0.8,
                                stagger: 0.12,
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
            }).catch(() => {});
        }).catch(() => {});
    }, []);

    return (
        <section ref={sectionRef} className="relative w-full border-b border-border/40 bg-background overflow-hidden">
            {/* Main 2-Column Grid */}
            <div className="mx-auto max-w-7xl border-x border-border/40">
                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border/40">
                    
                    {/* Left Column — Content & Copy */}
                    <div ref={leftColRef} className="p-6 sm:p-10 lg:p-16 flex flex-col justify-between space-y-8">
                        <div>
                            {/* Headline */}
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.08] mb-6">
                                The layer that converts complexity into clarity.
                            </h1>

                            {/* Subheadline Body */}
                            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-lg mb-8">
                                Transform tools and data into one connected system—giving teams clarity to move faster and decide confidently.
                            </p>

                            {/* CTA Button */}
                            <Link
                                href="/workspace"
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background font-bold px-7 py-3 text-xs sm:text-sm shadow-md hover:opacity-90 transition-all cursor-pointer w-fit"
                            >
                                <span>Try Now</span>
                                <ArrowRight className="size-3.5" />
                            </Link>
                        </div>
                    </div>

                    {/* Right Column — 3D Isometric Interactive Graphic */}
                    <div className="p-8 sm:p-12 lg:p-16 flex items-center justify-center relative bg-muted/5 min-h-95 lg:min-h-130">
                        {/* Background Grid Pattern */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]" />

                        {/* 3D Layered Graphic Container */}
                        <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
                            
                            {/* Outer Perspective Layer 1 */}
                            <div className="absolute inset-4 rounded-3xl border border-dashed border-border/60 rotate-12 -skew-y-6 opacity-40" />

                            {/* Middle Layer Grid Plane 2 */}
                            <div className="absolute inset-8 rounded-2xl border border-border/80 bg-background/50 backdrop-blur-xs rotate-12 -skew-y-6 shadow-lg flex items-center justify-center">
                                <div className="w-full h-full bg-[linear-gradient(to_right,#80808015_1px,transparent_1px),linear-gradient(to_bottom,#80808015_1px,transparent_1px)] bg-size-[16px_16px] rounded-2xl" />
                            </div>

                            {/* Fluid Glass Blue Core Block */}
                            <div ref={graphicBlockRef} className="relative size-56 sm:size-64 rounded-3xl bg-linear-to-tr from-blue-600 via-sky-500 to-indigo-600 p-1 shadow-2xl rotate-12 -skew-y-6 transform hover:scale-105 transition-transform duration-500">
                                <div className="w-full h-full rounded-[22px] bg-linear-to-b from-sky-400/30 to-blue-900/80 backdrop-blur-md relative overflow-hidden flex items-center justify-center border border-white/20">
                                    
                                    {/* Swirling Liquid Pattern Simulation */}
                                    <div className="absolute -inset-10 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.8),transparent_70%)] animate-pulse" />
                                    <div className="absolute top-1/4 left-1/4 size-32 bg-sky-300/40 rounded-full blur-2xl" />

                                    {/* Top White Core Cap */}
                                    <div className="absolute top-0 inset-x-0 h-1/2 bg-linear-to-b from-white/90 to-white/40 border-b border-white/40 rounded-t-[22px] flex items-center justify-center shadow-md">
                                        
                                        {/* Central Dark Circular Badge */}
                                        <div className="size-14 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-sm shadow-xl border-2 border-white">
                                            <span>sf.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Connecting Line Nodes */}
                            <div className="absolute top-10 left-10 size-2.5 rounded-full bg-sky-500 shadow-[0_0_12px_rgba(14,165,233,0.8)]" />
                            <div className="absolute bottom-12 right-12 size-2.5 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]" />
                        </div>
                    </div>
                </div>

                {/* Bottom Metrics Matrix Bar with Number Counting Animations */}
                <div ref={statsContainerRef} className="grid grid-cols-2 lg:grid-cols-4 border-t border-border/40">
                    
                    {/* Metric 1 */}
                    <div className="p-6 sm:p-8 space-y-1 border-r border-border/40 border-b lg:border-b-0">
                        <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-mono">
                            <AnimatedCounter targetValue={6} suffix="M+" duration={1600} delay={0} />
                        </div>
                        <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                            USERS
                        </div>
                    </div>

                    {/* Metric 2 */}
                    <div className="p-6 sm:p-8 space-y-1 border-r lg:border-r border-border/40 border-b lg:border-b-0 lg:[&:nth-child(2n)]:border-r">
                        <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-mono">
                            <AnimatedCounter targetValue={389} suffix="+" duration={1800} delay={250} />
                        </div>
                        <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                            INTEGRATIONS
                        </div>
                    </div>

                    {/* Metric 3 */}
                    <div className="p-6 sm:p-8 space-y-1 border-r border-border/40">
                        <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-mono">
                            <AnimatedCounter targetValue={56} suffix="+" duration={1600} delay={500} />
                        </div>
                        <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                            EXPERTISE
                        </div>
                    </div>

                    {/* Metric 4 */}
                    <div className="p-6 sm:p-8 space-y-1">
                        <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-mono">
                            <AnimatedCounter targetValue={99} suffix="%" duration={1600} delay={750} />
                        </div>
                        <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                            SATISFACTION
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};
