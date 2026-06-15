#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const inputPath = process.argv[2] || "logs/divisor-extremes-artifacts/ca-xa-transitions.json";
const outDir = process.argv[3] || "logs/playground-artifacts";

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "nan";
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
        secondOrderThresholdMinusFrontier: primeStep.secondOrderThresholdMinusFrontier ?? null,
        criticalP: primeStep.criticalP ?? null,
        criticalRatio: primeStep.criticalRatio ?? null,
      });
    }
  }
  return [...byKey.values()].sort((a, b) => a.fromIndex - b.fromIndex || a.toIndex - b.toIndex);
}

function tokenForStep(step) {
  if (step.oldExponent === 0) {
    if ((step.secondOrderGapOvershoot ?? 0) > 0) return "N+";
    return "N-";
  }
  return `O${step.oldExponent}`;
}

function compactTokenRun(tokens) {
  const parts = [];
  for (const token of tokens) {
    const prev = parts.at(-1);
    if (prev?.token === token) prev.count++;
    else parts.push({ token, count: 1 });
  }
  return parts.map((part) => part.count === 1 ? part.token : `${part.token}^${part.count}`).join(" ");
}

function summarizeRealRun(run, pathSteps) {
  const stepSet = new Set(run.recoveryPrimes || []);
  const steps = pathSteps.filter((step) => (
    stepSet.has(step.p)
      && step.fromIndex >= run.fromIndex
      && step.toIndex <= run.recoveryIndex
  ));
  const ordered = steps.sort((a, b) => a.fromIndex - b.fromIndex || a.toIndex - b.toIndex);
  const tokens = ordered.map(tokenForStep);
  let cumulative = 0;
  const detailedSteps = ordered.map((step) => {
    cumulative += step.margin;
    return {
      ...step,
      token: tokenForStep(step),
      cumulativeMargin: cumulative,
      cumulativeMarginMicro: cumulative * 1e6,
    };
  });
  const word = tokens.join(" ");
  return {
    fromFrontier: run.fromFrontier,
    toFrontier: run.toFrontier,
    recoveredBy: run.recoveryFrontier,
    recovered: run.recovered,
    length: run.length,
    totalStepsToRecovery: run.totalStepsToRecovery,
    extraStepsAfterNoBaseRun: run.extraStepsAfterNoBaseRun,
    noBasePrimes: run.primes,
    recoveryPrimes: run.recoveryPrimes,
    word,
    compactWord: compactTokenRun(tokens),
    wordLength: tokens.length,
    distinctTokens: [...new Set(tokens)],
    detailedSteps,
    finalCumulativeMargin: cumulative,
    finalCumulativeMarginMicro: cumulative * 1e6,
    minCumulativeLogMargin: run.minCumulativeLogMargin,
    debtMicro: Math.max(0, -run.minCumulativeLogMargin) * 1e6,
    expectedBaseCountTotal: run.expectedBaseCountTotal,
    matchedStepCount: detailedSteps.length,
    missingStepCount: (run.recoveryPrimes || []).length - detailedSteps.length,
  };
}

function coarseWordForRun(run) {
  const parts = [`N+^${run.length}`];
  if (!run.recovered) return `OPEN ${parts.join(" ")}`;
  const below = run.extraBelowP2Steps || 0;
  const newOther = Math.max(0, (run.extraNewFrontierSteps || 0) - below);
  const old = run.extraNonNewFrontierSteps || 0;
  if (below) parts.push(`N-^${below}`);
  if (newOther) parts.push(`N?^${newOther}`);
  if (old) parts.push(`O?^${old}`);
  return parts.join(" ");
}

