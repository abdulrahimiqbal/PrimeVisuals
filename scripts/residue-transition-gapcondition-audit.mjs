#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { buildPolynomialUniverse, polyMod, polyToString } from "../src/core/ffield.js";
import { cramerPrimes, primesUpTo, sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 16_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const moduli = (process.argv[4] || "30,210").split(",").map((x) => Number(x.trim())).filter(Boolean);
const q2MaxDegree = Number(process.argv[5] || 24);
const q3MaxDegree = Number(process.argv[6] || 15);
const q2ModulusDegree = Number(process.argv[7] || 3);
const q3ModulusDegree = Number(process.argv[8] || 2);

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
  return [Math.min(...values), Math.max(...values)];
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
  return {
    modulus,
    residues,
    stateCount: residues.length,
    gapCount: modulus,
    state(value) {
      return map.get(((value % modulus) + modulus) % modulus) ?? -1;
    },
    gap(a, b) {
      return ((b - a) % modulus + modulus) % modulus;
    },
    compatibleState(aState, gapResidue) {
      const residue = (residues[aState] + gapResidue) % modulus;
      return map.get(residue) ?? -1;
    },
  };
}

function polyDegreeInt(poly, q) {
  if (poly <= 0) return -1;
  let d = 0, p = 1;
  while (p * q <= poly) {
    p *= q;
    d++;
  }
  return d;
}

function polySubEncoded(a, b, q) {
  let aa = a, bb = b, pow = 1, out = 0;
  while (aa > 0 || bb > 0) {
    const c = ((aa % q) - (bb % q) + q) % q;
    out += c * pow;
    aa = Math.floor(aa / q);
    bb = Math.floor(bb / q);
    pow *= q;
  }
  return out;
}

function polyAddEncoded(a, b, q) {
  let aa = a, bb = b, pow = 1, out = 0;
  while (aa > 0 || bb > 0) {
    const c = ((aa % q) + (bb % q)) % q;
    out += c * pow;
    aa = Math.floor(aa / q);
    bb = Math.floor(bb / q);
    pow *= q;
  }
  return out;
}

function fieldMapper(q, modulus) {
  const degree = polyDegreeInt(modulus, q);
  const norm = q ** degree;
  const residues = [];
  const map = new Map();
  for (let r = 1; r < norm; r++) {
    residues.push(r);
    map.set(r, residues.length - 1);
  }
  return {
    q,
    modulus,
    norm,
    residues,
    stateCount: residues.length,
    gapCount: norm,
    state(value) {
      return map.get(polyMod(value, modulus, q)) ?? -1;
    },
    gap(a, b) {
      return polyMod(polySubEncoded(b, a, q), modulus, q);
    },
    compatibleState(aState, gapResidue) {
      const residue = polyMod(polyAddEncoded(residues[aState], gapResidue, q), modulus, q);
      return map.get(residue) ?? -1;
    },
  };
}

function triplesFromValues(values, mapper) {
  const triples = [];
  for (let i = 0; i + 1 < values.length; i++) {
    const a = mapper.state(values[i]);
    const b = mapper.state(values[i + 1]);
    if (a < 0 || b < 0) continue;
    const h = mapper.gap(values[i], values[i + 1]);
    const compatible = mapper.compatibleState(a, h);
    triples.push({ a, h, b, compatible });
  }
  return triples;
}

function firstOrderModel(triples, stateCount) {
  const counts = Array.from({ length: stateCount }, () => new Float64Array(stateCount).fill(smoothing));
  const sums = new Float64Array(stateCount).fill(smoothing * stateCount);
  for (const t of triples) {
    counts[t.a][t.b]++;
    sums[t.a]++;
  }
  return { counts, sums };
}

