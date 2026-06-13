// @vitest-environment happy-dom

import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import React from "react";
import { render, fireEvent, cleanup } from "@testing-library/react";
afterEach(cleanup);
import PrimeVisuals from "../src/PrimeVisuals.jsx";

beforeAll(() => {
  // The DOM test environment has no canvas; stub out everything draw() touches.
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

  it("renders the prime matrix plane and the plain-words panel", () => {
    const { container, getAllByText } = render(<PrimeVisuals />);
    // The "IN PLAIN WORDS" panel is always present in patch mode
    expect(container.textContent).toContain("IN PLAIN WORDS");
    // Click the "Prime matrix" library chip — library chips render as span.truncate inside a div
    const truncateSpans = container.querySelectorAll("span.truncate");
    const matrixSpan = Array.from(truncateSpans).find((el) => el.textContent === "Prime matrix");
    expect(matrixSpan).toBeTruthy();
    fireEvent.click(matrixSpan);
    // After clicking, the plane is "matrix" whose label is "Matrix rows (width W)"
    expect(container.textContent).toMatch(/Matrix rows|row width/);
  });

  it("shows a friendly lab error with a domain fix for 's' on integer domain", async () => {
    // Directly test the friendlyLabError function — reliable, no brittle input targeting
    const { friendlyLabError } = await import("../src/core/guides.js");

    // The engine emits errors with curly/smart double quotes (“ and ”)
    const lq = "“"; // left double quotation mark
    const rq = "”"; // right double quotation mark

    // 's' on int domain → switch to ℂ
    const errS = friendlyLabError(`unknown ${lq}s${rq}`, { domain: "int" });
    expect(errS).toBeTruthy();
    expect(errS.text).toContain("complex plane");
    expect(errS.fix).toBeTruthy();
    expect(errS.fix.label).toContain("switch domain to ℂ"); // ℂ

    // Clicking the fix would change domain to complex, removing the error
    // We verify fix.domain is "complex" so the error would disappear
    expect(errS.fix.domain).toBe("complex");

    // 't' on int domain → switch to ℝ
    const errT = friendlyLabError(`unknown ${lq}t${rq}`, { domain: "int" });
    expect(errT.fix.label).toContain("switch domain to ℝ"); // ℝ

    // 'n' on real domain → switch to ℤ
    const errN = friendlyLabError(`unknown ${lq}n${rq}`, { domain: "real" });
    expect(errN.fix.label).toContain("switch domain to ℤ"); // ℤ

    // unknown function
    const errFn = friendlyLabError(`unknown function ${lq}foo${rq}`, { domain: "int" });
    expect(errFn.text).toContain("foo");
    expect(errFn.fix).toBeUndefined();
  });
});
