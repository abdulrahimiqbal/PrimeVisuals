#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { buildPolynomialUniverse, polyAdd, polyDegree, polyMod, polySub, polyToString } from "../src/core/ffield.js";
import { cramerPrimes, primesUpTo, sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 16_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const moduli = (process.argv[4] || "30,210").split(",").map((x) => Number(x.trim())).filter(Boolean);
const q2MaxDegree = Number(process.argv[5] || 24);
const q3MaxDegree = Number(process.argv[6] || 15);
const binCount = Number(process.argv[7] || 4);
const q2ModulusDegree = Number(process.argv[8] || 3);
const q3ModulusDegree = Number(process.argv[9] || 2);

const seeds = [12345, 271828, 314159, 161803, 424242];
const scales = [N / 8, N / 4, N / 2, N].map((x) => Math.max(200_000, Math.round(x)));
const smoothing = 0.5;

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

function totient(n) {
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

function range(values) {
  return values.length ? [Math.min(...values), Math.max(...values)] : [NaN, NaN];
}

function upperBound(arr, x) {
  let lo = 0, hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (arr[mid] <= x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function valuesInRange(values, lo, hi) {
  const start = upperBound(values, lo);
  const out = [];
  for (let i = start; i < values.length && values[i] <= hi; i++) out.push(values[i]);
  return out;
}

function wheelRandomLabels(limit, W, seed, isp, compositeOnly = false) {
  const random = rng(seed);
  const densityFactor = W / totient(W);
  const out = [];
  for (let n = 5; n <= limit; n++) {
    if (gcd(n, W) !== 1) continue;
    if (compositeOnly && isp[n]) continue;
    if (random() < Math.min(1, densityFactor / Math.log(n))) out.push(n);
  }
  return out;
}

function integerMapper(modulus) {
  const residues = [];
  const map = new Map();
  for (let r = 0; r < modulus; r++) {
    if (gcd(r, modulus) !== 1) continue;
    map.set(r, residues.length);
    residues.push(r);
  }
  const validH = residues.map((residue) => {
    const hs = [];
    for (let h = 0; h < modulus; h++) {
      if (map.has((residue + h) % modulus)) hs.push(h);
    }
    return hs;
  });
  const validMask = validH.map((hs) => {
    const mask = new Uint8Array(modulus);
    for (const h of hs) mask[h] = 1;
    return mask;
  });
  return {
    kind: "integer",
    modulus,
    residues,
    stateCount: residues.length,
    gapCount: modulus,
    validH,
    validMask,
    state(value) {
      return map.get(((value % modulus) + modulus) % modulus) ?? -1;
    },
    gap(a, b) {
      return ((b - a) % modulus + modulus) % modulus;
    },
  };
}

function fieldMapper(q, modulus) {
  const degree = polyDegree(modulus, q);
  const norm = q ** degree;
  const residues = [];
  const map = new Map();
  for (let r = 1; r < norm; r++) {
    residues.push(r);
    map.set(r, residues.length - 1);
  }
  const validH = residues.map((residue) => {
    const hs = [];
    for (let h = 0; h < norm; h++) {
      const next = polyMod(polyAdd(residue, h, q), modulus, q);
      if (next !== 0) hs.push(h);
    }
    return hs;
  });
  const validMask = validH.map((hs) => {
    const mask = new Uint8Array(norm);
    for (const h of hs) mask[h] = 1;
    return mask;
  });
  return {
    kind: "field",
    q,
    modulus,
    norm,
    residues,
    stateCount: residues.length,
    gapCount: norm,
    validH,
    validMask,
    state(value) {
      return map.get(polyMod(value, modulus, q)) ?? -1;
    },
    gap(a, b) {
      return polyMod(polySub(b, a, q), modulus, q);
    },
  };
}

function integerTransitions(values, lo, hi, mapper) {
  const block = valuesInRange(values, lo, hi);
  const transitions = [];
  let invalid = 0;
  for (let i = 0; i + 1 < block.length; i++) {
    const a = mapper.state(block[i]);
    if (a < 0) continue;
    const gap = block[i + 1] - block[i];
    const h = mapper.gap(block[i], block[i + 1]);
    if (!mapper.validMask[a][h]) invalid++;
    transitions.push({ a, h, z: gap / Math.log(Math.max(block[i], 3)) });
  }
  return { transitions, invalid };
}

function fieldTransitions(values, mapper) {
  const transitions = [];
  let invalid = 0;
  for (let i = 0; i + 1 < values.length; i++) {
    const a = mapper.state(values[i]);
    if (a < 0) continue;
    const gapPoly = polySub(values[i + 1], values[i], mapper.q);
    const h = mapper.gap(values[i], values[i + 1]);
    if (!mapper.validMask[a][h]) invalid++;
    transitions.push({ a, h, z: polyDegree(gapPoly, mapper.q) });
  }
  return { transitions, invalid };
}

function quantileBreaks(transitions, bins) {
  if (bins <= 1 || transitions.length === 0) return [];
  const zs = transitions.map((t) => t.z).sort((a, b) => a - b);
  const breaks = [];
  for (let b = 1; b < bins; b++) {
    const index = Math.min(zs.length - 1, Math.floor((b * zs.length) / bins));
    breaks.push(zs[index]);
  }
  return breaks;
}

function binIndex(z, breaks) {
  return upperBound(breaks, z);
}

function buildGapModel(transitions, mapper, breaks) {
  const bins = breaks.length + 1;
  const contextCount = mapper.stateCount * bins;
  const counts = Array.from({ length: contextCount }, () => new Float64Array(mapper.gapCount));
  const sums = new Float64Array(contextCount);
  const seen = new Int32Array(contextCount);
  for (let a = 0; a < mapper.stateCount; a++) {
    for (let b = 0; b < bins; b++) {
      const c = a * bins + b;
      for (const h of mapper.validH[a]) counts[c][h] = smoothing;
      sums[c] = smoothing * mapper.validH[a].length;
    }
  }
  for (const t of transitions) {
    if (!mapper.validMask[t.a][t.h]) continue;
    const b = binIndex(t.z, breaks);
    const c = t.a * bins + b;
    counts[c][t.h]++;
    sums[c]++;
    seen[c]++;
  }
  return { counts, sums, seen, breaks, bins };
}

function scoreGapModel(transitions, mapper, model) {
  if (!transitions.length) return null;
  let observed = 0;
  let baseline = 0;
  let unseen = 0;
  let invalid = 0;
  for (const t of transitions) {
    if (!mapper.validMask[t.a][t.h]) {
      invalid++;
      continue;
    }
    const b = binIndex(t.z, model.breaks);
    const c = t.a * model.bins + b;
    observed += Math.log(model.counts[c][t.h] / model.sums[c]);
    baseline -= Math.log(mapper.validH[t.a].length);
    if (!model.seen[c]) unseen++;
  }
  const scored = transitions.length - invalid;
  if (!scored) return null;
  return {
    transitions: transitions.length,
    scoredTransitions: scored,
    observed: observed / scored,
    validBaseline: baseline / scored,
    advantage: (observed - baseline) / scored,
    aggregate: ((observed - baseline) / scored) * Math.sqrt(scored),
    unseenContexts: unseen,
    unseenContextRate: unseen / scored,
    invalidTargets: invalid,
    invalidTargetRate: invalid / transitions.length,
  };
}

function auditTransitions(train, test, mapper) {
  if (train.length < 8 || test.length < 8) return null;
  const stateBreaks = [];
  const sizeBreaks = quantileBreaks(train, binCount);
  const stateModel = buildGapModel(train, mapper, stateBreaks);
  const sizeModel = buildGapModel(train, mapper, sizeBreaks);
  const state = scoreGapModel(test, mapper, stateModel);
  const size = scoreGapModel(test, mapper, sizeModel);
  if (!state || !size) return null;
  const incrementalMean = size.observed - state.observed;
  return {
    trainTransitions: train.length,
    testTransitions: test.length,
    binCount,
    binBreaks: sizeBreaks,
    stateObserved: state.observed,
    stateBaseline: state.validBaseline,
    stateAdvantage: state.advantage,
    stateAggregate: state.aggregate,
    binObserved: size.observed,
    binBaseline: size.validBaseline,
    binAdvantage: size.advantage,
    binAggregate: size.aggregate,
    incrementalMean,
    incrementalAggregate: incrementalMean * Math.sqrt(size.scoredTransitions),
    unseenContextRate: size.unseenContextRate,
    invalidTargetRate: size.invalidTargetRate,
  };
}

function summarizeIntegerSequence(name, values, modulus) {
  const mapper = integerMapper(modulus);
  const rows = [];
  for (const scale of scales) {
    const lo = Math.floor(scale / 2);
    const hi = scale;
    const mid = Math.floor((lo + hi) / 2);
    const train = integerTransitions(values, lo, mid, mapper);
    const test = integerTransitions(values, mid, hi, mapper);
    rows.push({
      lo,
      mid,
      hi,
      trainInvalidTargets: train.invalid,
      testInvalidTargets: test.invalid,
      score: auditTransitions(train.transitions, test.transitions, mapper),
    });
  }
  return { name, modulus, stateCount: mapper.stateCount, rows };
}

function integerAudit(isp) {
  const primes = primesUpTo(N);
  const cramer = seeds.map((seed) => cramerPrimes(N, seed));
  const wheel = seeds.map((seed) => wheelRandomLabels(N, 210, seed, isp, false));
  const composite = seeds.map((seed) => wheelRandomLabels(N, 210, seed, isp, true));
  const out = {};
  for (const modulus of moduli) {
    out[modulus] = {
      real: summarizeIntegerSequence("real-primes", primes, modulus),
      cramer: cramer.map((values, i) => summarizeIntegerSequence(`cramer-${seeds[i]}`, values, modulus)),
      wheel: wheel.map((values, i) => summarizeIntegerSequence(`wheel-${seeds[i]}`, values, modulus)),
      composite: composite.map((values, i) => summarizeIntegerSequence(`composite-${seeds[i]}`, values, modulus)),
    };
  }
  return out;
}

function sampleCompositePolynomials(flags, degree, q, count, seed) {
  const random = rng(seed);
  const compositeTotal = flags.length - flags.reduce((sum, flag) => sum + flag, 0);
  let need = Math.min(count, compositeTotal);
  let remaining = compositeTotal;
  const lead = q ** degree;
  const out = [];
  for (let lower = 0; lower < flags.length && need > 0; lower++) {
    if (flags[lower]) continue;
    if (random() < need / remaining) {
      out.push(lead + lower);
      need--;
    }
    remaining--;
  }
  return out;
}

function summarizeFieldSequence(name, q, degree, values, mapper) {
  const mid = Math.floor(values.length / 2);
  const train = fieldTransitions(values.slice(0, mid), mapper);
  const test = fieldTransitions(values.slice(mid), mapper);
  return {
    name,
    q,
    degree,
    count: values.length,
    trainInvalidTargets: train.invalid,
    testInvalidTargets: test.invalid,
    score: auditTransitions(train.transitions, test.transitions, mapper),
  };
}

function fieldAudit(q, maxDegree, modulusDegree) {
  const universe = buildPolynomialUniverse(q, Math.max(maxDegree, modulusDegree));
  const modulus = universe.irreduciblesByDegree[modulusDegree][0];
  const mapper = fieldMapper(q, modulus);
  const start = Math.max(modulusDegree + 3, maxDegree - 3);
  const degrees = Array.from({ length: maxDegree - start + 1 }, (_, i) => start + i);
  const rows = [];
  for (const degree of degrees) {
    const values = universe.irreduciblesByDegree[degree];
    const flags = universe.irreducibleFlagsByDegree[degree];
    rows.push({
      degree,
      real: summarizeFieldSequence("irreducibles-encoded-order", q, degree, values, mapper),
      composite: seeds.map((seed) => summarizeFieldSequence(
        `composite-${seed}`,
        q,
        degree,
        sampleCompositePolynomials(flags, degree, q, values.length, seed),
        mapper,
      )),
    });
  }
  return {
    q,
    maxDegree,
    modulusDegree,
    modulus,
    modulusLabel: polyToString(modulus, q),
    stateCount: mapper.stateCount,
    gapCount: mapper.gapCount,
    rows,
  };
}

function finalScore(series) {
  return series.rows.at(-1).score;
}

function finalAggregates(seriesList, key) {
  return seriesList.map((series) => finalScore(series)?.[key]).filter(Number.isFinite);
}

function exponentFit(rows, key) {
  const pts = rows
    .map((row) => [row.score?.testTransitions, Math.abs(row.score?.[key])])
    .filter(([x, y]) => Number.isFinite(x) && x > 0 && Number.isFinite(y) && y > 0);
  if (pts.length < 2) return NaN;
  const xs = pts.map(([x]) => Math.log(x));
  const ys = pts.map(([, y]) => Math.log(y));
  const mx = mean(xs), my = mean(ys);
  let num = 0, den = 0;
  for (let i = 0; i < pts.length; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  return den ? num / den : NaN;
}

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "NA";
}

function mdIntegerRows(series) {
  return series.rows.map((row) => {
    const s = row.score;
    return `| ${row.lo}..${row.hi} | ${s?.testTransitions ?? 0} | ${fmt(s?.stateAggregate)} | ${fmt(s?.binAggregate)} | ${fmt(s?.incrementalAggregate)} | ${fmt(s?.binAdvantage, 9)} | ${fmt(s?.unseenContextRate)} |`;
  }).join("\n");
}

function mdFieldRows(field) {
  return field.rows.map((row) => {
    const s = row.real.score;
    const compBin = row.composite.map((item) => item.score?.binAggregate).filter(Number.isFinite);
    return `| ${row.degree} | ${s?.testTransitions ?? 0} | ${fmt(s?.stateAggregate)} | ${fmt(s?.binAggregate)} | ${fmt(s?.incrementalAggregate)} | ${fmt(s?.binAdvantage, 9)} | ${fmt(s?.unseenContextRate)} | ${compBin.length ? range(compBin).map((v) => fmt(v)).join(" .. ") : "NA"} |`;
  }).join("\n");
}

function linePath(values, x, y, w, h, minY, maxY) {
  const sx = (i) => x + (i / Math.max(1, values.length - 1)) * w;
  const sy = (v) => y + h - ((v - minY) / (maxY - minY || 1)) * h;
  return values.map((v, i) => `${i ? "L" : "M"} ${sx(i).toFixed(2)} ${sy(v).toFixed(2)}`).join(" ");
}

function svg(integer210, q2, q3) {
  const width = 1160, height = 760;
  const real = integer210.real.rows.map((row) => row.score?.binAggregate ?? 0);
  const stateOnly = integer210.real.rows.map((row) => row.score?.stateAggregate ?? 0);
  const cramerMean = integer210.cramer[0].rows.map((_, i) => mean(integer210.cramer.map((s) => s.rows[i].score?.binAggregate ?? 0)));
  const wheelMean = integer210.wheel[0].rows.map((_, i) => mean(integer210.wheel.map((s) => s.rows[i].score?.binAggregate ?? 0)));
  const compositeMean = integer210.composite[0].rows.map((_, i) => mean(integer210.composite.map((s) => s.rows[i].score?.binAggregate ?? 0)));
  const f2 = q2.rows.map((row) => row.real.score?.binAggregate ?? 0);
  const f3 = q3.rows.map((row) => row.real.score?.binAggregate ?? 0);
  const all = [...real, ...stateOnly, ...cramerMean, ...wheelMean, ...compositeMean, ...f2, ...f3, 0];
  const minY = Math.min(...all) * 1.08;
  const maxY = Math.max(...all) * 1.08;
  const chart = { x: 82, y: 72, w: 1000, h: 310 };
  const zeroY = chart.y + chart.h - ((0 - minY) / (maxY - minY || 1)) * chart.h;
  const final = finalScore(integer210.real);
  const finalCramer = finalAggregates(integer210.cramer, "binAggregate");
  const finalWheel = finalAggregates(integer210.wheel, "binAggregate");
  const finalComposite = finalAggregates(integer210.composite, "binAggregate");
  const finalQ2 = q2.rows.at(-1).real.score;
  const finalQ3 = q3.rows.at(-1).real.score;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#070b14"/>
<g font-family="Menlo, Consolas, monospace">
<text x="54" y="36" fill="#f8fafc" font-size="18">valid gap-residue holdout law</text>
<text x="54" y="56" fill="#94a3b8" font-size="12">train P(gap mod W | current residue, coarse gap/log p bin), score against valid landing-residue baseline</text>
<rect x="${chart.x}" y="${chart.y}" width="${chart.w}" height="${chart.h}" fill="none" stroke="#334155"/>
<line x1="${chart.x}" x2="${chart.x + chart.w}" y1="${zeroY.toFixed(2)}" y2="${zeroY.toFixed(2)}" stroke="#64748b" stroke-dasharray="4 4"/>
<path d="${linePath(real, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#a7f3d0" stroke-width="3"/>
<path d="${linePath(stateOnly, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#f8fafc" stroke-width="2" stroke-dasharray="6 4"/>
<path d="${linePath(cramerMean, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#fbbf24" stroke-width="2"/>
<path d="${linePath(wheelMean, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#7dd3fc" stroke-width="2"/>
<path d="${linePath(compositeMean, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#fb7185" stroke-width="2"/>
<path d="${linePath(f2, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#c4b5fd" stroke-width="2"/>
<path d="${linePath(f3, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#f472b6" stroke-width="2"/>
<text x="${chart.x}" y="${chart.y + chart.h + 24}" fill="#94a3b8" font-size="12">integer scales / F_q top degrees</text>
<text x="${chart.x + 510}" y="${chart.y + chart.h + 24}" fill="#a7f3d0" font-size="12">Z primes + bins</text>
<text x="${chart.x + 650}" y="${chart.y + chart.h + 24}" fill="#f8fafc" font-size="12">state only</text>
<text x="${chart.x + 760}" y="${chart.y + chart.h + 24}" fill="#7dd3fc" font-size="12">wheel</text>
<text x="${chart.x + 840}" y="${chart.y + chart.h + 24}" fill="#fb7185" font-size="12">composite</text>
</g>
<g font-family="Menlo, Consolas, monospace" font-size="12">
<text x="90" y="460" fill="#e5e7eb">final integer mod 210</text>
<text x="90" y="488" fill="#a7f3d0">prime bin aggregate ${fmt(final.binAggregate)}, advantage ${fmt(final.binAdvantage, 9)}, transitions ${final.testTransitions}</text>
<text x="90" y="512" fill="#f8fafc">state-only aggregate ${fmt(final.stateAggregate)}, incremental bin aggregate ${fmt(final.incrementalAggregate)}</text>
<text x="90" y="536" fill="#fbbf24">Cramer bin aggregate range ${range(finalCramer).map((v) => fmt(v)).join(" .. ")}</text>
<text x="90" y="560" fill="#7dd3fc">wheel bin aggregate range ${range(finalWheel).map((v) => fmt(v)).join(" .. ")}</text>
<text x="90" y="584" fill="#fb7185">composite bin aggregate range ${range(finalComposite).map((v) => fmt(v)).join(" .. ")}</text>
<text x="650" y="460" fill="#e5e7eb">function-field encoded-order check</text>
<text x="650" y="488" fill="#c4b5fd">F2 bin aggregate ${fmt(finalQ2.binAggregate)}, state ${fmt(finalQ2.stateAggregate)}</text>
<text x="650" y="512" fill="#f472b6">F3 bin aggregate ${fmt(finalQ3.binAggregate)}, state ${fmt(finalQ3.stateAggregate)}</text>
<text x="650" y="560" fill="#94a3b8">positive = previous half predicts gap residues better than valid uniform</text>
</g>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
console.error(`[gapresidue] building integer sequences to ${N}`);
const isp = sieve(N);
const integer = integerAudit(isp);
console.error(`[gapresidue] F_2[t] degree ${q2MaxDegree}, modulus degree ${q2ModulusDegree}`);
const q2 = fieldAudit(2, q2MaxDegree, q2ModulusDegree);
console.error(`[gapresidue] F_3[t] degree ${q3MaxDegree}, modulus degree ${q3ModulusDegree}`);
const q3 = fieldAudit(3, q3MaxDegree, q3ModulusDegree);

const tag = `gapresidue-holdout-audit-${N}-q${moduli.join("-")}-b${binCount}-f${q2ModulusDegree}${q3ModulusDegree}`;
const jsonPath = path.join(outDir, `${tag}.json`);
const mdPath = path.join(outDir, `${tag}.md`);
const svgPath = path.join(outDir, `${tag}.svg`);
const output = {
  candidate: "valid gap-residue holdout law",
  N,
  scales,
  moduli,
  smoothing,
  binCount,
  integer,
  q2,
  q3,
};

fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
const svgModulus = moduli.includes(210) ? 210 : moduli.at(-1);
fs.writeFileSync(svgPath, svg(integer[svgModulus], q2, q3));

let md = `# valid gap-residue holdout law audit

Candidate:
train \`P(gap mod W | current residue, coarse gap/log(p) bin)\` on the lower
half of each fresh range, score the upper half, and subtract the valid
landing-residue baseline \`uniform {h: gcd(a+h,W)=1}\`.

The reported aggregate is
\`sqrt(test transitions) * mean log(P_train(h|context) / P_valid(h|a))\`.
The state-only model uses context \`a\`; the binned model uses \`(a,zbin)\`.

Smoothing: \`${smoothing}\`; bins: \`${binCount}\`.

## Integer paths
`;

for (const modulus of moduli) {
  const group = integer[modulus];
  const final = finalScore(group.real);
  const cramerBin = finalAggregates(group.cramer, "binAggregate");
  const wheelBin = finalAggregates(group.wheel, "binAggregate");
  const compositeBin = finalAggregates(group.composite, "binAggregate");
  const cramerState = finalAggregates(group.cramer, "stateAggregate");
  const wheelState = finalAggregates(group.wheel, "stateAggregate");
  const compositeState = finalAggregates(group.composite, "stateAggregate");
  md += `
### modulus ${modulus}

Reduced residue states: \`${group.real.stateCount}\`.
Aggregate exponent fit over fresh blocks: state-only \`${fmt(exponentFit(group.real.rows, "stateAggregate"))}\`; binned \`${fmt(exponentFit(group.real.rows, "binAggregate"))}\`.

| block | transitions | state aggregate | binned aggregate | bin incremental aggregate | binned advantage | unseen context rate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
${mdIntegerRows(group.real)}

Final controls:

- prime state aggregate: \`${fmt(final.stateAggregate)}\`
- prime binned aggregate: \`${fmt(final.binAggregate)}\`
- Cramer state aggregate range: \`${range(cramerState).map((v) => fmt(v)).join(" .. ")}\`
- Cramer binned aggregate range: \`${range(cramerBin).map((v) => fmt(v)).join(" .. ")}\`
- wheel state aggregate range: \`${range(wheelState).map((v) => fmt(v)).join(" .. ")}\`
- wheel binned aggregate range: \`${range(wheelBin).map((v) => fmt(v)).join(" .. ")}\`
- composite state aggregate range: \`${range(compositeState).map((v) => fmt(v)).join(" .. ")}\`
- composite binned aggregate range: \`${range(compositeBin).map((v) => fmt(v)).join(" .. ")}\`
`;
}

md += `
## Function-field encoded-order check

The field rows use consecutive irreducibles in coefficient encoding and bin by
degree of the encoded polynomial gap. This is not coordinate-free; it is kept
only as an artifact check against earlier lex/coefficient failures.

### F_2[t]

Modulus: \`${q2.modulusLabel}\`; states: \`${q2.stateCount}\`; gap residues:
\`${q2.gapCount}\`.

| degree | transitions | state aggregate | binned aggregate | bin incremental aggregate | binned advantage | unseen context rate | composite binned range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
${mdFieldRows(q2)}

### F_3[t]

Modulus: \`${q3.modulusLabel}\`; states: \`${q3.stateCount}\`; gap residues:
\`${q3.gapCount}\`.

| degree | transitions | state aggregate | binned aggregate | bin incremental aggregate | binned advantage | unseen context rate | composite binned range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
${mdFieldRows(q3)}

## Artifacts

- JSON: \`${jsonPath}\`
- SVG: \`${svgPath}\`
`;

fs.writeFileSync(mdPath, md);
console.log(JSON.stringify({ ok: true, jsonPath, mdPath, svgPath }));
