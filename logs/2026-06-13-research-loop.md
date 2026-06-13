# Research Loop - 2026-06-13

Context read:
- `COUNCIL.md`: primary bet is the Two-Universes Program; S1 shared laws and
  S2 divergences are valid success modes.
- `MACHINE_HOW_TO_USE.md`: log every batch, run persistence/holdout/triviality
  checks, update `KNOWLEDGE.md`, and write a handoff.
- `KNOWLEDGE.md`: closed/graveyard items include L2, Farey, Landau profile,
  rough-row identities, and known exponential-sum residue peaks. Live top-EV
  queue item is the two-universes divergence table.
- Latest handoff trail in `logs/2026-06-12-deeper-structure.md` closed the
  Farey one-directional package but left CA-XA conjectural. This run follows
  the user's standing rerank: Two-Universes Sprints 2-3 outrank those older
  divisor-world leads.

## Cycle 1 - two-universes gap/spacing audit

Ranked lead:
1. `F_2[t]`/`Z` lag-1 gap autocorrelation shared-law candidate and
   `F_3[t]`/`Z` lag-1 autocorrelation divergence candidate from
   `logs/two-universes-artifacts/divergence-summary.json`.
2. Spacing L1 divergence rows from the same table.
3. Other OPEN items are lower EV or already stuck behind theorem gaps.

Predeclared decisive experiment:
- Recompute the gap-autocorrelation and spacing rows at expanded ranges:
  `F_2[t]` degrees `23,24,25` (exact `1x,2x,4x` in universe size) and
  `F_3[t]` degrees `14,15,16` (degree persistence, `1x,3x,9x` in universe
  size), with integer ranges `N=q^degree`.
- For each range, measure both prefix data and the disjoint last-degree /
  last-interval holdout.
- Nulls:
  - Integer Cramer-wheel nulls with `W=6,30,210`, sampled among integers
    coprime to `W` with probability `(W/phi(W))/log n`.
  - Polynomial Cramer-wheel nulls with no wheel, degree-1 wheel, and degree-2
    wheel; the wheeled versions sample only monic polynomials coprime to all
    irreducibles of degree at most the wheel degree, with per-degree exact
    irreducible-count probability.
  - Deterministic wheel controls are composite/local-obstruction controls:
    if they reproduce the real law, the candidate is local residue geometry,
    not a new prime law.
- Seeds: `12345,271828,314159,161803,424242,8675309,112358,27182,141421,173205`.

Pass thresholds:
- `gap z` must keep the same sign and sharpen across the three ranges.
- At the largest prefix and largest holdout, the real absolute `gap z` must
  exceed `max(4, 2*meanAbs(null gap z))` for both the generic null and the
  strongest local-wheel null.
- A shared-law claim requires both universes to pass. A divergence claim
  requires one universe to pass while the other stays within its local-wheel
  null in both prefix and holdout.
- Spacing L1 must beat the strongest matched local-wheel null by at least
  `0.05` in prefix and holdout; otherwise it is noise or density/local-fit.
- Breakthrough gate expectation: a candidate failing the local-wheel or
  deterministic-wheel controls is logged as an artifact/known-nearby
  phenomenon, not escalated.

Run note before results:
- The first expanded run with all ten listed seeds was interrupted before
  producing artifacts because the integer-wheel sampler scanned every integer
  for every wheel. The script was patched to iterate only coprime wheel
  residues and to emit progress markers. The rerun uses the first five
  predeclared seeds (`12345,271828,314159,161803,424242`), meeting the
  audit-gate requirement of at least five Cramer seeds.

Batch:

```text
node --check scripts/two-universes-audit.mjs
node scripts/two-universes-audit.mjs logs/two-universes-artifacts 25 16
```

Artifacts:

```text
logs/two-universes-artifacts/audit-q2-25-q3-16.json
logs/two-universes-artifacts/audit-q2-25-q3-16.md
```

Results:

| universe/range | prefix gap z | holdout gap z | strongest local sampled-null meanAbs z | verdict |
| --- | ---: | ---: | ---: | --- |
| `F_2[t]` degree 25 | `-38.674010` | `-29.693543` | `3.053767` (`degree<=2` wheel, prefix) | survives |
| `Z`, `N=2^25` | `-48.855444` | `-37.440042` | `11.583438` (`W=210`, prefix) | survives |
| `F_3[t]` degree 16 prefix | `-0.009527` | n/a | `0.004648` (`degree<=1` wheel) | prefix divergence artifact |
| `F_3[t]` degree 16 holdout | n/a | `-38.498676` | `12.355884` (`degree<=1` wheel, holdout) | survives on homogeneous degree |
| `Z`, `N=3^16` | `-53.817891` | `-47.842984` | `12.873099` (`W=210`, prefix) | survives |

