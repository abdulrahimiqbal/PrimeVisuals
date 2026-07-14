#!/usr/bin/env python3
"""Exact mixed compact-anchor versus remote-beta Hall certificate.

For ``|x| <= 6`` let the available anchor marginal consist of

* the archimedean density
  ``a_x(u)=K(u)J(|u-x|)/cosh(x/2)``;
* the prime-power atoms at ``x +/- log(q)``, of physical weight
  ``Lambda(q)q^(-1/2)K(x +/- log(q))/cosh(x/2)``; and
* a free holding atom at x (an asynchronous jump of the other coordinate).

The other marginal is either of the mass-one-half tail laws

    beta_+(dz)=2 exp(-z/2)K(z)dz,
    beta_-(dz)=2 exp(+z/2)K(z)dz.

This program constructs an exact selected subcoupling of rate ``499/1000``
supported on ``|u-z|<3/10``.  It does **not** claim the full half-mass Hall
statement.  At remote compact anchors the usable prime and arch capacities
balance one half extremely closely, so rounded finite ledgers cannot certify
that endpoint merely by increasing precision.

For reference, the two beta tails admit an exact untruncated transport.  For
``z>=3/2`` send z to
``u=z-1/10``; reflect this map on the left.  A first-theta-term lower bound,
a geometric theta upper bound, ``J(h)>=exp(-h/2)``, and ``|x|<=6`` prove
pointwise domination for both beta signs.  These maps use only arch density
on ``(-infinity,-7/5] union [7/5,infinity)``.

For the certified rate, beta on [-3/2,3/2] is split into bins and a dominated
submeasure of total mass 499/1000 is retained.  The middle arch density is
split into disjoint target bins in (-7/5,7/5); finitely many prime-power atoms
and the holding atom are added.  Source-x cells use uniform lower capacities,
rounded strictly down to exact Fractions.  Every retained beta-bin mass is
bounded below by a composite-midpoint enclosure and rounded down.

This finite matching is not solved by a generic LP.  Each supply node can
serve a contiguous interval of ordered beta bins.  The standard exact Hall
greedy algorithm scans beta bins from left to right and always consumes the
available supply whose right endpoint expires first.  The exchange argument
is elementary: if a later-expiring node is used while an earlier-expiring
one is idle, swap their allocations at the current bin; the later node is
available at every subsequent bin at which the earlier node was available.
Induction proves that the greedy succeeds iff the interval-Hall inequalities
hold.  All arithmetic in this scan is exact.

Reflection sends ``(x,beta_+)`` to ``(-x,beta_-)``.  Hence the two beta signs
on x in [0,6] certify both signs throughout [-6,6].

Reproduce with

    PYTHONPATH=/tmp/pvdeps:scripts python3 -u \
      scripts/coupling_mixed_anchor_beta_hall_certificate.py
"""

from __future__ import annotations

from dataclasses import dataclass
from fractions import Fraction
import heapq
from math import ceil, floor, isqrt

from flint import arb, ctx

import coupling_anchor_beta_transport_certificate as beta_base
import coupling_beta_quantile_transport_certificate as curvature_base


ctx.prec = 200


def q(numerator: int, denominator: int = 1) -> arb:
    return arb(numerator) / denominator


S = arb(6)
TARGET_D = q(3, 10)
MIDDLE_D = q(299, 1000)
SELECTED_RATE = Fraction(499, 1000)
TAIL_SHIFT = q(1, 10)
BETA_BOUND = q(3, 2)
ARCH_BOUND = q(7, 5)

X_BASE_CELLS = 120            # base width 1/20; split adaptively
MAX_X_DEPTH = 7
DEMAND_BINS = 600             # width 1/200
DEMAND_QUADRATURE_SUBCELLS = 4
ARCH_BINS = 560               # width 1/200
PRIME_SUBCELLS = 8
Q_MAX = 2600


def interval(left: arb, right: arb) -> arb:
    assert right > left
    return arb((left + right) / 2, (right - left) / 2 + arb("1e-65"))


def C(x: arb) -> arb:
    return (x / 2).cosh()


def J(h: arb) -> arb:
    assert h > 0
    return (-h / 2).exp() / (1 - (-2 * h).exp())


def kernel_lower_upper(argument: arb) -> tuple[arb, arb]:
    return beta_base.kernel_bounds(argument)


