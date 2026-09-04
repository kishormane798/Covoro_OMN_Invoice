import { closeSync, existsSync, openSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";

export const CONSECUTIVE_FAIL_SKIP_FILE = "consecutive-fail-skip.json";
export const CONSECUTIVE_FAIL_SKIP_LOCK = "consecutive-fail-skip.lock";
export const CONSECUTIVE_FAIL_SKIP_THRESHOLD = 20;
export const CONSECUTIVE_FAIL_SKIP_MESSAGE =
  "Skipping because 20 tests failed in a row.";

type ConsecutiveFailSkipState = {
  streak: number;
  tripped: boolean;
};

const EMPTY_STATE: ConsecutiveFailSkipState = { streak: 0, tripped: false };
const LOCK_WAIT_MS = 5000;

function sleepMs(ms: number): void {
  const buf = new Int32Array(new SharedArrayBuffer(4));
  Atomics.wait(buf, 0, 0, ms);
}

function readStateUnlocked(): ConsecutiveFailSkipState {
  if (!existsSync(CONSECUTIVE_FAIL_SKIP_FILE)) {
    return { ...EMPTY_STATE };
  }
  try {
    const parsed = JSON.parse(readFileSync(CONSECUTIVE_FAIL_SKIP_FILE, "utf-8")) as {
      streak?: unknown;
      tripped?: unknown;
    };
    const streak =
      typeof parsed.streak === "number" && Number.isFinite(parsed.streak)
        ? Math.max(0, Math.floor(parsed.streak))
        : 0;
    const tripped = parsed.tripped === true;
    return { streak, tripped };
  } catch {
    return { ...EMPTY_STATE };
  }
}

function writeStateUnlocked(state: ConsecutiveFailSkipState): void {
  writeFileSync(
    CONSECUTIVE_FAIL_SKIP_FILE,
    JSON.stringify(state, null, 2),
    "utf-8"
  );
}

function withLock<T>(fn: () => T): T {
  const deadline = Date.now() + LOCK_WAIT_MS;
  let lastError: unknown;
  while (Date.now() < deadline) {
    try {
      const fd = openSync(CONSECUTIVE_FAIL_SKIP_LOCK, "wx");
      try {
        return fn();
      } finally {
        closeSync(fd);
        try {
          unlinkSync(CONSECUTIVE_FAIL_SKIP_LOCK);
        } catch {}
      }
    } catch (error) {
      lastError = error;
      sleepMs(20);
    }
  }
  try {
    unlinkSync(CONSECUTIVE_FAIL_SKIP_LOCK);
  } catch {}
  try {
    const fd = openSync(CONSECUTIVE_FAIL_SKIP_LOCK, "wx");
    try {
      return fn();
    } finally {
      closeSync(fd);
      try {
        unlinkSync(CONSECUTIVE_FAIL_SKIP_LOCK);
      } catch {}
    }
  } catch (error) {
    throw lastError ?? error;
  }
}

export function clearConsecutiveFailSkipMarker(): void {
  for (const filePath of [CONSECUTIVE_FAIL_SKIP_FILE, CONSECUTIVE_FAIL_SKIP_LOCK]) {
    if (!existsSync(filePath)) continue;
    try {
      unlinkSync(filePath);
    } catch {}
  }
}

export function isConsecutiveFailSkipTripped(): boolean {
  return readStateUnlocked().tripped;
}

export function recordConsecutiveFailSkipPass(): void {
  withLock(() => {
    const state = readStateUnlocked();
    if (state.tripped) {
      return;
    }
    writeStateUnlocked({ streak: 0, tripped: false });
  });
}

export function recordConsecutiveFailSkipFinalFailure(): boolean {
  return withLock(() => {
    const state = readStateUnlocked();
    if (state.tripped) {
      return true;
    }
    const streak = state.streak + 1;
    const tripped = streak >= CONSECUTIVE_FAIL_SKIP_THRESHOLD;
    writeStateUnlocked({ streak, tripped });
    return tripped;
  });
}
