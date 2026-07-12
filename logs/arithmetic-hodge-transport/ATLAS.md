# Arithmetic Hodge--Transport obstruction atlas

Version: 2026-07-12
Entry gate: `SURVIVE, NARROW` in `VERDICT.md`
Machine-readable companion: `atlas.json`

## Mission

Search for a functorial global-field structure in which

1. primes/finite places arise as closed orbits or Frobenius correspondences;
2. the archimedean terms arise from geometry rather than insertion;
3. the explicit formula is a Lefschetz/trace formula;
4. the functional equation is duality;
5. critical-line location is an independently proved positive polarization;
6. function fields and number fields are realizations of common axioms, not an
   informal `q -> 1` limit.

The atlas is intentionally plural.  It does not assume that the carrier is a
scheme, topos, Hilbert space, derived stack, tropical space, or noncommutative
quotient.  Those are competing realizations of a shared interface.

## The endpoint interface

For a global field `K`, a complete realization should produce

`A(K) = (X_K, H_K^*, Theta_K, Tr_K, cup_K, dual_K, pol_K)`

with the following axioms.

| id | required structure | anti-circularity requirement |
| --- | --- | --- |
| A0 | arithmetic carrier `X_K` | defined from arithmetic/local data, not a zero list |
| A1 | closed-point/orbit dictionary | orbit length `log Nv` and repetitions derived intrinsically |
| A2 | archimedean realization | gamma/fixed-point terms derived, not appended |
| A3 | functoriality and base change | finite extensions and localizations induce compatible maps |
| A4 | cohomology and flow `H^i, exp(t Theta)` | domains and topology specified independently of zeta zeros |
| A5 | Lefschetz trace and regularized determinant | convergence/nuclearity proved before identifying zeta |
| A6 | Poincare/Serre duality | functional equation follows from the pairing |
| A7 | positive polarization/Hodge index | positivity follows from geometry/effectivity, not Weil's RH-equivalent form by definition |
| A8 | comparison and analytic closure | finite-field recovery and dense-core passage are theorems |

On weight-one `H^1`, the endpoint relation is

`(Theta - 1/2)^* = -(Theta - 1/2)`.

The determinant formula then identifies the nontrivial zero spectrum with
`1/2 +` a skew-adjoint spectrum.  This implication is elementary; constructing
the positive inner product and proving the trace/determinant comparison are the
content.

## Status language

- `C`: constructed/proved in the framework's native scope;
- `P`: partial, local, bounded, or proved only for a related object;
- `S`: stated strategy/conjectural bridge;
- `--`: absent from the reviewed framework;
- `N/A`: not applicable to that benchmark.

Letters in one row do not automatically compose with letters in another row.
A comparison theorem is required.

## Framework matrix

| framework | A0 | A1 | A2 | A3 | A4 | A5 | A6 | A7 | A8 | principal obstruction |
| --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | --- |
| smooth projective curves over finite fields | C | C | N/A | C | C | C | C | C | C | benchmark complete; transport to number fields absent |
| Arakelov/adelic intersection geometry | C | -- | C | C | P | -- | C | C | -- | no absolute surface carrying the required Frobenius correspondences |
| Weil--etale plus THH/TC special-value theory | C | P | C | C | C | P | P | -- | -- | controls integer special values, not the full zero spectrum |
| Deninger rational-Witt arithmetic dynamics | C | P | P | P | P | -- | -- | -- | P | orbit packets and infinite dimension; missing full cohomology/trace/polarization |
| adele-class/noncommutative trace framework | C | C | C | P | P | P | P | P | -- | full finite-place positivity and global closure remain open |
| arithmetic/scaling site and absolute geometry | C | C | C | P | P | P | C | S | -- | Riemann--Roch/intersection/effectivity on the relevant square |
| prismatic/Cartier--Witt/Fargues--Fontaine local geometry | C | P | -- | C | C | P | C | P | P | no simultaneous all-prime plus archimedean global object |
| analytic Weil/screw/self-adjoint limits | P | P | C | -- | P | C | C | S | S | target is close to an RH equivalent; independent geometric origin missing |
| PrimeVisuals prime-square/divisor-cube grammar | C | P | P | P | C | P | -- | failed | -- | exact separator kills the frozen bounded local positive grammar |