def absolute_upper(value: arb) -> arb:
    return max(abs(value.lower()), abs(value.upper()))


def nonnegative_absolute_enclosure(value: arb) -> arb:
    if value >= 0:
        return value
    if value <= 0:
        return -value
    return interval(arb(0), absolute_upper(value))


def theta_triplet_positive(t: arb) -> tuple[arb, arb, arb]:
    """Enclose K,K',K'' on 0<=t<=3/2 with explicit omitted tails."""
    # The interval constructor adds a 1e-65 outward pad at zero.
    assert t > -arb("1e-10") and t < q(151, 100)
    total = arb(0)
    first = arb(0)
    second = arb(0)
    for n in range(1, 5):
        nn = arb(n * n)
        v = arb.pi() * nn * (2 * t).exp()
        term = (
            arb.pi() * nn * (q(5, 2) * t).exp()
            * (2 * v - 3) * (-v).exp()
        )
        logarithmic_derivative = (
            q(5, 2) + 4 * v / (2 * v - 3) - 2 * v
        )
        minus_logarithmic_second = 4 * v + 24 * v / (2 * v - 3) ** 2
        total += term
        first += term * logarithmic_derivative
        second += term * (
            logarithmic_derivative**2 - minus_logarithmic_second
        )
    # curvature_base proves these Gaussian majorants on a padded interval
    # about [0,1].  For t>=1 their n>=5 majorants are strictly decreasing,
    # so the same balls cover the remaining interval through 3/2.
    return (
        total + arb(0, curvature_base.TAIL_BOUNDS[0].upper()),
        first + arb(0, curvature_base.TAIL_BOUNDS[1].upper()),
        second + arb(0, curvature_base.TAIL_BOUNDS[2].upper()),
    )


def rational_below(value: arb) -> Fraction:
    assert value > 0
    endpoint = value.lower()
    mantissa, exponent = endpoint.man_exp()
    mantissa = int(mantissa)
    exponent = int(exponent)
    if exponent >= 0:
        exact = Fraction(mantissa * 2**exponent)
    else:
        exact = Fraction(mantissa, 2 ** (-exponent))
    candidate = exact * Fraction(999_999_999_999, 1_000_000_000_000)
    while not arb(candidate.numerator) / candidate.denominator < value:
        candidate /= 2
    assert candidate > 0
    return candidate


def rational_above(value: arb) -> Fraction:
    assert value > 0
    endpoint = value.upper()
    mantissa, exponent = endpoint.man_exp()
    mantissa = int(mantissa)
    exponent = int(exponent)
    if exponent >= 0:
        exact = Fraction(mantissa * 2**exponent)
    else:
        exact = Fraction(mantissa, 2 ** (-exponent))
    candidate = exact * Fraction(1_000_000_000_001, 1_000_000_000_000)
    while not arb(candidate.numerator) / candidate.denominator > value:
        candidate *= 2
    assert candidate > 0
    return candidate


def fraction_arb(value: Fraction) -> arb:
    return arb(value.numerator) / value.denominator


def tail_ratio_certificate() -> arb:
    """Uniform density ratio for both translated beta tails."""

    # Put t=|z|>=3/2, d=1/10, u=t-d, and A=pi exp(2t).  The first
    # theta term and the geometric n^4 majorant give
    #
    # K(t-d)>=pi^2 exp(9(t-d)/2-A exp(-2d)),
    # K(t)<=2pi^2 exp(9t/2-A)/(1-16exp(-3A)).
    #
    # Also J(|u-x|)/C(x)>=exp(-(u+6)/2)/cosh(3).  The larger of the two
    # beta densities at t is 2exp(t/2)K(t).  Once
    # 1-16exp(-3A)>=1/2, their ratio is at least
    #
    # exp(A(1-exp(-2d))-t-4d-3)/(8cosh(3)).
    #
    # Its logarithmic lower exponent has derivative
    # 2A(1-exp(-2d))-1>0, so t=3/2 is the global minimum.
    t0 = BETA_BOUND
    a0 = arb.pi() * (2 * t0).exp()
    assert a0 * (-2 * TAIL_SHIFT).exp() > 3
    assert 16 * (-3 * a0).exp() < q(1, 2)
    assert 2 * a0 * (1 - (-2 * TAIL_SHIFT).exp()) > 1
    exponent = (
        a0 * (1 - (-2 * TAIL_SHIFT).exp())
        - t0 - 4 * TAIL_SHIFT - S / 2
    )
    lower = exponent.exp() / (8 * (S / 2).cosh())
    assert lower > 1
    return lower.lower()


