# Cycle 010 proof-obligation map

Purpose: convert honest-open finite-field theorem families into explicit missing integer proof ingredients before any new experiment.

## Summary

- Obligations: 3
- Blocked obligations: 3
- Potential proof routes with all known substitutes: 0
- Major open substitute lemmas: 5
- Not-transportable ingredients: 1
- Experimentally actionable obligations: 0
- Next required artifact: cycle-011 explicit obstruction-class transport map or a named weaker lemma that is not equivalent to Chowla/twin-prime conjectures

## Obligation Table

| id | catalog entry | decision | integer statement | blocker |
| --- | --- | --- | --- | --- |
| carmon-rudnick-large-q-chowla-proof-map | carmon-rudnick-large-q-chowla | blocked | For fixed distinct shifts h_1,...,h_k, sum_{n<=X} mu(n+h_1)...mu(n+h_k)=o(X). | The missing integer substitute is the Chowla conjecture itself, not a smaller data-testable lemma. |
| sawin-shusterman-chowla-uniform-proof-map | sawin-shusterman-chowla-uniform | blocked | Uniform higher-order Chowla correlations for integer Mobius/Liouville over fixed and structured shift families. | The proof ingredient that matters is a major open uniform Chowla substitute; previous data-first variants were absorbed by controls. |
| sawin-shusterman-twin-irreducibles-proof-map | sawin-shusterman-twin-irreducibles | blocked | Hardy-Littlewood twin/prime-pair asymptotics for fixed admissible shifts. | After local admissibility is handled, the remaining missing ingredient is the open prime-tuple theorem itself. |

## carmon-rudnick-large-q-chowla-proof-map

Finite-field theorem input: Fixed degree n, fixed distinct polynomial shifts, q odd and growing; Mobius products over monic degree-n shells cancel in the large-q limit.

Proof ingredients:

| ingredient | finite-field role | integer substitute | status |
| --- | --- | --- | --- |
| Pellet discriminant character | Convert polynomial Mobius parity into a quadratic character of a discriminant. | No coefficient-space discriminant character exists for integer Mobius products. | not-transportable |
| square-independence of shifted discriminants | Show the character product is not a square, enabling cancellation. | Uniform cancellation of shifted Mobius products over intervals. | open-major-conjecture |
| Weil character-sum cancellation | Provide square-root cancellation for nontrivial character sums over coefficient space. | Power-saving cancellation for shifted Mobius correlations. | open-major-conjecture |

Prior evidence: cycle-006 signed profiles failed; cycle-008 fixed-lag Mobius/Liouville controls failed on Z

Next allowed action: Do not run another aggregate Mobius-correlation experiment unless a strictly weaker, fixed, testable substitute lemma is named first.

## sawin-shusterman-chowla-uniform-proof-map

Finite-field theorem input: Uniform Chowla-type Mobius correlations over F_q[T] for high-degree polynomials and large families of shifts under finite-field hypotheses.

Proof ingredients:

| ingredient | finite-field role | integer substitute | status |
| --- | --- | --- | --- |
| algebraic-geometry equidistribution / monodromy control | Turn polynomial shift families into controlled geometric families with equidistributed Frobenius data. | An integer mechanism producing comparable independence of shifted Mobius signs. | open-major-conjecture |
| uniformity over many shifts | Prevent the theorem from being a single hand-picked shift identity. | Uniform Chowla estimates across structured shift sets. | open-major-conjecture |
| finite-field local obstruction accounting | Separate genuine Mobius cancellation from squarefactor/repeated-root obstructions. | Squarefactor/local obstruction conditioning, already tested in local tensor cycles. | tested-no-breakthrough |

Prior evidence: cycle-005 exact admissibility tensor rejected; cycle-006 signed profile rejected; cycle-008 multiplicative signs rejected

Next allowed action: Only proceed after isolating a narrower missing lemma that is not equivalent to uniform Chowla.

## sawin-shusterman-twin-irreducibles-proof-map

Finite-field theorem input: Quantitative counts of irreducible pairs F and F+A over F_q[T] under finite-field hypotheses.

Proof ingredients:

| ingredient | finite-field role | integer substitute | status |
| --- | --- | --- | --- |
| finite-field tuple equidistribution | Control simultaneous irreducibility of shifted polynomial families after local obstructions are removed. | Uniform Hardy-Littlewood prime-tuple estimates with power-saving control. | open-major-conjecture |
| exact local obstruction removal | Account for repeated-root and congruence obstructions in polynomial tuples. | Admissibility and singular-series correction. | known-but-insufficient |
| degree-shell normalization | Use degree n as the scale and compare counts inside a complete finite shell. | Log-scale normalization for primes up to X or in windows. | known-but-insufficient |

Prior evidence: cycle-002 fixed-shift graph rejected; cycle-003/004/005 local tensor leads not promoted/rejected; cycle-007 quotient spectral residual rejected

Next allowed action: Do not rerun prime-pair visuals; only a new lemma that beats local/composite controls and has a proof route can reopen this family.

JSON: `logs/two-universes-protocol/cycle-010-proof-obligation-map.json`
SVG: `logs/two-universes-protocol/cycle-010-proof-obligation-map.svg`
