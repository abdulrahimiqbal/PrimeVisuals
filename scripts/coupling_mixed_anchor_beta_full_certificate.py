#!/usr/bin/env python3
"""Exact full-mass mixed compact-anchor--beta transport certificate.

For every ``|x| <= 3/5`` and either

    beta_sigma(dz) = 2 exp(-sigma*z/2) K(z) dz,

this program certifies a coupling of the complete mass ``1/2`` law
``beta_sigma`` to the capacity measure consisting of the physical jump
measure from x together with a free holding atom of mass ``1/2`` at x.  Its
support satisfies ``|z-u| < 2/5``.

The two tails ``|z| >= 3/2`` use the already proved translation by ``1/10``
into the archimedean density.  Their images lie outside ``(-7/5,7/5)``.
The middle law on ``[-3/2,3/2]`` is divided into 600 half-open bins.  Each
actual bin mass is bounded *above* by a rigorous composite-midpoint Arb
enclosure.  Disjoint archimedean bins in ``(-7/5,7/5)``, prime-power atoms,
and the holding atom are bounded below uniformly on adaptive x-cells.  A
product edge is retained only when every source/target pair on it has
distance below ``399/1000``.  Exact rational earliest-deadline-first flow
then serves every upper demand ledger, hence also the actual middle law.

More explicitly, if the exact flow assigns amount ``c_ij`` from supply j to
the upper ledger ``U_i`` of beta bin i, multiply every ``c_ij`` by
``beta_sigma(I_i)/U_i``.  The resulting row sum is the actual beta mass and
every column sum only decreases.  Split ``beta_sigma|I_i`` in these constant
proportions and couple each piece by a normalized product with the indicated
uniform arch submeasure or atom.  This lifts the finite rational check to a
genuine Borel coupling of the continuum measures; no mesh limit is taken.

The tail images and middle archimedean bins are disjoint up to the null
endpoints ``+/-7/5``; assign those endpoints to the tails and take the middle
bins half open.  Prime atoms and the holding atom are used only by the middle
flow, so no capacity is counted twice.  Reflection sends
``(x,sigma,z,u)`` to ``(-x,-sigma,-z,-u)`` and
reduces the full anchor interval to ``0 <= x <= 3/5``.

Continuum and measurability audit
---------------------------------

Give the twelve closed x-cells the half-open ownership convention (left
closed, right open, with the final right endpoint included), and do the same
for the beta and arch bins.  All estimates are proved on the closed
closures, so ownership choices do not weaken a bound.  On a fixed x-cell the
exact greedy allocations are constant.  An arch supply of certified mass c
on a target bin U is realized as ``c |U|^(-1) du``; the density bound in
``arch_capacity`` proves that this is dominated by ``a_x(u)du`` for every x
in the cell.  A prime supply is ``c delta_(x +/- log(q))`` and a holding
supply is ``c delta_x``.  These are Borel kernels in x.  The finitely many
cell formulas pasted with the half-open convention are therefore Borel.

The middle arch bins are contained in ``[-7/5,7/5]``.  The translated tail
arch measures are supported in ``(-infinity,-7/5]`` and
``[7/5,infinity)``.  Their common boundary has zero arch measure and is
assigned once by the half-open convention.  The middle prime atoms and
holding atom are different summands of the capacity measure and no tail
transport uses them.  Thus neither an arch density element nor an atom is
reused.

Finite-remote-source consequence
--------------------------------

For a positive remote source s define its physical compact-jump measure

    P_s = sum_(q=p^k) Lambda(q) q^(-1/2) K(s-log(q))/cosh(s/2)
                         delta_(s-log(q)).

On every fixed compact z-interval, ``P_s`` converges on half-open intervals
to ``beta_+``.  Here is the complete ordinary-PNT argument.  Put
``r=q/exp(s)=exp(-z)``.  The prime number theorem gives

    exp(-s) psi(exp(s)r) -> r

uniformly when r ranges in a compact subinterval of ``(0,infinity)``: divide
by ``exp(s)r`` and use that its minimum tends to infinity.  Integration by
parts therefore gives convergence of the associated Stieltjes integrals
against the continuous weight ``r^(-1/2)K(-log r)``.  Since
``exp(s/2)/cosh(s/2)->2``, changing variables back gives

    2 r^(-1/2)K(-log r) dr = 2 exp(-z/2)K(z) dz.

The limit is nonatomic, so the same statement holds for either half-open
endpoint convention.  Reflection gives ``P_s -> beta_-`` at the negative
end.  This uses no PNT error term.

Fix ``0<lambda<1/2``.  Choose a rational ``W=3/2+N/100`` so large that either
beta law gives ``[-W,W]`` mass greater than lambda.  Keep the 600 certified
middle bins.  Partition each of ``[3/2,W]`` and ``[-W,-3/2]`` into half-open
bins of width ``1/100`` and translate its target bin toward zero by ``1/10``.
For a tail bin I and image U, the pointwise tail certificate integrates to

    a_x(U) >= R beta_sigma(I),       R>1229,

uniformly in ``|x|<=3/5``.  Every product pair in ``I x U`` has distance at
most ``11/100``.  For a middle bin I_i, its rational upper ledger U_i is
strictly larger than ``beta_sigma(I_i)``.  There are only finitely many bins
and signs.  Weighted-PNT convergence thus supplies one S such that, for all
remote ``|s|>=S``, every middle physical-bin mass is below U_i and every
tail physical-bin mass is below ``R beta_sigma(I)``.  Replace the beta row
scaling in the certified middle flow by ``P_s(I_i)/U_i`` and use normalized
products on the tail bins.  Every column remains within its certified
capacity.  No point is moved between bins: middle support stays below
``399/1000`` and tail support stays below ``11/100``.  Finally
``P_s([-W,W])>lambda`` for the same sufficiently remote sources; thinning
the whole constructed coupling by ``lambda/P_s([-W,W])`` gives exact rate
lambda and product separation strictly below ``2/5<1/2``.

The bin memberships, locally finite prime sums, moving atoms, and thinning
factor are Borel in (x,s).  This finite construction is the required open-
support/slack bridge; it does not infer support or capacity domination from
weak convergence.

Scope after this lemma: the direct mixed problem is reduced to the compact
set ``|x|<=3/5, |s|<S`` outside
``{c(x,s)<=2/5 or |x-s|<=1/2}``.  After crediting the existing compact-square
stages on ``|s|<=5/4``, the still-uncovered core-versus-middle exterior is
``|x|<=3/5, 5/4<|s|<S`` outside that target.  This certificate does not
claim to close the separately recorded compact-square/high-band stage.

Reproduce with

    PYTHONPATH=/tmp/pvdeps:scripts python3 -u \
      scripts/coupling_mixed_anchor_beta_full_certificate.py
"""

