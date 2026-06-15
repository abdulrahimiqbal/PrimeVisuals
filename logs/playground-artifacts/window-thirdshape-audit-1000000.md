# count+pair-conditioned triple-shape residual audit

Candidate:
condition on count and pair-distance bin inside each short window, then measure
the third-order variance of triple distance shapes.

Integer windows: length `210`, reduced offsets `48`,
pair-distance bins `24`.

## Integer fresh blocks

| block | windows | mean z | aggregate Z | rms z | composite aggregate Z | composite rms z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 100000..200000 | 475 | -0.100801 | -2.196899 | 0.966712 | -0.689976 | 0.956060 |
| 125000..250000 | 594 | -0.115150 | -2.806438 | 0.983734 | -1.997594 | 0.977580 |
| 250000..500000 | 1189 | -0.099993 | -3.447959 | 0.979603 | -0.827561 | 0.979272 |
| 500000..1000000 | 2380 | -0.085897 | -4.190521 | 0.996204 | -1.068322 | 0.982432 |

Endpoint count+pair matched controls:

- aggregate Z range: `-1.861814 .. 1.294536`
- mean z range: `-0.038163 .. 0.026535`
- rms z range: `0.972225 .. 1.017257`

## F_2[t] degree path

| degree | windows | mean z | aggregate Z | rms z | composite aggregate Z | composite rms z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 15 | 350 | -0.059030 | -1.104346 | 0.247360 | 0.372255 | 0.515606 |
| 16 | 607 | -0.051025 | -1.257120 | 0.218177 | 0.209612 | 0.538680 |
| 17 | 1088 | -0.054525 | -1.798492 | 0.230938 | -0.097184 | 0.436195 |
| 18 | 1883 | -0.048188 | -2.091036 | 0.204251 | 0.349079 | 0.481888 |

Endpoint count+pair matched controls:
`-0.497572 .. 0.321796`.

## F_3[t] degree path

| degree | windows | mean z | aggregate Z | rms z | composite aggregate Z | composite rms z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 8 | 180 | -0.070263 | -0.942681 | 0.570194 | 0.737508 | 0.554902 |
| 9 | 500 | -0.045081 | -1.008052 | 0.383202 | -0.226301 | 0.340288 |
| 10 | 1230 | -0.060800 | -2.132331 | 0.380616 | -0.507373 | 0.349515 |
| 11 | 3030 | -0.047799 | -2.631136 | 0.296877 | -0.399039 | 0.307347 |

Endpoint count+pair matched controls:
`-0.538025 .. 0.579382`.

## Dominant count/pair classes

Z endpoint:
`k10/b5:n2:mean2.335:Z3.303, k18/b9:n27:mean-0.587:Z-3.050, k23/b8:n8:mean-0.876:Z-2.477, k12/b10:n4:mean-1.197:Z-2.394, k7/b10:n2:mean-1.581:Z-2.236, k17/b9:n46:mean-0.300:Z-2.038, k10/b4:n1:mean-1.998:Z-1.998, k17/b8:n170:mean-0.149:Z-1.949, k15/b8:n145:mean-0.157:Z-1.889, k21/b7:n15:mean-0.472:Z-1.827, k14/b10:n2:mean1.289:Z1.823, k14/b5:n1:mean-1.696:Z-1.696`

F_2[t] endpoint:
`k4/b17:n155:mean-0.467:Z-5.810, k5/b18:n47:mean-0.389:Z-2.665, k6/b18:n1:mean-1.128:Z-1.128, k4/b18:n21:mean0.048:Z0.219, k3/b20:n856:mean-0.000:Z-0.000, k3/b18:n421:mean-0.000:Z-0.000, k4/b19:n108:mean0.000:Z0.000, k3/b10:n148:mean0.000:Z0.000, k4/b20:n126:mean0.000:Z0.000`

F_3[t] endpoint:
`k5/b19:n102:mean-0.591:Z-5.966, k4/b16:n144:mean-0.446:Z-5.352, k7/b19:n6:mean-1.680:Z-4.116, k5/b17:n30:mean-0.660:Z-3.614, k6/b20:n18:mean0.426:Z1.809, k6/b19:n6:mean0.166:Z0.408, k6/b17:n6:mean-0.043:Z-0.105, k5/b20:n132:mean0.008:Z0.097, k3/b18:n906:mean-0.000:Z-0.000, k3/b16:n144:mean-0.000:Z-0.000, k4/b21:n420:mean-0.000:Z-0.000, k4/b17:n72:mean0.000:Z0.000`

## Strongest windows

Z:
`566370:k19:b8:z5.704, 959280:k17:b7:z5.068, 595770:k15:b7:z4.105, 574140:k15:b7:z3.999, 932190:k14:b7:z3.926, 517650:k10:b5:z3.798, 791700:k14:b6:z3.429, 639660:k17:b8:z3.330`

F_2[t]:
`18:4256:k6:b18:z-1.128, 18:331:k5:b18:z-1.051, 18:714:k5:b18:z-1.051, 18:795:k5:b18:z-1.051, 18:926:k5:b18:z-1.051, 18:988:k5:b18:z-1.051, 18:1091:k5:b18:z-1.051, 18:1678:k5:b18:z-1.051`

F_3[t]:
`11:1851:k7:b19:z-1.680, 11:2064:k7:b19:z-1.680, 11:2735:k7:b19:z-1.680, 11:4649:k7:b19:z-1.680, 11:2671:k7:b19:z-1.680, 11:5071:k7:b19:z-1.680, 11:1134:k5:b17:z-1.566, 11:1377:k5:b17:z-1.566`

SVG: `logs/playground-artifacts/window-thirdshape-audit-1000000.svg`
JSON: `logs/playground-artifacts/window-thirdshape-audit-1000000.json`
