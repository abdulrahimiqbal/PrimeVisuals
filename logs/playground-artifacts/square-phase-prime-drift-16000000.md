# Square-phase prime-drift audit

Candidate:
`Z_W(N)=sum_{p<=N}(phi(p)-E_W(phi|square annulus))/sqrt(sum Var_W)`, with `phi(n)=2 frac_square(n)-1`.

## Integer side

W: 2310, phi(W): 480, density scale W/phi(W): 4.812500.
Pool sizes: W candidates 3324673, W composites 2293548, primes 1031130.

| N | labels | raw centered sum | sqrt variance | Z | max |Z| | raw theta so far | block Z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1000000 | 78492 | 73.629716 | 161.719250 | 0.455293 | 1.069045 | 0.761148 | 0.455293 |
| 2000000 | 148927 | 96.315625 | 222.787461 | 0.432321 | 1.069045 | 0.761148 | 0.148046 |
| 4000000 | 283140 | 322.546274 | 307.197899 | 1.049962 | 1.121040 | 0.761148 | 1.069600 |
| 8000000 | 539771 | 231.573557 | 424.160834 | 0.545957 | 1.428432 | 0.761148 | -0.311044 |
| 16000000 | 1031124 | 675.017602 | 586.256518 | 1.151403 | 1.428432 | 0.761148 | 1.095728 |

Endpoint controls, 15 seeds:

| control | labels range | final Z range | final |Z| range | max |Z| range | raw theta range |
| --- | ---: | ---: | ---: | ---: | ---: |
| cramer | 642232..644999 | -1.170554..1.127142 | 0.076461..1.170554 | 1.073587..3.110663 | 0.245707..0.862623 |
| wRandom | 1030545..1034416 | -1.304422..1.055765 | 0.051389..1.304422 | 1.235646..2.403408 | 0.113578..0.759543 |
| wComposite | 708168..710344 | -1.897717..0.286703 | 0.016782..1.897717 | 1.289472..2.667986 | 0.092972..0.750522 |

Holdout range: (8000000, 16000000]

| holdout | labels | Z / range | max |Z| range |
| --- | ---: | ---: | ---: |
| real | 491353 | 1.095728 | 10.107391 |
| cramer | 305989..308080 | -1.019844..1.333675 | 7.200412..9.514706 |
| wRandom | 490022..492522 | -1.068868..1.551592 | 9.191141..11.554990 |
| wComposite | 345618..347111 | -1.329624..1.232813 | 7.590554..9.880751 |

Named composite checks:

| n | prime input? | W-eligible? | phase | centered | one-step Z |
| ---: | --- | --- | ---: | ---: | ---: |
| 25 | no | no | -1.000000 | NA | NA |
| 35 | no | no | 0.818182 | NA | NA |
| 77 | no | no | 0.529412 | NA | NA |
| 289 | no | yes | -1.000000 | -1.000000 | -1.573133 |

## Function-field note

No coordinate-free finite-field square phase was used: inside a fixed degree shell every monic polynomial has the same norm, and ordering lower coefficients would reintroduce the coefficient-ordering artifact.

SVG: `logs/playground-artifacts/square-phase-prime-drift-16000000.svg`
JSON: `logs/playground-artifacts/square-phase-prime-drift-16000000.json`