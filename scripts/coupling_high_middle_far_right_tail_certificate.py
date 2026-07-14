#!/usr/bin/env python3
"""Exact far-right reverse-tail domination for high mixed sources.

For the physical jump measures ``nu_s`` and ``D=1/2`` this file proves

    nu_y([p,infinity)) <= nu_x([p-D,infinity))         (1)

whenever

    |x|<=3/5,  y>=7/5,  p>=y+1.

Together with ``coupling_high_middle_right_tail_certificate.py``, (1)
settles every extra Hall interval to the right of the mandatory component:
if ``y+1<=p<q``, then

    nu_x([p-D,q+D])-nu_y([p,q])
      = {nu_x([p-D,infinity))-nu_y([p,infinity))}
        + {nu_y((q,infinity))-nu_x((q+D,infinity))}
      >= 0.                                               (2)

The companion certificate proves the stronger endpoint form
``nu_y((q,infinity))>=nu_x([q+D,infinity))``, so the second brace is
nonnegative even when either endpoint is a prime atom.

Proof of (1).  Split the x-archimedean density into two equal ledgers.  Map
each y-archimedean target w>=p to u=w-D.  Source monotonicity reduces the
pointwise comparison to

    f_(-3/5)(w-D) >= 2 f_(w-1)(w),  w>=12/5.            (3)

Indeed f_s(z) increases with s while z>s; x=-3/5 minimizes the left side,
and the constraint y<=w-1 makes y=w-1 maximize the right side.  The first
half of the x density receives this translated continuous mass.

A y-prime target in the far tail is w=y+log(n), with n>=3.  Assign it the
second half of the x density on the interval

    I_n=[w-D,w-D+1/(4n)].                                (4)

The intervals are disjoint because
``log(1+1/n)=int_n^(n+1)dt/t>1/(n+1)>=1/(2n)>1/(4n)``.
They lie in ``[p-D,infinity)`` and every assigned point is within D of w.
Since n>=3, their right endpoints are at most w-5/12.  Also

    1/(4n) >= exp(-(w-7/5))/4,
    Lambda(n)n^(-1/2)/C(y) <= 2(w-7/5)exp(-w/2).

Using source monotonicity, ``J(h)>=exp(-h/2)``, and the monotonic decrease of
K on the positive half-line, the assigned half-ledger mass is at least

    K(w-5/12) exp(-3w/2+157/120) / (8 C(3/5)).           (5)

Thus (5) dominates the atom if

    K(w-5/12)/K(w)
      >= 16 C(3/5)(w-7/5) exp(w-157/120).               (6)

The same exact theta quotient used by the companion right-tail certificate
proves (3) and (6).  At t>=12/5, A=pi exp(2t),

    K(t-d)/K(t) >= (1/2) exp(-9d/2+A(1-exp(-2d)))
                         (1-16exp(-3A)).                (7)

The logarithmic derivative of the right side of (7) is at least
``2A(1-exp(-2d))``.  It already exceeds the derivative of the right side of
(6) at t=12/5 and increases thereafter, so one rigorous base evaluation
proves the full half-line.  Formula (3) follows similarly from d=1/2 and

    J(w+1/10) C(w-1) / (J(1)C(3/5))
      >= exp(-11/20)/(2J(1)C(3/5)).

Continuation item 182 supplies the monotonicity used in (5): if
``U=-(log K)'``, then U(0)=0 and U'(t)>18 for t>0, hence K'(t)<0.
No atomwise same-prime matching, PNT estimate, or finite-height inference is
used.
"""

from __future__ import annotations

from flint import arb, ctx


ctx.prec = 240


PI = arb.pi()
T0 = arb(12) / 5
C06 = (arb(3) / 10).cosh()


def kernel_quotient_lower(t: arb, displacement: arb) -> arb:
    assert 0 < displacement <= arb(1) / 2
    scale = PI * (2 * t).exp()
    shifted_scale = scale * (-2 * displacement).exp()
    assert shifted_scale > 3
    ratio = 16 * (-3 * scale).exp()
    assert ratio < 1
    value = (
        arb(1) / 2
        * (-arb(9) * displacement / 2).exp()
        * (scale * (1 - (-2 * displacement).exp())).exp()
        * (1 - ratio)
    )
    assert value > 0
    return value.lower()


def levy_shape(t: arb) -> arb:
    return (-t / 2).exp() / (1 - (-2 * t).exp())


def main() -> None:
    # Continuous ledger, equation (3).  Half of x must dominate all y, so
    # the complete density ratio must exceed two.
    continuous_kernel_ratio = kernel_quotient_lower(T0, arb(1) / 2)
    continuous_elementary_ratio = (
        (-arb(11) / 20).exp() / (2 * levy_shape(arb(1)) * C06)
    )
    continuous_ratio = continuous_kernel_ratio * continuous_elementary_ratio
    assert continuous_ratio > 2

    # Prime ledger, equation (6).
    displacement = arb(5) / 12
    prime_kernel_ratio = kernel_quotient_lower(T0, displacement)
    prime_required = (
        16 * C06 * (T0 - arb(7) / 5)
        * (T0 - arb(157) / 120).exp()
    )
    assert prime_kernel_ratio > prime_required

    scale0 = PI * (2 * T0).exp()
    quotient_log_slope_lower = (
        2 * scale0 * (1 - (-2 * displacement).exp())
    )
    required_log_slope_upper = 1 + 1 / (T0 - arb(7) / 5)
    assert quotient_log_slope_lower > required_log_slope_upper

    # The far-tail condition log(n)>=1 forces n>=3.
    assert arb(1).exp() < 3
    n = arb(3)
    assert (1 + 1 / n).log() > 1 / (n + 1)
    assert 1 / (n + 1) >= 1 / (2 * n)
    assert 1 / (2 * n) > 1 / (4 * n)

    print("precision_bits:", ctx.prec)
    print("source_band: |x|<=3/5, y>=7/5")
    print("far_tail_condition: p>=y+1")
    print("continuous_kernel_ratio_lower_at_base:", continuous_kernel_ratio)
    print("continuous_full_ratio_lower_at_base:", continuous_ratio)
    print("prime_kernel_ratio_lower_at_base:", prime_kernel_ratio)
    print("prime_required_upper_at_base:", prime_required)
    print("prime_log_slope_lower:", quotient_log_slope_lower)
    print("prime_required_log_slope_upper:", required_log_slope_upper)
    print("far_right_reverse_tail_domination: PASS")
    print("right_extra_interval_Hall: PASS")


if __name__ == "__main__":
    main()
