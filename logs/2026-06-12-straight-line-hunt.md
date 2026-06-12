# 2026-06-12 straight-line hunt

## Goal

Find a non-zeta, non-ZEROS straight-line or flat-line law built from elementary arithmetic ingredients in PrimeVisuals. The line itself is not the prize; the residual scaling is. A survivor must have finiteFrac = 1, persist at 2x and 4x range, survive shifted/prime-domain holdout where applicable, and differ from a Cramer fake-prime comparison so it is not just density.

## Starting context

- Read `MACHINE_HOW_TO_USE.md`.
- Read `KNOWLEDGE.md`.
- Existing memory to avoid rediscovering as new:
  - Exponential-sum rational peaks and matrix stripes are the same residue-class/Dirichlet layer.
  - Consecutive prime gaps have real lag-1 anticorrelation; Cramer comparison is a natural falsifier.
  - The next useful search should look below or beyond the residue layer.
- Forbidden for this hunt: `zeta(...)` and the `ZEROS` table.

## Plan

1. Sweep elementary integer and prime-domain formulas for sloped/flat lines and residual normalizations.
2. Recognize known RH-equivalent territory: Mertens/Mobius summatory, Chebyshev-style prime-power sums if implementable from allowed ingredients, Robin/Nicolas-like totient/primorial ratios if expressible.
3. For survivors, test 1x/2x/4x, shifted windows or domain changes, and Cramer fake-prime behavior.
4. Render shots for the best candidates and record shareable links.

## Interface check

`node scripts/explore.mjs ops` returned lab domains `int`, `prime`, `real`, `complex`; integer functions `mu`, `M`, `isprime`, `pi`, `gap`, `omega`, `bigomega`, `tau`, `phi`, `rad`; and patch sources including `primes`, `gaps`, `mobius`, `psi`, `zeta`, `zeros`. This hunt will use lab formulas and non-zeta/non-zeros patch sources only.

## Batch 1 — broad lab calibration at N = 50,000

Command shape: JSONL specs generated into `node scripts/explore.mjs batch`. All rows had `finiteFrac = 1`.

