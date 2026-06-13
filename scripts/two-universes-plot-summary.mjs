#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const outDir = process.argv[2] || "logs/two-universes-artifacts";
const calibrationFile = process.argv[3] || path.join(outDir, "calibration-summary.json");
const integerFile = process.argv[4] || path.join(outDir, "integer-extension-100000000.json");

const calibration = JSON.parse(fs.readFileSync(calibrationFile, "utf8"));
const integer = JSON.parse(fs.readFileSync(integerFile, "utf8"));

const SHIFT_MAP = new Map([
  ["1", "1"],
  ["2", "t"],
  ["3", "t+1"],
]);
const COLORS = { "1": "#38bdf8", "t": "#f59e0b", "t+1": "#a78bfa" };

function linePath(points, xScale, yScale) {
  return points.map((p, i) => `${i ? "L" : "M"}${xScale(p.x).toFixed(2)},${yScale(p.y).toFixed(2)}`).join(" ");
}

function circlePoints(points, xScale, yScale, color, radius = 3) {
  return points.map((p) => `<circle cx="${xScale(p.x).toFixed(2)}" cy="${yScale(p.y).toFixed(2)}" r="${radius}" fill="${color}"/>`).join("\n  ");
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function writeSvg(file) {
  const width = 1120, height = 680;
  const pad = { l: 68, r: 36, t: 48, b: 54 };
  const plotW = width - pad.l - pad.r;
  const topH = 290;
  const botY = 405;
  const botH = 210;
  const q = 3;
  const maxDegree = calibration.parameters.maxQ3;
  const intX = (N) => Math.log(N) / Math.log(q);
  const xMax = Math.max(maxDegree, ...integer.chowla.map((r) => intX(r.N))) + 0.25;
  const xScale = (x) => pad.l + ((x - 1) / (xMax - 1)) * plotW;
  const yChowla = (y) => {
    const v = clamp(y, 1e-4, 1);
    return pad.t + (Math.log10(1) - Math.log10(v)) / (Math.log10(1) - Math.log10(1e-4)) * topH;
  };
  const yTwin = (y) => botY + (1.18 - clamp(y, 0.82, 1.18)) / 0.36 * botH;

  const paths = [];
  for (const shift of ["1", "t", "t+1"]) {
    const color = COLORS[shift];
    const ffChowla = calibration.chowla
      .filter((r) => r.q === q && r.shift === shift && r.degree >= 2)
      .map((r) => ({ x: r.degree, y: Math.max(1e-4, Math.abs(r.value)) }));
    const zChowla = integer.chowla
      .filter((r) => SHIFT_MAP.get(r.shift) === shift)
      .map((r) => ({ x: intX(r.N), y: Math.max(1e-4, Math.abs(r.normalized)) }));
    if (ffChowla.length) paths.push(`<path d="${linePath(ffChowla, xScale, yChowla)}" fill="none" stroke="${color}" stroke-width="2"/>`);
    if (zChowla.length) paths.push(`<path d="${linePath(zChowla, xScale, yChowla)}" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="8 5"/>`);
    paths.push(circlePoints(zChowla, xScale, yChowla, color, 3.2));

    const ffTwins = calibration.polyTwins
      .filter((r) => r.q === q && r.shift === shift && r.ratio !== null && r.degree >= 2)
      .map((r) => ({ x: r.degree, y: r.ratio }));
    if (ffTwins.length) paths.push(`<path d="${linePath(ffTwins, xScale, yTwin)}" fill="none" stroke="${color}" stroke-width="2"/>`);
  }
  const zTwins = integer.twins.map((r) => ({ x: intX(r.N), y: r.ratio }));
  paths.push(`<path d="${linePath(zTwins, xScale, yTwin)}" fill="none" stroke="#e5e7eb" stroke-width="2" stroke-dasharray="8 5"/>`);
  paths.push(circlePoints(zTwins, xScale, yTwin, "#e5e7eb", 3.4));

  const degreeTicks = [1, 4, 8, 12, 15, 17].filter((x) => x <= xMax);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#08111f"/>
  <text x="${pad.l}" y="28" fill="#e5edf7" font-family="system-ui" font-size="18">Two-universes comparison: F_3[t] degree vs Z log_3(N)</text>
  <text x="${pad.l}" y="${pad.t - 10}" fill="#9fb0c4" font-family="ui-monospace" font-size="12">top: Chowla |average| / |log-weighted normalization|</text>
  <text x="${pad.l}" y="${botY - 16}" fill="#9fb0c4" font-family="ui-monospace" font-size="12">bottom: twin observed/predicted ratios</text>
  <line x1="${pad.l}" y1="${pad.t + topH}" x2="${width - pad.r}" y2="${pad.t + topH}" stroke="#243244"/>
  <line x1="${pad.l}" y1="${botY + botH / 2}" x2="${width - pad.r}" y2="${botY + botH / 2}" stroke="#243244" stroke-dasharray="4 5"/>
  ${degreeTicks.map((d) => `<line x1="${xScale(d)}" y1="${pad.t}" x2="${xScale(d)}" y2="${botY + botH}" stroke="#152133"/><text x="${xScale(d)}" y="${height - 20}" fill="#8091a8" font-family="ui-monospace" font-size="11" text-anchor="middle">${d}</text>`).join("")}
  <text x="${pad.l + plotW / 2}" y="${height - 6}" fill="#9fb0c4" font-family="ui-monospace" font-size="12" text-anchor="middle">degree n for F_3[t]; log_3(N) for Z</text>
  ${paths.join("\n  ")}
  ${["1", "t", "t+1"].map((s, i) => `<g transform="translate(${width - 260},${62 + i * 22})"><line x1="0" y1="0" x2="32" y2="0" stroke="${COLORS[s]}" stroke-width="2"/><text x="42" y="4" fill="#d8e2ee" font-family="ui-monospace" font-size="12">F_3 h=${s}; Z h=${s === "1" ? "1" : s === "t" ? "2" : "3"}</text></g>`).join("")}
  <g transform="translate(${width - 260},150)"><line x1="0" y1="0" x2="32" y2="0" stroke="#e5e7eb" stroke-width="2" stroke-dasharray="8 5"/><text x="42" y="4" fill="#d8e2ee" font-family="ui-monospace" font-size="12">Z twin ratio</text></g>
  <rect x="${width - 274}" y="178" width="242" height="54" rx="3" fill="#08111f" stroke="#243244"/>
  <text x="${width - 262}" y="198" fill="#9fb0c4" font-family="ui-monospace" font-size="11">solid = F_3[t]</text>
  <text x="${width - 262}" y="216" fill="#9fb0c4" font-family="ui-monospace" font-size="11">dashed + points = Z samples</text>
</svg>`;
  fs.writeFileSync(file, svg);
}

fs.mkdirSync(outDir, { recursive: true });
const svgFile = path.join(outDir, "two-universes-comparison.svg");
writeSvg(svgFile);
console.log(JSON.stringify({ ok: true, svgFile, calibrationFile, integerFile }, null, 2));
