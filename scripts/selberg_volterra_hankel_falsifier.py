#!/usr/bin/env python3
"""Rigorous {1,2,3,6} obstruction to a Selberg--Volterra Hilbert square.

For the cut-overlap operators in continuation item 238, put

    a_0(h) = integral_0^h K(x) K(h-x) dx.

Any Kolmogorov linearization of the convolution term having

    B_u^* B_v = A_(u+v)

would make ``h -> A_h`` Hankel-positive.  Compressing at the cut ``s=0``
and taking ``u=log(2)``, ``v=log(3)`` would therefore require

    a_0(log(4)) a_0(log(9)) - a_0(log(6))^2 >= 0.

This script proves the opposite inequality with Arb intervals.  It evaluates
the first four positive theta summands by validated complex integration.  On
``x>=0`` their sum is below one: with
``y=pi*n^2*exp(2x)``, each summand is bounded by
``2*(pi*n^2)^2*exp(-pi*n^2)``, since ``y^(9/4) exp(-y)`` decreases for
``y>=pi``.  The complete ``n>=5`` tail is bounded uniformly by the same
geometric majorant used in the coupling certificates.

Reproduce with

    PYTHONPATH=/tmp/pvdeps python3 -u \
      scripts/selberg_volterra_hankel_falsifier.py
"""

from flint import acb, arb, ctx


ctx.prec = 180


def q(numerator: int, denominator: int = 1) -> arb:
    return arb(numerator) / denominator


PI = arb.pi()

# Uniform n>=5 tail for K(x), x>=0.  Here pi>3 and the ratio of successive
# majorants is bounded by its n=5 value.
FIRST_TAIL = 20 * arb(5) ** 4 * (-arb(3) * 25).exp()
TAIL_RATIO = q(6, 5) ** 4 * (-arb(3) * 11).exp()
assert TAIL_RATIO < 1
THETA_TAIL = FIRST_TAIL / (1 - TAIL_RATIO)
assert THETA_TAIL < arb("1e-28")

# The elementary decreasing-envelope estimate in the docstring.
PARTIAL_BOUND = sum(
    2 * (PI * n * n) ** 2 * (-PI * n * n).exp()
    for n in range(1, 5)
)
assert PARTIAL_BOUND < 1


def theta_partial(z: acb) -> acb:
    """Entire continuation of the first four positive theta terms."""
    total = acb(0)
    for n in range(1, 5):
        nn = n * n
        y = acb(PI * nn) * (2 * z).exp()
        total += (
            acb(PI * nn)
            * (acb(5) * z / 2).exp()
            * (2 * y - 3)
            * (-y).exp()
        )
    return total


def overlap(length: arb) -> tuple[arb, arb]:
    """Return rigorous lower and upper bounds for a_0(length)."""
    ell = acb(length)

    def integrand(z: acb, analytic: bool) -> acb:
        del analytic
        return theta_partial(z) * theta_partial(ell - z)

    value = acb.integral(
        integrand,
        arb(0),
        length,
        abs_tol=arb("1e-65"),
        rel_tol=arb("1e-65"),
        eval_limit=200_000,
    )
    assert value.imag == 0

    # K=P+T with 0<=P<=PARTIAL_BOUND and 0<=T<=THETA_TAIL.
    error = length * (
        2 * PARTIAL_BOUND * THETA_TAIL + THETA_TAIL**2
    )
    lower = value.real.lower()
    upper = (value.real + error).upper()
    assert lower > 0
    return lower, upper


def main() -> None:
    a4_lo, a4_hi = overlap(arb(4).log())
    a6_lo, a6_hi = overlap(arb(6).log())
    a9_lo, a9_hi = overlap(arb(9).log())

    determinant_upper = a4_hi * a9_hi - a6_lo**2
    assert determinant_upper < 0

    print("a0(log 4) in", a4_lo, a4_hi)
    print("a0(log 6) in", a6_lo, a6_hi)
    print("a0(log 9) in", a9_lo, a9_hi)
    print("determinant upper bound", determinant_upper)
    print("CERTIFIED: the {1,2,3,6} Hankel block is indefinite")


if __name__ == "__main__":
    main()
