# 2026-06-15 critical-line hunt

Goal: find a previously unknown prime critical-line-style object without using the forbidden analytic route. Accepted targets are a dead-straight line, a flat law, or a stable cancellation exponent that survives persistence, holdout, twin/null contrast, and known-math checks.

Plan:
- Read `MACHINE_HOW_TO_USE.md`, `KNOWLEDGE.md`, `logs/bias.md`, and `scripts/hunt.mjs`.
- Use `node scripts/explore.mjs ops` for live inventory.
- Run broad `hunt.mjs gen | hunt.mjs batch` scans around `N=25000`.
- Add explicit cross-domain probes from the foreign-object sources already exposed in the registry.
- Escalate only specs promoted by bars 2-4, then apply statement and known/novel checks.

## Cycle 1 - generator batch

Command:
`node scripts/hunt.mjs gen 60 | node scripts/hunt.mjs batch | tee logs/2026-06-15-critical-line-hunt-cycle1.jsonl`

Summary:
- Total specs: 60.
- Auto-promotes from bars 2-4: 5.
- Family yields: `dyexp-compose` 2/6, `gaps-stack` 2/6, `mu-walk-chip` 1/7; all other families 0.
- `node scripts/hunt.mjs update logs/2026-06-15-critical-line-hunt-cycle1.jsonl` updated `logs/bias.md` with lessons: `dyexp-compose` lead, `lab-residual` failure.

Promoted specs and bar-5 disposition:

| family | object | real | twin | holdout | disposition |
| --- | --- | --- | --- | ---: | --- |
| `dyexp-compose` | gaps walk + `dyexp` | `lin=0.8838 flat=0.388 thetaY=0.483` | `thetaY=0.355` | 0 | `KNOWN/ARTIFACT`: dyadic transform of cumulative gap walk; ledger already classifies dyadic transforms and cumulative gap walks under Mertens/Chebyshev/gap-telescope funnels. Not a straight/flat law. |
| `gaps-stack` | gaps walk + offset -540.18 + abs | `lin=0.7712 flat=0.598 thetaY=-0.255` | `thetaY=-0.007` | 0 | `ARTIFACT`: absolute distance to an arbitrary offset on a cumulative gap path; no holdout and no precise invariant statement. |
| `mu-walk-chip` | Mobius walk + symlog + mod 243 + abs | `lin=0.0172 flat=1.034 thetaY=-0.056` | `thetaY=-0.208` | 0 | `KNOWN/ARTIFACT`: postprocessed Mertens walk; arbitrary modulus/absolute value, no flatness/line, belongs to logged Mertens branch. |
| `gaps-stack` | gaps walk + abs | `lin=0.7709 flat=0.415 thetaY=0.478` | `thetaY=0.712` | 0 | `KNOWN`: absolute cumulative gap walk is still the logged gap/Chebyshev telescope family; no holdout. |
| `dyexp-compose` | duplicate gaps walk + `dyexp` | same as above | same as above | 0 | duplicate rejected. |

No Cycle 1 item clears all five bars. The auto-promotes are useful for generator weighting but not mathematical survivors.

## Cycle 2 - explicit cross-domain registry probes

Command:
`node -e '<13 cross-domain specs>' | node scripts/hunt.mjs batch | tee logs/2026-06-15-critical-line-hunt-crossdomain1.jsonl`

Sources probed: `primon`, `anderson`, `levy`, `linking`, `magnitude`, `goldbach`, `rotor`, `primeTda`, and `monna`.

Summary:
- Total specs: 13.
- Auto-promotes from bars 2-4: 1.
- `node scripts/hunt.mjs update logs/2026-06-15-critical-line-hunt-crossdomain1.jsonl` updated `logs/bias.md` with lesson: `cross-domain` lead.

Promoted spec:

⭐ `cross-domain/primon`: `{"cfg":{"source":"primon","plane":"graph","lens":"mono","p":{"pts":10}}}`.

Metrics: real `lin=0.9994`, `flat=0.515`, `slope=-1.03`, holdout `R2=0.951`; shuffled twin `lin=0.0575`.

Statement check: this is the log-log line of the source's own prime-gas partition proxy near its critical point, with expected slope near `-1`.

Bar-5 verdict: `ARTIFACT / SOURCE-BUILT CALIBRATION`, not a prime critical line. The construction hard-codes `U=max(1e-9,1/delta-0.58)` and plots `log U` against `log delta`, so the line is a deterministic statistical-mechanics calibration, not a residual law discovered in primes. Link: `#v=eyJtb2RlIjoicGF0Y2giLCJjZmciOnsic291cmNlIjoicHJpbW9uIiwicGxhbmUiOiJncmFwaCIsImxlbnMiOiJtb25vIiwicCI6eyJwdHMiOjEwfX0sImNoaXBzIjp7IngiOltdLCJ5IjpbXX0sInJlc2lkdWFsIjpmYWxzZSwidHdpbk1vZGUiOiJyZWFsIn0`.

All other cross-domain sources were either nonlinear/noisy (`anderson`, `linking`, `goldbach`, `rotor`, `primeTda`), generic under shuffling (`monna`), or had no holdout/line strength (`magnitude`, `levy`).

## Cycle 3 - post-update generator batch

Command:
`node scripts/hunt.mjs gen 80 | node scripts/hunt.mjs batch | tee logs/2026-06-15-critical-line-hunt-cycle3.jsonl`

Summary:
- Total specs: 80.
- Auto-promotes from bars 2-4: 15.
- Family yields: `dyexp-compose` 9/12, `gaps-stack` 3/14, `lab-residual` 2/8, `prime-walk-chip` 1/7; all other families 0.
- `node scripts/hunt.mjs update logs/2026-06-15-critical-line-hunt-cycle3.jsonl` updated `logs/bias.md` with lessons: `dyexp-compose` lead, `residue-mod-cumsum` failure.

Promoted buckets and bar-5 disposition:

| bucket | strongest metrics | disposition |
| --- | --- | --- |
| PNT-index residual `n - pi(n)*log(pi(n))` over `domain:"prime"` | real `lin=0.9999`, holdout `R2=0.994`, slope `0.119` | `KNOWN-MATH`: prime-index PNT residual; straightness is the logged PNT funnel, not a new law. Link: `#v=eyJtb2RlIjoibGFiIiwibGFiIjp7ImRvbWFpbiI6InByaW1lIiwiTiI6NDAwMDAsInRNYXgiOjYwLCJleCI6IiIsImV5IjoibiAtIHBpKG4pKmxvZyhwaShuKSkiLCJhIjowLjUsImIiOjIuMzk5fX0`. |
| gaps walk + `dyexp` | repeated real `lin=0.8838`, `thetaY=0.483`; holdout `0` | `KNOWN/ARTIFACT`: dyadic transform on a cumulative gap walk; same branch rejected in Cycle 1 and in prior ledger entries on cumulative centered gaps and dyadic transforms. |
| Mobius walk + `dyexp` | real `thetaY=0.472`, twin `0.222`, holdout `0` | `KNOWN/ARTIFACT`: postprocessed Mertens walk; no line/flatness and no fresh invariant. |
| gaps walk + scale / symlog+cumsum | best `lin=1`, holdout `R2=0.999` for symlog+cumsum | `ARTIFACT`: monotone cumulative transform of positive gap sizes; additive cost/scale line, not cancellation. |
| prime walk normalized/sqrt/mod flatness | real `flat=0.026`, holdout `0` | `ARTIFACT`: post-normalization/modulo display flatness; arbitrary chip stack and no holdout. |

No Cycle 3 item clears all five bars.

## Closing summary

Total scanned this session: 153 specs (`60` generator, `13` cross-domain, `80` post-update generator).

Bars 2-4 mechanical promotions: 21.

