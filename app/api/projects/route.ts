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
    
    // Seed initial AST with sample tables (users and orders) to showcase schema node renderings on the canvas
    const initialAST: SchemaAST = {
      project: { id, name, description, createdAt: now, updatedAt: now },
      settings: { dialect: dialect || "sqlite", theme: "dark" },
      tables: {
        "users": {
          id: "users",
          name: "users",
          description: "Registered website users and account profile data",
          color: "#3b82f6",
          position: { x: 100, y: 150 },
          columns: [
            {
              id: "users_id",
              name: "id",
              type: "INTEGER",
              constraints: {
                isPrimaryKey: true,
                isNullable: false,
                isUnique: false,
                isAutoIncrement: true
              }
            },
            {
              id: "users_email",
              name: "email",
              type: "TEXT",
              constraints: {
                isPrimaryKey: false,
                isNullable: false,
                isUnique: true,
                isAutoIncrement: false
              }
            },
            {
              id: "users_name",
              name: "name",
              type: "TEXT",
              constraints: {
                isPrimaryKey: false,
                isNullable: true,
                isUnique: false,
                isAutoIncrement: false
              }
            },
            {
              id: "users_created_at",
              name: "created_at",
              type: "TEXT",
              constraints: {
                isPrimaryKey: false,
                isNullable: false,
                isUnique: false,
                isAutoIncrement: false,
                defaultValue: "CURRENT_TIMESTAMP"
              }
            }
          ]
        },
        "orders": {
          id: "orders",
          name: "orders",
          description: "Customer purchasing transactions and totals",
          color: "#10b981",
          position: { x: 520, y: 150 },
          columns: [
            {
              id: "orders_id",
              name: "id",
              type: "INTEGER",
              constraints: {
                isPrimaryKey: true,
                isNullable: false,
                isUnique: false,
                isAutoIncrement: true
              }
            },
            {
              id: "orders_user_id",
              name: "user_id",
              type: "INTEGER",
              constraints: {
                isPrimaryKey: false,
                isNullable: true,
                isUnique: false,
                isAutoIncrement: false
              }
            },
            {
              id: "orders_total",
              name: "total",
              type: "REAL",
              constraints: {
                isPrimaryKey: false,
                isNullable: false,
                isUnique: false,
                isAutoIncrement: false,
                defaultValue: "0.0"
              }
            },
            {
              id: "orders_created_at",
              name: "created_at",
              type: "TEXT",
              constraints: {
                isPrimaryKey: false,
                isNullable: false,
                isUnique: false,
                isAutoIncrement: false,
                defaultValue: "CURRENT_TIMESTAMP"
              }
            }
          ]
        }
      },
      relations: {
        "rel_orders_user_id_users_id": {
          id: "rel_orders_user_id_users_id",
          name: "fk_orders_users",
          sourceTableId: "orders",
          sourceColumnId: "orders_user_id",
          targetTableId: "users",
          targetColumnId: "users_id",
          type: "many-to-one",
          onDelete: "cascade",
          onUpdate: "restrict"
        }
      }
    };

    db.saveProject(id, initialAST);
    return NextResponse.json({ success: true, project: initialAST.project });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
