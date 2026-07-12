# Evidence — exact Maynard witness kill campaign

Date: 2026-07-12

## Source audit

The comparison target is the standard-simplex variational quantity `M_54` in
Polymath8b, *Variants of the Selberg sieve, and bounded intervals containing
many primes* (Research in the Mathematical Sciences 1:12, 2014), section 7.
The paper proves `M_54 > 4.00238` with the symmetric signature basis
`(1-P_1)^a P_alpha`, retaining even signatures through degree 23.  This is a
matrix of more than 1,500 rows, and the entries are exact rational numbers.

The same section separately reports the Krylov-space lower bound for `k=54`
as `4.00223` for the 25-dimensional basis
`1,L1,...,L^24 1`.  Therefore `4.00223` is the proper Krylov implementation
calibration, while the richer signature witness `4.00238` is the existing
record/discovery comparator.  The preregistration called the latter a
calibration target; this source audit records the distinction without changing
the frozen field-level pass gate.

Primary source:

- D. H. J. Polymath, DOI `10.1186/s40687-014-0012-7`, section 7.1 and Table 3;
  source PDF audited at `https://real.mtak.hu/190045/1/1407.4897.pdf`.

## Exact ladder

All displayed quotients below are rational Rayleigh quotients evaluated from
exact moments.  High-precision generalized eigenvectors only propose the
coefficients; the recorded rationalized coefficients are substituted back
into the exact `BigInt` matrices.

| `k` | Krylov dimension | final moment terms | exact quotient (decimal) | result |
| ---: | ---: | ---: | ---: | --- |
| 54 | 16 | 35,471 | `3.94135412891198086578...` | below 4 |
| 54 | 20 | 177,970 | `3.98044294885608822599...` | below 4 |
| 54 | 21 | 259,891 | `3.98654743213483860019...` | below 4 |

The dimension-21 calculation used 110 decimal digits, 42 exact moments, a
60-decimal rational coefficient scale, and converged with numerical residual
`8.472984130309e-79`.  Its exact quotient is

`242253447624824513070959808323230991795867083316629567416629426571187366215936416001028473002440226499232963305850807987240994661764665911342887784212227937767825256272584669747`

divided by

`60767732417295035734722418816295975329067856922088497965815268513755040733191898637498358438280933425247410133209639132905119687520290237449718577345151056659788128391903692641`.

Independent integer comparison gives

- numerator `< 4 * denominator`;
- `50000 * numerator < 200119 * denominator`, hence the quotient is also
  strictly below `4.00238` without decimal rounding.

The full coefficient vector and quotient are in
`logs/maynard-variational/krylov-k54-n21-p110.json`.

## Conditioning and stop gate

The ordinary double-precision dimension-21 generalized eigenproblem failed
Cholesky factorization at row 14 with pivot
`-7.564707705278496e-13`.  The 110-digit solver recovered a valid exact
witness, showing that this was numerical ill-conditioning rather than a
mathematical negative direction.

But the recovered witness remains `0.013452567865...` below 4 and
`0.015832567865...` below the frozen `4.00238` comparator.  At only one extra
Krylov row, the exact final polynomial grew from 177,970 to 259,891 terms.
The primary source already says that the published deeper Krylov row reaches
only `4.00223`, still below the signature-basis theorem.

The preregistered stop rule therefore fires at dimension 21: further exact
Krylov moment expansion toward dimension 25 is an expensive reproduction of a
published weaker value, not a credible search for a field-level theorem.
Dimensions 22, 24, and 26 were not run after this stop.  Consequently the
repo's high-precision Krylov implementation remains only partially calibrated
against its own published `4.00223` row, even though the field-level outcome is
already determined by the source comparison.

## Gate table

| gate | outcome | evidence |
| --- | --- | --- |
| field-level `M_54 > 4.00238` comparator | **FAIL** | dimension 21 is `3.986547...`; published Krylov depth is `4.00223` |
| reproduce published Krylov `4.00223` | **INCOMPLETE** | stopped at dimension 21 before the known 25-dimensional row |
| held-out strict improvement | **NOT OPENED** | calibration gate failed |
| independent exact recomputation | **PASS for the failed cell** | exact quotient and integer comparisons rechecked |
| new bounded-gap consequence | **FAIL** | no improved `M_k`; no new admissible-tuple diameter input |

Even an exact `M_54` improvement past `4.00238` would not improve the present
numerical bounded-gap consequence: `M_54>4` already crosses the applicable
threshold and Polymath8b records `H(54)=270` exactly.  The paper identifies
`M_53>4` as a consequence-changing target, lowering the Elliott--Halberstam
bound for two consecutive gaps from 270 to 264.

The engine remains useful for exact calibration and for testing richer basis
implementations.  This `k=54` Krylov campaign does not survive as a field-level
discovery route.
