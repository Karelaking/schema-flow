"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X, Check } from "lucide-react";
import { Button } from "./button";

/** LocalStorage key for persisting cookie consent preference. */
const COOKIE_CONSENT_KEY = "schema-flow-cookie-consent";

/**
 * Mobile-responsive floating Cookie Consent banner component.
 * Remembers user consent preference in localStorage and provides a quick link
 * to the full Cookie Policy page.
 *
 * Follows SRP: only manages consent UI state, delegates persistence to localStorage.
 *
 * @returns A cookie consent banner element, or empty fragment when dismissed.
 */
export const CookieConsent: React.FC = (): React.ReactElement => {
    const [isVisible, setIsVisible] = useState<boolean>(false);

    useEffect(() => {
        const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    /**
     * Persists consent choice and hides the banner.
     * @param choice - The user's consent decision.
     */
    const handleConsentChoice = (choice: "accepted" | "declined"): void => {
        localStorage.setItem(COOKIE_CONSENT_KEY, choice);
        setIsVisible(false);
    };

    if (!isVisible) {
        return <></>;
    }

    return (
        <aside
            aria-label="Cookie consent banner"
            className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 bg-card/95 dark:bg-card/90 border border-border shadow-2xl rounded-2xl p-4 text-xs backdrop-blur-md transition-all animate-in fade-in-0 slide-in-from-bottom-4"
        >
            <div className="flex items-start gap-3">
                <div className="size-9 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Cookie className="size-5" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                        <h2 className="font-semibold text-foreground text-xs sm:text-sm">Cookie & Local Data Notice</h2>
                        <button
                            type="button"
                            onClick={() => handleConsentChoice("declined")}
                            className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                            aria-label="Close cookie consent notice"
                        >
                            <X className="size-3.5" />
                        </button>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-[11px] sm:text-xs">
                        Schema Flow Studio uses essential local storage and session cookies to store your theme preferences, project schemas, and authentication state securely.
                    </p>
                    <div className="pt-2 flex items-center flex-wrap gap-2">
                        <Button
                            size="sm"
                            onClick={() => handleConsentChoice("accepted")}
                            className="h-7 px-3 text-xs gap-1 rounded-lg font-semibold cursor-pointer"
                        >
                            <Check className="size-3" data-icon="inline-start" />
                            <span>Accept Essential</span>
                        </Button>
                        <Link
                            href={"/cookies" as any}
                            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 font-medium transition-colors px-1"
                        >
                            Cookie Policy
                        </Link>
                    </div>
                </div>
            </div>
        </aside>
    );
};
