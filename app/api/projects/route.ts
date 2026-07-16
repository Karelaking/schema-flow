import { NextResponse } from "next/server";
import { getDbService } from "@/packages/db";
import { SchemaAST } from "@/packages/schema-core";

export async function GET() {
  try {
    const db = getDbService();
    const projects = db.listProjects();
    return NextResponse.json({ success: true, projects });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = getDbService();
    const body = await request.json();
    const { id, name, description, dialect } = body;
    
    if (!id || !name) {
      return NextResponse.json({ success: false, error: "ID and Name are required" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const initialAST: SchemaAST = {
      project: { id, name, description, createdAt: now, updatedAt: now },
      settings: { dialect: dialect || "sqlite", theme: "dark" },
      tables: {},
      relations: {}
    };

    db.saveProject(id, initialAST);
    return NextResponse.json({ success: true, project: initialAST.project });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
