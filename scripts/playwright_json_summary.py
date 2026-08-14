#!/usr/bin/env python3
"""Summarize Playwright JSON results for the CI email digest.

Reads the Playwright JSON report (produced by the `json` reporter in
playwright.config.ts) and writes pass/fail/skip/flaky/total/overall to
$GITHUB_OUTPUT so the workflow email step can render the counts.

Report path resolution order:
  1. $PLAYWRIGHT_JSON_OUTPUT_NAME (same env the reporter honors)
  2. test-results/results.json  (repo default)
  3. first *.json under test-results/ or repo root that looks like a report

If no report is found, all counts default to 0 and overall = "unknown"
(the previous behavior — but now with a clear stderr note explaining why).
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

CANDIDATE_PATHS = [
    "test-results/results.json",
    "results.json",
    "playwright-report/results.json",
]


def find_report() -> Path | None:
    env_path = os.environ.get("PLAYWRIGHT_JSON_OUTPUT_NAME", "").strip()
    if env_path:
        p = Path(env_path)
        if p.is_file():
            return p
    for candidate in CANDIDATE_PATHS:
        p = Path(candidate)
        if p.is_file():
            return p
    return None


def counts_from_stats(report: dict) -> dict | None:
    """Prefer Playwright's own top-level stats block when present."""
    stats = report.get("stats")
    if not isinstance(stats, dict):
        return None
    if not any(k in stats for k in ("expected", "unexpected", "flaky", "skipped")):
        return None
    passed = int(stats.get("expected", 0) or 0)
    failed = int(stats.get("unexpected", 0) or 0)
    flaky = int(stats.get("flaky", 0) or 0)
    skipped = int(stats.get("skipped", 0) or 0)
    return {"passed": passed, "failed": failed, "flaky": flaky, "skipped": skipped}


def counts_from_walk(report: dict) -> dict:
    """Fallback: walk suites → specs and classify by per-spec status."""
    passed = failed = skipped = flaky = 0

    def visit(suite: dict) -> None:
        nonlocal passed, failed, skipped, flaky
        for spec in suite.get("specs", []) or []:
            tests = spec.get("tests", []) or []
            spec_failed = False
            spec_flaky = False
            spec_skipped = False
            spec_has_result = False
            for t in tests:
                results = t.get("results", []) or []
                statuses = [r.get("status") for r in results]
                if statuses:
                    spec_has_result = True
                # A test is flaky when it failed then passed on retry.
                if any(s in ("passed", "expected") for s in statuses) and any(
                    s in ("failed", "timedOut", "interrupted") for s in statuses
                ):
                    spec_flaky = True
                outcome = t.get("status")  # expected / unexpected / flaky / skipped
                if outcome == "unexpected":
                    spec_failed = True
                elif outcome == "flaky":
                    spec_flaky = True
                elif outcome == "skipped":
                    spec_skipped = True
                if all(s == "skipped" for s in statuses) and statuses:
                    spec_skipped = True
            if spec_flaky and not spec_failed:
                flaky += 1
            elif spec_failed:
                failed += 1
            elif spec_skipped or not spec_has_result:
                skipped += 1
            else:
                passed += 1
        for child in suite.get("suites", []) or []:
            visit(child)

    for suite in report.get("suites", []) or []:
        visit(suite)

    return {"passed": passed, "failed": failed, "flaky": flaky, "skipped": skipped}


def write_outputs(values: dict) -> None:
    line_block = "".join(f"{k}={v}\n" for k, v in values.items())
    out_path = os.environ.get("GITHUB_OUTPUT")
    if out_path:
        with open(out_path, "a", encoding="utf-8") as fh:
            fh.write(line_block)
    # Always echo to the log for debugging.
    sys.stdout.write(line_block)


def main() -> int:
    report_path = find_report()
    if report_path is None:
        sys.stderr.write(
            "playwright_json_summary: no JSON report found "
            f"(looked at $PLAYWRIGHT_JSON_OUTPUT_NAME and {CANDIDATE_PATHS}). "
            "Ensure the Playwright `json` reporter ran. Reporting zeros.\n"
        )
        write_outputs(
            {
                "passed": 0,
                "failed": 0,
                "skipped": 0,
                "flaky": 0,
                "total": 0,
                "overall": "unknown",
            }
        )
        return 0

    try:
        report = json.loads(report_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        sys.stderr.write(f"playwright_json_summary: failed to read {report_path}: {exc}. Reporting zeros.\n")
        write_outputs(
            {
                "passed": 0,
                "failed": 0,
                "skipped": 0,
                "flaky": 0,
                "total": 0,
                "overall": "unknown",
            }
        )
        return 0

    counts = counts_from_stats(report) or counts_from_walk(report)
    passed = counts["passed"]
    failed = counts["failed"]
    skipped = counts["skipped"]
    flaky = counts["flaky"]
    total = passed + failed + skipped + flaky

    # Any skip fails the digest: all-skip (pass/fail/flaky = 0) or mixed with other counts.
    if total == 0:
        overall = "unknown"
    elif failed > 0 or skipped > 0:
        overall = "failed"
    else:
        overall = "passed"

    sys.stderr.write(f"playwright_json_summary: parsed {report_path}\n")
    write_outputs(
        {
            "passed": passed,
            "failed": failed,
            "skipped": skipped,
            "flaky": flaky,
            "total": total,
            "overall": overall,
        }
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
