# Source and artifact audit — the Polymath8b `k=50` witness

Date: 2026-07-12

Scope: a bounded search for the exact published
`M_(50,1/25)>4.0043` computation, mirrors or reimplementations, and a
current check of what `M_(49,epsilon)>4` would imply. No mathematical code was
changed in this audit.

## Bottom line

The original Mathematica payload can now be identified by name, but no public
copy was found:

- `DegreeOptimizer-2014-03-31.nb` — the notebook containing the 2,526 by 2,526
  run and its printed output;
- `MonomialMultiplier05.nb` — the contemporaneous monomial-symmetric-function
  multiplier and matrix-construction program.

Both historical Dropbox shares are currently disabled or inaccessible. The
notebooks are absent from the arXiv source package, and bounded searches of
Wayback, Common Crawl, Internet Archive items, Sourcegraph (including archived
and forked repositories), GitHub repositories, and exact-filename web search
found no mirror.

This strengthens the existing **calibration blocker**. It does not undermine
the published theorem: the paper specifies a finite exact-rational computation
that can in principle be regenerated. It means that an independent project
must rebuild that computation rather than validate a surviving certificate.

## 1. Exact provenance of the missing witness

The primary public research record is Pace Nielsen's 14 April 2014 report on
the [Polymath8b computation thread](https://terrytao.wordpress.com/2014/02/21/polymath8b-ix-large-quadratic-programs/#comment-297456).
It states:

- file: `DegreeOptimizer-2014-03-31.nb`;
- `k=50`, `epsilon=1/25`;
- basis `e_1^a m(alpha)` with `alpha` containing only even entries;
- signature degree at most 26 and total degree at most 27;
- matrix dimension 2,526;
- nearly two weeks for matrix formation and two days for the generalized
  eigenvector step;
- final lower bound `M>=4.0043`;
- two arbitrary matrix entries were printed inside the notebook as independent
  reconstruction checks.

The count 2,526 is independently forced by those basis rules. There are 373
even-entry partitions of degrees at most 26, and

`sum_(r=0)^13 p(r)*(28-2r)=2526`.

On 31 March 2014 Nielsen separately reported uploading
`MonomialMultiplier05.nb`, the program that multiplies monomial symmetric
polynomials and constructs the required basis products. Aubrey de Grey's later
implementation was based on a version of Nielsen's code, but no separate
public filename or repository was located.

The [peer-reviewed paper](https://doi.org/10.1186/s40687-014-0012-7) gives the
equivalent shifted basis `(1+epsilon-P_(1))^a P_alpha`, the exact rational
simplex-integral formulas, the use of approximate generalized eigensolving,
and the final rational Rayleigh check. The two bases span the same space by the
binomial theorem. A June 2014 clarification confirms that the `4.0043` run used
total degree 27, not the degree 28 appearing in an earlier draft.

The arXiv source archive for [arXiv:1407.4897](https://arxiv.org/abs/1407.4897)
contains only:

```text
bmcart.cls
newergap-submitted.tex
xyplot.pdf
```

It contains neither notebook nor a coefficient vector.

## 2. Archive and mirror results

### Original hosting

Two historical shared-folder identifiers occur in the Polymath threads:

- early: `j2r8yia6lkzk2gv/.../Polymath8b`;
- final paper/code folder: `0xb4xrsx4qmua7u/.../Polymath8b`.

The early links now return Dropbox's `shared_link_disabled` state. The final
published link returns `shared_link_no_access`; direct content requests return
HTTP 403. Adding legacy direct-download parameters does not expose a ZIP.

### Web archives and code indexes

The following bounded searches produced no notebook or source mirror:

- Wayback availability and CDX queries for both share identifiers, both exact
  notebook paths, and both exact filenames;
- Common Crawl's 2014 indexes for both Dropbox shares and filenames;
- Internet Archive advanced item search for the filenames and `Polymath8b`;
- Sourcegraph global code search with `archived:yes fork:yes` for both filenames
  and the final Dropbox identifier;
- GitHub repository search for `polymath8b`, bounded-gaps implementations, and
  Mathematica/Maynard variants;
- exact-filename and exact-result web searches.

The GitHub repository `kim-em/polymath8` is a June 2013 Polymath8a admissible-
tuple/sieving project. Its tree predates and does not contain the Polymath8b
variational witness.

### Reimplementations that were found

Wayback preserved two files from Ignace Bogaert's contemporaneous `KrylovMk`
site:

- [`M2eps.pdf`](https://web.archive.org/web/20140517195616id_/http://users.ugent.be/~ibogaert/KrylovMk/M2eps.pdf)
  derives the enlarged-support operator and solves the `k=2` eigenproblem;
- [`KrylovMk.pdf`](https://web.archive.org/web/20141020161356id_/http://users.ugent.be/~ibogaert/KrylovMk/KrylovMk.pdf)
  documents the separate Krylov method.

These are useful theoretical cross-checks, but neither is the `k=50,d=27`
witness, matrix engine, or coefficient payload. The Wayback CDX listing for
that directory exposes no source notebook or executable.

No later primary paper found in the bounded search publishes an independent
coefficient vector, matrix hash, or exact Rayleigh numerator/denominator for
the `4.0043` result. Later sources located merely cite the theorem.

## 3. What is and is not reconstructible from the paper

The published text is sufficient in principle to regenerate the result:

1. enumerate the 373 even-entry signatures and 2,526 pairs `(a,alpha)`;
2. reproduce the monomial-symmetric structure constants;
3. form both exact rational Gram matrices using the Section 7.1 formulas and
   the binomial change of basis for the smaller simplex;
4. solve the approximate generalized eigenproblem at high precision;
5. rationalize a candidate vector and evaluate its exact Rayleigh quotient.

What is missing is the compact calibration layer:

- the original basis ordering and normalization convention;
- the two printed check entries from the lost notebook;
- the rationalized 2,526-vector;
- its exact numerator, denominator, and strict margin over `4.0043`;
- hashes or serialized exact Gram matrices.

Consequently, matching `4.0043` numerically is not enough. A new
reimplementation should publish those five items as a permanent certificate.

## 4. Prior art for the “inactive inner chamber” idea

The boundary direction is mathematically real, but its qualitative idea is not
new. In February 2014 Eytan Paldi explicitly observed on the
[Polymath thread](https://terrytao.wordpress.com/2014/02/21/polymath8b-ix-large-quadratic-programs/#comment-272709)
that the optimizer should vanish on an inner simplex invisible to the truncated
marginals, and suggested integrating the denominator over the true reduced
support to permit larger `epsilon`. Paldi repeated this immediately after the
`k=50` announcement. Section 7.4 of the paper makes the analogous exact
observation for its `D` polytope.

Therefore this repository's inactive-chamber lemma is a clean exact
reformulation and useful compression plan, not a newly discovered variational
principle. Potential novelty would have to lie in a scalable orbit-compressed
exact implementation or a theorem quantifying its gain at large `k`.

The contemporaneous team also recorded adverse prior evidence. Degree-ladder
extrapolation made them regard `k=49` as unlikely for the global-polynomial
spaces then tested, although they explicitly did not decide whether
`M_(49,epsilon)>4`. Their stated best hope was a refined Krylov approach. This
is evidence against merely increasing the old polynomial degree, not against a
genuinely different boundary-compressed space.

## 5. Current consequence and novelty of `M_(49,epsilon)>4`

The implication is exact. Suppose for some `0<epsilon<1` that

`M_(49,epsilon)=4+delta > 4`.

Choose

`2/M_(49,epsilon) < theta < 1/2`.

Because `epsilon<1`, this can also be chosen with
`1+epsilon<1/theta`. Bombieri--Vinogradov supplies `EH[theta]`, and Polymath8b
Theorem 3.12/3.26 gives `DHL[49,2]`. The current MIT tuple archive contains the
complete [admissible 49-tuple of diameter
240](https://math.mit.edu/~primegaps/tuples/admissible_49_240.txt). Hence

`M_(49,epsilon)>4  ==>  H_1<=240`.

The same archive lists the 50-tuple of diameter 246 used by the published
record. A bounded search through primary papers and arXiv records found no
accepted unconditional bound below 246 as of this audit. The 2025 `H<=234`
ResearchGate manuscript discussed in `EVIDENCE.md` does not provide a valid
replacement implication and was not found as an accepted primary result.

Thus an exact `M_(49,epsilon)>4` certificate would still improve the accepted
explicit unconditional record from 246 to 240 and settle a variational
threshold left open by Polymath8b. It would be a real publishable theorem.

That numerical six-unit improvement alone should not be described as a new
field or a new prime-number mechanism. A field-level *methodological*
breakthrough would require the certificate to come from a transferable
compression or boundary theorem, rather than a one-off larger computation.

## Audit verdict

**Artifact status: not recovered. Calibration remains parked.**

**Mathematical target: still open and consequence-changing.**

**Mechanism novelty: reduced.** The inner-chamber direction was already
recognized in the original collaboration; the surviving research opportunity
is an exact scalable realization that the 2014 work did not supply.
