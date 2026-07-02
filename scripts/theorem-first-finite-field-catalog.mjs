#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const outDir = process.argv[2] || "logs/two-universes-protocol";

const sources = {
  sawinShusterman2022: {
    title: "On the Chowla and twin primes conjectures over F_q[T]",
    authors: "Will Sawin, Mark Shusterman",
    venue: "Annals of Mathematics 196 (2022), 457-506",
    url: "https://annals.math.princeton.edu/2022/196-2/p01",
    role: "large-uniformity Chowla k-point correlations and quantitative twin irreducibles over F_q[T]",
  },
  carmonRudnick2012: {
    title: "The autocorrelation of the Mobius function and Chowla's conjecture for the rational function field",
    authors: "Dan Carmon, Zeev Rudnick",
    venue: "Quarterly Journal of Mathematics / arXiv:1205.1599",
    url: "https://arxiv.org/abs/1205.1599",
    role: "large-q Mobius autocorrelation / Chowla theorem in odd characteristic",
  },
  carmonChar2: {
    title: "The autocorrelation of the Mobius function and Chowla's conjecture for the rational function field in characteristic 2",
    authors: "Dan Carmon",
    venue: "arXiv:1409.3694",
    url: "https://arxiv.org/pdf/1409.3694",
    role: "characteristic-2 Chowla analogue using Berlekamp-style discriminant data",
  },
  kurlbergRosenzweig2018: {
    title: "Prime and Mobius correlations for very short intervals in F_q[x]",
    authors: "Par Kurlberg, Lior Rosenzweig",
    venue: "arXiv:1802.01215",
    url: "https://arxiv.org/abs/1802.01215",
    role: "very-short-interval prime/Mobius correlations, generic Morse cases, and non-generic failures",
  },
  conradMobiusResidue: {
    title: "The Mobius function and the residue theorem",
    authors: "Brian Conrad, Keith Conrad",
    venue: "expository article",
    url: "https://kconrad.math.uconn.edu/articles/mobresidue.pdf",
    role: "finite-field Bouniakowsky obstruction and Mobius-value phenomena with no classical analogue",
  },
  localImplementation: {
    title: "PrimeVisuals function-field arithmetic kernel",
    authors: "local repository",
    venue: "src/core/ffield.js",
    url: "src/core/ffield.js",
    role: "exact finite polynomial arithmetic, Mobius, Liouville, irreducible tables, and two-point evaluators",
  },
};

