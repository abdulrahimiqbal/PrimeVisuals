#!/usr/bin/env python3
"""Exact small-left-cut base for the high mixed mandatory halfline.

Put D=1/2 and

    G_e(x,y)=nu_x([y-D-e,infinity))
                +nu_y(( -infinity,y-e])-1/2.

This file proves

    G_e(x,y)>0                                             (1)

for every ``|x|<=3/5``, ``y>=7/5`` and ``0<e<=1/10``.  The proof below is
rescaled to consume only ``1/250`` of a fixed x-archimedean slice.  This
subtransport remains valid, but the candidate global split that reserved
``51/100`` for a beta composition is falsified by
``coupling_half_arch_beta_full_falsifier.py`` and is not claimed here.

No left prime atom is crossed because ``e<=1/10<log 2``.  Expanding the
radical identity of continuation item 186 with the right cutoff sent to
infinity gives

    1/2-nu_y(( -infinity,y-e]) = D_e(y)/C(y),

    D_e(y)=c0 K(y)
      +int_0^e J(t){K(y-t)-K(y)}dt-K(y)I(e)
      +int_0^infinity J(t){K(y+t)-K(y)}dt
      +sum_(n>=2) Lambda(n)n^(-1/2)K(y+log n),            (2)

where ``I(e)=int_e^infinity J`` and
``c0=EulerGamma+pi/2+log(8pi)``.  The derivative of D_e before the first
atom is ``J(e)K(y-e)>0``.  Hence it is enough to bound D_(1/10).
The last integral in (2), as well as ``-K(y)I(e)``, is nonpositive.

For ``t0=y-1/10`` the differentiated positive-theta series gives

    sup_(t>=t0)|K'(t)| <= P(t0)
      =5 pi exp(5t0/2) A^2 exp(-A)/(1-64exp(-3A)),
      A=pi exp(2t0).                                     (3)

Indeed ``| -4v^2+15v-15/2 |<=5v^2`` here, and consecutive n-majorants
have ratio at most ``64exp(-3A)``.  Also
``tJ(t)<=exp(3t/2)/2`` on ``0<t<=1/10``.  Therefore the local integral is
at most ``exp(3/20)P(t0)/20``.

The complete outward prime sum is bounded without a prime cutoff.  With
``B=pi exp(2y)``, use Lambda(n)<=log n and the theta majorant to get

    Pplus(y) <= 32 pi^2 log(2) exp(9y/2-4B)
       / {(1-16exp(-12B))(1-11exp(-5B))}.                (4)

The factor 11 dominates
``((n+1)/n)^4 log(n+1)/log(n)`` for n>=2.  Thus

    D_(1/10)(y)
      <= c0 Kup(y)+exp(3/20)P(y-1/10)/20+Pplus(y),       (5)

where ``Kup`` is the corresponding complete theta upper bound.

For all e in the stated range, the x tail contains

    S_y=[y-1/2,y-9/20].

Source monotonicity, monotonic decrease of K (item 182), and monotonic
decrease of J first give the following lower bound for *half* its arch mass:

    (1/2)nu_x^arch(S_y)
      >= K(y-9/20)J(y+3/20)/(40 C(3/5)).                (6)

The scalar comparisons below actually give a half-slice/defect ratio above
330480.  Multiplying that half-slice by ``(1/250)/(1/2)=1/125`` still leaves
a ratio above 2643, so only the ``1/250`` colored ledger is consumed.  The
comparisons are half-line certificates, not samples.
For the ratios ``Kup(y)/P(y-1/10)`` and ``Pplus(y)/P(y-1/10)``, direct
logarithmic differentiation of the displayed majorants is negative at the
base point and becomes still more negative because their exponential scales
are respectively ``A exp(1/5)`` and ``4A exp(1/5)`` rather than A.  For the
lower ratio ``Klow(y-9/20)/P(y-1/10)``, its logarithmic derivative is at
least

    -2+2 pi exp(2(y-9/20))(exp(7/10)-1)>0.              (7)

It therefore increases.  The Arb evaluations at y=7/5 rigorously check the
worst endpoints and all omitted-series denominators.
"""

from __future__ import annotations

from flint import arb, ctx


ctx.prec = 240


PI = arb.pi()
Y0 = arb(7) / 5
T0 = arb(13) / 10
Z0 = arb(19) / 20
C06 = (arb(3) / 10).cosh()


