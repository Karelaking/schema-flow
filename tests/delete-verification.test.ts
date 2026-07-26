import { describe, it, expect } from "vitest";

function verifyServerDeletion(
    targetProjectName: string,
    confirmationName?: string
): { success: boolean; error?: string } {
    if (!confirmationName || confirmationName.trim() !== targetProjectName.trim()) {
        return {
            success: false,
            error: `Server Verification Error: Two-step verification failed. Confirmation name '${confirmationName}' does not match target project name '${targetProjectName}'.`,
        };
    }
    return { success: true };
}

describe("Server-Side 2-Step Deletion Verification", () => {
    it("rejects deletion when confirmation name is missing", () => {
        const result = verifyServerDeletion("E-Commerce Schema", undefined);
        expect(result.success).toBe(false);
        expect(result.error).toContain("Two-step verification failed");
    });

    it("rejects deletion when typed confirmation name does not match project name", () => {
        const result = verifyServerDeletion("E-Commerce Schema", "Ecommerce");
        expect(result.success).toBe(false);
        expect(result.error).toContain("Two-step verification failed");
    });

    it("approves deletion when typed confirmation name matches project name exactly", () => {
        const result = verifyServerDeletion("E-Commerce Schema", "E-Commerce Schema");
        expect(result.success).toBe(true);
        expect(result.error).toBeUndefined();
    });
});
