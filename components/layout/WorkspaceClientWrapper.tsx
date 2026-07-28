"use client";

import React, { use } from "react";
import { WorkspaceClient } from "./WorkspaceClient";
import { ProjectMetadata, SchemaAST } from "@/packages/schema-core";

interface WorkspaceClientWrapperProps {
    projectsPromise: Promise<ProjectMetadata[]>;
    projectPromise: Promise<SchemaAST | undefined>;
}

/**
 * Client Component Wrapper: Resolves database promises using React 19 use() hook inside Suspense boundary.
 */
export default function WorkspaceClientWrapper({
    projectsPromise,
    projectPromise,
}: WorkspaceClientWrapperProps): React.ReactElement {
    const initialProjectsList = use(projectsPromise);
    const initialProject = use(projectPromise);

    return (
        <WorkspaceClient
            initialProjectsList={initialProjectsList}
            initialProject={initialProject}
        />
    );
}
