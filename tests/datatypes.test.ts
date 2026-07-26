/**
 * @file datatypes.test.ts
 * @description Unit tests for the dialect-specific data types registry and strategies.
 */

import { describe, it, expect } from "vitest";
import { DataTypeRegistry } from "@/packages/datatypes";

describe("DataTypeRegistry and Dialect Strategies", () => {
    it("should return SQLite specific data types and categories for sqlite dialect", () => {
        const types = DataTypeRegistry.getDataTypes("sqlite");
        const categories = DataTypeRegistry.getCategories("sqlite");

        expect(types.some(t => t.type === "INTEGER")).toBe(true);
        expect(types.some(t => t.type === "REAL")).toBe(true);
        expect(types.some(t => t.type === "TEXT")).toBe(true);

        expect(categories.some(c => c.category === "numeric")).toBe(true);
        expect(categories.some(c => c.category === "string")).toBe(true);
    });

    it("should return PostgreSQL specific data types and categories for postgres dialect", () => {
        const types = DataTypeRegistry.getDataTypes("postgres");
        const categories = DataTypeRegistry.getCategories("postgres");

        expect(types.some(t => t.type === "TIMESTAMPTZ")).toBe(true);
        expect(types.some(t => t.type === "JSONB")).toBe(true);
        expect(types.some(t => t.type === "UUID")).toBe(true);
        expect(types.some(t => t.type === "BIGSERIAL")).toBe(true);

        expect(categories.some(c => c.category === "complex")).toBe(true);
    });

    it("should return MySQL specific data types and categories for mysql dialect", () => {
        const types = DataTypeRegistry.getDataTypes("mysql");
        const categories = DataTypeRegistry.getCategories("mysql");

        expect(types.some(t => t.type === "TINYINT")).toBe(true);
        expect(types.some(t => t.type === "LONGTEXT")).toBe(true);
        expect(types.some(t => t.type === "DATETIME")).toBe(true);

        expect(categories.some(c => c.category === "numeric")).toBe(true);
    });
});
