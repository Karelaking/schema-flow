import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProjectSettingsDialog } from "@/components/modals/ProjectSettingsDialog";
import { useStore } from "@/lib/store";

describe("ProjectSettingsDialog UI Component Edge Cases", () => {
  beforeEach(() => {
    useStore.setState({
      projectId: "p-active",
      projectName: "Existing Schema",
      projectDescription: "Original desc",
      dialect: "postgres",
      autoAddId: true,
      autoAddTimestamps: true,
    });
  });

  it("should populate existing project details in settings form", () => {
    render(<ProjectSettingsDialog open={true} onOpenChange={vi.fn()} />);

    expect(screen.getByText("Project Settings")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Existing Schema")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Original desc")).toBeInTheDocument();
    expect(screen.getByText("Default Node Columns")).toBeInTheDocument();
  });

  it("should trigger delete request callback when clicking Danger Zone delete button", () => {
    const onOpenChange = vi.fn();
    const onDeleteRequest = vi.fn();

    render(
      <ProjectSettingsDialog 
        open={true} 
        onOpenChange={onOpenChange} 
        onDeleteRequest={onDeleteRequest} 
      />
    );

    const deleteBtn = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(deleteBtn);

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onDeleteRequest).toHaveBeenCalled();
  });
});
