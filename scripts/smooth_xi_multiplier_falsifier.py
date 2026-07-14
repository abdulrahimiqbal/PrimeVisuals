#!/usr/bin/env python3
"""Rigorous falsifier for the first smooth shifted-Xi cancellation multiplier.

Let

    M_+(z) = Xi(z+i)/2,   M_-(z) = Xi(z-i)/2,
    m(z)   = M_+(z) M_-(z),
    D      = log(plastic constant),   A = D/2,
    r      = sech(A),
    sigma(z) = 1-r*cos(A*z),
    rho(z)   = m(z)^2 sigma(z)^2.

On the real axis rho is a nonnegative smooth spectral density.  The tuning
r=sech(A) is forced by the center-pole audit: sigma(i)=0.  This script proves
that its Fourier covariance

    kappa(t) = integral_R rho(xi) cos(t*xi) dxi

is positive throughout |t| <= D but is negative at t=3A>D.  It therefore has
neither the required local obtuse sign nor the required nonnegative tail.

The finite integrals are evaluated by Arb.  The omitted |xi|>50 tails are
bounded independently by eight integrations by parts in the Fourier formula

    M_+(xi) = integral_R f(t) exp(-i*xi*t) dt,  f(t)=exp(t)K(t).

For u>=0, the two halves of f are theta sums with alpha=7/2 and 3/2:

    pi*n^2 exp(alpha*u) (2*z-3) exp(-z), z=pi*n^2 exp(2u).

The code computes a rigorous L1 bound for f^(8), including the infinite theta
tail, and hence |M_+(xi)| <= ||f^(8)||_1/|xi|^8.

Reproduction:

    python3 -m pip install --target /tmp/pvdeps python-flint
    PYTHONPATH=/tmp/pvdeps python3 scripts/smooth_xi_multiplier_falsifier.py
"""

from fractions import Fraction

from flint import acb, arb, ctx


ctx.prec = 120


def rat(p: int, q: int = 1) -> arb:
    return arb(p) / q


PI = arb.pi()
PLASTIC = arb("1.324717957244746025960908854", "1e-27")
assert 0 in PLASTIC**3 - PLASTIC - 1
D = PLASTIC.log()
A = D / 2
R = 1 / A.cosh()
T = arb(50)


def xi(z: acb) -> acb:
    """Xi(z)=xi(1/2+i*z), in the standard entire normalization."""
    s = acb(rat(1, 2)) + acb(0, 1) * z
    return (
        s
        * (s - 1)
        * acb(PI) ** (-s / 2)
        * (s / 2).gamma()
        * s.zeta()
        / 2
    )


def rho(z: acb) -> acb:
    m = xi(z + acb(0, 1)) * xi(z - acb(0, 1)) / 4
    sigma = 1 - acb(R) * (acb(A) * z).cos()
    return m * m * sigma * sigma


def base_rho(z: acb) -> acb:
    """Spectrum of (1-D_t^2)^2 k_0."""
    m = xi(z + acb(0, 1)) * xi(z - acb(0, 1)) / 4
    return m * m * (z * z + 1) ** 2


def finite_integral(kind: str) -> acb:
    """Twice the Arb integral over [0,50], using evenness."""

    def integrand(z: acb, analytic: bool) -> acb:
        value = rho(z)
        if kind == "moment2":
            value *= z * z
        elif kind == "lag3A":
            value *= (acb(3 * A) * z).cos()
        return value

    total = acb(0)
    for left in range(50):
        total += acb.integral(
            integrand,
            arb(left),
            arb(left + 1),
            abs_tol=arb("1e-21"),
            rel_tol=arb("1e-21"),
            eval_limit=10000,
        )
    return 2 * total


def base_lag_integral(lag: arb) -> acb:
    """Twice the finite [0,50] integral for the physical-identity test."""

    def integrand(z: acb, analytic: bool) -> acb:
        return base_rho(z) * (acb(lag) * z).cos()

    total = acb(0)
    for left in range(50):
        total += acb.integral(
            integrand,
            arb(left),
            arb(left + 1),
            abs_tol=arb("1e-21"),
            rel_tol=arb("1e-21"),
            eval_limit=10000,
        )
    return 2 * total


DERIVATIVE_ORDER = 8


def derivative_polynomial(alpha: Fraction) -> list[Fraction]:
    """Coefficients of (alpha+2z*d/dz)^8[(2z-3)e^-z]/e^-z."""
    coefficients = [Fraction(-3), Fraction(2)]
    for _ in range(DERIVATIVE_ORDER):
        new = [Fraction(0)] * (len(coefficients) + 1)
        for degree, coefficient in enumerate(coefficients):
            new[degree] += (alpha + 2 * degree) * coefficient
            new[degree + 1] -= 2 * coefficient
        coefficients = new
    return coefficients


