# Maynard--Tao variational calibration

Generated: 2026-07-10T14:02:54.936Z

## Outcome

The exact simplex-integral engine passes its initial gates. It reproduces
Maynard's published five-variable certificate exactly, independently
optimizes the complete cubic polynomial space, turns that numerical result
into a rational certificate, and reproduces Maynard's 42-dimensional
`M_105` calculation.

This is a validated research instrument, not a new prime theorem. The modern
Polymath benchmark `M_54 > 4.00238` uses a much richer signature/Krylov
basis and remains the next calibration gate.

## Exact certificates

| witness | exact quotient | decimal | gate |
| --- | ---: | ---: | --- |
| Maynard equation (8.16) | 1417255/708216 | 2.001162074847 | PASS |
| independently optimized cubic, rationalized at 1/10000 | 11148726395/5566329648 | 2.002886479964 | PASS |

The second witness is stronger than the simple published `M_5` witness but
is only a calibration result; later work has already obtained better
`M_5` lower bounds.

## Complete-polynomial degree ladder for k=5

| maximum degree | dimension | numerical quotient | eigen residual | converged |
| ---: | ---: | ---: | ---: | --- |
| 0 | 1 | 1.666666666667 | 4.441e-16 | yes |
| 1 | 6 | 1.950764888225 | 9.400e-7 | yes |
| 2 | 21 | 1.990552559164 | 9.186e-7 | yes |
| 3 | 56 | 2.002887195761 | 8.746e-7 | yes |
| 4 | 126 | 2.005879371457 | 9.916e-7 | yes |

## Maynard symmetric basis (1-P1)^b P2^c, b+2c<=11

| k | dimension | numerical quotient | published comparison | status |
| ---: | ---: | ---: | --- | --- |
| 54 | 42 | 3.699945714759 | 4.00238 (Polymath, richer basis) | BASIS TOO SMALL |
| 105 | 42 | 4.002069762947 | 4.0020697 (Maynard) | REPRODUCED |

## Polymath Krylov basis

| k | dimension | highest exact moment | numerical quotient | residual | status |
| ---: | ---: | ---: | ---: | ---: | --- |
| 5 | 10 | 19 | 2.007140291426 | 6.624e-8 | PUBLISHED TABLE VALUE REPRODUCED |
| 54 | 8 | 15 | 3.699398868216 | 6.013e-10 | STABLE PARTIAL LADDER |

The Krylov moment generator is exact; the displayed eigenproblem is solved in
double precision. At larger dimensions the Hankel matrix becomes severely
ill-conditioned, so a high-precision eigensolver and exact rationalized
certificate are mandatory before extending the k=54 ladder.

## Gate state

- exact published `M_5` certificate: PASS
- independent exact cubic certificate above 2.0028: PASS
- numerical `M_105` reproduction: PASS
- Krylov `M_5 ~= 2.00714` reproduction: PASS
- modern `M_54` reproduction: OPEN

## Next forced step

Extend the now-implemented Krylov engine with high-precision linear algebra,
reach the published depth, rationalize the result, and reproduce
`M_54 > 4.00238`. Only after that gate passes may the campaign search
held-out basis families for a strict rationally certified improvement.

Verdict: **CALIBRATION PASSED THROUGH MAYNARD 2015; MODERN M54 GATE OPEN**.
