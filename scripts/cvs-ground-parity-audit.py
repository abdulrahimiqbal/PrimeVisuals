#!/usr/bin/env python3
"""Independent holdout audit for cutoff-free CvS ground-parity separation."""

from __future__ import annotations

import argparse
import importlib.util
import json
from datetime import datetime, timezone
from pathlib import Path

import mpmath as mp


HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location(
    "cvs_parity_core", HERE / "cvs-parity-interlacing-audit.py"
)
CORE = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(CORE)


def audit_cell(c: int, control: str, maximum_n: int):
    even, odd = CORE.build_parity_blocks(c, maximum_n, control)
    rows = []
    for level in range(2, maximum_n + 1):
        even_values = CORE.eigenvalues(CORE.principal(even, level + 1))
        odd_values = CORE.eigenvalues(CORE.principal(odd, level))
        parity_gap = odd_values[0] - even_values[0]
        internal_gap = even_values[1] - even_values[0]
        scale = max(mp.mpf(1), abs(even_values[-1]), abs(odd_values[-1]))
        ratio = odd_values[0] / even_values[0] if even_values[0] != 0 else mp.inf
        rows.append(
            {
                "c": c,
                "control": control,
                "N": level,
                "passes": parity_gap > 0 and internal_gap > 0,
                "even_ground": mp.nstr(even_values[0], 40),
                "odd_ground": mp.nstr(odd_values[0], 40),
                "parity_gap": mp.nstr(parity_gap, 40),
                "relative_parity_gap": mp.nstr(parity_gap / scale, 40),
                "even_internal_gap": mp.nstr(internal_gap, 40),
                "ground_ratio": mp.nstr(ratio, 30),
            }
        )
    return rows


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--max-n", type=int, default=16)
    parser.add_argument("--dps", type=int, default=90)
    parser.add_argument("--cutoffs", default="11,19,23,31,43,59,97")
    parser.add_argument("--out", default="logs/cvs-parity-interlacing")
    args = parser.parse_args()
    mp.mp.dps = args.dps
    cutoffs = [int(value) for value in args.cutoffs.split(",")]
    rows = []
    for c in cutoffs:
        print(f"[cvs-ground] c={c} control=zeta", flush=True)
        rows.extend(audit_cell(c, "zeta", args.max_n))
    for c, control in [(23, "reverse_weights"), (97, "negate_largest")]:
        print(f"[cvs-ground] c={c} control={control}", flush=True)
        rows.extend(audit_cell(c, control, args.max_n))

    zeta = [row for row in rows if row["control"] == "zeta"]
    controls = [row for row in rows if row["control"] != "zeta"]
    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "dps": args.dps,
        "maximum_n": args.max_n,
        "cutoffs": cutoffs,
        "gates": {
            "zeta_ground_dominance": all(row["passes"] for row in zeta),
            "some_control_failure": any(not row["passes"] for row in controls),
        },
        "rows": rows,
    }
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    (out / "ground-parity-audit.json").write_text(json.dumps(report, indent=2) + "\n")
    table = "\n".join(
        f"| {row['c']} | {row['control']} | {row['N']} | "
        f"{'PASS' if row['passes'] else 'FAIL'} | {row['parity_gap']} | "
        f"{row['even_internal_gap']} | {row['ground_ratio']} |"
        for row in rows
    )
    markdown = f"""# Cutoff-free CvS ground-parity holdout

Generated: {report['generated_at']}

- zeta ground dominance: {'PASS' if report['gates']['zeta_ground_dominance'] else 'FAIL'}
- at least one control failure: {'PASS' if report['gates']['some_control_failure'] else 'FAIL'}

| c | source | N | gate | O0-E0 | E1-E0 | O0/E0 |
| ---: | --- | ---: | --- | ---: | ---: | ---: |
{table}

Finite numerical separation is not a proof of the continuum simple-even
condition.  Promotion requires an unconditional comparison theorem and a
non-collapsing limit argument.
"""
    (out / "ground-parity-audit.md").write_text(markdown)
    print(json.dumps(report["gates"], indent=2))


if __name__ == "__main__":
    main()

