# Preregistration: Rosati--Hodge discriminator and arithmetic transport

Frozen: 2026-07-12, before the dedicated source reconstruction and transport
audit.

## Goal

Attempt a field-level theorem by isolating the weakest independently geometric
positivity package that forces the finite-field critical circle, proving that
the positive-orbit RH-false controls violate exactly that package, and
transporting the package to an arithmetic carrier without defining it from
zeta zeros or Weil's RH-equivalent quadratic form.

The campaign may end in a breakthrough lead, a precise obstruction theorem, or
a kill.  It may not end with a numerical pattern or an unspecified appeal to
"missing geometry."

## Frozen control family

For distinct positive integers `u,v`, set

`q=2^(u+v)`, `r=2^u`, `s=2^v`,

`Z_(u,v)(T)=((1-rT)(1-sT))/((1-T)(1-qT))`.

This family has nonnegative integer closed-orbit counts, an exact Euler
product, reciprocal functional equation, and algebraic weight-one duality.
Its spectral weights are `u/(u+v)` and `v/(u+v)`, off `1/2`.

The discovery cell is `(u,v)=(1,2)`: `q=8`, numerator
`1-6T+8T^2`, Frobenius roots `2,4`.  Holdouts are `(1,3)`, `(2,3)`, and
`(2,5)`.

## Candidate minimal finite-field package

For a curve `C/F_q`, seek the smallest package implying the critical circle:

1. a Jacobian/Picard object `J(C)` defined without its zeta polynomial;
2. Frobenius `F` and Verschiebung `V` as geometric endomorphisms;
3. `FV=VF=[q]`;
4. a polarization `lambda` and Rosati involution `dagger` with `F^dagger=V`;
5. positivity of the Rosati trace/intersection form;
6. comparison identifying the characteristic polynomial of `F` with the zeta
   numerator.

The expected linear-algebra core is

`F^dagger F = q I`.

With a positive Hermitian realization this makes `q^(-1/2)F` unitary and
forces every Frobenius eigenvalue to have modulus `sqrt(q)`.  Algebraic duality
without positivity is insufficient, as the control family demonstrates.

## Candidate continuous arithmetic package

For an arithmetic carrier with a scaling flow `Phi_t=exp(t Theta)` on a
weight-one object, the exponentiated analogue is

`Phi_t^dagger = exp(t) Phi_(-t)`.

Equivalently, on a valid common domain,

`Theta^dagger = 1-Theta`.

If `dagger` is the adjoint of an independently constructed positive
polarization, `Theta-1/2` is skew-adjoint.  This is a target consequence, not
an allowed definition of the pairing.

## Evidence tasks

1. Reconstruct the curve/Jacobian/Rosati proof from primary sources and mark
   every use of effectivity, positivity, semisimplicity, and comparison.
2. Prove the minimal finite-dimensional discriminator exactly and implement it
   over rational data for the frozen controls.
3. Determine whether each arithmetic carrier can independently define:
   `J`, `Phi`, transpose/dual, multiplication/degree, a pairing, positivity,
   and analytic comparison.
4. Attempt the first new theorem at the strongest carrier-supported level.
5. Run the positive-orbit controls and at least one orthogonal control through
   the proposed axiom package.

## Anti-circularity kills

### K1 -- Hasse-bound renaming

Kill a proposed discriminator if its hypothesis is the critical-circle/Hasse
bound, Weil positivity, or spectral unitarity inserted without an independent
geometric construction.

### K2 -- target-defined pairing

Kill if the pairing is defined as the Weil quadratic form, fitted from zeta
zeros, chosen from a target Cholesky factor, or selected to make the desired
operator normal/unitary.

### K3 -- analogy without objects

Kill an arithmetic transport if `J`, `Phi`, `dagger`, or the positive cone is
only metaphorical in the selected framework.  Every symbol must have a native
definition and proved algebraic laws.

### K4 -- finite positivity without restriction

Kill promotion if positivity is only a finite matrix fact without canonical
restriction maps and uniform bounds leading to a dense analytic core.

### K5 -- control acceptance

Kill a proposed sufficient package if it also accepts every frozen
positive-orbit RH-false control.

## Promotion levels

### P1 -- exact discriminator

An exact theorem identifies the minimal positive geometric axiom rejecting the
controls, with no new arithmetic construction.  This is a valid foundational
result, not a field-level breakthrough.

### P2 -- arithmetic Rosati datum

One arithmetic carrier natively defines the Jacobian/Picard analogue, flow,
duality/transpose, and the algebraic relation
`Phi_t^dagger=exp(t)Phi_(-t)` on a nontrivial class, independently of zeros.
Positivity may remain open.  This is a theorem-level research lead.

### P3 -- partial positive transport

The same carrier has an independently proved positive polarization on a
nontrivial finite-place-sensitive class, rejects the controls at that axiom,
and yields a new unconditional zero, prime, trace, or special-value
consequence.  This is the minimum `FIELD-LEVEL BREAKTHROUGH` grade.

### P4 -- uniform closure

The positive class has compatible restrictions and uniform estimates closing
to the full weight-one test space.  This is RH-level only after the determinant
comparison is also proved.

## Verdicts

- `KILLED`: a hard kill invalidates the proposed package.
- `EXACT DISCRIMINATOR / TRANSPORT BLOCKED`: P1 only.
- `ARITHMETIC ROSATI LEAD`: P2.
- `FIELD-LEVEL BREAKTHROUGH`: P3.
- `RH-LEVEL PROGRAM`: P4 plus trace/determinant comparison.

The report must name the first unproved arrow.  "Invent new cohomology" or
"prove positivity" without a native object and exact statement is not a
verdict.
