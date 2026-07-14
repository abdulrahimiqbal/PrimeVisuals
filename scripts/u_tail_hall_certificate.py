#!/usr/bin/env python3
"""Interval certificate for the sharp-tail Hall obstruction.

The mathematical statement certified here is described in the continuation
state.  Put A=7/25 and h=1/16.  For every 0<a,b<=A, the d_U-contact obtained
by changing its U-slope from +1 to -1 on selected subintervals of

    [b-log(2), b-log(2)+h] and [log(2)-a-h, log(2)-a]

violates the rate-1/2 generator inequality at (-a,b).  Only the n=2 prime
power is retained below.  Every other prime-power term has the same
nonnegative sign, so this is a lower bound for the full generator.

The last section certifies the Hall mass

    2 int_0^A 4 K(t)sinh(t/2)dt - int_0^infinity 4 K(t)sinh(t/2)dt > 0.

All numerical integrations use interval Riemann sums.  An interval evaluation
on a whole bin encloses the range there, so multiplying by the bin width is a
rigorous integral enclosure (slow but independently checkable).

Run with python-flint >= 0.9.0, for example

    PYTHONPATH=/tmp/pvdeps python3 scripts/u_tail_hall_certificate.py
"""

from __future__ import annotations

from flint import arb, arb_series, ctx


ctx.prec = 160


def q(p: int, d: int = 1) -> arb:
    return arb(p) / d


PI = arb.pi()
LOG2 = arb(2).log()
A = q(7, 25)
H = q(1, 16)
C2 = LOG2 / arb(2).sqrt()
SUBBINS = 8


def interval(lo: arb, hi: arb) -> arb:
    """Return an Arb ball containing the exact interval [lo,hi]."""
    return arb((lo + hi) / 2, (hi - lo) / 2)


def positive_tail_error(exponent: int) -> arb:
    e = arb(f"1e-{exponent}")
    return arb(e / 2, e / 2)


THETA_K_ERROR = positive_tail_error(105)
THETA_KP_ERROR = arb(0, "1e-102")


def theta_sums(x: arb) -> tuple[arb, arb, arb, arb]:
    """Enclose K,K',K'',K''' for x>=LOG2-A-H.

    Six theta terms are summed.  At the smallest possible x, the first
    omitted exponent is pi*7^2*exp(2x)>310.  The geometric majorants checked
    in ``check_theta_tail`` bound the four omitted differentiated tails by
    the error balls added here.
    """
    k0 = arb(0)
    k1 = arb(0)
    k2 = arb(0)
    k3 = arb(0)
    for n in range(1, 7):
        y = PI * n * n * (2 * x).exp()
        k = PI * n * n * (q(5, 2) * x).exp() * (2 * y - 3) * (-y).exp()
        d1 = q(5, 2) + 4 * y / (2 * y - 3) - 2 * y
        # d1' and d1'' obtained by direct differentiation.
        d1p = -4 * y - 24 * y / (2 * y - 3) ** 2
        d1pp = -8 * y + 96 * y * (y + 3) / (2 * y - 3) ** 3
        k0 += k
        k1 += k * d1
        k2 += k * (d1 * d1 + d1p)
        k3 += k * (d1**3 + 3 * d1 * d1p + d1pp)
    k0 += THETA_K_ERROR
    k1 += THETA_KP_ERROR
    k2 += arb(0, "1e-99")
    k3 += arb(0, "1e-96")
    return k0, k1, k2, k3


def K(x: arb) -> arb:
    return theta_sums(x)[0]


def U(x: arb) -> arb:
    k0, k1, _, _ = theta_sums(x)
    return -k1 / k0


def U_prime(x: arb) -> arb:
    k0, k1, k2, _ = theta_sums(x)
    return (k1 / k0) ** 2 - k2 / k0


def U_second(x: arb) -> arb:
    k0, k1, k2, k3 = theta_sums(x)
    return -k3 / k0 + 3 * k1 * k2 / k0**2 - 2 * k1**3 / k0**3


