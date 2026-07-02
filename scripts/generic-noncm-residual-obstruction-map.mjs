#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const outDir = process.argv[2] || "logs/two-universes-protocol";
const previousProtocol = path.join(outDir, "cycle-021-legendre-special-supersingular-residual-protocol.json");

const requirements = [
  {
    id: "exact_finite_field_baseline",
    rule: "A finite-field theorem baseline must be named before data.",
  },
  {
    id: "generic_noncm_object",
    rule: "The object must leave j=1728, j=0, CM, special automorphism, and fixed local congruence loci.",
  },
  {
    id: "nonzero_control_surviving_residual",
    rule: "A nonzero residual must remain after local congruence, complete-family, and special-locus controls are subtracted.",
  },
  {
    id: "full_integer_ladder",
    rule: "The integer side must be computable on the preregistered 1M/2M/4M/8M ladder without brute point-counting per prime.",
  },
  {
    id: "matched_field_profile",
    rule: "The same statistic must make sense on q=3,5,7 F_q[t] residue fields without changing explanation per q.",
  },
  {
    id: "novelty_proof_path",
    rule: "The route must not be a renamed known theorem calibration and must expose a plausible proof path.",
  },
];

const candidateClasses = [
  {
    id: "complete_legendre_second_moment",
    object: "S_2(K)=sum_{lambda in K-{0,1}} a_K(E_lambda)^2 for E_lambda:y^2=x(x-1)(x-lambda)",
    exactFiniteFieldBaseline: "Character orthogonality gives the complete-family baseline S_2(K)=|K|^2-2|K|-3 for odd finite fields.",
    genericNonCmStatus: "not sufficient: the complete family includes special loci and collapses by all-parameter orthogonality",
    residualAfterControls: "zero after theorem normalization",
    integer8mStatus: "computable by formula, but only as a calibration identity",
    fieldProfileStatus: "q=3,5,7 profile is forced by |K|, not by a new generic residual",
    noveltyStatus: "known complete-family identity / Birch-style moment calibration",
    experimentEligible: false,
    blocker: "No nonzero residual remains after the exact complete-family theorem baseline.",
    requiredMutation: "Break completeness with a named incomplete-family theorem baseline.",
  },
  {
    id: "special_excised_complete_legendre_moment",
    object: "Complete Legendre second moment after deleting j=1728 and j=0 automorphism loci",
    exactFiniteFieldBaseline: "Can be reduced to complete-family orthogonality minus CM special-locus trace-square controls.",
    genericNonCmStatus: "closer, but still a complete-family identity over the remaining parameter shell",
    residualAfterControls: "zero or fully explained by the same complete-family and CM controls",
    integer8mStatus: "requires CM trace-square bookkeeping but does not create a new statistic",
    fieldProfileStatus: "profiles are deterministic consequences of complete-family subtraction",
    noveltyStatus: "control subtraction, not a breakthrough mechanism",
    experimentEligible: false,
    blocker: "Deleting special loci still leaves no named nonzero generic residual.",
    requiredMutation: "Name an incomplete generic window with an exact finite-field theorem baseline.",
  },
  {
    id: "fixed_generic_lambda_trace",
    object: "Trace sequence a_p(E_lambda) for a fixed non-CM lambda, such as lambda=3",
    exactFiniteFieldBaseline: "No exact two-universe finite-field baseline is registered; Sato-Tate is an archimedean distribution heuristic, not a matched F_q[t] theorem here.",
    genericNonCmStatus: "yes, if lambda avoids CM and special automorphism loci",
    residualAfterControls: "not defined before data",
    integer8mStatus: "not computable in the current loop at full 8M without a fast non-CM trace engine or SEA-style implementation",
    fieldProfileStatus: "constant-curve residue profiles risk the degree-rigidity failure already seen in cycle 018",
    noveltyStatus: "would repackage fixed-curve trace statistics without a new baseline",
    experimentEligible: false,
    blocker: "No preregistered finite-field theorem baseline and no full-scale integer trace engine.",
    requiredMutation: "Implement a fast non-CM trace engine and name a theorem-normalized residual before data.",
  },
  {
    id: "incomplete_generic_lambda_window",
    object: "Trace sums over a fixed low-complexity generic lambda-window inside the Legendre family",
    exactFiniteFieldBaseline: "No exact baseline is currently named for the incomplete window after local and special-locus controls.",
    genericNonCmStatus: "possible, depending on the window",
    residualAfterControls: "not defined before data",
    integer8mStatus: "current exact point-counting path is pilot-scale only, as cycle 020 showed",
    fieldProfileStatus: "q profiles can be computed for small residue fields but lack a theorem target",
    noveltyStatus: "risks fitted hypergeometric or character-window statistics",
    experimentEligible: false,
    blocker: "The required nonzero residual is not stated before computation.",
    requiredMutation: "Prove or cite a window-specific finite-field baseline, then rerun with full integer ladder.",
  },
  {
    id: "generic_supersingular_lambda_roots",
    object: "Number of non-special lambda in F_p for which the Legendre curve is supersingular",
    exactFiniteFieldBaseline: "Deuring polynomial gives an exact finite-field object, but the generic root-count profile is governed by supersingular j-distribution/class-number structure.",
    genericNonCmStatus: "partly generic after deleting j=1728 and j=0",
    residualAfterControls: "not isolated from known supersingular/class-number baselines",
    integer8mStatus: "no full-ladder implementation is registered that separates generic roots from known local and CM controls",
    fieldProfileStatus: "F_q[t] extension-degree root containment effects must be controlled before scoring",
    noveltyStatus: "likely a known supersingular distribution calibration unless a smaller residual is named",
    experimentEligible: false,
    blocker: "The residual after known supersingular, class-number, and extension-degree baselines is not named.",
    requiredMutation: "State a class-number-normalized residual and local controls before computing.",
  },
  {
    id: "higher_generic_legendre_moments",
    object: "Fourth and higher moments of generic Legendre traces after complete-family and special-locus subtraction",
    exactFiniteFieldBaseline: "Moment formulas are expected to involve modular/monodromy trace terms, but no exact baseline is registered in this repo for q=3,5,7 and the integer ladder.",
    genericNonCmStatus: "possible after special-locus deletion",
    residualAfterControls: "not yet theorem-shaped",
    integer8mStatus: "not implemented",
    fieldProfileStatus: "not implemented",
    noveltyStatus: "could be meaningful only if the modular/monodromy baseline is explicit before data",
    experimentEligible: false,
    blocker: "No exact baseline or reproducible implementation exists.",
    requiredMutation: "Register the exact modular/monodromy trace formula and controls before any experiment.",
  },
  {
    id: "l_adic_monodromy_trace_function",
    object: "A generic non-CM l-adic sheaf trace statistic attached to the Legendre family",
    exactFiniteFieldBaseline: "Plausible finite-field theory exists in principle, but no concrete trace function, conductor, normalization, or integer analogue is registered here.",
    genericNonCmStatus: "possible",
    residualAfterControls: "not defined",
    integer8mStatus: "not defined",
    fieldProfileStatus: "not defined",
    noveltyStatus: "too abstract for promotion gates",
    experimentEligible: false,
    blocker: "The object is not concrete enough to score or reproduce.",
    requiredMutation: "Name the sheaf/function, normalization, integer analogue, and controls before computation.",
  },
];

