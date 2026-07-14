#!/usr/bin/env python3
"""Exact half-mass reserve for the compact high thin-tube funnel.

Let ``nu_s`` be the physical jump measure and remove only the two local
archimedean pieces ``|z-s|<epsilon``.  The remaining finite mass is

    M_epsilon(s) = C(s)^(-1) [P(s)
      + integral_epsilon^infinity J(t){K(s+t)+K(s-t)}dt],

where ``C(s)=cosh(s/2)`` and ``P(s)`` is the complete two-sided prime-power
mass before division by C.  The pole-free radical identity gives exactly

    C(s){1/2-M_epsilon(s)} = R_epsilon(s),

    R_epsilon(s)
      = K(s){c0-2 I(epsilon)}
        + integral_0^epsilon J(t)
            {K(s+t)+K(s-t)-2K(s)}dt,                 (1)

    c0 = EulerGamma+pi/2+log(8pi),
    I(epsilon)=atanh(exp(-epsilon/2))+atan(exp(-epsilon/2)).

This program proves ``R_epsilon(s)<0``, hence

    M_epsilon(s)>1/2,                                 (2)

uniformly for

    epsilon=1/100000,       31/50 <= s <= 21/10.      (3)

The interval (3) contains both coordinates of every positive same-sign
source in the discovery box

    18/25 <= m <= 2,       3/20 <= r <= 1/5,
    (x,y)=(m-r/2,m+r/2).

No prime sum is evaluated: all of it is retained exactly through (1).  For
``0<t<=epsilon``,

    J(t) <= exp(3epsilon/2)/(2t),
    K(s+t)+K(s-t)-2K(s) <= t^2 sup |K''|.

Since ``exp(3epsilon/2)<2``, the local integral in (1) is at most
``epsilon^2 sup|K''|/2``.  On the compact part through 1.51, K and K'' use
the differentiated positive theta series with a certified omitted tail.
Above it, the one-term/geometric differentiated-theta majorant from the
high-middle radical certificate is decreasing and bounds the whole
half-line.  Rational cells of width 1/1000 then prove the displayed strict
sign.  Thus (2) is an exact reserve, not the midpoint-quadrature overshoot
seen in the floating hard-stage LP.

This is the mass half of the repaired high-stage certificate.  It does not
claim the still-required finite Hall flow into the enlarged target tube.

The program also audits the exact gateway that removes the floating
``0.49985`` cut when the two intermediate bands are enlarged from radius
``1/4`` to ``13/50``.  For

    18/25 <= m <= 8/5,       3/20 <= r <= 1/5,

pair the inward q=2 jump from ``x=m-r/2`` with the inward q=3 jump from
``y=m+r/2``.  The target midpoint and separation are

    m' = m-log(6)/2,       r'=log(3/2)-r.              (4)

The exact scalar checks below give ``|m'|<18/25`` and
``0<r'<13/50``.  Since the characteristic satisfies
``c(m',r')<=max(|m'|,r'/2)``, this edge lands in the enlarged H/G union.

Reproduce with

    PYTHONPATH=/tmp/pvdeps:scripts python3 -u \
      scripts/coupling_high_thin_nonlocal_mass_certificate.py
"""

from __future__ import annotations

from flint import arb, ctx

import coupling_anchor_beta_transport_certificate as kernel_base
import coupling_high_middle_radical_cut_certificate as radical_base
import coupling_mixed_anchor_beta_hall_certificate as theta_base


ctx.prec = 200


q = kernel_base.q
PI = arb.pi()
EPSILON = q(1, 100000)
S_LEFT = q(31, 50)
S_RIGHT = q(21, 10)
CELLS = 1480


def main() -> None:
    c0 = arb.const_euler() + PI / 2 + (8 * PI).log()
    exponential = (-EPSILON / 2).exp()
    i_epsilon = exponential.atanh() + exponential.atan()
    diagonal_coefficient = c0 - 2 * i_epsilon
    assert diagonal_coefficient < -9
    assert (3 * EPSILON / 2).exp() < 2

    # Exact q=2 by q=3 gateway geometry, equation (4).
    log_six_half = arb(6).log() / 2
    gateway_midpoint_left = q(18, 25) - log_six_half
    gateway_midpoint_right = q(8, 5) - log_six_half
    gateway_separation_left = arb(3).log() - arb(2).log() - q(1, 5)
    gateway_separation_right = (
        arb(3).log() - arb(2).log() - q(3, 20)
    )
    assert gateway_midpoint_left > -q(18, 25)
    assert gateway_midpoint_right < q(18, 25)
    assert gateway_separation_left > 0
    assert gateway_separation_right < q(13, 50)

    width = (S_RIGHT - S_LEFT) / CELLS
    assert width.contains(q(1, 1000))
    worst = None

    for index in range(CELLS):
        left = S_LEFT + index * width
        right = left + width
        source = kernel_base.interval(left, right)
        kernel_lower, _kernel_upper = kernel_base.kernel_bounds(source)

        # theta_triplet_positive is valid on the padded compact interval
        # through 1.51.  The alternate majorant is valid from 1.29 onward,
        # so the branches overlap widely and leave no uncovered point.
        if right + EPSILON < q(151, 100):
            derivative_box = theta_base.interval(
                left - EPSILON, right + EPSILON
            )
            _k, _kp, kpp = theta_base.theta_triplet_positive(
                derivative_box
            )
            second_upper = theta_base.absolute_upper(kpp)
        else:
            assert left - EPSILON > q(129, 100)
            second_upper = radical_base.k_second_absolute_upper(
                left - EPSILON
            )

        # The coefficient is negative.  Replacing K by its lower bound
        # therefore gives an upper bound for R_epsilon.
        radical_upper = (
            diagonal_coefficient.upper() * kernel_lower
            + EPSILON**2 * second_upper / 2
        )
        assert radical_upper < 0, (
            index,
            left,
            right,
            kernel_lower,
            second_upper,
            radical_upper,
        )

        normalized_negative_reserve = -radical_upper / kernel_lower
        if worst is None or normalized_negative_reserve < worst[0]:
            worst = (
                normalized_negative_reserve,
                left,
                right,
                radical_upper,
                kernel_lower,
                second_upper,
            )

    assert worst is not None
    print("precision_bits:", ctx.prec)
    print("source_interval:", (S_LEFT, S_RIGHT))
    print("local_cutoff_epsilon:", EPSILON)
    print("radical_diagonal_coefficient:", diagonal_coefficient)
    print(
        "q2_q3_gateway_midpoint_interval:",
        (gateway_midpoint_left, gateway_midpoint_right),
    )
    print(
        "q2_q3_gateway_separation_interval:",
        (gateway_separation_left, gateway_separation_right),
    )
    print("q2_q3_gateway_into_radius_13/50: PASS")
    print("rational_cells:", CELLS)
    print(
        "worst_(normalized_reserve,sL,sR,Rupper,Klower,K2upper):",
        worst,
    )
    print("complete_nonlocal_mass_strictly_above_one_half: PASS")
    print("finite_high_stage_Hall_flow: NOT_CLAIMED")


if __name__ == "__main__":
    main()
