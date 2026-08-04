import React, { cache } from "react";
import type { Metadata } from "next";
import { getDbService } from "@/packages/db";
import { WorkspaceClient } from "@/components/layout/WorkspaceClient";
import { SchemaAST } from "@/packages/schema-core";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Visual ERD Canvas & Schema Workspace | Schema Flow Studio",
    description: "Interactive visual ERD canvas workspace for designing database tables, defining relational constraints, generating type-safe Drizzle ORM schemas, and exporting production SQL DDL.",
    robots: {
        index: false,
        follow: false,
    },
};

const getCachedProjectsList = cache(async () => {
    const db = getDbService();
    return await db.listProjects();
});

const getCachedProject = cache(async (id: string) => {
    const db = getDbService();
    return await db.getProject(id);
});

/**
 * Server component for workspace page with request-memoized database access.
 */
export default async function WorkspacePage(): Promise<React.ReactElement> {
    const initialProjectsList = await getCachedProjectsList();

    let initialProject: SchemaAST | undefined = undefined;
    if (initialProjectsList.length > 0) {
        initialProject = await getCachedProject(initialProjectsList[0].id);
    }

    return (
        <WorkspaceClient
            initialProjectsList={initialProjectsList}
            initialProject={initialProject}
        />
    );
}
