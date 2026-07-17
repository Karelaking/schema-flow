import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { CodePreviewTab } from "@/components/inspector/CodePreviewTab";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { useStore } from "@/lib/store";

vi.mock("@monaco-editor/react", () => ({
  default: ({ value }: { value: string }) => <div data-testid="monaco-editor">{value}</div>,
}));

describe("CodePreviewTab UI Component Edge Cases", () => {
  beforeEach(() => {
    useStore.setState({
      projectId: "p-1",
      projectName: "Store Schema",
      projectDescription: "Desc",
      dialect: "sqlite",
      autoAddId: true,
      autoAddTimestamps: true,
      tables: {
        "t-users": {
          id: "t-users",
          name: "users",
          position: { x: 0, y: 0 },
          columns: [
            { id: "c-id", name: "id", type: "INTEGER", constraints: { isPrimaryKey: true, isNullable: false, isUnique: false, isAutoIncrement: true } }
          ]
        }
      },
      relations: {}
    });
  });

  it("should render SQL and TypeScript code preview triggers and Monaco editor", () => {
    render(
      <ThemeProvider>
        <CodePreviewTab />
      </ThemeProvider>
    );

    expect(screen.getByText("SQL (SQLITE)")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByTestId("monaco-editor")).toBeInTheDocument();
    expect(screen.getByText("Copy Code")).toBeInTheDocument();
  });
});
