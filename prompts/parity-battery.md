# GOAL: the Parity Battery — Sprints P1 (ℤ) and P2 (F_q[t] mirror), gated

Read COUNCIL2.md (the strategy and the fence), edge.md §"Corrected
target" and §"Synthesis angles" (the objects), MACHINE_HOW_TO_USE.md,
KNOWLEDGE.md. Log: `logs/<today>-parity-battery.md`. Do not start P2
until P1's EXIT passes; commit at each gate. The COUNCIL2 fence applies:
power line and nearest-catalog paragraph BEFORE compute; no
order-dependent statistic without a canonicity note.

## Why

The parity barrier is a proven wall: sieves cannot determine the parity
of Ω(n), so structure in λ/μ cannot have been quietly explained already,
and any replicable deviation is important by construction. Natural-density
Chowla is open for every k ≥ 2. The referee-checked targets live in
edge.md; none has ever been computed here. Pilot
(`logs/council2-artifacts/pilot-10000000.md`) fixes costs (~2s/sequence
at 10^7), the noise floor (1/√N), and the null hierarchy.

## Nulls (both sprints)

- **Bernoulli**: iid ±1, seeded (≥10 seeds at 10^7, ≥5 at 10^8).
- **RCM**: random completely multiplicative ±1 — f(p) iid, extended
  multiplicatively (pilot code: `scripts/council2-pilot.mjs`; promote to
  `src/core` with tests — COUNCIL2 upgrade I2). This null carries every
  constraint forced by multiplicativity alone; real-vs-RCM isolates
  arithmetic content. For μ, use RCM restricted to squarefree n with the
  squarefree indicator handled as its own (known-math) layer.
- Every statistic gets a **power line** first: minimum detectable effect
  ≈ 3 × seed-sd at the planned N. If a preregistered prediction sits
  below it, redesign.

## SPRINT P1 — the integer battery

Sequences: λ(n) and μ(n), N = 10^7 first, 10^8 for survivors and for the
preregistered targets. Statistics (predeclare thresholds per row, then
run):

1. **Two-point profile** c(h) = avg λ(n)λ(n+h), h = 1..64, BOTH
   unweighted and log-weighted (1/n-weighted) — the pilot shows the
   choice is load-bearing. Spot-check large shifts h ≈ N^(1−η). The
   log-weighted negativity at small h is KNOWN-adjacent (see the
   two-universes calibration entry); the *uniform h-profile* is the
   under-computed object.
2. **Three/four-point** on a predeclared shift list (include the even
   4-point case — log-averaged even ≥ 4 is OPEN even for logarithmic
   averaging).
3. **k-block χ² and entropy**, k ≤ 16. PREREGISTERED H1 (from the pilot,
   not a claim): the block-χ² drift at k = 10–12 (pilot z ≈ 2.9–3.1 vs
   nulls 0 ± 1 at 10^7) replicates at 10^8 with ≥ 20 Bernoulli and ≥ 10
   RCM seeds. Decide it either way; if real, immediately test whether the
   2-point profile explains it (a Markov/Gibbs model fit — the drift must
   survive subtraction of pair correlations to count as new).
4. **Gowers U² and U³** of λ on [N] (U² via FFT = ℓ⁴ norm of Fourier
   coefficients; edge.md angle 2). Deliverable: the norm value AND the
   maximizing phase/quadratic if either norm beats both nulls.
5. **Spectral measure**: power spectrum of the ±1 stream; peaks scored as
   height ÷ local spectral median, calibrated on the seed battery
   (research-loop rule). Any surviving atom = the zeros' shadow (edge.md
   angle 6) — escalate carefully.
6. **Entropy rate / LZ**: block-entropy extrapolation h_k = H_k − H_{k−1};
   LZ78 is confirmed weak at this scale (pilot) — keep it as a bound only.
7. **ML predictability probe** (edge.md angle 3): predict λ(n) from
   features that cannot leak Ω(n) directly — previous λ values
   (λ(n−1)…λ(n−k)), n mod small primes, digit features. Strict range
   holdout (train [1, N/2], test (N/2, N]). Success bar: persistent
   accuracy edge over 50% exceeding the power line, stable across the
   holdout — feature importances are the clue, not the trophy.
8. **The parity-breaker profile**: S(h)/π(N) = avg over primes p ≤ N of
   μ(p+h), h = 1..64. This is the measured shadow of the estimate
   `Σ Λ(n)μ(n+h) = o(x)` that (with Elliott–Halberstam) breaks parity for
   twins (edge.md, Murty–Vatwani). Nobody publishes its empirical
   h-profile at 10^8; the profile against the H–L singular-series shape
   is the deliverable.

EXIT P1: every row verdicted NULL / KNOWN (with the catalog citation) /
SURVIVOR against BOTH nulls at both scales, with power lines in the log;
survivors go to independent adversarial audit (fresh session) before any
⭐; if everything is null, assemble the **S4 evidence pack** — "empirical
Chowla/Sarnak uniformity at 10^8, uniform-shift, matched multiplicative
nulls" — as a citable artifact. KNOWLEDGE entries + commit.

## SPRINT P2 — the theorem-side mirror

Same battery over F_q[t] (q = 3 primary, q = 2 contrast), with the
canonicity rule enforced: statistics are defined over ADDITIVE SHIFTS
(f ↦ f + g, coordinate-free), never lexicographic neighbors. Note
Sawin–Shusterman's large-q hypotheses: at fixed q = 3 the theorems do NOT
directly apply — that is exactly why measured F_3 values are interesting
(calibration against the theorem *shape*, divergence from it is an S2
object).

1. C(g, n) = avg over deg f = n of μ(f)μ(f+g) for a predeclared g-ladder;
   compare decay against the integer h-profile at matched scale
   (n ↔ log_q N).
2. **The Y_n point counts** (Keating–Rudnick identity, edge.md):
   Σ_{deg f = n} μ(f)μ(f+1) = |Y_n(F_q)| − q^n. Compute the exact series
   n ≤ 15 (q=3) / n ≤ 24 (q=2); measure the empirical "Weil constant"
   |Y_n − q^n| / q^(n/2). This is the geometric mechanism made numerical.
3. Block/entropy/Gowers analogs on the μ_q values over shift-orbits
   (canonical), matched to P1's rows.
4. The battery's DIVERGENCE table: statistic | ℤ | F_3[t] | F_2[t] |
   nulls | verdict ∈ {SHARED-LAW, DIVERGENCE, noise} — the S1/S2 objects.

EXIT P2: divergence table logged with universe labels ([F_q[t]: THEOREM /
measured], [ℤ: measured]) and CONNECTION lines; best S1 and S2 candidates
stated precisely; commit.

Honesty regime as always: predeclared nulls and thresholds, Cramér/seed
batteries, range doubling, disjoint holdouts, ranked graveyard is a valid
outcome, STUCK PACK after two stuck sessions.
