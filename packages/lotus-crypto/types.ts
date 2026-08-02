import { SchemaAST } from "@schema-flow/schema-core";

/**
 * Custom error thrown when lotus file version is incompatible or migration fails.
 */
export class LotusVersionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "LotusVersionError";
    }
}

/**
 * Custom error thrown when lotus file decryption or integrity check fails.
 */
export class LotusDecryptionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "LotusDecryptionError";
    }
}

/**
 * Serialized structure of a .lotus encrypted file.
 */
export interface LotusFilePayload {
    magic: "LOTUS1";
    version: number;

    /** Unencrypted hints for file browser UX */
    projectHint?: string;
    dialectHint?: string;
    createdAt: string;
    updatedAt: string;

    /** Monotonic save counter for conflict detection */
    fileVersion: number;
    /** Device ID that last modified this file */
    lastModifiedBy: string;

    /** Key envelope — DEK wrapped by master key */
    wrappedDek: string;
    dekIv: string;
    dekSalt: string;

    /** Portable mode — DEK stored in plaintext */
    isPortable: boolean;
    plainDek?: string;

    /** Data encryption parameters */
    dataSalt: string;
    dataIv: string;
    checksum: string;
    ciphertext: string;
}

/**
 * Result of successful lotus file decryption.
 */
export interface LotusDecryptResult {
    ast: SchemaAST;
    fileVersion: number;
    lastModifiedBy: string;
    metadata: {
        projectHint?: string;
        dialectHint?: string;
        createdAt: string;
        updatedAt: string;
    };
}

/**
 * Format version migration function signature.
 */
export type LotusVersionMigrator = (payload: Record<string, unknown>) => LotusFilePayload;