| label | domain | formula / axes | linearity | flatness | zero crossings | y-range | verdict |
| --- | --- | --- | ---: | ---: | ---: | --- | --- |
| M | int | `ey=M(n)` | 0.0206 | 1.3339 | 332 | [-88, 96] | not a line; baseline for Mertens residual |
| M_over_sqrt | int | `ey=M(n)/sqrt(n)` | 0.0247 | 1.2344 | 332 | [-0.894, 1] | ⭐ RH-neighbor flat-zero candidate |
| M_over_sqrt_log | int | `ey=M(n)/(sqrt(n)*log(max(n,3)))` | 0.0272 | 1.3289 | 332 | [-0.556, 0.910] | over-normalized near origin; not better |
| absM_over_sqrt | int | `ey=abs(M(n))/sqrt(n)` | 0.0014 | 0.7265 | 0 | [0, 1] | envelope view, not a line by itself |
| pi | int | `ey=pi(n)` | 0.9987 | 0.5329 | 0 | [0, 5133] | known PNT line; density-driven |
| pi_vs_nlogn_ratio | int | `ey=pi(n)*log(max(n,3))/n` | 0.5479 | 0.0130 | 0 | [0, 1.255] | flat PNT sanity check |
| pi_res_sqrt | int | `ey=(pi(n)-n/log(max(n,3)))/sqrt(n)` | 0.9117 | 0.2331 | 3 | [-0.910, 2.294] | residual still has main-term bias |
| pi_res_sqrtlog | int | `ey=(pi(n)-n/log(max(n,3)))/(sqrt(n)*log(max(n,3)))` | 0.8612 | 0.1603 | 3 | [-0.829, 0.212] | better but still main-term bias |
| pnt_line_x_nlog | int | `ex=n/log(max(n,3)); ey=pi(n)` | 0.999981 | 0.5329 | 0 | [0, 5133] | straight but known PNT, not prize |
| lambda_atom | int | `ey=isprime(rad(n))*log(rad(n))` | ~0 | 2.9662 | 0 | [0, 10.820] | Λ atom; use cumulative sum for ψ |
| mu_raw | int | `ey=mu(n)` | ~0 | 1.2825 | 15179 | [-1, 1] | noise source; cumulative is M |
| squarefree_density | int | `ey=abs(mu(n))` | ~0 | 0.8029 | 0 | [0, 1] | density only |
| omega_mean | int | `ey=omega(n)/log(max(log(max(n,3)),2))` | 0.0006 | 0.3421 | 0 | [0, 2.885] | Erdős-Kac mean, no sharp line here |
| bigomega_mean | int | `ey=bigomega(n)/log(max(log(max(n,3)),2))` | 0.0010 | 0.5067 | 0 | [0, 6.406] | no line |
| tau_log | int | `ey=tau(n)/log(max(n,3))` | 0.0001 | 0.9127 | 0 | [0.185, 9.384] | no line |
| phi_ratio | int | `ey=phi(n)/n` | ~0 | 0.3984 | 0 | [0.192, 1] | distribution, not line |
| n_over_phi_loglog | int | `ey=(n/phi(n))/log(max(log(max(n,3)),2))` | 0.0115 | 0.4220 | 0 | [0.420, 4.328] | Nicolas/Robin-adjacent but not isolated |
| rad_ratio | int | `ey=rad(n)/n` | ~0 | 0.5458 | 0 | [0.000061, 1] | no line |
| gap_int_raw | int | `ey=gap(n)` | ~0 | 3.8047 | 0 | [0, 72] | sparse point function, no line |
| gap_int_norm | int | `ey=gap(n)/log(max(n,3))` | 0.0008 | 3.7627 | 0 | [0, 6.954] | no line |
| forced_line | int | `ey=2*n+3` | 1.0000 | 0.5773 | 0 | [5, 100003] | algebraic trap; excluded |
| prime_p_vs_klogk | prime | `ex=pi(n)*log(max(pi(n),3)); ey=n` | 0.999994 | 0.6244 | 0 | [2, 49999] | known PNT for kth prime |
| prime_p_ratio_klogk | prime | `ey=n/(pi(n)*log(max(pi(n),3)))` | 0.0945 | 0.0117 | 0 | [1.107, 1.820] | flat PNT ratio |
| prime_p_ratio_2term | prime | `ey=n/(pi(n)*(log(max(pi(n),3))+log(max(log(max(pi(n),3)),2))-1))` | 0.0389 | 0.0356 | 0 | [1.002, 2.526] | small-k instability |
| prime_gap_norm | prime | `ey=gap(n)/log(n)` | 0.0001 | 0.7457 | 0 | [0, 6.954] | density only |
| prime_gap_res_sqrtlog | prime | `ey=(gap(n)-log(n))/sqrt(log(n))` | ~0 | 1.3388 | 2621 | [-3.289, 19.157] | noisy, no line |
| prime_M_over_sqrt | prime | `ey=M(n)/sqrt(n)` | 0.0339 | 1.2343 | 147 | [-0.894, 0.427] | holdout variant for Mertens |
| prime_pi_identity_trap | prime | `ey=pi(n)` | 0.9986 | 0.5772 | 0 | [1, 5133] | indexing/density trap |

⭐ INTERESTING: `M(n)/sqrt(n)` is a legitimate flat-zero view of the Mertens/RH neighborhood. It is not visually straight in the sloped-line sense, but the normalized residual lives in a narrow band at this range. Needs 2x/4x and larger direct-envelope tests.

⭐ INTERESTING: `isprime(rad(n))*log(rad(n))` is exactly the von Mangoldt atom Λ(n) using only allowed elementary ingredients. Its cumulative sum is Chebyshev ψ(x), so `Σ_{m≤x} isprime(rad(m))*log(rad(m)) - x` gives the known RH-equivalent line `ψ(x)=x+error` without zeta. Needs direct cumulative evaluation because lab formulas do not expose arbitrary cumsum.

## Batch 2 — direct cumulative-envelope audit to 10^7

Direct module computation only; no `zeta(...)` calls and no `ZEROS` table use. Definitions:

- `Λ(n) = isprime(rad(n))*log(rad(n))`.
- `ψ(x) = Σ_{n≤x} Λ(n)`.
- `Fψ(x) = ψ(x)-x`.
- `M(x) = Σ_{n≤x} μ(n)`.

