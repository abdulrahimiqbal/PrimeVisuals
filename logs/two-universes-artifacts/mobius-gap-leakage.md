# Mobius/Gap Leakage Audit

Generated: 2026-06-13T16:57:36.795Z

Rule: positive-shift rows exclude next gap <= shift; negative-shift rows exclude previous gap <= shift. Nulls use the same exclusion on each sampled local-wheel sequence.

## base2

First-pass polynomial candidates: omega_plus_t_plus_1, omega_plus_t

| rank | statistic | scrubbed real z values | scrubbed n values | null meanAbs values | largest ratio | verdict |
| ---: | --- | ---: | ---: | ---: | ---: | --- |
| 1 | omega_plus_t | -2.061, -5.117, -5.491 | 346586, 665879, 1281352 | 0.863, 0.975, 2.198 | 2.498 | fails |
| 2 | mu_plus_1 | -1.182, 2.481, -0.935 | 364721, 698869, 1342175 | 0.887, 0.902, 0.388 | 2.409 | fails |
| 3 | omega_plus_1 | 1.908, 0.698, 2.119 | 364721, 698869, 1342175 | 0.301, 0.710, 0.993 | 2.134 | fails |
| 4 | omega_plus_t_plus_1 | -3.370, -3.888, -8.957 | 346586, 665879, 1281352 | 2.972, 4.106, 4.748 | 1.886 | fails |
| 5 | abs_mu_plus_t | 1.508, 0.267, -1.135 | 346586, 665879, 1281352 | 1.001, 0.742, 0.769 | 1.475 | fails |
| 6 | abs_mu_plus_1 | -18.879, -25.854, -31.491 | 364721, 698869, 1342175 | 18.168, 23.884, 30.499 | 1.033 | fails |
| 7 | mu_plus_t_plus_1 | -0.644, -0.485, 0.577 | 346586, 665879, 1281352 | 0.403, 0.392, 1.241 | 0.465 | fails |
| 8 | abs_mu_plus_t_plus_1 | 1.058, 3.963, 1.344 | 346586, 665879, 1281352 | 1.787, 1.349, 3.125 | 0.430 | fails |
| 9 | mu_plus_t | 0.592, -0.495, 0.124 | 346586, 665879, 1281352 | 1.147, 1.064, 0.322 | 0.385 | fails |

## base3

First-pass polynomial candidates: mu_plus_t, mu_plus_1, mu_plus_t_plus_1, mu_minus_t_plus_1, mu_minus_t, omega_plus_t, omega_plus_1

| rank | statistic | scrubbed real z values | scrubbed n values | null meanAbs values | largest ratio | verdict |
| ---: | --- | ---: | ---: | ---: | ---: | --- |
| 1 | mu_minus_t | 12.836, 19.614, 32.434 | 289209, 819906, 2330338 | 1.195, 0.465, 0.572 | 56.725 | survives |
| 2 | mu_minus_t_plus_1 | 11.384, 19.237, 30.482 | 270901, 772430, 2203837 | 1.360, 0.553, 0.558 | 54.640 | survives |
| 3 | mu_plus_t | 2.971, 4.513, 8.837 | 289208, 819906, 2330337 | 0.873, 0.688, 0.467 | 18.924 | survives |
| 4 | mu_plus_1 | 6.527, 9.107, 10.295 | 331973, 931020, 2623403 | 0.760, 1.205, 0.759 | 13.560 | survives |
| 5 | mu_plus_t_plus_1 | 2.435, 3.446, 6.876 | 270900, 772430, 2203836 | 0.497, 0.730, 1.143 | 6.017 | survives |
| 6 | mu_minus_1 | 1.022, 7.355, 7.303 | 331973, 931020, 2623404 | 0.701, 0.556, 0.670 | 10.902 | fails |
| 7 | omega_minus_t_plus_1 | 10.160, 17.682, 28.227 | 270901, 772430, 2203837 | 6.599, 10.294, 16.812 | 1.679 | fails |
| 8 | omega_plus_t_plus_1 | -19.909, -28.747, -47.924 | 270900, 772430, 2203836 | 15.940, 24.845, 38.612 | 1.241 | fails |
| 9 | omega_plus_t | -12.681, -19.855, -32.313 | 289208, 819906, 2330337 | 11.166, 16.607, 26.149 | 1.236 | fails |
| 10 | omega_minus_1 | -14.118, -22.351, -32.740 | 331973, 931020, 2623404 | 11.796, 17.848, 27.203 | 1.204 | fails |
| 11 | abs_mu_plus_t_plus_1 | 16.548, 23.740, 42.107 | 270900, 772430, 2203836 | 16.579, 25.593, 39.622 | 1.063 | fails |
| 12 | abs_mu_plus_t | 5.139, 9.385, 16.939 | 289208, 819906, 2330337 | 7.070, 9.494, 16.318 | 1.038 | fails |

