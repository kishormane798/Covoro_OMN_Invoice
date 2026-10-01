#!/usr/bin/env bash
# Expected CURRENT/WAVE → next/dispatch_wave for scripts/ci_queue_next.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SCRIPT="${ROOT}/scripts/ci_queue_next.sh"
fail=0

expect() {
  local current="$1" wave="$2" want_next="$3" want_wave="$4" shard_total="${5:-}"
  local out next dw
  out="$(bash "$SCRIPT" "$current" "$wave" "$shard_total")"
  next="$(printf '%s\n' "$out" | awk -F= '/^next=/{print substr($0,6)}')"
  dw="$(printf '%s\n' "$out" | awk -F= '/^dispatch_wave=/{print substr($0,15)}')"
  if [ "$next" != "$want_next" ] || [ "$dw" != "$want_wave" ]; then
    echo "FAIL ${current} wave=${wave}: got next=${next} dispatch_wave=${dw} want next=${want_next} dispatch_wave=${want_wave}"
    fail=1
  else
    echo "OK ${current} wave=${wave} → ${next:-<empty>} / ${dw}"
  fi
}

expect sanity true covoro_formula true
expect sanity false "" false
expect covoro_formula true covoro_conditional true
expect covoro_conditional true covoro_ui_create true
expect covoro_ui_create true covoro_ui_conditional_create true
expect covoro_ui_conditional_create true covoro_ui_attachment true
expect covoro_ui_attachment true "ui submit multi 1" true
expect covoro_ui_attachment false "" false
expect covoro_ui_copy true covoro_ui_conditional_copy false
expect simplified_field true simplified_formula false
expect simplified_conditional true "" false
expect covoro_ui_edit true covoro_ui_conditional_edit false
expect covoro_submit_single true "" false
expect simplified_formula true simplified_conditional false
expect covoro_ui_copy false covoro_ui_conditional_copy false
expect covoro_ui_conditional_copy false "" false
expect covoro_ui_create false covoro_ui_conditional_create false
expect covoro_ui_conditional_create false "" false
expect covoro_ui_edit false covoro_ui_conditional_edit false
expect covoro_field false covoro_formula false
expect covoro_formula false covoro_conditional false
expect covoro_conditional false "" false
expect simplified_field false simplified_formula false
expect simplified_formula false simplified_conditional false
expect covoro_submit_single false "" false
expect "submit 1" false "submit 2" false 5
expect "submit 4" false "submit 5" false 5
expect "submit 5" false "" false 5
expect "submit 2" true "submit 3" false 4
expect "ui submit 1" false "ui submit 2" false 6
expect "ui submit 5" false "ui submit 6" false 6
expect "ui submit 6" false "" false 6
expect "ui submit 2" true "ui submit 3" false 4
expect "ui submit multi 1" false "ui submit multi 2" false
expect "ui submit multi 2" false "" false
expect "ui submit multi 1" true "ui submit multi 2" false
expect covoro_submit_multi true "" false
expect unknown_suite true "" false

if [ "$fail" -ne 0 ]; then
  echo "ci_queue_next_test.sh failed"
  exit 1
fi
echo "ci_queue_next_test.sh passed"
