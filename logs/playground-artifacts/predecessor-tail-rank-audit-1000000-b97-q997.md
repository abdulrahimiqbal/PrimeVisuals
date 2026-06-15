# AP-scrubbed predecessor large-prime tail rank audit

Candidate:
strip all prime factors `q<=97` from even `n`, rank the remaining
large-prime tail features in each block, and compare prime predecessors
`n=p-1` against AP-product weighted nulls.

Features:

- `omegaTail = omega(tail_97(n))`
- `radTail = log(rad(tail_97(n)))/log(n)`

Aggregates:
`sqrt(#prime predecessors) * (mean prime rank - weighted model rank)`.

## Tail omega rank

Exponent fit after q<=97 correction: `1.789317`;
after q<=997: `1.141223`.

| block | prime predecessors | mean prime rank | prime aggregate | model q<=97 | corrected q<=97 | model q<=997 | corrected q<=997 | random range | composite range | Cramer range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| 100000..200000 | 8392 | 0.477048972 | -2.102495 | -2.066898 | -0.035596 | -2.039878 | -0.062617 | -0.018739 .. 0.157406 | 0.021256 .. 0.599290 | -1.063809 .. -0.947679 |
| 125000..250000 | 10310 | 0.477694413 | -2.264868 | -2.232452 | -0.032416 | -2.201555 | -0.063313 | -0.137262 .. 0.136578 | 0.240450 .. 0.614090 | -1.390913 .. -1.077838 |
| 250000..500000 | 19494 | 0.481243173 | -2.618845 | -2.854049 | 0.235204 | -2.807102 | 0.188257 | -0.151778 .. 0.174538 | 0.298560 .. 0.448566 | -1.613399 .. -1.128639 |
| 500000..1000000 | 36960 | 0.482703567 | -3.325236 | -3.689901 | 0.364665 | -3.618817 | 0.293581 | -0.240959 .. 0.384873 | 0.451285 .. 0.841684 | -2.324438 .. -1.596040 |

## Tail radical rank

Exponent fit after q<=97 correction: `-0.788499`;
after q<=997: `-0.725357`.

| block | prime predecessors | mean prime rank | prime aggregate | model q<=97 | corrected q<=97 | model q<=997 | corrected q<=997 | random range | composite range | Cramer range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| 100000..200000 | 8392 | 0.456075443 | -4.023835 | -4.261737 | 0.237903 | -4.272784 | 0.248949 | -0.627428 .. 0.155421 | 0.564836 .. 1.109705 | -2.457581 .. -2.098418 |
| 125000..250000 | 10310 | 0.454403678 | -4.629767 | -4.729313 | 0.099546 | -4.740579 | 0.110812 | -0.421495 .. 0.274969 | 0.678733 .. 1.363776 | -2.859158 .. -2.363701 |
| 250000..500000 | 19494 | 0.454116170 | -6.406342 | -6.515077 | 0.108735 | -6.526147 | 0.119804 | 0.005005 .. 0.508294 | 0.761467 .. 1.303687 | -4.152308 .. -3.218085 |
| 500000..1000000 | 36960 | 0.453586514 | -8.922985 | -8.976284 | 0.053298 | -8.985779 | 0.062793 | -0.283305 .. 0.217917 | 1.335864 .. 1.895259 | -5.277272 .. -4.601551 |

## Artifacts

- JSON: `logs/playground-artifacts/predecessor-tail-rank-audit-1000000-b97-q997.json`
- SVG: `logs/playground-artifacts/predecessor-tail-rank-audit-1000000-b97-q997.svg`
