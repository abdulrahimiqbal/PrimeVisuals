#!/usr/bin/env python3
"""Exact Hall obstruction to direct high-thin entrance into ``S_.44``.

Let

    S_.44={(u,v): c(u,v)<11/25 or |u-v|<1/10},
    c(u,v)=(|u+v|+|u|+|v|)/4.

At the high-thin source

    (m,r)=(49/25,1/5),  (x,y)=(93/50,103/50),

put ``U=y-log(3)``, ``L=U-1/10`` and

    A=(-infinity,-39/50) union (L,infinity),
    B=(-22/25,U) union (44/25,49/25).                 (1)

This is a continuum vertex cover.  If ``v`` is outside B, then either
``|v|>=22/25`` (so the characteristic branch is impossible) or v is in a
gap separated from the held-x tube.  In every remaining simultaneous case
the strict radius branch forces u into A.  The second B interval is exactly
the held-x radius neighborhood, while the held-y radius neighborhood lies
in A.  Boundary points cause no problem because both target inequalities
are strict.

The capacity is evaluated stably as

    nu_x(A)+nu_y(B)-1/2
      ={M_epsilon(x)-1/2}-nu_x(D)+nu_y(B),             (2)

where ``D=[-39/50,L]`` and only arch jumps of displacement below
``epsilon=1/100000`` have been removed.  The prime-free radical identity
gives the complete first brace.  Positive theta--Levy series lower-bound
``nu_x(D)``.  Validated integration of the first four theta terms plus a
uniform positive tail majorant upper-bounds ``nu_y(B)``.  The complete
bounded inward-prime lists are

    x into D: 3,4,5,7,8,9,11,13,
    y into B: 4,5,7,8,9,11,13,16,17.

The program proves that (2) is negative.  Thus neither ``S_.44`` nor any
smaller direct characteristic/tube target can be the uniform high-thin
entrance stage.  This does not obstruct a buffered level above .44 or the
larger repaired three-branch target.

Reproduce with

    PYTHONPATH=/tmp/pvdeps:scripts python3 -u \
      scripts/coupling_high_thin_direct_s044_falsifier.py
"""

from __future__ import annotations

from flint import acb, arb, ctx

import coupling_anchor_beta_transport_certificate as base
import coupling_exact_arch_integral as exact_arch
import coupling_high_middle_radical_cut_certificate as radical
import coupling_high_thin_projection_hall_certificate as theta


ctx.prec = 240
q = base.q

EPSILON = q(1, 100000)
CORE = q(11, 25)
TUBE = q(1, 10)
X = q(93, 50)
Y = q(103, 50)
A_NEG_RIGHT = -q(39, 50)
B_CORE_LEFT = -q(22, 25)
B_MANDATORY_LEFT = q(44, 25)
B_MANDATORY_RIGHT = q(49, 25)
U = Y - arb(3).log()
L = U - TUBE
HALF = q(1, 2)

X_D_PRIMES = (
    (3, 3), (4, 2), (5, 5), (7, 7),
    (8, 2), (9, 3), (11, 11), (13, 13),
)
Y_B_PRIMES = (
    (4, 2), (5, 5), (7, 7), (8, 2), (9, 3),
    (11, 11), (13, 13), (16, 2), (17, 17),
)


def normalizer(source: arb) -> arb:
    return (source / 2).cosh()


def partial_integral_below(source: arb, left: arb, right: arb) -> arb:
    """Validated first-four-theta integral on left<right<source."""

    assert left < right < source
    source_complex = acb(source)

    def positive_integrand(z: acb, analytic: bool) -> acb:
        del analytic
        return theta.theta_partial_complex(z) * theta.levy_complex(
            source_complex - z
        )

    def negative_integrand(t: acb, analytic: bool) -> acb:
        del analytic
        return theta.theta_partial_complex(t) * theta.levy_complex(
            source_complex + t
        )

    options = dict(
        abs_tol=arb("1e-60"),
        rel_tol=arb("1e-60"),
        eval_limit=200_000,
    )
    total = acb(0)
    if left < 0:
        negative_right = min(right, arb(0))
        total += acb.integral(
            negative_integrand, -negative_right, -left, **options
        )
    if right > 0:
        positive_left = max(left, arb(0))
        total += acb.integral(
            positive_integrand, positive_left, right, **options
        )
    assert total.imag == 0
    return total.real


def arch_interval_upper(source: arb, left: arb, right: arb) -> arb:
    """Complete normalized arch upper bound on left<right<source."""

    partial = partial_integral_below(source, left, right)
    closest = source - right
    omitted = (right - left) * theta.THETA_TAIL * base.levy_shape(closest)
    return arb(
        (
            (arb(partial.upper()) + arb(omitted.upper()))
            / arb(normalizer(source).lower())
        ).upper()
    )


def prime_mass_lower(source: arb, data: tuple[tuple[int, int], ...]) -> arb:
    total = arb(0)
    denominator = arb(normalizer(source).upper())
    for power, prime in data:
        target = source - arb(power).log()
        kernel_lower, _kernel_upper = base.kernel_bounds(target)
        coefficient = (arb(prime).log() / arb(power).sqrt()).lower()
        total += arb(coefficient) * arb(kernel_lower.lower()) / denominator
    return arb(total.lower())


