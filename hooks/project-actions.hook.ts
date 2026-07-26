import { useState, useCallback, ChangeEvent } from "react";
import { useStore } from "@/lib/store";
import { SchemaAST, ProjectMetadata } from "@/packages/schema-core";
import { saveProjectAction, listProjectsAction, getProjectAction } from "@/app/actions/projects";

/**
 * Return type interface for useProjectActions hook.
 */
export interface UseProjectActionsReturn {
    projectsList: ProjectMetadata[];
    isSaving: boolean;
    saveMessage: string;
    fetchProjects: () => Promise<void>;
    switchProject: (targetId: string) => Promise<void>;
    saveProject: () => Promise<void>;
    exportSchema: () => void;
    importSchema: (event: ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Custom Hook: Provides decoupled business logic and Server Action calls for project operations.
 * @returns State and action handlers for project management.
 */
export function useProjectActions(): UseProjectActionsReturn {
    const projectId = useStore(state => state.projectId);
    const projectName = useStore(state => state.projectName);
    const projectDescription = useStore(state => state.projectDescription);
    const dialect = useStore(state => state.dialect);
    const theme = useStore(state => state.theme);
    const autoAddId = useStore(state => state.autoAddId);
    const autoAddTimestamps = useStore(state => state.autoAddTimestamps);
    const tables = useStore(state => state.tables);
    const relations = useStore(state => state.relations);
    const enums = useStore(state => state.enums);
    const loadProject = useStore(state => state.loadProject);

    const [projectsList, setProjectsList] = useState<ProjectMetadata[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");

    /**
     * Refreshes the list of projects from the backend.
     */
    const fetchProjects = useCallback(async (): Promise<void> => {
        const result = await listProjectsAction();
        if (result.success) {
            setProjectsList(result.projects);
        }
    }, []);

    /**
     * Switches active project by loading its AST.
     */
    const switchProject = useCallback(async (targetId: string): Promise<void> => {
        const result = await getProjectAction(targetId);
        if (result.success && result.project) {
            loadProject(result.project);
        }
    }, [loadProject]);

    /**
     * Saves the current project AST to the SQLite database via Server Action.
     */
    const saveProject = useCallback(async (): Promise<void> => {
        if (!projectId) {
            return;
        }
        setIsSaving(true);
        setSaveMessage("Saving database...");

        const ast: SchemaAST = {
            project: {
                id: projectId,
                name: projectName,
                description: projectDescription,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            settings: {
                dialect,
                theme,
                autoAddId,
                autoAddTimestamps,
            },
            tables,
            relations,
            enums,
        };

        const result = await saveProjectAction(projectId, ast);
        if (result.success) {
            setSaveMessage("Saved successfully!");
            setTimeout(() => setSaveMessage(""), 2000);
            await fetchProjects();
        }
        else {
            setSaveMessage(`Error: ${result.error}`);
        }
        setIsSaving(false);
    }, [projectId, projectName, projectDescription, dialect, theme, autoAddId, autoAddTimestamps, tables, relations, enums, fetchProjects]);

    /**
     * Exports the current schema AST to a downloadable JSON file.
     */
    const exportSchema = useCallback((): void => {
        const ast: SchemaAST = {
            project: {
                id: projectId || `proj-${Date.now()}`,
                name: projectName,
                description: projectDescription,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            settings: {
                dialect,
                theme,
                autoAddId,
                autoAddTimestamps,
            },
            tables,
            relations,
            enums,
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(ast, undefined, 2));
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `${projectName.toLowerCase().replace(/\s+/g, "_")}_schema.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    }, [projectId, projectName, projectDescription, dialect, theme, autoAddId, autoAddTimestamps, tables, relations, enums]);

    /**
     * Imports a JSON schema file and loads it into the workspace.
     */
    const importSchema = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
        const fileReader = new FileReader();
        if (event.target.files && event.target.files[0]) {
            fileReader.readAsText(event.target.files[0], "UTF-8");
            fileReader.onload = eventPayload => {
                try {
                    const content = eventPayload.target?.result as string;
                    const parsed = JSON.parse(content);
                    if (parsed.project && parsed.tables) {
                        loadProject(parsed);
                    }
                    else {
                        alert("Invalid Schema Flow JSON format");
                    }
                }
                catch (error: unknown) {
                    alert("Failed to parse JSON file");
                }
            };
        }
        event.target.value = "";
    }, [loadProject]);

    return {
        projectsList,
        isSaving,
        saveMessage,
        fetchProjects,
        switchProject,
        saveProject,
        exportSchema,
        importSchema,
    };
}