Important correction:
- The old `F_3[t]` vs `Z` prefix divergence in
  `divergence-summary.json` does **not** survive the degree-homogeneous
  holdout framing. Within the last-degree block, `F_3[t]` has strong negative
  lag-1 gap autocorrelation just like `F_2[t]` and `Z`.
- The better object is therefore a shared law candidate for homogeneous
  prime worlds, not the previous `F_3` divergence candidate.

Spacing L1 verdict:
- Spacing L1 does not clear the predeclared local-null threshold. For example
  `F_2[t]` degree-25 prefix has real `0.302540` versus degree-2 wheel null
  `0.280673`, below the `+0.05` threshold; `Z` at `2^25` has real `0.215654`
  versus `W=210` null `0.206883`. This branch is noise/local-fit.

Composite/local controls:
- Deterministic wheel controls have extremely negative gap autocorrelation
  (`F_2[t]` degree-25 degree-2 wheel prefix `-1301.165917`; integer
  `W=210` prefix `-918.801844`). They are not density-matched, so they do not
  by themselves kill the sampled-null contrast, but they show the mechanism is
  strongly local-obstruction-adjacent.

Gate verdict:
- No `⭐⭐` escalation. The homogeneous gap anti-correlation clears the numeric
  contrast/persistence/holdout checks, but it fails the novelty bar in its
  current form: it is a coarse statistic adjacent to the already logged
  Lemke Oliver-Soundararajan consecutive-prime bias / residue transition
  layer. A sharper candidate would need a contentful cross-universe law for
  the **transition distribution** after subtracting the local wheel model, not
  only lag-1 autocorrelation.

Spawned OPEN leads:
1. Build a two-universes transition matrix for consecutive prime residues and
   gap bins, then subtract the local-wheel sampled null. This could separate
   LO-S residue bias from a genuinely shared finite-field/integer transition
   law.
2. Run the uncomputed integer cross-statistic battery: correlations between
   `mu(n)`, `omega(n)`, residue class, and the following prime gap. This is
   closer to the route-E native edge than more famous-object calibration.

## Cycle 2 - integer cross-statistic battery

Ranked lead:
- The next highest-EV item under the standing search order is uncomputed
  cross-statistics: whether local arithmetic functions of `p-1`, `p+1`, or
  ambient `n` know anything about the following prime gap beyond Cramer
  density and small wheel effects.

Predeclared experiment:
- Ranges: `N=2,000,000`, `4,000,000`, `8,000,000`, plus disjoint holdout
  `(4,000,000,8,000,000]`.
- Real data: consecutive prime gaps `p_next-p`, normalized by `log p`, and
  all-integer gap-to-next-prime countdowns normalized by `log n`.
- Features:
  - at primes: `mu(p-1)`, `|mu(p-1)|`, `omega(p-1)`, `mu(p+1)`,
    `|mu(p+1)|`, `omega(p+1)`;
  - at all integers: `mu(n)`, `|mu(n)|`, `omega(n)`;
  - conditional gaps after quadratic residues vs nonresidues modulo
    `5,7,11,13`.
- Null: five Cramer fake-prime sequences with seeds
  `12345,271828,314159,161803,424242`; the arithmetic features are still
  computed on the actual integers, so the null controls density/local label
  randomness without destroying the arithmetic environment.
- Score:
  - Pearson correlations are reported as `r*sqrt(sample_count)`.
  - QR/nonresidue mean differences are reported as Welch z-scores.
- Pass threshold: same sign across the three prefix ranges; largest prefix
  and holdout must each exceed `max(6, 2*meanAbs(fake z))`. Anything failing
  this is closed as noise/local-fit. A survivor still needs novelty audit
  before escalation.

Batch:

```text
node --check scripts/cross-stat-battery.mjs
node scripts/cross-stat-battery.mjs logs/cross-stat-artifacts 8000000
```

Artifacts:

```text
logs/cross-stat-artifacts/cross-stat-8000000.json
logs/cross-stat-artifacts/cross-stat-8000000.md
```

Preliminary results:
- `qr_minus_qnr_gap_mod_11` survives the first pass:
  prefix z values `10.606619`, `14.010799`, `18.328595`; holdout
  `(4e6,8e6]` z `11.885204`; five fake Cramer controls have largest-prefix
  meanAbs z `0.869013` and holdout meanAbs z `0.778426`.
- `corr_omega_n_gap_to_next` also crosses the mechanical threshold
  (`-161.453049` at `8e6`, holdout `-109.377475`), but the fake controls are
  already huge (`76.710500` / `51.271944`). This is likely local countdown
  geometry, not a breakthrough candidate.
