# Cycle 009 theorem-first finite-field catalog

Purpose: force the Two-Universes loop to start from exact finite-field theorems and classify transport before any new integer experiment.

## Decision-Relevant Summary

- Sources: 6
- Catalog entries: 9
- Honest-open integer analogues: carmon-rudnick-large-q-chowla, sawin-shusterman-chowla-uniform, sawin-shusterman-twin-irreducibles
- Immediately experiment-eligible entries: none
- Next required artifact: cycle-010 proof-obligation map for honest-open theorem families before any new integer experiment

## Transport Classes

| class | count |
| --- | ---: |
| honest-integer-analogue-known | 1 |
| finite-field-complete-family-only | 1 |
| no-honest-integer-transport | 2 |
| honest-integer-analogue-open | 3 |
| obstruction-or-coefficient-space-only | 1 |
| finite-field-obstruction-no-classical-analogue | 1 |

## Catalog

| id | family | transport | status | experiment eligibility | source ids |
| --- | --- | --- | --- | --- | --- |
| gauss-necklace-irreducible-count | prime-polynomial-count | honest-integer-analogue-known | known calibration, not a discovery target | no: No honest open integer analogue that can seed an experiment. | localImplementation |
| complete-degree-shell-mobius-sum | mobius-complete-family | finite-field-complete-family-only | exact calibration, no honest transport as an experiment | no: No honest open integer analogue that can seed an experiment. | localImplementation |
| pellet-mobius-discriminant | mobius-discriminant-character | no-honest-integer-transport | finite-field mechanism only | no: No honest open integer analogue that can seed an experiment. | carmonRudnick2012 |
| berlekamp-characteristic-two-mobius | mobius-discriminant-character | no-honest-integer-transport | finite-field mechanism only | no: No honest open integer analogue that can seed an experiment. | carmonChar2, conradMobiusResidue |
| carmon-rudnick-large-q-chowla | chowla-mobius-correlation | honest-integer-analogue-open | proof-target family, not a numeric-discovery family | no: Honest analogue exists, but related experimental families already failed controls in cycle-006, cycle-008; require proof-obligation map before new data. | carmonRudnick2012 |
| sawin-shusterman-chowla-uniform | chowla-mobius-correlation | honest-integer-analogue-open | major theorem-side target, but integer side remains open | no: Honest analogue exists, but related experimental families already failed controls in cycle-005, cycle-006, cycle-008; require proof-obligation map before new data. | sawinShusterman2022 |
| sawin-shusterman-twin-irreducibles | prime-tuples | honest-integer-analogue-open | major theorem-side target, but not a current experimental survivor | no: Honest analogue exists, but related experimental families already failed controls in cycle-002, cycle-003, cycle-004, cycle-005, cycle-007; require proof-obligation map before new data. | sawinShusterman2022 |
| kurlberg-rosenzweig-very-short-intervals | very-short-intervals | obstruction-or-coefficient-space-only | intuition source and negative control catalog | no: No honest open integer analogue that can seed an experiment. | kurlbergRosenzweig2018 |
| conrad-residue-theorem-obstruction | finite-field-bouniakowsky-obstruction | finite-field-obstruction-no-classical-analogue | negative transport guard | no: No honest open integer analogue that can seed an experiment. | conradMobiusResidue |

## Theorem Statements

### gauss-necklace-irreducible-count

Statement: For monic irreducibles of degree n over F_q, I_q(n) = (1/n) * sum_{d|n} mu(d) q^(n/d).

Finite-field object: degree shell of monic irreducible polynomials in F_q[t]

Integer analogue: prime number theorem scale pi(x) ~ x/log x

Promotion risk: Known theorem on the finite-field side and known/asymptotic theorem on the integer side; cannot be promoted as new.

Next use: Use only as a sanity check for irreducible table construction and normalization.

### complete-degree-shell-mobius-sum

Statement: For monic degree shells, sum_{deg F=n} mu(F) is 1 at n=0, -q at n=1, and 0 for n>=2.

Finite-field object: all monic polynomials of fixed degree

Integer analogue: Mertens/PNT-style cancellation is not a complete-family identity over Z

Promotion risk: The exact zero is caused by the rational zeta function of F_q[t]; an integer partial sum is not the same object.

Next use: Use as a guard against treating complete-family cancellation as an integer-prime discovery.

### pellet-mobius-discriminant

Statement: For odd q, polynomial Mobius parity is (-1)^deg(F) times the quadratic character of Disc(F), with zero on repeated-root cases.

Finite-field object: discriminant character on coefficient space

Integer analogue: no coefficient-space discriminant character controls integer primality or integer Mobius values

Promotion risk: This explains finite-field Mobius parity but was already rejected because the coefficient-neighborhood object has no honest Z analogue.

Next use: Use only for finite-field mechanism explanation and novelty audits.

### berlekamp-characteristic-two-mobius

Statement: In characteristic 2, Berlekamp/Artin-Schreier-style discriminant data replaces the odd-characteristic quadratic discriminant character.

Finite-field object: Berlekamp discriminant / trace data over characteristic-2 coefficient space