function gapModel(triples, stateCount, gapCount) {
  const contextCount = stateCount * gapCount;
  const counts = Array.from({ length: contextCount }, () => new Float64Array(stateCount).fill(smoothing));
  const sums = new Float64Array(contextCount).fill(smoothing * stateCount);
  const seen = new Int32Array(contextCount);
  for (const t of triples) {
    const c = t.a * gapCount + t.h;
    counts[c][t.b]++;
    sums[c]++;
    seen[c]++;
  }
  return { counts, sums, seen, gapCount };
}

function scoreFirst(triples, model) {
  if (!triples.length) return NaN;
  let sum = 0;
  for (const t of triples) sum += Math.log(model.counts[t.a][t.b] / model.sums[t.a]);
  return sum / triples.length;
}

function scoreGap(triples, model) {
  if (!triples.length) return NaN;
  let sum = 0;
  let unseen = 0;
  let violations = 0;
  for (const t of triples) {
    const c = t.a * model.gapCount + t.h;
    sum += Math.log(model.counts[c][t.b] / model.sums[c]);
    if (!model.seen[c]) unseen++;
    if (t.b !== t.compatible) violations++;
  }
  return { score: sum / triples.length, unseen, violations };
}

function shuffleB(triples, random) {
  const bs = triples.map((t) => t.b);
  for (let i = bs.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const tmp = bs[i];
    bs[i] = bs[j];
    bs[j] = tmp;
  }
  return triples.map((t, i) => ({ ...t, b: bs[i] }));
}

function auditTriples(train, test, mapper) {
  if (train.length < 4 || test.length < 4) return null;
  const first = firstOrderModel(train, mapper.stateCount);
  const gap = gapModel(train, mapper.stateCount, mapper.gapCount);
  const firstObserved = scoreFirst(test, first);
  const gapObserved = scoreGap(test, gap);
  const firstControls = seeds.map((seed) => scoreFirst(shuffleB(test, rng(seed)), first));
  const gapControls = seeds.map((seed) => scoreGap(shuffleB(test, rng(seed)), gap).score);
  const firstFake = mean(firstControls);
  const gapFake = mean(gapControls);
  const scale = Math.sqrt(test.length);
  return {
    trainTransitions: train.length,
    testTransitions: test.length,
    firstObserved,
    firstFake,
    firstResidual: firstObserved - firstFake,
    firstAggregate: (firstObserved - firstFake) * scale,
    firstControlRange: range(firstControls.map((score, i) => (score - mean(firstControls.filter((_, j) => j !== i))) * scale)),
    gapObserved: gapObserved.score,
    gapFake,
    gapResidual: gapObserved.score - gapFake,
    gapAggregate: (gapObserved.score - gapFake) * scale,
    gapControlRange: range(gapControls.map((score, i) => (score - mean(gapControls.filter((_, j) => j !== i))) * scale)),
    compatibilityViolations: gapObserved.violations,
    compatibilityViolationRate: gapObserved.violations / test.length,
    unseenContexts: gapObserved.unseen,
    unseenContextRate: gapObserved.unseen / test.length,
    exactCompatibilityQuotient: 0,
  };
}

function summarizeIntegerSequence(name, values, modulus) {
  const mapper = integerMapper(modulus);
  const rows = [];
  for (const scale of scales) {
    const lo = Math.floor(scale / 2);
    const hi = scale;
    const mid = Math.floor((lo + hi) / 2);
    const train = triplesFromValues(valuesInRange(values, lo, mid), mapper);
    const test = triplesFromValues(valuesInRange(values, mid, hi), mapper);
    rows.push({ lo, mid, hi, score: auditTriples(train, test, mapper) });
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
  const train = triplesFromValues(values.slice(0, mid), mapper);
  const test = triplesFromValues(values.slice(mid), mapper);
  return { name, q, degree, count: values.length, score: auditTriples(train, test, mapper) };
}

function fieldAudit(q, maxDegree, modulusDegree) {
  const universe = buildPolynomialUniverse(q, Math.max(maxDegree, modulusDegree));
  const modulus = universe.irreduciblesByDegree[modulusDegree][0];
  const mapper = fieldMapper(q, modulus);
  const start = Math.max(modulusDegree + 3, maxDegree - 3);
  const degrees = Array.from({ length: maxDegree - start + 1 }, (_, i) => start + i);
  const rows = [];
  for (const degree of degrees) {
    const values = universe.irreduciblesByDegree[degree].map((lower) => q ** degree + lower);
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
    rows,
  };
}

function finalScore(series) {
  return series.rows.at(-1).score;
}

function finalAggregates(seriesList, key) {
  return seriesList.map((series) => finalScore(series)?.[key]).filter(Number.isFinite);
}

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "NA";
}

