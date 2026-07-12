# Verdict — free-boundary Maynard 49

Date: 2026-07-12

## Classification

**KILL THE CURRENT INACTIVE-CHAMBER BREAKTHROUGH ROUTE; RETAIN THE OPEN
`M_(49,epsilon)>4` TARGET.**

This supersedes the first-round `PARK` classification after executing the
complete degree-27 numeric control and a direct `k=49` chamber-optimized
holdout. See [BREAKTHROUGH_GATE.md](./BREAKTHROUGH_GATE.md).

The repository now implements the arbitrary even-signature Gram formulas and
central-chamber integration. It still cannot reproduce the published `k=50`
positive control in double precision because the scaled degree-27 Gram problem
has condition estimate about `10^17`. More importantly, the matched `k=49`
free-boundary experiment does not approach four.

## What was killed

The naive adaptive construction that attaches the full degree-27 polynomial
basis to every boundary-cell orbit is killed on scale:

- 2,526 global polynomial directions;
- up to 50 first-layer cell orbits;
- 126,300 tensor-product directions;
- 118.85 GiB for just one dense floating matrix, before exact arithmetic.

Increasing basis rows in that representation is not a credible route.

## What survives as infrastructure

1. **The mathematical target remains open.** An exact
   `M_(49,epsilon)>4`, with `0<epsilon<1`, still implies the unconditional
   `H_1<=240` through Polymath8b Theorem 3.12 and the checked diameter-240
   admissible tuple.  The audited 2025 `H_1<=234` preprint does not contain a
   valid displayed replacement for that implication.
2. **Boundary geometry is exact and computable.** A rational
   toy cell gives an exactly certified gain from `<1.641` to
   `138736208/80929935>1.714`.
3. **Orbit compression survives.** Truncating only the chamber invisible
   to every `J_i` preserves the numerator and removes denominator mass.  Its
   sign geometry has at most `k+1` symmetry orbits and admits a finite
   inclusion-exclusion formulation, without constructing `2^k` cells.

None of these is a privileged breakthrough mechanism. The reduced-support idea
was already proposed during Polymath8b, and polynomial density means truncation
accelerates a finite basis without enlarging the limiting variational space.

## Decisive failed gate

The full `k=49, epsilon=1/24, d=27` stable direct quotient is
`3.9760025490`. After chamber-specific Monte Carlo reoptimization and an
independent 40,000-point holdout, it becomes only `3.9760038765`. Apparent
values above four occur only below the numerical conditioning floor and fail
direct Rayleigh recomputation.

## Exact reopen gate

Do not build a general 49-dimensional mesh or rerun double precision. Reopen
only after a better-conditioned or multiprecision proposal layer can:

1. reproduce the `k=50, epsilon=1/25, d=27` value `>4.0043`;
2. produce a corrected `k=49` proposal above four with material margin;
3. stream the exact chamber and global quadratic forms;
4. verify the integer sign `N-4D>0` independently.

Until then, the open target stays in the Atlas but the current mechanism is
killed as a field-level breakthrough lead.
