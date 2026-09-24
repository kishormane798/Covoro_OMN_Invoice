#!/usr/bin/env bash
# Resolve the next Playwright suite for CI queue-next.
# Usage: ci_queue_next.sh <CURRENT> <WAVE> [SHARD_TOTAL]
# WAVE=true: cron / Copy with scheduled_wave —
# Copy → Conditional Copy → Simplified field → Simplified conditional → Edit → Create → Covoro submit multi-item.
# Manual "submit N" chains to "submit N+1" while N+1 is within SHARD_TOTAL (400 tests each).
# Manual "ui submit N" chains the same way.
# Formula stays on the manual family chain only.
# Otherwise: family pair only (Create/Edit/Covoro/Simplified/Copy pair). Unknown → empty next.
set -euo pipefail

CURRENT="${1:-}"
WAVE="${2:-false}"
SHARD_TOTAL="${3:-}"
NEXT=""
DISPATCH_WAVE="false"

if [[ "$CURRENT" =~ ^(ui )?submit\ ([1-9][0-9]*)$ ]]; then
  PREFIX="${BASH_REMATCH[1]}"
  NEXT_N=$(( ${BASH_REMATCH[2]} + 1 ))
  if [[ "$SHARD_TOTAL" =~ ^[1-9][0-9]*$ ]] && [ "$NEXT_N" -le "$SHARD_TOTAL" ]; then
    NEXT="${PREFIX}submit ${NEXT_N}"
  fi
  echo "next=${NEXT}"
  echo "dispatch_wave=${DISPATCH_WAVE}"
  if [ -n "${GITHUB_OUTPUT:-}" ]; then
    echo "next=${NEXT}" >> "$GITHUB_OUTPUT"
    echo "dispatch_wave=${DISPATCH_WAVE}" >> "$GITHUB_OUTPUT"
  fi
  exit 0
fi

cron_next() {
  case "$1" in
    covoro_ui_copy) echo "covoro_ui_conditional_copy" ;;
    covoro_ui_conditional_copy) echo "simplified_field" ;;
    simplified_field) echo "simplified_conditional" ;;
    simplified_conditional) echo "covoro_ui_edit" ;;
    covoro_ui_edit) echo "covoro_ui_create" ;;
    covoro_ui_create) echo "covoro_submit_multi" ;;
    *) echo "" ;;
  esac
}

family_next() {
  case "$1" in
    covoro_ui_create) echo "covoro_ui_conditional_create" ;;
    covoro_ui_edit) echo "covoro_ui_conditional_edit" ;;
    covoro_field) echo "covoro_formula" ;;
    covoro_formula) echo "covoro_conditional" ;;
    simplified_field) echo "simplified_formula" ;;
    simplified_formula) echo "simplified_conditional" ;;
    covoro_ui_copy) echo "covoro_ui_conditional_copy" ;;
    *) echo "" ;;
  esac
}

if [ "$WAVE" = "true" ]; then
  CRON="$(cron_next "$CURRENT")"
  if [ -n "$CRON" ]; then
    NEXT="$CRON"
    DISPATCH_WAVE="true"
  else
    NEXT="$(family_next "$CURRENT")"
    DISPATCH_WAVE="false"
  fi
else
  NEXT="$(family_next "$CURRENT")"
  DISPATCH_WAVE="false"
fi

echo "next=${NEXT}"
echo "dispatch_wave=${DISPATCH_WAVE}"
if [ -n "${GITHUB_OUTPUT:-}" ]; then
  echo "next=${NEXT}" >> "$GITHUB_OUTPUT"
  echo "dispatch_wave=${DISPATCH_WAVE}" >> "$GITHUB_OUTPUT"
fi
