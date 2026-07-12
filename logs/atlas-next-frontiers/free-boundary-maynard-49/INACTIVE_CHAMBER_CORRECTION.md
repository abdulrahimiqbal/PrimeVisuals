# Exact inactive-chamber correction at `k=50`

Date: 2026-07-12

This is the decisive integration gate requested after the first survival
round.  It derives an exact formula for the correction to the Polymath8b
even-signature `I` matrix and implements the formula for individual monomial
symmetric moments.

## 1. The chamber and why only `I` changes

Put

`L=1+epsilon`, `b=1-epsilon`, and `S=t_1+...+t_k`.

The all-marginals-inactive chamber is

`C={t_i>=0, S<=L, S-t_i>b for every i}`.

If `F=G 1_(outside C)`, every truncated marginal is unchanged because the
domain of `J_i` imposes `S-t_i<=b`.  Therefore

`A(F)=sum_i J_i(F)=A(G)`

and

`I(F)=I(G)-integral_C G^2`.

For the Polymath8b basis

`B_(a,alpha)=(L-S)^a P_alpha`,

the correction matrix is consequently

`Delta I_((a,alpha),(a',beta))`

` = integral_C (L-S)^(a+a') P_alpha P_beta`.

No `J`-matrix correction and no labelled cell enumeration are needed.

## 2. Exact orbit-compressed formula

Let `gamma=(gamma_1,...,gamma_l)` be a signature, let
`d=sum gamma_i`, and let `P_gamma` be the monomial symmetric polynomial in
`k` variables.  Its number of distinct labelled monomials is

`N_gamma = k! / ((k-l)! product_v m_v!)`,

where `m_v` is the multiplicity of the part `v`.

Set

`x=S-b`, `h=L-b=2 epsilon`, and `x_0=b/(k-1)`.

The chamber is empty below `x_0`.  Inclusion-exclusion chooses `j`
coordinates on which `t_i>=x`.  After shifting those coordinates by `x`,
the residual shell sum is

`R_j(S)=S-jx=jb-(j-1)S=b-(j-1)x`.

It is nonnegative up to

`x_j=h` for `j=0,1`,

`x_j=min(h,b/(j-1))` for `j>=2`.

For a labelled monomial with signature `gamma`, all subset and binomial
expansions are encoded by

`Q_gamma(z,w)`

` =(1+z)^(k-l) product_i gamma_i!`

`   * [1 + z sum_(r=0)^gamma_i w^r/r!]`.

Write `C_gamma(j,r)=[z^j w^r]Q_gamma`.  Here `j` is the number of shifted
coordinates and `r` is the monomial degree lost to powers of `x`.

For radial power `a`, the exact moment is

`M_(a,gamma) = integral_C (L-S)^a P_gamma(t) dt`

` = N_gamma sum_(j,r) (-1)^j C_gamma(j,r)`

`   / (k+d-r-1)!`

`   * integral_(x_0)^(x_j)`

`       x^r [b-(j-1)x]^(k+d-r-1) (h-x)^a dx`,

omitting terms with `x_j<=x_0`.

Every endpoint is rational.  Expanding the last two powers reduces the
integral to rational endpoint powers divided by integers.  The implemented
result therefore uses only `BigInt` rational arithmetic.

Finally, if

`P_alpha P_beta = sum_gamma c_(alpha,beta,gamma) P_gamma`,

then

`Delta I_((a,alpha),(a',beta))`

` = sum_gamma c_(alpha,beta,gamma) M_(a+a',gamma)`.

This is the complete mathematical reduction.  The remaining missing engine
is the sparse monomial-symmetric structure-constant table and bulk caching,
not a high-dimensional polytope enumerator.

## 3. Independent correctness checks

Implementation:

- `src/core/freeBoundaryMaynard.js`
  - `integrateMaynardInactiveChamberSignature`
  - `integrateMaynardSimplexSignature`
  - `buildMaynardInactiveChamberConstantPilot`
- `tests/free-boundary-maynard.test.js`
- `scripts/free-boundary-inactive-chamber-pilot.mjs`

