# Square-phase prime-drift audit

Candidate:
`Z_W(N)=sum_{p<=N}(phi(p)-E_W(phi|square annulus))/sqrt(sum Var_W)`, with `phi(n)=2 frac_square(n)-1`.

## Integer side

W: 2310, phi(W): 480, density scale W/phi(W): 4.812500.
Pool sizes: W candidates 1662337, W composites 1122565, primes 539777.

| N | labels | raw centered sum | sqrt variance | Z | max |Z| | raw theta so far | block Z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 500000 | 41532 | 26.162764 | 117.613704 | 0.222447 | 1.069045 | 0.850645 | 0.222447 |
| 1000000 | 78492 | 73.629716 | 161.719250 | 0.455293 | 1.069045 | 0.850645 | 0.427645 |
| 2000000 | 148927 | 96.315625 | 222.787461 | 0.432321 | 1.069045 | 0.850645 | 0.148046 |
| 4000000 | 283140 | 322.546274 | 307.197899 | 1.049962 | 1.121040 | 0.850645 | 1.069600 |
| 8000000 | 539771 | 311.735315 | 424.115829 | 0.735024 | 1.428432 | 0.850645 | -0.036972 |

Endpoint controls, 15 seeds:

| control | labels range | final Z range | final |Z| range | max |Z| range | raw theta range |
| --- | ---: | ---: | ---: | ---: | ---: |
| cramer | 335737..337582 | -2.730755..1.644526 | 0.215701..2.730755 | 1.073587..3.110663 | 0.191997..0.999295 |
| wRandom | 539169..541177 | -1.239943..1.490885 | 0.014044..1.490885 | 1.235291..2.403408 | 0.245361..0.721253 |
| wComposite | 362782..364244 | -1.729217..0.891807 | 0.031068..1.729217 | 1.289472..2.667986 | 0.067368..0.901829 |

Holdout range: (4000000, 8000000]

| holdout | labels | Z / range | max |Z| range |
| --- | ---: | ---: | ---: |
| real | 256631 | -0.036972 | 10.842907 |
| cramer | 159456..160773 | -2.292961..2.048012 | 7.504108..9.283753 |
| wRandom | 256286..257401 | -1.040755..1.407835 | 9.628198..11.578603 |
| wComposite | 176842..178108 | -2.213786..1.226753 | 7.849359..9.808937 |

Named composite checks:

| n | prime input? | W-eligible? | phase | centered | one-step Z |
| ---: | --- | --- | ---: | ---: | ---: |
| 25 | no | no | -1.000000 | NA | NA |
| 35 | no | no | 0.818182 | NA | NA |
| 77 | no | no | 0.529412 | NA | NA |
| 289 | no | yes | -1.000000 | -1.000000 | -1.573133 |

## Function-field note

No coordinate-free finite-field square phase was used: inside a fixed degree shell every monic polynomial has the same norm, and ordering lower coefficients would reintroduce the coefficient-ordering artifact.

SVG: `logs/playground-artifacts/square-phase-prime-drift-8000000.svg`
JSON: `logs/playground-artifacts/square-phase-prime-drift-8000000.json`