def prime_power_data(limit: int):
    """Exact complete list of q=p^k<=limit and its physical coefficient."""
    sieve = bytearray(b"\x01") * (limit + 1)
    sieve[0:2] = b"\x00\x00"
    for p in range(2, isqrt(limit) + 1):
        if sieve[p]:
            sieve[p * p : limit + 1 : p] = b"\x00" * (
                (limit - p * p) // p + 1
            )
    rows = []
    for p in range(2, limit + 1):
        if not sieve[p]:
            continue
        power = p
        while power <= limit:
            rows.append(
                (
                    power,
                    arb(power).log(),
                    arb(p).log() / arb(power).sqrt(),
                )
            )
            if power > limit // p:
                break
            power *= p
    rows.sort(key=lambda row: row[0])
    assert len({row[0] for row in rows}) == len(rows)
    return tuple(rows)


PRIME_DATA = prime_power_data(Q_MAX)


def coordinate_bins(left: arb, right: arb, count: int):
    width = (right - left) / count
    return tuple(
        (left + index * width, left + (index + 1) * width)
        for index in range(count)
    )


DEMAND_BOXES = coordinate_bins(-BETA_BOUND, BETA_BOUND, DEMAND_BINS)
ARCH_BOXES = coordinate_bins(-ARCH_BOUND, ARCH_BOUND, ARCH_BINS)
DEMAND_WIDTH = 2 * BETA_BOUND / DEMAND_BINS


def demand_lower_capacities(sign: int) -> tuple[Fraction, ...]:
    assert sign in (-1, 1)
    result = []
    for left, right in DEMAND_BOXES:
        subwidth = (right - left) / DEMAND_QUADRATURE_SUBCELLS
        mass_lower = arb(0)
        for subindex in range(DEMAND_QUADRATURE_SUBCELLS):
            subleft = left + subindex * subwidth
            subright = subleft + subwidth
            midpoint = (subleft + subright) / 2

            # Composite midpoint rule.  If f is C^2 on the subinterval,
            # integral f >= h f(mid)-h^3 sup|f''|/24.  For
            # f(z)=2exp(-sign*z/2)K(z), evenness of K gives
            # |f''| <= 2exp(-sign*z/2)
            #             (|K''|+|K'|+K/4).
            midpoint_abs = abs(midpoint)
            k_mid, _kp_mid, _kpp_mid = theta_triplet_positive(midpoint_abs)
            f_mid = 2 * (-sign * midpoint / 2).exp() * k_mid

            z = interval(subleft, subright)
            t = nonnegative_absolute_enclosure(z)
            k, kp, kpp = theta_triplet_positive(t)
            exponential_upper = (-sign * z / 2).exp().upper()
            second_upper = 2 * exponential_upper * (
                absolute_upper(kpp) + absolute_upper(kp)
                + k.upper() / 4
            )
            contribution = (
                f_mid.lower() * subwidth
                - second_upper * subwidth**3 / 24
            )
            assert contribution > 0
            mass_lower += contribution
        result.append(rational_below(mass_lower))
    return tuple(result)


RAW_DEMAND_CAPACITIES = {
    +1: demand_lower_capacities(+1),
    -1: demand_lower_capacities(-1),
}
RAW_DEMAND_TOTALS = {
    sign: sum(capacities, Fraction(0))
    for sign, capacities in RAW_DEMAND_CAPACITIES.items()
}
assert all(total > SELECTED_RATE for total in RAW_DEMAND_TOTALS.values())
DEMAND_CAPACITIES = {
    sign: tuple(
        capacity * SELECTED_RATE / RAW_DEMAND_TOTALS[sign]
        for capacity in capacities
    )
    for sign, capacities in RAW_DEMAND_CAPACITIES.items()
}
assert all(
    sum(capacities, Fraction(0)) == SELECTED_RATE
    for capacities in DEMAND_CAPACITIES.values()
)


def separation_bound(
    first: tuple[arb, arb], second: tuple[arb, arb]
) -> arb:
    return max(abs(first[0] - second[1]), abs(first[1] - second[0]))


