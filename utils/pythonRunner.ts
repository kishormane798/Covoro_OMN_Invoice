/**
 * Python bridge for Excel writers and validators (`utils/excel/invoice_excel_writer.py`, etc.).
 * Tries platform launchers in order with a 45s timeout.
 * Windows uses `python` only. `py` is omitted because it wraps python: if the first
 * attempt times out, the child keeps running and a second launcher starts a duplicate writer.
 * When `python` is the Microsoft Store alias (not on PATH), fall back to a direct
 * per-user or Program Files `python.exe`.
 */
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";

const DEFAULT_PYTHON_TIMEOUT_MS = 45_000;

/** First command that actually runs a script. Skips repeating the Store-alias failure. */
let resolvedPythonCommand: string | null = null;

type PythonSpawnResult = {
  status: number | null;
  signal: NodeJS.Signals | null;
  stdout: string;
  stderr: string;
  error?: Error;
};

function discoverWindowsPythonExecutables(): string[] {
  const roots: string[] = [];
  if (process.env.LOCALAPPDATA) {
    roots.push(path.join(process.env.LOCALAPPDATA, "Programs", "Python"));
  }
  if (process.env.ProgramFiles) {
    roots.push(process.env.ProgramFiles);
  }

  const found: { version: number; exe: string }[] = [];
  for (const root of roots) {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(root, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.isDirectory() || !/^Python\d+$/i.test(entry.name)) continue;
      const exe = path.join(root, entry.name, "python.exe");
      if (!fs.existsSync(exe)) continue;
      found.push({
        version: Number(entry.name.replace(/\D/g, "")) || 0,
        exe,
      });
    }
  }

  found.sort((a, b) => b.version - a.version);
  return found.map((item) => item.exe);
}

function pythonCommands(): string[] {
  if (resolvedPythonCommand) return [resolvedPythonCommand];
  return process.platform === "win32" ? ["python"] : ["python3", "python"];
}

function isMissingPythonInterpreter(result: PythonSpawnResult, stderr: string): boolean {
  const code = (result.error as NodeJS.ErrnoException | undefined)?.code;
  if (code === "ENOENT") return true;
  return /Python was not found|Microsoft Store|not recognized as an internal or external command/i.test(
    stderr
  );
}

function appendWindowsPythonFallback(
  queue: string[],
  result: PythonSpawnResult,
  stderr: string
): void {
  if (process.platform !== "win32") return;
  if (!isMissingPythonInterpreter(result, stderr)) return;
  for (const exe of discoverWindowsPythonExecutables()) {
    if (!queue.includes(exe)) queue.push(exe);
  }
}

function runPythonCommand(
  command: string,
  script: string,
  args: string[],
  timeoutMs: number
): PythonSpawnResult {
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
  const queue = pythonCommands();

  for (let i = 0; i < queue.length; i++) {
    const cmd = queue[i];
    const result = runPythonCommand(cmd, script, args, timeoutMs);

    if (result.stdout !== undefined && result.stdout !== null) {
      const trimmed = result.stdout.trim();
      if (result.status === 0) {
        resolvedPythonCommand = cmd;
        return trimmed;
      }
      const stderr = (result.stderr || "").trim();
      lastError = `${cmd} failed: ${stderr || result.error?.message || "unknown error"}`.trim();
      appendWindowsPythonFallback(queue, result, stderr);
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
    appendWindowsPythonFallback(queue, result, `${stderr}\n${result.error?.message ?? ""}`);
  }

  throw new Error(lastError);
}

/** Returns `null` on exit 0; otherwise the stderr / error text for assertions. */
export function runPythonForStatus(script: string, args: string[]): string | null {
  let lastError = "Python execution failed";
  const queue = pythonCommands();

  for (let i = 0; i < queue.length; i++) {
    const cmd = queue[i];
    const result = runPythonCommand(cmd, script, args, DEFAULT_PYTHON_TIMEOUT_MS);

    if (result.status === 0) {
      resolvedPythonCommand = cmd;
      return null;
    }

    const stderr = (result.stderr || "").trim();
    lastError = `${cmd} failed: ${stderr || result.error?.message || "unknown error"}`.trim();
    appendWindowsPythonFallback(
      queue,
      result,
      `${stderr}\n${result.error?.message ?? ""}`
    );
  }

  return lastError;
}
