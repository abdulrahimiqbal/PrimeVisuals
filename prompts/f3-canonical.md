# GOAL: derive or kill — the F_3[t] Möbius-parity gap effect in canonical coordinates

Read COUNCIL2.md (Part III route G), the expert pack
(`logs/two-universes-artifacts/mobius-gap-expert-pack.md`), the cross-q
REFUTATION entry in KNOWLEDGE.md (2026-06-13 CORRECTION), and edge.md
§"Corrected target". Log: `logs/<today>-f3-canonical.md`. Self-contained
single sprint; every branch below ends the thread or promotes it.

## The object and its problem

What survives all audits: in F_3[t] with degree-n monic irreducibles
ordered by base-3 encoding, Corr(μ(f−t), next-gap | prev-gap > t) ≈ 0.022
plateau for n = 14..17 (z = 56 at n = 17, 6.64M samples; leakage, cyclic,
composite, squarefree, holdout controls all passed). What died: the
cross-q A/q² law (refuted — adjacent-degree sign flips in F_5/F_7;
predictions below the noise floor). The unresolved sin: the lexicographic
ordering is non-canonical, so there is no mechanism and no transport. The
council's verdict: this is the workshop's only unexplained object — spend
one rigorous sprint to give it one of three honest fates.

## The three fates (predeclared)

- **(a) PROMOTE**: the effect survives canonical recasting → it becomes a
  shifted prime–Möbius correlation over F_3[t] — the function-field
  shadow of the parity-breaking family `Σ Λ(n)μ(n+h)` (edge.md,
  Murty–Vatwani) — and merges into Sprint P2 of
  `prompts/parity-battery.md` as its theorem-side anchor.
- **(b) DERIVE**: a mechanism is found (finite algebra / character sum) →
  KNOWN-MATH closure, possibly a provable statement worth an expert note.
- **(c) KILL**: the canonical recast fails → the plateau was
  lexicographic-interval bookkeeping → CLOSED-ARTIFACT, thread closed.

## Steps

1. **Identity audit first** (cheap, decisive): Pellet/Stickelberger for
   odd characteristic gives μ(g) = (−1)^deg(g) · χ₃(disc(g)). Recompute
   the original statistic with the discriminant character in place of μ —
   it must match EXACTLY. Mismatch = implementation bug hunt before
   anything else. Match = the object is officially a
   discriminant-character/gap statistic, and the mechanism question
   becomes equidistribution of disc(f−t) along irreducible spacings.
2. **The canonical recast (the heart)**. Replace "next lexicographic gap"
   with short-interval irreducible counts, which are coordinate-free and
   Keating–Rudnick-canonical: N_h(f) = #{irreducible g : deg(g−f) < h}.
   Two forms, both predeclared:
   - (i) *faithful*: Corr(μ(f−t), N_h(f) − mean) over irreducible f of
     degree n, h = 1, 2, 3 — the original claim translated;
   - (ii) *bilinear/unconditional*: (1/3^n)·Σ_{deg f = n} μ(f)·(N_h(f+s) −
     mean) over ALL monic f, for a small predeclared shift list s — the
     literal shifted Λ·μ form.
   Power line first (n = 14..17 sample sizes are known from the pack);
   run with the established controls (cyclic, composite, local-wheel,
   degree-17-style holdout at the largest feasible degree).
   Verdicts: (i) and (ii) both survive → fate (a). (i) survives, (ii)
   null → the effect lives in the gap-tail conditioning — run one
   targeted artifact audit on the scrub itself before declaring (a) or
   (c). (i) dies → fate (c), write the CLOSED-ARTIFACT entry citing the
   cross-q correction as the family precedent.
3. **Exhaustive small degrees (mechanism probe)**: for n ≤ 7 every monic
   is enumerable (3^7 = 2187). Compute the statistic EXACTLY — no
   sampling, exact rational conditional means by μ-value. If the small-n
   exact values already show the plateau and admit small-denominator
   closed forms, the mechanism is finite algebra: attempt the derivation
   (fate b). Record the exact table regardless — it is the sharpest
   finite statement of the phenomenon either way.
4. **Power-gated transport (only if fate (a))**: compute the minimum
   detectable r at F_9 (the char-3 extension — Sawin–Shusterman's
   odd-characteristic mechanism suggests char, not size, is the variable)
   at reachable degrees. Run the F_9 test ONLY if the detectable floor is
   below a conservative predicted band; otherwise record LIMIT NAMED
   (measurement-resolution block, as the cross-q correction did) — do NOT
   repeat the cross-q sin of confirming predictions below the floor.

EXIT: exactly one fate recorded in KNOWLEDGE.md with CONNECTION lines to
the expert pack, the cross-q correction, and (if fate a) the parity
battery; the exact small-degree table logged; commit. If fate (a), append
the canonical restatement to the expert pack so the object's public form
is coordinate-free.

Honesty regime as always: predeclared thresholds and shift lists, matched
controls per claim, power lines before compute, STUCK PACK if the
derivation attempt stalls twice.
