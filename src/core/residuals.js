/* RESIDUAL MODE — subtract the best-known prediction from a view, so what
   remains is exactly what the encoded theory does not explain. Keyed by
   `${source}:${plane}`; views without an entry can't toggle. */

import { liUpTo, psiExplicit } from "./math.js";
import { padBounds, baseline } from "./registry.js";

export const RESIDUALS = {
  "primes:graph": {
    label: "π(x) − Li(x)",
    note: "the prime count minus the logarithmic-integral prediction",
    transform: (data, mapped) => {
      const xs = mapped.xs, L = xs.length;
      const li = liUpTo(xs);
      const ys = new Float64Array(L);
      for (let i = 0; i < L; i++) ys[i] = (i + 1) - li[i];
      return { ys, bounds: padBounds(xs, ys, 0.08), mode: "path" };
    },
  },
  "psi:graph": {
    label: "ψ(x) − x",
    note: "the weighted prime staircase minus its main term",
    transform: (data, mapped, p) => {
      const xs = mapped.xs, L = xs.length;
      const ys = new Float64Array(L);
      for (let i = 0; i < L; i++) ys[i] = mapped.ys[i] - xs[i];
      const K = Math.round(p.K || 0);
      return {
        ys, bounds: padBounds(xs, ys, 0.1), mode: "step",
        decor: (ctx, px, th2) => {
          baseline(ctx, px, th2, xs[0], xs[L - 1]);
          ctx.strokeStyle = th2.amber; ctx.lineWidth = 1.4; ctx.globalAlpha = 0.9;
          ctx.beginPath();
          const x0 = Math.max(2, xs[0]), x1 = xs[L - 1];
          for (let i = 0; i <= 420; i++) {
            const x = x0 + (i / 420) * (x1 - x0);
            const [sx, sy] = px(x, psiExplicit(x, K) - x);
            if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
          }
          ctx.stroke(); ctx.globalAlpha = 1;
        },
      };
    },
  },
  "gaps:graph": {
    label: "gap − ln p",
    note: "each gap minus the average gap size predicted near p",
    transform: (data, mapped) => {
      const ys = Float64Array.from(data.ww);
      return { ys, bounds: padBounds(mapped.xs, ys, 0.07), decor: (c, px, t2) => baseline(c, px, t2, mapped.xs[0], mapped.xs[mapped.xs.length - 1]) };
    },
  },
  "mobius:walk": {
    label: "M(x) / √x",
    note: "the Mertens walk against its conjectured √x growth envelope",
    transform: (data, mapped) => {
      const xs = mapped.xs, L = xs.length, ys = new Float64Array(L);
      for (let i = 0; i < L; i++) ys[i] = mapped.ys[i] / Math.sqrt(Math.max(2, xs[i]));
      return { ys, bounds: padBounds(xs, ys, 0.1), decor: (c, px, t2) => baseline(c, px, t2, xs[0], xs[L - 1]) };
    },
  },
  "primes:walk": {
    label: "race · ln x / √x",
    note: "the Chebyshev race normalized by its natural fluctuation scale",
    transform: (data, mapped) => {
      const xs = mapped.xs, L = xs.length, ys = new Float64Array(L);
      for (let i = 0; i < L; i++) {
        const x = Math.max(3, xs[i]);
        ys[i] = (mapped.ys[i] * Math.log(x)) / Math.sqrt(x);
      }
      return { ys, bounds: padBounds(xs, ys, 0.1), decor: (c, px, t2) => baseline(c, px, t2, xs[0], xs[L - 1]) };
    },
  },
  "zeros:graph": {
    label: "spacing / mean − 1",
    note: "zero spacings against perfect regularity; GUE repulsion shows as structure",
    transform: (data, mapped) => {
      const xs = mapped.xs, L = xs.length, ys = new Float64Array(L);
      let m = 0; for (let i = 0; i < L; i++) m += mapped.ys[i];
      m = m / L || 1;
      for (let i = 0; i < L; i++) ys[i] = mapped.ys[i] / m - 1;
      return { ys, bounds: padBounds(xs, ys, 0.12), decor: (c, px, t2) => baseline(c, px, t2, xs[0], xs[L - 1]) };
    },
  },
};

export function residualFor(cfg) {
  return RESIDUALS[`${cfg.source}:${cfg.plane}`] || null;
}
