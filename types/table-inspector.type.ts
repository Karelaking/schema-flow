import { Table } from "@/packages/schema-core";

/**
 * Props for the Table Inspector panel component.
 */
export interface TableInspectorProps {
    /** Selected table instance */
    selectedTable: Table;
    /** Currently active column ID inside the table form */
    selectedColId?: string;
    /** Callback to set selected column ID */
    setSelectedColId: (id?: string) => void;
}
