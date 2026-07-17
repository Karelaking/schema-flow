import { Table } from "@/packages/schema-core";

export interface TableInspectorProps {
  /** Selected table instance */
  selectedTable: Table;
  /** Currently active column ID inside the table form */
  selectedColId: string | null;
  /** Callback to set selected column ID */
  setSelectedColId: (id: string | null) => void;
}