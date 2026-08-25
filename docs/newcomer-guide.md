# Newcomer Guide — UAE E‑Invoice Playwright Framework

This guide is for someone who is new to this repository and wants to **read, understand, and safely change** the framework without needing AI help.

## What this repo is

This is an **end-to-end (E2E) UI automation framework** for the UAE E‑Invoice web application.

- **Playwright + TypeScript**: browser automation and assertions
- **Python (openpyxl)**: generates and inspects Excel workbooks used by the app (uploads + downloaded error files)
- **Reports**: Playwright HTML report + Allure

If you only remember one thing: **tests are data-driven**. Most specs loop through rows in `testData/` and call a helper flow like `runSubmitInvoiceCase`.

Using Cursor for test work? Follow `docs/qa-cursor-workflow.md` (scoped prompts, graphify exploration, diff review before merge).

## Repo map (what goes where)

- **`tests/` (Specs)**: The “entry points”. Defines scenarios and expected outcomes. Should be readable.
- **`Src/baseTest.ts` (Fixture)**: The shared Playwright `test` that every spec imports. Handles session bootstrap, worker identity, attachments, cleanup, and “site unavailable” skipping.
- **`pageObjects/` (Page Objects)**: UI interaction layer (locators + actions + resilient waits).
- **`Helpers/` (Flows)**: Business flows that combine Page Objects and utilities.
- **`utils/` (Infrastructure)**: Python runner, Excel generation bridge, global setup, config helpers.
- **`testData/` (Inputs)**: JSON/TS datasets and static Excel templates (`testData/uploads/`).

### Quick decision rules

- **Change UI selectors / click logic** → `pageObjects/`
- **Change business flow / orchestration** (upload+submit behavior) → `Helpers/`
- **Change Excel generation / calculations / header mapping** → `utils/excel/invoiceExcel.ts` (+ Python scripts in `utils/excel/*.py`)
- **Change auth/bootstrap/attachments/parallel behavior** → `Src/baseTest.ts` and `utils/global-setup.ts`

## How a test run works (execution model)

### 1) Global setup logs in once

`playwright.config.ts` points to `utils/global-setup.ts` which:

- reads `.env` (`BASE_URL`, `TEST_USER_EMAIL`, `TEST_USER_PASSWORD`)
- launches Chromium
- logs in via `pageObjects/OMN_LoginPage`
- saves Playwright `storageState.json` (cookies + localStorage) and `sessionStorage.json` (`persist:root` SPA auth)

### 2) Every spec uses `Src/baseTest.ts`

Specs must import:

```ts
import { test } from "../Src/baseTest";
```

`baseTest` does the “framework things” for each test:

- injects stored `sessionStorage` on page start so the SPA opens logged in
- creates per-test diagnostics (console + API traffic capture on failures)
- sets worker identity env var `UAE_EINVOICE_WORKER_INDEX` for parallel safety
- cleans generated Excel files before/after
- skips the test early if the site was marked unavailable by global setup or mid-run network errors

### 3) Specs call a Helper flow

Most specs are intentionally thin and delegate to helpers. Example: submit flow:

- Spec: `tests/OMN_SubmitInvoice_CovoroTemplate_Test.spec.ts`
- Helper: `Helpers/excel/submitInvoiceCaseHelper.ts`
- Upload/navigation: `Helpers/excel/uploadHelper.ts` + `pageObjects/OMN_DashboardPage.ts` + `pageObjects/OMN_UploadInvoicePage.ts`
- Excel generation: `utils/excel/invoiceExcel.ts` (calls Python scripts in `utils/excel/`)

## The 3 most important user flows in this repo

### A) Field validation

Goal: upload an Excel workbook containing invalid values and assert UI + downloaded error workbook match expectations.

Typical components:

- test data under `testData/FieldValidations/`
- helper flow under `Helpers/excel/fieldValidationHelper.ts` (or similarly named)
- error workbook reading via `utils/excel/error_excel_reader.py` (called from `utils/excel/invoiceExcel.ts`)

### B) Formula validation

Goal: generate a workbook with controlled numeric inputs, force calculation rules, and validate outcomes.

In `utils/excel/invoiceExcel.ts` there are **two generation pipelines**:

- **`generateInvoiceExcel`**: formula/min-max style tests (camelCase payload)
- **`generateInvoiceFromSubmitData`**: submit-shaped rows (Excel header keys)

