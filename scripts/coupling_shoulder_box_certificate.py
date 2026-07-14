#!/usr/bin/env python3
"""Arb certificate for a midpoint--separation shoulder transition.

This is a finite local certificate for the compact-pair coupling mechanism
in continuation item 154.  For

    x in [7999/10000,8001/10000],
    y in [9999/10000,10001/10000],

write

    a_x(z) = J(|x-z|) K(z) / C(x),
    p_q(x) = Lambda(q) q^(-1/2) K(x-log(q)) / C(x).

The script certifies an exactly marginal-preserving allocation, using only
the inward q=2,3,4 prime jumps, two disjoint residual archimedean slices, and
an unpaired common slice.  Its total transition rate is greater than 1/2.
Every selected transition either coalesces or lands in

    |(u+v)/2| < 71/100,   |u-v| < 7/10.

The allocation is described in ``main`` below.  The unselected Levy mass is
left for the same-level part of the coupling; no finite-rate interpretation
of the infinite archimedean residual is made here.

Reproduction:

    python3 -m pip install --target /tmp/pvdeps python-flint
    PYTHONPATH=/tmp/pvdeps python3 \
      scripts/coupling_shoulder_box_certificate.py
"""

from flint import arb, ctx


ctx.prec = 180


def q(p: int, d: int = 1) -> arb:
    return arb(p) / d


PI = arb.pi()
LOG2 = arb(2).log()
LOG3 = arb(3).log()
LOG4 = arb(4).log()

X = arb(q(4, 5), q(1, 10_000))
Y = arb(1, q(1, 10_000))


def C(x: arb) -> arb:
    return (x / 2).cosh()


def J(h: arb) -> arb:
    assert h > 0
    return (-h / 2).exp() / (1 - (-2 * h).exp())


# For n >= 5 and t >= 0, the n-th positive-branch theta summand is at most
# 20 n^4 exp(-3 n^2).  This is the same uniform tail used by the independent
# direct-clock certificate.
first_tail = 20 * arb(5) ** 4 * (-arb(3) * 25).exp()
tail_ratio = (arb(6) / 5) ** 4 * (-arb(3) * 11).exp()
theta_tail_bound = first_tail / (1 - tail_ratio)
assert theta_tail_bound < arb("1e-28")
K_TAIL = arb(0, "1e-28")


def K_positive(t: arb) -> arb:
    """Riemann kernel enclosure for an interval contained in [0,1.1]."""
    assert t >= 0
    assert t < q(11, 10)
    total = arb(0)
    for n in range(1, 5):
        nn = arb(n * n)
        w = PI * nn * (2 * t).exp()
        total += PI * nn * (q(5, 2) * t).exp() * (2 * w - 3) * (-w).exp()
    return total + K_TAIL


def interval(left: arb, right: arb) -> arb:
    assert right > left
    return arb((left + right) / 2, (right - left) / 2 + arb("1e-50"))


ZERO_GAP = q(1, 100_000_000)


def integrate_lower(left: arb, right: arb, pieces: int, integrand) -> arb:
    # On each cell, the certified lower endpoint is itself a constant
    # selected density.  Hence the returned lower sum is constructive: it
    # defines a measurable submeasure dominated cell by cell by the stated
    # common or residual marginal, rather than merely estimating an integral.
    width = (right - left) / pieces
    total = arb(0)
    for index in range(pieces):
        lo = left + index * width
        z = interval(lo, lo + width)
        value = integrand(z)
        lower = value.lower()
        if lower > 0:
            total += lower * width
    return total


def K_even_on_signed_cell(z: arb, negative: bool) -> arb:
    return K_positive(-z if negative else z)


def common_piece(z: arb, negative: bool) -> arb:
    # The common integral is restricted to z in [-1,7/10], safely below
    # both source boxes.  Factor K before taking the pointwise minimum.
    k = K_even_on_signed_cell(z, negative)
    bx = J(X - z) / C(X)
    by = J(Y - z) / C(Y)
    return k * min(bx.lower(), by.lower())


