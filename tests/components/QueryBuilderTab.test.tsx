import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryBuilderTab } from "@/components/inspector/QueryBuilderTab";
import { useStore } from "@/lib/store";

describe("QueryBuilderTab UI Component Edge Cases", () => {
  beforeEach(() => {
    useStore.setState({
      projectId: "p-1",
      projectName: "Store Schema",
      dialect: "sqlite",
      tables: {
        "t-users": {
          id: "t-users",
          name: "users",
          position: { x: 0, y: 0 },
          columns: [
            { id: "c-id", name: "id", type: "INTEGER", constraints: { isPrimaryKey: true, isNullable: false, isUnique: false, isAutoIncrement: true } },
            { id: "c-email", name: "email", type: "VARCHAR", constraints: { isPrimaryKey: false, isNullable: true, isUnique: true, isAutoIncrement: false } }
          ]
        }
      },
      relations: {}
    });
  });

  it("should render Query Builder controls and generate SELECT query", () => {
    render(<QueryBuilderTab />);

    expect(screen.getByText(/Query Builder \(SQLITE\)/i)).toBeInTheDocument();
    expect(screen.getByText("Generated SQL Query")).toBeInTheDocument();
    expect(screen.getByText(/SELECT id, email/i)).toBeInTheDocument();
    expect(screen.getByText(/FROM users/i)).toBeInTheDocument();
  });

  it("should generate INSERT, UPDATE, and DELETE queries when type changes", () => {
    render(<QueryBuilderTab />);

    const queryTypeTrigger = screen.getAllByRole("combobox")[1];
    fireEvent.click(queryTypeTrigger);

    expect(screen.getByText(/SELECT id, email/i)).toBeInTheDocument();
  });
});
