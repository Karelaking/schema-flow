import { NextResponse } from "next/server";
import { captureException } from "@/lib/sentry.util";

/**
 * GET /api/lotus-key
 * API Route: Provides master key for client-side .lotus encryption.
 * Cached locally in IndexedDB by client for offline access.
 */
export async function GET(): Promise<NextResponse> {
    try {
        const key = process.env.LOTUS_ENCRYPTION_KEY;
        if (!key) {
            return NextResponse.json({ error: "LOTUS_ENCRYPTION_KEY environment variable is not configured." }, { status: 500 });
        }
        return NextResponse.json({ key });
    }
    catch (error: unknown) {
        captureException(error, { endpoint: "/api/lotus-key", method: "GET" });
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

