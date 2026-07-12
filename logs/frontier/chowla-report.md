# FrontierLab Chowla residual search

## Objective and Quarantine

Objective: search for a non-zeta rigid residual locus in the binary Chowla field, especially a stable dependence on the factorization type of h.

Quarantine: this run does not import or evaluate zeta functions, zeta zeros, explicit formula terms, Robin/Nicolas/Lagarias criteria, or any known RH-equivalent. The only arithmetic signal is Liouville parity and fixed-shift products.

Configuration: `N0=20000`, `levels=4`, `H=256`, `seeds=20`.
Elapsed: `4.40s`.

## Exact Statistic

```text
lambda(n) = (-1)^Omega(n)
S(h,N) = sum_{1 <= n <= N-h} lambda(n) lambda(n+h)
Z(h,N) = S(h,N) / sqrt(N)
```

The residual used in the heatmap and score is
`(Z_real(h,N) - mean_random_multiplicative(h,N)) / sd_random_multiplicative(h,N)`.

## Strongest Raw Final Shifts

| h | S(h,N) | Z=S/sqrt(N) | rad(h) | omega | Omega | v2 | oddpart | squarefree |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 92 | 1366 | 3.4150 | 46 | 2 | 3 | 2 | 23 | no |
| 183 | -1285 | -3.2125 | 183 | 2 | 2 | 0 | 183 | yes |
| 101 | -1171 | -2.9275 | 101 | 1 | 1 | 0 | 101 | yes |
| 184 | 1138 | 2.8450 | 46 | 2 | 4 | 3 | 23 | no |
| 234 | -1082 | -2.7050 | 78 | 3 | 4 | 1 | 117 | no |
| 237 | -833 | -2.0825 | 237 | 2 | 2 | 0 | 237 | yes |
| 13 | 813 | 2.0325 | 13 | 1 | 1 | 0 | 13 | yes |
| 27 | 803 | 2.0075 | 3 | 1 | 3 | 0 | 27 | no |
| 46 | 802 | 2.0050 | 46 | 2 | 2 | 1 | 23 | yes |
| 108 | 802 | 2.0050 | 6 | 2 | 5 | 2 | 27 | no |
| 150 | 736 | 1.8400 | 30 | 3 | 4 | 1 | 75 | no |
| 87 | 733 | 1.8325 | 87 | 2 | 2 | 0 | 87 | yes |

## Strongest Residual Loci and Feature Groups

| rank | locus | score | max |z_random| | max |z_shuffle| | persistence | holdout ratio | verdict | rejection |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| 1 | h=101 | 1.260 | 3.377 | 3.488 | 0.703 | 1.879 | not-survivor | single-shift multiple-test/complexity gate |
| 2 | h=92 | 1.254 | 3.353 | 3.941 | 0.854 | 1.169 | not-survivor | single-shift multiple-test/complexity gate |
| 3 | h=81 | 1.053 | 3.717 | 2.489 | 0.795 | 0.576 | not-survivor | below real-vs-null threshold; single-shift multiple-test/complexity gate |
| 4 | h=183 | 1.053 | 2.851 | 3.356 | 0.692 | 1.859 | not-survivor | below real-vs-null threshold; single-shift multiple-test/complexity gate |
| 5 | h=234 | 1.017 | 3.012 | 3.276 | 0.739 | 1.848 | not-survivor | below real-vs-null threshold; single-shift multiple-test/complexity gate |
| 6 | h=27 | 0.995 | 2.183 | 2.292 | 0.882 | 1.040 | not-survivor | below real-vs-null threshold; single-shift multiple-test/complexity gate |
| 7 | h=235 | 0.918 | 2.496 | 2.462 | 0.702 | 0.800 | not-survivor | below real-vs-null threshold; single-shift multiple-test/complexity gate |
| 8 | h=163 | 0.883 | 3.016 | 2.369 | 0.702 | 0.549 | not-survivor | below real-vs-null threshold; single-shift multiple-test/complexity gate |
| 9 | h=2 | 0.827 | 1.156 | 0.976 | 0.723 | 0.696 | not-survivor | below real-vs-null threshold |
| 10 | h=64 | 0.823 | 1.870 | 1.622 | 0.662 | 0.655 | not-survivor | below real-vs-null threshold; single-shift multiple-test/complexity gate |
| 11 | h=201 | 0.812 | 2.112 | 2.059 | 0.762 | 0.571 | not-survivor | below real-vs-null threshold; single-shift multiple-test/complexity gate |
| 12 | h=162 | 0.808 | 3.787 | 1.963 | 0.764 | 0.981 | not-survivor | below real-vs-null threshold; single-shift multiple-test/complexity gate |