function renderMarkdown(report) {
  const lines = [];
  lines.push("# Generic non-CM residual obstruction map", "");
  lines.push("Cycle 022 applies the cycle-021 stop rule before data: leave `j=1728`, `j=0`, CM, special automorphism loci, and fixed local congruence signals; require a named generic non-CM residual and finite-field theorem baseline.", "");
  lines.push("## Registration Requirements", "");
  lines.push("| id | rule |");
  lines.push("| --- | --- |");
  for (const requirement of report.requirements) {
    lines.push(`| ${requirement.id} | ${requirement.rule} |`);
  }
  lines.push("", "## Candidate Class Screen", "");
  lines.push("| class | exact finite-field baseline | generic status | integer 8M status | eligible | blocker |");
  lines.push("| --- | --- | --- | --- | --- | --- |");
  for (const item of report.candidateClasses) {
    lines.push(`| ${item.id} | ${item.exactFiniteFieldBaseline.replace(/\|/g, "\\|")} | ${item.genericNonCmStatus.replace(/\|/g, "\\|")} | ${item.integer8mStatus.replace(/\|/g, "\\|")} | ${item.experimentEligible} | ${item.blocker.replace(/\|/g, "\\|")} |`);
  }
  lines.push("", "## Summary", "");
  lines.push(`- Candidate classes screened: ${report.summary.classCount}`);
  lines.push(`- Experiment-eligible classes: ${report.summary.experimentEligibleCount}`);
  lines.push(`- Exact finite-field baselines present or reducible: ${report.summary.exactOrReducibleBaselineCount}`);
  lines.push(`- Full integer ladder implementations present: ${report.summary.fullIntegerImplementationCount}`);
  lines.push(`- Nonzero residuals named before data: ${report.summary.nonzeroResidualNamedCount}`);
  lines.push(`- Branch decision: ${report.summary.branchDecision}`);
  lines.push("", "## Forced Next Move", "");
  lines.push(report.summary.nextRequiredArtifact);
  lines.push("");
  lines.push(`JSON: \`${report.paths.json}\``);
  lines.push(`SVG: \`${report.paths.svg}\``);
  return `${lines.join("\n")}\n`;
}

