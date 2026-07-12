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
| 3 | 3,5,7 | 0.861624 | 0.824795..0.974318 | 0.874504..1.043787 | 0.902884..1.031228 | -0.732071 |
| 5 | 3,5,7,11,13 | 0.966370 | 0.910460..1.110626 | 0.860595..0.971172 | 1.026901..1.186801 | 0.786951 |
| 8 | 3,5,7,11,13,17,19,23 | 1.103978 | 0.904989..0.956970 | 0.944880..1.027464 | 0.911183..1.086262 | 0.194172 |

## Integer budget-8 scale trace

| N | Z edge | Z energy | rough-random edge range | rough-composite edge range | excess edge |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 1000000 | 1.115442 | 0.404963 | 0.929424..1.078647 | 0.969926..1.084968 | 0.130547 |
| 2000000 | 1.032388 | 0.420684 | 0.912697..1.075472 | 0.960843..1.055461 | 0.058826 |
| 4000000 | 1.103978 | 0.441449 | 0.904989..0.956970 | 0.944880..1.027464 | 0.170872 |

Final strongest Z columns:
`Z:19:r7=0.588, Z:23:r12=0.573, Z:19:r14=0.568, Z:17:r5=0.553, Z:17:r16=0.541, Z:23:r18=0.540, Z:17:r4=0.540, Z:23:r6=0.536`

## Function-field quotient budgets

| universe | degrees | budget | moduli | real edge | rough-random edge range | rough-composite edge range |
| --- | --- | ---: | --- | ---: | ---: | ---: |
| F_2[t] | 20,21,22 | 2 | t, t + 1 | 0.000000 | 0.000000..0.000000 | 0.000000..0.000000 |
| F_2[t] | 20,21,22 | 3 | t, t + 1, t^2 + t + 1 | 0.750494 | 0.658239..0.750392 | 0.697764..0.749017 |
| F_3[t] | 11,12,13 | 2 | t, t + 1 | 0.000000 | 0.570099..0.685385 | 0.523940..0.683828 |
| F_3[t] | 11,12,13 | 3 | t, t + 1, t + 2 | 0.000000 | 0.626013..0.766986 | 0.447013..0.789539 |
| F_3[t] | 11,12,13 | 5 | t, t + 1, t + 2, t^2 + 1, t^2 + t + 2 | 0.819899 | 0.716369..0.923959 | 0.720150..0.903004 |
| F_5[t] | 6,7,8 | 2 | t, t + 1 | 0.888365 | 0.000000..0.771331 | 0.610475..0.829372 |
| F_5[t] | 6,7,8 | 3 | t, t + 1, t + 2 | 1.007895 | 0.644783..0.830956 | 0.653478..0.799908 |
| F_5[t] | 6,7,8 | 5 | t, t + 1, t + 2, t + 3, t + 4 | 1.153750 | 0.700875..0.950561 | 0.663136..0.856841 |
| F_5[t] | 6,7,8 | 8 | t, t + 1, t + 2, t + 3, t + 4, t^2 + 2, t^2 + 3, t^2 + t + 1 | 0.883718 | 0.818270..0.873317 | 0.793460..0.964438 |

JSON: `logs/two-universes-protocol/cycle-007-quotient-spectral-residual-4000000.json`
SVG: `logs/two-universes-protocol/cycle-007-quotient-spectral-residual-4000000.svg`