Five-bar survivors: 0.

Strongest rejected leads:
- `cross-domain/primon`: clean line, but deterministic source-built statistical-mechanics calibration.
- PNT-index residual `p_k - k log k`: clean line, but known PNT coordinate.
- gap-walk `dyexp` and symlog/cumsum variants: repeatedly twin-separated on exponent heuristics, but all remain cumulative-gap transforms or additive monotone costs with failed holdout or known telescope risk.
- Mobius `dyexp`: mild exponent contrast, but still a postprocessed Mertens walk without a new statement.

Frontier:
- The generator is over-rewarding `dyexp-compose` because exponent contrast alone promotes many known/cheap cumulative transforms. Future cycles should either penalize promoted specs with holdout `0`, or add a bar-5-aware family lesson: dyadic/gap/Mertens chip stacks are calibration-only unless the statement is a non-telescoping residual with a named local null.
- The most plausible open target remains a cumulative walk on a genuinely nonlinear residual or a 2-D front after local/null subtraction, not raw pointwise transforms or additive cumulative costs.

## Cycle 4 - fresh post-reset generator batch

Command:
`node scripts/hunt.mjs gen 100 | node scripts/hunt.mjs batch | tee logs/2026-06-15-critical-line-hunt-cycle4.jsonl`

Context: `logs/bias.md` had been reset to uniform after the order-sensitive
null fix, so this cycle retested the generator with the corrected rule that
`dyexp`/`diff` rows cannot claim exponent separation from shuffled order alone.

Summary:
- Total specs: 100.
- Auto-promotes from bars 2-4: 5.
- Family yields: `dyexp-compose` 3/12, `gaps-stack` 1/14, `lab-residual` 1/8;
  all other families 0.
- Annotated artifact:
  `logs/2026-06-15-critical-line-hunt-cycle4-annotated.jsonl`.
- `node scripts/hunt.mjs update logs/2026-06-15-critical-line-hunt-cycle4-annotated.jsonl`
  updated `logs/bias.md` with survival-aware penalties. New lesson:
  `FAIL dyexp-compose: 3/12 promoted but retired at bar 5 (known)`.
- Required promoted-candidate screenshots:
  `logs/shots/cycle4-01-gaps-dyexp-sqrt.png`,
  `logs/shots/cycle4-02-gaps-dyexp.png`,
  `logs/shots/cycle4-03-gaps-dyexp2.png`,
  `logs/shots/cycle4-04-pnt-index.png`,
  `logs/shots/cycle4-05-gaps-scale.png`.
  Contact sheet: `logs/shots/cycle4-contact-sheet.png`.

Promoted specs and bar-5 disposition:

| family | object | real | twin | holdout | disposition |
| --- | --- | --- | --- | ---: | --- |
| `dyexp-compose` | gaps walk + `dyexp` + `sqrt` | `lin=0.8303 flat=0.223 thetaY=0.241` | `thetaY=0.136` | 0 | `KNOWN/ARTIFACT`: dyadic transform of cumulative gap walk; no non-telescoping residual statement, no line/flat law, failed holdout. |
| `dyexp-compose` | gaps walk + `dyexp` | `lin=0.8838 flat=0.388 thetaY=0.483` | `thetaY=0.355` | 0 | `KNOWN/ARTIFACT`: repeat of prior retired bucket; cumulative-gap transform in the Chebyshev/gap-telescope funnel. |
| `dyexp-compose` | gaps walk + `dyexp` + `dyexp` | `lin=0.9027 flat=0.385 thetaY=0.486` | `thetaY=0.086` | 0 | `KNOWN/ARTIFACT`: double dyadic smoothing of the same cumulative-gap branch; no bar-1 statement beyond display transform. |
| `lab-residual` | `domain:"prime", ey:"n - pi(n)*log(pi(n))"` | `lin=0.9999 flat=0.609 thetaY=0.983` | `thetaY=0.983` | 0.994 | `KNOWN-MATH`: prime-index PNT coordinate `p_k ~ k log k`; already retired in Cycle 3 and `KNOWLEDGE.md`. |
| `gaps-stack` | gaps walk + scale `-0.803` | `lin=0.7709 flat=0.415 thetaY=0.478` | `thetaY=0.712` | 0 | `KNOWN/ARTIFACT`: scaled cumulative gap walk; linearity/exponent contrast is display-level and the holdout is zero. |

Cycle 4 survivor count: 0.

Frontier after Cycle 4:
- The order-sensitive null fix reduced false promotion, but the remaining
  promoted rows are still the same cheap funnels: PNT-index coordinates and
  cumulative-gap/dyadic display transforms.
- The current generator should keep `dyexp-compose`, `gaps-stack`, and
  `lab-residual` downweighted unless a future spec supplies a non-telescoping
  residual statement and passes holdout.

## Cycle 4b - fresh cross-domain LAB probes

Command:
`node --input-type=module - <<'NODE' | node scripts/hunt.mjs batch | tee logs/2026-06-15-critical-line-hunt-crossdomain2.jsonl`

Scope: 12 prime-fed foreign-object proxies using only allowed LAB domains and
real/integer arithmetic: p-adic Monna coordinates, rotor/KAM phase functions,
stat-mech fugacity, entropy, local gap-geometry and Lyapunov proxies,
topological persistence proxy, fixed-shift graph degree proxy, category
magnitude-style decay, and a Hamiltonian shell proxy.

Summary:
- Total specs: 12.
- Auto-promotes from bars 2-4: 0.
- No screenshots required because no candidate cleared the promotion gate.

Strongest negative result:
all tested cross-domain formulas stayed generic under the gauntlet. The best
linearity was only `0.0156`, the best flatness was `0.307`, and every holdout
score was `0`. This batch found no live cross-domain frontier beyond the
already logged `primon` source-built calibration artifact.

## Cycle 5 - survival-aware generator batch

Command:
`node scripts/hunt.mjs gen 120 | node scripts/hunt.mjs batch | tee logs/2026-06-15-critical-line-hunt-cycle5.jsonl`

Context: this cycle used the post-Cycle-4 weights:
`dyexp-compose=0.88`, `gaps-stack=0.96`, `lab-residual=0.94`, all other
ordinary generator families near `1.00`.

Summary:
- Total specs: 120.
- Auto-promotes from bars 2-4: 9.
- Family yields: `dyexp-compose` 5/10, `gaps-stack` 3/12,
  `mu-walk-chip` 1/16; all other families 0.
- Annotated artifact:
  `logs/2026-06-15-critical-line-hunt-cycle5-annotated.jsonl`.
- `node scripts/hunt.mjs update logs/2026-06-15-critical-line-hunt-cycle5-annotated.jsonl`
  updated `logs/bias.md` with survival-aware penalties. New lesson:
  `FAIL dyexp-compose: 5/10 promoted but retired at bar 5 (known)`.
- Required promoted-candidate screenshots:
  `logs/shots/cycle5-01-gaps-stack.png`,
  `logs/shots/cycle5-02-dyexp-compose.png`,
  `logs/shots/cycle5-03-mu-walk-chip.png`,
  `logs/shots/cycle5-04-gaps-stack.png`,
  `logs/shots/cycle5-05-dyexp-compose.png`,
  `logs/shots/cycle5-06-dyexp-compose.png`,
  `logs/shots/cycle5-07-dyexp-compose.png`,
  `logs/shots/cycle5-08-gaps-stack.png`,
  `logs/shots/cycle5-09-dyexp-compose.png`.
  Manifest: `logs/shots/cycle5-manifest.json`.
  Contact sheet: `logs/shots/cycle5-contact-sheet.png`.

Promoted specs and bar-5 disposition:

