# Mobius-Gap Cross-q Law Audit

Generated: 2026-06-13T20:37:31.148Z

Statistic: `Corr(mu(f-t), next_gap(f) | previous_gap(f)>t)` unless the scrub mode is marked `two-sided`.
Controls at each largest degree: five cyclic shifts, five composite-only samples, and high-coefficient placebo `mu(f-t^(n-1))` on the same rows.

## Prediction Confirmation

| field | scrub | degrees real r | control degree real r | cyclic meanAbs r | composite meanAbs r | high-placebo r | verdict |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| F_5[t] | previous | 9:-0.001187, 10:0.009585, 11:0.007587 | 0.007587 | 0.000372 | 0.000276 | -0.000250 | fails |
| F_7[t] | previous | 7:-0.003410, 8:0.008951, 9:0.002273 | 0.002273 | 0.000783 | 0.000463 | -0.000441 | fails |
| F_4[t] | previous | 10:0.054211, 11:0.056296, 12:0.047112 | 0.047112 | 0.001070 | 0.003188 | 0.002173 | fails |
| F_4[t] | two-sided | 10:0.002429, 11:0.010408, 12:0.006272 | 0.006272 | 0.000978 | 0.000767 | 0.001545 | fails |
| F_3[t] | previous | 18:0.019551 | 0.019551 | 0.000118 | 0.001070 | -0.000449 | passes |

## Raw Control z-scores

| field | scrub | real z | cyclic meanAbs z | composite meanAbs z | high-placebo z |
| --- | --- | ---: | ---: | ---: | ---: |
| F_5[t] | previous | 12.903 | 0.633 | 0.458 | -0.425 |
| F_7[t] | previous | 3.254 | 1.121 | 0.649 | -0.632 |
| F_4[t] | previous | 48.079 | 1.092 | 3.169 | 2.217 |
| F_4[t] | two-sided | 5.483 | 0.855 | 0.641 | 1.351 |
| F_3[t] | previous | 85.149 | 0.516 | 4.559 | -1.956 |

