# Cycle 011 obstruction-class transport map

Purpose: start from finite-field failure modes and only allow a new experiment when the same obstruction has a theorem-shaped integer form that is not already a known local control.

## Summary

- Obstruction classes: 7
- Honest known local transports: 2
- Non-actionable/no-new transports: 5
- Experimentally actionable classes: 0
- Branch decision: NO_ACTIONABLE_OBSTRUCTION_CLASS
- Stopped reason: Every same-form obstruction is known local structure already controlled, and every other finite-field failure mode has no honest integer transport.
- Next required artifact: cycle-012 branch-stop ledger or new-domain proposal outside aggregate Two-Universes transport

## Transport Class Counts

| transport class | count |
| --- | ---: |
| honest-known-local-transport | 2 |
| no-honest-integer-transport | 2 |
| obstruction-or-coefficient-space-only | 1 |
| finite-field-obstruction-no-classical-analogue | 1 |
| finite-field-complete-family-only | 1 |

## Obstruction Classes

| id | theorem shape | transport | eligible | reason | prior cycles |
| --- | --- | --- | --- | --- | --- |
| repeated-root-squarefactor | squarefactor-zero obstruction | honest-known-local-transport | false | Transport is exact but classical; previous squarefree/local controls already absorbed it. | cycle-004, cycle-005, cycle-008 |
| linear-factor-admissibility | admissibility / singular-series local factor | honest-known-local-transport | false | Transport is exact at the local-obstruction level, but it is the classical admissibility/singular-series object already controlled in prior cycles. | cycle-002, cycle-003, cycle-004, cycle-005, cycle-007 |
| pellet-discriminant-square-class | odd-characteristic discriminant character | no-honest-integer-transport | false | The exact finite-field mechanism depends on coefficient-space geometry with no same-form integer object. | cycle-001, cycle-009, cycle-010 |
| berlekamp-artin-schreier-parity | characteristic-2 trace obstruction | no-honest-integer-transport | false | Characteristic-2 algebra is not a transport map to integer primes. | cycle-001, cycle-008, cycle-009, cycle-010 |
| coefficient-space-morse-failure | generic Morse condition / non-generic exception | obstruction-or-coefficient-space-only | false | The obstruction is tied to coefficient-space families, not an integer-local obstruction. | cycle-001, cycle-009, cycle-010 |
| residue-theorem-bouniakowsky-obstruction | global finite-field residue obstruction | finite-field-obstruction-no-classical-analogue | false | The obstruction argues against transport instead of producing a Z statistic. | cycle-009, cycle-010 |
| complete-degree-shell-cancellation | complete-shell cancellation identity | finite-field-complete-family-only | false | The exact cancellation is a calibration identity, not an integer-prime experiment. | cycle-008, cycle-009 |

## repeated-root-squarefactor

Finite-field identity: mu(F)=0 exactly when F has a repeated irreducible factor; equivalently gcd(F,F') != 1.

Finite-field failure mode: Repeated roots make discriminant zero and remove the polynomial from squarefree Mobius parity statistics.

Integer same-form test: mu(n)=0 exactly when n has a repeated prime factor.

Next use: Keep as a mandatory local control, never as a breakthrough signal.

## linear-factor-admissibility

Finite-field identity: A polynomial tuple is locally inadmissible when some low-degree irreducible divides every shifted member in the local pattern.

Finite-field failure mode: Irreducible-pair and tuple counts vanish or distort before local obstruction removal.

Integer same-form test: Prime tuples are blocked when a residue class modulo p forces divisibility for every candidate.

Next use: Keep as required baseline subtraction for any future tuple statistic.

## pellet-discriminant-square-class

Finite-field identity: For odd q and squarefree F, polynomial Mobius parity is (-1)^deg(F) times the quadratic character of Disc(F).

Finite-field failure mode: Coefficient-space discriminant square classes create exact Mobius parity structure.

Integer same-form test: No integer coefficient-space discriminant character determines mu(n) or primality.

Next use: Use in novelty audits to reject coefficient-neighborhood Mobius claims over Z.

## berlekamp-artin-schreier-parity

Finite-field identity: In characteristic 2, Berlekamp/Artin-Schreier trace data replaces the quadratic discriminant character for Mobius parity mechanisms.

Finite-field failure mode: Characteristic-2 trace parity creates q=2-specific Mobius behavior.

Integer same-form test: No integer Artin-Schreier trace-parity analogue exists.

Next use: Treat q=2-only behavior as a warning flag unless an independent integer obstruction is named.

## coefficient-space-morse-failure

Finite-field identity: Very-short-interval theorems require generic/Morse coefficient-space conditions; non-generic centers can violate the generic correlation law.

Finite-field failure mode: A polynomial center can be exceptional because its coefficient-line family has bad critical-value geometry.

Integer same-form test: Integer short intervals do not have a coefficient-line Morse condition with the same logical form.

Next use: Use as a negative-control catalog for future finite-field experiments.

## residue-theorem-bouniakowsky-obstruction

Finite-field identity: Some finite-field polynomial-prime-value analogues fail from global Mobius/residue-theorem obstructions.

Finite-field failure mode: A theorem-side obstruction exists even when the naive classical analogue would predict no obstruction.

Integer same-form test: No known classical integer obstruction has the same residue-theorem form.

Next use: Use as a veto class for finite-field-only discoveries.

## complete-degree-shell-cancellation

Finite-field identity: Complete monic degree shells can have exact Mobius/Liouville cancellations caused by the rational zeta function of F_q[t].

Finite-field failure mode: Complete-family averaging produces exact finite-field identities with no sampled integer counterpart.

Integer same-form test: Integer partial sums over n<=X are not complete finite coefficient shells.

Next use: Use to test finite-field table correctness and to block complete-family overinterpretation.

JSON: `logs/two-universes-protocol/cycle-011-obstruction-class-transport-map.json`
SVG: `logs/two-universes-protocol/cycle-011-obstruction-class-transport-map.svg`