| family | object | real | twin | holdout | disposition |
| --- | --- | --- | --- | ---: | --- |
| `gaps-stack` | cumulative centered-gap walk + `sqrt` + `sqrt` + `cos` | `lin=0.7651 flat=0.795 thetaY=-0.255` | `thetaY=-0.129` | 0 | `KNOWN/ARTIFACT`: pointwise display transform of logged Chebyshev/gap residual; no line/flat law and no holdout. |
| `dyexp-compose` | prime race walk + `dyexp` + `dyexp` | `lin=0.8064 flat=0.339 thetaY=0.403` | `thetaY=0.290` | 0 | `KNOWN/ARTIFACT`: dyadic postprocessing of Chebyshev-race walk; no non-telescoping centered residual. |
| `mu-walk-chip` | Mertens walk + `norm` + `mod 418` + `symlog` | `lin=0.0139 flat=0.977 thetaY=-0.054` | `thetaY=-0.194` | 0 | `KNOWN/ARTIFACT`: display transform of logged Mertens branch; no line/flat law and no holdout. |
| `gaps-stack` | cumulative centered-gap walk + `symlog` + `symlog` + `cumsum` | `lin=0.9997 flat=0.595 thetaY=0.946` | `thetaY=0.833` | 0.966 | `ARTIFACT`: the visible line is an uncentered additive cost over the already logged gap/Chebyshev residual path, not cancellation and not a non-telescoping residual statement. |
| `dyexp-compose` | gaps walk + `dyexp` | `lin=0.8838 flat=0.388 thetaY=0.483` | `thetaY=0.355` | 0 | `KNOWN/ARTIFACT`: repeat of the retired dyadic cumulative-gap bucket. |
| `dyexp-compose` | duplicate gaps walk + `dyexp` at `N=30000` | same bucket | same bucket | 0 | duplicate retired. |
| `dyexp-compose` | duplicate gaps walk + `dyexp` at `N=40000` | same bucket | same bucket | 0 | duplicate retired. |
| `gaps-stack` | gaps walk + scale + `cumsum` + `diff` | `lin=0.7709 flat=0.415 thetaY=0.478` | `thetaY=0.712` | 0 | `KNOWN/ARTIFACT`: `cumsum` followed by `diff` collapses back to the scaled cumulative centered-gap path, up to endpoint convention. |
| `dyexp-compose` | gaps walk + `dyexp` + scale | `lin=0.8838 flat=0.388 thetaY=0.483` | `thetaY=0.355` | 0 | duplicate dyadic cumulative-gap bucket. |

Cycle 5 survivor count: 0.

Frontier after Cycle 5:
- The generator still repeatedly promotes display transforms of already logged
  walks. Survival-aware learning has now twice penalized `dyexp-compose`, but
  it remains attractive because the mechanical exponent contrast ignores
  bar-1 substance.
- The next useful code/tooling improvement would be a hard prefilter or
  scoring penalty for promoted rows with `holdoutR2=0` and for uncentered
  `cumsum` after pointwise transforms of `gaps:walk`/`mobius:walk`.

## Cycle 5b - fresh cross-domain LAB probes

Command:
`node --input-type=module - <<'NODE' | node scripts/hunt.mjs batch | tee logs/2026-06-15-critical-line-hunt-crossdomain3.jsonl`

Scope: 12 new prime-fed foreign-object proxies using allowed LAB formulas:
renormalized gap ratios, Binder-cumulant style gap transform, local graph
free-energy and Laplacian degree proxies, persistence lifetime, ergodic return
map, p-adic/local shell, least-action second difference, category-magnitude
window, curvature of log gaps, two-angle Hamiltonian energy, and an
ultrametric gap shell.

Summary:
- Total specs: 12.
- Auto-promotes from bars 2-4: 0.
- No screenshots required because no candidate cleared the promotion gate.

Strongest negative result:
all Cycle 5b cross-domain formulas stayed generic or noisy under the gauntlet.
The best linearity was `0.0144`, best flatness `0.401`, and all holdout
scores were `0`.

## Cycle 6 - survival-aware generator batch

Command:
`node scripts/hunt.mjs gen 140 | node scripts/hunt.mjs batch | tee logs/2026-06-15-critical-line-hunt-cycle6.jsonl`

Context: this cycle used the post-Cycle-5 weights, including the reduced
`dyexp-compose=0.67`, `gaps-stack=0.84`, and `lab-residual=0.95`.

Summary:
- Total specs: 140.
- Auto-promotes from bars 2-4: 13.
- Family yields: `lab-residual` 4/13, `gaps-stack` 4/20,
  `mu-walk-chip` 4/24, `dyexp-compose` 1/9; all other families 0.
- Annotated artifact:
  `logs/2026-06-15-critical-line-hunt-cycle6-annotated.jsonl`.
- `node scripts/hunt.mjs update logs/2026-06-15-critical-line-hunt-cycle6-annotated.jsonl`
  updated `logs/bias.md` with a survival-aware penalty. New lesson:
  `FAIL lab-residual: 4/13 promoted but retired at bar 5 (known)`.
- Required promoted-candidate screenshots:
  `logs/shots/cycle6-01-lab-residual.png`,
  `logs/shots/cycle6-02-gaps-stack.png`,
  `logs/shots/cycle6-03-gaps-stack.png`,
  `logs/shots/cycle6-04-mu-walk-chip.png`,
  `logs/shots/cycle6-05-gaps-stack.png`,
  `logs/shots/cycle6-06-lab-residual.png`,
  `logs/shots/cycle6-07-mu-walk-chip.png`,
  `logs/shots/cycle6-08-lab-residual.png`,
  `logs/shots/cycle6-09-gaps-stack.png`,
  `logs/shots/cycle6-10-dyexp-compose.png`,
  `logs/shots/cycle6-11-mu-walk-chip.png`,
  `logs/shots/cycle6-12-lab-residual.png`,
  `logs/shots/cycle6-13-mu-walk-chip.png`.
  Manifest: `logs/shots/cycle6-manifest.json`.
  Contact sheet: `logs/shots/cycle6-contact-sheet.png`.

Promoted specs and bar-5 disposition:

| family | object | real | twin | holdout | disposition |
| --- | --- | --- | --- | ---: | --- |
| `lab-residual` | `domain:"prime", ey:"n - pi(n)*log(pi(n))"` at `N=30000` | `lin=0.9999 flat=0.609 thetaY=0.983` | `thetaY=0.983` | 0.994 | `KNOWN-MATH`: prime-index PNT coordinate `p_k ~ k log k`; already retired. |
| `gaps-stack` | cumulative centered-gap walk + `dyexp` + `abs` + `cumsum` | `lin=0.9857 flat=0.759 thetaY=1.378` | `thetaY=1.061` | 0.411 | `ARTIFACT`: uncentered additive cost over dyadic-smoothed Chebyshev/gap residual; no non-telescoping cancellation law. |
| `gaps-stack` | cumulative centered-gap walk + offset `289.764` | `lin=0.7709 flat=0.224 thetaY=0.207` | `thetaY=0.405` | 0 | `KNOWN/ARTIFACT`: shifted display transform of logged cumulative centered-gap path; failed holdout. |
| `mu-walk-chip` | Mertens walk + offset `206.275` | `lin=0.0197 flat=0.245 thetaY=0.020` | `thetaY=0.124` | 0 | `KNOWN/ARTIFACT`: shifted Mertens display; failed holdout. |
| `gaps-stack` | cumulative centered-gap walk + two offsets | `lin=0.7709 flat=1.100 thetaY=-0.298` | `thetaY=0.146` | 0 | `KNOWN/ARTIFACT`: shifted cumulative-gap display; failed holdout. |
| `lab-residual` | duplicate PNT-index coordinate at `N=40000` | same bucket | same bucket | 0.994 | duplicate retired. |
| `mu-walk-chip` | Mertens walk + scale + offset | `lin=0.0197 flat=0.582 thetaY=0.079` | `thetaY=0.256` | 0 | `KNOWN/ARTIFACT`: affine display transform of Mertens walk; failed holdout. |
| `lab-residual` | duplicate PNT-index coordinate at `N=20000` | same bucket | same bucket | 0.994 | duplicate retired. |
| `gaps-stack` | scaled cumulative centered-gap walk | `lin=0.7709 flat=0.415 thetaY=0.478` | `thetaY=0.712` | 0 | `KNOWN/ARTIFACT`: scaled Chebyshev/gap residual branch; already retired. |
| `dyexp-compose` | gaps walk + `dyexp` | `lin=0.8838 flat=0.388 thetaY=0.483` | `thetaY=0.355` | 0 | `KNOWN/ARTIFACT`: repeat of retired dyadic cumulative-gap bucket. |
| `mu-walk-chip` | Mertens walk + `norm` + `mod 361` | `lin=0.0173 flat=1.063 thetaY=-0.054` | `thetaY=-0.210` | 0 | `KNOWN/ARTIFACT`: arbitrary modulo display transform of Mertens branch; failed holdout. |
| `lab-residual` | duplicate PNT-index coordinate at `N=30000` | same bucket | same bucket | 0.994 | duplicate retired. |
| `mu-walk-chip` | Mertens walk + `abs` + `abs` + `cumsum` | `lin=0.9755 flat=0.755 thetaY=1.489` | `thetaY=1.331` | 0.375 | `ARTIFACT`: uncentered additive cost of absolute Mertens values; not a cancellation residual and twin is close. |