Ranges: `N = 100000, 200000, 400000, 1000000, 2000000, 4000000, 10000000`.

### ψ residual, real primes

For `x ≥ 10000`, all ranges through `10^7` had `finiteFrac = 1` by construction.

| N | max `|Fψ|` | where | sign | max `|Fψ|/sqrt(x)` for x≥10000 | where | max `|Fψ|/(sqrt(x)log^2x)` | where |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 100000 | 173.493 | 59753 | + | 0.710161 | 24137 | 0.008000 | 11776 |
| 200000 | 260.295 | 175620 | - | 0.710161 | 24137 | 0.008000 | 11776 |
| 400000 | 405.519 | 355111 | + | 0.710161 | 24137 | 0.008000 | 11776 |
| 1000000 | 511.115 | 993820 | - | 0.710161 | 24137 | 0.008000 | 11776 |
| 2000000 | 730.354 | 1513751 | + | 0.710161 | 24137 | 0.008000 | 11776 |
| 4000000 | 1253.917 | 3445943 | + | 0.710161 | 24137 | 0.008000 | 11776 |
| 10000000 | 1582.047 | 9993078 | - | 0.710161 | 24137 | 0.008000 | 11776 |

Power-law fit to record max `|Fψ|` across the tested N values: `|Fψ| ≈ 0.717764*x^0.481757`.

Tested finite-range statement:

- For all integer `10000 ≤ x ≤ 10000000`, `|ψ(x)-x| ≤ 0.710161*sqrt(x)`.
- For all integer `2 ≤ x ≤ 10000000`, `|ψ(x)-x| ≤ 0.924085*sqrt(x)`; this all-range constant is dominated by `x=2`.

⭐ INTERESTING / BEST: This is the cleanest non-zeta straight-line law found. The line is `ψ(x)=x`; the residual is already bounded at the `sqrt(x)` scale over the tested range, much sharper than the classical RH-grade sufficient envelope `sqrt(x)log^2x`. The construction uses only `rad`, `isprime`, `log`, arithmetic, and cumulative summation.

Visual links:

- ψ straight line, `K=0`: `http://localhost:5173/#v=eyJtb2RlIjoicGF0Y2giLCJjZmciOnsic291cmNlIjoicHNpIiwicGxhbmUiOiJncmFwaCIsImxlbnMiOiJtb25vIiwicCI6eyJOIjoxMDAwMCwiSyI6MH19LCJjaGlwcyI6eyJ4IjpbXSwieSI6W119LCJyZXNpZHVhbCI6ZmFsc2UsInR3aW5Nb2RlIjoicmVhbCJ9`
- ψ residual, `K=0`: `http://localhost:5173/#v=eyJtb2RlIjoicGF0Y2giLCJjZmciOnsic291cmNlIjoicHNpIiwicGxhbmUiOiJncmFwaCIsImxlbnMiOiJtb25vIiwicCI6eyJOIjoxMDAwMCwiSyI6MH19LCJjaGlwcyI6eyJ4IjpbXSwieSI6W119LCJyZXNpZHVhbCI6dHJ1ZSwidHdpbk1vZGUiOiJyZWFsIn0`
- Screenshots: `/tmp/primevisuals-psi-line.png`, `/tmp/primevisuals-psi-residual.png`.

App metrics for the UI-limited `N=10000` ψ line:

- line: `linearity=0.999978`, slope `1.000318`, finiteFrac `1`, y-range `[0.693, 10013.397]`.
- residual: `linearity=0.004670`, zero crossings `209`, y-range `[-40.932, 45.982]`.

### Mertens residual

For `x ≥ 10000`:

| N | max `|M|` | where | sign | max `|M|/sqrt(x)` for x≥10000 | where | max `|M|/(sqrt(x)log^2x)` | where |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 100000 | 132 | 96014 | - | 0.462977 | 24185 | 0.004544 | 24185 |
| 200000 | 134 | 141869 | - | 0.462977 | 24185 | 0.004544 | 24185 |
| 400000 | 258 | 355733 | - | 0.462977 | 24185 | 0.004544 | 24185 |
| 1000000 | 368 | 926265 | - | 0.462977 | 24185 | 0.004544 | 24185 |
| 2000000 | 550 | 1793918 | + | 0.462977 | 24185 | 0.004544 | 24185 |
| 4000000 | 683 | 3239797 | - | 0.462977 | 24185 | 0.004544 | 24185 |
| 10000000 | 1143 | 9993034 | + | 0.462977 | 24185 | 0.004544 | 24185 |

