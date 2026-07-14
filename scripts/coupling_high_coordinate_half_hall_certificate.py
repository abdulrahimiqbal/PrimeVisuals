#!/usr/bin/env python3
"""Exact block-Hall ledger for the high-coordinate half-shrink band.

Development certificate for ordered sources

    4/5 <= x < y <= 7/5,      1/2 < y-x <= 4/5.

The source is parameterized by ``e=7/5-y``.  A separation single from the
x marginal and one from the y marginal are kept.  The remaining y target
restriction ``[-4/5,x-1/2]`` is transported from four disjoint x blocks via
an exact Fraction-valued 4-by-3 max flow.  A separate product coupling on
``[-9/10,-4/5]`` supplies the calibrated tail reserve.  Every continuous
capacity is a finite positive theta/Levy series, so omitted terms have the
right sign; every prime capacity is a correlated Arb lower envelope.

This file is intentionally self-auditing: all product edges recheck the full
rectangle target, marginal target intervals are disjoint, and source boxes
are recursively refined rather than inferred from point samples.
"""

from __future__ import annotations

from fractions import Fraction

from flint import arb, ctx

from coupling_exact_arch_integral import kernel_levy_integral_lower
from coupling_four_fifths_to_half_local_certificate import (
    ExactFlow,
    fraction_arb,
    kernel_even,
    minimum_atom_sum_rate,
    rational_below,
)
from coupling_unit_to_four_fifths_union_certificate import characteristic_upper
from coupling_wide_separation_band_certificate import C, interval, q


ctx.prec = 220

HALF = q(1, 2)
TARGET_C = q(2, 5)
TAIL = (-q(9, 10), -q(4, 5))
GAP = q(1, 10**12)
PRIME_CELLS = 32

PRIME_DATA = tuple(
    (
        prime_power,
        arb(prime_power).log(),
        arb(prime).log() / arb(prime_power).sqrt(),
    )
    for prime_power, prime in (
        (2, 2), (3, 3), (4, 2), (5, 5), (7, 7), (8, 2), (9, 3)
    )
)


def separation_bound(first, second):
    return max(abs(first[0] - second[1]), abs(first[1] - second[0]))


def target_ok(first, second) -> bool:
    return bool(
        separation_bound(first, second) <= HALF
        or characteristic_upper(first, second) <= TARGET_C
    )


def arch_lower(source_box, target) -> arb:
    """Uniform lower rate on a target wholly to one side of a positive source."""

    sl, sr = source_box
    left, right = target
    assert sl > 0 and sr >= sl and right > left
    c_upper = C(sr).upper()
    if right <= sl:
        numerator = kernel_levy_integral_lower(sr, left, right, 8, 2)
    else:
        assert left > sr
        numerator = kernel_levy_integral_lower(sl, left, right, 8, 2)
    return numerator / c_upper


def shifted(source_box, direction: int, logq: arb):
    return source_box[0] + direction * logq, source_box[1] + direction * logq


def minimum_prime_sum(source_box, selected) -> arb:
    """Correlated lower envelope, with a finer local mesh than the old helper."""

    assert selected
    left, right = source_box
    if right == left:
        source = left
        value = arb(0)
        for data, direction in selected:
            _power, logq, coefficient = data
            value += coefficient * kernel_even(source + direction * logq) / C(source)
        return value.lower()
    width = (right - left) / PRIME_CELLS
    minimum = None
    for index in range(PRIME_CELLS):
        lo = left + index * width
        source = interval(lo, lo + width)
        value = arb(0)
        for data, direction in selected:
            _power, logq, coefficient = data
            value += coefficient * kernel_even(source + direction * logq) / C(source)
        lower = value.lower()
        if minimum is None or lower < minimum:
            minimum = lower
    assert minimum is not None
    return minimum


def arch_capacity(source_box, target) -> Fraction:
    return rational_below(arch_lower(source_box, target))


