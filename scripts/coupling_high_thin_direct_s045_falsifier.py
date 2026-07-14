#!/usr/bin/env python3
"""Exact Hall obstruction to direct high-thin entrance into ``S_.45``.

At

    (m,r)=(44/25,1/5),  (x,y)=(83/50,93/50),

consider

    S_.45={(u,v): c(u,v)<9/20 or |u-v|<1/10}.

Put ``U=x-log(2)`` and use the continuum vertex cover

    A=(-9/10,U) union (44/25,49/25),
    B=(-infinity,-4/5) union (U-1/10,infinity).        (1)

Indeed, if v is outside B then ``-4/5<=v<=U-1/10``.
The radius branch forces ``-9/10<u<U``.  The characteristic branch also
forces ``|u|<9/10``; its positive projection is below 9/10, hence below U.
The second A interval is the held-y tube, and the held-x tube lies in B.
Strict target inequalities settle all boundary points.

With local arch jumps below epsilon=1/100000 removed, write
``D=[-4/5,U-1/10]``.  The stable cover ledger is

    nu_x(A)+nu_y(B)-1/2
      ={M_epsilon(y)-1/2}+nu_x(A)-nu_y(D).             (2)

The prime-free radical identity controls the complete first brace.
Validated arch integration and complete bounded prime lists prove (2)<0.
Thus S_.45 is rigorously too small as a direct high-thin entrance target.

Reproduce with

    PYTHONPATH=/tmp/pvdeps:scripts python3 -u \
      scripts/coupling_high_thin_direct_s045_falsifier.py
"""

from __future__ import annotations

from flint import arb, ctx

import coupling_anchor_beta_transport_certificate as base
import coupling_exact_arch_integral as exact_arch
import coupling_high_middle_radical_cut_certificate as radical
import coupling_high_thin_direct_s044_falsifier as s044
import coupling_high_thin_repaired_compact_hall_falsifier as repaired
import coupling_high_thin_projection_hall_certificate as theta


ctx.prec = 240
q = base.q

EPSILON = q(1, 100000)
CORE = q(9, 20)
TUBE = q(1, 10)
X = q(83, 50)
Y = q(93, 50)
A_LEFT = -q(9, 10)
A_MANDATORY_LEFT = q(44, 25)
A_MANDATORY_RIGHT = q(49, 25)
B_LEFT_END = -q(4, 5)
U = X - arb(2).log()
D_RIGHT = U - TUBE

X_A_PRIMES = ((3, 3), (4, 2), (5, 5), (7, 7), (8, 2), (9, 3), (11, 11))
Y_D_PRIMES = X_A_PRIMES + ((13, 13),)


def arch_above_upper(source: arb, left: arb, right: arb) -> arb:
    assert source < left < right
    partial = repaired.partial_positive_integral(
        source, left, right, target_above_source=True
    )
    omitted = (right - left) * theta.THETA_TAIL * base.levy_shape(left - source)
    return arb(
        (
            (arb(partial.upper()) + arb(omitted.upper()))
            / arb(s044.normalizer(source).lower())
        ).upper()
    )


def total_y_excess_upper() -> arb:
    c0 = arb.const_euler() + arb.pi() / 2 + (8 * arb.pi()).log()
    exponential = (-EPSILON / 2).exp()
    i_epsilon = exponential.atanh() + exponential.atan()
    coefficient = 2 * i_epsilon - c0
    assert coefficient > 0 and (3 * EPSILON / 2).exp() < 2
    _kernel_lower, kernel_upper = base.kernel_bounds(Y)
    second_upper = radical.k_second_absolute_upper(Y - EPSILON)
    numerator = (
        arb(kernel_upper.upper()) * arb(coefficient.upper())
        + EPSILON**2 * arb(second_upper.upper()) / 2
    )
    return arb((numerator / arb(s044.normalizer(Y).lower())).upper())


def audit_geometry_and_primes() -> None:
    assert (A_LEFT + 2 * CORE).contains(0)
    assert (B_LEFT_END - A_LEFT - TUBE).contains(0)
    assert (U - TUBE - D_RIGHT).contains(0)
    assert U > q(9, 10)
    assert (Y - TUBE - A_MANDATORY_LEFT).contains(0)
    assert (Y + TUBE - A_MANDATORY_RIGHT).contains(0)
    assert X - TUBE > D_RIGHT

    assert (X - arb(2).log() - U).contains(0)
    for power, _prime in X_A_PRIMES:
        assert A_LEFT < X - arb(power).log() < U
    assert X - arb(13).log() < A_LEFT
    assert X + arb(2).log() > A_MANDATORY_RIGHT

    assert Y - arb(2).log() > D_RIGHT
    for power, _prime in Y_D_PRIMES:
        assert B_LEFT_END < Y - arb(power).log() < D_RIGHT
    assert Y - arb(16).log() < B_LEFT_END


def main() -> None:
    audit_geometry_and_primes()

    x_arch_upper = s044.arch_interval_upper(X, A_LEFT, U)
    x_arch_upper += arch_above_upper(
        X, A_MANDATORY_LEFT, A_MANDATORY_RIGHT
    )
    x_prime_upper = repaired.prime_mass_upper(X, X_A_PRIMES)
    x_a_upper = x_arch_upper + x_prime_upper

    y_arch_lower = exact_arch.kernel_levy_integral_lower(
        Y, B_LEFT_END, D_RIGHT, levy_terms=120, theta_terms=6
    ) / s044.normalizer(Y)
    y_arch_lower = arb(y_arch_lower.lower())
    y_prime_lower = repaired.prime_mass_lower(Y, Y_D_PRIMES)
    y_d_lower = y_arch_lower + y_prime_lower

    y_excess_upper = total_y_excess_upper()
    cover_minus_half_upper = arb(
        (y_excess_upper + x_a_upper - y_d_lower).upper()
    )
    deficit_lower = -cover_minus_half_upper
    assert deficit_lower > 0

    print("precision_bits:", ctx.prec)
    print("source_(m,r):", (q(44, 25), q(1, 5)))
    print("source_(x,y):", (X, Y))
    print("target: c<9/20 or |u-v|<1/10")
    print("cover_A:", ((A_LEFT, U), (A_MANDATORY_LEFT, A_MANDATORY_RIGHT)))
    print("cover_B:", (("-infinity", B_LEFT_END), (D_RIGHT, "infinity")))
    print("complete_x_A_prime_powers:", tuple(p for p, _ in X_A_PRIMES))
    print("complete_y_D_prime_powers:", tuple(p for p, _ in Y_D_PRIMES))
    print("x_A_arch_upper:", x_arch_upper)
    print("x_A_prime_upper:", x_prime_upper)
    print("x_A_complete_upper:", x_a_upper)
    print("y_D_arch_lower:", y_arch_lower)
    print("y_D_prime_lower:", y_prime_lower)
    print("y_D_complete_lower:", y_d_lower)
    print("complete_y_nonlocal_excess_above_half_upper:", y_excess_upper)
    print("cover_capacity_minus_half_upper:", cover_minus_half_upper)
    print("strict_Hall_deficit_lower:", deficit_lower)
    print("all_open_edges_and_held_edges_covered: PASS")
    print("direct_high_thin_S_.45_Hall_obstruction: PASS")


if __name__ == "__main__":
    main()
