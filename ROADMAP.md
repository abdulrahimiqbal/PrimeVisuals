# PrimeVisuals Roadmap

North star: move math variables around and land on a visualization that
reveals deeper structure in the primes — including structure that current
mathematics does not yet explain.

## Principles

1. **Encode the known, look at residuals.** Raw pictures of primes mostly
   re-display known theory. Subtract the best existing prediction and stare
   at what's left; whatever survives is by construction unexplained.
2. **Statistics over families beat single pictures.** Pair correlation, BSD,
   and murmurations were all found in derived statistics averaged over
   families — not in raw plots of single objects.
3. **Persistence and holdout before excitement.** Structure must strengthen
   as N grows, and must survive on ranges of primes that were not used to
   find it. Scanning many views guarantees fake patterns; the discipline is
   built into the tool, not left to willpower.
4. **Record everything reproducibly.** An anomaly that can't be re-rendered
   from a link is a memory, not a discovery.

## Phase 0 — Foundation (fast and trustworthy)

- [ ] Split `Prime Visuals.jsx` (~2,200 lines) into modules: `sources/`,
      `planes/`, `lenses/`, `lab/`, `render/`. The registry design makes
      this mechanical.
- [ ] Unit tests for the number-theory kernel: `sieve`, `mobiusUpTo`,
      `ulamXY`, `zetaHalf` against known values.
- [ ] Move data generation into a Web Worker with incremental caching so
      sliders never block the UI.
- [ ] WebGL point renderer: from ~10^5 to ~10^7 dots.
- [ ] Replace the 29 hardcoded zeros with Odlyzko's tables (first 100k
      zeros); Riemann–Siegel formula for ζ at larger t.
- [ ] URL-encoded view state so any view is a shareable, reproducible link.

## Phase 1 — See known structure properly

- [ ] **Explicit formula view**: ψ(x) ≈ x − Σ x^ρ/ρ with a slider for the
      number of zeros included — watch the prime staircase assemble out of
      zero waves. The bridge between the tool's two halves.
- [ ] α auto-sweep (play button) and a live continued-fraction readout of
      α/2π, so spoke lock-in is *explained* the moment it is seen.
- [ ] Drag-on-canvas parameter control.
- [ ] Stats side panel per view: gap histogram vs. predicted distribution,
      residue counts vs. equidistribution, zero spacings vs. GUE.
- [ ] Lab: sum-over-range node (Σ over n ≤ N — enables Dirichlet series and
      exponential sums like Σ exp(2πi·α·p)) and a primes-only domain.

## Phase 2 — Hunt unexplained structure (the discovery loop)

- [ ] **Residual mode**: every source carries its best-known prediction
      (π(x) → Li(x); gaps → log p and Hardy–Littlewood; residue classes →
      1/φ(q); zero spacings → GUE). A global toggle renders the deviation
      instead of the raw data.
- [ ] **Null-model twin**: a "fake primes" generator (Cramér random model
      with small-prime residue correction) rendered side by side or as a
      difference image with the real primes. Structure visible in both is
      generic; structure only on the real side is arithmetic.
- [ ] **Family axis**: sweep a parameter (α, modulus q, the c in n²+n+c)
      and stack the results as a heatmap, one row per family member.
      Coherent structure across a family is visible in a stacked image and
      invisible when scrubbing frames by hand.
- [ ] **Persistence test**: one keystroke renders the current statistic at
      N, 2N, 4N, 8N; optional log-log slope fit on the residual.
- [ ] **Holdout test**: one click re-renders a candidate pattern on the
      next, unseen range of primes.

## Phase 3 — Automated anomaly scanning (when nobody knows where to look)

The user should not need to know where anomalies are. The tool surveys;
the human triages.

- [ ] **Statistic battery**: a fixed set of cheap statistics computed for
      any view (residue distribution, gap autocorrelation, Fourier spectrum
      of the indicator, spacing distribution, drift of cumulative walks),
      each with its null expectation.
- [ ] **Surprise score + leaderboard**: background workers sweep the
      configuration space (source × plane × parameter grid), score each
      view by deviation from null, and surface a ranked list of the most
      surprising views as clickable links.
- [ ] **Scan/score split**: the scanner *finds* candidates on one range of
      primes and *scores* them on a disjoint range, so multiple-comparison
      false positives are filtered automatically rather than by vigilance.
- [ ] **Spectral scan**: peak detection on exponential sums over primes,
      with peaks predicted by residue effects subtracted; leftover peaks
      are flagged frequencies.
- [ ] **Anomaly notebook**: one click snapshots the full view state (URL),
      the statistic, and its surprise score; exports the underlying
      sequence for an OEIS lookup and as CSV/Python for follow-up.

## Phase 4 — Formalization bridge (Lean)

Lean proves; it does not discover. It enters *after* an anomaly survives
Phases 2–3 and becomes a candidate conjecture — but the bridge is designed
now so nothing is lost in translation.

- [ ] **Conjecture template**: every notebook entry gets a precise-statement
      field — quantifiers, ranges, error terms — because "spokes appear near
      rational α/2π" is a picture, while a bounded discrepancy statement is
      a conjecture.
- [ ] **Lean skeleton export**: translate the template into a Lean 4
      statement stub using mathlib vocabulary (`Nat.Prime`, `ZMod`,
      `Nat.ArithmeticFunction`, …). An unproved but *stated* conjecture is
      unambiguous, searchable against mathlib, and the lingua franca for
      handing to the formal-math community.
- [ ] **Finite certification**: for decidable claims ("holds for all
      n ≤ 10^6"), kernel-checked verification of the computation, as a
      high-assurance backstop to the JS engine.
- [ ] Proof attempts happen outside the tool (experts, AI-for-math
      systems); the tool's deliverable is the crisp formal statement plus
      the reproducible evidence behind it.
