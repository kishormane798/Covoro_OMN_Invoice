import { test as base, type Request, type Page } from '@playwright/test';
import { parallelWorkerTinSlot } from '../Helpers/worker/parallelWorkerSubmitIdentity';
import { resolveBaseUrl } from '../utils/appConfig';
import {
  deleteGeneratedExcelFiles,
  errorValidationLogLines,
  generatedFiles,
} from '../utils/excel/invoiceExcel';
import {
  isUnreachableNetworkError,
  readSiteUnavailableReasonForWorker,
  requestMatchesAppHost,
  resolveAppOriginForMarker,
  writeSiteUnavailableMarker,
} from '../utils/siteUnavailableMarker';
import { existsSync, readFileSync, unlinkSync } from 'node:fs';
import path from 'path';

type SessionStorageMap = { [key: string]: string };
type LoadedAuthState = { sessionStorage: SessionStorageMap };

const REPO_ROOT = path.resolve(__dirname, '..');
const STORAGE_STATE_FILE = path.join(REPO_ROOT, 'storageState.json');
const SESSION_STORAGE_FILE = path.join(REPO_ROOT, 'sessionStorage.json');

let warnedEmptyPersistedSession = false;

function normalizeSessionMap(source: { [key: string]: unknown } | undefined): SessionStorageMap {
  const normalizedStorage: SessionStorageMap = {};
  for (const [key, value] of Object.entries(source ?? {})) {
    normalizedStorage[key] = String(value);
  }
  return normalizedStorage;
}

function loadAuthState(): LoadedAuthState {
  try {
    if (existsSync(SESSION_STORAGE_FILE)) {
      const parsed = JSON.parse(readFileSync(SESSION_STORAGE_FILE, 'utf-8')) as {
        [key: string]: unknown;
      };
      const sessionStorage = normalizeSessionMap(parsed);
      if (!sessionStorage['persist:root'] && !warnedEmptyPersistedSession) {
        warnedEmptyPersistedSession = true;
        console.warn(
          '[auth] sessionStorage.json has no persist:root — SPA tests may open logged out.'
        );
      }
      return { sessionStorage };
    }

    if (!existsSync(STORAGE_STATE_FILE)) {
      return { sessionStorage: {} };
    }

    const parsed = JSON.parse(readFileSync(STORAGE_STATE_FILE, 'utf-8')) as {
      sessionStorage?: { [key: string]: unknown };
    };
    return { sessionStorage: normalizeSessionMap(parsed?.sessionStorage) };
  } catch {
    return { sessionStorage: {} };
  }
}

async function injectSessionStorage(
  page: Page,
  storage: SessionStorageMap
): Promise<void> {
  if (Object.keys(storage).length === 0) return;
  await page.evaluate((items) => {
    try {
      for (const key in items) {
        sessionStorage.setItem(key, items[key]);
      }
    } catch {
      /* about:blank / opaque origin */
    }
  }, storage);
}

function resolveDashboardUrl(baseURL: string | undefined): string {
  return `${resolveBaseUrl(baseURL)}/business-dashboard`;
}

const XLSX_MEDIA_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/** Same workbook was often pushed twice (e.g. generator path vs upload path string); Set() does not dedupe mixed casing / relative vs absolute on Windows. */
function existingDedupedAbsolutePaths(paths: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of paths) {
    if (!existsSync(p)) continue;
    const abs = path.resolve(p);
    const key = process.platform === 'win32' ? abs.toLowerCase() : abs;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(abs);
  }
  return out;
}

type UaeWorkerFixtures = {
  uaeParallelWorkerSlot: number;
};

type UaeTestFixtures = {
  /** Unauthenticated page: no storageState, no sessionStorage injection, no auto dashboard goto. Tag test/describe with `@fresh-page` to bypass site-unavailable skip. */
  freshPage: Page;
};

type FailureDiagnostics = {
  consoleLines: string[];
  apiLines: string[];
};

type TestTiming = {
  startMs: number;
};

const INDIA_TZ = 'Asia/Kolkata';

const failureDiagnosticsByTest = new WeakMap<import('@playwright/test').TestInfo, FailureDiagnostics>();
const testTimingByTest = new WeakMap<import('@playwright/test').TestInfo, TestTiming>();
const MAX_CONSOLE_LINES = 400;
const MAX_API_LINES = 800;
const MAX_RESPONSE_BODY_CHARS = 1_200;
const API_DUPLICATE_WINDOW_MS = 15_000;

