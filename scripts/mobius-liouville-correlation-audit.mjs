#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  buildPolynomialUniverse,
  polyAdd,
  polynomialLiouvilleTables,
} from "../src/core/ffield.js";
import { liouvilleUpTo, mobiusUpTo } from "../src/core/math.js";

const maxN = Math.max(200_000, Number.parseInt(process.argv[2] || "4000000", 10));
const outDir = process.argv[3] || "logs/two-universes-protocol";
const q2MaxDegree = Number.parseInt(process.argv[4] || "22", 10);
const q3MaxDegree = Number.parseInt(process.argv[5] || "13", 10);
const q5MaxDegree = Number.parseInt(process.argv[6] || "8", 10);

const shifts = [1, 2, 3, 4, 5, 6, 7, 8];
const maxShift = Math.max(...shifts);
const seeds = [12345, 271828, 314159];
const requiredIntegerEndpoints = [1_000_000, 2_000_000, 4_000_000, 8_000_000];
const endpoints = requiredIntegerEndpoints.filter((n) => n <= maxN);

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

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
}

function range(values) {
  const finite = values.filter(Number.isFinite);
  return finite.length ? [Math.min(...finite), Math.max(...finite)] : [NaN, NaN];
}

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "NA";
}

function energy(values) {
  return Math.sqrt(mean(values.map((value) => value * value)));
}

function maxAbs(values) {
  return Math.max(...values.map((value) => Math.abs(value)));
}

function linearSlope(rows, key, xKey) {
  const usable = rows.filter((row) => row[key] > 0 && row[xKey] > 1);
  if (usable.length < 2) return NaN;
  const xs = usable.map((row) => Math.log(row[xKey]));
  const ys = usable.map((row) => Math.log(row[key]));
  const mx = mean(xs), my = mean(ys);
  let num = 0, den = 0;
  for (let i = 0; i < xs.length; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  return den ? num / den : NaN;
}

function cosine(a, b) {
  let dot = 0, aa = 0, bb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    aa += a[i] * a[i];
    bb += b[i] * b[i];
  }
  return dot / Math.sqrt((aa || 1) * (bb || 1));
}

function consecutiveStability(rows) {
  if (rows.length < 2) return NaN;
  const values = [];
  for (let i = 1; i < rows.length; i++) values.push(cosine(rows[i - 1].normalized, rows[i].normalized));
  return mean(values);
}

function summarizeRows(rows, xKey) {
  return {
    energySlope: linearSlope(rows, "energy", xKey),
    maxAbsSlope: linearSlope(rows, "maxAbsCell", xKey),
    stability: consecutiveStability(rows),
  };
}

function summarizeControls(controls) {
  const finalRows = controls.map((control) => control.rows.at(-1));
  return {
    energyRange: range(finalRows.map((row) => row.energy)),
    maxAbsRange: range(finalRows.map((row) => row.maxAbsCell)),
    energySlopeRange: range(controls.map((control) => control.summary.energySlope)),
    stabilityRange: range(controls.map((control) => control.summary.stability)),
  };
}

