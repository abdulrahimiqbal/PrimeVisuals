# radical.md — five programs for a fresh critical locus (not RH, not a reformulation)

**Why this file exists.** ~90 graveyard entries and ~1,900 hunted specs share one
format: a scalar cumulative statistic over the integer line, whose "line" is a
statistical claim that must then be defended against nulls. Every death fits a
five-item taxonomy: telescoping funnels (Mertens/Chebyshev/PNT coordinates),
local-shell absorption (wheel → rough → deep-admissible), one-point distribution
bias (gap law / PIT), train-test or window-lag nonstationarity, and exact
identities (complete-family character sums). The diagnosis is structural, not
bad luck: a 1-D path's flatness is cheap to fake, so the adversary always wins,
and the deep open structure (parity / multiplicative randomness) is provably
invisible to one-point sieve-style observables anyway.

**The inversion.** Stop hunting for a line and defending it. Choose spaces where
the critical locus is *forced by a theorem* — a circle all zeros must lie on, a
polygon that must be concave, a spectrum that must be real, a wall that cannot
be crossed — and move the prime content into the **measure the primes induce on
the forced locus**. An artifact can imitate an exponent; it cannot fake a
theorem. The twin's job changes from matching one number to matching a measure
(infinitely many moments), and when a matched twin fails, the failure has an
*address* (a Fourier mode, a facet, a spectral window, a diagram region) — a
lead instead of a z-score.

Design rules shared by all five programs, mapped to the graveyard taxonomy:

| graveyard failure mode | design rule that kills it |
|---|---|
| telescoping funnel | observable is a global nonlinear functional (zero set, spectrum, polygon, diagram) — nothing is cumulatively summed over n until the final measure comparison |
| local-shell absorption | shell twins are preregistered as the *primary* null; the observable is multi-point, so a one-point-matched shell either matches the whole measure (informative absorption, log it) or fails at a located coordinate |
| one-point gap-law bias | zeros/spectra/homology depend on joint, ordered structure by construction — the Cycle-88 directive ("genuinely multi-offset / order-dependent") is satisfied definitionally |
| nonstationarity / window lag | statistics are computed per fixed window / fixed degree / fixed spectral band, with persistence across bands, never as a running path |
| exact identity collapse | each program names its exactly-solvable baseline in advance and treats it as the null, not the finding |

