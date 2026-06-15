# HL-whitened prime-pair residual direction field audit

Candidate:
fresh-block residual vectors after full local main subtraction, normalized by
their Euclidean direction. The claimed line would be a stable adjacent-cosine
or anchor-projection trace, not a small count residual norm.

Integer: full Hardy-Littlewood factors, shifts `2, 4, 6, 8, 10, 12, 14, 16`,
`W=30030` only for fake/composite breakers.

## Direction metrics

| series | mean adjacent cosine | min adjacent cosine | mean pairwise cosine | stdev pairwise cosine | mean anchor hamming |
| --- | ---: | ---: | ---: | ---: | ---: |
| Z real HL blocks | -0.014386 | -0.291826 | 0.157979 | 0.312063 | 0.350000 |
| F_2[t] | 0.152019 | -0.575174 | -0.014967 | 0.383087 | 0.350000 |
| F_3[t] | -0.146905 | -0.547822 | -0.001553 | 0.519157 | 0.550000 |

## Integer controls

| group | mean energy range | max block energy range | mean adjacent cosine range | min adjacent cosine range | mean pairwise cosine range | mean anchor hamming range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| W=30030 fake labels against HL | 1.056627 .. 1.314176 | 1.487793 .. 2.035631 | 0.024005 .. 0.599122 | -0.924634 .. 0.193241 | -0.092050 .. 0.439366 | 0.175000 .. 0.825000 |
| W=30030 fake labels own finite-wheel main | 0.685226 .. 1.126585 | 1.015268 .. 2.126854 | -0.178223 .. 0.197109 | -0.913283 .. 0.047319 | -0.087811 .. 0.053350 | 0.350000 .. 0.575000 |
| W=30030 composite-only | 26.515828 .. 26.582034 | 42.523541 .. 42.702246 | 0.999354 .. 0.999745 | 0.999038 .. 0.999594 | 0.999434 .. 0.999743 | 0.000000 .. 0.000000 |

## Integer fresh blocks

| block | energy | maxAbs cell | residual cells |
| --- | ---: | ---: | --- |
| 1..31250 | 0.983251 | 1.755610 | -0.851, -0.985, -0.635, -0.360, -1.756, -0.919, -0.101, -1.253 |
| 31250..62500 | 0.683399 | 1.220084 | -0.546, -0.334, -0.548, 0.669, 0.468, -1.220, 0.000, 0.933 |
| 62500..125000 | 0.350143 | 0.775852 | 0.386, -0.052, -0.776, 0.108, 0.032, -0.185, -0.209, -0.370 |
| 125000..250000 | 0.534119 | 0.740784 | -0.268, -0.238, -0.569, -0.596, 0.112, -0.633, 0.741, -0.716 |
| 250000..500000 | 0.629497 | 1.043029 | -0.763, -0.696, 0.277, 0.575, -0.688, -0.086, 0.357, 1.043 |
| 500000..1000000 | 0.489992 | 0.849348 | -0.266, -0.581, -0.446, -0.316, 0.034, -0.164, -0.849, -0.681 |

## F_2[t] rows

| degree | energy | maxAbs cell | residual cells |
| --- | ---: | ---: | --- |
| degree 15 | 0.681095 | 1.688243 | -1.688, 0.037, 0.037, 0.582, 0.601, 0.379, -0.086, -0.086 |
| degree 16 | 0.523620 | 0.851513 | -0.852, 0.381, 0.381, -0.646, 0.635, 0.131, -0.413, -0.413 |
| degree 17 | 0.712967 | 1.776062 | 0.130, 0.078, 0.078, 1.776, -0.808, -0.471, -0.066, -0.066 |
| degree 18 | 0.518398 | 1.088657 | -0.298, 0.357, 0.357, 0.511, 0.295, -1.089, -0.370, -0.370 |
| degree 19 | 0.527610 | 1.057689 | 1.058, 0.454, 0.454, -0.725, -0.254, -0.254, -0.144, -0.144 |
| degree 20 | 1.179473 | 1.729539 | 1.484, -0.699, -0.699, -1.042, 1.730, -1.451, -0.940, -0.940 |

## F_3[t] rows

| degree | energy | maxAbs cell | residual cells |
| --- | ---: | ---: | --- |
| degree 7 | 0.414241 | 0.720324 | 0.720, 0.720, -0.289, -0.289, -0.289, 0.028, -0.289, 0.028 |
| degree 8 | 0.635989 | 0.824194 | -0.214, -0.214, -0.824, -0.824, -0.824, -0.740, -0.103, -0.740 |
| degree 9 | 0.505602 | 0.865850 | -0.866, -0.866, 0.143, 0.143, 0.143, -0.338, -0.505, -0.338 |
| degree 10 | 0.299407 | 0.442750 | 0.366, 0.366, 0.135, 0.135, 0.135, -0.443, -0.050, -0.443 |
| degree 11 | 0.609876 | 1.075467 | -1.075, -1.075, -0.429, -0.429, -0.429, -0.192, 0.187, -0.192 |
| degree 12 | 1.000681 | 1.453808 | 1.454, 1.454, -0.997, -0.997, -0.997, 0.437, 0.649, 0.437 |

SVG: `logs/playground-artifacts/primepair-shape-audit-1000000.svg`
JSON: `logs/playground-artifacts/primepair-shape-audit-1000000.json`
