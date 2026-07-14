#!/usr/bin/env python3
"""Exact two-sided spatial beta certificate for all left Hall components.

This strengthens ``coupling_mandatory_variable_arch_beta_certificate.py`` by
also reserving the actual density used by item 197's far-left translation.
For ``|x|<=3/5`` let

    L_x={u:u<x-17/50},       R_x={u:u>x+3/10}.

On ``L_x`` write ``z=u-4/25`` and let ``S(u)`` be the validated item-197
full-density quotient floor on its exact 2,800 compact cells, with the
proved analytic tail floor for ``z<=-13/10``.  On ``R_x`` write
``z=u+1/5`` and use the item-195 quotient floor ``R(u)``.  Define

    alpha_x(u)=1-1/S(u),                         u in L_x,
    alpha_x(u)=1,                                x-17/50<=u<=x+3/10,
    alpha_x(u)=1-1/R(u)-(1/250)1_{u>=9/10},      u in R_x.

The removed left fraction dominates item 197's map ``z -> z+4/25``.
The removed right fraction dominates both the item-195 mandatory increment
and item 197's MR map ``z -> z-1/5``.  The additional ``1/250`` dominates
item 193's base slice.  The two moving regions are disjoint.

The program proves that the complete beta-plus law couples to

    nu_x^prime + alpha_x nu_x^arch + (1/2)delta_x

with support strictly below ``177/500`` for every ``|x|<=3/5``.  It reuses
the frozen one-sided certificate's exact upper beta ledgers, availability
partition, item-195 floors, prime/arch capacity bounds, and rational EDF
algorithm.  Each closed x-cell is additionally split at the conservative
moving boundary ``x_R-17/50``.  The negative beta tail is charged the
item-197 analytic-tail reserve; the positive tail is charged the item-195
tail and item-193 base reserves.  Both selected tail quotients remain above
one.

Implication scope.  Together with item 203, disintegration composes this
kernel with any restriction of the complete inward-prime measure when
``7/5<=y<=4``.  Because the two arch translations are injective and their
images remain in the corresponding half-distance expansions, the reserved
fractions are not reused across disjoint L, MR, or mandatory components.
This file does not supply item 203 beyond ``y=4`` and does not by itself
prove the global high-mixed Hall theorem.
"""

from __future__ import annotations

from fractions import Fraction

from flint import arb, ctx

import coupling_high_middle_left_extra_arch_certificate as left_map
import coupling_mandatory_variable_arch_beta_certificate as right_map


ctx.prec = 240


base = right_map.base
LEFT_SPATIAL_OFFSET = Fraction(17, 50)
LEFT_TARGET_SHIFT = Fraction(4, 25)
LEFT_Z_LEFT = Fraction(-13, 10)
LEFT_Z_RIGHT = Fraction(1, 10)
LEFT_RATIO_CELLS = 2800
LEFT_RATIO_WIDTH = Fraction(1, 2000)


ARCH_BOX_SUBDIVISIONS = 4


def refined_availability_endpoints() -> tuple[Fraction, ...]:
    """Subdivide every frozen availability box to tighten density minima."""

    endpoints = set(right_map.BASE_ARCH_ENDPOINTS)
    for left, right in zip(
        right_map.BASE_ARCH_ENDPOINTS,
        right_map.BASE_ARCH_ENDPOINTS[1:],
    ):
        for index in range(1, ARCH_BOX_SUBDIVISIONS):
            endpoints.add(
                left + (right - left) * index / ARCH_BOX_SUBDIVISIONS
            )
    return tuple(sorted(endpoints))


TWO_SIDED_BASE_ARCH_ENDPOINTS = refined_availability_endpoints()


