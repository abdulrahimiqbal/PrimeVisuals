# GOAL: Track Q — place the Möbius walk between quantum chaos and quantum spectra

Read COUNCIL3.md (the formalization and the trap), COUNCIL2.md (the
fence), `logs/2026-07-02-missing-spectrum.md` (the measured amplitude
ladder feeding Model Z; the RCM machinery feeding Model C),
KNOWLEDGE.md. Log: `logs/<today>-quantum-probability.md`. Q2 does not
start until Q1's predictions table exists. The fence applies: power
line and nearest-catalog paragraph BEFORE compute.

## The object

Windowed normalized walks `M(x)/√x` and `L(x)/√x` (Mertens and
Liouville) over octaves of `[10^4, 10^8..10^9]`, compared THREE ways:
real vs **Z-ensemble** (truncated zero sums, measured 1/|ρζ′(ρ)|
amplitudes from `row12-N100000000.json`, independent uniform phases —
the RH+LI world) vs **C-ensemble** (random completely multiplicative ±1
seeds — Harper's critical-chaos world). Both rivals are exactly
simulable in-repo; statistical power comes from shape-at-fixed-N, never
from log log growth rates (COUNCIL3 Part III).

## SPRINT Q1 — derive before measuring (hard gate)

1. Referee-check and record exact statements (nearest-catalog
   paragraphs): Harper 2020 moment law for Rademacher RCM; the Ng 2004 /
   Gonek extreme-value law for M(x) under LI (get the iterated logs and
   the exponent RIGHT — do not trust memory, including the council's);
   FHK/ABR for context. Any statement that cannot be pinned to a source
   is excluded from the battery.
2. Build the ensembles: ≥100 Z-draws (truncation sensitivity: vary zero
   count K, confirm battery statistics stabilize; note the bundled table
   has 267 zeros to t=500 — extend via `scripts/genzeros.mjs` only if
   sensitivity demands it); ≥100 C-seeds at N=10^8 (toggle sieve,
   ~seconds each — budget the runtime honestly).
3. From the ensembles alone, tabulate finite-N predictions ± spread for
   every Q2 statistic, and fix power lines: minimum detectable
   real-vs-ensemble distance at N=10^8 given the ensemble spreads.
   Statistics whose Z- and C-predictions overlap within power are
   dropped from the discriminating set (they may stay as calibration).
EXIT Q1: the predictions table in the log; discriminating set named;
power lines fixed. No real-data measurement before this. Commit.

## SPRINT Q2 — the three-way placement

Battery per octave (predeclared from Q1):
1. distribution of windowed `M(x)/√x`: density overlay + variance,
   skewness, kurtosis;
2. moment ratio `E|·| / √(E·²)` (Harper's discriminant direction);
3. max-over-octave and min-over-octave (FHK-class extremes);
4. sign-change and persistence counts of the normalized walk;
5. two-scale correlation `cov(W(u), W(u+Δu))` of `W = M(e^u)/e^{u/2}`
   across a Δu ladder — discrete almost-periodic spectra and
   log-correlated fields predict different shapes here (derived in Q1).

Scoring: distance of the real value from each ensemble in ensemble-sd
units; verdict per statistic ∈ {Z-side, C-side, BOTH-consistent,
NEITHER}; the placement table aggregates verdicts across octaves and
across M vs L. NEITHER anywhere → replicate on the disjoint range /
alternate walk before excitement; adversarial audit before any ⭐.
Deliverables: the placement table, density-overlay panel per octave
(real curve over both ensemble bands — the signature visual), KNOWLEDGE
entries with universe labels and CONNECTION lines (amplitude-ladder
entry; missing-spectrum entry; M–S variance entry). EXIT: table +
visuals + entries committed; if a NEITHER survives audit, the statement
template + evidence pack per the LO-S standard.

Honesty regime as always: predeclared thresholds, ensembles ≥100, range
splits as holdout, ranked "both-consistent" is a valid outcome, STUCK
PACK after two stuck sessions. The trap is log log scales; the answer is
shape-at-fixed-N. Certainty of outcome is not available; certainty of
meaning is the design.