- Everything else is noise under the predeclared rule.

Targeted audit before any escalation:
- Re-test the mod-11 QR/nonresidue gap difference at `N=8e6,16e6,32e6` and
  holdout `(16e6,32e6]`.
- Add a residue-count-matched composite control: for each residue class
  modulo 11, sample composite-permitting labels from integers coprime to 6
  with the same per-residue density as real primes in that range. If this
  reproduces the QR/nonresidue gap z, the apparent law is just finite prime
  race/count imbalance and fails novelty.

Targeted batch:

```text
node --check scripts/qr-gap-audit.mjs
node scripts/qr-gap-audit.mjs logs/cross-stat-artifacts 32000000 11
```

Artifacts:

```text
logs/cross-stat-artifacts/qr-gap-mod-11-32000000.json
logs/cross-stat-artifacts/qr-gap-mod-11-32000000.md
```

Targeted result:

| range | real z | QR mean | QNR mean | Cramer meanAbs | residue-matched meanAbs | verdict |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `(1, 8e6]` | `18.328595` | `1.021042` | `0.979813` | `0.869013` | `15.620890` | killed |
| `(1, 16e6]` | `24.015158` | `1.019980` | `0.980617` | `0.792315` | `21.235547` | killed |
| `(1, 32e6]` | `32.214839` | `1.019396` | `0.980950` | `0.785752` | `28.619727` | killed |
| `(16e6, 32e6]` | `21.507889` | `1.018751` | `0.981313` | `1.227059` | `18.467626` | killed |

Interpretation:
- The mod-11 QR gap effect is real as a raw finite statistic: primes in QR
  classes have about `3.8%-4.1%` larger normalized following gaps than primes
  in QNR classes in these ranges.
- It is not a breakthrough. A composite-permitting control that matches the
  per-residue densities modulo 11 already produces z-scores of the same order.
  The effect is therefore wheel/residue-position geometry plus finite residue
  counts, not a new prime-only law.

Cycle 2 verdict:
- No `⭐⭐` escalation.
- `qr_minus_qnr_gap_mod_11` is `CLOSED-ARTIFACT`: interesting enough to keep
  as an audit lesson, but killed by the residue-count-matched composite
  control.
- `corr_omega_n_gap_to_next` is also closed as local countdown geometry because
  fake controls are already large.

## HANDOFF

Campaign status: active, no `⭐⭐` finding in this run.

What changed:
- `scripts/two-universes-audit.mjs` adds an expanded two-universes
  gap/spacing audit with polynomial local-wheel nulls, integer `W=6,30,210`
  wheel nulls, deterministic local controls, prefix ranges, and disjoint
  holdouts.
- `scripts/cross-stat-battery.mjs` adds the uncomputed integer cross-stat
  battery.
- `scripts/qr-gap-audit.mjs` adds the targeted QR-vs-QNR mod-11 audit with
  residue-count-matched composite controls.
- `KNOWLEDGE.md` now records the corrected two-universes gap result and the
  killed mod-11 cross-stat artifact.

Best current lead:
- The best remaining lead is **not** the old `F_3[t]` prefix divergence.
  That was corrected: homogeneous degree blocks show shared negative lag-1
  gap autocorrelation in `F_2[t]`, `F_3[t]`, and `Z`.
- The live OPEN version is a two-universes **transition law after subtracting
  local-wheel nulls**: compute the full transition matrix for consecutive
  residue/gap-bin pairs in homogeneous polynomial degrees and matched integer
  intervals, then compare real minus residue-count/wheel-matched fake.

Exact next attack:
1. Build `scripts/two-universes-transition-audit.mjs`.
2. Use homogeneous blocks only:
   - `F_2[t]` degrees `23,24,25`;
   - `F_3[t]` degrees `14,15,16`;
   - `Z` intervals `(2^22,2^23]`, `(2^23,2^24]`, `(2^24,2^25]` and
     `(3^13,3^14]`, `(3^14,3^15]`, `(3^15,3^16]`.
3. For each universe, score:
   - residue transition matrix `(r_i,r_{i+1})` modulo small objects
     (`Z`: `q=5,7,11`; `F_q[t]`: irreducible moduli of degree `1` and `2`);
   - gap-bin transition matrix using normalized gaps split into quantiles;
   - combined residue x gap-bin transition if sample size allows.
4. Nulls:
   - polynomial wheel-degree `1` and `2` sampled nulls as in
     `two-universes-audit.mjs`;
   - integer `W=210` sampled null;
   - residue-count-matched composite controls for any QR/residue claim, as in
     `qr-gap-audit.mjs`.
