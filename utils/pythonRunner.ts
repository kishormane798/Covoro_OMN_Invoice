/**
 * Python bridge for Excel writers and validators (`utils/excel/invoice_excel_writer.py`, etc.).
 * Tries platform launchers in order (`py` / `python3` / `python`) with a 45s timeout.
 */
import { spawnSync } from "child_process";

const PYTHON_COMMANDS =
  // Windows: `py` often wraps `python` and leaving both in the list causes duplicate
  // writers when the first attempt times out (child python keeps running).
  process.platform === "win32" ? ["python"] : ["python3", "python"];
const DEFAULT_PYTHON_TIMEOUT_MS = 45_000;

function runPythonCommand(
  command: string,
  script: string,
  args: string[],
  timeoutMs: number
): { status: number | null; signal: NodeJS.Signals | null; stdout: string; stderr: string; error?: Error } {
  return spawnSync(command, [script, ...args], {
    encoding: "utf8",
    timeout: timeoutMs,
    windowsHide: true,
  });
}

export function runPythonForStdout(
  script: string,
  args: string[],
  timeoutMs: number = DEFAULT_PYTHON_TIMEOUT_MS
): string {
  let lastError = "Python execution failed";

  for (const cmd of PYTHON_COMMANDS) {
    const result = runPythonCommand(cmd, script, args, timeoutMs);

    if (result.stdout !== undefined && result.stdout !== null) {
      const trimmed = result.stdout.trim();
      if (result.status === 0) {
        return trimmed;
      }
      const stderr = (result.stderr || "").trim();
      lastError = `${cmd} failed: ${stderr || result.error?.message || "unknown error"}`.trim();
      continue;
    }

    const stderr = (result.stderr || "").trim();
    if (result.error && result.error.message) {
      lastError = `${cmd} failed: ${result.error.message}`;
    } else if (result.signal) {
      lastError = `${cmd} terminated with signal ${result.signal}`;
    } else {
      lastError = `${cmd} failed: ${stderr || "unknown error"}`;
    }
  }

  throw new Error(lastError);
}

/** Returns `null` on exit 0; otherwise the stderr / error text for assertions. */
export function runPythonForStatus(script: string, args: string[]): string | null {
  let lastError = "Python execution failed";

  for (const cmd of PYTHON_COMMANDS) {
    const result = runPythonCommand(cmd, script, args, DEFAULT_PYTHON_TIMEOUT_MS);

    if (result.status === 0) {
      return null;
    }

    const stderr = (result.stderr || "").trim();
    lastError = `${cmd} failed: ${stderr || result.error?.message || "unknown error"}`.trim();
  }

  return lastError;
}
