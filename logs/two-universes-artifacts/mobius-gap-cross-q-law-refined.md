# Mobius-Gap Cross-q Law Audit

Generated: 2026-06-13T20:42:19.731Z

Statistic: `Corr(mu(f-t), next_gap(f) | previous_gap(f)>t)` unless the scrub mode is marked `two-sided`.
Controls at each largest degree: five cyclic shifts, five composite-only samples, and high-coefficient placebo `mu(f-t^(n-1))` on the same rows.

## Prediction Confirmation

| field | scrub | degrees real r | control degree real r | cyclic meanAbs r | composite meanAbs r | high-placebo r | verdict |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| F_5[t] | previous | 12:0.007364 | 0.007364 | 0.000193 | 0.000226 | -0.000450 | passes |
| F_7[t] | previous | 10:0.002492 | 0.002492 | 0.000312 | 0.000186 | -0.000057 | passes |
| F_8[t] | two-sided | 8:0.010017 | 0.010017 | 0.001597 | 0.002363 | 0.000815 | fails |

## Raw Control z-scores

| field | scrub | real z | cyclic meanAbs z | composite meanAbs z | high-placebo z |
| --- | --- | ---: | ---: | ---: | ---: |
| F_5[t] | previous | 27.353 | 0.716 | 0.821 | -1.670 |
| F_7[t] | previous | 9.341 | 1.171 | 0.683 | -0.214 |
| F_8[t] | two-sided | 4.944 | 0.788 | 1.176 | 0.402 |

