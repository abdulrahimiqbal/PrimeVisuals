# GOAL: the Two-Universes Program, Sprint 1 — build and calibrate the function-field world

Read COUNCIL.md (the strategy this serves), MACHINE_HOW_TO_USE.md, and
KNOWLEDGE.md. Log: `logs/<today>-two-universes.md`. This goal persists
across sessions via HANDOFF sections.

## Why

In F_q[t], the Riemann Hypothesis, twin primes, and Chowla are THEOREMS
(Weil 1948; Sawin–Shusterman, Annals 2022). Over ℤ they are open. We are
instrumenting the bridge: every statistic computed in both universes, with
the function-field side calibrated against exact theorems, so the measured
agreement (S1) or divergence (S2) between worlds becomes our primary
object. See COUNCIL.md for the success taxonomy.

## Part 1 — build the universe (with tests)

In src/core/ffield.js implement, for q = 2 and 3:
- Monic polynomial enumeration by degree n ≤ ~24 (q=2) / ~15 (q=3),
  represented compactly (bitmask for F_2).
- Irreducibility via distinct-degree sieving (polynomial Eratosthenes:
  cross off products), NOT per-poly factoring.
- Polynomial Möbius μ(f) (0 if a square factor; else (−1)^{#irreducible factors}).
- Counts must match the EXACT formula: the number of monic irreducibles of
  degree n is (1/n)·Σ_{d|n} μ(d)·q^(n/d). This is the unit test anchor —
  verify for all n you support.
- Twin pairs: (f, f+1) both irreducible (and (f, f+t) as a second shift).
- Expose as a SOURCE in the registry ("Polynomial primes F_q[t]": x = index
  or integer encoding of f, with degree as the log-analog) so existing
  planes/lenses/chips/Readouts work on it. Tests throughout.

## Part 2 — calibration experiments (exact side must match theorems)

1. **PNT analog**: plot/measure #irreducibles vs the exact formula —
   must match exactly (this validates the build, not the math).
2. **Chowla two-point**: C(h, n) = average of μ(f)μ(f+h) over deg f = n,
   for h ∈ {1, t, t+1}. Sawin–Shusterman ⇒ decay (q=3 satisfies their
   condition; note any q=2 caveat you find). Measure the decay rate.
   Then compute the integer analog Σ μ(m)μ(m+h)/m normalization at
   N = 10^7–10^8 and put the two decay curves on one plot. The GAP
   between curves is the deliverable, not either curve alone.
3. **Twin densities**: twin-irreducible counts vs the Hardy–Littlewood
   polynomial analog (explicit singular-series product over irreducibles)
   and integer twins vs 2C₂·∫dt/log²t (properly integrated main term).
   Report both ratios observed/predicted as range grows, on one axis
   (degree n ↔ log N alignment: n plays the role of log N).

## Part 3 — first divergence hunt

Run the matched battery: for each statistic in src/core/stats.js that
makes sense in both worlds (residue/χ² with poly moduli, gap
autocorrelation in the ordered-by-(degree, value) sequence, spacing
histograms), compute both universes + Cramér-style nulls for each.
Produce a DIVERGENCE table: statistic | F_q[t] value | ℤ value | matched
null | verdict (SHARED-LAW candidate / DIVERGENCE candidate / noise).
Apply the standard discipline (range doubling, predeclared thresholds).
⭐-flag anything in the first two verdict classes.

## Deliverables

1. src/core/ffield.js + registry integration + tests (exact-formula
   anchored).
2. The log with all calibration plots (`shot` for visuals).
3. KNOWLEDGE.md entries: which function-field statements are THEOREMS
   (with citations), the measured decay/density gaps, the divergence
   table, CONNECTION lines to existing entries.
4. HANDOFF if incomplete: exactly where the build or calibration stands.

## Rules

Honesty regime as always. One addition: in this program every claim gets a
universe label — [F_q[t]: THEOREM], [F_q[t]: measured], [ℤ: measured],
[ℤ: conjecture] — never mix grades. The Mertens lesson applies only to the
ℤ column; that asymmetry is the whole point of the program.