def derivative_l1_bound() -> arb:
    """A rigorous upper bound for ||f^(8)||_1."""
    retained = arb(0)
    theta_tail = arb(0)
    first_n = 11
    first_x = PI * first_n**2

    for alpha_q in (Fraction(7, 2), Fraction(3, 2)):
        alpha = rat(alpha_q.numerator, alpha_q.denominator)
        coefficients = derivative_polynomial(alpha_q)

        # Exact upper incomplete gamma integrals for n<=10.
        for n in range(1, first_n):
            x = PI * n * n
            for degree, coefficient_q in enumerate(coefficients):
                coefficient = rat(
                    abs(coefficient_q.numerator), coefficient_q.denominator
                )
                shape = alpha / 2 + degree
                retained += (
                    x ** (1 - alpha / 2)
                    * coefficient
                    * x.gamma_upper(shape)
                    / 2
                )

        # For x>shape-1,
        # Gamma(shape,x) <= x^(shape-1)e^-x/(1-(shape-1)/x).
        # The ratio from n to n+1 is maximized at n=11.
        for degree, coefficient_q in enumerate(coefficients):
            coefficient = rat(
                abs(coefficient_q.numerator), coefficient_q.denominator
            )
            shape = alpha / 2 + degree
            first = (
                coefficient
                * first_x**degree
                * (-first_x).exp()
                / (2 * (1 - (shape - 1) / first_x))
            )
            ratio = (rat(12, 11) ** (2 * degree)) * (-23 * PI).exp()
            theta_tail += first / (1 - ratio)

    total = retained + theta_tail
    assert total < arb(14_000_000_000)
    return arb(14_000_000_000)


DERIVATIVE_BOUND = derivative_l1_bound()


def fourier_tail(moment: int) -> arb:
    """Bound integral_{|xi|>50} |xi|^moment rho(xi) dxi."""
    denominator = 4 * DERIVATIVE_ORDER - moment - 1
    assert denominator > 0
    return (
        2
        * (1 + R) ** 2
        * DERIVATIVE_BOUND**4
        * T ** (moment - 4 * DERIVATIVE_ORDER + 1)
        / denominator
    )


MASS_FINITE = finite_integral("mass")
MOMENT2_FINITE = finite_integral("moment2")
LAG3A_FINITE = finite_integral("lag3A")
assert 0 in MASS_FINITE.imag
assert 0 in MOMENT2_FINITE.imag
assert 0 in LAG3A_FINITE.imag

MASS_TAIL = fourier_tail(0)
MOMENT2_TAIL = fourier_tail(2)

# cos(u) >= 1-u^2/2 for every real u.  Since rho>=0 on R, for |t|<=D,
#
#   kappa(t) >= integral rho - D^2/2 integral xi^2 rho.
#
# The omitted mass is nonnegative, while the omitted second moment is bounded
# above by MOMENT2_TAIL.
LOCAL_LOWER = MASS_FINITE.real - D**2 * (
    MOMENT2_FINITE.real + MOMENT2_TAIL
) / 2
assert LOCAL_LOWER > arb("1.5e-5")

# The absolute omitted tail at lag 3A is at most MASS_TAIL.
LAG3A_UPPER = LAG3A_FINITE.real + MASS_TAIL
assert 3 * A > D
assert LAG3A_UPPER < arb("-5.5e-5")

# A separate proposed shortcut was pointwise positivity of
# (1-D_t^2)^2 k_0.  Its spectrum is m(xi)^2(xi^2+1)^2.  For |xi|>=50,
# (xi^2+1)^2 <= (1+50^-2)^2 xi^4, so the same derivative bound proves the
# displayed absolute tail.  The certified negative value refutes the shortcut.
BASE_LAG = rat(3, 5)
BASE_LAG_FINITE = base_lag_integral(BASE_LAG)
assert 0 in BASE_LAG_FINITE.imag
BASE_TAIL = (
    2
    * (1 + 1 / T**2) ** 2
    * DERIVATIVE_BOUND**4
    * T ** (5 - 4 * DERIVATIVE_ORDER)
    / (4 * DERIVATIVE_ORDER - 5)
)
BASE_LAG_UPPER = BASE_LAG_FINITE.real + BASE_TAIL
assert BASE_TAIL < arb("3.9e-7")
assert BASE_LAG_UPPER < arb("-1.34")

print("D,A,sech(A):", D, A, R)
print("||f^(8)||_1 upper bound:", DERIVATIVE_BOUND)
print("mass finite / tail:", MASS_FINITE.real, MASS_TAIL)
print("second moment finite / tail:", MOMENT2_FINITE.real, MOMENT2_TAIL)
print("uniform kappa(t) lower bound on |t|<=D:", LOCAL_LOWER)
print("kappa(3A) upper bound, with 3A>D:", LAG3A_UPPER)
print("(1-D_t^2)^2 k0 at t=3/5, upper bound:", BASE_LAG_UPPER)
print("smooth shifted-Xi multiplier obstruction: PASS")
