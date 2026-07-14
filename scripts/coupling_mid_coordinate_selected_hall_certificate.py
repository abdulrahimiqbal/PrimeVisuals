#!/usr/bin/env python3
"""Exact selected Hall transport for 3/5<=x<4/5, 1<y<=7/5.

This realizes the rate in ``coupling_mid_coordinate_rate_taylor_certificate``.
The y arch restriction [-9/10,2/5] and inward q=3,4,5,7,8,9 atoms are
demands.  The y restriction [2/5,11/10] and q=2 atom are one-coordinate
separation clocks.  The x supply uses five disjoint arch blocks in
[-11/10,3/5] and inward q=2,3,4,5 atoms; its separate rate interval
[9/10,x+9/10] is disjoint.  The last supply block stops at the minimum
source 3/5, so every fixed arch block lies wholly to the left of every x;
no one-sided exponential formula is applied across its source.

Every y demand is rounded up, every x supply down, and every product edge
checks the complete target rectangle.  Individual prime nodes prevent a
source-cell refinement from chasing a moving atom boundary.  After exact
max-flow saturation, scale each y row by actual/upper mass, which only
decreases x-column use; realize used arch columns by scaled restrictions of
their actual finite-series densities and couple edge pieces by normalized
products.  Half-open source/target cells and zero-on-zero conventions give
a Borel kernel.  All listed marginal pieces are disjoint (continuous arch
pieces are also mutually singular with prime atoms).

The exact network is proved on the full closed containing rectangle
``[3/5,4/5] x [11/10,7/5]``.  For global policy ownership, use it only on
``3/5<x<4/5``; x=3/5 is assigned to the low certificate and x=4/5 to the
high certificate.  Hence no boundary is inferred from a neighboring proof.
"""

from __future__ import annotations

from fractions import Fraction

from flint import arb, ctx

from coupling_exact_arch_integral import kernel_exponential_integral
from coupling_four_fifths_to_half_local_certificate import (
    ExactFlow,
    fraction_arb,
    rational_below,
)
from coupling_high_coordinate_rate_taylor_certificate import (
    LEVY_TERMS,
    PRIME_DATA,
    RATES,
    theta2_triplet_positive,
)
from coupling_unit_to_four_fifths_union_certificate import characteristic_upper
from coupling_wide_separation_band_certificate import interval, q


ctx.prec = 240

HALF = q(1, 2)
TARGET_C = q(2, 5)
PRIME_SUBCELLS = 16
X_BLOCKS = (
    (-q(11, 10), -q(4, 5)),
    (-q(4, 5), -q(2, 5)),
    (-q(2, 5), arb(0)),
    (arb(0), q(2, 5)),
    (q(2, 5), q(3, 5)),
)
Y_BLOCKS = (
    (-q(9, 10), -q(4, 5)),
    (-q(4, 5), -q(2, 5)),
    (-q(2, 5), arb(0)),
    (arb(0), q(2, 5)),
)


def rational_above(value: arb) -> Fraction:
    endpoint = value.upper()
    mantissa, exponent = endpoint.man_exp()
    mantissa = int(mantissa)
    exponent = int(exponent)
    exact = (
        Fraction(mantissa * 2**exponent)
        if exponent >= 0
        else Fraction(mantissa, 2 ** (-exponent))
    )
    candidate = exact * Fraction(1_000_000_000_001, 1_000_000_000_000)
    while not arb(candidate.numerator) / candidate.denominator > value:
        candidate *= 2
    return candidate


def absolute_enclosure(value: arb) -> arb:
    if value > 0:
        return value
    if value < 0:
        return -value
    return interval(
        arb(0), max(abs(value.lower()), abs(value.upper()))
    )


def separation_bound(first, second):
    return max(abs(first[0] - second[1]), abs(first[1] - second[0]))


def target_ok(first, second):
    return bool(
        separation_bound(first, second) <= HALF
        or characteristic_upper(first, second) <= TARGET_C
    )


def integral_constants(block):
    return tuple(
        kernel_exponential_integral(rate, block[0], block[1], 2)
        for rate in RATES
    )


INTEGRALS = {
    (side, index): integral_constants(block)
    for side, blocks in (("x", X_BLOCKS), ("y", Y_BLOCKS))
    for index, block in enumerate(blocks)
}


