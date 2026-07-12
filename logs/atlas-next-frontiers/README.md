# Three kill-resistant field-level frontiers

Date: 2026-07-12

> The first round initially parked one mechanism, but its later full-degree
> [breakthrough gate](./free-boundary-maynard-49/BREAKTHROUGH_GATE.md) failed.
> No field-level theorem or privileged mechanism now survives this portfolio.
> This file preserves the frozen targets and gates used for the search.

## Scope and honesty rule

No open research program can be guaranteed to survive.  These three are
**kill-resistant**, not kill-proof: each begins with a native, literature-
calibrated theorem statement whose success is already field-level.  None asks a
finite residual, plot, or analogy to promote itself into a theorem.

The mechanisms can still fail.  If they do, the failure must be recorded at a
named analytic or variational obstruction rather than reported as evidence
against an unrelated mathematical target.

## What the previous five campaigns taught us

The Atlas was shortsighted in six recurring ways.

1. **Observable-first rather than lemma-first.**  We searched for unusual
   residuals and only later asked what theorem could control them.
2. **Fixed labels masquerading as new structure.**  Fixed-cover Frobenius data
   factored through congruence classes, and complete family moments factored
   through known trace formulas.
3. **Basis failure was confused with target failure.**  The killed Maynard run
   tested a constant-generated Krylov basis, not the boundary geometry relevant
   to the best consequence.
4. **The optimization target had no consequence elasticity.**  A better
   `M_54` margin would not change the known numerical gap bound.
5. **Secondary terms were requested without a secondary-scale mechanism.**  In
   ABAC, current leading-scale estimates lose an entire factor `H`; another
   kernel or larger experiment cannot recover it.
6. **Programs were one-sided.**  A failed lower witness or null residual left
   only a dead end.  Better programs maintain lower and upper certificates or a
   classified obstruction, so negative progress narrows the theorem itself.

The replacement rule is:

> Freeze the theorem and its consequence first; name the one genuinely new
> estimate or certificate that would prove it; measure progress on that object.

---

## Frontier A — free-boundary Maynard 49

### Exact theorem target

Find rational `epsilon>0`, rational `eta>0`, and an explicit symmetric
piecewise-rational-polynomial `F`, supported on

`(1+epsilon) Delta_49 = {t_i>=0 : sum_i t_i <= 1+epsilon}`,

such that

`sum_i J_(i,1-epsilon)(F) / I(F) >= 4+eta`.

This is the exact certificate `M_(49,epsilon)>4`.  Through the enlarged-support
Polymath8b sieve theorem and a checked admissible 49-tuple of diameter 240, it
would prove unconditionally

`liminf_(n->infinity) (p_(n+1)-p_n) <= 240`.

That changes the accepted `246` bound.  Unlike the killed `k=54` run, every
successful certificate changes a prime theorem immediately.

### Missing mechanism

Build the enlarged-simplex operator in symmetry-orbit coordinates with an
adaptive polyhedral finite-element basis whose cells respect the discontinuity
hyperplanes

`sum_(j!=i) t_j = 1-epsilon`.

Use high precision only to propose a function.  Integrate each rational cell
exactly, round to rational coefficients, and verify the Rayleigh quotient with
integer arithmetic.  Maintain certified two-sided enclosures

`L_d <= M_(49,epsilon) <= U_d`.

The novelty is support geometry: unrestricted signatures, boundary-adapted
piecewise polynomials, and continuation of the published `k=50` witness to
`k=49`.  It is not a deeper Krylov ladder.

### Gates and progress

1. Exactly reproduce the published `M_(50,1/25)>4.0043` certificate.
2. Show a material boundary-adapted gain at `k=50` before attempting `k=49`.
3. Shrink `U_d-L_d` monotonically under mesh/basis refinement.
4. Require floating margin at least `1e-5`, then two independent exact rational
   evaluations.
5. Mechanically verify the 49-tuple and the full theorem implication.

Progress is the certified interval around 4, not the number of basis rows.

Primary calibration:

