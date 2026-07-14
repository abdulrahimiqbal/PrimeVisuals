#!/usr/bin/env python3
"""Exact inward-midpoint edge on a full central pair shell.

Write an ordered pair as

    x = m-r/2,   y = m+r/2,   r >= 0.

This certificate covers

    7/20 <= m <= 2/5,        0 < r <= 7/10.

For each cell of a rational (m,r)-partition, let X and Y be rigorous interval
enclosures of the two source coordinates.  Select two independent finite
archimedean clocks.  The x clock targets a fixed interval Z_x satisfying

    |(z+y)/2| < 17/50       for every y in Y,

and the y clock analogously targets Z_y.  On every target cell the selected
constant density is bounded below uniformly over the whole relevant source
interval and is therefore dominated by that marginal.  Add the inward q=2
and q=3 single-coordinate clocks of both marginals; their target midpoint is
m-log(q)/2 and also lies in (-17/50,17/50).

The selected rate is greater than 1/2 on every source cell.  Reflection in
the origin and exchange of coordinates give the other three symmetry copies.
At r=0 the actual coalescent coupling is absorbing; the closed first r-cell
is used only to obtain a uniform limiting enclosure and the displayed policy
is explicitly overridden on the diagonal.
Every selected target has separation below 9/5.  The enlarged separation is
recorded explicitly: this is a directed midpoint-shell edge, not a completed
global HJB.  The unselected infinite small-jump activity and all upward shell
crossings still have to be charged by a smooth phase function.

Reproduce with:

    PYTHONPATH=/tmp/pvdeps:scripts python3 \
      scripts/coupling_central_midpoint_shell_certificate.py
"""

from flint import arb, ctx

from coupling_shoulder_anchor_phase_certificate import (
    k_signed,
    q,
    source_density_lower,
)
from coupling_shoulder_box_certificate import (
    C,
    K_TAIL,
    K_positive,
    LOG2,
    LOG3,
    PI,
    ZERO_GAP,
    interval,
)


ctx.prec = 180

M_LEFT = q(7, 20)
M_RIGHT = q(2, 5)
R_LEFT = arb(0)
R_RIGHT = q(7, 10)
TARGET_M = q(17, 50)
TARGET_GAP = q(1, 10000)
TARGET_CUTOFF = q(99, 100)
M_CELLS = 5
R_CELLS = 14
ARCH_CELLS = 2048
PRIME_CELLS = 512


def k_even(argument: arb) -> arb:
    if argument < 0:
        return K_positive(-argument)
    if argument > 0:
        return K_positive(argument)
    radius = max(abs(argument.lower()), abs(argument.upper()))
    # Evaluating the positive-branch theta formula on [-radius,radius]
    # encloses its restriction to [0,radius], hence encloses K(|argument|).
    # This avoids making a sign choice on a source cell crossing log(q).
    t = arb(0, radius)
    total = arb(0)
    for n in range(1, 5):
        nn = arb(n * n)
        v = PI * nn * (2 * t).exp()
        total += PI * nn * (q(5, 2) * t).exp() * (2 * v - 3) * (-v).exp()
    return total + K_TAIL


def minimum_inward_23(source_box: tuple[arb, arb]) -> arb:
    """Uniform q=2,3 rate, including cells that straddle log(q)."""
    left, right = source_box
    width = (right - left) / PRIME_CELLS
    global_lower = None
    for index in range(PRIME_CELLS):
        lo = left + index * width
        source = interval(lo, lo + width)
        value = (
            LOG2 / arb(2).sqrt() * k_even(source - LOG2)
            + LOG3 / arb(3).sqrt() * k_even(source - LOG3)
        ) / C(source)
        lower = value.lower()
        if global_lower is None or lower < global_lower:
            global_lower = lower
    assert global_lower is not None
    return global_lower


def integrate_one_marginal(left: arb, right: arb,
                           source_box: tuple[arb, arb]) -> arb:
    """Cellwise-constant finite subdensity dominated by one marginal."""
    assert right > left

    def one_sign(a: arb, b: arb, negative: bool) -> arb:
        if not b > a:
            return arb(0)
        width = (b - a) / ARCH_CELLS
        total = arb(0)
        for index in range(ARCH_CELLS):
            lo = a + index * width
            z = interval(lo, lo + width)
            density = (
                k_signed(z, negative).lower()
                * source_density_lower(z, source_box)
            )
            if density > 0:
                total += density * width
        return total

    total = arb(0)
    if left < -ZERO_GAP:
        total += one_sign(left, min(right, -ZERO_GAP), True)
    if right > ZERO_GAP:
        total += one_sign(max(left, ZERO_GAP), right, False)
    return total


