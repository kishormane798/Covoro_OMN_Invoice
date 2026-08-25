# OMN E-Invoice — Playwright automation

End-to-end tests for the OMN E-Invoice web application. The suite uses **Playwright** and **TypeScript** for browser automation, **Python** with **openpyxl** for Excel generation and validation, and **Allure** plus the built-in HTML reporter for results.

## What this framework does

- **Field validation** — Upload invoice workbooks with invalid or edge-case values; assert UI and downloadable error files match expectations (Covoro / full template).
- **Formula validation** — Exercise spreadsheet formulas and totals against the app’s validation pipeline.
- **Submit flows** — Generate workbooks from structured test data, upload, submit, and wait for delivery status (longer timeouts for backend processing).

Authentication runs once in **global setup**; tests reuse `storageState.json` and inject **session storage** so the SPA starts in a logged-in state. Failed runs attach generated **`.xlsx`** files to Playwright and Allure when useful.

---

## Repository layout

| Area                               | Role                                                                                                                                                                                                                            |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/`                           | Playwright spec files (`*.spec.ts`). Grouped by scenario (field, formula, submit, UI).                                                                                                                                        |
| `Src/baseTest.ts`                  | Extended `test` fixture: session bootstrap, dashboard navigation, parallel worker identity, generated Excel cleanup, attachments, site-unavailable handling. **Import `test` from here**, not from `@playwright/test` directly. |
| `pageObjects/`                     | Page Object Model: `LoginPage`, `DashboardPage`, `UploadInvoicePage`, etc.                                                                                                                                                      |
| `Helpers/`                         | Flow helpers (`uploadHelper`, `fieldValidationHelper`, `submitInvoiceCaseHelper`, …), reporting, and parallel TIN mapping.                                                                                                      |
| `utils/`                           | Shared: `pythonRunner.ts`, `appConfig.ts`, `global-setup.ts`, `siteUnavailableMarker.ts`. Excel: `utils/excel/` (`invoiceExcel.ts`, writer/reader `.py`). UI: `utils/ui/`. |
| `testData/`                        | Field-validation configs, submit payloads, template headers, and static templates under `testData/uploads/`. **Generated workbooks** go to `testData/generated/` (gitignored).                                                  |

---

## Prerequisites

- **Node.js** (LTS recommended; see `.node-version` if present)
- **Python 3.x** with packages from `requirements.txt` (openpyxl for Excel scripts)
- **Java 17+** on `PATH` if you generate Allure HTML locally (`npm run allure:generate`)

On Windows, Python may be available as `py` or `python`; `utils/pythonRunner.ts` tries common launchers.

---

## Setup

```bash
npm ci
pip install -r requirements.txt
npx playwright install chromium
```

Create a **`.env`** file in the repo root (never commit it; it is gitignored):

| Variable             | Required | Description                                                                                                                   |
| -------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `BASE_URL`           | Yes\*    | Application origin, e.g. `https://dev.example.com` (no trailing slash). Local runs fall back via `utils/appConfig.ts` (`DEFAULT_BASE_URL` or optional `DEFAULT_BASE_URL` env). |
| `TEST_USER_EMAIL`    | Yes      | Login email used by **global setup** to create `storageState.json`.                                                           |
| `TEST_USER_PASSWORD` | Yes      | Login password.                                                                                                               |

\*Global setup throws if email or password is missing.

Optional variables used in automation:

