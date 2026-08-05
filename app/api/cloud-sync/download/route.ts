import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { downloadFromCloudStorage } from "@/lib/r2-client.service";
import { captureException } from "@/lib/sentry.util";

/**
 * GET /api/cloud-sync/download?projectId=xxx
 * API Route: Downloads an encrypted project blob from online database storage.
 * Strictly enforced: Only logged-in AND Pro-subscribed users are permitted.
 */
export async function GET(req: Request): Promise<NextResponse> {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get("projectId");

        if (!projectId) {
            return NextResponse.json({ error: "Missing projectId query parameter." }, { status: 400 });
        }

        const data = await downloadFromCloudStorage(userId, projectId);
        if (!data) {
            return NextResponse.json({ error: "Project not found in online storage." }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            base64Blob: data.buffer.toString("base64"),
            version: data.version,
        });
    }
    catch (error: unknown) {
        captureException(error, { endpoint: "/api/cloud-sync/download", method: "GET" });
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

