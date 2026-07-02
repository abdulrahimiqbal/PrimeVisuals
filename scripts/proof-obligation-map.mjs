#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const outDir = process.argv[2] || "logs/two-universes-protocol";
const catalogPath = path.join(outDir, "cycle-009-theorem-first-finite-field-catalog.json");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

const catalog = readJson(catalogPath);

const obligations = [
  {
    id: "carmon-rudnick-large-q-chowla-proof-map",
    catalogEntryId: "carmon-rudnick-large-q-chowla",
    finiteFieldTheoremInput: "Fixed degree n, fixed distinct polynomial shifts, q odd and growing; Mobius products over monic degree-n shells cancel in the large-q limit.",
    proofIngredients: [
      {
        ingredient: "Pellet discriminant character",
        finiteFieldRole: "Convert polynomial Mobius parity into a quadratic character of a discriminant.",
        integerSubstitute: "No coefficient-space discriminant character exists for integer Mobius products.",
        substituteStatus: "not-transportable",
      },
      {
        ingredient: "square-independence of shifted discriminants",
        finiteFieldRole: "Show the character product is not a square, enabling cancellation.",
        integerSubstitute: "Uniform cancellation of shifted Mobius products over intervals.",
        substituteStatus: "open-major-conjecture",
      },
      {
        ingredient: "Weil character-sum cancellation",
        finiteFieldRole: "Provide square-root cancellation for nontrivial character sums over coefficient space.",
        integerSubstitute: "Power-saving cancellation for shifted Mobius correlations.",
        substituteStatus: "open-major-conjecture",
      },
    ],
    integerStatement: "For fixed distinct shifts h_1,...,h_k, sum_{n<=X} mu(n+h_1)...mu(n+h_k)=o(X).",
    priorEvidence: ["cycle-006 signed profiles failed", "cycle-008 fixed-lag Mobius/Liouville controls failed on Z"],
    experimentStatus: "blocked",
    blocker: "The missing integer substitute is the Chowla conjecture itself, not a smaller data-testable lemma.",
    nextAllowedAction: "Do not run another aggregate Mobius-correlation experiment unless a strictly weaker, fixed, testable substitute lemma is named first.",
  },
  {
    id: "sawin-shusterman-chowla-uniform-proof-map",
    catalogEntryId: "sawin-shusterman-chowla-uniform",
    finiteFieldTheoremInput: "Uniform Chowla-type Mobius correlations over F_q[T] for high-degree polynomials and large families of shifts under finite-field hypotheses.",
    proofIngredients: [
      {
        ingredient: "algebraic-geometry equidistribution / monodromy control",
        finiteFieldRole: "Turn polynomial shift families into controlled geometric families with equidistributed Frobenius data.",
        integerSubstitute: "An integer mechanism producing comparable independence of shifted Mobius signs.",
        substituteStatus: "open-major-conjecture",
      },
      {
        ingredient: "uniformity over many shifts",
        finiteFieldRole: "Prevent the theorem from being a single hand-picked shift identity.",
        integerSubstitute: "Uniform Chowla estimates across structured shift sets.",
        substituteStatus: "open-major-conjecture",
      },
      {
        ingredient: "finite-field local obstruction accounting",
        finiteFieldRole: "Separate genuine Mobius cancellation from squarefactor/repeated-root obstructions.",
        integerSubstitute: "Squarefactor/local obstruction conditioning, already tested in local tensor cycles.",
        substituteStatus: "tested-no-breakthrough",
      },
    ],
    integerStatement: "Uniform higher-order Chowla correlations for integer Mobius/Liouville over fixed and structured shift families.",
    priorEvidence: ["cycle-005 exact admissibility tensor rejected", "cycle-006 signed profile rejected", "cycle-008 multiplicative signs rejected"],
    experimentStatus: "blocked",
    blocker: "The proof ingredient that matters is a major open uniform Chowla substitute; previous data-first variants were absorbed by controls.",
    nextAllowedAction: "Only proceed after isolating a narrower missing lemma that is not equivalent to uniform Chowla.",
  },
  {
    id: "sawin-shusterman-twin-irreducibles-proof-map",
    catalogEntryId: "sawin-shusterman-twin-irreducibles",
    finiteFieldTheoremInput: "Quantitative counts of irreducible pairs F and F+A over F_q[T] under finite-field hypotheses.",
    proofIngredients: [
      {
        ingredient: "finite-field tuple equidistribution",
        finiteFieldRole: "Control simultaneous irreducibility of shifted polynomial families after local obstructions are removed.",
        integerSubstitute: "Uniform Hardy-Littlewood prime-tuple estimates with power-saving control.",
        substituteStatus: "open-major-conjecture",
      },
      {
        ingredient: "exact local obstruction removal",
        finiteFieldRole: "Account for repeated-root and congruence obstructions in polynomial tuples.",
        integerSubstitute: "Admissibility and singular-series correction.",
        substituteStatus: "known-but-insufficient",
      },
      {
        ingredient: "degree-shell normalization",
        finiteFieldRole: "Use degree n as the scale and compare counts inside a complete finite shell.",
        integerSubstitute: "Log-scale normalization for primes up to X or in windows.",
        substituteStatus: "known-but-insufficient",
      },
    ],
    integerStatement: "Hardy-Littlewood twin/prime-pair asymptotics for fixed admissible shifts.",
    priorEvidence: ["cycle-002 fixed-shift graph rejected", "cycle-003/004/005 local tensor leads not promoted/rejected", "cycle-007 quotient spectral residual rejected"],
    experimentStatus: "blocked",
    blocker: "After local admissibility is handled, the remaining missing ingredient is the open prime-tuple theorem itself.",
    nextAllowedAction: "Do not rerun prime-pair visuals; only a new lemma that beats local/composite controls and has a proof route can reopen this family.",
  },
];

