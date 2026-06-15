# whitened residue-current spectral edge audit

Candidate:
concatenate square-root-normalized residue-class excesses over a growing
modulus budget, split into fresh blocks/degrees, and track
`lambda_max / MP_edge` for the covariance of the whitened current matrix.

Integer moduli: `3, 5, 7, 11, 13, 17, 19, 23`; budget sizes
`2, 4, 6, 8`; fresh blocks per scale `24`.

## Final-scale budget path

| budget | Z moduli | Z edge | Z energy | Z random edge range | F2 edge | F2 random edge range | F3 edge | F3 random edge range |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 2 | 3,5 | 1.190894 | 0.443353 | 0.950296 .. 1.142028 | 0.661896 | 0.631960 .. 1.018665 | 1.297317 | 0.812993 .. 1.193532 |
| 4 | 3,5,7,11 | 1.064677 | 0.533476 | 0.837605 .. 1.072768 | 0.895317 | 0.770202 .. 0.885314 | 0.908731 | 0.777682 .. 0.962456 |
| 6 | 3,5,7,11,13,17 | 0.953242 | 0.544602 | 0.909990 .. 1.069344 | 0.944059 | 0.813943 .. 0.954610 | 1.225454 | 0.821793 .. 0.893322 |
| 8 | 3,5,7,11,13,17,19,23 | 0.995921 | 0.565688 | 0.916026 .. 1.024156 | 1.022284 | 0.914134 .. 1.006467 | 1.083299 | 0.874319 .. 0.957899 |

## Integer range stability at budget 8

| scale | Z edge | Z energy | Z max-column share | composite edge | composite energy |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 200000 | 0.987866 | 0.607494 | 0.021391 | 0.971875 | 0.191368 |
| 250000 | 1.083015 | 0.601834 | 0.021424 | 1.069655 | 0.187785 |
| 500000 | 0.998495 | 0.588645 | 0.020548 | 0.999320 | 0.178289 |
| 1000000 | 0.995921 | 0.565688 | 0.021094 | 0.973716 | 0.166540 |

## Final budget-8 strongest columns

Z primes:
`Z:23:5=0.774, Z:19:10=0.773, Z:23:6=0.737, Z:23:12=0.723, Z:19:9=0.707, Z:7:1=0.694, Z:11:5=0.690, Z:17:9=0.684`

Z composites:
`Z:23:5=0.224, Z:19:10=0.224, Z:23:6=0.213, Z:7:1=0.213, Z:23:12=0.209, Z:11:5=0.206, Z:19:9=0.206, Z:11:8=0.202`

F_2[t]:
`F_2[t]:t^5 + t^2 + 1:1=0.781, F_2[t]:t^5 + t^3 + 1:30=0.705, F_2[t]:t^5 + t^2 + 1:18=0.654, F_2[t]:t^5 + t^3 + 1:18=0.638, F_2[t]:t^5 + t^2 + 1:19=0.622, F_2[t]:t^5 + t^3 + 1:6=0.619, F_2[t]:t^5 + t^3 + 1:15=0.602, F_2[t]:t^5 + t^3 + 1:14=0.602`

F_3[t]:
`F_3[t]:t^3 + 2*t + 1:2=1.036, F_3[t]:t^3 + 2*t + 2:2=1.018, F_3[t]:t^3 + 2*t + 2:1=0.711, F_3[t]:t^3 + 2*t + 1:1=0.684, F_3[t]:t^3 + 2*t + 2:6=0.581, F_3[t]:t^3 + 2*t + 2:7=0.581, F_3[t]:t^3 + 2*t + 2:8=0.581, F_3[t]:t^3 + 2*t + 1:6=0.530`

## Control summaries at final scale

| budget | random energy range | random edge range | random max-column-share range |
| ---: | ---: | ---: | ---: |
| 2 | 0.765408 .. 0.913967 | 0.950296 .. 1.142028 | 0.220557 .. 0.262910 |
| 4 | 0.905820 .. 0.943082 | 0.837605 .. 1.072768 | 0.070371 .. 0.082100 |
| 6 | 0.926133 .. 0.986198 | 0.909990 .. 1.069344 | 0.030561 .. 0.046655 |
| 8 | 0.939704 .. 0.995668 | 0.916026 .. 1.024156 | 0.020162 .. 0.024416 |

SVG: `logs/playground-artifacts/residue-current-spectrum-audit-1000000.svg`
JSON: `logs/playground-artifacts/residue-current-spectrum-audit-1000000.json`
