# edge.md — the frontier

**Why this file exists.** The goal is a novel critical line / deep structure in the
primes. Hard lesson from the June-2026 sessions: the genuinely deep open problems
here resist empirical attack *by their nature* (the parity barrier; criticality).
That is the **qualifier for a worthy target, not a reason to drop it.** You don't
brute-force these — you take one and hunt for a **synthesis** that throws a
*computable shadow* of it, then read the shadow. This file gathers the frontier
conjectures, their honest status, the barrier that makes each hard, and every
angle we have to get a clue.

## Ground rules (earned the hard way)
- A straight line is cheap (poles, constants, telescoping sums are all linear).
  Nothing counts until a **matched twin fails to reproduce it** (Cramér / shuffle).
- Raw pointwise prime transforms are barren: PNT-linear or Weyl-flat.
- The primes' **additive** structure is fully consistent with Hardy–Littlewood at
  computable scale — the unexplained residual is *not* there.
- The open frontier *not* closed by H–L: **multiplicative randomness
  (Chowla / Sarnak)**, and **family phenomena (murmurations)** which need labeled data.
- You cannot name a novel finding in advance; maximize
  (model-incomplete) × (under-computed) × (clean null), and look without a prior.
- Tooling: `scripts/explore.mjs`, `scripts/hunt.mjs` (gauntlet + self-improving
  generator), `logs/bias.md`, the 5-bar test, the Cramér twin.

---

## The conjectures

### 1. Riemann Hypothesis — the critical line Re(s) = ½
All nontrivial zeros of ζ have real part ½. **Status:** open. **Elementary
equivalents (no ζ needed):** Mertens `M(x)=O(x^{1/2+ε})`; `ψ(x)−x=O(√x log²x)`;
Robin's inequality `σ(n)<e^γ n log log n`; Lagarias. **Criticality:** de
Bruijn–Newman `Λ=0` ⟺ RH, and `Λ≥0` is *proven* (Rodgers–Tao 2018) — the primes
sit with zero slack at the edge of a phase transition. **Barrier:** the zeros /
the explicit formula; criticality means no margin.
**Our no-ζ findings:** cancellation exponent θ=½ recurs (Mertens, Chebyshev);
a *different* critical exponent **θ≈¼** lives in the squarefree/divisor residual
(Dirichlet-divisor family); cos-sum-over-primes shows an α-resonance transition
(known Vinogradov); the "primon gas" critical temperature is just ζ's pole in
disguise; Weil/Hasse gives a hard spectral critical envelope `|a_p|≤2√p`.

### 2. Chowla's conjecture — multiplicative randomness  ★ CHOSEN FOCUS
For distinct shifts `h₁,…,h_k`: `(1/x)Σ_{n≤x} λ(n+h₁)···λ(n+h_k) → 0`, i.e. every
sign pattern in `{±1}^k` has natural density exactly `1/2^k`. (`λ(n)=(−1)^Ω(n)`.)
**Status (checked, 2026-06):**
- k=1 ⟺ PNT (proven).
- natural-density equidistribution for **k≥2: OPEN** (this is the heart).
- 2-point **log-averaged** Chowla: proven (Tao 2016); **odd-order** log-averaged:
  proven (Tao–Teräväinen 2017); **even-order ≥4 log-averaged: OPEN**.
- *Occurrence* of all patterns: length ≤3 positive density (Matomäki–Radziwiłł–Tao
  2015), length 4 positive density + conjectured log-density (Tao–Teräväinen 2017),
  length 2 equidistribution unconditional (2022). [So "k=4 occurrence" is CLOSED;
  exact natural-density equidistribution is the open part.]
**Barrier:** the **parity problem** — sieve methods provably cannot determine the
parity of Ω(n). Structure here is invisible to the field's main tool.
**Synthesis / clue angles → see the section below.**

#### Corrected target (referee-checked 2026-06-16)

