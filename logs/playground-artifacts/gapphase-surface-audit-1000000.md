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
| Z | -0.139764 | 0.360276 |
| F_2[t] | -0.126089 | 0.380093 |
| F_3[t] | -0.411696 | 0.095134 |

## Integers

| block | labels | mean gap | real vs primary | sqrt-scaled | primary control range | real vs composite | composite control range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1..62500 | 6275 | 9.960950 | 0.041210 | 3.264163 | 0.018694 .. 0.049206 | 0.066266 | 0.014824 .. 0.029686 |
| 62500..125000 | 5459 | 11.449249 | 0.036948 | 2.729691 | 0.027945 .. 0.034546 | 0.042022 | 0.030566 .. 0.038377 |
| 125000..250000 | 10310 | 12.123969 | 0.034528 | 3.505787 | 0.010494 .. 0.043668 | 0.039863 | 0.010919 .. 0.026577 |
| 250000..500000 | 19494 | 12.823680 | 0.038711 | 5.404752 | 0.012588 .. 0.021832 | 0.032980 | 0.011504 .. 0.020966 |
| 500000..1000000 | 36960 | 13.527801 | 0.027765 | 5.337750 | 0.008916 .. 0.018086 | 0.026771 | 0.010832 .. 0.014962 |

## F_2[t]

| degree | labels | mean encoding gap | real vs primary | sqrt-scaled | primary control range | real vs reducible | reducible control range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 8 | 30 | 7.655172 | 1.316863 | 7.091524 | 0.459519 .. 0.684552 | 1.238391 | 0.463830 .. 0.829758 |
| 9 | 56 | 9.163636 | 0.601296 | 4.459327 | 0.280797 .. 0.721501 | 0.623090 | 0.249134 .. 0.437715 |
| 10 | 99 | 10.346939 | 0.957977 | 9.483485 | 0.288881 .. 0.386925 | 0.902513 | 0.255243 .. 0.382030 |
| 11 | 186 | 11.016216 | 0.525312 | 7.145021 | 0.131884 .. 0.313164 | 0.552537 | 0.159176 .. 0.327127 |
| 12 | 335 | 12.233533 | 0.976136 | 17.839538 | 0.142233 .. 0.193587 | 1.000019 | 0.129843 .. 0.158778 |

## F_3[t]

| degree | labels | mean encoding gap | real vs primary | sqrt-scaled | primary control range | real vs reducible | reducible control range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 4 | 18 | 4.235294 | 1.344253 | 5.542497 | 0.934520 .. 1.457290 | 1.269504 | 0.555613 .. 1.500183 |
| 5 | 48 | 4.936170 | 0.587373 | 4.026824 | 0.554472 .. 0.956214 | 0.573464 | 0.534102 .. 0.995568 |
| 6 | 116 | 6.286957 | 0.556213 | 5.964720 | 0.254956 .. 0.332234 | 0.503509 | 0.173243 .. 0.408949 |
| 7 | 312 | 6.980707 | 0.371443 | 6.550467 | 0.141103 .. 0.269166 | 0.348175 | 0.063087 .. 0.231386 |
| 8 | 810 | 8.091471 | 0.241118 | 6.858088 | 0.085339 .. 0.110163 | 0.247359 | 0.096591 .. 0.385750 |

SVG: `logs/playground-artifacts/gapphase-surface-audit-1000000.svg`
JSON: `logs/playground-artifacts/gapphase-surface-audit-1000000.json`