For `k=2, epsilon=1/2`, `C` is the literal triangle with vertices
`(1/2,1/2),(1,1/2),(1/2,1)`.  The orbit-compressed formula agrees with the
independent affine-triangle integrator on:

| integrand | exact integral |
| --- | ---: |
| `1` | `1/8` |
| `P_(1)=x+y` | `1/6` |
| `P_(2)=x^2+y^2` | `11/96` |
| `P_(1,1)=xy` | `7/128` |
| `L-S` | `1/48` |

The same test suite already checks the triangle primitive against independent
midpoint quadrature.

## 4. Exact `k=50, epsilon=1/25` pilot

The first exact run completes.  For the constant function:

`I_global = 2.3366415362592336e-64`,

`I_C = 2.3804905661886846e-65`,

and the exact chamber fraction is

`727806700334211563820518370159070608929601799832465759245118648774692388`

divided by

`7144003805448811234813791749096343216786565361740899772496507470211836921`,

which is

`0.10187658351736954`.

Thus this chamber contains about 10.19% of the uniform enlarged-simplex mass.
Removing it raises the constant-function quotient exactly from

`410733108503430359769518348760461160131712154160313925632`

`/ 846479679064516032629141086104071511378820264080337482233`

`=0.485225007359126`

to

`3466449299072523184890376489810269465471368288121039722932463534377795584`

`/ 6416197105114599670993273378937272607856963561908434013251388821437144533`

`=0.5402654005609151`.

This is an 11.34% relative quotient improvement for that control.  It is not a
competitive Maynard witness.

Additional exact chamber moments were obtained:

| moment | decimal value | fraction of its full-simplex moment |
| --- | ---: | ---: |
| `P_(2)` | `8.67386375692651e-67` | `0.09101801188445244` |
| `P_(2,2)` | `1.4881882597387826e-68` | `0.08432949382498810` |
| `L-S` | `1.3699937249496244e-67` | `0.02875168636111347` |

The rapid decline for radial powers is important: the 10.19% uniform mass
does not imply a comparable gain for the optimized degree-27 witness, which
may suppress the outer shell.

Runtime on this machine was roughly 0.4–0.5 seconds for the exact chamber
volume, 1.3 seconds for `P_(2)`, and 2.2 seconds for `P_(2,2)`.  The complete
four-moment pilot script takes about 4.6 seconds.

## 5. Full calibration complexity

At degree 27 and `k>=27/2`, the published even-signature basis contains:

- 373 signatures;
- 2,526 `(a,alpha)` basis elements;
- 3,191,601 upper-triangular Gram entries.

Products have total degree at most 54.  The worst-case catalogue of even
signature/radial moments through degree 54 contains 120,988 entries.  This is
finite and vastly smaller than `2^50`, but calling the current standalone
exact routine independently for all 120,988 moments would take days.

For one moment, the implemented dynamic program has at most
`O(k d)` `(j,r)` states.  Its direct binomial kernel costs
`O((k+d)(a+1))` rational operations per populated state.  This is correct for
pilots but deliberately not the bulk algorithm.

## 6. Precise computational plan

1. **Structure constants.** Generate the sparse integers
   `c_(alpha,beta,gamma)` by exponent-multiplicity contingency tables.  Since
   each degree-27 even signature has length at most 13, enumerate overlap
   counts between part multiplicities, not placements among 50 coordinates.
   Verify the table against direct labelled expansion for small `k,degree`.
2. **Signature tables.** Compute each coefficient table
   `C_gamma(j,r)` once.  Zeros enter analytically through
   `binomial(k-length(gamma),j-j_positive)`.
3. **Kernel cache.** Cache
   `K_(a,d,j,r)=integral x^r[b-(j-1)x]^(k+d-r-1)(h-x)^a dx`
   by `(a,d,j,r)`.  Endpoint powers, factorials, and binomial rows must also
   be shared.  Use recurrences/Horner evaluation instead of re-expanding each
   kernel from scratch.
