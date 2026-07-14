#!/usr/bin/env python3
"""Near-sharp Hall cut for the downstream S_{.5}->S_{.1} stage.

Put

    c(u,v)=|m|+(r-2|m|)_+/4,  m=(u+v)/2, r=|u-v|,
    S_d={(u,v): c(u,v)<=2/5 or r<=d}.

The rational source box

    x in [5999999/10000000,6000001/10000000],
    y in [9999999/10000000,10000001/10000000]

    lies around (3/5,1) in S_{.5} minus S_{.1}.  Define the target-coordinate cut

    A=(-infinity,-17/20] union [89/100,infinity),
    B=[-19/20,99/100].

It covers S_{.1}: if c<=2/5 then |v|<=4/5, hence v is in B.  Otherwise
|u-v|<=1/10.  If v<-19/20 then u<-17/20, and if v>99/100 then
u>89/100.  Thus every selected pair event into S_{.1} consumes either an
x-marginal jump into A or a y-marginal jump into B.

This script upper-bounds both *complete* marginal capacities, including the
unbounded archimedean and prime-power tails, uniformly on the source box.
It proves their sum is below 25001/50000.  Therefore no coupling can supply a
uniform S_{.1}-entrance reserve of 2*10^(-5) above one half on this box.  This
does not obstruct a kappa-dependent construction for each kappa<1/2.

Reproduction:

    PYTHONPATH=/tmp/pvdeps:scripts python3 -u \
      scripts/coupling_s05_s01_hall_cut_certificate.py
"""

from flint import arb, ctx


ctx.prec = 200


def q(p: int, d: int = 1) -> arb:
    return arb(p) / d


PI = arb.pi()
X_LEFT = q(5_999_999, 10_000_000)
X_RIGHT = q(6_000_001, 10_000_000)
Y_LEFT = q(9_999_999, 10_000_000)
Y_RIGHT = q(10_000_001, 10_000_000)
A_NEG = -q(17, 20)
A_POS = q(89, 100)
B_LEFT = -q(19, 20)
B_RIGHT = q(99, 100)
TRUNCATION = arb(2)
PIECES = 131_072
CAPACITY_CEILING = q(25_001, 50_000)


def C(x: arb) -> arb:
    return (x / 2).cosh()


def J(h: arb) -> arb:
    assert h > 0
    return (-h / 2).exp() / (1 - (-2 * h).exp())


first_tail = 20 * arb(5) ** 4 * (-arb(3) * 25).exp()
tail_ratio = q(6, 5) ** 4 * (-arb(3) * 11).exp()
theta_tail_bound = first_tail / (1 - tail_ratio)
assert theta_tail_bound < arb("1e-28")
K_TAIL = arb(0, "1e-28")


def K_positive(t: arb) -> arb:
    """Positive-branch Riemann-kernel enclosure for t>=0."""

    assert t >= 0
    total = arb(0)
    for n in range(1, 5):
        nn = arb(n * n)
        w = PI * nn * (2 * t).exp()
        total += PI * nn * (q(5, 2) * t).exp() * (2 * w - 3) * (-w).exp()
    return total + K_TAIL


def arch_interval_upper(
    source_left: arb,
    source_right: arb,
    target_left: arb,
    target_right: arb,
    target_below_source: bool,
) -> arb:
    """Monotone Darboux upper sum, with a source-box envelope."""

    assert target_right > target_left
    if target_below_source:
        assert target_right < source_left
    else:
        assert target_left > source_right
    width = (target_right - target_left) / PIECES
    total = arb(0)
    denominator = C(source_left)
    for index in range(PIECES):
        left = target_left + index * width
        right = left + width
        # Each caller splits at zero.  K is even and decreases with |z|.
        # Arb may outward-round the shared zero endpoint across zero by one
        # ulp; using K(0) on that cell is then the safe upper envelope.
        if right < 0:
            closest_abs = abs(right)
        elif left > 0:
            closest_abs = abs(left)
        else:
            closest_abs = arb(0)
        if target_below_source:
            closest_distance = source_left - right
        else:
            closest_distance = left - source_right
        upper = (
            K_positive(closest_abs) * J(closest_distance) / denominator
        ).upper()
        total += arb(upper) * width
    return total


def kernel_tail_integral_upper() -> arb:
    """Upper bound for integral_2^infinity K(t)dt."""

    u0 = (2 * TRUNCATION).exp()
    denominator = 1 - 16 * (-3 * PI * u0).exp()
    assert denominator > 0
    # K(t)<=2*pi^2 exp(9t/2-pi exp(2t))/denominator.
    # With u=exp(2t), u^(5/4)<=u^2 for u>=1.
    polynomial_tail = (-PI * u0).exp() * (
        PI * u0**2 + 2 * u0 + 2 / PI
    )
    return polynomial_tail / denominator


