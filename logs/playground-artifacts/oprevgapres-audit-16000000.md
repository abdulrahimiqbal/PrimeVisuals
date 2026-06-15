# oprevgap residual audit

Candidate:
`Ores=C_real-mean_s C_residue_matched_composite_s`, where `C` is the
mod-210 residue-centered covariance between `omega(label-1)` and
`gap/log(label)-1`.

## Cumulative residuals

| endpoint | events | real covariance | composite mean | composite sd | residual | residual / composite sd |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1000000 | 78452 | -0.00397095 | -0.01602751 | 0.00394543 | 0.01205656 | 3.056 |
| 2000000 | 148887 | -0.00430237 | -0.01168323 | 0.00197010 | 0.00738085 | 3.746 |
| 4000000 | 283100 | -0.00406771 | -0.00954154 | 0.00167493 | 0.00547383 | 3.268 |
| 8000000 | 539731 | -0.00355370 | -0.00781775 | 0.00145359 | 0.00426405 | 2.933 |
| 16000000 | 1031083 | -0.00440152 | -0.00660938 | 0.00080123 | 0.00220786 | 2.756 |

## Dyadic block residuals

| block | events | real covariance | composite mean | composite sd | residual | residual / composite sd |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 0..1000000 | 78452 | -0.00397095 | -0.01602751 | 0.00394543 | 0.01205656 | 3.056 |
| 1000000..2000000 | 70435 | -0.00456548 | 0.00302835 | 0.00072310 | -0.00759383 | -10.502 |
| 2000000..4000000 | 134213 | -0.00373197 | 0.00103991 | 0.00231760 | -0.00477188 | -2.059 |
| 4000000..8000000 | 256631 | -0.00288665 | 0.00103494 | 0.00129666 | -0.00392160 | -3.024 |
| 8000000..16000000 | 491352 | -0.00529827 | 0.00062387 | 0.00037527 | -0.00592215 | -15.781 |

## Control context at N=16000000

| group | covariance range | z range | full path covariance range |
| --- | ---: | ---: | ---: |
| ordinary Cramer | -0.00036835 .. 0.00088855 | -0.592 .. 1.433 | -0.00167464 .. 0.00143475 |
| W=210 fake labels | -0.00104935 .. 0.00081133 | -1.770 .. 1.366 | -0.00134396 .. 0.00129432 |
| residue-matched composite cumulative | -0.00739640 .. -0.00538802 | -12.335 .. -8.994 | -0.02137599 .. -0.00538802 |

SVG: `logs/playground-artifacts/oprevgapres-audit-16000000.svg`
JSON: `logs/playground-artifacts/oprevgapres-audit-16000000.json`
