#!/usr/bin/env python3
"""Uniform Arb certificate for snowflake exponents 1/4 <= alpha <= 1.

Let U=-(log K)' and d_alpha(x,y)=|U(x)-U(y)|^alpha.  At

    a=3 log(2)/4,  b=a+3/100,  z=b-log(2),  v=7/5,

put D_alpha=d_alpha(a,b) and

    f_alpha(x)=max(-d_alpha(x,a),
                   D_alpha-d_alpha(x,b),
                   v-d_alpha(x,z)).

This script proves, uniformly for every alpha in [1/4,1], that f_alpha is a
global exact contact at (a,b) and

    L f_alpha(b)-L f_alpha(a)+D_alpha/2 > 0.

Alpha is enclosed as an Arb interval on every member of an exhaustive exact
rational subdivision.  No conclusion is extrapolated from sampled exponent
values.  The theta, Levy, spatial-tail, and prime-tail bounds are those of
the independently runnable fixed-exponent certificate.

Reproduction:

    python3 -m pip install --target /tmp/pvdeps python-flint
    PYTHONPATH=/tmp/pvdeps python3 scripts/snowflake_uniform_exponent_certificate.py
"""

from __future__ import annotations

from flint import arb, ctx

import snowflake_three_cone_certificate as base


ctx.prec = 180


def q(p: int, d: int = 1) -> arb:
    return arb(p) / d


PI = base.PI
A = base.A
B = base.B
Z = base.Z
V = base.V
R = base.R
UA = base.UA
UB = base.UB
UZ = base.UZ
AK = base.AK
BK = base.BK

ALPHA_LEFT = q(1, 4)
ALPHA_RIGHT = arb(1)
ALPHA_CELLS = 32
ARCH_PIECES = 5000
PRIME_CUTOFF = 16

# The least absolute omitted prime target is log(17)-b, so all q>16 targets
# lie inside the |x|>=2 region where AK and BK were proved.
assert arb(PRIME_CUTOFF + 1).log() - B > R


def symmetric_error(radius: arb) -> arb:
    upper = radius.upper()
    return (-upper).union(upper)


def hull(values: list[arb]) -> arb:
    result = values[0]
    for value in values[1:]:
        result = result.union(value)
    return result


def point_power(value: arb, exponent: arb) -> arb:
    """Power of nonnegative point enclosures, with exact handling at zero."""
    if value == 0:
        return arb(0)
    assert value > 0
    return (exponent * value.log()).exp()


def positive_power_range(value: arb, alpha: arb) -> arb:
    """Enclose x^alpha for positive x and interval alpha."""
    assert value > 0
    low = value.lower()
    high = value.upper()
    alpha_low = alpha.lower()
    alpha_high = alpha.upper()
    return hull(
        [
            point_power(low, alpha_low),
            point_power(low, alpha_high),
            point_power(high, alpha_low),
            point_power(high, alpha_high),
        ]
    )


def abs_power_range(value: arb, alpha: arb) -> arb:
    """Enclose |x|^alpha, including balls that cross zero."""
    if value > 0:
        low = value.lower()
        high = value.upper()
    elif value < 0:
        low = (-value).lower()
        high = (-value).upper()
    else:
        low = arb(0)
        high = value.upper().max((-value).upper())

    alpha_low = alpha.lower()
    alpha_high = alpha.upper()
    values = [
        point_power(high, alpha_low),
        point_power(high, alpha_high),
    ]
    if low == 0:
        values.append(arb(0))
    else:
        values.extend(
            [point_power(low, alpha_low), point_power(low, alpha_high)]
        )
    return hull(values)


def exponent_data(alpha: arb) -> tuple[arb, callable]:
    """Return D_alpha and the interval extension of the three-cone contact."""
    d = positive_power_range(UB - UA, alpha)
    distance_za = abs_power_range(UZ - UA, alpha)
    distance_zb = abs_power_range(UZ - UB, alpha)
    assert V > d
    assert distance_za > V
    assert distance_zb > V - d

    def contact(x: arb) -> arb:
        ux = base.U(x)
        cone_a = -abs_power_range(ux - UA, alpha)
        cone_b = d - abs_power_range(ux - UB, alpha)
        cone_z = V - abs_power_range(ux - UZ, alpha)
        return cone_a.max(cone_b).max(cone_z)

    return d, contact


def central_levy_error(r: arb, alpha: arb, t0: arb) -> arb:
    """Absolute error for both 0<h<t0^5 pieces around one endpoint."""
    h0 = t0**5
    neighborhood = (r - h0).union(r + h0)
    k, kp, kpp = base.theta_data(neighborhood)
    up = (kp / k) ** 2 - kpp / k
    assert up > 0
    m_alpha = positive_power_range(up.upper(), alpha)
    h_alpha = positive_power_range(h0, alpha)
    one_side = (
        k.upper()
        * m_alpha
        * (q(3, 2) * h0).exp()
        * h_alpha
        / (2 * alpha * base.C(r))
    )
    return (2 * one_side).upper()


