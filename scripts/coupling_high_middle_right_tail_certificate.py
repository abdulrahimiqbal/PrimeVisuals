#!/usr/bin/env python3
"""Exact right-tail domination for the high mixed half-distance band.

Let

    f_s(z) = K(z) J(|z-s|) / C(s),   C(s)=cosh(s/2),

and let ``nu_s`` be the complete physical jump measure (archimedean density
``f_s`` plus both prime-power target atoms).  This file proves

    nu_y((q,infinity)) >= nu_x([q+1/2,infinity))       (1)

for every ``|x|<=3/5``, ``y>=7/5`` and ``q>=y``.  In fact it constructs a
domination at displacement at most 1/2.

Archimedean ledger.  Split the y-archimedean measure into two equal parts.
For an x-archimedean target ``u>q+1/2``, put ``w=u-1/2``.  Monotonicity in
the sources reduces the required pointwise inequality to

    f_(7/5)(w) >= 2 f_(3/5)(w+1/2),   w>7/5.          (2)

Indeed, for a target to the right of its source,

    d/ds log f_s(z)
      = 1/2 + 2/(exp(2(z-s))-1) - tanh(s/2)/2 > 0.

Thus the left side is minimized at y=7/5 and the right side is maximized at
x=3/5.  The first half of the y density therefore receives the translated
x density.

Prime ledger.  An x prime target in the right tail has the form

    u=x+log(n),  Lambda(n)>0,  u>q+1/2>=19/10.

In particular n>=4.  Assign it the second half of the y density on

    I_n=[u-1/2, u-1/2+1/(4n)].                         (3)

The intervals are disjoint: for consecutive integers,
``log(1+1/n)>1/(n+1)>=1/(2n)>1/(4n)``.  They begin at or
to the right of q and have positive length inside ``(q,infinity)``; every
point of I_n is within 1/2 of u.  The bounds ``|x|<=3/5`` give

    1/(4n) >= exp(-(u+3/5))/4,
    Lambda(n)/sqrt(n)/C(x)
       <= (u+3/5) exp(-(u-3/5)/2).

Since n>=4, the right endpoint of I_n is at most ``u-7/16``.  Source
monotonicity and ``J(h)>=exp(-h/2)`` show that its assigned y mass is at
least

    exp(-(u+3/5))/8 * K(u-7/16)
      * exp(-(u-147/80)/2) / C(7/5).                  (4)

The second certified kernel quotient below proves that (4) dominates the
complete atom weight
``Lambda(n)n^(-1/2)K(u)/C(x)``.

Kernel quotient audit.  For t>=19/10 put A=pi*exp(2t).  Positivity of the
first theta term and a geometric majorant for all theta terms give, for
``0<d<=1/2``,

    K(t-d)/K(t)
      >= (1/2) exp(-9d/2 + A(1-exp(-2d)))
                    * (1-16 exp(-3A)).                (5)

Here ``2A exp(-2d)-3 >= A exp(-2d)`` at the displayed base point, while
the nth upper majorant is
``2 pi^2 n^4 exp(9t/2-A n^2)`` and consecutive majorants have ratio at
most ``16 exp(-3A)``.  The logarithm of the right side of (5) has derivative
at least ``2A(1-exp(-2d))``.  This is already larger at t=19/10 than the
logarithmic derivatives of every elementary comparison factor below, and
increases thereafter.  Consequently the two base-point Arb inequalities
certify (2) and (4) on their full half-lines; no finite-height sampling or
mesh extrapolation is used.

The interval lower bounds in (3)--(4) also use that K is strictly decreasing
on the positive half-line.  This is not inferred from samples: continuation
item 182 proves for ``U=-(log K)'`` that ``U(0)=0`` and ``U'(t)>18`` for
``t>0``.  Hence ``U(t)>0`` and ``K'(t)=-U(t)K(t)<0`` there.

If an x atom is exactly at ``q+1/2``, the same interval begins at q and its
positive continuous mass lies in ``(q,infinity)``, giving the strong endpoint
convention in (1).  There are no negative-sign x prime targets in the right tail, because
``x-log(n)<0<q+1/2``.  The two half-ledgers are disjoint and the intervals
(3) are mutually disjoint, completing (1), including all prime powers.
"""

