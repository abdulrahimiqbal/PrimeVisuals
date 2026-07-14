#!/usr/bin/env python3
"""Exact transport of the positive tail law through a one-core anchor.

Let

    beta_+(dz) = 2 exp(-z/2) K(z) dz

and let the archimedean part of the jump measure from an anchor x be

    a_x(du) = K(u) J(|u-x|) / cosh(x/2) du,
    J(h) = exp(-h/2) / (1-exp(-2h)).

This certificate proves, simultaneously for every |x| <= 3/5, that all of
beta_+ outside the open unit ball about x can be transported into a_x by
the two translations

    z=x+w  -> u=x+w-d,       z=x-w -> u=x-w+d,
    d=99/100, w>=1.

Both translations have Jacobian one and |u-z|=d<1.  The pointwise statement
certified below is therefore

    K(u) J(w-d) / cosh(x/2) >= 2 exp(-z/2) K(z).       (1)

Inside |z-x|<1 no anchor mass is needed: the beta jump is used as an
outer-coordinate single jump.  Consequently (1) gives a marginal-admissible
hard-entry coupling of the complete mass-1/2 law beta_+ into |u-z|<1.

The compact rectangle |x|<=3/5, 1<=w<=4 is covered by rational Arb boxes.
For w>=4, both |z| and |u| are on the same side of zero.  A one-term theta
lower bound for K(|z|-d), a geometric theta upper bound for K(|z|), and
J(h)>=exp(-h/2) prove an explicit analytic lower bound greater than one.

Finite-y transfer (analytic consequence, not a finite-height inference).
For s>0 put

    P_s = sum_q Lambda(q) q^(-1/2) K(s-log(q))/cosh(s/2)
                    delta_(s-log(q)),

where q ranges over prime powers.  The ordinary PNT psi(T)~T gives, uniformly
for intervals whose endpoints range over a fixed compact set,

    P_s(I) -> beta_+(I).                              (2)

Indeed, for r=q/exp(s), the distribution functions of
``exp(-s)dpsi(exp(s)r)`` converge uniformly to dr on every compact subinterval
of (0,infinity).  The remaining continuous weight is
``r^(-1/2)K(-log r)``, and ``exp(s/2)/cosh(s/2)->2``.  Changing back by
r=exp(-z) gives exactly ``2exp(-z/2)K(z)dz``.  This proves (2), including the
stated uniformity, without an RH-strength PNT error term.

Here is the measurable allocation needed to transfer the limiting transport.
Fix lambda<1/2.  Choose W<infinity and eta>0 so small that, uniformly in
|x|<=3/5, beta_+ gives mass >lambda to

    E_x={|z-x|<=1-eta} union {1+eta<=|z-x|<W}.

This is possible by tightness and the bounded continuous beta density.  Split
each of the two exterior w=z-x intervals into finitely many half-open bins I
of width h<1-d, choosing W at a bin endpoint.  Translate a right bin by -d
and a left bin by +d, calling its image U.  The certified strict reserve in
(1), and change of variables, give

    a_x(U) >= R_* beta_+(I),       R_*=101/100.        (3)

Use half-open bins throughout, assigning every shared endpoint to exactly one
neighbour; in particular the final endpoint W is excluded consistently from
both E_x and its last bin.  The bins U are disjoint and every point of I times
U has separation at most d+h<1.  Uniform (2), and the positive minimum beta
mass of the finitely many moving bins, give one S such that
P_s(I)<=R_*beta_+(I) for all s>=S, all anchors, and all exterior bins.  They
also give P_s(E_x)>lambda.  Excluding finitely many endpoints does not change
the beta inequalities, while using the same convention for P_s prevents an
unnamed boundary atom from entering the displayed total.

For each exterior bin take the anchor submeasure

    alpha_I = P_s(I) a_x|U / a_x(U)

and couple it to P_s|I by the normalized product.  Use P_s on the interior
interval as outer-coordinate single jumps.  All anchor projections are
dominated because the U are disjoint; the outer projection is the restriction
of P_s.  Thin the resulting kernel by lambda/P_s(E_x).  It is then an exact
rate-lambda subcoupling into separation <1.  Moving half-open intervals,
locally finite prime sums, continuous moving-interval integrals, and the
displayed ratios are Borel, so this is a measurable state-dependent kernel.
Reflection gives the negative outer tail.  Thus for every lambda<1/2 the
limiting certificate yields a genuine finite-state tail policy, rather than
assuming convergence at a sampled height.

Reproduce with

    PYTHONPATH=/tmp/pvdeps python3 -u \
      scripts/coupling_anchor_beta_transport_certificate.py
"""

from __future__ import annotations

from flint import arb, ctx


ctx.prec = 200


def q(numerator: int, denominator: int = 1) -> arb:
    return arb(numerator) / denominator


def interval(left: arb, right: arb) -> arb:
    assert right > left
    return arb((left + right) / 2, (right - left) / 2 + arb("1e-65"))


