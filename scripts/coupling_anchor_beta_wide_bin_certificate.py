#!/usr/bin/env python3
"""Wide-bin version of the exact one-core beta transport certificate.

The base certificate uses translation distance 99/100.  This companion uses

    d = 1/2,        R_* = 11/5.

For every |x|<=3/5 and z=x+/-w, w>=1, it proves

    K(z-sign(z-x)d) J(w-d) / cosh(x/2)
        >= R_* 2 exp(-z/2) K(z).

The smaller translation leaves a full half-unit of geometric slack.  Thus
outer target bins of any width h<1/2 may be coupled by normalized products
with their translated anchor bins while still landing strictly inside
separation one.  The factor 11/5 reserve is useful for an explicit
finite-state PNT or Brun--Titchmarsh transfer on the compact-middle stage.

All theta bounds, the exact K-monotonicity audit, the 110,400 compact Arb
boxes, and the analytic w>=4 tail proof are supplied by the imported base
certificate.  Only the two exact rational profile constants are changed.

Reproduce with

    PYTHONPATH=/tmp/pvdeps:scripts python3 -u \
      scripts/coupling_anchor_beta_wide_bin_certificate.py
"""

import coupling_anchor_beta_transport_certificate as base


base.D = base.q(1, 2)
base.R_STAR = base.q(11, 5)


if __name__ == "__main__":
    base.main()