function fakeGroup(row) {
  const gap = fakeGapSummary(row);
  const runs = (gap.noBaseRecovery.runs || []).map((run) => ({
    fromFrontier: run.fromFrontier,
    toFrontier: run.toFrontier,
    recoveredBy: run.recoveryFrontier ?? null,
    recovered: run.recovered,
    length: run.length,
    totalStepsToRecovery: run.totalStepsToRecovery,
    extraStepsAfterNoBaseRun: run.extraStepsAfterNoBaseRun,
    extraNewFrontierSteps: run.extraNewFrontierSteps || 0,
    extraNonNewFrontierSteps: run.extraNonNewFrontierSteps || 0,
    extraBelowP2Steps: run.extraBelowP2Steps || 0,
    wordLength: run.totalStepsToRecovery || run.length,
    coarseWord: coarseWordForRun(run),
    debtMicro: Math.max(0, -(run.minCumulativeLogMargin || 0)) * 1e6,
  }));
  const recoveredWords = new Set(runs.filter((run) => run.recovered).map((run) => run.coarseWord));
  const openWords = new Set(runs.filter((run) => !run.recovered).map((run) => run.coarseWord));
  return {
    label: `seed ${row.seed}`,
    seed: row.seed,
    runs,
    runCount: gap.noBaseRecovery.runCount,
    recoveredRuns: runs.filter((run) => run.recovered).length,
    unrecoveredRuns: gap.noBaseRecovery.unrecoveredRuns,
    distinctCoarseWords: new Set(runs.map((run) => run.coarseWord)).size,
    distinctRecoveredCoarseWords: recoveredWords.size,
    distinctOpenCoarseWords: openWords.size,
    maxWordLength: runs.reduce((max, run) => Math.max(max, run.wordLength || 0), 0),
    maxExtraStepsAfterNoBaseRun: gap.noBaseRecovery.maxExtraStepsAfterNoBaseRun,
    deepestDebtMicro: Math.max(0, -(gap.noBaseRecovery.deepestCumulativeLogMargin || 0)) * 1e6,
  };
}

function rowsAtEndpoints(realWords, fakeGroups, endpoints) {
  const realRows = endpoints.map((Y) => {
    const started = realWords.filter((word) => word.fromFrontier <= Y);
    const recovered = started.filter((word) => word.recoveredBy <= Y);
    const open = started.length - recovered.length;
    return {
      Y,
      distinctWords: new Set(recovered.map((word) => word.compactWord)).size,
      recoveredRuns: recovered.length,
      openRuns: open,
      maxWordLength: recovered.reduce((max, word) => Math.max(max, word.wordLength), 0),
    };
  });
  const fakeRowsBySeed = fakeGroups.map((group) => endpoints.map((Y) => {
    const started = group.runs.filter((run) => run.fromFrontier <= Y);
    const recovered = started.filter((run) => run.recovered && run.recoveredBy <= Y);
    const open = started.filter((run) => !run.recovered || (run.recoveredBy && run.recoveredBy > Y));
    return {
      Y,
      distinctWords: new Set(recovered.map((run) => run.coarseWord)).size,
      recoveredRuns: recovered.length,
      openRuns: open.length,
      maxWordLength: recovered.reduce((max, run) => Math.max(max, run.wordLength || 0), 0),
    };
  }));
  return { realRows, fakeRowsBySeed };
}

