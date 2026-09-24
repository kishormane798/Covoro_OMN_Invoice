#!/usr/bin/env bash
# Resolve which spec CI should run.
# covoro_submit_single and "submit N" use Playwright shards of at most 400 tests.
# covoro_ui_submit and "ui submit N" use the same split on Create Invoice UI submit.
# TEST_COUNT must be set for those modes (from `playwright test --list`).
# "submit N" / "ui submit N" runs only shard N. covoro_submit_single / covoro_ui_submit runs every shard.
# Every other suite is one job (shard 1/1).
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
  covoro_submit_single|submit\ [1-9]*)
    SPEC="tests/OMN_SubmitInvoice_CovoroTemplate_Test.spec.ts"
    ;;
  covoro_ui_submit|ui\ submit\ [1-9]*)
    SPEC="tests/OMAN_UI_SPEC/OMN_UISubmitInvoice_Test.spec.ts"
    PROJECT="chromium-ui"
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
SUBMIT_SHARD_SIZE="${PW_CI_SUBMIT_SHARD_SIZE:-400}"

if [ "$MODE" = "covoro_submit_single" ] || [[ "$MODE" =~ ^submit\ [1-9][0-9]*$ ]] \
  || [ "$MODE" = "covoro_ui_submit" ] || [[ "$MODE" =~ ^ui\ submit\ [1-9][0-9]*$ ]]; then
  if ! [[ "${TEST_COUNT:-}" =~ ^[1-9][0-9]*$ ]]; then
    echo "::error::${MODE} requires TEST_COUNT from playwright test --list"
    exit 1
  fi
  SHARD_SIZE="$SUBMIT_SHARD_SIZE"
  SHARD_TOTAL=$(( (TEST_COUNT + SHARD_SIZE - 1) / SHARD_SIZE ))
  if [[ "$MODE" =~ ^(ui )?submit\ ([1-9][0-9]*)$ ]]; then
    SELECTED="${BASH_REMATCH[2]}"
    if [ "$SELECTED" -gt "$SHARD_TOTAL" ]; then
      echo "::error::${MODE} is past the split. ${TEST_COUNT} tests make ${SHARD_TOTAL} groups of ${SHARD_SIZE}."
      exit 1
    fi
    SHARD_INDICES="[${SELECTED}]"
  else
    SHARD_INDICES="["
    for i in $(seq 1 "$SHARD_TOTAL"); do
      if [ "$i" -gt 1 ]; then
        SHARD_INDICES+=","
      fi
      SHARD_INDICES+="$i"
    done
    SHARD_INDICES+="]"
  fi
fi

{
  echo "mode=$MODE"
  echo "spec=$SPEC"
  echo "project=$PROJECT"
  echo "shard_total=$SHARD_TOTAL"
  echo "shard_indices=$SHARD_INDICES"
  echo "shard_size=$SHARD_SIZE"
  echo "job_timeout_minutes=$JOB_TIMEOUT_MINUTES"
} >> "${GITHUB_OUTPUT:?}"

echo "Suite $MODE → spec $SPEC, project $PROJECT, shards ${SHARD_TOTAL} x up to ${SHARD_SIZE} (indices ${SHARD_INDICES}), timeout ${JOB_TIMEOUT_MINUTES}m"