## What is genuinely constructed

### Orbit and Frobenius layer

- finite-field closed points and Frobenius are the complete benchmark;
- arithmetic/scaling sites have prime periodic orbits and Frobenius
  correspondences;
- Deninger's rational-Witt dynamics has closed-point-related periodic-orbit
  packets;
- 2025 class-field covers match prime-orbit monodromy to Frobenius in finite
  abelian extensions of `Q`.

### Cohomology, duality, and special values

- Weil--etale complexes and THH/TC-related filtrations encode integer special
  values and a shadow of the functional equation;
- Riemann--Roch and Serre-duality structures exist for compactified `Spec Z`
  in the Connes--Consani setting;
- prismatic and Fargues--Fontaine theories supply strong local Frobenius,
  slopes, filtrations, and comparison mechanisms;
- arithmetic Hodge-index theorems exist for adelic line bundles on ordinary
  projective varieties.

### Trace and analytic positivity

- the explicit formula has semi-local trace realizations in the adele-class
  framework;
- the single archimedean-place Weil positivity problem has a conceptual
  operator-theoretic theorem;
- screw/finite-Galerkin coordinates make the complete Weil form more tractable
  but do not independently generate its positivity.

## Missing comparison edges

| id | missing edge | why it matters | false completion to reject |
| --- | --- | --- | --- |
| M1 | all local `p`-adic realizations + infinity -> one global carrier | creates a single flow/product-formula object | a list of unrelated local theories |
| M2 | arithmetic carrier -> functorial cohomology with `Theta` | turns prime orbits into spectral invariants | defining `H^1` as the span of known zeros |
| M3 | Frobenius correspondences on the square -> intersection/effectivity | supplies the Hodge-index mechanism | identifying self-intersection with Weil's form and stopping |
| M4 | algebraic duality -> positive polarization | distinguishes reflected off-line spectra | treating the functional equation as positivity |
| M5 | finite/bounded correspondences -> dense analytic test space | closes the theorem uniformly | extrapolating finite PSD cells |
| M6 | finite-field realization <-> arithmetic realization | makes “transport” a theorem | numerical `q -> 1` resemblance |
| M7 | carrier functoriality -> coefficient objects/L-functions | moves beyond one zeta function | claiming GRH from a `K=Q` construction |

## Countermodel atlas

| control | structures retained | required failure point | use |
| --- | --- | --- | --- |
| positive-orbit reciprocal family `Z_(u,v)` | nonnegative closed orbits, Euler product, trace counts, functional equation, algebraic weight-one duality | positive polarization/effectivity | mandatory control for A7 |
| Davenport--Heilbronn functions | Dirichlet series, analytic continuation, Riemann-type functional equation, reflected zeros | Euler/local-orbit factorization | mandatory control for A1/A5 |
| Beurling generalized primes | literal generalized-prime Euler product and orbit-like arithmetic | global duality, archimedean geometry, or polarization depending on system | mandatory control for claims that Euler product is enough |
| reversed/signed prime weights | much of finite operator geometry | arithmetic positivity | local specificity control |
| prime-square rational separator | target positivity remains true, frozen local atom cone fails | bounded local generation | obstruction to flat divisor-cube grammars |

The first control is exact and ships with this atlas.  Its indefinite duality
pairing is the cleanest warning: reflection symmetry and positive polarization
are different mathematical statements.

## Theorem ladder

Each rung must be proved without assuming a later rung.

| rung | theorem target | independent payoff | kill condition |
| --- | --- | --- | --- |
| T0 | axiom-independence and countermodel theorems | prevents circular architectures | proposed axiom cannot distinguish any control |
| T1 | comparison functor on a restricted class of global fields/carriers | transports already-proved structures exactly | only a heuristic analogy or `q -> 1` fit is obtained |
| T2 | global local-to-archimedean gluing with a new special-value formula | new zeta/L-value theorem | gamma terms or zeta values are inserted by definition |
| T3 | orbit--trace/determinant theorem without positivity | geometric explicit formula and functorial spectral object | cohomology is reconstructed from the zeros |
| T4 | one-finite-place semi-local polarization on an intrinsic support class | first arithmetic extension of the archimedean theorem | proof reduces verbatim to Weil's full equivalent form |
| T5 | Hodge-index/effectivity for bounded-conductor algebraic correspondences | restricted zero/prime cancellation theorem | only finite numerical positivity is shown |
| T6 | restriction-compatible uniform closure to a dense test core | legitimate finite-to-infinite passage | constants grow so fast that no closure follows |
| T7 | full arithmetic Hodge--Riemann polarization | RH for the represented zeta/L-functions | endpoint |

