#!/usr/bin/env bash
# Resolve which Covoro spec CI should run. All suites run as one full job (no Playwright --shard).
# UI numbered suites reuse the same spec file and set OMN_UI_SPEC_PART (max 200 tests).
# Usage: ci_playwright_shard_plan.sh <mode> [ignored_shard_filter]
set -euo pipefail

MODE="${1:?mode required}"

PROJECT="chromium"
SPEC=""
UI_SPEC_PART=""

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
  covoro_ui_create_[1234])
    SPEC="tests/KISHOR_UI/OMN_UIInvoice_Create_Test.spec.ts"
    PROJECT="chromium-ui"
    UI_SPEC_PART="${MODE##*_}"
    ;;
  covoro_ui_conditional_create_[1234])
    SPEC="tests/KISHOR_UI/OMN_UIInvoice_Conditional_Create_Test.spec.ts"
    PROJECT="chromium-ui"
    UI_SPEC_PART="${MODE##*_}"
    ;;
  covoro_ui_edit_[1234])
    SPEC="tests/KISHOR_UI/OMN_UIInvoice_Edit_Test.spec.ts"
    PROJECT="chromium-ui"
    UI_SPEC_PART="${MODE##*_}"
    ;;
  covoro_ui_conditional_edit_[1234])
    SPEC="tests/KISHOR_UI/OMN_UIInvoice_Conditional_Edit_Test.spec.ts"
    PROJECT="chromium-ui"
    UI_SPEC_PART="${MODE##*_}"
    ;;
  covoro_ui_copy_[1234])
    SPEC="tests/KISHOR_UI/OMN_UIInvoice_Copy_Test.spec.ts"
    PROJECT="chromium-ui"
    UI_SPEC_PART="${MODE##*_}"
    ;;
  covoro_ui_conditional_copy_[1234])
    SPEC="tests/KISHOR_UI/OMN_UIInvoice_Conditional_Copy_Test.spec.ts"
    PROJECT="chromium-ui"
    UI_SPEC_PART="${MODE##*_}"
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
  echo "ui_spec_part=$UI_SPEC_PART"
  echo "shard_total=$SHARD_TOTAL"
  echo "shard_indices=$SHARD_INDICES"
  echo "shard_size=$SHARD_SIZE"
  echo "job_timeout_minutes=$JOB_TIMEOUT_MINUTES"
} >> "${GITHUB_OUTPUT:?}"

if [ -n "$UI_SPEC_PART" ]; then
  echo "Suite $MODE → spec $SPEC part ${UI_SPEC_PART}/4, project $PROJECT, timeout ${JOB_TIMEOUT_MINUTES}m"
else
  echo "Suite $MODE → spec $SPEC, project $PROJECT, full suite (no shard), timeout ${JOB_TIMEOUT_MINUTES}m"
fi
