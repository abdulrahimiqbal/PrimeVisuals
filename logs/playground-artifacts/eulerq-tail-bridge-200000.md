# Near-Wieferich Euler quotient tail bridge audit

Candidate: tail hit when min(EQ_2(n), n-EQ_2(n)) <= sqrt(n), residual against 2/sqrt(n).

Range: 200000. Seeds: 12345, 271828, 314159, 161803, 424242.

## Endpoint trace

| N | count | hits | expected | real z | real max/sqrtVar | random quotient max | Cramer max | W210 max | composite max |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 12500 | 1491 | 55 | 61.684562 | -0.909723 | 1.103572 | 0.913172..2.337444 | 0.767119..1.318804 | 0.889307..1.606401 | 0.701821..2.402274 |
| 25000 | 2761 | 79 | 80.548095 | -0.181724 | 0.997079 | 0.787645..2.016134 | 0.822110..1.141454 | 0.767451..1.540902 | 0.581409..1.972806 |
| 50000 | 5132 | 112 | 105.437714 | 0.665620 | 0.861561 | 0.723114..1.742113 | 0.713417..1.191757 | 0.658589..1.331817 | 0.464866..2.343709 |
| 100000 | 9591 | 151 | 138.532099 | 1.093321 | 1.432370 | 0.876805..1.506119 | 0.619052..1.088646 | 0.567733..1.386585 | 0.427615..2.049181 |
| 200000 | 17983 | 189 | 182.566592 | 0.487932 | 1.238852 | 0.758345..1.341487 | 0.713180..1.317624 | 0.490763..1.455349 | 0.541956..1.968460 |

## Block normalized residuals

| block | count | hits | expected | real | random quotient | Cramer | W210 | composite |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| (1, 12500] | 1491 | 55 | 61.684562 | -0.909723 | -0.773630..1.267767 | -0.897520..0.633913 | -1.411120..0.456516 | -0.984004..2.328213 |
| (12500, 25000] | 1270 | 24 | 18.863534 | 1.191613 | -0.896305..1.191613 | -0.940378..0.769744 | -0.540294..0.388639 | -1.368586..0.122639 |
| (25000, 50000] | 2371 | 33 | 24.889618 | 1.634356 | -0.582299..1.029814 | -1.208477..2.031304 | -0.116130..0.326554 | -0.085713..1.343205 |
| (50000, 100000] | 4459 | 39 | 33.094385 | 1.030438 | -2.808220..0.681469 | -1.067224..1.904028 | -0.685183..1.985294 | -0.277144..0.950717 |
| (100000, 200000] | 8392 | 38 | 44.034493 | -0.911797 | -1.062894..0.599178 | -0.891530..0.610016 | -1.869465..-0.202356 | -0.328830..0.472978 |

## Base holdouts

| base | hits | expected | z | max/sqrtVar | theta |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 3 | 172 | 181.566592 | -0.725564 | 1.408462 | 0.364021 |
| 5 | 178 | 181.672165 | -0.278585 | 0.866263 | 0.254974 |

## Summary

Real max residual theta: `0.296402`.
Endpoint random-quotient max/sqrtVar range: `0.758345..1.341487`.
Endpoint Cramer max/sqrtVar range: `0.713180..1.317624`.
Endpoint W210 max/sqrtVar range: `0.490763..1.455349`.
Endpoint composite max/sqrtVar range: `0.541956..1.968460`.

Named composite check:

| n | EQ_2(n) | folded | folded/sqrt(n) | hit |
| ---: | ---: | ---: | ---: | ---: |
| 25 | 18 | 7.000000 | 1.400000 | 0 |
| 35 | 24 | 11.000000 | 1.859339 | 0 |
| 77 | 75 | 2.000000 | 0.227921 | 1 |

## Factor check

The main term is the uniform-quotient tail probability 2/sqrt(n). If real primes do not separate from uniform quotient, W210, and composite Euler-quotient controls after this integrated subtraction, the object is a tail of modular quotient equidistribution rather than a critical line.

## Files

- JSON: `logs/playground-artifacts/eulerq-tail-bridge-200000.json`
- SVG: `logs/playground-artifacts/eulerq-tail-bridge-200000.svg`