5. Pass rule:
   - real residual matrix norm beats strongest matched null by `2x` at the
     largest range and holdout;
   - the top cells keep sign and sharpen across all three ranges;
   - nearest known object is quoted before escalation (likely
     Lemke Oliver-Soundararajan, so expect novelty to require a cross-universe
     residual not present in their integer-only statement).

Backstop if transition audit is noise:
- Return to the route-E cross-stat battery with stronger matched controls from
  the start. Avoid QR/QNR claims without residue-count-matched composite
  controls; this run showed ordinary Cramer is too weak for those.

## Cycle 3 - two-universes transition-law audit

Ranked lead:
- Resume the HANDOFF's top lead: the homogeneous-block two-universes
  transition law after subtracting local-wheel effects. This directly tests
  whether the lag-1 gap anti-correlation contains a new cross-universe
  transition signature or only known LO-S/residue-neighborhood structure.

Predeclared experiment:
- Homogeneous polynomial blocks:
  - `F_2[t]` degrees `23,24,25`;
  - `F_3[t]` degrees `14,15,16`.
- Matched integer intervals:
  - `(2^22,2^23]`, `(2^23,2^24]`, `(2^24,2^25]`;
  - `(3^13,3^14]`, `(3^14,3^15]`, `(3^15,3^16]`.
- Statistics:
  - residue transition matrices `(r_i,r_{i+1})`;
  - gap-bin transition matrices with normalized gaps split into quartiles
    using the real block's thresholds;
  - residue x gap-bin transition matrices when sample size allows.
- Residue moduli:
  - `Z`: `5,7,11`;
  - `F_q[t]`: first irreducible modulus of degree `1` where nontrivial and
    first irreducible modulus of degree `2`.
- Nulls:
  - polynomial degree-1 and degree-2 local-wheel sampled nulls;
  - polynomial residue-count-matched controls on top of the degree-2 wheel;
  - integer `W=210` wheel sampled null;
  - integer residue-count-matched composite controls.
- Score: empirical transition matrix L1 distance from the matched-null mean,
  divided by the matched null's mean absolute self-distance.
- Pass rule:
  - the strongest matched control must still leave ratio `>=2` at the largest
    range;
  - ratios must sharpen across the three ranges;
  - the top residual cell sign must be stable across the three ranges;
  - if a row passes mechanically, novelty still requires a named nearest
    catalog object audit before any `⭐⭐` escalation.

Run note before results:
- A first full run with residue-count-matched controls on every range was
  interrupted during `F_3[t]` degree `15`; it was doing redundant smaller-range
  residue-matched sampling. The script was revised to keep local-wheel controls
  on all three ranges and apply the expensive residue-count-matched controls
  at the largest range, where the gate decision is made. This weakens the
  smaller-range kill controls but preserves the final adversarial largest-range
  check; no `⭐⭐` claim can use a statistic whose largest-range
  residue-matched control kills it.
- The largest-range eager residue-matched pass was still too slow in
  `F_3[t]` degree `16`. The script was revised again into a first-pass
  local-wheel screen. Any row that survives the screen must still get a
  targeted residue-count-matched control before it can be called a candidate;
  this run can close noisy rows but cannot escalate a surviving row by itself.

Batch:

```text
node --check scripts/two-universes-transition-audit.mjs
PV_TRANSITION_FAST_Q3=1 node scripts/two-universes-transition-audit.mjs logs/two-universes-artifacts
```

Artifacts:

```text
logs/two-universes-artifacts/transition-audit.json
logs/two-universes-artifacts/transition-audit.md
```

Reduced-screen scope:
- `base2`: full declared `F_2[t]` degrees `23,24,25` and integer intervals
  through `(2^24,2^25]`.
- `base3`: reduced `F_3[t]` degrees `13,14,15` and integer intervals through
  `(3^14,3^15]`. This does **not** clear the full `F_3[t]` degree-16 gate.

Screen results:
- `F_2[t]`: best row was `poly-mod-deg-2-residue-transition`, ratios
  `3.223,2.637,6.954`, but it fails the sharpen rule. No polynomial row
  passes.
- `Z` on base-2 intervals: `Z-mod-11-residue-transition` passes the local
  screen, ratios `4.092,4.640,6.539`.
- Reduced `F_3[t]`: no polynomial row passes. The best degree-1 residue row
  has ratios `0.395,1.097,2.326` but unstable top-cell sign.
- `Z` on base-3 intervals: `Z-mod-11-residue-transition` passes the local
  screen, ratios `2.285,3.615,5.498`; `Z-mod-5-residue-transition` also
  mechanically passes at the reduced largest interval with ratio `2.021`.

