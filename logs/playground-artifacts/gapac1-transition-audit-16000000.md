# gapac1 transition audit

Candidate: `gapac1mean` minus transition-class baseline.

Baseline: for each endpoint and modulus `q`, replace every normalized gap by
the mean normalized gap for its transition class
`(label_i mod q, label_{i+1} mod q)`, then average adjacent products over the
actual transition-class sequence.

Preregistered break: `q=11` or `q=210` transition baseline erases the Cycle
6 residual. Survivor condition: stable nonzero residual after `q=210` with
controls.

## q=11

Real residual by endpoint:

| N | raw | transition baseline | residual | residual/se |
| ---: | ---: | ---: | ---: | ---: |
| 1000000 | -0.03616362 | -0.00183241 | -0.03433120 | -16.050 |
| 2000000 | -0.03768670 | -0.00196631 | -0.03572039 | -22.258 |
| 4000000 | -0.03392586 | -0.00185992 | -0.03206594 | -26.421 |
| 8000000 | -0.03269523 | -0.00178271 | -0.03091253 | -34.701 |
| 16000000 | -0.03042431 | -0.00129555 | -0.02912875 | -44.331 |

Summary at N=16000000:

| series | raw | transition baseline | residual | residual/se |
| --- | ---: | ---: | ---: | ---: |
| real-primes | -0.03042431 | -0.00129555 | -0.02912875 | -44.331 |
| cramer-seed-12345 | -0.00224225 | 0.00020841 | -0.00245066 | -3.136 |
| cramer-seed-271828 | -0.00245580 | 0.00048835 | -0.00294415 | -3.747 |
| cramer-seed-314159 | -0.00090743 | 0.00007404 | -0.00098146 | -1.251 |
| cramer-seed-161803 | -0.00081627 | 0.00024957 | -0.00106584 | -1.371 |
| cramer-seed-424242 | -0.00041838 | 0.00022916 | -0.00064753 | -0.836 |
| wheel-W210-seed-12345 | -0.01103866 | 0.00066611 | -0.01170477 | -16.166 |
| wheel-W210-seed-271828 | -0.01204309 | 0.00070780 | -0.01275089 | -17.617 |
| wheel-W210-seed-314159 | -0.01181073 | 0.00067662 | -0.01248735 | -17.347 |
| wheel-W210-seed-161803 | -0.01163717 | 0.00068490 | -0.01232207 | -17.130 |
| wheel-W210-seed-424242 | -0.01145157 | 0.00060398 | -0.01205554 | -16.800 |
| composite-W210-seed-12345 | 0.14492582 | 0.15871551 | -0.01378969 | -6.956 |
| composite-W210-seed-271828 | 0.14054785 | 0.15790517 | -0.01735731 | -8.816 |
| composite-W210-seed-314159 | 0.14259430 | 0.15766393 | -0.01506964 | -7.611 |
| composite-W210-seed-161803 | 0.14092039 | 0.15649476 | -0.01557437 | -7.887 |
| composite-W210-seed-424242 | 0.13868084 | 0.15444924 | -0.01576840 | -8.029 |

SVG: `logs/playground-artifacts/gapac1-transition-q11-16000000.svg`

## q=210

Real residual by endpoint:

| N | raw | transition baseline | residual | residual/se |
| ---: | ---: | ---: | ---: | ---: |
| 1000000 | -0.03616362 | -0.02802864 | -0.00813498 | -21.364 |
| 2000000 | -0.03768670 | -0.03087501 | -0.00681168 | -24.855 |
| 4000000 | -0.03392586 | -0.02751346 | -0.00641240 | -32.428 |
| 8000000 | -0.03269523 | -0.02698768 | -0.00570755 | -40.750 |
| 16000000 | -0.03042431 | -0.02517945 | -0.00524485 | -52.502 |

Summary at N=16000000:

| series | raw | transition baseline | residual | residual/se |
| --- | ---: | ---: | ---: | ---: |
| real-primes | -0.03042431 | -0.02517945 | -0.00524485 | -52.502 |
| cramer-seed-12345 | -0.00224225 | 0.00248971 | -0.00473196 | -38.824 |
| cramer-seed-271828 | -0.00245580 | 0.00235680 | -0.00481260 | -40.491 |
| cramer-seed-314159 | -0.00090743 | 0.00367883 | -0.00458625 | -37.550 |
| cramer-seed-161803 | -0.00081627 | 0.00353088 | -0.00434714 | -35.845 |
| cramer-seed-424242 | -0.00041838 | 0.00437934 | -0.00479772 | -39.956 |
| wheel-W210-seed-12345 | -0.01103866 | -0.00614009 | -0.00489857 | -44.803 |
| wheel-W210-seed-271828 | -0.01204309 | -0.00723045 | -0.00481264 | -43.464 |
| wheel-W210-seed-314159 | -0.01181073 | -0.00709159 | -0.00471914 | -42.271 |
| wheel-W210-seed-161803 | -0.01163717 | -0.00717484 | -0.00446234 | -39.892 |
| wheel-W210-seed-424242 | -0.01145157 | -0.00674129 | -0.00471028 | -42.086 |
| composite-W210-seed-12345 | 0.14492582 | 0.14589323 | -0.00096742 | -2.428 |
| composite-W210-seed-271828 | 0.14054785 | 0.14148970 | -0.00094184 | -2.499 |
| composite-W210-seed-314159 | 0.14259430 | 0.14269539 | -0.00010110 | -0.256 |
| composite-W210-seed-161803 | 0.14092039 | 0.14009348 | 0.00082691 | 1.922 |
| composite-W210-seed-424242 | 0.13868084 | 0.13894255 | -0.00026171 | -0.668 |

SVG: `logs/playground-artifacts/gapac1-transition-q210-16000000.svg`

JSON: `logs/playground-artifacts/gapac1-transition-audit-16000000.json`
