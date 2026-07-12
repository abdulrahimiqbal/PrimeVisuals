# Preregistration — generic non-CM family residual kill campaign

Date frozen: 2026-07-12

## Target

Attack Atlas frontier 4: find a concrete generic non-CM elliptic-family
statistic with

1. an exact finite-field theorem baseline;
2. explicit removal of CM, special-automorphism, local-congruence, and
   complete-family terms;
3. a nonzero normalized residual that is computable on a genuine scale ladder;
4. a plausible proof path not already equal to a standard trace formula,
   character-orthogonality identity, or Sato--Tate calibration.

The starting family is the non-isotrivial Legendre family
`E_lambda: y^2=x(x-1)(x-lambda)`, with `lambda` outside the singular and
special-automorphism loci.

## Candidate screen, frozen before new data

Evaluate in order:

1. complete-family second and higher trace moments after special-locus
   excision;
2. fixed generic `lambda` trace statistics across rational primes;
3. incomplete generic `lambda` windows;
4. generic supersingular-root statistics;
5. a concrete l-adic trace-function residual if and only if conductor,
   normalization, integer analogue, and theorem baseline are all explicit.

## Pass gates

- A precise residual is stated before observing its values.
- The finite-field baseline is a sourced theorem rather than a heuristic.
- The residual is not identically determined by complete-family
  orthogonality, Eichler--Selberg/Hecke traces, Sato--Tate, CM/special loci,
  or fixed congruence characters.
- Integer and field computations have a preregistered scale ladder, holdout,
  and matched controls.
- A survivor supplies either a new exact identity/lemma or a replicated,
  literature-audited conjecture with an explicit proof obligation.

## Kill gates

- Kill any complete-family cell whose residual is exactly a known character
  or trace-formula term.
- Kill any signal reproduced by CM, special-locus, local-congruence,
  degree-shell, or family-selection controls.
- Stop before data if no nonzero residual and exact theorem baseline can both
  be named.
- Lack of a full-scale integer trace engine is a hard eligibility failure, not
  permission to promote pilot-scale plots.
- Reopen only when a theorem supplies an incomplete-family baseline or a fast
  exact generic trace engine makes the frozen ladder feasible.

## Prior evidence held out for audit

- Cycle 020 non-CM Legendre pilot: exact object, but pilot scale and absorbed
  by controls.
- Cycle 021 special supersingular residual: full scale, but exactly local/CM.
- Cycle 022 obstruction map: no registered class simultaneously had a named
  nonzero residual, exact baseline, and full integer implementation.
