# Framework Overview

This repository is a Playwright + TypeScript automation framework for the UAE E-Invoice web app, with Python helpers for Excel generation and validation.

## Goals

- Validate upload behavior, error handling, and submit/delivery outcomes for both template modes.
- Keep tests deterministic across parallel workers.
- Capture strong failure evidence (console, API traffic, generated workbooks, screenshots, reports).

## High-Level Architecture

- `tests/`: spec entry points. Specs are data-driven and call helper flows.
- `Src/baseTest.ts`: shared Playwright fixture and test lifecycle controls.
- `pageObjects/`: UI interaction layer (`LoginPage`, `DashboardPage`, `UploadInvoicePage`).
- `Helpers/`: business-level reusable flows and reporting glue.
- `utils/`: Excel generation bridge, Python runner, global setup, outage marker logic.
- `testData/`: static templates and structured test datasets.

## Execution Model

1. `global-setup` authenticates once and stores browser auth state.
2. `baseTest` boots each test with session storage, diagnostics hooks, and site-unavailability markers.
3. Spec calls helper (`runSubmitInvoiceCase`, field/formula helpers, etc.).
4. Helper drives Page Objects for navigation/upload/submit.
5. Python-based Excel writer/reader handles workbook generation and error-file parsing.
6. `baseTest` attaches artifacts and cleans generated files.

## Responsibility Boundaries

- **Specs**: define scenarios and expected outcomes; avoid raw selector logic.
- **Helpers**: orchestration and domain rules (template mode, tax behavior, diagnostics).
- **Page Objects**: only UI actions, locators, and resilient UI waits.
- **Utils**: cross-cutting infrastructure (Python process calls, file handling, env resolution).
- **Test Data**: source-of-truth combinations for cases.

## Data and Artifact Flow

- Input rows from `testData/` -> transformed by helper rules -> written to workbook via Python writer.
- Workbook uploaded by UI flow -> app status polled (`completed` / `error` / delivery states).
- On failure/timeouts, framework attaches:
  - console transcript (`console-log.txt`)
  - API traffic transcript (`api-traffic.txt`)
  - generated/uploaded `.xlsx` (when available)
  - Playwright screenshot + report artifacts

## Parallel Worker Strategy

- Worker slot is derived from Playwright worker index.
- Generated files are isolated per worker (`testData/generated/excel/pw-<index>/`).
- TIN identity selection can be mapped per worker.
- `beforeEach` and `afterEach` cleanup is designed to avoid cross-worker file deletion races.

## Environment and Configuration

- `playwright.config.ts` controls worker defaults, retries, reporters, and `baseURL` normalization.
- `.env` provides app URL and credentials.
- Optional env vars tune delivery/upload timeouts, worker count, and debug logging.

## Reporting

- Playwright HTML report for local runs.
- Allure results + generated single-file report (`npm run allure:generate`).

## Recommended Onboarding Path

1. Read `README.md`.
2. Read `Src/baseTest.ts` lifecycle.
3. Read one submit spec + `Helpers/submitInvoiceCaseHelper.ts`.
4. Read `pageObjects/OMN_UploadInvoicePage.ts` and `pageObjects/OMN_DashboardPage.ts`.
5. Read `utils/invoiceExcel.ts` and Python writer expectations.
6. QA using Cursor: `docs/qa-cursor-workflow.md` (Headroom, graphify, diff review, Bitbucket PR flow).
