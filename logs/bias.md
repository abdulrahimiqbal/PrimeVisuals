# bias.md — wildcard generator memory (read + rewritten by scripts/hunt.mjs)
#
# `hunt.mjs gen N` samples the FAMILIES below by weight, always injecting >=25%
# pure-random picks so exploration never stops. `hunt.mjs update results.jsonl`
# rewards SURVIVAL (all 5 bars; falls back to mechanical promote if the agent
# hasn't annotated `survived`), penalizes promoted-but-retired families, decays
# 10% toward uniform (no lock-in), and prepends <=2 LESSONS distilled from the cycle.
#
# Reset to a uniform seed after the order-sensitive-null fix (2026-06-15): the
# prior weights/lessons came from a gauntlet that over-credited dyexp/diff via an
# invalid shuffle null, so they are no longer trustworthy. Keep it light: the
# prize is a rare wildcard, so exploration must dominate. Do not reflow the lines.
#
# format:  <weight> | <family-id> | <note>

0.89 | mu-walk-chip       | Mertens walk + 1-3 post chips
0.67 | gaps-stack         | gap sequence -> graph/walk + chip stacks
0.87 | prime-walk-chip    | Chebyshev (+-1 mod4) race walk + chips
1.00 | expsum-cos         | Sum cos(a*p) over primes  (x:[scale,cos,cumsum])
1.00 | residue-mod-cumsum | residue-class cumulative bias walks
0.44 | dyexp-compose      | dyadic-exponential (E2) composed walks
1.00 | twoD-front         | clock/matrix/family 2-D fronts (screen with shot)
0.97 | polyprime-stack    | F_q[t] polynomial primes + chips
0.50 | lab-residual       | detrended pointwise residuals (prime domain)
0.92 | cross-domain       | AGENT-SERVICED: import an object from another field of
#                           math/physics (stat-mech partition fn, Hamiltonian/KAM,
#                           topology/persistent-homology, ergodic/Lyapunov, p-adic,
#                           category-theory magnitude, spectral graph theory), feed it
#                           primes, emit (xs,ys) from a small probe, pipe same gauntlet.

<!--LESSONS (newest first, cap 12) — hunt.mjs prepends here-->
- FAIL dyexp-compose: 9/24 promoted but retired at bar 5 (known) — penalized
- FAIL lab-residual: 4/24 promoted but retired at bar 5 (known) — penalized
- FAIL dyexp-compose: 8/20 promoted but retired at bar 5 (known) — penalized
- FAIL dyexp-compose: 4/24 promoted but retired at bar 5 (known) — penalized
- FAIL lab-residual: 6/18 promoted but retired at bar 5 (known) — penalized
- FAIL lab-residual: 4/15 promoted but retired at bar 5 (known) — penalized
- FAIL lab-residual: 4/13 promoted but retired at bar 5 (known) — penalized
- FAIL dyexp-compose: 5/10 promoted but retired at bar 5 (known) — penalized
- FAIL dyexp-compose: 3/12 promoted but retired at bar 5 (known) — penalized
