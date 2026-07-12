# Frontier 2 kill campaign: finite-field geometric discriminator

Frozen: 2026-07-12

## Target

Test whether a genuinely new, minimal intrinsic package selected from

1. effectivity;
2. a Jacobian/polarization/Rosati structure;
3. purity;
4. restriction compatibility

rejects every frozen positive-orbit RH-false control and proves the
finite-field square-root bound without assuming that bound in different
language.

The campaign concerns smooth projective curves and their weight-one
Frobenius.  It does not attempt an arithmetic transport to `Spec Z`.

## Declared prior repo evidence

The following are prior evidence, not discoveries of this campaign:

- `src/core/arithmeticHodgeControls.js` constructs the infinite control family
  with positive integral closed-orbit counts;
- `src/core/rosatiDiscriminator.js` proves the exact degree-two adjoint-form
  identity `det J=4q-a^2`;
- `logs/arithmetic-hodge-transport/rosati-discriminator/FINITE_FIELD_RECONSTRUCTION.md`
  reconstructs the standard Jacobian/Rosati implication;
- `tests/arithmetic-hodge-controls.test.js` and
  `tests/rosati-discriminator.test.js` verify the frozen discovery cell and
  three holdouts with exact integer arithmetic.

This campaign must go beyond observing that those four examples fail a fitted
matrix test.

## Frozen controls

For distinct positive integers `u,v`, let

`r=2^u`, `s=2^v`, `q=rs`, and

`Z_(r,s)(T)=((1-rT)(1-sT))/((1-T)(1-qT))`.

The reciprocal roots are `r,s`, so the square-root bound fails.  Discovery
cell: `(u,v)=(1,2)`.  Holdouts: `(1,3)`, `(2,3)`, `(2,5)`.  A valid argument
must cover all `u != v`, not only these four cells.

## Frozen admissibility rules

A package is admissible only if:

- all objects and maps are defined before inspecting the Frobenius spectrum;
- effectivity means a stated geometric or counting property, not “the desired
  intersection form is positive”;
- purity is a conclusion, never a hypothesis;
- a polarization is an ample line-bundle/isogeny construction, not an
  arbitrary positive matrix chosen to unitarize Frobenius;
- restriction compatibility names the objects, maps, and commuting identities;
- comparison with the zeta numerator is a proved arrow;
- sufficiency is symbolic for the whole control family;
- minimality is supported by axiom-deletion countermodels.

## Pass gates

### P1 — exact sufficiency

State and prove an implication whose conclusion is that every reciprocal root
of the curve zeta numerator has modulus `sqrt(q)`.

### P2 — independent construction

Every positivity or adjoint datum used by P1 must arise from geometry without
using the Hasse bound, purity, the zeta roots, or a form fitted to Frobenius.

### P3 — control rejection

Name the first failed axiom for every `Z_(r,s)`, prove failure for all
`r != s`, and retain all earlier axioms in the control.

### P4 — genuine minimality

For each retained axiom, either give an axiom-deletion countermodel or prove
that it follows from the remaining intrinsic data.  Labels such as “Jacobian”
do not count as single axioms if several internal arrows are doing the work.

### P5 — field-level novelty and payoff

The surviving implication must not be the classical Rosati proof, elementary
unitary linear algebra, or a restatement of purity.  It must have an
independent new consequence beyond reproving the known finite-field
square-root bound.

## Kill gates

- **K1 Effectivity acceptance:** the controls pass the proposed effectivity
  condition in every degree.
- **K2 Purity renaming:** the conclusion or an equivalent positive form is an
  input without an independent geometric construction.
- **K3 Vacuous compatibility:** the compatibility axiom is passed by the
  control under all base extensions or can be satisfied by a constant/truncated
  diagram.
- **K4 Known Rosati core:** the only sufficient survivor is the standard
  polarized-abelian-variety theorem `pi^dagger pi=[q]` plus zeta comparison.
- **K5 No independent payoff:** the result supplies no new theorem after the
  known square-root bound is removed.

## Verdict rule

- `SURVIVE — FIELD-LEVEL`: P1–P5 all pass and no kill fires.
- `PARK`: a non-circular package survives but minimality or comparison remains
  genuinely unresolved.
- `KILL AS BREAKTHROUGH / RETAIN AS CONTROL`: a kill fires while the package
  remains useful as a regression test or dependency map.
