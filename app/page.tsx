import { getDbService } from "@/packages/db";
import { WorkspaceClient } from "@/components/layout/WorkspaceClient";

export const dynamic = "force-dynamic";

export default async function Page() {
  const db = getDbService();
  const initialProjectsList = db.listProjects();

  let initialProject = null;
  if (initialProjectsList.length > 0) {
    initialProject = db.getProject(initialProjectsList[0].id);
  }

  return (
    <WorkspaceClient
      initialProjectsList={initialProjectsList}
      initialProject={initialProject}
    />
  );
}
