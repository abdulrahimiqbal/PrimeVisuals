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

### N=250000

split=125000, labels=22044, local state=deterministic admissibility over primes 2,3,5,7,11 (W=2310)

| order | real RMS | real allowed RMS | max mean residual | blocked frac | low-edge frac | random eligible RMS range | composite RMS range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| order 1 | 0.081125 | 0.124633 | 0.103620 | 0.352856 | 0.000000 | 0.006735..0.018379 | 0.041804..0.056663 |
| order 2 | 0.056243 | 0.138592 | 0.080970 | 0.597914 | 0.000000 | 0.007272..0.013876 | 0.028399..0.039608 |
| order 3 | 0.032470 | 0.133558 | 0.050042 | 0.763000 | 0.000000 | 0.006202..0.009774 | 0.014254..0.022964 |

### N=500000

split=250000, labels=41538, local state=deterministic admissibility over primes 2,3,5,7,11 (W=2310)

| order | real RMS | real allowed RMS | max mean residual | blocked frac | low-edge frac | random eligible RMS range | composite RMS range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| order 1 | 0.068432 | 0.104281 | 0.080843 | 0.352698 | 0.000000 | 0.005687..0.012841 | 0.041015..0.046791 |
| order 2 | 0.045506 | 0.110067 | 0.060317 | 0.597697 | 0.000000 | 0.005389..0.008430 | 0.027960..0.033377 |
| order 3 | 0.024817 | 0.097907 | 0.039803 | 0.762819 | 0.000000 | 0.003764..0.005421 | 0.015664..0.019675 |

## F_2[t] side

train degree=17, holdout degree=18, local state=deterministic admissibility against 3 irreducible moduli of degree <=2

| order | real RMS | real allowed RMS | max mean residual | blocked frac | low-edge frac | random monic eligible RMS range | random reducible eligible RMS range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| order 1 | 0.026756 | 0.038984 | 0.038189 | 0.277801 | 0.000000 | 0.018270..0.036711 | 0.020450..0.039220 |
| order 2 | 0.018474 | 0.040029 | 0.025871 | 0.488921 | 0.000000 | 0.013536..0.029786 | 0.011730..0.029115 |
| order 3 | 0.014681 | 0.035209 | 0.035183 | 0.650031 | 0.150000 | 0.010441..0.019772 | 0.007801..0.017390 |

## F_3[t] side

train degree=9, holdout degree=10, local state=deterministic admissibility against 6 irreducible moduli of degree <=2

| order | real RMS | real allowed RMS | max mean residual | blocked frac | low-edge frac | random monic eligible RMS range | random reducible eligible RMS range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| order 1 | 0.066753 | 0.099515 | 0.072768 | 0.329145 | 0.000000 | 0.067595..0.091827 | 0.017966..0.022481 |
| order 2 | 0.046625 | 0.110300 | 0.058983 | 0.576786 | 0.000000 | 0.046631..0.074469 | 0.017591..0.020387 |
| order 3 | 0.026977 | 0.109875 | 0.041864 | 0.754510 | 0.000000 | 0.026771..0.047882 | 0.011825..0.014440 |

## F_5[t] side

train degree=5, holdout degree=6, local state=deterministic admissibility against 15 irreducible moduli of degree <=2

| order | real RMS | real allowed RMS | max mean residual | blocked frac | low-edge frac | random monic eligible RMS range | random reducible eligible RMS range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| order 1 | 0.000000 | 0.000000 | 0.000000 | 0.000000 | 1.000000 | 0.000000..0.000000 | 0.000000..0.000000 |
| order 2 | 0.000000 | 0.000000 | 0.000000 | 0.000000 | 1.000000 | 0.000000..0.000000 | 0.000000..0.000000 |
| order 3 | 0.000000 | 0.000000 | 0.000000 | 0.000000 | 1.000000 | 0.000000..0.000000 | 0.000000..0.000000 |

JSON: `logs/two-universes-protocol/cycle-005-exact-admissibility-tensor-500000.json`
SVG: `logs/two-universes-protocol/cycle-005-exact-admissibility-tensor-500000.svg`
