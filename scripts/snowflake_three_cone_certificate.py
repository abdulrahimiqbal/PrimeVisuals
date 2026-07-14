#!/usr/bin/env python3
"""Rigorous Arb certificate for a three-cone snowflake countercontact.

For

    d(x,y) = |U(x)-U(y)|^(2/5),       U = -(log K)',

this script certifies a global unit-Lipschitz contact f at the pair

    a = 3 log(2)/4,       b = a + 3/100

for which

    Lf(b) - Lf(a) + d(a,b)/2 > 0.

Consequently this particular snowflaked U metric cannot satisfy sharp
rate-1/2 W1 contraction for the physical Markov semigroup.  Every numerical
comparison is an Arb interval comparison.  The archimedean Levy singularity
is integrated after h=t^5, and the omitted spatial and prime-power tails are
bounded by explicit Gaussian majorants.

Reproduction:

    python3 -m pip install --target /tmp/pvdeps python-flint
    PYTHONPATH=/tmp/pvdeps python3 scripts/snowflake_three_cone_certificate.py
"""

from __future__ import annotations

from flint import arb, ctx


ctx.prec = 180


def q(p: int, d: int = 1) -> arb:
    return arb(p) / d


PI = arb.pi()
LOG2 = arb(2).log()
ALPHA = q(2, 5)
A = q(3, 4) * LOG2
B = A + q(3, 100)
Z = B - LOG2
V = q(7, 5)
R = arb(2)


def symmetric_error(radius: arb) -> arb:
    """Return a symmetric ball containing [-radius,+radius]."""
    upper = radius.upper()
    return (-upper).union(upper)


def abs_power(x: arb) -> arb:
    """An enclosure of |x|^(2/5), including intervals crossing zero."""
    if x >= 0:
        return x**ALPHA
    if x <= 0:
        return (-x) ** ALPHA
    high = x.upper().max((-x).upper())
    # Taking the power before forming the hull avoids applying a fractional
    # power to the tiny negative rounding skirt of a ball containing zero.
    return arb(0).union(high**ALPHA)


def positive_theta_data(t: arb) -> tuple[arb, arb, arb]:
    """K(t), K'(t), K''(t) for a ball contained in [0,infinity)."""
    # A hull beginning at zero can acquire a microscopic negative rounding
    # skirt.  The theta formulas and all majorants below remain valid there;
    # the only inequality needed is pi exp(2t)>3.
    assert PI * (2 * t.lower()).exp() > 3
    k_sum = arb(0)
    kp_sum = arb(0)
    kpp_sum = arb(0)
    for n in range(1, 8):
        y = PI * n * n * (2 * t).exp()
        k = PI * n * n * (q(5, 2) * t).exp() * (2 * y - 3) * (-y).exp()
        logarithmic_derivative = q(5, 2) + 4 * y / (2 * y - 3) - 2 * y
        minus_logarithmic_derivative_prime = 4 * y + 24 * y / (2 * y - 3) ** 2
        k_sum += k
        kp_sum += k * logarithmic_derivative
        kpp_sum += k * (
            logarithmic_derivative**2 - minus_logarithmic_derivative_prime
        )

    # For n>=8 and y=pi*n^2 exp(2t)>3,
    #
    # k_n <= 2 pi^2 n^4 exp(9t/2) exp(-pi n^2 exp(2t)),
    # |k_n'| <= 8 pi^3 n^6 exp(13t/2) exp(-pi n^2 exp(2t)),
    # |k_n''| <= 48 pi^4 n^8 exp(17t/2) exp(-pi n^2 exp(2t)).
    #
    # Consecutive majorants are bounded by the displayed geometric ratios.
    n = 8
    low = t.lower()
    high = t.upper()
    exponential_low = (2 * low).exp()
    tail_specs = (
        (4, 2 * PI**2, q(9, 2)),
        (6, 8 * PI**3, q(13, 2)),
        (8, 48 * PI**4, q(17, 2)),
    )
    tail_errors = []
    for power, factor, growth in tail_specs:
        first = (
            factor
            * arb(n) ** power
            * (growth * high).exp()
            * (-PI * n * n * exponential_low).exp()
        )
        ratio = (
            q(n + 1, n) ** power
            * (-PI * (2 * n + 1) * exponential_low).exp()
        )
        assert ratio < q(1, 10)
        tail_errors.append(first / (1 - ratio))

    k_sum += symmetric_error(tail_errors[0])
    kp_sum += symmetric_error(tail_errors[1])
    kpp_sum += symmetric_error(tail_errors[2])
    assert k_sum > 0
    return k_sum, kp_sum, kpp_sum


