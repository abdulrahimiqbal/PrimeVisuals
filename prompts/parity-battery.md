# GOAL: P1-CL, the missing-spectrum hunt — a critical line that cannot be ζ's

Read COUNCIL2.md INCLUDING AMENDMENT A (the frame and the fence), edge.md
§"Corrected target" (the objects; the Keating–Rudnick identity),
`logs/2026-06-12-zero-spectrum-hunt.md` + `scripts/spectrum.mjs` (the
proven spectral machinery), KNOWLEDGE.md. Log:
`logs/<today>-missing-spectrum.md`. Rows run in order; Row 0 is a hard
gate. The fence applies: power line and nearest-catalog paragraph BEFORE
compute; no order-dependent statistic without a canonicity note.

## The object and why it cannot be a rediscovery

`C_h(x) = Σ_{n≤x} μ(n)μ(n+h)`. Bilinear in μ — outside the
linear-functional funnel, so its fluctuations are NOT made of ζ's zeros;
RH neither implies nor follows from its expected `x^{1/2+o(1)}`
cancellation, and no spectral object over ℤ owns that cancellation (the
parity barrier IS this absence). Over F_q[t] the same sum is a point
count, `Σ_{deg f=n} μ(f)μ(f+1) = |Y_n(F_q)| − q^n`, whose square-root
cancellation is a PROVEN second critical line: Frobenius eigenvalues of
the Y_n family on the Weil circle `|α| = q^{n/2}` — a different spectral
family from the one behind ζ_q. The integer counterpart of that spectrum
is missing from mathematics. Discrete, replicable frequencies in the
integer C_h walk = the first empirical sighting of an unknown arithmetic
spectrum. A clean null = the θ₂(h) measurement + the strongest spectral
calibration of Chowla sums to date. Both outcomes are results; only one
is a breakthrough; do not blur them.

## Nulls and scoring (all rows)

- **Bernoulli walks** (iid ±1 at squarefree positions) and **RCM walks**
  (random completely multiplicative ±1, restricted to squarefree with
  |μ| handled as its own layer): ≥ 10 seeds each. Cumulative walks have
  COLORED spectra (June lesson) — never compare to white noise.
- Peak score = height ÷ local spectral median, calibrated on the seed
  battery (the established statistic from the zero-spectrum hunt).
- A candidate frequency survives only if: stable across ≥ 2 disjoint
  octaves of the log-range; present at matched frequency across ≥ 2
  shifts h (or with a declared h-dependence law); absent at that score in
  every seed; and predeclared score threshold met.
- **Power line first**: spectral resolution Δγ ≈ 2π/(log-range). The
  June run resolved Δγ ≈ 0.68 over x ∈ [10^4, 10^8]; 10^9 extends the
  window to Δγ ≈ 0.55. Amplitude sensitivity from the seed battery. If a
  target's expected amplitude is below the floor, redesign before
  running.

## ROW 0 — validation gate on the theorem side (must pass first)

Over F_q[t], the second-line spectrum provably exists; the instrument
must see it there before any ℤ claim means anything.
1. Compute the exact sequence `a_n = Σ_{deg f=n} μ(f)μ(f+1)` for q=2
   (n ≤ 24) and q=3 (n ≤ 15) — the data path exists
   (`src/core/ffield.js`; the Chowla calibration entry).
2. Verify square-root scale: `|a_n| / q^{n/2}` bounded (the Weil line).
3. Extract dominant Frobenius modes: Prony/dominant-mode fit of a_n as
   `−Σ c_i α_i^n`; test the fitted `|α_i|` sit on (not inside) the
   `q^{1/2}`-circle. With ≤ 24 exact terms this may be under-resolved —
   "under-resolved but scale-verified" is a valid PASS verdict; a fit
   placing dominant mass OFF the circle is a FAIL (instrument bug).
EXIT gate: the pipeline demonstrably detects the known second line (scale
+ whatever mode structure resolution permits) on exact data. Log, commit.

## ROW 1 — the hunt: the integer C_h spectrum

1. Sieve μ segmented to N = 10^8 (first pass), 10^9 (survivors and final
   θ₂ numbers). Build walks `C_h(x)` for h ∈ {1..8} and two spot checks
   at large h (declare them).
2. **θ₂(h)**: fit the cancellation exponent of `C_h` per h with proper
   main-term discipline (research-loop rules); report against the
   `1/2 + o(1)` expectation. This number is a deliverable regardless of
   spectra.
