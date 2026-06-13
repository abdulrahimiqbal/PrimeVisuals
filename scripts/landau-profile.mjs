#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { cramerPrimes, primesUpTo } from "../src/core/math.js";

const DEFAULT_RANGES = [1000, 5000];
const DEFAULT_SEEDS = [12345, 271828, 314159, 161803, 424242];

function groupsFromBases(bases, N) {
  return bases
    .filter((p) => p <= N)
    .map((p) => {
      const opts = [];
      for (let q = p, e = 1; q <= N; q *= p, e++) {
        opts.push({ weight: q, profit: Math.log(q), base: p, exp: e });
        if (q > Math.floor(N / p)) break;
      }
      return opts;
    });
}

function landauDpFromBases(bases, N) {
  const groups = groupsFromBases(bases, N);
  let dp = new Float64Array(N + 1);
  const choices = [];
  for (const opts of groups) {
    const next = new Float64Array(dp);
    const choice = new Int16Array(N + 1);
    for (let oi = 0; oi < opts.length; oi++) {
      const opt = opts[oi];
      for (let cap = opt.weight; cap <= N; cap++) {
        const cand = dp[cap - opt.weight] + opt.profit;
        if (cand > next[cap] + 1e-14) {
          next[cap] = cand;
          choice[cap] = oi + 1;
        }
      }
    }
    choices.push(choice);
    dp = next;
  }

  function profile(capacity) {
    let cap = capacity;
    const parts = [];
    for (let gi = groups.length - 1; gi >= 0; gi--) {
      const ci = choices[gi][cap];
      if (!ci) continue;
      const opt = groups[gi][ci - 1];
      parts.push(opt);
      cap -= opt.weight;
    }
    parts.sort((a, b) => a.weight - b.weight || a.base - b.base);
    const length = parts.reduce((s, x) => s + x.weight, 0);
    const selectedBases = new Set(parts.map((x) => x.base));
    const selectedWeights = parts.map((x) => x.weight).sort((a, b) => a - b);
    const maxBase = parts.length ? Math.max(...parts.map((x) => x.base)) : 0;
    const belowFrontier = bases.filter((p) => p < maxBase);
    const holes = belowFrontier.filter((p) => !selectedBases.has(p));
    const slack = capacity - length;
    const shieldViolations = [];
    for (const p of holes) {
      for (const q of selectedWeights) {
        if (q >= p - slack && q < p) shieldViolations.push({ omitted: p, selectedWeight: q, slack });
      }
    }
    let maxHoleRun = 0, run = 0;
    for (const p of belowFrontier) {
      if (selectedBases.has(p)) run = 0;
      else {
        run++;
        maxHoleRun = Math.max(maxHoleRun, run);
      }
    }
    return {
      n: capacity,
      logG: dp[capacity],
      length,
      slack,
      partCount: parts.length,
      maxPart: parts.length ? Math.max(...parts.map((x) => x.weight)) : 0,
      maxBase,
      holes: holes.length,
      maxHoleRun,
      shieldViolations: shieldViolations.length,
      parts: parts.map((x) => ({ weight: x.weight, base: x.base, exp: x.exp })),
    };
  }

  return { profile };
}

function summarizeProfiles(label, bases, N) {
  const dp = landauDpFromBases(bases, N);
  const lo = Math.floor(N / 2);
  const sample = [];
  let count = 0, holes = 0, maxHoles = 0, maxHoleRun = 0;
  let slackSum = 0, maxSlack = 0, violations = 0;
  let frontierSum = 0, logGSum = 0;
  const worstHoles = [];
  for (let n = lo; n <= N; n++) {
    const p = dp.profile(n);
    count++;
    holes += p.holes;
    maxHoles = Math.max(maxHoles, p.holes);
    maxHoleRun = Math.max(maxHoleRun, p.maxHoleRun);
    slackSum += p.slack;
    maxSlack = Math.max(maxSlack, p.slack);
    violations += p.shieldViolations;
    frontierSum += p.maxBase;
    logGSum += p.logG;
    if (n === lo || n === N || n === Math.floor((lo + N) / 2)) sample.push(p);
    worstHoles.push(p);
  }
  worstHoles.sort((a, b) => b.holes - a.holes || b.maxHoleRun - a.maxHoleRun || a.n - b.n);
  return {
    label,
    N,
    window: [lo, N],
    count,
    avgHoles: holes / count,
    maxHoles,
    maxHoleRun,
    avgSlack: slackSum / count,
    maxSlack,
    exchangeShieldViolations: violations,
    avgFrontierBase: frontierSum / count,
    avgLogG: logGSum / count,
    sample,
    worstHoles: worstHoles.slice(0, 10),
  };
}

function runRange(N, seeds) {
  const realBases = primesUpTo(N);
  const real = summarizeProfiles("real-prime bases", realBases, N);
  const cramer = seeds.map((seed) => summarizeProfiles(`cramer seed ${seed}`, cramerPrimes(N, seed), N));
  return { N, real, cramer };
}

const output = process.argv[2] || "logs/landau-profile-artifacts/numerics.json";
const ranges = process.argv[3] ? process.argv[3].split(",").map((x) => Number(x.trim())).filter(Boolean) : DEFAULT_RANGES;
const seeds = process.argv[4] ? process.argv[4].split(",").map((x) => Number(x.trim())).filter(Boolean) : DEFAULT_SEEDS;

const result = {
  object: "Landau optimal permutation profiles",
  generatedAt: new Date().toISOString(),
  definition: "canonical max-order permutation profile via max lcm of cycle lengths",
  ranges,
  seeds,
  results: ranges.map((N) => runRange(N, seeds)),
};

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
