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

function rms(values) {
  return Math.sqrt(mean(values.map((value) => value * value)));
}

function range(values) {
  if (!values.length) return [0, 0];
  return [Math.min(...values), Math.max(...values)];
}

function realGapSummary(data) {
  return data.summary.caStepDecompositionSummary.postFirstCaXa
    .criticalApproximationSummary.newFrontierGap;
}

function fakeGapSummary(row) {
  return row.caStepThresholdSummary.criticalApproximationSummary.newFrontierGap;
}

function collectRealPathSteps(data) {
  const byKey = new Map();
  for (const transition of data.summary.frontierTransitions || []) {
    for (const item of transition.caEndpointPath || []) {
      const step = item.quotientFromPreviousCA;
      if (!step?.heightStep?.primeStep || !step.numerator?.length) continue;
      const p = step.numerator[0].p;
      const primeStep = step.heightStep.primeStep;
      const key = `${step.fromIndex}:${step.toIndex}:${p}`;
      if (byKey.has(key)) continue;
      byKey.set(key, {
        fromIndex: step.fromIndex,
        toIndex: step.toIndex,
        fromFrontier: step.fromFrontier,
        toFrontier: step.toFrontier,
        p,
        oldExponent: primeStep.oldExponent,
        margin: step.heightStep.logGainMinusPenalty,
        marginMicro: step.heightStep.logGainMinusPenalty * 1e6,
        secondOrderGapOvershoot: primeStep.secondOrderGapOvershoot ?? null,
      });
    }
  }
  return [...byKey.values()].sort((a, b) => a.fromIndex - b.fromIndex || a.toIndex - b.toIndex);
}

function tokenForStep(step) {
  if (step.oldExponent === 0) return (step.secondOrderGapOvershoot ?? 0) > 0 ? "N+" : "N-";
  return `O${step.oldExponent}`;
}

function realStepsForRun(run, pathSteps) {
  const primes = new Set(run.recoveryPrimes || []);
  return pathSteps
    .filter((step) => (
      primes.has(step.p)
        && step.fromIndex >= run.fromIndex
        && step.toIndex <= run.recoveryIndex
    ))
    .sort((a, b) => a.fromIndex - b.fromIndex || a.toIndex - b.toIndex)
    .map((step) => ({ ...step, token: tokenForStep(step) }));
}

function summarizeRealPair(run, pathSteps) {
  const steps = realStepsForRun(run, pathSteps);
  const debtSteps = [];
  const slackSteps = [];
  const oldRepairSteps = [];
  let i = 0;
  while (i < steps.length && steps[i].token === "N+") {
    debtSteps.push(steps[i]);
    i++;
  }
  while (i < steps.length && steps[i].token === "N-") {
    slackSteps.push(steps[i]);
    i++;
  }
  while (i < steps.length) {
    oldRepairSteps.push(steps[i]);
    i++;
  }
  const debtMagnitude = -debtSteps.reduce((sum, step) => sum + step.margin, 0);
  const slackMargin = slackSteps.reduce((sum, step) => sum + step.margin, 0);
  const oldRepairMargin = oldRepairSteps.reduce((sum, step) => sum + step.margin, 0);
  const totalRepairMargin = slackMargin + oldRepairMargin;
  const rho = slackMargin > 0 && debtMagnitude > 0 ? slackMargin / debtMagnitude : null;
  const totalRho = totalRepairMargin > 0 && debtMagnitude > 0 ? totalRepairMargin / debtMagnitude : null;
  const className = slackSteps.length && !oldRepairSteps.length
    ? (debtSteps.length >= 3 ? "sameTypeCluster" : "sameTypeSingleton")
    : (oldRepairSteps.length ? "oldExponentRepair" : "unpaired");
  return {
    fromFrontier: run.fromFrontier,
    recoveredBy: run.recoveryFrontier,
    className,
    debtPrimes: debtSteps.map((step) => step.p),
    slackPrimes: slackSteps.map((step) => step.p),
    oldRepairPrimes: oldRepairSteps.map((step) => step.p),
    debtSteps: debtSteps.length,
    slackSteps: slackSteps.length,
    oldRepairSteps: oldRepairSteps.length,
    lagSteps: (slackSteps.length + oldRepairSteps.length),
    debtMicro: debtMagnitude * 1e6,
    slackMicro: slackMargin * 1e6,
    oldRepairMicro: oldRepairMargin * 1e6,
    totalRepairMicro: totalRepairMargin * 1e6,
    rho,
    logRho: rho ? Math.log(rho) : null,
    totalRho,
    logTotalRho: totalRho ? Math.log(totalRho) : null,
    finalSurplusMicro: (totalRepairMargin - debtMagnitude) * 1e6,
    steps,
  };
}

