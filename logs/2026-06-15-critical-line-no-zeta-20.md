# 2026-06-15 · critical-line no-zeta 20-candidate visualization batch

Goal: create visualizations for the 20 proposed "critical line without zeta"
candidates, score the visible law where possible, and classify each as
project-novel, known mathematics, open classical problem, or unsupported.

Guardrail: "novel and undiscovered" is stricter than "not logged here." This
run treats finite-range plots as evidence for calibration only unless the
object is not already a named classical problem and survives a null/control
interpretation.

## Run

Script:

```sh
node scripts/critical-line-no-zeta-20.mjs 1000000 logs/critical-line-no-zeta-20-artifacts 12000
```

Artifacts:

- Dashboard: `logs/critical-line-no-zeta-20-artifacts/dashboard.html`
- Screenshot QA: `logs/critical-line-no-zeta-20-artifacts/dashboard.png`
- Summary table: `logs/critical-line-no-zeta-20-artifacts/summary.md`
- Machine summary: `logs/critical-line-no-zeta-20-artifacts/summary.json`
- Panels: `logs/critical-line-no-zeta-20-artifacts/01-*.svg` through
  `20-*.svg`

The dashboard rendered successfully under Playwright from the local file URL.

## Verdict

No candidate can be honestly called mathematically undiscovered from this run.

The strongest project-native survivors are:

1. `#7` Dyadic-Mobius `G2`.
2. `#8` E2 chip-order invariance.

These are new/useful instrument diagnostics here, but they are bounded dyadic
transforms of the Mobius/Mertens branch, so the run does not justify calling
them new mathematics.

The strongest mathematical pictures are:

1. `#3` Dirichlet divisor residual.
2. `#4` Gauss circle residual.
3. `#1/#17` squarefree and k-free residual ladder.

Those are genuine "critical exponent sibling" visuals, but they are named
classical problems/families. The plots are useful calibration, not discoveries.

The remaining candidates classify as known prime races, Cramer/Poisson gap
calibration, theta/psi disguises, Farey/totient/coprimality calibration,
additive-function CLT calibration, local residue-layer matrix geometry, or
the established Zaremba continued-fraction branch.

## Compact table

| # | candidate | verdict |
| ---: | --- | --- |
| 1 | Squarefree count `Q(x)` | known classical squarefree error |
| 2 | Liouville `L(x)` | known Polya/Liouville branch |
| 3 | Dirichlet divisor `Delta(x)` | open classical problem |
| 4 | Gauss circle `E(x)` | open classical problem |
| 5 | Totient summatory `Phi(x)` | known Farey/coprimality calibration |
| 6 | Normalized Mertens `sum mu(n)/n` | known Mertens branch |
| 7 | Dyadic-Mobius `G2` | project-novel diagnostic only |
| 8 | E2-invariance test | project-novel diagnostic only |
| 9 | Chebyshev bias mod 4 | known prime race |
| 10 | Race family mod 3,5,8 | known prime race family |
| 11 | Liouville AP bias mod 4 | known multiplicative-function AP race |
| 12 | Gap log-survival | known Cramer/Poisson calibration |
| 13 | `sum(g_n-log p_n)` | theta telescope disguise |
| 14 | Maximal gap vs `log^2 x` | known/conjectural gap theory |
| 15 | `sum(Omega-omega)` | known additive-function mean |
| 16 | Erdos-Kac balance | known CLT calibration |
| 17 | k-free ladder | known zeta-density family |
| 18 | Coprimality/Farey residual | overlaps totient |
| 19 | Matrix critical width `W` | known residue-layer front |
| 20 | Bounded-CF/Zaremba front | known/open Zaremba branch |

