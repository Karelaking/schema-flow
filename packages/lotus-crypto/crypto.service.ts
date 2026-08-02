import { SchemaAST } from "@schema-flow/schema-core";
import {
    LotusFilePayload,
    LotusDecryptResult,
    LotusDecryptionError,
} from "./types";
import { migratePayload, CURRENT_LOTUS_VERSION } from "./version-migrator";

/**
 * Encodes an ArrayBuffer to a Base64 string.
 */
function bufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return typeof btoa === "function"
        ? btoa(binary)
        : Buffer.from(bytes).toString("base64");
}

/**
 * Decodes a Base64 string to an ArrayBuffer.
 */
function base64ToBuffer(base64: string): ArrayBuffer {
    if (typeof atob === "function") {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }
    const buf = Buffer.from(base64, "base64");
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

/**
 * Computes SHA-256 checksum of string payload.
 */
export async function computeChecksum(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", dataBuffer);
    return bufferToBase64(hashBuffer);
}

/**
 * Derives a master wrapping key from passphrase/master key using PBKDF2.
 */
export async function deriveMasterWrappingKey(masterKey: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await globalThis.crypto.subtle.importKey(
        "raw",
        encoder.encode(masterKey),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    return await globalThis.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt as BufferSource,
            iterations: 100000,
            hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
    );
}

/**
 * Generates a cryptographically random 256-bit AES-GCM Data Encryption Key (DEK).
 */
export async function generateDek(): Promise<CryptoKey> {
    return await globalThis.crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
}

/**
 * Wraps a DEK using the master wrapping key.
 */
export async function wrapDek(
    dek: CryptoKey,
    masterWrappingKey: CryptoKey
): Promise<{ wrappedDek: string; dekIv: string }> {
    const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
    const wrappedBuffer = await globalThis.crypto.subtle.wrapKey(
        "raw",
        dek,
        masterWrappingKey,
        { name: "AES-GCM", iv: iv }
    );

    return {
        wrappedDek: bufferToBase64(wrappedBuffer),
        dekIv: bufferToBase64(iv.buffer),
    };
}

/**
 * Unwraps a DEK using the master wrapping key.
 */
export async function unwrapDek(
    wrappedDekBase64: string,
    dekIvBase64: string,
    masterWrappingKey: CryptoKey
): Promise<CryptoKey> {
    const wrappedBuffer = base64ToBuffer(wrappedDekBase64);
    const ivBuffer = base64ToBuffer(dekIvBase64);

    try {
        return await globalThis.crypto.subtle.unwrapKey(
            "raw",
            wrappedBuffer,
            masterWrappingKey,
            { name: "AES-GCM", iv: new Uint8Array(ivBuffer) },
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );
    }
    catch (err: unknown) {
        throw new LotusDecryptionError("Failed to unwrap Data Encryption Key. Invalid master key or corrupted envelope.");
    }
}

/**
 * Encrypts data payload using AES-GCM and a DEK.
 */
export async function encryptData(
    plaintext: string,
    dek: CryptoKey
): Promise<{ ciphertext: string; dataIv: string; dataSalt: string }> {
    const encoder = new TextEncoder();
    const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
    const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));

    const encryptedBuffer = await globalThis.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        dek,
        encoder.encode(plaintext)
    );

    return {
        ciphertext: bufferToBase64(encryptedBuffer),
        dataIv: bufferToBase64(iv.buffer),
        dataSalt: bufferToBase64(salt.buffer),
    };
}

/**
 * Decrypts data payload using AES-GCM and a DEK.
 */
export async function decryptData(
    ciphertextBase64: string,
    dataIvBase64: string,
    dek: CryptoKey
): Promise<string> {
    const cipherBuffer = base64ToBuffer(ciphertextBase64);
    const ivBuffer = base64ToBuffer(dataIvBase64);

    try {
        const decryptedBuffer = await globalThis.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: new Uint8Array(ivBuffer) },
            dek,
            cipherBuffer
        );
        const decoder = new TextDecoder();
        return decoder.decode(decryptedBuffer);
    }
    catch (err: unknown) {
        throw new LotusDecryptionError("Failed to decrypt lotus file payload. Data is corrupted or key is invalid.");
    }
}

/**
 * Encrypts a SchemaAST project into a LotusFilePayload structure.
 */
export async function encrypt(
    ast: SchemaAST,
    masterKey: string,
    options?: {
        fileVersion?: number;
        lastModifiedBy?: string;
        existingDek?: CryptoKey;
    }
): Promise<LotusFilePayload> {
    const jsonString = JSON.stringify(ast);
    const checksum = await computeChecksum(jsonString);

    const dekSalt = globalThis.crypto.getRandomValues(new Uint8Array(16));
    const masterWrappingKey = await deriveMasterWrappingKey(masterKey, dekSalt);

    const dek = options?.existingDek || (await generateDek());
    const { wrappedDek, dekIv } = await wrapDek(dek, masterWrappingKey);

    const { ciphertext, dataIv, dataSalt } = await encryptData(jsonString, dek);

    const now = new Date().toISOString();

    return {
        magic: "LOTUS1",
        version: CURRENT_LOTUS_VERSION,
        projectHint: ast.project.name,
        dialectHint: ast.settings.dialect,
        createdAt: ast.project.createdAt || now,
        updatedAt: now,
        fileVersion: options?.fileVersion || 1,
        lastModifiedBy: options?.lastModifiedBy || "local-device",
        wrappedDek,
        dekIv,
        dekSalt: bufferToBase64(dekSalt.buffer),
        isPortable: false,
        dataSalt,
        dataIv,
        checksum,
        ciphertext,
    };
}

