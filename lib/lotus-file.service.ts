import { get, set } from "idb-keyval";

let currentSaveSequence = 0;
const CHANNEL_NAME = "schema-flow-lotus-sync";

/**
 * Checks if browser supports File System Access API.
 */
export function isFileSystemAccessSupported(): boolean {
    return typeof window !== "undefined" && "showSaveFilePicker" in window;
}

/**
 * Increments and returns the current global save sequence counter.
 */
export function incrementSaveSequence(): number {
    currentSaveSequence = (currentSaveSequence % 1_000_000) + 1;
    return currentSaveSequence;
}

/**
 * Gets the current save sequence counter.
 */
export function getCurrentSaveSequence(): number {
    return currentSaveSequence;
}

/**
 * Persists a FileSystemFileHandle to IndexedDB for a given project.
 */
export async function persistHandle(projectId: string, handle: FileSystemFileHandle): Promise<void> {
    try {
        await set(`lotus-handle-${projectId}`, handle);
    }
    catch (err: unknown) {
        console.warn("[LotusFileService] Failed to persist file handle to IndexedDB:", err);
    }
}

/**
 * Retrieves a persisted FileSystemFileHandle from IndexedDB and checks permissions.
 */
export async function getPersistedHandle(projectId: string): Promise<FileSystemFileHandle | undefined> {
    try {
        const handle = await get<FileSystemFileHandle>(`lotus-handle-${projectId}`);
        if (!handle) {
            return undefined;
        }

        const handleWithPerms = handle as FileSystemFileHandle & {
            queryPermission?: (descriptor?: { mode: "read" | "readwrite" }) => Promise<PermissionState>;
            requestPermission?: (descriptor?: { mode: "read" | "readwrite" }) => Promise<PermissionState>;
        };

        if (typeof handleWithPerms.queryPermission === "function") {
            const status = await handleWithPerms.queryPermission({ mode: "readwrite" });
            if (status === "granted") {
                return handle;
            }
            if (typeof handleWithPerms.requestPermission === "function") {
                const requested = await handleWithPerms.requestPermission({ mode: "readwrite" });
                if (requested === "granted") {
                    return handle;
                }
            }
        }
        return undefined;
    }
    catch (err: unknown) {
        console.warn("[LotusFileService] Failed to retrieve persisted handle:", err);
        return undefined;
    }
}

/**
 * Broadcasts a save event to other open tabs using BroadcastChannel.
 */
function broadcastSaveEvent(projectId: string): void {
    try {
        if (typeof BroadcastChannel !== "undefined") {
            const channel = new BroadcastChannel(CHANNEL_NAME);
            channel.postMessage({ type: "lotus-saved", projectId, timestamp: Date.now() });
            channel.close();
        }
    }
    catch (err: unknown) {
        console.warn("[LotusFileService] Failed to broadcast save event:", err);
    }
}

/**
 * Subscribes to lotus file save events from other browser tabs.
 */
export function onOtherTabSaved(callback: (projectId: string) => void): () => void {
    if (typeof BroadcastChannel === "undefined") {
        return () => {};
    }
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event: MessageEvent) => {
        if (event.data && event.data.type === "lotus-saved" && typeof event.data.projectId === "string") {
            callback(event.data.projectId);
        }
    };
    return () => {
        channel.close();
    };
}

/**
 * Triggers browser fallback file download for unsupported browsers (Firefox/Safari).
 */
export function downloadFallback(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
}

/**
 * Saves encrypted Blob to local disk using File System Access API with lock & sequence checks.
 */
export async function saveToDisk(
    blob: Blob,
    projectName: string,
    projectId: string,
    saveSequence: number,
    existingHandle?: FileSystemFileHandle
): Promise<FileSystemFileHandle | undefined> {
    if (saveSequence !== currentSaveSequence) {
        return undefined;
    }

    const lockName = `lotus-save-lock-${projectId}`;

    const performWrite = async (): Promise<FileSystemFileHandle | undefined> => {
        if (saveSequence !== currentSaveSequence) {
            return undefined;
        }

        let handle = existingHandle || (await getPersistedHandle(projectId));

        if (!handle) {
            if (!isFileSystemAccessSupported() || !window.showSaveFilePicker) {
                const safeName = `${projectName.toLowerCase().replace(/\s+/g, "_")}.lotus`;
                downloadFallback(blob, safeName);
                return undefined;
            }

            const safeName = `${projectName.toLowerCase().replace(/\s+/g, "_")}.lotus`;
            handle = await window.showSaveFilePicker({
                suggestedName: safeName,
                types: [
                    {
                        description: "Schema Flow Encrypted Project",
                        accept: {
                            "application/x-lotus": [".lotus"],
                        },
                    },
                ],
            });
            if (handle) {
                await persistHandle(projectId, handle);
            }
        }

        if (!handle) {
            return undefined;
        }

        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();

        broadcastSaveEvent(projectId);
        return handle;
    };

    if (typeof navigator !== "undefined" && "locks" in navigator && navigator.locks?.request) {
        return await navigator.locks.request(lockName, async () => {
            return await performWrite();
        });
    }

    return await performWrite();
}

/**
 * Opens a .lotus file from disk using File System Access API or file input fallback.
 */
export async function openFromDisk(): Promise<{
    buffer: ArrayBuffer;
    handle?: FileSystemFileHandle;
    filename: string;
} | undefined> {
    if (isFileSystemAccessSupported() && window.showOpenFilePicker) {
        try {
            const [handle] = await window.showOpenFilePicker({
                types: [
                    {
                        description: "Schema Flow Encrypted Project",
                        accept: {
                            "application/x-lotus": [".lotus"],
                        },
                    },
                ],
                multiple: false,
            });
            const file = await handle.getFile();
            const buffer = await file.arrayBuffer();
            return { buffer, handle, filename: file.name };
        }
        catch (err: unknown) {
            if (err instanceof Error && err.name === "AbortError") {
                return undefined;
            }
            throw err;
        }
    }

    return new Promise(resolve => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".lotus";
        input.onchange = async () => {
            if (input.files && input.files[0]) {
                const file = input.files[0];
                const buffer = await file.arrayBuffer();
                resolve({ buffer, handle: undefined, filename: file.name });
            }
            else {
                resolve(undefined);
            }
        };
        input.click();
    });
}