PI = arb.pi()
D = q(99, 100)
R_STAR = q(101, 100)
X_LEFT = -q(3, 5)
X_RIGHT = q(3, 5)
W_TAIL = arb(4)
X_CELLS = 120

# Fine boxes surround the numerical minimizer w=1.0313.  Widths can become
# larger once the theta quotient has acquired a wide positive reserve.
W_BLOCKS = (
    (q(1), q(11, 10), 200),
    (q(11, 10), q(13, 10), 100),
    (q(13, 10), q(8, 5), 60),
    (q(8, 5), q(2), 40),
    (q(2), q(3), 40),
    (q(3), q(4), 20),
)


def certify_kernel_monotonicity_constants() -> tuple[arb, arb]:
    """Certify the only numerical inequalities in the proof K'(t)<0."""
    # For v=pi*n^2*exp(2t), differentiation gives
    #
    # K_n' = pi*n^2 exp(5t/2-v) Q(v),
    # Q(v)=-4v^2+15v-15/2,
    #
    # and K_n'' has the same positive prefactor times
    # R(v)=8v^3-56v^2+165v/2-75/4.  Let v_* be the larger root of Q.
    # On 0<=t<=t_*=(1/2)log(v_*/pi), R is decreasing for n=1,
    # while its positive prefactor is bounded below by its t_* value.
    root = (15 + arb(105).sqrt()) / 8
    t_star = (root / PI).log() / 2
    assert root > PI and t_star > 0

    def r_polynomial(v: arb) -> arb:
        return 8 * v**3 - 56 * v**2 + q(165, 2) * v - q(75, 4)

    r_prime_at_left = 24 * PI**2 - 112 * PI + q(165, 2)
    r_prime_at_right = 24 * root**2 - 112 * root + q(165, 2)
    # R''=48v-112>0 here, so R' is increasing; its right endpoint is
    # nevertheless negative.
    assert 48 * PI - 112 > 0
    assert r_prime_at_left < 0 and r_prime_at_right < 0
    prefactor_lower = PI * (q(5, 2) * t_star - root).exp()
    n1_upper = prefactor_lower * r_polynomial(PI)
    assert n1_upper < -8

    # For every n>=2 and the same short t interval, the triangle bound
    # |R(v)|<=13v^3 holds because v>=4pi and the three residual ratios
    # sum to less than five.  Also exp(-v)<=exp(-pi*n^2).
    v2 = 4 * PI
    assert 56 / v2 + q(165, 2) / v2**2 + q(75, 4) / v2**3 < 5
    first = (
        13 * (q(17, 2) * t_star).exp() * v2**4 * (-v2).exp()
    )
    ratio = q(3, 2) ** 8 * (-5 * PI).exp()
    assert ratio < 1
    n_ge_2_upper = first / (1 - ratio)
    assert n_ge_2_upper < 2
    assert n1_upper + n_ge_2_upper < 0

    # Hence K''<0 on (0,t_*).  The exact Jacobi theta transformation makes
    # the Riemann kernel even and C^1, so K'(0)=0.  For t>=t_* one has
    # v>=v_* for n=1 (and still more for n>=2), hence Q(v)<=0 termwise.
    # This completes the non-sampled proof that K is strictly decreasing.
    return n1_upper.upper(), n_ge_2_upper.upper()


def nonnegative_absolute_enclosure(value: arb) -> arb:
    """Return an interval enclosing |value| and contained in [0,infinity)."""
    if value >= 0:
        return value
    if value <= 0:
        return -value
    radius = max(abs(value.lower()), abs(value.upper()))
    return interval(arb(0), arb(radius))


def theta_term(n: int, t: arb) -> arb:
    """The nth positive theta term defining K(t), for t>=0."""
    nn = arb(n * n)
    v = PI * nn * (2 * t).exp()
    return PI * nn * (q(5, 2) * t).exp() * (2 * v - 3) * (-v).exp()


def theta_tail_upper(t: arb) -> arb:
    """Upper bound for the sum of theta terms n>=5 on a t interval."""
    assert t >= 0
    t_lower = arb(t.lower())
    a = PI * (2 * t_lower).exp()
    # term_n <= 2*pi^2*n^4*exp(9t/2)*exp(-a*n^2).  For n>=5,
    # consecutive majorants have ratio at most
    # (6/5)^4 exp(-11a).
    first = (
        2 * PI**2 * arb(5) ** 4 * (q(9, 2) * t_lower).exp()
        * (-25 * a).exp()
    )
    ratio = q(6, 5) ** 4 * (-11 * a).exp()
    assert ratio < 1
    return (first / (1 - ratio)).upper()


