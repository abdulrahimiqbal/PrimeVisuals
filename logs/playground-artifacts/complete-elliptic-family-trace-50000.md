# Complete elliptic family trace audit

Family: `E_a: y^2=x^3+a*x+1`, complete parameters `a in F_p`, singular `4a^3+27=0` discarded.

Derived identity:

`sum_{a in F_p} a_p(E_a) = -p`.

Reason: `a_p(E_a)=-sum_x chi(x^3+a*x+1)`. For `x=0`, the inner character is always `chi(1)=1`, contributing `p`; for every `x!=0`, `a -> x^3+a*x+1` is a bijection of `F_p`, so the character sum is `0`.

## Brute-force validation

| p | singular count | formula good sum | brute good sum | good count | ok |
| ---: | ---: | ---: | ---: | ---: | --- |
| 5 | 1 | -6 | -6 | 4 | yes |
| 7 | 0 | -7 | -7 | 7 | yes |
| 11 | 1 | -10 | -10 | 10 | yes |
| 13 | 0 | -13 | -13 | 13 | yes |
| 17 | 1 | -16 | -16 | 16 | yes |
| 19 | 0 | -19 | -19 | 19 | yes |
| 23 | 1 | -24 | -24 | 22 | yes |
| 29 | 1 | -30 | -30 | 28 | yes |
| 31 | 3 | -28 | -28 | 28 | yes |
| 37 | 0 | -37 | -37 | 37 | yes |
| 41 | 1 | -40 | -40 | 40 | yes |
| 43 | 3 | -46 | -46 | 40 | yes |
| 47 | 1 | -48 | -48 | 46 | yes |
| 53 | 1 | -54 | -54 | 52 | yes |
| 59 | 1 | -58 | -58 | 58 | yes |
| 61 | 0 | -61 | -61 | 61 | yes |
| 67 | 0 | -67 | -67 | 67 | yes |
| 71 | 1 | -72 | -72 | 70 | yes |
| 73 | 0 | -73 | -73 | 73 | yes |
| 79 | 0 | -79 | -79 | 79 | yes |
| 83 | 1 | -82 | -82 | 82 | yes |
| 89 | 1 | -88 | -88 | 88 | yes |
| 97 | 0 | -97 | -97 | 97 | yes |

## Endpoint trace

| N | primes | raw Z | exact-main Z | naive-main Z | singular-correction Z | residual Z | max residual/sqrt |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 3125 | 443 | -21.080418 | -21.080418 | -21.079145 | -0.001273 | 0.000000 | 0.000000 |
| 6250 | 810 | -28.486120 | -28.486120 | -28.485297 | -0.000823 | 0.000000 | 0.000000 |
| 12500 | 1490 | -38.620364 | -38.620364 | -38.619763 | -0.000602 | 0.000000 | 0.000000 |
| 25000 | 2760 | -52.550886 | -52.550886 | -52.550515 | -0.000371 | 0.000000 | 0.000000 |
| 50000 | 5131 | -71.642604 | -71.642604 | -71.642325 | -0.000279 | 0.000000 | 0.000000 |

Singular-count histogram: `{"0":1705,"1":2575,"3":851}`.

Named composite checks:

| n | prime field? | reason |
| ---: | --- | --- |
| 25 | no | complete parameter family E_a/F_p is only defined over a prime field in this audit |
| 35 | no | complete parameter family E_a/F_p is only defined over a prime field in this audit |
| 77 | no | complete parameter family E_a/F_p is only defined over a prime field in this audit |
| 289 | no | complete parameter family E_a/F_p is only defined over a prime field in this audit |

Factor check:

This does not telescope to `theta`, `psi`, or `M`; it collapses instead to a finite-field character-sum identity. After subtracting the exact complete-family main term, the residual is identically zero by construction and by brute-force validation on small primes.

SVG: `logs/playground-artifacts/complete-elliptic-family-trace-50000.svg`
JSON: `logs/playground-artifacts/complete-elliptic-family-trace-50000.json`