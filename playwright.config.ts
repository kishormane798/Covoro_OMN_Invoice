/**
 * Playwright project defaults for UAE E-Invoice automation.
 *
 * UI specs (`UI*.spec.ts`, `UIMaster*.spec.ts`) run under project `chromium-ui`; other tests use `chromium`.
 * Video is off for Excel/`chromium`. UI/`chromium-ui` keeps video on failure (`retain-on-failure`). Trace is off.
 *
 * Workers: default is 5 so Worker 1…5 maps to TIN 1779700001…5 (`TEST_PARALLEL_INDEX` 0…4). When `CI=true`, default is 1 unless
 * `PW_WORKERS` is set. Override: `PW_WORKERS=1 npx playwright test` or `--workers=1`.
 * `baseTest` sets `UAE_EINVOICE_WORKER_INDEX` from `TEST_PARALLEL_INDEX` when set, else `parallelIndex` (slotted mod 5).
 * Generated Excel uses `testData/generated/excel/pw-<TEST_PARALLEL_INDEX>/` so parallel workers do not delete each other's files.
 *
 * Built-in Playwright HTML report is enabled. Local runs auto-open the report when complete.
 * Allure: `allure-results` → `npm run allure:generate` writes a **single-file** `allure-report/index.html` (Allure 2.24+;
 * needs Java on PATH). `npm run allure:serve` serves without a permanent folder.
 * Viewing Playwright HTML: use `npm run report` / `npx playwright show-report` so `data/` attachments resolve.
 *
 * @see https://playwright.dev/docs/test-configuration
 */

import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';
import { resolveBaseUrl } from './utils/appConfig';

dotenv.config({ path: path.resolve(__dirname, '.env') });
const resolvedBaseUrl = resolveBaseUrl();

function resolveWorkerCount(): number {
  const raw = process.env.PW_WORKERS?.trim();
  if (raw) {
    const n = Number.parseInt(raw, 10);
    if (Number.isFinite(n) && n >= 1) {
      return Math.min(n, 32);
    }
  }
  return process.env.CI ? 1 : 5;
}

export default defineConfig({
  timeout: 6 * 60 * 1000,
  testDir: './tests',
  testIgnore: [/previous-code/],
  fullyParallel: true,
  // Never fail-fast by default; allow the full suite to run.
  maxFailures: 0,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: resolveWorkerCount(),
  outputDir: 'test-results/',
  reporter: [
    ['list'],
    // Machine-readable results consumed by scripts/playwright_json_summary.py (CI email digest).
    ['json', { outputFile: process.env.PLAYWRIGHT_JSON_OUTPUT_NAME || 'test-results/results.json' }],
    [
      'allure-playwright',
      {
        resultsDir: 'allure-results',
        environmentInfo: {
          node_version: process.version,
        },
      },
    ],
    [
      'html',
      {
        outputFolder: 'playwright-report',
        // Serve with `show-report` for reliable attachment links; file:// can fail for data/ blobs.
        open: process.env.CI ? 'never' : 'always',
      },
    ],
  ],
  use: {
    baseURL: resolvedBaseUrl,
    screenshot: 'only-on-failure',
    video: 'off',
    trace: 'off',
    storageState: 'storageState.json',
  },

  globalSetup: require.resolve('./utils/global-setup'),
  projects: [
    {
      name: 'chromium',
      testIgnore: [/UI.*\.spec\.ts$/, /UIMaster.*\.spec\.ts$/, /previous-code/],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium-ui',
      testMatch: [/UI.*\.spec\.ts$/, /UIMaster.*\.spec\.ts$/],
      use: { ...devices['Desktop Chrome'], video: 'retain-on-failure' },
    },
  ],
});