def x_residual_piece(z: arb, negative: bool) -> arb:
    # On both certified residual slices a_x-a_y is positive.  Factoring K
    # avoids dependency loss from subtracting two separately enclosed K's.
    k = K_even_on_signed_cell(z, negative)
    return k * (J(X - z) / C(X) - J(Y - z) / C(Y))


def inward_rate(source: arb, logq: arb, mangoldt: arb, sqrtq: arb) -> arb:
    argument = source - logq
    # Every argument used below has a fixed sign over its source box.
    if argument < 0:
        kval = K_positive(-argument)
    else:
        assert argument > 0
        kval = K_positive(argument)
    return mangoldt / sqrtq * kval / C(source)


def rate_sum_range(source_box: arb, terms, pieces: int = 2048):
    """Rigorous range of a correlated sum of inward prime rates."""
    left = source_box.lower()
    right = source_box.upper()
    width = (right - left) / pieces
    global_lower = None
    global_upper = None
    for index in range(pieces):
        lo = left + index * width
        source = interval(lo, lo + width)
        value = arb(0)
        for logq, mangoldt, sqrtq in terms:
            value += inward_rate(source, logq, mangoldt, sqrtq)
        lower = value.lower()
        upper = value.upper()
        if global_lower is None or lower < global_lower:
            global_lower = lower
        if global_upper is None or upper > global_upper:
            global_upper = upper
    assert global_lower is not None and global_upper is not None
    return global_lower, global_upper


