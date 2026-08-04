import type { Metadata } from "next";
import Link from "next/link";
import React from "react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { Footer } from "@/components/landing/Footer";
import { Cookie, ShieldCheck, HardDrive, Lock, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
    title: "Cookie & Local Storage Policy | Schema Flow Studio",
    description: "Learn how Schema Flow Studio utilizes essential cookies, local storage, and IndexedDB to save your visual ERD schemas and preferences local-first.",
    alternates: {
        canonical: "/cookies",
    },
};

/**
 * Cookie and Local Storage Policy information page component.
 */
export default function CookiePolicyPage(): React.ReactElement {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased selection:bg-primary/20 selection:text-primary">
            <LandingHeader />

            <main className="flex-1 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-10" id="main-content">
                {/* Header Title Section */}
                <div className="space-y-4 text-center sm:text-left border-b border-border/40 pb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground font-medium transition-colors mb-2"
                    >
                        <ArrowLeft className="size-4" />
                        <span>Back to Home</span>
                    </Link>
                    <div className="flex items-center justify-center sm:justify-start gap-3">
                        <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <Cookie className="size-6" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Cookie & Local Storage Policy</h1>
                    </div>
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                        Last Updated: August 4, 2026. This policy explains how Schema Flow Studio uses cookies, local storage, and IndexedDB to deliver a local-first, privacy-focused visual ERD experience.
                    </p>
                </div>

                {/* Section 1: Privacy-First Approach */}
                <section className="space-y-4">
                    <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                        <ShieldCheck className="size-5 text-primary" />
                        <span>1. Our Privacy-First Approach</span>
                    </h2>
                    <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                        Schema Flow Studio is built with a local-first database architectural model. We prioritize storing your visual ERD diagrams, Drizzle models, and application settings directly on your device rather than uploading them to unauthorized remote servers.
                    </p>
                </section>

                {/* Section 2: Storage Technologies We Use */}
                <section className="space-y-4">
                    <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                        <HardDrive className="size-5 text-primary" />
                        <span>2. Storage Technologies We Use</span>
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-2">
                            <h3 className="font-semibold text-foreground text-base">Essential Local Storage</h3>
                            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                                Used to save your active dark/light mode preference (<code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono text-xs">schema-flow-theme</code>) and cookie consent choices.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-2">
                            <h3 className="font-semibold text-foreground text-base">IndexedDB Storage</h3>
                            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                                Stores your ERD tables, column definitions, relations, custom SQL snippets, and project AST schemas offline directly inside your browser.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-2">
                            <h3 className="font-semibold text-foreground text-base">Authentication Session Cookies</h3>
                            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                                Secure HTTP-only cookies managed by Clerk authentication when signing into your optional cloud sync profile.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-2">
                            <h3 className="font-semibold text-foreground text-base">Zero Third-Party Trackers</h3>
                            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                                We do not deploy third-party advertising cookies, cross-site tracking scripts, or commercial data collection algorithms.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section 3: Managing Storage */}
                <section className="space-y-4">
                    <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                        <Lock className="size-5 text-primary" />
                        <span>3. How to Manage or Clear Your Cookies & Local Data</span>
                    </h2>
                    <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                        You can manage or clear your stored data at any time directly through your browser settings:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm sm:text-base pl-2">
                        <li>
                            <strong className="text-foreground">Browser Settings:</strong> Open your browser settings and navigate to Privacy & Security &gt; Clear Browsing Data &gt; Cookies and Site Data.
                        </li>
                        <li>
                            <strong className="text-foreground">Workspace Project Export:</strong> Before clearing browser storage, export your projects to <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono text-xs">.schemaflow</code> or SQL DDL files to prevent accidental data loss.
                        </li>
                    </ul>
                </section>
            </main>

            <Footer />
        </div>
    );
}