def prime_mass_upper(source: arb, data: tuple[tuple[int, int], ...]) -> arb:
    total = arb(0)
    denominator = arb(normalizer(source).lower())
    for power, prime in data:
        target = source - arb(power).log()
        _kernel_lower, kernel_upper = base.kernel_bounds(target)
        coefficient = (arb(prime).log() / arb(power).sqrt()).upper()
        total += arb(coefficient) * arb(kernel_upper.upper()) / denominator
    return arb(total.upper())


def total_x_excess_upper() -> tuple[arb, arb, arb, arb]:
    """Prime-free upper bound for M_epsilon(X)-1/2."""

    assert (3 * EPSILON / 2).exp() < 2
    c0 = arb.const_euler() + arb.pi() / 2 + (8 * arb.pi()).log()
    exponential = (-EPSILON / 2).exp()
    i_epsilon = exponential.atanh() + exponential.atan()
    coefficient = 2 * i_epsilon - c0
    assert coefficient > 0
    _kernel_lower, kernel_upper = base.kernel_bounds(X)
    second_upper = radical.k_second_absolute_upper(X - EPSILON)
    numerator_upper = (
        arb(kernel_upper.upper()) * arb(coefficient.upper())
        + EPSILON**2 * arb(second_upper.upper()) / 2
    )
    excess_upper = arb(
        (numerator_upper / arb(normalizer(X).lower())).upper()
    )
    return coefficient, kernel_upper, second_upper, excess_upper


def audit_geometry_and_prime_lists() -> None:
    # B's left boundary is exactly -2*CORE and A's is its TUBE erosion.
    assert (B_CORE_LEFT + 2 * CORE).contains(0)
    assert (B_CORE_LEFT + TUBE - A_NEG_RIGHT).contains(0)
    assert (U - TUBE - L).contains(0)
    # The held-coordinate tube neighborhoods.
    assert (X - TUBE - B_MANDATORY_LEFT).contains(0)
    assert (X + TUBE - B_MANDATORY_RIGHT).contains(0)
    assert Y - TUBE > L

    # Complete x inward-prime list in D=[A_NEG_RIGHT,L].
    assert X - arb(2).log() > L
    for power, _prime in X_D_PRIMES:
        assert A_NEG_RIGHT < X - arb(power).log() < L
    assert X - arb(16).log() < A_NEG_RIGHT

    # Complete y inward-prime list in the open central B interval.
    assert (Y - arb(3).log() - U).contains(0)  # excluded open endpoint
    for power, _prime in Y_B_PRIMES:
        assert B_CORE_LEFT < Y - arb(power).log() < U
    assert Y - arb(19).log() < B_CORE_LEFT
    # No prime atom lies in the held-x mandatory B interval.
    assert Y - arb(2).log() < B_MANDATORY_LEFT
    assert Y + arb(2).log() > B_MANDATORY_RIGHT


def main() -> None:
    audit_geometry_and_prime_lists()

    x_d_arch_lower = exact_arch.kernel_levy_integral_lower(
        X, A_NEG_RIGHT, L, levy_terms=120, theta_terms=6
    ) / normalizer(X)
    x_d_arch_lower = arb(x_d_arch_lower.lower())
    x_d_prime_lower = prime_mass_lower(X, X_D_PRIMES)
    x_d_lower = x_d_arch_lower + x_d_prime_lower

    y_b_arch_upper = arch_interval_upper(Y, B_CORE_LEFT, U)
    y_b_arch_upper += arch_interval_upper(
        Y, B_MANDATORY_LEFT, B_MANDATORY_RIGHT
    )
    y_b_prime_upper = prime_mass_upper(Y, Y_B_PRIMES)
    y_b_upper = y_b_arch_upper + y_b_prime_upper

    coefficient, kernel_x_upper, second_upper, x_excess_upper = (
        total_x_excess_upper()
    )
    cover_minus_half_upper = arb(
        (x_excess_upper - x_d_lower + y_b_upper).upper()
    )
    deficit_lower = -cover_minus_half_upper
    assert cover_minus_half_upper < 0

    print("precision_bits:", ctx.prec)
    print("source_(m,r):", (q(49, 25), q(1, 5)))
    print("source_(x,y):", (X, Y))
    print("target: c<11/25 or |u-v|<1/10")
    print("cover_A:", (("-infinity", A_NEG_RIGHT), (L, "infinity")))
    print(
        "cover_B:",
        ((B_CORE_LEFT, U), (B_MANDATORY_LEFT, B_MANDATORY_RIGHT)),
    )
    print("complete_x_prime_powers_in_D:", tuple(p for p, _ in X_D_PRIMES))
    print("complete_y_prime_powers_in_B:", tuple(p for p, _ in Y_B_PRIMES))
    print("x_D_arch_lower:", x_d_arch_lower)
    print("x_D_prime_lower:", x_d_prime_lower)
    print("x_D_complete_lower:", x_d_lower)
    print("y_B_arch_upper:", y_b_arch_upper)
    print("y_B_prime_upper:", y_b_prime_upper)
    print("y_B_complete_upper:", y_b_upper)
    print("2I_epsilon_minus_c0:", coefficient)
    print("K_x_upper:", kernel_x_upper)
    print("K_second_upper:", second_upper)
    print("complete_x_nonlocal_excess_above_half_upper:", x_excess_upper)
    print("cover_capacity_minus_half_upper:", cover_minus_half_upper)
    print("strict_Hall_deficit_lower:", deficit_lower)
    print("all_open_edges_and_held_edges_covered: PASS")
    print("direct_high_thin_S_.44_Hall_obstruction: PASS")


if __name__ == "__main__":
    main()
