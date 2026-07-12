# Audit of the enlarged-signature engine

Date: 2026-07-12

## Verdict

The exact matrix formulas in `src/core/enlargedMaynardSignature.js` are
consistent with the definitions and degree conventions in Polymath8b, and
they passed an independent exact polynomial-integration check.  The
degree-3 through degree-11 numerical ladder is reproducible to the accuracy
claimed.

This is a formula-level validation, not a reproduction of the historical
degree-27 theorem.  The available repository artifact rigorously certifies a
degree-7 lower bound only.  Any degree-27 or `k=49` claim must finish with an
exact rational Rayleigh certificate; the generalized eigensolver output is
only a witness proposal.

The main new warning is numerical conditioning.  Unit-diagonal scaling does
not make the monomial/slack basis safe in ordinary double precision at high
degree.  Low-degree Cholesky pivots decay rapidly enough that a naive
extrapolation reaches machine precision near degree 27.  A full run therefore
needs either a substantially better-conditioned basis or a multiprecision
proposal solve.

## Primary-source conventions

The peer-reviewed [Polymath8b paper](https://doi.org/10.1186/s40687-014-0012-7)
defines

\[
M_{k,\epsilon}=\sup_F
\frac{\sum_{i=1}^k J_{i,1-\epsilon}(F)}{I(F)},
\]

where `F` is supported on `(1+epsilon) R_k`, while each marginal square is
integrated over `(1-epsilon) R_(k-1)`.  Section 7.2 uses

\[
b_{a,\alpha}=(1+\epsilon-P_{(1)})^aP_\alpha,
\qquad a+|\alpha|\le d,
\]

and reports `M_(50,1/25)>4.00124` for `d=25` and `>4.0043` for `d=27`.

Pace Nielsen's [contemporaneous computation
report](https://terrytao.wordpress.com/2014/02/21/polymath8b-ix-large-quadratic-programs/#comment-297456)
specifies the historical degree-27 space more precisely:

- `k=50` and `epsilon=1/25`;
- signatures have even positive entries and signature degree at most 26;
- total polynomial degree is at most 27;
- the matrix dimension is 2,526.

A later [degree-convention
correction](https://terrytao.wordpress.com/2014/05/17/polymath-8b-xi-finishing-up-the-paper/comment-page-2/#comment-363950)
confirms that 27, not 28, is the correct total degree.  The current engine's
condition `a+|alpha|<=27` gives signature degree at most 26 automatically,
because every signature part is even.  It enumerates 373 signatures and 2,526
pairs `(a,alpha)`, exactly as required.

The historical report described the basis as `P_(1)^a P_alpha`; Section 7.2
uses `(1+epsilon-P_(1))^a P_alpha`.  For every fixed `alpha`, these two finite
families are related by an invertible triangular binomial change of basis.
They therefore give the same generalized eigenvalues when the same total
degree cutoff is used.

## Formula audit

The paper defines `P_alpha` as the sum over distinct coordinate exponent
tuples having signature `alpha`.  For padded signatures `alpha,beta`, direct
Dirichlet integration gives

\[
\int_{\sum t_i\le C}(C-\sum t_i)^rP_\alpha P_\beta\,dt
=C^{k+|\alpha|+|\beta|+r}
\frac{r!W_k(\alpha,\beta)}
{(k+|\alpha|+|\beta|+r)!},
\]

with

\[
W_k(\alpha,\beta)
=|\operatorname{Orb}(\alpha)|
\sum_{b:s(b)=\beta}\prod_i(\alpha_i+b_i)!.
\]

The engine's multiset dynamic program enumerates the distinct beta exponent
tuples in this expression.  It correctly does not multiply a transition by
the remaining multiplicity of an exponent: equal beta entries describe one
distinct value assignment, not separately labelled objects.

For a basis element, choosing exponent `e` in the marginalized coordinate
leaves `P_(alpha minus e)` and

\[
\int_0^{A-S'}t^e(A-S'-t)^a\,dt
=\frac{a!e!}{(a+e+1)!}(A-S')^{a+e+1}.
\]

With `A=1+epsilon` and `B=1-epsilon`, the engine expands
`A-S'=2 epsilon+(B-S')` and integrates over `B R_(k-1)`.  Multiplication by
`k` is correct because all basis functions are symmetric, so all `J_i` are
equal.

### Independent exact oracle

I wrote a separate, temporary brute-force checker that did not use the
signature product formula.  It explicitly:

1. enumerated every distinct coordinate permutation in `P_alpha`;
2. expanded `(A-sum(t))^a` as a multivariate polynomial;
3. integrated every monomial by the Dirichlet identity;
4. integrated the marginalized coordinate symbolically; and
5. integrated the square of that result on the smaller simplex.

It agreed entry-for-entry, as exact fractions, in both checks:

- `k=3`, `epsilon=1/4`, `d=2`: all entries of both 4-by-4 matrices;
- `k=2`, `epsilon=1/4`, `d=4`: all entries of both 10-by-10 matrices,
  including the full-length signature `(2,2)`, for which there is no
  zero-exponent marginal branch.

This also checks the epsilon sign and the use of `1-epsilon`, rather than
`1+epsilon`, for the marginal domain.

## Ladder audit and conditioning evidence

An independent double-precision solver was implemented with unit-diagonal
scaling, Cholesky reduction, and power iteration.  It did not use the
repository's Decimal.js Jacobi eigensolver.

| degree | dimension | independent quotient | documented quotient | minimum scaled Cholesky pivot |
|---:|---:|---:|---:|---:|
| 3 | 6 | 3.227866311478 | 3.227866311478 | `8.6e-3` |
| 5 | 14 | 3.506624900927 | 3.506624900927 | `6.1e-4` |
| 7 | 28 | 3.671713436039 | 3.671713436036 | `4.5e-5` |
| 9 | 52 | 3.779192356398 | 3.779192355631 | `2.3e-6` |
| 11 | 90 | 3.851956586368 | 3.851956568097 | `9.8e-8` |

The degree-9 and degree-11 differences are consistent with the documented
double-solver residuals, so those rows are useful trajectory diagnostics but
are not certificates.  The current degree-7 JSON contains an exact rational
Rayleigh evaluation and is a rigorous lower bound for its displayed rational
vector.

A least-squares fit to `log10(minimum pivot)` over these five rows predicts a
factor of about `0.059` per two added degrees and a degree-27 pivot near
`1.7e-17`.  This extrapolation is not a theorem about the degree-27 matrix,
but it is a decisive engineering warning: it is at the scale of IEEE double
roundoff.  It agrees with Pace Nielsen's [historical
observation](https://terrytao.wordpress.com/2014/02/21/polymath8b-ix-large-quadratic-programs/#comment-283266)
that 50-digit matrix approximations were insufficient in a nearby
degree-29/signature-degree-22 computation and that 100 digits were used.

No primary historical values for the exact fixed-`epsilon=1/25` degrees
3, 5, 7, 9, and 11 were located, so the table is an independent reproduction
of the repository ladder, not a comparison to archived Polymath output.  The
historical anchors remain degree 25 (`>4.00124`) and degree 27 (`>4.0043`),
neither of which has been executed in this repository.

## Hard certificate gates for a degree-27 or k=49 claim

The following are acceptance gates, not optional diagnostics.

### 1. Freeze the mathematical object

- Record exact integers `k`, `d`, the rational `epsilon`, and the target.
- Record the full ordered basis, its dimension, and a cryptographic hash.
- State separately the total-degree and signature-degree cutoffs.
- Require `0<epsilon<1` for an epsilon-enlarged theorem claim.
- If a piecewise or inactive-chamber correction is used, specify every chamber
  inequality and its boundary convention.  A polynomial-only certificate
  cannot silently certify a different piecewise trial function.

### 2. Validate matrix generation independently

- Check exact small cases against direct expanded-polynomial integration.
- Check `epsilon=0` against an independent standard-simplex implementation.
- Check invariance under the triangular change between the `P_(1)^a` and
  shifted-slack bases at several degrees.
- Check selected matrix entries with a second implementation of `W_k`; if the
  lost historical notebook is recovered, include its two printed entries.
- Check exact symmetry and the expected dimension before solving.

### 3. Treat conditioning as a first-class output

- Scale to unit diagonal in `I`, then report Cholesky pivots, a condition
  estimate for scaled `I`, and any rank-revealing diagnostic.
- Solve at a precision ladder, not one precision.  Increase precision until
  the quotient, residual, and rationalized certificate margin stabilize.
- Report the generalized backward error

  \[
  \frac{\|Ac-\lambda Ic\|}
  {(\|A\|+|\lambda|\|I\|)\|c\|}
  \]

  in a named norm, and report the gap between the two largest computed
  eigenvalues.  The gap measures vector sensitivity; it is not a substitute
  for the exact lower-bound check.
- Ordinary double precision is disallowed unless these diagnostics establish
  a substantial safety margin.  The observed pivot trajectory does not do so
  for degree 27.

### 4. Publish a self-contained exact witness

- Clear a common coefficient denominator and publish a primitive nonzero
  integer coefficient vector `c` in the frozen basis ordering.
- Regenerate exact rational matrix entries and evaluate only the two scalar
  forms

  \[
  N=c^T A c,\qquad D=c^T I c.
  \]

- Verify `D>0` exactly.  This both makes the quotient legal and proves that the
  represented function is nonzero in `L^2`.
- For the historical degree-27 calibration, verify the exact integer/rational
  sign

  \[
  10000N-40043D>0.
  \]

- For a `k=49` breakthrough, verify

  \[
  N-4D>0.
  \]

  A tiny positive floating margin is not enough; only this exact sign is the
  theorem certificate.
- Publish `N`, `D`, the signed target margin, and a normalized decimal margin.

Dense exact matrices do not need to be stored.  Entries may be regenerated
and accumulated as a stream.  If CRT/modular arithmetic is used for the final
sign, the product of moduli must exceed a proved reconstruction bound so that
the signed integer is unique.  Agreement modulo a handful of primes is an
excellent bug check, but by itself is not a proof of a positive rational sign.

### 5. Make the certificate reproducible and adversarially checkable

- Use a second exact evaluator or independently derived structure-constant
  implementation on the published integer vector.
- Publish source revision, runtime/library versions, command line, basis hash,
  coefficient hash, and output hashes.
- Perturb rationalization precision and denominator size.  Multiple witnesses
  should retain the exact target sign if the numerical proposal has a healthy
  buffer.
- Run deterministic unit tests for the exact small matrices and randomized
  property tests for product weights, symmetry, and basis changes.

### 6. Verify the number-theoretic implication separately

For a certified `Q=N/D>4` at `k=49` and `0<epsilon<1`, choose and publish a
rational

\[
\frac{2}{Q}<\vartheta<\frac12.
\]

Bombieri-Vinogradov supplies `EH[theta]`; also
`1+epsilon<2<1/theta`, and `Q>2/theta`.  The epsilon-enlarged simplex theorem
then gives `DHL[49,2]`.  Finally, mechanically verify all residue classes of
the [49-element admissible tuple of diameter
240](https://math.mit.edu/~primegaps/tuples/admissible_49_240.txt).  The tuple
verification and the analytic Rayleigh certificate are separate obligations.

## Documentation corrections

Two current statements in `SIGNATURE_CALIBRATION.md` should be corrected when
that report is next regenerated:

1. A 2,526-by-2,526 dense matrix has `2,526^2 = 6,380,676` entries, not
   `6,378,276`.  Its upper triangle has 3,191,601 entries.
2. The narrative's degree-7 precision, residual, and printed exact fraction
   describe an earlier run.  The current JSON records precision 60, residual
   `2.086118219720024...e-42`, rational digits 28, and a different exact
   rationalized witness.  The certified decimal quotient is consistent, but
   the report and machine-readable artifact should describe the same run.
