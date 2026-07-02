#!/usr/bin/env node
// P1-CL visual deliverables (prompts/parity-battery.md):
//   1. C_h spectrum panel over the colored-noise null band
//   2. critical-exponent dashboard (1/2 zeros family, 1/4 divisor family, theta2 hunt)
//   3. M-S variance curve vs prediction vs Cramer band
// Reads the row artifacts; writes three SVGs. No dependencies.
//
// Usage: node scripts/missing-spectrum-plots.mjs [artifactDir] [N] [X]

import fs from "node:fs";
import path from "node:path";

const dir = process.argv[2] || "logs/missing-spectrum-artifacts";
const N = Number(process.argv[3] || 100_000_000);
const X = Number(process.argv[4] || 10_000_000);

const row12 = JSON.parse(fs.readFileSync(path.join(dir, `row12-N${N}.json`), "utf8"));
const spectra = JSON.parse(fs.readFileSync(path.join(dir, `row12-spectra-N${N}.json`), "utf8"));
const row3 = JSON.parse(fs.readFileSync(path.join(dir, `row3-msvariance-X${X}.json`), "utf8"));
const row0 = JSON.parse(fs.readFileSync(path.join(dir, "row0-ynseries.json"), "utf8"));

const W = 960;
const H = 560;
const M = { l: 70, r: 24, t: 44, b: 52 };
const bg = "#0b0e17";
const fg = "#dbe2f1";
const grid = "#232a3d";
const seriesColors = ["#4fc3f7", "#b39ddb", "#ffb74d", "#81c784", "#f06292", "#90a4ae"];

function svgOpen(title, subtitle) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" font-family="system-ui,sans-serif">` +
    `<rect width="${W}" height="${H}" fill="${bg}"/>` +
    `<text x="${M.l}" y="24" fill="${fg}" font-size="16" font-weight="600">${title}</text>` +
    `<text x="${M.l}" y="40" fill="#8b94ab" font-size="11">${subtitle}</text>`
  );
}
function axes(x0, x1, y0, y1, xLabel, yLabel, xTicks, yTicks, fmtX = (v) => v, fmtY = (v) => v) {
  const px = (x) => M.l + ((x - x0) / (x1 - x0)) * (W - M.l - M.r);
  const py = (y) => H - M.b - ((y - y0) / (y1 - y0)) * (H - M.t - M.b);
  let s = "";
  for (const t of xTicks) {
    s += `<line x1="${px(t)}" y1="${M.t}" x2="${px(t)}" y2="${H - M.b}" stroke="${grid}" stroke-width="1"/>`;
    s += `<text x="${px(t)}" y="${H - M.b + 18}" fill="#8b94ab" font-size="11" text-anchor="middle">${fmtX(t)}</text>`;
  }
  for (const t of yTicks) {
    s += `<line x1="${M.l}" y1="${py(t)}" x2="${W - M.r}" y2="${py(t)}" stroke="${grid}" stroke-width="1"/>`;
    s += `<text x="${M.l - 8}" y="${py(t) + 4}" fill="#8b94ab" font-size="11" text-anchor="end">${fmtY(t)}</text>`;
  }
  s += `<text x="${(M.l + W - M.r) / 2}" y="${H - 12}" fill="#aab3c8" font-size="12" text-anchor="middle">${xLabel}</text>`;
  s += `<text x="18" y="${(M.t + H - M.b) / 2}" fill="#aab3c8" font-size="12" text-anchor="middle" transform="rotate(-90 18 ${(M.t + H - M.b) / 2})">${yLabel}</text>`;
  return { s, px, py };
}
function polyline(points, color, width = 1.6, dash = "") {
  const d = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return `<polyline points="${d}" fill="none" stroke="${color}" stroke-width="${width}"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`;
}

// --- 1. spectrum panel -------------------------------------------------------

