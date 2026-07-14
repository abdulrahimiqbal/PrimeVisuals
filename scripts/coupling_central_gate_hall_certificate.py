#!/usr/bin/env python3
"""Exact Hall cuts for the proposed central annulus gate.

The requested selected event is required to land in

    |m'| <= 17/50,        r' <= 99/100,

where m'=(u+v)/2 and r'=|u-v|.  Hence both target coordinates necessarily
belong to

    I=[-167/200,167/200].

At either source below, one coordinate lies outside I.  Every selected event
must therefore consume a jump of that coordinate into I, so its rate is at
most the corresponding one-particle jump mass Q_y(I).  This script encloses
that *entire* mass (all archimedean targets and all prime-power targets) and
proves it is strictly smaller than 1/2.

The two positive-side sources are

    (m,r)=(17/50,9/5),       y=m+r/2=31/25,
    (m,r)=(27/100,87/50),    y=m+r/2=57/50.

Reflection gives the negative-m counterparts.  Thus no marginal-correct
coupling can have selected rate >1/2 into this fixed central gate on the
whole closed annulus.  This is a Hall obstruction, not a sampled transport
failure.

Reproduction:

    PYTHONPATH=/tmp/pvdeps:scripts python3 \
      scripts/coupling_central_gate_hall_certificate.py
"""

from flint import arb, ctx

from coupling_shoulder_box_certificate import C, J, K_positive, q


ctx.prec = 200

TARGET_RADIUS = q(167, 200)
HALF = q(1, 2)


def interval_without_padding(left: arb, right: arb) -> arb:
    """Closed endpoint hull; callers keep its lower endpoint positive."""

    return arb((left + right) / 2, (right - left) / 2)


def arch_mass_upper(source: arb, cells: int) -> arb:
    """Upper Darboux sum for int_I J(|source-z|)K(z)/C(source) dz."""

    assert source > TARGET_RADIUS
    width = TARGET_RADIUS / cells

    # K is even and strictly decreasing on the positive half-line (the
    # audited theta identity U=-(log K)'>0).  The first cell is handled by
    # K(0), avoiding an interval with a one-ulp negative lower endpoint.
    k_zero = K_positive(arb(0))
    first_upper = (
        k_zero
        * (J(source - width) + J(source))
        / C(source)
    ).upper()
    total = arb(first_upper) * width

    # Evenness combines z=+t and z=-t on every remaining cell.  Since
    # source-TARGET_RADIUS>0, no Levy pole lies in the integration region.
    for index in range(1, cells):
        left = index * width
        t = interval_without_padding(left, left + width)
        integrand = (
            K_positive(t)
            * (J(source - t) + J(source + t))
            / C(source)
        )
        total += arb(integrand.upper()) * width
    return total


def prime_mass(source: arb) -> arb:
    """Exact complete prime-power mass into I."""

    # An inward q-target is source-log(q).  For both sources below,
    # exp(source-a)<2 and exp(source+a)<8.  Thus the only integers that can
    # occur are 2,...,7, and Lambda is nonzero exactly at 2,3,4,5,7.
    assert (source - TARGET_RADIUS).exp() < 2
    assert (source + TARGET_RADIUS).exp() < 8
    terms = ((2, 2), (3, 3), (4, 2), (5, 5), (7, 7))
    total = arb(0)
    for power, prime in terms:
        target = source - arb(power).log()
        assert abs(target) < TARGET_RADIUS
        total += (
            arb(prime).log()
            / arb(power).sqrt()
            * K_positive(abs(target))
            / C(source)
        )
    return total


def certify_source(name: str, source: arb, cells: int) -> arb:
    arch = arch_mass_upper(source, cells)
    prime = prime_mass(source)
    complete_mass = arch + prime
    reserve = HALF - complete_mass
    assert reserve > 0
    print(name + "_source:", source)
    print(name + "_arch_upper:", arch)
    print(name + "_prime_exact:", prime)
    print(name + "_complete_jump_mass_upper:", complete_mass)
    print(name + "_hall_reserve_below_half:", reserve)
    return reserve


def main() -> None:
    print("precision_bits:", ctx.prec)
    print("target_coordinate_interval:", -TARGET_RADIUS, TARGET_RADIUS)
    corner = certify_source("corner", q(31, 25), 131_072)
    interior = certify_source("m27_r174", q(57, 50), 327_680)
    assert min(corner, interior) > 0
    print("minimum_hall_reserve:", min(corner, interior))
    print("certificate: PASS")


if __name__ == "__main__":
    main()
