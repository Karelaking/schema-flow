/**
 * @file MobileNavigation.test.tsx
 * @description Unit tests for MobileNavigation bottom tab bar component.
 */

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MobileNavigation } from "@/components/layout/MobileNavigation";

describe("MobileNavigation UI Component Edge Cases", () => {
  /**
   * Test: Renders Explorer, Canvas, and Inspect navigation buttons.
   */
  it("should render Explorer, Canvas, and Inspect bottom tabs", () => {
    render(<MobileNavigation activeTab="canvas" onTabChange={vi.fn()} />);

    expect(screen.getByText("Explorer")).toBeInTheDocument();
    expect(screen.getByText("Canvas")).toBeInTheDocument();
    expect(screen.getByText("Inspect")).toBeInTheDocument();
  });

  /**
   * Test: Triggers onTabChange callback with clicked tab key.
   */
  it("should call onTabChange with correct tab ID when clicked", () => {
    const onTabChange = vi.fn();
    render(<MobileNavigation activeTab="canvas" onTabChange={onTabChange} />);

    fireEvent.click(screen.getByText("Explorer"));
    expect(onTabChange).toHaveBeenCalledWith("explorer");

    fireEvent.click(screen.getByText("Inspect"));
    expect(onTabChange).toHaveBeenCalledWith("inspector");
  });
});
