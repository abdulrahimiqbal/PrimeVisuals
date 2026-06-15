# Near-Wieferich Euler quotient tail bridge audit

Candidate: tail hit when min(EQ_2(n), n-EQ_2(n)) <= sqrt(n), residual against 2/sqrt(n).

Range: 2000000. Seeds: 12345, 271828, 314159, 161803, 424242.

## Endpoint trace

| N | count | hits | expected | real z | real max/sqrtVar | random quotient max | Cramer max | W210 max | composite max |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 125000 | 11733 | 158 | 151.323747 | 0.558766 | 1.367094 | 0.836847..1.480354 | 0.591910..1.455023 | 0.541838..1.605418 | 0.661891..1.603861 |
| 250000 | 22043 | 201 | 199.712357 | 0.093190 | 1.182161 | 0.723643..1.280100 | 0.681785..1.256581 | 0.468261..1.785717 | 0.540864..1.306599 |
| 500000 | 41537 | 271 | 264.397749 | 0.413135 | 1.022119 | 0.625675..1.838777 | 0.597717..1.475898 | 0.404208..1.585393 | 0.844460..1.620530 |
| 1000000 | 78497 | 346 | 351.134488 | -0.277674 | 0.883364 | 0.556661..1.589159 | 0.905472..1.313407 | 0.367729..1.693127 | 0.881440..1.841099 |
| 2000000 | 148932 | 466 | 468.003614 | -0.093562 | 0.762760 | 0.525060..1.457870 | 0.806962..1.728474 | 0.473269..1.583984 | 0.727234..1.650175 |

## Block normalized residuals

| block | count | hits | expected | real | random quotient | Cramer | W210 | composite |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| (1, 125000] | 11733 | 158 | 151.323747 | 0.558766 | -0.529264..1.479407 | -0.305858..1.071978 | -1.172049..1.126577 | -0.073920..1.346734 |
| (125000, 250000] | 10310 | 43 | 48.388610 | -0.776492 | -1.496986..-0.200097 | -0.461044..1.409662 | -1.861370..0.378879 | -1.009549..0.414951 |
| (250000, 500000] | 19494 | 70 | 64.685392 | 0.661907 | -0.708086..0.412818 | -1.085740..1.410856 | 0.678310..2.267833 | -0.381940..1.416783 |
| (500000, 1000000] | 36960 | 75 | 86.736739 | -1.261715 | -0.724208..1.318317 | -1.390757..0.873946 | -0.884447..-0.249884 | -0.904799..0.952594 |
| (1000000, 2000000] | 70435 | 120 | 116.869127 | 0.289854 | -1.191416..1.123069 | -0.898859..1.799606 | -0.524147..1.493529 | -0.652885..1.273839 |

## Base holdouts

| base | hits | expected | z | max/sqrtVar | theta |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 3 | 437 | 467.003614 | -1.401072 | 1.758605 | 0.273645 |
| 5 | 438 | 467.109187 | -1.359445 | 1.472925 | 0.383980 |

## Summary

Real max residual theta: `0.000000`.
Endpoint random-quotient max/sqrtVar range: `0.525060..1.457870`.
Endpoint Cramer max/sqrtVar range: `0.806962..1.728474`.
Endpoint W210 max/sqrtVar range: `0.473269..1.583984`.
Endpoint composite max/sqrtVar range: `0.727234..1.650175`.

Named composite check:

| n | EQ_2(n) | folded | folded/sqrt(n) | hit |
| ---: | ---: | ---: | ---: | ---: |
| 25 | 18 | 7.000000 | 1.400000 | 0 |
| 35 | 24 | 11.000000 | 1.859339 | 0 |
| 77 | 75 | 2.000000 | 0.227921 | 1 |

## Factor check

The main term is the uniform-quotient tail probability 2/sqrt(n). If real primes do not separate from uniform quotient, W210, and composite Euler-quotient controls after this integrated subtraction, the object is a tail of modular quotient equidistribution rather than a critical line.

## Files

- JSON: `logs/playground-artifacts/eulerq-tail-bridge-2000000.json`
- SVG: `logs/playground-artifacts/eulerq-tail-bridge-2000000.svg`