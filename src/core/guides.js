/* In-app explanations: the READING THIS VIEW panel, hover tooltips, and
   the shared screen-space projector used for hit-testing. */

import { SOURCES, PLANES, LENSES, fmt, neat, padBounds } from "./registry.js";

export function patchGuide(cfg, data) {
  const source = SOURCES[cfg.source], plane = PLANES[cfg.plane], lens = LENSES[cfg.lens];
  const count = data && data.n ? fmt(data.n.length) : "the selected";
  const N = cfg.p.N ? fmt(cfg.p.N) : null;
  const dot = {
    primes: `Each dot is one prime p${N ? ` from the ${count} primes up to ${N}` : ""}.`,
    gaps: `Each point is one gap between consecutive primes: next prime minus p.`,
    mobius: `Each point is one integer n; the signal is mu(n), which is -1, 0, or +1.`,
    zeta: `Each sample is zeta(1/2 + it) at one height t, not an individual prime.`,
    zeros: `Each dot is one known nontrivial zeta zero height t_k.`,
    psi: `Each step is one prime power p^k weighted by log p; the staircase is Chebyshev psi(x).`,
  }[cfg.source] || `Each item comes from ${source.label}.`;

  const position = (() => {
    if (cfg.plane === "ulam") return "Integers are written on a square spiral; this source marks the positions that survive the source filter.";
    if (cfg.plane === "sacks") return "The number is wrapped onto a spiral with r = sqrt(n) and theta = 2*pi*sqrt(n).";
    if (cfg.plane === "polar") return `The angle is alpha*n, currently alpha = ${(+cfg.p.alpha).toFixed(3)}; radius comes from n or |zeta|.`;
    if (cfg.plane === "clock") return `The spoke is n mod ${Math.round(cfg.p.mod || 12)} and radius grows like sqrt(n).`;
    if (cfg.plane === "walk") return "X moves along n; Y is the cumulative total of the source signal.";
    if (cfg.plane === "argand") return "The complex zeta value becomes a point: x = Re(zeta), y = Im(zeta).";
    if (cfg.plane === "strip") return "Zeros are placed at x = 1/2 and y = t_k inside the critical strip.";
    if (cfg.plane === "family") return "Each row is one member of the swept family; brightness shows where its values land.";
    if (cfg.plane === "graph" && cfg.source === "psi") return "X is x; Y is psi(x). The smooth curve is the explicit formula built from the first K zeros.";
    if (cfg.plane === "graph" && cfg.source === "primes") return "X is prime p; Y is pi(p), the count of primes up to p.";
    if (cfg.plane === "graph" && cfg.source === "gaps") return "X is prime p; Y is the following prime gap.";
    if (cfg.plane === "graph" && cfg.source === "zeta") return "X is height t; Y is |zeta(1/2 + it)|.";
    if (cfg.plane === "graph" && cfg.source === "zeros") return "X is the zero height; Y is spacing to the next zero.";
    return `The ${plane.label} plane decides the x/y position.`;
  })();

  const color = (() => {
    if (cfg.lens === "mono") return "One color only; read the geometry without a second variable.";
    if (cfg.lens === "aurora") return "Color follows order through the sequence from first to last.";
    if (cfg.lens === "signal") return "Color separates positive, negative, and zero signal values.";
    if (cfg.lens === "pulse") return "Color follows magnitude; stronger values move through the palette.";
    if (cfg.lens === "residue" && data && data.domain !== "int") return "Residue coloring needs integer data, so this view falls back to sequence color.";
    if (cfg.lens === "residue") return `Color is n mod ${Math.round(cfg.p.kres || 6)}. Matching colors share the same residue class.`;
    return `${lens.label} controls how each item glows.`;
  })();

  const lookFor = (() => {
    const key = `${cfg.source}:${cfg.plane}`;
    const notes = {
      "psi:graph": "Raise the zero count K and watch the smooth curve grow wiggles that lock onto the staircase.",
      "primes:sacks": "Look for curved streaks. They often reveal prime-rich polynomial paths.",
      "primes:ulam": "Look for diagonal streaks. Sparse diagonals and dense diagonals both matter.",
      "primes:polar": "Turn alpha slowly and watch for spokes or petals that suddenly lock in.",
      "primes:clock": "Empty spokes are usually impossible residue classes, not missing data.",
      "primes:walk": "Watch which residue class leads, then see whether the lead persists as N grows.",
      "primes:family": "Each row is one modulus or angle; coherent vertical bands mean structure shared across the family.",
      "gaps:graph": "Tall spikes are unusually large prime gaps; the baseline slowly drifts upward.",
      "mobius:walk": "Read it as balance. Long drift means one Mobius sign has led for a while.",
      "zeta:graph": "Deep dips toward zero mark zero heights on the critical line.",
      "zeta:argand": "Loops passing through the origin correspond to zeta zeros.",
      "zeros:strip": "The visual question is whether zeros stay on the center line Re(s) = 1/2.",
      "zeros:graph": "Compare each spacing with the mean line; nearby zeros tend to repel.",
    };
    return notes[key] || "Increase the range and see which structures persist instead of disappearing.";
  })();

  return [
    ["Dot", dot],
    ["Position", position],
    ["Color", color],
    ["Look For", lookFor],
  ];
}

