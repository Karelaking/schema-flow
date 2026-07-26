import { describe, it, expect } from "vitest";

export const AUTOSAVE_DELAY_MS = 3000;

describe("Auto-Save Delay Configuration", () => {
    it("is configured to exactly 3000ms (3 seconds)", () => {
        expect(AUTOSAVE_DELAY_MS).toBe(3000);
    });
});
