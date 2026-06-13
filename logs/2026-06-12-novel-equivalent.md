# 2026-06-12 - novel RH-equivalent via a dyadic exponential Chebyshev transform

Goal: build a clean RH-equivalent from a new chip/object, not a disguised catalog object; implement it, derive the RH link in both directions, check nearby catalog entries, and leave a numerical exhibit plus Phase-4 review pack.

Prior-log check: no `logs/*novel-equivalent.md` existed, so there was no HANDOFF to resume from. `MACHINE_HOW_TO_USE.md` in this checkout has logging/knowledge rules but no visible "Creating new math" heading.

## New object

Define the dyadic exponential von Mangoldt atom

```text
l2(n) = sum_{k >= 0, 2^k | n} Lambda(n / 2^k) / k!
L2(x) = sum_{n <= x} l2(n)
```

Equivalently, let `h(2^k)=1/k!` and `h(m)=0` otherwise. Then

```text
l2 = h * Lambda
L2(x) = sum_{k >= 0} psi(x / 2^k) / k!
Dirichlet series: sum l2(n)n^(-s) = exp(2^(-s)) * (-zeta'(s)/zeta(s))
```

First hand values:

```text
n:      1      2       3       4        5       6       7        8
l2(n):  0   log2    log3   2log2    log5    log3    log7   2.5log2

n:      9      10      11       12       13      14   15       16
l2(n): log3   log5   log11   0.5log3   log13   log7   0   (8/3)log2
```

Disguise check:

- Not `Lambda`: `l2(4)=2 log 2`, while `Lambda(4)=log 2`; `l2(6)=log 3`, while `Lambda(6)=0`.
- Not `psi`: `l2` is an atom, while `L2` is the summatory object; even `L2` has main term `sqrt(e) x`, not `x`.
- Not a catalog prime-counting/Farey/Redheffer object: its Dirichlet-side multiplier is the new zero-free factor `exp(2^(-s))`, and its inverse is factorially weighted on the dyadic semigroup.

Related supporting object also implemented: `g2(n)=sum_{2^k|n} mu(n/2^k)/k!`, with `G2` its summatory transform. This is the exact same `E2` chip applied to `M(x)`, and is covered by tests, but the final RH statement below uses `l2/L2` because the psi bridge gives a fixed log-square statement and a natural Cramer comparison.

## Clean statement

Let

```text
R2(x) = L2(x) - sqrt(e) x.
```

**Statement S2:** `sup_{x >= 3} |R2(x)| / (sqrt(x) (1 + log x)^2) < infinity`.

No epsilon is in the statement; the main-term constant is `sqrt(e)`, and the exponents are explicitly `1/2` and `2`.

## RH link

Classical bridge used: `psi(x)-x = O(sqrt(x) log^2 x)` is equivalent to RH. The MathOverflow Pi_1 thread records the same bridge, including the classical `psi(x)-x=O(x^(1/2+epsilon))` form and Schoenfeld's explicit log-square form; Watkins' catalog lists the classic Mertens and psi reformulations.

Exact transform:

```text
E2 F(x) = sum_{k >= 0} F(x / 2^k) / k!
L2 = E2 psi
E2 id = sqrt(e) id
R2 = E2(psi - id)
```

The inverse kernel is `h^{-1}(2^k)=(-1)^k/k!`, because

```text
(sum_{k>=0} z^k/k!) * (sum_{k>=0} (-z)^k/k!) = 1.
```

Thus, by Dirichlet convolution on the dyadic semigroup,

```text
psi(x) = sum_{j >= 0} (-1)^j L2(x / 2^j) / j!
psi(x)-x = sum_{j >= 0} (-1)^j R2(x / 2^j) / j!
```

Direction RH -> S2:

Under RH, the classical Chebyshev estimate gives

```text
psi(y)-y = O(sqrt(y) log^2 y).
```

Apply Abel/partial-summatory switching for the Dirichlet convolution:

```text
R2(x) = sum_{k >= 0} (psi(x/2^k)-x/2^k) / k!.
```

The finite large-argument part is bounded by

```text
sqrt(x) log^2 x * sum_{k >= 0} 2^(-k/2)/k! = exp(1/sqrt(2)) sqrt(x) log^2 x.
```

The small-argument tail is factorially damped and is `O(1)`, hence absorbed by `sqrt(x)(1+log x)^2`. Therefore S2 holds.

Direction S2 -> RH:

Apply the inverse transform:

```text
psi(x)-x = sum_{j >= 0} (-1)^j R2(x/2^j) / j!.
```

S2 bounds the large-argument terms by

```text
sqrt(x) (1+log x)^2 * sum_{j >= 0} 2^(-j/2)/j!.
```

The small-argument tail is again factorially damped. Hence

```text
psi(x)-x = O(sqrt(x) log^2 x),
```

