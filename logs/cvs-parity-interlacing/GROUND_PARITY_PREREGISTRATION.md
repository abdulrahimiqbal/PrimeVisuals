# Preregistration: cutoff-free CvS ground-parity separation

Date frozen: 2026-07-10, after the stronger full-spectrum interlacing claim
failed.

## Prior information

The cutoff-free audit at `c in {3,5,7,13,17,29,67,100}` and
`N=2,...,12` falsified full spectral interlacing.  In those same data the
narrower inequality needed for the spectral route survived:

`E_0 < O_0`,

where `E_0` and `O_0` are the lowest even- and odd-sector eigenvalues.  The
smallest observed ratio `O_0/E_0` in positive zeta cells was about `84.6`.
This is post-failure evidence and is not a holdout.

Reversing positive prime-power weights broke ground dominance at `c=17`, and
negating the largest prime-power weight broke it at `c=100`.  Thus the observed
ordering is not forced by centrosymmetry or divided-difference structure alone.

## New frozen holdout

- unseen cutoffs: `11,19,23,31,43,59,97`;
- every principal level `N=2,...,16` of the level-16 cutoff-free matrix;
- decimal precision: 90 digits;
- controls: reversed prime weights at `c=23` and a negated largest weight at
  `c=97`.

## Gates

1. `E_0 < O_0` in every zeta holdout cell.
2. The parity gap `O_0-E_0` and the even internal gap `E_1-E_0` are positive
   well above the precision floor.
3. At least one frozen control violates ground dominance, confirming that the
   ordering is not generic matrix parity.
4. A proof candidate must be one-way and unconditional: an explicit comparison
   map, variational inequality, oscillation theorem, or positive kernel for the
   parity difference.  It may not assume Weil positivity or RH.
5. Passing the finite ladder does not settle the continuum statement.  A
   promotion must control the `N->infinity` parity gap sufficiently to show that
   the compact-resolvent ground state is even and simple.

## Classification

A finite pass without item 4 is `NEW NUMERICAL CONJECTURE`, not a breakthrough.
An exact finite comparison theorem would address part of the first missing
step identified by Connes--Consani--Moscovici.  The RH route would still require
the continuum limit and characteristic-function convergence.

