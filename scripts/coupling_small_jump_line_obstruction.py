#!/usr/bin/env python3
"""Exact coefficient check for the synchronous/reflection small-jump obstruction.

For the archimedean jump kernel, written in increment coordinates,

    nu_x(h) = K(x+h) J(|h|) / C(x),

one has

    nu_x(h) = A(x)/(2|h|) + O(1),   A(x)=K(x)/C(x).

If the infinite part of a two-coordinate Levy coupling is supported on the
two lines k=h and k=-h, its two projections have identical logarithmic
annulus mass, since |k|=|h| on both lines.  Consequently the remainder can
have finite total rate only if A(x)=A(y).  This script certifies that this
necessary condition fails uniformly on the shoulder box

    x in [0.7999,0.8001],  y in [0.9999,1.0001].

The analytic no-go argument is independent of the computation; the Arb
calculation is an exact witness that its hypothesis A(x) != A(y) holds on a
whole rational box.

Reproduction:

    python3 -m pip install --target /tmp/pvdeps python-flint
    PYTHONPATH=/tmp/pvdeps python3 \
      scripts/coupling_small_jump_line_obstruction.py
"""

from flint import arb, ctx

from coupling_shoulder_box_certificate import C, K_positive, X, Y, q


ctx.prec = 180


def main() -> None:
    coefficient_x = K_positive(X) / C(X)
    coefficient_y = K_positive(Y) / C(Y)
    gap = coefficient_x - coefficient_y

    # This is far stronger than mere interval separation and leaves a simple
    # rational certificate that is stable under changes in display precision.
    assert gap > q(1, 10_000)

    print("precision_bits:", ctx.prec)
    print("source_x_box:", X)
    print("source_y_box:", Y)
    print("A_x_range:", coefficient_x)
    print("A_y_range:", coefficient_y)
    print("A_x_minus_A_y:", gap)
    print("rational_gap_threshold:", q(1, 10_000))
    print("certificate: PASS")


if __name__ == "__main__":
    main()
