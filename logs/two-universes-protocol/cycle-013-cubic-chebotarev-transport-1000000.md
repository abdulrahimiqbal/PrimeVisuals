# Cubic Chebotarev splitting transport audit

Candidate:
compare Frobenius splitting type distributions for `x^3-2` over integer primes and `x^3-t` over closed points of `F_q[t]`.

Classes: `split = 1+1+1`, `linearQuad = 1+2`, `inert = 3`.

This is a new-domain calibration branch, not a claimed breakthrough: classical/effective Chebotarev is the expected explanation.

## Summary

- Complete integer ladder 1M/2M/4M/8M: false
- Final integer within multinomial controls: true
- Final fields within multinomial controls: true
- All endpoint diagnostics within controls: true
- Max endpoint chi: 0.324125

## Integer Chebotarev Rows

| label | labels | split | linear+quad | inert | split frac | linear+quad frac | inert frac | chi | maxAbsZ |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Z<=1000000 | 78496 | 13032 | 39265 | 26199 | 0.166021 | 0.500217 | 0.333762 | 0.324125 | 0.485249 |

## F_2[t] Kummer Rows

| label | labels | split | linear+quad | inert | split frac | linear+quad frac | inert frac | chi | maxAbsZ |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| F_2:deg1 | 1 | 0 | 1 | 0 | 0.000000 | 1.000000 | 0.000000 | 0.000000 | 0.000000 |
| F_2:deg2 | 1 | 0 | 0 | 1 | 0.000000 | 0.000000 | 1.000000 | 0.577350 | 0.707107 |
| F_2:deg3 | 2 | 0 | 2 | 0 | 0.000000 | 1.000000 | 0.000000 | 0.000000 | 0.000000 |
| F_2:deg4 | 3 | 1 | 0 | 2 | 0.333333 | 0.000000 | 0.666667 | 0.000000 | 0.000000 |
| F_2:deg5 | 6 | 0 | 6 | 0 | 0.000000 | 1.000000 | 0.000000 | 0.000000 | 0.000000 |
| F_2:deg6 | 9 | 2 | 0 | 7 | 0.222222 | 0.000000 | 0.777778 | 0.577350 | 0.707107 |
| F_2:deg7 | 18 | 0 | 18 | 0 | 0.000000 | 1.000000 | 0.000000 | 0.000000 | 0.000000 |
| F_2:deg8 | 30 | 10 | 0 | 20 | 0.333333 | 0.000000 | 0.666667 | 0.000000 | 0.000000 |
| F_2:deg9 | 56 | 0 | 56 | 0 | 0.000000 | 1.000000 | 0.000000 | 0.000000 | 0.000000 |
| F_2:deg10 | 99 | 31 | 0 | 68 | 0.313131 | 0.000000 | 0.686869 | 0.348155 | 0.426401 |
| F_2:deg11 | 186 | 0 | 186 | 0 | 0.000000 | 1.000000 | 0.000000 | 0.000000 | 0.000000 |
| F_2:deg12 | 335 | 111 | 0 | 224 | 0.331343 | 0.000000 | 0.668657 | 0.063088 | 0.077267 |
| F_2:deg13 | 630 | 0 | 630 | 0 | 0.000000 | 1.000000 | 0.000000 | 0.000000 | 0.000000 |
| F_2:deg14 | 1161 | 381 | 0 | 780 | 0.328165 | 0.000000 | 0.671835 | 0.304997 | 0.373544 |
| F_2:deg15 | 2182 | 0 | 2182 | 0 | 0.000000 | 1.000000 | 0.000000 | 0.000000 | 0.000000 |
| F_2:deg16 | 4080 | 1360 | 0 | 2720 | 0.333333 | 0.000000 | 0.666667 | 0.000000 | 0.000000 |

## F_5[t] Kummer Rows

| label | labels | split | linear+quad | inert | split frac | linear+quad frac | inert frac | chi | maxAbsZ |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| F_5:deg1 | 4 | 0 | 4 | 0 | 0.000000 | 1.000000 | 0.000000 | 0.000000 | 0.000000 |
| F_5:deg2 | 10 | 2 | 0 | 8 | 0.200000 | 0.000000 | 0.800000 | 0.730297 | 0.894427 |
| F_5:deg3 | 40 | 0 | 40 | 0 | 0.000000 | 1.000000 | 0.000000 | 0.000000 | 0.000000 |
| F_5:deg4 | 150 | 50 | 0 | 100 | 0.333333 | 0.000000 | 0.666667 | 0.000000 | 0.000000 |
| F_5:deg5 | 624 | 0 | 624 | 0 | 0.000000 | 1.000000 | 0.000000 | 0.000000 | 0.000000 |
| F_5:deg6 | 2580 | 844 | 0 | 1736 | 0.327132 | 0.000000 | 0.672868 | 0.545595 | 0.668215 |
| F_5:deg7 | 11160 | 0 | 11160 | 0 | 0.000000 | 1.000000 | 0.000000 | 0.000000 | 0.000000 |

JSON: `logs/two-universes-protocol/cycle-013-cubic-chebotarev-transport-1000000.json`
SVG: `logs/two-universes-protocol/cycle-013-cubic-chebotarev-transport-1000000.svg`