which is the named classical RH-equivalent. This is a two-directional equivalence, not a numerical implication.

## Implementation

Files changed:

- `src/core/math.js`: `dyadicExpMangoldtValue`, `dyadicExpMobiusValue`, `dyadicExpTransform`, table arrays `l2/L2` and `g2/G2`.
- `src/core/engine.js`: lab functions `l2(n)`, `L2(n)`, `g2(n)`, `G2(n)`.
- `src/core/chips.js`: new `E2` chip, `dyexp`, applying `sum v(floor(n/2^k))/k!` to integer-indexed series.
- `src/PrimeVisuals.jsx`: lab token buttons for the new functions; fixed lab share links so formula links open in formula mode instead of being overwritten by the default canvas graph.
- `tests/math.test.js`, `tests/engine.test.js`: first values, table-vs-direct checks, exact `L2=E2(psi)` and inverse recovery, and formula evaluator coverage.

Verification:

```text
npx vitest run tests/math.test.js tests/engine.test.js --environment node --pool threads
-> 2 files passed, 69 tests passed

npm run build
-> built successfully
```

Full `npm test` is still blocked by the existing jsdom/html-encoding-sniffer ESM issue:

```text
ERR_REQUIRE_ESM: html-encoding-sniffer requires @exodus/bytes/encoding-lite.js
```

This failure appears before the touched suites run under the configured jsdom pool; the Node-environment targeted run above verifies the new math.

## Novelty check

Catalogs/pages checked:

- Watkins, "some reformulations of the Riemann Hypothesis": https://empslocal.ex.ac.uk/people/staff/mrwatkin/zeta/RHreformulations.htm
- MathOverflow, "Collection of equivalent forms of Riemann Hypothesis": https://mathoverflow.net/questions/39944/collection-of-equivalent-forms-of-riemann-hypothesis
- MathOverflow Pi_1 thread: https://mathoverflow.net/questions/31846/is-the-riemann-hypothesis-equivalent-to-a-pi-1-sentence
- Standard equivalents list via the Riemann hypothesis page: https://en.wikipedia.org/wiki/Riemann_hypothesis
- Search probes for the exact multiplier/object: `"exp(2^{-s})" "von Mangoldt" "Riemann hypothesis"`, `"dyadic exponential" "Mertens" function`, `"factorial-weighted" dyadic transform Mobius Riemann hypothesis`.

Nearest existing equivalents:

- Watkins lists the classic psi reformulation: `psi(x)-x` has RH-grade square-root growth.
- The Pi_1 thread gives the psi bridge and an explicit Schoenfeld-style bound.
- Watkins also points to Baez-Duarte's "Mobius-convolutions and the Riemann hypothesis", whose abstract says Riesz/Hardy-Littlewood criteria are embedded in a convolution criterion.

Difference:

`L2` is not the catalog `psi` residual, Riesz entire function, Hardy-Littlewood function, Mertens sum, Redheffer determinant, or Farey discrepancy. It is an explicit dyadic-semigroup convolution by the zero-free Dirichlet factor `exp(2^(-s))`, with a factorial inverse `exp(-2^(-s))`. The statement is about the residual from the transformed main term `sqrt(e)x`. This is close to the general "convolution criterion" neighborhood, but I did not find this dyadic factorial Chebyshev transform or the `sqrt(e)x` residual statement in the checked catalogs/searches.

## Numerical exhibit

Main term used: `sqrt(e) x`, not a fitted slope. This is the exactly integrated image of the identity main term under `E2`:

```text
E2(x) = sum x/(2^k k!) = sqrt(e) x.
```

Artifact JSON:

```text
logs/novel-equivalent-artifacts/l2-numerics.json
```

Real primes, interval envelope fits for `max_{N/2 < x <= N} |L2(x)-sqrt(e)x| ~ C N^theta`:

| range | C | theta | points |
| --- | ---: | ---: | ---: |
| `2e4..1e6` | `0.499394` | `0.515111` | 6 |
| `1e5..1e7` | `0.506606` | `0.512133` | 7 |

Real primes through `1e7`, with cutoff `x>=10000`:

```text
max |R2| = 1633.904174 at x=6892274
max |R2|/sqrt(x) = 0.828718 at x=3580101
max |R2|/(sqrt(x) log^2 x) = 0.006472 at x=14385
```

Cramer contrast: fake primes generated by `cramerPrimes`, fake prime powers built from them, same `E2` transform and same `sqrt(e)x` main term. Through `4e6`, max `|R2|/sqrt(x)` for `x>=10000`:

| source | max `|R2|/sqrt(x)` | where |
| --- | ---: | ---: |
| real | `0.828718` | `3580101` |
| Cramer seed `12345` | `7.842296` | `156937` |
| Cramer seed `271828` | `9.715140` | `39854` |
| Cramer seed `314159` | `10.367585` | `923160` |