from __future__ import annotations

from flint import arb, ctx


ctx.prec = 240


PI = arb.pi()
T0 = arb(19) / 10
C14 = (arb(7) / 10).cosh()
C06 = (arb(3) / 10).cosh()


def kernel_quotient_lower(t: arb, displacement: arb) -> arb:
    """The explicit lower bound (5) for K(t-d)/K(t)."""

    assert 0 < displacement <= arb(1) / 2
    scale = PI * (2 * t).exp()
    shifted_scale = scale * (-2 * displacement).exp()
    assert shifted_scale > 3
    geometric_ratio = 16 * (-3 * scale).exp()
    assert geometric_ratio < 1
    result = (
        arb(1) / 2
        * (-arb(9) * displacement / 2).exp()
        * (scale * (1 - (-2 * displacement).exp())).exp()
        * (1 - geometric_ratio)
    )
    assert result > 0
    return result.lower()


def main() -> None:
    half = arb(1) / 2

    # Continuous tail.  For w>=7/5, set t=w+1/2>=19/10 and d=1/2.
    # J(w-7/5)/J(w-1/10) is bounded below using J(a)>=exp(-a/2)
    # and J(b)<=exp(-b/2)/(1-exp(-13/5)); the exponent difference is 13/20.
    continuous_kernel_ratio = kernel_quotient_lower(T0, half)
    continuous_levy_cosh_ratio = (
        (arb(13) / 20).exp()
        * (1 - (-arb(13) / 5).exp())
        * C06 / C14
    )
    continuous_ratio = continuous_kernel_ratio * continuous_levy_cosh_ratio
    assert continuous_ratio > 2

    # Prime atoms.  Formula (4) divided by the atom upper bound reduces to
    # K(u-7/16)/K(u) >= 8 C(7/5)(u+3/5)exp(u-3/160).
    # The quotient logarithmic derivative is at least
    # 2A(1-exp(-7/8)); the right side has logarithmic derivative
    # 1+1/(u+3/5), and the former is larger already at u=19/10.
    displacement = arb(7) / 16
    prime_kernel_ratio = kernel_quotient_lower(T0, displacement)
    prime_required = (
        8 * C14 * (T0 + arb(3) / 5)
        * (T0 - arb(3) / 160).exp()
    )
    assert prime_kernel_ratio > prime_required

    scale0 = PI * (2 * T0).exp()
    quotient_log_slope_lower = (
        2 * scale0 * (1 - (-2 * displacement).exp())
    )
    required_log_slope_upper = 1 + 1 / (T0 + arb(3) / 5)
    assert quotient_log_slope_lower > required_log_slope_upper

    # The tail condition forces n>=4: log(n)>13/10 and exp(13/10)<4.
    assert (arb(13) / 10).exp() < 4

    # The elementary disjointness estimate used for every integer n>=4.
    # In general log(1+1/n)=int_n^(n+1)dt/t>1/(n+1); the base assertion
    # below also audits the strict numerical ordering at the smallest n.
    n = arb(4)
    assert (1 + 1 / n).log() > 1 / (n + 1)
    assert 1 / (n + 1) >= 1 / (2 * n)
    assert 1 / (2 * n) > 1 / (4 * n)

    print("precision_bits:", ctx.prec)
    print("source_band: |x|<=3/5, y>=7/5")
    print("tail_condition: q>=y")
    print("continuous_kernel_ratio_lower_at_base:", continuous_kernel_ratio)
    print("continuous_full_ratio_lower_at_base:", continuous_ratio)
    print("prime_kernel_ratio_lower_at_base:", prime_kernel_ratio)
    print("prime_required_upper_at_base:", prime_required)
    print("prime_log_slope_lower:", quotient_log_slope_lower)
    print("prime_required_log_slope_upper:", required_log_slope_upper)
    print("right_tail_domination: PASS")


if __name__ == "__main__":
    main()
