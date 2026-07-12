# Deep-admissible prime-gap transition copula — preregistration

Date frozen: 2026-07-10

Status: `EXPLORATORY PILOT`, not discovery evidence.

## Forced mutation

The SCID branch failed because every fixed three-shift mask statistic is a
function of finitely many Hardy–Littlewood tuple moments. Consecutive gaps are
different: the statement that two primes are consecutive imposes a growing
set of composite exclusions between them. This pilot tests sequence dependence
after both the one-gap distribution and finite residue-transition means are
removed.

## Fixed object

For consecutive primes or control events `p_i<p_{i+1}`, use the already audited
deep-admissible discrete mid-PIT at cutoff `B`:

```text
h_B(n) = 1_{n has no prime factor <=B} * rho_B/log(n)
U_i = P_B(T<p_{i+1}|p_i) + 0.5 P_B(T=p_{i+1}|p_i) - 0.5.
```

For an endpoint `X`, use `(X/4,X/2]` as training and `(X/2,X]` as holdout.
The training empirical CDF of `U` maps both windows to the rank coordinate
`V in [-1,1]`. This removes the one-point PIT distribution bias that closed
Cycle 88.

For wheel `W`, the transition class of gap `i` is
`(p_i mod W,p_{i+1} mod W)`. Estimate its training mean rank with fixed
shrinkage weight `alpha=20` toward the global training mean. For holdout gaps,
define

```text
e_i = V_i - shrunk_train_mean(transition_class_i)
C_B,W(X) = corr(e_i,e_{i+1}) on consecutive holdout gaps.
```

`C` is the primary invariant. Raw rank correlation before transition
subtraction is diagnostic only.

## Frozen pilot

- maximum endpoint: `2,000,000`;
- endpoints: `500,000`, `1,000,000`, `2,000,000`;
- start after: `100,000`;
- admissibility cutoffs: `B=29,97`;
- transition wheels: `W=30,210`;
- shrinkage weight: `20`;
- control seeds:
  `12345,271828,314159,161803,424242,8675309,104729,130363,999983,15485863,32452843,49979687`.

## Controls

1. `same-B fake`: sequential labels generated from the same pointwise hazard.
2. `B-rough composite`: labels generated with the same hazard only on
   `B`-rough composite candidates.
3. `real-order shuffle`: permutation of the holdout residual sequence,
   preserving its marginal distribution and transition-class fit.

Every synthetic sequence is independently trained and residualized; real
transition-class means are never imposed on controls.

## Support gate

- at least `20,000` holdout adjacent pairs;
- at least 10 usable runs in each synthetic control family;
- fewer than `10%` holdout transitions unseen in training;
- finite nonzero control standard deviations.

Low-count transition classes are not dropped; the fixed shrinkage rule applies
to all of them and the same rule is applied to controls.

## Pilot lead gate

The pilot only earns a confirmatory run if:

- `|z|>=4` against each of the three control families at `X=2,000,000`;
- the sign agrees at `X=1,000,000` and `2,000,000`;
- the effect is present for both `B=29` and `B=97`;
- it survives `W=210`, not only `W=30`;
- support passes.

## Confirmatory S3 gate

If the pilot lead gate passes, freeze new disjoint scale windows through at
least `16,000,000`. Promotion requires the same sign on three confirmatory
windows, strict two-sided `|z|>=5` after all scored-cell correction, both
cutoffs and wheels, primary-source novelty audit, and an expert-ready
Hardy–Littlewood/consecutive-prime factor check.

The statistic is integer-only S3 unless a canonical function-field ordering is
supplied independently. No arbitrary lexicographic polynomial order is
allowed.

## Automatic breaks

- raw and residual correlations agree, showing transition subtraction did no
  work;
- same-B fake or rough-composite sequences reproduce the effect;
- shuffling reproduces it;
- the effect exists only for `W=30`;
- sign or magnitude is unstable across endpoint windows;
- the result reduces to the already logged adjacent-gap anti-correlation or
  Lemke Oliver–Soundararajan residue-transition layer.

