"use client";

import React, { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { setSentryUser } from "@/lib/sentry.util";

/**
 * Client component that synchronizes Clerk authenticated user identity to Sentry scope.
 */
export function SentryUserSync(): React.ReactElement | null {
    const { user, isLoaded } = useUser();

    useEffect(() => {
        if (!isLoaded) {
            return;
        }

        if (user) {
            const primaryEmail = user.primaryEmailAddress?.emailAddress;
            setSentryUser({
                id: user.id,
                email: primaryEmail,
                username: user.username || user.fullName || undefined,
            });
        } else {
            setSentryUser(undefined);
        }
    }, [user, isLoaded]);

    return null;
}