function classify(obligation) {
  const statuses = obligation.proofIngredients.map((item) => item.substituteStatus);
  const hasMajorOpen = statuses.includes("open-major-conjecture");
  const hasNotTransportable = statuses.includes("not-transportable");
  const allKnown = statuses.every((status) => status === "known" || status === "known-but-insufficient");
  return {
    decision: allKnown ? "potential-proof-route" : "blocked",
    hasMajorOpen,
    hasNotTransportable,
    missingOpenCount: statuses.filter((status) => status === "open-major-conjecture").length,
    notTransportableCount: statuses.filter((status) => status === "not-transportable").length,
    testedNoBreakthroughCount: statuses.filter((status) => status === "tested-no-breakthrough").length,
  };
}

function summarize(obligations) {
  const mapped = obligations.map((obligation) => ({ ...obligation, classification: classify(obligation) }));
  return {
    obligationCount: mapped.length,
    blockedCount: mapped.filter((item) => item.classification.decision === "blocked").length,
    potentialProofRouteCount: mapped.filter((item) => item.classification.decision === "potential-proof-route").length,
    majorOpenLemmaCount: mapped.reduce((sum, item) => sum + item.classification.missingOpenCount, 0),
    notTransportableIngredientCount: mapped.reduce((sum, item) => sum + item.classification.notTransportableCount, 0),
    experimentallyActionableCount: mapped.filter((item) => item.experimentStatus !== "blocked").length,
    nextRequiredArtifact: "cycle-011 explicit obstruction-class transport map or a named weaker lemma that is not equivalent to Chowla/twin-prime conjectures",
    obligations: mapped,
  };
}

function mdEscape(text) {
  return String(text).replace(/\|/g, "\\|");
}