- [Polymath8b, enlarged-simplex variational problems](https://arxiv.org/abs/1407.4897)
- [MIT narrow admissible 49-tuple of diameter 240](https://math.mit.edu/~primegaps/tuples/admissible_49_240.txt)
- [Stadlmann, later prime-distribution improvements](https://arxiv.org/abs/2309.00425)

---

## Frontier B — signed Type-II packet dispersion

### Exact theorem target

Let `a(n)=Lambda(n)-1`.  For

`P(z)=product_(p<=z) p`,

`Lambda_z#(n)=P(z)/phi(P(z)) 1_((n,P(z))=1)`,

put `a_z#=Lambda_z#-1`.  Let `tau_H` be the unit triangular tent on
`1<=h<2H` and let `W` be a fixed smooth function supported in `(1,2)`.

Prove that, for every fixed `epsilon,A>0` and a suitable
`z=(log X)^B`,

`sum_h tau_H(h) sum_n W(n/X)`

`  * [a(n)a(n+h)-a_z#(n)a_z#(n+h)]`

`<< X/(log X)^A`

uniformly for

`X^(1/3+epsilon) <= H <= X^(1/2-epsilon)`.

This gains the exact missing factor `H` over leading-scale averaged
Hardy--Littlewood error technology.  It would prove the adjacent-block prime
anticorrelation law, including its `log 2` constant, on a nonempty polynomial
range.

### Missing mechanism

The operative rule is **sum the shift packet before taking absolute values or
applying Cauchy--Schwarz**.

1. Apply a Heath--Brown identity while retaining the actual prime-detecting
   coefficient classes.
2. Detect `m_1 n_1-m_2 n_2=h` with a delta method.
3. Sum `h` against the complete tent packet first; Poisson summation turns it
   into a localized Fejer/sinc-squared dual packet.
4. Cancel the zero/low-conductor modes against `a_z#` algebraically.
5. Apply Kuznetsov and the spectral large sieve once to the whole packet, using
   orthogonality between dual modes rather than estimating `H` modes
   separately.
6. Classify exceptional low-conductor modes by entropy-decrement/pretentious
   methods and show that they belong to the subtracted local model.

### Gates and progress

1. Exact zero-mode and local-character cancellation before any norm bound.
2. Reproduce a known power-saving tent estimate for a divisor-function
   surrogate.
3. Achieve `O(X log^(-A)X)` on one balanced genuine Heath--Brown Type-II box.
4. Search adversarial allowed coefficients for a rational/spectral resonator;
   generic large-sieve saturation kills the proposed packet gain.
5. No RH, Elliott--Halberstam, pair correlation, or target remainder may enter
   the proof.
6. The output must cover a fixed polynomial interval of `H`.

Progress is the exponent of `H` remaining in the balanced Type-II box.  It must
reach zero.

Primary frontier:

- [Matomaki--Radziwill--Shao--Tao--Teravainen, 2026 revision](https://arxiv.org/abs/2411.05770)
- [Tao, logarithmically averaged two-point Chowla](https://arxiv.org/abs/1509.05422)
- [Montgomery--Soundararajan, refined prime variance](https://arxiv.org/abs/math/0409258)

---

## Frontier C — the Frobenius prime graph

### Exact theorem target

Fix the explicit non-CM curve

`E_0 : y^2+y=x^3-x`.

Draw a directed edge `p -> q` when `p` is a good prime and

`q=#E_0(F_p)=p+1-a_p(E_0)`

is prime.  Let `pi_(E_0,2)(X)` count normalized reciprocal edges
`p<q`, `p<=X`, with both `p->q` and `q->p`.  Prove

`pi_(E_0,2)(X) ~ C_(E_0,2) sqrt(X)/(log X)^2`,

where Jones's explicit adelic constant satisfies `C_(E_0,2)>0`.

This would prove the first fixed non-CM instance of Koblitz prime-order
reduction for this curve and the strictly stronger reciprocal-return law.

### Why the old disguise kills do not apply

Writing `h=q-p`, the two-cycle conditions are

`a_p=1-h` and `a_(p+h)=1+h`,

summed over the growing Hasse window `|h|<=2 sqrt(p)`.  The shift is generated
by Frobenius and the return samples Frobenius again in a different
characteristic.  It is neither a fixed congruence partition nor a complete
family trace moment.

### Missing mechanism

Develop a reciprocal Frobenius dispersion estimate for the two-characteristic,
moving Lang--Trotter sum over the Hasse window.  The proposed staircase is:

1. reproduce the known curve-family mean and its local constant;
2. prove a second moment/concentration theorem over curve boxes;
3. prove concentration over the quadratic twists of `E_0`;
4. introduce an amplifier that removes the twist average for `E_0`.

The analytic ingredients must combine exact trace detection, division-field
character expansions for finite-place entanglement, automorphic/symmetric-
power control of archimedean Frobenius distribution, and a spectral dispersion
large sieve over the Hasse-scale shift.

### Gates and progress

1. Compute the adelic constant first; a zero constant kills the curve.  Use a
   known zero-constant curve as a hostile control.
2. The mechanism must distinguish prime `#E(F_p)` from semiprime order.  Failure
   is a parity kill.
3. If the Hasse-window sum factors into fixed-congruence Hardy--Littlewood cells
   after conditioning, the mechanism is killed.
4. The curve-family second moment must be `o(mean^2)`; main-sized shared-prime
   covariance kills the concentration staircase.
5. CM controls must behave differently, including the known obstruction to
   longer cycles.
6. Fixed-curve promotion is forbidden until the twist amplifier has a proved
   saving.

Progress is movement down the de-averaging staircase, not the count of observed
cycles.

Primary calibration:

- [Jones, exact constants and positivity](https://arxiv.org/abs/1212.1010)
- [Silverman--Stange, elliptic aliquot cycles](https://arxiv.org/abs/0912.1831)
- [Parks, average amicable-pair asymptotic](https://arxiv.org/abs/1410.5888)
- [Zywina, corrected Koblitz constants](https://arxiv.org/abs/0909.5280)

---

## Portfolio order

1. **Run Frontier A first.**  It has an exact finite certificate, a direct
   unconditional consequence, and the shortest feedback loop.
2. **Develop Frontier B in parallel as an analytic lemma program.**  Its payoff
   is broader, but a single balanced Type-II box can falsify the mechanism.
3. **Treat Frontier C as the geometric moonshot.**  Begin with the family and
   twist-variance staircase; do not pretend finite cycles establish progress on
   the fixed-curve theorem.

These programs remain live only while their named certificate, packet estimate,
or de-averaging lemma advances.  Novel pictures and larger endpoint scans do not
count as progress.