Every program has an exact `F_q[t]` transport (the council's signature object)
and a **reformulation tripwire**: a preregistered construction boundary beyond
which the object would collapse back into ζ. Bars are unchanged: statement,
shape, persistence, twin/null contrast, known-math check.

---

## Program 1 — the Lee–Yang prime ferromagnet: a critical circle bought by theorem

**The forced locus.** Take Ising spins σ ∈ {±1} on sites 1..N with *ferromagnetic*
pair couplings J_{mn} ≥ 0 encoding primes. The partition function in the fugacity
variable z is a degree-N polynomial, and the Lee–Yang circle theorem (1952;
Newman, Lieb–Sokal extensions) puts **all** of its zeros on |z| = 1 —
unconditionally, for *any* ferromagnetic coupling. The critical circle is a
theorem; no bar-4 defense of its existence is ever needed.

**The construction.** Preregister coupling families:
- (a) prime-distance band: J_{mn} = J·1[|m−n| prime], |m−n| ≤ w (window w);
- (b) spins on primes: sites = primes ≤ N, couplings a fixed function of gap
  ranks within a window;
- (c) `F_q[t]` transport: sites = monic polynomials by degree, couplings from
  irreducible differences.

**The prime observable.** The angular measure ν_N of the N zeros on the circle:
its gap at θ = 0 (the Lee–Yang edge θ_c — presence/absence *is* the phase
transition), the edge exponent (zero density ~ |θ−θ_c|^σ), and the Fourier
moments of ν. The statistic is Δν = ν(prime couplings) − ν(twin couplings) as a
measure on the circle, with twins = Cramér set and deep-admissible B-shell set
in the coupling rule, plus gap-shuffled couplings for variant (b).

**Why this is the right fit for this repo.** edge.md already records the deepest
known fact in this direction: de Bruijn–Newman Λ = 0 ⟺ RH with Λ ≥ 0 *proven*
(Rodgers–Tao) — "the primes sit with zero slack at the edge of a phase
transition." Lee–Yang theory is the native mathematics of that sentence. Here we
build a *different* stable-polynomial family where the phase-transition edge is
observable at finite N, and ask whether prime-structured couplings move the edge
relative to density-matched twins. Criticality becomes something you *watch*,
not conjecture.

**Reformulation tripwire.** The primon gas (graveyarded: "critical temperature
is ζ's pole in disguise") is the *free*, non-interacting case — its partition
function factors over primes into an Euler product and IS ζ. Interactions are
mandatory: any coupling of multiplicative-displacement form J_{mn} = g(m/n) on a
log lattice risks rebuilding a Dirichlet series through the transfer operator —
flag as reformulation-adjacent and stay with additive-window couplings. There is
no known dictionary from interacting Lee–Yang zeros to ζ zeros.

**First run.** N = 2,000 sites, window w = 12, coupling (a): compute Z(z)
coefficients by transfer DP over 2^w boundary states (exact bignum or interval
arithmetic), roots via standard polynomial solvers, angular histogram vs 15
Cramér twins and 15 deep-admissible twins; persistence in N (×2×4) and in w.
Visual: zeros on the circle, real vs twin overlay — a natural PrimeVisuals
scene. Cost: days, no new theory needed.

STATUS: OPEN-class; exactly-solvable baseline = free/uncoupled case (binomial
zeros, uniform-gap circle), preregistered as the calibration null.

---

## Program 2 — stability walls on the categorified integers (the category-theory overlap)

**The forced locus.** Let A = finite abelian groups (finite-length ℤ-modules):
the canonical categorification of the integers — simple objects ↔ primes ℤ/p,
Jordan–Hölder multisets ↔ factorization, K_0 ↔ multiplicative structure. Fix a
stability function Z(ℤ/p) = −log p + i·w(p), w > 0. By Rudakov/Bridgeland
theory, *every* object has a unique Harder–Narasimhan filtration, and its HN
polygon in ℂ is **concave by theorem**. The critical boundary (the polygon) is
forced; nothing about its existence is conjectural.

**The construction.** For each n ≤ N take M_n = ℤ/n. Because A splits into
p-primary blocks, ℤ/p^k is semistable of phase φ_p = arg(−log p + i·w(p)), and
the HN polygon of ℤ/n is its factorization laid out in phase order. Two levels
of structure:
- (i) **Limit shape.** The ensemble-average normalized HN polygon over n ≤ N.
  With w ≡ 1 this is an exact transform of largest-prime-factor structure —
  Billingsley / Dickman / Poisson–Dirichlet(1). KNOWN-MATH, and that is the
  point: the baseline is *exactly solvable*, so it is the null, not the finding.
  The target is the fluctuation field around the limit shape vs a
  Cramér-factorization twin (integers with factorizations resampled from the
  local model).
- (ii) **The wall web.** Vary the weight field in a family w_ε(p) (e.g.
  (log p)^{1+ε}). Walls = parameter loci where phases of two prime powers cross:
  w(p)/log p = w(q)/log q. The wall arrangement is a resonance web indexed by
  *pairs* of prime powers — a genuinely multi-point, order-dependent object (the
  phase order is a permutation of the primes that reshuffles every polygon at
  once). The critical object is the ε-locus where the ensemble limit shape
  changes its corner structure: a phase transition in stability space, not in
  the complex s-plane.
- (iii) **Hall weighting.** Refine existence-of-filtration to *counts* of
  filtrations: Hall numbers, whose generating structure is the classical Hall
  algebra (Hall–Littlewood/Macdonald territory) and whose natural measure is
  Cohen–Lenstra — the proven random-group universe. Prime-indexed Hall moments
  vs twins are a second-generation statistic with categorical meaning.

**`F_q[t]` transport.** Replace A by finite-length F_q[t]-modules: simples ↔
irreducibles, Hall structure constants are *polynomials in q* — the second
universe is exactly computable, degree by degree.

**Why better.** This is labeled-family statistics — each n carries a
function-valued invariant (its polygon), which is precisely the murmurations
lesson ("the instrument must ingest (object, invariant) pairs"). No sum over n
is ever taken; local one-point shells constrain smoothness of n but not the
joint phase order of its prime-power parts.

**Reformulation tripwire.** K-theoretically the data is log-linear; the polygon
is an *order statistic* of phases and has no known dictionary to ζ zeros. The
known-math anchors to check at bar 5 are Dickman/Billingsley (shapes) and
Cohen–Lenstra (Hall measure) — not RH.

**First run.** N = 10^7, w ≡ 1: mean polygon + fluctuation field vs
Cramér-factorization twin; then sweep ε over w_ε(p) = (log p)^{1+ε}, chart the
first wall crossings and test smoothness of the limit shape in ε. Exact `F_3[t]`
side at matched degree. Visual: overlaid polygons; the wall web in the (ε,
phase) plane.

STATUS: OPEN-class with an exactly-solvable KNOWN-MATH baseline named in
advance.

---

## Program 3 — the prime quantum graph: spectral geometry where the line is self-adjointness

**The forced locus.** Build a metric graph Γ_B: loops of lengths log 2, log 3,
log 5, …, log p_k (primes ≤ B) attached to vertices. The Kirchhoff Laplacian is
self-adjoint, so the spectrum is **real** — the critical line is the real k-axis
by functional analysis, not conjecture. The exact trace formula
(Roth/Kottos–Smilansky, elementary) pairs the spectrum with periodic orbits,
whose lengths are Σ mᵢ log pᵢ = log(B-smooth numbers): **unique factorization is
literally the geodesic length spectrum of this object.** This is the peculiar
geometry: instead of seeking an operator whose spectrum matches ζ's zeros
(Hilbert–Pólya — the forbidden funnel), we build the geometry *out of the
primes* and read the spectrum the theorems hand us.

**The prime observable.** The secular zeros {k_j} form an almost-periodic point
process driven by the linear flow t·(log 2, …, log p_k) on the k-torus,
equidistributed by Weyl *because* {log p} are ℚ-independent (unique
factorization again). Two measurables:
- (i) **Level statistics vs wiring.** Quantum-graph spacing statistics depend on
  topology (rose vs expander wiring of the same loop lengths; Gnutzmann–
  Smilansky). Sweep the wiring from maximally degenerate (one vertex) toward
  well-connected and locate the Poisson↔GOE crossover. The critical object is
  the **crossover boundary in wiring-parameter space**, and the statistic is the
  displacement of that boundary for prime lengths vs twin lengths (log of Cramér
  sets; log of deep-admissible sets; iid lengths matched to the log-prime
  density). Kurasov–Sarnak's stable-polynomial/crystalline-measure theory is the
  modern frame — and it is the same stable-polynomial mathematics as Program 1,
  arrived at from geometry instead of statistical mechanics.
- (ii) **Small-gap regime.** Near-degeneracies of the flow encode integer ratios
  near 1 among B-smooth numbers — a hard-known corner (smooth-number gaps) to be
  named at bar 5, not discovered.

**Reformulation tripwire.** Weighting periodic orbits by Λ(n)/√n and letting
B → ∞ reconstructs the Riemann–Weyl explicit formula — forbidden. Preregister:
unitary Kirchhoff dynamics only, no von Mangoldt weights, fixed finite B with
persistence studied in B and in spectral band.

**First run.** k ≤ 25 loops, secular function as explicit trigonometric
polynomial with subset-sum frequencies; roots on k ∈ [0, 10^5] by interval
bisection; spacing and number-variance statistics per band; twins as above; two
wirings (rose; 5-vertex expander distribution of the same loops). `F_q[t]`
transport: loop lengths = deg(f)·log q over irreducibles — lengths become
commensurate, giving an exactly periodic control universe (a feature: the
transport isolates what ℚ-independence of log-primes contributes).

STATUS: OPEN-class; baseline nulls are the universal quantum-graph ensembles.

---

## Program 4 — hard-edge statistics at the Weil wall: the proven critical parabola

**The forced locus.** The one place a Riemann Hypothesis is a *theorem* is the
Weil side: |a_p| ≤ 2√p (Hasse for elliptic curves; Deligne generally). Read the
curve |a| = 2√p as a **critical wall in the (p, a_p) plane that provably cannot
be crossed**, and study the primes' boundary-approach process. The bulk against
this wall is also solved — Sato–Tate (theorem for non-CM E/ℚ) — so *any*
surviving edge deviation is automatically beyond-known structure: the null here
is a proven theorem, the strongest null this workshop has ever had.

**The prime observable.** x_p = a_p/2√p ∈ [−1, 1]. Known-math anchors to
preregister at bar 5: extremal-prime counts (a_p near ±⌊2√p⌋) are conjectured at
the x^{3/4}/log x scale (non-CM); Lang–Trotter's x^{1/2}/log x carries a ½ whose
mechanism is Sato–Tate measure + Chebotarev — a critical exponent ½ that is
*not* RH's, already a useful exhibit. The fresh object is the **family edge
process**: across conductor-ordered families (murmuration-style labeled data),
rescale the top-k order statistics of {x_p : p ≤ X} per curve and test whether
the family-averaged edge process converges to a universal hard-edge law
(Bessel-kernel / Tracy–Widom class from random-matrix hard edges), and whether
its centering carries arithmetic labels (rank, conductor class) the way
murmurations' oscillation does. Either answer is a finding: universality class
membership or a measured arithmetic defect from it.

**Why better.** Max-type/extreme-value statistics — a funnel class with *zero*
graveyard entries (every prior death was mean-type). Labeled families by
construction. The repo already computes a_p families and Sato–Tate controls
(elliptic graveyard entries built the exact tooling this needs). CM curves give
a built-in contrast family with provably different edge behavior. And the two
universes are native: over `F_q[t]` Katz–Sarnak *prove* random-matrix laws as
q → ∞; the open, measurable regime is fixed q, growing genus — the deviation
between proven-limit and measured-finite is exactly the council's signature
object.

**Reformulation tripwire.** None needed for the wall (it is a theorem); the
trap is at bar 5: do not rediscover extremal-prime or Lang–Trotter conjectures
and call them fresh — the claim must live strictly in second-order / family-
universality territory those conjectures do not address.

**First run.** 200 non-CM curves ordered by conductor (LMFDB export or point
counts), p ≤ 10^7: per-curve top-32 rescaled edge statistics; family average;
nulls = iid Sato–Tate samples (existing tooling) and gap-preserving resampling;
CM family contrast; `F_3[t]` hyperelliptic family at matched size.

STATUS: OPEN-class; bulk null proven, edge conjectures named.

---

## Program 5 — persistence measures against the deep-admissible twin (the graveyard's own last words)

**The forced locus.** KNOWLEDGE.md's Cycle-88 close-out is explicit: one-gap
statistics are calibrated to death; "next attempts should be genuinely
multi-offset/order-dependent or use a two-universe matched statistic."
Persistent homology is the canonical multi-offset order-dependent observable:
an H_1 cycle exists only through *coordinated* constellations of many gaps, and
no one-point PIT/shell law generates those correctly. The forced object: by
Hiraoka–Shirai–Trinh, stationary point processes have a **law-of-large-numbers
limit persistence measure** — existence of the limit is a theorem; the diagonal
birth = death is its trivial boundary, and the question is where the primes'
measure detaches from their best null's.

**The construction.** Windows (x, x + H log x); embed each window by the
gap-delay map g_j ↦ (g_j, …, g_{j+d−1}) ∈ ℝ^d (d = 3..6) — deliberately built
from gaps so the deep-admissible twin is maximally competitive; Vietoris–Rips
filtration; persistence diagram per window; aggregate to the empirical
persistence measure ρ by homological degree.

**The prime observable.** Δρ = ρ(primes) − ρ(deep-admissible B = 97 twin), a
signed measure on {(b, d) : d > b}, with Cramér and W-wheel twins as weaker
controls. The critical object is the support boundary / quantile curves of Δρ in
the birth–death plane: the curve along which primes stop being a shell process.

**Honest risk and payoff.** Riskiest of the five — no theorem forces the primes
to deviate, and this repo's pointwise "persistence lifetime" probe features were
noise (different object: those were scalars per n, not measure-valued diagrams
against the deep shell). But it is the cheapest program, it is the direct
execution of the graveyard's own directive, and *absorption is informative*: if
the B = 97 shell reproduces the full H_1/H_2 persistence measure at all scales,
that materially extends the "additive residual is empty" conclusion from
one-point to genuinely multi-point observables — a KNOWLEDGE entry either way.

**First run.** N = 10^8, H = 64, d = 4, ~10^4 windows, standard Rips libraries;
15 twins per null family; two-universe side: irreducible-gap delay embeddings in
`F_3[t]` at matched degree.

STATUS: OPEN-class; explicitly the successor demanded by Cycle 88.

---

## Ranking and the first move

| # | program | line forced by | new-code cost | leverage on existing tooling | conceptual freshness |
|---|---|---|---|---|---|
| 1 | Lee–Yang ferromagnet | circle theorem | medium | twins/shells reusable | high |
| 2 | stability walls / HN | HN concavity | medium | factorization sieves | highest (true category overlap) |
| 3 | prime quantum graph | self-adjointness | highest | little | high |
| 4 | Weil wall edge | Hasse–Weil (proven RH) | low | elliptic + Sato–Tate tooling exists | medium |
| 5 | persistence measure | LLN for diagrams | lowest | deep-admissible null exists | medium |

Recommended order: **1 → 5 → 4 → 2 → 3.** Program 1 is the flagship (forced
locus, cheap compute, maximal contrast with everything in the graveyard, and it
inhabits the de Bruijn–Newman "zero slack" theme edge.md already owns). Program
5 is a fast, mandated-by-the-graveyard sanity campaign. Program 4 monetizes
tooling already built. Programs 2 and 3 are the deep bets.

**What "better than our attempts so far" means, measurably.** In every prior
cycle the *existence* of the line was the fragile claim and the nulls attacked
it. In all five programs the locus exists by theorem before any prime data is
consulted; the prime-specific claim is a located deviation of a measure on that
locus from preregistered twins. The observables are global nonlinear functionals
(zero sets, polygons, spectra, diagrams) that one-point local nulls cannot span
— they can only match by matching the whole joint process, which is itself the
informative outcome. Nothing telescopes; nothing is a running path; families are
labeled; every program ships with its exactly-solvable baseline named in advance
and an `F_q[t]` transport. The five bars stay exactly as they are — what changes
is that bar 4 finally gets observables rich enough to lose informatively.
