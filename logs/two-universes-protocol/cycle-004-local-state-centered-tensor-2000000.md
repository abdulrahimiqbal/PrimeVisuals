# Local-state centered multi-shift tensor audit

Candidate:
condition each shift's edge baseline on a local residue/factor state before scoring holdout residual covariance.

```text
Z_h(v) = (1_{v+h is prime-like} - p_h(train, local_state(v,h))) / sqrt(p_h(1-p_h))
score = RMS_{h != k} mean_holdout Z_h(v) Z_k(v)
```

Minimum train count per local state: 25; minimum edge/non-edge support: 3; local rates are smoothed toward the per-shift global rate with prior weight 16. Unsupported states fall back to the global per-shift rate.

## Integer side

N=2000000, split=1000000, labels=148933, local state=n mod 210

| group | offdiag rms | max offdiag | mean abs residual | max abs mean residual | fallback frac |
| --- | ---: | ---: | ---: | ---: | ---: |
| real primes | 0.037195 | 0.072848 | 0.209310 | 0.241708 | 0.281282 |
| Cramer controls | 0.004592..0.007277 | 0.008884..0.015231 | 0.061970..0.063791 | 0.068243..0.072761 | 0.000000..0.000000 |
| composite controls | 0.016732..0.017644 | 0.052527..0.057066 | 0.107442..0.111769 | 0.150413..0.160466 | 0.280992..0.281713 |

## F_2[t] side

train degree=21, holdout degree=22, local state=divisibility mask of f+a by 3 irreducibles of degree <=2

| group | offdiag rms | max offdiag | mean abs residual | max abs mean residual | fallback frac |
| --- | ---: | ---: | ---: | ---: | ---: |
| real irreducibles | 0.025333 | 0.060679 | 0.141088 | 0.169267 | 0.277778 |
| random monic controls | 0.001621..0.003117 | 0.004178..0.005630 | 0.008579..0.010920 | 0.012744..0.020677 | 0.000000..0.000000 |
| random reducible controls | 0.001829..0.003220 | 0.002907..0.006878 | 0.007255..0.010297 | 0.010966..0.016502 | 0.000000..0.000000 |

## F_3[t] side

train degree=12, holdout degree=13, local state=divisibility mask of f+a by 6 irreducibles of degree <=2

| group | offdiag rms | max offdiag | mean abs residual | max abs mean residual | fallback frac |
| --- | ---: | ---: | ---: | ---: | ---: |
| real irreducibles | 0.044332 | 0.050985 | 0.240496 | 0.253276 | 0.329819 |
| random monic controls | 0.002049..0.003349 | 0.003874..0.012546 | 0.017215..0.025346 | 0.025115..0.029349 | 0.005911..0.006957 |
| random reducible controls | 0.002140..0.003195 | 0.004830..0.010659 | 0.018965..0.021523 | 0.023537..0.028638 | 0.005197..0.006058 |

JSON: `logs/two-universes-protocol/cycle-004-local-state-centered-tensor-2000000.json`
SVG: `logs/two-universes-protocol/cycle-004-local-state-centered-tensor-2000000.svg`
