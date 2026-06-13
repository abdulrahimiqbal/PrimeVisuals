# Mobius-gap cross-q mechanism audit - 2026-06-13

## Context

Goal: explain the `F_3[t]` Mobius-parity gap divergence by a mechanism that
predicts new fields before computation. Prior audited fact:

```text
Corr(mu(f-t), next_gap(f) | f irreducible degree n, previous_gap(f)>t)
~= 0.022 for F_3[t], n=14..17.
```

The prior audit established that the effect is real in `F_3[t]`, absent in
`F_2[t]` and in the tested integer analogs, survives cyclic and composite
controls, and dies under non-local coefficient perturbation.

## Mechanism preregistration - before computing F_5, F_7, F_4

Candidate mechanism: in odd characteristic, Pellet's theorem gives

```text
mu(g) = (-1)^deg(g) * chi_q(Disc(g))
```

for monic `g`, with `chi_q` the quadratic character of `F_q`. Thus
`mu(f-t)` is the Frobenius sign/discriminant character of the polynomial just
behind `f` in the low-coefficient short-interval neighborhood. The forward
lexicographic gap is the waiting time until the next nearby polynomial whose
Frobenius cycle is a single `n`-cycle. Since an irreducible candidate must
have Mobius value `-1`, a local positive discriminant/Frobenius-sign value
behind `f` predicts a shortage of immediate irreducible candidates ahead and
therefore a longer next gap.

This is odd-characteristic because ordinary discriminant square class is a
nontrivial quadratic character only for odd `q`. In characteristic `2`, the
ordinary discriminant sign degenerates; the parity information is carried by
Berlekamp/Artin-Schreier-type additive data instead of a quadratic
low-coefficient character. Prediction: the specific `mu(f-t)` / forward-gap
coupling is present for odd `q` and null for characteristic `2`.

## Pre-registered predictions

All predictions are for the same statistic:

```text
r_q(n) = Corr(mu(f-t), G_+(f) | f monic irreducible degree n, G_-(f)>t)
```

Controls required in every computed field: five composite-only seeds,
five cyclic shifts of the real feature vector, and the high-coefficient
placebo `mu(f - t^(n-1))` measured on the same scrubbed rows.

Characteristic-2 caveat, declared before computation: since `-t=t` in
characteristic `2`, the negative-shift row collapses onto a forward shift.
The audit will therefore report both the literal previous-gap scrub and a
stricter two-sided scrub (`G_-(f)>t` and `G_+(f)>t`) for `F_4[t]`; the
prediction is null for both.

Predictions before computing the fields:

| field | degree block | predicted sign | predicted r size | predicted controls |
| --- | ---: | ---: | ---: | --- |
| `F_3[t]` | exact degree `18` | positive | plateau, `0.019 <= r <= 0.024` | cyclic/composite/placebo null |
| `F_5[t]` | exact degree `11` | positive | smaller, `0.010 <= r <= 0.016` | cyclic/composite/placebo null |
| `F_7[t]` | exact degree `9` | positive | smaller, `0.006 <= r <= 0.012` | cyclic/composite/placebo null |
| `F_4[t]` | exact degree `12` | null | `|r| < 0.003` | all controls null |

Family law being tested:

```text
Odd q:    r_q(n) = C/q + o_q(1/q) + o_n(1), C > 0.
Char 2:   r_q(n) = 0 at this scale after the same low-shift scrub.
```

This law intentionally does not predict a `q mod 4` sign flip. If `F_5` and
`F_7` split by `chi_q(-1)`, this preregistered mechanism is incomplete and
must be replaced by a refined discriminant-ratio law.

## Result of first preregistration - refuted

Artifact:

```text
logs/two-universes-artifacts/mobius-gap-cross-q-law.json
logs/two-universes-artifacts/mobius-gap-cross-q-law.md
```

Outcome:

