#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const outDir = process.argv[2] || "logs/two-universes-protocol";

const obstructionClasses = [
  {
    id: "repeated-root-squarefactor",
    family: "mobius-zero-obstruction",
    finiteFieldIdentity: "mu(F)=0 exactly when F has a repeated irreducible factor; equivalently gcd(F,F') != 1.",
    finiteFieldFailureMode: "Repeated roots make discriminant zero and remove the polynomial from squarefree Mobius parity statistics.",
    integerSameForm: "mu(n)=0 exactly when n has a repeated prime factor.",
    transportClass: "honest-known-local-transport",
    theoremShape: "squarefactor-zero obstruction",
    noveltyStatus: "known-local-obstruction",
    priorCycleContact: ["cycle-004", "cycle-005", "cycle-008"],
    experimentEligibility: false,
    eligibilityReason: "Transport is exact but classical; previous squarefree/local controls already absorbed it.",
    nextUse: "Keep as a mandatory local control, never as a breakthrough signal.",
  },
  {
    id: "linear-factor-admissibility",
    family: "tuple-local-obstruction",
    finiteFieldIdentity: "A polynomial tuple is locally inadmissible when some low-degree irreducible divides every shifted member in the local pattern.",
    finiteFieldFailureMode: "Irreducible-pair and tuple counts vanish or distort before local obstruction removal.",
    integerSameForm: "Prime tuples are blocked when a residue class modulo p forces divisibility for every candidate.",
    transportClass: "honest-known-local-transport",
    theoremShape: "admissibility / singular-series local factor",
    noveltyStatus: "known-local-obstruction",
    priorCycleContact: ["cycle-002", "cycle-003", "cycle-004", "cycle-005", "cycle-007"],
    experimentEligibility: false,
    eligibilityReason: "Transport is exact at the local-obstruction level, but it is the classical admissibility/singular-series object already controlled in prior cycles.",
    nextUse: "Keep as required baseline subtraction for any future tuple statistic.",
  },
  {
    id: "pellet-discriminant-square-class",
    family: "mobius-discriminant-character",
    finiteFieldIdentity: "For odd q and squarefree F, polynomial Mobius parity is (-1)^deg(F) times the quadratic character of Disc(F).",
    finiteFieldFailureMode: "Coefficient-space discriminant square classes create exact Mobius parity structure.",
    integerSameForm: "No integer coefficient-space discriminant character determines mu(n) or primality.",
    transportClass: "no-honest-integer-transport",
    theoremShape: "odd-characteristic discriminant character",
    noveltyStatus: "finite-field-only-mechanism",
    priorCycleContact: ["cycle-001", "cycle-009", "cycle-010"],
    experimentEligibility: false,
    eligibilityReason: "The exact finite-field mechanism depends on coefficient-space geometry with no same-form integer object.",
    nextUse: "Use in novelty audits to reject coefficient-neighborhood Mobius claims over Z.",
  },
  {
    id: "berlekamp-artin-schreier-parity",
    family: "mobius-discriminant-characteristic-two",
    finiteFieldIdentity: "In characteristic 2, Berlekamp/Artin-Schreier trace data replaces the quadratic discriminant character for Mobius parity mechanisms.",
    finiteFieldFailureMode: "Characteristic-2 trace parity creates q=2-specific Mobius behavior.",
    integerSameForm: "No integer Artin-Schreier trace-parity analogue exists.",
    transportClass: "no-honest-integer-transport",
    theoremShape: "characteristic-2 trace obstruction",
    noveltyStatus: "finite-field-only-mechanism",
    priorCycleContact: ["cycle-001", "cycle-008", "cycle-009", "cycle-010"],
    experimentEligibility: false,
    eligibilityReason: "Characteristic-2 algebra is not a transport map to integer primes.",
    nextUse: "Treat q=2-only behavior as a warning flag unless an independent integer obstruction is named.",
  },
  {
    id: "coefficient-space-morse-failure",
    family: "very-short-interval-genericity",
    finiteFieldIdentity: "Very-short-interval theorems require generic/Morse coefficient-space conditions; non-generic centers can violate the generic correlation law.",
    finiteFieldFailureMode: "A polynomial center can be exceptional because its coefficient-line family has bad critical-value geometry.",
    integerSameForm: "Integer short intervals do not have a coefficient-line Morse condition with the same logical form.",
    transportClass: "obstruction-or-coefficient-space-only",
    theoremShape: "generic Morse condition / non-generic exception",
    noveltyStatus: "finite-field-only-warning",
    priorCycleContact: ["cycle-001", "cycle-009", "cycle-010"],
    experimentEligibility: false,
    eligibilityReason: "The obstruction is tied to coefficient-space families, not an integer-local obstruction.",
    nextUse: "Use as a negative-control catalog for future finite-field experiments.",
  },
  {
    id: "residue-theorem-bouniakowsky-obstruction",
    family: "finite-field-bouniakowsky-obstruction",
    finiteFieldIdentity: "Some finite-field polynomial-prime-value analogues fail from global Mobius/residue-theorem obstructions.",
    finiteFieldFailureMode: "A theorem-side obstruction exists even when the naive classical analogue would predict no obstruction.",
    integerSameForm: "No known classical integer obstruction has the same residue-theorem form.",
    transportClass: "finite-field-obstruction-no-classical-analogue",
    theoremShape: "global finite-field residue obstruction",
    noveltyStatus: "finite-field-only-veto",
    priorCycleContact: ["cycle-009", "cycle-010"],
    experimentEligibility: false,
    eligibilityReason: "The obstruction argues against transport instead of producing a Z statistic.",
    nextUse: "Use as a veto class for finite-field-only discoveries.",
  },
  {
    id: "complete-degree-shell-cancellation",
    family: "complete-family-cancellation",
    finiteFieldIdentity: "Complete monic degree shells can have exact Mobius/Liouville cancellations caused by the rational zeta function of F_q[t].",
    finiteFieldFailureMode: "Complete-family averaging produces exact finite-field identities with no sampled integer counterpart.",
    integerSameForm: "Integer partial sums over n<=X are not complete finite coefficient shells.",
    transportClass: "finite-field-complete-family-only",
    theoremShape: "complete-shell cancellation identity",
    noveltyStatus: "finite-field-only-calibration",
    priorCycleContact: ["cycle-008", "cycle-009"],
    experimentEligibility: false,
    eligibilityReason: "The exact cancellation is a calibration identity, not an integer-prime experiment.",
    nextUse: "Use to test finite-field table correctness and to block complete-family overinterpretation.",
  },
];

