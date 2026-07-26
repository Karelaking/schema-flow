import { describe, it, expect } from "vitest";

function parseEnumValuesJson(valuesJson?: string): string[] {
    let values: string[] = [];
    if (valuesJson) {
        try {
            const parsed = JSON.parse(valuesJson);
            if (Array.isArray(parsed)) {
                values = parsed.map(v => String(v));
            }
            else if (typeof parsed === "string") {
                values = parsed.split(",").map(v => v.trim().replace(/^['"]|['"]$/g, "")).filter(Boolean);
            }
        }
        catch {
            const cleaned = valuesJson
                .replace(/^\[|\]$/g, "")
                .split(",")
                .map(v => v.trim().replace(/^['"]|['"]$/g, ""))
                .filter(Boolean);
            values = cleaned;
        }
    }
    return values;
}

describe("Enum Values Parsing", () => {
    it("parses valid JSON array strings", () => {
        expect(parseEnumValuesJson('["ACTIVE", "INACTIVE"]')).toEqual(["ACTIVE", "INACTIVE"]);
    });

    it("parses single-quoted array strings", () => {
        expect(parseEnumValuesJson("['ACTIVE', 'INACTIVE']")).toEqual(["ACTIVE", "INACTIVE"]);
    });

    it("parses raw comma-separated value strings", () => {
        expect(parseEnumValuesJson("ACTIVE, INACTIVE, PENDING")).toEqual(["ACTIVE", "INACTIVE", "PENDING"]);
    });

    it("handles empty or undefined values safely", () => {
        expect(parseEnumValuesJson("")).toEqual([]);
        expect(parseEnumValuesJson(undefined)).toEqual([]);
    });
});
