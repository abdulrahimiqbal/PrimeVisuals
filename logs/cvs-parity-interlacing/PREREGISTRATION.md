# Preregistration: cutoff-free CvS parity interlacing

Date frozen: 2026-07-10

## Seed observation

Low-dimensional, finite-archimedean-cutoff matrices at
`c in {3,5,7,13}` and `N<=7` suggested strict alternation between the
even- and odd-parity spectra.  These seed cells are calibration only.

For the cutoff-free Connes--van Suijlekom / Connes--Consani--Moscovici
Galerkin matrix at level `N`, write

`E_0 <= ... <= E_N`

for the even-sector eigenvalues and

`O_0 <= ... <= O_(N-1)`

for the odd-sector eigenvalues.

## Frozen claim

The candidate finite law is strict parity interlacing:

`E_j < O_j < E_(j+1)` for every `0<=j<N`.

If this held at every level and passed to the compact-resolvent limit with a
non-collapsing first parity gap, it would force the bottom eigenvalue to occur
in the even sector.  Strict interlacing alone does not prove positivity or RH.

## Frozen cells

- calibration cutoffs: `3,5,7,13`;
- unseen cutoff holdout: `17,29,67,100`;
- dimensions: every principal level `N=2,...,12` extracted from a level-12
  cutoff-free matrix;
- arithmetic controls: reverse the positive prime-power weights across their
  source locations, and negate the largest prime-power weight;
- precision rerun: every surviving holdout cell is repeated at higher decimal
  precision before promotion.

## Gates

1. Reproduce the published cutoff-free `c=13,N=4` even spectrum.
2. Strict interlacing in every calibration and holdout cell, with margins well
   above the precision floor.
3. Identify whether the law survives either arithmetic control.  Survival
   under arbitrary signed controls classifies it as generic divided-difference
   geometry, not a zeta-specific invariant.
4. Derive a matrix identity or a one-way Loewner/oscillation theorem that
   implies interlacing.  Numerical alternation alone is not promotable.
5. Audit current CvS, CCM, Suzuki, Groskin, and Loewner-matrix literature for
   the same parity statement.

## Anti-circularity

Interlacing is not equivalent to sampled Weil positivity: the ordering can be
tested when one or more eigenvalues are negative.  A useful result must explain
the ordering without assuming RH and must distinguish the finite theorem from
the still-open uniform/continuum parity gap.

