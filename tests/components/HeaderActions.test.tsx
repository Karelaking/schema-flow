/**
 * @file HeaderActions.test.tsx
 * @description Unit tests for HeaderActions component (Export, Import JSON, Theme toggle).
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { HeaderActions } from "@/components/layout/HeaderActions";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { useStore } from "@/lib/store";

const mockExportSchema = vi.fn();

vi.mock("@/hooks/useProjectActions", () => ({
  useProjectActions: () => ({
    isSaving: false,
    exportSchema: mockExportSchema,
    importSchema: vi.fn(),
    saveProject: vi.fn(),
    fetchProjects: vi.fn(),
    switchProject: vi.fn(),
    projectsList: []
  }),
}));

describe("HeaderActions UI Component Edge Cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useStore.setState({
      projectName: "Test Schema",
    });
  });

  /**
   * Test: Renders Export dropdown, Import JSON button, and Theme toggle button.
   */
  it("should render Export, Import JSON, and Theme toggle buttons", async () => {
    await act(async () => {
      render(
        <ThemeProvider>
          <HeaderActions />
        </ThemeProvider>
      );
    });

    expect(screen.getByText("Export")).toBeInTheDocument();
    expect(screen.getByTitle("Import Schema JSON")).toBeInTheDocument();
    expect(screen.getByTitle(/Switch to Light Mode|Switch to Dark Mode/i)).toBeInTheDocument();
  });

  /**
   * Test: Opens Export dropdown menu and triggers exportSchema callback.
   */
  it("should open Export dropdown and trigger exportSchema on Export JSON click", async () => {
    await act(async () => {
      render(
        <ThemeProvider>
          <HeaderActions />
        </ThemeProvider>
      );
    });

    const exportBtn = screen.getByText("Export");
    fireEvent.click(exportBtn);

    const exportJsonOption = await screen.findByText("Export JSON");
    expect(exportJsonOption).toBeInTheDocument();

    fireEvent.click(exportJsonOption);
    expect(mockExportSchema).toHaveBeenCalled();
  }, 15000);
});

