# 2026-07-02 — P1-CL: the missing-spectrum hunt (first execution)

Program: COUNCIL2.md Amendment A; prompt: prompts/parity-battery.md.
Scripts: `scripts/missing-spectrum-row0.mjs`, `-row12.mjs`, `-row3.mjs`,
`-row4.mjs`, `-plots.mjs`. Artifacts: `logs/missing-spectrum-artifacts/`.
Machine: 197/197 tests passing at session start; μ sieve to 10^8 in 4.3s.

The object: `C_h(x) = Σ_{n≤x} μ(n)μ(n+h)` — bilinear in μ, outside the
explicit-formula funnel, independent of RH in both directions; over
F_q[t] the h=1 sum is exactly `|Y_n(F_q)| − q^n` (Keating–Rudnick), whose
square-root cancellation is Weil-proven — a second critical line whose
integer counterpart is absent from mathematics. The hunt: does the
integer walk's spectrum contain discrete frequencies (the shadow of the
missing spectral object)?

Predeclared: survivor bar = peak score above the 20-seed colored-noise
null envelope AND stable across octave halves AND coherent across ≥ 2
shifts. Expected outcome (written before the run): null — with the θ₂(h)
table and the strongest spectral calibration of Chowla sums to date as
the deliverable.

## ROW 0 — validation gate on the theorem side: PASS

Exact raw sums `S_n(g) = Σ_{deg f=n} μ(f)μ(f+g)`, F_2[t] to n=24 (built
4.0s), F_3[t] to n=15 (built 6.9s); artifact `row0-ynseries.json`.

- **[F_2[t]: exact]** shift g=1: cancellation slope of log_q|S_n| vs n =
  **0.4944**; |S_n|/q^(n/2) bounded (last four: 0.135, 2.275, 1.226,
  0.393) over 24 degrees.
- **[F_3[t]: exact]** g=1: slope **0.5306**; ratios bounded (0.510,
  1.787, −1.748, −0.937).
- Prony/dominant-mode probe: no exact low-order recurrence (relative
  residuals 0.18–0.76 — expected: the Y_n variety varies with n), but
  dominant fitted modes sit ON the Weil circle: F_3 order-3 fit
  |α|/√q = **1.084, 1.084, 0.996** (residual 0.198); F_2 order-5 top
  modes 1.23, 1.18, 1.18.

GATE VERDICT: **PASS — scale-verified, dominant modes on-circle.** The
instrument sees the known second critical line in exact data.

## ROW 1 — the integer hunt at N=10^8: NO SURVIVOR (and a clean θ₂ table)

`row12-N100000000.json`; grid: 8192 log-spaced samples on [10^4, 10^8],
Δγ = 0.682; shifts h ∈ {1,2,3,4,5,6,8,12,101,1009}; nulls: 10
Bernoulli-on-squarefree + 10 RCM walks (h=1).

**θ₂(h) — the exponent table (RMS-over-octaves slope):**

| h | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 12 | 101 | 1009 |
|---|---|---|---|---|---|---|---|---|---|---|
| θ₂ | 0.504 | 0.526 | 0.491 | 0.447 | 0.579 | 0.455 | 0.525 | 0.520 | 0.293 | 0.527 |

Small-h mean **0.506**; null-walk spread **0.542 ± 0.119** (range
0.32–0.77 — single-realization exponents are that noisy, which is why
the spectrum, not the exponent, was the discriminator). [ℤ: measured]
binary Chowla sums show square-root-scale cancellation at 10^8, exponent
indistinguishable from a matched random walk.

**The spectrum:** real top peak scores across all ten shifts: 2.91–4.33.
Null envelope from 20 colored-noise walks: per-seed max mean **3.69**,
max **7.28**. Every real peak sits inside the null envelope. Octave
check: top frequencies do not repeat across halves (h=1: γ=12.3 first
half vs 150.1 second half; h=2: 12.3 vs 91.4; h=3: 227.8 vs 16.4). No
shift-coherent line. **VERDICT: NO SURVIVOR — the missing spectrum did
not show itself at 10^8.** Deliverable stands as the predeclared null:
`spectrum-panel.svg`.

## ROW 2 — known-line calibration on the Mertens walk: PASS

Same grid, M(x)/√x spectrum vs the bundled zeros; explicit-formula
amplitude prediction 2/|ρ ζ′(ρ)| with ζ′ by central difference
(`zetaC`). Raw measured/predicted ratios cluster at 0.47–0.50 = the Hann
coherent gain (0.5); **window-corrected ratios for well-resolved zeros:
γ₁ 0.95, γ₂ 0.98, γ₃ 0.93, γ₅ 0.94, γ₆ 1.00, γ₇ 1.00** (γ₄ under-resolved
at dist 0.41; γ₈ unmatched at this resolution — its amplitude ranks below
the local background). Frequencies land within 0.01–0.23 of γ_k for 7 of
the first 8 (Δγ = 0.682).