const entries = [
  {
    id: "gauss-necklace-irreducible-count",
    family: "prime-polynomial-count",
    theoremStatement: "For monic irreducibles of degree n over F_q, I_q(n) = (1/n) * sum_{d|n} mu(d) q^(n/d).",
    finiteFieldObject: "degree shell of monic irreducible polynomials in F_q[t]",
    transportClass: "honest-integer-analogue-known",
    integerAnalogue: "prime number theorem scale pi(x) ~ x/log x",
    statusForLoop: "known calibration, not a discovery target",
    sourceIds: ["localImplementation"],
    priorCycleContact: ["cycle-002", "cycle-007"],
    promotionRisk: "Known theorem on the finite-field side and known/asymptotic theorem on the integer side; cannot be promoted as new.",
    nextUse: "Use only as a sanity check for irreducible table construction and normalization.",
  },
  {
    id: "complete-degree-shell-mobius-sum",
    family: "mobius-complete-family",
    theoremStatement: "For monic degree shells, sum_{deg F=n} mu(F) is 1 at n=0, -q at n=1, and 0 for n>=2.",
    finiteFieldObject: "all monic polynomials of fixed degree",
    transportClass: "finite-field-complete-family-only",
    integerAnalogue: "Mertens/PNT-style cancellation is not a complete-family identity over Z",
    statusForLoop: "exact calibration, no honest transport as an experiment",
    sourceIds: ["localImplementation"],
    priorCycleContact: ["cycle-008"],
    promotionRisk: "The exact zero is caused by the rational zeta function of F_q[t]; an integer partial sum is not the same object.",
    nextUse: "Use as a guard against treating complete-family cancellation as an integer-prime discovery.",
  },
  {
    id: "pellet-mobius-discriminant",
    family: "mobius-discriminant-character",
    theoremStatement: "For odd q, polynomial Mobius parity is (-1)^deg(F) times the quadratic character of Disc(F), with zero on repeated-root cases.",
    finiteFieldObject: "discriminant character on coefficient space",
    transportClass: "no-honest-integer-transport",
    integerAnalogue: "no coefficient-space discriminant character controls integer primality or integer Mobius values",
    statusForLoop: "finite-field mechanism only",
    sourceIds: ["carmonRudnick2012"],
    priorCycleContact: ["cycle-001"],
    promotionRisk: "This explains finite-field Mobius parity but was already rejected because the coefficient-neighborhood object has no honest Z analogue.",
    nextUse: "Use only for finite-field mechanism explanation and novelty audits.",
  },
  {
    id: "berlekamp-characteristic-two-mobius",
    family: "mobius-discriminant-character",
    theoremStatement: "In characteristic 2, Berlekamp/Artin-Schreier-style discriminant data replaces the odd-characteristic quadratic discriminant character.",
    finiteFieldObject: "Berlekamp discriminant / trace data over characteristic-2 coefficient space",
    transportClass: "no-honest-integer-transport",
    integerAnalogue: "no direct integer counterpart to characteristic-2 Artin-Schreier trace parity",
    statusForLoop: "finite-field mechanism only",
    sourceIds: ["carmonChar2", "conradMobiusResidue"],
    priorCycleContact: ["cycle-001", "cycle-008"],
    promotionRisk: "A characteristic-2 mechanism can be exact and still be non-transportable to Z.",
    nextUse: "Use as a guard against mixing q=2 effects into an alleged integer law.",
  },
  {
    id: "carmon-rudnick-large-q-chowla",
    family: "chowla-mobius-correlation",
    theoremStatement: "For fixed degree n and fixed distinct shifts, the normalized Mobius autocorrelation over monic degree-n polynomials tends to 0 as q grows.",
    finiteFieldObject: "Mobius products over shifted monic degree shells",
    transportClass: "honest-integer-analogue-open",
    integerAnalogue: "Chowla correlations for integer Mobius/Liouville shifts",
    statusForLoop: "proof-target family, not a numeric-discovery family",
    sourceIds: ["carmonRudnick2012"],
    priorCycleContact: ["cycle-006", "cycle-008"],
    promotionRisk: "Cycle 008 found no integer signal above controls; computation can only support a conjectural audit, not a theorem.",
    nextUse: "If pursued, write a proof-obligation map from finite-field character sums to an integer substitute before running more data.",
  },
  {
    id: "sawin-shusterman-chowla-uniform",
    family: "chowla-mobius-correlation",
    theoremStatement: "Chowla k-point correlations over F_q[T] hold with large uniformity in shifts under the paper's finite-field hypotheses.",
    finiteFieldObject: "higher-order Mobius products over polynomial shifts",
    transportClass: "honest-integer-analogue-open",
    integerAnalogue: "integer Chowla conjecture for k-point Mobius/Liouville correlations",
    statusForLoop: "major theorem-side target, but integer side remains open",
    sourceIds: ["sawinShusterman2022"],
    priorCycleContact: ["cycle-005", "cycle-006", "cycle-008"],
    promotionRisk: "Previous additive-shift and multiplicative-sign cycles did not find a control-surviving integer candidate.",
    nextUse: "Use to derive proof obligations rather than another aggregate correlation plot.",
  },
  {
    id: "sawin-shusterman-twin-irreducibles",
    family: "prime-tuples",
    theoremStatement: "Twin irreducible polynomial counts over F_q[T] are proved in quantitative form under the paper's finite-field hypotheses.",
    finiteFieldObject: "irreducible pairs F and F+A with fixed nonzero polynomial shift A",
    transportClass: "honest-integer-analogue-open",
    integerAnalogue: "Hardy-Littlewood prime-pair / twin-prime conjectures over Z",
    statusForLoop: "major theorem-side target, but not a current experimental survivor",
    sourceIds: ["sawinShusterman2022"],
    priorCycleContact: ["cycle-002", "cycle-003", "cycle-004", "cycle-005", "cycle-007"],
    promotionRisk: "Earlier prime-indicator additive-shift and quotient cycles were absorbed by local/composite/field controls.",
    nextUse: "Only restart if the transport map names a new proof ingredient, not a new visualization.",
  },
  {
    id: "kurlberg-rosenzweig-very-short-intervals",
    family: "very-short-intervals",
    theoremStatement: "For generic Morse polynomial centers, very-short-interval prime and Mobius correlations have square-root-size errors; non-generic cases can fail badly.",
    finiteFieldObject: "coefficient-line intervals I(f) = {f+a : a in F_q}",
    transportClass: "obstruction-or-coefficient-space-only",
    integerAnalogue: "integer short intervals have no direct coefficient-line parameter and no Morse/genericity condition",
    statusForLoop: "intuition source and negative control catalog",
    sourceIds: ["kurlbergRosenzweig2018"],
    priorCycleContact: ["cycle-001", "cycle-002", "cycle-008"],
    promotionRisk: "Coefficient-space intervals can create finite-field artifacts if treated as integer short intervals.",
    nextUse: "Use the non-generic exceptions as a mutation source: search for explicit obstruction classes, not universal visual patterns.",
  },
  {
    id: "conrad-residue-theorem-obstruction",
    family: "finite-field-bouniakowsky-obstruction",
    theoremStatement: "Some finite-field polynomial-prime-value analogues fail due to global Mobius/residue obstructions with no classical local-obstruction counterpart.",
    finiteFieldObject: "polynomial values f(g) over kappa[u] and their Mobius-value statistics",
    transportClass: "finite-field-obstruction-no-classical-analogue",
    integerAnalogue: "none known; the source explicitly contrasts this with expected integer Mobius averages",
    statusForLoop: "negative transport guard",
    sourceIds: ["conradMobiusResidue"],
    priorCycleContact: ["cycle-001", "cycle-009"],
    promotionRisk: "A finite-field obstruction can be a real theorem and still be evidence against a two-universe law.",
    nextUse: "Treat finite-field-only obstructions as vetoes unless a precise integer substitute is named.",
  },
];

