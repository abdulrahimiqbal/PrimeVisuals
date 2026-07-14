#!/usr/bin/env python3
"""Exact entrance clock from the wide-separation central band.

For an ordered pair x=m-r/2 <= y=m+r/2, this certificate covers

    |m| <= 17/50,       1 < r <= 9/5.

On each rational (m,r)-cell select two independent finite archimedean
subclocks.  The x-coordinate target interval is chosen so that |z-y|<1 for
every y in the source enclosure; the y-coordinate interval is analogous.
Add the inward x -> x+log(q) and y -> y-log(q) atoms for q=2,3,4,5 whenever
the whole r-cell satisfies |r-log(q)|<1.  All selected events therefore enter
the strict lower set r<1.  Every arch density is a cellwise constant lower
envelope dominated uniformly over its source-coordinate interval.

The selected rate is uniformly greater than 1/2.  Thus the hard lower-set
indicator has killed generator at most minus this rate at every r>1.  At
r=1 the policy is stopped/overridden; no pointwise generator is claimed on
the discontinuity.  This certificate does not by itself charge returns from
r<1 to r>1 in a later global phase ledger.

Every selected target has |midpoint|<5/4 and separation <1.  Reflection and
exchange give all symmetry copies.

Reproduce with:

    PYTHONPATH=/tmp/pvdeps python3 \
      scripts/coupling_wide_separation_band_certificate.py
"""

from flint import arb, ctx


ctx.prec = 180


def q(p: int, d: int = 1) -> arb:
    return arb(p) / d


def interval(left: arb, right: arb) -> arb:
    assert right > left
    return arb((left + right) / 2, (right - left) / 2 + arb("1e-50"))


PI = arb.pi()
LOGS = {
    2: arb(2).log(),
    3: arb(3).log(),
    4: arb(4).log(),
    5: arb(5).log(),
}
COEFFICIENTS = {
    2: LOGS[2] / arb(2).sqrt(),
    3: LOGS[3] / arb(3).sqrt(),
    4: LOGS[2] / arb(2),
    5: LOGS[5] / arb(5).sqrt(),
}

M_BOUND = q(17, 50)
R_LEFT = arb(1)
R_RIGHT = q(9, 5)
TARGET_R = arb(1)
TARGET_GAP = q(1, 10000)
TARGET_COORD = q(5, 4)
M_CELLS = 34
R_CELLS = 32
ARCH_CELLS = 1024
PRIME_CELLS = 256


def C(x: arb) -> arb:
    return (x / 2).cosh()


def J(h: arb) -> arb:
    assert h > 0
    return (-h / 2).exp() / (1 - (-2 * h).exp())


tail_first = 20 * arb(5) ** 4 * (-arb(3) * 25).exp()
tail_ratio = q(6, 5) ** 4 * (-arb(3) * 11).exp()
theta_tail_bound = tail_first / (1 - tail_ratio)
assert theta_tail_bound < arb("1e-28")
K_TAIL = arb(0, "1e-28")


def k_positive_unchecked(t: arb) -> arb:
    total = arb(0)
    for n in range(1, 5):
        nn = arb(n * n)
        v = PI * nn * (2 * t).exp()
        total += PI * nn * (q(5, 2) * t).exp() * (2 * v - 3) * (-v).exp()
    return total + K_TAIL


def K_positive(t: arb) -> arb:
    assert t >= 0
    assert t < q(3, 2)
    return k_positive_unchecked(t)


def K_even(t: arb) -> arb:
    if t < 0:
        return K_positive(-t)
    if t > 0:
        return K_positive(t)
    radius = max(abs(t.lower()), abs(t.upper()))
    return k_positive_unchecked(arb(0, radius))


def source_density_lower(z: arb, source_box: tuple[arb, arb]) -> arb:
    left, right = source_box
    distance = max(abs(z - left).upper(), abs(z - right).upper())
    c_upper = max(C(left).upper(), C(right).upper())
    return J(distance).lower() / c_upper


def integrate_one_marginal(left: arb, right: arb,
                           source_box: tuple[arb, arb]) -> arb:
    assert right > left
    width = (right - left) / ARCH_CELLS
    total = arb(0)
    for index in range(ARCH_CELLS):
        lo = left + index * width
        z = interval(lo, lo + width)
        density = K_even(z).lower() * source_density_lower(z, source_box)
        if density > 0:
            total += density * width
    return total


