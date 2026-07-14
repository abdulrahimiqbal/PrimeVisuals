#!/usr/bin/env python3
"""Exact radical-cancellation certificate for the high mixed half band.

Put ``C(x)=cosh(x/2)`` and let the physical jump measure be

    nu_x(du) = K(u) J(|u-x|) C(x)^(-1) du
      + C(x)^(-1) sum_(q=p^k) Lambda(q) q^(-1/2)
          {K(x-log q) delta_(x-log q)
           + K(x+log q) delta_(x+log q)}.

The complete prime degree at y is

    P(y)=sum_q Lambda(q)q^(-1/2)
              {K(y-log q)+K(y+log q)}.

The pole-free Weil radical identity proved in continuation item 51 is

    A_tilde K = -2c C = -C/2,              c=int C K=1/4.

Expanding the canonical diagonal finite part gives the pointwise identity

    C(y)/2-P(y)
      = c0 K(y)
        + int_0^infinity J(t)
            {K(y+t)+K(y-t)-2K(y)} dt,                 (1)

where

    c0=log(pi)-psi(1/4)=EulerGamma+pi/2+log(8pi).

Every term in (1) is ordinary and absolutely convergent.  The prime sum is
locally uniformly absolutely convergent by the Gaussian theta tail.  At
zero, the symmetric second difference is O(t^2) while J(t)=O(1/t); at
infinity J(t)=O(exp(-t/2)) and K has a double-exponential tail.  Thus the
distributional radical equation, first proved on the smooth core, applies to
K by the already proved item-51 cutoff passage.

For epsilon=1/10 define the finite nonlocal mass

    M_epsilon(y)=C(y)^(-1) [P(y)
      +int_epsilon^infinity J(t){K(y+t)+K(y-t)}dt].

Subtracting its definition from (1) gives the exact *prime-free* formula

    C(y){1/2-M_epsilon(y)} = R_epsilon(y),              (2)

    R_epsilon(y)
      =K(y){c0-2int_epsilon^infinity J(t)dt}
       +int_0^epsilon J(t)
          {K(y+t)+K(y-t)-2K(y)}dt.

This program proves, with no cancellation in the evaluated quantities, that
for every ``7/5<=y<=4`` and ``|x|<=3/5``,

    nu_x((y-3/5,y+3/5)) > R_epsilon(y)/C(y).            (3)

Indeed, for each actual y the arch density in the *moving* left subinterval
``[y-3/5,y-11/20]`` is retained.  For u>x,

    d/dx log(J(u-x)/C(x))
      =1/2+2/(exp(2(u-x))-1)-tanh(x/2)/2 > 0,

so its uniform minimum occurs at x=-3/5.  On a closed y-cell, K is decreasing
and its minimum over that moving slice is attained at the single largest
right endpoint ``y_R-11/20``.  The code therefore evaluates K on the smaller
box of moving right endpoints, rather than on the union of the whole slices;
this is a safe monotonic lower envelope.  The largest J-distance is likewise
``y_R+1/20``.  Multiplying these two minima by the fixed slice width 1/20
gives the lower bound used below.

For the right side, discard the negative term
``-2K(y) int_epsilon^infinity J``.  Taylor's formula and the theta-series
bound for ``|K''|`` on ``[y-epsilon,y+epsilon]`` give

    R_epsilon(y)
      <= c0 K(y)+(epsilon^2/2) sup |K''|.               (4)

The n-th differentiated theta term is bounded by

    8 pi n^2 exp(5t/2) v^3 exp(-v),
    v=pi n^2 exp(2t).

For t>=13/10 this decreases in t, and the n>=2-to-n=1 majorants form a
geometric tail with ratio at most ``256 exp(-3 pi exp(2t))``.  The 260
rational y-cells below certify (3) from (4).

Hall scope (closed separation-only relation).  Fix a requested finite event
rate h and use ``|u-v|<=D``.
On a finite localization, add a left holding node at x and a right holding
node at y, each of capacity h.  Join two jump nodes when their targets are
at distance below D; join an x-jump to the y-hold when its target is in
``B_D(y)``; join the x-hold to a y-jump when its target is in ``B_D(x)``;
and omit the hold--hold edge because the source is outside the target.
Finite capacitated max-flow/min-cut (equivalently the finite atomic form of
Strassen's theorem) applies.

Any cut putting the x-hold on the sink side crosses its source edge of
capacity h, and any cut putting the y-hold on the source side crosses its
sink edge of capacity h.  Such cuts are already harmless for a requested
flow h.  In every potentially smaller cut, x-hold is on the source side and
y-hold on the sink side.  If A is the set of x-jump targets on the sink side,
the x-jump--y-hold edges force ``B_D(y) subset A``.  The x-hold--y-jump edges
force ``B_D(x)`` into the source-side y set.  Finally, infinite-capacity
joint edges force every y target within D of an x target in ``A^c`` into
that same source-side y set.  Minimizing that set gives exactly

    H_D(x,y)=inf_A [nu_x(A)
      +nu_y(B_D(x) union N_D(A^c))],                    (5)

where the infimum is over Borel A containing B_D(y).  Formula (3) verifies
the concentric family ``A=B_(D+epsilon)(y)`` (when B_D(x) lies outside the
epsilon-ball about y), because (2) makes its cut strictly larger than 1/2.
To pass from finite atoms to the physical sigma-finite kernels, first remove
shrinking neighborhoods of the two Levy singularities and localize in a
growing compact interval, then refine finite Borel partitions.  Capacities
may be capped at h because no flow of total h can use more.  Tightness is not
lost at the locally infinite endpoints: if ``|x-y|>D``, choose
``rho<(|x-y|-D)/3``.  Every allowed event consumes a jump outside at least
one of ``B_rho(x),B_rho(y)``; each corresponding restricted physical measure
is finite and tight.  Hence finite flows have a tight subnet, domination is
closed under the weak limit, and the closed support relation is preserved.
Conversely every coupling induces all the displayed cuts.  This proves (5)
for ``|u-v|<=D`` with no finite-mesh extrapolation.  A strict target
``|u-v|<D`` must be certified at one fixed smaller radius ``D'<D`` (or by an
equivalent explicit open buffer); merely taking ``D'`` up to D would prove
only the closed statement.  This file does not make that sufficiency claim.

Formula (3) does *not* verify arbitrary disconnected A in (5).  Those
multi-interval Hall cuts, especially cuts isolating prime atoms, remain the
exact finite-flow obligation; this file makes no sufficiency claim for them.

Reproduce with

    PYTHONPATH=/tmp/pvdeps:scripts python3 -u \
      scripts/coupling_high_middle_radical_cut_certificate.py
"""

