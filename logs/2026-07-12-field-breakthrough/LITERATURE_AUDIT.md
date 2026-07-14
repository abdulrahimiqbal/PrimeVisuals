# Literature and novelty audit

Literature is checked against primary papers, author preprints, books, and
official mathematical sources. For each surviving statement this file records
the closest theorem, conjecture, equivalent, and failed approach, together with
exact differences in hypotheses, ranges, constants, mechanisms, and
consequences.

Literature checked through: 2026-07-12.

## Round 1 — zero amplification

- Guth--Maynard, `https://annals.math.princeton.edu/2026/203-2/p06`, gives the
  current `T^(30(1-sigma)/13+o(1))` zero-density advance.
- Maynard--Pratt,
  `https://academic.oup.com/imrn/article-abstract/2024/19/12978/7750386`,
  bounds half-isolated zeros but does not force clusters.
- Bagchi, `https://real-j.mtak.hu/7474/1/MTA_ActaMathHung_50.pdf`, proves the
  global strong zeta self-recurrence criterion equivalent to RH; the campaign's
  one-disk lemma is only the local Rouché implication.
- Lamzouri--Lester--Radziwill, `https://arxiv.org/abs/1611.10325`, retains the
  nonvanishing-target restriction in effective universality, so ordinary
  universality cannot use a zeta target containing the hypothesized bad zero.

The countermodel is an elementary construction from canonical products; no
novelty claim is made.

## Round 2 — mollifier coercivity

Nearest successful mechanism: the Levinson--Conrey method uses mollified
moments plus the argument principle to prove proportions of zeros on the
critical line; it is not an isolated-zero exclusion theorem. A representative
primary-source refinement is Kühn--Robles--Zeindler,
`https://arxiv.org/abs/1403.5786`.

Nearest abstract obstruction: classical `H^p` inner--outer factorization.
Blaschke products encode zeros while having boundary modulus one. The campaign
lemma is a direct standard corollary and has no novelty claim.

## Round 3 — de Branges/canonical systems

- Suzuki, `https://arxiv.org/abs/1606.05726`, constructs Hamiltonians from
  `L`-functions and states the local and global Fredholm criteria.
- Suzuki's revised zeta construction, `https://arxiv.org/abs/1204.1827`,
  retains the all-parameter/global-extension obstruction.
- Romanov, `https://arxiv.org/abs/1408.6022`, provides the canonical-system/de
  Branges inverse-theory framework and its normalization data.
- Suzuki, `https://arxiv.org/abs/2301.00421`, explicitly notes that the
  Weil-derived Hilbert space is built under RH.

The Hermite--Biehler contradiction and Herglotz-weight underdetermination are
standard consequences of this theory; no novelty claim is made.

## Round 4 — Nyman--Beurling

- Báez--Duarte, `https://arxiv.org/abs/math/0205003`: integer dilations suffice
  and the zero-distance limit is RH-equivalent.
- Burnol, `https://arxiv.org/abs/math/0103058`: critical-line zero
  multiplicities give the unconditional lower-bound scale.
- Bettin--Conrey--Farmer, `https://arxiv.org/abs/1211.5191`: the expected
  asymptotic uses RH plus a moment bound for `1/zeta'(rho)`.
- Ehm, `https://arxiv.org/abs/2405.06349`: exact Gram decomposition leaves
  Landau/Mertens/Möbius-inversion error terms unresolved.
- Alouges--Darses--Hillion, `https://arxiv.org/abs/2006.02953`: approximation
  and coefficient-tail control remain distinct obligations.

The Hilbert projection lemma, compactness obstruction, and `ell^2`
counterexample are elementary functional analysis; no novelty claim is made.
The numerical label `0.0461914...` in the historical Nyman pilot is the full
expected constant under additional zero hypotheses, not an unconditional
identity supplied by Burnol alone.

## Round 5 — Weil decomposition

Nearest repository result: the exact hard death certificate in
`logs/prime-square-completion/VERDICT.md`, which kills the frozen flat
three-generator prime-square cone but expressly leaves non-flat global
carriers open. Nearest RH-equivalent framework: Weil positivity and its
localized/screw-function formulations. The campaign did not obtain a new
representation theorem beyond these known frameworks.

## Round 6 — finite-place Hodge/Sonin transport

- Connes--Consani--Moscovici, `https://arxiv.org/abs/2310.18423`, gives the
  finite-set semilocal Sonin stability underlying `M_F=D_FM`.
- Connes--Consani, `https://arxiv.org/abs/2006.13771`, gives the archimedean
  positive compressed-trace comparison.
- Connes--Consani--Marcolli, `https://arxiv.org/abs/math/0703392`, constructs
  the cyclic trace carrier but identifies global pairing positivity with RH.
