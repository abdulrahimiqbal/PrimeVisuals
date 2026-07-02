# Prime Crack Atlas Evidence Pack

Generated: 2026-06-16T17:54:34.436Z
Manifest cycle: 1
Range N: 48000

## Breakthrough Status

No breakthrough has passed the gate in this cycle. The next cycle is selected by the failure taxonomy, not by lowering thresholds.

## Top Rows

| id | family | z | effect | verdict | death reason |
| --- | --- | ---: | ---: | --- | --- |
| `residue:transition_mod_17:lo_s_residual` | residue-transition | 60.420 | 0.859386 | rejected | insufficient power |
| `residue:transition_mod_13:lo_s_residual` | residue-transition | 48.405 | 0.688483 | rejected | insufficient power |
| `residue:transition_mod_11:lo_s_residual` | residue-transition | 40.344 | 0.573832 | rejected | insufficient power |
| `residue:transition_mod_7:lo_s_residual` | residue-transition | 27.548 | 0.391834 | rejected | insufficient power |
| `residue:transition_mod_5:lo_s_residual` | residue-transition | 23.085 | 0.328349 | rejected | insufficient power |
| `summatory:lambda_minus_1:window_64:local_mean` | local-summatory | -19.266 | -0.505798 | rejected | insufficient power |
| `summatory:lambda_minus_1:window_log2:local_mean` | local-summatory | -18.491 | -0.455875 | rejected | insufficient power |
| `summatory:lambda_minus_1:window_256:local_mean` | local-summatory | -15.948 | -0.333471 | rejected | insufficient power |
| `nearby:omega_p_plus_2:conditional_prev_gap` | nearby-arithmetic | -8.567 | -0.131096 | rejected | insufficient power |
| `nearby:omega_p_plus_2:corr_next_gap` | nearby-arithmetic | -8.172 | -0.125054 | rejected | insufficient power |
| `nearby:omega_p_plus_2:bin_mean_gap` | nearby-arithmetic | -7.187 | -0.160348 | rejected | insufficient power |

## Failure Summary

```json
{
  "deathReasonCounts": {
    "insufficient power": 11
  },
  "nextCycle": {
    "topDeathReason": "insufficient power",
    "addExactlyOneCoordinateFamily": "increase range and keep only the highest-power coordinate families"
  }
}
```

## Frozen Known-Artifact Exclusions

- raw residue expsum peaks
- matrix stripes / residue geometry
- ordinary adjacent gap autocorrelation
- Lemke Oliver-Soundararajan residue-pair bias
- Hardy-Littlewood singular-series main terms
- cumulative gap telescoping
- Chebyshev psi / Mertens / zeta-zero summatory cancellation

## Next Cycle Rule

```json
{
  "topDeathReason": "insufficient power",
  "addExactlyOneCoordinateFamily": "increase range and keep only the highest-power coordinate families"
}
```
