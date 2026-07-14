# Experiments

## Baseline

`npm test` passes at campaign start: 32 files, 306 tests.

No theorem claim is supported by a finite experiment. Route-specific commands,
inputs, conditioning diagnostics, and holdout results are appended here only
when computation distinguishes mechanisms or produces an exact certificate.

## Round 9 — exact threshold-inertia proof of concept

Object: the exact rational enlarged-signature Gram pair for
`k=50`, `epsilon=1/25`, degree 5, dimension 14.

| Rational threshold | Positive inertia | Negative inertia |
| ---: | ---: | ---: |
| `3.5` | 1 | 13 |
| `3.51` | 0 | 14 |
| `4.0043` | 0 | 14 |

This independently brackets the existing exact/numerical optimum
`3.506624900927...`. Reduced exact pivots already have about 900--1050 decimal
digits, so naive dense exact `LDL^T` is rejected as a full dimension-2526
backend. No historical file was overwritten and no degree-27 theorem
certificate was produced.

Reproduce from repository root:

```sh
node logs/2026-07-12-field-breakthrough/round9-threshold-inertia.mjs
```

## Final verification

- `npm test -- --reporter=dot`: PASS, 32/32 files and 306/306 tests,
  exit code 0.
- `npm run build`: PASS, 1,770 modules transformed, exit code 0.
- `node --check logs/2026-07-12-field-breakthrough/round9-threshold-inertia.mjs`:
  PASS.
- `git diff --check`: PASS.
