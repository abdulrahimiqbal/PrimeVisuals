# P3-C0b kill campaign: one-prime Weil--Sonin comparison

Frozen: 2026-07-12, before any sign test on the proposed remainder.

## Exact target

Fix

`c=3`, `L=log(3)`, `lambda=sqrt(3)`, and `S={infinity,2}`.

Use the Connes--Consani--Moscovici (CCM) basis

`U_n(x)=L^(-1/2) exp(2*pi*i*n*x/L)`, `0<=x<=L`,

`V_n(u)=U_n(log(lambda*u))`, `lambda^(-1)<=u<=lambda`,

extended by zero.  Let `Q_S(V_n,V_m)` be the localized Weil matrix in
this basis, with the pole, archimedean, and prime-2 terms normalized exactly
as in CCM.

Let `P` be the orthogonal projection onto the image of the classical
`lambda=1` Sonin space in the unitary multiplicative Fourier coordinate of
Connes--Consani--Moscovici.  Put

`d_2(s)=1-2^(-1/2-is)`, `D=M_(d_2)`,

`G=P D^*D P |_ran(P)`,

and use the already proved transport formula

`P_S=D P G^(-1) P D^*`.

The target is to derive the matrix

`T_S(V_n,V_m)=Tr(M_(h_n) P_S M_(h_m)^*)`

in the same `V_n` coordinates as `Q_S`, where `h_n` must be derived from
`V_n` rather than chosen independently.  Then define, entry by entry,

`E_S(V_n,V_m)=Q_S(V_n,V_m)-T_S(V_n,V_m)`.

No assertion about the sign of `E_S` is permitted until this identity and
the archimedean restriction are verified.

## Mandatory checks

1. Derive the exact Mellin multiplier `h_n`, including all Fourier and
   measure normalizations.
2. Express `T_S(V_n,V_m)` as an actual common-coordinate kernel or frequency
   entry, not merely as the phrase "compressed Sonin trace".
3. On deletion of the prime-2 factor, recover Connes--Consani Theorem 4.7:
   the archimedean Sonin trace is `W_infinity + Epsilon`, including the
   prolate moment-correction functional `Epsilon`.
4. Show directly that support in `[3^(-1/2),3^(1/2)]` introduces prime `2`
   and no larger prime.
5. Transport the pole and Mellin-zero constraints.  In particular, the
   Groskin row `M_0` cannot be called a Mellin-zero row without an identity.
6. Independently assemble at least one finite `Q_N`, `T_N`, and
   `E_N=Q_N-T_N` entrywise before any finite sign experiment.

## Pass, park, and kill rules

- **Pass P3-C0b:** an exact same-basis formula whose kernel is evaluable from
  specified source data, plus archimedean calibration and an independent
  finite entry check.
- **Partial reduction only:** an exact formula that still contains the
  unevaluated inverse of an infinite compressed operator or an unspecified
  reproducing kernel.  This may identify the next lemma but does not pass
  P3-C0b.
- **Semantic kill:** a wrong carrier, non-isometric projection transport,
  missing prime-2 term, pole subtraction substituted for the Sonin trace,
  failure of the archimedean restriction, or a false constraint dictionary.
- **Field-level survivor:** P3-C0b plus an infinite-dimensional sign theorem
  and a new independent trace/zero/prime consequence.  A comparison formula
  or finite matrix by itself is not field-level.

## Anti-circularity

No zeta-zero list, RH assumption, fitted spectrum, or positivity of `Q_S` is
allowed in the construction of `T_S`.  The published archimedean theorem may
be used only to calibrate the prime-deletion restriction, not to define the
one-prime answer after the fact.