function classify(classes) {
  const honestKnown = classes.filter((item) => item.transportClass === "honest-known-local-transport");
  const noTransport = classes.filter((item) => item.transportClass !== "honest-known-local-transport");
  const eligible = classes.filter((item) => item.experimentEligibility);
  const exhaustedKnown = honestKnown.filter((item) => item.noveltyStatus === "known-local-obstruction");
  return {
    classCount: classes.length,
    honestKnownTransportCount: honestKnown.length,
    noHonestNewTransportCount: noTransport.length,
    exhaustedKnownTransportCount: exhaustedKnown.length,
    experimentallyActionableCount: eligible.length,
    branchDecision: eligible.length ? "HAS_ACTIONABLE_OBSTRUCTION_CLASS" : "NO_ACTIONABLE_OBSTRUCTION_CLASS",
    stoppedReason: eligible.length
      ? "At least one obstruction class has a fixed local form and is not exhausted."
      : "Every same-form obstruction is known local structure already controlled, and every other finite-field failure mode has no honest integer transport.",
    nextRequiredArtifact: eligible.length
      ? "cycle-012 preregistered obstruction experiment"
      : "cycle-012 branch-stop ledger or new-domain proposal outside aggregate Two-Universes transport",
    byTransportClass: classes.reduce((acc, item) => {
      acc[item.transportClass] = (acc[item.transportClass] || 0) + 1;
      return acc;
    }, {}),
  };
}

function mdEscape(value) {
  return String(value).replace(/\|/g, "\\|");
}