{
  const gammas = spectra.gammas;
  const maxGamma = 120;
  const idxMax = gammas.findIndex((g) => g > maxGamma);
  const gs = gammas.slice(8, idxMax);
  // null band: per-bin max across the 6 dumped null spectra
  const nullAll = [...spectra.bernAmps, ...spectra.rcmAmps];
  const nullMax = gs.map((_, i) => Math.max(...nullAll.map((a) => a[i + 8])));
  const realHs = Object.keys(spectra.realAmps);
  let yMax = 0;
  for (const h of realHs) for (let i = 8; i < idxMax; i++) yMax = Math.max(yMax, spectra.realAmps[h][i]);
  yMax = Math.max(yMax, ...nullMax) * 1.15;

  let svg = svgOpen(
    `The missing-spectrum hunt - DFT of C_h(e^u)/e^(u/2), N=10^8`,
    `C_h(x) = sum mu(n)mu(n+h). Discrete lines would be the shadow of an unknown spectral object; gray band = max of 6 colored-noise null walks (Bernoulli+RCM). Verdict: no survivor.`,
  );
  const { s, px, py } = axes(gs[0], maxGamma, 0, yMax, "frequency gamma", "windowed amplitude", [20, 40, 60, 80, 100], [0.5, 1.0, 1.5].map((f) => f * yMax * 0.6), (v) => v, (v) => v.toFixed(2));
  svg += s;
  svg += `<path d="M ${gs.map((g, i) => `${px(g)} ${py(nullMax[i])}`).join(" L ")} L ${px(gs[gs.length - 1])} ${py(0)} L ${px(gs[0])} ${py(0)} Z" fill="#39415a" opacity="0.55"/>`;
  realHs.forEach((h, hi) => {
    const pts = gs.map((g, i) => [px(g), py(spectra.realAmps[h][i + 8])]);
    svg += polyline(pts, seriesColors[hi % seriesColors.length], 1.3);
    svg += `<text x="${W - M.r - 8}" y="${M.t + 16 + hi * 15}" fill="${seriesColors[hi % seriesColors.length]}" font-size="11" text-anchor="end">h=${h}</text>`;
  });
  svg += "</svg>";
  fs.writeFileSync(path.join(dir, "spectrum-panel.svg"), svg);
}

// --- 2. critical-exponent dashboard -----------------------------------------

{
  const theta2 = row12.row1.theta2;
  const nullTheta = [...row12.row1.nullTheta2.bernoulli, ...row12.row1.nullTheta2.rcm];
  const nullMean = nullTheta.reduce((a, b) => a + b, 0) / nullTheta.length;
  const nullSd = Math.sqrt(nullTheta.reduce((a, b) => a + (b - nullMean) ** 2, 0) / nullTheta.length);
  const ffSlopes = row0.configs.map((c) => ({
    label: `F_${c.q}[t] S_n (exact)`,
    value: c.shifts[0].exponentSlope,
  }));
  const entries = [
    { label: "psi(x)-x / Mertens (zeros family)", value: 0.5, cls: "known" },
    { label: "divisor residual (Dirichlet family)", value: 0.25, cls: "known" },
    ...Object.entries(theta2)
      .filter(([h]) => Number(h) <= 12)
      .map(([h, v]) => ({ label: `theta2(h=${h}) integer C_h`, value: v, cls: "hunt" })),
    ...ffSlopes.map((r) => ({ ...r, cls: "theorem" })),
  ];
  let svg = svgOpen(
    "Critical exponents of arithmetic - the dashboard",
    `Known lines at 1/2 (zeros) and ~1/4 (divisor). Hunt rows: measured theta2 of C_h at N=10^8 (null walk spread ${nullMean.toFixed(2)}+/-${nullSd.toFixed(2)}); theorem rows: exact F_q[t] slopes (Weil).`,
  );
  const rowH = (H - M.t - M.b) / entries.length;
  const px = (v) => M.l + (v / 1) * (W - M.l - M.r);
  for (const t of [0, 0.25, 0.5, 0.75, 1]) {
    svg += `<line x1="${px(t)}" y1="${M.t}" x2="${px(t)}" y2="${H - M.b}" stroke="${grid}"/>`;
    svg += `<text x="${px(t)}" y="${H - M.b + 18}" fill="#8b94ab" font-size="11" text-anchor="middle">${t}</text>`;
  }
  svg += `<line x1="${px(0.5)}" y1="${M.t}" x2="${px(0.5)}" y2="${H - M.b}" stroke="#4fc3f7" stroke-width="1" stroke-dasharray="4 4" opacity="0.7"/>`;
  svg += `<line x1="${px(0.25)}" y1="${M.t}" x2="${px(0.25)}" y2="${H - M.b}" stroke="#ffb74d" stroke-width="1" stroke-dasharray="4 4" opacity="0.7"/>`;
  entries.forEach((e, i) => {
    const y = M.t + rowH * (i + 0.5);
    const color = e.cls === "known" ? "#ffb74d" : e.cls === "theorem" ? "#81c784" : "#4fc3f7";
    if (e.cls === "hunt") {
      svg += `<rect x="${px(Math.max(0, e.value - nullSd))}" y="${y - 4}" width="${px(e.value + nullSd) - px(Math.max(0, e.value - nullSd))}" height="8" fill="${color}" opacity="0.25"/>`;
    }
    svg += `<circle cx="${px(e.value)}" cy="${y}" r="4.5" fill="${color}"/>`;
    svg += `<text x="${M.l - 6}" y="${y + 4}" fill="${fg}" font-size="11" text-anchor="end">${e.label}</text>`;
    svg += `<text x="${px(e.value) + 8}" y="${y + 4}" fill="#8b94ab" font-size="10">${e.value?.toFixed(3)}</text>`;
  });
  svg += `<text x="${(M.l + W - M.r) / 2}" y="${H - 12}" fill="#aab3c8" font-size="12" text-anchor="middle">cancellation exponent theta</text>`;
  svg += "</svg>";
  fs.writeFileSync(path.join(dir, "exponent-dashboard.svg"), svg);
}

