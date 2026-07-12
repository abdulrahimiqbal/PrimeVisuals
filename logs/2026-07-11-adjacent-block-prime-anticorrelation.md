# Adjacent-block prime anticorrelation: theorem-first program

Date: 2026-07-11  
Status: `PARKED / EXACT-REDUCTION / NO-GO-AS-PRIMARY-BET`

Feasibility update: the follow-up analytic audit found that the exact weighted
remainder target is a full factor `H` beyond the strongest relevant
almost-all-shift Hardy--Littlewood and short-interval uniformity machinery.
See `logs/2026-07-11-abac-feasibility-verdict.md`. ABAC is retained as a
diagnostic conjecture, but larger numerical sweeps and primary-route investment
are stopped unless a new signed Type II estimate reaches `T(X,H)=o(X)`.

## 1. The object

Write

\[
A(x,H)=\psi(x+H)-\psi(x)-H.
\]

Define the adjacent-block anticorrelation statistic

\[
\mathcal A(X,H)
=-\frac1{XH}\int_X^{2X}A(x,H)A(x+H,H)\,dx.
\]

The integer-start laboratory version replaces the integral by
`sum_{X <= x < 2X}`. The implementation uses the integer-start version;
the conjecture below is stated with the conventional integral.

## 2. Candidate conjecture (ABAC)

For every fixed `epsilon > 0`,

\[
\boxed{
\sup_{X^\varepsilon\le H\le X^{1-\varepsilon}}
\left|\mathcal A(X,H)-\log 2\right|\longrightarrow 0.
}
\]

Interpretation: excess prime mass in one `H`-block is negatively correlated
with excess prime mass in the immediately following `H`-block. After the
natural normalization, the anticorrelation is the universal constant `log 2`.
The Cramer independent-increment model predicts zero instead.

This additive `o(1)` assertion is stronger than the usual leading-order
variance asymptotic. If

\[
V(X,H)\sim H\log(X/H),
\]

then `V(X,H)/H = log(X/H)(1+o(1))`; subtracting two such statements does not
control a constant-size difference. ABAC is naturally associated with a
refined variance formula having additive error `o(H)`, not merely relative
error `o(1)`.

## 3. Exact polarization identity

Set `B=A(x+H,H)`. Since `A(x,2H)=A+B`, pointwise,

\[
\frac{A^2+B^2}{2H}-\frac{(A+B)^2}{2H}=-\frac{AB}{H}.
\]

Therefore

\[
\mathcal A(X,H)
=\frac{J_1(X,H)+J_2(X,H)}{2H}-\frac{J(X,2H)}{2H},
\]

where

\[
J_1=\frac1X\int_X^{2X}A(x,H)^2dx,
\quad
J_2=\frac1X\int_X^{2X}A(x+H,H)^2dx,
\]

and `J(X,2H)` is the corresponding `2H` second moment. This is an exact
symmetrized adjacent-scale identity. It removes the diagonal pointwise because
the two factors concern disjoint intervals.

If a refined stationary variance formula

\[
J(X,H)=H\{\log(X/H)+B\}+o(H)
\]

holds uniformly and is stable under shifting the averaging interval by `H`,
then the constant `B` cancels and the identity predicts
`mathcal A(X,H)=log 2+o(1)`.

## 4. Exact prime-pair reduction

For the discrete identity let `a(n)=Lambda(n)-1`. Then

\[
\mathcal A_d(X,H)
=-\frac1{XH}\sum_{x=X}^{2X-1}
\left(\sum_{j=1}^{H}a(x+j)\right)
\left(\sum_{k=H+1}^{2H}a(x+k)\right).
\]

For `1 <= h < 2H`, define

\[
I_H(h)=\{j:1\le j\le H,\ H+1\le j+h\le2H\},
\]

so that

\[
|I_H(h)|=
\begin{cases}
h,&1\le h\le H,\\
2H-h,&H<h<2H.
\end{cases}
\]

Put

\[
\tau_H(h)=|I_H(h)|/H
\]

and define the aligned averaged correlation

\[
\overline C_{X,H}(h)
=\frac1{X|I_H(h)|}
\sum_{j\in I_H(h)}\sum_{x=X}^{2X-1}
a(x+j)a(x+j+h).
\]

Rearranging a finite sum gives the exact identity

\[
\boxed{
\mathcal A_d(X,H)
=-\sum_{1\le h<2H}\tau_H(h)\overline C_{X,H}(h).
}
\]

There is no `h=0` term. This is the precise sense in which the new object
removes the von-Mangoldt diagonal rather than estimating it.

Let `mathfrak S(h)` be the Hardy--Littlewood pair singular series and write

\[
R_{X,H}(h)=\overline C_{X,H}(h)-(\mathfrak S(h)-1).
\]

Then, again exactly,

\[
\mathcal A_d(X,H)
=\mathcal A_{HL}(H)-
\sum_{1\le h<2H}\tau_H(h)R_{X,H}(h),
\]

where

\[
\mathcal A_{HL}(H)
=-\sum_{1\le h<2H}\tau_H(h)(\mathfrak S(h)-1).
\]

Montgomery's singular-series calculation, in its constant-term form recorded
by Montgomery--Soundararajan, yields