## Dyadic Persistence

Entries are normalized residuals against the random completely multiplicative null.

| locus | N=20000 | N=40000 | N=80000 | N=160000 | persistence | holdout |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| h=101 | -1.120 | -2.228 | -2.044 | -3.377 | 0.703 | pass |
| h=92 | 2.293 | 2.704 | 3.353 | 3.255 | 0.854 | pass |
| h=81 | 3.104 | 3.717 | 3.051 | 1.895 | 0.795 | pass |
| h=183 | -0.825 | -1.876 | -1.899 | -2.851 | 0.692 | pass |
| h=234 | -1.571 | -1.550 | -1.769 | -3.012 | 0.739 | pass |
| h=27 | 2.183 | 1.570 | 1.967 | 1.983 | 0.882 | pass |
| h=235 | -1.079 | -1.264 | -2.496 | -1.291 | 0.702 | pass |
| h=163 | 3.016 | 2.211 | 1.391 | 1.211 | 0.702 | pass |

## Feature Dependence Summary

| feature | R2 at final N | strongest group | group n | group mean normalized residual |
| --- | ---: | --- | ---: | ---: |
| omega(h) | 0.0155 | 4 | 1 | -1.1446 |
| Omega(h) | 0.0405 | 7 | 2 | -0.9806 |
| squarefree(h) | 0.0042 | nonsquarefree | 99 | 0.2042 |
| v2(h) | 0.0336 | 5 | 4 | -0.9495 |
| Omega(h) parity | 0.0033 | odd | 131 | 0.1779 |
| rad(h) dyadic bucket | 0.0351 | 1 | 1 | -0.8038 |
| oddpart(h) dyadic bucket | 0.0542 | 2-3 | 8 | -0.5720 |

## Null Comparison

| N | real energy | real max | random energy mean+-sd | random max range | shuffle energy mean+-sd | shuffle max range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 20000 | 0.9145 | 3.2173 | 0.9804 +- 0.0546 | 2.4183..3.5426 | 0.9860 +- 0.0370 | 2.4395..3.9739 |
| 40000 | 0.9489 | 3.6550 | 0.9818 +- 0.0550 | 2.4800..4.0700 | 0.9880 +- 0.0483 | 2.2000..3.2800 |
| 80000 | 0.9734 | 3.6098 | 0.9823 +- 0.0348 | 2.5067..3.6133 | 0.9944 +- 0.0438 | 2.6092..4.0128 |
| 160000 | 0.9494 | 3.4150 | 0.9898 +- 0.0536 | 2.3775..3.9275 | 0.9954 +- 0.0600 | 2.4625..3.7325 |

## Known Disguise Audit

- h-size explanation: final residual R2 against h is 0.0005 and against log(h+1) is 0.0002.
- parity-only explanation: Omega(h) parity R2 is 0.0033; parity-only groups are disqualified as conjectures.
- trivial small-prime divisibility: v2(h) R2 is 0.0336 and squarefree R2 is 0.0042; v2-only groups are disqualified.
- cumulative/telescoping effect: the statistic is the fixed-shift sum S(h,N), not a cumulative gap, prime-counting, or endpoint telescope; the last dyadic level is still treated as holdout.
- sampling artifact: 0 of 292 scored loci passed all gates at thresholds max-normalized >= 3.25, persistence >= 0.65, feature R2 >= 0.12, and holdout ratio >= 0.45.

## NO SURVIVOR

NO SURVIVOR. The strongest scored loci failed at least one of the required gates: null separation, dyadic persistence, holdout sign/magnitude, feature support, or known-disguise audit. The ranked list is retained for inspection, but no candidate conjecture is promoted.