def item197_left_ratio_floors() -> tuple[tuple[arb, ...], arb]:
    """Reconstruct the exact far-left compact and analytic-tail floors."""

    floors: list[arb] = []
    q = left_map.q
    width = (left_map.Z_RIGHT - left_map.Z_LEFT) / left_map.CELLS
    assert width.contains(q(1, 2000))
    for index in range(left_map.CELLS):
        left = left_map.Z_LEFT + index * width
        right = left + width
        z = left_map.base.interval(left, right)
        supply_k, _ = left_map.base.kernel_bounds(z + q(4, 25))
        _, demand_k = left_map.base.kernel_bounds(z)
        supply_j = left_map.base.levy_shape(q(11, 25) - left).lower()
        demand_j = left_map.base.levy_shape(q(7, 5) - right).upper()
        ratio = (
            (supply_k * supply_j / left_map.C06)
            / (demand_k * demand_j / left_map.C14)
        )
        assert ratio > 2
        floors.append(arb(ratio.lower()))

    displacement = q(4, 25)
    tail_kernel_ratio = left_map.kernel_quotient_lower(
        -left_map.Z_LEFT, displacement
    )
    tail_elementary_ratio = (
        q(12, 25).exp()
        * (1 - (-q(27, 5)).exp())
        * left_map.C14
        / left_map.C06
    )
    tail_ratio = arb((tail_kernel_ratio * tail_elementary_ratio).lower())
    assert tail_ratio > 2
    return tuple(floors), tail_ratio


LEFT_RATIO_FLOORS, ITEM197_LEFT_TAIL_RATIO = item197_left_ratio_floors()


def minimum_left_ratio_on_supply(
    supply_left: Fraction,
    supply_right: Fraction,
) -> arb:
    """Lower-bound S(u-4/25) on a half-open far-left supply box."""

    z_left = supply_left - LEFT_TARGET_SHIFT
    z_right = supply_right - LEFT_TARGET_SHIFT
    candidates: list[arb] = []

    compact_left = max(z_left, LEFT_Z_LEFT)
    compact_right = min(z_right, LEFT_Z_RIGHT)
    if compact_left < compact_right:
        scaled_left = (
            (compact_left - LEFT_Z_LEFT) / LEFT_RATIO_WIDTH
        )
        scaled_right = (
            (compact_right - LEFT_Z_LEFT) / LEFT_RATIO_WIDTH
        )
        first = max(0, right_map.floor_fraction(scaled_left))
        # Including the cell at an exact right boundary is conservative.
        last = min(
            LEFT_RATIO_CELLS - 1,
            right_map.floor_fraction(scaled_right),
        )
        candidates.extend(LEFT_RATIO_FLOORS[first : last + 1])

    if z_left <= LEFT_Z_LEFT:
        candidates.append(ITEM197_LEFT_TAIL_RATIO)

    assert candidates, (supply_left, supply_right, z_left, z_right)
    result = candidates[0]
    for candidate in candidates[1:]:
        if candidate < result:
            result = candidate
    assert result > 2
    return result


def two_sided_arch_boxes(
    x_left: Fraction,
    x_right: Fraction,
) -> tuple[tuple[Fraction, Fraction], ...]:
    left_threshold = x_right - LEFT_SPATIAL_OFFSET
    right_threshold = x_left + right_map.SPATIAL_OFFSET
    assert left_threshold < right_threshold
    endpoints = set(TWO_SIDED_BASE_ARCH_ENDPOINTS)
    for threshold in (left_threshold, right_threshold):
        if (
            TWO_SIDED_BASE_ARCH_ENDPOINTS[0]
            < threshold
            < TWO_SIDED_BASE_ARCH_ENDPOINTS[-1]
        ):
            endpoints.add(threshold)
    ordered = sorted(endpoints)
    return tuple(zip(ordered, ordered[1:]))


def selected_two_sided_fraction(
    x_left: Fraction,
    x_right: Fraction,
    target: tuple[Fraction, Fraction],
) -> Fraction:
    left, right = target
    left_threshold = x_right - LEFT_SPATIAL_OFFSET
    right_threshold = x_left + right_map.SPATIAL_OFFSET

    if right <= left_threshold:
        ratio_floor = minimum_left_ratio_on_supply(left, right)
        leftover = arb(1) - 1 / ratio_floor
        assert leftover > 0
        return base.rational_below(leftover)

    if left >= right_threshold:
        return right_map.selected_arch_fraction(x_left, target)

    assert left >= left_threshold and right <= right_threshold, (
        x_left,
        x_right,
        target,
        left_threshold,
        right_threshold,
    )
    # The possible item-193 base union starts at .9, while the middle region
    # ends no later than .9.
    assert right <= right_map.BASE_SLICE_LEFT
    return Fraction(1)


