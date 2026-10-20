# Framework Overview

This repository is a Playwright + TypeScript automation framework for the Oman (OMN) E-Invoice web app, with Python helpers for Excel generation and validation.

## Goals

- Validate upload behavior, error handling, and submit/delivery outcomes for the Covoro and Simplified templates.
- Cover Create / Edit / Copy invoice UI, including attachments.
- Keep tests deterministic across parallel workers.
- Capture strong failure evidence (console, API traffic, generated workbooks, screenshots, reports).

## High-Level Architecture

- `tests/`: spec entry points. Excel suites live at `tests/OMN_*.spec.ts`. Create Invoice UI suites live under `tests/OMAN_UI_SPEC/`. Specs are data-driven and call helper flows.
- `Src/baseTest.ts`: shared Playwright fixture and test lifecycle controls. Specs import `test` from here.
- `pageObjects/`: UI interaction layer — `OMN_LoginPage`, `OMN_DashboardPage`, `OMN_UploadInvoicePage`, `OMN_UIInvoiceManualPage`.
- `Helpers/`: business flows — `excel/` (upload, submit, field, formula, and conditional validation), `ui/` (Create Invoice), `worker/` (parallel seller identity), plus shared root helpers.
- `utils/`: shared infra (`pythonRunner`, `appConfig`, `global-setup`) plus `utils/excel/` (TS↔Python Excel) and `utils/ui/` (UI helpers).
- `testData/`: static templates (`testData/uploads/`) and structured datasets (`testData/FieldValidations/`). Generated workbooks go to `testData/generated/excel/pw-<index>/`.

## Playwright projects

- `chromium`: Excel upload specs (field, formula, conditional, submit). `npm run test:all`, `test:covoro`, and `test:simplified` use this project only.
- `chromium-ui`: specs whose names match `UI*.spec.ts` (Create / Edit / Copy / attachment).
- `npm test` runs both projects: Excel specs on `chromium`, UI specs on `chromium-ui`.
- Local runs use installed Google Chrome. CI uses Playwright Chromium.
- Default workers: **5** locally, **1** when `CI=true`, unless `PW_WORKERS` is set (1–32).

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

- Worker slot is derived from Playwright worker index (`TEST_PARALLEL_INDEX`, then `UAE_EINVOICE_WORKER_INDEX` in `baseTest`).
- Generated files are isolated per worker (`testData/generated/excel/pw-<index>/`).
- Seller VATIN for each slot comes from `OMN_EINVOICE_SELLER_TIN_SLOTS` in `.env` (one Oman VATIN per worker). The legacy `UAE_EINVOICE_SELLER_TIN_SLOTS` name is still read if the Oman key is empty.
- `beforeEach` and `afterEach` cleanup is designed to avoid cross-worker file deletion races.

## Environment and Configuration

- `playwright.config.ts` controls worker defaults, retries, reporters, and `baseURL` normalization.
- `.env` provides `BASE_URL`, `TEST_USER_EMAIL`, `TEST_USER_PASSWORD`, and `OMN_EINVOICE_SELLER_TIN_SLOTS`.
- Optional env vars tune delivery/upload timeouts, counterparty electronic addresses, worker count, and debug logging (`UAE_EINVOICE_DEBUG_DASHBOARD`).

## Reporting

- Playwright HTML report for local runs.
- Allure results + generated single-file report (`npm run allure:generate`).

## Recommended Onboarding Path

1. Read `README.md`.
2. Read `Src/baseTest.ts` lifecycle.
3. Read one submit spec + `Helpers/excel/submitInvoiceCaseHelper.ts`.
4. Read `pageObjects/OMN_UploadInvoicePage.ts`, `pageObjects/OMN_DashboardPage.ts`, and `pageObjects/OMN_UIInvoiceManualPage.ts`.
5. Read `utils/excel/invoiceExcel.ts` and Python writer expectations.
6. QA using Cursor: `docs/qa-cursor-workflow.md` (Headroom, graphify, diff review, Bitbucket PR flow).
