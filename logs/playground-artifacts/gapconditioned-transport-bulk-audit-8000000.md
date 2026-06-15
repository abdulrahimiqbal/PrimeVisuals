# Gap-conditioned trimmed transport bulk audit

Candidate:
preserve the actual gap sequence, compute transition-ratio z-scores, trim the top 1% cells by `|z|`, and score the remaining bulk RMS.

| N | labels | prime bulk | prime full | prime top | levels bulk |
| ---: | ---: | ---: | ---: | ---: | --- |
| 500000 | 41532 | 2.433868 | 2.767292 | 11.391925 | 210:3.800, 2310:2.148, 30030:1.354 |
| 1000000 | 78492 | 2.823835 | 3.232274 | 13.569792 | 210:4.385, 2310:2.606, 30030:1.480 |
| 2000000 | 148927 | 3.484645 | 3.860483 | 14.493196 | 210:5.641, 2310:3.096, 30030:1.717 |
| 4000000 | 283140 | 4.281077 | 5.017811 | 22.290868 | 210:6.724, 2310:4.197, 30030:1.922 |
| 8000000 | 539771 | 5.807114 | 6.372712 | 22.496598 | 210:10.341, 2310:4.788, 30030:2.292 |

Exponent fits: `bulk theta=0.336223`, `full theta=0.328844`, `top theta=0.289645`.

Endpoint controls at N=8000000:

| group | bulk range | full range | top range |
| --- | ---: | ---: | ---: |
| Cramer labels | 2.433128 .. 2.655894 | 2.650786 .. 3.275052 | 9.529294 .. 15.708513 |
| sampled composites | 5.428721 .. 5.917630 | 6.010256 .. 8.486282 | 22.423490 .. 48.217543 |

Endpoint top cells after gap conditioning:

W=210, trim=1, bulk=10.340913, top=28.651994:
- ratio 139: count=12455, gap-null=13871.00, z=-28.652
- ratio 191: count=15212, gap-null=13706.40, z=27.565
- ratio 41: count=11914, gap-null=13618.00, z=-24.684
- ratio 53: count=14181, gap-null=13238.40, z=22.957
- ratio 29: count=15113, gap-null=13350.80, z=22.250

W=2310, trim=5, bulk=4.788452, top=23.812007:
- ratio 1289: count=2055, gap-null=1503.00, z=32.550
- ratio 419: count=1993, gap-null=1220.40, z=26.878
- ratio 2129: count=2104, gap-null=1483.20, z=20.883
- ratio 953: count=1278, gap-null=1481.00, z=-17.804
- ratio 1781: count=1258, gap-null=1510.60, z=-17.323

W=30030, trim=58, bulk=2.291976, top=15.025793:
- ratio 8219: count=236, gap-null=141.40, z=54.257
- ratio 7349: count=243, gap-null=104.80, z=29.902
- ratio 22591: count=62, gap-null=38.80, z=19.894
- ratio 18899: count=261, gap-null=109.20, z=18.719
- ratio 11639: count=183, gap-null=104.00, z=18.620

Function-field note: no promoted field row. This still uses consecutive order; coefficient/lex order over `F_q[t]` would be an artifact, so the two-universe gate is unmet unless a coordinate-free analogue is invented.

SVG: `logs/playground-artifacts/gapconditioned-transport-bulk-audit-8000000.svg`
JSON: `logs/playground-artifacts/gapconditioned-transport-bulk-audit-8000000.json`