Fresh windows:

| window | real max `|R2|/sqrt(x)` | fake seed 12345 | fake seed 271828 | fake seed 314159 |
| --- | ---: | ---: | ---: | ---: |
| `(4e5, 1e6]` | `0.699633` | `5.214100` | `2.831254` | `10.367585` |
| `(2e6, 4e6]` | `0.828718` | `2.020665` | `3.588831` | `8.470621` |

Live links:

```text
Raw residual with normalized hue:
http://localhost:5174/#v=eyJtb2RlIjoibGFiIiwibGFiIjp7ImRvbWFpbiI6ImludCIsIk4iOjIwMDAwLCJ0TWF4Ijo2MCwic01heCI6MS42LCJleCI6Im4iLCJleSI6IkwyKG4pLXNxcnQoZSkqbiIsImVoIjoiKEwyKG4pLXNxcnQoZSkqbikvc3FydChuKSIsImV3IjoicyIsImEiOjAuNSwiYiI6Mi4zOTl9fQ

Normalized residual:
http://localhost:5174/#v=eyJtb2RlIjoibGFiIiwibGFiIjp7ImRvbWFpbiI6ImludCIsIk4iOjIwMDAwLCJ0TWF4Ijo2MCwic01heCI6MS42LCJleCI6Im4iLCJleSI6IihMMihuKS1zcXJ0KGUpKm4pL3NxcnQobikiLCJlaCI6IiIsImV3IjoicyIsImEiOjAuNSwiYiI6Mi4zOTl9fQ
```

Shots:

```text
logs/novel-equivalent-artifacts/l2-raw-residual-shot.png
logs/novel-equivalent-artifacts/l2-residual-shot.png
```

The raw residual shot is the readable exhibit; the normalized residual shot is mathematically direct but visually nearly flat at this viewport.

## Lean-stub-ready statement

```lean
-- Informal Lean stub, with real-valued floor-step functions.
def vonMangoldt (n : Nat) : Real := ...

def h2 (d : Nat) : Real :=
  if h : exists k : Nat, d = 2^k then
    1 / Nat.factorial (Nat.find h)
  else 0

def l2 (n : Nat) : Real :=
  Finset.sum (Nat.divisors n) (fun d => h2 d * vonMangoldt (n / d))

def L2 (x : Real) : Real :=
  Finset.sum (Finset.Icc 1 (Nat.floor x)) (fun n => l2 n)

def R2 (x : Real) : Real := L2 x - Real.sqrt Real.exp 1 * x

def S2 : Prop :=
  IsBigO atTop (fun x : Real => abs (R2 x))
    (fun x : Real => Real.sqrt x * (1 + Real.log x)^2)

theorem RH_iff_S2 : RiemannHypothesis ↔ S2 := by
  -- 1. Use Dirichlet convolution identity l2 = h2 * vonMangoldt.
  -- 2. Prove summatory switch: L2 x = sum_k psi (x / 2^k) / k!.
  -- 3. Prove inverse kernel h2_inv(2^k)=(-1)^k/k!.
  -- 4. Transfer big-O both ways between R2 and psi(x)-x.
  -- 5. Invoke classical theorem RH ↔ psi(x)-x = O(sqrt x log^2 x).
  sorry
```

## One-page expert review summary

Object:

```text
l2(n)=sum_{2^k|n} Lambda(n/2^k)/k!,  L2(x)=sum_{n<=x}l2(n).
```

Statement:

```text
sup_{x>=3} |L2(x)-sqrt(e)x| / (sqrt(x)(1+log x)^2) < infinity.
```

Derivation chain:

```text
Dirichlet convolution -> summatory switch -> dyadic factorial inverse -> psi residual -> classical RH equivalence.
```

Exact identities:

```text
L2 = E2 psi
E2 id = sqrt(e) id
E2^{-1} has coefficients (-1)^k/k!
psi - id = E2^{-1}(L2 - sqrt(e)id)
```

Numerics:

The real residual has interval-fit theta `0.515111` over `2e4..1e6` and `0.512133` over `1e5..1e7`, with max `|R2|/sqrt(x)=0.828718` through `1e7` for `x>=10000`. Cramer prime-power fakes are much looser: max normalized values `7.84`, `9.72`, and `10.37` through `4e6`.

Novelty:

Nearest known objects are the classical `psi(x)-x` RH equivalent and broad Mobius-convolution/Riesz-type criteria. The new piece is the concrete dyadic factorial multiplier `exp(2^(-s))`, the transformed main term `sqrt(e)x`, and the exact inverse residual statement. It is equivalent by a classical chain, not by finite data.

Verdict:

This meets the goal as a new transform-equivalent. It is intentionally conservative: the RH content is not claimed to be new, only the chip/object and the exact transformed statement are new relative to the checked catalogs.
