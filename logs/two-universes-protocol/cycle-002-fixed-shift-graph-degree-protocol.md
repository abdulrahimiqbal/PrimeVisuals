# Two-Universes Breakthrough Protocol - Cycle 002

Generated: 2026-06-17T01:16:07.559Z

Candidate: **Order-free fixed-shift graph degree spectrum**

Decision: **REJECT_UNDER_STRICT_TWO_UNIVERSES_PROTOCOL**

Order-free representation fixed the lexicographic issue, but raw graph degree variance is absorbed by local/composite controls and mismatches finite fields.

## Promotion Gates

| gate | status | evidence |
| --- | --- | --- |
| Precise theorem-shaped statement | PASS | Candidate states an unordered graph G_H on primes/irreducibles and scores D=std(degree)/sqrt(mean degree). |
| Exact finite-field interpretation | PASS | F_q[t] side is an exact finite graph on monic irreducibles of fixed degree with explicit polynomial shifts divisible by all linear factors. |
| Integer-prime holdout evidence | PASS | Integer side was checked over endpoints 500000, 1000000, 2000000, 4000000, 8000000 through N=8000000. |
| Local/null/random controls | FAIL | Endpoint integer D=0.823568 is absorbed by sampled composite controls 0.830489..0.832803; Cramer separation is therefore only local-constraint detection. |
| Compression / low parameter count | PASS | The statistic is one low-parameter graph invariant over a fixed shift set. |
| Scale and field stability | FAIL | Integer D is stable, but F_2[t] endpoint D=1.235972 and F_3[t] endpoint D=1.109492 do not match the integer endpoint D=0.823568. |
| Novelty audit | FAIL | The result reduces to local tuple admissibility / Hardy-Littlewood pair calibration rather than a new two-universe invariant. |
| Reproducible code, logs, plots | PASS | JSON/MD/SVG/PNG/script artifacts are present. |
| Plausible proof path | FAIL | A proof path would first need subtraction of local pair/triple expectations; raw graph D has no theorem-shaped residual statement. |
| Expert-ready evidence pack | FAIL | No expert-ready pack exists because the candidate is rejected at controls and matched-field gates. |

## Graph Evidence

### Integer Endpoint

| N | labels | D | mean degree | Cramer D range | composite D range |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 8000000 | 539777 | 0.823568 | 3.300937 | 0.906341..0.911995 | 0.830489..0.832803 |

### Function-Field Endpoints

| q | degree | labels | D | mean degree | random monic D range | random reducible D range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 2 | 22 | 190557 | 1.235972 | 2.020141 | 1.377753..1.380859 | 1.378675..1.385172 |
| 3 | 13 | 122640 | 1.109492 | 3.880822 | 1.350879..1.363433 | 1.358275..1.367725 |

## Surprise Ledger

- **observedSignal**: Integer D stays flat near 0.824 through N=8000000, while Cramer controls are higher.
- **expectedNull**: If this is prime-specific two-universe structure, composite controls should not absorb it and F_q[t] levels should align after matched shift design.
- **knownExplanation**: Local Hardy-Littlewood tuple admissibility and composite-shell geometry reproduce the integer endpoint.
- **survivedControls**: Separates from Cramer random labels
- **failedControls**: Integer sampled-composite D range 0.830489..0.832803 contains real D=0.823568; F_2[t] D=1.235972 and F_3[t] D=1.109492 do not align with Z D=0.823568
- **whatFailed**: Raw graph degree variance is not centered enough; it measures local admissibility before any deeper residual.
- **suspectedInvariant**: If anything survives, it must live in a locally centered multi-shift covariance tensor.
- **nextMutation**: Subtract local pair/triple admissibility tensor before spectral scoring

## Forced Representation Mutation

Mutation: **Subtract local pair/triple admissibility tensor before spectral scoring**

Raw fixed-shift graph degree spectra mostly measure local tuple admissibility and composite-shell geometry.

Preregistered next move:

- For each shift h or polynomial shift a, estimate the local Hardy-Littlewood / exact finite-field expected edge rate.
- Build centered edge variables E_h(v)=1_{v+h prime}-expected_h(local state).
- Score covariance/spectral invariants of the centered multi-shift tensor, not raw degree variance.
- Use composite/eligible shell controls with the same local state, Cramer controls, and reducible/monic controls in F_q[t].
- Promote only if the centered residual survives train/holdout and aligns across Z and at least two F_q[t] universes.

## Artifact Inventory

- present: `logs/playground-artifacts/fixed-shift-graph-degree-audit-8000000.json`
- present: `logs/playground-artifacts/fixed-shift-graph-degree-audit-8000000.md`
- present: `logs/playground-artifacts/fixed-shift-graph-degree-audit-8000000.svg`
- present: `logs/playground-artifacts/fixed-shift-graph-degree-audit-8000000.png`
- present: `scripts/fixed-shift-graph-degree-audit.mjs`