Power-law fit to record max `|M|` across the tested N values: `|M| ≈ 0.420441*x^0.490168`.

⭐ INTERESTING: `M(x)=0+error` is the strongest flat-zero competitor. It has the smaller observed `sqrt(x)` constant, but it is less directly "prime-line" than ψ and has no natural Cramer-prime replay because μ is a factorization function on all integers.

Visual links:

- Mertens normalized patch residual: `http://localhost:5173/#v=eyJtb2RlIjoicGF0Y2giLCJjZmciOnsic291cmNlIjoibW9iaXVzIiwicGxhbmUiOiJ3YWxrIiwibGVucyI6Im1vbm8iLCJwIjp7Ik4iOjYwMDAwfX0sImNoaXBzIjp7IngiOltdLCJ5IjpbXX0sInJlc2lkdWFsIjp0cnVlLCJ0d2luTW9kZSI6InJlYWwifQ`
- Lab view `M(n)/sqrt(n)`: `http://localhost:5173/#v=eyJtb2RlIjoibGFiIiwibGFiIjp7ImRvbWFpbiI6ImludCIsIk4iOjUwMDAwLCJ0TWF4Ijo2MCwic01heCI6MS42LCJleCI6Im4iLCJleSI6Ik0obikvc3FydChuKSIsImVoIjoiIiwiZXciOiJzIiwiYSI6MC41LCJiIjoyLjM5OX19`
- Screenshots: `/tmp/primevisuals-mertens-normalized.png`, `/tmp/primevisuals-M-over-sqrt-lab.png`.

App metrics:

- patch residual `M(x)/sqrt(x)`, `N=60000`: finiteFrac `1`, y-range `[-0.894, 0.707]`, zero crossings `355`.
- lab `M(n)/sqrt(n)`, `N=50000`: finiteFrac `1`, y-range `[-0.894, 1]`, zero crossings `332`.

## Batch 3 — shifted-window holdout

Real primes, ψ residual on fresh windows:

| window | max `|Fψ|` | where | max `|Fψ|/sqrt(x)` | where | max `|Fψ|/(sqrt(x)log^2x)` |
| --- | ---: | ---: | ---: | ---: | ---: |
| (100000, 200000] | 260.295 | 175620 | 0.621124 | 175620 | 0.004259 |
| (200000, 400000] | 405.519 | 355111 | 0.709292 | 302830 | 0.004453 |
| (400000, 1000000] | 511.115 | 993820 | 0.636863 | 463180 | 0.003742 |
| (1000000, 2000000] | 730.354 | 1513751 | 0.637688 | 1090696 | 0.003299 |
| (2000000, 4000000] | 1253.917 | 3445943 | 0.675483 | 3445943 | 0.002981 |
| (4000000, 10000000] | 1582.047 | 9993078 | 0.593516 | 4409886 | 0.002536 |

Real integers, Mertens residual on fresh windows:

| window | max `|M|` | where | max `|M|/sqrt(x)` | where | max `|M|/(sqrt(x)log^2x)` |
| --- | ---: | ---: | ---: | ---: | ---: |
| (100000, 200000] | 134 | 141869 | 0.381776 | 119545 | 0.002793 |
| (200000, 400000] | 258 | 355733 | 0.437776 | 300551 | 0.002752 |
| (400000, 1000000] | 368 | 926265 | 0.382367 | 926265 | 0.002107 |
| (1000000, 2000000] | 550 | 1793918 | 0.418245 | 1066854 | 0.002171 |
| (2000000, 4000000] | 683 | 3239797 | 0.379456 | 3239797 | 0.001688 |
| (4000000, 10000000] | 1143 | 9993034 | 0.416356 | 6481601 | 0.001692 |

Holdout verdict: both survivors persist. ψ has larger excursions than M, but ψ is the cleaner "line of primes" because it is a staircase built exactly from prime powers.

## Batch 4 — Cramer fake-prime comparison for ψ

