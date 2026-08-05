import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { listUserCloudFiles, getUserCloudStorageUsage } from "@/lib/r2-client.service";
import { captureException } from "@/lib/sentry.util";

/**
 * GET /api/cloud-sync/list
 * API Route: Lists all synced projects and total storage usage for logged in Pro subscriber.
 */
export async function GET(): Promise<NextResponse> {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
        }

        const files = await listUserCloudFiles(userId);
        const usageBytes = await getUserCloudStorageUsage(userId);

        return NextResponse.json({
            success: true,
            files,
            usageBytes,
            usageFormatted: `${(usageBytes / (1024 * 1024)).toFixed(2)} MB / 100 MB`,
        });
    }
    catch (error: unknown) {
        captureException(error, { endpoint: "/api/cloud-sync/list", method: "GET" });
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