4. **Discovery arithmetic.** Assemble a high-precision or outward-rounded
   numeric correction matrix from the cached exact/interval moments.  The
   numeric dense matrix is about 51 MiB; this is feasible.  Do not hold three
   million large unreduced rational objects in memory.
5. **`k=50` calibration.** Independently rebuild the published global `I` and
   `A` matrices, reproduce `M_(50,1/25)>4.0043`, then solve with
   `I_truncated=I_global-Delta I` and the unchanged `A`.
6. **Exact final check.** Round only the winning vector to rationals.  Form
   its sparse symmetric polynomial square, contract it with the cached exact
   moment functional, and verify one exact numerator and denominator.  A full
   exact matrix is unnecessary for the certificate.
7. **Continuation.** Attempt `k=49` only if the certified `k=50` correction is
   material relative to the margin above 4.

## 7. Gate verdict

**Exact chamber integration survives.**  The proposed orbit compression is
mathematically correct, independently checked at `k=2`, and produces nonzero
exact `k=50` moments on sub-second-to-second pilot timescales.

**The full theorem remains parked.**  Sparse structure constants, bulk kernel
caching, reconstruction of the missing published witness, and a material
optimized `k=50` gain are still required before `k=49` is justified.

## 8. Sparse quadratic evaluator and runtime ceiling

The next implementation layer is now callable:

- `multiplyMaynardMonomialSymmetric(k,alpha,beta)` computes sparse integer
  structure constants by exponent-multiplicity contingency tables;
- `evaluateMaynardInactiveChamberQuadratic(...)` expands a sparse rational
  witness square and contracts only its nonzero signature/radial moments;
- `buildMaynardInactiveChamberCorrectionMatrix(...)` constructs a corrected
  finite-basis `I` matrix with shared product, moment, and kernel caches;
- `scripts/free-boundary-chamber-correct-witness.mjs witness.json` accepts the
  explicit coefficient schema emitted by the enlarged-signature calibration.

The product engine was checked exhaustively against direct labelled-monomial
enumeration for small `k` and all signature pairs through degree four.  A
two-dimensional sparse witness `2+3P_(1)` gives the independently checkable
exact chamber quadratic `289/64`.

Low-degree `k=50, epsilon=1/25` radial eigenchecks are:

| radial degree | global quotient | corrected quotient |
| ---: | ---: | ---: |
| 0 | 0.485225007359126 | 0.540265400560915 |
| 1 | 1.970229089444956 | 1.986285287146330 |
| 2 | 2.944549022036469 | 2.955946836808372 |
| 3 | 3.156185414470959 | 3.157678421113408 |

For degree three, both displayed values were independently reevaluated from
rounded integer vectors and exact rational Gram matrices.  The nonzero gain
therefore is not a floating-eigenvalue artifact.

The exact degree-seven, 28-coefficient signature-witness contraction was then
attempted.  Its product square has at most the 195 degree-14
signature/radial moments predicted by the catalogue.  Even after cross-moment
kernel caching, the pure-JavaScript `BigInt` contraction did not complete
within the frozen 20-minute ceiling and was terminated.  CPU usage remained
active and memory low: the obstruction is large rational endpoint
cancellation, not an accidental labelled-cell expansion.

Consequences:

1. the current exact JavaScript evaluator is suitable for small pilots and
   perhaps a final sparse certificate, but is killed as a degree-27 discovery
   or reoptimization engine;
2. candidate discovery should use vectorized numeric/interval moments or
   chamber Monte Carlo, with a compiled FLINT/Sage contraction reserved for
   the final candidate;
3. a full degree-27 square can require up to 120,988 moments, so the compiled
   exact backend must use common-denominator polynomial evaluation or modular
   reconstruction rather than repeated normalized rational addition.

Finally, ordinary polynomials are `L^2`-dense on the compact enlarged
simplex.  Chamber truncation therefore does **not** enlarge the limiting
variational space defining `M_(k,epsilon)`; it only changes finite-dimensional
convergence and conditioning.  Its valid role is a basis accelerator.  Any
field-level claim must still be the explicit `M_(49,epsilon)>4` certificate,
not the inactive-chamber lemma itself.