function makeSvg(report) {
  const width = 1240;
  const height = 760;
  const margin = { left: 74, right: 300, top: 112, bottom: 76 };
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
      1,
      ...report.realRows.map((row) => row[key]),
      ...report.fakeRowsBySeed.flatMap((rows) => rows.map((row) => row[key])),
    ) * 1.14;
    const yOf = (value) => yTop + (1 - value / maxValue) * panelH;
    const grid = [];
    for (let i = 0; i <= 4; i++) {
      const y = yTop + (i / 4) * panelH;
      const value = maxValue - (i / 4) * maxValue;
      grid.push(`<line x1="${margin.left}" y1="${y.toFixed(2)}" x2="${(margin.left + plotW).toFixed(2)}" y2="${y.toFixed(2)}" stroke="#1f2937"/>`);
      grid.push(`<text x="24" y="${(y + 4).toFixed(2)}" fill="#94a3b8" font-size="12">${fmt(value, 1)}</text>`);
    }
    const band = report.endpoints.map((Y, i) => {
      const [lo, hi] = fakeRangeAt(i, key);
      return { x: xOf(Y), lo: yOf(lo), hi: yOf(hi) };
    });
    const upper = band.map((point, i) => `${i ? "L" : "M"} ${point.x.toFixed(2)} ${point.hi.toFixed(2)}`).join(" ");
    const lower = [...band].reverse().map((point) => `L ${point.x.toFixed(2)} ${point.lo.toFixed(2)}`).join(" ");
    const fakePaths = report.fakeRowsBySeed.map((rows, i) => (
      `<path d="${pathFrom(rows, key, yOf)}" fill="none" stroke="${fakeColor}" stroke-opacity="0.28" stroke-width="1.5"/>`
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
  const realWords = report.realWords.map((word) => word.compactWord).join(" | ");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<style>text{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}</style>
<rect width="100%" height="100%" fill="#07111f"/>
<text x="${margin.left}" y="30" fill="#e5e7eb" font-size="20" font-weight="700">CA/XA recovery grammar compression</text>
<text x="${margin.left}" y="52" fill="#94a3b8" font-size="13">cyan/gold = detailed real words; violet bands = coarse fixed-shape fake summaries; x-axis is frontier cutoff.</text>
${panel("distinct closed recovery words G(Y)", "distinctWords", "#67e8f9", "#8b5cf6", 0)}
${panel("open recovery tails", "openRuns", "#fbbf24", "#fb7185", 1)}
<text x="${margin.left}" y="${height - 38}" fill="#cbd5e1" font-size="13">Real compact words: ${realWords}</text>
<text x="${margin.left}" y="${height - 18}" fill="#94a3b8" font-size="13">The trace is a small grammar, but only four real words and fake summaries are coarser than real path data.</text>
</svg>`;
}

function makeMarkdown(report) {
  const lines = [];
  lines.push("# CA/XA recovery grammar compression audit", "");
  lines.push("Candidate:");
  lines.push("encode every real no-base recovery episode as a word over `N+`, `N-`, and `Oe`, then track `G(Y)`, the number of distinct closed recovery words up to frontier cutoff `Y`. Fixed-shape fake controls only expose coarse recovery summaries, so their words are coarser upper-level diagnostics.", "");
  lines.push(`Source: \`${report.inputPath}\`.`);
  lines.push(`Frontier range: ${report.frontierRange[0]}..${report.frontierRange[1]}.`, "");
  lines.push("## Real detailed words", "");
  lines.push("| from | recovered by | primes | compact word | word length | debt micro | final cumulative micro | matched steps |");
  lines.push("| ---: | ---: | --- | --- | ---: | ---: | ---: | ---: |");
  for (const word of report.realWords) {
    lines.push(`| ${word.fromFrontier} | ${word.recoveredBy} | ${word.recoveryPrimes.join(",")} | \`${word.compactWord}\` | ${word.wordLength} | ${fmt(word.debtMicro, 3)} | ${fmt(word.finalCumulativeMarginMicro, 6)} | ${word.matchedStepCount}/${word.recoveryPrimes.length} |`);
  }
  lines.push("");
  lines.push("## Real step grammar", "");
  lines.push("| run frontier | token | p | old exp | margin micro | cumulative micro | overshoot |");
  lines.push("| ---: | --- | ---: | ---: | ---: | ---: | ---: |");
  for (const word of report.realWords) {
    for (const step of word.detailedSteps) {
      lines.push(`| ${word.fromFrontier} | \`${step.token}\` | ${step.p} | ${step.oldExponent} | ${fmt(step.marginMicro, 6)} | ${fmt(step.cumulativeMarginMicro, 6)} | ${step.secondOrderGapOvershoot === null ? "NA" : fmt(step.secondOrderGapOvershoot, 6)} |`);
    }
  }
  lines.push("");
  lines.push("## Endpoint trace", "");
  lines.push("| Y | real distinct closed words | real open | fake distinct range | fake open range |");
  lines.push("| ---: | ---: | ---: | ---: | ---: |");
  for (let i = 0; i < report.realRows.length; i++) {
    const row = report.realRows[i];
    const fakeDistinct = range(report.fakeRowsBySeed.map((rows) => rows[i].distinctWords));
    const fakeOpen = range(report.fakeRowsBySeed.map((rows) => rows[i].openRuns));
    lines.push(`| ${row.Y} | ${row.distinctWords} | ${row.openRuns} | ${fakeDistinct[0]}..${fakeDistinct[1]} | ${fakeOpen[0]}..${fakeOpen[1]} |`);
  }
  lines.push("");
  lines.push("## Fixed-shape coarse controls", "");
  lines.push("| seed | runs | recovered | unrecovered | distinct coarse words | recovered word types | open word types | max word length | deepest debt micro | example words |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |");
  for (const group of report.fakeGroups) {
    const examples = [...new Set(group.runs.map((run) => run.coarseWord))]
      .slice(0, 5)
      .map((word) => `\`${word}\``)
      .join(", ");
    lines.push(`| ${group.seed} | ${group.runCount} | ${group.recoveredRuns} | ${group.unrecoveredRuns} | ${group.distinctCoarseWords} | ${group.distinctRecoveredCoarseWords} | ${group.distinctOpenCoarseWords} | ${group.maxWordLength} | ${fmt(group.deepestDebtMicro, 3)} | ${examples || "none"} |`);
  }
  lines.push("");
  lines.push("## Factor check", "");
  lines.push("The construction does not use `pi`, `psi`, zeta, zeros, or gap-width buckets. It is a local CA/XA transition grammar built from divisor-frontier prime-step margins. That is also the break: the words are just the local CA/XA factorization grammar, and the real detailed sample has only four debt episodes. The fake controls are not strictly comparable because the artifact stores coarse recovery summaries rather than detailed fake path steps.", "");
  lines.push("## Files", "");
  lines.push(`- JSON: \`${report.jsonPath}\``);
  lines.push(`- SVG: \`${report.svgPath}\``);
  return `${lines.join("\n")}\n`;
}

