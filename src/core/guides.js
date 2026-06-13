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
    polyprimes: "Each dot is one monic irreducible polynomial over F_q[t].",
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
    if (cfg.plane === "graph" && cfg.source === "polyprimes") return "X is the compact polynomial encoding; Y is the polynomial degree, the log-size analog.";
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
      "polyprimes:graph": "Compare degree layers with the exact irreducible-count formula; mismatches would mean the finite-field build is wrong.",
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

/* One live plain-English sentence about the current view, plus what a
   pattern would mean if one appeared. Written for non-number-theorists. */
export function explainView(cfg, opts = {}) {
  const { chips, residual, twinMode } = opts;
  const what = {
    "psi:graph": "You're watching the primes being rebuilt out of zeta-zero waves: the staircase climbs at every prime power, and the smooth curve knows nothing about primes — only about the first K zeros of the zeta function.",
    "primes:sacks": "Every prime is wrapped onto a spiral. Nothing about the spiral favors primes, so any curve you see is the primes choosing certain polynomial paths.",
    "primes:ulam": "The counting numbers are written in a square spiral and only the primes are lit. Diagonals are quadratic formulas; bright diagonals are formulas unusually rich in primes.",
    "primes:polar": "Each prime p is placed at angle α·p, like winding a number line around a dial. When α/2π is close to a simple fraction, primes sort themselves into spokes by remainder.",
    "primes:clock": "Each prime is placed on a clock by its remainder. Empty spokes aren't gaps in the data — they're remainders no prime can ever have.",
    "primes:walk": "Two teams of primes (remainder 1 vs remainder 3 when divided by 4) race; the line shows who's ahead. They should tie in the long run, yet one team leads suspiciously often.",
    "primes:matrix": "The numbers up to N are poured into a table W columns wide and the primes are lit. Drag W and watch: stripes snap in whenever W shares a factor with small primes, because whole columns become impossible.",
    "primes:family": "Every row asks the same question for a different divisor q: do the primes spread evenly among the allowed remainders? Green = fair, warm = excess, cold = deficit, black = impossible.",
    "polyprimes:graph": "These are polynomial primes in F_q[t]. Their degree plays the role of log size, so each horizontal layer is a finite-field prime-counting test.",
    "gaps:graph": "Each point is the distance from one prime to the next. The floor slowly rises (primes thin out), but individual gaps swing wildly.",
    "mobius:walk": "A coin-flip-like walk driven by the Möbius function. If this walk ever strays too far from zero, the Riemann Hypothesis is false.",
    "zeta:graph": "The height of the zeta function as you climb the critical line. Every touch of zero is one of the zeros that secretly steer the primes.",
    "zeta:argand": "The zeta function drawn as a moving point in the plane. Each loop through the origin is a zero.",
    "zeros:strip": "The known zeros plotted in their natural home. The Riemann Hypothesis says they all sit exactly on the center line — none have ever been found off it.",
    "zeros:graph": "The spacing between consecutive zeros. They repel each other like energy levels of a heavy atom — one of math's strangest unexplained connections.",
  }[`${cfg.source}:${cfg.plane}`]
    || "A stream of arithmetic data placed into a coordinate system — structure you see is structure the numbers brought with them.";

  const mods = [];
  if (residual) mods.push("RESIDUAL is on: the best-known prediction has been subtracted, so anything left on screen is what current theory does not explain.");
  if (twinMode && twinMode !== "real") mods.push("The rose layer is fake primes (random numbers with the primes' density): patterns in both layers are coincidence-grade; patterns only in cyan are real arithmetic.");
  if (chips && (chips.x.length || chips.y.length)) mods.push("Transform chips are reshaping the axes, so you're looking at a function of the original picture.");
  return [what, ...mods];
}

/* Map raw engine errors to friendly explanations with a one-click fix. */
export function friendlyLabError(msg, lab) {
  if (!msg) return null;
  let m = /unknown function “(.+?)”/.exec(msg);
  if (m) {
    return { text: `“${m[1]}” isn't a function here. Available: abs arg re im conj exp log sqrt sin cos floor frac min max dot mod gcd pow zeta — and on integer domains mu M isprime pi gap omega bigomega tau phi rad.` };
  }
  m = /unknown “(.+?)”/.exec(msg);
  if (m) {
    const name = m[1];
    if (name === "s" && lab.domain !== "complex") {
      return { text: "“s” only exists on the complex plane.", fix: { label: "switch domain to ℂ", domain: "complex" } };
    }
    if (name === "t" && (lab.domain === "int" || lab.domain === "prime")) {
      return { text: "“t” is the real-line variable; this domain steps through whole numbers as “n”.", fix: { label: "switch domain to ℝ", domain: "real" } };
    }
    if (name === "n" && (lab.domain === "real" || lab.domain === "complex")) {
      return { text: "“n” is the integer variable; this domain doesn't have it.", fix: { label: "switch domain to ℤ", domain: "int" } };
    }
    return { text: `“${name}” isn't defined. The variables are n (integers), t (real line), s (complex plane), i, and the knobs a and b.` };
  }
  return { text: msg };
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
