# Local Chowla weather report

## Objective and Quarantine

This run replaces the earlier terminal-column Chowla audit with a local-window search for rigid residual feature laws. It does not use zeta functions, zeros, explicit formula terms, RH equivalents, Robin, Nicolas, or Lagarias criteria. It also refuses to promote individual h columns.

Configuration: `N=300000`, `H=512`, `windows=256,512,1024,2048,4096,8192`, `stride=512`, `seeds=30`.
Elapsed: `6.31s`.

## Why terminal C_h(N) was insufficient

The previous terminal statistic collapses every shift into one endpoint number, so a large `C_h(N)` can be an isolated h outlier, an endpoint accident, or a low-complexity parity/modulus artifact. Local weather keeps the x-coordinate and window scale alive, then scores only feature-family laws that have train/holdout support, null separation, and dyadic persistence.

## Statistic

```text
lambda(n) = (-1)^Omega(n)
B(h,x,L) = sum_{n=x}^{x+L-1} lambda(n) lambda(n+h)
Z(h,x,L) = B(h,x,L) / sqrt(L)
```

The implementation uses prefix sums of `A_h(n)=lambda(n)lambda(n+h)` for each h, so every local window query is an O(1) prefix difference after the per-shift pass.

Tensor rows scanned: `1784320`. Aggregated h x L cells: `3072`.
Dyadic comparison tensor: `N/2=150000`, rows scanned `884224`, cells `3072`.

## Null Definitions

| null | definition | implementation mode |
| --- | --- | --- |
| random completely multiplicative signs | choose seeded independent signs on primes and extend multiplicatively | analytic-unit-window-cell |
| block-shuffled lambda | shuffle contiguous lambda sign runs, preserving local run lengths roughly | conservative-unit-window-cell |
| sign-shuffled A_h | multiply A_h(n)=lambda(n)lambda(n+h) by seeded random signs within each scale | analytic-seeded-sign-flip-cell |

The law score uses the most conservative train z across random-multiplicative, block-shuffle, and sign-shuffle gates. Large runs use unit-variance local-cell null summaries for h x L reporting and seeded law-level perturbations for the gate; small runs use exact seeded null tensors.

## Top 10 Feature Laws

These are feature-family laws only. No individual h column is ranked.

| rank | feature law | family | score | train z | train effect | holdout effect | N/2 effect | verdict | rejection |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| 1 | omega(h) = 1 and h mod 8 = 3 | group-2-features | 0.843 | 0.417 | 0.03448 | 0.05507 | 0.06969 | not-survivor | train real-vs-null z 0.417 < 4; not separated from h-size-only control; not separated from one-modulus-only control |
| 2 | gcd(h,2310) = 3 and h mod 8 = 1 | group-2-features | 0.777 | 0.612 | 0.05766 | 0.05172 | 0.05520 | not-survivor | train real-vs-null z 0.612 < 4; holdout support 5 h < 8; not separated from one-modulus-only control |
| 3 | gcd(h,2310) = 3 and h mod 24 = 9 | group-2-features | 0.777 | 0.612 | 0.05766 | 0.05172 | 0.05520 | not-survivor | train real-vs-null z 0.612 < 4; holdout support 5 h < 8; not separated from one-modulus-only control |
| 4 | omega(h) = 2 and tau(h) = 8 | group-2-features | 0.736 | 0.385 | 0.03339 | 0.04061 | 0.04477 | not-survivor | train real-vs-null z 0.385 < 4; not separated from h-size-only control; not separated from one-modulus-only control |
| 5 | Omega(h) = 4 and tau(h) = 8 | group-2-features | 0.736 | 0.385 | 0.03339 | 0.04061 | 0.04477 | not-survivor | train real-vs-null z 0.385 < 4; not separated from h-size-only control; not separated from one-modulus-only control |
| 6 | tau(h) = 8 and Omega(h) parity = even | group-2-features | 0.736 | 0.385 | 0.03339 | 0.04061 | 0.04477 | not-survivor | train real-vs-null z 0.385 < 4; not separated from h-size-only control; not separated from one-modulus-only control |
| 7 | squarefree(h) = true and h mod 12 = 11 | group-2-features | 0.706 | 0.444 | 0.03577 | 0.03494 | 0.06363 | not-survivor | train real-vs-null z 0.444 < 4; not separated from h-size-only control; not separated from one-modulus-only control |
| 8 | h mod 12 = 11 | group-1-feature | 0.703 | 0.444 | 0.03577 | 0.03478 | 0.06363 | not-survivor | train real-vs-null z 0.444 < 4; not separated from h-size-only control; not separated from one-modulus-only control; one-modulus-only law is quarantined |
| 9 | v2(h) = 0 and h mod 12 = 11 | group-2-features | 0.703 | 0.444 | 0.03577 | 0.03478 | 0.06363 | not-survivor | train real-vs-null z 0.444 < 4; not separated from h-size-only control; not separated from one-modulus-only control |
| 10 | h mod 3 = 2 and h mod 4 = 3 | group-2-features | 0.703 | 0.444 | 0.03577 | 0.03478 | 0.06363 | not-survivor | train real-vs-null z 0.444 < 4; not separated from h-size-only control; not separated from one-modulus-only control |

