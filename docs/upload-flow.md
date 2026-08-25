# Upload Flow

This document explains the end-to-end upload path used by submit and validation suites, including built-in failure handling.

## Scope

Primary code paths:

- `Helpers/excel/uploadHelper.ts`
- `pageObjects/OMN_UploadInvoicePage.ts`
- `pageObjects/OMN_DashboardPage.ts`
- `Helpers/excel/submitInvoiceCaseHelper.ts`

## End-to-End Flow

1. **Open upload path**
   - `openUploadPage()` calls shared navigation (`navigateToUpload`).
   - Ensures logged-in state and dashboard entry.
2. **Select business/TIN context**
   - Dashboard opens with optional worker-based TIN selection.
   - If “TIN missing in header” appears, flow re-enters dashboard once.
3. **Open upload dialog**
   - Click `#upload-invoice-btn`.
   - Wait for file input attach.
4. **Ensure template mapping**
   - Read current mapping label.
   - If mismatch, click `Change Mapping`, click **Edit**, select expected template option.
   - Click `Save/Process & Next` once.
   - Click `data-testid="back-arrow"` to return to the upload dialog, then attach the file.
5. **Upload workbook**
   - Set file input with generated workbook path.
   - Register file path for later failure attachment.
6. **Wait for status**
   - Poll for row status (`completed` or `error`).
   - Use upload-row refresh icon between checks.
   - Recover from blank/empty UI by controlled page reload.
7. **Branch by outcome**
   - `completed`: continue to submit/dashboard checks.
   - `error`: read row hint / download error file for validation flows.

## Status Wait Strategy

- Poll interval is short and consistent.
- Refresh click is resilient (normal click -> force click -> DOM click fallback).
- Page-closed state fails fast.
- Blank UI detection avoids waiting the full timeout when page content disappears.

## Template-Mapping Resilience

Mapping wizard fields are disabled until **Edit** is clicked. After template selection (or when the value is already correct), the flow clicks `Save/Process & Next` **once**, then uses the **back arrow** (`data-testid="back-arrow"`) if the upload file input is not yet visible, and asserts mapping label + upload input before `setInputFiles`.

## Submit Flow Hand-off

For submit suites:

- `runSubmitInvoiceCase()` calls `uploadPage.waitForAnyStatus()`.
- If upload row is `error`, test stops with detailed error context.
- If `completed`, flow submits from dashboard and waits for delivery state.

## Failure Signals and Attachments

- Upload failures throw with invoice-aware context.
- `baseTest.afterEach` attaches (failure/timeout only):
  - console log transcript
  - API traffic transcript
  - generated/uploaded workbook
  - Playwright screenshot/report artifacts

## Timeouts and Tuning

- Upload status timeout can be overridden via `UPLOAD_STATUS_TIMEOUT_MS`.
- Submit delivery timeout can be overridden via `SUBMIT_INVOICE_DELIVERY_TIMEOUT_MS`.
- Avoid lowering defaults without confirming backend throughput characteristics.
