#!/usr/bin/env python3
"""Exact radius obstruction to every rebalance of the colored beta route.

Two independent Hall cuts prove strict lower bounds on the two proposed
transport radii.

1. At ``y=7/5`` the q=3 atom of the inward-prime measure has more mass than
   beta-plus assigns to its closed ``1/50``-ball.  Hence any
   inward-prime-to-beta dominated coupling has radius greater than ``1/50``.

2. At ``x=3/5`` the target
   ``nu_x^prime+(51/100)nu_x^arch+(1/2)delta_x`` fails the beta-plus Hall
   inequality at radius ``12/25``.  The witness is
   ``I=(-infinity,47/400]``; its neighbourhood ends at ``239/400<x``, so the
   hold is absent.  Hence the second radius is greater than ``12/25``.

Since ``1/50+12/25=1/2``, no choice of the two radii can make their sum at
most one half.  This rules out radius rebalancing of the globally colored
``51/100`` mechanism, independently of any finite partition.
"""

from __future__ import annotations

from flint import arb, ctx

import coupling_exact_arch_integral as exact_integral
import coupling_half_arch_beta_full_falsifier as second
import coupling_high_thin_projection_hall_certificate as theta


ctx.prec = 240


def q(numerator: int, denominator: int = 1) -> arb:
    return arb(numerator) / denominator


FIRST_Y = q(7, 5)
FIRST_RADIUS = q(1, 50)
SECOND_RADIUS = q(12, 25)
SECOND_DEMAND_RIGHT = q(47, 400)


def first_arrow_atom_obstruction() -> tuple[arb, arb, arb, arb]:
    target = FIRST_Y - arb(3).log()
    kernel_lower = theta.theta_partial_real(abs(target)).lower()
    atom_lower = (
        arb(3).log() / arb(3).sqrt()
        * kernel_lower / (FIRST_Y / 2).cosh()
    )

    partial = 2 * exact_integral.kernel_exponential_integral(
        -q(1, 2),
        target - FIRST_RADIUS,
        target + FIRST_RADIUS,
        theta_terms=4,
    )
    # The omitted theta tail is uniform on the positive ball.  The beta
    # exponential is largest at its left endpoint.
    omitted = (
        4 * FIRST_RADIUS
        * (-(target - FIRST_RADIUS) / 2).exp()
        * theta.THETA_TAIL
    )
    beta_ball_upper = arb((arb(partial.upper()) + omitted).upper())
    deficit = arb((atom_lower - beta_ball_upper).lower())
    assert deficit > 0
    return target, arb(atom_lower.lower()), beta_ball_upper, deficit


def second_arrow_halfline_obstruction():
    # Reuse the independently audited complete arch and prime upper bounds,
    # changing only their explicit Hall radius and half-line endpoint.
    second.TARGET_D = SECOND_RADIUS
    second.DEMAND_RIGHT = SECOND_DEMAND_RIGHT
    second.CAPACITY_RIGHT = SECOND_DEMAND_RIGHT + SECOND_RADIUS
    assert second.CAPACITY_RIGHT.contains(q(239, 400))
    assert second.CAPACITY_RIGHT < second.X

    demand_lower = second.beta_demand_lower()
    _partial, _compact_tail, _far_tail, arch_upper = (
        second.arch_capacity_upper()
    )
    _prime_partial, _prime_tail, prime_upper = (
        second.prime_capacity_upper()
    )
    capacity_upper = arch_upper + prime_upper
    deficit = arb((demand_lower - capacity_upper).lower())
    assert deficit > 0
    return demand_lower, arch_upper, prime_upper, capacity_upper, deficit


def main() -> None:
    assert (FIRST_RADIUS + SECOND_RADIUS).contains(q(1, 2))
    first_target, atom_lower, beta_ball_upper, first_deficit = (
        first_arrow_atom_obstruction()
    )
    (
        second_demand,
        second_arch,
        second_prime,
        second_capacity,
        second_deficit,
    ) = second_arrow_halfline_obstruction()

    print("precision_bits:", ctx.prec)
    print("first_source_y:", FIRST_Y)
    print("first_q3_target:", first_target)
    print("first_test_radius:", FIRST_RADIUS)
    print("q3_atom_mass_lower:", atom_lower)
    print("beta_ball_mass_upper:", beta_ball_upper)
    print("first_arrow_Hall_deficit_lower:", first_deficit)
    print("second_anchor_x:", second.X)
    print("second_test_radius:", SECOND_RADIUS)
    print("second_Hall_interval:", ("-infinity", SECOND_DEMAND_RIGHT))
    print("second_beta_demand_lower:", second_demand)
    print("second_selected_arch_upper:", second_arch)
    print("second_complete_prime_upper:", second_prime)
    print("second_complete_capacity_upper:", second_capacity)
    print("second_arrow_Hall_deficit_lower:", second_deficit)
    print("radius_lower_bound_sum:", FIRST_RADIUS + SECOND_RADIUS)
    print("colored_beta_radius_rebalance_obstructed: PASS")


if __name__ == "__main__":
    main()
