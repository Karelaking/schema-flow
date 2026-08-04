/**
 * @file WorkspaceClient.test.tsx
 * @description Unit tests for WorkspaceClient layout and state synchronization component.
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { WorkspaceClient } from "@/components/layout/WorkspaceClient";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { SchemaAST } from "@/packages/schema-core";

vi.mock("@/app/actions/projects", () => ({
  saveProjectAction: vi.fn().mockResolvedValue({ success: true }),
  listProjectsAction: vi.fn().mockResolvedValue({ success: true, projects: [] }),
  getProjectAction: vi.fn(),
  createProjectAction: vi.fn(),
  deleteProjectAction: vi.fn()
}));

const mockInitialProject: SchemaAST = {
  project: { id: "p-100", name: "Sample DB", description: "Test", createdAt: "", updatedAt: "" },
  settings: { dialect: "sqlite", theme: "dark" },
  tables: {
    "t-1": { id: "t-1", name: "users", position: { x: 10, y: 10 }, columns: [], indexes: [] }
  },
  relations: {},
  enums: {}
};

describe("WorkspaceClient UI Component Edge Cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test: Renders EmptyProjectView when no initial project payload exists.
   */
  it("should render EmptyProjectView when initialProject is null and projects list is empty", async () => {
    await act(async () => {
      render(
        <ThemeProvider>
          <WorkspaceClient initialProjectsList={[]} initialProject={undefined} />
        </ThemeProvider>
      );
    });

    expect(screen.getByText("No Projects Yet")).toBeInTheDocument();
  }, 15000);

  /**
   * Test: Renders workspace layout shell when initial project is provided.
   */
  it("should render workspace layout and Header when initialProject is provided", async () => {
    await act(async () => {
      render(
        <ThemeProvider>
          <WorkspaceClient 
            initialProjectsList={[{ id: "p-100", name: "Sample DB", dialect: "sqlite", createdAt: "", updatedAt: "" }]} 
            initialProject={mockInitialProject} 
          />
        </ThemeProvider>
      );
    });

    expect(screen.getByText("Schema Flow")).toBeInTheDocument();
    expect(screen.getByText("Sample DB")).toBeInTheDocument();
  }, 15000);
});

