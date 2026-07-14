#!/usr/bin/env python3
"""Exact finite-flow certificate for the simultaneous mandatory beta ledger.

For ``|x|<=3/5`` define the positive-orientation arch fraction ``alpha_x``
as follows.  Item 195 transports a lost y-arch target ``z`` to
``u=z-1/5`` only when ``u>x+3/10``.  On each of its 2,800 exact compact
cells let ``R_j`` denote the validated lower bound for the full-density
quotient; on the half-line use its validated increasing-tail endpoint
bound.  Reserve ``1/R_j`` of the x-arch density on the corresponding supply
cell.  Reserve a further ``1/250`` for item 193 wherever its base slice can
occur, conservatively on the whole half-line ``u>=9/10``.  Thus

    alpha_x(u)=1,                                      u<=x+3/10,
    alpha_x(u)=1-1/R(u)-(1/250)1_{u>=9/10},            u>x+3/10.

This program certifies, for every such x, a coupling of the complete law

    beta_+(dz)=2 exp(-z/2) K(z) dz

to

    nu_x^prime + alpha_x nu_x^arch + (1/2) delta_x

with support ``|z-u|<177/500``.

The proof is a rigorous finite interval-flow construction.  The middle beta
law on ``[-3/2,3/2]`` uses upper mass ledgers.  Arch boxes are partitioned
at every demand-availability switch, at ``9/10``, and at the moving
conservative threshold ``x_L+3/10`` on each closed x-cell.  Each arch box is
multiplied by an exact rational lower bound for ``alpha_x`` obtained from
all item-195 quotient cells it meets.  Prime and arch capacities are rounded
down, beta demands are rounded up, and earliest-deadline first is exact
rational arithmetic.  Failed x-cells are bisected.

For the two beta tails use the standard translation toward zero by ``1/10``.
The negative image is wholly in the full arch region.  On the positive image
the item-195 tail reserve and the base reserve are both subtracted; the
remaining exact fraction times the independently proved tail density ratio
is still greater than one.  Tail images are disjoint from the middle arch
boxes up to null endpoints.

This proves only the beta-to-capacity arrow and its nonreuse ledger.  Its use
inside a larger Hall decomposition still requires the separate first-arrow
and measure-disintegration arguments.
"""

from __future__ import annotations

from fractions import Fraction

from flint import arb, ctx

import coupling_high_middle_halfline_arch_increment_certificate as increment
import coupling_mixed_anchor_beta_full_certificate as full


ctx.prec = 240


base = full.base
TARGET_D = Fraction(177, 500)
MIDDLE_D = Fraction(7079, 20000)
PARTITION_D = Fraction(3539, 10000)
ANCHOR_LEFT = Fraction(-3, 5)
ANCHOR_RIGHT = Fraction(3, 5)
BASE_X_CELLS = 24
MAX_X_DEPTH = 12
BASE_RESERVE = Fraction(1, 250)
SPATIAL_OFFSET = Fraction(3, 10)
BASE_SLICE_LEFT = Fraction(9, 10)
RATIO_Z_LEFT = Fraction(-1, 10)
RATIO_Z_RIGHT = Fraction(13, 10)
RATIO_CELLS = 2800
RATIO_WIDTH = Fraction(1, 2000)
SUPPLY_SHIFT = Fraction(1, 5)


def as_arb(value: Fraction) -> arb:
    return arb(value.numerator) / value.denominator


def floor_fraction(value: Fraction) -> int:
    return value.numerator // value.denominator


def item195_ratio_floors() -> tuple[tuple[arb, ...], arb]:
    """Reconstruct every exact compact quotient floor and the tail floor."""

    ratio_floors: list[arb] = []
    q = increment.q
    width = (increment.Z_RIGHT - increment.Z_LEFT) / increment.CELLS
    assert width.contains(q(1, 2000))
    for index in range(increment.CELLS):
        left = increment.Z_LEFT + index * width
        right = left + width
        z = increment.base.interval(left, right)
        supply_k, _ = increment.base.kernel_bounds(z - q(1, 5))
        _, demand_k = increment.base.kernel_bounds(z)
        supply_j = increment.base.levy_shape(right + q(2, 5)).lower()
        demand_j = increment.base.levy_shape(q(7, 5) - right).upper()
        ratio = (
            (supply_k * supply_j / increment.C06)
            / (demand_k * demand_j / increment.C14)
        )
        assert ratio > 2
        ratio_floors.append(arb(ratio.lower()))

    displacement = q(1, 5)
    tail_kernel_ratio = increment.kernel_quotient_lower(
        increment.Z_RIGHT, displacement
    )
    tail_elementary_ratio = (
        (-q(3, 20)).exp()
        / (
            2
            * increment.base.levy_shape(q(1, 10))
            * increment.C06
        )
    )
    tail_ratio = arb((tail_kernel_ratio * tail_elementary_ratio).lower())
    assert tail_ratio > 2
    return tuple(ratio_floors), tail_ratio