function mdIntegerRows(series) {
  return series.rows.map((row) => {
    const s = row.score;
    return `| ${row.lo}..${row.hi} | ${s?.testTransitions ?? 0} | ${fmt(s?.firstAggregate)} | ${fmt(s?.gapAggregate)} | ${s?.compatibilityViolations ?? 0} | ${fmt(s?.compatibilityViolationRate)} | ${fmt(s?.unseenContextRate)} |`;
  }).join("\n");
}

function mdFieldRows(field) {
  return field.rows.map((row) => {
    const s = row.real.score;
    const compGap = row.composite.map((item) => item.score?.gapAggregate).filter(Number.isFinite);
    return `| ${row.degree} | ${s?.testTransitions ?? 0} | ${fmt(s?.firstAggregate)} | ${fmt(s?.gapAggregate)} | ${s?.compatibilityViolations ?? 0} | ${fmt(s?.unseenContextRate)} | ${compGap.length ? range(compGap).map((v) => fmt(v)).join(" .. ") : "NA"} |`;
  }).join("\n");
}

function linePath(values, x, y, w, h, minY, maxY) {
  const sx = (i) => x + (i / Math.max(1, values.length - 1)) * w;
  const sy = (v) => y + h - ((v - minY) / (maxY - minY || 1)) * h;
  return values.map((v, i) => `${i ? "L" : "M"} ${sx(i).toFixed(2)} ${sy(v).toFixed(2)}`).join(" ");
}

