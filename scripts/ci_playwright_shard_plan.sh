#!/usr/bin/env bash
# Compute Playwright --shard plan for CI.
# Field and formula run as a single job (no --shard split).
# Conditional and submit still shards to ≈100 tests per job.
# Submit + all starts shard 1 only; playwright.yml chains remaining shards sequentially
# (same TIN slots — do not run submit shards in parallel).
# Usage: ci_playwright_shard_plan.sh <mode> [single_shard|all]
set -euo pipefail

MODE="${1:?mode required (covoro_field | covoro_formula | covoro_conditional | covoro_submit_single | covoro_submit_multi)}"
SHARD_FILTER="${2:-all}"
SHARD_SIZE="${PW_CI_SHARD_SIZE:-100}"

case "$MODE" in
  covoro_field)
    SPEC="tests/OMN_FieldValidation_CovoroTemplate_Test.spec.ts"
    ;;
  covoro_conditional)
    SPEC="tests/OMN_ConditionalValidation_CovoroTemplate_Test.spec.ts"
    ;;
  covoro_formula)
    SPEC="tests/OMN_FormulaValidation_CovoroTemplate_Test.spec.ts"
    ;;
  covoro_submit_single)
    SPEC="tests/OMN_SubmitInvoice_CovoroTemplate_Test.spec.ts"
    ;;
  covoro_submit_multi)
    SPEC="tests/OMN_SubmitInvoice_MultiItem_CovoroTemplate_Test.spec.ts"
    ;;
  *)
    echo "::error::Unknown suite MODE='$MODE'"
    exit 1
    ;;
esac

shard_total_for_count() {
  local count="$1"
  if [ "$count" -le 0 ]; then
    echo 1
    return
  fi
  echo $(( (count + SHARD_SIZE - 1) / SHARD_SIZE ))
}

# Field and formula: one job, full spec. Conditional / submit: ≈100 tests per shard.
is_sharded_mode() {
  case "$1" in
    covoro_conditional|covoro_submit_single|covoro_submit_multi) return 0 ;;
    *) return 1 ;;
  esac
}

default_shard_total() {
  case "$1" in
    covoro_submit_single) echo 20 ;;
    covoro_submit_multi) echo 5 ;;
    *) echo 3 ;;
  esac
}

SHARD_TOTAL=1
if is_sharded_mode "$MODE"; then
  FALLBACK_TOTAL="$(default_shard_total "$MODE")"
  if command -v npx >/dev/null 2>&1 && [ -f "$SPEC" ]; then
    COUNT="$(npx playwright test "$SPEC" --project=chromium --list 2>/dev/null \
      | sed -n 's/^Total: \([0-9][0-9]*\) tests.*/\1/p' | head -1 || true)"
    if [ -n "${COUNT:-}" ]; then
      SHARD_TOTAL="$(shard_total_for_count "$COUNT")"
    else
      SHARD_TOTAL="$FALLBACK_TOTAL"
    fi
  else
    SHARD_TOTAL="$FALLBACK_TOTAL"
  fi
else
  # Ignore 1–N dropdown for field/formula so a leftover shard pick still runs the full spec.
  SHARD_FILTER="all"
fi

if [ "$SHARD_TOTAL" -lt 1 ]; then
  SHARD_TOTAL=1
fi

if [ "$SHARD_FILTER" != "all" ]; then
  if ! [[ "$SHARD_FILTER" =~ ^[0-9]+$ ]]; then
    echo "::error::Invalid shard filter '$SHARD_FILTER' (use all or a positive integer)"
    exit 1
  fi
  if [ "$SHARD_FILTER" -gt "$SHARD_TOTAL" ]; then
    echo "::error::Requested shard $SHARD_FILTER but suite only has $SHARD_TOTAL shard(s)"
    exit 1
  fi
  SHARD_INDICES="[$SHARD_FILTER]"
elif [ "$MODE" = "covoro_submit_single" ] || [ "$MODE" = "covoro_submit_multi" ]; then
  # Sequential only (shared TIN slots). queue-next walks 2..N after this run.
  SHARD_INDICES="[1]"
else
  SHARD_INDICES="$(python3 -c "import json; print(json.dumps(list(range(1, int('${SHARD_TOTAL}') + 1))))")"
fi

if [ "$MODE" = "covoro_conditional" ]; then
  JOB_TIMEOUT_MINUTES="${PW_CI_JOB_TIMEOUT_MINUTES:-45}"
else
  JOB_TIMEOUT_MINUTES="${PW_CI_FULL_SUITE_TIMEOUT_MINUTES:-240}"
fi

{
  echo "mode=$MODE"
  echo "spec=$SPEC"
  echo "shard_total=$SHARD_TOTAL"
  echo "shard_indices=$SHARD_INDICES"
  echo "shard_size=$SHARD_SIZE"
  echo "job_timeout_minutes=$JOB_TIMEOUT_MINUTES"
} >> "${GITHUB_OUTPUT:?}"

if [ "$SHARD_TOTAL" -gt 1 ]; then
  echo "Suite $MODE → spec $SPEC, shards $SHARD_INDICES / $SHARD_TOTAL (~$SHARD_SIZE tests each), timeout ${JOB_TIMEOUT_MINUTES}m"
else
  echo "Suite $MODE → spec $SPEC, full suite (no shard), timeout ${JOB_TIMEOUT_MINUTES}m"
fi
