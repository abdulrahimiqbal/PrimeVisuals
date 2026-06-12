# 2026-06-12 Zero Spectrum Hunt

## Goal

Recover the Riemann-zero spectrum from raw primes by computing
`F(x)=psi(x)-x`, resampling `F(e^u)/e^(u/2)` on a uniform log grid, and
detecting peaks with a Hann-windowed DFT. Use bundled `ZEROS` only as
ground truth after the raw-prime computation. If calibration succeeds,
run controls and point the same spectrometer at twin primes and primes of
the form `n^2+1`, with mundane explanations checked before any novelty
claim.

## Plan

1. Implement `scripts/spectrum.mjs` using `src/core/math.js` raw-prime
   helpers for all arithmetic inputs. Keep zeta and `ZEROS` out of the
   computation path, importing `ZEROS` only in explicit check/report code.
2. Add tests for the sieve/psi resampling pipeline, Hann DFT peak
   detection, Cramer controls, and zero matching.
3. Run Phase A over `10^4..10^7` first. If it misses the required first
   20 zeros, debug before proceeding.
4. Run Phase B controls: Cramer seeds, shifted windows, and amplitude
   falloff.
5. Run Phase C for twin primes and `n^2+1` prime values, estimating the
   residual normalization exponent before testing peak stability.

## Implementation checkpoint

Added `scripts/spectrum.mjs` with importable spectrum functions and CLI
commands (`phase-a`, `controls`, `hunt`, `all`). Added
`tests/spectrum.test.js` covering step sampling, fake-prime power events,
synthetic frequency detection, finite-range log-slope fitting, and a
small raw-prime `psi` calibration.

Verification:

- `npx vitest run tests/spectrum.test.js` -> 5 passed.
- `npx vitest run tests/math.test.js tests/stats.test.js tests/engine.test.js tests/explore.test.js tests/metrics.test.js tests/anomaly.test.js tests/spectrum.test.js --environment node` -> 99 passed.
- `npm test` is currently blocked before most tests execute by the repo's
  existing default `jsdom` environment:
  `ERR_REQUIRE_ESM` from `html-encoding-sniffer` requiring
  `@exodus/bytes/encoding-lite.js`. The new spectrum tests avoid this by
  using Vitest's node environment annotation.

## Phase A calibration

Command:

```sh
node --max-old-space-size=4096 scripts/spectrum.mjs phase-a --xMax=10000000 --samples=4096 --top=35 --outDir=logs/zero-spectrum-hunt-artifacts
node --max-old-space-size=4096 scripts/spectrum.mjs phase-a --xMax=100000000 --samples=8192 --top=35 --outDir=logs/zero-spectrum-hunt-artifacts
```

`10^4..10^7`: resolution `Delta gamma = 0.909584`. The top 35 detected
Hann-DFT peaks all matched bundled zero entries within the resolution, but
the close pairs around `59.35/60.83` and `75.70/77.14` partially merge at
this shorter span.

⭐ INTERESTING — calibration succeeds from raw primes at `10^8`. With
`10^4..10^8`, `8192` log samples, and no zero data in the computation
path, the first 20 ranked peaks match zeros 1-20 one-for-one within
`Delta gamma = 0.682188`. Match counts for the top 35 ranked peaks:
`matched=35`, `missed=0`, `spurious=0`. Artifact files:
`logs/zero-spectrum-hunt-artifacts/phase-a.json` and
`logs/zero-spectrum-hunt-artifacts/phase-a.svg`.

First 20 extended-range peak matches:

| rank | peak gamma | zero | zero gamma | abs error | amp | amp/(2/|rho|) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 14.155405 | 1 | 14.134737 | 0.020668 | 0.141821 | 1.002925 |
| 2 | 21.034135 | 2 | 21.022049 | 0.012086 | 0.094652 | 0.995168 |
| 3 | 25.013566 | 3 | 25.010860 | 0.002706 | 0.079745 | 0.997443 |
| 4 | 30.414223 | 4 | 30.424878 | 0.010655 | 0.065479 | 0.996233 |
| 5 | 32.972429 | 5 | 32.935078 | 0.037351 | 0.059877 | 0.986147 |
| 6 | 37.577199 | 6 | 37.586201 | 0.009002 | 0.053355 | 1.002787 |
| 7 | 40.931291 | 7 | 40.918733 | 0.012558 | 0.049139 | 1.005427 |
| 8 | 43.318949 | 8 | 43.327087 | 0.008138 | 0.045607 | 0.988073 |
| 9 | 47.980568 | 9 | 48.005163 | 0.024595 | 0.040307 | 0.967520 |
| 10 | 49.799737 | 10 | 49.773810 | 0.025927 | 0.040255 | 1.001877 |
| 11 | 52.983282 | 11 | 52.970309 | 0.012973 | 0.036705 | 0.972171 |
| 12 | 56.451072 | 12 | 56.446269 | 0.004803 | 0.035622 | 1.005406 |
| 13 | 59.350371 | 13 | 59.347017 | 0.003354 | 0.034596 | 1.026609 |
| 14 | 60.828446 | 14 | 60.831751 | 0.003305 | 0.032887 | 1.000321 |
| 15 | 65.148971 | 15 | 65.112574 | 0.036397 | 0.031562 | 1.027570 |
| 16 | 67.081837 | 16 | 67.079787 | 0.002050 | 0.029212 | 0.979803 |
| 17 | 69.526345 | 17 | 69.546380 | 0.020035 | 0.028673 | 0.997091 |
| 18 | 72.084551 | 18 | 72.067093 | 0.017458 | 0.027719 | 0.998853 |
| 19 | 75.722888 | 19 | 75.704666 | 0.018222 | 0.026475 | 1.002151 |
| 20 | 77.087264 | 20 | 77.144819 | 0.057555 | 0.026227 | 1.011666 |

## Phase B controls

Commands:

```sh
node --max-old-space-size=4096 scripts/spectrum.mjs controls --xMax=100000000 --samples=4096 --top=20 --outDir=logs/zero-spectrum-hunt-artifacts
node --max-old-space-size=4096 scripts/spectrum.mjs controls --xMax=10000000 --samples=2048 --top=20 --seeds=1000003,1007922,1015841,1023760,1031679,1039598,1047517,1055436,1063355,1071274,1079193,1087112,1095031,1102950,1110869,1118788,1126707,1134626,1142545,1150464,1158383,1166302,1174221,1182140,1190059 --outDir=logs/zero-spectrum-hunt-artifacts/cramer-25seed
```

Window shifts passed the calibration sanity check. Equal-length log
windows `[10^4,10^7]`, `[31622.7766,31622776.6017]`, and
`[10^5,10^8]` keep the first zero peaks at the same frequencies within
the shared `Delta gamma = 0.909584` resolution. Example: the first three
peaks remain `14.098556`, `21.034135`, and `25.013566` in all three
windows.

Amplitude check passed for the real-prime calibration. In the
`10^4..10^8` run, the first 20 peak amplitudes match the expected
`2/|rho|` coefficient scale with ratios from about `0.9675` to `1.0276`.

⭐ INTERESTING — Cramer control is not literally flat for cumulative
`psi` residuals. With five seeds at `10^8`, the fake-prime cumulative
walk shows broad colored low-frequency energy and some coincidental
local-maximum clusters when clustering only by frequency. This is a
control warning: the cumulative Cramer residual behaves like a continuous
random walk spectrum, not white amplitude noise.

The stronger 25-seed run at `10^7` had `stableAllSeeds=[]`; its averaged
zeta-range peaks were small compared with the real calibration. Example
seed-averaged amplitudes: near zero 2, `gamma=21.147833` had amplitude
`0.015795` versus the real `0.094221` at the same `10^7` span; near zero
15, `gamma=65.148971` had amplitude `0.015681` versus real `0.031241`.
Conclusion: Cramer does not reproduce the ordered zeta ladder, but it does
produce colored finite-window artifacts. Phase C must reject any candidate
peak that also appears in the Cramer analog or resembles this broad
background.

## Phase C hunt

Command:

```sh
node --max-old-space-size=4096 scripts/spectrum.mjs hunt --xMax=100000000 --samples=8192 --cramerSamples=4096 --top=25 --outDir=logs/zero-spectrum-hunt-artifacts
```

Screenshots generated from the SVG artifacts:

- `logs/zero-spectrum-hunt-artifacts/phase-a.png`
- `logs/zero-spectrum-hunt-artifacts/twin-full.png`
- `logs/zero-spectrum-hunt-artifacts/n2plus1-full.png`
- `logs/zero-spectrum-hunt-artifacts/cramer-twin-avg.png`
- `logs/zero-spectrum-hunt-artifacts/cramer-n2plus1-avg.png`
- `logs/zero-spectrum-hunt-artifacts/cramer-25seed/cramer-avg.png`

### Twin primes