The built-in TWIN overlay only supports `primes` and `gaps`, not `psi`, so this comparison used `cramerPrimes(N, seed)` directly with the same ψ construction over fake primes and fake prime powers.

Fresh-window Cramer ψ, selected windows:

| seed | window | max `|Ffake|` | max `|Ffake|/sqrt(x)` | max `|Ffake|/(sqrt(x)log^2x)` |
| ---: | --- | ---: | ---: | ---: |
| 12345 | (100000, 200000] | 1920.093 | 4.759418 | 0.033158 |
| 12345 | (400000, 1000000] | 3631.183 | 4.707338 | 0.026626 |
| 12345 | (2000000, 4000000] | 4396.654 | 2.293267 | 0.010035 |
| 271828 | (100000, 200000] | 1653.493 | 4.016362 | 0.027968 |
| 271828 | (400000, 1000000] | 2398.543 | 3.244401 | 0.018588 |
| 271828 | (2000000, 4000000] | 6752.322 | 3.513092 | 0.015362 |
| 314159 | (100000, 200000] | 909.103 | 2.799148 | 0.020924 |
| 314159 | (400000, 1000000] | 6767.334 | 7.999347 | 0.045595 |
| 314159 | (2000000, 4000000] | 8537.541 | 4.330315 | 0.020551 |

Comparison verdict: fake primes preserve the obvious line `ψfake(x)≈x`, but not the same tight residual. On the `sqrt(x)` scale, fake windows are typically 4x-12x looser than real primes in the tested range. This passes the "not just density" filter for the residual sharpness, even though the main line itself is a PNT-density fact.

## Batch 5 — named RH-equivalent side checks

Nicolas primorial check, direct arithmetic:

| p ending primorial | primorial | `n/phi(n)` | `e^gamma log log n` | relative residual |
| ---: | ---: | ---: | ---: | ---: |
| 19 | 9699690 | 5.847132 | 4.947907 | 0.181739 |
| 23 | 223092870 | 6.112911 | 5.265051 | 0.161035 |
| 29 | 6469693230 | 6.331229 | 5.552537 | 0.140241 |
| 31 | 200560490130 | 6.542270 | 5.804575 | 0.127088 |
| 37 | 7420738134810 | 6.723999 | 6.035994 | 0.113984 |

Robin direct sigma check, not added to app:

- `N=100000`: max `sigma(n)/(e^gamma n log log n)=0.985819` at `n=10080`.
- `N=1000000`: same max `0.985819` at `n=10080`.

Verdict: both are KNOWN-MATH RH-equivalent territory, but they are inequality/extremal-subsequence witnesses rather than a better line in this tool. No `sigma` app function was added because the best candidates did not require it.

## Closing summary

Ranked findings:

1. ⭐ `ψ(x)=x+Fψ(x)`, with `ψ(x)=Σ_{n≤x} isprime(rad(n))*log(rad(n))`. Best candidate. Known Chebyshev/RH-equivalent territory, but built here without zeta. Tested `10000≤x≤10^7`: `|Fψ(x)|≤0.710161*sqrt(x)`; record-max scaling fit exponent `θ≈0.481757`. Cramer fake primes have the same main line but much wider residuals.
2. ⭐ `M(x)=0+error`. Strong flat-zero known Mertens/RH-neighbor. Tested `10000≤x≤10^7`: `|M(x)|≤0.462977*sqrt(x)`; record-max scaling fit exponent `θ≈0.490168`. Less directly prime-line and no natural Cramer-prime replay.
3. `π(x)` vs `x/log x` and `p_k` vs `k log k`: visually excellent lines but rejected as PNT/density baselines; the residual still carries main-term bias unless Li or higher terms are used.
4. Nicolas/Robin: valid known RH-equivalent territory, but not the best visual straight-line law here.
5. Factor-count, gap, radical, totient raw ratios: no competitive straight/flat survivor in this sweep.

Residual lesson: the ψ residual is not random drift around the PNT line. The real-prime ψ staircase remains pinned to `x` on a tight `sqrt(x)` scale through every shifted window tested, while Cramer fake primes with similar density wander several times farther. This is different from the existing residue-layer findings: residue classes explain Fourier/matrix stripes, but they do not explain the global cancellation in `ψ(x)-x`.
