#!/usr/bin/env bash
# Resolve which Covoro spec CI should run. All suites run as one full job (no Playwright --shard).
# UI suites run the full spec (no OMN_UI_SPEC_PART split). Legacy *_1 / *_2 names still map to the same spec.
# Usage: ci_playwright_shard_plan.sh <mode> [ignored_shard_filter]
set -euo pipefail

MODE="${1:?mode required}"

PROJECT="chromium"
SPEC=""

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
  simplified_field)
    SPEC="tests/OMN_FieldValidation_SimplifiedTemplate_Test.spec.ts"
    ;;
  simplified_conditional)
    SPEC="tests/OMN_ConditionalValidation_SimplifiedTemplate_Test.spec.ts"
    ;;
  simplified_formula)
    SPEC="tests/OMN_FormulaValidation_SimplifiedTemplate_Test.spec.ts"
    ;;
  simplified_submit_single)
    SPEC="tests/OMN_SubmitInvoice_SimplifiedTemplate_Test.spec.ts"
    ;;
  simplified_submit_multi)
    SPEC="tests/OMN_SubmitInvoice_MultiItem_SimplifiedTemplate_Test.spec.ts"
    ;;
  covoro_ui_create|covoro_ui_create_[12])
    SPEC="tests/OMAN_UI_SPEC/OMN_UIInvoice_Create_Test.spec.ts"
    PROJECT="chromium-ui"
    ;;
  covoro_ui_conditional_create|covoro_ui_conditional_create_[12])
    SPEC="tests/OMAN_UI_SPEC/OMN_UIInvoice_Conditional_Create_Test.spec.ts"
    PROJECT="chromium-ui"
    ;;
  covoro_ui_edit|covoro_ui_edit_[12])
    SPEC="tests/OMAN_UI_SPEC/OMN_UIInvoice_Edit_Test.spec.ts"
    PROJECT="chromium-ui"
    ;;
  covoro_ui_conditional_edit|covoro_ui_conditional_edit_[12])
    SPEC="tests/OMAN_UI_SPEC/OMN_UIInvoice_Conditional_Edit_Test.spec.ts"
    PROJECT="chromium-ui"
    ;;
  covoro_ui_copy|covoro_ui_copy_[12])
    SPEC="tests/OMAN_UI_SPEC/OMN_UIInvoice_Copy_Test.spec.ts"
    PROJECT="chromium-ui"
    ;;
  covoro_ui_conditional_copy|covoro_ui_conditional_copy_[12])
    SPEC="tests/OMAN_UI_SPEC/OMN_UIInvoice_Conditional_Copy_Test.spec.ts"
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
