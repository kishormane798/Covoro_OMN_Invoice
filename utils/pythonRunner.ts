/**
 * Python bridge for Excel writers and validators (`utils/invoice_excel_writer.py`, etc.).
 * Tries platform launchers in order (`py` / `python3` / `python`) with a 45s timeout.
 */
import { execSync } from "child_process";

const PYTHON_COMMANDS =
  // Windows: `py` often wraps `python` and leaving both in the list causes duplicate
  // writers when the first attempt times out (child python keeps running).
  process.platform === "win32" ? ["python"] : ["python3", "python"];
const DEFAULT_PYTHON_TIMEOUT_MS = 45_000;

function quoteArgs(script: string, args: string[]): string {
  return [script, ...args].map((arg) => `"${arg}"`).join(" ");
}

export function runPythonForStdout(
  script: string,
  args: string[],
  timeoutMs: number = DEFAULT_PYTHON_TIMEOUT_MS
): string {
  const fullArgs = quoteArgs(script, args);
  let lastError = "Python execution failed";

  for (const cmd of PYTHON_COMMANDS) {
    try {
      return execSync(`${cmd} ${fullArgs}`, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        timeout: timeoutMs,
      });
    } catch (error: unknown) {
      const timedOut =
        error &&
        typeof error === "object" &&
        "signal" in error &&
        (error as { signal?: string }).signal === "SIGTERM";
      const stderr =
        error && typeof error === "object" && "stderr" in error
          ? String((error as { stderr?: string }).stderr || "")
          : String(error);
      lastError = timedOut
        ? `${cmd} timed out after ${timeoutMs}ms: ${stderr}`.trim()
        : `${cmd} failed: ${stderr}`.trim();
    }
  }

  throw new Error(lastError);
}

/** Returns `null` on exit 0; otherwise the stderr / error text for assertions. */
export function runPythonForStatus(script: string, args: string[]): string | null {
  const fullArgs = quoteArgs(script, args);
  let lastError = "Python execution failed";

  for (const cmd of PYTHON_COMMANDS) {
    try {
      execSync(`${cmd} ${fullArgs}`, {
        stdio: "pipe",
        encoding: "utf8",
        timeout: DEFAULT_PYTHON_TIMEOUT_MS,
      });
      return null;
    } catch (error: unknown) {
      const stderr =
        error && typeof error === "object" && "stderr" in error
          ? String((error as { stderr?: string }).stderr || "")
          : String(error);
      lastError = `${cmd} failed: ${stderr}`.trim();
    }
  }

  return lastError;
}
