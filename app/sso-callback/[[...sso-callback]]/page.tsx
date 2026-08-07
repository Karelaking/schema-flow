"use client";

import React from "react";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

/**
 * SSO Callback page component for custom Clerk authentication flows.
 * Processes social login redirects (Google, GitHub) and completes user authentication.
 */
export default function SSOCallbackPage(): React.ReactElement {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
            <div className="relative border border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl rounded-2xl p-8 max-w-sm w-full text-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Loader2 className="size-6 animate-spin" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-foreground">Completing Sign In</h2>
                        <p className="text-xs text-muted-foreground mt-1">
                            Please wait while we finalize your authentication session...
                        </p>
                    </div>
                </div>

                {/* Clerk SSO Callback Processor */}
                <AuthenticateWithRedirectCallback />
            </div>
        </div>
    );
}