- Yuan--Zhang, `https://arxiv.org/abs/1304.3538`, proves arithmetic Hodge-index
  inequalities on adelic intersection carriers; no comparison functor to the
  zeta spectral carrier is supplied.
- Deninger, `https://arxiv.org/abs/2204.02714`, rules out a naive real
  Weil-cohomology carrier but not the remaining complex/derived/relative space.

The finite-set projection formula and condition-number divergence are direct
operator/Euler-product deductions from published semilocal stability. They are
new repository lemmas, not asserted to be new to the field.

## Round 12 — finite positivity

Both the negative direct-sum extension and the dense-core continuity argument
are standard Hilbert-space facts. No novelty claim is made. The nearest
repository-specific exact obstruction is stronger but narrower: the `N=8`
prime-square cone separator. Neither result is a field-level no-go theorem for
all compatible Hilbert--Pólya constructions.

## Round 10 — family density

Representative modern primary sources include Corrigan--Zhao,
`https://arxiv.org/abs/2211.00260`, on zero-density theorems for families of
Dirichlet `L`-functions, and Pascadi--Thorner,
`https://arxiv.org/abs/2508.14888`, on `GL_n` large sieves and family density
estimates. The best individual zeta comparison used in this campaign is
Guth--Maynard, Annals of Mathematics 203 (2026),
`https://annals.math.princeton.edu/2026/203-2/p06`, which proves
`N(sigma,T)<=T^(30(1-sigma)/13+o(1))`. No source found a general principle by
which an unamplified family average improves that distinguished-member bound.

## Round 11 — higher block moments

Nearest broad results are the Green--Tao/Green--Tao--Ziegler finite-complexity
linear-forms theorems for primes and modern averaged Hardy--Littlewood
correlation work. The exact target range here would require uniform growing-
shift information not supplied by those theorems. The repository's closest
current frontier is Matomaki--Radziwill--Shao--Tao--Teravainen,
`https://arxiv.org/abs/2411.05770`, whose almost-all-shift machinery was already
audited as losing a full factor of the shift range for ABAC. No literature
claim is made that the cubic reduction itself is new.

## Round 8 — Furstenberg systems

- Frantzikinakis--Host, `https://arxiv.org/abs/1708.00677`, gives qualitative
  structure of logarithmic Möbius/Liouville Furstenberg systems.
- Frantzikinakis, `https://arxiv.org/abs/1611.09338`, uses multiplicative input
  to relate ergodicity of the Liouville system to Chowla.
- Tao--Teräväinen, `https://arxiv.org/abs/1708.02610`, identifies ergodicity
  with logarithmic Chowla in the relevant setting.
- Tao, `https://arxiv.org/abs/1509.05422`, proves qualitative logarithmically
  averaged two-point Chowla.
- Tao--Teräväinen, `https://arxiv.org/abs/2107.02158`, gives quantitative
  Gowers-uniformity bounds at logarithmic, not fixed-power, scale.

The Markov, Koopman, and generic-point counterexamples are standard ergodic
constructions and carry no novelty claim.

## Round 7 — shifted Möbius boxes

- Matomaki--Radziwill--Tao, `https://arxiv.org/abs/1503.05121`, uses Ramaré
  factorization and obtains cancellation after averaging over shifts, at
  logarithmic rather than fixed-power scale.
- Tao, `https://arxiv.org/abs/1509.05422`, proves logarithmically averaged
  two-point Chowla for fixed nonproportional forms.
- Pilatte, `https://arxiv.org/abs/2310.19357`, improves logarithmically weighted
  two-point Chowla by a power of `log X`, not a Cesàro power.
- Sawin--Shusterman, `https://annals.math.princeton.edu/2022/196-2/p01`, proves
  function-field Chowla using special-subspace character mimicry and geometry,
  not an arbitrary-coefficient Type-II theorem transferable to integers.
- Lichtman, `https://academic.oup.com/qjmath/article/73/2/729/6446139`, obtains
  shifted-prime Möbius cancellation only after averaging over shifts, not the
  fixed-shift power-saving endpoint required here.

The divisor identity is a Ramaré-style exact decomposition and the dispersion
calculation is elementary; no novelty claim is made.

## Round 9 — Maynard threshold certificate

- D. H. J. Polymath, `https://arxiv.org/abs/1407.4897`, defines the enlarged-
  support problem and records `M_(50,1/25)>4.0043`.
- Johansson, `https://arxiv.org/abs/1611.02831`, documents Arb midpoint-radius
  interval arithmetic suitable for verified pivots.
- Rump, `https://www.sciencedirect.com/science/article/pii/S0024379500002743`,
  gives verified error bounds for symmetric eigenvalue problems.

The rational threshold-inertia equivalence is standard quadratic-form theory.
Its application here is a new repository certificate strategy, not a claimed
field-level theorem.
