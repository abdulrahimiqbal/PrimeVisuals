/* Theme tokens and global CSS for PrimeVisuals. */

export const T = {
  void: "#07080F", panel: "#0C0F17", panel2: "#10141F", line: "#1C2333",
  ink: "#E9ECF5", dim: "#828CA3", faint: "#454E66",
  ion: "#7DD3FC", rose: "#FB7185", amber: "#FBBF24", slate: "#64748B",
  mono: "'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace",
  sans: "'Instrument Sans', system-ui, sans-serif",
};

export const FONT_CSS =
  "@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Instrument+Sans:wght@400;500;600&display=swap');" +
  "input[type=range]{cursor:pointer;} select{cursor:pointer;} ::selection{background:#1d3b4d;color:#e9ecf5;}" +
  ".pv-eye-toggle:focus-visible{outline:2px solid #7DD3FC;outline-offset:2px;}";

export function hslPx(h, s, l) { // h,s,l ∈ [0,1] → [r,g,b]
  const a = s * Math.min(l, 1 - l);
  const f = (k) => { const x = (k + h * 12) % 12; return l - a * Math.max(-1, Math.min(x - 3, Math.min(9 - x, 1))); };
  return [255 * f(0), 255 * f(8), 255 * f(4)];
}
