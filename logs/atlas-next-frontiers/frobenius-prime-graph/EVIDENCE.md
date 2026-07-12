# First survival round — Frobenius prime graph evidence

Run: 2026-07-12
Frozen protocol: [PREREGISTRATION.md](./PREREGISTRATION.md)
Exact audit: [`scripts/frobenius-prime-graph-audit.mjs`](../../../scripts/frobenius-prime-graph-audit.mjs)
Exact kernels: [`src/core/frobeniusPrimeGraph.js`](../../../src/core/frobeniusPrimeGraph.js)
Tests: [`tests/frobenius-prime-graph.test.js`](../../../tests/frobenius-prime-graph.test.js)

## Semantic and novelty correction

The canonical object is not new. Silverman and Stange define an amicable pair
for a fixed elliptic curve by

\[
q=\#E(\mathbf F_p),\qquad p=\#E(\mathbf F_q),
\]

and Jones defines the associated finite directed Frobenius graph
`\mathcal G_E(n)` and its torsion-conductor graph `\mathcal G_E`. Jones's
fixed-curve asymptotic is a conjecture, not a theorem. Parks proves an
asymptotic only after averaging over a large two-parameter family of curves.

Primary sources:

- [Silverman--Stange, *Amicable pairs and aliquot cycles for elliptic curves*](https://arxiv.org/abs/0912.1831)
- [Jones, *Elliptic aliquot cycles of fixed length*](https://arxiv.org/abs/1212.1010)
- [Parks, *An asymptotic for the average number of amicable pairs for elliptic curves*](https://arxiv.org/abs/1410.5888)

Thus the fixed-curve theorem is canonical and field-level, but “Frobenius prime
graph” is not a new bridge supplied by this Atlas campaign. The only proposed
new content was the twist-concentration/de-averaging route.

## Gate 1 — constant and hostile controls: pass

Jones gives, for `L=2`,

\[
C_2=\frac{8}{3\pi^2}\prod_\ell
\frac{\ell^2(\ell^4-2\ell^3-2\ell^2+3\ell+3)}
{[(\ell^2-1)(\ell-1)]^2}.
\]

The audit independently enumerated trace/determinant histograms in
`GL_2(F_ell)`, reconstructed the index-two Serre entanglement at level
`2*37=74`, and obtained:

| quantity | exact audit value |
|---|---:|
| universal product, primes `ell <= 100000` | `0.07708818578476373` |
| level-74 entanglement correction | `1.0000660930692096` |
| reconstructed `C_{E0,2}` | `0.07709328077956204` |
| Jones's quoted decimal | `0.077093` |

The hostile non-CM curve

\[
E_z:y^2=x^3-3x+4
\]

has `C_{Ez,L}=0`: Jones explicitly computes its level-4 graph and proves that
it has no closed walk. This is structurally stronger than observing no cycles.
It can still have many prime one-step orders.

## Gate 2 — exact point counts and frozen scan: calibrated, not evidential

For `E0:y^2+y=x^3-x`, completing the square gives the exact independent trace
formula

\[
a_p(E_0)=-\sum_{x\bmod p}\left(\frac{1+4(x^3-x)}p\right).
\]

The test suite compares it with direct `(x,y)` enumeration at eleven small
primes. The frozen scan produced:

| `X` | prime `#E0(F_p)` | semiprime `#E0(F_p)` | amicable pairs |
|---:|---:|---:|---:|
| 5,000 | 48 | 123 | 0 |
| 10,000 | 73 | 220 | 0 |
| 20,000 | 120 | 370 | 0 |
| 40,000 | 226 | 665 | 0 |

This is exactly the expected sparse regime: the sourced scale
`C sqrt(X)/(log X)^2` is only about `0.075, 0.091, 0.111, 0.137` at the four
endpoints. Zero observations neither support nor reject the conjecture.

As a positive engine control, the audit independently recovered the first
published `E0` pair:

\[
(p,q)=(1622311,1622471),\quad
(a_p,a_q)=(-159,161).
\]

For the hostile zero-constant curve, the endpoint-40k counts were 226 prime
orders, 641 semiprime orders, and zero pairs. Raw edge counts therefore do not
distinguish positive from zero aliquot constant.

## Gate 3 — fixed-congruence disguise: pass, with an important qualification

Writing `q=p+h`, the two exact edge conditions are

\[
a_p=1-h,\qquad a_q=1+h,
\]

where `h` varies through a Hasse-sized interval. This is not a fixed-gap prime
tuple and the exact return is not determined by a fixed residue label.

The audit compared the local signature `(p,a_p,q,a_q) mod m` of the true pair
above with non-returning prime-order edges below 40k. Indistinguishable local
false positives occur for every tested `m=2,3,4,5,7,8` (respectively 78, 12,
11, 3, 1, 2 examples). No collision occurred for `m=11` in this small sample;
that absence is not promoted. Jones's finite graph correctly decides whether
the local constant vanishes, not whether any particular integer edge returns.

So the object survives the old “fixed congruence in disguise” kill. It does
not survive a novelty claim: this local/global distinction is already Jones's
framework.

## Gate 4 — explicit parity audit: fail

No proposed input separates prime group order from semiprime group order for a
fixed curve. “Prove a family second moment” and “construct an amplifier” name
desired outcomes; they are not parity-breaking estimates.

At `X=40000`, the exact `E0` sequence contains 226 prime orders and 665 orders
with exactly two prime factors. Existing fixed-curve sieve technology exhibits
the same boundary: David and Wu obtain many group orders with at most eight
prime factors under GRH, plus an upper bound for prime orders, not the Koblitz
prime-order asymptotic. See [David--Wu, *Almost prime values of the order of
elliptic curves over finite fields*](https://arxiv.org/abs/0812.2860).

An amicable pair imposes prime order and a second correlated Frobenius return.
The proposed twist amplifier supplies neither a lower-bound prime detector nor
a substitute for it. Gate 4 fails.

## Gate 5 — twist concentration/de-averaging: fail

The preregistered exact panel used 34 squarefree twists. Results by endpoint:

| `X` | mean pairs/twist | zero fraction | variance/mean² | unique pairs |
|---:|---:|---:|---:|---:|
| 5,000 | 0 | 1 | undefined | 0 |
| 10,000 | 0 | 1 | undefined | 0 |
| 20,000 | 0 | 1 | undefined | 0 |
| 40,000 | `0.2941176` | `0.7058824` | `2.4` | 1 |

All ten nonzero twist counts at 40k are copies of the *same* pair
`(35509,35593)`. For the base curve the traces there are `(83,-85)`; the ten
twists all flip both traces through the same two quadratic-character values.
The panel therefore demonstrates shared-event correlation, not concentration.

Moreover, the curve-dependent adelic constants were not independently proved
for every twist, so the frozen correctly-normalized variance requirement cannot
pass even in principle from this run. Raw variance is already the wrong shape:
it is zero-heavy, does not decrease relative to mean squared, and has only one
effective event.

## Gate 6 — structural controls: pass

The controls are genuinely distinct:

- **positive non-CM `E0`:** positive Jones constant; zero pairs below 40k;
- **zero-constant non-CM `Ez`:** 226 prime one-step orders below 40k, but its
  level-4 graph forbids every return;
- **CM `y^2=x^3+2`:** 64 pairs below 40k, beginning `(13,19)`, and a different
  CM-scale mechanism. These pairs agree with Silverman--Stange's published
  examples.

The geometry is therefore not being inferred merely from zero versus nonzero
small counts.

## Reproduction

```bash
npx vitest run tests/frobenius-prime-graph.test.js
node scripts/frobenius-prime-graph-audit.mjs
```
