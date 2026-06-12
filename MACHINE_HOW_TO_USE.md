# MACHINE_HOW_TO_USE — driving PrimeVisuals from an AI agent

This document is written for an AI coding agent (Claude Code, Cursor, etc.)
that has been given a mathematical goal, e.g.:

> "Search combinations of formulas and chips to land on another straight
> line like the critical line, by a different route."

You do not need a browser. Everything renders from pure JS modules, and
`scripts/explore.mjs` evaluates any pipeline headlessly and scores its
shape. Your output to the human should be **shareable links** they can open
in the running app — never just numbers.

## The 60-second loop

```sh
# 1. What ingredients exist?
node scripts/explore.mjs ops

# 2. Evaluate a candidate (a LAB spec: formulas over a domain)
node scripts/explore.mjs eval '{"domain":"real","tMax":60,"ex":"t","ey":"abs(zeta(0.5+i*t))"}'
# → {"ok":true,"metrics":{"linearity":0.03,...},"link":"#v=..."}

# 3. Evaluate many candidates at once (JSONL on stdin → JSONL on stdout)
printf '%s\n%s\n' '{"domain":"int","N":5000,"ey":"M(n)"}' '{"domain":"int","N":5000,"ey":"pi(n)"}' \
  | node scripts/explore.mjs batch

# 4. Hand the human a link for anything interesting
node scripts/explore.mjs link '<the same spec>'
# append the "#v=..." to the app URL: http://localhost:5173/#v=...
```

## Spec schema

**LAB spec** — formulas evaluated over a domain. Fields and defaults:

| field | meaning | default |
| --- | --- | --- |
| `domain` | `int` (n = 1…N), `prime` (n runs over primes ≤ N), `real` (t ∈ [0,tMax], 1200 samples) | `int` |
| `N` | integer/prime range | 4000 |
| `tMax` | real-line height | 60 |
| `ex`, `ey` | formulas for x(var) and y(var) | `n`/`t`, `0` |
| `a`, `b` | free knobs usable in formulas | 0.5, 2.399 |

Variables: `n` (int/prime domains), `t` (real), `i`, `pi`, `e`, knobs `a` `b`.
Functions: `abs arg re im conj exp log sqrt sin cos floor frac min max dot
mod gcd pow zeta` everywhere; on integer domains also `mu M isprime pi gap
omega bigomega tau phi rad` (Möbius, Mertens, primality 0/1, prime count,
next-prime gap, distinct/total prime factors, divisor count, totient,
radical). Arithmetic is complex-valued; only the real part lands on the
axis. `zeta(z)` works for any complex argument with Re > 0, accurate for
|Im| ≲ 500. `domain:"complex"` is image-valued and not supported by the CLI
— evaluate `re/im/abs` of the same expression over `real` instead.

**PATCH spec** — the app's source → plane pipeline, optionally with chips
and residual subtraction:

```json
{"cfg":{"source":"gaps","plane":"graph","lens":"mono","p":{"N":100000}},
 "chips":{"x":[],"y":[{"op":"symlog","p":{}},{"op":"cumsum","p":{}}]},
 "residual":false}
```

`node scripts/explore.mjs ops` lists every source/plane/lens id, its
parameters with min/max/default, every chip op (parameterized chips take
`"p":{"a":<value>}`), and which `source:plane` pairs support
`"residual":true`. Respect parameter ranges; out-of-range values are not
clamped everywhere.

## Metrics returned

For the rendered series (xs, ys):

- `linearity` — R² of the least-squares line through the points. ≥ 0.999
  is visually a straight line. A constant series scores 1.
- `slope`, `intercept` — the fitted line.
- `flatness` — std(y)/mean|y|; ~0 is flat, ≥1 is wild.
- `zeroCrossings` — sign changes of y (oscillation count).
- `monotonicity` — +1 strictly rising, −1 falling, ~0 churning.
- `finiteFrac` — fraction of finite samples; < 1 means the formula blew up
  somewhere (poles, log of 0). Treat < 0.99 as suspect.
- `n`, `yMin`, `yMax`, and `ms` (evaluation time).

## Discipline — do not skip this

A search over thousands of formulas will produce "discoveries" by chance.
Before reporting anything to the human:

1. **Persistence**: re-evaluate the candidate at 2× and 4× the range
   (`N` or `tMax`). Real structure keeps or improves its score; flukes
   decay. (Mind the param maxima from `ops`.)