function summarizeSequence(name, values) {
  const sums = new Float64Array(shifts.length);
  const recorded = endpoints.map(() => new Float64Array(shifts.length));
  let endpointIndex = 0;
  const finalEndpoint = endpoints.at(-1) || Math.min(maxN, values.length - maxShift - 1);
  for (let n = 1; n <= finalEndpoint - maxShift; n++) {
    for (let i = 0; i < shifts.length; i++) sums[i] += (values[n] || 0) * (values[n + shifts[i]] || 0);
    while (endpointIndex < endpoints.length && n === endpoints[endpointIndex] - maxShift) {
      recorded[endpointIndex].set(sums);
      endpointIndex++;
    }
  }
  const rows = endpoints.map((endpoint, i) => {
    const labels = Math.max(1, endpoint - maxShift);
    const normalized = Array.from(recorded[i], (sum) => sum / Math.sqrt(labels));
    return {
      N: endpoint,
      labels,
      sums: Array.from(recorded[i]),
      normalized,
      energy: energy(normalized),
      maxAbsCell: maxAbs(normalized),
      positiveFraction: normalized.filter((value) => value > 0).length / normalized.length,
    };
  });
  const blocks = rows.map((row, i) => {
    const previous = i ? rows[i - 1] : null;
    const lo = previous ? previous.N : 1;
    const labels = previous ? row.labels - previous.labels : row.labels;
    const sums = row.sums.map((sum, j) => sum - (previous ? previous.sums[j] : 0));
    const normalized = sums.map((sum) => sum / Math.sqrt(Math.max(1, labels)));
    return {
      lo,
      hi: row.N,
      labels,
      sums,
      normalized,
      energy: energy(normalized),
      maxAbsCell: maxAbs(normalized),
      positiveFraction: normalized.filter((value) => value > 0).length / normalized.length,
    };
  });
  return {
    name,
    rows,
    blocks,
    summary: summarizeRows(rows, "labels"),
  };
}

function randomSquarefreeSigns(mu, seed) {
  const random = rng(seed);
  const out = new Int8Array(mu.length);
  for (let i = 1; i < mu.length; i++) {
    if (mu[i] !== 0) out[i] = random() < 0.5 ? -1 : 1;
  }
  return out;
}

function randomCompletelyMultiplicativeSigns(nMax, seed) {
  const random = rng(seed);
  const values = new Int8Array(nMax + 1);
  const spf = new Int32Array(nMax + 1);
  const primes = [];
  values[1] = 1;
  for (let i = 2; i <= nMax; i++) {
    if (!spf[i]) {
      spf[i] = i;
      primes.push(i);
      values[i] = random() < 0.5 ? -1 : 1;
    }
    for (let k = 0; k < primes.length; k++) {
      const p = primes[k];
      const m = i * p;
      if (m > nMax || p > spf[i]) break;
      spf[m] = p;
      values[m] = values[i] * values[p];
      if (i % p === 0) break;
    }
  }
  return values;
}

