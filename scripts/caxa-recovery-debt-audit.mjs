#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const inputPath = process.argv[2] || "logs/divisor-extremes-artifacts/ca-xa-transitions.json";
const outDir = process.argv[3] || "logs/playground-artifacts";

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "nan";
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / (values.length || 1);
}

function range(values) {
  if (!values.length) return [0, 0];
  return [Math.min(...values), Math.max(...values)];
}

function linearFit(xs, ys) {
  const mx = mean(xs);
  const my = mean(ys);
  let sxx = 0;
  let sxy = 0;
  for (let i = 0; i < xs.length; i++) {
    const dx = xs[i] - mx;
    sxx += dx * dx;
    sxy += dx * (ys[i] - my);
  }
  const slope = sxy / (sxx || 1);
  return { slope, intercept: my - slope * mx };
}

function exponent(rows, key, scaleKey = "Y") {
  const fitRows = rows.filter((row) => row[key] > 0 && row[scaleKey] > 1);
  if (fitRows.length < 2) return 0;
  return linearFit(
    fitRows.map((row) => Math.log(row[scaleKey])),
    fitRows.map((row) => Math.log(row[key])),
  ).slope;
}

function gapSummaryFromContainer(container) {
  return container.caStepThresholdSummary.criticalApproximationSummary.newFrontierGap;
}

function realGapSummary(data) {
  return data.summary.caStepDecompositionSummary.postFirstCaXa
    .criticalApproximationSummary.newFrontierGap;
}

function normalizeRun(run) {
  const debt = Math.max(0, -(run.minCumulativeLogMargin || 0));
  const recoveredBy = run.recovered ? run.recoveryFrontier : null;
  return {
    ...run,
    recoveredBy,
    debt,
    debtMicro: debt * 1e6,
    expectedBaseCountTotal: run.expectedBaseCountTotal || 0,
    extraStepsAfterNoBaseRun: run.extraStepsAfterNoBaseRun ?? null,
    totalStepsToRecovery: run.totalStepsToRecovery ?? null,
  };
}

function makeGroup(label, gap, extra = {}) {
  const recovery = gap.noBaseRecovery;
  const runs = (recovery.runs || [])
    .map(normalizeRun)
    .sort((a, b) => a.fromFrontier - b.fromFrontier || a.fromIndex - b.fromIndex);
  return {
    label,
    ...extra,
    steps: gap.steps,
    noBaseBeforeSecondOrderThreshold: gap.noBaseBeforeSecondOrderThreshold,
    expectedBaseCountTotal: gap.expectedBaseCountTotal,
    noBaseExpectedBaseCountTotal: gap.noBaseExpectedBaseCountTotal,
    primeOnlyNoBaseRuns: gap.noBaseRuns,
    recovery,
    runs,
  };
}

function summarizeAt(group, Y) {
  const started = group.runs.filter((run) => run.fromFrontier <= Y);
  const closed = started.filter((run) => run.recovered && run.recoveredBy <= Y);
  const open = started.filter((run) => !run.recovered || run.recoveredBy > Y);
  const debts = started.map((run) => run.debt);
  const expected = started.reduce((sum, run) => sum + run.expectedBaseCountTotal, 0);
  const debtL2 = Math.sqrt(debts.reduce((sum, debt) => sum + debt * debt, 0));
  const debtTotal = debts.reduce((sum, debt) => sum + debt, 0);
  const maxExtra = closed.reduce((max, run) => Math.max(max, run.extraStepsAfterNoBaseRun || 0), 0);
  const maxTotalSteps = closed.reduce((max, run) => Math.max(max, run.totalStepsToRecovery || 0), 0);
  const longestStartedRun = started.reduce((max, run) => Math.max(max, run.length), 0);
  return {
    label: group.label,
    seed: group.seed ?? null,
    Y,
    runsStarted: started.length,
    runsClosed: closed.length,
    openRuns: open.length,
    noBaseEvents: started.reduce((sum, run) => sum + run.length, 0),
    longestStartedRun,
    maxExtra,
    maxTotalSteps,
    debtL2,
    debtMicroL2: debtL2 * 1e6,
    debtTotal,
    debtMicroTotal: debtTotal * 1e6,
    deepestDebt: Math.max(0, ...debts),
    deepestDebtMicro: Math.max(0, ...debts.map((debt) => debt * 1e6)),
    expectedBaseCountTotal: expected,
    debtMicroPerSqrtExpected: (debtL2 * 1e6) / Math.sqrt(expected || 1),
  };
}

function endpointRows(group, endpoints) {
  return endpoints.map((Y) => summarizeAt(group, Y));
}

