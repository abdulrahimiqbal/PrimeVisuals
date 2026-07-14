#!/usr/bin/env python3
"""Exact Hall obstruction to the 51/100-arch beta transport.

Let ``x=3/5``, ``D=177/500``, and

    beta_+(dz)=2 exp(-z/2) K(z) dz,
    kappa_x=nu_x^prime+(51/100)nu_x^arch+(1/2)delta_x.

For the half-line ``I=(-infinity,6/25]`` its D-neighbourhood is
``I^D=(-infinity,297/500]``.  Since ``297/500<3/5``, the holding atom is
absent.  This certificate proves

    beta_+(I) > kappa_x(I^D),

so no beta-to-kappa coupling supported at distance at most D exists.  This
is a continuum Hall cut and rules out mesh refinement as a repair.

The beta lower bound retains the first four positive theta terms on
``[-3,6/25]``.  The arch upper bound uses validated Arb integration of the
same four terms on ``[-3,297/500]``, a uniform positive-theta-tail bound on
that compact interval, and an analytic geometric bound on the complete
negative tail.  Every inward prime power through 29 is evaluated with an
upper kernel bound; all remaining prime powers are overcounted by all
integers n>=30 using ``Lambda(n)<=log(n)<=n`` and a geometric Gaussian tail.
Outward prime targets and the hold lie strictly outside ``I^D``.
"""

from __future__ import annotations

from math import isqrt

from flint import acb, arb, ctx

import coupling_exact_arch_integral as exact_integral
import coupling_high_thin_projection_hall_certificate as theta


ctx.prec = 240


def q(numerator: int, denominator: int = 1) -> arb:
    return arb(numerator) / denominator


PI = arb.pi()
X = q(3, 5)
TARGET_D = q(177, 500)
DEMAND_RIGHT = q(6, 25)
CAPACITY_RIGHT = DEMAND_RIGHT + TARGET_D
ARCH_FRACTION = q(51, 100)
TRUNCATION = arb(3)
PRIME_CUTOFF = 29


def levy(h: arb) -> arb:
    assert h > 0
    return (-h / 2).exp() / (1 - (-2 * h).exp())


def prime_power_data(limit: int) -> tuple[tuple[int, int], ...]:
    sieve = bytearray(b"\x01") * (limit + 1)
    sieve[0:2] = b"\x00\x00"
    for prime in range(2, isqrt(limit) + 1):
        if sieve[prime]:
            sieve[prime * prime : limit + 1 : prime] = b"\x00" * (
                (limit - prime * prime) // prime + 1
            )
    result = []
    for prime in range(2, limit + 1):
        if not sieve[prime]:
            continue
        power = prime
        while power <= limit:
            result.append((power, prime))
            if power > limit // prime:
                break
            power *= prime
    result.sort()
    return tuple(result)


PRIME_DATA = prime_power_data(PRIME_CUTOFF)


def beta_demand_lower() -> arb:
    # Omitting z<-3 and every theta term n>=5 only lowers beta_+(I).
    value = 2 * exact_integral.kernel_exponential_integral(
        -q(1, 2), -TRUNCATION, DEMAND_RIGHT, theta_terms=4
    )
    assert value > 0
    return arb(value.lower())


def arch_partial_integral() -> arb:
    source = acb(X)

    def positive(z: acb, analytic: bool) -> acb:
        del analytic
        return theta.theta_partial_complex(z) * theta.levy_complex(source - z)

    def negative(t: acb, analytic: bool) -> acb:
        del analytic
        return theta.theta_partial_complex(t) * theta.levy_complex(source + t)

    options = dict(
        abs_tol=arb("1e-55"),
        rel_tol=arb("1e-55"),
        eval_limit=100_000,
    )
    negative_value = acb.integral(
        negative, arb(0), TRUNCATION, **options
    )
    positive_value = acb.integral(
        positive, arb(0), CAPACITY_RIGHT, **options
    )
    assert negative_value.imag == 0 and positive_value.imag == 0
    return negative_value.real + positive_value.real


def arch_far_negative_tail_upper() -> arb:
    """Upper bound for integral_3^infinity K(t)J(x+t)dt."""

    t = TRUNCATION
    scale = PI * (2 * t).exp()
    denominator = 1 - 16 * (-3 * scale).exp()
    assert denominator > 0
    kernel_upper = (
        2 * PI**2 * (q(9, 2) * t - scale).exp() / denominator
    )
    first = kernel_upper * levy(X + t)
    # The kernel scale is multiplied by exp(2) when t increases by one.
    ratio = (4 - scale * ((arb(2)).exp() - 1)).exp()
    assert ratio < 1
    return (first / (1 - ratio)).upper()


