#!/usr/bin/env python3
"""Exact geometry and threshold audit for the y>4 beta splice.

Item 208 supplies, uniformly for ``|x|<=3/5``, a Borel kernel Q_x from

    beta_+(dw)=2 exp(-w/2)K(w)dw

into the spatially reserved x-capacity, with support
``|w-u|<177/500``.  Let P_y be the physical inward-prime measure.  Ordinary
weighted PNT gives ``P_y(I)->beta_+(I)`` for every fixed half-open compact
interval I.

For any ``lambda<1/2`` choose W with ``beta_+([-W,W])>lambda`` and partition
that interval into finitely many half-open cells I_j of width at most
``29/200``.  Put

    p_j(y)=P_y(I_j), b_j=beta_+(I_j), c_j(y)=min(p_j(y),b_j),
    H(y)=sum_j c_j(y).

Then H(y) tends to ``beta_+([-W,W])``.  For all sufficiently large y,
``H(y)>lambda``.  On each cell the measure

    [c_j/(p_j b_j)] P_y|I_j tensor beta_+|I_j

(with the zero convention), followed by thinning by ``lambda/H(y)``, has
both projections dominated by the required marginals, total mass lambda,
and first-arrow displacement at most 29/200.  Disintegrating item 208 and
composing gives

    |r-u| < 29/200+177/500 = 499/1000 < 1/2.           (1)

All ingredients are Borel: P_y restricted to a compact cell is a locally
finite countable prime-power sum; minima, products and the finite sum H are
Borel.  Reflection gives the negative source half-line.  This proves an
exact remote hard clock at every subcritical lambda; no visual or finite
height inference is involved.

This audit also records why the existing explicit Dusart cutoff at y=15.7
does *not* by itself close the splice for every subcritical exponent.  The
quoted theorem applies to all prime endpoints of a symmetric target window
[-W,W] only if

    y-W >= log(3,594,641).

At y=15.7 the largest such W is
``W_*=15.7-log(3,594,641)=0.605045...``.  Exact positive-series integration
below gives

    beta_+([-W_*,W_*])
      =0.49844211216894... < 0.499.                    (2)

Thus the already recorded finite-cell PNT truncation, used without an
additional exact treatment of the cells below Dusart's threshold, cannot
even provide lambda=0.499 at y=15.7.  More generally W(lambda), and hence
the remote threshold S(lambda), diverges as lambda tends to 1/2.  Items 203
and 208 stop at y=4.  Therefore (1) leaves the exact finite band

    4 < y < S(lambda)                                  (3)

unproved.  Equation (2) is not a counterexample to a hybrid exact/Dusart
construction; it is a certificate that item 194's present remote corollary
does not bridge the finite band.  Closing (3) requires either full
finite-source interval-Hall control (the total-mass prerequisite is proved
separately in ``coupling_inward_prime_total_mass_tail_certificate.py``) or a
new direct high-mixed allocation.

Reproduce with

    PYTHONPATH=/tmp/pvdeps:scripts python3 -u \
      scripts/coupling_high_mixed_remote_splice_audit.py
"""

from flint import arb, ctx

import coupling_exact_arch_integral as exact_integral


ctx.prec = 180


def q(numerator: int, denominator: int = 1) -> arb:
    return arb(numerator) / denominator


FIRST_CELL_WIDTH = q(29, 200)
SECOND_RADIUS = q(177, 500)
TOTAL_RADIUS = FIRST_CELL_WIDTH + SECOND_RADIUS
DUSART_THRESHOLD = arb(3_594_641)
EXPLICIT_SOURCE = q(157, 10)
TARGET_RATE = q(499, 1000)


def beta_symmetric_mass(radius: arb) -> arb:
    # Six positive theta terms are integrated exactly in incomplete-gamma
    # form.  The omitted terms are positive; for the strict upper comparison
    # in main we also bound them by recomputing with eight terms and use the
    # standard n>=9 geometric majorant directly.
    partial = 2 * exact_integral.kernel_exponential_integral(
        -q(1, 2), -radius, radius, theta_terms=8
    )

    # On |z|<=radius<1, the beta density from theta term n is at most
    # 4*pi^2*n^4*exp(5*radius)*exp(-pi*exp(-2radius)*n^2).
    # For n>=9 the consecutive majorants have the displayed geometric ratio.
    assert radius < 1
    scale = arb.pi() * (-2 * radius).exp()
    n0 = arb(9)
    first = (
        4 * arb.pi() ** 2 * n0**4 * (5 * radius).exp()
        * (-scale * n0**2).exp()
    )
    ratio = q(10, 9) ** 4 * (-19 * scale).exp()
    assert ratio < 1
    density_tail = first / (1 - ratio)
    integral_tail = 2 * radius * density_tail
    return partial + arb(0, integral_tail.upper())


def main() -> None:
    assert TOTAL_RADIUS.contains(q(499, 1000))
    assert TOTAL_RADIUS < q(1, 2)

    maximum_dusart_window = EXPLICIT_SOURCE - DUSART_THRESHOLD.log()
    assert maximum_dusart_window > 0
    mass = beta_symmetric_mass(maximum_dusart_window)
    assert mass < TARGET_RATE
    shortfall = TARGET_RATE - mass

    print("precision_bits:", ctx.prec)
    print("first_cell_width:", FIRST_CELL_WIDTH)
    print("item208_second_radius:", SECOND_RADIUS)
    print("strict_composed_radius_bound:", TOTAL_RADIUS)
    print("Dusart_theta_threshold:", DUSART_THRESHOLD)
    print("source_y:", EXPLICIT_SOURCE)
    print("largest_symmetric_window_with_all_endpoints_in_Dusart_range:", maximum_dusart_window)
    print("beta_mass_in_that_window_upper:", mass)
    print("test_subcritical_rate:", TARGET_RATE)
    print("certified_shortfall_at_y=15.7:", shortfall)
    print("remote_subcritical_composition_geometry: PASS")
    print("fixed_15.7_Dusart_truncation_splice: INSUFFICIENT")
    print("unclosed_band: 4 < y < S(lambda)")


if __name__ == "__main__":
    main()