Cycle 6 survivor count: 0.

Frontier after Cycle 6:
- Survival-aware learning shifted the repeated failure from `dyexp-compose`
  to `lab-residual`: the PNT-index line is still mechanically attractive
  because it has excellent holdout, but it is fully known.
- The non-PNT promotions remain display transforms of the two already logged
  summatory branches: cumulative centered gaps/Chebyshev and Mertens. None
  states a non-telescoping residual.
- No 2-D front promoted in this cycle. The 2-D rows tested by the generator
  were generic/twin-matched or blew up in the `family` view.

## Cycle 6b - fresh cross-domain LAB probes

Command:
`node --input-type=module - <<'NODE' | node scripts/hunt.mjs batch | tee logs/2026-06-15-critical-line-hunt-crossdomain4.jsonl`

Scope: 16 new prime-fed foreign-object proxies using allowed LAB formulas:
renormalized log-gap flow, Binder-style gap cumulant, local gap curvature,
persistence lifetime, category-magnitude kernels, p-adic gap shell, ergodic
return maps, Hamiltonian gap energy, spectral rough degree, least-action
second log-difference, ultrametric depth, rough-front free energy, and
two-scale magnitude kernels.

Summary:
- Total specs: 16.
- Auto-promotes from bars 2-4: 0.
- No screenshots required because no candidate cleared the promotion gate.

Strongest negative result:
the cross-domain residual templates remained pointwise/generic. Best
linearity was `0.0284`, best flatness was `0.065`, and all holdout scores
were `0`.

## Cycle 7 - survival-aware generator batch

Command:
`node scripts/hunt.mjs gen 160 | node scripts/hunt.mjs batch | tee logs/2026-06-15-critical-line-hunt-cycle7.jsonl`

Summary:
- Total specs: 160.
- Auto-promotes from bars 2-4: 12.
- Family yields: `lab-residual` 4/15, `dyexp-compose` 3/19,
  `prime-walk-chip` 3/23, `gaps-stack` 1/13, `mu-walk-chip` 1/20;
  `residue-mod-cumsum`, `twoD-front`, `polyprime-stack`, and `expsum-cos`
  produced 0 promotions.
- Annotated artifact:
  `logs/2026-06-15-critical-line-hunt-cycle7-annotated.jsonl`.
- `node scripts/hunt.mjs update logs/2026-06-15-critical-line-hunt-cycle7-annotated.jsonl`
  found 0 all-bar survivors and updated `logs/bias.md` with a survival-aware
  penalty. New lesson: `FAIL lab-residual: 4/15 promoted but retired at bar 5
  (known)`.
- Required promoted-candidate screenshots:
  `logs/shots/cycle7-01-dyexp-compose.png`,
  `logs/shots/cycle7-02-gaps-stack.png`,
  `logs/shots/cycle7-03-dyexp-compose.png`,
  `logs/shots/cycle7-04-lab-residual.png`,
  `logs/shots/cycle7-05-lab-residual.png`,
  `logs/shots/cycle7-06-prime-walk-chip.png`,
  `logs/shots/cycle7-07-dyexp-compose.png`,
  `logs/shots/cycle7-08-lab-residual.png`,
  `logs/shots/cycle7-09-mu-walk-chip.png`,
  `logs/shots/cycle7-10-prime-walk-chip.png`,
  `logs/shots/cycle7-11-prime-walk-chip.png`,
  `logs/shots/cycle7-12-lab-residual.png`.
  Manifest: `logs/shots/cycle7-manifest.json`.
  Contact sheet: `logs/shots/cycle7-contact-sheet.png`.

Promoted specs and bar-5 disposition:

| family | object | real | twin | holdout | disposition |
| --- | --- | --- | --- | ---: | --- |
| `dyexp-compose` | gaps walk + `dyexp` + `norm` | `lin=0.8838 flat=0.388 thetaY=-0.027` | `lin=0.8806 thetaY=-0.138` | 0 | `KNOWN/ARTIFACT`: display transform of cumulative centered-gap/Chebyshev path; no non-telescoping residual. |
| `gaps-stack` | gaps walk + `abs` | `lin=0.7709 flat=0.415 thetaY=0.478` | `lin=0.8689 thetaY=0.712` | 0 | `KNOWN/ARTIFACT`: absolute-value display of centered-gap walk; twin/holdout do not isolate a prime-only law. |
| `dyexp-compose` | gaps walk + `dyexp` at `N=40000` | `lin=0.8838 flat=0.388 thetaY=0.483` | `lin=0.8806 thetaY=0.355` | 0 | Repeat of retired dyadic cumulative-gap bucket. |
| `lab-residual` | `domain:"prime", ey:"n - pi(n)*log(pi(n))"` at `N=40000` | `lin=0.9999 flat=0.609 thetaY=0.983` | `thetaY=0.983` | 0.994 | `KNOWN-MATH`: prime-index PNT coordinate `p_k ~ k log k`; already retired. |
| `lab-residual` | duplicate PNT-index coordinate | same bucket | same bucket | 0.994 | duplicate retired. |
| `prime-walk-chip` | primes walk + offset `491.519` + `cos` + `cumsum` | `lin=0.7639 flat=0.498 thetaY=0.966` | `lin=0.5565 thetaY=0.389` | 0 | `ARTIFACT`: uncentered trigonometric cumulative cost over Chebyshev race walk; failed holdout. |
| `dyexp-compose` | duplicate gaps walk + `dyexp` at `N=30000` | same bucket | same bucket | 0 | repeat retired. |
| `lab-residual` | duplicate PNT-index coordinate | same bucket | same bucket | 0.994 | duplicate retired. |
| `mu-walk-chip` | Mertens walk + `norm` + `mod 6` | `lin=0.0159 flat=0.956 thetaY=-0.060` | `lin=0.3071 thetaY=-0.180` | 0 | `KNOWN/ARTIFACT`: arbitrary modulo display transform of Mertens walk; failed holdout. |
| `prime-walk-chip` | primes walk + `cos` + `sin` + `cumsum` | `lin=0.7597 flat=0.599 thetaY=0.614` | `lin=0.4635 thetaY=0.323` | 0 | `ARTIFACT`: uncentered trig cumulative cost over the race walk; failed holdout. |
| `prime-walk-chip` | primes walk + `norm` + `mod 395` | `lin=0.0005 flat=0.026 thetaY=0` | `lin=0.1512 thetaY=-0.208` | 0 | `ARTIFACT`: arbitrary normalization/modulo display flatness; no statement and failed holdout. |
| `lab-residual` | duplicate PNT-index coordinate at `N=30000` | same bucket | same bucket | 0.994 | duplicate retired. |