from __future__ import annotations

from fractions import Fraction

from flint import arb, ctx

import coupling_mixed_anchor_beta_hall_certificate as base


ctx.prec = 200


TARGET_D = base.q(2, 5)
MIDDLE_D = base.q(399, 1000)
ANCHOR_BOUND = base.q(3, 5)
X_BASE_CELLS = 12
UPPER_QUADRATURE_SUBCELLS = 8


def middle_demand_upper_capacities(sign: int) -> tuple[Fraction, ...]:
    """Rigorous upper masses of every middle beta bin."""
    assert sign in (-1, 1)
    result: list[Fraction] = []
    for left, right in base.DEMAND_BOXES:
        subwidth = (right - left) / UPPER_QUADRATURE_SUBCELLS
        mass_upper = arb(0)
        for subindex in range(UPPER_QUADRATURE_SUBCELLS):
            subleft = left + subindex * subwidth
            subright = subleft + subwidth
            midpoint = (subleft + subright) / 2

            midpoint_abs = abs(midpoint)
            k_mid, _kp_mid, _kpp_mid = base.theta_triplet_positive(
                midpoint_abs
            )
            f_mid_upper = (
                2 * (-sign * midpoint / 2).exp() * k_mid
            ).upper()

            z = base.interval(subleft, subright)
            t = base.nonnegative_absolute_enclosure(z)
            k, kp, kpp = base.theta_triplet_positive(t)
            exponential_upper = (-sign * z / 2).exp().upper()
            second_upper = 2 * exponential_upper * (
                base.absolute_upper(kpp)
                + base.absolute_upper(kp)
                + k.upper() / 4
            )
            contribution = (
                f_mid_upper * subwidth
                + second_upper * subwidth**3 / 24
            )
            assert contribution > 0
            mass_upper += contribution
        result.append(base.rational_above(mass_upper))
    return tuple(result)