Targeted follow-up for the only serious survivor:

```text
node --check scripts/transition-targeted-residue.mjs
node scripts/transition-targeted-residue.mjs logs/two-universes-artifacts 11
```

Artifacts:

```text
logs/two-universes-artifacts/transition-targeted-residue-mod-11.json
logs/two-universes-artifacts/transition-targeted-residue-mod-11.md
```

Targeted result:

| interval | real distance | residue-matched null meanAbs | ratio | verdict |
| --- | ---: | ---: | ---: | --- |
| `base2-largest` `(2^24,2^25]` | `0.071433` | `0.006900` | `10.352` | survives residue-count control |
| `base3-largest-reduced` `(3^14,3^15]` | `0.074175` | `0.009161` | `8.097` | survives residue-count control |

Novelty audit:
- This is not new. It is the Lemke Oliver-Soundararajan object: consecutive
  prime residue-pair frequencies modulo `q`.
- Nearest catalog entry: Lemke Oliver and Soundararajan, "Unexpected biases in
  the distribution of consecutive primes", arXiv:1603.03720 / PNAS 2016. Their
  abstract says the distribution of pairs of consecutive primes among reduced
  residue classes is "surprisingly erratic". Source:
  `https://arxiv.org/abs/1603.03720`.
- Tao's 2016 exposition describes the same object as the distribution of
  `(p_n mod q, p_{n+1} mod q)` for small `q`:
  `https://terrytao.wordpress.com/2016/03/14/biases-between-consecutive-primes/`.

Cycle 3 verdict:
- No `⭐⭐` escalation.
- Integer mod-11 residue-transition bias is a strong calibration reproduction
  of known LO-S consecutive-prime bias, not a new law.
- The reduced finite-field screen did not produce a matching polynomial
  survivor, so there is no S1 shared law here. It also did not produce a clean
  S2 divergence beyond the known fact that the integer side has LO-S residue
  transition bias.
- The full `F_3[t]` degree-16 transition screen is still computationally open:
  it needs a streaming sampler/matrix accumulator instead of materializing
  multi-million-entry null sequences.

## HANDOFF 2

Campaign status: active, no `⭐⭐` finding.

Completed this continuation:
- Implemented `scripts/two-universes-transition-audit.mjs`.
- Added optimized multi-seed polynomial local-wheel sampling and a reduced
  `PV_TRANSITION_FAST_Q3=1` mode.
- Ran the reduced transition screen and wrote
  `logs/two-universes-artifacts/transition-audit.json`.
- Implemented and ran `scripts/transition-targeted-residue.mjs` for the
  surviving integer mod-11 row.
- Updated `KNOWLEDGE.md` with the transition-screen verdict.

What is settled:
- The surviving integer mod-11 transition matrix is known LO-S territory. It
  survives residue-count-matched composite controls, but novelty fails because
  it is literally consecutive-prime residue-pair bias modulo `q`.
- Reduced finite-field blocks (`F_2[t]` degrees `23..25`, `F_3[t]` degrees
  `13..15`) did not produce a transition-law survivor under local-wheel
  screening.

Best next work:
1. Refactor `scripts/two-universes-transition-audit.mjs` to stream sampled
   polynomial nulls into transition matrices online. Do not materialize five
   multi-million-entry null sequences for `F_3[t]` degree `16`.
2. Rerun the full default transition audit (`F_3[t]` degrees `14,15,16`).
3. If full degree 16 also has no finite-field survivor, close the
   two-universes transition lead as known-integer/negative-finite-field and
   move to the next OPEN route-E cross-stat battery with matched controls from
   the start.

Exact implementation hint:
- The streaming sampler needs only previous selected label/state per seed and
  transition count arrays. For each eligible monic polynomial in sorted
  encoding order, decide selection for all five seeds, compute residue state
  and gap-bin state using the real block thresholds, then update residue,
  gap-bin, and residue×gap transition matrices incrementally.
- This avoids storing arrays of ~2.7M selected degree-16 labels per seed and
  should turn the current memory/time bottleneck into a single pass per wheel.

Verification:

```text
node --check scripts/two-universes-audit.mjs
node --check scripts/cross-stat-battery.mjs
node --check scripts/qr-gap-audit.mjs
node --check scripts/two-universes-transition-audit.mjs
node --check scripts/transition-targeted-residue.mjs
npx vitest run tests/explore.test.js --testTimeout 30000
npm run build
npx vitest run --testTimeout 30000
```

Result: script syntax checks passed; focused explore test passed; build passed;
full Vitest suite passed with `12` files and `165` tests. A prior raw
`npm test` run hit the default 5s timeout in one explore CLI test, then passed
when rerun with an explicit 30s timeout.