export function labGuide(lab, labData) {
  if (lab.domain === "complex") {
    return [
      ["Sample", "Each pixel is one complex input s = sigma + i*t."],
      ["Relationship", "Your node graph compiles into w(s), the complex relationship being painted."],
      ["Color", "Hue shows arg(w(s)); brightness follows |w(s)|. Dark spots are low-magnitude outputs."],
      ["Look For", (lab.ew || "").includes("zeta") ? "This template uses zeta, but any complex relationship can be connected to w." : "Look for repeating color cycles, poles, and zero-like dark points."],
    ];
  }
  const variable = lab.domain === "real" ? "t" : "n";
  const zetaNote = lab.domain === "real" && /zeta/.test(lab.ey || "")
    ? ` With a = ${(+lab.a).toFixed(3)}, dips hit zero only when the path crosses actual zeros.`
    : "";
  return [
    ["Sample", lab.domain === "real" ? "Each point samples one height t on a real line." : lab.domain === "prime" ? "Each point samples one prime p (as n)." : "Each point samples one integer n."],
    ["Relationship", `The graph compiles to x(${variable}), y(${variable}), and optional hue(${variable}).`],
    ["Color", lab.eh && lab.eh.trim() ? `Color comes from the relationship connected to hue(${variable}).` : "No hue relationship is active, so color is used as a neutral trace."],
    ["Look For", `${labData && labData.err ? "The last valid render stays visible while the graph has an error. " : ""}Drag new objects in, connect relationships, then turn knobs a and b.${zetaNote}`],
  ];
}

export function hoverInfo(mode, cfg, data, lab, labData, idx) {
  if (mode === "patch") {
    const n = data.n && data.n[idx];
    if (data.kind === "primes") {
      const p = Math.round(n);
      const lines = [`p = ${fmt(p)}`, `prime #${fmt(idx + 1)}`, `p mod 4 = ${p % 4}`];
      if (cfg.lens === "residue") {
        const k = Math.max(2, Math.round(cfg.p.kres || 6));
        lines.push(`p mod ${k} = ${p % k}`);
      }
      return { title: "Prime", lines };
    }
    if (data.kind === "gaps") {
      return { title: "Prime Gap", lines: [`p = ${fmt(Math.round(n))}`, `next gap = ${fmt(Math.round(data.w[idx]))}`, `gap - ln(p) = ${neat(data.ww[idx], 3)}`] };
    }
    if (data.kind === "mobius") {
      return { title: "Mobius", lines: [`n = ${fmt(Math.round(n))}`, `mu(n) = ${Math.round(data.w[idx])}`] };
    }
    if (data.kind === "zeta") {
      return { title: "Zeta Sample", lines: [`t = ${neat(n, 3)}`, `|zeta| = ${neat(data.w[idx], 4)}`, `Re = ${neat(data.re[idx], 4)}`, `Im = ${neat(data.im[idx], 4)}`] };
    }
    if (data.kind === "zeros") {
      return { title: "Zeta Zero", lines: [`zero #${idx + 1}`, `t_k = ${neat(n, 4)}`, `next spacing = ${neat(data.w[idx], 4)}`] };
    }
    if (data.kind === "psi") {
      return { title: "Prime Power", lines: [`x = ${fmt(Math.round(n))}`, `weight log p = ${neat(data.w[idx], 3)}`] };
    }
  }
  if (mode === "lab" && labData && labData.series) {
    const S = labData.series;
    return {
      title: "Lab Sample",
      lines: [
        `sample #${idx + 1} / ${fmt(S.L)}`,
        `x = ${neat(S.xs[idx], 4)}`,
        `y = ${neat(S.ys[idx], 4)}`,
        `hue = ${neat(S.hue[idx], 4)}`,
      ],
    };
  }
  return null;
}

export function sceneProjector(scene, wrap, viewState) {
  if (!scene || scene.fieldMeta || !scene.xs || !scene.ys || !wrap) return null;
  const W = wrap.clientWidth, H = wrap.clientHeight;
  if (!W || !H || !scene.xs.length) return null;
  const b = scene.bounds || padBounds(scene.xs, scene.ys, 0.06);
  const M = 26;
  const sc = Math.min((W - 2 * M) / (b.x1 - b.x0 || 1), (H - 2 * M) / (b.y1 - b.y0 || 1));
  const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2;
  return {
    W, H,
    projectX: (x) => (x - cx) * sc * viewState.z + W / 2 + viewState.ox,
    projectY: (y) => -(y - cy) * sc * viewState.z + H / 2 + viewState.oy,
    px: (x, y) => [(x - cx) * sc * viewState.z + W / 2 + viewState.ox, -(y - cy) * sc * viewState.z + H / 2 + viewState.oy],
  };
}