function collectEndpoints(groups, maxFrontier) {
  const endpointSet = new Set([113, 139, 200, 300, 500, 800, 1000, 1500, 2000, 2500, maxFrontier]);
  for (const group of groups) {
    for (const run of group.runs) {
      endpointSet.add(run.fromFrontier);
      endpointSet.add(run.toFrontier);
      if (run.recoveredBy) endpointSet.add(run.recoveredBy);
    }
  }
  return [...endpointSet]
    .filter((value) => Number.isFinite(value) && value >= 113 && value <= maxFrontier)
    .sort((a, b) => a - b);
}

function seedRange(fakeRowsByEndpoint, index, key) {
  return range(fakeRowsByEndpoint.map((rows) => rows[index][key]));
}

function makeSvg(report) {
  const width = 1240;
  const height = 820;
  const margin = { left: 72, right: 280, top: 112, bottom: 78 };
  const panelGap = 46;
  const panelH = (height - margin.top - margin.bottom - 2 * panelGap) / 3;
  const plotW = width - margin.left - margin.right;
  const xMin = Math.log(report.frontierRange[0]);
  const xMax = Math.log(report.frontierRange[1]);
  const xOf = (Y) => margin.left + ((Math.log(Y) - xMin) / (xMax - xMin)) * plotW;
  const panels = [
    { title: "bounded recovery B(Y)", key: "maxExtra", color: "#67e8f9", fake: "#8b5cf6" },
    { title: "open no-base debts", key: "openRuns", color: "#fbbf24", fake: "#fb7185" },
    { title: "debt L2 (micro log-margin)", key: "debtMicroL2", color: "#34d399", fake: "#a78bfa" },
  ];
  const realRows = report.realEndpointRows;
  const fakeRows = report.fakeEndpointRowsBySeed;
  const pathFromRows = (rows, key, yOf) => rows
    .map((row, i) => `${i ? "L" : "M"} ${xOf(row.Y).toFixed(2)} ${yOf(row[key]).toFixed(2)}`)
    .join(" ");
  const panelSvg = panels.map((panel, panelIndex) => {
    const yTop = margin.top + panelIndex * (panelH + panelGap);
    const fakeValues = fakeRows.flatMap((rows) => rows.map((row) => row[panel.key]));
    const realValues = realRows.map((row) => row[panel.key]);
    const yMax = Math.max(1, ...fakeValues, ...realValues) * 1.12;
    const yMin = 0;
    const yOf = (value) => yTop + (1 - (value - yMin) / (yMax - yMin)) * panelH;
    const ticks = [];
    for (let i = 0; i <= 4; i++) {
      const y = yTop + (i / 4) * panelH;
      const value = yMax - (i / 4) * (yMax - yMin);
      ticks.push(`<line x1="${margin.left}" y1="${y.toFixed(2)}" x2="${margin.left + plotW}" y2="${y.toFixed(2)}" stroke="#1f2937"/>`);
      ticks.push(`<text x="18" y="${(y + 4).toFixed(2)}" fill="#94a3b8" font-size="12">${fmt(value, panel.key === "debtMicroL2" ? 1 : 0)}</text>`);
    }
    const band = report.endpoints.map((Y, i) => {
      const [lo, hi] = seedRange(fakeRows, i, panel.key);
      return {
        x: xOf(Y),
        lo: yOf(lo),
        hi: yOf(hi),
      };
    });
    const upper = band.map((point, i) => `${i ? "L" : "M"} ${point.x.toFixed(2)} ${point.hi.toFixed(2)}`).join(" ");
    const lower = [...band].reverse().map((point) => `L ${point.x.toFixed(2)} ${point.lo.toFixed(2)}`).join(" ");
    const fakePaths = fakeRows.map((rows, i) => (
      `<path d="${pathFromRows(rows, panel.key, yOf)}" fill="none" stroke="${panel.fake}" stroke-opacity="0.28" stroke-width="1.5"/>`
      + `<text x="${margin.left + plotW + 18}" y="${(yTop + 24 + i * 18).toFixed(2)}" fill="#a78bfa" font-size="11">seed ${report.fakeGroups[i].seed}</text>`
    )).join("\n");
    const realPath = `<path d="${pathFromRows(realRows, panel.key, yOf)}" fill="none" stroke="${panel.color}" stroke-width="3"/>`;
    const realDots = realRows.map((row) => `<circle cx="${xOf(row.Y).toFixed(2)}" cy="${yOf(row[panel.key]).toFixed(2)}" r="3.2" fill="${panel.color}"/>`).join("");
    return `<text x="${margin.left}" y="${(yTop - 18).toFixed(2)}" fill="#e5e7eb" font-size="15" font-weight="700">${panel.title}</text>
<rect x="${margin.left}" y="${yTop.toFixed(2)}" width="${plotW}" height="${panelH.toFixed(2)}" fill="#0b1626" stroke="#1f2937"/>
${ticks.join("\n")}
<path d="${upper} ${lower} Z" fill="${panel.fake}" fill-opacity="0.14"/>
${fakePaths}
${realPath}
${realDots}`;
  }).join("\n");
  const endpoint = report.endpointSummary;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<style>text{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}</style>
<rect width="100%" height="100%" fill="#07111f"/>
<text x="${margin.left}" y="30" fill="#e5e7eb" font-size="20" font-weight="700">CA/XA divisor-frontier recovery-debt bridge</text>
<text x="${margin.left}" y="52" fill="#94a3b8" font-size="13">cyan/green/gold = real CA/XA; violet/red bands = five fixed-shape fake-base controls; x-axis is frontier cutoff on log scale.</text>
${panelSvg}
<text x="${margin.left}" y="${height - 42}" fill="#94a3b8" font-size="13">Endpoint real: B=${endpoint.real.maxExtra}, open=${endpoint.real.openRuns}, debtL2=${fmt(endpoint.real.debtMicroL2, 3)} micro; fake endpoint B range ${endpoint.fakeRanges.maxExtra.map((v) => fmt(v, 0)).join("..")}, open range ${endpoint.fakeRanges.openRuns.map((v) => fmt(v, 0)).join("..")}.</text>
<text x="${margin.left}" y="${height - 22}" fill="#94a3b8" font-size="13">The visual supports a finite recovery-bound lead but also exposes a heterogeneous null and sparse-run dependence.</text>
</svg>`;
}

function makeMarkdown(report) {
  const lines = [];
  lines.push("# CA/XA recovery-debt bridge audit", "");
  lines.push("Candidate:");
  lines.push("use no-base CA/XA divisor-frontier runs as nonlinear recovery events. The main trace is `B(Y)=max extraStepsAfterNoBaseRun` among no-base runs started by frontier cutoff `Y`, with open runs and debt L2 as companion diagnostics.", "");
  lines.push(`Source: \`${report.inputPath}\`.`);
  lines.push(`Frontier range: ${report.frontierRange[0]}..${report.frontierRange[1]}.`, "");
  lines.push("## Endpoint trace", "");
  lines.push("| Y | real runs | real open | real B | real debtL2 micro | real deepest micro | fake B range | fake open range | fake debtL2 micro range |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (let i = 0; i < report.realEndpointRows.length; i++) {
    const row = report.realEndpointRows[i];
    const fakeB = seedRange(report.fakeEndpointRowsBySeed, i, "maxExtra");
    const fakeOpen = seedRange(report.fakeEndpointRowsBySeed, i, "openRuns");
    const fakeDebt = seedRange(report.fakeEndpointRowsBySeed, i, "debtMicroL2");
    lines.push(`| ${row.Y} | ${row.runsStarted} | ${row.openRuns} | ${row.maxExtra} | ${fmt(row.debtMicroL2, 3)} | ${fmt(row.deepestDebtMicro, 3)} | ${fmt(fakeB[0], 0)}..${fmt(fakeB[1], 0)} | ${fmt(fakeOpen[0], 0)}..${fmt(fakeOpen[1], 0)} | ${fmt(fakeDebt[0], 3)}..${fmt(fakeDebt[1], 3)} |`);
  }
  lines.push("");
  lines.push(`Real exponent fits on positive rows: \`B theta=${fmt(report.realExponents.maxExtra)}\`, \`open theta=${fmt(report.realExponents.openRuns)}\`, \`debtL2 theta=${fmt(report.realExponents.debtMicroL2)}\`.`);
  lines.push("");
  lines.push("## Real recovery runs", "");
  lines.push("| from frontier | to frontier | primes | recovered at | length | extra steps | total steps | debt micro | expected bases | recovery primes |");
  lines.push("| ---: | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |");
  for (const run of report.realGroup.runs) {
    lines.push(`| ${run.fromFrontier} | ${run.toFrontier} | ${run.primes.join(",")} | ${run.recoveredBy ?? "none"} | ${run.length} | ${run.extraStepsAfterNoBaseRun ?? "none"} | ${run.totalStepsToRecovery ?? "none"} | ${fmt(run.debtMicro, 3)} | ${fmt(run.expectedBaseCountTotal, 3)} | ${(run.recoveryPrimes || []).join(",")} |`);
  }
  lines.push("");
  lines.push("## Endpoint controls", "");
  lines.push("| group | no-base events | recovery runs | unrecovered runs | max prime-only run | max recovery-run length | max extra | max total steps | deepest debt micro | debtL2 micro |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  const endpointRows = [report.endpointSummary.real, ...report.endpointSummary.fakes];
  const groups = [report.realGroup, ...report.fakeGroups];
  for (let i = 0; i < endpointRows.length; i++) {
    const row = endpointRows[i];
    const group = groups[i];
    lines.push(`| ${group.label} | ${row.noBaseEvents} | ${group.recovery.runCount} | ${group.recovery.unrecoveredRuns} | ${group.primeOnlyNoBaseRuns.maxRunLength} | ${group.recovery.maxNoBaseRunLength} | ${group.recovery.maxExtraStepsAfterNoBaseRun} | ${group.recovery.maxTotalStepsToRecovery} | ${fmt(-(group.recovery.deepestCumulativeLogMargin || 0) * 1e6, 3)} | ${fmt(row.debtMicroL2, 3)} |`);
  }
  lines.push("");
  lines.push("## Fixed-shape fake runs", "");
  lines.push("| seed | started runs | open endpoint runs | max extra endpoint | max extra global | max total global | deepest debt micro | note |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |");
  for (let i = 0; i < report.fakeGroups.length; i++) {
    const group = report.fakeGroups[i];
    const row = report.endpointSummary.fakes[i];
    const note = group.runs.length === 0
      ? "no no-base events in this fake shape"
      : (group.recovery.unrecoveredRuns ? "has unrecovered no-base debt" : "all started debts recovered");
    lines.push(`| ${group.seed} | ${row.runsStarted} | ${row.openRuns} | ${row.maxExtra} | ${group.recovery.maxExtraStepsAfterNoBaseRun} | ${group.recovery.maxTotalStepsToRecovery} | ${fmt(-(group.recovery.deepestCumulativeLogMargin || 0) * 1e6, 3)} | ${note} |`);
  }
  lines.push("");
  lines.push("## Factor check", "");
  lines.push("This is not a linear transform of `pi`, `psi`, or a named gap-width residual. It is built from CA/XA transition log margins. But it is also not an independent critical line yet: `B(Y)` is exactly a finite prefix of the existing CA/XA no-base recovery conjecture, and the fake-shape null is heterogeneous, including seeds with zero no-base events and seeds with long unrecovered tails.");
  lines.push("");
  lines.push("## Files", "");
  lines.push(`- JSON: \`${report.jsonPath}\``);
  lines.push(`- SVG: \`${report.svgPath}\``);
  return `${lines.join("\n")}\n`;
}