function fakePairRows(data) {
  return data.cramerShapeContrast.map((row) => {
    const gap = fakeGapSummary(row);
    const pairs = (gap.noBaseRecovery.runs || []).map((run) => {
      const debtMagnitude = Math.max(0, -(run.noBaseMarginTotal || run.minCumulativeLogMargin || 0));
      const newSlack = run.recovered ? (run.extraNewFrontierMarginTotal || 0) : 0;
      const oldSlack = run.recovered ? (run.extraNonNewFrontierMarginTotal || 0) : 0;
      const totalSlack = newSlack + oldSlack;
      const rho = newSlack > 0 && debtMagnitude > 0 ? newSlack / debtMagnitude : null;
      const totalRho = totalSlack > 0 && debtMagnitude > 0 ? totalSlack / debtMagnitude : null;
      const className = !run.recovered
        ? "open"
        : (run.extraNonNewFrontierSteps ? "oldOrMixedRepair" : "sameTypeCoarse");
      return {
        fromFrontier: run.fromFrontier,
        recoveredBy: run.recoveryFrontier ?? null,
        className,
        recovered: run.recovered,
        debtSteps: run.length,
        slackSteps: run.extraNewFrontierSteps || 0,
        oldRepairSteps: run.extraNonNewFrontierSteps || 0,
        lagSteps: run.extraStepsAfterNoBaseRun || 0,
        debtMicro: debtMagnitude * 1e6,
        slackMicro: newSlack * 1e6,
        oldRepairMicro: oldSlack * 1e6,
        totalRepairMicro: totalSlack * 1e6,
        rho,
        logRho: rho ? Math.log(rho) : null,
        totalRho,
        logTotalRho: totalRho ? Math.log(totalRho) : null,
      };
    });
    const same = pairs.filter((pair) => pair.className === "sameTypeCoarse" && pair.rho);
    const nontrivialSame = same.filter((pair) => pair.debtSteps >= 3);
    return {
      seed: row.seed,
      pairs,
      pairCount: pairs.length,
      recoveredPairs: pairs.filter((pair) => pair.recovered).length,
      openPairs: pairs.filter((pair) => !pair.recovered).length,
      sameTypePairs: same.length,
      nontrivialSameTypePairs: nontrivialSame.length,
      sameTypeRmsLogRho: same.length ? rms(same.map((pair) => pair.logRho)) : 0,
      nontrivialSameTypeRmsLogRho: nontrivialSame.length ? rms(nontrivialSame.map((pair) => pair.logRho)) : 0,
      maxLagSteps: pairs.reduce((max, pair) => Math.max(max, pair.lagSteps || 0), 0),
    };
  });
}

function endpointRows(realPairs, fakeGroups, endpoints) {
  const realRows = endpoints.map((Y) => {
    const closed = realPairs.filter((pair) => pair.recoveredBy <= Y);
    const same = closed.filter((pair) => pair.className.startsWith("sameType") && pair.rho);
    const clusters = closed.filter((pair) => pair.className === "sameTypeCluster" && pair.rho);
    return {
      Y,
      closedPairs: closed.length,
      sameTypePairs: same.length,
      clusterPairs: clusters.length,
      sameTypeRmsLogRho: same.length ? rms(same.map((pair) => pair.logRho)) : 0,
      clusterRmsLogRho: clusters.length ? rms(clusters.map((pair) => pair.logRho)) : 0,
      openReal: realPairs.filter((pair) => pair.fromFrontier <= Y && pair.recoveredBy > Y).length,
    };
  });
  const fakeRowsBySeed = fakeGroups.map((group) => endpoints.map((Y) => {
    const closed = group.pairs.filter((pair) => pair.recovered && pair.recoveredBy <= Y);
    const open = group.pairs.filter((pair) => pair.fromFrontier <= Y && (!pair.recovered || pair.recoveredBy > Y));
    const same = closed.filter((pair) => pair.className === "sameTypeCoarse" && pair.rho);
    const clusters = same.filter((pair) => pair.debtSteps >= 3);
    return {
      Y,
      closedPairs: closed.length,
      sameTypePairs: same.length,
      clusterPairs: clusters.length,
      sameTypeRmsLogRho: same.length ? rms(same.map((pair) => pair.logRho)) : 0,
      clusterRmsLogRho: clusters.length ? rms(clusters.map((pair) => pair.logRho)) : 0,
      openPairs: open.length,
    };
  }));
  return { realRows, fakeRowsBySeed };
}

