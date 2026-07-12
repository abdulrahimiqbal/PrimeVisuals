# P3-C0a: exact transport of the one-prime Sonin projection

Date: 2026-07-12

Status: **EXACT OPERATOR SUBTHEOREM / NOT THE WEIL--SONIN REMAINDER**.

## Statement

Let `S={infinity,2}`.  Use the unitary Hardy--Titchmarsh/Mellin coordinates
from Connes--Consani--Moscovici to identify both

`L^2(R)^ev` and `L^2(X_S)^(K_S)`

with `L^2(R,ds)`.  Let `M` be the image of the classical Sonin space in these
coordinates and let `P` be the orthogonal projection onto `M`.

The semilocal amplification map acts on the Sonin space by multiplication by

`d_2(s)=1-2^(-1/2-is)`.

This is formula (55), followed by the stability theorem, in
[Connes--Consani--Moscovici, *Zeta zeros and prolate wave operators*](https://arxiv.org/abs/2310.18423).
Since

`m=1-1/sqrt(2) <= |d_2(s)| <= 1+1/sqrt(2)=Mmax`,

the multiplier `D=M_(d_2)` is bounded and boundedly invertible.  The native
semilocal Sonin subspace is exactly `D M`.

Define the positive operator on `M`

`G=P D^* D P |_M`.

Then `m^2 I <= G <= Mmax^2 I`, so `G^(-1)` exists.  The orthogonal projection
onto the semilocal Sonin subspace `D M` is

`P_S = D P G^(-1) P D^*`.                                      (1)

For any test function `g` for which the published archimedean Sonin trace is
finite, let `h` be the multiplier representing its scaling convolution in
Mellin coordinates.  Then the one-prime Sonin trace is rigorously defined by

`T_S(g)=Tr(M_h P_S M_h^*)`

and has the exact Hilbert--Schmidt formula

`T_S(g)=||M_h D P G^(-1/2)||_HS^2 >= 0`.                       (2)

In particular it is finite.  Moreover, if

`T_infinity(g)=||M_h P||_HS^2`,

then

`(m/Mmax)^2 T_infinity(g) <= T_S(g)`

`                              <= (Mmax/m)^2 T_infinity(g)`.    (3)

For the prime `2`, `Mmax/m=3+2 sqrt(2)`.

## Proof

The source theorem gives `D M` as the image of the classical Sonin space in
the common unitary coordinate Hilbert space.  Put

`A=D P G^(-1/2): M -> L^2(R)`.

Then

`A^*A=G^(-1/2) P D^*D P G^(-1/2)=I_M`,

so `A` is an isometry with range `D M`.  Hence its range projection is

`A A^*=D P G^(-1) P D^*`, proving (1).

The scaling action becomes multiplication by `h`; it therefore commutes with
`D`.  Substituting (1) and using the range-isometry factorization gives (2).
The archimedean theorem says `M_h P` is Hilbert--Schmidt.  Since `D` and
`G^(-1/2)` are bounded, the operator in (2) is Hilbert--Schmidt as well.

Finally, `m I<=|D|<=Mmax I` and

`Mmax^(-1) I<=G^(-1/2)<=m^(-1) I`.

Applying these lower and upper bounds on the two sides of the
Hilbert--Schmidt operator `M_h P` yields (3).

## What this achieves

This closes two pieces of the rebooted P3-C0 gate:

1. it transports the native semilocal Sonin projection into an exact common
   coordinate system;
2. it proves the one-prime compressed trace is finite and positive on every
   test class where the archimedean trace is finite.

It also provides a canonical formula from which finite trace compressions may
be derived.  No zeta zeros, RH, or fitted spectrum enter the proof.

## What remains

The theorem does **not** identify `T_S` with a closed kernel in the CvS/CCM
frequency basis and does not compare it entrywise with the localized Weil
form.  The remaining P3-C0b tasks are:

1. transport the exact support and Mellin constraints into these coordinates;
2. derive `T_S(V_m,V_n)` or an equivalent native kernel;
3. calibrate the formula at `S={infinity}` against the full published
   Connes--Consani comparison, including its moment correction;
4. assemble `E_S=Q_S-T_S` independently and verify finite entries;
5. only then test or prove `E_S>=0`.

Thus this is a real operator theorem and a repair of the carrier side, but not
a field-level positivity breakthrough.
