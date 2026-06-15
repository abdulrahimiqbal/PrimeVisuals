# CA/XA recovery grammar compression audit

Candidate:
encode every real no-base recovery episode as a word over `N+`, `N-`, and `Oe`, then track `G(Y)`, the number of distinct closed recovery words up to frontier cutoff `Y`. Fixed-shape fake controls only expose coarse recovery summaries, so their words are coarser upper-level diagnostics.

Source: `logs/divisor-extremes-artifacts/ca-xa-transitions.json`.
Frontier range: 113..2719.

## Real detailed words

| from | recovered by | primes | compact word | word length | debt micro | final cumulative micro | matched steps |
| ---: | ---: | --- | --- | ---: | ---: | ---: | ---: |
| 139 | 151 | 149,151 | `N+ N-` | 2 | 11.776 | 131.233387 | 2/2 |
| 523 | 541 | 541,31 | `N+ O1` | 2 | 1.505 | 7.985356 | 2/2 |
| 1399 | 1439 | 1409,1423,1427,1429,1433,1439 | `N+^3 N-^3` | 6 | 6.501 | 0.002263 | 6/6 |
| 2633 | 2677 | 2647,2657,2659,2663,2671,2677 | `N+^3 N-^3` | 6 | 1.697 | 0.256664 | 6/6 |

## Real step grammar

| run frontier | token | p | old exp | margin micro | cumulative micro | overshoot |
| ---: | --- | ---: | ---: | ---: | ---: | ---: |
| 139 | `N+` | 149 | 0 | -11.776209 | -11.776209 | 0.211373 |
| 139 | `N-` | 151 | 0 | 143.009596 | 131.233387 | -2.808877 |
| 523 | `N+` | 541 | 0 | -1.505012 | -1.505012 | 0.376777 |
| 523 | `O1` | 31 | 1 | 9.490368 | 7.985356 | NA |
| 1399 | `N+` | 1409 | 0 | -0.250995 | -0.250995 | 0.436026 |
| 1399 | `N+` | 1423 | 0 | -4.054949 | -4.305943 | 7.182855 |
| 1399 | `N+` | 1427 | 0 | -2.195452 | -6.501396 | 3.919807 |
| 1399 | `N-` | 1429 | 0 | 0.747188 | -5.754207 | -1.346037 |
| 1399 | `N-` | 1433 | 0 | 2.543114 | -3.211093 | -4.613268 |
| 1399 | `N-` | 1439 | 0 | 3.213356 | 0.002263 | -5.883284 |
| 2633 | `N+` | 2647 | 0 | -0.656745 | -0.656745 | 4.077510 |
| 2633 | `N+` | 2657 | 0 | -0.990950 | -1.647695 | 6.194855 |
| 2633 | `N+` | 2659 | 0 | -0.049359 | -1.697055 | 0.308434 |
| 2633 | `N-` | 2663 | 0 | 0.567283 | -1.129771 | -3.578735 |
| 2633 | `N-` | 2671 | 0 | 0.546346 | -0.583426 | -3.467404 |
| 2633 | `N-` | 2677 | 0 | 0.840090 | 0.256664 | -5.359068 |

## Endpoint trace