## Train vs Holdout Controls

- h-size-only control max z: `0.290`
- parity-only control max z: `0.000`
- one-modulus-only control max z: `0.856`
- global h-size R2 over local cells: `0.0001`

Every promoted law must beat these controls, keep the same sign on h <= H/2 and h > H/2, and avoid isolated-h dominance.

## Dyadic rerun comparison: N/2 vs N

| feature law | N train effect | N/2 effect | same direction | dyadic ratio |
| --- | ---: | ---: | --- | ---: |
| omega(h) = 1 and h mod 8 = 3 | 0.03448 | 0.06969 | yes | 2.021 |
| gcd(h,2310) = 3 and h mod 8 = 1 | 0.05766 | 0.05520 | yes | 0.957 |
| gcd(h,2310) = 3 and h mod 24 = 9 | 0.05766 | 0.05520 | yes | 0.957 |
| omega(h) = 2 and tau(h) = 8 | 0.03339 | 0.04477 | yes | 1.341 |
| Omega(h) = 4 and tau(h) = 8 | 0.03339 | 0.04477 | yes | 1.341 |
| tau(h) = 8 and Omega(h) parity = even | 0.03339 | 0.04477 | yes | 1.341 |
| squarefree(h) = true and h mod 12 = 11 | 0.03577 | 0.06363 | yes | 1.779 |
| h mod 12 = 11 | 0.03577 | 0.06363 | yes | 1.779 |
| v2(h) = 0 and h mod 12 = 11 | 0.03577 | 0.06363 | yes | 1.779 |
| h mod 3 = 2 and h mod 4 = 3 | 0.03577 | 0.06363 | yes | 1.779 |

## Rejected Artifacts

| artifact | score | reason |
| --- | ---: | --- |
| h-size-only law | 0.290 | control law; cannot promote a size explanation |
| one-modulus-only law | 0.856 | hard gate excludes single residue modulus explanations |
| Omega(h) parity = even and h mod 24 = 10 | 0.180 | feature bucket effect was dominated by one h column |

## Artifact Files

- `logs/frontier/chowla-weather-laws.json`
- `logs/frontier/chowla-weather-feature-matrix.csv`
- `logs/frontier/chowla-weather-heatmap.svg`
- `logs/frontier/chowla-weather-phase.svg`

## NO SURVIVOR

NO SURVIVOR: local weather also null. Exact failure reason: the best-ranked law, `omega(h) = 1 and h mod 8 = 3`, failed with train real-vs-null z 0.417 < 4; not separated from h-size-only control; not separated from one-modulus-only control. No candidate conjecture is promoted.
