import { NextResponse } from "next/server";
import { getDbService } from "@/packages/db";
import { captureException } from "@/lib/sentry.util";

/**
 * GET /api/projects/[id]
 * Retrieves full AST for a given project ID.
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const { id } = await params;
        const db = getDbService();
        const project = await db.getProject(id);

        if (!project) {
            return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, project });
    }
    catch (error: unknown) {
        captureException(error, { endpoint: "/api/projects/[id]", method: "GET" });
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}

/**
 * PUT /api/projects/[id]
 * Updates schema AST for a given project ID.
 */
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const { id } = await params;
        const db = getDbService();
        const body = await request.json();

        if (!body || !body.project) {
            return NextResponse.json({ success: false, error: "Invalid Schema AST payload" }, { status: 400 });
        }

        await db.saveProject(id, body);
        return NextResponse.json({ success: true });
    }
    catch (error: unknown) {
        captureException(error, { endpoint: "/api/projects/[id]", method: "PUT" });
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}

/**
 * DELETE /api/projects/[id]
 * Permanently deletes a project.
 */
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const { id } = await params;
        const db = getDbService();
        await db.deleteProject(id);
        return NextResponse.json({ success: true });
    }
    catch (error: unknown) {
        captureException(error, { endpoint: "/api/projects/[id]", method: "DELETE" });
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}

