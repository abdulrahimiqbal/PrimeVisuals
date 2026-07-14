#!/usr/bin/env python3
"""Exact short-displacement coupling of the two normalized beta tail laws.

Let

    beta_+(dz)=2 exp(-z/2)K(z)dz,
    beta_-(dz)=2 exp(+z/2)K(z)dz=beta_+(-dz).

Both measures have mass 1/2.  This script certifies the global curvature
bound

    U'(t)>18,       U(t)=-(log K)'(t),       t>=0.     (1)

The interval [0,1] is covered by 4096 Arb boxes with explicit theta tails;
the range t>=1 is handled by a one-term relative theta estimate.

Put d=3/50.  If f_+,f_- are the two beta densities, then

    R_d(t)=log(f_-(t+d)/f_+(t))
          =t+d/2+log K(t+d)-log K(t).

Evenness gives R_d(-d/2)=0.  Extending U oddly, (1) gives

    R_d'(t)=1-[U(t+d)-U(t)] < 1-18d < 0.

Thus f_-(t+d)-f_+(t) is positive before -d/2 and negative after it.  Its
integral from -infinity to t starts at zero, rises once, and returns to zero
because the beta masses agree.  Consequently

    F_+(t) <= F_-(t+d)  for every t.                   (2)

Also beta_- stochastically dominates beta_+: the density difference has one
sign on each side of zero and total integral zero.  Hence

    F_-(t) <= F_+(t) <= F_+(t+d).                      (3)

The two inequalities (2)--(3) are exactly the one-dimensional
Strassen/quantile criterion for a coupling supported on |z_+-z_-|<=d.
After normalization, therefore,

    W_infinity(beta_+,beta_-) <= 3/50 < 1/10.

Finite remote-source consequence.  Fix lambda<1/2 and discard equal beta
mass epsilon from both quantile tails so the retained mass is still above
lambda.  On that compact quantile range, partition finely enough that every
beta cell for either sign has diameter a<1/50.  Pair corresponding cells for
opposite signs and identical cells for equal signs.  Every resulting product
rectangle has separation at most

    3/50+2a < 1/10.

Uniform weighted-PNT convergence of the finitely many moving-prime cell
masses to their common beta masses gives, for all sufficiently remote sources
and all four sign combinations, more than lambda total mass after taking the
minimum of the two finite-source masses in every paired cell.  Scale the two
restrictions to that minimum, couple by their normalized product, sum the
disjoint cells, and thin by the Borel factor lambda divided by the selected
total.  This gives an exact Borel rate-lambda subcoupling into one fixed
compact subset of ``|u-v|<1/10``.  The same argument works with any target
diameter D>3/50 by taking ``a<(D-3/50)/2``.  This consequence uses the
analytic W-infinity theorem above; it does not use a finite computation as a
substitute for PNT uniformity.

No sampled CDF, numerical inversion, PNT estimate, or zero information is
used in the W-infinity conclusion itself.

Reproduce with

    PYTHONPATH=/tmp/pvdeps python3 -u \
      scripts/coupling_beta_quantile_transport_certificate.py
"""

from __future__ import annotations

from flint import arb, ctx


ctx.prec = 200


def q(numerator: int, denominator: int = 1) -> arb:
    return arb(numerator) / denominator


PI = arb.pi()
D = q(3, 50)
COMPACT_RIGHT = arb(1)
COMPACT_CELLS = 4096
PADDED_LEFT = -q(1, 1000)
PADDED_RIGHT = q(1001, 1000)


def interval(left: arb, right: arb) -> arb:
    assert right > left
    return arb((left + right) / 2, (right - left) / 2 + arb("1e-65"))


# On [-.001,1.001], every omitted n>=5 theta term and its first two
# derivatives is bounded by the same Gaussian majorants used in the audited
# kernel certificates.  Put y=pi*n^2*exp(2t)>3n^2.  Then the respective
# bounds are 20n^4e^(-3n^2), 125n^6e^(-3n^2), and
# 1000n^8e^(-3n^2).
assert (2 * PADDED_LEFT).exp() > q(99, 100)
assert PI * q(99, 100) > 3
TAIL_BOUNDS = []
for power, factor in ((4, 20), (6, 125), (8, 1000)):
    first = factor * arb(5) ** power * (-arb(3) * 25).exp()
    ratio = q(6, 5) ** power * (-arb(3) * 11).exp()
    assert ratio < 1
    TAIL_BOUNDS.append(first / (1 - ratio))

