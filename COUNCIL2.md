# COUNCIL REPORT 2 — after the graveyard: where deeper structure can still hide (July 2026)

The question put to the reconvened council: Program 1 (COUNCIL.md, June
2026) built the instruments, ran the sprints, and produced a ~2,000-entry
graveyard, one refuted star conjecture, and one surviving unexplained
object — but no new theory of the primes. Given everything now measured
and everything now refuted, where can a genuinely novel deeper structure
still be found by this workshop, and what program actually reaches it?

The council reviewed the artifacts before deliberating. This report keeps
the load-bearing facts; every number below is checked against the repo.

## Part I — Artifacts examined (the evidence base)

1. **The wildcard graveyard** (`logs/2026-06-15-critical-line-hunt*.jsonl`,
   KNOWLEDGE.md cycles 1–12): ~1,894 no-ζ specs hunted across 12 cycles;
   139 mechanically cleared bars 2–4; **0 survived bar 5**. Every promoted
   family resolved to four attractors: prime-index PNT straightening
   (`p_k ~ k log k`, holdout 0.994 — and known for a century), Mertens/μ
   display transforms, cumulative-gap/Chebyshev telescopes, and dyadic
   smoothing. Cross-domain imports (stat-mech, KAM, topology, p-adic,
   category magnitude, spectral graphs) produced 0 promotions in 5
   dedicated sub-cycles; whitened and order-adjacent variants died to
   shuffle controls. STATUS: CLOSED-NO-SURVIVOR is **final at this scale**.
2. **The playground graveyard** (KNOWLEDGE.md, 2026-06-13→15): ~60
   preregistered residual candidates — elliptic family moments,
   Palm/hazard gap laws, Walsh spectra, martingales, transport and
   curl statistics — all GRAVEYARD or KNOWN-MATH calibration. Two
   OPEN-LEADs remain (CA/XA recovery grammar and debt bridge), both
   explicitly "NOT A CRITICAL LINE": finite catalogs, not laws.
3. **The star conjecture and its refutation**
   (`logs/two-universes-artifacts/mobius-gap-expert-pack.md` and the
   2026-06-13 CORRECTION): the F_3[t] Möbius-parity gap bias is real —
   r ≈ 0.022 plateau across degrees 14–17, z = 56.2 at degree 17 on 6.64M
   scrubbed samples, surviving leakage, cyclic, composite, squarefree, and
   holdout controls. Its cross-q `A/q²` generalization was **refuted by
   independent audit**: adjacent-degree signs flip in F_5 and F_7, and the
   law's own predicted effects sit at or below the 1/√N noise floor at
   every computable field but F_3 — the confirmations were noise. The
   council notes with approval that the audit machinery caught this; the
   council notes with concern that the conjecture was *designed* untestable
   (no power analysis at design time), and that its coordinate
   (lexicographic ordering) is non-canonical, which blocked both mechanism
   and transport.
4. **The two-universes build** (`src/core/ffield.js`, calibration
   artifacts): exact-formula agreement to degree 24 (q=2) / 15 (q=3); the
   Chowla decay and twin-density calibrations verified against the theorem
   side; the shared-law finding (homogeneous gap anti-correlation in both
   universes) is real but LO-S-adjacent, hence not novel. The build is an
   asset; its first hunting style (order-sensitive gap laws) is the
   liability.
5. **edge.md (the frontier file)**: referee-checked June 16. It already
   contains the corrected Chowla targets (μ not λ; the shifted bilinear
   cut-norm engine; the false unshifted Type-II form and its
   counterexample; the Y_n point-count identity; the `Λ(n)μ(n+h)`
   parity-breaker) and eight synthesis angles. The council verified by
   search: **none of its computational program has been executed** — no
   Gowers norm, no cut norm, no block entropy, no spectral measure, no ML
   probe appears anywhere in KNOWLEDGE.md.
6. **Instrument health**: 197/197 tests pass on a fresh clone. The 5-bar
   gauntlet, Cramér twin, holdout split, and the independent-audit habit
   are battle-proven — they killed ~2,000 false positives including the
   program's own favorite.