// --- 3. M-S variance curve ----------------------------------------------------

{
  const rows = row3.summary;
  const xs = rows.map((r) => r.logXoverH);
  const x0 = Math.min(...xs) - 0.3;
  const x1 = Math.max(...xs) + 0.3;
  const yMax = Math.max(...rows.map((r) => Math.max(r.realVoverH, r.cramerMean + r.cramerSd, r.msPredicted))) + 1;
  let svg = svgOpen(
    `The shape of criticality - short-interval variance at X=10^7`,
    `V(X,H)/H for psi-increments. Real primes track the Montgomery-Soundararajan line (slope 1 in log(X/H), zero-repulsion rigidity); Cramer twins are flat - no zeta anywhere in the computation.`,
  );
  const { s, px, py } = axes(x0, x1, 0, yMax, "log(X/H)", "V(X,H) / H", [5, 6, 7, 8, 9, 10, 11], [0, 3, 6, 9, 12, 15], (v) => v, (v) => v);
  svg += s;
  svg += polyline(rows.map((r) => [px(r.logXoverH), py(r.msPredicted)]), "#ffb74d", 1.4, "5 4");
  svg += `<text x="${px(rows[2].logXoverH)}" y="${py(rows[2].msPredicted) + 18}" fill="#ffb74d" font-size="11">M-S: log(X/H) - gamma - log 2pi</text>`;
  const bandTop = rows.map((r) => [px(r.logXoverH), py(r.cramerMean + r.cramerSd)]);
  const bandBot = rows.map((r) => [px(r.logXoverH), py(r.cramerMean - r.cramerSd)]).reverse();
  svg += `<path d="M ${[...bandTop, ...bandBot].map(([x, y]) => `${x} ${y}`).join(" L ")} Z" fill="#f06292" opacity="0.25"/>`;
  svg += polyline(rows.map((r) => [px(r.logXoverH), py(r.cramerMean)]), "#f06292", 1.4);
  svg += `<text x="${px(rows[5].logXoverH)}" y="${py(rows[5].cramerMean) - 8}" fill="#f06292" font-size="11">Cramer twins (flat)</text>`;
  svg += polyline(rows.map((r) => [px(r.logXoverH), py(r.realVoverH)]), "#4fc3f7", 2);
  for (const r of rows) svg += `<circle cx="${px(r.logXoverH)}" cy="${py(r.realVoverH)}" r="3.5" fill="#4fc3f7"/>`;
  svg += `<text x="${px(rows[3].logXoverH)}" y="${py(rows[3].realVoverH) - 10}" fill="#4fc3f7" font-size="11">real primes</text>`;
  svg += "</svg>";
  fs.writeFileSync(path.join(dir, "ms-variance-curve.svg"), svg);
}

console.log("wrote spectrum-panel.svg, exponent-dashboard.svg, ms-variance-curve.svg");
