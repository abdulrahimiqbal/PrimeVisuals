# Complete Weierstrass second-moment transport audit

Candidate:
transport the exact second moment of the complete two-parameter Weierstrass family across rational prime fields and residue fields F_q[t]/P.

For every odd finite field K, consider nonsingular curves

`E_{a,b}: y^2=x^3+a*x+b`, `(a,b) in K^2`, `4a^3+27b^2 != 0`.

The exact identity is

`M2(K)/( |K| * good_count ) - 1 = -1/|K|^2`.

The scored theorem residual subtracts `-1/|K|^2`, so a breakthrough candidate would need nonzero structure after this exact second-moment baseline.

## Summary

- Complete integer ladder 1M/2M/4M/8M: false
- Required q=3,5,7 field ladders: true
- Brute validation passed: true
- Exact theorem residuals zero: true
- Absorbed by exact second moment: true
- Max exact residual z: 0.000000000
- Max Sato-Tate-baseline residual z before exact subtraction: 0.043033204

## Integer Rows

| label | cumulative labels | endpoint labels | mean ST residual | ST residual z | ST energy z | exact residual z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Z<=200000 | 17982 | 17982 | -0.000005068 | -0.000679627 | -1.966649682 | 0.000000000 |

## F_3[t] Rows

| label | cumulative labels | endpoint labels | ST residual | ST residual z | ST energy z | exact residual z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| F_3:deg1 | 3 | 3 | -0.111111111 | -0.192450090 | -1.732050808 | 0.000000000 |
| F_3:deg2 | 6 | 3 | -0.012345679 | -0.151203071 | -1.912730139 | 0.000000000 |
| F_3:deg3 | 14 | 8 | -0.001371742 | -0.101918553 | -1.969008400 | 0.000000000 |
| F_3:deg4 | 32 | 18 | -0.000152416 | -0.067897770 | -1.983162874 | 0.000000000 |
| F_3:deg5 | 80 | 48 | -0.000016935 | -0.043033204 | -1.987359680 | 0.000000000 |

## F_5[t] Rows

| label | cumulative labels | endpoint labels | ST residual | ST residual z | ST energy z | exact residual z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| F_5:deg1 | 5 | 5 | -0.040000000 | -0.089442719 | -2.236067977 | 0.000000000 |
| F_5:deg2 | 15 | 10 | -0.001600000 | -0.055770960 | -2.411098739 | 0.000000000 |
| F_5:deg3 | 55 | 40 | -0.000064000 | -0.029470624 | -2.439649822 | 0.000000000 |
| F_5:deg4 | 205 | 150 | -0.000002560 | -0.015291712 | -2.443936026 | 0.000000000 |

## F_7[t] Rows

| label | cumulative labels | endpoint labels | ST residual | ST residual z | ST energy z | exact residual z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| F_7:deg1 | 7 | 7 | -0.020408163 | -0.053994925 | -2.645751311 | 0.000000000 |
| F_7:deg2 | 28 | 21 | -0.000416493 | -0.028650368 | -2.805983623 | 0.000000000 |
| F_7:deg3 | 140 | 112 | -0.000008500 | -0.012893292 | -2.823599701 | 0.000000000 |
| F_7:deg4 | 728 | 588 | -0.000000173 | -0.005657863 | -2.825487546 | 0.000000000 |

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

JSON: `logs/two-universes-protocol/cycle-017-complete-weierstrass-second-moment-200000.json`
SVG: `logs/two-universes-protocol/cycle-017-complete-weierstrass-second-moment-200000.svg`
