#!/usr/bin/env python3
"""Exact certificate for the sharp sampled terminal edge.

Put

    x=-1/5,  y=4/5,
    c(u,v)=|(u+v)/2|+(|u-v|-|u+v|)_+/4,
    S={c<=9/25 or |u-v|<=1/10}.

This file constructs a finite selected subcoupling from ``(x,y)`` into S
with rate strictly greater than 1/2.  It certifies the exact point singled
out by ``coupling_terminal_phase_chain_discovery.py``; it makes no uniform
source-box or reset/renewal claim.

The archimedean marginal at source s has density

    K(z) J(|z-s|)/C(s),
    C(s)=cosh(s/2),
    J(h)=sum_(k>=0) exp(-(2k+1/2)h),

and a q=p^a prime-power atom at ``s +/- log(q)`` has mass

    log(p)/sqrt(q) * K(s +/- log(q))/C(s).

For every selected continuous interval we retain only the positive finite
subdensity obtained from theta indices n<=4 and Levy indices k<80.  Thus no
upper estimate for an omitted tail is used in the selected rate.  Rational
subatoms are likewise explicitly smaller than their physical atoms.

The five mutually marginal-disjoint families are:

1. y-arch on (-13/25,18/25), and y q=2,3 negative atoms, with x held;
2. y-arch on (-18/25,-13/25), and a y q=4 negative subatom, paired against
   a submass of the x q=2 positive atom;
3. x-arch on (-909/1000,-71/100), and an x q=2 negative subatom, paired
   against a submass of the y q=5 negative atom;
4. x-arch on (7/10,9/10), and an x q=3 positive subatom, with y held;
5. x-arch on (63/100,69/100), translated by 99/1000 into a dominated
   y-arch subdensity on (729/1000,789/1000).

Writing the five selected one-dimensional measures as mu_i, the actual
two-coordinate subcoupling is

    delta_x (x) mu_1,
    delta_(x+log 2) (x) mu_2,
    mu_3 (x) delta_(y-log 5),
    mu_4 (x) delta_y,
    (identity, identity+99/1000)_# mu_5.

Here a delta at the unchanged physical source in families 1 and 4 denotes a
hold, not a jump-marginal atom.  The two cross-prime deltas are bounded by
their displayed physical capacities.  This explicitly identifies both
projections and proves marginal admissibility once the checks below pass.

Open interval endpoints have zero archimedean mass.  Families 1--2 share
only the endpoint -13/25; families 4--5 have a strict 1/100 gap.  All other
continuous target intervals are disjoint, and every listed prime channel is
used at most once.

Reproduce with

    PYTHONPATH=/tmp/pvdeps:scripts python3 -u \
      scripts/coupling_terminal_sharp_point_certificate.py
"""

from __future__ import annotations

from fractions import Fraction

from flint import arb, ctx

from coupling_exact_arch_integral import kernel_levy_integral_lower


ctx.prec = 240


def q(numerator: int, denominator: int = 1) -> arb:
    return arb(numerator) / denominator


PI = arb.pi()
X = -q(1, 5)
Y = q(4, 5)
TARGET_C = q(9, 25)
TARGET_R = q(1, 10)
THETA_TERMS = 4
LEVY_TERMS = 80
DOMINATION_CELLS = 256
TRANSLATION = q(99, 1000)

# Exact rational subatom masses.  Their domination by the corresponding
# physical prime-power atom is checked below.
Y_Q2_MINUS = q(1_818_458, 10_000_000)
Y_Q3_MINUS = q(1_085_885, 10_000_000)
Y_Q4_MINUS = q(295_265, 100_000_000)
X_Q2_MINUS = q(35_572, 10_000_000_000)
X_Q3_PLUS = q(38_432, 10_000_000_000)


def C(source: arb) -> arb:
    return (source / 2).cosh()


def interval(left: arb, right: arb) -> arb:
    assert right > left
    return arb((left + right) / 2, (right - left) / 2 + arb("1e-80"))


