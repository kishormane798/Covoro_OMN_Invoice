#!/usr/bin/env bash
# Compute Playwright --shard plan for CI.
# Field and formula run as a single job (no --shard split).
# Conditional still shards to ≈100 tests per job.
# Usage: ci_playwright_shard_plan.sh <covoro_field|covoro_formula|covoro_conditional> [single_shard|all]
set -euo pipefail

MODE="${1:?mode required (covoro_field | covoro_formula | covoro_conditional)}"
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

# Field and formula: one job, full spec. Conditional: ≈100 tests per shard.
SHARD_TOTAL=1
if [ "$MODE" = "covoro_conditional" ]; then
  if command -v npx >/dev/null 2>&1 && [ -f "$SPEC" ]; then
    COUNT="$(npx playwright test "$SPEC" --project=chromium --list 2>/dev/null \
      | sed -n 's/^Total: \([0-9][0-9]*\) tests.*/\1/p' | head -1 || true)"
    if [ -n "${COUNT:-}" ]; then
      SHARD_TOTAL="$(shard_total_for_count "$COUNT")"
    else
      SHARD_TOTAL=3
    fi
  else
    SHARD_TOTAL=3
  fi
else
  # Ignore 1–5 dropdown for field/formula so a leftover shard pick still runs the full spec.
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
