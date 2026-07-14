#!/usr/bin/env python3
"""Exact Hall cut against the mandatory spatial beta target.

The proposed positive-orientation target kept the complete prime measure and
only the arch density on ``u<=x+3/10``, together with a half holding atom.
At ``x=-3/5`` and ``D=177/500`` take

    I=[-6/25,infinity),        I^D=[-297/500,infinity).

The hold at ``x=-3/5`` lies outside ``I^D``.  The allowed arch part inside
``I^D`` is exactly ``[-297/500,-3/10]``.  Every inward prime target lies
below ``I^D`` and every outward prime target lies inside it.  Reflection
turns the latter complete sum into the inward-prime sum at ``x=+3/5``.

This certificate proves that beta-plus mass of I exceeds the complete
available capacity.  It therefore falsifies the full-beta spatial shortcut;
it does not rule out a coupling tailored to the actual beta submeasure
produced by a finite-y inward-prime law.
"""

from __future__ import annotations

from flint import acb, arb, ctx

import coupling_exact_arch_integral as exact_integral
import coupling_half_arch_beta_full_falsifier as prime_helper
import coupling_high_thin_projection_hall_certificate as theta


ctx.prec = 240


def q(numerator: int, denominator: int = 1) -> arb:
    return arb(numerator) / denominator


X = -q(3, 5)
REFLECTED_X = -X
TARGET_D = q(177, 500)
DEMAND_LEFT = -q(6, 25)
CAPACITY_LEFT = DEMAND_LEFT - TARGET_D
ARCH_RIGHT = X + q(3, 10)
TRUNCATION = arb(3)


def beta_demand_lower() -> arb:
    # Reflecting z -> -z converts beta_+([-.24,infinity)) into
    # beta_-((-infinity,.24]).  Retain only [-3,.24] and theta n<=4.
    value = 2 * exact_integral.kernel_exponential_integral(
        q(1, 2), -TRUNCATION, -DEMAND_LEFT, theta_terms=4
    )
    return arb(value.lower())


def arch_capacity_upper() -> tuple[arb, arb, arb]:
    # Reflect u -> -u.  The interval [-.594,-.3] becomes [.3,.594]
    # at source +.6, wholly to the left of that source.
    left = -ARCH_RIGHT
    right = -CAPACITY_LEFT
    source = acb(REFLECTED_X)

    def integrand(z: acb, analytic: bool) -> acb:
        del analytic
        return theta.theta_partial_complex(z) * theta.levy_complex(source - z)

    partial = acb.integral(
        integrand,
        left,
        right,
        abs_tol=arb("1e-55"),
        rel_tol=arb("1e-55"),
        eval_limit=100_000,
    )
    assert partial.imag == 0
    closest = REFLECTED_X - right
    assert closest.contains(q(3, 500))
    omitted = (
        (right - left)
        * theta.THETA_TAIL
        * prime_helper.levy(closest)
    )
    normalized = (
        arb(partial.real.upper()) + omitted
    ) / (REFLECTED_X / 2).cosh()
    return partial.real, omitted, arb(normalized.upper())


def main() -> None:
    assert CAPACITY_LEFT.contains(-q(297, 500))
    assert ARCH_RIGHT.contains(-q(3, 10))
    assert X < CAPACITY_LEFT < ARCH_RIGHT
    # q=2 already places the two signed prime directions on opposite sides
    # of the capacity endpoint; monotonicity in log q handles every q>=2.
    assert X - arb(2).log() < CAPACITY_LEFT
    assert X + arb(2).log() > CAPACITY_LEFT

    demand_lower = beta_demand_lower()
    arch_partial, arch_tail, arch_upper = arch_capacity_upper()
    prime_partial, prime_tail, prime_upper = (
        prime_helper.prime_capacity_upper()
    )
    capacity_upper = arch_upper + prime_upper
    deficit_lower = arb((demand_lower - capacity_upper).lower())
    assert deficit_lower > 0

    print("precision_bits:", ctx.prec)
    print("anchor_x:", X)
    print("target_distance:", TARGET_D)
    print("beta_plus_Hall_interval:", (DEMAND_LEFT, "infinity"))
    print("capacity_neighborhood:", (CAPACITY_LEFT, "infinity"))
    print("allowed_arch_interval_in_neighborhood:", (CAPACITY_LEFT, ARCH_RIGHT))
    print("beta_demand_lower:", demand_lower)
    print("arch_first_four_partial_integral:", arch_partial)
    print("arch_omitted_theta_tail_upper:", arch_tail)
    print("complete_arch_capacity_upper:", arch_upper)
    print("prime_partial_capacity_upper:", prime_partial)
    print("prime_all_integer_tail_upper:", prime_tail)
    print("complete_outward_prime_capacity_upper:", prime_upper)
    print("complete_capacity_upper:", capacity_upper)
    print("strict_Hall_deficit_lower:", deficit_lower)
    print("mandatory_spatial_full_beta_shortcut_falsified: PASS")


if __name__ == "__main__":
    main()
