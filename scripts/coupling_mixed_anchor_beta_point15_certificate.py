#!/usr/bin/env python3
"""Exact full-mass compact-anchor--beta transport below distance 3/20.

For every ``|x|<=3/5`` and either limiting inward-prime law

    beta_sigma(dz) = 2 exp(-sigma*z/2) K(z) dz,

this certificate constructs a coupling of all mass ``1/2`` to the capacity
``nu_x+(1/2)delta_x`` supported on ``|z-u|<3/20``.  It is the sharper-radius
instance of ``coupling_mixed_anchor_beta_full_certificate``; all density,
upper-demand, lower-supply, exact-flow, row-scaling, Borel-kernel and tail
arguments in that module are unchanged.

Only two parameters are tightened.  Middle product rectangles must have
diameter below ``149/1000``, leaving a strict guard below ``3/20``.  The
already certified tail translation has distance ``1/10``.  Deleting every
newly incompatible finite-flow edge can only reduce the supply ledger, so a
successful exact rerun is a proof for the smaller support rather than an
inference from the earlier ``2/5`` result.

Finite-source consequence.  Fix ``lambda<1/2`` and truncate the beta tails
at a finite W with retained mass above lambda.  Ordinary weighted-PNT
convergence on the resulting finite half-open bin list lets the same upper
ledgers serve every sufficiently remote physical inward-prime measure.
After thinning, this gives an exact rate-lambda core--outer entrance clock
with target separation strictly below ``3/20``.  No PNT error term or
finite-height sample is used.
"""

from __future__ import annotations

import coupling_mixed_anchor_beta_full_certificate as certificate


TARGET_D = certificate.base.q(3, 20)
MIDDLE_D = certificate.base.q(149, 1000)


def main() -> None:
    certificate.TARGET_D = TARGET_D
    certificate.MIDDLE_D = MIDDLE_D
    assert certificate.base.TAIL_SHIFT < TARGET_D
    assert MIDDLE_D < TARGET_D
    certificate.main()


if __name__ == "__main__":
    main()
