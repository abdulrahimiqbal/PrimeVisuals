#!/usr/bin/env python3
"""Exact Hall reduction and tail certificate for mixed anchor--beta pairs.

Put

    beta_sigma(dz) = 2 exp(-sigma*z/2) K(z) dz,  sigma in {+1,-1},

so that each beta law has mass M=1/2.  For an anchor x, let nu_x be its
physical jump measure and augment it by the free holding capacity
``M delta_x``.  For the closed relation

    R_D = {(z,u): |z-u| <= D},

the capacitated Hall--Strassen theorem says that a subcoupling of mass
lambda exists if and only if

    beta_sigma(A) <= (nu_x+M delta_x)(A^D) + M-lambda       (1)

for every closed A, where ``A^D={u:dist(u,A)<=D}``.  It is equivalent to
test compact A, by tightness and inner regularity.  Necessity follows by
projecting a proposed coupling.  Here is the finite-capacity reduction for
the only apparent complication: nu_x is sigma-finite, with infinite mass
in every neighbourhood of its archimedean singularity x.  On any finite
Borel partition replace a target-cell capacity kappa(B) by
``min(kappa(B),M)``; no flow of total mass at most M can distinguish the two.
Ordinary finite max flow therefore applies with finite capacities.  Refine
the partitions along compact exhaustions and let their mesh tend to zero.
The selected second marginals have mass at most M and are tight because the
first marginals are beta-dominated and the approximate support lies within
``D+o(1)``.  A weak limit is supported on the closed relation R_D.  For a
compact target set not containing x, local finiteness and outer regularity
pass marginal domination to the limit.  For a target set containing x, the
holding atom already has capacity M while the selected marginal has total
mass at most M, so domination is automatic.  This proves
the sigma-finite version from finite max flow without treating an infinite
capacity as a finite atom.

For lambda=M, intervals suffice in one dimension.  Indeed, if (1) fails,
inner regularity supplies a compact counterexample A.  The connected
components of A^D are closed intervals.  In one such component, replacing
the corresponding cluster of A by its interval hull I can only increase
beta mass and does not enlarge its D-neighbourhood: the neighbourhood is
already I^D.  Distinct components have disjoint neighbourhoods, so a
positive total deficiency forces a positive interval deficiency.  The
holding atom makes every interval with dist(I,x)<=D automatic.  It remains
only to check closed intervals wholly to the left or right of the holding
ball.

Writing F(t)=beta_sigma((-∞,t]), G(t)=nu_x((-∞,t]), and G(t-)=
nu_x((-∞,t)), the exact left-side inequalities are

    F(b)-G(b+D) <= F(a)-G((a-D)-),
                  a <= b < x-D.                           (2)

The left limit in (2) is mandatory because nu_x has prime-power atoms.
The right-side inequalities follow by reflection
``(x,sigma,z,u)->(-x,-sigma,-z,-u)``.  For lambda<M without first proving
the full-mass statement, single intervals do *not* suffice: the exact
one-dimensional criterion is

    sup sum_j [beta_sigma(I_j)-nu_x(I_j^D)]_+ <= M-lambda, (3)

where the supremum is over finite interval families outside the holding
ball whose mutual gaps exceed 2D.  Formula (3) is the maximum-weight
interval-scheduling form of (1); separated deficiencies consume the one
global discard allowance cumulatively.

The executable part below proves the tail input needed for an exhaustive
check of (2).  Take

    D=3/10,  |x|<=6,  |z|>=1,

and translate z toward zero:

    u=z-sign(z)D.

For the archimedean density

    a_x(u)=K(u)J(|u-x|)/cosh(x/2),
    J(h)=exp(-h/2)/(1-exp(-2h)),

the certificate proves, for both beta signs,

    a_x(u) >= 8 beta_sigma(z).                            (4)

Thus the whole two-sided beta tail has a dominated R_D transport using at
most one eighth of the corresponding archimedean density.  The images are
disjoint and lie in ``(-∞,-7/10]`` and ``[7/10,∞)``.  The exact beta-CDF
endpoint formulas also certify

    beta_sigma({|z|>=1}) < 3/200000000.                  (4a)

Consequently this tail transport consumes less than ``3/200000000`` of
total archimedean mass.  Pointwise it uses at most one eighth of the
available archimedean density on its image.  The latter statement is a
capacity fraction, not an additional factor of eight in the transported
mass.

On 1<=|z|<=4, (4) is checked on 225,600 rational Arb boxes.  For t=|z|>=4,
put A=pi*exp(2t).  The first theta term below and the geometric theta upper
bound give

    K(t-D)/K(t) >= exp(A(1-exp(-2D))-9D/2)/4.

Also ``J(|u-x|)>=exp(-(t-D+6)/2)`` and
``cosh(x/2)<=cosh(3)``.  After taking the worse of the two beta signs,

    a_x(u)/beta_sigma(z)
      >= exp(A(1-exp(-2D))-t-4D-3)/(8 cosh(3)),           (5)

whose exponent is increasing for t>=4.  The script verifies every
inequality in this tail estimate with Arb.

This file does not assert that the remaining compact inequalities (2) have
already been certified.  In particular, (4)'s one-eighth archimedean
ledger must be subtracted if a separate core transport is constructed; it
may not be reused silently.

Reproduce with

    PYTHONPATH=/tmp/pvdeps:scripts python3 -u \
      scripts/coupling_mixed_beta_hall_tail_certificate.py
"""