`T2` and `T3` may be pursued in either order.  `T4` and `T5` are competing
routes to the first finite-place-sensitive positivity theorem.  The atlas does
not assume which framework supplies them.

## Obstruction inventory from PrimeVisuals

| obstruction | exact lesson | architectural demand |
| --- | --- | --- |
| fixed-dimensional mask invariants factor through tuple moments | scalar nonlinear summaries do not escape known tuple content | use functorial/growing structures rather than another statistic |
| deep local conditioning absorbs gap dynamics | local admissibility mimics sequence laws | require a mechanism beyond finite sieve data |
| quadratic translation-invariant block kernels lose a factor `H` | covariance invention does not create fluctuation-scale control | do not search inside bounded quadratic kernels |
| structured large-value candidate lost coefficient dependence at the operator norm | an invariant can disappear at a universal norm reduction | preserve directional/coefficient information through the theorem |
| Weil-screw finite coverage is congruent to sampled positivity | a coordinate is not an independent invariant | demand a derived pairing or comparison theorem |
| prime-square width-two cone has an exact dual separator | flat bounded local positive atoms cannot generate the complete form | search for global/archimedean/curved/restriction-compatible structure |
| naive real Weil cohomology is impossible | the classical template cannot be copied literally | allow semilinear, derived, topological, or noncommutative coefficients |

## Bounded workshop program

### W1 -- completed: positive-orbit control

Maintain the exact `Z_(u,v)` family as a regression test.  Every proposed
polarization must name and prove the axiom it violates.

### W2 -- next: separator-channel diagnosis

Use the certified `N=8` prime-square separator only as a diagnostic.  Pair it
against preregistered global channels motivated independently by the atlas:

1. archimedean boundary/curvature terms;
2. adjoint/noncausal dilation channels;
3. position-dependent Hodge weights;
4. product-formula couplings across all prime directions;
5. restriction-map defect channels.

Success is not cone membership.  Success is a symbolic statement that one
channel class is necessarily detected by every separator in a proved family.
Post-hoc atom accumulation is a kill.

### W3 -- finite-field geometric discriminator

Compare actual curve zeta numerators with the positive-orbit RH-false family.
Catalog which *geometric* constraints reject the controls: Hasse bounds,
effective divisor counts, Jacobian/polarization data, and cohomological purity.
The output is a minimal discriminator theorem, not a classifier trained on
examples.

### W4 -- implication DAG

Formalize finite rational models showing the independence of:

`orbits -> trace -> reciprocity -> algebraic duality -> positivity`.

Where feasible, export Lean-ready statements.  This keeps future frameworks
from silently replacing one arrow by an equivalence.

### W5 -- source-level dependency maps

Extract machine-checkable obligation graphs for:

- Weil's finite-field Hodge-index proof;
- the Connes--Consani archimedean positivity theorem;
- Weil--etale/THH special-value gluing;
- Deninger's arithmetic dynamical construction.

The desired output is the smallest missing lemma shared by at least two
frameworks.

## Rosati campaign result

The `W3 -> W4 -> W5` campaign has now been run through its first exact target;
see `rosati-discriminator/`.

1. The finite-field degree-two adjoint form is
   `J=[[2,a],[a,2q]]`, with `det(J)=4q-a^2`.
2. Every frozen positive-orbit RH-false control retains Frobenius--Verschiebung
   duality but has determinant `-(r-s)^2`; positivity is the exact missing
   arrow.
3. The adele-class modular involution already gives
   `Phi_t^sharp=e^t Phi_(-t)` and `Theta^sharp=1-Theta`.  This reconstructs an
   arithmetic Rosati datum at P2, though its positivity is open.
4. The coarse arithmetic Jacobian cannot itself carry this flow: it is the
   orbit quotient by scaling.  Ordinary group completion also kills its
   idempotent Abel--Jacobi prime image.  The weight-one object must be
   relative/transverse or cyclic.
