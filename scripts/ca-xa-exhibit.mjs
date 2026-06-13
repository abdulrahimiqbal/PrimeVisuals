#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const DEFAULT_INPUT = "logs/divisor-extremes-artifacts/ca-xa-transitions.json";
const DEFAULT_OUTPUT = "logs/divisor-extremes-artifacts/ca-xa-exhibit.html";

function fmt(value, digits = 3) {
  if (!Number.isFinite(value)) return "0";
  return value.toLocaleString("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

function int(value) {
  return Number(value || 0).toLocaleString("en-US");
}

function signed(value, digits = 6) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "&mdash;";
  const abs = Math.abs(value);
  if (abs > 0 && abs < 0.001) return value.toExponential(3);
  return fmt(value, digits);
}

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function metric(label, value, note) {
  return `<div class="metric"><span>${esc(label)}</span><strong>${esc(value)}</strong><em>${esc(note)}</em></div>`;
}

function quotientText(quotient) {
  if (!quotient) return "&mdash;";
  const numerator = quotient.numerator
    .map((row) => row.exp === 1 ? String(row.p) : `${row.p}^${row.exp}`)
    .join(" · ");
  const denominator = quotient.denominator
    .map((row) => row.exp === 1 ? String(row.p) : `${row.p}^${row.exp}`)
    .join(" · ");
  return esc(denominator ? `${numerator || "1"} / ${denominator}` : numerator || "1");
}

function barChart(rows, { width = 920, rowHeight = 34, labelWidth = 165, valueWidth = 95, title }) {
  const maxValue = Math.max(0.001, ...rows.map((row) => row.value));
  const chartWidth = width - labelWidth - valueWidth - 56;
  const height = 58 + rows.length * rowHeight;
  const body = rows.map((row, i) => {
    const y = 50 + i * rowHeight;
    const barWidth = Math.max(2, (row.value / maxValue) * chartWidth);
    return [
      `<text x="18" y="${y + 17}" class="svg-label">${esc(row.label)}</text>`,
      `<rect x="${labelWidth}" y="${y}" width="${chartWidth}" height="20" rx="3" class="track"/>`,
      `<rect x="${labelWidth}" y="${y}" width="${barWidth}" height="20" rx="3" fill="${esc(row.color)}"/>`,
      `<text x="${labelWidth + chartWidth + 14}" y="${y + 16}" class="svg-value">${esc(row.display)}</text>`,
    ].join("\n");
  }).join("\n");
  return `<svg class="chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(title)}">
    <text x="18" y="26" class="svg-title">${esc(title)}</text>
    ${body}
  </svg>`;
}

function table(headers, rows) {
  return `<table>
    <thead><tr>${headers.map((header) => `<th>${esc(header)}</th>`).join("")}</tr></thead>
    <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody>
  </table>`;
}

function timelineChart(transitions, { width = 920, height = 168, title }) {
  const left = 54;
  const right = 22;
  const chartWidth = width - left - right;
  const baseY = 108;
  const barWidth = Math.max(1.6, chartWidth / transitions.length * 0.72);
  const maxSkip = Math.max(1, ...transitions.map((row) => row.skippedPrimeCount));
  const bars = transitions.map((row, i) => {
    const x = left + (i / Math.max(1, transitions.length - 1)) * chartWidth;
    const barrierCount = row.skippedCAEndpointCount || 0;
    const barHeight = row.skippedPrimeCount === 0 && barrierCount === 0
      ? 12
      : 24 + (Math.max(row.skippedPrimeCount, barrierCount) / maxSkip) * 28;
    const y = baseY - barHeight;
    const color = row.skippedPrimeCount > 0 ? "#9f1239" : barrierCount > 0 ? "#a16207" : "#0f766e";
    const label = `${row.fromFrontier}->${row.toFrontier}; skipped primes ${row.skippedPrimeCount}; CA barriers ${barrierCount}`;
    return `<rect x="${fmt(x, 3)}" y="${fmt(y, 3)}" width="${fmt(barWidth, 3)}" height="${fmt(barHeight, 3)}" rx="1.4" fill="${color}">
      <title>${esc(label)}</title>
    </rect>`;
  }).join("\n");
  const labels = transitions
    .filter((row) => row.skippedPrimeCount > 0)
    .map((row) => {
      const i = transitions.indexOf(row);
      const x = left + (i / Math.max(1, transitions.length - 1)) * chartWidth;
      const anchor = x < left + 90 ? "start" : x > width - 140 ? "end" : "middle";
      return [
        `<line x1="${fmt(x, 3)}" y1="54" x2="${fmt(x, 3)}" y2="${baseY - 54}" class="mark-line"/>`,
        `<text x="${fmt(x, 3)}" y="47" text-anchor="${anchor}" class="svg-value">${esc(`${row.fromFrontier}->${row.toFrontier}`)}</text>`,
      ].join("\n");
    }).join("\n");
  return `<svg class="timeline-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(title)}">
    <text x="18" y="24" class="svg-title">${esc(title)}</text>
    <line x1="${left}" y1="${baseY}" x2="${width - right}" y2="${baseY}" class="axis"/>
    ${bars}
    ${labels}
    <text x="${left}" y="${baseY + 25}" class="svg-label">${esc(transitions[0]?.fromFrontier || "")}</text>
    <text x="${width - right}" y="${baseY + 25}" text-anchor="end" class="svg-label">${esc(transitions.at(-1)?.toFrontier || "")}</text>
    <text x="${left}" y="${height - 13}" class="svg-label">teal = no CA barrier; gold = CA barrier; red = skipped prime frontier(s)</text>
    <text x="${width - right}" y="${height - 13}" text-anchor="end" class="svg-label">red labels name prime-frontier skips</text>
  </svg>`;
}

function main() {
  const input = process.argv[2] || DEFAULT_INPUT;
  const output = process.argv[3] || DEFAULT_OUTPUT;
  if (!existsSync(input)) throw new Error(`missing input ${input}`);

  const data = JSON.parse(readFileSync(input, "utf8"));
  const summary = data.summary;
  const skips = summary.frontierSkipSummary;
  const barriers = summary.endpointBarrierSummary;
  const caQuotients = summary.caQuotientSummary || { byKind: {} };
  const stepDecomp = summary.caStepDecompositionSummary || {};
  const postFirstCaXa = stepDecomp.postFirstCaXa || {};
  const criticalApprox = postFirstCaXa.criticalApproximationSummary || {};
  const newFrontierSecondOrder = criticalApprox.newFrontierSecondOrder || {};
  const newFrontierBoundary = criticalApprox.newFrontierBoundary || {};
  const newFrontierGap = criticalApprox.newFrontierGap || {};
  const ordinaryGapBenchmarks = newFrontierGap.ordinaryPrimeGapBenchmarks || {};
  const noBaseRecovery = newFrontierGap.noBaseRecovery || {};
  const fake = data.cramerShapeContrast || [];
  const frontierChanges = summary.frontierTransitions.filter((row) => !row.sameFrontier);
  const transitionByKey = new Map(summary.frontierTransitions.map((row) => [`${row.fromIndex}:${row.toIndex}`, row]));

  const ratioRows = [
    {
      label: "real CA-XA",
      value: skips.skippedOverLiTotal,
      display: fmt(skips.skippedOverLiTotal, 6),
      color: "#0f766e",
    },
    ...fake.map((row) => ({
      label: `seed ${row.seed}`,
      value: row.frontierSkipSummary.skippedOverLiTotal,
      display: fmt(row.frontierSkipSummary.skippedOverLiTotal, 6),
      color: row.frontierSkipSummary.frontierChangingTransitions < 10 ? "#a16207" : "#9f1239",
    })),
  ];

  const maxSkipRows = [
    {
      label: "real CA-XA",
      value: skips.maxSkippedPrimeCount,
      display: int(skips.maxSkippedPrimeCount),
      color: "#0f766e",
    },
    ...fake.map((row) => ({
      label: `seed ${row.seed}`,
      value: row.frontierSkipSummary.maxSkippedPrimeCount,
      display: int(row.frontierSkipSummary.maxSkippedPrimeCount),
      color: row.frontierSkipSummary.frontierChangingTransitions < 10 ? "#a16207" : "#9f1239",
    })),
  ];

  const nonzeroRows = skips.nonzeroTransitions.map((row) => [
    `${int(row.fromFrontier)} &rarr; ${int(row.toFrontier)}`,
    `${int(row.fromIndex)} &rarr; ${int(row.toIndex)}`,
    esc(row.skippedPrimes.join(", ")),
    int(row.skippedPrimeCount),
    fmt(row.liMain, 6),
    fmt(row.skippedOverLi, 6),
  ]);

  const rangeRows = skips.ranges.map((row) => [
    `(${int(row.range[0])}, ${int(row.range[1])}]`,
    int(row.frontierChangingTransitions),
    int(row.zeroSkipTransitions),
    int(row.nonzeroSkipTransitions),
    int(row.skippedPrimeTotal),
    fmt(row.liMainTotal, 6),
    fmt(row.skippedOverLiTotal, 6),
    int(row.maxSkippedPrimeCount),
  ]);

  const fakeRows = fake.map((row) => {
    const fakeSkips = row.frontierSkipSummary;
    const threshold = row.caStepThresholdSummary?.thresholdStats || {};
    const gap = row.caStepThresholdSummary?.criticalApproximationSummary?.newFrontierGap || {};
    const recovery = gap.noBaseRecovery || {};
    return [
      int(row.seed),
      int(row.xaCount),
      int(row.caXaCount),
      int(row.closureFailures),
      int(fakeSkips.frontierChangingTransitions),
      int(fakeSkips.skippedPrimeTotal),
      fmt(fakeSkips.skippedOverLiTotal, 6),
      int(fakeSkips.maxSkippedPrimeCount),
      `${int(threshold.aboveCritical)} / ${int(threshold.withThreshold)}`,
      signed(threshold.maxCriticalRatio, 6),
      `${int(gap.noBaseBeforeSecondOrderThreshold)} / ${int(gap.steps)}`,
      int(gap.noBaseRuns?.maxRunLength),
      int(recovery.unrecoveredRuns),
      int(recovery.maxTotalStepsToRecovery),
    ];
  });

  const timelineRows = frontierChanges.map((row, i) => [
    int(i + 1),
    `${int(row.fromFrontier)} &rarr; ${int(row.toFrontier)}`,
    `${int(row.fromIndex)} &rarr; ${int(row.toIndex)}`,
    int(row.skippedPrimeCount),
    int(row.skippedCAEndpointCount || 0),
    row.skippedPrimes.length ? esc(row.skippedPrimes.join(", ")) : "&mdash;",
    signed(row.closestBarrierDeficit),
    signed(row.finalGain),
    fmt(row.liMain, 6),
    fmt(row.skippedOverLi, 6),
  ]);

  const barrierRows = barriers.barrierEndpoints.map((row) => {
    const transition = transitionByKey.get(`${row.transitionFromIndex}:${row.transitionToIndex}`);
    return [
      `${int(transition.fromFrontier)} &rarr; ${int(transition.toFrontier)}`,
      `${int(transition.fromIndex)} &rarr; ${int(transition.toIndex)}`,
      int(row.index),
      int(row.frontier),
      signed(row.fMinusPreviousH),
      signed(transition.finalGain),
      int(transition.nonCaXaWitnesses.length),
    ];
  });

  const quotientPathRows = barriers.transitions.flatMap((transition) => (
    transition.caEndpointPath || []
  ).map((row) => {
    const quotient = row.quotientFromPreviousCA;
    const heightStep = quotient.heightStep || {};
    return [
      `${int(transition.fromFrontier)} &rarr; ${int(transition.toFrontier)}`,
      `${int(quotient.fromIndex)} &rarr; ${int(quotient.toIndex)}`,
      `${int(quotient.fromFrontier)} &rarr; ${int(quotient.toFrontier)}`,
      esc(quotient.kind),
      quotientText(quotient),
      row.isTerminalH ? "terminal H" : "barrier",
      signed(heightStep.logSigmaGain, 9),
      signed(heightStep.logLogPenalty, 9),
      signed(heightStep.logGainMinusPenalty, 9),
      signed(heightStep.primeStep?.criticalRatio, 6),
      signed(heightStep.primeStep?.caBoundaryRatioToCritical, 6),
      signed(row.fMinusPreviousH),
    ];
  }));

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>CA-XA Frontier Skip Exhibit</title>
  <style>
    :root {
      color-scheme: light;
      --paper: #f8f7f3;
      --ink: #17212b;
      --muted: #5b6572;
      --line: #d8d1c5;
      --teal: #0f766e;
      --rust: #9f1239;
      --gold: #a16207;
      --panel: #ffffff;
      --wash: #ebe7df;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--paper);
      color: var(--ink);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.45;
    }
    header, main {
      max-width: 1160px;
      margin: 0 auto;
      padding: 28px 22px;
    }
    header {
      border-bottom: 1px solid var(--line);
    }
    h1 {
      margin: 0 0 8px;
      font-size: 31px;
      line-height: 1.12;
      letter-spacing: 0;
    }
    h2 {
      margin: 34px 0 12px;
      font-size: 20px;
      letter-spacing: 0;
    }
    p {
      max-width: 920px;
      color: var(--muted);
      margin: 0 0 12px;
    }
    code {
      padding: 2px 5px;
      background: var(--wash);
      border-radius: 4px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 0.95em;
      color: #24303b;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 10px;
      margin: 22px 0 4px;
    }
    .metric {
      min-height: 104px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--panel);
      padding: 13px 14px;
    }
    .metric span,
    .metric em {
      display: block;
      color: var(--muted);
      font-size: 13px;
      font-style: normal;
    }
    .metric strong {
      display: block;
      margin: 8px 0 6px;
      font-size: 26px;
      line-height: 1.1;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
      gap: 16px;
      align-items: start;
    }
    .chart {
      display: block;
      width: 100%;
      height: auto;
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
    }
    .svg-title {
      font-size: 16px;
      font-weight: 700;
      fill: var(--ink);
    }
    .svg-label,
    .svg-value {
      font-size: 13px;
      fill: var(--muted);
    }
    .svg-value {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      fill: var(--ink);
    }
    .track {
      fill: #e9e2d8;
    }
    .timeline-chart {
      display: block;
      width: 100%;
      height: auto;
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      margin: 10px 0 14px;
    }
    .axis {
      stroke: #b7aea1;
      stroke-width: 1;
    }
    .mark-line {
      stroke: #9f1239;
      stroke-width: 1;
      stroke-dasharray: 3 3;
    }
    .table-wrap {
      overflow-x: auto;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--panel);
    }
    .timeline-wrap {
      max-height: 420px;
      overflow: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 760px;
    }
    th, td {
      padding: 9px 11px;
      border-bottom: 1px solid #ece7df;
      text-align: right;
      font-size: 13px;
      white-space: nowrap;
    }
    th {
      background: #f0ece5;
      color: #303b45;
      font-weight: 700;
    }
    th:first-child, td:first-child {
      text-align: left;
    }
    tr:last-child td {
      border-bottom: 0;
    }
    .statement {
      border-left: 4px solid var(--teal);
      padding: 10px 14px;
      background: #eef7f5;
      max-width: 980px;
      color: #173b38;
    }
    footer {
      max-width: 1160px;
      margin: 8px auto 0;
      padding: 18px 22px 34px;
      color: var(--muted);
      font-size: 13px;
      border-top: 1px solid var(--line);
    }
    @media (max-width: 640px) {
      header, main { padding: 22px 14px; }
      h1 { font-size: 25px; }
      .grid { grid-template-columns: 1fr; }
      .metric strong { font-size: 22px; }
    }
  </style>
