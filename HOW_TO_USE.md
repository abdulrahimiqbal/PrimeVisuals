# PrimeVisuals How-To Guide

PrimeVisuals is an exploratory visual instrument for number theory. It does not
prove theorems. It helps you see where structure appears when arithmetic data is
placed into different coordinate systems.

The main idea is:

```txt
SOURCE -> PLANE -> LENS
```

- `SOURCE`: what data is being visualized.
- `PLANE`: where each data item is placed.
- `LENS`: how each item is colored.

The label at the lower-left of the canvas always shows the active pipeline, for
example:

```txt
Primes -> Sacks spiral -> Ion mono
```

## Quick Start

1. Start with the `LIBRARY` buttons in the left panel.
2. Use drag to pan the canvas.
3. Use the mouse wheel or the `+` / `-` buttons to zoom.
4. Double-click the canvas or press the reset button to recenter.
5. Change one control at a time: source, then plane, then lens.
6. Use `Save view` when you find a useful combination.

## In-App Help And Focus Mode

The sidebar includes a `READING THIS VIEW` panel. It updates as you change the
source, plane, or lens:

- `Dot` tells you what one rendered point or sample represents.
- `Position` explains how that item becomes an `(x, y)` location.
- `Color` explains the current lens.
- `Look For` gives one practical cue for reading the current visualization.

Hover near a visible dot or curve sample to inspect the nearest item. The tooltip
shows context-specific values such as prime number, prime index, prime gap,
`mu(n)`, zeta height `t`, or zero height `t_k`.

Use the eye button in the upper-right corner to enter focus mode. Focus mode
hides the header, sidebar, captions, help panels, and zoom controls, leaving only
the visualization and the eye button. Click the eye again to restore the full
interface.

## What Each Dot Means

A dot is one rendered data item. What that item represents depends on the
selected `SOURCE`.

| Source | What one dot or sample represents |
| --- | --- |
| `Primes` | One prime number `p`. |
| `Prime gaps` | One gap between consecutive primes, `p_next - p`. |
| `Mobius mu(n)` | One integer `n`, colored or moved by `mu(n)`, which is `-1`, `0`, or `+1`. |
| `zeta on the critical line` | One sampled value of `zeta(1/2 + i t)` at a height `t`. |
| `Nontrivial zeros` | One known zeta zero height `t_k`, shown as `1/2 + i t_k`. |

The dot is not always a point on a straight number line. The `PLANE` decides how
the source value becomes an `(x, y)` position.

## The Interface

### Source

Choose the raw mathematical object.

- `Primes`: all primes up to `N`.
- `Prime gaps`: differences between neighboring primes.
- `Mobius mu(n)`: values over every integer up to `N`.
- `zeta on the critical line`: sampled complex values of the Riemann zeta
  function on `s = 1/2 + i t`.
- `Nontrivial zeros`: a built-in list of the first zeta zero heights below 100.

### Plane

Choose the coordinate system.

- `Ulam square spiral`: integers are laid on a square spiral; primes are marked
  at their integer positions.
- `Sacks spiral`: integers are laid on an Archimedean-style spiral using
  `r = sqrt(n)` and `theta = 2*pi*sqrt(n)`.
- `Polar theta = alpha*n`: values rotate by an adjustable angle. This is useful
  for seeing modular structure.
- `Modular clock`: places values on spokes according to `n mod m`.
- `Function graph`: plots data as a graph, such as prime-counting or gap size.
- `Cumulative walk`: accumulates a signal over time.
- `Argand trace`: plots complex zeta values as `(real, imaginary)` points.
- `Critical strip`: places zeta zeros inside the strip `0 < Re(s) < 1`.

### Lens

Choose the color rule.

- `Ion mono`: one color. Best when you only want to see geometry.
- `Aurora (sequence)`: color follows order in the sequence.
- `Residue classes`: color by `n mod k`.
- `Signal (+/-)`: separates positive, negative, and zero values.
- `Pulse (magnitude)`: color by size of the measured value.

## Reading The Presets

### Sacks Spiral

Each dot is one prime `p`. The position is:

```txt
r = sqrt(p)
theta = 2*pi*sqrt(p)
```

Read it as a curved number line wrapped into a spiral. Curved streaks mean many
primes are landing on related polynomial paths. Perfect squares line up by
construction, because their square roots are integers.

Look for:

- radial or curved bands;
- empty regions where composites dominate;
- dense prime-rich curves.

Do not read distance between dots as ordinary prime gaps. The distance is a
visual consequence of the spiral transform.

### Ulam Spiral

Each dot is one prime `p`. Imagine writing:

```txt
1, 2, 3, 4, 5, ...
```

onto a square spiral grid, then marking only the primes.

Read it by looking for diagonal, horizontal, or vertical streaks. Those streaks
often correspond to quadratic expressions that produce many prime values.

Look for:

- diagonal prime-rich lines;
- missing or sparse diagonals;
- repeated structure as `N` grows.

### Polar Alpha-Dial

Each dot is usually one prime. Its angle is controlled by:

```txt
theta = alpha*n
```

Changing `alpha` changes how the number line wraps. When the structure suddenly
organizes into spokes, petals, or bands, you are seeing arithmetic regularity
under that rotation.

Use the `Residue classes` lens here. If colors cluster on certain spokes, that
means residues modulo `k` are interacting with the chosen angle.

### Prime Clock

Each dot is one prime. The clock hand is chosen by:

```txt
n mod m
```

For `m = 30`, primes greater than 5 can only appear on spokes coprime to 30:

```txt
1, 7, 11, 13, 17, 19, 23, 29
```

Read it as a modular filter. Empty spokes are usually impossible residue classes,
not random gaps.

### Critical Line |zeta|

Each point is a sampled value:

```txt
x = t
y = |zeta(1/2 + i*t)|
```

Deep dips toward zero indicate zeta zeros on the critical line. The vertical
markers show known zero heights.

Read it as a height scan. You are watching the zeta function move along the
line `Re(s) = 1/2`.

### Zeta Pirouette

Each point is a complex zeta value:

```txt
x = Re(zeta(1/2 + i*t))
y = Im(zeta(1/2 + i*t))
```

As `t` increases, the curve traces the motion of the zeta value in the complex
plane. When the trace passes through the origin `(0, 0)`, the zeta value is zero.

Read it as a moving complex-valued signal.

### Zeros On The Strip

Each dot is one known nontrivial zeta zero, placed at:

```txt
x = 1/2
y = t_k
```

The shaded region is the critical strip. The center line is the critical line.
This view illustrates the setting of the Riemann Hypothesis: the important
question is whether all nontrivial zeros lie on that center line.

### Mertens Walk

Each step comes from `mu(n)`.

```txt
M(N) = sum mu(n), for n <= N
```

The walk rises when `mu(n) = +1`, falls when `mu(n) = -1`, and stays flat when
`mu(n) = 0`. A large upward or downward drift means one sign has led for a while.

Read it as cumulative balance, not as individual prime locations.

### Chebyshev Race

Each prime contributes to a race between two residue classes:

```txt
p == 1 mod 4  -> +1
p == 3 mod 4  -> -1
```

The cumulative walk shows which class is ahead. If the line is below zero,
`3 mod 4` primes are leading. If it is above zero, `1 mod 4` primes are leading.

This visualizes Chebyshev bias: over many ranges, primes congruent to `3 mod 4`
lead more often than primes congruent to `1 mod 4`, even though the classes
balance asymptotically.

### Gap Skyline

Each dot represents one consecutive prime gap:

```txt
x = prime p
y = next_prime - p
```

Tall spikes are unusually large prime gaps. The typical gap slowly grows as
numbers get larger, but individual gaps fluctuate strongly.

Read it as local spacing between primes.

## Lab Mode

`LAB` is a blank mathematical canvas. It is no longer centered on one zeta or
Riemann Hypothesis workflow. Those are available as saved templates, but the
default flow is to build relationships yourself.

The Lab user flow is:

1. Pick a domain: integer `n`, real `t`, or complex `s`.
2. Drag objects from the palette onto the canvas.
3. Drag a node's `OUT` handle to another node's `IN` handle.
4. Connect final relationships to visual channels:
   - `x position`
   - `y position`
   - `color hue`
   - `complex field w`