from __future__ import annotations

from flint import arb, ctx

import coupling_anchor_beta_transport_certificate as base


ctx.prec = 200


def q(numerator: int, denominator: int = 1) -> arb:
    return arb(numerator) / denominator


def interval(left: arb, right: arb) -> arb:
    assert right > left
    return arb((left + right) / 2, (right - left) / 2 + arb("1e-65"))


PI = arb.pi()
D = q(3, 10)
X_BOUND = q(6)
T_COMPACT_LEFT = q(1)
T_COMPACT_RIGHT = q(4)
R_STAR = q(8)
X_CELLS = 240
T_BLOCKS = (
    (q(1), q(11, 10), 100),
    (q(11, 10), q(6, 5), 50),
    (q(6, 5), q(3, 2), 30),
    (q(3, 2), q(2), 25),
    (q(2), q(3), 20),
    (q(3), q(4), 10),
)


def maximum_absolute(box: arb) -> arb:
    """Return an exact point upper bound for |box|."""
    return arb(base.nonnegative_absolute_enclosure(box).upper())


def compact_ratio_lower(x: arb, t: arb, z_sign: int, beta_sign: int) -> arb:
    """Lower bound for a_x(z-sign(z)D)/beta_beta_sign(z)."""
    assert z_sign in (-1, 1)
    assert beta_sign in (-1, 1)
    z = z_sign * t
    u = z_sign * (t - D)
    k_u_lower, _ = base.kernel_bounds(u)
    _, k_z_upper = base.kernel_bounds(z)

    # J is strictly decreasing.  This maximum-distance substitution remains
    # valid when the x and u boxes overlap; it avoids evaluating J at a box
    # containing its singular endpoint zero.
    h_upper = maximum_absolute(u - x)
    assert h_upper > 0
    j_lower = arb(base.levy_shape(h_upper).lower())
    c_upper = arb((x / 2).cosh().upper())
    beta_exponential_upper = arb((-beta_sign * z / 2).exp().upper())
    denominator = 2 * c_upper * beta_exponential_upper * k_z_upper
    return arb((k_u_lower * j_lower / denominator).lower())