def arch_capacity(source_box, side, index, upper):
    source = interval(source_box[0], source_box[1])
    value = arb(0)
    for rate, integral_value in zip(RATES, INTEGRALS[(side, index)]):
        value += integral_value * (-rate * source).exp()
    value /= (source / 2).cosh()
    return rational_above(value) if upper else rational_below(value)


def prime_value(source, data):
    _power, logq, coefficient = data
    t = absolute_enclosure(source - logq)
    k, _kp, _kpp = theta2_triplet_positive(t)
    return coefficient * k / (source / 2).cosh()


def prime_capacity(source_box, data, upper):
    width = (source_box[1] - source_box[0]) / PRIME_SUBCELLS
    endpoint = None
    for i in range(PRIME_SUBCELLS):
        left = source_box[0] + i * width
        value = prime_value(interval(left, left + width), data)
        candidate = value.upper() if upper else value.lower()
        if endpoint is None:
            endpoint = candidate
        elif upper and candidate > endpoint:
            endpoint = candidate
        elif not upper and candidate < endpoint:
            endpoint = candidate
    assert endpoint is not None and endpoint > 0
    return rational_above(endpoint) if upper else rational_below(endpoint)


def shifted(source_box, logq):
    return source_box[0] - logq, source_box[1] - logq


def network(x_box, y_box):
    x_nodes = [
        (("x", "arch", i), block, arch_capacity(x_box, "x", i, False))
        for i, block in enumerate(X_BLOCKS)
    ]
    y_nodes = [
        (("y", "arch", i), block, arch_capacity(y_box, "y", i, True))
        for i, block in enumerate(Y_BLOCKS)
    ]
    for data in PRIME_DATA:
        power, logq, _coefficient = data
        if power in (2, 3, 4, 5):
            x_nodes.append(
                (("x", "prime", power), shifted(x_box, logq),
                 prime_capacity(x_box, data, False))
            )
        if power in (3, 4, 5, 7, 8, 9):
            y_nodes.append(
                (("y", "prime", power), shifted(y_box, logq),
                 prime_capacity(y_box, data, True))
            )

    size = len(x_nodes) + len(y_nodes) + 2
    source = size - 2
    sink = size - 1
    flow = ExactFlow(size)
    for i, (_label, _box, capacity) in enumerate(x_nodes):
        flow.add(source, i, capacity)
    for j, (_label, _box, demand) in enumerate(y_nodes):
        flow.add(len(x_nodes) + j, sink, demand)
    edges = []
    for i, (xlabel, xbox, _capacity) in enumerate(x_nodes):
        for j, (ylabel, ybox, _demand) in enumerate(y_nodes):
            if target_ok(xbox, ybox):
                flow.add(i, len(x_nodes) + j, Fraction(10))
                edges.append((xlabel, ylabel))
    demand = sum((node[2] for node in y_nodes), Fraction(0))
    return flow.maximum(source, sink), demand, x_nodes, y_nodes, edges


def exhaustive_cover():
    pending = [(q(3, 5), q(4, 5), q(11, 10), q(7, 5), 0)]
    leaves = []
    attempted = 0
    while pending:
        attempted += 1
        xl, xr, yl, yr, depth = pending.pop()
        maximum, demand, xnodes, ynodes, edges = network((xl, xr), (yl, yr))
        if maximum >= demand:
            leaves.append((xl, xr, yl, yr, depth, xnodes, ynodes, edges))
            continue
        assert depth < 12, (xl, xr, yl, yr, depth, maximum, demand)
        xm = (xl + xr) / 2
        ym = (yl + yr) / 2
        pending.extend(
            (
                (xl, xm, yl, ym, depth + 1),
                (xm, xr, yl, ym, depth + 1),
                (xl, xm, ym, yr, depth + 1),
                (xm, xr, ym, yr, depth + 1),
            )
        )
    return attempted, leaves


def main():
    attempted, leaves = exhaustive_cover()
    worst = max(leaves, key=lambda leaf: leaf[4])
    print("precision_bits:", ctx.prec)
    print("containing_source_rectangle: x in [3/5,4/5], y in [11/10,7/5]")
    print("attempted_cells:", attempted)
    print("certified_leaves:", len(leaves))
    print("maximum_depth:", max(leaf[4] for leaf in leaves))
    print("deepest_cell_(xL,xR,yL,yR,depth):", worst[:5])
    print("deepest_node_counts:", (len(worst[5]), len(worst[6])))
    print("deepest_edge_count:", len(worst[7]))
    print("middle_coordinate_selected_Hall: PASS")


if __name__ == "__main__":
    main()
