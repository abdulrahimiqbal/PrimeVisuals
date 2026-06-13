# Expert Pack: F_3[t] Mobius-Parity Gap Bias

Status: `⭐⭐ / CONJECTURAL`

## Object

Work in `F_3[t]`. Encode monic degree-`n` polynomials by their base-3
coefficient integer and order monic irreducibles by that encoding. For an
irreducible `f`, let:

- `G_+(f)` be the following irreducible gap in encoded units;
- `G_-(f)` be the previous irreducible gap in encoded units;
- `mu(g)` be the polynomial Mobius function.

For `h in {1,t,t+1}` with encoded shifts `{1,3,4}`, define scrubbed samples:

- positive shift: rows with `G_+(f) > h`, statistic `mu(f+h)` versus `G_+(f)`;
- negative shift: rows with `G_-(f) > h`, statistic `mu(f-h)` versus `G_+(f)`.

The scrub removes the direct lookahead case where `f+h` itself is the next
irreducible, and the direct lookback case where `f-h` is the previous
irreducible.

## Statement

CONJECTURE. In fixed characteristic `3`, Mobius parity at a neighboring
polynomial predicts the next lexicographic irreducible gap after the direct
short-gap cases are removed.

The strongest observed form is:

```text
r_n(t) = Corr(mu(f-t), G_+(f) | f irreducible of degree n, G_-(f)>t)
       = 0.022 +/- 0.003  for n=14,15,16,17,
```

with the same positive sign on `t+1`:

```text
Corr(mu(f-(t+1)), G_+(f) | G_-(f)>t+1) = 0.020 +/- 0.003
```

and weaker but persistent positive-shift analogs for `h in {1,t,t+1}`. Equivalently,
the z-score `r_n sqrt(N_n)` grows like a positive constant times `sqrt(N_n)`
over the tested blocks rather than behaving like local-wheel, cyclic-shift, or
composite-only nulls.

This is not claimed as a theorem. A plausible proof route would use the
odd-characteristic identity connecting polynomial Mobius parity with Frobenius
sign/discriminant, then analyze the resulting character along lexicographic
prime-gap tails. No derivation is supplied here.

## Evidence

Artifacts:

- `logs/two-universes-artifacts/mobius-gap-battery.json`
- `logs/two-universes-artifacts/mobius-gap-leakage.json`
- `logs/two-universes-artifacts/mobius-gap-cyclic.json`
- `logs/two-universes-artifacts/mobius-gap-holdout-q3-d17.json`
- `logs/two-universes-artifacts/mobius-gap-factor-audit-q3.json`
- `logs/two-universes-artifacts/mobius-gap-composite-control-q3.json`

Shot/link:

- `logs/two-universes-artifacts/mobius-gap-holdout-q3-d17.md`
- `logs/two-universes-artifacts/mobius-gap-factor-audit-q3.md`

Top row across discovery plus holdout:

| degree | row | scrubbed n | z | r |
| ---: | --- | ---: | ---: | ---: |
| 14 | `mu_minus_t` | 289209 | 12.836 | 0.023868 |
| 15 | `mu_minus_t` | 819906 | 19.614 | 0.021661 |
| 16 | `mu_minus_t` | 2330338 | 32.434 | 0.021246 |
| 17 | `mu_minus_t` | 6641716 | 56.220 | 0.021815 |

Degree-17 holdout:

| statistic | real z | local-wheel meanAbs | cyclic meanAbs | composite meanAbs | verdict |
| --- | ---: | ---: | ---: | ---: | --- |
| `mu_minus_t` | 56.220 | 0.876 | 0.574 | 2.311 | survives |
| `mu_minus_t_plus_1` | 50.123 | 0.649 | 0.967 | 2.423 | survives |
| `mu_plus_1` | 15.664 | 0.305 | 0.832 | 0.844 | survives |
| `mu_plus_t` | 11.219 | 0.736 | 0.780 | 0.519 | survives |
| `mu_plus_t_plus_1` | 9.126 | 1.006 | 1.085 | 1.292 | survives |

Degree-17 conditional means by Mobius value:

