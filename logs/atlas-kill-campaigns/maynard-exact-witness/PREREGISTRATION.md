# Preregistration — exact Maynard witness kill campaign

Date frozen: 2026-07-12

## Target

Attack Atlas frontier 5: determine whether the existing exact Krylov moment
engine can cross the modern published standard-simplex calibration
`M_54 > 4.00238` and then produce a **strictly stronger rationally certified
witness** with a checked bounded-gap consequence.

This lane is theorem-adjacent, not an anomaly search. Numerical eigenvalues are
proposal generators only.

## Pass gates

1. Reproduce a rational witness with exact BigInt Rayleigh quotient above
   `4.00238` for the standard-simplex `M_54` problem.
2. Search a preregistered neighboring Krylov depth/basis cell not used for the
   calibration and obtain an exact quotient strictly above the best published
   comparator located in the source audit.
3. Independently recompute the exact quotient from the recorded coefficient
   vector.
4. Name and verify a downstream prime-gap consequence; distinguish the
   variational improvement from the admissible-tuple diameter input.

Only all four gates permit a theorem-level survivor.

## Kill / park gates

- If the implemented Krylov family cannot reproduce `4.00238`, kill it as a
  discovery basis and retain it only as a partial calibration.
- Treat ill-conditioning, nonconvergence, coefficient rationalization loss, or
  impractical exact-moment growth as a failed cell.
- If a stronger numerical value has no exact rational certificate, it does not
  survive.
- If the result is already in the published Polymath table or yields no new
  admissible-tuple consequence, it is not a field-level finding.
- Reopen only on a richer exact basis, a certified high-precision solver that
  reproduces the modern benchmark, or a new admissible-tuple theorem.

## Frozen search ladder

1. Recheck existing dimensions 16 and 20.
2. Evaluate exact Krylov dimensions 21, 22, 24, and 26 in order, stopping when
   exact moment generation or rational certification becomes impractical.
3. Use at least 110 decimal digits and rationalize at at least 60 decimal
   places for any cell numerically above 4.
4. Do not change the operator, support, or quotient after seeing results.

## Controls

- Exact reproduction of the `k=5` published Krylov table value.
- Exact rational quotient from the final coefficients.
- Numerical generalized-eigen residual and precision escalation.
- Published `M_54 > 4.00238` comparator.
- Separate novelty and downstream-consequence audits.