# Continuation - full streaming transition audit

Resumed from HANDOFF 2. The live blocker was computational, not mathematical:
the `F_3[t]` degree-16 transition audit needed streaming null accumulation.

Implementation change:
- Refactored `scripts/two-universes-transition-audit.mjs` so polynomial local
  wheel nulls stream directly into transition matrices. The streamed pass keeps
  only per-seed previous state and count matrices for gap-bin, residue, and
  residue×gap transitions.
- The previous reduced mode remains available as `PV_TRANSITION_FAST_Q3=1`,
  but the default run now completes the full declared `F_3[t]` degrees
  `14,15,16`.

Validation batch:

```text
node --check scripts/two-universes-transition-audit.mjs
PV_TRANSITION_GROUP=base3 PV_TRANSITION_FAST_Q3=1 node scripts/two-universes-transition-audit.mjs logs/two-universes-artifacts
```

Full batch:

```text
node scripts/two-universes-transition-audit.mjs logs/two-universes-artifacts
```

Artifacts:

```text
logs/two-universes-artifacts/transition-audit.json
logs/two-universes-artifacts/transition-audit.md
```

Full transition result:

| group | universe | top row | ratios | strongest largest ratio | verdict |
| --- | --- | --- | ---: | ---: | --- |
| base2 | `F_2[t]` | `poly-mod-deg-2-residue-transition` | `3.223,2.637,6.954` | `6.954` | fails sharpen |
| base2 | `Z` | `Z-mod-11-residue-transition` | `4.092,4.640,6.539` | `6.539` | known LO-S candidate |
| base3 | `F_3[t]` | `poly-mod-deg-2-residue-transition` | `1.123,1.206,1.371` | `1.371` | below threshold |
| base3 | `Z` | `Z-mod-11-residue-transition` | `3.615,5.498,8.453` | `8.453` | known LO-S candidate |

No finite-field transition row passes the screen:
- `F_2[t]` strongest row is not persistent because ratios dip at degree 24.
- `F_3[t]` strongest row is persistent but below the ratio `2` threshold at
  degree 16.
- All finite-field gap-bin and residue×gap rows are below threshold or fail
  persistence/sign stability.

Targeted integer survivor controls:

```text
node --check scripts/transition-targeted-residue.mjs
node scripts/transition-targeted-residue.mjs logs/two-universes-artifacts 11
node scripts/transition-targeted-residue.mjs logs/two-universes-artifacts 5
```

Artifacts:

```text
logs/two-universes-artifacts/transition-targeted-residue-mod-11.json
logs/two-universes-artifacts/transition-targeted-residue-mod-11.md
logs/two-universes-artifacts/transition-targeted-residue-mod-5.json
logs/two-universes-artifacts/transition-targeted-residue-mod-5.md
```

Targeted results:
- Mod 11 residue transition survives residue-count matched controls:
  ratios `10.352` on `(2^24,2^25]`, `8.097` on `(3^14,3^15]`, and
  `13.061` on `(3^15,3^16]`.
- Mod 5 residue transition also survives residue-count matched controls:
  ratios `5.275`, `4.550`, and `6.479` on the same intervals.

Novelty and gate verdict:
- No `⭐⭐` escalation. The integer survivors are exactly the
  Lemke Oliver-Soundararajan consecutive-prime residue-pair bias family.
- No S1 shared law: the full finite-field transition screen has no matching
  survivor.
- No clean S2 divergence worth escalation: "integers have known LO-S residue
  transition bias while these finite-field blocks do not" is a calibration
  contrast, not a new law.
- The two-universes transition lead is closed at the tested scale.

## HANDOFF 3

Campaign status: active, no `⭐⭐` finding.

Settled now:
- Full `F_3[t]` degree-16 transition audit completed.
- Two-universes transition matrix lead is closed as
  `KNOWN-MATH integer calibration / negative finite-field screen`.

Best next lead by the standing EV order:
1. Return to uncomputed route-E cross-statistics, but with matched controls
   from the start. Avoid QR/QNR and residue-transition statistics unless a
   residue-count-matched composite control is built into the first pass.
2. Highest-value next battery: cross-universe Möbius/gap interactions:
   - `[Z]`: correlations of `mu(p±1)`, `omega(p±1)`, squarefreeness of
     `p±1`, and local divisor features with following normalized prime gap;
   - `[F_q[t]]`: polynomial analogs using `mu(f±h)` and factor counts for
     small shifts `h in {1,t,t+1}` versus following irreducible spacing inside
     homogeneous degree blocks;
   - nulls: integer `W=210` plus residue-count matched controls where residue
     classes appear; polynomial degree-1/2 local wheels.
