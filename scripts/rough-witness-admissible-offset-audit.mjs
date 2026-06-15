#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { cramerPrimes, primesUpTo, roughIntervalWitnesses, rowVisibleValue, sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 4_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const backgroundPerWidth = Number(process.argv[4] || 4000);
const checkpoints = Number(process.argv[5] || 64);

const seeds = [12345, 271828, 314159, 161803, 424242];
const endpoints = [N / 16, N / 8, N / 4, N / 2, N].map((x) => Math.max(200_000, Math.round(x)));
const eventLimit = Math.ceil(N + Math.max(10_000, 30 * Math.log(N) ** 2));

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gcd(a, b) {
  let x = Math.abs(a), y = Math.abs(b);
  while (y) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

function phiSmall(n) {
  let out = n, m = n;
  for (let p = 2; p * p <= m; p++) {
    if (m % p !== 0) continue;
    out -= Math.floor(out / p);
    while (m % p === 0) m = Math.floor(m / p);
  }
  if (m > 1) out -= Math.floor(out / m);
  return out;
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / (values.length || 1);
}

function rms(values) {
  return Math.sqrt(mean(values.map((value) => value * value)));
}

function range(values) {
  return [Math.min(...values), Math.max(...values)];
}

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "nan";
}

function linearFit(xs, ys) {
  const mx = mean(xs), my = mean(ys);
  let sxx = 0, sxy = 0;
  for (let i = 0; i < xs.length; i++) {
    const dx = xs[i] - mx;
    sxx += dx * dx;
    sxy += dx * (ys[i] - my);
  }
  const slope = sxy / (sxx || 1);
  return { slope, intercept: my - slope * mx };
}

function exponent(rows, valueKey, scaleKey = "gaps") {
  const usable = rows
    .map((row) => ({ x: row[scaleKey], y: Math.abs(row.real[valueKey]) }))
    .filter((row) => row.x > 1 && row.y > 0);
  if (usable.length < 2) return 0;
  return linearFit(usable.map((row) => Math.log(row.x)), usable.map((row) => Math.log(row.y))).slope;
}

function roughFirstFeature(start, width) {
  const h = Math.max(1, Math.floor(width));
  const firstOffset = roughIntervalWitnesses(start, h).firstOffset;
  return {
    firstOffset,
    feature: firstOffset ? firstOffset / h : 1,
    exception: firstOffset ? 0 : 1,
  };
}

function endpointAdmissible(start, width) {
  const y = Math.max(1, Math.floor(width) - 1);
  return rowVisibleValue(start, y) === 1 && rowVisibleValue(start + width, y) === 1;
}

function wheelRandomLabels(W, seed, primeFlags, compositeOnly = false) {
  const phiW = phiSmall(W);
  const scale = W / phiW;
  const random = rng(seed);
  const out = [];
  for (let n = 5; n <= eventLimit; n++) {
    if (gcd(n, W) !== 1) continue;
    if (compositeOnly && primeFlags[n]) continue;
    if (random() < Math.min(1, scale / Math.log(n))) out.push(n);
  }
  return out;
}

function collectWidths(labelGroups) {
  const widths = new Set();
  let maxGap = 0;
  for (const labels of labelGroups) {
    for (let i = 0; i + 1 < labels.length; i++) {
      const start = labels[i];
      if (start < 3) continue;
      if (start > N) break;
      const width = labels[i + 1] - start;
      if (width < 2) continue;
      widths.add(width);
      maxGap = Math.max(maxGap, width);
    }
  }
  return { widths: [...widths].sort((a, b) => a - b), maxGap };
}

