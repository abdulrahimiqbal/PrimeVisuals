# One-prime finite reconnaissance

Date: 2026-07-12

Status: **LOCALIZED-WEIL FINITE KILL TEST SURVIVES / DOES NOT TEST THE SONIN REMAINDER**.

Post-attack correction: the matrices below are compressions of the localized
Weil operator `A_3`.  They are not compressions of the preregistered comparison
remainder `A_3-T_Sonin`.  Consequently this reconnaissance belongs to Lane W
of `P3_REBOOT_PREREGISTRATION.md` and cannot promote the Sonin/Rosati P3 claim.

## What was tested

After freezing the `S={infinity,2}`, `q=3` target, we evaluated the
cutoff-free finite Weil blocks at prime cutoff `c=3`.  These are not matrices
assembled from a finite archimedean quadrature: every entry uses the closed
digamma/trigamma formulas, and interval `LDL^T` determines the inertia.

The implementation is the released ancillary script
`arb_ldlt_certify.py` from
[Groskin, *A finite Guinand--Weil dictionary and archimedean tail order*](https://arxiv.org/abs/2607.02828).
The downloaded script hash

`02462e7f75a601ed8a5cc4d5c22064ece8088140ff45b9a21fd0295162c72039`

matches the upstream release manifest.  The exact run metadata and output
hashes are in `one-prime-galerkin-audit.json`.

## Rigorous finite result

| band `N` | dimension | Arb precision | positive pivots | negative | undecided |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 8 | 17 | 400 bits | 17 | 0 | 0 |
| 20 | 41 | 600 bits | 41 | 0 | 0 |
| 50 | 101 | 600 bits | 101 | 0 | 0 |
| 100 | 201 | 600 bits | 201 | 0 | 0 |
| 200 | 401 | 1000 bits | 401 | 0 | 0 |

Thus no finite negative direction occurs through dimension `401`; each row is
a rigorous interval-inertia certificate.

## Diagnostic spectral shape

Floating midpoint eigenanalysis was used only to choose the next theorem, not
to certify a sign.  The unconstrained minimum decreases from
`3.06e-7` at `N=4` to `5.53e-8` at `N=400` and appears to approach a positive
limit.  Its eigenvector is even and almost entirely supported on frequencies
`0, +/-1, +/-2`.

The unconstrained near-null mode is largely removed by two exact
finite-dictionary rows.  In the even sector:

- imposing the exact pole-neutral row gives minimum `9.449e-4` at `N=400`;
- imposing both the zero moment and pole-neutral row gives `9.650e-4`.

Here “zero moment” means Groskin's coefficient row
`M_0(v)=v_0+sqrt(2) sum_(k>=1)v_k`.  Its identification with the semilocal
Mellin-zero condition has not been proved and is now a separate comparison
obligation.

This is about four orders of magnitude larger than the unconstrained minimum.
It makes the first finite-place theorem substantially more plausible than the
raw full-block conditioning suggests.

## Why this is not the theorem

The matrices are nested principal compressions, so their least eigenvalues are
nonincreasing.  Positivity through any fixed `N` cannot exclude a later
negative direction or convergence to zero.  The preregistered finite-PSD kill
therefore remains in force.

Likewise, the diagnostic constrained eigenvalues were computed from floating
midpoints.  The rigorous full-matrix positivity implies positivity on those
finite constrained subspaces, but the displayed lower bounds themselves are
not interval certificates.

## The sharpened first lemma

Let `A^(3)` be the bi-infinite frequency matrix of the `c=3` form.  Split

`ell^2(Z)=H_low direct-sum H_tail`

with `H_low` containing the few central modes.  The precise next lemma is:

1. prove `A_tail >= eta I` for an explicit `eta>0`;
2. define the infinite Schur complement
   `S=A_low-low-A_low-tail A_tail^(-1) A_tail-low`;
3. prove `S>0` on the pole-neutral and zero-moment subspace, with an explicit
   error bound from a finite interval approximation.

The numerical audit shows a large high-frequency gap and a low-dimensional
dangerous sector, but crude Hilbert--Schmidt bounds lose the cancellations by
orders of magnitude.  The proof must exploit the divided-difference/Cauchy or
Toeplitz structure of the tail, not entrywise absolute values.

The continuum form identity gives an equivalent route.  After subtracting the
rank-two pole term, the operator is a positive nonlocal jump form plus an
explicit potential.  At `c=3` that potential is strongly negative, so the
pointwise-potential shortcut fails.  The needed tail estimate is equivalently
a constrained nonlocal Poincare inequality.  See `POLE_FREE_FORM_AUDIT.md`.

If this frequency-tail Schur lemma is proved, it yields a fixed-width
localized Weil theorem after the constraint transport is checked.  It does
not yield Sonin domination without the missing comparison identity.  It is
not yet proved here.
