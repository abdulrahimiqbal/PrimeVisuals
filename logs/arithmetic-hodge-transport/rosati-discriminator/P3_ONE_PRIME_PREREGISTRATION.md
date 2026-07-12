# Preregistration: first finite-place semilocal polarization

Frozen: 2026-07-12, before a dedicated Galerkin or kernel computation.

Audit notice: the subsequent attack found that the computed CvS/CCM matrices
represent the localized Weil form, while the pole-free Dirichlet operator
subtracts the rank-two pole term.  Neither is the Sonin comparison remainder
required below.  This frozen document remains the historical target; work now
continues under the semantic comparison gate in
`P3_REBOOT_PREREGISTRATION.md`.  See `P3_ATTACK_AND_RESET.md`.

## Target

Take the first genuinely finite-place-sensitive semilocal set

`S={infinity,2}`

and the first support threshold after the archimedean-only theorem:

`supp(g) subset [3^(-1/2),3^(1/2)]`.

Then `f=g*g^*` has support in `[1/3,3]`, so the finite part of the explicit
formula contains the prime `2` and no prime `>=3`.  Let `P_S(g)` denote the
negative of the `S`-local Weil functional in the unitary normalization and let
`Sonin_S(g)` be the positive compressed-scaling trace on the native semilocal
Sonin space.

The theorem target is

`P_S(g) >= Sonin_S(g) >= 0`

for every smooth `g` in the support class satisfying the pole-removal Mellin
conditions at the two trivial weight directions (and at zero if required by
the selected normalization).

All normalizations must be derived from one published semilocal trace formula
before a sign computation.  A change of normalization may not change the
mathematical support class or delete the `p=2` term.

## Why this is the first new rung

- At support `[1/2,2]` for `f`, no rational prime contributes; the positive
  archimedean theorem is already known.
- The set `{infinity,2}` has a native semilocal Hilbert space, scaling action,
  Fourier duality, quasi-inner local-factor product, infinite-dimensional
  Sonin space, and determinate Jacobi moment problem.
- No reviewed source proves the displayed domination/sign inequality with the
  finite place present.

This is the `q=3` instance of the semilocal support program proposed in
[Connes--Consani, *The Scaling Hamiltonian*](https://arxiv.org/abs/1910.14368).

## Required proof objects

1. An explicit self-adjoint remainder operator `E_(infinity,2;3)` such that
   `P_S-Sonin_S=<g,E g>` on the pole-neutral support space.
2. A proof from its native kernel that `E_(infinity,2;3)>=0`, or an equivalent
   sharp spectral/norm bound.
3. Exact compatibility with the archimedean theorem after deleting the
   `p=2` local factor.
4. A trace/explicit-formula corollary stated without assuming RH or using a
   zero list.

## Kills

- `K1`: finite Galerkin PSD, even with interval arithmetic, is not the theorem.
- `K2`: quasi-innerness, compactness, or membership in a Schatten ideal is not
  a sign theorem.
- `K3`: positivity of the moment measure `|gamma_infinity gamma_2|^2` is not
  positivity of the Weil remainder.
- `K4`: a kernel fitted from zeta zeros or from the target Weil matrix is
  circular.
- `K5`: an inequality only on a post-hoc finite basis, without a dense core and
  restriction theorem, does not promote.
- `K6`: deleting the prime term or shrinking back below the prime-2 threshold
  is the already known archimedean theorem, not progress on P3.

## Controls

1. The positive-orbit RH-false reciprocal family must fail at the positive
   polarization axiom, not earlier algebraic duality.
2. The rank-one compact countermodel `K=2P` must be rejected: `K` is compact
   and trace class, but `I-K` has a negative eigenvalue.
3. A correct construction must reduce to the proved archimedean carrier when
   the finite factor is removed.

## Promotion

- Exact kernel identity only: `P3-KERNEL LEAD`.
- Kernel identity plus rigorous sign and new semilocal trace consequence:
  `FIELD-LEVEL BREAKTHROUGH`.
- Numerical positivity or compactness only: no promotion.