function buildAdmissibleBaselines(widths) {
  console.error(`[rough-admissible] background for ${widths.length} widths with ${backgroundPerWidth} accepted samples each`);
  const random = rng(0xad1551b1e);
  const stats = new Map();
  for (const width of widths) {
    let sum = 0, sumSq = 0, exceptions = 0, accepted = 0, tries = 0;
    const maxStart = Math.max(5, eventLimit - width - 1);
    const maxTries = Math.max(20_000, backgroundPerWidth * 2000);
    while (accepted < backgroundPerWidth && tries < maxTries) {
      tries++;
      const start = 5 + Math.floor(random() * Math.max(1, maxStart - 4));
      if (!endpointAdmissible(start, width)) continue;
      const row = roughFirstFeature(start, width);
      accepted++;
      sum += row.feature;
      sumSq += row.feature * row.feature;
      exceptions += row.exception;
    }
    if (accepted < Math.min(200, backgroundPerWidth / 4)) {
      console.error(`[rough-admissible] weak baseline for g=${width}: accepted=${accepted}, tries=${tries}`);
      continue;
    }
    const mu = sum / accepted;
    let sd = Math.sqrt(Math.max(0, sumSq / accepted - mu * mu));
    const degenerate = sd < 1e-9;
    if (degenerate) sd = 1;
    stats.set(width, {
      width,
      count: accepted,
      tries,
      acceptanceRate: accepted / tries,
      mean: mu,
      sd,
      degenerate,
      exceptionRate: exceptions / accepted,
    });
  }
  return stats;
}

function prefixBridge(zs) {
  const n = zs.length;
  if (!n) return { bridgeQ: 0, bridgeMax: 0, terminalZ: 0, bridge: [] };
  const prefix = new Float64Array(n + 1);
  for (let i = 0; i < n; i++) prefix[i + 1] = prefix[i] + zs[i];
  const total = prefix[n];
  const scale = Math.sqrt(n);
  const k = Math.min(checkpoints, n);
  const bridge = [];
  for (let j = 1; j <= k; j++) {
    const idx = Math.max(1, Math.min(n, Math.round(n * j / k)));
    const t = idx / n;
    bridge.push((prefix[idx] - t * total) / scale);
  }
  return {
    bridgeQ: rms(bridge),
    bridgeMax: Math.max(...bridge.map((value) => Math.abs(value)), 0),
    terminalZ: total / scale,
    bridge,
  };
}

function scoreLabels(name, labels, limit, baselines) {
  const zs = [];
  const byWidth = new Map();
  let featureSum = 0, exceptionCount = 0, sumSq = 0, gaps = 0, scored = 0, endpointMisses = 0;
  for (let i = 0; i + 1 < labels.length; i++) {
    const start = labels[i];
    if (start < 3) continue;
    if (start > limit) break;
    const width = labels[i + 1] - start;
    gaps++;
    const stat = baselines.get(width);
    if (!stat) continue;
    if (!endpointAdmissible(start, width)) {
      endpointMisses++;
      continue;
    }
    const row = roughFirstFeature(start, width);
    const z = (row.feature - stat.mean) / stat.sd;
    zs.push(z);
    scored++;
    featureSum += row.feature;
    exceptionCount += row.exception;
    sumSq += z * z;
    const widthRow = byWidth.get(width) || { width, count: 0, sumZ: 0, exceptionCount: 0, featureSum: 0 };
    widthRow.count++;
    widthRow.sumZ += z;
    widthRow.exceptionCount += row.exception;
    widthRow.featureSum += row.feature;
    byWidth.set(width, widthRow);
  }
  const bridge = prefixBridge(zs);
  const topWidths = [...byWidth.values()]
    .map((row) => ({
      ...row,
      aggregateZ: row.sumZ / Math.sqrt(row.count || 1),
      meanZ: row.sumZ / (row.count || 1),
      meanFeature: row.featureSum / (row.count || 1),
      exceptionRate: row.exceptionCount / (row.count || 1),
    }))
    .sort((a, b) => Math.abs(b.aggregateZ) - Math.abs(a.aggregateZ))
    .slice(0, 10);
  return {
    name,
    gaps,
    scored,
    endpointMisses,
    meanFeature: featureSum / Math.max(1, scored),
    exceptionRate: exceptionCount / Math.max(1, scored),
    rmsZ: Math.sqrt(sumSq / Math.max(1, scored)),
    ...bridge,
    topWidths,
  };
}

