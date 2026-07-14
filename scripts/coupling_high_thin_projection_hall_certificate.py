#!/usr/bin/env python3
"""Exact projection Hall obstruction for the repaired high thin funnel.

Put

    c(u,v)=|m|+(r-2|m|)_+/4,  m=(u+v)/2, r=|u-v|,

and consider the proposed target

    F={c<1/5} union {r<13/50 and c<18/25}.                 (1)

At the source ``(m,r)=(2,1/5)``, the two coordinates are
``x=19/10`` and ``y=21/10``.  Every coordinate of a point in F belongs to

    B=(-17/20,17/20).                                      (2)

Indeed, ``c<1/5`` implies both coordinates have modulus below ``2/5``.
On the second branch, a same-sign pair has coordinate modulus below
``18/25+(13/50)/2=17/20``; an opposite-sign pair has coordinate modulus
below its separation, hence below ``13/50``.  Since x and y are outside B,
no one-coordinate jump can enter F.  Consequently every entrance consumes
both marginals inside B, and its rate is at most ``nu_y(B)``.

This certificate evaluates the *complete* physical y-marginal capacity:

    nu_y(B)=1/cosh(y/2) [integral_B K(z)J(y-z)dz
      + sum_q Lambda(q)q^(-1/2)K(y-log(q)) 1_B(y-log(q))].  (3)

There are exactly ten prime-power terms in (3):

    q=4,5,7,8,9,11,13,16,17,19.

The archimedean integral of the first four positive theta terms is enclosed
directly by Arb's validated complex integration, split at zero so no absolute
value or branch is present.  The omitted positive theta tail is bounded
uniformly by a displayed geometric majorant.  Prime terms use the same four
terms plus the same tail bound.  The output proves ``nu_y(B)<1/2`` with a
strict interval reserve.  This is a continuum Hall cut, not an inference
from the finite discovery LP.

Reproduce with

    PYTHONPATH=/tmp/pvdeps:scripts python3 -u \
      scripts/coupling_high_thin_projection_hall_certificate.py
"""

from __future__ import annotations

from flint import acb, arb, ctx


ctx.prec = 240


def q(numerator: int, denominator: int = 1) -> arb:
    return arb(numerator) / denominator


