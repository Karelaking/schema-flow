"use client";

import React from "react";
import { useStore } from "@/lib/store";
import { CreateTableDialog } from "@/components/modals/CreateTableDialog";

/**
 * Global wrapper connecting CreateTableDialog to Zustand store state.
 */
export function GlobalCreateTableDialog(): React.ReactElement {
    const isCreateTableOpen = useStore(state => state.isCreateTableOpen);
    const setCreateTableOpen = useStore(state => state.setCreateTableOpen);
    const selectTable = useStore(state => state.selectTable);

    return (
        <CreateTableDialog
            open={isCreateTableOpen}
            onOpenChange={setCreateTableOpen}
            onSuccess={tableId => {
                selectTable(tableId);
            }}
        />
    );
}