def K_partial_positive(t: arb) -> arb:
    """The exact positive n<=4 theta subseries of K(t), for t>0."""

    assert t > 0
    total = arb(0)
    for n in range(1, THETA_TERMS + 1):
        nn = arb(n * n)
        w = PI * nn * (2 * t).exp()
        term = PI * nn * (q(5, 2) * t).exp()
        term *= (2 * w - 3) * (-w).exp()
        assert term > 0
        total += term
    return total


# For n>=5, write a=pi*n^2 and Q=exp(2t)>=1.  The logarithmic derivative in Q
# of a*Q^(5/4)*(2*a*Q-3)*exp(-a*Q) is negative (bound its three terms by
# 5/4+2-a<0), so its maximum for t>=0 is at t=0.  There it is below
# 20*n^4*exp(-3*n^2).  The ratio of successive majorants is at most its n=5
# value.  This encloses the omitted theta tail whenever an exact physical
# prime-atom capacity, rather than merely a positive submass, is needed.
theta_tail_first = 20 * arb(5) ** 4 * (-arb(3) * 25).exp()
theta_tail_ratio = q(6, 5) ** 4 * (-arb(3) * 11).exp()
theta_tail_bound = theta_tail_first / (1 - theta_tail_ratio)
assert PI > 3
assert 2 * PI**2 < 20
assert theta_tail_bound < arb("1e-28")


def K_physical_positive(t: arb) -> arb:
    """Rigorous enclosure of the complete positive theta series K(t)."""

    return K_partial_positive(t) + arb(0, theta_tail_bound)


def J_partial(h: arb) -> arb:
    """Exact k<80 positive Levy subseries, evaluated in closed form."""

    assert h > 0
    numerator = (-h / 2).exp() * (1 - (-2 * LEVY_TERMS * h).exp())
    denominator = 1 - (-2 * h).exp()
    assert denominator > 0
    return numerator / denominator


def partial_arch_density(source: arb, target: arb) -> arb:
    assert target > 0
    distance = abs(target - source)
    assert distance > 0
    return K_partial_positive(target) * J_partial(distance) / C(source)


def partial_arch_mass(source: arb, left: arb, right: arb) -> arb:
    """Exact finite-positive-series submass on an interval off source."""

    return kernel_levy_integral_lower(
        source,
        left,
        right,
        levy_terms=LEVY_TERMS,
        theta_terms=THETA_TERMS,
    ) / C(source)


def prime_atom(source: arb, power: int, prime: int, direction: int) -> arb:
    assert direction in (-1, 1)
    target = source + direction * arb(power).log()
    return (
        arb(prime).log()
        / arb(power).sqrt()
        * K_physical_positive(abs(target))
        / C(source)
    )


def characteristic(u: arb, v: arb) -> arb:
    midpoint_abs = abs((u + v) / 2)
    separation = abs(u - v)
    excess = separation - 2 * midpoint_abs
    if excess < 0:
        excess = arb(0)
    return midpoint_abs + excess / 4


def characteristic_fraction(u: Fraction, v: Fraction) -> Fraction:
    """Exact rational version, used at zero-margin interval boundaries."""

    midpoint_abs = abs((u + v) / 2)
    separation = abs(u - v)
    return midpoint_abs + max(Fraction(0), separation - 2 * midpoint_abs) / 4


def translated_density_certificate() -> tuple[arb, arb]:
    """Prove f_y(u+.099)>=f_x(u) on the full rational interval."""

    left = q(63, 100)
    right = q(69, 100)
    width = (right - left) / DOMINATION_CELLS
    worst_difference = None
    worst_ratio = None
    for index in range(DOMINATION_CELLS):
        cell_left = left + index * width
        cell_right = cell_left + width
        u = interval(cell_left, cell_right)
        v = u + TRANSLATION
        x_density = partial_arch_density(X, u)
        y_density = partial_arch_density(Y, v)
        difference = y_density - x_density
        ratio = y_density / x_density
        assert difference > 0
        if worst_difference is None or difference.lower() < worst_difference:
            worst_difference = difference.lower()
        if worst_ratio is None or ratio.lower() < worst_ratio:
            worst_ratio = ratio.lower()
    assert worst_difference is not None and worst_ratio is not None
    assert worst_ratio > 1
    return worst_difference, worst_ratio


