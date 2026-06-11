/* Transform chips: math ops you drop onto an axis. Each chip rewrites the
   mapped coordinate array; chips compose left to right and always accept
   what the previous chip produced, so any stack is valid. */

export const CHIP_OPS = {
  symlog: { label: "log", title: "sign(v)·ln(1+|v|) — symmetric log", apply: (a) => a.map((v) => Math.sign(v) * Math.log1p(Math.abs(v))) },
  sqrt: { label: "sqrt", title: "sign(v)·√|v|", apply: (a) => a.map((v) => Math.sign(v) * Math.sqrt(Math.abs(v))) },
  abs: { label: "abs", title: "|v|", apply: (a) => a.map((v) => Math.abs(v)) },
  sin: { label: "sin", title: "sin(v)", apply: (a) => a.map((v) => Math.sin(v)) },
  cos: { label: "cos", title: "cos(v)", apply: (a) => a.map((v) => Math.cos(v)) },
  scale: {
    label: "× a", title: "multiply by a (drag the value)",
    param: { key: "a", def: 2, min: -10, max: 10, step: 0.01 },
    apply: (a, p) => a.map((v) => v * p.a),
  },
  offset: {
    label: "+ a", title: "shift by a (drag the value)",
    param: { key: "a", def: 1, min: -1000, max: 1000, step: 0.5 },
    apply: (a, p) => a.map((v) => v + p.a),
  },
  mod: {
    label: "mod m", title: "wrap into [0, m) (drag the value)",
    param: { key: "a", def: 30, min: 2, max: 510, step: 1 },
    apply: (a, p) => { const m = Math.max(1e-9, p.a); return a.map((v) => ((v % m) + m) % m); },
  },
  diff: {
    label: "Δ", title: "first difference v[i] − v[i−1]",
    apply: (a) => { const o = new Float64Array(a.length); for (let i = 1; i < a.length; i++) o[i] = a[i] - a[i - 1]; if (a.length) o[0] = 0; return o; },
  },
  cumsum: {
    label: "Σ", title: "running sum",
    apply: (a) => { const o = new Float64Array(a.length); let s = 0; for (let i = 0; i < a.length; i++) { s += a[i]; o[i] = s; } return o; },
  },
  norm: {
    label: "÷max", title: "divide by max |v|",
    apply: (a) => { let m = 0; for (let i = 0; i < a.length; i++) m = Math.max(m, Math.abs(a[i])); return m > 0 ? a.map((v) => v / m) : a; },
  },
};

export const CHIP_ORDER = ["symlog", "sqrt", "abs", "sin", "cos", "scale", "offset", "mod", "diff", "cumsum", "norm"];

let chipSeq = 0;
export function makeChip(op) {
  const def = CHIP_OPS[op];
  chipSeq++;
  return { id: `c${chipSeq}`, op, p: def.param ? { [def.param.key]: def.param.def } : {} };
}

export function applyChips(arr, chips) {
  let out = arr;
  for (const c of chips) {
    const def = CHIP_OPS[c.op];
    if (!def) continue;
    out = def.apply(Float64Array.from(out), c.p);
  }
  return out;
}

export function chipLabel(chip) {
  const def = CHIP_OPS[chip.op];
  if (!def) return chip.op;
  if (def.param) {
    const v = chip.p[def.param.key];
    const txt = def.param.step >= 1 ? String(Math.round(v)) : (+v).toFixed(2);
    return def.label.replace(/\b(a|m)$/, txt);
  }
  return def.label;
}

/* Pipeline summary like  x: n → log → ×2.0  for the canvas footer. */
export function chipSummary(axis, chips) {
  if (!chips.length) return null;
  return `${axis}: v → ${chips.map(chipLabel).join(" → ")}`;
}
