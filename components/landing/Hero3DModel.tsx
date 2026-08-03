"use client";

import React, { useState, useRef, useCallback } from "react";
import { Database, Key, Link2, Code2, Zap, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Hero3DModelProps {
    className?: string;
}

/**
 * Interactive 3D Isometric Schema & Drizzle ORM Visualizer for Hero section.
 * Preserves original multi-level 3D node layout while rendering exact ERD relation
 * connecting beams, handles, and cardinality badges (1:N) between PK/FK ports.
 */
export const Hero3DModel: React.FC<Hero3DModelProps> = ({ className = "" }): React.ReactElement => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [rotateX, setRotateX] = useState<number>(18);
    const [rotateY, setRotateY] = useState<number>(-22);
    const [activeHoverTable, setActiveHoverTable] = useState<string | null>(null);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>): void => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const percentX = (e.clientX - centerX) / (rect.width / 2);
        const percentY = (e.clientY - centerY) / (rect.height / 2);

        setRotateX(18 - percentY * 16);
        setRotateY(-22 + percentX * 18);
    }, []);

    const handleMouseLeave = useCallback((): void => {
        setRotateX(18);
        setRotateY(-22);
        setActiveHoverTable(null);
    }, []);

    const isUsersHovered = activeHoverTable === "users";
    const isOrdersHovered = activeHoverTable === "orders";
    const isItemsHovered = activeHoverTable === "order_items";

    const isRel1Active = isUsersHovered || isOrdersHovered;
    const isRel2Active = isOrdersHovered || isItemsHovered;

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={cn(
                "relative w-full h-full min-h-[130%]! sm:min-h-115 flex items-center justify-center p-1 sm:p-8 overflow-hidden select-none cursor-grab active:cursor-grabbing",
                className
            )}
            style={{ perspective: "1200px" }}
        >
            {/* Background Ambient Radial Glow */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="size-96 rounded-full bg-linear-to-tr from-blue-600/20 via-indigo-500/15 to-cyan-400/20 blur-3xl animate-pulse" />
                <div className="absolute size-72 rounded-full bg-purple-600/10 blur-2xl -translate-y-12 translate-x-12" />
            </div>

            {/* Background Perspective Grid Floor */}
            <div
                className="absolute inset-0 pointer-events-none transition-transform duration-300 ease-out"
                style={{
                    transform: `rotateX(${rotateX * 0.4}deg) rotateY(${rotateY * 0.4}deg) scale(1.1)`,
                    transformStyle: "preserve-3d",
                }}
            >
                <div className="w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[32px_32px] opacity-60" />
            </div>

            {/* Main 3D Perspective Canvas Container */}
            <div
                className="relative w-full max-w-lg aspect-4/3 flex items-center justify-center transition-transform duration-200 ease-out scale-[0.68] xs:scale-80 sm:scale-95 md:scale-100"
                style={{
                    transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(3deg)`,
                    transformStyle: "preserve-3d",
                }}
            >
                {/* Layer 0: Base Isometric Grid Plane */}
                <div
                    className="absolute inset-0 rounded-3xl border border-primary/20 bg-background/40 backdrop-blur-xs shadow-2xl transition-transform duration-300"
                    style={{ transform: "translateZ(-40px)", transformStyle: "preserve-3d" }}
                >
                    <div className="w-full h-full rounded-3xl bg-[linear-gradient(to_right,#80808018_1px,transparent_1px),linear-gradient(to_bottom,#80808018_1px,transparent_1px)] bg-size-[20px_20px]" />
                </div>

                {/* SVG Real ERD Relation Connecting Beams */}
                <svg
                    className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible"
                    style={{ transform: "translateZ(60px)" }}
                >
                    <defs>
                        <linearGradient id="rel-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#38bdf8" stopOpacity="1" />
                            <stop offset="50%" stopColor="#818cf8" stopOpacity="1" />
                            <stop offset="100%" stopColor="#c084fc" stopOpacity="1" />
                        </linearGradient>
                        <linearGradient id="rel-gradient-2" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#818cf8" stopOpacity="1" />
                            <stop offset="100%" stopColor="#34d399" stopOpacity="1" />
                        </linearGradient>
                        <filter id="glow-beam-erd" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Relation 1: users.id (Right of users, y=65) -> orders.user_id (Left of orders, y=168) */}
                    <g className="transition-opacity duration-300" opacity={isRel1Active || activeHoverTable === null ? 1 : 0.45}>
                        <path
                            d="M 232 65 C 290 65, 220 168, 275 168"
                            fill="none"
                            stroke="url(#rel-gradient-1)"
                            strokeWidth={isRel1Active ? 4 : 2.8}
                            filter="url(#glow-beam-erd)"
                        />
                        <path
                            d="M 232 65 C 290 65, 220 168, 275 168"
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="1.2"
                            strokeDasharray="4 6"
                            className="animate-[dash_6s_linear_infinite]"
                        />

                        {/* Connection Pin Beacons */}
                        <circle cx="232" cy="65" r="4" fill="#38bdf8" className="animate-ping" />
                        <circle cx="232" cy="65" r="3" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
                        <circle cx="275" cy="168" r="3" fill="#818cf8" stroke="#ffffff" strokeWidth="1" />

                        {/* Cardinality 1:N Labels */}
                        <g transform="translate(236, 50)">
                            <rect x="0" y="0" width="13" height="13" rx="3" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
                            <text x="6.5" y="9.5" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace">1</text>
                        </g>
                        <g transform="translate(256, 154)">
                            <rect x="0" y="0" width="13" height="13" rx="3" fill="#0f172a" stroke="#818cf8" strokeWidth="1" />
                            <text x="6.5" y="9.5" textAnchor="middle" fill="#818cf8" fontSize="9" fontWeight="bold" fontFamily="monospace">N</text>
                        </g>
                    </g>

                    {/* Relation 2: orders.id (Bottom/left of orders, y=240) -> order_items.order_id (Right of order_items, y=292) */}
                    <g className="transition-opacity duration-300" opacity={isRel2Active || activeHoverTable === null ? 1 : 0.45}>
                        <path
                            d="M 370 240 C 370 305, 290 292, 240 292"
                            fill="none"
                            stroke="url(#rel-gradient-2)"
                            strokeWidth={isRel2Active ? 4 : 2.8}
                            filter="url(#glow-beam-erd)"
                        />
                        <path
                            d="M 370 240 C 370 305, 290 292, 240 292"
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="1.2"
                            strokeDasharray="4 6"
                            className="animate-[dash_8s_linear_infinite]"
                        />

                        {/* Connection Pin Beacons */}
                        <circle cx="370" cy="240" r="3" fill="#818cf8" stroke="#ffffff" strokeWidth="1" />
                        <circle cx="240" cy="292" r="4" fill="#34d399" className="animate-ping" />
                        <circle cx="240" cy="292" r="3" fill="#34d399" stroke="#ffffff" strokeWidth="1" />

                        {/* Cardinality 1:N Labels */}
                        <g transform="translate(376, 238)">
                            <rect x="0" y="0" width="13" height="13" rx="3" fill="#0f172a" stroke="#818cf8" strokeWidth="1" />
                            <text x="6.5" y="9.5" textAnchor="middle" fill="#818cf8" fontSize="9" fontWeight="bold" fontFamily="monospace">1</text>
                        </g>
                        <g transform="translate(244, 276)">
                            <rect x="0" y="0" width="13" height="13" rx="3" fill="#0f172a" stroke="#34d399" strokeWidth="1" />
                            <text x="6.5" y="9.5" textAnchor="middle" fill="#34d399" fontSize="9" fontWeight="bold" fontFamily="monospace">N</text>
                        </g>
                    </g>
                </svg>

                {/* Layer 1: Floating Schema Table Cards (Original Node Layout & Z-Elevations) */}

                {/* Table 1: users (Top-Left) */}
                <div
                    onMouseEnter={() => setActiveHoverTable("users")}
                    onMouseLeave={() => setActiveHoverTable(null)}
                    className={cn(
                        "absolute top-2 left-4 w-52 sm:w-56 rounded-2xl border bg-card/85 backdrop-blur-md p-3.5 shadow-xl transition-all duration-300",
                        isUsersHovered ? "scale-105 border-sky-400 shadow-sky-500/30 z-30" : "border-border/70 shadow-black/20"
                    )}
                    style={{ transform: "translateZ(60px)", transformStyle: "preserve-3d" }}
                >
                    <div className="flex items-center justify-between pb-2 border-b border-border/50">
                        <div className="flex items-center gap-2">
                            <div className="size-6 rounded-lg bg-sky-500/15 flex items-center justify-center border border-sky-500/30">
                                <Database className="size-3.5 text-sky-400" />
                            </div>
                            <span className="text-xs font-mono font-bold text-foreground">users</span>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-sky-500/15 text-sky-400 font-semibold font-mono">
                            PK: id
                        </span>
                    </div>

                    <div className="space-y-1 mt-2 font-mono text-[10px]">
                        {/* PK Column: id (Anchor at right side: y=65) */}
                        <div className="relative flex items-center justify-between py-0.5 px-1.5 rounded bg-sky-500/10 text-sky-300 font-semibold border border-sky-500/20">
                            <div className="flex items-center gap-1.5">
                                <Key className="size-2.5 text-amber-400 shrink-0" />
                                <span>id</span>
                            </div>
                            <span className="text-muted-foreground text-[9px]">uuid</span>
                            <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 size-2 rounded-full bg-sky-400 border border-white shadow-xs" />
                        </div>
                        <div className="flex items-center justify-between py-0.5 px-1.5 text-muted-foreground">
                            <span>email</span>
                            <span className="text-[9px]">varchar</span>
                        </div>
                        <div className="flex items-center justify-between py-0.5 px-1.5 text-muted-foreground">
                            <span>role</span>
                            <span className="text-[9px]">user_role</span>
                        </div>
                    </div>
                </div>

                {/* Table 2: orders (Center-Right) */}
                <div
                    onMouseEnter={() => setActiveHoverTable("orders")}
                    onMouseLeave={() => setActiveHoverTable(null)}
                    className={cn(
                        "absolute top-28 right-4 w-56 sm:w-60 rounded-2xl border bg-card/85 backdrop-blur-md p-3.5 shadow-xl transition-all duration-300",
                        isOrdersHovered ? "scale-105 border-indigo-400 shadow-indigo-500/30 z-30" : "border-border/70 shadow-black/20"
                    )}
                    style={{ transform: "translateZ(90px)", transformStyle: "preserve-3d" }}
                >
                    <div className="flex items-center justify-between pb-2 border-b border-border/50">
                        <div className="flex items-center gap-2">
                            <div className="size-6 rounded-lg bg-indigo-500/15 flex items-center justify-center border border-indigo-500/30">
                                <Database className="size-3.5 text-indigo-400" />
                            </div>
                            <span className="text-xs font-mono font-bold text-foreground">orders</span>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 font-semibold font-mono">
                            FK: 1
                        </span>
                    </div>

                    <div className="space-y-1 mt-2 font-mono text-[10px]">
                        {/* PK Column: id (Anchor at bottom side: y=240) */}
                        <div className="relative flex items-center justify-between py-0.5 px-1.5 rounded bg-indigo-500/10 text-indigo-300 font-semibold border border-indigo-500/20">
                            <div className="flex items-center gap-1.5">
                                <Key className="size-2.5 text-amber-400 shrink-0" />
                                <span>id</span>
                            </div>
                            <span className="text-muted-foreground text-[9px]">uuid</span>
                            <div className="absolute -bottom-1.5 left-6 size-2 rounded-full bg-indigo-400 border border-white shadow-xs" />
                        </div>
                        {/* FK Column: user_id (Anchor at left side: y=168) */}
                        <div className="relative flex items-center justify-between py-0.5 px-1.5 rounded bg-blue-500/10 text-sky-300 font-medium border border-sky-500/20">
                            <div className="flex items-center gap-1.5">
                                <Link2 className="size-2.5 text-sky-400 shrink-0" />
                                <span>user_id</span>
                            </div>
                            <span className="text-muted-foreground text-[9px]">uuid</span>
                            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 size-2 rounded-full bg-indigo-400 border border-white shadow-xs" />
                        </div>
                        <div className="flex items-center justify-between py-0.5 px-1.5 text-muted-foreground">
                            <span>total_amount</span>
                            <span className="text-[9px]">numeric</span>
                        </div>
                    </div>
                </div>

                {/* Table 3: order_items (Bottom-Center) */}
                <div
                    onMouseEnter={() => setActiveHoverTable("order_items")}
                    onMouseLeave={() => setActiveHoverTable(null)}
                    className={cn(
                        "absolute bottom-2 left-16 w-52 sm:w-56 rounded-2xl border bg-card/85 backdrop-blur-md p-3.5 shadow-xl transition-all duration-300",
                        isItemsHovered ? "scale-105 border-emerald-400 shadow-emerald-500/30 z-30" : "border-border/70 shadow-black/20"
                    )}
                    style={{ transform: "translateZ(45px)", transformStyle: "preserve-3d" }}
                >
                    <div className="flex items-center justify-between pb-2 border-b border-border/50">
                        <div className="flex items-center gap-2">
                            <div className="size-6 rounded-lg bg-emerald-500/15 flex items-center justify-center border border-emerald-500/30">
                                <Database className="size-3.5 text-emerald-400" />
                            </div>
                            <span className="text-xs font-mono font-bold text-foreground">order_items</span>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold font-mono">
                            FK: 1
                        </span>
                    </div>

                    <div className="space-y-1 mt-2 font-mono text-[10px]">
                        <div className="flex items-center justify-between py-0.5 px-1.5 rounded bg-emerald-500/10 text-emerald-300 font-semibold">
                            <div className="flex items-center gap-1.5">
                                <Key className="size-2.5 text-amber-400 shrink-0" />
                                <span>id</span>
                            </div>
                            <span className="text-muted-foreground text-[9px]">uuid</span>
                        </div>
                        {/* FK Column: order_id (Anchor at right side: y=292) */}
                        <div className="relative flex items-center justify-between py-0.5 px-1.5 rounded bg-indigo-500/10 text-indigo-300 font-medium border border-indigo-500/20">
                            <div className="flex items-center gap-1.5">
                                <Link2 className="size-2.5 text-indigo-400 shrink-0" />
                                <span>order_id</span>
                            </div>
                            <span className="text-muted-foreground text-[9px]">uuid</span>
                            <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 size-2 rounded-full bg-emerald-400 border border-white shadow-xs" />
                        </div>
                    </div>
                </div>

                {/* Floating Tech Badges in 3D Perspective */}
                <div
                    className="absolute -top-4 right-12 px-3 py-1.5 rounded-xl border border-sky-500/30 bg-background/90 backdrop-blur-md shadow-lg flex items-center gap-2 text-xs font-mono font-semibold text-sky-400"
                    style={{ transform: "translateZ(110px)", transformStyle: "preserve-3d" }}
                >
                    <Code2 className="size-3.5 text-sky-400" />
                    <span>auto generated SQL</span>
                </div>

                <div
                    className="absolute bottom-6 -right-4 px-3 py-1.5 rounded-xl border border-purple-500/30 bg-background/90 backdrop-blur-md shadow-lg flex items-center gap-2 text-xs font-mono font-semibold text-purple-400"
                    style={{ transform: "translateZ(80px)", transformStyle: "preserve-3d" }}
                >
                    <Zap className="size-3.5 text-purple-400" />
                    <span>type-safe</span>
                </div>

                <div
                    className="absolute top-1/2 -left-6 px-2.5 py-1.5 rounded-xl border border-emerald-500/30 bg-background/90 backdrop-blur-md shadow-lg flex items-center gap-1.5 text-[11px] font-mono text-emerald-400"
                    style={{ transform: "translateZ(75px)", transformStyle: "preserve-3d" }}
                >
                    <Check className="size-3 text-emerald-400" />
                    <span>auto-sync</span>
                </div>
            </div>
        </div>
    );
};