Cycle 7 survivor count: 0.

## Cycle 7b - targeted residual/LAB probes

Command:
`node --input-type=module - <<'NODE' | node scripts/hunt.mjs batch | tee logs/2026-06-15-critical-line-hunt-targeted7.jsonl`

Scope: 24 targeted residual probes using the exposed real/integer LAB catalog
and previously logged near misses: predecessor-weighted Mobius/gap residuals,
squarefree/divisor covariance variants, centered gap second-moment formulas,
rough-row visibility, Thue-Morse balance, local autocorrelation, and prime-row
features.

Summary:
- Total specs: 24.
- Auto-promotes from bars 2-4: 0.
- No screenshots required because no targeted candidate cleared the promotion
  gate.
- Closest misses: `target/roughmiss-centered` reached `lin=0.9965` with
  holdout `0.453`, but remained a known rough-gap/row-visibility geometry;
  `target/gap-z2-centered` reached `flat=0.028`, but had holdout `0` and no
  persistence.

Frontier after Cycle 7:
- No 5-bar survivor.
- The generator is still attracted to three already-retired structures:
  prime-index PNT straightening, cumulative centered-gap/Chebyshev display
  transforms, and Mertens/prime-walk chip displays.
- The current best open direction is not another pointwise raw transform. It
  remains a genuinely non-telescoping cumulative residual with its own null,
  preferably from a 2-D front or a cross-domain object that creates a new
  subtraction rather than another display chip.

## Cycle 8 - survival-aware generator batch

Command:
`node scripts/hunt.mjs gen 180 | node scripts/hunt.mjs batch | tee logs/2026-06-15-critical-line-hunt-cycle8.jsonl`

Summary:
- Total specs: 180.
- Auto-promotes from bars 2-4: 13.
- Family yields: `lab-residual` 6/18, `dyexp-compose` 4/22,
  `gaps-stack` 2/23, `mu-walk-chip` 1/18; all other families 0.
- Annotated artifacts:
  `logs/2026-06-15-critical-line-hunt-cycle8-annotated.jsonl`,
  `logs/2026-06-15-critical-line-hunt-cycle8-combined-annotated.jsonl`.
- `node scripts/hunt.mjs update logs/2026-06-15-critical-line-hunt-cycle8-combined-annotated.jsonl`
  found 0 all-bar survivors and updated `logs/bias.md` with a
  survival-aware penalty. New lesson: `FAIL lab-residual: 6/18 promoted but
  retired at bar 5 (known)`.
- Required promoted-candidate screenshots:
  `logs/shots/cycle8-01-cycle8-mu-walk-chip.png`,
  `logs/shots/cycle8-02-cycle8-lab-residual.png`,
  `logs/shots/cycle8-03-cycle8-dyexp-compose.png`,
  `logs/shots/cycle8-04-cycle8-gaps-stack.png`,
  `logs/shots/cycle8-05-cycle8-lab-residual.png`,
  `logs/shots/cycle8-06-cycle8-dyexp-compose.png`,
  `logs/shots/cycle8-07-cycle8-dyexp-compose.png`,
  `logs/shots/cycle8-08-cycle8-lab-residual.png`,
  `logs/shots/cycle8-09-cycle8-lab-residual.png`,
  `logs/shots/cycle8-10-cycle8-gaps-stack.png`,
  `logs/shots/cycle8-11-cycle8-lab-residual.png`,
  `logs/shots/cycle8-12-cycle8-dyexp-compose.png`,
  `logs/shots/cycle8-13-cycle8-lab-residual.png`.
  Manifest/contact sheet include the targeted candidate too:
  `logs/shots/cycle8-manifest.json`,
  `logs/shots/cycle8-contact-sheet.png`.

Promoted specs and bar-5 disposition:

| family | object | real | twin | holdout | disposition |
| --- | --- | --- | --- | ---: | --- |
| `mu-walk-chip` | Mertens walk + `mod 308` + `abs` | `lin=0.0123 flat=0.802 thetaY=-0.087` | `thetaY=0.016` | 0 | `KNOWN/ARTIFACT`: arbitrary modulo/absolute display transform of Mertens; no residual statement and failed holdout. |
| `lab-residual` | `domain:"prime", ey:"n - pi(n)*log(pi(n))"` | `lin=0.9999 flat=0.609 thetaY=0.983` | `thetaY=0.983` | 0.994 | `KNOWN-MATH`: prime-index PNT coordinate `p_k ~ k log k`; duplicate retired. |
| `dyexp-compose` | gaps walk + `dyexp` | `lin=0.8838 flat=0.388 thetaY=0.483` | `thetaY=0.355` | 0 | `KNOWN/ARTIFACT`: dyadic transform of cumulative centered-gap/Chebyshev path; failed holdout. |
| `gaps-stack` | gaps walk + `sqrt` + `diff` + `dyexp` | `lin=0.0003 flat=1.288 thetaY=-0.097` | `thetaY=0.216` | 0 | `KNOWN/ARTIFACT`: order-sensitive display transform of the same cumulative-gap branch; no line/flat law. |
| `lab-residual` | duplicate PNT-index coordinate | same bucket | same bucket | 0.994 | duplicate retired. |
| `dyexp-compose` | gaps walk + `dyexp` + `norm` | `lin=0.8838 flat=0.388 thetaY=-0.027` | `thetaY=-0.138` | 0 | repeat retired dyadic bucket. |
| `dyexp-compose` | duplicate gaps walk + `dyexp` | same bucket | same bucket | 0 | duplicate retired. |
| `lab-residual` | duplicate PNT-index coordinate | same bucket | same bucket | 0.994 | duplicate retired. |
| `lab-residual` | duplicate PNT-index coordinate | same bucket | same bucket | 0.994 | duplicate retired. |
| `gaps-stack` | gaps walk + `dyexp` + offset `-983.058` | `lin=0.8838 flat=0.814 thetaY=-0.293` | `thetaY=0.186` | 0 | `KNOWN/ARTIFACT`: shifted dyadic display of cumulative-gap path; failed holdout. |
| `lab-residual` | duplicate PNT-index coordinate | same bucket | same bucket | 0.994 | duplicate retired. |
| `dyexp-compose` | duplicate gaps walk + `dyexp` | same bucket | same bucket | 0 | duplicate retired. |
| `lab-residual` | duplicate PNT-index coordinate | same bucket | same bucket | 0.994 | duplicate retired. |

Cycle 8 survivor count: 0.

## Cycle 8b - targeted residual/foreign-object probes

Command:
`node --input-type=module - <<'NODE' | node scripts/hunt.mjs batch | tee logs/2026-06-15-critical-line-hunt-targeted8.jsonl`

Scope: 30 targeted probes using exposed residual functions and foreign-object
proxies: Mobius-predecessor/gap residual scalings, squarefree and oddpart
covariances, adjacent-gap and second-gap moments, rough-row and row-visibility
features, Euler-quotient tails, p-adic Monna coordinates, ergodic gap maps,
Hamiltonian gap energy, category-magnitude kernels, spectral gap phases,
topology lifetime proxies, and two-scale magnitude kernels.