def geometry_audit() -> dict[str, arb]:
    """Exact interval/atom checks for all five target families."""

    log2 = arb(2).log()
    log3 = arb(3).log()
    log4 = arb(4).log()
    log5 = arb(5).log()

    x_q2_plus_target = X + log2
    x_q2_minus_target = X - log2
    x_q3_plus_target = X + log3
    y_q4_minus_target = Y - log4
    y_q5_minus_target = Y - log5

    assert characteristic_fraction(Fraction(-1, 5), Fraction(4, 5)) == Fraction(2, 5)
    assert Fraction(4, 5) - Fraction(-1, 5) == 1

    # Family 1: the open y interval has c<9/25; its two boundary points
    # have c=9/25.  The retained q=2,3 atoms are strict interior points.
    assert characteristic_fraction(Fraction(-1, 5), Fraction(-13, 25)) == Fraction(9, 25)
    assert characteristic_fraction(Fraction(-1, 5), Fraction(18, 25)) == Fraction(9, 25)
    assert characteristic(X, Y - log2) < TARGET_C
    assert characteristic(X, Y - log3) < TARGET_C

    # Family 2: x q=2+ is held fixed while the y target runs through the
    # open interval (-18/25,-13/25), or is its q=4- atom.  Opposite signs
    # reduce c to half the larger absolute coordinate.
    assert x_q2_plus_target > 0
    assert x_q2_plus_target < q(13, 25)
    # At v=-18/25, c=9/25 because |v| dominates x+log(2)<18/25.
    assert characteristic(x_q2_plus_target, -q(13, 25)) < TARGET_C
    assert -q(18, 25) < y_q4_minus_target < -q(13, 25)
    assert characteristic(x_q2_plus_target, y_q4_minus_target) < TARGET_C

    # Family 3 enters the strict 1/10 tube, uniformly on its open interval.
    left3 = -q(909, 1000)
    right3 = -q(71, 100)
    assert max(
        abs(left3 - y_q5_minus_target),
        abs(right3 - y_q5_minus_target),
    ) < TARGET_R
    assert abs(x_q2_minus_target - y_q5_minus_target) < TARGET_R

    # Family 4 also enters the tube; only the two zero-mass arch endpoints
    # are at equality.
    assert abs(Fraction(7, 10) - Fraction(4, 5)) == Fraction(1, 10)
    assert abs(Fraction(9, 10) - Fraction(4, 5)) == Fraction(1, 10)
    assert abs(x_q3_plus_target - Y) < TARGET_R

    # Family 5 has constant strict separation 99/1000.
    assert TRANSLATION < TARGET_R
    assert Fraction(63, 100) + Fraction(99, 1000) == Fraction(729, 1000)
    assert Fraction(69, 100) + Fraction(99, 1000) == Fraction(789, 1000)

    return {
        "x_q2_plus_target": x_q2_plus_target,
        "x_q2_minus_target": x_q2_minus_target,
        "x_q3_plus_target": x_q3_plus_target,
        "y_q4_minus_target": y_q4_minus_target,
        "y_q5_minus_target": y_q5_minus_target,
    }


