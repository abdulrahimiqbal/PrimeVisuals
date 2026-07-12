# Mobius/Liouville matched-correlation audit

Candidate:
compare square-root-normalized fixed-lag two-point correlations for Mobius and Liouville signs across Z and F_q[t].

```text
C_f(X,h) = sum_{a <= X} f(a) f(a+h) / sqrt(X)
energy_f(X) = sqrt(mean_h C_f(X,h)^2), h=1..8
```

Integer endpoints: 1000000. Control seeds: 3.

## Promotion-relevant summary

| object | final energy | final max cell | energy slope | profile stability | control energy ranges | beats controls |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| Z-mobius | 0.351218 | 0.527002 | NA | NA | randomSquarefree:0.313357..0.541583; shuffled:0.358980..0.556764 | false |
| Z-liouville | 0.505124 | 1.104004 | NA | NA | randomMultiplicative:0.818917..1.754960; shuffled:0.676651..0.940893 | false |
| F_2-mobius | 1.205861 | 1.625000 | 0.196950 | 0.041303 | randomDegreePreserving:0.680921..0.868717 | true |
| F_2-liouville | 2.901500 | 5.156250 | 0.116278 | -0.433876 | randomDegreePreserving:1.221551..1.638093 | true |
| F_3-mobius | 0.194028 | 0.235217 | -0.061750 | -0.700973 | randomDegreePreserving:0.488708..0.942513 | false |
| F_3-liouville | 2.064388 | 2.216740 | 0.183186 | -0.671050 | randomDegreePreserving:0.543257..1.244711 | true |
| F_5-mobius | 5.570965 | 10.720000 | 0.635169 | -0.183449 | randomDegreePreserving:0.379979..0.876356 | true |
| F_5-liouville | 4.664096 | 8.920000 | 0.342095 | -0.633529 | randomDegreePreserving:0.627426..1.256560 | true |

## Integer Mobius

| N | labels | energy | maxAbs cell | positive frac | normalized cells h=1..8 |
| ---: | ---: | ---: | ---: | ---: | --- |
| 1000000 | 999992 | 0.351218 | 0.527002 | 0.500000 | 0.411, -0.385, -0.303, -0.527, 0.161, 0.036, -0.507, 0.126 |

## Integer Liouville

| N | labels | energy | maxAbs cell | positive frac | normalized cells h=1..8 |
| ---: | ---: | ---: | ---: | ---: | --- |
| 1000000 | 999992 | 0.505124 | 1.104004 | 0.500000 | -1.104, 0.068, -0.426, -0.704, 0.130, 0.178, 0.282, -0.112 |

## F_2[t] Mobius

| degree | monics | energy | maxAbs cell | positive frac | normalized cells h=1..8 |
| ---: | ---: | ---: | ---: | ---: | --- |
| 14 | 16384 | 0.917744 | 1.984375 | 0.250000 | 1.094, -0.031, -0.031, -0.469, -0.469, 1.078, -1.984, -0.016 |
| 15 | 32768 | 0.841731 | 1.436311 | 0.375000 | -0.088, 0.950, 0.950, -0.044, -0.044, -0.906, -1.436, 0.983 |
| 16 | 65536 | 1.205861 | 1.625000 | 0.875000 | 1.469, 1.281, 1.281, 1.063, 1.063, 0.906, 1.625, -0.688 |

## F_2[t] Liouville

| degree | monics | energy | maxAbs cell | positive frac | normalized cells h=1..8 |
| ---: | ---: | ---: | ---: | ---: | --- |
| 14 | 16384 | 2.469541 | 4.187500 | 0.500000 | 4.188, -1.750, -1.750, 2.500, 2.500, 2.250, -2.563, -1.000 |
| 15 | 32768 | 2.354714 | 3.447146 | 0.375000 | 0.000, 3.447, 3.447, -1.282, -1.282, -2.386, -2.828, 1.900 |
| 16 | 65536 | 2.901500 | 5.156250 | 0.875000 | 5.156, 0.031, 0.031, 2.906, 2.906, 4.188, 2.281, -1.063 |

## F_3[t] Mobius

| degree | monics | energy | maxAbs cell | positive frac | normalized cells h=1..8 |
| ---: | ---: | ---: | ---: | ---: | --- |
| 7 | 2187 | 0.222222 | 0.384900 | 0.750000 | -0.385, -0.385, 0.128, 0.128, 0.128, 0.128, 0.128, 0.128 |
| 8 | 6561 | 0.319321 | 0.629630 | 0.250000 | 0.630, 0.630, -0.062, -0.062, -0.062, -0.062, -0.062, -0.062 |
| 9 | 19683 | 0.194028 | 0.235217 | 0.000000 | -0.235, -0.235, -0.178, -0.178, -0.178, -0.178, -0.178, -0.178 |

## F_3[t] Liouville

| degree | monics | energy | maxAbs cell | positive frac | normalized cells h=1..8 |
| ---: | ---: | ---: | ---: | ---: | --- |
| 7 | 2187 | 1.380344 | 1.475451 | 0.750000 | -1.475, -1.475, 1.347, 1.347, 1.347, 1.347, 1.347, 1.347 |
| 8 | 6561 | 0.441865 | 0.851852 | 0.250000 | 0.852, 0.852, -0.136, -0.136, -0.136, -0.136, -0.136, -0.136 |
| 9 | 19683 | 2.064388 | 2.216740 | 0.750000 | -1.518, -1.518, 2.217, 2.217, 2.217, 2.217, 2.217, 2.217 |

## F_5[t] Mobius

| degree | monics | energy | maxAbs cell | positive frac | normalized cells h=1..8 |
| ---: | ---: | ---: | ---: | ---: | --- |
| 4 | 625 | 0.721110 | 1.000000 | 0.500000 | -1.000, -1.000, -1.000, -1.000, 0.200, 0.200, 0.200, 0.200 |
| 5 | 3125 | 0.764199 | 0.983870 | 1.000000 | 0.447, 0.447, 0.447, 0.447, 0.984, 0.984, 0.984, 0.984 |
| 6 | 15625 | 5.570965 | 10.720000 | 0.500000 | -10.720, -1.920, -1.920, -10.720, 1.664, 1.664, 1.664, 1.664 |

## F_5[t] Liouville

| degree | monics | energy | maxAbs cell | positive frac | normalized cells h=1..8 |
| ---: | ---: | ---: | ---: | ---: | --- |
| 4 | 625 | 1.550742 | 3.000000 | 0.500000 | -3.000, -0.600, -0.600, -3.000, 0.360, 0.360, 0.360, 0.360 |
| 5 | 3125 | 1.373696 | 1.556303 | 0.500000 | 1.163, 1.163, 1.163, 1.163, -1.556, -1.556, -1.556, -1.556 |
| 6 | 15625 | 4.664096 | 8.920000 | 0.500000 | -8.920, -0.120, -0.120, -8.920, 1.928, 1.928, 1.928, 1.928 |

JSON: `logs/two-universes-protocol/cycle-008-mobius-liouville-correlation-1000000.json`
SVG: `logs/two-universes-protocol/cycle-008-mobius-liouville-correlation-1000000.svg`
