# Novelty audit: localized frame coverage

Date: 2026-07-10

## What passed

On the frozen 28-point uniform and Chebyshev grids, write the
Brownian-whitened sampled screw kernel as `M=H+T`, where `H` is the
archimedean block together with the `-2 W I` part of the prime knots and `T`
is the sum of their positive triangular increments.  The triangular block
covers the negative eigenspace of `H` in every tested cell.  The normalized
Schur complement remains positive after leakage through the nonnegative
eigenspace is removed.

## Why this is not a new law

For all sufficiently large sampled radii the negative eigenspace of `H` is
the entire 28-dimensional space.  In that regime there is no complementary
positive block and no leakage term.  If `D=-H>0`, the reported condition is

`lambda_min(D^(-1/2) T D^(-1/2)) > 1`.

This is equivalent, by congruence, to `T-D=H+T=M>0`.  Thus the apparent
frame-coverage law is exactly the finite sampled Weil positivity statement,
expressed in deficit-normalized coordinates.  Its shrinking reserve is not
an independently controlled quantity.

At the first few radii, where `H` has both signs, the Schur complement is
also an exact necessary-and-sufficient test for `M>0` whenever its positive
block is positive.  The early leakage values therefore diagnose the
geometry of the finite matrix, but they do not provide a new sufficient
condition or proof mechanism.

## Extrapolation verdict

The reserve falls toward zero and changes with the grid.  No lower bound in
terms of `a`, the prime-knot count, or
`W=sum Lambda(n)/sqrt(n)` was preregistered and then validated on a holdout.
Extrapolating the observed positive values would be invalid: finite-section
positivity is expected over every computable range even if RH is false.

## Status

`FINITE IDENTITY PASSED / ALGEBRAICALLY TAUTOLOGICAL / NOT PROMOTED`.

The useful residue is methodological.  Any successor invariant must survive
one of the following anti-circularity tests:

1. it implies positivity by a strict one-way inequality rather than being
   equivalent to the sampled minimum eigenvalue;
2. it has an analytic lower bound using inputs weaker than RH;
3. it predicts an out-of-sample scale or parity sector not used in its
   definition; or
4. it controls the finite-interval characteristic functions in Suzuki's
   conjectural limit, rather than merely rechecking the kernel.