def compact_certificate() -> tuple[arb, tuple]:
    x_width = 2 * X_BOUND / X_CELLS
    worst = None
    worst_cell = None
    for i in range(X_CELLS):
        x_left = -X_BOUND + i * x_width
        x = interval(x_left, x_left + x_width)
        for block_index, (t_left, t_right, cells) in enumerate(T_BLOCKS):
            t_width = (t_right - t_left) / cells
            for j in range(cells):
                left = t_left + j * t_width
                t = interval(left, left + t_width)
                for z_sign in (-1, 1):
                    for beta_sign in (-1, 1):
                        ratio = compact_ratio_lower(x, t, z_sign, beta_sign)
                        assert ratio > R_STAR
                        if worst is None or ratio < worst:
                            worst = ratio
                            worst_cell = (
                                i, block_index, j, z_sign, beta_sign, x, t
                            )
    assert worst is not None and worst_cell is not None
    return worst, worst_cell


def beta_tail_mass_upper() -> arb:
    """Exact upper bound for beta_sigma({|z|>=1}), either sigma."""
    t = q(1)
    a = PI * (2 * t).exp()
    positive = arb(0)
    negative = arb(0)
    for n in range(1, 5):
        nn = arb(n * n)
        v = a * nn
        positive += (2 * v - 1) * (-v).exp()
        negative += 2 * PI * nn * (3 * t).exp() * (-v).exp()

    # Both omitted endpoint series have n^2 exp(-a n^2) majorants.  For
    # n>=5 their consecutive ratio is at most (6/5)^2 exp(-11a).
    ratio = q(6, 5) ** 2 * (-11 * a).exp()
    assert ratio < 1
    n = arb(5)
    first_shape = n**2 * (-25 * a).exp()
    positive_tail = 2 * a * first_shape / (1 - ratio)
    negative_tail = 2 * PI * (3 * t).exp() * first_shape / (1 - ratio)
    total = positive + negative + positive_tail + negative_tail
    assert total < q(3, 200_000_000)
    return arb(total.upper())


def analytic_tail_certificate() -> arb:
    """Prove (5) at t=4 and its monotone continuation to infinity."""
    t = T_COMPACT_RIGHT
    a = PI * (2 * t).exp()
    attenuation = 1 - (-2 * D).exp()

    # Conditions used in the theta lower/upper bounds.  The n=1 lower term
    # uses 2v-3>=v.  In the upper sum, the n>=2-to-n=1 majorant is bounded by
    # a geometric tail and 1-16exp(-3A)>1/2.
    assert a * (-2 * D).exp() > 3
    assert 16 * (-3 * a).exp() < q(1, 2)

    exponent_derivative = 2 * a * attenuation - 1
    assert exponent_derivative > 0
    exponent = a * attenuation - t - 4 * D - q(3)
    lower = exponent.exp() / (8 * q(3).cosh())
    assert lower > R_STAR
    return arb(lower.lower())


def main() -> None:
    monotone_n1, monotone_tail = base.certify_kernel_monotonicity_constants()
    compact_lower, worst_cell = compact_certificate()
    tail_lower = analytic_tail_certificate()
    beta_tail_upper = beta_tail_mass_upper()
    print("precision_bits:", ctx.prec)
    print("translation_distance:", D)
    print("anchor_interval:", (-X_BOUND, X_BOUND))
    print("transported_beta_tail:", f"|z| >= {T_COMPACT_LEFT}")
    print("compact_t_interval:", (T_COMPACT_LEFT, T_COMPACT_RIGHT))
    print("certified_compact_cells:", 4 * X_CELLS * sum(b[2] for b in T_BLOCKS))
    print(
        "worst_cell_(x_index,block_index,t_index,z_sign,beta_sign,x_box,t_box):",
        worst_cell,
    )
    print("compact_minimum_density_ratio:", compact_lower)
    print("analytic_tail_ratio_lower:", tail_lower)
    print("uniform_rational_reserve:", R_STAR)
    print("beta_two_sided_tail_mass_upper:", beta_tail_upper)
    print("tail_image_intervals:", "(-infinity,-7/10] union [7/10,infinity)")
    print("Ksecond_n1_upper_on_short_interval:", monotone_n1)
    print("Ksecond_n_ge_2_abs_upper:", monotone_tail)
    print("certificate: PASS")


if __name__ == "__main__":
    main()