/**
 * Decrypts a LotusFilePayload structure into SchemaAST and metadata.
 */
export async function decrypt(
    rawPayload: Record<string, unknown>,
    masterKey: string
): Promise<LotusDecryptResult> {
    const payload = migratePayload(rawPayload);

    let dek: CryptoKey;

    if (payload.isPortable && payload.plainDek) {
        const rawDekBuffer = base64ToBuffer(payload.plainDek);
        dek = await globalThis.crypto.subtle.importKey(
            "raw",
            rawDekBuffer,
            { name: "AES-GCM" },
            true,
            ["encrypt", "decrypt"]
        );
    }
    else {
        const dekSalt = new Uint8Array(base64ToBuffer(payload.dekSalt));
        const masterWrappingKey = await deriveMasterWrappingKey(masterKey, dekSalt);
        dek = await unwrapDek(payload.wrappedDek, payload.dekIv, masterWrappingKey);
    }

    const plaintext = await decryptData(payload.ciphertext, payload.dataIv, dek);

    const computedHash = await computeChecksum(plaintext);
    if (computedHash !== payload.checksum) {
        throw new LotusDecryptionError("Integrity check failed. Checksum mismatch detected.");
    }

    let ast: SchemaAST;
    try {
        ast = JSON.parse(plaintext) as SchemaAST;
    }
    catch {
        throw new LotusDecryptionError("Failed to parse decrypted payload as valid SchemaAST JSON.");
    }

    return {
        ast,
        fileVersion: payload.fileVersion || 1,
        lastModifiedBy: payload.lastModifiedBy || "unknown-device",
        metadata: {
            projectHint: payload.projectHint,
            dialectHint: payload.dialectHint,
            createdAt: payload.createdAt,
            updatedAt: payload.updatedAt,
        },
    };
}

/**
 * Encrypts a SchemaAST project in Portable mode (stores plain DEK for cross-deployment portability).
 */
export async function encryptPortable(
    ast: SchemaAST,
    options?: {
        fileVersion?: number;
        lastModifiedBy?: string;
    }
): Promise<LotusFilePayload> {
    const jsonString = JSON.stringify(ast);
    const checksum = await computeChecksum(jsonString);

    const dek = await generateDek();
    const exportedRawDek = await globalThis.crypto.subtle.exportKey("raw", dek);
    const plainDekBase64 = bufferToBase64(exportedRawDek);

    const { ciphertext, dataIv, dataSalt } = await encryptData(jsonString, dek);

    const now = new Date().toISOString();
    const dekSalt = globalThis.crypto.getRandomValues(new Uint8Array(16));

    return {
        magic: "LOTUS1",
        version: CURRENT_LOTUS_VERSION,
        projectHint: ast.project.name,
        dialectHint: ast.settings.dialect,
        createdAt: ast.project.createdAt || now,
        updatedAt: now,
        fileVersion: options?.fileVersion || 1,
        lastModifiedBy: options?.lastModifiedBy || "local-device",
        wrappedDek: "",
        dekIv: "",
        dekSalt: bufferToBase64(dekSalt.buffer),
        isPortable: true,
        plainDek: plainDekBase64,
        dataSalt,
        dataIv,
        checksum,
        ciphertext,
    };
}

/**
 * Decrypts a portable LotusFilePayload.
 */
export async function decryptPortable(
    rawPayload: Record<string, unknown>
): Promise<LotusDecryptResult> {
    const payload = migratePayload(rawPayload);

    if (!payload.isPortable || !payload.plainDek) {
        throw new LotusDecryptionError("File is not a portable .lotus file.");
    }

    const rawDekBuffer = base64ToBuffer(payload.plainDek);
    const dek = await globalThis.crypto.subtle.importKey(
        "raw",
        rawDekBuffer,
        { name: "AES-GCM" },
        true,
        ["encrypt", "decrypt"]
    );

    const plaintext = await decryptData(payload.ciphertext, payload.dataIv, dek);

    const computedHash = await computeChecksum(plaintext);
    if (computedHash !== payload.checksum) {
        throw new LotusDecryptionError("Integrity check failed. Checksum mismatch detected.");
    }

    const ast = JSON.parse(plaintext) as SchemaAST;

    return {
        ast,
        fileVersion: payload.fileVersion || 1,
        lastModifiedBy: payload.lastModifiedBy || "unknown-device",
        metadata: {
            projectHint: payload.projectHint,
            dialectHint: payload.dialectHint,
            createdAt: payload.createdAt,
            updatedAt: payload.updatedAt,
        },
    };
}
