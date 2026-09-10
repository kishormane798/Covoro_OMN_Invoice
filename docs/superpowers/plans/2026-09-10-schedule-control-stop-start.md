# Schedule control Stop / Start Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. REQUIRED BACKGROUND: `wait-for-explicit-run` — do not run `gh`, Playwright, npm, or shell until the user says **run**. Do not commit unless the user explicitly asks.

**Goal:** On Actions → Oman E-Invoice — Schedule control, offer only **Stop** and **Start** for the next 05:45 IST morning queue, without changing in-flight `queue-next` or one-off manual Playwright runs.

**Architecture:** Relabel the existing `workflow_dispatch` choice on `playwright-schedule-control.yml`. **Stop** still writes `.github/PLAYWRIGHT_SKIP_SCHEDULE_UNTIL` with the line `manual`. **Start** still deletes that file. `playwright.yml` `should_run` keeps the same gate; only the two operator notice strings change so they say **start**.

**Tech Stack:** GitHub Actions YAML, bash in the control job, existing pause file.

**Spec:** `docs/superpowers/specs/2026-09-10-schedule-control-stop-start-design.md`

## Global Constraints

- Choice values are exactly `stop` and `start` (default `stop`).
- Drop `pause_until_manual_resume`, `pause_all_scheduled_for_today`, and `resume_scheduled_runs` from the dropdown.
- Pause file path stays `.github/PLAYWRIGHT_SKIP_SCHEDULE_UNTIL`.
- Stop writes the line `manual` (same as today’s pause-until-resume).
- Start `git rm`s the pause file; if the file is missing, print the no-op notice and exit 0.
- Do not change `queue-next`, suite list, `scheduled_wave`, cron, or concurrency.
- Do not cancel an in-flight suite. Do not block one-off manual Playwright runs (`workflow_dispatch` with `scheduled_wave` off).
- Keep the IST date-line branch in `should_run` (legacy pause-today files).
- Do not commit unless the user explicitly asks (skip every Commit step until then).
- Do not run `gh workflow run` / git push until the user says **run**.
- Incremental-agent-edits: one primary file per task.

---

## File map

| File | Responsibility |
|---|---|
| Modify: `.github/workflows/playwright-schedule-control.yml` | Two-option Stop / Start form and bash `case` |
| Modify: `.github/workflows/playwright.yml` | Two `should_run` notice strings only |

GitNexus: YAML workflows are not TypeScript symbols. Do not run `impact` / `rename`. Do not edit any `tests/**`, `pageObjects/**`, or `Helpers/**` file.

---

### Task 1: Schedule control dropdown Stop / Start

**Files:**
- Modify: `.github/workflows/playwright-schedule-control.yml` (entire file)

**Interfaces:**
- Consumes: existing pause file `.github/PLAYWRIGHT_SKIP_SCHEDULE_UNTIL`; `GITHUB_REF_NAME`; `contents: write`
- Produces: `inputs.action` values `stop` | `start`; Stop writes `manual\n`; Start removes the file

- [ ] **Step 1: Write failing content checks (do not run until the user says run)**

These strings must be absent after this task. Today they are present, so the check fails on the current file:

```
pause_until_manual_resume
pause_all_scheduled_for_today
resume_scheduled_runs
```

These strings must be present after this task. Today they are absent (except incidental words), so the check fails:

```
default: stop
- stop
- start
```

Exact command (repo root). Expected before the YAML edit: FAIL (`pause_until_manual_resume` still in the file).

```bash
node -e "const fs=require('fs'); const p='.github/workflows/playwright-schedule-control.yml'; const t=fs.readFileSync(p,'utf8'); const bad=['pause_until_manual_resume','pause_all_scheduled_for_today','resume_scheduled_runs'].filter(s=>t.includes(s)); if(bad.length) throw new Error('old action ids still present: '+bad.join(', ')); if(!/default:\\s*stop\\b/.test(t)) throw new Error('missing default: stop'); if(!t.includes('- stop')||!t.includes('- start')) throw new Error('missing stop/start options'); console.log('schedule-control Stop/Start form ok');"
```

- [ ] **Step 2: Replace `.github/workflows/playwright-schedule-control.yml` with this exact file**

```yaml
# One-click Stop/Start for the next 05:45 IST morning queue in playwright.yml.
# Stop does not cancel a suite that is already running and does not affect
# one-off manual Playwright runs (scheduled_wave off).
name: Oman E-Invoice — Schedule control

on:
  workflow_dispatch:
    inputs:
      action:
        description: "Stop: do not start the next scheduled morning queue until Start. Start: allow the 05:45 IST queue again. Does not cancel a suite that is already running. Does not affect one-off manual Playwright runs."
        required: true
        default: stop
        type: choice
        options:
          - stop
          - start

run-name: ${{ format('Schedule control — {0}', inputs.action) }}

permissions:
  contents: write

concurrency:
  group: omn-e-invoice-schedule-control
  cancel-in-progress: false

jobs:
  apply:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      - name: Stop or start the next scheduled morning queue
        env:
          ACTION: ${{ inputs.action }}
        run: |
          set -e
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"

          FILE=".github/PLAYWRIGHT_SKIP_SCHEDULE_UNTIL"
          BRANCH="${GITHUB_REF_NAME}"

          case "$ACTION" in
            stop)
              mkdir -p .github
              printf '%s\n' "manual" > "$FILE"
              git add "$FILE"
              if git diff --staged --quiet; then
                echo "::notice::Already paused until Start (file unchanged)."
                exit 0
              fi
              git commit -m "chore(ci): pause Playwright cron runs until manual resume"
              ;;
            start)
              if [ ! -f "$FILE" ]; then
                echo "::notice::No pause file — scheduled runs are not paused."
                exit 0
              fi
              git rm "$FILE"
              git commit -m "chore(ci): resume Playwright scheduled runs"
              ;;
            *)
              echo "::error::Unknown action: $ACTION"
              exit 1
              ;;
          esac

          git push origin "HEAD:${BRANCH}"
```

