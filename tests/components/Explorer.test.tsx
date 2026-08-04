import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Explorer } from "@/components/layout/Explorer";
import { useStore } from "@/lib/store";

describe("Explorer UI Component Edge Cases", () => {
  beforeEach(() => {
    useStore.setState({
      tables: {
        "t-users": {
          id: "t-users",
          name: "users",
          position: { x: 0, y: 0 },
          columns: []
        },
        "t-orders": {
          id: "t-orders",
          name: "orders",
          position: { x: 100, y: 100 },
          columns: []
        }
      },
      selectedTableId: undefined
    });
  });

  it("should list all tables and support real-time filtering", () => {
    render(<Explorer />);

    expect(screen.getByText("users")).toBeInTheDocument();
    expect(screen.getByText("orders")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText("Filter...");
    fireEvent.change(searchInput, { target: { value: "order" } });

    expect(screen.queryByText("users")).not.toBeInTheDocument();
    expect(screen.getByText("orders")).toBeInTheDocument();
  });

  it("should display empty state when filter matches no tables", () => {
    render(<Explorer />);

    const searchInput = screen.getByPlaceholderText("Filter...");
    fireEvent.change(searchInput, { target: { value: "nonexistent_table" } });

    expect(screen.getByText("No matches found")).toBeInTheDocument();
  });
});
