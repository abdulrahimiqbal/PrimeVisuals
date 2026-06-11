# PrimeVisuals Roadmap

North star: move math variables around and land on a visualization that
reveals deeper structure in the primes — including structure that current
mathematics does not yet explain.

## Status — June 2026

Phases 0–3 are implemented and tested (82 unit/interaction tests, headless
browser verification). Differences from the original plan:

- Zeros: 267 zeros up to t = 500 are generated in-repo by
  `scripts/genzeros.mjs` (validated against published values to ~1e-4)
  instead of shipping Odlyzko's tables; the Riemann–Siegel formula is
  still open if more height is ever needed.
- Workers: the anomaly scanner runs in a Web Worker; source generation
  remains synchronous (fast at current range caps). WebGL rendering is
  deferred for the same reason.
- Family axis: implemented as the mod-q residue heatmap; an α-sweep
  family heatmap is a natural follow-up.
- Complexity ladder: presets, chips, node canvas, and formula text all
  exist, but chips are a post-transform layer rather than compiling into
  the Lab expression — full one-state/four-views sync is still open.
- Lab engine: primes-only domain and a cumulative-Σ chip shipped; a true
  sum-over-range node (Dirichlet series, exponential sums in Lab) is
  still open.

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
5. **Direct manipulation, layered complexity.** The default gesture is
   dragging a math operation onto the picture and watching it respond.
   Node graphs and formula text exist as deeper views of the same state,
   never as a prerequisite. Complete freedom, nothing you can do breaks
   the canvas.

## Phase 0 — Foundation (fast and trustworthy)

- [x] Split `Prime Visuals.jsx` (~2,200 lines) into modules: `sources/`,
      `planes/`, `lenses/`, `lab/`, `render/`. The registry design makes
      this mechanical.
- [x] Unit tests for the number-theory kernel: `sieve`, `mobiusUpTo`,
      `ulamXY`, `zetaHalf` against known values.
- [ ] Move data generation into a Web Worker with incremental caching so
      sliders never block the UI.
- [ ] WebGL point renderer: from ~10^5 to ~10^7 dots.
- [ ] Replace the 29 hardcoded zeros with Odlyzko's tables (first 100k
      zeros); Riemann–Siegel formula for ζ at larger t.
- [x] URL-encoded view state so any view is a shareable, reproducible link.

## Phase 1 — The playable canvas

The centerpiece. Open the default Riemann-hypothesis scene, then bend the
prime distribution by dragging math operations onto it. The goal is
complete freedom and ease of use without overcomplicating the interface.

- [x] **Default RH scene**: the explicit-formula view — the prime staircase
      ψ(x) with x − Σ x^ρ/ρ overlaid and a slider for how many zeros are
      included, so the staircase visibly assembles out of zero waves. This
      is the object you pick up and start playing with.
- [x] **Transform chips — drag ops onto the picture, not into a graph**:
      drop `log`, `sqrt`, `mod m`, `× a`, `diff`, `Σ` directly onto an
      axis, a curve, or the dot cloud and it applies to that channel. Each
      channel shows its pipeline as a row of chips (`x: n → sqrt → × a`)
      that can be reordered or removed. Node wiring is never required for
      the common case.
- [x] **Animated transitions**: every applied or removed op morphs the
      picture from old positions to new ones, so you *see what the
      operation did* instead of a before/after jump cut.
- [x] **Everything scrubbable**: any constant inside a chip, and the knobs
      `a` and `b`, drag in place. α auto-sweep (play button) with a live
      continued-fraction readout of α/2π, so spoke lock-in explains itself.
- [x] **Freedom that is safe**: undo/redo history; ops compose
      valid-by-construction (every op accepts whatever the previous one
      produces); the canvas never blanks — the last valid picture stays up
      while an edit is in flight.
- [ ] **One state, four views — the complexity ladder**: presets → chip
      rows → node canvas → formula text are progressively disclosed views
      of the same underlying expression. Editing any one updates the
      others; nobody is forced up the ladder to get work done.
- [ ] Engine support for real play: sum-over-range node (Σ over n ≤ N —
      Dirichlet series, exponential sums like Σ exp(2πi·α·p)) and a
      primes-only domain.
- [x] Stats side panel per view: gap histogram vs. predicted distribution,
      residue counts vs. equidistribution, zero spacings vs. GUE.

## Phase 2 — Hunt unexplained structure (the discovery loop)

- [x] **Residual mode**: every source carries its best-known prediction
      (π(x) → Li(x); gaps → log p and Hardy–Littlewood; residue classes →
      1/φ(q); zero spacings → GUE). A global toggle renders the deviation
      instead of the raw data.
- [x] **Null-model twin**: a "fake primes" generator (Cramér random model
      with small-prime residue correction) rendered side by side or as a
      difference image with the real primes. Structure visible in both is
      generic; structure only on the real side is arithmetic.
- [x] **Family axis**: sweep a parameter (α, modulus q, the c in n²+n+c)
      and stack the results as a heatmap, one row per family member.
      Coherent structure across a family is visible in a stacked image and
      invisible when scrubbing frames by hand.
- [x] **Persistence test**: one keystroke renders the current statistic at
      N, 2N, 4N, 8N; optional log-log slope fit on the residual.
- [x] **Holdout test**: one click re-renders a candidate pattern on the
      next, unseen range of primes.

## Phase 3 — Automated anomaly scanning (when nobody knows where to look)

The user should not need to know where anomalies are. The tool surveys;
the human triages.

- [x] **Statistic battery**: a fixed set of cheap statistics computed for
      any view (residue distribution, gap autocorrelation, Fourier spectrum
      of the indicator, spacing distribution, drift of cumulative walks),
      each with its null expectation.
- [x] **Surprise score + leaderboard**: background workers sweep the
      configuration space (source × plane × parameter grid), score each
      view by deviation from null, and surface a ranked list of the most
      surprising views as clickable links.
- [x] **Scan/score split**: the scanner *finds* candidates on one range of
      primes and *scores* them on a disjoint range, so multiple-comparison
      false positives are filtered automatically rather than by vigilance.
- [x] **Spectral scan**: peak detection on exponential sums over primes,
      with peaks predicted by residue effects subtracted; leftover peaks
      are flagged frequencies.
- [x] **Anomaly notebook**: one click snapshots the full view state (URL),
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