Do not leave a `pause_all_scheduled_for_today` branch. Unknown `action` still exits 1.

- [ ] **Step 3: Re-run the Step 1 node check after the user says run**

Expected: `schedule-control Stop/Start form ok`

Also confirm by reading the file: options are only `stop` and `start`; Stop commit message is still `chore(ci): pause Playwright cron runs until manual resume`; Start commit message is still `chore(ci): resume Playwright scheduled runs`.

- [ ] **Step 4: Commit (skip unless the user asks)**

```bash
git add .github/workflows/playwright-schedule-control.yml
git commit -m "ci: label schedule control as Stop and Start"
```

---

### Task 2: Playwright skip-gate notices say Start

**Files:**
- Modify: `.github/workflows/playwright.yml` lines 104 and 109 only (the two `::notice::` strings inside `should_run`)

**Interfaces:**
- Consumes: same pause file and `should_run` gate as today (`manual` skip; IST date-line skip)
- Produces: operator notices that name **start**, not `resume_scheduled_runs`

- [ ] **Step 1: Write failing notice checks (do not run until the user says run)**

Exact command (repo root). Expected before the edit: FAIL (`resume_scheduled_runs` still in notices).

```bash
node -e "const fs=require('fs'); const t=fs.readFileSync('.github/workflows/playwright.yml','utf8'); if(t.includes('resume_scheduled_runs')) throw new Error('old resume_scheduled_runs still in playwright.yml'); const n1='Scheduled Playwright runs are paused until Start. Resume: Actions → Oman E-Invoice — Schedule control → start.'; const n2='Resume early: Actions → Oman E-Invoice — Schedule control → start.'; if(!t.includes(n1)) throw new Error('missing until-Start notice'); if(!t.includes(n2)) throw new Error('missing legacy 1-day Start notice'); if(!t.includes('queue-next:')) throw new Error('queue-next job missing — wrong file'); console.log('playwright.yml Start notices ok');"
```

Do **not** edit `queue-next`, the suite dropdown, `scheduled_wave`, or the cron.

- [ ] **Step 2: Replace the two notice lines**

In `.github/workflows/playwright.yml`, inside the `should_run` / `id: gate` script, change only these two `echo` lines.

Replace:

```bash
              echo "::notice::Scheduled Playwright runs are paused until manual resume. Resume: Actions → Oman E-Invoice — Schedule control → resume_scheduled_runs."
```

with:

```bash
              echo "::notice::Scheduled Playwright runs are paused until Start. Resume: Actions → Oman E-Invoice — Schedule control → start."
```

Replace:

```bash
              echo "::notice::Scheduled Playwright runs are paused for IST date ${TODAY_IST} (1-day pause). Resume early: Actions → Oman E-Invoice — Schedule control → resume_scheduled_runs."
```

with:

```bash
              echo "::notice::Scheduled Playwright runs are paused for IST date ${TODAY_IST} (legacy 1-day pause). Resume early: Actions → Oman E-Invoice — Schedule control → start."
```

Leave the `if [ "$READ" = "manual" ]` and `if [ "$READ" = "$TODAY_IST" ]` branches, `skip=true` / `skip=false` outputs, and every job after `should_run` untouched.

- [ ] **Step 3: Re-run the Step 1 node check after the user says run**

Expected: `playwright.yml Start notices ok`

Also grep that `resume_scheduled_runs` is gone from this file, and that `queue-next:` still exists.

- [ ] **Step 4: Commit (skip unless the user asks)**

```bash
git add .github/workflows/playwright.yml
git commit -m "ci: point schedule pause notices at Start"
```

---

## Self-review (plan vs spec)

| Spec requirement | Task |
|---|---|
| Dropdown only `stop` / `start`, default `stop` | Task 1 |
| Description text locked in spec | Task 1 |
| `run-name` uses the chosen action | Task 1 (unchanged `format` expression) |
| Drop the three old option ids and today-only | Task 1 |
| Stop writes `manual`; same pause commit message | Task 1 |
| Start deletes file; same resume commit message; missing-file no-op | Task 1 |
| Unknown action fails | Task 1 |
| Two `should_run` notices name **start** | Task 2 |
| Do not change `queue-next` / suites / cron / `scheduled_wave` | Task 2 constraint |
| Keep IST date-line skip branch | Task 2 (only the notice text changes) |

No placeholders. No third implementation file. `gh workflow run` is not a verification step in this plan (takes effect after push to the default branch; wait for the user to say **run** / **push**).
