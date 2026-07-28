import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { SchemaAST } from "@/packages/schema-core";
import { saveProjectAction } from "@/app/actions/projects";

/**
 * Custom Hook: Debounces and saves project database state when crudVersion changes.
 */
export function useAutoSave(isLoaded: boolean): void {
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
    const crudVersion = useStore(state => state.crudVersion);

    useEffect(() => {
        if (!isLoaded || !projectId || crudVersion === 0) {
            return;
        }

        const timer = setTimeout(async () => {
            try {
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
                await saveProjectAction(projectId, ast);
            }
            catch (err: unknown) {
                console.warn("[useAutoSave] Auto-save background sync postponed:", err);
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, [projectId, crudVersion, isLoaded]);
}