function summarizeControls(controls) {
  return {
    bridgeQ: range(controls.map((row) => row.bridgeQ)),
    bridgeMax: range(controls.map((row) => row.bridgeMax)),
    terminalZ: range(controls.map((row) => row.terminalZ)),
    rmsZ: range(controls.map((row) => row.rmsZ)),
    meanFeature: range(controls.map((row) => row.meanFeature)),
    exceptionRate: range(controls.map((row) => row.exceptionRate)),
    scored: range(controls.map((row) => row.scored)),
    endpointMisses: range(controls.map((row) => row.endpointMisses)),
  };
}

function auditInteger() {
  console.error(`[rough-admissible] labels to ${eventLimit}`);
  const primeFlags = sieve(eventLimit);
  const realLabels = primesUpTo(eventLimit);
  const cramerLabels = seeds.map((seed) => cramerPrimes(eventLimit, seed));
  const wheel210Labels = seeds.map((seed) => wheelRandomLabels(210, seed, primeFlags, false));
  const wheel2310Labels = seeds.map((seed) => wheelRandomLabels(2310, seed, primeFlags, false));
  const compositeLabels = seeds.map((seed) => wheelRandomLabels(210, seed, primeFlags, true));
  const { widths, maxGap } = collectWidths([
    realLabels,
    ...cramerLabels,
    ...wheel210Labels,
    ...wheel2310Labels,
    ...compositeLabels,
  ]);
  const baselines = buildAdmissibleBaselines(widths);
  const baselineRows = [...baselines.values()];
  const rows = [];
  for (const limit of endpoints) {
    console.error(`[rough-admissible] scoring N=${limit}`);
    const real = scoreLabels("real", realLabels, limit, baselines);
    const controls = {
      cramer: cramerLabels.map((labels, i) => scoreLabels(`cramer-${seeds[i]}`, labels, limit, baselines)),
      wheel210: wheel210Labels.map((labels, i) => scoreLabels(`wheel210-${seeds[i]}`, labels, limit, baselines)),
      wheel2310: wheel2310Labels.map((labels, i) => scoreLabels(`wheel2310-${seeds[i]}`, labels, limit, baselines)),
      composite210: compositeLabels.map((labels, i) => scoreLabels(`composite210-${seeds[i]}`, labels, limit, baselines)),
    };
    rows.push({
      N: limit,
      gaps: real.gaps,
      scored: real.scored,
      real,
      controls,
      summary: Object.fromEntries(Object.entries(controls).map(([key, value]) => [key, summarizeControls(value)])),
    });
  }
  return {
    eventLimit,
    endpoints,
    widths,
    maxGap,
    baselinesBuilt: baselines.size,
    degenerateWidths: baselineRows.filter((row) => row.degenerate).map((row) => row.width),
    weakMissingWidths: widths.filter((width) => !baselines.has(width)),
    baselinePreview: baselineRows.slice(0, 20),
    rows,
    theta: {
      bridgeQ: exponent(rows, "bridgeQ", "scored"),
      bridgeMax: exponent(rows, "bridgeMax", "scored"),
      terminalZ: exponent(rows, "terminalZ", "scored"),
    },
  };
}

