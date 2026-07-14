#!/usr/bin/env python3
"""Exact Hall obstruction to the mandatory two-color beta target.

Let ``x=-3/5``, ``D=177/500``, and let the proposed positive-orientation
target capacity be

    nu_x^prime
      + (1_{u<=x+3/10} + (51/100)1_{u>x+3/10}) nu_x^arch
      + (1/2) delta_x.

For the beta-plus Hall half-line

    I=[-6/25,infinity),       I^D=[-297/500,infinity),

the holding atom is absent.  Reflecting ``u -> -u`` sends ``x`` to ``3/5``
and the arch part of ``I^D`` to ``(-infinity,297/500]``.  Its two-color
capacity is exactly

    (51/100) nu_{3/5}^arch((-infinity,297/500])
      + (49/100) nu_{3/5}^arch([3/10,297/500]).

The first term is the validated global 51/100 arch bound from
``coupling_half_arch_beta_full_falsifier``.  The second is the validated
spatial increment from ``coupling_mandatory_spatial_beta_falsifier``.
The same two certificates respectively enclose the complete reflected prime
capacity and lower-bound the beta demand.  Combining their outward-rounded
Arb bounds proves a strict Hall deficit.  Endpoint conventions do not matter
because the arch measure is absolutely continuous.

Thus the spatial full/51-percent coloring still cannot receive the complete
beta-plus measure at radius 177/500.  This certificate does not rule out a
coupling tailored to a proper beta submeasure produced by the first arrow.
"""

from __future__ import annotations

from flint import arb, ctx

import coupling_half_arch_beta_full_falsifier as global_half
import coupling_mandatory_spatial_beta_falsifier as spatial


ctx.prec = 240


def q(numerator: int, denominator: int = 1) -> arb:
    return arb(numerator) / denominator


EXTRA_FRACTION = q(49, 100)


def main() -> None:
    assert spatial.X.contains(-q(3, 5))
    assert spatial.TARGET_D.contains(q(177, 500))
    assert spatial.DEMAND_LEFT.contains(-q(6, 25))
    assert spatial.CAPACITY_LEFT.contains(-q(297, 500))
    assert spatial.ARCH_RIGHT.contains(-q(3, 10))
    assert global_half.X.contains(q(3, 5))
    assert global_half.CAPACITY_RIGHT.contains(q(297, 500))
    assert global_half.ARCH_FRACTION.contains(q(51, 100))

    demand_lower = spatial.beta_demand_lower()

    (
        global_arch_partial,
        global_arch_compact_tail,
        global_arch_far_tail,
        global_arch_51_upper,
    ) = global_half.arch_capacity_upper()
    (
        spatial_arch_partial,
        spatial_arch_tail,
        spatial_arch_full_upper,
    ) = spatial.arch_capacity_upper()
    prime_partial, prime_tail, prime_upper = global_half.prime_capacity_upper()

    spatial_extra_upper = arb(
        (EXTRA_FRACTION * spatial_arch_full_upper).upper()
    )
    two_color_arch_upper = arb(
        (global_arch_51_upper + spatial_extra_upper).upper()
    )
    total_capacity_upper = arb((two_color_arch_upper + prime_upper).upper())
    deficit_lower = arb((demand_lower - total_capacity_upper).lower())
    assert deficit_lower > 0

    print("precision_bits:", ctx.prec)
    print("anchor_x:", spatial.X)
    print("target_distance:", spatial.TARGET_D)
    print("beta_plus_Hall_interval:", (spatial.DEMAND_LEFT, "infinity"))
    print("capacity_neighborhood:", (spatial.CAPACITY_LEFT, "infinity"))
    print("full_arch_region:", ("-infinity", spatial.ARCH_RIGHT))
    print("51_percent_arch_region:", (spatial.ARCH_RIGHT, "infinity"))
    print("beta_demand_lower:", demand_lower)
    print("global_arch_first_four_partial_integral:", global_arch_partial)
    print("global_arch_compact_theta_tail_upper:", global_arch_compact_tail)
    print("global_arch_far_negative_tail_upper:", global_arch_far_tail)
    print("global_51_percent_arch_capacity_upper:", global_arch_51_upper)
    print("spatial_increment_first_four_partial_integral:", spatial_arch_partial)
    print("spatial_increment_theta_tail_upper:", spatial_arch_tail)
    print("spatial_increment_full_capacity_upper:", spatial_arch_full_upper)
    print("spatial_increment_49_percent_capacity_upper:", spatial_extra_upper)
    print("complete_two_color_arch_capacity_upper:", two_color_arch_upper)
    print("prime_partial_capacity_upper:", prime_partial)
    print("prime_all_integer_tail_upper:", prime_tail)
    print("complete_prime_capacity_upper:", prime_upper)
    print("complete_capacity_upper:", total_capacity_upper)
    print("strict_Hall_deficit_lower:", deficit_lower)
    print("mandatory_two_color_full_beta_target_falsified: PASS")


if __name__ == "__main__":
    main()
