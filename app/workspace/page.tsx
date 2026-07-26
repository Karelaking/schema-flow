import React from "react";
import { getDbService } from "@/packages/db";
import { WorkspaceClient } from "@/components/layout/WorkspaceClient";
import { SchemaAST } from "@/packages/schema-core";

export const dynamic = "force-dynamic";

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