def prime_ledger(source_box, other_box, marginal: str):
    """Return correlated singles and individual non-single prime nodes.

    Keeping an ambiguous atom as its own node is essential.  In particular,
    the y,q=3 target crosses the moving boundary x-1/2.  Refining ordinary
    boxes across that irrational source curve would never give a finite
    cover, whereas the atom has a fixed full-box product edge to X_pin.
    """

    single_terms = []
    nodes = []
    for data in PRIME_DATA:
        power, logq, _coefficient = data
        for direction in (-1, +1):
            atom_box = shifted(source_box, direction, logq)
            if target_ok(atom_box, other_box):
                single_terms.append((data, direction))
                continue
            # This is only a constructive finite selection.  Targets outside
            # the compact block ledger are discarded.
            if atom_box[0] < -1 or atom_box[1] > 1:
                continue
            lower = minimum_prime_sum(source_box, ((data, direction),))
            if lower <= 0:
                continue
            capacity = rational_below(lower)
            nodes.append(
                ((marginal, "prime", power, direction), atom_box, capacity)
            )
    singles = Fraction(0)
    if single_terms:
        lower = minimum_prime_sum(source_box, tuple(single_terms))
        if lower > 0:
            singles = rational_below(lower)
    return singles, tuple(nodes)


def flow_capacity(x_box, y_box, x_blocks, y_blocks):
    x_nodes = [
        (("x", "arch", i), block, arch_capacity(x_box, block))
        for i, block in enumerate(x_blocks)
    ]
    y_nodes = [
        (("y", "arch", i), block, arch_capacity(y_box, block))
        for i, block in enumerate(y_blocks)
    ]
    x_singles, x_prime_nodes = prime_ledger(x_box, y_box, "x")
    y_singles, y_prime_nodes = prime_ledger(y_box, x_box, "y")
    x_nodes.extend(x_prime_nodes)
    y_nodes.extend(y_prime_nodes)

    size = len(x_nodes) + len(y_nodes) + 2
    source = size - 2
    sink = size - 1
    flow = ExactFlow(size)
    for i, (_label, _box, capacity) in enumerate(x_nodes):
        flow.add(source, i, capacity)
    for j, (_label, _box, capacity) in enumerate(y_nodes):
        flow.add(len(x_nodes) + j, sink, capacity)
    edges = []
    for i, (xlabel, xb, _xcap) in enumerate(x_nodes):
        for j, (ylabel, yb, _ycap) in enumerate(y_nodes):
            if target_ok(xb, yb):
                flow.add(i, len(x_nodes) + j, Fraction(10))
                edges.append((xlabel, ylabel))
    result = flow.maximum(source, sink)
    return (
        x_singles + y_singles,
        result,
        tuple(x_nodes),
        tuple(y_nodes),
        tuple(edges),
    )


def certify_cell(xl: arb, xr: arb, el: arb, er: arb):
    """Certify one parameter cell, with y=7/5-e."""

    assert xl < xr and el < er
    x_box = (xl, xr)
    y_box = (q(7, 5) - er, q(7, 5) - el)

    # Intersections of all pointwise half-balls over the correlated cell.
    x_single = (q(9, 10) - el + GAP, q(19, 10) - er - GAP)
    y_single = (xr - HALF + GAP, xl + HALF - GAP)
    assert x_single[1] > x_single[0] > xr
    assert y_single[0] < y_single[1] < y_box[0]
    assert target_ok(x_single, y_box)
    assert target_ok(x_box, y_single)

    x_blocks = (
        (-q(4, 5) + GAP, -q(2, 5)),
        (-q(2, 5), arb(0)),
        (arb(0), q(2, 5)),
        (q(2, 5), q(7, 10)),
    )
    y_positive_right = xl - HALF - GAP
    assert y_positive_right > 0 and y_positive_right <= q(2, 5)
    y_blocks = (
        (-q(4, 5) + GAP, -q(2, 5)),
        (-q(2, 5), arb(0)),
        (arb(0), y_positive_right),
    )

    # All marginal pieces are pairwise disjoint (endpoints are harmless, but
    # the rational GAP makes this decidable without a null-set convention).
    assert x_blocks[-1][1] < x_single[0]
    assert TAIL[1] <= x_blocks[0][0]
    assert TAIL[1] <= y_blocks[0][0]
    assert y_blocks[-1][1] < y_single[0]

    # The continuous single pieces and the prime-atom ledger are mutually
    # singular, so their capacities add without marginal reuse.
    singles = arch_capacity(x_box, x_single)
    singles += arch_capacity(y_box, y_single)
    prime_singles, central, x_nodes, y_nodes, edges = flow_capacity(
        x_box, y_box, x_blocks, y_blocks
    )
    singles += prime_singles
    tail_x = arch_capacity(x_box, TAIL)
    tail_y = arch_capacity(y_box, TAIL)
    tail = min(tail_x, tail_y)
    assert target_ok(TAIL, TAIL)
    total = singles + central + tail
    return total, (x_nodes, y_nodes, edges, singles, central, tail)


