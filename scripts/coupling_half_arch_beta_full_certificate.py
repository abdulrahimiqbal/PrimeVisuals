#!/usr/bin/env python3
"""Falsified development attempt: 51/100-arch beta transport.

This file is retained as the exact finite-flow attempt and is expected to
fail.  ``coupling_half_arch_beta_full_falsifier.py`` proves a continuum Hall
obstruction already at ``x=3/5`` and distance ``354/1000``: the half-line
``(-infinity,6/25]`` has a rigorous deficit greater than ``0.0776``.  Thus
neither availability-aligned partitioning nor further mesh refinement can
establish the construction described below.  Nothing in this file is a
transport theorem or may be used in the RH implication chain.

For every ``|x|<=3/5`` and ``sigma in {-1,+1}``, put

    beta_sigma(dz)=2 exp(-sigma*z/2) K(z) dz.

This certificate constructs a coupling of the complete mass-one-half law
``beta_sigma`` to

    nu_x^prime + (51/100)nu_x^arch + (1/2)delta_x            (1)

whose support satisfies ``|z-u|<354/1000``.  The last summand is a holding
capacity, not part of the physical jump measure.  Of the unused ``49/100``
of ``nu_x^arch``, exactly ``97/200`` is reserved for the separate continuous
transport, ``1/250`` for the small-cut base transport, and ``1/1000`` is
left unused.

The proof is the exact finite-flow construction of
``coupling_mixed_anchor_beta_full_certificate.py`` with four changes only:

* middle product boxes have separation below ``7079/20000<354/1000``;
* every certified middle arch capacity is multiplied by ``51/100``;
* the holding capacity is exactly one half.
* the same middle arch interval is partitioned at every exact demand-bin
  availability boundary for radius ``3539/10000``.  The extra ``1/20000``
  edge cushion retains the complete adjacent box while still lying strictly
  below the target radius.  Thus a fixed uniform product box cannot suppress
  a valid continuum slice at an availability switch.

The middle beta law is still served in full.  Its 600 bin masses are bounded
above by rigorous composite-midpoint Arb enclosures.  Arch capacities and
prime capacities are rounded down to exact Fractions, and earliest-deadline
first is an exact interval-Hall algorithm.  After it succeeds for an upper
row ledger, multiplying each row by actual-mass/upper-mass produces the
continuum coupling and can only reduce column use.  Half-open source cells,
target bins and beta bins give the same Borel lift and nonreuse proof as in
the imported full certificate.

The two beta tails are translated toward zero by ``1/10``.  The imported
pointwise density quotient is greater than 1229 on ``|x|<=3/5``; after
multiplying the available arch density by ``51/100`` it is still greater
than one.
Those tail images are disjoint from all middle arch bins, so the
``51/100`` convention is global and no density element is reused.  The exact
global ledger is

    51/100 + 97/200 + 1/250 = 999/1000 < 1,

where the second fraction is reserved for continuous transport, the third
for the small-cut base reserve, and the remaining ``1/1000`` is unused.

This file proves only (1).  A later composition may use a separate coupling
into beta, but must add its support radius and audit the holding endpoint.
"""

from __future__ import annotations

from fractions import Fraction

from flint import arb, ctx

import coupling_mixed_anchor_beta_full_certificate as full


ctx.prec = 240


base = full.base
TARGET_D = base.q(354, 1000)
MIDDLE_D = base.q(7079, 20000)
PARTITION_D = Fraction(3539, 10000)
ANCHOR_BOUND = base.q(3, 5)
X_BASE_CELLS = 120
MAX_X_DEPTH = 12
ARCH_FRACTION = Fraction(51, 100)
CONTINUOUS_RESERVE = Fraction(97, 200)
BASE_RESERVE = Fraction(1, 250)
UNUSED_RESERVE = Fraction(1, 1000)
assert (
    ARCH_FRACTION + CONTINUOUS_RESERVE + BASE_RESERVE
    == Fraction(999, 1000)
)
assert (
    ARCH_FRACTION
    + CONTINUOUS_RESERVE
    + BASE_RESERVE
    + UNUSED_RESERVE
    == 1
)


def half_supplies(x_box: tuple[arb, arb]) -> tuple[base.Supply, ...]:
    """Exact capacities in (1), restricted to the constructive node list."""

    result = []
    for supply in base.supplies(x_box):
        if supply.label[0] == "arch":
            capacity = supply.capacity * ARCH_FRACTION
        elif supply.label == ("hold",):
            capacity = Fraction(1, 2)
        else:
            capacity = supply.capacity
        result.append(base.Supply(supply.label, supply.box, capacity))
    return tuple(result)


