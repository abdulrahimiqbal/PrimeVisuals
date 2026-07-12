# Parallel invariant tournament

Date: 2026-07-11  
Verdict: `NO EXACT RH INVARIANT FOUND / PROVISIONAL SURVIVOR LATER KILLED`

Update, 2026-07-12: exact reconstruction of the zero-density transfer killed
the provisional structured-incidence candidate as a primary invariant. The
actual bottleneck is at threshold exponent `7/10`, not `3/4`; the detector is
a balanced convolution of truncated-Mobius weights, not prime-supported; and
Guth--Maynard's `S3` becomes coefficient-free after their operator-norm step.
See `logs/2026-07-12-structured-incidence-kill-test.md`.

Three independent lanes were run and then cross-examined:

1. current-frontier and barrier audit;
2. exact kernel construction and structural falsification;
3. solvable-model/function-field transport.

Candidates were required to have an exact formula, an unconditional first
lemma within at most logarithmic distance of known machinery, and an
independent mathematical consequence. Repackaged RH, PCC, short-interval
variance, and Hardy--Littlewood statements were rejected.

## 1. Structural result: leave quadratic block statistics

For `a(n)=Lambda(n)-1` and finite block weights `f,g`, every
translation-invariant quadratic block statistic has the form

\[
Q_{f,g}(X)=\frac1X\sum_{x\asymp X}
\left(\sum_u f(u)a(x+u)\right)
\left(\sum_v g(v)a(x+v)\right)
=\sum_h K_{f,g}(h)C_X(h),
\]

where

\[
K_{f,g}(h)=\sum_u f(u)g(u+h).
\]

The identities

\[
K_{f,g}(0)=\langle f,g\rangle,
\qquad
\sum_hK_{f,g}(h)=\left(\sum f\right)\left(\sum g\right)
\]

show that diagonal cancellation and background cancellation force the main
term down to the lower-order singular-series fluctuation. For an `H`-scale
kernel, retaining a constant main term then leaves an `l1` kernel mass of
order `H`, recreating ABAC's missing-factor-`H` error obligation. Haar blocks,
separation derivatives, and adjacent-block variants all failed this test.

Decision: do not search further for the breakthrough inside
translation-invariant quadratic prime-block covariances.

## 2. Sieve-flow innovations: exact model, no terminal leverage

For

\[
\alpha_y(n)=1_{P^-(n)>y},\qquad
P_y=\prod_{p\le y}(1-1/p),
\]

and

\[
Z_y(x,H)=\sum_{x<n\le x+H}(\alpha_y(n)-P_y),
\]

the proposed innovation was

\[
I_{y\to z}=Z_z-\frac{P_z}{P_y}Z_y.
\]

Over a complete CRT period this is a genuine martingale difference:

\[
\mathbb E[Z_z\mid\mathcal F_y]=\frac{P_z}{P_y}Z_y.
\]

Thus disjoint sieve-band innovations are exactly orthogonal in the periodic
model. This is elegant but elementary CRT structure, not the missing integer
theorem.

Two obstructions appeared under cross-examination:

1. At `y=X^(1/u)`, the finite-`X` rough-number density is governed by
   Buchstab's function `omega(u)/log y`, not Mertens' periodic density
   `exp(-gamma)/log y`. The proposed centering and transport coefficient are
   wrong near the prime endpoint unless Buchstab-corrected.
2. Window covariance still expands into shifted rough-number correlations
   with a tent kernel. At `z=sqrt(2X)`, `alpha_z` is exactly the prime
   indicator on `[X,2X]`, and terminal innovation energy becomes prime
   short-interval variance in a new basis. Type II information and the parity
   barrier return at precisely this transition.

A Buchstab-corrected covariance defect may be a useful calibration object,
but sieve flow is not promoted as the breakthrough route.

## 3. Surviving nonlinear frontier: structured large-value incidence

For

\[
D_b(t)=\sum_{N<n\le2N}b_n n^{it},\qquad |b_n|\le1,
\]

define the large-value incidence functional

\[
\mathfrak I_{N,T,V}(b)=
\sup\left\{|W|:
W\subset[0,T]\text{ is 1-separated and }
|D_b(t)|\ge V\text{ for all }t\in W\right\}.
\]

This object is nonlinear and thresholded, so it escapes the quadratic-block
no-go. Guth--Maynard's new critical large-value bounds already yielded the
zero-density exponent `30/13` and primes in intervals of length
`x^(17/30+o(1))`. Their analysis identifies a cubic trace/incidence term `S3`
and rationally concentrated high-energy configurations as the remaining
critical obstruction.

The proposed structured class is supplied by balanced Vaughan/Heath--Brown
decompositions:

\[
b_n=\sum_{mk=n}\alpha_m\beta_k,
\qquad M,K=N^{1/2+o(1)}.
\]

Let `C_HB` be the precise prime-detecting coefficient class and define

\[
\mathfrak I^{HB}_{N,T,V}=
\sup_{b\in C_{HB}}\mathfrak I_{N,T,V}(b).
\]

The make-or-break question is whether balanced prime-detecting coefficients
have a fixed-power deficit in the critical `S3` branch compared with generic
bounded coefficients. Schematically, at `V=N^(3/4)`, seek some `delta>0` in
the zero-density-limiting parameter window:

\[
\mathfrak I^{HB}_{N,T,N^{3/4}}
\ll N^{3/5-\delta}+T N^{-3/5-\delta}.
\]

This exponent display is a research target to be re-derived in Guth--Maynard's
exact notation before use, not a theorem claim.

### Pass gate

Prove a fixed-power `S3` deficit for balanced prime-detecting coefficients in
a parameter regime that limits the zero-density argument, and prove that the
zero detector retains this structured coefficient class.

### Kill gate

Stop if either:

- balanced Heath--Brown coefficients realize the same rationally concentrated
  `S3` configurations as arbitrary coefficients; or
- factorization and dispersion reproduce only the generic Guth--Maynard
  bound or merely logarithmic savings.

Unbalanced Type I savings are calibration only. A logarithmic saving does not
improve the zero-density exponent.

## 4. Strategic decision

Parallel agents were useful for falsification and triangulation, but no exact
invariant leading to RH was found. The search space has nevertheless narrowed:

- stop quadratic covariance/kernel invention;
- do not promote sieve-flow transport beyond a capped Buchstab calibration;
- run one tightly gated analytic sprint on balanced structured large-value
  incidence;
- keep all claims below RH: even the density hypothesis permits off-line
  zeros, so a separate zero-exclusion/amplification principle would still be
  required.

## Primary sources

- Guth--Maynard, [New large value estimates for Dirichlet polynomials](https://arxiv.org/abs/2405.20552).
- Matomaki--Radziwill--Shao--Tao--Teravainen, [Higher uniformity in short intervals II](https://arxiv.org/abs/2411.05770).
- Gorodetsky, [Variance of integers without small prime factors](https://arxiv.org/abs/2111.00853).
- Rodgers, [Arithmetic functions in short intervals and the symmetric group](https://arxiv.org/abs/1609.02967).
- Gafni--Tao, [Zero density and primes in short intervals](https://arxiv.org/abs/2505.24017).