function markdownReport(result) {
  const rows = result.integer.rows.map((row) => `| ${row.N} | ${row.gaps} | ${row.scored} | ${fmt(row.real.bridgeQ)} | ${fmt(row.real.bridgeMax)} | ${fmt(row.real.terminalZ)} | ${fmt(row.real.rmsZ)} | ${fmt(row.real.meanFeature)} | ${fmt(row.real.exceptionRate)} | ${fmt(row.summary.cramer.bridgeQ[0])}..${fmt(row.summary.cramer.bridgeQ[1])} | ${fmt(row.summary.wheel210.bridgeQ[0])}..${fmt(row.summary.wheel210.bridgeQ[1])} | ${fmt(row.summary.wheel2310.bridgeQ[0])}..${fmt(row.summary.wheel2310.bridgeQ[1])} | ${fmt(row.summary.composite210.bridgeQ[0])}..${fmt(row.summary.composite210.bridgeQ[1])} |`).join("\n");
  const terminalRows = result.integer.rows.map((row) => `| ${row.N} | ${fmt(row.real.terminalZ)} | ${fmt(row.summary.cramer.terminalZ[0])}..${fmt(row.summary.cramer.terminalZ[1])} | ${fmt(row.summary.wheel210.terminalZ[0])}..${fmt(row.summary.wheel210.terminalZ[1])} | ${fmt(row.summary.wheel2310.terminalZ[0])}..${fmt(row.summary.wheel2310.terminalZ[1])} | ${fmt(row.summary.composite210.terminalZ[0])}..${fmt(row.summary.composite210.terminalZ[1])} |`).join("\n");
  return `# admissible-endpoint rough-witness offset bridge audit

Candidate:
for each label gap, score the first rough witness offset divided by the gap
width, standardized against random starts with the same width and locally
admissible endpoints.

Integer event limit: \`${result.integer.eventLimit}\`; distinct gap widths:
\`${result.integer.widths.length}\`; baselines built:
\`${result.integer.baselinesBuilt}\`; max gap width: \`${result.integer.maxGap}\`.
Degenerate baseline widths: \`${result.integer.degenerateWidths.join(",") || "none"}\`.
Missing weak widths: \`${result.integer.weakMissingWidths.join(",") || "none"}\`.

Bridge theta: \`${fmt(result.integer.theta.bridgeQ)}\`; bridge-max theta:
\`${fmt(result.integer.theta.bridgeMax)}\`; terminal-z theta:
\`${fmt(result.integer.theta.terminalZ)}\`.

## Bridge stiffness

| N | gaps | scored | real Q | real max | real terminalZ | real rmsZ | mean first/g | exception rate | Cramer Q range | W210 Q range | W2310 Q range | composite W210 Q range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${rows}

## Terminal aggregate z

| N | real terminalZ | Cramer range | W210 range | W2310 range | composite W210 range |
| ---: | ---: | ---: | ---: | ---: | ---: |
${terminalRows}

Endpoint dominant real gap-width buckets:
${result.integer.rows.at(-1).real.topWidths.map((row) => `- g=${row.width}: n=${row.count}, aggregateZ=${fmt(row.aggregateZ)}, meanZ=${fmt(row.meanZ)}, meanFirst=${fmt(row.meanFeature)}, exceptions=${fmt(row.exceptionRate)}`).join("\n")}

SVG: \`${result.svgPath}\`
JSON: \`${result.jsonPath}\`
`;
}