def main() -> None:
    # The imported module contains the audited density and capacity bounds.
    # Replace only the edge radius and the demand ledger before invoking its
    # supply construction and exact interval-flow routine.
    base.TARGET_D = TARGET_D
    base.MIDDLE_D = MIDDLE_D
    base.S = ANCHOR_BOUND
    base.X_BASE_CELLS = X_BASE_CELLS
    # If a selected atom can meet a middle beta bin then
    # log(q) < |x|+3/2+399/1000 < 5/2, hence q<exp(5/2)<13.
    # The complete prime-power table through 11 is therefore sufficient.
    base.PRIME_DATA = tuple(row for row in base.PRIME_DATA if row[0] <= 11)
    base.Q_MAX = 11
    assert (base.q(5, 2).exp() < 13)
    assert tuple(int(row[0]) for row in base.PRIME_DATA) == (
        2,
        3,
        4,
        5,
        7,
        8,
        9,
        11,
    )
    upper_demands = {
        +1: middle_demand_upper_capacities(+1),
        -1: middle_demand_upper_capacities(-1),
    }
    base.DEMAND_CAPACITIES = upper_demands

    monotone_n1, monotone_tail = (
        base.beta_base.certify_kernel_monotonicity_constants()
    )
    tail_ratio = base.tail_ratio_certificate()
    middle_upper_totals = {
        sign: sum(capacities, Fraction(0))
        for sign, capacities in upper_demands.items()
    }

    x_width = base.S / base.X_BASE_CELLS
    certified = 0
    maximum_depth = 0
    worst_available = None
    worst_cell = None
    maximum_nodes = 0

    def certify_or_split(left: arb, right: arb, depth: int = 0) -> None:
        nonlocal certified, maximum_depth, worst_available, worst_cell
        nonlocal maximum_nodes
        x_box = left, right
        source_supplies = tuple(
            base.Supply(supply.label, supply.box, Fraction(1, 2))
            if supply.label == ("hold",)
            else supply
            for supply in base.supplies(x_box)
        )
        results = {
            sign: base.greedy_match(source_supplies, sign)
            for sign in (-1, +1)
        }
        if not all(result[0] for result in results.values()):
            assert depth < base.MAX_X_DEPTH, (
                left,
                right,
                depth,
                results,
            )
            middle = (left + right) / 2
            certify_or_split(left, middle, depth + 1)
            certify_or_split(middle, right, depth + 1)
            return
        certified += 1
        maximum_depth = max(maximum_depth, depth)
        for sign, (_ok, _index, available, nodes) in results.items():
            maximum_nodes = max(maximum_nodes, nodes)
            if worst_available is None or available < worst_available:
                worst_available = available
                worst_cell = (left, right, sign, nodes)

    for index in range(base.X_BASE_CELLS):
        left = index * x_width
        certify_or_split(left, left + x_width)

    assert worst_available is not None and worst_cell is not None
    assert base.TAIL_SHIFT < TARGET_D
    assert MIDDLE_D < TARGET_D
    print("precision_bits:", ctx.prec)
    print("anchor_interval: [-3/5,3/5] (reflection from [0,3/5])")
    print("beta_signs: plus and minus")
    print("complete_beta_mass:", base.q(1, 2))
    print("target_separation:", TARGET_D)
    print("middle_product_separation_bound:", MIDDLE_D)
    print("tail_translation_distance:", base.TAIL_SHIFT)
    print("tail_density_ratio_lower:", tail_ratio)
    print("middle_beta_interval:", (-base.BETA_BOUND, base.BETA_BOUND))
    print("middle_arch_interval:", (-base.ARCH_BOUND, base.ARCH_BOUND))
    print("demand_bins:", base.DEMAND_BINS)
    print("upper_quadrature_subcells_per_bin:", UPPER_QUADRATURE_SUBCELLS)
    print("arch_bins:", base.ARCH_BINS)
    print("prime_power_cutoff_and_count:", base.Q_MAX, len(base.PRIME_DATA))
    print("base_x_cells:", base.X_BASE_CELLS)
    print("certified_x_leaves:", certified)
    print("maximum_x_refinement_depth:", maximum_depth)
    print("maximum_active_supply_nodes:", maximum_nodes)
    print(
        "middle_beta_upper_totals:",
        {
            sign: base.fraction_arb(total)
            for sign, total in middle_upper_totals.items()
        },
    )
    print("worst_cell_(xL,xR,beta_sign,active_nodes):", worst_cell)
    print(
        "worst_greedy_available_minus_current_demand:",
        base.fraction_arb(worst_available),
    )
    print("transported_beta_mass:", base.q(1, 2))
    print("certificate: PASS")
    print("kernel_monotonicity_n1_upper:", monotone_n1)
    print("kernel_monotonicity_tail_upper:", monotone_tail)


if __name__ == "__main__":
    main()