2. **Holdout flavor**: for integer domains, shift the window — if a pattern
   holds for n ≤ N it should hold on fresh primes; compare against
   `domain:"prime"` vs `domain:"int"` variants where relevant.
3. **Triviality check**: a straight line is only interesting if it is not
   algebraically forced. `ey:"2*n+3"` is a perfect line and worthless.
   `cumsum` of gaps is literally the next prime — linearity 1 by identity.
   Ask: does the line *encode arithmetic content* (primes, μ, ζ) that had
   no obvious reason to be linear? Lines worth reporting usually come from
   a nontrivial cancellation or equidistribution.
4. **Known-result check**: π(x) ~ x/ln x, ψ(x) ~ x, Σμ(n) ≈ small,
   zero-counting N(T) ≈ (T/2π)log(T/2πe). If your line is one of these in
   disguise, say so — that's a sanity success, not a discovery.

A good report to the human: the spec, the metrics at 1×/2×/4× range, why it
is not trivially forced, and the `link` to see it.

## Worked example: hunting straight lines

```sh
# Mertens M(n): NOT a line (churns around 0)            → linearity ≈ 0.004, monotonicity ≈ 0, ~200 zero crossings
node scripts/explore.mjs eval '{"domain":"int","N":20000,"ey":"M(n)"}'

# prime count pi(n): almost a line, slope drifts        → linearity ≈ 0.999, monotone
node scripts/explore.mjs eval '{"domain":"int","N":20000,"ey":"pi(n)"}'

# pi(n)*log(n)/n: the Prime Number Theorem flattening   → flatness ≈ 0.02 (a level line at ~1);
#   note linearity is only ~0.4 here because R² measures the tiny residual drift —
#   for "is it a flat line" use flatness, for "is it a sloped line" use linearity
node scripts/explore.mjs eval '{"domain":"int","N":20000,"ey":"pi(n)*log(n)/n"}'

# over primes only: p_k vs k·log(k) straightens p_k     → high linearity, slope ≈ 1
node scripts/explore.mjs eval '{"domain":"prime","N":50000,"ex":"pi(n)*log(pi(n))","ey":"n"}'
```

## Direct module access (when the CLI isn't enough)

All core modules are dependency-free ES modules importable in Node ≥ 18:

- `src/core/engine.js` — `computeLabSeries(lab)`, `parseExpr`, `evalAst`,
  `makeFns(tables)`; complex scalars are `[re, im]`.
- `src/core/math.js` — `sieve`, `primesUpTo`, `mobiusUpTo`,
  `integerLabTables(N)`, `zetaHalf(t)`, `zetaC(sigma, t)`, `psiExplicit(x,
  K)`, `primePowersUpTo(N)`, `cramerPrimes(N, seed)`, `ZEROS` (267 zeta
  zeros to t = 500).
- `src/core/registry.js` — `SOURCES`, `PLANES`, `LENSES`, `withDefaults`.
- `src/core/chips.js` — `CHIP_OPS`, `applyChips(array, chips)`.
- `src/core/residuals.js` — `RESIDUALS`, `residualFor(cfg)`.
- `src/core/stats.js` — `histogram`, `residueChi`, `expSum`/`expSumZ`,
  `autocorr`, `wignerGUE`, `expPdf`, `contFrac`, `normalizedSpacings`.
- `src/core/anomaly.js` — `runScan(N, onProgress)` (async): the full
  find/holdout anomaly sweep, same engine the in-app scanner uses.
- `src/core/metrics.js` — `seriesMetrics(xs, ys)`.
- `src/core/urlState.js` — `encodeState(state)` / `decodeState(hash)`.

Tests are the executable documentation: `npm test`, files in `tests/`.

## Handing results back to the human

Each finding should be one line of JSON in a file or message:

```json
{"claim":"p_k is linear against k log k (PNT in disguise)",
 "spec":{"domain":"prime","N":50000,"ex":"pi(n)*log(pi(n))","ey":"n"},
 "metrics_1x":{"linearity":0.9999},"metrics_4x":{"linearity":0.9999},
 "trivial":false,"known":"Prime Number Theorem",
 "link":"#v=..."}
```

The human opens the link, sees the line, and the in-app tools (RESIDUAL,
TWIN, ×2×4×8, PIN) take it from there.
