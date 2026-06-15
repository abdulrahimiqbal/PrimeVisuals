# function-field factor-shape audit

Candidate:
leave direct companion-prime counting. For an additive constant orbit,
condition on the mate being reducible/composite and measure only its factor
fragmentation

`split(g)=1-sum_i (deg factor_i / deg g)^2`

in F_q[t], transported to integers as
`1-sum_i (log p_i / log n)^2` with prime factors counted with
multiplicity. The finite-field null is the exact all-monic reducible shell.
The integer null is the deterministic W=30030 local center
shell, also conditioned on composite mates.

## Integer side

Real theta: `1.033212`.

| N | prime centers | composite mates | real mean split | W-local null mean | real z | W-fake z range | W-composite z range | Cramer z range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 500000 | 41370 | 210323 | 0.493153 | 0.491118 | 5.539322 | -0.482058..0.861822 | -4.979193..-3.608187 | -9.064164..-6.901826 |
| 1000000 | 78330 | 402036 | 0.493182 | 0.491042 | 7.976364 | -0.871532..1.044583 | -6.292025..-4.929965 | -12.454059..-9.307082 |
| 2000000 | 148765 | 769838 | 0.493140 | 0.491062 | 10.627009 | -1.120743..1.591745 | -7.597765..-5.753258 | -15.175765..-12.984346 |
| 4000000 | 282978 | 1475958 | 0.493341 | 0.491093 | 15.787474 | -1.924970..2.613582 | -10.738893..-8.157526 | -19.958423..-18.090966 |
| 8000000 | 539609 | 2834639 | 0.493384 | 0.491172 | 21.378472 | -1.667971..2.242923 | -12.577774..-10.545819 | -26.567175..-24.088176 |

Rough-center null diagnostics for the real prime centers:

| center coprime to primes <= | null mate cells | endpoint null mean | real mean split | endpoint z | z trace |
| ---: | ---: | ---: | ---: | ---: | --- |
| 13 | 8046409 | 0.491172 | 0.493384 | 21.378472 | 5.54, 7.98, 10.63, 15.79, 21.38 |
| 31 | 6422441 | 0.492433 | 0.493384 | 9.187508 | 1.62, 2.88, 3.87, 6.57, 9.19 |
| 97 | 5061181 | 0.493061 | 0.493384 | 3.126492 | 0.37, 1.04, 0.95, 2.41, 3.13 |
| 257 | 4221466 | 0.493238 | 0.493384 | 1.414119 | 0.26, 0.56, 0.40, 1.31, 1.41 |

Named composite centers:

| center | W-coprime | composite mates in orbit | mean split |
| ---: | --- | ---: | ---: |
| 25 | no | 3 | 0.531049 |
| 35 | no | 2 | 0.537281 |
| 77 | no | 3 | 0.527676 |
| 289 | yes | 5 | 0.474694 |

## Function fields

F_3[t] theta: `0.963295`

| degree | irreducible centers | reducible mates | real mean split | all-reducible mean | real z | cumulative z | rough center rule | monic-center z range | reducible-center z range | rough-center z range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | ---: | ---: | ---: |
| 8 | 810 | 1548 | 0.567406 | 0.518323 | 10.756697 | 10.756697 | <=3 (981) | -2.041259..1.287003 | -2.697464..-0.128213 | 10.499841..11.361325 |
| 9 | 2184 | 4158 | 0.565942 | 0.514992 | 18.150138 | 21.097304 | <=3 (3048) | -2.228326..2.022139 | -4.053437..-1.178863 | 16.723512..17.875129 |
| 10 | 5880 | 11328 | 0.556367 | 0.512065 | 25.828471 | 33.261537 | <=4 (7056) | -0.944740..1.875901 | -4.457148..-1.081647 | 25.515201..27.463771 |
| 11 | 16104 | 31038 | 0.552337 | 0.510068 | 40.542933 | 52.364330 | <=4 (21672) | -2.397613..1.490450 | -5.337804..-1.631636 | 39.411262..41.493255 |

F_5[t] theta: `1.023349`

| degree | irreducible centers | reducible mates | real mean split | all-reducible mean | real z | cumulative z | rough center rule | monic-center z range | reducible-center z range | rough-center z range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | ---: | ---: | ---: |
| 4 | 150 | 510 | 0.541667 | 0.523684 | 2.859956 | 2.859956 | <=1 (205) | -0.753718..1.375079 | -3.285065..-0.271017 | 2.861763..4.411566 |
| 5 | 624 | 2104 | 0.545247 | 0.518513 | 7.954984 | 8.426000 | <=1 (1024) | -2.047447..1.918441 | -2.694478..-0.978337 | 5.801604..7.269649 |
| 6 | 2580 | 9280 | 0.532148 | 0.512521 | 11.635912 | 14.168159 | <=2 (3400) | -1.398884..1.841723 | -4.715047..-1.623104 | 12.959584..14.292021 |
| 7 | 11160 | 40080 | 0.531223 | 0.509627 | 25.851698 | 29.473483 | <=2 (17160) | -2.023789..1.556185 | -5.856071..-3.293799 | 24.937767..26.649481 |

SVG: `logs/playground-artifacts/function-field-factor-shape-8000000.svg`
JSON: `logs/playground-artifacts/function-field-factor-shape-8000000.json`
