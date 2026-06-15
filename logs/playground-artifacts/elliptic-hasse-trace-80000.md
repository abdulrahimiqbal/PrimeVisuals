# Elliptic Hasse-trace moment audit

Curve: `y^2=x^3-x+1`; bad primes: 2, 23.

Candidate: `U2(p)=a_p^2/p-1`; `Z2(N)=sum U2(p)/sqrt(count)`.

## Real endpoint trace

| N | good primes | sum U2 | Z2 | max |Z2| | sum U1 | Z1 |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 5000 | 667 | -12.206097 | -0.472622 | 2.000000 | -12.796823 | -0.990990 |
| 10000 | 1227 | -13.681355 | -0.390577 | 2.000000 | -9.318753 | -0.532066 |
| 20000 | 2260 | -26.256292 | -0.552305 | 2.000000 | -18.721148 | -0.787605 |
| 40000 | 4201 | 23.221266 | 0.358269 | 2.000000 | -18.131936 | -0.559497 |
| 80000 | 7835 | -31.109455 | -0.351458 | 2.000000 | -17.037310 | -0.384956 |

Endpoint controls, 15 seeds:

| control | count range | final Z2 range | final |Z2| range | max |Z2| range | theta range |
| --- | ---: | ---: | ---: | ---: | ---: |
| shuffle | 7835..7835 | -0.351458..-0.351458 | 0.351458..0.351458 | 1.578314..2.881151 | 0.099131..0.700358 |
| bootstrap | 7835..7835 | -2.284275..1.432939 | 0.045491..2.284275 | 1.502925..3.787077 | 0.120074..0.938622 |
| satoTate | 7835..7835 | -2.102391..1.793623 | 0.091833..2.102391 | 1.771226..3.265835 | 0.148507..0.849874 |
| cramerIndex | 7733..7988 | -1.959398..1.099268 | 0.004708..1.959398 | 1.725203..2.692539 | 0.040356..0.913775 |

Fresh holdout block:

| object | count/range | Z2/range | |Z2| range |
| --- | ---: | ---: | ---: |
| real | 3634 | -0.901266 | 0.901266 |
| shuffle | 3634..3634 | -2.728943..0.558556 | 0.082681..2.728943 |
| bootstrap | 3634..3634 | -2.211752..1.418110 | 0.175620..2.211752 |
| satoTate | 3634..3634 | -2.178526..1.599391 | 0.273946..2.178526 |
| cramerIndex | 3553..3705 | -2.412004..1.435395 | 0.008257..2.412004 |

Trace sanity:

- mean U1: `-0.002175`
- mean U2: `-0.003971`
- max |a_p|/(2sqrt(p)): `0.994550`

Named composite checks:

| n | prime field? | good prime? | reason |
| ---: | --- | --- | --- |
| 25 | no | no | composite modulus is not a finite field, so #E(F_n) and Hasse trace a_n are not defined |
| 35 | no | no | composite modulus is not a finite field, so #E(F_n) and Hasse trace a_n are not defined |
| 77 | no | no | composite modulus is not a finite field, so #E(F_n) and Hasse trace a_n are not defined |
| 289 | no | no | composite modulus is not a finite field, so #E(F_n) and Hasse trace a_n are not defined |

Factor check:

This does not telescope to `theta`, `psi`, or `M`; it is a bounded Frobenius-trace statistic. A break occurs if observed-trace shuffles, Sato-Tate samples, or Cramer-index resampling reproduce the excursion, because then the line is just generic trace-distribution noise rather than prime regularity.

SVG: `logs/playground-artifacts/elliptic-hasse-trace-80000.svg`
JSON: `logs/playground-artifacts/elliptic-hasse-trace-80000.json`