const data = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const maxFrontier = data.summary.caXa.at(-1).frontier;
const realGroup = makeGroup("real CA/XA", realGapSummary(data));
const fakeGroups = data.cramerShapeContrast.map((row) => (
  makeGroup(`fake seed ${row.seed}`, gapSummaryFromContainer(row), { seed: row.seed })
));
const groups = [realGroup, ...fakeGroups];
const endpoints = collectEndpoints(groups, maxFrontier);
const realEndpointRows = endpointRows(realGroup, endpoints);
const fakeEndpointRowsBySeed = fakeGroups.map((group) => endpointRows(group, endpoints));
const endpointSummary = {
  real: summarizeAt(realGroup, maxFrontier),
  fakes: fakeGroups.map((group) => summarizeAt(group, maxFrontier)),
};
endpointSummary.fakeRanges = {
  maxExtra: range(endpointSummary.fakes.map((row) => row.maxExtra)),
  openRuns: range(endpointSummary.fakes.map((row) => row.openRuns)),
  debtMicroL2: range(endpointSummary.fakes.map((row) => row.debtMicroL2)),
  noBaseEvents: range(endpointSummary.fakes.map((row) => row.noBaseEvents)),
};

const report = {
  generatedAt: new Date().toISOString(),
  inputPath,
  object: "CA/XA recovery-debt bridge",
  frontierRange: [data.summary.caXa[0].frontier, maxFrontier],
  endpoints,
  realGroup,
  fakeGroups,
  realEndpointRows,
  fakeEndpointRowsBySeed,
  endpointSummary,
  realExponents: {
    maxExtra: exponent(realEndpointRows, "maxExtra"),
    openRuns: exponent(realEndpointRows, "openRuns"),
    debtMicroL2: exponent(realEndpointRows, "debtMicroL2"),
  },
};

fs.mkdirSync(outDir, { recursive: true });
const stem = "caxa-recovery-debt-audit";
const jsonPath = path.join(outDir, `${stem}.json`);
const mdPath = path.join(outDir, `${stem}.md`);
const svgPath = path.join(outDir, `${stem}.svg`);
report.jsonPath = jsonPath;
report.mdPath = mdPath;
report.svgPath = svgPath;
fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(mdPath, makeMarkdown(report));
fs.writeFileSync(svgPath, makeSvg(report));
console.log(JSON.stringify({
  ok: true,
  jsonPath,
  mdPath,
  svgPath,
  frontierRange: report.frontierRange,
  endpoint: {
    real: endpointSummary.real,
    fakeRanges: endpointSummary.fakeRanges,
  },
  realExponents: report.realExponents,
}, null, 2));