def C(x: arb) -> arb:
    # Written with exponentials so the same function accepts arb_series.
    return ((x / 2).exp() + (-x / 2).exp()) / 2


def J(x: arb) -> arb:
    return (-x / 2).exp() / (1 - (-2 * x).exp())


def minus_J_prime(x):
    return J(x) * (q(1, 2) + 2 / ((2 * x).exp() - 1))


def tanh_half(x: arb) -> arb:
    return (x / 2).tanh()


def riemann_enclosure(fun, lo: arb, hi: arb, bins: int) -> arb:
    width = (hi - lo) / bins
    total = arb(0)
    for j in range(bins):
        cell = interval(lo + j * width, lo + (j + 1) * width)
        total += fun(cell)
    return total * width


def K_taylor(x):
    """Twelve-term K for Taylor quadrature (arb or arb_series input)."""
    total = 0 * x
    for n in range(1, 13):
        y = PI * n * n * (2 * x).exp()
        total += PI * n * n * (q(5, 2) * x).exp() * (2 * y - 3) * (-y).exp()
    return total


def taylor_integral_enclosure(fun, lo: arb, hi: arb, bins: int = 24) -> arb:
    """Rigorous sixth-order Taylor integration on fixed real intervals."""
    order = 6
    width = (hi - lo) / bins
    total = arb(0)
    for j in range(bins):
        left = lo + j * width
        right = left + width
        mid = (left + right) / 2
        radius = width / 2

        z = arb_series([mid, arb(1)], prec=order + 1)
        coeffs = fun(z).coeffs()
        cell_integral = arb(0)
        for degree in range(0, order, 2):
            cell_integral += (
                2 * coeffs[degree] * radius ** (degree + 1) / (degree + 1)
            )

        zcell = arb_series([interval(left, right), arb(1)], prec=order + 1)
        remainder_coefficient = fun(zcell).coeffs()[order]
        error = (
            2
            * abs(remainder_coefficient).upper()
            * radius ** (order + 1)
            / (order + 1)
        )
        total += cell_integral + arb(0, error)
    # The omitted n>=13 theta terms and their first six derivatives are
    # smaller than 1e-300 on z>=LOG2-A-H.
    return total + arb(0, "1e-290")


def check_theta_tail() -> None:
    xmin = LOG2 - A - H
    y7 = PI * 49 * (2 * xmin).exp()
    assert y7 > 300
    # For n>=7 and x>=xmin, each differentiated summand is decreasing in x.
    # These deliberately loose n=7 first-term bounds and a ratio <1/1000
    # dominate the complete n>=7 tails.
    base = (-y7).exp()
    assert q(10) ** 8 * base < arb("1e-108")
    assert q(10) ** 11 * base < arb("1e-105")
    assert q(10) ** 14 * base < arb("1e-102")
    assert q(10) ** 17 * base < arb("1e-99")


def check_u_convexity() -> None:
    """Certify U''>0 on every fold interval."""
    lo = LOG2 - A - H
    hi = LOG2
    # For the n=1 theta term, U=g(y), y=pi exp(2x), with
    # g(y)=2y-5/2-4y/(2y-3).  Since y>6,
    # g''(x)=8y-48y(2y+3)/(2y-3)^3 > 42.
    ymin = PI * (2 * lo).exp()
    assert ymin > 6
    assert 8 * ymin - 48 * ymin * (2 * ymin + 3) / (2 * ymin - 3) ** 3 > 42

    # Normalize all remaining theta terms by the first.  This avoids the
    # severe interval cancellation in the raw logarithmic derivative.  A
    # second-order Arb series gives the exact second derivative of the
    # correction on each interval.  The n>=7 majorant is <1e-80 here.
    width = (hi - lo) / 256
    for j in range(256):
        cell = interval(lo + j * width, lo + (j + 1) * width)
        x = arb_series([cell, arb(1)], prec=3)
        y = PI * (2 * x).exp()

        def one_u(v):
            return 2 * v - q(5, 2) - 4 * v / (2 * v - 3)

        numerator = one_u(y)
        denominator = 1 + 0 * x
        for n in range(2, 7):
            yn = n * n * y
            ratio = (
                n
                * n
                * (2 * yn - 3)
                / (2 * y - 3)
                * (-(n * n - 1) * y).exp()
            )
            numerator += ratio * one_u(yn)
            denominator += ratio
        correction = numerator / denominator - one_u(y)
        correction_second = 2 * correction.coeffs()[2]
        assert abs(correction_second) < 1
    # Thus U''>42-1-(n>=7 error)>40 throughout the interval.


