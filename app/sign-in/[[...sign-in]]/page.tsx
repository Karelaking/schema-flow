import React from "react";
import { SignIn } from "@clerk/nextjs";

/**
 * Clerk Sign In page component.
 */
export default function SignInPage(): React.ReactElement {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
            <SignIn
                appearance={{
                    elements: {
                        rootBox: "mx-auto shadow-xl rounded-xl border border-border",
                        card: "bg-card text-foreground",
                    },
                }}
            />
        </div>
    );
}
