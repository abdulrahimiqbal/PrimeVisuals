# 2026-07-02 — Track Q executed: the quantum-probability placement (Q1+Q2)

Program: COUNCIL3.md; prompt: prompts/quantum-probability.md. Script:
`scripts/quantum-placement.mjs`. Artifacts:
`logs/quantum-placement-artifacts/` (`placement-N100000000.json` main run,
`placement-N10000000.json` small-ensemble smoke replication,
`placement-panel.svg`).

Question: where does the real Mertens walk `W(u) = M(e^u)/e^{u/2}` sit
between **Model Z** (spectral rigidity: almost-periodic zero sums,
amplitude ladder `r_k = 1/(|ρ_k||ζ′(ρ_k)|)` computed from the bundled
267 zeros — the ladder verified against the real walk on 07-02 —
with LI-random phases) and **Model C** (critical multiplicative chaos:
random completely multiplicative ±1 on squarefree support — Harper's
universality class)?

Method (predeclared in the script, per COUNCIL3's trap rule): shape at
fixed N against exactly simulated ensembles; grid 8192 log-samples on
[10^4, 10^8]; main run 200 Z-draws, 60 C-seeds; consistency = |z| ≤ 2.5
ensemble-sd; a statistic discriminates iff the ensembles separate by
≥ 3 combined sd; K-truncation ladder 50/100/200/267 for Z.

## Q1 gate — the ensembles' own predictions

- Z-ensemble variance prediction: `0.0287 ± 0.0003` (K=267); truncation
  ladder converges: 0.02775 (K=50) → 0.02832 → 0.02861 → 0.02866. The
  ladder's total `Σ 2r_k²` is effectively saturated by K≈200.
- C-ensemble variance: `0.31 ± 0.37` — an order of magnitude larger and
  wildly seed-dependent (the heavy-tailed character of the chaos class,
  as Harper's theory leads one to expect).
- Discriminating set (separation ≥ 3, fixed before looking at real):
  **acf(Δu=0.1): sep 8.8**, **acf(Δu=0.25): sep 5.0**. All one-point
  distribution-shape statistics (variance, skewness, kurtosis, moment
  ratio, max, min) have sep ≤ 1.3 — **one-point shape does NOT
  discriminate the two worlds at this scale; the two-scale correlation
  structure does.** (This is itself a finding of Q1.)
- signChanges is truncation-dominated by construction (the real walk
  contains all zeros; the K=267 model lacks the high-frequency tail that
  adds crossings without adding variance). Predeclared handling: flagged,
  excluded from placement aggregation.

## Q2 — the placement table (full window, N=10^8)

| stat | real | Z mean±sd | C mean±sd | z_Z | z_C | sep | verdict |
|---|---|---|---|---|---|---|---|
| variance | 0.0290 | 0.0287±0.0003 | 0.3075±0.3729 | 1.4 | −0.7 | 0.7 | BOTH |
| skewness | 0.0055 | −0.0020±0.0401 | 0.0697±0.2613 | 0.2 | −0.2 | 0.3 | BOTH |
| kurtosisExcess | −0.6077 | −0.5071±0.1167 | −0.6086±0.4516 | −0.9 | 0.0 | 0.2 | BOTH |
| momentRatio | 0.8209 | 0.8220±0.0072 | 0.8300±0.0354 | −0.2 | −0.3 | 0.2 | BOTH |
| max | 0.4317 | 0.4762±0.0383 | 1.2170±0.5602 | −1.2 | −1.4 | 1.3 | BOTH |
| min | −0.4548 | −0.4768±0.0394 | −1.0791±0.5582 | 0.6 | 1.1 | 1.1 | BOTH |
| signChanges | 445 | 147.1±12.4 | 147.6±73.5 | 24.1 | 4.0 | 0.0 | truncation-flagged |
| **acf 0.1** | **−0.1012** | **−0.0976±0.0071** | **+0.8307±0.1051** | **−0.5** | **−8.9** | **8.8\*** | **Z-side** |
| **acf 0.25** | **−0.4012** | **−0.4071±0.0093** | **+0.6460±0.2093** | **0.6** | **−5.0** | **5.0\*** | **Z-side** |
| acf 0.5 | 0.3489 | 0.3493±0.0119 | 0.4074±0.3119 | −0.0 | −0.2 | 0.2 | BOTH |
| acf 1 | 0.0278 | 0.0189±0.0076 | 0.0276±0.4110 | 1.2 | 0.0 | 0.0 | BOTH |
| acf 2 | −0.5344 | −0.5436±0.0097 | −0.0892±0.3415 | 0.9 | −1.3 | 1.3 | BOTH |
| acf 4 | 0.5114 | 0.5333±0.0142 | −0.1650±0.4215 | −1.5 | 1.6 | 1.7 | BOTH |

Half-window splits agree in direction (see JSON). The 10^7
small-ensemble smoke run replicates the placement (acf0.1 sep 11.8,
real Z-side).

## VERDICT

**The real Möbius walk at N=10^8 is statistically a draw of the zeros
model and is rejected from the critical-multiplicative-chaos class at
8.9σ on the predeclared discriminating statistic.** On every
non-truncation statistic the real walk sits inside the Z-ensemble band
(|z_Z| ≤ 1.5); on the two discriminating statistics it sits 8.9σ and
5.0σ away from the chaos class, on the spectral side. The truncated
267-zero ladder predicts the real walk's variance to ~1%
(0.0287 vs 0.0290).

Three sharpened facts the workshop now owns:

1. **The placement**: at 10^8 the Möbius walk already exhibits the
   almost-periodic rigidity of ζ's spectrum — "what arithmetic adds
   beyond multiplicativity" is measurable and is exactly the discrete
   spectral structure (an S2-flavored quantification of the real-vs-RCM
   divergence).
2. **Where the discrimination lives**: NOT in one-point distribution
   shape (both-consistent everywhere) but in the two-scale correlation
   structure in u = log x. Any future model test of μ should use
   correlation shape, not histograms or moments.
3. **The chaos class is the wrong finite-N model for M(x)** in
   correlation structure, even though Harper-class models remain the
   right null for testing *multiplicativity-only* explanations (that is
   what makes the 8.9σ rejection informative rather than obvious:
   the same C-ensemble was indistinguishable from real in five
   one-point statistics).

Classification per the council taxonomy: **S4 (calibrated placement
statement with power lines) with S2 flavor (quantified divergence from
the generic-multiplicative world).** Not claimed as new mathematics:
under RH the zeros representation of M(x) is classical; the contribution
is the finite-N, ensemble-calibrated, instrument-validated placement and
the discrimination-structure finding (2). Expert-pack-ready if wanted.

Caveats and self-audit: signChanges excluded as predeclared
(truncation); the Z-ensemble inherits any bias of the computed ladder
(mitigated: the ladder was independently verified against the real walk
spectrally on 07-02 — but note that verification and this placement
share the real M(x) data; a fully independent check would verify the
ladder against published |ζ′(ρ)| values); LI-random phases are an
assumption of Model Z, not a theorem; the Liouville walk L(x) and a
10^9 extension are the natural replications, deferred (HANDOFF).

HANDOFF: next session — (a) L(x)/√x placement (amplitude ladder needs
the ζ(2ρ) factors), (b) published-|ζ′(ρ)| cross-check of the ladder,
(c) 10^9 segmented replication, (d) the two-scale correlation SHAPE
curve (real vs Z) at fine Δu resolution as its own exhibit.