function shuffledSigns(values, seed) {
  const random = rng(seed);
  const out = new Int8Array(values);
  for (let i = out.length - 1; i >= 2; i--) {
    const j = 1 + Math.floor(random() * i);
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

function integerAudit() {
  const nMax = maxN + maxShift + 1;
  console.error(`[mobius-liouville] integer mu/lambda to ${nMax}`);
  const mu = mobiusUpTo(nMax);
  const lambda = liouvilleUpTo(nMax);
  const mobius = summarizeSequence("Z-mobius", mu);
  const liouville = summarizeSequence("Z-liouville", lambda);
  const mobiusControls = {
    randomSquarefree: seeds.map((seed) => summarizeSequence(`random-squarefree-${seed}`, randomSquarefreeSigns(mu, seed))),
    shuffled: seeds.map((seed) => summarizeSequence(`shuffled-mobius-${seed}`, shuffledSigns(mu, seed))),
  };
  const liouvilleControls = {
    randomMultiplicative: seeds.map((seed) => summarizeSequence(`random-multiplicative-${seed}`, randomCompletelyMultiplicativeSigns(nMax, seed))),
    shuffled: seeds.map((seed) => summarizeSequence(`shuffled-liouville-${seed}`, shuffledSigns(lambda, seed))),
  };
  return {
    endpoints,
    shifts,
    mobius,
    liouville,
    controls: {
      mobius: Object.fromEntries(Object.entries(mobiusControls).map(([k, rows]) => [k, summarizeControls(rows)])),
      liouville: Object.fromEntries(Object.entries(liouvilleControls).map(([k, rows]) => [k, summarizeControls(rows)])),
    },
  };
}

function degreeLadder(maxDegree) {
  const start = Math.max(2, maxDegree - 2);
  const out = [];
  for (let d = start; d <= maxDegree; d++) out.push(d);
  return out;
}

function lowPolynomialShifts(q) {
  const out = [];
  for (let h = 1; out.length < shifts.length; h++) out.push(h);
  return out;
}

function twoPointRows(q, universe, tables, polynomialShifts, degrees, label) {
  const rows = [];
  for (const degree of degrees) {
    const lead = universe.pow[degree];
    const size = universe.pow[degree];
    const values = tables[degree];
    const sums = polynomialShifts.map((shift) => {
      let sum = 0;
      for (let lower = 0; lower < size; lower++) {
        const mate = polyAdd(lead + lower, shift, q);
        const mateLower = mate - lead;
        sum += values[lower] * (mateLower >= 0 && mateLower < size ? values[mateLower] : 0);
      }
      return sum;
    });
    const normalized = sums.map((sum) => sum / Math.sqrt(size));
    rows.push({
      q,
      degree,
      labels: size,
      sums,
      normalized,
      energy: energy(normalized),
      maxAbsCell: maxAbs(normalized),
      positiveFraction: normalized.filter((value) => value > 0).length / normalized.length,
    });
  }
  return {
    name: label,
    rows,
    summary: summarizeRows(rows, "labels"),
  };
}

function randomTablesLike(universe, mode, seed) {
  const random = rng(seed);
  const tables = Array.from({ length: universe.maxDegree + 1 }, (_, degree) => new Int8Array(universe.pow[degree] || 1));
  tables[0][0] = 1;
  for (let degree = 1; degree <= universe.maxDegree; degree++) {
    const source = mode === "mobius" ? universe.muByDegree[degree] : null;
    for (let lower = 0; lower < tables[degree].length; lower++) {
      if (mode === "mobius" && source[lower] === 0) {
        tables[degree][lower] = 0;
      } else {
        tables[degree][lower] = random() < 0.5 ? -1 : 1;
      }
    }
  }
  return tables;
}

function fieldAudit(q, maxDegree) {
  console.error(`[mobius-liouville] F_${q}[t] degree ${maxDegree}`);
  const universe = buildPolynomialUniverse(q, maxDegree);
  const degrees = degreeLadder(maxDegree);
  const polynomialShifts = lowPolynomialShifts(q);
  const mobius = twoPointRows(q, universe, universe.muByDegree, polynomialShifts, degrees, `F_${q}-mobius`);
  const lambdaTables = polynomialLiouvilleTables(universe);
  const liouville = twoPointRows(q, universe, lambdaTables, polynomialShifts, degrees, `F_${q}-liouville`);
  const mobiusControls = seeds.map((seed) => twoPointRows(q, universe, randomTablesLike(universe, "mobius", seed), polynomialShifts, [maxDegree], `F_${q}-random-mobius-${seed}`));
  const liouvilleControls = seeds.map((seed) => twoPointRows(q, universe, randomTablesLike(universe, "liouville", seed), polynomialShifts, [maxDegree], `F_${q}-random-liouville-${seed}`));
  return {
    q,
    maxDegree,
    degrees,
    shifts: polynomialShifts,
    mobius,
    liouville,
    controls: {
      mobius: { randomDegreePreserving: summarizeControls(mobiusControls) },
      liouville: { randomDegreePreserving: summarizeControls(liouvilleControls) },
    },
  };
}

function objectSummary(label, real, controlGroups) {
  const final = real.rows.at(-1);
  const controlRanges = Object.fromEntries(Object.entries(controlGroups).map(([k, v]) => [k, v.energyRange]));
  const maxControlEnergy = Math.max(...Object.values(controlRanges).map((r) => r[1]).filter(Number.isFinite));
  return {
    label,
    finalEnergy: final.energy,
    finalMaxAbsCell: final.maxAbsCell,
    energySlope: real.summary.energySlope,
    stability: real.summary.stability,
    controlRanges,
    beatsControls: final.energy > maxControlEnergy,
  };
}

function summarizeResult(integer, fields) {
  const integerObjects = [
    objectSummary("Z-mobius", integer.mobius, integer.controls.mobius),
    objectSummary("Z-liouville", integer.liouville, integer.controls.liouville),
  ];
  const fieldObjects = fields.flatMap((field) => [
    objectSummary(`F_${field.q}-mobius`, field.mobius, field.controls.mobius),
    objectSummary(`F_${field.q}-liouville`, field.liouville, field.controls.liouville),
  ]);
  const allObjects = [...integerObjects, ...fieldObjects];
  return {
    hasRequiredIntegerScaleLadder: requiredIntegerEndpoints.every((n) => endpoints.includes(n)),
    integerObjects,
    fieldObjects,
    anySharedControlBeatingLaw: integerObjects.some((integerObject) => integerObject.beatsControls)
      && fields.every((field) => {
        const mobius = fieldObjects.find((item) => item.label === `F_${field.q}-mobius`);
        const liouville = fieldObjects.find((item) => item.label === `F_${field.q}-liouville`);
        return mobius.beatsControls || liouville.beatsControls;
      }),
    allObjectsWithinControls: allObjects.every((item) => !item.beatsControls),
    maxEnergy: Math.max(...allObjects.map((item) => item.finalEnergy)),
  };
}

function renderRows(rows, firstKey) {
  return rows.map((row) => `| ${row[firstKey]} | ${row.labels} | ${fmt(row.energy)} | ${fmt(row.maxAbsCell)} | ${fmt(row.positiveFraction)} | ${row.normalized.map((v) => fmt(v, 3)).join(", ")} |`).join("\n");
}

function renderObjectSummary(rows) {
  return rows.map((row) => `| ${row.label} | ${fmt(row.finalEnergy)} | ${fmt(row.finalMaxAbsCell)} | ${fmt(row.energySlope)} | ${fmt(row.stability)} | ${Object.entries(row.controlRanges).map(([k, r]) => `${k}:${fmt(r[0])}..${fmt(r[1])}`).join("; ")} | ${row.beatsControls} |`).join("\n");
}

function renderMarkdown(report) {
  const lines = [];
  lines.push("# Mobius/Liouville matched-correlation audit", "");
  lines.push("Candidate:");
  lines.push("compare square-root-normalized fixed-lag two-point correlations for Mobius and Liouville signs across Z and F_q[t].", "");
  lines.push("```text");
  lines.push("C_f(X,h) = sum_{a <= X} f(a) f(a+h) / sqrt(X)");
  lines.push("energy_f(X) = sqrt(mean_h C_f(X,h)^2), h=1..8");
  lines.push("```", "");
  lines.push(`Integer endpoints: ${report.integer.endpoints.join(", ")}. Control seeds: ${seeds.length}.`, "");
  lines.push("## Promotion-relevant summary", "");
  lines.push("| object | final energy | final max cell | energy slope | profile stability | control energy ranges | beats controls |");
  lines.push("| --- | ---: | ---: | ---: | ---: | --- | --- |");
  lines.push(renderObjectSummary([...report.summary.integerObjects, ...report.summary.fieldObjects]));
  lines.push("");
  lines.push("## Integer Mobius", "");
  lines.push("| N | labels | energy | maxAbs cell | positive frac | normalized cells h=1..8 |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | --- |");
  lines.push(renderRows(report.integer.mobius.rows, "N"));
  lines.push("");
  lines.push("## Integer Liouville", "");
  lines.push("| N | labels | energy | maxAbs cell | positive frac | normalized cells h=1..8 |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | --- |");
  lines.push(renderRows(report.integer.liouville.rows, "N"));
  for (const field of report.fields) {
    lines.push("", `## F_${field.q}[t] Mobius`, "");
    lines.push("| degree | monics | energy | maxAbs cell | positive frac | normalized cells h=1..8 |");
    lines.push("| ---: | ---: | ---: | ---: | ---: | --- |");
    lines.push(renderRows(field.mobius.rows, "degree"));
    lines.push("", `## F_${field.q}[t] Liouville`, "");
    lines.push("| degree | monics | energy | maxAbs cell | positive frac | normalized cells h=1..8 |");
    lines.push("| ---: | ---: | ---: | ---: | ---: | --- |");
    lines.push(renderRows(field.liouville.rows, "degree"));
  }
  lines.push("", `JSON: \`${report.paths.json}\``);
  lines.push(`SVG: \`${report.paths.svg}\``);
  return `${lines.join("\n")}\n`;
}

function linePath(values, x, y, w, h, minY, maxY) {
  const sx = (i) => x + (i / Math.max(1, values.length - 1)) * w;
  const sy = (value) => y + h - ((value - minY) / (maxY - minY || 1)) * h;
  return values.map((value, i) => `${i ? "L" : "M"} ${sx(i).toFixed(2)} ${sy(value).toFixed(2)}`).join(" ");
}

function renderSvg(report) {
  const series = [
    { name: "Z mu", rows: report.integer.mobius.rows, color: "#67e8f9" },
    { name: "Z lambda", rows: report.integer.liouville.rows, color: "#a78bfa" },
    ...report.fields.flatMap((field) => [
      { name: `F_${field.q} mu`, rows: field.mobius.rows, color: field.q === 2 ? "#fbbf24" : field.q === 3 ? "#34d399" : "#fb7185" },
      { name: `F_${field.q} lambda`, rows: field.liouville.rows, color: field.q === 2 ? "#fde68a" : field.q === 3 ? "#86efac" : "#fda4af" },
    ]),
  ];
  const width = 1180, height = 680, pad = 78;
  const maxY = Math.max(1, ...series.flatMap((s) => s.rows.map((row) => row.energy))) * 1.12;
  const paths = series.map((s) => `<path d="${linePath(s.rows.map((row) => row.energy), pad, 86, width - 2 * pad, 410, 0, maxY)}" fill="none" stroke="${s.color}" stroke-width="2.5"/>`).join("\n");
  const legend = series.map((s, i) => `<text x="${pad + (i % 4) * 210}" y="${530 + Math.floor(i / 4) * 20}" fill="${s.color}" font-size="12">${s.name}</text>`).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="${width}" height="${height}" fill="#07111f"/>
<g font-family="Menlo, Consolas, monospace">
<text x="${pad}" y="38" fill="#f8fafc" font-size="20" font-weight="700">Mobius/Liouville matched-correlation energy</text>
<text x="${pad}" y="61" fill="#94a3b8" font-size="13">square-root-normalized fixed-lag energy, h=1..8</text>
<rect x="${pad}" y="86" width="${width - 2 * pad}" height="410" fill="none" stroke="#334155"/>
${paths}
${legend}
</g>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
const integer = integerAudit();
const fields = [
  fieldAudit(2, q2MaxDegree),
  fieldAudit(3, q3MaxDegree),
  fieldAudit(5, q5MaxDegree),
];
const summary = summarizeResult(integer, fields);
const base = `cycle-008-mobius-liouville-correlation-${maxN}`;
const paths = {
  json: path.join(outDir, `${base}.json`),
  md: path.join(outDir, `${base}.md`),
  svg: path.join(outDir, `${base}.svg`),
};
const report = {
  candidate: "Mobius/Liouville matched fixed-lag correlations",
  generatedAt: new Date().toISOString(),
  maxN,
  q2MaxDegree,
  q3MaxDegree,
  q5MaxDegree,
  shifts,
  seeds,
  requiredIntegerEndpoints,
  integer,
  fields,
  summary,
  paths,
};
fs.writeFileSync(paths.json, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(paths.md, renderMarkdown(report));
fs.writeFileSync(paths.svg, renderSvg(report));

console.log(JSON.stringify({
  ok: true,
  candidate: report.candidate,
  hasRequiredIntegerScaleLadder: summary.hasRequiredIntegerScaleLadder,
  allObjectsWithinControls: summary.allObjectsWithinControls,
  anySharedControlBeatingLaw: summary.anySharedControlBeatingLaw,
  integer: summary.integerObjects,
  fields: summary.fieldObjects,
  paths,
}, null, 2));
