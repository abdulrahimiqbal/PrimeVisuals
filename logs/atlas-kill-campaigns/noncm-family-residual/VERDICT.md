# Frontier 4 verdict: generic non-CM family residual

Date: 2026-07-12

Status: **KILL / NO EXPERIMENT-ELIGIBLE OR FIELD-LEVEL SURVIVOR**.

## Decision

No concrete nonzero generic non-CM residual survives the frozen gates.

- Complete Legendre moments are exact character-orthogonality or
  Birch/Kaplan--Petrow Hecke-trace formulas.
- Removing `j=0,1728` subtracts explicit known terms; it does not create a new
  remainder.
- The cycle-021 supersingular signal is exactly local/CM/class-number data.
- Fixed non-CM curves have a proved Sato--Tate zero limiting mean, but no
  preregistered nonzero lower-order residual, matched function-field object,
  or full exact integer engine.
- Incomplete trace-function bounds do not supply the required nonzero baseline
  or integer analogue.
- The abstract l-adic lane never specified its sheaf package, conductor,
  normalization, or integer statistic.

The hard “stop before data” gate and the full-ladder eligibility gate both
fire.

## Decisive repair of cycle 020

Cycle 020 included the CM parameter `lambda=2`.  The repaired audit uses only
`lambda=3,...,13`, certifies each as non-CM by its nonintegral rational
`j`-invariant, and removes every reduction landing in the special
automorphism loci.

At the final pilot endpoint `20,000`:

- observed `z=0.724878`;
- observed path maximum `|z|=1.098113`;
- bootstrap final `|z|` reaches `2.440632`;
- shuffled path maxima range from `1.648684` to `3.007685`.

Thus even the corrected pilot is control-contained.  The computation is
reproducible with
`node scripts/noncm-generic-window-kill-audit.mjs 20000`.

## What remains useful

Retain this lane as a negative-knowledge rule:

1. do not call an explicit Hecke trace a new residual;
2. do not mix fixed rational parameters with presentation-dependent
   polynomial windows and call them a two-universe match;
3. certify every parameter as non-CM and excise special reductions before
   scoring;
4. do not run incomplete-family data without a sourced, window-specific
   theorem baseline and a frozen nonzero remainder;
5. enforce the full exact integer ladder before promotion.

## Reopen condition

Reopen only if one artifact arrives *before new data* containing all of:

- an intrinsic growing incomplete family in both universes;
- an exact or theorem-bounded baseline with every Hecke, CM, special,
  congruence, and class-number term written explicitly;
- a named nonzero residual not equal to one of those terms;
- a concrete l-adic sheaf/conductor package if trace functions are used;
- a fast exact implementation for `1M,2M,4M,8M` and matched `q=3,5,7`
  ladders;
- an independent theorem consequence.

Until then, frontier 4 is closed rather than parked as a breakthrough lead.
