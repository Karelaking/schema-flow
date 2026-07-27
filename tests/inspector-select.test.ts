import { describe, it, expect } from "vitest";
import { InspectorView } from "@/components/layout/Inspector";

describe("Inspector View Selection", () => {
    it("handles valid inspector views", () => {
        const views: InspectorView[] = ["inspector", "code", "query", "validation"];
        expect(views).toHaveLength(4);
        expect(views).toContain("inspector");
        expect(views).toContain("code");
        expect(views).toContain("query");
        expect(views).toContain("validation");
    });
});
