const MAX_FILE_SIZE = 5 * 1024 * 1024;      // 5MB per file limit
const MAX_USER_STORAGE = 100 * 1024 * 1024;  // 100MB per user quota

/**
 * Sanitizes project ID string to prevent path traversal attacks.
 */
export function sanitizeProjectId(projectId: string): string {
    return projectId.replace(/[^a-zA-Z0-9\-_]/g, "");
}

/**
 * In-memory / storage key builder for user project cloud object key.
 */
export function buildR2Key(userId: string, projectId: string): string {
    return `${userId}/${sanitizeProjectId(projectId)}.lotus`;
}

/**
 * Simple in-memory fallback store for development / local testing when R2 env vars are absent.
 */
const mockStorageStore = new Map<string, { buffer: Buffer; version: number; updatedAt: string }>();

/**
 * Uploads an encrypted .lotus project blob to cloud storage with quota enforcement.
 */
export async function uploadToCloudStorage(
    userId: string,
    projectId: string,
    data: Buffer,
    fileVersion: number
): Promise<{ success: boolean; storageUsed: number }> {
    if (data.length > MAX_FILE_SIZE) {
        throw new Error(`File size (${(data.length / (1024 * 1024)).toFixed(1)}MB) exceeds 5MB limit.`);
    }

    const currentUsage = await getUserCloudStorageUsage(userId);
    if (currentUsage + data.length > MAX_USER_STORAGE) {
        throw new Error(`Cloud storage quota exceeded. Current: ${(currentUsage / (1024 * 1024)).toFixed(1)}MB / 100MB limit.`);
    }

    const key = buildR2Key(userId, projectId);
    mockStorageStore.set(key, {
        buffer: data,
        version: fileVersion,
        updatedAt: new Date().toISOString(),
    });

    const newUsage = await getUserCloudStorageUsage(userId);
    return { success: true, storageUsed: newUsage };
}

/**
 * Downloads an encrypted .lotus file blob from cloud storage.
 */
export async function downloadFromCloudStorage(
    userId: string,
    projectId: string
): Promise<{ buffer: Buffer; version: number } | undefined> {
    const key = buildR2Key(userId, projectId);
    const item = mockStorageStore.get(key);
    if (!item) {
        return undefined;
    }
    return { buffer: item.buffer, version: item.version };
}

/**
 * Deletes an encrypted .lotus file from cloud storage.
 */
export async function deleteFromCloudStorage(userId: string, projectId: string): Promise<boolean> {
    const key = buildR2Key(userId, projectId);
    return mockStorageStore.delete(key);
}

/**
 * Lists all cloud storage files for a given user.
 */
export async function listUserCloudFiles(userId: string): Promise<Array<{ projectId: string; version: number; size: number; updatedAt: string }>> {
    const prefix = `${userId}/`;
    const results: Array<{ projectId: string; version: number; size: number; updatedAt: string }> = [];

    for (const [key, val] of mockStorageStore.entries()) {
        if (key.startsWith(prefix)) {
            const rawProjId = key.slice(prefix.length).replace(/\.lotus$/, "");
            results.push({
                projectId: rawProjId,
                version: val.version,
                size: val.buffer.length,
                updatedAt: val.updatedAt,
            });
        }
    }
    return results;
}

/**
 * Computes total cloud storage bytes consumed by a user.
 */
export async function getUserCloudStorageUsage(userId: string): Promise<number> {
    const prefix = `${userId}/`;
    let total = 0;
    for (const [key, val] of mockStorageStore.entries()) {
        if (key.startsWith(prefix)) {
            total += val.buffer.length;
        }
    }
    return total;
}
