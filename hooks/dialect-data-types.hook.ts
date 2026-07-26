import { useMemo } from "react";
import { DatabaseDialect } from "@/packages/schema-core";
import { useStore } from "@/lib/store";
import {
    DataTypeRegistry,
    DataTypeDefinition,
    DataTypeCategoryGroup
} from "@/packages/datatypes";

/**
 * Result interface for useDialectDataTypes hook.
 */
export interface UseDialectDataTypesResult {
    dialect: DatabaseDialect;
    dataTypes: DataTypeDefinition[];
    categories: DataTypeCategoryGroup[];
    defaultType: string;
    getTypeDescription: (typeName: string) => string;
}

/**
 * Custom Hook: Resolves dialect-specific data types and categorized groups based on active project settings.
 * @param overrideDialect Optional dialect parameter to override active store dialect.
 * @returns Object with data types, categories, and type description lookup helper.
 */
export function useDialectDataTypes(overrideDialect?: DatabaseDialect): UseDialectDataTypesResult {
    const activeDialect = useStore(state => state.dialect);
    const dialect = overrideDialect ?? activeDialect ?? "sqlite";

    return useMemo(() => {
        const strategy = DataTypeRegistry.getStrategy(dialect);
        const dataTypes = strategy.getDataTypes();

        const getTypeDescription = (typeName: string): string => {
            const found = dataTypes.find(typeDef => typeDef.type.toUpperCase() === typeName.toUpperCase());
            return found?.description || `${typeName} column type (${dialect.toUpperCase()})`;
        };

        return {
            dialect,
            dataTypes,
            categories: strategy.getCategories(),
            defaultType: strategy.defaultType,
            getTypeDescription,
        };
    }, [dialect]);
}
