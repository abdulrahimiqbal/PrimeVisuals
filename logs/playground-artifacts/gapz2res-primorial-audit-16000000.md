# gapz2 high-primorial residual audit

Candidate: `G2res_W(x)=gapz2mean(x)-B_W(x)`, where `B_W` is the five-seed
fake-label baseline restricted to `gcd(n,W)=1`.

Preregistered confirmation: real residual stable and materially separated from
independent high-primorial controls; larger primorials do not erase it.

Preregistered break: residual shrinks or moves monotonically as `W` grows, or
high-primorial controls show comparable residuals.

## Last endpoint summary

| W | W/phi(W) | baseline mean at N=16000000 | real-baseline residual | seed baseline range |
| ---: | ---: | ---: | ---: | ---: |
| 9699690 | 5.847132 | 0.71255831 | -0.01962302 | 0.71095543..0.71435455 |
| 223092870 | 6.112911 | 0.70951905 | -0.01658375 | 0.70767477..0.71091125 |
| 6469693230 | 6.331229 | 0.70731701 | -0.01438172 | 0.70648369..0.70866909 |

## Residual paths

### W=9699690

| N | real mean | baseline mean | residual | seed baseline range |
| ---: | ---: | ---: | ---: | ---: |
| 1000000 | 0.63684562 | 0.66168612 | -0.02484050 | 0.65935679..0.66713036 |
| 2000000 | 0.65972915 | 0.67603113 | -0.01630198 | 0.67124983..0.68017586 |
| 4000000 | 0.67364079 | 0.68969791 | -0.01605712 | 0.68355757..0.69433263 |
| 8000000 | 0.68324628 | 0.70065659 | -0.01741031 | 0.69615446..0.70345862 |
| 16000000 | 0.69293530 | 0.71255831 | -0.01962302 | 0.71095543..0.71435455 |

### W=223092870

| N | real mean | baseline mean | residual | seed baseline range |
| ---: | ---: | ---: | ---: | ---: |
| 1000000 | 0.63684562 | 0.65545837 | -0.01861275 | 0.64996477..0.65955775 |
| 2000000 | 0.65972915 | 0.67210702 | -0.01237787 | 0.66731335..0.67753754 |
| 4000000 | 0.67364079 | 0.68607545 | -0.01243466 | 0.68335840..0.68855913 |
| 8000000 | 0.68324628 | 0.69767827 | -0.01443198 | 0.69560173..0.70046937 |
| 16000000 | 0.69293530 | 0.70951905 | -0.01658375 | 0.70767477..0.71091125 |

### W=6469693230

| N | real mean | baseline mean | residual | seed baseline range |
| ---: | ---: | ---: | ---: | ---: |
| 1000000 | 0.63684562 | 0.65308508 | -0.01623945 | 0.65015506..0.66029123 |
| 2000000 | 0.65972915 | 0.67046723 | -0.01073808 | 0.66585349..0.67644383 |
| 4000000 | 0.67364079 | 0.68437735 | -0.01073656 | 0.68142983..0.68737325 |
| 8000000 | 0.68324628 | 0.69519946 | -0.01195317 | 0.69346783..0.69665025 |
| 16000000 | 0.69293530 | 0.70731701 | -0.01438172 | 0.70648369..0.70866909 |

SVG: `logs/playground-artifacts/gapz2res-primorial-audit-16000000.svg`
JSON: `logs/playground-artifacts/gapz2res-primorial-audit-16000000.json`