5. Turn knobs `a` and `b`.
6. Save useful relationship graphs.

The node canvas compiles to formulas under the hood. For example, this graph:

```txt
n*cos(a*n) -> x position
n*sin(a*n) -> y position
isprime(n) -> color hue
```

compiles to:

```txt
x(n) = n*cos(a*n)
y(n) = n*sin(a*n)
hue(n) = isprime(n)
```

Use the `FORMULAS` tab inside Lab when you want direct text editing or debugging.
The canvas remains the primary workflow; formulas are the advanced view.

Available ingredients include:

```txt
n, t, s, i, a, b
abs, arg, re, im, conj, exp, log, sqrt, sin, cos
floor, frac, min, max, dot, mod, gcd
zeta, mu, M, isprime, pi, gap, omega, bigomega, tau, phi, rad
```

Template examples:

- `Blank canvas`: a minimal integer domain with `n -> x` and `0 -> y`.
- `Prime spiral`: maps integers into a spiral and colors by primality.
- `Mertens relation`: maps `M(n)` against `n` and colors by `mu(n)`.
- `Prime gap skyline`: maps the next-prime gap as a height.
- `Totient garden`: explores `phi(n)` and `rad(n)`.
- `Riemann hypothesis`: a saved zeta/RH relationship, not the default Lab mode.
- `Zeta field`: complex domain coloring for `zeta(s)`.

## A Practical Reading Workflow

1. Start with `Ion mono` so color does not distract you.
2. Ask: what does one dot represent in this source?
3. Ask: how did the plane move that data item into `(x, y)`?
4. Switch to `Residue classes` to test modular explanations.
5. Switch to `Pulse` only when the source has a meaningful magnitude.
6. Increase `N` or `tMax` gradually and see which structures persist.
7. Treat persistent structure as a clue, not a conclusion.

## Common Misreadings

- A spiral dot is usually not a geometric measurement in ordinary space. It is a
  number transformed into a visual coordinate.
- A dense streak does not prove infinitely many primes on that curve.
- A zeta zero visualization does not prove the Riemann Hypothesis.
- Color is not always value. Check the active `LENS`.
- Empty spokes on modular clocks may be mathematically impossible classes, not
  missing data.

## Glossary

- `prime`: an integer greater than 1 whose only positive divisors are 1 and
  itself.
- `pi(x)`: the number of primes less than or equal to `x`.
- `prime gap`: the difference between consecutive primes.
- `mu(n)`: the Mobius function. It is `0` if `n` has a repeated prime factor,
  otherwise it is `+1` or `-1` depending on whether `n` has an even or odd number
  of distinct prime factors.
- `M(N)`: the Mertens function, the cumulative sum of `mu(n)`.
- `zeta(s)`: the Riemann zeta function.
- `critical strip`: the region `0 < Re(s) < 1`.
- `critical line`: the vertical line `Re(s) = 1/2`.
- `nontrivial zero`: a zero of `zeta(s)` in the critical strip.
- `residue class`: the remainder family of a number modulo `m`.

## Sources Consulted

- Wolfram MathWorld, Prime Spiral:
  https://mathworld.wolfram.com/PrimeSpiral.html
- Wolfram MathWorld, Prime Counting Function:
  https://mathworld.wolfram.com/PrimeCountingFunction.html
- Wolfram MathWorld, Mobius Function:
  https://mathworld.wolfram.com/MoebiusFunction.html
- Wolfram MathWorld, Chebyshev Bias:
  https://mathworld.wolfram.com/ChebyshevBias.html
- Clay Mathematics Institute, Riemann Hypothesis:
  https://www.claymath.org/millennium/riemann-hypothesis/
- NaturalNumbers.org, The Sacks Number Spiral:
  https://www.naturalnumbers.org/sparticle.html
- ThatsMaths, Spiralling Primes:
  https://thatsmaths.com/2019/09/12/spiraling-primes/
- Prime gap overview:
  https://en.wikipedia.org/wiki/Prime_gap
