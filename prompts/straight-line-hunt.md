# GOAL: a second "critical line" — a straight-line law for primes built without zeta

You are working in the PrimeVisuals repo. First: read MACHINE_HOW_TO_USE.md
(the headless interface, spec schema, search discipline) and KNOWLEDGE.md
(what's already established — do not rediscover it). Create
`logs/<today>-straight-line-hunt.md` and journal everything per the logging
rules.

## The mission

The Riemann Hypothesis says the zeros of ζ line up on one straight line.
Find an equally clean line-like law about the primes that never mentions ζ:
a quantity built only from elementary arithmetic ingredients (`mu, M,
isprime, pi, gap, phi, tau, omega, bigomega, rad`, arithmetic, `log, sqrt,
mod`, the cumulative-Σ chip, knobs a/b) whose graph is a strikingly
straight or strikingly flat line — and whose *sharpness* encodes deep
regularity of the primes, the way the critical line does.

## Constraints

- Forbidden ingredient: `zeta(...)` anywhere; the ZEROS table too.
  Different route or nothing.
- A line is only interesting if it is NOT algebraically forced. `2n+3` is
  perfect and worthless. Test: would the same construction applied to
  Cramér fake primes (`cramerPrimes` in src/core/math.js, or
  `"twinMode":"both"` in `shot`) produce the same line AND the same error
  term? If yes, it's density, not arithmetic.
- The prize is the **error term**. π(x) vs x/log x is a known line; the
  question is always: how tight? Normalize the residual (divide by √x,
  √x·log x, …) and find the scaling at which it becomes a bounded,
  structured signal. That normalization exponent IS the RH-grade content.

## Search plan (suggested — adapt)

1. Sweep candidate y(n) over `int` and `prime` domains with `batch`; score
   `linearity` (sloped lines) and `flatness` (level lines); require
   `finiteFrac` = 1.
2. Known RH-equivalent territory to aim near — and to *recognize* if you
   land on it: |M(x)|/√x bounded ⇔ RH (Mertens); |ψ(x)−x| ≲ √x·log²x ⇔ RH;
   Robin: σ(n) < e^γ·n·log log n for n > 5040 ⇔ RH; Nicolas: n/φ(n) vs
   e^γ·log log n at primorials ⇔ RH. σ (divisor sum) is not in the function
   table — if you need it, add it to `integerLabTables` in
   src/core/math.js with tests (a few lines, same pattern as tau).
   Matching a known equivalent is a success of type KNOWN-MATH; name it,
   then push past it.
3. Every survivor: persistence at 2× and 4× range; shifted-window holdout;
   Cramér-twin comparison; then `shot` it and LOOK — metrics miss 2-D
   structure, and pictures miss tightness.
4. ⭐-flag the best 3–5 in the log, with `link` output for each.

## Deliverables

1. The log file (append-only, every batch recorded).
2. KNOWLEDGE.md entries — classified KNOWN-MATH / OBSERVED / OPEN, each
   with evidence and a CONNECTION line (especially to the existing
   residue-layer entries).
3. A final report: the single best candidate stated as a precise
   conjecture ("for all x up to the tested 10^k, |F(x)| ≤ C·x^θ with
   θ = …, C = …"), its relation to the known RH-equivalents above, the
   shareable link, and what its **residual view** teaches about how the
   primes actually deviate — that residual study is the "use it to
   understand them better" half of the mission.
4. If nothing non-trivial survives the discipline, the ranked graveyard of
   failed candidates is the deliverable. Say so plainly; a clean negative
   is worth more than a dressed-up triviality.
