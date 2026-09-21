/**
 * Gated stdout diagnostics for Playwright tests (captured as test stdout / `console-log.txt` on failure).
 *
 * | API | Enable with | Use for |
 * |-----|-------------|---------|
 * | `flowLog` / `flowWarn` | `E2E_TERMINAL_LOGS=1` | Upload, dashboard, submit, validation milestones |
 */

const TRUTHY = new Set(["1", "true", "yes"]);

function envFlagEnabled(name: string): boolean {
  const raw = process.env[name]?.trim().toLowerCase() ?? "";
  return TRUTHY.has(raw);
}

/** Unconditional stdout line — caller must gate (e.g. `UiSubmitFieldDebug.enabled`). */
export function terminalLog(message: string): void {
  console.log(message);
}

/** General E2E flow diagnostics when `E2E_TERMINAL_LOGS=1`, `true`, or `yes`. */
export function reportLog(message: string): void {
  if (envFlagEnabled("E2E_TERMINAL_LOGS")) {
    terminalLog(message);
  }
}

/** Prefixed flow milestone — `[scope] message` (gated by `E2E_TERMINAL_LOGS`). */
export function flowLog(scope: string, message: string): void {
  reportLog(`[${scope}] ${message}`);
}

/** Prefixed warning — `[scope] WARN message` (gated by `E2E_TERMINAL_LOGS`). */
export function flowWarn(scope: string, message: string): void {
  reportLog(`[${scope}] WARN ${message}`);
}

