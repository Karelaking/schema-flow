"use server";

import { getDbService } from "@/packages/db";
import { SchemaAST, ProjectMetadata } from "@/packages/schema-core";
import { createProjectSchema, CreateProjectInput } from "@/lib/schemas";

/**
 * Server Action: List all database projects.
 * @returns Array of project metadata objects.
 */
export async function listProjectsAction(): Promise<{ success: boolean; projects: ProjectMetadata[]; error?: string }> {
    try {
        const db = getDbService();
        const projects = await db.listProjects();
        return { success: true, projects };
    }
    catch (error: unknown) {
        return { success: false, projects: [], error: error instanceof Error ? error.message : String(error) };
    }
}

/**
 * Server Action: Retrieve full AST for a specific project.
 * @param id Unique project identifier.
 * @returns Project AST or error details.
 */
export async function getProjectAction(id: string): Promise<{ success: boolean; project?: SchemaAST; error?: string }> {
    try {
        const db = getDbService();
        const project = await db.getProject(id);
        if (!project) {
            return { success: false, error: "Project not found" };
        }
        return { success: true, project };
    }
    catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

/**
 * Server Action: Create a new database schema project.
 * @param input Validated project details.
 * @returns Created project AST or error details.
 */
export async function createProjectAction(input: CreateProjectInput): Promise<{ success: boolean; project?: SchemaAST; error?: string }> {
    try {
        const validated = createProjectSchema.parse(input);
        const db = getDbService();
        const id = `proj-${Date.now()}`;
        const now = new Date().toISOString();

        const initialAST: SchemaAST = {
            project: {
                id,
                name: validated.name,
                description: validated.description,
                createdAt: now,
                updatedAt: now,
            },
            settings: {
                dialect: validated.dialect,
                theme: "dark",
                autoAddId: true,
                autoAddTimestamps: true,
                storageMode: validated.storageMode || "database",
            },
            tables: {},
            relations: {},
            enums: {},
        };

        await db.saveProject(id, initialAST);
        return { success: true, project: initialAST };
    }
    catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

/**
 * Server Action: Save/update an existing database schema AST.
 * @param id Unique project identifier.
 * @param ast Full schema AST payload.
 * @returns Success flag or error details.
 */
export async function saveProjectAction(id: string, ast: SchemaAST): Promise<{ success: boolean; error?: string }> {
    try {
        const db = getDbService();
        await db.saveProject(id, ast);
        return { success: true };
    }
    catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

/**
 * Server Action: Permanently delete a project by ID with 2-step verification.
 * @param id Unique project identifier.
 * @param confirmationName Typed project name for two-step server verification.
 * @returns Success flag or error details.
 */
export async function deleteProjectAction(id: string, confirmationName?: string): Promise<{ success: boolean; error?: string }> {
    try {
        const db = getDbService();
        await db.deleteProject(id, confirmationName);
        return { success: true };
    }
    catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}