function renderMarkdown(report) {
  const lines = [];
  lines.push("# Cycle 011 obstruction-class transport map", "");
  lines.push("Purpose: start from finite-field failure modes and only allow a new experiment when the same obstruction has a theorem-shaped integer form that is not already a known local control.", "");
  lines.push("## Summary", "");
  lines.push(`- Obstruction classes: ${report.summary.classCount}`);
  lines.push(`- Honest known local transports: ${report.summary.honestKnownTransportCount}`);
  lines.push(`- Non-actionable/no-new transports: ${report.summary.noHonestNewTransportCount}`);
  lines.push(`- Experimentally actionable classes: ${report.summary.experimentallyActionableCount}`);
  lines.push(`- Branch decision: ${report.summary.branchDecision}`);
  lines.push(`- Stopped reason: ${report.summary.stoppedReason}`);
  lines.push(`- Next required artifact: ${report.summary.nextRequiredArtifact}`, "");
  lines.push("## Transport Class Counts", "");
  lines.push("| transport class | count |");
  lines.push("| --- | ---: |");
  for (const [klass, count] of Object.entries(report.summary.byTransportClass)) {
    lines.push(`| ${klass} | ${count} |`);
  }
  lines.push("", "## Obstruction Classes", "");
  lines.push("| id | theorem shape | transport | eligible | reason | prior cycles |");
  lines.push("| --- | --- | --- | --- | --- | --- |");
  for (const item of report.obstructionClasses) {
    lines.push(`| ${item.id} | ${mdEscape(item.theoremShape)} | ${item.transportClass} | ${item.experimentEligibility} | ${mdEscape(item.eligibilityReason)} | ${item.priorCycleContact.join(", ")} |`);
  }
  lines.push("");
  for (const item of report.obstructionClasses) {
    lines.push(`## ${item.id}`, "");
    lines.push(`Finite-field identity: ${item.finiteFieldIdentity}`, "");
    lines.push(`Finite-field failure mode: ${item.finiteFieldFailureMode}`, "");
    lines.push(`Integer same-form test: ${item.integerSameForm}`, "");
    lines.push(`Next use: ${item.nextUse}`, "");
  }
  lines.push(`JSON: \`${report.paths.json}\``);
  lines.push(`SVG: \`${report.paths.svg}\``);
  return `${lines.join("\n")}\n`;
}

function renderSvg(report) {
  const width = 1180;
  const height = 680;
  const pad = 70;
  const classes = Object.entries(report.summary.byTransportClass);
  const maxCount = Math.max(1, ...classes.map(([, count]) => count));
  const colors = ["#22c55e", "#ef4444", "#f59e0b", "#38bdf8", "#a78bfa"];
  const bars = classes.map(([klass, count], i) => {
    const y = 128 + i * 52;
    const w = (count / maxCount) * 540;
    return `<text x="${pad}" y="${y + 22}" fill="#e5edf7" font-size="12">${klass}</text>
<rect x="${pad + 410}" y="${y}" width="${w.toFixed(2)}" height="28" fill="${colors[i % colors.length]}" opacity="0.86"/>
<text x="${pad + 422 + w}" y="${y + 20}" fill="#f8fafc" font-size="12">${count}</text>`;
  }).join("\n");
  const rows = report.obstructionClasses.map((item, i) => {
    const x = pad + (i % 2) * 520;
    const y = 470 + Math.floor(i / 2) * 34;
    const color = item.experimentEligibility ? "#22c55e" : item.transportClass === "honest-known-local-transport" ? "#f59e0b" : "#ef4444";
    return `<text x="${x}" y="${y}" fill="${color}" font-size="11">${item.id}: ${item.experimentEligibility ? "ACTIONABLE" : "BLOCKED"}</text>`;
  }).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="${width}" height="${height}" fill="#07111f"/>
<g font-family="Menlo, Consolas, monospace">
<text x="${pad}" y="42" fill="#f8fafc" font-size="21" font-weight="700">Cycle 011: obstruction-class transport map</text>
<text x="${pad}" y="70" fill="#94a3b8" font-size="13">Finite-field failure modes only seed experiments when the same obstruction has a non-exhausted integer theorem form.</text>
<text x="${pad}" y="104" fill="#cbd5e1" font-size="14">Transport class counts</text>
${bars}
<text x="${pad}" y="430" fill="#cbd5e1" font-size="14">Class eligibility</text>
${rows}
<text x="${pad}" y="642" fill="#f8fafc" font-size="12">Decision: ${report.summary.branchDecision}</text>
</g>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
const summary = classify(obstructionClasses);
const base = "cycle-011-obstruction-class-transport-map";
const paths = {
  json: path.join(outDir, `${base}.json`),
  md: path.join(outDir, `${base}.md`),
  svg: path.join(outDir, `${base}.svg`),
};
const report = {
  candidate: "Obstruction-class transport map",
  generatedAt: new Date().toISOString(),
  purpose: "Classify finite-field failure modes by same-form integer transport before any new experiment.",
  obstructionClasses,
  summary,
  paths,
};

fs.writeFileSync(paths.json, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(paths.md, renderMarkdown(report));
fs.writeFileSync(paths.svg, renderSvg(report));

console.log(JSON.stringify({
  ok: true,
  candidate: report.candidate,
  classCount: summary.classCount,
  honestKnownTransportCount: summary.honestKnownTransportCount,
  experimentallyActionableCount: summary.experimentallyActionableCount,
  branchDecision: summary.branchDecision,
  nextRequiredArtifact: summary.nextRequiredArtifact,
  paths,
}, null, 2));
