# Breakthrough gate — free-boundary Maynard 49

Date: 2026-07-12

## Verdict

**NOT A BREAKTHROUGH. KILL THE CURRENT INACTIVE-CHAMBER ROUTE AS A
PRIVILEGED PROGRAM; RETAIN THE OPEN `M_(49,epsilon)>4` TARGET.**

No rational witness above four was found. The exact chamber algebra survives
as useful infrastructure, but the decisive full-degree experiment gives no
credible crossing and the qualitative reduced-support idea is prior
Polymath8b art.

This verdict does not prove `M_(49,epsilon)<=4`. It says this repository has
not produced the proposed field-level theorem and no longer has evidence for
allocating the next research budget to this mechanism.

## 1. Exact mathematical layer: pass

The implementation independently reconstructs the Section 7 enlarged-simplex
basis and its exact rational Gram formulas:

- 373 even-entry signatures;
- 2,526 basis directions at degree 27;
- exact low-degree matrix entries checked against direct polynomial
  integration and an independent existing symmetric engine;
- an exact orbit-compressed formula for the all-marginals-inactive chamber;
- sparse monomial-symmetric product and chamber-quadratic evaluators.

The chamber formula avoids all `2^k` labelled cells. At
`k=50, epsilon=1/25`, the chamber occupies exactly about `10.1876583517%` of
the uniform simplex volume. This proves that the geometry is real and
computable. It does not say that a near-optimal witness places meaningful
`L^2` mass there.

The pure-JavaScript exact contraction did not finish even for the 28-term
degree-7 witness within a frozen 20-minute ceiling. Exact rational endpoint
cancellation, not structure-constant enumeration, is the bottleneck. That
backend is therefore a final sparse-certificate checker, not a degree-27
discovery engine.

## 2. Full 2,526-dimensional control

The optimized numeric backend built the complete degree-27 matrices for the
published `k=50, epsilon=1/25` control and for the matched
`k=49, epsilon=1/24` experiment. It diagonalizes the scaled denominator,
retains modes above a stated spectral cutoff, and then recomputes every
candidate directly in the original scaled quadratic forms.

| parameters | last self-consistent cutoff | rank | direct quotient | target |
| --- | ---: | ---: | ---: | ---: |
| `k=50, epsilon=1/25, d=27` | `3e-16` | 2,048 | `3.9925453054` | published `>4.0043` |
| `k=49, epsilon=1/24, d=27` | `3e-16` | 2,052 | `3.9760025490` | `>4` |

The positive control is not reproduced. After unit-diagonal scaling, the
computed condition estimates are about `10^17`--`10^18`; roundoff produces
87--88 formally nonpositive modes in matrices that are positive definite
mathematically. The stable values are therefore reconnaissance, not rigorous
lower bounds on the full spaces.

The instability audit is decisive about apparent crossings:

- at `k=50`, cutoff `1e-16` reports `4.01046215`, but direct recomputation is
  only `3.42439417` and the denominator is `1.17071655`;
- at `k=49`, cutoff `1e-16` reports `4.39592246`, but direct recomputation is
  only `2.26436496` and the denominator is `1.94611228`.

Both are false breakthroughs and are rejected. A Bernstein change of radial
basis also generated unstable large values and did not repair the condition
gate.

## 3. Direct free-boundary reoptimization

The chamber correction was then optimized inside spectrally retained
degree-27 spaces using conditional-uniform chamber samples. Candidate
selection and assessment use independent samples; these experiments are
explicitly Monte Carlo reconnaissance, not certificates.

For the actual `k=49, epsilon=1/24` matrices at cutoff `3e-16`:

- training chamber samples: 20,000;
- independent holdout samples: 40,000;
- holdout chamber-mass ratio of the optimized witness:
  `3.3521e-5`;
- chamber-mass standard error: `1.5513e-6` in the normalized quadratic form;
- holdout corrected quotient: `3.9760038765`;
- remaining gap to four: `0.0239961235`.

The corresponding uncorrected direct value is `3.9760025490`, so the observed
free-boundary gain is about `1.33e-6`. The propagated quotient sampling error
is about `6.17e-6`, so even that tiny gain is not statistically resolved.

This aggressive run is deliberately favorable to the mechanism but is not an
unregularized Monte Carlo optimum: the sampled correction made the training
denominator indefinite, so correction eigenvalues were capped at `0.99` before
optimization. The independent holdout evaluates the resulting scalar witness,
but its error bar covers sampling only—not the severe Gram-conditioning or
regularization systematics.

For context, the historical global-polynomial computation reached
`M_(49,1/24)>=3.98855708` at a larger degree. A fixed witness at that value
would need at least

`1 - 3.98855708/4 = 0.00286073`

of its denominator mass removed to cross four. The current high-degree
chamber-optimized holdout ratio is roughly 85 times smaller. This comparison
does not bound a different higher-degree optimizer, but it removes the only
positive empirical mechanism signal supplied by this repository.

## 4. Why the conceptual novelty also fails

The original Polymath8b discussion already proposed optimizing over the
reduced support where the extremizer should vanish on the invisible inner
chamber. The present lemma is a clean exact and scalable reformulation, not a
new variational principle.

Moreover, symmetric polynomials are `L^2`-dense in the symmetric admissible
space. Multiplying a polynomial by the complement of the chamber can improve
a fixed finite basis, but it does not enlarge the limiting variational space.
It is a convergence accelerator or preconditioner—not a new prime-number
mechanism by itself.

## 5. Exact claim gate

A field-level result still requires all of the following:

1. reproduce the known `k=50, epsilon=1/25, d=27` positive control with a
   better-conditioned or multiprecision proposal layer;
2. produce an explicit `k=49` vector whose corrected quotient exceeds four
   with a material numerical margin;
3. rationalize that vector and evaluate the full corrected quadratic forms;
4. verify the integer sign `N-4D>0` independently;
5. publish basis ordering, coefficient vector, exact numerator/denominator,
   and hashes as a permanent certificate.

Do not reopen for a larger endpoint scan, a sub-machine-precision eigenvalue,
or another low-dimensional chamber gain.

## Reproduction

- Exact formulas and pilots:
  `src/core/freeBoundaryMaynard.js`,
  `scripts/free-boundary-inactive-chamber-pilot.mjs`
- Exact signature calibration:
  `src/core/enlargedMaynardSignature.js`,
  `scripts/maynard-enlarged-signature-calibration.mjs`
- Full numeric control:
  `scripts/maynard_enlarged_d27_numeric.py`,
  `D27_NUMERIC_CALIBRATION.md`
- Chamber holdout:
  `scripts/maynard_free_boundary_mc.py`,
  `d27-free-boundary-mc-k49-e1over24-cutoff3e-16.json`
- Independent formula/conditioning audit:
  `SIGNATURE_ENGINE_AUDIT.md`
