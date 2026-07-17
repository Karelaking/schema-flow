import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DeleteProjectDialog } from "@/components/modals/DeleteProjectDialog";

vi.mock("@/app/actions/projects", () => ({
  deleteProjectAction: vi.fn().mockResolvedValue({ success: true }),
}));

describe("DeleteProjectDialog UI Component Edge Cases", () => {
  it("should render project name in confirmation message and handle delete confirmation", async () => {
    const onOpenChange = vi.fn();
    const onDeleted = vi.fn();

    render(
      <DeleteProjectDialog 
        targetProject={{ id: "p-target", name: "Sample Database To Delete" }} 
        onOpenChange={onOpenChange} 
        onDeleted={onDeleted} 
      />
    );

    expect(screen.getByText(/Sample Database To Delete/i)).toBeInTheDocument();

    const deleteBtn = screen.getByRole("button", { name: "Delete Project" });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(onDeleted).toHaveBeenCalledWith("p-target");
    });
  });
});
