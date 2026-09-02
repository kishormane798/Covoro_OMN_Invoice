#!/usr/bin/env bash
# Resolve which Covoro spec CI should run. All suites run as one full job (no --shard).
# Usage: ci_playwright_shard_plan.sh <mode> [ignored_shard_filter]
set -euo pipefail

MODE="${1:?mode required (covoro_field | covoro_formula | covoro_conditional | covoro_submit_single | covoro_submit_multi | covoro_ui_create | covoro_ui_conditional_create | covoro_ui_edit | covoro_ui_copy)}"

PROJECT="chromium"

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
  covoro_ui_create)
    SPEC="tests/KISHOR_UI/OMN_UIInvoice_Create_Test.spec.ts"
    PROJECT="chromium-ui"
    ;;
  covoro_ui_conditional_create)
    SPEC="tests/KISHOR_UI/OMN_UIInvoice_Conditional_Create_Test.spec.ts"
    PROJECT="chromium-ui"
    ;;
  covoro_ui_edit)
    SPEC="tests/KISHOR_UI/*Edit_Test.spec.ts"
    PROJECT="chromium-ui"
    ;;
  covoro_ui_copy)
    SPEC="tests/KISHOR_UI/*Copy_Test.spec.ts"
    PROJECT="chromium-ui"
    ;;
  *)
    echo "::error::Unknown suite MODE='$MODE'"
    exit 1
    ;;
esac

SHARD_TOTAL=1
SHARD_INDICES="[1]"
SHARD_SIZE="${PW_CI_SHARD_SIZE:-100}"
JOB_TIMEOUT_MINUTES="${PW_CI_FULL_SUITE_TIMEOUT_MINUTES:-240}"

{
  echo "mode=$MODE"
  echo "spec=$SPEC"
  echo "project=$PROJECT"
  echo "shard_total=$SHARD_TOTAL"
  echo "shard_indices=$SHARD_INDICES"
  echo "shard_size=$SHARD_SIZE"
  echo "job_timeout_minutes=$JOB_TIMEOUT_MINUTES"
} >> "${GITHUB_OUTPUT:?}"

echo "Suite $MODE → spec $SPEC, project $PROJECT, full suite (no shard), timeout ${JOB_TIMEOUT_MINUTES}m"