Summary:
- Total specs: 30.
- Auto-promotes from bars 2-4: 1.
- Annotated artifact:
  `logs/2026-06-15-critical-line-hunt-targeted8-annotated.jsonl`.
- Required targeted screenshot:
  `logs/shots/cycle8-14-targeted8-target8-rowvis-free-energy.png`.
- Closest nonpromoted flatness repeat:
  `target8/gapz2-centered` had `flat=0.028`, but holdout `0` and no
  persistence, matching the prior centered gap-second-moment miss.

Promoted targeted spec:

| family | object | real | twin | holdout | disposition |
| --- | --- | --- | --- | ---: | --- |
| `target8/rowvis-free-energy` | `domain:"prime", ey:"(rowvis(n,a)-rowcount(n,a)/max(1,a))*sqrt(log(n))", a=30` | `lin=0.9997 flat=0.603 thetaY=0.960` | `thetaY=0.960` | 0.975 | `KNOWN-MATH/ARTIFACT`: `rowvis(n,30)=1` for primes beyond 30, while `rowcount(n,a)` resolves to the default row-visibility count table, which is a Legendre/Eratosthenes sieve prime-counting coordinate. This is a PNT/row-visibility display line, not a non-telescoping residual. |

Cycle 8b survivor count: 0.

Frontier after Cycle 8:
- No 5-bar survivor.
- Survival-aware weighting is now strongly suppressing `lab-residual`
  (`0.62`) and `dyexp-compose` (`0.61`), but the generator still rediscovers
  them through the pure-random floor.
- The targeted `rowvis` line confirms another retired funnel: local
  row-visibility is useful as a finite sieve dictionary, but any line that
  mixes it with row counts is a Legendre/PNT counting coordinate unless it
  states a new residual after local-shell subtraction.

## Cycle 9 - survival-aware generator batch + standalone residual walks

Command:
`node scripts/hunt.mjs gen 200 | node scripts/hunt.mjs batch | tee logs/2026-06-15-critical-line-hunt-cycle9.jsonl`

Summary:
- Total generator specs: 200.
- Auto-promotes from bars 2-4: 10.
- Family yields: `dyexp-compose` 4/24, `lab-residual` 3/14,
  `gaps-stack` 2/20, `prime-walk-chip` 1/26; all other generator families 0.
- Annotated artifacts:
  `logs/2026-06-15-critical-line-hunt-cycle9-annotated.jsonl`,
  `logs/2026-06-15-critical-line-hunt-custom9-annotated.jsonl`,
  `logs/2026-06-15-critical-line-hunt-cycle9-combined-annotated.jsonl`.
- `node scripts/hunt.mjs update logs/2026-06-15-critical-line-hunt-cycle9-combined-annotated.jsonl`
  found 0 all-bar survivors and updated `logs/bias.md`. New lesson:
  `FAIL dyexp-compose: 4/24 promoted but retired at bar 5 (known)`.
- Required promoted-candidate screenshots:
  `logs/shots/cycle9-01-lab-residual.png`,
  `logs/shots/cycle9-02-lab-residual.png`,
  `logs/shots/cycle9-03-dyexp-compose.png`,
  `logs/shots/cycle9-04-gaps-stack.png`,
  `logs/shots/cycle9-05-gaps-stack.png`,
  `logs/shots/cycle9-06-dyexp-compose.png`,
  `logs/shots/cycle9-07-prime-walk-chip.png`,
  `logs/shots/cycle9-08-dyexp-compose.png`,
  `logs/shots/cycle9-09-lab-residual.png`,
  `logs/shots/cycle9-10-dyexp-compose.png`.
  Manifest: `logs/shots/cycle9-manifest.json`.
  Contact sheet: `logs/shots/cycle9-contact-sheet.png`.

Promoted specs and bar-5 disposition:

| family | object | real | twin | holdout | disposition |
| --- | --- | --- | --- | ---: | --- |
| `lab-residual` | `domain:"prime", ey:"n - pi(n)*log(pi(n))"` at `N=40000` | `lin=0.9999 flat=0.609 thetaY=0.983` | `thetaY=0.983` | 0.994 | `KNOWN-MATH`: prime-index PNT coordinate `p_k ~ k log k`; duplicate retired. |
| `lab-residual` | duplicate PNT-index coordinate at `N=20000` | same bucket | same bucket | 0.994 | duplicate retired. |
| `dyexp-compose` | gaps walk + `dyexp` + scale `9.719` | `lin=0.8838 flat=0.388 thetaY=0.483` | `thetaY=0.355` | 0 | `KNOWN/ARTIFACT`: dyadic display transform of cumulative centered-gap/Chebyshev path; failed holdout. |
| `gaps-stack` | gaps walk + scale `-0.455` | `lin=0.7709 flat=0.415 thetaY=0.478` | `thetaY=0.712` | 0 | `KNOWN/ARTIFACT`: affine display transform of the logged cumulative centered-gap path; failed holdout. |
| `gaps-stack` | gaps walk + `abs` | `lin=0.7709 flat=0.415 thetaY=0.478` | `thetaY=0.712` | 0 | `KNOWN/ARTIFACT`: absolute display of the same cumulative centered-gap/Chebyshev branch; failed holdout. |
| `dyexp-compose` | duplicate gaps walk + `dyexp` | same bucket | same bucket | 0 | duplicate retired. |
| `prime-walk-chip` | primes walk + `dyexp` + `symlog` + `mod 450` | `lin=0.0016 flat=0.013 thetaY=-0.001` | `thetaY=-0.299` | 0 | `ARTIFACT`: arbitrary modulo/normalization display flatness over the prime race walk; no invariant statement and failed holdout. |
| `dyexp-compose` | gaps walk + `dyexp` + `sqrt` | `lin=0.8303 flat=0.223 thetaY=0.241` | `thetaY=0.136` | 0 | `KNOWN/ARTIFACT`: dyadic display transform of cumulative gaps; failed holdout. |
| `lab-residual` | duplicate PNT-index coordinate | same bucket | same bucket | 0.994 | duplicate retired. |
| `dyexp-compose` | primes walk + `dyexp` + `dyexp` | `lin=0.8064 flat=0.339 thetaY=0.403` | `thetaY=0.290` | 0 | `KNOWN/ARTIFACT`: dyadic postprocessing of the Chebyshev/prime-race walk; failed holdout. |

Cycle 9 standalone residual-walk screen:
- Six non-telescoping event-score walks were tested through
  `N=25000,50000,100000,200000` with Cramer twins and a shuffled-order
  diagnostic: predecessor-Mobius centered gap, Mobius-edge gap product,
  gap second difference, local gap energy, parity-modulated gap energy, and
  rough-first-offset residual.
- Output: `logs/2026-06-15-critical-line-hunt-custom9.jsonl`.
- Auto-promotes: 0. The strongest raw exponent gaps were unstable across the
  ladder or comparable to null/shuffle variance, so no screenshot escalation
  was required.

Cycle 9 survivor count: 0.

Frontier after Cycle 9:
- No 5-bar survivor.
- The generator is now down to `dyexp-compose=0.59` and `lab-residual=0.59`.
  The pure-random floor still rediscovers those buckets, but bar 5 keeps
  retiring them.
- The strongest OPEN direction remains outside raw pointwise transforms:
  a cumulative residual whose score is locally centered before summation and
  whose Cramer/null exponent contrast is stable on the full ladder.

## Cycle 10 - survival-aware generator batch + cross-domain residual screen

Command:
`node scripts/hunt.mjs gen 220 | node scripts/hunt.mjs batch | tee logs/2026-06-15-critical-line-hunt-cycle10.jsonl`

Summary:
- Total generator specs: 220.
- Auto-promotes from bars 2-4: 17.
- Family yields: `dyexp-compose` 8/20, `lab-residual` 5/17,
  `gaps-stack` 3/21, `prime-walk-chip` 1/30; all other generator families 0.
