import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "@/components/layout/Header";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { useStore } from "@/lib/store";

vi.mock("@/hooks/useProjectActions", () => ({
  useProjectActions: () => ({
    projectsList: [
      { id: "p-1", name: "Main Database", dialect: "sqlite", createdAt: "", updatedAt: "" }
    ],
    isSaving: false,
    saveMessage: "",
    fetchProjects: vi.fn(),
    switchProject: vi.fn(),
    saveProject: vi.fn(),
    exportSchema: vi.fn(),
    importSchema: vi.fn(),
  }),
}));

describe("Header UI Component Edge Cases", () => {
  beforeEach(() => {
    useStore.setState({
      projectId: "p-1",
      projectName: "Main Database",
      dialect: "sqlite",
      past: [],
      future: [],
    });
  });

  it("should render application branding and active project details", () => {
    render(
      <ThemeProvider>
        <Header />
      </ThemeProvider>
    );

    expect(screen.getByText("Schema Flow")).toBeInTheDocument();
    expect(screen.getByText("Main Database")).toBeInTheDocument();
    expect(screen.getByText(/sqlite Dialect/i)).toBeInTheDocument();
  });
});
