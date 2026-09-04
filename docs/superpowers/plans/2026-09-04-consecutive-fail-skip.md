# Consecutive-fail skip Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. REQUIRED BACKGROUND: `wait-for-explicit-run` — do not run Playwright / npm / `tsx --test` until the user says **run**. Do not commit unless the user explicitly asks.

**Goal:** After 20 finished Playwright tests fail in a row anywhere in the run, skip remaining tests; a pass resets the streak unless the latch already tripped.

**Architecture:** A repo-root JSON marker (same idea as `site-unavailable.json`) with an exclusive lock so five workers cannot increment at once. `global-setup` clears it. `baseTest` `beforeEach` skips if tripped; `afterEach` records pass or final failure.

**Tech Stack:** Playwright 1.60 fixtures in `Src/baseTest.ts`; Node `fs` lock file; Node `node:test` script for the marker util (not a Playwright spec).

## Global Constraints

- Threshold is exactly 20 finished failures in a row (whole run, any worker)
- Pass resets streak to 0 only when **not** already tripped (latch stays on for that run)
- Skips do not move the streak; failed attempts that Playwright will retry do not move the streak
- Skip reason: `Skipping because 20 tests failed in a row.`
- `playwright.config.ts` `maxFailures` stays `0`
- Do not commit unless the user explicitly asks
- Do not run Playwright or the unit script until the user says **run**
- Approved batch: `utils/consecutiveFailSkip.ts`, `scripts/verify_consecutive_fail_skip.ts`, `Src/baseTest.ts`, `utils/global-setup.ts`, `.gitignore`, spec/plan docs

## File map

| File | Responsibility |
|---|---|
| `utils/consecutiveFailSkip.ts` | Marker, lock, clear / pass / final-fail / tripped |
| `scripts/verify_consecutive_fail_skip.ts` | `node:test` cases for the marker util |
| `Src/baseTest.ts` | Skip in `beforeEach`; record in `afterEach` |
| `utils/global-setup.ts` | Clear marker at run start |
| `.gitignore` | Ignore marker and lock |
| `docs/superpowers/specs/2026-09-04-consecutive-fail-skip-design.md` | Mark Approved |

GitNexus was not ready at plan time. Grep: every spec imports `test` from `Src/baseTest.ts`, so `beforeEach`/`afterEach` changes have **HIGH** blast radius. Site-unavailable skip stays first and unchanged.

---

### Task 1: Marker util + unit script

**Files:**
- Create: `utils/consecutiveFailSkip.ts`
- Create: `scripts/verify_consecutive_fail_skip.ts`
- Modify: `.gitignore` (after `site-unavailable-w*.json`)

**Interfaces:**
- Consumes: Node `fs` at process cwd (Playwright repo root)
- Produces:
  - `CONSECUTIVE_FAIL_SKIP_FILE = "consecutive-fail-skip.json"`
  - `CONSECUTIVE_FAIL_SKIP_LOCK = "consecutive-fail-skip.lock"`
  - `CONSECUTIVE_FAIL_SKIP_THRESHOLD = 20`
  - `CONSECUTIVE_FAIL_SKIP_MESSAGE = "Skipping because 20 tests failed in a row."`
  - `clearConsecutiveFailSkipMarker(): void`
  - `isConsecutiveFailSkipTripped(): boolean`
  - `recordConsecutiveFailSkipPass(): void`
  - `recordConsecutiveFailSkipFinalFailure(): boolean`

- [x] **Step 1: Write the failing unit script first (TDD)**

`scripts/verify_consecutive_fail_skip.ts`:

```ts
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
  clearConsecutiveFailSkipMarker,
  CONSECUTIVE_FAIL_SKIP_THRESHOLD,
  isConsecutiveFailSkipTripped,
  recordConsecutiveFailSkipFinalFailure,
  recordConsecutiveFailSkipPass,
} from "../utils/consecutiveFailSkip";

describe("consecutiveFailSkip", () => {
  beforeEach(() => {
    clearConsecutiveFailSkipMarker();
  });
  afterEach(() => {
    clearConsecutiveFailSkipMarker();
  });

  it("is not tripped when the marker is missing", () => {
    assert.equal(isConsecutiveFailSkipTripped(), false);
  });

  it("does not trip after 19 final failures", () => {
    for (let i = 0; i < CONSECUTIVE_FAIL_SKIP_THRESHOLD - 1; i++) {
      assert.equal(recordConsecutiveFailSkipFinalFailure(), false);
    }
    assert.equal(isConsecutiveFailSkipTripped(), false);
  });

  it("trips on the 20th final failure", () => {
    for (let i = 0; i < CONSECUTIVE_FAIL_SKIP_THRESHOLD - 1; i++) {
      recordConsecutiveFailSkipFinalFailure();
    }
    assert.equal(recordConsecutiveFailSkipFinalFailure(), true);
    assert.equal(isConsecutiveFailSkipTripped(), true);
  });

  it("resets the streak when a pass happens before the threshold", () => {
    for (let i = 0; i < CONSECUTIVE_FAIL_SKIP_THRESHOLD - 1; i++) {
      recordConsecutiveFailSkipFinalFailure();
    }
    recordConsecutiveFailSkipPass();
    assert.equal(recordConsecutiveFailSkipFinalFailure(), false);
    assert.equal(isConsecutiveFailSkipTripped(), false);
  });

  it("keeps the latch after a pass once already tripped", () => {
    for (let i = 0; i < CONSECUTIVE_FAIL_SKIP_THRESHOLD; i++) {
      recordConsecutiveFailSkipFinalFailure();
    }
    recordConsecutiveFailSkipPass();
    assert.equal(isConsecutiveFailSkipTripped(), true);
  });
});
```

- [x] **Step 2: Do not run the script** until the user says **run**. Expected when run: `npx tsx --test scripts/verify_consecutive_fail_skip.ts`

- [x] **Step 3: Implement `utils/consecutiveFailSkip.ts`**

Match `siteUnavailableMarker.ts` style (cwd-relative files, no extra deps). Exclusive lock via `openSync(path, "wx")` with a short retry. Missing or corrupt JSON → `{ streak: 0, tripped: false }`. `recordConsecutiveFailSkipPass` is a no-op when `tripped` is already true.

- [x] **Step 4: Gitignore**

After `site-unavailable-w*.json`:

```
consecutive-fail-skip.json
consecutive-fail-skip.lock
```

---

### Task 2: Wire global-setup and baseTest

**Files:**
- Modify: `utils/global-setup.ts` (import + `clearConsecutiveFailSkipMarker()` next to `clearSiteUnavailableMarker()`)
- Modify: `Src/baseTest.ts` (`beforeEach` after site-unavailable skip; `afterEach` after attachments / cleanup)

**Interfaces:**
- Consumes: helpers from Task 1; Playwright `TestInfo.status`, `TestInfo.retry`, `TestInfo.project.retries`
- Produces: suite-wide skip when tripped

- [x] **Step 1: Clear in global-setup**

```ts
import {
  clearSiteUnavailableMarker,
  writeSiteUnavailableMarker,
} from './siteUnavailableMarker';
import { clearConsecutiveFailSkipMarker } from './consecutiveFailSkip';
```

Inside `globalSetup`, immediately after `clearSiteUnavailableMarker();`:

```ts
  clearConsecutiveFailSkipMarker();
```

- [x] **Step 2: Skip in `beforeEach` (after site-unavailable, before worker TIN)**

```ts
  if (isConsecutiveFailSkipTripped()) {
    test.skip(true, CONSECUTIVE_FAIL_SKIP_MESSAGE);
  }
```

- [x] **Step 3: Record in `afterEach` (end of hook, after existing attachments)**

```ts
  if (testInfo.status === "passed") {
    recordConsecutiveFailSkipPass();
  } else if (
    testInfo.status !== "skipped" &&
    !playwrightWillRetry(testInfo)
  ) {
    recordConsecutiveFailSkipFinalFailure();
  }
```

```ts
function playwrightWillRetry(testInfo: TestInfo): boolean {
  if (testInfo.status === "passed" || testInfo.status === "skipped") {
    return false;
  }
  if (testInfo.status === "interrupted") {
    return false;
  }
  const retries = testInfo.project?.retries ?? 0;
  return testInfo.retry < retries;
}
```

Import `TestInfo` from `@playwright/test` if not already in scope.

- [x] **Step 4: Mark the design spec Status as `Approved`**

---

## Verification (only after the user says **run**)

1. `npx tsx --test scripts/verify_consecutive_fail_skip.ts` — all five cases pass
2. Do not run the full Oman suite unless the user asks. Optional smoke: any two-test spec with forced fail is enough to see streak 1, not skip.

## Spec coverage

| Spec rule | Task |
|---|---|
| Threshold 20, whole run | Task 1 |
| Pass resets before trip | Task 1 |
| Latch after trip | Task 1 |
| Skip remaining via baseTest | Task 2 |
| Retries / skips ignored | Task 2 `playwrightWillRetry` |
| Clear at run start | Task 2 global-setup |
| gitignore marker | Task 1 |
| maxFailures stays 0 | no config edit |