function svg(integer210, q2, q3) {
  const width = 1160, height = 760;
  const first = integer210.real.rows.map((row) => row.score?.firstAggregate ?? 0);
  const gap = integer210.real.rows.map((row) => row.score?.gapAggregate ?? 0);
  const quotient = integer210.real.rows.map(() => 0);
  const wheelGap = integer210.wheel[0].rows.map((_, i) => mean(integer210.wheel.map((s) => s.rows[i].score?.gapAggregate ?? 0)));
  const compositeGap = integer210.composite[0].rows.map((_, i) => mean(integer210.composite.map((s) => s.rows[i].score?.gapAggregate ?? 0)));
  const f2 = q2.rows.map((row) => row.real.score?.gapAggregate ?? 0);
  const f3 = q3.rows.map((row) => row.real.score?.gapAggregate ?? 0);
  const all = [...first, ...gap, ...wheelGap, ...compositeGap, ...f2, ...f3, 0];
  const minY = Math.min(...all) * 1.08;
  const maxY = Math.max(...all) * 1.08;
  const chart = { x: 82, y: 72, w: 1000, h: 310 };
  const zeroY = chart.y + chart.h - ((0 - minY) / (maxY - minY || 1)) * chart.h;
  const final = finalScore(integer210.real);
  const finalWheel = finalAggregates(integer210.wheel, "gapAggregate");
  const finalComposite = finalAggregates(integer210.composite, "gapAggregate");
  const finalQ2 = q2.rows.at(-1).real.score;
  const finalQ3 = q3.rows.at(-1).real.score;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#070b14"/>
<g font-family="Menlo, Consolas, monospace">
<text x="54" y="36" fill="#f8fafc" font-size="18">gap-conditioned transition compatibility quotient</text>
<text x="54" y="56" fill="#94a3b8" font-size="12">first-order surprise survives row-shuffle; exact (a,gap mod W) compatibility leaves zero quotient</text>
<rect x="${chart.x}" y="${chart.y}" width="${chart.w}" height="${chart.h}" fill="none" stroke="#334155"/>
<line x1="${chart.x}" x2="${chart.x + chart.w}" y1="${zeroY.toFixed(2)}" y2="${zeroY.toFixed(2)}" stroke="#64748b" stroke-dasharray="4 4"/>
<path d="${linePath(first, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#fbbf24" stroke-width="2"/>
<path d="${linePath(gap, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#a7f3d0" stroke-width="3"/>
<path d="${linePath(wheelGap, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#7dd3fc" stroke-width="2"/>
<path d="${linePath(compositeGap, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#fb7185" stroke-width="2"/>
<path d="${linePath(f2, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#c4b5fd" stroke-width="2"/>
<path d="${linePath(f3, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#f472b6" stroke-width="2"/>
<path d="${linePath(quotient, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#e5e7eb" stroke-width="3" stroke-dasharray="6 5"/>
<text x="${chart.x}" y="${chart.y + chart.h + 24}" fill="#94a3b8" font-size="12">integer scales / F_q top degrees</text>
<text x="${chart.x + 530}" y="${chart.y + chart.h + 24}" fill="#fbbf24" font-size="12">first-order</text>
<text x="${chart.x + 650}" y="${chart.y + chart.h + 24}" fill="#a7f3d0" font-size="12">gap-row-shuffle</text>
<text x="${chart.x + 815}" y="${chart.y + chart.h + 24}" fill="#e5e7eb" font-size="12">exact quotient</text>
</g>
<g font-family="Menlo, Consolas, monospace" font-size="12">
<text x="90" y="460" fill="#e5e7eb">final integer mod 210</text>
<text x="90" y="488" fill="#fbbf24">first-order aggregate ${fmt(final.firstAggregate)}</text>
<text x="90" y="512" fill="#a7f3d0">gap-conditioned row-shuffle aggregate ${fmt(final.gapAggregate)}</text>
<text x="90" y="536" fill="#e5e7eb">exact compatibility quotient ${fmt(final.exactCompatibilityQuotient)}, violations ${final.compatibilityViolations}</text>
<text x="90" y="560" fill="#7dd3fc">wheel gap aggregate range ${range(finalWheel).map((v) => fmt(v)).join(" .. ")}</text>
<text x="90" y="584" fill="#fb7185">composite gap aggregate range ${range(finalComposite).map((v) => fmt(v)).join(" .. ")}</text>
<text x="650" y="460" fill="#e5e7eb">function-field encoded-order check</text>
<text x="650" y="488" fill="#c4b5fd">F2 gap aggregate ${fmt(finalQ2.gapAggregate)}, violations ${finalQ2.compatibilityViolations}</text>
<text x="650" y="512" fill="#f472b6">F3 gap aggregate ${fmt(finalQ3.gapAggregate)}, violations ${finalQ3.compatibilityViolations}</text>
<text x="650" y="560" fill="#94a3b8">dashed line = the actual compatible quotient after conditioning on gap mod W</text>
</g>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
console.error(`[gapcondition] building integer sequences to ${N}`);
const isp = sieve(N);
const integer = integerAudit(isp);
console.error(`[gapcondition] F_2[t] degree ${q2MaxDegree}, modulus degree ${q2ModulusDegree}`);
const q2 = fieldAudit(2, q2MaxDegree, q2ModulusDegree);
console.error(`[gapcondition] F_3[t] degree ${q3MaxDegree}, modulus degree ${q3ModulusDegree}`);
const q3 = fieldAudit(3, q3MaxDegree, q3ModulusDegree);

const tag = `residue-transition-gapcondition-audit-${N}-q${moduli.join("-")}-f${q2ModulusDegree}${q3ModulusDegree}`;
const jsonPath = path.join(outDir, `${tag}.json`);
const mdPath = path.join(outDir, `${tag}.md`);
const svgPath = path.join(outDir, `${tag}.svg`);
const output = {
  candidate: "gap-conditioned transition compatibility quotient",
  N,
  scales,
  moduli,
  smoothing,
  integer,
  q2,
  q3,
};

fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
const svgModulus = moduli.includes(210) ? 210 : moduli.at(-1);
fs.writeFileSync(svgPath, svg(integer[svgModulus], q2, q3));

let md = `# gap-conditioned transition compatibility quotient audit

Candidate:
repair the row-shuffle transition null by conditioning on the actual gap
residue. Since \`b = a + gap mod W\`, the exact compatibility quotient should
have no remaining next-residue degree of freedom.

Columns:

- first-order aggregate: \`P(b|a)\` versus row-shuffled \`b\`
- gap aggregate: \`P(b|a,gap mod W)\` versus row-shuffled \`b\`
- exact quotient: compatibility violations of \`b=a+gap mod W\`

Smoothing: \`${smoothing}\`.

## Integer paths
`;

for (const modulus of moduli) {
  const group = integer[modulus];
  const final = finalScore(group.real);
  const cramerGap = finalAggregates(group.cramer, "gapAggregate");
  const wheelGap = finalAggregates(group.wheel, "gapAggregate");
  const compositeGap = finalAggregates(group.composite, "gapAggregate");
  md += `
### modulus ${modulus}

Reduced residue states: \`${group.real.stateCount}\`.

| block | transitions | first-order aggregate | gap aggregate | compatibility violations | violation rate | unseen context rate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
${mdIntegerRows(group.real)}

Final controls:

- exact compatibility quotient: \`${fmt(final.exactCompatibilityQuotient)}\`
- Cramer gap aggregate range: \`${range(cramerGap).map((v) => fmt(v)).join(" .. ")}\`
- wheel gap aggregate range: \`${range(wheelGap).map((v) => fmt(v)).join(" .. ")}\`
- composite gap aggregate range: \`${range(compositeGap).map((v) => fmt(v)).join(" .. ")}\`
`;
}

md += `
## F_2[t] encoded-order path

Residue modulus: \`${q2.modulusLabel}\`; states: \`${q2.stateCount}\`.

| degree | transitions | first-order aggregate | gap aggregate | compatibility violations | unseen context rate | composite gap aggregate range |
| ---: | ---: | ---: | ---: | ---: | ---: | --- |
${mdFieldRows(q2)}

## F_3[t] encoded-order path

Residue modulus: \`${q3.modulusLabel}\`; states: \`${q3.stateCount}\`.

| degree | transitions | first-order aggregate | gap aggregate | compatibility violations | unseen context rate | composite gap aggregate range |
| ---: | ---: | ---: | ---: | ---: | ---: | --- |
${mdFieldRows(q3)}

SVG: \`${svgPath}\`
JSON: \`${jsonPath}\`
`;

fs.writeFileSync(mdPath, md);

const finalInteger = finalScore(integer[svgModulus].real);
console.log(JSON.stringify({
  ok: true,
  jsonPath,
  mdPath,
  svgPath,
  finalInteger: {
    modulus: svgModulus,
    ...finalInteger,
    cramerGapAggregateRange: range(finalAggregates(integer[svgModulus].cramer, "gapAggregate")),
    wheelGapAggregateRange: range(finalAggregates(integer[svgModulus].wheel, "gapAggregate")),
    compositeGapAggregateRange: range(finalAggregates(integer[svgModulus].composite, "gapAggregate")),
  },
  finalQ2: q2.rows.at(-1).real.score,
  finalQ3: q3.rows.at(-1).real.score,
}, null, 2));
