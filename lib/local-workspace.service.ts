export interface WorkspaceYamlConfig {
  name: string;
  version: string;
  created_at: string;
  updated_at: string;
  user?: {
    name?: string;
    email?: string;
  };
  active_file?: string;
  settings?: {
    dialect?: string;
    auto_save?: boolean;
  };
  files?: string[];
}

let activeDirectoryHandle: FileSystemDirectoryHandle | null = null;

export function setActiveWorkspaceDirectoryHandle(handle: FileSystemDirectoryHandle | null): void {
  activeDirectoryHandle = handle;
}

export function getActiveWorkspaceDirectoryHandle(): FileSystemDirectoryHandle | null {
  return activeDirectoryHandle;
}

/**
 * Open local folder picker via File System Access API.
 */
export async function openWorkspaceDirectoryPicker(): Promise<FileSystemDirectoryHandle | null> {
  if (typeof window === "undefined" || !("showDirectoryPicker" in window)) {
    throw new Error("File System Access API is not supported in this browser. Please use Chrome, Edge, or Opera.");
  }

  try {
    const dirHandle = await (window as unknown as { showDirectoryPicker: () => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker();
    setActiveWorkspaceDirectoryHandle(dirHandle);
    await ensureWorkspaceYaml(dirHandle);
    return dirHandle;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      return null;
    }
    throw err;
  }
}

/**
 * Ensures workspace.yaml exists in the selected folder.
 */
export async function ensureWorkspaceYaml(dirHandle: FileSystemDirectoryHandle): Promise<WorkspaceYamlConfig> {
  try {
    const YAML = (await import("yaml")).default;
    const fileHandle = await dirHandle.getFileHandle("workspace.yaml", { create: false });
    const file = await fileHandle.getFile();
    const text = await file.text();
    const parsed = YAML.parse(text) as WorkspaceYamlConfig;
    return parsed;
  } catch {
    // Default initial config if workspace.yaml missing
    const defaultConfig: WorkspaceYamlConfig = {
      name: dirHandle.name || "Schema Flow Workspace",
      version: "1.0.0",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: {
        name: "Local Developer",
        email: "dev@local",
      },
      active_file: "schema.lotus",
      settings: {
        dialect: "sqlite",
        auto_save: true,
      },
      files: ["schema.lotus"],
    };

    await writeWorkspaceYaml(dirHandle, defaultConfig);
    return defaultConfig;
  }
}

/**
 * Write updated workspace.yaml configuration.
 */
export async function writeWorkspaceYaml(dirHandle: FileSystemDirectoryHandle, config: WorkspaceYamlConfig): Promise<void> {
  const YAML = (await import("yaml")).default;
  config.updated_at = new Date().toISOString();
  const yamlContent = YAML.stringify(config);
  const fileHandle = await dirHandle.getFileHandle("workspace.yaml", { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(yamlContent);
  await writable.close();
}

/**
 * List files inside the workspace directory.
 */
export async function listWorkspaceDirectoryFiles(dirHandle: FileSystemDirectoryHandle): Promise<{ name: string; isDirectory: boolean }[]> {
  const result: { name: string; isDirectory: boolean }[] = [];
  for await (const entry of (dirHandle as unknown as AsyncIterable<FileSystemHandle>)) {
    result.push({
      name: entry.name,
      isDirectory: entry.kind === "directory",
    });
  }
  return result;
}

/**
 * Read file content from workspace directory.
 */
export async function readWorkspaceFileContent(dirHandle: FileSystemDirectoryHandle, filename: string): Promise<string> {
  const fileHandle = await dirHandle.getFileHandle(filename, { create: false });
  const file = await fileHandle.getFile();
  return await file.text();
}

/**
 * Write file content to workspace directory.
 */
export async function writeWorkspaceFileContent(dirHandle: FileSystemDirectoryHandle, filename: string, content: string): Promise<void> {
  const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}
