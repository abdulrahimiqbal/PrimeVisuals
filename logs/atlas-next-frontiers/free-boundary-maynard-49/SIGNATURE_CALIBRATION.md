# Independent Section 7.2 signature calibration

Date: 2026-07-12

## Outcome

The repository now has an independent exact implementation of the
Polymath8b enlarged-simplex signature formulas and a reproducible rational
`k=50, epsilon=1/25` calibration cell.  It exactly certifies

\[
M_{50,1/25}\ge
3.6717134360360123858276878885534369135\ldots
\]

in the complete degree-7 even-signature space.

This validates the formula path, basis convention, rational matrix builder,
high-precision proposal step, and exact Rayleigh verification.  It does **not**
yet reproduce the published degree-27 bound `>4.0043`.

## Primary-source reconstruction

[Polymath8b Section 7](https://arxiv.org/pdf/1407.4897#page=58) defines

\[
b_{a,\alpha}(t)=(1+\epsilon-P_{(1)}(t))^aP_\alpha(t)
1_{P_{(1)}(t)\le1+\epsilon},
\]

where `alpha` is a signature.  Section 7.2 reports that `k=50`,
`epsilon=1/25`, maximum degree `d=27`, and signatures with even entries give
`M_(50,1/25)>4.0043`.  The denominator matrix is integrated over
`(1+epsilon)R_k`; the marginal numerator is integrated over
`(1-epsilon)R_(k-1)`.  The paper says that numerical eigenvectors were
rationalized and then checked with exact arithmetic.

The new implementation independently reproduces the stated degree-27 basis
dimension:

- 373 even signatures;
- 2,526 pairs `(a,alpha)` with `a+|alpha|<=27`.

## Exact formulas implemented

Fix a representative of the orbit `alpha`.  Define

\[
W_k(\alpha,\beta)=|\operatorname{Orb}_k(\alpha)|
 \sum_{b:s(b)=\beta}\prod_{i=1}^k(\alpha_i+b_i)!.
\]

The sum over the `beta` orbit is evaluated by a memoized multiset-assignment
DP; no `P_alpha P_beta` structure-constant table is required.  Then

\[
\int_{S\le C}(C-S)^rP_\alpha P_\beta\,dt
=C^{k+|\alpha|+|\beta|+r}
 \frac{r!W_k(\alpha,\beta)}
 {(k+|\alpha|+|\beta|+r)!}.
\]

For a marginal in the first coordinate,

\[
P_\alpha^{(k)}(t,x)=
P_\alpha^{(k-1)}(x)
+\sum_{e\in\operatorname{distinct}(\alpha)}
t^eP_{\alpha\setminus e}^{(k-1)}(x).
\]

Each term integrates exactly as

\[
\int_0^{A-S'}t^e(A-S'-t)^a\,dt
=\frac{a!e!}{(a+e+1)!}(A-S')^{a+e+1}.
\]

Writing `A=1+epsilon`, `B=1-epsilon`, the remaining power is converted to the
`B` simplex by

\[
(A-S')^q=(2\epsilon+B-S')^q
=\sum_{u=0}^q\binom qu(2\epsilon)^{q-u}(B-S')^u.
\]

These formulas produce both Gram matrices as reduced rationals.

## Executed ladder

The complete even-signature space was used at every displayed degree.

| degree | dimension | quotient | status |
|---:|---:|---:|---|
| 3 | 6 | 3.227866311478 | double calibration |
| 5 | 14 | 3.506624900927 | independently exact-rationalized |
| 7 | 28 | 3.671713436036 | independently exact-rationalized |
| 9 | 52 | 3.779192355631 | double proposal; eigensolver flag not converged |
| 11 | 90 | 3.851956568097 | double proposal; residual `2.41e-8` |
| 27 | 2,526 | published `>4.0043` | not executed |

For degree 7 the current 60-digit proposal residual is
`2.08611821972002416948773174397620642573692516392105502229143e-42`.
Rounding every coefficient to denominator `10^28` and evaluating the two quadratic forms
from the exact rational matrices gives

`10302732360726950362261475672752905828777485273131891586226767197778157713535581232814667311874505089098228115315216462203066112802816`

divided by

`2805973979235644397576235293863184107226350829662676212601684379465508332528082255954648538561578197325744555700343243228837097700725`.

Thus the displayed degree-7 value is a rigorous lower bound even though the
eigensolver's conservative sweep-convergence flag was false.

## Precise full-calibration blocker

The mathematics is no longer the blocker.  The current reference
implementation stores every reduced-rational entry and uses a cubic
Decimal.js dense eigensolver:

- degree 11 already needs about 30 seconds merely to build two 90-by-90 exact
  matrices;
- degree 27 needs 6,380,676 entries per matrix;
- two dense double matrices would be about 102 MiB, but JavaScript objects
  containing reduced BigInt numerator/denominator pairs require far more;
- the current arbitrary-precision Jacobi routine is cubic and is not credible
  at dimension 2,526.

The published coefficient payload cannot shortcut this step: its cited
Dropbox directory currently returns a no-access page, and the paper does not
print the vector.

## 2026-07-12 full numeric update

The optimized NumPy/SciPy backend in
`scripts/maynard_enlarged_d27_numeric.py` has now executed the complete
degree-27 space.  The strongest numerically self-consistent direct quotient is
`3.9925453054` for the `k=50`, `epsilon=1/25` positive control, so ordinary
double precision does not reproduce the published `>4.0043` result.  The
matched `k=49`, `epsilon=1/24` run reaches only `3.9760025490`.

See `D27_NUMERIC_CALIBRATION.md` for the stability rule, rejected cutoff
artifacts, conditioning data, performance, and complete candidate files.

## Smallest credible executable reconstruction of `>4.0043`

Keep the implemented basis enumeration, orbit DP, moment formulas, and exact
degree-7 test.  Replace only the full-run storage/solver layer:

1. **Numeric proposal pass.** Generate diagonally scaled `I` and `A` directly
   as packed doubles, caching `W_k`; do not construct rational objects.  Use a
   mature symmetric generalized eigensolver or a Cholesky/Lanczos iteration.
   Require a proposed quotient at least `4.00435` and a small generalized
   residual.
2. **Rationalize once.** Scale the selected 2,526-vector and round it to a
   common decimal denominator at 40--80 digits.  Repeat at a second denominator
   as a stability check.
3. **Stream the exact certificate.** Regenerate one `(I_ij,A_ij)` pair at a
   time with the implemented formulas, accumulate
   `(2-delta_ij)c_i c_j I_ij` and the corresponding `A` form, and discard the
   matrix entry immediately.  No exact matrix or exact eigensolve is needed.
4. **Verify the actual published inequality.** Check the integer sign of
   `10000*A(c)-40043*I(c)`, not merely a floating quotient above four.
5. **Independent check.** Re-evaluate the same rational vector using modular
   rational arithmetic over independent primes, or a second implementation of
   `W_k`, before accepting the calibration.

This is the smallest reconstruction because a rational witness vector plus
two scalar exact quadratic forms is the certificate.  Exact dense matrices
and an exact eigenvector are unnecessary.

## Files and reproduction

- `src/core/enlargedMaynardSignature.js`
- `tests/enlarged-maynard-signature.test.js`
- `scripts/maynard-enlarged-signature-calibration.mjs`
- `signature-calibration-k50-e1over25-d7.json`

Run:

```text
npx vitest run tests/enlarged-maynard-signature.test.js
node scripts/maynard-enlarged-signature-calibration.mjs --degree=7 --precision=70 --rational-digits=35
```

The script exposes `--degree=27`, but the current exact-dense backend is a
reference implementation, not an operational full-scale solver.
