# Rebooted preregistration: one-prime comparison before positivity

Frozen: 2026-07-12, after the failed P3 field-level attack.

Status: **P3-C0a PROJECTION/TRACE TRANSPORT PROVED / P3-C0b KERNEL COMPARISON OPEN / NO SIGN CLAIM**.

Progress notice: `P3_C0A_SONIN_PROJECTION_TRANSPORT.md` proves the exact
orthogonal projection formula for the amplified one-prime Sonin space and
deduces trace-class positivity from the published archimedean trace.  Items 1
and 2 below are therefore closed.  The same-coordinate trace kernel and
Weil-minus-Sonin comparison in items 3--6 remain open.

## Two lanes that must remain separate

### Lane W: fixed-width localized Weil positivity

Let `A_3` be the localized Weil operator at

`a=(log 3)/2`,

including the archimedean term, the prime `2`, and the rank-two pole term.
The standalone target is positivity on a precisely transported pole-neutral
and zero-row support class.

The existing finite CvS/CCM matrices and the pole-free Dirichlet reduction
belong only to this lane.  A proof would be a new localized Weil theorem, but
it is not by itself a Sonin/Rosati transport theorem.

### Lane S: semilocal Sonin domination

Let

`H_S=L^2(X_S)^(K_S)`, `S={infinity,2}`,

with its native scaling action `vartheta_S`, Fourier transform, and semilocal
Sonin subspace as in Connes--Consani--Moscovici.  Let `Pi_Sonin` denote the
orthogonal projection onto the selected Sonin space at the frozen cutoff.

For compactly supported test functions define, only after proving trace-class
admissibility,

`T_S(g,h)=Tr(vartheta_S(g) Pi_Sonin vartheta_S(h)^*)`.

Let `Q_S(g,h)` be the same-normalization semilocal Weil form supplied by the
semilocal trace formula.  The comparison remainder is

`E_S(g,h)=Q_S(g,h)-T_S(g,h)`.

This lane is the actual P3 polarization target.

## First theorem target: P3-C0

Construct `E_S` on a dense, pole-neutral support core and prove all of the
following without assuming RH or importing a zero list.

1. `T_S(g,h)` is well defined and trace class on the frozen core. **Proved in
   P3-C0a, conditional only on the published archimedean admissibility class.**
2. `T_S(g,g)>=0` follows directly from the Hilbert-space trace. **Proved in
   P3-C0a.**
3. `Q_S-T_S=<g,E_S h>` has an explicit kernel or frequency matrix with all
   normalizations fixed.
4. The restriction of the formula to `S={infinity}` reproduces the published
   Connes--Consani archimedean comparison, including its moment correction.
5. The support transport for `supp(g) subset [3^(-1/2),3^(1/2)]` introduces
   prime `2` and no larger prime.
6. The pole-neutral and zero-row constraints are transported explicitly;
   the Groskin row `M_0` may be used only if the comparison map sends it to the
   required semilocal Mellin condition.

P3-C0 is an exact comparison theorem.  It does not require `E_S>=0`.

## Required machine-readable matrix contract

Every finite compression produced after P3-C0 must record:

```text
represents: Q_S | T_S | E_S
domain: named dense core and completion
basis: explicit functions with normalization
constraints: explicit linear functionals
comparisonMap: source and target formulas
finiteOnly: true
promotionAllowed: false until an infinite restriction theorem is proved
```

The first computational calibration must assemble `Q_N`, `T_N`, and
`E_N=Q_N-T_N` independently and verify the identity entrywise.  Existing
certificates for `Q_N` cannot be relabeled as certificates for `E_N`.

## Semantic kills

- `C0-K1`: the trace is not proved finite or densely defined.
- `C0-K2`: the Sonin projection is imported from a non-isometric model without
  transporting its inner product.
- `C0-K3`: the archimedean restriction fails to reproduce the published
  comparison theorem.
- `C0-K4`: the prime-2 term or the support map is missing.
- `C0-K5`: `A_3-W_0,2` is substituted for `A_3-T_S`.
- `C0-K6`: a finite dictionary moment row is identified with a Mellin
  constraint without an explicit map.

Any semantic kill stops the sign campaign but does not kill Lane W.

## Second theorem target: P3-C1

Only if P3-C0 survives, prove

`E_S(g,g)>=0`

on a nonzero, finite-place-sensitive pole-neutral support class.  Before an
infinite proof, run the following kills on the **actual remainder** `E_S`:

1. exact small-basis inertia;
2. stability under canonical restriction;
3. the rank-one compact countermodel;
4. the positive-orbit RH-false controls at the polarization arrow;
5. deletion of the prime factor, which must recover the archimedean theorem.

## Promotion

- P3-C0 alone: `SEMILOCAL COMPARISON THEOREM` if new and fully proved.
- P3-C0 plus finite `E_N>=0`: `P3 REMAINDER LEAD`, no field-level promotion.
- P3-C0 plus infinite `E_S>=0` and a new trace/zero/prime consequence:
  `FIELD-LEVEL BREAKTHROUGH`.
- A proof only in Lane W: `LOCALIZED WEIL THEOREM`; valuable, but not P3
  Sonin transport.

## Decision rule

The immediate next task is P3-C0.  Frequency-tail or nonlocal-Poincare work on
`A_3` is paused as the main campaign and retained only as the independent Lane
W side theorem.