function clipText(input: string, max: number): string {
  if (input.length <= max) return input;
  return `${input.slice(0, max)}… [truncated ${input.length - max} chars]`;
}

function sanitizeSingleLine(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

function isApiLikeRequest(request: Request): boolean {
  const rt = request.resourceType();
  return rt === 'fetch' || rt === 'xhr';
}

function deriveApiNameFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const segments = u.pathname.split('/').filter(Boolean);
    if (segments.length === 0) return '(root)';
    const last = segments[segments.length - 1];
    return last || '(unknown)';
  } catch {
    const cleaned = url.split('?')[0];
    const segments = cleaned.split('/').filter(Boolean);
    return segments[segments.length - 1] || '(unknown)';
  }
}

function shouldCaptureApiResponse(url: string, status: number): boolean {
  const okNoLog = status === 200 || status === 201;
  if (okNoLog) {
    return process.env.API_TRAFFIC_VERBOSE === '1';
  }
  return true;
}

function pushBoundedLine(target: string[], line: string, max: number): void {
  target.push(line);
  if (target.length > max) {
    target.splice(0, target.length - max);
  }
}

/** Wall-clock time in India (IST, Asia/Kolkata) for failure reports. */
function formatIndiaTime(value: Date | number): string {
  const date = typeof value === 'number' ? new Date(value) : value;
  try {
    const formatted = new Intl.DateTimeFormat('en-IN', {
      timeZone: INDIA_TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);
    const ms = String(date.getMilliseconds()).padStart(3, '0');
    return `${formatted}.${ms} IST`;
  } catch {
    const base = date.toLocaleString('sv-SE', { timeZone: INDIA_TZ });
    const ms = String(date.getMilliseconds()).padStart(3, '0');
    return `${base}.${ms} IST`;
  }
}

function buildFailureContextBlock(
  testInfo: import('@playwright/test').TestInfo,
  endedMs: number
): string {
  const firstError = testInfo.errors?.[0];
  const errorMessage = firstError?.message?.trim() || 'N/A';
  const errorStack = firstError?.stack?.trim() || 'N/A';
  const timing = testTimingByTest.get(testInfo);
  const testStartedAt = timing ? formatIndiaTime(timing.startMs) : 'N/A';
  const testEndedAt = formatIndiaTime(endedMs);
  const durationMs = testInfo.duration;
  const isFailLike = testInfo.status === 'failed' || testInfo.status === 'timedOut';
  let testFailedAt = 'N/A';
  if (isFailLike && timing && Number.isFinite(durationMs) && durationMs >= 0) {
    testFailedAt = formatIndiaTime(timing.startMs + durationMs);
  } else if (isFailLike) {
    testFailedAt = testEndedAt;
  }
  return [
    '',
    '--- Failure Context ---',
    `title: ${testInfo.title}`,
    `status: ${testInfo.status}`,
    `expectedStatus: ${testInfo.expectedStatus}`,
    `timeoutMs: ${testInfo.timeout}`,
    `retry: ${testInfo.retry}`,
    `workerIndex: ${testInfo.parallelIndex}`,
    `file: ${testInfo.file}`,
    `project: ${testInfo.project.name}`,
    `testStartedAt: ${testStartedAt}`,
    `testEndedAt: ${testEndedAt}`,
    `testFailedAt: ${testFailedAt}`,
    `durationMs: ${durationMs}`,
    `errorMessage: ${errorMessage}`,
    `errorStack: ${errorStack}`,
    '--- End Failure Context ---',
    '',
  ].join('\n');
}

export const test = base.extend<UaeTestFixtures, UaeWorkerFixtures>({
  uaeParallelWorkerSlot: [
    async ({}, use, workerInfo) => {
      await use(workerInfo.parallelIndex);
    },
    { scope: 'worker', auto: true },
  ],
  context: async ({ context }, use) => {
    const sessionForInit = loadAuthState().sessionStorage;
    await context.addInitScript((storage: { [key: string]: string }) => {
      try {
        for (const key in storage) {
          sessionStorage.setItem(key, storage[key]);
        }
      } catch {
        /* about:blank / opaque origin — next same-origin document still runs this */
      }
    }, sessionForInit);
    await use(context);
  },
  page: async ({ page, baseURL, uaeParallelWorkerSlot }, use, testInfo) => {
    const appOrigin = resolveAppOriginForMarker(baseURL);
    const diagnostics = failureDiagnosticsByTest.get(testInfo) ?? { consoleLines: [], apiLines: [] };
    failureDiagnosticsByTest.set(testInfo, diagnostics);
    const recentApiSignatures = new Map<string, number>();

    // Mid-run: Chrome "This site can't be reached" / ERR_* on navigation → per-worker marker (does not skip other workers).
    const onRequestFailed = (request: Request) => {
      if (isApiLikeRequest(request)) {
        const failure = request.failure()?.errorText ?? 'unknown request failure';
        const apiName = deriveApiNameFromUrl(request.url());
        pushBoundedLine(
          diagnostics.apiLines,
          `[API FAILED] name=${apiName} | method=${request.method()} | url=${request.url()} | code=REQUEST_FAILED | error=${failure}`,
          MAX_API_LINES
        );
      }
      if (!request.isNavigationRequest()) return;
      const navFailure = request.failure();
      const errText = navFailure?.errorText ?? "";
      if (!isUnreachableNetworkError(errText)) return;
      if (!requestMatchesAppHost(request.url(), appOrigin)) return;
      writeSiteUnavailableMarker(
        appOrigin,
        `[requestfailed] ${errText} — ${request.method()} ${request.url()}`,
        { parallelIndex: uaeParallelWorkerSlot }
      );
    };

    const onConsole = (msg: import('@playwright/test').ConsoleMessage) => {
      const location = msg.location();
      const at = location.url
        ? ` @ ${location.url}${location.lineNumber ? `:${location.lineNumber}` : ''}`
        : '';
      const line = `[${msg.type().toUpperCase()}] ${sanitizeSingleLine(msg.text())}${at}`;
      pushBoundedLine(diagnostics.consoleLines, line, MAX_CONSOLE_LINES);
    };

    const onResponse = async (response: import('@playwright/test').Response) => {
      const request = response.request();
      if (!isApiLikeRequest(request)) return;
      const status = response.status();
      if (!shouldCaptureApiResponse(response.url(), status)) return;
      const apiName = deriveApiNameFromUrl(response.url());
      const baseLine =
        `[API RESPONSE] name=${apiName} | method=${request.method()} | url=${response.url()} | code=${status} | status=${response.statusText()}`;

      const contentType = response.headers()['content-type'] ?? '';
      const isTextLike =
        /json|text|xml|javascript|problem\+json/i.test(contentType) || status >= 400;
      let bodySuffix = '';
      try {
        if (isTextLike) {
          const body = await response.text();
          const compactBody = sanitizeSingleLine(body);
          if (compactBody) {
            bodySuffix = ` | body=${clipText(compactBody, MAX_RESPONSE_BODY_CHARS)}`;
          }
        }
      } catch {
        bodySuffix = ' | body=<unavailable>';
      }

      const fullLine = `${baseLine}${bodySuffix}`;
      const now = Date.now();
      const lastSeenAt = recentApiSignatures.get(fullLine);
      if (lastSeenAt && now - lastSeenAt < API_DUPLICATE_WINDOW_MS) {
        return;
      }
      recentApiSignatures.set(fullLine, now);
      pushBoundedLine(diagnostics.apiLines, fullLine, MAX_API_LINES);
    };

    const ctx = page.context();
    ctx.on("requestfailed", onRequestFailed);
    page.on("console", onConsole);
    ctx.on("response", onResponse);

    const sessionForInit = loadAuthState().sessionStorage;

    // Headed/debug: first screen is usable without each spec calling goto immediately.
    const current = page.url();
    if (!current || current === "about:blank") {
      const target = resolveDashboardUrl(baseURL);
      try {
        await page.goto(target, { waitUntil: "domcontentloaded", timeout: 90_000 });
        const hasRoot = await page
          .evaluate(() => {
            try {
              return sessionStorage.getItem('persist:root') != null;
            } catch {
              return false;
            }
          })
          .catch(() => false);
        if (!hasRoot && sessionForInit['persist:root']) {
          await injectSessionStorage(page, sessionForInit);
          await page.reload({ waitUntil: 'domcontentloaded', timeout: 90_000 });
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (isUnreachableNetworkError(msg)) {
          writeSiteUnavailableMarker(appOrigin, `[navigation] ${msg}`, {
            parallelIndex: uaeParallelWorkerSlot,
          });
        }
      }
    }

    try {
      await use(page);
    } finally {
      ctx.off("requestfailed", onRequestFailed);
      page.off("console", onConsole);
      ctx.off("response", onResponse);
    }
  },
  freshPage: async ({ browser, baseURL, uaeParallelWorkerSlot }, use, testInfo) => {
    const appOrigin = resolveAppOriginForMarker(baseURL);
    const diagnostics = failureDiagnosticsByTest.get(testInfo) ?? { consoleLines: [], apiLines: [] };
    failureDiagnosticsByTest.set(testInfo, diagnostics);
    const recentApiSignatures = new Map<string, number>();

    const context = await browser.newContext({
      baseURL,
      storageState: undefined,
    });
    const page = await context.newPage();

    const onRequestFailed = (request: Request) => {
      if (isApiLikeRequest(request)) {
        const failure = request.failure()?.errorText ?? 'unknown request failure';
        const apiName = deriveApiNameFromUrl(request.url());
        pushBoundedLine(
          diagnostics.apiLines,
          `[API FAILED] name=${apiName} | method=${request.method()} | url=${request.url()} | code=REQUEST_FAILED | error=${failure}`,
          MAX_API_LINES
        );
      }
      if (!request.isNavigationRequest()) return;
      const navFailure = request.failure();
      const errText = navFailure?.errorText ?? "";
      if (!isUnreachableNetworkError(errText)) return;
      if (!requestMatchesAppHost(request.url(), appOrigin)) return;
      writeSiteUnavailableMarker(
        appOrigin,
        `[requestfailed] ${errText} — ${request.method()} ${request.url()}`,
        { parallelIndex: uaeParallelWorkerSlot }
      );
    };

    const onConsole = (msg: import('@playwright/test').ConsoleMessage) => {
      const location = msg.location();
      const at = location.url
        ? ` @ ${location.url}${location.lineNumber ? `:${location.lineNumber}` : ''}`
        : '';
      const line = `[${msg.type().toUpperCase()}] ${sanitizeSingleLine(msg.text())}${at}`;
      pushBoundedLine(diagnostics.consoleLines, line, MAX_CONSOLE_LINES);
    };

    const onResponse = async (response: import('@playwright/test').Response) => {
      const request = response.request();
      if (!isApiLikeRequest(request)) return;
      const status = response.status();
      if (!shouldCaptureApiResponse(response.url(), status)) return;
      const apiName = deriveApiNameFromUrl(response.url());
      const baseLine =
        `[API RESPONSE] name=${apiName} | method=${request.method()} | url=${response.url()} | code=${status} | status=${response.statusText()}`;

      const contentType = response.headers()['content-type'] ?? '';
      const isTextLike =
        /json|text|xml|javascript|problem\+json/i.test(contentType) || status >= 400;
      let bodySuffix = '';
      try {
        if (isTextLike) {
          const body = await response.text();
          const compactBody = sanitizeSingleLine(body);
          if (compactBody) {
            bodySuffix = ` | body=${clipText(compactBody, MAX_RESPONSE_BODY_CHARS)}`;
          }
        }
      } catch {
        bodySuffix = ' | body=<unavailable>';
      }

      const fullLine = `${baseLine}${bodySuffix}`;
      const now = Date.now();
      const lastSeenAt = recentApiSignatures.get(fullLine);
      if (lastSeenAt && now - lastSeenAt < API_DUPLICATE_WINDOW_MS) {
        return;
      }
      recentApiSignatures.set(fullLine, now);
      pushBoundedLine(diagnostics.apiLines, fullLine, MAX_API_LINES);
    };

    context.on("requestfailed", onRequestFailed);
    page.on("console", onConsole);
    context.on("response", onResponse);

    try {
      await use(page);
    } finally {
      context.off("requestfailed", onRequestFailed);
      page.off("console", onConsole);
      context.off("response", onResponse);
      await context.close();
    }
  },
});

test.beforeEach(async ({}, testInfo) => {
  testTimingByTest.set(testInfo, { startMs: Date.now() });
  // Remove stale xlsx from interrupted runs; skip suite if global login could not reach the app.
  await deleteGeneratedExcelFiles();
  const siteDown = readSiteUnavailableReasonForWorker(testInfo.parallelIndex);
  const bypassSiteUnavailableSkip = testInfo.tags.includes('@fresh-page');
  if (siteDown && !bypassSiteUnavailableSkip) {
    test.skip(
      true,
      `Skipping because site/login is unavailable (${siteDown.baseUrl ?? 'BASE_URL'}). ${siteDown.reason ?? ''}`.trim()
    );
  }

  generatedFiles.length = 0;
  errorValidationLogLines.length = 0;
  failureDiagnosticsByTest.set(testInfo, { consoleLines: [], apiLines: [] });
  // Multi-TIN: slot 0–4 → Python/Excel worker TINs 1779700001…5. Prefer TEST_PARALLEL_INDEX when set; subprocesses inherit env.
  const tp = process.env.TEST_PARALLEL_INDEX;
  const parallelRaw =
    tp !== undefined && tp !== "" && Number.isFinite(Number(tp))
      ? Number(tp)
      : testInfo.parallelIndex;
  process.env.UAE_EINVOICE_WORKER_INDEX = String(parallelWorkerTinSlot(parallelRaw));
});


test.afterEach(async ({}, testInfo) => {
  const testEndedMs = Date.now();
  const isFailureLike = testInfo.status !== 'passed' && testInfo.status !== 'skipped';

  if (isFailureLike) {
    const diagnostics = failureDiagnosticsByTest.get(testInfo) ?? {
      consoleLines: [],
      apiLines: [],
    };
    const failureContextBlock = buildFailureContextBlock(testInfo, testEndedMs);
    const consoleBody =
      diagnostics.consoleLines.length > 0
        ? diagnostics.consoleLines.join('\n')
        : 'No browser console messages were captured before failure.';
    await testInfo.attach('console-log.txt', {
      body: consoleBody,
      contentType: 'text/plain; charset=utf-8',
    });

    const apiBody =
      diagnostics.apiLines.length > 0
        ? diagnostics.apiLines.join('\n')
        : 'No fetch/xhr API traffic was captured before failure.';
    await testInfo.attach('api-traffic.txt', {
      body: apiBody,
      contentType: 'text/plain; charset=utf-8',
    });

    await testInfo.attach('failure-context.txt', {
      body: failureContextBlock,
      contentType: 'text/plain; charset=utf-8',
    });

    if (errorValidationLogLines.length > 0) {
      await testInfo.attach('error-validation.txt', {
        body: `${errorValidationLogLines.join('\n')}\n`,
        contentType: 'text/plain; charset=utf-8',
      });
    }

    // Deduplicate: generators and `uploadFile` may register the same path under different strings.
    const excelPaths = existingDedupedAbsolutePaths(generatedFiles);
    for (const resolvedPath of excelPaths) {
      const name = path.basename(resolvedPath);
      const body = readFileSync(resolvedPath);
      await testInfo.attach(name, {
        body,
        contentType: XLSX_MEDIA_TYPE,
      });
    }
    if (excelPaths.length === 0) {
      await testInfo.attach('excel-attachments.txt', {
        body:
          'No generated/uploaded Excel file path was available at failure time. ' +
          'Failure may have happened before upload/file generation.\n',
        contentType: 'text/plain; charset=utf-8',
      });
    }
  }
  for (const file of existingDedupedAbsolutePaths(generatedFiles)) {
    try {
      if (existsSync(file)) {
        unlinkSync(file);
      }
    } catch {}
  }

  const testEndLabel: Record<string, string> = {
    passed: "PASS",
    failed: "FAIL",
    timedOut: "TIMEOUT",
    skipped: "SKIP",
    interrupted: "INTERRUPTED",
  };
  const endLabel =
    testEndLabel[testInfo.status ?? ""] ??
    (testInfo.status ?? "UNKNOWN").toUpperCase();

  await deleteGeneratedExcelFiles();
  errorValidationLogLines.length = 0;
  failureDiagnosticsByTest.delete(testInfo);
  testTimingByTest.delete(testInfo);
});
