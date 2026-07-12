# Arithmetic Hodge control audit

Generated: 2026-07-12T18:21:25.217Z

Verdict: **CONTROL SURVIVES: TRACE + EULER PRODUCT + ALGEBRAIC DUALITY DO NOT FORCE RH**.

For distinct positive integers `u,v`, put

`q=2^(u+v)`, `r=2^u`, `s=2^v`, and

`Z(T)=((1-rT)(1-sT))/((1-T)(1-qT))`.

The numerator is reciprocal because `rs=q`, so `Z(1/(qT))=Z(T)`.
Its spectral weights are `u/(u+v)` and `v/(u+v)`: they reflect about
`1/2` but are off the critical line whenever `u != v`.

On the two-dimensional spectral space, `Theta=diag(u/(u+v),v/(u+v))`
obeys `Theta^T J + J Theta = J` for `J=[[0,1],[1,0]]`.  This is an
exact weight-one algebraic duality, but `J` has signature `(1,1)` and is
not a positive polarization.

Nevertheless its trace counts

`N_n=q^n+1-r^n-s^n`

are nonnegative, and its primitive closed-orbit multiplicities are nonnegative
integers.  For `n>1` they equal the number of primitive `q`-necklaces minus
the primitive `r`- and `s`-necklaces.  Since `q >= r+s`, choose disjoint
subalphabets of sizes `r` and `s` inside a `q`-letter alphabet; this is an
injection of the two subfamilies into the `q`-necklaces.  At `n=1`, the
additional constant orbit gives `q+1-r-s >= 0`.

Thus positive closed-orbit data, an exact Euler product, trace reconstruction,
reciprocity, and functional-equation symmetry do not force the critical line.
A geometric polarization/weight theorem has a falsifiable job: it must reject
this family before asserting RH.

| spectral weights | q | numerator coefficients | first five orbit counts | checks |
| --- | ---: | --- | --- | --- |
| 1/3, 2/3 | 8 | 1, -6, 8 | 3, 21, 146, 945, 6342 | PASS |
| 1/4, 3/4 | 16 | 1, -10, 16 | 7, 91, 1190, 15309, 203154 | PASS |
| 2/5, 3/5 | 32 | 1, -12, 32 | 21, 462, 10724, 260820, 6704124 | PASS |
| 2/7, 5/7 | 128 | 1, -36, 128 | 93, 7626, 688076, 66842820, 6865236564 | PASS |

All identities and orbit counts were checked with exact `BigInt` arithmetic
through degree 100.  The alphabet-injection argument proves
nonnegativity for every degree; the finite run checks the implementation.
