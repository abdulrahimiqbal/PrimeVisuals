# P3-C0b verdict

Date: 2026-07-12

Verdict: **SURVIVES ONLY AS AN EXACT SAME-COORDINATE RESOLVENT REDUCTION /
P3-C0b NOT CLOSED / FIELD-LEVEL ROUTE KILLED AT THE CURRENT EVIDENCE LEVEL**.

## What survived

The one-prime Sonin trace and the localized Weil form can be placed in the
same Connes--Consani--Moscovici basis without using zeros or RH.

For

`V_n(u)=L^(-1/2) exp(2*pi*i*n*log(sqrt(3)u)/L)`, `L=log(3)`,

the exact scaling multiplier is

`h_n(s)=2 sin(L*s/2)/(sqrt(L)(s-2*pi*n/L))`.

If `P` is the classical Sonin projection,

`d(s)=1-2^(-1/2-is)`,

`G=P M_(|d|^2) P |_ran(P)`,

then the transported kernel and matrix are

`K_2(s,t)=d(s)<G^(-1)k_t,k_s>conjugate(d(t))`,

`T_2,nm=integral h_n(s)conjugate(h_m(s))K_2(s,s)ds`.

Thus `E_2,nm=Q_2,nm-T_2,nm` is an exact common-coordinate identity.  On
removing the finite prime, it reduces to the published archimedean formula

`T_infinity=-W_R+Epsilon`,

so that `Q_infinity-T_infinity=W_0,2-Epsilon`; on the pole-neutral core this
is the genuine Connes--Consani remainder, not the pole-free Weil form.

This is real mathematical progress over the prior operator ledger: it names
the exact diagonal resolvent density that must be computed and proves the
archimedean compatibility of the coordinate handoff.

## What was killed

The finite dictionary row

`M_0(v)=v_0+sqrt(2)sum_(k>=1)v_k`

is **not** the Mellin-zero row.  Exact transport gives

`hat(f_v)(0)=sqrt(log(3))v_0`,

whereas `M_0(v)=sqrt(log(3))f_v(3^(-1/2))` is an endpoint-evaluation row.
Explicit two-coordinate witnesses show that either row can vanish while the
other does not.  Therefore the previously reported finite margin with
Groskin `M_0` imposed cannot be used as evidence on the semilocal Mellin-zero
core.  This is a decisive `C0-K6` semantic kill.

The stronger P3-C0b promotion also fails.  No finite `T_N` entry was evaluated
independently from the Sonin kernel, and hence no finite `E_N` was assembled.
The existing positive `Q_N` certificates still represent `Q_N`, not
`Q_N-T_N`.  A sign test now would again test the wrong operator.

## Why this is not field-level

The unresolved object is

`R_2(s,s)=<G^(-1)k_s,k_s>`.

Although `G^(-1)` has the rigorous Neumann expansion

`(2/3)sum_(j>=0)(2sqrt(2)/3)^j C^j`,

its convergence ratio is about `0.943`; a degree-100 operator bound still
leaves error about `3.04e-2`.  Neither a certified evaluation of this density,
an infinite sign for `E_2`, nor a new trace/zero/prime consequence was
obtained.

Consequently:

- exact coordinate reduction: **yes**;
- P3-C0b comparison theorem with checked finite entries: **no**;
- permission to test positivity: **no**;
- field-level theorem or breakthrough lead: **no**.

## Reopen condition

Reopen only when one of the following supplies the same missing datum:

1. an explicit Hermite--Biehler generator or reproducing kernel for the
   one-prime weighted Sonin/de Branges norm;
2. a certified evaluation of the compressed-cosine resolvent density with a
   tail bound strong enough to integrate every `h_n h_m`;
3. an equivalent source theorem giving `T_2(V_n,V_m)` directly.

The first reopened run must independently assemble `Q_N`, `T_N`, and
`E_N=Q_N-T_N`, impose the true Mellin row `v_0=0` plus the pole row, and check
prime deletion against `W_0,2-Epsilon`.  Only after those checks may a sign
campaign start.

The derivation, source audit, numerical coordinate checks, and machine-readable
gate report are in `EVIDENCE.md`, `run-coordinate-audit.mjs`, and
`evidence.json` in this directory.
