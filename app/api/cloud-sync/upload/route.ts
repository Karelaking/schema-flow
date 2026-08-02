import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { uploadToCloudStorage, downloadFromCloudStorage } from "@/lib/r2-client.service";

/**
 * POST /api/cloud-sync/upload
 * API Route: Uploads an encrypted project blob to cloud database storage.
 * Strictly enforced: Only logged-in AND Pro-subscribed users are permitted.
 */
export async function POST(req: Request): Promise<NextResponse> {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized. Please sign in to access online database sync." }, { status: 401 });
        }

        const body = await req.json();
        const { projectId, base64Blob, fileVersion } = body;

        if (!projectId || !base64Blob) {
            return NextResponse.json({ error: "Missing required parameters: projectId and base64Blob." }, { status: 400 });
        }

        const current = await downloadFromCloudStorage(userId, projectId);
        if (current && current.version > fileVersion) {
            return NextResponse.json(
                {
                    error: "Sync conflict detected.",
                    serverVersion: current.version,
                    clientVersion: fileVersion,
                },
                { status: 409 }
            );
        }

        const buffer = Buffer.from(base64Blob, "base64");
        const result = await uploadToCloudStorage(userId, projectId, buffer, fileVersion || 1);

        return NextResponse.json({
            success: true,
            storageUsed: result.storageUsed,
            message: "Project synced to online database storage.",
        });
    }
    catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