def theta_data(x: arb) -> tuple[arb, arb, arb]:
    """K(x), K'(x), K''(x) on a ball not straddling zero."""
    if x >= 0:
        return positive_theta_data(x)
    if x <= 0:
        k, kp, kpp = positive_theta_data(-x)
        return k, -kp, kpp
    # K is even.  Evaluate the positive theta series on an interval enclosing
    # |x|; the physical first derivative can take either sign.  This avoids
    # the invalid shortcut of bounding a zero-straddling interval only by its
    # two endpoints.
    high = x.upper().max((-x).upper())
    absolute_x = arb(0).union(high)
    k, kp, kpp = positive_theta_data(absolute_x)
    return k, kp.union(-kp), kpp


def K(x: arb) -> arb:
    return theta_data(x)[0]


def U(x: arb) -> arb:
    k, kp, _ = theta_data(x)
    return -kp / k


def C(x: arb) -> arb:
    return (x / 2).cosh()


def J(t: arb) -> arb:
    assert t > 0
    return (-t / 2).exp() / (1 - (-2 * t).exp())


UA = U(A)
UB = U(B)
UZ = U(Z)
D = (UB - UA) ** ALPHA

# The three assigned values 0,D,V obey all pairwise Lipschitz constraints.
assert abs_power(UZ - UA) > V
assert abs_power(UZ - UB) > V - D


def contact(x: arb) -> arb:
    ux = U(x)
    cone_a = -abs_power(ux - UA)
    cone_b = D - abs_power(ux - UB)
    cone_z = V - abs_power(ux - UZ)
    return cone_a.max(cone_b).max(cone_z)


def central_levy_error(r: arb, t0: arb) -> arb:
    """Absolute bound for both sides with 0<h<t0^5 around r."""
    h0 = t0**5
    neighborhood = (r - h0).union(r + h0)
    k, kp, kpp = theta_data(neighborhood)
    up = (kp / k) ** 2 - kpp / k
    assert up > 0
    m = up.upper()
    kmax = k.upper()
    # J(h)<=exp(3h0/2)/(2h), and |U(r+-h)-U(r)|<=m h.
    one_side = (
        kmax
        * m**ALPHA
        * (q(3, 2) * h0).exp()
        * h0**ALPHA
        / (2 * ALPHA * C(r))
    )
    return 2 * one_side


def integrate_arch_side(
    r: arb, fr: arb, direction: int, pieces: int = 5000
) -> arb:
    """Integrate one side of the arch term from r to +/-R via h=t^5."""
    assert direction in (-1, 1)
    physical_length = R - r if direction == 1 else R + r
    t_end = physical_length ** q(1, 5)
    t0 = q(1, 200)
    width = (t_end - t0) / pieces
    total = arb(0)
    for index in range(pieces):
        left = t0 + index * width
        right = left + width
        t = left.union(right)
        h = t**5
        x = r + direction * h
        jacobian = 5 * t**4
        integrand = (
            jacobian
            * J(h)
            * K(x)
            * (contact(x) - fr)
            / C(r)
        )
        total += integrand * width
    return total


# For z>=R the elementary n-sum estimates give
#
# K(z) <= AK exp(9z/2-pi exp(2z)),
# |K'(z)| <= BK exp(13z/2-pi exp(2z)).
#
# The constants below include a factor two for the n>=2 Gaussian tail.
AK = 4 * PI**2
BK = 16 * PI**3

# The n>=2 tails in the two envelopes are smaller than geometric series
# with these first ratios, so the factor two in AK and BK is rigorous.
assert 16 * (-3 * PI * (2 * R).exp()).exp() < q(1, 2)
assert 64 * (-3 * PI * (2 * R).exp()).exp() < q(1, 2)


def spatial_tail_bound(r: arb, direction: int) -> arb:
    """Absolute archimedean tail beyond +R or -R."""
    assert direction in (-1, 1)
    # z=+w has distance w-r; z=-w has distance w+r.
    signed_r = r if direction == 1 else -r
    kernel_constant = (signed_r / 2).exp() / (
        1 - (-2 * (R - signed_r)).exp()
    )
    gaussian = (-PI * (2 * R).exp()).exp()
    radical_term = (
        AK ** (1 - ALPHA)
        * BK**ALPHA
        * (q(24, 5) * R).exp()
        * gaussian
        / (2 * PI * (2 * R).exp() - q(24, 5))
    )
    endpoint_term = (
        AK
        * abs_power(U(r))
        * (4 * R).exp()
        * gaussian
        / (2 * PI * (2 * R).exp() - 4)
    )
    return kernel_constant * (radical_term + endpoint_term) / C(r)


