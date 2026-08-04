/**
 * @file CenterControls.test.tsx
 * @description Unit tests for the CenterControls component (Undo, Redo, Auto-Layout).
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CenterControls } from "@/components/modals/CenterControls";
import { useStore } from "@/lib/store";

describe("CenterControls UI Component Edge Cases", () => {
  beforeEach(() => {
    useStore.setState({
      past: [],
      future: [],
      tables: {
        "t1": { id: "t1", name: "users", position: { x: 0, y: 0 }, columns: [], indexes: [] }
      },
      relations: {}
    });
  });

  /**
   * Test: Disables Undo and Redo when history stacks are empty.
   */
  it("should disable Undo and Redo buttons when history stacks are empty", () => {
    render(<CenterControls />);

    const undoBtn = screen.getByTitle("Undo");
    const redoBtn = screen.getByTitle("Redo");

    expect(undoBtn).toBeDisabled();
    expect(redoBtn).toBeDisabled();
  });

  /**
   * Test: Enables Undo when past history exists and calls store undo action on click.
   */
  it("should enable Undo button when past stack has history and trigger undo on click", () => {
    const undoSpy = vi.spyOn(useStore.getState(), "undo");

    useStore.setState({
      past: [{ tables: {}, relations: {}, enums: {} }],
      future: []
    });

    render(<CenterControls />);

    const undoBtn = screen.getByTitle("Undo");
    expect(undoBtn).not.toBeDisabled();

    fireEvent.click(undoBtn);
    expect(undoSpy).toHaveBeenCalled();
  });

  /**
   * Test: Triggers autoLayoutTables on clicking Auto Layout Diagram button.
   */
  it("should trigger autoLayoutTables on clicking Auto Layout Diagram button", () => {
    const layoutSpy = vi.spyOn(useStore.getState(), "autoLayoutTables");

    render(<CenterControls />);

    const layoutBtn = screen.getByTitle("Auto Layout Diagram");
    fireEvent.click(layoutBtn);

    expect(layoutSpy).toHaveBeenCalled();
  });
});
