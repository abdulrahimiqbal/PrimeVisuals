#!/usr/bin/env python3
"""Prime-free half-mass certificate for every positive source y >= 4.

Let

    P_in(y) = sum_(q=p^k) Lambda(q) q^(-1/2) K(y-log q),
    P_out(y)= sum_(q=p^k) Lambda(q) q^(-1/2) K(y+log q),
    C(y)=cosh(y/2).

Continuation item 186 proves, by the pole-free Weil radical identity,

    C(y)/2-P_in(y)-P_out(y)
      = c0 K(y)+int_0^infinity J(t)
          {K(y+t)+K(y-t)-2K(y)}dt,                    (1)

where ``c0=EulerGamma+pi/2+log(8pi)`` and
``J(t)=exp(-t/2)/(1-exp(-2t))``.  This file certifies the elementary
inequalities which make the right side of (1) positive for every y >= 4.
Consequently

    P_in(y)/C(y) < 1/2,                                (2)

with no prime cutoff and no PNT error estimate.

Here is the complete sign argument.  Every theta summand defining K has

    K_n''(t)=pi*n^2*exp(5t/2-v) R(v),
    v=pi*n^2*exp(2t),
    R(v)=8v^3-56v^2+(165/2)v-75/4.

The executable checks that R is positive and increasing from
``v=pi*exp(2)`` onward.  Hence K is convex on [1,infinity).  Item 182 gives
``U'=-(log K)''>18`` and U(0)=0, so U(s)>18s.  With delta=1/10 this yields

    K(y-delta)/K(y)
      > exp(18*delta*(y-delta/2)) > 2,                 (3)

uniformly for y >= 4.

Put ``Delta_y(t)=K(y+t)+K(y-t)-2K(y)`` and use evenness of K.  Convexity
gives Delta_y(t)>=0 for ``0<t<=y-1``.  For ``y-1<=t<=y+1``, the first
argument has absolute value at most one and K(|y-t|)>=K(1)>2K(y).  For
``y+1<=t<=2y-delta``, it lies in ``[1,y-delta]`` and (3) gives the same
conclusion.  On the remaining tail use only Delta_y(t)>=-2K(y).  Since

    int_a^infinity J(t)dt
      = atanh(exp(-a/2))+atan(exp(-a/2)),

(1) is at least

    K(y){c0-2 I(2y-delta)}
      >= K(y){c0-2 I(79/10)} > 0.                      (4)

The differentiated theta series is normally convergent on every
``[1,infinity)`` strip, so termwise convexity has no limiting gap.  Finally
``P_out(y)>0``; (1) and (4) prove (2) strictly.

This theorem removes a total-mass obstruction to extending item 203.  It
does not prove the interval-Hall inequalities needed for a bounded-distance
transport of the full inward-prime measure.

Reproduce with

    PYTHONPATH=/tmp/pvdeps:scripts python3 -u \
      scripts/coupling_inward_prime_total_mass_tail_certificate.py
"""

from flint import arb, ctx

import coupling_beta_quantile_transport_certificate as curvature


ctx.prec = 180


def q(numerator: int, denominator: int = 1) -> arb:
    return arb(numerator) / denominator


PI = arb.pi()
Y0 = q(4)
DELTA = q(1, 10)
CONVEX_LEFT = q(1)


def r_polynomial(v: arb) -> arb:
    return 8 * v**3 - 56 * v**2 + q(165, 2) * v - q(75, 4)


def r_prime(v: arb) -> arb:
    return 24 * v**2 - 112 * v + q(165, 2)


def levy_tail(a: arb) -> arb:
    exponential = (-a / 2).exp()
    return exponential.atanh() + exponential.atan()


def main() -> None:
    # For t>=1 and n>=1, v>=pi*e^2.  R''(v)=48v-112 is
    # positive there, so R' and R are increasing after this endpoint.
    v0 = PI * arb(2).exp()
    assert 48 * v0 - 112 > 0
    assert r_prime(v0) > 0
    assert r_polynomial(v0) > 0

    # Re-run item 182's analytic theta-tail proof of U'>18 on [1,infinity).
    uprime_lower, relative_tail, variance_error = (
        curvature.analytic_tail_u_prime_certificate()
    )
    assert uprime_lower > 18

    log_quotient_lower = 18 * DELTA * (Y0 - DELTA / 2)
    quotient_lower = log_quotient_lower.exp()
    assert quotient_lower > 2

    c0 = arb.const_euler() + PI / 2 + (8 * PI).log()
    tail_start = 2 * Y0 - DELTA
    i_tail = levy_tail(tail_start)
    radical_factor = c0 - 2 * i_tail
    assert tail_start.contains(q(79, 10))
    assert radical_factor > 0

    print("precision_bits:", ctx.prec)
    print("source_halfline: y>=", Y0)
    print("theta_convexity_left_endpoint:", CONVEX_LEFT)
    print("v0=pi*exp(2):", v0)
    print("R(v0):", r_polynomial(v0))
    print("Rprime(v0):", r_prime(v0))
    print("analytic_Uprime_lower_on_[1,infinity):", uprime_lower)
    print("analytic_relative_theta_tail_at_t=1:", relative_tail)
    print("analytic_variance_error_at_t=1:", variance_error)
    print("delta:", DELTA)
    print("K(y-delta)/K(y)_lower:", quotient_lower)
    print("radical_constant_c0:", c0)
    print("Levy_tail_start:", tail_start)
    print("Levy_tail_integral:", i_tail)
    print("positive_radical_factor:", radical_factor)
    print("complete_prime_mass_below_half: PASS")
    print("inward_prime_mass_below_half: PASS")


if __name__ == "__main__":
    main()
