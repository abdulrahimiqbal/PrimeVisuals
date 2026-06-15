# bias.md — wildcard generator memory (read + rewritten by scripts/hunt.mjs)
#
# `hunt.mjs gen N` samples the FAMILIES below by weight, always injecting >=25%
# pure-random picks so exploration never stops. `hunt.mjs update results.jsonl`
# nudges each weight toward uniform (10% decay, no lock-in) then rewards
# twin-beating yield, and prepends <=2 LESSONS distilled from the cycle.
#
# Keep it light: the prize is a rare wildcard, so exploration must dominate
# exploitation. Do not reflow the family lines.
#
# format:  <weight> | <family-id> | <note>

1.00 | mu-walk-chip       | Mertens walk + 1-3 post chips
1.00 | gaps-stack         | gap sequence -> graph/walk + chip stacks
1.00 | prime-walk-chip    | Chebyshev (+-1 mod4) race walk + chips
1.00 | expsum-cos         | Sum cos(a*p) over primes  (x:[scale,cos,cumsum])
1.00 | residue-mod-cumsum | residue-class cumulative bias walks
1.00 | dyexp-compose      | dyadic-exponential (E2) composed walks
1.00 | twoD-front         | clock/matrix/family 2-D fronts (screen with shot)
1.00 | polyprime-stack    | F_q[t] polynomial primes + chips
1.00 | lab-residual       | detrended pointwise residuals (prime domain)
1.00 | cross-domain       | AGENT-SERVICED: import an object from another field of
#                           math/physics (stat-mech partition fn, Hamiltonian/KAM,
#                           topology/persistent-homology, ergodic/Lyapunov, p-adic,
#                           category-theory magnitude, spectral graph theory), feed it
#                           primes, emit (xs,ys) from a small probe, pipe same gauntlet.

<!--LESSONS (newest first, cap 12) — hunt.mjs prepends here-->
