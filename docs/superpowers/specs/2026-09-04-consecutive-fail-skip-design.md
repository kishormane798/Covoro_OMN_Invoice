# Design: Consecutive-fail skip (UAE-style, whole run)

**Date:** 2026-09-04  
**Status:** Approved  
**Approach:** Shared streak marker file + `baseTest` hooks (not Playwright `maxFailures`)

## Goal

If **20 finished tests fail in a row** anywhere in a Playwright run, skip every remaining test so a broken environment does not burn the rest of the suite. A **pass anywhere resets** the streak, so mixed fail/pass runs keep going.

Examples (tests numbered 1–100):

| Sequence | Result |
|---|---|
| Tests 20–40 fail (20+ in a row) | Skip tests that have not started yet |
| Tests 20–38 fail, then 39 passes | Do **not** skip; streak is back to 0 |

## Why not `maxFailures: 20`

`playwright.config.ts` keeps `maxFailures: 0`. Playwright `maxFailures` counts **total** failures and does not reset on pass, so “20–38 fail, 39 passed” would still accumulate toward a stop. That is not this feature.

## Skip rules

Threshold: **20**. Scope: **the whole run** (all workers, all specs). Home: **`Src/baseTest.ts`** so every spec that imports `test` from there gets it.

| Outcome | Effect on streak |
|---|---|
| Passed | Reset to 0 |
| Failed or timed out (test is finished; no further Playwright retry) | Increment by 1 |
| Failed attempt that will be retried | No change |
| Skipped (including site-unavailable skip, and this skip itself) | No change |
| Interrupted | Count as a failure (same as today’s `isFailureLike`) |

When the streak reaches 20, set a **latched** trip flag. Remaining tests skip with a reason that says 20 tests failed in a row. A later in-flight pass does **not** turn remaining tests back on. Global setup clears the marker at the start of the next run.

Site-unavailable skip stays as it is. Those tests are skipped, so they do not move this streak.

## Architecture

Same pattern as `utils/siteUnavailableMarker.ts`: a JSON file at the repo root that every worker can read and write.

```
global-setup          → clear marker
worker beforeEach     → if tripped, test.skip(...)
worker afterEach      → pass → reset; final fail → increment; at 20 → trip
```

Workers are separate processes. Updates use an exclusive lock file so two workers cannot increment at once. Missing or corrupt marker means streak 0 (not tripped).

## Files

| File | Change |
|---|---|
| `utils/consecutiveFailSkip.ts` | New. Marker path, lock, clear / recordPass / recordFinalFailure / isTripped |
| `Src/baseTest.ts` | `beforeEach`: skip if tripped. `afterEach`: record pass or final failure (after existing attachments) |
| `utils/global-setup.ts` | Call clear at run start, next to `clearSiteUnavailableMarker()` |
| `.gitignore` | Ignore the marker and lock files |

No spec, helper, page-object, or `playwright.config.ts` changes.

## Public helpers (new util)

- `clearConsecutiveFailSkipMarker()`
- `isConsecutiveFailSkipTripped(): boolean`
- `recordConsecutiveFailSkipPass(): void`
- `recordConsecutiveFailSkipFinalFailure(): boolean` — returns true when this call trips the latch
- Constant threshold `CONSECUTIVE_FAIL_SKIP_THRESHOLD = 20`
- Skip message: `Skipping because 20 tests failed in a row.`

`afterEach` records a final failure only when `testInfo.status` is failure-like **and** Playwright will not retry that test (`testInfo.retry` is already the last attempt, or status is not a retryable fail).

## Non-goals

- Per-worker streaks
- Changing `maxFailures` or `fullyParallel`
- Un-tripping mid-run after a late pass
- Counting skipped tests or in-progress retries
- Excel pack generators or OpenCLI

## Success

A 100-test run that fails tests 20–40 then skips the rest. The same run with failures 20–38 and a pass on 39 continues. The next `npx playwright test` starts with streak 0. Marker files are not committed.
