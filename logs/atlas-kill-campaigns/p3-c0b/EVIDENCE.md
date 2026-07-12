# P3-C0b evidence: exact coordinate reduction and semantic kill

Date: 2026-07-12

Status: **EXACT SAME-COORDINATE RESOLVENT REDUCTION / FALSE `M_0`
DICTIONARY KILLED / NO EVALUATED `T_N` OR `E_N`**.

The campaign did not test a sign.  It first reconstructed the source
coordinates, derived the transported trace entry in those coordinates, and
checked the archimedean restriction.

## 1. Primary-source ledger

| source | what it supplies | what it does not supply |
| --- | --- | --- |
| Connes--Consani--Moscovici, [*Zeta spectral triples*](https://arxiv.org/abs/2511.22755), Sections 2--4 | the basis `U_n`, its transported multiplicative basis `V_n`, the autocorrelation `q(U_n,U_m)`, and the pole/archimedean/prime entries of `Q_S` | a Sonin trace matrix in that basis |
| Connes--Consani, [*Weil positivity and trace formula, the archimedean place*](https://arxiv.org/abs/2006.13771), Theorem 4.7 and Theorem 6.11 | the archimedean identity `Trace_Sonin=W_infinity+Epsilon`, the explicit prolate series for `epsilon`, and the extra zero-frequency correction | a finite-prime comparison |
| Connes--Consani--Moscovici, [*Zeta zeros and prolate wave operators*](https://arxiv.org/abs/2310.18423), Proposition 4.6, Theorem 4.6, and Proposition 4.8 | the exact multiplier `d_p`, the equality of the semilocal Sonin space with the transported classical one, and its weighted de Branges realization | the comparison of the resulting positive trace with the Weil functional; the introduction presents that comparison as a strategy, not a theorem |
| Connes--Consani, [*Quasi-inner functions and local factors*](https://arxiv.org/abs/2008.10974) | the semilocal Sonin spaces as kernels and their inductive structure | a Weil-minus-Sonin kernel or sign |
| Groskin, [*A finite Guinand--Weil dictionary and archimedean tail order*](https://arxiv.org/abs/2607.02828), Section 2 | the exact finite dictionary and the meaning of the row `M_0` | an identification of `M_0` with a Mellin-zero constraint |

Thus no cited source already contains P3-C0b.  The two sides can be put in one
basis, but the finite-prime reproducing-kernel inverse remains new work.

## 2. The common basis fixes the Mellin multiplier

Put

`L=log(3)`, `lambda=sqrt(3)`, and `rho=2*pi/L`.

The CCM basis is

`U_n(x)=L^(-1/2) exp(2*pi*i*n*x/L)`, `0<=x<=L`,

`V_n(u)=U_n(log(lambda*u))`, `lambda^(-1)<=u<=lambda`.

Using exactly the multiplicative Fourier convention

`F_mu(f)(s)=integral_0^infinity f(u)u^(-is)d*u`,

the scaling multiplier of `V_n` is

`h_n(s)=integral V_n(u)u^(-is)d*u`

`      =2 sin(L*s/2)/(sqrt(L)(s-rho*n))`,                 (1)

with the removable value

`h_n(rho*n)=(-1)^n sqrt(L)`.

This derivation fixes the phase that would be lost by using an uncentered
Fourier interval.  The audit script compared (1) with direct Simpson
integration for 42 `(n,s)` cells; the maximum absolute error was
`3.91e-13`.

For an even coefficient vector `v=(v_0,...,v_N)`, put

`u_0=v_0`, `u_k=u_(-k)=v_k/sqrt(2)`,

`f_v=sum_(|k|<=N) u_k V_k`.

Then (1) gives the exact identity

`hat(f_v)(0)=sqrt(L) v_0`.                                (2)

## 3. The same-coordinate one-prime trace identity

Let `M=ran(P)` be the classical Sonin space in the unitary coordinate used
by the transport theorem.  For `S={infinity,2}`, put

`d(s)=1-2^(-1/2-is)` and `D=M_d`.

Then

`|d(s)|^2=3/2-sqrt(2) cos(s log 2)`,                       (3)

and on `M`

`G=P D^*D P=(3/2)I_M-sqrt(2) C`,

`C=P M_(cos(s log 2)) P |_M`, `||C||<=1`.                 (4)

The bounds `(1-1/sqrt(2))^2 I <= G <=
(1+1/sqrt(2))^2 I` make `G` invertible.

Let `k_t` be the evaluation vector at `t` for the classical Sonin
reproducing-kernel space in this coordinate and define

`R_2(s,t)=<G^(-1) k_t,k_s>_M`.                             (5)

The transported orthogonal projection has kernel

`K_2(s,t)=d(s) R_2(s,t) conjugate(d(t))`.                  (6)

Therefore the required entries in the *same* CCM basis are

`T_2(V_n,V_m)`

` = integral_R h_n(s) conjugate(h_m(s)) K_2(s,s) ds`,      (7)

where `ds` is the Lebesgue measure of the source's unitary multiplicative
Fourier coordinate.  Formula (7) follows from the trace of the locally
trace-class kernel

`M_(h_n) P_S M_(h_m)^*`,

with `P_S=D P G^(-1)P D^*`.  It contains no zeta zeros and makes every basis
and normalization choice explicit.

This gives an exact matrix-level definition

`E_2(V_n,V_m)=Q_2(V_n,V_m)-T_2(V_n,V_m)`,                 (8)

where `Q_2(V_n,V_m)` is independently the CCM closed-form matrix.

### What is still implicit in (7)

Equation (7) is a genuine same-coordinate identity, but it is not yet an
independently evaluated matrix.  It contains the infinite compressed inverse
`G^(-1)`.  The inverse has the convergent expansion

`G^(-1)=(2/3) sum_(j>=0) (2sqrt(2)/3)^j C^j`,             (9)

because `2sqrt(2)/3=0.942809...<1`.  The operator-norm remainder after
degree `J` is at most

`(2/3)(2sqrt(2)/3)^(J+1)/(1-2sqrt(2)/3)`.

This is about `3.04e-2` at `J=100` and `4.44e-6` at `J=250`.  Consequently a
useful evaluation is possible in principle from the classical Sonin kernel,
but it is not a small truncation and none of the existing `Q_N` certificates
evaluates (5).  Relabeling them would repeat the original semantic error.

The remaining computational lemma is now precise:

> Evaluate the diagonal resolvent density
> `R_2(s,s)=<G^(-1)k_s,k_s>` with a certified tail, then integrate it against
> every sinc product `h_n h_m` in (7).

No independent mathematical consequence of that lemma was obtained in this
campaign, so it does not satisfy the survivor rule by itself.

## 4. Archimedean restriction

Deleting the prime factor means `d=1`.  Then `G=I_M`, `R_2` becomes the
classical Sonin kernel, and (6)--(7) reduce to the classical compressed trace.

Connes--Consani Theorem 4.7 states, for a compactly supported test function
`F`,

`Tr(vartheta(F)P)=W_infinity(F)+Epsilon(F)`,               (10)

where

`Epsilon(F)=integral F(rho^(-1)) epsilon(rho)d*rho`

and `epsilon` is their prolate-series correction (equations (83)--(84)).  In
the CCM basis, symmetry and the substitution `y=log(rho)` give

`Epsilon_nm=integral_0^L q(U_n,U_m)(y) epsilon(exp(y))dy`. (11)

Since `W_infinity=-W_R`, equations (10)--(11) yield

`T_infinity,nm=-W_R,nm+Epsilon_nm`,

`Q_infinity,nm=W_0,2,nm-W_R,nm`,

and hence

`E_infinity,nm=W_0,2,nm-Epsilon_nm`.                      (12)

On the pole-neutral core, (12) is exactly the published Weil--Sonin
remainder `-Epsilon`.  Thus the prime-deletion restriction of (7)--(8) has
the correct pole and moment correction; it is not the pole-free Weil form.

The identity (10) is valid beyond the support interval used for the final
archimedean positivity theorem.  Theorem 6.11's quantitative sign estimate is
for support `[2^(-1/2),2^(1/2)]`, so it must not be silently promoted to the
present `c=3` support.

## 5. Decisive constraint correction: `M_0` is not Mellin zero

The Groskin row is

`M_0(v)=v_0+sqrt(2) sum_(k=1)^N v_k`.

Direct evaluation of the CCM basis at the left endpoint gives

`M_0(v)=sqrt(L) f_v(lambda^(-1))`.                         (13)

In contrast, (2) proves that the Mellin-zero condition is

`v_0=0`.                                                   (14)

The rows are not equivalent:

- `v=(0,1)` satisfies (14) but has `M_0=sqrt(2)`;
- `v=(-sqrt(2),1)` satisfies `M_0=0` but has
  `hat(f_v)(0)=-sqrt(2L)`.

This is a semantic kill of `C0-K6`, not merely a missing proof.  The reported
finite margin obtained by imposing both pole-neutrality and Groskin `M_0`
does not test the archimedean Mellin-zero core.  Future matrices must impose
`v_0=0` if that is the required condition.

## 6. Prime support audit

For `f,g` supported in `[3^(-1/2),3^(1/2)]`, their multiplicative
autocorrelation is supported in `[1/3,3]`.  The explicit formula can therefore
see prime powers `2` and the endpoint `3`.  However, from the CCM formulas,

`q(U_n,U_m)(L)=0` for every `m,n`,                       (15)

including the diagonal.  Hence the endpoint `3` contributes zero and the
only finite-place term is prime `2`.  The audit checked (15) through band
`8`; the largest floating residual was `7.80e-17`.  The conclusion itself is
the exact trigonometric identity (15), not the numerical check.

## 7. Gate table

| gate | result |
| --- | --- |
| exact `V_n -> h_n` transport | PASS |
| same-coordinate resolvent identity (7) | PASS as an exact reduction |
| archimedean restriction including `Epsilon` | PASS algebraically |
| prime-2/no-larger-prime support | PASS |
| constraint transport | PASS; false `M_0` identification killed |
| independent evaluated finite `T_N` | FAIL / not constructed |
| independent evaluated finite `E_N` | FAIL / not constructed |
| permission to test `E_N>=0` | NO |

Machine-readable evidence and the reproducible coordinate checks are in
`evidence.json` and `run-coordinate-audit.mjs` in this directory.
