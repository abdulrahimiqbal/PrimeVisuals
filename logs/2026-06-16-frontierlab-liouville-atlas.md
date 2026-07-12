# 2026-06-16 — FrontierLab Liouville residual atlas

Goal:
turn PrimeVisuals toward a residual-first search for a rigid organizing
locus in multiplicative randomness, starting with
`C_h(N)=sum_{n<=N} lambda(n)lambda(n+h)`.

Plan:

1. Add Liouville `lambda(n)=(-1)^Omega(n)` as a first-class integer lab
   function.
2. Add polynomial Liouville over `F_q[t]` and two-point correlations as
   the function-field calibration world.
3. Build a FrontierLab audit script that reports:
   `OBJECT`, `BASELINE`, `RESIDUAL`, `NULLS`, and a formal promotion score.
4. Run the atlas with integer random multiplicative/shuffled controls and
   `F_2[t]`/`F_3[t]` matched fields.
5. Log the result as a candidate only if it passes null separation and
   persistence; otherwise record it as calibration or graveyard evidence.

## Run — N=2,000,000, h<=32, F_2[t] degree 20, F_3[t] degree 13

Command:

```sh
node scripts/frontierlab-liouville-atlas.mjs 2000000 logs/frontierlab-artifacts 20 13 32
```

Artifacts:

- Markdown: `logs/frontierlab-artifacts/frontierlab-liouville-atlas-2000000-h32-q2d20-q3d13.md`
- JSON: `logs/frontierlab-artifacts/frontierlab-liouville-atlas-2000000-h32-q2d20-q3d13.json`
- SVG: `logs/frontierlab-artifacts/frontierlab-liouville-atlas-2000000-h32-q2d20-q3d13.svg`

Result:

| gate | value |
| --- | ---: |
| promotion | `not-promoted` |
| candidate score | `0.000000` |
| real-vs-null z | `-1.599384` |
| integer persistence | `0.663134` |
| integer rank-one fraction | `0.610447` |
| best factor-law R2 | `0.576290` |
| cross-world coherence | `0.000896` |

Integer final range:

- `N=2,000,000`
- final energy `0.702596`
- max normalized cell `1.431184`
- combined integer control energy range `0.762999..1.460655`
- random completely multiplicative energy range `0.762999..1.460655`
- shuffled lambda energy range `0.783157..1.166478`

Function-field calibration:

- `F_2[t]`, degree 20: energy `2.175326`, random multiplicative control
  range `1.459062..1.685726`, max cell `8.578125`.
- `F_3[t]`, degree 13: energy `2.016338`, random multiplicative control
  range `0.847596..1.252154`, max cell `3.873553`.
- integer-minus-`F_2[t]` deviation energy `2.212681`, cosine `0.107869`.
- integer-minus-`F_3[t]` deviation energy `2.204498`, cosine `-0.106076`.

Interpretation:

No integer Liouville residual locus is promoted at this scale. The
integer field is smaller than the matched null range, and the top cells
move across dyadic blocks rather than forming a stable boundary. The
function-field worlds do show structured degree-top shift patterns, but
they are not coherent with the integer top-range vector. This is
calibration evidence for the two-universe program: the current
integer-Chowla residual behaves null-like, while the polynomial side has
finite-degree algebraic structure that should not be mistaken for an
integer law.

Audit gate:

- Factor check: the object is fixed-shift Liouville/Chowla parity, not
  prime counting, `psi`, Mertens, cumulative gaps, or dyadic smoothing.
- Composite control: not applicable as a prime signature; the statistic is
  defined on all positive integers.
- Null contrast: passed as a measurement, failed as promotion because the
  real integer energy is not separated above nulls.
- Range persistence: measured across `125000, 250000, 500000, 1000000,
  2000000`.
- Known-result check: no theorem is claimed; any future positive result
  must be labeled Chowla-adjacent and conjectural.

Status: `CALIBRATION / NOT-PROMOTED`.
