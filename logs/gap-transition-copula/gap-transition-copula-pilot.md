# Deep-admissible prime-gap transition copula — pilot

This is an exploratory pilot under
`logs/gap-transition-copula/PREREGISTRATION.md`. It cannot be promoted as a
discovery.

Primary statistic: lag-one correlation of cross-fitted PIT ranks after a
shrunk transition-class mean modulo `W` is removed.

- maximum endpoint: 2000000
- endpoints: 500000, 1000000, 2000000
- cutoffs: 29, 97
- wheels: 30, 210
- seeds: 12
- pilot lead gate: FAIL

| B | endpoint | W | pairs | unseen frac | raw rank corr | transition-adjusted corr | same-B fake range | rough-composite range | order-shuffle range | strict |z| | support |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 29 | 500000 | 30 | 19493 | 0.0000 | 0.0000649 | -0.0143224 | -0.0185649..0.0046288 | -0.0190557..0.0050366 | -0.0142051..0.0122723 | 1.00 | FAIL |
| 29 | 500000 | 210 | 19493 | 0.0106 | 0.0000649 | -0.0083503 | -0.0121179..0.0084430 | -0.0211673..0.0048273 | -0.0100127..0.0205164 | 0.14 | FAIL |
| 29 | 1000000 | 30 | 36959 | 0.0000 | -0.0069064 | -0.0170311 | -0.0140807..0.0010920 | -0.0287890..0.0047772 | -0.0096136..0.0099542 | 1.01 | PASS |
| 29 | 1000000 | 210 | 36959 | 0.0074 | -0.0069064 | -0.0143011 | -0.0134380..0.0017621 | -0.0336993..0.0014444 | -0.0105036..0.0046706 | 0.28 | PASS |
| 29 | 2000000 | 30 | 70433 | 0.0000 | -0.0148766 | -0.0209488 | -0.0108485..0.0001768 | -0.0126938..0.0039074 | -0.0060059..0.0089348 | 3.77 | PASS |
| 29 | 2000000 | 210 | 70433 | 0.0046 | -0.0148766 | -0.0254121 | -0.0135442..-0.0049929 | -0.0176990..-0.0058052 | -0.0055399..0.0054194 | 4.86 | PASS |
| 97 | 500000 | 30 | 19493 | 0.0000 | 0.0172128 | 0.0084540 | -0.0071573..0.0068345 | -0.0293101..0.0076676 | -0.0133748..0.0062524 | 1.41 | FAIL |
| 97 | 500000 | 210 | 19493 | 0.0106 | 0.0172128 | 0.0127947 | -0.0047895..0.0072503 | -0.0266801..0.0056734 | -0.0142286..0.0108393 | 1.76 | FAIL |
| 97 | 1000000 | 30 | 36959 | 0.0000 | -0.0009043 | -0.0069169 | -0.0118418..0.0087308 | -0.0140630..0.0093837 | -0.0045375..0.0073002 | 0.82 | PASS |
| 97 | 1000000 | 210 | 36959 | 0.0074 | -0.0009043 | -0.0033129 | -0.0115464..0.0083736 | -0.0120192..0.0081185 | -0.0129570..0.0047057 | 0.35 | PASS |
| 97 | 2000000 | 30 | 70433 | 0.0000 | -0.0065014 | -0.0073693 | -0.0073451..0.0032459 | -0.0121169..0.0074543 | -0.0088605..0.0061707 | 1.07 | PASS |
| 97 | 2000000 | 210 | 70433 | 0.0046 | -0.0065014 | -0.0081227 | -0.0093294..0.0008924 | -0.0170121..0.0055617 | -0.0043660..0.0031539 | 0.63 | PASS |

Interpretation rule: a raw adjacent-gap correlation is already known
calibration. Only the transition-adjusted correlation, compared against every
listed control family, can trigger a confirmatory run.

JSON: `logs/gap-transition-copula/gap-transition-copula-pilot.json`
SVG: `logs/gap-transition-copula/gap-transition-copula-pilot.svg`
