import { create } from "zustand";
import { Table, Relation, Column, Index, IndexColumn, DatabaseDialect, SchemaAST, EnumDefinition } from "@/packages/schema-core";
import { CanvasHistoryState, ProjectStore } from "@/types/store.type";
import { getLayoutedElements, LayoutDirection } from "@/lib/auto-layout";

const nextCrudVersion = (v: number): number => (v % 1_000_000) + 1;

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
    tables: {},
    relations: {},
    enums: {},
    crudVersion: 0,
    showLeftSidebar: false,
    showRightSidebar: false,
    isCreateTableOpen: false,
    isCommentDialogOpen: false,
    commentDialogTargetId: undefined,
    selectedTableId: undefined,
    selectedRelationId: undefined,
    past: [],
    future: [],

    toggleLeftSidebar: (): void => set(state => ({ showLeftSidebar: !state.showLeftSidebar })),
    toggleRightSidebar: (): void => set(state => ({ showRightSidebar: !state.showRightSidebar })),
    setLeftSidebar: (showLeftSidebar: boolean): void => set({ showLeftSidebar }),
    setRightSidebar: (showRightSidebar: boolean): void => set({ showRightSidebar }),
    setCreateTableOpen: (isCreateTableOpen: boolean): void => set({ isCreateTableOpen }),
    setCommentDialogOpen: (isCommentDialogOpen: boolean, commentDialogTargetId?: string): void => set({ isCommentDialogOpen, commentDialogTargetId }),

    loadProject: (ast: SchemaAST): void => {
        set({
            projectId: ast.project.id,
            projectName: ast.project.name,
            projectDescription: ast.project.description || "",
            dialect: ast.settings.dialect,
            theme: ast.settings.theme,
            autoAddId: ast.settings.autoAddId ?? true,
            autoAddTimestamps: ast.settings.autoAddTimestamps ?? true,
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
