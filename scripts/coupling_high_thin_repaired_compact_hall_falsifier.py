#!/usr/bin/env python3
"""Exact compact Hall obstruction for the repaired high-thin target.

Remove only the two local archimedean jump pieces of displacement below

    epsilon = 1/100000

from each physical marginal ``nu_s``.  At the rational source

    x=137/80,  y=151/80,  (m,r)=(9/5,7/40),

consider the repaired target

    F={c<1/5} union {|u-v|<3/20}
        union {|u-v|<13/50 and c<18/25}.                (1)

Here

    c(u,v)=(|u+v|+|u|+|v|)/4.

This file gives a continuum vertex cover of capacity strictly below one
half.  Put

    D=[-7/10,83/100],
    A=(-17/20,49/50) union (139/80,163/80),
    B=R\\D.                                              (2)

The second A interval is exactly ``(y-3/20,y+3/20)``, so it covers every
edge with the y coordinate held.  Also
``(x-3/20,x+3/20)`` is contained in B, so B covers every edge with the x
coordinate held.

For a simultaneous edge with ``v in D``:

* the thin branch forces ``-17/20<u<49/50``;
* ``c<1/5`` forces ``|u|<2/5``;
* ``|u-v|<13/50,c<18/25`` forces ``|u|<17/20`` (same
  signs give ``|u|<18/25+13/100``; opposite signs give
  ``|u|<13/50``).

Thus every such u lies in the first A interval.  If ``v notin D`` then
``v in B``.  Hence (2) covers every open edge of (1), with no boundary
closure or finite-mesh inference.

The exact cover capacity is evaluated in the stable form

    nu_x(A)+nu_y(B)-1/2
      ={M_epsilon(y)-1/2}+nu_x(A)-nu_y(D),              (3)

where ``M_epsilon`` is the complete nonlocal y mass.  The prime-free radical
identity from continuation item 198 gives

    C(y){M_epsilon(y)-1/2}=-R_epsilon(y),

    R_epsilon(y)=K(y){c0-2I(epsilon)}+L_epsilon(y).

Taylor's theorem and ``J(t)<=1/t`` on this epsilon range yield
``|L_epsilon(y)|<=epsilon^2 sup|K''|/2``.  This gives a rigorous upper
bound for the first brace in (3), without evaluating the infinite prime
sum.

The x arch mass is bounded above by validated Arb integration of the first
four theta terms plus a uniform positive tail majorant.  The y arch mass in
D is bounded below by finite positive theta--Levy gamma series.  The
complete bounded prime lists are

    x into A: 3,4,5,7,8,9,11,
    y into D: 3,4,5,7,8,9,11,13.

There are no prime atoms in the mandatory x interval and no outward atoms
in any displayed bounded interval.  All endpoint comparisons are strict;
arch endpoints are null.  The final upper enclosure is less than
``-1.6e-6``.  Therefore the repaired target (1) has maximum entrance rate
strictly below one half at this source.

Reproduce with

    PYTHONPATH=/tmp/pvdeps:scripts python3 -u \
      scripts/coupling_high_thin_repaired_compact_hall_falsifier.py
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
THIN = q(3, 20)
X = q(137, 80)
Y = q(151, 80)
D_LEFT = -q(7, 10)
D_RIGHT = q(83, 100)
A_CENTRAL_LEFT = -q(17, 20)
A_CENTRAL_RIGHT = q(49, 50)
A_MANDATORY_LEFT = q(139, 80)
A_MANDATORY_RIGHT = q(163, 80)
HALF = q(1, 2)

X_PRIMES = ((3, 3), (4, 2), (5, 5), (7, 7), (8, 2), (9, 3), (11, 11))
Y_PRIMES = X_PRIMES + ((13, 13),)


def normalizer(source: arb) -> arb:
    return (source / 2).cosh()


def partial_positive_integral(
    source: arb, left: arb, right: arb, *, target_above_source: bool
) -> arb:
    """Integrate the first four theta terms on a positive target interval."""

    assert 0 <= left < right
    if target_above_source:
        assert left > source
    else:
        assert right < source
    source_complex = acb(source)

    def integrand(z: acb, analytic: bool) -> acb:
        del analytic
        displacement = z - source_complex if target_above_source else source_complex - z
        return theta.theta_partial_complex(z) * theta.levy_complex(displacement)

    value = acb.integral(
        integrand,
        left,
        right,
        abs_tol=arb("1e-60"),
        rel_tol=arb("1e-60"),
        eval_limit=200_000,
    )
    assert value.imag == 0
    return value.real


def partial_negative_integral(source: arb, left: arb, right: arb) -> arb:
    """Integrate the first four theta terms on a negative target interval."""

    assert left < right <= 0 < source
    source_complex = acb(source)
    t_left = -right
    t_right = -left

    def integrand(t: acb, analytic: bool) -> acb:
        del analytic
        return theta.theta_partial_complex(t) * theta.levy_complex(
            source_complex + t
        )

    value = acb.integral(
        integrand,
        t_left,
        t_right,
        abs_tol=arb("1e-60"),
        rel_tol=arb("1e-60"),
        eval_limit=200_000,
    )
    assert value.imag == 0
    return value.real


def x_arch_mass_upper() -> tuple[arb, arb, arb]:
    """Validated upper mass on both A intervals."""

    partial = partial_negative_integral(X, A_CENTRAL_LEFT, arb(0))
    partial += partial_positive_integral(
        X, arb(0), A_CENTRAL_RIGHT, target_above_source=False
    )
    partial += partial_positive_integral(
        X,
        A_MANDATORY_LEFT,
        A_MANDATORY_RIGHT,
        target_above_source=True,
    )

    central_closest = X - A_CENTRAL_RIGHT
    mandatory_closest = A_MANDATORY_LEFT - X
    assert central_closest.contains(q(293, 400))
    assert mandatory_closest.contains(q(1, 40))
    omitted = (
        (A_CENTRAL_RIGHT - A_CENTRAL_LEFT)
        * theta.THETA_TAIL
        * base.levy_shape(central_closest)
    )
    omitted += (
        (A_MANDATORY_RIGHT - A_MANDATORY_LEFT)
        * theta.THETA_TAIL
        * base.levy_shape(mandatory_closest)
    )
    unnormalized_upper = arb(partial.upper()) + arb(omitted.upper())
    mass_upper = (
        unnormalized_upper / arb(normalizer(X).lower())
    ).upper()
    return partial, omitted, arb(mass_upper)


def y_arch_mass_lower() -> arb:
    """Positive-series lower mass on the complete closed interval D."""

    unnormalized = exact_arch.kernel_levy_integral_lower(
        Y,
        D_LEFT,
        D_RIGHT,
        levy_terms=120,
        theta_terms=6,
    )
    return arb(
        (
            arb(unnormalized.lower())
            / arb(normalizer(Y).upper())
        ).lower()
    )


def prime_mass_upper(source: arb, data: tuple[tuple[int, int], ...]) -> arb:
    """Upper bound for the listed inward-prime atoms."""

    total = arb(0)
    denominator = arb(normalizer(source).lower())
    for power, prime in data:
        target = source - arb(power).log()
        _kernel_lower, kernel_upper = base.kernel_bounds(target)
        coefficient = arb(
            (arb(prime).log() / arb(power).sqrt()).upper()
        )
        total += coefficient * arb(kernel_upper.upper()) / denominator
    return arb(total.upper())


def prime_mass_lower(source: arb, data: tuple[tuple[int, int], ...]) -> arb:
    """Lower bound for the listed inward-prime atoms."""

    total = arb(0)
    denominator = arb(normalizer(source).upper())
    for power, prime in data:
        target = source - arb(power).log()
        kernel_lower, _kernel_upper = base.kernel_bounds(target)
        coefficient = arb(
            (arb(prime).log() / arb(power).sqrt()).lower()
        )
        total += coefficient * arb(kernel_lower.lower()) / denominator
    return arb(total.lower())


def total_y_excess_upper() -> tuple[arb, arb, arb, arb]:
    """Prime-free upper bound for M_epsilon(Y)-1/2."""

    # J(t)=exp(3t/2)/(exp(2t)-1) <= exp(3 epsilon/2)/(2t)<1/t.
    assert (3 * EPSILON / 2).exp() < 2
    c0 = arb.const_euler() + arb.pi() / 2 + (8 * arb.pi()).log()
    exponential = (-EPSILON / 2).exp()
    i_epsilon = exponential.atanh() + exponential.atan()
    coefficient = 2 * i_epsilon - c0
    assert coefficient > 0

    _kernel_lower, kernel_upper = base.kernel_bounds(Y)
    second_upper = radical.k_second_absolute_upper(Y - EPSILON)
    numerator_upper = (
        arb(kernel_upper.upper()) * arb(coefficient.upper())
        + EPSILON**2 * arb(second_upper.upper()) / 2
    )
    excess_upper = arb(
        (
            numerator_upper / arb(normalizer(Y).lower())
        ).upper()
    )
    return coefficient, kernel_upper, second_upper, excess_upper


def audit_geometry_and_prime_lists() -> None:
    """Exact rational geometry and strict adjacent prime-power switches."""

    assert (Y - THIN - A_MANDATORY_LEFT).contains(0)
    assert (Y + THIN - A_MANDATORY_RIGHT).contains(0)
    assert X - THIN > D_RIGHT
    assert X + THIN > D_RIGHT

    # For v in D the tube neighborhood is contained in A_central.
    assert (D_LEFT - THIN - A_CENTRAL_LEFT).contains(0)
    assert (D_RIGHT + THIN - A_CENTRAL_RIGHT).contains(0)
    # Both characteristic branches have the asserted global projections.
    assert q(2, 5) < -A_CENTRAL_LEFT
    assert (q(18, 25) + q(13, 100) + A_CENTRAL_LEFT).contains(0)
    assert q(13, 50) < -A_CENTRAL_LEFT

    # Complete x-prime list in the central A interval.
    assert X - arb(2).log() > A_CENTRAL_RIGHT
    for power, _prime in X_PRIMES:
        assert A_CENTRAL_LEFT < X - arb(power).log() < A_CENTRAL_RIGHT
    assert X - arb(13).log() < A_CENTRAL_LEFT

    # No prime atom enters the mandatory x interval.
    assert X - arb(2).log() < A_MANDATORY_LEFT
    assert X + arb(2).log() > A_MANDATORY_RIGHT

    # Complete y-prime list in D.
    assert Y - arb(2).log() > D_RIGHT
    for power, _prime in Y_PRIMES:
        assert D_LEFT < Y - arb(power).log() < D_RIGHT
    assert Y - arb(16).log() < D_LEFT
    assert Y + arb(2).log() > D_RIGHT


def main() -> None:
    audit_geometry_and_prime_lists()

    x_arch_partial, x_arch_tail, x_arch_upper = x_arch_mass_upper()
    y_arch_lower = y_arch_mass_lower()
    x_prime_upper = prime_mass_upper(X, X_PRIMES)
    y_prime_lower = prime_mass_lower(Y, Y_PRIMES)
    x_A_upper = x_arch_upper + x_prime_upper
    y_D_lower = y_arch_lower + y_prime_lower

    coefficient, kernel_y_upper, second_upper, total_excess_upper = (
        total_y_excess_upper()
    )
    cover_minus_half_upper = arb(
        (total_excess_upper + x_A_upper - y_D_lower).upper()
    )
    deficit_lower = -cover_minus_half_upper
    assert cover_minus_half_upper < 0
    assert deficit_lower > arb("1.6e-6")

    print("precision_bits:", ctx.prec)
    print("source_(m,r):", (q(9, 5), q(7, 40)))
    print("source_(x,y):", (X, Y))
    print("target: c<1/5 or |u-v|<3/20 or (|u-v|<13/50,c<18/25)")
    print(
        "cover_A:",
        ((A_CENTRAL_LEFT, A_CENTRAL_RIGHT),
         (A_MANDATORY_LEFT, A_MANDATORY_RIGHT)),
    )
    print("cover_B: R\\[-7/10,83/100]")
    print("complete_x_prime_powers_in_A:", tuple(p for p, _ in X_PRIMES))
    print("complete_y_prime_powers_in_D:", tuple(p for p, _ in Y_PRIMES))
    print("x_arch_first_four_partial:", x_arch_partial)
    print("x_arch_omitted_theta_tail_upper:", x_arch_tail)
    print("x_arch_mass_upper:", x_arch_upper)
    print("x_prime_mass_upper:", x_prime_upper)
    print("complete_x_A_mass_upper:", x_A_upper)
    print("y_arch_mass_positive_series_lower:", y_arch_lower)
    print("y_prime_mass_lower:", y_prime_lower)
    print("complete_y_D_mass_lower:", y_D_lower)
    print("2I_epsilon_minus_c0:", coefficient)
    print("K_y_upper:", kernel_y_upper)
    print("K_second_upper:", second_upper)
    print("complete_y_nonlocal_excess_above_half_upper:", total_excess_upper)
    print("cover_capacity_minus_half_upper:", cover_minus_half_upper)
    print("strict_Hall_deficit_lower:", deficit_lower)
    print("all_open_edges_and_held_edges_covered: PASS")
    print("complete_prime_lists_and_infinite_total_mass: PASS")
    print("repaired_high_thin_compact_Hall_obstruction: PASS")


if __name__ == "__main__":
    main()