def arch_A_upper() -> arb:
    compact = arch_interval_upper(
        X_LEFT, X_RIGHT, -TRUNCATION, A_NEG, True
    )
    compact += arch_interval_upper(
        X_LEFT, X_RIGHT, A_POS, TRUNCATION, False
    )
    k_tail = kernel_tail_integral_upper()
    negative_tail = k_tail * J(X_LEFT + TRUNCATION) / C(X_LEFT)
    positive_tail = k_tail * J(TRUNCATION - X_RIGHT) / C(X_LEFT)
    return compact + negative_tail + positive_tail


def arch_B_upper() -> arb:
    # Both signed pieces lie strictly below the complete y-source box.
    return arch_interval_upper(
        Y_LEFT, Y_RIGHT, B_LEFT, arb(0), True
    ) + arch_interval_upper(
        Y_LEFT, Y_RIGHT, arb(0), B_RIGHT, True
    )


def prime_B_upper() -> arb:
    """Complete prime-power capacity from Y into B."""

    total = arb(0)
    for power, prime in ((2, 2), (3, 3), (4, 2), (5, 5), (7, 7)):
        log_power = arb(power).log()
        target_left = Y_LEFT - log_power
        target_right = Y_RIGHT - log_power
        assert target_left > B_LEFT and target_right < B_RIGHT
        closest_abs = min(abs(target_left), abs(target_right))
        total += (
            arb(prime).log()
            / arb(power).sqrt()
            * K_positive(closest_abs)
            / C(Y_LEFT)
        )
    # q=8 has already left through the lower endpoint; positive directions
    # start above the upper endpoint.
    assert Y_RIGHT - arb(8).log() < B_LEFT
    assert Y_LEFT + arb(2).log() > B_RIGHT
    return total


def prime_A_finite_upper() -> arb:
    """Overcount all integer labels through 16; Lambda(n)<=log(n)."""

    total = arb(0)
    denominator = C(X_LEFT)
    for n in range(2, 17):
        logn = arb(n).log()
        # Every positive orientation belongs to A.
        positive_target_min = X_LEFT + logn
        assert positive_target_min > A_POS
        total += logn / arb(n).sqrt() * K_positive(positive_target_min) / denominator
        # Negative orientations belong to A from n=5 onward.
        if n >= 5:
            negative_abs_min = logn - X_RIGHT
            assert negative_abs_min > -A_NEG
            total += logn / arb(n).sqrt() * K_positive(negative_abs_min) / denominator
    return total


def prime_A_tail_upper() -> arb:
    """Overcount both orientations and all integer labels n>=17."""

    n = arb(17)
    t0 = n.log() - X_RIGHT
    u0 = (2 * t0).exp()
    theta_denominator = 1 - 16 * (-3 * PI * u0).exp()
    assert theta_denominator > 0
    a = PI * (-2 * X_RIGHT).exp()
    constant = (
        2
        * 2
        * PI**2
        * (-q(9, 2) * X_RIGHT).exp()
        / theta_denominator
        / C(X_LEFT)
    )
    first = arb(17).log() * arb(17) ** 4 * (-a * 17**2).exp()
    ratio = (
        arb(18).log()
        / arb(17).log()
        * q(18, 17) ** 4
        * (-a * (18**2 - 17**2)).exp()
    )
    assert ratio < 1
    return constant * first / (1 - ratio)


def main() -> None:
    arch_a = arch_A_upper()
    prime_a_finite = prime_A_finite_upper()
    prime_a_tail = prime_A_tail_upper()
    capacity_a = arch_a + prime_a_finite + prime_a_tail

    arch_b = arch_B_upper()
    prime_b = prime_B_upper()
    capacity_b = arch_b + prime_b
    hall_capacity = capacity_a + capacity_b
    assert hall_capacity < CAPACITY_CEILING

    print("precision_bits:", ctx.prec)
    print("source_x_box: [5999999/10000000,6000001/10000000]")
    print("source_y_box: [9999999/10000000,10000001/10000000]")
    print("target_S_.1: c<=2/5 or r<=1/10")
    print("Hall_A: (-infinity,-17/20] union [89/100,infinity)")
    print("Hall_B: [-19/20,99/100]")
    print("A_arch_upper:", arch_a)
    print("A_prime_finite_integer_overcount:", prime_a_finite)
    print("A_prime_tail_upper:", prime_a_tail)
    print("A_complete_capacity_upper:", capacity_a)
    print("B_arch_upper:", arch_b)
    print("B_prime_exact:", prime_b)
    print("B_complete_capacity_upper:", capacity_b)
    print("Hall_total_capacity_upper:", hall_capacity)
    print("Hall_reserve_below_25001/50000:", CAPACITY_CEILING - hall_capacity)
    print("certificate: PASS")


if __name__ == "__main__":
    main()
