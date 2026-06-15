# gap-phase residual surface audit

Candidate:
`S_U(d,j)=mean exp(2*pi*i*j*gap/meanGap_d)`, subtract matched random-label
baseline cell-by-cell for harmonics `j=1..8`, then collapse the
residual surface by L2 norm.

Primary baselines: integers use W=210 random labels; function fields use
random monic labels of the same degree and count. Composite controls are
W=210 composite-only labels for integers and random reducible monics for
function fields.

Exponent fits over labels:

| universe | primary norm theta | sqrt-scaled theta |
| --- | ---: | ---: |
| Z | -0.199634 | 0.300369 |
| F_2[t] | 0.027802 | 0.527805 |
| F_3[t] | 0.032903 | 0.532910 |

## Integers

| block | labels | mean gap | real vs primary | sqrt-scaled | primary control range | real vs composite | composite control range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1..1000000 | 78498 | 12.739098 | 0.023946 | 6.709014 | 0.006856 .. 0.011534 | 0.019290 | 0.006118 .. 0.012551 |
| 1000000..2000000 | 70435 | 14.197547 | 0.022542 | 5.982385 | 0.005150 .. 0.011909 | 0.020489 | 0.005409 .. 0.011546 |
| 2000000..4000000 | 134213 | 14.901559 | 0.026919 | 9.861805 | 0.005478 .. 0.010213 | 0.020745 | 0.005202 .. 0.008766 |
| 4000000..8000000 | 256631 | 15.586471 | 0.021115 | 10.696421 | 0.002945 .. 0.006844 | 0.018466 | 0.003687 .. 0.006149 |
| 8000000..16000000 | 491353 | 16.281566 | 0.015403 | 10.796691 | 0.002738 .. 0.005455 | 0.013770 | 0.002364 .. 0.006637 |

## F_2[t]

| degree | labels | mean encoding gap | real vs primary | sqrt-scaled | primary control range | real vs reducible | reducible control range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 20 | 52377 | 20.019856 | 0.205545 | 47.040547 | 0.008772 .. 0.014048 | 0.205942 | 0.011789 .. 0.018297 |
| 21 | 99858 | 21.000991 | 0.238243 | 75.285306 | 0.010036 .. 0.011924 | 0.240422 | 0.008498 .. 0.011906 |
| 22 | 190557 | 22.010758 | 0.230864 | 100.778385 | 0.005560 .. 0.007817 | 0.232508 | 0.006693 .. 0.008573 |
| 23 | 364722 | 22.999970 | 0.204539 | 123.525285 | 0.003497 .. 0.005967 | 0.204023 | 0.004949 .. 0.006881 |
| 24 | 698870 | 24.006181 | 0.242744 | 202.929986 | 0.002879 .. 0.005380 | 0.243633 | 0.003408 .. 0.004858 |

## F_3[t]

| degree | labels | mean encoding gap | real vs primary | sqrt-scaled | primary control range | real vs reducible | reducible control range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 11 | 16104 | 11.000124 | 0.134814 | 17.107581 | 0.023003 .. 0.028689 | 0.132034 | 0.020499 .. 0.037519 |
| 12 | 44220 | 12.017956 | 0.333624 | 70.155500 | 0.007461 .. 0.018257 | 0.329980 | 0.011930 .. 0.021070 |
| 13 | 122640 | 12.999918 | 0.198573 | 69.540126 | 0.005296 .. 0.009677 | 0.198420 | 0.006536 .. 0.011982 |
| 14 | 341484 | 14.006445 | 0.150759 | 88.098490 | 0.003587 .. 0.009153 | 0.149688 | 0.004624 .. 0.006564 |
| 15 | 956576 | 15.000282 | 0.237596 | 232.380214 | 0.002510 .. 0.003816 | 0.237028 | 0.003293 .. 0.004174 |

SVG: `logs/playground-artifacts/gapphase-surface-audit-16000000.svg`
JSON: `logs/playground-artifacts/gapphase-surface-audit-16000000.json`
