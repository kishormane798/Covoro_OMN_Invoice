---
name: debug-error-file-status
description: Use when an uploaded invoice file status is error but completed was expected, Upload status mismatch expected completed observed error, error workbook, Errors column, download error file, printErrorWorkbookMessages, [ErrorValidation] lines, or the user asks why a file failed instead of completing.
---

# Debug Error File Status (analysis only)

**Hard gate:** status is `error` but `completed` was required. Download the error workbook, print **all** Errors-column records the same way `printErrorWorkbookMessages` does, then give a solution. **Do not change code, specs, helpers, page objects, or utils.**

If status is stuck (neither `completed` nor `error`), timeout, blank UI, or site skip → use `debug-failing-uae-test` instead.

## Workflow

1. Confirm the mismatch: expected `completed`, observed `error` (UI row or `Upload status mismatch: expected "completed" but observed "error"`).
2. Get the error `.xlsx` (do not guess from the uploaded source file):
   - Playwright/Allure attachment, or `test-results/error-*.xlsx`
   - Console already has `[ErrorValidation] …` lines → use those; still list every line
   - Else download: `#download-error-file` / `downloadErrorFileViaClick()` after `waitForErrorFileDownloadEnabled()`
3. Print **every** error record (same as `Helpers/uploadHelper.ts` `uploadAndVerifyError` and `Helpers/fieldValidationHelper.ts` `verifyErrorFile`):

```bash
python utils/error_excel_reader.py list_comments "<errorFilePath>" 6
```

Sheet is `E Invoice`. Data starts at row **6**. For 2+ line items, also run rows `7`, `8`, … until `errors_column` is empty.

4. Read JSON: each `fields[].field` + `fields[].comment`. If `fields` is empty, report the raw `errors_column` text. Cover **all** fields, not the first one.
5. Map each record to a cause, then propose a **data / payload / expectation** fix. Stop. No patches.

## Output (required shape)

```markdown
## Observed
Status: error (expected completed)
Error file: <path or "console [ErrorValidation] lines">

## Error records
- <Field>: <comment>
- …

## Root cause
- <Field>: <why this blocked completed>

## Solution (do not apply in code)
- <what to change in the uploaded row / Excel values / expected outcome>
```

## Map errors to solutions

| Error shape | Typical cause | Solution to propose |
|-------------|----------------|---------------------|
| Empty / below min / above max | Mandatory or length rule | Fill, shorten, or drop the value |
| Invalid dropdown / scheme | Value not in allowed list | Use a template-allowed option |
| TIN / seller mismatch | Must match logged-in worker TIN | Align seller TIN with worker identity |
| Calculated / VAT / totals mismatch | Formula vs sheet value | Recalculate or stop forcing the cell |
| `ALIGNED-IBRP-*-OM` / `IBR-*-OM` | If-then conditional | Satisfy or avoid the triggering combination |
| Duplicate invoice number | Collision across workers | Unique invoice number |

## Rationalizations

| Excuse | Reality |
|--------|---------|
| "I'll just fix waitForStatus / timeout" | Status already resolved to error. Read the error file. |
| "I'll patch the helper so completed is accepted" | That hides the business error. |
| "First error is enough" | Print every Errors-column field, same as `printErrorWorkbookMessages`. |
| "I know the field from the spec name" | Spec name can be wrong; the error file is source of truth. |
| "Quick locator/data edit while I'm here" | Forbidden in this skill. Describe the solution only. |

## Red flags — STOP

- Editing `pageObjects/`, `Helpers/`, `utils/`, `tests/`, or `testData/`
- Increasing `UPLOAD_STATUS_TIMEOUT_MS`
- Treating the **uploaded** workbook as the error file
- Stopping after one field when `errors_column` lists several

User later says **apply the fix** → then use the matching authoring skill (`add-field-validation-case`, `add-formula-validation-case`, `author-excel-testcase-data`, …).
