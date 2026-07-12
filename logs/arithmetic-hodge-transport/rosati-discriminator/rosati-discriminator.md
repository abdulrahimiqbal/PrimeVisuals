# Exact Rosati discriminator audit

Generated: 2026-07-12T19:02:47.704Z

Verdict: **EXACT DISCRIMINATOR: ALGEBRAIC DUALITY SURVIVES, POSITIVE ROSATI FAILS**.

## Degree-two theorem

Let `F` have characteristic polynomial `x^2-a x+q` in its cyclic
companion basis, and put `V=aI-F`.  Then `FV=VF=qI`.  The symmetric
solutions of the Rosati adjoint equation

`F^T J = J V`

form a one-dimensional space.  With positive leading scale its generator is

`J=[[2,a],[a,2q]]`.

Therefore

`det(J)=4q-a^2`.

Equivalently, for `D=2F-aI`, one has

`D^dagger=-D`, `D^2=(a^2-4q)I`, and
`D D^dagger=(4q-a^2)I`.

A geometric Rosati form can be positive only when `a^2<=4q`.  Solving the
adjoint equation and then declaring its solution positive would be circular:
in degree two, positivity is already exactly the Hasse/critical-circle sign.
The form must instead be constructed from an independent ample/effective
intersection theory.

## Frozen controls

For roots `r=2^u`, `s=2^v`, the controls have `q=rs`, `a=r+s` and

`det(J)=4rs-(r+s)^2=-(r-s)^2<0`.

| (u,v) | q | trace a | det(J) | pairing | exact checks |
| --- | ---: | ---: | ---: | --- | --- |
| (1,2) | 8 | 6 | -4 | indefinite | PASS |
| (1,3) | 16 | 10 | -36 | indefinite | PASS |
| (2,3) | 32 | 12 | -16 | indefinite | PASS |
| (2,5) | 128 | 36 | -784 | indefinite | PASS |

Every control retains `FV=qI` and the algebraic adjoint identity.  It fails
only the positivity of the unique symmetric adjoint form.
