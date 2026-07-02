#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const outDir = process.argv[2] || "logs/two-universes-protocol";
const cycle = Number(process.argv[3] || 1);

const ROOT_ARTIFACT_DIR = "logs/two-universes-artifacts";

const GATES = [
  {
    id: "precise_statement",
    name: "Precise theorem-shaped statement",
    required: true,
    question: "Can the candidate be stated as a formula, law, or divergence rather than a visual impression?",
  },
  {
    id: "finite_field_anchor",
    name: "Exact finite-field interpretation",
    required: true,
    question: "Is there an exact F_q[t] object or known algebraic mechanism on the theorem side?",
  },
  {
    id: "integer_holdout",
    name: "Integer-prime holdout evidence",
    required: true,
    question: "Was an integer-prime analogue preregistered and checked on unseen ranges?",
  },
  {
    id: "controls",
    name: "Local/null/random controls",
    required: true,
    question: "Does the candidate beat local baselines, random controls, and known leakage/placebo tests?",
  },
  {
    id: "compression",
    name: "Compression / low parameter count",
    required: true,
    question: "Is the rule simpler than the data and not explained by tuning many fitted knobs?",
  },
  {
    id: "scale_stability",
    name: "Scale and field stability",
    required: true,
    question: "Does the result survive changes in degree, q, range, or normalization?",
  },
  {
    id: "novelty_audit",
    name: "Novelty audit",
    required: true,
    question: "Is it not just a renamed known theorem, local obstruction, or plotting artifact?",
  },
  {
    id: "reproducibility",
    name: "Reproducible code, logs, plots",
    required: true,
    question: "Are the scripts, raw JSON/MD artifacts, and evidence pack present?",
  },
  {
    id: "proof_path",
    name: "Plausible proof path",
    required: true,
    question: "Can the result be organized into definitions, finite-field proposition, integer analogue, and obstruction/conjecture?",
  },
  {
    id: "expert_pack",
    name: "Expert-ready evidence pack",
    required: true,
    question: "Is there a concise pack with object, mechanism, holdouts, controls, novelty, and artifacts?",
  },
];

const CYCLE_1_CANDIDATE = {
  id: "cycle-001-mobius-gap-cross-q",
  title: "Cross-q Mobius-parity gap law",
  class: "finite-field lead audited under strict Two-Universes gates",
  councilSuccessTarget: "S1/S2/S3 candidate only if integer analogue and holdouts exist",
  preregistration: "logs/2026-06-13-mobius-gap-cross-q.md",
  expertPack: path.join(ROOT_ARTIFACT_DIR, "mobius-gap-cross-q-expert-pack.md"),
  evidenceFiles: [
    path.join(ROOT_ARTIFACT_DIR, "mobius-gap-cross-q-law.json"),
    path.join(ROOT_ARTIFACT_DIR, "mobius-gap-cross-q-law-refined.json"),
    path.join(ROOT_ARTIFACT_DIR, "mobius-gap-cross-q-law-f8-holdout.json"),
    path.join(ROOT_ARTIFACT_DIR, "mobius-gap-cross-q-law-f2-null.json"),
    path.join(ROOT_ARTIFACT_DIR, "mobius-gap-cross-q-law.md"),
    path.join(ROOT_ARTIFACT_DIR, "mobius-gap-cross-q-law-refined.md"),
    path.join(ROOT_ARTIFACT_DIR, "mobius-gap-cross-q-law-f8-holdout.md"),
    path.join(ROOT_ARTIFACT_DIR, "mobius-gap-cross-q-law-f2-null.md"),
    path.join(ROOT_ARTIFACT_DIR, "mobius_gap_cross_q_stub.lean"),
    "scripts/mobius-gap-cross-q-law.mjs",
  ],
};

const CYCLE_2_CANDIDATE = {
  id: "cycle-002-fixed-shift-graph-degree",
  title: "Order-free fixed-shift graph degree spectrum",
  class: "forced representation mutation from lexicographic gaps to unordered additive-shift graphs",
  councilSuccessTarget: "S1/S2 candidate only if Z and F_q[t] share a residual law after local controls",
  preregistration: "logs/2026-06-13-playground-critical-line.md",
  evidenceFiles: [
    "logs/playground-artifacts/fixed-shift-graph-degree-audit-8000000.json",
    "logs/playground-artifacts/fixed-shift-graph-degree-audit-8000000.md",
    "logs/playground-artifacts/fixed-shift-graph-degree-audit-8000000.svg",
    "logs/playground-artifacts/fixed-shift-graph-degree-audit-8000000.png",
    "scripts/fixed-shift-graph-degree-audit.mjs",
  ],
};

const CYCLE_3_CANDIDATE = {
  id: "cycle-003-centered-shift-tensor",
  title: "Pair-centered multi-shift residual tensor",
  class: "forced mutation from raw graph degree variance to train/holdout residual covariance",
  councilSuccessTarget: "S1/S2 candidate only if centered residual covariance aligns across Z and multiple F_q[t] universes after local-state controls",
  preregistration: "logs/two-universes-protocol/README.md",
  evidenceFiles: [
    "logs/two-universes-protocol/cycle-003-centered-shift-tensor-2000000.json",
    "logs/two-universes-protocol/cycle-003-centered-shift-tensor-2000000.md",
    "logs/two-universes-protocol/cycle-003-centered-shift-tensor-2000000.svg",
    "scripts/centered-shift-tensor-audit.mjs",
  ],
};

const CYCLE_4_CANDIDATE = {
  id: "cycle-004-local-state-centered-shift-tensor",
  title: "Local-state centered multi-shift residual tensor",
  class: "forced mutation from global pair-rate centering to residue/factor-state conditioned baselines",
  councilSuccessTarget: "S1/S2 candidate only if local-state centered residual tensors survive controls with low fallback, small residual means, and scale stability across Z and F_q[t]",
  preregistration: "logs/two-universes-protocol/README.md",
  evidenceFiles: [
    "logs/two-universes-protocol/cycle-004-local-state-centered-tensor-2000000.json",
    "logs/two-universes-protocol/cycle-004-local-state-centered-tensor-2000000.md",
    "logs/two-universes-protocol/cycle-004-local-state-centered-tensor-2000000.svg",
    "scripts/local-state-centered-tensor-audit.mjs",
  ],
};

const CYCLE_5_CANDIDATE = {
  id: "cycle-005-exact-admissibility-tensor",
  title: "Exact admissibility-conditioned pair/triple residual tensor",
  class: "forced mutation from fallback-heavy local rates to deterministic obstruction subtraction and allowed pair/triple rates",
  councilSuccessTarget: "S1/S2 candidate only if exact admissibility residual tensors survive local controls with a matched signed/scale-stable law across Z and F_q[t]",
  preregistration: "logs/two-universes-protocol/README.md",
  evidenceFiles: [
    "logs/two-universes-protocol/cycle-005-exact-admissibility-tensor-2000000.json",
    "logs/two-universes-protocol/cycle-005-exact-admissibility-tensor-2000000.md",
    "logs/two-universes-protocol/cycle-005-exact-admissibility-tensor-2000000.svg",
    "scripts/exact-admissibility-tensor-audit.mjs",
  ],
};

const CYCLE_6_CANDIDATE = {
  id: "cycle-006-signed-profile-decay",
  title: "Signed residual-profile and scale-decay matching",
  class: "forced mutation from raw exact-admissibility tensor magnitude to signed profile and decay-law comparison",
  councilSuccessTarget: "S1/S2 candidate only if signed residual profiles and decay slopes match across Z and F_q[t] beyond eligible random/composite controls",
  preregistration: "logs/two-universes-protocol/README.md",
  evidenceFiles: [
    "logs/two-universes-protocol/cycle-006-signed-profile-decay-4000000.json",
    "logs/two-universes-protocol/cycle-006-signed-profile-decay-4000000.md",
    "logs/two-universes-protocol/cycle-006-signed-profile-decay-4000000.svg",
    "scripts/signed-profile-decay-audit.mjs",
  ],
};

const CYCLE_7_CANDIDATE = {
  id: "cycle-007-quotient-spectral-residual",
  title: "Quotient spectral residual edge",
  class: "forced mutation from local additive-shift tensors to quotient-domain prime-indicator residual spectra",
  councilSuccessTarget: "S1/S2 candidate only if quotient spectral residual profiles survive rough-random, rough-composite, Cramer, and finite-field eligible controls across Z and F_q[t]",
  preregistration: "logs/two-universes-protocol/README.md",
  evidenceFiles: [
    "logs/two-universes-protocol/cycle-007-quotient-spectral-residual-4000000.json",
    "logs/two-universes-protocol/cycle-007-quotient-spectral-residual-4000000.md",
    "logs/two-universes-protocol/cycle-007-quotient-spectral-residual-4000000.svg",
    "scripts/quotient-spectral-residual-audit.mjs",
  ],
};

const CYCLE_8_CANDIDATE = {
  id: "cycle-008-mobius-liouville-correlation",
  title: "Mobius/Liouville matched fixed-lag correlations",
  class: "forced mutation from prime-indicator local geometry to multiplicative-sign correlations",
  councilSuccessTarget: "S1/S2 candidate only if Mobius/Liouville fixed-lag correlation energy/profile survives controls across Z and F_q[t]",
  preregistration: "logs/two-universes-protocol/README.md",
  evidenceFiles: [
    "logs/two-universes-protocol/cycle-008-mobius-liouville-correlation-4000000.json",
    "logs/two-universes-protocol/cycle-008-mobius-liouville-correlation-4000000.md",
    "logs/two-universes-protocol/cycle-008-mobius-liouville-correlation-4000000.svg",
    "scripts/mobius-liouville-correlation-audit.mjs",
  ],
};

const CYCLE_9_CANDIDATE = {
  id: "cycle-009-theorem-first-finite-field-catalog",
  title: "Theorem-first finite-field catalog",
  class: "forced mutation from statistic-first experiments to exact theorem transport classification",
  councilSuccessTarget: "Catalog only: no S1/S2 promotion unless a theorem family has an honest integer transport map, proof obligations, controls, holdouts, novelty audit, and expert pack",
  preregistration: "logs/two-universes-protocol/README.md",
  evidenceFiles: [
    "logs/two-universes-protocol/cycle-009-theorem-first-finite-field-catalog.json",
    "logs/two-universes-protocol/cycle-009-theorem-first-finite-field-catalog.md",
    "logs/two-universes-protocol/cycle-009-theorem-first-finite-field-catalog.svg",
    "scripts/theorem-first-finite-field-catalog.mjs",
  ],
};

const CYCLE_10_CANDIDATE = {
  id: "cycle-010-proof-obligation-map",
  title: "Proof-obligation map for honest-open finite-field theorem families",
  class: "forced mutation from theorem catalog to explicit missing-lemma classification",
  councilSuccessTarget: "No experiment or promotion unless an honest-open theorem family yields a missing integer lemma smaller than the original open conjecture",
  preregistration: "logs/two-universes-protocol/README.md",
  evidenceFiles: [
    "logs/two-universes-protocol/cycle-010-proof-obligation-map.json",
    "logs/two-universes-protocol/cycle-010-proof-obligation-map.md",
    "logs/two-universes-protocol/cycle-010-proof-obligation-map.svg",
    "scripts/proof-obligation-map.mjs",
  ],
};

const CYCLE_11_CANDIDATE = {
  id: "cycle-011-obstruction-class-transport-map",
  title: "Obstruction-class transport map",
  class: "forced mutation from broad theorem families to explicit finite-field failure-mode transport",
  councilSuccessTarget: "No experiment or promotion unless a finite-field obstruction has a same-form, non-exhausted integer obstruction with fixed controls",
  preregistration: "logs/two-universes-protocol/README.md",
  evidenceFiles: [
    "logs/two-universes-protocol/cycle-011-obstruction-class-transport-map.json",
    "logs/two-universes-protocol/cycle-011-obstruction-class-transport-map.md",
    "logs/two-universes-protocol/cycle-011-obstruction-class-transport-map.svg",
    "scripts/obstruction-class-transport-map.mjs",
  ],
};

const CYCLE_12_CANDIDATE = {
  id: "cycle-012-branch-stop-ledger",
  title: "Branch-stop ledger for aggregate Two-Universes transport route",
  class: "forced stop of the current aggregate route after theorem/proof/obstruction filters find no actionable candidate",
  councilSuccessTarget: "Stop current route unless a new domain/object restarts strict registration or a rejected family fixes a named failed gate before data",
  preregistration: "logs/two-universes-protocol/README.md",
  evidenceFiles: [
    "logs/two-universes-protocol/cycle-012-branch-stop-ledger.json",
    "logs/two-universes-protocol/cycle-012-branch-stop-ledger.md",
    "logs/two-universes-protocol/cycle-012-branch-stop-ledger.svg",
    "scripts/two-universes-branch-stop-ledger.mjs",
  ],
};

const CYCLE_13_CANDIDATE = {
  id: "cycle-013-cubic-chebotarev-transport",
  title: "Cubic Chebotarev splitting transport",
  class: "new-domain registration after aggregate branch stop: Frobenius splitting types instead of prime tuples or Mobius correlations",
  councilSuccessTarget: "Calibration only unless splitting-type residuals beat Chebotarev controls and produce a theorem-shaped new mechanism beyond known Chebotarev density",
  preregistration: "logs/two-universes-protocol/README.md",
  evidenceFiles: [
    "logs/two-universes-protocol/cycle-013-cubic-chebotarev-transport-4000000.json",
    "logs/two-universes-protocol/cycle-013-cubic-chebotarev-transport-4000000.md",
    "logs/two-universes-protocol/cycle-013-cubic-chebotarev-transport-4000000.svg",
    "scripts/cubic-chebotarev-transport-audit.mjs",
  ],
};

const CYCLE_14_CANDIDATE = {
  id: "cycle-014-joint-cubic-chebotarev-residual",
  title: "Joint cubic Chebotarev residual",
  class: "forced mutation from single-extension class proportions to joint splitting residuals across two Kummer cubic covers",
  councilSuccessTarget: "S1/S2 candidate only if joint splitting residuals beat product-Chebotarev controls across Z and F_q[t] with scale stability and novelty beyond known Chebotarev",
  preregistration: "logs/two-universes-protocol/README.md",
  evidenceFiles: [
    "logs/two-universes-protocol/cycle-014-joint-cubic-chebotarev-residual-4000000.json",
    "logs/two-universes-protocol/cycle-014-joint-cubic-chebotarev-residual-4000000.md",
    "logs/two-universes-protocol/cycle-014-joint-cubic-chebotarev-residual-4000000.svg",
    "scripts/joint-cubic-chebotarev-residual-audit.mjs",
  ],
};

const CYCLE_15_CANDIDATE = {
  id: "cycle-015-family-cubic-chebotarev-covariance",
  title: "Family cubic Chebotarev covariance",
  class: "forced mutation from fixed Kummer covers to low-conductor family covariance across cubic residue characters",
  councilSuccessTarget: "S1/S2 candidate only if centered family covariance survives controls in Z and q=2,5,7 F_q[t] ladders, with novelty beyond Chebotarev/Kummer independence",
  preregistration: "logs/two-universes-protocol/README.md",
  evidenceFiles: [
    "logs/two-universes-protocol/cycle-015-family-cubic-chebotarev-covariance-8000000.json",
    "logs/two-universes-protocol/cycle-015-family-cubic-chebotarev-covariance-8000000.md",
    "logs/two-universes-protocol/cycle-015-family-cubic-chebotarev-covariance-8000000.svg",
    "scripts/family-cubic-chebotarev-covariance-audit.mjs",
  ],
};

const CYCLE_16_CANDIDATE = {
  id: "cycle-016-complete-weierstrass-trace-identity",
  title: "Complete Weierstrass trace identity transport",
  class: "forced mutation from Chebotarev calibration to a proof-first complete-family character-sum identity",
  councilSuccessTarget: "Calibration only unless an exact finite-field identity leaves a nonzero, control-surviving residual across rational primes and F_q[t] irreducibles",
  preregistration: "logs/two-universes-protocol/README.md",
  evidenceFiles: [
    "logs/two-universes-protocol/cycle-016-complete-weierstrass-trace-identity-8000000.json",
    "logs/two-universes-protocol/cycle-016-complete-weierstrass-trace-identity-8000000.md",
    "logs/two-universes-protocol/cycle-016-complete-weierstrass-trace-identity-8000000.svg",
    "scripts/complete-weierstrass-trace-identity-transport-audit.mjs",
  ],
};

const CYCLE_17_CANDIDATE = {
  id: "cycle-017-complete-weierstrass-second-moment",
  title: "Complete Weierstrass second-moment transport",
  class: "forced mutation from complete trace identity to a higher-moment algebraic-family statistic",
  councilSuccessTarget: "Calibration only unless the exact second-moment theorem leaves a nonzero, control-surviving residual across rational primes and F_q[t] irreducibles",
  preregistration: "logs/two-universes-protocol/README.md",
  evidenceFiles: [
    "logs/two-universes-protocol/cycle-017-complete-weierstrass-second-moment-8000000.json",
    "logs/two-universes-protocol/cycle-017-complete-weierstrass-second-moment-8000000.md",
    "logs/two-universes-protocol/cycle-017-complete-weierstrass-second-moment-8000000.svg",
    "scripts/complete-weierstrass-second-moment-transport-audit.mjs",
  ],
};

const CYCLE_18_CANDIDATE = {
  id: "cycle-018-cm-elliptic-spectral-residual",
  title: "CM elliptic spectral residual",
  class: "forced mutation from complete-family orthogonality moments to a fixed-curve spectral statistic",
  councilSuccessTarget: "S1/S2 candidate only if the fixed CM elliptic u2 spectral residual survives integer controls and matches F_q[t] residue-field profiles across q=3,5,7",
  preregistration: "logs/two-universes-protocol/README.md",
  evidenceFiles: [
    "logs/two-universes-protocol/cycle-018-cm-elliptic-spectral-residual-8000000.json",
    "logs/two-universes-protocol/cycle-018-cm-elliptic-spectral-residual-8000000.md",
    "logs/two-universes-protocol/cycle-018-cm-elliptic-spectral-residual-8000000.svg",
    "scripts/cm-elliptic-spectral-residual-audit.mjs",
  ],
};

const CYCLE_19_CANDIDATE = {
  id: "cycle-019-quadratic-twist-cm-family",
  title: "Quadratic-twist CM family residual",
  class: "forced mutation from constant CM curve to a nonconstant incomplete quadratic-twist family",
  councilSuccessTarget: "S1/S2 candidate only if the incomplete quadratic-twist CM family survives integer controls and matches q=3,5,7 F_q[t] twist-family profiles",
  preregistration: "logs/two-universes-protocol/README.md",
  evidenceFiles: [
    "logs/two-universes-protocol/cycle-019-quadratic-twist-cm-family-8000000.json",
    "logs/two-universes-protocol/cycle-019-quadratic-twist-cm-family-8000000.md",
    "logs/two-universes-protocol/cycle-019-quadratic-twist-cm-family-8000000.svg",
    "scripts/quadratic-twist-cm-family-audit.mjs",
  ],
};

const CYCLE_20_CANDIDATE = {
  id: "cycle-020-noncm-legendre-family-pilot",
  title: "Non-CM Legendre family pilot",
  class: "forced mutation from CM twist factorization to non-CM non-isotrivial Legendre family",
  councilSuccessTarget: "S1/S2 candidate only if the non-CM Legendre-family trace statistic survives integer controls, the full 1M/2M/4M/8M ladder, and q=3,5,7 F_q[t] residue-field profile gates",
  preregistration: "logs/two-universes-protocol/README.md",
  evidenceFiles: [
    "logs/two-universes-protocol/cycle-020-noncm-legendre-family-pilot-20000.json",
    "logs/two-universes-protocol/cycle-020-noncm-legendre-family-pilot-20000.md",
    "logs/two-universes-protocol/cycle-020-noncm-legendre-family-pilot-20000.svg",
    "scripts/noncm-legendre-family-pilot-audit.mjs",
  ],
};

const CYCLE_21_CANDIDATE = {
  id: "cycle-021-legendre-special-supersingular-residual",
  title: "Legendre special supersingular residual",
  class: "forced mutation from pilot-scale non-CM trace computation to theorem-first nonzero residual",
  councilSuccessTarget: "S1/S2 candidate only if a theorem-first Legendre supersingular residual survives local congruence controls, integer 8M ladder, and q=3,5,7 profile gates",
  preregistration: "logs/two-universes-protocol/README.md",
  evidenceFiles: [
    "logs/two-universes-protocol/cycle-021-legendre-special-supersingular-residual-8000000.json",
    "logs/two-universes-protocol/cycle-021-legendre-special-supersingular-residual-8000000.md",
    "logs/two-universes-protocol/cycle-021-legendre-special-supersingular-residual-8000000.svg",
    "scripts/legendre-special-supersingular-residual-audit.mjs",
  ],
};

const CYCLE_22_CANDIDATE = {
  id: "cycle-022-generic-noncm-residual-obstruction-map",
  title: "Generic non-CM residual obstruction map",
  class: "branch-stop filter after special-locus and local-congruence failures",
  councilSuccessTarget: "S1/S2 candidate only if a generic non-CM residual is named before data with exact finite-field baseline, full 8M integer implementation, local/special controls, and q=3,5,7 matched profiles",
  preregistration: "logs/two-universes-protocol/README.md",
  evidenceFiles: [
    "logs/two-universes-protocol/cycle-022-generic-noncm-residual-obstruction-map.json",
    "logs/two-universes-protocol/cycle-022-generic-noncm-residual-obstruction-map.md",
    "logs/two-universes-protocol/cycle-022-generic-noncm-residual-obstruction-map.svg",
    "scripts/generic-noncm-residual-obstruction-map.mjs",
  ],
};

const CYCLE_23_CANDIDATE = {
  id: "cycle-023-quadratic-dirichlet-prime-race",
  title: "Quadratic Dirichlet prime race",
  class: "new-domain registration after algebraic-family stop: Dirichlet character prime races",
  councilSuccessTarget: "S1/S2 candidate only if a matched quadratic character race survives nearby-character, random, bootstrap, and q=3,5,7 finite-field profile controls beyond known Dirichlet/PNT calibration",
  preregistration: "logs/two-universes-protocol/README.md",
  evidenceFiles: [
    "logs/two-universes-protocol/cycle-023-quadratic-dirichlet-prime-race-8000000.json",
    "logs/two-universes-protocol/cycle-023-quadratic-dirichlet-prime-race-8000000.md",
    "logs/two-universes-protocol/cycle-023-quadratic-dirichlet-prime-race-8000000.svg",
    "scripts/quadratic-dirichlet-prime-race-audit.mjs",
  ],
};

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function exists(file) {
  return fs.existsSync(file);
}

function resultRows(summary) {
  const rows = [];
  for (const run of summary.runs || []) {
    for (const scrub of run.scrubModes || []) {
      const result = run.results?.[scrub];
      if (!result) continue;
      rows.push({
        label: run.label,
        q: run.q,
        scrub,
        prediction: run.prediction,
        degree: result.control?.degree,
        realR: result.control?.real?.main?.r,
        realZ: result.control?.real?.main?.z,
        cyclicMeanAbsR: result.control?.cyclic?.r?.meanAbs,
        compositeMeanAbsR: result.control?.composite?.r?.meanAbs,
        highPlaceboR: result.control?.real?.high?.r,
        verdictPass: Boolean(result.verdict?.pass),
        verdictReason: result.verdict?.reason || "",
      });
    }
  }
  return rows;
}

function loadCycle1Evidence() {
  const files = {
    initial: path.join(ROOT_ARTIFACT_DIR, "mobius-gap-cross-q-law.json"),
    refined: path.join(ROOT_ARTIFACT_DIR, "mobius-gap-cross-q-law-refined.json"),
    f8Holdout: path.join(ROOT_ARTIFACT_DIR, "mobius-gap-cross-q-law-f8-holdout.json"),
    f2Null: path.join(ROOT_ARTIFACT_DIR, "mobius-gap-cross-q-law-f2-null.json"),
  };
  const summaries = Object.fromEntries(Object.entries(files).map(([k, f]) => [k, readJson(f)]));
  return {
    files,
    summaries,
    rows: Object.entries(summaries).flatMap(([source, summary]) => resultRows(summary).map((row) => ({ source, ...row }))),
  };
}

function pass(value, evidence, severity = "pass") {
  return { status: value ? "pass" : "fail", evidence, severity };
}

