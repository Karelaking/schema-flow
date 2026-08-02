import React from "react";
import { SignUp } from "@clerk/nextjs";

/**
 * Clerk Sign Up page component.
 */
export default function SignUpPage(): React.ReactElement {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
            <SignUp
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
