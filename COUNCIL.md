# COUNCIL REPORT — beyond RH: the alternate path (June 2026)

The question put to the council: RH-grade precision about prime structure
exists via zeta (zeros, critical line). To reach the *same grade of truth*
by a genuinely different route — not a reformulation — which mathematical
territory should this workshop bet on?

Six memos were heard: five route advocates and a devil's advocate. All
claims below were citation-checked by the council members. Full memos are
archived in the session record; this report keeps the load-bearing facts.

## The routes and their scores

| Route | Experiment-now | Track record | Ceiling | Access | DA's expected value |
|---|---|---|---|---|---|
| A. Spectral / Hilbert–Pólya / RMT | 7 | 8 | 6 | 5 | 1 |
| B. Function-field / F1 geometry | 7 | 9 | 6 | 5 | 1 |
| C. Dynamics / ergodic / Sarnak–Chowla | 7 | 9 | 6 | 5 | 2 |
| D. Sieve optimization / additive combinatorics | 9 | 10 | 5 | 8 | 3 |
| E. Probabilistic models / data-driven | 9 | 9 | 6 | 9 | 7 |

Key facts per route (verified):
- **A**: Montgomery 1973 / Odlyzko GUE; FHK extremes *proven* by
  Arguin–Bourgade–Radziwiłł 2020–23. But no self-adjoint operator in 40
  years; Berry–Keating H=xp has continuous spectrum; Connes positivity ⇔
  RH (circular without new input).
- **B**: RH is a THEOREM in F_q[t] (Weil 1948, Deligne 1974). Twin primes
  and Chowla are theorems there (Sawin–Shusterman, Annals 2022); open over
  ℤ. The blocked step for 70 years: positivity / the missing geometry
  under Spec ℤ (Bombieri 2006 names the obstruction).
- **C**: produced the century's biggest prime theorem without zeta
  (Green–Tao 2004); Matomäki–Radziwiłł 2015; Tao's log-Chowla 2016. But
  qualitative where RH is quantitative; full Chowla ⇏ RH.
- **D**: the only route where numerics moved a frontier theorem (Polymath8b:
  gap 264→252→246 by better optimization, 2014). But 246 frozen for a
  decade; Engelsma's D_50=246 is exhaustive; Selberg's parity barrier is a
  proven wall; bounds gaps, not residuals.
- **E**: the only route where outsiders+computation found new phenomena
  recently: Lemke Oliver–Soundararajan 2016 (consecutive-prime bias,
  found computationally first), murmurations 2022 (undergraduate + plots,
  partly proven by Zubrilina 2023). Habitat matches this workshop exactly.

## The funnel verdict (devil's advocate, accepted by the chair)

The explicit formula is an identity: RH-grade precision *about ψ(x)−x*
IS the zeros — no route escapes that funnel for that target. What can
legitimately differ is (1) the OBJECT about which RH-grade truth is sought
(gaps, correlations, family statistics, the other universe), and (2) the
MECHANISM of explanation. "Different route, same target" is incoherent;
"different target, same grade of truth" is the coherent version of the
workshop's ambition — and route B contains the proof that such truth is
attainable: a whole universe where RH and twin primes are theorems.

## DECISION — the Two-Universes Program

Primary bet: **build the function-field universe (F_2[t], F_3[t]
irreducible polynomials) into PrimeVisuals as a first-class second
universe, and make the workshop's signature object the MEASURED DEVIATION
between the two universes at matched statistics.**

Why this synthesis wins:
1. It is the only territory where RH-grade truth is *proven* — every
   experiment has exact theorems as ground truth on one side, which
   structurally kills the Mertens failure mode (we can always calibrate).
2. Twin primes and Chowla are theorems there and open here: the measured
   gap between universes at matched statistics is genuinely novel data —
   comparative anatomy of the two prime worlds at 10^7–10^8 scale is
   thinly explored territory suited to exactly this instrument.
3. It feeds route E's discovery engine with a theory-backed null that is
   far stronger than Cramér: every uncomputed statistic now gets computed
   in BOTH worlds, and divergence — where the analogy bends — points at
   what the missing geometry under Spec ℤ must explain.
4. It is "connecting disconnected fields" in the precise sense: the
   bridge Weil built is real; we instrument it.

Daily driver (unchanged): route E sprints per prompts/research-loop.md —
uncomputed second-order statistics — now run across both universes.

Side bet (occasional sprints): route D's M_k variational problem
(reproduce M_5 > 2, then M_50 > 4 — sharp published benchmarks); the one
theorem-adjacent computation an agent farm can grind honestly.

Demoted to calibration suites (not paths): A's GUE/FHK checks (instrument
tests for our zero-recovery pipeline), C's Möbius-disjointness experiments
(μ exists in both universes — useful matched statistic). B's F1 theory
reading is out of scope; only computational F_q[t] is in.

## Success, recalibrated

A workshop success is now one of:
- **S1**: a precisely characterized, replicable law holding in BOTH
  universes (evidence of RH-grade content; candidate for transport-proof —
  the function-field side may literally be provable).
- **S2**: a precisely characterized divergence between the universes
  (a datum about the missing geometry — the most interesting outcome).
- **S3**: an LO-S-class statistical phenomenon in either universe, new to
  the literature, stated as a precise conjecture with evidence pack.
Proof of RH-grade statements over ℤ remains out of scope by honest
base-rate; conjecture-grade contributions with expert-ready evidence packs
are the deliverable.

## First sprints

1. **Build the universe**: F_2[t]/F_3[t] sources in src/core (irreducibles
   by degree, polynomial μ, twin-irreducible pairs), tests against the
   exact counting formula (#irreducibles of degree n = (1/n)Σ_{d|n} μ(d)q^{n/d}),
   KNOWLEDGE entries recording which statements are theorems there.
2. **Calibrate**: PNT-analog (exact), Chowla decay (theorem) vs integer
   Chowla (open), twin densities both sides — per prompts/two-universes.md.
3. **Diverge**: generalize the anomaly scanner to matched two-universe
   batteries; ship the divergence leaderboard.
