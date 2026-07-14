#!/usr/bin/env python3
"""Exact survival of the sharp endpoint cut for the high-thin union.

At ``(m,r)=(2,1/5)``, put ``(x,y)=(19/10,21/10)`` and

    F={c<1/5} union {r<3/20}
        union {r<13/50 and c<18/25}.                    (1)

The stable proper-cut topology found by the finite Hall search is the vertex
cover

    A=(-infinity,-7/10) union (77/40,infinity),
    B=(-17/20,83/40).                                   (2)

It really covers (1).  If ``v<=-17/20``, neither characteristic branch is
possible, so an admitted pair has ``|u-v|<3/20`` and hence ``u<-7/10``.
If ``v>=83/40>36/25``, both characteristic branches are again impossible,
so ``u>83/40-3/20=77/40``.  Otherwise v is in B.  The same argument covers
single-coordinate edges: with y held, a thin hit forces u>39/20>77/40;
with x held, it forces ``7/4<v<41/20``, which is contained in B.

This program proves rigorously that (2) is *not* a Hall obstruction:

    nu_x(A)+nu_y(B)>1/2.                                (3)

For a lower bound it is enough to retain the complete y arch integral over
B, the x arch subinterval ``(-3/2,-7/10)``, all twelve y prime powers in B,
and the four x inward prime powers 16,17,19,23.  Every omitted arch or prime
term is positive.  The arch integrals are finite positive theta--Levy series,
so truncating those series is itself a certified lower bound; there is no
quadrature extrapolation and no omitted boundary cell.

Statement (3) only kills this candidate cut.  It is not a proof that every
proper Hall cut has capacity above one half and does not construct a flow.

For reference, the exact one-set form of every vertex cover is as follows.
Let ``S_x={u:(u,y) in F}``, ``S_y={v:(x,v) in F}``, choose a measurable
``A superset S_x``, and put

    B(A)=S_y union N_F(A^c),
    H(A)=nu_x(A)+nu_y(B(A)).                            (4)

If a half-open connected component I of A disjoint from S_x is eroded,
``A'=A\\I``, then with

    D_I=N_F(I) \\ (S_y union N_F(A^c))

one has the exact variation

    H(A')-H(A)=-nu_x(I)+nu_y(D_I).                     (5)

Writing ``nu_s=f_s dz+sum p_(s,q,sign) delta_(s+sign log q)``, (5) includes
``-int_I f_x + int_(D_I)f_y`` and both finite/local atom ledgers.  When a
moving endpoint acquires an x atom, (5) jumps down by its complete mass;
when a newly exposed boundary of D_I acquires a y atom, it jumps up by that
complete mass.  Consequently a continuum derivative that omits endpoint
prime switches is not a valid erosion argument.

Reproduce with

    PYTHONPATH=/tmp/pvdeps:scripts python3 -u \
      scripts/coupling_high_thin_union_cut_survival_certificate.py
"""

from __future__ import annotations

from flint import arb, ctx

import coupling_anchor_beta_transport_certificate as kernel_base
import coupling_exact_arch_integral as exact_arch


ctx.prec = 240
q = kernel_base.q

X = q(19, 10)
Y = q(21, 10)
A_LOW = -q(7, 10)
A_HIGH = q(77, 40)
B_LOW = -q(17, 20)
B_HIGH = q(83, 40)
HALF = q(1, 2)

Y_PRIMES = (
    (2, 2),
    (3, 3),
    (4, 2),
    (5, 5),
    (7, 7),
    (8, 2),
    (9, 3),
    (11, 11),
    (13, 13),
    (16, 2),
    (17, 17),
    (19, 19),
)
X_RETAINED_PRIMES = ((16, 2), (17, 17), (19, 19), (23, 23))


def normalizer(source: arb) -> arb:
    return (source / 2).cosh()


def inward_prime_lower(source: arb, power: int, prime: int) -> arb:
    target = source - arb(power).log()
    kernel_lower, _kernel_upper = kernel_base.kernel_bounds(target)
    return (
        arb(prime).log()
        / arb(power).sqrt()
        * kernel_lower
        / normalizer(source)
    )


def main() -> None:
    # Exact rational geometry of the cover and the two held-coordinate tests.
    assert (B_HIGH - q(3, 20)).contains(A_HIGH)
    assert B_HIGH > q(36, 25)  # every c<18/25 coordinate has |z|<36/25
    assert -B_LOW > q(2, 5)   # every c<1/5 coordinate has |z|<2/5
    assert Y - q(3, 20) > A_HIGH
    assert X - q(3, 20) > B_LOW and X + q(3, 20) < B_HIGH

    # Positive-series lower integrals.  B lies a distance 1/40 below Y, and
    # the retained x interval is wholly below X, so no Levy pole is crossed.
    y_arch_lower = exact_arch.kernel_levy_integral_lower(
        Y, B_LOW, B_HIGH, levy_terms=80, theta_terms=6
    ) / normalizer(Y)
    x_arch_lower = exact_arch.kernel_levy_integral_lower(
        X, -q(3, 2), A_LOW, levy_terms=80, theta_terms=6
    ) / normalizer(X)

    y_prime_lower = arb(0)
    for power, prime in Y_PRIMES:
        target = Y - arb(power).log()
        assert B_LOW < target < B_HIGH
        y_prime_lower += inward_prime_lower(Y, power, prime)
    # The adjacent labels prove that the displayed y list is complete.  This
    # completeness is not needed for the lower-bound direction, but audits
    # the atom switches exposed by the finite cut.
    assert Y - arb(23).log() < B_LOW
    assert Y + arb(2).log() > B_HIGH

    x_prime_lower = arb(0)
    for power, prime in X_RETAINED_PRIMES:
        target = X - arb(power).log()
        assert target < A_LOW
        x_prime_lower += inward_prime_lower(X, power, prime)

    retained_capacity = (
        y_arch_lower + x_arch_lower + y_prime_lower + x_prime_lower
    )
    reserve = retained_capacity - HALF
    assert reserve > 0

    print("precision_bits:", ctx.prec)
    print("source_(x,y):", (X, Y))
    print("cover_A:", (("-infinity", A_LOW), (A_HIGH, "infinity")))
    print("cover_B:", (B_LOW, B_HIGH))
    print("y_arch_complete_B_lower:", y_arch_lower)
    print("x_arch_retained_subinterval_lower:", x_arch_lower)
    print("y_prime_complete_B_lower:", y_prime_lower)
    print("x_prime_retained_lower:", x_prime_lower)
    print("retained_cover_capacity_lower:", retained_capacity)
    print("strict_reserve_above_half:", reserve)
    print("candidate_proper_cut_is_not_an_obstruction: PASS")
    print("all_proper_cuts_or_Hall_flow: NOT_CLAIMED")


if __name__ == "__main__":
    main()
