# Complete Weierstrass second-moment transport audit

Candidate:
transport the exact second moment of the complete two-parameter Weierstrass family across rational prime fields and residue fields F_q[t]/P.

For every odd finite field K, consider nonsingular curves

`E_{a,b}: y^2=x^3+a*x+b`, `(a,b) in K^2`, `4a^3+27b^2 != 0`.

The exact identity is

`M2(K)/( |K| * good_count ) - 1 = -1/|K|^2`.

The scored theorem residual subtracts `-1/|K|^2`, so a breakthrough candidate would need nonzero structure after this exact second-moment baseline.

## Summary

- Complete integer ladder 1M/2M/4M/8M: true
- Required q=3,5,7 field ladders: true
- Brute validation passed: true
- Exact theorem residuals zero: true
- Absorbed by exact second moment: true
- Max exact residual z: 0.000000000
- Max Sato-Tate-baseline residual z before exact subtraction: 0.001459028

## Integer Rows

| label | cumulative labels | endpoint labels | mean ST residual | ST residual z | ST energy z | exact residual z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Z<=1000000 | 78496 | 78496 | -0.000001161 | -0.000325287 | -1.966656423 | 0.000000000 |
| Z<=2000000 | 148931 | 148931 | -0.000000612 | -0.000236156 | -1.966657188 | 0.000000000 |
| Z<=4000000 | 283144 | 283144 | -0.000000322 | -0.000171273 | -1.966657552 | 0.000000000 |
| Z<=8000000 | 539775 | 539775 | -0.000000169 | -0.000124047 | -1.966657726 | 0.000000000 |

## F_3[t] Rows

| label | cumulative labels | endpoint labels | ST residual | ST residual z | ST energy z | exact residual z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| F_3:deg1 | 3 | 3 | -0.111111111 | -0.192450090 | -1.732050808 | 0.000000000 |
| F_3:deg2 | 6 | 3 | -0.012345679 | -0.151203071 | -1.912730139 | 0.000000000 |
| F_3:deg3 | 14 | 8 | -0.001371742 | -0.101918553 | -1.969008400 | 0.000000000 |
| F_3:deg4 | 32 | 18 | -0.000152416 | -0.067897770 | -1.983162874 | 0.000000000 |
| F_3:deg5 | 80 | 48 | -0.000016935 | -0.043033204 | -1.987359680 | 0.000000000 |
| F_3:deg6 | 196 | 116 | -0.000001882 | -0.027508496 | -1.988486687 | 0.000000000 |
| F_3:deg7 | 508 | 312 | -0.000000209 | -0.017089785 | -1.988823496 | 0.000000000 |
| F_3:deg8 | 1318 | 810 | -0.000000023 | -0.010610405 | -1.988920653 | 0.000000000 |
| F_3:deg9 | 3502 | 2184 | -0.000000003 | -0.006509355 | -1.988949760 | 0.000000000 |
| F_3:deg10 | 9382 | 5880 | -0.000000000 | -0.003976951 | -1.988958467 | 0.000000000 |
| F_3:deg11 | 25486 | 16104 | -0.000000000 | -0.002412946 | -1.988961117 | 0.000000000 |
| F_3:deg12 | 69706 | 44220 | -0.000000000 | -0.001459028 | -1.988961925 | 0.000000000 |

## F_5[t] Rows

| label | cumulative labels | endpoint labels | ST residual | ST residual z | ST energy z | exact residual z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| F_5:deg1 | 5 | 5 | -0.040000000 | -0.089442719 | -2.236067977 | 0.000000000 |
| F_5:deg2 | 15 | 10 | -0.001600000 | -0.055770960 | -2.411098739 | 0.000000000 |
| F_5:deg3 | 55 | 40 | -0.000064000 | -0.029470624 | -2.439649822 | 0.000000000 |
| F_5:deg4 | 205 | 150 | -0.000002560 | -0.015291712 | -2.443936026 | 0.000000000 |
| F_5:deg5 | 829 | 624 | -0.000000102 | -0.007606459 | -2.444649274 | 0.000000000 |
| F_5:deg6 | 3409 | 2580 | -0.000000004 | -0.003751174 | -2.444767235 | 0.000000000 |
| F_5:deg7 | 14569 | 11160 | -0.000000000 | -0.001814552 | -2.444787645 | 0.000000000 |
| F_5:deg8 | 63319 | 48750 | -0.000000000 | -0.000870398 | -2.444791211 | 0.000000000 |

## F_7[t] Rows

| label | cumulative labels | endpoint labels | ST residual | ST residual z | ST energy z | exact residual z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| F_7:deg1 | 7 | 7 | -0.020408163 | -0.053994925 | -2.645751311 | 0.000000000 |
| F_7:deg2 | 28 | 21 | -0.000416493 | -0.028650368 | -2.805983623 | 0.000000000 |
| F_7:deg3 | 140 | 112 | -0.000008500 | -0.012893292 | -2.823599701 | 0.000000000 |
| F_7:deg4 | 728 | 588 | -0.000000173 | -0.005657863 | -2.825487546 | 0.000000000 |
| F_7:deg5 | 4088 | 3360 | -0.000000004 | -0.002387792 | -2.825707704 | 0.000000000 |
| F_7:deg6 | 23632 | 19544 | -0.000000000 | -0.000993129 | -2.825733838 | 0.000000000 |
| F_7:deg7 | 141280 | 117648 | -0.000000000 | -0.000406178 | -2.825737049 | 0.000000000 |

## Brute Validation

| p | formula good count | brute good count | formula singular square sum | brute singular square sum | formula good M2 | brute good M2 | ok |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 5 | 20 | 20 | 4 | 4 | 96 | 96 | true |
| 7 | 42 | 42 | 6 | 6 | 288 | 288 | true |
| 11 | 110 | 110 | 10 | 10 | 1200 | 1200 | true |
| 13 | 156 | 156 | 12 | 12 | 2016 | 2016 | true |

## Novelty Audit

- This is a higher-moment mutation from the cycle 016 trace identity.
- It is still not a breakthrough candidate: diagonal character orthogonality and singular-curve bookkeeping give the exact residual.
- A continuation must leave complete orthogonality moments and register an incomplete-family, monodromy, or spectral statistic with a nonzero theorem-normalized residual.

JSON: `logs/two-universes-protocol/cycle-017-complete-weierstrass-second-moment-8000000.json`
SVG: `logs/two-universes-protocol/cycle-017-complete-weierstrass-second-moment-8000000.svg`
