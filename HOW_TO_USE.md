# PrimeVisuals How-To

PrimeVisuals is a visual instrument for number theory. It does not prove
theorems — it helps you see where structure appears when arithmetic data is
placed into different coordinate systems.

Every view is one pipeline:

```txt
SOURCE  ->  PLANE  ->  LENS
(what data) (where it goes) (how it's colored)
```

The label at the lower-left of the canvas always shows the active pipeline,
for example `Primes -> Sacks spiral -> Ion mono`.

## Quick start

1. Click a `LIBRARY` preset in the left panel.
2. Drag to pan; mouse wheel or `+` / `-` to zoom; double-click to recenter.
3. Change one control at a time: source, then plane, then lens.
4. Hover near a dot to inspect it. The `READING THIS VIEW` panel explains the
   current pipeline as you change it.
5. `Save view` keeps a combination you like. The eye button (top right)
   toggles focus mode, hiding everything except the canvas.

## What one dot means

| Source | One dot or sample is |
| --- | --- |
| `Primes` | one prime `p`, up to `N` |
| `Prime gaps` | one gap `p_next - p` |
| `Möbius μ(n)` | one integer `n`, with `μ(n)` in `{-1, 0, +1}` |
| `ζ on the critical line` | one sample of `ζ(1/2 + it)` |
| `Nontrivial zeros` | one known zero height `t_k` |

The PLANE decides how that value becomes an `(x, y)` position:

- `Ulam square spiral` — integers on a square spiral, primes marked.
- `Sacks spiral` — `r = sqrt(n)`, `theta = 2π·sqrt(n)`.
- `Polar θ = α·n` — the number line wrapped by an adjustable angle.
- `Modular clock` — spokes by `n mod m`.
- `Function graph` — plain plots, such as `π(x)`, gap size, or `|ζ|`.
- `Cumulative walk` — running total of the signal.
- `Argand trace` — complex ζ values as `(Re, Im)` points.
- `Critical strip` — zeros at `x = 1/2`, `y = t_k`.

The LENS decides color: `Ion mono` (one color — geometry only), `Aurora`
(sequence order), `Residue classes` (`n mod k`), `Signal` (sign), `Pulse`
(magnitude).

## The playable canvas

The default scene is **Riemann's explicit formula**: the prime staircase
`ψ(x)` with the smooth curve `x − Σ x^ρ/ρ` built from the first `K` zeta
zeros. Drag the `K` slider and watch the curve grow wiggles that lock onto
the staircase — primes assembling out of zero waves.

From there, bend any view directly:

- **Transform chips** (top-left of the canvas): drag an op (`log`, `sqrt`,
  `mod m`, `× a`, `Δ`, `Σ`, …) onto the `x` or `y` row — or click to add it —
  and the axis reshapes with an animated morph. Chips compose left to right;
  values like `m` and `a` drag horizontally to scrub. `Ctrl+Z` undoes.
- **RESIDUAL** (header): subtracts the best-known prediction for the current
  view — `π(x) − Li(x)`, `ψ(x) − x`, `gap − ln p`, `M(x)/√x`, the normalized
  Chebyshev race, or zero spacings against their mean. What survives the
  subtraction is what the encoded theory does not explain.
- **TWIN** (header): overlays Cramér-model pseudoprimes in rose. Structure
  in both layers is generic to any random set with the primes' density;
  structure only in the cyan layer is arithmetic.
- **×2×4×8** (header): renders the same pipeline at growing range plus a
  holdout panel that uses only the unseen range `(N, 2N]` — real structure
  strengthens, flukes fade.
- **LINK / PIN** (header): every view lives in the URL, so `LINK` copies an
  exact reproducible link and `PIN` keeps it in the notebook.
- On the polar plane, `▶ sweep` animates α and a readout shows the best
  fraction `α/2π ≈ p/q` — spokes lock exactly when that fraction is exact.

## Anomaly scan

