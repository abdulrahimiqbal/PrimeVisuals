# Structured Dirichlet-incidence kill test

Date: 2026-07-12  
Verdict: `KILLED AS PRIMARY INVARIANT / RETAINED AS ESTABLISHED FRONTIER`

This audit corrects and tests the sole survivor of the parallel invariant
tournament: a proposed fixed-power large-value saving for structured
prime-detecting Dirichlet-polynomial coefficients.

## 1. The provisional target was incorrectly normalized

The headline Guth--Maynard large-value regime is `V=N^(3/4)`, but the
configuration limiting their uniform zero-density constant `30/13` is
different. In the notation of their zero-detection proof, the critical
parameters are

\[
\sigma=\frac7{10},\qquad N=T^{5/13},\qquad k=2.
\]

The large-value theorem is applied to the square of a base detector. Put

\[
P=N^2=T^{10/13}.
\]

The actual threshold is

\[
V=P^{7/10},
\]

not `P^(3/4)`. The full height interval is subdivided into intervals of
length

\[
T_1=T^{12/13}=P^{6/5},
\]

and the limiting large-value set has

\[
|W|\asymp T_1^{2/3}=T^{8/13}.
\]

There are `T/T_1=T^(1/13)` subintervals, producing the global exponent
`T^(9/13)`. Since `(9/13)/(1-7/10)=30/13`, this is exactly the advertised
zero-density constant.

## 2. The transferred coefficient class is not prime-supported

The detector in the Guth--Maynard proof is

\[
b_n=\left(\sum_{\substack{d\mid n\\d\le2T^{1/100}}}\mu(d)\right)
e^{-n/T^{1/2}},
\qquad
D(s)=\sum_{n\sim N}b_n n^{-s}.
\]

After shifting real parts, the critical polynomial is `tilde D^2`. Its
coefficients have the balanced convolution form

\[
c_m=\sum_{n_1n_2=m}\alpha_{n_1}\alpha_{n_2},
\qquad n_1,n_2\asymp T^{5/13},
\]

with `alpha` a divisor-bounded truncated-Mobius weight. This is not a
prime-supported Heath--Brown coefficient class. The six-near-equal-primes
decomposition discussed in Guth--Maynard's short-interval remarks is a
different direct prime-counting application and is not the zero detector.

Therefore the tournament's proposed prime-supported structured incidence
functional does not transfer to the `30/13` proof.

## 3. The proposed structured `S3` saving was ill-posed

Guth--Maynard encode a large-value set `W` in a universal matrix `M_W` and
use

\[
\sum_{t\in W}|D_c(t)|^2
=\langle c,M_W^*M_Wc\rangle
\le s_1(M_W)^2\|c\|_2^2.
\]

At this operator-norm step, all information about `c` except its norm is
discarded. They then bound `s_1(M_W)` using the cubic trace

\[
\operatorname{tr}((M_WM_W^*)^3),
\]

whose decomposition `S1+S2+S3` depends only on `W` and the universal smooth
kernel. In particular, the difficult `S3` term does not depend on the
Dirichlet coefficients.

It is therefore meaningless to ask for a better bound on the existing
`S3(c,W)` for structured coefficients: there is no such coefficient-bearing
quantity in the argument. Exploiting the truncated-Mobius structure would
require replacing the operator-norm reduction with a new directional theorem,
for example a fixed-power bound on the projection of `c` into the top singular
subspace of `M_W` for the rationally concentrated critical sets `W`.

No unconditional estimate of this kind was located. It is essentially a new
zero-density theorem in spectral language.

## 4. Both critical large-value terms must improve

The general Guth--Maynard estimate is

\[
R\ll T^{o(1)}\left(P^2V^{-2}+P^{18/5}V^{-4}
+T_1P^{12/5}V^{-4}\right).
\]

At `P=T^(10/13)`, `T_1=P^(6/5)`, and `V=P^(7/10)`, the three terms are

\[
P^{3/5},\qquad P^{4/5},\qquad P^{4/5}.
\]

Since `P^(4/5)=T_1^(2/3)`, both the second and third terms saturate the
critical local exponent. Improving only one does not move the bottleneck.

Moreover a saving only at `sigma=7/10` does not improve the global constant:
Ingham's zero-density exponent approaches `30/13` from the left. A structured
improvement must hold in a fixed neighborhood extending below `7/10` so that
the crossing point itself moves.

## 5. No meaningful finite experiment

The detector cutoff `T^(1/100)` grows too slowly for feasible numerical `T`
to represent the asymptotic coefficient class. The critical matrix has length
`P=T^(10/13)` and a large-value set of size `T^(8/13)`, while the conjectural
worst set is characterized through rational concentration of the universal
`R(v)` transform rather than an explicit finite list of ordinates. A small
matrix experiment would test an arbitrary surrogate, not the theorem's
limiting configuration.

## 6. Verdict

The prime-supported balanced-Heath--Brown candidate is killed because it is
the wrong coefficient class and the wrong threshold for zero-density
transfer. The corrected truncated-Mobius detector class is not promoted:
its first required lemma is a fixed-power, coefficient-sensitive directional
spectral estimate in a regime where the coefficient-free Guth--Maynard bounds
are essentially saturated. There is no unconditional foothold between known
results and that lemma.

This route remains an important established frontier. A proof of the required
directional deficit would be a field-level zero-density breakthrough, but the
candidate does not currently tell us how to obtain it and does not lead to RH
without a separate zero-exclusion principle.

Reopen only upon an independent theorem showing a power-saving top-singular-
subspace deficit for truncated-Mobius detector coefficients, uniformly for a
fixed `sigma` interval crossing below `7/10`.

## Primary sources

- Guth--Maynard, [New large value estimates for Dirichlet polynomials](https://arxiv.org/abs/2405.20552), especially the large-values theorem, the spectral reduction, Section 13.1, and the critical-case remark.
- Maynard--Pratt, [Half-isolated zeros and zero-density estimates](https://arxiv.org/abs/2206.11729), for the Type-II zero input used by the detector.
- Matomaki--Teravainen, [Zero density results implying large value estimates](https://arxiv.org/abs/2403.13157), for evidence that the two problem classes are closely coupled in both directions.
