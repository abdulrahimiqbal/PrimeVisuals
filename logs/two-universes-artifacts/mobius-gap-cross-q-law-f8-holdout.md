# Mobius-Gap Cross-q Law Audit

Generated: 2026-06-13T20:44:14.794Z

Statistic: `Corr(mu(f-t), next_gap(f) | previous_gap(f)>t)` unless the scrub mode is marked `two-sided`.
Controls at each largest degree: five cyclic shifts, five composite-only samples, and high-coefficient placebo `mu(f-t^(n-1))` on the same rows.

## Prediction Confirmation

| field | scrub | degrees real r | control degree real r | cyclic meanAbs r | composite meanAbs r | high-placebo r | verdict |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| F_8[t] | two-sided | 9:0.006483 | 0.006483 | 0.000287 | 0.000402 | -0.000368 | passes |

## Raw Control z-scores

| field | scrub | real z | cyclic meanAbs z | composite meanAbs z | high-placebo z |
| --- | --- | ---: | ---: | ---: | ---: |
| F_8[t] | two-sided | 9.888 | 0.437 | 0.605 | -0.562 |

