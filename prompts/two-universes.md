# GOAL: the Two-Universes Program — Sprints 1–3, run in order, gated

Read COUNCIL.md (the strategy), MACHINE_HOW_TO_USE.md, KNOWLEDGE.md.
Log: `logs/<today>-two-universes.md`. Persists across sessions via
HANDOFF. Do not start a sprint until the previous one's EXIT criteria
pass; commit at each gate with the sprint named in the message.

## Why

In F_q[t], RH, twin primes, and Chowla are THEOREMS (Weil 1948;
Sawin–Shusterman, Annals 2022). Over ℤ they are open. We instrument the
bridge: every statistic computed in both universes; the function-field
side calibrated against exact theorems; measured agreement (S1) or
divergence (S2) between worlds is the primary object (see COUNCIL.md).
Every claim carries a universe label — [F_q[t]: THEOREM], [F_q[t]:
measured], [ℤ: measured], [ℤ: conjecture] — never mix grades. The Mertens
lesson applies only to the ℤ column; that asymmetry is the point.

## SPRINT 1 — build the universe

In src/core/ffield.js, for q = 2 and 3:
- Monic polynomials by degree (n ≤ ~24 for q=2, ~15 for q=3), bitmask
  representation for F_2.
- Irreducibility via polynomial Eratosthenes (cross off products), not
  per-poly factoring. Polynomial Möbius μ(f). Twin pairs (f, f+1) and
  (f, f+t).
- Registry SOURCE ("Polynomial primes F_q[t]", degree as the log-analog)
  so existing planes/lenses/chips/readouts work on it.
EXIT: tests pass anchoring counts to the EXACT formula
#irreducibles(n) = (1/n)·Σ_{d|n} μ(d)·q^(n/d) for every supported n;
`shot` of the source rendering in-app; KNOWLEDGE entry listing which
statements are theorems in this universe (with citations). Commit.

## SPRINT 2 — calibrate against theorems

1. PNT analog: measured irreducible counts vs the exact formula (must
   match — validates the build).
2. Chowla two-point: C(h,n) = avg of μ(f)μ(f+h) over deg f = n for
   h ∈ {1, t, t+1} — decay is a theorem (note any q=2 caveat in
   Sawin–Shusterman's condition). Compute the integer analog at
   N = 10^7–10^8. Put both decay curves on ONE plot; the gap between
   curves is the deliverable.
3. Twin densities: twin-irreducibles vs the polynomial Hardy–Littlewood
   singular series; integer twins vs 2C₂·∫dt/log²t (integrated main term,
   not c·x/log x). Both observed/predicted ratios on one axis, aligning
   degree n ↔ log N.
EXIT: all three calibrations logged with `shot`s and links; decay-rate and
density-gap numbers in KNOWLEDGE with universe labels. Commit.

## SPRINT 3 — first divergence hunt

Generalize the anomaly battery (src/core/stats.js + anomaly.js patterns)
to run MATCHED in both universes: residue/χ² with polynomial moduli, gap
autocorrelation in the (degree, value)-ordered sequence, spacing
histograms, exponential-sum analogs where sensible. Each statistic gets:
F_q[t] value, ℤ value, a matched Cramér-style null per universe,
predeclared thresholds, range doubling.
Produce the DIVERGENCE TABLE: statistic | F_q[t] | ℤ | nulls | verdict ∈
{SHARED-LAW candidate, DIVERGENCE candidate, noise}. ⭐-flag the first two
classes; for each flagged row: persistence at 2×, `shot`, link, and a
one-paragraph plain-language reading of what agreement or divergence
means.
EXIT: the table in the log and KNOWLEDGE (with CONNECTION lines to
existing entries — the residue catalog especially), plus the single best
S1 candidate and the single best S2 candidate, each stated precisely.
Commit.

## Deliverables (cumulative)

1. src/core/ffield.js + registry integration + exact-formula tests.
2. The log: every batch, calibration plots, the divergence table.
3. KNOWLEDGE.md entries per sprint, universe-labeled, with citations.
4. Final report: build status, calibration verdicts, top S1 and S2
   candidates with links — and a HANDOFF if any sprint is incomplete.

Honesty regime as always: predeclared nulls, no all-x claims from finite
ℤ data, ranked graveyard is a valid outcome, STUCK PACK after two stuck
sessions.