def certify_square_cell(xl: arb, xr: arb, bl: arb, br: arb):
    """Certify a box in the square parametrization e=b(9/10-x)."""

    assert xl < xr and bl < br
    # On the box, e is increasing in b and decreasing in x.
    el = bl * (q(9, 10) - xr)
    er = br * (q(9, 10) - xl)
    assert el > -q(1, 10**20) and er < q(10000000000000000001, 10**20)
    return certify_cell(xl, xr, el, er)


def endpoint_probe() -> None:
    width = q(1, 10**10)
    total, details = certify_cell(
        q(4, 5), q(4, 5) + width,
        arb(0), width,
    )
    x_nodes, y_nodes, edges, singles, central, tail = details
    print("endpoint_probe_width:", width)
    print(
        "x_nodes:",
        tuple((label, box, fraction_arb(cap)) for label, box, cap in x_nodes),
    )
    print(
        "y_nodes:",
        tuple((label, box, fraction_arb(cap)) for label, box, cap in y_nodes),
    )
    print("edges:", edges)
    print("singles:", fraction_arb(singles))
    print("central_flow:", fraction_arb(central))
    print("tail_flow:", fraction_arb(tail))
    print("total:", fraction_arb(total))
    print("margin:", fraction_arb(total - Fraction(1, 2)))
    assert total > Fraction(1, 2)


def exhaustive_cover():
    """Adaptive exact cover of [.8,.9]x[0,1] in the (x,b) coordinates."""

    pending = [(q(4, 5), q(9, 10), arb(0), arb(1), 0)]
    leaves = []
    maximum_depth = 0
    attempted = 0
    while pending:
        attempted += 1
        xl, xr, bl, br, depth = pending.pop()
        total, details = certify_square_cell(xl, xr, bl, br)
        if total > Fraction(1, 2):
            leaves.append((xl, xr, bl, br, depth, total, details))
            maximum_depth = max(maximum_depth, depth)
            continue
        assert depth < 30
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
        if attempted % 100 == 0:
            print(
                "cover_progress_(attempted,leaves,pending,depth):",
                (attempted, len(leaves), len(pending), depth),
                "cell:",
                (xl, xr, bl, br),
                flush=True,
            )
    worst = min(leaves, key=lambda leaf: leaf[5])
    return leaves, maximum_depth, worst


def main() -> None:
    endpoint_probe()
    print("endpoint_probe: PASS")
    leaves, maximum_depth, worst = exhaustive_cover()
    print("certified_leaves:", len(leaves))
    print("maximum_depth:", maximum_depth)
    print("worst_cell_(xL,xR,bL,bR,depth):", worst[:5])
    print("worst_rate:", fraction_arb(worst[5]))
    print("worst_margin:", fraction_arb(worst[5] - Fraction(1, 2)))
    print("exhaustive_square_cover: PASS")


if __name__ == "__main__":
    main()