**Use Möbius, not Liouville.** Over `F_q[t]`, `Σ_{deg=n} μ_q = 0` for `n≥2` (mean-zero),
whereas `λ_q` carries an *exact* `±q^{n/2}` degree-parity oscillation from
`ζ_q(u²)/ζ_q(u)`. So λ needs square-divisor bookkeeping; μ is the clean object.
Recover λ via `λ(n)=Σ_{d²∣n} μ(n/d²)`.

**Target — uniform power-saving binary Chowla (correct quantifiers).** Do NOT write
`≪_h` and "uniform in h" together; they pull opposite ways. Correct form:
`∀η>0 ∃δ(η)>0:  sup_{1≤|h|≤N^{1−η}} |Σ_{n≤N} μ(n)μ(n+h)| ≪_η N^{1−δ(η)}`.
"Nailing δ" is ill-posed (any δ ⇒ all smaller); the testable question is whether the
true scale is `N^{1/2+o(1)}`.

**The engine — the *unshifted* Type-II form is FALSE.** Not
`|Σ_{m∼M}Σ_{n∼N} α_m β_n μ(mn)| ≪ X^{1−δ}` for arbitrary `|α|,|β|≤1`:
take `α_m=μ(m), β_n=μ(n)`; since `μ(mn)=μ(m)μ(n)1_{(m,n)=1}` the sum counts coprime
squarefree pairs `≍ X` (for λ every term is `+1`). Same counterexample over `F_q[t]`,
so this is *not* what Sawin–Shusterman prove. The parity-sensitive engine needs the
shift **inside** the form (a shifted bilinear / cut-norm):
`sup_{|α|,|β|≤1} |Σ_{m∼M}Σ_{n∼N} α_m β_n μ(mn+h)| ≪_η X^{1−δ}`, `MN≍X`, `M,N≥X^η`.
Caveat: not literally equivalent to binary Chowla — also needs Type-I estimates,
decompositions, shift-uniformity, local-factor control.

**Binary Chowla ≠ twin primes.** The prime parity-breaker is a shifted-prime Möbius
estimate `Σ_{n≤x} Λ(n) μ(n+h) = o(x)` plus Elliott–Halberstam (Murty–Vatwani).

**What `F_q[t]` actually gives (corrected anchors).**
- Carmon–Rudnick 2014: *large-q, fixed-n*, normalized correlation `O(q^{−1})` (Pellet +
  Weil RH for curves). Not the fixed-q, `n→∞` regime that mirrors `N→∞`.
- Sawin–Shusterman 2022: power-saving μ-cancellation on polynomial sequences, quadratic
  Bateman–Horn, near-level-1 distribution; mechanism = **μ mimics a quadratic character
  on special subspaces** (sheaf/trace-function geometry) — *not* the arbitrary-coefficient
  Type-II form.
- Keating–Rudnick reformulation: `Σ_{deg f=n} μ(f)μ(f+1) = |Y_n(F_q)| − q^n` (point count
  on a double cover) — the geometric source of cancellation.

**Route A (ergodic) — correct strength.** Frantzikinakis–Host: log-Furstenberg systems
of μ have no irrational spectrum, ergodic components = Bernoulli × ∞-step nil; ergodicity
of the Liouville system ⟹ log-Chowla. This yields `o(N)` (qualitative); a **power saving
`N^{1−δ}` is a separate quantitative mixing input** not delivered by structure alone.

**Computational program (corrected objects).** (i) shifted bilinear cut norms
`sup_{|α|,|β|≤1}|Σ α_m β_n μ(mn+h)|` — measure the scale; (ii) block entropy / spectral
measure of the Liouville Furstenberg model (Route A shadow); (iii) exact `F_q[t]`
analogues (`μ_q` correlations; the `Y_n` point counts). Goal is not to "prove δ" but to
test `N^{1/2+o(1)}` and expose the secondary/local structure any proof must reproduce.

### 3. Sarnak's Möbius disjointness
`Σ_{n≤N} μ(n) f(n) = o(N)` for every f from a zero-entropy dynamical system.
**Status:** many cases proven; general open. **Chowla ⟹ Sarnak.** **Clue:** the
λ/μ *subshift* — its complexity and entropy (see angle 1).