The `ANOMALY SCAN` panel sweeps residue classes, exponential-sum angles,
and gap correlations without you choosing where to look. Candidates are
found on primes `≤ N` and re-scored on the disjoint half `(N, 2N]`, so
look-elsewhere flukes die at the holdout step. The leaderboard ranks the
survivors; `view` opens one, `pin` keeps it in the notebook with an OEIS
lookup link when a sequence is attached.

Expect the top entries to be *known* structure (primes are odd, avoid
multiples of 3, …) — that is the scanner working honestly. The interesting
candidates are survivors further down that you cannot immediately explain.

## Presets

| Preset | What you're seeing | Look for |
| --- | --- | --- |
| Riemann explicit formula | `ψ(x)` staircase vs `x − Σ x^ρ/ρ` | raise `K`: zero waves converging on the primes |
| Family sweep mod q | one row per modulus q, columns are residues r/q | coherent vertical bands shared across the family |
| Sacks spiral | primes on the `r = sqrt(p)` spiral | curved prime-rich streaks (polynomial paths) |
| Ulam spiral | primes on a square spiral | dense and sparse diagonals (quadratics) |
| Polar α-dial | each prime at angle `α·p` | turn `α` slowly until spokes or petals lock in |
| Prime clock m=30 | spoke = `p mod 30` | empty spokes are impossible residue classes |
| Critical line \|ζ\| | `y = \|ζ(1/2 + it)\|` | dips to zero are zeta zeros |
| Zeta pirouette | ζ traced in the complex plane | loops through the origin are zeros |
| Zeros on the strip | zeros at `Re(s) = 1/2` | the RH question: does anything live off the line? |
| Mertens walk | running sum of `μ(n)` | long drifts where one sign leads |
| Chebyshev race | `+1` if `p ≡ 1 mod 4`, `−1` if `p ≡ 3 mod 4` | the `3 mod 4` class leads surprisingly often |
| Gap skyline | gap size at each prime | tall spikes are unusually large gaps |

## Lab mode

`LAB` is a blank canvas for building your own relationships:

1. Pick a domain: integer `n`, primes only `p`, real `t`, or complex `s`.
2. Drag objects from the palette; connect `OUT` handles to `IN` handles.
3. Connect results to visual channels: `x position`, `y position`,
   `color hue`, or complex field `w`.
4. Turn knobs `a` and `b` and watch the structure respond.

The canvas compiles to formulas — open the `FORMULAS` tab to edit them as
text. For example:

```txt
n*cos(a*n) -> x     n*sin(a*n) -> y     isprime(n) -> hue
```

plots a prime spiral whose winding you control by hand.

Ingredients: `n t s i a b`, arithmetic operators, `abs arg re im conj exp log
sqrt sin cos floor frac min max dot mod gcd`, and number-theoretic functions
`zeta mu M isprime pi gap omega bigomega tau phi rad`.

Templates (`Prime spiral`, `Mertens relation`, `Totient garden`,
`Riemann hypothesis`, `Zeta field`, …) are saved starting points.

## How to read honestly

1. Start with `Ion mono` so color doesn't distract.
2. Ask: what is one dot, and how did the plane place it?
3. Test modular explanations with the `Residue classes` lens.
4. Increase `N` (or `tMax`) and keep only the structure that persists.
5. Treat persistent structure as a clue, not a conclusion.

Common misreadings:

- Distance between spiral dots is an artifact of the transform, not a prime gap.
- A dense streak does not prove infinitely many primes on that curve.
- Empty clock spokes are usually impossible residue classes, not missing data.
- Color is not always value — check the active LENS.
- No picture here proves the Riemann Hypothesis.

## Further reading

- Prime spirals: https://mathworld.wolfram.com/PrimeSpiral.html
- Chebyshev bias: https://mathworld.wolfram.com/ChebyshevBias.html
- Riemann Hypothesis: https://www.claymath.org/millennium/riemann-hypothesis/
- Prime gaps: https://en.wikipedia.org/wiki/Prime_gap
