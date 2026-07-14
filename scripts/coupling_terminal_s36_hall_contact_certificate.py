#!/usr/bin/env python3
"""Exact Hall contact below one half for the terminal S_.36 target.

At ``(x,y)=(4/5,6/5)``, let

    F = {characteristic(u,v) <= 9/25} union {|u-v| <= 1/10}.

The following *channel-coloured* vertex cover contains every real-real and
real-stay edge into F.

* B contains y-arch targets in [-6/5,1] and every y prime atom except the
  inward q=7 and q=8 atoms.
* A contains every x channel whose target lies in

      (-infinity,-11/10] union [9/10,infinity)
        union [y-log(8)-1/10, y-log(7)+1/10].

Indeed ``characteristic<=9/25`` forces each target coordinate into
``[-18/25,18/25]``.  If an arch y target is outside B, this branch is
impossible and its radius-1/10 neighbourhood lies in a tail of A.  The two
excluded prime targets have modulus greater than 18/25 and their tube
neighbourhoods make the displayed middle component of A.  Held-coordinate
edges obey the same alternatives.

The arch capacity is enclosed by validated integration of four positive
theta terms, a uniform omitted-theta bound, and explicit double-exponential
half-line tails.  Prime powers through 10000 are enumerated exactly.  Every
remaining prime-power channel is bounded by the corresponding all-integer
Gaussian tail, which is below 1e-12,000,000 here.  Thus a strict result below
1/2 is a continuum Hall certificate, not a finite LP extrapolation.

It also gives a fatal contact for the simplest genuinely lifted age policy.
Suppose age runs on a circle, only an F-entrance may lower the continuation
value, and every residual jump is credit-neutral.  Even granting continuation
zero after an F-entrance, a positive periodic supersolution w(a) would obey

    w'(a) + (kappa-h(a)) w(a) <= 0,

where Hall gives h(a) at most the cover capacity.  At
``kappa=4999/10000`` the certificate proves ``kappa-h(a)>3e-5``.  Integrating
``(log w)'<-3e-5`` around the age circle is impossible.  The same inequality
on an unbounded age line forces w to zero, contradicting w>=1.  Hence a
surviving continuous-credit lift must extract a strictly negative generator
contribution from residual credit updates; scheduling the old hard progress
clock by age alone cannot work.
"""

from __future__ import annotations

from math import isqrt

from flint import acb, arb, ctx

import coupling_anchor_beta_transport_certificate as base
import coupling_high_thin_projection_hall_certificate as theta


ctx.prec = 240
q = base.q
X = q(4, 5)
Y = q(6, 5)
HALF = q(1, 2)
CUTOFF = q(9, 25)
TUBE = q(1, 10)
COORDINATE_BOUND = 2 * CUTOFF
B_LEFT = -q(6, 5)
B_RIGHT = arb(1)
A_LEFT_TAIL = -q(11, 10)
A_RIGHT_TAIL = q(9, 10)
A_MIDDLE_LEFT = Y - arb(8).log() - TUBE
A_MIDDLE_RIGHT = Y - arb(7).log() + TUBE
TAIL_CUTOFF = arb(4)
PRIME_CUTOFF = 10_000
TEST_KAPPA = q(4999, 10000)


def normalizer(source: arb) -> arb:
    return (source / 2).cosh()


def finite_arch_interval_upper(source: arb, left: arb, right: arb) -> arb:
    """Validated upper mass on a bounded interval away from source."""
    assert left < right
    assert right < source or left > source
    source_complex = acb(source)

    def positive_integrand(z: acb, analytic: bool) -> acb:
        del analytic
        displacement = source_complex-z if right < source else z-source_complex
        return theta.theta_partial_complex(z) * theta.levy_complex(displacement)

    def negative_integrand(t: acb, analytic: bool) -> acb:
        del analytic
        z = -t
        return theta.theta_partial_complex(t) * theta.levy_complex(
            source_complex-z
        )

    options = dict(abs_tol=arb("1e-60"), rel_tol=arb("1e-60"),
                   eval_limit=200_000)
    partial = arb(0)
    if right <= 0:
        value = acb.integral(negative_integrand, -right, -left, **options)
        assert value.imag == 0
        partial += value.real
    elif left >= 0:
        value = acb.integral(positive_integrand, left, right, **options)
        assert value.imag == 0
        partial += value.real
    else:
        neg = acb.integral(negative_integrand, arb(0), -left, **options)
        pos = acb.integral(positive_integrand, arb(0), right, **options)
        assert neg.imag == 0 and pos.imag == 0
        partial += neg.real+pos.real

    closest = min(abs(source-left), abs(source-right))
    assert closest > 0
    omitted = (right-left)*theta.THETA_TAIL*base.levy_shape(closest)
    return arb(
        ((arb(partial.upper())+arb(omitted.upper())) /
         arb(normalizer(source).lower())).upper()
    )


