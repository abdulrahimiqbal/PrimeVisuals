# Centered multi-shift tensor audit

Candidate:
subtract per-shift train edge rates, then score the holdout off-diagonal covariance of normalized residual edge variables

```text
Z_h(v) = (1_{v+h is prime-like} - p_h(train)) / sqrt(p_h(train)(1-p_h(train)))
score = RMS_{h != k} mean_holdout Z_h(v) Z_k(v)
```

## Integer side

N=2000000, split=1000000, labels=148933

| group | offdiag rms | max offdiag | mean abs residual | max abs mean residual |
| --- | ---: | ---: | ---: | ---: |
| real primes | 0.028557 | 0.069436 | 0.063064 | 0.073784 |
| Cramer controls | 0.004657..0.007327 | 0.008960..0.015150 | 0.062372..0.064249 | 0.068649..0.073106 |
| composite controls | 0.036261..0.036880 | 0.085709..0.094609 | 0.035679..0.039989 | 0.041956..0.049750 |

## F_2[t] side

train degree=21, holdout degree=22, train labels=99858, holdout labels=190557

| group | offdiag rms | max offdiag | mean abs residual | max abs mean residual |
| --- | ---: | ---: | ---: | ---: |
| real irreducibles | 0.050837 | 0.085368 | 0.020452 | 0.025055 |
| random monic controls | 0.001677..0.003014 | 0.003176..0.005379 | 0.008071..0.011319 | 0.014886..0.019740 |
| random reducible controls | 0.001967..0.003312 | 0.003204..0.006698 | 0.007396..0.010514 | 0.011353..0.017235 |

## F_3[t] side

train degree=12, holdout degree=13, train labels=44220, holdout labels=122640

| group | offdiag rms | max offdiag | mean abs residual | max abs mean residual |
| --- | ---: | ---: | ---: | ---: |
| real irreducibles | 0.023436 | 0.029279 | 0.047598 | 0.058917 |
| random monic controls | 0.002636..0.003599 | 0.006243..0.012036 | 0.018968..0.026820 | 0.024100..0.032194 |
| random reducible controls | 0.002663..0.003645 | 0.004895..0.012645 | 0.021356..0.023600 | 0.024467..0.031875 |

JSON: `logs/two-universes-protocol/cycle-003-centered-shift-tensor-2000000.json`
SVG: `logs/two-universes-protocol/cycle-003-centered-shift-tensor-2000000.svg`
