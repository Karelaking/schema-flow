import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TableInspector } from "@/components/inspector/TableInspector";
import { Table } from "@/packages/schema-core";

describe("TableInspector UI Component Edge Cases", () => {
  const sampleTable: Table = {
    id: "tbl-1",
    name: "users",
    description: "User table",
    position: { x: 0, y: 0 },
    columns: [
      { id: "c-1", name: "id", type: "INTEGER", constraints: { isPrimaryKey: true, isNullable: false, isUnique: false, isAutoIncrement: true } },
      { id: "c-2", name: "email", type: "VARCHAR", constraints: { isPrimaryKey: false, isNullable: true, isUnique: true, isAutoIncrement: false } }
    ]
  };

  it("should render table properties and column details", () => {
    const setSelectedColId = vi.fn();

    render(
      <TableInspector 
        selectedTable={sampleTable} 
        selectedColId="c-1" 
        setSelectedColId={setSelectedColId} 
      />
    );

    expect(screen.getByDisplayValue("users")).toBeInTheDocument();
    expect(screen.getByDisplayValue("User table")).toBeInTheDocument();
    expect(screen.getByText("email")).toBeInTheDocument();
    expect(screen.getByText("Edit Column: id")).toBeInTheDocument();
  });
});
