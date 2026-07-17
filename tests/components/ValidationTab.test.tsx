import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ValidationTab } from "@/components/inspector/ValidationTab";
import { useStore } from "@/lib/store";

describe("ValidationTab UI Component Edge Cases", () => {
  beforeEach(() => {
    useStore.setState({
      tables: {
        "t-1": {
          id: "t-1",
          name: "users",
          position: { x: 0, y: 0 },
          columns: [
            { id: "c-1", name: "id", type: "INTEGER", constraints: { isPrimaryKey: true, isNullable: false, isUnique: false, isAutoIncrement: true } }
          ]
        }
      },
      relations: {}
    });
  });

  it("should render Schema is Valid when no errors exist", () => {
    render(<ValidationTab />);

    expect(screen.getByText("Diagnostic Report")).toBeInTheDocument();
    expect(screen.getByText("Schema is Valid")).toBeInTheDocument();
  });

  it("should render warnings when table is missing a primary key", () => {
    useStore.setState({
      tables: {
        "t-nopk": {
          id: "t-nopk",
          name: "logs",
          position: { x: 0, y: 0 },
          columns: [
            { id: "c-msg", name: "message", type: "TEXT", constraints: { isPrimaryKey: false, isNullable: true, isUnique: false, isAutoIncrement: false } }
          ]
        }
      }
    });

    render(<ValidationTab />);

    expect(screen.getByText("Warning")).toBeInTheDocument();
    expect(screen.getByText(/missing a primary key/i)).toBeInTheDocument();
  });
});