function countBy(values, key) {
  const out = {};
  for (const item of values) out[item[key]] = (out[item[key]] || 0) + 1;
  return out;
}

function experimentEligibility(entry) {
  if (entry.transportClass !== "honest-integer-analogue-open") {
    return {
      eligible: false,
      reason: "No honest open integer analogue that can seed an experiment.",
    };
  }
  if (entry.priorCycleContact.length >= 2) {
    return {
      eligible: false,
      reason: `Honest analogue exists, but related experimental families already failed controls in ${entry.priorCycleContact.join(", ")}; require proof-obligation map before new data.`,
    };
  }
  return {
    eligible: true,
    reason: "Honest open integer analogue and not exhausted by prior cycles.",
  };
}

function summarize(entries) {
  const withEligibility = entries.map((entry) => ({
    ...entry,
    experimentEligibility: experimentEligibility(entry),
  }));
  return {
    sourceCount: Object.keys(sources).length,
    entryCount: entries.length,
    byTransportClass: countBy(entries, "transportClass"),
    honestOpenEntries: withEligibility.filter((entry) => entry.transportClass === "honest-integer-analogue-open").map((entry) => entry.id),
    immediatelyExperimentEligible: withEligibility.filter((entry) => entry.experimentEligibility.eligible).map((entry) => entry.id),
    blockedByNoTransport: withEligibility.filter((entry) => entry.transportClass.includes("no") || entry.transportClass.includes("only")).map((entry) => entry.id),
    nextRequiredArtifact: "cycle-010 proof-obligation map for honest-open theorem families before any new integer experiment",
    entries: withEligibility,
  };
}

function mdEscape(text) {
  return String(text).replace(/\|/g, "\\|");
}

function renderMarkdown(report) {
  const lines = [];
  lines.push("# Cycle 009 theorem-first finite-field catalog", "");
  lines.push("Purpose: force the Two-Universes loop to start from exact finite-field theorems and classify transport before any new integer experiment.", "");
  lines.push("## Decision-Relevant Summary", "");
  lines.push(`- Sources: ${report.summary.sourceCount}`);
  lines.push(`- Catalog entries: ${report.summary.entryCount}`);
  lines.push(`- Honest-open integer analogues: ${report.summary.honestOpenEntries.join(", ") || "none"}`);
  lines.push(`- Immediately experiment-eligible entries: ${report.summary.immediatelyExperimentEligible.join(", ") || "none"}`);
  lines.push(`- Next required artifact: ${report.summary.nextRequiredArtifact}`, "");
  lines.push("## Transport Classes", "");
  lines.push("| class | count |");
  lines.push("| --- | ---: |");
  for (const [klass, count] of Object.entries(report.summary.byTransportClass)) {
    lines.push(`| ${klass} | ${count} |`);
  }
  lines.push("", "## Catalog", "");
  lines.push("| id | family | transport | status | experiment eligibility | source ids |");
  lines.push("| --- | --- | --- | --- | --- | --- |");
  for (const entry of report.summary.entries) {
    lines.push(`| ${entry.id} | ${entry.family} | ${entry.transportClass} | ${mdEscape(entry.statusForLoop)} | ${entry.experimentEligibility.eligible ? "yes" : `no: ${mdEscape(entry.experimentEligibility.reason)}`} | ${entry.sourceIds.join(", ")} |`);
  }
  lines.push("", "## Theorem Statements", "");
  for (const entry of report.summary.entries) {
    lines.push(`### ${entry.id}`, "");
    lines.push(`Statement: ${entry.theoremStatement}`);
    lines.push("");
    lines.push(`Finite-field object: ${entry.finiteFieldObject}`);
    lines.push("");
    lines.push(`Integer analogue: ${entry.integerAnalogue}`);
    lines.push("");
    lines.push(`Promotion risk: ${entry.promotionRisk}`);
    lines.push("");
    lines.push(`Next use: ${entry.nextUse}`);
    lines.push("");
  }
  lines.push("## Sources", "");
  lines.push("| id | title | authors | venue | url | role |");
  lines.push("| --- | --- | --- | --- | --- | --- |");
  for (const [id, source] of Object.entries(report.sources)) {
    lines.push(`| ${id} | ${mdEscape(source.title)} | ${mdEscape(source.authors)} | ${mdEscape(source.venue)} | ${source.url} | ${mdEscape(source.role)} |`);
  }
  lines.push("", `JSON: \`${report.paths.json}\``);
  lines.push(`SVG: \`${report.paths.svg}\``);
  return `${lines.join("\n")}\n`;
}