def q2_right(a: arb, b: arb) -> arb:
    """Right-tail q=2 cumulative advantage at (-a,b)."""
    return C2 * (K(LOG2 - a) / C(a) - K(LOG2 + b) / C(b))


def arch_right_tail(a: arb, b: arb, r: arb, bins: int = 24) -> arb:
    """Adverse archimedean right-tail cumulative from r to infinity."""
    # The finite part contains all numerically visible mass.
    upper = q(5, 2)
    main = taylor_integral_enclosure(
        lambda z: K_taylor(z)
        * (J(z - b) / C(b) - J(z + a) / C(a)),
        r,
        upper,
        bins,
    )
    # z>=5/2: K(z) is below exp(-300) and U(z)>10, while the J factor is
    # bounded by 20 exp(-z/2).  This rational allowance is much wider than
    # the resulting tail.
    return main + arb(0, "1e-100")


def weight_at(a: arb, index: int) -> arb:
    step = H / SUBBINS
    r0 = LOG2 - a - H + index * step
    return 2 * (U(r0 + step) - U(r0))


def box_lower(alo: arb, ahi: arb, blo: arb, bhi: arb) -> arb:
    """Lower bound on the best selected-bin folded contact on one box.

    q2_right and arch_right_tail are increasing in both parameters.  U''>0
    makes each fold weight decrease as a increases.  A bin is used only when
    its cumulative advantage is certified positive on the whole box.
    """
    right = arb(0)
    step = H / SUBBINS
    dlow = q2_right(alo, blo)
    for index in range(SUBBINS):
        r_at_upper = LOG2 - ahi - H + index * step
        cumulative = dlow - arch_right_tail(ahi, bhi, r_at_upper)
        if cumulative > 0:
            right += weight_at(ahi, index) * cumulative

    # Reflection swaps a and b and turns the left fold into the same formula.
    left = arb(0)
    dlow = q2_right(blo, alo)
    for index in range(SUBBINS):
        r_at_upper = LOG2 - bhi - H + index * step
        cumulative = dlow - arch_right_tail(bhi, ahi, r_at_upper)
        if cumulative > 0:
            left += weight_at(bhi, index) * cumulative

    reserve = q(1, 4) * (tanh_half(ahi) + tanh_half(bhi))
    return right + left - reserve


def certify_bad_square() -> tuple[arb, int]:
    """Adaptive rational subdivision of [0,A]^2."""
    # Starting with 1/200-wide boxes is faster than recursively splitting the
    # full square.  Failed boxes are bisected until certified.
    coarse = q(1, 200)
    queue: list[tuple[arb, arb, arb, arb, int]] = []
    n = 56
    for ia in range(n):
        alo = ia * coarse
        ahi = min((ia + 1) * coarse, A)
        for ib in range(ia, n):  # symmetry
            blo = ib * coarse
            bhi = min((ib + 1) * coarse, A)
            queue.append((alo, ahi, blo, bhi, 0))

    certified = 0
    global_lower = arb(10)
    while queue:
        alo, ahi, blo, bhi, depth = queue.pop()
        lower = box_lower(alo, ahi, blo, bhi)
        if lower > 0:
            certified += 1
            if lower < global_lower:
                global_lower = lower
            continue
        if depth >= 10:
            raise AssertionError(
                f"unresolved parameter box {alo,ahi,blo,bhi}; lower={lower}"
            )
        # The origin has exact value zero.  Boxes touching it are certified by
        # radial derivative in certify_origin_wedge below.
        if alo == 0 and blo == 0:
            certify_origin_wedge(ahi, bhi)
            certified += 1
            continue
        if ahi - alo >= bhi - blo:
            mid = (alo + ahi) / 2
            queue.append((alo, mid, blo, bhi, depth + 1))
            queue.append((mid, ahi, blo, bhi, depth + 1))
        else:
            mid = (blo + bhi) / 2
            queue.append((alo, ahi, blo, mid, depth + 1))
            queue.append((alo, ahi, mid, bhi, depth + 1))
    return global_lower, certified