function makeSvg(report) {
  const width = 1240;
  const height = 760;
  const margin = { left: 74, right: 310, top: 112, bottom: 76 };
  const panelGap = 48;
  const panelH = (height - margin.top - margin.bottom - panelGap) / 2;
  const plotW = width - margin.left - margin.right;
  const xMin = Math.log(report.frontierRange[0]);
  const xMax = Math.log(report.frontierRange[1]);
  const xOf = (Y) => margin.left + ((Math.log(Y) - xMin) / (xMax - xMin)) * plotW;
  const fakeRangeAt = (i, key) => range(report.fakeRowsBySeed.map((rows) => rows[i][key]));
  const pathFrom = (rows, key, yOf) => rows.map((row, i) => (
    `${i ? "L" : "M"} ${xOf(row.Y).toFixed(2)} ${yOf(row[key]).toFixed(2)}`
  )).join(" ");
  const panel = (title, key, color, fakeColor, index) => {
    const yTop = margin.top + index * (panelH + panelGap);
    const maxValue = Math.max(
      0.05,
      ...report.realRows.map((row) => row[key]),
      ...report.fakeRowsBySeed.flatMap((rows) => rows.map((row) => row[key])),
    ) * 1.18;
    const yOf = (value) => yTop + (1 - value / maxValue) * panelH;
    const grid = [];
    for (let i = 0; i <= 4; i++) {
      const y = yTop + (i / 4) * panelH;
      const value = maxValue - (i / 4) * maxValue;
      grid.push(`<line x1="${margin.left}" y1="${y.toFixed(2)}" x2="${(margin.left + plotW).toFixed(2)}" y2="${y.toFixed(2)}" stroke="#1f2937"/>`);
      grid.push(`<text x="20" y="${(y + 4).toFixed(2)}" fill="#94a3b8" font-size="12">${fmt(value, 2)}</text>`);
    }
    const band = report.endpoints.map((Y, i) => {
      const [lo, hi] = fakeRangeAt(i, key);
      return { x: xOf(Y), lo: yOf(lo), hi: yOf(hi) };
    });
    const upper = band.map((point, i) => `${i ? "L" : "M"} ${point.x.toFixed(2)} ${point.hi.toFixed(2)}`).join(" ");
    const lower = [...band].reverse().map((point) => `L ${point.x.toFixed(2)} ${point.lo.toFixed(2)}`).join(" ");
    const fakePaths = report.fakeRowsBySeed.map((rows, i) => (
      `<path d="${pathFrom(rows, key, yOf)}" fill="none" stroke="${fakeColor}" stroke-opacity="0.26" stroke-width="1.4"/>`
      + `<text x="${margin.left + plotW + 18}" y="${(yTop + 24 + i * 18).toFixed(2)}" fill="#a78bfa" font-size="11">seed ${report.fakeGroups[i].seed}</text>`
    )).join("\n");
    const realPath = `<path d="${pathFrom(report.realRows, key, yOf)}" fill="none" stroke="${color}" stroke-width="3"/>`;
    const dots = report.realRows.map((row) => `<circle cx="${xOf(row.Y).toFixed(2)}" cy="${yOf(row[key]).toFixed(2)}" r="3.2" fill="${color}"/>`).join("");
    return `<text x="${margin.left}" y="${(yTop - 18).toFixed(2)}" fill="#e5e7eb" font-size="15" font-weight="700">${title}</text>
<rect x="${margin.left}" y="${yTop.toFixed(2)}" width="${plotW}" height="${panelH.toFixed(2)}" fill="#0b1626" stroke="#1f2937"/>
${grid.join("\n")}
<path d="${upper} ${lower} Z" fill="${fakeColor}" fill-opacity="0.14"/>
${fakePaths}
${realPath}
${dots}`;
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<style>text{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}</style>
<rect width="100%" height="100%" fill="#07111f"/>
<text x="${margin.left}" y="30" fill="#e5e7eb" font-size="20" font-weight="700">CA/XA slack-pairing balance</text>
<text x="${margin.left}" y="52" fill="#94a3b8" font-size="13">cyan = real detailed same-type pairs; violet = coarse fixed-shape fake summaries; y-axis is rms log(slack/debt).</text>
${panel("same-type pair imbalance", "sameTypeRmsLogRho", "#67e8f9", "#8b5cf6", 0)}
${panel("nontrivial cluster imbalance", "clusterRmsLogRho", "#34d399", "#a78bfa", 1)}
<text x="${margin.left}" y="${height - 38}" fill="#cbd5e1" font-size="13">Endpoint real: all same-type rms=${fmt(report.summary.realSameTypeRmsLogRho, 4)}, cluster rms=${fmt(report.summary.realClusterRmsLogRho, 4)}.</text>
<text x="${margin.left}" y="${height - 18}" fill="#94a3b8" font-size="13">The singleton overpay and two-cluster sample keep this as a finite CA/XA margin diagnostic, not a critical line.</text>
</svg>`;
}

function makeMarkdown(report) {
  const lines = [];
  lines.push("# CA/XA slack-pairing balance audit", "");
  lines.push("Candidate:");
  lines.push("pair each maximal `N+` no-base debt block against the immediately following `N-` new-frontier slack block. Score `rho=slackMargin/debtMagnitude` and track rms `log(rho)` over frontier cutoffs.", "");
  lines.push(`Source: \`${report.inputPath}\`.`);
  lines.push(`Frontier range: ${report.frontierRange[0]}..${report.frontierRange[1]}.`, "");
  lines.push("## Real pairs", "");
  lines.push("| from | class | debt primes | slack primes | old repair | debt micro | slack micro | old micro | rho | log rho | final surplus micro |");
  lines.push("| ---: | --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const pair of report.realPairs) {
    lines.push(`| ${pair.fromFrontier} | ${pair.className} | ${pair.debtPrimes.join(",") || "none"} | ${pair.slackPrimes.join(",") || "none"} | ${pair.oldRepairPrimes.join(",") || "none"} | ${fmt(pair.debtMicro, 6)} | ${fmt(pair.slackMicro, 6)} | ${fmt(pair.oldRepairMicro, 6)} | ${pair.rho ? fmt(pair.rho, 6) : "NA"} | ${pair.logRho ? fmt(pair.logRho, 6) : "NA"} | ${fmt(pair.finalSurplusMicro, 6)} |`);
  }
  lines.push("");
  lines.push("## Endpoint trace", "");
  lines.push("| Y | real same pairs | real same rms log rho | real cluster pairs | real cluster rms log rho | fake same rms range | fake cluster rms range | fake open range |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (let i = 0; i < report.realRows.length; i++) {
    const row = report.realRows[i];
    const fakeSame = range(report.fakeRowsBySeed.map((rows) => rows[i].sameTypeRmsLogRho));
    const fakeCluster = range(report.fakeRowsBySeed.map((rows) => rows[i].clusterRmsLogRho));
    const fakeOpen = range(report.fakeRowsBySeed.map((rows) => rows[i].openPairs));
    lines.push(`| ${row.Y} | ${row.sameTypePairs} | ${fmt(row.sameTypeRmsLogRho, 6)} | ${row.clusterPairs} | ${fmt(row.clusterRmsLogRho, 6)} | ${fmt(fakeSame[0], 6)}..${fmt(fakeSame[1], 6)} | ${fmt(fakeCluster[0], 6)}..${fmt(fakeCluster[1], 6)} | ${fakeOpen[0]}..${fakeOpen[1]} |`);
  }
  lines.push("");
  lines.push("## Fixed-shape coarse controls", "");
  lines.push("| seed | pairs | recovered | open | same-type coarse | cluster coarse | same rms log rho | cluster rms log rho | max lag |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const group of report.fakeGroups) {
    lines.push(`| ${group.seed} | ${group.pairCount} | ${group.recoveredPairs} | ${group.openPairs} | ${group.sameTypePairs} | ${group.nontrivialSameTypePairs} | ${fmt(group.sameTypeRmsLogRho, 6)} | ${fmt(group.nontrivialSameTypeRmsLogRho, 6)} | ${group.maxLagSteps} |`);
  }
  lines.push("");
  lines.push("## Factor check", "");
  lines.push("This statistic uses row-level CA/XA prime-step margins, not `pi`, `psi`, zeta, zeros, or gap-width buckets. The break is internal: `rho` is built directly from the same local margin formula that defines recovery. It is therefore a CA/XA bookkeeping invariant unless it can be proven or compared against same-resolution fake path rows.", "");
  lines.push("## Files", "");
  lines.push(`- JSON: \`${report.jsonPath}\``);
  lines.push(`- SVG: \`${report.svgPath}\``);
  return `${lines.join("\n")}\n`;
}