| field | predicted | observed largest-degree r | status |
| --- | --- | ---: | --- |
| `F_3[t]`, degree `18` | `0.019 <= r <= 0.024` | `0.019551` | confirmed plateau |
| `F_5[t]`, degree `11` | `0.010 <= r <= 0.016` | `0.007587` | refutes size |
| `F_7[t]`, degree `9` | `0.006 <= r <= 0.012` | `0.002273` | refutes size |
| `F_4[t]`, previous scrub | null | `0.047112` | direct-collapse artifact: `-t=t` |
| `F_4[t]`, two-sided scrub | null `|r|<0.003` | `0.006272` | refutes strict null |

The broad "all odd q have an F_3-sized odd-characteristic effect" law is
false. The mechanism must be narrowed: Pellet's discriminant sign identifies
the odd-characteristic quantity, but the lexicographic short-interval
correlation is a small finite-q character correlation that decays quickly
with `q`; it is not a stable fixed-size odd-q phenomenon.

## Replacement preregistration - before computing F_5 degree 12, F_7 degree 10, F_8 degree 8

Refined mechanism: `mu(f-t)` couples to the forward gap through the
low-coefficient Frobenius parity character. In odd characteristic this is
Pellet's quadratic discriminant character; in characteristic `2`, the
ordinary discriminant sign degenerates and the literal negative shift
collapses onto the positive shift, so only the two-sided scrub is meaningful.
The size is controlled by cancellation of a nonconstant character over a
short low-coefficient family, so the residual should decay roughly like
`q^-2` rather than like `q^-1`.

Replacement predictions, registered before these holdout computations:

| field | uncomputed holdout | predicted sign | predicted r size | controls |
| --- | ---: | ---: | ---: | --- |
| `F_5[t]` | degree `12` | positive | `0.005 <= r <= 0.009` | cyclic/composite/high-placebo null |
| `F_7[t]` | degree `10` | positive or null-small | `0 <= r <= 0.004` | cyclic/composite/high-placebo null |
| `F_8[t]` | degree `8`, two-sided scrub | null | `|r| < 0.003` | cyclic/composite/high-placebo null |

Revised law under test:

```text
Odd q:  r_q(n) = A/q^2 + o_q(q^-2) + o_n(1), A about 0.15-0.20.
Char 2: the literal previous-scrub statistic is not comparable because
        f-t=f+t; after two-sided direct-leak scrub, r_q(n) is at most
        q^-2 scale and should be null by F_8.
```

## Result of replacement preregistration - odd-q confirmed, strict char-2 null refuted

Artifact:

```text
logs/two-universes-artifacts/mobius-gap-cross-q-law-refined.json
logs/two-universes-artifacts/mobius-gap-cross-q-law-refined.md
```

Outcome:

| field | prediction | observed r | status |
| --- | --- | ---: | --- |
| `F_5[t]`, degree `12` | `0.005 <= r <= 0.009` | `0.007364` | confirmed |
| `F_7[t]`, degree `10` | `0 <= r <= 0.004` | `0.002492` | confirmed |
| `F_8[t]`, degree `8`, two-sided | null `|r|<0.003` | `0.010017` | refuted |

Interpretation before any further computation: odd `q` now looks like a
quickly decaying low-coefficient Frobenius-parity effect. The strict
characteristic-2 null is too strong. In characteristic `2`, the ordinary
quadratic discriminant character is replaced by Berlekamp's
discriminant/Artin-Schreier trace parity character; after the direct
`f-t=f+t` collapse is scrubbed, a smaller positive parity-gap coupling may
remain over extension fields even though the prime field `F_2` audit stayed
null.

## Final char-2 holdout preregistration - before computing F_8 degree 9

Final uncomputed holdout prediction:

| field | uncomputed holdout | predicted sign | predicted r size | controls |
| --- | ---: | ---: | ---: | --- |
| `F_8[t]` | degree `9`, two-sided scrub | positive | `0.004 <= r <= 0.009` | cyclic/composite/high-placebo null |

If degree `9` falls back below `|r|<0.003`, the degree-8 F_8 row is finite-size
noise and the char-2 extension branch should be logged as unresolved. If it
stays positive inside the band, the law becomes a parity-character law:
Pellet/quadratic in odd characteristic and Berlekamp-Artin-Schreier in
characteristic `2`, with `F_2` as a degenerate prime-field exception rather
than representative of all characteristic `2` extensions.