def kernel_bounds(argument: arb) -> tuple[arb, arb]:
    """Rigorous positive lower and upper bounds for the even kernel K."""
    t = nonnegative_absolute_enclosure(argument)
    # K is strictly decreasing on [0,infinity).  This follows directly from
    # the differentiated theta series: beyond the larger root of
    # -4v^2+15v-15/2 every summand derivative is negative; below it the
    # n=1 second derivative is <-7.9 while the n>=2 absolute sum is <.82,
    # and K'(0)=0.  Endpoint evaluation avoids interval dependency in the
    # double-exponential tail.
    t_lower = arb(t.lower())
    if t_lower < 0:
        t_lower = arb(0)
    t_upper = arb(t.upper())
    partial_lower = sum(
        (theta_term(n, t_upper) for n in range(1, 5)), arb(0)
    )
    partial_upper = sum(
        (theta_term(n, t_lower) for n in range(1, 5)), arb(0)
    )
    lower = arb(partial_lower.lower())
    upper = arb(partial_upper.upper()) + theta_tail_upper(t_lower)
    assert lower > 0
    return lower, upper


def levy_shape(h: arb) -> arb:
    assert h > 0
    return (-h / 2).exp() / (1 - (-2 * h).exp())


def compact_ratio_lower(x: arb, w: arb, sign: int) -> arb:
    """Cellwise lower bound for the left (-1) or right (+1) ratio in (1)."""
    assert sign in (-1, 1)
    z = x + sign * w
    u = x + sign * (w - D)
    h = w - D
    k_u_lower, _k_u_upper = kernel_bounds(u)
    _k_z_lower, k_z_upper = kernel_bounds(z)
    numerator = k_u_lower * arb(levy_shape(h).lower())
    denominator = (
        2 * arb((x / 2).cosh().upper())
        * arb((-z / 2).exp().upper()) * k_z_upper
    )
    return (numerator / denominator).lower()


def compact_certificate() -> tuple[arb, tuple[int, int, int, arb, arb, int]]:
    x_width = (X_RIGHT - X_LEFT) / X_CELLS
    worst = None
    worst_cell = None
    cell_count = 0
    for i in range(X_CELLS):
        x_left = X_LEFT + i * x_width
        x = interval(x_left, x_left + x_width)
        for block_index, (w_left, w_right, cells) in enumerate(W_BLOCKS):
            w_width = (w_right - w_left) / cells
            for j in range(cells):
                lo = w_left + j * w_width
                w = interval(lo, lo + w_width)
                for sign in (-1, 1):
                    ratio = compact_ratio_lower(x, w, sign)
                    assert ratio > R_STAR
                    cell_count += 1
                    if worst is None or ratio < worst:
                        worst = ratio
                        worst_cell = (i, block_index, j, x, w, sign)
    assert worst is not None and worst_cell is not None
    return worst, worst_cell


def analytic_tail_certificate() -> arb:
    """Common lower bound for both translations when w>=4."""
    # Put t=|z|.  Since |x|<=3/5 and w>=4, t>=17/5 and
    # |u|=t-d.  With A=pi*exp(2t),
    #
    # K(t-d) >= pi^2 exp(9(t-d)/2) exp(-A exp(-2d)),
    # K(t) <= 2 pi^2 exp(9t/2) exp(-A)/(1-16exp(-3A)).
    #
    # The first inequality uses 2v-3>=v; the second sums the n^4
    # majorants geometrically.  The left translation is smaller after the
    # exp(z/2) factor.  Using J(h)>=exp(-h/2), C(x)<=cosh(3/10), and
    # 1-16exp(-3A)>=1/2 gives
    #
    # ratio >= exp(A(1-exp(-2d))-t-4d-3/10)/(8 cosh(3/10)).
    #
    # Its exponent is increasing for t>=17/5.
    t0 = q(17, 5)
    a0 = PI * (2 * t0).exp()
    assert a0 * (-2 * D).exp() > 3
    assert 16 * (-3 * a0).exp() < q(1, 2)
    assert 2 * a0 * (1 - (-2 * D).exp()) > 1
    exponent = (
        a0 * (1 - (-2 * D).exp()) - t0 - 4 * D - q(3, 10)
    )
    lower = exponent.exp() / (8 * q(3, 10).cosh())
    assert lower > R_STAR
    return lower.lower()


def main() -> None:
    monotone_n1, monotone_tail = certify_kernel_monotonicity_constants()
    compact_lower, worst_cell = compact_certificate()
    tail_lower = analytic_tail_certificate()
    total_cells = 2 * X_CELLS * sum(block[2] for block in W_BLOCKS)
    print("precision_bits:", ctx.prec)
    print("Ksecond_n1_upper_on_short_interval:", monotone_n1)
    print("Ksecond_n_ge_2_abs_upper:", monotone_tail)
    print("translation_distance:", D)
    print("anchor_interval:", (X_LEFT, X_RIGHT))
    print("compact_w_interval:", (arb(1), W_TAIL))
    print("certified_compact_cells:", total_cells)
    print(
        "worst_cell_(x_index,block_index,w_index,x_box,w_box,sign):",
        worst_cell,
    )
    print("compact_minimum_density_ratio:", compact_lower)
    print("analytic_tail_ratio_lower:", tail_lower)
    print("uniform_rational_reserve:", R_STAR)
    print("transported_beta_mass:", q(1, 2))
    print("target_separation:", D)
    print("certificate: PASS")


if __name__ == "__main__":
    main()
