# Signed Type-II packet — first survival-round evidence

Date: 2026-07-12
Protocol: `PREREGISTRATION.md`
Artifacts: `results.json`, `packet-ladder.csv`
Code: `src/core/signedTypeIIPacket.js`, `scripts/signed-type-ii-packet-audit.mjs`
Tests: `tests/signed-type-ii-packet.test.js`

## 1. Exact local-mode algebra

Let

\[
P=\prod_{p\le z}p,\qquad
a_z^\sharp(n)=\frac P{\varphi(P)}1_{(n,P)=1}-1.
\]

With additive Fourier normalization on `Z/PZ`, the coefficient at `r` is

\[
\widehat a_z^\sharp(r)
=\frac{c_P(r)}{\varphi(P)}-1_{r=0},
\]

where `c_P(r)` is the Ramanujan sum.  Since `c_P(0)=phi(P)`, the periodic
model has exact zero coefficient

\[
\widehat a_z^\sharp(0)=0.
\]

For the triangular packet,

\[
D_H(\alpha)=\sum_{1\le h<2H}\tau_H(h)e(h\alpha)
=\frac{e(H\alpha)}H
 \left|\sum_{j=0}^{H-1}e(j\alpha)\right|^2,
\qquad D_H(0)=H.
\]

Therefore the complete periodic local contribution is exactly

\[
\sum_{r\ne0}|\widehat a_z^\sharp(r)|^2D_H(-r/P).
\]

Equivalently, at every shift it is

\[
\frac1P\sum_{n\bmod P}a_z^\sharp(n)a_z^\sharp(n+h)
=\prod_{p\le z}
\frac{1-\nu_p(h)/p}{(1-1/p)^2}-1,
\]

where `nu_p(h)=1` if `p|h` and `2` otherwise.

The implementation independently evaluated the direct periodic correlation,
the additive Fourier sum, and the Euler product:

| z | P | zero coefficient squared | packet identity error | maximum Euler-product error |
|---:|---:|---:|---:|---:|
| 5 | 30 | `1.93e-34` | `2.58e-14` | `2.22e-15` |
| 7 | 210 | `2.12e-32` | `5.69e-15` | `2.22e-15` |

This proves the useful half of gate 1: every mode of the **periodic model** is
known and its zero mode vanishes.

It does **not** prove the claimed cancellation for the target difference.  If
`a=Lambda-1`, then subtracting the local correlation leaves the actual finite
zero mode of `a`; algebraically it is not cancelled by a comparator whose zero
mode is zero.  In a circular model its contribution is

\[
H\left(|\widehat a(0)|^2-|\widehat a_z^\sharp(0)|^2\right)
=H|\widehat a(0)|^2,
\]

and the smooth, non-circular formulation has the corresponding weighted mean
term.  Controlling it uses a prime-number-theorem estimate; it is not
algebraic cancellation.

The audit split every finite shift correlation exactly into empirical-mean
and empirically centered parts.  The identity error was below floating
roundoff.  On the real prime ladder the remaining mean mode was small, but it
was nonzero.  On the preregistered literal divisor toy `d_2(n)-log n`, whose
dyadic mean is `2 gamma`, it was mechanism-sized:

| X | H near `X^(1/3)` | signed packet / X | zero-mode part / X | zero / signed |
|---:|---:|---:|---:|---:|
| 4,096 | 16 | 17.2534 | 21.3572 | 1.238 |
| 8,192 | 20 | 21.7232 | 26.6612 | 1.227 |
| 16,384 | 25 | 26.7321 | 33.3262 | 1.247 |
| 32,768 | 32 | 35.8112 | 42.6620 | 1.191 |

At the final endpoint the zero term is `1.33319 XH`, agreeing with
`(2 gamma)^2 XH`.  Thus the divisor control fails unless its true local
approximant or at least its constant mode is subtracted.

