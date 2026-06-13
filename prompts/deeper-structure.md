# OPEN GOAL v2: a reformulation that TEACHES — deeper prime structure, not new coordinates

Supersedes prompts/novel-equivalent.md (completed as L2/E2 — verified
correct, judged content-free: a zero-free-multiplier twist of ψ; see
KNOWLEDGE.md). The reformulation must now tell us something about prime
patterns we could not say before. Stays open across sessions; resume from
a HANDOFF if one exists.
Log: `logs/<today>-deeper-structure.md`.

STILL OPEN. A prior run certified this complete via the Farey object
B_b(n); that certificate was REVOKED on audit — the "for every odd prime p"
signature is shared by composites 35, 65, 77, 91, 143, … so it is a
totient identity, not a prime pattern (criterion 3 fails). B_b(b)=φ(b) and
B_b(3b−1)=−φ(b)/2 (odd b) are true but prime-decorative. Do not resubmit
B_b(n); do not repeat the mistake.

## The lesson learned (read first)

Equivalences that are easy to derive are easy BECAUSE they are
content-free: any zero-free Dirichlet-multiplier twist of ψ or M yields an
"equivalent" with nothing inside. The celebrated equivalents are bridges
between DIFFERENT WORLDS: Robin (divisor sums), Nicolas (totients),
Franel–Landau (Farey fractions), Massias–Nicolas–Robin (maximal order of a
permutation). Their statements never test primality. Content lives exactly
where the derivation is hard.

## Completion criteria — ALL of them

1. **DIFFERENT WORLD.** The new object G is defined with NO primality test
   and no μ/Λ/prime-indexed sums. Divisibility, gcd, divisor sums, fractions,
   lattice points, permutations, continued fractions are allowed. The prime content must enter through the THEOREM, not
   the definition.
2. **FACTOR CHECK** (the upgraded disguise check). Write G's
   Dirichlet/generating series if it has one. If it factors as
   (catalog RH object) × (zero-free bounded multiplier), the candidate is
   dead on arrival — log it and move on. This is exactly how L2 failed.
3. **THE DICTIONARY MUST MOVE INFORMATION.** Produce at least one
   concrete, checkable statement about PRIME PATTERNS that is new to the
   catalogs and licensed by your bridge — "primes must <pattern>, with
   <quantitative bound>, because <world-B fact>", or the reverse
   direction. Verify it numerically at two ranges with properly integrated
   main terms and the Cramér contrast. Renaming a residual bound does not
   count: the statement must constrain something other than the *size* of
   a residual — spacings, sign patterns, ordering, geometry, extremal
   structure. **COMPOSITE CONTROL (mandatory):** test the statement on
   composites and semiprimes (25, 35, 49, 77, 91, 143, …). If any non-prime
   satisfies it, the primality hypothesis does no work and the criterion
   FAILS — this is exactly how the Farey certificate was revoked. A Cramér
   contrast does not substitute: random sparse sets miss 35/77/143 by
   construction and will wrongly "pass".
4. **DERIVATION.** The bridge itself: exact identities, named classical
   tools, both directions or honestly one-directional. Gaps marked
   CONJECTURAL keep the goal open but count as reportable progress.
5. **EXHIBIT + PHASE-4 PACK.** Implement G with tests so the human can see
   it live; shots and links; the statement Lean-stub-ready; a one-page
   expert pack ending with a section titled **WHAT THIS TEACHES ABOUT
   PRIMES** — three sentences, no jargon, that a non-specialist can
   evaluate. If you cannot write that section, criterion 3 is not met and
   the goal is open.

## Hunting grounds (different worlds with computable bridges)

- **Lattice visibility**: points (a,b) visible from the origin; the error
  in counting them is an exact Möbius sum — what do its sign patterns and
  extremes say, and what do the primes force *geometrically*?
- **Farey / Stern–Brocot**: gap patterns and discrepancy beyond
  Franel–Landau (the catalog landmark — quote it, then beat it on content).
- **Permutation orders**: Landau's g(n) is computable by dynamic
  programming; the MNR equivalence is cataloged — hunt the *patterns of
  the optimal partitions*, not the growth rate.
- **Continued fractions**: statistics of the Gauss map over rationals p/q.
- **Divisor-world extremes**: superabundant and colossally abundant
  structure beyond Robin's inequality itself.

## Rules

Same regime as before: NEW-OBJECT entries in KNOWLEDGE.md, full
derivations in the log, predeclared nulls, ≥5 Cramér seeds, no all-x
claims from finite data, HANDOFF when a session ends incomplete. One new
rule: after two sessions stuck on the same derivation gap, emit a
**STUCK PACK** — the gap stated precisely, what was tried, and the minimal
question an expert could answer. That is a valid deliverable and the
trigger to bring in a human mathematician.
