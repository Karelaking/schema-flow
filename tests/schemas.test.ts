import { describe, it, expect } from "vitest";
import { createProjectSchema, projectSettingsSchema } from "@/lib/schemas";

describe("createProjectSchema Edge Cases", () => {
    it("should pass for valid project inputs", () => {
        const validData = {
            name: "my_database",
            description: "A valid schema description",
            dialect: "sqlite" as const,
        };
        const result = createProjectSchema.safeParse(validData);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.name).toBe("my_database");
            expect(result.data.dialect).toBe("sqlite");
        }
    });

    it("should fail when project name is empty", () => {
        const invalidData = {
            name: "",
            description: "Valid desc",
            dialect: "postgres" as const,
        };
        const result = createProjectSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
            const issue = result.error.issues.find(i => i.path.includes("name"));
            expect(issue?.message).toBe("Project name is required");
        }
    });

    it("should fail when project name exceeds 64 characters", () => {
        const invalidData = {
            name: "a".repeat(65),
            description: "Valid desc",
            dialect: "mysql" as const,
        };
        const result = createProjectSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
            const issue = result.error.issues.find(i => i.path.includes("name"));
            expect(issue?.message).toBe("Name must be 64 characters or less");
        }
    });

    it("should fail when description exceeds 256 characters", () => {
        const invalidData = {
            name: "valid_name",
            description: "b".repeat(257),
            dialect: "sqlite" as const,
        };
        const result = createProjectSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
            const issue = result.error.issues.find(i => i.path.includes("description"));
            expect(issue?.message).toBe("Description must be 256 characters or less");
        }
    });

    it("should fail when dialect is invalid", () => {
        const invalidData = {
            name: "valid_name",
            description: "desc",
            dialect: "oracle" as unknown as "sqlite",
        };
        const result = createProjectSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });
});

describe("projectSettingsSchema Edge Cases", () => {
    it("should pass for valid project settings inputs", () => {
        const validSettings = {
            name: "updated_db",
            description: "Updated description",
            dialect: "postgres" as const,
            autoAddId: true,
            autoAddTimestamps: false,
        };
        const result = projectSettingsSchema.safeParse(validSettings);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.autoAddId).toBe(true);
            expect(result.data.autoAddTimestamps).toBe(false);
        }
    });

    it("should fail when boolean flags are missing or invalid types", () => {
        const invalidSettings = {
            name: "valid_name",
            description: "",
            dialect: "sqlite" as const,
            autoAddId: "yes" as unknown as boolean,
            autoAddTimestamps: true,
        };
        const result = projectSettingsSchema.safeParse(invalidSettings);
        expect(result.success).toBe(false);
    });
});
