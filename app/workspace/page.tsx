import React from "react";
import type { Metadata } from "next";
import { getDbService } from "@/packages/db";
import { WorkspaceClient } from "@/components/layout/WorkspaceClient";
import { SchemaAST } from "@/packages/schema-core";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Workspace",
    description: "Visual ERD canvas workspace for designing database tables, relationships, Drizzle ORM models, and exporting SQL.",
};

/**
 * Server component for workspace page.
 */
export default async function WorkspacePage(): Promise<React.ReactElement> {
    const db = getDbService();
    const initialProjectsList = await db.listProjects();

    let initialProject: SchemaAST | undefined = undefined;
    if (initialProjectsList.length > 0) {
        initialProject = await db.getProject(initialProjectsList[0].id);
    }

    return (
        <WorkspaceClient
            initialProjectsList={initialProjectsList}
            initialProject={initialProject}
        />
    );
}
