import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock ResizeObserver for DOM components
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock PointerEvent if not available in jsdom
if (typeof window !== "undefined" && !window.PointerEvent) {
  class PointerEvent extends MouseEvent {
    public pointerId: number;
    constructor(type: string, props: MouseEventInit = {}) {
      super(type, props);
      this.pointerId = 1;
    }
  }
  (window as any).PointerEvent = PointerEvent;
}

// Mock matchMedia
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}
