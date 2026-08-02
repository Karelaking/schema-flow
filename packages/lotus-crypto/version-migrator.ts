import { LotusFilePayload, LotusVersionError, LotusVersionMigrator } from "./types";

export const CURRENT_LOTUS_VERSION = 1;

/**
 * Registry of version migration handlers.
 */
const migrations: Record<number, LotusVersionMigrator> = {};

/**
 * Validates and migrates a .lotus raw payload object to the current format version.
 * @param raw Unvalidated JSON object read from a .lotus file.
 * @returns Validated LotusFilePayload conforming to CURRENT_LOTUS_VERSION.
 */
export function migratePayload(raw: Record<string, unknown>): LotusFilePayload {
    if (!raw || typeof raw !== "object") {
        throw new LotusVersionError("Invalid .lotus payload structure.");
    }

    if (raw.magic !== "LOTUS1") {
        throw new LotusVersionError("Invalid header magic bytes. Expected 'LOTUS1'.");
    }

    const version = typeof raw.version === "number" ? raw.version : 0;

    if (version > CURRENT_LOTUS_VERSION) {
        throw new LotusVersionError(
            `This .lotus file requires Schema Flow v${version}+. Please update the application.`
        );
    }

    let payload = raw;
    for (let v = version; v < CURRENT_LOTUS_VERSION; v++) {
        const migrator = migrations[v];
        if (!migrator) {
            throw new LotusVersionError(`No migration path available from v${v} to v${v + 1}.`);
        }
        payload = migrator(payload) as unknown as Record<string, unknown>;
    }

    return payload as unknown as LotusFilePayload;
}
