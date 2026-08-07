import { create } from "zustand";
import { Table, Relation, Column, Index, IndexColumn, DatabaseDialect, SchemaAST, EnumDefinition, ProjectMetadata } from "@/packages/schema-core";
import { CanvasHistoryState, ProjectStore } from "@/types/store.type";
import { getLayoutedElements, LayoutDirection } from "@/lib/auto-layout";
import { encrypt, decrypt, encryptPortable } from "@/packages/lotus-crypto";
import { getMasterKey } from "@/lib/lotus-key-manager.service";
import { saveToDisk, openFromDisk, incrementSaveSequence, downloadFallback } from "@/lib/lotus-file.service";
import { saveProjectAction } from "@/app/actions/projects";

const nextCrudVersion = (v: number): number => (v % 1_000_000) + 1;

const getDeviceId = (): string => {
    if (typeof window === "undefined") {
        return "server-device";
    }
    let devId = localStorage.getItem("schema-flow:device-id");
    if (!devId) {
        devId = `dev_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        localStorage.setItem("schema-flow:device-id", devId);
    }
    return devId;
};

/**
 * Zustand hook for global project state management.
 */
export const useStore = create<ProjectStore>((set, get) => ({
    // Initial state
    projectId: undefined,
    projectName: "",
    projectDescription: "",
    dialect: "sqlite",

    theme: "dark",
    autoAddId: true,
    autoAddTimestamps: true,

    // Lotus storage state initial values
    storageMode: "database",
    lotusFileHandle: undefined,
    isProSubscribed: false,
    lotusUnsavedChanges: false,
    lotusFileVersion: 1,
    lotusDeviceId: typeof window !== "undefined" ? getDeviceId() : "server-device",
    cloudStorageUsedBytes: 0,
    byokApiKey: typeof window !== "undefined" ? (localStorage.getItem("schema-flow:byok-api-key") || "") : "",
    byokEndpoint: typeof window !== "undefined" ? (localStorage.getItem("schema-flow:byok-endpoint") || "") : "",

    setStorageMode: (storageMode: "database" | "lotus-local" | "lotus-cloud" | "byok-cloud"): void => set({ storageMode }),
    setLotusFileHandle: (lotusFileHandle?: FileSystemFileHandle): void => set({ lotusFileHandle }),
    setProSubscribed: (isProSubscribed: boolean): void => set({ isProSubscribed }),
    setLotusUnsavedChanges: (lotusUnsavedChanges: boolean): void => set({ lotusUnsavedChanges }),
    incrementLotusFileVersion: (): number => {
        const nextVersion = get().lotusFileVersion + 1;
        set({ lotusFileVersion: nextVersion, lotusUnsavedChanges: true });
        return nextVersion;
    },

    saveLotusFile: async (): Promise<void> => {
        const {
            projectId,
            projectName,
            projectDescription,
            dialect,
            theme,
            autoAddId,
            autoAddTimestamps,
            tables,
            relations,
            enums,
            lotusFileVersion,
            lotusDeviceId,
            lotusFileHandle,
            storageMode,
        } = get();
        if (!projectId) {
            return;
        }

        const seq = incrementSaveSequence();
        const masterKey = await getMasterKey();
        const nextVersion = lotusFileVersion + 1;

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
                storageMode,
                lotusFileVersion: nextVersion,
            },
            tables,
            relations,
            enums,
        };

        const payload = await encrypt(ast, masterKey, {
            fileVersion: nextVersion,
            lastModifiedBy: lotusDeviceId,
        });

        const jsonString = JSON.stringify(payload, undefined, 2);
        const blob = new Blob([jsonString], { type: "application/x-lotus" });

        const handle = await saveToDisk(blob, projectName, projectId, seq, lotusFileHandle);
        if (handle || lotusFileHandle) {
            set({ lotusFileHandle: handle || lotusFileHandle, lotusUnsavedChanges: false, lotusFileVersion: nextVersion });
        }
    },

    openLotusFile: async (): Promise<void> => {
        const result = await openFromDisk();
        if (!result) {
            return;
        }

        const decoder = new TextDecoder();
        const text = decoder.decode(result.buffer);
        const parsed = JSON.parse(text);

        const masterKey = await getMasterKey();
        const decrypted = await decrypt(parsed, masterKey);

        set({
            storageMode: "lotus-local",
            lotusFileHandle: result.handle,
            lotusFileVersion: decrypted.fileVersion,
            lotusUnsavedChanges: false,
        });

        get().loadProject(decrypted.ast);
    },

    saveLotusPortable: async (): Promise<void> => {
        const {
            projectId,
            projectName,
            projectDescription,
            dialect,
            theme,
            autoAddId,
            autoAddTimestamps,
            tables,
            relations,
            enums,
            lotusFileVersion,
            lotusDeviceId,
            storageMode,
        } = get();
        if (!projectId) {
            return;
        }

        const nextVersion = lotusFileVersion + 1;

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
                storageMode,
                lotusFileVersion: nextVersion,
            },
            tables,
            relations,
            enums,
        };

        const payload = await encryptPortable(ast, {
            fileVersion: nextVersion,
            lastModifiedBy: lotusDeviceId,
        });

        const jsonString = JSON.stringify(payload, undefined, 2);
        const blob = new Blob([jsonString], { type: "application/x-lotus" });
        const safeName = `${projectName.toLowerCase().replace(/\s+/g, "_")}_portable.lotus`;
        downloadFallback(blob, safeName);
    },

    convertToLotus: async (): Promise<void> => {
        set({ storageMode: "lotus-local", lotusFileHandle: undefined });
        await get().saveLotusFile();
    },

    importLotusToDatabase: async (): Promise<void> => {
        const {
            projectId,
            projectName,
            projectDescription,
            dialect,
            theme,
            autoAddId,
            autoAddTimestamps,
            tables,
            relations,
            enums,
        } = get();
        if (!projectId) {
            return;
        }

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
                storageMode: "database",
            },
            tables,
            relations,
            enums,
        };

        await saveProjectAction(projectId, ast);
        set({ storageMode: "database", lotusFileHandle: undefined });
    },

    setByokCredentials: (apiKey: string, endpoint: string): void => {
        if (typeof window !== "undefined") {
            localStorage.setItem("schema-flow:byok-api-key", apiKey);
            localStorage.setItem("schema-flow:byok-endpoint", endpoint);
        }
        set({ byokApiKey: apiKey, byokEndpoint: endpoint });
    },

    clearByokCredentials: (): void => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("schema-flow:byok-api-key");
            localStorage.removeItem("schema-flow:byok-endpoint");
        }
        set({ byokApiKey: "", byokEndpoint: "" });
    },

    projectsList: [],
    tables: {},
    relations: {},
    enums: {},
    crudVersion: 0,
    setProjectsList: (projectsList: ProjectMetadata[]): void => set({ projectsList }),
    showLeftSidebar: false,
    showRightSidebar: false,
    isCreateTableOpen: false,
    isEditTableInfoOpen: false,
    editTableInfoTargetId: undefined,
    isCommentDialogOpen: false,
    commentDialogTargetId: undefined,
    commentDialogTargetType: "node",
    commentDialogMode: "description",
    selectedTableId: undefined,
    selectedRelationId: undefined,
    past: [],
    future: [],

    toggleLeftSidebar: (): void => set(state => ({ showLeftSidebar: !state.showLeftSidebar })),
    toggleRightSidebar: (): void => set(state => ({ showRightSidebar: !state.showRightSidebar })),
    setLeftSidebar: (showLeftSidebar: boolean): void => set({ showLeftSidebar }),
    setRightSidebar: (showRightSidebar: boolean): void => set({ showRightSidebar }),
    setCreateTableOpen: (isCreateTableOpen: boolean): void => set({ isCreateTableOpen }),
    setEditTableInfoOpen: (isEditTableInfoOpen: boolean, editTableInfoTargetId?: string): void =>
        set({ isEditTableInfoOpen, editTableInfoTargetId }),
    setCommentDialogOpen: (
        isCommentDialogOpen: boolean,
        commentDialogTargetId?: string,
        commentDialogTargetType: "node" | "edge" = "node",
        commentDialogMode: "description" | "comment" = "description"
    ): void => set({
        isCommentDialogOpen,
        commentDialogTargetId,
        commentDialogTargetType,
        commentDialogMode
    }),

    loadProject: (ast: SchemaAST): void => {
        set({
            projectId: ast.project.id,
            projectName: ast.project.name,
            projectDescription: ast.project.description || "",
            dialect: ast.settings.dialect,
            theme: ast.settings.theme,
            autoAddId: ast.settings.autoAddId ?? true,
            autoAddTimestamps: ast.settings.autoAddTimestamps ?? true,
            storageMode: ast.settings.storageMode || "database",
            lotusFileVersion: ast.settings.lotusFileVersion || 1,
            lotusUnsavedChanges: false,
            byokApiKey: typeof window !== "undefined" ? (localStorage.getItem("schema-flow:byok-api-key") || "") : "",
            byokEndpoint: typeof window !== "undefined" ? (localStorage.getItem("schema-flow:byok-endpoint") || "") : "",
            tables: ast.tables || {},
            relations: ast.relations || {},
            enums: ast.enums || {},
            crudVersion: 0,
            selectedTableId: undefined,
            selectedRelationId: undefined,
            past: [],
            future: []
        });
    },

    setProjectDetails: (name: string, description: string, dialect: DatabaseDialect): void => {
        get().pushHistory();
        set(state => ({
            projectName: name,
            projectDescription: description,
            dialect,
            crudVersion: nextCrudVersion(state.crudVersion),
        }));
    },

    setTheme: (theme: "dark" | "light"): void => {
        set({ theme });
    },

    setAutoAddId: (autoAddId: boolean): void => set({ autoAddId }),
    setAutoAddTimestamps: (autoAddTimestamps: boolean): void => set({ autoAddTimestamps }),

    pushHistory: (): void => {
        const { tables, relations, enums, past } = get();
        const snap: CanvasHistoryState = typeof structuredClone === "function" 
            ? structuredClone({ tables, relations, enums })
            : JSON.parse(JSON.stringify({ tables, relations, enums }));

        const newPast = past.length >= 50 ? past.slice(1) : past;

        set({
            past: [...newPast, snap],
            future: []
        });
    },

    undo: (): void => {
        const { past, future, tables, relations, enums } = get();
        if (past.length === 0) {
            return;
        }

        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);
        const currentSnap: CanvasHistoryState = typeof structuredClone === "function"
            ? structuredClone({ tables, relations, enums })
            : JSON.parse(JSON.stringify({ tables, relations, enums }));

        set(state => ({
            tables: previous.tables,
            relations: previous.relations,
            enums: previous.enums,
            past: newPast,
            future: [currentSnap, ...future],
            selectedTableId: undefined,
            selectedRelationId: undefined,
            crudVersion: nextCrudVersion(state.crudVersion),
        }));
    },

    redo: (): void => {
        const { past, future, tables, relations, enums } = get();
        if (future.length === 0) {
            return;
        }

        const next = future[0];
        const newFuture = future.slice(1);
        const currentSnap: CanvasHistoryState = typeof structuredClone === "function"
            ? structuredClone({ tables, relations, enums })
            : JSON.parse(JSON.stringify({ tables, relations, enums }));

        set(state => ({
            tables: next.tables,
            relations: next.relations,
            enums: next.enums,
            past: [...past, currentSnap],
            future: newFuture,
            selectedTableId: undefined,
            selectedRelationId: undefined,
            crudVersion: nextCrudVersion(state.crudVersion),
        }));
    },

    clearHistory: (): void => set({ past: [], future: [] }),

    selectTable: (selectedTableId?: string): void => set({ selectedTableId, selectedRelationId: undefined }),
    selectRelation: (selectedRelationId?: string): void => set({ selectedRelationId, selectedTableId: undefined }),

    addTable: (name: string, x: number, y: number): string => {
        get().pushHistory();
        const id = `table_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
        const { autoAddId, autoAddTimestamps } = get();

        const columns: Column[] = [];

        if (autoAddId) {
            columns.push({
                id: `col_${Date.now()}_id`,
                name: "id",
                type: "INTEGER",
                constraints: {
                    isPrimaryKey: true,
                    isNullable: false,
                    isUnique: true,
                    isAutoIncrement: true,
                },
            });
        }

        if (autoAddTimestamps) {
            columns.push({
                id: `col_${Date.now()}_created`,
                name: "created_at",
                type: "TIMESTAMP",
                constraints: {
                    isPrimaryKey: false,
                    isNullable: false,
                    isUnique: false,
                    isAutoIncrement: false,
                    defaultValue: "CURRENT_TIMESTAMP",
                },
            });
            columns.push({
                id: `col_${Date.now()}_updated`,
                name: "updated_at",
                type: "TIMESTAMP",
                constraints: {
                    isPrimaryKey: false,
                    isNullable: false,
                    isUnique: false,
                    isAutoIncrement: false,
                    defaultValue: "CURRENT_TIMESTAMP",
                },
            });
        }

        const newTable: Table = {
            id,
            name,
            position: { x, y },
            columns,
            indexes: [],
        };

        set(state => ({
            tables: { ...state.tables, [id]: newTable },
            selectedTableId: id,
            crudVersion: nextCrudVersion(state.crudVersion),
        }));

        return id;
    },

    updateTable: (id: string, updates: Partial<Omit<Table, "id" | "columns">>): void => {
        get().pushHistory();
        set(state => {
            const table = state.tables[id];
            if (!table) {
                return state;
            }
            return {
                tables: {
                    ...state.tables,
                    [id]: { ...table, ...updates },
                },
                crudVersion: nextCrudVersion(state.crudVersion),
            };
        });
    },

    updateTablePosition: (id: string, x: number, y: number): void => {
        set(state => {
            const table = state.tables[id];
            if (!table) {
                return state;
            }
            return {
                tables: {
                    ...state.tables,
                    [id]: { ...table, position: { x, y } },
                },
            };
        });
    },

    deleteTable: (id: string): void => {
        get().pushHistory();
        set(state => {
            const newTables = { ...state.tables };
            delete newTables[id];

            const newRelations = { ...state.relations };
            Object.keys(newRelations).forEach(relId => {
                const rel = newRelations[relId];
                if (rel.sourceTableId === id || rel.targetTableId === id) {
                    delete newRelations[relId];
                }
            });

            return {
                tables: newTables,
                relations: newRelations,
                selectedTableId: state.selectedTableId === id ? undefined : state.selectedTableId,
                crudVersion: nextCrudVersion(state.crudVersion),
            };
        });
    },

    duplicateTable: (id: string): void => {
        const { tables } = get();
        const sourceTable = tables[id];
        if (!sourceTable) {
            return;
        }

        get().pushHistory();
        const newTableId = `table_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

        const duplicatedColumns: Column[] = sourceTable.columns.map(col => ({
            ...col,
            id: `col_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            constraints: { ...col.constraints },
        }));

        const duplicatedIndexes: Index[] = (sourceTable.indexes || []).map(idx => ({
            ...idx,
            id: `idx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            columns: idx.columns.map(col => ({ ...col })),
        }));

        const duplicatedTable: Table = {
            ...sourceTable,
            id: newTableId,
            name: `${sourceTable.name}_copy`,
            position: {
                x: sourceTable.position.x + 40,
                y: sourceTable.position.y + 40,
            },
            columns: duplicatedColumns,
            indexes: duplicatedIndexes,
        };

        set(state => ({
            tables: { ...state.tables, [newTableId]: duplicatedTable },
            selectedTableId: newTableId,
            crudVersion: nextCrudVersion(state.crudVersion),
        }));
    },

    autoLayoutTables: (direction: LayoutDirection = "LR"): void => {
        get().pushHistory();
        const { tables, relations } = get();
        if (Object.keys(tables).length === 0) {
            return;
        }

        const updatedTables = getLayoutedElements(tables, relations, direction);
        set({ tables: updatedTables });
    },

    addColumn: (tableId: string, col: Omit<Column, "id">): string => {
        get().pushHistory();
        const colId = `col_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
        const newColumn: Column = { ...col, id: colId };

        set(state => {
            const table = state.tables[tableId];
            if (!table) {
                return state;
            }

            const newColumns = [...table.columns];
            // Find index of first timestamp column (created_at, updated_at, or TIMESTAMP default)
            const firstTimestampIndex = newColumns.findIndex(c =>
                c.name === "created_at" ||
                c.name === "updated_at" ||
                (c.constraints?.defaultValue && String(c.constraints.defaultValue).toUpperCase().includes("CURRENT_TIMESTAMP"))
            );

            if (firstTimestampIndex !== -1) {
                newColumns.splice(firstTimestampIndex, 0, newColumn);
            } else {
                newColumns.push(newColumn);
            }

            return {
                tables: {
                    ...state.tables,
                    [tableId]: {
                        ...table,
                        columns: newColumns,
                    },
                },
                crudVersion: nextCrudVersion(state.crudVersion),
            };
        });

        return colId;
    },

    updateColumn: (tableId: string, colId: string, updates: Partial<Omit<Column, "id">>): void => {
        get().pushHistory();
        set(state => {
            const table = state.tables[tableId];
            if (!table) {
                return state;
            }
            const updatedColumns = table.columns.map(col => {
                if (col.id === colId) {
                    return {
                        ...col,
                        ...updates,
                        constraints: updates.constraints ? { ...col.constraints, ...updates.constraints } : col.constraints,
                    };
                }
                return col;
            });
            return {
                tables: {
                    ...state.tables,
                    [tableId]: { ...table, columns: updatedColumns },
                },
                crudVersion: nextCrudVersion(state.crudVersion),
            };
        });
    },

    deleteColumn: (tableId: string, colId: string): void => {
        get().pushHistory();
        set(state => {
            const table = state.tables[tableId];
            if (!table) {
                return state;
            }
            const filteredColumns = table.columns.filter(col => col.id !== colId);

            const newRelations = { ...state.relations };
            Object.keys(newRelations).forEach(relId => {
                const rel = newRelations[relId];
                if ((rel.sourceTableId === tableId && rel.sourceColumnId === colId) || (rel.targetTableId === tableId && rel.targetColumnId === colId)) {
                    delete newRelations[relId];
                }
            });

            return {
                tables: {
                    ...state.tables,
                    [tableId]: { ...table, columns: filteredColumns },
                },
                relations: newRelations,
                crudVersion: nextCrudVersion(state.crudVersion),
            };
        });
    },

    reorderColumns: (tableId: string, columns: Column[]): void => {
        get().pushHistory();
        set(state => {
            const table = state.tables[tableId];
            if (!table) {
                return state;
            }
            return {
                tables: {
                    ...state.tables,
                    [tableId]: { ...table, columns },
                },
                crudVersion: nextCrudVersion(state.crudVersion),
            };
        });
    },

    addIndex: (tableId: string, name: string, columns: IndexColumn[], isUnique: boolean): string => {
        get().pushHistory();
        const indexId = `idx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
        const newIndex: Index = { id: indexId, name, columns, isUnique };

        set(state => {
            const table = state.tables[tableId];
            if (!table) {
                return state;
            }
            return {
                tables: {
                    ...state.tables,
                    [tableId]: {
                        ...table,
                        indexes: [...(table.indexes || []), newIndex],
                    },
                },
                crudVersion: nextCrudVersion(state.crudVersion),
            };
        });

        return indexId;
    },

    updateIndex: (tableId: string, indexId: string, updates: Partial<Omit<Index, "id">>): void => {
        get().pushHistory();
        set(state => {
            const table = state.tables[tableId];
            if (!table) {
                return state;
            }
            const updatedIndexes = (table.indexes || []).map(idx => {
                if (idx.id === indexId) {
                    return { ...idx, ...updates };
                }
                return idx;
            });
            return {
                tables: {
                    ...state.tables,
                    [tableId]: { ...table, indexes: updatedIndexes },
                },
                crudVersion: nextCrudVersion(state.crudVersion),
            };
        });
    },

    deleteIndex: (tableId: string, indexId: string): void => {
        get().pushHistory();
        set(state => {
            const table = state.tables[tableId];
            if (!table) {
                return state;
            }
            const filteredIndexes = (table.indexes || []).filter(idx => idx.id !== indexId);
            return {
                tables: {
                    ...state.tables,
                    [tableId]: { ...table, indexes: filteredIndexes },
                },
                crudVersion: nextCrudVersion(state.crudVersion),
            };
        });
    },

    addRelation: (rel: Omit<Relation, "id">): string => {
        get().pushHistory();
        const relId = `rel_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
        const newRelation: Relation = { ...rel, id: relId };

        set(state => ({
            relations: { ...state.relations, [relId]: newRelation },
            selectedRelationId: relId,
            crudVersion: nextCrudVersion(state.crudVersion),
        }));

        return relId;
    },

    updateRelation: (id: string, updates: Partial<Omit<Relation, "id">>): void => {
        get().pushHistory();
        set(state => {
            const rel = state.relations[id];
            if (!rel) {
                return state;
            }
            return {
                relations: {
                    ...state.relations,
                    [id]: { ...rel, ...updates },
                },
                crudVersion: nextCrudVersion(state.crudVersion),
            };
        });
    },

    deleteRelation: (id: string): void => {
        get().pushHistory();
        set(state => {
            const newRelations = { ...state.relations };
            delete newRelations[id];
            return {
                relations: newRelations,
                selectedRelationId: state.selectedRelationId === id ? undefined : state.selectedRelationId,
                crudVersion: nextCrudVersion(state.crudVersion),
            };
        });
    },

    addEnum: (name: string, values: string[]): string => {
        get().pushHistory();
        const enumId = `enum_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
        const newEnum: EnumDefinition = { id: enumId, name, values };

        set(state => ({
            enums: { ...state.enums, [enumId]: newEnum },
            crudVersion: nextCrudVersion(state.crudVersion),
        }));

        return enumId;
    },

    updateEnum: (id: string, updates: Partial<Omit<EnumDefinition, "id">>): void => {
        get().pushHistory();
        set(state => {
            const enumDef = state.enums[id];
            if (!enumDef) {
                return state;
            }
            return {
                enums: {
                    ...state.enums,
                    [id]: { ...enumDef, ...updates },
                },
                crudVersion: nextCrudVersion(state.crudVersion),
            };
        });
    },

    deleteEnum: (id: string): void => {
        get().pushHistory();
        set(state => {
            const newEnums = { ...state.enums };
            delete newEnums[id];
            return {
                enums: newEnums,
                crudVersion: nextCrudVersion(state.crudVersion),
            };
        });
    },
}));