7. **Feasibility pilot, run for this council**
   (`scripts/council2-pilot.mjs`, `logs/council2-artifacts/pilot-10000000.md`;
   calibration only, not a finding): the λ-bitstream battery costs ~2s per
   sequence at N=10^7. Unweighted two-point λ correlations sit at the
   noise floor (1/√N ≈ 3.2×10⁻⁴) — the famous −0.04 figures live in the
   log-weighted statistic, so weighting choices are load-bearing. LZ78
   shows no compressibility edge. Block-pattern χ² drifts upward at
   k = 10–12 (z ≈ 2.9–3.1 where both nulls sit at 0 ± 1) — under-powered,
   look-elsewhere-exposed, and therefore a *preregistered target* for
   Sprint P1, not a claim. The pilot also demonstrates the correct
   second null: a random completely multiplicative ±1 function (RCM),
   which carries every constraint forced by multiplicativity alone.

## Part II — The diagnosis, accepted by the chair

**D1. The hunt looked where the light is, and the light is the PNT.**
Council 1's funnel verdict predicted that RH-grade truth about summatory
prime residuals IS the zeros; the graveyard is that verdict confirmed
~2,000 times empirically. The additive/pointwise/summatory space at
N ≤ 10^7–10^8 is fully explained by PNT + Hardy–Littlewood + wheel
geometry + the known biases. **The residual there is empty.** This is a
real, hard-won negative result; the council declares it settled and
fences it off.

**D2. The coordinate sin.** The one ⭐⭐ was found in a non-canonical
coordinate (lexicographic encoding order). Non-canonical coordinates
invite Kurlberg–Rosenzweig-type short-interval effects that masquerade as
laws, block any mechanism, and cap validation power. Rule: statistics
must be coordinate-free, or carry a written canonicity argument, before
compute is spent.

**D3. The two discovery classes of the last decade are exactly the two
the program never entered.** (i) Parity-protected multiplicative
statistics: Chowla/Sarnak territory, where the sieve's blindness is a
*proven* wall (so structure there cannot have been quietly explained
already, and any replicable deviation matters by construction). The plan
exists (edge.md) and was never run. (ii) Labeled-family statistics:
murmurations needed (object, invariant) pairs; the repo's reproduction
failed *for the right reason* — the instrument has no labeled-data
ingestion. LO-S 2016 and murmurations 2022 are the entire recent base
rate of outsider-plus-computation discoveries, and both live in these two
classes.

**D4. Power discipline was missing at design time.** The cross-q law
died because its own predictions were below the reachable noise floor —
a fact computable *before* any run. Power analysis joins preregistration
as a hard gate.

**D5. A breakthrough cannot be scheduled — but probability mass can be
moved.** The council's job is to maximize
(model-incomplete) × (under-computed) × (clean null) × (adequate power) ×
(novelty-checked-before-compute). The graveyard zeroed the first factor
across the entire summatory space; the product is now maximized only in
the parity and labeled-family territories.

## Part III — Routes weighed this time

| Route | Experiment-now | Track record | Ceiling | Access | DA's expected value |
|---|---|---|---|---|---|
| P. Parity battery — interrogate multiplicative randomness (λ, μ) in both universes | 9 | 7 | 9 | 9 | 6 |
| F. Labeled families — build the murmuration-class instrument | 7 | 10 | 8 | 7 | 7 |
| G. Canonicalize the F_3 anomaly (window/point-count recast, derive-or-kill) | 9 | 5 | 7 | 9 | 5 |
| W. More wildcard/summatory hunting | 10 | 0 here (1,894:0) | 2 | 10 | 0 |
| U. More order-sensitive two-universe gap laws | 8 | 1 here (1 find, coordinate-bound) | 3 | 8 | 1 |

