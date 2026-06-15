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

Exponent fit after q<=97 correction: `0.344460`;
after q<=997: `0.750785`.

| block | prime predecessors | mean prime rank | prime aggregate | model q<=97 | corrected q<=97 | model q<=997 | corrected q<=997 | random range | composite range | Cramer range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| 1000000..2000000 | 70435 | 0.482318855 | -4.692504 | -4.828376 | 0.135873 | -4.721809 | 0.029305 | -0.238101 .. 0.090881 | 0.608759 .. 0.997222 | -2.806968 .. -2.466145 |
| 2000000..4000000 | 134213 | 0.482918489 | -6.257827 | -6.351120 | 0.093293 | -6.193502 | -0.064326 | -0.120613 .. 0.194847 | 0.654142 .. 1.319039 | -3.409598 .. -2.997037 |
| 4000000..8000000 | 256631 | 0.484062012 | -8.073987 | -8.382554 | 0.308567 | -8.152806 | 0.078819 | -0.320300 .. 0.118064 | 1.205827 .. 1.808897 | -4.653685 .. -4.120455 |
| 8000000..16000000 | 491353 | 0.484495012 | -10.868466 | -11.060233 | 0.191767 | -10.729944 | -0.138521 | -0.249841 .. 0.157373 | 1.495506 .. 1.818733 | -6.092571 .. -5.433514 |

## Tail radical rank

Exponent fit after q<=97 correction: `1.684006`;
after q<=997: `1.073667`.

| block | prime predecessors | mean prime rank | prime aggregate | model q<=97 | corrected q<=97 | model q<=997 | corrected q<=997 | random range | composite range | Cramer range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| 1000000..2000000 | 70435 | 0.453283179 | -12.398454 | -12.396880 | -0.001574 | -12.404063 | 0.005609 | -0.916805 .. -0.005664 | 1.852176 .. 2.142573 | -7.326566 .. -6.398474 |
| 2000000..4000000 | 134213 | 0.453352539 | -17.089340 | -17.128288 | 0.038947 | -17.133011 | 0.043671 | -0.090642 .. 0.329880 | 2.358026 .. 3.063693 | -9.540165 .. -9.258491 |
| 4000000..8000000 | 256631 | 0.453292217 | -23.661584 | -23.699999 | 0.038416 | -23.702830 | 0.041246 | -0.144142 .. 0.207274 | 3.193340 .. 3.902247 | -13.389638 .. -12.682945 |
| 8000000..16000000 | 491353 | 0.453112883 | -32.866264 | -32.806101 | -0.060163 | -32.808097 | -0.058167 | -0.307080 .. 0.124911 | 4.415003 .. 4.945275 | -18.768329 .. -17.869983 |

## Artifacts

- JSON: `logs/playground-artifacts/predecessor-tail-rank-audit-16000000-b97-q997.json`
- SVG: `logs/playground-artifacts/predecessor-tail-rank-audit-16000000-b97-q997.svg`
