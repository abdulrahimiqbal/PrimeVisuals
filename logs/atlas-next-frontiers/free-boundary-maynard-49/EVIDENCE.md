# First survival evidence — free-boundary Maynard 49

Run: 2026-07-12

Frozen protocol: [PREREGISTRATION.md](./PREREGISTRATION.md)

## Outcome in one sentence

The theorem target remains a genuine consequence-changing target, and boundary
geometry produces an **exactly certified strict gain** in the frozen toy gate;
however, the published `k=50` coefficient payload is no longer available at its
cited URL and a naive polynomial-on-every-cell implementation is infeasible at
`k=49`.

## 1. Source reconstruction

The primary source is DHJ Polymath, *Variants of the Selberg sieve, and bounded
intervals containing many primes*, arXiv:1407.4897.

- [Theorem 3.12](https://arxiv.org/pdf/1407.4897#page=16) defines
  `J_(i,1-epsilon)` by integrating the other `k-1` coordinates over
  `(1-epsilon) R_(k-1)`, defines `M_(k,epsilon)` on
  `(1+epsilon) R_k`, and proves that
  `M_(k,epsilon) > 2m/theta` implies `DHL[k,m+1]` under the stated
  distribution hypothesis.
- Bombieri–Vinogradov supplies `EH[theta]` for every `theta<1/2`.  Thus if
  `0<epsilon<1` and `M_(49,epsilon)>4`, one may choose `theta<1/2`
  sufficiently close to `1/2` that both `1+epsilon<1/theta` and
  `M_(49,epsilon)>2/theta` hold.  The conclusion is `DHL[49,2]`.
- The MIT/Polymath tuple archive contains a complete
  [admissible 49-tuple of diameter 240](https://math.mit.edu/~primegaps/tuples/admissible_49_240.txt).
  Therefore `DHL[49,2]` gives `H_1<=240`.
- [Theorem 3.13(i)](https://arxiv.org/pdf/1407.4897#page=16) records the
  calibration `M_(50,1/25)>4.0043`.
- [Section 7.2](https://arxiv.org/pdf/1407.4897#page=60) says that this used
  the symmetric basis `(1+epsilon-P_(1))^a P_alpha`, degree `d=27`, with
  only even entries in `alpha`, exact rational Gram entries, numerical
  generalized eigensolving, and a final rational check.

This implication chain is not the earlier killed `M_54` chain: decreasing the
tuple size from 50 to 49 changes the unconditional gap consequence from the
diameter-246 tuple to the diameter-240 tuple.

## 2. Published coefficient-artifact audit

Section 7.2 cites this public payload:

`https://www.dropbox.com/sh/0xb4xrsx4qmua7u/WOhuo2Gx7f/Polymath8b`

On 2026-07-12 the URL returned Dropbox's `shared_link_no_access` page.  Bounded
search found copies of the paper and repetitions of the link, but no mirror of
the `k=50,d=27` witness vector.  The paper itself does not print that vector.

An independent reconstruction therefore needs all of the following to be
materially reproducible:

1. the exact ordering and normalization of the 2,526 basis elements
   `(1+epsilon-P_(1))^a P_alpha` with
   `a+|alpha|<=27` and even-entry signatures `alpha`;
2. either the full rational coefficient vector in that order or the exact
   rational `I` and `sum J_i` Gram matrices plus the rational vector;
3. the final exact Rayleigh numerator and denominator that certify `>4.0043`;
4. the structure-constant convention for `P_alpha P_beta`, so an independent
   engine can reproduce the matrices rather than merely trust serialized ones.

Items 1 and 4 are specified in principle in Section 7.1.  Items 2 and 3 are
the missing calibration payload.  Per the preregistration, this is a blocker,
not evidence against `M_(49,epsilon)>4`.

## 3. A general inactive-chamber lemma

Write `S=sum_i t_i`, `b=1-epsilon`, and define

`C_(k,epsilon) = {t_i>=0, S<=1+epsilon, S-t_i>b for every i}`.

For every square-integrable `G` on the enlarged simplex, let

`F = G * 1_(outside C_(k,epsilon))`.

Then, exactly,

`J_(i,1-epsilon)(F)=J_(i,1-epsilon)(G)` for every `i`,

because every point entering the `i`-th marginal obeys `S-t_i<=b` and hence
cannot lie in `C_(k,epsilon)`.  Meanwhile

`I(F)=I(G)-integral_C G^2 <= I(G)`.

Thus removing this chamber can only improve the quotient, and improves it
strictly whenever `G` has positive `L^2` mass there.  This is the medium-`k`
analogue of Section 7.4's observation that its `D` polytope contributes to
`I` but not `J`.

This lemma proves that the boundary-adapted space is not algebraically
identical to the global-polynomial space.  It does **not** prove the required
gain at `k=49`.

## 4. Exact rational boundary-cell primitive

New implementation:

- `src/core/freeBoundaryMaynard.js`
- `tests/free-boundary-maynard.test.js`

`integrateRationalTriangleMonomial` maps a rational triangle affinely to the
standard simplex, expands the requested monomial exactly, and uses

`integral u^a v^b du dv = a! b!/(a+b+2)!`.

For the cut triangle with vertices
`(1/2,1/2),(1,1/2),(1/2,1)`, it gives

`integral x^2 y dx dy = 71/1920 = 0.03697916666666667`.

An independently coded 4,000-by-4,000 nested midpoint quadrature gave
`0.03697916707356370`, an absolute discrepancy of
`4.07e-10`.  The checked-in test repeats the comparison with 800 subdivisions.

This passes the finite/rational-integration gate for one genuine boundary-cut
cell.  General high-dimensional polytope integration is not yet implemented.

## 5. Controlled low-dimensional boundary gain

The audit uses `k=2`, `epsilon=1/2`, support `x+y<=3/2`, and global symmetric
space

`V_0 = span{1,x+y}`.

The cut hyperplanes are `x=1/2` and `y=1/2`.  The triangle

`C={x>=1/2,y>=1/2,x+y<=3/2}`

is invisible to both truncated marginals.  The enriched space is

`V_1 = span{1,x+y,1_C}`.

All Gram entries were computed as reduced rationals.  The numerical generalized
eigenvalues were

| space | optimum |
| --- | ---: |
| global `V_0` | 1.6406675246271507 |
| boundary-enriched `V_1` | 1.7142755506939251 |
| gain | 0.0736080260667744 |

The strict gain is also certified without trusting those eigenvalues:

- for `V_0`, positive definiteness of `(1641/1000)I-A` has leading minors
  `6307/24000` and `128683/1536000000`, hence every global quotient is
  `<1.641`;
- the integer enriched vector `(-1000,462,384)` has exact quotient
  `138736208/80929935 = 1.714275539699865...`.

Therefore the frozen nonzero-gain gate passes exactly, not just numerically.

## 6. `k=49` scaling

The first cut arrangement has one hyperplane `S-t_i=1-epsilon` per coordinate.
There are at most `2^49=562,949,953,421,312` labelled sign cells, but permutation
symmetry identifies sign patterns solely by the number of exceeded cuts.  The
first arrangement therefore has at most 50 orbits, and those orbits can be
enumerated directly without visiting the labelled cells.

The published degree-27 even-signature polynomial space has 373 signatures
and 2,526 basis elements at both `k=49` and `k=50`.  Replicating every polynomial
on all 50 cell orbits would create 126,300 variables.  One dense double matrix
would occupy 127,613,520,000 bytes (118.85 GiB); exact rational matrices and a
dense eigensolve would be substantially worse.  **That naive tensor-product
finite-element implementation is killed.**

The inactive-chamber lemma supplies a much smaller surviving representation:
optimize `G*1_(outside C)` in the same 2,526-dimensional global basis.  `A`
is unchanged and only the `I` matrix needs central-chamber corrections.  At
`k=49, epsilon=1/25`, the chamber is confined to

`49(24/25)/48 < S <= 26/25`, i.e. `0.98<S<=1.04`.

At fixed `S`, its coordinate ceiling is `t_i<S-24/25`.  Inclusion-exclusion is
indexed only by the number of shifted coordinates, with rational breakpoints
`S=j(24/25)/(j-1)`.  This gives a finite orbit-compressed exact-integration
plan; it has not yet been implemented or timed.

## 7. Bounded audit of the 2025 `H_1<=234` claim

The July 2025 ResearchGate preprint by Yuhang Shi,
[*A Weighted Distribution of Primes and a New Unconditional Bound on Gaps
Between Primes*](https://www.researchgate.net/publication/393888742_A_Weighted_Distribution_of_Primes_and_a_New_Unconditional_Bound_on_Gaps_Between_Primes),
claims `H_1<=234`.  The version available on 2026-07-12 does not displace this
target:

1. it says the public database contains a 48-tuple of width 234, but the
   [MIT tuple index](https://math.mit.edu/~primegaps/tuples/) lists
   `admissible_48_236.txt` and `admissible_49_240.txt`; the preprint prints
   only an ellipsis rather than a complete checkable 48-tuple;
2. its Appendix alternates between an `M_k>2` condition and a `rho_k>4`
   condition rather than applying Polymath8b's stated `M_k>2/theta` criterion;
3. continuity is written as an unquantified `O(Delta theta)` term, but the next
   display silently treats the uncontrolled contribution as
   `O((Delta theta)^2)` with no constant or sign bound.

These are direct gaps in the displayed implication, not a judgment based only
on publication venue.  Bounded arXiv search found no rigorous accepted
replacement of the unconditional 246 bound; a 2025 arXiv proposal explicitly
labels its smaller values heuristic.  Stadlmann's accepted distribution result
[arXiv:2309.00425](https://arxiv.org/abs/2309.00425) improves the many-prime
asymptotic rather than asserting a smaller explicit `H_1`.

## 8. Reproduction

```text
npx vitest run tests/free-boundary-maynard.test.js
```

Result after the correction follow-up: 1 file, 4 tests, all passed.

## 9. Decisive correction follow-up

The orbit-compressed inactive-chamber integral has now been derived and
implemented for arbitrary monomial-symmetric signatures and radial powers.
At `k=50, epsilon=1/25`, the exact chamber volume is nonzero and contains
`0.10187658351736954` of the uniform enlarged-simplex mass.  Full formulas,
exact pilots, bulk complexity, and the calibration plan are recorded in
[INACTIVE_CHAMBER_CORRECTION.md](./INACTIVE_CHAMBER_CORRECTION.md).

The integration gate is therefore passed.  The campaign remains parked at
the missing sparse structure-constant/cache engine and published-witness
reconstruction, not at polytope geometry.

The sparse structure-constant and correction-matrix APIs were subsequently
implemented and validated at low degree.  A 28-coefficient degree-seven exact
matrix contraction remained CPU-active but did not complete within a
20-minute ceiling.  The JavaScript exact path is therefore retained for
small/final checks and rejected as the degree-27 discovery engine.  See the
runtime audit and corrected radial eigenvalues in
[INACTIVE_CHAMBER_CORRECTION.md](./INACTIVE_CHAMBER_CORRECTION.md#8-sparse-quadratic-evaluator-and-runtime-ceiling).

## 10. Superseding full-degree breakthrough test

The first-round `PARK` result has now been superseded by the complete
[breakthrough gate](./BREAKTHROUGH_GATE.md). The exact signature and chamber
formulas survive, but the current inactive-chamber route does not produce a
credible `k=49` crossing. The last self-consistent degree-27 direct value is
`3.9760025490`; chamber-optimized independent holdout evaluation gives
`3.9760038765`, with an observed gain smaller than its sampling error. Apparent
values above four occur only after the numerical conditioning identities fail.

Current classification: **kill this mechanism as a privileged breakthrough
route; retain the open `M_(49,epsilon)>4` target.**
