/**
 * Regenerate TestData for every ruleId in MULTI_VALUE_PACK_EXPAND.
 *
 * Sequential (default concurrency 1):
 *   npx tsx scripts/regen_multi_value_pack_expand.ts
 *
 * Safe parallel (max 3 workers; one ruleId per worker; single parent lock):
 *   npx tsx scripts/regen_multi_value_pack_expand.ts --concurrency 3 --skip-done
 *   npx tsx scripts/regen_multi_value_pack_expand.ts --concurrency 3 --only remaining
 *   npx tsx scripts/regen_multi_value_pack_expand.ts --only ALIGNED-IBRP-028-OM,IBR-023-OM
 *
 * Each parallel worker runs one rule via child process:
 *   npx tsx scripts/generate_conditional_validation_oman_excels.ts --rule <ID>
 * with a unique UAE_EINVOICE_WORKER_INDEX (Excel pw-<n> isolation).
 */
import "dotenv/config";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import {
  generateConditionalValidationExcelPack,
  writeConditionalPackReadme,
  PACK_ROOT,
} from "../Helpers/excel/conditionalValidationExcelPackHelper";
import { MULTI_VALUE_PACK_EXPAND } from "../testData/FieldValidations/ConditionalValidation";

type RuleSummary = {
  ruleId: string;
  total: number;
  ok: number;
  skipped: number;
  error: number;
  sampleErrors: string[];
  elapsedSec?: number;
  workerIndex?: number;
};

type SummaryPayload = {
  at: string;
  done: boolean;
  progress: string;
  percent: number;
  concurrency: number;
  skippedDone: string[];
  rules: RuleSummary[];
  totals: {
    rules: number;
    okRules: number;
    errorRules: number;
    okCases: number;
    errorCases: number;
    targetRules: number;
  };
};

const TMP_DIR = path.join(PACK_ROOT, "_tmp");
const SUMMARY_PATH = path.join(TMP_DIR, "multi-value-pack-regen-summary.json");
const LIVE_LOG_PATH = path.join(TMP_DIR, "multi-value-pack-regen-live.log");
const LOCK_PATH = path.join(TMP_DIR, "multi-value-pack-regen.lock");
const MAX_CONCURRENCY = 3;

function parseArgs(argv: string[]): {
  only?: string[];
  onlyRemaining: boolean;
  skipDone: boolean;
  concurrency: number;
} {
  let only: string[] | undefined;
  let onlyRemaining = false;
  let skipDone = false;
  let concurrency = 1;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--only") {
      const raw = (argv[++i] || "").trim();
      if (raw.toLowerCase() === "remaining") {
        onlyRemaining = true;
        skipDone = true;
      } else {
        only = raw
          .split(",")
          .map((x) => x.trim().toUpperCase())
          .filter(Boolean);
      }
    } else if (a === "--skip-done") {
      skipDone = true;
    } else if (a === "--concurrency") {
      const n = Number(argv[++i]);
      concurrency = Number.isFinite(n) ? Math.floor(n) : 1;
    }
  }

  concurrency = Math.min(MAX_CONCURRENCY, Math.max(1, concurrency));
  return { only, onlyRemaining, skipDone, concurrency };
}