def arch_tail_upper(source: arb, *, positive: bool) -> arb:
    """Upper mass on [T,infinity) or (-infinity,-T]."""
    T = TAIL_CUTOFF
    W = (2*T).exp()
    # For t>=T and v=pi*n^2*exp(2t), positivity and 2v-3<=2v give
    # K_n(t)<=2*pi^2*n^4*exp(9t/2-v).  After multiplying by exp(-t/2),
    # integrating the n-th theta majorant
    # gives (pi*n^2*W+1) exp(-pi*n^2*W).  Its consecutive ratio is bounded
    # by the n=1 to n=2 majorant ratio: the polynomial ratio decreases and
    # the exponential difference 2n+1 increases.
    first = (arb.pi()*W+1)*(-arb.pi()*W).exp()
    ratio = ((4*arb.pi()*W+1)/(arb.pi()*W+1)) * \
            (-3*arb.pi()*W).exp()
    assert ratio < 1
    series = first/(1-ratio)
    if positive:
        closest = T-source
        factor = (source/2).exp()
    else:
        closest = T+source
        factor = (-source/2).exp()
    assert closest > 0
    denominator = 1-(-2*closest).exp()
    unnormalized = factor*series/denominator
    return arb((unnormalized/arb(normalizer(source).lower())).upper())


