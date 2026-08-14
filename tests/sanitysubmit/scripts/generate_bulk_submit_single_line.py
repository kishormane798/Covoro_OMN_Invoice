"""Shim — bulk submit generators live under tests/kishorsubmit/scripts/."""
from __future__ import annotations

import runpy
from pathlib import Path

runpy.run_path(
    str(
        Path(__file__).resolve().parent.parent
        / "kishorsubmit"
        / "scripts"
        / "generate_bulk_submit_single_line.py"
    ),
    run_name="__main__",
)