const data = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const frontierRange = [data.summary.caXa[0].frontier, data.summary.caXa.at(-1).frontier];
const pathSteps = collectRealPathSteps(data);
const realRuns = realGapSummary(data).noBaseRecovery.runs || [];
const realWords = realRuns.map((run) => summarizeRealRun(run, pathSteps));
const fakeGroups = data.cramerShapeContrast.map(fakeGroup);
const endpointSet = new Set([
  frontierRange[0],
  151,
  541,
  1000,
  1439,
  2000,
  2677,
  frontierRange[1],
]);
for (const word of realWords) {
  endpointSet.add(word.fromFrontier);
  endpointSet.add(word.recoveredBy);
}
for (const group of fakeGroups) {
  for (const run of group.runs) {
    endpointSet.add(run.fromFrontier);
    if (run.recoveredBy) endpointSet.add(run.recoveredBy);
  }
}
const endpoints = [...endpointSet]
  .filter((Y) => Number.isFinite(Y) && Y >= frontierRange[0] && Y <= frontierRange[1])
  .sort((a, b) => a - b);
const { realRows, fakeRowsBySeed } = rowsAtEndpoints(realWords, fakeGroups, endpoints);

const report = {
  generatedAt: new Date().toISOString(),
  inputPath,
  object: "CA/XA recovery grammar compression",
  frontierRange,
  realWords,
  fakeGroups,
  endpoints,
  realRows,
  fakeRowsBySeed,
  summary: {
    realDistinctClosedWords: new Set(realWords.map((word) => word.compactWord)).size,
    realWords: realWords.length,
    realUnmatchedSteps: realWords.reduce((sum, word) => sum + word.missingStepCount, 0),
    realClosedWords: realWords.filter((word) => word.recovered).length,
    fakeDistinctCoarseWordRange: range(fakeGroups.map((group) => group.distinctCoarseWords)),
    fakeUnrecoveredRunRange: range(fakeGroups.map((group) => group.unrecoveredRuns)),
    fakeMaxWordLengthRange: range(fakeGroups.map((group) => group.maxWordLength)),
  },
};

fs.mkdirSync(outDir, { recursive: true });
const stem = "caxa-recovery-grammar-audit";
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
  realWords: report.realWords.map((word) => ({
    fromFrontier: word.fromFrontier,
    compactWord: word.compactWord,
    recoveryPrimes: word.recoveryPrimes,
    finalCumulativeMarginMicro: word.finalCumulativeMarginMicro,
    missingStepCount: word.missingStepCount,
  })),
  fakeGroups: report.fakeGroups.map((group) => ({
    seed: group.seed,
    runs: group.runCount,
    recoveredRuns: group.recoveredRuns,
    unrecoveredRuns: group.unrecoveredRuns,
    distinctCoarseWords: group.distinctCoarseWords,
    maxWordLength: group.maxWordLength,
  })),
}, null, 2));