def prime_powers(limit: int) -> list[tuple[int, int]]:
    sieve = bytearray(b"\x01")*(limit+1)
    sieve[:2] = b"\x00\x00"
    for p in range(2,isqrt(limit)+1):
        if sieve[p]:
            sieve[p*p:limit+1:p] = b"\x00" * (((limit-p*p)//p)+1)
    answer=[]
    for p in range(2,limit+1):
        if not sieve[p]:
            continue
        power=p
        while power<=limit:
            answer.append((power,p))
            if power>limit//p:
                break
            power*=p
    return sorted(answer)


def prime_integer_tail_upper(source: arb) -> arb:
    """Bound every prime-power channel q>PRIME_CUTOFF by all integers."""
    n=arb(PRIME_CUTOFF+1)
    exp_source=source.exp()
    a=arb.pi()/exp_source**2
    # Both signs are bounded by twice the inward majorant, using the proved
    # monotonic decrease of K on the positive half-line.  For t=log(n)-s,
    # the theta bound is
    #   K(t)<=2*pi^2*n^(9/2)*exp(-pi*n^2/exp(2s))
    #          /(exp(9s/2)*(1-r_theta)).
    # Multiplication by log(n)/sqrt(n) leaves n^4 log(n).  Its consecutive
    # ratio is maximal at the first integer: both 4/t+1/(t log t) and the
    # exponential ratio decrease for t>1.
    theta_ratio = 16*(-3*a*n**2).exp()
    assert theta_ratio < 1
    kernel_prefactor = 2*arb.pi()**2/exp_source**q(9,2)/(1-theta_ratio)
    first = n**4*n.log()*(-a*n**2).exp()
    ratio = ((n+1)/n)**4*((n+1).log()/n.log()) * \
            (-a*(2*n+1)).exp()
    assert ratio < 1
    total = 2*kernel_prefactor*first/(1-ratio)
    return arb((total/arb(normalizer(source).lower())).upper())


def prime_selected_upper(source: arb, selector) -> arb:
    total=arb(0)
    denominator=arb(normalizer(source).lower())
    for power,prime in prime_powers(PRIME_CUTOFF):
        ell=arb(power).log()
        coefficient=arb((arb(prime).log()/arb(power).sqrt()).upper())
        for sign in (-1,1):
            target=source+sign*ell
            if not selector(power,sign,target):
                continue
            _lower,upper=base.kernel_bounds(target)
            total += coefficient*arb(upper.upper())/denominator
    total += prime_integer_tail_upper(source)
    return arb(total.upper())


def audit_geometry() -> None:
    assert COORDINATE_BOUND.contains(q(18, 25))
    assert A_MIDDLE_LEFT < A_MIDDLE_RIGHT
    assert A_LEFT_TAIL < A_MIDDLE_LEFT < A_MIDDLE_RIGHT < A_RIGHT_TAIL

    v7 = Y - arb(7).log()
    v8 = Y - arb(8).log()
    assert abs(v7) > COORDINATE_BOUND
    assert abs(v8) > COORDINATE_BOUND
    assert (A_MIDDLE_LEFT - (v8 - TUBE)).contains(0)
    assert (A_MIDDLE_RIGHT - (v7 + TUBE)).contains(0)
    # The two open tube intervals overlap, so their union is exactly the
    # displayed middle component.
    assert v7 - TUBE < v8 + TUBE

    # An F edge with y-channel outside B cannot use the characteristic
    # branch.  Its tube neighbourhood is in the corresponding component of
    # A.  These exact endpoint identities also cover held-y edges.
    assert (B_LEFT+TUBE-A_LEFT_TAIL).contains(0)
    assert (B_RIGHT-TUBE-A_RIGHT_TAIL).contains(0)
    assert Y-TUBE > A_RIGHT_TAIL
    assert B_LEFT < X-TUBE < X+TUBE < B_RIGHT
    assert not (X-TUBE <= v7 <= X+TUBE)
    assert not (X-TUBE <= v8 <= X+TUBE)

    # The only inward x prime targets in A^c are q=2,3,4.  q=5 is in the
    # deleted middle component and q>=7 lies in the left tail A.
    for power in (2, 3, 4):
        target = X - arb(power).log()
        assert A_LEFT_TAIL < target < A_RIGHT_TAIL
        assert not (A_MIDDLE_LEFT < target < A_MIDDLE_RIGHT)
    assert A_MIDDLE_LEFT < X - arb(5).log() < A_MIDDLE_RIGHT
    assert X - arb(7).log() < A_LEFT_TAIL
    assert X + arb(2).log() > A_RIGHT_TAIL
    first_tail=arb(PRIME_CUTOFF+1)
    assert X-first_tail.log() < A_LEFT_TAIL
    assert X+first_tail.log() > A_RIGHT_TAIL


def main() -> None:
    audit_geometry()

    x_arch_upper = (
        finite_arch_interval_upper(X,-TAIL_CUTOFF,A_LEFT_TAIL)
        + finite_arch_interval_upper(X,A_MIDDLE_LEFT,A_MIDDLE_RIGHT)
        + finite_arch_interval_upper(X,A_RIGHT_TAIL,TAIL_CUTOFF)
        + arch_tail_upper(X,positive=False)
        + arch_tail_upper(X,positive=True)
    )

    def x_prime_selector(power: int, sign: int, target: arb) -> bool:
        del power,sign
        return (target <= A_LEFT_TAIL or target >= A_RIGHT_TAIL or
                A_MIDDLE_LEFT <= target <= A_MIDDLE_RIGHT)

    x_prime_upper=prime_selected_upper(X,x_prime_selector)
    x_cover_upper=x_arch_upper+x_prime_upper

    y_arch_upper=finite_arch_interval_upper(Y,B_LEFT,B_RIGHT)

    def y_prime_selector(power: int, sign: int, target: arb) -> bool:
        del target
        return not (sign==-1 and power in (7,8))

    y_prime_upper=prime_selected_upper(Y,y_prime_selector)
    y_cover_upper=y_arch_upper+y_prime_upper
    cover_minus_half_upper=arb((x_cover_upper+y_cover_upper-HALF).upper())
    deficit = -cover_minus_half_upper
    assert cover_minus_half_upper < 0
    assert deficit > q(1,10000)
    capacity_upper=arb((x_cover_upper+y_cover_upper).upper())
    kappa_gap=arb((TEST_KAPPA-capacity_upper).lower())
    assert kappa_gap > arb("3e-5")

    print("precision_bits:", ctx.prec)
    print("source_(m,r):", (arb(1), q(2, 5)))
    print("source_(x,y):", (X, Y))
    print("target: c<=9/25 or r<=1/10")
    print("cover_A_components:",
          (("left_tail", A_LEFT_TAIL),
           (A_MIDDLE_LEFT, A_MIDDLE_RIGHT),
           ("right_tail", A_RIGHT_TAIL)))
    print("cover_B_arch_interval:", (B_LEFT, B_RIGHT))
    print("cover_B_prime_channels: all except inward q=7,8")
    print("x_arch_A_upper:",x_arch_upper)
    print("x_prime_A_upper:",x_prime_upper)
    print("x_cover_upper:",x_cover_upper)
    print("y_arch_B_upper:",y_arch_upper)
    print("y_prime_B_upper:",y_prime_upper)
    print("y_cover_upper:",y_cover_upper)
    print("prime_enumeration_cutoff:",PRIME_CUTOFF)
    print("prime_integer_tail_x_upper:",prime_integer_tail_upper(X))
    print("prime_integer_tail_y_upper:",prime_integer_tail_upper(Y))
    print("cover_capacity_minus_half_upper:", cover_minus_half_upper)
    print("strict_Hall_deficit_lower:", deficit)
    print("test_kappa:",TEST_KAPPA)
    print("test_kappa_minus_capacity_lower:",kappa_gap)
    print("terminal_S36_continuum_Hall_contact: PASS")
    print("credit_neutral_age_lift_at_kappa_4999/10000: OBSTRUCTED")


if __name__ == "__main__":
    main()
