# 2026-07-10 — sieve-conditioned interaction defect campaign

## Goal

Seek a major discovery candidate in prime number theory by measuring the
decay of nonlocal interaction after exact local divisibility information is
removed. The campaign is allowed to end with a calibrated negative; it may
not promote a pilot anomaly.

## Starting evidence

- Cycles 003–004 found multi-shift covariance beyond naive random controls,
  but empirical local-state fallback and residual means were too large.
- Cycle 005 removed exact local admissibility and absorbed the finite-field
  tensor signal.
- Cycle 007 found an integer quotient spectral excess beyond its listed
  controls while `F_3[t]` and `F_5[t]` remained inside controls, but the scale
  ladder and novelty audit were incomplete.
- Cycles 008–023 did not supply a better surviving residual.

## Frozen pilot

The object, shapes, filtrations, controls, support threshold, and separate
S1/S2/S3 gates are frozen in
`logs/local-global-defect/PREREGISTRATION.md` before the first computation.

No numerical result has been observed for this object at the time of this
entry.

## Implementation check — not evidence

The `--quick` run verified the statistic and artifact path. It also showed
that the original polynomial shapes were affine-equivalent in `F_2[t]`, with
identical mask counts. The preregistration was amended before the full pilot
to use shapes with distinct degree-2/degree-3 collision signatures. This
change is forced by exact symmetry, not by choosing a favorable effect.

As expected, shallow local cutoffs produced large real-vs-random differences
that mostly collapsed when the cutoff deepened. These numbers are treated as
Hardy–Littlewood/local-product calibration, not as a lead.

## Full calibration pilot

Command:

```text
node scripts/local-global-defect-pilot.mjs
```

Artifacts:

- `logs/local-global-defect/scid-pilot.json`
- `logs/local-global-defect/scid-pilot.md`
- `logs/local-global-defect/scid-pilot.svg`

The run scored 108 universe/scale/shape/depth cells; 47 passed the frozen
support gate. Shallow local depths produced large SCID excesses in every
universe. The flow then decayed:

- at `N=1,000,000`, the integer strict z-scores fell from
  `47.5..56.1` at `p<=5` to `-1.09..0.63` at `p<=29`;
- `F_3[t]` degree 11 fell from `22.8..41.1` at local degree 1 to inside
  controls at local degree 2, although the latter missed the composite support
  gate;
- `F_5[t]` degree 9 showed the same decay but lacked enough eligible
  reducibles for the degree-2/3 composite control;
- `F_2[t]` degree 20 retained strict z `6.15`, `0.92`, `4.36` at local degree
  3 for shapes A/B/C, failing the required three-shape replication.

## Factor and novelty audit

Artifacts:

- `logs/local-global-defect/scid-factor-check.json`
- `logs/local-global-defect/scid-factor-check.md`
- `logs/local-global-defect/scid-factor-check.svg`
- `logs/local-global-defect/NOVELTY_AUDIT.md`

The factor check reconstructs SCID from the seven subset joint moments using
inclusion–exclusion and predicts those moments from the truncated
Hardy–Littlewood / prime-polynomial tuple Euler products. Many
support-passing rows are quantitatively close to this prediction. More
decisively, every three-bit distribution is algebraically determined by its
single/pair/triple moments, so SCID has no arithmetic content beyond the fixed
prime-tuple family.

Verdict: `NEW OBJECT NAME / KNOWN-CONJECTURAL TUPLE CONTENT / NO PROMOTION`.

CONNECTION: This explains why cycles 003–007 repeatedly found structure that
vanished under exact local conditioning. Fixed-dimensional tensor, entropy,
and spectral summaries are all functions of finitely many tuple moments. The
next invariant must use growing exclusions or genuine sequence dynamics.

## Forced mutation

Move to the ordered sequence of deep-admissible next-gap PIT residuals. The
one-point PIT distribution was already calibrated in Cycle 88; the untested
object is its consecutive transition copula after removing both the marginal
distribution and residue-transition means. This is not recoverable from one
fixed three-shift tuple because consecutiveness includes a growing exclusion
set between events.

The second object and its pilot gates are frozen before computation in
`logs/gap-transition-copula/PREREGISTRATION.md`.

## Deep-admissible gap transition copula pilot

Command:

```text
node scripts/gap-transition-copula-pilot.mjs
```

Artifacts:

- `logs/gap-transition-copula/gap-transition-copula-pilot.json`
- `logs/gap-transition-copula/gap-transition-copula-pilot.md`
- `logs/gap-transition-copula/gap-transition-copula-pilot.svg`

The quick implementation check had one apparent `B=97,W=210` cell above
three weak controls. It disappeared in the frozen 12-seed pilot.

At endpoint `2,000,000`:

- `B=29,W=210` had adjusted correlation `-0.0254121` and strict
  `|z|=4.86`, but this was not robust to the deeper cutoff;
- `B=97,W=210` fell to `-0.0081227`, inside same-B fake and rough-composite
  envelopes, with strict `|z|=0.63`;
- `B=97,W=30` likewise had strict `|z|=1.07`;
- all support gates passed at `1M` and `2M`, so the negative is not caused by
  sparse transition classes.

The preregistered lead gate failed. No confirmatory run is allowed.

Verdict: `CALIBRATED NEGATIVE / DEEP LOCAL ADMISSIBILITY ABSORBS LAG-1 GAP COPULA`.

CONNECTION: This extends the previous adjacent-gap and Cycle-88 PIT results.
The B=29 residual is another underfit local-sieve effect; expanding the exact
pointwise admissibility cutoff to 97 absorbs it into sequential fake and
rough-composite controls.

## Strategic pivot

Two distinct discovery routes now fail for principled reasons:

1. fixed-dimensional mask invariants factor through Hardy–Littlewood tuple
   moments;