### 4. Hardy–Littlewood k-tuple + Lemke Oliver–Soundararajan bias
First H–L: prime constellations counted by the singular series (unproven). LO–S
(2016): consecutive primes' residues mod q are biased — *explained* by the H–L
secondary term; extended to sums of two squares (2021). **A Liouville analog
appears under-explored but is likely null** (λ is conjecturally *genuinely*
random, with no residue-class constraint to create the bias). **Barrier:** H–L
itself unproven; the 2nd H–L conjecture is incompatible with the 1st
(Hensley–Richards) and believed false.

### 5. Pair correlation / GUE (Montgomery–Odlyzko)
Spacings of ζ-zeros match GUE random matrices, with arithmetic lower-order
corrections (Bogomolny–Keating). The multiplicative dual is Chowla. **Uses zeros.**

### 6. Short-interval irregularity (Maier 1985; Montgomery–Soundararajan)
Maier *proved* primes in windows `(log x)^λ` violate the Cramér model. M–S
conjecture a precise short-interval variance with log corrections + Gaussian
fluctuations. **Computable; the model is provably broken — the right model is the
open part.**

### 7. Murmurations — the family frontier
He–Lee–Oliver–Pozdnyakov (2022–23), Zubrilina (density). An oscillating
correlation between Frobenius traces `a_p` and **rank**, averaged over families of
elliptic curves ordered by conductor; invisible in any single object and to a
linearity detector. **Key lesson:** it needs **labeled-family data** (rank,
conductor) — information not present in a bare prime sequence. To hunt this class,
the instrument must ingest `(object, invariant)` pairs (LMFDB export, or
**function-field families where labels are computable from point counts**).

---

## Synthesis angles for Chowla (the live program)

The principle: λ is conjecturally random; pair "is λ random?" with a field that
has a computable test for randomness, and read the deviation.

| # | Field fused | Computable shadow | The clue |
|---|---|---|---|
| 1 | symbolic dynamics (Sarnak) | block-complexity p(k), block-entropy of λ | deficit below 2^k = hidden structure |
| 2 | additive combinatorics | Gowers U², U³ norms of λ on [N] | the phase λ leans toward |
| 3 | machine learning | predict λ(n) from residues/digits/prior λ; holdout acc vs 50% | any persistent edge + feature importance |
| 4 | information theory | LZ / entropy-rate of the λ bitstream | a compressibility gap |
| 5 | function fields (PROVEN) | exact λ-correlations over F_q[t] | the mechanism/rate of real cancellation |
| 6 | spectral (Σλ/n^s=ζ(2s)/ζ(s)) | empirical power spectrum of {λ(n)} | any peak/atom = the zeros' shadow |
| 7 | M–R short intervals | H-window averages of λ | the exceptional (non-cancelling) set |
| 8 | Elliott / cross-corr | λ vs other multiplicative fns / characters | surprising non-vanishing = dependency |

**First moves:** angle 3 (ML predictability) + angle 2 (Gowers U²/U³), anchored by
angle 5 (function-field ground truth). Angles 1 and 6 are the deepest bridges if
the empirical ones light up.

---

## Refined empirical work to date (so we don't repeat it)
- ~1,900 no-ζ specs hunted; 0 survived all 5 bars → the primes' additive residual
  is empty (consistent with H–L). Logged in KNOWLEDGE.md as CLOSED-NO-SURVIVOR.
- Hardened `hunt.mjs`: order-sensitive chips (dyexp/diff) need a Cramér twin, not
  the (rigged) shuffle null; `update` rewards bar-5 *survival*, not promotion.
- Murmuration reproduction from scratch failed *for the right reason*: signal lives
  in the rank-parity split; bare family average ≈ twin (needs labeled data).

---

## See also

`radical.md` — five programs that invert the hunt: choose spaces where the
critical locus is *forced by a theorem* (Lee–Yang circle, HN concavity,
self-adjoint spectra, the Weil wall, LLN persistence measures) and move the
prime content into the measure the primes induce on the forced locus.