def source_boxes(m_left: arb, m_right: arb,
                 r_left: arb, r_right: arb):
    # For x=m-r/2 and y=m+r/2 these are exact range enclosures on the cell.
    x_box = (m_left - r_right / 2, m_right - r_left / 2)
    y_box = (m_left + r_left / 2, m_right + r_right / 2)
    return x_box, y_box


def target_interval(other_box: tuple[arb, arb]) -> tuple[arb, arb]:
    # The rational gap makes both midpoint inequalities strict throughout the
    # closed source box.  Truncating at +/-0.99 only discards favorable mass.
    left = max(
        -TARGET_CUTOFF,
        -2 * TARGET_M - other_box[0] + TARGET_GAP,
    )
    right = min(
        TARGET_CUTOFF,
        2 * TARGET_M - other_box[1] - TARGET_GAP,
    )
    assert right > left
    return left, right


def midpoint_box(box_a: tuple[arb, arb],
                 box_b: tuple[arb, arb]) -> tuple[arb, arb]:
    return (box_a[0] + box_b[0]) / 2, (box_a[1] + box_b[1]) / 2


def separation_bound(box_a: tuple[arb, arb],
                     box_b: tuple[arb, arb]) -> arb:
    return max(abs(box_a[0] - box_b[1]), abs(box_a[1] - box_b[0]))


def certify_cell(m_left: arb, m_right: arb,
                 r_left: arb, r_right: arb) -> arb:
    x_box, y_box = source_boxes(m_left, m_right, r_left, r_right)
    zx = target_interval(y_box)
    zy = target_interval(x_box)

    x_arch = integrate_one_marginal(zx[0], zx[1], x_box)
    y_arch = integrate_one_marginal(zy[0], zy[1], y_box)
    x_prime = minimum_inward_23(x_box)
    y_prime = minimum_inward_23(y_box)
    selected = x_arch + y_arch + x_prime + y_prime
    assert selected > q(1, 2)

    # Exact target geometry for both finite archimedean single clocks.
    mx = midpoint_box(zx, y_box)
    my = midpoint_box(x_box, zy)
    assert mx[0] > -TARGET_M and mx[1] < TARGET_M
    assert my[0] > -TARGET_M and my[1] < TARGET_M
    assert separation_bound(zx, y_box) < q(9, 5)
    assert separation_bound(x_box, zy) < q(9, 5)

    # A single inward q jump changes the midpoint by -log(q)/2.  The source
    # m itself, not the independent rectangular enclosure of X times Y, is
    # the correlated state variable on this partition cell.
    for prime in (arb(2), arb(3)):
        target_left = m_left - prime.log() / 2
        target_right = m_right - prime.log() / 2
        assert target_left > -TARGET_M
        assert target_right < TARGET_M
        assert r_right + prime.log() < q(9, 5)

    return selected


def main() -> None:
    m_width = (M_RIGHT - M_LEFT) / M_CELLS
    r_width = (R_RIGHT - R_LEFT) / R_CELLS
    worst = None
    worst_cell = None

    for i in range(M_CELLS):
        ml = M_LEFT + i * m_width
        mr = ml + m_width
        for j in range(R_CELLS):
            rl = R_LEFT + j * r_width
            rr = rl + r_width
            rate = certify_cell(ml, mr, rl, rr)
            if worst is None or rate.lower() < worst.lower():
                worst = rate
                worst_cell = (ml, mr, rl, rr)

    assert worst is not None and worst_cell is not None
    assert worst > q(1, 2)
    print("source_midpoint_shell:", M_LEFT, M_RIGHT)
    print("source_separation_range:", R_LEFT, R_RIGHT)
    print("target_midpoint_cutoff:", TARGET_M)
    print("partition:", M_CELLS, "x", R_CELLS)
    print("worst_cell_(mL,mR,rL,rR):", worst_cell)
    print("worst_selected_rate:", worst)
    print("worst_margin_over_half:", worst - q(1, 2))
    print("certificate: PASS")


if __name__ == "__main__":
    main()