def arch_value(r: arb, fr: arb) -> arb:
    t0 = q(1, 200)
    finite = integrate_arch_side(r, fr, -1) + integrate_arch_side(r, fr, 1)
    error = central_levy_error(r, t0)
    error += spatial_tail_bound(r, -1) + spatial_tail_bound(r, 1)
    return finite + symmetric_error(error)


def prime_powers_up_to(limit: int) -> list[tuple[int, int]]:
    """Return (p^k,p), without using any unproved primality oracle."""
    sieve = [True] * (limit + 1)
    primes = []
    for p in range(2, limit + 1):
        if sieve[p]:
            primes.append(p)
            for multiple in range(p * p, limit + 1, p):
                sieve[multiple] = False
    answer = []
    for p in primes:
        power = p
        while power <= limit:
            answer.append((power, p))
            power *= p
    return sorted(answer)


PRIME_CUTOFF = 16


def finite_prime_value(r: arb, fr: arb) -> arb:
    total = arb(0)
    for prime_power, prime in prime_powers_up_to(PRIME_CUTOFF):
        shift = arb(prime_power).log()
        coefficient = arb(prime).log() / arb(prime_power).sqrt()
        total += coefficient * (
            K(r + shift) * (contact(r + shift) - fr)
            + K(r - shift) * (contact(r - shift) - fr)
        ) / C(r)
    return total


def gaussian_integer_tail(c: arb, power: arb, start: int) -> arb:
    """Bound sum_{n>=start} log(n)n^power exp(-c n^2)."""
    n = arb(start)
    first = n.log() * n**power * (-c * n**2).exp()
    # Uniformly for every later n, log(n+1)/log(n)<2, the polynomial
    # ratio is at most its value at `start`, and the Gaussian ratio only
    # decreases.  The deliberately coarse factor 2 avoids relying on a
    # monotonicity claim for the logarithmic ratio.
    ratio = (
        2
        * q(start + 1, start) ** power
        * (-c * (2 * start + 1)).exp()
    )
    assert ratio < q(1, 10)
    return first / (1 - ratio)


def prime_tail_bound(r: arb) -> arb:
    """Overcount every omitted prime power by every integer n>=17."""
    total = arb(0)
    start = PRIME_CUTOFF + 1
    for sign in (-1, 1):
        # |r +/- log n|=log n + sign*r for n>=17 and |r|<1.
        offset = sign * r
        c = PI * (2 * offset).exp()
        radical_constant = (
            AK ** (1 - ALPHA)
            * BK**ALPHA
            * (q(53, 10) * offset).exp()
        )
        endpoint_constant = AK * abs_power(U(r)) * (q(9, 2) * offset).exp()
        total += radical_constant * gaussian_integer_tail(
            c, q(24, 5), start
        )
        total += endpoint_constant * gaussian_integer_tail(c, arb(4), start)
    return total / C(r)


if __name__ == "__main__":
    ARCH_A = arch_value(A, arb(0))
    ARCH_B = arch_value(B, D)
    PRIME_A = finite_prime_value(A, arb(0)) + symmetric_error(
        prime_tail_bound(A)
    )
    PRIME_B = finite_prime_value(B, D) + symmetric_error(
        prime_tail_bound(B)
    )

    DEFECT = ARCH_B + PRIME_B - ARCH_A - PRIME_A + D / 2
    assert DEFECT > q(9, 100)

    print("U(a) enclosure:", UA)
    print("U(b) enclosure:", UB)
    print("snowflake contact distance D:", D)
    print("archimedean value at a:", ARCH_A)
    print("archimedean value at b:", ARCH_B)
    print("finite-plus-tail prime value at a:", PRIME_A)
    print("finite-plus-tail prime value at b:", PRIME_B)
    print("full generator contact defect:", DEFECT.str(50))
    print(
        "certified defect lower bound:",
        DEFECT.lower().str(40, radius=False),
    )
    print(
        "certified defect upper bound:",
        DEFECT.upper().str(40, radius=False),
    )
    print(
        "CERTIFIED: d_(2/5)=|U(x)-U(y)|^(2/5) "
        "fails rate-1/2 contraction"
    )