function readPriorSummary(): SummaryPayload | undefined {
  try {
    if (!fs.existsSync(SUMMARY_PATH)) return undefined;
    let raw = fs.readFileSync(SUMMARY_PATH, "utf8");
    if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
    const parsed = JSON.parse(raw) as SummaryPayload;
    if (!Array.isArray(parsed.rules)) return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}

function okDoneRuleIds(prior: SummaryPayload | undefined): Set<string> {
  const done = new Set<string>();
  for (const r of prior?.rules ?? []) {
    const err = Number(r.error);
    if (Number.isFinite(err) && err === 0) {
      done.add(String(r.ruleId).toUpperCase());
    }
  }
  return done;
}

function isPidAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function acquireLock(): void {
  fs.mkdirSync(TMP_DIR, { recursive: true });
  if (fs.existsSync(LOCK_PATH)) {
    try {
      const raw = JSON.parse(fs.readFileSync(LOCK_PATH, "utf8")) as {
        pid?: number;
      };
      const pid = raw.pid;
      if (pid && isPidAlive(pid)) {
        throw new Error(
          `Another multi-value pack regen is running (pid=${pid}, lock=${LOCK_PATH}). ` +
            `Stop it first or delete the lock if stale.`
        );
      }
      console.warn(
        `[regen] Removing stale lock (pid=${pid ?? "?"} not alive): ${LOCK_PATH}`
      );
    } catch (err) {
      if (err instanceof Error && err.message.includes("Another multi-value")) {
        throw err;
      }
    }
  }
  fs.writeFileSync(
    LOCK_PATH,
    JSON.stringify(
      { pid: process.pid, at: new Date().toISOString(), script: __filename },
      null,
      2
    ),
    "utf8"
  );
}

function releaseLock(): void {
  try {
    if (!fs.existsSync(LOCK_PATH)) return;
    const raw = JSON.parse(fs.readFileSync(LOCK_PATH, "utf8")) as {
      pid?: number;
    };
    if (raw.pid === process.pid) fs.unlinkSync(LOCK_PATH);
  } catch {
    // ignore
  }
}

function appendLiveLog(line: string): void {
  fs.mkdirSync(TMP_DIR, { recursive: true });
  fs.appendFileSync(LIVE_LOG_PATH, `${line}\n`, "utf8");
  console.log(line);
}

function buildPayload(
  targetCount: number,
  summary: RuleSummary[],
  skippedDone: string[],
  concurrency: number,
  done: boolean
): SummaryPayload {
  const okRules = summary.filter((s) => s.error === 0).length;
  const errorRules = summary.filter((s) => s.error > 0).length;
  const finished = summary.length;
  const percent =
    targetCount === 0 ? 100 : Math.round((finished / targetCount) * 1000) / 10;
  return {
    at: new Date().toISOString(),
    done,
    progress: `${finished}/${targetCount}`,
    percent,
    concurrency,
    skippedDone,
    rules: summary,
    totals: {
      rules: finished,
      okRules,
      errorRules,
      okCases: summary.reduce((a, s) => a + s.ok, 0),
      errorCases: summary.reduce((a, s) => a + s.error, 0),
      targetRules: targetCount,
    },
  };
}

function writeSummary(payload: SummaryPayload): void {
  fs.mkdirSync(TMP_DIR, { recursive: true });
  fs.writeFileSync(SUMMARY_PATH, JSON.stringify(payload, null, 2), "utf8");
}

function extractBalancedJson(text: string, fromIdx: number): string | null {
  const start = text.indexOf("{", fromIdx);
  if (start < 0) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i]!;
    if (inString) {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

function parseChildPackJson(stdout: string): {
  total: number;
  ok: number;
  skipped: number;
  error: number;
  sampleErrors: string[];
} | null {
  // Prefer the last pack CLI summary object that includes total/ok/error.
  let searchFrom = 0;
  let lastGood: {
    total: number;
    ok: number;
    skipped: number;
    error: number;
    sampleErrors: string[];
  } | null = null;
  while (searchFrom < stdout.length) {
    const marker = stdout.indexOf('"total"', searchFrom);
    if (marker < 0) break;
    const brace = stdout.lastIndexOf("{", marker);
    if (brace < 0) {
      searchFrom = marker + 7;
      continue;
    }
    const raw = extractBalancedJson(stdout, brace);
    searchFrom = marker + 7;
    if (!raw) continue;
    try {
      const obj = JSON.parse(raw) as Record<string, unknown>;
      if (
        typeof obj.total === "number" &&
        typeof obj.ok === "number" &&
        typeof obj.error === "number"
      ) {
        const sampleErrors = Array.isArray(obj.sampleErrors)
          ? (obj.sampleErrors as Array<{ id?: string; reason?: string }>)
              .slice(0, 3)
              .map((e) => `${e.id ?? "?"}: ${e.reason ?? ""}`)
          : [];
        lastGood = {
          total: obj.total,
          ok: obj.ok,
          skipped: typeof obj.skipped === "number" ? obj.skipped : 0,
          error: obj.error,
          sampleErrors,
        };
      }
    } catch {
      // keep scanning
    }
  }
  return lastGood;
}

function runRuleInChild(
  ruleId: string,
  workerIndex: number
): Promise<RuleSummary> {
  const started = Date.now();
  return new Promise((resolve) => {
    const env = { ...process.env };
    delete env.UAE_EINVOICE_DISABLE_WORKER_IDENTITY;
    // Match Playwright worker isolation: TS+Python both key off TEST_PARALLEL_INDEX → pw-<n>.
    env.TEST_PARALLEL_INDEX = String(workerIndex);
    env.UAE_EINVOICE_WORKER_INDEX = String(workerIndex);
    env.UAE_EINVOICE_COUNTERPARTY_ELECTRONIC =
      env.UAE_EINVOICE_COUNTERPARTY_ELECTRONIC || "om-receiver-dev";
    env.PYTHONUNBUFFERED = "1";
    fs.mkdirSync(
      path.join(process.cwd(), "testData", "generated", "excel", `pw-${workerIndex}`),
      { recursive: true }
    );

    const child = spawn(
      process.platform === "win32" ? "npx.cmd" : "npx",
      [
        "tsx",
        "scripts/generate_conditional_validation_oman_excels.ts",
        "--rule",
        ruleId,
      ],
      {
        cwd: process.cwd(),
        env,
        shell: true,
        windowsHide: true,
      }
    );

    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (buf) => {
      const s = String(buf);
      stdout += s;
      process.stdout.write(s);
    });
    child.stderr?.on("data", (buf) => {
      const s = String(buf);
      stderr += s;
      process.stderr.write(s);
    });

    child.on("error", (err) => {
      resolve({
        ruleId,
        total: 0,
        ok: 0,
        skipped: 0,
        error: 1,
        sampleErrors: [`spawn: ${err.message}`],
        elapsedSec: Math.round((Date.now() - started) / 1000),
        workerIndex,
      });
    });

    child.on("close", (code) => {
      const parsed = parseChildPackJson(stdout);
      const elapsedSec = Math.round((Date.now() - started) / 1000);
      if (parsed) {
        resolve({
          ruleId,
          total: parsed.total,
          ok: parsed.ok,
          skipped: parsed.skipped,
          error: parsed.error || (code === 0 ? 0 : Math.max(1, parsed.error)),
          sampleErrors: parsed.sampleErrors,
          elapsedSec,
          workerIndex,
        });
        return;
      }
      resolve({
        ruleId,
        total: 0,
        ok: 0,
        skipped: 0,
        error: 1,
        sampleErrors: [
          `child exit=${code}; could not parse pack JSON. stderr=${stderr
            .slice(0, 240)
            .replace(/\s+/g, " ")}`,
        ],
        elapsedSec,
        workerIndex,
      });
    });
  });
}

async function runRuleInProcess(ruleId: string): Promise<{
  summary: RuleSummary;
  results: Awaited<ReturnType<typeof generateConditionalValidationExcelPack>>;
}> {
  const started = Date.now();
  const results = await generateConditionalValidationExcelPack({
    ruleId,
    packRoot: PACK_ROOT,
  });
  const ok = results.filter((r) => r.status === "ok").length;
  const skipped = results.filter((r) => r.status === "skipped").length;
  const error = results.filter((r) => r.status === "error").length;
  const sampleErrors = results
    .filter((r) => r.status === "error")
    .slice(0, 3)
    .map((r) => `${r.id}: ${r.reason || ""}`);
  return {
    summary: {
      ruleId,
      total: results.length,
      ok,
      skipped,
      error,
      sampleErrors,
      elapsedSec: Math.round((Date.now() - started) / 1000),
      workerIndex: 1,
    },
    results,
  };
}

async function runParallel(
  rules: string[],
  concurrency: number,
  priorKept: RuleSummary[],
  skippedDone: string[],
  targetCount: number
): Promise<RuleSummary[]> {
  const summary = [...priorKept];
  const claimed = new Set<string>();
  let nextIndex = 0;

  const persist = (doneFlag: boolean) => {
    const payload = buildPayload(
      targetCount,
      summary,
      skippedDone,
      concurrency,
      doneFlag
    );
    writeSummary(payload);
    appendLiveLog(
      `Progress ${payload.progress} (${payload.percent}%) concurrency=${concurrency}`
    );
  };

  persist(false);

  const workers = Array.from({ length: concurrency }, async (_, slot) => {
    const workerIndex = slot + 1;
    while (true) {
      const i = nextIndex++;
      if (i >= rules.length) return;
      const ruleId = rules[i]!;
      const key = ruleId.toUpperCase();
      if (claimed.has(key)) {
        appendLiveLog(`SKIP duplicate claim ${ruleId}`);
        continue;
      }
      claimed.add(key);

      appendLiveLog(
        `=== START ${ruleId} worker=${workerIndex} (${summary.length + 1}/${targetCount}) ===`
      );
      const result = await runRuleInChild(ruleId, workerIndex);
      summary.push(result);
      appendLiveLog(
        JSON.stringify({
          ruleId: result.ruleId,
          total: result.total,
          ok: result.ok,
          skipped: result.skipped,
          error: result.error,
          elapsedSec: result.elapsedSec,
          workerIndex: result.workerIndex,
        })
      );
      persist(false);
    }
  });

  await Promise.all(workers);
  return summary;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const allRules = Object.keys(MULTI_VALUE_PACK_EXPAND);
  const prior = readPriorSummary();
  const doneIds = okDoneRuleIds(prior);

  let rules = allRules;
  const skippedDone: string[] = [];

  if (args.only?.length) {
    rules = allRules.filter((r) => args.only!.includes(r.toUpperCase()));
  }

  if (args.skipDone || args.onlyRemaining) {
    rules = rules.filter((r) => {
      if (doneIds.has(r.toUpperCase())) {
        skippedDone.push(r);
        return false;
      }
      return true;
    });
  }

  if (!rules.length) {
    if (skippedDone.length) {
      console.log(
        JSON.stringify(
          {
            message: "Nothing to regenerate; all requested rules already ok",
            skippedDone,
          },
          null,
          2
        )
      );
      process.exit(0);
    }
    console.error("No rules to regenerate");
    process.exit(1);
  }

  acquireLock();
  process.on("exit", releaseLock);
  process.on("SIGINT", () => {
    releaseLock();
    process.exit(130);
  });
  process.on("SIGTERM", () => {
    releaseLock();
    process.exit(143);
  });

  fs.mkdirSync(TMP_DIR, { recursive: true });
  fs.writeFileSync(
    LIVE_LOG_PATH,
    `=== regen start ${new Date().toISOString()} concurrency=${args.concurrency} ===\n`,
    "utf8"
  );

  const priorKept: RuleSummary[] = (prior?.rules ?? []).filter((r) =>
    doneIds.has(r.ruleId.toUpperCase())
  );
  const targetCount = priorKept.length + rules.length;

  appendLiveLog(
    JSON.stringify(
      {
        regenerating: rules.length,
        skippedDoneCount: skippedDone.length,
        concurrency: args.concurrency,
        rules,
        skippedDone,
        out: PACK_ROOT,
      },
      null,
      2
    )
  );

  let summary: RuleSummary[];
  let lastResults: Awaited<
    ReturnType<typeof generateConditionalValidationExcelPack>
  > = [];

  if (args.concurrency <= 1) {
    process.env.UAE_EINVOICE_DISABLE_WORKER_IDENTITY = "1";
    process.env.UAE_EINVOICE_COUNTERPARTY_ELECTRONIC = "om-receiver-dev";
    summary = [...priorKept];
    for (let i = 0; i < rules.length; i++) {
      const ruleId = rules[i]!;
      appendLiveLog(
        `\n=== [${summary.length + 1}/${targetCount}] ${ruleId} (in-process) ===`
      );
      const { summary: result, results } = await runRuleInProcess(ruleId);
      lastResults = results;
      summary.push(result);
      appendLiveLog(
        JSON.stringify({
          ruleId: result.ruleId,
          total: result.total,
          ok: result.ok,
          skipped: result.skipped,
          error: result.error,
          elapsedSec: result.elapsedSec,
        })
      );
      const payload = buildPayload(targetCount, summary, skippedDone, 1, false);
      writeSummary(payload);
      appendLiveLog(`Progress ${payload.progress} (${payload.percent}%)`);
    }
    if (lastResults.length) {
      writeConditionalPackReadme(lastResults, PACK_ROOT);
    }
  } else {
    summary = await runParallel(
      rules,
      args.concurrency,
      priorKept,
      skippedDone,
      targetCount
    );
  }

  const finalPayload = buildPayload(
    targetCount,
    summary,
    skippedDone,
    args.concurrency,
    true
  );
  writeSummary(finalPayload);
  appendLiveLog(
    `\n=== SUMMARY Progress ${finalPayload.progress} (${finalPayload.percent}%) ===`
  );
  appendLiveLog(JSON.stringify(summary, null, 2));
  appendLiveLog(`Wrote ${SUMMARY_PATH}`);
  releaseLock();

  if (summary.some((s) => s.error > 0)) process.exit(2);
}

main().catch((err) => {
  console.error(err);
  try {
    releaseLock();
  } catch {
    // ignore
  }
  process.exit(1);
});
