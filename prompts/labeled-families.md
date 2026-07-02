# GOAL: Labeled Families — build the murmuration-class instrument, validate, hunt

Read COUNCIL2.md (strategy, fence, upgrade I1), edge.md §7 (murmurations
— the family frontier), MACHINE_HOW_TO_USE.md, KNOWLEDGE.md. Log:
`logs/<today>-labeled-families.md`. F2 does not start until F1's
validation replication passes. The COUNCIL2 fence applies: nearest-catalog
paragraph and power line BEFORE compute.

## Why

Murmurations (He–Lee–Oliver–Pozdnyakov 2022; Zubrilina 2023) are the
proof that this workshop's exact habitat — computation + plots + fresh
eyes — still finds phenomena experts then prove. The class *requires*
labeled data: the signal lives in an invariant split (rank parity) and is
invisible in the bare average — which is precisely why the June
murmuration reproduction failed here (KNOWLEDGE: "failed for the right
reason"). The instrument is missing the organ; this sprint builds it.
All labels below are computable in-repo with no network dependency.

## SPRINT F1 — the organ, then the validation replication

1. **Ingestion (COUNCIL2 upgrade I1)**: a labeled-family source type —
   records of (object id, invariant labels, indexed value table such as
   a_p or χ(p)) — plus a family-average plane: x = p (or p/Q), y =
   family-mean of the value, one curve per label class. Built-in nulls:
   **label-shuffle** (permute labels among family members — structure
   must die) and **conductor-window holdout** (disjoint Q-windows —
   structure must persist). Tests for both.
2. **Validation target — Dirichlet characters** (labels exact, generation
   trivial): family = primitive characters mod q, q ∈ [Q, 2Q]; labels =
   parity χ(−1) = ±1, order, conductor. Statistic: family averages of
   character values at primes, split by parity, as a function of p/Q.
   FIRST confirm the current literature baseline (murmurations of
   Dirichlet characters — Lee–Oliver–Pozdnyakov-adjacent papers; write
   the nearest-catalog paragraph with the precise statement found).
   Replicating the known oscillation validates the pipeline end to end:
   the effect must appear, die under label-shuffle, and persist across
   Q-windows.
3. **Second family — quadratic twists** E_d of a fixed small-conductor
   curve E (e.g. 11a1): a_p(E) by direct point counting p ≤ 10^5, then
   a_p(E_d) = χ_d(p)·a_p(E). Labels: root number via the classical twist
   formula (w(E_d) = χ_d(−N_E)·w(E) for fundamental d coprime to 2N_E —
   verify the formula's applicability conditions and sanity-check signs
   against a few published twist ranks before trusting it), plus sign(d)
   and conductor. Reproduce the murmuration split by root number in this
   family — this is the elliptic murmuration in its cheapest honest form.

EXIT F1: ingestion + plane + nulls merged with tests; both replications
logged with shots, label-shuffle kill, and holdout persistence; KNOWLEDGE
entries (KNOWN-MATH calibration — these are reproductions, not
discoveries). Commit.

## SPRINT F2 — the hunt (where nobody has computed)

The discovery surface is the matrix (family type) × (invariant) ×
(statistic), minus the cells the literature already owns. Predeclare a
battery of ≥ 10 uncomputed cells before running any; for each cell write
the nearest-catalog line and the power line (family size needed for the
seed-sd at the planned window). Candidate cells:

- Characters: split by ORDER (not parity); Gauss-sum angle as a label;
  murmuration of χ(p)·χ(p+2)-type paired values (family-level twin
  statistic).
- Twists: split by sign(d) × w jointly; a_2/a_3 small-prime fingerprints
  as labels against large-p averages (cross-p murmurations); local root
  numbers as separate labels.
- Function-field families (exact-label territory, none of it computed):
  hyperelliptic y² = f(t) over F_q with L-polynomial coefficients as
  labels (exact by point counting); the same murmuration statistics where
  every label is a theorem-grade quantity and family size is unbounded.
  This is the two-universes program at the family level: any murmuration
  found here can be chased toward proof (Weil/monodromy machinery
  exists), and ℤ-vs-F_q[t] murmuration divergence is an S2 object.

Scoring discipline per cell: family-mean curves split by label; effect
score = split separation ÷ label-shuffle sd; persistence across disjoint
conductor/degree windows; verdict NULL / KNOWN / SURVIVOR (→ independent
adversarial audit before ⭐). Stop the sprint at the first SURVIVOR that
passes audit (write the precise conjecture + evidence pack — the S3
deliverable), or after the predeclared battery is exhausted (ranked
graveyard + the two best "almost" cells as next-sprint input).

EXIT F2: battery verdicts in KNOWLEDGE with CONNECTION lines; either an
S3 evidence pack or the ranked graveyard. Commit.

Honesty regime as always: predeclared everything, label-shuffle + holdout
mandatory per claim, no all-x claims from finite windows, STUCK PACK
after two stuck sessions.