def arch_capacity_upper() -> tuple[arb, arb, arb, arb]:
    partial = arch_partial_integral()
    closest = X - CAPACITY_RIGHT
    assert closest > 0
    compact_tail = (
        (TRUNCATION + CAPACITY_RIGHT)
        * theta.THETA_TAIL
        * levy(closest)
    )
    far_tail = arch_far_negative_tail_upper()
    normalized = (
        ARCH_FRACTION
        * (arb(partial.upper()) + compact_tail + far_tail)
        / (X / 2).cosh()
    )
    return partial, compact_tail, far_tail, arb(normalized.upper())


def prime_capacity_upper() -> tuple[arb, arb, arb]:
    normalizer = (X / 2).cosh()
    partial = arb(0)
    for power, prime in PRIME_DATA:
        target = X - arb(power).log()
        kernel_upper = (
            arb(theta.theta_partial_real(abs(target)).upper())
            + theta.THETA_TAIL
        )
        partial += (
            arb(prime).log() / arb(power).sqrt()
            * kernel_upper / normalizer
        )

    # Complete tail overcount.  For t=log(n)-x and
    # A=pi*n^2*exp(-2x), the standard theta majorant gives
    # Lambda(n)n^(-1/2)K(t)
    # <=2pi^2 exp(-9x/2)n^5 exp(-A)/(1-16exp(-3A)).
    n = arb(PRIME_CUTOFF + 1)
    coefficient = PI * (-2 * X).exp()
    scale = coefficient * n**2
    denominator = 1 - 16 * (-3 * scale).exp()
    assert denominator > 0
    first = (
        2 * PI**2 * (-q(9, 2) * X).exp()
        * n**5 * (-scale).exp()
        / (normalizer * denominator)
    )
    ratio = (
        ((n + 1) / n) ** 5
        * (-coefficient * (2 * n + 1)).exp()
    )
    assert ratio < 1
    tail = first / (1 - ratio)
    total = arb((partial + tail).upper())
    return arb(partial.upper()), arb(tail.upper()), total


def main() -> None:
    assert CAPACITY_RIGHT.contains(q(297, 500))
    assert CAPACITY_RIGHT < X
    assert X + arb(2).log() > CAPACITY_RIGHT
    assert X - arb(2).log() < CAPACITY_RIGHT
    assert tuple(power for power, _prime in PRIME_DATA) == (
        2, 3, 4, 5, 7, 8, 9, 11, 13, 16, 17, 19, 23, 25, 27, 29
    )

    demand_lower = beta_demand_lower()
    arch_partial, arch_compact_tail, arch_far_tail, arch_upper = (
        arch_capacity_upper()
    )
    prime_partial, prime_tail, prime_upper = prime_capacity_upper()
    capacity_upper = arch_upper + prime_upper
    deficit_lower = arb((demand_lower - capacity_upper).lower())
    assert deficit_lower > 0

    print("precision_bits:", ctx.prec)
    print("anchor_x:", X)
    print("target_distance:", TARGET_D)
    print("Hall_interval_I:", ("-infinity", DEMAND_RIGHT))
    print("Hall_neighborhood_I_D:", ("-infinity", CAPACITY_RIGHT))
    print("selected_arch_fraction:", ARCH_FRACTION)
    print("beta_demand_lower:", demand_lower)
    print("arch_first_four_partial_integral:", arch_partial)
    print("arch_compact_theta_tail_upper:", arch_compact_tail)
    print("arch_far_negative_tail_upper:", arch_far_tail)
    print("selected_arch_capacity_upper:", arch_upper)
    print("prime_powers_through_29:", tuple(power for power, _ in PRIME_DATA))
    print("prime_partial_capacity_upper:", prime_partial)
    print("prime_all_integer_tail_upper:", prime_tail)
    print("complete_prime_capacity_upper:", prime_upper)
    print("complete_capacity_upper:", capacity_upper)
    print("strict_Hall_deficit_lower:", deficit_lower)
    print("51_over_100_arch_beta_transport_falsified: PASS")


if __name__ == "__main__":
    main()