## F_2 same-semantics null preregistration - before recomputing F_2 degree 25

Prior artifacts already killed the `F_2[t]` branch. To align the final
comparison with the characteristic-2 two-sided scrub used for `F_8`, run one
same-semantics check:

| field | holdout | predicted r size | controls |
| --- | ---: | ---: | --- |
| `F_2[t]` | degree `25`, two-sided scrub | `|r| < 0.003` | cyclic/composite/high-placebo null |

## Final holdout results

Artifacts:

```text
logs/two-universes-artifacts/mobius-gap-cross-q-law-f8-holdout.json
logs/two-universes-artifacts/mobius-gap-cross-q-law-f8-holdout.md
logs/two-universes-artifacts/mobius-gap-cross-q-law-f2-null.json
logs/two-universes-artifacts/mobius-gap-cross-q-law-f2-null.md
```

Results:

| field | prediction | observed r | controls | status |
| --- | --- | ---: | --- | --- |
| `F_8[t]`, degree `9`, two-sided | `0.004 <= r <= 0.009` | `0.006483` | cyclic `0.000287`, composite `0.000402`, high `-0.000368` | confirmed |
| `F_2[t]`, degree `25`, two-sided | `|r| < 0.003` | `0.000076` | cyclic `0.000640`, composite `0.000986`, high `-0.000431` | confirmed |

Final mechanism surviving holdout:

The coupling quantity is the Frobenius-parity character of the neighboring
polynomial `f-t`. In odd characteristic this character is
`chi_q(Disc(f-t))` by Pellet's theorem. In characteristic `2` it is the
Berlekamp discriminant / Artin-Schreier trace parity character; the literal
negative shift collapses to a positive shift, so two-sided direct-leak scrub is
required. The effect is large only at very small field size and then decays
quickly: `F_3` is the visible odd-prime-field case, `F_5` and `F_7` are
smaller holdouts, `F_8` confirms the characteristic-2 extension analogue, and
`F_2` is a degenerate null endpoint.

## HANDOFF

Status: completed to a conjectural/predictive mechanism with holdouts.

What changed:
- `src/core/ffield.js` now supports `F_4`, `F_5`, `F_7`, and `F_8` in addition
  to `F_2` and `F_3`, using field-operation tables for extension-field
  coefficient arithmetic.
- `scripts/mobius-gap-cross-q-law.mjs` runs the cross-q audit with real `r`,
  cyclic controls, composite-only controls, and high-coefficient placebo.
- `logs/two-universes-artifacts/mobius-gap-cross-q-expert-pack.md` states the
  mechanism and law.
- `logs/two-universes-artifacts/mobius_gap_cross_q_stub.lean` is a parseable
  Lean 4 conjecture skeleton.
- `KNOWLEDGE.md` has the cross-q entry with connection lines.

Best current statement:
- The mechanism is Frobenius parity of `f-t`.
- Odd characteristic: Pellet discriminant character; observed odd-prime law
  is positive and about `A/q^2` over `q=3,5,7`.
- Characteristic `2`: use Berlekamp-Artin-Schreier parity and two-sided scrub;
  `F_2` is null, `F_8` is positive on the registered degree-9 holdout.
- Integer `Z` remains null because it has no finite coefficient-space
  Frobenius-parity character tied to lexicographic short intervals.

Next useful checks:
1. Add `F_9` or `F_11` support if runtime permits, then preregister odd-q
   predictions from the `A/q^2` band before computing.
2. Add `F_16` to test whether the characteristic-2 extension branch decays and
   to estimate its exponent.
3. Derive the local character-correlation formula explicitly: express the
   conditional gap-tail event in terms of absence of nearby `n`-cycle
   Frobenius classes, then evaluate its covariance with the Pellet or
   Berlekamp parity character.
4. Keep using `r`, not `z`, as the primary effect-size gate.
