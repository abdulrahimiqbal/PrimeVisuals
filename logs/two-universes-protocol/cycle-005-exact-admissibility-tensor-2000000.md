# Exact admissibility-conditioned tensor audit

Candidate:
subtract deterministic local obstructions and train allowed pair/triple rates before scoring holdout tensor residuals.

```text
A_S(v)=1 if no local modulus forces any v+h, h in S, to be composite
Z_S(v)=0 when A_S(v)=0
Z_S(v)=(1_{all h in S are prime-like}-p_S(train | A_S=1))/sqrt(p_S(1-p_S)) otherwise
score_order_k = RMS_{|S|=k} mean_holdout Z_S(v)
```

Beta prior for allowed cells: alpha=0.5, beta=0.5. Low train-edge support threshold: 3.

## Integer side

### N=1000000

split=500000, labels=78498, local state=deterministic admissibility over primes 2,3,5,7,11 (W=2310)

| order | real RMS | real allowed RMS | max mean residual | blocked frac | low-edge frac | random eligible RMS range | composite RMS range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| order 1 | 0.060790 | 0.093404 | 0.071382 | 0.353381 | 0.000000 | 0.004209..0.007447 | 0.033828..0.036847 |
| order 2 | 0.040363 | 0.097627 | 0.055474 | 0.598432 | 0.000000 | 0.003658..0.005321 | 0.022232..0.024569 |
| order 3 | 0.021321 | 0.085776 | 0.034436 | 0.763320 | 0.000000 | 0.002685..0.003939 | 0.012012..0.013663 |

### N=2000000

split=1000000, labels=148933, local state=deterministic admissibility over primes 2,3,5,7,11 (W=2310)

| order | real RMS | real allowed RMS | max mean residual | blocked frac | low-edge frac | random eligible RMS range | composite RMS range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| order 1 | 0.056687 | 0.086012 | 0.068484 | 0.353190 | 0.000000 | 0.002687..0.004734 | 0.026893..0.030550 |
| order 2 | 0.036715 | 0.088155 | 0.050005 | 0.598384 | 0.000000 | 0.002095..0.004265 | 0.017730..0.020442 |
| order 3 | 0.019088 | 0.076497 | 0.029280 | 0.763495 | 0.000000 | 0.002111..0.003058 | 0.009454..0.011663 |

## F_2[t] side

train degree=21, holdout degree=22, local state=deterministic admissibility against 3 irreducible moduli of degree <=2

| order | real RMS | real allowed RMS | max mean residual | blocked frac | low-edge frac | random monic eligible RMS range | random reducible eligible RMS range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| order 1 | 0.018671 | 0.025564 | 0.025061 | 0.277778 | 0.000000 | 0.018351..0.021063 | 0.019468..0.023017 |
| order 2 | 0.011508 | 0.023389 | 0.016099 | 0.488889 | 0.000000 | 0.012427..0.014024 | 0.012268..0.014360 |
| order 3 | 0.006118 | 0.015081 | 0.011148 | 0.650000 | 0.150000 | 0.005918..0.008025 | 0.006692..0.008804 |

## F_3[t] side

train degree=12, holdout degree=13, local state=deterministic admissibility against 6 irreducible moduli of degree <=2

| order | real RMS | real allowed RMS | max mean residual | blocked frac | low-edge frac | random monic eligible RMS range | random reducible eligible RMS range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| order 1 | 0.043718 | 0.065232 | 0.054079 | 0.329819 | 0.000000 | 0.042004..0.044098 | 0.038192..0.041847 |
| order 2 | 0.027872 | 0.066004 | 0.041047 | 0.577719 | 0.000000 | 0.027391..0.030472 | 0.023846..0.028812 |
| order 3 | 0.014388 | 0.058821 | 0.021661 | 0.755399 | 0.000000 | 0.013282..0.016634 | 0.011766..0.015863 |

## F_5[t] side

train degree=7, holdout degree=8, local state=deterministic admissibility against 15 irreducible moduli of degree <=2

| order | real RMS | real allowed RMS | max mean residual | blocked frac | low-edge frac | random monic eligible RMS range | random reducible eligible RMS range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| order 1 | 0.097098 | 0.149010 | 0.103978 | 0.348267 | 0.000000 | 0.101940..0.109117 | 0.123414..0.123414 |
| order 2 | 0.067518 | 0.161958 | 0.073905 | 0.582861 | 0.000000 | 0.077687..0.082537 | 0.097169..0.097169 |
| order 3 | 0.038570 | 0.147384 | 0.046709 | 0.738031 | 0.000000 | 0.049065..0.053362 | 0.071408..0.071408 |

JSON: `logs/two-universes-protocol/cycle-005-exact-admissibility-tensor-2000000.json`
SVG: `logs/two-universes-protocol/cycle-005-exact-admissibility-tensor-2000000.svg`
