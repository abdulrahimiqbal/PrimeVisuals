# Arithmetic Rosati transport audit

Date: 2026-07-12

Verdict: **ARITHMETIC ROSATI LEAD (P2 RECONSTRUCTED); P3 RESET AT COMPARISON GATE**.

Post-attack correction: the earlier version of this audit identified the
pole-free localized Weil form with the Weil-minus-Sonin comparison remainder.
That identification is not supplied by the cited sources.  The finite
CvS/CCM matrices test the Weil form, and subtracting `W_0,2` removes only the
rank-two pole term.  The corrected obligation is recorded in
`P3_ATTACK_AND_RESET.md` and `P3_REBOOT_PREREGISTRATION.md`.

This is stronger than the original atlas assessment: the algebraic
Rosati/Hodge relation already exists in a native arithmetic trace algebra.  It
is weaker than a field-level breakthrough because the first finite-place
positive polarization remains unproved.

## The transported algebraic theorem

On the idele-class convolution algebra, define

`f^sharp(g)=|g|^(-1) conjugate(f(g^(-1)))`.

This is an involution.  For the point mass `delta_lambda` representing the
scaling correspondence at `lambda>0`,

`delta_lambda^sharp=|lambda| delta_(lambda^(-1))`.

Writing `lambda=e^t` and `Phi_t=delta_(e^t)` gives

`Phi_t^sharp=e^t Phi_(-t)`,

and differentiation gives

`Theta^sharp=1-Theta`.

This is precisely the continuous weight-one Rosati relation frozen in the
preregistration.  It is algebraic and does not use zeta zeros.  The relation is
implemented with exact rational arithmetic in
`src/core/rosatiTransportObstructions.js`.

