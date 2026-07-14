#!/usr/bin/env python3
"""Rigorous positive-series lower integrals for the archimedean jump kernel.

For ``t>=0`` write ``A_n=pi*n^2``.  The even Riemann kernel is

    K(t)=sum_(n>=1) A_n exp(5t/2)
             (2 A_n exp(2t)-3) exp(-A_n exp(2t)).

Every summand is positive.  For real b and ``0<=L<U``, put

    p=5/4+b/2,  u=A_n exp(2t).

Direct substitution gives the exact term integral

    int_L^U K_n(t) exp(bt)dt
      = A_n^(1-p)/2 * {2 Gamma_[uL,uU](p+1)
                         -3 Gamma_[uL,uU](p)},

where ``Gamma_[a,b](s)=Gamma(s,a)-Gamma(s,b)``.  Upper incomplete gamma is
defined here even when p is a nonpositive integer because both endpoints are
strictly positive.  Omitting ``n>N`` therefore gives a rigorous lower bound.

For a target interval wholly on one side of a source s,

    J(|s-z|)=sum_(k>=0) exp(-(2k+1/2)|s-z|).

Combining this positive geometric expansion with the preceding gamma formula
and omitting ``k>=K`` gives a fast rigorous lower bound for
``int K(z)J(|s-z|)dz``.  This avoids the linear convergence of a Darboux sum
when a hard-stage reserve is only about 1e-7.  A caller obtains a uniform
source-box jump-rate bound by choosing the source endpoint that maximizes the
distance in J and then dividing by a separately bounded maximum of C(s).

No quadrature extrapolation is used: every returned Arb ball contains a
finite sum of exact positive term integrals, and all omitted terms are
positive.
"""

from __future__ import annotations

from flint import arb, ctx


ctx.prec = 200
PI = arb.pi()


def as_arb(value) -> arb:
    return value if isinstance(value, arb) else arb(value)


def positive_kernel_exponential_integral(
    exponent,
    left,
    right,
    theta_terms: int = 4,
) -> arb:
    """Lower bound for int_left^right K(t)exp(exponent*t)dt, 0<=left<right."""

    exponent = as_arb(exponent)
    left = as_arb(left)
    right = as_arb(right)
    assert 0 <= left < right
    assert theta_terms >= 1
    order = arb(5) / 4 + exponent / 2
    total = arb(0)
    for n in range(1, theta_terms + 1):
        scale = PI * n * n
        lower_u = scale * (2 * left).exp()
        upper_u = scale * (2 * right).exp()
        gamma_next = lower_u.gamma_upper(order + 1)
        gamma_next -= upper_u.gamma_upper(order + 1)
        gamma_here = lower_u.gamma_upper(order)
        gamma_here -= upper_u.gamma_upper(order)
        term = scale ** (1 - order) / 2
        term *= 2 * gamma_next - 3 * gamma_here
        assert term > 0
        total += term
    return total


def kernel_exponential_integral(
    exponent,
    left,
    right,
    theta_terms: int = 4,
) -> arb:
    """Lower bound for int_left^right K(z)exp(exponent*z)dz."""

    exponent = as_arb(exponent)
    left = as_arb(left)
    right = as_arb(right)
    assert left < right
    if right <= 0:
        return positive_kernel_exponential_integral(
            -exponent, -right, -left, theta_terms
        )
    if left >= 0:
        return positive_kernel_exponential_integral(
            exponent, left, right, theta_terms
        )
    return positive_kernel_exponential_integral(
        -exponent, arb(0), -left, theta_terms
    ) + positive_kernel_exponential_integral(
        exponent, arb(0), right, theta_terms
    )


def kernel_levy_integral_lower(
    source,
    left,
    right,
    levy_terms: int = 80,
    theta_terms: int = 4,
) -> arb:
    """Lower bound for int_left^right K(z)J(|z-source|)dz.

    The complete target interval must lie strictly on one side of source.
    """

    source = as_arb(source)
    left = as_arb(left)
    right = as_arb(right)
    assert left < right
    assert right < source or left > source
    assert levy_terms >= 1
    total = arb(0)
    for k in range(levy_terms):
        rate = arb(2 * k) + arb(1) / 2
        if right < source:
            total += (-rate * source).exp() * kernel_exponential_integral(
                rate, left, right, theta_terms
            )
        else:
            total += (rate * source).exp() * kernel_exponential_integral(
                -rate, left, right, theta_terms
            )
    return total


def main() -> None:
    # Exact reference values used at the calibrated high-band corner
    # (x,y)=(3/5,7/5).  Increasing the number of positive terms can only
    # raise these lower bounds.
    existing = kernel_levy_integral_lower(
        arb("1.4"), arb("-.8"), arb("1.1"), 80
    ) / (arb("1.4") / 2).cosh()
    existing += kernel_levy_integral_lower(
        arb(".6"), arb(".9"), arb("1.9"), 80
    ) / (arb(".6") / 2).cosh()
    joint_y = kernel_levy_integral_lower(
        arb("1.4"), arb("-.9"), arb("-.8"), 80
    ) / (arb("1.4") / 2).cosh()
    joint_x = kernel_levy_integral_lower(
        arb(".6"), arb("-.9"), arb("-.8"), 80
    ) / (arb(".6") / 2).cosh()
    assert existing > arb(".1064522900251597")
    assert joint_y > arb("1.0116609705e-6")
    assert joint_x > joint_y
    print("precision_bits:", ctx.prec)
    print("corner_existing_arch_lower:", existing)
    print("corner_joint_y_arch_lower:", joint_y)
    print("corner_joint_x_arch_lower:", joint_x)
    print("positive_series_integral: PASS")


if __name__ == "__main__":
    main()