const data = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const frontierRange = [data.summary.caXa[0].frontier, data.summary.caXa.at(-1).frontier];
const pathSteps = collectRealPathSteps(data);
const realPairs = (realGapSummary(data).noBaseRecovery.runs || [])
  .map((run) => summarizeRealPair(run, pathSteps));
const fakeGroups = fakePairRows(data);
const endpointSet = new Set([frontierRange[0], frontierRange[1]]);
for (const pair of realPairs) {
  endpointSet.add(pair.fromFrontier);
  endpointSet.add(pair.recoveredBy);
}
for (const group of fakeGroups) {
  for (const pair of group.pairs) {
    endpointSet.add(pair.fromFrontier);
    if (pair.recoveredBy) endpointSet.add(pair.recoveredBy);
  }
}
const endpoints = [...endpointSet]
  .filter((Y) => Number.isFinite(Y) && Y >= frontierRange[0] && Y <= frontierRange[1])
  .sort((a, b) => a - b);
const { realRows, fakeRowsBySeed } = endpointRows(realPairs, fakeGroups, endpoints);
const sameTypePairs = realPairs.filter((pair) => pair.className.startsWith("sameType") && pair.rho);
const clusterPairs = realPairs.filter((pair) => pair.className === "sameTypeCluster" && pair.rho);

