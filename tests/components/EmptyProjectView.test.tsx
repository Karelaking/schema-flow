/**
 * @file EmptyProjectView.test.tsx
 * @description Unit tests for EmptyProjectView component.
 */

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { EmptyProjectView } from "@/components/layout/EmptyProjectView";

describe("EmptyProjectView UI Component Edge Cases", () => {
  /**
   * Test: Renders initial zero-project empty state notice and action button.
   */
  it("should render empty state heading and Create New Project button", async () => {
    await act(async () => {
      render(<EmptyProjectView />);
    });

    expect(screen.getByText("No Projects Yet")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Create New Project/i })).toBeInTheDocument();
  });

  /**
   * Test: Opens Create New Project modal dialog when clicking create button.
   */
  it("should open Create New Project dialog on button click", async () => {
    await act(async () => {
      render(<EmptyProjectView />);
    });

    const createBtn = screen.getByRole("button", { name: /Create New Project/i });
    fireEvent.click(createBtn);

    const dialogTitle = await screen.findByRole("heading", { name: "Create New Project" });
    expect(dialogTitle).toBeInTheDocument();
  });
});