function svgPlot(result) {
  const width = 1160, height = 640, pad = 70, plotW = 650, plotH = 420;
  const rows = result.integer.rows;
  const allY = rows.flatMap((row) => [
    row.real.bridgeQ,
    row.summary.cramer.bridgeQ[0],
    row.summary.cramer.bridgeQ[1],
    row.summary.wheel210.bridgeQ[0],
    row.summary.wheel210.bridgeQ[1],
    row.summary.wheel2310.bridgeQ[0],
    row.summary.wheel2310.bridgeQ[1],
    row.summary.composite210.bridgeQ[0],
    row.summary.composite210.bridgeQ[1],
  ]);
  const yMax = Math.max(...allY, 0.1) * 1.18;
  const x = (i) => pad + (i * plotW) / Math.max(1, rows.length - 1);
  const y = (value) => pad + plotH - (value / yMax) * plotH;
  const points = (values) => values.map((value, i) => `${x(i)},${y(value)}`).join(" ");
  const band = (key, color, opacity = 0.14) => {
    const top = rows.map((row) => row.summary[key].bridgeQ[1]);
    const bottom = rows.map((row) => row.summary[key].bridgeQ[0]);
    const d = [...top.map((value, i) => `${x(i)},${y(value)}`), ...bottom.map((value, i) => `${x(rows.length - 1 - i)},${y(value)}`)].join(" ");
    return `<polygon points="${d}" fill="${color}" opacity="${opacity}"/>`;
  };
  const endpoint = rows.at(-1).real.bridge;
  const bx = (i) => 80 + (i * 590) / Math.max(1, endpoint.length - 1);
  const bMax = Math.max(...endpoint.map(Math.abs), 0.1) * 1.2;
  const by = (value) => 585 - ((value + bMax) / (2 * bMax)) * 70;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#080d17"/>
<style>text { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; }</style>
<text x="70" y="32" fill="#e5e7eb" font-size="18" font-weight="700">Admissible-endpoint rough-witness offset bridge</text>
<text x="70" y="55" fill="#a8b3c7" font-size="13">first rough witness offset / gap width; baseline keeps same width and locally admissible endpoints</text>
<line x1="${pad}" x2="${pad + plotW}" y1="${pad + plotH}" y2="${pad + plotH}" stroke="#334155"/>
<line x1="${pad}" x2="${pad}" y1="${pad}" y2="${pad + plotH}" stroke="#334155"/>
${band("cramer", "#facc15")}
${band("wheel210", "#60a5fa", 0.12)}
${band("wheel2310", "#34d399", 0.12)}
${band("composite210", "#fb7185", 0.12)}
<polyline points="${points(rows.map((row) => row.real.bridgeQ))}" fill="none" stroke="#67e8f9" stroke-width="3"/>
${rows.map((row, i) => `<text x="${x(i) - 26}" y="${pad + plotH + 22}" fill="#94a3b8" font-size="11">${row.N / 1_000_000}M</text>`).join("\n")}
<line x1="80" x2="670" y1="${by(0)}" y2="${by(0)}" stroke="#334155"/>
<polyline points="${endpoint.map((value, i) => `${bx(i)},${by(value)}`).join(" ")}" fill="none" stroke="#67e8f9" stroke-width="2"/>
<text x="780" y="105" fill="#e5e7eb" font-size="14">endpoint</text>
<text x="780" y="132" fill="#67e8f9" font-size="13">real Q ${fmt(rows.at(-1).real.bridgeQ)}</text>
<text x="780" y="154" fill="#facc15" font-size="13">Cramer ${fmt(rows.at(-1).summary.cramer.bridgeQ[0])}..${fmt(rows.at(-1).summary.cramer.bridgeQ[1])}</text>
<text x="780" y="176" fill="#60a5fa" font-size="13">W210 ${fmt(rows.at(-1).summary.wheel210.bridgeQ[0])}..${fmt(rows.at(-1).summary.wheel210.bridgeQ[1])}</text>
<text x="780" y="198" fill="#34d399" font-size="13">W2310 ${fmt(rows.at(-1).summary.wheel2310.bridgeQ[0])}..${fmt(rows.at(-1).summary.wheel2310.bridgeQ[1])}</text>
<text x="780" y="220" fill="#fb7185" font-size="13">comp ${fmt(rows.at(-1).summary.composite210.bridgeQ[0])}..${fmt(rows.at(-1).summary.composite210.bridgeQ[1])}</text>
<text x="70" y="622" fill="#a8b3c7" font-size="12">bottom: endpoint real z-bridge path; cyan real; yellow Cramer; blue W210; green W2310; red composite-only</text>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
const basename = `rough-witness-admissible-offset-audit-${N}`;
const jsonPath = path.join(outDir, `${basename}.json`);
const mdPath = path.join(outDir, `${basename}.md`);
const svgPath = path.join(outDir, `${basename}.svg`);

const result = {
  candidate: "admissible-endpoint rough-witness offset bridge",
  generatedAt: new Date().toISOString(),
  N,
  backgroundPerWidth,
  checkpoints,
  seeds,
  integer: auditInteger(),
};
result.jsonPath = jsonPath;
result.mdPath = mdPath;
result.svgPath = svgPath;

fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2));
fs.writeFileSync(mdPath, markdownReport(result));
fs.writeFileSync(svgPath, svgPlot(result));

console.log(JSON.stringify({
  jsonPath,
  mdPath,
  svgPath,
  theta: result.integer.theta,
  endpoint: result.integer.rows.at(-1),
}, null, 2));
