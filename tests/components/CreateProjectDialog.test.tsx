import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateProjectDialog } from "@/components/modals/CreateProjectDialog";
import { useStore } from "@/lib/store";

vi.mock("@/app/actions/projects", () => ({
  createProjectAction: vi.fn().mockResolvedValue({
    success: true,
    project: {
      project: { id: "proj-123", name: "Mocked Proj", description: "", createdAt: "", updatedAt: "" },
      settings: { dialect: "sqlite", theme: "dark" },
      tables: {},
      relations: {}
    }
  }),
}));

describe("CreateProjectDialog UI Component Edge Cases", () => {
  beforeEach(() => {
    useStore.setState({
      projectId: undefined,
      projectName: "Untitled",
      tables: {},
      relations: {}
    });
  });

  it("should render dialog title and form elements when open", () => {
    render(<CreateProjectDialog open={true} onOpenChange={vi.fn()} />);

    expect(screen.getByText("Create New Project")).toBeInTheDocument();
    expect(screen.getByLabelText("Project Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Database Dialect")).toBeInTheDocument();
  });

  it("should validate and submit project creation form", async () => {
    const onOpenChange = vi.fn();
    const onSuccess = vi.fn();

    render(<CreateProjectDialog open={true} onOpenChange={onOpenChange} onSuccess={onSuccess} />);

    const nameInput = screen.getByLabelText("Project Name");
    fireEvent.change(nameInput, { target: { value: "my_new_app_db" } });

    const submitBtn = screen.getByText("Create Project");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