@dataclass(frozen=True)
class Supply:
    label: object
    box: tuple[arb, arb]
    capacity: Fraction


def arch_capacity(
    x_box: tuple[arb, arb], target: tuple[arb, arb]
) -> Fraction:
    z = interval(target[0], target[1])
    k_lower, _k_upper = kernel_lower_upper(z)
    distance = max(
        abs(target[0] - x_box[0]),
        abs(target[0] - x_box[1]),
        abs(target[1] - x_box[0]),
        abs(target[1] - x_box[1]),
    ).upper()
    c_upper = max(C(x_box[0]).upper(), C(x_box[1]).upper())
    density = k_lower * J(distance).lower() / c_upper
    assert density > 0
    return rational_below(density * (target[1] - target[0]))


def prime_capacity(
    x_box: tuple[arb, arb], direction: int, data
) -> Fraction:
    _power, logq, coefficient = data
    width = (x_box[1] - x_box[0]) / PRIME_SUBCELLS
    minimum = None
    for index in range(PRIME_SUBCELLS):
        left = x_box[0] + index * width
        source = interval(left, left + width)
        target = source + direction * logq
        k_lower, _k_upper = kernel_lower_upper(target)
        value = coefficient * k_lower / C(source).upper()
        if minimum is None or value.lower() < minimum:
            minimum = value.lower()
    assert minimum is not None and minimum > 0
    return rational_below(minimum)


def supplies(x_box: tuple[arb, arb]) -> tuple[Supply, ...]:
    result = []
    for index, target in enumerate(ARCH_BOXES):
        result.append(Supply(("arch", index), target, arch_capacity(x_box, target)))

    # Only a constructive finite prime selection is used.  Atoms without a
    # compatible middle demand bin are discarded below.
    for data in PRIME_DATA:
        power, logq, _coefficient = data
        for direction in (-1, +1):
            target = (
                x_box[0] + direction * logq,
                x_box[1] + direction * logq,
            )
            if target[1] <= -BETA_BOUND - MIDDLE_D:
                continue
            if target[0] >= BETA_BOUND + MIDDLE_D:
                continue
            result.append(
                Supply(
                    ("prime", power, direction),
                    target,
                    prime_capacity(x_box, direction, data),
                )
            )

    # Holding does not consume the anchor jump marginal.  Capacity one is
    # more than the retained beta ledger and is therefore effectively free.
    result.append(Supply(("hold",), x_box, Fraction(1)))
    return tuple(result)


def availability(box: tuple[arb, arb]):
    """A conservative contiguous beta-bin range served by one supply box."""
    width = float(DEMAND_WIDTH)
    left_estimate = (
        float(box[1].upper() - MIDDLE_D + BETA_BOUND) / width
    )
    right_estimate = (
        float(box[0].lower() + MIDDLE_D + BETA_BOUND) / width - 1
    )
    first = max(0, min(DEMAND_BINS, floor(left_estimate) + 1))
    last = max(-1, min(DEMAND_BINS - 1, ceil(right_estimate) - 1))

    # Float estimates choose only a starting index.  Every included range is
    # established by the following exact Arb comparisons; omitting a valid
    # edge could only weaken the certificate.
    while first <= last and not (
        separation_bound(box, DEMAND_BOXES[first]) < MIDDLE_D
    ):
        first += 1
    while last >= first and not (
        separation_bound(box, DEMAND_BOXES[last]) < MIDDLE_D
    ):
        last -= 1
    if first > last:
        return None

    # For bins translating left to right, u_R-z_L decreases and z_R-u_L
    # increases.  Thus the two endpoint checks prove compatibility for every
    # intervening bin.
    assert box[1] - DEMAND_BOXES[first][0] < MIDDLE_D
    assert DEMAND_BOXES[last][1] - box[0] < MIDDLE_D
    assert separation_bound(box, DEMAND_BOXES[first]) < MIDDLE_D
    assert separation_bound(box, DEMAND_BOXES[last]) < MIDDLE_D
    return first, last


