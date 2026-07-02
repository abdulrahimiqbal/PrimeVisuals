# Quotient spectral residual audit

Candidate:
build prime-indicator residual rows after rough/local admissibility subtraction,
then score the quotient-residue covariance spectral edge normalized by the
Marchenko-Pastur edge. Residue-cell basis is an orthogonal transform away from
Fourier/character modes for the same quotient energy.

Integer rough cutoff: `257`; block count:
`24`; control seeds: `5`.

## Integer final endpoint by quotient budget

| budget | moduli | Z edge | rough-random edge range | rough-composite edge range | Cramer edge range | excess edge slope |
| ---: | --- | ---: | ---: | ---: | ---: | ---: |
| 3 | 3,5,7 | 1.175501 | 0.927525..1.081210 | 0.879434..1.188055 | 0.901371..1.108312 | NA |
| 5 | 3,5,7,11,13 | 0.976210 | 0.889840..1.190969 | 0.920216..1.074407 | 0.892645..1.036900 | NA |
| 8 | 3,5,7,11,13,17,19,23 | 1.115442 | 0.929424..1.078647 | 0.969926..1.084968 | 0.894297..1.032642 | NA |

## Integer budget-8 scale trace

| N | Z edge | Z energy | rough-random edge range | rough-composite edge range | excess edge |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 1000000 | 1.115442 | 0.404963 | 0.929424..1.078647 | 0.969926..1.084968 | 0.130547 |

Final strongest Z columns:
`Z:17:r9=0.582, Z:23:r4=0.537, Z:23:r19=0.525, Z:17:r2=0.517, Z:19:r2=0.513, Z:23:r8=0.504, Z:23:r12=0.498, Z:17:r16=0.496`

## Function-field quotient budgets

| universe | degrees | budget | moduli | real edge | rough-random edge range | rough-composite edge range |
| --- | --- | ---: | --- | ---: | ---: | ---: |
| F_2[t] | 14,15,16 | 2 | t, t + 1 | 0.000000 | 0.000000..0.000000 | 0.000000..0.000000 |
| F_2[t] | 14,15,16 | 3 | t, t + 1, t^2 + t + 1 | 0.750494 | 0.682026..0.749194 | 0.646394..0.709042 |
| F_3[t] | 7,8,9 | 2 | t, t + 1 | 0.686292 | 0.572819..0.679719 | 0.382862..0.686291 |
| F_3[t] | 7,8,9 | 3 | t, t + 1, t + 2 | 0.803848 | 0.531239..0.767429 | 0.649484..0.792192 |
| F_3[t] | 7,8,9 | 5 | t, t + 1, t + 2, t^2 + 1, t^2 + t + 2 | 0.790195 | 0.715956..0.921417 | 0.762948..0.894027 |
| F_5[t] | 4,5,6 | 2 | t, t + 1 | 0.888889 | 0.539075..0.769960 | 0.885136..0.887584 |
| F_5[t] | 4,5,6 | 3 | t, t + 1, t + 2 | 1.008490 | 0.617720..0.785719 | 1.004812..1.007120 |
| F_5[t] | 4,5,6 | 5 | t, t + 1, t + 2, t + 3, t + 4 | 1.154431 | 0.641259..0.755549 | 1.150991..1.153181 |
| F_5[t] | 4,5,6 | 8 | t, t + 1, t + 2, t + 3, t + 4, t^2 + 2, t^2 + 3, t^2 + t + 1 | 0.000000 | 0.828328..0.914911 | 1.502476..1.507035 |

JSON: `logs/two-universes-protocol/cycle-007-quotient-spectral-residual-1000000.json`
SVG: `logs/two-universes-protocol/cycle-007-quotient-spectral-residual-1000000.svg`
