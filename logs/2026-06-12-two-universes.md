# 2026-06-12 - Two-Universes Program, Sprint 1

Goal: build the function-field universe `F_q[t]` for `q=2,3`, calibrate exact
counts and first two-world statistics, then use the gap between `[F_q[t]]` and
`[Z]` as the object of study.

Input audit:
- Read `COUNCIL.md`, `MACHINE_HOW_TO_USE.md`, `KNOWLEDGE.md`, and `ROADMAP.md`.
- `COUNCIL.md` was pulled from GitHub `main` at commit `72d9c63` after the
  initial run. Its decision section makes the Two-Universes Program the primary
  bet, with success classes:
  - `S1`: a precisely characterized, replicable law holding in both universes.
  - `S2`: a precisely characterized divergence between the universes.
  - `S3`: an LO-S-class statistical phenomenon in either universe with an
    evidence pack.
- This sprint's completed divergence table therefore uses the council taxonomy
  directly: the `F_2[t]` gap autocorrelation row is an `S1` candidate, while
  the `F_3[t]` gap autocorrelation, `F_3[t]` spacing L1, and `F_2[t]` spacing
  L1 rows are `S2` candidates.

Theorem labels and citations:
- `[F_q[t]: THEOREM]` Weil proved the Riemann hypothesis for curves over finite
  fields; see Milne, "The Riemann Hypothesis over Finite Fields: From Weil to
  the Present Day", arXiv:1509.00797.
- `[F_q[t]: THEOREM with hypotheses]` Sawin-Shusterman, Annals of Mathematics
  196 (2022), 457-506, prove Chowla correlations and quantitative twin primes
  over `F_q[T]` under a simple size/characteristic condition. Their Theorem 1.3
  is odd characteristic and large enough `q`; examples include `F_{3^6}` for
  2-point Chowla. Their Theorem 1.1 for twins has a stronger large-`q`
  hypothesis. Therefore the current base-field runs over `F_3[t]` are
  `[F_3[t]: measured]` calibrations against the theorem shape, not theorem
  instances of those Annals hypotheses. `F_2[t]` is excluded by the odd
  characteristic condition.

Implementation batch:
- Added `src/core/ffield.js`.
- Representation: base-`q` integer encoding, coefficient of `t^i` in digit
  `i`; for `q=2`, this is a bitmask.
- Irreducibility: product-crossing polynomial Eratosthenes. For each target
  degree, previously found irreducibles cross off all monic products with
  monic quotients. This is not per-polynomial factoring.
- Polynomial Mobius: separate Eratosthenes pass over irreducible multiples and
  square multiples.
- Twin shifts: `h in {1,t,t+1}` via `t` encoded as `q`.
- Registry source: `polyprimes`, label `Polynomial primes F_q[t]`, with
  `x=integer encoding` and `y=degree` as the log analog.
- The registry degree control exposes the full `F_2[t]` support cap at
  degree 24; the source generator still clamps `F_3[t]` to degree 15.

Exact-count verification:

```json
{"cmd":"node scripts/two-universes-calibration.mjs logs/two-universes-artifacts 24 15 10000000",
 "artifact":"logs/two-universes-artifacts/calibration-summary.json",
 "pnt_max_delta":0,
 "F_2_degree_24":{"observed":698870,"exact":698870},
 "F_3_degree_15":{"observed":956576,"exact":956576}}
```

Scale note:
- `[F_2[t]: measured]` degree 24 build matched the exact formula in about
  10.8s in a direct scale check.
- `[F_3[t]: measured]` degree 15 now matches the exact formula in about
  26.6s after replacing the ternary product-crossing inner loop with a
  digit-state iterator. The original implementation took about 125s.

Calibration batch:

Artifacts:
- `logs/two-universes-artifacts/calibration-summary.json`
- `logs/two-universes-artifacts/calibration-summary.svg`
- `logs/two-universes-artifacts/calibration-summary.png`
- `logs/two-universes-artifacts/two-universes-comparison.svg`
- `logs/two-universes-artifacts/two-universes-comparison.png`
- `logs/two-universes-artifacts/polyprimes-shot.png`
- `logs/two-universes-artifacts/integer-extension-10000000.json`
- `logs/two-universes-artifacts/integer-extension-100000000.json`

PNT analog:
- `[F_q[t]: measured]` `# irreducibles(deg=n)` equals
  `[F_q[t]: THEOREM]` `(1/n) sum_{d|n} mu(d) q^(n/d)` for every generated row:
  `q=2, n<=24`; `q=3, n<=15`.

