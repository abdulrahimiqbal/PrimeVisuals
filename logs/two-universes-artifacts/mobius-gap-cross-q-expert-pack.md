# Expert Pack: Cross-q Mobius-Parity Gap Law

Status: `CONJECTURAL / HOLDOUT-CONFIRMED`

## Object

For a finite field `F_q`, order monic irreducibles of fixed degree by the
base-`q` coefficient encoding. For an irreducible `f`, let `G_+(f)` and
`G_-(f)` be the next and previous lexicographic irreducible gaps. The primary
statistic is

```text
R_q(n) = Corr(mu(f - t), G_+(f) | f irreducible degree n, G_-(f) > t).
```

In characteristic `2`, `f - t = f + t`, so the comparable statistic uses a
two-sided direct-leak scrub:

```text
R_q^2s(n) = Corr(mu(f - t), G_+(f) | G_-(f) > t and G_+(f) > t).
```

## Mechanism

The arithmetic quantity coupling `mu(f-t)` to the forward gap is the
Frobenius-parity character of the neighboring polynomial `f-t`.

For odd `q`, Pellet's theorem gives the concrete identity

```text
mu(g) = (-1)^deg(g) * chi_q(Disc(g)),
```

so `mu(f-t)` is exactly the quadratic discriminant character, equivalently
the sign of Frobenius on the roots. For characteristic `2`, the ordinary
quadratic discriminant character disappears; the parity character is instead
Berlekamp's discriminant with the Artin-Schreier trace character.

The forward gap is a waiting time for the next nearby polynomial whose
Frobenius cycle is a single `n`-cycle. Such a candidate has Mobius value `-1`.
Therefore a positive parity value in the low-coefficient neighbor predicts a
shortage of immediate irreducible candidates ahead and a longer next gap. The
high-coefficient placebo stays null, so the coupling lives in the lexicographic
short-interval neighborhood, not in arbitrary coefficient perturbations.

## Pre-Registered Prediction Trail

The first preregistration predicted an odd-characteristic effect of size
about `1/q`. It was refuted by `F_5` and `F_7`. The replacement prediction was
registered before computing the larger holdouts and predicted `q^-2` scale for
odd `q`; this held:

| field | holdout | predicted r | observed r | cyclic meanAbs r | composite meanAbs r | high-placebo r |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `F_3[t]` | degree `18` | `0.019..0.024` | `0.019551` | `0.000118` | `0.001070` | `-0.000449` |
| `F_5[t]` | degree `12` | `0.005..0.009` | `0.007364` | `0.000193` | `0.000226` | `-0.000450` |
| `F_7[t]` | degree `10` | `0..0.004` | `0.002492` | `0.000312` | `0.000186` | `-0.000057` |

The strict characteristic-2 null was refuted at `F_8` degree `8`, so a final
Artin-Schreier/Berlekamp holdout was registered for `F_8` degree `9`; it held:

| field | holdout | predicted r | observed r | cyclic meanAbs r | composite meanAbs r | high-placebo r |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `F_8[t]` two-sided | degree `9` | `0.004..0.009` | `0.006483` | `0.000287` | `0.000402` | `-0.000368` |
| `F_2[t]` two-sided | degree `25` | `abs(r)<0.003` | `0.000076` | `0.000640` | `0.000986` | `-0.000431` |

## The Law

Conjecture. Let `P_q(g)` be the Frobenius-parity character represented by
Pellet's quadratic discriminant character for odd `q`, and by
Berlekamp-Artin-Schreier parity for even `q`. For fixed small shifts in the
lexicographic low-coefficient neighborhood,

```text
Corr(P_q(f-t), G_+(f) | direct-leak scrub)
```

is positive when `P_q` remains a nontrivial low-coefficient character after the
scrub, and is null when that character degenerates (`F_2`) or has no finite
field coefficient-space analogue (`Z`). For odd prime `q`, the measured law is

```text
R_q(n) ~= A/q^2, with A roughly 0.12..0.19 over q=3,5,7.
```

For characteristic `2`, the comparable two-sided statistic is not governed by
ordinary discriminant square class. It follows the Berlekamp-Artin-Schreier
parity character: `F_2` is null, while `F_8` is positive on the degree-9
holdout. More fields are needed before claiming an exponent in the
characteristic-2 extension family.

## Nearest Catalog Result

Nearest catalog, odd characteristic: Pellet's formula. Conrad states the
odd-characteristic identity as `mu(h)=(-1)^deg h chi(disc h)` in Lemma 4.1:
https://kconrad.math.uconn.edu/articles/texel.pdf

Nearest catalog, characteristic `2`: Carmon notes that Pellet's formula does
not hold for even `q`, but gives an analogue using Berlekamp's discriminant:
https://arxiv.org/pdf/1409.3694

Nearest short-interval catalog: Kurlberg-Rosenzweig study prime and Mobius
correlations in very short intervals `I(f)={f+a}` and arithmetic class
functions:
https://arxiv.org/abs/1802.01215

Difference: those catalog results concern Mobius identities, Chowla-type sums,
short-interval independence, or prime counts. This pack's statistic is a
conditional consecutive-gap tail: Mobius parity of `f-t` predicts the following
lexicographic irreducible gap after direct short-gap leakage is removed.

## Artifacts

```text
logs/2026-06-13-mobius-gap-cross-q.md
logs/two-universes-artifacts/mobius-gap-cross-q-law.json
logs/two-universes-artifacts/mobius-gap-cross-q-law-refined.json
logs/two-universes-artifacts/mobius-gap-cross-q-law-f8-holdout.json
logs/two-universes-artifacts/mobius-gap-cross-q-law-f2-null.json
logs/two-universes-artifacts/mobius_gap_cross_q_stub.lean
scripts/mobius-gap-cross-q-law.mjs
```