const report = {
  generatedAt: new Date().toISOString(),
  inputPath,
  object: "CA/XA slack-pairing balance",
  frontierRange,
  realPairs,
  fakeGroups,
  endpoints,
  realRows,
  fakeRowsBySeed,
  summary: {
    realPairCount: realPairs.length,
    realSameTypePairs: sameTypePairs.length,
    realClusterPairs: clusterPairs.length,
    realSameTypeRmsLogRho: sameTypePairs.length ? rms(sameTypePairs.map((pair) => pair.logRho)) : 0,
    realClusterRmsLogRho: clusterPairs.length ? rms(clusterPairs.map((pair) => pair.logRho)) : 0,
    realClusterRhoRange: range(clusterPairs.map((pair) => pair.rho)),
    fakeSameTypeRmsLogRhoRange: range(fakeGroups.map((group) => group.sameTypeRmsLogRho)),
    fakeClusterRmsLogRhoRange: range(fakeGroups.map((group) => group.nontrivialSameTypeRmsLogRho)),
    fakeOpenPairRange: range(fakeGroups.map((group) => group.openPairs)),
  },
};

fs.mkdirSync(outDir, { recursive: true });
const stem = "caxa-slack-pairing-audit";
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
  summary: report.summary,
  realPairs: report.realPairs.map((pair) => ({
    fromFrontier: pair.fromFrontier,
    className: pair.className,
    debtPrimes: pair.debtPrimes,
    slackPrimes: pair.slackPrimes,
    oldRepairPrimes: pair.oldRepairPrimes,
    rho: pair.rho,
    logRho: pair.logRho,
    finalSurplusMicro: pair.finalSurplusMicro,
  })),
}, null, 2));
