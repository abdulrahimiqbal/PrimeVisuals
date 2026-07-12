# P3 field-level attack: result and program reset

Date: 2026-07-12

Verdict: **THE FIELD-LEVEL ATTACK DOES NOT LAND / TARGET-IDENTITY GAP FOUND**.

This is a semantic kill of the attempted promotion, not a counterexample to
the localized Weil inequality and not evidence against the broader arithmetic
Hodge--transport program.

## What was attacked

The frozen P3 statement asks, for

`S={infinity,2}` and `a=(log 3)/2`,

for a native semilocal comparison

`Weil_S(g) >= Sonin_S(g) >= 0`

on the pole-neutral, zero-moment support class.  The attempted proof route
used the cutoff-free CvS/CCM localized Weil matrix, removed its rank-two pole
term, and sought a nonlocal Poincare or infinite Schur bound.

## The fixed-width statement is a legitimate intermediate theorem

The first circularity concern does not fire.  Yoshida's and Suzuki's
equivalences with RH require positivity or nondegeneracy for **every**
localization width.  Positivity at the single width `a=(log 3)/2` is therefore
not RH in disguise.  Suzuki states the quantifier explicitly in
[*Weil's quadratic form via the screw function*](https://arxiv.org/abs/2606.09096),
and likewise in
[*Aspects of the screw function corresponding to the Riemann zeta-function*](https://arxiv.org/abs/2206.03682).

## The decisive operator ledger

Three different operators had been treated as though they were one.

| object | exact meaning | what the existing finite matrices test |
| --- | --- | --- |
| `A_a` | localized Weil operator `W_0,2-W_R-sum W_p` | yes |
| `A_tilde_a` | pole-free operator `A_a-W_0,2` | only after subtracting the explicit rank-two pole matrix |
| `E_Sonin` | comparison remainder `A_a-T_Sonin` | no; no Sonin-trace matrix was assembled |

The pole term is

`W_0,2=2|C><C|-2|S><S|`,

with `C(x)=cosh(x/2)` and `S(x)=sinh(x/2)`.  On the pole-neutral class it
vanishes, so `A_tilde_a` and `A_a` have the same quadratic value there.  That
does **not** make either operator equal to `A_a-T_Sonin`; the Sonin trace is an
infinite-dimensional compressed-scaling trace, not the rank-two pole term.

This distinction is explicit in the sources:

- Connes--Consani prove the archimedean inequality by comparing the Weil
  functional with a compressed trace on classical Sonin space, not by deleting
  the zeta pole term: [*Weil positivity and trace formula, the archimedean
  place*](https://arxiv.org/abs/2006.13771).
- Connes--Consani--Moscovici construct native semilocal Sonin spaces and an
  isomorphism with the classical spaces, but describe comparison of the
  positive trace functional with the Weil functional as the next strategy:
  [*Zeta zeros and prolate wave operators*](https://arxiv.org/abs/2310.18423).
- The quasi-inner construction originally took `ker(u(F)_22)` as a definition
  and explicitly postponed its geometric semilocal identification:
  [*Quasi-inner functions and local factors*](https://arxiv.org/abs/2008.10974).

Therefore the sentence “equivalently, prove the pole-free Poincare
inequality” in the prior transport audit was not established.  It merged two
frameworks without the required comparison theorem, triggering the atlas's
own stop rule 6.

## What the analytic attack did establish

The separate localized-Weil lane remains alive but unproved.

1. Cutoff-free Arb `LDL^T` certificates prove positive **finite** Weil blocks
   through band `N=200` (dimension `401`).
2. The exact pole-neutral and Groskin `M_0`-neutral finite even-sector margins
   remain positive, about `9.65e-4` at band `N=400`.
3. The full finite minimum stabilizes numerically near `5.53e-8`; its dangerous
   vector is even and concentrated in the central modes.
4. The pole-free continuum potential is about `-3.08` at the center and drops
   to about `-3.53` when the prime-2 overlap turns on.  Pointwise potential
   positivity is decisively false.
5. High-frequency finite tail blocks have a substantial gap, but generic
   absolute-value, Hilbert--Schmidt, and Schur estimates lose the cancellation
   needed to control the low-tail coupling.  No uniform infinite bound was
   obtained.

Thus no localized Weil positivity theorem was proved either.  Even if that
tail proof were completed, it would prove a valuable fixed-width Weil theorem,
not the preregistered Sonin domination theorem.

## Additional constraint audit

The numerical report's “zero moment” is the finite-dictionary row

`M_0(v)=v_0+sqrt(2) sum_(k>=1) v_k`,

as defined in Groskin's pole-neutral source construction.  It must not be
identified with a semilocal Mellin-zero condition until an explicit transport
map proves that identification.  The pole-neutral row itself is exact for the
CvS/CCM finite dictionary; the zero-row comparison is a separate obligation.

## Why the attack does not promote

The preregistered theorem requires the operator `E_Sonin=A_a-T_Sonin`.  The
campaign has neither derived its kernel nor computed one of its finite
compressions.  Positivity of `A_a` cannot be substituted after the fact.

Status by claim:

- P2 arithmetic Rosati datum: retained.
- fixed-width `c=3` Weil positivity: plausible finite evidence, unproved.
- pole-free Perron/Dirichlet structure: useful existing structure, not the
  Sonin comparison.
- P3 Sonin domination: not yet at the sign stage because its comparison
  operator has not been constructed.
- field-level breakthrough: **not achieved**.

## Self-improvement extracted from the failure

The ordering of future attacks is changed permanently.

1. **Semantic kill before spectral kill.**  Verify the exact operator, domain,
   basis, normalization, and constraints before computing eigenvalues.
2. **No unproved “equivalently.”**  Every equivalence in an obligation graph
   must point to an identity, isometry, or comparison theorem with a source or
   proof artifact.
3. **Typed numerical artifacts.**  Every matrix report must declare
   `represents`, `domain`, `basis`, `constraints`, `comparisonMap`, and
   `promotionAllowed`.
4. **Split composite programs.**  Localized Weil positivity and Sonin
   domination now have separate theorem labels and cannot promote one another
   without a comparison arrow.
5. **Proof-chain promotion.**  A field-level claim requires a continuous chain
   from native carrier to exact form to infinite sign to independent
   consequence.  A missing edge blocks promotion even when downstream
   numerics are excellent.
6. **Same-level controls.**  Countermodels and finite kill tests must act on the
   actual comparison remainder, not merely on a neighboring Weil or pole-free
   form.

The mistake was not that the calculation was useless.  It was that we ran the
analytic kill test before the semantic one.  The calculation is retained as a
separate localized-Weil reconnaissance result.

## Next action

The rebooted preregistration is `P3_REBOOT_PREREGISTRATION.md`.  Its first
theorem is not positivity.  The projection/trace part has now been proved in
`P3_C0A_SONIN_PROJECTION_TRANSPORT.md`: the one-prime Sonin projection has an
exact bounded-multiplier formula, and its compressed trace is finite and
positive on the published archimedean admissibility class.  What remains is
P3-C0b: derive that trace in the same explicit basis as the Weil form and form
the independently checkable remainder.  Only after archimedean calibration
and finite consistency checks should a sign or tail attack resume.