def kernel_upper(t: arb) -> arb:
    scale = PI * (2 * t).exp()
    ratio = 16 * (-3 * scale).exp()
    assert ratio < 1
    return (
        2 * PI**2 * (arb(9) * t / 2).exp() * (-scale).exp()
        / (1 - ratio)
    ).upper()


def kernel_lower(t: arb) -> arb:
    scale = PI * (2 * t).exp()
    assert scale > 3
    return (PI**2 * (arb(9) * t / 2).exp() * (-scale).exp()).lower()


def derivative_upper(t: arb) -> arb:
    scale = PI * (2 * t).exp()
    assert scale > 3
    ratio = 64 * (-3 * scale).exp()
    assert ratio < 1
    return (
        5 * PI * (arb(5) * t / 2).exp() * scale**2
        * (-scale).exp() / (1 - ratio)
    ).upper()


def outward_prime_upper(y: arb) -> arb:
    scale = PI * (2 * y).exp()
    theta_denominator = 1 - 16 * (-12 * scale).exp()
    integer_ratio = 11 * (-5 * scale).exp()
    assert theta_denominator > 0 and integer_ratio < 1
    return (
        32 * PI**2 * arb(2).log()
        * (arb(9) * y / 2 - 4 * scale).exp()
        / (theta_denominator * (1 - integer_ratio))
    ).upper()


def main() -> None:
    c0 = arb.const_euler() + PI / 2 + (8 * PI).log()
    local_coefficient = (arb(3) / 20).exp() / 20

    kp = derivative_upper(T0)
    ky = kernel_upper(Y0)
    pplus = outward_prime_upper(Y0)
    coefficient = local_coefficient + c0 * ky / kp + pplus / kp

    # The two latter ratios decrease for y>=Y0.  Audit the dominant parts
    # of their logarithmic derivatives at the base point; positive
    # denominator corrections are bounded by the displayed tiny terms.
    a = PI * (2 * T0).exp()
    b = PI * (2 * Y0).exp()
    k_ratio_log_slope_upper = (
        -2 - 2 * (b - a)
        + 384 * a * (-3 * a).exp() / (1 - 64 * (-3 * a).exp())
    )
    p_ratio_log_slope_upper = (
        -2 - 8 * b + 2 * a
        + 384 * a * (-3 * a).exp() / (1 - 64 * (-3 * a).exp())
    )
    assert k_ratio_log_slope_upper < 0
    assert p_ratio_log_slope_upper < 0
    assert coefficient < arb(3) / 50

    # Half of the fixed slice, after multiplying by C(y), is bounded below
    # by exp(-3/40)K(y-9/20)/(80 C(3/5)).
    half_slice_times_cosh_lower = (
        (-arb(3) / 40).exp() * kernel_lower(Z0) / (80 * C06)
    )
    defect_numerator_upper = coefficient * kp
    half_slice_ratio = (
        half_slice_times_cosh_lower / defect_numerator_upper
    )
    assert half_slice_ratio > 330480

    # The live global ledger uses 1/250 rather than one half.  Relative to
    # the displayed half-slice this is an exact factor 1/125.
    selected_slice_times_cosh_lower = (
        half_slice_times_cosh_lower / 125
    )
    selected_slice_ratio = (
        selected_slice_times_cosh_lower / defect_numerator_upper
    )
    assert selected_slice_ratio > 1

    # The quotient in the preceding assertion increases for y>=Y0.
    shifted_scale = PI * (2 * Z0).exp()
    quotient_log_slope_lower = (
        -2 + 2 * shifted_scale * ((arb(7) / 10).exp() - 1)
    )
    assert quotient_log_slope_lower > 0

    print("precision_bits:", ctx.prec)
    print("source_band: |x|<=3/5, y>=7/5")
    print("left_cut_range: 0<e<=1/10")
    print("local_derivative_upper_at_base:", kp)
    print("kernel_upper_at_y_base:", ky)
    print("outward_prime_upper_at_base:", pplus)
    print("total_defect_coefficient_upper:", coefficient)
    print("half_slice_times_Cy_lower:", half_slice_times_cosh_lower)
    print("defect_numerator_upper:", defect_numerator_upper)
    print("half_slice_to_defect_ratio_lower:", half_slice_ratio)
    print("selected_arch_fraction:", arb(1) / 250)
    print(
        "selected_slice_times_Cy_lower:",
        selected_slice_times_cosh_lower,
    )
    print("selected_slice_to_defect_ratio_lower:", selected_slice_ratio)
    print("quotient_log_slope_lower:", quotient_log_slope_lower)
    print("mandatory_halfline_small_e: PASS")


if __name__ == "__main__":
    main()
