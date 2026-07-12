# Finite-field Rosati reconstruction

Date: 2026-07-12

## Result

For a smooth projective curve `C/F_q`, the critical circle is forced by a
geometrically constructed positive Rosati involution, not by reciprocity alone.
The minimal implication is

`polarized Jacobian + Frobenius/Verschiebung + positive Rosati trace`

`=> F^dagger F=q => every weight-one Frobenius root has modulus sqrt(q)`.

The zeta comparison is a separate final arrow.  It identifies these roots with
the reciprocal roots of the numerator of `Z(C,T)`.

## Source-level dependency map

1. `J=Jac(C)` is an abelian variety and a theta divisor gives a polarization
   `lambda:J -> J^vee`.
2. Geometric Frobenius `F` and Verschiebung `V` satisfy
   `FV=VF=[q]`.
3. The polarization defines the Rosati involution
   `alpha^dagger=lambda^(-1) alpha^vee lambda`, and Frobenius satisfies
   `F^dagger=V`.  Hence `F^dagger F=[q]`.
4. The Rosati trace form is positive.  This is the geometric input: its proof
   comes from the ample divisor/intersection theory behind the polarization.
5. For every complex realization of the Frobenius endomorphism,
   `conjugate(alpha)*alpha=q`; consequently `|alpha|=sqrt(q)`.
6. The Lefschetz/zeta comparison identifies the characteristic polynomial on
   weight one with the zeta numerator.

The positivity theorem and the Frobenius application are stated explicitly in
the [Stanford notes on abelian varieties over finite fields](https://math.stanford.edu/~conrad/vigregroup/vigre04/abvaralg.pdf),
Proposition 5.5 and Theorem 5.6.  A short standalone reconstruction is
[Lilienfeldt, *Rosati and Frobenius*](https://math.huji.ac.il/~shnidman/DavidRosati.pdf),
Theorems 2.2 and 3.2.

## Exact degree-two core

Let `F` have characteristic polynomial

`x^2-a x+q`

and use the cyclic companion basis

`F=[[0,-q],[1,a]]`, `V=aI-F=[[a,q],[-1,0]]`.

Then `FV=VF=qI`.  Solving the symmetric adjoint equation

`F^T J=J V`

gives a one-dimensional space.  With positive leading scale, its generator is

`J=[[2,a],[a,2q]]`, so `det(J)=4q-a^2`.

For `D=2F-aI`, this is equivalently

`D^dagger=-D`, `D^2=(a^2-4q)I`,
`D D^dagger=(4q-a^2)I`.

Thus the positive-definite sign is *exactly* `a^2<4q`.  In degree two, solving
the adjoint equation and then selecting a positive solution is circular: the
desired Hasse sign has merely been restated.  The finite-field proof escapes
the circle because `J` and its positivity are constructed independently from
an ample divisor.

The exact arithmetic is implemented in
`src/core/rosatiDiscriminator.js`; its generated audit is
`rosati-discriminator.json`.

## Frozen-control verdict

For the RH-false controls with roots `r=2^u`, `s=2^v`,

`q=rs`, `a=r+s`,

and therefore

`det(J)=4rs-(r+s)^2=-(r-s)^2<0`.

Every control retains `FV=qI` and the algebraic adjoint identity.  It fails
only positivity.  This proves that the discriminating arrow is

`algebraic duality -/-> positive Rosati polarization`.

## Uses and non-uses

- Effectivity/ampleness enters in constructing the positive Rosati form.
- Positivity enters when converting `F^dagger F=q` into an absolute-value
  statement.
- Algebraic duality alone gives reflected roots but not their radius.
- Semisimplicity is not the hidden source of the sign in the degree-two
  calculation; an indefinite adjoint datum already supports off-circle roots.
- Zeta comparison is necessary to turn purity of `F` into a theorem about the
  zeta numerator, but it does not create positivity.

Status: **P1 EXACT DISCRIMINATOR PROVED**.
