# First survival round — free-boundary Maynard 49

Frozen: 2026-07-12

## Target

Test whether the proposed boundary-adapted enlarged-simplex mechanism has a
reproducible mathematical and computational path to an exact
`M_(49,epsilon)>4` certificate.  This round does not claim the target theorem.

## Frozen gates

1. Source-reconstruct the exact definition and implication chain for
   `M_(50,1/25)>4.0043` and `M_(49,epsilon)>4 => H_1<=240`.
2. Locate a public coefficient artifact for the published k=50 witness or
   specify every datum needed to reconstruct it.  Missing data is a calibration
   blocker, not evidence against `M_(49,epsilon)`.
3. Implement or derive an exact rational integral primitive for at least one
   boundary-cut piecewise-polynomial cell and independently compare it with
   numerical quadrature.
4. Demonstrate on a low-dimensional enlarged-simplex problem that aligning the
   mesh with `sum_(j!=i)t_j=1-epsilon` changes the variational space and produces
   a reproducible nonzero boundary gain over the uncut polynomial subspace.
5. Estimate the orbit/cell growth at k=49.  The proposed mechanism is killed if
   exact cell enumeration is already exponentially intractable before symmetry
   reduction or if the boundary-adapted space is algebraically identical to the
   killed standard-simplex space.

## Promotion

- **Survive:** exact primitives and a nonzero controlled boundary gain exist,
  with a credible symmetry-reduced k=50 calibration plan.
- **Park:** the target remains valid but published coefficients or scalable
  implementation are missing.
- **Kill this mechanism:** boundary geometry gives no new direction, exact
  integration cannot be made finite/rational, or symmetry reduction still
  leaves an infeasible representation without a new compression theorem.

Progress is a certified lower/upper interval and reproducible boundary gain,
not an unstable eigenvalue.
