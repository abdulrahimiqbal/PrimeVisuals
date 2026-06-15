# 2026-06-13 · playground critical-line loop

Goal: hallucinate candidate prime "critical lines" built from local arithmetic
chips, render them, then break or promote them under adversarial grounding.

Prior loaded context: `COUNCIL.md`, `MACHINE_HOW_TO_USE.md`, and
`KNOWLEDGE.md`. Main guardrails for this session:
- self-verification has failed before; no all-range claims from finite data;
- new lines without zeta tend to collapse to `psi`, `M`, local wheels, or
  non-prime relabeling;
- real-looking evidence should beat Cramer and composite controls, not just
  make a clean plot.

## Cycle 1 — prime-predecessor Mobius sum

### HALLUCINATE

Guess:

`pmuprev(x) = sum_{p <= x} mu(p - 1)`.

Why it could be a line: primes sample the predecessor sequence through strong
congruence filters. If the squarefree parity of `p-1` has a stable local mean,
then `pmuprev(x)` might be linear after subtracting the local-density main
term. If the mean is zero, it might be a flat zero line whose residual tests
prime-specific regularity.

Preregistered confirmation: flat/straight line with residual scale materially
smaller for real primes than five Cramer seeds and composite-only controls.

Preregistered break: no stable main term, no stable residual exponent, or the
same scale reproduced by Cramer/wheel/composite controls.

### SEE IT

Added lab primitive:

`pmuprev(n)=sum_{p<=n} mu(p-1)`.

Tests:

`npm test -- tests/prime-predecessor.test.js` -> 2 passed.

Explore:

```json
{"domain":"int","N":200000,"ex":"n","ey":"pmuprev(n)"}
```

Metrics:

```json
{"linearity":0.027339627447253816,"flatness":1.1688120001950728,"zeroCrossings":67,"yMin":-52,"yMax":41}
```

Shot:

`logs/playground-artifacts/pmuprev-200k.png`

Link:

`http://localhost:5173/#v=eyJtb2RlIjoibGFiIiwibGFiIjp7ImRvbWFpbiI6ImludCIsIk4iOjIwMDAwMCwidE1heCI6NjAsInNNYXgiOjEuNiwiZXgiOiJuIiwiZXkiOiJwbXVwcmV2KG4pIiwiZWgiOiIiLCJldyI6InMiLCJhIjowLjUsImIiOjIuMzk5fX0`

Visual read: a very thin horizontal band at lab scale, initially tempting as a
flat-zero line.

### GROUND IT

Audit script:

`node scripts/pmuprev-audit.mjs 16000000 logs/playground-artifacts`

Artifacts:

- `logs/playground-artifacts/pmuprev-audit-16000000.json`
- `logs/playground-artifacts/pmuprev-audit-16000000.md`
- `logs/playground-artifacts/pmuprev-audit-16000000.svg`

Range rows for real primes:

| N | labels | value | maxAbs | maxAbs/sqrt(N) |
| ---: | ---: | ---: | ---: | ---: |
| 1,000,000 | 78,498 | -287 | 292 | 0.292000 |
| 2,000,000 | 148,933 | -446 | 485 | 0.342947 |
| 4,000,000 | 283,146 | -825 | 833 | 0.416500 |
| 8,000,000 | 539,777 | -651 | 1,107 | 0.391384 |
| 16,000,000 | 1,031,130 | -522 | 1,107 | 0.276750 |

Endpoint exponent fit for maxAbs over this short range:

`theta = 0.503583`.

Controls at `N=16,000,000`:

| series | maxAbs/sqrt(N) |
| --- | ---: |
| real primes | 0.276750 |
| Cramer seeds | 0.092750 .. 0.231500 |
| W=210 wheel expectation | 0.052946 |
| W=210 composite-only seeds | 0.090500 .. 0.255250 |

### BREAK

GRAVEYARD verdict: not a critical line.

How it broke:

1. The first line claim was underfit. The plotted band at `200k` looked flat,
   but the walk drifted negative by `4e6` and then relaxed by `16e6`; this is
   not a stable straight or flat line with a trustworthy main term.
2. The residual scale is not prime-specific enough. Cramer and composite-only
   controls live in the same broad order of magnitude, with one composite-only
   seed reaching `0.255250` against real `0.276750`.
3. The object is best classified as a Mobius subsequence sum along prime
   predecessors. It may be a legitimate average-over-primes arithmetic
   function, but this run did not isolate a residual law encoding prime
   regularity.

CONNECTION: this is the predecessor version of the logged
`mu(p±1)` cross-stat branch. It again says that Mobius-near-prime statistics
must beat both Cramer and composite/local controls before being called prime
structure.

### LEARN

Raw horizontal bands are dangerous when the vertical range is small. For a
summatory candidate, fit or subtract a main term before trusting the picture.
Also, Cramer alone is too weak here; composite-only controls are mandatory.

## Cycle 2 — Mertens at prime predecessor half

### HALLUCINATE

Guess:

`H(p)=M((p-1)/2)` for primes `p`.

Why it could be a line: removing the forced factor `2` from prime predecessors
might expose a cleaner Mertens cancellation trace on prime-indexed arguments.

Preregistered confirmation: visibly flatter normalized residual than ordinary
`M(n)` on the comparable range, not explained by sampling.

Preregistered break: direct collapse to the ordinary Mertens walk.

### SEE IT

Explore specs:

```json
{"domain":"prime","N":200000,"ex":"n","ey":"M((n-1)/2)"}
{"domain":"prime","N":400000,"ex":"n","ey":"M((n-1)/2)"}
{"domain":"prime","N":800000,"ex":"n","ey":"M((n-1)/2)"}
{"domain":"int","N":400000,"ex":"2*n+1","ey":"M(n)"}
```

Metrics:

| spec | linearity | zeroCrossings | yMin | yMax |
| --- | ---: | ---: | ---: | ---: |
| prime `N=200k` | 0.021186 | 269 | -132 | 95 |
| prime `N=400k` | 0.017833 | 383 | -133 | 132 |
| prime `N=800k` | 0.019307 | 584 | -257 | 240 |
| ordinary `M`, half-range proxy | 0.020068 | 1080 | -258 | 240 |

Shot:

`logs/playground-artifacts/mertens-prime-half-800k.png`

Link:

`http://localhost:5173/#v=eyJtb2RlIjoibGFiIiwibGFiIjp7ImRvbWFpbiI6InByaW1lIiwiTiI6ODAwMDAwLCJ0TWF4Ijo2MCwic01heCI6MS42LCJleCI6Im4iLCJleSI6Ik0oKG4tMSkvMikiLCJlaCI6IiIsImV3IjoicyIsImEiOjAuNSwiYiI6Mi4zOTl9fQ`

### GROUND + BREAK

GRAVEYARD verdict: collapsed to `M`.

The range equality is the factor check: for `p <= 800k`, `(p-1)/2 <= 400k`,
and the prime-sampled object has the same `[-257,240]` vertical range as the
ordinary `M(n)` graph over `n <= 400k`. The apparent line is exactly the
already-known Mertens flat-zero companion, thinned to prime-indexed sample
points. It does not encode new prime regularity.

CONNECTION: direct instance of THE FUNNEL. Replacing the x-coordinate by a
prime-derived argument did not create a new object; it relabeled `M`.

### LEARN

Any candidate with `M(f(p))` or `M(f(n))` must be treated as Mertens first and
prime structure second. The next guess should avoid already-summatory `M` as
the plotted quantity unless the new content is a proven, audited residual
comparison after subtracting the ordinary M baseline.

## HANDOFF

Status: no survivor this session; two clean graveyard entries.

New code:

- `pmuprev(n)` lab primitive in `src/core/math.js` and `src/core/engine.js`
- hand-value tests in `tests/prime-predecessor.test.js`
- reproducible audit script `scripts/pmuprev-audit.mjs`

Next cycle suggestion:

Try a coordinate-free statistic that is not a direct summatory `M` or `psi`
view. A plausible short guess is a normalized covariance between prime gaps and
a *non-neighbor* arithmetic function, but preregister the exact composite-only
and wheel-matched controls before computing.

## Cycle 3 — Mobius-weighted centered gap residual

### HALLUCINATE

Guess:

`S(x)=sum_{p<=x} mu(p-1) * (g_p - log p)`, where `g_p` is the next-prime gap.

Why it could be a line: this avoids plotting `M(f(n))` directly and asks
whether the centered prime-gap noise cancels unusually well when signed by an
arithmetic feature of the prime predecessor. If prime gaps have arithmetic
regularity beyond density, real primes might give a flatter residual than fake
labels.

Preregistered confirmation: a flat zero line with stable residual exponent and
materially smaller scale than five Cramer fake-prime sequences, `W=210`
wheel-matched fake labels, and `W=210` composite-only fake labels.

Preregistered break: visible drift, unstable exponent, or matching/larger fake
and composite controls.

### SEE IT

Added lab primitive:

`pmugapres(n)=sum_{p<=n} mu(p-1)*(gap(p)-log(p))`, excluding the final prime
below `N` when its following gap is outside the table.

Tests:

`npm test -- tests/prime-predecessor.test.js` -> 4 passed.

Explore:

```json
{"domain":"int","N":800000,"ex":"n","ey":"pmugapres(n)"}
```

Metrics:

```json
{"linearity":0.6129407074951916,"flatness":0.7114238717432785,"zeroCrossings":47,"yMin":-2206.3993448083493,"yMax":429.18166140848723}
```

Shot:

`logs/playground-artifacts/pmugapres-800k.png`

Link:

`http://localhost:5173/#v=eyJtb2RlIjoibGFiIiwibGFiIjp7ImRvbWFpbiI6ImludCIsIk4iOjgwMDAwMCwidE1heCI6NjAsInNNYXgiOjEuNiwiZXgiOiJuIiwiZXkiOiJwbXVnYXByZXMobikiLCJlaCI6IiIsImV3IjoicyIsImEiOjAuNSwiYiI6Mi4zOTl9fQ`

Visual read: at full-canvas scale the trace can still look like a thin
horizontal band, but the metrics show it is not a stable flat line.

### GROUND IT

Audit script:

`node scripts/pmugapres-audit.mjs 4000000 logs/playground-artifacts`

Artifacts:

- `logs/playground-artifacts/pmugapres-audit-4000000.json`
- `logs/playground-artifacts/pmugapres-audit-4000000.md`
- `logs/playground-artifacts/pmugapres-audit-4000000.svg`

Range rows for real primes:

| N | labels | value | maxAbs | maxAbs/sqrt(N) |
| ---: | ---: | ---: | ---: | ---: |
| 250,000 | 22,044 | 119.565 | 613.801 | 1.227602 |
| 500,000 | 41,538 | -1876.580 | 1901.214 | 2.688722 |
| 1,000,000 | 78,498 | -1389.595 | 2206.399 | 2.206399 |
| 2,000,000 | 148,933 | -2471.926 | 3555.170 | 2.513885 |
| 4,000,000 | 283,146 | -3611.032 | 5269.837 | 2.634919 |

Endpoint exponent fit over this short range:

`theta = 0.710683`.

Controls at `N=4,000,000`:

| series | maxAbs/sqrt(N) |
| --- | ---: |
| real primes | 2.634919 |
| Cramer seeds | 1.178991 .. 2.947423 |
| W=210 fake labels | 1.678564 .. 3.276658 |
| W=210 composite-only seeds | 1.801160 .. 4.644215 |

### BREAK

GRAVEYARD verdict: not a critical line.

How it broke:

1. It is not flat after inspection: `flatness=0.711424` at `800k`, and the
   walk has a large negative excursion.
2. The residual scale is not prime-specific. A Cramer seed exceeds the real
   `maxAbs/sqrt(N)`, and a composite-only `W=210` control is much larger.
3. The construction measures noisy covariance between predecessor Mobius
   parity and centered gap increments. The observed scale is compatible with
   density/wheel/composite randomness, not an arithmetic cancellation law.

CONNECTION: this is the gap-residual sibling of Cycle 1. Adding centered gaps
did not escape the local-control failure mode; it amplified the noise and made
the fake/composite checks even more decisive.

### LEARN

Canvas-compressed walks are artifact factories: a graph can look like a sharp
line while its numeric flatness and control envelope are poor. Future gap
covariance guesses should be normalized before plotting, and the first audit
should compare effect size to wheel/composite controls rather than only asking
whether the real trace looks thin.

## HANDOFF 2

Status: no survivor; three graveyard entries in this ledger.

New code since the previous handoff:

- `pmugapres(n)` lab primitive in `src/core/math.js` and `src/core/engine.js`
- hand-value tests in `tests/prime-predecessor.test.js`
- reproducible audit script `scripts/pmugapres-audit.mjs`

Next cycle suggestion:

Try a normalized statistic first, not an unscaled cumulative walk. One possible
guess: a blockwise correlation of centered gaps with an arithmetic feature
where each block is normalized by its own variance, then compare the block
correlation distribution against Cramer, wheel, and composite-only controls.

## Cycle 4 — cumulative centered gaps

### HALLUCINATE

Guess:

`G(x)=sum_{p_i,p_{i+1}<=x}(p_{i+1}-p_i-log p_i)`.

Why it could be a line: this uses only prime gaps and local logarithmic average
gap size. If true primes have arithmetic rigidity beyond Cramer density, the
cumulative centered gap walk might stay close to a flat line, while fake labels
would wander. This is deliberately suspicious: the gap sum telescopes, so the
factor check is expected to be severe.

Preregistered confirmation: a sharp flat line with stable `sqrt(x)`-scale
residual that beats five Cramer seeds and composite controls, plus no collapse
to `psi`, `theta`, or `M`.

Preregistered break: algebraic collapse to a Chebyshev residual, visible
non-flatness, or fake/composite reproduction.

### SEE IT

No new primitive was needed. The existing patch view already encodes the
candidate:

```json
{"cfg":{"source":"gaps","plane":"walk","lens":"mono","p":{"N":200000}},
 "chips":{"x":[],"y":[]},"residual":false}
```

Metrics:

| N | linearity | flatness | yMin | yMax |
| ---: | ---: | ---: | ---: | ---: |
| 50,000 | 0.772188 | 0.421296 | 0.306853 | 351.645424 |
| 100,000 | 0.734263 | 0.404187 | 0.306853 | 509.463195 |
| 200,000 | 0.770866 | 0.414786 | 0.306853 | 735.812331 |

Shots:

- `logs/playground-artifacts/gaplogwalk-200k.png`
- `logs/playground-artifacts/gaplogwalk-200k-norm.png`

Link:

`http://localhost:5173/#v=eyJtb2RlIjoicGF0Y2giLCJjZmciOnsic291cmNlIjoiZ2FwcyIsInBsYW5lIjoid2FsayIsImxlbnMiOiJtb25vIiwicCI6eyJOIjoyMDAwMDB9fSwiY2hpcHMiOnsieCI6W10sInkiOltdfSwicmVzaWR1YWwiOmZhbHNlLCJ0d2luTW9kZSI6InJlYWwifQ`

Visual read: raw view looks like a clean horizontal trace with a slow upward
drift. Normalization confirms the drift is structural, not a drawing artifact.

### GROUND IT

Audit script:

`node scripts/gaplogwalk-audit.mjs 16000000 logs/playground-artifacts`

Artifacts:

- `logs/playground-artifacts/gaplogwalk-audit-16000000.json`
- `logs/playground-artifacts/gaplogwalk-audit-16000000.md`
- `logs/playground-artifacts/gaplogwalk-audit-16000000.svg`

Factor check:

For any increasing label sequence `a_i`,

`sum_{i<k}(a_{i+1}-a_i-log a_i) = a_k-a_0-sum_{i<k}log a_i`.

For primes this is

`p_k - 2 - theta(p_{k-1})`.

Thus the candidate is Chebyshev `theta` in gap clothing. It is not a new route.

Range rows for real primes:

| N | labels | value | maxAbs | maxAbs/sqrt(N) |
| ---: | ---: | ---: | ---: | ---: |
| 1,000,000 | 78,498 | 1510.640 | 1605.632 | 1.605632 |
| 2,000,000 | 148,933 | 1417.787 | 2183.109 | 1.543691 |
| 4,000,000 | 283,146 | 2660.710 | 3233.081 | 1.616541 |
| 8,000,000 | 539,777 | 2949.649 | 3961.927 | 1.400753 |
| 16,000,000 | 1,031,130 | 4284.948 | 6319.645 | 1.579911 |

Endpoint exponent fit:

`theta = 0.481322`.

Controls at `N=16,000,000`:

| series | maxAbs/sqrt(N) |
| --- | ---: |
| real primes | 1.579911 |
| Cramer seeds | 3.494399 .. 11.716888 |
| W=210 fake labels | 2.029044 .. 9.718014 |
| W=210 composite-only labels | 1120.084340 .. 1130.873965 |

### BREAK

GRAVEYARD verdict: collapsed to Chebyshev `theta` / `psi`.

How it broke:

1. The factor check is exact up to floating error (`~1e-7` at `16e6`): the
   gap-only construction is `p_k-2-theta(p_{k-1})`.
2. The real-vs-Cramer contrast is real-looking but already explained by the
   known arithmetic square-root cancellation of Chebyshev residuals. It is the
   same nugget, not a new line.
3. Composite-only controls fail massively, but for a trivial reason: their
   label density is different enough that the telescoped endpoint term and log
   sum no longer balance.

CONNECTION: this is the cleanest algebraic instance of THE FUNNEL in this
ledger. Starting from gaps and logs immediately returned to the Chebyshev
`theta/psi` residual family, the same branch as the `ψ(x)-x` and `L2` entries.

### LEARN

Any cumulative gap statistic with a raw `gap` term must first be telescoped on
paper. If the remaining term is `sum log(label)`, it is a Chebyshev object
before it is a gap object. Future gap candidates should use local shape
statistics that do not telescope, such as block-normalized spacing distributions
or transition matrices.

## HANDOFF 3

Status: no survivor; four graveyard entries in this ledger.

New code since the previous handoff:

- reproducible audit script `scripts/gaplogwalk-audit.mjs`

No new primitive was added in Cycle 4.

Next cycle suggestion:

Avoid raw cumulative gap sums. Try a non-telescoping statistic: for example,
blockwise variance-normalized gap-shape residuals, or a two-universes matched
spacing statistic where each block is normalized before summing.

## Cycle 5 — adjacent normalized gap-product mean

### HALLUCINATE

Guess:

`A(x)=mean((g_i/log p_i - 1)*(g_{i+1}/log p_{i+1} - 1))` over adjacent prime
gaps with `p_{i+2}<=x`.

Why it could be a line: unlike raw cumulative gap sums, this does not
telescope. It asks whether neighboring normalized gaps are negatively coupled.
A true prime law would appear as a flat negative line whose effect size is
stable with range and not reproduced by fake labels or composite controls.

Preregistered confirmation: a stable flat negative line that beats five Cramer
seeds, `W=210` wheel fake-label controls, and `W=210` composite-only controls.

Preregistered break: the effect is just the known consecutive-gap
anti-correlation / local-residue layer, is unstable with range, or is
reproduced by controls.

### SEE IT

Added lab primitive:

`gapac1mean(n)=mean((g_i/log p_i - 1)*(g_{i+1}/log p_{i+1} - 1))`.

Tests:

`npm test -- tests/prime-predecessor.test.js` -> 6 passed.

Explore:

```json
{"domain":"int","N":200000,"ex":"n","ey":"gapac1mean(n)"}
```

Metrics:

| N | linearity | flatness | yMin | yMax |
| ---: | ---: | ---: | ---: | ---: |
| 50,000 | 0.011185 | 0.148947 | -0.086909 | 0.363222 |
| 100,000 | 0.006405 | 0.108062 | -0.086909 | 0.363222 |
| 200,000 | 0.230079 | 0.092212 | -0.086909 | 0.363222 |

Shot:

`logs/playground-artifacts/gapac1mean-200k.png`

Link:

`http://localhost:5173/#v=eyJtb2RlIjoibGFiIiwibGFiIjp7ImRvbWFpbiI6ImludCIsIk4iOjIwMDAwMCwidE1heCI6NjAsInNNYXgiOjEuNiwiZXgiOiJuIiwiZXkiOiJnYXBhYzFtZWFuKG4pIiwiZWgiOiIiLCJldyI6InMiLCJhIjowLjUsImIiOjIuMzk5fX0`

Visual read: visually a sharp horizontal band after the small initial transient.
This is the first cycle in this ledger whose plotted line looks like a real
flat statistic and is non-telescoping.

### GROUND IT

Audit script:

`node scripts/gapac1mean-audit.mjs 16000000 logs/playground-artifacts`

Artifacts:

- `logs/playground-artifacts/gapac1mean-audit-16000000.json`
- `logs/playground-artifacts/gapac1mean-audit-16000000.md`
- `logs/playground-artifacts/gapac1mean-audit-16000000.svg`

Endpoint means for real primes:

| N | pairs | mean | se | z |
| ---: | ---: | ---: | ---: | ---: |
| 1,000,000 | 78,496 | -0.03616362 | 0.00221361 | -16.337 |
| 2,000,000 | 148,931 | -0.03768670 | 0.00164981 | -22.843 |
| 4,000,000 | 283,144 | -0.03392586 | 0.00124005 | -27.358 |
| 8,000,000 | 539,775 | -0.03269523 | 0.00090693 | -36.050 |
| 16,000,000 | 1,031,128 | -0.03042431 | 0.00066691 | -45.620 |

Controls at `N=16,000,000`:

| series | mean |
| --- | ---: |
| real primes | -0.03042431 |
| Cramer seeds | -0.00245580 .. -0.00041838 |
| W=210 fake labels | -0.01204309 .. -0.01103866 |
| W=210 composite-only labels | 0.13868084 .. 0.14492582 |

### BREAK

GRAVEYARD verdict: known gap anti-correlation calibration, not a new critical
line.

How it broke:

1. It did **not** collapse to `M` or `psi`, and it is not a telescoping gap sum.
2. It does produce a stable-looking flat negative line, and ordinary Cramer
   controls miss the effect by more than an order of magnitude in `z`.
3. But the statistic is exactly the scalar adjacent-gap anti-correlation family
   already logged in `KNOWLEDGE.md`, adjacent to Lemke Oliver-Soundararajan
   consecutive-prime residue-pair bias. The `W=210` wheel fake labels reproduce
   about one third of the negative mean, showing that local residue geometry is
   a material component.
4. Composite-only controls fail in the opposite direction, so this is prime
   structure, but not new prime structure. It is a calibration row for the known
   consecutive-gap layer.

CONNECTION: this is the normalized, non-telescoping version of the earlier
`gap autocorrelation lag-1` entries. It explains why Cycle 4 had to be rejected
as Chebyshev disguise but also why genuinely local gap-shape statistics remain
interesting: they can survive Cramer while still falling into known
LO-S/residue-transition territory.

### LEARN

This is what a real flat statistic looks like numerically: stable mean, growing
`|z|`, Cramer failure, and composite failure. The missing ingredient is novelty:
the effect is already the known adjacent-gap anti-correlation layer. Future
guesses should subtract a local transition/wheel baseline first, then test the
residual flat line.

## HANDOFF 4

Status: no survivor; five graveyard/calibration entries in this ledger.

New code since the previous handoff:

- `gapac1mean(n)` lab primitive in `src/core/math.js` and `src/core/engine.js`
- hand-value tests in `tests/prime-predecessor.test.js`
- reproducible audit script `scripts/gapac1mean-audit.mjs`

Next cycle suggestion:

Start with a baseline-subtracted adjacent-gap statistic:
`real gapac1mean - W=210 expected gapac1mean` by block, or a two-universes
matched version of this normalized statistic. The preregistered break should be
"residue transition layer explains it."

## Cycle 6 — wheel-subtracted adjacent gap-product mean

### HALLUCINATE

Guess:

`R(x)=gapac1mean(x)-baseline_W210(x)`, where `baseline_W210(x)` is the mean of
five `W=210` fake-label controls at the same endpoint.

Why it could be a line: Cycle 5 showed a real flat adjacent-gap
anti-correlation and simple `W=210` fake labels explained roughly one third of
the effect. Subtracting that independent local-wheel layer might reveal a
smaller but stable residual line. If that residual were not just known
consecutive-residue transition bias, it would be a sharper candidate object.

Preregistered confirmation: a stable residual flat line after local wheel
subtraction, with Cramer/composite controls failing and no known
residue-transition explanation.

Preregistered break: the residual is the known Lemke Oliver-Soundararajan
residue-transition layer, or it is unstable under range/control expansion.

### SEE IT

For the shareable app view, used the rounded large-range wheel baseline:

```json
{"domain":"int","N":200000,"ex":"n","ey":"gapac1mean(n)+0.0116"}
```

Metrics:

| N | linearity | flatness | yMin | yMax |
| ---: | ---: | ---: | ---: | ---: |
| 50,000 | 0.011185 | 0.188596 | -0.075309 | 0.374822 |
| 100,000 | 0.006405 | 0.137308 | -0.075309 | 0.374822 |
| 200,000 | 0.230079 | 0.118561 | -0.075309 | 0.374822 |

Shot:

`logs/playground-artifacts/gapac1residual-200k.png`

Link:

`http://localhost:5173/#v=eyJtb2RlIjoibGFiIiwibGFiIjp7ImRvbWFpbiI6ImludCIsIk4iOjIwMDAwMCwidE1heCI6NjAsInNNYXgiOjEuNiwiZXgiOiJuIiwiZXkiOiJnYXBhYzFtZWFuKG4pKzAuMDExNiIsImVoIjoiIiwiZXciOiJzIiwiYSI6MC41LCJiIjoyLjM5OX19`

Visual read: the residual line remains a horizontal band after the initial
transient. It is visually plausible but must be judged against the stronger
transition-layer prior.

### GROUND IT

Audit script:

`node scripts/gapac1residual-audit.mjs 16000000 logs/playground-artifacts`

Artifacts:

- `logs/playground-artifacts/gapac1residual-audit-16000000.json`
- `logs/playground-artifacts/gapac1residual-audit-16000000.md`
- `logs/playground-artifacts/gapac1residual-audit-16000000.svg`

Real residual by endpoint:

| N | mean | W210 baseline | residual | residual/se |
| ---: | ---: | ---: | ---: | ---: |
| 1,000,000 | -0.03616362 | -0.01545285 | -0.02071077 | -9.356 |
| 2,000,000 | -0.03768670 | -0.01430286 | -0.02338384 | -14.174 |
| 4,000,000 | -0.03392586 | -0.01322897 | -0.02069689 | -16.690 |
| 8,000,000 | -0.03269523 | -0.01210599 | -0.02058924 | -22.702 |
| 16,000,000 | -0.03042431 | -0.01159624 | -0.01882806 | -28.232 |

Controls at `N=16,000,000` after subtracting the same baseline:

| series | residual |
| --- | ---: |
| real primes | -0.01882806 |
| Cramer seeds | 0.00935400 .. 0.01117787 |
| W=210 fake labels | -0.00044684 .. 0.00055758 |
| W=210 composite-only labels | 0.15027708 .. 0.15652206 |

### BREAK

GRAVEYARD verdict: survives simple wheel subtraction, but fails novelty; known
residue-transition layer remains.

How it broke:

1. The residual is stable and strongly negative, so the independent `W=210`
   wheel baseline is not sufficient.
2. This is not a `ψ/M` disguise and not density-only. Cramer and composite
   controls fail in the expected directions.
3. The remaining residual is exactly where the project already has a known
   explanation: consecutive-prime residue-pair bias / LO-S-adjacent transition
   structure. Cycle 5 was a scalar version of that layer; Cycle 6 only subtracts
   independent residue availability, not transition-pair bias.

CONNECTION: this is the baseline-subtracted refinement of Cycle 5 and connects
directly to the 2026-06-13 transition-audit entries in `KNOWLEDGE.md`: ordinary
wheel controls under-explain consecutive-prime transition statistics because
they do not model residue-pair dependence. The next honest baseline must be a
transition-matched one, not another independent wheel.

### LEARN

A real flat residual can still be too weakly grounded if the null model is
underfit. Independent wheel controls are useful but insufficient for adjacent
gap statistics; transition-matched controls are the required audit gate.

## HANDOFF 5

Status: no survivor; six graveyard/calibration entries in this ledger.

New code since the previous handoff:

- reproducible audit script `scripts/gapac1residual-audit.mjs`

No new primitive was added in Cycle 6.

Next cycle suggestion:

Build a transition-matched adjacent-gap residual: subtract the expected
`gapac1mean` under a control preserving consecutive residue-pair counts modulo
`q` (start with `q=11` or `q=210`). Preregister the break as "transition
matching erases the residual."

## Cycle 7 — transition-class baseline for adjacent gap products

### HALLUCINATE

Guess:

`T_q(x)=gapac1mean(x)-B_q(x)`, where `B_q(x)` is a transition-class baseline.
For each endpoint and modulus `q`, replace each normalized gap
`g_i/log p_i - 1` by the mean normalized gap for its transition class
`(p_i mod q, p_{i+1} mod q)`, then average adjacent products over the actual
transition-class sequence.

Why it could be a line: Cycle 6 showed that independent `W=210` wheel controls
underfit adjacent gap statistics. A transition-class baseline should absorb the
LO-S residue-pair layer. If anything stable remains after `q=210`, it is a
sharper candidate; if not, the previous line is fully explained by known local
transition structure.

Preregistered confirmation for break: `q=11` or `q=210` transition baseline
erases the Cycle 6 residual.

Preregistered survivor condition: stable nonzero residual after `q=210` whose
scale is not reproduced by Cramer, wheel, or composite controls.

### SEE IT

For the shareable app view, used the rounded large-range `q=210` transition
baseline:

```json
{"domain":"int","N":200000,"ex":"n","ey":"gapac1mean(n)+0.02518"}
```

Metrics at `N=200000`:

```json
{"linearity":0.23007856841472873,"flatness":0.17811977446421576,"zeroCrossings":1,"yMin":-0.06172886354646714,"yMax":0.3884017424116491}
```

Shot:

`logs/playground-artifacts/gapac1-transition-residual-200k.png`

Link:

`http://localhost:5173/#v=eyJtb2RlIjoibGFiIiwibGFiIjp7ImRvbWFpbiI6ImludCIsIk4iOjIwMDAwMCwidE1heCI6NjAsInNNYXgiOjEuNiwiZXgiOiJuIiwiZXkiOiJnYXBhYzFtZWFuKG4pKzAuMDI1MTgiLCJlaCI6IiIsImV3IjoicyIsImEiOjAuNSwiYiI6Mi4zOTl9fQ`

Visual read: still a flat-looking residual band, so visual inspection alone
would overrate it.

### GROUND IT

Audit script:

`node scripts/gapac1-transition-audit.mjs 16000000 logs/playground-artifacts 11,210`

Artifacts:

- `logs/playground-artifacts/gapac1-transition-audit-16000000.json`
- `logs/playground-artifacts/gapac1-transition-audit-16000000.md`
- `logs/playground-artifacts/gapac1-transition-q11-16000000.svg`
- `logs/playground-artifacts/gapac1-transition-q210-16000000.svg`

Real residual by endpoint:

| q | N | raw | baseline | residual | residual/se |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 11 | 1,000,000 | -0.03616362 | -0.00183241 | -0.03433120 | -16.050 |
| 11 | 16,000,000 | -0.03042431 | -0.00129555 | -0.02912875 | -44.331 |
| 210 | 1,000,000 | -0.03616362 | -0.02802864 | -0.00813498 | -21.364 |
| 210 | 16,000,000 | -0.03042431 | -0.02517945 | -0.00524485 | -52.502 |

Controls at `N=16,000,000`:

| q | series | residual range |
| ---: | --- | ---: |
| 11 | Cramer | -0.00294415 .. -0.00064753 |
| 11 | W=210 fake labels | -0.01275089 .. -0.01170477 |
| 11 | composite-only | -0.01735731 .. -0.01378969 |
| 210 | Cramer | -0.00481260 .. -0.00434714 |
| 210 | W=210 fake labels | -0.00489857 .. -0.00446234 |
| 210 | composite-only | -0.00096742 .. 0.00082691 |

### BREAK

GRAVEYARD verdict: transition matching kills prime-specificity.

How it broke:

1. Mod `11` barely explains the real line, so small-modulus LO-S structure
   alone is not the whole scalar effect.
2. Mod `210` explains most of the raw real mean (`-0.02518` out of
   `-0.03042`), but leaves a residual near `-0.00524`.
3. That residual is not prime-specific: Cramer and `W=210` fake-label controls
   have essentially the same `q=210` transition residual (`about -0.0043` to
   `-0.0049`). Composite-only controls are near zero after the same baseline.
4. Therefore the remaining flat line is an artifact/universal bias of this
   transition-class replacement baseline for prime-density label sequences, not
   a new prime regularity law.

CONNECTION: this closes the Cycle 5/6 adjacent-gap branch. The true
prime-specific signal is local transition structure; once transition classes
are modeled at `q=210`, the residual no longer distinguishes real primes from
Cramer/wheel fake labels. This links directly to the previous transition-audit
entries that identified LO-S residue-pair bias as the right explanatory layer.

### LEARN

Do not escalate a scalar adjacent-gap line unless the null preserves
transition-pair structure. Independent wheel controls are too weak, and
transition-class replacement itself introduces a small universal residual that
must be measured on fake labels.

## HANDOFF 6

Status: no survivor; seven graveyard/calibration entries in this ledger.

New code since the previous handoff:

- reproducible audit script `scripts/gapac1-transition-audit.mjs`

No new primitive was added in Cycle 7.

Next cycle suggestion:

Move away from adjacent scalar gaps or use a two-universes version with the
transition baseline built in from the start. A good preregistered break for the
next guess: "q=210 transition baseline or function-field transition baseline
erases it."

## Cycle 8 — rough-gap exception constant

### HALLUCINATE

Guess:

`R(x)=roughmiss(x) * log(x)^2 / x`, where `roughmiss(x)` is the cumulative
number of consecutive prime gaps `(p,p+g)` with no interior integer
`m` satisfying `gcd(m,lcm(1..g-1))=1`.

Why it could be a line: Gafni-Tao show that rough-witness failures inside
prime gaps have order `X/log^2 X` on dyadic windows, so a cumulative
normalization should draw a flat constant. The object is gap-internal and
coordinate-free, not an adjacent scalar-gap product or lexicographic ordering.

Preregistered confirmation for a useful line: the app view is visually flat,
dyadic windows give a stable real constant, and the real constant differs from
ordinary Cramer controls and composite-permitting controls.

Preregistered break: the statistic is already the known Gafni-Tao rough-gap
exception law, or the contrast is reproduced by a non-prime/composite control.
In either case it is not a new critical line.

Sanity note: before this formal cycle I ran a quick throwaway range check to
choose the visual normalization. The formal evidence below is the audited
render, controls, and artifacts.

### SEE IT

Added lab primitive:

`roughmiss(n)=# { consecutive prime gaps (p,p+g), p<=n, with roughcount(p,g)=0 }`.

Hand tests:

`npm test -- tests/prime-predecessor.test.js`

App spec:

```json
{"domain":"int","N":200000,"ex":"n","ey":"roughmiss(n)*log(n)^2/n"}
```

Metrics:

```json
{"linearity":0.5286463539224712,"flatness":0.030286916943970708,"zeroCrossings":0,"monotonicity":-0.955519777598888,"yMin":0,"yMax":3.878681278445707}
```

Shot:

`logs/playground-artifacts/roughmiss-200k.png`

Link:

`http://localhost:5173/#v=eyJtb2RlIjoibGFiIiwibGFiIjp7ImRvbWFpbiI6ImludCIsIk4iOjIwMDAwMCwidE1heCI6NjAsInNNYXgiOjEuNiwiZXgiOiJuIiwiZXkiOiJyb3VnaG1pc3MobikqbG9nKG4pXjIvbiIsImVoIjoiIiwiZXciOiJzIiwiYSI6MC41LCJiIjoyLjM5OX19`

Visual read: the line is visually razor-flat at app scale. The numeric
flatness is small, but the line has slow finite-range drift, so the real test
is the integrated dyadic-window audit.

### GROUND IT

Audit script:

`node scripts/roughmiss-audit.mjs 16000000 logs/playground-artifacts`

Artifacts:

- `logs/playground-artifacts/roughmiss-audit-16000000.json`
- `logs/playground-artifacts/roughmiss-audit-16000000.md`
- `logs/playground-artifacts/roughmiss-audit-16000000.svg`

Real dyadic windows, normalized by the proper integrated main term
`integral dt/log^2(t)`:

| window | gaps | exceptions | constant | exception rate |
| --- | ---: | ---: | ---: | ---: |
| 1,000,000..2,000,000 | 70,435 | 13,590 | 2.739383 | 0.192944 |
| 2,000,000..4,000,000 | 134,213 | 24,562 | 2.723211 | 0.183008 |
| 4,000,000..8,000,000 | 256,631 | 45,211 | 2.745111 | 0.176171 |
| 8,000,000..16,000,000 | 491,353 | 82,929 | 2.746621 | 0.168777 |

Cumulative least-squares main constant: `2.736909`.
Residual exponent fit after subtracting that integrated main term:
`theta=-0.010641` over the audited endpoints.

Control ranges:

| control | last-window constant range |
| --- | ---: |
| ordinary Cramer, 5 seeds | 2.144331 .. 2.158904 |
| W=210 fake labels, 5 seeds | 2.736354 .. 2.747184 |
| W=210 composite-only labels, 5 seeds | 1.441919 .. 1.464673 |

### BREAK

GRAVEYARD verdict: real line, known object, killed as a new critical line by
the stronger wheel null.

How it broke:

1. The real line is stable and flat on the integrated `dt/log^2(t)` scale,
   matching the existing Gafni-Tao rough-gap exception law.
2. Ordinary Cramer controls underproduce the constant, so a weak audit would
   falsely call this prime-specific.
3. The W=210 fake-label control reproduces the real constant almost exactly:
   last window real `2.746621`, fake-label range `2.736354..2.747184`.
4. Composite-only W=210 controls fail low, so the line is not a pure
   arbitrary-composite phenomenon. But it is still not a new prime line: it is
   local wheel/sieve geometry carried by random coprime labels.

CONNECTION: this corrects the rough-gap entry in `KNOWLEDGE.md`. The earlier
rough-gap Cramer contrast was real against an ordinary Cramer null, but the
right local-wheel null erases breakthrough status. It also connects to Cycles
6 and 7: underfit controls produce seductive flat lines; strengthening the null
from ordinary Cramer to W=210 or transition-matched controls is often the whole
story.

### LEARN

For rough interval witnesses, ordinary Cramer is too weak because it only bakes
in the `2,3` local obstruction. Once the fake labels preserve coprimality to
`2*3*5*7`, the exception constant becomes a sieve/wheel constant rather than a
prime-specific residual.

## HANDOFF 7

Status: no survivor; eight graveyard/calibration entries in this ledger.

New code since the previous handoff:

- lab primitive `roughmiss(n)` in `src/core/math.js` and `src/core/engine.js`
- hand tests in `tests/prime-predecessor.test.js`
- reproducible audit script `scripts/roughmiss-audit.mjs`

Next cycle suggestion:

The last two branches both died when the null was strengthened. Next guess
should start with the strong null built in: either a coordinate-free statistic
already conditioned on W=210 local wheel data, or a two-universes statistic
where the function-field/local-wheel baseline is subtracted before the first
plot. A good preregistered break: "W=210 or transition/function-field baseline
reproduces the line."

## Cycle 9 — W=210-compensated Chebyshev mass

### HALLUCINATE

Guess:

`Theta210res(x)=sum_{2<=n<=x, gcd(n,210)=1}(isprime(n)*log(n)-210/phi(210))`.

Why it could be a line: Cycle 8 showed that the W=210 local wheel is the
right first null for rough gap counts. Instead of counting primes directly,
this construction asks whether log-prime mass, after subtracting the exact
W=210 coprime-label expectation, has a sharper zero line than W=210 fake
labels. It bakes in the local wheel before the first plot.

Preregistered confirmation: `Theta210res(x)/sqrt(x)` stays in a tight flat
band; the raw residual has exponent near `1/2`; five W=210 fake-label controls
are materially wider; composite-only W=210 controls fail.

Preregistered break: algebraically
`Theta210res(x)=theta(x)-sum_{p|210,p<=x}log(p)-(210/48)C_210(x)`, where
`C_210(x)=#{2<=n<=x:gcd(n,210)=1}`. Since `(210/48)C_210(x)=x+O(1)`, this is
just `theta(x)-x` plus bounded periodic/local-prime terms. If that factor check
is exact, the line is a Chebyshev/psi disguise even if it beats fake labels.

### SEE IT

Added lab primitive:

`theta210res(n)=sum_{2<=m<=n,gcd(m,210)=1}(isprime(m)*log(m)-210/48)`.

Hand tests:

`npm test -- tests/prime-predecessor.test.js`

App spec:

```json
{"domain":"int","N":200000,"ex":"n","ey":"theta210res(n)/sqrt(n)"}
```

Metrics:

```json
{"linearity":0.010347079403124805,"flatness":0.17670543406216144,"zeroCrossings":0,"monotonicity":0.7224861243062153,"yMin":-1.9409130200502196,"yMax":0}
```

Shot:

`logs/playground-artifacts/theta210res-norm-200k.png`

Link:

`http://localhost:5173/#v=eyJtb2RlIjoibGFiIiwibGFiIjp7ImRvbWFpbiI6ImludCIsIk4iOjIwMDAwMCwidE1heCI6NjAsInNNYXgiOjEuNiwiZXgiOiJuIiwiZXkiOiJ0aGV0YTIxMHJlcyhuKS9zcXJ0KG4pIiwiZWgiOiIiLCJldyI6InMiLCJhIjowLjUsImIiOjIuMzk5fX0`

Visual read: a very thin normalized band, one-sided negative at this range.
The flatness is real, but the shape already resembles the known Chebyshev
finite-range drift.

### GROUND IT

Audit script:

`node scripts/theta210res-audit.mjs 16000000 logs/playground-artifacts`

Artifacts:

- `logs/playground-artifacts/theta210res-audit-16000000.json`
- `logs/playground-artifacts/theta210res-audit-16000000.md`
- `logs/playground-artifacts/theta210res-audit-16000000.svg`

Real endpoint residuals:

| N | value | value/sqrt(N) | maxAbs/sqrt(N) | identity error |
| ---: | ---: | ---: | ---: | ---: |
| 1,000,000 | -1514.922082 | -1.514922 | 1.606591 | 2.012e-9 |
| 2,000,000 | -1413.874970 | -0.999761 | 1.541108 | -1.829e-9 |
| 4,000,000 | -2674.355024 | -1.337178 | 1.617527 | 6.745e-8 |
| 8,000,000 | -2946.225816 | -1.041648 | 1.399992 | 1.146e-7 |
| 16,000,000 | -4278.582216 | -1.069646 | 1.580998 | -1.669e-7 |

Real exponent fit from endpoint maxAbs: `theta=0.481511`.

Control summary at `N=16,000,000`:

| control | value/sqrt(N) range | maxAbs/sqrt(N) range | theta range |
| --- | ---: | ---: | ---: |
| ordinary Cramer, 5 seeds | -1260.223196 .. -1252.563583 | 1252.569872 .. 1260.228209 | 0.996226 .. 1.003700 |
| W=210 fake labels, 5 seeds | -2.190201 .. 9.126650 | 2.030669 .. 9.719652 | 0.289889 .. 0.774262 |
| W=210 composite-only, 5 seeds | -1130.904287 .. -1120.105779 | 1120.111840 .. 1130.908844 | 0.925840 .. 0.931087 |

Factor check:

`Theta210res(x)=theta(x)-sum_{p|210,p<=x}log(p)-(210/48)C_210(x)`.

Maximum endpoint identity error: `1.669023e-7`.

### BREAK

GRAVEYARD verdict: Chebyshev/psi disguise.

How it broke:

1. The real residual is genuinely tight: `maxAbs/sqrt(N)=1.580998` at
   `16e6`, and the max-envelope exponent fit is `0.481511`.
2. Five fair W=210 fake-label controls are wider (`2.030669..9.719652`), so
   the usual arithmetic-vs-density contrast is visible.
3. But the factor identity is exact to floating roundoff. The construction
   differs from Chebyshev `theta(x)-x` only by the bounded periodic error in
   `(210/48)C_210(x)-x` and by the fixed logs of `2,3,5,7`.
4. Ordinary Cramer and composite-only controls fail linearly because they do
   not match the W=210 coprime-label expectation. That is a calibration check,
   not evidence of a new line.

CONNECTION: this is the W=210 analogue of Cycle 4's centered-gap telescope.
Building in the strong local wheel did not escape THE FUNNEL; cumulative
log-prime mass collapsed directly to the Chebyshev residual family. It also
connects to the original `psi(x)-x` real nugget: the sharp real-vs-fake
contrast is arithmetic square-root cancellation, but the object is not new.

### LEARN

Strong nulls are necessary but not sufficient. Any cumulative statistic with
`isprime(n)*log(n)` must be factor-checked before celebrating a tight residual:
local-wheel compensation can make the null fair while leaving the object
algebraically identical to `theta/psi`.

## HANDOFF 8

Status: no survivor; nine graveyard/calibration entries in this ledger.

New code since the previous handoff:

- lab primitive `theta210res(n)` in `src/core/math.js` and `src/core/engine.js`
- hand tests in `tests/prime-predecessor.test.js`
- reproducible audit script `scripts/theta210res-audit.mjs`

Next cycle suggestion:

Avoid cumulative log-prime mass unless the goal is explicitly to calibrate the
Chebyshev funnel. A better next guess should be either non-cumulative and
transition/null matched from the start, or a two-universes statistic where the
integer and function-field baselines are both subtracted before plotting.

## Cycle 10 — normalized gap variance line

### HALLUCINATE

Guess:

`gapz2mean(x)=mean_{p_i,p_{i+1}<=x} (g_i/log(p_i)-1)^2`, the running second
moment of centered normalized prime gaps.

Why it could be a line: unlike cumulative gap sums, this does not telescope to
`theta/psi`, and unlike adjacent products it does not directly ask for
consecutive transition memory. If normalized gaps follow an exponential-like
law, the centered second moment should be a flat line near `1`. Any stable
departure from W=210 fake labels would be a candidate for prime-specific gap
regularity below the local wheel.

Preregistered confirmation: a stable flat real line whose endpoint value and
range trend differ materially from five W=210 fake-label controls, with
composite-only controls failing.

Preregistered break: ordinary Cramer or W=210 fake labels reproduce the line
and its drift; then it is a density/null gap-moment calibration, not a new
critical line. A second break mode is underfit normalization: replacing
`log(p)` by the local mean gap or wheel baseline erases the apparent effect.

### SEE IT

Added lab primitive:

`gapz2mean(n)=mean_{p_i,p_{i+1}<=n} (g_i/log(p_i)-1)^2`.

Hand tests:

`npm test -- tests/prime-predecessor.test.js`

App spec:

```json
{"domain":"int","N":200000,"ex":"n","ey":"gapz2mean(n)"}
```

Metrics:

```json
{"linearity":0.6561581747277705,"flatness":0.06230072547477065,"zeroCrossings":0,"monotonicity":-0.46315965078129345,"yMin":0,"yMax":0.5981845874025439}
```

Shot:

`logs/playground-artifacts/gapz2mean-200k.png`

Link:

`http://localhost:5173/#v=eyJtb2RlIjoibGFiIiwibGFiIjp7ImRvbWFpbiI6ImludCIsIk4iOjIwMDAwMCwidE1heCI6NjAsInNNYXgiOjEuNiwiZXgiOiJuIiwiZXkiOiJnYXB6Mm1lYW4obikiLCJlaCI6IiIsImV3IjoicyIsImEiOjAuNSwiYiI6Mi4zOTl9`

Visual read: a very flat rising band, but the level is around `0.55..0.60` at
app range, far below the naive continuous exponential value `1`. This demands
a local-wheel audit before any prime-specific interpretation.

### GROUND IT

Audit script:

`node scripts/gapz2mean-audit.mjs 16000000 logs/playground-artifacts`

Artifacts:

- `logs/playground-artifacts/gapz2mean-audit-16000000.json`
- `logs/playground-artifacts/gapz2mean-audit-16000000.md`
- `logs/playground-artifacts/gapz2mean-audit-16000000.svg`

Real endpoint means:

| N | gaps | mean | se | mean raw gap |
| ---: | ---: | ---: | ---: | ---: |
| 1,000,000 | 78,497 | 0.63684562 | 0.00577306 | 12.739 |
| 2,000,000 | 148,932 | 0.65972915 | 0.00447362 | 13.429 |
| 4,000,000 | 283,145 | 0.67364079 | 0.00328810 | 14.127 |
| 8,000,000 | 539,776 | 0.68324628 | 0.00241030 | 14.821 |
| 16,000,000 | 1,031,129 | 0.69293530 | 0.00176765 | 15.517 |

Real log-range trend slope: `0.01957686`.

Control summary at `N=16,000,000`:

| group | mean range | log-trend slope range |
| --- | ---: | ---: |
| ordinary Cramer, 5 seeds | 0.80285184 .. 0.80897533 | 0.00986179 .. 0.01560731 |
| W=210 fake labels, 5 seeds | 0.74060622 .. 0.74667723 | 0.01405514 .. 0.01839082 |
| W=210 composite-only, 5 seeds | 1.71727648 .. 1.73234729 | -0.15648567 .. -0.13506215 |

Primorial-wheel ladder:

| W | W/phi(W) | mean range at 16,000,000 |
| ---: | ---: | ---: |
| 210 | 4.375000 | 0.74060622 .. 0.74667723 |
| 2,310 | 4.812500 | 0.72899849 .. 0.73443346 |
| 30,030 | 5.213542 | 0.71977950 .. 0.72520346 |
| 510,510 | 5.539388 | 0.71533131 .. 0.71957386 |
| 9,699,690 | 5.847132 | 0.71095543 .. 0.71435455 |

### BREAK

GRAVEYARD verdict for critical-line status: local-admissibility gap-moment
calibration, not a new residual line.

How it broke:

1. The line passes a naive visual test and even beats the first W=210 null:
   real `0.69293530` versus W=210 fake labels `0.74060622..0.74667723`.
2. But increasing the primorial wheel moves the fake-label mean monotonically
   toward the real value: `0.74` at W=210, `0.73` at W=2310, `0.72` at
   W=30030/510510, and `0.711..0.714` at W=9699690.
3. The remaining gap to real is not enough for a new critical-line claim
   because the effect is plainly dominated by local admissible-gap geometry.
   This is the same family as prime-gap distribution / Hardy-Littlewood
   singular-series calibration, not RH-grade residual scaling.
4. Composite-only controls fail high, which is useful: the statistic is not
   arbitrary-composite geometry. It is still a gap-distribution moment, not a
   new straight-line route.

CONNECTION: this sits between Cycle 8 and Cycle 7. Like the rough-gap constant,
ordinary Cramer and small-wheel controls underfit the local sieve; like the
transition branch, a scalar gap statistic is too coarse unless the admissible
local structure is built in. The next honest version would subtract a full
singular-series or high-primorial baseline first.

### LEARN

A non-cumulative flat line can still be a local-null artifact. For scalar gap
moments, W=210 is not strong enough; the null must be stress-tested along a
primorial ladder before any residual is called prime-specific.

## HANDOFF 9

Status: no survivor; ten graveyard/calibration entries in this ledger.

New code since the previous handoff:

- lab primitive `gapz2mean(n)` in `src/core/math.js` and `src/core/engine.js`
- hand tests in `tests/prime-predecessor.test.js`
- reproducible audit script `scripts/gapz2mean-audit.mjs`

Next cycle suggestion:

If staying with gap distributions, start from the high-primorial or
singular-series baseline rather than W=210. Better: use a two-universes
statistic with the local admissibility baseline subtracted in both worlds
before plotting, so the first picture is already a residual.

## Cycle 11 — high-primorial gap-moment residual

### HALLUCINATE

Guess:

`G2res_W(x)=gapz2mean(x)-B_W(x)`, where `B_W(x)` is the five-seed fake-label
baseline for labels restricted to `gcd(n,W)=1`, using the same density
`W/phi(W)/log(n)`. Start with `W=9,699,690` (`2*3*5*7*11*13*17*19`) because
Cycle 10 showed W=210 was too weak and the primorial ladder was the right
stress test.

Why it could be a line: this is the first gap-moment candidate whose first
picture is already a residual after a strong local-admissibility null. If the
remaining real residual is stable while independent high-primorial fake labels
center at zero, it could be a prime-specific gap regularity below the local
sieve layer.

Preregistered confirmation: after subtracting the `W=9,699,690` baseline,
real residuals are flat and materially separated from independent
high-primorial fake controls; increasing to the next primorials
`223,092,870` and `6,469,693,230` does not erase the residual.

Preregistered break: the residual shrinks or moves monotonically as W grows, or
independent high-primorial controls show comparable residuals. Then the line is
still a finite-local-sieve underfit, not a critical line.

### SEE IT

For the app-scale residual picture, used the five-seed `W=9,699,690` baseline
at `N=200,000`, approximately `0.61457`.

App spec:

```json
{"domain":"int","N":200000,"ex":"n","ey":"gapz2mean(n)-0.61457"}
```

Metrics:

```json
{"linearity":0.6561581747329487,"flatness":0.6887964925463056,"zeroCrossings":0,"monotonicity":-0.46315965078129345,"yMin":-0.61457,"yMax":-0.016385412597456073}
```

Shot:

`logs/playground-artifacts/gapz2res-9m-200k.png`

Link:

`http://localhost:5173/#v=eyJtb2RlIjoibGFiIiwibGFiIjp7ImRvbWFpbiI6ImludCIsIk4iOjIwMDAwMCwidE1heCI6NjAsInNNYXgiOjEuNiwiZXgiOiJuIiwiZXkiOiJnYXB6Mm1lYW4obiktMC42MTQ1NyIsImVoIjoiIiwiZXciOiJzIiwiYSI6MC41LCJiIjoyLjM5OX19`

Visual read: the residual is still one-sided and drifting rather than a
centered zero line. It is thin only because the plotting scale compresses the
early transient.

### GROUND IT

Audit script:

`node scripts/gapz2res-primorial-audit.mjs 16000000 logs/playground-artifacts`

Artifacts:

- `logs/playground-artifacts/gapz2res-primorial-audit-16000000.json`
- `logs/playground-artifacts/gapz2res-primorial-audit-16000000.md`
- `logs/playground-artifacts/gapz2res-primorial-audit-16000000.svg`

Last endpoint summary:

| W | W/phi(W) | baseline mean at 16,000,000 | real-baseline residual | seed baseline range |
| ---: | ---: | ---: | ---: | ---: |
| 9,699,690 | 5.847132 | 0.71255831 | -0.01962302 | 0.71095543..0.71435455 |
| 223,092,870 | 6.112911 | 0.70951905 | -0.01658375 | 0.70767477..0.71091125 |
| 6,469,693,230 | 6.331229 | 0.70731701 | -0.01438172 | 0.70648369..0.70866909 |

Residual paths:

| W | residual at 1e6 | residual at 2e6 | residual at 4e6 | residual at 8e6 | residual at 16e6 |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 9,699,690 | -0.02484050 | -0.01630198 | -0.01605712 | -0.01741031 | -0.01962302 |
| 223,092,870 | -0.01861275 | -0.01237787 | -0.01243466 | -0.01443198 | -0.01658375 |
| 6,469,693,230 | -0.01623945 | -0.01073808 | -0.01073656 | -0.01195317 | -0.01438172 |

### BREAK

GRAVEYARD verdict: finite local-sieve underfit. The high-primorial residual is
not a critical line.

How it broke:

1. Subtracting a high-primorial baseline makes a residual, but it is not
   centered and not stable across the baseline family.
2. Increasing `W` from `9,699,690` to `6,469,693,230` shrinks the last-endpoint
   residual from `-0.01962302` to `-0.01438172`.
3. The shrinkage happens at every endpoint, not just at `16e6`. This is exactly
   the preregistered break: the baseline is still changing in the direction of
   the real data as more local prime obstructions are included.
4. Therefore the apparent residual is not yet a prime-specific regularity; it
   is unresolved singular-series/local-admissibility mass left over after a
   finite primorial truncation.

CONNECTION: this is the residual version of Cycle 10, and it sharpens the
lesson rather than reversing it. A scalar gap-moment residual must subtract a
limiting singular-series baseline, not just a large finite wheel, before it can
be treated as a candidate line.

### LEARN

When a local-null ladder moves monotonically toward the real statistic, the
honest next object is the limiting baseline itself. Finite high-primorial
subtraction is a calibration tool, not a discovery layer.

## HANDOFF 10

Status: no survivor; eleven graveyard/calibration entries in this ledger.

New code since the previous handoff:

- reproducible audit script `scripts/gapz2res-primorial-audit.mjs`

No new lab primitive was added in Cycle 11.

Next cycle suggestion:

Move off scalar gap moments unless you implement a true singular-series
baseline first. The sharper path is two-universes: pick a statistic that can be
measured in both integer and function-field worlds, subtract each world's local
baseline before plotting, and only then ask whether a residual line remains.

## Cycle 12 — squarefree prime-predecessor density

### HALLUCINATE

Guess:

`psqprevmean(x)=mean_{p<=x} mu(p-1)^2`, the running squarefree rate of prime
predecessors.

Why it could be a line: this is non-gap, non-cumulative-log-mass arithmetic.
The obstruction `q^2 | p-1` is a clean local congruence condition
`p == 1 mod q^2`; if primes distribute evenly among reduced residue classes,
the rate should flatten near the Euler product
`A = product_q (1 - 1/(q(q-1)))` (Artin's constant). A residual beating
Cramer and composite controls would point to prime-specific regularity in
shifted multiplicative structure, not gap geometry.

Preregistered confirmation: `psqprevmean(x)` is a stable flat line whose
count residual relative to `A*pi(x)` has materially smaller scale than five
Cramer and W=210 fake/composite controls.

Preregistered break: the flat line is explained by the local congruence Euler
product and reproduced by fake labels or composite controls. Then it is a
known shifted-prime squarefree-density calibration, not a critical line.

### SEE IT

Added lab primitive:

`psqprevmean(n)=mean_{p<=n} mu(p-1)^2`.

Hand tests:

`npm test -- tests/prime-predecessor.test.js`

App spec:

```json
{"domain":"int","N":200000,"ex":"n","ey":"psqprevmean(n)"}
```

Metrics:

```json
{"linearity":0.10747392988526559,"flatness":0.01738244215836242,"zeroCrossings":0,"monotonicity":-0.24840126786409386,"yMin":0,"yMax":1}
```

Shot:

`logs/playground-artifacts/psqprevmean-200k.png`

Link:

`http://localhost:5173/#v=eyJtb2RlIjoibGFiIiwibGFiIjp7ImRvbWFpbiI6ImludCIsIk4iOjIwMDAwMCwidE1heCI6NjAsInNNYXgiOjEuNiwiZXgiOiJuIiwiZXkiOiJwc3FwcmV2bWVhbihuKSIsImVoIjoiIiwiZXciOiJzIiwiYSI6MC41LCJiIjoyLjM5OX19`

Visual read: extremely flat after the small-prime transient. This is exactly
the kind of line that can be mistaken for a new critical line without a local
Euler-product check.

### GROUND IT

Audit script:

`node scripts/psqprevmean-audit.mjs 16000000 logs/playground-artifacts`

Artifacts:

- `logs/playground-artifacts/psqprevmean-audit-16000000.json`
- `logs/playground-artifacts/psqprevmean-audit-16000000.md`
- `logs/playground-artifacts/psqprevmean-audit-16000000.svg`

Artin/local-congruence product used as main term:

`A=0.373955838964`.

Real endpoint means:

| N | labels | squarefree | mean | residual vs A*labels | residual/sqrt(labels) |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 1,000,000 | 78,498 | 29,397 | 0.37449362 | 42.215 | 0.150672 |
| 2,000,000 | 148,933 | 55,778 | 0.37451740 | 83.635 | 0.216717 |
| 4,000,000 | 283,146 | 105,993 | 0.37434045 | 108.900 | 0.204655 |
| 8,000,000 | 539,777 | 202,013 | 0.37425270 | 160.239 | 0.218103 |
| 16,000,000 | 1,031,130 | 385,704 | 0.37405953 | 106.916 | 0.105289 |

Real endpoint max-residual exponent: `theta=0.478687`.

Control summary at `N=16,000,000`:

| group | mean range | residual/sqrt(labels) range | theta range |
| --- | ---: | ---: | ---: |
| ordinary Cramer, 5 seeds | 0.37925309 .. 0.38055166 | 5.380302 .. 6.696463 | 0.874052 .. 1.026554 |
| W=210 fake labels, 5 seeds | 0.37428438 .. 0.37525331 | 0.333809 .. 1.317334 | 0.512762 .. 0.937705 |
| W=210 composite-only, 5 seeds | 0.37424201 .. 0.37573187 | 0.246333 .. 1.527329 | 0.231962 .. 0.729805 |

### BREAK

GRAVEYARD verdict: known local-congruence squarefree-density line, not a new
critical line.

How it broke:

1. The line is real and very sharp: the mean at `16e6` is `0.37405953`, within
   `0.00010369` of the Artin product.
2. The real count residual is square-root scale over these endpoints
   (`theta=0.478687`), so the picture has genuine arithmetic cancellation.
3. But the main term is exactly the local congruence Euler product:
   for each prime `q`, exclude `p == 1 mod q^2`, giving factor
   `1 - 1/(q(q-1))`.
4. Composite-only W=210 controls do not fail the flat line. They reproduce the
   same level (`0.37424201..0.37573187`) and square-root-scale residuals. This
   violates the prime-specific survivor condition.

CONNECTION: this is the multiplicative analogue of the rough-gap and gap-moment
calibrations. A flat line can be arithmetically meaningful but still belong to
the local sieve/Euler-product layer rather than to RH-grade prime residuals.
It also contrasts with the Chebyshev funnel entries: here the failure is not
`theta/psi`, but a known shifted-prime local-density theorem.

### LEARN

Non-gap arithmetic statistics need the same control discipline as gaps.
If a line is a product of local congruence exclusions and composite controls
reproduce it, the right classification is known local-sieve calibration, even
when the real primes have the prettiest residual constant.

## HANDOFF 11

Status: no survivor; twelve graveyard/calibration entries in this ledger.

New code since the previous handoff:

- lab primitive `psqprevmean(n)` in `src/core/math.js` and `src/core/engine.js`
- hand tests in `tests/prime-predecessor.test.js`
- reproducible audit script `scripts/psqprevmean-audit.mjs`

Next cycle suggestion:

Try the two-universes route directly. A promising compact target is a
coordinate-free multiplicative statistic with known local factors in both
worlds, then subtract the local product before plotting. Avoid raw local-density
lines; they will flatten for theorem-level reasons but will not be critical
lines.

## Cycle 13 — two-universes squarefree-shift residual

### HALLUCINATE

Guess:

`SqShift_U = mean_{prime objects a in U} mu(a-1)^2 - A_U`, compared across
`U = Z` and `U = F_q[t]`. The integer side is
`mean_{p<=x}mu(p-1)^2 - prod_l(1-1/(l(l-1)))`; the function-field side is
`mean_{f irreducible, deg f=n}mu(f-1)^2 - prod_{deg P<=n/2}(1-1/(|P|^2-|P|))`.

Why it could be a line: Cycle 12 found a beautiful local-density line but
only in `Z`. The two-universes version subtracts the local Euler product in
each world and asks whether the remaining scaled residual is a shared
coordinate-free law for shifted prime objects. If anything survives here, it
would be a residual after theorem-level local calibration rather than the raw
Euler-product density.

Preregistered confirmation: after local-product subtraction, the scaled
residuals `sqrt(labels)*(observed-A_U)` are stable across growing integer
ranges and across increasing function-field degrees, with real prime objects
separated from at least five fake/composite controls in their own universe.

Preregistered break: the residual is small/noisy, depends strongly on the
chosen universe or finite cutoff, or is reproduced by fake/composite controls.
Then the object is still a local Euler-product calibration, not a critical
line.

### SEE IT

No new lab primitive was needed on the integer projection; Cycle 12 already
added `psqprevmean(n)`.

App spec:

```json
{"domain":"int","N":200000,"ex":"n","ey":"psqprevmean(n)-0.373955838964"}
```

Metrics:

```json
{"linearity":0.10747392995786054,"flatness":2.0033702971297984,"zeroCrossings":1,"monotonicity":-0.24840126786409386,"yMin":-0.373955838964,"yMax":0.626044161036}
```

Shot:

`logs/playground-artifacts/two-universe-sqshift-int-residual-200k.png`

Link:

`http://localhost:5173/#v=eyJtb2RlIjoibGFiIiwibGFiIjp7ImRvbWFpbiI6ImludCIsIk4iOjIwMDAwMCwidE1heCI6NjAsInNNYXgiOjEuNiwiZXgiOiJwc3FwcmV2bWVhbihuKS0wLjM3Mzk1NTgzODk2NCIsImVoIjoiIiwiZXciOiJzIiwiYSI6MC41LCJiIjoyLjM5OX19`

Visual read: the residual projection renders as an almost perfectly horizontal
line at app scale, but this is mostly the early endpoint/transient being
compressed into one thin trace. The scalar metrics already warn that the
unscaled residual view is not the correct judge.

### GROUND IT

Audit script:

`node scripts/sqshift-two-universes-audit.mjs 16000000 logs/playground-artifacts`

Artifacts:

- `logs/playground-artifacts/sqshift-two-universes-audit-16000000.json`
- `logs/playground-artifacts/sqshift-two-universes-audit-16000000.md`
- `logs/playground-artifacts/sqshift-two-universes-audit-16000000.svg`
- `logs/playground-artifacts/sqshift-two-universes-audit-16000000.png`

Integer side, using the finite Artin product through primes `l<=sqrt(x)`:

| N | labels | squarefree | finite product | mean | residual/sqrt(labels) | binomial z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1,000,000 | 78,498 | 29,397 | 0.374003330406 | 0.37449362 | 0.137366 | 0.284 |
| 2,000,000 | 148,933 | 55,778 | 0.373988418651 | 0.37451740 | 0.204144 | 0.422 |
| 4,000,000 | 283,146 | 105,993 | 0.373977626866 | 0.37434045 | 0.193062 | 0.399 |
| 8,000,000 | 539,777 | 202,013 | 0.373970562284 | 0.37425270 | 0.207286 | 0.428 |
| 16,000,000 | 1,031,130 | 385,704 | 0.373965934633 | 0.37405953 | 0.095038 | 0.196 |

Integer residual exponent versus labels: `theta=0.387320`.

Integer controls at `N=16,000,000`:

| group | mean range | residual/sqrt(labels) range | binomial z range | theta range |
| --- | ---: | ---: | ---: | ---: |
| ordinary Cramer | 0.37925309 .. 0.38055166 | 5.370049 .. 6.686213 | 11.098 .. 13.819 | 0.943346 .. 1.107014 |
| W=210 fake labels | 0.37428438 .. 0.37525331 | 0.323551 .. 1.307084 | 0.669 .. 2.701 | 0.424057 .. 1.023305 |
| W=210 composite-only | 0.37424201 .. 0.37573187 | 0.237643 .. 1.518647 | 0.491 .. 3.139 | 0.157349 .. 1.000459 |

Function-field side, using
`prod_{deg P<=floor(n/2)}(1-1/(|P|^2-|P|))`:

| universe | degree/range | final labels | final product | final mean | final residual/sqrt(labels) | residual exponent |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `F_2[t]` | 20..24 | 698,870 | 0.216083042707 | 0.21625481 | 0.143596 | 0.639064 |
| `F_3[t]` | 11..15 | 956,576 | 0.546508394861 | 0.54662149 | 0.110614 | 0.228272 |

Detailed function-field rows:

| universe | degree | residual/sqrt(labels) | binomial z |
| --- | ---: | ---: | ---: |
| `F_2[t]` | 20 | -0.067769 | -0.165 |
| `F_2[t]` | 21 | -0.085470 | -0.208 |
| `F_2[t]` | 22 | 0.041329 | 0.100 |
| `F_2[t]` | 23 | 0.046672 | 0.113 |
| `F_2[t]` | 24 | 0.143596 | 0.349 |
| `F_3[t]` | 11 | -0.247984 | -0.498 |
| `F_3[t]` | 12 | 0.522250 | 1.049 |
| `F_3[t]` | 13 | -0.186076 | -0.374 |
| `F_3[t]` | 14 | 0.164498 | 0.330 |
| `F_3[t]` | 15 | 0.110614 | 0.222 |

Final-degree function-field controls fail in the expected direction: random
monic and random reducible labels have squarefree-shift means near `1-1/q`
(`0.50` for `F_2`, `0.67` for `F_3`) rather than the irreducible-conditioned
local products (`0.216` and `0.546`). Their residual z-scores versus the
irreducible local products are hundreds of sigma, so they are not matched
controls for this theorem-level local condition.

### BREAK

GRAVEYARD verdict: two-universes local Euler-product calibration, not a new
critical line.

How it broke:

1. The local main terms explain the lines in both universes. For integers, the
   finite Artin product gives endpoint z `0.196`; for `F_2[t]` and `F_3[t]`,
   the finite polynomial Euler products give final z `0.349` and `0.222`.
2. The residual path is not a stable shared line. The signs flip across
   degrees in both function-field rows, and fitted exponents disagree:
   `0.387` for `Z`, `0.639` for `F_2[t]`, `0.228` for `F_3[t]`.
3. The superficially similar final scaled residuals (`0.095`, `0.144`,
   `0.111`) are sub-binomial-z noise, not a law.
4. Integer W=210 fake and composite-only controls reproduce the raw local
   density at the same scale as, or larger scale than, real primes. Function
   field random monic/reducible controls are not local-product matched; their
   failure only confirms that irreducible conditioning changes the local
   factors.

CONNECTION: this is Cycle 12 transported into the two-universes frame. The
transport works as calibration, not as discovery: shifted squarefreeness is a
clean local-factor statistic in both worlds, and subtracting the right finite
product leaves ordinary small residuals rather than RH-grade prime
regularity.

### LEARN

The two-universes route should avoid statistics whose entire content is already
the local product. A useful next guess needs a local-product-normalized object
where the residual itself has structure, not just "irreducibles differ from
random monics."

## HANDOFF 12

Status: no survivor; thirteen graveyard/calibration entries in this ledger.

New code since the previous handoff:

- reproducible audit script `scripts/sqshift-two-universes-audit.mjs`

No new lab primitive was added in Cycle 13.

Next cycle suggestion:

Stay in two universes, but use a conditioned residual rather than a raw local
density. One compact guess: for shifted squarefree prime objects, condition on
the least square obstruction being absent up to a small intrinsic cutoff, then
measure whether the remaining large-factor squarefree failures correlate with
the next gap. That couples multiplicative structure to a nonlocal statistic
without immediately collapsing to a pure Euler product.

## Cycle 14 — squarefree-tail gap covariance

### HALLUCINATE

Guess:

`sqtailgapcov(x)=mean(((mu(p-1)^2)-A_tail)*(gap(p)/log(p)-1))` over primes
`p<=x` whose predecessor has no `2^2,3^2,5^2,7^2` divisor. Here
`A_tail = A / prod_{q in {2,3,5,7}}(1-1/(q(q-1)))`, so the local square
obstructions up to `7^2` are conditioned away before the gap covariance is
measured.

Why it could be a line: Cycle 13 killed pure squarefree-shift density after
local-product subtraction. This object asks a sharper question: after removing
the small local square obstructions, do the remaining large-square obstructions
predict whether the next prime gap is above or below its local logarithmic
scale? A stable nonzero flat line would couple multiplicative shifted-prime
structure to gap regularity without being only the Euler product.

Preregistered confirmation: `sqtailgapcov(x)` is a stable flat nonzero line
whose effect size is separated from five Cramer seeds, five W=210 fake-label
controls, and five W=210 composite-only controls across growing ranges.

Preregistered break: the line is near zero/noisy, unstable across range, or
reproduced by the fake/composite controls. Then the statistic is either
ordinary large-square rarity noise or local residue/gap geometry, not a new
critical line.

### SEE IT

Added lab primitive:

`sqtailgapcov(n)=mean(((mu(p-1)^2)-A_tail)*(gap(p)/log(p)-1))`, restricted to
primes `p<=n` with no `2^2,3^2,5^2,7^2` divisor in `p-1`.

Hand tests:

`npm test -- tests/prime-predecessor.test.js` -> 16 passed.

App spec:

```json
{"domain":"int","N":200000,"ex":"n","ey":"sqtailgapcov(n)"}
```

Metrics:

```json
{"linearity":0.3949043263668935,"flatness":0.4624959464653152,"zeroCrossings":0,"monotonicity":-0.28954538935895596,"yMin":0,"yMax":0.024909160693448857}
```

Shot:

`logs/playground-artifacts/sqtailgapcov-200k.png`

Link:

`http://localhost:5173/#v=eyJtb2RlIjoibGFiIiwibGFiIjp7ImRvbWFpbiI6ImludCIsIk4iOjIwMDAwMCwidE1heCI6NjAsInNNYXgiOjEuNiwiZXgiOiJzcXRhaWxnYXBjb3YobikiLCJlaCI6IiIsImV3IjoicyIsImEiOjAuNSwiYiI6Mi4zOTl9fQ`

Visual read: the app-scale trace looks like a very sharp horizontal line. The
numeric range is tiny, so the audit has to decide whether this is cancellation
or just a small covariance mean.

### GROUND IT

Audit script:

`node scripts/sqtailgapcov-audit.mjs 16000000 logs/playground-artifacts`

Artifacts:

- `logs/playground-artifacts/sqtailgapcov-audit-16000000.json`
- `logs/playground-artifacts/sqtailgapcov-audit-16000000.md`
- `logs/playground-artifacts/sqtailgapcov-audit-16000000.svg`
- `logs/playground-artifacts/sqtailgapcov-audit-16000000.png`

Tail expectation after removing square obstructions up to `7^2`:

`A_tail=0.967772748847`.

Real primes:

| N | clean labels | large-square failures | fail rate | mean covariance | z | fail-pass gap mean diff |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1,000,000 | 30,382 | 985 | 0.032421 | 0.00022568 | 0.278 | -0.007158 |
| 2,000,000 | 57,621 | 1,843 | 0.031985 | 0.00007725 | 0.131 | -0.002553 |
| 4,000,000 | 109,518 | 3,525 | 0.032186 | 0.00004417 | 0.102 | -0.001425 |
| 8,000,000 | 208,720 | 6,707 | 0.032134 | 0.00015441 | 0.489 | -0.004982 |
| 16,000,000 | 398,620 | 12,916 | 0.032402 | 0.00010325 | 0.444 | -0.003263 |

Real cumulative-sum exponent versus clean-label count:

`theta=0.865526`.

Control summary at `N=16,000,000`:

| group | mean range | z range | fail-rate range | gap mean diff range | theta range |
| --- | ---: | ---: | ---: | ---: | ---: |
| ordinary Cramer | -0.00036025 .. 0.00029908 | -1.482 .. 1.243 | 0.030036 .. 0.030630 | -0.010605 .. 0.011483 | 0.319270 .. 0.872898 |
| W=210 fake labels | -0.00065526 .. 0.00043164 | -2.741 .. 1.903 | 0.030326 .. 0.030606 | -0.014924 .. 0.021819 | 0.619510 .. 1.864463 |
| W=210 composite-only | 0.00048071 .. 0.00188835 | 1.114 .. 4.694 | 0.029393 .. 0.029820 | -0.027621 .. 0.017027 | 0.681427 .. 1.019753 |

### BREAK

GRAVEYARD verdict: large-square tail/gap covariance is noise/local geometry,
not a critical line.

How it broke:

1. The real line is visually flat, but the effect is not statistically
   meaningful: endpoint z is only `0.444`.
2. The range path is not stable. The mean drops from `0.00022568` to
   `0.00004417`, then rises to `0.00015441`, then drops again.
3. Controls match or exceed the real effect. W=210 fake labels reach z
   `-2.741..1.903`, and W=210 composite-only controls reach positive z
   `1.114..4.694`, while the real z is `0.444`.
4. The large-square failure rate itself is ordinary local-tail density:
   real `0.032402` is in the expected `1-A_tail` range and not separated from
   the control fail rates.

CONNECTION: this is the first conditioned residual after the squarefree-density
and two-universes squarefree-shift calibrations. It shows that coupling the
post-local squarefree tail to the next gap does not by itself create a
prime-specific residual; the signal is smaller than local/random label noise.

### LEARN

Conditioning away the small local product is necessary but not sufficient.
If the post-product residual is a rare-event tag, multiplying it by a scalar
gap feature can easily produce a flat zero line. The next gap-coupled guess
needs either a stronger matched local baseline or a statistic with more
samples per object than a rare large-square failure.

## HANDOFF 13

Status: no survivor; fourteen graveyard/calibration entries in this ledger.

New code since the previous handoff:

- lab primitive `sqtailgapcov(n)` in `src/core/math.js` and `src/core/engine.js`
- hand tests in `tests/prime-predecessor.test.js`
- reproducible audit script `scripts/sqtailgapcov-audit.mjs`

Next cycle suggestion:

Try a non-rare conditioned statistic. A compact candidate is a blockwise
rank-correlation between normalized gap size and a smooth shifted-predecessor
feature such as `omega(p-1)-E[omega(n)|local residues]`, using residue-matched
composite controls from the start. Avoid binary rare-event tails unless the
expected count per range is large enough to give meaningful power.

## Cycle 15 — omega-predecessor gap covariance

### HALLUCINATE

Guess:

`oprevgapcov(x)=mean((omega(p-1)-log(log(p)))*(gap(p)/log(p)-1))` over primes
`3<=p<=x`. The audit version sharpens the centering to
`omega(p-1)-E[omega(label-1)|label mod 210]` at each endpoint.

Why it could be a line: unlike the large-square tail, `omega(p-1)` is a
non-rare smooth shifted-predecessor feature. If prime gaps are affected by
the multiplicative roughness of the previous integer after small residue
classes are accounted for, this covariance could flatten to a stable nonzero
level. This is explicitly not cumulative `psi`/`M`, and the residue-class
centering is meant to attack the local geometry failure mode up front.

Preregistered confirmation: the real residue-centered covariance is stable
across growing ranges and separated from five Cramer seeds, five W=210
fake-label controls, and five residue-count-matched composite controls. A
survivor must remain after block/endpoint checks, not just endpoint z.

Preregistered break: the mean is unstable or near zero, or the same covariance
appears in W=210/composite controls. Then the line is local residue/gap
geometry or ordinary Erdos-Kac fluctuation, not a critical line.

### SEE IT

Added lab primitive:

`oprevgapcov(n)=mean((omega(p-1)-log(log(p)))*(gap(p)/log(p)-1))` over primes
`3<=p<=n`.

Hand tests:

`npm test -- tests/prime-predecessor.test.js` -> 18 passed.

App spec:

```json
{"domain":"int","N":200000,"ex":"n","ey":"oprevgapcov(n)"}
```

Metrics:

```json
{"linearity":0.3545569743668069,"flatness":0.4969202615653288,"zeroCrossings":0,"monotonicity":-0.22778333889445002,"yMin":0,"yMax":0.7596493072511047}
```

Shot:

`logs/playground-artifacts/oprevgapcov-200k.png`

Link:

`http://localhost:5173/#v=eyJtb2RlIjoibGFiIiwibGFiIjp7ImRvbWFpbiI6ImludCIsIk4iOjIwMDAwMCwidE1heCI6NjAsInNNYXgiOjEuNiwiZXgiOiJvcHJldmdhcGNvdihuKSIsImVoIjoiIiwiZXciOiJzIiwiYSI6MC41LCJiIjoyLjM5OX19`

Visual read: another thin horizontal trace. The crude `log(log(p))` centered
version looks line-like, but the real test is the mod-210 residue-centered
audit.

### GROUND IT

Audit script:

`node scripts/oprevgapcov-audit.mjs 16000000 logs/playground-artifacts`

Artifacts:

- `logs/playground-artifacts/oprevgapcov-audit-16000000.json`
- `logs/playground-artifacts/oprevgapcov-audit-16000000.md`
- `logs/playground-artifacts/oprevgapcov-audit-16000000.svg`
- `logs/playground-artifacts/oprevgapcov-audit-16000000.png`

The audit statistic is

`mean((omega(label-1)-E[omega(label-1)|label mod 210])*(gap/log(label)-1))`.

Real primes:

| N | events | covariance mean | Pearson r | z=r*sqrt(events) |
| ---: | ---: | ---: | ---: | ---: |
| 1,000,000 | 78,452 | -0.00397095 | -0.00802167 | -2.247 |
| 2,000,000 | 148,887 | -0.00430237 | -0.00823304 | -3.177 |
| 4,000,000 | 283,100 | -0.00406771 | -0.00744599 | -3.962 |
| 8,000,000 | 539,731 | -0.00355370 | -0.00625985 | -4.599 |
| 16,000,000 | 1,031,083 | -0.00440152 | -0.00747481 | -7.590 |

Control summary at `N=16,000,000`:

| group | covariance range | r range | z range | full path covariance range |
| --- | ---: | ---: | ---: | ---: |
| ordinary Cramer | -0.00036835 .. 0.00088855 | -0.00058248 .. 0.00140943 | -0.592 .. 1.433 | -0.00167464 .. 0.00143475 |
| W=210 fake labels | -0.00104935 .. 0.00081133 | -0.00174168 .. 0.00134479 | -1.770 .. 1.366 | -0.00134396 .. 0.00129432 |
| residue-count-matched composite | -0.00739640 .. -0.00538802 | -0.01214717 .. -0.00885713 | -12.335 .. -8.994 | -0.02137599 .. -0.00538802 |

### BREAK

GRAVEYARD verdict: not a critical line. The real negative covariance is
local/composite geometry, not prime-specific gap regularity.

How it broke:

1. Real primes do show a stable-looking negative residue-centered covariance:
   endpoint `r=-0.00747481`, z `-7.590`.
2. Ordinary Cramer and independent W=210 fake labels do not reproduce it, but
   they are under-controls for this statistic.
3. The decisive residue-count-matched composite controls reproduce and exceed
   the effect: covariance range `-0.00739640..-0.00538802`, z
   `-12.335..-8.994`, versus real covariance `-0.00440152`, z `-7.590`.
4. Therefore the covariance is tied to arithmetic spacing among residue-matched
   composite labels and shifted predecessor factor structure, not to primality
   itself.

CONNECTION: this is the non-rare version of the squarefree-tail gap covariance
branch. It also repeats the QR-gap and transition-audit lesson: ordinary
Cramer and simple wheel controls can under-control residue-position effects;
residue-count-matched composite controls are the right breaker for
conditional gap/predecessor-feature statistics.

### LEARN

Smooth predecessor features have enough power to reveal a real-looking
negative covariance, but that power cuts both ways: it also exposes composite
geometry. The next attempt should subtract a matched composite baseline before
plotting, not merely use it as a final control.

## HANDOFF 14

Status: no survivor; fifteen graveyard/calibration entries in this ledger.

New code since the previous handoff:

- lab primitive `oprevgapcov(n)` in `src/core/math.js` and `src/core/engine.js`
- hand tests in `tests/prime-predecessor.test.js`
- reproducible audit script `scripts/oprevgapcov-audit.mjs`

Next cycle suggestion:

Try the residual object directly:
`oprevgapcov_real(x) - mean(oprevgapcov_residue_matched_composite_seed(x))`
across endpoints and blocks. If the residual is not stable after subtracting
the composite baseline, close the predecessor-feature/gap covariance branch.

## Cycle 16 — composite-subtracted omega-predecessor gap residual

### HALLUCINATE

Guess:

`Ores(x)=C_real(x)-mean_s C_composite_s(x)`, where `C` is the mod-210
residue-centered covariance
`mean((omega(label-1)-E[omega(label-1)|label mod 210])*(gap/log(label)-1))`,
and `composite_s` are residue-count-matched composite label sequences.

Why it could be a line: Cycle 15 found a real negative covariance, then broke
it because residue-matched composites were even more negative. The only
remaining hope is not the raw covariance but the residual: perhaps primes sit
at a stable offset above the composite geometric baseline. If that offset is
flat across endpoints and fresh dyadic blocks, it could be a prime-specific
regularity below the local/composite layer.

Preregistered confirmation: `Ores(x)` is stable across cumulative endpoints
and same-sign on dyadic blocks, with magnitude separated from the five
composite-seed spread and from ordinary fake-label noise.

Preregistered break: the residual drifts, changes sign on blocks, or is
comparable to the composite-seed spread. Then the predecessor-feature/gap
covariance branch is closed as composite geometry plus sampling noise.

### SEE IT

No new lab primitive was needed. The app-scale projection used the existing
`oprevgapcov(n)` primitive plus a rough composite-baseline shift from Cycle 15:

```json
{"domain":"int","N":200000,"ex":"n","ey":"oprevgapcov(n)+0.0064"}
```

Metrics:

```json
{"linearity":0.3545569743661871,"flatness":0.40534921289725356,"zeroCrossings":0,"monotonicity":-0.22778333889445002,"yMin":0.0064,"yMax":0.7660493072511046}
```

Shot:

`logs/playground-artifacts/oprevgapres-projection-200k.png`

Link:

`http://localhost:5173/#v=eyJtb2RlIjoibGFiIiwibGFiIjp7ImRvbWFpbiI6ImludCIsIk4iOjIwMDAwMCwidE1heCI6NjAsInNNYXgiOjEuNiwiZXgiOiJvcHJldmdhcGNvdihuKSswLjAwNjQiLCJlaCI6IiIsImV3IjoicyIsImEiOjAuNSwiYiI6Mi4zOTl9fQ`

Visual read: the shifted app projection is again a thin line, but it is only a
rough projection. The real object must subtract the matched composite baseline
endpoint by endpoint.

### GROUND IT

Audit script:

`node scripts/oprevgapres-audit.mjs 16000000 logs/playground-artifacts`

Artifacts:

- `logs/playground-artifacts/oprevgapres-audit-16000000.json`
- `logs/playground-artifacts/oprevgapres-audit-16000000.md`
- `logs/playground-artifacts/oprevgapres-audit-16000000.svg`
- `logs/playground-artifacts/oprevgapres-audit-16000000.png`

Cumulative residuals:

| endpoint | events | real covariance | composite mean | composite sd | residual | residual / composite sd |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1,000,000 | 78,452 | -0.00397095 | -0.01602751 | 0.00394543 | 0.01205656 | 3.056 |
| 2,000,000 | 148,887 | -0.00430237 | -0.01168323 | 0.00197010 | 0.00738085 | 3.746 |
| 4,000,000 | 283,100 | -0.00406771 | -0.00954154 | 0.00167493 | 0.00547383 | 3.268 |
| 8,000,000 | 539,731 | -0.00355370 | -0.00781775 | 0.00145359 | 0.00426405 | 2.933 |
| 16,000,000 | 1,031,083 | -0.00440152 | -0.00660938 | 0.00080123 | 0.00220786 | 2.756 |

Dyadic block residuals:

| block | events | real covariance | composite mean | composite sd | residual | residual / composite sd |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 0..1,000,000 | 78,452 | -0.00397095 | -0.01602751 | 0.00394543 | 0.01205656 | 3.056 |
| 1,000,000..2,000,000 | 70,435 | -0.00456548 | 0.00302835 | 0.00072310 | -0.00759383 | -10.502 |
| 2,000,000..4,000,000 | 134,213 | -0.00373197 | 0.00103991 | 0.00231760 | -0.00477188 | -2.059 |
| 4,000,000..8,000,000 | 256,631 | -0.00288665 | 0.00103494 | 0.00129666 | -0.00392160 | -3.024 |
| 8,000,000..16,000,000 | 491,352 | -0.00529827 | 0.00062387 | 0.00037527 | -0.00592215 | -15.781 |

Control context at `N=16,000,000`:

| group | covariance range | z range | full path covariance range |
| --- | ---: | ---: | ---: |
| ordinary Cramer | -0.00036835 .. 0.00088855 | -0.592 .. 1.433 | -0.00167464 .. 0.00143475 |
| W=210 fake labels | -0.00104935 .. 0.00081133 | -1.770 .. 1.366 | -0.00134396 .. 0.00129432 |
| residue-matched composite cumulative | -0.00739640 .. -0.00538802 | -12.335 .. -8.994 | -0.02137599 .. -0.00538802 |

### BREAK

GRAVEYARD verdict: residual subtraction does not rescue the
omega-predecessor gap branch. Close the branch.

How it broke:

1. The cumulative residual is positive, but it is not stable: it shrinks from
   `0.01205656` at `1e6` to `0.00220786` at `16e6`.
2. Fresh dyadic blocks contradict the cumulative picture. After the first
   block, every block residual is negative: `-0.00759383`, `-0.00477188`,
   `-0.00392160`, `-0.00592215`.
3. The sign flip is the preregistered break. The apparent cumulative line is
   an early-range baseline transient, not a prime-specific residual law.
4. The residual magnitude is also tied to composite-seed spread; the first
   endpoint residual is only `3.056` composite-sd and then drifts downward
   cumulatively while block residuals swing hard negative.

CONNECTION: this closes the predecessor-feature/gap covariance branch started
by `sqtailgapcov` and `oprevgapcov`. Raw covariance was composite geometry;
subtracting that geometry leaves an unstable endpoint artifact rather than a
critical-line residual.

### LEARN

When the matched control is stronger than the real signal, subtracting it can
create a seductive cumulative residual from baseline drift. Block checks are
mandatory for any future "real minus control" line; endpoint monotonicity alone
is not evidence.

## HANDOFF 15

Status: no survivor; sixteen graveyard/calibration entries in this ledger.

New code since the previous handoff:

- reproducible audit script `scripts/oprevgapres-audit.mjs`

No new lab primitive was added in Cycle 16.

Next cycle suggestion:

Move off predecessor-feature/gap scalar covariances. A sharper next route is a
coordinate-free two-universes statistic with block holdouts from the start, or
a non-scalar residual surface where the matched composite baseline is subtracted
cell-by-cell before any line claim is made.

## Cycle 17 — square-root phase prime residual

### HALLUCINATE

Guess:

`sqrtphaseres(x)=sum_{p<=x} cos(2*pi*sqrt(p)) - integral_2^x cos(2*pi*sqrt(t))/log(t) dt`.

Why it could be a line: this leaves the local residue/composite trap and asks
for cancellation in a nonlocal curved phase. The phase `sqrt(n)` is not a
Dirichlet character, not a residue class, and not a gap or predecessor feature.
The integral subtracts the PNT-density main term, so a surviving residual would
be closer to a prime exponential-sum regularity than to local sieve geometry.
This connects the older Fourier/matrix-stripe theme to the critical-line goal
without using zeta or zeros in the construction.

Preregistered confirmation: after subtracting the integrated density main
term, the residual is a stable flat/oscillatory band whose block scale is
materially smaller for real primes than for ordinary density labels and
local-wheel/composite labels, and whose endpoint path is not just a boundary
term from the deterministic integral.

Preregistered break: the residual is dominated by the phase-integral boundary,
has unstable block signs/scales, or is reproduced by density/local controls.
Then it is ordinary exponential-sum/PNT calibration, not a new critical line.

### SEE IT

New lab primitive:

`sqrtphaseres(n)`.

Focused tests:

`npm test -- tests/prime-predecessor.test.js` passed `20` tests.

App projection:

```json
{"domain":"int","N":200000,"ex":"n","ey":"sqrtphaseres(n)"}
```

Metrics:

```json
{"linearity":0.6123550935338392,"flatness":0.9840463147230878,"zeroCrossings":466,"monotonicity":-0.001055005275026375,"yMin":-74.84784537410933,"yMax":20.898538220969687}
```

Shot:

`logs/playground-artifacts/sqrtphaseres-200k.png`

Link:

`http://localhost:5173/#v=eyJtb2RlIjoibGFiIiwibGFiIjp7ImRvbWFpbiI6ImludCIsIk4iOjIwMDAwMCwidE1heCI6NjAsInNNYXgiOjEuNiwiZXgiOiJuIiwiZXkiOiJzcXJ0cGhhc2VyZXMobikiLCJlaCI6IiIsImV3IjoicyIsImEiOjAuNSwiYiI6Mi4zOTl9fQ`

Visual read: the 200k app plot is a very thin horizontal trace with small blue
oscillatory ticks. It is visually seductive as a flat line, but the residual
range is already broad (`-74.85..20.90`) and the metrics say churn, not a
rigid line.

### GROUND IT

Audit script:

`node scripts/sqrtphase-audit.mjs 16000000 logs/playground-artifacts`

Artifacts:

- `logs/playground-artifacts/sqrtphase-audit-16000000.json`
- `logs/playground-artifacts/sqrtphase-audit-16000000.md`
- `logs/playground-artifacts/sqrtphase-audit-16000000.svg`
- `logs/playground-artifacts/sqrtphase-audit-16000000.png`

The integrated main term was approximated by midpoint intervals, matching the
lab primitive. The real endpoint max-residual exponent fit was
`theta=0.592007`.

Real primes:

| N | labels | phase sum | density main | residual | residual/sqrt(labels) | maxAbs residual/sqrt(labels) |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1,000,000 | 78,498 | -83.600 | -0.394 | -83.206 | -0.296977 | 0.296977 |
| 2,000,000 | 148,933 | -95.203 | 29.821 | -125.024 | -0.323965 | 0.323965 |
| 4,000,000 | 283,146 | -374.625 | -0.394 | -374.230 | -0.703289 | 0.703289 |
| 8,000,000 | 539,777 | -320.723 | 24.639 | -345.362 | -0.470075 | 0.509368 |
| 16,000,000 | 1,031,130 | -184.200 | -0.395 | -183.805 | -0.181009 | 0.368538 |

Real dyadic blocks:

| block | labels | phase sum | density main | residual | residual/sqrt(labels) |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1..1,000,000 | 78,498 | -83.600 | -0.394 | -83.206 | -0.296977 |
| 1,000,000..2,000,000 | 70,435 | -11.604 | 30.215 | -41.818 | -0.157570 |
| 2,000,000..4,000,000 | 134,213 | -279.421 | -30.215 | -249.206 | -0.680239 |
| 4,000,000..8,000,000 | 256,631 | 53.902 | 25.033 | 28.868 | 0.056986 |
| 8,000,000..16,000,000 | 491,353 | 136.523 | -25.034 | 161.557 | 0.230478 |

Control summary at `N=16,000,000`:

| group | residual range | residual/sqrt(labels) range | maxAbs residual/sqrt(labels) range |
| --- | ---: | ---: | ---: |
| ordinary Cramer | -263.285 .. 935.711 | -0.259221 .. 0.921647 | 0.124868 .. 0.921647 |
| W=210 fake labels | -305.594 .. 206.617 | -0.300911 .. 0.203207 | 0.145326 .. 0.416172 |
| W=210 composite-only | -1185.882 .. 604.261 | -1.380295 .. 0.701992 | 0.304359 .. 1.380295 |

Factor/main-term check:

`sqrtphaseres(x)` is not a Chebyshev/von-Mangoldt line and not a Mertens
line. It is a smooth weighted prime-counting residual:

`sum_{p<=x} f(p) - integral f(t)/log(t) dt`

with `f(t)=cos(2*pi*sqrt(t))`. By partial summation, it is a transform of
`pi(t)-Li(t)`, plus a bounded smooth-phase boundary/integral term. So the
right label is PNT/exponential-sum calibration, not a new object outside the
prime-counting residual funnel.

### BREAK

GRAVEYARD verdict: not a new critical line. This is a useful nonlocal
exponential-sum calibration, but it does not survive the audit gate.

How it broke:

1. The real trace is not stable across fresh blocks. The normalized dyadic
   residuals run `-0.296977`, `-0.157570`, `-0.680239`, `0.056986`,
   `0.230478`; the sign flip and the large `2e6..4e6` excursion are the
   preregistered block-instability break.
2. The endpoint looks small at `16e6` (`-0.181009` per sqrt label), but it is
   inside the W=210 fake-label envelope (`-0.300911..0.203207`) and far
   inside the composite-only envelope (`-1.380295..0.701992`).
3. The real max envelope does show better cancellation than the worst ordinary
   Cramer seed and far better than the worst composite seed, but this is not
   separated from the full W=210 control range. It is not the strong
   arithmetic-vs-density contrast from the earlier `~0.7 sqrt(x)` nugget.
4. The factor check says this object is a smooth transform of the PNT residual,
   not a structurally new critical-line route.

CONNECTION: this is the nonlocal cousin of the older Fourier/matrix-stripe
experiments. Curved phase helped escape the local predecessor/gap trap, but it
fell into a different known basin: prime exponential sums after subtracting a
density integral. The lesson is useful: escaping Cramer-shaped guesses is not
enough; the survivor must also separate from wheel-matched labels in fresh
blocks.

### LEARN

Do use Cramer as a falsifier, not as the design target. The better move is to
invent objects whose primary null is structural: two-universe transport,
coordinate-free surfaces, or operator-like statistics. For phase statistics,
the next version should not be a scalar weighted prime count; it should compare
an intrinsic surface of phases across integer primes and function-field
irreducibles, with block holdouts and matched random irreducibles from the
start.

## HANDOFF 16

Status: no survivor; seventeen graveyard/calibration entries in this ledger.

New code since the previous handoff:

- lab primitive `sqrtphaseres(n)` in `src/core/math.js` and
  `src/core/engine.js`
- hand tests in `tests/prime-predecessor.test.js`
- reproducible audit script `scripts/sqrtphase-audit.mjs`

Next cycle suggestion:

Do not keep iterating scalar weighted prime-counting residuals. Hallucinate a
two-universes phase surface instead: map an object to its intrinsic Frobenius
angle/degree-like phase in `F_q[t]` and compare the cell-by-cell residual
surface to integer primes under a coordinate-free normalization. The audit
should subtract the matched random irreducible/composite baseline before
collapsing to any line.

## Cycle 18 — two-universes normalized gap-phase surface

### HALLUCINATE

Guess:

For each universe `U`, form the surface

`S_U(d,j)=mean_{objects in block d} exp(2*pi*i*j*gap/meanGap_d)`

for harmonics `j=1..8`, subtract the matched random-label baseline
cell-by-cell, then collapse only the residual surface norm:

`PhaseSurf_U(d)=sqrt(sum_j |S_U(d,j)-E_random S_U(d,j)|^2)`.

For integers, `d` is a dyadic window of primes and `gap` is the ordinary
prime gap. For `F_q[t]`, `d` is polynomial degree and `gap` is the encoding
gap among irreducibles of exactly that degree after normalizing by that
degree's mean gap. This is not coordinate-free in the full geometric sense,
but it is less scalar than previous attempts: the line claim is about a
residual surface after baseline subtraction, not a hand-picked endpoint.

Why it could be a line: independent exponential spacings have
`E exp(2*pi*i*j*X)=1/(1-2*pi*i*j)`, so the random-label baseline is not zero.
A real critical-line-like regularity might appear as a stable, low residual
surface norm in both universes after subtracting this baseline. If the
function-field side is lower and flatter while integers share its trend, that
would be a two-universes transport signal rather than a Cramer-shaped scalar
prime-counting residual.

Preregistered confirmation: after cell-wise random-baseline subtraction, the
surface norm is stable across integer dyadic windows and across growing
`F_2[t]`/`F_3[t]` degrees, with both universes materially below their five
random-label controls. The integer line should not be explainable by a single
gap moment or local wheel calibration.

Preregistered break: the surface norm is reproduced by random labels, grows
with degree/range, depends on encoding order, or collapses to the known
normalized-gap distribution/singular-series calibration. Then this is another
spacing-statistic graveyard entry, not a new critical line.

### SEE IT

No new lab primitive was added. The candidate is a cross-universe audit object
implemented in `scripts/gapphase-surface-audit.mjs`.

App views used to inspect the two sides:

```json
{"cfg":{"source":"polyprimes","plane":"matrix","lens":"mono","p":{"q":2,"deg":20,"matW":256}}}
```

Metrics:

```json
{"linearity":0.0000018459429406126448,"flatness":0.610810119300316,"zeroCrossings":0,"monotonicity":-1,"yMin":-0.9998779296875,"yMax":0}
```

Shot:

`logs/playground-artifacts/gapphase-poly-q2-matrix.png`

Link:

`http://localhost:5173/#v=eyJtb2RlIjoicGF0Y2giLCJjZmciOnsic291cmNlIjoicG9seXByaW1lcyIsInBsYW5lIjoibWF0cml4IiwibGVucyI6Im1vbm8iLCJwIjp7InEiOjIsImRlZyI6MjAsIm1hdFciOjI1Nn19LCJjaGlwcyI6eyJ4IjpbXSwieSI6W119LCJyZXNpZHVhbCI6ZmFsc2UsInR3aW5Nb2RlIjoicmVhbCJ9`

Second function-field view:

```json
{"cfg":{"source":"polyprimes","plane":"graph","lens":"pulse","p":{"q":3,"deg":15}}}
```

Metrics:

```json
{"linearity":0.6689516110327697,"flatness":0.06523270520937273,"zeroCrossings":0,"monotonicity":1,"yMin":1,"yMax":15}
```

Shot:

`logs/playground-artifacts/gapphase-poly-q3-graph.png`

Integer gap comparison view:

```json
{"cfg":{"source":"gaps","plane":"graph","lens":"pulse","p":{"N":200000}}}
```

Metrics:

```json
{"linearity":0.011438113917816734,"flatness":0.7856338798885975,"zeroCrossings":0,"monotonicity":0.003486345148169669,"yMin":1,"yMax":86}
```

Shot:

`logs/playground-artifacts/gapphase-integer-gaps-200k.png`

Visual read: the `F_2[t]` matrix view shows hard vertical stripes in coefficient
encoding order. That is already suspicious because the candidate uses
consecutive encoding gaps inside a degree. The audit plot makes the same
failure quantitative: integer residuals sit near the floor, while both
function-field residuals sit high and jagged.

### GROUND IT

Audit script:

`node scripts/gapphase-surface-audit.mjs 16000000 logs/playground-artifacts 24 15`

Artifacts:

- `logs/playground-artifacts/gapphase-surface-audit-16000000.json`
- `logs/playground-artifacts/gapphase-surface-audit-16000000.md`
- `logs/playground-artifacts/gapphase-surface-audit-16000000.svg`
- `logs/playground-artifacts/gapphase-surface-audit-16000000.png`

The primary baseline is W=210 random labels for integers and random monic
labels of the same degree/count for function fields. Composite controls are
W=210 composite-only labels and random reducible monics.

Exponent fits over labels:

| universe | primary norm theta | sqrt-scaled theta |
| --- | ---: | ---: |
| Z | -0.199634 | 0.300369 |
| F_2[t] | 0.027802 | 0.527805 |
| F_3[t] | 0.032903 | 0.532910 |

Integer dyadic blocks:

| block | labels | real vs W210 random | W210 control range | real vs composite | composite control range |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1..1,000,000 | 78,498 | 0.023946 | 0.006856 .. 0.011534 | 0.019290 | 0.006118 .. 0.012551 |
| 1,000,000..2,000,000 | 70,435 | 0.022542 | 0.005150 .. 0.011909 | 0.020489 | 0.005409 .. 0.011546 |
| 2,000,000..4,000,000 | 134,213 | 0.026919 | 0.005478 .. 0.010213 | 0.020745 | 0.005202 .. 0.008766 |
| 4,000,000..8,000,000 | 256,631 | 0.021115 | 0.002945 .. 0.006844 | 0.018466 | 0.003687 .. 0.006149 |
| 8,000,000..16,000,000 | 491,353 | 0.015403 | 0.002738 .. 0.005455 | 0.013770 | 0.002364 .. 0.006637 |

Function-field degree blocks:

| universe | degree | labels | real vs random monic | random control range | real vs reducible | reducible control range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| F_2[t] | 20 | 52,377 | 0.205545 | 0.008772 .. 0.014048 | 0.205942 | 0.011789 .. 0.018297 |
| F_2[t] | 21 | 99,858 | 0.238243 | 0.010036 .. 0.011924 | 0.240422 | 0.008498 .. 0.011906 |
| F_2[t] | 22 | 190,557 | 0.230864 | 0.005560 .. 0.007817 | 0.232508 | 0.006693 .. 0.008573 |
| F_2[t] | 23 | 364,722 | 0.204539 | 0.003497 .. 0.005967 | 0.204023 | 0.004949 .. 0.006881 |
| F_2[t] | 24 | 698,870 | 0.242744 | 0.002879 .. 0.005380 | 0.243633 | 0.003408 .. 0.004858 |
| F_3[t] | 11 | 16,104 | 0.134814 | 0.023003 .. 0.028689 | 0.132034 | 0.020499 .. 0.037519 |
| F_3[t] | 12 | 44,220 | 0.333624 | 0.007461 .. 0.018257 | 0.329980 | 0.011930 .. 0.021070 |
| F_3[t] | 13 | 122,640 | 0.198573 | 0.005296 .. 0.009677 | 0.198420 | 0.006536 .. 0.011982 |
| F_3[t] | 14 | 341,484 | 0.150759 | 0.003587 .. 0.009153 | 0.149688 | 0.004624 .. 0.006564 |
| F_3[t] | 15 | 956,576 | 0.237596 | 0.002510 .. 0.003816 | 0.237028 | 0.003293 .. 0.004174 |

Factor/order check:

The integer side is just a normalized gap-distribution harmonic statistic: it
is a sibling of the earlier gap-moment graveyard, not a new cumulative prime
residual. The function-field side is worse: because it sorts monic polynomials
by coefficient encoding inside each degree, "consecutive gap" is not intrinsic
to `F_q[t]`. The hard matrix stripes show the same coordinate leak visually.

### BREAK

GRAVEYARD verdict: not a critical line. This broke as an ordering artifact plus
gap-distribution calibration.

How it broke:

1. It failed the preregistered two-universes transport check. The integer
   surface norm was small (`0.015403` at the last block), while `F_2[t]` and
   `F_3[t]` were high (`0.242744`, `0.237596`) and jagged rather than shared
   and flat.
2. The function-field residuals were not merely above baseline; they were
   around two orders of magnitude above their matched random/reducible control
   ranges at top degree. For `F_2[t]` degree 24, real-vs-random was `0.242744`
   against random controls `0.002879..0.005380`.
3. The composite/reducible controls did not rescue it. `F_2[t]` degree 24
   real-vs-reducible was `0.243633` against reducible controls
   `0.003408..0.004858`; `F_3[t]` degree 15 real-vs-reducible was `0.237028`
   against `0.003293..0.004174`.
4. The matrix screenshot shows exactly why: coefficient-order vertical stripes
   dominate the polynomial sequence. The statistic depends on lex/encoding
   adjacency, which the project memory already marked as an artifact factory.

CONNECTION: this is the two-universes analogue of the earlier
Kurlberg-Rosenzweig warning. Moving to `F_q[t]` is not automatically
coordinate-free; if the integer-style notion of "next object" is imported via
coefficient encoding, the function-field theorem side becomes an artifact
amplifier rather than a structural null.

### LEARN

The next two-universes attempt must not use consecutive encoding gaps inside
degree. Use an intrinsic group action instead: average over all monic
degree-`d` polynomials and fixed additive shifts `h`, or over residue classes
mod irreducible polynomials, where the coordinates are part of the algebraic
object rather than an ordering. A better hallucination is a shift-correlation
surface `C_U(d,k)=mean_a mu(a)mu(a+h_k)` or irreducible-pair residual over
degree-matched shift families.

## HANDOFF 17

Status: no survivor; eighteen graveyard/calibration entries in this ledger.

New code since the previous handoff:

- reproducible audit script `scripts/gapphase-surface-audit.mjs`

No new lab primitive was added in Cycle 18.

Next cycle suggestion:

Stay in two-universes mode, but replace "consecutive" by intrinsic additive
shift families. Candidate: for `h` in a degree-bounded shift set, compare the
centered irreducible-pair residual surface
`1_{a irreducible}1_{a+h irreducible} - singular_series(h)/d^2` in `F_q[t]`
against an integer admissible-shift surface after Hardy-Littlewood/local-wheel
subtraction. If that is too heavy, start with the Möbius shift surface because
`F_q[t]` has exact Chowla-style calibration.

## Cycle 19 — two-universes Möbius additive-shift energy

### HALLUCINATE

Guess:

For a shift set `H={1,2,3,4,5,6,7,8}`, define the intrinsic shift surface

`C_Z(x,h)=sum_{n<=x-h} mu(n)mu(n+h)`

and

`C_q(d,h)=sum_{f monic deg d} mu(f)mu(f+h)`.

Collapse by the square-root scale:

`E_Z(x)=sqrt(mean_h (C_Z(x,h)/sqrt(x))^2)`,

`E_q(d)=sqrt(mean_h (C_q(d,h)/q^(d/2))^2)`.

Why it could be a line: unlike Cycle 18, this uses an additive group action,
not a coefficient-order successor. The function-field side has real theorem
gravity: Chowla-type cancellation is known there for fixed shifts in large
families. If both universes land on a stable flat energy line, and the
integer line has materially smaller energy than randomized/reducible controls,
this is closer to a transportable critical-line object than a scalar prime
count or gap moment.

Preregistered confirmation: `E_Z(x)` and `E_q(d)` are stable across growing
windows/degrees, have compatible scale after normalization, and beat at least
five sign-shuffle/local controls. The surface should remain small cell-wise,
not only after cancellation across shifts.

Preregistered break: the integer object is just ordinary Chowla/Mertens
calibration with no prime-specific separation; the function-field side is
already exactly-known calibration; the energy is reproduced by randomized
Mobius signs; or the collapse hides unstable shift cells. Then it is a
successful calibration/graveyard entry, not a new critical line.

### SEE IT

New lab primitive:

`muchowla1(n)=sum_{m<n}mu(m)mu(m+1)`.

Focused tests:

`npm test -- tests/prime-predecessor.test.js` passed `22` tests.

App projection:

```json
{"domain":"int","N":200000,"ex":"n","ey":"muchowla1(n)/sqrt(n)"}
```

Metrics:

```json
{"linearity":0.6740590699792484,"flatness":0.6174899078833646,"zeroCrossings":126,"monotonicity":0.5667218128039304,"yMin":-1.3546869736956564,"yMax":0.9211323729436767}
```

Shot:

`logs/playground-artifacts/muchowla1-sqrt-200k.png`

Link:

`http://localhost:5173/#v=eyJtb2RlIjoibGFiIiwibGFiIjp7ImRvbWFpbiI6ImludCIsIk4iOjIwMDAwMCwidE1heCI6NjAsInNNYXgiOjEuNiwiZXgiOiJuIiwiZXkiOiJtdWNob3dsYTEobikvc3FydChuKSIsImVoIjoiIiwiZXciOiJzIiwiYSI6MC41LCJiIjoyLjM5OX19`

Visual read: the h=1 square-root-normalized trace is a thin horizontal band,
but it churns across a roughly random-sign-size range. The flat look is not a
line by itself; it must beat randomized squarefree-sign controls.

### GROUND IT

Audit script:

`node scripts/muchowla-shift-audit.mjs 16000000 logs/playground-artifacts 24 15`

Artifacts:

- `logs/playground-artifacts/muchowla-shift-audit-16000000.json`
- `logs/playground-artifacts/muchowla-shift-audit-16000000.md`
- `logs/playground-artifacts/muchowla-shift-audit-16000000.svg`
- `logs/playground-artifacts/muchowla-shift-audit-16000000.png`

Integer cumulative energy:

| N | energy | maxAbs cell | normalized cells h=1..8 |
| ---: | ---: | ---: | --- |
| 1,000,000 | 0.350572 | 0.526000 | 0.409, -0.383, -0.304, -0.526, 0.161, 0.036, -0.507, 0.126 |
| 2,000,000 | 0.665681 | 1.368252 | 1.368, 0.066, -0.008, -0.648, -0.246, -0.947, -0.432, 0.325 |
| 4,000,000 | 0.637333 | 1.174000 | 1.174, 0.330, 0.177, 0.401, -1.062, -0.546, 0.382, -0.005 |
| 8,000,000 | 0.567022 | 0.961312 | 0.767, 0.379, -0.022, 0.607, -0.362, -0.186, 0.618, 0.961 |
| 16,000,000 | 0.698359 | 1.543250 | 0.548, -0.061, 0.099, 0.117, -0.637, -0.505, 1.543, 0.729 |

Integer exponent over endpoints: `0.175709`.

At `N=16,000,000`, five randomized squarefree-sign controls had energy range
`0.390809..0.795914`. The real integer energy `0.698359` is inside that
control envelope.

Integer dyadic block energy:

| block | energy | random-control energy range |
| --- | ---: | ---: |
| 1..1,000,000 | 0.350572 | 0.313541 .. 0.676185 |
| 1,000,000..2,000,000 | 0.795615 | 0.582821 .. 0.791217 |
| 2,000,000..4,000,000 | 0.745583 | 0.408454 .. 0.660733 |
| 4,000,000..8,000,000 | 0.590403 | 0.506095 .. 0.653013 |
| 8,000,000..16,000,000 | 0.657631 | 0.454025 .. 0.548965 |

Function-field degree energy:

| universe | degree | monics | energy | maxAbs cell | top random-control energy range |
| --- | ---: | ---: | ---: | ---: | ---: |
| F_2[t] | 20 | 1,048,576 | 0.835980 | 1.412109 |  |
| F_2[t] | 21 | 2,097,152 | 0.648499 | 1.135238 |  |
| F_2[t] | 22 | 4,194,304 | 1.189791 | 2.275391 |  |
| F_2[t] | 23 | 8,388,608 | 0.605426 | 1.226388 |  |
| F_2[t] | 24 | 16,777,216 | 0.925378 | 1.924316 | 0.478537 .. 0.969590 |
| F_3[t] | 11 | 177,147 | 0.838918 | 1.532473 |  |
| F_3[t] | 12 | 531,441 | 1.966074 | 2.251029 |  |
| F_3[t] | 13 | 1,594,323 | 1.063014 | 1.786697 |  |
| F_3[t] | 14 | 4,782,969 | 1.006020 | 1.747599 |  |
| F_3[t] | 15 | 14,348,907 | 1.881828 | 2.104543 | 0.271266 .. 0.993709 |

The `F_3[t]` top-degree cells repeat in algebraic classes:

`-0.937, -0.937, -2.105, -2.105, -2.105, -2.105, -2.105, -2.105`.

Factor/theory check:

This is exactly a two-point Möbius/Chowla surface. In `F_q[t]`, the
corresponding cancellation belongs to the known function-field Chowla
calibration territory. Over integers it is an open Chowla-type statistic, not
a new prime residual line. The square-root normalization is the natural random
sign scale, so beating randomized squarefree-sign controls is mandatory.

### BREAK

GRAVEYARD verdict: not a new critical line. This is an honest intrinsic
two-universes calibration, but it does not survive the audit gate as a new
line.

How it broke:

1. The integer energy is not separated from random squarefree-sign controls.
   At `16e6`, real `E_Z=0.698359` sits inside the five-control range
   `0.390809..0.795914`.
2. Fresh integer blocks are not stable winners. Two blocks exceed the small
   five-seed control range by a little (`0.795615` vs top control `0.791217`,
   `0.745583` vs `0.660733`), but the effect is not consistent and the last
   block `0.657631` is again only modestly above its control range
   `0.454025..0.548965`.
3. `F_2[t]` is control-scale: degree 24 energy `0.925378` lies inside the
   random sign-control range `0.478537..0.969590`.
4. `F_3[t]` is not a shared flat line. Degree 15 energy `1.881828` is far
   above controls `0.271266..0.993709`, and the cells collapse into repeated
   shift classes. The surface collapse hides unstable algebraic cells rather
   than revealing a universal line.
5. The theory check labels the whole object as Chowla/Möbius calibration. That
   is valuable, but not a distinct critical-line route.

CONNECTION: this is the intrinsic additive-shift repair of Cycle 18. It fixed
the coefficient-order artifact, but once repaired it landed in known
Chowla-calibration territory. The lesson is narrower and useful: intrinsic
two-universe statistics are viable, but a scalar energy collapse can still
hide individual shift-cell pathologies.

### LEARN

The next attempt should keep the intrinsic shift setup but stop collapsing
opposite-quality cells into one norm. Use a residue/shift family surface with a
per-cell theorem-side baseline and inspect the cell matrix directly. For prime
regularity, the next bolder object should be irreducible-pair or prime-pair
shift residuals with local singular-series subtraction, not Möbius signs alone.

## HANDOFF 18

Status: no survivor; nineteen graveyard/calibration entries in this ledger.

New code since the previous handoff:

- lab primitive `muchowla1(n)` in `src/core/math.js` and `src/core/engine.js`
- hand tests in `tests/prime-predecessor.test.js`
- reproducible audit script `scripts/muchowla-shift-audit.mjs`

Next cycle suggestion:

Try an intrinsic prime-pair shift surface, not a scalar Möbius energy:
`R_U(scale,h)=pair_count_U(h)-local_main_U(h)` over many fixed additive shifts.
For `F_q[t]`, use `twinIrreducibleCounts` and
`polynomialTwinPrediction/singularSeries`; for integers, use admissible shifts
and a finite local product or high-wheel baseline. Plot the residual matrix
cell-by-cell before taking any norm.

## Cycle 20 — two-universes prime-pair shift residual matrix

### HALLUCINATE

Guess:

For admissible fixed shifts `h`, compare prime-pair residual cells

`R_Z(x,h)=(#{n+h<=x: n,n+h prime}-K_W(h) * integral_2^x dt/log(t)^2) / sqrt(main_Z(x,h))`

and

`R_q(d,h)=(#{f monic deg d: f,f+h irreducible}-Pred_q(d,h)) / sqrt(Pred_q(d,h))`.

Then inspect the residual matrix cell-by-cell and only then summarize by

`E_U(scale)=sqrt(mean_h R_U(scale,h)^2)`.

Here `K_W(h)` is a finite-wheel local factor for `W=30030`, and the
function-field prediction uses the existing polynomial twin singular-series
machinery. The integer shifts are even `2..16`; the function-field shifts are
multiples of all linear factors to avoid the characteristic-2 local zero trap.

Why it could be a line: this is the first cycle after the Möbius calibration
branch that directly measures prime-pair regularity rather than prime counts,
gaps, or Möbius signs. It is intrinsic in `F_q[t]` because fixed additive
shifts replace coefficient-order adjacency. If a residual line exists away
from `psi/M`, it might live in the discrepancy between actual pair counts and
local singular-series mass across a small shift family.

Preregistered confirmation: residual cells remain `O(1)` and the energy is
stable across growing integer ranges and function-field degrees, with real
integers materially below Cramer/W-wheel/composite controls and with
`F_2[t]`/`F_3[t]` showing comparable scale after local singular-series
subtraction.

Preregistered break: the surface is only Hardy-Littlewood/singular-series
calibration; integer residuals are reproduced by W-wheel fake labels or
composite labels; function-field cells are jagged or prediction-sensitive; or
the norm hides large cellwise failures. Then this is a useful prime-pair
calibration graveyard, not a new critical line.

### SEE IT

No new lab primitive was added. The app-scale event field used the existing
lab formula:

```json
{"domain":"int","N":200000,"ex":"n","ey":"isprime(n)*isprime(n+2)"}
```

Metrics:

```json
{"linearity":0.0003321778858424493,"flatness":9.57040190251334,"zeroCrossings":0,"monotonicity":0,"yMin":0,"yMax":1}
```

Shot:

`logs/playground-artifacts/primepair-twin-events-200k.png`

Link:

`http://localhost:5173/#v=eyJtb2RlIjoibGFiIiwibGFiIjp7ImRvbWFpbiI6ImludCIsIk4iOjIwMDAwMCwidE1heCI6NjAsInNNYXgiOjEuNiwiZXgiOiJuIiwiZXkiOiJpc3ByaW1lKG4pKmlzcHJpbWUobisyKSIsImVoIjoiIiwiZXciOiJzIiwiYSI6MC41LCJiIjoyLjM5OX19`

Visual read: the raw twin-event graph is a sparse horizontal event field. It
has no line by itself; the candidate lives in the residual matrix after local
pair-main subtraction.

### GROUND IT

Audit script:

`node scripts/primepair-shift-audit.mjs 16000000 logs/playground-artifacts 24 15`

Artifacts:

- `logs/playground-artifacts/primepair-shift-audit-16000000.json`
- `logs/playground-artifacts/primepair-shift-audit-16000000.md`
- `logs/playground-artifacts/primepair-shift-audit-16000000.svg`
- `logs/playground-artifacts/primepair-shift-audit-16000000.png`

Integer finite-wheel residuals, `W=30030`:

| N | energy | maxAbs cell | residual cells |
| ---: | ---: | ---: | --- |
| 1,000,000 | 2.521359 | 3.202835 | -2.483, -2.756, -3.141, -1.686, -2.470, -3.203, -1.971, -2.036 |
| 2,000,000 | 2.944888 | 4.092060 | -1.578, -2.629, -4.092, -1.798, -3.000, -3.493, -3.262, -2.857 |
| 4,000,000 | 3.629946 | 4.939399 | -1.989, -3.390, -4.939, -3.105, -3.779, -4.618, -3.264, -3.111 |
| 8,000,000 | 4.839652 | 6.192661 | -3.183, -4.669, -6.193, -4.188, -5.240, -5.588, -4.661, -4.377 |
| 16,000,000 | 6.408587 | 9.067584 | -4.582, -5.423, -9.068, -5.360, -6.295, -7.547, -5.796, -6.087 |

Integer full Hardy-Littlewood residuals:

| N | energy | maxAbs cell | residual cells |
| ---: | ---: | ---: | --- |
| 1,000,000 | 0.725862 | 1.143995 | -0.869, -1.144, -0.855, -0.065, -0.603, -0.917, -0.196, -0.417 |
| 2,000,000 | 0.658355 | 1.028653 | 0.600, -0.460, -1.029, 0.378, -0.496, -0.424, -0.890, -0.690 |
| 4,000,000 | 0.532555 | 0.938436 | 0.938, -0.475, -0.819, -0.187, -0.413, -0.494, -0.067, -0.194 |
| 8,000,000 | 0.550920 | 0.754604 | 0.755, -0.745, -0.639, -0.258, -0.706, -0.028, -0.358, -0.449 |
| 16,000,000 | 0.678342 | 1.575410 | 0.732, -0.116, -1.575, -0.052, -0.167, -0.041, 0.019, -0.786 |

Finite-wheel controls at `N=16,000,000`:

| group | energy range | maxAbs cell range | energy theta range |
| --- | ---: | ---: | ---: |
| ordinary Cramer | 40.208956 .. 42.432851 | 54.825455 .. 57.829211 | 0.397832 .. 0.436970 |
| W=30030 fake labels | 0.852313 .. 1.730085 | 1.745287 .. 2.948033 | -0.187484 .. 0.263554 |
| W=30030 composite-only | 194.448374 .. 194.975042 | 239.926282 .. 240.921454 | 0.369610 .. 0.371507 |

Function-field residuals:

| universe | top scale | energy | maxAbs cell | residual cells |
| --- | ---: | ---: | ---: | --- |
| F_2[t] | degree 24 | 0.645350 | 1.031643 | -1.032, -0.878, -0.878, 0.464, -0.184, 0.189, -0.470, -0.470 |
| F_3[t] | degree 15 | 1.432781 | 1.885960 | -1.886, -1.886, -1.681, -1.681, -1.681, 0.135, 0.890, 0.135 |

The finite `W=30030` local factor is uniformly `1.018020` times the full
Hardy-Littlewood singular-series factor for these shifts. That small factor
error creates the exploding negative integer line. After full-HL correction,
integer energy falls from `6.408587` to `0.678342`.

### BREAK

GRAVEYARD verdict: not a new critical line. This is a strong prime-pair
calibration and main-term lesson, but not a survivor.

How it broke:

1. The first apparent line was a main-term misfit. Finite `W=30030` residual
   energy grows from `2.521359` to `6.408587`, but the full Hardy-Littlewood
   factor correction collapses the same integer surface to
   `0.725862..0.678342`.
2. The corrected integer surface is genuinely tight and beats the finite-wheel
   fake controls at the endpoint (`0.678342` versus `0.852313..1.730085`), but
   this is now a known Hardy-Littlewood prime-pair calibration, not a novel
   critical-line route.
3. The two-universes gate does not give a shared law. `F_2[t]` top energy
   `0.645350` matches the corrected integer scale, but `F_3[t]` top energy
   `1.432781` is higher and jagged with repeated shift-cell classes.
4. The matrix remains cell-sensitive. The norm is polite, but the `h=6` integer
   cell is still `-1.575` at `16e6`, and the `F_3[t]` cells repeat
   algebraically rather than forming a stable transport pattern.
5. Ordinary Cramer and composite controls fail catastrophically, which confirms
   arithmetic structure, but the full-HL factor check explains the structure
   by classical local singular-series calibration.

CONNECTION: this is the prime-pair analogue of the earlier high-primorial
gap-moment residual. A finite wheel can create a fake growing residual even
when it is only `~1.8%` off the limiting singular series. The real nugget is
methodological: prime-pair residuals require full singular-series factors
before any line claim, and cell matrices must be inspected before norm
collapse.

### LEARN

This was the best branch since the Chebyshev square-root nugget: after the
right main term, integer prime pairs show tight arithmetic cancellation and
ordinary density/composite controls fail hard. But the explanation is
Hardy-Littlewood, not a new critical line. Next guess should keep the
prime-pair residual matrix but look for a second-order residual after full
HL subtraction: e.g. compare the signed cell pattern across ranges, not the
first-order residual norm.

## HANDOFF 19

Status: no survivor; twenty graveyard/calibration entries in this ledger.

New code since the previous handoff:

- reproducible audit script `scripts/primepair-shift-audit.mjs`

No new lab primitive was added in Cycle 20.

Next cycle suggestion:

Try a second-order prime-pair residual shape, not first-order count residuals:
after full Hardy-Littlewood subtraction, compare the vector of residual cells
across dyadic blocks via angles/sign patterns, and test whether real primes
have a stable low-dimensional direction that W-fake labels lack. If it reduces
to noise, close the pair-count branch as classical singular-series
calibration.

## Cycle 21 — HL-whitened prime-pair residual direction field

### HALLUCINATE

Guess:

after full Hardy-Littlewood subtraction, stop asking whether the prime-pair
residual norm is small. Instead treat the vector of residual cells across
fixed shifts as a direction:

`R_B(h)=(pair_count_B(h)-S(h) * integral_B dt/log(t)^2)/sqrt(S(h) * integral_B dt/log(t)^2)`

for dyadic integer blocks `B`, with `S(h)` the full Hardy-Littlewood pair
factor. Normalize each block vector to `u_B=R_B/||R_B||`, then test the
geometry of the path `B -> u_B`: adjacent cosine, cosine to the first block,
signed projection onto the first block, and sign-pattern Hamming distance.
Do the analogous construction over `F_q[t]` using fixed additive shifts and
the polynomial twin prediction.

Why it could be a line: Cycle 20 showed that first-order pair counts are
classical once the full singular series is used, but the *shape* of the
remaining residual vector might still contain arithmetic coherence. This is
not a Cramer theorem bet; Cramer-like labels are only breakers. The object is
intrinsic residual geometry after known local mass has been removed. If prime
regularity leaves a second-order fingerprint, adjacent residual directions
could form a stable flat line near high cosine in the real primes and in the
function-field theorem side.

Preregistered confirmation: integer adjacent cosines stay positive and stable
across growing dyadic blocks; cosine-to-anchor/projection traces form a flat or
straight line; real integer direction coherence beats at least five wheel and
composite controls; `F_2[t]` and `F_3[t]` show comparable direction coherence
rather than lex/order artifacts; cell matrices do not hide one huge unstable
shift.

Preregistered break: adjacent cosines look random or flip sign; coherence is
matched by wheel/composite controls; the effect comes from one shift cell; the
function-field directions are jagged or algebraic-class repeats; or the whole
object is just second-order noise around Hardy-Littlewood. Then log it as a
prime-pair shape graveyard, not a critical line.

### SEE IT

App-scale atom:

```json
{"domain":"int","N":200000,"ex":"n","ey":"isprime(n)*isprime(n+2)-1.3203236316937392/(log(max(n,3))*log(max(n+2,3)))"}
```

Metrics:

```json
{"linearity":0.0000044582656218581,"flatness":4.819697813945308,"zeroCrossings":4320,"monotonicity":0.97839989199946,"yMin":-1.0939349339220008,"yMax":0.9911375725129906}
```

Shot:

`logs/playground-artifacts/primepair-shape-atom-200k.png`

Link:

`http://localhost:5173/#v=eyJtb2RlIjoibGFiIiwibGFiIjp7ImRvbWFpbiI6ImludCIsIk4iOjIwMDAwMCwidE1heCI6NjAsInNNYXgiOjEuNiwiZXgiOiJuIiwiZXkiOiJpc3ByaW1lKG4pKmlzcHJpbWUobisyKS0xLjMyMDMyMzYzMTY5MzczOTIvKGxvZyhtYXgobiwzKSkqbG9nKG1heChuKzIsMykpKSIsImVoIjoiIiwiZXciOiJzIiwiYSI6MC41LCJiIjoyLjM5OX19`

Visual read: the app trace is essentially a thin residual event band. The
candidate cannot be judged from the raw atom; the geometry lives in the
fresh-block residual matrix.

Audit visual:

`logs/playground-artifacts/primepair-shape-audit-16000000.png`

Visual read: the adjacent-cosine lines drift through zero and below it. The
integer heatmap changes color pattern block by block; `F_2[t]` and `F_3[t]`
do not share a stable direction, and `F_3[t]` still shows repeated algebraic
shift classes.

### GROUND IT

Audit script:

`node scripts/primepair-shape-audit.mjs 16000000 logs/playground-artifacts 24 15`

Artifacts:

- `logs/playground-artifacts/primepair-shape-audit-16000000.json`
- `logs/playground-artifacts/primepair-shape-audit-16000000.md`
- `logs/playground-artifacts/primepair-shape-audit-16000000.svg`
- `logs/playground-artifacts/primepair-shape-audit-16000000.png`

Direction metrics:

| series | mean adjacent cosine | min adjacent cosine | mean pairwise cosine | stdev pairwise cosine | mean anchor hamming |
| --- | ---: | ---: | ---: | ---: | ---: |
| Z real HL blocks | -0.036742 | -0.237304 | 0.029185 | 0.284745 | 0.500000 |
| F_2[t] | -0.138826 | -0.854706 | -0.075939 | 0.513207 | 0.400000 |
| F_3[t] | -0.592723 | -0.916905 | -0.102345 | 0.689132 | 0.675000 |

Integer controls:

| group | mean energy range | max block energy range | mean adjacent cosine range | min adjacent cosine range | mean pairwise cosine range | mean anchor hamming range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| W=30030 fake labels against HL | 2.224440 .. 3.017251 | 4.009107 .. 5.062237 | 0.675249 .. 0.888615 | 0.292029 .. 0.821441 | 0.670106 .. 0.910826 | 0.000000 .. 0.225000 |
| W=30030 fake labels own finite-wheel main | 0.775029 .. 1.015584 | 0.915649 .. 1.397063 | -0.069971 .. 0.165289 | -0.532183 .. -0.134676 | -0.156144 .. 0.283336 | 0.400000 .. 0.625000 |
| W=30030 composite-only | 72.928921 .. 73.139507 | 121.420202 .. 121.731613 | 0.999868 .. 0.999952 | 0.999738 .. 0.999901 | 0.999894 .. 0.999956 | 0.000000 .. 0.000000 |

Integer fresh-block cells:

| block | energy | maxAbs cell | residual cells |
| --- | ---: | ---: | --- |
| 1..500000 | 0.756532 | 1.079177 | -0.925, -1.013, -0.747, 0.192, -0.834, -1.079, 0.490, 0.045 |
| 500000..1000000 | 0.489992 | 0.849348 | -0.266, -0.581, -0.446, -0.316, 0.034, -0.164, -0.849, -0.681 |
| 1000000..2000000 | 0.891740 | 1.877034 | 1.877, 0.592, -0.587, 0.641, -0.069, 0.392, -1.118, -0.569 |
| 2000000..4000000 | 0.522324 | 0.891829 | 0.736, -0.198, -0.080, -0.702, -0.065, -0.268, 0.892, 0.480 |
| 4000000..8000000 | 0.420640 | 0.597143 | 0.086, -0.585, -0.046, -0.178, -0.597, 0.506, -0.460, -0.456 |
| 8000000..16000000 | 0.719014 | 1.640836 | 0.257, 0.648, -1.641, 0.207, 0.530, -0.029, 0.423, -0.674 |

Factor/main-term check:

The first version of the control audit accidentally scored W-random labels
against the full Hardy-Littlewood main. That manufactured a high-coherence
direction, exactly like Cycle 20's finite-wheel main-term error. After scoring
the same labels against their own finite-wheel pair factor, their coherence
drops to the random-scale band: mean adjacent cosine `-0.069971..0.165289`.

The composite-only control has nearly perfect direction coherence, but only
because every block is massively mis-scaled: mean energy about `73` and max
block energy about `121`. Direction without a scale gate is therefore not a
valid prime-regularity statistic.

### BREAK

GRAVEYARD verdict: not a new critical line. The second-order direction branch
does not survive the audit gate.

How it broke:

1. The real integer adjacent-cosine line is not positive or flat:
   `0.273, 0.139, -0.137, -0.237, -0.222`, with mean `-0.036742`.
2. Fair W=30030 controls, scored against their own finite-wheel main, occupy
   the same random-looking direction band as the real primes. The real mean
   adjacent cosine is inside the control range `-0.069971..0.165289`.
3. The apparently strong W-control line was a main-term mismatch. Scoring
   finite-wheel labels against full HL produced coherence `0.675249..0.888615`
   and inflated energy `2.224440..3.017251`, so direction metrics are highly
   sensitive to small local-main errors.
4. Composite-only controls create a false perfect line by being wrong in the
   same direction everywhere. Their coherence is `~0.9999`, but their block
   energies are enormous, so the line is a scale-gate failure.
5. Function-field transport fails. `F_2[t]` mean adjacent cosine is
   `-0.138826`, while `F_3[t]` is `-0.592723` with large negative jumps and
   repeated shift-cell classes.

CONNECTION: this closes the Cycle 20 pair-count continuation. First-order
pair counts collapsed to Hardy-Littlewood calibration; second-order residual
directions collapse to noise plus main-term sensitivity. The new lesson is
that any shape statistic must carry a scale gate: normalized directions alone
can turn a bad main term into a beautiful but meaningless line.

### LEARN

Prime-pair residuals were worth probing, but the branch is now narrow:
full-HL count residuals are classical calibration, and post-HL direction
geometry is noise-scale. The next creative jump should stop treating pair
counts as the central object. A better hallucination is a finite Ramanujan /
residue-current spectrum: project the prime indicator onto intrinsic residue
characters up to a modulus budget, whiten by exact local residue counts, and
ask whether the spectrum of the remaining current has a stable edge that
transports to `F_q[t]`. Controls must preserve residue counts exactly, and the
scale gate must be built into the eigenvalue normalization.

## HANDOFF 20

Status: no survivor; twenty-one graveyard/calibration entries in this ledger.

New code since the previous handoff:

- reproducible audit script `scripts/primepair-shape-audit.mjs`

No new lab primitive was added in Cycle 21.

Next cycle suggestion:

Leave the prime-pair branch. Try a coordinate-free residue-current object:
for moduli/irreducible moduli up to a budget, build the whitened vector of
prime excesses in reduced residue classes, subtract the exact local mean, then
study the covariance/eigenvalue path as the budget grows. Pre-register a
flat spectral edge or stable leading direction as the line; break it with
exact residue-count permutations, composite reduced residues, and
`F_2[t]`/`F_3[t]` transport. If it reduces to prime races or residue-count
bookkeeping, log that mechanism.

## Cycle 22 — whitened residue-current spectral edge

### HALLUCINATE

Guess:

stop counting prime pairs. Build a coordinate-free residue-current object. For
small coprime integer moduli `m` and irreducible polynomial moduli `P`, form
fresh-block vectors of prime excesses over reduced residue classes:

`v_B(m,r)=(#{p in B: p = r mod m}-expected_B(m,r))/sqrt(expected_B(m,r))`

and analogously for monic irreducibles of fixed degree over `F_q[t]` modulo
irreducible `P`. Concatenate all cells for a modulus budget, split the range
into equal fresh subblocks, and study the covariance spectrum of the resulting
whitened current matrix. The proposed line is the normalized spectral edge

`edge = lambda_max(cov(v_B)) / Marchenko-Pastur-edge(dim, blocks)`

as the modulus budget grows. A real critical-line-ish object would be a flat
edge near or below `1` with stable bulk shape, indicating residue currents are
RH-grade isotropic after exact local means, while bad controls/composites fail
it.

Why it could be a line: this leaves the Cramer theorem frame and the
Hardy-Littlewood pair branch. It asks for an intrinsic spectral invariant of
simultaneous residue-class currents, closer to a finite Ramanujan/Fourier
picture than to direct prime counts. Function fields have exact equidistribution
structure behind the scenes, so a shared integer/`F_q[t]` spectral edge would
be a genuine two-universes signal.

Preregistered confirmation: across growing integer ranges and increasing
modulus budgets, the real prime edge forms a stable flat line near the
function-field edge, beats at least five exact-count random controls, and
fails composite reduced-residue controls. The residual-cell heatmaps must look
bulk-isotropic, not dominated by one modulus or one residue class.

Preregistered break: the edge is just prime-race/equidistribution noise;
exact-count or block-shuffled controls reproduce it; the largest eigenvalue is
one residue/modulus outlier; function-field edges diverge or show algebraic
small-degree artifacts; or composite controls pass. Then log it as a
residue-current graveyard with the precise collapse mechanism.

### SEE IT

App-scale Fourier atom:

```json
{"domain":"int","N":200000,"ex":"n","ey":"(isprime(n)-1/log(max(n,3)))*cos(2*pi*n/30)"}
```

Metrics:

```json
{"linearity":0.000012298561381844648,"flatness":1.9994330658979433,"zeroCrossings":40291,"monotonicity":-0.00022500112500562503,"yMin":-0.890348315618836,"yMax":0.8980088624028082}
```

Shot:

`logs/playground-artifacts/residue-current-atom-200k.png`

Link:

`http://localhost:5173/#v=eyJtb2RlIjoibGFiIiwibGFiIjp7ImRvbWFpbiI6ImludCIsIk4iOjIwMDAwMCwidE1heCI6NjAsInNNYXgiOjEuNiwiZXgiOiJuIiwiZXkiOiIoaXNwcmltZShuKS0xL2xvZyhtYXgobiwzKSkpKmNvcygyKnBpKm4vMzApIiwiZWgiOiIiLCJldyI6InMiLCJhIjowLjUsImIiOjIuMzk5fX0`

Visual read: the raw Fourier atom is a dense thin horizontal band; the line
claim lives in the covariance spectrum, not in the raw point cloud.

Audit visual:

`logs/playground-artifacts/residue-current-spectrum-audit-16000000.png`

Visual read: the normalized spectral-edge curves are visually tempting:
`Z`, `F_2[t]`, and `F_3[t]` all sit near the dashed `1` line by budget 8.
But the composite curve lies on top of the integer prime curve, and the
heatmaps show small equidistribution residuals rather than a separated
prime-specific feature.

### GROUND IT

Audit script:

`node scripts/residue-current-spectrum-audit.mjs 16000000 logs/playground-artifacts 24 15`

Artifacts:

- `logs/playground-artifacts/residue-current-spectrum-audit-16000000.json`
- `logs/playground-artifacts/residue-current-spectrum-audit-16000000.md`
- `logs/playground-artifacts/residue-current-spectrum-audit-16000000.svg`
- `logs/playground-artifacts/residue-current-spectrum-audit-16000000.png`

Final-scale budget path:

| budget | Z edge | Z energy | Z random edge range | F2 edge | F2 random edge range | F3 edge | F3 random edge range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 2 | 1.124508 | 0.355425 | 0.982231 .. 1.270369 | 0.701217 | 0.691859 .. 1.061123 | 1.297317 | 0.786593 .. 1.067972 |
| 4 | 1.020898 | 0.455007 | 0.834755 .. 0.981135 | 0.884530 | 0.774209 .. 1.060682 | 0.750000 | 0.760597 .. 1.008588 |
| 6 | 1.024823 | 0.498462 | 0.848829 .. 1.075334 | 1.062955 | 0.808580 .. 0.911595 | 1.002198 | 0.795113 .. 1.171313 |
| 8 | 1.072053 | 0.518709 | 0.863881 .. 0.983272 | 1.092706 | 0.905769 .. 1.015185 | 1.045277 | 0.838181 .. 0.914335 |

Integer range stability at budget 8:

| scale | Z edge | Z energy | composite edge | composite energy |
| ---: | ---: | ---: | ---: | ---: |
| 2,000,000 | 1.007219 | 0.557297 | 1.001801 | 0.159667 |
| 4,000,000 | 1.233785 | 0.567936 | 1.235014 | 0.158381 |
| 8,000,000 | 0.918531 | 0.534064 | 0.918315 | 0.145523 |
| 16,000,000 | 1.072053 | 0.518709 | 1.070663 | 0.137966 |

Control summaries at final scale:

| budget | random energy range | random edge range | random max-column-share range |
| ---: | ---: | ---: | ---: |
| 2 | 0.767586 .. 0.874645 | 0.982231 .. 1.270369 | 0.251941 .. 0.288129 |
| 4 | 0.887419 .. 0.929960 | 0.834755 .. 0.981135 | 0.069286 .. 0.079324 |
| 6 | 0.914106 .. 0.972069 | 0.848829 .. 1.075334 | 0.034667 .. 0.041850 |
| 8 | 0.942234 .. 0.974985 | 0.863881 .. 0.983272 | 0.019839 .. 0.024566 |

Factor/control check:

The integer prime and composite edge paths are almost identical after
normalizing by empirical variance:

`Z edge/composite edge at budget 8 = 1.007219/1.001801, 1.233785/1.235014, 0.918531/0.918315, 1.072053/1.070663`.

This is not an accident. With exact local residue means, composite counts in a
block are `eligible_counts - prime_counts`, so the composite residual vector
is approximately the negative prime residual vector scaled by
`sqrt(prime_total/composite_total)` cell-by-cell. The energy gate sees the
density difference (`0.518709` for primes versus `0.137966` for composites at
budget 8), but the normalized spectral edge divides that scale out and keeps
the same covariance shape. Therefore the edge is not prime-specific.

The lower real energies versus random controls are real arithmetic
equidistribution (`0.518709` for integer primes, `0.325253` for `F_2[t]`,
`0.311141` for `F_3[t]`, versus random energies near `0.9..1.0`), but that is
exactly the PNT-in-progress / prime polynomial theorem in AP, not a new line.

### BREAK

GRAVEYARD verdict: not a new critical line. The edge is a normalized
equidistribution spectrum, not a prime-regularity invariant.

How it broke:

1. Composite reduced-residue controls pass the edge test. At budget 8 and
   `16e6`, `Z edge = 1.072053` and composite edge `= 1.070663`.
2. The edge is not stable enough across ranges to be a sharp line:
   `1.007219, 1.233785, 0.918531, 1.072053`.
3. The apparent two-universe transport is mostly the normalization. `F_2[t]`
   and `F_3[t]` also sit near `1`, but their random controls do too after
   Marchenko-Pastur scaling.
4. The real-vs-random energy gap is genuine but known: primes and irreducible
   polynomials are more evenly distributed in residue classes than iid
   count-matched labels at these scales. That is Dirichlet/PNT-in-AP on the
   integer side and the prime polynomial theorem/Weil-side equidistribution
   on the function-field side.
5. Strongest-column shares are small at budget 8 (`Z` about `0.023`), so this
   did not break as a one-cell outlier. It broke more basically: the normalized
   covariance edge throws away the scale where the prime-specific information
   lives.

CONNECTION: this is the residue-spectrum version of the Cycle 21 scale-gate
lesson. Normalized directions and normalized eigenvalues can make non-prime
controls look beautiful. The only real signal here is lower residue-current
energy, and that collapses to classical equidistribution in arithmetic
progressions, not a new critical line.

### LEARN

The residue-current branch taught a useful negative rule: do not normalize
away amplitude before asking whether a statistic is prime-specific. The line
near the Marchenko-Pastur edge is too universal; the energy gap is the actual
arithmetic content, and it is known AP equidistribution. A next guess should
look for a statistic where composites are not algebraically the negative of
primes under the chosen centering. One route: use nonlinear residue
interactions, e.g. compare prime excess at residue `r mod m` with the next-gap
or predecessor-omega feature inside the same residue class, while using
residue-count-matched composite controls from the start.

## HANDOFF 21

Status: no survivor; twenty-two graveyard/calibration entries in this ledger.

New code since the previous handoff:

- reproducible audit script `scripts/residue-current-spectrum-audit.mjs`

No new lab primitive was added in Cycle 22.

Next cycle suggestion:

Try a nonlinear residue-local interaction, not a linear residue count:
within each reduced residue class modulo several small moduli, measure a
centered covariance between prime excess and an intrinsic local feature
(`gap/log`, `omega(n-1)-local_mean`, `mu(n+h)`, or a short additive-shift
indicator). Pre-register a flat line in the cross-residue covariance energy.
Use residue-count-matched composite controls and function-field additive
shifts immediately. If composites reproduce it, log the local-geometry
mechanism and move on.

## Cycle 23 — residue-local additive pair interaction energy

### HALLUCINATE

Guess:

for each fresh integer block `B`, modulus `m`, admissible residue `r`, and
even shift `h`, count additive pair starts

`C_B(m,r,h)=#{n in B: n = r mod m, n and n+h prime}`.

Subtract the exact residue-weighted local mean inside the same `(B,m,h)`:

`R_B(m,r,h)=(C_B(m,r,h)-T_B(m,h)*E_B(m,r,h)/E_B(m,h))/sqrt(T_B(m,h)*E_B(m,r,h)/E_B(m,h))`,

where `E_B(m,r,h)` counts all integer starts in the residue class with
`gcd(r,m)=gcd(r+h,m)=1`, and `T_B(m,h)` is the observed total pair count for
that block/modulus/shift. Collapse the cell matrix only after inspection:

`A_B = sqrt(mean_{m,r,h} R_B(m,r,h)^2)`.

Do the same in `F_q[t]`: fixed additive shifts, irreducible moduli `P`, and
residue classes `f mod P` with both `r` and `r+h` nonzero.

Why it could be a line: Cycle 22 showed linear residue currents lose
prime-specific meaning after normalization. This object is nonlinear: it asks
whether *pair formation* has residue-local regularity after exact admissible
local mass is removed. It is not just pair counts and not just residue counts;
it is a residue-resolved interaction surface. A survivor would be a flat
low-energy line across scales, transported to function fields, while exact
residue-shuffle and composite-pair controls fail.

Preregistered confirmation: integer `A_B` is stable across growing fresh
blocks and separated from at least five exact residue-shuffle controls;
composite-pair controls do not reproduce it; `F_2[t]` and `F_3[t]` show
comparable flat energy after the same local weighting; heatmaps are not
dominated by one modulus, residue, or shift.

Preregistered break: exact residue shuffles reproduce the energy; composite
pair controls pass; function-field rows diverge or show small-field algebraic
classes; the statistic collapses to Hardy-Littlewood/AP equidistribution; or
one residue/shift cell drives the norm. Then this is another residue-local
calibration graveyard, not a critical line.

### SEE IT

App-scale pair-residue Fourier atom:

```json
{"domain":"int","N":200000,"ex":"n","ey":"isprime(n)*isprime(n+2)*cos(2*pi*n/30)"}
```

Metrics:

```json
{"linearity":0.000007707008574435862,"flatness":9.734659067616219,"zeroCrossings":1043,"monotonicity":0,"yMin":-0.9135454576457198,"yMax":0.9781476007351522}
```

Shot:

`logs/playground-artifacts/residue-pair-atom-200k.png`

Link:

`http://localhost:5173/#v=eyJtb2RlIjoibGFiIiwibGFiIjp7ImRvbWFpbiI6ImludCIsIk4iOjIwMDAwMCwidE1heCI6NjAsInNNYXgiOjEuNiwiZXgiOiJuIiwiZXkiOiJpc3ByaW1lKG4pKmlzcHJpbWUobisyKSpjb3MoMipwaSpuLzMwKSIsImVoIjoiIiwiZXciOiJzIiwiYSI6MC41LCJiIjoyLjM5OX19`

Visual read: the raw atom is a sparse event band. The candidate only becomes
visible in the residue/shift heatmap after exact local admissibility weighting.

Audit visual:

`logs/playground-artifacts/residue-pair-interaction-audit-16000000.png`

Visual read: the integer residual cells are small and mostly blue/neutral,
but the `F_2[t]` and `F_3[t]` cells form hard colored bands. The function-field
side is dominated by low-degree modulus classes, not a shared flat law.

### GROUND IT

Audit script:

`node scripts/residue-pair-interaction-audit.mjs 16000000 logs/playground-artifacts 18 11`

Artifacts:

- `logs/playground-artifacts/residue-pair-interaction-audit-16000000.json`
- `logs/playground-artifacts/residue-pair-interaction-audit-16000000.md`
- `logs/playground-artifacts/residue-pair-interaction-audit-16000000.svg`
- `logs/playground-artifacts/residue-pair-interaction-audit-16000000.png`

Final-scale budget path:

| budget | Z energy | Z composite energy | Z shuffle energy range | F2 energy | F2 composite energy | F2 shuffle range | F3 energy | F3 composite energy | F3 shuffle range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 2 | 0.470767 | 0.109760 | 0.367124 .. 1.026756 | 18.998208 | 11.273278 | 0.793077 .. 0.994019 | 0.544670 | 0.102974 | 0.955942 .. 1.092781 |
| 4 | 0.552707 | 0.111889 | 0.769551 .. 0.948990 | 14.116254 | 8.574990 | 0.916268 .. 0.996880 | 13.020873 | 6.916872 | 0.962502 .. 1.037382 |
| 5 | 0.623722 | 0.108877 | 0.856582 .. 1.026481 | 12.731016 | 7.893263 | 0.933649 .. 1.008737 | 10.999146 | 5.839964 | 0.948492 .. 1.051160 |

Integer scale stability at budget 5:

| block | Z energy | Z maxAbs | composite energy | composite maxAbs |
| --- | ---: | ---: | ---: | ---: |
| 1,000,000..2,000,000 | 0.618279 | 1.899527 | 0.109661 | 0.388025 |
| 2,000,000..4,000,000 | 0.636713 | 1.668725 | 0.128932 | 0.427554 |
| 4,000,000..8,000,000 | 0.647019 | 1.697137 | 0.098884 | 0.294703 |
| 8,000,000..16,000,000 | 0.623722 | 1.788167 | 0.108877 | 0.309453 |

Function-field degree paths at budget 5:

| universe | top degree | energy | maxAbs | composite energy | shuffle range |
| --- | ---: | ---: | ---: | ---: | ---: |
| F_2[t] | 18 | 12.731016 | 34.998571 | 7.893263 | 0.933649 .. 1.008737 |
| F_3[t] | 11 | 10.999146 | 33.959257 | 5.839964 | 0.948492 .. 1.051160 |

Strongest final cells:

- `Z`: `Z:13:r12:h4=-1.788`, `Z:13:r10:h4=1.661`, `Z:13:r6:h6=1.390`.
- `F_2[t]`: `t^2 + t + 1` cells at shifts `s1..s3` have residuals
  around `34.7..35.0`.
- `F_3[t]`: `t^2 + 2*t + 2` cells at shifts `s1..s4` have residuals
  around `33.0..34.0`.

Factor/control check:

The integer low-energy line is real but not new: additive prime-pair starts
are smoother across small residue classes than iid shuffles after exact
admissibility weighting. That is Hardy-Littlewood/AP equidistribution, not an
independent critical line. Composite-pair controls do not reproduce the prime
energy; they are much lower because composite pairs are dense and extremely
smooth after the same normalization.

The two-universe gate fails decisively. The function-field statistic used only
the observed total pair count per `(degree, modulus, shift)` and removed
`r=0` / `r+h=0`, but that local main is too weak. Small irreducible moduli
create algebraic residue classes with huge residuals, so the surface needs a
full residue-class singular-series / character correction before it is even a
fair analogue.

### BREAK

GRAVEYARD verdict: not a new critical line. It is a residue-local
Hardy-Littlewood/AP calibration on integers and a failed function-field local
main.

How it broke:

1. The integer line is stable and low, but it is exactly the expected
   equidistribution phenomenon: `0.618279`, `0.636713`, `0.647019`,
   `0.623722` across fresh blocks.
2. Exact residue shuffles at the endpoint have energy `0.856582..1.026481`,
   so the integer side is smoother than iid pair placement, but this is a
   known AP regularity check rather than a new object outside the
   Hardy-Littlewood funnel.
3. Composite-pair controls fail by being too smooth, not by exposing a
   prime-specific line: endpoint composite energy is `0.108877`.
4. Function-field transport fails catastrophically. `F_2[t]` energy
   `12.731016` and `F_3[t]` energy `10.999146` are far outside their shuffle
   controls, with max cells around `35`.
5. The failure is cell-local and algebraic: degree-2 moduli
   `t^2+t+1` and `t^2+2*t+2` dominate the strongest cells. The residue-local
   main term omitted a necessary full local/character correction.

CONNECTION: this is the nonlinear version of Cycle 22's residue-current
lesson and the residue-class version of Cycle 20's pair-count lesson. Local
means are not optional. A small missing local factor can create a beautiful
line or an exploding heatmap; here the integer side lands in classical
Hardy-Littlewood/AP equidistribution, while the theorem-side breaks because
the local main is incomplete.

### LEARN

Residue-local pair interactions are not dead, but the naive "observed total
split across admissible residues" main is too weak. The next residue-pair
attempt would need the full residue-class singular series, including
characters modulo the chosen modulus, before any two-universe comparison. A
more creative jump may be better: avoid pair counts and try a statistic whose
local main is exact by construction, such as permutation-invariant rank
statistics of prime labels inside short admissible windows, with composite
and function-field controls matched at the window level.

## HANDOFF 22

Status: no survivor; twenty-three graveyard/calibration entries in this
ledger.

New code since the previous handoff:

- reproducible audit script `scripts/residue-pair-interaction-audit.mjs`

No new lab primitive was added in Cycle 23.

Next cycle suggestion:

Either repair residue-local pair interactions with a full residue-class
singular-series main, or jump away from counts again. A good next hallucination:
for each admissible short window, rank the prime/irreducible positions inside
the window and build a permutation-invariant "window shape" statistic. The
main is exact by conditioning on the number of primes in the window, so
composites cannot be just the negative complement of primes. Break it with
count-matched window permutations, composite windows, and `F_q[t]` additive
windows.

## Cycle 24 — count-conditioned admissible window shape residual

### HALLUCINATE

Guess:

stop subtracting analytic pair/count mains. Partition the integers into
short admissible windows of length `210`, aligned at multiples of `210`, and
look only at the reduced-residue offsets in each window. If a window contains
`k` primes at offsets `S`, compute the normalized mean pairwise distance

`D(S)=mean_{a<b in S} |a-b|/210`.

Condition on `k`: subtract the Monte-Carlo null mean for a uniformly random
`k`-subset of the same admissible offsets and divide by the null standard
deviation. Then aggregate fresh blocks by

`Z_B = sum_window z(window) / sqrt(number_of_windows)`.

Do the analogous `F_q[t]` construction on additive windows
`A + {h: deg h < d0}` using the intrinsic ultrametric distance
`q^deg(h1-h2)` between offsets, again conditioning exactly on the number of
irreducibles in the window.

Why it could be a line: this tries to make the local main exact by
conditioning on the count inside each window. It is not a prime count, not a
pair count, and not a residue count. It asks whether the *shape* of prime
positions inside admissible windows is more rigid or more clustered than a
count-matched random placement. If prime regularity has a local geometry that
survives after exact count conditioning, `Z_B` could form a stable flat line
or a shared two-universe bias.

Preregistered confirmation: integer `Z_B` is stable across growing fresh
blocks and outside at least five count-matched permutation controls; composite
windows do not reproduce it; `F_2[t]` and `F_3[t]` show comparable signed
shape bias with no low-degree-window artifact; and heatmaps of window
count/shape bins are not dominated by one count class.

Preregistered break: count-matched permutations reproduce the signal;
composite windows reproduce it; the integer line is only a small-prime
admissible-window artifact; function-field windows diverge or show additive
subspace artifacts; or a single `k` count class drives the aggregate. Then log
it as a window-shape graveyard, not a critical line.

### SEE IT

App-scale local pair atom:

```json
{"domain":"int","N":200000,"ex":"n","ey":"isprime(n)*(isprime(n+2)+isprime(n+4)+isprime(n+6)+isprime(n+10))*sin(2*pi*n/210)"}
```

Metrics:

```json
{"linearity":8.007739657138828e-7,"flatness":5.358406495571146,"zeroCrossings":1864,"monotonicity":0,"yMin":-2.9594717817710317,"yMax":2.6831322229994}
```

Shot:

`logs/playground-artifacts/window-shape-atom-200k.png`

Link:

`http://localhost:5173/#v=eyJtb2RlIjoibGFiIiwibGFiIjp7ImRvbWFpbiI6ImludCIsIk4iOjIwMDAwMCwidE1heCI6NjAsInNNYXgiOjEuNiwiZXgiOiJuIiwiZXkiOiJpc3ByaW1lKG4pKihpc3ByaW1lKG4rMikraXNwcmltZShuKzQpK2lzcHJpbWUobis2KStpc3ByaW1lKG4rMTApKSpzaW4oMipwaSpuLzIxMCkiLCJlaCI6IiIsImV3IjoicyIsImEiOjAuNSwiYiI6Mi4zOTl9fQ`

Visual read: the raw local pair atom is again a sparse horizontal event band.
The interesting object is the count-conditioned window shape aggregate.

Audit visual:

`logs/playground-artifacts/window-shape-audit-16000000.png`

Visual read: the integer line is a small positive bias above the permutation
controls. The function-field lines are much larger and keep rising with the
number of additive windows; strongest-window heatmaps repeat the same colors,
showing discrete shape classes rather than a smooth shared law.

### GROUND IT

Audit script:

`node scripts/window-shape-audit.mjs 16000000 logs/playground-artifacts 24 15`

Artifacts:

- `logs/playground-artifacts/window-shape-audit-16000000.json`
- `logs/playground-artifacts/window-shape-audit-16000000.md`
- `logs/playground-artifacts/window-shape-audit-16000000.svg`
- `logs/playground-artifacts/window-shape-audit-16000000.png`

Integer fresh blocks:

| block | windows | mean z | aggregate Z | rms z | composite aggregate Z | composite rms z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1,000,000..2,000,000 | 4,761 | 0.043509 | 3.002110 | 0.959913 | 1.147304 | 1.013349 |
| 2,000,000..4,000,000 | 9,523 | 0.045214 | 4.412234 | 0.981321 | -0.956038 | 1.009991 |
| 4,000,000..8,000,000 | 19,047 | 0.042024 | 5.799745 | 0.968211 | 0.754770 | 1.000221 |
| 8,000,000..16,000,000 | 38,094 | 0.040226 | 7.851116 | 0.967992 | 1.367015 | 1.008209 |

Endpoint count-matched permutation controls:

- aggregate `Z` range: `-3.154926 .. 0.325069`
- mean `z` range: `-0.016164 .. 0.001666`
- rms `z` range: `1.010733 .. 1.014954`

Function-field degree paths:

| universe | top degree | windows | mean z | aggregate Z | rms z | permutation aggregate range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| F_2[t] | 24 | 210,661 | 0.298616 | 137.058126 | 0.859589 | -1.328486 .. -0.074457 |
| F_3[t] | 15 | 307,858 | 0.229536 | 127.358162 | 0.858619 | 0.807838 .. 4.725059 |

Count-class checks:

- Integer endpoint: the signal is spread across medium/high count classes,
  especially `k=12` (`Z=5.345`), `k=15` (`Z=4.754`), `k=17` (`Z=3.474`),
  and `k=18` (`Z=3.520`).
- `F_2[t]`: the endpoint is dominated by common small count classes:
  `k=2` (`Z=91.961`), `k=3` (`Z=94.789`), `k=4` (`Z=56.228`).
- `F_3[t]`: similarly `k=2` (`Z=70.125`), `k=3` (`Z=84.436`),
  `k=4` (`Z=67.548`).

Factor/control check:

This did achieve the exact-count main: every window was compared only against
uniform random placements with the same number of primes/irreducibles. The
integer signal is therefore not a density artifact. It says that, within
`210`-admissible windows, primes are slightly more spread out than
count-matched random subsets. The mean bias is small and stable
(`~0.04` per window), while aggregate `Z` grows like `sqrt(number_of_windows)`.

But the two-universe transport fails in scale and mechanism. The function-field
windows use additive low-degree subspaces; their mean shape biases are
`0.298616` and `0.229536`, far larger than the integer bias. The repeated
strongest-window values show a discrete additive-subspace/count-class effect,
not a smooth coordinate-free statistic.

Mathematically, the integer effect is explained by local two-point
correlations: conditioning on `k` removes the one-point count, but the mean
pairwise distance is still a two-point statistic. Prime pairs at different
separations have Hardy-Littlewood/local-factor weights, so this routes back to
pair-correlation calibration rather than a new critical line.

### BREAK

GRAVEYARD verdict: not a new critical line. This is a real count-conditioned
window-spread bias, but it collapses to local pair-correlation / additive
subspace calibration.

How it broke:

1. The integer signal is real and stable, but it is not a survivor by the
   preregistered gate. Mean `z` is only `~0.04`; aggregate `Z` grows because
   there are many windows.
2. The effect is a two-point statistic in disguise. Mean pairwise distance
   after count conditioning is still controlled by separation-dependent
   pair correlations, hence by Hardy-Littlewood/local factors.
3. The two-universe scale is not comparable. Integer mean `z` is `0.040226`,
   while `F_2[t]` is `0.298616` and `F_3[t]` is `0.229536`.
4. Function-field strongest windows repeat identical `z` values (`k=3`
   windows at `z=-1.435` over `F_2[t]`, `k=3` at `z=-2.377` over `F_3[t]`),
   indicating additive-subspace/discrete count-class structure.
5. Composite windows do not reproduce the integer aggregate, but that only
   confirms the bias is prime/irreducible-specific two-point geometry; it does
   not make the statistic independent of the pair-correlation funnel.

CONNECTION: this is the exact-count version of the residue-pair branch. It
successfully removed density and one-point residue effects, but the remaining
shape is pair correlation. That connects directly to Cycle 20's
Hardy-Littlewood calibration and Cycle 23's residue-local pair interaction.

### LEARN

The useful nugget is methodological and empirical: count conditioning is strong
enough to expose a small integer window-spread bias that count-matched
permutations miss. But pairwise-distance shape is still a two-point object, so
it falls back into Hardy-Littlewood. The next attempt should use a genuinely
higher-order shape invariant with the pairwise component projected out: e.g.
condition on `k` and the mean pairwise distance, then test a third-order
statistic such as normalized triangle area / three-gap entropy inside each
window. If that still survives permutations and controls, it is less likely to
be just pair correlation.

## HANDOFF 23

Status: no survivor; twenty-four graveyard/calibration entries in this ledger.

New code since the previous handoff:

- reproducible audit script `scripts/window-shape-audit.mjs`

No new lab primitive was added in Cycle 24.

Next cycle suggestion:

Try a third-order window-shape statistic with the pairwise distance projected
out. For each admissible window, condition on the count `k` and bin/match the
mean pairwise distance, then measure a genuinely higher-order shape feature:
three-gap entropy, normalized triangle area of triples, or the variance of
consecutive spacings among the selected offsets. Break it with count+pair
matched permutations, composite windows, and additive `F_q[t]` windows. If it
collapses, record whether the mechanism is still Hardy-Littlewood pair
correlation or a new higher-order local factor.

## Cycle 25 — count+pair-conditioned triple-shape residual

### HALLUCINATE

Guess:

repair Cycle 24 by projecting out the pairwise component. In each
`210`-admissible integer window, condition on both the count `k` and a bin of
the mean pairwise distance `D(S)`. Then score a third-order metric shape:

`T(S)=mean_{a<b<c in S} Var(|a-b|,|a-c|,|b-c|) / mean(|a-b|,|a-c|,|b-c|)^2`.

This is zero-ish for locally equilateral triples and larger when triples have
one close pair plus a distant third point. Build null means/standard deviations
from random subsets with the same `(k, D-bin)`, and aggregate fresh blocks by
`Z_B=sum z(window)/sqrt(windows)`.

Do the analogous construction in `F_q[t]` additive windows using the intrinsic
ultrametric distance `q^deg(h1-h2)` on offset differences. Controls are not
plain count-matched shuffles; they are count+pair-bin matched permutations.

Why it could be a line: if Cycle 24's signal was only Hardy-Littlewood
two-point correlation, conditioning on `D` should kill it. A surviving
third-order line would point at local prime geometry beyond pair correlations:
triple organization inside admissible windows. The function-field side gives
a theorem-backed second universe where a comparable higher-order shape could
be visible.

Preregistered confirmation: integer aggregate `Z_B` remains stable and outside
five count+pair matched permutation controls; composite windows do not
reproduce it; `F_2[t]` and `F_3[t]` show comparable signed third-shape bias;
no single `(k,D-bin)` class dominates the aggregate.

Preregistered break: the integer bias collapses into the matched controls;
composite windows reproduce it; the function-field side has much larger
ultrametric/additive-subspace artifacts; the signal is driven by one
`(k,D-bin)` class; or the statistic is just a re-encoding of pair-distance
binning. Then this is a third-order window-shape graveyard, not a critical
line.

### SEE IT

Rendered atom:

- `node scripts/explore.mjs eval '{"domain":"int","N":200000,"ex":"n","ey":"isprime(n)*isprime(n+2)*isprime(n+6)*sin(2*pi*n/210)"}'`
- scalar metrics: `linearity=1.496e-7`, `flatness=25.943`, `zeroCrossings=215`
- screenshot: `logs/playground-artifacts/window-thirdshape-atom-200k.png`

The raw triple-prime atom is visually almost a flat sparse trace; it is not
the line. The evidence is in the conditioned-window residuals.

Audit artifacts:

- primary binning: `logs/playground-artifacts/window-thirdshape-audit-16000000.md`
- primary preview: `logs/playground-artifacts/window-thirdshape-audit-16000000.png`
- sharper pair-binning check: `logs/playground-artifacts/window-thirdshape-audit-16000000-b96.md`
- sharper preview: `logs/playground-artifacts/window-thirdshape-audit-16000000-b96.png`

The `b24` picture is the seductive one: integer primes, `F_2[t]`, and `F_3[t]`
all trend negative while integer composites hover near zero. The `b96` picture
is the breaker: the integer line remains negative, but `F_3[t]` moves back to
zero/positive and the finite-field heat cells are visibly quantized.

### GROUND IT

Primary `24`-bin conditioning, endpoint `8e6..16e6`:

| universe/control | windows | mean z | aggregate Z | matched/control range |
| --- | ---: | ---: | ---: | --- |
| integers, primes | 38,093 | -0.051973 | -10.143768 | controls `-1.449829 .. 2.091175` |
| integers, composites | 38,092 | 0.002789 | 0.544335 | same null |
| `F_2[t]` | 61,190 | -0.031181 | -7.713138 | controls `-0.163438 .. 0.207611` |
| `F_3[t]` | 135,841 | -0.025772 | -9.498739 | controls `-0.809750 .. 0.368246` |

Integer fresh-block path:

| block | mean z | aggregate Z | composite aggregate Z |
| --- | ---: | ---: | ---: |
| `1e6..2e6` | -0.035754 | -2.466997 | 1.846761 |
| `2e6..4e6` | -0.050308 | -4.909377 | -0.649852 |
| `4e6..8e6` | -0.061005 | -8.419330 | 1.358117 |
| `8e6..16e6` | -0.051973 | -10.143768 | 0.544335 |

Residual scaling: the standardized aggregate grows roughly like
`sqrt(number_of_windows)` because the per-window mean z is a small nonzero
bias. The unstandardized sum is therefore closer to a main-effect moment than
a cancellation residual. That is a warning, not a critical-line exponent.

Dominant-class checks at `b24`:

- integer top class: `k15/b9`, `n=695`, aggregate `Z=-5.101`; several other
  classes contribute (`k20/b8=-4.119`, `k11/b8=-4.075`,
  `k15/b8=-3.691`). The integer effect is not a single-window endpoint.
- `F_2[t]`: `k4/b17` alone has aggregate `Z=-27.721`, while the total is only
  `-7.713`. This is class-dominated with cancellation.
- `F_3[t]`: `k5/b17` has aggregate `Z=-35.281`, `k4/b16=-29.677`,
  `k5/b19=-21.119`, while positives like `k5/b20=8.053` partially cancel.

Sharper `96`-bin pair conditioning:

| universe/control | windows | mean z | aggregate Z | matched/control range |
| --- | ---: | ---: | ---: | --- |
| integers, primes | 38,093 | -0.053101 | -10.363969 | controls `-0.584971 .. 2.048306` |
| integers, composites | 38,092 | 0.002897 | 0.565469 | same null |
| `F_2[t]` | 61,190 | -0.012438 | -3.076691 | controls `-0.302171 .. 0.228139` |
| `F_3[t]` | 135,841 | 0.001849 | 0.681365 | controls `-0.131812 .. 0.095898` |

The integer signal survives finer pair binning. The two-universe claim does
not: `F_2[t]` shrinks by more than half and `F_3[t]` changes sign. Composite
finite-field controls also expose degenerate null cells with near-zero
variance: at `b24`, `F_3[t]` degree `14` composite aggregate was
`642137.210088`; at `b96`, finite-field composite aggregates were again
huge. That is not prime regularity; it is a discrete ultrametric/binning
artifact in the additive-window model.

### BREAK

GRAVEYARD verdict: not a new critical line. This is a real integer
third-order window-shape bias, but it fails the transport and class-dominance
parts of the gate.

How it broke:

1. The integer effect is real by the local tests: stable negative mean z,
   outside five count+pair matched controls, and not reproduced by composite
   windows.
2. The effect is not a sharp global line. The aggregate grows because a small
   mean bias persists over many windows; this is moment accumulation, not a
   cancellation exponent.
3. The function-field analogue is not stable under the audit knob. Moving from
   `24` to `96` pair-distance bins leaves the integer result intact but makes
   `F_3[t]` vanish/flip and shrinks `F_2[t]`.
4. The function-field signal is class-dominated. Individual `(k,D-bin)` classes
   have aggregate magnitudes much larger than the total and cancel each other.
5. Finite-field composite controls reveal the normalizer is brittle in small
   ultrametric spaces: some bins have effectively zero null variance, producing
   absurd z-scores.

CONNECTION: Cycle 24 was the pairwise window-spread bias. Cycle 25 projects
out pair distance and still leaves a robust integer third-order bias, so the
integer nugget is genuinely stronger than "pair distance only." But the
function-field model collapses into additive-subspace quantization, and the
likely classical shadow is now the `k`-tuple/local-factor hierarchy rather
than a zeta-free critical line.

### LEARN

New real nugget: after conditioning on both count and pair-distance bin inside
`210`-admissible windows, integer primes have lower triple distance-variance
than matched random subsets. Informally, triples are slightly less
"one close pair plus a far third" than the random local model predicts. This
survives stricter pair bins and composite controls.

But this nugget is still local-window geometry. To get closer to the goal, the
next guess should stop asking a scalar window statistic to transport between
Euclidean integer distance and ultrametric polynomial distance. Use a
coordinate-free rank/ordering of shapes, or subtract an explicit local
`k`-tuple main before any global residual is measured.

## HANDOFF 24

Status: no survivor; twenty-five graveyard/calibration entries in this
ledger. Cycle 25 produced a useful integer nugget, not a critical line.

New code since the previous handoff:

- reproducible audit script `scripts/window-thirdshape-audit.mjs`
- artifact reports and previews:
  - `logs/playground-artifacts/window-thirdshape-audit-16000000.md`
  - `logs/playground-artifacts/window-thirdshape-audit-16000000-b96.md`
  - `logs/playground-artifacts/window-thirdshape-audit-16000000.png`
  - `logs/playground-artifacts/window-thirdshape-audit-16000000-b96.png`
  - `logs/playground-artifacts/window-thirdshape-atom-200k.png`

No new lab primitive was added in Cycle 25.

Next cycle suggestion:

Try a "local-main-subtracted shape cumulant." For every admissible offset
triple inside a `210` window, subtract the Hardy-Littlewood/local-factor
prediction fitted only from local congruence data and observed window count,
then aggregate the residual over unordered triples. In the function-field
version, use exact polynomial tuple admissibility instead of ultrametric
distance bins. Pre-register two possible deaths: it becomes a named
Hardy-Littlewood/Bateman-Horn statistic, or it is just another local-factor
calibration. If it survives, only then ask whether the residual has a
critical-line exponent.

## Cycle 26 — local-factor-subtracted triple-shape cumulant

### HALLUCINATE

Guess:

Cycle 25 left a small robust integer third-order shape bias after conditioning
on count and pair-distance. The honest next attack is to subtract a local
`k`-tuple main instead of asking random subsets to explain prime triples.

For each `210`-admissible integer window with base `m*210`, first build the
window-specific local eligible set

`E_B(m)={a mod 210: gcd(a,210)=1 and p does not divide m*210+a for every 11<=p<=B}`.

Given the observed prime count `k`, compare the observed mean triple shape
among prime offsets against random `k`-subsets of `E_B(m)`, not against all
reduced residues. This is a finite local `k`-tuple main: it uses only local
congruence obstructions and the observed count, and it adapts to the actual
base residue of each short window. Run the analogous construction in `F_q[t]`
by replacing small primes with irreducible polynomial moduli and using
window-specific offsets `h` for which `base+h` has no small polynomial factor.

Why it could be a line: if the Cycle 25 nugget is merely the first visible
layer of Hardy-Littlewood / Bateman-Horn tuple geometry, this subtraction
should kill it. If a stable residual remains in both universes after the local
tuple main, then the line is less likely to be pair/triple local calibration
and more plausibly a real higher-order regularity.

Preregistered confirmation: after local-sieve centering, integer residuals
remain stable across fresh blocks, outside five local-main/count-matched
controls, composites fail, and `F_2[t]`/`F_3[t]` show comparable signed
residuals without domination by a few `(k, eligible-size)` classes.

Preregistered break: the integer residual collapses toward zero or into
controls; the local eligible-set main predicts the Cycle 25 sign; composites
reproduce the residual; the function-field side is class-dominated or unstable
under the local cutoff; or the construction is just a finite singular-series
calibration. Then this is another local-main graveyard, not a critical line.

### SEE IT

Rendered atom:

- `node scripts/explore.mjs eval '{"domain":"int","N":200000,"ex":"n","ey":"(isprime(n)*isprime(n+2)*isprime(n+6)-rowvis(n,47)*rowvis(n+2,47)*rowvis(n+6,47)/pow(log(max(n,3)),3))*sin(2*pi*n/210)"}'`
- scalar metrics: `linearity=1.469e-7`, `flatness=25.895`,
  `zeroCrossings=763`
- screenshot: `logs/playground-artifacts/triple-local-sieve-atom-200k.png`

The raw atom is again visually just a thin sparse trace. The candidate only
exists after conditioning on the local eligible set window by window.

Audit artifacts:

- primary report: `logs/playground-artifacts/triple-local-sieve-audit-16000000-p47-f32.md`
- primary preview: `logs/playground-artifacts/triple-local-sieve-audit-16000000-p47-f32.png`
- cutoff check: `logs/playground-artifacts/triple-local-sieve-audit-16000000-p97-f32.md`
- cutoff preview: `logs/playground-artifacts/triple-local-sieve-audit-16000000-p97-f32.png`

The primary visual shows the integer residual trace sitting near zero after
local-sieve subtraction. The field traces are small but jagged; the heatmaps
repeat identical residual cells, so the remaining field motion is quantized
small-window geometry, not a smooth shared line.

### GROUND IT

Primary cutoff: integer small primes `11..47`; `F_2[t]` factors through degree
`3`; `F_3[t]` factors through degree `2`.

Integer fresh-block path:

| block | mean raw delta | mean local shift | mean residual | aggregate residual | composite aggregate |
| --- | ---: | ---: | ---: | ---: | ---: |
| `1e6..2e6` | -0.000354 | -0.000700 | 0.000346 | 0.023858 | 0.023305 |
| `2e6..4e6` | -0.000463 | -0.000678 | 0.000215 | 0.020993 | -0.008306 |
| `4e6..8e6` | -0.000783 | -0.000694 | -0.000089 | -0.012279 | 0.018843 |
| `8e6..16e6` | -0.000752 | -0.000697 | -0.000055 | -0.010760 | 0.023027 |

Endpoint local-sieve count-matched controls had aggregate residual range
`-0.041541 .. -0.006619`, so the integer endpoint residual is inside controls.
The key arithmetic fact is the decomposition:

`raw shift -0.000752 = local-sieve shift -0.000697 + residual -0.000055`.

Thus the Cycle 25 negative triple-shape bias is mostly predicted by the
window-specific small-prime eligible set.

Cutoff check through prime `97`:

| block | mean raw delta | mean local shift | mean residual | aggregate residual | composite aggregate |
| --- | ---: | ---: | ---: | ---: | ---: |
| `1e6..2e6` | -0.000354 | -0.000721 | 0.000367 | 0.025319 | 0.019444 |
| `2e6..4e6` | -0.000463 | -0.000676 | 0.000213 | 0.020788 | -0.024975 |
| `4e6..8e6` | -0.000783 | -0.000678 | -0.000105 | -0.014459 | 0.040971 |
| `8e6..16e6` | -0.000752 | -0.000677 | -0.000075 | -0.014724 | -0.000765 |

Endpoint `p97` controls were `-0.033718 .. 0.013122`. The conclusion is
unchanged: the integer residual remains control-scale after local-sieve
centering.

Function-field primary endpoint:

| universe | windows | mean raw delta | mean local shift | mean residual | aggregate residual | controls |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `F_2[t]` degree 24 | 61,190 | -0.046368 | -0.046605 | 0.000236 | 0.058501 | `-0.047922 .. 0.083166` |
| `F_3[t]` degree 15 | 135,841 | -0.023874 | -0.024493 | 0.000620 | 0.228372 | `0.018649 .. 0.192882` |

`F_2[t]` is inside controls. `F_3[t]` is only slightly beyond the five-seed
control range, and it is class/shape dominated: the endpoint top class
`k3/e7` alone has aggregate `0.5470`, while `k3/e4` contributes `-0.3711`.
Strongest windows repeat identical residuals (`0.229117...`) across many
windows, a discrete additive-window artifact.

### BREAK

GRAVEYARD verdict: not a new critical line. Cycle 26 explains most of the
Cycle 25 integer nugget as finite local-sieve geometry.

How it broke:

1. The integer residual collapsed after conditioning on window-specific
   eligible offsets. At the endpoint, the residual was `-0.000055` for `p47`
   and `-0.000075` for `p97`.
2. Both integer residual endpoints lie inside local-sieve count-matched
   controls. The earlier aggregate signal was not a survivor after the
   stronger local main.
3. The local eligible-set shift predicts the sign and most of the magnitude:
   `-0.000697` of the `-0.000752` raw shift at `p47`, and `-0.000677` at
   `p97`.
4. The function-field residuals are not a shared line. `F_2[t]` is inside
   controls; `F_3[t]` is small, jagged by degree, and dominated by repeated
   `(k, eligible-size)` classes.
5. The raw atom plot is not a line; the only structure was in the conditioned
   statistic, and that structure routes to local congruence exclusions.

CONNECTION: this closes the Cycle 24 -> Cycle 25 window-shape branch. Count
conditioning exposed a pair-spread bias; pair conditioning exposed a
third-shape bias; local eligible-set conditioning explains that third-shape
bias. The branch did not reach a new critical line. It landed in the same
Hardy-Littlewood/Bateman-Horn local-factor layer as the prime-pair residual
matrix and residue-pair interaction entries.

### LEARN

The real lesson is sharper than "it was pair correlation": the third-order
integer nugget was mostly a finite local-sieve shape effect. Small primes
beyond the base `210` wheel carve different offset subsets inside each short
window, and those subsets already have lower triple distance-variance.
Primes inherit that geometry.

The next guess should leave short-window Euclidean shape statistics behind.
A better hallucination is a coordinate-free object that is insensitive to
which offsets survive a finite local sieve: for example, rank the local
eligible offsets by an intrinsic arithmetic weight and test the discrepancy of
prime positions within that ranked eligible set, or move to a global operator
whose null is the local eligible-set process itself.

## HANDOFF 25

Status: no survivor; twenty-six graveyard/calibration entries in this ledger.
Cycle 26 turned the Cycle 25 integer nugget into a local-sieve calibration.

New code since the previous handoff:

- reproducible audit script `scripts/triple-local-sieve-audit.mjs`
- artifact reports and previews:
  - `logs/playground-artifacts/triple-local-sieve-audit-16000000-p47-f32.md`
  - `logs/playground-artifacts/triple-local-sieve-audit-16000000-p97-f32.md`
  - `logs/playground-artifacts/triple-local-sieve-audit-16000000-p47-f32.png`
  - `logs/playground-artifacts/triple-local-sieve-audit-16000000-p97-f32.png`
  - `logs/playground-artifacts/triple-local-sieve-atom-200k.png`

No new lab primitive was added in Cycle 26.

Next cycle suggestion:

Try an "eligible-rank discrepancy operator." In each short window, first form
the same local eligible set `E_B(m)`, then rank eligible offsets by a
coordinate-free arithmetic score such as local singular weight over the next
prime band, reciprocal radical of `mW+a-1`, or a hash-free vector of residues.
Compare the prime subset against count-matched subsets inside `E_B(m)` using a
cumulative rank discrepancy or spectral statistic. Break it with composite
eligible controls, cutoff changes, and `F_q[t]` eligible sets. The immediate
death to expect: the rank statistic becomes a disguised residue-class or
predecessor-arithmetic calibration.

## Cycle 27 — local-eligible predecessor-squarefree rank discrepancy

### HALLUCINATE

Guess:

Leave Euclidean short-window shape behind. In each `210` window, first build
the local eligible set `E_B(m)` exactly as in Cycle 26. Then ignore offsets as
geometry and rank them by an intrinsic arithmetic feature of the predecessor:

`Q(n)=1_{n-1 is squarefree}`.

For each window, compare the mean `Q` over prime offsets against the mean `Q`
over all locally eligible offsets, standardized by the finite-population
variance for a count-matched `k`-subset. This is an "eligible-rank" operator:
the null is not Cramer and not all reduced residues; the null is the local
eligible process itself. Run the same object in `F_q[t]` with
`Q(f)=1_{f-1 is squarefree}` using polynomial Möbius.

Why it could be a line: predecessor arithmetic is not pair distance, triple
shape, or raw density. If primes occupy special ranks inside the locally
eligible process, a flat residual line could encode a prime-specific
arithmetic regularity orthogonal to the short-window geometry branch.

Preregistered confirmation: integer standardized residuals remain stable
across fresh blocks and outside five local-eligible count-matched controls;
composite eligible controls fail; `F_2[t]` and `F_3[t]` show comparable signed
residuals; the effect is not dominated by a small `(k, eligible-size)` class.

Preregistered break: the residual collapses into local-eligible controls;
composites reproduce it; the two-universe side is scale-incompatible or
class-dominated; or the statistic is just the known squarefree-predecessor
Euler-product calibration in a local-eligible disguise. Then this branch is
closed as predecessor local-product calibration, not a critical line.

### SEE IT

Rendered atom:

- `node scripts/explore.mjs eval '{"domain":"int","N":200000,"ex":"n","ey":"isprime(n)*(mu(n-1)*mu(n-1)-0.374)*sin(2*pi*n/210)"}'`
- scalar metrics: `linearity=2.921e-8`, `flatness=3.825`,
  `zeroCrossings=9567`
- screenshot: `logs/playground-artifacts/predecessor-rank-atom-200k.png`

The raw atom is visually a sparse horizontal band, not a line. The candidate
only exists after local-eligible finite-population standardization.

Audit artifacts:

- primary report: `logs/playground-artifacts/predecessor-rank-audit-16000000-p47-f32.md`
- primary preview: `logs/playground-artifacts/predecessor-rank-audit-16000000-p47-f32.png`
- cutoff check: `logs/playground-artifacts/predecessor-rank-audit-16000000-p97-f32.md`
- cutoff preview: `logs/playground-artifacts/predecessor-rank-audit-16000000-p97-f32.png`

The primary visual shows all endpoint traces near the control band after the
early field-degree wobble. The heatmaps alternate ordinary positive/negative
finite-sample cells rather than a coherent sign.

### GROUND IT

Primary cutoff: integer small primes `11..47`; `F_2[t]` factors through degree
`3`; `F_3[t]` factors through degree `2`.

Integer fresh-block path:

| block | observed mean | local mean | mean delta | aggregate Z | composite aggregate Z |
| --- | ---: | ---: | ---: | ---: | ---: |
| `1e6..2e6` | 0.374258 | 0.373941 | 0.000318 | 0.298800 | 0.262921 |
| `2e6..4e6` | 0.374138 | 0.374079 | 0.000059 | 0.000704 | -0.258213 |
| `4e6..8e6` | 0.374221 | 0.373919 | 0.000301 | 0.324536 | -0.198073 |
| `8e6..16e6` | 0.374119 | 0.374038 | 0.000081 | -0.240925 | -0.047546 |

Endpoint local-eligible controls had aggregate range
`-1.170858 .. 1.253823`. The integer endpoint, `-0.240925`, is ordinary
control-scale noise. Composite eligible controls also sit near zero.

Cutoff check through prime `97`:

- endpoint observed mean `0.374119`, local mean `0.374044`
- mean delta `0.000075`
- aggregate `Z=-0.280160`
- controls `-0.279263 .. 1.175867`
- composite aggregate `0.186530`

The cutoff change does not reveal a stable residual.

Function-field endpoint:

| universe | windows | observed mean | local mean | aggregate Z | controls |
| --- | ---: | ---: | ---: | ---: | --- |
| `F_2[t]` degree 24 | 311,114 | 0.288437 | 0.288770 | -0.390244 | `-0.453207 .. 0.209119` |
| `F_3[t]` degree 15 | 459,148 | 0.541753 | 0.542116 | -0.695799 | `-0.651960 .. 1.369031` |

Both field endpoints are control-scale. The class rows are finite-bin noise:
`F_3[t]` top class `k6/e8` has `Z=4.660`, but the total is only `-0.696`
after cancellation; strongest field windows repeat the same small binary-score
z-values.

Factor/known-check:

This statistic is exactly the local version of the squarefree predecessor
density branch. The raw level near `0.374` is the same Artin/local-product
scale already logged for `psqprevmean`; conditioning on the local eligible set
builds that local product into the null. There is no leftover critical-line
residual.

### BREAK

GRAVEYARD verdict: not a new critical line. The eligible-rank version of
predecessor squarefreeness collapses into the local eligible null.

How it broke:

1. Integer endpoint aggregate `Z=-0.240925` is inside five local-eligible
   controls and far from a stable line.
2. The fresh blocks do not keep a sign or growing effect: aggregates
   `0.298800`, `0.000704`, `0.324536`, `-0.240925`.
3. Composite eligible controls reproduce the null-scale behavior rather than
   failing decisively.
4. The two-universe side is also control-scale. `F_2[t]` and `F_3[t]` do not
   carry a comparable signed residual.
5. The object factor-checks to known predecessor-squarefree local-product
   calibration. The local eligible set already predicts the rank distribution.

CONNECTION: this is the rank-operator version of the earlier
squarefree-predecessor density entry, now nested inside the Cycle 26 local
eligible null. It confirms the new null is strong enough to absorb
predecessor arithmetic that used to look flat at the raw level.

### LEARN

The eligible-set process is now a serious null: it killed short-window shape
and predecessor-squarefree rank. Future attempts should either use a feature
that is not a local congruence/predecessor product, or explicitly embrace the
eligible process as the base space and look for operator-level correlations
across windows rather than one-window score means.

## HANDOFF 26

Status: no survivor; twenty-seven graveyard/calibration entries in this
ledger. Cycle 27 closed the predecessor-squarefree eligible-rank attempt.

New code since the previous handoff:

- reproducible audit script `scripts/predecessor-rank-audit.mjs`
- artifact reports and previews:
  - `logs/playground-artifacts/predecessor-rank-audit-16000000-p47-f32.md`
  - `logs/playground-artifacts/predecessor-rank-audit-16000000-p97-f32.md`
  - `logs/playground-artifacts/predecessor-rank-audit-16000000-p47-f32.png`
  - `logs/playground-artifacts/predecessor-rank-audit-16000000-p97-f32.png`
  - `logs/playground-artifacts/predecessor-rank-atom-200k.png`

No new lab primitive was added in Cycle 27.

Next cycle suggestion:

Try an operator across windows rather than a one-window mean. Build the
local-eligible process `E_B(m)` for each window, then compare adjacent windows
by the transport map between their eligible score vectors: for example, the
signed autocorrelation of prime occupancy residuals after projecting out
local eligible means. Break it with window-shuffled eligible controls,
composite eligible controls, and `F_q[t]`. The expected death is an
independence/noise result or a disguised residue-transition calibration.

## Cycle 28 — adjacent local-eligible occupancy autocorrelation

### HALLUCINATE

Guess:

The local eligible set killed one-window shape and one-window predecessor
rank. Instead of scoring each window independently, treat each window as a
centered occupancy vector on its locally eligible offsets:

`v_m(a)=1_{mW+a prime} - k_m/|E_m|` for `a in E_m`, and `0` outside `E_m`.

Compare adjacent windows by a normalized transport dot product on the common
offset coordinate:

`C_m = <v_m,v_{m+1}> / (||v_m|| ||v_{m+1}||)`.

Then aggregate `C_m` over fresh blocks. The null keeps the exact local
eligible set and exact count in every window but randomizes which eligible
offsets are occupied. Composite eligible controls choose the same counts from
eligible composites. The `F_q[t]` analogue uses additive low-degree windows
and a fixed high-coordinate additive shift, with the warning that coefficient
transport may itself be an artifact.

Why it could be a line: if primes have cross-window rigidity after the strong
local eligible null, adjacent residual occupancy vectors could show a stable
negative or positive correlation that one-window statistics cannot see. This
would be closer to an operator on the local-eligible process than to a
single-window local-product statistic.

Preregistered confirmation: integer mean correlation is stable across fresh
blocks, outside five local-eligible shuffled controls, composites fail it,
and `F_2[t]`/`F_3[t]` show comparable signed behavior without domination by
one `(k_m,k_{m+1},|E_m|,|E_{m+1}|)` class.

Preregistered break: integer correlations are control-scale/noisy; composites
reproduce them; function-field transport is encoding/class dominated; or the
effect is just a residue-transition calibration. Then this is an adjacent
eligible-process graveyard, not a critical line.

### SEE IT

Rendered atom:

- `node scripts/explore.mjs eval '{"domain":"int","N":200000,"ex":"n","ey":"(isprime(n)*isprime(n+210)-rowvis(n,47)*rowvis(n+210,47)/pow(log(max(n,3)),2))*sin(2*pi*n/210)"}'`
- scalar metrics: `linearity=2.723e-7`, `flatness=5.903`,
  `zeroCrossings=7820`
- screenshot: `logs/playground-artifacts/eligible-adjacent-atom-200k.png`

The raw adjacent-prime atom is only a sparse, flat band. The candidate exists
only after building the local eligible vectors and adjacent-window dot
products.

Audit artifacts:

- primary report: `logs/playground-artifacts/eligible-adjacent-audit-16000000-p47-f32.md`
- primary preview: `logs/playground-artifacts/eligible-adjacent-audit-16000000-p47-f32.png`
- cutoff check: `logs/playground-artifacts/eligible-adjacent-audit-16000000-p97-f32.md`
- cutoff preview: `logs/playground-artifacts/eligible-adjacent-audit-16000000-p97-f32.png`

The primary preview shows only a weak endpoint integer dip, with `F_2[t]` and
`F_3[t]` dips that look much more like small-class/coefficient-transport
structure than a shared line. The strongest field pairs repeat extreme
correlations from tiny eligible sets.

### GROUND IT

Primary cutoff: integer small primes `11..47`; `F_2[t]` factors through degree
`3`; `F_3[t]` factors through degree `2`. The aggregate is
`mean(C_m)*sqrt(adjacent pair count)`.

Integer fresh-block path:

| block | adjacent pairs | mean corr | aggregate | rms corr | composite aggregate |
| --- | ---: | ---: | ---: | ---: | ---: |
| `1e6..2e6` | 4,760 | -0.000700 | -0.048276 | 0.143346 | 0.052873 |
| `2e6..4e6` | 9,522 | -0.000502 | -0.049013 | 0.144922 | -0.080046 |
| `4e6..8e6` | 19,046 | 0.000078 | 0.010754 | 0.143777 | -0.131036 |
| `8e6..16e6` | 38,093 | -0.001592 | -0.310727 | 0.143682 | 0.063753 |

Endpoint local-eligible shuffled controls:

- aggregate range: `-0.301192 .. -0.002800`
- mean-correlation range: `-0.001543 .. -0.000014`

The integer endpoint is barely outside the five shuffled controls by about
`0.0095` aggregate units, but the path does not stabilize and the effect size
is tiny.

Cutoff check through prime `97`:

- endpoint mean correlation `-0.000772`
- endpoint aggregate `-0.150751`
- controls `-0.101405 .. 0.106615`
- composite aggregate `-0.259623`

Changing the local cutoff materially changes the integer aggregate, and the
composite eligible control is the same scale or larger. That is a fail for a
prime-specific residual.

Function-field endpoint:

| universe | endpoint | adjacent pairs | mean corr | aggregate | controls |
| --- | ---: | ---: | ---: | ---: | --- |
| `F_2[t]` | degree 24 | 109,133 | -0.004559 | -1.505915 | `-0.483351 .. 0.390085` |
| `F_3[t]` | degree 15 | 344,766 | -0.001050 | -0.616582 | `-0.403387 .. 0.484416` |

This looks tempting if read as endpoints only, but it fails the structure
gate. `F_2[t]` is dominated by small `(k,e)` classes such as
`k1-3/e6-4` with aggregate `-0.970` and repeated strongest pairs at
correlation `-0.9682`. `F_3[t]` shows the same pathology, with classes like
`k3-3/e4-7` at aggregate `-0.890` and strongest pairs near `0.98`. The
coefficient-window adjacency is doing work that is not coordinate-free.

Residual/exponent check:

The intended null-normalized statistic already scales by `sqrt(pair count)`.
The observed integer mean correlations are only about `10^-3`, with no stable
sign under fresh blocks or cutoff changes. There is no theta to estimate for a
critical-line residual; the visible scale is adjacent eligible-process noise.

Factor check:

This is not a multiplier twist of `psi` or `M`, but it still collapses: the
construction is a local eligible-set operator plus an adjacent coordinate
transport. Once the exact eligible sets and exact prime counts are kept, the
remaining integer signal is null-scale and cutoff-sensitive. On the
function-field side, the transport coordinate itself creates artifacts.

### BREAK

GRAVEYARD verdict: not a new critical line. Adjacent local-eligible occupancy
autocorrelation breaks as eligible-process noise plus coefficient-transport
artifact.

How it broke:

1. Integer fresh blocks do not show stable growth or sign:
   `-0.048276`, `-0.049013`, `0.010754`, `-0.310727`.
2. The primary endpoint only barely clears five shuffled controls, and the
   clearance is much too fragile to count as a line.
3. Increasing the small-prime cutoff from `47` to `97` moves the integer
   endpoint aggregate from `-0.310727` to `-0.150751`.
4. Composite eligible controls reproduce the scale; at cutoff `97` the
   composite aggregate is `-0.259623`, larger in magnitude than the prime
   aggregate.
5. The apparent `F_2[t]`/`F_3[t]` signal is not coordinate-free. It is
   dominated by tiny eligible-set classes and repeated coefficient-adjacent
   extreme correlations.
6. The raw atom did not reveal a line; all structure came from a fragile
   adjacent transport operator.

CONNECTION: this extends the Cycle 26/27 lesson. The local eligible process
is strong enough that even a two-window operator mostly measures null
geometry. The function-field side warns that coefficient adjacency is another
artifact factory, close in spirit to the earlier lex/coefficient-ordering
warning.

### LEARN

The local eligible process is now the base space, not a nuisance correction.
But adjacent offsets are still too coordinate-dependent. A better next
hallucination should either:

1. use a permutation-invariant spectrum of the eligible occupancy process, or
2. randomize the transport itself and ask for an intrinsic operator residual,
   not one tied to the next coefficient/index.

## HANDOFF 27

Status: no survivor; twenty-eight graveyard/calibration entries in this
ledger. Cycle 28 closed the adjacent eligible-window autocorrelation attempt.

New code since the previous handoff:

- reproducible audit script `scripts/eligible-adjacent-audit.mjs`
- artifact reports and previews:
  - `logs/playground-artifacts/eligible-adjacent-audit-16000000-p47-f32.md`
  - `logs/playground-artifacts/eligible-adjacent-audit-16000000-p97-f32.md`
  - `logs/playground-artifacts/eligible-adjacent-audit-16000000-p47-f32.png`
  - `logs/playground-artifacts/eligible-adjacent-audit-16000000-p97-f32.png`
  - `logs/playground-artifacts/eligible-adjacent-atom-200k.png`

No new lab primitive was added in Cycle 28.

Next cycle suggestion:

Try an intrinsic, permutation-invariant statistic on the local eligible
occupancy process. For each window, build the centered occupancy vector, then
compare spectra or energy distributions under random relabelings of eligible
offsets rather than the literal adjacent coordinate map. Preregister the
failure mode as "eligible-set finite geometry" or "density-only spectrum."

## Cycle 29 — local eligible Fourier-power entropy

### HALLUCINATE

Guess:

The adjacent-coordinate operator failed because it transported offsets between
neighboring windows. Replace transport with the unlabeled distribution of
Fourier power inside one window.

For each local eligible `210`-window, form the centered occupancy vector

`v_m(a)=1_{mW+a prime} - k_m/|E_m|` on eligible offsets and `0` outside.

Compute the cyclic Fourier powers `|hat v_m(j)|^2` for nonzero frequencies,
normalize them by total power, and score the spectral entropy

`H_m = -sum_j p_j log(p_j) / log(#frequencies)`.

Parseval fixes total power once `(k_m, |E_m|)` is fixed, so entropy asks a
different question: is the prime residual energy spread across characters in
a way that exact local eligible count-matched random subsets do not mimic?
The `F_q[t]` analogue uses all nonzero additive characters on low-degree
coefficient windows and the entropy of their Fourier-power multiset, which is
invariant under linear relabeling of coordinates.

Why it could be a line: if prime regularity is an intrinsic smoothing of
local eligible residuals, not a literal adjacent-position effect, the average
entropy residual should be a flat line with stable `sqrt(#windows)` scaling.
This is spectral/RMT-flavored but uses no zeta zeros and no zero table.

Preregistered confirmation: integer entropy residual has a stable sign and
effect size across fresh blocks, lies outside five exact eligible
count-matched controls, composite eligible controls fail it, and `F_2[t]` /
`F_3[t]` show comparable signed residuals without domination by small
`(k, |E|)` classes.

Preregistered break: the residual is inside controls, changes with small-prime
cutoff, composites reproduce it, the statistic reduces to pair/autocorrelation
geometry, or the field side is dominated by tiny finite-vector classes. Then
this becomes spectral eligible-set calibration, not a critical line.

### SEE IT

Rendered one-character atom:

- `node scripts/explore.mjs eval '{"domain":"int","N":200000,"ex":"n","ey":"(isprime(n)-rowvis(n,47)/log(max(n,3)))*cos(2*pi*n/210)"}'`
- scalar metrics: `linearity=1.525e-6`, `flatness=3.516`,
  `zeroCrossings=12780`
- screenshot: `logs/playground-artifacts/eligible-spectrum-atom-200k.png`

The raw atom is visually a thin, sparse horizontal band. It does not show a
line before the full local-eligible spectral normalization.

Audit artifacts:

- pilot report: `logs/playground-artifacts/eligible-spectrum-audit-1000000-p47-f32.md`
- primary report: `logs/playground-artifacts/eligible-spectrum-audit-16000000-p47-f32.md`
- primary preview: `logs/playground-artifacts/eligible-spectrum-audit-16000000-p47-f32.png`
- cutoff check: `logs/playground-artifacts/eligible-spectrum-audit-16000000-p97-f32.md`
- cutoff preview: `logs/playground-artifacts/eligible-spectrum-audit-16000000-p97-f32.png`

The preview is almost the desired shape for the wrong reason: every trace is
close to the zero line. There is no strong straight residual to explain.

### GROUND IT

Statistic:

For each window, `H_m` is the normalized entropy of the nonzero Fourier-power
distribution of the centered occupancy vector. The reported aggregate is

`sum(H_m - local shuffled mean_m) / sqrt(window count)`.

Primary cutoff: integer small primes `11..47`; `F_2[t]` factors through degree
`3` with additive window `F_2^5`; `F_3[t]` factors through degree `2` with
additive window `F_3^3`.

Integer fresh-block path:

| block | windows | mean entropy | local mean | mean residual | aggregate | composite aggregate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `1e6..2e6` | 4,761 | 0.908482 | 0.908754 | -0.000272 | -0.018751 | -0.047575 |
| `2e6..4e6` | 9,523 | 0.908772 | 0.908908 | -0.000136 | -0.013273 | 0.002079 |
| `4e6..8e6` | 19,047 | 0.909026 | 0.908979 | 0.000047 | 0.006490 | -0.030214 |
| `8e6..16e6` | 38,094 | 0.908938 | 0.909024 | -0.000086 | -0.016780 | -0.003852 |

Endpoint shuffled-control aggregate range: `-0.009769 .. 0.013741`.
The integer endpoint is just outside these five controls, but by only
`0.0030` aggregate units and after a sign-changing fresh-block path.

Cutoff check through prime `97`:

- endpoint mean entropy `0.909202`
- local mean `0.909284`
- mean residual `-0.000082`
- aggregate `-0.016047`
- controls `-0.030006 .. 0.021665`
- composite aggregate `-0.018665`

The stronger local sieve leaves the same tiny integer residual and the
composite aggregate is the same scale.

Function-field endpoint:

| universe | endpoint | windows | mean residual | aggregate | controls | composite aggregate |
| --- | ---: | ---: | ---: | ---: | --- | ---: |
| `F_2[t]` | degree 24 | 415,000 | 0.000011 | 0.007196 | `-0.038732 .. 0.027194` | -0.048323 |
| `F_3[t]` | degree 15 | 467,414 | 0.000106 | 0.072130 | `-0.051791 .. 0.028561` | 0.001693 |

`F_2[t]` is completely control-scale. `F_3[t]` is slightly outside five
controls at the endpoint, but the degree path is jagged:
`-0.103671`, `0.093634`, `0.042397`, `0.072130`. It is not a stable signed
line.

Class and visual checks:

The integer endpoint has no dominant class large enough to rescue it; the
largest class aggregate is about `-0.056`. The finite-field strongest windows
repeat discrete entropy levels, especially `F_2[t]` windows with `k3/e6` and
entropy `0.6474`, and `F_3[t]` windows with `k4/e8`. That is finite-vector
class geometry, not a transportable prime law.

Residual/exponent check:

The residual is already normalized by `sqrt(windows)`. The integer mean
residual is only about `8.6e-5` and does not grow into a stable effect under
range extension. There is no critical-line theta to estimate; the signal is
sub-control-scale eligible-spectrum noise.

Factor check:

This does not collapse to `psi`, `M`, or a zero-free twist. It collapses
earlier: Parseval fixes total energy by `(k, |E|)`, and the entropy shape left
after exact eligible/count shuffling is almost entirely the same
finite-population spectral geometry.

### BREAK

GRAVEYARD verdict: not a new critical line. Local eligible Fourier-power
entropy breaks as spectral eligible-set calibration.

How it broke:

1. The integer fresh-block aggregate is tiny and unstable:
   `-0.018751`, `-0.013273`, `0.006490`, `-0.016780`.
2. The p47 endpoint barely escapes five controls, and p97 puts it plainly
   inside controls.
3. Composite eligible controls reproduce the scale; at cutoff `97`,
   composite aggregate `-0.018665` is slightly larger in magnitude than the
   prime aggregate `-0.016047`.
4. `F_2[t]` is null-scale. `F_3[t]` is endpoint-positive but jagged across
   degree and class-discrete.
5. The raw atom is a horizontal sparse band, not a line. The only visible
   structure in the audit is near-zero residual.
6. The statistic is ultimately a nonlinear pair/autocorrelation summary of a
   finite eligible set; the exact local count-matched shuffle already models
   it.

CONNECTION: this is the spectral form of the Cycle 24-28 lesson. Count,
pair-shape, local-sieve shape, predecessor rank, adjacent occupancy, and now
Fourier-power entropy all collapse once the exact local eligible process is
the null. The residual base space is real; this particular entropy functional
is not the critical line.

### LEARN

Moving from adjacent transport to intrinsic spectrum removed one artifact but
also removed the effect. That is useful: local eligible occupancy behaves
close to maximum-entropy after exact count conditioning.

Next hallucination should stop asking one-window occupancy functions to carry
the line. The next object should connect windows through an invariant that is
not a coordinate map and not reducible to pair/autocorrelation: for example,
an optimal-transport distance between the empirical distribution of eligible
prime gaps and its local shuffled distribution, with the ground metric itself
randomized as a control.

## HANDOFF 28

Status: no survivor; twenty-nine graveyard/calibration entries in this
ledger. Cycle 29 closed the local eligible Fourier-power entropy attempt.

New code since the previous handoff:

- reproducible audit script `scripts/eligible-spectrum-audit.mjs`
- artifact reports and previews:
  - `logs/playground-artifacts/eligible-spectrum-audit-16000000-p47-f32.md`
  - `logs/playground-artifacts/eligible-spectrum-audit-16000000-p97-f32.md`
  - `logs/playground-artifacts/eligible-spectrum-audit-16000000-p47-f32.png`
  - `logs/playground-artifacts/eligible-spectrum-audit-16000000-p97-f32.png`
  - `logs/playground-artifacts/eligible-spectrum-atom-200k.png`

No new lab primitive was added in Cycle 29.

Next cycle suggestion:

Try a cross-window object whose matching is intrinsic rather than by offset
coordinate: compare each prime subset to its local shuffled distribution via a
small optimal-transport or energy-distance functional, then randomize the
ground metric itself. Preregister the expected death as "pair geometry in
another norm" or "metric artifact."

## Cycle 30 — local eligible distance-transport residual

### HALLUCINATE

Guess:

The entropy branch collapsed because it only measured the spectrum of one
occupancy vector. Try the geometric object directly: for each local eligible
window, take the chosen prime offsets, compute the sorted multiset of pairwise
distances, and compare that empirical distance distribution to the local
eligible/count-shuffled center by a small Wasserstein-1 distance.

In integers the ground metric is the circular distance on the `210` wheel:

`d(a,b)=min(|a-b|,210-|a-b|)/210`.

In `F_q[t]`, use the short-interval ultrametric
`d(f,g)=q^deg(f-g)/q^(h-1)` on the low-degree offset space. This is not fully
coordinate-free, so the preregistered adversary is "metric artifact."

For a window with prime subset `P_m`, define `D(P_m)` as the mean absolute
difference between its sorted pair-distance vector and the per-rank mean of
five count-matched local eligible shuffles. The residual is

`D(P_m) - mean_j D(control_{m,j})`,

aggregated by `sqrt(#windows)`. Composite controls use the same count selected
from local eligible composites.

Why it could be a line: if primes have intrinsic regularity as finite metric
subsets after the local eligible process is removed, the prime distance
distribution should sit consistently closer to, or farther from, its local
random center than fake subsets. This is an optimal-transport shaped residual
instead of a coordinate adjacency or single moment.

Preregistered confirmation: integer residual has stable sign/effect across
fresh blocks, lies outside five leave-one local-shuffle fake seeds, composite
eligible controls fail it, and `F_2[t]`/`F_3[t]` show comparable signed
behavior without domination by small `(k, |E|)` classes.

Preregistered break: the residual is control-scale, composite controls
reproduce it, p47/p97 cutoffs disagree, the field side is ultrametric
class-dominated, or this reduces to the known count/pair-distance window
geometry from Cycles 24-26. Then it is distance-transport calibration, not a
critical line.

### SEE IT

Rendered raw gap atom:

- `node scripts/explore.mjs eval '{"domain":"prime","N":200000,"ex":"n","ey":"(gap(n)-log(max(n,3)))/sqrt(max(log(max(n,3)),1))"}'`
- scalar metrics: `linearity=7.443e-6`, `flatness=1.334`,
  `zeroCrossings=9130`
- screenshot: `logs/playground-artifacts/eligible-distance-gap-atom-200k.png`

The raw prime-gap residual is a horizontal noisy band with outliers, not a
sharp line.

Audit artifacts:

- pilot report: `logs/playground-artifacts/eligible-distance-audit-1000000-p47-f32.md`
- primary report: `logs/playground-artifacts/eligible-distance-audit-16000000-p47-f32.md`
- primary preview: `logs/playground-artifacts/eligible-distance-audit-16000000-p47-f32.png`
- cutoff check: `logs/playground-artifacts/eligible-distance-audit-16000000-p97-f32.md`
- cutoff preview: `logs/playground-artifacts/eligible-distance-audit-16000000-p97-f32.png`

The previews show the integer prime and composite traces nearly overlapping
near zero. The field traces are larger but jagged, and their strongest windows
are dominated by repeated `k=2` ultrametric extremes.

### GROUND IT

Statistic:

For each window, sort the pairwise-distance vector of the chosen offsets. For
five exact eligible/count local shuffles, form leave-one centers and compute a
Wasserstein-style mean absolute transport distance to those centers. The
reported residual is:

`(observed distance excess) - (mean fake distance excess)`,

summed over windows and divided by `sqrt(window count)`.

Primary cutoff: integer small primes `11..47`; `F_2[t]` factors through degree
`3` with additive window `F_2^5`; `F_3[t]` factors through degree `2` with
additive window `F_3^3`.

Integer fresh-block path:

| block | windows | real excess | fake excess | mean residual | aggregate | composite aggregate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `1e6..2e6` | 4,761 | 0.002803 | 0.002744 | 0.000059 | 0.004061 | 0.006823 |
| `2e6..4e6` | 9,523 | 0.003102 | 0.002965 | 0.000136 | 0.013283 | -0.008990 |
| `4e6..8e6` | 19,047 | 0.003082 | 0.003193 | -0.000110 | -0.015233 | -0.013277 |
| `8e6..16e6` | 38,094 | 0.003465 | 0.003391 | 0.000074 | 0.014350 | 0.015428 |

Endpoint leave-one fake control aggregate range: `-0.005988 .. 0.004882`.
The endpoint is outside these five controls, but the fresh-block path changes
sign and the composite aggregate is slightly larger than the prime aggregate.

Cutoff check through prime `97`:

- endpoint real excess `0.003413`
- fake excess `0.003311`
- mean residual `0.000102`
- aggregate `0.019934`
- controls `-0.012163 .. 0.008566`
- composite aggregate `0.009586`

The sign survives cutoff change, but the scale remains extremely small and
not prime-specific.

Function-field endpoint:

| universe | endpoint | windows | mean residual | aggregate | controls | composite aggregate |
| --- | ---: | ---: | ---: | ---: | --- | ---: |
| `F_2[t]` | degree 24 | 208,663 | -0.000559 | -0.255471 | `-0.133575 .. 0.279732` | -0.417479 |
| `F_3[t]` | degree 15 | 306,606 | -0.000442 | -0.244778 | `-0.197279 .. 0.301270` | -0.272073 |

Both field endpoints are control-scale. The degree paths are jagged rather
than line-like: `F_2[t]` moves `-0.012130`, `-0.003506`, `-0.074385`,
`-0.255471`; `F_3[t]` moves `0.078989`, `-0.333900`, `0.168354`,
`-0.244778`.

Class and factor checks:

The integer strongest endpoint classes are tiny (`k=2` or `k=3` one-window
classes) and cannot support a stable line. The field side is dominated by
ultrametric discreteness: strongest `F_2[t]` windows repeatedly have `k=2`
and residual `0.75000`; strongest `F_3[t]` windows repeatedly have `k=2` and
residual `0.88889`. That is metric/class artifact, not a two-universe law.

This does not factor to `psi` or `M`, but it does factor through the known
pair-distance window geometry. Sorting the whole pair-distance vector is a
richer norm on the same pairwise-distance data from Cycle 24.

Residual/exponent check:

The residual is already `sqrt(windows)` normalized. Integer mean residuals are
only `~1e-4`, and the fresh-block sign is not stable. There is no critical
line exponent to estimate.

### BREAK

GRAVEYARD verdict: not a new critical line. Local eligible distance transport
breaks as pair-geometry calibration plus finite-field metric artifact.

How it broke:

1. Integer fresh blocks are tiny and sign-changing:
   `0.004061`, `0.013283`, `-0.015233`, `0.014350`.
2. The p47 endpoint is outside five fake controls, but composite is the same
   scale and slightly larger: `0.015428` versus prime `0.014350`.
3. The p97 endpoint keeps a small positive sign, but composite remains same
   order: `0.009586` versus prime `0.019934`.
4. `F_2[t]` and `F_3[t]` are inside their fake-control ranges at the full
   endpoint and have jagged degree paths.
5. Strongest field windows are repeated `k=2` ultrametric atoms, not intrinsic
   prime regularity.
6. The construction is a dressed-up pair-distance functional, returning to
   the Cycle 24 pair-geometry branch.

CONNECTION: this is the optimal-transport version of the count-conditioned
pair-distance graveyard. The local eligible null already models almost all
finite metric-subset geometry; what remains is too small, composite-scale, and
not portable to `F_q[t]`.

### LEARN

The local eligible funnel has now killed moment, shape, predecessor, adjacent,
spectral, and transport functionals of short-window subsets. The next useful
break should probably leave short windows entirely or use a statistic whose
known obstruction is not pair geometry.

Next hallucination: try a nonlocal prime-order object with local arithmetic
removed, such as a signed martingale of consecutive-prime residue transitions
after exact Markov calibration. Preregister the likely death as
Lemke-Oliver-Soundararajan style residue bias or Markov-chain calibration.

## HANDOFF 29

Status: no survivor; thirty graveyard/calibration entries in this ledger.
Cycle 30 closed the local eligible distance-transport attempt.

New code since the previous handoff:

- reproducible audit script `scripts/eligible-distance-transport-audit.mjs`
- artifact reports and previews:
  - `logs/playground-artifacts/eligible-distance-audit-16000000-p47-f32.md`
  - `logs/playground-artifacts/eligible-distance-audit-16000000-p97-f32.md`
  - `logs/playground-artifacts/eligible-distance-audit-16000000-p47-f32.png`
  - `logs/playground-artifacts/eligible-distance-audit-16000000-p97-f32.png`
  - `logs/playground-artifacts/eligible-distance-gap-atom-200k.png`

No new lab primitive was added in Cycle 30.

Next cycle suggestion:

Leave short-window eligible subsets. Try a consecutive-prime transition object:
condition on each prime's residue class modulo a primorial and compare the
next-prime residue transition residual to an exact empirical Markov null,
then test against composites, local shuffles, and function-field transition
chains. Expect death by LO-S residue bias or Markov calibration.

## Cycle 31 — holdout residue-transition Markov surprise

### HALLUCINATE

Guess:

Leave short windows. Use the prime order itself. For consecutive primes
`p_i,p_{i+1}`, look only at their reduced residue classes modulo a wheel
`W` (`30` and `210`). On each fresh range `[X/2,X]`, train a smoothed
transition matrix `P_train(b|a)` on the lower half, then score the upper half
by the average holdout log surprise

`L = mean_i log P_train(r_{i+1}|r_i)`.

Subtract a row-shuffled null that keeps the test current residues and the
test next-residue multiset but breaks transition pairing. Report

`S = (L_real - mean L_shuffle) * sqrt(#test transitions)`.

This is a martingale-shaped object: if the transition law is stable across
scale, the cumulative surprise advantage should form a stable flat line. It
uses no zeta zeros and no short-window eligible geometry.

Integer controls:

- five Cramér fake prime sequences,
- five wheel-density sequences on reduced residues,
- five composite-only wheel-density sequences,
- row-shuffled controls for every sequence.

Function-field analogue:

For monic irreducibles of fixed degree, use residue classes modulo a small
irreducible polynomial and the coefficient-order chain, with the warning that
this order is not coordinate-free. This is included to catch whether the
integer transition effect has any two-universe transport, or dies as an
encoding artifact.

Why it could be a line: the local eligible process killed finite subset
geometry, but consecutive-prime residue transitions are a nonlocal dynamical
object. If prime order carries a stable arithmetic memory after row-shuffle
calibration, the holdout surprise advantage might be an intrinsic flat line
with `sqrt(#transitions)` scaling.

Preregistered confirmation: integer `S` has stable sign/effect across fresh
scales, beats five Cramér and wheel controls, composite-only controls fail,
and `F_2[t]`/`F_3[t]` show comparable signed behavior without single-state
or coefficient-order domination.

Preregistered break: the effect is exactly Lemke-Oliver-Soundararajan
consecutive-prime residue bias / first-order Markov memory; Cramér/wheel or
composites reproduce it; it vanishes under row-shuffle; the function-field
side is coefficient-order artifact; or the same-block exact Markov model
would tautologically absorb it. Then it is transition-bias calibration, not a
critical line.

### SEE IT

Rendered raw transition atom:

- `node scripts/explore.mjs eval '{"domain":"prime","N":200000,"ex":"n","ey":"sin(2*pi*n/210)*sin(2*pi*(n+gap(n))/210)"}'`
- scalar metrics: `linearity=3.724e-4`, `flatness=0.751`,
  `zeroCrossings=3808`
- screenshot: `logs/playground-artifacts/residue-transition-holdout-atom-200k.png`

The raw atom is a near-horizontal band. The candidate line only appears after
the holdout transition-matrix score is aggregated.

Audit artifacts:

- pilot report: `logs/playground-artifacts/residue-transition-holdout-audit-1000000-q30-210-f32.md`
- primary report: `logs/playground-artifacts/residue-transition-holdout-audit-16000000-q30-210-f32.md`
- primary preview: `logs/playground-artifacts/residue-transition-holdout-audit-16000000-q30-210-f32.png`

The preview is decisive: the real integer prime curve almost rides on top of
the wheel-density fake curve. The object found transition memory, but not
prime-only transition memory.

### GROUND IT

Statistic:

For each fresh range `[X/2,X]`, train `P_train(b|a)` on the lower half's
residue transitions, score the upper half by mean log likelihood, subtract
five row-shuffled next-residue controls, and multiply by
`sqrt(test transitions)`.

Primary integer moduli: `30` and `210`; smoothing `0.5`.

Integer path, modulus `30`:

| block | transitions | observed | fake mean | residual | aggregate | controls |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `1e6..2e6` | 34,777 | -1.888381 | -2.311224 | 0.422843 | 78.854328 | `-0.565941 .. 1.100479` |
| `2e6..4e6` | 66,329 | -1.904871 | -2.285943 | 0.381071 | 98.142654 | `-1.345528 .. 1.112807` |
| `4e6..8e6` | 126,927 | -1.920523 | -2.263177 | 0.342654 | 122.076770 | `-1.080431 .. 0.625474` |
| `8e6..16e6` | 243,069 | -1.934634 | -2.243815 | 0.309181 | 152.432674 | `-0.916401 .. 1.278726` |

Final controls at modulus `30`:

- Cramér aggregate range: `91.436129 .. 92.742743`
- wheel aggregate range: `161.893762 .. 164.634517`
- composite aggregate range: `70.027394 .. 71.196689`

Integer path, modulus `210`:

| block | transitions | observed | fake mean | residual | aggregate | controls |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `1e6..2e6` | 34,777 | -2.046660 | -6.195831 | 4.149171 | 773.762017 | `-2.412969 .. 3.192506` |
| `2e6..4e6` | 66,329 | -2.089030 | -6.545064 | 4.456035 | 1147.625734 | `-2.944753 .. 2.865091` |
| `4e6..8e6` | 126,927 | -2.133896 | -6.857535 | 4.723639 | 1682.882174 | `-1.975921 .. 2.210431` |
| `8e6..16e6` | 243,069 | -2.181235 | -7.114923 | 4.933688 | 2432.408255 | `-3.942334 .. 3.285972` |

Final controls at modulus `210`:

- Cramér aggregate range: `1426.419345 .. 1431.210092`
- wheel aggregate range: `2395.348001 .. 2401.489245`
- composite aggregate range: `1571.700223 .. 1583.780605`

This breaks the prime-specific gate. The row-shuffle null makes the effect
look gigantic, but wheel-density fake sequences reproduce essentially the
whole modulus-`210` effect.

Function-field encoded-order check:

| universe | endpoint | transitions | residual | aggregate | controls | composite aggregate range |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| `F_2[t]` | degree 24 | 299,521 | 0.041473 | 22.697616 | `-0.104586 .. 0.240780` | `1.230738 .. 1.396778` |
| `F_3[t]` | degree 15 | 418,486 | 0.056748 | 36.710375 | `-0.632772 .. 0.780383` | `8.955617 .. 9.571079` |

These are outside row-shuffle controls, but the field chain is coefficient
order. It is not a coordinate-free analogue of consecutive primes over `Z`.
Also the scale is not comparable to the integer wheel effect.

Factor/known check:

This is not a disguised `psi` or `M`, but it is a known branch: the
Lemke-Oliver-Soundararajan consecutive-prime residue bias / residue-transition
memory. The holdout matrix merely learns the stable first-order transition
law. If the same block were used for the Markov model, the calibration would
absorb the target by construction.

Residual/exponent check:

The integer aggregate grows roughly like `sqrt(#transitions)` because the
per-transition row-shuffle residual is enormous and stable:
`4.149171`, `4.456035`, `4.723639`, `4.933688` at modulus `210`. That scaling
does encode transition predictability, but controls show it is wheel/residue
structure rather than prime-only critical-line regularity.

### BREAK

GRAVEYARD verdict: not a new critical line. Holdout residue-transition
Markov surprise breaks as row-shuffle-null failure plus LO-S/Markov transition
calibration.

How it broke:

1. The integer effect is real but not prime-specific. At modulus `210`, real
   primes aggregate `2432.408255`, while wheel fake controls are
   `2395.348001 .. 2401.489245`.
2. Composite-only wheel-density controls are also enormous:
   `1571.700223 .. 1583.780605`.
3. Cramér controls are also huge at modulus `210`:
   `1426.419345 .. 1431.210092`.
4. Row-shuffling next residues is too weak a null; it destroys deterministic
   wheel/gap residue compatibility that any ordered sparse sequence on the
   reduced wheel inherits.
5. The function-field side is encoded-order dependent, exactly the artifact
   class the council warned about.
6. The effect is the known consecutive-prime residue transition phenomenon,
   not a new critical line.

CONNECTION: this leaves the local eligible subset funnel but lands in a known
different funnel: LO-S residue transition bias. The break is valuable because
it shows that "nonlocal order" can produce a very sharp line, but only if the
null is too weak. The wheel fake curve nearly matching primes is the giveaway.

### LEARN

The next transition attempt must preserve wheel/gap compatibility in the null,
not merely shuffle next residues. A stronger null should condition on the
actual gap modulo `W` or train a gap-conditioned transition matrix. If
anything remains after gap-conditioned Markov calibration, it would be a
sharper candidate.

## HANDOFF 30

Status: no survivor; thirty-one graveyard/calibration entries in this ledger.
Cycle 31 closed the holdout residue-transition Markov surprise attempt.

New code since the previous handoff:

- reproducible audit script `scripts/residue-transition-holdout-audit.mjs`
- artifact reports and previews:
  - `logs/playground-artifacts/residue-transition-holdout-audit-16000000-q30-210-f32.md`
  - `logs/playground-artifacts/residue-transition-holdout-audit-16000000-q30-210-f32.png`
  - `logs/playground-artifacts/residue-transition-holdout-atom-200k.png`

No new lab primitive was added in Cycle 31.

Next cycle suggestion:

Repair the transition null by conditioning on the actual gap residue
`g mod W`: train `P(b | a, g mod W)` or subtract the deterministic
compatibility class, then test whether any holdout transition surprise
remains. Expect death by exact gap-residue calibration.

## Cycle 32 — gap-conditioned transition compatibility quotient

### HALLUCINATE

Guess:

Cycle 31 found a huge holdout residue-transition line, but wheel-density
controls matched it. The suspected reason is simple: for every ordered
integer sequence,

`r_{i+1} = r_i + gap_i (mod W)`.

So the row-shuffled null was breaking an arithmetic identity. Repair the null
by conditioning on the actual gap residue `h_i = gap_i mod W`.

Candidate object:

For each fresh range and modulus `W`, compare three upper-half scores:

1. first-order Markov surprise: train `P(b|a)` on the lower half,
2. gap-conditioned surprise: train `P(b|a,h)` on the lower half,
3. exact compatibility quotient: the violation rate of
   `b = a+h (mod W)`.

The hoped-for line is the residual

`S_gap = (L_gap_real - mean L_gap_compatible_shuffle) * sqrt(#transitions)`,

where compatible shuffles keep the current residue `a` and gap residue `h`
and therefore must set `b=a+h`. If the prime order has structure beyond
compatibility, it should survive in the gap-conditioned likelihood. If the
previous line was only compatibility, this residual collapses to zero and the
compatibility quotient is identically exact.

Why it could be a line: the gap residue removes deterministic wheel
bookkeeping but still leaves the actual sequence of gap residues and current
residues. A residual here would be a real nonlocal transition law, not merely
the LO-S first-order residue effect.

Preregistered confirmation: integer `S_gap` is stable and nonzero across
fresh scales, beats five Cramér/wheel/composite controls, and does not vanish
under compatible shuffles. Function-field analogues show comparable signed
behavior without coefficient-order domination.

Preregistered break: `b=a+h mod W` absorbs the transition completely;
compatible shuffles are identical to real for the tested observable;
gap-conditioned residual is zero/control-scale; or any leftover is only
coverage/sparsity from unseen `(a,h)` classes. Then this is exact
gap-residue calibration, not a critical line.

### SEE IT

Rendered compatibility identity:

- `node scripts/explore.mjs eval '{"domain":"prime","N":200000,"ex":"n","ey":"mod(n+gap(n),210)-mod(mod(n,210)+mod(gap(n),210),210)"}'`
- scalar metrics: `linearity=1`, `flatness=0`, `zeroCrossings=0`
- screenshot: `logs/playground-artifacts/residue-transition-gapcondition-identity-200k.png`

This is a perfect flat line for the bad reason: it is exactly the congruence
identity `p_{next} = p + gap(p)`.

Audit artifacts:

- pilot report: `logs/playground-artifacts/residue-transition-gapcondition-audit-1000000-q30-210-f32.md`
- primary report: `logs/playground-artifacts/residue-transition-gapcondition-audit-16000000-q30-210-f32.md`
- primary preview: `logs/playground-artifacts/residue-transition-gapcondition-audit-16000000-q30-210-f32.png`

The preview shows three things at once: first-order transition surprise is
large, gap-conditioned row-shuffle surprise is even larger, and the exact
compatibility quotient is the zero dashed line.

### GROUND IT

Statistic:

For each transition, record current residue `a`, gap residue `h`, and next
residue `b`. The repaired quotient asks whether there is any next-residue
freedom after conditioning on `(a,h)`. Since `b=a+h mod W`, the exact
quotient is the compatibility violation rate.

Integer path, modulus `30`:

| block | transitions | first-order aggregate | gap-row-shuffle aggregate | violations | unseen context rate |
| --- | ---: | ---: | ---: | ---: | ---: |
| `1e6..2e6` | 34,777 | 78.854328 | 1178.244947 | 0 | 0.000000 |
| `2e6..4e6` | 66,329 | 98.142654 | 1765.575178 | 0 | 0.000000 |
| `4e6..8e6` | 126,927 | 122.076770 | 2640.536732 | 0 | 0.000000 |
| `8e6..16e6` | 243,069 | 152.432674 | 3928.417333 | 0 | 0.000000 |

Final controls at modulus `30`:

- Cramér gap-row-shuffle aggregate range: `2947.427139 .. 2954.236151`
- wheel gap-row-shuffle aggregate range: `3931.844761 .. 3936.781169`
- composite gap-row-shuffle aggregate range: `3217.040194 .. 3231.317817`
- exact compatibility quotient: `0`

Integer path, modulus `210`:

| block | transitions | first-order aggregate | gap-row-shuffle aggregate | violations | unseen context rate |
| --- | ---: | ---: | ---: | ---: | ---: |
| `1e6..2e6` | 34,777 | 773.762017 | 966.262123 | 0 | 0.003422 |
| `2e6..4e6` | 66,329 | 1147.625734 | 1481.848270 | 0 | 0.001794 |
| `4e6..8e6` | 126,927 | 1682.882174 | 2257.022802 | 0 | 0.001379 |
| `8e6..16e6` | 243,069 | 2432.408255 | 3412.883719 | 0 | 0.000650 |

Final controls at modulus `210`:

- Cramér gap-row-shuffle aggregate range: `2026.780077 .. 2031.729051`
- wheel gap-row-shuffle aggregate range: `3412.127804 .. 3418.374575`
- composite gap-row-shuffle aggregate range: `2641.122297 .. 2653.201149`
- exact compatibility quotient: `0`

Function-field encoded-order check:

| universe | endpoint | transitions | first-order aggregate | gap-row-shuffle aggregate | violations | composite gap aggregate range |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `F_2[t]` | degree 24 | 253,438 | 26.154260 | 4018.266465 | 0 | `4078.467960 .. 4086.541771` |
| `F_3[t]` | degree 15 | 362,973 | 41.119047 | 4975.697754 | 0 | `4977.510850 .. 4981.610543` |

The same identity holds in the encoded polynomial residue arithmetic. The
field gap-row-shuffle scores are also enormous because the shuffle breaks
the exact compatibility identity.

Factor/known check:

The object does not collapse to `psi` or `M`; it collapses to the elementary
congruence identity:

`p_{i+1} mod W = (p_i mod W + (p_{i+1}-p_i) mod W) mod W`.

Thus the Cycle 31 transition line was not just LO-S residue memory; it was
also amplified by a null that violated deterministic gap-residue
compatibility.

Residual/exponent check:

The apparent gap-row-shuffle aggregates grow like `sqrt(transitions)` because
the fake null is invalid. The repaired exact quotient has aggregate `0` and
violation rate `0` at every scale. There is no residual exponent to estimate.

### BREAK

GRAVEYARD verdict: not a new critical line. Gap-conditioned transition
compatibility quotient breaks by exact congruence calibration.

How it broke:

1. Conditioning on `(current residue, gap residue)` determines the next
   residue exactly.
2. The exact compatibility quotient is identically zero for integer primes,
   Cramér fakes, wheel fakes, composites, and function-field encoded chains.
3. The huge gap-row-shuffle scores are diagnostic of an invalid null: they
   appear because shuffling `b` breaks `b=a+h mod W`.
4. Wheel controls again match the integer gap-row-shuffle scale at modulus
   `210`: primes `3412.883719`, wheel range `3412.127804 .. 3418.374575`.
5. The function-field side repeats the same identity in coefficient encoding,
   not a coordinate-free law.

CONNECTION: this is the exact calibration promised by Cycle 31. It explains
why the nonlocal transition line was so sharp: the null broke deterministic
gap-residue compatibility. Once that compatibility is included, the
next-residue observable has no degrees of freedom.

### LEARN

Transition experiments must move one level up: the variable with freedom is
the gap residue sequence itself, not the next residue after the gap is known.
The next attempt should test whether `gap mod W` has a residual law after
conditioning on current residue and local gap size/density.

## HANDOFF 31

Status: no survivor; thirty-two graveyard/calibration entries in this ledger.
Cycle 32 closed the gap-conditioned residue-transition quotient attempt.

New code since the previous handoff:

- reproducible audit script `scripts/residue-transition-gapcondition-audit.mjs`
- artifact reports and previews:
  - `logs/playground-artifacts/residue-transition-gapcondition-audit-16000000-q30-210-f32.md`
  - `logs/playground-artifacts/residue-transition-gapcondition-audit-16000000-q30-210-f32.png`
  - `logs/playground-artifacts/residue-transition-gapcondition-identity-200k.png`

No new lab primitive was added in Cycle 32.

Next cycle suggestion:

Test the gap-residue sequence directly. For each prime, condition on current
residue modulo `W` and a coarse normalized gap bin, then score
`gap mod W` against a holdout empirical null. Expect death by LO-S
gap-residue calibration or wheel-density controls.

## Cycle 33 — valid gap-residue holdout law

### HALLUCINATE

Guess:

Cycle 32 killed next-residue prediction because `b = a + h (mod W)` once the
gap residue `h = gap mod W` is known. The variable that still has freedom is
the gap residue sequence itself. Instead of asking where the next prime lands,
ask whether the residue of the next gap has a stable out-of-sample law after
conditioning on the current residue and coarse local gap size.

Candidate object:

For each fresh block and modulus `W`, split the block in half. From the lower
half, train a smoothed empirical law

`P_train(h | a, bin(gap/log p))`,

where `a = p mod W` and `h = gap mod W`. Score the upper half by mean log
likelihood and subtract the stronger valid-residue baseline

`P_0(h | a) = uniform over h with gcd(a+h,W)=1`.

The line candidate is the information advantage

`A_W = sqrt(#test transitions) * mean_test log(P_train(h|a,zbin) / P_0(h|a))`.

Why it could be a line: it is not a next-residue identity, and it is not a raw
density statistic. The baseline already knows the current wheel residue and
only allows gap residues that land in a reduced residue class. A surviving
advantage would mean consecutive primes carry a repeatable gap-residue law
beyond compatibility and one-point wheel eligibility.

Preregistered confirmation: integer `A_W` is stable in sign and effect size
across fresh scales, and the final value is not reproduced by five Cramer
fake-prime seeds, five wheel-density fake seeds, or five composite-only
wheel-density controls. A survivor should also not depend on endpoint-only
behavior or a single modulus, and any field check must be labeled cautiously
if it uses coefficient order.

Preregistered break: wheel-density controls reproduce the advantage; Cramer
already carries the same gap-residue law through valid landing constraints;
composites reproduce it; binning by the gap itself absorbs the effect; or the
field analogue is just coefficient-order noise. In those cases this becomes a
gap-residue calibration of the LO-S/local-wheel branch, not a new critical
line.

### SEE IT

Rendered the raw gap-residue target two ways:

- `node scripts/explore.mjs eval '{"domain":"prime","N":200000,"ex":"n","ey":"mod(gap(n),210)"}'`
  gave `linearity=0.011408`, `flatness=0.785691`, `yMin=0`, `yMax=86`.
  Screenshot: `logs/playground-artifacts/gapresidue-holdout-atom-200k.png`.
- `node scripts/explore.mjs eval '{"domain":"prime","N":200000,"ex":"mod(n,210)","ey":"mod(gap(n),210)"}'`
  gave `linearity=0.000138`, `flatness=0.785691`.
  Screenshot: `logs/playground-artifacts/gapresidue-plane-200k.png`.

The residue plane is the useful picture: it shows a sparse grid of allowed
current-residue/gap-residue cells with strong short-gap concentration. The
audit preview shows the tempting line: prime binned advantage climbs almost
linearly with `sqrt(transitions)`, but the wheel-density curve is nearly on
top of it.

Audit artifacts:

- pilot report: `logs/playground-artifacts/gapresidue-holdout-audit-1000000-q30-210-b4-f32.md`
- primary report: `logs/playground-artifacts/gapresidue-holdout-audit-16000000-q30-210-b4-f32.md`
- primary preview: `logs/playground-artifacts/gapresidue-holdout-audit-16000000-q30-210-b4-f32.png`

### GROUND IT

Statistic:

For each transition `p_i -> p_{i+1}`, record current residue
`a = p_i mod W`, target `h = gap_i mod W`, and normalized gap size
`z = gap_i/log(p_i)`. Train a smoothed empirical law on the lower half of a
fresh block and score the upper half:

`A_W = sqrt(T) mean log(P_train(h | a, zbin) / P_valid(h | a))`,

where `P_valid` is uniform over the gap residues that land in a reduced
residue class. The state-only score drops `zbin`; the incremental score is
the extra log score from adding the gap-size bin.

Integer path, modulus `30`:

| block | transitions | state aggregate | binned aggregate | bin incremental aggregate | binned advantage |
| --- | ---: | ---: | ---: | ---: | ---: |
| `1e6..2e6` | 34,777 | 35.630166 | 216.374187 | 180.744021 | 1.160270878 |
| `2e6..4e6` | 66,329 | 44.959523 | 252.056047 | 207.096524 | 0.978690554 |
| `4e6..8e6` | 126,927 | 56.617532 | 370.002500 | 313.384968 | 1.038550576 |
| `8e6..16e6` | 243,069 | 71.393008 | 516.001012 | 444.608003 | 1.046612136 |

Final controls at modulus `30`:

- Cramer binned aggregate range: `374.506402 .. 377.920308`
- wheel binned aggregate range: `500.896916 .. 506.724815`
- composite binned aggregate range: `345.142208 .. 351.243666`

Integer path, modulus `210`:

| block | transitions | state aggregate | binned aggregate | bin incremental aggregate | binned advantage |
| --- | ---: | ---: | ---: | ---: | ---: |
| `1e6..2e6` | 34,777 | 340.251263 | 538.895919 | 198.644657 | 2.889740451 |
| `2e6..4e6` | 66,329 | 458.987864 | 712.765100 | 253.777236 | 2.767545066 |
| `4e6..8e6` | 126,927 | 618.946357 | 1013.446121 | 394.499764 | 2.844616057 |
| `8e6..16e6` | 243,069 | 833.187491 | 1407.034906 | 573.847414 | 2.853908759 |

Final controls at modulus `210`:

- Cramer binned aggregate range: `905.054574 .. 908.335731`
- wheel binned aggregate range: `1389.175994 .. 1395.788612`
- composite binned aggregate range: `1080.668308 .. 1089.737444`

The mod-`210` aggregate exponent fit over fresh blocks was `0.498491`, which
is exactly what a stable positive mean advantage looks like after multiplying
by `sqrt(T)`. That is not automatically critical-line evidence; it means the
trained local gap-residue distribution is stable across adjacent blocks.

Prime-minus-wheel residual was small relative to the total and not stable:
at modulus `210` the binned differences were `5.350`, `24.221`, `16.423`,
`14.999` across the four blocks. At modulus `30` they were `3.906`,
`24.766`, `12.723`, `12.158`.

Function-field encoded-order check:

| universe | endpoint | transitions | state aggregate | binned aggregate | composite binned range |
| --- | ---: | ---: | ---: | ---: | --- |
| `F_2[t]` | degree 24 | 349,434 | 12.896507 | 205.164066 | `10.244856 .. 10.465007` |
| `F_3[t]` | degree 15 | 478,287 | 21.902811 | 62.933607 | `29.525742 .. 30.029146` |

The field check is still coefficient-order-based, but this cycle corrected a
tooling trap before logging the final artifact: `irreduciblesByDegree[d]`
already stores full monic polynomial encodings. Adding `q^d` again creates a
different encoded-order sequence and can inject invalid residue targets.
Final invalid-target rates after correction were `0` in all field rows.

Factor/known check:

This does not collapse to `psi` or `M`; it collapses to the local gap-residue
law of the wheel-conditioned label process. The valid landing baseline removes
the exact congruence identity from Cycle 32, but the empirical advantage is
mostly generated by the same finite-wheel + short-gap distribution that the
wheel-density fake reproduces.

### BREAK

GRAVEYARD verdict: not a new critical line. The valid gap-residue holdout law
breaks by local-wheel/gap-size calibration.

How it broke:

1. The binned advantage is real and stable, but the state+gap-size empirical
   model learns ordinary short-gap residue frequencies.
2. Wheel-density controls reproduce almost the whole integer line:
   at modulus `210`, primes ended at `1407.034906` while five wheel controls
   ended at `1389.175994 .. 1395.788612`.
3. Composite-only wheel-density labels carry a large same-direction line:
   `1080.668308 .. 1089.737444` at modulus `210`.
4. The residual above wheel is an endpoint-scale leftover, not a stable new
   line: prime-minus-wheel jumps `5.350 -> 24.221 -> 16.423 -> 14.999`.
5. Adding gap-size bins supplies most of the mod-`30` effect and a large part
   of the mod-`210` effect, so the statistic partly predicts `gap mod W` from
   the gap itself.
6. The function-field side again depends on coefficient order; after fixing
   the monic-encoding bug it is useful only as an artifact warning.

CONNECTION: this is the promised move one level above Cycle 32. It confirms
that targeting `gap mod W` avoids the exact next-residue identity, but the
first stable line encountered is still the Lemke-Oliver-Soundararajan /
finite-wheel calibration layer. Cramer alone was too weak; the wheel-density
fake is the right falsifier here.

### LEARN

For residue-transition work, valid landing constraints are necessary but not
sufficient. A strong next null must also preserve the empirical local gap
size distribution, or the model will simply learn that small gaps occupy a
small set of residues. The remaining prime-minus-wheel residue is small and
jagged; if revisited, it should be scored directly after subtracting a
many-seed wheel law, not promoted from the raw binned advantage.

Tooling lesson: in the function-field universe, `irreduciblesByDegree[d]`
stores monic polynomial encodings, not lower coefficients. Any script that
adds the leading term again is measuring an encoded-order artifact.

## HANDOFF 32

Status: no survivor; thirty-three graveyard/calibration entries in this
ledger. Cycle 33 closed the direct gap-residue holdout-law attempt.

New code since the previous handoff:

- reproducible audit script `scripts/gapresidue-holdout-audit.mjs`
- artifact reports and previews:
  - `logs/playground-artifacts/gapresidue-holdout-audit-16000000-q30-210-b4-f32.md`
  - `logs/playground-artifacts/gapresidue-holdout-audit-16000000-q30-210-b4-f32.png`
  - `logs/playground-artifacts/gapresidue-plane-200k.png`

No new lab primitive was added in Cycle 33.

Next cycle suggestion:

Leave consecutive-residue order for one cycle. Try a coordinate-free
"wheel-scrubbed gap-residue excess" only if it subtracts a many-seed wheel
law first; otherwise pivot to a non-residue object, e.g. an intrinsic
short-interval statistic comparing prime labels against exact local eligible
sets but using a random graph invariant rather than coordinate positions.

## Cycle 34 — local divisor-graph edge energy

### HALLUCINATE

Guess:

Leave consecutive residue order entirely. In each short window, treat the
candidate prime offsets as vertices of a graph. Put an arithmetic weight on
each edge by the number of distinct prime factors of the offset difference:

`w(u,v)=omega(|u-v|)`.

Then compare the average edge weight of the actual prime-offset graph against
exact count-matched random subsets of the same local eligible offsets
(eligible = no divisor by primes up to cutoff `B`). This is not a next-residue
transition law and not a density-only count. It asks whether primes choose a
different divisor-geometry inside the finite local sieve set.

Candidate object:

For `210`-wide windows and small-prime cutoff `B`, define

`E_B(window)=mean_{prime offset pairs u<v} omega(v-u)`.

Subtract the mean of five exact local-eligible count-matched shuffles in the
same window and aggregate over fresh blocks:

`G_B(X)=sqrt(#scored windows) * mean_window(E_real - E_shuffle)`.

Why it could be a line: Hardy-Littlewood says prime pairs prefer certain
difference structures, but this graph view deliberately forgets pair
coordinates and compresses the difference field into a divisor invariant. If a
stable line survives exact local eligibility, composites, and shuffle controls,
it would be an intrinsic short-interval graph law rather than another residue
ordering artifact.

Preregistered confirmation: `G_B` is stable in sign/effect size across
growing fresh blocks, beats five exact eligible-shuffle fake seeds and
composite-only eligible controls, and is not dominated by a few small
difference classes. The result should persist across cutoffs `B=47` and
`B=97`.

Preregistered break: the effect is explained by ordinary pair-correlation /
Hardy-Littlewood local factors; composite controls reproduce it; changing
`B` changes the sign/scale; or the top contribution is a handful of
small-prime difference classes. Then it is a local pair-geometry calibration,
not a critical line.

### SEE IT

Rendered the divisor-weighted gap atom:

- `node scripts/explore.mjs eval '{"domain":"prime","N":200000,"ex":"n","ey":"omega(gap(n))"}'`
  gave `linearity=0.003293`, `flatness=0.309627`, `yMin=0`, `yMax=3`.
  Screenshot: `logs/playground-artifacts/divisor-graph-omega-gap-200k.png`.
- `node scripts/explore.mjs eval '{"domain":"prime","N":200000,"ex":"mod(gap(n),210)","ey":"omega(gap(n))"}'`
  gave `linearity=0.284233`, `flatness=0.309627`.
  Screenshot: `logs/playground-artifacts/divisor-graph-gapomega-plane-200k.png`.

The useful visual was the second one: discrete `omega(gap)` bands tied to
gap residues. The actual audit graph compresses all within-window prime-pair
differences into this same divisor-factor count.

Audit artifacts:

- pilot report: `logs/playground-artifacts/divisor-graph-window-audit-1000000-b47-97-w210.md`
- primary report: `logs/playground-artifacts/divisor-graph-window-audit-16000000-b47-97-w210.md`
- primary preview: `logs/playground-artifacts/divisor-graph-window-audit-16000000-b47-97-w210.png`

### GROUND IT

Statistic:

In each `210`-window, collect prime offsets and local eligible offsets. Local
eligibility means no divisor by primes up to cutoff `B`. Score the complete
graph on prime offsets by

`E = mean_{u<v} omega(|u-v|)`.

Subtract five exact count-matched random eligible-subset controls in the same
window, then aggregate:

`G_B = sqrt(scored windows) * mean(E_real - E_shuffle)`.

Cutoff `B=47`:

| block | windows | mean prime vertices | mean eligible vertices | observed mean | fake mean | aggregate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `1e6..2e6` | 4,761 | 14.791850 | 29.114052 | 2.243284 | 2.243835 | -0.037997 |
| `2e6..4e6` | 9,523 | 14.092408 | 29.120340 | 2.243534 | 2.244059 | -0.051225 |
| `4e6..8e6` | 19,047 | 13.473145 | 29.126897 | 2.243526 | 2.244068 | -0.074773 |
| `8e6..16e6` | 38,094 | 12.897910 | 29.128839 | 2.243827 | 2.243941 | -0.022201 |

Final controls at `B=47`:

- exact eligible-shuffle aggregate range: `-0.035629 .. 0.028950`
- composite-only eligible aggregate range: `-0.065806 .. 0.053703`

Cutoff `B=97`:

| block | windows | mean prime vertices | mean eligible vertices | observed mean | fake mean | aggregate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `1e6..2e6` | 4,761 | 14.791850 | 25.319891 | 2.243284 | 2.243836 | -0.038045 |
| `2e6..4e6` | 9,523 | 14.092408 | 25.269873 | 2.243534 | 2.243849 | -0.030706 |
| `4e6..8e6` | 19,047 | 13.473145 | 25.252638 | 2.243526 | 2.243531 | -0.000632 |
| `8e6..16e6` | 38,094 | 12.897910 | 25.249488 | 2.243827 | 2.243754 | 0.014197 |

Final controls at `B=97`:

- exact eligible-shuffle aggregate range: `-0.035609 .. 0.034966`
- composite-only eligible aggregate range: `0.010261 .. 0.128277`

Top weighted final pair-difference contributions were concentrated in
ordinary small-prime difference classes. For `B=97`, the largest weighted
excesses were `d=6` (`-843.935`), `d=66` (`813.106`), `d=150`
(`-617.803`), `d=84` (`-608.576`), `d=42` (`448.333`), and `d=30`
(`-406.734`). Those large cell contributions cancel in the scalar graph
energy once the exact local eligible set is the null.

Residual/exponent check:

No stable nonzero residual exists. At `B=47`, aggregates stayed small and
negative but inside controls at the endpoint: `-0.022201` versus
`-0.035629 .. 0.028950`. At `B=97`, the sign flipped from negative to
positive and ended inside controls: `0.014197` versus
`-0.035609 .. 0.034966`. Exponent fits were meaningless for a null-scale
quantity: `-0.177969` and `-0.986757`.

Factor/known check:

This does not collapse to `psi` or `M`. It is a compressed pair-difference
statistic. The collapse is instead geometric: local eligibility plus exact
count-matched subset sampling already fixes the average divisor weight of
pair differences.

### BREAK

GRAVEYARD verdict: not a new critical line. The local divisor-graph edge
energy breaks as exact local-eligible graph calibration.

How it broke:

1. The graph energy residual is at shuffle-control scale for both cutoffs.
2. The cutoff `B=97` path changes sign: `-0.038045`, `-0.030706`,
   `-0.000632`, `0.014197`.
3. Composite-only eligible controls do not fail cleanly; at `B=97` their
   endpoint range is positive and larger than primes (`0.010261 .. 0.128277`).
4. The strongest pair-difference cells are ordinary small-prime difference
   classes, exactly the Hardy-Littlewood/local-factor layer this statistic
   was meant to compress.
5. The compression to mean `omega(|u-v|)` erases the cellwise pair structure
   instead of producing a new line.

CONNECTION: this is the non-residue graph-invariant continuation of the
Cycle 24-30 local eligible branch. It confirms that an intrinsic-looking graph
summary can still be fully calibrated by exact local eligible subsets. Unlike
Cycle 33, this did not need Cramer as the decisive falsifier; the stronger
finite local-eligible null killed it directly.

### LEARN

Graph compression is too lossy here. If a pair-difference object is revisited,
it should keep the cell matrix and subtract a Hardy-Littlewood/local-factor
main term cellwise before taking any norm. Scalar graph energy is a graveyard
compressor: it turns structured cell deviations into shuffle-scale noise.

## HANDOFF 33

Status: no survivor; thirty-four graveyard/calibration entries in this
ledger. Cycle 34 closed the local divisor-graph edge-energy attempt.

New code since the previous handoff:

- reproducible audit script `scripts/divisor-graph-window-audit.mjs`
- artifact reports and previews:
  - `logs/playground-artifacts/divisor-graph-window-audit-16000000-b47-97-w210.md`
  - `logs/playground-artifacts/divisor-graph-window-audit-16000000-b47-97-w210.png`
  - `logs/playground-artifacts/divisor-graph-gapomega-plane-200k.png`

No new lab primitive was added in Cycle 34.

Next cycle suggestion:

Try a genuinely nonlocal arithmetic transform again, but avoid `psi`/`M`
invertible disguises. One candidate: a blockwise rank transform of
`log(phi(n))/log(n)` or `log(rad(n))/log(n)` sampled at primes, with exact
same-block integer/composite rank controls. Expect death by predecessor
local-product calibration unless a two-universe rank law appears.

## Cycle 35 — prime-predecessor totient/radical rank drift

### HALLUCINATE

Guess:

Instead of a residue sequence or a local window geometry, rank each integer by
how much its factorization compresses it. For a prime `p`, the predecessor
`p-1` is forced even and carries the AP shadow of primes `p ≡ 1 (mod q)`.
Maybe the global rank of this compression has a flat or straight line when
viewed blockwise, and maybe its residual below the obvious parity effect is
more rigid than density fakes.

Candidate object:

For each fresh block `[X/2,X]`, score even predecessors `n=p-1` using two
coordinate-free arithmetic ranks inside the same block of even integers:

- `T(n)=log(phi(n))/log(n)`
- `R(n)=log(rad(n))/log(n)`

Let `rank_T(n)` and `rank_R(n)` be percentile ranks among even `n` in the same
block. The candidate line is

`A_T(X)=sqrt(#primes in block) * (mean rank_T(p-1) - 1/2)`,

and similarly for `R`. A flat nonzero mean rank would be a sharp line after
`sqrt(count)` scaling.

Why it could be a line: the rank transform subtracts the drifting marginal
distribution of `phi`/`rad` in the block, so it is not just the known average
order of `phi` or `rad`. If prime predecessors are arithmetically organized in
a stable way beyond parity, the percentile offset should persist across
blocks and be visible against composite-successor controls.

Preregistered confirmation: the rank offset is stable across growing fresh
blocks, separates from five random even-subset controls and from
same-block composite-successor controls, and does not collapse when replacing
`phi` by `rad` or when using odd-prime-only local-product correction.

Preregistered break: the line is exactly predecessor local-product/AP bias:
for odd primes `q`, prime predecessors satisfy `q | (p-1)` at rate about
`1/(q-1)`, not random-even rate `1/q`. If the effect is reproduced by a small
local-product model, or if composite-successor controls do not fail cleanly,
this is another predecessor local-product calibration rather than a critical
line.

### SEE IT

Rendered the raw predecessor transforms:

- `node scripts/explore.mjs eval '{"domain":"prime","N":200000,"ex":"n","ey":"log(phi(n-1))/log(n-1)"}'`
  gave `linearity=0.113046`, `flatness=0.030534`, `yMin=0`,
  `yMax=0.943205`.
  Screenshot: `logs/playground-artifacts/predecessor-rank-phi-atom-200k.png`.
- `node scripts/explore.mjs eval '{"domain":"prime","N":200000,"ex":"n","ey":"log(rad(n-1))/log(n-1)"}'`
  gave `linearity=0.005656`, `flatness=0.150094`, `yMin=0`, `yMax=1`.
  Screenshot: `logs/playground-artifacts/predecessor-rank-rad-atom-200k.png`.

The raw app views are thin bands because the per-prime values live in a
narrow range. The audit preview is the real picture: prime rank aggregates
look like sharp lines, and the local-product model sits almost exactly on top
of them.

Audit artifacts:

- pilot report: `logs/playground-artifacts/predecessor-rank-transform-audit-1000000-q97.md`
- primary report: `logs/playground-artifacts/predecessor-rank-transform-audit-16000000-q97.md`
- primary preview: `logs/playground-artifacts/predecessor-rank-transform-audit-16000000-q97.png`

### GROUND IT

Statistic:

For each fresh block, rank all even integers by
`log(phi(n))/log(n)` and by `log(rad(n))/log(n)`, using midranks to handle
ties. Then score `n=p-1` for primes `p` in the block:

`A = sqrt(#prime predecessors) * (mean rank(p-1) - 1/2)`.

The local-product model uses the first-order AP bias

`weight(n)=product_{odd q|n, q<=97} (q-1)/(q-2)`,

which is the ratio between `P(q|p-1)≈1/(q-1)` and random-even
`P(q|n)=1/q`, up to a block-constant factor.

Totient-compression rank:

| block | prime predecessors | mean prime rank | prime aggregate | local-product aggregate | corrected aggregate |
| --- | ---: | ---: | ---: | ---: | ---: |
| `1e6..2e6` | 70,435 | 0.397699560 | -27.150120 | -27.096575 | -0.053546 |
| `2e6..4e6` | 134,213 | 0.397811652 | -37.436796 | -37.409251 | -0.027545 |
| `4e6..8e6` | 256,631 | 0.397506625 | -51.921873 | -51.735597 | -0.186276 |
| `8e6..16e6` | 491,353 | 0.397554194 | -71.811003 | -71.594586 | -0.216417 |

Final totient controls:

- random even aggregate range: `-0.447372 .. 0.464446`
- composite-successor aggregate range: `9.642660 .. 10.141439`
- Cramer aggregate range: `-58.399577 .. -57.666419`

Radical-compression rank:

| block | prime predecessors | mean prime rank | prime aggregate | local-product aggregate | corrected aggregate |
| --- | ---: | ---: | ---: | ---: | ---: |
| `1e6..2e6` | 70,435 | 0.475522352 | -6.496268 | -6.505969 | 0.009701 |
| `2e6..4e6` | 134,213 | 0.475390404 | -9.015748 | -8.982471 | -0.033277 |
| `4e6..8e6` | 256,631 | 0.475576145 | -12.372822 | -12.421930 | 0.049108 |
| `8e6..16e6` | 491,353 | 0.475099001 | -17.454748 | -17.187241 | -0.267506 |

Final radical controls:

- random even aggregate range: `-0.056843 .. 0.389956`
- composite-successor aggregate range: `2.204442 .. 2.891076`
- Cramer aggregate range: `-13.750084 .. -13.267530`

Residual/exponent check:

The raw rank aggregates scale almost exactly like `sqrt(#prime predecessors)`:
totient exponent fit `0.501119`, radical exponent fit `0.506780`. But this
is a stable mean-rank offset, not a critical-line residual. After subtracting
the local-product model, corrected aggregates stay near zero:
totient `-0.053546`, `-0.027545`, `-0.186276`, `-0.216417`; radical
`0.009701`, `-0.033277`, `0.049108`, `-0.267506`.

The model also explains why Cramer is the wrong decisive null here. Cramer
with small modulus bias partially reproduces the line but underestimates it:
final totient Cramer range `-58.399577 .. -57.666419` versus prime
`-71.811003`. The missing part is exactly higher odd-prime AP divisibility.

Factor/known check:

This does not collapse to `psi` or `M`; it collapses to the elementary local
product for divisibility of prime predecessors. It is the same mechanism as
the squarefree/omega predecessor graveyard entries, now seen through a
blockwise rank transform.

### BREAK

GRAVEYARD verdict: not a new critical line. The prime-predecessor
totient/radical rank drift breaks as predecessor local-product/AP
calibration.

How it broke:

1. The raw lines are sharp: final aggregates `-71.811003` for `phi` and
   `-17.454748` for `rad`.
2. A small-prime local-product model with only `q<=97` reproduces nearly all
   of both lines: final model aggregates `-71.594586` and `-17.187241`.
3. Corrected aggregates are control-scale: final `-0.216417` for `phi` and
   `-0.267506` for `rad`.
4. Composite-successor controls do fail, but that only confirms the effect is
   prime-predecessor AP structure; it does not make the line new.
5. Cramer is too weak as a falsifier here because it preserves only a small
   part of the congruence bias. The local-product model is the right ground.

CONNECTION: this extends the predecessor local-product branch:
squarefree-predecessor density, predecessor-rank discrepancy, and
omega-predecessor covariance all saw pieces of the same fact. The rank
transform made the line visually sharper, but the break is cleaner: the
AP/local-product model lands directly on the line.

### LEARN

Rank transforms are useful because they remove drifting marginal distributions,
but they do not remove conditional local products. For any future
predecessor-feature line, the first null should be the AP product
`P(q|p-1)=1/(q-1)` rather than random integers or Cramer fakes.

## HANDOFF 34

Status: no survivor; thirty-five graveyard/calibration entries in this
ledger. Cycle 35 closed the prime-predecessor totient/radical rank-transform
attempt.

New code since the previous handoff:

- reproducible audit script `scripts/predecessor-rank-transform-audit.mjs`
- artifact reports and previews:
  - `logs/playground-artifacts/predecessor-rank-transform-audit-16000000-q97.md`
  - `logs/playground-artifacts/predecessor-rank-transform-audit-16000000-q97.png`
  - `logs/playground-artifacts/predecessor-rank-phi-atom-200k.png`

No new lab primitive was added in Cycle 35.

Next cycle suggestion:

Use the lesson adversarially: build a candidate whose null is a local product
from the start, not a post-hoc break. For example, score a prime-predecessor
feature after dividing out the AP product cellwise, or move to a two-universe
coordinate-free statistic where the function-field theorem side gives the
main term before any scalar norm is computed.

## Cycle 36 — AP-scrubbed predecessor large-prime tail rank

### HALLUCINATE

Guess:

Cycle 35 showed that raw predecessor `phi`/`rad` rank lines are almost exactly
the AP local product `P(q|p-1)≈1/(q-1)`. Instead of discovering that after the
fact, bake it into the null and look only at the large-prime tail that remains
after stripping the small AP layer.

Candidate object:

For even `n` in a fresh block, strip every prime factor `q<=B` from `n` to get
the large-prime tail `tail_B(n)`. Score two tail features:

- `O_B(n)=omega(tail_B(n))`
- `R_B(n)=log(rad(tail_B(n)))/log(n)`

Rank these features among all even `n` in the same block. For prime
predecessors `n=p-1`, compare the mean rank to the AP-product weighted mean
over all even `n`, with weights

`W_Q(n)=product_{odd q|n, q<=Q} (q-1)/(q-2)`.

The candidate line is

`A_{B,Q}=sqrt(#prime predecessors) * (mean_prime_rank - mean_{W_Q}_rank)`.

Use `B=97` and two null strengths: `Q=97` and `Q=997`.

Why it could be a line: the construction removes the small local-product layer
before scoring. A survivor would say that prime predecessors have a coherent
large-prime tail beyond the explicit AP product, not merely extra divisibility
by 3,5,7,....

Preregistered confirmation: after `Q=997`, corrected aggregates remain stable
and outside random-even, Cramer, and composite-successor controls across
growing blocks. The sign should agree for `omega(tail)` and `rad(tail)`, or a
mathematical reason for divergence must be visible in the cell contributions.

Preregistered break: the `Q=97` residual is absorbed by the stronger
`Q=997` product; the residual is control-scale/noisy; Cramer or
composite-successor controls do not fail cleanly; or the statistic is just a
rank artifact from stripping/normalization. Then this is large-prime AP tail
calibration, not a critical line.

### SEE IT

Rendered raw predecessor-tail proxies in the app:

- `node scripts/explore.mjs eval '{"domain":"prime","N":200000,"ex":"n","ey":"omega(n-1)"}'`
  gave `linearity=0.013855`, `flatness=0.247079`, `yMin=0`, `yMax=6`.
  Screenshot: `logs/playground-artifacts/predecessor-tail-omega-atom-200k.png`.
- `node scripts/explore.mjs eval '{"domain":"prime","N":200000,"ex":"n","ey":"log(rad(n-1))/log(n-1)"}'`
  gave `linearity=0.005656`, `flatness=0.150094`, `yMin=0`, `yMax=1`.
  Screenshot: `logs/playground-artifacts/predecessor-tail-rad-atom-200k.png`.

These raw app shots are visually thin bands; the stripped tail is script-level.
The audit preview is the relevant picture: after subtracting the AP-product
weighted null, the residual curves hover near zero and change sign.

Audit artifacts:

- pilot report: `logs/playground-artifacts/predecessor-tail-rank-audit-1000000-b97-q997.md`
- primary report: `logs/playground-artifacts/predecessor-tail-rank-audit-16000000-b97-q997.md`
- primary preview: `logs/playground-artifacts/predecessor-tail-rank-audit-16000000-b97-q997.png`

### GROUND IT

Statistic:

Strip all prime factors `q<=97` from each even `n` to get `tail_97(n)`.
Within each fresh block, rank even integers by:

- `omegaTail = omega(tail_97(n))`
- `radTail = log(rad(tail_97(n)))/log(n)`

For prime predecessors `n=p-1`, score mean rank against AP-product weighted
nulls:

`A_{Q}=sqrt(#prime predecessors) * (mean_prime_rank - mean_{W_Q}_rank)`,

where `W_Q(n)=product_{odd q|n, q<=Q}(q-1)/(q-2)`.

Tail omega rank:

| block | prime predecessors | prime aggregate | corrected `Q=97` | corrected `Q=997` |
| --- | ---: | ---: | ---: | ---: |
| `1e6..2e6` | 70,435 | -4.692504 | 0.135873 | 0.029305 |
| `2e6..4e6` | 134,213 | -6.257827 | 0.093293 | -0.064326 |
| `4e6..8e6` | 256,631 | -8.073987 | 0.308567 | 0.078819 |
| `8e6..16e6` | 491,353 | -10.868466 | 0.191767 | -0.138521 |

Final tail-omega controls:

- random even aggregate range: `-0.249841 .. 0.157373`
- composite-successor aggregate range: `1.495506 .. 1.818733`
- Cramer aggregate range: `-6.092571 .. -5.433514`

Tail radical rank:

| block | prime predecessors | prime aggregate | corrected `Q=97` | corrected `Q=997` |
| --- | ---: | ---: | ---: | ---: |
| `1e6..2e6` | 70,435 | -12.398454 | -0.001574 | 0.005609 |
| `2e6..4e6` | 134,213 | -17.089340 | 0.038947 | 0.043671 |
| `4e6..8e6` | 256,631 | -23.661584 | 0.038416 | 0.041246 |
| `8e6..16e6` | 491,353 | -32.866264 | -0.060163 | -0.058167 |

Final tail-radical controls:

- random even aggregate range: `-0.307080 .. 0.124911`
- composite-successor aggregate range: `4.415003 .. 4.945275`
- Cramer aggregate range: `-18.768329 .. -17.869983`

Residual/exponent check:

The raw tail-radical line is sharp (`-32.866264` at endpoint), but it is
almost exactly the AP-product model: final corrected `Q=997` aggregate
`-0.058167`. Tail-omega has a small `Q=97` residual, but the stronger
`Q=997` null flips it and leaves endpoint `-0.138521`, inside/near the random
even control band. There is no stable residual exponent after the null is
included up front.

The Cramer ranges again underfit the AP line because Cramer preserves only
small congruence structure: final tail-radical Cramer
`-18.768329 .. -17.869983` versus real `-32.866264`.

Factor/known check:

This is not a `psi`/`M` disguise. It is the same prime-predecessor AP product
seen after deliberately removing the first `q<=97` factors. Extending the
product to `q<=997` absorbs the remaining tail-rank drift.

### BREAK

GRAVEYARD verdict: not a new critical line. The AP-scrubbed predecessor
large-prime tail rank breaks as extended predecessor AP-tail calibration.

How it broke:

1. Raw tail lines still exist after stripping `q<=97`, especially tail radical
   (`-32.866264` endpoint).
2. The AP-product weighted null explains them from the start: tail-radical
   corrected aggregate is only `-0.058167` after `Q=997`.
3. Tail-omega's small `Q=97` residual is not stable; `Q=997` gives
   `0.029305`, `-0.064326`, `0.078819`, `-0.138521`.
4. Composite-successor controls fail in the expected direction, confirming
   prime-predecessor structure but not novelty.
5. Cramer remains too weak for this branch; the AP product is the correct
   null.

CONNECTION: this is the adversarial repair of Cycle 35. Putting the
local-product null into the construction before scoring removes the rank line.
It closes the immediate hope that the large-prime tail hides a critical-line
residual after small-prime AP bias is stripped.

### LEARN

The predecessor-feature branch should now be considered calibrated unless a
future statistic includes the full local/AP product cellwise from the start
and still leaves a stable residual. Random-even and Cramer controls are no
longer acceptable primary nulls for `p-1` features.

## HANDOFF 35

Status: no survivor; thirty-six graveyard/calibration entries in this ledger.
Cycle 36 closed the AP-scrubbed predecessor large-prime tail-rank attempt.

New code since the previous handoff:

- reproducible audit script `scripts/predecessor-tail-rank-audit.mjs`
- artifact reports and previews:
  - `logs/playground-artifacts/predecessor-tail-rank-audit-16000000-b97-q997.md`
  - `logs/playground-artifacts/predecessor-tail-rank-audit-16000000-b97-q997.png`
  - `logs/playground-artifacts/predecessor-tail-omega-atom-200k.png`

No new lab primitive was added in Cycle 36.

Next cycle suggestion:

Pivot away from prime predecessors. A promising direction is two-universe
cellwise calibration where the function-field side supplies an exact main
term before scalarizing. Avoid coefficient order; use additive shifts or
short-interval sets with local factors subtracted cell-by-cell.

## Cycle 37 — HL-whitened additive triple constellation surface

### HALLUCINATE

Guess:

Leave predecessors and Cramer-style density behind. Use a genuinely additive
object: fixed three-point constellations. For integers, count

`T_{a,b}(x)=#{n: n,n+a,n+b are all prime, n+b<=x}`

over small admissible shift pairs `(a,b)` with `a,b` multiples of `6`. For
function fields, count the analogous triples

`T_{h1,h2}(d)=#{monic f degree d: f,f+h1,f+h2 irreducible}`

using fixed additive shifts, not consecutive coefficient-order gaps. For each
cell, subtract the local Hardy-Littlewood / polynomial-tuple singular-series
main term before scalarizing:

`R_cell=(observed-main)/sqrt(main)`.

Then inspect the residual surface and its energy path. The candidate line is a
flat or sharp residual-energy path across growing integer ranges and increasing
function-field degrees.

Why it could be a line: prime triples sit at the interface of additive
combinatorics and local sieve geometry. Pair counts already collapsed to
Hardy-Littlewood calibration, but triple cells might expose a higher-order
regularity after every local tuple obstruction is subtracted cell by cell. The
function-field side supplies the same additive-shift object without zeta zeros
or predecessor relabeling.

Preregistered confirmation: after local tuple singular-series subtraction, the
integer residual surface has a stable nonzero direction/energy outside five
local fake-label controls and composite controls; the function-field residuals
show the same kind of stable cellwise behavior, not one algebraic outlier cell.

Preregistered break: residual energy is control-scale; one shift pair dominates
the whole surface; stronger local factors absorb the line; function-field cells
are jagged/algebraic-class artifacts; or composite/local fake-label controls
reproduce the effect. Then this is Hardy-Littlewood tuple calibration or sparse
tuple noise, not a new critical line.

### SEE IT

Raw app-side atom:

- `node scripts/explore.mjs eval '{"domain":"int","N":200000,"ex":"n","ey":"isprime(n)*isprime(n+6)*isprime(n+12)"}'`
  gave `linearity=0.000436`, `flatness=15.172800`, `yMin=0`, `yMax=1`.
  Screenshot: `logs/playground-artifacts/additive-triple-atom-200k.png`.

The atom shot is visually just a sparse horizontal spike train; the meaningful
picture is the audit surface after local tuple subtraction.

Primary audit command:

`node scripts/additive-triple-constellation-audit.mjs 8000000 logs/playground-artifacts 23 14`

Primary artifacts:

- `logs/playground-artifacts/additive-triple-constellation-audit-8000000.json`
- `logs/playground-artifacts/additive-triple-constellation-audit-8000000.md`
- `logs/playground-artifacts/additive-triple-constellation-audit-8000000.svg`
- `logs/playground-artifacts/additive-triple-constellation-audit-8000000.png`

The picture shows the integer real curve pinned near unit residual energy while
Cramer, wheel, and composite fake labels are far above it. `F_2[t]` stays near
the integer curve; `F_3[t]` rises because one symmetric algebraic shift cell
dominates.

### GROUND IT

Integer side:

For each admissible pair `(a,b)` from `{6,12,18,24,30,42}`, count
`n,n+a,n+b` prime and subtract

`S(a,b) * sum_{m<=x-b} 1/log(m)^3`,

where `S(a,b)=product_l (1-nu_l/l)/(1-1/l)^3` was computed over primes
`l<=100000`. Each cell is `(observed-main)/sqrt(main)`.

| N | prime labels | residual energy | max abs cell | strongest cell |
| ---: | ---: | ---: | ---: | --- |
| 500000 | 41538 | 1.061921 | 2.090680 | `30,42 -2.091` |
| 1000000 | 78498 | 0.923270 | 1.439254 | `18,24 -1.439` |
| 2000000 | 148933 | 0.907070 | 1.865846 | `12,18 -1.866` |
| 4000000 | 283146 | 0.596594 | 1.267726 | `12,18 -1.268` |
| 8000000 | 539777 | 0.622159 | 1.340741 | `30,42 -1.341` |

Endpoint controls at `N=8000000`:

- Cramer label energy range: `46.448977 .. 50.117544`; max cell
  `68.559580 .. 75.094871`.
- `W=30030` fake-label energy range: `7.047914 .. 9.612751`; max cell
  `8.685881 .. 12.898645`.
- `W=30030` composite-only energy range: `99.088712 .. 99.635743`; max cell
  `119.139854 .. 119.937357`.

This is an inversion of the usual fake-prime failure: the real primes are much
closer to the fully local tuple main than all fake controls.

Function-field side:

Use fixed additive triples `f,f+h1,f+h2`; the shifts are multiples of the
product of all linear polynomials so degree-1 obstructions are removed before
testing. Each cell subtracts the polynomial tuple singular product through the
audited max degree and main `S*q^d/d^3`.

`F_2[t]`:

| degree | irreducibles | residual energy | max abs cell | strongest cell |
| ---: | ---: | ---: | ---: | --- |
| 19 | 27594 | 0.962045 | 1.531494 | `t^2+t | t^4+t` |
| 20 | 52377 | 0.735513 | 1.406335 | `t^2+t | t^4+t` |
| 21 | 99858 | 1.024943 | 1.694249 | `t^2+t | t^3+t^2` |
| 22 | 190557 | 0.687781 | 1.050757 | `t^2+t | t^3+t^2` |
| 23 | 364722 | 1.066932 | 2.291348 | `t^3+t | t^5+t^4+t^3+t` |

`F_3[t]` primary run:

| degree | irreducibles | residual energy | max abs cell | strongest cell |
| ---: | ---: | ---: | ---: | --- |
| 10 | 5880 | 1.298690 | 1.662864 | `t^3+2t | t^4+2t^2` |
| 11 | 16104 | 0.744448 | 0.777337 | `t^3+2t | t^4+2t^2` |
| 12 | 44220 | 1.067365 | 1.992677 | `t^3+2t | 2t^3+t` |
| 13 | 122640 | 2.378467 | 4.209918 | `t^3+2t | 2t^3+t` |
| 14 | 341484 | 3.567283 | 9.438483 | `t^3+2t | 2t^3+t` |

Adversarial extension:

`node scripts/additive-triple-constellation-audit.mjs 1000000 logs/playground-artifacts 8 15`

At `F_3[t]` degree `15`, the same symmetric cell `h,-h` flipped sign and
dropped to `-4.586496`; energy was `2.448606`. So the degree-14 rise is not a
stable transported direction. It is an algebraic shift-cell pathology.

Factor/known check:

The construction is not `psi` or `M`; it is a Hardy-Littlewood prime-tuple
object. It is also not Cramer-shaped: ordinary Cramer labels fail badly, and
even a wheel-density fake is too rough because independent labels do not
enforce higher-order tuple local factors.

### BREAK

GRAVEYARD verdict: not a new critical line. The integer side breaks as
Hardy-Littlewood tuple calibration; the function-field side breaks as
algebraic shift-cell noise.

How it broke:

1. After cellwise tuple singular-series subtraction, the integer residual
   energy is already small and drifting downward: `1.061921`, `0.923270`,
   `0.907070`, `0.596594`, `0.622159`.
2. The fake controls do not reproduce the real residual; they fail in the
   opposite direction. This confirms the local tuple main is arithmetically
   meaningful, but it leaves no residual line to chase.
3. `F_2[t]` is also control-scale after polynomial tuple subtraction.
4. `F_3[t]` has a tempting spike, but one algebraic cell dominates:
   `h=t^3+2t`, `-h=2t^3+t`. Extending to degree `15` flips the sign and drops
   the max cell from `9.438483` to `4.586496`.
5. Therefore the two-universe gate fails: there is no stable shared residual
   direction after local tuple calibration.

CONNECTION: this is the triple-tuple analogue of the earlier prime-pair shift
matrix break. The stronger lesson is positive but calibrating: independent
density, Cramer labels, and wheel labels miss higher-order tuple constraints,
while the full local singular series lands directly on the integer line.

### LEARN

For additive constellations, the correct null is not Cramer and not even a
wheel-density label process; it is the full tuple singular series cell by cell.
Once that is used, integer triples are too well calibrated to produce a new
critical line. Future additive attempts need either a statistic *orthogonal* to
all fixed tuple counts, or a theorem-side function-field object whose cells do
not collapse into symmetric algebraic shift classes.

## HANDOFF 36

Status: no survivor; thirty-seven graveyard/calibration entries in this
ledger. Cycle 37 closed the additive triple constellation attempt.

New code since the previous handoff:

- reproducible audit script `scripts/additive-triple-constellation-audit.mjs`
- artifact reports and previews:
  - `logs/playground-artifacts/additive-triple-constellation-audit-8000000.md`
  - `logs/playground-artifacts/additive-triple-constellation-audit-8000000.png`
  - `logs/playground-artifacts/additive-triple-atom-200k.png`

No new lab primitive was added in Cycle 37.

Next cycle suggestion:

Do not keep escalating fixed additive tuple counts; Hardy-Littlewood local
products are the right calibration and are too strong. A sharper creative pivot
is to look for an invariant of the *residual field* after tuple subtraction,
for example sign topology, persistence across shift-complexes, or a
two-universe statistic built from cycles in the residual hypergraph rather than
from tuple counts themselves.

## Cycle 38 — tuple-residual tetrahedron curl

### HALLUCINATE

Guess:

Cycle 37 killed raw triple cells after Hardy-Littlewood subtraction. Instead
of counting more tuples, treat the triple residuals as a 2-cochain on a shift
complex. Let `H={0,6,12,18,24,30,42,60}`. For every triple
`i<j<k`, compute the locally whitened triple residual

`R_ijk=(count(n+h_i,n+h_j,n+h_k prime)-main_ijk)/sqrt(main_ijk)`.

Now test the first genuinely topological object in this playground:
for every tetrahedron `i<j<k<l`, compute the alternating boundary

`C_ijkl = R_jkl - R_ikl + R_ijl - R_ijk`.

Candidate line:

`CurlEnergy(x)=sqrt(mean_{i<j<k<l} C_ijkl^2)`.

Why it could be a line: if tuple residuals are just lower-order local
calibration noise, the alternating boundary should be control-scale. But if
the residual field has coherent topology after all cellwise local products are
removed, `CurlEnergy` may be a stable flat line or a shrinking line not
reproduced by independent density, wheel, or composite controls. This is not a
ψ/M summatory relabel and not a raw Hardy-Littlewood tuple count.

Preregistered confirmation: integer `CurlEnergy` is stable across growing
ranges and separated from five Cramer, five `W=30030` fake-label, and five
composite-only controls; the strongest tetrahedra are not one shift class; an
additive function-field analogue shows the same kind of behavior after
polynomial tuple subtraction.

Preregistered break: `CurlEnergy` is ordinary unit Gaussian noise after
whitening; controls match or dominate it; one tetrahedron/shift family drives
the metric; function-field rows are algebraic-class artifacts; or the
alternating boundary just erases the already-calibrated tuple residuals. Then
this is residual-hypergraph noise after Hardy-Littlewood calibration, not a
critical line.

### SEE IT

Raw app-side atom:

- `node scripts/explore.mjs eval '{"domain":"int","N":200000,"ex":"n","ey":"isprime(n)*isprime(n+6)*isprime(n+12)*isprime(n+18)"}'`
  gave `linearity=0.000157`, `flatness=42.823619`, `yMin=0`, `yMax=1`.
  Screenshot: `logs/playground-artifacts/tuple-curl-tetra-atom-200k.png`.

The raw four-point atom is visually a nearly empty spike train. The meaningful
picture is the curl audit after every triple face has already had its tuple
main subtracted.

Primary audit command:

`node scripts/tuple-curl-audit.mjs 6000000 logs/playground-artifacts 22 13`

Primary artifacts:

- `logs/playground-artifacts/tuple-curl-audit-6000000.json`
- `logs/playground-artifacts/tuple-curl-audit-6000000.md`
- `logs/playground-artifacts/tuple-curl-audit-6000000.svg`
- `logs/playground-artifacts/tuple-curl-audit-6000000.png`

Implementation note: an initial pilot exposed a translation bug for faces not
containing the zero shift; the final audit translates every face to its first
vertex before counting, so `R_{12,24,42}` is counted as the translated pattern
`{0,12,30}`.

### GROUND IT

Integer side:

The shift vertices were `H={0,6,12,18,24,30,42,60}`. For each face
`i<j<k`, the audit counted the translated triple
`n, n+(h_j-h_i), n+(h_k-h_i)` and subtracted the translated
Hardy-Littlewood triple main. For each tetrahedron, it then computed

`C_ijkl = R_jkl - R_ikl + R_ijl - R_ijk`.

| N | prime labels | triple energy | curl energy | max abs curl | strongest tetrahedron |
| ---: | ---: | ---: | ---: | ---: | --- |
| 375000 | 31904 | 0.887726 | 1.255687 | 3.419567 | `0,6,12,24 -3.420` |
| 750000 | 60238 | 0.830027 | 1.139053 | 3.383928 | `0,12,30,42 3.384` |
| 1500000 | 114155 | 0.726237 | 1.177774 | 3.399095 | `0,6,30,42 3.399` |
| 3000000 | 216816 | 0.682879 | 1.091482 | 3.196172 | `0,6,30,42 3.196` |
| 6000000 | 412849 | 0.588438 | 1.077125 | 3.181641 | `0,6,30,42 3.182` |

Endpoint controls at `N=6000000`:

- Cramer label curl energy: `50.577372 .. 52.181001`; max curl
  `110.209418 .. 115.056599`.
- `W=30030` fake-label curl energy: `1.619873 .. 2.683367`; max curl
  `4.859864 .. 7.842262`.
- `W=30030` composite-only curl energy: `16.851810 .. 17.477379`; max curl
  `37.605266 .. 39.330034`.

Effect-size stability:

The real integer curl stays near unit scale and drifts slightly down:
`1.255687`, `1.139053`, `1.177774`, `1.091482`, `1.077125`, with exponent
`theta=-0.080570`. That is not a growing residual line. It is ordinary
post-calibration noise; if anything, the alternating boundary erased the
remaining tuple residuals.

Function-field side:

`F_2[t]` was also near unit scale after translated face counting:

| degree | irreducibles | triple energy | curl energy | max abs curl |
| ---: | ---: | ---: | ---: | ---: |
| 18 | 14532 | 1.532472 | 2.219083 | 6.935081 |
| 19 | 27594 | 1.327753 | 1.657342 | 4.294099 |
| 20 | 52377 | 1.101165 | 1.393237 | 4.169322 |
| 21 | 99858 | 0.812828 | 1.235377 | 3.489566 |
| 22 | 190557 | 1.006496 | 1.292316 | 3.062882 |

`F_3[t]` had a mild repeated-class bump, not a clean transport law:

| degree | irreducibles | triple energy | curl energy | max abs curl |
| ---: | ---: | ---: | ---: | ---: |
| 9 | 2184 | 1.419964 | 1.666257 | 3.425354 |
| 10 | 5880 | 1.672794 | 1.732807 | 3.435985 |
| 11 | 16104 | 1.859185 | 2.094469 | 3.616355 |
| 12 | 44220 | 1.352231 | 1.537445 | 2.997586 |
| 13 | 122640 | 2.013854 | 2.127812 | 3.143652 |

Endpoint `F_3[t]` random monic controls had curl energy
`0.507751 .. 0.793014`, and random reducible controls had
`0.452693 .. 0.714805`. But the top real cells repeat in algebraic classes
with identical values such as `3.143652`, so the two-universe gate does not
promote it.

Factor/known check:

This is not `psi` or `M`; it is a topological transform of locally calibrated
Hardy-Littlewood tuple residuals. Cramer again fails because it lacks local
constraints; the useful comparison is the wheel/local tuple layer.

### BREAK

GRAVEYARD verdict: not a new critical line. The tuple-residual tetrahedron
curl breaks as post-Hardy-Littlewood residual noise plus function-field
algebraic-class repetition.

How it broke:

1. The real integer curl is small and stable after translated tuple
   calibration: endpoint `1.077125`, exponent `theta=-0.080570`.
2. The wheel fake controls are close enough to bracket the same unit-scale
   behavior from above (`1.619873 .. 2.683367`), while Cramer and composite
   controls fail for known local-constraint reasons.
3. The alternating boundary did not reveal a new residual direction; it mostly
   erased already-calibrated triple noise.
4. `F_2[t]` agrees with the "unit-scale noise" read.
5. `F_3[t]` is above its random controls, but the repeated identical top cells
   are algebraic shift-class artifacts, not a robust coordinate-free line.

CONNECTION: this is the promised topology/persistence follow-up to Cycle 37.
It confirms that moving from tuple cells to a tetrahedron boundary does not by
itself escape the Hardy-Littlewood local tuple calibration. The one live idea
left in this branch is a more intrinsic residual-complex statistic whose cells
are quotient by algebraic shift symmetries before scoring.

### LEARN

Translated faces matter: any shift-complex statistic must count each face in
coordinates relative to its own first vertex. After that correction, the curl
is a good diagnostic and it says "no hidden line here." Future hypergraph work
should quotient repeated algebraic cells and test persistence of connected
components or sign domains, not raw alternating sums.

## HANDOFF 37

Status: no survivor; thirty-eight graveyard/calibration entries in this
ledger. Cycle 38 closed the tuple-residual tetrahedron-curl attempt.

New code since the previous handoff:

- reproducible audit script `scripts/tuple-curl-audit.mjs`
- artifact reports and previews:
  - `logs/playground-artifacts/tuple-curl-audit-6000000.md`
  - `logs/playground-artifacts/tuple-curl-audit-6000000.png`
  - `logs/playground-artifacts/tuple-curl-tetra-atom-200k.png`

No new lab primitive was added in Cycle 38.

Next cycle suggestion:

If staying in the residual-complex branch, quotient shift symmetries first and
then score topology: sign-domain persistence, connected components across
thresholds, or homology of the residual complex. Otherwise pivot harder away
from additive tuples; the full local tuple product plus translated-face curl is
now a calibrated dead end.

## Cycle 39 — quotient residual sign-domain persistence

### HALLUCINATE

Guess:

Cycle 38 showed that unquotiented tetrahedron curl is mostly calibrated noise
and repeated algebraic shift cells. Repair it adversarially: quotient translated
triple faces by their relative shape before scoring any topology.

For integer shifts `H={0,6,12,18,24,30,42,60}`, every triple face becomes a
shape `(a,b)=(h_j-h_i,h_k-h_i)`. For each shape, compute the cellwise
Hardy-Littlewood residual

`R_{a,b}(x)=(T_{a,b}(x)-main_{a,b}(x))/sqrt(main_{a,b}(x))`.

Build a quotient graph on shapes: two shapes are adjacent if they occur as
faces of the same tetrahedron in the original shift complex. At threshold
`tau=1`, measure the largest connected sign domain among shapes with
`R>tau` or `R<-tau`:

`P(x)=max(largest positive component, largest negative component) / #shapes`.

Candidate line:

`P(x)` is a sharp flat line or stable residual-topology line that survives
wheel, Cramer, composite, and function-field quotient controls.

Why it could be a line: raw residual energy can be unit-scale while topology is
not random. A persistent sign domain would say the tuple residual field has
coherent geometry after local tuple products and translation symmetries have
both been removed.

Preregistered confirmation: integer `P(x)` is stable across ranges and
outside five `W=30030` fake-label controls; the active shapes are not a single
dominant shape family; `F_2[t]` or `F_3[t]` shows comparable quotient
sign-domain behavior after polynomial tuple subtraction.

Preregistered break: `P(x)` is zero or control-scale; the active component is
one/few shape classes; wheel or composite controls reproduce it; function-field
rows repeat algebraic classes; or threshold changes destroy the line. Then
this is quotient residual-complex noise, not a new critical line.

### SEE

Rendered with:

- `node scripts/explore.mjs eval '{"domain":"int","N":200000,"ex":"n","ey":"isprime(n)*isprime(n+18)*isprime(n+54)"}'`
- `node scripts/explore.mjs shot '{"domain":"int","N":200000,"ex":"n","ey":"isprime(n)*isprime(n+18)*isprime(n+54)"}' logs/playground-artifacts/quotient-sign-shape-atom-200k.png`

The single-atom shot was visually sparse: a nearly flat indicator strip, not a
structure-bearing picture. The useful picture was the quotient audit plot in
`logs/playground-artifacts/quotient-sign-domain-audit-6000000.png`.

Visual read: the integer quotient sign-domain line starts tempting and then
collapses. The controls do not mimic a delicate prime line; they saturate the
graph. `F_2[t]` is jagged and `F_3[t]` grows through repeated algebraic shape
classes.

### GROUND

Audit command:

`node scripts/quotient-sign-domain-audit.mjs 6000000 logs/playground-artifacts 22 13`

Integer quotient shape count: `34`.

| N | labels | shape energy | P(tau=1) | active shapes | largest component | strongest shape |
| ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 375000 | 31904 | 1.128928 | 0.382353 | 13 | 13 | 36,54 -2.455 |
| 750000 | 60238 | 1.047162 | 0.529412 | 18 | 18 | 36,54 -2.088 |
| 1500000 | 114155 | 0.853135 | 0.205882 | 8 | 7 | 36,54 -1.920 |
| 3000000 | 216816 | 0.673087 | 0.117647 | 5 | 4 | 12,18 -2.001 |
| 6000000 | 412849 | 0.653216 | 0.029412 | 4 | 1 | 18,54 1.539 |

Integer exponent fits:
`P theta=-0.957080`,
`shape-energy theta=-0.221626`.

Endpoint controls at `N=6000000`:

| group | P range | active range | shape energy range | P theta range |
| --- | ---: | ---: | ---: | ---: |
| Cramer labels | 0.852941 .. 0.852941 | 34 .. 34 | 40.309539 .. 43.810842 | 0.000000 .. 0.071946 |
| W=30030 fake labels | 1.000000 .. 1.000000 | 34 .. 34 | 6.321608 .. 8.527241 | 0.008614 .. 0.556890 |
| W=30030 composite-only | 1.000000 .. 1.000000 | 34 .. 34 | 90.556684 .. 91.179125 | 0.000000 .. 0.000000 |

Strongest real endpoint shapes:

- `18,54`: `1.539197`
- `30,42`: `-1.226479`
- `6,60`: `-1.175982`
- `12,36`: `1.128072`
- `18,30`: `0.988839`
- `6,54`: `-0.907354`
- `24,42`: `0.883383`
- `24,36`: `0.838595`

Largest real endpoint component:
`{"sign":1,"size":1,"labels":["18,54"],"maxAbs":1.5391972312563291}`.

Function-field quotient checks:

`F_2[t]` had quotient shape count `54`. Its `P(tau=1)` path was
`0.111111`, `0.166667`, `0.314815`, `0.092593`, `0.425926` through degree
`22`, with endpoint shape energy `1.005022`. The largest endpoint component
had size `23`, but the strongest cells already repeated algebraic classes at
equal values such as `1.782941`.

`F_3[t]` had quotient shape count `30`. Its `P(tau=1)` path was
`0.033333`, `0.400000`, `0.200000`, `0.600000`, `0.800000` through degree
`13`, with endpoint shape energy `2.018166`. The endpoint was dominated by
the symmetric repeated algebraic class
`t^3 + 2*t | 2*t^3 + t: -4.209921`.

Endpoint random monic and reducible controls in both function fields saturated
at `P=1.000000` with huge shape energy around `63..74`, so they confirm that
unmatched density nulls are not the right grounding object.

Factor/known check:

This does not collapse to `psi` or `M`; it is built from locally calibrated
tuple residuals and a quotient graph. The failure is not "Cramer theorem says
no." Cramer is only a contrast class here. The actual failure is that the
prime quotient topology itself shrinks to a singleton while field analogues
are jagged or algebraic-class dominated.

### BREAK

GRAVEYARD verdict: not a new critical line. The quotient residual sign-domain
persistence breaks as quotient residual-complex noise plus function-field
algebraic-class repetition.

How it broke:

1. Integer `P(tau=1)` was not stable: it fell from `0.529412` at `750000` to
   `0.029412` at `6000000`.
2. The endpoint largest component was a singleton: only shape `18,54` survived
   above threshold as the largest positive component.
3. Shape energy decayed below unit scale (`0.653216`, `theta=-0.221626`),
   which reads like over-quotiented residual noise, not a hidden line.
4. Wheel, Cramer, and composite controls saturated the quotient graph instead
   of matching the real behavior; that says they are poor topology nulls, not
   that the real object survived.
5. `F_2[t]` was jagged, and `F_3[t]` produced a tempting high endpoint only by
   repeating algebraic shape classes.

CONNECTION: this closes the immediate residual-complex branch after the
tetrahedron curl. Quotienting shift symmetries killed the fake topology rather
than revealing a line. The useful lesson is methodological: stop treating
Cramer as the adversary to defeat. The adversary is whether a candidate remains
intrinsic after local tuple calibration, quotienting, and two-universe
coordinate artifacts are removed.

### LEARN

This cycle was creative but still too local-additive. The additive tuple branch
now has three layers of failure: raw triple cells collapse to Hardy-Littlewood
tuple calibration, tetrahedron curl collapses to calibrated unit noise, and
quotient sign domains collapse to isolated residual atoms.

Next hallucination should leave old structure harder. Avoid prime tuples as
the object and make the line from an intrinsic transport, variational, or
renormalization rule: something like "primes are the minimal-error flow that
keeps all residue classes locally balanced under changing moduli," tested
against actual arithmetic controls rather than Cramer-first mythology.

## HANDOFF 38

Status: no survivor; thirty-nine graveyard/calibration entries in this ledger.
Cycle 39 closed the quotient residual sign-domain attempt.

New code since the previous handoff:

- reproducible audit script `scripts/quotient-sign-domain-audit.mjs`
- artifact reports and previews:
  - `logs/playground-artifacts/quotient-sign-domain-audit-6000000.md`
  - `logs/playground-artifacts/quotient-sign-domain-audit-6000000.png`
  - `logs/playground-artifacts/quotient-sign-shape-atom-200k.png`

No new lab primitive was added in Cycle 39.

Next cycle suggestion:

Do a bolder non-Cramer pivot. Try a modulus-flow or entropy-transport object
that never counts fixed prime constellations directly. Pre-register a line
like "the prime indicator is the unique low-curvature path through the lattice
of wheel-conditioned residue measures," then ground it with matched
modulus-flow controls, composites, and function fields.

## Cycle 40 — primorial modulus-flow curvature

### HALLUCINATE

Guess:

Stop counting fixed prime tuples. Treat primes as a measure flowing through a
nested lattice of allowed residue classes.

For the integer primorial tower

`W_1=6, W_2=30, W_3=210, W_4=2310, W_5=30030`,

let `C_W(a;x)` be the count of primes `p<=x` in each reduced residue class
`a mod W`, excluding the finitely many primes dividing `W`. Define the
residue energy

`E(W,x)=sum_{(a,W)=1} (C_W(a;x)-P/phi(W))^2 / (P/phi(W))`,

where `P` is the total prime count being distributed across reduced classes.
Because the moduli are nested, the new imbalance injected when refining from
`W_i` to `W_{i+1}` is

`K_i(x)=(E(W_{i+1},x)-E(W_i,x))/(phi(W_{i+1})-phi(W_i))`.

Candidate line:

the vector of `K_i(x)` is a flat low-curvature line for the real primes across
growing `x`, and its residual scale is meaningfully different from matched
eligible-residue random flows. This would say primes are not just sparse; they
are a low-curvature transport through the wheel tower.

Why it could be a line: this object is coordinate-free inside each quotient
`(Z/WZ)^*`, it does not count constellations, and it measures the change of
residue information under refinement rather than endpoint residue bias. The
known real-vs-Cramer sqrt-cancellation contrast suggests that arithmetic may
show up as under-dispersed flow curvature, not as a single AP excess.

Preregistered confirmation: real `K_i(x)` stays flat or converges across
`x=1x,2x,4x`; its mean effect size is stable and separated from at least five
count-matched eligible random flows; composite controls fail; and `F_2[t]` or
`F_3[t]` shows the same low-curvature tower after replacing primorials by
products of small irreducible polynomials.

Preregistered break: the real flow is control-scale, endpoint-only, or just a
degree-of-freedom chi-square identity; the signal flips by tower level; the
composite controls share it; or function fields turn it into an algebraic
modulus artifact. Then this is residue equidistribution bookkeeping, not a new
critical line.

### SEE

Rendered with:

- `node scripts/explore.mjs eval '{"domain":"int","N":200000,"ex":"mod(n,30030)","ey":"isprime(n)"}'`
- `node scripts/explore.mjs shot '{"domain":"int","N":200000,"ex":"mod(n,30030)","ey":"isprime(n)"}' logs/playground-artifacts/modulus-flow-residue-atom-200k.png`

The direct residue shot was a thin sparse strip, as expected: the structure is
not visible in a raw `isprime` indicator. The useful picture is the audit plot
`logs/playground-artifacts/modulus-flow-curvature-audit-8000000.png`.

Visual read: real integers and both function fields sit systematically below
random residue flows. This looked promising until the white balanced-residue
fake was added; it sits essentially at zero and beats primes without using
primality.

### GROUND

Audit command:

`node scripts/modulus-flow-curvature-audit.mjs 8000000 logs/playground-artifacts 22 13`

Integer tower:
`6 -> 30 -> 210 -> 2310 -> 30030`.

| N | labels | real meanK | balanced fake meanK | real defect | effect vs eligible | K levels |
| ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 500000 | 41532 | 0.239518 | 0.007456 | 0.777752 | -0.280945 | 0.073, 0.114, 0.287, 0.485 |
| 1000000 | 78492 | 0.209243 | 0.005346 | 0.806561 | -0.343848 | 0.024, 0.119, 0.246, 0.448 |
| 2000000 | 148927 | 0.206358 | 0.001544 | 0.804702 | -0.405028 | 0.074, 0.100, 0.244, 0.408 |
| 4000000 | 283140 | 0.181320 | 0.000824 | 0.830559 | -0.381106 | 0.033, 0.076, 0.227, 0.389 |
| 8000000 | 539771 | 0.175499 | 0.000701 | 0.835522 | -0.457373 | 0.021, 0.088, 0.217, 0.376 |

Integer exponent fits:
`meanK theta=-0.119301`,
`defect theta=0.026909`,
`abs(effect-vs-eligible) theta=0.167953`.

Endpoint integer controls at `N=8000000`:

| group | meanK range | defect range | flatness range |
| --- | ---: | ---: | ---: |
| balanced residue fake | 0.000701 .. 0.000701 | 0.999300 .. 0.999300 | 1.384645 .. 1.384645 |
| eligible random | 0.463488 .. 0.823259 | 0.316436 .. 0.563111 | 0.069628 .. 0.565159 |
| Cramer labels | 0.708652 .. 0.874825 | 0.179038 .. 0.348898 | 0.108132 .. 0.283378 |
| composite eligible | 0.408721 .. 0.569874 | 0.438077 .. 0.623083 | 0.131412 .. 0.480826 |

Function-field checks:

`F_2[t]` used products of the first `3,4,5,6` monic irreducibles as the
modulus tower. Its real meanK path through degrees `18..22` was
`0.307862`, `0.283531`, `0.262183`, `0.211696`, `0.256653`. Endpoint random
monic controls were `0.883712 .. 1.086012`, random reducible controls were
`1.001646 .. 1.186889`, and the balanced residue fake was `0.001159`.

`F_3[t]` used the same first-irreducible tower. Its real meanK path through
degrees `9..13` was `0.372405`, `0.337836`, `0.349656`, `0.376817`,
`0.246905`. Endpoint random monic controls were `0.981028 .. 1.202681`,
random reducible controls were `1.087206 .. 1.165445`, and the balanced
residue fake was `0.001153`.

Factor/known check:

For a fixed modulus `W`, the chi-square energy

`sum_a (C_a-P/phi(W))^2/(P/phi(W))`

is, by character orthogonality, the same object as a normalized sum of squared
non-principal character sums over primes:

`(1/P) * sum_{chi != chi0} |sum_{p<=x} chi(p)|^2`.

The tower increments are just the nested version of the same AP/character-sum
energy. In function fields this is exactly the kind of quantity controlled by
the Weil RH for curves / Dirichlet characters over `F_q[t]`. Over integers it
is Dirichlet-prime-equidistribution in AP clothing. No zeta zeros were used in
the construction, but the grounding funnel is character sums and Dirichlet
`L`-functions, not a new prime object.

### BREAK

GRAVEYARD verdict: not a new critical line. The primorial modulus-flow
curvature breaks as AP character-sum equidistribution plus non-prime balanced
relabeling.

How it broke:

1. The low-curvature signal is real relative to naive random labels:
   integer endpoint `0.175499` versus eligible random `0.463488..0.823259`,
   and both function fields near `0.25` versus random near `1`.
2. But the balanced residue fake, with no primality at all, drives the same
   statistic essentially to zero at the endpoint: integer `0.000701`,
   `F_2[t]` `0.001159`, `F_3[t]` `0.001153`.
3. Therefore the statistic rewards residue balance itself, not a uniquely
   prime mechanism.
4. The exact algebraic identity is character orthogonality: the energy is a
   squared Dirichlet-character-sum norm. That is known AP equidistribution
   territory, not an independent critical line.
5. The K levels are not a sharp flat line either; they vary by refinement
   level (`0.021, 0.088, 0.217, 0.376` at the integer endpoint).

CONNECTION: this is the non-Cramer pivot requested after Cycle 39. It did
escape fixed tuple/H-L calibration and found a real two-universe contrast
against random labels, but the adversarial fake exposed the mechanism:
coordinate-free residue balance is still too weak unless the statistic also
forces a prime-specific construction of that balance.

### LEARN

This was useful. Cramer was not the trap this time; naive randomness was. The
right null for modulus-flow objects must include stratified/balanced residue
relabelings, not just random eligible labels. A future modulus-flow attempt
needs to score something that a perfectly balanced non-prime residue measure
cannot fake: for example, the cost of maintaining balance while respecting
ordered gap transport, multiplicative convolution, or Möbius interaction.

## HANDOFF 39

Status: no survivor; forty graveyard/calibration entries in this ledger.
Cycle 40 closed the first primorial modulus-flow curvature attempt.

New code since the previous handoff:

- reproducible audit script `scripts/modulus-flow-curvature-audit.mjs`
- artifact reports and previews:
  - `logs/playground-artifacts/modulus-flow-curvature-audit-8000000.md`
  - `logs/playground-artifacts/modulus-flow-curvature-audit-8000000.png`
  - `logs/playground-artifacts/modulus-flow-residue-atom-200k.png`

No new lab primitive was added in Cycle 40.

Next cycle suggestion:

Keep the modulus-flow idea but add an unfakeable constraint. One candidate:
balanced-residue flow with transport cost between consecutive primes, where
the fake must match endpoint residue balance and ordered gap movement. Another
candidate: character-energy after Möbius convolution, where a stratified
residue fake should lose multiplicative coherence.

## Cycle 41 — Möbius-twisted local modulus flow

### HALLUCINATE

Guess:

Cycle 40 died because a non-prime measure with perfectly balanced endpoint
residue counts has essentially zero curvature. Add a multiplicative constraint
that residue balance alone cannot force: weight every label by the Möbius value
of its predecessor.

For integers, use the same tower

`6 -> 30 -> 210 -> 2310 -> 30030`.

For each level `W` and reduced residue `a`, compute the local background mean
and variance of

`g(n)=mu(n-1)`

over all endpoint-eligible integers `n<=x` with `n=a mod W`. For prime labels,
score the standardized residual in each class:

`Z_a = (sum_{p<=x, p=a mod W} g(p) - C_a mean_a) / sqrt(C_a var_a)`.

Let `E(W,x)` be the average of `Z_a^2` across active classes, and let the
candidate line be the tower profile and its mean residual energy after this
local subtraction. The function-field version replaces `n` by monic
polynomials, primes by irreducibles, and `mu(n-1)` by polynomial `mu(f-1)`.

Why it could be a line: Cycle 40 measured only endpoint residue counts. This
measures whether the prime measure can stay locally residue-balanced while also
carrying a multiplicative Möbius texture on the predecessor. A stratified fake
that matches endpoint residue counts now has to reproduce squarefree
predecessor coherence too.

Preregistered confirmation: after local residue means are subtracted, real
integer energy is stable and separated from five stratified endpoint-residue
fakes, five Cramer labels, and composite controls; `F_2[t]` or `F_3[t]` shows
a comparable residual-energy profile; and the effect is not an endpoint spike
or a single tower level.

Preregistered break: local residue conditioning absorbs the effect; stratified
fakes reproduce it; composites reproduce it; function fields disagree; or the
object collapses to the already-known prime-predecessor AP/local-product
calibration. Then this is predecessor Möbius AP bookkeeping, not a critical
line.

### SEE

Rendered with:

- `node scripts/explore.mjs eval '{"domain":"int","N":200000,"ex":"mod(n,30030)","ey":"isprime(n)*mu(n-1)"}'`
- `node scripts/explore.mjs shot '{"domain":"int","N":200000,"ex":"mod(n,30030)","ey":"isprime(n)*mu(n-1)"}' logs/playground-artifacts/mobius-modulus-flow-atom-200k.png`

The raw atom view was again a sparse strip. Metrics were not line-like:
`linearity=0.0000228874`, `flatness=5.4396819`, `zeroCrossings=3451`.

The useful picture is
`logs/playground-artifacts/mobius-modulus-flow-audit-4000000.png`. It shows a
noisy, non-flat family: integer real energy rises into the stratified fake
band; `F_2[t]` stays low; `F_3[t]` jumps high at the endpoint.

### GROUND

Audit command:

`node scripts/mobius-modulus-flow-audit.mjs 4000000 logs/playground-artifacts 20 12`

Integer side:

| N | labels | real meanE | effect vs stratified | level energies |
| ---: | ---: | ---: | ---: | --- |
| 250000 | 22038 | 0.394094 | -1.301257 | 0.028, 0.381, 0.450, 0.504, 0.607 |
| 500000 | 41532 | 0.408524 | -0.964605 | 0.123, 0.311, 0.484, 0.520, 0.605 |
| 1000000 | 78492 | 0.902240 | -1.019333 | 1.312, 1.252, 0.775, 0.566, 0.606 |
| 2000000 | 148927 | 0.916565 | -0.230692 | 1.497, 1.158, 0.673, 0.627, 0.628 |
| 4000000 | 283140 | 1.152024 | -0.093192 | 2.509, 1.232, 0.748, 0.632, 0.639 |

Integer exponent fits:
`meanE theta=0.462515`,
`abs(effect-vs-stratified) theta=-1.051230`.

Endpoint integer controls at `N=4000000`:

| group | meanE range | defect range | flatness range |
| --- | ---: | ---: | ---: |
| stratified composite by residue | 0.745306 .. 1.586824 | 0.322769 .. 0.960816 | 0.198177 .. 0.539418 |
| eligible random | 0.716385 .. 1.569951 | 0.366505 .. 0.937204 | 0.327254 .. 0.514331 |
| Cramer labels | 0.557293 .. 0.925520 | 0.370045 .. 0.502597 | 0.391878 .. 0.537047 |
| composite random | 1.315468 .. 2.225281 | 0.349802 .. 1.692764 | 0.114891 .. 0.524861 |

Function-field checks:

`F_2[t]` through degrees `17..20` had real meanE
`0.555894`, `0.578413`, `0.750641`, `0.480280`. Endpoint stratified
reducible controls were `0.753437 .. 2.428385`; random monic controls were
`0.825434 .. 1.647466`; random reducible controls were
`0.922659 .. 1.444087`.

`F_3[t]` through degrees `10..12` had real meanE
`0.719831`, `0.536172`, `1.214587`. Endpoint stratified reducible controls
were `1.084596 .. 1.811527`; random monic controls were
`0.816526 .. 1.109879`; random reducible controls were
`1.472933 .. 1.665324`.

The field audit intentionally starts after the endpoint modulus degree, so the
stratified reducible controls have same-residue material to sample from.

Factor/known check:

This object does not collapse to `psi` or `M`. It is a conditional
predecessor-Möbius statistic:

`sum_{p<=x, p=a mod W} mu(p-1)`

after subtracting the local `n=a mod W` background. The relevant known funnel
is not zeros directly but the prime-predecessor local/AP product branch:
conditioning on `p mod q` controls much of the divisibility and squarefree
texture of `p-1`. The integer effect versus a stratified same-residue
composite fake decays toward zero, which is exactly the AP-local-product
failure mode from the predecessor graveyard.

### BREAK

GRAVEYARD verdict: not a new critical line. The Möbius-twisted local modulus
flow breaks as predecessor Möbius AP/local conditioning plus two-universe
instability.

How it broke:

1. Integer real energy is not stable or flat; it rises from `0.394094` to
   `1.152024`.
2. The gap from stratified same-endpoint-residue fakes decays hard:
   `abs(effect-vs-stratified) theta=-1.051230`, ending at only `-0.093192`.
3. At the endpoint the real integer value sits inside the stratified fake
   range `0.745306 .. 1.586824`.
4. `F_2[t]` and `F_3[t]` disagree: endpoint `F_2[t]` is low (`0.480280`),
   while endpoint `F_3[t]` is high (`1.214587`) and close to its stratified
   controls.
5. Composite controls do not fail cleanly; random composites are often above
   real, which indicates the statistic is mostly measuring local
   squarefree-predecessor texture rather than prime-only regularity.

CONNECTION: this is the multiplicative repair of Cycle 40. It improves the
null by adding local `mu(n-1)` backgrounds and stratified same-residue fakes,
and that stronger null absorbs the apparent signal. It also reconnects the
modulus-flow branch to the older prime-predecessor AP-tail calibration: adding
Möbius texture reopens the predecessor trap rather than escaping it.

### LEARN

Balanced residue fakes plus local feature backgrounds are now mandatory for
any modulus-flow statistic. Merely attaching a multiplicative feature to a
balanced residue object is not enough; if the feature is a predecessor feature,
the AP/local-product trap returns. A better next hallucination should avoid
`p-1` and test a constraint that is neither endpoint residue balance nor
predecessor AP structure, such as a coordinate-free spectrum of multiplicative
characters over moving roughness cutoffs, or a variational sieve quantity with
published benchmark controls.

## HANDOFF 40

Status: no survivor; forty-one graveyard/calibration entries in this ledger.
Cycle 41 closed the Möbius-twisted local modulus-flow attempt.

New code since the previous handoff:

- reproducible audit script `scripts/mobius-modulus-flow-audit.mjs`
- artifact reports and previews:
  - `logs/playground-artifacts/mobius-modulus-flow-audit-4000000.md`
  - `logs/playground-artifacts/mobius-modulus-flow-audit-4000000.png`
  - `logs/playground-artifacts/mobius-modulus-flow-atom-200k.png`

No new lab primitive was added in Cycle 41.

Next cycle suggestion:

Leave predecessor features alone. Either pivot to a sieve-variational object
with an external benchmark, or build a coordinate-free spectrum over
Dirichlet/finite-field characters where the adversary includes balanced
residue fakes and local feature backgrounds from the start.

## Cycle 42 — consecutive residue-ratio transport spectrum

### HALLUCINATE

Guess:

Cycle 40 died because endpoint residue balance is fakeable. Cycle 41 died
because predecessor features reopen AP-local-product structure. Keep residue
flow, but score ordered movement instead of endpoint mass or predecessor
texture.

For consecutive primes `p_i,p_{i+1}` with both coprime to a primorial modulus
`W`, compute the multiplicative transport ratio in the unit group:

`r_i = p_{i+1} * p_i^{-1} mod W`.

Let `T_W(x)` be the distribution of `r_i` over `(Z/WZ)^*`. Compare it to
five count-matched random permutations of the same endpoint residue multiset,
five Cramer prime sequences, and eligible composite sequences in natural
order. Score the locally standardized transition energy across `W=210,2310`
and maybe `30030`.

Candidate line:

the prime sequence has a stable low-dimensional transport spectrum, visible as
a flat or straight residual-energy path across growing `x`, that cannot be
faked by endpoint-balanced residue relabeling.

Why it could be a line: this is the missing constraint from Cycle 40. A
balanced fake can make residue counts perfect, but it must also arrange an
ordered path through the unit group. Consecutive-prime residue bias is known
to exist, so the question is whether its coordinate-free multiplicative-ratio
spectrum hides a clean line after endpoint counts are removed.

Preregistered confirmation: real transition energy is stable across ranges,
separated from random permutations/Cramer/composite sequences, and not
concentrated in a single ratio or the identity ratio. A survivor also needs a
coordinate-free function-field transport analogue; lex/coefficient order is
not acceptable.

Preregistered break: the effect is just Lemke Oliver-Soundararajan
consecutive-prime bias; the signal is dominated by `r=1` or small gap residue
classes; random/permutation/composite controls reproduce it; the energy drifts
instead of forming a line; or no coordinate-free function-field order exists.
Then it is ordered AP transition bias, not a new critical line.

### SEE

Rendered with:

- `node scripts/explore.mjs eval '{"domain":"prime","N":200000,"ex":"mod(n,210)","ey":"mod(n+gap(n),210)"}'`
- `node scripts/explore.mjs shot '{"domain":"prime","N":200000,"ex":"mod(n,210)","ey":"mod(n+gap(n),210)"}' logs/playground-artifacts/residue-ratio-transport-scatter-200k.png`

The scatter is visually structured: narrow diagonal bands of allowed
consecutive residue transitions, plus a separated cluster. This is real
ordered structure, but it already looks like gap-size / residue-transition
support rather than a flat critical-line object.

The audit plot
`logs/playground-artifacts/residue-ratio-transport-audit-8000000.png` shows
large growth against a shuffle null, while a gap-conditioned null absorbs most
of the signal.

### GROUND

Audit command:

`node scripts/residue-ratio-transport-audit.mjs 8000000 logs/playground-artifacts`

Integer rows:

| N | labels | shuffle-null mean energy | gap-conditioned mean energy | max identity z | level energies |
| ---: | ---: | ---: | ---: | ---: | --- |
| 500000 | 41532 | 10.377676 | 2.767292 | 40.924014 | 210:20.025, 2310:8.199, 30030:2.909 |
| 1000000 | 78492 | 15.558425 | 3.232274 | 29.140260 | 210:32.706, 2310:10.231, 30030:3.738 |
| 2000000 | 148927 | 20.270476 | 3.860483 | 132.156023 | 210:40.920, 2310:14.874, 30030:5.018 |
| 4000000 | 283140 | 22.435134 | 5.017811 | 97.960357 | 210:40.997, 2310:19.618, 30030:6.690 |
| 8000000 | 539771 | 43.333207 | 6.372712 | 141.603443 | 210:96.379, 2310:24.553, 30030:9.068 |

Exponent fits:
`shuffle meanEnergy theta=0.502968`,
`gap-conditioned theta=0.328844`,
`identityAbs theta=0.576200`.

Endpoint controls at `N=8000000`:

| group | mean energy range | max energy range | max identity-z range |
| --- | ---: | ---: | ---: |
| random order of same primes | 1.610580 .. 1.826436 | 1.745901 .. 1.954104 | 0.169682 .. 5.003447 |
| Cramer labels | 16.090424 .. 24.531205 | 29.029702 .. 54.669404 | 66.775390 .. 312.590792 |
| sampled composites in natural order | 33.125968 .. 39.578243 | 61.865466 .. 83.336909 | 134.341734 .. 189.071693 |

Gap-conditioned endpoint levels:
`210:11.037`, `2310:5.348`, `30030:2.734`.

Top shuffle-null endpoint cells show the weak-null problem immediately. For
`W=210`, the identity ratio had count `0` versus shuffle-null `11127.40`, with
`z=-141.603`, and several other ratios were impossible or massively depleted.
For `W=30030`, ratios such as `2081` and `529` also had zero counts versus
null expectations around `93..95`.

Top gap-conditioned endpoint cells were smaller but still structured. For
`W=210`, the largest cells included ratio `139` (`z=-28.652`) and ratio `191`
(`z=27.565`). For `W=30030`, ratio `8219` had `z=54.257`.

Factor/known check:

This is not `psi` or `M`. It is an ordered AP transition statistic. The strong
shuffle-null signal is mostly explained by the fact that consecutive prime
gaps are small relative to `W`, so many endpoint-residue transitions that a
random shuffle expects are impossible. After conditioning on the actual gap
sequence, a smaller but real bias remains; that is exactly the habitat of
Lemke Oliver-Soundararajan consecutive-prime residue bias.

Function-field check:

No promoted field row. Consecutive order over integers is canonical, but
coefficient or lex order over `F_q[t]` is an artifact class already flagged in
this ledger. A survivor would need a coordinate-free function-field transport
analogue. This object does not have one in this cycle.

### BREAK

GRAVEYARD verdict: not a new critical line. The consecutive residue-ratio
transport spectrum breaks as ordered AP transition / consecutive-prime race
bias plus gap-support constraints.

How it broke:

1. The main energy is not flat; it grows with exponent `theta=0.502968`
   against the shuffle null.
2. The weakest-null signal is dominated by gap support. Identity transitions
   are impossible at `W=210` in this range (`count=0`) because prime gaps do
   not reach the modulus; the shuffle null expects about `11127`.
3. Preserving the actual gap sequence collapses most of the endpoint mean
   energy from `43.333207` to `6.372712`.
4. The remaining gap-conditioned signal is real but still grows
   (`theta=0.328844`) and sits squarely in known consecutive-prime residue-bias
   territory.
5. There is no coordinate-free function-field analogue without choosing a
   lex/coefficient order, so the two-universe gate is not met.

CONNECTION: this is the ordered-transport repair of the balanced-residue
modulus-flow failure. It proves the ordered path constraint is much stronger
than endpoint balance, but it also shows the next trap: ordered residue
transport is mostly gap support plus known consecutive-prime race bias unless
the construction conditions on gaps from the start and has a second-universe
order.

### LEARN

Ordered transport is a productive direction, but the null must preserve the
actual gap sequence or at least the gap residue/size distribution. A future
transport statistic should be defined after gap conditioning, and should look
for residual geometry not dominated by a few transition ratios. The function
field issue is serious: no lex order. To keep two universes, use an unordered
transport object, maybe a graph on irreducibles connected by fixed-degree
shifts, or switch to a sieve-variational benchmark.

## HANDOFF 41

Status: no survivor; forty-two graveyard/calibration entries in this ledger.
Cycle 42 closed the consecutive residue-ratio transport attempt.

New code since the previous handoff:

- reproducible audit script `scripts/residue-ratio-transport-audit.mjs`
- artifact reports and previews:
  - `logs/playground-artifacts/residue-ratio-transport-audit-8000000.md`
  - `logs/playground-artifacts/residue-ratio-transport-audit-8000000.png`
  - `logs/playground-artifacts/residue-ratio-transport-scatter-200k.png`

No new lab primitive was added in Cycle 42.

Next cycle suggestion:

Either keep transport but condition on the actual gap sequence from the start
and remove top ratio cells before scoring, or pivot to an unordered
two-universe object: a fixed-shift graph / expander statistic on primes and
irreducibles, or a sieve-variational computation with known external
benchmarks.

## Cycle 43 — gap-conditioned trimmed transport bulk

### HALLUCINATE

Guess:

Cycle 42 showed a huge ordered residue-transport signal, but most of it was
gap support and a few dominant transition-ratio cells. Repair the object by
making the gap-conditioned null primary and trimming the top outlier cells
before scoring.

For each modulus `W in {210,2310,30030}`, use consecutive labels
`m_i,m_{i+1}` and the ratio

`r_i=m_{i+1} * m_i^{-1} mod W`.

The null preserves the actual gap sequence `m_{i+1}-m_i` and randomizes only
the starting reduced residue at each step. Compute z-scores for ratio cells
against five such gap-conditioned nulls, remove the largest
`max(1,ceil(0.01*phi(W)))` cells by `|z|`, and score the remaining bulk RMS.

Candidate line:

the trimmed bulk RMS for primes is a flat or gently convergent line across
range, separated from Cramer and composite natural-order controls. If true,
the residual transport geometry is not just a few known LO-S race cells or
impossible transitions.

Why it could be a line: gap conditioning removes support constraints, and
trimming removes the obvious dominant cells. A surviving bulk line would be a
more global transport fingerprint of prime order through reduced residue
groups.

Preregistered confirmation: prime trimmed bulk is stable across
`N=1x,2x,4x`, separated from five Cramer and five composite controls, and not
dominated by one modulus. A survivor still needs a coordinate-free
function-field analogue; without that it can only be a one-universe
phenomenon.

Preregistered break: trimmed bulk still grows, controls overlap or exceed it,
top cells remain decisive after trimming, or no coordinate-free function-field
analogue exists. Then this is residual consecutive-prime race structure, not a
critical line.

### SEE

Rendered with:

- `node scripts/explore.mjs eval '{"domain":"prime","N":200000,"ex":"mod(n,210)","ey":"mod(n+gap(n),210)"}'`
- `node scripts/explore.mjs shot '{"domain":"prime","N":200000,"ex":"mod(n,210)","ey":"mod(n+gap(n),210)"}' logs/playground-artifacts/gapconditioned-transport-bulk-scatter-200k.png`

The scatter stayed the same structured band picture as Cycle 42: gap-supported
residue transitions, not a visually flat object.

The audit plot
`logs/playground-artifacts/gapconditioned-transport-bulk-audit-8000000.png`
is decisive: prime trimmed bulk climbs with range, and the sampled composite
trimmed bulk tracks it closely.

### GROUND

Audit command:

`node scripts/gapconditioned-transport-bulk-audit.mjs 8000000 logs/playground-artifacts`

Rows:

| N | labels | prime bulk | prime full | prime top | level bulk |
| ---: | ---: | ---: | ---: | ---: | --- |
| 500000 | 41532 | 2.433868 | 2.767292 | 11.391925 | 210:3.800, 2310:2.148, 30030:1.354 |
| 1000000 | 78492 | 2.823835 | 3.232274 | 13.569792 | 210:4.385, 2310:2.606, 30030:1.480 |
| 2000000 | 148927 | 3.484645 | 3.860483 | 14.493196 | 210:5.641, 2310:3.096, 30030:1.717 |
| 4000000 | 283140 | 4.281077 | 5.017811 | 22.290868 | 210:6.724, 2310:4.197, 30030:1.922 |
| 8000000 | 539771 | 5.807114 | 6.372712 | 22.496598 | 210:10.341, 2310:4.788, 30030:2.292 |

Exponent fits:
`bulk theta=0.336223`,
`full theta=0.328844`,
`top theta=0.289645`.

Endpoint controls at `N=8000000`:

| group | bulk range | full range | top range |
| --- | ---: | ---: | ---: |
| Cramer labels | 2.433128 .. 2.655894 | 2.650786 .. 3.275052 | 9.529294 .. 15.708513 |
| sampled composites | 5.428721 .. 5.917630 | 6.010256 .. 8.486282 | 22.423490 .. 48.217543 |

Endpoint top cells after gap conditioning still had large residuals. At
`W=210`, trimming only the largest cell left bulk `10.340913`, and the top
cells included ratios `139` (`z=-28.652`), `191` (`z=27.565`), `41`
(`z=-24.684`), and `53` (`z=22.957`). At `W=30030`, even after trimming 58
cells, bulk was still `2.291976`.

Factor/known check:

This remains an ordered AP transition statistic. The repair removed the
weakest null mistake from Cycle 42, but the bulk still follows natural-order
gap/residue transition structure. Since sampled composites in natural order
overlap the prime endpoint, this is not prime-specific enough to encode a
critical-line regularity.

Function-field check:

No promoted field row. This still uses consecutive order, and coefficient or
lex order over `F_q[t]` would be an artifact. The two-universe gate is unmet.

### BREAK

GRAVEYARD verdict: not a new critical line. Gap-conditioned trimmed transport
bulk breaks as natural-order gap/residue transition structure shared by
composites, plus no coordinate-free second universe.

How it broke:

1. The trimmed prime bulk is not flat; it grows with exponent
   `theta=0.336223`.
2. Trimming the top 1% cells barely changes the scaling: full `theta=0.328844`
   versus bulk `theta=0.336223`.
3. The endpoint prime bulk `5.807114` lies inside sampled composite controls
   `5.428721 .. 5.917630`.
4. The `W=210` level dominates the endpoint bulk (`10.341`), so the signal is
   not a balanced multi-level line.
5. There is still no coordinate-free function-field analogue without a
   forbidden lex/coefficient ordering.

CONNECTION: this is the stricter repair of Cycle 42. It confirms that gap
conditioning is necessary but not sufficient. The remaining ordered transport
bulk is a natural-order residue/gap statistic, and composite controls can
imitate it. This pushes the next search away from consecutive order and toward
unordered two-universe objects or sieve-variational benchmarks.

### LEARN

The ordered transport branch is now well fenced: endpoint balance is too weak,
gap conditioning is mandatory, top-cell trimming is not enough, and natural
order itself leaks composite-like structure. Next cycle should stop using
consecutive order and either build an unordered fixed-shift graph in both
universes or try a theorem-adjacent sieve variational computation with an
external target.

## HANDOFF 42

Status: no survivor; forty-three graveyard/calibration entries in this
ledger. Cycle 43 closed the gap-conditioned trimmed transport-bulk attempt.

New code since the previous handoff:

- reproducible audit script `scripts/gapconditioned-transport-bulk-audit.mjs`
- artifact reports and previews:
  - `logs/playground-artifacts/gapconditioned-transport-bulk-audit-8000000.md`
  - `logs/playground-artifacts/gapconditioned-transport-bulk-audit-8000000.png`
  - `logs/playground-artifacts/gapconditioned-transport-bulk-scatter-200k.png`

No new lab primitive was added in Cycle 43.

Next cycle suggestion:

Leave consecutive order. Try an unordered two-universe fixed-shift graph:
vertices are residue classes or local cells, edges are prime/irreducible pairs
under a symmetric admissible shift set, and the score is a spectral or
expansion invariant after local tuple calibration. The adversary must include
balanced residue fakes, local tuple products, and function-field algebraic
shift-class checks.

## Cycle 44 — fixed-shift prime graph degree spectrum

### HALLUCINATE

Guess:

Leave consecutive order entirely. Build an unordered graph whose vertices are
primes up to `x`, with an undirected edge between `p` and `p+h` whenever both
are prime and `h` lies in a fixed symmetric admissible shift set. Over
`F_q[t]`, use irreducibles of a fixed degree and polynomial shifts divisible by
all linear factors, so the graph has the same coordinate-free fixed-shift
meaning without lex order.

For integers, take

`H={6,12,18,24,30,42,60,90}`.

For each prime vertex, let `d_H(p)` be the number of neighbors in this fixed
shift graph. Compare the degree distribution to Cramer labels, sampled
composite labels, and local pair-density expectations. The candidate line is
the normalized degree-spectrum energy:

`D(x)=sqrt(mean((d_H(p)-mean(d_H))^2)) / sqrt(mean(d_H))`.

Candidate line:

after local pair calibration, the prime graph has a stable flat degree-spectrum
energy in both integers and function fields, separated from density fakes and
composites. A survivor would say fixed-shift graph regularity is a genuine
two-universe object, not ordered residue transport.

Why it could be a line: fixed-shift adjacency is unordered and coordinate-free,
so it avoids the lex/consecutive-order artifact. Degree fluctuations test
higher local organization of prime pairs around each prime, not just pair
counts.

Preregistered confirmation: integer `D(x)` is stable across ranges and outside
five Cramer/composite controls; `F_2[t]` and `F_3[t]` show comparable
degree-spectrum energy; the effect is not explained by pair means alone or a
single shift.

Preregistered break: degree energy is Poisson/pair-count calibration; Cramer
or composites overlap; the function-field rows are unit noise or algebraic
shift-class artifacts; or the signal reduces to Hardy-Littlewood fixed-pair
calibration. Then this is unordered pair-graph noise, not a critical line.

### SEE

Rendered with:

- `node scripts/explore.mjs eval '{"domain":"int","N":200000,"ex":"n","ey":"isprime(n)*(isprime(n+6)+isprime(n+12)+isprime(n+18)+isprime(n+24)+isprime(n+30)+isprime(n+42)+isprime(n+60)+isprime(n+90))"}'`
- `node scripts/explore.mjs shot '{"domain":"int","N":200000,"ex":"n","ey":"isprime(n)*(isprime(n+6)+isprime(n+12)+isprime(n+18)+isprime(n+24)+isprime(n+30)+isprime(n+42)+isprime(n+60)+isprime(n+90))"}' logs/playground-artifacts/fixed-shift-graph-degree-atom-200k.png`

The raw atom was again visually sparse: almost all mass on the zero line.
The audit plot
`logs/playground-artifacts/fixed-shift-graph-degree-audit-8000000.png`
shows the real shape: a tempting flat integer trace, but it rides almost on
top of the sampled composite trace and below the two function-field traces.

### GROUND

Audit command:

`node scripts/fixed-shift-graph-degree-audit.mjs 8000000 logs/playground-artifacts 22 13`

Integer side, shifts `6,12,18,24,30,42,60,90`:

| N | labels | mean degree | D | zero frac |
| ---: | ---: | ---: | ---: | ---: |
| 500000 | 41538 | 4.073427 | 0.791977 | 0.005561 |
| 1000000 | 78498 | 3.850366 | 0.802859 | 0.007949 |
| 2000000 | 148933 | 3.646069 | 0.809209 | 0.010602 |
| 4000000 | 283146 | 3.466063 | 0.816985 | 0.014162 |
| 8000000 | 539777 | 3.300937 | 0.823568 | 0.017913 |

Integer exponent fits:
`D theta=0.014917`,
`meanDegree theta=-0.081981`.

Endpoint integer controls at `N=8000000`:

| group | D range | mean degree range | zero frac range |
| --- | ---: | ---: | ---: |
| Cramer labels | 0.906341 .. 0.911995 | 3.256548 .. 3.275631 | 0.027078 .. 0.027853 |
| sampled composites | 0.830489 .. 0.832803 | 3.324321 .. 3.331179 | 0.018400 .. 0.018604 |

Function-field checks:

`F_2[t]` used six shifts divisible by all linear factors. Its real degree
energy through degrees `19..22` was `1.192622`, `1.211871`, `1.228465`,
`1.235972`, with mean degree falling from `2.341813` to `2.020141`.
Endpoint random monic controls had `D=1.377753..1.380859` and much lower mean
degree `0.538359..0.550324`.

`F_3[t]` used eight symmetric shifts divisible by all linear factors. Its real
degree energy through degrees `10..13` was `1.038293`, `1.037542`,
`1.078634`, `1.109492`, with mean degree falling from `5.114286` to
`3.880822`. Endpoint random monic controls had `D=1.350879..1.363433` and
mean degree `1.223451..1.239628`.

Factor/known check:

This is not `psi` or `M`; it is a fixed-pair graph statistic. The mean degree
is just a weighted collection of prime-pair counts and is therefore governed
by Hardy-Littlewood/local pair calibration. The degree variance adds local
overlap/triple information, but the endpoint sampled composite controls match
the integer `D` almost exactly, which means the apparent flat line is not
prime-specific.

### BREAK

GRAVEYARD verdict: not a new critical line. The fixed-shift graph degree
spectrum breaks as unordered pair-graph calibration plus composite overlap and
two-universe level mismatch.

How it broke:

1. The integer trace is very stable, but stability alone is not enough:
   endpoint prime `D=0.823568` is essentially overlapped by sampled composites
   `0.830489..0.832803`.
2. Cramer is higher (`0.906341..0.911995`), so the statistic still detects
   arithmetic/local constraints, but that contrast is weaker than the
   composite falsifier.
3. The function fields do not share the integer level. Endpoint `F_2[t]` has
   `D=1.235972`; endpoint `F_3[t]` has `D=1.109492`.
4. The field random controls mainly expose local admissibility: random monic
   mean degrees are much lower than real because the chosen shifts preserve
   linear-factor admissibility.
5. The object reduces to fixed pair and small overlap counts, i.e.
   Hardy-Littlewood/local tuple calibration, not a fresh critical line.

CONNECTION: this is the unordered two-universe repair after the consecutive
transport branch. It removes lex/consecutive-order artifacts, which is good,
but it falls directly into the fixed-shift pair graph version of the
Hardy-Littlewood tuple funnel already seen in the additive triple and
tetrahedron-curl cycles.

### LEARN

Unordered fixed-shift graphs are clean and portable across universes, but raw
degree spectra are too close to pair-count calibration. A next graph attempt
must subtract the full local pair/triple configuration before scoring a graph
invariant, or choose a graph invariant that is not mostly a degree statistic.
The handoff should bias toward spectral expansion after explicit tuple
calibration, or toward the sieve-variational benchmark branch.

## HANDOFF 43

Status: no survivor; forty-four graveyard/calibration entries in this ledger.
Cycle 44 closed the fixed-shift prime graph degree-spectrum attempt.

New code since the previous handoff:

- reproducible audit script `scripts/fixed-shift-graph-degree-audit.mjs`
- artifact reports and previews:
  - `logs/playground-artifacts/fixed-shift-graph-degree-audit-8000000.md`
  - `logs/playground-artifacts/fixed-shift-graph-degree-audit-8000000.png`
  - `logs/playground-artifacts/fixed-shift-graph-degree-atom-200k.png`

No new lab primitive was added in Cycle 44.

Next cycle suggestion:

If staying with graphs, stop using degree spectra. Build a locally calibrated
adjacency residual matrix for fixed shifts and score a spectral invariant
after subtracting pair/triple expectations. Otherwise pivot to a
sieve-variational computation with a published benchmark so the audit gate has
external mathematical teeth.

## Cycle 45 — locally calibrated shift-incidence operator

### HALLUCINATE

Guess:

Keep the unordered fixed-shift graph, but stop scoring vertex degrees. For a
fixed admissible shift set `H`, attach to each label `p` the incidence vector

`X_p(h)=1_{p+h is also a label}`.

Subtract the obvious pair information column-by-column. The object is the
off-diagonal correlation operator

`C_ij = cov(X(h_i), X(h_j)) / sqrt(var(X(h_i)) var(X(h_j)))`, with zero
diagonal, and the candidate line is its spectral radius `rho(C)`.

Why it could be a line:

raw degree variance mostly re-counts pairs. The centered shift-incidence
operator removes each individual pair count first; what remains is
co-neighbor organization, i.e. a local triple/overlap residual. If the primes
have a hidden RH-grade regularity away from `psi`, it might show up as a
stable spectral level after this local calibration. The construction is
unordered and has a direct `F_q[t]` analogue using irreducible polynomials and
small polynomial shifts, so it avoids consecutive/lex-order artifacts.

Preregistered confirmation:

`rho(C)` is flat or exponent-near-zero across growing integer ranges; it is
outside at least five Cramer, sampled-composite, and column-permutation nulls;
and `F_2[t]`/`F_3[t]` show a comparable level after the same shift-count
calibration. A survivor must not be explained by the individual pair counts,
and the residual matrix should have a stable visual shape, not endpoint-only
noise.

Preregistered break:

`rho(C)` grows like sparse-tuple noise; Cramer or composites overlap; the
column-permutation null explains the spectrum; function fields land at
unrelated levels; or the matrix entries are just Hardy-Littlewood
triple-count constants in disguise. Then the branch breaks as locally
calibrated tuple covariance, not a new critical line.

### SEE

Rendered the raw signed co-neighbor atom with:

- `node scripts/explore.mjs eval '{"domain":"int","N":200000,"ex":"n","ey":"isprime(n)*(isprime(n+12)*isprime(n+42)+isprime(n+18)*isprime(n+60)+isprime(n+6)*isprime(n+90)-isprime(n+12)*isprime(n+18)-isprime(n+6)*isprime(n+24))"}'`
- `node scripts/explore.mjs shot '{"domain":"int","N":200000,"ex":"n","ey":"isprime(n)*(isprime(n+12)*isprime(n+42)+isprime(n+18)*isprime(n+60)+isprime(n+6)*isprime(n+90)-isprime(n+12)*isprime(n+18)-isprime(n+6)*isprime(n+24))"}' logs/playground-artifacts/shift-incidence-operator-atom-200k.png`

Metrics for the atom:
`linearity=0.000961`, `flatness=6.733240`, `zeroCrossings=1279`,
`yMin=-1`, `yMax=2`.

The atom picture is visually just a sparse horizontal trace. The real visual
object is the endpoint correlation matrix in
`logs/playground-artifacts/shift-incidence-operator-audit-8000000.png`.
There, the integer-prime and sampled-composite heatmaps have the same signed
block pattern. `F_2[t]` has a much stronger level; `F_3[t]` is closer but not
matched.

### GROUND

Audit command:

`node scripts/shift-incidence-operator-audit.mjs 8000000 logs/playground-artifacts 22 13`

Integer side, shifts `6,12,18,24,30,42,60,90`:

| N | labels | mean shift rate | rho | rho/sqrt(H-1) | pair RMS | column-null rho | composite rho | Cramer rho |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 500000 | 41538 | 0.254589 | 0.164616 | 0.062219 | 0.039200 | 0.018131 .. 0.022863 | 0.166632 .. 0.175560 | 0.043628 .. 0.062282 |
| 1000000 | 78498 | 0.240648 | 0.151419 | 0.057231 | 0.036600 | 0.010708 .. 0.020439 | 0.154123 .. 0.156697 | 0.035165 .. 0.050395 |
| 2000000 | 148933 | 0.227879 | 0.145856 | 0.055128 | 0.034362 | 0.010447 .. 0.012604 | 0.139388 .. 0.144686 | 0.025218 .. 0.040462 |
| 4000000 | 283146 | 0.216629 | 0.137043 | 0.051797 | 0.032140 | 0.007127 .. 0.009390 | 0.130711 .. 0.135857 | 0.020553 .. 0.030079 |
| 8000000 | 539777 | 0.206309 | 0.129218 | 0.048840 | 0.030121 | 0.005490 .. 0.006709 | 0.124619 .. 0.126261 | 0.015330 .. 0.024378 |

Integer exponent fits:
`rho theta=-0.091067`, `rhoNorm theta=-0.091067`,
`pairRms theta=-0.102435`.

Endpoint top signed entries at `N=8000000`:

- `12 / 42: 0.072244`
- `18 / 60: 0.043406`
- `6 / 90: 0.041774`
- `12 / 18: -0.039619`
- `6 / 24: -0.038214`

The column-permutation null is tiny, so the operator did remove individual
pair counts and detect real co-neighbor structure. But the sampled-composite
control shadows the integer trace. Composite mean ratios were
`0.971`, `0.974`, `1.033`, `1.028`, `1.029` through the five ranges, and the
off-diagonal matrix correlation between real primes and the first composite
sample was `0.9816`, `0.9925`, `0.9948`, `0.9977`, `0.9983`.

Function-field checks with eight shifts:

`F_2[t]` real `rho` through degrees `19..22` was
`0.360630`, `0.345067`, `0.329221`, `0.313324`, with exponent
`theta=-0.072780`. Endpoint random monic controls had
`rho=0.007840..0.013374`, random reducible controls
`0.008233..0.011506`, and column-null controls `0.007959..0.011669`.

`F_3[t]` real `rho` through degrees `10..13` was
`0.208143`, `0.248863`, `0.210107`, `0.187906`, with exponent
`theta=-0.047182`. Endpoint random monic controls had
`rho=0.009864..0.013916`, random reducible controls
`0.010614..0.016320`, and column-null controls `0.011314..0.016384`.

Factor/known check:

This is not `psi` or `M`, and it is not explained by independent column noise.
It is a fixed-shift triple/overlap covariance operator. The near-perfect
matrix agreement with primorial-eligible composites points to local
admissibility / singular-series constraints among the shift triples, not a
prime-specific critical-line regularity.

### BREAK

GRAVEYARD verdict: not a new critical line. The locally calibrated
shift-incidence operator breaks as local tuple-admissibility covariance.

How it broke:

1. The integer trace is not flat; `rho` decays with exponent
   `theta=-0.091067`.
2. Cramer and column-permutation controls are far too low, so they are weak
   nulls for this object.
3. Sampled composites that are merely coprime to `30030` reproduce the
   integer level within a few percent at large range.
4. More decisively, the real-prime and sampled-composite endpoint matrices
   have almost the same signed direction; their off-diagonal correlation rises
   to `0.9983`.
5. The function-field levels do not match the integer level:
   endpoint `F_2[t] rho=0.313324`, `F_3[t] rho=0.187906`, integer
   `rho=0.129218`.

CONNECTION: this is the locally calibrated repair of Cycle 44. It succeeded
at removing raw degree and individual pair-count noise, but the remaining
operator is still in the Hardy-Littlewood tuple funnel. The new lesson is that
future graph operators must adversarially subtract not only pair counts but
the local admissibility matrix of shift triples itself. Cramer is not the
right adversary here; primorial-eligible composite geometry is.

### LEARN

The branch did get sharper. Pair-centering is meaningful: it separated real
local structure from independent columns by a factor of about twenty at the
endpoint. But the structure is already present in the wheel-composite universe.
That makes the next creative move clearer: either subtract the full local
singular-series tensor before scoring a graph invariant, or leave fixed-shift
tuple objects and try a different habitat, such as a sieve-variational
benchmark with external theorem-grade targets.

## HANDOFF 44

Status: no survivor; forty-five graveyard/calibration entries in this ledger.
Cycle 45 closed the locally calibrated shift-incidence operator attempt.

New code since the previous handoff:

- reproducible audit script `scripts/shift-incidence-operator-audit.mjs`
- artifact reports and previews:
  - `logs/playground-artifacts/shift-incidence-operator-audit-8000000.md`
  - `logs/playground-artifacts/shift-incidence-operator-audit-8000000.png`
  - `logs/playground-artifacts/shift-incidence-operator-atom-200k.png`

No new lab primitive was added in Cycle 45.

Next cycle suggestion:

Do not use Cramer as the main adversary for local graph operators. Use a
wheel/singular-series adversary first. A plausible next hallucination is a
"triple-whitened" fixed-shift graph: compute the local admissibility tensor
for all shift triples modulo a primorial, whiten the incidence covariance by
that tensor, then score only the residual spectral direction. If that still
tracks composites, abandon fixed-shift graphs and pivot to the sieve
variational branch.

## Cycle 46 — CA-XA divisor-frontier occupancy line

### HALLUCINATE

Guess:

Leave prime-label graphs. Use the divisor-world object already present in the
repo: `H = CA ∩ XA`, the intersection of colossally abundant endpoints and
extremely abundant records. This object is defined through divisor sums and
record conditions, not by scanning primes directly. Each `H` record has a
largest prime factor, its frontier.

Candidate line:

Let `A(Y)` be the number of prime frontiers `≤Y` that appear as frontiers of
`H` after the first record. Compare it to the ordinary prime-frontier count
`pi(Y)` and to the logarithmic integral main. The hallucinated line is that
the occupancy residual

`Q(Y) = (A(Y) - Li(Y)) / sqrt(Li(Y))`

is much flatter and tighter for the real divisor-world frontier sequence than
for fake-base CA/XA controls. If true, this would be a weird critical line:
the line is seen through an extremal divisor record sequence, not a direct
prime-counting or zeta construction.

Why it could be a line:

CA/XA records are RH-relevant divisor objects; the existing project found
that their frontier transitions almost never skip prime frontiers. A stable
sqrt-scale occupancy residual might be a divisor-world shadow of prime
regularity, connected to Robin/colossally abundant geometry rather than to
`psi` or zeros.

Preregistered confirmation:

`Q(Y)` stays flat across frontier ranges, real fake-base controls have larger
skip/occupancy deviations, the line is not just `pi(Y)` in disguise, and the
divisor record mechanism gives a nontrivial closure rule explaining why
frontiers are occupied.

Preregistered break:

the statistic is exactly or nearly `pi(Y)` with a tiny finite skipped-frontier
correction; fake controls are not structurally comparable; the candidate uses
prime factorization as a hidden prime-counting table; or the line depends on
the OEIS CA endpoint catalog rather than a generative law. Then it breaks as a
prime-frontier relabeling, useful for the CA-XA lead but not a new critical
line.

### SEE

Rendered the underlying prime-count residual component with:

- `node scripts/explore.mjs eval '{"domain":"int","N":3000,"ex":"n","ey":"(pi(n)-n/log(max(n,3)))/sqrt(max(n/log(max(n,3)),1))"}'`
- `node scripts/explore.mjs shot '{"domain":"int","N":3000,"ex":"n","ey":"(pi(n)-n/log(max(n,3)))/sqrt(max(n/log(max(n,3)),1))"}' logs/playground-artifacts/caxa-frontier-pi-residual-3000.png`

LAB metrics:
`linearity=0.880688`, `flatness=0.274564`, `zeroCrossings=3`,
`yMin=-0.910239`, `yMax=2.981555`.

The audit plot
`logs/playground-artifacts/caxa-frontier-occupancy-audit.png` shows the
factor check visually. The CA-XA occupancy curve is the prime-count residual
curve shifted down by the skipped-frontier correction.

### GROUND

Audit command:

`node scripts/caxa-frontier-occupancy-audit.mjs logs/divisor-extremes-artifacts/ca-xa-transitions.json logs/playground-artifacts`

Source artifact:
`logs/divisor-extremes-artifacts/ca-xa-transitions.json`, with `384`
`CA ∩ XA` records through A004394 row `8436`.

Frontier range audited: `113..2719`.

Occupancy decomposition:

| Y | primes in range | occupied | skipped | Li main | prime residual | occupancy Q | skipped/sqrt(Li) |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 151 | 7 | 6 | 1 | 7.790245 | -0.283130 | -0.641412 | 0.358282 |
| 200 | 17 | 16 | 1 | 17.280668 | -0.067517 | -0.308075 | 0.240558 |
| 300 | 33 | 32 | 1 | 35.422111 | -0.406965 | -0.574986 | 0.168021 |
| 500 | 66 | 65 | 1 | 68.882369 | -0.347293 | -0.467781 | 0.120489 |
| 800 | 110 | 109 | 1 | 115.285180 | -0.492236 | -0.585371 | 0.093135 |
| 1000 | 139 | 138 | 1 | 144.698154 | -0.473699 | -0.556831 | 0.083132 |
| 1439 | 199 | 193 | 6 | 206.536143 | -0.524386 | -0.941883 | 0.417497 |
| 1500 | 210 | 204 | 6 | 214.900803 | -0.334309 | -0.743600 | 0.409291 |
| 2000 | 274 | 268 | 6 | 281.897743 | -0.470389 | -0.827749 | 0.357360 |
| 2677 | 359 | 348 | 11 | 369.220583 | -0.531903 | -1.104369 | 0.572466 |
| 2719 | 368 | 357 | 11 | 374.536868 | -0.337771 | -0.906160 | 0.568389 |

Endpoint identity:

`Q(2719) = -0.906160 = -0.337771 - 0.568389`.

The exact identity held at every audited endpoint to floating roundoff:

`(occupied-Li)/sqrt(Li) = (pi-Li)/sqrt(Li) - skipped/sqrt(Li)`.

Exponent fits over the audited endpoints:
`abs(Q) theta=0.273798`,
`abs(pi residual) theta=0.334563`,
`skip correction theta=0.275399`.

Fixed-shape fake-base controls from the CA-XA artifact:

| group | skipped/Li | skipped total | max skipped | frontier changes | closure failures |
| --- | ---: | ---: | ---: | ---: | ---: |
| real CA-XA | 0.029370 | 11 | 5 | 356 | 0 |
| seed 12345 | 0.762531 | 6 | 6 | 1 | 0 |
| seed 271828 | 0.155274 | 19 | 6 | 98 | 0 |
| seed 314159 | 0.242260 | 49 | 24 | 164 | 344 |
| seed 161803 | 0.532715 | 7 | 6 | 5 | 0 |
| seed 424242 | 0.378592 | 146 | 37 | 245 | 1 |

The fake-base contrast is real evidence for the CA-XA frontier lead, but it
does not rescue this candidate as a critical line. The candidate's ordinate is
literally prime-count residual plus a finite skipped-frontier correction.

Factor/known check:

This is not a `psi` or `M` construction. It is the non-prime relabeling
failure mode: the x-axis is the prime frontier `Y`, and the occupied-frontier
count is `pi(Y)` minus skipped frontiers. The divisor-world mechanism explains
why skips are rare in the finite scan, but without a global skipped-frontier
theorem the proposed line is just a prime-count graph seen through CA-XA
records.

### BREAK

GRAVEYARD verdict: not a new critical line. The CA-XA divisor-frontier
occupancy line breaks as a prime-frontier relabeling with a finite skip
correction.

How it broke:

1. The exact decomposition into `pi(Y)` residual and skipped-frontier
   correction has zero numerical error.
2. The endpoint occupancy residual `-0.906160` is not a new residual; it is
   ordinary prime-count residual `-0.337771` shifted by `11/sqrt(Li)`.
3. The fake-base controls are not equivalent universe controls for the line;
   they test the CA-XA closure mechanism, not a prime-count replacement.
4. The construction uses frontier prime factorization, so the hidden prime
   table enters through the x-axis and through `pi(Y)`.
5. The finite scan is catalog-bound through A004394 row `8436`; no all-range
   skipped-frontier theorem exists yet.

CONNECTION: this connects the playground critical-line hunt with the earlier
CA-XA divisor-world lead. It shows exactly where that lead is strong and where
it cannot be over-claimed. CA-XA remains a live divisor-world theorem problem,
but its frontier occupancy graph is not a new critical line unless the missing
global skipped-frontier theorem supplies genuinely new control beyond
`pi(Y)`.

### LEARN

The divisor-world branch should not be used as a visual replacement for prime
counting. Its real content is closure and skipped-frontier scarcity, not the
occupancy residual itself. Future CA-XA experiments should target the missing
theorem directly: bound skipped frontier runs or classify recovery paths. For
the playground critical-line goal, the next attempt should either use CA-XA
without plotting against prime frontier `Y`, or return to two-universe
coordinate-free statistics.

## HANDOFF 45

Status: no survivor; forty-six graveyard/calibration entries in this ledger.
Cycle 46 closed the CA-XA divisor-frontier occupancy-line attempt.

New code since the previous handoff:

- reproducible audit script `scripts/caxa-frontier-occupancy-audit.mjs`
- artifact reports and previews:
  - `logs/playground-artifacts/caxa-frontier-occupancy-audit.md`
  - `logs/playground-artifacts/caxa-frontier-occupancy-audit.png`
  - `logs/playground-artifacts/caxa-frontier-pi-residual-3000.png`

No new lab primitive was added in Cycle 46.

Next cycle suggestion:

Do not score CA-XA by frontier occupancy against `Y`; that collapses to
`pi(Y)` minus skipped frontiers. If using CA-XA again, score the intrinsic
recovery-path margins or skipped-frontier run lengths against fixed-shape
controls. Otherwise pivot back to the two-universe program with a statistic
that has no ordered prime-frontier x-axis.

## Cycle 47 — Thue-Morse prime balance

### HALLUCINATE

Guess:

Leave local residues, predecessors, fixed shifts, and CA-XA frontiers. Use a
digital automatic sign instead:

`tm(n)=(-1)^{s_2(n)}`,

where `s_2(n)` is the binary digit sum. The candidate line is

`T(x)=sum_{p<=x} tm(p)`.

Score the normalized envelope

`B(x)=max_{y<=x}|T(y)|/sqrt(pi(x))`.

Why it could be a line:

the Thue-Morse sequence is deterministic but highly cancellation-rich, and its
prime subsequence is a famous nonlocal interaction between arithmetic and
digital dynamics. If a different route to RH-grade regularity exists through
dynamics/automatic sequences, this is a plausible place to see a flat
sqrt-normalized balance without zeta or zeros.

Preregistered confirmation:

`T(x)` has a sharp flat zero line after `sqrt(pi)` normalization, real primes
are materially tighter than five Cramer label controls and sampled composites,
the effect persists by blocks, and the result is not merely ordinary density
or a base-2 encoding artifact.

Preregistered break:

the statistic is known Mauduit-Rivat digital equidistribution, Cramer or
composites have comparable envelope, the effect changes under base or
coefficient encoding, or the construction is not coordinate-free enough for
the two-universe program. Then it breaks as digital/automatic calibration, not
a new critical line.

### SEE

Added LAB primitives `tm(n)` and `tmbal(n)`, then rendered the normalized
prime balance directly through the app evaluator.

LAB integer-domain command:

`node scripts/explore.mjs eval '{"domain":"int","N":200000,"ex":"n","ey":"tmbal(n)/sqrt(max(pi(n),1))"}'`

Metrics:
`linearity=0.326158`, `flatness=0.202429`, `zeroCrossings=2`,
`yMin=-10.253949`, `yMax=0.577350`.

Shot:
`logs/playground-artifacts/thue-morse-balance-200k.png`.

LAB prime-index command:

`node scripts/explore.mjs eval '{"domain":"prime","N":1000000,"ex":"pi(n)","ey":"tmbal(n)/sqrt(max(pi(n),1))"}'`

Metrics:
`linearity=0.808703`, `flatness=0.283267`, `zeroCrossings=2`,
`yMin=-17.016220`, `yMax=0.577350`.

Shot:
`logs/playground-artifacts/thue-morse-primeindex-balance-1m.png`.

The focus-mode LAB shots compress the dense trace into a thin band, so the
standalone audit plot is the clearer visual:
`logs/playground-artifacts/thue-morse-prime-balance-audit-16000000.png`.
It shows three important facts at once: base-2 integer primes do not separate
cleanly from the fake bands, base-3 digit parity explodes, and the
`F_2[t]` coefficient-parity analogue explodes for an algebraic reason.

### GROUND

Audit command:

`node scripts/thue-morse-prime-balance-audit.mjs 16000000 logs/playground-artifacts 22 13`

Integer side through `N=16000000`, with `1031130` prime labels at the
endpoint:

| series | final normalized | maxAbs/sqrt(labels) | maxAbs theta | block normalized values |
| --- | ---: | ---: | ---: | --- |
| real primes, base 2 | -33.801905 | 33.836373 | 0.774832 | -17.004, -0.554, -21.283, -2.647, -28.924 |
| real primes, base 3 | -1015.443745 | 1015.443745 | 1.000009 | -280.168, -265.396, -366.351, -506.588, -700.966 |
| real primes, base 10 | -9.402768 | 9.402768 | 0.586339 | -6.839, -6.424, -5.020, 0.472, -6.173 |

Endpoint controls:

| control | endpoint maxAbs/sqrt(labels) |
| --- | ---: |
| five Cramer label seeds | 29.884983..31.845043 |
| five sampled composite controls, coprime to 210 | 30.910564..32.982561 |

Thus the base-2 real-prime envelope `33.836373` is not separated from the
sampled-composite band; it is slightly above it. The candidate also fails
sqrt-flatness, with exponent `theta=0.774832`.

Function-field coefficient-parity checks:

| universe | endpoint | real maxAbs/sqrt(labels) | random monic range | random reducible range |
| --- | ---: | ---: | ---: | ---: |
| `F_2[t]`, degree 22 | 190557 irreducibles | 436.528350 | 1.001080..1.933437 | 18.960968..22.564399 |
| `F_3[t]`, degree 13 | 122640 irreducibles | 3.249572 | 1.042262..2.307253 | 0.836665..2.050257 |

Factor check:

over `F_2[t]`, coefficient parity is `f(1)`. A monic irreducible of degree
greater than one cannot have `f(1)=0`, because then it has factor `t+1`.
Therefore the coefficient-parity sign is forced for almost every irreducible.
The two-universe analogue is not a prime-regularity line; it is an algebraic
encoding artifact.

Known-result check:

This lives near the Mauduit-Rivat sum-of-digits/equidistribution theorem for
primes. That theorem-level background is exactly why this was a tempting
candidate, but the audit shows the finite normalized line is not an
RH-grade residual and is not coordinate-free.

### BREAK

GRAVEYARD verdict: not a new critical line. The Thue-Morse prime-balance
candidate breaks as digital automatic encoding, with base dependence and a
function-field factor obstruction.

How it broke:

1. The preregistered sqrt-flat zero line did not appear. Base-2 had
   endpoint envelope `33.836373` and exponent `theta=0.774832`.
2. The base-2 real-prime envelope did not beat the stronger fake controls:
   sampled composites ended at `30.910564..32.982561`, essentially the same
   scale.
3. Changing the digit base changed the effect violently: base 3 exploded to
   `1015.443745`, while base 10 ended at `9.402768`.
4. The two-universe check was fatal. In `F_2[t]`, coefficient parity is
   forced by avoidance of the factor `t+1`, giving maxAbs/sqrt
   `436.528350` at degree 22.
5. The construction depends on a chosen expansion/coordinate system. It is
   not intrinsic in the way the two-universe program needs.

CONNECTION: this connects to the coefficient/lex-order warning in the
project memory and to the user's warning about overusing Cramer. Cramer was
only a weak adversary here; the decisive breaks were sampled composites,
base changes, and function-field algebra. Future creative attempts should not
ask "does it beat Cramer?" first. They should ask whether the object survives
coordinate changes, local-factor controls, and a matched `F_q[t]` analogue.

### LEARN

Digital dynamics is a real source of prime theorems, but raw digit-sign
balances are the wrong object for this critical-line hunt. They manufacture
lines from the representation, and the function-field version can turn a
harmless-looking parity statistic into an exact factor test.

The useful takeaway is a stronger adversary stack:

- Cramer is only a density null.
- sampled composites test arithmetic-but-not-prime specificity;
- base or coordinate changes test representation artifacts;
- function-field factor checks test whether a statistic secretly encodes a
  local obstruction.

Next hallucination should keep the "leave old structures behind" spirit but
make the object intrinsic. A plausible direction is a coordinate-free
filtration object: expose integers or polynomials to increasing sets of small
local obstructions, subtract the whole local admissibility tensor, then score
the residual energy of what remains. That tries to connect the CA-XA
frontier-scarcity lead, the shift-incidence local-tuple break, and the
two-universe calibration without treating Cramer as the central theorem.

## HANDOFF 46

Status: no survivor; forty-seven graveyard/calibration entries in this
ledger. Cycle 47 closed the Thue-Morse prime-balance attempt.

New code since the previous handoff:

- LAB primitive `tm(n)` for Thue-Morse sign and cumulative prime balance
  `tmbal(n)` in `src/core/math.js`
- LAB exposure for `tm` and `tmbal` in `src/core/engine.js`
- hand-computed tests in `tests/math.test.js` and `tests/engine.test.js`
- reproducible audit script
  `scripts/thue-morse-prime-balance-audit.mjs`
- artifact reports and previews:
  - `logs/playground-artifacts/thue-morse-prime-balance-audit-16000000.md`
  - `logs/playground-artifacts/thue-morse-prime-balance-audit-16000000.json`
  - `logs/playground-artifacts/thue-morse-prime-balance-audit-16000000.png`
  - `logs/playground-artifacts/thue-morse-balance-200k.png`
  - `logs/playground-artifacts/thue-morse-primeindex-balance-1m.png`

Next cycle suggestion:

Do not center the next attempt on Cramer. Use it as one weak null, then
break the candidate with representation changes, sampled composites, and
function-field local-factor checks. The most promising fresh object is a
local-obstruction filtration residual: build an intrinsic sieve sigma-algebra
in both universes, subtract all visible local admissibility energy, and ask
whether the leftover residual has a stable flat line.

## Cycle 48 — finite-eligible sieve-filtration martingale

### HALLUCINATE

Guess:

Build the line from the local-obstruction filtration itself. For integers,
take the primorial tower

`6 -> 30 -> 210 -> 2310 -> 30030`.

At each level `W`, partition integers `n<=N` by eligible residues
`gcd(n,W)=1`. Do not use the uniform `total/phi(W)` main term; use the exact
finite counts from the deepest visible eligible background
`gcd(n,30030)=1`, projected to the coarser residue class. For a label set
`L`, define

`chi_W(L)=sum_{a in (Z/WZ)^*} (C_L(a)-|L|*E_N(a)/|E_N|)^2 / (|L|*E_N(a)/|E_N|)`.

Score the obstruction-revealing path

`A_W(L)=chi_W(L)/(phi(W)-1)`

and the endpoint line

`A_*(N)=mean_W A_W(primes<=N)`.

The function-field analogue uses products of all irreducible polynomials up
to small factor degree, exact eligible residue counts modulo that product,
and monic irreducibles of fixed degree as the labels.

Why it could be a line:

This subtracts the whole visible local sieve sigma-algebra before scoring.
If the earlier Cramer trap was "density without arithmetic" and the later
tuple trap was "local admissibility not removed", this tries to leave only
the residue after local obstruction exposure. A flat, subrandom
`A_*(N)` shared by integers and `F_q[t]` would be a genuinely different
critical-line candidate: prime regularity after all small local explanations
are removed.

Preregistered confirmation:

`A_*(N)` is flat across growing `N`; real primes are materially and stably
below five Cramer seeds, five final-eligible random controls, and five
final-eligible sampled composite controls; the per-level path is not
dominated by one modulus; `F_2[t]` and `F_3[t]` show the same normalized
subrandom line when matched by factor-product degree.

Preregistered break:

the statistic is just Dirichlet/AP equidistribution noise; final-eligible
composite controls overlap; Cramer is the only defeated null; one modulus
dominates; finite-count correction changes nothing from the older
modulus-flow curvature entry; or the function-field analogue has a different
level. Then it breaks as local sieve/AP calibration, not a new critical line.

### SEE

Audit command:

`node scripts/sieve-filtration-martingale-audit.mjs 16000000 logs/playground-artifacts 22 13 3 2`

The exact audit plot is:
`logs/playground-artifacts/sieve-filtration-martingale-audit-16000000.png`.

The picture is the first tempting part of this cycle. The integer real curve
is nearly flat and clearly below sampled final-eligible composites and
final-eligible random controls. The function-field bars point the same way:
`F_2[t]` and `F_3[t]` real irreducibles sit below reducible controls at the
endpoint.

LAB proxy command:

`node scripts/explore.mjs eval '{"domain":"int","N":200000,"ex":"n","ey":"rowcount(n)*log(max(n,3))/max(n,1)"}'`

Metrics:
`linearity=0.075858`, `flatness=0.066005`, `zeroCrossings=0`,
`yMin=0.013627`, `yMax=1.098612`.

Shot:
`logs/playground-artifacts/sieve-filtration-rowcount-proxy-200k.png`.

This LAB proxy is not the audit statistic; it only renders the same visual
idea that local-obstruction survivors accumulate into a flat PNT-like line.
The exact evidence is the audit table/SVG.

### GROUND

Integer side, deepest background `gcd(n,30030)=1`, through `N=16000000`:

| N | real labels | real meanNorm | real W=30030 norm | Cramer meanNorm range | eligible meanNorm range | composite meanNorm range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1000000 | 78492 | 0.160041 | 0.425710 | 0.588988..0.841301 | 0.331374..0.980922 | 0.330462..0.568954 |
| 2000000 | 148927 | 0.173827 | 0.390650 | 0.542033..0.700014 | 0.520655..0.872181 | 0.294798..0.419469 |
| 4000000 | 283140 | 0.187302 | 0.373413 | 0.465424..0.927347 | 0.394462..1.005252 | 0.364583..0.445448 |
| 8000000 | 539771 | 0.153368 | 0.360941 | 0.547207..1.684648 | 0.492066..0.723229 | 0.326193..0.662790 |
| 16000000 | 1031124 | 0.170082 | 0.352949 | 0.649029..1.212557 | 0.447919..1.029102 | 0.449680..0.716115 |

The integer line is genuinely stable:
`meanNorm theta=-0.000508`, `endpointNorm theta=-0.065493`, and
`abs(meanNorm-1) theta=0.000059`.

Endpoint per-level real path:

| W | df | chi | norm |
| ---: | ---: | ---: | ---: |
| 6 | 1 | 0.129674 | 0.129674 |
| 30 | 7 | 0.493510 | 0.070501 |
| 210 | 47 | 5.035165 | 0.107131 |
| 2310 | 479 | 91.083203 | 0.190153 |
| 30030 | 5759 | 2032.633169 | 0.352949 |

Function-field side:

`F_2[t]` used factors through degree `3`; the final product has degree `10`
and `147` eligible residues. Endpoint degree `22`:
real meanNorm `0.110042`, endpoint norm `0.220084`,
eligible controls `0.335036..1.628027`,
reducible controls `0.323119..0.931569`.

`F_3[t]` used factors through degree `2`; the final product has degree `9`
and `4096` eligible residues. Endpoint degree `13`:
real meanNorm `0.174349`, endpoint norm `0.348698`,
eligible controls `0.507861..0.897907`,
reducible controls `0.317873..0.822499`.

Uniform-main factor check:

At `N=16000000`, replacing the deepest finite eligible background by the
ordinary uniform AP main term gives almost identical endpoint norms:

| W | finite eligible norm | uniform AP norm |
| ---: | ---: | ---: |
| 6 | 0.129674 | 0.129912 |
| 30 | 0.070501 | 0.070880 |
| 210 | 0.107131 | 0.107467 |
| 2310 | 0.190153 | 0.190342 |
| 30030 | 0.352949 | 0.353189 |

So the finite-count correction did not create a new object; it only polished
the old AP/residue-energy object.

Equivalence/factor check:

For uniform background,

`chi_W = sum_a (C(a)-P/phi(W))^2/(P/phi(W))`

is, by character orthogonality, the normalized L2 energy of nonprincipal
Dirichlet character sums over primes modulo `W`:

`chi_W = (1/P) sum_{chi != chi0} |sum_{p<=N} chi(p)|^2`

up to the standard normalization and the omission of small primes dividing
`W`. The function-field analogue is the same multiplicative-character energy
modulo the product polynomial. Its smallness is exactly the finite-field
PNT-in-progressions / Weil-RH calibration.

### BREAK

GRAVEYARD verdict: not a new critical line. Numerically this is a real,
stable, cross-universe line, but the novelty gate fails: it collapses to
Dirichlet/finite-field character energy, i.e. prime number theorem in
arithmetic progressions in L2 form.

How it broke:

1. The line is real: integer `meanNorm` stays near `0.16..0.19` with
   theta `-0.000508`, and endpoint controls are much larger.
2. Composite controls fail it: at `N=16000000`, sampled final-eligible
   composites have meanNorm `0.449680..0.716115` versus real `0.170082`.
3. Both function fields point the same way: `F_2[t]` degree `22` real
   meanNorm `0.110042`; `F_3[t]` degree `13` real `0.174349`; reducible
   controls are higher.
4. But the finite eligible main term is essentially the uniform AP main term
   at these ranges. The endpoint `W=30030` norm moves only from `0.352949`
   to `0.353189`.
5. Orthogonality identifies the statistic as squared nonprincipal character
   sums over primes. The proof mechanism is Dirichlet L-functions over
   integers and Weil RH over `F_q[t]`, not a new non-zeta route.

STATUS: `GRAVEYARD / KNOWN-MATH CHARACTER-ENERGY CALIBRATION`, with a real
line but no novelty claim.

CONNECTION: this is the best-behaved descendant of the primorial
modulus-flow curvature entry. It also connects to the original real nugget
that Cramer fake primes fail arithmetic square-root cancellation: here the
failure is not global `psi(x)-x` but AP/character-sum cancellation. The
function-field match is useful calibration for the two-universes program,
but it confirms known machinery rather than escaping it.

### LEARN

This cycle is valuable because it separates "real line" from "new line."
The line survived the visual, composite, and two-universe numeric checks, but
the equivalence check killed novelty. That is a sharper audit rule:

if a local-obstruction statistic is an L2 residue/AP energy, immediately
factor it through characters before calling it a new object.

Next hallucination should keep the cross-universe success but avoid
multiplicative character orthogonality. One route is to use a nonlinear
functional of the local residual field that is not reducible to second moment
character energy: e.g. persistence topology of high/low AP residual cells
across the obstruction tower, with phase-randomized character controls.

## HANDOFF 47

Status: no survivor; forty-eight graveyard/calibration entries in this
ledger. Cycle 48 closed the finite-eligible sieve-filtration martingale.

New code since the previous handoff:

- reproducible audit script
  `scripts/sieve-filtration-martingale-audit.mjs`
- artifact reports and previews:
  - `logs/playground-artifacts/sieve-filtration-martingale-audit-16000000.md`
  - `logs/playground-artifacts/sieve-filtration-martingale-audit-16000000.json`
  - `logs/playground-artifacts/sieve-filtration-martingale-audit-16000000.svg`
  - `logs/playground-artifacts/sieve-filtration-martingale-audit-16000000.png`
  - `logs/playground-artifacts/sieve-filtration-rowcount-proxy-200k.png`

No new LAB primitive was added in Cycle 48.

Next cycle suggestion:

Do not abandon the local-filtration branch; the line was too clean to ignore.
But do not score any statistic that is a quadratic residue/AP energy unless
the character factorization is the point. Try a nonlinear topology or
ordering-free geometry of the residual field after subtracting all character
energy, then use phase-randomized character controls before Cramer.

## Cycle 49 — residual-field branch persistence

### HALLUCINATE

Guess:

Keep the local-obstruction tower, but stop scoring L2 energy. At each tower
level `W`, compute the standardized AP residual field

`z_W(a)=(C(a)-E(a))/sqrt(E(a))`

against the deepest finite eligible background. For every deepest eligible
residue `r mod 30030`, follow its ancestor branch through

`6 -> 30 -> 210 -> 2310 -> 30030`.

Define branch alignment as the weighted average sign agreement between
adjacent ancestor residuals:

`B = sum_r sum_j sign(z_j(r) z_{j+1}(r)) sqrt(|z_j(r) z_{j+1}(r)|) / sum_r sum_j sqrt(|z_j(r) z_{j+1}(r)|)`.

This is nonlinear in the residual field and is not just the character-energy
second moment. The function-field analogue uses the product-of-small-
irreducibles tower and follows final eligible residue branches through
coarser factor products.

Why it could be a line:

If primes create an unusually coherent residual geometry after all local
obstructions are subtracted, branch persistence might reveal structure that
quadratic AP energy throws away. Phase/permutation controls can preserve each
level's energy and marginal residual distribution while destroying the tree
geometry, so a stable real excess would be a plausible nonlinear
two-universe critical-line candidate.

Preregistered confirmation:

integer branch alignment is stable across growing `N`, real primes are
separated from five eligible-random, five sampled-composite, and five
level-permutation controls, and `F_2[t]`/`F_3[t]` show the same sign and
scale. The effect must survive after comparing against controls with the same
per-level residual values but permuted across residue branches.

Preregistered break:

branch persistence is forced by tower aggregation because a parent residual is
a weighted sum of child residuals; eligible/composite controls reproduce it;
permutation controls are the only defeated null; the statistic depends on the
chosen tower; or the function-field levels disagree. Then it breaks as
filtration-martingale geometry, not a new critical line.

### SEE

Audit command:

`node scripts/residual-branch-persistence-audit.mjs 16000000 logs/playground-artifacts 22 13 3 2`

Audit plot:
`logs/playground-artifacts/residual-branch-persistence-audit-16000000.png`.

The plot shows the central failure visually. The integer real curve is
positive and fairly stable, but it lies in or below the sampled-composite
band. The yellow level-permutation band is near zero, so the statistic
detects tree geometry; it does not isolate prime geometry.

LAB proxy command:

`node scripts/explore.mjs eval '{"domain":"int","N":200000,"ex":"n","ey":"rowcount(n)*log(max(n,3))/max(n,1)"}'`

Metrics:
`linearity=0.075858`, `flatness=0.066005`, `zeroCrossings=0`,
`yMin=0.013627`, `yMax=1.098612`.

Shot:
`logs/playground-artifacts/residual-branch-rowcount-proxy-200k.png`.

As in Cycle 48, this LAB shot is only a local-survivor proxy. The branch
alignment statistic itself is in the audit script/artifacts.

### GROUND

Integer side through `N=16000000`:

| N | real labels | real alignment | real persistence | eligible alignment range | composite alignment range | level-permutation alignment range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1000000 | 78492 | 0.228443 | 0.614221 | 0.281697..0.451082 | 0.278397..0.398247 | -0.079260..0.036938 |
| 2000000 | 148927 | 0.283901 | 0.641950 | 0.294499..0.495559 | 0.249393..0.596045 | -0.180440..0.122242 |
| 4000000 | 283140 | 0.374054 | 0.687027 | 0.336911..0.415616 | 0.322035..0.397945 | -0.071069..0.079697 |
| 8000000 | 539771 | 0.289061 | 0.644530 | 0.312376..0.433173 | 0.308411..0.575872 | -0.028440..0.056715 |
| 16000000 | 1031124 | 0.288339 | 0.644170 | 0.348110..0.447200 | 0.296694..0.386235 | -0.133725..0.097795 |

Integer exponent:
`alignment theta=0.069785`.

Endpoint energy carried by the same residual field:

| W | df | norm |
| ---: | ---: | ---: |
| 6 | 1 | 0.129674 |
| 30 | 7 | 0.070501 |
| 210 | 47 | 0.107131 |
| 2310 | 479 | 0.190153 |
| 30030 | 5759 | 0.352949 |

Function-field side:

`F_2[t]` factors through degree `3`; final product degree `10`, with `147`
eligible residues.

| degree | real alignment | usable branch pairs | reducible alignment range |
| ---: | ---: | ---: | ---: |
| 19 | nan | 0 | 0.032273..0.114039 |
| 20 | nan | 0 | 0.019931..0.108150 |
| 21 | -0.038193 | 147 | 0.016304..0.162551 |
| 22 | nan | 0 | 0.020388..0.168297 |

`F_3[t]` factors through degree `2`; final product degree `9`, with `4096`
eligible residues.

| degree | real alignment | usable branch pairs | reducible alignment range |
| ---: | ---: | ---: | ---: |
| 10 | 0.061317 | 4096 | 0.049928..0.066728 |
| 11 | nan | 0 | 0.024219..0.049012 |
| 12 | 0.020765 | 4096 | 0.038513..0.063802 |
| 13 | nan | 0 | 0.015628..0.062473 |

Factor check:

The branch statistic is nonlinear, but it is not free of the filtration
martingale. At a coarser residue class, the residual is a weighted sum of the
residuals of its children:

`C_parent - E_parent = sum_child (C_child - E_child)`.

The sign of a parent therefore tends to agree with the aggregate sign of the
children for any label set sampled from the same deepest background. This is
why independent level-permutation controls fall near zero while eligible and
composite controls remain positive.

### BREAK

GRAVEYARD verdict: not a new critical line. The residual-field branch
persistence candidate breaks as filtration-martingale aggregation geometry.

How it broke:

1. Integer real alignment is not prime-specific. At `N=16000000`, real
   alignment is `0.288339`, while sampled final-eligible composites range
   `0.296694..0.386235` and final-eligible random controls range
   `0.348110..0.447200`.
2. The only cleanly defeated null is the level-permutation control
   `-0.133725..0.097795`, which deliberately destroys ancestor/descendant
   aggregation.
3. Function fields do not provide a shared line. `F_2[t]` has no usable
   nonzero branch pairs at degrees `19`, `20`, and `22`; only degree `21`
   gives `-0.038193`. `F_3[t]` is defined only at degrees `10` and `12`, and
   the real values are at the same scale as reducible controls.
4. The statistic depends on the chosen tower depth and on whether coarser
   residual fields vanish exactly. That is a coordinate/tower artifact, not
   an intrinsic critical line.
5. The algebraic identity
   `residual(parent)=sum residual(children)` explains why branch persistence
   survives permutation but not composite controls.

STATUS: `GRAVEYARD / FILTRATION-MARTINGALE GEOMETRY`, not a new critical
line.

CONNECTION: this is the nonlinear repair of Cycle 48. It confirms that
escaping quadratic character energy is not enough; any statistic built from a
nested local-obstruction tower must also quotient out the deterministic
parent-child aggregation identity. Otherwise it only detects that the tower is
a martingale.

### LEARN

For local-filtration experiments, the next null must preserve not just
per-level energy, but also parent-child aggregation. The right adversary is a
martingale-preserving control: randomize residuals inside each parent class
conditioned on the parent residual, then score only higher-order geometry
left inside sibling fibers.

Next hallucination should either:

- build that conditional sibling-residual object, or
- leave AP/local towers entirely and return to an intrinsic graph/divisor
  object where the equivalence check is not immediately character energy or
  martingale aggregation.

## HANDOFF 48

Status: no survivor; forty-nine graveyard/calibration entries in this ledger.
Cycle 49 closed the residual-field branch-persistence attempt.

New code since the previous handoff:

- reproducible audit script
  `scripts/residual-branch-persistence-audit.mjs`
- artifact reports and previews:
  - `logs/playground-artifacts/residual-branch-persistence-audit-16000000.md`
  - `logs/playground-artifacts/residual-branch-persistence-audit-16000000.json`
  - `logs/playground-artifacts/residual-branch-persistence-audit-16000000.svg`
  - `logs/playground-artifacts/residual-branch-persistence-audit-16000000.png`
  - `logs/playground-artifacts/residual-branch-rowcount-proxy-200k.png`

No new LAB primitive was added in Cycle 49.

Next cycle suggestion:

If staying with local filtrations, do not compare only to independent
level-permutation controls. Use a martingale-preserving sibling shuffle:
condition on every parent residual, redistribute child residuals within the
fiber, and score only geometry that remains. If leaving the branch, use a
coordinate-free divisor or graph object and make the first break check
"not character energy, not martingale aggregation."

## Cycle 50 — conditional sibling-extreme filtration line

### HALLUCINATE

Guess:

Keep the local-obstruction tower one more time, but quotient out the
parent-child martingale exactly. For each refinement edge

`W -> Wp`

and each parent residue `a mod W`, condition on the observed parent prime
count `C(a)`. The children `b mod Wp` have exact finite eligible weights
`E(b)/E(a)`. Define child innovations

`I(b) = (C(b) - C(a) E(b)/E(a)) / sqrt(C(a) q_b (1-q_b))`.

Now score only the nonlinear sibling extreme inside each parent fiber:

`S = mean_parent max_child |I(b)| / sqrt(2 log(k_parent))`,

averaged across the tower edges. This preserves the parent residual by
construction and asks whether the fine-scale local residual field is
unusually smooth after every visible parent obstruction has been removed.

The function-field analogue conditions on residue classes modulo the product
of small irreducibles and refines by the next irreducible-degree layer.

Why it could be a line:

Cycle 48 found a real AP-energy line but it collapsed to character energy.
Cycle 49 found branch geometry but it collapsed to martingale aggregation.
This candidate removes both visible failure modes: it conditions on parent
counts and uses a nonlinear extreme statistic inside sibling fibers. A stable
real value below martingale-preserving sibling shuffles and composite controls
would be evidence for residual regularity not explained by L2 character
energy or parent-child aggregation.

Preregistered confirmation:

integer `S(N)` is flat across growing `N`; real primes are separated from
five final-eligible random controls, five sampled-composite controls, and
five sibling-shuffle controls that preserve every parent count and sibling
fiber size; `F_2[t]` and `F_3[t]` show the same normalized subextreme line.

Preregistered break:

the sibling-shuffle controls reproduce the real statistic; sampled composites
overlap; the score is just multinomial/hypergeometric extreme theory; one
edge dominates; function-field levels are degenerate or disagree; or the
normalization by `sqrt(2 log k)` is the whole line. Then it breaks as
conditional local-multinomial calibration, not a new critical line.

### SEE

Audit command:

`node scripts/conditional-sibling-extreme-audit.mjs 16000000 logs/playground-artifacts 22 13 3 2`

Audit plot:
`logs/playground-artifacts/conditional-sibling-extreme-audit-16000000.png`.

The picture is the strongest local-filtration picture so far. The integer
real curve is flat and separated below sampled final-eligible composites and
below parent-conditioned sibling multinomial controls. The function-field
bars point the same way for both `F_2[t]` and `F_3[t]`.

LAB proxy command:

`node scripts/explore.mjs eval '{"domain":"int","N":200000,"ex":"n","ey":"rowcount(n)*log(max(n,3))/max(n,1)"}'`

Metrics:
`linearity=0.075858`, `flatness=0.066005`, `zeroCrossings=0`,
`yMin=0.013627`, `yMax=1.098612`.

Shot:
`logs/playground-artifacts/conditional-sibling-rowcount-proxy-200k.png`.

The LAB shot is still only the local-survivor proxy. The actual conditional
sibling-extreme statistic is in the audit script/artifacts.

### GROUND

Integer side through `N=16000000`:

| N | real labels | real meanExtreme | real maxEdgeExtreme | eligible meanExtreme range | composite meanExtreme range | sibling-shuffle meanExtreme range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1000000 | 78492 | 0.367103 | 0.577968 | 0.569352..0.717610 | 0.487690..0.626412 | 0.824353..0.862654 |
| 2000000 | 148927 | 0.374346 | 0.561191 | 0.585380..0.783051 | 0.491425..0.635739 | 0.725838..0.886835 |
| 4000000 | 283140 | 0.333774 | 0.544802 | 0.661231..0.763494 | 0.538304..0.653022 | 0.784741..0.853395 |
| 8000000 | 539771 | 0.323507 | 0.539069 | 0.600972..0.708820 | 0.545335..0.656927 | 0.810202..0.987304 |
| 16000000 | 1031124 | 0.347983 | 0.532540 | 0.609883..0.670970 | 0.586414..0.694475 | 0.770643..0.942498 |

Integer mean-extreme exponent:
`theta=-0.036491`.

Endpoint per-edge real path:

| edge | fibers | meanExtreme | maxFiber |
| --- | ---: | ---: | ---: |
| 6->30 | 2 | 0.216254 | 0.235933 |
| 30->210 | 8 | 0.250728 | 0.365426 |
| 210->2310 | 48 | 0.392410 | 0.622520 |
| 2310->30030 | 480 | 0.532540 | 1.052367 |

Function-field side:

`F_2[t]` factors through degree `3`; final product degree `10`, with `147`
eligible residues.

| degree | real meanExtreme | reducible range | sibling-shuffle range |
| ---: | ---: | ---: | ---: |
| 19 | 0.220900 | 0.480252..0.632583 | 0.524595..1.023083 |
| 20 | 0.198512 | 0.457788..0.696525 | 0.548053..1.496037 |
| 21 | 0.203395 | 0.412919..0.900300 | 0.724391..1.000790 |
| 22 | 0.217797 | 0.421126..0.882072 | 0.571294..0.809012 |

`F_3[t]` factors through degree `2`; final product degree `9`, with `4096`
eligible residues.

| degree | real meanExtreme | reducible range | sibling-shuffle range |
| ---: | ---: | ---: | ---: |
| 10 | 0.370060 | 0.370078..0.370148 | 0.990767..1.109035 |
| 11 | 0.581444 | 0.597342..0.617103 | 0.938740..1.081659 |
| 12 | 0.657456 | 0.715630..0.743759 | 0.966201..1.063325 |
| 13 | 0.469138 | 0.662525..0.697262 | 0.881934..0.947429 |

This passes the numeric controls that killed Cycle 49: parent counts are
preserved in the sibling-shuffle null, and real primes/irreducibles are still
subextreme.

Equivalence/factor check:

The candidate is nonlinear, but it is still a fixed finite AP-residual
functional. Each child innovation is a linear combination of residue counts
modulo the refined modulus `Wp`, conditioned on coarser counts modulo `W`.
By finite Fourier/character orthogonality on the quotient fiber, those
innovations are exactly the nontrivial character components introduced at the
new local factor. Taking a maximum instead of an L2 norm changes the
functional, but not the information source: it is still prime equidistribution
in fixed arithmetic progressions / finite-field residue classes.

### BREAK

GRAVEYARD verdict: real calibration line, not a new critical line. The
conditional sibling-extreme statistic survives the numerical controls in this
audit, but fails the novelty/equivalence gate: it is a nonlinear functional
of fixed-modulus AP residuals.

How it broke:

1. The line is real and stable: integer meanExtreme stays
   `0.323507..0.374346`, with endpoint `0.347983` and theta `-0.036491`.
2. It beats stronger controls. At `N=16000000`, composites are
   `0.586414..0.694475`; sibling-multinomial controls preserving parent
   counts are `0.770643..0.942498`.
3. It also holds in both function-field universes. Endpoint `F_2[t]` real
   is `0.217797` versus reducibles `0.421126..0.882072`; endpoint `F_3[t]`
   real is `0.469138` versus reducibles `0.662525..0.697262`.
4. But the statistic is still built entirely from residue counts modulo a
   fixed finite local factor tower. Conditional child residuals are quotient
   character components; the maximum is a nonlinear summary of the same AP
   equidistribution data.
5. The proof mechanism that would explain the cross-universe behavior is
   the same as Cycle 48: Dirichlet-character equidistribution over integers
   and Weil/PNT-in-AP over `F_q[t]`. This is a useful line, but not a
   different route to RH-grade content.

STATUS: `GRAVEYARD / NONLINEAR AP-RESIDUAL CALIBRATION`, with a real
cross-universe line but no novelty claim.

CONNECTION: this is the martingale-preserving repair of Cycle 49 and the
nonlinear repair of Cycle 48. It shows the local-filtration branch can produce
very clean real-vs-random contrasts after the right conditioning, but all
fixed local-factor statistics still factor through AP/character
equidistribution. The next attempt should leave fixed AP towers unless it
explicitly studies character-equidistribution functionals as calibration.

### LEARN

The conditional sibling-extreme line is worth keeping as a calibration test:
it is a strong visual/numeric example of arithmetic hyperuniformity that
Cramer, composites, and parent-conditioned multinomial controls miss. But it
does not satisfy the playground's "different route" constraint.

The next hallucination should pivot away from fixed residue towers. Two good
directions:

- an intrinsic divisor-object statistic that is not plotted against a prime
  frontier and not reducible to `pi`;
- an unordered graph statistic with local pair/triple expectations subtracted
  at the tensor level before any spectral score.

## HANDOFF 49

Status: no survivor; fifty graveyard/calibration entries in this ledger.
Cycle 50 closed the conditional sibling-extreme filtration attempt.

New code since the previous handoff:

- reproducible audit script
  `scripts/conditional-sibling-extreme-audit.mjs`
- artifact reports and previews:
  - `logs/playground-artifacts/conditional-sibling-extreme-audit-16000000.md`
  - `logs/playground-artifacts/conditional-sibling-extreme-audit-16000000.json`
  - `logs/playground-artifacts/conditional-sibling-extreme-audit-16000000.svg`
  - `logs/playground-artifacts/conditional-sibling-extreme-audit-16000000.png`
  - `logs/playground-artifacts/conditional-sibling-rowcount-proxy-200k.png`

No new LAB primitive was added in Cycle 50.

Next cycle suggestion:

Stop iterating on fixed AP/local-factor towers for now. The branch has
produced strong calibration lines, but the equivalence gate keeps routing
them to character equidistribution. Pivot to a coordinate-free divisor or
unordered graph object; if graph-based, subtract local tuple expectations
before scoring a spectrum.

## Cycle 51 — locally whitened shift-incidence spectrum

### HALLUCINATE

Guess:

Return to the unordered fixed-shift graph branch, but subtract more of the
local tuple structure before scoring. For each label `p` and admissible shift
`h`, define an opportunity only when `p+h` survives the small-prime local
obstruction. Let

`r_h = # {p, p+h both labels} / # {p label, p+h locally admissible}`.

Build the whitened row feature

`Z_p(h) = (1_{p+h label} - r_h) / sqrt(r_h(1-r_h))`

on opportunity cells, and `0` otherwise. Score the spectral radius of the
off-diagonal covariance of the `Z_p(h)` columns. This centers each shift by
its own observed pair rate after local admissibility, so pair counts and
small-prime opportunities are removed before testing triple/overlap geometry.

The function-field analogue uses irreducibles of fixed degree and polynomial
shifts divisible by all linear factors, with opportunities defined by staying
inside the monic degree layer.

Why it could be a line:

Cycle 44 failed because raw fixed-shift graph degrees mostly measured pair
counts. Cycle 45 failed because centered shift incidence still matched
primorial-eligible composites. This candidate whitens each shift by its
admissible opportunity rate first. If the remaining covariance spectrum is
flat and prime-specific, it would be a coordinate-free graph statistic beyond
AP character energy and beyond raw local tuple counts.

Preregistered confirmation:

integer spectral radius is flat across growing `N`; real primes separate from
five Cramer controls, five final-eligible random controls, five sampled
composite controls, and column-permutation controls; `F_2[t]` and `F_3[t]`
show the same normalized scale. The effect must not be an endpoint win or a
single-shift/pair domination.

Preregistered break:

sampled composites reproduce the spectrum; final-eligible random labels
overlap; function-field scales disagree; the statistic is still a Hardy-
Littlewood local tuple tensor in disguise; or whitening by observed pair
rates removes the whole signal. Then it breaks as local tuple/admissibility
calibration, not a new critical line.

### SEE

Audit command:

`node scripts/locally-whitened-shift-spectrum-audit.mjs 8000000 logs/playground-artifacts 22 13`

Audit plot:
`logs/playground-artifacts/locally-whitened-shift-spectrum-audit-8000000.png`.

The plot has two different stories in it. On the integer side, the real
curve is almost flat near `rho=0.02` while the eligible/composite/null
bands decay below it. On the function-field side, the real bars are far
above their controls, but they sit on much larger and universe-dependent
scales: `F_2[t]` around `0.31`, `F_3[t]` around `0.19`.

LAB proxy command:

`node scripts/explore.mjs eval '{"domain":"prime","N":200000,"ex":"pi(n)","ey":"isprime(n+6)+isprime(n+12)+isprime(n+18)+isprime(n+24)"}'`

Metrics:
`linearity=0.015326`, `flatness=0.815658`, `zeroCrossings=0`,
`yMin=0`, `yMax=4`.

Shot:
`logs/playground-artifacts/locally-whitened-shift-incidence-proxy-200k.png`.

The LAB shot collapses to a compressed horizontal stratum because the
visible object is a small integer-valued fixed-shift incidence degree. The
claimed line only appears after centering, whitening, and spectral scoring,
so the audit matrix is the real object.

### GROUND

Integer side through `N=8000000`:

Rho exponent: `theta=0.029639`. Pair-RMS exponent:
`theta=-0.152768`.

| N | labels | real rho | real pairRms | mean pair rate | eligible rho range | composite rho range | column-null rho range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 500000 | 41538 | 0.021396 | 0.004793 | 0.429311 | 0.018944..0.031035 | 0.018106..0.031225 | 0.020683..0.025665 |
| 1000000 | 78498 | 0.017459 | 0.003821 | 0.405845 | 0.014423..0.021472 | 0.015602..0.021193 | 0.012989..0.016785 |
| 2000000 | 148933 | 0.020304 | 0.003638 | 0.384332 | 0.009449..0.014938 | 0.009566..0.018750 | 0.008630..0.015016 |
| 4000000 | 283146 | 0.020698 | 0.003127 | 0.365322 | 0.005769..0.009035 | 0.006060..0.012496 | 0.007212..0.011568 |
| 8000000 | 539777 | 0.021600 | 0.003245 | 0.347959 | 0.005960..0.007371 | 0.007471..0.011577 | 0.005023..0.006394 |

Endpoint Cramer range is `0.007548..0.014133`, so the integer endpoint is
above all fake controls. Endpoint normalized spectral radius is
`rhoNorm=0.008164`.

Dominant integer endpoint correlations are still small fixed-shift overlap
entries:

| shift pair | corr |
| --- | ---: |
| 6 vs 90 | -0.005764 |
| 30 vs 90 | -0.005489 |
| 30 vs 42 | -0.004458 |
| 30 vs 60 | -0.004005 |
| 12 vs 42 | -0.003984 |
| 12 vs 90 | -0.003935 |

Function-field side:

`F_2[t]` shifts:
`t^2 + t`, `t^3 + t^2`, `t^3 + t`, `t^4 + t^3 + t^2 + t`,
`t^4 + t`, `t^5 + t^4 + t^3 + t`,
`t^5 + t^3 + t^2 + t`, `t^6 + t^5 + t^2 + t`.

| degree | labels | real rho | real pairRms | mean pair rate | monic rho range | reducible rho range | column-null rho range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 19 | 27594 | 0.360630 | 0.064056 | 0.193656 | 0.023088..0.041157 | 0.020171..0.035413 | 0.024154..0.030145 |
| 20 | 52377 | 0.345067 | 0.059883 | 0.183917 | 0.011008..0.028390 | 0.016176..0.023177 | 0.015016..0.022376 |
| 21 | 99858 | 0.329221 | 0.056846 | 0.174666 | 0.014396..0.016401 | 0.010941..0.017165 | 0.012223..0.015904 |
| 22 | 190557 | 0.313324 | 0.054231 | 0.167430 | 0.007840..0.013374 | 0.008233..0.011506 | 0.009000..0.010670 |

Endpoint `F_2[t]` normalized spectral radius is `rhoNorm=0.118425`.
The largest endpoint entries include
`t^4 + t^3 + t^2 + t` vs `t^5 + t^4 + t^3 + t` at `0.087490`.

`F_3[t]` shifts:
`t^3 + 2*t`, `2*t^3 + t`, `t^4 + 2*t^2`, `2*t^4 + t^2`,
`t^4 + t^3 + 2*t^2 + 2*t`,
`2*t^4 + 2*t^3 + t^2 + t`,
`t^4 + 2*t^3 + 2*t^2 + t`,
`2*t^4 + t^3 + t^2 + 2*t`.

| degree | labels | real rho | real pairRms | mean pair rate | monic rho range | reducible rho range | column-null rho range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 10 | 5880 | 0.208143 | 0.033711 | 0.319643 | 0.052616..0.079581 | 0.047346..0.084370 | 0.053003..0.073648 |
| 11 | 16104 | 0.248863 | 0.037074 | 0.285581 | 0.035534..0.055798 | 0.029241..0.044492 | 0.035147..0.056744 |
| 12 | 44220 | 0.210107 | 0.030450 | 0.263529 | 0.015518..0.033587 | 0.021421..0.030126 | 0.019375..0.023926 |
| 13 | 122640 | 0.187906 | 0.027158 | 0.242551 | 0.009864..0.013916 | 0.010614..0.016320 | 0.010462..0.014541 |

Endpoint `F_3[t]` normalized spectral radius is `rhoNorm=0.071022`.
The largest endpoint entry is
`t^3 + 2*t` vs `2*t^3 + t` at `-0.035034`.

### BREAK

GRAVEYARD verdict: fixed-shift local tuple tensor, not a new critical line.
The integer calibration is real, but the cross-universe scale gate fails and
the factor check identifies the source.

How it broke:

1. Integer primes pass the simple numerical controls. At `N=8000000`, real
   `rho=0.021600` is above Cramer `0.007548..0.014133`, final-eligible
   random `0.005960..0.007371`, sampled composites `0.007471..0.011577`,
   and column-null `0.005023..0.006394`.
2. The integer real curve is flat enough to be tempting:
   `theta=0.029639`, with endpoint `rhoNorm=0.008164`.
3. But the function-field analogues do not land on the same scale. Endpoint
   `F_2[t]` has `rho=0.313324`, `rhoNorm=0.118425`; endpoint `F_3[t]` has
   `rho=0.187906`, `rhoNorm=0.071022`; both dwarf their reducible and column
   controls by an order of magnitude.
4. The covariance between two whitened columns `h_i,h_j` is a centered count
   of the triple pattern `{p, p+h_i, p+h_j}` after pair-rate whitening and
   opportunity masking. That is exactly where Hardy-Littlewood singular
   series / function-field tuple constants live.
5. The dominant entries are attached to particular shift differences, not to
   an intrinsic unordered graph invariant. Whitening removed pair density,
   but it left the fixed finite tuple tensor.

STATUS: `GRAVEYARD / FIXED-SHIFT LOCAL TUPLE TENSOR`.

CONNECTION: this is the cleaned-up descendant of the raw fixed-shift graph
and centered shift-incidence attempts. The repair worked against Cramer,
eligible random labels, sampled composites, and column permutations, but the
surviving signal is the next local-tuple layer. Pair whitening does not
remove triple constants.

### LEARN

The graph branch is not dead, but fixed shifts are too easy for the audit to
factor. A covariance of pair-whitened shift columns is automatically a
third-order tuple statistic. If the next graph attempt keeps shifts, it must
subtract the predicted tuple tensor before taking a spectrum, or make the
shift set itself random/scale-growing and test invariance to that choice.

Better pivot: build a graph whose vertices are intrinsic arithmetic objects
such as divisors, radicals, squarefree kernels, or factorization fibers, with
no fixed coordinate shifts and no lexicographic polynomial order.

## HANDOFF 50

Status: no survivor. Cycle 51 found a real integer flat calibration, but it
broke as a fixed-shift local tuple tensor after the function-field scale and
factor checks.

New code since the previous handoff:

- reproducible audit script
  `scripts/locally-whitened-shift-spectrum-audit.mjs`
- artifact reports and previews:
  - `logs/playground-artifacts/locally-whitened-shift-spectrum-audit-8000000.md`
  - `logs/playground-artifacts/locally-whitened-shift-spectrum-audit-8000000.json`
  - `logs/playground-artifacts/locally-whitened-shift-spectrum-audit-8000000.svg`
  - `logs/playground-artifacts/locally-whitened-shift-spectrum-audit-8000000.png`
  - `logs/playground-artifacts/locally-whitened-shift-incidence-proxy-200k.png`

No new LAB primitive was added in Cycle 51.

Next cycle suggestion:

Leave fixed shifts unless explicitly subtracting the full local tuple tensor.
Try an intrinsic factorization graph instead: vertices are integers or monic
polynomials, edges are defined by shared radical/divisor transformations,
and the statistic is spectral only after conditioning on omega, degree, and
local obstruction classes. Composite controls must preserve the same
factorization marginals.

## Cycle 52 — unit-order local-factor defect

### HALLUCINATE

Guess:

Stop looking at fixed shifts between primes. Attach to each prime its
intrinsic finite unit group order, `p-1`, and ask how the small-factor
divisibility profile of that order fluctuates. For each small prime factor
`ell`, use the feature

`Z_p(ell) = (1_{ell | p-1} - 1/(ell-1)) / sqrt((1/(ell-1))(1-1/(ell-1)))`

for odd `ell`; the `ell=2` column is degenerate and is omitted. For
function fields, attach `f-1` to each monic irreducible `f` and use small
irreducible factors `g`, with probability `1/(|g|-1)`, omitting degenerate
`|g|-1=1` columns.

Score two things:

- first-order defect:
  `sqrt(label_count) * rms(mean_ell Z(ell))`;
- second-order defect:
  `sqrt(label_count) * rms_{ell != m} mean Z(ell)Z(m)`.

Combine them by quadrature. A flat line would mean the unit-order
factorization profile has critical-scale cancellation. This is not a raw
prime-count line and does not use zeta or zeros in the construction.

Why it could be a line:

For actual primes, the event `ell | p-1` is not density-random; it is the
condition `p == 1 mod ell` inside the unit group modulo `ell`, with
probability `1/(ell-1)`. If primes are hyperuniform in these intrinsic
unit-order coordinates, the scaled defect might be flat and smaller than
Cramer labels, ordinary composites, and even local-coprime composite
controls. In `F_q[t]`, the same statement is the distribution of
irreducibles in the nonzero residue class `1 mod g`, so the two-universe
check is natural.

Preregistered confirmation:

integer combined defect is flat across growing `N`; real primes separate
from five Cramer controls, five local-coprime random controls, five sampled
local-coprime composites, and coordinate-permutation controls; `F_2[t]` and
`F_3[t]` show the same normalized scale and direction. No single factor
column or factor pair may dominate the endpoint.

Preregistered break:

local-coprime random labels or local-coprime composites reproduce the
effect; Cramer is the only control that fails; function-field scales
disagree; the line is dominated by one small factor; or the factor check
reduces it to Dirichlet / finite-field AP equidistribution of primes in the
class `1 mod g`. Then it breaks as unit-order AP/character energy, not a
new critical line.

### SEE

Audit command:

`node scripts/unit-order-factor-defect-audit.mjs 8000000 logs/playground-artifacts 22 13 4 2`

Audit plot:
`logs/playground-artifacts/unit-order-factor-defect-audit-8000000.png`.

The picture is a clean real-vs-random calibration. The integer real curve
is nearly flat around `0.53..0.59`, below local-random, local-composite, and
column-null bands. The function-field bars have the same direction:
`F_2[t]` is around `0.58..0.70`, and `F_3[t]` is around `0.31..0.53`, both
below local-reducible controls.

LAB proxy command:

`node scripts/explore.mjs eval '{"domain":"prime","N":200000,"ex":"pi(n)","ey":"omega(n-1)-log(log(max(n,3)))"}'`

Metrics:
`linearity=0.000050`, `flatness=0.762359`, `zeroCrossings=4409`,
`yMin=-1.406077`, `yMax=3.630741`.

Shot:
`logs/playground-artifacts/unit-order-omega-proxy-200k.png`.

The proxy is not the line; it is a direct view of the noisy `p-1`
factor-count residual. The actual candidate is the whitened small-factor
profile and its first/second-order defect.

### GROUND

Integer side through `N=8000000`, with factors
`3,5,7,11,13,17,19,23,29,31,37`:

Combined scaled-defect exponent: `theta=-0.038115`.
Raw combined exponent: `theta=-0.538115`, matching the intended
`1/sqrt(label_count)` cancellation before scaling.

| N | labels | real combined | real scaledMean | real scaledPair | Cramer combined range | local-random range | local-composite range | column-null range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 500000 | 41527 | 0.583877 | 0.293370 | 0.504823 | 8.204501..8.907458 | 1.182372..1.395103 | 1.091179..1.348058 | 0.976050..1.135579 |
| 1000000 | 78487 | 0.589075 | 0.284945 | 0.515574 | 11.251528..12.119517 | 1.061418..1.473372 | 0.904621..1.173941 | 1.019922..1.125664 |
| 2000000 | 148922 | 0.582566 | 0.336067 | 0.475860 | 15.684102..16.655969 | 1.201941..1.387683 | 1.027359..1.343266 | 0.882895..1.050044 |
| 4000000 | 283135 | 0.549695 | 0.225179 | 0.501456 | 21.941661..22.800770 | 0.943381..1.564804 | 0.872198..1.371752 | 0.874845..1.045812 |
| 8000000 | 539766 | 0.534967 | 0.263903 | 0.465344 | 30.627234..31.293226 | 1.114048..1.484896 | 1.001889..1.302567 | 0.926880..1.285557 |

Endpoint dominant integer first-order factors:

| factor | mean |
| --- | ---: |
| 17 | -0.000554 |
| 31 | -0.000539 |
| 3 | -0.000415 |
| 13 | -0.000399 |
| 23 | -0.000372 |
| 7 | -0.000333 |

Endpoint dominant integer second-order pairs:

| factor pair | moment |
| --- | ---: |
| 17 x 37 | 0.002073 |
| 11 x 37 | 0.001375 |
| 31 x 37 | -0.001073 |
| 23 x 29 | -0.001059 |
| 13 x 19 | -0.001057 |
| 5 x 31 | 0.000978 |

Function-field side:

`F_2[t]` through degree `22`, factors through degree `4`:
`t^2+t+1`, `t^3+t+1`, `t^3+t^2+1`, `t^4+t+1`,
`t^4+t^3+1`, `t^4+t^3+t^2+t+1`.

| degree | labels | real combined | real scaledMean | real scaledPair | monic range | local-monic range | local-reducible range | column-null range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 19 | 27594 | 0.647964 | 0.311375 | 0.568246 | 13.144501..13.606957 | 1.134289..1.933482 | 1.169064..1.580003 | 0.952847..1.154077 |
| 20 | 52377 | 0.702774 | 0.505447 | 0.488277 | 17.723305..18.511577 | 1.351316..1.657398 | 1.141502..1.470354 | 0.949456..1.313571 |
| 21 | 99858 | 0.614132 | 0.375202 | 0.486191 | 24.987098..25.774754 | 1.137325..1.700399 | 0.912472..1.406129 | 0.993827..1.148648 |
| 22 | 190557 | 0.582084 | 0.282280 | 0.509057 | 34.222962..34.633911 | 1.254017..1.620818 | 1.042313..1.272413 | 0.769268..1.145502 |

`F_3[t]` through degree `13`, factors through degree `2`:
`t`, `t+1`, `t+2`, `t^2+1`, `t^2+t+2`, `t^2+2*t+2`.

| degree | labels | real combined | real scaledMean | real scaledPair | monic range | local-monic range | local-reducible range | column-null range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 10 | 5880 | 0.528830 | 0.473188 | 0.236124 | 17.962607..19.866364 | 0.791879..1.315742 | 0.420961..0.699884 | 0.833393..1.177967 |
| 11 | 16104 | 0.447873 | 0.000000 | 0.447873 | 30.300915..31.444294 | 0.551316..1.206898 | 0.701989..0.863507 | 0.969708..1.220946 |
| 12 | 44220 | 0.467567 | 0.297477 | 0.360730 | 50.507903..51.646887 | 0.937259..1.261525 | 0.677435..0.923999 | 0.850358..1.347037 |
| 13 | 122640 | 0.306305 | 0.000000 | 0.306305 | 84.124046..85.084012 | 1.020230..1.445375 | 0.689612..0.932880 | 0.925187..1.183731 |

This passes the numeric control hierarchy. Raw Cramer/monic controls fail
badly; the serious local-coprime random/composite controls also sit above
real in all endpoint rows. The effect is not one-column dominated: endpoint
integer means are at most `0.000554`, and the largest pair moment is
`0.002073`.

### BREAK

GRAVEYARD verdict: real cross-universe calibration line, but known-math
unit-AP / character-energy line.

How it broke:

1. The line is real. Integer combined defect stays
   `0.534967..0.589075` across a 16x range, with scaled exponent
   `theta=-0.038115`.
2. The unscaled defect has `theta=-0.538115`, exactly the square-root
   cancellation scale the candidate wanted.
3. It beats strong controls. At `N=8000000`, real is `0.534967` versus
   local-random `1.114048..1.484896`, local-composites
   `1.001889..1.302567`, and column-null `0.926880..1.285557`.
4. It transfers to both function-field universes. Endpoint `F_2[t]` real is
   `0.582084` versus local-reducibles `1.042313..1.272413`; endpoint
   `F_3[t]` real is `0.306305` versus local-reducibles
   `0.689612..0.932880`.
5. But the factor check is exact: `ell | p-1` is the residue-class condition
   `p == 1 mod ell` inside `(Z/ellZ)^*`, and `g | f-1` is `f == 1 mod g`
   inside `(F_q[t]/g)^*`. Centered columns are finite linear combinations of
   nonprincipal characters modulo `ell` or `g`; pair products lift to
   characters modulo the product. The score is low-order character energy in
   unit-order clothing.

STATUS: `GRAVEYARD / KNOWN-MATH UNIT-AP CHARACTER ENERGY`.

CONNECTION: this is the intrinsic-factorization cousin of the finite-eligible
sieve-filtration martingale. It escaped fixed coordinate shifts and produced
a stronger cross-universe calibration line, but the exact source is still
prime equidistribution in finite residue groups. It is a good calibration
object for arithmetic hyperuniformity, not a new critical-line route.

### LEARN

The `p-1` / `f-1` group-order move was worth making: it beat local-coprime
composites and local-coprime random labels, not just Cramer. But every
small-factor coordinate of the unit order is also a residue-class query.
Intrinsic factorization language does not by itself escape the character
funnel.

Next graph/factorization attempts need to avoid querying whether the prime
lies in one residue class. Prefer statistics built from comparative
factorization geometry after quotienting residue-class expectations, for
example random multiplicative subgraphs inside the divisor lattice of
`p-1` where all single-factor and factor-pair AP marginals are explicitly
conditioned away.

## HANDOFF 51

Status: no survivor. Cycle 52 found a strong real cross-universe
calibration line in unit-order small-factor profiles, but the exact factor
check reduces it to AP/character equidistribution.

New code since the previous handoff:

- reproducible audit script
  `scripts/unit-order-factor-defect-audit.mjs`
- artifact reports and previews:
  - `logs/playground-artifacts/unit-order-factor-defect-audit-8000000.md`
  - `logs/playground-artifacts/unit-order-factor-defect-audit-8000000.json`
  - `logs/playground-artifacts/unit-order-factor-defect-audit-8000000.svg`
  - `logs/playground-artifacts/unit-order-factor-defect-audit-8000000.png`
  - `logs/playground-artifacts/unit-order-omega-proxy-200k.png`

No new LAB primitive was added in Cycle 52.

Next cycle suggestion:

Use the unit-order line as a calibration baseline, not a target. If staying
with `p-1`, condition away all one-factor and two-factor residue marginals
and score only higher-order divisor-lattice geometry. A stricter alternative
is to leave `p-1` entirely and use an intrinsic object whose coordinates are
not congruence tests, such as normalized shapes of divisor intervals inside
factorization fibers with controls preserving omega, degree, and local AP
marginals.

## Cycle 53 — centered unit-order triple cumulant

### HALLUCINATE

Guess:

Repair Cycle 52 by refusing to score one-factor means or two-factor pair
defects. For each prime `p` and small unit-order factor `ell`, keep the
centered/whitened coordinate

`Z_p(ell) = (1_{ell | p-1} - 1/(ell-1)) / sqrt((1/(ell-1))(1-1/(ell-1)))`.

Then score only the third-order centered tensor

`T_3(x) = sqrt(pi(x)) * rms_{ell_i<ell_j<ell_k} mean_{p<=x} Z_p(ell_i)Z_p(ell_j)Z_p(ell_k)`.

The function-field analogue uses `Z_f(g)` for `g | f-1`, with probability
`1/(|g|-1)`, and scores triples of small irreducible factors. This is the
first unit-order statistic in this branch that explicitly ignores the
first-order line and the pair line. If it survives, the signal would live in
higher-order divisor-lattice geometry rather than low-order AP marginals.

Why it could be a line:

The previous line showed primes and irreducibles are more hyperuniform than
local-random/composite controls in unit-order coordinates. A third-order
centered tensor asks whether that suppression persists after first and
second moments are no longer visible to the score. If the answer is yes and
the scale matches in both universes, it would be a sharper invariant of the
factorization geometry of `p-1` / `f-1`.

Preregistered confirmation:

integer `T_3` is flat across growing `N`; real primes separate from five
Cramer controls, five local-coprime random controls, five local-coprime
composite controls, and column-permutation controls; `F_2[t]` and `F_3[t]`
land on the same normalized scale and direction. The endpoint must not be
dominated by a single factor triple.

Preregistered break:

local controls reproduce the tensor; the signal is unstable or endpoint-only;
function-field scales disagree; a single triple dominates; or the factor
check shows that each triple coordinate is still a nonprincipal character
modulo `ell_i ell_j ell_k` / `g_i g_j g_k`. Then it breaks as higher-order
unit-AP character energy, not a new critical line.

### SEE

Audit command:

`node scripts/unit-order-triple-cumulant-audit.mjs 4000000 logs/playground-artifacts 20 12 4 2`

Audit plot:
`logs/playground-artifacts/unit-order-triple-cumulant-audit-4000000.png`.

The integer picture is a clean subrandom line: real sits below local-random,
local-composite, and column-null bands. The function-field bars are mixed:
`F_2[t]` mostly points the same way, but `F_3[t]` overlaps local-reducible
controls at the endpoint.

LAB proxy command:

`node scripts/explore.mjs eval '{"domain":"prime","N":200000,"ex":"pi(n)","ey":"(((1-min(1,mod(n-1,3)))-0.5)/sqrt(0.25))*(((1-min(1,mod(n-1,5)))-0.25)/sqrt(0.1875))*(((1-min(1,mod(n-1,7)))-0.1666666667)/sqrt(0.1388888889))"}'`

Metrics:
`linearity=0.000003`, `flatness=1.547648`, `zeroCrossings=9053`,
`yMin=-3.872983`, `yMax=3.872983`.

Shot:
`logs/playground-artifacts/unit-order-triple-proxy-200k.png`.

The proxy is a direct high-churn coordinate, not the averaged line. It shows
why the tensor needs cumulative/rms aggregation to become visible.

### GROUND

Integer side through `N=4000000`, factors
`3,5,7,11,13,17,19,23`:

Scaled triple exponent: `theta=-0.048435`.
Raw triple exponent: `theta=-0.548435`.

| N | labels | real scaledTriple | real tripleRms | Cramer range | local-random range | local-composite range | column-null range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 250000 | 22036 | 0.560920 | 0.003779 | 0.691610..0.859759 | 0.695761..0.888582 | 0.782217..0.904353 | 0.813544..1.094270 |
| 500000 | 41530 | 0.624943 | 0.003067 | 0.659643..0.872496 | 0.664485..0.877294 | 0.839396..0.943515 | 0.936699..1.163424 |
| 1000000 | 78490 | 0.573466 | 0.002047 | 0.663990..0.927653 | 0.709182..1.007251 | 0.680590..0.914768 | 0.936499..1.067001 |
| 2000000 | 148925 | 0.600689 | 0.001557 | 0.672172..0.933678 | 0.664474..1.092964 | 0.837558..1.000224 | 0.927474..1.117364 |
| 4000000 | 283138 | 0.490456 | 0.000922 | 0.767807..0.906607 | 0.779141..0.989429 | 0.826242..0.947840 | 0.930578..1.058368 |

Endpoint dominant integer triples:

| triple | moment |
| --- | ---: |
| 11 x 13 x 23 | 0.002126 |
| 7 x 11 x 23 | -0.001924 |
| 3 x 11 x 13 | 0.001883 |
| 7 x 13 x 23 | 0.001812 |
| 11 x 13 x 17 | -0.001629 |
| 11 x 19 x 23 | -0.001587 |
| 11 x 17 x 23 | -0.001535 |
| 5 x 13 x 17 | -0.001482 |

Function-field side:

`F_2[t]` through degree `20`, factors through degree `4`.

| degree | labels | real scaledTriple | real tripleRms | monic range | local-monic range | local-reducible range | column-null range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 17 | 7710 | 0.575616 | 0.006555 | 0.773323..1.017579 | 0.598583..1.023189 | 0.698034..1.009159 | 0.893386..1.105736 |
| 18 | 14532 | 0.943906 | 0.007830 | 0.734825..0.888909 | 0.780751..1.229406 | 0.854088..1.257155 | 0.833533..1.181286 |
| 19 | 27594 | 0.655685 | 0.003947 | 0.847708..1.157944 | 0.793376..1.213399 | 0.710234..1.132697 | 0.931350..1.134689 |
| 20 | 52377 | 0.671374 | 0.002934 | 0.544362..1.089155 | 0.880469..1.096635 | 0.696811..0.970097 | 0.734023..1.081092 |

`F_3[t]` through degree `12`, factors through degree `2`.

| degree | labels | real scaledTriple | real tripleRms | monic range | local-monic range | local-reducible range | column-null range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 9 | 2184 | 0.694305 | 0.014857 | 0.678192..1.129647 | 0.511804..0.766375 | 1.032505..1.525772 | 0.750104..0.906194 |
| 10 | 5880 | 0.259396 | 0.003383 | 0.962544..1.334074 | 0.539265..0.847465 | 0.332474..0.427051 | 0.792760..0.969558 |
| 11 | 16104 | 0.380744 | 0.003000 | 1.268505..1.510821 | 0.511760..0.773780 | 0.483172..0.673047 | 0.726262..1.049035 |
| 12 | 44220 | 0.584317 | 0.002779 | 1.757637..2.154331 | 0.679250..1.030077 | 0.562034..0.704536 | 0.716347..1.063638 |

Numerically: the integer side passes the local-control gate, with endpoint
real `0.490456` below all control ranges. `F_2[t]` is supportive but not
perfect at degree `18`. `F_3[t]` fails the clean separation gate because
endpoint real `0.584317` overlaps local-reducibles
`0.562034..0.704536`.

### BREAK

GRAVEYARD verdict: higher-order unit-AP character energy, with mixed
function-field control behavior.

How it broke:

1. Integer behavior is real and tempting: raw tripleRms has
   `theta=-0.548435`, and scaledTriple stays near `0.49..0.62`.
2. Integer controls are beaten at the endpoint: real `0.490456` versus
   Cramer `0.767807..0.906607`, local-random `0.779141..0.989429`,
   local-composites `0.826242..0.947840`, and column-null
   `0.930578..1.058368`.
3. Function fields do not give a clean survivor. Endpoint `F_2[t]` real
   `0.671374` is slightly below local-reducibles `0.696811..0.970097`, but
   `F_3[t]` endpoint real `0.584317` lies inside local-reducibles
   `0.562034..0.704536`.
4. The factor check is exact anyway. A centered triple
   `Z(ell_i)Z(ell_j)Z(ell_k)` expands into nonprincipal Dirichlet
   characters modulo `ell_i ell_j ell_k`; the function-field version is
   the same character expansion modulo `g_i g_j g_k`.
5. Conditioning away first-order and pair scores did not escape the
   character funnel; it only moved from low-order to third-order
   character energy.

STATUS: `GRAVEYARD / HIGHER-ORDER UNIT-AP CHARACTER ENERGY`.

CONNECTION: this is the direct repair attempt for Cycle 52. It confirms the
lesson more sharply: every finite-order tensor of the coordinates
`ell | p-1` or `g | f-1` is still a finite character statistic. Unit-order
factorization needs a quotient by all finite AP marginals, not just by
lower moments.

### LEARN

The unit-order branch is now good calibration but bad discovery terrain.
It gives strong arithmetic hyperuniformity lines, yet any coordinate made
from `factor | p-1` is visibly a residue-class test. Higher tensors do not
leave the cage.

Next cycle should stop using divisibility of `p-1` by named small factors.
If using divisor geometry, use unlabeled shape features such as normalized
log-divisor spacing or factor-degree interval profiles, and use controls
that preserve omega / degree / AP marginals. Otherwise pivot to a different
intrinsic object entirely.

## HANDOFF 52

Status: no survivor. Cycle 53 repaired the unit-order line by scoring only
third-order centered cumulants, but the result still reduces exactly to
character energy and fails clean two-universe separation in `F_3[t]`.

New code since the previous handoff:

- reproducible audit script
  `scripts/unit-order-triple-cumulant-audit.mjs`
- artifact reports and previews:
  - `logs/playground-artifacts/unit-order-triple-cumulant-audit-4000000.md`
  - `logs/playground-artifacts/unit-order-triple-cumulant-audit-4000000.json`
  - `logs/playground-artifacts/unit-order-triple-cumulant-audit-4000000.svg`
  - `logs/playground-artifacts/unit-order-triple-cumulant-audit-4000000.png`
  - `logs/playground-artifacts/unit-order-triple-proxy-200k.png`

No new LAB primitive was added in Cycle 53.

Next cycle suggestion:

Leave named small-factor divisibility tests. Try an unlabeled factorization
shape statistic: for `p-1` / `f-1`, compute normalized log-divisor or
degree-divisor spacing profiles, then compare against controls preserving
omega, degree, smoothness bucket, and local AP marginals. The expected
break is shifted-integer factorization law rather than character energy.

## Cycle 54 — unlabeled unit-divisor shape deviation

### HALLUCINATE

Guess:

Stop asking whether named factors divide `p-1`. For each prime `p`, factor
`m=p-1`, choose a random divisor `D|m`, and measure the normalized variance
of `log D / log m`. If

`m = product r_i^{a_i}`,

then

`shape(m) = sqrt(12 * sum_i a_i(a_i+2)(log r_i)^2 / (12 (log m)^2))`.

This is an unlabeled divisor-cloud width: `1` would match a uniform
divisor-log spread on `[0,1]`; smaller values mean divisors cluster near
the middle. The polynomial analogue replaces `log r_i` by factor degree in
`f-1`.

To remove obvious shifted-factorization effects, build a background over
odd labels `n` using `n-1`, bucketed by `omega(n-1)` and a coarse largest
factor bucket. Score

`A(x) = sum_{p<=x} z(shape(p-1), bucket(p-1)) / sqrt(pi(x))`,

where `z` uses the bucket mean and variance from the full odd background
up to `x`. The function-field version uses monic background at fixed degree
and buckets by `omega(f-1)` and largest factor degree.

Why it could be a line:

This uses factorization geometry without naming any residue class. The
previous unit-order attempts died because `factor | p-1` is `p == 1 mod
factor`. Here only the unlabeled divisor-cloud shape remains after coarse
omega/largest-factor conditioning. A flat small `A(x)` separating primes
from composites would suggest that primes have unusually regular shifted
divisor geometry not visible as finite AP character energy.

Preregistered confirmation:

integer `abs(A)` is flat and small across growing `N`; real primes separate
from five Cramer controls, five odd-random controls, five odd-composite
controls, and five bucket-matched composite controls; `F_2[t]` and `F_3[t]`
show the same normalized scale and direction. Endpoint behavior must not be
caused by one omega/largest-factor bucket.

Preregistered break:

bucket-matched composites reproduce the line; controls overlap real;
function-field scales disagree; the score is dominated by a single bucket;
or the factor check reduces the statistic to known distribution laws for
factorization of shifted primes/irreducibles (`p-1`, `f-1`) rather than a
new critical line.

### SEE

Audit command:

`node scripts/unit-divisor-shape-deviation-audit.mjs 2000000 logs/playground-artifacts 18 10`

Audit plot:
`logs/playground-artifacts/unit-divisor-shape-deviation-audit-2000000.png`.

The visual is not a flat line. The integer curve climbs from about `7` to
`19` over this range, while odd-composite and bucket-matched composite
controls remain near `1..4`. The function-field bars show the same
direction even more loudly for `F_2[t]`, and steadily for `F_3[t]`.

LAB proxy command:

`node scripts/explore.mjs eval '{"domain":"prime","N":200000,"ex":"pi(n)","ey":"log(max(tau(n-1),1))/log(log(max(n,5)))"}'`

Metrics:
`linearity=0.003268`, `flatness=0.261544`, `zeroCrossings=0`,
`yMin=0`, `yMax=2.308567`.

Shot:
`logs/playground-artifacts/unit-divisor-shape-proxy-200k.png`.

The proxy is only a visible shifted-divisor-abundance cousin. The audit
uses the normalized log-divisor cloud width and bucket-standardized
aggregate z-score.

### GROUND

Integer side through `N=2000000`:

Abs aggregate exponent: `theta=0.465005`.
RMS-z exponent: `theta=0.003013`.

| N | labels | real aggregateZ | real absAggregateZ | real rmsZ | real meanShape | Cramer abs range | odd-composite abs range | bucket-composite abs range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 200000 | 17983 | 7.232662 | 7.232662 | 1.066899 | 1.146786 | 9.229465..9.788780 | 0.796858..1.761440 | 0.125364..2.783936 |
| 250000 | 22043 | 7.896873 | 7.896873 | 1.069954 | 1.146821 | 9.743561..10.788407 | 1.067048..2.890861 | 0.190317..2.569644 |
| 500000 | 41537 | 10.704937 | 10.704937 | 1.072178 | 1.148797 | 13.154124..14.606754 | 1.659049..2.881828 | 1.093878..3.871217 |
| 1000000 | 78497 | 14.218928 | 14.218928 | 1.074488 | 1.150274 | 18.194736..19.299949 | 1.994100..3.837229 | 1.992235..4.080342 |
| 2000000 | 148932 | 19.336872 | 19.336872 | 1.074065 | 1.152077 | 25.254219..26.308846 | 2.790164..3.311225 | 2.101716..4.406075 |

Endpoint dominant integer buckets:

| bucket `omega:lpfBucket` | count | aggregateZ | meanZ |
| --- | ---: | ---: | ---: |
| 3:14 | 6434 | 10.011079 | 0.124807 |
| 3:13 | 6134 | 8.557215 | 0.109260 |
| 3:15 | 6222 | 8.031253 | 0.101817 |
| 3:12 | 5769 | 7.830466 | 0.103095 |
| 3:16 | 5439 | 7.474187 | 0.101345 |
| 4:10 | 7374 | 6.154035 | 0.071665 |
| 3:17 | 3437 | 5.979109 | 0.101987 |
| 3:11 | 5331 | 5.889904 | 0.080668 |

Function-field side:

`F_2[t]` through degree `18`.

| degree | labels | real aggregateZ | real absAggregateZ | real rmsZ | monic abs range | reducible abs range | bucket-reducible abs range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 15 | 2182 | -18.991917 | 18.991917 | 1.115910 | 0.002244..1.047776 | 0.267326..2.239316 | 1.216513..2.423977 |
| 16 | 4080 | -26.105265 | 26.105265 | 1.130703 | 0.361424..2.155483 | 1.427199..2.517188 | 1.978651..3.380685 |
| 17 | 7710 | -33.155576 | 33.155576 | 1.137753 | 0.062119..1.084017 | 0.223065..3.058651 | 2.243008..4.622240 |
| 18 | 14532 | -42.835211 | 42.835211 | 1.154804 | 0.094509..1.435941 | 1.435926..2.848445 | 2.384977..5.053695 |

`F_3[t]` through degree `10`.

| degree | labels | real aggregateZ | real absAggregateZ | real rmsZ | monic abs range | reducible abs range | bucket-reducible abs range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 7 | 312 | -2.775239 | 2.775239 | 0.819098 | 0.162517..0.952103 | 0.280882..1.103209 | 0.036238..1.100666 |
| 8 | 810 | -4.747714 | 4.747714 | 0.916427 | 0.056327..1.133386 | 0.014604..1.272608 | 0.448307..2.338733 |
| 9 | 2184 | -7.747010 | 7.747010 | 0.943151 | 0.011659..0.693880 | 0.167252..1.838288 | 0.206015..2.128991 |
| 10 | 5880 | -12.008416 | 12.008416 | 0.952593 | 0.019086..2.280800 | 0.235277..2.425790 | 0.549066..1.990738 |

### BREAK

GRAVEYARD verdict: shifted-factorization main-term misfit, not a critical
line.

How it broke:

1. The score is not flat. Integer `absAggregateZ` grows
   `7.232662 -> 19.336872`, with exponent `theta=0.465005`, close to a
   persistent nonzero per-label bias accumulating like `sqrt(label_count)`.
2. Cramer fails even harder, but that is not enough. Odd-composite and
   bucket-matched composite controls stay much smaller, so the statistic is
   seeing a real shifted-prime factorization bias.
3. Both function-field universes show the same non-flat behavior:
   `F_2[t]` grows `18.991917 -> 42.835211`; `F_3[t]` grows
   `2.775239 -> 12.008416`.
4. The endpoint is not one bucket only, but the largest integer
   contributions are concentrated in broad `omega=3` buckets with adjacent
   largest-factor sizes. That says the bucket correction is too coarse to
   be a main term.
5. Unlike the previous unit-order attempts, this did escape the immediate
   finite-character coordinate check. But it collapsed into another known
   funnel: distribution of factorization shapes of shifted primes and
   shifted irreducibles. The missing main term is not RH-grade residual; it
   is a shifted-factorization law.

STATUS: `GRAVEYARD / SHIFTED-FACTORIZATION MAIN-TERM MISFIT`.

CONNECTION: this is the first unit-order branch attempt that does not
literally score named congruence coordinates. It confirms the next funnel:
after escaping finite characters, `p-1` statistics demand a much sharper
Erdos-Kac / Sathe-Selberg / shifted-prime factorization main term before
any critical-scale residual can be audited.

### LEARN

Unlabeled factorization shape is a better creative direction than named
small-factor divisibility, but the crude omega/largest-factor buckets are
not enough. The real signal is a large deterministic bias in the divisor
cloud of shifted primes/irreducibles.

Next attempt should either:

- build a sharper shifted-factorization null first, matching more of the
  factor-degree partition, not just omega and largest factor; or
- leave `p-1` entirely and use an object where the natural main term is
  already known well enough to subtract.

## HANDOFF 53

Status: no survivor. Cycle 54 tried an unlabeled divisor-cloud shape for
`p-1` / `f-1`. It avoided direct character-coordinate collapse, but failed
as a non-flat shifted-factorization main-term error.

New code since the previous handoff:

- reproducible audit script
  `scripts/unit-divisor-shape-deviation-audit.mjs`
- artifact reports and previews:
  - `logs/playground-artifacts/unit-divisor-shape-deviation-audit-2000000.md`
  - `logs/playground-artifacts/unit-divisor-shape-deviation-audit-2000000.json`
  - `logs/playground-artifacts/unit-divisor-shape-deviation-audit-2000000.svg`
  - `logs/playground-artifacts/unit-divisor-shape-deviation-audit-2000000.png`
  - `logs/playground-artifacts/unit-divisor-shape-proxy-200k.png`

No new LAB primitive was added in Cycle 54.

Next cycle suggestion:

Do not score raw `p-1` factorization shape again without a better null. If
continuing this branch, build a control that preserves the full coarse
factor-degree partition or samples from a shifted-prime factorization model.
Otherwise pivot away from `p-1`; this branch now has two funnels:
finite-character energy for named coordinates, and shifted-factorization
main-term error for unlabeled shapes.

## Cycle 55 — unlabeled prime-pair difference roughness

### HALLUCINATE

Guess:

Leave `p-1` entirely. Sample unordered pairs of prime labels `p,q <= x` and
look only at the unlabeled factorization roughness of their difference
`|p-q|`. Remove the forced parity by using `|p-q|/2` on the integer side.
For each difference-size bucket, build a background from random odd-label
pairs, then score

`D(x)=sum z(omega(|p-q|/2), bucket(|p-q|)) / sqrt(pair_sample_count)`.

The function-field analogue samples unordered pairs of monic irreducibles
of the same degree and scores `omega(f-g)` against random monic-pair
backgrounds bucketed by `deg(f-g)`. This is coordinate-free in the sense
that the difference is an additive invariant and no named shift is chosen
in advance.

Why it could be a line:

Fixed shifts collapsed to local tuple tensors because the shift was named.
Here the shift is endogenous: it is the pair difference sampled from the
prime set itself, then reduced to an unlabeled roughness statistic. If prime
pairs suppress or regularize rough differences beyond random odd/monic
pairs, the aggregate z-score might be flat and prime-specific in both
universes.

Preregistered confirmation:

integer `abs(D)` is flat across growing `N`; real prime-pair differences
separate from five Cramer controls, five odd-random controls, and five
odd-composite controls; `F_2[t]` and `F_3[t]` show the same normalized
scale and direction against monic and reducible controls. Endpoint behavior
must not be dominated by one difference-size bucket.

Preregistered break:

controls overlap real; the score grows as a main-term bias; function-field
scales disagree; a single bucket dominates; or the factor check identifies
the statistic as Hardy-Littlewood / singular-series bias of pair
differences in unlabeled clothing.

### SEE

Audit command:

`node scripts/pair-difference-roughness-audit.mjs 2000000 logs/playground-artifacts 17 10 120000 180000`

Audit plot:
`logs/playground-artifacts/pair-difference-roughness-audit-2000000.png`.

The visual is not a critical line. Integer real rises above both Cramer and
odd-composite controls, then plateaus only because the pair-sample count is
capped. Function-field bars are enormous in both universes, far outside
monic/reducible controls.

LAB proxy command:

`node scripts/explore.mjs eval '{"domain":"prime","N":200000,"ex":"pi(n)","ey":"omega(max(gap(n)/2,1))"}'`

Metrics:
`linearity=0.003445`, `flatness=0.519777`, `zeroCrossings=0`,
`yMin=0`, `yMax=3`.

Shot:
`logs/playground-artifacts/pair-difference-roughness-proxy-200k.png`.

The proxy is consecutive-gap roughness, not the audited random-pair
difference statistic. It exposes the same local-factor bias in a direct
visible form.

### GROUND

Integer side through `N=2000000`:

Abs aggregate exponent: `theta=0.490107`.
RMS-z exponent: `theta=0.000279`.

| N | labels | pair samples | real aggregateZ | real absAggregateZ | real rmsZ | real mean omega | Cramer abs range | odd-random abs range | odd-composite abs range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 200000 | 17983 | 26976 | 39.596730 | 39.596730 | 1.045597 | 2.831851 | 24.584830..27.776807 | 0.330833..2.225774 | 0.621423..3.470343 |
| 250000 | 22043 | 33066 | 43.028511 | 43.028511 | 1.043864 | 2.852568 | 26.578666..29.843990 | 0.004246..0.950959 | 1.743812..3.968496 |
| 500000 | 41537 | 62307 | 59.602192 | 59.602192 | 1.050096 | 2.925450 | 36.648465..38.538410 | 0.682527..2.973577 | 1.180653..3.397554 |
| 1000000 | 78497 | 117747 | 82.488935 | 82.488935 | 1.046639 | 2.987057 | 50.604173..53.585396 | 0.080471..0.971352 | 1.150040..4.306159 |
| 2000000 | 148932 | 120000 | 80.201503 | 80.201503 | 1.043668 | 3.040942 | 49.561069..52.781046 | 0.147847..1.237684 | 0.807413..3.077372 |

Endpoint dominant integer difference-size buckets:

| bucket | count | aggregateZ | meanZ |
| --- | ---: | ---: | ---: |
| 19 | 37675 | 43.960626 | 0.226484 |
| 20 | 27961 | 37.826001 | 0.226211 |
| 18 | 25310 | 37.335811 | 0.234682 |
| 17 | 13950 | 28.542438 | 0.241660 |
| 16 | 7386 | 19.378083 | 0.225479 |
| 15 | 3903 | 15.183319 | 0.243034 |
| 14 | 1942 | 11.202276 | 0.254204 |
| 13 | 927 | 6.558330 | 0.215404 |

Function-field side:

`F_2[t]` through degree `17`.

| degree | labels | samples | real aggregateZ | real absAggregateZ | real rmsZ | monic abs range | reducible abs range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 14 | 1161 | 10000 | 105.540675 | 105.540675 | 1.266429 | 0.004605..1.864664 | 0.050457..1.882519 |
| 15 | 2182 | 10000 | 103.789330 | 103.789330 | 1.256273 | 0.213266..1.417069 | 0.558794..1.446767 |
| 16 | 4080 | 10000 | 103.066231 | 103.066231 | 1.261496 | 0.050118..1.544205 | 0.593041..2.206166 |
| 17 | 7710 | 15420 | 127.011892 | 127.011892 | 1.256972 | 0.083631..0.877691 | 0.118802..1.546703 |

`F_3[t]` through degree `10`.

| degree | labels | samples | real aggregateZ | real absAggregateZ | real rmsZ | monic abs range | reducible abs range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 7 | 312 | 10000 | 49.855577 | 49.855577 | 1.134133 | 0.278652..1.802860 | 0.334648..1.787831 |
| 8 | 810 | 10000 | 51.805554 | 51.805554 | 1.147941 | 0.946676..3.072596 | 0.068908..2.298130 |
| 9 | 2184 | 10000 | 51.238928 | 51.238928 | 1.132886 | 0.130129..1.559047 | 0.149789..1.020908 |
| 10 | 5880 | 11760 | 54.246846 | 54.246846 | 1.136547 | 0.200179..0.949801 | 0.358907..1.821853 |

### BREAK

GRAVEYARD verdict: unlabeled pair-difference singular-series bias, not a
critical line.

How it broke:

1. The effect is huge. Integer endpoint real `absAggregateZ=80.201503`,
   far above odd-random `0.147847..1.237684` and odd-composite
   `0.807413..3.077372`.
2. Cramer also fails in the same direction, though less strongly:
   endpoint Cramer is `49.561069..52.781046`. The real-vs-Cramer gap is
   arithmetic, but it is a main term, not a residual.
3. Function fields confirm the mechanism at much larger effect size.
   Endpoint `F_2[t]` real is `127.011892` versus reducibles
   `0.118802..1.546703`; endpoint `F_3[t]` real is `54.246846` versus
   reducibles `0.358907..1.821853`.
4. The endpoint is spread across many large difference-size buckets, not
   one outlier. Integer bucket mean z-scores around `0.22..0.25` accumulate
   over tens of thousands of sampled pairs.
5. Factor check: pair differences with many prime/irreducible factors have
   larger Hardy-Littlewood singular series. The statistic is an unlabeled
   average of exactly that local pair-difference bias. Removing named
   shifts did not remove the singular series; it averaged it.

STATUS: `GRAVEYARD / UNLABELED PAIR-DIFFERENCE SINGULAR-SERIES BIAS`.

CONNECTION: this is the pair-difference analogue of the fixed-shift local
tuple tensor. Cycle 51 named the shifts and saw the tuple tensor directly;
Cycle 55 sampled shifts endogenously and saw the same singular-series bias
through the roughness of the sampled differences.

### LEARN

Endogenous/random shifts are not enough. If the statistic uses pair
differences, the singular series is still the main term. A future pair
statistic must divide out or condition on the full local singular-series
weight before looking for residual scaling.

Next attempt should either build that singular-series-whitened pair null, or
avoid pair differences completely.

## HANDOFF 54

Status: no survivor. Cycle 55 left `p-1` and tested unlabeled roughness of
prime/irreducible pair differences. It found a very strong cross-universe
effect, but it is the Hardy-Littlewood / function-field singular-series
main term averaged over random differences.

New code since the previous handoff:

- reproducible audit script
  `scripts/pair-difference-roughness-audit.mjs`
- artifact reports and previews:
  - `logs/playground-artifacts/pair-difference-roughness-audit-2000000.md`
  - `logs/playground-artifacts/pair-difference-roughness-audit-2000000.json`
  - `logs/playground-artifacts/pair-difference-roughness-audit-2000000.svg`
  - `logs/playground-artifacts/pair-difference-roughness-audit-2000000.png`
  - `logs/playground-artifacts/pair-difference-roughness-proxy-200k.png`

No new LAB primitive was added in Cycle 55.

Next cycle suggestion:

Do not use raw pair differences without local singular-series whitening.
Either explicitly divide by the pair singular-series weight before scoring
roughness, or pivot to a statistic that is not a one-, two-, or fixed finite
tuple question.

## Cycle 56 — log-mass prime-count bridge stiffness

### HALLUCINATE

Guess:

Leave pair differences, `p-1`, residue coordinates, and named shifts. Treat
the prime counting residual itself as a path in intrinsic expected-prime-mass
time. For each cutoff `N`, build the discrete logarithmic-density main term

`E(x)=sum_{3<=n<=x} 1/log n`

and choose `K` checkpoints with equal increments of `E`. At checkpoint `j`,
record the cumulative count residual

`S_j = pi(x_j) - E(x_j)`.

Remove the endpoint by turning it into a bridge

`B_j = S_j - (E(x_j)/E(N)) S_K`,

then score the stiffness

`Q(N)=rms_j(B_j)/sqrt(E(N))`

plus the max bridge displacement. This asks whether primes are smoother than
a density-only Brownian bridge after the global endpoint error has been
factored out.

Function-field analogue:

Use only degree shells, not coefficient/lex order. For `F_q[t]`, let
`I_q(d)` be the exact number of monic irreducibles of degree `d`, use
`q^d/d` as the first main term, build the cumulative shell residual through
degree `D`, bridge it in expected shell-mass time, and normalize by the
square root of the total expected shell mass.

Why it could be a line:

The real nugget says square-root cancellation in global prime mass is
arithmetic, not density. A bridge removes the endpoint and asks for internal
path rigidity rather than one terminal residual. If the prime residual is a
stiff arithmetic path, `Q(N)` might settle to a flat sub-Brownian constant,
matched by the function-field theorem side and failed by density-only,
fixed-total, Cramer, and thinned-composite controls.

Preregistered confirmation:

integer `Q(N)` is stable across growing `N`, visibly below at least five
Li-mass Poisson bridges, five fixed-total multinomial bridges, five Cramer
label controls, and five thinned odd-composite controls. The same normalized
sub-Brownian direction appears for `F_2[t]` and `F_3[t]` degree-shell
bridges against shell Poisson/binomial controls. The visual bridge should
look like a stiff low-amplitude path, not a single endpoint artifact.

Preregistered break:

real overlaps density-only or composite controls; `Q(N)` drifts with range;
one checkpoint dominates; function-field scaling disagrees; or the factor
check says this is just the classical `pi(x)-Li(x)` / `psi(x)-x` residual
funnel with a zero-free bridge transform rather than a new critical line.

### SEE

Audit command:

`node scripts/logmass-bridge-stiffness-audit.mjs 8000000 logs/playground-artifacts 24 14 64`

Audit plot:
`logs/playground-artifacts/logmass-bridge-stiffness-audit-8000000.svg.png`.

The visual is a real line: the integer cyan trace sits low and nearly flat
under all density-control bands, and the bottom endpoint bridge path is a
small-amplitude stiff path rather than a Brownian-looking excursion. The
function-field bars are also below their shell-random ranges.

LAB proxy command:

`node scripts/explore.mjs eval '{"domain":"int","N":200000,"ex":"n","ey":"(pi(n)-n/log(n))/sqrt(max(n/log(n),1))"}'`

Metrics:
`linearity=0.930362`, `flatness=0.273393`, `zeroCrossings=3`,
`yMin=-1.109939`, `yMax=12.513224`.

Shot:
`logs/playground-artifacts/logmass-bridge-proxy-200k.png`.

The proxy is not the bridge statistic; it is the raw normalized counting
residual. It renders as a compressed almost-horizontal trace at app scale,
which is visually consistent with the audit's stiff bridge but not by itself
an audit.

### GROUND

Integer side through `N=8000000`:

RMS exponent: `theta=-0.110741`.
Max bridge exponent: `theta=-0.118818`.
Second-difference roughness exponent: `theta=-0.028702`.

| N | labels | expected | real rms | real max | endpoint | roughness | Poisson rms range | fixed-total rms range | Cramer rms range | composite rms range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 500000 | 41538 | 41604.640956 | 0.106466 | 0.217266 | -0.326716 | 0.083094 | 0.234661..0.606438 | 0.274312..0.373267 | 0.278928..0.644304 | 0.169184..0.471684 |
| 1000000 | 78498 | 78625.899417 | 0.077587 | 0.160930 | -0.456127 | 0.070909 | 0.328138..0.552532 | 0.279975..0.708197 | 0.213072..0.592402 | 0.128581..0.367932 |
| 2000000 | 148933 | 149053.181703 | 0.092954 | 0.165333 | -0.311292 | 0.068914 | 0.209695..0.530958 | 0.189512..0.553794 | 0.169034..0.430136 | 0.184494..0.586824 |
| 4000000 | 283146 | 283350.601567 | 0.066441 | 0.138474 | -0.384368 | 0.090099 | 0.245077..0.554317 | 0.196303..0.487350 | 0.163795..0.324411 | 0.305536..0.514197 |
| 8000000 | 539777 | 539998.035574 | 0.080637 | 0.159937 | -0.300792 | 0.067235 | 0.278550..0.624350 | 0.229133..0.316819 | 0.168629..0.678911 | 0.157145..0.992524 |

Endpoint largest normalized bridge displacement:
checkpoint `30`, value `-0.159937`.

Function-field side:

`F_2[t]` through degree `24`.

| degree | labels | expected | real rms | real max | endpoint | roughness | Poisson rms range | binomial rms range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 20 | 111013 | 111142.374448 | 0.051547 | 0.123717 | -0.388069 | 0.044779 | 0.066235..0.319387 | 0.061116..0.207967 |
| 21 | 210871 | 211006.755400 | 0.055146 | 0.125978 | -0.295535 | 0.050130 | 0.154091..0.286373 | 0.106991..0.310230 |
| 22 | 401428 | 401656.937218 | 0.041922 | 0.104180 | -0.361234 | 0.036779 | 0.127520..0.458891 | 0.073540..0.169366 |
| 23 | 766150 | 766379.024175 | 0.048077 | 0.124403 | -0.261613 | 0.045233 | 0.092246..0.173150 | 0.132939..0.188948 |
| 24 | 1465020 | 1465429.690841 | 0.035370 | 0.096358 | -0.338434 | 0.035087 | 0.141744..0.299770 | 0.090987..0.313468 |

`F_3[t]` through degree `14`.

| degree | labels | expected | real rms | real max | endpoint | roughness | Poisson rms range | binomial rms range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 10 | 9382 | 9431.303571 | 0.070185 | 0.148295 | -0.507683 | 0.065277 | 0.089173..0.271339 | 0.076043..0.162213 |
| 11 | 25486 | 25535.576299 | 0.082117 | 0.193951 | -0.310242 | 0.102572 | 0.131418..0.301201 | 0.118705..0.357159 |
| 12 | 69706 | 69822.326299 | 0.050831 | 0.127122 | -0.440231 | 0.060827 | 0.100395..0.333339 | 0.192635..0.266425 |
| 13 | 192346 | 192462.557068 | 0.062457 | 0.168772 | -0.265684 | 0.089536 | 0.125687..0.388549 | 0.051184..0.192593 |
| 14 | 533830 | 534103.199925 | 0.039001 | 0.110302 | -0.373825 | 0.052313 | 0.079865..0.234177 | 0.048318..0.250225 |

### BREAK

GRAVEYARD verdict: prime-counting bridge transform, not a new critical
line.

How it broke:

1. The calibration is real. Integer bridge rms stays in a narrow
   `0.066441..0.106466` band and is below every Poisson, fixed-total,
   Cramer, and thinned-composite range except for partial overlap with one
   composite/control family at a few endpoints.
2. The function-field theorem side agrees in direction. Endpoint
   `F_2[t]` real rms is `0.035370` versus Poisson `0.141744..0.299770`
   and binomial `0.090987..0.313468`; endpoint `F_3[t]` real rms is
   `0.039001` versus Poisson `0.079865..0.234177`.
3. The effect is not an endpoint artifact because the endpoint is bridged
   out. The largest integer endpoint displacement is only checkpoint `30`,
   value `-0.159937`, and the bottom bridge path stays visibly small.
4. But the algebraic factor check kills novelty. Every bridge coordinate is
   a linear combination of values of `pi(x)-E(x)`, where `E(x)` is the
   discrete logarithmic-integral main term. Bounded bridge stiffness follows
   from classical prime-counting error bounds, and RH-grade versions are
   just RH-grade bounds for `pi(x)-Li(x)` / `psi(x)-x`.
5. The function-field analogue confirms the same funnel: the low bridge
   stiffness is exactly what the Weil RH error term for
   `I_q(d)-q^d/d` predicts after degree-shell bridging.

STATUS: `GRAVEYARD / PRIME-COUNTING BRIDGE TRANSFORM`.

CONNECTION: this is the path-space version of the original `psi(x)-x`
square-root-cancellation nugget and the `l2/L2` dyadic transform. It proves
that moving from endpoint residuals to internal bridge stiffness gives a
better visual and a useful calibration, but it still does not leave the
prime-counting residual funnel.

### LEARN

Do not treat "endpoint removed" as "funnel escaped." A linear path-space
operator on the prime-counting residual can produce a striking flat line and
beat much richer controls without creating a new object. The next attempt
should preserve this bridge/null discipline but apply it to something not
linearly recoverable from `pi`, `psi`, `M`, fixed tuples, pair differences,
or `p-1` factorization.

One promising direction: use bridge stiffness on a genuinely nonlinear
intrinsic object, for example the record process of rough-row visibility
deserts or abundant/frontier jumps, where the line is not a linear
functional of prime mass.

## HANDOFF 55

Status: no survivor. Cycle 56 produced a strong, visually clean,
cross-universe calibration line for the bridged prime-counting residual, but
it broke exactly as a zero-free path transform of `pi(x)-Li(x)` / `psi(x)-x`.

New code since the previous handoff:

- reproducible audit script
  `scripts/logmass-bridge-stiffness-audit.mjs`
- artifact reports and previews:
  - `logs/playground-artifacts/logmass-bridge-stiffness-audit-8000000.md`
  - `logs/playground-artifacts/logmass-bridge-stiffness-audit-8000000.json`
  - `logs/playground-artifacts/logmass-bridge-stiffness-audit-8000000.svg`
  - `logs/playground-artifacts/logmass-bridge-stiffness-audit-8000000.svg.png`
  - `logs/playground-artifacts/logmass-bridge-proxy-200k.png`

No new LAB primitive was added in Cycle 56.

Next cycle suggestion:

Keep the bridge/null idea, but do not apply it to a linear prime-counting
residual again. Try an intrinsic nonlinear process: rough-row desert record
jumps, abundant/frontier closure gaps, or another coordinate-free event
process where the bridge path is not algebraically reducible to `pi`,
`psi`, `M`, a fixed tuple tensor, pair differences, or `p-1`.

## Cycle 57 — gap-conditioned rough-witness offset bridge

### HALLUCINATE

Guess:

Keep the bridge discipline from Cycle 56, but move it onto a nonlinear
interval object. For a prime gap `(p,p+g)`, let

`r(p,g)=roughfirst(p,g)/g`,

where `roughfirst(p,g)` is the first interior offset whose point is
coprime to `lcm(1..g-1)`. If no rough witness exists, set the feature to
`1`, meaning the first witness lies beyond the gap. For each gap width `g`,
estimate the background mean and variance of this feature from random odd
starts with the same `g`, then turn each actual gap into a z-score. Finally
read the cumulative z-score path in prime order and score the endpoint-free
bridge stiffness

`Q(N)=rms_j(S_j - (j/K)S_K)/sqrt(number_of_gaps)`.

Why it could be a line:

Rough-gap exceptions already have a known Gafni-Tao main term, so counting
exceptions alone is old structure. The first-witness offset is more
geometric: it asks how prime gaps are threaded by the surrounding
divisibility desert after conditioning on the gap width. If primes impose a
real arithmetic rigidity on where the first rough witness can sit, the
bridged z-path may be flat/subrandom for real primes and fail for Cramer,
wheel-random, and composite controls.

Preregistered confirmation:

integer `Q(N)` is stable across growing `N`; terminal aggregate z is not the
whole story; real primes separate from five Cramer controls, five W=210
wheel-random controls, five W=2310 wheel-random controls, and five
W=210 composite-only controls. The LAB proxy
`roughfirst(n,gap(n))/gap(n)` over primes should visibly show internal
interval structure rather than a pure endpoint residual.

Preregistered break:

real overlaps controls; the W=210 or W=2310 controls absorb the effect; the
bridge drifts with range; one gap-width bucket dominates; or the factor
check says the statistic is only local row-visibility / wheel geometry
inside prime gaps, not a new critical line.

### SEE

Audit command:

`node scripts/rough-witness-offset-bridge-audit.mjs 4000000 logs/playground-artifacts 4000 64`

Audit plot:
`logs/playground-artifacts/rough-witness-offset-bridge-audit-4000000.svg.png`.

The visual breaks the candidate. The real bridge stiffness rises with
range, and by the endpoint it lies inside the W=210 wheel-random band. The
W=2310 band is even higher. Composite-only controls are much lower, which
means the statistic is not generic density noise, but also not a
prime-specific critical residual.

LAB proxy command:

`node scripts/explore.mjs eval '{"domain":"prime","N":200000,"ex":"pi(n)","ey":"roughfirst(n,gap(n))/max(gap(n),1)"}'`

Metrics:
`linearity=0.000031`, `flatness=0.773108`, `zeroCrossings=0`,
`yMin=0`, `yMax=0.933333`.

Shot:
`logs/playground-artifacts/rough-witness-offset-proxy-200k.png`.

The proxy is not line-like before width-conditioning. It shows a noisy
interval statistic, not a flat critical trace.

### GROUND

Integer side through `N=4000000`:

Bridge exponent: `theta=0.548737`.
Bridge-max exponent: `theta=0.532026`.
Terminal-z exponent: `theta=0.462298`.

| N | gaps | real Q | real max | real terminalZ | real rmsZ | mean first/g | exception rate | Cramer Q range | W210 Q range | W2310 Q range | composite W210 Q range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 250000 | 22043 | 0.953557 | 1.460351 | 108.260032 | 1.402741 | 0.558659 | 0.241845 | 0.459258..1.005520 | 1.423498..1.758912 | 1.329103..2.167253 | 0.327374..0.756749 |
| 500000 | 41537 | 1.294362 | 1.728170 | 145.772911 | 1.400751 | 0.544931 | 0.228640 | 0.446826..1.223698 | 1.561427..2.457770 | 1.881637..2.184878 | 0.196470..0.779604 |
| 1000000 | 78497 | 2.220727 | 3.197986 | 194.987783 | 1.389102 | 0.531080 | 0.215868 | 0.696026..1.615502 | 2.022609..2.830566 | 2.264257..2.858662 | 0.291121..0.480763 |
| 2000000 | 148932 | 2.885182 | 4.133179 | 262.145550 | 1.378882 | 0.518722 | 0.205026 | 1.096363..1.827984 | 2.552516..3.391925 | 2.878304..3.621348 | 0.183185..0.446555 |
| 4000000 | 283145 | 3.681865 | 5.159946 | 353.012177 | 1.368836 | 0.506784 | 0.194589 | 1.860515..2.337406 | 3.080627..3.977007 | 3.968319..4.284954 | 0.290671..0.686163 |

Endpoint terminal aggregate z:

| N | real terminalZ | Cramer range | W210 range | W2310 range | composite W210 range |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 250000 | 108.260032 | 49.617762..52.104961 | 89.802688..92.371110 | 96.519314..98.863306 | 44.690484..46.932718 |
| 500000 | 145.772911 | 67.114149..69.150919 | 119.471733..121.565996 | 129.237928..130.807977 | 64.015947..65.686044 |
| 1000000 | 194.987783 | 89.933812..91.260977 | 158.536813..161.126313 | 171.492518..174.475219 | 88.516794..90.622410 |
| 2000000 | 262.145550 | 121.041470..122.060080 | 211.716234..215.201539 | 229.791575..231.769475 | 123.320216..125.598020 |
| 4000000 | 353.012177 | 161.362392..163.803368 | 285.685067..287.946006 | 307.402154..309.661396 | 171.146148..173.666062 |

Endpoint dominant real gap-width buckets:

| gap width | count | aggregateZ | meanZ | mean first/g | exception rate |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 4 | 26628 | 233.305295 | 1.429734 | 1.000000 | 1.000000 |
| 10 | 23995 | 153.548961 | 0.991258 | 0.551307 | 0.146947 |
| 6 | 44895 | 147.481889 | 0.696049 | 0.696462 | 0.394209 |
| 18 | 18471 | 93.200254 | 0.685760 | 0.369179 | 0.023496 |
| 12 | 28456 | 83.544465 | 0.495257 | 0.431479 | 0.053767 |
| 22 | 8081 | 80.857900 | 0.899477 | 0.357280 | 0.021779 |
| 16 | 10659 | 72.271770 | 0.700020 | 0.401832 | 0.018763 |
| 14 | 15130 | 69.698199 | 0.566633 | 0.419838 | 0.068473 |
| 24 | 10967 | 67.646394 | 0.645953 | 0.312582 | 0.014680 |
| 8 | 18804 | 57.585544 | 0.419941 | 0.557674 | 0.187301 |

### BREAK

GRAVEYARD verdict: local row-visibility / wheel-gap geometry, not a
critical line.

How it broke:

1. The bridge is not flat. Real `Q` grows `0.953557 -> 3.681865`, with
   exponent `theta=0.548737`.
2. The serious local controls absorb it. At `N=4000000`, real
   `Q=3.681865` lies inside the W=210 control range
   `3.080627..3.977007`; W=2310 controls are higher
   `3.968319..4.284954`.
3. Terminal z is enormous for every sieve-like label family. Real terminal
   z is `353.012177`, but W=2310 also reaches `307.402154..309.661396`.
   This is a wrong baseline signal, not residual cancellation.
4. The endpoint is dominated by small named gap widths. Gap `4` alone has
   aggregateZ `233.305295` and exception rate `1`. That is forced local
   admissibility: if both `p` and `p+4` are prime above `3`, the three
   interior offsets are killed by divisibility by `2` or `3`. Random odd
   starts with the same width do not preserve that constraint.
5. The factor check therefore lands in the rough-row wheel funnel. The
   statistic is not a linear `pi`/`psi` transform, but it is still a local
   sieve-geometry statistic inside prime gaps. Width-conditioning alone is
   too weak; one must condition on the full admissible residue pattern of
   the gap before asking for residual bridge stiffness.

STATUS: `GRAVEYARD / LOCAL ROW-VISIBILITY WHEEL-GAP GEOMETRY`.

CONNECTION: this refines the rough-gap exception constant and the
local-eligible gap entries. Counting exceptions found the Gafni-Tao rough
gap law; scoring first-witness offsets after only gap-width conditioning
exposes the next funnel: small-gap admissibility residues dominate the
geometry.

### LEARN

Nonlinear interval geometry helped avoid the prime-counting residual funnel,
but the null was underconditioned. A future rough-witness attempt must build
the background from the exact admissible residue class pattern for the gap
width, not from random odd starts. Otherwise the bridge just measures local
wheel constraints like `g=4`.

Next attempt should either implement full admissible-pattern conditioning
for rough-witness offsets or leave rough witnesses for a different nonlinear
object such as divisor-frontier recovery runs.

## HANDOFF 56

Status: no survivor. Cycle 57 tested a gap-conditioned rough-witness
first-offset bridge. It was nonlinear and not a `pi`/`psi` transform, but it
broke as local row-visibility / wheel-gap geometry. Gap-width conditioning
alone did not remove admissibility residues; `g=4` is already a forced
artifact.

New code since the previous handoff:

- reproducible audit script
  `scripts/rough-witness-offset-bridge-audit.mjs`
- artifact reports and previews:
  - `logs/playground-artifacts/rough-witness-offset-bridge-audit-4000000.md`
  - `logs/playground-artifacts/rough-witness-offset-bridge-audit-4000000.json`
  - `logs/playground-artifacts/rough-witness-offset-bridge-audit-4000000.svg`
  - `logs/playground-artifacts/rough-witness-offset-bridge-audit-4000000.svg.png`
  - `logs/playground-artifacts/rough-witness-offset-proxy-200k.png`

No new LAB primitive was added in Cycle 57.

Next cycle suggestion:

If staying with rough witnesses, condition the baseline on the full
admissible residue pattern for each gap width before scoring first-offset
geometry. Otherwise pivot to divisor-frontier recovery runs, where the
nonlinear process is not directly a local interval admissibility statistic.

## Cycle 58 — admissible-endpoint rough-witness offset bridge

### HALLUCINATE

Guess:

Repair Cycle 57 by strengthening the null instead of abandoning the object.
For each gap width `g`, build the rough-witness offset background only from
starts `a` such that both endpoints are locally admissible:

`rowvis(a,g-1)=rowvis(a+g,g-1)=1`.

Then score the same feature

`r(a,g)=roughfirst(a,g)/g`, with `r=1` if no witness exists,

against that endpoint-admissible background. This removes forced artifacts
like `g=4`, where endpoint admissibility modulo `2,3` already implies every
interior point is row-invisible. After width+endpoint-admissibility
standardization, read the cumulative z-score bridge over consecutive prime
gaps.

Why it could be a line:

The last break said the null was underconditioned. Endpoint admissibility is
the coordinate-free local information forced by a gap being bounded by two
primes, but it does not encode the actual primes beyond the endpoints. If
rough-witness placement inside genuine prime gaps has extra arithmetic
rigidity, the bridge could flatten after this correction and separate from
Cramer, wheel-random, and composite-only controls.

Preregistered confirmation:

`g=4` and other forced small-gap buckets no longer dominate; integer bridge
`Q(N)` is flat or decays across growing `N`; real separates from five Cramer
controls, five W=210 controls, five W=2310 controls, and five W=210
composite-only controls. Terminal z must be secondary to bridge shape, not a
huge wrong-baseline drift.

Preregistered break:

real overlaps controls; bridge or terminal z still grows; a small finite set
of gap widths dominates after the admissibility correction; W=2310 still
absorbs the effect; or the factor check says the statistic is just
higher-order local gap admissibility / row-visibility geometry.

### SEE

Audit command:

`node scripts/rough-witness-admissible-offset-audit.mjs 4000000 logs/playground-artifacts 4000 64`

Audit plot:
`logs/playground-artifacts/rough-witness-admissible-offset-audit-4000000.svg.png`.

The visual shows a real repair but not a survivor. The cyan real bridge no
longer explodes from the `g=4` artifact, and Cramer collapses near zero.
But real still rises with range and lands inside the W=2310 control band.

LAB proxy command:

`node scripts/explore.mjs eval '{"domain":"prime","N":200000,"ex":"pi(n)","ey":"roughfirst(n,gap(n))/max(gap(n),1)"}'`

Metrics:
`linearity=0.000031`, `flatness=0.773108`, `zeroCrossings=0`,
`yMin=0`, `yMax=0.933333`.

Shot:
`logs/playground-artifacts/rough-witness-admissible-proxy-200k.png`.

The proxy is the same raw first-offset statistic as Cycle 57; the repair is
in the audit baseline, not in the app formula.

### GROUND

Integer side through `N=4000000`:

Bridge exponent: `theta=0.673671`.
Bridge-max exponent: `theta=0.536948`.
Terminal-z exponent: `theta=0.439626`.

Baselines were built for all `111` observed gap widths through max gap
`252`. Degenerate widths were only `2,4`, exactly the forced tiny cases.

| N | gaps | scored | real Q | real max | real terminalZ | real rmsZ | mean first/g | exception rate | Cramer Q range | W210 Q range | W2310 Q range | composite W210 Q range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 250000 | 22043 | 22043 | 0.337615 | 0.683949 | 28.678748 | 1.038775 | 0.558659 | 0.241845 | 0.172069..0.271860 | 0.446012..0.785897 | 0.667020..1.218812 | 0.179610..0.537646 |
| 500000 | 41537 | 41537 | 0.403823 | 0.734711 | 38.715406 | 1.047163 | 0.544931 | 0.228640 | 0.146705..0.389586 | 0.562927..1.176895 | 0.719072..1.014281 | 0.145652..0.553668 |
| 1000000 | 78497 | 78497 | 0.984037 | 1.559767 | 50.669674 | 1.046459 | 0.531080 | 0.215868 | 0.123080..0.427365 | 0.870918..1.325360 | 0.931346..1.474326 | 0.172002..0.722390 |
| 2000000 | 148932 | 148932 | 1.269097 | 1.913220 | 67.016514 | 1.044441 | 0.518722 | 0.205026 | 0.114028..0.219878 | 0.919282..1.497374 | 1.195566..1.761975 | 0.193057..0.506145 |
| 4000000 | 283145 | 283145 | 1.635914 | 2.352754 | 88.666531 | 1.042737 | 0.506784 | 0.194589 | 0.130823..0.233753 | 0.954625..1.573307 | 1.538918..1.907396 | 0.218037..0.535084 |

Endpoint terminal aggregate z:

| N | real terminalZ | Cramer range | W210 range | W2310 range | composite W210 range |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 250000 | 28.678748 | -0.922496..0.118319 | 14.616890..16.364256 | 18.631524..20.697647 | 2.566431..4.110997 |
| 500000 | 38.715406 | -0.393480..-0.031157 | 18.379069..20.139270 | 24.015956..25.711284 | 4.484569..5.523958 |
| 1000000 | 50.669674 | -1.097803..-0.200529 | 23.471483..25.088640 | 30.929749..32.407225 | 5.626128..6.995169 |
| 2000000 | 67.016514 | -1.218299..-0.084328 | 29.335648..31.899527 | 39.176927..41.259526 | 8.586280..9.541986 |
| 4000000 | 88.666531 | -1.683622..-0.290163 | 38.644211..40.383228 | 50.223610..52.514978 | 10.813240..12.512455 |

Endpoint dominant real gap-width buckets:

| gap width | count | aggregateZ | meanZ | mean first/g | exception rate |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 24 | 10967 | 34.905430 | 0.333311 | 0.312582 | 0.014680 |
| 18 | 18471 | 31.225090 | 0.229752 | 0.369179 | 0.023496 |
| 30 | 8323 | 29.655276 | 0.325059 | 0.247859 | 0.002283 |
| 14 | 15130 | 29.368777 | 0.238763 | 0.419838 | 0.068473 |
| 10 | 23995 | 28.829058 | 0.186110 | 0.551307 | 0.146947 |
| 26 | 4893 | 23.361373 | 0.333973 | 0.275873 | 0.004905 |
| 6 | 44895 | 22.878534 | 0.107976 | 0.696462 | 0.394209 |
| 20 | 9082 | 22.843399 | 0.239701 | 0.312431 | 0.012552 |
| 12 | 28456 | 21.280716 | 0.126154 | 0.431479 | 0.053767 |
| 16 | 10659 | 20.722754 | 0.200719 | 0.401832 | 0.018763 |

### BREAK

GRAVEYARD verdict: higher-order local admissibility gap geometry, not a
critical line.

How it broke:

1. The repair worked locally. The forced `g=4` artifact vanished from the
   dominant buckets, and Cramer terminal z moved from huge positive drift to
   near zero (`-1.683622..-0.290163` at endpoint).
2. But the real bridge is still not flat. Real `Q` grows
   `0.337615 -> 1.635914`, with exponent `theta=0.673671`.
3. High-wheel controls absorb the effect. At `N=4000000`, real
   `Q=1.635914` lies inside the W=2310 band `1.538918..1.907396`.
4. Terminal z still grows strongly for real (`88.666531`), W=210
   (`38.644211..40.383228`), and W=2310 (`50.223610..52.514978`). The
   endpoint-admissible null fixed the first local layer but not the whole
   local gap process.
5. Dominant widths are now spread across ordinary even gaps (`24,18,30,14,
   10,...`) rather than one tiny forced width. That is progress, but it also
   identifies the next funnel: higher-order local admissibility of the
   entire gap interior, not just endpoint row-visibility.

STATUS: `GRAVEYARD / HIGHER-ORDER LOCAL ADMISSIBILITY GAP GEOMETRY`.

CONNECTION: direct repair of Cycle 57. It proves that endpoint
admissibility is the right first subtraction, because it kills `g=4` and
calibrates Cramer. It also proves that rough-witness first-offset geometry
still follows the local gap-admissibility ladder; W=2310 is already enough
to reproduce the bridge scale.

### LEARN

The strict local null improved the experiment, which is worth keeping as a
calibration. But rough-witness offset statistics still live in the
prime-gap local-sieve world. Escaping this branch would require conditioning
on the full interior admissibility pattern or subtracting a high-primorial
ladder before any residual claim. That is now too close to the local tuple
funnel.

Next attempt should pivot away from rough witnesses. A better branch is
divisor-frontier recovery runs, where the object is nonlinear in a
divisor-record process rather than an interval admissibility statistic.

## HANDOFF 57

Status: no survivor. Cycle 58 repaired Cycle 57 by conditioning the
rough-witness first-offset baseline on locally admissible endpoints. This
removed the forced small-gap artifact and made Cramer behave, but W=2310
wheel controls absorbed the real bridge scale.

New code since the previous handoff:

- reproducible audit script
  `scripts/rough-witness-admissible-offset-audit.mjs`
- artifact reports and previews:
  - `logs/playground-artifacts/rough-witness-admissible-offset-audit-4000000.md`
  - `logs/playground-artifacts/rough-witness-admissible-offset-audit-4000000.json`
  - `logs/playground-artifacts/rough-witness-admissible-offset-audit-4000000.svg`
  - `logs/playground-artifacts/rough-witness-admissible-offset-audit-4000000.svg.png`
  - `logs/playground-artifacts/rough-witness-admissible-proxy-200k.png`

No new LAB primitive was added in Cycle 58.

Next cycle suggestion:

Leave rough witnesses unless you are prepared to subtract a full
high-primorial / interior-admissibility model. Pivot to divisor-frontier
recovery runs or another nonlinear object not built from prime-gap local
admissibility.

## Cycle 59 — divisor-frontier recovery-debt bridge

### HALLUCINATE

Guess:

Leave the Cramer theorem frame as the object and use it only as a fake-shape
contrast. The new object is the nonlinear CA/XA divisor-frontier recovery
process: when a prime step has no base before the second-order threshold, it
creates a negative log-margin debt; later divisor-frontier steps either
recover that debt or leave it open.

Define the candidate line as a bounded recovery-debt trace over frontier
cutoffs:

`B(Y)=max extraStepsAfterNoBaseRun among no-base runs with fromFrontier<=Y`,

together with a debt-size companion

`D(Y)=sqrt(sum max(0,-minCumulativeLogMargin)^2)`.

Why it could be a line:

This object is not a direct prime count, not a gap-width offset, and not a
named residue coordinate. It lives in the divisor-record geometry of CA/XA
transitions. If true primes impose arithmetic regularity on the divisor
frontier, the real trace may be almost flat: sparse no-base debts, short
bounded recovery, and no unrecovered tails. Fixed-shape fake-base controls
should either accumulate long no-base runs, fail recovery, or show unstable
debt growth.

Preregistered confirmation:

Real `B(Y)` stays bounded across growing frontier cutoffs; unrecovered real
runs remain zero; `D(Y)` stays tiny relative to total expected missing-base
mass; the effect is not an endpoint-only event; at least five fixed-shape
fake-base controls show larger or unstable no-base/recovery behavior.

Preregistered break:

The trace is just a restatement of the existing CA/XA no-base recovery
conjecture; fixed-shape controls include seeds with no no-base events or
otherwise too-heterogeneous null behavior; the line depends on sparse early
events; recovery uses old-exponent steps in a way that collapses to the
current CA/XA factorization model; or finite range is too short for a
critical-line claim.

### SEE

Audit command:

`node scripts/caxa-recovery-debt-audit.mjs logs/divisor-extremes-artifacts/ca-xa-transitions.json logs/playground-artifacts`

Audit plot:
`logs/playground-artifacts/caxa-recovery-debt-audit.svg.png`.

The picture is strong but dangerous. Real CA/XA is a low step trace:
bounded recovery `B(Y)` reaches only `3`, open no-base debts close back to
`0`, and debt L2 stays visually on the floor. The fake band is not a clean
null: some seeds have no no-base events, while others accumulate open debts
and huge debt L2.

LAB proxy command:

`node scripts/explore.mjs eval '{"domain":"int","N":5000,"ex":"n","ey":"tau(n)"}'`

Metrics:
`linearity=0.015457`, `flatness=0.805748`, `zeroCrossings=0`,
`yMin=1`, `yMax=48`.

Shot:
`logs/playground-artifacts/caxa-recovery-debt-proxy-tau-5k.png`.

The proxy is only generic divisor-pressure geometry. The actual recovery
bridge is not expressible as a current LAB formula because it lives in the
derived CA/XA transition pack.

### GROUND

Endpoint through frontier `2719`:

| group | no-base events | recovery runs | unrecovered runs | max prime-only run | max recovery-run length | max extra | max total steps | deepest debt micro | debtL2 micro |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| real CA/XA | 8 | 4 | 0 | 3 | 3 | 3 | 6 | 11.776 | 13.642 |
| fake seed 12345 | 195 | 16 | 13 | 143 | 57 | 6 | 10 | 5525.560 | 16177.300 |
| fake seed 271828 | 47 | 5 | 5 | 23 | 23 | 0 | 0 | 1067.779 | 1898.594 |
| fake seed 314159 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.000 | 0.000 |
| fake seed 161803 | 127 | 20 | 8 | 46 | 19 | 94 | 108 | 5506.262 | 10603.670 |
| fake seed 424242 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.000 | 0.000 |

Real recovery runs:

| from frontier | no-base primes | recovered at | extra steps | total steps | debt micro | recovery primes |
| ---: | --- | ---: | ---: | ---: | ---: | --- |
| 139 | 149 | 151 | 1 | 2 | 11.776 | 149,151 |
| 523 | 541 | 541 | 1 | 2 | 1.505 | 541,31 |
| 1399 | 1409,1423,1427 | 1439 | 3 | 6 | 6.501 | 1409,1423,1427,1429,1433,1439 |
| 2633 | 2647,2657,2659 | 2677 | 3 | 6 | 1.697 | 2647,2657,2659,2663,2671,2677 |

Positive-row exponent fits:

- `B(Y)` theta: `0.552673`
- open-runs theta: `0.000000`
- debt-L2 theta: `0.065643`

The exponent on `B(Y)` is not a scaling law; it is a sparse step function
that jumps from `1` to `3`. The debt-L2 exponent is the more honest
stability read, and it is tiny over this finite prefix.

### BREAK

Verdict: open lead, not a critical-line survivor.

What survived numerically:

1. Real CA/XA has only four recovery-debt runs in the available prefix.
2. All four recover.
3. Recovery cost is short: max extra steps `3`, max total steps `6`.
4. The debt scale is microscopic: real debt L2 `13.642` micro log-margin,
   while the nonempty bad fake controls reach `1898.594..16177.300`.
5. This does not collapse to `pi`, `psi`, or a named gap-width residual.

How it broke:

1. The "line" is a finite sparse step trace, not a residual scaling law.
   Four events are not enough range for a critical-line claim.
2. The construction is exactly a repackaging of the CA/XA no-base recovery
   conjecture. That is interesting, but it is not an independent object.
3. The fake-shape controls are heterogeneous. Two seeds have no no-base
   events at all, while three seeds have severe open debt. That makes the
   fake band a contrast, not a calibrated null.
4. One real recovery uses an old-exponent multiplier (`31`) rather than only
   new frontiers. That keeps the object inside the current CA/XA
   factorization model rather than a coordinate-free prime law.
5. No theorem was derived. Without a proof that CA/XA no-base debts always
   recover with bounded cost, the audit gate stops here.

STATUS: `OPEN-LEAD / FINITE CA-XA RECOVERY-BOUND TRACE, NOT A CRITICAL LINE`.

CONNECTION: this is the clean pivot suggested by Cycle 58. It escapes the
rough-witness local-gap funnel and the `pi`/`psi` residual funnel, but it
lands in a different funnel: the divisor-frontier CA/XA recovery conjecture
itself. That is a better object than rough gaps, but still not a grounded
critical line.

### LEARN

The useful invention is not "Cramer predicts primes." It is "fake divisor
frontiers either avoid the no-base event entirely or fail to close their
debt, while real CA/XA closes every observed debt quickly." That suggests a
next object: classify the local CA/XA transition motif that closes debt,
then build a motif-level invariant rather than a cumulative recovery trace.

Next attempt should not add another Cramer-like baseline first. It should
invent a CA/XA recovery grammar: what exact divisor-frontier move, exponent
change, or neighboring prime pattern turns negative margin back positive?
Composite or fake controls then test the grammar, not the raw endpoint.

## HANDOFF 58

Status: no critical-line survivor, but a better open lead. Cycle 59 tested
the CA/XA recovery-debt bridge. Real CA/XA closes all four observed no-base
debt runs by frontier `2719`, with max extra recovery cost `3` and debt L2
only `13.642` micro log-margin. Fixed-shape fake-base controls are wildly
different: two have no no-base events, while three accumulate open debt
and/or long recovery cost.

New code since the previous handoff:

- reproducible audit script
  `scripts/caxa-recovery-debt-audit.mjs`
- artifact reports and previews:
  - `logs/playground-artifacts/caxa-recovery-debt-audit.md`
  - `logs/playground-artifacts/caxa-recovery-debt-audit.json`
  - `logs/playground-artifacts/caxa-recovery-debt-audit.svg`
  - `logs/playground-artifacts/caxa-recovery-debt-audit.svg.png`
  - `logs/playground-artifacts/caxa-recovery-debt-proxy-tau-5k.png`

No new LAB primitive was added in Cycle 59.

Next cycle suggestion:

Do not just extend the same recovery endpoint plot. Invent a local CA/XA
recovery grammar: classify each debt-closing motif by prime step,
old-exponent multiplier, exponent-vector move, and second-order slack.
Then ask whether real debt-closing motifs form a small intrinsic language
that fake controls cannot reproduce.

## Cycle 60 — CA/XA recovery grammar compression

### HALLUCINATE

Guess:

Do not score the endpoint debt trace again. Treat each CA/XA no-base debt
episode as a short word in a local recovery grammar. For every step from
the first no-base row through the row where cumulative log-margin recovers,
encode only intrinsic local data:

- `N+`: new-frontier prime step (`oldExponent=0`) with positive
  second-order overshoot, i.e. the no-base debt step.
- `N-`: new-frontier prime step at or below the second-order threshold,
  i.e. a slack-repair step.
- `Oe`: old-exponent repair step with exponent `e`.

The candidate line is a grammar-compression flatness claim:

`G(Y)=number of distinct recovery words up to frontier Y`.

Why it could be a line:

Cycle 59 showed real CA/XA closes all observed debts quickly. If those
closures are not random accidents but a small local language, then the real
grammar should stay tiny and stable while fixed-shape fake-base controls
either fail to recover or require many longer words. This would be more
intrinsic than the endpoint debt plot: it asks what local move closes the
debt, not just whether the debt closes.

Preregistered confirmation:

Real debt-closing words are few, short, and reuse the same motifs across
frontier growth; all real words close; fake controls have a larger distinct
word count, unrecovered tails, or much longer words. The statistic should
not use `pi`, `psi`, endpoint residuals, gap-width buckets, or named
congruence classes.

Preregistered break:

Real has only four words, so the grammar may be an overfit finite prefix;
the detailed fake transition words may be unavailable from the existing
artifact, leaving only coarse fake recovery summaries; or the words are
just restatements of the CA/XA margin formula (`N+` debt repaired by nearby
`N-` slack or by a small old-exponent multiplier), making the object a
local CA/XA factorization grammar rather than a critical line.

### SEE

Audit command:

`node scripts/caxa-recovery-grammar-audit.mjs logs/divisor-extremes-artifacts/ca-xa-transitions.json logs/playground-artifacts`

Audit plot:
`logs/playground-artifacts/caxa-recovery-grammar-audit.svg.png`.

The visual shows a tiny real grammar: distinct closed real words rise only
to `3`, and open real tails repeatedly return to `0`. The fake band is
again heterogeneous: some fake seeds have no words, while others accumulate
open tails and many coarse word types.

LAB proxy command:

`node scripts/explore.mjs eval '{"domain":"int","N":6000,"ex":"n","ey":"tau(n+1)-tau(n)"}'`

Metrics:
`linearity=0.000000316`, `flatness=1.369699`, `zeroCrossings=4372`,
`yMin=-57`, `yMax=58`.

Shot:
`logs/playground-artifacts/caxa-recovery-grammar-proxy-tau-delta-6k.png`.

The LAB proxy is a generic local divisor-step signal. It is noisy and not a
line; the CA/XA recovery grammar is a derived transition object, not a
current LAB formula.

### GROUND

Real detailed recovery words:

| from frontier | recovered by | recovery primes | compact word | length | debt micro | final cumulative micro | matched steps |
| ---: | ---: | --- | --- | ---: | ---: | ---: | ---: |
| 139 | 151 | 149,151 | `N+ N-` | 2 | 11.776 | 131.233387 | 2/2 |
| 523 | 541 | 541,31 | `N+ O1` | 2 | 1.505 | 7.985356 | 2/2 |
| 1399 | 1439 | 1409,1423,1427,1429,1433,1439 | `N+^3 N-^3` | 6 | 6.501 | 0.002263 | 6/6 |
| 2633 | 2677 | 2647,2657,2659,2663,2671,2677 | `N+^3 N-^3` | 6 | 1.697 | 0.256664 | 6/6 |

Real step grammar:

| run frontier | token | p | old exp | margin micro | cumulative micro | overshoot |
| ---: | --- | ---: | ---: | ---: | ---: | ---: |
| 139 | `N+` | 149 | 0 | -11.776209 | -11.776209 | 0.211373 |
| 139 | `N-` | 151 | 0 | 143.009596 | 131.233387 | -2.808877 |
| 523 | `N+` | 541 | 0 | -1.505012 | -1.505012 | 0.376777 |
| 523 | `O1` | 31 | 1 | 9.490368 | 7.985356 | NA |
| 1399 | `N+` | 1409 | 0 | -0.250995 | -0.250995 | 0.436026 |
| 1399 | `N+` | 1423 | 0 | -4.054949 | -4.305943 | 7.182855 |
| 1399 | `N+` | 1427 | 0 | -2.195452 | -6.501396 | 3.919807 |
| 1399 | `N-` | 1429 | 0 | 0.747188 | -5.754207 | -1.346037 |
| 1399 | `N-` | 1433 | 0 | 2.543114 | -3.211093 | -4.613268 |
| 1399 | `N-` | 1439 | 0 | 3.213356 | 0.002263 | -5.883284 |
| 2633 | `N+` | 2647 | 0 | -0.656745 | -0.656745 | 4.077510 |
| 2633 | `N+` | 2657 | 0 | -0.990950 | -1.647695 | 6.194855 |
| 2633 | `N+` | 2659 | 0 | -0.049359 | -1.697055 | 0.308434 |
| 2633 | `N-` | 2663 | 0 | 0.567283 | -1.129771 | -3.578735 |
| 2633 | `N-` | 2671 | 0 | 0.546346 | -0.583426 | -3.467404 |
| 2633 | `N-` | 2677 | 0 | 0.840090 | 0.256664 | -5.359068 |

Fixed-shape coarse controls:

| seed | runs | recovered | unrecovered | distinct coarse words | recovered word types | open word types | max word length | deepest debt micro |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 12345 | 16 | 3 | 13 | 13 | 3 | 10 | 57 | 5525.560 |
| 271828 | 5 | 0 | 5 | 3 | 0 | 3 | 23 | 1067.779 |
| 314159 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.000 |
| 161803 | 20 | 12 | 8 | 19 | 12 | 7 | 108 | 5506.262 |
| 424242 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.000 |

Endpoint summary:

- real detailed closed words: `3`
- real detailed episodes: `4`
- real unmatched path steps: `0`
- fake coarse distinct word range: `0..19`
- fake unrecovered run range: `0..13`
- fake max word length range: `0..108`

### BREAK

Verdict: useful local grammar lead, not a critical-line survivor.

What survived numerically:

1. The real path data fully supports the grammar extraction: every recovery
   prime maps to a row-level transition step (`0` unmatched steps).
2. The real grammar is tiny. Four closures use only three compact words:
   `N+ N-`, `N+ O1`, and `N+^3 N-^3`.
3. The long word repeats at frontiers `1399` and `2633`: three no-base
   overshoot steps followed by three below-threshold slack steps.
4. Nonempty fake controls are much messier at the coarse level: up to `19`
   coarse word types, `13` open runs, and max word length `108`.

How it broke:

1. Four real words are not enough data for a line. `G(Y)` rising to `3`
   is a finite grammar catalog, not a residual scaling law.
2. The detailed fake path words are not present in the current artifact.
   Comparing detailed real words to coarse fake summaries is useful for
   triage but not a full audit gate.
3. The symbols are generated directly from the CA/XA margin formula:
   `N+` debt is repaired by nearby `N-` slack or by an old-exponent
   multiplier (`O1`). That is local CA/XA factorization grammar, not an
   independent prime regularity line.
4. The two zero-event fake seeds remain a null-model problem; they do not
   fail the grammar, they avoid the event.

STATUS: `OPEN-LEAD / FINITE CA-XA LOCAL GRAMMAR, NOT A CRITICAL LINE`.

CONNECTION: direct refinement of Cycle 59. The endpoint recovery-debt trace
was too coarse; this cycle extracts the actual local words behind closure.
It confirms that the real phenomenon is not Cramer density, but it also
shows the new funnel: CA/XA local margin mechanics.

### LEARN

The repeat `N+^3 N-^3` is the strongest nugget. It says a three-prime
second-order overshoot cluster can be exactly paid back by the next three
below-threshold new-frontier primes. The grammar is too sparse to be a line,
but it gives a sharper next target than endpoint debt.

Next attempt should regenerate or extend the fake transition pack with
detailed fake path rows, then compare real and fake grammars at the same
resolution. If that is too heavy, build a direct "slack pairing" invariant:
for each maximal run of `N+` debt, pair it against the following `N-` slack
block and measure balance without using endpoint recovery.

## HANDOFF 59

Status: no critical-line survivor, but Cycle 60 sharpened the CA/XA lead.
The real recovery grammar through frontier `2719` has four closures and
three compact words:

- `N+ N-`
- `N+ O1`
- `N+^3 N-^3` twice

The audit found all real row-level transition steps, including margins and
second-order overshoots. Fake controls currently have only coarse recovery
summaries in the artifact, not detailed path words; nonempty fake seeds are
messier but the comparison is not audit-grade.

New code since the previous handoff:

- reproducible audit script
  `scripts/caxa-recovery-grammar-audit.mjs`
- artifact reports and previews:
  - `logs/playground-artifacts/caxa-recovery-grammar-audit.md`
  - `logs/playground-artifacts/caxa-recovery-grammar-audit.json`
  - `logs/playground-artifacts/caxa-recovery-grammar-audit.svg`
  - `logs/playground-artifacts/caxa-recovery-grammar-audit.svg.png`
  - `logs/playground-artifacts/caxa-recovery-grammar-proxy-tau-delta-6k.png`

No new LAB primitive was added in Cycle 60.

Next cycle suggestion:

Either regenerate fixed-shape fake controls with detailed path rows so the
grammar comparison is same-resolution, or skip fakes and test the intrinsic
slack-pairing invariant: maximal `N+` overshoot block versus following
`N-` slack block, scored by block balance and recovery lag.

## Cycle 61 — CA/XA slack-pairing balance

### HALLUCINATE

Guess:

Compress the Cycle 60 grammar one more level. Ignore exact words and pair
each maximal `N+` no-base debt block against the immediately following
`N-` new-frontier slack block. Define the block balance

`rho = slackMargin / debtMagnitude`

and the residual line

`L(Y)=rms(log(rho))` over closed same-type pairs with frontier cutoff `Y`.

Why it could be a line:

The repeated word `N+^3 N-^3` looked like a conservation law: the positive
overshoot block is paid back by the next below-threshold block. If CA/XA
frontier geometry enforces a local slack conservation principle, `rho`
should sit near `1` for nontrivial blocks, giving a flat residual without
using `pi`, `psi`, zeta, zeros, endpoint prime counts, or gap-width labels.

Preregistered confirmation:

For real same-type new-frontier pairs, `rho` is stable near `1`, lag is
short, and the effect is not carried by the final endpoint. Coarse fake
controls should have larger imbalance, open blocks, or much longer lags.
The singleton `N+ N-` and old-exponent repair `N+ O1` are allowed to form
separate motif classes rather than being averaged into the cluster claim.

Preregistered break:

Only two nontrivial same-type real pairs exist; singleton and old-exponent
motifs break the near-unit balance; fake controls remain too coarse for a
same-resolution comparison; or the invariant is just algebraic bookkeeping
of the CA/XA margin formula rather than an independent critical-line
object.

### SEE

Audit command:

`node scripts/caxa-slack-pairing-audit.mjs logs/divisor-extremes-artifacts/ca-xa-transitions.json logs/playground-artifacts`

Audit plot:
`logs/playground-artifacts/caxa-slack-pairing-audit.svg.png`.

The visual breaks the broad line immediately. All same-type real pairs are
dominated by the singleton overpay at frontier `139`; the cluster-only
trace stays small, but it has only two real points.

LAB proxy command:

`node scripts/explore.mjs eval '{"domain":"int","N":8000,"ex":"n","ey":"log(max(1,tau(n+1)))-log(max(1,tau(n)))"}'`

Metrics:
`linearity=0.0000000076`, `flatness=1.221186`, `zeroCrossings=5812`,
`yMin=-3.465736`, `yMax=3.465736`.

Shot:
`logs/playground-artifacts/caxa-slack-pairing-proxy-logtau-delta-8k.png`.

The proxy is ordinary local divisor-step motion. It is dense noise and not
a line; the real object is still the derived CA/XA transition path.

### GROUND

Real slack pairs:

| from | class | debt primes | slack primes | old repair | debt micro | slack micro | old micro | rho | log rho | final surplus micro |
| ---: | --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 139 | sameTypeSingleton | 149 | 151 | none | 11.776209 | 143.009596 | 0.000000 | 12.143942 | 2.496830 | 131.233387 |
| 523 | oldExponentRepair | 541 | none | 31 | 1.505012 | 0.000000 | 9.490368 | NA | NA | 7.985356 |
| 1399 | sameTypeCluster | 1409,1423,1427 | 1429,1433,1439 | none | 6.501396 | 6.503659 | 0.000000 | 1.000348 | 0.000348 | 0.002263 |
| 2633 | sameTypeCluster | 2647,2657,2659 | 2663,2671,2677 | none | 1.697055 | 1.953719 | 0.000000 | 1.151241 | 0.140841 | 0.256664 |

Endpoint summary:

- all real same-type pairs: `3`
- real same-type rms `log(rho)`: `1.443837`
- real nontrivial cluster pairs: `2`
- real cluster rms `log(rho)`: `0.099590`
- real cluster `rho` range: `1.000348..1.151241`
- fake same-type coarse rms range: `0..0.612672`
- fake cluster coarse rms range: `0..0.584233`
- fake open-pair range: `0..13`

Fixed-shape coarse controls:

| seed | pairs | recovered | open | same-type coarse | cluster coarse | same rms log rho | cluster rms log rho | max lag |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 12345 | 16 | 3 | 13 | 2 | 1 | 0.575848 | 0.584233 | 6 |
| 271828 | 5 | 0 | 5 | 0 | 0 | 0.000000 | 0.000000 | 0 |
| 314159 | 0 | 0 | 0 | 0 | 0 | 0.000000 | 0.000000 | 0 |
| 161803 | 20 | 12 | 8 | 7 | 5 | 0.612672 | 0.350345 | 94 |
| 424242 | 0 | 0 | 0 | 0 | 0 | 0.000000 | 0.000000 | 0 |

### BREAK

Verdict: graveyard for the broad slack-pairing line; open micro-lead for
nontrivial clusters only.

How it broke:

1. The all-pair line fails hard. The singleton `149 -> 151` has
   `rho=12.143942`, so real same-type rms `log(rho)` is `1.443837`, larger
   than the nonzero fake coarse range `0.575848..0.612672`.
2. The old-exponent repair `541 -> 31` is a separate motif, not a
   new-frontier slack pair. It cannot be forced into the `N+`/`N-`
   conservation story without lying.
3. The attractive part is only the two cluster pairs:
   `rho=1.000348` and `1.151241`. Two samples are not a line or a scaling
   law.
4. Fake controls are still coarse. They can show open debt and rough
   imbalance, but they do not provide same-resolution row-level fake
   slack paths.
5. The factor check stays inside CA/XA local mechanics: `rho` is computed
   from the same log-margin terms that define recovery.

STATUS: `GRAVEYARD / BROAD CA-XA SLACK-PAIRING LINE`; substatus
`OPEN-MICRO-LEAD / N+^3 N-^3 CLUSTER BALANCE`.

CONNECTION: direct stress test of Cycle 60's `N+^3 N-^3` motif. The stress
test did its job: it separated a real repeated cluster balance from the
failed broader conservation claim.

### LEARN

Do not average motif classes. Singleton, old-exponent repair, and
three-step cluster repair are different local mechanisms. The next useful
move is not another global line over all CA/XA recoveries; it is a motif
split with same-resolution controls.

Next attempt should either regenerate fixed-shape fake path rows, or leave
CA/XA and try a different nonlinear object where at least dozens of events
are available. If staying with CA/XA, focus only on `N+^k N-^k` clusters
and ask whether near-unit slack balance persists when more CA/XA records
are generated beyond frontier `2719`.

## HANDOFF 60

Status: no critical-line survivor. Cycle 61 tested the intrinsic
slack-pairing balance suggested by Cycle 60. The broad invariant broke
because the singleton repair overpays by `rho=12.143942`, and the
old-exponent repair is a different mechanism. The only promising residue
is the two-event `N+^3 N-^3` cluster balance:

- frontier `1399`: `rho=1.000348`
- frontier `2633`: `rho=1.151241`

New code since the previous handoff:

- reproducible audit script
  `scripts/caxa-slack-pairing-audit.mjs`
- artifact reports and previews:
  - `logs/playground-artifacts/caxa-slack-pairing-audit.md`
  - `logs/playground-artifacts/caxa-slack-pairing-audit.json`
  - `logs/playground-artifacts/caxa-slack-pairing-audit.svg`
  - `logs/playground-artifacts/caxa-slack-pairing-audit.svg.png`
  - `logs/playground-artifacts/caxa-slack-pairing-proxy-logtau-delta-8k.png`

No new LAB primitive was added in Cycle 61.

Next cycle suggestion:

Do not keep averaging CA/XA motif classes. Either regenerate a deeper CA/XA
or fixed-shape fake path pack so `N+^k N-^k` clusters have real sample size,
or pivot to a different nonlinear event process with many events and a
same-resolution null.

## Cycle 62 — quadratic predecessor character bridge

### HALLUCINATE

Guess:

Leave CA/XA. For consecutive primes `p<q`, score the moving quadratic
character

`chi(q) = (p / q)`,

the Legendre symbol of the predecessor modulo the current prime. Build the
bridge

`S(Y)=sum_{q<=Y} chi(q)`, and score `max_{y<=Y}|S(y)|/sqrt(pair_count)`.

Why it could be a line:

This is a high-event nonlinear statistic: the modulus changes at every
prime, and the input is the actual predecessor, not a fixed residue
coordinate. It is not a prime-counting transform and not a fixed AP
residual. If prime gaps are threading quadratic-residue space with
arithmetic regularity, `S(Y)` might show unusually tight sqrt-scale
cancellation compared with Cramer labels, random predecessor labels, and
composite predecessor controls.

Preregistered confirmation:

Real `maxAbs/sqrt(pair_count)` is flat or decreasing across growing `Y`;
block-normalized values remain stable; real separates from at least five
Cramer-label Jacobi controls, five random-prime-predecessor controls, and
five composite-predecessor controls. A prime claim requires composite
predecessors to fail or at least not reproduce the same bridge.

Preregistered break:

real sits inside controls; the bridge drifts; the effect is explained by
quadratic reciprocity applied to `q-p` and therefore collapses to gap
residue character energy; Jacobi controls are not a comparable universe; or
this is just another fixed-character/AP phenomenon in moving disguise.

### SEE IT

Audit command:

`node scripts/quadratic-predecessor-bridge-audit.mjs 4000000 logs/playground-artifacts`

Artifacts:

- `logs/playground-artifacts/quadratic-predecessor-bridge-4000000.md`
- `logs/playground-artifacts/quadratic-predecessor-bridge-4000000.json`
- `logs/playground-artifacts/quadratic-predecessor-bridge-4000000.svg`
- `logs/playground-artifacts/quadratic-predecessor-bridge-4000000.svg.png`

LAB proxy command:

`node scripts/explore.mjs eval '{"domain":"prime","N":200000,"ex":"pi(n)","ey":"mod(n,max(1,gap(n)))/max(1,gap(n))"}'`

Metrics:
`linearity=0.0000051252`, `flatness=0.563289`,
`zeroCrossings=0`, `yMin=0`, `yMax=0.983333`.

Shot:
`logs/playground-artifacts/quadratic-predecessor-gapresidue-proxy-200k.png`.

Picture read:
the audit SVG shows the real cyan path running low but fully inside the
control bundle. The LAB proxy collapses visually to a near-horizontal
normalized gap-residue band, not a new 2-D geometry.

### GROUND

Endpoint trace:

| N | pairs | real value | real normalized | real maxAbs/sqrt | Cramer range | random-prime predecessor range | composite predecessor range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 250000 | 22043 | -207 | -1.394232 | 1.468321 | 0.617526..3.097513 | 1.259552..3.677622 | 1.010978..2.540925 |
| 500000 | 41537 | -177 | -0.868472 | 1.422920 | 0.537112..2.321311 | 0.917549..2.679047 | 0.736250..1.919159 |
| 1000000 | 78497 | -145 | -0.517537 | 1.035074 | 0.426284..2.898929 | 1.256374..2.816134 | 0.535482..1.963434 |
| 2000000 | 148932 | -146 | -0.378320 | 1.057222 | 0.590309..2.880938 | 1.381130..3.581092 | 0.976989..1.611902 |
| 4000000 | 283145 | -277 | -0.520565 | 1.133216 | 0.756767..2.091514 | 1.001667..3.860084 | 0.838210..1.390751 |

Block normalized values:

| block | pairs | real | Cramer range | random-prime predecessor range | composite predecessor range |
| --- | ---: | ---: | ---: | ---: | ---: |
| (1, 250000] | 22043 | -1.394232 | -2.940244..2.462867 | -3.071421..0.269423 | 0.215675..2.345469 |
| (250000, 500000] | 19494 | 0.214868 | -1.012712..1.445294 | -1.561371..0.286490 | -1.862185..1.489748 |
| (500000, 1000000] | 36960 | 0.166450 | -2.912682..1.880533 | -1.934982..0.998700 | -0.644994..2.486348 |
| (1000000, 2000000] | 70435 | -0.003768 | -0.854086..1.405667 | -2.679016..1.932961 | -1.375304..0.772431 |
| (2000000, 4000000] | 134213 | -0.357581 | -1.225156..1.007637 | -1.924384..1.367541 | -0.837994..1.487645 |

Summary:

- endpoint real `maxAbs/sqrt(pair_count)=1.133216`
- real maxAbs exponent `theta=0.372494`
- endpoint Cramer/Jacobi range `0.756767..2.091514`
- endpoint random-prime predecessor range `1.001667..3.860084`
- endpoint composite predecessor range `0.838210..1.390751`

Factor check:
quadratic reciprocity rewrites `(p/q)` from the current prime `q`, the
previous prime `p`, and signs modulo `4`. Since `q=p+gap`, the object is
equivalently a moving gap-residue character statistic unless it separates
from controls. It does not separate.

### BREAK

Verdict: graveyard.

How it broke:

1. The real endpoint path is ordinary sqrt-scale cancellation:
   `maxAbs/sqrt=1.133216`, `theta=0.372494`.
2. The real value is inside every endpoint control family:
   Cramer/Jacobi `0.756767..2.091514`, random-prime predecessor
   `1.001667..3.860084`, and composite predecessor `0.838210..1.390751`.
3. Every block-normalized real value also lies inside the corresponding
   control ranges. There is no growing separated effect size.
4. The Cramer/Jacobi controls are imperfect because composite fake labels
   give composite moduli, but the prime-predecessor and composite
   predecessor controls already absorb the real statistic.
5. The construction is not coordinate-free enough. Reciprocity turns the
   moving Legendre bridge into gap-residue character energy in disguise.

STATUS: `GRAVEYARD / MOVING QUADRATIC GAP-RESIDUE CHARACTER NOISE`.

CONNECTION: this is the moving-modulus cousin of the fixed QR/QNR gap
mean audit. Moving the modulus from a fixed residue class to the current
prime made the guess more creative, but the funnel still caught it as
gap-residue character energy rather than a critical line.

### LEARN

The useful boundary is sharper now: "nonlinear" and "moving modulus" are
not enough. If quadratic reciprocity can rewrite the construction as a
function of the gap residue plus mod-4 signs, then the control set must
include prime-modulus random predecessor and composite predecessor worlds.
Here both controls absorb the real curve.

Next hallucination should either use a genuinely non-reciprocal object
or intentionally target the remaining CA/XA micro-lead with deeper,
same-resolution path generation. Avoid Legendre-symbol bridges unless the
pre-registered factor check predicts a control that must fail.

## HANDOFF 61

Status: no critical-line survivor. Cycle 62 tested the moving quadratic
predecessor bridge `(p/q)` over consecutive primes. It broke cleanly:
through `4,000,000`, real `maxAbs/sqrt=1.133216` and `theta=0.372494`,
fully inside Cramer/Jacobi, random-prime predecessor, and composite
predecessor controls.

New code since the previous handoff:

- `scripts/quadratic-predecessor-bridge-audit.mjs`

New artifacts:

- `logs/playground-artifacts/quadratic-predecessor-bridge-4000000.md`
- `logs/playground-artifacts/quadratic-predecessor-bridge-4000000.json`
- `logs/playground-artifacts/quadratic-predecessor-bridge-4000000.svg`
- `logs/playground-artifacts/quadratic-predecessor-bridge-4000000.svg.png`
- `logs/playground-artifacts/quadratic-predecessor-gapresidue-proxy-200k.png`

No LAB primitive was added in Cycle 62.

Next cycle suggestion:

Do not keep trying Legendre-symbol bridges unless the factor check is
strictly stronger than "moving modulus". A better next invention is either
non-reciprocal arithmetic transport, or deeper CA/XA same-resolution path
generation focused only on `N+^k N-^k` cluster balance.

## Cycle 63 — base-2 Euler quotient phase bridge

### HALLUCINATE

Guess:

Leave quadratic characters entirely. For any odd `n` define the base-2
Euler quotient

`EQ_2(n) = ((2^phi(n)-1)/n) mod n`,

computed equivalently from `2^phi(n) mod n^2`. For primes this is the
Fermat quotient `q_p(2) mod p`. Score each prime label by the phase

`z_p = exp(2*pi*i*EQ_2(p)/p)`,

and track the bridge

`R(Y)=|sum_{p<=Y} z_p|/sqrt(pi(Y)-1)`.

Why it could be a line:

This is not a gap statistic, not a fixed AP character, and not a
Chebyshev/Mertens cumulative transform. It asks whether prime labels have
extra equidistribution in the nonlinear multiplicative lift from mod `p`
to mod `p^2`. If the missing regularity lives in higher congruence layers
rather than in ordinary residue classes, the prime Fermat-quotient phases
might cancel more tightly than density-matched fake labels, W210 fake
labels, random phases, and composite Euler-quotient labels.

Preregistered confirmation:

Real `R(Y)` stays flat or decreases across growing `Y`; real endpoint and
block values separate downward from at least five random-phase controls,
five Cramer-label controls, five W210-label controls, and five composite
Euler-quotient controls. Composite labels such as `25`, `35`, and `77`
must not reproduce the same bridge. A survivor also needs base holdout
(`3`, `5`) and a derivation or conjectural expert pack.

Preregistered break:

real lies inside controls; the apparent line is just ordinary
Fermat/Euler-quotient equidistribution; composites reproduce the scale;
base `2` is a one-base artifact; or the construction collapses into a
known modular distribution problem rather than prime residual regularity.

### SEE IT

New LAB primitive:

`eulerq(n,b)=((b^phi(n)-1)/n) mod n`, defined when `gcd(b,n)=1`;
for prime `n=p`, this is the Fermat quotient `q_p(b) mod p`.

Audit command:

`node scripts/eulerq-phase-bridge-audit.mjs 1000000 logs/playground-artifacts`

Artifacts:

- `logs/playground-artifacts/eulerq-phase-bridge-1000000.md`
- `logs/playground-artifacts/eulerq-phase-bridge-1000000.json`
- `logs/playground-artifacts/eulerq-phase-bridge-1000000.svg`
- `logs/playground-artifacts/eulerq-phase-bridge-1000000.svg.png`

LAB phase command:

`node scripts/explore.mjs eval '{"domain":"prime","N":200000,"ex":"pi(n)","ey":"eulerq(n,2)/n"}'`

Metrics:
`linearity=0.0001933107`, `flatness=0.574840`,
`finiteFrac=0.999944`, `yMin=0`, `yMax=0.999935`.

Shots:

- `logs/playground-artifacts/eulerq-phase-scatter-200k.png`
- `logs/playground-artifacts/eulerq-phase-residue-surface-200k.png`

Picture read:
the audit SVG shows the real cyan bridge threading the control bundle. The
LAB phase shots compress to a dense horizontal band; no visible striping or
line survives the raw phase view.

### GROUND

Endpoint trace:

| N | count | real terminal/sqrt | real max/sqrt | random phase max/sqrt | Cramer max/sqrt | W210 max/sqrt | composite max/sqrt |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 62500 | 6274 | 0.622576 | 0.797969 | 0.769351..1.633251 | 0.554081..1.082200 | 0.490283..1.479835 | 0.671238..1.194713 |
| 125000 | 11733 | 0.760952 | 1.131153 | 0.864864..1.759192 | 0.625163..1.150007 | 0.705611..1.917100 | 0.911779..1.192504 |
| 250000 | 22043 | 1.254296 | 1.500294 | 0.832835..1.336947 | 0.838001..1.568945 | 0.723408..2.189204 | 0.754871..1.417248 |
| 500000 | 41537 | 0.291695 | 1.166445 | 0.606704..1.633831 | 1.082562..1.552773 | 0.743033..1.604782 | 0.540599..1.122984 |
| 1000000 | 78497 | 0.279583 | 0.848507 | 0.681549..1.739726 | 1.027797..1.583906 | 0.623876..1.166718 | 0.840627..1.675023 |

Block normalized values:

| block | count | real | random phase | Cramer | W210 | composite |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| (1, 62500] | 6274 | 0.622576 | 0.769351..1.542294 | 0.340297..0.858920 | 0.324826..1.308577 | 0.395260..1.194713 |
| (62500, 125000] | 5459 | 1.019882 | 0.354449..1.531316 | 0.575666..1.021076 | 0.389960..1.713490 | 0.361968..0.879146 |
| (125000, 250000] | 10310 | 1.207643 | 0.514017..1.366736 | 0.555564..1.728229 | 0.293200..1.442259 | 0.468231..1.618358 |
| (250000, 500000] | 19494 | 1.510745 | 0.116883..1.576218 | 0.779086..1.910823 | 0.320950..1.603596 | 0.262350..1.131558 |
| (500000, 1000000] | 36960 | 0.225344 | 0.669512..1.487488 | 0.593237..1.581942 | 0.431002..1.393154 | 0.422625..1.323969 |

Summary:

- endpoint real terminal/sqrt `0.279583`
- endpoint real max/sqrt `0.848507`
- real maxMag theta `0.477861`
- endpoint random-phase max/sqrt range `0.681549..1.739726`
- endpoint Cramer max/sqrt range `1.027797..1.583906`
- endpoint W210 max/sqrt range `0.623876..1.166718`
- endpoint composite max/sqrt range `0.840627..1.675023`

Named composite check:

| n | EQ_2(n) | phase x | phase y |
| ---: | ---: | ---: | ---: |
| 25 | 18 | -0.187381 | -0.982287 |
| 35 | 24 | -0.393025 | -0.919528 |
| 77 | 75 | 0.986712 | -0.162476 |

Factor check:
the construction does not telescope to `psi`, `theta`, or `M`, but it is a
standard modular quotient distribution problem. The bridge has main term
zero under uniform phase. A prime-specific claim therefore needs real
prime phases to beat random phases and composite Euler-quotient phases,
not just look low at one endpoint.

### BREAK

Verdict: graveyard.

How it broke:

1. The endpoint real max bridge is ordinary sqrt-scale:
   `max/sqrt=0.848507`, with `theta=0.477861`.
2. Real does not separate from the calibrated controls. At endpoint it is
   inside random phases, W210 labels, and composite Euler-quotient labels;
   it is only lower than this particular five-seed Cramer range.
3. The attractive small terminal endpoint `0.279583` is not admissible
   evidence. Terminal displacement was not the registered effect, is
   endpoint-sensitive, and the earlier endpoints/blocks swing high:
   `1.254296` terminal/sqrt at `250000` and block `1.510745` on
   `(250000,500000]`.
4. Composite labels do not fail. The endpoint composite range is
   `0.840627..1.675023`, and the real value `0.848507` barely sits inside
   it. Named composites `25`, `35`, and `77` have perfectly valid
   base-2 Euler quotient phases.
5. The raw LAB surface has no visible line; it is a dense phase band with
   flatness about `0.575`.

STATUS: `GRAVEYARD / EULER-QUOTIENT PHASE EQUIDISTRIBUTION NOISE`.

CONNECTION: this successfully left the Legendre/reciprocity trap from
Cycle 62, but landed in the broader modular-equidistribution trap. The
new control lesson is that composite Euler quotients are mandatory for
Fermat-quotient claims, just as composite predecessors were mandatory for
moving Legendre-symbol claims.

### LEARN

Non-reciprocal is not enough either. A higher congruence lift modulo
`p^2` can be genuinely different from gap residues and still fail because
the measured object is an ordinary phase-equidistribution walk. The next
guess should use the Euler quotient only if it conditions on a specific
known obstruction, such as Wieferich-type rare events, and has a
non-endpoint stability statistic.

The new `eulerq` LAB chip is still useful as a future probe, but the base-2
phase bridge itself is closed.

## HANDOFF 62

Status: no critical-line survivor. Cycle 63 tested a non-reciprocal
base-2 Euler/Fermat quotient phase bridge. It broke as modular quotient
equidistribution noise: through `1,000,000`, real `max/sqrt=0.848507`,
`theta=0.477861`, inside random-phase, W210-label, and composite
Euler-quotient controls.

New code since the previous handoff:

- LAB primitive `eulerq(n,b)` in `src/core/math.js` and
  `src/core/engine.js`
- tests in `tests/math.test.js` and `tests/engine.test.js`
- audit script `scripts/eulerq-phase-bridge-audit.mjs`
- `MACHINE_HOW_TO_USE.md` function list updated for `eulerq`

New artifacts:

- `logs/playground-artifacts/eulerq-phase-bridge-1000000.md`
- `logs/playground-artifacts/eulerq-phase-bridge-1000000.json`
- `logs/playground-artifacts/eulerq-phase-bridge-1000000.svg`
- `logs/playground-artifacts/eulerq-phase-bridge-1000000.svg.png`
- `logs/playground-artifacts/eulerq-phase-scatter-200k.png`
- `logs/playground-artifacts/eulerq-phase-residue-surface-200k.png`

Next cycle suggestion:

Avoid broad phase-equidistribution walks unless a named obstruction is
conditioned in advance. A sharper next move is either a rare-event
Euler-quotient audit (Wieferich-style, with base holdouts and composite
controls) or a return to the CA/XA cluster micro-lead with deeper
same-resolution path generation.

## Cycle 64 — near-Wieferich Euler-quotient tail bridge

### HALLUCINATE

Guess:

Keep the new `eulerq` chip, but stop averaging the full phase circle. For
odd labels `n`, define the folded base-2 Euler quotient distance

`d_2(n)=min(EQ_2(n), n-EQ_2(n))`.

A label is a near-Wieferich tail hit if

`d_2(n) <= sqrt(n)`.

For primes this asks whether the Fermat quotient `q_p(2)` is unusually
close to `0 mod p`, a softened version of the Wieferich obstruction. Build
the bridge

`T(Y)=sum_{p<=Y}(1_{d_2(p)<=sqrt(p)} - 2/sqrt(p))`,

and normalize by

`sqrt(sum_{p<=Y} (2/sqrt(p))*(1-2/sqrt(p)))`.

Why it could be a line:

Cycle 63 killed the broad Euler-quotient phase walk as ordinary modular
equidistribution. Rare near-zero quotient events are a named obstruction
layer rather than the whole phase circle. If prime regularity suppresses or
stabilizes Wieferich-tail events, the integrated tail residual might stay
flatter for primes than for random quotient labels, density-matched fake
labels, W210 fake labels, and composite Euler-quotient labels.

Preregistered confirmation:

Real normalized bridge and max bridge stay flat or decrease across growing
range; block-normalized values remain stable; real separates from at least
five random-uniform quotient controls, five Cramer-label controls, five
W210-label controls, and five composite Euler-quotient controls. Base
holdouts `3` and `5` must show compatible behavior, not a base-2 accident.

Preregistered break:

real lies inside controls; endpoint looks good but blocks swing; composite
Euler quotients reproduce the tail; base holdouts disagree; or the object is
just the small-window tail of ordinary Euler-quotient equidistribution.

### SEE IT

Audit command:

`node scripts/eulerq-tail-bridge-audit.mjs 2000000 logs/playground-artifacts`

Artifacts:

- `logs/playground-artifacts/eulerq-tail-bridge-2000000.md`
- `logs/playground-artifacts/eulerq-tail-bridge-2000000.json`
- `logs/playground-artifacts/eulerq-tail-bridge-2000000.svg`
- `logs/playground-artifacts/eulerq-tail-bridge-2000000.svg.png`

LAB tail command:

`node scripts/explore.mjs eval '{"domain":"prime","N":200000,"ex":"pi(n)","ey":"min(eulerq(n,2),n-eulerq(n,2))/sqrt(n)"}'`

Metrics:
`linearity=0.268293`, `flatness=0.729830`, `finiteFrac=0.999944`,
`yMin=0`, `yMax=222.262861`.

Shot:
`logs/playground-artifacts/eulerq-tail-scaled-scatter-200k.png`.

Picture read:
the audit SVG shows the real cyan max-residual bridge decreasing quietly
inside the control bundle. The raw LAB tail-scaled quotient view is a dense
expanding band with no visible exceptional geometry.

### GROUND

Endpoint trace:

| N | count | hits | expected | real z | real max/sqrtVar | random quotient max | Cramer max | W210 max | composite max |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 125000 | 11733 | 158 | 151.323747 | 0.558766 | 1.367094 | 0.836847..1.480354 | 0.591910..1.455023 | 0.541838..1.605418 | 0.661891..1.603861 |
| 250000 | 22043 | 201 | 199.712357 | 0.093190 | 1.182161 | 0.723643..1.280100 | 0.681785..1.256581 | 0.468261..1.785717 | 0.540864..1.306599 |
| 500000 | 41537 | 271 | 264.397749 | 0.413135 | 1.022119 | 0.625675..1.838777 | 0.597717..1.475898 | 0.404208..1.585393 | 0.844460..1.620530 |
| 1000000 | 78497 | 346 | 351.134488 | -0.277674 | 0.883364 | 0.556661..1.589159 | 0.905472..1.313407 | 0.367729..1.693127 | 0.881440..1.841099 |
| 2000000 | 148932 | 466 | 468.003614 | -0.093562 | 0.762760 | 0.525060..1.457870 | 0.806962..1.728474 | 0.473269..1.583984 | 0.727234..1.650175 |

Block normalized residuals:

| block | count | hits | expected | real | random quotient | Cramer | W210 | composite |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| (1, 125000] | 11733 | 158 | 151.323747 | 0.558766 | -0.529264..1.479407 | -0.305858..1.071978 | -1.172049..1.126577 | -0.073920..1.346734 |
| (125000, 250000] | 10310 | 43 | 48.388610 | -0.776492 | -1.496986..-0.200097 | -0.461044..1.409662 | -1.861370..0.378879 | -1.009549..0.414951 |
| (250000, 500000] | 19494 | 70 | 64.685392 | 0.661907 | -0.708086..0.412818 | -1.085740..1.410856 | 0.678310..2.267833 | -0.381940..1.416783 |
| (500000, 1000000] | 36960 | 75 | 86.736739 | -1.261715 | -0.724208..1.318317 | -1.390757..0.873946 | -0.884447..-0.249884 | -0.904799..0.952594 |
| (1000000, 2000000] | 70435 | 120 | 116.869127 | 0.289854 | -1.191416..1.123069 | -0.898859..1.799606 | -0.524147..1.493529 | -0.652885..1.273839 |

Base holdouts:

| base | hits | expected | z | max/sqrtVar | theta |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 3 | 437 | 467.003614 | -1.401072 | 1.758605 | 0.273645 |
| 5 | 438 | 467.109187 | -1.359445 | 1.472925 | 0.383980 |

Named composite check:

| n | EQ_2(n) | folded | folded/sqrt(n) | hit |
| ---: | ---: | ---: | ---: | ---: |
| 25 | 18 | 7.000000 | 1.400000 | 0 |
| 35 | 24 | 11.000000 | 1.859339 | 0 |
| 77 | 75 | 2.000000 | 0.227921 | 1 |

Summary:

- endpoint real hits `466`, expected `468.003614`
- endpoint real residual z `-0.093562`
- endpoint real max/sqrtVar `0.762760`
- real max residual theta `0.000000` over this range because the max was
  reached early and never grew
- endpoint random-quotient max/sqrtVar range `0.525060..1.457870`
- endpoint Cramer max/sqrtVar range `0.806962..1.728474`
- endpoint W210 max/sqrtVar range `0.473269..1.583984`
- endpoint composite max/sqrtVar range `0.727234..1.650175`

Factor check:
the main term is exactly the uniform-quotient tail probability
`2/sqrt(n)`, with variance `p_n(1-p_n)`. This is an integrated modular
tail distribution test. A prime-specific claim needs separation after this
subtraction from uniform quotient and composite Euler-quotient controls.
It does not separate.

### BREAK

Verdict: graveyard.

How it broke:

1. The real endpoint is almost exactly the uniform quotient main term:
   `466` hits vs expected `468.003614`, residual z `-0.093562`.
2. The registered max bridge is not separated. Real endpoint
   `0.762760` is inside random quotient, W210, and composite control
   ranges, and slightly below only this Cramer five-seed range.
3. Block stability fails as a prime-specific signature. Real blocks swing
   from `0.661907` to `-1.261715` and all swings are matched by at least
   one calibrated control family.
4. Composite Euler quotients do not fail. Named composite `77` is a direct
   tail hit, and composite controls cover real at endpoint.
5. Base holdouts do not rescue the effect: bases `3` and `5` are just
   ordinary negative z fluctuations (`-1.401072`, `-1.359445`) with max
   bridges inside the broader null scale.

STATUS: `GRAVEYARD / WIEFERICH-TAIL MODULAR EQUIDISTRIBUTION`.

CONNECTION: this is the rare-event repair of Cycle 63. It confirms the
lesson rather than reversing it: conditioning on a named obstruction gives
a cleaner main term, but the result remains a uniform Euler-quotient tail,
not prime residual regularity.

### LEARN

Rare-event conditioning helped methodology: it gave an integrated main term
and variance instead of a vague phase cloud. But the event itself was still
too broad. Future Euler-quotient work needs a structure stronger than
`distance <= sqrt(p)`, such as exact Wieferich events or correlations with
another independently motivated arithmetic obstruction. Otherwise it is
just a binomial tail over a modular quotient.

The next cycle should probably leave Euler quotients again, or use them
only in a two-condition statistic where both conditions are preregistered
and individually controlled.

## HANDOFF 63

Status: no critical-line survivor. Cycle 64 tested the rare-event repair
of the Euler-quotient phase bridge: near-Wieferich tail hits
`min(EQ_2(p),p-EQ_2(p)) <= sqrt(p)`, residualized against the integrated
uniform main term `2/sqrt(p)`. It broke cleanly as modular tail
equidistribution: through `2,000,000`, real had `466` hits versus expected
`468.003614`, residual z `-0.093562`, max/sqrtVar `0.762760`, inside
random-quotient, W210, and composite controls.

New code since the previous handoff:

- `scripts/eulerq-tail-bridge-audit.mjs`

New artifacts:

- `logs/playground-artifacts/eulerq-tail-bridge-2000000.md`
- `logs/playground-artifacts/eulerq-tail-bridge-2000000.json`
- `logs/playground-artifacts/eulerq-tail-bridge-2000000.svg`
- `logs/playground-artifacts/eulerq-tail-bridge-2000000.svg.png`
- `logs/playground-artifacts/eulerq-tail-scaled-scatter-200k.png`

No new LAB primitive was added in Cycle 64.

Next cycle suggestion:

Leave broad Euler quotient statistics. A better next guess is either a
two-condition obstruction statistic with an independent second condition,
or a pivot back to non-Euler structure: CA/XA deeper same-resolution
cluster generation, or a coordinate-free graph statistic over prime gaps
that is not reducible to local admissibility.

## Cycle 65 — ordinal normalized-gap extrema bridge

### HALLUCINATE

Guess:

Leave Euler quotients. For consecutive prime gaps

`z_i = (p_{i+1}-p_i)/log(p_i)`,

score the middle gap in each triple by its ordinal shape:

`E_i = 1` if `z_i` is a strict local extremum of
`(z_{i-1}, z_i, z_{i+1})`, else `0`.

Build the bridge

`O(Y)=sum_{p_{i+1}<=Y}(E_i - 2/3)`,

and normalize by `sqrt(triple_count)`. The `2/3` main term is the iid
continuous ordinal value: in a random triple, the middle point is max or
min with probability `2/3`.

Why it could be a line:

This is coordinate-free gap geometry: it forgets gap sizes except their
local order. It does not telescope to `theta/psi`, does not name residue
classes, and does not use a fixed character or quotient. If prime gaps
have a rigid short-range alternation law beyond local admissibility, the
extrema residual could make a flat bridge whose effect size is stable
against Cramer labels, W210 fake labels, composite labels, and shuffled
real-gap controls.

Preregistered confirmation:

Real normalized residual and max bridge stay flat or decrease across
growing range; block residuals remain stable; real separates from at least
five Cramer-label controls, five W210-label controls, five composite-label
controls, and five shuffled-real-gap controls. A survivor must also pass a
factor check showing it is not just the known adjacent normalized gap
anti-correlation or residue-transition layer.

Preregistered break:

real lies inside controls; shuffled real gaps reproduce it; W210 or Cramer
labels reproduce it; composite controls do not fail; the signal is just
the ordinal form of adjacent-gap anti-correlation; or a transition-matched
residue model explains the extrema excess.

### SEE IT

Audit command:

`node scripts/ordinal-gap-extrema-audit.mjs 4000000 logs/playground-artifacts`

Artifacts:

- `logs/playground-artifacts/ordinal-gap-extrema-4000000.md`
- `logs/playground-artifacts/ordinal-gap-extrema-4000000.json`
- `logs/playground-artifacts/ordinal-gap-extrema-4000000.svg`
- `logs/playground-artifacts/ordinal-gap-extrema-4000000.svg.png`

LAB proxy command:

`node scripts/explore.mjs eval '{"domain":"prime","N":200000,"ex":"pi(n)","ey":"gap(n)/log(n)"}'`

Metrics:
`linearity=0.0000124330`, `flatness=0.770652`,
`finiteFrac=1`, `yMin=0`, `yMax=7.192377`.

Shot:
`logs/playground-artifacts/ordinal-gap-extrema-normalized-gap-proxy-200k.png`.

Picture read:
the audit SVG shows a genuine late real peel-away in cyan. The raw LAB
normalized-gap shot is only a dense gap-size band; the effect appears after
ordinalizing local triples, not as a visible line in raw gap coordinates.

### GROUND

Endpoint trace:

| N | triples | hits | rate | real z | real max/sqrt | shuffled max | Cramer max | W210 max | composite max |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 250000 | 22040 | 14737 | 0.668648 | 0.294133 | 0.496210 | 0.244737..0.893626 | 0.333920..0.833314 | 0.431865..0.723132 | 0.355461..1.486912 |
| 500000 | 41534 | 27755 | 0.668248 | 0.322213 | 0.379459 | 0.354925..0.816164 | 0.271281..0.908966 | 0.314970..0.762788 | 0.481015..1.796097 |
| 1000000 | 78494 | 52516 | 0.669045 | 0.666267 | 0.756689 | 0.325995..0.659129 | 0.226412..0.787257 | 0.294492..0.665962 | 0.431376..1.662151 |
| 2000000 | 148929 | 99833 | 0.670340 | 1.417417 | 1.451104 | 0.302313..0.656452 | 0.280213..0.713840 | 0.289127..0.994072 | 0.736751..1.721855 |
| 4000000 | 283142 | 189885 | 0.670635 | 2.111715 | 2.122991 | 0.384005..0.568804 | 0.280275..0.954825 | 0.418858..0.724963 | 0.603883..1.784086 |

Block normalized residuals:

| block | triples | hits | rate | real | shuffled | Cramer | W210 | composite |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| (1, 250000] | 22040 | 14737 | 0.668648 | 0.294133 | -0.716248..0.577040 | -0.219611..0.686921 | -0.680304..0.053703 | -0.254425..1.345935 |
| (250000, 500000] | 19494 | 13018 | 0.667795 | 0.157570 | -0.057298..0.558656 | -0.356389..0.563309 | -0.232959..0.449226 | -0.058933..1.020935 |
| (500000, 1000000] | 36960 | 24761 | 0.669940 | 0.629389 | -0.712614..0.176853 | -0.370912..0.209717 | -0.401820..0.479765 | 0.121419..0.803835 |
| (1000000, 2000000] | 70435 | 47317 | 0.671782 | 1.357720 | -0.349164..0.280085 | -0.628649..0.412086 | -0.866876..0.722202 | 0.136736..0.966170 |
| (2000000, 4000000] | 134213 | 90052 | 0.670963 | 1.574083 | -0.276602..0.102816 | -0.577164..0.654426 | -0.157367..0.794824 | 0.119930..0.831463 |

Summary:

- endpoint real extrema rate `0.670635` vs iid `2/3`
- endpoint real normalized residual `2.111715`
- endpoint real max/sqrt `2.122991`
- real max residual theta `1.073375`
- endpoint shuffled-gap max/sqrt range `0.384005..0.568804`
- endpoint Cramer max/sqrt range `0.280275..0.954825`
- endpoint W210 max/sqrt range `0.418858..0.724963`
- endpoint composite max/sqrt range `0.603883..1.784086`

Same-range adjacent-product factor check:

`node scripts/gapac1mean-audit.mjs 4000000 logs/playground-artifacts`

Real adjacent centered normalized gap product at `4,000,000`:
`mean=-0.03392586`, `se=0.00124005`, `z=-27.358`.

Factor identity:

`E_i = 1` exactly when the consecutive first differences
`z_i-z_{i-1}` and `z_{i+1}-z_i` have opposite signs.

So this object is a sign-change/ordinal transform of short-range
gap anti-persistence. It does not telescope to `theta/psi`, but it is
not independent of the already logged adjacent-gap anti-correlation branch.

### BREAK

Verdict: graveyard, despite a real signal.

How it broke:

1. The real signal is genuine at this scale: endpoint z `2.111715`, real
   extrema rate `0.670635`, and basic controls are lower.
2. But the factor check is decisive. The statistic is exactly the sign
   alternation rate of consecutive normalized-gap increments. That is the
   ordinal form of adjacent-gap anti-persistence.
3. The same range has the known adjacent normalized gap-product line:
   `gapac1mean=-0.03392586`, z `-27.358`. A sequence with negative
   adjacent gap correlation naturally creates excess local extrema.
4. Prior transition audits already classified the adjacent gap-product
   layer as local consecutive-residue transition structure, not a new
   critical line.
5. The late growth and `theta>1` are a warning, not a survivor: the iid
   `2/3` main term is underfit once prime adjacent-gap anti-correlation is
   present. The right main term would condition on transition structure,
   which puts the object back into the known gapac1 funnel.

STATUS: `GRAVEYARD / ORDINAL ADJACENT-GAP ANTI-PERSISTENCE`.

CONNECTION: this is the coordinate-free ordinal sibling of the
`gapac1mean` and transition-matched adjacent gap product entries. It
successfully found a real prime-specific local-gap signal, but not a new
route: the mechanism is the same consecutive-prime gap anti-correlation /
residue-transition layer.

### LEARN

Coordinate-free ordinalizing can reveal real arithmetic structure that
Cramer and W210 controls underfit. That is useful. But "coordinate-free"
does not mean "mechanism-free": local extrema are just sign changes of
successive gap increments, so they inherit adjacent-gap anti-correlation.

Next gap-shape attempts must subtract or condition on adjacent transition
structure before claiming residual regularity. A better next try would be
an ordinal statistic at lag `2` or higher after conditioning on the first
two gap transitions, or a non-gap object entirely.

## HANDOFF 64

Status: no critical-line survivor. Cycle 65 tested ordinal extrema of
normalized prime gaps. It found a real signal through `4,000,000`
(`rate=0.670635` vs iid `2/3`, normalized residual `2.111715`), outside
basic Cramer/W210/shuffle controls, but the factor check broke it:
`E_i` is exactly sign alternation of consecutive normalized-gap increments,
and the same range has known adjacent gap anti-correlation
`gapac1mean=-0.03392586` with z `-27.358`.

New code since the previous handoff:

- `scripts/ordinal-gap-extrema-audit.mjs`

New artifacts:

- `logs/playground-artifacts/ordinal-gap-extrema-4000000.md`
- `logs/playground-artifacts/ordinal-gap-extrema-4000000.json`
- `logs/playground-artifacts/ordinal-gap-extrema-4000000.svg`
- `logs/playground-artifacts/ordinal-gap-extrema-4000000.svg.png`
- `logs/playground-artifacts/ordinal-gap-extrema-normalized-gap-proxy-200k.png`
- factor-check artifact from existing script:
  `logs/playground-artifacts/gapac1mean-audit-4000000.md`

No new LAB primitive was added in Cycle 65.

Next cycle suggestion:

Do not treat ordinal gap-shape excess as new unless it is conditioned
against adjacent transition structure. Either build a higher-lag ordinal
residual after subtracting first-lag transition effects, or pivot to a
non-gap statistic with a stronger null.

## Cycle 66 — shifted Mobius twin-neighborhood parity bridge

### HALLUCINATE

Guess:

Leave gaps and Euler quotients. For each odd prime `p`, score the symmetric
shifted-Mobius neighborhood

`X(p) = mu(p-1) * mu(p+1)`.

Build

`S(Y)=sum_{p<=Y} X(p)`,

and normalize by `sqrt(nonzero_count)`. The function-field analogue over
`F_q[t]`, `q` odd, scores irreducibles `f` by

`X_q(f)=mu(f-1) * mu(f+1)`

inside each degree shell.

Why it could be a line:

This is not a prime-counting residual, not a gap statistic, and not a
fixed residue character. It asks whether primes sit between two shifted
squarefree/parity worlds in a balanced way. The two-universe angle is the
reason to try it: Chowla-type independence is theorem-grade over function
fields, so a shared sqrt bridge or a clean divergence would be informative.

Preregistered confirmation:

Integer real `max |S|/sqrt(nonzero)` stays flat or decreasing across range,
beats five Cramer-label controls, five W210-label controls, five
composite-label controls, and five sign-shuffle controls. Function-field
shell sums over `F_3[t]` and `F_5[t]` show compatible sqrt-scale behavior
by degree, not a contradictory drift. Composite labels must not reproduce
the same bridge.

Preregistered break:

real lies inside controls; composite labels reproduce it; zero/nonzero
rates drive the signal; function-field shells diverge; the object is just
shifted-squarefree local Euler-product bias; or the cumulative sum is a
disguised Mobius-subsequence/Mertens relabel rather than prime-specific
regularity.

### SEE IT

Commands:

```sh
node --check scripts/shifted-mobius-neighborhood-audit.mjs
node scripts/shifted-mobius-neighborhood-audit.mjs 500000 logs/playground-artifacts
node scripts/explore.mjs eval '{"domain":"prime","N":200000,"ex":"pi(n)","ey":"mu(n-1)*mu(n+1)"}'
node scripts/explore.mjs shot '{"domain":"prime","N":200000,"ex":"pi(n)","ey":"mu(n-1)*mu(n+1)"}' logs/playground-artifacts/shifted-mobius-neighborhood-lab-200k.png
qlmanage -t -s 1400 -o logs/playground-artifacts logs/playground-artifacts/shifted-mobius-neighborhood-500000.svg
```

LAB eval at `N=200000`:

```json
{"n":17984,"finiteFrac":1,"linearity":0.00016680567139282736,"slope":1.855045277945144e-8,"intercept":-0.00022241992882562276,"flatness":134.10070601300902,"zeroCrossings":0,"monotonicity":1,"yMin":-1,"yMax":0}
```

The LAB picture is visually a flat horizontal band. The lone nonzero point
is the exceptional prime `2`, where `mu(1)*mu(3)=-1`; it does not belong to
the odd-prime bridge.

Audit artifacts:

- `logs/playground-artifacts/shifted-mobius-neighborhood-500000.md`
- `logs/playground-artifacts/shifted-mobius-neighborhood-500000.json`
- `logs/playground-artifacts/shifted-mobius-neighborhood-500000.svg`
- `logs/playground-artifacts/shifted-mobius-neighborhood-500000.svg.png`
- `logs/playground-artifacts/shifted-mobius-neighborhood-lab-200k.png`

### GROUND IT

Integer endpoint at `500000`:

```json
{"N":500000,"count":41537,"nonzero":0,"zero":41537,"sum":0,"normalized":0,"maxAbs":0,"maxAbsNormalized":0,"nonzeroRate":0}
```

Every integer control family also has endpoint `maxAbsNormalized=0` and
`nonzeroRate=0`: sign-shuffle, Cramer labels, W210 labels, and odd
composite labels. Fitted residual exponent is undefined because the whole
integer path is zero.

Function-field check is nonzero at the matched top shells:

```json
[
  {"q":3,"degree":12,"primeCount":44220,"primeNonzero":11800,"primeSum":152,"primeNormalized":1.3992734192054515},
  {"q":5,"degree":8,"primeCount":48750,"primeNonzero":27710,"primeSum":-70,"primeNormalized":-0.42051333960272}
]
```

That is a divergence, but not the useful kind: the integer universe has a
forced mod-4 squarefactor obstruction that odd-characteristic polynomial
rings do not share.

### BREAK

Status: `GRAVEYARD / TRIVIAL MOD-4 SQUAREFACTOR ZERO`.

Exact factor check:

For every odd integer `n`, the two neighbors `n-1` and `n+1` are
consecutive even integers. Exactly one is divisible by `4`. Therefore one
neighbor has a square factor, so one Mobius value is `0`, and

`mu(n-1) * mu(n+1) = 0`.

This proves the bridge is identically zero for every odd prime, and also
for every odd-label control. It is a sharp flat line, but it encodes no
prime regularity. It does not even reach the Cramer question; it dies at a
local parity obstruction.

The function-field side did exactly what a good mismatch detector should
do. In odd characteristic, `f-1` and `f+1` are not adjacent even integers
and are not forced to contain a repeated factor. Their nonzero shell sums
therefore certify that the naive two-universe statistic mixed incompatible
local universes.

### LEARN

This was a useful anti-pigeonhole break. Leaving gaps and Cramer-density
ideas was possible, but the replacement statistic must first pass a local
obstruction audit: shifts around odd integer primes carry unavoidable
`2`-adic structure that has no direct odd-characteristic analogue.

Next hallucination should either:

- remove the forced `2`-adic squarefactor before applying Mobius, then
  subtract the correct local Euler-product main term; or
- use a shift pair whose local obstruction is explicitly matched across
  the integer and function-field universes.

The stronger rule: a two-universe bridge must match local completions
before comparing global cancellation.

## HANDOFF 65

Status: no critical-line survivor. Cycle 66 tested
`X(p)=mu(p-1)mu(p+1)` as a non-gap, non-Euler, two-universe
shifted-Mobius bridge. It broke exactly: for every odd prime `p`, one of
`p-1` and `p+1` is divisible by `4`, so `X(p)=0`. Integer controls also
vanish; odd-characteristic function-field shells are nonzero because they
do not share the integer mod-4 obstruction.

New code since the previous handoff:

- `scripts/shifted-mobius-neighborhood-audit.mjs`

New artifacts:

- `logs/playground-artifacts/shifted-mobius-neighborhood-500000.md`
- `logs/playground-artifacts/shifted-mobius-neighborhood-500000.json`
- `logs/playground-artifacts/shifted-mobius-neighborhood-500000.svg`
- `logs/playground-artifacts/shifted-mobius-neighborhood-500000.svg.png`
- `logs/playground-artifacts/shifted-mobius-neighborhood-lab-200k.png`

No new LAB primitive was added in Cycle 66.

Next cycle suggestion:

Try a locally matched version rather than a density model: strip the forced
`2`-part from `p-1` and `p+1`, score the odd squarefree kernels, and compare
against odd-label composite controls plus an explicitly matched
function-field local model. Pre-register the local main term before looking.

## Cycle 67 — odd-kernel shifted Mobius neighborhood bridge

### HALLUCINATE

Guess:

Repair Cycle 66 by deleting the exact obstruction before Mobius sees it.
For odd labels `n`, define

`oddpart(m)=m/2^v2(m)`,

then score

`X(n)=mu(oddpart(n-1)) * mu(oddpart(n+1))`.

For primes:

`S(Y)=sum_{3<=p<=Y} X(p)`.

The function-field comparison keeps the odd-characteristic score

`X_q(f)=mu(f-1) * mu(f+1)`,

because there is no integer `2`-adic squarefactor to strip in
`F_q[t]`, `q` odd.

Why it could be a line:

This keeps the creative two-neighbor Mobius idea but removes the known
mod-4 trap. If primes really sit between two independently squarefree odd
kernels, the cumulative bridge should have square-root scale. A stronger
win would be arithmetic suppression: real primes have a materially smaller
`max |S|/sqrt(count)` than matched W210/composite/sign-shuffle controls,
mirroring the earlier "real residual smaller than fake" template without
being a prime-counting residual.

Pre-registered main term:

Use zero as the global main term. The local Euler product for the signed
two-shift Mobius score has divergent `1-4/l+O(1/l^2)`-type factors over
odd primes, so the expected signed mean should decay rather than settle to
a nonzero constant. The audit must still report finite-range small-prime
block bias; if a small modulus explains the path, this breaks.

Preregistered confirmation:

Across `N`, real `max |S|/sqrt(count)` is stable or decreasing and lies
below five sign-shuffle, five Cramer-label, five W210-label, and five
odd-composite controls. Block-normalized values stay inside sqrt scale.
Function-field shell sums over `F_3[t]` and `F_5[t]` show compatible
sqrt-scale behavior, not a structural mismatch.

Preregistered break:

Controls reproduce the scale; composite labels reproduce the effect; the
path is driven by small-prime residues such as forced `p mod 3`; the
centered version after conditioning on local residue classes disappears;
the statistic is just ordinary two-shift Chowla/Mobius subsequence noise;
or the function-field side diverges for a local reason rather than a global
prime-regularity reason.

### SEE IT

Commands:

```sh
node --check scripts/odd-kernel-mobius-neighborhood-audit.mjs
npx vitest run tests/math.test.js tests/engine.test.js --testTimeout=30000
node scripts/explore.mjs eval '{"domain":"prime","N":200000,"ex":"pi(n)","ey":"mu(oddpart(n-1))*mu(oddpart(n+1))"}'
node scripts/odd-kernel-mobius-neighborhood-audit.mjs 4000000 logs/playground-artifacts
node scripts/odd-kernel-mobius-neighborhood-audit.mjs 8000000 logs/playground-artifacts
node scripts/explore.mjs shot '{"domain":"prime","N":200000,"ex":"pi(n)","ey":"mu(oddpart(n-1))*mu(oddpart(n+1))"}' logs/playground-artifacts/odd-kernel-mobius-neighborhood-lab-200k.png
qlmanage -t -s 1400 -o logs/playground-artifacts logs/playground-artifacts/odd-kernel-mobius-neighborhood-8000000.svg
```

LAB eval at `N=200000`:

```json
{"n":17984,"finiteFrac":1,"linearity":0.00004638063258215129,"slope":-9.612132238458903e-7,"intercept":0.004084101374508902,"flatness":1.3646966018014395,"zeroCrossings":4845,"monotonicity":0.005,"yMin":-1,"yMax":1}
```

The LAB picture is the expected dense three-value band `{-1,0,1}`, not a
line by itself. The cumulative audit SVG is the relevant view.

Audit artifacts:

- `logs/playground-artifacts/odd-kernel-mobius-neighborhood-8000000.md`
- `logs/playground-artifacts/odd-kernel-mobius-neighborhood-8000000.json`
- `logs/playground-artifacts/odd-kernel-mobius-neighborhood-8000000.svg`
- `logs/playground-artifacts/odd-kernel-mobius-neighborhood-8000000.svg.png`
- `logs/playground-artifacts/odd-kernel-mobius-neighborhood-lab-200k.png`

### GROUND IT

Endpoint at `8,000,000`:

```json
{"N":8000000,"count":539776,"nonzero":288802,"sum":-808,"normalized":-1.0997768545087072,"maxAbs":973,"maxAbsNormalized":1.3243599993031834,"nonzeroRate":0.5350404612283614}
```

The effect weakened from the intermediate `4,000,000` endpoint:

```json
{"N":4000000,"count":283145,"nonzero":151498,"sum":-744,"normalized":-1.3981973899640063,"maxAbs":824,"maxAbsNormalized":1.54854119533648}
```

Control ranges at `8,000,000`:

| control | endpoint max/sqrt range |
| --- | ---: |
| sign shuffle | `1.110666..1.543499` |
| Cramer labels | `0.809932..1.206662` |
| W210 labels | `0.760923..1.215481` |
| odd composites | `0.604333..1.406027` |
| local composites matched mod `3^2*5^2*7^2` | `0.502250..1.525804` |

So real `1.324360` lies inside sign-shuffle, odd-composite, and
local-composite controls. It is only mildly above the five Cramer/W210
seeds, which is not enough because the stronger controls absorb it.

Small-prime local-only diagnostics show why centering by finite local
factors is dangerous but not a rescue:

| local primes | endpoint normalized | max/sqrt | corr(full, local) |
| --- | ---: | ---: | ---: |
| `3` | `-489.798144` | `489.798144` | `0.001458` |
| `3*5` | `-49.381070` | `49.382431` | `0.000544` |
| `3*5*7` | `-18.953456` | `18.954817` | `0.001969` |

The raw finite local factors have enormous deterministic bias, but the
full Mobius score is almost uncorrelated with these local-only scores once
all remaining odd factors are included. The surviving path is just a
sqrt-scale signed walk.

Function-field top shells remain sqrt-scale:

```json
[
  {"q":3,"degree":12,"primeCount":44220,"primeNonzero":11800,"primeSum":152,"primeNormalized":0.7228267541453949},
  {"q":5,"degree":8,"primeCount":48750,"primeNonzero":27710,"primeSum":-70,"primeNormalized":-0.31703756956048684}
]
```

### BREAK

Status: `GRAVEYARD / ODD-KERNEL TWO-SHIFT MOBIUS NOISE`.

This candidate successfully escaped the Cycle 66 mod-4 zero, but it did
not become a critical line. The real path has ordinary square-root scale,
is not stable as an effect size, and is reproduced by controls that keep
either the exact value multiset (sign shuffle) or the same small
squarefactor residue environment (local composites modulo `11025`).

The factor check does not collapse the object to `psi`, `M`, or prime
counting. Instead it collapses to a two-shift Mobius/Chowla-style
subsequence statistic with finite local biases and no prime-specific
ordering signal. The function-field values are compatible with sqrt-scale
noise, but they do not rescue the integer object because there is no
separation to explain.

### LEARN

The user's warning about Cramer pigeonholing was right in spirit: Cramer
alone underfit this statistic. But the stronger lesson is not "ignore
controls"; it is "invent non-density controls." A local-residue composite
control was the right breaker here. It lets the candidate leave old
prime-counting structures while still grounding the arithmetic environment
that the new object lives in.

Next hallucination should stop looking at two neighboring shifts as a
signed product. A better creative jump is to build an intrinsic operator
on the local residue environment itself: for each prime, treat the vector
of squarefree statuses of `p+h` for a small admissible cloud of shifts
`h` as a state, then look for a low-rank transport invariant across
successive primes. That could connect the real arithmetic residual theme
without falling back to a one-dimensional Mobius walk.

## HANDOFF 66

Status: no critical-line survivor. Cycle 67 repaired Cycle 66 by adding
`oddpart(n)` and testing
`X(p)=mu(oddpart(p-1))mu(oddpart(p+1))`. The algebraic zero vanished, but
the cumulative bridge through `8,000,000` stayed inside stronger controls:
real `max/sqrt=1.324360`, sign-shuffle range `1.110666..1.543499`,
odd-composite range `0.604333..1.406027`, and local-residue composite
range `0.502250..1.525804`.

New code since the previous handoff:

- `oddpart(n)` LAB primitive via `oddPartValue` in `src/core/math.js` and
  `src/core/engine.js`
- tests in `tests/math.test.js` and `tests/engine.test.js`
- `scripts/odd-kernel-mobius-neighborhood-audit.mjs`

New artifacts:

- `logs/playground-artifacts/odd-kernel-mobius-neighborhood-4000000.md`
- `logs/playground-artifacts/odd-kernel-mobius-neighborhood-4000000.json`
- `logs/playground-artifacts/odd-kernel-mobius-neighborhood-4000000.svg`
- `logs/playground-artifacts/odd-kernel-mobius-neighborhood-8000000.md`
- `logs/playground-artifacts/odd-kernel-mobius-neighborhood-8000000.json`
- `logs/playground-artifacts/odd-kernel-mobius-neighborhood-8000000.svg`
- `logs/playground-artifacts/odd-kernel-mobius-neighborhood-8000000.svg.png`
- `logs/playground-artifacts/odd-kernel-mobius-neighborhood-lab-200k.png`

Next cycle suggestion:

Hallucinate an operator, not another scalar product. Use a small admissible
shift cloud around each prime, encode squarefree/rough/local-residue states
coordinate-free, and audit whether transport from one prime to the next
has a low-rank residual that beats local-residue composite controls.

## Cycle 68 — squarefree cloud transition operator

### HALLUCINATE

Guess:

Stop multiplying two neighbors into one scalar. For each odd label `n`,
build the signed squarefree cloud

`v(n) = (mu(oddpart(n+h)))_{h in H}`,

with

`H={-10,-8,-4,-2,2,4,8,10}`.

For consecutive primes `p_i,p_{i+1}`, accumulate the centered lag-1
transport operator

`A(Y)=sum_{p_{i+1}<=Y} (v(p_i)-mean_prev)(v(p_{i+1})-mean_next)^T`.

The proposed line is

`r(Y)=||A(Y)||_op / sqrt(pair_count)`.

Why it could be a line:

This is not a prime count, not a gap scalar, and not another two-shift
Mobius product. It asks whether the prime successor map transports the
local squarefree environment with a hidden low-rank rule. If the real
prime order has arithmetic regularity, `r(Y)` could be stably suppressed
or elevated relative to row-shuffled states and local-residue matched
composite sequences. A heatmap of the endpoint matrix should reveal a
coherent signed pattern if there is a real operator.

Pre-registered confirmation:

Across growing endpoints, real `r(Y)` is stable and separated from five
row-shuffle controls, five Cramer-label controls, five W210-label controls,
five odd-composite controls, and five local-residue composite controls
matched modulo `3^2*5^2*7^2`. The endpoint heatmap has a coherent
low-rank pattern that controls do not reproduce. A one-coordinate LAB proxy
must show nontrivial variation rather than a forced line.

Pre-registered break:

Real lies inside row-shuffle or local-residue controls; the endpoint
heatmap has no coherent pattern; the apparent operator is just adjacent
gap/order artifact; the statistic reduces to finite local squarefactor
bias; or the candidate has no coordinate-free function-field analogue
except unordered shell state covariance.

### SEE IT

Commands:

```sh
node --check scripts/squarefree-cloud-transition-operator-audit.mjs
node scripts/explore.mjs eval '{"domain":"prime","N":200000,"ex":"pi(n)","ey":"mu(oddpart(n-10))+2*mu(oddpart(n-8))+3*mu(oddpart(n-4))+4*mu(oddpart(n-2))+5*mu(oddpart(n+2))+6*mu(oddpart(n+4))+7*mu(oddpart(n+8))+8*mu(oddpart(n+10))"}'
node scripts/squarefree-cloud-transition-operator-audit.mjs 8000000 logs/playground-artifacts
node scripts/explore.mjs shot '{"domain":"prime","N":200000,"ex":"pi(n)","ey":"mu(oddpart(n-10))+2*mu(oddpart(n-8))+3*mu(oddpart(n-4))+4*mu(oddpart(n-2))+5*mu(oddpart(n+2))+6*mu(oddpart(n+4))+7*mu(oddpart(n+8))+8*mu(oddpart(n+10))"}' logs/playground-artifacts/squarefree-cloud-transition-operator-lab-200k.png
qlmanage -t -s 1400 -o logs/playground-artifacts logs/playground-artifacts/squarefree-cloud-transition-operator-8000000.svg
```

LAB proxy eval at `N=200000`:

```json
{"n":17984,"finiteFrac":1,"linearity":0.00023166197135551987,"slope":-0.00003623533295283194,"intercept":0.35081286858901733,"flatness":1.23326769114994,"zeroCrossings":6753,"monotonicity":0.004123711340206186,"yMin":-33,"yMax":33}
```

The LAB proxy encodes the eight-coordinate state into one integer-valued
band; it verifies nontrivial local variation but is not the candidate line.
The candidate line is the cumulative operator norm rendered in the audit
SVG.

Artifacts:

- `logs/playground-artifacts/squarefree-cloud-transition-operator-8000000.md`
- `logs/playground-artifacts/squarefree-cloud-transition-operator-8000000.json`
- `logs/playground-artifacts/squarefree-cloud-transition-operator-8000000.svg`
- `logs/playground-artifacts/squarefree-cloud-transition-operator-8000000.svg.png`
- `logs/playground-artifacts/squarefree-cloud-transition-operator-lab-200k.png`

### GROUND IT

Endpoint at `8,000,000`:

```json
{"N":8000000,"pairCount":539771,"opNormalized":276.0265726911701,"frobeniusNormalized":330.00784792328625,"theta":0.8825457561346782}
```

Endpoint control ranges:

| control | op/sqrt range |
| --- | ---: |
| row shuffle | `3.172272..4.172398` |
| Cramer labels | `222.844506..225.821964` |
| W210 labels | `217.862613..220.515233` |
| odd composites | `228.035157..230.183584` |
| local-residue composites | `3.401160..4.049893` |

At first glance this looked promising: real is much larger than Cramer,
W210, and ordinary composites, while row-shuffle/local-composite controls
drop to noise. The endpoint matrix exposed why:

```text
large entries sit almost entirely below the diagonal, where h_prev - h_next
equals a realized prime gap.
```

Exact shifted-overlap diagnostic:

```json
{"supportEntries":28,"supportFrobeniusShare":0.9998771469473092,"matrixOverlapCorrelation":0.8703066815271522}
```

Top exact-overlap rows:

| previous h | next h | gap | overlap pairs | nonzero overlaps/sqrt | matrix entry |
| ---: | ---: | ---: | ---: | ---: | ---: |
| `2` | `-2` | `4` | `48286` | `38.213339` | `109.810287` |
| `4` | `-4` | `8` | `34751` | `28.115218` | `99.797052` |
| `-4` | `-10` | `6` | `82317` | `87.777027` | `86.840780` |
| `10` | `4` | `6` | `82317` | `87.734833` | `86.471609` |
| `2` | `-4` | `6` | `82317` | `80.926529` | `86.387163` |

Coordinate-free function-field shell check used unordered state covariance
only, not lexicographic transitions. Top shells:

```json
[
  {"q":3,"degree":12,"count":44220,"meanNorm":0.008151408133930641,"covarianceOp":0.5514199248631154},
  {"q":5,"degree":8,"count":48750,"meanNorm":0.03310676451532588,"covarianceOp":0.7862887353311245}
]
```

There is no coordinate-free function-field successor map matching the
integer prime-gap overlap mechanism.

### BREAK

Status: `GRAVEYARD / SHIFTED-OVERLAP GAP OPERATOR`.

The operator signal is large and visually coherent, but not a new critical
line. If `p_{i+1}=p_i+g` and `h_prev=g+h_next`, then

`p_i + h_prev = p_{i+1} + h_next`.

So those matrix entries multiply the same shifted integer by itself:

`mu(oddpart(m))^2`.

That is a squarefree indicator, not hidden transport. The endpoint matrix
is therefore dominated by the prime gap distribution projected onto the
chosen shift-difference set. The real curve exceeds Cramer/W210/composite
because the real adjacent-gap spectrum differs from those controls, but
`99.9877%` of the Frobenius mass lives on exact-overlap support. The
candidate collapses to a gap-overlap identity.

### LEARN

Operator hallucinations are valuable, but shift clouds around consecutive
primes have a new mandatory factor check: remove exact overlaps
`p_i+h = p_{i+1}+k` before interpreting any lag-1 matrix. Otherwise the
operator is mostly a disguised gap histogram weighted by squarefreeness.

Next cycle should use non-overlapping clouds by construction, for example:
compare states at `p_i+h` and `p_{i+1}+k` only when
`h-k` is outside the observed small-gap support, or explicitly project out
the overlap subspace and audit the residual operator. That residual, not
the raw transport matrix, is the next honest object.

## HANDOFF 67

Status: no critical-line survivor. Cycle 68 tested a squarefree-cloud
transition operator with shifts `[-10,-8,-4,-2,2,4,8,10]`. It produced a
huge real endpoint `op/sqrt=276.026573` through `8,000,000`, but broke by
exact shifted-overlap factor check: when `p_{i+1}=p_i+g` and
`h_prev=g+h_next`, the matrix entry reuses the same shifted integer.
`99.9877%` of the endpoint Frobenius mass lies on this exact-overlap
support.

New code since the previous handoff:

- `scripts/squarefree-cloud-transition-operator-audit.mjs`

New artifacts:

- `logs/playground-artifacts/squarefree-cloud-transition-operator-8000000.md`
- `logs/playground-artifacts/squarefree-cloud-transition-operator-8000000.json`
- `logs/playground-artifacts/squarefree-cloud-transition-operator-8000000.svg`
- `logs/playground-artifacts/squarefree-cloud-transition-operator-8000000.svg.png`
- `logs/playground-artifacts/squarefree-cloud-transition-operator-lab-200k.png`

No new LAB primitive was added in Cycle 68.

Next cycle suggestion:

Project out exact shift-overlap entries from the cloud transition matrix,
then audit the residual operator against row-shuffle, Cramer/W210,
ordinary composites, and local-residue composites. Pre-register that a
survivor must keep a coherent heatmap after the overlap support is zeroed.

## Cycle 69 — overlap-projected squarefree cloud residual operator

### HALLUCINATE

Guess:

Take the Cycle 68 operator seriously, but remove the thing that killed it.
Use the same signed squarefree cloud

`v(n)=(mu(oddpart(n+h)))` for `H={-10,-8,-4,-2,2,4,8,10}`,

but for a consecutive-label pair `a<b` with gap `g=b-a`, exclude matrix
entry `(h_i,h_j)` whenever

`h_i - h_j = g`.

Those are exactly the entries where `a+h_i=b+h_j`, so they are the
overlap-squarefree identity. For every remaining entry, accumulate a
centered entrywise covariance over its allowed pairs. The proposed line is

`r(Y)=||B(Y)||_op / sqrt(pair_count)`,

where `B` is the overlap-projected residual matrix.

Why it could be a line:

Cycle 68 proved the raw operator was too close to the gap spectrum. The
projected residual asks whether there is anything left after the gap
overlap identity is surgically removed. A survivor would be more credible:
it would be an operator-valued local-environment transport residual, not a
prime-counting line and not a one-coordinate Mobius walk.

Pre-registered confirmation:

Across growing endpoints, real projected `op/sqrt` is stable and separated
from five row-shuffle, five Cramer-label, five W210-label, five
odd-composite, and five local-residue composite controls. The endpoint
heatmap retains coherent off-overlap structure. The removed-overlap audit
must report that the exact-overlap support contributes zero by
construction.

Pre-registered break:

Real falls into row-shuffle or local-residue controls; the residual heatmap
is noise; Cramer/W210/composite reproduce the effect; the signal collapses
to adjacent-gap anti-persistence or a finite local residue transition; or
the projection removes essentially all structure and leaves only ordinary
sqrt-scale matrix noise.

### SEE IT

Commands:

```sh
node --check scripts/overlap-projected-cloud-operator-audit.mjs
node scripts/explore.mjs eval '{"domain":"prime","N":200000,"ex":"pi(n)","ey":"mu(oddpart(n-10))+2*mu(oddpart(n-8))+3*mu(oddpart(n-4))+4*mu(oddpart(n-2))+5*mu(oddpart(n+2))+6*mu(oddpart(n+4))+7*mu(oddpart(n+8))+8*mu(oddpart(n+10))"}'
node scripts/overlap-projected-cloud-operator-audit.mjs 8000000 logs/playground-artifacts
node scripts/explore.mjs shot '{"domain":"prime","N":200000,"ex":"pi(n)","ey":"mu(oddpart(n-10))+2*mu(oddpart(n-8))+3*mu(oddpart(n-4))+4*mu(oddpart(n-2))+5*mu(oddpart(n+2))+6*mu(oddpart(n+4))+7*mu(oddpart(n+8))+8*mu(oddpart(n+10))"}' logs/playground-artifacts/overlap-projected-cloud-operator-lab-200k.png
qlmanage -t -s 1400 -o logs/playground-artifacts logs/playground-artifacts/overlap-projected-cloud-operator-8000000.svg
```

LAB proxy eval at `N=200000`:

```json
{"n":17984,"finiteFrac":1,"linearity":0.00023166197135551987,"slope":-0.00003623533295283194,"intercept":0.35081286858901733,"flatness":1.23326769114994,"zeroCrossings":6753,"monotonicity":0.004123711340206186,"yMin":-33,"yMax":33}
```

As in Cycle 68, the LAB proxy is just a compressed state band. The audit
SVG and endpoint matrix are the relevant views.

Artifacts:

- `logs/playground-artifacts/overlap-projected-cloud-operator-8000000.md`
- `logs/playground-artifacts/overlap-projected-cloud-operator-8000000.json`
- `logs/playground-artifacts/overlap-projected-cloud-operator-8000000.svg`
- `logs/playground-artifacts/overlap-projected-cloud-operator-8000000.svg.png`
- `logs/playground-artifacts/overlap-projected-cloud-operator-lab-200k.png`

### GROUND IT

Endpoint after exact-overlap projection at `8,000,000`:

```json
{"N":8000000,"pairCount":539771,"opNormalized":78.29216838540947,"frobeniusNormalized":134.72255539334515,"skippedPerPair":2.607872597823892,"theta":0.8479749147854159}
```

Endpoint control ranges:

| control | op/sqrt range |
| --- | ---: |
| row shuffle | `3.137134..4.213223` |
| Cramer labels | `3.110493..3.860462` |
| W210 labels | `3.061837..3.636226` |
| odd composites | `14.235542..15.368696` |
| local-residue composites | `3.516561..3.743411` |

So exact projection alone made the candidate look stronger than every
registered control. The factor check then widened from exact overlap to
near-overlap distance

`delta = gap - (h_prev - h_next)`.

Near-overlap/radius ladder:

| excluded radius `R` in `|delta|<=R` | endpoint op/sqrt | frob/sqrt | skipped entries / pair |
| ---: | ---: | ---: | ---: |
| `0` | `78.292168` | `134.722555` | `2.607873` |
| `2` | `77.251092` | `110.865270` | `7.542021` |
| `4` | `66.552427` | `82.508501` | `12.514822` |
| `6` | `64.955193` | `82.207835` | `17.678441` |
| `10` | `4.058764` | `5.561637` | `26.681496` |
| `20` | `1.778456` | `2.991120` | `44.771221` |

The decisive line is `R=10`: once all comparisons of shifted integers
within distance `10` are excluded, the endpoint `op/sqrt=4.058764` falls
inside the row-shuffle endpoint range `3.137134..4.213223`.

Function-field shell covariance remains calibration-only:

```json
[
  {"q":3,"degree":12,"count":44220,"meanNorm":0.008151408133930641,"covarianceOp":0.5514199248631154},
  {"q":5,"degree":8,"count":48750,"meanNorm":0.03310676451532588,"covarianceOp":0.7862887353311245}
]
```

There is still no coordinate-free function-field successor analogue for
the integer local-gap-neighborhood operator.

### BREAK

Status: `GRAVEYARD / NEAR-OVERLAP GAP-NEIGHBORHOOD KERNEL`.

The exact-overlap projection removed the Cycle 68 identity, but the
remaining matrix was still dominated by pairs where

`p_{i+1}+h_next` is very close to `p_i+h_prev`.

This is not hidden transport of squarefree environments. It is a local
gap-neighborhood kernel: the prime gap spectrum selects small distances
between shifted integers, and Mobius-squarefree correlations at those
small distances inflate the operator. When distances up to `10` are
projected out, the effect drops to row-shuffle scale.

This candidate therefore breaks as a widened version of Cycle 68's
overlap mechanism: exact identity was only the first layer; near identity
carried the residual.

### LEARN

The honest projected object must not merely remove `delta=0`; it must
define a forbidden local distance band before seeing the data. For this
shift cloud, the band must extend at least to `|delta|<=10`, otherwise the
operator is still a small-gap local geometry detector.

Next hallucination should either:

- pre-register a nonlocal cloud with all cross-prime shifted distances
  bounded away from the small-gap range; or
- switch away from consecutive-prime transitions and compare unordered
  local-environment distributions in moving windows, where no pair can
  reuse or nearly reuse the same shifted integers.

## HANDOFF 68

Status: no critical-line survivor. Cycle 69 tested the exact
overlap-projected squarefree-cloud residual operator. Exact projection
looked promising: real endpoint `op/sqrt=78.292168` through `8,000,000`,
above row-shuffle, Cramer, W210, composite, and local-residue controls.
But the radius ladder broke it: after excluding all cross-shift comparisons
with `|delta|<=10`, the endpoint fell to `op/sqrt=4.058764`, inside the
row-shuffle range `3.137134..4.213223`.

New code since the previous handoff:

- `scripts/overlap-projected-cloud-operator-audit.mjs`

New artifacts:

- `logs/playground-artifacts/overlap-projected-cloud-operator-8000000.md`
- `logs/playground-artifacts/overlap-projected-cloud-operator-8000000.json`
- `logs/playground-artifacts/overlap-projected-cloud-operator-8000000.svg`
- `logs/playground-artifacts/overlap-projected-cloud-operator-8000000.svg.png`
- `logs/playground-artifacts/overlap-projected-cloud-operator-lab-200k.png`

No new LAB primitive was added in Cycle 69.

Next cycle suggestion:

Stop using adjacent-prime shift clouds unless a forbidden distance band is
pre-registered. Try a nonlocal, coordinate-free window statistic: compare
the distribution of local squarefree-state types in prime-centered windows
to local-residue-matched composite-centered windows, and search for a
cumulative transport-free residual.

## Cycle 70 — prime-centered squarefree window Walsh spectrum

### HALLUCINATE

Guess:

Abandon consecutive-prime transitions entirely. For each odd center `n`,
build the symmetric nonlocal squarefree cloud

`v(n)=(mu(oddpart(n+h)))`

over

`H={-30,-22,-14,-6,6,14,22,30}`.

Convert the cloud to a Walsh feature vector consisting of all one- and
two-coordinate products:

`phi_i(n)=v_i(n)` and `phi_{ij}(n)=v_i(n)v_j(n)`.

The proposed line is the local-residue-centered feature residual

`R(Y)=||sum_{p<=Y} phi(p) - E_local[sum phi(c)]||_2 / sqrt(pi(Y))`,

where `E_local` is estimated from five composite-center controls matched
to each prime center modulo `3^2*5^2*7^2`.

Why it could be a line:

This is coordinate-free enough for the current tool: it compares the
distribution of local squarefree states around prime centers, not the
order of consecutive primes. It cannot reuse shifted integers across a
prime gap because no adjacent-prime transition is used. A survivor would
look like a stable flat spectral residual, ideally smaller than matched
composite controls in the same arithmetic-residual spirit as the earlier
real-vs-Cramer sqrt cancellation.

Pre-registered confirmation:

Across endpoints, real `R(Y)` is stable or decreasing and lies outside the
five local-residue composite controls, five ordinary odd-composite
controls, five Cramer-label controls, and five W210-label controls. The
largest Walsh coordinates are not just single forced local factors, and
the function-field unordered shell Walsh spectrum is compatible with
sqrt-scale behavior.

Pre-registered break:

Real lies inside matched controls; ordinary composites reproduce the
effect; the largest coordinates are one-coordinate squarefree biases;
residue-class conditioning removes the signal; the statistic is just a
local Euler-product squarefree-density mismatch; or sparsity/feature-count
inflates an ordinary high-dimensional norm.

### SEE IT

Commands:

```sh
node --check scripts/squarefree-window-walsh-spectrum-audit.mjs
node scripts/explore.mjs eval '{"domain":"prime","N":200000,"ex":"pi(n)","ey":"mu(oddpart(n-30))+2*mu(oddpart(n-22))+3*mu(oddpart(n-14))+4*mu(oddpart(n-6))+5*mu(oddpart(n+6))+6*mu(oddpart(n+14))+7*mu(oddpart(n+22))+8*mu(oddpart(n+30))"}'
node scripts/squarefree-window-walsh-spectrum-audit.mjs 8000000 logs/playground-artifacts
qlmanage -t -s 1400 -o logs/playground-artifacts logs/playground-artifacts/squarefree-window-walsh-spectrum-8000000.svg
node scripts/explore.mjs shot '{"domain":"prime","N":200000,"ex":"pi(n)","ey":"mu(oddpart(n-30))+2*mu(oddpart(n-22))+3*mu(oddpart(n-14))+4*mu(oddpart(n-6))+5*mu(oddpart(n+6))+6*mu(oddpart(n+14))+7*mu(oddpart(n+22))+8*mu(oddpart(n+30))"}' logs/playground-artifacts/squarefree-window-walsh-spectrum-lab-200k.png
```

LAB proxy eval at `N=200000`:

```json
{"n":17984,"finiteFrac":1,"linearity":0.00001039589919558766,"slope":0.000008194543628613959,"intercept":-0.0784158570678555,"flatness":1.2288918792182526,"zeroCrossings":7716,"monotonicity":-0.002746623941405356,"yMin":-36,"yMax":36}
```

The LAB proxy is visually a narrow state band, not a line. The audit SVG
is the meaningful view: the real cyan curve is visible near the upper part
of the bundle, but it does not leave the widened control envelope.

Artifacts:

- `logs/playground-artifacts/squarefree-window-walsh-spectrum-8000000.md`
- `logs/playground-artifacts/squarefree-window-walsh-spectrum-8000000.json`
- `logs/playground-artifacts/squarefree-window-walsh-spectrum-8000000.svg`
- `logs/playground-artifacts/squarefree-window-walsh-spectrum-8000000.svg.png`
- `logs/playground-artifacts/squarefree-window-walsh-spectrum-lab-200k.png`

### GROUND IT

The final audit used fifteen seeds for every randomized/control family,
upgrading the preregistered five-seed control check before the verdict.
Endpoint at `8,000,000`:

```json
{"N":8000000,"count":539766,"residualNormalized":5.917250957531697,"rawNormalized":4.989003889554681,"thetaResidual":0.4396618899283848}
```

Endpoint control ranges:

| control | residual/sqrt range |
| --- | ---: |
| Cramer labels | `3.956465..6.693396` |
| W210 labels | `4.060671..6.657885` |
| composites | `3.395444..5.036039` |
| local-residue composites | `4.470062..6.206311` |

The real endpoint is above ordinary composites, but inside Cramer, W210,
and local-residue composite controls. The growing-range trace is also not
separating:

| N | centers | real residual/sqrt | local-composite residual/sqrt |
| ---: | ---: | ---: | ---: |
| `500000` | `41528` | `5.826384` | `4.457128..6.093739` |
| `1000000` | `78488` | `6.571486` | `3.690738..6.716319` |
| `2000000` | `148923` | `6.170647` | `3.834753..5.886894` |
| `4000000` | `283136` | `5.435951` | `4.647743..6.263783` |
| `8000000` | `539766` | `5.917251` | `4.470062..6.206311` |

Top endpoint residual features:

| feature | kind | value/sqrt | raw value/sqrt |
| --- | --- | ---: | ---: |
| `-6` | one | `2.328790` | `1.407401` |
| `-30*22` | two | `1.845229` | `1.118843` |
| `-14*22` | two | `-1.765920` | `-1.780348` |
| `6*14` | two | `-1.753126` | `-1.053509` |
| `-30*6` | two | `-1.417019` | `-0.065334` |
| `-14*-6` | two | `-1.384443` | `-1.234538` |
| `-22` | one | `-1.365660` | `-1.045342` |
| `-30*14` | two | `1.246062` | `0.503615` |

Function-field unordered shell checks are calibration, not rescue. The
largest checked shells were `F_3[t]` degree `12`, norm/sqrt `1.860295`,
and `F_5[t]` degree `8`, norm/sqrt `9.497584`. The `F_5` value confirms
that raw feature norms can be large under different local shell
distributions.

### BREAK

Status: `GRAVEYARD / WINDOW WALSH NORM CONTROL-NOISE`.

The candidate successfully left the old consecutive-prime overlap funnel:
there is no cross-prime shifted-integer reuse, so the exact/near-overlap
gap-kernel factor check from Cycles 68-69 is unavailable.

It still fails the audit gate. After local-residue centering, the real
Walsh residual norm is inside the fifteen-seed Cramer, W210, and
local-composite ranges. The top coordinates are ordinary one- and
two-feature imbalances scattered through the 36-dimensional vector, with
no coherent full-window law. The endpoint exponent `theta=0.439662` is
sqrt-ish, but the effect size is a high-dimensional norm that controls can
also generate.

This is not a critical line. It is a useful non-overlap graveyard: raw
`L2` over many Walsh coordinates inflates ordinary residual noise unless
the covariance and multiple-testing geometry are controlled.

### LEARN

Window-distribution statistics are still a better creative route than
adjacent-prime transport, because they avoid the gap-neighborhood kernel
outright. But the next version must not use an unwhitened norm as the
headline. It should either whiten by the matched-composite covariance
before taking a norm, or pre-register a small number of intrinsic features
and audit their maximum standardized coordinate with a holdout/FDR rule.

The "Cramer theorem" worry was valid in spirit: plain Cramer is not the
only breaker. Here the stronger local composite controls, plus W210 and
Cramer label controls, show that the apparent line is not prime-specific
enough.

## HANDOFF 69

Status: no critical-line survivor. Cycle 70 tested a nonlocal
prime-centered squarefree window Walsh spectrum over shifts
`{-30,-22,-14,-6,6,14,22,30}`. It avoided the previous overlap mechanism,
but broke as raw high-dimensional norm noise: at `8,000,000`, real
residual/sqrt was `5.917251`, inside Cramer `3.956465..6.693396`, W210
`4.060671..6.657885`, and local-residue composite
`4.470062..6.206311` controls. Residual exponent was `theta=0.439662`.

New code since the previous handoff:

- `scripts/squarefree-window-walsh-spectrum-audit.mjs`

New artifacts:

- `logs/playground-artifacts/squarefree-window-walsh-spectrum-8000000.md`
- `logs/playground-artifacts/squarefree-window-walsh-spectrum-8000000.json`
- `logs/playground-artifacts/squarefree-window-walsh-spectrum-8000000.svg`
- `logs/playground-artifacts/squarefree-window-walsh-spectrum-8000000.svg.png`
- `logs/playground-artifacts/squarefree-window-walsh-spectrum-lab-200k.png`

No new LAB primitive was added in Cycle 70.

Next cycle suggestion:

Keep the transport-free window idea, but replace raw `L2` by a locally
whitened matched-composite covariance statistic. Pre-register the null as
`Z(Y)=C_local^{-1/2}(sum_p phi(p)-mean_local)` and audit both the
whitened norm and the maximum standardized coordinate with seed holdouts.
If that also collapses, shrink the feature family to a few intrinsic
coordinates before looking at data.

## Cycle 71 — locally whitened window Walsh residual

### HALLUCINATE

Guess:

Repair Cycle 70 by treating the 36 Walsh coordinates as a correlated
feature system instead of a Euclidean vector. Keep the same prime-centered
squarefree window

`v(n)=(mu(oddpart(n+h)))`

over

`H={-30,-22,-14,-6,6,14,22,30}`,

and the same one- and two-coordinate Walsh features `phi`. Estimate the
local null from matched composite centers with the same residue as each
prime center modulo `3^2*5^2*7^2`. On a training half of local-composite
seeds, compute mean `m(Y)` and covariance `C(Y)` for cumulative feature
sums. The proposed line is

`W(Y)=sqrt((S_p(Y)-m(Y))^T C(Y)^-1 (S_p(Y)-m(Y)))`,

plus the coordinate audit

`Zmax(Y)=max_i |S_p(Y)_i-m_i(Y)|/sqrt(C_ii(Y))`.

Why it could be a line:

Cycle 70 may have failed because raw `L2` counted ordinary covariance
directions as signal. If primes have a real, transport-free squarefree
window regularity, whitening should remove the local composite covariance
cloud and leave a stable low-dimensional deviation. This is a direct
answer to the user's Cramer concern: Cramer alone is not the breaker; the
object must beat local arithmetic covariance.

Pre-registered confirmation:

Across endpoints, real `W(Y)` or `Zmax(Y)` is stable and separated from
heldout local-composite seeds, ordinary composites, Cramer labels, and W210
labels. The top whitened coordinates must be coherent under endpoint
growth, not a rotating one-coordinate multiple-testing artifact. Composite
controls including named odd composites such as `25`, `35`, and `77` must
not reproduce the line.

Pre-registered break:

Real falls inside heldout local-composite, Cramer, or W210 controls; the
top coordinate rotates across endpoints; shrinkage choice controls the
verdict; ordinary composites or named odd composites reproduce the same
z-scale; or whitening reveals that Cycle 70 was just covariance-shaped
high-dimensional null noise.

### SEE IT

Commands:

```sh
node --check scripts/locally-whitened-window-walsh-audit.mjs
node scripts/explore.mjs eval '{"domain":"prime","N":200000,"ex":"pi(n)","ey":"mu(oddpart(n-30))+2*mu(oddpart(n-22))+3*mu(oddpart(n-14))+4*mu(oddpart(n-6))+5*mu(oddpart(n+6))+6*mu(oddpart(n+14))+7*mu(oddpart(n+22))+8*mu(oddpart(n+30))"}'
node scripts/locally-whitened-window-walsh-audit.mjs 8000000 logs/playground-artifacts
qlmanage -t -s 1400 -o logs/playground-artifacts logs/playground-artifacts/locally-whitened-window-walsh-8000000.svg
node scripts/explore.mjs shot '{"domain":"prime","N":200000,"ex":"pi(n)","ey":"mu(oddpart(n-30))+2*mu(oddpart(n-22))+3*mu(oddpart(n-14))+4*mu(oddpart(n-6))+5*mu(oddpart(n+6))+6*mu(oddpart(n+14))+7*mu(oddpart(n+22))+8*mu(oddpart(n+30))"}' logs/playground-artifacts/locally-whitened-window-walsh-lab-200k.png
```

LAB proxy eval at `N=200000`:

```json
{"n":17984,"finiteFrac":1,"linearity":0.00001039589919558766,"slope":0.000008194543628613959,"intercept":-0.0784158570678555,"flatness":1.2288918792182526,"zeroCrossings":7716,"monotonicity":-0.002746623941405356,"yMin":-36,"yMax":36}
```

The LAB proxy remains the same narrow state band from Cycle 70. The audit
SVG is decisive: the real cyan whitened path is stable, but it runs
through the middle of the heldout local-composite/Cramer/W210 bundle.

Artifacts:

- `logs/playground-artifacts/locally-whitened-window-walsh-8000000.md`
- `logs/playground-artifacts/locally-whitened-window-walsh-8000000.json`
- `logs/playground-artifacts/locally-whitened-window-walsh-8000000.svg`
- `logs/playground-artifacts/locally-whitened-window-walsh-8000000.svg.png`
- `logs/playground-artifacts/locally-whitened-window-walsh-lab-200k.png`

### GROUND IT

Whitening setup:

- same 36 one/two-coordinate Walsh features as Cycle 70;
- local modulus `11025`;
- 48 prime-prefix matched-composite training seeds;
- 15 heldout seeds for every control family;
- covariance shrinkage fixed before the run: off-diagonal factor `0.65`,
  ridge scale `1e-8` at every endpoint.

Endpoint at `8,000,000`:

```json
{"N":8000000,"count":539766,"whitenedNorm":7.505020559347008,"maxZ":2.3391117989322905,"maxFeature":"-30*22","thetaWhitened":0.007907151704094579,"thetaRawResidual":0.4990750079923748}
```

Endpoint control ranges:

| control | W range | Zmax range |
| --- | ---: | ---: |
| local holdout | `6.100177..7.725819` | `1.640417..3.071974` |
| Cramer labels | `5.942774..8.652724` | `1.547614..2.883696` |
| W210 labels | `4.785714..8.290173` | `1.614704..3.694394` |
| count-matched composites | `4.767471..7.099229` | `1.259035..2.953260` |

Endpoint trace:

| N | centers | real W | real Zmax | top feature | local-holdout W |
| ---: | ---: | ---: | ---: | --- | ---: |
| `500000` | `41528` | `7.007336` | `2.418316` | `-30` | `5.260995..9.015103` |
| `1000000` | `78488` | `7.065456` | `2.401466` | `-22*22` | `5.301479..9.447679` |
| `2000000` | `148923` | `6.504075` | `2.320315` | `-6` | `5.275701..8.157814` |
| `4000000` | `283136` | `6.506467` | `2.236238` | `-30*14` | `6.070857..8.671086` |
| `8000000` | `539766` | `7.505021` | `2.339112` | `-30*22` | `6.100177..7.725819` |

Top endpoint whitened coordinates:

| feature | kind | z |
| --- | --- | ---: |
| `-30*22` | two | `2.339112` |
| `-14*22` | two | `-2.219475` |
| `-14*-6` | two | `-1.912840` |
| `-6` | one | `1.778591` |
| `6*14` | two | `-1.680478` |
| `6*30` | two | `-1.558703` |
| `-30*14` | two | `1.511233` |
| `-22*-6` | two | `-1.484187` |

Named composite centers are not excluded by the object:

| n | prime? | state norm |
| ---: | --- | ---: |
| `25` | no | `5.291503` |
| `35` | no | `5.291503` |
| `77` | no | `4.582576` |

Function-field shell checks again stay calibration-only: `F_3[t]` degree
`12` gives norm/sqrt `1.860295`, and `F_5[t]` degree `8` gives
`9.497584`.

### BREAK

Status: `GRAVEYARD / WHITENED WALSH LOCAL-NULL NOISE`.

Whitening repaired the obvious Cycle 70 defect: the raw residual exponent
is `theta=0.499075`, while the whitened norm has essentially flat exponent
`theta=0.007907`. But that flat line is exactly the local-null geometry,
not prime-specific structure. The endpoint real value `W=7.505021` lies
inside the heldout local-composite range `6.100177..7.725819`, and also
inside Cramer and W210 controls. The max-coordinate statistic also fails:
real `Zmax=2.339112` is inside every registered control family.

The top feature rotates across endpoints (`-30`, `-22*22`, `-6`,
`-30*14`, `-30*22`), which matches the multiple-testing artifact
pre-registered in the break gate. This is not a hidden squarefree-window
law; it is a properly whitened 36-dimensional null cloud.

### LEARN

The user's warning about overusing Cramer was right, but the stronger
lesson is sharper: even after replacing Cramer by a local arithmetic
covariance null, this branch has no remaining prime-specific separation.
The squarefree Walsh-window route now has two independent failures:
unwhitened `L2` is inflated, and whitened `L2` is an ordinary heldout-null
flat line.

Next hallucination should leave this structure behind, not just tune it.
Use a new intrinsic object with fewer degrees of freedom, preferably one
that compares primes to composites through a mechanism other than local
squarefree windows: e.g. a prime-centered "recovery debt" after deleting
small-prime residue classes, or a function-field-first statistic whose
integer analogue is defined only after the finite-field law is fixed.

## HANDOFF 70

Status: no critical-line survivor. Cycle 71 tested the direct repair of
Cycle 70: a locally whitened 36-coordinate squarefree-window Walsh
residual. It used 48 matched-composite training seeds and 15 heldout seeds.
The whitened norm became beautifully flat (`thetaW=0.007907`), but broke
because it was flat for the null too: at `8,000,000`, real `W=7.505021`
was inside heldout local composites `6.100177..7.725819`, Cramer
`5.942774..8.652724`, and W210 `4.785714..8.290173`; real
`Zmax=2.339112` was also inside controls.

New code since the previous handoff:

- `scripts/locally-whitened-window-walsh-audit.mjs`

New artifacts:

- `logs/playground-artifacts/locally-whitened-window-walsh-8000000.md`
- `logs/playground-artifacts/locally-whitened-window-walsh-8000000.json`
- `logs/playground-artifacts/locally-whitened-window-walsh-8000000.svg`
- `logs/playground-artifacts/locally-whitened-window-walsh-8000000.svg.png`
- `logs/playground-artifacts/locally-whitened-window-walsh-lab-200k.png`

No new LAB primitive was added in Cycle 71.

Next cycle suggestion:

Stop repairing the squarefree Walsh window. Try a bolder object with a
small, fixed feature dimension: prime-centered recovery debt after sieving
out small-prime residue obstructions, or a function-field-first statistic
whose finite-field theorem/identity is specified before the integer
analogue is measured. The gate should still include local composites, W210
labels, Cramer labels, and named composite centers.

## Cycle 72 — primorial recovery-debt rank line

### HALLUCINATE

Guess:

Leave squarefree windows entirely. Fix the small-sieve modulus

`W=2*3*5*7*11*13=30030`.

For a center `n` coprime to `W`, call an offset `h>0` recovered if
`gcd(n+h,W)=1`. For consecutive labels `a<b`, define

`rank_W(a,b)=#{m: a<m<=b and gcd(m,W)=1}`.

For primes, `b` is the next prime. The local small-sieve random model says
that among `W`-coprime candidates near `a`, the chance of being prime is

`q(a)=W/(phi(W)*log(a))`,

so the expected recovered rank to the next prime is `1/q(a)` and the
geometric variance is `(1-q(a))/q(a)^2`. The proposed line is the
standardized cumulative recovery debt

`D(Y)=sum_{p_i<=Y}(rank_W(p_i,p_{i+1})-1/q(p_i)) / sqrt(sum variance)`.

Why it could be a line:

This object is not a prime count, not Mobius, and not a high-dimensional
window. It asks whether primes recover from all small-prime residue
obstructions with unusually stable debt compared to fake label processes.
If the earlier real-vs-Cramer sqrt-cancellation lesson has a sibling, it
could appear here as a flatter real `D(Y)` than Cramer/W210/local fake
labels.

Pre-registered confirmation:

Across endpoints, real `D(Y)` is a stable flat line separated from at
least five Cramer, W210, `W=30030` small-sieve fake, and count-matched
composite controls. The residual exponent is sqrt-scale or better after
the integrated geometric variance. Named composites `25`, `35`, and `77`
must fail eligibility or fail the same rank law; W-coprime composites must
not reproduce the real line.

Pre-registered break:

The line is reproduced by the `W=30030` fake process; Cramer/W210 mismatch
is only missing local factors; count-matched composites reproduce it; the
main term is wrong; the statistic collapses to normalized prime gaps/PNT;
or named/composite centers show that recovery debt is not prime-specific.

### SEE IT

Commands:

```sh
node --check scripts/primorial-recovery-debt-audit.mjs
node scripts/explore.mjs eval '{"domain":"prime","N":200000,"ex":"pi(n)","ey":"gap(n)/log(n)"}'
node scripts/primorial-recovery-debt-audit.mjs 8000000 logs/playground-artifacts
qlmanage -t -s 1400 -o logs/playground-artifacts logs/playground-artifacts/primorial-recovery-debt-8000000.svg
node scripts/explore.mjs shot '{"domain":"prime","N":200000,"ex":"pi(n)","ey":"gap(n)/log(n)"}' logs/playground-artifacts/primorial-recovery-debt-lab-200k.png
```

LAB proxy eval at `N=200000`:

```json
{"n":17984,"finiteFrac":1,"linearity":0.000012433016188960086,"slope":-5.249661880911717e-7,"intercept":1.0076739273916457,"flatness":0.7706516242378589,"zeroCrossings":0,"monotonicity":-0.039648556970472114,"yMin":0,"yMax":7.192376567287099}
```

The LAB proxy is only the normalized gap band. The audit SVG is the
relevant view: on a zoomed z-scale, the real cyan path sits inside the
`W=30030` fake bundle. Cramer, W210, and count-matched composite controls
are clipped when they go off-scale.

Artifacts:

- `logs/playground-artifacts/primorial-recovery-debt-8000000.md`
- `logs/playground-artifacts/primorial-recovery-debt-8000000.json`
- `logs/playground-artifacts/primorial-recovery-debt-8000000.svg`
- `logs/playground-artifacts/primorial-recovery-debt-8000000.svg.png`
- `logs/playground-artifacts/primorial-recovery-debt-lab-200k.png`

### GROUND IT

Setup:

- `W=30030`, `phi(W)=5760`;
- `rank_W(a,b)` counts `W`-coprime candidates between consecutive labels;
- main term `q(n)=W/(phi(W)log n)`, geometric mean `1/q(n)`;
- variance `(1-q(n))/q(n)^2`;
- controls: 15 Cramer, 15 W210, 15 W30030 small-sieve fake, and 15
  count-matched composite runs.

Endpoint at `8,000,000`:

```json
{"N":8000000,"pairs":539608,"z":0.33024664941987514,"rankMean":2.8433084757824196,"expectedRankMean":2.8422755514015767,"theta":0.5233666350811313}
```

Endpoint control ranges:

| control | z range | rank mean range | theta range |
| --- | ---: | ---: | ---: |
| W30030 fake | `-2.752731..1.580178` | `2.833505..2.846717` | `-0.077180..1.436764` |
| W210 fake | `156.305434..161.196521` | `3.374733..3.392490` | `0.995751..1.021286` |
| Cramer labels | `506.629035..510.030011` | `4.927947..4.946909` | `0.996268..1.004971` |
| count-matched composites | `-7.062751..-6.934205` | `2.843281..2.843314` | `-0.210324..-0.198397` |

Growing trace:

| N | pairs | real z | rank mean | expected rank |
| ---: | ---: | ---: | ---: | ---: |
| `500000` | `41370` | `0.342749` | `2.313561` | `2.310609` |
| `1000000` | `78330` | `0.535475` | `2.446279` | `2.442666` |
| `2000000` | `148765` | `0.336641` | `2.577387` | `2.575620` |
| `4000000` | `282978` | `0.444473` | `2.710624` | `2.708818` |
| `8000000` | `539608` | `0.330247` | `2.843308` | `2.842276` |

Named composite check:

| n | prime? | W-eligible? | next prime | rank |
| ---: | --- | --- | ---: | ---: |
| `25` | no | no | `29` | `NA` |
| `35` | no | no | `37` | `NA` |
| `77` | no | no | `79` | `NA` |
| `289` | no | yes | `293` | `1` |

### BREAK

Status: `GRAVEYARD / PRIMORIAL GEOMETRIC WAITING-TIME NULL`.

The candidate made a clean flat line, but it is exactly the local
small-sieve waiting-time law. Real primes have endpoint `z=0.330247`,
well inside the `W=30030` fake range `-2.752731..1.580178`. The W30030
fake also matches the rank mean: real `2.843308` versus fake range
`2.833505..2.846717`.

Cramer and W210 look dramatically wrong, but that is not a prime-specific
win. It is the expected failure from missing local factors `11` and `13`
or the full primorial conditioning: W210 endpoint z is around `156..161`,
and plain Cramer around `506..510`. Those controls are too weak for this
object, not evidence of a new line.

The count-matched composite control is not the right process over prefixes
either: because it samples a fixed global count uniformly, early prefixes
are not prime-shaped. It fails, but the decisive local fake already
absorbs the real line.

### LEARN

This branch is useful because it exposes exactly how not to overuse
Cramer. Once the null installs the same local sieve as the candidate, the
apparent prime regularity becomes an ordinary geometric waiting-time
statement. The line is real but not new: it is normalized prime gaps in
`W`-coprime candidate coordinates, with the correct local hazard.

Next hallucination should either:

- make the small-sieve null adaptive and then measure a residual that is
  orthogonal to the geometric waiting-time law; or
- go function-field-first and define the finite-field statistic before the
  integer analogue, so the null is structural rather than patched after
  seeing the failure.

## HANDOFF 71

Status: no critical-line survivor. Cycle 72 tested primorial recovery
debt: cumulative standardized rank to the next label among `W=30030`
coprime candidates. Real primes were beautifully flat, but W30030 fake
labels reproduced the line. At `8,000,000`, real had `539,608` pairs,
`z=0.330247`, rank mean `2.843308`, expected `2.842276`; W30030 fake
endpoint range was `z=-2.752731..1.580178`, rank mean
`2.833505..2.846717`. Cramer and W210 exploded only because they were
missing the full local primorial conditioning.

New code since the previous handoff:

- `scripts/primorial-recovery-debt-audit.mjs`

New artifacts:

- `logs/playground-artifacts/primorial-recovery-debt-8000000.md`
- `logs/playground-artifacts/primorial-recovery-debt-8000000.json`
- `logs/playground-artifacts/primorial-recovery-debt-8000000.svg`
- `logs/playground-artifacts/primorial-recovery-debt-8000000.svg.png`
- `logs/playground-artifacts/primorial-recovery-debt-lab-200k.png`

No new LAB primitive was added in Cycle 72.

Next cycle suggestion:

Stop asking whether primes recover from small-sieve deletion at the
expected geometric rate; they do, and the right fake does too. Try a
function-field-first object: define a finite-field rank/correlation law
on monic irreducibles where the theorem-side null is exact, then transport
only the statistic shape back to integers with local factors fixed before
measurement.

## Cycle 73 — function-field constant-orbit companion residual

### HALLUCINATE

Guess:

Define the object in the finite-field universe first. For odd `q`, degree
`d`, and monic irreducible `f in F_q[t]`, look at its additive constant
orbit

`f + c`, `c in F_q^*`.

Let

`A_q(d)=sum_{c in F_q^*} #{irreducible f of degree d: f+c irreducible}`.

The finite-field theorem-side null is fixed before touching integers:

`P_q(d)=sum_{c in F_q^*} polynomialTwinPrediction(q,d,c,d)`.

The proposed finite-field line is

`Z_q(D)=sum_{d<=D}(A_q(d)-P_q(d))/sqrt(sum_{d<=D} P_q(d))`.

Transport only the statistic shape to integers: use the small constant
orbit `H={2,4,6,8,10,12}` and count

`A_Z(Y)=sum_{h in H} #{p<=Y: p+h is prime}`.

Subtract the finite Hardy-Littlewood local-product prediction through
small primes and normalize by integrated Bernoulli variance. Compare to
W30030 fake labels, Cramer labels, and composite centers.

Why it could be a line:

The finite-field side is not ordered by coefficients or lex rank. It is a
coordinate-free additive orbit under constants, and the null is the
standard polynomial twin-prime prediction. If the integer analogue has a
real residual after local factors are installed, it should show as a
stable flat residual that agrees in scale with the finite-field orbit
residuals.

Pre-registered confirmation:

`F_3[t]`, `F_5[t]`, and the integer offset orbit all have stable
sqrt-scale residuals after their own pre-fixed local products. Integer
real residual is outside W30030 fake, Cramer, and composite controls across
endpoints; top shift contributions do not rotate; named composites
`25`, `35`, and `77` fail the integer claim.

Pre-registered break:

The finite-field prediction absorbs the residual; the integer side is
reproduced by W30030 fake labels; the integer residual is just
Hardy-Littlewood prime-pair noise; Cramer only fails because local factors
are missing; composite centers reproduce the effect; or aggregating shifts
hides unstable cells rather than producing a coherent line.

### SEE IT

Commands:

```sh
node --check scripts/function-field-constant-orbit-audit.mjs
node scripts/explore.mjs eval '{"domain":"prime","N":200000,"ex":"pi(n)","ey":"isprime(n+2)+isprime(n+4)+isprime(n+6)+isprime(n+8)+isprime(n+10)+isprime(n+12)"}'
node scripts/function-field-constant-orbit-audit.mjs 8000000 logs/playground-artifacts
qlmanage -t -s 1400 -o logs/playground-artifacts logs/playground-artifacts/function-field-constant-orbit-8000000.svg
node scripts/explore.mjs shot '{"domain":"prime","N":200000,"ex":"pi(n)","ey":"isprime(n+2)+isprime(n+4)+isprime(n+6)+isprime(n+8)+isprime(n+10)+isprime(n+12)"}' logs/playground-artifacts/function-field-constant-orbit-lab-200k.png
```

LAB proxy eval at `N=200000`:

```json
{"n":17984,"finiteFrac":1,"linearity":0.01420490492561205,"slope":-0.000018778604883804976,"intercept":1.1653634905386125,"flatness":0.8208501516304869,"zeroCrossings":0,"monotonicity":-0.15884297520661156,"yMin":0,"yMax":4}
```

The LAB proxy is just the thin companion-count band. The audit SVG shows
the real integer residual inside Hardy-Littlewood Bernoulli controls, while
the finite-field `F_3[t]` and `F_5[t]` constant-orbit cumulative residuals
stay sqrt-scale but do not align with each other.

Artifacts:

- `logs/playground-artifacts/function-field-constant-orbit-8000000.md`
- `logs/playground-artifacts/function-field-constant-orbit-8000000.json`
- `logs/playground-artifacts/function-field-constant-orbit-8000000.svg`
- `logs/playground-artifacts/function-field-constant-orbit-8000000.svg.png`
- `logs/playground-artifacts/function-field-constant-orbit-lab-200k.png`

### GROUND IT

Finite-field setup:

- `F_3[t]` degrees `10..14`, constants `1,2`;
- `F_5[t]` degrees `5..9`, constants `1,2,3,4`;
- prediction fixed before integer measurement:
  `sum_c polynomialTwinPrediction(q,d,c,d)`.

Integer setup:

- shifts `H={2,4,6,8,10,12}`;
- finite singular products through primes `<=2828`;
- expected companion probability at prime center `p`:
  `S_h/log(p)`;
- controls: 15 Hardy-Littlewood Bernoulli runs on the real prime centers,
  15 W30030 fakes, 15 Cramer fakes, and 15 composite-center controls.

Integer endpoint at `8,000,000`:

```json
{"N":8000000,"centers":539609,"observed":403015,"expected":403224.2054075404,"z":-0.3549682669021023,"theta":-0.20363578098511181}
```

Integer endpoint controls:

| control | z range | abs z range | theta range |
| --- | ---: | ---: | ---: |
| Hardy-Littlewood Bernoulli | `-1.026879..2.176576` | `0.130998..2.176576` | `-0.192325..0.978061` |
| W30030 fake | `10.904731..13.740834` | `10.904731..13.740834` | `0.852852..1.257694` |
| Cramer labels | `60.552366..65.365508` | `60.552366..65.365508` | `0.955565..1.037229` |
| composite centers | `17.489400..19.161663` | `17.489400..19.161663` | `0.859555..0.984648` |

Growing integer trace:

| N | centers | observed | expected | z |
| ---: | ---: | ---: | ---: | ---: |
| `500000` | `41370` | `37897` | `38126.313203` | `-1.290182` |
| `1000000` | `78330` | `67944` | `68244.493947` | `-1.256519` |
| `2000000` | `148765` | `122752` | `122837.025817` | `-0.263658` |
| `4000000` | `282978` | `221910` | `222017.704698` | `-0.247294` |
| `8000000` | `539609` | `403015` | `403224.205408` | `-0.354968` |

Top integer shift cells at endpoint:

| shift | observed | expected | z |
| ---: | ---: | ---: | ---: |
| `2` | `48583` | `48386.904649` | `0.934698` |
| `4` | `48247` | `48386.904649` | `-0.666862` |
| `6` | `96631` | `96773.809298` | `-0.507186` |
| `8` | `48357` | `48386.904649` | `-0.142542` |
| `10` | `64372` | `64515.872865` | `-0.603986` |
| `12` | `96825` | `96773.809298` | `0.181803` |

Function-field endpoint:

| universe | top degree | actual | predicted | cumulative z | theta |
| --- | ---: | ---: | ---: | ---: | ---: |
| `F_3[t]` | `14` | `19020` | `19332.188904` | `-1.293641` | `0.458199` |
| `F_5[t]` | `9` | `69060` | `68435.989504` | `2.742860` | `0.472766` |

Named composite centers do not fail the companion predicate: `25` has
three hits among `n+H`, `35` has four, `77` has three, and `289` has one.

### BREAK

Status: `GRAVEYARD / HARDY-LITTLEWOOD COMPANION NULL`.

The finite-field-first construction was honest: the constant orbit was
defined before the integer analogue, and the polynomial twin-prime
prediction was fixed before measurement. But the transported integer line
breaks exactly at the stronger null. Real endpoint `z=-0.354968` is inside
the Hardy-Littlewood Bernoulli range `-1.026879..2.176576`, and every
individual shift cell is within about one sigma.

W30030, Cramer, and composite controls all fail, but not in a way that
rescues the candidate. They are one-point label controls and do not encode
the pair-singular-series correlations that the statistic is explicitly
measuring. This repeats the Cycle 72 lesson at pair level: a null that
installs the actual local mechanism absorbs the apparent line.

The function-field side also does not yield a shared critical line. The
residuals are sqrt-scale, but `F_3[t]` and `F_5[t]` have opposite endpoint
signs and visibly different trajectories. This is calibration, not a
transport law.

### LEARN

Function-field-first helped discipline the object, but it did not create a
new line. Constant additive companions are simply the twin-prime/HL
problem in another coordinate. Once the local pair prediction is installed,
the integer residual is ordinary prime-pair noise.

Next hallucination should keep the function-field-first discipline but
avoid direct twin/tuple counts. Try a statistic where the finite-field side
has an exact shell symmetry that is not just Hardy-Littlewood counting:
for example, a normalized distributional shape of factor degrees of
`f+c` over constant orbits, or an intrinsic low-degree local obstruction
profile, then transport only that shape.

## HANDOFF 72

Status: no critical-line survivor. Cycle 73 tested a function-field-first
constant-orbit companion residual. Finite-field counts over constants
`f+c` were compared to polynomial twin-prime predictions before measuring
the integer analogue over shifts `{2,4,6,8,10,12}`. Integer real was
absorbed by Hardy-Littlewood Bernoulli controls: at `8,000,000`, real
`z=-0.354968` versus HL controls `-1.026879..2.176576`. W30030, Cramer,
and composite controls failed only because they miss pair correlations.
Function fields stayed sqrt-scale but did not align:
`F_3[t]` cumulative z `-1.293641`, `F_5[t]` cumulative z `2.742860`.

New code since the previous handoff:

- `scripts/function-field-constant-orbit-audit.mjs`

New artifacts:

- `logs/playground-artifacts/function-field-constant-orbit-8000000.md`
- `logs/playground-artifacts/function-field-constant-orbit-8000000.json`
- `logs/playground-artifacts/function-field-constant-orbit-8000000.svg`
- `logs/playground-artifacts/function-field-constant-orbit-8000000.svg.png`
- `logs/playground-artifacts/function-field-constant-orbit-lab-200k.png`

No new LAB primitive was added in Cycle 73.

Next cycle suggestion:

Stay function-field-first, but stop counting companion primes directly.
Use a shell statistic with an exact finite-field symmetry not reducible to
Hardy-Littlewood/twin counts: e.g. the factor-degree shape of `f+c` over
constant orbits, or the distribution of local obstruction profiles across
irreducible shells. Then define the integer analogue only after the finite
shape and null are fixed.

## Cycle 74 — constant-orbit composite-only factor-shape residual

### HALLUCINATE

Guess:

Keep the finite-field-first discipline, but stop counting companion
irreducibles. For odd `q`, degree `d`, monic irreducible center
`f in F_q[t]`, and constants `c in F_q^*`, condition on `f+c` being
reducible. Factor `f+c` and score only the intrinsic factor-degree
partition

`split(g)=1-sum_i (deg P_i / deg g)^2`,

with irreducible factors counted with multiplicity. The exact finite-field
null is the all-monic reducible shell of degree `d`, not a twin-prime
prediction.

Transport only the shape to integers. For prime centers `p` and
`H={2,4,6,8,10,12}`, condition on `p+h` being composite and score

`split(n)=1-sum_i (log p_i / log n)^2`,

again with multiplicity. The integer null is the deterministic
`W=30030` local center shell: all odd `n` coprime to `W`, same shifts,
conditioned on composite mates.

Why it could be a line:

The object no longer awards a special value to companion primes; it removes
them. If the missing arithmetic geometry of prime centers changes the
factor-shape of nearby forced composites, it could appear as a stable
sqrt-scale residual in both universes. The finite-field side has an exact
shell null, and the integer side installs the small-prime residue geometry
before looking at primes.

Pre-registered confirmation:

`F_3[t]`, `F_5[t]`, and the integer orbit show stable sqrt-scale residuals
for the same `split` statistic. The integer real residual lies outside
W-local fake and W-local composite controls across growing endpoints, while
Cramer is only a weak contrast. Named composite centers fail the claim or
land outside the real shape regime.

Pre-registered break:

The all-monic reducible finite-field shell absorbs the effect; sampled
monic/reducible centers reproduce the finite-field residual; the integer
real residual sits inside W-local fake or W-local composite controls; the
statistic is just ordinary Dickman/smoothness geometry; named composites
remain valid inputs; or endpoint signs/top scales drift without a coherent
line.

### SEE IT

Commands:

```sh
node --check scripts/function-field-factor-shape-audit.mjs
node scripts/explore.mjs eval '{"domain":"prime","N":200000,"ex":"pi(n)","ey":"(bigomega(n+2)+bigomega(n+4)+bigomega(n+6)+bigomega(n+8)+bigomega(n+10)+bigomega(n+12))/6"}'
node scripts/function-field-factor-shape-audit.mjs 8000000 logs/playground-artifacts
qlmanage -t -s 1400 -o logs/playground-artifacts logs/playground-artifacts/function-field-factor-shape-8000000.svg
node scripts/explore.mjs shot '{"domain":"prime","N":200000,"ex":"pi(n)","ey":"(bigomega(n+2)+bigomega(n+4)+bigomega(n+6)+bigomega(n+8)+bigomega(n+10)+bigomega(n+12))/6"}' logs/playground-artifacts/function-field-factor-shape-lab-200k.png
```

LAB proxy at `N=200000`:

```json
{"n":17984,"finiteFrac":1,"linearity":0.06799727398437501,"slope":0.00001626256257175709,"intercept":2.460335121969097,"flatness":0.12421340628120844,"zeroCrossings":0,"monotonicity":0.07784025472528962,"yMin":1.3333333333333333,"yMax":11}
```

The LAB proxy is visually a thin factor-complexity band, not the actual
conditioned residual. The audit SVG initially shows a strong rising
integer residual against the weak `W=30030` null, which is exactly the
trap; the rough-center diagnostic is the decisive picture in the table.

Artifacts:

- `logs/playground-artifacts/function-field-factor-shape-8000000.md`
- `logs/playground-artifacts/function-field-factor-shape-8000000.json`
- `logs/playground-artifacts/function-field-factor-shape-8000000.svg`
- `logs/playground-artifacts/function-field-factor-shape-8000000.svg.png`
- `logs/playground-artifacts/function-field-factor-shape-lab-200k.png`

### GROUND IT

Finite-field setup:

- `F_3[t]` degrees `8..11`, constants `1,2`;
- `F_5[t]` degrees `4..7`, constants `1,2,3,4`;
- primary null: exact all-monic reducible degree shell;
- adversarial control: rough centers with no factors up to
  `floor(degree/2)-1`.

Integer setup:

- shifts `H={2,4,6,8,10,12}`;
- condition on `p+h` composite;
- primary weak null: odd centers coprime to `W=30030`, same shifts,
  composite mates only;
- adversarial rough nulls: centers coprime to all primes `<=13,31,97,257`;
- controls: 15 W-fake label runs, 15 Cramer label runs, and 15 count-matched
  W-coprime composite-center samples.

Integer trace against the weak `W=30030` null:

| N | prime centers | composite mates | real mean split | W-local null mean | z |
| ---: | ---: | ---: | ---: | ---: | ---: |
| `500000` | `41370` | `210323` | `0.493153` | `0.491118` | `5.539322` |
| `1000000` | `78330` | `402036` | `0.493182` | `0.491042` | `7.976364` |
| `2000000` | `148765` | `769838` | `0.493140` | `0.491062` | `10.627009` |
| `4000000` | `282978` | `1475958` | `0.493341` | `0.491093` | `15.787474` |
| `8000000` | `539609` | `2834639` | `0.493384` | `0.491172` | `21.378472` |

Endpoint controls against the weak null:

| control | endpoint z range | endpoint mean split range |
| --- | ---: | ---: |
| W-fake | `-1.667971..2.242923` | `0.490999..0.491404` |
| W-composite | `-12.577774..-10.545819` | `0.489869..0.490079` |
| Cramer | `-26.567175..-24.088176` | `0.488404..0.488665` |

Rough-center null diagnostic for the same real prime centers:

| center coprime to primes <= | endpoint null mean | endpoint z | z trace |
| ---: | ---: | ---: | --- |
| `13` | `0.491172` | `21.378472` | `5.54, 7.98, 10.63, 15.79, 21.38` |
| `31` | `0.492433` | `9.187508` | `1.62, 2.88, 3.87, 6.57, 9.19` |
| `97` | `0.493061` | `3.126492` | `0.37, 1.04, 0.95, 2.41, 3.13` |
| `257` | `0.493238` | `1.414119` | `0.26, 0.56, 0.40, 1.31, 1.41` |

Finite-field endpoint checks:

| universe | endpoint degree | actual z | cumulative z | rough-center z range |
| --- | ---: | ---: | ---: | ---: |
| `F_3[t]` | `11` | `40.542933` | `52.364330` | `39.411262..41.493255` |
| `F_5[t]` | `7` | `25.851698` | `29.473483` | `24.937767..26.649481` |

Named composite centers remain valid inputs rather than failures:
`25` has mean split `0.531049`, `35` has `0.537281`, `77` has `0.527676`,
and the W-coprime composite `289` has `0.474694`.

### BREAK

Status: `GRAVEYARD / ROUGH-CENTER SMOOTHNESS NULL`.

The first pass looked like a survivor: the integer residual rose to
`z=21.378472`, and both function fields had huge same-sign residuals. But
that was an underfit-null artifact. The statistic is primarily measuring
the fact that prime or irreducible centers have no small factors. Once the
integer null is strengthened from W-coprime centers to centers rough up to
`257`, the endpoint z collapses from `21.378472` to `1.414119`. On the
finite-field side, sampled rough centers reproduce the apparent signal
almost exactly: `F_3[t]` actual `40.542933` vs rough range
`39.411262..41.493255`, and `F_5[t]` actual `25.851698` vs rough range
`24.937767..26.649481`.

Cramer was the wrong adversary here, exactly as suspected. It fails
spectacularly because it misses local center roughness, but the stronger
rough null absorbs the line. The object avoided direct companion-prime
counting, yet still collapsed to a sieve/smoothness shadow of the center
being prime.

### LEARN

This was useful because it exposed a new failure mode more precise than
"HL pair null" or "Cramer density": composite-only neighbor factor shapes
are dominated by the roughness depth of the center. Function fields make
the mechanism obvious: once centers are sampled from the no-low-degree-
factor shell, the residual is already there before irreducibility is fully
installed.

CONNECTION: this is the roughness-depth analogue of the primorial
recovery-debt break and the local-null Walsh breaks. The right null is not
Cramer; it is the local/no-small-factor shell matching the statistic's
conditioning.

Next hallucination should quotient out center roughness first. One possible
object: the collapse curve itself, `Z(B)` as the rough cutoff `B` grows,
normalized by the finite-field analogue `Z(R)` as factor-degree cutoff
approaches `floor(d/2)`. A survivor would need a residual after the full
roughness-depth profile is matched, not merely after a fixed wheel.

## HANDOFF 74

Status: no critical-line survivor. Cycle 74 tested a finite-field-first
factor-shape object: for constant orbits `f+c`, discard irreducible mates
and score only the factor fragmentation of reducible/composite mates.
The naive W-local integer null made this look very strong
(`z=21.378472` at `8,000,000`), and finite fields also had large positive
residuals. The adversarial rough-center audit broke it: integer endpoint
z drops to `1.414119` when centers are required coprime to primes `<=257`,
and finite-field rough-center controls reproduce the signal
(`F_3[t]` endpoint rough range `39.411262..41.493255` around actual
`40.542933`; `F_5[t]` rough range `24.937767..26.649481` around actual
`25.851698`).

New code since the previous handoff:

- `scripts/function-field-factor-shape-audit.mjs`

New artifacts:

- `logs/playground-artifacts/function-field-factor-shape-8000000.md`
- `logs/playground-artifacts/function-field-factor-shape-8000000.json`
- `logs/playground-artifacts/function-field-factor-shape-8000000.svg`
- `logs/playground-artifacts/function-field-factor-shape-8000000.svg.png`
- `logs/playground-artifacts/function-field-factor-shape-lab-200k.png`

No core primitive was added. Next cycle: do not test neighbor factor-shape
without matching the full roughness-depth profile of the center. Try a
roughness-quotiented statistic, or make the roughness-collapse curve itself
the object and require a residual after finite-field and integer rough
profiles are aligned.

## Cycle 75 — roughness-collapse profile line

### HALLUCINATE

Guess:

Turn the Cycle 74 failure mode into the object. For each endpoint `N` and
roughness cutoff `B`, let `R_B` be the odd centers coprime to every prime
`<=B`. Keep the same composite-only neighbor split statistic

`split(n)=1-sum_i (log p_i / log n)^2`

over shifts `H={2,4,6,8,10,12}`. Define

`Delta(B,N)=mean_prime_centers(N)-mean_R_B_centers(N)`.

Use the missing roughness mass

`T(B,N)=sum_{B<p<=sqrt(N)} 1/p`

as the intrinsic x-coordinate. The hallucinated line is that
`Delta(B,N)` is nearly affine in `T(B,N)`, with a stable slope as `N`
grows; after subtracting the fitted roughness-collapse line, the remaining
prime residual is the candidate critical-line object.

Finite-field analogue:
for degree `d`, use rough monic centers with no irreducible factor of
degree `<=r`, compare neighbor split for irreducible centers against those
`r`-rough centers, and use

`T_q(r,d)=sum_{r<deg P<=floor(d/2)} 1/|P|`

as the x-coordinate.

Why it could be a line:

Prime centers are exactly centers that have survived every roughness
cutoff up to `sqrt(n)`. Cycle 74 showed that fixed-wheel controls are the
wrong coordinate. If roughness depth is the actual hidden axis, then the
collapse from weak local shells to fully prime/irreducible shells may be a
straight profile shared by integers and function fields. Any residual
after this profile is fitted would be a better candidate than the raw
factor-shape statistic.

Pre-registered confirmation:

Across endpoints, integer `Delta(B,N)` has high linearity against
`T(B,N)`, a stable slope/effect size, and a small residual exponent after
fitting. Function-field profiles in `F_3[t]` and `F_5[t]` have the same
shape after their own `T_q` normalization. The fitted-line residual for
real prime centers remains outside random rough-shell controls and
count-matched composite controls. Named composites do not reproduce the
profile.

Pre-registered break:

The line is only a deterministic sieve/smoothness law; rough-shell controls
reproduce both the slope and residuals; finite-field and integer slopes do
not align; the residual after fitting is endpoint noise; the x-coordinate
is a post-hoc reparameterization with no stable effect; or named
composites remain valid inputs.

### SEE IT

Commands:

```sh
node --check scripts/roughness-collapse-profile-audit.mjs
node scripts/explore.mjs eval '{"domain":"prime","N":200000,"ex":"pi(n)","ey":"roughcount(n,31)"}'
node scripts/roughness-collapse-profile-audit.mjs 8000000 logs/playground-artifacts
qlmanage -t -s 1400 -o logs/playground-artifacts logs/playground-artifacts/roughness-collapse-profile-8000000.svg
node scripts/explore.mjs shot '{"domain":"prime","N":200000,"ex":"pi(n)","ey":"roughcount(n,31)"}' logs/playground-artifacts/roughness-collapse-profile-lab-200k.png
```

LAB proxy at `N=200000`:

```json
{"n":17984,"finiteFrac":1,"linearity":0.00003533097950008116,"slope":-0.0000012683762485235814,"intercept":4.618223044233353,"flatness":0.24047224355821745,"zeroCrossings":0,"monotonicity":-0.10944305439718284,"yMin":0,"yMax":8}
```

The LAB proxy is a thin noisy rough-witness band, not a line. The audit
SVG shows the real profile directly: `Delta(B,N)` bends strongly, with the
small-cutoff points above the affine fit and the middle cutoffs below it.

Artifacts:

- `logs/playground-artifacts/roughness-collapse-profile-8000000.md`
- `logs/playground-artifacts/roughness-collapse-profile-8000000.json`
- `logs/playground-artifacts/roughness-collapse-profile-8000000.svg`
- `logs/playground-artifacts/roughness-collapse-profile-8000000.svg.png`
- `logs/playground-artifacts/roughness-collapse-profile-lab-200k.png`

### GROUND IT

Integer profile:

| N | prime centers | affine R2 | affine slope | affine intercept | affine RMSE | origin R2 | origin slope |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `500000` | `41370` | `0.740180` | `0.00327788` | `-0.00067380` | `0.00056473` | `0.627885` | `0.00221242` |
| `1000000` | `78330` | `0.787003` | `0.00335696` | `-0.00076501` | `0.00050783` | `0.661174` | `0.00220253` |
| `2000000` | `148765` | `0.762794` | `0.00300264` | `-0.00073599` | `0.00051843` | `0.628703` | `0.00193476` |
| `4000000` | `282978` | `0.780291` | `0.00285425` | `-0.00062100` | `0.00049524` | `0.678095` | `0.00198744` |
| `8000000` | `539609` | `0.772822` | `0.00262688` | `-0.00060288` | `0.00048737` | `0.665542` | `0.00181307` |

Endpoint integer profile at `N=8000000`:

| B | tail mass T | rough centers | rough mean split | Delta |
| ---: | ---: | ---: | ---: | ---: |
| `7` | `1.16097837` | `1828344` | `0.48971141` | `0.00367277` |
| `13` | `0.99314620` | `1534276` | `0.49117189` | `0.00221230` |
| `19` | `0.88169109` | `1368025` | `0.49190442` | `0.00147977` |
| `31` | `0.77147201` | `1222664` | `0.49243326` | `0.00095093` |
| `43` | `0.69679893` | `1133531` | `0.49269316` | `0.00069102` |
| `67` | `0.60838644` | `1036620` | `0.49292014` | `0.00046404` |
| `97` | `0.53435165` | `962853` | `0.49306059` | `0.00032359` |
| `151` | `0.44403721` | `882007` | `0.49318659` | `0.00019759` |
| `257` | `0.34963859` | `802914` | `0.49323781` | `0.00014637` |
| `401` | `0.27589855` | `739281` | `0.49326525` | `0.00011893` |
| `631` | `0.20536209` | `677103` | `0.49330499` | `0.00007919` |
| `997` | `0.13908872` | `619606` | `0.49333859` | `0.00004559` |
| `1543` | `0.07892093` | `572609` | `0.49337542` | `0.00000876` |
| `2237` | `0.03097147` | `545729` | `0.49337873` | `0.00000545` |

Finite-field fits:

| universe | degree range | affine R2 range | affine slope range | RMSE range |
| --- | ---: | ---: | ---: | ---: |
| `F_3[t]` | `8..11` | `0.901563..0.955171` | `0.023563..0.032343` | `0.004167..0.005731` |
| `F_5[t]` | `4..7` | `0.957776..1.000000` | `0.016163..0.022127` | `0.000000..0.002110` |

Endpoint finite profiles:

| universe | endpoint degree | affine R2 | affine slope | affine intercept | origin R2 | origin slope |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `F_3[t]` | `11` | `0.905975` | `0.023563` | `-0.010293` | `0.762596` | `0.015996` |
| `F_5[t]` | `7` | `0.962024` | `0.016163` | `-0.006945` | `0.813152` | `0.010807` |

Named composite centers remain valid inputs:
`25` mean split `0.53104907`, `35` `0.53728096`, `77` `0.52767616`,
and `289` `0.47469394`.

### BREAK

Status: `GRAVEYARD / NONLINEAR ROUGHNESS PROFILE`.

The roughness-collapse coordinate is useful but not a critical line. The
integer profile is not sharp: endpoint affine `R2=0.772822`, and the
physically natural through-origin fit is worse at `R2=0.665542`. The
negative affine intercept is also a warning that the chosen x-coordinate is
not the right intrinsic linear parameter. Across endpoints the slope is
only mildly stable (`0.00335696` down to `0.00262688`) and the RMSE does
not expose a residual line.

The two-universe comparison breaks the claim harder. Finite fields have
larger slopes by about one order of magnitude: `F_3[t]` endpoint slope
`0.023563`, `F_5[t]` endpoint slope `0.016163`, versus integer endpoint
`0.002627`. Their profiles are also visibly different step functions in
rough degree, not a shared normalized law. This is not a transportable
critical line; it is a roughness/smoothness response curve whose shape
depends on the universe and on the crude tail-mass coordinate.

### LEARN

Quotienting by roughness is necessary, but the simple Mertens-tail
coordinate is too blunt. Cycle 75 converts the Cycle 74 failure into a
diagnostic: any future neighbor-factor statistic must match the whole
roughness response curve, not just a single cutoff, and should probably
condition on local factor degrees directly rather than expect
`sum 1/p` or `sum 1/|P|` to linearize the effect.

CONNECTION: this is the profile-level version of the rough-center
smoothness break. It also explains why Cramer comparisons keep misleading
the search: density-only models miss the entire roughness response curve,
while a fixed wheel catches only one point on it.

Next hallucination should leave neighbor factor-shape. Try an intrinsic
statistic that uses the roughness response as a calibration surface rather
than a one-dimensional line, or switch to a non-neighbor object such as a
prime-centered residue-current flow where the null can be the full
roughness-conditioned shell from the start.

## HANDOFF 75

Status: no critical-line survivor. Cycle 75 tested the roughness-collapse
curve itself. Define `Delta(B,N)` as the difference between prime-center
composite-neighbor split and `B`-rough-center split, with x-coordinate
`T(B,N)=sum_{B<p<=sqrt(N)}1/p`; finite fields used the analogous
rough-degree tail mass. Integer endpoint line fit at `8,000,000` was weak:
affine `R2=0.772822`, origin `R2=0.665542`, slope `0.00262688`. The
finite-field endpoint slopes were much larger: `F_3[t]` `0.023563`,
`F_5[t]` `0.016163`. Named composites remained valid inputs.

New code since the previous handoff:

- `scripts/roughness-collapse-profile-audit.mjs`

New artifacts:

- `logs/playground-artifacts/roughness-collapse-profile-8000000.md`
- `logs/playground-artifacts/roughness-collapse-profile-8000000.json`
- `logs/playground-artifacts/roughness-collapse-profile-8000000.svg`
- `logs/playground-artifacts/roughness-collapse-profile-8000000.svg.png`
- `logs/playground-artifacts/roughness-collapse-profile-lab-200k.png`

No core primitive was added. Next cycle: do not try to linearize roughness
with `sum 1/p` alone. Either match the full roughness response surface as
the null before measuring residuals, or leave neighbor factor-shape for an
intrinsic non-neighbor statistic.

## Cycle 76 — rough-shell residue-current spectral edge

### HALLUCINATE

Guess:

Leave neighbor factor-shape. For each fresh interval block and each small
prime modulus `m`, count prime centers by nonzero residue class modulo
`m`. But do not compare to uniform residues or Cramér. The null for every
cell is the exact count of `257`-rough odd centers in the same block and
residue class. Whiten each cell by the rough-shell expected count, stack
blocks into a residue-current matrix, and score

`E(N)=lambda_max(covariance(current rows)) / Marchenko-Pastur edge`.

Finite-field analogue:
for degree `d`, count irreducibles by residue modulo small irreducible
polynomial moduli, but whiten against monic centers with no factor of
degree `<= floor(d/2)-1`. Score the same spectral edge across degree rows.

Why it could be a line:

This is non-neighbor and coordinate-free up to the explicit finite set of
small residue probes. The roughness shell is installed before measuring
anything, so the Cycle 74/75 smoothness failure should be neutralized. If
prime regularity leaves a coherent residue-current beyond roughness, the
edge should be stable across `N`, visible in both universes, and outside
rough-random and rough-composite controls.

Pre-registered confirmation:

Integer `E(N)` is stable or tends to a flat line across endpoints and lies
outside at least 15 rough-random controls and rough-composite controls.
Finite-field `F_3[t]` and `F_5[t]` have comparable normalized edge scale.
The leading columns are not one residue class or one modulus dominating
the norm. Cramér may fail, but that is not enough.

Pre-registered break:

Rough-random or rough-composite controls reproduce the edge; Cramér is the
only failing contrast; one modulus/residue column dominates; finite fields
do not align; endpoint edge drifts; or named composites fail only because
the rough shell excludes them rather than because the statistic is
prime-specific.

### SEE IT

Commands:

```sh
node --check scripts/rough-residue-current-audit.mjs
node scripts/explore.mjs eval '{"domain":"prime","N":200000,"ex":"pi(n)","ey":"sin(2*pi*n/3)+sin(2*pi*n/5)+sin(2*pi*n/7)+sin(2*pi*n/11)"}'
node scripts/rough-residue-current-audit.mjs 8000000 logs/playground-artifacts
qlmanage -t -s 1400 -o logs/playground-artifacts logs/playground-artifacts/rough-residue-current-8000000.svg
node scripts/explore.mjs shot '{"domain":"prime","N":200000,"ex":"pi(n)","ey":"sin(2*pi*n/3)+sin(2*pi*n/5)+sin(2*pi*n/7)+sin(2*pi*n/11)"}' logs/playground-artifacts/rough-residue-current-lab-200k.png
```

LAB residue-wave proxy at `N=200000`:

```json
{"n":17984,"finiteFrac":1,"linearity":0.000003982135170821974,"slope":6.074792984877752e-7,"intercept":-0.007221074073694302,"flatness":1.2430718387932769,"zeroCrossings":9793,"monotonicity":0.003058444086081299,"yMin":-3.7818312741604014,"yMax":3.7818312741678985}
```

The LAB proxy is pure oscillatory residue texture, not a line. The audit
SVG shows the real integer spectral edge wandering inside rough-random and
rough-composite control bands.

Artifacts:

- `logs/playground-artifacts/rough-residue-current-8000000.md`
- `logs/playground-artifacts/rough-residue-current-8000000.json`
- `logs/playground-artifacts/rough-residue-current-8000000.svg`
- `logs/playground-artifacts/rough-residue-current-8000000.svg.png`
- `logs/playground-artifacts/rough-residue-current-lab-200k.png`

### GROUND IT

Integer setup:

- blocks: 24 fresh blocks in `(N/2,N]` for each endpoint;
- moduli budget path: `[3,5,7]`, then through `13`, `23`, and `31`;
- every expected residue count is computed from the exact `257`-rough odd
  center shell in the same block;
- controls: 15 rough-random multinomial controls, 15 rough-composite
  controls, and 15 Cramér label controls, all scored against the same
  rough-shell expected cells.

Final endpoint budget comparison:

| budget | Z edge | rough-random edge range | rough-composite edge range | Cramer edge range | F3 edge | F3 rough-random | F5 edge | F5 rough-random |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `3` | `1.025143` | `0.810737..1.147713` | `0.859848..1.356549` | `0.857555..1.215913` | `1.029437` | `0.545903..0.970186` | `1.320985` | `0.600329..0.959018` |
| `5` | `1.018132` | `0.862394..1.112879` | `0.750429..1.067708` | `0.835940..1.125297` | `1.246217` | `0.678395..0.997624` | `1.544332` | `0.662144..0.956794` |
| `8` | `0.992534` | `0.883093..1.027028` | `0.899991..1.125501` | `0.841651..1.066996` | `NA` | `NA` | `NA` | `NA` |
| `10` | `0.941540` | `0.879736..1.065678` | `0.893949..1.047297` | `0.922074..1.055315` | `NA` | `NA` | `NA` | `NA` |

Integer budget-10 endpoint trace:

| N | real edge | real energy | rough-random edge range | rough-composite edge range | excess edge |
| ---: | ---: | ---: | ---: | ---: | ---: |
| `500000` | `1.084238` | `0.391290` | `0.882315..1.058579` | `0.972930..1.088586` | `0.121891` |
| `1000000` | `1.117257` | `0.425227` | `0.925206..1.042995` | `0.903397..1.172626` | `0.137197` |
| `2000000` | `1.025502` | `0.444681` | `0.909796..1.076824` | `0.914986..1.145503` | `0.051315` |
| `4000000` | `1.103748` | `0.458331` | `0.875461..1.088726` | `0.901677..1.057072` | `0.150932` |
| `8000000` | `0.941540` | `0.467469` | `0.879736..1.065678` | `0.893949..1.047297` | `-0.034142` |

The excess-edge exponent for budget 10 is `theta=-0.353427`, but the sign
changes and the endpoint is inside controls, so this is not a stable
residual law.

Strongest integer endpoint columns are scattered high-modulus residues:
`29:r7`, `31:r27`, `31:r8`, `23:r18`, `17:r12`, `29:r28`, `31:r24`,
`29:r10`; no coherent low-dimensional current appears.

Finite-field side:

- `F_3[t]` final budget 5 edge `1.246217`, rough-random range
  `0.678395..0.997624`, rough-composite range `0.666341..1.048626`;
- `F_5[t]` final budget 5 edge `1.544332`, rough-random range
  `0.662144..0.956794`, rough-composite range `0.773862..0.983263`.

The field strongest columns are low-degree residue cells (`t`, `t+1`,
degree-2 moduli), so the field signal is not the same object as the
integer endpoint-current noise.

Named composites `25`, `35`, `77`, and `289` all fail `257`-rough
eligibility. This is a correct exclusion by the null, not a prime-specific
victory.

### BREAK

Status: `GRAVEYARD / ROUGH-SHELL RESIDUE CONTROL`.

The integer candidate breaks at the intended adversary. At the final
budget and endpoint, the real edge `0.941540` is inside rough-random
`0.879736..1.065678`, rough-composite `0.893949..1.047297`, and even
Cramér `0.922074..1.055315`. Across endpoints it wanders rather than
flattening outside controls. This is a rough-shell residue-current noise
object, not a critical line.

There is a real-looking finite-field divergence, but it does not rescue
the candidate. `F_3[t]` and `F_5[t]` have edges above their rough controls,
yet the effect is carried by small polynomial residue columns and has no
integer counterpart under the matched rough shell. That is an S2-style
datum to remember, not an integer critical line.

### LEARN

The roughness-conditioned null did its job: once installed directly, the
integer residue-current edge becomes ordinary rough-shell fluctuation. The
finite-field residue current may be worth a targeted two-universe study,
but it must be treated as field-only low-degree residue rigidity unless an
integer analogue is found.

CONNECTION: this is the non-neighbor sibling of the roughness-profile
break. It shows that leaving neighbor factor-shape is not enough; the
rough shell also absorbs residue-current spectra over integers. The field
divergence connects to the council's S2 route: the second universe can
expose structure that simply does not transport.

Next hallucination should either target the finite-field residue-current
divergence as an S2 object with a more exact field null, or switch to a
different intrinsic integer statistic whose rough-shell null is not
already the natural explanation.

## HANDOFF 76

Status: no integer critical-line survivor. Cycle 76 tested a non-neighbor
rough-shell residue-current spectral edge. Integer residue cells were
whitened by exact `257`-rough shell counts in the same block. At
`8,000,000`, budget-10 real edge `0.941540` sat inside rough-random
`0.879736..1.065678`, rough-composite `0.893949..1.047297`, and Cramér
`0.922074..1.055315`; the endpoint trace wandered and the excess-edge
theta `-0.353427` was not meaningful.

Finite fields diverged: `F_3[t]` budget-5 edge `1.246217` and `F_5[t]`
budget-5 edge `1.544332` exceeded their rough controls, with strongest
columns in low-degree polynomial residues. Treat that as a possible S2
lead, not a transported critical line.

New code since the previous handoff:

- `scripts/rough-residue-current-audit.mjs`

New artifacts:

- `logs/playground-artifacts/rough-residue-current-8000000.md`
- `logs/playground-artifacts/rough-residue-current-8000000.json`
- `logs/playground-artifacts/rough-residue-current-8000000.svg`
- `logs/playground-artifacts/rough-residue-current-8000000.svg.png`
- `logs/playground-artifacts/rough-residue-current-lab-200k.png`

No core primitive was added. Next cycle: either drill into the finite-field
residue-current divergence with exact field controls, or abandon residue
currents and try a different intrinsic integer statistic under a
rough-shell null.

## Cycle 77 — automatic-sequence prime balance line

### HALLUCINATE

Guess:

Let

`T_b(x)=sum_{p<=x} eps_b(p)`,

where `eps_b(n)=(-1)^(sum of base-b digits of n)`. The primary line is
the Thue-Morse case `b=2`; bases `3` and `10` are holdouts. Score both the
signed residual `T_b(x)/sqrt(pi(x))` and the excursion line

`A_b(x)=max_{y<=x}|T_b(y)|/sqrt(pi(x))`.

Why it could be a line:

This is a genuinely different route from zeta-style explicit formulas:
automatic sequences along primes belong to the Mauduit-Rivat /
Green-Tao-dynamics world. The theorem-level fact is cancellation, but the
playground guess is stronger and more visual: maybe the prime input
selects a stable sqrt-scale automatic residual whose excursion is flatter
or smaller than density-only fake labels. The function-field bridge is
coefficient digit parity over irreducibles in `F_q[t]`, so the same guess
has a two-universe translation.

Pre-registered confirmation:

The real base-2 endpoint trace is stable as `N` grows, with
`A_2(x)` outside at least five density and composite controls. The effect
is not an endpoint artifact, survives base changes up to a coherent scale,
and has a finite-field analogue that is not caused by the coefficient
encoding. Named composites `25`, `35`, `77`, and `289` must not satisfy the
same prime-input claim.

Pre-registered break:

Cramer, sampled composite, or rough/composite controls reproduce the
excursion; the sign balance behaves like an ordinary random walk; bases
change the scale incoherently; the function-field version is forced by
`f(1)` or another coefficient artifact; or the claim is only the known
Mauduit-Rivat cancellation theorem with no new critical line.

### SEE IT

Commands:

```sh
node --check scripts/thue-morse-prime-balance-audit.mjs
node scripts/explore.mjs eval '{"domain":"prime","N":200000,"ex":"pi(n)","ey":"tmbal(n)/sqrt(pi(n))"}'
node scripts/thue-morse-prime-balance-audit.mjs 8000000 logs/playground-artifacts
node scripts/thue-morse-prime-balance-audit.mjs 16000000 logs/playground-artifacts
qlmanage -t -s 1400 -o logs/playground-artifacts logs/playground-artifacts/thue-morse-prime-balance-audit-16000000.svg
node scripts/explore.mjs shot '{"domain":"prime","N":200000,"ex":"pi(n)","ey":"tmbal(n)/sqrt(pi(n))"}' logs/playground-artifacts/thue-morse-tmbal-lab-200k.png
```

LAB at `N=200000`:

```json
{"n":17984,"finiteFrac":1,"linearity":0.37124913528255227,"slope":-0.00018807566080582863,"intercept":-5.625737481525287,"flatness":0.21900710713641086,"zeroCrossings":2,"monotonicity":-0.0720124562086415,"yMin":-10.253948880478562,"yMax":0.5773502691896258}
```

The LAB trace is a biased walk, not a sharp straight/flat critical line.
The SVG makes the collapse visible: base `3` blows up immediately, the
`F_2[t]` coefficient-parity row blows up even harder, and base `2` tracks
the exact local residue shells rather than a prime-only object.

Artifacts:

- `logs/playground-artifacts/thue-morse-prime-balance-audit-8000000.md`
- `logs/playground-artifacts/thue-morse-prime-balance-audit-8000000.json`
- `logs/playground-artifacts/thue-morse-prime-balance-audit-8000000.svg`
- `logs/playground-artifacts/thue-morse-prime-balance-audit-16000000.md`
- `logs/playground-artifacts/thue-morse-prime-balance-audit-16000000.json`
- `logs/playground-artifacts/thue-morse-prime-balance-audit-16000000.svg`
- `logs/playground-artifacts/thue-morse-prime-balance-audit-16000000.svg.png`
- `logs/playground-artifacts/thue-morse-tmbal-lab-200k.png`

### GROUND IT

Integer endpoint at `N=8,000,000`:

| series | labels | final normalized | maxAbs/sqrt(labels) | maxAbs theta |
| --- | ---: | ---: | ---: | ---: |
| real primes base 2 | `539777` | `-19.122216` | `19.872187` | `0.788936` |
| real primes base 3 | `539777` | `-734.692453` | `734.692453` | `1.000017` |
| real primes base 10 | `539777` | `-7.106349` | `8.724707` | `0.751883` |
| W6 candidates base 2 | `2666666` | `-33.646195` | `36.159372` | `0.792524` |
| W210 candidates base 2 | `1828571` | `-29.606285` | `31.859572` | `0.785155` |

The base-2 prime exponent is almost the exact local-shell exponent. The
number `0.7925...` is the classical Newman/Gelfond digit-sum exponent
`log(3)/log(4)` for Thue-Morse bias on residue classes mod `3`, not a new
prime residual exponent.

Integer endpoint at `N=16,000,000`:

| series/control | endpoint value |
| --- | ---: |
| real primes base-2 maxAbs/sqrt | `33.836373` |
| W6 candidates base-2 maxAbs/sqrt | `71.024484` |
| W6 candidates theta | `0.792499` |
| W210 candidates base-2 maxAbs/sqrt | `61.092931` |
| W210 candidates theta | `0.793146` |
| Cramer base-2 maxAbs/sqrt range, 15 seeds | `29.884983..32.853785` |
| sampled W210-composite range, 15 seeds | `30.668306..33.647293` |
| rough31-composite range, 15 seeds | `30.090235..32.325706` |

The real endpoint is slightly above the 15 sampled controls, but this does
not rescue it: exact non-prime W6 and W210 candidate shells already carry
the same line and with larger amplitude.

Base and two-universe checks:

- Base `3` fails by parity: for odd base `b`, digit-sum parity equals
  integer parity, so every odd prime has the same sign. This gives
  `-sqrt(pi(x))`, not a prime line.
- Over `F_2[t]`, coefficient parity is `f(1)`. Every monic irreducible of
  degree `>1` has `f(1)!=0`; otherwise it is divisible by `t+1`. The
  endpoint degree `22` has maxAbs/sqrt `436.528350`, while random monic
  controls are only `0.352784..2.151063`. This is algebraic forcing.
- Over `F_3[t]`, the effect is inconsistent rather than transported:
  degree `13` has real maxAbs/sqrt `3.249572`, with random monic controls
  `0.525414..2.721303` and random reducible controls
  `0.799543..2.118790`.
- Named composites `25`, `35`, `77`, and `289` are not admissible prime
  inputs. They still have ordinary digit signs, so the single-label
  mechanism is not prime-exclusive.

### BREAK

Status: `GRAVEYARD / NEWMAN-DIGIT LOCAL-SHELL ARTIFACT`.

The base-2 statistic looked exciting because it had a stable non-sqrt
exponent. Grounding identified the source: primes after `3` live in the
two reduced residue classes modulo `6`, and Thue-Morse has a classical
large bias on residue classes modulo `3`. Exact W6 and W210 candidate
shells reproduce the exponent and exceed the prime amplitude. That makes
the candidate a digit-congruence resonance, not a critical line encoding
prime regularity.

The base-change and function-field checks break even harder. Base `3` is
literally parity on odd primes; `F_2[t]` coefficient parity is forced by
the absence of the factor `t+1`. These are the same failure under two
names: coefficient or digit encoding made a local algebraic obstruction
look like a line.

### LEARN

Automatic sequences are a productive route, but raw digit encodings are
not coordinate-free. The right null is not Cramer; it is the exact
automatic-sequence behavior on the local candidate shell. Any future
automatic-statistic candidate must first quotient out residue-class
Newman/Gelfond bias and must use a base/encoding that does not become
parity in the integer or polynomial universe.

CONNECTION: this is the digit-dynamical analogue of the primorial
recovery-debt and rough-shell residue-current breaks. Once the correct
local shell is installed, the apparent prime line is absorbed. It also
connects to the lex/coefficient-ordering warning: function-field
coefficient parity is another artifact factory unless the statistic is
coordinate-free.

## HANDOFF 77

Status: no critical-line survivor. Cycle 77 tested the automatic-sequence
prime balance
`T_b(x)=sum_{p<=x}(-1)^(sum of base-b digits of p)`, using base `2` as the
primary Thue-Morse route and bases `3`/`10` as holdouts. The base-2 prime
trace had real endpoint maxAbs/sqrt `19.872187` at `8,000,000` and
`33.836373` at `16,000,000`, but exact W6/W210 candidate shells had the
same Newman/Gelfond exponent near `log(3)/log(4)=0.79248` and larger
amplitudes. Base `3` collapsed to parity on odd primes. `F_2[t]`
coefficient parity was forced by `f(1)!=0` for irreducibles of degree
greater than one.

New code since the previous handoff:

- `scripts/thue-morse-prime-balance-audit.mjs` tightened to 15 seeds,
  rough31 composite controls, exact W6/W210 shell comparators, and named
  composite checks.

New artifacts:

- `logs/playground-artifacts/thue-morse-prime-balance-audit-8000000.md`
- `logs/playground-artifacts/thue-morse-prime-balance-audit-8000000.json`
- `logs/playground-artifacts/thue-morse-prime-balance-audit-8000000.svg`
- `logs/playground-artifacts/thue-morse-prime-balance-audit-16000000.md`
- `logs/playground-artifacts/thue-morse-prime-balance-audit-16000000.json`
- `logs/playground-artifacts/thue-morse-prime-balance-audit-16000000.svg`
- `logs/playground-artifacts/thue-morse-prime-balance-audit-16000000.svg.png`
- `logs/playground-artifacts/thue-morse-tmbal-lab-200k.png`

No core primitive was added. Next cycle should either use automatic
sequences only after subtracting exact local-shell digit bias, or switch to
a coordinate-free statistic where the W-shell is not already the natural
explanation.

## Cycle 78 — square-phase prime drift

### HALLUCINATE

Guess:

Every integer `n` has a square phase

`u(n)=(n-floor(sqrt(n))^2)/((floor(sqrt(n))+1)^2-floor(sqrt(n))^2)`.

This is the normalized position of `n` inside its square annulus
`[k^2,(k+1)^2)`. Define `phi(n)=2u(n)-1`, so lower-half square-annulus
points are negative and upper-half points are positive.

The candidate line is the locally centered square-phase drift

`Z_W(N)=sum_{p<=N}(phi(p)-E_W(phi | same square annulus)) / sqrt(sum Var_W)`,

where `E_W` and `Var_W` are computed exactly from `W=2*3*5*7*11` candidate
integers in the same square annulus. The visual line is `Z_W(N)` and the
excursion `max |Z_W|`.

Why it could be a line:

Squares are intrinsic to multiplication and the `sqrt` scale in prime
error terms, but this construction avoids zeta and zeros. If primes have a
real square-root cancellation geometry beyond density, the phase drift
after exact square-annulus/W-shell centering might be unusually flat for
real primes and visibly less random than Cramer labels or composite
controls. This is not a digit ordering and not a neighbor-factor statistic.

Pre-registered confirmation:

Across `N` growth, real `max |Z_W|` is stable and smaller than at least 15
Cramer, W-shell random, and composite controls; the effect appears in
fresh holdout annuli; named composites `25`, `35`, `77`, and `289` fail
the prime-input claim; and the finite-field analogue by degree shell shows
a comparable centered phase law or a clean S2 divergence.

Pre-registered break:

Exact W-shell random labels or composites reproduce the flatness; the
uncentered line is just the density gradient across square intervals; the
effect is driven by square endpoints or one residue class; named
composites satisfy the same predicate; or the statistic is only another
local-shell centering identity rather than prime regularity.

### SEE IT

Commands:

```sh
node --check scripts/square-phase-prime-drift-audit.mjs
node scripts/explore.mjs eval '{"domain":"prime","N":200000,"ex":"n","ey":"2*frac(sqrt(n))-1"}'
node scripts/square-phase-prime-drift-audit.mjs 8000000 logs/playground-artifacts
node scripts/square-phase-prime-drift-audit.mjs 16000000 logs/playground-artifacts
qlmanage -t -s 1400 -o logs/playground-artifacts logs/playground-artifacts/square-phase-prime-drift-16000000.svg
node scripts/explore.mjs shot '{"domain":"prime","N":200000,"ex":"n","ey":"2*frac(sqrt(n))-1"}' logs/playground-artifacts/square-phase-raw-lab-200k.png
```

Raw LAB square phase at `N=200000`:

```json
{"n":17984,"finiteFrac":1,"linearity":0.0000021143463441169657,"slope":1.4253287353544098e-8,"intercept":-0.003806379307674311,"flatness":1.1549291291636743,"zeroCrossings":892,"monotonicity":0.9503975977311906,"yMin":-0.997747750603935,"yMax":0.9955257158732138}
```

The raw picture is the expected square-annulus sawtooth. The audit SVG is
the actual candidate view: after exact `W=2310` square-annulus centering,
the real `Z` trace sits with the null traces.

Artifacts:

- `logs/playground-artifacts/square-phase-prime-drift-8000000.md`
- `logs/playground-artifacts/square-phase-prime-drift-8000000.json`
- `logs/playground-artifacts/square-phase-prime-drift-8000000.svg`
- `logs/playground-artifacts/square-phase-prime-drift-16000000.md`
- `logs/playground-artifacts/square-phase-prime-drift-16000000.json`
- `logs/playground-artifacts/square-phase-prime-drift-16000000.svg`
- `logs/playground-artifacts/square-phase-prime-drift-16000000.svg.png`
- `logs/playground-artifacts/square-phase-raw-lab-200k.png`

### GROUND IT

Setup:

- square phase: `phi(n)=2*(n-k^2)/(2k+1)-1`, `k=floor(sqrt(n))`;
- local null: exact mean and variance of `phi` over integers in the same
  square annulus with `gcd(n,2310)=1`;
- controls: 15 Cramer seeds, 15 `W=2310` log-density random seeds, and
  15 `W=2310` log-density composite seeds;
- endpoints: `1M`, `2M`, `4M`, `8M`, `16M`;
- holdout: `(8M,16M]`.

Endpoint at `N=8,000,000`:

| object | endpoint value |
| --- | ---: |
| real labels | `539771` |
| real `Z` | `0.735024` |
| real max `|Z|` | `1.428432` |
| Cramer final `Z` range | `-2.730755..1.644526` |
| W-random final `Z` range | `-1.239943..1.490885` |
| W-composite final `Z` range | `-1.729217..0.891807` |
| Cramer max `|Z|` range | `1.073587..3.110663` |
| W-random max `|Z|` range | `1.235291..2.403408` |
| W-composite max `|Z|` range | `1.289472..2.667986` |

Endpoint at `N=16,000,000`:

| object | endpoint value |
| --- | ---: |
| real labels | `1031124` |
| real raw centered sum | `675.017602` |
| real sqrt variance | `586.256518` |
| real `Z` | `1.151403` |
| real max `|Z|` | `1.428432` |
| real raw exponent | `0.761148` |
| Cramer final `Z` range | `-1.170554..1.127142` |
| W-random final `Z` range | `-1.304422..1.055765` |
| W-composite final `Z` range | `-1.897717..0.286703` |
| Cramer max `|Z|` range | `1.073587..3.110663` |
| W-random max `|Z|` range | `1.235646..2.403408` |
| W-composite max `|Z|` range | `1.289472..2.667986` |

The endpoint `Z` is slightly outside the Cramer endpoint range but inside
the better W-random and W-composite max-excursion ranges. The candidate
claimed unusual flatness; exact W-shell controls reproduce that flatness.

Fresh holdout `(8,000,000,16,000,000]`:

| object | result |
| --- | ---: |
| real labels | `491353` |
| real holdout `Z` | `1.095728` |
| Cramer holdout `Z` range | `-1.019844..1.333675` |
| W-random holdout `Z` range | `-1.068868..1.551592` |
| W-composite holdout `Z` range | `-1.329624..1.232813` |

Named composite check:

- `25`, `35`, and `77` are not W-eligible;
- `289` is W-eligible and has one-step centered score `-1.573133`, but it
  is not a prime input. The single-label square-phase mechanism is not
  prime-exclusive.

Function-field check:

No coordinate-free finite-field square phase was used. Inside a fixed
degree shell every monic polynomial has the same norm; ordering lower
coefficients would reintroduce the coefficient-ordering artifact. This is
a disciplined refusal rather than a missing computation.

### BREAK

Status: `GRAVEYARD / SQUARE-ANNULUS LOCAL-SHELL RANDOM WALK`.

The candidate breaks at the intended adversary. Once every prime is
centered against the exact square-annulus `W=2310` candidate shell, the
real cumulative `Z` is an ordinary small random walk. At `16M`, real
max `|Z|=1.428432`, while W-random controls span `1.235646..2.403408` and
W-composite controls span `1.289472..2.667986`. The holdout endpoint is
also inside controls.

There is no transported two-universe law because the proposed
finite-field analogue would require choosing an order inside equal-degree
polynomial shells. That is exactly the coefficient-ordering artifact the
ledger says to avoid.

### LEARN

The square-root geometry was not enough. A `sqrt`-natural coordinate can
still become a local-shell centering identity: subtract the exact annulus
candidate mean, and primes stop looking special. The useful pattern is the
same one as several previous breaks: when the null is built at the same
resolution as the candidate, apparent flatness becomes generic.

CONNECTION: this connects to the rough-shell residue-current and primorial
recovery-debt breaks. It also sharpens Cycle 77's lesson: coordinate
choices are not only digit/lex artifacts. Even a geometrically intrinsic
coordinate like square phase must survive the exact local candidate shell
before it can claim prime regularity.

## HANDOFF 78

Status: no critical-line survivor. Cycle 78 tested square-phase prime
drift:

`Z_W(N)=sum_{p<=N}(phi(p)-E_W(phi|square annulus))/sqrt(sum Var_W)`,

with `phi(n)=2*(n-floor(sqrt(n))^2)/(2floor(sqrt(n))+1)-1` and exact
`W=2310` square-annulus mean/variance. At `N=16,000,000`, real had
`1,031,124` scored primes, raw centered sum `675.017602`, sqrt variance
`586.256518`, endpoint `Z=1.151403`, and max `|Z|=1.428432`. Exact-shell
controls reproduced the flatness: W-random max `|Z|=1.235646..2.403408`;
W-composite max `|Z|=1.289472..2.667986`. Fresh holdout `(8M,16M]` real
`Z=1.095728` also sat inside all control ranges.

New code since the previous handoff:

- `scripts/square-phase-prime-drift-audit.mjs`

New artifacts:

- `logs/playground-artifacts/square-phase-prime-drift-8000000.md`
- `logs/playground-artifacts/square-phase-prime-drift-8000000.json`
- `logs/playground-artifacts/square-phase-prime-drift-8000000.svg`
- `logs/playground-artifacts/square-phase-prime-drift-16000000.md`
- `logs/playground-artifacts/square-phase-prime-drift-16000000.json`
- `logs/playground-artifacts/square-phase-prime-drift-16000000.svg`
- `logs/playground-artifacts/square-phase-prime-drift-16000000.svg.png`
- `logs/playground-artifacts/square-phase-raw-lab-200k.png`

No core primitive was added. Next cycle should avoid one-dimensional
coordinates with a natural exact shell. Better next guesses: a genuinely
two-universe statistic with no integer ordering analogue, or a
coordinate-free graph/operator statistic whose null is not simply the
candidate shell itself.

## Cycle 79 — elliptic Hasse-trace moment line

### HALLUCINATE

Guess:

Leave gap geometry and local integer shells. Fix the non-CM elliptic curve

`E: y^2 = x^3 - x + 1`.

For each good prime `p`, compute the Hasse trace

`a_p = p + 1 - #E(F_p)`.

Use the Sato-Tate second moment residual

`U_2(p)=a_p^2/p - 1`.

The candidate line is

`Z_E(N)=sum_{p<=N} U_2(p) / sqrt(pi(N))`.

Why it could be a line:

This routes around zeta/zeros and around integer local shells by importing
an external arithmetic object. Hasse traces are bounded by `2sqrt(p)` and
Sato-Tate predicts a real zero-mean law for non-CM curves; a prime-specific
critical line would be a flat `sqrt(pi)` residual that is noticeably more
rigid than generic Sato-Tate/order shuffles. The object is not a gap sum,
not Chebyshev mass, and not a coefficient ordering over `F_q[t]`.

Pre-registered confirmation:

Across growing ranges, `Z_E(N)` and max `|Z_E|` are stable and smaller
than at least 15 trace-shuffle and Cramer-index resampling controls. The
fresh holdout block also stays unusually flat. The first moment
`sum a_p/(2sqrt(p))` should not carry the result alone. Named composites
`25`, `35`, `77`, and `289` must fail the prime-field input claim.

Pre-registered break:

Trace shuffles, Sato-Tate resampling, or Cramer-index controls reproduce
the excursion; a different curve changes the effect incoherently; the
signal is just the known Sato-Tate moment law with random-walk fluctuations;
CM/local residue obstructions explain the line; or composite modulus
extensions produce the same statistic and make the prime-field claim
nonexclusive.

### SEE IT

Commands:

```sh
node --check scripts/elliptic-hasse-trace-audit.mjs
node scripts/explore.mjs eval '{"domain":"prime","N":80000,"ex":"pi(n)","ey":"sin(n*sqrt(2))/sqrt(pi(n))"}'
node scripts/elliptic-hasse-trace-audit.mjs 80000 logs/playground-artifacts
qlmanage -t -s 1400 -o logs/playground-artifacts logs/playground-artifacts/elliptic-hasse-trace-80000.svg
node scripts/explore.mjs shot '{"domain":"prime","N":80000,"ex":"pi(n)","ey":"sin(n*sqrt(2))/sqrt(pi(n))"}' logs/playground-artifacts/elliptic-trace-bounded-proxy-80k.png
```

LAB bounded-walk proxy at `N=80000`:

```json
{"n":7837,"finiteFrac":1,"linearity":0.000004957185092773137,"slope":-2.334015942506067e-8,"intercept":0.0002297388543681293,"flatness":1.6635811336788358,"zeroCrossings":4258,"monotonicity":-0.0005104645227156713,"yMin":-0.6305145688057643,"yMax":0.40926125766079885}
```

The Hasse trace itself is not a native LAB chip, so the real picture is the
audit SVG built from exact point counts. It shows real `Z2` near zero and
well below generic max-excursion controls.

Artifacts:

- `logs/playground-artifacts/elliptic-hasse-trace-80000.md`
- `logs/playground-artifacts/elliptic-hasse-trace-80000.json`
- `logs/playground-artifacts/elliptic-hasse-trace-80000.svg`
- `logs/playground-artifacts/elliptic-hasse-trace-80000.svg.png`
- `logs/playground-artifacts/elliptic-trace-bounded-proxy-80k.png`

### GROUND IT

Curve:

`E: y^2=x^3-x+1`, bad primes `2` and `23` removed.

For each good prime `p <= 80000`, the script computes
`a_p = -sum_x chi(x^3-x+1)` exactly. Hasse sanity passes:

- good primes counted: `7835`;
- mean `a_p/(2sqrt(p))`: `-0.002175`;
- mean `U2=a_p^2/p-1`: `-0.003971`;
- max `|a_p|/(2sqrt(p))`: `0.994550`.

Endpoint trace:

| N | good primes | sum U2 | Z2 | max `|Z2|` | first-moment Z1 |
| ---: | ---: | ---: | ---: | ---: | ---: |
| `5000` | `667` | `-12.206097` | `-0.472622` | `2.000000` | `-0.990990` |
| `10000` | `1227` | `-13.681355` | `-0.390577` | `2.000000` | `-0.532066` |
| `20000` | `2260` | `-26.256292` | `-0.552305` | `2.000000` | `-0.787605` |
| `40000` | `4201` | `23.221266` | `0.358269` | `2.000000` | `-0.559497` |
| `80000` | `7835` | `-31.109455` | `-0.351458` | `2.000000` | `-0.384956` |

Controls, 15 seeds:

| control | final Z2 range | final `|Z2|` range | max `|Z2|` range |
| --- | ---: | ---: | ---: |
| trace shuffle | `-0.351458..-0.351458` | `0.351458..0.351458` | `1.578314..2.881151` |
| observed-trace bootstrap | `-2.284275..1.432939` | `0.045491..2.284275` | `1.502925..3.787077` |
| Sato-Tate sample | `-2.102391..1.793623` | `0.091833..2.102391` | `1.771226..3.265835` |
| Cramer-index resample | `-1.959398..1.099268` | `0.004708..1.959398` | `1.725203..2.692539` |

The trace-shuffle final `Z2` is identical by construction because it
permutes the same endpoint multiset; its max-excursion range is the useful
comparison. The real max `|Z2|=2.000000` sits inside all four control
families.

Fresh holdout `(40000,80000]`:

| object | Z2/range |
| --- | ---: |
| real | `-0.901266` |
| trace shuffle | `-2.728943..0.558556` |
| observed-trace bootstrap | `-2.211752..1.418110` |
| Sato-Tate sample | `-2.178526..1.599391` |
| Cramer-index resample | `-2.412004..1.435395` |

Named composites `25`, `35`, `77`, and `289` fail the prime-field input:
`#E(F_n)` and Hasse trace `a_n` are not defined for composite modulus
`n`.

Factor check:

This object does not telescope to `theta`, `psi`, or `M`; it is a bounded
Frobenius trace statistic. The break is different: the candidate is simply
the known Sato-Tate moment law plus generic random-walk fluctuation. The
prime labels are carrying curve arithmetic, not a new prime critical line.

### BREAK

Status: `GRAVEYARD / SATO-TATE TRACE-DISTRIBUTION NOISE`.

The elliptic detour avoided the Chebyshev and local-shell funnels, but it
did not produce a critical line. Real `Z2(80000)=-0.351458` is tiny, and
the max excursion `2.000000` is reproduced by observed-trace shuffles,
bootstrap samples, Sato-Tate samples, and Cramer-index resampling. The
fresh holdout is also ordinary.

This is still useful: importing a deep arithmetic object is not enough.
If the statistic only asks for a one-curve Sato-Tate moment, the correct
null is the trace distribution itself. Once that null is installed, the
line is generic bounded-moment noise.

### LEARN

The "different field" move works only if the statistic couples prime
regularity to the imported object. A single elliptic curve's Hasse moments
mostly test Sato-Tate equidistribution; shuffling the same traces keeps
the endpoint moment and reproduces the excursion. A sharper future
elliptic attempt should use a family statistic where prime position and
curve parameter interact, closer to murmurations, rather than a fixed
curve moment.

CONNECTION: this is not another local-shell collapse; it is the external
arithmetic analogue of the automatic-sequence break. In both cases a
genuine theorem-level distribution exists, but the candidate line measured
that distribution's generic random walk rather than prime regularity.

## HANDOFF 79

Status: no critical-line survivor. Cycle 79 tested the non-CM elliptic
curve `E: y^2=x^3-x+1`. For good primes `p`, exact point counts gave
`a_p=p+1-#E(F_p)` and the second Sato-Tate moment residual
`U2(p)=a_p^2/p-1`. At `N=80000`, there were `7835` good primes,
`sum U2=-31.109455`, endpoint `Z2=-0.351458`, and max `|Z2|=2.000000`.
Controls reproduced the excursion: trace-shuffle max `|Z2|`
`1.578314..2.881151`, bootstrap `1.502925..3.787077`, Sato-Tate sample
`1.771226..3.265835`, and Cramer-index resampling
`1.725203..2.692539`. Holdout `(40000,80000]` real `Z2=-0.901266` sat
inside every control range.

New code since the previous handoff:

- `scripts/elliptic-hasse-trace-audit.mjs`

New artifacts:

- `logs/playground-artifacts/elliptic-hasse-trace-80000.md`
- `logs/playground-artifacts/elliptic-hasse-trace-80000.json`
- `logs/playground-artifacts/elliptic-hasse-trace-80000.svg`
- `logs/playground-artifacts/elliptic-hasse-trace-80000.svg.png`
- `logs/playground-artifacts/elliptic-trace-bounded-proxy-80k.png`

No core primitive was added. Next cycle: if staying elliptic, use a
curve-family or parameter/primes interaction statistic, not a fixed-curve
moment. Otherwise return to two-universe graph/operator statistics with a
null that is not just distribution shuffling.

## Cycle 80 — elliptic family mean-trace bridge

### HALLUCINATE

Guess:

Try the elliptic route again, but use a family instead of one fixed curve.
For integer parameters `1 <= a <= A`, define

`E_a: y^2 = x^3 + a*x + 1`.

For each good prime `p`, compute the Hasse traces `a_p(E_a)` and form the
family mean

`M_A(p)=mean_a a_p(E_a)/(2*sqrt(p))`.

Since an independent Sato-Tate trace has variance `1/4`, normalize

`V_A(p)=2*sqrt(good_a_count)*M_A(p)`.

The candidate line is

`Z_A(N)=sum_{p<=N} V_A(p)/sqrt(good_prime_count)`.

Why it could be a line:

Cycle 79 died because one fixed curve only measured the trace
distribution. A family average is closer to the murmurations habitat:
prime position and curve parameter interact. If there is a hidden
prime-family synchronization, the cumulative normalized family mean could
be unusually flat versus trace shuffles, bootstrap controls, and
Sato-Tate normal samples.

Pre-registered confirmation:

For `A=256`, real `Z_A(N)` and max `|Z_A|` are stable and outside at least
15 trace-shuffle/bootstrap/Sato-Tate controls. A holdout block also stays
flat. Repeating with `A=128` gives the same scale. Named composites `25`,
`35`, `77`, and `289` fail the prime-field input claim.

Pre-registered break:

Trace shuffles, bootstrap controls, or Sato-Tate normal samples reproduce
the excursion; the `A=128` holdout changes scale incoherently; the effect
is a complete-parameter character-sum artifact; the first few small primes
dominate; or the statistic is merely generic family Sato-Tate noise rather
than a prime critical line.

### SEE IT

Commands:

```sh
node --check scripts/elliptic-family-mean-trace-audit.mjs
node scripts/explore.mjs eval '{"domain":"prime","N":5000,"ex":"pi(n)","ey":"sin(n*sqrt(3))/sqrt(pi(n))"}'
node scripts/elliptic-family-mean-trace-audit.mjs 5000 logs/playground-artifacts 256 128
qlmanage -t -s 1400 -o logs/playground-artifacts logs/playground-artifacts/elliptic-family-mean-trace-5000.svg
node scripts/explore.mjs shot '{"domain":"prime","N":5000,"ex":"pi(n)","ey":"sin(n*sqrt(3))/sqrt(pi(n))"}' logs/playground-artifacts/elliptic-family-bounded-proxy-5k.png
```

LAB bounded-walk proxy at `N=5000`:

```json
{"n":669,"finiteFrac":1,"linearity":0.00012552935389680206,"slope":-0.000004030914668494006,"intercept":-0.0002912274013649027,"flatness":1.4422459334569144,"zeroCrossings":361,"monotonicity":0.005988023952095809,"yMin":-0.6259668197747617,"yMax":0.3996380957575459}
```

The exact audit SVG is the real picture. The family trace creates a very
strong negative line, but observed-family shuffles and bootstrap controls
carry the same scale. The normal zero-mean line is visibly the wrong null.

Artifacts:

- `logs/playground-artifacts/elliptic-family-mean-trace-5000.md`
- `logs/playground-artifacts/elliptic-family-mean-trace-5000.json`
- `logs/playground-artifacts/elliptic-family-mean-trace-5000.svg`
- `logs/playground-artifacts/elliptic-family-mean-trace-5000.svg.png`
- `logs/playground-artifacts/elliptic-family-bounded-proxy-5k.png`

### GROUND IT

Setup:

- family: `E_a: y^2=x^3+a*x+1`, integer `1<=a<=A`;
- primary family size: `A=256`;
- stability check: `A=128`;
- for each prime `p<=5000`, bad reductions are skipped and
  `V_A(p)=sum_a a_p(E_a)/(sqrt(p)*sqrt(good_a_count))`;
- score: `Z_A(N)=sum_{p<=N}V_A(p)/sqrt(good prime count)`;
- controls: 15 observed-value shuffles, 15 observed-value bootstraps,
  15 zero-mean normal controls, and 15 Cramer-index observed-value
  resamplings.

Primary endpoint trace:

| N | primes | sum V | Z | max `|Z|` |
| ---: | ---: | ---: | ---: | ---: |
| `313` | `63` | `-114.877096` | `-14.473154` | `14.820198` |
| `625` | `112` | `-153.010617` | `-14.458144` | `14.820198` |
| `1250` | `202` | `-214.803462` | `-15.113519` | `15.151199` |
| `2500` | `365` | `-281.407346` | `-14.729534` | `15.231524` |
| `5000` | `667` | `-358.083478` | `-13.865048` | `15.231524` |

The first grounding fact is already fatal: the family values have empirical
mean `-0.536857`, standard deviation `1.040261`, and range
`-9.651538..2.315157`. The candidate assumed a zero main term, but this
finite parameter window has a large negative mean.

Endpoint controls:

| control | final Z range | final `|Z|` range | max `|Z|` range |
| --- | ---: | ---: | ---: |
| shuffle | `-13.865048..-13.865048` | `13.865048..13.865048` | `13.865048..14.266289` |
| bootstrap | `-15.373721..-11.335259` | `11.335259..15.373721` | `11.433563..15.387563` |
| normal zero-mean | `-0.949710..1.366729` | `0.011292..1.366729` | `1.303893..2.754981` |
| Cramer-index | `-16.119260..-11.605470` | `11.605470..16.119260` | `11.638374..16.209495` |

The zero-mean normal controls fail, but they fail because they omit the
empirical family bias. Observed-value shuffles, bootstraps, and
Cramer-index resampling reproduce the line.

Empirical-centered diagnostic for `A=256`:

| N | centered Z | centered max `|Z|` |
| ---: | ---: | ---: |
| `313` | `-10.211985` | `12.371090` |
| `625` | `-8.776586` | `12.371090` |
| `1250` | `-7.483350` | `12.371090` |
| `2500` | `-4.472899` | `12.371090` |
| `5000` | `0.000000` | `12.371090` |

This is not a rescue: the endpoint is zero by construction after
subtracting the final empirical mean, but the path has a large early-prime
transient. The final holdout block flips to centered `Z=4.917361`,
showing the effect is not stable.

Fresh holdout `(2500,5000]`:

| object | Z/range |
| --- | ---: |
| real uncentered | `-4.412216` |
| shuffle | `-10.162412..-8.095958` |
| bootstrap | `-11.160281..-7.698605` |
| normal zero-mean | `-1.585803..1.908425` |
| Cramer-index | `-11.688548..-7.594660` |

The holdout block does not preserve the endpoint effect size; the
unshifted line is strongest in the early range.

Family-size check:

For `A=128`, the endpoint is still negative but at a different scale:
value mean `-0.362713`, endpoint `Z=-9.367562`, and max `|Z|=10.989824`.
This supports finite-window character-sum bias, not an invariant family
critical line.

Named composites `25`, `35`, `77`, and `289` fail the prime-field input:
the family trace over `F_n` is not defined for composite modulus `n`.

Factor check:

This is not a Chebyshev, Mertens, or gap-telescope identity. It breaks by
main-term misfit: the finite family `1<=a<=A` has a large incomplete
character-sum mean. Once the observed distribution is used as the null,
the large line is generic.

### BREAK

Status: `GRAVEYARD / INCOMPLETE ELLIPTIC-FAMILY CHARACTER-SUM BIAS`.

The curve-family move found a dramatic line, but it is the wrong line.
The family average is not centered: `mean V_256=-0.536857`, so
`Z_256(5000)=-13.865048` is a main-term failure. Distribution-aware nulls
reproduce it: bootstrap max `|Z|=11.433563..15.387563`, Cramer-index max
`|Z|=11.638374..16.209495`, and shuffle max
`|Z|=13.865048..14.266289`.

The centered diagnostic also breaks. Removing the final empirical mean
forces endpoint zero but leaves a large early transient and a positive
holdout block. The `A=128` check changes the scale. This is an incomplete
finite-parameter character-sum artifact, not prime regularity.

### LEARN

Murmuration-like experiments need a genuine family parameter and a
careful family main term. A box `1<=a<=A` is not automatically centered
just because the full family over a finite field has equidistribution
heuristics. The next elliptic attempt must either use complete parameter
families modulo `p` with exact moment formulas, or use conductor-sorted
families where the main term is modeled before any line is scored.

CONNECTION: this is the family version of the Thue-Morse and square-phase
breaks. A tempting line appears when the wrong mean is assumed; the right
null is not zero-mean Sato-Tate but the actual finite-window character-sum
distribution.

## HANDOFF 80

Status: no critical-line survivor. Cycle 80 tested the elliptic family
`E_a: y^2=x^3+a*x+1` for integer `1<=a<=A`, using
`V_A(p)=sum_a a_p(E_a)/(sqrt(p)*sqrt(good_a_count))` and
`Z_A(N)=sum_{p<=N}V_A(p)/sqrt(good prime count)`. At `N=5000`, `A=256`
had `667` scored primes, value mean `-0.536857`, endpoint
`Z=-13.865048`, and max `|Z|=15.231524`. The line is reproduced by
observed-family controls: bootstrap max `|Z|=11.433563..15.387563`,
Cramer-index max `11.638374..16.209495`, and shuffle max
`13.865048..14.266289`. Zero-mean normal controls fail only because they
omit the finite-family bias. The empirical-centered endpoint is zero by
construction but retains max `|Z|=12.371090`; its final holdout block is
positive `Z=4.917361`. `A=128` has endpoint `Z=-9.367562`, confirming
scale instability.

New code since the previous handoff:

- `scripts/elliptic-family-mean-trace-audit.mjs`

New artifacts:

- `logs/playground-artifacts/elliptic-family-mean-trace-5000.md`
- `logs/playground-artifacts/elliptic-family-mean-trace-5000.json`
- `logs/playground-artifacts/elliptic-family-mean-trace-5000.svg`
- `logs/playground-artifacts/elliptic-family-mean-trace-5000.svg.png`
- `logs/playground-artifacts/elliptic-family-bounded-proxy-5k.png`

No core primitive was added. Next cycle: either build an exact
complete-parameter elliptic family moment with a proved finite-field main
term, or leave elliptic curves and return to a two-universe
graph/operator statistic.

## Cycle 81 — complete elliptic family trace main line

### HALLUCINATE

Guess:

Complete the parameter family from Cycle 80. For each prime `p`, take all
parameters `a in F_p` and the family

`E_a: y^2=x^3+a*x+1`,

discarding singular reductions `4a^3+27=0`. Define

`S(p)=sum_good_a a_p(E_a)`.

The candidate line is the complete-family normalized mean

`C(p)=S(p)/(sqrt(p)*sqrt(good_a_count))`,

and the cumulative bridge

`Z(N)=sum_{p<=N}(C(p)-main(p))/sqrt(pi(N))`.

Why it could be a line:

Cycle 80 failed because the finite parameter window `1<=a<=A` had an
uncentered incomplete character-sum bias. Completing the family modulo
each prime should install the natural finite-field main term. If a
murmuration-like prime/parameter interaction remains after that main term,
it should show up as a stable residual line rather than finite-window
drift.

Pre-registered confirmation:

The exact complete-family residual is not identically zero, has a stable
sqrt-scale line across growing `N`, and is not reproduced by shuffled
prime labels or by replacing primes with Cramer-index sample counts. The
main term is derived and checked by brute force for small primes. Named
composites `25`, `35`, `77`, and `289` fail the prime-field input claim.

Pre-registered break:

The complete-family sum collapses to an exact character-sum identity; the
residual after the derived main term is identically zero or bounded by only
the explicitly excluded singular curves; shuffled controls reproduce any
remaining path; or the line is only a finite-field theorem check rather
than prime regularity.

### SEE IT

Commands:

```sh
node --check scripts/complete-elliptic-family-trace-audit.mjs
node scripts/explore.mjs eval '{"domain":"prime","N":50000,"ex":"pi(n)","ey":"0"}'
node scripts/complete-elliptic-family-trace-audit.mjs 50000 logs/playground-artifacts
qlmanage -t -s 1400 -o logs/playground-artifacts logs/playground-artifacts/complete-elliptic-family-trace-50000.svg
node scripts/explore.mjs shot '{"domain":"prime","N":50000,"ex":"pi(n)","ey":"0"}' logs/playground-artifacts/complete-elliptic-family-zero-residual-50k.png
```

LAB zero-residual proxy at `N=50000`:

```json
{"n":5133,"finiteFrac":1,"linearity":1,"slope":0,"intercept":0,"flatness":0,"zeroCrossings":0,"monotonicity":0,"yMin":0,"yMax":0}
```

The audit SVG is the real picture. The raw complete-family trace is a
steep negative line, but it lies exactly on the derived finite-field main
term; the residual is identically zero.

Artifacts:

- `logs/playground-artifacts/complete-elliptic-family-trace-50000.md`
- `logs/playground-artifacts/complete-elliptic-family-trace-50000.json`
- `logs/playground-artifacts/complete-elliptic-family-trace-50000.svg`
- `logs/playground-artifacts/complete-elliptic-family-trace-50000.svg.png`
- `logs/playground-artifacts/complete-elliptic-family-zero-residual-50k.png`

### GROUND IT

Family:

`E_a: y^2=x^3+a*x+1`, complete parameters `a in F_p`, singular
parameters `4a^3+27=0` discarded.

Derived identity:

`sum_{a in F_p} a_p(E_a) = -p`.

Reason:

`a_p(E_a)=-sum_x chi(x^3+a*x+1)`. For `x=0`, the inner character is
always `chi(1)=1`, contributing `p`; for `x!=0`, the map
`a -> x^3+a*x+1` is a bijection of `F_p`, so the character sum is zero.
Discarding singular parameters only adds the explicit singular-trace
correction.

Brute-force validation:

The script recomputed the good-parameter sum directly for primes
`5 <= p <= 97`; every row matched the formula. Examples:

| p | singular count | formula good sum | brute good sum | good count |
| ---: | ---: | ---: | ---: | ---: |
| `5` | `1` | `-6` | `-6` | `4` |
| `31` | `3` | `-28` | `-28` | `28` |
| `43` | `3` | `-46` | `-46` | `40` |
| `97` | `0` | `-97` | `-97` | `97` |

Endpoint trace:

| N | primes | raw Z | exact-main Z | singular-correction Z | residual Z |
| ---: | ---: | ---: | ---: | ---: | ---: |
| `3125` | `443` | `-21.080418` | `-21.080418` | `-0.001273` | `0.000000` |
| `6250` | `810` | `-28.486120` | `-28.486120` | `-0.000823` | `0.000000` |
| `12500` | `1490` | `-38.620364` | `-38.620364` | `-0.000602` | `0.000000` |
| `25000` | `2760` | `-52.550886` | `-52.550886` | `-0.000371` | `0.000000` |
| `50000` | `5131` | `-71.642604` | `-71.642604` | `-0.000279` | `0.000000` |

The singular-count histogram through `50000` is
`{"0":1705,"1":2575,"3":851}`. These singular corrections are explicitly
included in the exact main term and leave no residual.

Named composites `25`, `35`, `77`, and `289` fail the prime-field input:
the complete parameter family `E_a/F_p` is only defined over prime fields
in this audit.

Factor check:

This is not a Chebyshev, Mertens, or gap-telescope identity. It collapses
instead to a finite-field character-sum identity. After subtracting the
exact complete-family main term, the residual is identically zero by
derivation and by brute-force validation on small primes.

### BREAK

Status: `GRAVEYARD / EXACT COMPLETE-FAMILY CHARACTER-SUM IDENTITY`.

The complete-family repair worked too well: it removed the finite-window
bias from Cycle 80 by installing an exact finite-field identity. The raw
line is enormous, `raw Z=-71.642604` at `N=50000`, but the exact main term
has the same value and the residual is `0` at every endpoint. This is a
theorem check, not a prime critical line.

### LEARN

Complete parameter families are excellent for killing false elliptic main
terms, but the first moment is too algebraically rigid. The next elliptic
family experiment must either use a moment whose complete-family main term
is nontrivial but not identical to the observation, or use a conductor
family where the main term is known and the residual still has room to
move. The raw line itself is not evidence; it is the finite-field character
sum `-p` in disguise.

CONNECTION: direct continuation of Cycle 80. The incomplete finite-window
line became an exact complete-family identity once the correct universe
was installed. This is the elliptic-family analogue of local-shell
collapses: once the natural null/main term is exact enough, the apparent
critical line vanishes.

## HANDOFF 81

Status: no critical-line survivor. Cycle 81 tested the complete parameter
family `E_a: y^2=x^3+a*x+1` over `F_p`, discarding singular
`4a^3+27=0`. The all-parameter identity
`sum_{a in F_p} a_p(E_a)=-p` follows because the `x=0` character term
contributes `p` and every `x!=0` term sums to zero over `a`. Singular
parameter traces give an explicit small correction. Brute force for
`5<=p<=97` matched the formula exactly. At `N=50000`, raw complete-family
`Z=-71.642604`, exact-main `Z=-71.642604`, residual `Z=0`, and max
residual/sqrt `0`.

New code since the previous handoff:

- `scripts/complete-elliptic-family-trace-audit.mjs`

New artifacts:

- `logs/playground-artifacts/complete-elliptic-family-trace-50000.md`
- `logs/playground-artifacts/complete-elliptic-family-trace-50000.json`
- `logs/playground-artifacts/complete-elliptic-family-trace-50000.svg`
- `logs/playground-artifacts/complete-elliptic-family-trace-50000.svg.png`
- `logs/playground-artifacts/complete-elliptic-family-zero-residual-50k.png`

No core primitive was added. Next cycle should leave elliptic first
moments alone. Possible next move: complete-family second moments, or a
two-universe graph/operator statistic with an exact but nontrivial null.

## Cycle 82 — complete elliptic family second-moment line

### HALLUCINATE

Guess:

Keep the complete finite-field parameter family from Cycle 81 but move to
the second trace moment. For each prime `p`, use

`E_a: y^2=x^3+a*x+1`, `a in F_p`,

discard singular parameters `4a^3+27=0`, and define

`M2(p)=sum_good_a a_p(E_a)^2`.

The candidate line is the Sato-Tate-normalized complete-family residual

`U2(p)=M2(p)/(p*good_count)-1`,

and the cumulative bridge

`Z2(N)=sum_{p<=N}(U2(p)-main2(p))/sqrt(pi(N))`.

Why it could be a line:

Cycle 81's first moment was too rigid because each nonzero `x` gave a
linear character sum over `a`. Squaring the trace couples two coordinates
`x,y`; the equality of the two linear roots is not a straight diagonal
only but a curved constraint. A complete-family second moment might leave
an intrinsic finite-field residue that is not a density-only Cramer line
and not a Chebyshev/Mertens telescope.

Working algebra to validate before trusting pictures:

`a_p(E_a)=-sum_x chi(x^3+a*x+1)`, so

`sum_a a_p(E_a)^2=sum_{x,y}sum_a chi((x^3+a*x+1)(y^3+a*y+1))`.

For `x,y!=0`, equality of the two roots is

`x^2+x^-1 = y^2+y^-1`, hence either `x=y` or

`xy(x+y)=1`.

So the second moment may reduce to a diagonal term plus a finite-field
curve sum over `xy(x+y)=1`. That curve-sum residue is the object to test,
not hand-wave away.

Pre-registered confirmation:

After deriving and subtracting the exact diagonal/curve main term, the
residual is nonzero, stable at sqrt scale across growing `N`, and not
reproduced by trace shuffles, sign flips, Cramer-index resampling, or
observed-value bootstraps. Named composites `25`, `35`, `77`, and `289`
fail the prime-field input. The small-prime formula matches brute force.

Pre-registered break:

The apparent line collapses to an exact low-dimensional character-sum
identity; the exact residual is identically zero; or the remaining
curve-sum path is just fixed-curve/Sato-Tate-style noise reproduced by
shuffle/bootstrap controls. If the effect is only the wrong main term
`M2/(p*good_count)-1`, it is a theorem check, not a prime critical line.

### SEE IT

Commands:

```sh
node --check scripts/complete-elliptic-family-second-moment-audit.mjs
node scripts/explore.mjs eval '{"domain":"prime","N":50000,"ex":"pi(n)","ey":"0"}'
node scripts/complete-elliptic-family-second-moment-audit.mjs 50000 logs/playground-artifacts
qlmanage -t -s 1400 -o logs/playground-artifacts logs/playground-artifacts/complete-elliptic-family-second-moment-50000.svg
node scripts/explore.mjs shot '{"domain":"prime","N":50000,"ex":"pi(n)","ey":"0"}' logs/playground-artifacts/complete-elliptic-family-second-moment-zero-50k.png
```

LAB zero-residual proxy at `N=50000`:

```json
{"n":5133,"finiteFrac":1,"linearity":1,"slope":0,"intercept":0,"flatness":0,"zeroCrossings":0,"monotonicity":0,"yMin":0,"yMax":0}
```

The audit SVG is the real picture. The Sato-Tate-centered second-moment
path is nearly flat, the all-parameter path is nearly flat, and the exact
residual after the trace-pair main term is the zero line. There is no
hidden 2-D structure in the `shot` proxy.

Artifacts:

- `logs/playground-artifacts/complete-elliptic-family-second-moment-50000.md`
- `logs/playground-artifacts/complete-elliptic-family-second-moment-50000.json`
- `logs/playground-artifacts/complete-elliptic-family-second-moment-50000.svg`
- `logs/playground-artifacts/complete-elliptic-family-second-moment-50000.svg.png`
- `logs/playground-artifacts/complete-elliptic-family-second-moment-zero-50k.png`

### GROUND IT

Family:

`E_a: y^2=x^3+a*x+1`, complete parameters `a in F_p`, singular
parameters `4a^3+27=0` discarded.

Derived identity:

`sum_{a in F_p} a_p(E_a)^2 = p^2 + p*(C_p - R_p)`,

where

`R_p=#{x in F_p*: 2*x^3=1}`,

and

`C_p=sum_u chi(u*(1-4*u^3)) = -a_p(y^2=x^3-4)-chi(-1)`.

Reason:

Expanding the square gives a double character sum over `x,y`. For
`x,y!=0`, the baseline quadratic character sum contributes
`-chi(xy)` unless the two linear roots in `a` are equal. Equality of the
roots is

`x^2+x^-1 = y^2+y^-1`,

so either `x=y` or `xy(x+y)=1`. Grouping the curved branch by `u=xy`
turns it into the quartic sum `sum_u chi(u*(1-4*u^3))`, and after
`v=1/u` this is the Hasse trace of the fixed CM curve
`y^2=x^3-4` plus `-chi(-1)`.

Good-parameter formula:

`M2_good(p)=p^2+p*(C_p-R_p)-sum_singular a_p(E_a)^2`.

Brute-force validation:

The script recomputed `sum_good_a a_p(E_a)^2` directly for every prime
`5<=p<=97`; every row matched the formula. Examples:

| p | singular count | curve sum | overlap roots | fixed trace | formula good M2 | brute good M2 | good count |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `5` | `1` | `-1` | `1` | `0` | `14` | `14` | `4` |
| `31` | `3` | `-3` | `3` | `4` | `772` | `772` | `28` |
| `43` | `3` | `9` | `3` | `-8` | `2104` | `2104` | `40` |
| `97` | `0` | `-6` | `0` | `5` | `8827` | `8827` | `97` |

Endpoint trace:

| N | primes | mean U2 | ST residual Z | energy r | all-a residual Z | exact residual Z | max abs Z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `3125` | `443` | `0.003845` | `0.080934` | `1.272152` | `0.026193` | `0.000000` | `0.554795` |
| `6250` | `810` | `0.001935` | `0.055085` | `1.145938` | `0.011720` | `0.000000` | `0.554795` |
| `12500` | `1490` | `0.001068` | `0.041229` | `1.139323` | `0.007334` | `0.000000` | `0.554795` |
| `25000` | `2760` | `0.000591` | `0.031059` | `1.147427` | `0.004808` | `0.000000` | `0.554795` |
| `50000` | `5131` | `0.000342` | `0.024529` | `1.216074` | `0.004353` | `0.000000` | `0.554795` |

Controls at full range:

| control | endpoint Z range | max abs Z range | energy r range |
| --- | ---: | ---: | ---: |
| shuffle | `0.024529..0.024529` | `0.026850..0.111884` | `1.216074..1.216074` |
| sign flip | `-0.007445..0.024620` | `0.393959..0.818224` | `-0.369092..1.220605` |
| bootstrap | `-0.007573..0.048920` | `0.019360..0.052610` | `-0.522032..2.137063` |
| Cramer-index | `-0.003448..0.048333` | `0.021066..0.086459` | `-0.170580..2.456894` |

Fresh holdout `(25000,50000]`: real `Z=0.002574`, inside shuffle
`0.003398..0.042166` up to sign-scale noise, sign-flip
`-0.005957..0.010653`, bootstrap `0.003524..0.060060`, and
Cramer-index `-0.016375..0.044831`.

Named composites `25`, `35`, `77`, and `289` fail the prime-field input:
the complete parameter family `E_a/F_p` and Hasse traces are finite-field
objects, and a composite modulus is not a field.

Factor check:

This is not a Chebyshev, Mertens, or gap-telescope identity. It collapses
instead to an exact finite-field trace-pair identity. The only
non-diagonal term is the Hasse trace of the fixed CM elliptic curve
`y^2=x^3-4` plus an explicit overlap correction. After subtracting that
exact main term, the residual is identically zero.

### BREAK

Status: `GRAVEYARD / CM TRACE-PAIR IDENTITY`.

The second moment did escape the easy first-moment rigidity, but only by
opening a curved pair constraint that is exactly a fixed elliptic curve
trace. At `N=50000`, the Sato-Tate-centered path has endpoint
`Z=0.024529`, max abs `Z=0.554795`, and energy-normalized
`r=1.216074`; the exact residual endpoint is `Z=0`. The nonzero term is
not prime regularity. It is the trace sequence of `y^2=x^3-4` written in
complete-family moment coordinates.

### LEARN

This was a better break than a Cramer-density break. Completing the
family and squaring the trace produced a real algebraic bridge:
moment-expansion pair varieties can hide fixed elliptic curves. That is
creative fuel, but also a new funnel: complete-family moments may collapse
to low-dimensional character varieties whose trace statistics are already
the object being measured.

Future family experiments should classify the pair/tuple variety before
scoring the residual. A promising next hallucination is to intentionally
choose a mixed family whose trace-pair variety has dimension `>1` or a
two-universe analogue, then test whether the residual survives after all
low-dimensional trace components are removed.

CONNECTION: direct sequel to Cycles 80 and 81. The incomplete family made
a false mean line; the complete first moment became `-p`; the complete
second moment became a CM elliptic trace. The lesson is not "elliptic is
bad" but "complete-family moments expose exact algebraic skeletons before
prime regularity has a chance to speak."

## HANDOFF 82

Status: no critical-line survivor. Cycle 82 tested the complete
second moment of `E_a: y^2=x^3+a*x+1` over `F_p`, discarding singular
`4a^3+27=0`. The exact identity is

`sum_a a_p(E_a)^2 = p^2 + p*(C_p-R_p)`,

where `R_p=#{x in F_p*:2*x^3=1}` and
`C_p=sum_u chi(u*(1-4*u^3))=-a_p(y^2=x^3-4)-chi(-1)`. After subtracting
singular trace squares, brute force for `5<=p<=97` matched exactly. At
`N=50000`, the Sato-Tate-centered endpoint has `Z=0.024529`, max abs
`Z=0.554795`, energy `r=1.216074`, and exact residual `Z=0`.

New code since the previous handoff:

- `scripts/complete-elliptic-family-second-moment-audit.mjs`

New artifacts:

- `logs/playground-artifacts/complete-elliptic-family-second-moment-50000.md`
- `logs/playground-artifacts/complete-elliptic-family-second-moment-50000.json`
- `logs/playground-artifacts/complete-elliptic-family-second-moment-50000.svg`
- `logs/playground-artifacts/complete-elliptic-family-second-moment-50000.svg.png`
- `logs/playground-artifacts/complete-elliptic-family-second-moment-zero-50k.png`

No core primitive was added. Next cycle should not treat complete-family
moments as black boxes. First classify the moment-expansion variety, peel
off low-dimensional trace components, then score whatever remains.

## Cycle 83 — complete two-parameter Weierstrass variance line

### HALLUCINATE

Guess:

Cycle 82 exposed a low-dimensional trace-pair curve because the family had
only one parameter `a`. Add the missing Weierstrass parameter and test the
complete two-parameter family

`E_{a,b}: y^2=x^3+a*x+b`, `(a,b) in F_p^2`,

discarding singular discriminant `4a^3+27b^2=0`. Define

`M2_good(p)=sum_good_(a,b) a_p(E_{a,b})^2`

and the normalized variance residual

`U2(p)=M2_good(p)/(p*good_count)-1`.

The candidate line is

`Z2(N)=sum_{p<=N}(U2(p)-main2(p))/sqrt(pi(N))`.

Why it could be a line:

Adding `b` raises the moment-expansion variety by a dimension. The
one-parameter family collapsed to a fixed CM curve; a two-parameter family
might instead average away low-dimensional trace components and leave a
small, universal residual that transports as a finite-field critical
line.

Working algebra to validate before trusting pictures:

`a_p(E_{a,b})=-sum_x chi(x^3+a*x+b)`. In the second moment, the `b` sum is
a quadratic character sum in two shifted linear factors. For fixed
`x,y,a`, it contributes `p-1` when

`x^3+a*x = y^3+a*y`,

and `-1` otherwise. For `x=y`, this holds for all `a`; for `x!=y`, it
holds for exactly one `a=-(x^2+x*y+y^2)`. Therefore the off-diagonal
contribution should cancel over `a`, leaving only the diagonal:

`sum_(a,b) a_p(E_{a,b})^2 = p^2*(p-1)`.

Singular curves have parameterization

`a=-3r^2`, `b=2r^3`.

For `r=0`, the character-sum trace is `0`; for `r!=0`, the singular trace
is `chi(3r)`, so the singular trace-square correction is `p-1`. Thus

`M2_good(p)=(p-1)*(p^2-1)`

and

`U2(p)=-1/p^2`.

Pre-registered confirmation:

The formula matches brute force for small primes; after subtracting
`main2(p)=-1/p^2`, a nonzero residual remains with stable sqrt-scale
line behavior not reproduced by shuffles or Cramer-index count controls.
Named composites `25`, `35`, `77`, and `289` fail the finite-field input.

Pre-registered break:

The exact diagonal orthogonality plus singular correction accounts for
everything, leaving residual `0`; or the only visible line is the
convergent deterministic main term `sum -1/p^2`, not prime regularity.

### SEE IT

Commands:

```sh
node --check scripts/complete-weierstrass-family-second-moment-audit.mjs
node scripts/explore.mjs eval '{"domain":"prime","N":50000,"ex":"pi(n)","ey":"0"}'
node scripts/complete-weierstrass-family-second-moment-audit.mjs 50000 logs/playground-artifacts
qlmanage -t -s 1400 -o logs/playground-artifacts logs/playground-artifacts/complete-weierstrass-family-second-moment-50000.svg
node scripts/explore.mjs shot '{"domain":"prime","N":50000,"ex":"pi(n)","ey":"0"}' logs/playground-artifacts/complete-weierstrass-family-second-moment-zero-50k.png
```

LAB zero-residual proxy at `N=50000`:

```json
{"n":5133,"finiteFrac":1,"linearity":1,"slope":0,"intercept":0,"flatness":0,"zeroCrossings":0,"monotonicity":0,"yMin":0,"yMax":0}
```

The audit SVG is the meaningful picture. The Sato-Tate-centered path is a
tiny deterministic negative curve; the exact residual is the zero line.
The `shot` proxy shows no hidden structure.

Artifacts:

- `logs/playground-artifacts/complete-weierstrass-family-second-moment-50000.md`
- `logs/playground-artifacts/complete-weierstrass-family-second-moment-50000.json`
- `logs/playground-artifacts/complete-weierstrass-family-second-moment-50000.svg`
- `logs/playground-artifacts/complete-weierstrass-family-second-moment-50000.svg.png`
- `logs/playground-artifacts/complete-weierstrass-family-second-moment-zero-50k.png`

### GROUND IT

Family:

`E_{a,b}: y^2=x^3+a*x+b`, complete parameters `(a,b) in F_p^2`, singular
parameters `4a^3+27b^2=0` discarded.

Derived identities:

`sum_(a,b) a_p(E_{a,b})^2 = p^2*(p-1)`.

The singular curves are exactly

`a=-3r^2`, `b=2r^3`.

For `r=0`, the character-sum trace is `0`. For `r!=0`, the singular trace
is `chi(3r)`, so

`sum_singular a_p(E_{a,b})^2 = p-1`.

Therefore

`M2_good(p)=(p-1)*(p^2-1)`,

`good_count=p^2-p`,

and

`M2_good(p)/(p*good_count)-1=-1/p^2`.

Brute-force validation:

The script recomputed all traces for every `(a,b)` for primes
`5<=p<=97`; every row matched the formula. Examples:

| p | formula good count | brute good count | singular square sum | formula good M2 | brute good M2 |
| ---: | ---: | ---: | ---: | ---: | ---: |
| `5` | `20` | `20` | `4` | `96` | `96` |
| `31` | `930` | `930` | `30` | `28800` | `28800` |
| `61` | `3660` | `3660` | `60` | `223200` | `223200` |
| `97` | `9312` | `9312` | `96` | `903168` | `903168` |

Endpoint trace:

| N | prime fields | mean U2 | ST residual Z | cumulative main | exact residual Z | max abs Z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `3125` | `443` | `-0.000205645` | `-0.004328332` | `-0.091100847` | `0.000000000` | `0.042715022` |
| `6250` | `810` | `-0.000112494` | `-0.003201623` | `-0.091119800` | `0.000000000` | `0.042715022` |
| `12500` | `1490` | `-0.000061160` | `-0.002360813` | `-0.091128596` | `0.000000000` | `0.042715022` |
| `25000` | `2760` | `-0.000033019` | `-0.001734681` | `-0.091132699` | `0.000000000` | `0.042715022` |
| `50000` | `5131` | `-0.000017762` | `-0.001272279` | `-0.091134609` | `0.000000000` | `0.042715022` |

Controls at full range:

| control | endpoint Z range | max abs Z range | energy Z range |
| --- | ---: | ---: | ---: |
| shuffle | `-0.001272279..-0.001272279` | `0.001280204..0.002733483` | `-1.966621..-1.966621` |
| sign flip | `-0.000947981..0.001120349` | `0.040000000..0.042715022` | `-1.465339..1.731776` |
| bootstrap | `-0.001776732..-0.000151275` | `0.000158097..0.001780515` | `-3.614799..-1.567338` |
| Cramer-index | `-0.002386196..-0.000790966` | `0.000828548..0.003063934` | `-2.468466..-1.447833` |

Fresh holdout `(25000,50000]`: real `Z=-0.000000039`, effectively zero.
This is not a stochastic residual but the vanishing tail of the
deterministic `-1/p^2` main term.

Named composites `25`, `35`, `77`, and `289` fail the prime-field input:
the complete Weierstrass family and Legendre traces require a field, and a
composite modulus is not a field.

Factor check:

This is not a Chebyshev, Mertens, or gap-telescope identity. It collapses
instead to exact character orthogonality in the complete two-parameter
finite-field family. After subtracting the deterministic main term
`-1/p^2`, the residual is identically zero.

### BREAK

Status: `GRAVEYARD / COMPLETE-FAMILY ORTHOGONALITY IDENTITY`.

The dimension-raising repair killed the Cycle 82 CM trace component, but
it also killed every possible residual. At `N=50000`, the
Sato-Tate-centered endpoint is only `Z=-0.001272279`, cumulative main is
`-0.091134609`, and exact residual is `Z=0`. The apparent flat line is
the identity `U2(p)=-1/p^2`, not prime regularity.

### LEARN

The two-parameter completion is a clean opposite failure to Cycle 82. One
parameter left a low-dimensional trace curve; two parameters impose full
orthogonality and leave only singular bookkeeping. The next family
hallucination should not merely add parameters. It needs an incomplete but
intrinsic slice with a known nonzero main term, or a statistic whose
moment variety has genuine high-dimensional residual after all diagonal
and singular components are peeled off.

CONNECTION: direct sequel to Cycle 82. The CM trace-pair identity was not
the final elliptic funnel; full Weierstrass completion is the stronger
funnel. Complete parameter universes are now proven calibration machines,
not candidate prime critical lines, unless the scored object is designed
to survive exact orthogonality.

## HANDOFF 83

Status: no critical-line survivor. Cycle 83 tested the complete
two-parameter Weierstrass family
`E_{a,b}: y^2=x^3+a*x+b` over `F_p`, discarding singular
`4a^3+27b^2=0`. The exact identities are

`sum_(a,b) a_p(E_{a,b})^2=p^2*(p-1)`,

`sum_singular a_p(E_{a,b})^2=p-1`,

so

`M2_good(p)/(p*good_count)-1=-1/p^2`.

Brute force for every prime `5<=p<=97` matched exactly. At `N=50000`,
the Sato-Tate-centered endpoint is `Z=-0.001272279`, cumulative main
`-0.091134609`, and exact residual `Z=0`.

New code since the previous handoff:

- `scripts/complete-weierstrass-family-second-moment-audit.mjs`

New artifacts:

- `logs/playground-artifacts/complete-weierstrass-family-second-moment-50000.md`
- `logs/playground-artifacts/complete-weierstrass-family-second-moment-50000.json`
- `logs/playground-artifacts/complete-weierstrass-family-second-moment-50000.svg`
- `logs/playground-artifacts/complete-weierstrass-family-second-moment-50000.svg.png`
- `logs/playground-artifacts/complete-weierstrass-family-second-moment-zero-50k.png`

No core primitive was added. Next cycle should leave complete elliptic
families alone for now. Better next moves: return to the real nugget
template with a nonlinear intrinsic event process, or build a two-universe
operator statistic where the exact function-field side is the null rather
than the object itself.

## Cycle 84 — nonlinear Palm log-hazard gap line

### HALLUCINATE

Guess:

Leave elliptic families. Treat primes as a point process and move into
Palm time. For consecutive primes `p_i<p_{i+1}`, define the integrated
log-density hazard

`Lambda_i = int_{p_i}^{p_{i+1}} dt/log(t)`.

The raw centered hazard `Lambda_i-1` is forbidden as a discovery because
its cumulative sum telescopes to `Li(p)-pi(p)`. Instead use the nonlinear
probability-integral score

`U_i = exp(-Lambda_i) - 1/2`.

For a memoryless Cramer process in hazard time, `exp(-Lambda_i)` should be
uniform on `[0,1]`, so the line

`Z(N)=sum_{p_i<=N} U_i / sqrt(pair_count/12)`

should be flat at ordinary random-walk scale. The hallucination is that
true primes may be hyperuniform in Palm hazard time: local arithmetic
could make `Z(N)` sharply flatter than Cramer, without being a linear
`pi`/`psi` transform.

Why it could be a line:

This is a nonlinear function of actual gaps, not a linear prime-count
bridge. It asks whether prime waiting times are too regular after
integrating out the first-order density. If the original real nugget was
"sqrt cancellation is arithmetic, not density", this should be a good
stress test: Cramer has the same density clock but not the local
arithmetic gap law.

Pre-registered confirmation:

Real primes have endpoint and max `|Z|` stably below Cramer-label,
Poisson-hazard, W210/W2310 local controls, and gap-shuffle controls across
growing `N`; the effect size is not only an endpoint. Composite controls
`25`, `35`, `77`, and `289` fail the prime-gap event input. The raw
hazard telescoping identity is shown separately and not used as evidence.

Pre-registered break:

The nonlinear score is absorbed by the empirical gap distribution, a
wheel/local-gap null, or an exact transform of known adjacent-gap
anti-correlation; Cramer is merely the wrong weak null; or the apparent
line is just the raw hazard telescope in disguise.

### SEE IT

Commands:

```sh
node --check scripts/palm-loghazard-gap-audit.mjs
node scripts/explore.mjs eval '{"domain":"prime","N":4000000,"ex":"pi(n)","ey":"exp(-gap(n)/log(n))-0.5"}'
node scripts/palm-loghazard-gap-audit.mjs 4000000 logs/playground-artifacts
qlmanage -t -s 1400 -o logs/playground-artifacts logs/playground-artifacts/palm-loghazard-gap-4000000.svg
node scripts/explore.mjs shot '{"domain":"prime","N":4000000,"ex":"pi(n)","ey":"exp(-gap(n)/log(n))-0.5"}' logs/playground-artifacts/palm-loghazard-gap-lab-4m.png
```

LAB pointwise proxy:

```json
{"n":283146,"finiteFrac":1,"linearity":0.00011917965749525104,"slope":3.269559479655318e-8,"intercept":-0.04207207042974609,"flatness":1.1586687503615303,"zeroCrossings":146775,"monotonicity":0.034381677232513376,"yMin":-0.49996271964980515,"yMax":0.5}
```

The pointwise LAB picture is a bounded horizontal band. The cumulative
audit SVG is the real picture: a very sharp negative drift for real
primes, but the empirical gap-value shuffle lies on the same drift.

Artifacts:

- `logs/playground-artifacts/palm-loghazard-gap-4000000.md`
- `logs/playground-artifacts/palm-loghazard-gap-4000000.json`
- `logs/playground-artifacts/palm-loghazard-gap-4000000.svg`
- `logs/playground-artifacts/palm-loghazard-gap-4000000.svg.png`
- `logs/playground-artifacts/palm-loghazard-gap-lab-4m.png`

### GROUND IT

Definition:

For consecutive prime labels `p_i<p_{i+1}`,

`Lambda_i = int_{p_i}^{p_{i+1}} dt/log(t)`,

computed by Simpson integration, and

`U_i = exp(-Lambda_i)-1/2`.

The raw hazard check is

`sum_i (Lambda_i-1) = Li(p_{k+1})-Li(p_1)-k`,

so it is a prime-counting residual at prime endpoints and cannot be used
as a new line. In this run, raw hazard endpoint `Z=1.329263`, max
`|Z|=3.231321`; it is not the source of the huge nonlinear drift.

Endpoint trace:

| N | pairs | mean U | Z | max abs Z | energy Z | theta max sum | raw telescope Z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `250000` | `22043` | `-0.046229` | `-23.775952` | `23.782480` | `-28.675506` | `0.915628` | `1.152983` |
| `500000` | `41537` | `-0.044050` | `-31.099775` | `31.100421` | `-37.190661` | `0.915628` | `1.152617` |
| `1000000` | `78497` | `-0.041913` | `-40.678565` | `40.683180` | `-48.181519` | `0.915628` | `1.590085` |
| `2000000` | `148932` | `-0.039196` | `-52.399468` | `52.401192` | `-61.510758` | `0.915628` | `1.085036` |
| `4000000` | `283144` | `-0.037443` | `-69.018095` | `69.019356` | `-80.453719` | `0.915628` | `1.329263` |

Pair summary at `N=4000000`:

- mean gap: `14.126974`
- mean `Lambda`: `1.000721`
- mean `exp(-Lambda)`: `0.462557`
- mean `U`: `-0.037443`
- gap range: `2..148`
- `Lambda` range: `0.131564..10.197018`

Controls at full range:

| control | count range | endpoint Z range | max abs Z range | theta max sum range |
| --- | ---: | ---: | ---: | ---: |
| shuffle | `283144..283144` | `-69.018095..-69.018095` | `69.018095..69.044949` | `0.975887..1.019325` |
| bootstrap | `283144..283144` | `-70.419086..-67.296007` | `67.299401..70.420507` | `0.969866..1.013118` |
| Poisson hazard | `283144..283144` | `-1.082684..2.057123` | `1.601772..3.554601` | `0.012541..0.691678` |
| Cramer label | `282623..284733` | `-49.805943..-46.472828` | `46.504109..49.805943` | `0.879970..0.943544` |
| W210 | `282728..283911` | `-62.165250..-60.754597` | `60.754597..62.175975` | `0.903765..0.935429` |
| W2310 | `282711..283928` | `-64.419305..-61.762845` | `61.767583..64.434052` | `0.912861..0.935493` |

Fresh holdout `(2000000,4000000]`: real `Z=-45.048668`; shuffle
`-48.847907..-46.374899`, bootstrap `-49.129163..-45.906980`,
Poisson hazard `-1.034632..1.055011`, Cramer label
`-32.598240..-30.637972`, W210 `-41.568317..-38.944222`, and W2310
`-42.493360..-40.348986`.

Named composites `25`, `35`, `77`, and `289` fail the prime-gap event
input: the statistic is indexed by a consecutive-prime left endpoint
`p_i`, and those composites are not event labels.

Factor check:

The nonlinear score is not the raw `Li-pi` telescope. It breaks anyway:
the endpoint and max path are fixed by the observed one-point gap-score
distribution. Shuffling the real `U_i` values preserves the line, and
W210/W2310 random labels reproduce most of the drift. Cramer and pure
Poisson hazard are weak nulls here.

### BREAK

Status: `GRAVEYARD / PALM-GAP DISTRIBUTION BIAS`.

The nonlinear Palm transform found a dramatic line, but not a prime
critical line. At `N=4000000`, real primes have endpoint `Z=-69.018095`
and max `|Z|=69.019356`, while observed gap-value shuffles give the same
endpoint and max `69.018095..69.044949`. Bootstrap controls give
`67.299401..70.420507`. The order of gaps is irrelevant; the line is the
mean bias `E_real exp(-Lambda)=0.462557 < 1/2`.

The useful contrast is still real: pure Poisson hazard controls stay near
zero (`max |Z|=1.601772..3.554601`), Cramer underfits
(`46.504109..49.805943`), and W2310 gets closer
(`61.767583..64.434052`). But that means the object measures local
prime-gap distribution, not residual regularity.

### LEARN

Nonlinear event-process transforms can escape the `pi` telescope, but
they need a distributional null, not only a density clock. The correct
gate is: center the Palm score by the local/wheel or empirical gap law
before asking for order-level cancellation. Otherwise any smooth
nonlinear function of gaps becomes a line because the prime gap
distribution is not exponential in hazard time.

CONNECTION: direct repair of the log-mass bridge. The raw hazard is the
old prime-counting bridge in disguise; the nonlinear score avoids that
specific funnel but falls into the adjacent gap-distribution / local
wheel funnel, close to the ordinal normalized-gap extrema entry. It also
sharpens the user's warning: Cramer is visibly too weak, but beating
Cramer is not enough when empirical gap shuffles absorb the line.

## HANDOFF 84

Status: no critical-line survivor. Cycle 84 tested a nonlinear Palm
log-hazard score over consecutive prime gaps:

`Lambda_i=int_{p_i}^{p_{i+1}} dt/log(t)`, `U_i=exp(-Lambda_i)-1/2`.

The raw hazard `Lambda_i-1` was explicitly marked forbidden because it
telescopes to `Li-pi`; in the audit it stayed small (`Z=1.329263` at
`N=4000000`). The nonlinear score produced a sharp negative line:
`283144` pairs, mean `exp(-Lambda)=0.462557`, endpoint `Z=-69.018095`,
max `|Z|=69.019356`, theta max sum `0.915628`.

Break: empirical gap-value shuffles and bootstraps absorb it. Shuffles
have endpoint exactly `-69.018095` and max `69.018095..69.044949`;
bootstraps have max `67.299401..70.420507`. W2310 random labels reproduce
most of the drift (`61.767583..64.434052`), Cramer underfits
(`46.504109..49.805943`), and Poisson hazard is near zero. The line is a
one-point prime-gap distribution bias, not order-level residual
regularity.

New code since the previous handoff:

- `scripts/palm-loghazard-gap-audit.mjs`

New artifacts:

- `logs/playground-artifacts/palm-loghazard-gap-4000000.md`
- `logs/playground-artifacts/palm-loghazard-gap-4000000.json`
- `logs/playground-artifacts/palm-loghazard-gap-4000000.svg`
- `logs/playground-artifacts/palm-loghazard-gap-4000000.svg.png`
- `logs/playground-artifacts/palm-loghazard-gap-lab-4m.png`

No core primitive was added. Next cycle should center a nonlinear
gap/Palm score by a local or empirical gap-distribution null first, then
test whether the ordered residual path has nontrivial cancellation.

## Cycle 85 — cross-fitted Palm gap-law residual line

### HALLUCINATE

Guess:

Repair Cycle 84 by removing the one-point gap distribution before asking
for order-level cancellation. For consecutive primes `p_i<p_{i+1}`, keep

`Lambda_i = int_{p_i}^{p_{i+1}} dt/log(t)`,

`U_i = exp(-Lambda_i)-1/2`.

Freeze a null from the first half of the range `p_i<=N/2`: for each gap
width `g`, estimate

`m_g=E_train(U|gap=g)`, `s_g^2=Var_train(U|gap=g)`.

Then score only the fresh second half `p_i>N/2` by

`R_i=(U_i-m_gap_i)/s_gap_i`,

with unseen gaps falling back to the global train mean/variance. The
candidate line is

`Z(Y)=sum_{N/2<p_i<=Y} R_i/sqrt(count)`.

Why it could be a line:

Cycle 84 proved that the raw nonlinear Palm score only measured the gap
law. Cross-fitting by gap width removes that one-point distribution
without forcing the test endpoint to zero. If primes have extra
order-level regularity in Palm time, this repaired residual path should
be flatter than shuffled test residuals and than wheel/Cramer labels
processed through the same first-half-fit/second-half-score protocol.

Pre-registered confirmation:

On the second-half holdout, real primes have endpoint and max `|Z|`
stably below shuffled residuals, bootstrap residuals, Cramer labels, and
W210/W2310 labels using the same cross-fitted gap-width centering. The
effect is not just an endpoint and not the raw `Li-pi` telescope.
Composites `25`, `35`, `77`, and `289` fail the consecutive-prime event
input.

Pre-registered break:

The repaired path is ordinary residual noise; adjacent-gap ordering or
slow time drift explains any excursion; shuffling/bootstrapping the
second-half residuals reproduces the path; or the gap-width centering
was too local/post-hoc to count as a universal line.

### SEE IT

Commands:

```sh
node --check scripts/palm-gaplaw-centered-audit.mjs
node scripts/explore.mjs eval '{"domain":"prime","N":4000000,"ex":"pi(n)","ey":"exp(-gap(n)/log(n))-0.5"}'
node scripts/palm-gaplaw-centered-audit.mjs 4000000 logs/playground-artifacts
qlmanage -t -s 1400 -o logs/playground-artifacts logs/playground-artifacts/palm-gaplaw-centered-4000000.svg
node scripts/explore.mjs shot '{"domain":"prime","N":4000000,"ex":"pi(n)","ey":"exp(-gap(n)/log(n))-0.5"}' logs/playground-artifacts/palm-gaplaw-centered-lab-4m.png
```

LAB pointwise proxy, same as Cycle 84:

```json
{"n":283146,"finiteFrac":1,"linearity":0.00011917965749525104,"slope":3.269569479655318e-8,"intercept":-0.04207207042974609,"flatness":1.1586687503615303,"zeroCrossings":146775,"monotonicity":0.034381677232513376,"yMin":-0.49996271964980515,"yMax":0.5}
```

The cumulative audit SVG is the meaningful picture. The repaired real
path is an enormous positive line, but Cramer, W210, and W2310 controls
processed by the same train/test protocol climb with it. Sign flips stay
near zero.

Artifacts:

- `logs/playground-artifacts/palm-gaplaw-centered-4000000.md`
- `logs/playground-artifacts/palm-gaplaw-centered-4000000.json`
- `logs/playground-artifacts/palm-gaplaw-centered-4000000.svg`
- `logs/playground-artifacts/palm-gaplaw-centered-4000000.svg.png`
- `logs/playground-artifacts/palm-gaplaw-centered-lab-4m.png`

### GROUND IT

Training range:

`p_i <= 2000000`.

Test range:

`p_i > 2000000`.

For each gap width `g`, the script estimates first-half
`m_g=E_train(U|gap=g)` and `s_g=sd_train(U|gap=g)`, using a global
fallback for rare or unseen gaps. It then scores second-half records by

`R_i=(U_i-m_gap_i)/s_gap_i`.

Fit summary:

- train count: `148932`
- test count: `134212`
- global train mean: `-0.039196`
- global train sd: `0.242771`
- usable gap means: `43/60`
- fallback test records: `86`
- residual mean: `1.218976`
- residual range: `-1.897945..4.720865`

Endpoint trace:

| N | test count | sum | mean | Z | max abs Z | energy Z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `2250000` | `17148` | `16359.914828` | `0.954042` | `124.932175` | `124.932175` | `129.161143` |
| `2500000` | `34139` | `34138.959606` | `0.999999` | `184.767203` | `184.767203` | `181.798843` |
| `3000000` | `67883` | `73415.556652` | `1.081501` | `281.778325` | `281.778325` | `254.975145` |
| `3500000` | `101217` | `116799.207633` | `1.153949` | `367.124329` | `367.124329` | `309.654402` |
| `4000000` | `134212` | `163601.163664` | `1.218976` | `446.571203` | `446.571203` | `354.910829` |

Controls at full range:

| control | count range | endpoint Z range | max abs Z range | theta max sum range |
| --- | ---: | ---: | ---: | ---: |
| residual shuffle | `134212..134212` | `446.571203..446.571203` | `446.571203..446.571203` | `0.999216..1.001052` |
| residual bootstrap | `134212..134212` | `445.924316..447.269834` | `445.924316..447.269834` | `0.998189..1.001615` |
| residual sign flip | `134212..134212` | `-1.553229..1.816737` | `1.561404..4.253409` | `0.068787..0.821970` |
| Cramer label | `133958..134759` | `441.144685..444.404567` | `441.144685..444.404567` | `1.116464..1.118017` |
| W210 | `134041..134731` | `445.802630..448.078811` | `445.802630..448.078811` | `1.116153..1.118880` |
| W2310 | `133767..134660` | `446.850326..449.673083` | `446.850326..449.673083` | `1.115390..1.118353` |

Final block `(3500000,4000000]`: real `Z=257.655809`,
residual shuffle `220.896374..221.859487`, sign flip
`-2.908975..2.224693`, Cramer `254.061277..256.272883`, W210
`257.239136..259.010311`, and W2310 `257.871651..259.681895`.

Named composites `25`, `35`, `77`, and `289` fail the prime-gap event
input: the statistic is indexed by a consecutive-prime left endpoint
`p_i`, and those composites are not event labels.

Factor check:

This is not the raw `Li-pi` telescope and not just the Cycle 84
one-point mean bias. It is a train/test nonstationarity of the gap-width
Palm score. Within a fixed gap width, `U=exp(-Lambda)-1/2` still changes
with `log(p)`, so first-half means are too low for the second half. The
same standardized drift appears in Cramer and wheel labels.

### BREAK

Status: `GRAVEYARD / TRAIN-TEST PALM GAP NONSTATIONARITY`.

The gap-width cross-fit repair failed in the opposite direction from
Cycle 84. It removed the full-sample negative mean, but a first-half null
does not transfer to the second half. Real endpoint `Z=446.571203` is
matched by residual shuffles and bootstraps, and Cramer/W210/W2310 labels
processed with the same protocol show the same scale. Sign flips collapse
to ordinary random-walk size, proving the huge line is a residual mean
drift rather than order-level cancellation.

### LEARN

For Palm gap scores, "center by gap width" is still not a valid local
null across a growing range. The center must include time, e.g. a
gap-width plus log-time bucket, rolling local fit, or an explicit smooth
main term in `g/log(p)`, before ordered residuals are meaningful. The
repair did sharpen the gate: a good nonlinear event-process test must
remove both the one-point gap law and its slow density-clock drift.

CONNECTION: direct repair attempt for Cycle 84. Cycle 84 showed the raw
nonlinear score is a gap-distribution line; Cycle 85 shows naive
cross-fitted gap-law centering becomes a time-drift line. This is also
the Palm-process analogue of the square-annulus local-shell lesson: the
correct null has to be local in every coordinate the statistic still
depends on.

## HANDOFF 85

Status: no critical-line survivor. Cycle 85 repaired the Palm log-hazard
gap score by fitting first-half gap-width means/variances for
`U_i=exp(-Lambda_i)-1/2` and scoring standardized second-half residuals.
At `N=4000000`, train count `148932`, test count `134212`, usable gap
means `43/60`, fallback test records `86`, residual mean `1.218976`,
endpoint `Z=446.571203`, and max `|Z|=446.571203`.

Break: first-half gap-width centering is nonstationary. Residual shuffles
and bootstraps reproduce the endpoint (`445.924316..447.269834`), and
Cramer/W210/W2310 controls processed with the same protocol sit at the
same scale (`441..450`). Sign-flips collapse to max `1.561404..4.253409`,
so the line is a deterministic residual mean drift, not order-level
prime regularity.

New code since the previous handoff:

- `scripts/palm-gaplaw-centered-audit.mjs`

New artifacts:

- `logs/playground-artifacts/palm-gaplaw-centered-4000000.md`
- `logs/playground-artifacts/palm-gaplaw-centered-4000000.json`
- `logs/playground-artifacts/palm-gaplaw-centered-4000000.svg`
- `logs/playground-artifacts/palm-gaplaw-centered-4000000.svg.png`
- `logs/playground-artifacts/palm-gaplaw-centered-lab-4m.png`

No core primitive was added. Next cycle should either add a time-local
Palm null (`gap width + log-time bucket` or rolling fit), or leave Palm
gaps and return to a two-universe operator statistic with an exact
function-field calibration.

## Cycle 86 — rolling local Palm gap-law residual line

### HALLUCINATE

Guess:

Cycle 85 died because first-half gap-width centering was not local in the
density clock. Repair it by making the Palm null rolling and past-only.
For each consecutive event pair `x_i<x_{i+1}`, define

`Lambda_i = int_{x_i}^{x_{i+1}} dt/log(t)`,

`U_i = exp(-Lambda_i)-1/2`.

Use only the previous `K=8192` event gaps to estimate the current null.
If the current gap width has at least `12` previous samples inside that
window, center and scale by that gap-width bucket; otherwise center and
scale by the whole previous window. Score

`R_i=(U_i-m_i)/s_i`

after burn-in, then draw the candidate line

`Z(Y)=sum_{x_i<=Y} R_i/sqrt(count)`.

Why it could be a line:

This leaves the old Cramer-only frame behind in the important way: the
object is not "is the gap distribution Poisson?" but "after removing the
local Palm one-point law using only past data, does the ordered event
process carry a residual cancellation signature?" The null is intrinsic
to the observed event clock and does not need zeta, zeros, or a global
first-half transfer assumption.

Pre-registered confirmation:

Real primes have a stable rolling residual path flatter than residual
shuffles, bootstraps, sign flips, Cramer labels, and W210/W2310 labels
processed by the same past-only rolling protocol. The effect is visible
throughout the endpoint trace, not just at `N`, and the last block does
not carry the whole result. Named composites `25`, `35`, `77`, and `289`
fail the consecutive-prime event input.

Pre-registered break:

The rolling local null absorbs the candidate into ordinary standardized
noise; shuffles or sign flips reproduce it; wheel/Cramer labels reproduce
it; the score is unstable under `K`; or the remaining effect is just a
past-window implementation artifact rather than prime regularity.

### SEE IT

Commands:

```sh
node --check scripts/palm-rolling-local-audit.mjs
node scripts/explore.mjs eval '{"domain":"prime","N":4000000,"ex":"pi(n)","ey":"exp(-gap(n)/log(n))-0.5"}'
node scripts/palm-rolling-local-audit.mjs 4000000 logs/playground-artifacts
qlmanage -t -s 1400 -o logs/playground-artifacts logs/playground-artifacts/palm-rolling-local-4000000.svg
PV_URL=http://localhost:5174 node scripts/explore.mjs shot '{"domain":"prime","N":4000000,"ex":"pi(n)","ey":"exp(-gap(n)/log(n))-0.5"}' logs/playground-artifacts/palm-rolling-local-lab-4m.png
```

LAB pointwise proxy, same raw Palm display as Cycles 84-85:

```json
{"n":283146,"finiteFrac":1,"linearity":0.00011917965749525104,"slope":3.269569479655318e-8,"intercept":-0.04207207042974609,"flatness":1.1586687503615303,"zeroCrossings":146775,"monotonicity":0.034381677232513376,"yMin":-0.49996271964980515,"yMax":0.5}
```

The custom audit SVG is the grounded picture. It shows the real rolling
residual as a sharp rising line, but the Cramer and W2310 mean-max
control curves are visually on top of it. Sign flips and globally
centered shuffles stay near zero.

Artifacts:

- `logs/playground-artifacts/palm-rolling-local-4000000.md`
- `logs/playground-artifacts/palm-rolling-local-4000000.json`
- `logs/playground-artifacts/palm-rolling-local-4000000.svg`
- `logs/playground-artifacts/palm-rolling-local-4000000.svg.png`
- `logs/playground-artifacts/palm-rolling-local-lab-4m.png`

### GROUND IT

Rolling null:

- `K=8192` previous event gaps only.
- If the current gap width has at least `12` previous samples in the
  window, use that gap bucket mean/sd.
- Otherwise use the whole previous window mean/sd.
- The current event is never included in its own null.

For fixed gap width `g`, `U=exp(-int_x^{x+g}dt/log(t))-1/2` still drifts
upward with `x`, approximately like `exp(-g/log x)-1/2`. A past-only
rolling window therefore lags the current value. Because the within-gap
rolling sd can be very small, the lag gets amplified into a huge positive
standardized residual.

Real endpoint trace:

| N | scored count | sum | mean | Z | max abs Z | energy Z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `250000` | `13851` | `19956.454553` | `1.440795` | `169.567580` | `169.567580` | `114.544366` |
| `500000` | `33345` | `51474.396710` | `1.543692` | `281.887556` | `281.887556` | `178.549336` |
| `1000000` | `70305` | `112930.889061` | `1.606300` | `425.911769` | `425.911769` | `259.717299` |
| `2000000` | `140740` | `231557.517631` | `1.645286` | `617.234385` | `617.234385` | `367.759192` |
| `3000000` | `208623` | `346519.157361` | `1.660983` | `758.658200` | `758.658200` | `447.916058` |
| `4000000` | `274952` | `459049.608500` | `1.669563` | `875.449663` | `875.449663` | `514.211438` |

Rolling summary:

- record count before burn-in: `283144`
- scored count: `274952`
- gap-scoped scores: `272699`
- window-fallback scores: `2253`
- distinct gap-scoped widths: `34`
- residual mean: `1.669563`
- residual range: `-1.933132..3.581397`
- local sd range: `0.000032..0.249536`

Controls at full range:

| control | count range | endpoint Z range | max abs Z range | theta max sum range | residual mean range |
| --- | ---: | ---: | ---: | ---: | ---: |
| residual shuffle | `274952..274952` | `875.449663..875.449663` | `875.449663..875.451637` | `0.999328..1.001392` | `0..0` |
| residual bootstrap | `274952..274952` | `875.032875..875.684014` | `875.032875..875.684014` | `0.999506..1.000384` | `0..0` |
| residual sign flip | `274952..274952` | `-2.932719..1.453917` | `2.109084..6.327356` | `0.110090..0.723636` | `0..0` |
| centered residual shuffle | `274952..274952` | `~0..~0` | `0.444789..1.354605` | `0.133215..0.547695` | `0..0` |
| Cramer label | `274431..276541` | `872.212597..875.116810` | `872.212597..875.116810` | `1.046536..1.049467` | `1.663634..1.665782` |
| W210 | `274536..275719` | `873.758523..875.790681` | `873.758523..875.790681` | `1.046641..1.049908` | `1.667007..1.668532` |
| W2310 | `274519..275736` | `873.746996..876.232549` | `873.746996..876.232549` | `1.047194..1.048689` | `1.667629..1.669403` |

Final block `(3000000,4000000]`: real `Z=436.936510`,
residual shuffle `429.482938..430.617060`, bootstrap
`429.540663..430.343003`, sign flip `-2.475801..1.351286`,
centered shuffle `-0.355565..0.488164`, Cramer
`435.083514..437.285870`, W210 `435.154444..437.508519`, and W2310
`435.251796..438.845461`.

Window-size stability:

| K | scored | residual mean | endpoint Z | max abs Z | theta max sum |
| ---: | ---: | ---: | ---: | ---: | ---: |
| `4096` | `279048` | `1.659930` | `876.858073` | `876.858073` | `1.026023` |
| `8192` | `274952` | `1.669563` | `875.449663` | `875.449663` | `1.048159` |
| `16384` | `266760` | `1.654415` | `854.485760` | `854.485760` | `1.074545` |

Named composites `25`, `35`, `77`, and `289` fail the event input: this
statistic is indexed by consecutive prime/event labels, not arbitrary
integers.

Factor check:

This is not a zeta/zero construction, not the raw `Li-pi` hazard
telescope, and not a global first-half transfer line. It is a deterministic
lag line: a past-only empirical fixed-gap center underestimates the
current smooth value of `U`, and the same effect appears in Cramer and
wheel event universes.

### BREAK

Status: `GRAVEYARD / ROLLING PALM WINDOW-LAG ARTIFACT`.

The rolling repair failed because "local" was still empirical and
one-sided. Real endpoint `Z=875.449663` is not special: Cramer labels have
`Z=872.212597..875.116810`, W210 has `873.758523..875.790681`, and W2310
has `873.746996..876.232549`. Sign flips collapse to max
`2.109084..6.327356`, and globally centered shuffles have max
`0.444789..1.354605`, so the sharp line is a positive residual mean, not
ordered prime cancellation.

### LEARN

Past-only rolling gap buckets are dangerous for any statistic that is
smoothly drifting inside a bucket. For Palm gaps, the next valid local null
cannot be "previous empirical mean at the same gap width"; it needs an
instantaneous smooth center in `g/log(x)` (or a local regression with the
density coordinate included) before standardization. Equivalently: local
time must be a coordinate in the null, not just the order in which the
window is updated.

CONNECTION: direct repair of Cycle 85. Cycle 84 fell into the one-point
gap-distribution funnel, Cycle 85 into train/test nonstationarity, and
Cycle 86 into one-sided rolling-window lag. All three say the same thing
more sharply: Palm event-process statistics are promising only after the
full smooth `gap + time` null is removed. Cramer was not the theorem to
believe; it was the stress dummy that exposed the shared artifact.

## HANDOFF 86

Status: no critical-line survivor. Cycle 86 tested a rolling, past-only
Palm gap-law residual using `K=8192` previous gaps and gap-specific
centering when at least `12` previous samples were available. At
`N=4000000`, scored count `274952`, gap-scoped scores `272699`,
fallback scores `2253`, residual mean `1.669563`, endpoint
`Z=875.449663`, and max `|Z|=875.449663`.

Break: the line is a rolling-window lag artifact. Cramer/W210/W2310 labels
processed with the same protocol reproduce it (`Z≈872..876`), while sign
flips and centered shuffles collapse near zero. The mechanism is fixed-gap
smooth drift: `U≈exp(-g/log x)-1/2` rises with `x`, so a past-only bucket
center lags the current value and a tiny within-gap sd amplifies the lag.

New code since the previous handoff:

- `scripts/palm-rolling-local-audit.mjs`

New artifacts:

- `logs/playground-artifacts/palm-rolling-local-4000000.md`
- `logs/playground-artifacts/palm-rolling-local-4000000.json`
- `logs/playground-artifacts/palm-rolling-local-4000000.svg`
- `logs/playground-artifacts/palm-rolling-local-4000000.svg.png`
- `logs/playground-artifacts/palm-rolling-local-lab-4m.png`

No core primitive was added. Next cycle should either fit and subtract an
instantaneous smooth Palm center in `(gap, log x)` before scoring order,
or leave Palm gaps and return to a two-universe operator statistic with a
function-field calibration.

## Cycle 87 — wheel-PIT next-event martingale line

### HALLUCINATE

Guess:

Leave the empirical Palm centering trap. For a fixed wheel `W`, define a
local Bernoulli next-event model on the reduced residue classes:

`h_W(n)=W/(phi(W) log n)` if `gcd(n,W)=1`, else `0`.

For a consecutive event pair `x_i<x_{i+1}`, compute the discrete
mid-PIT score of the observed next event under this local model:

`P(T=x_{i+1}) = S_before * h_W(x_{i+1})`,

`U_i = P(T<x_{i+1}) + 0.5 P(T=x_{i+1}) - 0.5`,

where `S_before=prod_{x_i<n<x_{i+1}}(1-h_W(n))`. The candidate line is

`Z_W(Y)=sum_{x_i<=Y} U_i/sqrt(count)`.

Main test wheel: `W=2310`. Family context: `W=2,30,210,2310`.

Why it could be a line:

This is an instantaneous smooth local null in `(gap, log x)` instead of a
lagging rolling bucket. It removes parity and small-prime forbidden
classes before asking whether the ordered prime next-event process has
extra cancellation. If primes have arithmetic rigidity beyond a local
wheel-Poisson model, the real `W=2310` PIT path should be flatter or
structurally different from fake `W=2310` event labels generated by the
same hazard.

Pre-registered confirmation:

At `W=2310`, real primes have endpoint and max `|Z|` below the fake
`W=2310` seed envelope, below residual shuffles/bootstraps, and stable
across growing endpoints. The effect is not only an endpoint and does not
collapse to parity or a smaller wheel. Composites `25`, `35`, `77`, and
`289` fail the consecutive-prime event input.

Pre-registered break:

The PIT path is just a small-prime sieve / k-tuple mismatch line; fake
wheel labels reproduce it; residual shuffles absorb it; increasing `W`
only moves a deterministic bias; or the score is ordinary random-walk
noise with no prime-specific residual scaling.

### SEE IT

Commands:

```sh
node --check scripts/wheel-pit-gap-martingale-audit.mjs
node scripts/explore.mjs eval '{"domain":"prime","N":4000000,"ex":"pi(n)","ey":"gap(n)*2310/(480*log(n))"}'
node scripts/wheel-pit-gap-martingale-audit.mjs 4000000 logs/playground-artifacts
qlmanage -t -s 1400 -o logs/playground-artifacts logs/playground-artifacts/wheel-pit-gap-martingale-4000000.svg
PV_URL=http://localhost:5174 node scripts/explore.mjs shot '{"domain":"prime","N":4000000,"ex":"pi(n)","ey":"gap(n)*2310/(480*log(n))"}' logs/playground-artifacts/wheel-pit-gap-martingale-lab-4m.png
```

LAB proxy for the `W=2310` wheel-normalized gap:

```json
{"n":283146,"finiteFrac":1,"linearity":8.971082312742858e-8,"slope":-1.4473972590419658e-8,"intercept":4.818044792610019,"flatness":0.8201608711367564,"zeroCrossings":0,"monotonicity":-0.034381677232513376,"yMin":0,"yMax":49.07327509003579}
```

The audit SVG is the meaningful picture. Real `W=2310` rises above the
same-wheel fake envelope and sign flips, but the real-value shuffles and
bootstraps reproduce the endpoint scale. The signal is in the one-point
PIT value distribution, not in the ordering of those values.

Artifacts:

- `logs/playground-artifacts/wheel-pit-gap-martingale-4000000.md`
- `logs/playground-artifacts/wheel-pit-gap-martingale-4000000.json`
- `logs/playground-artifacts/wheel-pit-gap-martingale-4000000.svg`
- `logs/playground-artifacts/wheel-pit-gap-martingale-4000000.svg.png`
- `logs/playground-artifacts/wheel-pit-gap-martingale-lab-4m.png`

### GROUND IT

Main wheel: `W=2310`, `phi(W)=480`.

For each prime gap after `p>2310`, the script computes the discrete
mid-PIT under the local next-event model

`h_W(n)=W/(phi(W) log n)` on `gcd(n,W)=1`.

This avoids the raw hazard telescope: it scores the *position* of the
observed next event inside a local discrete survival distribution, rather
than summing `Lambda_i-1`.

Main real endpoint trace:

| N | scored count | sum | mean | Z | max abs Z | energy Z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `250000` | `21701` | `141.414661` | `0.006517` | `0.959963` | `0.982989` | `3.522592` |
| `500000` | `41195` | `252.810905` | `0.006137` | `1.245586` | `1.264706` | `4.538850` |
| `1000000` | `78155` | `455.094141` | `0.005823` | `1.627882` | `1.632110` | `5.890952` |
| `2000000` | `148590` | `696.782190` | `0.004689` | `1.807600` | `1.817506` | `6.506503` |
| `3000000` | `216473` | `1029.792169` | `0.004757` | `2.213338` | `2.229626` | `7.951769` |
| `4000000` | `282802` | `1251.924380` | `0.004427` | `2.354165` | `2.359392` | `8.440578` |

Main PIT summary:

- start after: `2311`
- scored count: `282802`
- skipped early pairs: `342`
- impossible observed next events: `0`
- value mean: `0.004427`
- value mean abs: `0.244452`
- value range: `-0.341713..0.499989`

Wheel family on real primes:

| W | start | scored | value mean | endpoint Z | max abs Z | theta max sum | same-W fake endpoint Z range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `2` | `9` | `283141` | `0.022274` | `11.851953` | `11.852765` | `0.907195` | `-0.474378..0.732102` |
| `30` | `44` | `283131` | `0.008435` | `4.488158` | `4.490107` | `0.885734` | `-0.822892..0.246764` |
| `210` | `211` | `283099` | `0.005655` | `3.008644` | `3.011863` | `0.859238` | `-0.468216..0.408232` |
| `2310` | `2311` | `282802` | `0.004427` | `2.354165` | `2.359392` | `0.839201` | `-0.542396..0.514884` |

Main controls at full range:

| control | count range | endpoint Z range | max abs Z range | theta max sum range |
| --- | ---: | ---: | ---: | ---: |
| residual shuffle | `282802..282802` | `2.354165..2.354165` | `2.355564..2.397413` | `0.751445..1.308005` |
| residual bootstrap | `282802..282802` | `1.896709..2.816568` | `1.968705..2.896643` | `0.850752..1.258284` |
| residual sign flip | `282802..282802` | `-0.615262..0.154825` | `0.462394..1.119343` | `0.145126..0.856269` |
| centered residual shuffle | `282802..282802` | `~0..~0` | `0.455639..0.865420` | `0.147450..0.679197` |
| same-W fake labels | `282309..284012` | `-0.542396..0.514884` | `0.412957..0.986279` | `0.044742..0.895450` |

Final block `(3000000,4000000]`: real `Z=0.862501`,
residual shuffle `0.934913..1.494045`, bootstrap `0.608124..1.409584`,
sign flip `-0.533482..0.491864`, centered shuffle `-0.305908..0.566685`,
and same-wheel fake labels `-0.229444..0.602745`.

Named composites `25`, `35`, `77`, and `289` fail the event input: this
statistic is scored on consecutive prime/event pairs, not arbitrary
integer labels.

Factor check:

This is not a zeta/zero construction, not a raw gap sum, not the
`Li-pi` hazard telescope, and not a rolling empirical center. It is a
finite-wheel discrete PIT. The break is more specific: finite wheels do
not match the prime one-point next-gap PIT distribution. The ordered path
does not survive shuffling.

### BREAK

Status: `GRAVEYARD / FINITE-WHEEL PIT DISTRIBUTION BIAS`.

The `W=2310` PIT path is genuinely above same-wheel fake event labels
(`Z=2.354165` real versus `-0.542396..0.514884` fake seeds), but it fails
the order gate. Shuffling the real PIT values gives the same endpoint
`Z=2.354165`, and bootstraps give `1.896709..2.816568`. Sign flips and
centered shuffles collapse to ordinary size. Therefore the line is caused
by a positive PIT value mean `0.004427`, not ordered prime regularity.

The wheel family is still informative: the bias shrinks as more local
sieve structure is installed (`W=2` endpoint `Z=11.851953`, `W=30`
`4.488158`, `W=210` `3.008644`, `W=2310` `2.354165`). That points to
remaining finite-wheel / k-tuple structure, not a critical line.

### LEARN

A discrete instantaneous null is better than a rolling empirical null:
it kills the huge Palm window-lag artifact and exposes a much smaller
residual. But finite wheel-Poisson independence is still not the prime
gap law. The next creative step should either push the null toward
admissible-tuple / singular-series conditioning, or abandon one-point gap
laws and use a statistic where shuffling values cannot preserve the
claim.

CONNECTION: direct response to Cycles 84-86. The Palm sequence taught
that global gap distributions, train/test gap means, and rolling
same-gap windows all manufacture lines. Cycle 87 replaces those with an
instantaneous survival distribution and gets a subtler failure:
small-prime local structure explains most of the bias, but not all. This
is closer to the "real residual" template because the Cramer-style fake
does not absorb it; it still fails because order is irrelevant after the
real PIT values are fixed.

## HANDOFF 87

Status: no critical-line survivor. Cycle 87 tested a discrete
wheel-aware next-event PIT martingale. Main wheel `W=2310`, scored
`282802` prime gaps after `p>2310`, mean PIT value `0.004427`, endpoint
`Z=2.354165`, and max `|Z|=2.359392`.

Break: same-wheel fake labels do not reproduce the positive mean
(`Z=-0.542396..0.514884`), but residual shuffles and bootstraps do
(`Z=2.354165` and `1.896709..2.816568`). The line is a finite-wheel
one-point next-gap distribution bias, not ordered prime cancellation.
The bias shrinks with wheel size: `W=2` gives `Z=11.851953`, `W=30`
`4.488158`, `W=210` `3.008644`, and `W=2310` `2.354165`.

New code since the previous handoff:

- `scripts/wheel-pit-gap-martingale-audit.mjs`

New artifacts:

- `logs/playground-artifacts/wheel-pit-gap-martingale-4000000.md`
- `logs/playground-artifacts/wheel-pit-gap-martingale-4000000.json`
- `logs/playground-artifacts/wheel-pit-gap-martingale-4000000.svg`
- `logs/playground-artifacts/wheel-pit-gap-martingale-4000000.svg.png`
- `logs/playground-artifacts/wheel-pit-gap-martingale-lab-4m.png`

No core primitive was added. Next cycle should either add a singular-series
/ admissible-tuple conditioned PIT, or switch to a statistic whose
survival depends on order by construction rather than on the one-point
gap-value distribution.

## Cycle 88 — deep-admissible next-gap PIT martingale

### HALLUCINATE

Guess:

Cycle 87 used only the `W=2310` wheel, i.e. primes `<=11`. Push the same
pointwise admissibility idea much deeper without forming a huge primorial.
For a cutoff prime `B`, define

`A_B(n)=1` if `n` is not divisible by any prime `ell<=B`, else `0`,

`rho_B=prod_{ell<=B} ell/(ell-1)`.

For a candidate next event `q=p+h`, use the local hazard

`h_B(p,h)=A_B(q) * rho_B / log(q)`.

The observed next prime gets the discrete mid-PIT score inside the
survival distribution over offsets `h=1,2,...`:

`U_i=P(T<h_i)+0.5P(T=h_i)-0.5`,

and the candidate line is

`Z_B(Y)=sum_{p_i<=Y} U_i/sqrt(count)`.

Main cutoff: `B=97`. Family: `B=2,5,11,29,97`.

Why it could be a line:

This is the next correction after the finite-wheel PIT: it conditions on
the exact pointwise admissible candidate pattern after the current prime,
but extends the wheel from `11` to `97` without coefficient-ordering or
zeta. If the Cycle 87 bias was mostly leftover small-prime admissibility,
then `B=97` should flatten the PIT value distribution. If there is
order-level regularity beyond one-gap local sieving, it should show up
after same-model fakes and shuffled real PIT values are beaten.

Pre-registered confirmation:

For `B=97`, real primes have endpoint and max `|Z|` below same-model
sequential fake labels, below real PIT shuffles/bootstraps, and stable
across endpoints. The family `B=2,5,11,29,97` progressively removes the
Cycle 87 finite-wheel mean bias without creating a new deterministic mean.
Named composites `25`, `35`, `77`, and `289` fail the consecutive-prime
event input.

Pre-registered break:

The candidate is still a one-gap distribution statistic: shuffling or
bootstrapping the real PIT values preserves the endpoint; same-model
fakes reproduce it; increasing `B` only moves a deterministic mean; or
the remaining path is ordinary random-walk noise with no stable residual
scaling.

### SEE IT

Commands:

```sh
node --check scripts/deep-admissible-gap-pit-audit.mjs
node scripts/explore.mjs eval '{"domain":"prime","N":4000000,"ex":"pi(n)","ey":"roughfirst(n,97)"}'
node scripts/deep-admissible-gap-pit-audit.mjs 4000000 logs/playground-artifacts
qlmanage -t -s 1400 -o logs/playground-artifacts logs/playground-artifacts/deep-admissible-gap-pit-4000000.svg
PV_URL=http://localhost:5174 node scripts/explore.mjs shot '{"domain":"prime","N":4000000,"ex":"pi(n)","ey":"roughfirst(n,97)"}' logs/playground-artifacts/deep-admissible-gap-pit-lab-4m.png
```

LAB proxy for the first `97`-rough offset after each prime:

```json
{"n":283146,"finiteFrac":1,"linearity":0.000002542323026683668,"slope":-1.1330990857628847e-7,"intercept":8.232675501762577,"flatness":0.7069332331925301,"zeroCrossings":0,"monotonicity":0.0002017630990812019,"yMin":2,"yMax":95}
```

The audit SVG is the meaningful picture. It shows the real `B=97` path
peaking near `N=1000000` and then falling back toward the same scale as
same-cutoff fakes, sign flips, centered shuffles, and bootstraps. The
visual result is not a line; it is a successful null improvement.

Artifacts:

- `logs/playground-artifacts/deep-admissible-gap-pit-4000000.md`
- `logs/playground-artifacts/deep-admissible-gap-pit-4000000.json`
- `logs/playground-artifacts/deep-admissible-gap-pit-4000000.svg`
- `logs/playground-artifacts/deep-admissible-gap-pit-4000000.svg.png`
- `logs/playground-artifacts/deep-admissible-gap-pit-lab-4m.png`

### GROUND IT

For cutoff `B`, the script precomputes `A_B(n)=1` if `n` has no prime
factor `<=B`, else `0`, and

`rho_B=prod_{ell<=B} ell/(ell-1)`.

The local next-event hazard is

`h_B(n)=A_B(n)*rho_B/log(n)`.

The score starts after `100000` to avoid the very-small-`n` high-hazard
edge. This is a pointwise admissibility null, not a coefficient ordering,
not a zero table, and not a raw gap/hazard telescope.

Main `B=97` endpoint trace:

| N | scored count | sum | mean | Z | max abs Z | energy Z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `250000` | `12452` | `59.773978` | `0.004800` | `0.535664` | `0.547889` | `2.270663` |
| `500000` | `31946` | `133.364605` | `0.004175` | `0.746161` | `0.775800` | `3.086917` |
| `1000000` | `68906` | `281.301341` | `0.004082` | `1.071626` | `1.074534` | `4.340235` |
| `2000000` | `139341` | `295.472891` | `0.002121` | `0.791550` | `1.074534` | `3.146873` |
| `3000000` | `207224` | `352.842389` | `0.001703` | `0.775105` | `1.074534` | `3.052188` |
| `4000000` | `273553` | `347.437061` | `0.001270` | `0.664286` | `1.074534` | `2.598379` |

Main PIT summary:

- start after: `100000`
- `rho_97`: `8.311357`
- small-prime count: `25`
- scored count: `273553`
- skipped early pairs: `9591`
- impossible observed next events: `0`
- value mean: `0.001270`
- value mean abs: `0.241725`
- value range: `-0.226632..0.499998`

Cutoff family on real primes:

| B | rho_B | scored | value mean | endpoint Z | max abs Z | theta max sum | same-B fake endpoint Z range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `2` | `2.000000` | `273553` | `0.021977` | `11.494224` | `11.495037` | `0.942759` | `-0.636299..0.802173` |
| `5` | `3.750000` | `273553` | `0.008279` | `4.330365` | `4.332341` | `0.937829` | `-0.828127..0.302847` |
| `11` | `4.812500` | `273553` | `0.004325` | `2.262118` | `2.265950` | `0.889166` | `-0.446093..0.537134` |
| `29` | `6.331229` | `273553` | `0.001737` | `0.908350` | `0.956810` | `0.879467` | `-0.386430..0.458344` |
| `97` | `8.311357` | `273553` | `0.001270` | `0.664286` | `1.074534` | `0.587677` | `-0.380874..0.355473` |

Main controls at full range:

| control | count range | endpoint Z range | max abs Z range | theta max sum range |
| --- | ---: | ---: | ---: | ---: |
| residual shuffle | `273553..273553` | `0.664286..0.664286` | `0.702369..1.014626` | `0.519039..1.047745` |
| residual bootstrap | `273553..273553` | `0.563303..1.059042` | `0.636218..1.071555` | `0.581659..1.108748` |
| residual sign flip | `273553..273553` | `-0.452927..0.316063` | `0.459124..0.826836` | `0.261058..0.764895` |
| centered residual shuffle | `273553..273553` | `~0..~0` | `0.481938..0.772409` | `0.157153..0.516670` |
| same-B fake labels | `273841..274771` | `-0.380874..0.355473` | `0.372700..0.775715` | `0.301055..0.936745` |

Final block `(3000000,4000000]`: real `Z=-0.020988`,
residual shuffle `0.028508..0.964210`, bootstrap `0.059363..0.742350`,
sign flip `-0.386831..0.280943`, centered shuffle
`-0.165122..0.307256`, and same-cutoff fake labels
`-0.371670..0.319371`.

Named composites `25`, `35`, `77`, and `289` fail the event input: this
statistic is scored on consecutive prime/event pairs, not arbitrary
integer labels.

Factor check:

This is not the old finite `W=2310` wheel; `B=97` means the null uses
all small primes through `97`, represented by a direct admissibility mask
and Mertens product rather than a huge primorial. It still tests only the
one-gap next-event distribution; no value-order claim can survive if
shuffling or fake labels match it.

### BREAK

Status: `GRAVEYARD / DEEP-ADMISSIBLE PIT NULL ABSORPTION`.

The candidate did not produce a critical line. It mostly repaired Cycle
87. The endpoint fell from the `B=11`/`W=2310` level `Z=2.262118` to
`B=97` endpoint `Z=0.664286`; the last block was essentially flat
(`Z=-0.020988`). Same-cutoff fake labels have endpoint
`-0.380874..0.355473`, sign flips and centered shuffles have max `|Z|`
below `0.83`, and bootstraps cover the real endpoint/max scale
(`endpoint Z=0.563303..1.059042`, max `0.636218..1.071555`).

So the deep admissibility mask absorbed the finite-wheel one-point bias
into ordinary noise. The remaining `B=97` path is not stable as a line:
it peaks early and decays by the final endpoint.

### LEARN

This is a good break. The Cycle 87 finite-wheel mismatch was mostly
missing small-prime admissibility beyond `11`, not a prime-specific
critical-line residual. Extending the pointwise local sieve to primes
through `97` nearly kills the PIT mean. Next gap-law attempts need either
an order-dependent statistic by construction, or a true tuple/survival
model for multiple candidate offsets; one-gap local admissibility is now
calibrated enough to stop producing big fake lines.

CONNECTION: direct sequel to Cycle 87. Cycle 87 showed the `W=2310`
PIT line was not order-level but still not matched by same-wheel fakes.
Cycle 88 identifies the missing ingredient: deeper local admissibility.
This is also another example of the funnel lesson: a line can vanish when
the correct main term is made more local, without needing zeta or zeros.

## HANDOFF 88

Status: no critical-line survivor. Cycle 88 tested a deep-admissible
next-gap PIT martingale with cutoff `B=97`, start `p>100000`, and hazard
`h_B(n)=1_{n has no prime factor <=B} rho_B/log(n)`. At `N=4000000`,
`rho_97=8.311357`, scored count `273553`, mean PIT value `0.001270`,
endpoint `Z=0.664286`, and max `|Z|=1.074534`.

Break: the deep admissibility null absorbed the Cycle 87 finite-wheel
bias into noise. The family endpoint shrank from `B=2` `Z=11.494224` to
`B=5` `4.330365`, `B=11` `2.262118`, `B=29` `0.908350`, and `B=97`
`0.664286`. Same-cutoff fakes, bootstraps, sign flips, and centered
shuffles are all the same scale; the final block is `Z=-0.020988`.

New code since the previous handoff:

- `scripts/deep-admissible-gap-pit-audit.mjs`

New artifacts:

- `logs/playground-artifacts/deep-admissible-gap-pit-4000000.md`
- `logs/playground-artifacts/deep-admissible-gap-pit-4000000.json`
- `logs/playground-artifacts/deep-admissible-gap-pit-4000000.svg`
- `logs/playground-artifacts/deep-admissible-gap-pit-4000000.svg.png`
- `logs/playground-artifacts/deep-admissible-gap-pit-lab-4m.png`

No core primitive was added. Next cycle should leave one-gap PITs unless
it builds a genuinely multi-offset survival statistic; better candidates:
a tuple-conditioned "no earlier candidate" residual, an order-only
permutation statistic that value shuffling cannot preserve, or a
two-universe matched statistic with function-field calibration.
