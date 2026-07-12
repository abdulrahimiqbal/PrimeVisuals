# Preregistration: localized prime-frame coverage audit

Date frozen: 2026-07-10

Write the Brownian-whitened sampled Weil kernel as

`M = H + T`,

where `H = archimedean - 2 W I`,
`W=sum_{n<=exp(a)} Lambda(n)/sqrt(n)`, and `T` is the sum of positive
triangular increment kernels. Let `U_-` be the negative eigenspace of `H`.

The primary statistic is the generalized lower frame bound of `T` on `U_-`
relative to the deficit `-H`. A value above one means the triangular prime
frame covers the raw negative deficit. Because coupling to the positive
eigenspace can lower the final margin, the strict statistic is the normalized
Schur-complement reserve after that leakage is subtracted.

Frozen cells: the previous radii, dimension 28, uniform and Chebyshev grids.

A lead requires:

1. raw coverage above one and strict Schur reserve above zero in every cell;
2. stable negative-subspace dimension or an explicit law for its changes;
3. a reserve law depending on low-complexity quantities (`a`, `W`, knot count)
   that extrapolates across the final third;
4. a novelty audit showing the law is not merely finite-section Weil
   positivity or the Schur complement identity.

The Schur identity itself is a control, not a discovery. A publishable outcome
would be a uniform analytic lower frame bound for the prime triangular family
on the archimedean negative subspace.
