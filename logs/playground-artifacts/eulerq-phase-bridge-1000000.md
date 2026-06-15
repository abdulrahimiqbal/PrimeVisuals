# Base-2 Euler quotient phase bridge audit

Candidate: for labels n, score exp(2*pi*i*EQ_2(n)/n), where EQ_2(n)=((2^phi(n)-1)/n) mod n.

Range: 1000000. Seeds: 12345, 271828, 314159, 161803, 424242.

## Endpoint trace

| N | count | real terminal/sqrt | real max/sqrt | random phase max/sqrt | Cramer max/sqrt | W210 max/sqrt | composite max/sqrt |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 62500 | 6274 | 0.622576 | 0.797969 | 0.769351..1.633251 | 0.554081..1.082200 | 0.490283..1.479835 | 0.671238..1.194713 |
| 125000 | 11733 | 0.760952 | 1.131153 | 0.864864..1.759192 | 0.625163..1.150007 | 0.705611..1.917100 | 0.911779..1.192504 |
| 250000 | 22043 | 1.254296 | 1.500294 | 0.832835..1.336947 | 0.838001..1.568945 | 0.723408..2.189204 | 0.754871..1.417248 |
| 500000 | 41537 | 0.291695 | 1.166445 | 0.606704..1.633831 | 1.082562..1.552773 | 0.743033..1.604782 | 0.540599..1.122984 |
| 1000000 | 78497 | 0.279583 | 0.848507 | 0.681549..1.739726 | 1.027797..1.583906 | 0.623876..1.166718 | 0.840627..1.675023 |

## Block normalized values

| block | count | real | random phase | Cramer | W210 | composite |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| (1, 62500] | 6274 | 0.622576 | 0.769351..1.542294 | 0.340297..0.858920 | 0.324826..1.308577 | 0.395260..1.194713 |
| (62500, 125000] | 5459 | 1.019882 | 0.354449..1.531316 | 0.575666..1.021076 | 0.389960..1.713490 | 0.361968..0.879146 |
| (125000, 250000] | 10310 | 1.207643 | 0.514017..1.366736 | 0.555564..1.728229 | 0.293200..1.442259 | 0.468231..1.618358 |
| (250000, 500000] | 19494 | 1.510745 | 0.116883..1.576218 | 0.779086..1.910823 | 0.320950..1.603596 | 0.262350..1.131558 |
| (500000, 1000000] | 36960 | 0.225344 | 0.669512..1.487488 | 0.593237..1.581942 | 0.431002..1.393154 | 0.422625..1.323969 |

## Summary

Real maxMag theta: `0.477861`.
Endpoint random-phase max/sqrt range: `0.681549..1.739726`.
Endpoint Cramer max/sqrt range: `1.027797..1.583906`.
Endpoint W210 max/sqrt range: `0.623876..1.166718`.
Endpoint composite max/sqrt range: `0.840627..1.675023`.

Named composite check:

| n | EQ_2(n) | phase x | phase y |
| ---: | ---: | ---: | ---: |
| 25 | 18 | -0.187381 | -0.982287 |
| 35 | 24 | -0.393025 | -0.919528 |
| 77 | 75 | 0.986712 | -0.162476 |

## Factor check

The construction does not algebraically telescope to psi/M, but it is a modular quotient distribution problem. A prime-specific claim requires real prime phases to beat random phases and Euler-quotient composite labels. If composites or density-matched labels reproduce the bridge scale, this is not a critical line.

## Files

- JSON: `logs/playground-artifacts/eulerq-phase-bridge-1000000.json`
- SVG: `logs/playground-artifacts/eulerq-phase-bridge-1000000.svg`