# Design: Single-line invoice Excel round-trip (upload → Ready to Submit → download compare)

**Date:** 2026-08-21  
**Status:** Approved (flow, compare rules, file split)

## Goal

After every **positive** Excel upload that already expects file status **completed**, if the workbook is **single-line**, continue in the same test:

1. Open the e-invoice list.
2. Wait until that invoice’s **row status** is **Ready to Submit**.
3. Click the **invoice number** on that row (select the row; do not open View).
4. **Options → Download → Excel**.
5. Assert every **non-empty** uploaded column is present in the downloaded file with the same value.

If a filled upload column is missing or does not match, **fail the test** and list those columns (uploaded vs downloaded).

## Non-goals

- Multi-line / two-item workbooks (skip round-trip; existing completed assert still runs)
- Error-file / negative cases
- Waiting for **Delivered** (out of scope)
- Download formats other than Excel (JSON / PDF / XML)
- Submit / delivery flow
- New Playwright specs or extra cases in formula / conditional / field loops
- Opening **Options → View** (would leave the list; Download locators stay on the list row)

## Why this is needed

Upload **completed** only proves the file was accepted. It does not prove the invoice stored in the product still holds the cells we wrote. Options → Download → Excel already exists on the dashboard; there is no column-by-column compare of downloaded vs uploaded workbooks.

## Trigger

Hook after `uploadAndVerify` succeeds (`Helpers/excel/uploadHelper.ts`).

`uploadAndVerify` already waits for upload-file **completed**. Then:

1. Read the uploaded `.xlsx` using the same template layout as generation (headers on template header row; first invoice data row = existing `INVOICE_TEMPLATE_DATA_ROW`).
2. Count data rows that have an invoice number (or any non-empty cell).
3. **If more than one data row → return.** Do not download or compare.
4. Otherwise run the round-trip helper with `filePath` and the invoice number read from the file.

Formula, conditional, and field **completed** single-line cases all call `uploadAndVerify`, so they pick this up without spec changes. Error paths use `uploadAndVerifyError` / `uploadAndVerifyStatus(..., 'error')` and are unchanged.

## UI flow

1. Close or leave the upload UI and open the e-invoice list (`DashboardPage.openDashboard`, same worker TIN mapping as other helpers).
2. Search / locate the row for that invoice number (`waitForInvoiceRowVisible` / existing row locators).
3. Poll with `waitForInvoiceReadyToSubmitStatus` (default 2 minutes). Row labels **Ready to Submit** and **Completed** are treated as the same (existing helper). **Error** / **Submission Error** fail immediately with invoice number and actual status.
4. Click the **invoice number** cell on that list row (new page-object method). Do **not** use Options → View.
5. **Options → Download → Excel** using existing `openInvoiceDownloadSubmenuOnRow` + `clickDownloadFormatInSubmenu` (`INVOICE_DOWNLOAD_FORMAT_LABEL.excel`).
6. Persist the downloaded buffer to a worker-isolated path under `testData/generated/excel/pw-<index>/` (or `test-results/` if the dashboard download helper already saves there). Register for `baseTest` cleanup the same way other generated files are.

If the row never reaches Ready to Submit, or the Excel download never starts, **fail on that step**. Do not skip compare silently.

## Compare rules

Source of truth: the **uploaded** single data row.

For each column whose uploaded cell is non-empty after trim:

| Situation | Result |
|---|---|
| Downloaded file has no matching header | Fail that column (`column not found`) |
| Header exists, downloaded cell empty | Fail (`uploaded "<value>", downloaded empty`) |
| Both have values | Must match after normalize (below) |

- Empty uploaded cells are **not** checked.
- Columns that exist only in the download are **ignored**.
- Header match: trim + case-insensitive (spacing collapsed to single spaces). Cell **values** stay **case-sensitive** after trim.

### Normalize before equality

- **Dates:** parse to calendar day (`YYYY-MM-DD`). Excel serial dates, `YYYY-MM-DD`, `DD/MM/YYYY`, and `DD-MM-YYYY` that represent the same day **match**. Time-of-day is ignored.
- **Numbers:** parse as numbers; `100` equals `100.00`. Non-numeric text is not forced through this path.
- **Text:** trim leading/trailing whitespace; compare exactly.

A column is a date if the header name contains `date` (case-insensitive) **or** both sides parse as dates. A column is numeric if both sides parse as finite numbers and it is not classified as a date.

## Failure message

One assertion listing every failing column, for example:

```
Downloaded Excel missing or mismatch for invoice INV-…:
- "Buyer Name": uploaded "ACME", downloaded empty
- "Tax Rate": column not found
```

Do not fail on the first column only; report **all** mismatches in that message.

## Components

| Layer | Path | Responsibility |
|---|---|---|
| Upload hook | `Helpers/excel/uploadHelper.ts` | After completed, if single-line, call round-trip |
| Orchestration | `Helpers/excel/invoiceExcelRoundTripHelper.ts` (new) | Dashboard wait, click invoice number, download, compare |
| Page object | `pageObjects/OMN_DashboardPage.ts` | Click invoice number on row; reuse Download Excel |
| Excel I/O | `utils/` (extend existing Python/TS bridge; no second generator) | Read header+row from upload and download; compare map |

Specs stay thin. Locators stay in the page object. Compare logic stays out of specs.

## Constraints

- Parallel-safe: identify the row by the **generated** invoice number from the uploaded file; do not hardcode invoice numbers.
- Layer rules: no raw selectors in helpers/specs for the new click; add locator in `OMN_DashboardPage` after snapshot/MCP confirmation at implementation time.
- Incremental edits: implement one agreed file per agent turn unless a batch is approved.
- Do not run Playwright until the user says **run**.

## Success criteria

- A completed **single-line** upload whose downloaded Excel is missing a filled upload column fails with that column named.
- The same upload with all filled columns present (dates allowed to differ in format) passes.
- A **two-line** completed upload does not download or compare.
- An **error** upload does not enter this path.