VERDICT: **calibration PASS.** The μ-walk carries ζ's line at the
1/|ρζ′(ρ)| amplitude ladder — the instrument is validated end-to-end on
a live Möbius walk, frequencies AND amplitudes. (This also re-confirms,
from the μ side, the June zero-spectrum result that used ψ.)

## Parity-breaker profile: NULL (flat)

avg over primes p ≤ 10^8 of μ(p+h), h = 1..8: all means at the 10^-4
scale, naive |z| ≤ 1.15. [ℤ: measured] The parity-breaking correlation
`Σ Λ(n)μ(n+h)` cancels with no visible secondary structure at 10^8 —
consistent with the (unproven) o(x) estimate; no exploitable signal.

## ROW 3 — the shape of criticality (M–S variance at X=10^7): SLOPE 1.00

`row3-msvariance-X10000000.json`, `ms-variance-curve.svg`. V(X,H)/H over
H = 100..102400, 8192 samples, 5 Cramér twins.

- **[ℤ: measured]** real V/H falls from 10.68 to 3.76 as log(X/H) falls
  11.51 → 4.58: fitted slope **0.998** — the Montgomery–Soundararajan
  H·log(X/H) shape, measured with no ζ input.
- Intercept offset: real ≈ MS-prediction + 1.2–1.6 (finite-size; the
  asymptotic constant −(γ + log 2π) converges slowly; the offset grows
  toward the Maier-adjacent end H=100 where (log X)² ≈ 280 ≈ H).
- **Cramér twins: flat at V/H ≈ 13.3–13.5 with no H-dependence** — the
  real primes carry a variance DEFICIT growing with window size:
  spectral rigidity (zero repulsion) visible directly in prime counts.

VERDICT: KNOWN-MATH(conjecture-shape) + OBSERVED calibration — the M-S
slope is confirmed at 1.00 and decisively separated from Cramér. This is
around-the-line physics, labeled as such, not a new line.

## ROW 4 — time-domain flank at N=10^8: H1 REFUTED; Gowers/ML null

`row4-flank-N100000000.json`. Preregistered H1 (council pilot): the
λ block-χ² drift at k=10–12 (pilot z ≈ 2.9–3.1 at 10^7) replicates at
10^8 against 20 Bernoulli + 10 RCM seeds.

- **H1 DECISION: REFUTED.** Real χ²z at k=10/11/12 = **−1.85 / −1.34 /
  −0.70** vs null band 0.11±2.56 / −0.02±2.36 / −0.19±2.18; z-of-z =
  −0.77 / −0.56 / −0.23. The real values are mildly *negative*; the
  pilot's k=10–12 drift at 10^7 was look-elsewhere noise, exactly as the
  preregistration anticipated it might be. Note the null sd of χ²z at
  10^8 is ~2.2–2.6 (block counts are long-range dependent within a
  sequence), which retroactively shrinks the pilot's z ≈ 3 further. The
  Markov-twin follow-up was not triggered (no z-of-z > 3).
- **Gowers norms** (2^22 window at offset 2^20): U²(λ) = 2.6274e−2 vs
  nulls 2.6273e−2–2.6288e−2; U³(λ) = 1.6211e−1 vs nulls
  1.6210e−1–1.6211e−1 (16 sampled h). λ is Gowers-U²/U³-
  indistinguishable from iid and RCM noise at this window — no linear
  phase, no quadratic structure.
- **ML probe** (logistic, prev-8 λ values + n mod 3,5,7,11; train
  [2^20, 6e6], holdout (6e6, 1e7]): λ accuracy **0.500006** vs nulls
  0.499640–0.500128. No predictability edge (power line ≈ 0.00025).

VERDICT: the time-domain flank is fully null at 10^8. Multiplicative
parity behaves as conjectured randomness in every statistic measured
today.

## Session verdict

1. The missing-spectrum hunt executed end-to-end with the gate
   discipline: theorem-side PASS, integer-side NO SURVIVOR, calibration
   PASS, flank null, H1 refuted. **No new critical line at 10^8** — and
   for the first time this is a *designed* null (validated instrument,
   predeclared bars) rather than an exhausted scan.
2. What the workshop now owns that it did not yesterday: the θ₂(h)
   table (≈ 1/2 across shifts), the exact F_q[t] S_n series with
   on-circle mode structure, the window-corrected 1/|ρζ′(ρ)| amplitude
   verification, the M-S slope-1.00 measurement against flat Cramér,
   and the S4-grade statement: *at N=10^8, uniform-shift binary Chowla
   is spectrally structureless against matched multiplicative nulls.*
3. Escalation path (unchanged, power-gated): 10^9 segmented run extends
   Δγ to 0.55 and doubles the u-range — worthwhile only with a stronger
   background model; log-weighted walks (more small-n power) are the
   next variant before brute range.

HANDOFF: KNOWLEDGE entries appended (missing-spectrum hunt; M-S variance
calibration; H1 refutation). Visuals: `spectrum-panel.svg`,
`exponent-dashboard.svg`, `ms-variance-curve.svg`.
