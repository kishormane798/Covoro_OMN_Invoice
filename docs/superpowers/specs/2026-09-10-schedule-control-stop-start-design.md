# Design: Schedule control Stop / Start (next scheduled queue)

**Date:** 2026-09-10  
**Status:** Approved  
**Story:** Actions → Oman E-Invoice — Schedule control should offer Stop and Start for the next scheduled morning queue, not for one-off manual Playwright runs.  
**Approach:** Relabel and shrink the existing schedule-control dropdown to two actions. Same pause file and Playwright gate. Do not change in-flight `queue-next`.

## Goal

On **Oman E-Invoice — Schedule control** (Run workflow), show only:

| Option | Meaning |
|---|---|
| **Stop** | Do not start the **next** 05:45 IST morning queue until someone runs **Start**. |
| **Start** | Allow the next 05:45 IST clock to start the morning wave again. |

Manual Playwright (**Oman E-Invoice — Playwright**, `scheduled_wave` off) is unchanged: one suite, no chain.

## What does not change

- In-flight `queue-next` still dispatches the next suite after a wave that is already running.
- Stop does **not** cancel a suite that is already running.
- Stop does **not** block a one-off manual Playwright run.
- Pause file stays `.github/PLAYWRIGHT_SKIP_SCHEDULE_UNTIL`.
- Stop still writes the line `manual` (same as today’s pause-until-resume).
- Start still deletes that file when it exists.
- `playwright.yml` `should_run` gate still treats `manual` as skip-until-resume, and still honors a leftover IST date line if one exists from an old “pause today” commit.

## Form (locked)

File: `.github/workflows/playwright-schedule-control.yml`

```yaml
inputs:
  action:
    description: "Stop: do not start the next scheduled morning queue until Start. Start: allow the 05:45 IST queue again. Does not cancel a suite that is already running. Does not affect one-off manual Playwright runs."
    required: true
    default: stop
    type: choice
    options:
      - stop
      - start
```

- Default is **Stop** (same as today’s default `pause_until_manual_resume`).
- `run-name` uses the chosen action (`Schedule control — stop` / `Schedule control — start`).
- Drop `pause_until_manual_resume`, `pause_all_scheduled_for_today`, and `resume_scheduled_runs` from the dropdown. Do not keep a “pause today only” option.

### Job mapping

| Input | Git commit when the file changes | Same as today |
|---|---|---|
| `stop` | `chore(ci): pause Playwright cron runs until manual resume` | write `manual` into the pause file |
| `start` | `chore(ci): resume Playwright scheduled runs` | `git rm` the pause file; no-op notice if the file is already gone |

Unknown `action` still fails the job.

## Playwright notices

File: `.github/workflows/playwright.yml`

Update the two `::notice::` strings in `should_run` so they tell the operator to use **Start**, not the old `resume_scheduled_runs` id:

- Paused until resume → Actions → Oman E-Invoice — Schedule control → **start**
- Paused for an IST date (legacy file) → same **start** path to resume early

Do not change `queue-next`, suite list, `scheduled_wave`, or cron.

## Files to change

| Path | Change |
|---|---|
| `.github/workflows/playwright-schedule-control.yml` | Two options (`stop` / `start`); drop today-only; new description and `run-name` |
| `.github/workflows/playwright.yml` | Two skip-gate notice strings only |

## Out of scope

- Stopping or skipping the next `queue-next` dispatch of an in-flight wave
- Adding Stop / Start on the Playwright suite Run form
- Changing concurrency, cron time, or wave order
- Removing the date-line branch in `should_run` (legacy pause-today files can still skip one IST day)

## Risk

Low. Choice values change; anyone using a saved `gh workflow run` with the old action ids must switch to `stop` / `start`. The pause file format is unchanged, so an existing `manual` pause still works after this ships.