Integer analogue: no direct integer counterpart to characteristic-2 Artin-Schreier trace parity

Promotion risk: A characteristic-2 mechanism can be exact and still be non-transportable to Z.

Next use: Use as a guard against mixing q=2 effects into an alleged integer law.

### carmon-rudnick-large-q-chowla

Statement: For fixed degree n and fixed distinct shifts, the normalized Mobius autocorrelation over monic degree-n polynomials tends to 0 as q grows.

Finite-field object: Mobius products over shifted monic degree shells

Integer analogue: Chowla correlations for integer Mobius/Liouville shifts

Promotion risk: Cycle 008 found no integer signal above controls; computation can only support a conjectural audit, not a theorem.

Next use: If pursued, write a proof-obligation map from finite-field character sums to an integer substitute before running more data.

### sawin-shusterman-chowla-uniform

Statement: Chowla k-point correlations over F_q[T] hold with large uniformity in shifts under the paper's finite-field hypotheses.

Finite-field object: higher-order Mobius products over polynomial shifts

Integer analogue: integer Chowla conjecture for k-point Mobius/Liouville correlations

Promotion risk: Previous additive-shift and multiplicative-sign cycles did not find a control-surviving integer candidate.

Next use: Use to derive proof obligations rather than another aggregate correlation plot.

### sawin-shusterman-twin-irreducibles

Statement: Twin irreducible polynomial counts over F_q[T] are proved in quantitative form under the paper's finite-field hypotheses.

Finite-field object: irreducible pairs F and F+A with fixed nonzero polynomial shift A

Integer analogue: Hardy-Littlewood prime-pair / twin-prime conjectures over Z

Promotion risk: Earlier prime-indicator additive-shift and quotient cycles were absorbed by local/composite/field controls.

Next use: Only restart if the transport map names a new proof ingredient, not a new visualization.

### kurlberg-rosenzweig-very-short-intervals

Statement: For generic Morse polynomial centers, very-short-interval prime and Mobius correlations have square-root-size errors; non-generic cases can fail badly.

Finite-field object: coefficient-line intervals I(f) = {f+a : a in F_q}

Integer analogue: integer short intervals have no direct coefficient-line parameter and no Morse/genericity condition

Promotion risk: Coefficient-space intervals can create finite-field artifacts if treated as integer short intervals.

Next use: Use the non-generic exceptions as a mutation source: search for explicit obstruction classes, not universal visual patterns.

### conrad-residue-theorem-obstruction

Statement: Some finite-field polynomial-prime-value analogues fail due to global Mobius/residue obstructions with no classical local-obstruction counterpart.

Finite-field object: polynomial values f(g) over kappa[u] and their Mobius-value statistics

Integer analogue: none known; the source explicitly contrasts this with expected integer Mobius averages

Promotion risk: A finite-field obstruction can be a real theorem and still be evidence against a two-universe law.

Next use: Treat finite-field-only obstructions as vetoes unless a precise integer substitute is named.

## Sources

| id | title | authors | venue | url | role |
| --- | --- | --- | --- | --- | --- |
| sawinShusterman2022 | On the Chowla and twin primes conjectures over F_q[T] | Will Sawin, Mark Shusterman | Annals of Mathematics 196 (2022), 457-506 | https://annals.math.princeton.edu/2022/196-2/p01 | large-uniformity Chowla k-point correlations and quantitative twin irreducibles over F_q[T] |
| carmonRudnick2012 | The autocorrelation of the Mobius function and Chowla's conjecture for the rational function field | Dan Carmon, Zeev Rudnick | Quarterly Journal of Mathematics / arXiv:1205.1599 | https://arxiv.org/abs/1205.1599 | large-q Mobius autocorrelation / Chowla theorem in odd characteristic |
| carmonChar2 | The autocorrelation of the Mobius function and Chowla's conjecture for the rational function field in characteristic 2 | Dan Carmon | arXiv:1409.3694 | https://arxiv.org/pdf/1409.3694 | characteristic-2 Chowla analogue using Berlekamp-style discriminant data |
| kurlbergRosenzweig2018 | Prime and Mobius correlations for very short intervals in F_q[x] | Par Kurlberg, Lior Rosenzweig | arXiv:1802.01215 | https://arxiv.org/abs/1802.01215 | very-short-interval prime/Mobius correlations, generic Morse cases, and non-generic failures |
| conradMobiusResidue | The Mobius function and the residue theorem | Brian Conrad, Keith Conrad | expository article | https://kconrad.math.uconn.edu/articles/mobresidue.pdf | finite-field Bouniakowsky obstruction and Mobius-value phenomena with no classical analogue |
| localImplementation | PrimeVisuals function-field arithmetic kernel | local repository | src/core/ffield.js | src/core/ffield.js | exact finite polynomial arithmetic, Mobius, Liouville, irreducible tables, and two-point evaluators |

JSON: `logs/two-universes-protocol/cycle-009-theorem-first-finite-field-catalog.json`
SVG: `logs/two-universes-protocol/cycle-009-theorem-first-finite-field-catalog.svg`
