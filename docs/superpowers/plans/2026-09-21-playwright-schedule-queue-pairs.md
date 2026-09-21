# Playwright schedule and manual queue pairs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (this session: inline; user asked plan and implement). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Family-aware `queue-next` so cron walks Copy → Conditional Copy → Simplified field/formula/conditional, and Manual Run chains Create/Edit/Covoro/Simplified pairs without jumping families.

**Architecture:** `scripts/ci_queue_next.sh` is the only map (`CURRENT` + `WAVE` → `next` + `dispatch_wave`). `playwright.yml` removes the Simplified rewrite, always attempts `queue-next` after a non-cancelled test, and dispatches with the script’s wave flag. Local `chromium` stays Simplified-only; `CI=true` keeps full Excel matching plus restored `chromium-ui`.

**Tech Stack:** GitHub Actions, bash, Playwright 1.60, existing `ci_playwright_shard_plan.sh`.

## Global Constraints

- Do not run Playwright E2E or the map test until the user says **run**.
- Do not chain submit suites.
- Manual Create/Edit/Covoro/Simplified must not enter the cron Copy→Simplified list even if `scheduled_wave` is true.
- Pause file still skips cron and `scheduled_wave=true` jobs; family dispatches use `scheduled_wave=false` so pause does not drop Conditional Create/Edit.
- One workflow file: `.github/workflows/playwright.yml`.

---

### Task 1: Queue map script

**Files:**
- Create: `scripts/ci_queue_next.sh`
- Create: `scripts/ci_queue_next_test.sh`

**Interfaces:**
- Consumes: argv1 `CURRENT` (suite id), argv2 `WAVE` (`true` or anything else = false)
- Produces: `next=<id or empty>` and `dispatch_wave=true|false` on stdout (and `GITHUB_OUTPUT` when set)

- [ ] **Step 1: Write `scripts/ci_queue_next.sh`**

```bash
#!/usr/bin/env bash
# Usage: ci_queue_next.sh <CURRENT> <WAVE>
# WAVE=true: cron / Copy+scheduled_wave — walk Copy → Conditional Copy → Simplified field → formula → conditional.
# WAVE=false (and any suite not on that list): family pair only.
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

{
  echo "next=${NEXT}"
  echo "dispatch_wave=${DISPATCH_WAVE}"
}
if [ -n "${GITHUB_OUTPUT:-}" ]; then
  echo "next=${NEXT}" >> "$GITHUB_OUTPUT"
  echo "dispatch_wave=${DISPATCH_WAVE}" >> "$GITHUB_OUTPUT"
fi
```

- [ ] **Step 2: Write `scripts/ci_queue_next_test.sh` expected table** (do not execute until **run**)

Assert: copy+true → cond_copy/true; cond_copy+true → simplified_field/true; simplified_conditional+true → empty; create+false → cond_create/false; create+true → cond_create/false; copy+false → cond_copy/false; cond_copy+false → empty; field+false → formula; submit+false → empty.

- [ ] **Step 3: Commit** — skip unless the user asks.

---

### Task 2: Workflow wiring

**Files:**
- Modify: `.github/workflows/playwright.yml`

- [ ] **Step 1: Header, dropdown (`simplified_field|formula|conditional`), run-name Simplified labels, scheduled_wave description**
- [ ] **Step 2: Delete `simplified_*` rewrite to Copy**
- [ ] **Step 3: `queue-next` if: drop `scheduled_wave` requirement; checkout; `WAVE` from schedule or input; `bash scripts/ci_queue_next.sh`; `gh workflow run` with `-f suite` and `-f scheduled_wave` from script**

---

### Task 3: Local vs CI Playwright projects

**Files:**
- Modify: `playwright.config.ts`

- [ ] **Step 1: Restore `chromium-ui`. If `CI` is set, `chromium` ignores UI specs only (so Covoro Excel CLI paths collect). If not `CI`, `chromium` `testMatch` remains the three Simplified specs.**

---

### Task 4: Spec status

**Files:**
- Modify: `docs/superpowers/specs/2026-09-21-playwright-schedule-queue-pairs-design.md` status line to Implemented.

**Spec coverage:** cron list, family maps, no submit chain, pause vs family dispatch_wave, dropdown, chromium-ui, Simplified rewrite removal.
