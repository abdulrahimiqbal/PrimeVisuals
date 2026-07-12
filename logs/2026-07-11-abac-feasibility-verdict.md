# ABAC analytic feasibility audit

Date: 2026-07-11  
Verdict: `PARKED / NO-GO AS PRIMARY BREAKTHROUGH BET`

This audit tests whether the adjacent-block anticorrelation conjecture (ABAC)
has an unconditional analytic foothold that is materially easier than refined
short-interval variance or pair correlation.

## 1. Exact make-or-break target

Let

\[
E_X(h)=\sum_{n\asymp X}(\Lambda(n)-1)(\Lambda(n+h)-1)
-X(\mathfrak S(h)-1),
\]

with a smooth dyadic weight in `n` if desired, and let

\[
\tau_H(h)=
\begin{cases}
h/H,&1\le h\le H,\\
(2H-h)/H,&H<h<2H.
\end{cases}
\]

After the harmless aligned-interval bookkeeping in the main ABAC note, the
required remainder is

\[
\boxed{
T(X,H):=\sum_{h<2H}\tau_H(h)E_X(h)=o(X).
}
\]

Equivalently, with the unnormalized tent
`w_H(h)=H tau_H(h)`, one needs

\[
\sum_{h<2H}w_H(h)E_X(h)=o(XH).
\]

A quantitative pass would be `T(X,H) << X/log^A X` for some fixed `A>0`
and actual von Mangoldt weights in any fixed polynomial `H`-range.

## 2. Comparison with the strongest relevant averaged Hardy--Littlewood input

Matomaki--Radziwill--Shao--Tao--Teravainen (2024, revised 2026) prove the
Hardy--Littlewood conjecture for a proportion `1-o(1)` of shifts `h<=H` when
`X^(1/3+epsilon)<=H<=X^(1-epsilon)`. In the proof, the correlation errors are
controlled at the scale

\[
\sum_{h\le H}|E_X(h)|=o(HX).
\]

This is a major theorem, but inserting the bounded coefficients `tau_H(h)`
only gives

\[
|T(X,H)|\leq o(HX),
\]

where ABAC needs `o(X)`. The gap is a full factor of `H`.

Earlier long-shift averages, such as Merikoski's theorem for
`H>X^(7/12)`, determine the leading prime-pair density but are still further
from this secondary term. They do not isolate the cancellation between the
average `1` and the singular series that produces `log 2`.

## 3. Gowers/uniformity normalization test

The ABAC numerator is a three-variable form of volume `X H^2`:

\[
\sum_{x\asymp X}\sum_{j\le H}\sum_{H<k\le2H}
a(x+j)a(x+k).
\]

After removing the local model, a generalized von Neumann argument with
uniformity parameter `delta` naturally gives an error of size

\[
O(\delta XH^2).
\]

To reach the ABAC target `o(XH)`, one would need

\[
\delta=o(1/H).
\]

For the von Mangoldt function, the 2024 higher-uniformity theorem gives in
the quantitative `U^2` case a saving of the form `w^(-c)`, with the sieve
parameter `w` allowed to be polylogarithmic in `X`. Thus the accessible
uniformity is at best an arbitrary logarithmic saving, whereas polynomial
`H=X^theta` requires a polynomial saving comparable to `X^(-theta)`.

This again misses by essentially a factor `H`.

## 4. Type I/II test

Writing `Lambda=Lambda_sharp+r` separates:

1. local/sieve terms, which reproduce the singular-series tent and hence the
   `log 2` main term;
2. cross terms involving `r`;
3. the `r-r` adjacent-block term.

Type I/local terms are not the obstruction. The cited higher-uniformity work
already contains the necessary local-factor computations and handles Type I
terms with logarithmic savings.

The Type II estimates for `Lambda` also give arbitrary logarithmic savings,
which are sufficient for leading-order Hardy--Littlewood statements. They are
not sufficient for the `1/H`-relative precision of ABAC. To pass, a Type II
argument must retain the signed adjacent-block kernel and prove directly

\[
\sum_{h<2H}\tau_H(h)E_X^{II}(h)\ll X\log^{-A}X.
\]

Standard moves fail as follows:

- taking absolute values reduces to an ordinary positive Selberg-integral
  bound and loses the zero-mean cancellation;
- applying a phase estimate separately to the `O(H)` Fourier modes loses a
  factor `H`;
- Cauchy--Schwarz turns the adjacent covariance back into a positive
  short-interval variance, the original hard problem;
- standard generalized von Neumann bounds control the `XH^2` leading scale,
  not the `XH` secondary scale.

No available Type II theorem located in this audit supplies the missing
factor. Producing it would already constitute the sought breakthrough rather
than a plausible route to one from established tools.

## 5. Numerical feasibility

The estimated standard error behaves roughly like

\[
\log(X/H)\sqrt{H/X}.
\]

To reach standard error about `0.02`, the approximate required sizes are:

| scale | required X |
|---|---:|
| `H=X^(1/4)` | `3e7` |
| `H=X^(1/3)` | `3e8` |
| `H=X^0.4` | `2e9` |
| `H=X^(1/2)` | `2e11` |
| `H=X^0.6` | `1e14` |

The existing 20-cell audit has 19 cells within two heuristic batch standard
errors of the finite Hardy--Littlewood prediction. It does not falsify ABAC,
but scaling computation cannot decide the interesting ranges economically.

## 6. Decision

ABAC remains a coherent refined conjecture and a useful diagnostic kernel, but
the feasibility test found no analytic leverage over the classical problem.
Its exact target is a secondary-term cancellation one factor `H` beyond the
strongest relevant almost-all-shift Hardy--Littlewood machinery. The signed
kernel identifies where a breakthrough would occur, but standard Type II,
Gowers-uniformity, large-sieve, and Cauchy--Schwarz routes do not produce it.

Therefore:

- stop larger ABAC numerical sweeps;
- do not treat ABAC as the primary route to RH;
- retain the identity and instrument as a benchmark for any future method
  claiming fluctuation-scale prime-pair cancellation;
- reopen only if a method proves `T(X,H)=o(X)` for actual `Lambda`, or obtains
  uniformity of size `o(1/H)` without assuming RH/PCC/Hardy--Littlewood.

This is a no-go verdict on the current mechanism, not a disproof of ABAC.

## Primary sources

- Matomaki, Radziwill, Shao, Tao, Teravainen,
  [Higher uniformity of arithmetic functions in short intervals II](https://arxiv.org/abs/2411.05770).
- Merikoski,
  [Averaged Form of the Hardy--Littlewood Conjecture](https://arxiv.org/abs/1605.04757).
- Bui, Keating, Smith,
  [Variance in short intervals and pair correlation for L-functions](https://arxiv.org/abs/1506.03741).
- Gorodetsky,
  [The variance of integers without small prime factors in short intervals](https://arxiv.org/abs/2111.00853).