function renderSvg(report) {
  const width = 1280;
  const rowHeight = 44;
  const height = 150 + report.candidateClasses.length * rowHeight;
  const rows = report.candidateClasses.map((item, i) => {
    const y = 112 + i * rowHeight;
    const fill = i % 2 ? "#0f1b2d" : "#0b1424";
    return `<rect x="54" y="${y - 24}" width="1170" height="38" fill="${fill}" stroke="#1e293b"/>
<text x="74" y="${y}" fill="#e2e8f0" font-size="13">${item.id}</text>
<text x="440" y="${y}" fill="${item.experimentEligible ? "#22c55e" : "#f97316"}" font-size="13">${item.experimentEligible ? "eligible" : "blocked"}</text>
<text x="560" y="${y}" fill="#94a3b8" font-size="12">${item.blocker.slice(0, 92)}</text>`;
  }).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="${width}" height="${height}" fill="#07111f"/>
<g font-family="Menlo, Consolas, monospace">
<text x="54" y="42" fill="#f8fafc" font-size="20" font-weight="700">Generic non-CM residual obstruction map</text>
<text x="54" y="68" fill="#94a3b8" font-size="13">Cycle 022 screens candidate representation jumps before data; experiment-eligible classes: ${report.summary.experimentEligibleCount}</text>
<text x="74" y="98" fill="#38bdf8" font-size="12">candidate class</text>
<text x="440" y="98" fill="#38bdf8" font-size="12">decision</text>
<text x="560" y="98" fill="#38bdf8" font-size="12">blocking condition</text>
${rows}
</g>
</svg>`;
}

const previous = fs.existsSync(previousProtocol)
  ? JSON.parse(fs.readFileSync(previousProtocol, "utf8"))
  : null;

const summary = {
  classCount: candidateClasses.length,
  experimentEligibleCount: candidateClasses.filter((item) => item.experimentEligible).length,
  exactOrReducibleBaselineCount: candidateClasses.filter((item) => /gives|reduced|reducible|Deuring|expected|Plausible/.test(item.exactFiniteFieldBaseline)).length,
  fullIntegerImplementationCount: candidateClasses.filter((item) => /computable by formula/.test(item.integer8mStatus)).length,
  nonzeroResidualNamedCount: candidateClasses.filter((item) => !/zero|not defined|not isolated|not yet/.test(item.residualAfterControls)).length,
  previousCycleStatus: previous?.decision?.status || "missing",
  branchDecision: "NO_EXPERIMENT_ELIGIBLE_GENERIC_NONCM_RESIDUAL",
  nextRequiredArtifact: "Register a concrete generic non-CM residual with exact finite-field baseline, special/CM/local controls, and a full 8M integer implementation before any new data run.",
};

const base = "cycle-022-generic-noncm-residual-obstruction-map";
const paths = {
  json: path.join(outDir, `${base}.json`),
  md: path.join(outDir, `${base}.md`),
  svg: path.join(outDir, `${base}.svg`),
};

const report = {
  candidate: "Generic non-CM residual obstruction map",
  generatedAt: new Date().toISOString(),
  previousProtocol,
  requirements,
  candidateClasses,
  summary,
  paths,
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(paths.json, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(paths.md, renderMarkdown(report));
fs.writeFileSync(paths.svg, renderSvg(report));

console.log(JSON.stringify({
  ok: true,
  candidate: report.candidate,
  branchDecision: summary.branchDecision,
  experimentEligibleCount: summary.experimentEligibleCount,
  classCount: summary.classCount,
  previousCycleStatus: summary.previousCycleStatus,
  paths,
}, null, 2));
