# First survival round — Frobenius prime graph

Frozen: 2026-07-12

## Target

Test whether the proposed reciprocal-Frobenius/de-averaging mechanism for
`E_0:y^2+y=x^3-x` survives its semantic, local-constant, parity, hostile-control,
and concentration gates.  Observed cycles alone cannot promote the program.

## Frozen gates

1. Reconstruct Jones's constant/positivity classification for `E_0` and a
   hostile zero-constant curve before scanning.
2. Verify exact point counts by independent formulas at small primes, then scan
   `E_0` through the feasible frozen endpoints `5k,10k,20k,40k`.  Compare only
   with the sourced `sqrt(X)/(log X)^2` scale; no fit may define a new main term.
3. Express the edge and two-cycle conditions in trace-gap coordinates and test
   whether they factor through any fixed congruence partition.  Fixed-modulus
   factorization kills the claimed new bridge.
4. Audit parity explicitly: identify which proposed analytic input separates
   prime `#E(F_p)` from semiprime order.  If none exists, the fixed-curve
   mechanism is blocked and may not be called a survivor.
5. Run a preregistered squarefree quadratic-twist panel if the trace engine
   permits it.  A concentration step requires variance `o(mean^2)` after the
   correct curve-dependent local constants; raw dispersion or zero-heavy counts
   do not pass.
6. CM and zero-constant controls must be structurally distinct.  Failure to
   distinguish them kills the geometric interpretation.

## Promotion

- **Survive as a mechanism:** positive constant, noncongruential return, a real
  parity-breaking input, and a variance-reducing de-averaging step all pass.
- **Park at a named obstruction:** the theorem remains canonical but parity or
  de-averaging is absent.
- **Kill:** the object is fixed-congruence/known-trace in disguise, its constant
  vanishes, or controls reproduce its supposed geometric mechanism.