This is also a literature-calibration issue.  Matomaki--Radziwill--Shao--Tao--
Teravainen define `Lambda#` as the small-prime periodic model, but their
`d_k#` is a divisor-polynomial approximant, not `d_2-log`.  Their theorem gives
short-interval discorrelation from those suitable approximants; it does not
supply the secondary-scale packet estimate tested here.  See equations
(1.1)--(1.3) and Theorem 1.1 of
[Higher uniformity of arithmetic functions in short intervals II](https://arxiv.org/abs/2411.05770).

## 2. Frozen four-endpoint packet ladder

For each `X=2^12,2^13,2^14,2^15`, the code used the complete integer interval
`X<=n<2X` and every `1<=h<2H`.  It compared

\[
\left|\sum_h\tau_H(h)E(h)\right|
\quad\hbox{against}\quad
\sum_h\tau_H(h)|E(h)|.
\]

The fitted quantity was packet size divided by `X`, regressed against `H`
along each frozen scale path.  A positive exponent gain means the signed sum
grew more slowly than the shiftwise absolute sum.

| family | H path | signed exponent | absolute exponent | gain |
|---|---|---:|---:|---:|
| `d_2-log` | `X^(1/3)` | 1.043 | 1.661 | +0.618 |
| `d_2-log` | `X^(5/12)` | 1.026 | 1.513 | +0.487 |
| `d_2-log` | `sqrt(X)/2` | 1.032 | 1.426 | +0.394 |
| `Lambda-1` | `X^(1/3)` | 0.160 | 1.038 | +0.878 |
| `Lambda-1` | `X^(5/12)` | 0.336 | 1.017 | +0.681 |
| `Lambda-1` | `sqrt(X)/2` | 0.196 | 1.016 | +0.821 |
| `a_11#` | `X^(1/3)` | -1.024 | 1.038 | +2.061 |
| `a_11#` | `X^(5/12)` | -0.504 | 1.008 | +1.513 |
| `a_11#` | `sqrt(X)/2` | -0.797 | 1.008 | +1.805 |
| `aa-a_11#a_11#` | `X^(1/3)` | 1.923 | 0.865 | **-1.058** |
| `aa-a_11#a_11#` | `X^(5/12)` | 0.970 | 0.470 | **-0.500** |
| `aa-a_11#a_11#` | `sqrt(X)/2` | 0.799 | 0.543 | **-0.256** |

The raw arithmetic sequences exhibit cancellation, but the theorem-relevant
prime-minus-local correlation exhibits **no fitted H-exponent gain on any of
the three paths**.  Its cancellation ratios are also irregular.  At
`H~X^(1/3)`, for example, they are `0.182, 0.608, 0.505, 0.444`, rather than a
stable decreasing profile.

The result is not an artifact of choosing `z=11`.  The finite sensitivity
ladder used `z=5,11,23,47`.  Across its 12 `(z,H-path)` fits, the residual
exponent gain was positive in only the two `z=5` longer-H fits; all nine fits
with `z>=11` were negative, ranging from `-0.256` to `-3.450`.  Several
residual sequences changed sign, making their large fitted exponents unstable.
This fails the preregistered requirement of a stable exponent advantage.

Finite data cannot determine the theorem's asymptotic choice
`z=(log X)^B`; this sensitivity is itself evidence that `B` and the exact
approximant must be frozen before another mechanism test.

## 3. Balanced finite Type-II / resonator audit

The finite operator used the exact balanced Vaughan box

\[
\alpha_m=\mu(m),\qquad \beta_n=\log n,
\]

on `[M,2M) x [N,2N)`.  It formed the full shifted-product packet, projected
the `m`-coefficient space off constants and residue indicators modulo `2,3,5`,
and computed the top absolute eigenmode.  This is an obstruction audit, not a
Kuznetsov model or a proof-scale Type-II estimate.

| M=N | H | Vaughan / top norm | `mu log m` / top | q=7 resonator / top | random median | random max |
|---:|---:|---:|---:|---:|---:|---:|
| 16 | 6 | 0.135 | 0.126 | 0.208 | 0.208 | 0.391 |
| 20 | 7 | 0.179 | 0.173 | 0.155 | 0.196 | 0.299 |
| 24 | 8 | 0.185 | 0.181 | 0.184 | 0.159 | 0.250 |

Neither the Vaughan family nor the rational phases saturate the projected
generic norm.  Thus gate 4 does **not** kill coefficient sensitivity.  It is
the one clean survival signal, but it does not compensate for gates 1 and 3.

## 4. Reproducibility and limitations

- The packet and Type-II tests are deterministic.
- Five focused tests verify the tent mass, exact periodic zero mode, direct / Fourier / Euler local identities, large-cutoff local-table evaluation, exact finite mean decomposition, and reproducibility of the projected operator.
- The finite ladder uses a sharp dyadic interval rather than a smooth `W`; this is the preregistered "complete packet" laboratory, not the final theorem.
- No finite computation tests Kuznetsov, delta-method, or spectral-large-sieve estimates directly.
- The classical refined-variance neighborhood remains the one described by
  [Montgomery--Soundararajan](https://arxiv.org/abs/math/0409258); this audit
  neither disproves ABAC nor proves a new correlation estimate.
