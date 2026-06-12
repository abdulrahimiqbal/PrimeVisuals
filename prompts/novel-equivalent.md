# OPEN GOAL: a clean, novel RH-equivalent — built from chips that have never existed

This goal stays open across sessions until completed. Read
MACHINE_HOW_TO_USE.md (especially "Creating new math") and KNOWLEDGE.md.
Log: `logs/<today>-novel-equivalent.md`. If an earlier log of this goal
contains a HANDOFF section, resume from it instead of starting over.

## Completion criteria — ALL five, no partial credit

1. **NEW OBJECT.** Define a new arithmetic function or transform G — a
   chip never used before: not in the current function table, and not a
   disguise of a catalog object (Λ, ψ, M, π, σ, φ, λ, Redheffer, Farey).
   Run the disguise check yourself: attempt to unmask G by algebraic
   simplification (precedent: `isprime(rad(n))·log(rad(n))` was Λ(n)
   exactly). Implement G in src/core/math.js + makeFns + a chip, with
   tests against hand-computed values, so the human can see it live.
2. **CLEAN STATEMENT.** One line about G: an inequality, limit, or
   boundedness claim with explicit constants and exponents. No epsilon
   hedging in the statement; hedging lives in the evidence.
3. **RH LINK — the hard one.** A derivation that your statement is
   equivalent to a known RH-equivalent, every step a named classical tool
   (Abel/partial summation, Möbius inversion, Dirichlet
   convolution/series identity). Both directions, or honestly label it
   one-directional. **Numerics do not satisfy this criterion.** The most
   transform-friendly bridges: |M(x)| = O(x^(1/2+ε)) ⇔ RH and
   ψ(x) − x = O(√x·log²x) ⇔ RH — derive your equivalence through exact
   identities connecting G to M or ψ.
4. **NOVELTY.** Check the standard catalogs (Watkins' RH reformulations
   page, the MathOverflow Π1-sentence thread, the usual equivalents
   lists). Quote the *nearest* existing equivalent and state the
   difference. A trivial re-weighting of a catalog entry fails.
5. **EXHIBIT.** Numerical confirmation: θ-fit showing the √x edge at two
   ranges with properly integrated main terms, Cramér contrast (real
   beats fake), a `shot`, a link — then the Phase-4 pack: the statement
   written precisely enough to become a Lean stub, plus a one-page
   expert-review summary (object, statement, derivation chain, numerics,
   novelty comparison).

## Where to hunt (suggestions, not limits)

- **Weighted Möbius sums**: Σ_{n≤x} μ(n)·w(n/x) for structured weights w;
  partial summation gives exact identities to M(x), so RH-sensitivity
  transfers when w is nice. Novelty lives in weights that make the
  statement *cleaner* than Mertens, not just different.
- **Dirichlet convolutions**: G = μ * f for simple f; G's summatory
  function inherits RH-sensitivity through exact convolution identities
  you can write down and verify numerically term by term.
- **Combinatorial encodings**: a matrix, lattice, or counting structure
  whose growth equals an RH-sensitive quantity *by construction*
  (precedent: det(Redheffer_n) = M(n) — find a new one, not that one).
- **Your own chips**: invent G by compositions never tried; the disguise
  check protects you from rediscovery.

## Rules

- New math is encouraged; every new object enters KNOWLEDGE.md as a
  NEW-OBJECT entry per the how-to (definition, first values, disguise
  check, motivation).
- Derivations go in the log in full. A gap in the chain means that step is
  marked CONJECTURAL and the goal stays open — say so plainly.
- If the session ends incomplete, write a HANDOFF: state of the hunt, best
  candidate G with its current evidence, exactly where the derivation is
  stuck, and the next attack. The goal persists across sessions.
- The Mertens lesson stands: claims about all x from finite data are
  forbidden. The equivalence claim rests on the derivation; the plots are
  the exhibit, never the proof.