def main() -> None:
    targets = geometry_audit()

    # Verify every rational subatom against its exact physical capacity.
    atom_capacities = {
        "y_q2_minus": prime_atom(Y, 2, 2, -1),
        "y_q3_minus": prime_atom(Y, 3, 3, -1),
        "y_q4_minus": prime_atom(Y, 4, 2, -1),
        "x_q2_minus": prime_atom(X, 2, 2, -1),
        "x_q3_plus": prime_atom(X, 3, 3, +1),
        "x_q2_plus": prime_atom(X, 2, 2, +1),
        "y_q5_minus": prime_atom(Y, 5, 5, -1),
    }
    assert Y_Q2_MINUS < atom_capacities["y_q2_minus"]
    assert Y_Q3_MINUS < atom_capacities["y_q3_minus"]
    assert Y_Q4_MINUS < atom_capacities["y_q4_minus"]
    assert X_Q2_MINUS < atom_capacities["x_q2_minus"]
    assert X_Q3_PLUS < atom_capacities["x_q3_plus"]

    y_arch_single = partial_arch_mass(Y, -q(13, 25), q(18, 25))
    y_arch_to_x_q2 = partial_arch_mass(Y, -q(18, 25), -q(13, 25))
    x_arch_to_y_q5 = partial_arch_mass(X, -q(909, 1000), -q(71, 100))
    x_arch_single = partial_arch_mass(X, q(7, 10), q(9, 10))
    x_arch_translated = partial_arch_mass(X, q(63, 100), q(69, 100))

    family_1 = y_arch_single + Y_Q2_MINUS + Y_Q3_MINUS
    family_2 = y_arch_to_x_q2 + Y_Q4_MINUS
    family_3 = x_arch_to_y_q5 + X_Q2_MINUS
    family_4 = x_arch_single + X_Q3_PLUS
    family_5 = x_arch_translated

    # Cross-atom capacity checks use the upper endpoint of the exact selected
    # finite submass and the lower endpoint of the complete physical atom.
    assert family_2.upper() < atom_capacities["x_q2_plus"].lower()
    assert family_3.upper() < atom_capacities["y_q5_minus"].lower()

    worst_difference, worst_ratio = translated_density_certificate()

    # The interval ledger is marginal-disjoint.  These rational inequalities
    # record its only shared boundaries/gaps; endpoints carry zero density.
    assert -q(18, 25) < -q(13, 25) < q(18, 25) < q(729, 1000)
    assert -q(909, 1000) < -q(71, 100) < q(63, 100)
    assert q(69, 100) < q(7, 10) < q(9, 10)
    prime_channels = (
        "y-q2-", "y-q3-", "y-q4-", "x-q2+",
        "x-q2-", "y-q5-", "x-q3+",
    )
    assert len(prime_channels) == len(set(prime_channels))

    selected_rate = family_1 + family_2 + family_3 + family_4 + family_5
    assert selected_rate > q(1, 2)

    print("precision_bits:", ctx.prec)
    print("source_(x,y):", X, Y)
    print("target: c<=9/25 or separation<=1/10")
    print("endpoint_policy: open arch intervals; endpoints have zero mass")
    print("prime_targets:", targets)
    print("selected_rational_subatoms:", {
        "y_q2_minus": Y_Q2_MINUS,
        "y_q3_minus": Y_Q3_MINUS,
        "y_q4_minus": Y_Q4_MINUS,
        "x_q2_minus": X_Q2_MINUS,
        "x_q3_plus": X_Q3_PLUS,
    })
    print("physical_prime_capacities:", atom_capacities)
    print("theta_tail_bound_for_physical_atoms:", theta_tail_bound)
    print("family_1_y_singles:", family_1)
    print("family_2_y_to_x_q2_plus:", family_2)
    print("family_2_capacity_x_q2_plus:", atom_capacities["x_q2_plus"])
    print("family_3_x_to_y_q5_minus:", family_3)
    print("family_3_capacity_y_q5_minus:", atom_capacities["y_q5_minus"])
    print("family_4_x_singles:", family_4)
    print("family_5_translated_arch:", family_5)
    print("translated_density_worst_difference_lower:", worst_difference)
    print("translated_density_worst_ratio_lower:", worst_ratio)
    print("selected_rate:", selected_rate)
    print("margin_over_half:", selected_rate - q(1, 2))
    print("CERTIFIED: exact sharp-point S_.40 -> S_.36 rate exceeds 1/2")


if __name__ == "__main__":
    main()