- Annotated artifacts:
  `logs/2026-06-15-critical-line-hunt-cycle10-annotated.jsonl`,
  `logs/2026-06-15-critical-line-hunt-crossdomain10-annotated.jsonl`,
  `logs/2026-06-15-critical-line-hunt-cycle10-combined-annotated.jsonl`.
- `node scripts/hunt.mjs update logs/2026-06-15-critical-line-hunt-cycle10-combined-annotated.jsonl`
  found 0 all-bar survivors and updated `logs/bias.md`. New lesson:
  `FAIL dyexp-compose: 8/20 promoted but retired at bar 5 (known)`.
- Required promoted-candidate screenshots:
  `logs/shots/cycle10-01-lab-residual.png` through
  `logs/shots/cycle10-17-dyexp-compose.png`.
  Manifest: `logs/shots/cycle10-manifest.json`.
  Contact sheet: `logs/shots/cycle10-contact-sheet.png`.

Promoted specs and bar-5 disposition:

| family | object | real | twin | holdout | disposition |
| --- | --- | --- | --- | ---: | --- |
| `lab-residual` | `domain:"prime", ey:"n - pi(n)*log(pi(n))"` | `lin=0.9999 flat=0.609 thetaY=0.983` | `thetaY=0.983` | 0.994 | `KNOWN-MATH`: prime-index PNT coordinate `p_k ~ k log k`; duplicate retired. |
| `dyexp-compose` | gaps walk + `dyexp` | `lin=0.8838 flat=0.388 thetaY=0.483` | `thetaY=0.355` | 0 | `KNOWN/ARTIFACT`: dyadic display transform of cumulative centered-gap/Chebyshev path; failed holdout. |
| `gaps-stack` | gaps walk + `dyexp` + `dyexp` | `lin=0.9027 flat=0.385 thetaY=0.486` | `thetaY=0.086` | 0 | `KNOWN/ARTIFACT`: double dyadic smoothing of cumulative centered gaps; failed holdout. |
| `dyexp-compose` | primes walk + `dyexp` + offset | `lin=0.6744 flat=0.468 thetaY=-0.225` | `thetaY=0.025` | 0 | `KNOWN/ARTIFACT`: dyadic/affine display of the Chebyshev prime-race walk; failed holdout. |
| `lab-residual` | four more duplicate PNT-index coordinates | same bucket | same bucket | 0.994 | duplicate retired. |
| `gaps-stack` | gaps walk + `norm` + `dyexp` + `sqrt` | `lin=0.8303 flat=0.223 thetaY=-0.005` | `thetaY=-0.237` | 0 | `KNOWN/ARTIFACT`: normalized dyadic display of cumulative centered gaps; failed holdout. |
| `dyexp-compose` | five more gaps walk + `dyexp` variants | `lin≈0.8838 flat=0.388 thetaY≈0.483` | `thetaY≈0.355` | 0 | duplicate retired dyadic cumulative-gap bucket. |
| `prime-walk-chip` | primes walk + offset + `mod 138` + `diff` | `lin=0 flat=4.645 thetaY=0.273` | `thetaY=-0.136` | 0 | `ARTIFACT`: arbitrary display chip over the Chebyshev prime-race walk; no invariant statement and failed holdout. |
| `gaps-stack` | gaps walk + `cumsum` + `norm` + `symlog` | `lin=0.9982 flat=0.685 thetaY=-0.005` | `thetaY=-0.119` | 0.921 | `ARTIFACT`: uncentered cumulative display transform of the logged gap/Chebyshev path; below holdout line threshold and no non-telescoping residual. |

Cycle 10 cross-domain residual screen:
- Seven foreign-object event-score walks were tested through
  `N=25000,50000,100000,200000` with five Cramer twins and a shuffled-order
  diagnostic: stat-mech Ising gap energy, KAM/Lyapunov gap map,
  spectral transition front modulo 30, topology gap lifetime,
  category gap magnitude, p-adic shell flow, and Hamiltonian two-gap action.
- Output: `logs/2026-06-15-critical-line-hunt-crossdomain10.jsonl`.
- Auto-promotes: 0.
- Closest nonpromoted leads:
  `spectral-transition-front-q30` had stable real `thetaY=0.2682`
  with `R2=0.9644`, but Cramer twins reproduced it (`0.2579 ± 0.1226`);
  `category-gap-magnitude` had stable real `thetaY=0.1528`
  with `R2=0.9847`, but the gap to Cramer/shuffle was not decisive.

Cycle 10 survivor count: 0.

Frontier after Cycle 10:
- No 5-bar survivor.
- Survival-aware weights now suppress the three main attractors:
  `dyexp-compose=0.50`, `lab-residual=0.54`, `gaps-stack=0.71`.
- The live OPEN lead is not a candidate yet: category/spectral front
  residuals produce stable exponents, but current matched nulls reproduce the
  scale. A useful next mutation would whiten the local transition or magnitude
  score against a Cramer-trained shell before summation.

## Cycle 11 - survival-aware generator batch + whitened cross-domain screen

Command:
`node scripts/hunt.mjs gen 240 | node scripts/hunt.mjs batch | tee logs/2026-06-15-critical-line-hunt-cycle11.jsonl`

Summary:
- Total generator specs: 240.
- Auto-promotes from bars 2-4: 14.
- Family yields: `lab-residual` 4/24, `dyexp-compose` 4/18,
  `gaps-stack` 2/23, `prime-walk-chip` 2/20, `mu-walk-chip` 1/35,
  `polyprime-stack` 1/29; all other generator families 0.
- Annotated artifacts:
  `logs/2026-06-15-critical-line-hunt-cycle11-annotated.jsonl`,
  `logs/2026-06-15-critical-line-hunt-whitened11-annotated.jsonl`,
  `logs/2026-06-15-critical-line-hunt-cycle11-combined-annotated.jsonl`.
- `node scripts/hunt.mjs update logs/2026-06-15-critical-line-hunt-cycle11-combined-annotated.jsonl`
  found 0 all-bar survivors and updated `logs/bias.md`. New lesson:
  `FAIL lab-residual: 4/24 promoted but retired at bar 5 (known)`.
- Required promoted-candidate screenshots:
  `logs/shots/cycle11-01-lab-residual.png` through
  `logs/shots/cycle11-14-dyexp-compose.png`.
  Manifest: `logs/shots/cycle11-manifest.json`.
  Contact sheet: `logs/shots/cycle11-contact-sheet.png`.

Promoted specs and bar-5 disposition:

| family | object | real | twin | holdout | disposition |
| --- | --- | --- | --- | ---: | --- |
| `lab-residual` | `domain:"prime", ey:"n - pi(n)*log(pi(n))"` | `lin=0.9999 flat=0.609 thetaY=0.983` | `thetaY=0.983` | 0.994 | `KNOWN-MATH`: prime-index PNT coordinate `p_k ~ k log k`; four duplicate rows retired. |
| `gaps-stack` | scaled cumulative centered-gap walk | `lin=0.7709 flat=0.415 thetaY=0.478` | `thetaY=0.712` | 0 | `KNOWN/ARTIFACT`: affine display of the logged cumulative centered-gap/Chebyshev path; failed holdout. |
| `polyprime-stack` | `F_q[t]` graph + `diff` + `cos` | `lin=0.0004 flat=0.006 thetaY=0` | no Cramer twin; shuffle invalid | 1 | `ARTIFACT/INCONCLUSIVE`: order-sensitive finite-polynomial display flatness, not an integer-prime non-telescoping residual. |
| `dyexp-compose` | gaps walk + `dyexp` variants | `lin=0.8838 flat=0.388 thetaY=0.483` | `thetaY=0.355` | 0 | `KNOWN/ARTIFACT`: dyadic display transform of cumulative centered gaps; four rows retired. |
| `prime-walk-chip` | primes walk + scale/mod/diff or symlog/sin | `flat=3.468 thetaY=-0.278` or `thetaY=-0.092` | not decisive | 0 | `ARTIFACT`: arbitrary chip display over the Chebyshev prime-race walk; no invariant statement. |
| `mu-walk-chip` | Mertens walk + norm/symlog/mod | `lin=0.0173 flat=1.062 thetaY=-0.054` | `thetaY=-0.210` | 0 | `KNOWN/ARTIFACT`: postprocessed Mertens display; failed holdout. |
| `gaps-stack` | gaps walk + `abs` | `lin=0.7709 flat=0.415 thetaY=0.478` | `thetaY=0.712` | 0 | `KNOWN/ARTIFACT`: absolute display of cumulative centered gaps; duplicate retired. |

