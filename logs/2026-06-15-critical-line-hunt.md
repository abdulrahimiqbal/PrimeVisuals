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
