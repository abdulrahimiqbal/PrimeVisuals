# gapac1 residual audit

Candidate: `gapac1mean(x)` minus the five-seed `W=210` fake-label baseline.

Preregistered confirmation: stable residual flat line after local wheel
subtraction, not explained by Cramer/composite controls.

Preregistered break: residual is known residue-transition/LO-S layer or
unstable under range/control expansion.

## Real residual by endpoint

| N | mean | W210 baseline | residual | residual/se |
| ---: | ---: | ---: | ---: | ---: |
| 1000000 | -0.03616362 | -0.01545285 | -0.02071077 | -9.356 |
| 2000000 | -0.03768670 | -0.01430286 | -0.02338384 | -14.174 |
| 4000000 | -0.03392586 | -0.01322897 | -0.02069689 | -16.690 |
| 8000000 | -0.03269523 | -0.01210599 | -0.02058924 | -22.702 |
| 16000000 | -0.03042431 | -0.01159624 | -0.01882806 | -28.232 |

## Summary at N=16000000

| series | mean | W210 baseline | residual | residual/se |
| --- | ---: | ---: | ---: | ---: |
| real-primes | -0.03042431 | -0.01159624 | -0.01882806 | -28.232 |
| cramer-seed-12345 | -0.00224225 | -0.01159624 | 0.00935400 | 11.785 |
| cramer-seed-271828 | -0.00245580 | -0.01159624 | 0.00914044 | 11.454 |
| cramer-seed-314159 | -0.00090743 | -0.01159624 | 0.01068882 | 13.416 |
| cramer-seed-161803 | -0.00081627 | -0.01159624 | 0.01077998 | 13.650 |
| cramer-seed-424242 | -0.00041838 | -0.01159624 | 0.01117787 | 14.205 |
| wheel-W210-seed-12345 | -0.01103866 | -0.01159624 | 0.00055758 | 0.760 |
| wheel-W210-seed-271828 | -0.01204309 | -0.01159624 | -0.00044684 | -0.609 |
| wheel-W210-seed-314159 | -0.01181073 | -0.01159624 | -0.00021449 | -0.294 |
| wheel-W210-seed-161803 | -0.01163717 | -0.01159624 | -0.00004093 | -0.056 |
| wheel-W210-seed-424242 | -0.01145157 | -0.01159624 | 0.00014468 | 0.199 |
| composite-W210-seed-12345 | 0.14492582 | -0.01159624 | 0.15652206 | 78.038 |
| composite-W210-seed-271828 | 0.14054785 | -0.01159624 | 0.15214410 | 76.391 |
| composite-W210-seed-314159 | 0.14259430 | -0.01159624 | 0.15419054 | 76.980 |
| composite-W210-seed-161803 | 0.14092039 | -0.01159624 | 0.15251663 | 76.367 |
| composite-W210-seed-424242 | 0.13868084 | -0.01159624 | 0.15027708 | 75.653 |

SVG: `logs/playground-artifacts/gapac1residual-audit-16000000.svg`
JSON: `logs/playground-artifacts/gapac1residual-audit-16000000.json`
