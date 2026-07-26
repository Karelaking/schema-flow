import { describe, it, expect } from "vitest";

function shouldSkipOverwrite(
    payloadTablesCount: number,
    existingTablesCount: number
): boolean {
    return payloadTablesCount === 0 && existingTablesCount > 0;
}

function shouldDeleteRelations(
    payloadRelationsCount: number,
    existingRelationsCount: number
): boolean {
    return payloadRelationsCount > 0 || existingRelationsCount === 0;
}

function shouldDeleteEnums(
    payloadEnumsCount: number,
    existingEnumsCount: number
): boolean {
    return payloadEnumsCount > 0 || existingEnumsCount === 0;
}

describe("Database Overwrite Safeguards", () => {
    it("skips project table overwrite when incoming payload is empty but DB has tables", () => {
        expect(shouldSkipOverwrite(0, 5)).toBe(true);
        expect(shouldSkipOverwrite(3, 5)).toBe(false);
        expect(shouldSkipOverwrite(0, 0)).toBe(false);
    });

    it("prevents deleting relations when payload relations are empty but DB has existing relations", () => {
        expect(shouldDeleteRelations(0, 3)).toBe(false);
        expect(shouldDeleteRelations(2, 3)).toBe(true);
        expect(shouldDeleteRelations(0, 0)).toBe(true);
    });

    it("prevents deleting enums when payload enums are empty but DB has existing enums", () => {
        expect(shouldDeleteEnums(0, 2)).toBe(false);
        expect(shouldDeleteEnums(1, 2)).toBe(true);
        expect(shouldDeleteEnums(0, 0)).toBe(true);
    });
});