| statistic | `mu=-1` n/mean gap | `mu=0` n/mean gap | `mu=1` n/mean gap |
| --- | ---: | ---: | ---: |
| `mu_minus_t` | 2037474 / 16.443 | 2328264 / 16.847 | 2275978 / 17.245 |
| `mu_minus_t_plus_1` | 1930145 / 16.341 | 2206267 / 16.983 | 2169341 / 17.084 |
| `mu_plus_1` | 1900167 / 17.449 | 3444839 / 17.175 | 2073912 / 17.667 |
| `mu_plus_t` | 2039757 / 19.143 | 2329212 / 18.911 | 2272747 / 19.290 |
| `mu_plus_t_plus_1` | 1945221 / 20.140 | 2181122 / 19.395 | 2179410 / 20.241 |

## Audit Gate

FACTOR CHECK:
The signal is parity-specific. The first leakage audit showed `abs_mu` and
`omega` rows do not beat their matched nulls. The squarefree-only audit keeps
only rows with `|mu(f +/- h)|=1`; all five survivors remain, including
`mu_minus_t` z values `12.806,19.535,32.406,56.221`. Negative-shift rows also
survive a linear previous-gap partial correlation: `mu_minus_t` partial z
values `12.977,19.814,32.680,56.592`.

COMPOSITE CONTROL:
Five sparse degree-17 sequences sampled from reducible monic polynomials only,
at irreducible density, do not reproduce the effect. Real/composite ratios are
`24.323,20.683,18.558,21.625,7.065` for the five survivors.

CRAMER / LOCAL-WHEEL CONTRAST:
Five degree-2 local-wheel seeds are used in the battery, leakage audit, and
degree-17 holdout. The degree-17 real/local-wheel ratios are
`64.179,77.192,51.439,15.250,9.071`.

PERSISTENCE:
All five survivor rows have stable positive sign and sharpen across
degrees `14,15,16`. The degree-17 holdout continues the same sign and exceeds
both local-wheel and cyclic thresholds.

HOLDOUT:
Degree `17` was not used for discovery, ranking, leakage classification, or
cyclic classification. All five survivors pass on that disjoint block.

NOVELTY:
Nearest catalog entries are adjacent but do not state this conditional
lexicographic gap law.

- Sawin-Shusterman prove major Chowla/twin-prime results over `F_q[T]`, but
  under explicit large-field hypotheses. Their Theorem 1.3 assumes
  `q > p^(2k^2 e^2)` and lists examples beginning at `F_3^6`; `F_3` itself is
  not covered. Source: https://arxiv.org/pdf/1808.04001
- The same paper explains the relevant mechanism: in odd characteristic,
  Mobius parity is tied to Frobenius sign/discriminant. That is a possible
  proof route, not a cataloged gap-tail statistic.
- Kurlberg-Rosenzweig study prime and Mobius correlations in very short
  intervals and note both independence and breakdown phenomena, but their
  setup is interval-sum correlation, not following-gap correlation conditioned
  on consecutive irreducibles. Source:
  https://preprint.press.jhu.edu/ajm/sites/default/files/AJM-kurl-rosen-FINAL.pdf
- Thorne adapts Maier's matrix method to function fields and explicitly works
  with lexicographic consecutive primes, but the results concern prime counts,
  irregularities, and residue strings, not Mobius parity inside gap tails.
  Source: https://thornef.github.io/maier-ff.pdf
- Gomez-Perez, Ostafe, and Sha study arithmetic of consecutive polynomial
  sequences over finite fields, including irreducible runs, but not this
  Mobius-parity predictor of the next irreducible gap. Source:
  https://arxiv.org/abs/1509.01936

## Lean-Style Stub

```lean
/- CONJECTURAL statistical statement; this is not a theorem stub with proof. -/

structure F3GapSample where
  degree : Nat
  h : Polynomial (ZMod 3)
  negativeShift : Bool
  directShortGapScrubbed : Bool

def nextIrredGap
  (f : Polynomial (ZMod 3)) : Nat := sorry

def prevIrredGap
  (f : Polynomial (ZMod 3)) : Nat := sorry

def polyMobius
  (f : Polynomial (ZMod 3)) : Int := sorry

def PearsonCorr
  (xs ys : List Rat) : Rat := sorry

def mobiusGapCorr
  (n : Nat) (h : Polynomial (ZMod 3)) : Rat :=
  -- Corr(mu(f-h), nextIrredGap f) over monic irreducible degree-n f
  -- with prevIrredGap f > encoded h.
  sorry

axiom f3_mobius_gap_bias_conjecture :
  exists c : Rat,
    (0.019 : Rat) <= c ∧ c <= (0.024 : Rat) ∧
    -- empirical/conjectural: corr stays near c for h=t as n grows
    True
```

