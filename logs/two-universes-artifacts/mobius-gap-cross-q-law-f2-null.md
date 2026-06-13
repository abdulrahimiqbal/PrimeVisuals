# Mobius-Gap Cross-q Law Audit

Generated: 2026-06-13T21:07:46.036Z

Statistic: `Corr(mu(f-t), next_gap(f) | previous_gap(f)>t)` unless the scrub mode is marked `two-sided`.
Controls at each largest degree: five cyclic shifts, five composite-only samples, and high-coefficient placebo `mu(f-t^(n-1))` on the same rows.

## Prediction Confirmation

| field | scrub | degrees real r | control degree real r | cyclic meanAbs r | composite meanAbs r | high-placebo r | verdict |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| F_2[t] | two-sided | 25:0.000076 | 0.000076 | 0.000640 | 0.000986 | -0.000431 | passes |

## Raw Control z-scores

| field | scrub | real z | cyclic meanAbs z | composite meanAbs z | high-placebo z |
| --- | --- | ---: | ---: | ---: | ---: |
| F_2[t] | two-sided | 0.084 | 0.707 | 1.053 | -0.476 |