3. Predeclare pass rule before computing: same sign and sharpening across
   three ranges, largest-range and holdout beating strongest matched null by
   `2x`, then novelty audit against LO-S/Hardy-Littlewood residue-pair
   explanations.

Verification:

```text
node --check scripts/two-universes-transition-audit.mjs
node --check scripts/transition-targeted-residue.mjs
node --check scripts/two-universes-audit.mjs
node --check scripts/cross-stat-battery.mjs
node --check scripts/qr-gap-audit.mjs
npx vitest run --testTimeout 30000
npm run build
```

Result: syntax checks passed; full Vitest suite passed with `12` files and
`165` tests; production build passed.

## Cycle 4 - cross-universe Mobius/factor features vs following gaps

Ranked lead:
- Resume HANDOFF 3's top lead: uncomputed cross-universe interactions between
  local Mobius/factor features near a prime object and the following normalized
  gap. This avoids the closed residue-transition branch and asks whether
  multiplicative/local-factor information knows the next spacing in either
  universe.

Predeclared experiment:
- Homogeneous polynomial blocks:
  - `F_2[t]` degrees `23,24,25`;
  - `F_3[t]` degrees `14,15,16`.
- Matched integer intervals:
  - `(2^22,2^23]`, `(2^23,2^24]`, `(2^24,2^25]`;
  - `(3^13,3^14]`, `(3^14,3^15]`, `(3^15,3^16]`.
- Response variable:
  - following gap divided by the block's mean following gap.
- Integer features at prime labels `p`:
  - `mu(p-1)`, `|mu(p-1)|`, `omega(p-1)`;
  - `mu(p+1)`, `|mu(p+1)|`, `omega(p+1)`.
- Polynomial features at irreducible labels `f`:
  - for shifts `h in {1,t,t+1}`, measure `mu(f+h)`, `|mu(f+h)|`,
    and `omega(f+h)`;
  - in odd characteristic also include `f-h`; in characteristic 2 this is the
    same as `f+h`.
- Nulls:
  - integer `W=210` sampled labels with five seeds
    `12345,271828,314159,161803,424242`;
  - polynomial degree-2 local-wheel sampled labels with the same five seeds.
- Score:
  - Pearson correlation z-score `r*sqrt(n)` for each feature.
- Pass rule:
  - same sign across all three ranges in a universe;
  - absolute z sharpens from range 1 to range 2 to range 3;
  - largest range beats `max(6, 2*meanAbs(null z))`;
  - the largest homogeneous holdout is the third block itself, so no prefix
    discovery statistic is used;
  - a survivor must then pass novelty/factor/residue audit before any `⭐⭐`
    escalation.

Adversarial leakage audit, declared after seeing that polynomial shift rows
dominate the first pass and before computing the audit:
- Positive-shift polynomial features `feature(f+h)` can directly reveal that
  `f+h` is irreducible, hence that the following gap is at most `h`. Recompute
  those correlations after excluding all pairs with next gap `<= h`, both for
  real irreducibles and for each local-wheel null seed.
- Negative-shift polynomial features `feature(f-h)` can directly reveal that a
  previous irreducible lies within `h`; recompute after excluding all pairs
  with previous gap `<= h`, again in real and null data.
- Candidate kill rule: if the large polynomial rows lose sign/sharpening or
  fail the largest-block threshold `abs(z) > max(6, 2*meanAbs(null z))` after
  the exclusion, classify the first-pass signal as short-gap leakage rather
  than a new Mobius/factor law.

Second adversarial audit, declared after the leakage audit left only
`F_3[t]` Mobius-sign rows:
- For each scrubbed survivor, keep the exact real irreducible gap sequence and
  the exact scrubbed feature values inside the same homogeneous degree block.
- Compare the real pairing to five seeded cyclic shifts of the feature vector
  against the gap vector. This preserves the feature distribution, the gap
  distribution, the degree block, and local feature autocorrelation, but breaks
  the specific alignment between `mu(f+h)` and the following gap.
- Candidate kill rule: if the scrubbed real z-scores no longer sharpen or no
  longer beat `max(6, 2*meanAbs(cyclic-shift z))` on the largest block,
  classify the survivor as a feature-distribution/inside-gap artifact.

Holdout declared after the cyclic-shift audit left the `F_3[t]` Mobius-sign
rows alive:
- Compute the same scrubbed rows on the disjoint homogeneous block
  `F_3[t]` degree `17`, which was not used in discovery, ranking, or either
  previous pass rule.
- Use the same five local-wheel seeds and the same five cyclic-shift seeds.
- Holdout pass rule: the degree-17 real z must keep the discovered sign and
  beat both `max(6, 2*meanAbs(local-wheel z))` and
  `max(6, 2*meanAbs(cyclic-shift z))`.