function renderMarkdown(report) {
  const lines = [];
  lines.push("# Cycle 010 proof-obligation map", "");
  lines.push("Purpose: convert honest-open finite-field theorem families into explicit missing integer proof ingredients before any new experiment.", "");
  lines.push("## Summary", "");
  lines.push(`- Obligations: ${report.summary.obligationCount}`);
  lines.push(`- Blocked obligations: ${report.summary.blockedCount}`);
  lines.push(`- Potential proof routes with all known substitutes: ${report.summary.potentialProofRouteCount}`);
  lines.push(`- Major open substitute lemmas: ${report.summary.majorOpenLemmaCount}`);
  lines.push(`- Not-transportable ingredients: ${report.summary.notTransportableIngredientCount}`);
  lines.push(`- Experimentally actionable obligations: ${report.summary.experimentallyActionableCount}`);
  lines.push(`- Next required artifact: ${report.summary.nextRequiredArtifact}`, "");
  lines.push("## Obligation Table", "");
  lines.push("| id | catalog entry | decision | integer statement | blocker |");
  lines.push("| --- | --- | --- | --- | --- |");
  for (const item of report.summary.obligations) {
    lines.push(`| ${item.id} | ${item.catalogEntryId} | ${item.classification.decision} | ${mdEscape(item.integerStatement)} | ${mdEscape(item.blocker)} |`);
  }
  lines.push("");
  for (const item of report.summary.obligations) {
    lines.push(`## ${item.id}`, "");
    lines.push(`Finite-field theorem input: ${item.finiteFieldTheoremInput}`, "");
    lines.push("Proof ingredients:", "");
    lines.push("| ingredient | finite-field role | integer substitute | status |");
    lines.push("| --- | --- | --- | --- |");
    for (const ingredient of item.proofIngredients) {
      lines.push(`| ${mdEscape(ingredient.ingredient)} | ${mdEscape(ingredient.finiteFieldRole)} | ${mdEscape(ingredient.integerSubstitute)} | ${ingredient.substituteStatus} |`);
    }
    lines.push("");
    lines.push(`Prior evidence: ${item.priorEvidence.join("; ")}`);
    lines.push("");
    lines.push(`Next allowed action: ${item.nextAllowedAction}`);
    lines.push("");
  }
  lines.push(`JSON: \`${report.paths.json}\``);
  lines.push(`SVG: \`${report.paths.svg}\``);
  return `${lines.join("\n")}\n`;
}

function renderSvg(report) {
  const width = 1180;
  const height = 640;
  const pad = 70;
  const rows = report.summary.obligations.map((item, i) => {
    const y = 150 + i * 132;
    const open = item.classification.missingOpenCount;
    const noTransport = item.classification.notTransportableCount;
    const tested = item.classification.testedNoBreakthroughCount;
    return `<text x="${pad}" y="${y}" fill="#f8fafc" font-size="14">${item.catalogEntryId}</text>
<rect x="${pad}" y="${y + 18}" width="${open * 90}" height="24" fill="#ef4444" opacity="0.85"/>
<rect x="${pad + open * 90 + 8}" y="${y + 18}" width="${noTransport * 90}" height="24" fill="#f59e0b" opacity="0.85"/>
<rect x="${pad + (open + noTransport) * 90 + 16}" y="${y + 18}" width="${tested * 90}" height="24" fill="#38bdf8" opacity="0.85"/>
<text x="${pad}" y="${y + 62}" fill="#94a3b8" font-size="12">open=${open} no-transport=${noTransport} tested-no-breakthrough=${tested}</text>
<text x="${pad}" y="${y + 86}" fill="#cbd5e1" font-size="11">${item.blocker}</text>`;
  }).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="${width}" height="${height}" fill="#07111f"/>
<g font-family="Menlo, Consolas, monospace">
<text x="${pad}" y="42" fill="#f8fafc" font-size="21" font-weight="700">Cycle 010: proof-obligation map</text>
<text x="${pad}" y="70" fill="#94a3b8" font-size="13">Honest-open finite-field theorem families are blocked until the missing integer substitute is smaller than the original open conjecture.</text>
<text x="${pad}" y="112" fill="#ef4444" font-size="12">red=open major conjecture</text>
<text x="${pad + 245}" y="112" fill="#f59e0b" font-size="12">orange=not transportable</text>
<text x="${pad + 500}" y="112" fill="#38bdf8" font-size="12">blue=tested no breakthrough</text>
${rows}
</g>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
const summary = summarize(obligations);
const base = "cycle-010-proof-obligation-map";
const paths = {
  json: path.join(outDir, `${base}.json`),
  md: path.join(outDir, `${base}.md`),
  svg: path.join(outDir, `${base}.svg`),
};
const report = {
  candidate: "Proof-obligation map for honest-open finite-field theorem families",
  generatedAt: new Date().toISOString(),
  catalogPath,
  summary,
  paths,
};

fs.writeFileSync(paths.json, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(paths.md, renderMarkdown(report));
fs.writeFileSync(paths.svg, renderSvg(report));

console.log(JSON.stringify({
  ok: true,
  candidate: report.candidate,
  obligationCount: summary.obligationCount,
  blockedCount: summary.blockedCount,
  potentialProofRouteCount: summary.potentialProofRouteCount,
  experimentallyActionableCount: summary.experimentallyActionableCount,
  nextRequiredArtifact: summary.nextRequiredArtifact,
  paths,
}, null, 2));