function auditCycle1() {
  const evidence = loadCycle1Evidence();
  const missing = CYCLE_1_CANDIDATE.evidenceFiles.filter((file) => !exists(file));
  const finiteFieldRows = evidence.rows;
  const holdoutRows = finiteFieldRows.filter((row) => ["refined", "f8Holdout", "f2Null"].includes(row.source));
  const passingHoldouts = holdoutRows.filter((row) => row.verdictPass);
  const failingHoldouts = holdoutRows.filter((row) => !row.verdictPass);
  const allRequiredFilesPresent = missing.length === 0;
  const expertPack = fs.readFileSync(CYCLE_1_CANDIDATE.expertPack, "utf8");

  const gateResults = {
    precise_statement: pass(
      /Corr\(P_q\(f-t\), G_\+\(f\)/.test(expertPack) || /R_q\(n\)/.test(expertPack),
      "Expert pack states R_q(n)=Corr(mu(f-t), G_+(f) | scrub) and a q^-2-scale law."
    ),
    finite_field_anchor: pass(
      /Pellet/.test(expertPack) && /Berlekamp/.test(expertPack),
      "Mechanism is anchored in Pellet's discriminant formula for odd q and Berlekamp-Artin-Schreier parity in characteristic 2."
    ),
    integer_holdout: pass(
      false,
      "The pack explicitly says the clean coefficient-space analogue is null or absent over Z; no integer-prime analogue or preregistered Z holdout exists.",
      "hard-fail"
    ),
    controls: pass(
      passingHoldouts.length >= 4 && failingHoldouts.length === 0,
      `${passingHoldouts.length}/${holdoutRows.length} refined/holdout/null rows pass finite-field cyclic, composite, and high-placebo gates.`
    ),
    compression: pass(
      true,
      "The proposed rule is low-parameter: positive low-coefficient parity coupling with q^-2 scale in odd characteristic, null/Artin-Schreier split in characteristic 2."
    ),
    scale_stability: pass(
      passingHoldouts.length >= 4,
      "Evidence spans F_3, F_5, F_7, F_8 holdout, and F_2 null, but remains finite-field only."
    ),
    novelty_audit: pass(
      /Nearest Catalog Result/.test(expertPack) && /Difference:/.test(expertPack),
      "Expert pack compares against Pellet, Berlekamp/Carmon, and Kurlberg-Rosenzweig short-interval catalog results."
    ),
    reproducibility: pass(
      allRequiredFilesPresent,
      missing.length ? `Missing artifacts: ${missing.join(", ")}` : "All listed JSON/MD/script/Lean-stub artifacts are present."
    ),
    proof_path: pass(
      false,
      "There is a plausible finite-field mechanism, but the strict protocol requires an integer analogue and obstruction/conjecture chain; that chain is absent.",
      "hard-fail"
    ),
    expert_pack: pass(
      exists(CYCLE_1_CANDIDATE.expertPack),
      `Expert pack present: ${CYCLE_1_CANDIDATE.expertPack}`
    ),
  };

  const hardFailures = Object.entries(gateResults).filter(([, result]) => result.status !== "pass");
  const promoted = hardFailures.length === 0;
  const status = promoted ? "PROMOTE" : "REJECT_UNDER_STRICT_TWO_UNIVERSES_PROTOCOL";
  const nextMutation = {
    title: "Replace lexicographic coefficient-neighborhood statistic with an order-free matched statistic",
    reason: "The current candidate's strongest feature is native to coefficient-space ordering in F_q[t], and that structure has no honest integer-prime analogue.",
    preregisteredNextMove: [
      "Use additive fixed-shift graphs instead of consecutive lexicographic gaps.",
      "For Z: vertices are primes p<=N; edges connect p and p+h for admissible h.",
      "For F_q[t]: vertices are monic irreducibles of degree n; edges connect f and f+a for low-degree shifts a.",
      "Score centered degree/energy after Hardy-Littlewood or exact finite-field local baselines.",
      "Require train/holdout split in N or degree, q=2/3/5 controls, random-label controls, reducible/composite controls, and high-shift placebo.",
    ],
  };

  return {
    generatedAt: new Date().toISOString(),
    cycle,
    protocolVersion: "two-universes-breakthrough-candidate-v1",
    candidate: CYCLE_1_CANDIDATE,
    gates: GATES,
    gateResults,
    finiteFieldEvidence: {
      holdoutRows,
      passingHoldouts: passingHoldouts.length,
      failingHoldouts: failingHoldouts.length,
    },
    decision: {
      status,
      promoted,
      reason: promoted
        ? "All gates passed."
        : "Strong finite-field phenomenon, but not a strict Two-Universes breakthrough candidate because integer-prime holdout and proof-path gates fail.",
      hardFailures: hardFailures.map(([id, result]) => ({ id, ...result })),
    },
    surpriseLedger: {
      observedSignal: "Low-coefficient Mobius/Frobenius parity predicts forward lexicographic irreducible gap in several F_q[t] settings after direct leakage scrubs.",
      expectedNull: "Cyclic shifts, reducible-polynomial controls, and high-coefficient placebo should be near zero.",
      knownExplanation: "Pellet/Berlekamp parity characters explain the finite-field mechanism.",
      survivedControls: passingHoldouts.map((row) => `${row.label} ${row.scrub} degree ${row.degree}: r=${row.realR.toFixed(6)}`),
      failedControls: failingHoldouts.map((row) => `${row.label} ${row.scrub} degree ${row.degree}: ${row.verdictReason}`),
      whatFailed: "No honest Z coefficient-neighborhood analogue and no integer holdout.",
      suspectedInvariant: "Local Frobenius-parity obstruction to immediate irreducibility in short coefficient neighborhoods.",
      nextMutation: nextMutation.title,
    },
    nextMutation,
  };
}

function inRange(value, range) {
  return value >= range[0] && value <= range[1];
}

function outsideRange(value, range) {
  return value < range[0] || value > range[1];
}

function auditCycle2() {
  const reportFile = "logs/playground-artifacts/fixed-shift-graph-degree-audit-8000000.json";
  const report = readJson(reportFile);
  const missing = CYCLE_2_CANDIDATE.evidenceFiles.filter((file) => !exists(file));
  const integerEndpoint = report.integer.rows.at(-1);
  const f2Endpoint = report.polynomial.find((group) => group.q === 2).rows.at(-1);
  const f3Endpoint = report.polynomial.find((group) => group.q === 3).rows.at(-1);
  const integerCompositeAbsorbs = inRange(integerEndpoint.real.D, integerEndpoint.composite.D);
  const integerCramerSeparates = !inRange(integerEndpoint.real.D, integerEndpoint.cramer.D);
  const fieldMismatch = Math.abs(f2Endpoint.real.D - integerEndpoint.real.D) > 0.25
    || Math.abs(f3Endpoint.real.D - integerEndpoint.real.D) > 0.25;
  const allRequiredFilesPresent = missing.length === 0;

  const gateResults = {
    precise_statement: pass(
      true,
      "Candidate states an unordered graph G_H on primes/irreducibles and scores D=std(degree)/sqrt(mean degree)."
    ),
    finite_field_anchor: pass(
      true,
      "F_q[t] side is an exact finite graph on monic irreducibles of fixed degree with explicit polynomial shifts divisible by all linear factors."
    ),
    integer_holdout: pass(
      true,
      `Integer side was checked over endpoints ${report.endpoints.join(", ")} through N=${report.N}.`
    ),
    controls: pass(
      false,
      `Endpoint integer D=${integerEndpoint.real.D.toFixed(6)} is absorbed by sampled composite controls ${integerEndpoint.composite.D[0].toFixed(6)}..${integerEndpoint.composite.D[1].toFixed(6)}; Cramer separation is therefore only local-constraint detection.`,
      "hard-fail"
    ),
    compression: pass(
      true,
      "The statistic is one low-parameter graph invariant over a fixed shift set."
    ),
    scale_stability: pass(
      false,
      `Integer D is stable, but F_2[t] endpoint D=${f2Endpoint.real.D.toFixed(6)} and F_3[t] endpoint D=${f3Endpoint.real.D.toFixed(6)} do not match the integer endpoint D=${integerEndpoint.real.D.toFixed(6)}.`,
      "hard-fail"
    ),
    novelty_audit: pass(
      false,
      "The result reduces to local tuple admissibility / Hardy-Littlewood pair calibration rather than a new two-universe invariant.",
      "hard-fail"
    ),
    reproducibility: pass(
      allRequiredFilesPresent,
      missing.length ? `Missing artifacts: ${missing.join(", ")}` : "JSON/MD/SVG/PNG/script artifacts are present."
    ),
    proof_path: pass(
      false,
      "A proof path would first need subtraction of local pair/triple expectations; raw graph D has no theorem-shaped residual statement.",
      "hard-fail"
    ),
    expert_pack: pass(
      false,
      "No expert-ready pack exists because the candidate is rejected at controls and matched-field gates.",
      "hard-fail"
    ),
  };

  const hardFailures = Object.entries(gateResults).filter(([, result]) => result.status !== "pass");
  const promoted = hardFailures.length === 0;
  const status = promoted ? "PROMOTE" : "REJECT_UNDER_STRICT_TWO_UNIVERSES_PROTOCOL";
  const graphEvidence = {
    integerEndpoint: {
      N: integerEndpoint.N,
      labels: integerEndpoint.labels,
      D: integerEndpoint.real.D,
      meanDegree: integerEndpoint.real.meanDegree,
      cramerDRange: integerEndpoint.cramer.D,
      compositeDRange: integerEndpoint.composite.D,
      compositeAbsorbs: integerCompositeAbsorbs,
      cramerSeparates: integerCramerSeparates,
    },
    fieldEndpoints: [
      {
        q: 2,
        degree: f2Endpoint.degree,
        labels: f2Endpoint.labels,
        D: f2Endpoint.real.D,
        meanDegree: f2Endpoint.real.meanDegree,
        randomMonicDRange: f2Endpoint.randomMonic.D,
        randomReducibleDRange: f2Endpoint.randomReducible.D,
      },
      {
        q: 3,
        degree: f3Endpoint.degree,
        labels: f3Endpoint.labels,
        D: f3Endpoint.real.D,
        meanDegree: f3Endpoint.real.meanDegree,
        randomMonicDRange: f3Endpoint.randomMonic.D,
        randomReducibleDRange: f3Endpoint.randomReducible.D,
      },
    ],
  };

  const nextMutation = {
    title: "Subtract local pair/triple admissibility tensor before spectral scoring",
    reason: "Raw fixed-shift graph degree spectra mostly measure local tuple admissibility and composite-shell geometry.",
    preregisteredNextMove: [
      "For each shift h or polynomial shift a, estimate the local Hardy-Littlewood / exact finite-field expected edge rate.",
      "Build centered edge variables E_h(v)=1_{v+h prime}-expected_h(local state).",
      "Score covariance/spectral invariants of the centered multi-shift tensor, not raw degree variance.",
      "Use composite/eligible shell controls with the same local state, Cramer controls, and reducible/monic controls in F_q[t].",
      "Promote only if the centered residual survives train/holdout and aligns across Z and at least two F_q[t] universes.",
    ],
  };

  return {
    generatedAt: new Date().toISOString(),
    cycle,
    protocolVersion: "two-universes-breakthrough-candidate-v1",
    candidate: CYCLE_2_CANDIDATE,
    gates: GATES,
    gateResults,
    graphEvidence,
    decision: {
      status,
      promoted,
      reason: promoted
        ? "All gates passed."
        : "Order-free representation fixed the lexicographic issue, but raw graph degree variance is absorbed by local/composite controls and mismatches finite fields.",
      hardFailures: hardFailures.map(([id, result]) => ({ id, ...result })),
    },
    surpriseLedger: {
      observedSignal: `Integer D stays flat near ${integerEndpoint.real.D.toFixed(3)} through N=${integerEndpoint.N}, while Cramer controls are higher.`,
      expectedNull: "If this is prime-specific two-universe structure, composite controls should not absorb it and F_q[t] levels should align after matched shift design.",
      knownExplanation: "Local Hardy-Littlewood tuple admissibility and composite-shell geometry reproduce the integer endpoint.",
      survivedControls: integerCramerSeparates ? ["Separates from Cramer random labels"] : [],
      failedControls: [
        `Integer sampled-composite D range ${integerEndpoint.composite.D[0].toFixed(6)}..${integerEndpoint.composite.D[1].toFixed(6)} contains real D=${integerEndpoint.real.D.toFixed(6)}`,
        `F_2[t] D=${f2Endpoint.real.D.toFixed(6)} and F_3[t] D=${f3Endpoint.real.D.toFixed(6)} do not align with Z D=${integerEndpoint.real.D.toFixed(6)}`,
      ],
      whatFailed: "Raw graph degree variance is not centered enough; it measures local admissibility before any deeper residual.",
      suspectedInvariant: "If anything survives, it must live in a locally centered multi-shift covariance tensor.",
      nextMutation: nextMutation.title,
    },
    nextMutation,
  };
}

function auditCycle3() {
  const reportFile = "logs/two-universes-protocol/cycle-003-centered-shift-tensor-2000000.json";
  const report = readJson(reportFile);
  const missing = CYCLE_3_CANDIDATE.evidenceFiles.filter((file) => !exists(file));
  const allRequiredFilesPresent = missing.length === 0;
  const z = report.integer;
  const f2 = report.functionFields.find((field) => field.q === 2);
  const f3 = report.functionFields.find((field) => field.q === 3);
  const zSeparatesCramer = outsideRange(z.holdout.offdiagRms, z.controls.cramer.offdiagRms);
  const zSeparatesComposite = outsideRange(z.holdout.offdiagRms, z.controls.composite.offdiagRms);
  const f2Separates = outsideRange(f2.holdout.offdiagRms, f2.controls.randomMonic.offdiagRms)
    && outsideRange(f2.holdout.offdiagRms, f2.controls.randomReducible.offdiagRms);
  const f3Separates = outsideRange(f3.holdout.offdiagRms, f3.controls.randomMonic.offdiagRms)
    && outsideRange(f3.holdout.offdiagRms, f3.controls.randomReducible.offdiagRms);
  const fieldRatio = Math.max(f2.holdout.offdiagRms, f3.holdout.offdiagRms, z.holdout.offdiagRms)
    / Math.max(1e-12, Math.min(f2.holdout.offdiagRms, f3.holdout.offdiagRms, z.holdout.offdiagRms));
  const residualMeanTooLarge = z.holdout.meanAbsResidual > 0.05
    || f2.holdout.meanAbsResidual > 0.02
    || f3.holdout.meanAbsResidual > 0.04;

  const gateResults = {
    precise_statement: pass(
      true,
      "Candidate states Z_h(v)=(1_{v+h prime-like}-p_h(train))/sqrt(p_h(train)(1-p_h(train))) and scores holdout RMS off-diagonal covariance."
    ),
    finite_field_anchor: pass(
      true,
      "F_q[t] side is exact: vertices are monic irreducibles of fixed degree and edges are polynomial shifts preserving degree."
    ),
    integer_holdout: pass(
      true,
      `Integer side uses train range <=${z.split} and holdout (${z.split}, ${z.N}] with ${z.holdout.vertices} holdout vertices.`
    ),
    controls: pass(
      zSeparatesCramer && zSeparatesComposite && f2Separates && f3Separates,
      `Z offdiagRms=${z.holdout.offdiagRms.toFixed(6)} separates from Cramer ${z.controls.cramer.offdiagRms[0].toFixed(6)}..${z.controls.cramer.offdiagRms[1].toFixed(6)} and composite ${z.controls.composite.offdiagRms[0].toFixed(6)}..${z.controls.composite.offdiagRms[1].toFixed(6)}; F_2/F_3 also separate from random monic/reducible controls.`
    ),
    compression: pass(
      true,
      "One low-parameter score: off-diagonal RMS of a fixed-shift residual covariance tensor."
    ),
    scale_stability: pass(
      false,
      `Single N/degree holdout only; levels are not aligned enough across universes (Z=${z.holdout.offdiagRms.toFixed(6)}, F_2=${f2.holdout.offdiagRms.toFixed(6)}, F_3=${f3.holdout.offdiagRms.toFixed(6)}, ratio=${fieldRatio.toFixed(2)}).`,
      "hard-fail"
    ),
    novelty_audit: pass(
      false,
      "No catalog/known-disguise audit has been done for centered pair-tensor covariance; local residue and tuple-cumulant explanations remain open.",
      "hard-fail"
    ),
    reproducibility: pass(
      allRequiredFilesPresent,
      missing.length ? `Missing artifacts: ${missing.join(", ")}` : "JSON/MD/SVG/script artifacts are present and generated by the audit script."
    ),
    proof_path: pass(
      false,
      residualMeanTooLarge
        ? "Residual means are still too large after global pair-rate centering, so a theorem-shaped residual statement must first condition on local state."
        : "No lemma chain exists yet from centered tensor covariance to finite-field proposition and integer analogue.",
      "hard-fail"
    ),
    expert_pack: pass(
      false,
      "No expert-ready evidence pack exists; this is a lead requiring local-state centering, larger holdouts, and novelty audit.",
      "hard-fail"
    ),
  };

  const hardFailures = Object.entries(gateResults).filter(([, result]) => result.status !== "pass");
  const promoted = hardFailures.length === 0;
  const status = promoted ? "PROMOTE" : "LEAD_NOT_PROMOTED_UNDER_STRICT_TWO_UNIVERSES_PROTOCOL";
  const centeredEvidence = {
    integer: {
      N: z.N,
      split: z.split,
      labels: z.labels,
      offdiagRms: z.holdout.offdiagRms,
      maxAbsOffdiag: z.holdout.maxAbsOffdiag,
      meanAbsResidual: z.holdout.meanAbsResidual,
      cramerRange: z.controls.cramer.offdiagRms,
      compositeRange: z.controls.composite.offdiagRms,
      separatesCramer: zSeparatesCramer,
      separatesComposite: zSeparatesComposite,
    },
    fields: report.functionFields.map((field) => ({
      q: field.q,
      trainDegree: field.trainDegree,
      holdoutDegree: field.holdoutDegree,
      offdiagRms: field.holdout.offdiagRms,
      maxAbsOffdiag: field.holdout.maxAbsOffdiag,
      meanAbsResidual: field.holdout.meanAbsResidual,
      randomMonicRange: field.controls.randomMonic.offdiagRms,
      randomReducibleRange: field.controls.randomReducible.offdiagRms,
    })),
  };
  const nextMutation = {
    title: "Condition pair baselines on local residue state and then score centered tensor cumulants",
    reason: "Global per-shift train rates leave large holdout residual means and uneven field levels; the next representation must subtract local-state pair/triple structure, not just one global rate per shift.",
    preregisteredNextMove: [
      "Partition integer vertices by residues modulo W=30030 or by an eligible local-state signature.",
      "Partition F_q[t] vertices by residues modulo low-degree irreducibles.",
      "Estimate p_h(local state) on train blocks and score holdout residual covariance after local-state centering.",
      "Then score third-order cumulants or whitened covariance eigenvalues, with the same controls as cycle 003.",
      "Require stability at N=2M,4M,8M and degree holdouts for q=2,3,5 before any expert pack.",
    ],
  };

  return {
    generatedAt: new Date().toISOString(),
    cycle,
    protocolVersion: "two-universes-breakthrough-candidate-v1",
    candidate: CYCLE_3_CANDIDATE,
    gates: GATES,
    gateResults,
    centeredEvidence,
    decision: {
      status,
      promoted,
      reason: promoted
        ? "All gates passed."
        : "This is a real lead after pair-centering, but not a breakthrough candidate: it lacks scale stability, novelty audit, local-state proof path, and expert pack.",
      hardFailures: hardFailures.map(([id, result]) => ({ id, ...result })),
    },
    surpriseLedger: {
      observedSignal: `Pair-centered holdout offdiagRms is Z=${z.holdout.offdiagRms.toFixed(6)}, F_2=${f2.holdout.offdiagRms.toFixed(6)}, F_3=${f3.holdout.offdiagRms.toFixed(6)}.`,
      expectedNull: "After per-shift centering, random controls should have small off-diagonal covariance; a robust candidate should also align across universes and have small residual means.",
      knownExplanation: "Global edge-rate centering does not condition on local residue state, so local tuple structure can remain in residual covariance.",
      survivedControls: [
        `Z separates from Cramer and composite offdiagRms ranges`,
        `F_2 and F_3 real tensors separate from random monic/reducible ranges`,
      ],
      failedControls: residualMeanTooLarge
        ? [`Residual means remain large: Z=${z.holdout.meanAbsResidual.toFixed(6)}, F_2=${f2.holdout.meanAbsResidual.toFixed(6)}, F_3=${f3.holdout.meanAbsResidual.toFixed(6)}`]
        : [],
      whatFailed: "No multi-scale stability, no local-state centering, no novelty audit, no proof path.",
      suspectedInvariant: "A locally centered multi-shift covariance/cumulant may survive as an S2-style divergence or shared residual law.",
      nextMutation: nextMutation.title,
    },
    nextMutation,
  };
}

function auditCycle4() {
  const reportFile = "logs/two-universes-protocol/cycle-004-local-state-centered-tensor-2000000.json";
  const report = readJson(reportFile);
  const missing = CYCLE_4_CANDIDATE.evidenceFiles.filter((file) => !exists(file));
  const allRequiredFilesPresent = missing.length === 0;
  const z = report.integer;
  const fields = report.functionFields;
  const zSeparatesCramer = outsideRange(z.holdout.offdiagRms, z.controls.cramer.offdiagRms);
  const zSeparatesComposite = outsideRange(z.holdout.offdiagRms, z.controls.composite.offdiagRms);
  const fieldSeparations = fields.map((field) => ({
    q: field.q,
    separatesMonic: outsideRange(field.holdout.offdiagRms, field.controls.randomMonic.offdiagRms),
    separatesReducible: outsideRange(field.holdout.offdiagRms, field.controls.randomReducible.offdiagRms),
  }));
  const allFieldsSeparate = fieldSeparations.every((field) => field.separatesMonic && field.separatesReducible);
  const fallbackValues = [z.holdout.fallbackFraction, ...fields.map((field) => field.holdout.fallbackFraction)];
  const residualValues = [z.holdout.meanAbsResidual, ...fields.map((field) => field.holdout.meanAbsResidual)];
  const offdiagValues = [z.holdout.offdiagRms, ...fields.map((field) => field.holdout.offdiagRms)];
  const maxFallback = Math.max(...fallbackValues);
  const maxMeanAbsResidual = Math.max(...residualValues);
  const fieldRatio = Math.max(...offdiagValues) / Math.max(1e-12, Math.min(...offdiagValues));
  const fallbackThreshold = 0.05;
  const residualThreshold = 0.05;
  const localEstimatorClean = maxFallback <= fallbackThreshold && maxMeanAbsResidual <= residualThreshold;

  const gateResults = {
    precise_statement: pass(
      true,
      "Candidate states a locally conditioned residual Z_h(v)=(1_{v+h prime-like}-p_h(train, local_state(v,h)))/sqrt(p_h(1-p_h)) and scores holdout off-diagonal covariance RMS."
    ),
    finite_field_anchor: pass(
      true,
      "F_q[t] side is exact: local state is divisibility of f+a by irreducible moduli of degree <=2, with degree-preserving polynomial shifts."
    ),
    integer_holdout: pass(
      true,
      `Integer side uses train range <=${z.split} and holdout (${z.split}, ${z.N}] with ${z.holdout.vertices} holdout vertices.`
    ),
    controls: pass(
      zSeparatesCramer && zSeparatesComposite && allFieldsSeparate && localEstimatorClean,
      `Real tensors separate from listed random controls, but local-state support is not clean enough for promotion: max fallback=${maxFallback.toFixed(6)} (threshold ${fallbackThreshold}) and max mean residual=${maxMeanAbsResidual.toFixed(6)} (threshold ${residualThreshold}).`,
      localEstimatorClean ? "pass" : "hard-fail"
    ),
    compression: pass(
      true,
      "One low-parameter statistic is used: off-diagonal RMS of a fixed-shift local-state residual covariance tensor."
    ),
    scale_stability: pass(
      false,
      `Single N/degree ladder only; current levels are Z=${z.holdout.offdiagRms.toFixed(6)}, ${fields.map((field) => `F_${field.q}=${field.holdout.offdiagRms.toFixed(6)}`).join(", ")}, ratio=${fieldRatio.toFixed(2)}.`,
      "hard-fail"
    ),
    novelty_audit: pass(
      false,
      "No catalog audit has ruled out Hardy-Littlewood local tuple effects, Bateman-Horn-style local factors, finite-field short-interval biases, or estimator fallback artifacts.",
      "hard-fail"
    ),
    reproducibility: pass(
      allRequiredFilesPresent,
      missing.length ? `Missing artifacts: ${missing.join(", ")}` : "JSON/MD/SVG/script artifacts are present and generated by the local-state audit script."
    ),
    proof_path: pass(
      false,
      `Fallback and residual means are too large for a theorem-shaped residual statement: max fallback=${maxFallback.toFixed(6)}, max mean residual=${maxMeanAbsResidual.toFixed(6)}.`,
      "hard-fail"
    ),
    expert_pack: pass(
      false,
      "No expert-ready evidence pack exists because local support, scale stability, novelty audit, and proof path gates fail.",
      "hard-fail"
    ),
  };

  const hardFailures = Object.entries(gateResults).filter(([, result]) => result.status !== "pass");
  const promoted = hardFailures.length === 0;
  const status = promoted ? "PROMOTE" : "LEAD_NOT_PROMOTED_UNDER_STRICT_TWO_UNIVERSES_PROTOCOL";
  const localStateEvidence = {
    estimator: {
      minStateCount: report.minStateCount,
      minEdgeSupport: report.minEdgeSupport,
      localRatePriorWeight: report.localRatePriorWeight,
      fallbackThreshold,
      residualThreshold,
      maxFallback,
      maxMeanAbsResidual,
    },
    integer: {
      N: z.N,
      split: z.split,
      labels: z.labels,
      offdiagRms: z.holdout.offdiagRms,
      maxAbsOffdiag: z.holdout.maxAbsOffdiag,
      meanAbsResidual: z.holdout.meanAbsResidual,
      fallbackFraction: z.holdout.fallbackFraction,
      cramerRange: z.controls.cramer.offdiagRms,
      compositeRange: z.controls.composite.offdiagRms,
      separatesCramer: zSeparatesCramer,
      separatesComposite: zSeparatesComposite,
    },
    fields: fields.map((field) => ({
      q: field.q,
      trainDegree: field.trainDegree,
      holdoutDegree: field.holdoutDegree,
      offdiagRms: field.holdout.offdiagRms,
      maxAbsOffdiag: field.holdout.maxAbsOffdiag,
      meanAbsResidual: field.holdout.meanAbsResidual,
      fallbackFraction: field.holdout.fallbackFraction,
      randomMonicRange: field.controls.randomMonic.offdiagRms,
      randomReducibleRange: field.controls.randomReducible.offdiagRms,
    })),
  };
  const nextMutation = {
    title: "Replace fallback-heavy local states with exact admissibility-conditioned residuals and a scale ladder",
    reason: "Cycle 004 separates from random controls, but too much of the score still uses fallback/global baselines and residual means remain large.",
    preregisteredNextMove: [
      "Define exact local admissibility tensors for every shift pair/triple, not just per-shift local rates.",
      "For Z, condition on the complete residue pattern of v+h over a controlled primorial and require low fallback before scoring.",
      "For F_q[t], condition on divisibility patterns by all low-degree irreducibles that can force reducibility of f+a.",
      "Score locally whitened covariance eigenvalues and third-order cumulants after the pair/triple admissibility tensor is subtracted.",
      "Run a scale ladder at N=2M,4M,8M and q=2,3,5 degree holdouts before any novelty memo or expert pack.",
    ],
  };

  return {
    generatedAt: new Date().toISOString(),
    cycle,
    protocolVersion: "two-universes-breakthrough-candidate-v1",
    candidate: CYCLE_4_CANDIDATE,
    gates: GATES,
    gateResults,
    localStateEvidence,
    decision: {
      status,
      promoted,
      reason: promoted
        ? "All gates passed."
        : "Local-state centering produces a genuine lead, but not a breakthrough candidate: fallback/residual support, scale stability, novelty audit, proof path, and expert pack gates fail.",
      hardFailures: hardFailures.map(([id, result]) => ({ id, ...result })),
    },
    surpriseLedger: {
      observedSignal: `Local-state holdout offdiagRms is Z=${z.holdout.offdiagRms.toFixed(6)}, ${fields.map((field) => `F_${field.q}=${field.holdout.offdiagRms.toFixed(6)}`).join(", ")}.`,
      expectedNull: "After local-state centering, random controls should be near null, fallback should be low, residual means should be small, and the signal should survive scale changes.",
      knownExplanation: "Residual local admissibility and fallback-to-global baselines can still manufacture covariance even when random controls are separated.",
      survivedControls: [
        zSeparatesCramer ? "Z separates from Cramer controls" : "Z does not separate from Cramer controls",
        zSeparatesComposite ? "Z separates from composite controls" : "Z does not separate from composite controls",
        ...fieldSeparations.map((field) => `F_${field.q} separates from monic=${field.separatesMonic} reducible=${field.separatesReducible}`),
      ],
      failedControls: [
        `Max fallback fraction ${maxFallback.toFixed(6)} exceeds ${fallbackThreshold}`,
        `Max mean residual ${maxMeanAbsResidual.toFixed(6)} exceeds ${residualThreshold}`,
      ],
      whatFailed: "The estimator is still too dependent on fallback/global baselines and has only one scale.",
      suspectedInvariant: "A real two-universe lead, if present, must survive exact pair/triple admissibility subtraction and multi-scale whitening.",
      nextMutation: nextMutation.title,
    },
    nextMutation,
  };
}

function aboveRange(value, range) {
  return value > range[1];
}

function auditCycle5() {
  const reportFile = "logs/two-universes-protocol/cycle-005-exact-admissibility-tensor-2000000.json";
  const report = readJson(reportFile);
  const missing = CYCLE_5_CANDIDATE.evidenceFiles.filter((file) => !exists(file));
  const allRequiredFilesPresent = missing.length === 0;
  const endpoint = report.integerScales.at(-1);
  const integerScaleStart = report.integerScales[0];
  const fields = report.functionFields;

  const integerOrder2AboveControls = aboveRange(endpoint.real.orders.order2.residualMeanRms, endpoint.controls.randomEligible.order2.residualMeanRms)
    && aboveRange(endpoint.real.orders.order2.residualMeanRms, endpoint.controls.composite.order2.residualMeanRms);
  const integerOrder3AboveControls = aboveRange(endpoint.real.orders.order3.residualMeanRms, endpoint.controls.randomEligible.order3.residualMeanRms)
    && aboveRange(endpoint.real.orders.order3.residualMeanRms, endpoint.controls.composite.order3.residualMeanRms);
  const fieldComparisons = fields.map((field) => {
    const order2 = field.real.orders.order2.residualMeanRms;
    const order3 = field.real.orders.order3.residualMeanRms;
    return {
      q: field.q,
      order2,
      order3,
      order2AboveMonic: aboveRange(order2, field.controls.randomMonicEligible.order2.residualMeanRms),
      order2AboveReducible: aboveRange(order2, field.controls.randomReducibleEligible.order2.residualMeanRms),
      order3AboveMonic: aboveRange(order3, field.controls.randomMonicEligible.order3.residualMeanRms),
      order3AboveReducible: aboveRange(order3, field.controls.randomReducibleEligible.order3.residualMeanRms),
      order3LowEdgeFraction: field.real.orders.order3.lowTrainEdgeFraction,
    };
  });
  const allFieldsOrder2Above = fieldComparisons.every((field) => field.order2AboveMonic && field.order2AboveReducible);
  const allFieldsOrder3Above = fieldComparisons.every((field) => field.order3AboveMonic && field.order3AboveReducible);
  const maxLowEdgeFraction = Math.max(
    endpoint.real.orders.order3.lowTrainEdgeFraction,
    ...fields.map((field) => field.real.orders.order3.lowTrainEdgeFraction)
  );
  const allOrder2Values = [
    endpoint.real.orders.order2.residualMeanRms,
    ...fields.map((field) => field.real.orders.order2.residualMeanRms),
  ];
  const fieldRatio = Math.max(...allOrder2Values) / Math.max(1e-12, Math.min(...allOrder2Values));
  const integerDecay = endpoint.real.orders.order2.residualMeanRms / Math.max(1e-12, integerScaleStart.real.orders.order2.residualMeanRms);

  const gateResults = {
    precise_statement: pass(
      true,
      "Candidate states Z_S(v)=0 for locally obstructed subsets and otherwise centers 1_{all h in S are prime-like} by train allowed-rate p_S, scoring RMS holdout residual means for |S|=1,2,3."
    ),
    finite_field_anchor: pass(
      true,
      "F_q[t] side is exact: local obstruction is divisibility of f+a by all irreducible moduli of degree <=2, with separate train/holdout degrees and q=2,3,5 checks."
    ),
    integer_holdout: pass(
      true,
      `Integer side uses train/holdout splits at N=${report.integerScales.map((scale) => scale.N).join(", ")} with endpoint holdout ${endpoint.holdoutVertices} vertices.`
    ),
    controls: pass(
      integerOrder2AboveControls && integerOrder3AboveControls && allFieldsOrder2Above && allFieldsOrder3Above && maxLowEdgeFraction === 0,
      `Z endpoint order2/order3 exceed local random and composite controls, but F_q[t] does not show a matched excess: ${fieldComparisons.map((field) => `F_${field.q} order2 above monic=${field.order2AboveMonic} reducible=${field.order2AboveReducible}, order3 above monic=${field.order3AboveMonic} reducible=${field.order3AboveReducible}`).join("; ")}; max low-edge fraction=${maxLowEdgeFraction.toFixed(6)}.`,
      "hard-fail"
    ),
    compression: pass(
      true,
      "The statistic has fixed order-1/2/3 subset tensors, deterministic obstruction subtraction, and a single Beta(1/2,1/2) allowed-rate prior."
    ),
    scale_stability: pass(
      false,
      `Only a two-point integer scale check is present and field levels mismatch: endpoint Z order2=${endpoint.real.orders.order2.residualMeanRms.toFixed(6)}, ${fields.map((field) => `F_${field.q}=${field.real.orders.order2.residualMeanRms.toFixed(6)}`).join(", ")}, ratio=${fieldRatio.toFixed(2)}, integer 2M/1M ratio=${integerDecay.toFixed(3)}.`,
      "hard-fail"
    ),
    novelty_audit: pass(
      false,
      "No novelty audit has ruled out Hardy-Littlewood tuple constants, Bateman-Horn finite-field local factors, or finite-sample decay of admissible-tuple residuals.",
      "hard-fail"
    ),
    reproducibility: pass(
      allRequiredFilesPresent,
      missing.length ? `Missing artifacts: ${missing.join(", ")}` : "JSON/MD/SVG/script artifacts are present and generated by the exact-admissibility audit script."
    ),
    proof_path: pass(
      false,
      "The finite-field side is absorbed by eligible random/reducible controls or moves in the opposite direction, so there is no theorem-shaped two-universe residual law yet.",
      "hard-fail"
    ),
    expert_pack: pass(
      false,
      "No expert-ready evidence pack exists because controls, scale stability, novelty, and proof-path gates fail.",
      "hard-fail"
    ),
  };

  const hardFailures = Object.entries(gateResults).filter(([, result]) => result.status !== "pass");
  const promoted = hardFailures.length === 0;
  const status = promoted ? "PROMOTE" : "REJECT_UNDER_STRICT_TWO_UNIVERSES_PROTOCOL";
  const exactAdmissibilityEvidence = {
    estimator: {
      betaPriorAlpha: report.betaPriorAlpha,
      betaPriorBeta: report.betaPriorBeta,
      minTrainEdges: report.minTrainEdges,
      maxLowEdgeFraction,
      fieldRatio,
      integerDecay,
    },
    integerScales: report.integerScales.map((scale) => ({
      N: scale.N,
      labels: scale.labels,
      trainVertices: scale.trainVertices,
      holdoutVertices: scale.holdoutVertices,
      order1Rms: scale.real.orders.order1.residualMeanRms,
      order2Rms: scale.real.orders.order2.residualMeanRms,
      order3Rms: scale.real.orders.order3.residualMeanRms,
      randomEligibleOrder2Range: scale.controls.randomEligible.order2.residualMeanRms,
      compositeOrder2Range: scale.controls.composite.order2.residualMeanRms,
      randomEligibleOrder3Range: scale.controls.randomEligible.order3.residualMeanRms,
      compositeOrder3Range: scale.controls.composite.order3.residualMeanRms,
    })),
    fields: fields.map((field) => ({
      q: field.q,
      trainDegree: field.trainDegree,
      holdoutDegree: field.holdoutDegree,
      trainVertices: field.trainVertices,
      holdoutVertices: field.holdoutVertices,
      order1Rms: field.real.orders.order1.residualMeanRms,
      order2Rms: field.real.orders.order2.residualMeanRms,
      order3Rms: field.real.orders.order3.residualMeanRms,
      randomMonicOrder2Range: field.controls.randomMonicEligible.order2.residualMeanRms,
      randomReducibleOrder2Range: field.controls.randomReducibleEligible.order2.residualMeanRms,
      randomMonicOrder3Range: field.controls.randomMonicEligible.order3.residualMeanRms,
      randomReducibleOrder3Range: field.controls.randomReducibleEligible.order3.residualMeanRms,
      order3LowEdgeFraction: field.real.orders.order3.lowTrainEdgeFraction,
    })),
  };
  const nextMutation = {
    title: "Replace raw tensor magnitude matching with signed residual-profile and scale-decay matching",
    reason: "Exact admissibility subtraction removes the cycle-004 fallback problem, but the remaining integer excess is not shared by F_q[t] controls at q=2,3,5.",
    preregisteredNextMove: [
      "Keep deterministic admissibility subtraction, but stop comparing only raw RMS magnitudes.",
      "Extract the signed residual vector over shift pairs/triples and compare profile correlations across scale and field, not just size.",
      "Estimate log-slope decay across N=1M,2M,4M,8M and degree ladders for q=2,3,5.",
      "Require the same signed profile or same decay exponent to beat eligible random/composite/reducible controls before any novelty memo.",
      "If profile/decay matching fails, reject this tensor family and mutate away from additive-shift tensors.",
    ],
  };

  return {
    generatedAt: new Date().toISOString(),
    cycle,
    protocolVersion: "two-universes-breakthrough-candidate-v1",
    candidate: CYCLE_5_CANDIDATE,
    gates: GATES,
    gateResults,
    exactAdmissibilityEvidence,
    decision: {
      status,
      promoted,
      reason: promoted
        ? "All gates passed."
        : "Exact admissibility subtraction fixed the fallback artifact, but the surviving integer residual is not a matched two-universe law: finite-field tensors are absorbed by or below local eligible controls.",
      hardFailures: hardFailures.map(([id, result]) => ({ id, ...result })),
    },
    surpriseLedger: {
      observedSignal: `Endpoint Z order2=${endpoint.real.orders.order2.residualMeanRms.toFixed(6)} and order3=${endpoint.real.orders.order3.residualMeanRms.toFixed(6)} exceed integer controls; finite fields are ${fields.map((field) => `F_${field.q} order2=${field.real.orders.order2.residualMeanRms.toFixed(6)}`).join(", ")}.`,
      expectedNull: "After exact admissibility subtraction, a two-universe candidate should have matched residual direction or matched scale law across Z and F_q[t], not only an integer excess.",
      knownExplanation: "The integer residual may be finite-range Hardy-Littlewood tuple error or sampling geometry; finite-field eligible controls absorb the analogous tensor magnitude.",
      survivedControls: [
        integerOrder2AboveControls ? "Z order2 exceeds random eligible and composite controls" : "Z order2 does not exceed all integer controls",
        integerOrder3AboveControls ? "Z order3 exceeds random eligible and composite controls" : "Z order3 does not exceed all integer controls",
      ],
      failedControls: fieldComparisons.map((field) => `F_${field.q}: order2 above monic=${field.order2AboveMonic}, reducible=${field.order2AboveReducible}; order3 above monic=${field.order3AboveMonic}, reducible=${field.order3AboveReducible}`),
      whatFailed: "The exact-admissibility tensor family has no matched raw-magnitude law across the two universes.",
      suspectedInvariant: "If there is still a lead here, it must be in signed residual profile or asymptotic decay, not raw residual RMS.",
      nextMutation: nextMutation.title,
    },
    nextMutation,
  };
}

function minFinite(values) {
  const finite = values.filter(Number.isFinite);
  return finite.length ? Math.min(...finite) : NaN;
}

function maxFinite(values) {
  const finite = values.filter(Number.isFinite);
  return finite.length ? Math.max(...finite) : NaN;
}

function auditCycle6() {
  const reportFile = "logs/two-universes-protocol/cycle-006-signed-profile-decay-4000000.json";
  const report = readJson(reportFile);
  const missing = CYCLE_6_CANDIDATE.evidenceFiles.filter((file) => !exists(file));
  const allRequiredFilesPresent = missing.length === 0;
  const summary = report.summary;
  const minProfilePearson = summary.thresholds.minProfilePearson;
  const maxSlopeGapThreshold = summary.thresholds.maxSlopeGap;
  const crossOrder2 = summary.crossUniverseProfile.order2;
  const crossOrder3 = summary.crossUniverseProfile.order3;
  const allCrossCorrelations = [...crossOrder2, ...crossOrder3].map((row) => row.pearson);
  const minCrossCorrelation = minFinite(allCrossCorrelations);
  const stabilityCorrelations = [
    ...summary.integerProfileStability.order2,
    ...summary.integerProfileStability.order3,
    ...summary.fieldProfileStability.flatMap((group) => [...group.order2, ...group.order3]),
  ].map((row) => row.pearson);
  const minStabilityCorrelation = minFinite(stabilityCorrelations);
  const integerSlopes = summary.decaySlopes.integer;
  const slopeGaps = summary.decaySlopes.fields.flatMap((field) => [
    Math.abs(field.order2Slope - integerSlopes.order2),
    Math.abs(field.order3Slope - integerSlopes.order3),
  ]);
  const maxSlopeGap = maxFinite(slopeGaps);
  const profileMatch = minCrossCorrelation >= minProfilePearson;
  const stabilityMatch = minStabilityCorrelation >= minProfilePearson;
  const slopeMatch = maxSlopeGap <= maxSlopeGapThreshold;
  const completeScaleLadder = summary.hasRequiredIntegerScaleLadder;

  const gateResults = {
    precise_statement: pass(
      true,
      "Candidate states R_S=mean_holdout Z_S(v), bins signed residuals by train allowed-rate for |S|=2,3, and compares profile correlations plus log-slope decay across scale and field."
    ),
    finite_field_anchor: pass(
      true,
      "F_q[t] side is exact and includes degree ladders for q=2,3,5 using irreducibles, deterministic low-degree obstruction subtraction, and eligible monic/reducible controls."
    ),
    integer_holdout: pass(
      true,
      `Integer side uses train/holdout splits at N=${report.integerRuns.map((run) => run.N).join(", ")} with endpoint holdout ${report.integerRuns.at(-1).holdoutVertices} vertices.`
    ),
    controls: pass(
      profileMatch && stabilityMatch,
      `Signed profile match fails: min cross-universe Pearson=${minCrossCorrelation.toFixed(6)} and min within-ladder stability Pearson=${minStabilityCorrelation.toFixed(6)} against threshold ${minProfilePearson}.`,
      "hard-fail"
    ),
    compression: pass(
      true,
      `The profile statistic is fixed: exact admissibility residuals, |S|=2,3, ${report.profileBins} train-rate bins, Pearson profile match, and log-slope decay.`
    ),
    scale_stability: pass(
      completeScaleLadder && slopeMatch,
      `Scale gate fails: required integer ladder 1M,2M,4M,8M present=${completeScaleLadder}; max slope gap=${maxSlopeGap.toFixed(6)} with threshold ${maxSlopeGapThreshold}.`,
      "hard-fail"
    ),
    novelty_audit: pass(
      false,
      "No novelty audit has ruled out known finite-size Hardy-Littlewood tuple-error profiles, quotient-ring spectral artifacts, or binning-induced correlations.",
      "hard-fail"
    ),
    reproducibility: pass(
      allRequiredFilesPresent,
      missing.length ? `Missing artifacts: ${missing.join(", ")}` : "JSON/MD/SVG/script artifacts are present and generated by the signed-profile audit script."
    ),
    proof_path: pass(
      false,
      "The central matched-profile condition fails, so there is no theorem-shaped transport statement for this additive-shift tensor family.",
      "hard-fail"
    ),
    expert_pack: pass(
      false,
      "No expert-ready evidence pack exists because controls/profile match, scale ladder, novelty, and proof-path gates fail.",
      "hard-fail"
    ),
  };

  const hardFailures = Object.entries(gateResults).filter(([, result]) => result.status !== "pass");
  const promoted = hardFailures.length === 0;
  const status = promoted ? "PROMOTE" : "REJECT_UNDER_STRICT_TWO_UNIVERSES_PROTOCOL";
  const signedProfileEvidence = {
    diagnostics: {
      minProfilePearson,
      maxSlopeGapThreshold,
      minCrossCorrelation,
      minStabilityCorrelation,
      maxSlopeGap,
      completeScaleLadder,
      profileMatch,
      stabilityMatch,
      slopeMatch,
    },
    integerRuns: report.integerRuns.map((run) => ({
      label: run.label,
      N: run.N,
      order2Rms: run.order2.residualMeanRms,
      order3Rms: run.order3.residualMeanRms,
      order2PositiveFraction: run.order2.positiveFraction,
      order3PositiveFraction: run.order3.positiveFraction,
    })),
    fieldGroups: report.fieldGroups.map((group) => ({
      q: group.q,
      runs: group.runs.map((run) => ({
        label: run.label,
        holdoutDegree: run.holdoutDegree,
        order2Rms: run.order2.residualMeanRms,
        order3Rms: run.order3.residualMeanRms,
        order2PositiveFraction: run.order2.positiveFraction,
        order3PositiveFraction: run.order3.positiveFraction,
      })),
    })),
    crossUniverseProfile: summary.crossUniverseProfile,
    integerProfileStability: summary.integerProfileStability,
    fieldProfileStability: summary.fieldProfileStability,
    decaySlopes: summary.decaySlopes,
  };
  const nextMutation = {
    title: "Reject additive-shift tensor family and move to quotient spectral residuals",
    reason: "Magnitude, exact-admissibility residuals, and signed profiles all fail to produce a stable matched law across Z and F_q[t].",
    preregisteredNextMove: [
      "Build residual prime-indicator fields after local admissibility subtraction.",
      "For Z, project residuals onto Fourier/Dirichlet modes over controlled residue quotients and short windows.",
      "For F_q[t], project residuals onto additive and multiplicative characters of matched low-degree quotient rings.",
      "Compare spectral energy profiles and decay exponents against eligible random/composite/reducible controls.",
      "Promote only if the same low-parameter spectral law or divergence survives q=2,3,5 and integer scale ladders.",
    ],
  };

  return {
    generatedAt: new Date().toISOString(),
    cycle,
    protocolVersion: "two-universes-breakthrough-candidate-v1",
    candidate: CYCLE_6_CANDIDATE,
    gates: GATES,
    gateResults,
    signedProfileEvidence,
    decision: {
      status,
      promoted,
      reason: promoted
        ? "All gates passed."
        : "Signed residual profiles do not match across the two universes, and the full integer scale ladder is still incomplete; the additive-shift tensor family is rejected under the strict protocol.",
      hardFailures: hardFailures.map(([id, result]) => ({ id, ...result })),
    },
    surpriseLedger: {
      observedSignal: `Cross-universe order2 endpoint Pearson values are ${crossOrder2.map((row) => `${row.field}=${row.pearson.toFixed(6)}`).join(", ")}; threshold is ${minProfilePearson}.`,
      expectedNull: "If the additive-shift tensor family carries a transportable two-universe law, signed profile correlations and decay slopes should be stable across scales and fields.",
      knownExplanation: "The residual profile is sensitive to finite-range tuple geometry and quotient choice; no matched profile survives the controls.",
      survivedControls: slopeMatch ? [`Decay slope gap ${maxSlopeGap.toFixed(6)} is within ${maxSlopeGapThreshold}`] : [],
      failedControls: [
        `Min cross-universe profile Pearson ${minCrossCorrelation.toFixed(6)} is below ${minProfilePearson}`,
        `Min within-ladder profile Pearson ${minStabilityCorrelation.toFixed(6)} is below ${minProfilePearson}`,
        `Complete 1M/2M/4M/8M integer ladder present=${completeScaleLadder}`,
      ],
      whatFailed: "Neither raw tensor magnitude nor signed profile shape gives a stable matched law.",
      suspectedInvariant: "If a two-universe prime-indicator law remains, it is likely spectral/quotient-domain rather than local additive-shift tensor structure.",
      nextMutation: nextMutation.title,
    },
    nextMutation,
  };
}

function rangeMax(rangeValue) {
  return Array.isArray(rangeValue) && rangeValue.length >= 2 ? rangeValue[1] : NaN;
}

function auditCycle7() {
  const reportFile = "logs/two-universes-protocol/cycle-007-quotient-spectral-residual-4000000.json";
  const report = readJson(reportFile);
  const missing = CYCLE_7_CANDIDATE.evidenceFiles.filter((file) => !exists(file));
  const allRequiredFilesPresent = missing.length === 0;
  const finalIntegerBudget = report.integer.byBudget.at(-1);
  const finalInteger = finalIntegerBudget.rows.at(-1);
  const integerPass = finalInteger.real.normalizedEdge > rangeMax(finalInteger.random.edge)
    && finalInteger.real.normalizedEdge > rangeMax(finalInteger.composite.edge)
    && finalInteger.real.normalizedEdge > rangeMax(finalInteger.cramer.edge);
  const fieldRows = report.fields.map((field) => {
    const final = field.byBudget.at(-1);
    const passControls = final.real.normalizedEdge > rangeMax(final.random.edge)
      && final.real.normalizedEdge > rangeMax(final.composite.edge);
    return {
      q: field.q,
      degrees: field.degrees,
      budget: final.budget,
      edge: final.real.normalizedEdge,
      randomRange: final.random.edge,
      compositeRange: final.composite.edge,
      dim: final.real.dim,
      rows: final.real.rows,
      passControls,
    };
  });
  const allFieldsPass = fieldRows.every((field) => field.passControls);
  const completeIntegerLadder = report.requiredIntegerEndpoints.every((endpoint) => report.integer.endpoints.includes(endpoint));
  const maxFieldControlMiss = Math.max(
    ...fieldRows.map((field) => field.edge - Math.max(rangeMax(field.randomRange), rangeMax(field.compositeRange)))
  );
  const minFieldControlMargin = Math.min(
    ...fieldRows.map((field) => field.edge - Math.max(rangeMax(field.randomRange), rangeMax(field.compositeRange)))
  );

  const gateResults = {
    precise_statement: pass(
      true,
      "Candidate states a quotient residual matrix X(block,residue)=(observed prime-like count - rough-shell expected count)/sqrt(expected), then scores lambda_max(cov X) normalized by a Marchenko-Pastur edge."
    ),
    finite_field_anchor: pass(
      true,
      "F_q[t] side is exact: quotient residues are polynomial residues modulo irreducible moduli, and rough shells remove divisibility by low-degree irreducibles for q=2,3,5."
    ),
    integer_holdout: pass(
      true,
      `Integer side uses fresh block holdouts over endpoints ${report.integer.endpoints.join(", ")} with final endpoint N=${finalInteger.N}.`
    ),
    controls: pass(
      integerPass && allFieldsPass,
      `Integer final budget clears rough-random, rough-composite, and Cramer controls (${integerPass}), but field controls fail: ${fieldRows.map((field) => `F_${field.q} pass=${field.passControls} edge=${field.edge.toFixed(6)} random=${field.randomRange.map((v) => v.toFixed(6)).join("..")} composite=${field.compositeRange.map((v) => v.toFixed(6)).join("..")}`).join("; ")}.`,
      "hard-fail"
    ),
    compression: pass(
      true,
      "Low-parameter statistic: fixed rough cutoff, fixed quotient modulus budget path, covariance spectral edge, and MP normalization."
    ),
    scale_stability: pass(
      completeIntegerLadder && finalIntegerBudget.edgeSlope < 0,
      `Scale gate fails: required 1M/2M/4M/8M integer ladder present=${completeIntegerLadder}; final budget excess-edge slope=${finalIntegerBudget.edgeSlope.toFixed(6)}.`,
      "hard-fail"
    ),
    novelty_audit: pass(
      false,
      "No novelty audit has ruled out classical prime races, Chebyshev bias, residue-current covariance, or rough-shell finite-size effects.",
      "hard-fail"
    ),
    reproducibility: pass(
      allRequiredFilesPresent,
      missing.length ? `Missing artifacts: ${missing.join(", ")}` : "JSON/MD/SVG/script artifacts are present and generated by the quotient spectral residual script."
    ),
    proof_path: pass(
      false,
      "The field-side quotient spectral edge is absorbed by controls for q=3 and q=5, so no two-universe spectral law or divergence statement is theorem-shaped yet.",
      "hard-fail"
    ),
    expert_pack: pass(
      false,
      "No expert-ready evidence pack exists because controls, scale stability, novelty, and proof-path gates fail.",
      "hard-fail"
    ),
  };

  const hardFailures = Object.entries(gateResults).filter(([, result]) => result.status !== "pass");
  const promoted = hardFailures.length === 0;
  const status = promoted ? "PROMOTE" : "REJECT_UNDER_STRICT_TWO_UNIVERSES_PROTOCOL";
  const quotientSpectralEvidence = {
    diagnostics: {
      integerPass,
      allFieldsPass,
      completeIntegerLadder,
      maxFieldControlMiss,
      minFieldControlMargin,
      finalBudget: finalIntegerBudget.budget,
      excessEdgeSlope: finalIntegerBudget.edgeSlope,
    },
    integer: {
      N: finalInteger.N,
      budget: finalIntegerBudget.budget,
      moduli: finalIntegerBudget.moduli,
      edge: finalInteger.real.normalizedEdge,
      randomRange: finalInteger.random.edge,
      compositeRange: finalInteger.composite.edge,
      cramerRange: finalInteger.cramer.edge,
      energy: finalInteger.real.energy,
      strongestColumns: finalInteger.real.strongestColumns,
    },
    fields: fieldRows,
  };
  const nextMutation = {
    title: "Leave prime-indicator local geometry and test Möbius/Liouville matched correlations",
    reason: "Additive shifts, signed local tensors, and quotient spectral prime-indicator residuals all fail to produce a stable matched law across q=2,3,5.",
    preregisteredNextMove: [
      "Switch the object from prime indicators to completely multiplicative signs.",
      "For Z, compute Liouville/Mobius short-lag correlations on train/holdout intervals with local residue controls.",
      "For F_q[t], compute polynomial Liouville/Mobius correlations using exact factorization tables and degree holdouts.",
      "Use random completely multiplicative sign controls, degree-preserving polynomial controls, and integer residue/composite controls.",
      "Promote only if a precise S1 shared law or S2 divergence survives q=2,3,5, integer scale ladders, novelty audit, and an expert-ready pack.",
    ],
  };

  return {
    generatedAt: new Date().toISOString(),
    cycle,
    protocolVersion: "two-universes-breakthrough-candidate-v1",
    candidate: CYCLE_7_CANDIDATE,
    gates: GATES,
    gateResults,
    quotientSpectralEvidence,
    decision: {
      status,
      promoted,
      reason: promoted
        ? "All gates passed."
        : "Quotient spectral residuals produce an integer lead, but the q=3 and q=5 finite-field spectra are absorbed by controls and the 8M scale ladder is incomplete.",
      hardFailures: hardFailures.map(([id, result]) => ({ id, ...result })),
    },
    surpriseLedger: {
      observedSignal: `Integer budget-${finalIntegerBudget.budget} edge=${finalInteger.real.normalizedEdge.toFixed(6)} clears controls; field margins against strongest controls are ${fieldRows.map((field) => `F_${field.q}=${(field.edge - Math.max(rangeMax(field.randomRange), rangeMax(field.compositeRange))).toFixed(6)}`).join(", ")}.`,
      expectedNull: "A transportable quotient spectral residual law should clear local controls in Z and every F_q[t] field or show a precise stable divergence pattern.",
      knownExplanation: "Integer residue currents can reflect classical prime races and rough-shell finite-size bias; finite fields do not reproduce the same edge after local quotient controls.",
      survivedControls: integerPass ? ["Z final quotient spectral edge clears rough-random, rough-composite, and Cramer controls"] : [],
      failedControls: fieldRows.filter((field) => !field.passControls).map((field) => `F_${field.q} edge=${field.edge.toFixed(6)} is within controls`),
      whatFailed: "Prime-indicator quotient geometry does not give a stable two-universe law.",
      suspectedInvariant: "The next plausible bridge is a multiplicative-sign object where F_q[t] has exact Mobius/Liouville structure.",
      nextMutation: nextMutation.title,
    },
    nextMutation,
  };
}

function auditCycle8() {
  const reportFile = "logs/two-universes-protocol/cycle-008-mobius-liouville-correlation-4000000.json";
  const report = readJson(reportFile);
  const missing = CYCLE_8_CANDIDATE.evidenceFiles.filter((file) => !exists(file));
  const allRequiredFilesPresent = missing.length === 0;
  const summary = report.summary;
  const integerObjects = summary.integerObjects;
  const fieldObjects = summary.fieldObjects;
  const objectByLabel = new Map([...integerObjects, ...fieldObjects].map((item) => [item.label, item]));
  const families = ["mobius", "liouville"].map((family) => {
    const integer = objectByLabel.get(`Z-${family}`);
    const fields = report.fields.map((field) => objectByLabel.get(`F_${field.q}-${family}`));
    const controlsPass = Boolean(integer?.beatsControls) && fields.every((item) => item?.beatsControls);
    const values = [integer, ...fields].filter(Boolean);
    const maxSlope = maxFinite(values.map((item) => Math.abs(item.energySlope)));
    const minStability = minFinite(values.map((item) => item.stability));
    return {
      family,
      controlsPass,
      integerBeatsControls: Boolean(integer?.beatsControls),
      fieldPasses: fields.map((item, i) => ({
        q: report.fields[i].q,
        beatsControls: Boolean(item?.beatsControls),
      })),
      maxAbsEnergySlope: maxSlope,
      minStability,
    };
  });
  const sharedFamilyControls = families.some((family) => family.controlsPass);
  const completeIntegerLadder = summary.hasRequiredIntegerScaleLadder;
  const slopeThreshold = 0.25;
  const stabilityThreshold = 0.5;
  const scaleStableFamilies = families.filter((family) =>
    family.controlsPass
    && family.maxAbsEnergySlope <= slopeThreshold
    && family.minStability >= stabilityThreshold
  );
  const scaleStable = completeIntegerLadder && scaleStableFamilies.length > 0;

  const gateResults = {
    precise_statement: pass(
      true,
      "Candidate states C_f(X,h)=sum_a f(a)f(a+h)/sqrt(X), h=1..8, and scores fixed-lag correlation energy for Mobius and Liouville signs."
    ),
    finite_field_anchor: pass(
      true,
      "F_q[t] side is exact for q=2,3,5: polynomial Mobius and Liouville values come from factorization tables over monic polynomials."
    ),
    integer_holdout: pass(
      report.integer.endpoints.length >= 3,
      `Integer side was checked at endpoints ${report.integer.endpoints.join(", ")} with fixed lags h=${report.shifts.join(",")}.`
    ),
    controls: pass(
      sharedFamilyControls,
      `No single family clears controls in both universes: ${families.map((family) => `${family.family} Z=${family.integerBeatsControls} fields=${family.fieldPasses.map((row) => `F_${row.q}:${row.beatsControls}`).join("/")}`).join("; ")}.`,
      "hard-fail"
    ),
    compression: pass(
      true,
      "The statistic is low-parameter: two fixed multiplicative signs, eight fixed shifts, square-root normalization, and seeded null controls."
    ),
    scale_stability: pass(
      scaleStable,
      `Scale gate fails unless a complete 1M/2M/4M/8M integer ladder is present and a single family has stable slopes and profiles. Complete ladder=${completeIntegerLadder}; stable families=${scaleStableFamilies.map((family) => family.family).join(",") || "none"}.`,
      "hard-fail"
    ),
    novelty_audit: pass(
      false,
      "No literature/catalog audit has ruled out known Mobius/Liouville correlation theorems, Chowla-type finite-field results, or finite-degree artifacts.",
      "hard-fail"
    ),
    reproducibility: pass(
      allRequiredFilesPresent,
      missing.length ? `Missing artifacts: ${missing.join(", ")}` : "JSON/MD/SVG/script artifacts are present and generated by the Mobius/Liouville audit script."
    ),
    proof_path: pass(
      false,
      "The controls gate fails: finite-field correlation energies can be large, but the corresponding integer Mobius/Liouville energies are inside their null controls.",
      "hard-fail"
    ),
    expert_pack: pass(
      false,
      "No expert-ready evidence pack exists because controls, complete scale ladder, novelty audit, and proof-path gates fail.",
      "hard-fail"
    ),
  };

  const hardFailures = Object.entries(gateResults).filter(([, result]) => result.status !== "pass");
  const promoted = hardFailures.length === 0;
  const status = promoted ? "PROMOTE" : "REJECT_UNDER_STRICT_TWO_UNIVERSES_PROTOCOL";
  const mobiusLiouvilleEvidence = {
    diagnostics: {
      completeIntegerLadder,
      sharedFamilyControls,
      anySharedControlBeatingLaw: summary.anySharedControlBeatingLaw,
      allObjectsWithinControls: summary.allObjectsWithinControls,
      maxEnergy: summary.maxEnergy,
      slopeThreshold,
      stabilityThreshold,
      scaleStable,
      families,
    },
    integer: integerObjects,
    fields: fieldObjects,
  };
  const nextMutation = {
    title: "Theorem-first finite-field catalog search before more integer fitting",
    reason: "The multiplicative-sign mutation found exact finite-field correlation structure, but no matching integer family beats null controls or the complete scale ladder.",
    preregisteredNextMove: [
      "Stop inventing statistics from visuals and first enumerate exact finite-field identities for Mobius, Liouville, short intervals, character sums, and irreducible correlations.",
      "For each exact identity, write the theorem-shaped statement before running any integer-prime experiment.",
      "Classify whether the identity has an honest integer analogue, an obstruction-only analogue, or no transport map.",
      "Run integer experiments only for identities with a preregistered transport map, fixed normalization, holdout endpoints, and null controls.",
      "Promote only if the same theorem-shaped family clears controls, complete scale ladders, novelty audit, proof path, and expert pack gates.",
    ],
  };

  return {
    generatedAt: new Date().toISOString(),
    cycle,
    protocolVersion: "two-universes-breakthrough-candidate-v1",
    candidate: CYCLE_8_CANDIDATE,
    gates: GATES,
    gateResults,
    mobiusLiouvilleEvidence,
    decision: {
      status,
      promoted,
      reason: promoted
        ? "All gates passed."
        : "Mobius/Liouville fixed-lag correlations do not form a breakthrough candidate: no single family beats controls simultaneously in Z and every F_q[t], and the complete 8M ladder plus novelty/proof gates are absent.",
      hardFailures: hardFailures.map(([id, result]) => ({ id, ...result })),
    },
    surpriseLedger: {
      observedSignal: `Endpoint energies are ${[...integerObjects, ...fieldObjects].map((item) => `${item.label}=${item.finalEnergy.toFixed(6)}${item.beatsControls ? "*" : ""}`).join(", ")} where * means above controls.`,
      expectedNull: "A real two-universe multiplicative-sign law should have the same family, Mobius or Liouville, beat controls in Z and in q=2,3,5 with stable scale behavior.",
      knownExplanation: "Finite-field energies can reflect exact polynomial factorization/degree artifacts, while integer Mobius and Liouville correlations are consistent with their null sign controls at this scale.",
      survivedControls: families.filter((family) => family.controlsPass).map((family) => `${family.family} clears controls in Z and all fields`),
      failedControls: families.filter((family) => !family.controlsPass).map((family) => `${family.family}: Z=${family.integerBeatsControls}, fields=${family.fieldPasses.map((row) => `F_${row.q}=${row.beatsControls}`).join(",")}`),
      whatFailed: "The multiplicative-sign object did not produce a family-consistent cross-universe signal and lacks the required complete integer scale ladder.",
      suspectedInvariant: "Future work should begin from exact finite-field theorems and only then test a matched integer analogue.",
      nextMutation: nextMutation.title,
    },
    nextMutation,
  };
}

function auditCycle9() {
  const reportFile = "logs/two-universes-protocol/cycle-009-theorem-first-finite-field-catalog.json";
  const report = readJson(reportFile);
  const missing = CYCLE_9_CANDIDATE.evidenceFiles.filter((file) => !exists(file));
  const allRequiredFilesPresent = missing.length === 0;
  const entries = report.summary.entries;
  const allEntriesTheoremShaped = entries.every((entry) =>
    entry.theoremStatement
    && entry.finiteFieldObject
    && entry.transportClass
    && entry.integerAnalogue
  );
  const honestOpenEntries = report.summary.honestOpenEntries || [];
  const immediatelyEligible = report.summary.immediatelyExperimentEligible || [];
  const hasSourceAudit = Object.keys(report.sources || {}).length >= 5
    && entries.every((entry) => Array.isArray(entry.sourceIds) && entry.sourceIds.length > 0);

  const gateResults = {
    precise_statement: pass(
      allEntriesTheoremShaped,
      `Catalog has ${entries.length} theorem-shaped entries with finite-field object, transport class, and integer-analogue classification.`
    ),
    finite_field_anchor: pass(
      true,
      `Catalog is finite-field-first and cites ${Object.keys(report.sources || {}).length} source records covering Chowla, twin irreducibles, Mobius/discriminant mechanisms, and short intervals.`
    ),
    integer_holdout: pass(
      false,
      "Cycle 009 intentionally runs no integer holdout experiment; it is a theorem/transport catalog that blocks data-first promotion.",
      "hard-fail"
    ),
    controls: pass(
      false,
      "No candidate statistic is scored in this cycle, so there are no local/null/random controls to clear.",
      "hard-fail"
    ),
    compression: pass(
      true,
      "The catalog uses one fixed classification rule: exact finite-field theorem -> transport class -> experiment eligibility."
    ),
    scale_stability: pass(
      false,
      "No scale ladder is applicable until a specific honest-open theorem family is converted into a preregistered experiment or proof obligation.",
      "hard-fail"
    ),
    novelty_audit: pass(
      hasSourceAudit,
      hasSourceAudit
        ? `Novelty screen is source-backed: ${honestOpenEntries.length} honest-open families remain, ${immediatelyEligible.length} are immediately experiment-eligible.`
        : "Catalog lacks enough source records or source links for all entries."
    ),
    reproducibility: pass(
      allRequiredFilesPresent,
      missing.length ? `Missing artifacts: ${missing.join(", ")}` : "JSON/MD/SVG/script artifacts are present and generated by the theorem-first catalog script."
    ),
    proof_path: pass(
      false,
      "The required proof-obligation map is the next artifact; the catalog identifies theorem families but does not yet propose lemmas, substitutions, or a proof chain.",
      "hard-fail"
    ),
    expert_pack: pass(
      false,
      "The catalog is an evidence-routing artifact, not an expert-ready breakthrough pack with holdouts, controls, proof path, and novelty conclusion.",
      "hard-fail"
    ),
  };

  const hardFailures = Object.entries(gateResults).filter(([, result]) => result.status !== "pass");
  const promoted = hardFailures.length === 0;
  const status = promoted ? "PROMOTE" : "CATALOG_ONLY_NO_PROMOTION_UNDER_STRICT_TWO_UNIVERSES_PROTOCOL";
  const theoremCatalogEvidence = {
    diagnostics: {
      sourceCount: report.summary.sourceCount,
      entryCount: report.summary.entryCount,
      byTransportClass: report.summary.byTransportClass,
      honestOpenEntries,
      immediatelyEligible,
      blockedByNoTransport: report.summary.blockedByNoTransport,
      nextRequiredArtifact: report.summary.nextRequiredArtifact,
    },
    entries: entries.map((entry) => ({
      id: entry.id,
      family: entry.family,
      transportClass: entry.transportClass,
      statusForLoop: entry.statusForLoop,
      eligible: entry.experimentEligibility.eligible,
      eligibilityReason: entry.experimentEligibility.reason,
      sourceIds: entry.sourceIds,
      priorCycleContact: entry.priorCycleContact,
    })),
    sources: report.sources,
  };
  const nextMutation = {
    title: "Build a proof-obligation map before any new integer experiment",
    reason: "The catalog found honest-open theorem families, but every one either has related failed control cycles or needs a proof-substitution plan before more data can be meaningful.",
    preregisteredNextMove: [
      "For each honest-open family, write the finite-field theorem input and the exact integer statement it would support.",
      "Name the finite-field proof ingredient: monodromy/equidistribution, character sum, discriminant character, or generic Morse condition.",
      "Name the missing integer substitute lemma and mark whether it is known, open, false, or experimentally testable.",
      "Run no new integer experiment unless the proof-obligation map yields a fixed statistic, normalization, controls, holdouts, and scale ladder.",
      "If all honest-open families reduce to already failed controls, mutate away from aggregate correlations into explicit obstruction-class transport.",
    ],
  };

  return {
    generatedAt: new Date().toISOString(),
    cycle,
    protocolVersion: "two-universes-breakthrough-candidate-v1",
    candidate: CYCLE_9_CANDIDATE,
    gates: GATES,
    gateResults,
    theoremCatalogEvidence,
    decision: {
      status,
      promoted,
      reason: promoted
        ? "All gates passed."
        : "Cycle 009 is useful but not promotable: it converts theorem sources into transport classes, and it finds no immediately experiment-eligible breakthrough candidate.",
      hardFailures: hardFailures.map(([id, result]) => ({ id, ...result })),
    },
    surpriseLedger: {
      observedSignal: `Catalog contains ${entries.length} exact theorem/identity families; honest-open families are ${honestOpenEntries.join(", ") || "none"}; immediately experiment-eligible families are ${immediatelyEligible.join(", ") || "none"}.`,
      expectedNull: "A theorem-first pass should reject finite-field-only mechanisms and block experiments that merely rename prior failed control families.",
      knownExplanation: "The strongest finite-field results are either known calibrations, no-transport coefficient/discriminant mechanisms, or honest-open Chowla/twin-prime analogues already touched by failed aggregate-statistic cycles.",
      survivedControls: hasSourceAudit ? ["Source-backed novelty classification exists"] : [],
      failedControls: ["No integer holdout experiment or null controls were run in cycle 009 by design"],
      whatFailed: "No theorem family is ready for promotion or immediate data-first experimentation.",
      suspectedInvariant: "A real next lead must come from mapping proof ingredients, not from another plotted aggregate statistic.",
      nextMutation: nextMutation.title,
    },
    nextMutation,
  };
}

function auditCycle10() {
  const reportFile = "logs/two-universes-protocol/cycle-010-proof-obligation-map.json";
  const report = readJson(reportFile);
  const missing = CYCLE_10_CANDIDATE.evidenceFiles.filter((file) => !exists(file));
  const allRequiredFilesPresent = missing.length === 0;
  const obligations = report.summary.obligations;
  const allObligationsTheoremShaped = obligations.every((item) =>
    item.finiteFieldTheoremInput
    && item.integerStatement
    && item.proofIngredients?.length
    && item.blocker
  );
  const anyPotentialProofRoute = report.summary.potentialProofRouteCount > 0;
  const anyExperimentallyActionable = report.summary.experimentallyActionableCount > 0;
  const allBlocked = report.summary.blockedCount === report.summary.obligationCount;

  const gateResults = {
    precise_statement: pass(
      allObligationsTheoremShaped,
      `Proof map contains ${obligations.length} theorem-family obligations with finite-field input, integer statement, proof ingredients, and blocker.`
    ),
    finite_field_anchor: pass(
      true,
      "Every obligation is anchored to an honest-open finite-field theorem family from cycle 009."
    ),
    integer_holdout: pass(
      false,
      "Cycle 010 intentionally runs no integer holdout experiment because the missing lemmas are being classified first.",
      "hard-fail"
    ),
    controls: pass(
      false,
      "No candidate statistic is scored in this cycle; controls cannot pass until a weaker experimentally testable lemma is named.",
      "hard-fail"
    ),
    compression: pass(
      true,
      "The map uses one fixed proof-obligation schema: finite-field theorem input, proof ingredient, integer substitute, substitute status, blocker."
    ),
    scale_stability: pass(
      false,
      "No scale ladder is applicable while every honest-open family remains blocked at the missing-lemma stage.",
      "hard-fail"
    ),
    novelty_audit: pass(
      allBlocked,
      `The novelty audit is strict: ${report.summary.blockedCount}/${report.summary.obligationCount} honest-open families are blocked because the missing substitute is still a major open conjecture, non-transportable, or already tested without breakthrough.`
    ),
    reproducibility: pass(
      allRequiredFilesPresent,
      missing.length ? `Missing artifacts: ${missing.join(", ")}` : "JSON/MD/SVG/script artifacts are present and generated by the proof-obligation map script."
    ),
    proof_path: pass(
      anyPotentialProofRoute,
      `No proof path is currently promotable: potential proof routes=${report.summary.potentialProofRouteCount}, experimentally actionable obligations=${report.summary.experimentallyActionableCount}.`,
      "hard-fail"
    ),
    expert_pack: pass(
      false,
      "No expert-ready breakthrough pack exists because the proof map blocks all honest-open families before holdouts or controls.",
      "hard-fail"
    ),
  };

  const hardFailures = Object.entries(gateResults).filter(([, result]) => result.status !== "pass");
  const promoted = hardFailures.length === 0;
  const status = promoted ? "PROMOTE" : "PROOF_OBLIGATION_MAP_NO_PROMOTION_UNDER_STRICT_TWO_UNIVERSES_PROTOCOL";
  const proofObligationEvidence = {
    diagnostics: {
      obligationCount: report.summary.obligationCount,
      blockedCount: report.summary.blockedCount,
      potentialProofRouteCount: report.summary.potentialProofRouteCount,
      majorOpenLemmaCount: report.summary.majorOpenLemmaCount,
      notTransportableIngredientCount: report.summary.notTransportableIngredientCount,
      experimentallyActionableCount: report.summary.experimentallyActionableCount,
      nextRequiredArtifact: report.summary.nextRequiredArtifact,
      anyPotentialProofRoute,
      anyExperimentallyActionable,
      allBlocked,
    },
    obligations: obligations.map((item) => ({
      id: item.id,
      catalogEntryId: item.catalogEntryId,
      integerStatement: item.integerStatement,
      blocker: item.blocker,
      experimentStatus: item.experimentStatus,
      decision: item.classification.decision,
      missingOpenCount: item.classification.missingOpenCount,
      notTransportableCount: item.classification.notTransportableCount,
      testedNoBreakthroughCount: item.classification.testedNoBreakthroughCount,
      ingredients: item.proofIngredients,
    })),
  };
  const nextMutation = {
    title: "Explicit obstruction-class transport or a named weaker lemma",
    reason: "The honest-open theorem families are too broad: their missing integer substitutes are Chowla/twin-prime-scale conjectures or non-transportable finite-field geometry.",
    preregisteredNextMove: [
      "Do not run another aggregate Chowla or prime-pair statistic under a new name.",
      "Either name a strictly weaker integer lemma that is not equivalent to the original open conjecture, or switch to explicit obstruction-class transport.",
      "For obstruction-class transport, start from finite-field failure modes and ask whether a deterministic integer obstruction has the same theorem-shaped local form.",
      "Only experimentally test an obstruction class if the theorem-shaped local form is fixed before data and has matched null controls.",
      "If no obstruction class has honest transport, write a stopped/blocked ledger for this research branch rather than fabricating a lead.",
    ],
  };

  return {
    generatedAt: new Date().toISOString(),
    cycle,
    protocolVersion: "two-universes-breakthrough-candidate-v1",
    candidate: CYCLE_10_CANDIDATE,
    gates: GATES,
    gateResults,
    proofObligationEvidence,
    decision: {
      status,
      promoted,
      reason: promoted
        ? "All gates passed."
        : "Cycle 010 blocks promotion: all honest-open finite-field theorem families require major open integer substitutes or non-transportable proof ingredients before any new experiment can be meaningful.",
      hardFailures: hardFailures.map(([id, result]) => ({ id, ...result })),
    },
    surpriseLedger: {
      observedSignal: `Proof map has ${report.summary.obligationCount} obligations; blocked=${report.summary.blockedCount}; potential proof routes=${report.summary.potentialProofRouteCount}; experimentally actionable=${report.summary.experimentallyActionableCount}.`,
      expectedNull: "A proof-obligation pass should prevent a broad open theorem from being repackaged as a computational lead.",
      knownExplanation: "The finite-field theorems use geometry/character-sum ingredients whose integer substitutes are either not transportable or are exactly the open Chowla/twin-prime-scale statements.",
      survivedControls: allBlocked ? ["All broad theorem families were correctly blocked before data-first experimentation"] : [],
      failedControls: ["No integer holdouts or null controls by design; the map is a pre-experiment proof filter"],
      whatFailed: "No smaller proof path or experimentally actionable missing lemma was isolated.",
      suspectedInvariant: "If progress remains, it must be in explicit obstruction classes or a named weaker lemma rather than aggregate correlation statistics.",
      nextMutation: nextMutation.title,
    },
    nextMutation,
  };
}

function auditCycle11() {
  const reportFile = "logs/two-universes-protocol/cycle-011-obstruction-class-transport-map.json";
  const report = readJson(reportFile);
  const missing = CYCLE_11_CANDIDATE.evidenceFiles.filter((file) => !exists(file));
  const allRequiredFilesPresent = missing.length === 0;
  const classes = report.obstructionClasses;
  const allClassesTheoremShaped = classes.every((item) =>
    item.finiteFieldIdentity
    && item.finiteFieldFailureMode
    && item.integerSameForm
    && item.transportClass
    && item.eligibilityReason
  );
  const anyActionable = report.summary.experimentallyActionableCount > 0;
  const knownTransportOnly = report.summary.honestKnownTransportCount > 0 && !anyActionable;
  const noActionableClass = report.summary.branchDecision === "NO_ACTIONABLE_OBSTRUCTION_CLASS";

  const gateResults = {
    precise_statement: pass(
      allClassesTheoremShaped,
      `Obstruction map contains ${classes.length} finite-field failure modes with theorem-shaped identities, same-form integer tests, transport classes, and eligibility reasons.`
    ),
    finite_field_anchor: pass(
      true,
      "Every class begins from an exact finite-field failure mode or identity: repeated roots, local admissibility, discriminant characters, characteristic-2 trace parity, coefficient-space Morse failure, residue-theorem obstruction, or complete-shell cancellation."
    ),
    integer_holdout: pass(
      false,
      "Cycle 011 intentionally runs no integer holdout: the transport map found no non-exhausted obstruction class that justifies a new statistic.",
      "hard-fail"
    ),
    controls: pass(
      false,
      knownTransportOnly
        ? "The only honest transports are known squarefactor/admissibility controls already absorbed in prior cycles; no new class has controls to clear."
        : "No obstruction class is experimentally actionable, so no local/null/random controls can be scored.",
      "hard-fail"
    ),
    compression: pass(
      true,
      "The classification uses one fixed rule: finite-field failure mode -> same-form integer obstruction -> transport class -> experiment eligibility."
    ),
    scale_stability: pass(
      false,
      "No scale ladder applies because no obstruction class is allowed to proceed to a new experiment.",
      "hard-fail"
    ),
    novelty_audit: pass(
      noActionableClass,
      `Novelty screen blocks the branch: actionable classes=${report.summary.experimentallyActionableCount}, honest known local transports=${report.summary.honestKnownTransportCount}, non-actionable/no-new transports=${report.summary.noHonestNewTransportCount}.`
    ),
    reproducibility: pass(
      allRequiredFilesPresent,
      missing.length ? `Missing artifacts: ${missing.join(", ")}` : "JSON/MD/SVG/script artifacts are present and generated by the obstruction-class transport script."
    ),
    proof_path: pass(
      false,
      report.summary.stoppedReason,
      "hard-fail"
    ),
    expert_pack: pass(
      false,
      "No expert-ready breakthrough pack exists because the branch has no non-exhausted integer obstruction, no holdout, and no controls.",
      "hard-fail"
    ),
  };

  const hardFailures = Object.entries(gateResults).filter(([, result]) => result.status !== "pass");
  const promoted = hardFailures.length === 0;
  const status = promoted ? "PROMOTE" : "NO_ACTIONABLE_OBSTRUCTION_CLASS_UNDER_STRICT_TWO_UNIVERSES_PROTOCOL";
  const obstructionTransportEvidence = {
    diagnostics: {
      classCount: report.summary.classCount,
      honestKnownTransportCount: report.summary.honestKnownTransportCount,
      noHonestNewTransportCount: report.summary.noHonestNewTransportCount,
      exhaustedKnownTransportCount: report.summary.exhaustedKnownTransportCount,
      experimentallyActionableCount: report.summary.experimentallyActionableCount,
      branchDecision: report.summary.branchDecision,
      stoppedReason: report.summary.stoppedReason,
      nextRequiredArtifact: report.summary.nextRequiredArtifact,
      byTransportClass: report.summary.byTransportClass,
      knownTransportOnly,
      noActionableClass,
    },
    classes: classes.map((item) => ({
      id: item.id,
      family: item.family,
      theoremShape: item.theoremShape,
      transportClass: item.transportClass,
      noveltyStatus: item.noveltyStatus,
      experimentEligibility: item.experimentEligibility,
      eligibilityReason: item.eligibilityReason,
      priorCycleContact: item.priorCycleContact,
    })),
  };
  const nextMutation = {
    title: "Write a branch-stop ledger or propose a genuinely new domain",
    reason: "The finite-field theorem, proof-obligation, and obstruction-transport passes found no actionable Two-Universes route that is smaller than known open conjectures or already-exhausted local controls.",
    preregisteredNextMove: [
      "Write a branch-stop ledger for the current aggregate Two-Universes transport route.",
      "State exactly why no candidate is promoted: no honest non-exhausted transport, no holdout, no controls, and no proof path.",
      "If continuing, require a new domain/object not covered by prime tuples, Chowla/Mobius correlations, quotient spectra, or coefficient-space finite-field artifacts.",
      "For any new domain, restart at cycle 001-style registration: theorem-shaped object, exact finite-field anchor, integer transport map, controls, holdouts, novelty audit, proof path.",
      "Do not revive a rejected family without naming the exact gate failure it now fixes.",
    ],
  };

  return {
    generatedAt: new Date().toISOString(),
    cycle,
    protocolVersion: "two-universes-breakthrough-candidate-v1",
    candidate: CYCLE_11_CANDIDATE,
    gates: GATES,
    gateResults,
    obstructionTransportEvidence,
    decision: {
      status,
      promoted,
      reason: promoted
        ? "All gates passed."
        : "Cycle 011 blocks promotion: finite-field obstruction classes either do not transport to integers or transport only as known local controls already absorbed by prior cycles.",
      hardFailures: hardFailures.map(([id, result]) => ({ id, ...result })),
    },
    surpriseLedger: {
      observedSignal: `Obstruction map has ${report.summary.classCount} classes; honest known transports=${report.summary.honestKnownTransportCount}; actionable=${report.summary.experimentallyActionableCount}; decision=${report.summary.branchDecision}.`,
      expectedNull: "A strict obstruction transport pass should block finite-field-only mechanisms and known local controls from being repackaged as breakthroughs.",
      knownExplanation: "Squarefactor/admissibility obstructions are classical and already controlled; discriminant, characteristic-2, coefficient-space, residue-theorem, and complete-shell mechanisms do not have same-form integer transport.",
      survivedControls: ["Known local obstruction transports were identified but classified as exhausted controls"],
      failedControls: ["No new obstruction class is eligible for holdout/control testing"],
      whatFailed: "No non-exhausted same-form integer obstruction exists in the finite-field failure catalog.",
      suspectedInvariant: "This aggregate Two-Universes route should stop unless a new domain/object is registered.",
      nextMutation: nextMutation.title,
    },
    nextMutation,
  };
}

function auditCycle12() {
  const reportFile = "logs/two-universes-protocol/cycle-012-branch-stop-ledger.json";
  const report = readJson(reportFile);
  const missing = CYCLE_12_CANDIDATE.evidenceFiles.filter((file) => !exists(file));
  const allRequiredFilesPresent = missing.length === 0;
  const families = report.exhaustedFamilies;
  const coveredAllPriorCycles = ["001", "002", "003", "004", "005", "006", "007", "008", "009", "010", "011"]
    .every((id) => report.summary.coveredCycles.includes(id));
  const allFamiliesHaveKillRecord = families.every((family) =>
    family.object
    && family.killedByGates?.length
    && family.finalReason
    && family.revivalRequirements?.length
    && family.forbiddenRevival
  );
  const stopsCurrentBranch = report.summary.branchDecision === "STOP_CURRENT_AGGREGATE_TWO_UNIVERSES_ROUTE";
  const noPromotions = report.summary.promotedCount === 0;

  const gateResults = {
    precise_statement: pass(
      allFamiliesHaveKillRecord,
      `Stop ledger states ${families.length} exhausted families with objects, killed gates, final reasons, revival requirements, and forbidden revivals.`
    ),
    finite_field_anchor: pass(
      coveredAllPriorCycles,
      `Stop ledger covers cycles ${report.summary.coveredCycles.join(", ")} and preserves the exact finite-field/protocol artifacts as the authoritative branch history.`
    ),
    integer_holdout: pass(
      false,
      "Cycle 012 intentionally runs no integer holdout; it stops the current branch because no prior route produced a promotable holdout/control/proof package.",
      "hard-fail"
    ),
    controls: pass(
      false,
      "No new statistic is scored; the ledger records that control gates killed or blocked the relevant experimental families.",
      "hard-fail"
    ),
    compression: pass(
      true,
      "The stop rule is low-parameter: exhausted family -> killed gates -> forbidden revival -> reset conditions."
    ),
    scale_stability: pass(
      false,
      "No scale ladder applies to a stop ledger; prior incomplete or failed scale gates remain blockers.",
      "hard-fail"
    ),
    novelty_audit: pass(
      stopsCurrentBranch && noPromotions,
      `Novelty audit stops the branch: promoted count=${report.summary.promotedCount}, forbidden revival classes=${report.summary.forbiddenCount}, reset conditions=${report.summary.resetConditionCount}.`
    ),
    reproducibility: pass(
      allRequiredFilesPresent,
      missing.length ? `Missing artifacts: ${missing.join(", ")}` : "JSON/MD/SVG/script artifacts are present and generated by the branch-stop ledger script."
    ),
    proof_path: pass(
      false,
      "The ledger finds no proof path for the current aggregate route; continuation requires a new domain/object or a named gate-specific fix before data.",
      "hard-fail"
    ),
    expert_pack: pass(
      false,
      "This is a stop ledger, not an expert-ready breakthrough pack with a promoted theorem candidate.",
      "hard-fail"
    ),
  };

  const hardFailures = Object.entries(gateResults).filter(([, result]) => result.status !== "pass");
  const promoted = hardFailures.length === 0;
  const status = promoted ? "PROMOTE" : "BRANCH_STOP_NO_PROMOTION_UNDER_STRICT_TWO_UNIVERSES_PROTOCOL";
  const branchStopEvidence = {
    diagnostics: {
      familyCount: report.summary.familyCount,
      coveredCycles: report.summary.coveredCycles,
      promotedCount: report.summary.promotedCount,
      gateKillCounts: report.summary.gateKillCounts,
      forbiddenCount: report.summary.forbiddenCount,
      resetConditionCount: report.summary.resetConditionCount,
      branchDecision: report.summary.branchDecision,
      completionClaim: report.summary.completionClaim,
      coveredAllPriorCycles,
      stopsCurrentBranch,
    },
    families: families.map((family) => ({
      id: family.id,
      cycles: family.cycles,
      object: family.object,
      killedByGates: family.killedByGates,
      finalReason: family.finalReason,
      forbiddenRevival: family.forbiddenRevival,
    })),
    forbiddenWithoutNewProofIngredient: report.forbiddenWithoutNewProofIngredient,
    resetConditions: report.resetConditions,
  };
  const nextMutation = {
    title: "Register a genuinely new domain/object or remain stopped",
    reason: "The aggregate Two-Universes route has no promoted candidate and no actionable branch after experiments, theorem cataloging, proof-obligation mapping, and obstruction transport.",
    preregisteredNextMove: [
      "Do not run another cycle in this branch unless the proposal names a new domain/object or a gate-specific fix.",
      "A new domain/object must start with theorem-shaped registration and exact finite-field anchor before data.",
      "A revival must name the exact killed gate it fixes and explain the fix before data is scored.",
      "Any new experiment must include integer holdouts, controls, scale ladder, novelty audit, reproducible artifacts, proof path, and expert pack criteria at registration.",
      "If no such object is proposed, leave this branch stopped rather than generating weaker evidence.",
    ],
  };

  return {
    generatedAt: new Date().toISOString(),
    cycle,
    protocolVersion: "two-universes-breakthrough-candidate-v1",
    candidate: CYCLE_12_CANDIDATE,
    gates: GATES,
    gateResults,
    branchStopEvidence,
    decision: {
      status,
      promoted,
      reason: promoted
        ? "All gates passed."
        : "Cycle 012 stops the current aggregate route without promotion: every family from cycles 001-011 is exhausted, forbidden revivals are named, and continuation requires a new registered domain/object or gate-specific fix.",
      hardFailures: hardFailures.map(([id, result]) => ({ id, ...result })),
    },
    surpriseLedger: {
      observedSignal: `Stop ledger covers cycles ${report.summary.coveredCycles.join(", ")} with ${families.length} exhausted families and promoted count ${report.summary.promotedCount}.`,
      expectedNull: "A rigorous loop should stop an exhausted branch instead of inventing lower-quality successor statistics.",
      knownExplanation: "The branch failures are explicit: no transport, controls absorbed the signal, scale/proof gates failed, or the object reduced to known local structure.",
      survivedControls: ["The branch-stop audit covers all prior cycles and names forbidden revivals"],
      failedControls: ["No new holdout/control/proof package exists for promotion"],
      whatFailed: "The current aggregate Two-Universes route has no candidate that passes all required breakthrough gates.",
      suspectedInvariant: "Further progress requires a new domain/object with fresh registration discipline, not another mutation within this branch.",
      nextMutation: nextMutation.title,
    },
    nextMutation,
  };
}

function auditCycle13() {
  const reportFile = "logs/two-universes-protocol/cycle-013-cubic-chebotarev-transport-4000000.json";
  const report = readJson(reportFile);
  const missing = CYCLE_13_CANDIDATE.evidenceFiles.filter((file) => !exists(file));
  const allRequiredFilesPresent = missing.length === 0;
  const summary = report.summary;
  const allWithinControls = summary.allWithinControls;
  const completeScaleLadder = summary.hasRequiredIntegerScaleLadder;
  const fieldsWithinControls = summary.finalFields.every((field) => field.withinControls);
  const integerWithinControls = summary.finalInteger.withinControls;

  const gateResults = {
    precise_statement: pass(
      true,
      "Candidate states a fixed splitting-type statistic for x^3-2 modulo rational primes and x^3-t over residue fields F_q[t]/P, with classes split, linear+quadratic, and inert."
    ),
    finite_field_anchor: pass(
      true,
      "F_q[t] side is exact: closed points are monic irreducibles P, and the class is the factorization type of x^3-t over F_q[t]/P for q=2,5 degree ladders."
    ),
    integer_holdout: pass(
      report.integer.endpoints.length >= 3,
      `Integer side checks endpoints ${report.integer.endpoints.join(", ")} for factorization type of x^3-2 modulo unramified primes.`
    ),
    controls: pass(
      !allWithinControls,
      allWithinControls
        ? "Observed splitting distributions are inside the preregistered Chebotarev multinomial controls; this validates calibration but gives no anomaly to promote."
        : `At least one endpoint exceeds controls: integer=${integerWithinControls}, fields=${fieldsWithinControls}.`,
      allWithinControls ? "hard-fail" : "pass"
    ),
    compression: pass(
      true,
      "Low-parameter statistic: one cubic polynomial on each side, three splitting classes, and fixed Chebotarev expected proportions."
    ),
    scale_stability: pass(
      completeScaleLadder && !allWithinControls,
      `Scale gate requires complete 1M/2M/4M/8M integer ladder and a control-surviving anomaly. Complete ladder=${completeScaleLadder}; all within controls=${allWithinControls}.`,
      "hard-fail"
    ),
    novelty_audit: pass(
      false,
      "The observed object is a known Chebotarev calibration domain; no novelty audit has isolated a mechanism beyond classical/effective Chebotarev density.",
      "hard-fail"
    ),
    reproducibility: pass(
      allRequiredFilesPresent,
      missing.length ? `Missing artifacts: ${missing.join(", ")}` : "JSON/MD/SVG/script artifacts are present and generated by the cubic Chebotarev audit script."
    ),
    proof_path: pass(
      false,
      "Known Chebotarev explains the class proportions; the audit found no theorem-shaped new residual or proof path beyond calibration.",
      "hard-fail"
    ),
    expert_pack: pass(
      false,
      "No expert-ready breakthrough pack exists because the result is calibration-only and lacks novelty/proof promotion gates.",
      "hard-fail"
    ),
  };

  const hardFailures = Object.entries(gateResults).filter(([, result]) => result.status !== "pass");
  const promoted = hardFailures.length === 0;
  const status = promoted ? "PROMOTE" : "CHEBOTAREV_CALIBRATION_NO_PROMOTION_UNDER_STRICT_TWO_UNIVERSES_PROTOCOL";
  const chebotarevEvidence = {
    diagnostics: {
      completeScaleLadder,
      allWithinControls,
      integerWithinControls,
      fieldsWithinControls,
      maxChi: summary.maxChi,
      finalInteger: summary.finalInteger,
      finalFields: summary.finalFields,
      theoremShape: report.theoremShape,
    },
    integerRows: report.integer.rows.map((row) => ({
      label: row.label,
      labels: row.labels,
      counts: row.counts,
      fractions: row.fractions,
      chi: row.chi,
      maxAbsZ: row.maxAbsZ,
    })),
    fields: report.fields.map((field) => ({
      q: field.q,
      maxDegree: field.maxDegree,
      final: field.rows.at(-1),
    })),
  };
  const nextMutation = {
    title: "Stay in Chebotarev domain only if a non-classical residual is preregistered",
    reason: "The new domain is valid and reproducible, but the first object is exactly the classical Chebotarev splitting-type calibration and lies within controls.",
    preregisteredNextMove: [
      "Do not promote splitting-type proportions themselves; they are known calibration.",
      "If continuing in Chebotarev, mutate to a residual object not explained by class densities, such as low-conductor family covariance or joint splitting across independent extensions.",
      "Before running data, state the exact finite-field cover, the integer Galois representation, expected Chebotarev baseline, and null controls.",
      "Require q=2,5,7 field ladders and a complete 1M/2M/4M/8M integer ladder before any novelty memo.",
      "If no non-classical Chebotarev residual is named, keep this new domain as calibration only.",
    ],
  };

  return {
    generatedAt: new Date().toISOString(),
    cycle,
    protocolVersion: "two-universes-breakthrough-candidate-v1",
    candidate: CYCLE_13_CANDIDATE,
    gates: GATES,
    gateResults,
    chebotarevEvidence,
    decision: {
      status,
      promoted,
      reason: promoted
        ? "All gates passed."
        : "Cycle 013 registers a genuinely new domain, but the cubic splitting-type statistic is Chebotarev calibration: it lies within controls and has no novelty/proof path beyond known density theorems.",
      hardFailures: hardFailures.map(([id, result]) => ({ id, ...result })),
    },
    surpriseLedger: {
      observedSignal: `Cubic splitting maxChi=${summary.maxChi.toFixed(6)}; integer within controls=${integerWithinControls}; fields within controls=${fieldsWithinControls}; complete ladder=${completeScaleLadder}.`,
      expectedNull: "A basic Chebotarev splitting-type distribution should match expected class proportions up to multinomial fluctuations.",
      knownExplanation: "Classical/effective Chebotarev density explains the observed splitting-type proportions on both sides.",
      survivedControls: allWithinControls ? ["All endpoint diagnostics are within Chebotarev multinomial controls"] : [],
      failedControls: allWithinControls ? ["No anomaly beats controls"] : [],
      whatFailed: "The object is a valid new-domain calibration, not a breakthrough candidate.",
      suspectedInvariant: "If Chebotarev is useful here, it must be through residual covariance or joint-family structure beyond single-extension class proportions.",
      nextMutation: nextMutation.title,
    },
    nextMutation,
  };
}

function auditCycle14() {
  const reportFile = "logs/two-universes-protocol/cycle-014-joint-cubic-chebotarev-residual-4000000.json";
  const report = readJson(reportFile);
  const missing = CYCLE_14_CANDIDATE.evidenceFiles.filter((file) => !exists(file));
  const allRequiredFilesPresent = missing.length === 0;
  const summary = report.summary;
  const allWithinControls = summary.allWithinControls;
  const completeScaleLadder = summary.hasRequiredIntegerScaleLadder;
  const fieldsWithinControls = summary.finalFields.every((field) => field.withinControls);
  const integerWithinControls = summary.finalInteger.withinControls;

  const gateResults = {
    precise_statement: pass(
      true,
      "Candidate states a fixed joint splitting-type residual for two cubic Kummer covers on each side: x^3-2/x^3-5 over Z and x^3-t/x^3-(t+1) over F_q[t]."
    ),
    finite_field_anchor: pass(
      true,
      "F_q[t] side is exact: monic irreducibles P define finite residue fields, and the joint class is computed by cube-residue splitting of t and t+1."
    ),
    integer_holdout: pass(
      report.integer.endpoints.length >= 3,
      `Integer side checks endpoints ${report.integer.endpoints.join(", ")} for joint splitting type over unramified primes.`
    ),
    controls: pass(
      !allWithinControls,
      allWithinControls
        ? "Observed joint splitting residuals are inside preregistered product-Chebotarev multinomial controls; no anomaly survives."
        : `At least one joint endpoint exceeds controls: integer=${integerWithinControls}, fields=${fieldsWithinControls}.`,
      allWithinControls ? "hard-fail" : "pass"
    ),
    compression: pass(
      true,
      "Low-parameter statistic: two fixed cubic covers per universe, nine fixed joint classes, and product Chebotarev baselines."
    ),
    scale_stability: pass(
      completeScaleLadder && !allWithinControls,
      `Scale gate requires complete 1M/2M/4M/8M ladder and a control-surviving residual. Complete ladder=${completeScaleLadder}; all within controls=${allWithinControls}.`,
      "hard-fail"
    ),
    novelty_audit: pass(
      false,
      "No novelty audit has found structure beyond known Chebotarev/Kummer character independence; the residual is calibration-only at this scale.",
      "hard-fail"
    ),
    reproducibility: pass(
      allRequiredFilesPresent,
      missing.length ? `Missing artifacts: ${missing.join(", ")}` : "JSON/MD/SVG/script artifacts are present and generated by the joint Chebotarev residual script."
    ),
    proof_path: pass(
      false,
      "The joint residual lies inside controls and has no proof path beyond standard Chebotarev/Kummer equidistribution.",
      "hard-fail"
    ),
    expert_pack: pass(
      false,
      "No expert-ready breakthrough pack exists because controls, scale stability, novelty, and proof path gates fail.",
      "hard-fail"
    ),
  };

  const hardFailures = Object.entries(gateResults).filter(([, result]) => result.status !== "pass");
  const promoted = hardFailures.length === 0;
  const status = promoted ? "PROMOTE" : "JOINT_CHEBOTAREV_RESIDUAL_NO_PROMOTION_UNDER_STRICT_TWO_UNIVERSES_PROTOCOL";
  const jointChebotarevEvidence = {
    diagnostics: {
      completeScaleLadder,
      allWithinControls,
      integerWithinControls,
      fieldsWithinControls,
      maxChi: summary.maxChi,
      finalInteger: summary.finalInteger,
      finalFields: summary.finalFields,
      theoremShape: report.theoremShape,
    },
    integerRows: report.integer.rows.map((row) => ({
      label: row.label,
      labels: row.labels,
      counts: row.counts,
      chi: row.chi,
      maxAbsZ: row.maxAbsZ,
    })),
    fields: report.fields.map((field) => ({
      q: field.q,
      maxDegree: field.maxDegree,
      final: field.rows.at(-1),
    })),
  };
  const nextMutation = {
    title: "Leave basic Kummer splitting residuals unless a family-covariance theorem target is named",
    reason: "Both single-extension and joint Kummer splitting statistics are calibration-level Chebotarev objects and stay inside controls.",
    preregisteredNextMove: [
      "Do not mutate by adding more fixed Kummer covers without a theorem-shaped covariance target.",
      "If staying in Chebotarev, register a family-level object such as low-conductor covariance across varying covers, with expected Chebotarev baseline and controls before data.",
      "Require q=2,5,7 ladders, complete 1M/2M/4M/8M integer ladder, and an explicit novelty audit against Chebotarev independence.",
      "If no such family-level target is named, stop the Chebotarev branch as calibration-only.",
    ],
  };

  return {
    generatedAt: new Date().toISOString(),
    cycle,
    protocolVersion: "two-universes-breakthrough-candidate-v1",
    candidate: CYCLE_14_CANDIDATE,
    gates: GATES,
    gateResults,
    jointChebotarevEvidence,
    decision: {
      status,
      promoted,
      reason: promoted
        ? "All gates passed."
        : "Cycle 014 tests a non-classical joint residual, but it remains inside product-Chebotarev controls and lacks scale, novelty, proof-path, and expert-pack gates.",
      hardFailures: hardFailures.map(([id, result]) => ({ id, ...result })),
    },
    surpriseLedger: {
      observedSignal: `Joint Chebotarev maxChi=${summary.maxChi.toFixed(6)}; integer within controls=${integerWithinControls}; fields within controls=${fieldsWithinControls}; complete ladder=${completeScaleLadder}.`,
      expectedNull: "Joint Kummer splitting should match product Chebotarev baselines up to multinomial fluctuations unless a new covariance mechanism exists.",
      knownExplanation: "Chebotarev/Kummer character equidistribution explains the observed joint classes.",
      survivedControls: allWithinControls ? ["All endpoint diagnostics are within product-Chebotarev multinomial controls"] : [],
      failedControls: allWithinControls ? ["No joint residual beats controls"] : [],
      whatFailed: "The joint residual is a valid Chebotarev calibration, not a breakthrough candidate.",
      suspectedInvariant: "A useful Chebotarev branch would need a varying-family covariance, not fixed-cover class counts.",
      nextMutation: nextMutation.title,
    },
    nextMutation,
  };
}

function auditCycle15() {
  const reportFile = "logs/two-universes-protocol/cycle-015-family-cubic-chebotarev-covariance-8000000.json";
  const report = readJson(reportFile);
  const missing = CYCLE_15_CANDIDATE.evidenceFiles.filter((file) => !exists(file));
  const allRequiredFilesPresent = missing.length === 0;
  const summary = report.summary;
  const completeIntegerLadder = summary.hasRequiredIntegerScaleLadder;
  const completeFieldLadders = summary.hasRequiredFieldLadders;
  const matchedControlSurvival = summary.matchedControlSurvival;
  const allWithinControls = summary.allWithinControls;
  const scaleStable = completeIntegerLadder && completeFieldLadders && matchedControlSurvival && summary.profileAligned;

  const gateResults = {
    precise_statement: pass(
      true,
      "Candidate states Z_AB=sum_lambda (X_A-1/3)(X_B-1/3)/sqrt(|labels|*4/81) across low-conductor cubic Kummer cover families."
    ),
    finite_field_anchor: pass(
      true,
      "F_q[t] side is exact: A(t) ranges over low-degree squarefree polynomials, P ranges over monic irreducibles, and X_A(P) is cube-residue splitting in F_q[t]/P."
    ),
    integer_holdout: pass(
      completeIntegerLadder,
      `Integer side checks the preregistered ladder ${report.integer.endpoints.join(", ")} through N=${report.maxN}.`
    ),
    controls: pass(
      matchedControlSurvival,
      matchedControlSurvival
        ? "The family covariance beats controls in Z and every required F_q[t] ladder."
        : `No matched anomaly survives: allWithinControls=${allWithinControls}, integerWithinControls=${summary.integerWithinControls}, fieldsWithinControls=${summary.fieldsWithinControls}.`,
      matchedControlSurvival ? "pass" : "hard-fail"
    ),
    compression: pass(
      true,
      "Low-parameter statistic: one centered covariance formula over fixed low-conductor cover families and preregistered control envelopes."
    ),
    scale_stability: pass(
      scaleStable,
      `Scale gate requires complete integer/field ladders and matched control survival. Integer ladder=${completeIntegerLadder}; field ladders=${completeFieldLadders}; matched control survival=${matchedControlSurvival}; profileAligned=${summary.profileAligned}.`,
      scaleStable ? "pass" : "hard-fail"
    ),
    novelty_audit: pass(
      false,
      "The run is a genuine family-level mutation, but the observed covariance is explained by standard Chebotarev/Kummer independence and stays inside controls.",
      "hard-fail"
    ),
    reproducibility: pass(
      allRequiredFilesPresent,
      missing.length ? `Missing artifacts: ${missing.join(", ")}` : "JSON/MD/SVG/script artifacts are present for the full 8M and q=2,5,7 run."
    ),
    proof_path: pass(
      false,
      "There is no anomaly to prove; the natural proof path is the known equidistribution/null statement, not a new integer-prime breakthrough.",
      "hard-fail"
    ),
    expert_pack: pass(
      false,
      "No expert-ready breakthrough pack exists because controls, scale stability, novelty, and proof-path gates fail.",
      "hard-fail"
    ),
  };

  const hardFailures = Object.entries(gateResults).filter(([, result]) => result.status !== "pass");
  const promoted = hardFailures.length === 0;
  const status = promoted ? "PROMOTE" : "FAMILY_CHEBOTAREV_COVARIANCE_NO_PROMOTION_UNDER_STRICT_TWO_UNIVERSES_PROTOCOL";
  const familyChebotarevEvidence = {
    diagnostics: {
      completeIntegerLadder,
      completeFieldLadders,
      allWithinControls,
      matchedControlSurvival,
      profileSpread: summary.profileSpread,
      profileAligned: summary.profileAligned,
      maxCovRmsZ: summary.maxCovRmsZ,
      maxAbsCovZ: summary.maxAbsCovZ,
      finalInteger: summary.finalInteger,
      finalFields: summary.finalFields,
      theoremShape: report.theoremShape,
    },
    integerRows: report.integer.rows.map((row) => ({
      label: row.label,
      coverCount: row.coverCount,
      activePairCount: row.activePairCount,
      minPairLabels: row.minPairLabels,
      covRmsZ: row.covRmsZ,
      maxAbsCovZ: row.maxAbsCovZ,
      withinControls: row.withinControls,
      envelope: row.envelope,
    })),
    fields: report.fields.map((field) => ({
      q: field.q,
      maxDegree: field.maxDegree,
      coverCount: field.covers.length,
      final: field.rows.slice().reverse().find((row) => row.activePairCount > 0) || field.rows.at(-1),
    })),
  };
  const nextMutation = {
    title: "Stop the Chebotarev branch unless a non-Chebotarev theorem object is registered",
    reason: "Single-cover, fixed joint-cover, and family-covariance Chebotarev statistics all reduce to calibration under known Kummer/Chebotarev independence and stay inside controls.",
    preregisteredNextMove: [
      "Do not add more Kummer/Chebotarev cover counts or covariance matrices without a named theorem target that is not an equidistribution calibration.",
      "Move only to a genuinely different domain/object, or to a proof-first lemma smaller than a famous open conjecture.",
      "Before data, name the exact finite-field theorem mechanism, the integer-prime analogue, local/null controls, complete holdout ladders, novelty audit, proof path, and expert-pack criteria.",
      "If no such object is named, keep the research program stopped rather than manufacturing another statistic.",
    ],
  };

  return {
    generatedAt: new Date().toISOString(),
    cycle,
    protocolVersion: "two-universes-breakthrough-candidate-v1",
    candidate: CYCLE_15_CANDIDATE,
    gates: GATES,
    gateResults,
    familyChebotarevEvidence,
    decision: {
      status,
      promoted,
      reason: promoted
        ? "All gates passed."
        : "Cycle 015 executes the required family-level Chebotarev covariance mutation, but it remains inside controls across the complete integer and q=2,5,7 ladders.",
      hardFailures: hardFailures.map(([id, result]) => ({ id, ...result })),
    },
    surpriseLedger: {
      observedSignal: `Family covariance maxCovRmsZ=${summary.maxCovRmsZ.toFixed(6)}; maxAbsCovZ=${summary.maxAbsCovZ.toFixed(6)}; matchedControlSurvival=${matchedControlSurvival}.`,
      expectedNull: "Independent cubic Kummer characters should have zero centered covariance after conditioning on active unramified labels.",
      knownExplanation: "Standard Chebotarev/Kummer equidistribution explains the observed family covariance levels.",
      survivedControls: matchedControlSurvival ? ["Matched family covariance survived controls in all required universes"] : [],
      failedControls: matchedControlSurvival ? [] : ["Integer and field endpoint family covariance energies remain inside preregistered null envelopes"],
      whatFailed: "The Chebotarev branch produced calibration, not a control-surviving residual.",
      suspectedInvariant: "No non-classical Chebotarev residual is visible in fixed-cover or low-conductor family covariance tests.",
      nextMutation: nextMutation.title,
    },
    nextMutation,
  };
}

function auditCycle16() {
  const reportFile = "logs/two-universes-protocol/cycle-016-complete-weierstrass-trace-identity-8000000.json";
  const report = readJson(reportFile);
  const missing = CYCLE_16_CANDIDATE.evidenceFiles.filter((file) => !exists(file));
  const allRequiredFilesPresent = missing.length === 0;
  const summary = report.summary;
  const completeIntegerLadder = summary.completeIntegerLadder;
  const completeFieldLadders = summary.completeFieldLadders;
  const validationPassed = summary.validationPassed;
  const allResidualsZero = summary.allResidualsZero;
  const absorbedByExactIdentity = summary.absorbedByExactIdentity;
  const hasControlSurvivingResidual = !absorbedByExactIdentity && !allResidualsZero;
  const scaleStable = completeIntegerLadder && completeFieldLadders && validationPassed && allResidualsZero;

  const gateResults = {
    precise_statement: pass(
      true,
      "Candidate states T(K)=|K|^-1 sum_a -sum_x chi(x^3+a*x+1), residual R(K)=T(K)+1, and exact target T(K)=-1."
    ),
    finite_field_anchor: pass(
      true,
      "F_q[t] side is exact: K=F_q[t]/P for monic irreducibles P over q=3,5,7, with the quadratic character on the finite residue field."
    ),
    integer_holdout: pass(
      completeIntegerLadder,
      `Integer side checks the preregistered ladder ${report.integer.endpoints.join(", ")} through N=${report.maxN}.`
    ),
    controls: pass(
      hasControlSurvivingResidual,
      absorbedByExactIdentity
        ? `Exact identity absorbs the entire signal: max residual z=${summary.maxAbsResidualZ}; wrong zero-baseline z=${summary.maxWrongBaselineZ.toFixed(6)}.`
        : "A nonzero residual survives after exact theorem subtraction.",
      hasControlSurvivingResidual ? "pass" : "hard-fail"
    ),
    compression: pass(
      true,
      "One parameter-free identity and one residual formula cover rational prime fields and F_q[t] residue fields."
    ),
    scale_stability: pass(
      scaleStable,
      `Residual is stable by exact identity across complete integer and q=3,5,7 ladders. Integer ladder=${completeIntegerLadder}; field ladders=${completeFieldLadders}; validation=${validationPassed}; allResidualsZero=${allResidualsZero}.`
    ),
    novelty_audit: pass(
      false,
      "The proof is an elementary bijection after swapping sums; it is a useful calibration, not a new theorem or breakthrough mechanism.",
      "hard-fail"
    ),
    reproducibility: pass(
      allRequiredFilesPresent,
      missing.length ? `Missing artifacts: ${missing.join(", ")}` : "JSON/MD/SVG/script artifacts are present for the full 8M and q=3,5,7 run."
    ),
    proof_path: pass(
      validationPassed,
      validationPassed
        ? "The proof is explicit in the artifact and brute-validated over small prime and extension fields."
        : "Brute validation failed for at least one small finite field.",
      validationPassed ? "pass" : "hard-fail"
    ),
    expert_pack: pass(
      false,
      "No expert-ready breakthrough pack exists because the candidate is fully explained by the exact complete-family identity.",
      "hard-fail"
    ),
  };

  const hardFailures = Object.entries(gateResults).filter(([, result]) => result.status !== "pass");
  const promoted = hardFailures.length === 0;
  const status = promoted ? "PROMOTE" : "WEIERSTRASS_TRACE_IDENTITY_CALIBRATION_NO_PROMOTION_UNDER_STRICT_TWO_UNIVERSES_PROTOCOL";
  const weierstrassTraceEvidence = {
    diagnostics: {
      completeIntegerLadder,
      completeFieldLadders,
      validationPassed,
      allResidualsZero,
      absorbedByExactIdentity,
      maxAbsResidualZ: summary.maxAbsResidualZ,
      maxWrongBaselineZ: summary.maxWrongBaselineZ,
      theoremShape: report.theoremShape,
      finalInteger: summary.finalInteger,
      finalFields: summary.finalFields,
    },
    integerRows: report.integer.rows,
    fields: report.fields.map((field) => ({
      q: field.q,
      maxDegree: field.maxDegree,
      final: field.rows.at(-1),
    })),
    validation: report.validation,
  };
  const nextMutation = {
    title: "Leave complete-family bijection identities; register an incomplete-family or monodromy residual",
    reason: "The exact all-parameter Weierstrass trace identity transports perfectly, but it leaves zero residual after the theorem baseline.",
    preregisteredNextMove: [
      "Do not promote complete-family identities whose sums telescope by bijection.",
      "A next algebraic-family cycle must use an incomplete family, a moment beyond the exact collapsed identity, or a monodromy/spectral statistic with an explicit finite-field theorem baseline.",
      "Before data, name the integer-prime analogue, F_q[t] residue-field object, local/null controls, complete ladders, novelty audit, proof path, and expert-pack criteria.",
      "If no nonzero residual object is named, stop rather than fitting another exact calibration.",
    ],
  };

  return {
    generatedAt: new Date().toISOString(),
    cycle,
    protocolVersion: "two-universes-breakthrough-candidate-v1",
    candidate: CYCLE_16_CANDIDATE,
    gates: GATES,
    gateResults,
    weierstrassTraceEvidence,
    decision: {
      status,
      promoted,
      reason: promoted
        ? "All gates passed."
        : "Cycle 016 gives a correct cross-universe finite-field identity, but it is exact calibration: the theorem baseline absorbs every residual.",
      hardFailures: hardFailures.map(([id, result]) => ({ id, ...result })),
    },
    surpriseLedger: {
      observedSignal: `T(K)=-1 exactly across rational primes and F_q[t] residue fields; max residual z=${summary.maxAbsResidualZ}; wrong zero-baseline z=${summary.maxWrongBaselineZ.toFixed(6)}.`,
      expectedNull: "After subtracting the exact complete-family identity, no residual should remain.",
      knownExplanation: "Swapping sums and using the bijection a -> x^3+a*x+1 for x != 0 proves the identity over every odd finite field.",
      survivedControls: allResidualsZero ? ["Exact theorem baseline removes the raw drift on every label"] : [],
      failedControls: ["No control-surviving residual remains after theorem subtraction"],
      whatFailed: "The candidate is proof-first calibration, not a breakthrough signal.",
      suspectedInvariant: "Complete all-parameter character-sum families can transport exactly while still being too rigid to generate new integer-prime structure.",
      nextMutation: nextMutation.title,
    },
    nextMutation,
  };
}

function auditCycle17() {
  const reportFile = "logs/two-universes-protocol/cycle-017-complete-weierstrass-second-moment-8000000.json";
  const report = readJson(reportFile);
  const missing = CYCLE_17_CANDIDATE.evidenceFiles.filter((file) => !exists(file));
  const allRequiredFilesPresent = missing.length === 0;
  const summary = report.summary;
  const completeIntegerLadder = summary.completeIntegerLadder;
  const completeFieldLadders = summary.completeFieldLadders;
  const validationPassed = summary.validationPassed;
  const allExactResidualsZero = summary.allExactResidualsZero;
  const absorbedByExactSecondMoment = summary.absorbedByExactSecondMoment;
  const hasControlSurvivingResidual = !absorbedByExactSecondMoment && !allExactResidualsZero;
  const scaleStable = completeIntegerLadder && completeFieldLadders && validationPassed && allExactResidualsZero;

  const gateResults = {
    precise_statement: pass(
      true,
      "Candidate states M2(K)/(|K|*good_count)-1 with theorem residual subtracting -1/|K|^2 for the complete family y^2=x^3+a*x+b."
    ),
    finite_field_anchor: pass(
      true,
      "F_q[t] side is exact: K=F_q[t]/P for monic irreducibles P over q=3,5,7, and the family is defined over the finite residue field K."
    ),
    integer_holdout: pass(
      completeIntegerLadder,
      `Integer side checks the preregistered ladder ${report.integer.endpoints.join(", ")} through N=${report.maxN}.`
    ),
    controls: pass(
      hasControlSurvivingResidual,
      absorbedByExactSecondMoment
        ? `Exact second-moment identity absorbs the signal: max exact residual z=${summary.maxAbsExactResidualZ}; max ST-baseline residual z=${summary.maxAbsStResidualZ.toFixed(9)}.`
        : "A nonzero theorem-normalized residual survives the exact second-moment baseline.",
      hasControlSurvivingResidual ? "pass" : "hard-fail"
    ),
    compression: pass(
      true,
      "One parameter-free second-moment identity covers every odd finite field, with no fitted coefficients."
    ),
    scale_stability: pass(
      scaleStable,
      `Exact residual is stable across complete integer and q=3,5,7 ladders. Integer ladder=${completeIntegerLadder}; field ladders=${completeFieldLadders}; validation=${validationPassed}; allExactResidualsZero=${allExactResidualsZero}.`
    ),
    novelty_audit: pass(
      false,
      "This is a higher-moment mutation, but the exact residual is standard diagonal character orthogonality plus singular-curve bookkeeping.",
      "hard-fail"
    ),
    reproducibility: pass(
      allRequiredFilesPresent,
      missing.length ? `Missing artifacts: ${missing.join(", ")}` : "JSON/MD/SVG/script artifacts are present for the full 8M and q=3,5,7 run."
    ),
    proof_path: pass(
      validationPassed,
      validationPassed
        ? "The exact formula is stated in the artifact and brute-validated over small prime fields."
        : "Brute validation failed for at least one small prime field.",
      validationPassed ? "pass" : "hard-fail"
    ),
    expert_pack: pass(
      false,
      "No expert-ready breakthrough pack exists because the candidate is fully explained by exact second-moment orthogonality.",
      "hard-fail"
    ),
  };

  const hardFailures = Object.entries(gateResults).filter(([, result]) => result.status !== "pass");
  const promoted = hardFailures.length === 0;
  const status = promoted ? "PROMOTE" : "WEIERSTRASS_SECOND_MOMENT_CALIBRATION_NO_PROMOTION_UNDER_STRICT_TWO_UNIVERSES_PROTOCOL";
  const weierstrassSecondMomentEvidence = {
    diagnostics: {
      completeIntegerLadder,
      completeFieldLadders,
      validationPassed,
      allExactResidualsZero,
      absorbedByExactSecondMoment,
      maxAbsExactResidualZ: summary.maxAbsExactResidualZ,
      maxAbsStResidualZ: summary.maxAbsStResidualZ,
      theoremShape: report.theoremShape,
      finalInteger: summary.finalInteger,
      finalFields: summary.finalFields,
    },
    integerRows: report.integer.rows,
    fields: report.fields.map((field) => ({
      q: field.q,
      maxDegree: field.maxDegree,
      final: field.rows.at(-1),
    })),
    validation: report.validation,
  };
  const nextMutation = {
    title: "Leave complete orthogonality moments; register an incomplete-family, monodromy, or spectral residual",
    reason: "The higher-moment mutation also collapses exactly under finite-field character orthogonality, leaving no theorem-normalized residual.",
    preregisteredNextMove: [
      "Do not promote complete all-parameter moments whose residual is exactly zero after orthogonality bookkeeping.",
      "A next algebraic-family cycle must use an incomplete family, monodromy/spectral statistic, or a finite-field theorem whose integer analogue has a nonzero residual after the theorem baseline.",
      "Before data, preregister the finite-field object, integer analogue, local/null controls, full ladders, novelty audit, proof path, and expert-pack criteria.",
      "If the next object cannot name a nonzero theorem-normalized residual, stop rather than adding another complete-family calibration.",
    ],
  };

  return {
    generatedAt: new Date().toISOString(),
    cycle,
    protocolVersion: "two-universes-breakthrough-candidate-v1",
    candidate: CYCLE_17_CANDIDATE,
    gates: GATES,
    gateResults,
    weierstrassSecondMomentEvidence,
    decision: {
      status,
      promoted,
      reason: promoted
        ? "All gates passed."
        : "Cycle 017 executes the higher-moment algebraic-family mutation, but exact orthogonality absorbs the full theorem-normalized residual.",
      hardFailures: hardFailures.map(([id, result]) => ({ id, ...result })),
    },
    surpriseLedger: {
      observedSignal: `Normalized second moment is exactly 1-1/|K|^2; max exact residual z=${summary.maxAbsExactResidualZ}; max ST-baseline residual z=${summary.maxAbsStResidualZ.toFixed(9)}.`,
      expectedNull: "After subtracting the exact second-moment identity, no residual should remain.",
      knownExplanation: "Diagonal character orthogonality and singular-curve bookkeeping prove the complete-family second moment over every odd finite field.",
      survivedControls: allExactResidualsZero ? ["Exact second-moment theorem baseline removes every residual"] : [],
      failedControls: ["No control-surviving theorem-normalized residual remains"],
      whatFailed: "The candidate is higher-moment calibration, not a breakthrough signal.",
      suspectedInvariant: "Complete all-parameter algebraic-family moments are too rigid; useful next objects must break completeness or use monodromy/spectral residuals.",
      nextMutation: nextMutation.title,
    },
    nextMutation,
  };
}

function auditCycle18() {
  const reportFile = "logs/two-universes-protocol/cycle-018-cm-elliptic-spectral-residual-8000000.json";
  const report = readJson(reportFile);
  const missing = CYCLE_18_CANDIDATE.evidenceFiles.filter((file) => !exists(file));
  const allRequiredFilesPresent = missing.length === 0;
  const summary = report.summary;
  const completeIntegerLadder = summary.completeIntegerLadder;
  const completeFieldLadders = summary.completeFieldLadders;
  const validationPassed = summary.validationPassed;
  const matchedProfile = summary.matchedProfile;
  const scaleStable = completeIntegerLadder && completeFieldLadders && matchedProfile;

  const gateResults = {
    precise_statement: pass(
      true,
      "Candidate states u2(K)=a_K(E)^2/|K|-1 for the fixed CM curve E:y^2=x^3-x."
    ),
    finite_field_anchor: pass(
      true,
      "F_q[t] side is exact: K=F_q[t]/P and, for constant E/F_q, a_K is computed by the Frobenius recurrence from a_q."
    ),
    integer_holdout: pass(
      completeIntegerLadder,
      `Integer side checks the preregistered ladder ${report.integer.endpoints.join(", ")} through N=${report.maxN}.`
    ),
    controls: pass(
      matchedProfile,
      matchedProfile
        ? "The CM spectral residual survives integer controls and aligns with the required field profiles."
        : `No matched profile survives: integerBeatsControls=${summary.integerBeatsControls}, fieldSignsAligned=${summary.fieldSignsAligned}, fieldIntegerZSpread=${summary.fieldIntegerZSpread.toFixed(6)}.`,
      matchedProfile ? "pass" : "hard-fail"
    ),
    compression: pass(
      true,
      "Low-parameter object: one fixed CM curve and one fixed u2 spectral statistic."
    ),
    scale_stability: pass(
      scaleStable,
      `Scale gate requires complete ladders and matched integer/field profile. Integer ladder=${completeIntegerLadder}; field ladders=${completeFieldLadders}; matchedProfile=${matchedProfile}.`,
      scaleStable ? "pass" : "hard-fail"
    ),
    novelty_audit: pass(
      false,
      "The mutation is genuine, but the finite-field side is a constant-curve degree profile and the integer side is absorbed by controls; this is CM calibration, not new structure.",
      "hard-fail"
    ),
    reproducibility: pass(
      allRequiredFilesPresent,
      missing.length ? `Missing artifacts: ${missing.join(", ")}` : "JSON/MD/SVG/script artifacts are present for the full 8M and q=3,5,7 run."
    ),
    proof_path: pass(
      validationPassed,
      validationPassed
        ? "The CM trace formula is brute-validated over small prime fields and the field recurrence is explicit."
        : "Trace validation failed for at least one small prime field.",
      validationPassed ? "pass" : "hard-fail"
    ),
    expert_pack: pass(
      false,
      "No expert-ready breakthrough pack exists because controls and matched-field gates fail.",
      "hard-fail"
    ),
  };

  const hardFailures = Object.entries(gateResults).filter(([, result]) => result.status !== "pass");
  const promoted = hardFailures.length === 0;
  const status = promoted ? "PROMOTE" : "CM_ELLIPTIC_SPECTRAL_RESIDUAL_NO_PROMOTION_UNDER_STRICT_TWO_UNIVERSES_PROTOCOL";
  const cmEllipticEvidence = {
    diagnostics: {
      completeIntegerLadder,
      completeFieldLadders,
      validationPassed,
      integerBeatsControls: summary.integerBeatsControls,
      fieldSignsAligned: summary.fieldSignsAligned,
      fieldIntegerZSpread: summary.fieldIntegerZSpread,
      matchedProfile,
      maxAbsEndpointZ: summary.maxAbsEndpointZ,
      theoremShape: report.theoremShape,
      finalInteger: summary.finalInteger,
      finalFields: summary.finalFields,
    },
    integerRows: report.integer.real.rows,
    controlSummary: report.integer.controlSummary,
    fields: report.fields.map((field) => ({
      q: field.q,
      maxDegree: field.maxDegree,
      final: field.rows.at(-1),
    })),
    validation: report.integer.validation,
  };
  const nextMutation = {
    title: "Leave constant curves; register nonconstant monodromy or an incomplete-family residual",
    reason: "The fixed CM curve avoids complete-family orthogonality, but its F_q[t] side is degree-rigid and its integer profile is absorbed by controls.",
    preregisteredNextMove: [
      "Do not promote constant-curve residue-field degree profiles as two-universe structure.",
      "A next algebraic cycle must use a nonconstant curve/family over F_q(t), an incomplete family, or a monodromy/spectral statistic whose finite-field profile is not determined only by degree.",
      "Before data, preregister the theorem baseline, integer analogue, local/null controls, full ladders, novelty audit, proof path, and expert-pack criteria.",
      "If the object cannot avoid complete-family orthogonality and constant-curve degree rigidity, stop rather than adding another calibration.",
    ],
  };

  return {
    generatedAt: new Date().toISOString(),
    cycle,
    protocolVersion: "two-universes-breakthrough-candidate-v1",
    candidate: CYCLE_18_CANDIDATE,
    gates: GATES,
    gateResults,
    cmEllipticEvidence,
    decision: {
      status,
      promoted,
      reason: promoted
        ? "All gates passed."
        : "Cycle 018 breaks complete-family orthogonality with a fixed CM curve, but the integer profile is absorbed by controls and the F_q[t] side is degree-rigid.",
      hardFailures: hardFailures.map(([id, result]) => ({ id, ...result })),
    },
    surpriseLedger: {
      observedSignal: `Integer final z=${summary.finalInteger.z.toFixed(6)}; max field endpoint |z|=${summary.maxAbsEndpointZ.toFixed(6)}; matchedProfile=${matchedProfile}.`,
      expectedNull: "A true two-universe spectral residual should survive integer controls and align across q=3,5,7 field profiles.",
      knownExplanation: "CM trace formula and constant-curve Frobenius recurrence explain the observed profiles.",
      survivedControls: matchedProfile ? ["Matched CM spectral residual survived all required profile gates"] : [],
      failedControls: matchedProfile ? [] : ["Integer order/null controls absorb the prime profile and field profiles are degree-rigid/misaligned"],
      whatFailed: "The object is a fixed-curve calibration, not a breakthrough candidate.",
      suspectedInvariant: "Constant curves over F_q[t] are too rigid; useful algebraic-family transport must use nonconstant monodromy or incomplete-family residuals.",
      nextMutation: nextMutation.title,
    },
    nextMutation,
  };
}

function auditCycle19() {
  const reportFile = "logs/two-universes-protocol/cycle-019-quadratic-twist-cm-family-8000000.json";
  const report = readJson(reportFile);
  const missing = CYCLE_19_CANDIDATE.evidenceFiles.filter((file) => !exists(file));
  const allRequiredFilesPresent = missing.length === 0;
  const summary = report.summary;
  const completeIntegerLadder = summary.completeIntegerLadder;
  const completeFieldLadders = summary.completeFieldLadders;
  const validationPassed = summary.validationPassed;
  const matchedProfile = summary.matchedProfile;
  const scaleStable = completeIntegerLadder && completeFieldLadders && matchedProfile;

  const gateResults = {
    precise_statement: pass(
      true,
      "Candidate states V_S(K)=sum_D chi_K(D)a_K(E)/sqrt(|K|*good_D) for an incomplete quadratic-twist family of E:y^2=x^3-x."
    ),
    finite_field_anchor: pass(
      true,
      "F_q[t] side is exact: K=F_q[t]/P, with nonconstant low-degree twist polynomials D(t) and quadratic characters in the residue field."
    ),
    integer_holdout: pass(
      completeIntegerLadder,
      `Integer side checks the preregistered ladder ${report.integer.endpoints.join(", ")} through N=${report.maxN}.`
    ),
    controls: pass(
      matchedProfile,
      matchedProfile
        ? "The incomplete twist-family residual survives integer controls and aligns across q=3,5,7 field profiles."
        : `No matched profile survives: integerBeatsControls=${summary.integerBeatsControls}, signsAligned=${summary.signsAligned}, profileSpread=${summary.profileSpread.toFixed(6)}.`,
      matchedProfile ? "pass" : "hard-fail"
    ),
    compression: pass(
      true,
      "Low-parameter object: one CM curve, one fixed twist-window rule, and one normalized family trace statistic."
    ),
    scale_stability: pass(
      scaleStable,
      `Scale gate requires complete ladders and matched integer/field profile. Integer ladder=${completeIntegerLadder}; field ladders=${completeFieldLadders}; matchedProfile=${matchedProfile}.`,
      scaleStable ? "pass" : "hard-fail"
    ),
    novelty_audit: pass(
      false,
      "The mutation is genuine and nonconstant on the F_q[t] side, but the signal still factors through CM trace and quadratic-character windows; controls/profile gates fail.",
      "hard-fail"
    ),
    reproducibility: pass(
      allRequiredFilesPresent,
      missing.length ? `Missing artifacts: ${missing.join(", ")}` : "JSON/MD/SVG/script artifacts are present for the full 8M and q=3,5,7 run."
    ),
    proof_path: pass(
      validationPassed,
      validationPassed
        ? "The CM trace formula is brute-validated and the quadratic-twist trace factorization is explicit."
        : "Trace validation failed for at least one small prime field.",
      validationPassed ? "pass" : "hard-fail"
    ),
    expert_pack: pass(
      false,
      "No expert-ready breakthrough pack exists because controls, scale stability, novelty, and matched-profile gates fail.",
      "hard-fail"
    ),
  };

  const hardFailures = Object.entries(gateResults).filter(([, result]) => result.status !== "pass");
  const promoted = hardFailures.length === 0;
  const status = promoted ? "PROMOTE" : "QUADRATIC_TWIST_CM_FAMILY_NO_PROMOTION_UNDER_STRICT_TWO_UNIVERSES_PROTOCOL";
  const quadraticTwistCmEvidence = {
    diagnostics: {
      completeIntegerLadder,
      completeFieldLadders,
      validationPassed,
      integerBeatsControls: summary.integerBeatsControls,
      signsAligned: summary.signsAligned,
      profileSpread: summary.profileSpread,
      matchedProfile,
      maxAbsEndpointZ: summary.maxAbsEndpointZ,
      theoremShape: report.theoremShape,
      finalInteger: summary.finalInteger,
      finalFields: summary.finalFields,
    },
    integerRows: report.integer.real.rows,
    controlSummary: report.integer.controlSummary,
    fields: report.fields.map((field) => ({
      q: field.q,
      maxDegree: field.maxDegree,
      twists: field.twists,
      final: field.rows.at(-1),
    })),
    validation: report.integer.validation,
  };
  const nextMutation = {
    title: "Leave CM twist factorization; register non-CM monodromy or theorem-first incomplete-family residual",
    reason: "The nonconstant twist family avoids the constant-curve failure, but the profiles still factor through CM traces and quadratic-character windows and do not survive the strict matched-profile gates.",
    preregisteredNextMove: [
      "Do not promote CM twist-family character-window profiles as breakthrough structure.",
      "A next algebraic cycle must use non-CM monodromy, a non-isotrivial curve/family over F_q(t), or a theorem-first incomplete-family residual with a named nonzero baseline.",
      "Before data, preregister the theorem baseline, integer analogue, local/null controls, full ladders, novelty audit, proof path, and expert-pack criteria.",
      "If no such non-CM/non-isotrivial object is named, stop rather than adding another CM-character calibration.",
    ],
  };

  return {
    generatedAt: new Date().toISOString(),
    cycle,
    protocolVersion: "two-universes-breakthrough-candidate-v1",
    candidate: CYCLE_19_CANDIDATE,
    gates: GATES,
    gateResults,
    quadraticTwistCmEvidence,
    decision: {
      status,
      promoted,
      reason: promoted
        ? "All gates passed."
        : "Cycle 019 uses a nonconstant incomplete twist family, but the integer side is absorbed by controls and q-profile alignment fails.",
      hardFailures: hardFailures.map(([id, result]) => ({ id, ...result })),
    },
    surpriseLedger: {
      observedSignal: `Integer final z=${summary.finalInteger.z.toFixed(6)}; max endpoint |z|=${summary.maxAbsEndpointZ.toFixed(6)}; profileSpread=${summary.profileSpread.toFixed(6)}; matchedProfile=${matchedProfile}.`,
      expectedNull: "A useful incomplete twist-family residual should survive integer controls and align in sign/scale across q=3,5,7 field profiles.",
      knownExplanation: "CM trace factorization and quadratic-character windows explain the observed profile behavior.",
      survivedControls: matchedProfile ? ["Matched incomplete twist-family residual survived all strict profile gates"] : [],
      failedControls: matchedProfile ? [] : ["Integer controls absorb the prime profile and q-field profiles do not align in sign/scale"],
      whatFailed: "The object is a nonconstant CM-character calibration, not a breakthrough candidate.",
      suspectedInvariant: "CM factorization remains too rigid; useful algebraic-family transport likely requires non-CM monodromy or theorem-first nonzero residuals.",
      nextMutation: nextMutation.title,
    },
    nextMutation,
  };
}

function auditCycle20() {
  const reportFile = "logs/two-universes-protocol/cycle-020-noncm-legendre-family-pilot-20000.json";
  const report = readJson(reportFile);
  const missing = CYCLE_20_CANDIDATE.evidenceFiles.filter((file) => !exists(file));
  const allRequiredFilesPresent = missing.length === 0;
  const summary = report.summary;
  const hasRequiredIntegerScaleLadder = summary.hasRequiredIntegerScaleLadder;
  const completeFieldLadders = summary.completeFieldLadders;
  const validationPassed = summary.validationPassed;
  const matchedProfile = summary.matchedProfile;
  const scaleStable = hasRequiredIntegerScaleLadder && completeFieldLadders && matchedProfile;

  const gateResults = {
    precise_statement: pass(
      true,
      "Candidate states V_S(K)=sum_lambda a_K(E_lambda)/sqrt(|K|*good_lambda) for the non-CM Legendre family E_lambda:y^2=x(x-1)(x-lambda)."
    ),
    finite_field_anchor: pass(
      true,
      "F_q[t] side is exact: K=F_q[t]/P, lambda is a low-degree polynomial window, and traces are computed by quadratic characters in the residue field."
    ),
    integer_holdout: pass(
      hasRequiredIntegerScaleLadder,
      `Integer side only ran pilot endpoints ${report.integer.endpoints.join(", ")} through N=${report.maxN}; preregistered promotion requires 1M, 2M, 4M, and 8M.`,
      hasRequiredIntegerScaleLadder ? "pass" : "hard-fail"
    ),
    controls: pass(
      matchedProfile,
      matchedProfile
        ? "The non-CM Legendre-family residual survives controls and aligns across q=3,5,7 field profiles."
        : `No matched profile survives: integerBeatsControls=${summary.integerBeatsControls}, signsAligned=${summary.signsAligned}, profileSpread=${summary.profileSpread.toFixed(6)}.`,
      matchedProfile ? "pass" : "hard-fail"
    ),
    compression: pass(
      true,
      "Low-parameter object: one Legendre family, one fixed lambda-window rule, and one normalized trace statistic."
    ),
    scale_stability: pass(
      scaleStable,
      `Scale gate requires the full integer ladder, q=3,5,7 field ladders, and matched profile. Integer ladder=${hasRequiredIntegerScaleLadder}; field ladders=${completeFieldLadders}; matchedProfile=${matchedProfile}.`,
      scaleStable ? "pass" : "hard-fail"
    ),
    novelty_audit: pass(
      false,
      "The object is a genuine forced mutation out of CM, but the present result is only a known-style Legendre-family mean-zero trace pilot with no control-surviving new residual.",
      "hard-fail"
    ),
    reproducibility: pass(
      allRequiredFilesPresent,
      missing.length ? `Missing artifacts: ${missing.join(", ")}` : "JSON/MD/SVG/script artifacts are present for the non-CM pilot run."
    ),
    proof_path: pass(
      validationPassed,
      validationPassed
        ? "The trace statistic is exact and small-prime point-count validation passes; a proof path would start from Legendre-family trace sums and monodromy baselines."
        : "Trace validation failed for at least one small prime field.",
      validationPassed ? "pass" : "hard-fail"
    ),
    expert_pack: pass(
      false,
      "No expert-ready breakthrough pack exists because this is pilot-scale, lacks the full integer ladder, and fails control/profile gates.",
      "hard-fail"
    ),
  };

  const hardFailures = Object.entries(gateResults).filter(([, result]) => result.status !== "pass");
  const promoted = hardFailures.length === 0;
  const status = promoted ? "PROMOTE" : "NONCM_LEGENDRE_FAMILY_PILOT_NO_PROMOTION_UNDER_STRICT_TWO_UNIVERSES_PROTOCOL";
  const nonCmLegendreEvidence = {
    diagnostics: {
      hasRequiredIntegerScaleLadder,
      completeFieldLadders,
      validationPassed,
      integerBeatsControls: summary.integerBeatsControls,
      signsAligned: summary.signsAligned,
      profileSpread: summary.profileSpread,
      matchedProfile,
      maxAbsEndpointZ: summary.maxAbsEndpointZ,
      theoremShape: report.theoremShape,
      finalInteger: summary.finalInteger,
      finalFields: summary.finalFields,
    },
    integerRows: report.integer.real.rows,
    controlSummary: report.integer.controlSummary,
    fields: report.fields.map((field) => ({
      q: field.q,
      maxDegree: field.maxDegree,
      parameters: field.parameters,
      final: field.rows.at(-1),
    })),
    validation: report.integer.validation,
  };
  const nextMutation = {
    title: "Require fast non-CM trace engine or theorem-first nonzero residual before promotion attempt",
    reason: "The non-CM Legendre family is the right kind of representation jump, but the current exact evaluator is only a pilot and the observed profile does not survive the strict holdout/control/scale gates.",
    preregisteredNextMove: [
      "Do not promote pilot-scale non-CM trace profiles as breakthrough structure.",
      "A next cycle must either implement a faster non-CM trace engine for the full 1M/2M/4M/8M integer ladder, or formulate a theorem-first residual computable without brute rational-prime point counting.",
      "Keep the exact finite-field object, integer analogue, q=3,5,7 ladders, local/null controls, novelty audit, proof path, and expert-pack criteria preregistered before data.",
      "If the next proposal cannot name the theorem baseline and the nonzero residual in advance, stop rather than fitting another trace statistic.",
    ],
  };

  return {
    generatedAt: new Date().toISOString(),
    cycle,
    protocolVersion: "two-universes-breakthrough-candidate-v1",
    candidate: CYCLE_20_CANDIDATE,
    gates: GATES,
    gateResults,
    nonCmLegendreEvidence,
    decision: {
      status,
      promoted,
      reason: promoted
        ? "All gates passed."
        : "Cycle 020 reaches a genuine non-CM non-isotrivial family, but remains pilot-scale and fails integer holdout, control/profile, scale, novelty, and expert-pack gates.",
      hardFailures: hardFailures.map(([id, result]) => ({ id, ...result })),
    },
    surpriseLedger: {
      observedSignal: `Integer final z=${summary.finalInteger.z.toFixed(6)}; max endpoint |z|=${summary.maxAbsEndpointZ.toFixed(6)}; profileSpread=${summary.profileSpread.toFixed(6)}; matchedProfile=${matchedProfile}.`,
      expectedNull: "A useful non-CM Legendre-family residual should survive integer controls, full integer scale ladder, and align in sign/scale across q=3,5,7 field profiles.",
      knownExplanation: "Known Legendre-family trace-sum/monodromy baselines predict mean-zero behavior; the pilot profile is small and control-absorbed.",
      survivedControls: matchedProfile ? ["Matched non-CM Legendre-family residual survived all strict profile gates"] : [],
      failedControls: matchedProfile ? [] : ["Integer profile does not beat controls, full integer holdout ladder is absent, and q-field profile spread is too large"],
      whatFailed: "The object is an exact non-CM pilot, not a breakthrough candidate.",
      suspectedInvariant: "A useful continuation needs either full-scale non-CM trace computation or a theorem-first residual with a named nonzero baseline.",
      nextMutation: nextMutation.title,
    },
    nextMutation,
  };
}

function auditCycle21() {
  const reportFile = "logs/two-universes-protocol/cycle-021-legendre-special-supersingular-residual-8000000.json";
  const report = readJson(reportFile);
  const missing = CYCLE_21_CANDIDATE.evidenceFiles.filter((file) => !exists(file));
  const allRequiredFilesPresent = missing.length === 0;
  const summary = report.summary;
  const completeIntegerLadder = summary.completeIntegerLadder;
  const completeFieldLadders = summary.completeFieldLadders;
  const validationPassed = summary.validationPassed;
  const localControlExplains = summary.localControlExplains;
  const matchedProfile = summary.matchedProfile;
  const scaleStable = completeIntegerLadder && completeFieldLadders && matchedProfile && !localControlExplains;

  const gateResults = {
    precise_statement: pass(
      true,
      "Candidate states R(K)=B(K)-3/2, where B(K) counts supersingular Legendre parameters in the j=1728 and j=0 special automorphism loci."
    ),
    finite_field_anchor: pass(
      true,
      "F_q[t] side is exact: for K=F_q[t]/P, the special-locus count is determined by q mod 4, q mod 3, and whether q^deg(P) contains the j=0 lambda roots."
    ),
    integer_holdout: pass(
      completeIntegerLadder,
      `Integer side checks the preregistered ladder ${report.integer.endpoints.join(", ")} through N=${report.maxN}.`,
      completeIntegerLadder ? "pass" : "hard-fail"
    ),
    controls: pass(
      matchedProfile && !localControlExplains,
      localControlExplains
        ? "The integer signal is explained exactly by the local mod-4 theorem control B(F_p)=3*1_{p=3 mod 4}; no control-surviving residual remains."
        : `No matched profile survives: integerBeatsControls=${summary.integerBeatsControls}, signsAligned=${summary.signsAligned}, profileSpread=${summary.profileSpread.toFixed(6)}.`,
      matchedProfile && !localControlExplains ? "pass" : "hard-fail"
    ),
    compression: pass(
      true,
      "Low-parameter object: two special Legendre automorphism loci, one supersingularity count, and one centered residual."
    ),
    scale_stability: pass(
      scaleStable,
      `Scale gate requires full ladders, matched q=3,5,7 profile, and a non-local residual. Integer ladder=${completeIntegerLadder}; field ladders=${completeFieldLadders}; matchedProfile=${matchedProfile}; localControlExplains=${localControlExplains}.`,
      scaleStable ? "pass" : "hard-fail"
    ),
    novelty_audit: pass(
      false,
      "The large field-side z values and the integer residual are known supersingular special-locus congruence effects, not new two-universe structure.",
      "hard-fail"
    ),
    reproducibility: pass(
      allRequiredFilesPresent,
      missing.length ? `Missing artifacts: ${missing.join(", ")}` : "JSON/MD/SVG/script artifacts are present for the theorem-first 8M run."
    ),
    proof_path: pass(
      validationPassed,
      validationPassed
        ? "The proof path is explicit: Deuring/Hasse invariant detects supersingular Legendre parameters, and the special j=1728/j=0 loci reduce to congruence criteria."
        : "Deuring-polynomial validation failed for at least one small prime.",
      validationPassed ? "pass" : "hard-fail"
    ),
    expert_pack: pass(
      false,
      "No expert-ready breakthrough pack exists because the result is a known local congruence/CM special-locus theorem and fails controls, novelty, and matched-profile gates.",
      "hard-fail"
    ),
  };

  const hardFailures = Object.entries(gateResults).filter(([, result]) => result.status !== "pass");
  const promoted = hardFailures.length === 0;
  const status = promoted ? "PROMOTE" : "LEGENDRE_SPECIAL_SUPERSINGULAR_RESIDUAL_NO_PROMOTION_UNDER_STRICT_TWO_UNIVERSES_PROTOCOL";
  const legendreSpecialSupersingularEvidence = {
    diagnostics: {
      completeIntegerLadder,
      completeFieldLadders,
      validationPassed,
      localControlExplains,
      integerBeatsControls: summary.integerBeatsControls,
      signsAligned: summary.signsAligned,
      profileSpread: summary.profileSpread,
      matchedProfile,
      maxAbsEndpointZ: summary.maxAbsEndpointZ,
      theoremShape: report.theoremShape,
      finalInteger: summary.finalInteger,
      finalLocalControl: summary.finalLocalControl,
      finalFields: summary.finalFields,
    },
    integerRows: report.integer.real.rows,
    controlSummary: report.integer.controlSummary,
    fields: report.fields.map((field) => ({
      q: field.q,
      maxDegree: field.maxDegree,
      final: field.rows.at(-1),
    })),
    validation: report.integer.validation,
  };
  const nextMutation = {
    title: "Leave special automorphism and CM loci; require generic non-CM residual with a named baseline",
    reason: "The theorem-first supersingular residual is computable without point-counting and has a full integer ladder, but the signal is exactly a known local congruence/CM special-locus effect.",
    preregisteredNextMove: [
      "Do not promote supersingular special-orbit signals or any statistic exactly explained by p mod 4, p mod 3, or fixed-character local controls.",
      "A next algebraic cycle must use generic non-CM Legendre/elliptic-family structure, not j=1728 or j=0 special automorphism loci.",
      "Before data, name the finite-field theorem baseline and the nonzero residual that remains after subtracting all local congruence and CM-special-locus controls.",
      "If no generic residual can be stated before computation, stop rather than using large z-scores from known local theorem effects.",
    ],
  };

  return {
    generatedAt: new Date().toISOString(),
    cycle,
    protocolVersion: "two-universes-breakthrough-candidate-v1",
    candidate: CYCLE_21_CANDIDATE,
    gates: GATES,
    gateResults,
    legendreSpecialSupersingularEvidence,
    decision: {
      status,
      promoted,
      reason: promoted
        ? "All gates passed."
        : "Cycle 021 is theorem-first and full-scale, but it is exactly explained by known local congruence and CM special-locus criteria.",
      hardFailures: hardFailures.map(([id, result]) => ({ id, ...result })),
    },
    surpriseLedger: {
      observedSignal: `Integer final z=${summary.finalInteger.z.toFixed(6)}; max endpoint |z|=${summary.maxAbsEndpointZ.toFixed(6)}; profileSpread=${summary.profileSpread.toFixed(6)}; localControlExplains=${localControlExplains}.`,
      expectedNull: "A useful theorem-first residual should remain after local congruence, special automorphism, and CM controls are subtracted.",
      knownExplanation: "Deuring/Hasse invariant plus j=1728 and j=0 special-locus congruence criteria explain the entire signal.",
      survivedControls: [],
      failedControls: ["Exact local mod-4 theorem control reproduces the integer signal; q=3,5,7 profiles are fixed by q-local congruence and extension-degree effects"],
      whatFailed: "The object is a known theorem calibration, not a breakthrough candidate.",
      suspectedInvariant: "Large theorem-first signals can be fake breakthroughs unless all local congruence and special-locus baselines are subtracted first.",
      nextMutation: nextMutation.title,
    },
    nextMutation,
  };
}

function auditCycle22() {
  const reportFile = "logs/two-universes-protocol/cycle-022-generic-noncm-residual-obstruction-map.json";
  const report = readJson(reportFile);
  const missing = CYCLE_22_CANDIDATE.evidenceFiles.filter((file) => !exists(file));
  const allRequiredFilesPresent = missing.length === 0;
  const classes = report.candidateClasses;
  const summary = report.summary;
  const allClassesScreened = classes.every((item) =>
    item.object
    && item.exactFiniteFieldBaseline
    && item.genericNonCmStatus
    && item.integer8mStatus
    && item.blocker
    && item.requiredMutation
  );
  const noExperimentEligible = summary.experimentEligibleCount === 0;
  const noNonzeroResidual = summary.nonzeroResidualNamedCount === 0;

  const gateResults = {
    precise_statement: pass(
      allClassesScreened,
      `Obstruction map screens ${summary.classCount} generic non-CM candidate classes with object, theorem-baseline status, integer implementation status, blocker, and required mutation.`
    ),
    finite_field_anchor: pass(
      summary.exactOrReducibleBaselineCount > 0,
      `${summary.exactOrReducibleBaselineCount}/${summary.classCount} classes have an exact or reducible finite-field baseline, but none also has a nonzero residual and full experiment package.`
    ),
    integer_holdout: pass(
      false,
      "Cycle 022 intentionally runs no new integer holdout because no generic non-CM residual passes preregistration for data scoring.",
      "hard-fail"
    ),
    controls: pass(
      false,
      "No candidate statistic is scored; controls cannot pass because every generic non-CM route is blocked before data.",
      "hard-fail"
    ),
    compression: pass(
      true,
      "The filter uses one fixed schema: object, exact finite-field baseline, generic non-CM status, residual status, integer 8M status, field profile status, novelty status, blocker."
    ),
    scale_stability: pass(
      false,
      `No scale ladder applies: experimentEligibleCount=${summary.experimentEligibleCount}, fullIntegerImplementationCount=${summary.fullIntegerImplementationCount}, nonzeroResidualNamedCount=${summary.nonzeroResidualNamedCount}.`,
      "hard-fail"
    ),
    novelty_audit: pass(
      noExperimentEligible && noNonzeroResidual,
      `Novelty filter blocks the branch: no candidate class names a nonzero residual after complete-family, local-congruence, special-locus, and CM controls.`
    ),
    reproducibility: pass(
      allRequiredFilesPresent,
      missing.length ? `Missing artifacts: ${missing.join(", ")}` : "JSON/MD/SVG/script artifacts are present for the generic non-CM obstruction map."
    ),
    proof_path: pass(
      false,
      "No proof path is currently promotable: every route lacks either a concrete residual, exact baseline, full-scale integer implementation, or non-calibration novelty.",
      "hard-fail"
    ),
    expert_pack: pass(
      false,
      "This is a branch-stop filter, not an expert-ready breakthrough pack with a promoted generic non-CM theorem candidate.",
      "hard-fail"
    ),
  };

  const hardFailures = Object.entries(gateResults).filter(([, result]) => result.status !== "pass");
  const promoted = hardFailures.length === 0;
  const status = promoted ? "PROMOTE" : "GENERIC_NONCM_RESIDUAL_OBSTRUCTION_MAP_NO_PROMOTION_UNDER_STRICT_TWO_UNIVERSES_PROTOCOL";
  const genericNonCmObstructionEvidence = {
    diagnostics: {
      classCount: summary.classCount,
      experimentEligibleCount: summary.experimentEligibleCount,
      exactOrReducibleBaselineCount: summary.exactOrReducibleBaselineCount,
      fullIntegerImplementationCount: summary.fullIntegerImplementationCount,
      nonzeroResidualNamedCount: summary.nonzeroResidualNamedCount,
      previousCycleStatus: summary.previousCycleStatus,
      branchDecision: summary.branchDecision,
      nextRequiredArtifact: summary.nextRequiredArtifact,
      allClassesScreened,
      noExperimentEligible,
      noNonzeroResidual,
    },
    requirements: report.requirements,
    classes: classes.map((item) => ({
      id: item.id,
      object: item.object,
      exactFiniteFieldBaseline: item.exactFiniteFieldBaseline,
      genericNonCmStatus: item.genericNonCmStatus,
      residualAfterControls: item.residualAfterControls,
      integer8mStatus: item.integer8mStatus,
      fieldProfileStatus: item.fieldProfileStatus,
      noveltyStatus: item.noveltyStatus,
      experimentEligible: item.experimentEligible,
      blocker: item.blocker,
      requiredMutation: item.requiredMutation,
    })),
  };
  const nextMutation = {
    title: "Stop algebraic-family branch until a concrete generic non-CM residual is registered",
    reason: "After the non-CM pilot and theorem-first special-locus audit, no remaining generic non-CM route has all required ingredients before data: exact baseline, nonzero residual, full integer implementation, controls, and novelty path.",
    preregisteredNextMove: [
      "Do not run more Legendre/elliptic-family data until a concrete generic non-CM residual is registered before computation.",
      "The registration must include an exact finite-field theorem baseline, an integer analogue, special/CM/local controls, q=3,5,7 field ladders, the full 1M/2M/4M/8M integer ladder, and a proof-path sketch.",
      "Complete-family identities, special-locus supersingularity, fixed-curve trace profiles, and incomplete windows without theorem baselines remain forbidden revivals.",
      "If no such object is available, keep this algebraic-family branch stopped and switch only by registering a genuinely new domain/object.",
    ],
  };

  return {
    generatedAt: new Date().toISOString(),
    cycle,
    protocolVersion: "two-universes-breakthrough-candidate-v1",
    candidate: CYCLE_22_CANDIDATE,
    gates: GATES,
    gateResults,
    genericNonCmObstructionEvidence,
    decision: {
      status,
      promoted,
      reason: promoted
        ? "All gates passed."
        : "Cycle 022 blocks promotion and stops the current algebraic-family branch: no generic non-CM residual is experiment-eligible under the preregistered gates.",
      hardFailures: hardFailures.map(([id, result]) => ({ id, ...result })),
    },
    surpriseLedger: {
      observedSignal: `Screened ${summary.classCount} generic non-CM classes; eligible=${summary.experimentEligibleCount}; nonzero residuals named=${summary.nonzeroResidualNamedCount}; branchDecision=${summary.branchDecision}.`,
      expectedNull: "A strict loop should stop before data if every representation jump lacks a theorem-shaped residual or implementation.",
      knownExplanation: "The surviving-looking routes reduce to complete-family orthogonality, missing finite-field baselines, missing integer trace engines, unresolved supersingular/class-number baselines, or abstract sheaf ideas without concrete statistics.",
      survivedControls: noExperimentEligible ? ["All generic non-CM routes were blocked before data-first fitting"] : [],
      failedControls: ["No candidate statistic is eligible for holdout/control testing"],
      whatFailed: "No concrete generic non-CM residual currently satisfies the strict breakthrough-candidate protocol.",
      suspectedInvariant: "This algebraic-family branch should remain stopped until the theorem baseline and implementation arrive before data.",
      nextMutation: nextMutation.title,
    },
    nextMutation,
  };
}

function auditCycle23() {
  const reportFile = "logs/two-universes-protocol/cycle-023-quadratic-dirichlet-prime-race-8000000.json";
  const report = readJson(reportFile);
  const missing = CYCLE_23_CANDIDATE.evidenceFiles.filter((file) => !exists(file));
  const allRequiredFilesPresent = missing.length === 0;
  const summary = report.summary;
  const completeIntegerLadder = summary.completeIntegerLadder;
  const completeFieldLadders = summary.completeFieldLadders;
  const validationPassed = summary.validationPassed;
  const matchedProfile = summary.matchedProfile;
  const scaleStable = completeIntegerLadder && completeFieldLadders && matchedProfile;

  const gateResults = {
    precise_statement: pass(
      true,
      "Candidate states Z(X)=sum chi(P)/sqrt(labels) for a fixed quadratic Dirichlet character on rational primes and the matched polynomial Dirichlet character on F_q[t] irreducibles."
    ),
    finite_field_anchor: pass(
      true,
      "F_q[t] side is exact: chi(P) is the quadratic residue character modulo a fixed irreducible quadratic polynomial M_q(t), checked across q=3,5,7 degree ladders."
    ),
    integer_holdout: pass(
      completeIntegerLadder,
      `Integer side checks the preregistered ladder ${report.integer.endpoints.join(", ")} through N=${report.maxN}.`,
      completeIntegerLadder ? "pass" : "hard-fail"
    ),
    controls: pass(
      matchedProfile,
      matchedProfile
        ? "The quadratic character race survives nearby-character, shuffle, bootstrap, and q-profile controls."
        : `No control-surviving matched profile: integerBeatsControls=${summary.integerBeatsControls}, signsAligned=${summary.signsAligned}, profileSpread=${summary.profileSpread.toFixed(6)}.`,
      matchedProfile ? "pass" : "hard-fail"
    ),
    compression: pass(
      true,
      "Low-parameter object: one integer quadratic character, one fixed irreducible quadratic modulus per q, and one normalized cumulative character sum."
    ),
    scale_stability: pass(
      scaleStable,
      `Scale gate requires complete integer and field ladders plus a matched control-surviving profile. Integer ladder=${completeIntegerLadder}; field ladders=${completeFieldLadders}; matchedProfile=${matchedProfile}.`,
      scaleStable ? "pass" : "hard-fail"
    ),
    novelty_audit: pass(
      false,
      "The object is a real new domain after the algebraic-family stop, but the observed small character-race sums are standard Dirichlet/PNT-in-progressions calibration and do not beat nearby-character controls.",
      "hard-fail"
    ),
    reproducibility: pass(
      allRequiredFilesPresent,
      missing.length ? `Missing artifacts: ${missing.join(", ")}` : "JSON/MD/SVG/script artifacts are present for the 8M quadratic Dirichlet race run."
    ),
    proof_path: pass(
      validationPassed,
      validationPassed
        ? "The proof path is classical calibration: Dirichlet characters and prime number theorem in arithmetic progressions on Z, polynomial Dirichlet characters and prime polynomial theorem on F_q[t]."
        : "Character validation failed on at least one integer or finite-field sample.",
      validationPassed ? "pass" : "hard-fail"
    ),
    expert_pack: pass(
      false,
      "No expert-ready breakthrough pack exists because controls, novelty, and matched-profile gates fail; this is a calibration artifact.",
      "hard-fail"
    ),
  };

  const hardFailures = Object.entries(gateResults).filter(([, result]) => result.status !== "pass");
  const promoted = hardFailures.length === 0;
  const status = promoted ? "PROMOTE" : "QUADRATIC_DIRICHLET_PRIME_RACE_NO_PROMOTION_UNDER_STRICT_TWO_UNIVERSES_PROTOCOL";
  const quadraticDirichletEvidence = {
    diagnostics: {
      completeIntegerLadder,
      completeFieldLadders,
      validationPassed,
      integerBeatsControls: summary.integerBeatsControls,
      signsAligned: summary.signsAligned,
      profileSpread: summary.profileSpread,
      matchedProfile,
      maxAbsEndpointZ: summary.maxAbsEndpointZ,
      theoremShape: report.theoremShape,
      finalInteger: summary.finalInteger,
      finalFields: summary.finalFields,
    },
    integerRows: report.integer.real.rows,
    controlSummary: report.integer.controlSummary,
    fields: report.fields.map((field) => ({
      q: field.q,
      maxDegree: field.maxDegree,
      modulus: field.modulus,
      final: field.rows.at(-1),
    })),
    integerValidation: report.integer.validation,
    fieldValidation: report.fields.map((field) => ({
      q: field.q,
      modulus: field.modulus,
      rows: field.validationResidues.slice(0, 4),
    })),
  };
  const nextMutation = {
    title: "Leave single-character prime races; require higher-order transition bias with canonical F_q[t] analogue or stop",
    reason: "The quadratic character race has exact objects and full ladders, but the signal is small, control-absorbed, and explained by classical Dirichlet/PNT-in-progressions calibration.",
    preregisteredNextMove: [
      "Do not promote single Dirichlet-character prime races or residue-class count imbalances by themselves.",
      "A next character-race cycle must either name a higher-order transition/consecutive-bias statistic with a canonical order-free F_q[t] analogue, or stop this branch.",
      "Before data, register the finite-field theorem/null model, integer analogue, local character controls, holdout ladder, q-ladders, novelty audit, proof path, and expert-pack criteria.",
      "If the F_q[t] analogue depends on arbitrary lexicographic ordering, reject it before computation rather than reviving the cycle-001 ordering failure.",
    ],
  };

  return {
    generatedAt: new Date().toISOString(),
    cycle,
    protocolVersion: "two-universes-breakthrough-candidate-v1",
    candidate: CYCLE_23_CANDIDATE,
    gates: GATES,
    gateResults,
    quadraticDirichletEvidence,
    decision: {
      status,
      promoted,
      reason: promoted
        ? "All gates passed."
        : "Cycle 023 opens a new Dirichlet-character domain, but the character-race profile is absorbed by nearby-character/random controls and remains known calibration.",
      hardFailures: hardFailures.map(([id, result]) => ({ id, ...result })),
    },
    surpriseLedger: {
      observedSignal: `Integer final z=${summary.finalInteger.z.toFixed(6)}; max endpoint |z|=${summary.maxAbsEndpointZ.toFixed(6)}; profileSpread=${summary.profileSpread.toFixed(6)}; matchedProfile=${matchedProfile}.`,
      expectedNull: "A useful character-race residual should survive nearby-character, shuffle, bootstrap, and q=3,5,7 profile controls beyond Dirichlet/PNT calibration.",
      knownExplanation: "Quadratic character cancellation under Dirichlet/PNT-in-progressions and polynomial Dirichlet character sums explain the small observed profiles.",
      survivedControls: matchedProfile ? ["Matched quadratic character race survived all strict controls"] : [],
      failedControls: matchedProfile ? [] : ["Integer profile does not beat nearby-character/random controls despite full ladders and exact q-side character objects"],
      whatFailed: "The object is a standard Dirichlet-character calibration, not a breakthrough candidate.",
      suspectedInvariant: "Single-character count imbalances are too classical; any continuation needs higher-order transition bias with a non-arbitrary F_q[t] analogue.",
      nextMutation: nextMutation.title,
    },
    nextMutation,
  };
}

function renderGateTable(audit) {
  const lines = [];
  lines.push("| gate | status | evidence |");
  lines.push("| --- | --- | --- |");
  for (const gate of GATES) {
    const result = audit.gateResults[gate.id];
    lines.push(`| ${gate.name} | ${result.status.toUpperCase()} | ${result.evidence.replace(/\|/g, "\\|")} |`);
  }
  return lines.join("\n");
}

function renderRows(rows) {
  const lines = [];
  lines.push("| source | field | scrub | degree | real r | real z | cyclic meanAbs r | composite meanAbs r | high-placebo r | verdict |");
  lines.push("| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |");
  for (const row of rows) {
    lines.push(`| ${row.source} | ${row.label} | ${row.scrub} | ${row.degree} | ${row.realR.toFixed(6)} | ${row.realZ.toFixed(3)} | ${row.cyclicMeanAbsR.toFixed(6)} | ${row.compositeMeanAbsR.toFixed(6)} | ${row.highPlaceboR.toFixed(6)} | ${row.verdictPass ? "pass" : "fail"} |`);
  }
  return lines.join("\n");
}

function renderGraphEvidence(graphEvidence) {
  const lines = [];
  const z = graphEvidence.integerEndpoint;
  lines.push("### Integer Endpoint");
  lines.push("");
  lines.push("| N | labels | D | mean degree | Cramer D range | composite D range |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: |");
  lines.push(`| ${z.N} | ${z.labels} | ${z.D.toFixed(6)} | ${z.meanDegree.toFixed(6)} | ${z.cramerDRange[0].toFixed(6)}..${z.cramerDRange[1].toFixed(6)} | ${z.compositeDRange[0].toFixed(6)}..${z.compositeDRange[1].toFixed(6)} |`);
  lines.push("");
  lines.push("### Function-Field Endpoints");
  lines.push("");
  lines.push("| q | degree | labels | D | mean degree | random monic D range | random reducible D range |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const row of graphEvidence.fieldEndpoints) {
    lines.push(`| ${row.q} | ${row.degree} | ${row.labels} | ${row.D.toFixed(6)} | ${row.meanDegree.toFixed(6)} | ${row.randomMonicDRange[0].toFixed(6)}..${row.randomMonicDRange[1].toFixed(6)} | ${row.randomReducibleDRange[0].toFixed(6)}..${row.randomReducibleDRange[1].toFixed(6)} |`);
  }
  return lines.join("\n");
}

function renderCenteredEvidence(centeredEvidence) {
  const lines = [];
  const z = centeredEvidence.integer;
  lines.push("### Integer Pair-Centered Holdout");
  lines.push("");
  lines.push("| N | split | labels | offdiag RMS | max offdiag | mean abs residual | Cramer RMS range | composite RMS range |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  lines.push(`| ${z.N} | ${z.split} | ${z.labels} | ${z.offdiagRms.toFixed(6)} | ${z.maxAbsOffdiag.toFixed(6)} | ${z.meanAbsResidual.toFixed(6)} | ${z.cramerRange[0].toFixed(6)}..${z.cramerRange[1].toFixed(6)} | ${z.compositeRange[0].toFixed(6)}..${z.compositeRange[1].toFixed(6)} |`);
  lines.push("");
  lines.push("### Function-Field Pair-Centered Holdouts");
  lines.push("");
  lines.push("| q | train degree | holdout degree | offdiag RMS | max offdiag | mean abs residual | random monic RMS range | random reducible RMS range |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const row of centeredEvidence.fields) {
    lines.push(`| ${row.q} | ${row.trainDegree} | ${row.holdoutDegree} | ${row.offdiagRms.toFixed(6)} | ${row.maxAbsOffdiag.toFixed(6)} | ${row.meanAbsResidual.toFixed(6)} | ${row.randomMonicRange[0].toFixed(6)}..${row.randomMonicRange[1].toFixed(6)} | ${row.randomReducibleRange[0].toFixed(6)}..${row.randomReducibleRange[1].toFixed(6)} |`);
  }
  return lines.join("\n");
}

function renderLocalStateEvidence(localStateEvidence) {
  const lines = [];
  const e = localStateEvidence.estimator;
  const z = localStateEvidence.integer;
  lines.push("### Estimator Support");
  lines.push("");
  lines.push("| min state count | min edge support | prior weight | max fallback | max mean residual |");
  lines.push("| ---: | ---: | ---: | ---: | ---: |");
  lines.push(`| ${e.minStateCount} | ${e.minEdgeSupport} | ${e.localRatePriorWeight} | ${e.maxFallback.toFixed(6)} | ${e.maxMeanAbsResidual.toFixed(6)} |`);
  lines.push("");
  lines.push("### Integer Local-State Holdout");
  lines.push("");
  lines.push("| N | split | labels | offdiag RMS | max offdiag | mean abs residual | fallback | Cramer RMS range | composite RMS range |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  lines.push(`| ${z.N} | ${z.split} | ${z.labels} | ${z.offdiagRms.toFixed(6)} | ${z.maxAbsOffdiag.toFixed(6)} | ${z.meanAbsResidual.toFixed(6)} | ${z.fallbackFraction.toFixed(6)} | ${z.cramerRange[0].toFixed(6)}..${z.cramerRange[1].toFixed(6)} | ${z.compositeRange[0].toFixed(6)}..${z.compositeRange[1].toFixed(6)} |`);
  lines.push("");
  lines.push("### Function-Field Local-State Holdouts");
  lines.push("");
  lines.push("| q | train degree | holdout degree | offdiag RMS | max offdiag | mean abs residual | fallback | random monic RMS range | random reducible RMS range |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const row of localStateEvidence.fields) {
    lines.push(`| ${row.q} | ${row.trainDegree} | ${row.holdoutDegree} | ${row.offdiagRms.toFixed(6)} | ${row.maxAbsOffdiag.toFixed(6)} | ${row.meanAbsResidual.toFixed(6)} | ${row.fallbackFraction.toFixed(6)} | ${row.randomMonicRange[0].toFixed(6)}..${row.randomMonicRange[1].toFixed(6)} | ${row.randomReducibleRange[0].toFixed(6)}..${row.randomReducibleRange[1].toFixed(6)} |`);
  }
  return lines.join("\n");
}

function renderExactAdmissibilityEvidence(exactAdmissibilityEvidence) {
  const lines = [];
  const e = exactAdmissibilityEvidence.estimator;
  lines.push("### Estimator And Match Diagnostics");
  lines.push("");
  lines.push("| beta alpha | beta beta | min train edges | max low-edge frac | order2 field ratio | integer 2M/1M ratio |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: |");
  lines.push(`| ${e.betaPriorAlpha} | ${e.betaPriorBeta} | ${e.minTrainEdges} | ${e.maxLowEdgeFraction.toFixed(6)} | ${e.fieldRatio.toFixed(6)} | ${e.integerDecay.toFixed(6)} |`);
  lines.push("");
  lines.push("### Integer Exact-Admissibility Holdouts");
  lines.push("");
  lines.push("| N | labels | train vertices | holdout vertices | order1 RMS | order2 RMS | order3 RMS | random eligible order2 | composite order2 |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const row of exactAdmissibilityEvidence.integerScales) {
    lines.push(`| ${row.N} | ${row.labels} | ${row.trainVertices} | ${row.holdoutVertices} | ${row.order1Rms.toFixed(6)} | ${row.order2Rms.toFixed(6)} | ${row.order3Rms.toFixed(6)} | ${row.randomEligibleOrder2Range[0].toFixed(6)}..${row.randomEligibleOrder2Range[1].toFixed(6)} | ${row.compositeOrder2Range[0].toFixed(6)}..${row.compositeOrder2Range[1].toFixed(6)} |`);
  }
  lines.push("");
  lines.push("### Function-Field Exact-Admissibility Holdouts");
  lines.push("");
  lines.push("| q | train degree | holdout degree | train vertices | holdout vertices | order1 RMS | order2 RMS | order3 RMS | monic order2 | reducible order2 |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const row of exactAdmissibilityEvidence.fields) {
    lines.push(`| ${row.q} | ${row.trainDegree} | ${row.holdoutDegree} | ${row.trainVertices} | ${row.holdoutVertices} | ${row.order1Rms.toFixed(6)} | ${row.order2Rms.toFixed(6)} | ${row.order3Rms.toFixed(6)} | ${row.randomMonicOrder2Range[0].toFixed(6)}..${row.randomMonicOrder2Range[1].toFixed(6)} | ${row.randomReducibleOrder2Range[0].toFixed(6)}..${row.randomReducibleOrder2Range[1].toFixed(6)} |`);
  }
  return lines.join("\n");
}

function fixed(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "nan";
}

function renderSignedProfileEvidence(signedProfileEvidence) {
  const lines = [];
  const d = signedProfileEvidence.diagnostics;
  lines.push("### Signed Profile Diagnostics");
  lines.push("");
  lines.push("| min profile Pearson | min cross Pearson | min stability Pearson | max slope gap | complete 8M ladder |");
  lines.push("| ---: | ---: | ---: | ---: | --- |");
  lines.push(`| ${fixed(d.minProfilePearson)} | ${fixed(d.minCrossCorrelation)} | ${fixed(d.minStabilityCorrelation)} | ${fixed(d.maxSlopeGap)} | ${d.completeScaleLadder} |`);
  lines.push("");
  lines.push("### Integer Signed Profiles");
  lines.push("");
  lines.push("| run | order2 RMS | order3 RMS | order2 positive frac | order3 positive frac |");
  lines.push("| --- | ---: | ---: | ---: | ---: |");
  for (const row of signedProfileEvidence.integerRuns) {
    lines.push(`| ${row.label} | ${fixed(row.order2Rms)} | ${fixed(row.order3Rms)} | ${fixed(row.order2PositiveFraction)} | ${fixed(row.order3PositiveFraction)} |`);
  }
  lines.push("");
  lines.push("### Cross-Universe Endpoint Correlations");
  lines.push("");
  lines.push("| order | field endpoint | Pearson |");
  lines.push("| --- | --- | ---: |");
  for (const row of signedProfileEvidence.crossUniverseProfile.order2) {
    lines.push(`| order2 | ${row.field} | ${fixed(row.pearson)} |`);
  }
  for (const row of signedProfileEvidence.crossUniverseProfile.order3) {
    lines.push(`| order3 | ${row.field} | ${fixed(row.pearson)} |`);
  }
  lines.push("");
  lines.push("### Decay Slopes");
  lines.push("");
  lines.push("| universe | order2 slope | order3 slope |");
  lines.push("| --- | ---: | ---: |");
  lines.push(`| Z | ${fixed(signedProfileEvidence.decaySlopes.integer.order2)} | ${fixed(signedProfileEvidence.decaySlopes.integer.order3)} |`);
  for (const row of signedProfileEvidence.decaySlopes.fields) {
    lines.push(`| F_${row.q} | ${fixed(row.order2Slope)} | ${fixed(row.order3Slope)} |`);
  }
  return lines.join("\n");
}

function renderQuotientSpectralEvidence(quotientSpectralEvidence) {
  const lines = [];
  const d = quotientSpectralEvidence.diagnostics;
  lines.push("### Quotient Spectral Diagnostics");
  lines.push("");
  lines.push("| final budget | integer pass | all fields pass | complete 8M ladder | excess-edge slope | min field margin |");
  lines.push("| ---: | --- | --- | --- | ---: | ---: |");
  lines.push(`| ${d.finalBudget} | ${d.integerPass} | ${d.allFieldsPass} | ${d.completeIntegerLadder} | ${fixed(d.excessEdgeSlope)} | ${fixed(d.minFieldControlMargin)} |`);
  lines.push("");
  lines.push("### Integer Quotient Spectral Edge");
  lines.push("");
  const z = quotientSpectralEvidence.integer;
  lines.push("| N | budget | edge | random edge | composite edge | Cramer edge | energy |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  lines.push(`| ${z.N} | ${z.budget} | ${fixed(z.edge)} | ${fixed(z.randomRange[0])}..${fixed(z.randomRange[1])} | ${fixed(z.compositeRange[0])}..${fixed(z.compositeRange[1])} | ${fixed(z.cramerRange[0])}..${fixed(z.cramerRange[1])} | ${fixed(z.energy)} |`);
  lines.push("");
  lines.push("### Function-Field Quotient Spectral Edges");
  lines.push("");
  lines.push("| q | degrees | budget | rows | dim | edge | random edge | composite edge | pass controls |");
  lines.push("| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |");
  for (const row of quotientSpectralEvidence.fields) {
    lines.push(`| ${row.q} | ${row.degrees.join(",")} | ${row.budget} | ${row.rows} | ${row.dim} | ${fixed(row.edge)} | ${fixed(row.randomRange[0])}..${fixed(row.randomRange[1])} | ${fixed(row.compositeRange[0])}..${fixed(row.compositeRange[1])} | ${row.passControls} |`);
  }
  return lines.join("\n");
}

function renderControlRanges(controlRanges) {
  return Object.entries(controlRanges)
    .map(([name, rangeValue]) => `${name}:${fixed(rangeValue[0])}..${fixed(rangeValue[1])}`)
    .join("; ");
}

function renderMobiusLiouvilleEvidence(mobiusLiouvilleEvidence) {
  const lines = [];
  const d = mobiusLiouvilleEvidence.diagnostics;
  lines.push("### Mobius/Liouville Diagnostics");
  lines.push("");
  lines.push("| complete 8M ladder | shared family clears controls | mixed-family summary flag | all objects within controls | max energy | scale stable |");
  lines.push("| --- | --- | --- | --- | ---: | --- |");
  lines.push(`| ${d.completeIntegerLadder} | ${d.sharedFamilyControls} | ${d.anySharedControlBeatingLaw} | ${d.allObjectsWithinControls} | ${fixed(d.maxEnergy)} | ${d.scaleStable} |`);
  lines.push("");
  lines.push("### Family Gate");
  lines.push("");
  lines.push("| family | Z beats controls | field passes | max abs energy slope | min stability |");
  lines.push("| --- | --- | --- | ---: | ---: |");
  for (const family of d.families) {
    lines.push(`| ${family.family} | ${family.integerBeatsControls} | ${family.fieldPasses.map((row) => `F_${row.q}:${row.beatsControls}`).join(", ")} | ${fixed(family.maxAbsEnergySlope)} | ${fixed(family.minStability)} |`);
  }
  lines.push("");
  lines.push("### Object Summaries");
  lines.push("");
  lines.push("| object | final energy | final max cell | energy slope | stability | control ranges | beats controls |");
  lines.push("| --- | ---: | ---: | ---: | ---: | --- | --- |");
  for (const row of [...mobiusLiouvilleEvidence.integer, ...mobiusLiouvilleEvidence.fields]) {
    lines.push(`| ${row.label} | ${fixed(row.finalEnergy)} | ${fixed(row.finalMaxAbsCell)} | ${fixed(row.energySlope)} | ${fixed(row.stability)} | ${renderControlRanges(row.controlRanges)} | ${row.beatsControls} |`);
  }
  return lines.join("\n");
}

function renderTheoremCatalogEvidence(theoremCatalogEvidence) {
  const lines = [];
  const d = theoremCatalogEvidence.diagnostics;
  lines.push("### Theorem Catalog Diagnostics");
  lines.push("");
  lines.push("| sources | entries | honest-open families | immediately eligible | next required artifact |");
  lines.push("| ---: | ---: | --- | --- | --- |");
  lines.push(`| ${d.sourceCount} | ${d.entryCount} | ${d.honestOpenEntries.join(", ") || "none"} | ${d.immediatelyEligible.join(", ") || "none"} | ${d.nextRequiredArtifact} |`);
  lines.push("");
  lines.push("### Transport Classes");
  lines.push("");
  lines.push("| class | count |");
  lines.push("| --- | ---: |");
  for (const [klass, count] of Object.entries(d.byTransportClass)) {
    lines.push(`| ${klass} | ${count} |`);
  }
  lines.push("");
  lines.push("### Catalog Entries");
  lines.push("");
  lines.push("| id | family | transport | eligible | reason | prior cycles | source ids |");
  lines.push("| --- | --- | --- | --- | --- | --- | --- |");
  for (const row of theoremCatalogEvidence.entries) {
    lines.push(`| ${row.id} | ${row.family} | ${row.transportClass} | ${row.eligible} | ${row.eligibilityReason.replace(/\|/g, "\\|")} | ${row.priorCycleContact.join(", ") || "none"} | ${row.sourceIds.join(", ")} |`);
  }
  lines.push("");
  lines.push("### Source Records");
  lines.push("");
  lines.push("| id | title | url | role |");
  lines.push("| --- | --- | --- | --- |");
  for (const [id, source] of Object.entries(theoremCatalogEvidence.sources)) {
    lines.push(`| ${id} | ${source.title.replace(/\|/g, "\\|")} | ${source.url} | ${source.role.replace(/\|/g, "\\|")} |`);
  }
  return lines.join("\n");
}

function renderProofObligationEvidence(proofObligationEvidence) {
  const lines = [];
  const d = proofObligationEvidence.diagnostics;
  lines.push("### Proof-Obligation Diagnostics");
  lines.push("");
  lines.push("| obligations | blocked | potential proof routes | major open lemmas | not-transportable ingredients | experimentally actionable |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: |");
  lines.push(`| ${d.obligationCount} | ${d.blockedCount} | ${d.potentialProofRouteCount} | ${d.majorOpenLemmaCount} | ${d.notTransportableIngredientCount} | ${d.experimentallyActionableCount} |`);
  lines.push("");
  lines.push("### Obligation Summary");
  lines.push("");
  lines.push("| id | catalog entry | decision | open lemmas | no-transport | tested no breakthrough | blocker |");
  lines.push("| --- | --- | --- | ---: | ---: | ---: | --- |");
  for (const row of proofObligationEvidence.obligations) {
    lines.push(`| ${row.id} | ${row.catalogEntryId} | ${row.decision} | ${row.missingOpenCount} | ${row.notTransportableCount} | ${row.testedNoBreakthroughCount} | ${row.blocker.replace(/\|/g, "\\|")} |`);
  }
  lines.push("");
  lines.push("### Ingredients");
  lines.push("");
  lines.push("| obligation | ingredient | integer substitute | status |");
  lines.push("| --- | --- | --- | --- |");
  for (const row of proofObligationEvidence.obligations) {
    for (const ingredient of row.ingredients) {
      lines.push(`| ${row.catalogEntryId} | ${ingredient.ingredient.replace(/\|/g, "\\|")} | ${ingredient.integerSubstitute.replace(/\|/g, "\\|")} | ${ingredient.substituteStatus} |`);
    }
  }
  return lines.join("\n");
}

function renderObstructionTransportEvidence(obstructionTransportEvidence) {
  const lines = [];
  const d = obstructionTransportEvidence.diagnostics;
  lines.push("### Obstruction Transport Diagnostics");
  lines.push("");
  lines.push("| classes | honest known transports | non-actionable/no-new transports | exhausted known transports | actionable | branch decision |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | --- |");
  lines.push(`| ${d.classCount} | ${d.honestKnownTransportCount} | ${d.noHonestNewTransportCount} | ${d.exhaustedKnownTransportCount} | ${d.experimentallyActionableCount} | ${d.branchDecision} |`);
  lines.push("");
  lines.push("### Transport Counts");
  lines.push("");
  lines.push("| transport class | count |");
  lines.push("| --- | ---: |");
  for (const [klass, count] of Object.entries(d.byTransportClass)) {
    lines.push(`| ${klass} | ${count} |`);
  }
  lines.push("");
  lines.push("### Obstruction Classes");
  lines.push("");
  lines.push("| id | theorem shape | transport | novelty | eligible | reason | prior cycles |");
  lines.push("| --- | --- | --- | --- | --- | --- | --- |");
  for (const row of obstructionTransportEvidence.classes) {
    lines.push(`| ${row.id} | ${row.theoremShape.replace(/\|/g, "\\|")} | ${row.transportClass} | ${row.noveltyStatus} | ${row.experimentEligibility} | ${row.eligibilityReason.replace(/\|/g, "\\|")} | ${row.priorCycleContact.join(", ")} |`);
  }
  return lines.join("\n");
}

function renderBranchStopEvidence(branchStopEvidence) {
  const lines = [];
  const d = branchStopEvidence.diagnostics;
  lines.push("### Branch-Stop Diagnostics");
  lines.push("");
  lines.push("| families | covered cycles | promoted | forbidden classes | reset conditions | decision |");
  lines.push("| ---: | --- | ---: | ---: | ---: | --- |");
  lines.push(`| ${d.familyCount} | ${d.coveredCycles.join(", ")} | ${d.promotedCount} | ${d.forbiddenCount} | ${d.resetConditionCount} | ${d.branchDecision} |`);
  lines.push("");
  lines.push("### Gate Kill Counts");
  lines.push("");
  lines.push("| gate | family count |");
  lines.push("| --- | ---: |");
  for (const [gate, count] of Object.entries(d.gateKillCounts)) {
    lines.push(`| ${gate} | ${count} |`);
  }
  lines.push("");
  lines.push("### Exhausted Families");
  lines.push("");
  lines.push("| id | cycles | killed gates | final reason | forbidden revival |");
  lines.push("| --- | --- | --- | --- | --- |");
  for (const family of branchStopEvidence.families) {
    lines.push(`| ${family.id} | ${family.cycles.join(", ")} | ${family.killedByGates.join(", ")} | ${family.finalReason.replace(/\|/g, "\\|")} | ${family.forbiddenRevival.replace(/\|/g, "\\|")} |`);
  }
  lines.push("");
  lines.push("### Forbidden Without New Proof Ingredient");
  lines.push("");
  for (const item of branchStopEvidence.forbiddenWithoutNewProofIngredient) {
    lines.push(`- ${item}`);
  }
  lines.push("");
  lines.push("### Reset Conditions");
  lines.push("");
  for (const item of branchStopEvidence.resetConditions) {
    lines.push(`- ${item}`);
  }
  return lines.join("\n");
}

function renderChebotarevEvidence(chebotarevEvidence) {
  const lines = [];
  const d = chebotarevEvidence.diagnostics;
  lines.push("### Chebotarev Diagnostics");
  lines.push("");
  lines.push("| complete 8M ladder | all within controls | integer within controls | fields within controls | max chi |");
  lines.push("| --- | --- | --- | --- | ---: |");
  lines.push(`| ${d.completeScaleLadder} | ${d.allWithinControls} | ${d.integerWithinControls} | ${d.fieldsWithinControls} | ${fixed(d.maxChi)} |`);
  lines.push("");
  lines.push("### Theorem Shape");
  lines.push("");
  lines.push("| side | object |");
  lines.push("| --- | --- |");
  lines.push(`| Z | ${d.theoremShape.integer.replace(/\|/g, "\\|")} |`);
  lines.push(`| F_q[t] | ${d.theoremShape.functionField.replace(/\|/g, "\\|")} |`);
  lines.push("");
  lines.push("### Integer Rows");
  lines.push("");
  lines.push("| label | labels | split | linear+quad | inert | chi | maxAbsZ |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const row of chebotarevEvidence.integerRows) {
    lines.push(`| ${row.label} | ${row.labels} | ${row.counts.split} | ${row.counts.linearQuad} | ${row.counts.inert} | ${fixed(row.chi)} | ${fixed(row.maxAbsZ)} |`);
  }
  lines.push("");
  lines.push("### Field Endpoints");
  lines.push("");
  lines.push("| q | endpoint | labels | split | linear+quad | inert | chi | maxAbsZ | within controls |");
  lines.push("| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |");
  for (const field of chebotarevEvidence.fields) {
    const row = field.final;
    const summary = d.finalFields.find((item) => item.q === field.q);
    lines.push(`| ${field.q} | ${row.label} | ${row.labels} | ${row.counts.split} | ${row.counts.linearQuad} | ${row.counts.inert} | ${fixed(row.chi)} | ${fixed(row.maxAbsZ)} | ${summary?.withinControls ?? false} |`);
  }
  return lines.join("\n");
}

function renderJointChebotarevEvidence(jointChebotarevEvidence) {
  const lines = [];
  const d = jointChebotarevEvidence.diagnostics;
  lines.push("### Joint Chebotarev Diagnostics");
  lines.push("");
  lines.push("| complete 8M ladder | all within controls | integer within controls | fields within controls | max chi |");
  lines.push("| --- | --- | --- | --- | ---: |");
  lines.push(`| ${d.completeScaleLadder} | ${d.allWithinControls} | ${d.integerWithinControls} | ${d.fieldsWithinControls} | ${fixed(d.maxChi)} |`);
  lines.push("");
  lines.push("### Theorem Shape");
  lines.push("");
  lines.push("| side | object |");
  lines.push("| --- | --- |");
  lines.push(`| Z | ${d.theoremShape.integer.replace(/\|/g, "\\|")} |`);
  lines.push(`| F_q[t] | ${d.theoremShape.functionField.replace(/\|/g, "\\|")} |`);
  lines.push("");
  lines.push("### Integer Rows");
  lines.push("");
  lines.push("| label | labels | split/split | split/inert | inert/split | inert/inert | linear+quad/linear+quad | chi | maxAbsZ |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const row of jointChebotarevEvidence.integerRows) {
    lines.push(`| ${row.label} | ${row.labels} | ${row.counts["split/split"]} | ${row.counts["split/inert"]} | ${row.counts["inert/split"]} | ${row.counts["inert/inert"]} | ${row.counts["linearQuad/linearQuad"]} | ${fixed(row.chi)} | ${fixed(row.maxAbsZ)} |`);
  }
  lines.push("");
  lines.push("### Field Endpoints");
  lines.push("");
  lines.push("| q | endpoint | labels | split/split | split/inert | inert/split | inert/inert | linear+quad/linear+quad | chi | maxAbsZ | within controls |");
  lines.push("| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |");
  for (const field of jointChebotarevEvidence.fields) {
    const row = field.final;
    const summary = d.finalFields.find((item) => item.q === field.q);
    lines.push(`| ${field.q} | ${row.label} | ${row.labels} | ${row.counts["split/split"]} | ${row.counts["split/inert"]} | ${row.counts["inert/split"]} | ${row.counts["inert/inert"]} | ${row.counts["linearQuad/linearQuad"]} | ${fixed(row.chi)} | ${fixed(row.maxAbsZ)} | ${summary?.withinControls ?? false} |`);
  }
  return lines.join("\n");
}

function renderFamilyChebotarevEvidence(familyChebotarevEvidence) {
  const lines = [];
  const d = familyChebotarevEvidence.diagnostics;
  lines.push("### Family Chebotarev Diagnostics");
  lines.push("");
  lines.push("| complete integer ladder | complete q ladders | all within controls | matched control survival | profile spread | max covariance RMS z | max pair abs z |");
  lines.push("| --- | --- | --- | --- | ---: | ---: | ---: |");
  lines.push(`| ${d.completeIntegerLadder} | ${d.completeFieldLadders} | ${d.allWithinControls} | ${d.matchedControlSurvival} | ${fixed(d.profileSpread)} | ${fixed(d.maxCovRmsZ)} | ${fixed(d.maxAbsCovZ)} |`);
  lines.push("");
  lines.push("### Theorem Shape");
  lines.push("");
  lines.push("| part | statement |");
  lines.push("| --- | --- |");
  lines.push(`| statistic | ${d.theoremShape.statistic.replace(/\|/g, "\\|")} |`);
  lines.push(`| Z | ${d.theoremShape.integer.replace(/\|/g, "\\|")} |`);
  lines.push(`| F_q[t] | ${d.theoremShape.functionField.replace(/\|/g, "\\|")} |`);
  lines.push(`| baseline | ${d.theoremShape.baseline.replace(/\|/g, "\\|")} |`);
  lines.push("");
  lines.push("### Integer Ladder");
  lines.push("");
  lines.push("| label | covers | active pairs | min pair labels | covariance RMS z | max pair abs z | within controls |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: | --- |");
  for (const row of familyChebotarevEvidence.integerRows) {
    lines.push(`| ${row.label} | ${row.coverCount} | ${row.activePairCount} | ${row.activePairCount ? row.minPairLabels : "NA"} | ${row.activePairCount ? fixed(row.covRmsZ) : "NA"} | ${row.activePairCount ? fixed(row.maxAbsCovZ) : "NA"} | ${row.withinControls} |`);
  }
  lines.push("");
  lines.push("### Field Endpoints");
  lines.push("");
  lines.push("| q | endpoint | covers | active pairs | min pair labels | covariance RMS z | max pair abs z | within controls |");
  lines.push("| ---: | --- | ---: | ---: | ---: | ---: | ---: | --- |");
  for (const field of familyChebotarevEvidence.fields) {
    const row = field.final;
    lines.push(`| ${field.q} | ${row.label} | ${field.coverCount} | ${row.activePairCount} | ${row.activePairCount ? row.minPairLabels : "NA"} | ${row.activePairCount ? fixed(row.covRmsZ) : "NA"} | ${row.activePairCount ? fixed(row.maxAbsCovZ) : "NA"} | ${row.withinControls} |`);
  }
  lines.push("");
  lines.push("### Top Integer Final Pairs");
  lines.push("");
  lines.push("| A | B | labels | split A | split B | both split | covariance z |");
  lines.push("| --- | --- | ---: | ---: | ---: | ---: | ---: |");
  for (const pair of d.finalInteger.topPairs.slice(0, 8)) {
    lines.push(`| ${pair.a} | ${pair.b} | ${pair.labels} | ${fixed(pair.splitRateA)} | ${fixed(pair.splitRateB)} | ${fixed(pair.bothRate)} | ${fixed(pair.covZ)} |`);
  }
  return lines.join("\n");
}

function renderWeierstrassTraceEvidence(weierstrassTraceEvidence) {
  const lines = [];
  const d = weierstrassTraceEvidence.diagnostics;
  lines.push("### Weierstrass Trace Diagnostics");
  lines.push("");
  lines.push("| complete integer ladder | complete q ladders | validation passed | all residuals zero | absorbed by exact identity | max residual z | max wrong-baseline z |");
  lines.push("| --- | --- | --- | --- | --- | ---: | ---: |");
  lines.push(`| ${d.completeIntegerLadder} | ${d.completeFieldLadders} | ${d.validationPassed} | ${d.allResidualsZero} | ${d.absorbedByExactIdentity} | ${fixed(d.maxAbsResidualZ)} | ${fixed(d.maxWrongBaselineZ)} |`);
  lines.push("");
  lines.push("### Theorem Shape");
  lines.push("");
  lines.push("| part | statement |");
  lines.push("| --- | --- |");
  lines.push(`| statistic | ${d.theoremShape.statistic.replace(/\|/g, "\\|")} |`);
  lines.push(`| Z | ${d.theoremShape.integer.replace(/\|/g, "\\|")} |`);
  lines.push(`| F_q[t] | ${d.theoremShape.functionField.replace(/\|/g, "\\|")} |`);
  lines.push(`| exact identity | ${d.theoremShape.exactIdentity.replace(/\|/g, "\\|")} |`);
  lines.push("");
  lines.push("### Integer Ladder");
  lines.push("");
  lines.push("| label | labels | raw T(K) | exact main | residual z | wrong zero-baseline z |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: |");
  for (const row of weierstrassTraceEvidence.integerRows) {
    lines.push(`| ${row.label} | ${row.labels} | ${fixed(row.rawMeanTracePerFieldSize)} | ${fixed(row.exactMain)} | ${fixed(row.residualZ)} | ${fixed(row.wrongZeroBaselineZ)} |`);
  }
  lines.push("");
  lines.push("### Field Endpoints");
  lines.push("");
  lines.push("| q | endpoint | labels | raw T(K) | exact main | residual z | wrong zero-baseline z |");
  lines.push("| ---: | --- | ---: | ---: | ---: | ---: | ---: |");
  for (const field of weierstrassTraceEvidence.fields) {
    const row = field.final;
    lines.push(`| ${field.q} | ${row.label} | ${row.labels} | ${fixed(row.rawMeanTracePerFieldSize)} | ${fixed(row.exactMain)} | ${fixed(row.residualZ)} | ${fixed(row.wrongZeroBaselineZ)} |`);
  }
  lines.push("");
  lines.push("### Brute Validation");
  lines.push("");
  lines.push("| side | field | trace sum | expected | ok |");
  lines.push("| --- | --- | ---: | ---: | --- |");
  for (const row of weierstrassTraceEvidence.validation.primeChecks) {
    lines.push(`| Z | F_${row.p} | ${row.traceSum} | ${row.expectedTraceSum} | ${row.ok} |`);
  }
  for (const row of weierstrassTraceEvidence.validation.fieldChecks) {
    lines.push(`| F_q[t] | F_${row.q}^${row.degree} | ${row.traceSum} | ${row.expectedTraceSum} | ${row.ok} |`);
  }
  return lines.join("\n");
}

function renderWeierstrassSecondMomentEvidence(weierstrassSecondMomentEvidence) {
  const lines = [];
  const d = weierstrassSecondMomentEvidence.diagnostics;
  lines.push("### Weierstrass Second-Moment Diagnostics");
  lines.push("");
  lines.push("| complete integer ladder | complete q ladders | validation passed | exact residuals zero | absorbed by exact moment | max exact residual z | max ST-baseline residual z |");
  lines.push("| --- | --- | --- | --- | --- | ---: | ---: |");
  lines.push(`| ${d.completeIntegerLadder} | ${d.completeFieldLadders} | ${d.validationPassed} | ${d.allExactResidualsZero} | ${d.absorbedByExactSecondMoment} | ${fixed(d.maxAbsExactResidualZ)} | ${fixed(d.maxAbsStResidualZ)} |`);
  lines.push("");
  lines.push("### Theorem Shape");
  lines.push("");
  lines.push("| part | statement |");
  lines.push("| --- | --- |");
  lines.push(`| statistic | ${d.theoremShape.statistic.replace(/\|/g, "\\|")} |`);
  lines.push(`| Z | ${d.theoremShape.integer.replace(/\|/g, "\\|")} |`);
  lines.push(`| F_q[t] | ${d.theoremShape.functionField.replace(/\|/g, "\\|")} |`);
  lines.push(`| exact identity | ${d.theoremShape.exactIdentity.replace(/\|/g, "\\|")} |`);
  lines.push("");
  lines.push("### Integer Ladder");
  lines.push("");
  lines.push("| label | labels | mean ST residual | ST residual z | ST energy z | exact residual z |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: |");
  for (const row of weierstrassSecondMomentEvidence.integerRows) {
    lines.push(`| ${row.label} | ${row.labels} | ${fixed(row.meanStResidual, 9)} | ${fixed(row.stResidualZ, 9)} | ${fixed(row.stEnergyZ)} | ${fixed(row.exactResidualZ)} |`);
  }
  lines.push("");
  lines.push("### Field Endpoints");
  lines.push("");
  lines.push("| q | endpoint | cumulative labels | endpoint labels | ST residual z | ST energy z | exact residual z |");
  lines.push("| ---: | --- | ---: | ---: | ---: | ---: | ---: |");
  for (const field of weierstrassSecondMomentEvidence.fields) {
    const row = field.final;
    lines.push(`| ${field.q} | ${row.label} | ${row.cumulativeLabels} | ${row.labels} | ${fixed(row.stResidualZ, 9)} | ${fixed(row.stEnergyZ)} | ${fixed(row.exactResidualZ)} |`);
  }
  lines.push("");
  lines.push("### Brute Validation");
  lines.push("");
  lines.push("| p | formula good count | brute good count | formula singular square sum | brute singular square sum | formula good M2 | brute good M2 | ok |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |");
  for (const row of weierstrassSecondMomentEvidence.validation) {
    lines.push(`| ${row.p} | ${row.formulaGoodCount} | ${row.bruteGoodCount} | ${row.formulaSingularTraceSquareSum} | ${row.bruteSingularTraceSquareSum} | ${row.formulaGoodSecondMoment} | ${row.bruteGoodSecondMoment} | ${row.ok} |`);
  }
  return lines.join("\n");
}

function renderCmEllipticEvidence(cmEllipticEvidence) {
  const lines = [];
  const d = cmEllipticEvidence.diagnostics;
  lines.push("### CM Elliptic Diagnostics");
  lines.push("");
  lines.push("| complete integer ladder | complete q ladders | validation passed | integer beats controls | field signs aligned | profile spread | matched profile | max endpoint |z| |");
  lines.push("| --- | --- | --- | --- | --- | ---: | --- | ---: |");
  lines.push(`| ${d.completeIntegerLadder} | ${d.completeFieldLadders} | ${d.validationPassed} | ${d.integerBeatsControls} | ${d.fieldSignsAligned} | ${fixed(d.fieldIntegerZSpread)} | ${d.matchedProfile} | ${fixed(d.maxAbsEndpointZ)} |`);
  lines.push("");
  lines.push("### Theorem Shape");
  lines.push("");
  lines.push("| part | statement |");
  lines.push("| --- | --- |");
  lines.push(`| statistic | ${d.theoremShape.statistic.replace(/\|/g, "\\|")} |`);
  lines.push(`| Z | ${d.theoremShape.integer.replace(/\|/g, "\\|")} |`);
  lines.push(`| F_q[t] | ${d.theoremShape.functionField.replace(/\|/g, "\\|")} |`);
  lines.push(`| baseline | ${d.theoremShape.baseline.replace(/\|/g, "\\|")} |`);
  lines.push("");
  lines.push("### Integer Ladder");
  lines.push("");
  lines.push("| endpoint | labels | mean u2 | z | energy z | max abs z |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: |");
  for (const row of cmEllipticEvidence.integerRows) {
    lines.push(`| ${row.endpoint} | ${row.count} | ${fixed(row.mean)} | ${fixed(row.z)} | ${fixed(row.energyZ)} | ${fixed(row.maxAbsZ)} |`);
  }
  lines.push("");
  lines.push("### Integer Controls");
  lines.push("");
  lines.push("| control | final abs z range | max abs z range | energy z range |");
  lines.push("| --- | ---: | ---: | ---: |");
  for (const [name, row] of Object.entries(cmEllipticEvidence.controlSummary)) {
    lines.push(`| ${name} | ${fixed(row.absZRange[0])}..${fixed(row.absZRange[1])} | ${fixed(row.maxAbsZRange[0])}..${fixed(row.maxAbsZRange[1])} | ${fixed(row.energyZRange[0])}..${fixed(row.energyZRange[1])} |`);
  }
  lines.push("");
  lines.push("### Field Endpoints");
  lines.push("");
  lines.push("| q | endpoint | cumulative labels | trace | u2 | z | energy z | max abs z |");
  lines.push("| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const field of cmEllipticEvidence.fields) {
    const row = field.final;
    lines.push(`| ${field.q} | ${row.label} | ${row.cumulativeLabels} | ${row.trace} | ${fixed(row.u2)} | ${fixed(row.z)} | ${fixed(row.energyZ)} | ${fixed(row.maxAbsZ)} |`);
  }
  lines.push("");
  lines.push("### Trace Validation");
  lines.push("");
  lines.push("| p | formula trace | brute trace | ok |");
  lines.push("| ---: | ---: | ---: | --- |");
  for (const row of cmEllipticEvidence.validation) {
    lines.push(`| ${row.p} | ${row.formulaTrace} | ${row.bruteTrace} | ${row.ok} |`);
  }
  return lines.join("\n");
}

function renderQuadraticTwistCmEvidence(quadraticTwistCmEvidence) {
  const lines = [];
  const d = quadraticTwistCmEvidence.diagnostics;
  lines.push("### Quadratic-Twist CM Diagnostics");
  lines.push("");
  lines.push("| complete integer ladder | complete q ladders | validation passed | integer beats controls | signs aligned | profile spread | matched profile | max endpoint |z| |");
  lines.push("| --- | --- | --- | --- | --- | ---: | --- | ---: |");
  lines.push(`| ${d.completeIntegerLadder} | ${d.completeFieldLadders} | ${d.validationPassed} | ${d.integerBeatsControls} | ${d.signsAligned} | ${fixed(d.profileSpread)} | ${d.matchedProfile} | ${fixed(d.maxAbsEndpointZ)} |`);
  lines.push("");
  lines.push("### Theorem Shape");
  lines.push("");
  lines.push("| part | statement |");
  lines.push("| --- | --- |");
  lines.push(`| statistic | ${d.theoremShape.statistic.replace(/\|/g, "\\|")} |`);
  lines.push(`| Z | ${d.theoremShape.integer.replace(/\|/g, "\\|")} |`);
  lines.push(`| F_q[t] | ${d.theoremShape.functionField.replace(/\|/g, "\\|")} |`);
  lines.push(`| baseline | ${d.theoremShape.baseline.replace(/\|/g, "\\|")} |`);
  lines.push("");
  lines.push("### Integer Ladder");
  lines.push("");
  lines.push("| endpoint | labels | mean V | z | energy z | max abs z |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: |");
  for (const row of quadraticTwistCmEvidence.integerRows) {
    lines.push(`| ${row.endpoint} | ${row.count} | ${fixed(row.mean)} | ${fixed(row.z)} | ${fixed(row.energyZ)} | ${fixed(row.maxAbsZ)} |`);
  }
  lines.push("");
  lines.push("### Integer Controls");
  lines.push("");
  lines.push("| control | final abs z range | max abs z range | energy z range |");
  lines.push("| --- | ---: | ---: | ---: |");
  for (const [name, row] of Object.entries(quadraticTwistCmEvidence.controlSummary)) {
    lines.push(`| ${name} | ${fixed(row.absZRange[0])}..${fixed(row.absZRange[1])} | ${fixed(row.maxAbsZRange[0])}..${fixed(row.maxAbsZRange[1])} | ${fixed(row.energyZRange[0])}..${fixed(row.energyZRange[1])} |`);
  }
  lines.push("");
  lines.push("### Field Endpoints");
  lines.push("");
  lines.push("| q | endpoint | labels | cumulative labels | degree mean V | z | energy z | max abs z |");
  lines.push("| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const field of quadraticTwistCmEvidence.fields) {
    const row = field.final;
    lines.push(`| ${field.q} | ${row.label} | ${row.labels} | ${row.cumulativeLabels} | ${fixed(row.degreeMean)} | ${fixed(row.z)} | ${fixed(row.energyZ)} | ${fixed(row.maxAbsZ)} |`);
  }
  lines.push("");
  lines.push("### Trace Validation");
  lines.push("");
  lines.push("| p | formula trace | brute trace | ok |");
  lines.push("| ---: | ---: | ---: | --- |");
  for (const row of quadraticTwistCmEvidence.validation) {
    lines.push(`| ${row.p} | ${row.formulaTrace} | ${row.bruteTrace} | ${row.ok} |`);
  }
  return lines.join("\n");
}

function renderNonCmLegendreEvidence(nonCmLegendreEvidence) {
  const lines = [];
  const d = nonCmLegendreEvidence.diagnostics;
  lines.push("### Non-CM Legendre Diagnostics");
  lines.push("");
  lines.push("| required integer ladder | complete q ladders | validation passed | integer beats controls | signs aligned | profile spread | matched profile | max endpoint |z| |");
  lines.push("| --- | --- | --- | --- | --- | ---: | --- | ---: |");
  lines.push(`| ${d.hasRequiredIntegerScaleLadder} | ${d.completeFieldLadders} | ${d.validationPassed} | ${d.integerBeatsControls} | ${d.signsAligned} | ${fixed(d.profileSpread)} | ${d.matchedProfile} | ${fixed(d.maxAbsEndpointZ)} |`);
  lines.push("");
  lines.push("### Theorem Shape");
  lines.push("");
  lines.push("| part | statement |");
  lines.push("| --- | --- |");
  lines.push(`| statistic | ${d.theoremShape.statistic.replace(/\|/g, "\\|")} |`);
  lines.push(`| Z | ${d.theoremShape.integer.replace(/\|/g, "\\|")} |`);
  lines.push(`| F_q[t] | ${d.theoremShape.functionField.replace(/\|/g, "\\|")} |`);
  lines.push(`| baseline | ${d.theoremShape.baseline.replace(/\|/g, "\\|")} |`);
  lines.push("");
  lines.push("### Integer Pilot Ladder");
  lines.push("");
  lines.push("| endpoint | labels | mean V | z | energy z | max abs z |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: |");
  for (const row of nonCmLegendreEvidence.integerRows) {
    lines.push(`| ${row.endpoint} | ${row.count} | ${fixed(row.mean)} | ${fixed(row.z)} | ${fixed(row.energyZ)} | ${fixed(row.maxAbsZ)} |`);
  }
  lines.push("");
  lines.push("### Integer Controls");
  lines.push("");
  lines.push("| control | final abs z range | max abs z range | energy z range |");
  lines.push("| --- | ---: | ---: | ---: |");
  for (const [name, row] of Object.entries(nonCmLegendreEvidence.controlSummary)) {
    lines.push(`| ${name} | ${fixed(row.absZRange[0])}..${fixed(row.absZRange[1])} | ${fixed(row.maxAbsZRange[0])}..${fixed(row.maxAbsZRange[1])} | ${fixed(row.energyZRange[0])}..${fixed(row.energyZRange[1])} |`);
  }
  lines.push("");
  lines.push("### Field Endpoints");
  lines.push("");
  lines.push("| q | endpoint | labels | cumulative labels | degree mean V | z | energy z | max abs z |");
  lines.push("| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const field of nonCmLegendreEvidence.fields) {
    const row = field.final;
    lines.push(`| ${field.q} | ${row.label} | ${row.labels} | ${row.cumulativeLabels} | ${fixed(row.degreeMean)} | ${fixed(row.z)} | ${fixed(row.energyZ)} | ${fixed(row.maxAbsZ)} |`);
  }
  lines.push("");
  lines.push("### Point-Count Validation");
  lines.push("");
  lines.push("| p | lambda | trace | point count | ok |");
  lines.push("| ---: | ---: | ---: | ---: | --- |");
  for (const row of nonCmLegendreEvidence.validation) {
    lines.push(`| ${row.p} | ${row.lambda} | ${row.trace} | ${row.pointCount} | ${row.ok} |`);
  }
  return lines.join("\n");
}

function renderLegendreSpecialSupersingularEvidence(legendreSpecialSupersingularEvidence) {
  const lines = [];
  const d = legendreSpecialSupersingularEvidence.diagnostics;
  lines.push("### Legendre Special Supersingular Diagnostics");
  lines.push("");
  lines.push("| complete integer ladder | complete q ladders | validation passed | local control explains | integer beats controls | signs aligned | profile spread | matched profile | max endpoint |z| |");
  lines.push("| --- | --- | --- | --- | --- | --- | ---: | --- | ---: |");
  lines.push(`| ${d.completeIntegerLadder} | ${d.completeFieldLadders} | ${d.validationPassed} | ${d.localControlExplains} | ${d.integerBeatsControls} | ${d.signsAligned} | ${fixed(d.profileSpread)} | ${d.matchedProfile} | ${fixed(d.maxAbsEndpointZ)} |`);
  lines.push("");
  lines.push("### Theorem Shape");
  lines.push("");
  lines.push("| part | statement |");
  lines.push("| --- | --- |");
  lines.push(`| statistic | ${d.theoremShape.statistic.replace(/\|/g, "\\|")} |`);
  lines.push(`| Z | ${d.theoremShape.integer.replace(/\|/g, "\\|")} |`);
  lines.push(`| F_q[t] | ${d.theoremShape.functionField.replace(/\|/g, "\\|")} |`);
  lines.push(`| baseline | ${d.theoremShape.baseline.replace(/\|/g, "\\|")} |`);
  lines.push("");
  lines.push("### Integer Ladder");
  lines.push("");
  lines.push("| endpoint | labels | mean residual | z | energy z | max abs z |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: |");
  for (const row of legendreSpecialSupersingularEvidence.integerRows) {
    lines.push(`| ${row.endpoint} | ${row.count} | ${fixed(row.mean)} | ${fixed(row.z)} | ${fixed(row.energyZ)} | ${fixed(row.maxAbsZ)} |`);
  }
  lines.push("");
  lines.push("### Integer Controls");
  lines.push("");
  lines.push("| control | final abs z range | max abs z range | energy z range |");
  lines.push("| --- | ---: | ---: | ---: |");
  for (const [name, row] of Object.entries(legendreSpecialSupersingularEvidence.controlSummary)) {
    lines.push(`| ${name} | ${fixed(row.absZRange[0])}..${fixed(row.absZRange[1])} | ${fixed(row.maxAbsZRange[0])}..${fixed(row.maxAbsZRange[1])} | ${fixed(row.energyZRange[0])}..${fixed(row.energyZRange[1])} |`);
  }
  lines.push("");
  lines.push("### Field Endpoints");
  lines.push("");
  lines.push("| q | endpoint | labels | cumulative labels | B(K) | residual | z | energy z | max abs z |");
  lines.push("| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const field of legendreSpecialSupersingularEvidence.fields) {
    const row = field.final;
    lines.push(`| ${field.q} | ${row.label} | ${row.labels} | ${row.cumulativeLabels} | ${row.specialCount} | ${fixed(row.value)} | ${fixed(row.z)} | ${fixed(row.energyZ)} | ${fixed(row.maxAbsZ)} |`);
  }
  lines.push("");
  lines.push("### Deuring Validation");
  lines.push("");
  lines.push("| p | p mod 4 | special lambdas | Deuring supersingular lambdas | formula count | ok |");
  lines.push("| ---: | ---: | --- | --- | ---: | --- |");
  for (const row of legendreSpecialSupersingularEvidence.validation) {
    lines.push(`| ${row.p} | ${row.pMod4} | ${row.specialLambdas.join(",")} | ${row.deuringSupersingular.join(",")} | ${row.formulaCount} | ${row.ok} |`);
  }
  return lines.join("\n");
}

function renderGenericNonCmObstructionEvidence(genericNonCmObstructionEvidence) {
  const lines = [];
  const d = genericNonCmObstructionEvidence.diagnostics;
  lines.push("### Generic Non-CM Obstruction Diagnostics");
  lines.push("");
  lines.push("| classes | eligible | exact/reducible baselines | full integer implementations | nonzero residuals named | branch decision |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | --- |");
  lines.push(`| ${d.classCount} | ${d.experimentEligibleCount} | ${d.exactOrReducibleBaselineCount} | ${d.fullIntegerImplementationCount} | ${d.nonzeroResidualNamedCount} | ${d.branchDecision} |`);
  lines.push("");
  lines.push("### Registration Requirements");
  lines.push("");
  lines.push("| id | rule |");
  lines.push("| --- | --- |");
  for (const requirement of genericNonCmObstructionEvidence.requirements) {
    lines.push(`| ${requirement.id} | ${requirement.rule.replace(/\|/g, "\\|")} |`);
  }
  lines.push("");
  lines.push("### Candidate Class Screen");
  lines.push("");
  lines.push("| class | eligible | finite-field baseline | integer 8M status | blocker | required mutation |");
  lines.push("| --- | --- | --- | --- | --- | --- |");
  for (const item of genericNonCmObstructionEvidence.classes) {
    lines.push(`| ${item.id} | ${item.experimentEligible} | ${item.exactFiniteFieldBaseline.replace(/\|/g, "\\|")} | ${item.integer8mStatus.replace(/\|/g, "\\|")} | ${item.blocker.replace(/\|/g, "\\|")} | ${item.requiredMutation.replace(/\|/g, "\\|")} |`);
  }
  lines.push("");
  lines.push("### Next Required Artifact");
  lines.push("");
  lines.push(d.nextRequiredArtifact);
  return lines.join("\n");
}

function renderQuadraticDirichletEvidence(quadraticDirichletEvidence) {
  const lines = [];
  const d = quadraticDirichletEvidence.diagnostics;
  lines.push("### Quadratic Dirichlet Diagnostics");
  lines.push("");
  lines.push("| complete integer ladder | complete q ladders | validation passed | integer beats controls | signs aligned | profile spread | matched profile | max endpoint |z| |");
  lines.push("| --- | --- | --- | --- | --- | ---: | --- | ---: |");
  lines.push(`| ${d.completeIntegerLadder} | ${d.completeFieldLadders} | ${d.validationPassed} | ${d.integerBeatsControls} | ${d.signsAligned} | ${fixed(d.profileSpread)} | ${d.matchedProfile} | ${fixed(d.maxAbsEndpointZ)} |`);
  lines.push("");
  lines.push("### Theorem Shape");
  lines.push("");
  lines.push("| part | statement |");
  lines.push("| --- | --- |");
  lines.push(`| statistic | ${d.theoremShape.statistic.replace(/\|/g, "\\|")} |`);
  lines.push(`| Z | ${d.theoremShape.integer.replace(/\|/g, "\\|")} |`);
  lines.push(`| F_q[t] | ${d.theoremShape.functionField.replace(/\|/g, "\\|")} |`);
  lines.push(`| baseline | ${d.theoremShape.baseline.replace(/\|/g, "\\|")} |`);
  lines.push("");
  lines.push("### Integer Ladder");
  lines.push("");
  lines.push("| endpoint | labels | sum chi | mean chi | z | energy z | max abs z |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const row of quadraticDirichletEvidence.integerRows) {
    lines.push(`| ${row.endpoint} | ${row.count} | ${row.sum} | ${fixed(row.mean)} | ${fixed(row.z)} | ${fixed(row.energyZ)} | ${fixed(row.maxAbsZ)} |`);
  }
  lines.push("");
  lines.push("### Integer Controls");
  lines.push("");
  lines.push("| control | final abs z range | max abs z range | energy z range |");
  lines.push("| --- | ---: | ---: | ---: |");
  for (const [name, row] of Object.entries(quadraticDirichletEvidence.controlSummary)) {
    lines.push(`| ${name} | ${fixed(row.absZRange[0])}..${fixed(row.absZRange[1])} | ${fixed(row.maxAbsZRange[0])}..${fixed(row.maxAbsZRange[1])} | ${fixed(row.energyZRange[0])}..${fixed(row.energyZRange[1])} |`);
  }
  lines.push("");
  lines.push("### Field Endpoints");
  lines.push("");
  lines.push("| q | modulus | endpoint | labels | cumulative labels | degree sum chi | degree mean chi | z | energy z | max abs z |");
  lines.push("| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const field of quadraticDirichletEvidence.fields) {
    const row = field.final;
    lines.push(`| ${field.q} | ${field.modulus} | ${row.label} | ${row.labels} | ${row.cumulativeLabels} | ${row.degreeSum} | ${fixed(row.degreeMean)} | ${fixed(row.z)} | ${fixed(row.energyZ)} | ${fixed(row.maxAbsZ)} |`);
  }
  lines.push("");
  lines.push("### Character Validation");
  lines.push("");
  lines.push("| side | item | ok |");
  lines.push("| --- | --- | --- |");
  for (const row of quadraticDirichletEvidence.integerValidation.slice(0, 8)) {
    lines.push(`| Z | p=${row.p}, residue=${row.residue}, chi=${row.chi}, Euler=${row.euler} | ${row.ok} |`);
  }
  for (const field of quadraticDirichletEvidence.fieldValidation) {
    for (const row of field.rows.slice(0, 2)) {
      lines.push(`| F_${field.q}[t] | modulus=${field.modulus}, residue=${row.residue}, chi=${row.chi}, chi(square)=${row.chiSquare} | ${row.ok} |`);
    }
  }
  return lines.join("\n");
}

function renderMarkdown(audit) {
  const lines = [];
  lines.push(`# Two-Universes Breakthrough Protocol - Cycle ${String(audit.cycle).padStart(3, "0")}`);
  lines.push("");
  lines.push(`Generated: ${audit.generatedAt}`);
  lines.push("");
  lines.push(`Candidate: **${audit.candidate.title}**`);
  lines.push("");
  lines.push(`Decision: **${audit.decision.status}**`);
  lines.push("");
  lines.push(audit.decision.reason);
  lines.push("");
  lines.push("## Promotion Gates");
  lines.push("");
  lines.push(renderGateTable(audit));
  lines.push("");
  if (audit.finiteFieldEvidence) {
    lines.push("## Finite-Field Evidence Rows");
    lines.push("");
    lines.push(renderRows(audit.finiteFieldEvidence.holdoutRows));
    lines.push("");
  }
  if (audit.graphEvidence) {
    lines.push("## Graph Evidence");
    lines.push("");
    lines.push(renderGraphEvidence(audit.graphEvidence));
    lines.push("");
  }
  if (audit.centeredEvidence) {
    lines.push("## Centered Tensor Evidence");
    lines.push("");
    lines.push(renderCenteredEvidence(audit.centeredEvidence));
    lines.push("");
  }
  if (audit.localStateEvidence) {
    lines.push("## Local-State Tensor Evidence");
    lines.push("");
    lines.push(renderLocalStateEvidence(audit.localStateEvidence));
    lines.push("");
  }
  if (audit.exactAdmissibilityEvidence) {
    lines.push("## Exact-Admissibility Tensor Evidence");
    lines.push("");
    lines.push(renderExactAdmissibilityEvidence(audit.exactAdmissibilityEvidence));
    lines.push("");
  }
  if (audit.signedProfileEvidence) {
    lines.push("## Signed Profile Evidence");
    lines.push("");
    lines.push(renderSignedProfileEvidence(audit.signedProfileEvidence));
    lines.push("");
  }
  if (audit.quotientSpectralEvidence) {
    lines.push("## Quotient Spectral Evidence");
    lines.push("");
    lines.push(renderQuotientSpectralEvidence(audit.quotientSpectralEvidence));
    lines.push("");
  }
  if (audit.mobiusLiouvilleEvidence) {
    lines.push("## Mobius/Liouville Evidence");
    lines.push("");
    lines.push(renderMobiusLiouvilleEvidence(audit.mobiusLiouvilleEvidence));
    lines.push("");
  }
  if (audit.theoremCatalogEvidence) {
    lines.push("## Theorem Catalog Evidence");
    lines.push("");
    lines.push(renderTheoremCatalogEvidence(audit.theoremCatalogEvidence));
    lines.push("");
  }
  if (audit.proofObligationEvidence) {
    lines.push("## Proof-Obligation Evidence");
    lines.push("");
    lines.push(renderProofObligationEvidence(audit.proofObligationEvidence));
    lines.push("");
  }
  if (audit.obstructionTransportEvidence) {
    lines.push("## Obstruction Transport Evidence");
    lines.push("");
    lines.push(renderObstructionTransportEvidence(audit.obstructionTransportEvidence));
    lines.push("");
  }
  if (audit.branchStopEvidence) {
    lines.push("## Branch-Stop Evidence");
    lines.push("");
    lines.push(renderBranchStopEvidence(audit.branchStopEvidence));
    lines.push("");
  }
  if (audit.chebotarevEvidence) {
    lines.push("## Chebotarev Evidence");
    lines.push("");
    lines.push(renderChebotarevEvidence(audit.chebotarevEvidence));
    lines.push("");
  }
  if (audit.jointChebotarevEvidence) {
    lines.push("## Joint Chebotarev Evidence");
    lines.push("");
    lines.push(renderJointChebotarevEvidence(audit.jointChebotarevEvidence));
    lines.push("");
  }
  if (audit.familyChebotarevEvidence) {
    lines.push("## Family Chebotarev Evidence");
    lines.push("");
    lines.push(renderFamilyChebotarevEvidence(audit.familyChebotarevEvidence));
    lines.push("");
  }
  if (audit.weierstrassTraceEvidence) {
    lines.push("## Weierstrass Trace Evidence");
    lines.push("");
    lines.push(renderWeierstrassTraceEvidence(audit.weierstrassTraceEvidence));
    lines.push("");
  }
  if (audit.weierstrassSecondMomentEvidence) {
    lines.push("## Weierstrass Second-Moment Evidence");
    lines.push("");
    lines.push(renderWeierstrassSecondMomentEvidence(audit.weierstrassSecondMomentEvidence));
    lines.push("");
  }
  if (audit.cmEllipticEvidence) {
    lines.push("## CM Elliptic Evidence");
    lines.push("");
    lines.push(renderCmEllipticEvidence(audit.cmEllipticEvidence));
    lines.push("");
  }
  if (audit.quadraticTwistCmEvidence) {
    lines.push("## Quadratic-Twist CM Evidence");
    lines.push("");
    lines.push(renderQuadraticTwistCmEvidence(audit.quadraticTwistCmEvidence));
    lines.push("");
  }
  if (audit.nonCmLegendreEvidence) {
    lines.push("## Non-CM Legendre Evidence");
    lines.push("");
    lines.push(renderNonCmLegendreEvidence(audit.nonCmLegendreEvidence));
    lines.push("");
  }
  if (audit.legendreSpecialSupersingularEvidence) {
    lines.push("## Legendre Special Supersingular Evidence");
    lines.push("");
    lines.push(renderLegendreSpecialSupersingularEvidence(audit.legendreSpecialSupersingularEvidence));
    lines.push("");
  }
  if (audit.genericNonCmObstructionEvidence) {
    lines.push("## Generic Non-CM Obstruction Evidence");
    lines.push("");
    lines.push(renderGenericNonCmObstructionEvidence(audit.genericNonCmObstructionEvidence));
    lines.push("");
  }
  if (audit.quadraticDirichletEvidence) {
    lines.push("## Quadratic Dirichlet Evidence");
    lines.push("");
    lines.push(renderQuadraticDirichletEvidence(audit.quadraticDirichletEvidence));
    lines.push("");
  }
  lines.push("## Surprise Ledger");
  lines.push("");
  for (const [key, value] of Object.entries(audit.surpriseLedger)) {
    lines.push(`- **${key}**: ${Array.isArray(value) ? value.join("; ") : value}`);
  }
  lines.push("");
  lines.push("## Forced Representation Mutation");
  lines.push("");
  lines.push(`Mutation: **${audit.nextMutation.title}**`);
  lines.push("");
  lines.push(audit.nextMutation.reason);
  lines.push("");
  lines.push("Preregistered next move:");
  lines.push("");
  for (const item of audit.nextMutation.preregisteredNextMove) lines.push(`- ${item}`);
  lines.push("");
  lines.push("## Artifact Inventory");
  lines.push("");
  for (const file of audit.candidate.evidenceFiles) {
    lines.push(`- ${exists(file) ? "present" : "missing"}: \`${file}\``);
  }
  lines.push("");
  return `${lines.join("\n")}\n`;
}

if (![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].includes(cycle)) {
  console.error("Only cycles 1 through 23 are implemented by this protocol runner so far.");
  process.exitCode = 2;
} else {
  fs.mkdirSync(outDir, { recursive: true });
  const audit = cycle === 1
    ? auditCycle1()
    : cycle === 2
      ? auditCycle2()
      : cycle === 3
        ? auditCycle3()
        : cycle === 4
          ? auditCycle4()
          : cycle === 5
            ? auditCycle5()
            : cycle === 6
              ? auditCycle6()
              : cycle === 7
                ? auditCycle7()
                : cycle === 8
                  ? auditCycle8()
                  : cycle === 9
                    ? auditCycle9()
                    : cycle === 10
                      ? auditCycle10()
                      : cycle === 11
                        ? auditCycle11()
                        : cycle === 12
                          ? auditCycle12()
                          : cycle === 13
                            ? auditCycle13()
                            : cycle === 14
                              ? auditCycle14()
                              : cycle === 15
                                ? auditCycle15()
                                : cycle === 16
                                  ? auditCycle16()
                                  : cycle === 17
                                    ? auditCycle17()
                                  : cycle === 18
                                    ? auditCycle18()
                                    : cycle === 19
                                      ? auditCycle19()
                                    : cycle === 20
                                      ? auditCycle20()
                                    : cycle === 21
                                      ? auditCycle21()
                                    : cycle === 22
                                      ? auditCycle22()
                                      : auditCycle23();
  const base = cycle === 1
    ? path.join(outDir, "cycle-001-mobius-gap-cross-q-protocol")
    : cycle === 2
      ? path.join(outDir, "cycle-002-fixed-shift-graph-degree-protocol")
      : cycle === 3
        ? path.join(outDir, "cycle-003-centered-shift-tensor-protocol")
        : cycle === 4
          ? path.join(outDir, "cycle-004-local-state-centered-tensor-protocol")
          : cycle === 5
            ? path.join(outDir, "cycle-005-exact-admissibility-tensor-protocol")
            : cycle === 6
              ? path.join(outDir, "cycle-006-signed-profile-decay-protocol")
              : cycle === 7
                ? path.join(outDir, "cycle-007-quotient-spectral-residual-protocol")
                : cycle === 8
                  ? path.join(outDir, "cycle-008-mobius-liouville-correlation-protocol")
                  : cycle === 9
                    ? path.join(outDir, "cycle-009-theorem-first-finite-field-catalog-protocol")
                    : cycle === 10
                      ? path.join(outDir, "cycle-010-proof-obligation-map-protocol")
                      : cycle === 11
                        ? path.join(outDir, "cycle-011-obstruction-class-transport-map-protocol")
                        : cycle === 12
                          ? path.join(outDir, "cycle-012-branch-stop-ledger-protocol")
                        : cycle === 13
                          ? path.join(outDir, "cycle-013-cubic-chebotarev-transport-protocol")
                          : cycle === 14
                            ? path.join(outDir, "cycle-014-joint-cubic-chebotarev-residual-protocol")
                            : cycle === 15
                              ? path.join(outDir, "cycle-015-family-cubic-chebotarev-covariance-protocol")
                              : cycle === 16
                                ? path.join(outDir, "cycle-016-complete-weierstrass-trace-identity-protocol")
                                : cycle === 17
                                  ? path.join(outDir, "cycle-017-complete-weierstrass-second-moment-protocol")
                                  : cycle === 18
                                    ? path.join(outDir, "cycle-018-cm-elliptic-spectral-residual-protocol")
                                    : cycle === 19
                                      ? path.join(outDir, "cycle-019-quadratic-twist-cm-family-protocol")
                                    : cycle === 20
                                      ? path.join(outDir, "cycle-020-noncm-legendre-family-pilot-protocol")
                                    : cycle === 21
                                      ? path.join(outDir, "cycle-021-legendre-special-supersingular-residual-protocol")
                                    : cycle === 22
                                      ? path.join(outDir, "cycle-022-generic-noncm-residual-obstruction-map-protocol")
                                      : path.join(outDir, "cycle-023-quadratic-dirichlet-prime-race-protocol");
  const jsonFile = `${base}.json`;
  const mdFile = `${base}.md`;
  fs.writeFileSync(jsonFile, JSON.stringify(audit, null, 2));
  fs.writeFileSync(mdFile, renderMarkdown(audit));
  console.log(JSON.stringify({
    ok: true,
    promoted: audit.decision.promoted,
    status: audit.decision.status,
    jsonFile,
    mdFile,
  }, null, 2));
}