from __future__ import annotations

from flint import arb, ctx

import coupling_anchor_beta_transport_certificate as base


ctx.prec = 200


q = base.q
PI = arb.pi()
EPSILON = q(1, 10)
TARGET_D = q(1, 2)
ANCHOR_BOUND = q(3, 5)
SLICE_WIDTH = q(1, 20)
Y_LEFT = q(7, 5)
Y_RIGHT = arb(4)
Y_CELLS = 260


def k_second_absolute_upper(t: arb) -> arb:
    """Uniform upper bound for |K''(s)| on every s>=t>=13/10."""

    # Accumulated Arb endpoint padding can place the represented lower
    # endpoint infinitesimally below the exact rational 13/10.  Replacing it
    # by that lower endpoint is conservative; all polynomial inequalities
    # used below already hold on the larger interval t>=129/100.
    t = arb(t.lower())
    assert t >= q(129, 100)
    scale = PI * (2 * t).exp()
    # For v>=pi*exp(13/5), the exact cubic multiplying the positive
    # theta prefactor is positive and at most 8v^3.  Its resulting majorant
    # has logarithmic t-derivative 17/2-2v<0.
    assert scale > q(17, 4)
    first = 8 * PI * (q(5, 2) * t).exp() * scale**3 * (-scale).exp()
    ratio = arb(256) * (-3 * scale).exp()
    assert ratio < 1
    result = first / (1 - ratio)
    assert result > 0
    return arb(result.upper())


def main() -> None:
    # psi(1/4)=-gamma-pi/2-3log2, hence
    # log(pi)-psi(1/4)=gamma+pi/2+log(8pi).
    c0 = arb.const_euler() + PI / 2 + (8 * PI).log()
    assert c0 > 5 and c0 < 6

    cell_width = (Y_RIGHT - Y_LEFT) / Y_CELLS
    assert cell_width.contains(q(1, 100))
    worst_ratio = None
    worst_cell = None

    for index in range(Y_CELLS):
        y_left = Y_LEFT + index * cell_width
        y_right = y_left + cell_width
        y_box = base.interval(y_left, y_right)

        # R_epsilon/C upper bound from (4).  C is increasing for y>0.
        _k_y_lower, k_y_upper = base.kernel_bounds(y_box)
        r_upper = (
            arb(c0.upper()) * k_y_upper
            + EPSILON**2 / 2
            * k_second_absolute_upper(y_left - EPSILON)
        )
        normalized_defect_upper = r_upper / (y_left / 2).cosh().lower()

        # Uniform anchor lower bound.  The retained interval is
        # [y-D-epsilon, y-D-epsilon+1/20]=[y-.6,y-.55].
        target_box = base.interval(
            y_left - TARGET_D - EPSILON + SLICE_WIDTH,
            y_right - TARGET_D - EPSILON + SLICE_WIDTH,
        )
        k_target_lower, _k_target_upper = base.kernel_bounds(target_box)
        maximum_distance = (
            y_right - TARGET_D - EPSILON
            + SLICE_WIDTH + ANCHOR_BOUND
        )
        j_lower = base.levy_shape(maximum_distance).lower()
        anchor_lower = (
            SLICE_WIDTH * k_target_lower * j_lower
            / (ANCHOR_BOUND / 2).cosh().upper()
        )

        assert anchor_lower > normalized_defect_upper, (
            index,
            y_left,
            y_right,
            anchor_lower,
            normalized_defect_upper,
        )
        ratio = anchor_lower / normalized_defect_upper
        if worst_ratio is None or ratio < worst_ratio:
            worst_ratio = ratio
            worst_cell = (
                y_left,
                y_right,
                anchor_lower,
                normalized_defect_upper,
            )

    assert worst_ratio is not None and worst_cell is not None
    print("precision_bits:", ctx.prec)
    print("y_interval:", (Y_LEFT, Y_RIGHT))
    print("anchor_interval: [-3/5,3/5]")
    print("target_distance:", TARGET_D)
    print("local_gap_epsilon:", EPSILON)
    print("retained_anchor_slice_width:", SLICE_WIDTH)
    print("radical_diagonal_constant_c0:", c0)
    print("rational_y_cells:", Y_CELLS)
    print("worst_cell_(yL,yR,anchor_lower,defect_upper):", worst_cell)
    print("worst_anchor_to_defect_ratio_lower:", worst_ratio)
    print("concentric_holding_cut_family: PASS")
    print("all_disconnected_Hall_cuts: NOT_CLAIMED")


if __name__ == "__main__":
    main()
