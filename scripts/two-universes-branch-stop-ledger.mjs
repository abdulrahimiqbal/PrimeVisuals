#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const outDir = process.argv[2] || "logs/two-universes-protocol";

const exhaustedFamilies = [
  {
    id: "coefficient-neighborhood-mobius-gap",
    cycles: ["001"],
    object: "Mobius parity and next irreducible gap in coefficient neighborhoods",
    killedByGates: ["integer_holdout", "proof_path"],
    finalReason: "Strong finite-field mechanism, but no honest integer-prime coefficient-neighborhood analogue.",
    revivalRequirements: [
      "Define a same-form integer object before scoring data.",
      "Provide preregistered integer holdout and controls.",
      "Explain why the object is not merely Pellet/Berlekamp coefficient-space algebra.",
    ],
    forbiddenRevival: "Do not present coefficient-order pictures as integer-prime evidence.",
  },
  {
    id: "prime-indicator-additive-shift-graphs-and-tensors",
    cycles: ["002", "003", "004", "005", "006"],
    object: "Fixed-shift prime/irreducible graph degree spectra, centered tensors, exact admissibility tensors, and signed profile/decay comparisons",
    killedByGates: ["controls", "scale_stability", "novelty_audit", "proof_path"],
    finalReason: "Local/composite/admissibility controls absorb the apparent structure, and signed profiles do not match across universes.",
    revivalRequirements: [
      "Name a new invariant not reducible to local admissibility or singular-series correction.",
      "Show which prior local/composite control gate is fixed.",
      "Run complete scale ladders and q=2,3,5 field checks before any claim.",
    ],
    forbiddenRevival: "Do not rerun a prime-pair tensor with different binning unless it fixes a named failed gate.",
  },
  {
    id: "quotient-spectral-prime-indicator-residuals",
    cycles: ["007"],
    object: "Quotient-domain residual spectra of prime indicators after rough-shell subtraction",
    killedByGates: ["controls", "scale_stability", "novelty_audit", "proof_path"],
    finalReason: "Integer quotient spectral edge clears controls, but q=3 and q=5 finite-field spectra are absorbed by controls and the integer 8M ladder is incomplete.",
    revivalRequirements: [
      "Explain why the field controls should no longer absorb the edge.",
      "Supply a complete 1M/2M/4M/8M integer ladder.",
      "Audit classical prime races, Chebyshev bias, and rough-shell finite-size effects.",
    ],
    forbiddenRevival: "Do not call an integer-only quotient spectral edge a Two-Universes law.",
  },
  {
    id: "mobius-liouville-fixed-lag-correlations",
    cycles: ["008"],
    object: "Fixed-lag Mobius/Liouville correlation energy over Z and F_q[t]",
    killedByGates: ["controls", "scale_stability", "novelty_audit", "proof_path"],
    finalReason: "Finite-field Mobius/Liouville energies clear controls, but integer Mobius and Liouville sit inside null controls.",
    revivalRequirements: [
      "Name a narrower theorem-shaped lemma than Chowla.",
      "Show integer Mobius or Liouville beats preregistered null controls.",
      "Complete scale ladder before any expert pack.",
    ],
    forbiddenRevival: "Do not report finite-field-only multiplicative-sign energy as an integer-prime breakthrough.",
  },
  {
    id: "theorem-first-catalog-without-proof-map",
    cycles: ["009"],
    object: "Exact finite-field theorem catalog and transport classification",
    killedByGates: ["integer_holdout", "controls", "scale_stability", "proof_path", "expert_pack"],
    finalReason: "The catalog is useful evidence routing, but contains no immediately experiment-eligible breakthrough candidate.",
    revivalRequirements: [
      "Convert a catalog family into a proof-obligation map.",
      "Name an honest integer transport map and testable missing lemma.",
      "Only then preregister controls and holdouts.",
    ],
    forbiddenRevival: "Do not treat a known finite-field theorem as a new result over Z.",
  },
  {
    id: "honest-open-chowla-and-twin-prime-theorem-families",
    cycles: ["010"],
    object: "Proof-obligation maps for large-q Chowla, uniform Chowla, and twin irreducibles",
    killedByGates: ["integer_holdout", "controls", "scale_stability", "proof_path", "expert_pack"],
    finalReason: "The missing integer substitutes are major open Chowla/twin-prime-scale conjectures or non-transportable proof ingredients.",
    revivalRequirements: [
      "Name a strictly weaker integer lemma that is not equivalent to the original open conjecture.",
      "State why previous aggregate controls do not apply.",
      "Provide a proof route smaller than proving Chowla or Hardy-Littlewood outright.",
    ],
    forbiddenRevival: "Do not relabel an open conjecture as a computational lead.",
  },
  {
    id: "finite-field-obstruction-transport",
    cycles: ["011"],
    object: "Repeated-root, admissibility, discriminant, characteristic-2, Morse, residue-theorem, and complete-shell obstruction classes",
    killedByGates: ["integer_holdout", "controls", "scale_stability", "proof_path", "expert_pack"],
    finalReason: "Same-form transports are known local controls; the remaining finite-field obstructions have no honest integer transport.",
    revivalRequirements: [
      "Identify a non-exhausted same-form integer obstruction.",
      "Show it is not squarefactor/admissibility in disguise.",
      "Preregister a fixed local form and matched null controls.",
    ],
    forbiddenRevival: "Do not recycle known local obstructions or finite-field-only algebra as a new bridge.",
  },
];