def certify_origin_wedge(amax: arb, bmax: arb) -> None:
    """Explicit small-box radial bound; no division by a+b is used.

    Write p=a+b.  On 0<=a,b<=eps, the q=2 cumulative advantage is at least
    p*d0, where d0 is the minimum of the two one-parameter derivatives of
    K(log(2)-a)/C(a)-K(log(2)+b)/C(b).  The adverse archimedean cumulative is
    at most p*H_i.  This follows by the mean-value theorem and

      d/du[J(z-u)/C(u)] <= -J'(z-eps),
      -d/du[J(z+u)/C(u)]
          <= -J'(z-eps)+(tanh(eps/2)/2)J(z).

    The lower integration endpoint can move left by at most eps.  The eight
    interval integrals below therefore bound the full radial derivative.
    """
    eps = q(1, 200)
    assert amax < q(51, 10000) and bmax < q(51, 10000)

    derivative_lower = arb(1)
    width = eps / 128
    for j in range(128):
        u = interval(j * width, (j + 1) * width)
        inward = (
            K(LOG2 - u)
            / C(u)
            * (U(LOG2 - u) - tanh_half(u) / 2)
        )
        outward = (
            K(LOG2 + u)
            / C(u)
            * (U(LOG2 + u) + tanh_half(u) / 2)
        )
        assert inward > 0 and outward > 0
        derivative_lower = min(
            derivative_lower, inward.lower(), outward.lower()
        )
    derivative_lower *= C2

    radial_gain = arb(0)
    step = H / SUBBINS
    for index in range(SUBBINS):
        r0 = LOG2 - H + index * step
        arch_slope = taylor_integral_enclosure(
            lambda z: K_taylor(z)
            * (
                minus_J_prime(z - eps)
                + tanh_half(eps) * J(z) / 2
            ),
            r0 - eps,
            q(5, 2),
            24,
        ).upper() + arb("1e-100")
        cumulative_slope = derivative_lower - arch_slope
        assert cumulative_slope > 0
        radial_gain += weight_at(eps, index) * cumulative_slope

    # Right and left folds give the same lower radial coefficient.  Also
    # (1/4)(tanh(a/2)+tanh(b/2)) <= (a+b)/8.
    radial_excess_coefficient = 2 * radial_gain - q(1, 8)
    assert radial_excess_coefficient > q(1, 100)


def hall_density(t: arb) -> arb:
    return 4 * K(t) * (t / 2).sinh()


def certify_hall_mass() -> arb:
    near = riemann_enclosure(hall_density, arb(0), A, 4096)
    total_main = riemann_enclosure(hall_density, arb(0), q(5, 2), 16384)
    # At t>=5/2 the theta exponent is already >450; this allowance is vast.
    total = total_main + arb(0, "1e-100")
    excess = 2 * near - total
    assert excess > 0
    return excess


def main() -> None:
    check_theta_tail()
    check_u_convexity()
    lower, boxes = certify_bad_square()
    hall = certify_hall_mass()
    print("certified parameter boxes:", boxes)
    print("smallest retained box lower bound:", lower)
    print("Hall bad-square mass lower enclosure:", hall)
    print("CERTIFIED: every sharp-tail equality coupling meets a bad pair")


if __name__ == "__main__":
    main()
