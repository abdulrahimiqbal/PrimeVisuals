# Shifted Mobius twin-neighborhood parity bridge audit

Candidate: X(label)=mu(label-1)*mu(label+1), bridge sum X normalized by sqrt(nonzero count).

Range: 500000. Seeds: 12345, 271828, 314159, 161803, 424242.

## Endpoint trace

| N | labels | nonzero | sum | real normalized | real max/sqrt | shuffle max | Cramer max | W210 max | composite max |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 31250 | 3367 | 0 | 0 | 0.000000 | 0.000000 | 0.000000..0.000000 | 0.000000..0.000000 | 0.000000..0.000000 | 0.000000..0.000000 |
| 62500 | 6274 | 0 | 0 | 0.000000 | 0.000000 | 0.000000..0.000000 | 0.000000..0.000000 | 0.000000..0.000000 | 0.000000..0.000000 |
| 125000 | 11733 | 0 | 0 | 0.000000 | 0.000000 | 0.000000..0.000000 | 0.000000..0.000000 | 0.000000..0.000000 | 0.000000..0.000000 |
| 250000 | 22043 | 0 | 0 | 0.000000 | 0.000000 | 0.000000..0.000000 | 0.000000..0.000000 | 0.000000..0.000000 | 0.000000..0.000000 |
| 500000 | 41537 | 0 | 0 | 0.000000 | 0.000000 | 0.000000..0.000000 | 0.000000..0.000000 | 0.000000..0.000000 | 0.000000..0.000000 |

## Block normalized sums

| block | labels | nonzero | sum | real | shuffle | Cramer | W210 | composite |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| (1, 31250] | 3367 | 0 | 0 | 0.000000 | 0.000000..0.000000 | 0.000000..0.000000 | 0.000000..0.000000 | 0.000000..0.000000 |
| (31250, 62500] | 2907 | 0 | 0 | 0.000000 | 0.000000..0.000000 | 0.000000..0.000000 | 0.000000..0.000000 | 0.000000..0.000000 |
| (62500, 125000] | 5459 | 0 | 0 | 0.000000 | 0.000000..0.000000 | 0.000000..0.000000 | 0.000000..0.000000 | 0.000000..0.000000 |
| (125000, 250000] | 10310 | 0 | 0 | 0.000000 | 0.000000..0.000000 | 0.000000..0.000000 | 0.000000..0.000000 | 0.000000..0.000000 |
| (250000, 500000] | 19494 | 0 | 0 | 0.000000 | 0.000000..0.000000 | 0.000000..0.000000 | 0.000000..0.000000 | 0.000000..0.000000 |

## Function-field shell check

| q | degree | irreducibles | prime nonzero | prime sum | prime normalized | monic sum | monic normalized |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 3 | 1 | 3 | 3 | 3 | 1.732051 | 3 | 1.732051 |
| 3 | 2 | 3 | 0 | 0 | 0.000000 | -3 | -1.732051 |
| 3 | 3 | 8 | 2 | 2 | 1.414214 | 0 | 0.000000 |
| 3 | 4 | 18 | 6 | -6 | -2.449490 | -9 | -1.566699 |
| 3 | 5 | 48 | 18 | -6 | -1.414214 | 36 | 3.464102 |
| 3 | 6 | 116 | 30 | 18 | 3.286335 | 18 | 1.028992 |
| 3 | 7 | 312 | 96 | -12 | -1.224745 | -18 | -0.590243 |
| 3 | 8 | 810 | 198 | 18 | 1.279204 | 51 | 0.967096 |
| 3 | 9 | 2184 | 528 | 24 | 1.044466 | -33 | -0.361808 |
| 3 | 10 | 5880 | 1608 | -156 | -3.890286 | -372 | -2.352358 |
| 3 | 11 | 16104 | 4194 | -114 | -1.760316 | 645 | 2.353560 |
| 3 | 12 | 44220 | 11800 | 152 | 1.399273 | 372 | 0.783890 |
| 5 | 1 | 5 | 5 | 5 | 2.236068 | 5 | 2.236068 |
| 5 | 2 | 10 | 10 | -10 | -3.162278 | -5 | -1.290994 |
| 5 | 3 | 40 | 20 | -20 | -4.472136 | 0 | 0.000000 |
| 5 | 4 | 150 | 90 | -10 | -1.054093 | -25 | -1.257887 |
| 5 | 5 | 624 | 374 | -6 | -0.310253 | 25 | 0.561125 |
| 5 | 6 | 2580 | 1510 | -70 | -1.801398 | -240 | -2.412091 |
| 5 | 7 | 11160 | 6350 | 190 | 2.384332 | 365 | 1.638816 |
| 5 | 8 | 48750 | 27710 | -70 | -0.420513 | 1135 | 2.279893 |

## Summary

Real max residual theta: `NA`.
Endpoint sign-shuffle max/sqrt range: `0.000000..0.000000`.
Endpoint Cramer max/sqrt range: `0.000000..0.000000`.
Endpoint W210 max/sqrt range: `0.000000..0.000000`.
Endpoint composite max/sqrt range: `0.000000..0.000000`.

## Factor check

For every odd integer n, the neighbors n-1 and n+1 are consecutive even integers. Exactly one is divisible by 4, so its Mobius value is 0. Therefore X(n)=mu(n-1)mu(n+1) is identically 0 for every odd prime, and for every odd-label control. This is a perfect flat line, but it is a trivial local squarefactor obstruction, not prime regularity.

The odd-characteristic function-field shells do not share this integer mod-4 obstruction: f-1 and f+1 are not forced to contain a repeated linear factor. Their nonzero rows are therefore a local-universe mismatch, not a rescue of the integer bridge.

## Files

- JSON: `logs/playground-artifacts/shifted-mobius-neighborhood-500000.json`
- SVG: `logs/playground-artifacts/shifted-mobius-neighborhood-500000.svg`