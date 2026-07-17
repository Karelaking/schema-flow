/**
 * @file ProjectSwitcher.test.tsx
 * @description Unit and edge-case test suite for the ProjectSwitcher isolated client component.
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { ProjectSwitcher } from "@/components/modals/ProjectSwitcher";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { useStore } from "@/lib/store";

const mockFetchProjects = vi.fn();
const mockSwitchProject = vi.fn();

vi.mock("@/hooks/useProjectActions", () => ({
  useProjectActions: () => ({
    projectsList: [
      { id: "proj-1", name: "E-Commerce DB", dialect: "postgres", createdAt: "", updatedAt: "" },
      { id: "proj-2", name: "Analytics DB", dialect: "mysql", createdAt: "", updatedAt: "" }
    ],
    fetchProjects: mockFetchProjects,
    switchProject: mockSwitchProject,
    saveProject: vi.fn(),
    exportSchema: vi.fn(),
    importSchema: vi.fn(),
    isSaving: false,
    saveMessage: ""
  }),
}));

describe("ProjectSwitcher UI Component Edge Cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useStore.setState({
      projectId: "proj-1",
      projectName: "E-Commerce DB",
      dialect: "postgres",
      past: [],
      future: [],
    });
  });

  /**
   * Test: Renders active project metadata correctly in header trigger.
   */
  it("should render active project name and dialect badge", async () => {
    await act(async () => {
      render(
        <ThemeProvider>
          <ProjectSwitcher />
        </ThemeProvider>
      );
    });

    expect(screen.getByText("E-Commerce DB")).toBeInTheDocument();
    expect(screen.getByText(/postgres Dialect/i)).toBeInTheDocument();
  });

  /**
   * Test: Opens dropdown menu and triggers project switching action.
   */
  it("should open dropdown menu and trigger switchProject when clicking another project", async () => {
    await act(async () => {
      render(
        <ThemeProvider>
          <ProjectSwitcher />
        </ThemeProvider>
      );
    });

    const triggerBtn = screen.getByText("E-Commerce DB");
    fireEvent.click(triggerBtn);

    const analyticsOption = await screen.findByText("Analytics DB");
    expect(analyticsOption).toBeInTheDocument();

    fireEvent.click(analyticsOption);
    expect(mockSwitchProject).toHaveBeenCalledWith("proj-2");
  }, 15000);
});