Key facts per route (verified in-repo or in edge.md):
- **P**: the parity barrier is proven (sieves cannot see Ω-parity), so
  the territory is *guaranteed* model-incomplete; natural-density Chowla
  is open for every k ≥ 2; the objects are corrected and referee-checked
  in edge.md; the pilot proves the battery costs seconds; the
  function-field side provides theorem-grade ground truth
  (Sawin–Shusterman at large odd q) and an exact geometric mechanism to
  measure (Y_n point counts). One flagged pilot statistic (k-block χ²
  drift) is already waiting as a preregistered target.
- **F**: murmurations were found by an undergraduate with plots and
  labels, then partly proven (Zubrilina 2023; Dirichlet-character analogs
  followed); it is the only class where instrument-first work has a
  recent, repeated, peer-validated hit record. Labels are computable
  in-repo with no network: Dirichlet families (parity, conductor —
  exact), quadratic-twist elliptic families (a_p(E_d) = χ_d(p)·a_p(E),
  root numbers by Kronecker symbols), and function-field elliptic
  families later (exact L-polynomials by point counting).
- **G**: the F_3 effect is the workshop's only surviving unexplained
  object. Its honest fate is one of three: (a) the window recast holds →
  the object becomes a *shifted prime–Möbius correlation over F_3[t]* —
  the function-field shadow of the parity-breaking estimate
  `Σ Λ(n)μ(n+h) = o(x)` (edge.md, Murty–Vatwani), i.e., it joins Route P
  as its theorem-side anchor; (b) a small-degree exhaustive computation
  plus the Pellet/discriminant-character identity yields a mechanism →
  KNOWN-MATH closure or a provable statement; (c) the window recast dies
  → the effect was lexicographic-interval bookkeeping → CLOSED-ARTIFACT.
  All three outcomes are wins; none is a breakthrough by itself.
- **W, U**: rejected as programs. W survives only as a regression
  gauntlet for new sources; U's build survives inside P and G.

## Part IV — DECISION: the Parity Bridge program

Primary bet (≈50% of compute): **Route P — run the edge.md battery for
real, on λ and μ, over ℤ and F_q[t] simultaneously, against Bernoulli,
RCM, and Cramér nulls, with power lines predeclared.** The signature
object is the same as Council 1's — measured deviation between universes
at matched statistics — but at the right altitude: *distributional and
correlation statistics of multiplicative parity*, not summatory walks and
not gap coordinates.

Second bet (≈30%): **Route F — build labeled-family ingestion and enter
the murmuration class properly**: replicate a proven murmuration as
validation, then hunt where nobody has computed — new invariant pairs,
new families, both universes.

Third bet (≈20%): **Route G — derive or kill the F_3 anomaly in
canonical coordinates.** If it survives the recast, it merges into P as
the theorem-side anchor of the shifted Λμ family; either way the books
close on the workshop's one open ⭐⭐ thread.

### The fence (hard bans, from the graveyard)

1. **No new pointwise/summatory/chip-stack spec hunting at N ≤ 10^8.**
   CLOSED-NO-SURVIVOR is final at this scale. `hunt.mjs` is retained only
   as a regression gauntlet when a genuinely new source type ships.
2. **No order-dependent statistic without a written canonicity note**
   (what the statistic means under reordering, and what canonical object
   it estimates).
3. **No preregistration without a power line**: the minimum detectable
   effect at the planned N and seed count, and the prediction's expected
   size. If predicted < detectable, the design is rejected (the cross-q
   lesson).
4. **Independent adversarial audit before any ⭐⭐** — a fresh session
   whose brief is to break the claim (this caught cross-q; make it
   structural, not lucky).
5. **Novelty check before compute**: the "nearest catalog" paragraph
   (papers, named theorems) is written *first*; if the object is within
   an epsilon of a named result, redesign before running.

### Instrument upgrades required (from the artifact review)

- **I1 — labeled-family ingestion**: a source type of
  (object id, invariant labels, a_p / value table); a family-average
  plane with invariant-split overlays; a label-shuffle null and
  conductor-window holdout built in. (This is the missing organ that
  cost the murmuration reproduction.)
- **I2 — RCM null source**: the random completely multiplicative ±1
  function beside Cramér in the registry (pilot code exists; promote to
  `src/core` with tests).