RATIO_FLOORS, ITEM195_TAIL_RATIO = item195_ratio_floors()


def minimum_ratio_on_supply(
    supply_left: Fraction,
    supply_right: Fraction,
) -> arb:
    """Lower-bound R(u+1/5) on a half-open variable-capacity box."""

    z_left = supply_left + SUPPLY_SHIFT
    z_right = supply_right + SUPPLY_SHIFT
    candidates: list[arb] = []

    compact_left = max(z_left, RATIO_Z_LEFT)
    compact_right = min(z_right, RATIO_Z_RIGHT)
    if compact_left < compact_right:
        scaled_left = (compact_left - RATIO_Z_LEFT) / RATIO_WIDTH
        scaled_right = (compact_right - RATIO_Z_LEFT) / RATIO_WIDTH
        first = max(0, floor_fraction(scaled_left))
        # Including the cell at an exact right boundary is conservative.
        last = min(RATIO_CELLS - 1, floor_fraction(scaled_right))
        candidates.extend(RATIO_FLOORS[first : last + 1])

    if z_right >= RATIO_Z_RIGHT:
        candidates.append(ITEM195_TAIL_RATIO)

    assert candidates, (supply_left, supply_right, z_left, z_right)
    result = candidates[0]
    for candidate in candidates[1:]:
        if candidate < result:
            result = candidate
    assert result > 2
    return result


def availability_aligned_endpoints() -> tuple[Fraction, ...]:
    arch_left = Fraction(-7, 5)
    arch_right = Fraction(7, 5)
    demand_left = Fraction(-3, 2)
    demand_width = Fraction(1, 200)
    endpoints = {arch_left, arch_right, BASE_SLICE_LEFT}
    for index in range(base.DEMAND_BINS):
        left = demand_left + index * demand_width
        right = left + demand_width
        for endpoint in (left + PARTITION_D, right - PARTITION_D):
            if arch_left < endpoint < arch_right:
                endpoints.add(endpoint)
    return tuple(sorted(endpoints))


BASE_ARCH_ENDPOINTS = availability_aligned_endpoints()


def spatial_arch_boxes(x_left: Fraction) -> tuple[tuple[Fraction, Fraction], ...]:
    threshold = x_left + SPATIAL_OFFSET
    endpoints = set(BASE_ARCH_ENDPOINTS)
    if BASE_ARCH_ENDPOINTS[0] < threshold < BASE_ARCH_ENDPOINTS[-1]:
        endpoints.add(threshold)
    ordered = sorted(endpoints)
    return tuple(zip(ordered, ordered[1:]))


def selected_arch_fraction(
    x_left: Fraction,
    target: tuple[Fraction, Fraction],
) -> Fraction:
    left, right = target
    threshold = x_left + SPATIAL_OFFSET
    reserve = Fraction(0)
    if left >= threshold:
        ratio_floor = minimum_ratio_on_supply(left, right)
        leftover = arb(1) - 1 / ratio_floor
        if left >= BASE_SLICE_LEFT:
            leftover -= as_arb(BASE_RESERVE)
        assert leftover > 0
        return base.rational_below(leftover)

    assert right <= threshold, (x_left, target, threshold)
    # The base-slice union begins at .9, whereas threshold<=.9.
    assert right <= BASE_SLICE_LEFT
    return Fraction(1)


def variable_supplies(
    x_left: Fraction,
    x_right: Fraction,
) -> tuple[base.Supply, ...]:
    x_box = (as_arb(x_left), as_arb(x_right))
    result: list[base.Supply] = []

    for index, target_fraction in enumerate(spatial_arch_boxes(x_left)):
        target = tuple(as_arb(endpoint) for endpoint in target_fraction)
        full_capacity = base.arch_capacity(x_box, target)
        fraction = selected_arch_fraction(x_left, target_fraction)
        result.append(
            base.Supply(
                ("arch", index, target_fraction),
                target,
                full_capacity * fraction,
            )
        )

    for data in base.PRIME_DATA:
        power, logq, _coefficient = data
        for direction in (-1, +1):
            target = (
                x_box[0] + direction * logq,
                x_box[1] + direction * logq,
            )
            if target[1] <= -base.BETA_BOUND - base.MIDDLE_D:
                continue
            if target[0] >= base.BETA_BOUND + base.MIDDLE_D:
                continue
            result.append(
                base.Supply(
                    ("prime", power, direction),
                    target,
                    base.prime_capacity(x_box, direction, data),
                )
            )

    result.append(base.Supply(("hold",), x_box, Fraction(1, 2)))
    return tuple(result)