def availability_aligned_arch_boxes() -> tuple[tuple[arb, arb], ...]:
    """Partition the arch interval at every demand availability boundary."""

    arch_left = Fraction(-7, 5)
    arch_right = Fraction(7, 5)
    demand_left = Fraction(-3, 2)
    demand_width = Fraction(1, 200)
    endpoints = {arch_left, arch_right}
    for index in range(base.DEMAND_BINS):
        left = demand_left + index * demand_width
        right = left + demand_width
        for endpoint in (left + PARTITION_D, right - PARTITION_D):
            if arch_left < endpoint < arch_right:
                endpoints.add(endpoint)
    ordered = sorted(endpoints)

    def as_arb(value: Fraction) -> arb:
        return arb(value.numerator) / value.denominator

    boxes = tuple(
        (as_arb(left), as_arb(right))
        for left, right in zip(ordered, ordered[1:])
    )
    assert (boxes[0][0] + base.ARCH_BOUND).contains(0)
    assert (boxes[-1][1] - base.ARCH_BOUND).contains(0)
    assert all(left < right for left, right in boxes)
    assert len(boxes) == len(ordered) - 1
    return boxes


def main() -> None:
    base.TARGET_D = TARGET_D
    base.MIDDLE_D = MIDDLE_D
    base.S = ANCHOR_BOUND
    base.X_BASE_CELLS = X_BASE_CELLS
    base.MAX_X_DEPTH = MAX_X_DEPTH
    base.ARCH_BOXES = availability_aligned_arch_boxes()
    base.ARCH_BINS = len(base.ARCH_BOXES)
    assert base.q(PARTITION_D.numerator, PARTITION_D.denominator) < MIDDLE_D
    assert MIDDLE_D < TARGET_D

    # A compatible middle atom obeys
    # log(q)<|x|+3/2+354/1000<5/2, so q<13.  This is the complete list.
    base.PRIME_DATA = tuple(row for row in base.PRIME_DATA if row[0] <= 11)
    base.Q_MAX = 11
    assert base.q(5, 2).exp() < 13
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

    upper_demands = {
        +1: full.middle_demand_upper_capacities(+1),
        -1: full.middle_demand_upper_capacities(-1),
    }
    base.DEMAND_CAPACITIES = upper_demands

    monotone_n1, monotone_tail = (
        base.beta_base.certify_kernel_monotonicity_constants()
    )
    full_arch_tail_ratio = base.tail_ratio_certificate()
    selected_arch_tail_ratio = (
        full_arch_tail_ratio * ARCH_FRACTION.numerator
        / ARCH_FRACTION.denominator
    )
    assert selected_arch_tail_ratio > 1

    middle_upper_totals = {
        sign: sum(capacities, Fraction(0))
        for sign, capacities in upper_demands.items()
    }

    x_width = base.S / base.X_BASE_CELLS
    certified = 0
    maximum_depth = 0
    worst_available = None
    worst_cell = None
    maximum_nodes = 0

    def certify_or_split(left: arb, right: arb, depth: int = 0) -> None:
        nonlocal certified, maximum_depth, worst_available, worst_cell
        nonlocal maximum_nodes
        x_box = left, right
        source_supplies = half_supplies(x_box)
        results = {
            sign: base.greedy_match(source_supplies, sign)
            for sign in (-1, +1)
        }
        if not all(result[0] for result in results.values()):
            assert depth < base.MAX_X_DEPTH, (
                left,
                right,
                depth,
                results,
            )
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

    for index in range(base.X_BASE_CELLS):
        left = index * x_width
        certify_or_split(left, left + x_width)

    assert worst_available is not None and worst_cell is not None
    assert base.TAIL_SHIFT < TARGET_D
    assert MIDDLE_D < TARGET_D
    print("precision_bits:", ctx.prec)
    print("anchor_interval: [-3/5,3/5] (reflection from [0,3/5])")
    print("beta_signs: plus and minus")
    print("complete_beta_mass:", base.q(1, 2))
    print("capacity: full prime + 51/100 arch + half hold")
    print("target_separation:", TARGET_D)
    print("middle_product_separation_bound:", MIDDLE_D)
    print("tail_translation_distance:", base.TAIL_SHIFT)
    print("full_arch_tail_density_ratio_lower:", full_arch_tail_ratio)
    print("selected_arch_tail_density_ratio_lower:", selected_arch_tail_ratio)
    print("middle_beta_interval:", (-base.BETA_BOUND, base.BETA_BOUND))
    print("middle_arch_interval:", (-base.ARCH_BOUND, base.ARCH_BOUND))
    print("demand_bins:", base.DEMAND_BINS)
    print("arch_bins:", base.ARCH_BINS)
    print("prime_power_cutoff_and_count:", base.Q_MAX, len(base.PRIME_DATA))
    print("base_x_cells:", base.X_BASE_CELLS)
    print("certified_x_leaves:", certified)
    print("maximum_x_refinement_depth:", maximum_depth)
    print("maximum_active_supply_nodes:", maximum_nodes)
    print(
        "middle_beta_upper_totals:",
        {
            sign: base.fraction_arb(total)
            for sign, total in middle_upper_totals.items()
        },
    )
    print("worst_cell_(xL,xR,beta_sign,active_nodes):", worst_cell)
    print(
        "worst_greedy_available_minus_current_demand:",
        base.fraction_arb(worst_available),
    )
    print("transported_beta_mass:", base.q(1, 2))
    print("selected_arch_beta_transport: PASS")
    print("kernel_monotonicity_n1_upper:", monotone_n1)
    print("kernel_monotonicity_tail_upper:", monotone_tail)


if __name__ == "__main__":
    main()
