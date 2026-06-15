# Complete Weierstrass family second-moment audit

Family: `E_{a,b}: y^2=x^3+a*x+b`, complete parameters `(a,b) in F_p^2`, singular `4a^3+27b^2=0` discarded.

Derived identities:

`sum_(a,b) a_p(E_{a,b})^2 = p^2*(p-1)`.

Singular curves are parameterized by `a=-3r^2`, `b=2r^3`; the singular trace is `0` for `r=0` and `chi(3r)` for `r!=0`, so `sum_singular a_p^2=p-1`.

Therefore:

`M2_good(p)=(p-1)*(p^2-1)` and `M2_good(p)/(p*good_count)-1=-1/p^2`.

## Brute-force validation

| p | formula good count | brute good count | formula singular square sum | brute singular square sum | formula good M2 | brute good M2 | ok |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 5 | 20 | 20 | 4 | 4 | 96 | 96 | yes |
| 7 | 42 | 42 | 6 | 6 | 288 | 288 | yes |
| 11 | 110 | 110 | 10 | 10 | 1200 | 1200 | yes |
| 13 | 156 | 156 | 12 | 12 | 2016 | 2016 | yes |
| 17 | 272 | 272 | 16 | 16 | 4608 | 4608 | yes |
| 19 | 342 | 342 | 18 | 18 | 6480 | 6480 | yes |
| 23 | 506 | 506 | 22 | 22 | 11616 | 11616 | yes |
| 29 | 812 | 812 | 28 | 28 | 23520 | 23520 | yes |
| 31 | 930 | 930 | 30 | 30 | 28800 | 28800 | yes |
| 37 | 1332 | 1332 | 36 | 36 | 49248 | 49248 | yes |
| 41 | 1640 | 1640 | 40 | 40 | 67200 | 67200 | yes |
| 43 | 1806 | 1806 | 42 | 42 | 77616 | 77616 | yes |
| 47 | 2162 | 2162 | 46 | 46 | 101568 | 101568 | yes |
| 53 | 2756 | 2756 | 52 | 52 | 146016 | 146016 | yes |
| 59 | 3422 | 3422 | 58 | 58 | 201840 | 201840 | yes |
| 61 | 3660 | 3660 | 60 | 60 | 223200 | 223200 | yes |
| 67 | 4422 | 4422 | 66 | 66 | 296208 | 296208 | yes |
| 71 | 4970 | 4970 | 70 | 70 | 352800 | 352800 | yes |
| 73 | 5256 | 5256 | 72 | 72 | 383616 | 383616 | yes |
| 79 | 6162 | 6162 | 78 | 78 | 486720 | 486720 | yes |
| 83 | 6806 | 6806 | 82 | 82 | 564816 | 564816 | yes |
| 89 | 7832 | 7832 | 88 | 88 | 696960 | 696960 | yes |
| 97 | 9312 | 9312 | 96 | 96 | 903168 | 903168 | yes |

## Endpoint trace

| N | prime fields | mean U2 | ST residual Z | cumulative main | exact residual Z | max abs Z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 3125 | 443 | -0.000205645 | -0.004328332 | -0.091100847 | 0.000000000 | 0.042715022 |
| 6250 | 810 | -0.000112494 | -0.003201623 | -0.091119800 | 0.000000000 | 0.042715022 |
| 12500 | 1490 | -0.000061160 | -0.002360813 | -0.091128596 | 0.000000000 | 0.042715022 |
| 25000 | 2760 | -0.000033019 | -0.001734681 | -0.091132699 | 0.000000000 | 0.042715022 |
| 50000 | 5131 | -0.000017762 | -0.001272279 | -0.091134609 | 0.000000000 | 0.042715022 |

Control summary at full range:

| control | endpoint Z range | max abs Z range | energy Z range |
| --- | ---: | ---: | ---: |
| shuffle | -0.001272279..-0.001272279 | 0.001280204..0.002733483 | -1.966621..-1.966621 |
| signFlip | -0.000947981..0.001120349 | 0.040000000..0.042715022 | -1.465339..1.731776 |
| bootstrap | -0.001776732..-0.000151275 | 0.000158097..0.001780515 | -3.614799..-1.567338 |
| cramerIndex | -0.002386196..-0.000790966 | 0.000828548..0.003063934 | -2.468466..-1.447833 |

Final holdout block:

- real `(N/2,N]`: count 2371, Z -0.000000039.
- shuffle: Z -0.001532048..-0.000154510.
- signFlip: Z -0.000000000..0.000000001.
- bootstrap: Z -0.001564337..-0.000107311.
- cramerIndex: Z -0.002245021..-0.000247850.

Named composite checks:

| n | prime field? | reason |
| ---: | --- | --- |
| 25 | no | complete Weierstrass family E_{a,b}/F_p and Legendre traces require a field; composite modulus is not a field |
| 35 | no | complete Weierstrass family E_{a,b}/F_p and Legendre traces require a field; composite modulus is not a field |
| 77 | no | complete Weierstrass family E_{a,b}/F_p and Legendre traces require a field; composite modulus is not a field |
| 289 | no | complete Weierstrass family E_{a,b}/F_p and Legendre traces require a field; composite modulus is not a field |

Factor check:

This does not telescope to `theta`, `psi`, or `M`; it collapses to exact character orthogonality in the complete two-parameter finite-field family. After subtracting the deterministic main term `-1/p^2`, the residual is identically zero.

Break verdict:

At `N=50000`, the Sato-Tate-centered path has endpoint `Z=-0.001272279`, cumulative main `-0.091134609`, and exact residual endpoint `Z=0.000000000`. The apparent flat line is exact diagonal orthogonality plus singular bookkeeping, not prime regularity.

SVG: `logs/playground-artifacts/complete-weierstrass-family-second-moment-50000.svg`
JSON: `logs/playground-artifacts/complete-weierstrass-family-second-moment-50000.json`