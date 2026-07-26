import { NextResponse } from "next/server";
import { getDbService } from "@/packages/db";
import { SchemaAST } from "@/packages/schema-core";

/**
 * GET /api/projects
 * Lists all projects.
 */
export async function GET(): Promise<NextResponse> {
    try {
        const db = getDbService();
        const projects = await db.listProjects();
        return NextResponse.json({ success: true, projects });
    }
    catch (error: unknown) {
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}

/**
 * POST /api/projects
 * Creates a new project with initial AST payload.
 */
export async function POST(request: Request): Promise<NextResponse> {
    try {
        const db = getDbService();
        const body = await request.json();
        const { id, name, description, dialect } = body;

        if (!id || !name) {
            return NextResponse.json({ success: false, error: "ID and Name are required" }, { status: 400 });
        }

        const now = new Date().toISOString();

        // Seed initial AST with empty tables, relations, and enums
        const initialAST: SchemaAST = {
            project: { id, name, description, createdAt: now, updatedAt: now },
            settings: { dialect: dialect || "sqlite", theme: "dark" },
            tables: {},
            relations: {},
            enums: {},
        };

        await db.saveProject(id, initialAST);
        return NextResponse.json({ success: true, project: initialAST.project });
    }
    catch (error: unknown) {
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