const forbiddenWithoutNewProofIngredient = [
  "aggregate Chowla or Mobius/Liouville fixed-lag correlation plots",
  "prime-pair or tuple tensors differing only by bins, windows, whitening, or labels",
  "integer-only quotient spectral edges without q=2,3,5 control survival",
  "coefficient-neighborhood finite-field visuals used as integer analogues",
  "finite-field exact identities with no transport map",
  "known squarefactor/admissibility controls reported as discoveries",
];

const resetConditions = [
  "new domain/object not covered by prime tuples, Chowla/Mobius correlations, quotient spectra, finite-field coefficient artifacts, or known local obstructions",
  "theorem-shaped statement written before data",
  "exact finite-field anchor or explicit reason the new domain is not a Two-Universes claim",
  "integer transport map with preregistered holdouts",
  "local/null/random controls that directly target the prior failure mode",
  "scale ladder and q=2,3,5 field checks where applicable",
  "novelty audit against known theorem catalogs and prior rejected cycles",
  "proof-path memo and expert-ready evidence pack before any promotion",
];

function gateCounts(families) {
  const counts = {};
  for (const family of families) {
    for (const gate of family.killedByGates) counts[gate] = (counts[gate] || 0) + 1;
  }
  return counts;
}

function summarize() {
  const counts = gateCounts(exhaustedFamilies);
  return {
    familyCount: exhaustedFamilies.length,
    coveredCycles: [...new Set(exhaustedFamilies.flatMap((family) => family.cycles))].sort(),
    promotedCount: 0,
    gateKillCounts: counts,
    forbiddenCount: forbiddenWithoutNewProofIngredient.length,
    resetConditionCount: resetConditions.length,
    branchDecision: "STOP_CURRENT_AGGREGATE_TWO_UNIVERSES_ROUTE",
    completionClaim: "No breakthrough candidate is promoted; current branch is stopped unless a new domain/object restarts strict registration or a rejected family fixes a named failed gate before data.",
  };
}

function mdEscape(value) {
  return String(value).replace(/\|/g, "\\|");
}

