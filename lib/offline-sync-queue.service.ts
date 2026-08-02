import { get, set, keys, del } from "idb-keyval";

const QUEUE_PREFIX = "lotus-sync-queue:";

/**
 * Queue item entry representing an offline sync change.
 */
export interface QueueEntry {
    projectId: string;
    blob: ArrayBuffer;
    fileVersion: number;
    lastModifiedBy: string;
    queuedAt: string;
}

let guardInstalled = false;

const beforeUnloadHandler = (e: BeforeUnloadEvent): string => {
    e.preventDefault();
    return "You have unsynced changes. Close anyway?";
};

function installBeforeUnloadGuard(): void {
    if (!guardInstalled && typeof window !== "undefined") {
        window.addEventListener("beforeunload", beforeUnloadHandler);
        guardInstalled = true;
    }
}

function removeBeforeUnloadGuard(): void {
    if (guardInstalled && typeof window !== "undefined") {
        window.removeEventListener("beforeunload", beforeUnloadHandler);
        guardInstalled = false;
    }
}

/**
 * Enqueues a project payload into the offline sync queue.
 */
export async function enqueue(entry: QueueEntry): Promise<void> {
    try {
        await set(`${QUEUE_PREFIX}${entry.projectId}`, entry);
        installBeforeUnloadGuard();
    }
    catch (err: unknown) {
        console.warn("[OfflineSyncQueue] Failed to enqueue sync item:", err);
    }
}

/**
 * Dequeues a project payload from the offline sync queue.
 */
export async function dequeue(projectId: string): Promise<QueueEntry | undefined> {
    try {
        const entry = await get<QueueEntry>(`${QUEUE_PREFIX}${projectId}`);
        if (entry) {
            await del(`${QUEUE_PREFIX}${projectId}`);
        }
        const remaining = await getQueueSize();
        if (remaining === 0) {
            removeBeforeUnloadGuard();
        }
        return entry;
    }
    catch (err: unknown) {
        console.warn("[OfflineSyncQueue] Failed to dequeue item:", err);
        return undefined;
    }
}

/**
 * Gets the number of pending queued items.
 */
export async function getQueueSize(): Promise<number> {
    try {
        const allKeys = await keys();
        return allKeys.filter((k: IDBValidKey) => String(k).startsWith(QUEUE_PREFIX)).length;
    }
    catch {
        return 0;
    }
}

/**
 * Retrieves all currently queued sync items.
 */
export async function getAllQueued(): Promise<QueueEntry[]> {
    try {
        const allKeys = await keys();
        const queueKeys = allKeys.filter((k: IDBValidKey) => String(k).startsWith(QUEUE_PREFIX));
        const entries: QueueEntry[] = [];
        for (const key of queueKeys) {
            const entry = await get<QueueEntry>(key);
            if (entry) {
                entries.push(entry);
            }
        }
        return entries;
    }
    catch (err: unknown) {
        console.warn("[OfflineSyncQueue] Failed to retrieve queued items:", err);
        return [];
    }
}

/**
 * Flushes all queued sync items when network connectivity is restored.
 */
export async function flush(
    uploadFn: (entry: QueueEntry) => Promise<"ok" | "conflict">,
    onConflict: (entry: QueueEntry) => void
): Promise<{ synced: number; conflicts: number }> {
    const entries = await getAllQueued();
    let synced = 0;
    let conflicts = 0;

    for (const entry of entries) {
        const result = await uploadFn(entry);
        if (result === "ok") {
            await del(`${QUEUE_PREFIX}${entry.projectId}`);
            synced++;
        }
        else {
            conflicts++;
            onConflict(entry);
        }
    }

    const remaining = await getQueueSize();
    if (remaining === 0) {
        removeBeforeUnloadGuard();
    }

    return { synced, conflicts };
}

/**
 * Installs online event listener to trigger queue flush when browser comes online.
 */
export function installOnlineListener(
    uploadFn: (entry: QueueEntry) => Promise<"ok" | "conflict">,
    onConflict: (entry: QueueEntry) => void
): () => void {
    if (typeof window === "undefined") {
        return () => {};
    }
    const handler = (): void => {
        void flush(uploadFn, onConflict);
    };
    window.addEventListener("online", handler);
    return () => {
        window.removeEventListener("online", handler);
    };
}
