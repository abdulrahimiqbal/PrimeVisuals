# Generic non-CM incomplete-family residual: evidence

Date: 2026-07-12

## Outcome in one sentence

Every currently computable Legendre-family cell is absorbed by an exact
orthogonality, Hecke-trace, Sato--Tate, supersingular, or local term; the only
cells not so absorbed lack the preregistered exact nonzero baseline and full
integer implementation.  No concrete nonzero residual survives.

## 1. Audit of cycles 020--022

### Cycle 020: the pilot was not fully generic

Cycle 020 used the integer parameters `lambda=2,...,13`.  The Legendre
invariant is

`j(lambda)=256(1-lambda+lambda^2)^3/(lambda^2(1-lambda)^2)`.

At `lambda=2`, this is `1728`, so the pilot included the CM/special
automorphism curve that the present preregistration requires us to remove.
For every integer `lambda=3,...,13`, the reduced rational value of `j(lambda)`
has denominator greater than one.  A CM `j`-invariant is an algebraic integer;
a rational algebraic integer is an integer.  Thus these eleven curves are
non-CM over `Q`.

Cycle 020 also did not use one matched selection rule in the two universes.  On
the integer side it used fixed rational parameters.  On the `F_q[t]` side it
used a presentation-dependent list beginning with `t+c` and quadratic
polynomials, then reduced that list modulo each irreducible.  The failed
profile gate cannot be interpreted as a comparison of one intrinsic window.

### Cycle 021: the large signal is exactly special/local

The integer identity

`B(F_p)=3 * 1_(p congruent 3 mod 4)`

is the supersingularity criterion for the `j=1728` Legendre orbit.  The `j=0`
parameters are rational over `F_p` only in the congruence regime incompatible
with their supersingularity regime, so they contribute nothing to this
rational-prime statistic.  Cycle 021's local-mod-4 control reproduces the
entire integer signal.

