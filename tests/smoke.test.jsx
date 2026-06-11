import { describe, it, expect, vi, beforeAll } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import PrimeVisuals from "../src/PrimeVisuals.jsx";

beforeAll(() => {
  // jsdom has no canvas; stub out everything draw() touches
  const ctx = new Proxy({}, {
    get: (t, prop) => {
      if (prop === "createRadialGradient" || prop === "createLinearGradient") {
        return () => ({ addColorStop: () => {} });
      }
      if (prop === "createImageData") return (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) });
      if (prop === "getImageData") return (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4) });
      if (prop === "measureText") return () => ({ width: 0 });
      if (typeof prop === "string") return () => {};
      return undefined;
    },
    set: () => true,
  });
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ctx);
  globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
});

describe("PrimeVisuals", () => {
  it("renders the default view without throwing", () => {
    const { container } = render(<PrimeVisuals />);
    expect(container.querySelector("canvas")).toBeTruthy();
    expect(container.textContent).toContain("PRIME");
  });
});
