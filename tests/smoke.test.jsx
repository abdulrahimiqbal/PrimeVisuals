import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import React from "react";
import { render, fireEvent, cleanup } from "@testing-library/react";
afterEach(cleanup);
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
  it("renders the default view (Riemann explicit formula) without throwing", () => {
    const { container } = render(<PrimeVisuals />);
    expect(container.querySelector("canvas")).toBeTruthy();
    expect(container.textContent).toContain("PRIME");
    expect(container.textContent).toContain("explicit formula");
  });

  it("switches presets and toggles residual + twin", () => {
    const { container, getByText, getByTitle } = render(<PrimeVisuals />);
    fireEvent.click(getByText("Gap skyline"));
    expect(container.textContent).toContain("Prime gaps");
    fireEvent.click(getByText("RESIDUAL"));
    expect(container.textContent).toContain("residual: gap − ln p");
    fireEvent.click(getByText("TWIN"));
    expect(container.textContent).toContain("twin: both");
    fireEvent.click(getByText("TWIN·BOTH"));
    expect(container.textContent).toContain("twin: twin");
  });

  it("adds, scrubs-renders, and removes a transform chip", () => {
    const { container, getAllByText } = render(<PrimeVisuals />);
    // op palette "log" button adds a chip to the default (y) axis
    const logBtns = getAllByText("log");
    fireEvent.click(logBtns[0]);
    expect(container.textContent).toContain("y: v → log");
    // remove it via the chip's ✕
    const removes = getAllByText("✕");
    fireEvent.click(removes[removes.length - 1]);
    expect(container.textContent).not.toContain("y: v → log");
  });

  it("renders the family heatmap plane without points", () => {
    const { getByText, container } = render(<PrimeVisuals />);
    fireEvent.click(getByText("Family sweep mod q"));
    expect(container.textContent).toContain("Family sweep");
  });

  it("supports the primes-only lab domain", () => {
    const { getByText, container } = render(<PrimeVisuals />);
    fireEvent.click(getByText("LAB"));
    expect(container.textContent).toContain("CANVAS LAB");
  });
});