3. **The spectrum**: Hann-windowed DFT of `C_h(e^u)/e^{u/2}` on a uniform
   log grid (mirror `scripts/spectrum.mjs`), scored per the null/scoring
   block. Deliverable: the peak table with scores, and the survivor list
   (expected empty; that expectation is written down here so a survivor
   cannot be quietly normalized).
4. **Statement template (pre-written, fill on survival)**: "There exist
   γ'₁ < γ'₂ < … and amplitudes c_k such that
   C_h(x) = √x·Σ_k c_k cos(γ'_k log x + φ_k) + o(√x) over [X₁, X₂],
   stable in h per <law>, seed-null score <s>, octave stability <table>."
   Any survivor goes to independent adversarial audit before a ⭐ and
   before any external communication.

## ROW 2 — labeled calibration: the known line's amplitude ladder

The μ (Mertens) walk spectrum carries ζ's frequencies γ_k with
1/ζ′(ρ)-type amplitudes — a REFORMULATION-ADJACENT row, labeled as such.
Measure the first ~20 amplitude ratios against the explicit-formula
prediction (mirror of the June ψ run, which matched 2/|ρ| to ~3%).
Purpose: (a) end-to-end instrument check on a live walk, (b) the
amplitude ladder itself is simplicity/LI-adjacent data. Any anomaly here
is interesting but is NOT the missing spectrum — file it separately.

## ROW 3 — beyond-line physics: short-interval variance

Montgomery–Soundararajan variance of ψ in windows H over [X, 2X], with
the conjectured main term and log-corrections overlaid, through the Maier
regime (edge.md conjecture 6; the model is provably broken there — the
right model is the open part). Cramér twins mandatory. Deliverable: the
variance-vs-H curve with prediction bands; deviations connect to
pair-correlation physics, labeled as around-the-line structure, not a new
line.

## ROW 4 — time-domain flank (the original battery, unchanged scope)

Two/three/four-point profiles (unweighted AND log-weighted), k-block
χ²/entropy with the pilot's PREREGISTERED H1 (the k = 10–12 drift at
z ≈ 3 in `logs/council2-artifacts/pilot-10000000.md`) decided at 10^8
with ≥ 20 Bernoulli + ≥ 10 RCM seeds (if real, it must survive
subtraction of pair correlations to count), Gowers U²/U³ via FFT,
entropy-rate extrapolation, the ML predictability probe with strict range
holdout, and the parity-breaker profile `avg_{p≤N} μ(p+h)` against the
H–L singular-series shape. Same verdict discipline as before: NULL /
KNOWN (with citation) / SURVIVOR (→ audit).

## Visual deliverables (first-class, not decoration)

1. The C_h spectrum panel: real walk spectrum over the RCM/Bernoulli
   colored-noise band, per h.
2. The critical-exponent dashboard: θ = 1/2 (zeros family), θ ≈ 1/4
   (divisor family), θ₂(h) (this hunt) with error bars — arithmetic's
   known critical exponents and the empty slot a third would fill.
3. The M–S variance curve with prediction bands and the Maier regime
   marked.

EXIT P1-CL: Row 0 gate verdict; θ₂(h) table; the peak/survivor table (or
the explicit empty-survivor statement); Rows 2–4 verdicted NULL / KNOWN /
SURVIVOR with power lines; the three visuals shot and linked; KNOWLEDGE
entries with universe labels and CONNECTION lines (zero-spectrum hunt,
Chowla calibration, the pilot). Commit at every row boundary.

## SPRINT P2 — the theorem-side mirror (after P1-CL's gate + Row 1)

As before: the matched battery over F_q[t] with canonical additive-shift
statistics; the C(g, n) ladder vs the integer h-profile at n ↔ log_q N;
extend Row 0's Y_n analysis to the full g-ladder; block/Gowers analogs
over shift-orbits; the DIVERGENCE table (statistic | ℤ | F_3[t] | F_2[t]
| nulls | verdict ∈ {SHARED-LAW, DIVERGENCE, noise}) as the S1/S2
objects. EXIT: table logged with universe labels and CONNECTION lines;
best S1 and S2 candidates stated precisely; commit.

Honesty regime as always: predeclared nulls, thresholds, and shift lists;
seed batteries; range doubling; disjoint holdouts; ranked graveyard is a
valid outcome; STUCK PACK after two stuck sessions. Certainty of outcome
is not available; certainty of meaning is the design.
