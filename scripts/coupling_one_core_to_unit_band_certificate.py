#!/usr/bin/env python3
"""Hard entrance from the one-core compact region to separation below one.

Let an unordered pair lie in [-5/4,5/4]^2 and suppose that at least one
coordinate has absolute value at most 3/5.  Put

    c(u,v) = |m| + (r-2|m|)_+/4,
    S_1 = {(u,v): c(u,v) <= 2/5 or |u-v| <= 1},

Outside this closed target, reflection and exchange put the source in the
symmetry-reduced
wedge

    -3/5 <= x < 1/4,   4/5 < y <= 5/4,   y-x > 1.

(The endpoint y=4/5 is harmless and is included in the interval cover.)  On
each rational source cell this certificate selects two independent finite
archimedean clocks.  The x-target interval lies in the intersection of all
unit balls about the cell's y-coordinates; the y-target interval is defined
symmetrically.  It also selects every inward prime-power clock

    x -> x+log(q),       y -> y-log(q)

whose complete correlated source cell satisfies |(y-x)-log(q)|<1.  All
selected clocks are disjoint within each marginal and every event enters
S_1.  Cellwise constant archimedean densities and interval lower envelopes
for the prime atoms make the marginal ledger rigorous.

This is a hard-stage certificate only.  It leaves all unselected Levy
activity untouched and does not assert that the process remains in S_1.

Reproduce with

    PYTHONPATH=/tmp/pvdeps:scripts python3 \
      scripts/coupling_one_core_to_unit_band_certificate.py
"""

from __future__ import annotations

from flint import arb, ctx

from coupling_wide_separation_band_certificate import (
    C,
    integrate_one_marginal,
    interval,
    k_positive_unchecked,
    q,
)


ctx.prec = 180

X_LEFT = -q(3, 5)
X_RIGHT = q(1, 4)
Y_LEFT = q(4, 5)
Y_RIGHT = q(5, 4)
TARGET_R = arb(1)
TARGET_GAP = q(1, 10000)
TARGET_COORD = q(7, 5)  # keeps every K enclosure inside |z|<3/2

X_CELLS = 34             # width 1/40
Y_CELLS = 18             # width 1/40
PRIME_CELLS = 256


def prime_power_data() -> tuple[tuple[int, int], ...]:
    # q<=17 is enough: throughout the source wedge r<=37/20, and an inward
    # atom can satisfy |r-log(q)|<1 only if log(q)<57/20, hence q<18.
    return (
        (2, 2), (3, 3), (4, 2), (5, 5), (7, 7), (8, 2),
        (9, 3), (11, 11), (13, 13), (16, 2), (17, 17),
    )


PRIME_DATA = tuple(
    (
        prime_power,
        arb(prime_power).log(),
        arb(prime).log() / arb(prime_power).sqrt(),
    )
    for prime_power, prime in prime_power_data()
)


def kernel_even(argument: arb) -> arb:
    """Global even theta enclosure, including intervals crossing zero."""
    if argument < 0:
        return k_positive_unchecked(-argument)
    if argument > 0:
        return k_positive_unchecked(argument)
    radius = max(abs(argument.lower()), abs(argument.upper()))
    return k_positive_unchecked(arb(0, radius))


def source_box(left: arb, right: arb) -> tuple[arb, arb]:
    return left, right


def arch_target(other: tuple[arb, arb]) -> tuple[arb, arb]:
    left = max(-TARGET_COORD, other[1] - TARGET_R + TARGET_GAP)
    right = min(TARGET_COORD, other[0] + TARGET_R - TARGET_GAP)
    assert right > left
    return left, right


def selected_prime_powers(r_left: arb, r_right: arb):
    selected = []
    for data in PRIME_DATA:
        _prime_power, logq, _coefficient = data
        if max(abs(r_left - logq), abs(r_right - logq)) < TARGET_R:
            selected.append(data)
    assert selected
    return tuple(selected)


def minimum_prime_rate(
    source: tuple[arb, arb],
    direction: int,
    selected,
) -> arb:
    left, right = source
    width = (right - left) / PRIME_CELLS
    global_lower = None
    for index in range(PRIME_CELLS):
        lo = left + index * width
        s = interval(lo, lo + width)
        value = arb(0)
        for _prime_power, logq, coefficient in selected:
            value += coefficient * kernel_even(s + direction * logq) / C(s)
        lower = value.lower()
        if global_lower is None or lower < global_lower:
            global_lower = lower
    assert global_lower is not None
    return global_lower


def separation_bound(a: tuple[arb, arb],
                     b: tuple[arb, arb]) -> arb:
    return max(abs(a[0] - b[1]), abs(a[1] - b[0]))


def certify_cell(
    xl: arb, xr: arb, yl: arb, yr: arb
) -> arb | None:
    # The cell contains a source outside S_1 iff its maximum possible
    # separation is strictly above one.  Certifying the whole rectangle only
    # strengthens the cover along cells that straddle the boundary.
    r_left = yl - xr
    r_right = yr - xl
    if not r_right > TARGET_R:
        return None

    x_box = source_box(xl, xr)
    y_box = source_box(yl, yr)
    zx = arch_target(y_box)
    zy = arch_target(x_box)
    selected_q = selected_prime_powers(r_left, r_right)

    arch_x = integrate_one_marginal(zx[0], zx[1], x_box)
    arch_y = integrate_one_marginal(zy[0], zy[1], y_box)
    prime_x = minimum_prime_rate(x_box, +1, selected_q)
    prime_y = minimum_prime_rate(y_box, -1, selected_q)
    selected_rate = arch_x + arch_y + prime_x + prime_y
    assert selected_rate > q(1, 2)

    assert separation_bound(zx, y_box) < TARGET_R
    assert separation_bound(x_box, zy) < TARGET_R
    for _prime_power, logq, _coefficient in selected_q:
        assert max(abs(r_left - logq), abs(r_right - logq)) < TARGET_R

    return selected_rate


def main() -> None:
    assert q(57, 20).exp() < 18
    x_width = (X_RIGHT - X_LEFT) / X_CELLS
    y_width = (Y_RIGHT - Y_LEFT) / Y_CELLS
    worst = None
    worst_cell = None
    certified_cells = 0

    for i in range(X_CELLS):
        xl = X_LEFT + i * x_width
        xr = xl + x_width
        for j in range(Y_CELLS):
            yl = Y_LEFT + j * y_width
            yr = yl + y_width
            rate = certify_cell(xl, xr, yl, yr)
            if rate is None:
                continue
            certified_cells += 1
            if worst is None or rate.lower() < worst.lower():
                worst = rate
                worst_cell = (
                    xl, xr, yl, yr,
                    tuple(data[0] for data in selected_prime_powers(
                        yl - xr, yr - xl
                    )),
                )

    assert worst is not None and worst_cell is not None
    assert worst > q(1, 2)
    print("precision_bits:", ctx.prec)
    print("source_wedge_x: [-3/5,1/4]")
    print("source_wedge_y: [4/5,5/4]")
    print("target: separation < 1")
    print("partition:", X_CELLS, "x", Y_CELLS)
    print("certified_boundary_and_complement_cells:", certified_cells)
    print("worst_cell_(xL,xR,yL,yR,qs):", worst_cell)
    print("worst_selected_rate:", worst)
    print("worst_margin_over_half:", worst - q(1, 2))
    print("certificate: PASS")


if __name__ == "__main__":
    main()
