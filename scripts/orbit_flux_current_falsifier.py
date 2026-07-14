#!/usr/bin/env python3
"""Rigorous finite checks for the Gaussian orbit-flux construction.

The continuation-state proof derives the exact positive channel amplitudes

    j_{m,q}(x) = pi Lambda(q) m^2 exp(-5x/2)
                 exp(-pi m^2 exp(-2x)).

This script certifies one finite claim with Arb intervals.  The literal
lowest-arch-mode rank-one allocation already exceeds the
   complete physical archimedean conductance at x=3, y=3+log(2), using only
   the single channel (m,q)=(16,2).  The theta-series tails are bounded
   analytically, so no truncation or floating-point inference is used.

Run with:

    PYTHONPATH=/tmp/pvdeps \
      python3 scripts/orbit_flux_current_falsifier.py
"""

from flint import arb, ctx


ctx.prec = 220


def rat(p: int, q: int = 1) -> arb:
    return arb(p) / q


PI = arb.pi()
LOG2 = arb(2).log()


def theta_term(x: arb, n: int = 1) -> arb:
    y = PI * n * n * (2 * x).exp()
    return (
        PI
        * n
        * n
        * (rat(5, 2) * x).exp()
        * (2 * y - 3)
        * (-y).exp()
    )


def theta_upper(x: arb) -> arb:
    """Upper bound K(x) for x>=3 using the n=1 term and a proved tail."""
    assert x >= 3
    y = PI * (2 * x).exp()
    # For n>=2, 2*pi*n^2*exp(2x)-3 < 2*pi*n^2*exp(2x),
    # n^4 <= exp(n^2), and (n+1)^2-n^2 >= 5.  Hence
    # sum_{n>=2} n^4 exp(-y*n^2)
    #   <= exp(-4(y-1))/(1-exp(-5(y-1))).
    tail = (
        2
        * PI**2
        * (rat(9, 2) * x).exp()
        * (-4 * (y - 1)).exp()
        / (1 - (-5 * (y - 1)).exp())
    )
    return theta_term(x) + tail


def channel_j(x: arb, m: int, log_q: arb) -> arb:
    return (
        PI
        * log_q
        * m
        * m
        * (-rat(5, 2) * x).exp()
        * (-PI * m * m * (-2 * x).exp()).exp()
    )


# Literal alpha=1/2 orthogonal-Gram congestion gate.  Its rank-one channel
# conductance is exp(-h/2)j(x)j(x+h).  The complete physical arch conductance
# is J(h)K(x)K(x+h), with J(h)=exp(-h/2)/(1-exp(-2h)).
x = arb(3)
h = LOG2
m = 16
j_left = channel_j(x, m, LOG2)
j_right = channel_j(x + h, m, LOG2)
flux_conductance = (-h / 2).exp() * j_left * j_right
physical_j = (-h / 2).exp() / (1 - (-2 * h).exp())
physical_arch_upper = physical_j * theta_upper(x) * theta_upper(x + h)
assert flux_conductance > physical_arch_upper


print("single-channel flux conductance lower enclosure:", flux_conductance)
print("full physical arch conductance upper enclosure:", physical_arch_upper)
