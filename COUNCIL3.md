# COUNCIL REPORT 3 — the quantum-probability formalization: Track Q (July 2026)

Standing on COUNCIL2.md (the fence, S1–S4) and its Amendment A. Occasion:
P1-CL executed 2026-07-02 (`logs/2026-07-02-missing-spectrum.md`) — the
missing-spectrum hunt returned a designed null at 10^8 under a validated
instrument, and the M–S variance row measured the primes' spectral
rigidity (slope 0.998, Cramér flat) with no ζ input. The workshop asked
whether formalizing the quantum-probability direction is the cleaner
path. The council's answer: yes — it is the only remaining direction
where BOTH rival answers are backed by proven modern mathematics, so the
experiment cannot come back empty-handed. This report formalizes it.

## Part I — What is already proven here (the bridgeheads)

1. **Quantum-chaos statistics of the zeros**: Montgomery pair
   correlation / Odlyzko GUE; Bogomolny–Keating arithmetic corrections.
   The 07-02 variance measurement (V/H slope 0.998 vs flat Cramér) is
   this physics observed in raw prime counts in-repo.
2. **Critical multiplicative chaos**: Harper 2020 (Forum of Math, Pi)
   proved that random completely multiplicative ±1 functions exhibit
   better-than-square-root cancellation — E|Σ_{n≤x} f(n)| ≍
   √x/(log log x)^{1/4} — the law of a critically log-correlated field,
   the same field theory that underlies Liouville quantum gravity. Our
   RCM null IS this object; every RCM seed we run samples critical
   chaos.
3. **Log-correlated extremes of ζ**: the Fyodorov–Hiary–Keating
   conjecture, leading + subleading orders proven by
   Arguin–Bourgade–Radziwiłł 2020–23 (already citation-checked in
   COUNCIL.md route A). ζ on short critical-line intervals behaves as a
   log-correlated field — the chaos picture is not an analogy; it is
   theorem-grade on the ζ side.
4. **The zeros model for the Möbius walk**: under RH + simple zeros +
   linear independence (LI), M(x)/√x is distributed as an almost
   periodic sum Σ 2·Re[x^{iγ_k}]/|ρ_k ζ′(ρ_k)| with effectively
   independent phases (Ingham; Rubinstein–Sarnak framework; Ng 2004).
   **The amplitude ladder 1/|ρζ′(ρ)| was measured in-repo on 07-02**
   (window-corrected ratios 0.93–1.00, first seven zeros) — the model's
   ingredients are now empirical, not imported.

## Part II — The question Track Q asks

The real Möbius/Liouville walks sit between two universality classes:

- **Model Z (spectral / quantum-chaos)**: M(x)/√x is an almost periodic
  function of log x — a discrete-spectrum object, rigid, with the
  measured amplitude ladder and (conjecturally) LI-random phases.
- **Model C (chaos / quantum-field)**: μ behaves like a generic
  completely multiplicative ±1 function — a log-correlated continuum
  object with Harper moments and GMC-class extremes.

Asymptotically, Model Z is what RH+LI say μ IS; Model C is what μ would
be if arithmetic imposed nothing beyond multiplicativity. **At finite N
the two make different, simulable, distribution-level predictions, and
nobody has run the three-way comparison (real vs Z-ensemble vs
C-ensemble) at scale.** Where the real walk sits — and where it *moves*
as N grows — is a measurable placement of the primes between quantum
spectral rigidity and quantum field chaos. Every outcome is a result:

- Real ≈ Z, ≠ C: the zeros' rigidity is already statistically visible at
  10^8 in distribution shape — quantify the divergence from generic
  multiplicativity (an S2-class datum about what arithmetic adds).
- Real ≈ C, ≠ Z: the finite-N walk is still in the chaos class — the
  crossover scale to spectral rigidity becomes the object (under-
  computed, expert-interesting).
- Real ≠ both, replicably: the S3-class surprise; adversarial audit and
  the LO-S standard apply.

## Part III — The trap, named before it bites

Every discriminating signature in this territory lives on
log log / log log log scales. Examples the council refuses to chase
naively: Harper's (log log x)^{1/4} moment deficit changes ~1% per decade
of N; the Gonek–Ng extreme-value law for M(x) under Model Z (a
(log log log x)^{5/4}-type law — exact statement to be referee-checked in
Q1) moves slower still. **Growth-rate detection across our 5 accessible
decades is mostly powerless; the fence's power rule is load-bearing
here.** The council therefore fixes the method: discriminate by
DISTRIBUTION SHAPE AT FIXED N against exactly simulated ensembles — both
models are fully simulable in-repo, so shape comparisons (not asymptotic
slopes) carry the statistical power. Any growth-rate claim must first
pass a derived finite-N power line.

## Part IV — DECISION: Track Q, gated

Track Q becomes the primary compute track (~60%), Track F (labeled
families) continues (~30%), Track G (F_3 canonicalization) stays queued
(~10%). The COUNCIL2 fence applies unchanged. Two gated sprints
(prompt: `prompts/quantum-probability.md`):

**Sprint Q1 — derive before measuring (the gate).**
(a) Referee-check the exact statements: Harper's moment law for
Rademacher RCM; the Ng/Gonek extreme-value law under LI (exact iterated
logs and exponents); the FHK/ABR statement. Write the nearest-catalog
paragraphs. (b) Build the two ensembles: Z-ensemble = truncated zero sums
with the MEASURED 07-02 amplitude ladder + independent random phases
(≥100 draws; truncation sensitivity checked against known zero counts);
C-ensemble = ≥100 RCM seeds (sieve exists). (c) Derive finite-N
predictions for the battery in (Q2) from the ensembles themselves and
fix power lines: minimum detectable shape distance at N = 10^8. EXIT: a
predictions table with power lines; no real-data measurement before it
exists. Commit.

**Sprint Q2 — the three-way placement.**
Battery (predeclared per Q1, on windowed M(x)/√x and L(x)/√x over
octaves of [10^4, 10^8..10^9]): (1) distribution density + variance,
skewness, kurtosis per octave; (2) moment ratios E|·|/√(E·²) (Harper's
discriminant); (3) max-over-octave statistics (FHK class); (4)
sign-change / persistence counts; (5) two-scale correlation of the
normalized walk (log-correlation probe: cov of values Δu apart —
discrete-spectrum vs log-correlated predictions differ in shape).
Real walks vs both ensembles with distances scored per the Q1 power
lines; verdicts NULL / Z-side / C-side / NEITHER per statistic;
independent adversarial audit before any ⭐; universe labels and
CONNECTION lines as always. EXIT: the placement table — the first
empirical positioning of the Möbius walk between the two quantum
universality classes — plus the honest write-up either way. Commit.

## Part V — Success and honesty

Deliverable classes: S2 (real-vs-C divergence quantified = what
arithmetic adds beyond multiplicativity), S3 (a replicable NEITHER), S4
(a calibrated "real is statistically inside class X at 10^8" statement
with power lines — citable; nobody has published this placement). The
ceiling, stated plainly: Track Q discriminates models of prime
randomness; it does not prove RH, and a Model-Z violation is not
expected. The realistic prize is the first expert-actionable empirical
placement of μ within the quantum-probability universality classes —
LO-S-standard adoption is the breakthrough bar, as before. The trap
(Part III) is the reason Q1 exists; no Q2 run without Q1's table.

The council adjourns. The physics hunch was right in direction — the
rigidity measured on 07-02 IS quantum statistics in the primes; Track Q
makes the hunch a measurement program with proofs on both flanks.
