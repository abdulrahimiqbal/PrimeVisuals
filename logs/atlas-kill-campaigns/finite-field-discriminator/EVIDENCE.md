# Finite-field geometric discriminator: evidence

Date: 2026-07-12

## 1. The exact sufficient theorem

Let `A/F_q` be an abelian variety, let `lambda:A -> A^vee` be a polarization
defined by an ample divisor, and let `dagger` be its Rosati involution.  If
`pi` is Frobenius, then

`pi^dagger pi=[q]`.

The Rosati trace form is positive.  Consequently every complex root of the
characteristic polynomial of `pi` has absolute value `sqrt(q)`.  For
`A=Jac(C)`, the standard trace/zeta comparison identifies this characteristic
polynomial with the weight-one numerator of `Z(C,T)`.

This is not a new result.  The underlying geometric theorem is Weil's
polarization proof.  Tate's finite-field endomorphism theory uses the same
positive-involution structure.  A directly inspectable dependency chain is
given by Milne, *Abelian Varieties*, Theorem I.14.3 (positivity of Rosati),
Chapter II Lemmas 1.2–1.3 (`pi^dagger pi=q` and the absolute-value conclusion),
and Chapter III §11 (Jacobian-to-curve comparison):

- [Weil, *Variétés abéliennes et courbes algébriques* (1948), bibliographic record](https://zbmath.org/0063.06101)
- [Tate, *Endomorphisms of abelian varieties over finite fields* (1966)](https://doi.org/10.1007/BF01404549)
- [Milne, *Abelian Varieties*, accessible reconstruction](https://www.jmilne.org/math/CourseNotes/AV.pdf)

The independently geometric package is therefore:

1. `A=Jac(C)` and the theta/ample polarization `lambda`;
2. its positive Rosati involution `dagger`;
3. the geometric identity `pi^dagger pi=[q]`;
4. comparison `P_C(T)=det(1-T pi | V_l A)`.

Effectivity appears inside the proof of Rosati positivity: for an ample divisor
`D`, the relevant intersection with `alpha^*D` is positive.  It is not a
separate weaker counting axiom.  Purity is the conclusion.  Restriction
compatibility is not used in this fixed finite-dimensional theorem.

## 2. Why an abstract positive pairing is circular

### Proposition (unitarizing-form equivalence)

Let `F` be an endomorphism of a finite-dimensional complex vector space and
let `q>0`.  The following are equivalent:

1. there is a positive-definite Hermitian form `H` such that
   `F^(dagger_H) F=qI`;
2. `q^(-1/2)F` is unitary for some positive-definite Hermitian form;
3. `F` is diagonalizable and all its eigenvalues have modulus `sqrt(q)`.

Proof: (1) and (2) are the same identity.  A unitary operator is diagonalizable
with unit-modulus eigenvalues, proving (2) implies (3).  For (3), declare an
eigenbasis orthonormal; this constructs `H` and proves (1).

Thus the bare existential axiom “there is a compatible positive form” is
semisimple purity in different language.  It becomes non-circular only when
the form is constructed independently—for a curve, from its ample theta
divisor before its Frobenius polynomial is inspected.  This independent
construction is precisely the classical Rosati theorem.

## 3. The controls pass effectivity more strongly than previously recorded

Fix distinct integers `r,s >= 2`, put `q=rs`, `a=r+s`, and

`Z(T)=(1-aT+qT^2)/((1-T)(1-qT))`.

The prior necklace-injection proof gives nonnegative integral primitive orbit
counts `b_n` for every `n`, so

`Z(T)=product_(n>=1) (1-T^n)^(-b_n)`

is a combinatorially effective Euler product.  Its power-series coefficients
therefore count multisets of the positive closed orbits and are nonnegative
integers.

There is a sharper identity.  Let `A_n=[T^n]Z(T)` and

`h=P(1)=q+1-r-s=(r-1)(s-1)>0`.

For every `n>=1`, direct coefficient extraction gives

`A_n=h (q^n-1)/(q-1)`.

This is exactly the genus-one Riemann–Roch effective-divisor coefficient
profile.  Indeed,

`[T^n] 1/((1-T)(1-qT))=(q^(n+1)-1)/(q-1)`,

and substitution of `P(T)=1-(r+s)T+qT^2` simplifies to the displayed formula.

For the discovery cell `(r,s,q)=(2,4,8)`, this gives

`h=3`, `A_1=3`, `A_2=27`, `A_3=219`.

Nevertheless its Frobenius roots are `2,4`, not both `sqrt(8)`.  Therefore
positive points, positive closed orbits, effective divisors, the genus-one
Riemann–Roch coefficient law, rationality, reciprocity, and the functional
equation do not imply the square-root bound.

This fires K1 for every counting-level interpretation of effectivity.

## 4. The controls also pass base-extension compatibility

Over the formal base extension from `F_q` to `F_(q^m)`, the control data become

`q -> q^m`, `r -> r^m`, `s -> s^m`,

and the point count at extension degree `n` is

`N_(m,n)=q^(mn)+1-r^(mn)-s^(mn)=N_(mn)`.

Thus the trace sequences commute exactly with iterated extension.  The new
reciprocal roots remain `r^m,s^m`, so their normalized weights remain off
`1/2`.  Since `(rs)^m >= r^m+s^m` for the frozen distinct powers of two, the
same necklace injection proves nonnegative integral closed-orbit counts after
every base extension.

Finite-degree truncations are also canonically compatible under deletion of
the last degree.  Hence “restriction compatibility” without a richer
geometric object and specified maps cannot discriminate this family.  This
fires K3.

## 5. Exact axiom-deletion audit

Work in an eigenbasis with

`F=diag(r,s)`, `V=diag(s,r)`, `q=rs`, `r != s`.

| proposed ingredient | control retaining the other elementary arrows | result |
| --- | --- | --- |
| counting effectivity | the positive-orbit Euler product above | passes in every degree and satisfies the genus-one coefficient law |
| algebraic duality without positivity | `J=[[0,1],[1,0]]`, so `F^T J=J V` and `FV=qI` | `J` is indefinite; roots remain off-circle |
| a positive form without Frobenius/Rosati compatibility | take `H=I` while keeping `FV=qI` | `F^(dagger_H)=F != V`; roots remain off-circle |
| adjoint compatibility without `FV=qI` | take `H=I` and name `V=F` | `F^(dagger_H)=V`, but `FV != qI`; roots remain off-circle |
| restriction/base-extension compatibility | use `F^m=diag(r^m,s^m)` and `N_(m,n)=N_(mn)` | passes exactly; roots remain off-circle |
| zeta comparison | pair any genuine polarized pure datum with the unrelated control rational function | geometry proves purity of its own `F`, not of the control numerator |

The irreducible sufficient middle is not the word “polarization.”  It is a
positive Rosati structure tied to Frobenius by `pi^dagger pi=q`, followed by
zeta comparison.  Dropping any of positivity, the adjoint identity, the norm
identity, or comparison breaks the implication.

## 6. Frozen family rejection is symbolic, not fitted

In the cyclic companion basis for `x^2-a x+q`, the symmetric solution of

`F^T J=J(aI-F)`

has generator

`J=[[2,a],[a,2q]]`, `det J=4q-a^2`.

For the entire control family, `q=rs` and `a=r+s`, hence

`det J=4rs-(r+s)^2=-(r-s)^2<0`.

This rejects every control at positive Rosati compatibility, not by a finite
classifier.  The exact implementation and four regression cells are in
`src/core/rosatiDiscriminator.js` and
`tests/rosati-discriminator.test.js`.

## 7. Candidate matrix

| candidate | rejects all controls | yields square-root bound | independent input | new result | decision |
| --- | :---: | :---: | :---: | :---: | --- |
| orbit/divisor effectivity | no | no | yes | no | killed by K1 |
| purity | yes | tautologically | no | no | killed by K2 |
| restriction compatibility | no | no | yes | no | killed by K3 |
| arbitrary compatible positive form | yes | yes | no: equivalent to semisimple purity | no | killed by K2 |
| independently ample Jacobian/Rosati package | yes | yes | yes | no: classical Weil/Rosati theorem | killed as breakthrough by K4/K5 |

## 8. Verification

The exact existing regression suites were rerun for this campaign:

`npx vitest run tests/arithmetic-hodge-controls.test.js tests/rosati-discriminator.test.js`

They cover primitive-necklace arithmetic, positive integral closed-orbit
reconstruction, the discovery cell, three holdouts, the degree-two Rosati
identity, and exact negative determinant on every frozen cell.  The symbolic
proofs above cover the full infinite family and all base extensions; the test
cells are implementation checks only.