function renderSvg(report) {
  const classes = Object.entries(report.summary.byTransportClass);
  const width = 1180;
  const height = 620;
  const pad = 70;
  const barH = 34;
  const gap = 18;
  const maxCount = Math.max(1, ...classes.map(([, count]) => count));
  const colors = ["#38bdf8", "#f59e0b", "#22c55e", "#ef4444", "#a78bfa", "#94a3b8"];
  const bars = classes.map(([klass, count], i) => {
    const y = 132 + i * (barH + gap);
    const w = ((width - 2 * pad - 320) * count) / maxCount;
    const color = colors[i % colors.length];
    return `<text x="${pad}" y="${y + 23}" fill="#e5edf7" font-size="13">${klass}</text>
<rect x="${pad + 360}" y="${y}" width="${w.toFixed(2)}" height="${barH}" fill="${color}" opacity="0.85"/>
<text x="${pad + 372 + w}" y="${y + 23}" fill="#f8fafc" font-size="13">${count}</text>`;
  }).join("\n");
  const sourceRows = report.summary.entries.map((entry, i) => {
    const x = pad + (i % 3) * 340;
    const y = 440 + Math.floor(i / 3) * 30;
    const mark = entry.experimentEligibility.eligible ? "ELIGIBLE" : "BLOCKED";
    const color = entry.experimentEligibility.eligible ? "#22c55e" : "#f97316";
    return `<text x="${x}" y="${y}" fill="${color}" font-size="11">${entry.id}: ${mark}</text>`;
  }).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="${width}" height="${height}" fill="#07111f"/>
<g font-family="Menlo, Consolas, monospace">
<text x="${pad}" y="42" fill="#f8fafc" font-size="21" font-weight="700">Cycle 009: theorem-first finite-field catalog</text>
<text x="${pad}" y="69" fill="#94a3b8" font-size="13">A result can seed a new experiment only after exact theorem, transport class, and proof-obligation checks.</text>
<text x="${pad}" y="101" fill="#cbd5e1" font-size="14">Transport class counts</text>
${bars}
<text x="${pad}" y="402" fill="#cbd5e1" font-size="14">Entry experiment eligibility</text>
${sourceRows}
</g>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
const summary = summarize(entries);
const base = "cycle-009-theorem-first-finite-field-catalog";
const paths = {
  json: path.join(outDir, `${base}.json`),
  md: path.join(outDir, `${base}.md`),
  svg: path.join(outDir, `${base}.svg`),
};
const report = {
  candidate: "Theorem-first finite-field catalog",
  generatedAt: new Date().toISOString(),
  purpose: "Classify exact finite-field theorem families before proposing any new integer experiment.",
  sources,
  summary,
  paths,
};

fs.writeFileSync(paths.json, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(paths.md, renderMarkdown(report));
fs.writeFileSync(paths.svg, renderSvg(report));

console.log(JSON.stringify({
  ok: true,
  candidate: report.candidate,
  entryCount: summary.entryCount,
  honestOpenEntries: summary.honestOpenEntries,
  immediatelyExperimentEligible: summary.immediatelyExperimentEligible,
  nextRequiredArtifact: summary.nextRequiredArtifact,
  paths,
}, null, 2));
