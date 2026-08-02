import { NextResponse } from "next/server";

/**
 * GET /api/lotus-key
 * API Route: Provides master key for client-side .lotus encryption.
 * Cached locally in IndexedDB by client for offline access.
 */
export async function GET(): Promise<NextResponse> {
    try {
        const key = process.env.LOTUS_ENCRYPTION_KEY || "schema-flow-default-local-lotus-key-32ch";
        return NextResponse.json({ key });
    }
    catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
