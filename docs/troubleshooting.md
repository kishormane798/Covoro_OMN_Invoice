# Troubleshooting Guide

This guide lists common flaky or failing patterns seen in this framework and how to diagnose them quickly.

## 1) Same URL, but page appears blank

### Symptom

- Browser remains on expected URL.
- No usable UI elements are present.
- Manual refresh restores the UI.

### Current framework handling

- Dashboard and upload flows include blank-screen checks and recovery reload/navigation.
- Upload status wait includes blank-UI detection and controlled reload attempts.

### If still failing

- Inspect attached `console-log.txt` for rendering/runtime errors.
- Inspect `api-traffic.txt` for failed fetch/xhr around the blank period.
- Increase timeout only after verifying backend slowness is the true issue.

## 2) Template changed, but not returned to upload screen

### Symptom

- Mapping selection appears applied.
- After second `Save/Process & Next`, upload input is still missing.

### Current framework handling

- Performs a third retry click when upload input is not visible after second click.
- Asserts both final mapping label and upload input visibility before proceeding.

### If still failing

- Verify button text variant did not change beyond current selector pattern.
- Confirm modal/dialog state in screenshot attachments.

## 3) Upload row status never reaches completed/error

### Symptom

- Test times out while polling row status.

### Current framework handling

- Poll loop with refresh-icon retries.
- Blank-page recovery within wait loop.

### If still failing

- Confirm row selector still matches current UI markup.
- Check whether upload row is created under a different container.
- Review `api-traffic.txt` for upload/parse endpoints returning non-200.

## 4) “TIN missing in header” after dashboard navigation

### Symptom

- Upload flow cannot proceed because app context is incomplete.

### Current framework handling

- Re-enters business dashboard and opens dashboard path again.

### If still failing

- Validate selected business card/TIN is visible and clickable.
- Enable `UAE_EINVOICE_DEBUG_DASHBOARD=1` and inspect logs.

## 5) Submit never reaches Delivered / Delivered to C3/C5

### Symptom

- Submit action works, but delivery status stays in intermediate states or times out.

### Current framework handling

- Polls dashboard status with refresh cycles.
- Fails explicitly on `Submission error`.

### If still failing

- Check whether backend statuses changed naming (normalization mismatch).
- Increase `SUBMIT_INVOICE_DELIVERY_TIMEOUT_MS` for heavy environments.
- Verify invoice exists and is searchable in table after refresh.

## 6) Excel file issues (missing columns, wrong totals, reader errors)

### Symptom

- Python writer errors, missing header warnings, validation mismatches.

### Checks

- Ensure Python dependencies are installed (`requirements.txt`).
- Confirm template file path (`INVOICE_TEMPLATE_PATH`) points to expected workbook.
- Verify header names exactly match template row-4 columns.
- Confirm calculation paths are aligned with Python `apply_calculations`.

## 7) Parallel run collisions (ENOENT, wrong file attached, random deletes)

### Symptom

- One worker cannot find workbook generated moments earlier.

### Current framework handling

- Per-worker generated output directories.
- Cleanup routines skip reserved template files.

### If still failing

- Verify `TEST_PARALLEL_INDEX` is present per worker.
- Confirm no new helper writes output outside `getGeneratedInvoiceExcelDir()`.

## 8) Login/session instability

### Symptom

- Unexpected redirect to login or intermittent auth failures.

### Checks

- Confirm `.env` credentials are valid.
- Remove stale `storageState.json` **and** `sessionStorage.json`, then re-run so global setup logs in again.
- CI logs should include `[global-setup] saved sessionStorage (persist:root, …)`. If persist:root is missing, field-validation uploads start logged out.
- Ensure `BASE_URL` is normalized (no quotes/trailing slash issues).

## Quick Triage Order

1. Review `console-log.txt` (failed tests only).
2. Review `api-traffic.txt` (failed tests only).
3. Review attached workbook(s) and screenshot.
4. Confirm selector assumptions in relevant Page Object.
5. Confirm timeout and retry thresholds are appropriate.
6. Confirm environment variables and template path.