function renderMarkdown(report) {
  const lines = [];
  lines.push("# Cycle 012 branch-stop ledger", "");
  lines.push("Purpose: stop the current aggregate Two-Universes transport branch cleanly instead of fabricating another statistic after every theorem/proof/obstruction filter returned no actionable candidate.", "");
  lines.push("## Decision", "");
  lines.push(`Decision: **${report.summary.branchDecision}**`);
  lines.push("");
  lines.push(report.summary.completionClaim);
  lines.push("");
  lines.push("## Exhausted Families", "");
  lines.push("| family | cycles | killed gates | final reason | forbidden revival |");
  lines.push("| --- | --- | --- | --- | --- |");
  for (const family of report.exhaustedFamilies) {
    lines.push(`| ${family.id} | ${family.cycles.join(", ")} | ${family.killedByGates.join(", ")} | ${mdEscape(family.finalReason)} | ${mdEscape(family.forbiddenRevival)} |`);
  }
  lines.push("", "## Gate Kill Counts", "");
  lines.push("| gate | family count |");
  lines.push("| --- | ---: |");
  for (const [gate, count] of Object.entries(report.summary.gateKillCounts)) {
    lines.push(`| ${gate} | ${count} |`);
  }
  lines.push("", "## Forbidden Without New Proof Ingredient", "");
  for (const item of report.forbiddenWithoutNewProofIngredient) lines.push(`- ${item}`);
  lines.push("", "## Reset Conditions For A New Domain/Object", "");
  for (const item of report.resetConditions) lines.push(`- ${item}`);
  lines.push("", "## Family Revival Requirements", "");
  for (const family of report.exhaustedFamilies) {
    lines.push(`### ${family.id}`, "");
    lines.push(`Object: ${family.object}`, "");
    lines.push("Requirements before revival:");
    for (const item of family.revivalRequirements) lines.push(`- ${item}`);
    lines.push("");
  }
  lines.push(`JSON: \`${report.paths.json}\``);
  lines.push(`SVG: \`${report.paths.svg}\``);
  return `${lines.join("\n")}\n`;
}

function renderSvg(report) {
  const width = 1180;
  const height = 720;
  const pad = 70;
  const gates = Object.entries(report.summary.gateKillCounts);
  const maxCount = Math.max(1, ...gates.map(([, count]) => count));
  const bars = gates.map(([gate, count], i) => {
    const y = 128 + i * 42;
    const w = (count / maxCount) * 560;
    return `<text x="${pad}" y="${y + 20}" fill="#e5edf7" font-size="12">${gate}</text>
<rect x="${pad + 250}" y="${y}" width="${w.toFixed(2)}" height="24" fill="#ef4444" opacity="0.86"/>
<text x="${pad + 262 + w}" y="${y + 18}" fill="#f8fafc" font-size="12">${count}</text>`;
  }).join("\n");
  const rows = report.exhaustedFamilies.map((family, i) => {
    const x = pad + (i % 2) * 520;
    const y = 440 + Math.floor(i / 2) * 42;
    return `<text x="${x}" y="${y}" fill="#f59e0b" font-size="11">${family.id}</text>
<text x="${x}" y="${y + 16}" fill="#94a3b8" font-size="10">cycles ${family.cycles.join(",")} blocked</text>`;
  }).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="${width}" height="${height}" fill="#07111f"/>
<g font-family="Menlo, Consolas, monospace">
<text x="${pad}" y="42" fill="#f8fafc" font-size="21" font-weight="700">Cycle 012: branch-stop ledger</text>
<text x="${pad}" y="70" fill="#94a3b8" font-size="13">The current aggregate Two-Universes transport route stops unless a new domain/object restarts strict registration.</text>
<text x="${pad}" y="104" fill="#cbd5e1" font-size="14">Gate kill counts across exhausted families</text>
${bars}
<text x="${pad}" y="404" fill="#cbd5e1" font-size="14">Exhausted families</text>
${rows}
<text x="${pad}" y="680" fill="#f8fafc" font-size="12">Decision: ${report.summary.branchDecision}</text>
</g>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
const summary = summarize();
const base = "cycle-012-branch-stop-ledger";
const paths = {
  json: path.join(outDir, `${base}.json`),
  md: path.join(outDir, `${base}.md`),
  svg: path.join(outDir, `${base}.svg`),
};
const report = {
  candidate: "Branch-stop ledger for aggregate Two-Universes transport route",
  generatedAt: new Date().toISOString(),
  exhaustedFamilies,
  forbiddenWithoutNewProofIngredient,
  resetConditions,
  summary,
  paths,
};

fs.writeFileSync(paths.json, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(paths.md, renderMarkdown(report));
fs.writeFileSync(paths.svg, renderSvg(report));

console.log(JSON.stringify({
  ok: true,
  candidate: report.candidate,
  branchDecision: summary.branchDecision,
  familyCount: summary.familyCount,
  promotedCount: summary.promotedCount,
  coveredCycles: summary.coveredCycles,
  paths,
}, null, 2));