def main() -> None:
    # A rigorously lower-bounded common-target archimedean clock.  The
    # integral is split at zero so that evenness of K is used without taking
    # an interval absolute value across the origin.
    common_lower = integrate_lower(-arb(1), -ZERO_GAP, 32768,
                                   lambda z: common_piece(z, True))
    common_lower += integrate_lower(ZERO_GAP, q(7, 10), 32768,
                                    lambda z: common_piece(z, False))

    # Two disjoint residual a_x-a_y slices.  S4 supplies the unmatched y-q4
    # atom and S3 supplies the unmatched y-q3 atom.  Both are separated from
    # x and y, so they are honest finite submeasures of the infinite Levy
    # kernel.  Their rational endpoints also force the paired destinations
    # into the target midpoint--separation box checked below.
    residual_s4_lower = integrate_lower(-q(1033, 1000), -ZERO_GAP, 32768,
                                        lambda z: x_residual_piece(z, True))
    residual_s4_lower += integrate_lower(ZERO_GAP, q(161, 1000), 8192,
                                         lambda z: x_residual_piece(z, False))
    residual_s3_lower = integrate_lower(q(161, 1000), q(451, 1000), 24576,
                                        lambda z: x_residual_piece(z, False))

    # On U, replace the selected common event by two single-coordinate
    # events of the same cellwise constant density.  One has the same rate as
    # the old common event; the other is an additional selected clock.  The
    # interval lies below both source boxes, so each single jump has finite
    # rate and enters the target box.
    common_slice_lower = integrate_lower(q(301, 1000), q(419, 1000), 16384,
                                         lambda z: common_piece(z, False))

    term2 = ((LOG2, LOG2, arb(2).sqrt()),)
    term3 = ((LOG3, LOG3, arb(3).sqrt()),)
    term4 = ((LOG4, LOG2, arb(2)),)
    term23 = term2 + term3
    term234 = term23 + term4

    x2_lower, x2_upper = rate_sum_range(X, term2)
    y2_lower, y2_upper = rate_sum_range(Y, term2)
    x3_lower, x3_upper = rate_sum_range(X, term3)
    y3_lower, y3_upper = rate_sum_range(Y, term3)
    x4_lower, x4_upper = rate_sum_range(X, term4)
    y4_lower, y4_upper = rate_sum_range(Y, term4)
    x23_lower, x23_upper = rate_sum_range(X, term23)
    y23_lower, y23_upper = rate_sum_range(Y, term23)
    y234_lower, y234_upper = rate_sum_range(Y, term234)

    d2_lower = x2_lower - y2_upper
    d2_upper = x2_upper - y2_lower
    d3_lower = y3_lower - x3_upper
    d3_upper = y3_upper - x3_lower
    # (p3y-p3x)-(p2x-p2y) = (p2y+p3y)-(p2x+p3x).
    unmatched_q3_lower = y23_lower - x23_upper
    unmatched_q3_upper = y23_upper - x23_lower
    d4_lower = y4_lower - x4_upper
    d4_upper = y4_upper - x4_lower

    assert d2_lower > 0
    assert d3_lower > d2_upper
    assert unmatched_q3_lower > 0
    assert d4_lower > 0
    # Since the residual slices are nonatomic, these inequalities construct
    # measurable cellwise-fractional submeasures of exactly the two required
    # unmatched prime masses.
    assert residual_s3_lower > unmatched_q3_upper
    assert residual_s4_lower > d4_upper

    # Selected disjoint progress clocks:
    #   common arch target                                      common_lower
    #   synchronous q2                                          p2y
    #   synchronous q3                                          p3x
    #   x-q2 excess paired with y-q3 excess                     d2
    #   remaining y-q3 paired with residual arch S3             d3-d2
    #   synchronous q4                                          p4x
    #   remaining y-q4 paired with residual arch S4             d4
    #   extra single event from unpairing U                      common_slice
    # The q2/q3 terms simplify to p2y+p3y, and the q4 terms to p4y.
    # Lower endpoints are deliberately combined only after independent
    # interval evaluation.
    progress_lower = (
        common_lower
        + common_slice_lower
        + y234_lower
    )
    assert progress_lower > q(1, 2)

    # Every selected noncoalescent target has midpoint in the lower phase.
    cutoff = q(71, 100)
    midpoint = (X + Y) / 2
    assert abs(midpoint - LOG2) < cutoff                 # synchronous q2
    assert abs(midpoint - LOG3) < cutoff                 # synchronous q3
    assert abs(midpoint - (LOG2 + LOG3) / 2) < cutoff    # q2--q3 pair
    s3 = interval(q(161, 1000), q(451, 1000))
    s4 = interval(-q(1033, 1000), q(161, 1000))
    u = interval(q(301, 1000), q(419, 1000))
    t3 = Y - LOG3
    t4 = Y - LOG4
    assert abs((s3 + t3) / 2) < cutoff                  # q3--arch pair
    assert abs((s4 + t4) / 2) < cutoff                  # q4--arch pair
    assert abs((u + Y) / 2) < cutoff                    # x-arch single
    assert abs((X + u) / 2) < cutoff                    # y-arch single

    separation_cutoff = q(7, 10)
    assert abs((X - LOG2) - (Y - LOG2)) < separation_cutoff
    assert abs((X - LOG3) - (Y - LOG3)) < separation_cutoff
    assert abs((X - LOG2) - (Y - LOG3)) < separation_cutoff
    assert abs((X - LOG4) - (Y - LOG4)) < separation_cutoff
    assert abs(s3 - t3) < separation_cutoff
    assert abs(s4 - t4) < separation_cutoff
    assert abs(u - Y) < separation_cutoff
    assert abs(X - u) < separation_cutoff

    print("precision_bits:", ctx.prec)
    print("theta_tail_bound:", theta_tail_bound)
    print("source_x_box:", X)
    print("source_y_box:", Y)
    print("common_arch_lower:", common_lower)
    print("residual_s3_lower:", residual_s3_lower)
    print("residual_s4_lower:", residual_s4_lower)
    print("unpaired_common_slice_lower:", common_slice_lower)
    print("p2x_range:", x2_lower, x2_upper)
    print("p2y_range:", y2_lower, y2_upper)
    print("p3x_range:", x3_lower, x3_upper)
    print("p3y_range:", y3_lower, y3_upper)
    print("p4x_range:", x4_lower, x4_upper)
    print("p4y_range:", y4_lower, y4_upper)
    print("q2_excess_range:", d2_lower, d2_upper)
    print("q3_excess_range:", d3_lower, d3_upper)
    print("unmatched_q3_range:", unmatched_q3_lower, unmatched_q3_upper)
    print("q4_excess_range:", d4_lower, d4_upper)
    print("p2y_p3y_p4y_range:", y234_lower, y234_upper)
    print("progress_rate_lower:", progress_lower)
    print("threshold:", q(1, 2))
    print("certificate: PASS")


if __name__ == "__main__":
    main()
