# Complete elliptic family second-moment audit

Family: `E_a: y^2=x^3+a*x+1`, complete parameters `a in F_p`, singular `4a^3+27=0` discarded.

Derived identity:

`sum_{a in F_p} a_p(E_a)^2 = p^2 + p*(C_p - R_p)`

where `R_p=#{x in F_p*: 2*x^3=1}` and

`C_p=sum_u chi(u*(1-4*u^3)) = -a_p(y^2=x^3-4)-chi(-1)`.

Reason: after expanding `a_p(E_a)^2`, the nonzero `x,y` pair sum is nonzero beyond the baseline only when the two linear roots in `a` agree. That condition is `x=y` or `xy(x+y)=1`. Grouping the curved branch by `u=xy` gives the fixed-curve character sum above.

Good-parameter formula subtracts the singular trace-square correction:

`M2_good(p)=p^2+p*(C_p-R_p)-sum_singular a_p(E_a)^2`.

## Brute-force validation

| p | singular count | curve sum | overlap roots | fixed trace | formula good M2 | brute good M2 | good count | ok |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 5 | 1 | -1 | 1 | 0 | 14 | 14 | 4 | yes |
| 7 | 0 | 6 | 0 | -5 | 91 | 91 | 7 | yes |
| 11 | 1 | 1 | 1 | 0 | 120 | 120 | 10 | yes |
| 13 | 0 | 6 | 0 | -7 | 247 | 247 | 13 | yes |
| 17 | 1 | -1 | 1 | 0 | 254 | 254 | 16 | yes |
| 19 | 0 | 0 | 0 | 1 | 361 | 361 | 19 | yes |
| 23 | 1 | 1 | 1 | 0 | 528 | 528 | 22 | yes |
| 29 | 1 | -1 | 1 | 0 | 782 | 782 | 28 | yes |
| 31 | 3 | -3 | 3 | 4 | 772 | 772 | 28 | yes |
| 37 | 0 | 0 | 0 | -1 | 1369 | 1369 | 37 | yes |
| 41 | 1 | -1 | 1 | 0 | 1598 | 1598 | 40 | yes |
| 43 | 3 | 9 | 3 | -8 | 2104 | 2104 | 40 | yes |
| 47 | 1 | 1 | 1 | 0 | 2208 | 2208 | 46 | yes |
| 53 | 1 | -1 | 1 | 0 | 2702 | 2702 | 52 | yes |
| 59 | 1 | 1 | 1 | 0 | 3480 | 3480 | 58 | yes |
| 61 | 0 | 12 | 0 | -13 | 4453 | 4453 | 61 | yes |
| 67 | 0 | 12 | 0 | -11 | 5293 | 5293 | 67 | yes |
| 71 | 1 | 1 | 1 | 0 | 5040 | 5040 | 70 | yes |
| 73 | 0 | -18 | 0 | 17 | 4015 | 4015 | 73 | yes |
| 79 | 0 | -12 | 0 | 13 | 5293 | 5293 | 79 | yes |
| 83 | 1 | 1 | 1 | 0 | 6888 | 6888 | 82 | yes |
| 89 | 1 | -1 | 1 | 0 | 7742 | 7742 | 88 | yes |
| 97 | 0 | -6 | 0 | 5 | 8827 | 8827 | 97 | yes |

## Endpoint trace

| N | primes | mean U2 | ST residual Z | energy r | all-a residual Z | exact residual Z | max abs Z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 3125 | 443 | 0.003845 | 0.080934 | 1.272152 | 0.026193 | 0.000000 | 0.554795 |
| 6250 | 810 | 0.001935 | 0.055085 | 1.145938 | 0.011720 | 0.000000 | 0.554795 |
| 12500 | 1490 | 0.001068 | 0.041229 | 1.139323 | 0.007334 | 0.000000 | 0.554795 |
| 25000 | 2760 | 0.000591 | 0.031059 | 1.147427 | 0.004808 | 0.000000 | 0.554795 |
| 50000 | 5131 | 0.000342 | 0.024529 | 1.216074 | 0.004353 | 0.000000 | 0.554795 |

Control summary at full range:

| control | endpoint Z range | max abs Z range | energy r range | max energy r range |
| --- | ---: | ---: | ---: | ---: |
| shuffle | 0.024529..0.024529 | 0.026850..0.111884 | 1.216074..1.216074 | 1.374101..2.373582 |
| signFlip | -0.007445..0.024620 | 0.393959..0.818224 | -0.369092..1.220605 | 1.000000..1.842641 |
| bootstrap | -0.007573..0.048920 | 0.019360..0.052610 | -0.522032..2.137063 | 1.347335..3.053063 |
| cramerIndex | -0.003448..0.048333 | 0.021066..0.086459 | -0.170580..2.456894 | 1.570659..2.766189 |

Final holdout block:

- real `(N/2,N]`: count 2371, Z 0.002574.
- shuffle: Z 0.003398..0.042166.
- signFlip: Z -0.005957..0.010653.
- bootstrap: Z 0.003524..0.060060.
- cramerIndex: Z -0.016375..0.044831.

Named composite checks:

| n | prime field? | reason |
| ---: | --- | --- |
| 25 | no | complete parameter family E_a/F_p and Hasse traces are finite-field inputs; composite modulus is not a field |
| 35 | no | complete parameter family E_a/F_p and Hasse traces are finite-field inputs; composite modulus is not a field |
| 77 | no | complete parameter family E_a/F_p and Hasse traces are finite-field inputs; composite modulus is not a field |
| 289 | no | complete parameter family E_a/F_p and Hasse traces are finite-field inputs; composite modulus is not a field |

Factor check:

This does not telescope to `theta`, `psi`, or `M`. It collapses to an exact finite-field trace-pair identity, and the only non-diagonal term is the Hasse trace of the fixed CM elliptic curve `y^2=x^3-4` plus an overlap correction. After subtracting that exact main term, the residual is identically zero.

Break verdict:

At `N=50000`, the Sato-Tate-centered path has endpoint `Z=0.024529` and energy-normalized `r=1.216074`, while the exact residual endpoint is `Z=0.000000`. The nonzero path is a fixed elliptic trace sequence, not a new prime critical line.

SVG: `logs/playground-artifacts/complete-elliptic-family-second-moment-50000.svg`
JSON: `logs/playground-artifacts/complete-elliptic-family-second-moment-50000.json`