5. The first finite-place target is the `c=3`, `S={infinity,2}` comparison.
   The field-level attack found that the cutoff-free matrices represent the
   localized Weil form `Q_W`, while the pole-free Dirichlet form subtracts the
   rank-two pole term.  Neither is the Sonin comparison remainder `Q_W-T_S`.
   Interval `LDL^T` certifies positive finite Weil blocks through dimension
   `401`, but this does not test P3.

P3-C0a is now proved: in common Mellin coordinates the semilocal amplification
is multiplication by `d_2(s)=1-2^(-1/2-is)`, which gives the exact native
Sonin projection

`P_S=D P (P D^*D P)^(-1) P D^*`

and proves trace-class positivity on the published archimedean admissibility
class.  The exact next P3 lemma is P3-C0b: derive this trace in the same
explicit basis as `Q_S`, form the calibrated kernel `E_S=Q_S-T_S`, and verify
the archimedean restriction.  Only after that identity exists is a sign test
on `E_S` meaningful.

The constrained nonlocal Poincare inequality for the pole-free jump form at
`a=(log 3)/2`, equivalently a uniform frequency-tail Schur/resolvent bound,
remains a legitimate separate localized-Weil theorem.  The potential is
explicitly negative, so pointwise positivity and generic compactness bounds
are dead ends.  This Lane W theorem cannot promote the Sonin/Rosati claim
without P3-C0.

## Stop rules

Stop a lane immediately if it does any of the following:

1. defines a spectrum from the known zeta zeros;
2. defines positivity to be Weil positivity without a geometric proof;
3. fits a literal `q -> 1` limit;
4. adds arbitrary PSD remainders or target-selected atoms;
5. extrapolates finite positivity without compatible restrictions and uniform
   bounds;
6. merges frameworks by analogy without a functor/comparison theorem;
7. produces no independent theorem before the RH endpoint;
8. survives the real zeta case but also accepts every positive-orbit control.

## Primary sources

- Deninger, [Dynamical systems for arithmetic schemes](https://arxiv.org/abs/1807.06400).
- Deninger, [No real-coefficient Weil cohomology for arithmetic curves](https://arxiv.org/abs/2204.02714).
- Connes--Consani, [Geometry of the scaling site](https://arxiv.org/abs/1603.03191).
- Connes--Consani, [Riemann--Roch strategy and complex lift](https://arxiv.org/abs/1805.10501).
- Connes--Consani, [Riemann--Roch for the ring Z](https://arxiv.org/abs/2306.00456).
- Connes--Consani, [Weil positivity at the archimedean place](https://arxiv.org/abs/2006.13771).
- Connes--Consani, [Quasi-inner functions and local factors](https://arxiv.org/abs/2008.10974).
- Connes--Consani--Moscovici, [Zeta zeros and prolate wave operators](https://arxiv.org/abs/2310.18423).
- Connes--Consani, [Knots, primes and class field theory](https://arxiv.org/abs/2501.06560).
- Connes--Consani, [On the absolute geometry of Spec Z](https://arxiv.org/abs/2606.06604).
- Flach--Morin, [Weil--etale cohomology and zeta-values](https://arxiv.org/abs/1605.01277).
- Morin, [Topological Hochschild homology and zeta-values](https://arxiv.org/abs/2011.11549).
- Bhatt--Lurie, [Absolute prismatic cohomology](https://arxiv.org/abs/2201.06120).
- Yuan--Zhang, [Arithmetic Hodge index for adelic line bundles](https://arxiv.org/abs/1304.3538).
- Suzuki, [Weil's quadratic form via the screw function](https://arxiv.org/abs/2606.09096).

## Current decision

`W3` and the implication core of `W4` are complete.  P3-C0a has transported
the positive one-prime Sonin projection and trace.  The first remaining P3
obligation is semantic rather than spectral: prove P3-C0b, the explicit-basis
Weil-minus-Sonin comparison identity.  The `c=3` Poincare/resolvent problem is
retained as a separate localized-Weil side theorem.  Finite PSD,
quasi-innerness, moment positivity, pole deletion, and coarse-Jacobian
linearization do not promote.  `W2` remains a bounded side diagnostic and must
not pull the program back into arbitrary local cone engineering.  See
`rosati-discriminator/P3_ATTACK_AND_RESET.md`.