Do not mix them unless you understand why; they intentionally behave differently.

### C) Submit + delivery

Goal: generate a submit-shaped workbook, upload, submit, then poll dashboard status until it becomes Delivered (or fail with strong diagnostics).

Primary entry helper:

- `Helpers/excel/submitInvoiceCaseHelper.ts` → `runSubmitInvoiceCase` / `runSubmitInvoiceMultiItemCase`

## Parallel workers: what to know

This repo supports running multiple workers locally (default is 5).

Why this matters:

- Each worker generates Excel files. If they share output directories, one worker can delete another’s file.
- Some business identity (TIN) is worker-slotted.

Key mechanisms:

- `TEST_PARALLEL_INDEX` (Playwright worker index) and `UAE_EINVOICE_WORKER_INDEX` are used to slot identity.
- Generated Excel output is isolated per worker under:
  - `testData/generated/excel/pw-<index>/`

If you change anything related to output paths or cleanup, verify you aren’t reintroducing cross-worker deletes.

## Environment variables (the ones you’ll actually touch)

Required for most runs:

- `BASE_URL`
- `TEST_USER_EMAIL`
- `TEST_USER_PASSWORD`

Common tuning knobs:

- `PW_WORKERS`: overrides worker count
- `UPLOAD_STATUS_TIMEOUT_MS`: upload status polling timeout
- `SUBMIT_INVOICE_DELIVERY_TIMEOUT_MS`: delivery polling timeout (submit flow)
- `INVOICE_TEMPLATE_PATH`: override path to the invoice Excel template
- `INVOICE_EXCEL_OUTPUT_DIR`: override generated workbook output folder

## “How do I add a new test?” (recipes)

### Recipe 1 — Add a new submit test case (single invoice)

1) Add/modify a row in the submit dataset used by the spec.
   - Look at what the spec imports (example: `import * as FV from "../testData/FieldValidations";`).
2) Ensure your row uses **Excel header keys** (for submit pipeline) such as:
   - `Invoice Type Code`, `Invoice Transaction Type Code`, `Tax Category`, `Tax Rate`, etc.
3) Run locally by targeting the suite script or spec.

The important part: submit flow uses `generateInvoiceFromSubmitData` which **forces calculated totals**. If you try to “manually set totals” in the input row, they may be overwritten intentionally.

### Recipe 2 — Add a new submit test case (multi-item)

1) Add a new case to `FV.multiItemInvoiceCases` (or the dataset the multi-item spec uses).
2) Each case is an array of rows; totals are computed across lines.
3) Spec calls `runSubmitInvoiceMultiItemCase(page, tc.rows)`.

### Recipe 3 — Add a field validation case

1) Add config in `testData/FieldValidations/...`
2) Ensure the helper reads that config and can map the field name to a real template header.
3) Validate error workbook expectations using:
   - `validateErrorFileColumn(...)` or `getErrorFieldExcelDetails(...)` (via `utils/excel/invoiceExcel.ts`)

## Where newcomers usually break things (and how to avoid it)

- **Changing `Src/baseTest.ts`**:
  - Safe: small additions to attachments or diagnostics text
  - Risky: changing cleanup logic, worker identity env vars, session storage injection
- **Changing `utils/excel/invoiceExcel.ts`**:
  - Safe: adding a new helper that reuses existing writer calls
  - Risky: changing rounding rules, tax-category “effective rate” logic, header normalization, or the two generation pipelines
- **Changing template mapping logic** (`UploadInvoicePage.ensureExpectedTemplateMapping`):
  - Safe: adding a missing locator fallback
  - Risky: removing recovery steps (Edit button enable, back arrow return, loose option matching)

## If you’re lost: the best “first files” to read

In this order:

1) `README.md`
2) `docs/framework-overview.md`
3) `playwright.config.ts`
4) `utils/global-setup.ts`
5) `Src/baseTest.ts`
6) `tests/OMN_SubmitInvoice_CovoroTemplate_Test.spec.ts`
7) `Helpers/excel/submitInvoiceCaseHelper.ts`
8) `Helpers/excel/uploadHelper.ts`
9) `pageObjects/OMN_UploadInvoicePage.ts`
10) `utils/excel/invoiceExcel.ts` (plus `utils/excel/invoice_excel_writer.py`)

