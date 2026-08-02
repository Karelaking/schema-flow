import { describe, it, expect } from "vitest";
import { SchemaAST } from "@schema-flow/schema-core";
import {
    encrypt,
    decrypt,
    encryptPortable,
    decryptPortable,
    LotusDecryptionError,
    LotusVersionError,
} from "../index";

const mockAST: SchemaAST = {
    project: {
        id: "proj-123",
        name: "Test E-Commerce Database",
        description: "A test database for lotus-crypto unit tests",
        createdAt: "2026-08-01T00:00:00.000Z",
        updatedAt: "2026-08-01T00:00:00.000Z",
    },
    settings: {
        dialect: "postgres",
        theme: "dark",
        autoAddId: true,
        autoAddTimestamps: true,
        storageMode: "lotus-local",
    },
    tables: {
        table_1: {
            id: "table_1",
            name: "users",
            position: { x: 100, y: 200 },
            columns: [
                {
                    id: "col_1",
                    name: "id",
                    type: "INTEGER",
                    constraints: {
                        isPrimaryKey: true,
                        isNullable: false,
                        isUnique: true,
                        isAutoIncrement: true,
                    },
                },
                {
                    id: "col_2",
                    name: "email",
                    type: "VARCHAR",
                    constraints: {
                        isPrimaryKey: false,
                        isNullable: false,
                        isUnique: true,
                        isAutoIncrement: false,
                    },
                },
            ],
            indexes: [],
        },
    },
    relations: {},
    enums: {},
};

const MASTER_KEY = "test-secret-master-key-32-chars!!";

describe("lotus-crypto package", () => {
    it("should encrypt and decrypt SchemaAST successfully with matching master key", async () => {
        const payload = await encrypt(mockAST, MASTER_KEY, { fileVersion: 3 });

        expect(payload.magic).toBe("LOTUS1");
        expect(payload.version).toBe(1);
        expect(payload.projectHint).toBe("Test E-Commerce Database");
        expect(payload.dialectHint).toBe("postgres");
        expect(payload.fileVersion).toBe(3);
        expect(payload.isPortable).toBe(false);

        const result = await decrypt(payload as unknown as Record<string, unknown>, MASTER_KEY);
        expect(result.ast).toEqual(mockAST);
        expect(result.fileVersion).toBe(3);
        expect(result.metadata.projectHint).toBe("Test E-Commerce Database");
    });

    it("should fail decryption when using wrong master key", async () => {
        const payload = await encrypt(mockAST, MASTER_KEY);
        const WRONG_KEY = "wrong-secret-master-key-32-chars!!";

        await expect(decrypt(payload as unknown as Record<string, unknown>, WRONG_KEY)).rejects.toThrow(
            LotusDecryptionError
        );
    });

    it("should fail decryption when ciphertext is tampered", async () => {
        const payload = await encrypt(mockAST, MASTER_KEY);
        payload.ciphertext = "A" + payload.ciphertext.slice(1);

        await expect(decrypt(payload as unknown as Record<string, unknown>, MASTER_KEY)).rejects.toThrow(
            LotusDecryptionError
        );
    });

    it("should encrypt and decrypt in portable mode without master key", async () => {
        const portablePayload = await encryptPortable(mockAST, { fileVersion: 5 });

        expect(portablePayload.isPortable).toBe(true);
        expect(portablePayload.plainDek).toBeDefined();

        const result = await decryptPortable(portablePayload as unknown as Record<string, unknown>);
        expect(result.ast).toEqual(mockAST);
        expect(result.fileVersion).toBe(5);
    });

    it("should reject future unsupported .lotus versions", async () => {
        const payload = await encrypt(mockAST, MASTER_KEY);
        (payload as unknown as Record<string, unknown>).version = 99;

        await expect(decrypt(payload as unknown as Record<string, unknown>, MASTER_KEY)).rejects.toThrow(
            LotusVersionError
        );
    });
});