def configure_imported_certificate() -> None:
    base.TARGET_D = as_arb(TARGET_D)
    base.MIDDLE_D = as_arb(MIDDLE_D)
    base.S = as_arb(ANCHOR_RIGHT)
    base.MAX_X_DEPTH = MAX_X_DEPTH
    assert as_arb(PARTITION_D) < base.MIDDLE_D < base.TARGET_D

    base.PRIME_DATA = tuple(row for row in base.PRIME_DATA if row[0] <= 11)
    base.Q_MAX = 11
    assert tuple(int(row[0]) for row in base.PRIME_DATA) == (
        2,
        3,
        4,
        5,
        7,
        8,
        9,
        11,
    )
    base.DEMAND_CAPACITIES = {
        +1: full.middle_demand_upper_capacities(+1),
    }


def main() -> None:
    configure_imported_certificate()
    monotone_n1, monotone_tail = (
        base.beta_base.certify_kernel_monotonicity_constants()
    )
    full_tail_ratio = base.tail_ratio_certificate()
    positive_tail_fraction_arb = (
        arb(1)
        - 1 / ITEM195_TAIL_RATIO
        - as_arb(BASE_RESERVE)
    )
    positive_tail_fraction = base.rational_below(
        positive_tail_fraction_arb
    )
    selected_positive_tail_ratio = (
        full_tail_ratio
        * positive_tail_fraction.numerator
        / positive_tail_fraction.denominator
    )
    assert selected_positive_tail_ratio > 1

    middle_upper_total = sum(base.DEMAND_CAPACITIES[+1], Fraction(0))
    x_width = (ANCHOR_RIGHT - ANCHOR_LEFT) / BASE_X_CELLS
    certified = 0
    maximum_depth = 0
    worst_available: Fraction | None = None
    worst_cell = None
    maximum_nodes = 0

    def certify_or_split(
        left: Fraction,
        right: Fraction,
        depth: int = 0,
    ) -> None:
        nonlocal certified, maximum_depth, worst_available, worst_cell
        nonlocal maximum_nodes
        supplies = variable_supplies(left, right)
        result = base.greedy_match(supplies, +1)
        if not result[0]:
            assert depth < MAX_X_DEPTH, (left, right, depth, result)
            middle = (left + right) / 2
            certify_or_split(left, middle, depth + 1)
            certify_or_split(middle, right, depth + 1)
            return

        certified += 1
        maximum_depth = max(maximum_depth, depth)
        _ok, _index, available, nodes = result
        maximum_nodes = max(maximum_nodes, nodes)
        if worst_available is None or available < worst_available:
            worst_available = available
            worst_cell = (left, right, nodes)

    for index in range(BASE_X_CELLS):
        left = ANCHOR_LEFT + index * x_width
        certify_or_split(left, left + x_width)

    assert worst_available is not None and worst_cell is not None
    assert base.TAIL_SHIFT < base.TARGET_D
    print("precision_bits:", ctx.prec)
    print("anchor_interval:", (as_arb(ANCHOR_LEFT), as_arb(ANCHOR_RIGHT)))
    print("beta_orientation: plus")
    print("complete_beta_mass:", base.q(1, 2))
    print("target_separation:", base.TARGET_D)
    print("middle_product_separation_bound:", base.MIDDLE_D)
    print("tail_translation_distance:", base.TAIL_SHIFT)
    print("item195_compact_ratio_floor_min:", min(RATIO_FLOORS))
    print("item195_tail_ratio_floor:", ITEM195_TAIL_RATIO)
    print("positive_tail_selected_arch_fraction:", base.fraction_arb(positive_tail_fraction))
    print("full_arch_tail_density_ratio_lower:", full_tail_ratio)
    print("selected_positive_tail_density_ratio_lower:", selected_positive_tail_ratio)
    print("middle_beta_interval:", (-base.BETA_BOUND, base.BETA_BOUND))
    print("middle_arch_interval:", (-base.ARCH_BOUND, base.ARCH_BOUND))
    print("demand_bins:", base.DEMAND_BINS)
    print("availability_aligned_base_arch_boxes:", len(BASE_ARCH_ENDPOINTS) - 1)
    print("prime_power_cutoff_and_count:", base.Q_MAX, len(base.PRIME_DATA))
    print("base_x_cells:", BASE_X_CELLS)
    print("certified_x_leaves:", certified)
    print("maximum_x_refinement_depth:", maximum_depth)
    print("maximum_active_supply_nodes:", maximum_nodes)
    print("middle_beta_upper_total:", base.fraction_arb(middle_upper_total))
    print("worst_cell_(xL,xR,active_nodes):", worst_cell)
    print(
        "worst_greedy_available_minus_current_demand:",
        base.fraction_arb(worst_available),
    )
    print("transported_beta_mass:", base.q(1, 2))
    print("mandatory_variable_arch_beta_transport: PASS")
    print("kernel_monotonicity_n1_upper:", monotone_n1)
    print("kernel_monotonicity_tail_upper:", monotone_tail)


if __name__ == "__main__":
    main()