Chowla two-point:
- `[F_3[t]: measured]` fitted `log |C(h,n)|` slopes over nonzero rows through
  degree 15:
  - `h=1`: slope `-0.528104`, per-degree factor `0.589722`.
  - `h=t`: slope `-0.437555`, per-degree factor `0.645613`.
  - `h=t+1`: same as `h=t` in this run.
- `[Z: measured]` logarithmically weighted normalization
  `sum_{m<=N-h} mu(m)mu(m+h)/m / sum_{m<=N}1/m` at `N=10^7`:
  - `h=1`: `-0.0475573`
  - `h=2`: `-0.0384093`
  - `h=3`: `-0.0302006`
- GAP object: finite-field correlations decay quickly by degree in this
  measured base-field model, while the integer logarithmic averages at `10^7`
  are still visibly negative at the few-percent scale.
- `[Z: measured]` extension to `N=10^8` succeeded via
  `scripts/two-universes-integer-extension.mjs`, artifact
  `logs/two-universes-artifacts/integer-extension-100000000.json`. Final
  logarithmically weighted normalizations:
  - `h=1`: `-0.0417993`
  - `h=2`: `-0.0337572`
  - `h=3`: `-0.0265351`
- Comparison plot `logs/two-universes-artifacts/two-universes-comparison.png`
  places `[F_3[t]: measured]` degree on the same axis as `[Z: measured]`
  `log_3(N)` and shows the finite-field decay curves against the integer
  sample points. This is the explicit GAP plot for the two-universes object.

Twin densities:
- `[F_2[t]: measured]` shifts `1`, `t`, and `t+1` have local obstructions in
  the singular-series product at degree 24: predicted `0`, observed `0`.
- `[F_3[t]: measured]` degree 15 observed/predicted ratios using the truncated
  explicit singular-series product over irreducibles through degree 15:
  - `h=1`: observed `25555`, predicted `25260.726716`, ratio `1.011649`.
  - `h=t`: observed `50532`, predicted `50521.453432`, ratio `1.000209`.
  - `h=t+1`: observed `50532`, predicted `50521.453432`, ratio `1.000209`.
- `[Z: measured]` twin primes with `p+2<=N` against
  `[Z: conjecture]` `2*C2*integral_3^N dt/log(t)^2`:
  - `N=100000`: ratio `0.908187`
  - `N=300000`: ratio `0.930373`
  - `N=1000000`: ratio `0.951386`
  - `N=3000000`: ratio `0.974445`
  - `N=10000000`: ratio `0.985449`
  - `N=30000000`: ratio `0.988205`
- `N=100000000`: ratio `0.991897`
- The same comparison plot puts `[F_3[t]: measured]` twin ratios and
  `[Z: measured]` twin ratios on one aligned axis.

Visual QA:
- Rendered `calibration-summary.svg` to `calibration-summary.png` with
  Playwright.
- `shot` artifact produced with:
  `PV_URL=http://localhost:5174/ node scripts/explore.mjs shot '{"cfg":{"source":"polyprimes","plane":"graph","lens":"pulse","p":{"q":2,"deg":10}}}' logs/two-universes-artifacts/polyprimes-shot.png`
- In-app browser opened
  `http://localhost:5174/#v=eyJtb2RlIjoicGF0Y2giLCJjZmciOnsic291cmNlIjoicG9seXByaW1lcyIsInBsYW5lIjoiZ3JhcGgiLCJsZW5zIjoicHVsc2UiLCJwIjp7InEiOjIsImRlZyI6MTB9fSwiY2hpcHMiOnsieCI6W10sInkiOltdfSwicmVzaWR1YWwiOmZhbHNlLCJ0d2luTW9kZSI6InJlYWwifQ`
  and showed `F_2[t] - 226 monic irreducibles through degree 10 - I_10=99`.
  Browser console errors: none.

Divergence battery:

Script:
- `scripts/two-universes-divergence.mjs`

Artifacts:
- `logs/two-universes-artifacts/divergence-summary.json`
- `logs/two-universes-artifacts/divergence-summary.md`

Predeclared thresholds:
- Residue chi: `abs(z) > max(4, 2*matched_null_abs_z)`.
- Gap autocorrelation: `abs(lag1 z) > max(4, 2*matched_null_abs_z)`.
- Spacing histograms: L1 distance from `Exp(1)` must exceed matched null by
  `0.05`.
- Shared-law candidate: both universes strong, stable from smaller to larger
  range, same sign where signed, and within 50% relative scale.
- Divergence candidate: at least one universe strong and range-stable without
  satisfying the shared-law rule.

Run:

```json
{"cmd":"node scripts/two-universes-divergence.mjs logs/two-universes-artifacts 15 24",
 "q3_degree_pair":"14 -> 15",
 "q2_degree_pair":"23 -> 24",
 "null_seeds":[12345,271828,314159,161803,424242],
 "runtime":"2:15.20"}
```