</head>
<body>
  <header>
    <h1>CA-XA Frontier Skip Exhibit</h1>
    <p>Divisor-world records define the object. Prime structure enters only after applying the CA factorization and the XA closure theorem.</p>
  </header>
  <main>
    <section>
      <h2>Live Statement</h2>
      <p class="statement">Through A004394 rows <code>s1..s${esc(data.limit)}</code>, every non-CA XA record closes at the next CA endpoint. The resulting <code>CA &cap; XA</code> largest-prime frontier sequence changes frontier <strong>${int(skips.frontierChangingTransitions)}</strong> times and skips only <strong>${int(skips.skippedPrimeTotal)}</strong> prime frontiers in total.</p>
      <div class="metrics">
        ${metric("XA records", int(summary.xaCount), "record scan of sigma(n)/(n log log n)")}
        ${metric("CA records", int(summary.caCount), "epsilon-interval classifier")}
        ${metric("CA-XA records", int(summary.caXaCount), "intersection sequence H")}
        ${metric("Closure failures", int(summary.closureFailures), "theorem predicts zero")}
        ${metric("Frontier changes", int(skips.frontierChangingTransitions), `${int(skips.zeroSkipTransitions)} prime-adjacent`)}
        ${metric("Aggregate skipped/Li", fmt(skips.skippedOverLiTotal, 6), `${int(skips.skippedPrimeTotal)} skipped over Li ${fmt(skips.liMainTotal, 3)}`)}
        ${metric("CA endpoint barriers", int(barriers.skippedCAEndpointTotal), `${int(barriers.transitionsWithSkippedCAEndpoints)} transitions; closest ${signed(barriers.closestBarrierDeficit)}`)}
        ${metric("CA quotient steps", int(caQuotients.total || 0), `${int(caQuotients.byKind.prime || 0)} prime, ${int(caQuotients.byKind["distinct-semiprime"] || 0)} semiprime`)}
        ${metric("Negative prime-step margins", `${int(postFirstCaXa.negativePrimeSteps || 0)} / ${int(postFirstCaXa.primeSteps || 0)}`, `after first CA-XA; min ${signed(postFirstCaXa.minLogGainMinusPenalty)}`)}
        ${metric("New-frontier asymptotic", `${int(newFrontierSecondOrder.classificationMismatches)} mismatches`, `second-order max relative error ${signed(newFrontierSecondOrder.maxAbsRelativeError, 6)}`)}
        ${metric("CA-boundary classifier", `${int(newFrontierBoundary.classificationMismatches)} mismatches`, `F(p,1) below critical in ${int(newFrontierBoundary.belowCriticalBoundary)} cases`)}
        ${metric("Explicit P2 boundary", `${int(newFrontierBoundary.secondOrderBoundaryMismatches)} mismatches`, `p above P2 in ${int(newFrontierBoundary.belowSecondOrderBoundary)} cases`)}
        ${metric("P2 no-base runs", int(newFrontierGap.noBaseRuns?.maxRunLength), `${int(newFrontierGap.noBaseBeforeSecondOrderThreshold)} events in ${int(newFrontierGap.noBaseRuns?.runCount)} runs`)}
        ${metric("Ordinary gap fit", `${int(ordinaryGapBenchmarks.bhp0525FitsP2Interval)} / ${int(newFrontierGap.steps)}`, `BHP-scale fit; ${int(ordinaryGapBenchmarks.noBaseBhp0525FitsP2Interval)} no-base cases`)}
        ${metric("No-base recovery", `${int(noBaseRecovery.maxExtraStepsAfterNoBaseRun)} extra steps`, `${int(noBaseRecovery.unrecoveredRuns)} unrecovered runs`)}
        ${metric("Recovery mode", `${int(noBaseRecovery.recoveredUsingOnlyNewFrontierSteps)} new-frontier`, `${int(noBaseRecovery.recoveredUsingNonNewFrontierSteps)} uses old-frontier step`)}
        ${metric("Boundary Taylor", `${int(newFrontierBoundary.secondOrderTaylorMismatches)} mismatches`, `max log-error ${signed(newFrontierBoundary.maxAbsSecondOrderTaylorError, 6)}`)}
      </div>
    </section>

    <section>
      <h2>Cramer Contrast</h2>
      <p>The controls keep the same exponent shapes and replace prime bases by fixed-shape Cramer bases. Seeds with many frontier changes produce substantially larger skipped-frontier ratios or threshold excursions than the real divisor-world sequence.</p>
      <div class="grid">
        ${barChart(ratioRows, { title: "Skipped frontiers / integrated transition main" })}
        ${barChart(maxSkipRows, { title: "Max skipped frontiers in one transition" })}
      </div>
    </section>

    <section>
      <h2>Nonzero Real Skips</h2>
      <div class="table-wrap">
        ${table(["frontier transition", "SA indices", "skipped prime frontiers", "skip", "Li main", "skip/Li"], nonzeroRows)}
      </div>
    </section>

    <section id="frontier-timeline">
      <h2>Full Frontier Timeline</h2>
      <p>Each mark is one frontier-changing transition between consecutive <code>CA &cap; XA</code> records. Gold marks have skipped CA endpoint barriers; red marks are the nonzero skipped-prime transitions.</p>
      ${timelineChart(frontierChanges, { title: "All 356 CA-XA frontier-changing transitions" })}
      <div class="table-wrap timeline-wrap" data-timeline-count="${frontierChanges.length}">
        ${table(["#", "frontier transition", "SA indices", "prime skip", "CA barriers", "skipped prime frontiers", "closest f(C)-f(A)", "final f(B)-f(A)", "Li main", "skip/Li"], timelineRows)}
      </div>
    </section>

    <section>
      <h2>CA Endpoint Barriers</h2>
      <p>These are the skipped CA endpoints inside consecutive <code>CA &cap; XA</code> transitions. Each deficit is measured against the previous <code>CA &cap; XA</code> record height.</p>
      <div class="table-wrap" data-barrier-count="${barriers.skippedCAEndpointTotal}">
        ${table(["H frontier transition", "SA indices", "skipped CA index", "CA frontier", "f(C)-f(A)", "final f(B)-f(A)", "non-CA XA witnesses"], barrierRows)}
      </div>
    </section>

    <section>
      <h2>CA Quotient Path</h2>
      <p>Each row is a consecutive CA endpoint step inside a barrier transition. The margin is <code>log(local sigma gain) - log(loglog penalty)</code>; <code>p/critical</code> above <code>1</code>, equivalently <code>F/Fcrit</code> below <code>1</code>, means the step loses.</p>
      <div class="table-wrap" data-ca-quotient-total="${caQuotients.total || 0}" data-ca-quotient-prime-count="${caQuotients.byKind.prime || 0}">
        ${table(["H frontier transition", "CA index step", "frontier step", "quotient kind", "quotient", "role", "log sigma gain", "loglog penalty", "margin", "p/critical", "F/Fcrit", "f(C)-f(A)"], quotientPathRows)}
      </div>
    </section>

    <section>
      <h2>Range Checks</h2>
      <div class="table-wrap">
        ${table(["range", "frontier changes", "prime-adjacent", "nonzero skips", "skipped total", "transition Li", "skipped/Li", "max skip"], rangeRows)}
      </div>
    </section>

    <section>
      <h2>Fixed-Shape Controls</h2>
      <div class="table-wrap">
        ${table(["seed", "fake records", "CA-fake records", "closure failures", "frontier changes", "skipped total", "skipped/Li", "max skip", "above critical", "max p/critical", "P2 no-base", "max P2 run", "unrecovered P2 runs", "max recovery steps"], fakeRows)}
      </div>
    </section>

    <section>
      <h2>Theorem Status</h2>
      <p>Proposition 20 and Lemma 21 license the closure statement: a non-CA XA record between consecutive CA numbers forces the next CA endpoint to be XA. The small skipped-frontier statistic is verified finite evidence, not a theorem yet. The missing theorem is a global bound on skipped prime frontiers between consecutive <code>CA &cap; XA</code> records.</p>
    </section>
  </main>
  <footer>
    Generated from ${esc(resolve(input))}. Source rows parsed: ${int(data.rowsParsed)}. Generated at ${esc(data.generatedAt)}.
  </footer>
</body>
</html>
`;

  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, html);
  process.stdout.write(`${output}\n`);
}

main();