Cycle 11 whitened cross-domain screen:
- Eight Cramer-whitened foreign-object residual walks were tested through
  `N=25000,50000,100000,200000`: spectral transition modulo `30`,
  category-theory gap magnitude, hybrid spectrum/magnitude, and front
  curvature, each with an alternate centering.
- Output: `logs/2026-06-15-critical-line-hunt-whitened11.jsonl`.
- Auto-promotes: 0.
- Stable-looking real exponents were reproduced by shuffled prime order:
  spectral transition `thetaY=0.9492` vs shuffle `0.952`,
  category magnitude `thetaY=0.86` vs shuffle `0.8747`, hybrid
  spectrum/magnitude `thetaY=0.9023` vs shuffle `0.904`, and front-curvature
  alternate `thetaY=1.0328` vs shuffle `1.0053`.

Cycle 11 survivor count: 0.

Frontier after Cycle 11:
- No 5-bar survivor.
- Survival-aware weights now include `dyexp-compose=0.49`,
  `lab-residual=0.54`, `gaps-stack=0.71`, and `prime-walk-chip=0.88`.
- The strongest OPEN lead remains cross-domain but not yet a candidate:
  locally whitened spectral/category event scores produce very straight
  exponent fits, yet the shuffled-order control preserves the same scaling.
  The next useful mutation needs a statistic that is sensitive to prime order
  or arithmetic adjacency after local centering, not just to the multiset of
  gap/event scores.

## Cycle 12 - survival-aware generator batch + order-adjacency screen

Command:
`node scripts/hunt.mjs gen 260 | node scripts/hunt.mjs batch | tee logs/2026-06-15-critical-line-hunt-cycle12.jsonl`

Summary:
- Total generator specs: 260.
- Auto-promotes from bars 2-4: 25.
- Family yields: `dyexp-compose` 9/24, `lab-residual` 8/26,
  `gaps-stack` 4/22, `prime-walk-chip` 2/34, `mu-walk-chip` 1/29,
  `polyprime-stack` 1/34; all other generator families 0.
- Annotated artifacts:
  `logs/2026-06-15-critical-line-hunt-cycle12-annotated.jsonl`,
  `logs/2026-06-15-critical-line-hunt-orderadj12-annotated.jsonl`,
  `logs/2026-06-15-critical-line-hunt-cycle12-combined-annotated.jsonl`.
- `node scripts/hunt.mjs update logs/2026-06-15-critical-line-hunt-cycle12-combined-annotated.jsonl`
  found 0 all-bar survivors and updated `logs/bias.md`. New lesson:
  `FAIL dyexp-compose: 9/24 promoted but retired at bar 5 (known)`.
- Required promoted-candidate screenshots:
  `logs/shots/cycle12-01-lab-residual.png` through
  `logs/shots/cycle12-25-dyexp-compose.png`.
  Manifest: `logs/shots/cycle12-manifest.json`.
  Custom frontier shot: `logs/shots/cycle12-26-cross-domain-orderadj.png`.
  Contact sheet: `logs/shots/cycle12-contact-sheet.png`.

Promoted specs and bar-5 disposition:

| family | object | real | twin | holdout | disposition |
| --- | --- | --- | --- | ---: | --- |
| `lab-residual` | `domain:"prime", ey:"n - pi(n)*log(pi(n))"` | `lin=0.9999 flat=0.609 thetaY=0.983` | `thetaY=0.983` | 0.994 | `KNOWN-MATH`: prime-index PNT coordinate `p_k ~ k log k`; eight duplicate rows retired. |
| `dyexp-compose` | gaps walk + `dyexp` variants, plus one prime-walk dyadic/offset row | `lin≈0.8838 flat=0.388 thetaY≈0.483` | `thetaY≈0.355` | 0 | `KNOWN/ARTIFACT`: dyadic display transform of cumulative centered gaps or prime-race walk; nine rows retired. |
| `gaps-stack` | scaled, shifted, or dyadic cumulative gap displays | `thetaY=-0.291..0.483` | not decisive | 0 | `KNOWN/ARTIFACT`: display transforms of the logged cumulative centered-gap/Chebyshev path; four rows retired. |
| `prime-walk-chip` | modulo/norm or double-dyadic prime walk | `flat=0.042` or `thetaY=0.403` | not decisive | 0 or 0.037 | `ARTIFACT`: arbitrary chip display over the Chebyshev prime-race walk; no invariant statement. |
| `mu-walk-chip` | Mertens walk + `cumsum` + `abs` | `thetaY=1.251` | `thetaY=1.132` | 0 | `KNOWN/ARTIFACT`: uncentered additive cost over a Mertens display; failed holdout. |
| `polyprime-stack` | `F_q[t]` graph + `diff` + `cos` | `flat=0.014` | no Cramer twin; shuffle invalid | 1 | `ARTIFACT/INCONCLUSIVE`: order-sensitive finite-polynomial display flatness, not an integer-prime non-telescoping residual. |

Cycle 12 order-adjacency cross-domain screen:
- Six Cramer-centered consecutive normalized-gap event walks were tested
  through `N=25000,50000,100000,200000` with five Cramer twins and a
  shuffled-order diagnostic: ergodic return rank curvature, topology turn
  lifetime, Hamiltonian gap action, KAM twist signed action, spectral
  Laplacian jerk, and ordinal extrema excess.
- Output: `logs/2026-06-15-critical-line-hunt-orderadj12.jsonl`.
- Mechanical promotions: 1.
- `ergodic-return-rank-curvature` had real `thetaY=1.2368`, `R2=0.9938`,
  Cramer mean `thetaY=0.7760`, and shuffled real values `thetaY=0.7493`.
  Bar 5 retires it: rank curvature is an ordinal adjacent-gap
  anti-persistence statistic, directly connected to the logged
  `ordinal normalized-gap extrema`, `gapac1mean`, and LO-S consecutive
  residue-transition branch.
- The other five order-adjacency rows were rejected before bar 5. The
  Hamiltonian action row had real `thetaY=0.8622`, but shuffle reproduced
  it (`0.9077`). Topology lifetime, KAM twist, spectral jerk, and ordinal
  extrema were either not decisive or not persistent.

Cycle 12 survivor count: 0.

Frontier after Cycle 12:
- No 5-bar survivor.
- Survival-aware weights now include `dyexp-compose=0.44`,
  `lab-residual=0.50`, `gaps-stack=0.67`, `prime-walk-chip=0.87`, and
  `cross-domain=0.92`.
- The order-sensitive custom screen did what it was supposed to do: it
  produced one twin/shuffle-beating exponent, but bar 5 recognized the
  object as known adjacent-gap anti-persistence. The remaining frontier is
  narrower: a future order statistic must subtract the LO-S/transition
  layer first, or use a genuinely non-gap-adjacent arithmetic feature.
