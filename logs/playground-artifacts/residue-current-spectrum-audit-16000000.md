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
| 2 | 3,5 | 1.124508 | 0.355425 | 0.982231 .. 1.270369 | 0.701217 | 0.691859 .. 1.061123 | 1.297317 | 0.786593 .. 1.067972 |
| 4 | 3,5,7,11 | 1.020898 | 0.455007 | 0.834755 .. 0.981135 | 0.884530 | 0.774209 .. 1.060682 | 0.750000 | 0.760597 .. 1.008588 |
| 6 | 3,5,7,11,13,17 | 1.024823 | 0.498462 | 0.848829 .. 1.075334 | 1.062955 | 0.808580 .. 0.911595 | 1.002198 | 0.795113 .. 1.171313 |
| 8 | 3,5,7,11,13,17,19,23 | 1.072053 | 0.518709 | 0.863881 .. 0.983272 | 1.092706 | 0.905769 .. 1.015185 | 1.045277 | 0.838181 .. 0.914335 |

## Integer range stability at budget 8

| scale | Z edge | Z energy | Z max-column share | composite edge | composite energy |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 2000000 | 1.007219 | 0.557297 | 0.021009 | 1.001801 | 0.159667 |
| 4000000 | 1.233785 | 0.567936 | 0.022101 | 1.235014 | 0.158381 |
| 8000000 | 0.918531 | 0.534064 | 0.019667 | 0.918315 | 0.145523 |
| 16000000 | 1.072053 | 0.518709 | 0.023197 | 1.070663 | 0.137966 |

## Final budget-8 strongest columns

Z primes:
`Z:19:3=0.745, Z:13:4=0.667, Z:23:15=0.663, Z:23:13=0.646, Z:17:10=0.646, Z:19:8=0.637, Z:13:3=0.635, Z:19:13=0.631`

Z composites:
`Z:19:3=0.196, Z:13:4=0.178, Z:23:15=0.174, Z:17:10=0.171, Z:23:13=0.169, Z:13:3=0.169, Z:19:8=0.168, Z:13:2=0.168`

F_2[t]:
`F_2[t]:t^5 + t^3 + 1:12=0.587, F_2[t]:t^5 + t^2 + 1:16=0.556, F_2[t]:t^5 + t^3 + 1:24=0.555, F_2[t]:t^5 + t^2 + 1:22=0.511, F_2[t]:t^5 + t^3 + 1:27=0.485, F_2[t]:t^5 + t^2 + 1:30=0.482, F_2[t]:t^5 + t^2 + 1:5=0.481, F_2[t]:t^5 + t^3 + 1:30=0.477`

F_3[t]:
`F_3[t]:t^3 + 2*t + 2:2=0.803, F_3[t]:t^3 + 2*t + 1:2=0.800, F_3[t]:t^3 + 2*t + 1:1=0.509, F_3[t]:t^3 + 2*t + 2:1=0.504, F_3[t]:t^3 + 2*t + 2:20=0.431, F_3[t]:t^3 + 2*t + 2:22=0.431, F_3[t]:t^3 + 2*t + 2:25=0.431, F_3[t]:t^3 + 2*t + 1:6=0.369`

## Control summaries at final scale

| budget | random energy range | random edge range | random max-column-share range |
| ---: | ---: | ---: | ---: |
| 2 | 0.767586 .. 0.874645 | 0.982231 .. 1.270369 | 0.251941 .. 0.288129 |
| 4 | 0.887419 .. 0.929960 | 0.834755 .. 0.981135 | 0.069286 .. 0.079324 |
| 6 | 0.914106 .. 0.972069 | 0.848829 .. 1.075334 | 0.034667 .. 0.041850 |
| 8 | 0.942234 .. 0.974985 | 0.863881 .. 0.983272 | 0.019839 .. 0.024566 |

SVG: `logs/playground-artifacts/residue-current-spectrum-audit-16000000.svg`
JSON: `logs/playground-artifacts/residue-current-spectrum-audit-16000000.json`