Factor/mediation audit declared after the degree-17 holdout passed:
- For the same five `F_3[t]` survivors, restrict to rows where
  `|mu(f +/- h)|=1` and recompute the Mobius-sign correlation. This tests
  whether the row is genuinely parity-sensitive rather than just a
  squarefree-vs-squareful proxy.
- For the negative-shift rows, compute the partial correlation of
  `mu(f-h)` with the following gap after linearly controlling the previous
  gap. This tests whether the signal is merely inherited from known adjacent
  gap dependence.
- Use the same seeded cyclic shifts as nulls for these factor/mediation
  diagnostics. This audit does not replace the local-wheel Cramer contrast;
  it decides how honestly the surviving object can be stated.

Composite-sequence control declared after the factor/mediation audit passed:
- On the degree-17 holdout block, sample five sparse sequences from reducible
  monic polynomials only, at the same density as irreducibles.
- Run the same scrubbed `mu(f +/- h)` versus following selected-object gap
  correlations on those composite-only sequences.
- Composite kill rule: if any survivor's real degree-17 z fails to beat
  `max(6, 2*meanAbs(composite-sequence z))`, do not call it an irreducible-gap
  law.

Cycle 4 result:

The first-pass battery found no integer Mobius/gap law, but it found large
polynomial rows. Direct leakage audit killed all `F_2[t]` rows and the
non-Mobius/sign rows, but left five `F_3[t]` Mobius-sign rows:

```text
mu_minus_t
mu_minus_t_plus_1
mu_plus_1
mu_plus_t
mu_plus_t_plus_1
```

Those rows survived:
- direct short-gap scrub;
- five seeded cyclic shifts preserving the real scrubbed feature vector and
  real gap vector;
- degree-17 holdout, not used in discovery;
- squarefree-only parity restriction;
- previous-gap partial correlation for the negative-shift rows;
- five sparse composite-only degree-17 controls sampled from reducible monic
  polynomials at irreducible density.

Top law:

```text
In F_3[t], ordered by base-3 coefficient encoding,
Corr(mu(f-t), next_gap(f) | f irreducible degree n, previous_gap(f)>t)
≈ 0.022 for n=14..17.
```

Observed `mu_minus_t` z-scores and scrubbed sample sizes:

| degree | z | n | r |
| ---: | ---: | ---: | ---: |
| 14 | 12.836 | 289209 | 0.023868 |
| 15 | 19.614 | 819906 | 0.021661 |
| 16 | 32.434 | 2330338 | 0.021246 |
| 17 | 56.220 | 6641716 | 0.021815 |

Degree-17 holdout table:

| statistic | real z | local-wheel meanAbs | cyclic meanAbs | composite meanAbs | verdict |
| --- | ---: | ---: | ---: | ---: | --- |
| `mu_minus_t` | 56.220 | 0.876 | 0.574 | 2.311 | survives |
| `mu_minus_t_plus_1` | 50.123 | 0.649 | 0.967 | 2.423 | survives |
| `mu_plus_1` | 15.664 | 0.305 | 0.832 | 0.844 | survives |
| `mu_plus_t` | 11.219 | 0.736 | 0.780 | 0.519 | survives |
| `mu_plus_t_plus_1` | 9.126 | 1.006 | 1.085 | 1.292 | survives |

Novelty audit:
- Sawin-Shusterman resolve Chowla/twin-prime results over `F_q[T]` under
  large-field hypotheses; Theorem 1.3 requires `q > p^(2k^2 e^2)`, so fixed
  `F_3` is not covered. Their odd-characteristic Frobenius-sign/discriminant
  mechanism is a plausible proof route, not a cataloged conditional gap-tail
  statistic.
- Kurlberg-Rosenzweig study prime and Mobius correlations in very short
  intervals, but as interval sums rather than following-gap correlations
  conditioned on consecutive irreducibles.
- Thorne studies lexicographic consecutive primes in function fields through a
  Maier-matrix lens, but for count irregularities and residue strings, not
  Mobius parity inside gap tails.
- Gomez-Perez/Ostafe/Sha study arithmetic of consecutive polynomial sequences
  and irreducible runs, not this Mobius-gap predictor.

Expert pack:

```text
logs/two-universes-artifacts/mobius-gap-expert-pack.md
```

STATUS: `⭐⭐ / CONJECTURAL`. Campaign stop condition met. The sharp expert
question is whether the fixed-`F_3` law can be derived from the
odd-characteristic discriminant/Frobenius-sign formula for polynomial Mobius
plus lexicographic irreducible-gap tail conditioning.