\[
\mathcal A_{HL}(H)=\log2+o(1).
\]

Consequently the analytic core of ABAC is the single weighted remainder
estimate

\[
\boxed{
\sum_{1\le h<2H}\tau_H(h)R_{X,H}(h)=o(1)
}
\]

uniformly on polynomial short-interval scales. This is the proof obligation;
everything else above is finite algebra or known singular-series analysis.

## 5. Spectral form: the zero-mean band-pass invariant

For a translation-invariant covariance with spectral measure `dmu(alpha)`, put

\[
F_H(\alpha)=\sum_{j=1}^{H}e(j\alpha).
\]

The two blocks use the same filter, separated by `H`. Hence

\[
\mathcal A(H)
=\int_{0}^{1}K_H(\alpha)\,d\mu(\alpha),
\]

with

\[
\boxed{
K_H(\alpha)
=-\frac1H|F_H(\alpha)|^2\cos(2\pi H\alpha)
=-\frac1H
\left(\frac{\sin(\pi H\alpha)}{\sin(\pi\alpha)}\right)^2
\cos(2\pi H\alpha).
}
\]

This kernel changes sign and has exactly zero Lebesgue mean: `|F_H|^2` has
Fourier support only on lags `-(H-1),...,H-1`, so multiplication by
`e(H alpha)` has no constant Fourier coefficient. Thus a flat white-noise
spectrum contributes zero exactly. The arithmetic prediction `log 2` measures
a non-flat component of the prime spectrum selected by this scale-local
zero-mean kernel.

This is the strongest invariant interpretation presently available. Whether
this kernel is already standard under the language of polarized Selberg
integrals, and exactly which pair-correlation band it probes, remain literature
questions.

## 6. Why this is potentially useful

1. It is entirely on the prime side.
2. It deletes the large `Lambda(n)^2` diagonal exactly.
3. It converts the problem into a tent-weighted average of distinct-shift
   prime-pair errors.
4. Its constant distinguishes arithmetic primes (`log 2`) from independent
   increments (`0`).
5. It is an additive-precision statement, so a proof would contain more local
   scale information than the ordinary relative variance asymptotic.

The obstacle has not disappeared: the boxed remainder estimate asks for very
strong cancellation among Hardy--Littlewood pair errors. The gain is that the
obstacle is now isolated in a diagonal-free, one-dimensional weighted sum.

## 7. Initial finite audit

Code:

- `src/core/primeVariance.js`
- `tests/prime-variance.test.js`
- `scripts/dpvr-audit.mjs`
- `logs/dpvr-artifacts/dpvr-audit.json`

At `X=1,600,000`, representative integer-start values were:

| exponent theta | H | adjacent blocks | residual from log 2 | HL tent |
|---:|---:|---:|---:|---:|
| 0.250 | 36 | 0.713289 | 0.020142 | 0.699480 |
| 0.333 | 117 | 0.696587 | 0.003440 | 0.718779 |
| 0.400 | 303 | 0.662214 | -0.030933 | 0.700913 |
| 0.500 | 1265 | 0.522785 | -0.170363 | 0.695882 |
| 0.600 | 5278 | 0.996675 | 0.303528 | 0.692223 |

The arithmetic singular-series tent rapidly approaches `log 2`. Prime values
are consistent at smaller `H` but noisy at large `H`, where overlapping
windows leave far fewer effective samples. This is calibration only and does
not establish convergence. A defensible evidence pack needs independent
dyadic ranges, batch-mean uncertainty, and matched Cramer and residue-aware
controls.

## 8. Novelty status

The polarization identity is elementary and should not be advertised as new.
Searches for the exact adjacent-block `psi` product and for covariance of
adjacent prime-counting intervals did not locate this formulation as a named
conjecture, but that is not a sufficient novelty audit. The closest established
neighborhood is:

- Goldston--Montgomery short-interval variance and pair correlation;
- Montgomery--Soundararajan, *Beyond pair correlation* and *Primes in short
  intervals*;
- work on weighted sums of singular series.

Before any public novelty claim, check MathSciNet/zbMATH and ask an analytic
number theorist specifically about polarized Selberg integrals and covariance
of disjoint translated intervals.

## 9. Research gates

`Gate A (complete)`: exact finite polarization and tent-kernel identities.  
`Gate B (complete)`: Hardy--Littlewood main term numerically and
literature-calibrated as `log 2`.  
`Gate C (open)`: prove any nontrivial bound for the weighted remainder beyond
what follows mechanically from known second-moment results.  
`Gate D (partial)`: exact zero-mean signed spectral kernel derived; determine
its precise relation to strong pair correlation and prior polarized Selberg
integrals.  
`Gate E (open)`: complete professional novelty audit.

No RH consequence is claimed at this stage.

## Sources

- Montgomery and Soundararajan, [Primes in short intervals](https://arxiv.org/abs/math/0409258).
- Chan, [A note on Primes in Short Intervals](https://arxiv.org/abs/math/0503441).
- Kuperberg, Rodgers, and Roditty-Gershon, [Sums of singular series and primes in short intervals in algebraic number fields](https://arxiv.org/abs/2001.09513).
- Chan, [More precise pair correlation of zeros and primes in short intervals](https://arxiv.org/abs/math/0206292).
