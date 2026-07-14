#!/usr/bin/env python3
"""Exact selected Hall transport for the low-coordinate high-y band.

For 1/5<x<=3/5, 1<y<=7/5 and 1/2<y-x<=4/5, the y arch restriction
``[-4/5,x+1/2]`` is already a one-coordinate target: characteristic and
separation intervals overlap when x<=3/5.  The inward q=2,3,4,5 atoms are
also single targets.  This certificate transports the remaining selected
ledger: y arch on ``[-9/10,-4/5]`` and the inward q=7,8,9 atoms (the latter
are paired even on source states where they could instead be single).

The x marginal supplies four disjoint arch blocks in [-3/2,-2/5] and inward
q=2,3,4,5 atoms.  Every y demand is rounded up, every x capacity down, and an
exact Fraction max flow must saturate all demand.  The continuum lift is the
same row scaling used by the middle/high Hall certificates: multiply edge
rows by actual/upper demand, realize used x columns by scaled restrictions,
and take normalized products.  Half-open boxes make the Borel/disjointness
ledger exact; no finite flow is extrapolated to an infinite-dimensional
positivity claim.

The single-clock geometry, including the correlated q=2,3,4,5 audit, is
proved by ``audit_target_geometry`` in the companion rate certificate.
For disjoint global ownership this low policy takes ``1/5<x<=3/5`` and
``1<y<=7/5``; y=1 stays with the preceding item-183 certificate.  The
stopped boundary y-x=1/2 may be assigned to either policy.
"""

from __future__ import annotations

from fractions import Fraction

from flint import arb, ctx

from coupling_exact_arch_integral import kernel_exponential_integral
from coupling_four_fifths_to_half_local_certificate import (
    ExactFlow,
    rational_below,
)
from coupling_high_coordinate_rate_taylor_certificate import (
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
    (-q(3, 2), -q(6, 5)),
    (-q(6, 5), -q(9, 10)),
    (-q(9, 10), -q(3, 5)),
    (-q(3, 5), -q(2, 5)),
)
Y_BLOCKS = ((-q(9, 10), -q(4, 5)),)


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


def absolute_enclosure(value):
    if value > 0:
        return value
    if value < 0:
        return -value
    return interval(arb(0), max(abs(value.lower()), abs(value.upper())))


def separation_bound(first, second):
    return max(abs(first[0] - second[1]), abs(first[1] - second[0]))


def target_ok(first, second):
    return bool(
        separation_bound(first, second) <= HALF
        or characteristic_upper(first, second) <= TARGET_C
    )


def constants(block):
    return tuple(
        kernel_exponential_integral(rate, block[0], block[1], 2)
        for rate in RATES
    )


INTEGRALS = {
    (side, i): constants(block)
    for side, blocks in (("x", X_BLOCKS), ("y", Y_BLOCKS))
    for i, block in enumerate(blocks)
}


def arch_capacity(source_box, side, index, upper):
    source = interval(source_box[0], source_box[1])
    value = arb(0)
    for rate, integral_value in zip(RATES, INTEGRALS[(side, index)]):
        value += integral_value * (-rate * source).exp()
    value /= (source / 2).cosh()
    return rational_above(value) if upper else rational_below(value)


def prime_capacity(source_box, data, upper):
    width = (source_box[1] - source_box[0]) / PRIME_SUBCELLS
    endpoint = None
    for i in range(PRIME_SUBCELLS):
        left = source_box[0] + i * width
        source = interval(left, left + width)
        _power, logq, coefficient = data
        k, _kp, _kpp = theta2_triplet_positive(
            absolute_enclosure(source - logq)
        )
        value = coefficient * k / (source / 2).cosh()
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
    xnodes = [
        (("x", "arch", i), block, arch_capacity(x_box, "x", i, False))
        for i, block in enumerate(X_BLOCKS)
    ]
    ynodes = [
        (("y", "arch", i), block, arch_capacity(y_box, "y", i, True))
        for i, block in enumerate(Y_BLOCKS)
    ]
    for data in PRIME_DATA:
        power, logq, _coefficient = data
        if power in (2, 3, 4, 5):
            xnodes.append(
                (("x", "prime", power), shifted(x_box, logq),
                 prime_capacity(x_box, data, False))
            )
        if power in (7, 8, 9):
            ynodes.append(
                (("y", "prime", power), shifted(y_box, logq),
                 prime_capacity(y_box, data, True))
            )

    size = len(xnodes) + len(ynodes) + 2
    source = size - 2
    sink = size - 1
    flow = ExactFlow(size)
    for i, (_label, _box, capacity) in enumerate(xnodes):
        flow.add(source, i, capacity)
    for j, (_label, _box, demand) in enumerate(ynodes):
        flow.add(len(xnodes) + j, sink, demand)
    edges = []
    for i, (xlabel, xbox, _capacity) in enumerate(xnodes):
        for j, (ylabel, ybox, _demand) in enumerate(ynodes):
            if target_ok(xbox, ybox):
                flow.add(i, len(xnodes) + j, Fraction(10))
                edges.append((xlabel, ylabel))
    demand = sum((node[2] for node in ynodes), Fraction(0))
    return flow.maximum(source, sink), demand, xnodes, ynodes, edges


def exhaustive_cover():
    # A containing rectangle is safe: every retained product edge is checked
    # on the full rectangle, while the rate theorem later restricts to the
    # stated correlated source band.
    pending = [(q(1, 5), q(3, 5), arb(1), q(7, 5), 0)]
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
    deepest = max(leaves, key=lambda leaf: leaf[4])
    print("precision_bits:", ctx.prec)
    print("containing_source_rectangle: x in [1/5,3/5], y in [1,7/5]")
    print("attempted_cells:", attempted)
    print("certified_leaves:", len(leaves))
    print("maximum_depth:", deepest[4])
    print("deepest_cell:", deepest[:5])
    print("deepest_node_counts:", (len(deepest[5]), len(deepest[6])))
    print("deepest_edge_count:", len(deepest[7]))
    print("low_coordinate_selected_Hall: PASS")


if __name__ == "__main__":
    main()
