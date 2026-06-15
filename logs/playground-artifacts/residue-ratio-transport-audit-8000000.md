# Consecutive residue-ratio transport audit

Candidate:
score the ordered multiplicative transition ratio `p_next * p^{-1} mod W` over `W=210,2310,30030`, after removing endpoint residue counts by random-shuffle nulls.

| N | labels | shuffle-null mean energy | gap-conditioned mean energy | max |identity z| | level energies |
| ---: | ---: | ---: | ---: | ---: | --- |
| 500000 | 41532 | 10.377676 | 2.767292 | 40.924014 | 210:20.025, 2310:8.199, 30030:2.909 |
| 1000000 | 78492 | 15.558425 | 3.232274 | 29.140260 | 210:32.706, 2310:10.231, 30030:3.738 |
| 2000000 | 148927 | 20.270476 | 3.860483 | 132.156023 | 210:40.920, 2310:14.874, 30030:5.018 |
| 4000000 | 283140 | 22.435134 | 5.017811 | 97.960357 | 210:40.997, 2310:19.618, 30030:6.690 |
| 8000000 | 539771 | 43.333207 | 6.372712 | 141.603443 | 210:96.379, 2310:24.553, 30030:9.068 |

Exponent fits: `shuffle meanEnergy theta=0.502968`, `gap-conditioned theta=0.328844`, `identityAbs theta=0.576200`.

Endpoint controls at N=8000000:

Gap-conditioned endpoint levels: 210:11.037, 2310:5.348, 30030:2.734

| group | mean energy range | max energy range | max |identity z| range |
| --- | ---: | ---: | ---: |
| random order of same primes | 1.610580 .. 1.826436 | 1.745901 .. 1.954104 | 0.169682 .. 5.003447 |
| Cramer labels | 16.090424 .. 24.531205 | 29.029702 .. 54.669404 | 66.775390 .. 312.590792 |
| sampled composites in natural order | 33.125968 .. 39.578243 | 61.865466 .. 83.336909 | 134.341734 .. 189.071693 |

Top endpoint transition-ratio cells:

W=210:
- ratio 71: count=406, null=11312.60, z=-412.514
- ratio 47: count=13492, null=11241.00, z=320.917
- ratio 151: count=3745, null=11279.60, z=-169.815
- ratio 127: count=1822, null=11203.80, z=-168.227
- ratio 1: count=0, null=11127.40, z=-141.603
- ratio 121: count=3695, null=11148.60, z=-115.349

W=2310:
- ratio 281: count=51, null=1124.80, z=-123.368
- ratio 859: count=39, null=1125.00, z=-104.694
- ratio 631: count=0, null=1125.00, z=-91.979
- ratio 673: count=153, null=1123.60, z=-75.736
- ratio 2047: count=53, null=1107.60, z=-74.157
- ratio 1171: count=430, null=1114.60, z=-71.908

W=30030:
- ratio 2081: count=0, null=93.00, z=-93.000
- ratio 529: count=0, null=94.40, z=-58.099
- ratio 29531: count=164, null=89.20, z=56.383
- ratio 24839: count=148, null=90.60, z=56.285
- ratio 18217: count=5, null=100.60, z=-51.544
- ratio 7547: count=0, null=95.00, z=-50.069

Top endpoint gap-conditioned cells:

W=210:
- ratio 139: count=12455, gap-null=13871.00, z=-28.652
- ratio 191: count=15212, gap-null=13706.40, z=27.565
- ratio 41: count=11914, gap-null=13618.00, z=-24.684
- ratio 53: count=14181, gap-null=13238.40, z=22.957

W=2310:
- ratio 1289: count=2055, gap-null=1503.00, z=32.550
- ratio 419: count=1993, gap-null=1220.40, z=26.878
- ratio 2129: count=2104, gap-null=1483.20, z=20.883
- ratio 953: count=1278, gap-null=1481.00, z=-17.804

W=30030:
- ratio 8219: count=236, gap-null=141.40, z=54.257
- ratio 7349: count=243, gap-null=104.80, z=29.902
- ratio 22591: count=62, gap-null=38.80, z=19.894
- ratio 18899: count=261, gap-null=109.20, z=18.719

Function-field note: this candidate intentionally has no promoted field row. Consecutive order over integers is canonical; coefficient/lex order over `F_q[t]` is an artifact class already flagged in the ledger. A survivor would need a coordinate-free field transport analogue.

SVG: `logs/playground-artifacts/residue-ratio-transport-audit-8000000.svg`
JSON: `logs/playground-artifacts/residue-ratio-transport-audit-8000000.json`