Table:

| statistic | F_q[t] value | Z value | matched null | verdict |
| --- | ---: | ---: | --- | --- |
| `[F_3[t]: measured]` residue chi z, poly modulus degree 1; `[Z: measured]` modulus 3 | `-0.675771` | `-0.653785` | F null abs `0.555985`; Z null abs `0.791554` | noise |
| `[F_3[t]: measured]` residue chi z, poly modulus degree 2; `[Z: measured]` modulus 15 | `-1.787888` | `-1.759483` | F null abs `1.060238`; Z null abs `0.353326` | noise |
| `[F_3[t]: measured]` gap autocorrelation lag-1 z; `[Z: measured]` prime-gap lag-1 z | `-0.009527` | `-35.556953` | F null abs `0.004526`; Z null abs `4.071342` | ⭐ DIVERGENCE candidate |
| `[F_3[t]: measured]` normalized spacing L1 from Exp(1); `[Z: measured]` same | `0.297686` | `0.336751` | F null `0.226118`; Z null `0.330122` | ⭐ DIVERGENCE candidate |
| `[F_2[t]: measured]` gap autocorrelation lag-1 z; `[Z: measured]` prime-gap lag-1 z at `N=2^24` | `-38.674010` | `-37.397983` | F null abs `5.876399`; Z null abs `4.370919` | ⭐ SHARED-LAW candidate |
| `[F_2[t]: measured]` normalized spacing L1 from Exp(1); `[Z: measured]` same at `N=2^24` | `0.302540` | `0.334248` | F null `0.081317`; Z null `0.328576` | ⭐ DIVERGENCE candidate |

Interpretation:
- `[F_3[t]: measured]` has near-zero gap autocorrelation in degree/value order
  after matched polynomial Cramer nulling, while `[Z: measured]` prime gaps have
  strong negative lag-1 autocorrelation. This is the cleanest S2 divergence
  candidate in the first battery.
- `[F_3[t]: measured]` spacing L1 also clears the matched-null threshold at
  degree 15; the degree-13 run treated this row as noise.
- `[F_2[t]: measured]` and `[Z: measured]` both show strong negative lag-1 gap
  autocorrelation at the doubled range `2^23 -> 2^24`, making it an S1
  shared-law candidate. Because `F_2` sits outside the Sawin-Shusterman
  odd-characteristic condition, this is a measured structural lead rather than a
  theorem-side calibration claim.
- `[F_2[t]: measured]` spacing L1 is much larger than its matched polynomial
  null, while `[Z: measured]` is close to its integer Cramer null. The raw
  distances are similar, but the matched-null comparison makes this an S2
  divergence candidate.
- The full `F_3[t]` degree-pair `14 -> 15` run completed after `2:15.20`.

Tests:
- `npx vitest run tests/ffield.test.js --environment node`: 12 passed,
  including exact-formula verification through `q=2, n<=24` and
  `q=3, n<=15`.
- `npx vitest run tests/math.test.js tests/stats.test.js tests/ffield.test.js --environment node`: 84 passed.
- Fixed repo-level Vitest startup by making the default test environment
  `node`, moving the React smoke test to `happy-dom`, and replacing the unused
  `jsdom` dev dependency with `happy-dom`.
- `npx vitest run tests/smoke.test.jsx`: 7 passed.
- `npm test`: 10 files passed, 156 tests passed.
- `npm run build`: passed.
- Continuation recheck: `npm test` passed again with 10 files / 156 tests,
  and `npm run build` passed again.
- Final council-unblocked recheck: `COUNCIL.md` present; `npm test` passed
  with 10 files / 157 tests; `npm run build` passed.
- Final completion audit recheck after registry-cap alignment:
  `npx vitest run tests/ffield.test.js --environment node` passed with
  13 tests, `npm test` passed with 11 files / 160 tests, and
  `npm run build` passed.

## COMPLETION AUDIT

Completed:
- Part 1 core build for `F_2[t]` and `F_3[t]`: enumeration, irreducibility
  sieve, polynomial Mobius, twin shifts, source registry integration, and exact
  formula anchored tests.
- Part 2 calibration artifact at `F_2` degree 24, `F_3` degree 15, and integer
  `N=10^7`, plus integer extension through `N=10^8`.
- Part 3 first matched divergence battery over residue chi, gap autocorrelation,
  and spacing histograms, with matched Cramer-style nulls and range checks.
- `shot` visual artifact for the polynomial-prime source.
- `COUNCIL.md` is now present and read; the success taxonomy used in the
  verdicts matches the council report.
- No incomplete sprint deliverables remain after the final test/build recheck.
