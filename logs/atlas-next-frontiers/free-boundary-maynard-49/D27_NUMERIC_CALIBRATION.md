# Degree-27 enlarged-signature calibration

Date: 2026-07-12

## Verdict

The optimized backend executed the full 2,526-dimensional, degree-27
even-signature space.  It does **not** supply a field-level breakthrough
witness.

At the strongest numerically self-consistent cutoff, it finds:

| parameters | cutoff | retained rank | direct quotient | target | outcome |
|---|---:|---:|---:|---:|---|
| `k=50`, `epsilon=1/25` | `3e-16` | 2,048 | 3.9925453054 | published `>4.0043` | positive control not reproduced |
| `k=49`, `epsilon=1/24` | `3e-16` | 2,052 | 3.9760025490 | `>4` | no crossing |

The matched `k=49` value is about `0.01654` below the `k=50` value and about
`0.02400` below four.  The proposed `k=49` free-boundary route therefore does
not survive this finite-basis numerical test as breakthrough evidence.

This is not a proof that the underlying variational supremum is below four.
The backend also fails its known `k=50` positive control, so the honest
interpretation is narrower: ordinary double precision in the raw signature
basis cannot resolve the directions that carry the published improvement.

## Stable-versus-spurious cutoff test

For every spectral cutoff, the runner reconstructs the proposed vector in
the original scaled matrices and records both the reduced eigenvalue and the
direct Rayleigh quotient.  A row is accepted as stable only if all three hold:

- `abs(eigenvalue - directQuotient) < 1e-3`;
- `abs(denominator - 1) < 1e-3`;
- generalized residual `< 1e-5`.

This rejects cutoff-only jumps that disappear when evaluated in the original
quadratic forms.  For `k=50`, the `1e-16` cutoff appears to give `4.01046215`,
but the direct quotient collapses to `3.42439417` and the reconstructed
denominator becomes `1.17071655`; it is rejected.  At `5e-17`, the apparent
value is `5.97622767`, while the direct value is only `2.96066952`; it is also
rejected.  The stable sequence plateaus near `3.992545` before those jumps.

For `k=49`, cutoff `2e-16` already fails the criterion: its eigen/direct gap
is about `0.001365`.  The `1e-16` result is a much larger numerical artifact.

## Conditioning and performance

The denominator Gram matrix is extremely ill-conditioned even after diagonal
scaling:

| parameters | smallest computed eigenvalue | largest eigenvalue | nonpositive computed modes | positive condition estimate |
|---|---:|---:|---:|---:|
| `k=50`, `1/25` | `-4.275e-12` | `509.027` | 88 | `1.03e17` |
| `k=49`, `1/24` | `-4.693e-12` | `508.460` | 87 | `1.18e18` |

The negative modes are numerical roundoff in a theoretical Gram matrix, not
evidence of a negative integral.  Their presence explains why cutoffs below
roughly machine epsilon generate fictitious improvements.

For the `k=50` positive control, the optimized build took about 26 seconds and
the ten-cutoff solve took about 119 seconds on this machine.  The solve used
about 469 MB maximum resident memory.  The backend avoids per-entry rational
objects: it caches exact integer orbit weights, fills moment blocks directly
as doubles, and assembles the marginal matrix as `k * T.T * H * T`, where the
2,526-column sparse transform has 80,348 nonzeros and `H` has 2,899 terms.

## Why no exact streamed certificate was run

Exact streaming is useful only after a numerical proposal clears the target
with margin.  Neither stable vector clears four, and exact evaluation cannot
turn a quotient short by `0.024` into the desired `k=49` witness.  Streaming
the exact forms for this vector would certify a non-breakthrough result while
consuming the expensive part of the computation.

To pursue the known `k=50` edge, the next prerequisite is a genuinely
better-conditioned or arbitrary-precision proposal pass.  The attempted
raw-moment Jacobi and Bernstein changes of basis still lose too many digits
during their transforms; they did not reproduce `>4.0043` and are not treated
as candidate evidence.

## Reproduction artifacts

- Runner: `scripts/maynard_enlarged_d27_numeric.py`
- `k=50` candidate: `d27-numeric-k50-e1over25-candidate.json`
- `k=50` run metadata: `d27-numeric-k50-e1over25-run.json`
- `k=49` candidate: `d27-numeric-k49-e1over24-candidate.json`
- `k=49` run metadata: `d27-numeric-k49-e1over24-run.json`

The candidate JSON files contain the complete 2,526-coefficient vectors,
every tested cutoff, the stable/rejected split, and the spectrum diagnostics.
