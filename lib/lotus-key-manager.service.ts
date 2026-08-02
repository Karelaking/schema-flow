import { get, set } from "idb-keyval";

const IDB_MASTER_KEY = "schema-flow:lotus-master-key";

/**
 * Retrieves the master encryption key.
 * Checks IndexedDB cache first for offline capability, falling back to /api/lotus-key.
 * @returns Master key string for AES-GCM wrapping.
 */
export async function getMasterKey(): Promise<string> {
    try {
        const cached = await get<string>(IDB_MASTER_KEY);
        if (cached && typeof cached === "string" && cached.trim() !== "") {
            return cached;
        }
    }
    catch (err: unknown) {
        console.warn("[LotusKeyManager] IndexedDB read failed, trying API endpoint:", err);
    }

    try {
        const res = await fetch("/api/lotus-key");
        if (!res.ok) {
            throw new Error(`Server returned HTTP ${res.status}`);
        }
        const data = await res.json();
        if (data.key && typeof data.key === "string") {
            try {
                await set(IDB_MASTER_KEY, data.key);
            }
            catch (cacheErr: unknown) {
                console.warn("[LotusKeyManager] Failed to cache master key in IndexedDB:", cacheErr);
            }
            return data.key;
        }
        throw new Error("Invalid key payload received from server.");
    }
    catch (err: unknown) {
        const cachedFallback = await get<string>(IDB_MASTER_KEY).catch(() => undefined);
        if (cachedFallback) {
            return cachedFallback;
        }
        throw new Error("Unable to retrieve encryption master key. Network offline and no key cached.");
    }
}

/**
 * Clears the cached master key in IndexedDB.
 */
export async function clearCachedMasterKey(): Promise<void> {
    try {
        await set(IDB_MASTER_KEY, undefined);
    }
    catch (err: unknown) {
        console.warn("[LotusKeyManager] Failed to clear master key cache:", err);
    }
}