The native source is Section 6.2 of
[Connes--Consani--Marcolli, *The Weil proof and the geometry of the adeles class space*](https://arxiv.org/abs/math/0703392):
the cyclic-homology cokernel carries the scaling action, the trace pairing
descends, and the modular involution is `sharp`.  That paper also proves that
global positivity of this trace pairing is equivalent to RH for the relevant
L-functions; therefore it cannot be imported as an independent axiom.

## How the 2026 Jacobian fits

[Connes--Consani, *On the Jacobian of completed Spec Z*](https://arxiv.org/abs/2602.15941)
constructs the arithmetic Picard/Jacobian monoids and identifies the adelic
monoid with moduli of framed and rooted arithmetic divisors.  Its duality
functor respects tensor products, and its semilocal trace formula places local
terms on the Abel--Jacobi fibers.  The paper suggests that the relevant
cohomology is relative cohomology of a pair.

The coarse Jacobian is not itself the weight-one dynamical carrier.  Two exact
collapse propositions explain why.

### Flow-quotient collapse

The arithmetic Jacobian is the coarse orbit quotient of the arithmetic Picard
monoid by archimedean scaling.  On any coarse orbit quotient,

`[g.x]=[x]`.

Hence the induced scaling action is the identity and its infinitesimal
generator is zero.  A nontrivial `Theta` must live on the covering Picard/adele
space, its action groupoid, or a transverse/relative cohomology—not on the
coarse orbit set alone.

### Idempotent-linearization collapse

The extended Abel--Jacobi image is an idempotent semilattice.  If `M` is an
idempotent commutative monoid and `f:M->A` is a homomorphism to an abelian
group, then

`f(x)=f(x+x)=f(x)+f(x)`,

so `f(x)=0`.  Ordinary group completion therefore kills the entire idempotent
prime stratum.  Weight-one classes cannot be obtained by naively linearizing
that stratum; isotropy, transverse directions, or a relative/cyclic cokernel
must be retained.

These propositions do not obstruct the noncommutative/cyclic program.  They
select it over the naive classical-Jacobian imitation.

## Progress matrix

| framework/result | carrier | flow | algebraic adjoint | positive form | finite-place sign | comparison |
| --- | --- | --- | --- | --- | --- | --- |
| finite-field Jacobian | constructed | Frobenius | `F^dagger=V` | proved geometrically | proved | proved |
| Deninger cohomological formalism | conjectural arithmetic cohomology | proposed | proposed Hodge-star covariance | proposed | open | determinant conjecture |
| foliated dynamical models | constructed model | constructed | Hodge-star covariance | proved in model | not arithmetic-prime-sensitive | determinant formulas in model |
| adele-class cyclic cokernel | constructed | constructed | `Phi_t^sharp=e^t Phi_-t` | equivalent to RH globally | open | trace formula proved |
| arithmetic Picard/Jacobian monoid | constructed | on covering space | framed/rooted duality | no Rosati positivity | open | semilocal geometric interpretation |
| archimedean Sonin theorem | constructed Hilbert carrier | scaling compression | unitary adjoint | proved | no finite prime enters | local trace proved |
| `{infinity,p}` quasi-inner/Sonin theory | constructed | constructed | Fourier/local-factor duality | Hilbert norm exists | compactness, not sign | partial |
| `{infinity,p}` Jacobi moment theory | determinate positive measure | Jacobi operator | symmetric Jacobi data | moment positivity | not the Weil remainder sign | partial |

Deninger's exact Hodge-star covariance and its implication
`Theta-nu/2` skew are laid out in
[*The Hilbert--Polya strategy and height pairings*](https://www.uni-muenster.de/SFB878/publications/files/php7aMxKR3029.pdf).
His [no-go theorem](https://arxiv.org/abs/2204.02714) rules out a naive real
Weil cohomology, not the relative, topological, or noncommutative carrier above.

The strongest finite-place analytic progress reviewed here is:

- [quasi-inner products and semilocal Sonin spaces](https://arxiv.org/abs/2008.10974),
  including injective restriction maps as primes are added;
- [the one-prime moment/Jacobi theory](https://arxiv.org/abs/2403.01247),
  including exact `q=1/p` series and integrality;
- the exact finite Guinand--Weil dictionary and certified archimedean tail
  order in [Groskin (2026)](https://arxiv.org/abs/2607.02828).
- the pole-free Dirichlet-form/Perron reduction and scalar Krein criterion in
  [Andrade (2026)](https://zenodo.org/records/20682834), together with the
  [Loewner parity reduction](https://zenodo.org/records/20710075).

None supplies the infinite-dimensional finite-place sign required by P3.

## Why the existing one-prime results do not compose into positivity

Quasi-innerness says an off-diagonal/Hankel defect is compact.  Compactness has
no sign content: the rank-one operator `K=2P` is compact and trace class, while
`I-K` is negative on `ran(P)`.  A determinate moment measure is positive by
construction, but it records `|product of local factors|^2`; the Weil sign also
depends on the phase/Hankel remainder.  Finite Galerkin positivity is an exact
finite zero-sum statement, but without uniform restriction and closure it is
not the full support-space inequality.

## Corrected first unproved arrow

The smallest P3 theorem is now a comparison theorem in the frozen `q=3` case:

`S={infinity,2}` and `supp(g) subset [3^(-1/2),3^(1/2)]`.

P3-C0a is now proved in `P3_C0A_SONIN_PROJECTION_TRANSPORT.md`: the
one-prime Sonin projection has an exact bounded-multiplier transport formula,
and the compressed trace is trace class and positive on the published
archimedean admissibility class.

The remaining P3-C0b target is to derive that trace in the same explicit basis
as the Weil form and assemble the exact remainder

`E_(infinity,2;3)=Q_(infinity,2;3)-T_Sonin`

on the pole-neutral support core.  Only after that identity is
proved may one attempt

`E_(infinity,2;3) >= 0`.

The domination statement is a concrete kernel/operator inequality, not the instruction
“invent cohomology” or “prove RH.”  It is finite-place-sensitive, survives the
anti-circularity gates, and would be a new semilocal trace theorem.

The constrained nonlocal Poincare inequality for the pole-free jump form at
`a=(log 3)/2` is a separate route to fixed-width localized Weil positivity.
It is not known to be equivalent to Sonin domination.  Its explicit potential
is negative, so even that separate lane still needs a sharp energy argument.

The historical frozen specification is `P3_ONE_PRIME_PREREGISTRATION.md`; the
corrected specification is `P3_REBOOT_PREREGISTRATION.md`.

## Decision

- P1: achieved by the exact degree-two discriminator.
- P2: achieved as a reconstruction/synthesis of existing native theorems, not
  claimed as new mathematics.
- P3: not achieved.  No field-level breakthrough is claimed.
- Continue first on the explicit-basis one-prime comparison identity, not its sign.
  Do not return to
  coarse Jacobian linearization, generic compactness, or unconstrained finite
  PSD searches.