| Y | real distinct closed words | real open | fake distinct range | fake open range |
| ---: | ---: | ---: | ---: | ---: |
| 113 | 0 | 0 | 0..0 | 0..0 |
| 133 | 0 | 0 | 0..0 | 0..1 |
| 139 | 0 | 1 | 0..0 | 0..2 |
| 151 | 1 | 0 | 0..0 | 0..3 |
| 191 | 1 | 0 | 0..1 | 0..2 |
| 205 | 1 | 0 | 0..2 | 0..2 |
| 227 | 1 | 0 | 0..2 | 0..3 |
| 253 | 1 | 0 | 0..2 | 0..4 |
| 265 | 1 | 0 | 0..2 | 0..5 |
| 301 | 1 | 0 | 0..2 | 0..6 |
| 319 | 1 | 0 | 0..2 | 0..6 |
| 415 | 1 | 0 | 0..2 | 0..6 |
| 469 | 1 | 0 | 0..2 | 0..6 |
| 515 | 1 | 0 | 0..2 | 0..7 |
| 523 | 1 | 1 | 0..2 | 0..7 |
| 541 | 2 | 0 | 0..2 | 0..7 |
| 553 | 2 | 0 | 0..2 | 0..7 |
| 565 | 2 | 0 | 0..2 | 0..7 |
| 635 | 2 | 0 | 0..2 | 0..8 |
| 637 | 2 | 0 | 0..2 | 0..8 |
| 679 | 2 | 0 | 0..2 | 0..8 |
| 725 | 2 | 0 | 0..2 | 0..8 |
| 767 | 2 | 0 | 0..3 | 0..8 |
| 785 | 2 | 0 | 0..3 | 0..8 |
| 809 | 2 | 0 | 0..3 | 0..8 |
| 821 | 2 | 0 | 0..3 | 0..7 |
| 829 | 2 | 0 | 0..3 | 0..7 |
| 839 | 2 | 0 | 0..3 | 0..8 |
| 841 | 2 | 0 | 0..3 | 0..8 |
| 845 | 2 | 0 | 0..4 | 0..8 |
| 889 | 2 | 0 | 0..4 | 0..9 |
| 911 | 2 | 0 | 0..4 | 0..10 |
| 919 | 2 | 0 | 0..4 | 0..10 |
| 941 | 2 | 0 | 0..4 | 0..10 |
| 1000 | 2 | 0 | 0..4 | 0..10 |
| 1037 | 2 | 0 | 0..4 | 0..10 |
| 1183 | 2 | 0 | 0..4 | 0..10 |
| 1321 | 2 | 0 | 0..4 | 0..10 |
| 1399 | 2 | 1 | 0..4 | 0..10 |
| 1439 | 3 | 0 | 0..4 | 0..10 |
| 1469 | 3 | 0 | 0..4 | 0..11 |
| 1577 | 3 | 0 | 0..4 | 0..11 |
| 1661 | 3 | 0 | 0..4 | 0..11 |
| 1663 | 3 | 0 | 0..4 | 0..12 |
| 1703 | 3 | 0 | 0..4 | 0..12 |
| 1717 | 3 | 0 | 0..6 | 0..12 |
| 1721 | 3 | 0 | 0..6 | 0..12 |
| 1745 | 3 | 0 | 0..7 | 0..12 |
| 1789 | 3 | 0 | 0..8 | 0..12 |
| 1859 | 3 | 0 | 0..8 | 0..12 |
| 1949 | 3 | 0 | 0..8 | 0..12 |
| 1951 | 3 | 0 | 0..8 | 0..13 |
| 2000 | 3 | 0 | 0..8 | 0..13 |
| 2009 | 3 | 0 | 0..8 | 0..13 |
| 2047 | 3 | 0 | 0..9 | 0..13 |
| 2075 | 3 | 0 | 0..10 | 0..13 |
| 2089 | 3 | 0 | 0..11 | 0..13 |
| 2197 | 3 | 0 | 0..12 | 0..13 |
| 2633 | 3 | 1 | 0..12 | 0..13 |
| 2677 | 3 | 0 | 0..12 | 0..13 |
| 2719 | 3 | 0 | 0..12 | 0..13 |

## Fixed-shape coarse controls

| seed | runs | recovered | unrecovered | distinct coarse words | recovered word types | open word types | max word length | deepest debt micro | example words |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 12345 | 16 | 3 | 13 | 13 | 3 | 10 | 57 | 5525.560 | `N+^4 N-^5 O?^1`, `OPEN N+^6`, `OPEN N+^8`, `OPEN N+^2`, `OPEN N+^1` |
| 271828 | 5 | 0 | 5 | 3 | 0 | 3 | 23 | 1067.779 | `OPEN N+^2`, `OPEN N+^10`, `OPEN N+^23` |
| 314159 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.000 | none |
| 161803 | 20 | 12 | 8 | 19 | 12 | 7 | 108 | 5506.262 | `OPEN N+^2`, `N+^2 N-^9 N?^3 O?^2`, `N+^3 N-^4`, `OPEN N+^1`, `OPEN N+^4` |
| 424242 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.000 | none |

## Factor check

The construction does not use `pi`, `psi`, zeta, zeros, or gap-width buckets. It is a local CA/XA transition grammar built from divisor-frontier prime-step margins. That is also the break: the words are just the local CA/XA factorization grammar, and the real detailed sample has only four debt episodes. The fake controls are not strictly comparable because the artifact stores coarse recovery summaries rather than detailed fake path steps.

## Files

- JSON: `logs/playground-artifacts/caxa-recovery-grammar-audit.json`
- SVG: `logs/playground-artifacts/caxa-recovery-grammar-audit.svg`