2. the simplest genuine sequence invariant is absorbed by deeper local
   admissibility.

The next campaign moves from descriptive discovery to the theorem-adjacent
Maynard–Tao variational problem. The goal is first to reproduce certified
`M_k` lower bounds with exact simplex integrals, then search for a stronger
low-complexity test function. This is the computational route in the council
report that can directly change a prime-gap theorem if an improved certified
bound is found.

## Maynard--Tao exact calibration

Preregistration:

- `logs/maynard-variational/PREREGISTRATION.md`

Implementation:

- `src/core/maynardVariational.js`
- `tests/maynard-variational.test.js`
- `scripts/maynard-variational-audit.mjs`

The first exact-arithmetic gate passes. Maynard's equation (8.16) polynomial
returns `1417255/708216 = 2.001162074847...` using `BigInt` rational simplex
integration. An independent generalized-eigenvalue search over the complete
56-dimensional cubic space gives `2.002887195760...`; rounding its seven
symmetric orbit coefficients to four decimals still gives the exact rational
certificate `11148726395/5566329648 = 2.002886479963...`.

The symmetry-reduced `(1-P1)^b P2^c`, `b+2c<=11` engine also reproduces
Maynard's 42-dimensional `k=105` numerical value:

`M_105 >= 4.002069762947...` versus the published `4.0020697...`.

This is calibration, not discovery. The same 42-term basis reaches only
`3.699945714759...` at `k=54`; the published Polymath8b result
`M_54>4.00238` uses a richer even-signature or Krylov construction. That is
now the forced next gate.

The source audit also corrected an error in `COUNCIL.md`: standard `M_50>4`
is not the published benchmark. Polymath's standard-simplex result is
`M_54>4.00238`; its k=50 theorem uses the enlarged-support quantity
`M_{50,1/25}>4.0043`.

Verdict: `CALIBRATION PASSED THROUGH MAYNARD 2015 / MODERN M54 GATE OPEN`.

### Krylov extension

The Polymath8b operator `L` is now implemented on exact symmetric
`(1-P1)^b P_alpha` coordinates. Its first four moments reproduce the paper's
closed forms exactly. A 10-dimensional Hankel/Krylov calculation gives
`M_5 >= 2.007140291425...`, matching the selected `2.00714` value in the
Polymath table. A stable 8-dimensional k=54 cell gives
`3.699398868216...`.

Higher-depth Hankel cells become ill-conditioned in double precision. This is
recorded as an engineering boundary, not interpreted as arithmetic. The next
implementation target is arbitrary-precision eigensolving plus exact
rationalization at the published Krylov depth.

## High-precision Krylov progress

The arbitrary-precision layer now rationalizes every proposed Krylov vector and
re-evaluates its quotient exactly. At k=54:

- dimension 16: exact lower bound `3.9413541289119808657805...`;
- dimension 20: exact lower bound `3.9804429488560882259987...`.

The numerical and rational quotients agree for more than 70 displayed digits.
The published `M_54>4.00223` checkpoint therefore remains a depth/performance
gate, not a precision ambiguity. Bounded-gap optimization has no known logical
implication to RH and remains a theorem-engine calibration track only.

## RH-facing pivot: Nyman--Beurling Schur innovations

Preregistration and artifacts:

- `logs/nyman-beurling/PREREGISTRATION.md`
- `logs/nyman-beurling/schur-pilot.{json,md,svg}`
- `logs/nyman-beurling/NOVELTY_AUDIT.md`

The implementation reproduces Ehm's published `S1(1)` and `G_11` values and
computes the RH-equivalent finite projection distance with stable rational-tail
evaluation. The pilot scored the residual one-step distance reduction after
removing index, Gram-pivot, and newest-coefficient magnitude effects.

Prime indices reach full-range permutation `z=4.55`, but only `z=3.01` in the
frozen final third. The encompassing `mu(n)=-1` class falls from `z=4.04` to
`z=2.55`. All cutoff controls agree, so this is a stable but sub-threshold
Möbius/Levinson--Selberg coefficient shadow, not numerical noise and not a new
RH mechanism.

Verdict: `RH-EQUIVALENT CALIBRATION / MÖBIUS SHADOW / NO SURVIVOR`.

## Weil screw prime-knot operator flow

Frontier source and artifacts:

- Suzuki, June 2026: `https://arxiv.org/abs/2606.09096`
- `logs/weil-screw/PREREGISTRATION.md`
- `logs/weil-screw/prime-knot-pilot.{json,md,svg}`
- `logs/weil-screw/NOVELTY_AUDIT.md`

Suzuki's continuous screw function writes the RH-equivalent Weil kernel as an
archimedean term plus prime-power knots
`Lambda(n)/sqrt(n) * (|t|-log n)_+`. For positive points, each knot has the
exact decomposition

`K_knot = -2 BrownianCov + triangular-increment covariance`.

The pilot verifies the decomposition below `2e-10` across uniform/Chebyshev
grids of dimensions 12, 20, and 28 through `exp(a)=1000`. All sampled total
kernels remain positive. The low-complexity termwise eigenvalue bound fails
immediately after primes enter: by `exp(a)~1000` it is about `-62`, while the
sampled total generalized minimum is about `8e-4`. The positivity is an
alignment phenomenon between compressed eigenspaces.

The global Fourier disguise check prevents promotion. The knot's second
derivative is supported at `+/-log n`, producing the prime cosine spectrum in
Weil's explicit formula. Only a new uniform principal-angle inequality for the
localized/compressed operators could add content beyond the known criterion.

Verdict: `NEW DECOMPOSITION VIEW / GLOBAL FOURIER DISGUISE / LOCALIZED ANGLE PROBLEM OPEN`.
