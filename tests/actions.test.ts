import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
    listProjectsAction,
    getProjectAction,
    createProjectAction,
    deleteProjectAction
} from "@/app/actions/projects";
import { closeDbService } from "@/packages/db";
import fs from "fs";
import path from "path";

describe("Server Actions Edge Cases", () => {
    const testDbPath = path.join(__dirname, "test_actions_db.db");

    beforeEach(() => {
        process.env.DATABASE_PATH = testDbPath;
        closeDbService();
        if (fs.existsSync(testDbPath)) {
            try {
                fs.unlinkSync(testDbPath);
            }
            catch {}
        }
    });

    afterEach(() => {
        closeDbService();
        if (fs.existsSync(testDbPath)) {
            try {
                fs.unlinkSync(testDbPath);
            }
            catch {}
        }
    });

    it("should create project via Server Action and validate input schema", async () => {
        const res = await createProjectAction({
            name: "Server Action Proj",
            description: "Testing server actions",
            dialect: "postgres"
        });

        expect(res.success).toBe(true);
        expect(res.project).toBeDefined();
        expect(res.project?.project.name).toBe("Server Action Proj");

        const invalidRes = await createProjectAction({
            name: "",
            description: "",
            dialect: "sqlite"
        });
        expect(invalidRes.success).toBe(false);
        expect(invalidRes.error).toBeDefined();
    });

    it("should list, fetch, save, and delete projects via Server Actions", async () => {
        const createRes = await createProjectAction({
            name: "Project Alpha",
            description: "Alpha desc",
            dialect: "sqlite"
        });
        const projId = createRes.project!.project.id;

        const listRes = await listProjectsAction();
        expect(listRes.success).toBe(true);
        expect(listRes.projects.some(p => p.id === projId)).toBe(true);

        const getRes = await getProjectAction(projId);
        expect(getRes.success).toBe(true);
        expect(getRes.project?.project.name).toBe("Project Alpha");

        const delRes = await deleteProjectAction(projId);
        expect(delRes.success).toBe(true);

        const getAfterDel = await getProjectAction(projId);
        expect(getAfterDel.success).toBe(false);
    });
});
