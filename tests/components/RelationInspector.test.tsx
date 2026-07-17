import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { RelationInspector } from "@/components/inspector/RelationInspector";
import { useStore } from "@/lib/store";

describe("RelationInspector UI Component Edge Cases", () => {
  beforeEach(() => {
    useStore.setState({
      tables: {
        "t-1": { id: "t-1", name: "users", position: { x: 0, y: 0 }, columns: [] },
        "t-2": { id: "t-2", name: "orders", position: { x: 100, y: 100 }, columns: [] }
      }
    });
  });

  it("should render relationship source, target, and constraints", () => {
    const sampleRelation = {
      id: "rel-1",
      sourceTableId: "t-1",
      sourceColumnId: "c-1",
      targetTableId: "t-2",
      targetColumnId: "c-2",
      type: "one-to-many" as const,
      onDelete: "cascade" as const,
      onUpdate: "restrict" as const,
    };

    render(<RelationInspector selectedRelation={sampleRelation} />);

    expect(screen.getByText("Relationship Details")).toBeInTheDocument();
    expect(screen.getByText("users")).toBeInTheDocument();
    expect(screen.getByText("orders")).toBeInTheDocument();
    expect(screen.getByText("Relationship Type")).toBeInTheDocument();
  });
});