| Variable                               | Purpose                                                                                                                                                     |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PW_WORKERS`                           | Worker count (1–32). Default is **5** unless set. Override: `PW_WORKERS=1 npx playwright test` or `--workers=1`.                            |
| `INVOICE_TEMPLATE_PATH`                | Override path to the invoice Excel template (default: `testData/uploads/template.xlsx`).                                                                    |
| `INVOICE_EXCEL_OUTPUT_DIR`             | Override directory for generated workbooks (default under `testData/generated/excel`).                                                                      |
| `TEST_PARALLEL_INDEX`                  | Set by Playwright in workers; used for per-worker output folders `testData/generated/excel/pw-<index>/` and TIN slotting.                                   |
| `UAE_EINVOICE_WORKER_INDEX`            | Set in `baseTest` from worker index (slotted 0–4); aligns with dashboard TIN selection and Python row identity.                                             |
| `UAE_EINVOICE_DISABLE_WORKER_IDENTITY` | Set to `1` to disable multi-TIN worker identity behavior.                                                                                                   |
| `UAE_EINVOICE_COUNTERPARTY_ELECTRONIC` | Override counterparty electronic address (normal buyer / self-billed seller). Defaults: **dev** `1000091919`, **preprod** `1200020015` (from `BASE_URL`). |
| `SUBMIT_INVOICE_DELIVERY_TIMEOUT_MS`   | Minimum 60000; default **4 minutes** wait for submit/delivery steps.                                                                                        |
| `UAE_EINVOICE_DEBUG_DASHBOARD`         | Set to `1` for extra dashboard logging.                                                                                                                     |

---

## Running tests

```bash
npx playwright test
```

Useful **npm** scripts:

| Script                                                      | Description                                                                 |
| ----------------------------------------------------------- | --------------------------------------------------------------------------- |
| `npm test`                                                  | Full Playwright run (`tests/`).                                             |
| `npm run test:all`                                          | All tests, **chromium** project only.                                       |
| `npm run test:covoro`                                       | Specs matching `*CovoroTemplate*`.                                          |
| `npm run test:covoro:headed`                                | Same with browser visible.                                                  |
| `npm run test:covoro:parallel`                              | Example with `--workers=4`.                                                 |
| `npm run report`                                            | Open the **HTML** report (use this so `data/` attachments resolve).         |
| `npm run allure:generate`                                   | Build single-file Allure report under `allure-report/`.                     |
| `npm run allure:serve`                                      | Serve Allure from `allure-results` without a permanent folder.              |
| `npm run clean`                                             | Remove reports, results, Allure output, generated data, and outage markers. |
| `npm run lint`                                              | ESLint.                                                                     |
| `npm run format`                                            | Prettier for `ts`, `js`, `json`, `md`.                                      |

---

## Parallel workers and TIN identity

- Default **5** local workers map to TIN slots **1779700001–1779700005** (wrapping if more than five workers).
- Each worker writes generated Excel under `testData/generated/excel/pw-<worker>/` so files are not deleted by another worker’s `beforeEach` cleanup.
- **`UAE_EINVOICE_WORKER_INDEX`** is derived from `TEST_PARALLEL_INDEX` or Playwright’s `parallelIndex` (see `Helpers/worker/parallelWorkerSubmitIdentity.ts`).

---

## Reports and artifacts

- **Playwright HTML** — `playwright-report/`; open with `npm run report` or `npx playwright show-report`.
- **Allure** — Raw results in `allure-results/`; single-file `allure-report/index.html` after `npm run allure:generate` (needs Java).
- **Failures** — Screenshots on failure; generated `.xlsx` may be attached for failed/timed-out tests.

---

## QA onboarding and branch/merge process

Use this flow for any new QA engineer so changes stay reviewable and `main` remains stable.

### 1) Clone and first-time setup

```bash
git clone https://bitbucket.org/perennialsys/covoro-uae-invoice-automation.git
cd covoro-uae-invoice-automation
npm ci
pip install -r requirements.txt
npx playwright install chromium
```

Create `.env` in the repo root:

```env
BASE_URL=https://dev.covoro.ai
TEST_USER_EMAIL=your-test-user@example.com
TEST_USER_PASSWORD=your-password
```

### 2) Sync latest `main` before starting work

```bash
git checkout main
git pull origin main
```

### 3) Create a sub-branch (feature branch)

Use a clear branch name:

```bash
git checkout -b feature/<short-task-name>
```

Examples:
- `feature/covoro-submit-negative-cases`
- `feature/formula-boundary-tests`

### 4) Do your changes and run checks

Run only the relevant suite(s), then lint:

```bash
npm run test:covoro
npm run lint
```

### 5) Commit your branch changes

```bash
git add .
git commit -m "Add <what changed> for <why>"
```


### 6) Create a Pull Request (PR) on Bitbucket

Push your branch, then open a PR from your branch to `main` on Bitbucket and include:
- what changed
- why it changed
- what test command(s) you ran
- screenshots/report links when relevant

### 7) Review gate (Bitbucket process)

- Do **not** push directly to `main`.
- `main` should be protected (branch permissions on Bitbucket).
- At least one reviewer approval is required before merge.
- If you are the approver, review code first, request fixes if needed, then approve.
- Complete final branch integration only through the Bitbucket pull request flow.

---

## Troubleshooting

- **`Missing TEST_USER_EMAIL or TEST_USER_PASSWORD`** — Add both to `.env`.
- **Site unreachable / tests skipped** — Global setup or navigation may write `site-unavailable.json` (and per-worker `site-unavailable-w*.json`). Fix network/`BASE_URL`, then remove markers or run `npm run clean`.
- **Stale login** — Delete `storageState.json` and rerun so global setup logs in again.
- **Python / Excel errors** — Ensure `pip install -r requirements.txt` and that `python`/`py` runs `utils/excel/invoice_excel_writer.py` from the repo root.

---

## Branches

`main` holds this Playwright framework. Other remote branches may exist for history; remove obsolete branches on the remote if they are no longer needed.


---

## Documentation

- [`docs/framework-overview.md`](docs/framework-overview.md) — high-level architecture and execution model
- [`docs/newcomer-guide.md`](docs/newcomer-guide.md) — onboarding guide for new engineers (where to change what, how to add tests)
- [`docs/testing-guidelines.md`](docs/testing-guidelines.md) — coding/test conventions and review checklist
- [`docs/upload-flow.md`](docs/upload-flow.md) — end-to-end upload + template-mapping flow
- [`docs/troubleshooting.md`](docs/troubleshooting.md) — known flaky patterns and triage steps
