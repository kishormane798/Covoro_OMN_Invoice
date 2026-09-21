#!/usr/bin/env bash
# Resolve the next Playwright suite for CI queue-next.
# Usage: ci_queue_next.sh <CURRENT> <WAVE>
# WAVE=true: cron / Copy with scheduled_wave — Copy → Conditional Copy → Simplified field → formula → conditional.
# Otherwise: family pair only (Create/Edit/Covoro/Simplified/Copy pair). Submit and unknown → empty next.
set -euo pipefail

CURRENT="${1:-}"
WAVE="${2:-false}"
NEXT=""
DISPATCH_WAVE="false"

cron_next() {
  case "$1" in
    covoro_ui_copy) echo "covoro_ui_conditional_copy" ;;
    covoro_ui_conditional_copy) echo "simplified_field" ;;
    simplified_field) echo "simplified_formula" ;;
    simplified_formula) echo "simplified_conditional" ;;
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
