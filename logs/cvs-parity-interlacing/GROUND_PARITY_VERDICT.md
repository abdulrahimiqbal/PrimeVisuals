# Verdict: cutoff-free CvS ground-parity separation

Date: 2026-07-11

## Result

The independent 90-digit holdout passed the finite zeta gate in all 105 cells:
cutoffs `11,19,23,31,43,59,97` and every level `N=2,...,16` satisfy

`E_0 < O_0`.

The smallest positive-cell ratio `O_0/E_0` is about `178.8`; at `c=97,N=16`
it is about `2238.9`.  The smallest relative parity gap is about `1.9e-50`,
well above the 90-digit arithmetic floor but far too small for extrapolation
without an analytic estimate.

## Controls and interpretation

The new reversed-weight control at `c=23` and signed-weight control at `c=97`
also retain ground dominance.  Earlier controls broke it at `c=17` and `c=100`.
Therefore the ordering is neither automatic for all source weights nor cleanly
zeta-specific in the tested family.

## Decision

`FINITE CONJECTURE SURVIVES / CONTROLS MIXED / NO THEOREM / PAUSE BRUTE FORCE`.

More cutoffs or dimensions have low expected value.  The next admissible work
is symbolic: derive or refute an unconditional variational comparison between
the even and odd sector, then determine whether its parity gap persists in the
compact-resolvent limit.  Until such an identity exists, this path is not a
breakthrough and does not materially advance a proof of RH.

