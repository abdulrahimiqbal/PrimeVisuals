# Sieve-conditioned interaction defect — calibration pilot

This is the preregistered exploratory pilot. It cannot be promoted as a
discovery. Definitions and gates were frozen in
`logs/local-global-defect/PREREGISTRATION.md` before this run.

## Summary

- points: 18
- support-passing points: 17
- scoreable points: 17
- exploratory points with strict control z >= 4: 11
- quick mode: true
- control seeds: 3

## Flow points

| universe | scale | shape | local depth | eligible centers | real 111 | tau | real SCID | eligible-random range | composite range | strict z | support |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Z | N=100000 | A | p<=5 | 13316 | 421 | 1.3219 | 0.00053812 | 0.00002508..0.00018083 | 0.00001915..0.00015592 | 5.494 | PASS |
| Z | N=100000 | B | p<=5 | 13308 | 397 | 1.3219 | 0.00075700 | 0.00001950..0.00018262 | 0.00002000..0.00006344 | 7.591 | PASS |
| Z | N=100000 | C | p<=5 | 13308 | 409 | 1.3219 | 0.00071969 | 0.00001832..0.00012870 | 0.00001689..0.00007196 | 11.270 | PASS |
| Z | N=100000 | A | p<=11 | 5533 | 421 | 2.2001 | 0.00012361 | 0.00005142..0.00029646 | 0.00008927..0.00021671 | -0.250 | PASS |
| Z | N=100000 | B | p<=11 | 5530 | 397 | 2.2001 | 0.00048399 | 0.00009046..0.00047073 | 0.00018422..0.00045009 | 1.196 | PASS |
| Z | N=100000 | C | p<=11 | 5530 | 409 | 2.2001 | 0.00025379 | 0.00005098..0.00028232 | 0.00009249..0.00050142 | -0.069 | PASS |
| Z | N=200000 | A | p<=5 | 26652 | 661 | 1.3217 | 0.00085153 | 0.00002976..0.00010476 | 0.00002911..0.00006167 | 20.363 | PASS |
| Z | N=200000 | B | p<=5 | 26644 | 683 | 1.3217 | 0.00077533 | 0.00004000..0.00007813 | 0.00005084..0.00008637 | 33.703 | PASS |
| Z | N=200000 | C | p<=5 | 26644 | 665 | 1.3217 | 0.00077037 | 0.00004826..0.00007092 | 0.00005474..0.00006012 | 57.017 | PASS |
| Z | N=200000 | A | p<=11 | 11075 | 661 | 2.1999 | 0.00042301 | 0.00000499..0.00012505 | 0.00009009..0.00015153 | 5.990 | PASS |
| Z | N=200000 | B | p<=11 | 11072 | 683 | 2.1999 | 0.00021499 | 0.00002549..0.00011914 | 0.00006684..0.00021351 | 1.165 | PASS |
| Z | N=200000 | C | p<=11 | 11072 | 665 | 2.1999 | 0.00032833 | 0.00002854..0.00005411 | 0.00009571..0.00027506 | 1.616 | PASS |
| F_2[t] | degree=14 | A | deg(P)<=1 | 4096 | 53 | 1.3863 | 0.00330697 | 0.00016540..0.00060011 | 0.00062300..0.00086385 | 12.739 | PASS |
| F_2[t] | degree=14 | B | deg(P)<=1 | 4096 | 84 | 1.3863 | 0.00293535 | 0.00041566..0.00063508 | 0.00057450..0.00133129 | 5.057 | PASS |
| F_2[t] | degree=14 | C | deg(P)<=1 | 4096 | 118 | 1.3863 | 0.00480857 | 0.00001121..0.00129873 | 0.00033460..0.00044371 | 6.304 | PASS |
| F_2[t] | degree=14 | A | deg(P)<=2 | 1024 | 53 | 2.7726 | 0.00124000 | 0.00017541..0.00100658 | 0.00021709..0.00099981 | 1.087 | FAIL |
| F_2[t] | degree=14 | B | deg(P)<=2 | 2048 | 84 | 2.0794 | 0.00490652 | 0.00012791..0.00068719 | 0.00026668..0.00101643 | 11.169 | PASS |
| F_2[t] | degree=14 | C | deg(P)<=2 | 2048 | 118 | 2.0794 | 0.00161397 | 0.00034747..0.00111511 | 0.00016781..0.00203909 | 0.724 | PASS |

## Interpretation rule

No row above is discovery evidence. The pilot is used only to check support,
runtime, finite-sample entropy bias, and whether the frozen confirmatory ladder
is feasible. Any apparent effect must survive the separately frozen
confirmatory scales, primary-source novelty audit, factor/local-product check,
and expert attack.

JSON: `logs/local-global-defect/scid-pilot-quick.json`
SVG: `logs/local-global-defect/scid-pilot-quick.svg`