The finite-field profile is likewise determined by the extension degree and
the `j=0,1728` splitting/supersingularity criteria.  This is a useful theorem
calibration, not a generic residual.  Auer--Top explicitly study
supersingular Legendre parameters and their class-number structure:
[Auer--Top, *Legendre elliptic curves over finite fields*](https://arxiv.org/abs/math/0106273).

### Cycle 022: correct stop decision, but its source audit was incomplete

The cycle-022 program was rerun unchanged in a temporary directory:

`node scripts/generic-noncm-residual-obstruction-map.mjs /tmp/primevisuals-noncm-cycle22-rerun`

It again returned `experimentEligibleCount=0` for seven screened classes.
That program is only a registration checker: its count of “exact or reducible
baselines” is based on text matching, not a mathematical proof.  The
source-level audit below supplies the missing justification and corrects one
statement: Sato--Tate for a fixed non-CM elliptic curve is a theorem, not a
heuristic.  It still does not make the frozen fixed-curve lane eligible.

## 2. Complete moments are known trace-formula terms

For the complete Legendre family over an odd finite field, write

`a_lambda=q+1-#E_lambda(F_q)`.

Elementary character orthogonality gives

`sum_(lambda != 0,1) a_lambda = -1-chi_q(-1)`

and

`sum_(lambda != 0,1) a_lambda^2 = q^2-2q-3`.

The second identity is the exact baseline already registered in cycle 022.
It leaves zero theorem-normalized residual.

Higher moments do not create an unexplained remainder.  Birch expressed the
power moments of elliptic-curve traces over a fixed prime field using traces
of Hecke operators:
[Birch, *How the Number of Points of an Elliptic Curve Over a Fixed Prime Field Varies*](https://doi.org/10.1112/jlms/s1-43.1.57).

Kaplan--Petrow give the applicable refinement.  Their Theorem 3 gives exact
formulas for every normalized Chebyshev moment, hence every power moment in
the automorphism-weighted isomorphism-class measure, for elliptic curves
containing any prescribed rank-at-most-two subgroup.  Taking
`A=(Z/2Z)^2` is the full rational 2-torsion class underlying Legendre curves.
The formula separates identity, hyperbolic, dual, and explicit Hecke-trace
terms for the relevant congruence subgroup.  Their Proposition 1 also proves
Sato--Tate equidistribution directly for the complete Legendre family using
its `SL_2` geometric monodromy:
[Kaplan--Petrow, *Elliptic curves over a finite field and the trace formula*](https://arxiv.org/abs/1510.03980).

The raw `lambda` parameterization differs from the automorphism-weighted
isomorphism-class measure by finite level-2/S3 multiplicities and quadratic
twists.  Away from `j=0,1728` these multiplicities are uniform; even trace
powers are invariant under the twists, and the exceptional automorphism
orbits are explicit.  Thus the preregistered second/even higher-moment lane is
an exact conversion of the full-2-torsion formula.  Odd raw moments require the
corresponding twisted level-2 trace sum; the first is the elementary identity
above, and no nonzero higher odd residual was frozen.  Special-locus excision
subtracts finitely many known trace powers and cannot turn a Hecke/cohomology
term into an unexplained residual.

This kills both preregistered cells:

- complete second/higher moments;
- special-excised complete moments.

Calling the surviving Hecke trace a “monodromy residual” would merely rename
the known baseline.

## 3. Exact complete-family computation

A direct exact character-sum check in the repaired audit script covers the 23
primes from `5` through `97`.  For every prime, both displayed
first/second-moment identities passed.
The special set was cut out by

`(lambda+1)(lambda-2)(2lambda-1)(lambda^2-lambda+1)=0`.

The first three factors are the `j=1728` orbit and the last factor is the
`j=0` orbit.  In every cell,

`generic second moment = complete second moment - special second moment`

held exactly.  Representative values were:

| `p` | complete second moment | special contribution | excised generic contribution |
| ---: | ---: | ---: | ---: |
| 5 | 12 | 12 | 0 |
| 11 | 96 | 0 | 96 |
| 13 | 140 | 116 | 24 |
| 19 | 320 | 128 | 192 |
| 97 | 9212 | 1364 | 7848 |

The last column is not a residual after normalization; it is the exact
complete identity with the exact special contribution removed.

## 4. The repaired generic fixed-window pilot is null-like

The decisive cycle-020 repair is reproducible with:

`node scripts/noncm-generic-window-kill-audit.mjs 20000`

It makes three changes required by the frozen preregistration:

1. removes `lambda=2`, leaving the eleven certified non-CM rational curves
   `lambda=3,...,13`;
2. at every prime, removes any reduction landing in `j=0` or `j=1728`;
3. reruns the original deterministic shuffle, sign-flip, and bootstrap
   controls.

The statistic remains cycle 020's

`V_p=sum_lambda a_p(E_lambda)/sqrt(p * good_lambda)`.

| endpoint | prime labels | `z` | energy `z` | path max `|z|` |
| ---: | ---: | ---: | ---: | ---: |
| 5,000 | 665 | 0.347287 | 0.365380 | 0.978966 |
| 10,000 | 1,225 | 0.380279 | 0.390093 | 0.978966 |
| 20,000 | 2,258 | 0.724878 | 0.741345 | 1.098113 |

| control | final `|z|` range | path max `|z|` range |
| --- | ---: | ---: |
| shuffle | 0.724878--0.724878 | 1.648684--3.007685 |
| sign flip | 0.060336--1.663613 | 1.331895--2.573509 |
| bootstrap | 0.042163--2.440632 | 1.385860--3.197511 |

The endpoint score and the entire observed path are contained by the controls.
Special-locus excision does not rescue the pilot.  The required
`1M,2M,4M,8M` exact ladder is still unavailable, so the preregistered hard
eligibility gate also fires independently of this null result.

## 5. Fixed generic lambda: known limiting law, no registered residual

For each `lambda=3,...,13`, Sato--Tate gives the limiting distribution of
`a_p(E_lambda)/(2sqrt(p))` over good rational primes.  This supplies a proven
zero limiting mean, not a nonzero finite-scale main term or a matched
`F_q[t]` residual.  A primary modern proof for non-CM modular forms is:
[Barnet-Lamb--Gee--Geraghty, *The Sato--Tate conjecture for Hilbert modular forms*](https://arxiv.org/abs/0912.1054).

Consequently:

- treating mean zero as a new finding is a known-calibration kill;
- any claimed lower-order prime bias needs an exact statement and source
  normalization before data;
- the repo still lacks the full 8M exact trace engine;
- the cycle-020 function-field parameter list is not a matched constant-curve
  analogue.

No preregistered nonzero residual exists in this lane.

## 6. Incomplete windows and trace functions: bounds are not a nonzero baseline

General theorems give cancellation or distribution results for short sums of
trace functions.  For example:

- [Fouvry--Kowalski--Michel--Raju--Rivat--Soundararajan, *On short sums of trace functions*](https://arxiv.org/abs/1508.00512);
- [Sawin--Shusterman, *Short sums of trace functions over function fields and their applications*](https://arxiv.org/abs/2512.24080).

These results do not retroactively define the cycle-020 window, its conductor,
or its integer analogue, and they do not give a nonzero main term for the
frozen statistic.  The cycle-020 field list is also of fixed cardinality 12,
not a growing intrinsic interval in the hypotheses of a short-sum theorem.

The preregistration permits an l-adic lane only after the sheaf, conductor,
normalization, integer analogue, and theorem baseline are explicit.  No such
object is registered.  A generic assertion that the Legendre sheaf has large
monodromy is already used by Kaplan--Petrow's Proposition 1 and is not a new
residual.

## 7. Generic supersingular roots are also known-structure data

After deleting `j=0,1728`, the remaining roots of the Deuring/Hasse polynomial
are a concrete generic set, but their counts and fields of definition are tied
to supersingular `j`-invariants and imaginary-quadratic class numbers.  This is
not an unmodeled monodromy residual.  The applicable primary references include
Auer--Top above and the class-number/isogeny-class formulas incorporated in
Kaplan--Petrow, Section 3.

No class-number-normalized nonzero residual was frozen, and no full integer
implementation separating those terms exists.  The supersingular lane is
therefore killed before further data.

## 8. Final eligibility matrix

| lane | exact baseline | nonzero residual after controls | full integer ladder | result |
| --- | --- | --- | --- | --- |
| complete second moment | character orthogonality | no, exactly zero | formula only | killed |
| complete higher moments | Birch/Kaplan--Petrow Hecke traces | no unexplained term | formula in principle, not a new statistic | killed |
| special-excised complete moments | complete formula minus explicit special traces | no | formula bookkeeping | killed |
| fixed non-CM lambda | Sato--Tate limiting law | none preregistered | no | ineligible |
| incomplete generic window | cancellation theory only; no matched exact nonzero baseline | observed pilot is control-contained | no | hard eligibility kill |
| generic supersingular roots | Deuring/class-number structure | none preregistered | no | killed/ineligible |
| abstract l-adic trace function | no concrete instantiated object | undefined | undefined | hard eligibility kill |

The screen has zero survivors.