assert TAIL_BOUNDS[0] < arb("1e-28")
assert TAIL_BOUNDS[1] < arb("1e-26")
assert TAIL_BOUNDS[2] < arb("1e-23")


def theta_triplet(t: arb) -> tuple[arb, arb, arb]:
    assert t > PADDED_LEFT and t < PADDED_RIGHT
    k_sum = arb(0)
    kp_sum = arb(0)
    kpp_sum = arb(0)
    for n in range(1, 5):
        nn = arb(n * n)
        v = PI * nn * (2 * t).exp()
        term = PI * nn * (q(5, 2) * t).exp() * (2 * v - 3) * (-v).exp()
        log_derivative = q(5, 2) + 4 * v / (2 * v - 3) - 2 * v
        minus_log_derivative_prime = 4 * v + 24 * v / (2 * v - 3) ** 2
        k_sum += term
        kp_sum += term * log_derivative
        kpp_sum += term * (
            log_derivative**2 - minus_log_derivative_prime
        )
    return (
        k_sum + arb(0, TAIL_BOUNDS[0].upper()),
        kp_sum + arb(0, TAIL_BOUNDS[1].upper()),
        kpp_sum + arb(0, TAIL_BOUNDS[2].upper()),
    )


def compact_u_prime_certificate() -> arb:
    width = COMPACT_RIGHT / COMPACT_CELLS
    minimum = None
    for index in range(COMPACT_CELLS):
        t = interval(index * width, (index + 1) * width)
        k, kp, kpp = theta_triplet(t)
        u_prime = (kp / k) ** 2 - kpp / k
        assert u_prime > 18
        if minimum is None or u_prime.lower() < minimum:
            minimum = u_prime.lower()
    assert minimum is not None
    return minimum


def analytic_tail_u_prime_certificate() -> tuple[arb, arb, arb]:
    """Prove U'>18 for t>=1 by dominance of the first theta term."""
    # Write v=pi*exp(2t), k_n for the nth theta term, l_n=(log k_n)',
    # and m_n=-l_n'.  With theta weights w_n,
    #
    # U'=E[m_n]-Var(l_n)
    #    >=m_1/(1+r)-sum_(n>=2)(k_n/k_1)(l_n-l_1)^2,
    #
    # where r=sum_(n>=2)k_n/k_1.  For v>=v0=pi*e^2,
    #
    # k_n/k_1 <= 2n^4 exp(-(n^2-1)v),
    # |l_n-l_1| <= 3n^2 v.
    #
    # Both resulting majorants decrease after their n=2 first term and as
    # v increases, whereas m_1>4v increases.  It is enough to evaluate v0.
    v0 = PI * arb(2).exp()
    assert 2 * v0 / (2 * v0 - 3) < 2
    # The two fractional terms in l_n-l_1 contribute less than eight;
    # 8<4v0<=n^2v for n>=2, yielding the displayed 3n^2v bound.
    assert 8 < 4 * v0

    r_first = 2 * arb(2) ** 4 * (-3 * v0).exp()
    r_ratio = q(3, 2) ** 4 * (-5 * v0).exp()
    assert r_ratio < 1
    r_upper = r_first / (1 - r_ratio)

    variance_first = 18 * arb(2) ** 8 * v0**2 * (-3 * v0).exp()
    variance_ratio = q(3, 2) ** 8 * (-5 * v0).exp()
    assert variance_ratio < 1
    variance_upper = variance_first / (1 - variance_ratio)

    lower = 4 * v0 / (1 + r_upper) - variance_upper
    assert lower > 18
    return lower.lower(), r_upper.upper(), variance_upper.upper()


def main() -> None:
    compact_lower = compact_u_prime_certificate()
    tail_lower, relative_tail, variance_error = (
        analytic_tail_u_prime_certificate()
    )
    derivative_margin = 18 * D - 1
    assert derivative_margin > 0
    print("precision_bits:", ctx.prec)
    print("compact_interval:", (arb(0), COMPACT_RIGHT))
    print("compact_cells:", COMPACT_CELLS)
    print("compact_minimum_Uprime:", compact_lower)
    print("analytic_tail_Uprime_lower:", tail_lower)
    print("tail_relative_theta_bound_at_t=1:", relative_tail)
    print("tail_variance_error_at_t=1:", variance_error)
    print("transport_distance:", D)
    print("strict_R_derivative_margin:", derivative_margin)
    print("certified_W_infinity_bound: 3/50 < 1/10")
    print("certificate: PASS")


if __name__ == "__main__":
    main()
