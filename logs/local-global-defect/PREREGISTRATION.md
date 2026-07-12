# Sieve-conditioned interaction defect flow — preregistration

Date frozen: 2026-07-10

Status: `EXPLORATORY CALIBRATION PILOT`, followed by a separately frozen
confirmatory run. Nothing from the pilot may be promoted as a discovery.

## Research question

After exact local divisibility information is supplied, how quickly does the
remaining dependence among prime or irreducible events disappear? Is that
decay law shared by rational primes and prime polynomials, or is there a
stable difference between the two universes?

The campaign tests a new object, the **sieve-conditioned interaction defect
flow** (`SCID`). It deliberately combines the useful remnants of cycles
003–007 without reviving their fitted local-state cells or one-cutoff spectral
scores.

## Fixed object

Let `U` be either the integers or `F_q[t]`. Fix a three-shift constellation
`H_U={h_0,h_1,h_2}` and a nested local-factor filtration `L_r`.

At scale `X`, define the fully locally eligible centers

```text
E_U(r,X) = {a : no local factor in L_r divides a+h for any h in H_U}.
```

For every eligible center, record the three-bit mask

```text
X_H(a) = (1_{a+h_0 prime-like}, 1_{a+h_1 prime-like},
          1_{a+h_2 prime-like}).
```

If `P` is the empirical distribution of these eight masks on a holdout
range, define

```text
TC(P) = H(P_0) + H(P_1) + H(P_2) - H(P)
SCID(P) = TC(P) / (H(P_0) + H(P_1) + H(P_2)).
```

Entropy is base two. `SCID` is zero for independent coordinates, positive
for dependence, invariant under permutations of the three shifts, and does
not depend on a visual coordinate system. The local-information coordinate
is

```text
tau_U(r,X) = -log(|E_U(r,X)| / |I_U(X)|),
```

where `I_U(X)` is the unfiltered center set. The flow is the set of points
`tau -> SCID` as the local filtration deepens.

The integer and function-field axes are matched by `tau`, not by the informal
identification `degree ~= log X`.

## Fixed constellations

The pilot uses three shapes in each universe.

Integers use the linear primorial `W=30`:

```text
Z-A: {0,30,60}
Z-B: {0,30,90}
Z-C: {0,60,90}
```

For `F_q[t]`, let `P_q(t)=product_{a in F_q}(t-a)`. The corresponding
order-free module shapes are

```text
F-A: {0,P_q,tP_q}
F-B: {0,P_q,(t^2+t+1)P_q}
F-C: {0,tP_q,(t^3+t+1)P_q}.
```

Only translation of the center and permutation of the three coordinates are
treated as symmetries. Results must replicate in at least two shapes.

## Fixed local filtrations

- Integers: all rational primes through cutoffs `5,7,11,17,29`.
- Function fields: all monic irreducibles of degree at most `1,2,3`, subject
  to the preregistered support gate below.

The baseline is exact divisibility eligibility. No empirical local-state
fallback, fitted residue cell, smoothing, or post-hoc bin merging is allowed.

## Pilot and holdout scales

Exploratory calibration pilot:

- integers: `N=250000,500000,1000000`, scored on `(N/2,N]`;
- `F_2[t]`: degrees `16,18,20`;
- `F_3[t]`: degrees `9,10,11`;
- `F_5[t]`: degree `9`.

The confirmatory scales will be frozen only after the pilot establishes
runtime and support. Pilot effect sizes may not be used to change the object,
shapes, control families, or promotion thresholds.

### Pre-pilot implementation amendment

The `--quick` implementation check found that the originally written field
shapes `{0,P_q,tP_q}`, `{0,P_q,(t+1)P_q}`, and
`{0,tP_q,(t+1)P_q}` have identical mask counts in `F_2[t]`. This is an exact
affine-symmetry redundancy, not a numerical effect. Before the full pilot,
shapes B and C were therefore replaced by the inequivalent higher-degree
collision signatures stated above. The `F_5[t]` pilot degree was raised to
`9` solely so every shift has degree below the monic center degree. The quick
artifact is retained as an audit trail and is not part of the pilot evidence.

## Controls

For every universe, scale, shape, and local depth:

1. `eligible-random`: sample the same number of labels as the real
   primes/irreducibles from the locally eligible one-point pool.
2. `eligible-composite`: sample the same number from locally eligible
   composites/reducibles.
3. `independent-mask`: generate independent Bernoulli coordinates with the
   observed marginal rates. This is a diagnostic control and cannot by itself
   certify arithmetic novelty.

The pilot uses 12 fixed seeds:

```text
12345, 271828, 314159, 161803, 424242, 8675309,
104729, 130363, 999983, 15485863, 32452843, 49979687
```

The strict standardized excess is the minimum z-score against the
eligible-random and eligible-composite control families. A zero control
standard deviation is not a pass.

## Support gate

A flow point is scoreable only if:

- at least `20000` fully eligible centers remain;
- at least `25` real `111` masks occur;
- both eligible-random and eligible-composite pools contain enough labels for
  sampling without replacement;
- all eight mask counts and marginal counts are reported, including zeros.

The confirmatory run may raise these thresholds but may not lower them.

## Promotion gates

### S1 — shared law

- strict control z-score at least `4` in both universes;
- same direction and a tau-matched SCID gap no larger than `25%` of the
  larger value;
- persistence on three increasing confirmatory scales;
- replication in at least two shapes and at least two finite fields;
- primary-source novelty audit and expert-ready proof-obligation memo.

### S2 — stable divergence

- the real-vs-control signal is independently scoreable in both universes;
- the tau-matched inter-universe gap has bootstrap z-score at least `4`;
- the sign of the gap persists on three increasing confirmatory scales;
- replication in at least two shapes and at least two finite fields;
- no profile-alignment requirement;
- primary-source novelty audit and expert-ready mechanism memo.

### S3 — one-universe phenomenon

- strict control z-score at least `5` after correction for every scored
  scale/shape/depth cell;
- persistence on three confirmatory scales and two shapes;
- absent from the other universe or explicitly outside a Two-Universes claim;
- primary-source literature audit finds no prior statement of the same flow;
- proof path is desirable but not required for conjecture-grade promotion.

## Automatic failure classifications

- `CALIBRATION`: the flow is reproduced by eligible-random or composite
  controls.
- `KNOWN-LOCAL`: increasing local depth absorbs the effect at the rate
  predicted by the remaining singular-series/local-factor tail.
- `SUPPORT-FAIL`: the score depends on sparse cells or fewer than 25 real
  triple events.
- `COORDINATE-FAIL`: the result changes under shift permutation or equivalent
  constellation shape.
- `FINITE-SCALE`: the effect decreases inconsistently or reverses over the
  confirmatory ladder.

## Disguise checks required before any promotion

1. Determine whether `SCID` is merely a nonlinear restatement of pair/triple
   Hardy–Littlewood singular-series factors.
2. Determine whether its finite-field flow is already forced by standard
   prime-polynomial tuple estimates.
3. Test composites/reducibles explicitly; Cramér-like controls are not enough.
4. Audit finite-sample entropy bias with the independent-mask control.
5. Report the factor/local-product decomposition whenever one exists.

## First proof obligation

If a non-null flow survives, derive its expectation under an independent
prime-tuple model with the exact truncated local product removed. Promotion is
blocked until the observed remainder is shown not to be algebraically forced
by that model.