def two_sided_supplies(
    x_left: Fraction,
    x_right: Fraction,
) -> tuple[base.Supply, ...]:
    x_box = (right_map.as_arb(x_left), right_map.as_arb(x_right))
    result: list[base.Supply] = []

    for index, target_fraction in enumerate(
        two_sided_arch_boxes(x_left, x_right)
    ):
        target = tuple(
            right_map.as_arb(endpoint) for endpoint in target_fraction
        )
        full_capacity = base.arch_capacity(x_box, target)
        fraction = selected_two_sided_fraction(
            x_left, x_right, target_fraction
        )
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


def main() -> None:
    right_map.configure_imported_certificate()
    monotone_n1, monotone_tail = (
        base.beta_base.certify_kernel_monotonicity_constants()
    )
    full_tail_ratio = base.tail_ratio_certificate()

    negative_tail_fraction = base.rational_below(
        arb(1) - 1 / ITEM197_LEFT_TAIL_RATIO
    )
    positive_tail_fraction = base.rational_below(
        arb(1)
        - 1 / right_map.ITEM195_TAIL_RATIO
        - right_map.as_arb(right_map.BASE_RESERVE)
    )
    selected_negative_tail_ratio = (
        full_tail_ratio
        * negative_tail_fraction.numerator
        / negative_tail_fraction.denominator
    )
    selected_positive_tail_ratio = (
        full_tail_ratio
        * positive_tail_fraction.numerator
        / positive_tail_fraction.denominator
    )
    assert selected_negative_tail_ratio > 1
    assert selected_positive_tail_ratio > 1

    middle_upper_total = sum(base.DEMAND_CAPACITIES[+1], Fraction(0))
    x_width = (
        right_map.ANCHOR_RIGHT - right_map.ANCHOR_LEFT
    ) / right_map.BASE_X_CELLS
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
        supplies = two_sided_supplies(left, right)
        result = base.greedy_match(supplies, +1)
        if not result[0]:
            assert depth < right_map.MAX_X_DEPTH, (
                left,
                right,
                depth,
                result,
            )
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

    for index in range(right_map.BASE_X_CELLS):
        left = right_map.ANCHOR_LEFT + index * x_width
        certify_or_split(left, left + x_width)

    assert worst_available is not None and worst_cell is not None
    assert base.TAIL_SHIFT < base.TARGET_D
    print("precision_bits:", ctx.prec)
    print(
        "anchor_interval:",
        (
            right_map.as_arb(right_map.ANCHOR_LEFT),
            right_map.as_arb(right_map.ANCHOR_RIGHT),
        ),
    )
    print("beta_orientation: plus")
    print("complete_beta_mass:", base.q(1, 2))
    print("target_separation:", base.TARGET_D)
    print("middle_product_separation_bound:", base.MIDDLE_D)
    print("tail_translation_distance:", base.TAIL_SHIFT)
    print("item197_left_compact_ratio_floor_min:", min(LEFT_RATIO_FLOORS))
    print("item197_left_tail_ratio_floor:", ITEM197_LEFT_TAIL_RATIO)
    print("item195_right_compact_ratio_floor_min:", min(right_map.RATIO_FLOORS))
    print("item195_right_tail_ratio_floor:", right_map.ITEM195_TAIL_RATIO)
    print(
        "negative_tail_selected_arch_fraction:",
        base.fraction_arb(negative_tail_fraction),
    )
    print(
        "positive_tail_selected_arch_fraction:",
        base.fraction_arb(positive_tail_fraction),
    )
    print("full_arch_tail_density_ratio_lower:", full_tail_ratio)
    print("selected_negative_tail_density_ratio_lower:", selected_negative_tail_ratio)
    print("selected_positive_tail_density_ratio_lower:", selected_positive_tail_ratio)
    print("middle_beta_interval:", (-base.BETA_BOUND, base.BETA_BOUND))
    print("middle_arch_interval:", (-base.ARCH_BOUND, base.ARCH_BOUND))
    print("demand_bins:", base.DEMAND_BINS)
    print(
        "refined_availability_aligned_base_arch_boxes:",
        len(TWO_SIDED_BASE_ARCH_ENDPOINTS) - 1,
    )
    print("prime_power_cutoff_and_count:", base.Q_MAX, len(base.PRIME_DATA))
    print("base_x_cells:", right_map.BASE_X_CELLS)
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
    print("all_component_variable_arch_beta_transport: PASS")
    print("kernel_monotonicity_n1_upper:", monotone_n1)
    print("kernel_monotonicity_tail_upper:", monotone_tail)


if __name__ == "__main__":
    main()