- **I3 — bitstream tooling**: block statistics, entropy-rate estimators,
  Gowers U²/U³ via FFT, spectral measure, and the shifted bilinear
  cut-norm probe from edge.md, each with seed batteries.
- **I4 — power helper**: given a statistic, N, and seed count, report
  the minimum detectable effect; wire it into the preregistration
  template so bans 3 is mechanical.

## Part V — Success, recalibrated again

S1 (shared law in both universes), S2 (precisely characterized
divergence), S3 (LO-S-class phenomenon stated as a precise conjecture
with an evidence pack) all stand. Two additions:

- **S4 — calibration-grade negative result**: if the full parity battery
  is null at N = 10^8 with uniform shifts, the deliverable is the
  strongest *empirical* Chowla/Sarnak evidence pack at computable scale —
  bounded, citable, and new (nobody has published the uniform-shift
  h-profile at that scale with matched multiplicative nulls). A null
  program is a result, not a failure.
- **The breakthrough bar is the LO-S standard**: a precise conjecture +
  reproducible evidence pack that a named expert community would act on
  (as LO-S's bias and the murmurations were acted on). "Absolutely
  incredible" is earned by replication and adoption, not by z-scores.

The council repeats Council 1's honesty clause with new force: proof of
RH-grade statements over ℤ remains out of scope by base rate. What is in
scope — and now aimed at the only territories where the graveyard permits
it — is finding the next LO-S-class fact about the primes.

## Part VI — First sprints (gated; prompts shipped alongside this report)

1. **Sprint P1 — the integer parity battery** (`prompts/parity-battery.md`).
   λ and μ bitstreams at N = 10^7 → 10^8: two/three-point correlations
   (unweighted AND log-weighted), k-block χ²/entropy with the pilot's
   k = 10–12 drift as a preregistered hypothesis, Gowers U²/U³, spectral
   measure, LZ/entropy rate, an ML predictability probe with strict
   holdout, and the shifted `Λ(n)μ(n+h)` h-profile. Nulls: Bernoulli +
   RCM + Cramér-hybrid. EXIT: every statistic verdicted against both
   nulls at two scales with power lines; survivors → independent audit;
   full null → the S4 evidence pack.
2. **Sprint P2 — the theorem-side mirror**: the same battery over F_q[t]
   (q = 3 primary, q = 2 contrast), plus the Y_n point-count series
   (Keating–Rudnick identity) as the measured geometric mechanism.
   Deviations between the universes at matched battery statistics are
   the S2 objects.
3. **Sprint F1 — labeled ingestion + validation replication**
   (`prompts/labeled-families.md`). Build I1; replicate the
   Dirichlet-character murmuration (proven case) as the pipeline
   validation; then quadratic-twist families with Kronecker-symbol root
   numbers.
4. **Sprint F2 — the family hunt**: cross-invariant murmuration scans
   over families and invariants absent from the literature, in both
   universes, with label-shuffle nulls and conductor-window holdouts.
5. **Sprint G1 — derive or kill** (`prompts/f3-canonical.md`). The
   window recast (short-interval irreducible counts vs μ at fixed
   shift), the Pellet/discriminant-character direct test, exhaustive
   small-degree mechanism search, and a power-gated transport test.
   Every outcome closes the thread or promotes it into P2.

Sequencing: P1 and F1 start immediately and in parallel; P2 after P1's
first gate; F2 after F1's validation replication passes; G1 whenever a
session prefers it (it is self-contained). The research-loop discipline
(prompts/research-loop.md) governs inside every sprint; this report and
the fence govern between sprints.

## Part VII — What would prove this council wrong

- If Sprint P1's battery is null AND Sprint P2 shows the function-field
  side equally featureless at matched statistics, then parity randomness
  is empirically total at computable scale, and the S4 pack plus a
  redirect of all compute to Route F is the correct response.
- If Sprint F2 finds nothing across ≥ 3 family types and ≥ 10 invariant
  pairs, the murmuration class is thinner than its track record suggests;
  the council should reconvene rather than grind.
- If the same four attractors (PNT, Mertens, telescopes, dyadic) reappear
  *inside* the new tracks' survivors, the diagnosis D1 was incomplete and
  the fence must be redrawn tighter.

The council adjourns. The graveyard was not waste — it is the map of
where structure is not, drawn at a precision nobody else has bothered to
reach. The program above spends it.

---

## AMENDMENT A (July 2026) — the critical-line re-evaluation

The workshop restated its ambition: a critical line that is NOT a
reformulation of ζ's. The council re-derived the search space from
structure rather than defending its first cut, and re-graded its own
critical-line-adjacent candidates:

- λ/μ walk spectra: **partial reformulation.** The walks oscillate at
  the SAME frequencies γ_k (explicit formula for M(x)/L(x)), with
  1/ζ′(ρ)-type amplitudes. The amplitude ladder is new information
  (simplicity/LI-adjacent) but the line is ζ's. Demoted to a labeled
  calibration row.
- Montgomery–Soundararajan short-interval variance: structure *around*
  the known line (pair-correlation physics), not a new line. Secondary
  row.
- "Third-exponent dashboard": right spirit, but a scan, not a target —
  and the graveyard's core lesson is that scans die.

**The frame**: a critical line is the spectral signature of an
unexplained cancellation. Do not hunt lines; enumerate *unowned
cancellations* and read their spectra. A search location is "right" iff
it passes all five filters: (1) outside the linear-functional funnel;
(2) hosts a conjectured cancellation with no known mechanism; (3) has a
theorem-grade twin where the analogous spectrum provably exists (so the
instrument can be validated on a known answer); (4) spectral resolution
adequate at reachable N (the June machinery resolved Δγ ≈ 0.68 over
10^4..10^8); (5) barrier-protected novelty.

**Exactly one in-reach object passes all five: the binary Chowla sum**
`C_h(x) = Σ_{n≤x} μ(n)μ(n+h)`. Bilinear in μ (outside the funnel);
independent of RH in both directions (cannot be a reformulation);
expected `x^{1/2+o(1)}` cancellation unproven and owned by NO spectral
object over ℤ (this absence is the parity barrier); over F_q[t] the same
sum equals `|Y_n(F_q)| − q^n` (Keating–Rudnick, edge.md) whose
square-root cancellation IS a proven second critical line — the Weil
circle for the Frobenius eigenvalues of the Y_n family, distinct from
the spectral family behind ζ_q. The integer counterpart of that
spectrum is missing from mathematics; hunting it is a non-reformulation
critical-line search by construction. Replicable discrete frequencies
in the integer C_h walk would be the first empirical sighting of an
unknown arithmetic spectrum; a clean null is the θ₂(h) measurement and
the strongest spectral calibration of Chowla sums to date.

**Decision**: Sprint P1 is restructured as **P1-CL — the
missing-spectrum hunt** (prompts/parity-battery.md rewritten): Row 0 is
a hard validation gate (recover the known Y_n line from exact F_q[t]
data before any ℤ claim), Row 1 is the integer C_h spectral hunt under
colored-noise peak discipline, and the original battery rows become the
time-domain flank plus labeled calibration rows. Landing discipline
unchanged and mandatory: preregistered statement template, ≥10-seed
colored-noise nulls, octave/shift stability, adversarial audit, LO-S
adoption standard. The council reminds the workshop that certainty of
outcome is not purchasable; this design purchases certainty of
*meaning* — zero rediscovery risk in the target space, and a null that
is still a result.

*Execution note (2026-07-02):* P1-CL ran end to end — Row 0 gate PASS,
integer hunt NO SURVIVOR at 10^8, known-line calibration PASS
(amplitude ladder verified), M–S variance slope 0.998 vs flat Cramér,
pilot H1 refuted. See `logs/2026-07-02-missing-spectrum.md` and the
three 2026-07-02 KNOWLEDGE entries. **COUNCIL3.md** now formalizes the
follow-on primary track (Track Q, quantum probability).