def minimum_prime_rate(source_box: tuple[arb, arb], direction: int,
                       selected_q: tuple[int, ...]) -> arb:
    left, right = source_box
    width = (right - left) / PRIME_CELLS
    global_lower = None
    for index in range(PRIME_CELLS):
        lo = left + index * width
        source = interval(lo, lo + width)
        value = arb(0)
        for prime_power in selected_q:
            target = source + direction * LOGS[prime_power]
            value += COEFFICIENTS[prime_power] * K_even(target) / C(source)
        lower_value = value.lower()
        if global_lower is None or lower_value < global_lower:
            global_lower = lower_value
    assert global_lower is not None
    return global_lower


def source_boxes(m_left: arb, m_right: arb,
                 r_left: arb, r_right: arb):
    return (
        (m_left - r_right / 2, m_right - r_left / 2),
        (m_left + r_left / 2, m_right + r_right / 2),
    )


def arch_target(other_box: tuple[arb, arb]) -> tuple[arb, arb]:
    left = max(-TARGET_COORD, other_box[1] - 1 + TARGET_GAP)
    right = min(TARGET_COORD, other_box[0] + 1 - TARGET_GAP)
    assert right > left
    return left, right


def selected_prime_powers(r_left: arb, r_right: arb) -> tuple[int, ...]:
    selected = []
    for prime_power in (2, 3, 4, 5):
        logq = LOGS[prime_power]
        if max(abs(r_left - logq), abs(r_right - logq)) < 1:
            selected.append(prime_power)
    assert selected
    return tuple(selected)


def separation_bound(box_a: tuple[arb, arb],
                     box_b: tuple[arb, arb]) -> arb:
    return max(abs(box_a[0] - box_b[1]), abs(box_a[1] - box_b[0]))


def midpoint_bound(box_a: tuple[arb, arb],
                   box_b: tuple[arb, arb]) -> arb:
    return max(
        abs((box_a[0] + box_b[0]) / 2),
        abs((box_a[1] + box_b[1]) / 2),
    )


def certify_cell(m_left: arb, m_right: arb,
                 r_left: arb, r_right: arb) -> arb:
    x_box, y_box = source_boxes(m_left, m_right, r_left, r_right)
    zx = arch_target(y_box)
    zy = arch_target(x_box)
    selected_q = selected_prime_powers(r_left, r_right)

    arch = integrate_one_marginal(zx[0], zx[1], x_box)
    arch += integrate_one_marginal(zy[0], zy[1], y_box)
    prime = minimum_prime_rate(x_box, +1, selected_q)
    prime += minimum_prime_rate(y_box, -1, selected_q)
    selected = arch + prime
    assert selected > q(1, 2)

    assert separation_bound(zx, y_box) < TARGET_R
    assert separation_bound(x_box, zy) < TARGET_R
    assert midpoint_bound(zx, y_box) < TARGET_COORD
    assert midpoint_bound(x_box, zy) < TARGET_COORD
    for prime_power in selected_q:
        logq = LOGS[prime_power]
        assert max(abs(r_left - logq), abs(r_right - logq)) < TARGET_R
        assert M_BOUND + logq / 2 < TARGET_COORD
    return selected


def main() -> None:
    m_width = 2 * M_BOUND / M_CELLS
    r_width = (R_RIGHT - R_LEFT) / R_CELLS
    worst = None
    worst_cell = None
    for i in range(M_CELLS):
        ml = -M_BOUND + i * m_width
        mr = ml + m_width
        for j in range(R_CELLS):
            rl = R_LEFT + j * r_width
            rr = rl + r_width
            rate = certify_cell(ml, mr, rl, rr)
            if worst is None or rate.lower() < worst.lower():
                worst = rate
                worst_cell = (ml, mr, rl, rr, selected_prime_powers(rl, rr))

    assert worst is not None and worst_cell is not None
    assert worst > q(1, 2)
    print("source_midpoint_bound:", M_BOUND)
    print("source_separation_band:", R_LEFT, R_RIGHT)
    print("partition:", M_CELLS, "x", R_CELLS)
    print("worst_cell_(mL,mR,rL,rR,qs):", worst_cell)
    print("worst_selected_rate:", worst)
    print("worst_margin_over_half:", worst - q(1, 2))
    print("target: |midpoint|<5/4 and separation<1")
    print("certificate: PASS")


if __name__ == "__main__":
    main()