Weighted event count through `10^8`: `440312` twin starts `p` with
`p+2` prime. Fitted Hardy-Littlewood-shape coefficient for
`c*x/log(x)`:

| xMax | c | max residual | rms residual |
| ---: | ---: | ---: | ---: |
| 25000000 | 1.415979 | 6676.272698 | 1845.668401 |
| 50000000 | 1.409659 | 13018.002683 | 3387.336544 |
| 100000000 | 1.404239 | 17524.924411 | 5496.878457 |

Finite-range normalization estimate: `theta_max=0.696147`,
`theta_rms=0.787235`; I used `theta=0.696147` for the spectra. This is
higher than a naive square-root expectation and is probably contaminated
by finite-range drift in the empirically fitted main term.

Top full-range peaks after normalization:

| rank | gamma | amp | label |
| ---: | ---: | ---: | --- |
| 1 | 0.284245 | 0.044704 | residue `1/46+0` |
| 2 | 10.517068 | 0.008607 | unmatched |
| 3 | 7.049278 | 0.008025 | residue `2/19+1` |
| 4 | 5.059562 | 0.007510 | unmatched |
| 5 | 8.356805 | 0.004074 | residue `1/3+1` |
| 6 | 13.302669 | 0.003731 | residue `2/19+2` |
| 7 | 17.225251 | 0.003325 | unmatched |
| 8 | 25.638906 | 0.003230 | zeta zero 3 |

Mundane explanations dominate. The strongest peaks are residue-catalog
aliases or low-frequency leakage. The unmatched `gamma≈10.52` persists
across `2.5e7`, `5e7`, and `1e8`, but it does not sharpen and the Cramer
twin analog has a nearby unmatched average peak at `10.829737` plus an
all-five-seed cluster around `10.471589`. Verdict: no new spectrum.

### Primes of the form n^2+1

Weighted event count through `10^8`: `841` values of `n^2+1` prime.
Fitted Bateman-Horn-shape coefficient for `c*sqrt(x)`:

| xMax | c | max residual | rms residual |
| ---: | ---: | ---: | ---: |
| 25000000 | 1.357556 | 182.599879 | 63.075562 |
| 50000000 | 1.375942 | 218.860387 | 75.985874 |
| 100000000 | 1.367063 | 263.969376 | 85.590065 |

Finite-range normalization estimate: `theta_max=0.265842`,
`theta_rms=0.220181`; I used `theta=0.265842`. This is near the
random-sparse-count heuristic `theta≈1/4`, but the data set has only 841
events, so this exponent is a measurement target rather than a conclusion.

Top full-range peaks after normalization:

| rank | gamma | amp | label |
| ---: | ---: | ---: | --- |
| 1 | 0.966433 | 1.888567 | residue `2/11+0` |
| 2 | 6.594486 | 0.324264 | residue `1/46+1` |
| 3 | 3.183545 | 0.309592 | residue `1/2+0` |
| 4 | 8.413654 | 0.255113 | residue `1/3+1` |
| 5 | 5.173260 | 0.231533 | unmatched |
| 6 | 17.509497 | 0.187582 | unmatched |
| 7 | 14.894442 | 0.174065 | residue `7/19+2` |
| 8 | 31.721750 | 0.114969 | residue `1/46+5` |

⭐ INTERESTING — graveyard candidate, not a breakthrough. The
`n^2+1` spectrum has an unmatched `gamma≈17.51` peak that persists under
range growth (`17.466574`, `17.520520`, `17.509497`) and under shifted
equal-length windows (`17.509` in all three checked windows). It fails the
breakthrough bar because the Cramer `n^2+1` analog has nearby unexplained
background peaks (`18.077987` in the averaged analog, and a support-4
cluster near `17.076023`). It is therefore more likely sparse-count
window/Cramer background than new arithmetic spectrum.

### Ranked graveyard

1. `n^2+1`, `gamma≈17.51`: survives range and window shifts; fails the
   Cramer-analog absence test.
2. Twin primes, `gamma≈10.52`: persists across range; fails Cramer analog
   and does not sharpen.
3. Twin/n^2+1 zeta-labeled peaks: inherited prime-subset structure, small
   and not novel.
4. Low-frequency and residue-catalog peaks: explained by residue aliases,
   fitted-main-term drift, and cumulative Cramer colored noise.

Breakthrough verdict: no `⭐⭐` finding. No Phase C peak satisfies all four
requirements: sharpen with range, absent from Cramer analog, unmatched to
zeta/residue, and shift-surviving.