def greedy_match(
    source_supplies: tuple[Supply, ...], sign: int
) -> tuple[bool, int, Fraction, int]:
    starts: list[list[tuple[int, Fraction, object]]] = [
        [] for _ in range(DEMAND_BINS)
    ]
    active_nodes = 0
    for supply in source_supplies:
        served = availability(supply.box)
        if served is None:
            continue
        first, last = served
        starts[first].append((last, supply.capacity, supply.label))
        active_nodes += 1

    heap = []
    serial = 0
    minimum_available = None
    for index, need0 in enumerate(DEMAND_CAPACITIES[sign]):
        for last, capacity, label in starts[index]:
            heapq.heappush(heap, (last, serial, capacity, label))
            serial += 1
        while heap and heap[0][0] < index:
            heapq.heappop(heap)

        available = sum((entry[2] for entry in heap), Fraction(0))
        if minimum_available is None or available - need0 < minimum_available:
            minimum_available = available - need0

        need = need0
        while need > 0:
            if not heap:
                return False, index, need, active_nodes
            last, _old_serial, capacity, label = heapq.heappop(heap)
            assert last >= index
            used = min(need, capacity)
            need -= used
            capacity -= used
            if capacity > 0:
                heapq.heappush(heap, (last, serial, capacity, label))
                serial += 1
    assert minimum_available is not None
    return True, -1, minimum_available, active_nodes


def main() -> None:
    monotone_n1, monotone_tail = (
        beta_base.certify_kernel_monotonicity_constants()
    )
    tail_ratio = tail_ratio_certificate()
    retained_totals = {
        sign: sum(DEMAND_CAPACITIES[sign], Fraction(0))
        for sign in (-1, +1)
    }

    x_width = S / X_BASE_CELLS
    certified = 0
    maximum_depth = 0
    worst_available = None
    worst_cell = None
    maximum_nodes = 0

    def certify_or_split(left: arb, right: arb, depth: int = 0) -> None:
        nonlocal certified, maximum_depth, worst_available, worst_cell
        nonlocal maximum_nodes
        x_box = left, right
        source_supplies = supplies(x_box)
        results = {
            sign: greedy_match(source_supplies, sign) for sign in (-1, +1)
        }
        if not all(result[0] for result in results.values()):
            assert depth < MAX_X_DEPTH, (left, right, depth, results)
            middle = (left + right) / 2
            certify_or_split(left, middle, depth + 1)
            certify_or_split(middle, right, depth + 1)
            return
        certified += 1
        maximum_depth = max(maximum_depth, depth)
        for sign, (_ok, _index, available, nodes) in results.items():
            maximum_nodes = max(maximum_nodes, nodes)
            if worst_available is None or available < worst_available:
                worst_available = available
                worst_cell = (left, right, sign, nodes)

    for index in range(X_BASE_CELLS):
        left = index * x_width
        certify_or_split(left, left + x_width)

    assert worst_available is not None and worst_cell is not None
    assert MIDDLE_D < TARGET_D
    print("precision_bits:", ctx.prec)
    print("anchor_interval: [-6,6] (reflection from [0,6])")
    print("beta_signs: plus and minus")
    print("target_separation:", TARGET_D)
    print("middle_product_separation_bound:", MIDDLE_D)
    print("tail_translation_distance:", TAIL_SHIFT)
    print("tail_density_ratio_lower:", tail_ratio)
    print("middle_beta_interval:", (-BETA_BOUND, BETA_BOUND))
    print("middle_arch_interval:", (-ARCH_BOUND, ARCH_BOUND))
    print("demand_bins:", DEMAND_BINS)
    print("arch_bins:", ARCH_BINS)
    print("prime_power_cutoff_and_count:", Q_MAX, len(PRIME_DATA))
    print("base_x_cells:", X_BASE_CELLS)
    print("certified_x_leaves:", certified)
    print("maximum_x_refinement_depth:", maximum_depth)
    print("maximum_active_supply_nodes:", maximum_nodes)
    print("raw_middle_beta_lower_totals:", {
        sign: fraction_arb(total) for sign, total in RAW_DEMAND_TOTALS.items()
    })
    print("retained_middle_beta_totals:", {
        sign: fraction_arb(total) for sign, total in retained_totals.items()
    })
    print("worst_cell_(xL,xR,beta_sign,active_nodes):", worst_cell)
    print("worst_greedy_available_minus_current_demand:",
          fraction_arb(worst_available))
    print("transported_selected_beta_mass:", fraction_arb(SELECTED_RATE))
    print("certificate: PASS")


if __name__ == "__main__":
    main()
