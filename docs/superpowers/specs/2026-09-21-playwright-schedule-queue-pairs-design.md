# Design: Playwright schedule and manual queue pairs

**Date:** 2026-09-21  
**Status:** Implemented — Approach A (`ci_queue_next.sh` + workflow `queue-next`)  
**Approach:** One `CURRENT → NEXT` map in the existing Oman Playwright workflow (`queue-next`).

## Goal

Keep **one** GitHub Actions workflow. Daily cron runs Copy then Simplified Excel. Manual Run chains each family to its conditional (or formula/conditional) suite and **stops** at the end of that family.

## Current behavior (replace)

- Cron 05:45 IST starts `covoro_ui_copy`, then queues only `covoro_ui_conditional_copy`.
- `simplified_*` modes are rewritten to `covoro_ui_copy` and never run in CI.
- Create, Edit, Covoro Excel, and submit are one-off unless `scheduled_wave` is on (and even then they are not in the Copy-only list, so they do not chain).

## Queue map

`queue-next` looks up `CURRENT` (resolved `mode`) and dispatches the next suite with `scheduled_wave=true` so later jobs keep chaining until `NEXT` is empty.

### Cron / scheduled wave starting at Copy

Triggered by `schedule`, or by Manual Run of `covoro_ui_copy` **with** `scheduled_wave=true`.

1. `covoro_ui_copy`
2. `covoro_ui_conditional_copy`
3. `simplified_field`
4. `simplified_formula`
5. `simplified_conditional`
6. stop

Cron resolve step must start `MODE=covoro_ui_copy` (unchanged start). Remove the `simplified_*` → Copy rewrite.

### Manual families (chain even when `scheduled_wave` is off)

| Start | Next | Then |
|-------|------|------|
| `covoro_ui_create` | `covoro_ui_conditional_create` | stop |
| `covoro_ui_conditional_create` | — | stop |
| `covoro_ui_edit` | `covoro_ui_conditional_edit` | stop |
| `covoro_ui_conditional_edit` | — | stop |
| `covoro_field` | `covoro_formula` | `covoro_conditional` then stop |
| `covoro_formula` | `covoro_conditional` | stop |
| `covoro_conditional` | — | stop |
| `simplified_field` | `simplified_formula` | `simplified_conditional` then stop |
| `simplified_formula` | `simplified_conditional` | stop |
| `simplified_conditional` | — | stop |
| `covoro_ui_copy` (wave **off**) | `covoro_ui_conditional_copy` | stop (does **not** continue into Simplified) |
| `covoro_ui_conditional_copy` (wave **off**) | — | stop |

### No chain

- `covoro_submit_single`, `covoro_submit_multi`, `simplified_submit_single`, `simplified_submit_multi`
- Unknown `CURRENT` → log complete and exit 0 (do not fail the workflow)

## `scheduled_wave` meaning

| Event | Behavior |
|-------|----------|
| `schedule` | Always start Copy and walk the **cron list** (Copy pair + Simplified field/formula/conditional). |
| Manual Copy + `scheduled_wave=true` | Same **cron list** (Copy through Simplified). |
| Manual Copy + wave off | Copy pair only. |
| Manual Create / Edit / Covoro Excel / Simplified Excel | Always use that **family** map, whether wave is on or off. Wave on must **not** jump Create into Copy. |

Pause file `.github/PLAYWRIGHT_SKIP_SCHEDULE_UNTIL` still skips **cron** and wave-gated jobs as today. Manual family chains still run when the pause file is set (same as today’s one-off Manual Run).

## Workflow UI

Add dropdown options (already planned in `ci_playwright_shard_plan.sh`):

- `simplified_field`
- `simplified_formula`
- `simplified_conditional`

Keep existing Covoro Excel, submit, and UI Create/Edit/Copy options.

Update header comments, `run-name` for cron (`Scheduled Copy then Simplified`), and `queue-next` step name.

## Local Playwright config

- Default `chromium` `testMatch` stays Simplified field, formula, and conditional only (`npm test`).
- Restore project `chromium-ui` matching `UI*.spec.ts` / `UIMaster*.spec.ts` so CI `--project=chromium-ui` for Copy/Create/Edit does not fail.

Do not change specs, helpers, or shard plan spec paths except if a new mode name is added (none expected).

## Files in scope

| Path | Change |
|------|--------|
| `.github/workflows/playwright.yml` | Dropdown, cron comments, remove simplified rewrite, family-aware `queue-next` |
| `playwright.config.ts` | Restore `chromium-ui` |
| `scripts/ci_queue_next.sh` (optional) | Pure `CURRENT` + `WAVE` → `NEXT` stdout, called from `queue-next` |

Prefer the optional script if the bash in YAML would exceed a short case/table.

## Testing (when the user says **run**)

- Dry-run the map: for each `CURRENT`/`WAVE`, print `NEXT` (unit-style bash or documented expected table).
- Do not execute Playwright E2E as part of this change unless the user says **run**.

## Out of scope

- Submit chaining
- Extra cron times
- Changing Excel generators or UI specs
- Enabling Simplified submit in CI
