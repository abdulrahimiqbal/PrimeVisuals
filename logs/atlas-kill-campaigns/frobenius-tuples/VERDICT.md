# Verdict: kill frontier 3

## Decision

**KILL — NO REPLICATED, CONTROL-SURVIVING FROBENIUS-WEIGHTED PRIME-PAIR
RESIDUAL.**

Nothing in this campaign survives as a field-level theorem or breakthrough
conjecture.

## Decisive evidence

The confirmatory object contained 36 frozen cells: six target quadratic covers
times six holdout shifts, evaluated independently in the blocks `(2m,4m]` and
`(4m,8m]`.

| diagnostic | registered requirement | observed |
| --- | ---: | ---: |
| final-block RMS z | above conditional 99% envelope `1.2753` and every frozen control | `0.5847` |
| final-block max abs z | above conditional 99% envelope `3.4827` | `1.6878` |
| block-profile Pearson r | at least `0.5` | `-0.0346` |
| block sign agreement | at least `2/3` | `0.5000` |
| matched-cover corroboration | control-surviving | RMS `0.8642`, not surviving |
| discovery-shift corroboration | control-surviving | RMS `0.8076`, not surviving |

The result is not borderline. Its RMS is below, rather than above, the null
envelope. Every stochastic/local control family generated final-block effects
at least as large:

- Cramer flags: RMS `0.7918..1.1280`;
- W-wheel flags: `0.7302..1.0379`;
- W-wheel composite-only flags: `0.6249..0.9626`;
- rough semiprime flags: `0.6774..0.9058`;
- balanced residue-class functions on the actual prime pairs: `0.4585..0.8725`;
- nearby quadratic covers on the actual prime pairs: `0.8642`.

The apparent under-dispersion is not a quadratic-Frobenius discovery. It occurs
for arbitrary balanced residue functions on the same prime pairs and within
the other local controls. The independent-cell binomial normalization is only
a reference null; the matched controls correctly expose the dependence and
residue balancing present in the data.

## Local and range checks

- `144/144` enumerated finite-residue checks verify
  `mu_ell(h)=-1/(ell-2)` for every registered integer and field-size cell.
- The unweighted pair counts match the Hardy--Littlewood predictions to within
  about `0.5%` at `8m` for all 12 shifts.
- That agreement cannot manufacture the Frobenius result: the statistic
  subtracts `mu_ell(h)` times the *observed* pair count, so the entire
  unweighted singular-series amplitude and its finite-range error cancel
  algebraically.
- None of the four disjoint blocks supplies a growing, sign-stable holdout
  effect. Holdout RMS values are `0.6219, 0.6374, 0.7847, 0.5847`.

## Disguise result

The candidate is not plain Chebotarev: primality of `p+h` is not a Frobenius
condition on `p` in a fixed finite extension. But it is not a new bridge either.
After normalization it is exactly a zero-sum linear contrast of fixed-gap
prime-pair counts in residue classes modulo `ell`. The residue-refined
Hardy--Littlewood conjecture predicts it immediately.

Thus the candidate is:

1. stronger than ordinary single-prime Chebotarev balance;
2. logically weaker than full Hardy--Littlewood because it supplies neither a
   pair main term nor infinitude;
3. mathematically contained in the Hardy--Littlewood-in-progressions funnel;
4. empirically null after exact local centering.

## What was learned

The useful negative result is a routing rule for the Atlas:

> A fixed-cover Frobenius label that factors through a small congruence modulus,
> sampled on `p,p+h` prime, is only a residue-class projection of the prime-pair
> problem. Exact local centering does not expose an additional mechanism.

Do not revive this branch by changing quadratic moduli, shifts, colors, or
aggregation. A legitimate restart must introduce a Frobenius invariant that
does **not** factor through a fixed congruence partition and must state a proof
obligation not already implied by Hardy--Littlewood in progressions. It would
also need a canonical function-field analogue, not a lexicographic ordering.

## Reproduction

Run from the repository root:

```bash
npm test -- --run tests/frobenius-tuple.test.js
node logs/atlas-kill-campaigns/frobenius-tuples/run-audit.mjs 8000000
```

Evidence is in `EVIDENCE.md`, cell-level real-prime data in `cell-data.csv`, the
full structured run in `results.json`, and the literature classification in
`NOVELTY_AUDIT.md`.