PI = arb.pi()
SOURCE_X = q(19, 10)
SOURCE_Y = q(21, 10)
TARGET_RADIUS = q(17, 20)
HALF = q(1, 2)
PRIME_POWERS = (
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


# For n>=5 and t>=0, the nth positive theta term is at most
# 20*n^4*exp(-3*n^2).  Consecutive majorants have ratio at most the value
# below.  Thus THETA_TAIL bounds sum_{n>=5} K_n(t) uniformly on t>=0.
FIRST_TAIL = 20 * arb(5) ** 4 * (-arb(3) * 25).exp()
TAIL_RATIO = q(6, 5) ** 4 * (-arb(3) * 11).exp()
assert TAIL_RATIO < 1
THETA_TAIL = FIRST_TAIL / (1 - TAIL_RATIO)
assert THETA_TAIL < arb("1e-28")


def theta_partial_real(t: arb) -> arb:
    """The first four positive-branch theta summands at t>=0."""

    assert t >= 0
    total = arb(0)
    for n in range(1, 5):
        nn = arb(n * n)
        v = PI * nn * (2 * t).exp()
        total += (
            PI
            * nn
            * (q(5, 2) * t).exp()
            * (2 * v - 3)
            * (-v).exp()
        )
    return total


def theta_partial_complex(z: acb) -> acb:
    """Entire continuation of the first four positive-branch terms."""

    total = acb(0)
    for n in range(1, 5):
        nn = n * n
        v = acb(PI * nn) * (2 * z).exp()
        total += (
            acb(PI * nn)
            * (acb(5) * z / 2).exp()
            * (2 * v - 3)
            * (-v).exp()
        )
    return total


def levy_complex(h: acb) -> acb:
    """Meromorphic Levy shape; the integration path stays pole-free."""

    return (-h / 2).exp() / (1 - (-2 * h).exp())


def arch_partial_integral() -> arb:
    """Validated integral of theta terms n=1,...,4 over B."""

    source = acb(SOURCE_Y)

    def positive_integrand(z: acb, analytic: bool) -> acb:
        # This expression is meromorphic and has no pole on or near the
        # real path: Re(source-z)>=SOURCE_Y-TARGET_RADIUS=5/4.
        del analytic
        return theta_partial_complex(z) * levy_complex(source - z)

    def negative_integrand(t: acb, analytic: bool) -> acb:
        del analytic
        # z=-t and K(-t)=K(t).
        return theta_partial_complex(t) * levy_complex(source + t)

    options = dict(
        abs_tol=arb("1e-55"),
        rel_tol=arb("1e-55"),
        eval_limit=100_000,
    )
    positive = acb.integral(
        positive_integrand, arb(0), TARGET_RADIUS, **options
    )
    negative = acb.integral(
        negative_integrand, arb(0), TARGET_RADIUS, **options
    )
    assert positive.imag == 0 and negative.imag == 0
    return positive.real + negative.real


def arch_mass_upper() -> tuple[arb, arb, arb]:
    """Return partial integral, omitted-tail bound, normalized upper mass."""

    partial = arch_partial_integral()
    # J is decreasing on (0,infinity); y-z is smallest at z=TARGET_RADIUS.
    closest_distance = SOURCE_Y - TARGET_RADIUS
    assert closest_distance.contains(q(5, 4))
    j_max = (-closest_distance / 2).exp() / (
        1 - (-2 * closest_distance).exp()
    )
    omitted = 2 * TARGET_RADIUS * THETA_TAIL * j_max
    normalizer = (SOURCE_Y / 2).cosh()
    upper = (arb(partial.upper()) + omitted) / normalizer
    return partial, omitted, upper


def prime_mass_upper() -> arb:
    """Complete prime-power mass into B, with rigorous kernel upper bounds."""

    lower_log = SOURCE_Y - TARGET_RADIUS
    upper_log = SOURCE_Y + TARGET_RADIUS
    assert lower_log.contains(q(5, 4))
    assert upper_log.contains(q(59, 20))
    # Hence an eligible integer q satisfies 4<=q<=19.  The hard-coded list
    # is precisely the elementary enumeration of prime powers in that range.
    assert lower_log.exp() > 3
    assert upper_log.exp() < 20
    assert SOURCE_Y + arb(2).log() > TARGET_RADIUS  # no outward target

    normalizer = (SOURCE_Y / 2).cosh()
    total = arb(0)
    for power, prime in PRIME_POWERS:
        target = SOURCE_Y - arb(power).log()
        assert -TARGET_RADIUS < target < TARGET_RADIUS
        argument = abs(target)
        kernel_upper = arb(theta_partial_real(argument).upper()) + THETA_TAIL
        total += (
            arb(prime).log()
            / arb(power).sqrt()
            * kernel_upper
            / normalizer
        )

    # Adjacent prime powers are outside B, proving completeness at the two
    # endpoints without relying on floating comparisons.
    assert SOURCE_Y - arb(3).log() > TARGET_RADIUS
    assert SOURCE_Y - arb(23).log() < -TARGET_RADIUS
    return total


def main() -> None:
    # Exact source/target geometry used by the Hall argument.
    assert SOURCE_X > TARGET_RADIUS and SOURCE_Y > TARGET_RADIUS
    assert (q(18, 25) + q(13, 100)).contains(TARGET_RADIUS)
    assert q(13, 50) < TARGET_RADIUS
    assert q(2, 5) < TARGET_RADIUS

    arch_partial, arch_tail, arch_upper = arch_mass_upper()
    prime_upper = prime_mass_upper()
    capacity_upper = arch_upper + prime_upper
    reserve = HALF - capacity_upper
    assert reserve > 0

    print("precision_bits:", ctx.prec)
    print("source_(m,r):", (arb(2), q(1, 5)))
    print("source_(x,y):", (SOURCE_X, SOURCE_Y))
    print("target_F: c<1/5 or (r<13/50 and c<18/25)")
    print("coordinate_projection_B:", (-TARGET_RADIUS, TARGET_RADIUS))
    print("prime_powers_in_B:", tuple(power for power, _ in PRIME_POWERS))
    print("arch_first_four_unnormalized_integral:", arch_partial)
    print("arch_omitted_theta_tail_upper:", arch_tail)
    print("arch_mass_upper:", arch_upper)
    print("prime_mass_upper:", prime_upper)
    print("complete_projection_capacity_upper:", capacity_upper)
    print("strict_Hall_reserve_below_half:", reserve)
    print("high_thin_projection_Hall_obstruction: PASS")


if __name__ == "__main__":
    main()
