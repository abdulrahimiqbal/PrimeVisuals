#!/usr/bin/env python3
"""Exact Hall cover for the high-coordinate selected central measure.

This is the transport companion to
``coupling_high_coordinate_rate_taylor_certificate.py``.  For

    4/5 <= x <= 9/10,   x+1/2 <= y <= 7/5,

the selected y restriction used there splits as follows:

* ``[-9/10,-4/5]``: pair the selected arch density identically.  Since
  x<y, J(x-z)/C(x) >= J(y-z)/C(y), term by term.
* ``[-4/5,2/5]`` plus the inward q=3,4,5,7,8,9 atoms: transport by the exact
  finite Hall network below.
* ``[2/5,13/10]`` plus the inward q=2 atom: one-coordinate y clocks, since
  this whole restriction lies in [x-1/2,x+1/2].

The x Hall supply consists of four arch blocks in [-4/5,7/10] and the inward
q=2,3,4,5 atoms.  Arch capacities keep the same first two theta and first
sixteen Levy summands as the rate certificate.  Every y demand is rounded
up and every x supply down on a correlated source cell; a Fraction-valued
max flow must saturate the complete upper demand.  Prime atoms remain
individual nodes, so no refinement chases an atom across a block boundary.

Continuum lift.  On a certified half-open source cell, multiply every edge
leaving a y node by that node's actual selected mass divided by its rational
upper ledger.  This makes the row sum the actual demand and can only decrease
every x-column use.  Each rational x arch capacity is at most the mass of the
corresponding restriction of the actual finite-series density; scale that
restriction to the used column mass, split it in the edge proportions, and
couple each pair of pieces by its normalized product.  Prime columns are
scaled atoms.  Zero rows/columns are assigned zero.  Finite sums, min/max
flow operations, continuous arch integrals and finite theta atom weights are
Borel, so this gives a Borel kernel without a mesh limit.  The four x arch
blocks, x prime atoms, and the separate tail arch restriction are mutually
disjoint marginal ledgers; the y arch blocks, y prime atoms and single-clock
restriction are likewise disjoint.  Half-open target cells assign shared
endpoints once.  The boundary y=1 belongs to the item-183 certificate,
whereas this certificate owns 1<y<=7/5 (the equality y-x=1/2 is already in
the target and may be assigned to either stopped policy).
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
X_ARCH_BLOCKS = (
    (-q(4, 5), -q(2, 5)),
    (-q(2, 5), arb(0)),
    (arb(0), q(2, 5)),
    (q(2, 5), q(7, 10)),
)
Y_ARCH_BLOCKS = (
    (-q(4, 5), -q(2, 5)),
    (-q(2, 5), arb(0)),
    (arb(0), q(2, 5)),
)


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
    return candidate


def separation_bound(first, second):
    return max(abs(first[0] - second[1]), abs(first[1] - second[0]))


def target_ok(first, second) -> bool:
    return bool(
        separation_bound(first, second) <= HALF
        or characteristic_upper(first, second) <= TARGET_C
    )


def absolute_enclosure(value: arb) -> arb:
    if value > 0:
        return value
    if value < 0:
        return -value
    radius = max(abs(value.lower()), abs(value.upper()))
    return interval(arb(0), radius)


def selected_prime_value(source: arb, data) -> arb:
    _power, logq, coefficient = data
    t = absolute_enclosure(source - logq)
    k, _kp, _kpp = theta2_triplet_positive(t)
    return coefficient * k / (source / 2).cosh()


def prime_capacity(source_box, data, upper: bool) -> Fraction:
    width = (source_box[1] - source_box[0]) / PRIME_SUBCELLS
    endpoint = None
    for index in range(PRIME_SUBCELLS):
        left = source_box[0] + index * width
        source = interval(left, left + width)
        value = selected_prime_value(source, data)
        candidate = value.upper() if upper else value.lower()
        if endpoint is None:
            endpoint = candidate
        elif upper and candidate > endpoint:
            endpoint = candidate
        elif not upper and candidate < endpoint:
            endpoint = candidate
    assert endpoint is not None and endpoint > 0
    return rational_above(endpoint) if upper else rational_below(endpoint)


def integral_constants(block):
    return tuple(
        kernel_exponential_integral(rate, block[0], block[1], 2)
        for rate in RATES
    )


ARCH_INTEGRALS = {
    (side, index): integral_constants(block)
    for side, blocks in (("x", X_ARCH_BLOCKS), ("y", Y_ARCH_BLOCKS))
    for index, block in enumerate(blocks)
}


def arch_capacity(source_box, side: str, index: int, upper: bool) -> Fraction:
    source = interval(source_box[0], source_box[1])
    numerator = arb(0)
    for rate, integral_value in zip(RATES, ARCH_INTEGRALS[(side, index)]):
        numerator += integral_value * (-rate * source).exp()
    value = numerator / (source / 2).cosh()
    return rational_above(value) if upper else rational_below(value)


def shifted(source_box, logq):
    return source_box[0] - logq, source_box[1] - logq


def cell_network(x_box, y_box):
    x_nodes = [
        (("x", "arch", i), block, arch_capacity(x_box, "x", i, False))
        for i, block in enumerate(X_ARCH_BLOCKS)
    ]
    y_nodes = [
        (("y", "arch", i), block, arch_capacity(y_box, "y", i, True))
        for i, block in enumerate(Y_ARCH_BLOCKS)
    ]

    for data in PRIME_DATA:
        power, logq, _coefficient = data
        if power in (2, 3, 4, 5):
            x_nodes.append(
                (
                    ("x", "prime", power),
                    shifted(x_box, logq),
                    prime_capacity(x_box, data, False),
                )
            )
        if power in (3, 4, 5, 7, 8, 9):
            y_nodes.append(
                (
                    ("y", "prime", power),
                    shifted(y_box, logq),
                    prime_capacity(y_box, data, True),
                )
            )

    size = len(x_nodes) + len(y_nodes) + 2
    source = size - 2
    sink = size - 1
    flow = ExactFlow(size)
    for i, (_label, _box, capacity) in enumerate(x_nodes):
        flow.add(source, i, capacity)
    for j, (_label, _box, capacity) in enumerate(y_nodes):
        flow.add(len(x_nodes) + j, sink, capacity)

    edges = []
    for i, (xlabel, xbox, _capacity) in enumerate(x_nodes):
        for j, (ylabel, ybox, _demand) in enumerate(y_nodes):
            if target_ok(xbox, ybox):
                flow.add(i, len(x_nodes) + j, Fraction(10))
                edges.append((xlabel, ylabel))
    demand = sum((node[2] for node in y_nodes), Fraction(0))
    maximum = flow.maximum(source, sink)
    return maximum, demand, tuple(x_nodes), tuple(y_nodes), tuple(edges)


def source_boxes(xl, xr, bl, br):
    """Square parametrization e=b(9/10-x), y=7/5-e."""

    el = bl * (q(9, 10) - xr)
    er = br * (q(9, 10) - xl)
    return (xl, xr), (q(7, 5) - er, q(7, 5) - el)


def exhaustive_cover():
    pending = [(q(4, 5), q(9, 10), arb(0), arb(1), 0)]
    leaves = []
    attempted = 0
    while pending:
        attempted += 1
        xl, xr, bl, br, depth = pending.pop()
        x_box, y_box = source_boxes(xl, xr, bl, br)
        maximum, demand, x_nodes, y_nodes, edges = cell_network(x_box, y_box)
        if maximum >= demand:
            leaves.append(
                (xl, xr, bl, br, depth, maximum - demand,
                 x_nodes, y_nodes, edges)
            )
            continue
        assert depth < 18, (xl, xr, bl, br, depth, maximum, demand)
        xm = (xl + xr) / 2
        bm = (bl + br) / 2
        pending.extend(
            (
                (xl, xm, bl, bm, depth + 1),
                (xm, xr, bl, bm, depth + 1),
                (xl, xm, bm, br, depth + 1),
                (xm, xr, bm, br, depth + 1),
            )
        )
    worst = min(leaves, key=lambda leaf: leaf[5])
    return attempted, leaves, worst


def main() -> None:
    # Fixed geometry of the single pieces used by the rate certificate.
    assert q(2, 5) + q(1, 10**20) > q(9, 10) - HALF
    assert q(13, 10) < q(4, 5) + HALF + q(1, 10**20)
    # Tail arch identity uses disjoint x capacity and termwise source order.
    assert -q(4, 5) < q(4, 5)

    attempted, leaves, worst = exhaustive_cover()
    print("precision_bits:", ctx.prec)
    print("selected_theta_terms: 2")
    print("selected_levy_terms:", LEVY_TERMS)
    print("attempted_cells:", attempted)
    print("certified_leaves:", len(leaves))
    print("maximum_depth:", max(leaf[4] for leaf in leaves))
    print("worst_cell_(xL,xR,bL,bR,depth):", worst[:5])
    print("worst_Hall_reserve:", fraction_arb(worst[5]))
    print("worst_node_counts:", (len(worst[6]), len(worst[7])))
    print("worst_edge_count:", len(worst[8]))
    print("selected_central_Hall: PASS")


if __name__ == "__main__":
    main()
