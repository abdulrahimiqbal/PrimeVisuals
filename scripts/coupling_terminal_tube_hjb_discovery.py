#!/usr/bin/env python3
"""Targeted stopped-HJB discovery for the compact-to-local bridge.

This is a floating-point discovery/falsification program, not a proof
certificate.  It assigns constant continuation value one to the terminal
tube ``|x-y|<=1/10`` and tests the finite nonlocal coupling LP for

    W(x,y) = 1                                      in the tube,
    W(x,y) = 1000 exp(alpha min(c(x,y),2/5))        outside.

Unlike a hard-rate scan, the equality-constrained transport LP charges every
unused nonlocal return channel.

Arch jumps below ``small_cutoff`` are deliberately omitted from this LP:
they are to be coupled by item 162's inverse-tail construction and charged
with item 161's first-variation estimate.  This avoids the invalid finite
residual/stay completion of unequal logarithmic small-jump coefficients.
The printed LP objective must eventually leave enough reserve to pay that
separate analytic charge.  Remaining archimedean channels are quadrature
atoms and prime powers are truncated exactly as in
``coupling_characteristic_hjb_discovery``.

Use ``--parity 0`` and ``--parity 1`` for two independent halves of the
same diagnostic grid.
"""

from __future__ import annotations

import argparse
from math import exp

import coupling_characteristic_hjb_discovery as base


TERMINAL_R = 0.1
SEPARATION_PLATEAU = 1000.0
CHARACTERISTIC_CAP = 0.4
ALPHA = 24.0
SMALL_CUTOFF = 0.001


def stopped_phase(x: float, y: float, ramps=()) -> float:
    del ramps
    if abs(x - y) <= TERMINAL_R:
        return 1.0
    return SEPARATION_PLATEAU * exp(
        ALPHA * min(base.characteristic(x, y), CHARACTERISTIC_CAP)
    )


def diagnostic_points() -> list[tuple[float, float]]:
    points: list[tuple[float, float]] = []
    for r in (0.15, 0.20, 0.25, 0.30, 0.40, 0.50):
        for m in (0.0, 0.1, 0.2, 0.3, 0.4, 0.6, 0.8, 1.0, 1.3, 1.6):
            if m + r / 2 <= 1.9:
                points.append((m, r))

    # Opposite-sign boundary c=2/5 after ordering and reflection.
    for m in (0.0, 0.1, 0.2, 0.3, 0.4):
        r = 1.6 - 2 * m
        if r > TERMINAL_R:
            points.append((m, r))

    points.extend(
        ((0.0, 0.8), (0.0, 1.0), (0.0, 1.2), (0.1, 1.0),
         (0.2, 0.8), (0.3, 0.6), (0.4, 0.8))
    )
    return list(dict.fromkeys(points))


def exact_q3_return_witness() -> None:
    """Certify an unavoidable high-c return for any c-only steep ramp.

    At x=1/20,y=7/20 the inward y-q=3 atom lands at v=y-log(3).
    Since |v|/2>7/20, pairing it into {c<=7/20 or r<=1/10}
    requires the x target to lie in [v-1/10,v+1/10].  The complete x
    capacity of that interval is strictly smaller than the q=3 atom.
    """

    from flint import acb, arb, ctx
    import coupling_high_thin_projection_hall_certificate as theta

    ctx.prec = 240
    x = arb(1) / 20
    y = arb(7) / 20
    radius = arb(1) / 10
    three = arb(3)
    v = y - three.log()
    lo = v - radius
    hi = v + radius
    assert abs(v) / 2 > arb(7) / 20

    # The interval is negative.  Put t=-z, so J(|z-x|)=J(x+t).
    t_left = -hi
    t_right = -lo

    def integrand(t: acb, analytic: bool) -> acb:
        del analytic
        return theta.theta_partial_complex(t) * theta.levy_complex(acb(x) + t)

    partial = acb.integral(
        integrand,
        t_left,
        t_right,
        abs_tol=arb("1e-55"),
        rel_tol=arb("1e-55"),
        eval_limit=100_000,
    )
    assert partial.imag == 0
    closest_distance = x + t_left
    j_max = (-closest_distance / 2).exp() / (
        1 - (-2 * closest_distance).exp()
    )
    tail_upper = theta.THETA_TAIL * (t_right - t_left) * j_max
    x_arch_upper = (
        arb(partial.real.upper()) + tail_upper
    ) / (x / 2).cosh()
    x_arch_upper = arb(x_arch_upper.upper())

    # q=2 lies strictly above the interval and q=3 strictly below it;
    # monotonicity of log q excludes every other signed prime-power target.
    assert x - arb(2).log() > hi
    assert x - arb(3).log() < lo
    assert x + arb(2).log() > hi

    y_q3_lower = (
        three.log()
        / three.sqrt()
        * theta.theta_partial_real(abs(v)).lower()
        / (y / 2).cosh()
    )
    y_q3_lower = arb(y_q3_lower.lower())
    excess_lower = arb((y_q3_lower - x_arch_upper).lower())
    assert excess_lower > arb(1) / 10_000

    print("exact_q3_return_source_(x,y):", (x, y))
    print("exact_q3_target_v:", v)
    print("exact_tube_partner_interval:", (lo, hi))
    print("exact_x_complete_capacity_upper:", x_arch_upper)
    print("exact_y_q3_atom_lower:", y_q3_lower)
    print("exact_unavoidable_high_c_mass_lower:", excess_lower)
    print("exact_q3_return_witness: PASS")


def main() -> None:
    global ALPHA
    parser = argparse.ArgumentParser()
    parser.add_argument("--parity", type=int, choices=(0, 1))
    parser.add_argument("--alpha", type=float, default=ALPHA)
    parser.add_argument("--small-cutoff", type=float, default=SMALL_CUTOFF)
    parser.add_argument("--atom-witness", action="store_true")
    args = parser.parse_args()

    ALPHA = args.alpha
    if args.atom_witness:
        exact_q3_return_witness()
        return

    points = diagnostic_points()
    if args.parity is not None:
        points = points[args.parity::2]

    original_phase = base.phase
    original_cutoff = base.ARCH_MIN_INCREMENT
    base.phase = stopped_phase
    base.ARCH_MIN_INCREMENT = args.small_cutoff
    try:
        values = [
            base.solve_cell(m, r, (), verbose=False)["objective"]
            for m, r in points
        ]
    finally:
        base.phase = original_phase
        base.ARCH_MIN_INCREMENT = original_cutoff

    worst_index = max(range(len(points)), key=values.__getitem__)
    print("terminal_radius:", TERMINAL_R)
    print("separation_plateau:", SEPARATION_PLATEAU)
    print("alpha:", ALPHA)
    print("characteristic_cap:", CHARACTERISTIC_CAP)
    print("small_cutoff:", args.small_cutoff)
    print("point_count:", len(points))
    print("worst_point_(m,r):", points[worst_index])
    print("worst_QW_over_W:", values[worst_index])
    print("points_above_-0.5002:")
    for point, value in zip(points, values):
        if value > -0.5002:
            print(" ", point, value)


if __name__ == "__main__":
    main()