def integrate_arch_side(
    r: arb,
    fr: arb,
    alpha: arb,
    contact,
    direction: int,
) -> arb:
    """One finite archimedean side, with h=t^5."""
    assert direction in (-1, 1)
    physical_length = R - r if direction == 1 else R + r
    t_end = physical_length ** q(1, 5)
    t0 = q(1, 200)
    width = (t_end - t0) / ARCH_PIECES
    total = arb(0)
    for index in range(ARCH_PIECES):
        left = t0 + index * width
        right = left + width
        t = left.union(right)
        h = t**5
        x = r + direction * h
        integrand = (
            5
            * t**4
            * base.J(h)
            * base.K(x)
            * (contact(x) - fr)
            / base.C(r)
        )
        total += integrand * width
    return total


def spatial_tail_bound(r: arb, alpha: arb, direction: int) -> arb:
    """Absolute archimedean tail beyond +R or -R, uniformly in alpha."""
    assert direction in (-1, 1)
    signed_r = r if direction == 1 else -r
    kernel_constant = (signed_r / 2).exp() / (
        1 - (-2 * (R - signed_r)).exp()
    )
    gaussian = (-PI * (2 * R).exp()).exp()
    radical_constant = (
        ((1 - alpha) * AK.log() + alpha * BK.log()).exp()
    )
    radical_power = 4 + 2 * alpha
    radical_term = (
        radical_constant
        * (radical_power * R).exp()
        * gaussian
        / (2 * PI * (2 * R).exp() - radical_power)
    )
    endpoint_term = (
        AK
        * abs_power_range(base.U(r), alpha)
        * (4 * R).exp()
        * gaussian
        / (2 * PI * (2 * R).exp() - 4)
    )
    return (kernel_constant * (radical_term + endpoint_term) / base.C(r)).upper()


def arch_value(r: arb, fr: arb, alpha: arb, contact) -> arb:
    finite = integrate_arch_side(r, fr, alpha, contact, -1)
    finite += integrate_arch_side(r, fr, alpha, contact, 1)
    error = central_levy_error(r, alpha, q(1, 200))
    error += spatial_tail_bound(r, alpha, -1)
    error += spatial_tail_bound(r, alpha, 1)
    return finite + symmetric_error(error)


def finite_prime_value(r: arb, fr: arb, contact) -> arb:
    total = arb(0)
    for prime_power, prime in base.prime_powers_up_to(PRIME_CUTOFF):
        shift = arb(prime_power).log()
        coefficient = arb(prime).log() / arb(prime_power).sqrt()
        total += coefficient * (
            base.K(r + shift) * (contact(r + shift) - fr)
            + base.K(r - shift) * (contact(r - shift) - fr)
        ) / base.C(r)
    return total


def gaussian_integer_tail(c: arb, power: arb, start: int) -> arb:
    """Bound sum log(n)n^power exp(-c n^2), allowing interval power."""
    n = arb(start)
    first = n.log() * (power * n.log()).exp() * (-c * n**2).exp()
    ratio = (
        2
        * (power * q(start + 1, start).log()).exp()
        * (-c * (2 * start + 1)).exp()
    )
    assert ratio < q(1, 10)
    return first / (1 - ratio)


def prime_tail_bound(r: arb, alpha: arb) -> arb:
    """Overcount all omitted prime powers by all integers n>=17."""
    total = arb(0)
    start = PRIME_CUTOFF + 1
    radical_constant = ((1 - alpha) * AK.log() + alpha * BK.log()).exp()
    radical_power = 4 + 2 * alpha
    for sign in (-1, 1):
        offset = sign * r
        c = PI * (2 * offset).exp()
        total += (
            radical_constant
            * ((q(9, 2) + 2 * alpha) * offset).exp()
            * gaussian_integer_tail(c, radical_power, start)
        )
        total += (
            AK
            * abs_power_range(base.U(r), alpha)
            * (q(9, 2) * offset).exp()
            * gaussian_integer_tail(c, arb(4), start)
        )
    return (total / base.C(r)).upper()


def certify_cell(alpha: arb) -> arb:
    d, contact = exponent_data(alpha)
    arch_a = arch_value(A, arb(0), alpha, contact)
    arch_b = arch_value(B, d, alpha, contact)
    prime_a = finite_prime_value(A, arb(0), contact)
    prime_a += symmetric_error(prime_tail_bound(A, alpha))
    prime_b = finite_prime_value(B, d, contact)
    prime_b += symmetric_error(prime_tail_bound(B, alpha))
    return arch_b + prime_b - arch_a - prime_a + d / 2


global_lower = None
global_upper = None

for cell_index in range(ALPHA_CELLS):
    # Exactly [1/4+3j/128, 1/4+3(j+1)/128], j=0,...,31.
    cell_left = q(32 + 3 * cell_index, 128)
    cell_right = q(35 + 3 * cell_index, 128)
    alpha_cell = cell_left.union(cell_right)
    defect = certify_cell(alpha_cell)
    assert defect > q(1, 25)
    lower = defect.lower()
    upper = defect.upper()
    global_lower = lower if global_lower is None else global_lower.min(lower)
    global_upper = upper if global_upper is None else global_upper.max(upper)
    print(
        "cell",
        cell_index,
        "alpha_left=",
        cell_left.str(15),
        "alpha_right=",
        cell_right.str(15),
        "defect_lower=",
        lower.str(18, radius=False),
        flush=True,
    )

assert global_lower is not None and global_upper is not None
print("global defect lower bound:", global_lower.str(40, radius=False))
print("global defect upper bound:", global_upper.str(40, radius=False))
print("CERTIFIED: every alpha in [1/4,1] fails rate-1/2 contraction")
