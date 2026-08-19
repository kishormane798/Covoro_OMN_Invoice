---
name: debug-failing-uae-test
description: Investigate flaky or failed UAE E-Invoice Playwright tests. Use when tests timeout, skip for site unavailable, show blank UI, upload status stuck, template mapping fails, or Python/Excel errors occur.
---

# Debug Failing UAE E-Invoice Test

## When to use

- Test failure, timeout, or flake
- Site unavailable skip
- Blank page, upload status never completes, delivery never reached
- Python / Excel generation errors

## Step 1 — Inspect failure artifacts

On failure, `Src/baseTest.ts` attaches:

| Attachment | Purpose |
|------------|---------|
| `console-log.txt` | Browser console errors |
| `api-traffic.txt` | Failed fetch/xhr around failure |
| Screenshot | UI state at failure |
| `.xlsx` | Generated/uploaded workbook when available |

Open HTML report with `npm run report` so attachment links resolve.

## Step 2 — Match symptom to fix area

Consult `docs/troubleshooting.md`. Common patterns:

### Blank page on correct URL

- Framework: blank-screen checks + reload in Dashboard/Upload flows
- Check console for render errors; api-traffic for failed API calls
- Do not increase timeout until slowness is confirmed

### Template mapping / upload input missing

- Flow: Edit → select template → Save/Process & Next → back arrow (`data-testid="back-arrow"`)
- Fix locators/recovery in `pageObjects/OMN_UploadInvoicePage.ts`, not sleeps in spec

### Upload status never `completed` / `error`

- Poll uses refresh icon; blank-UI recovery in wait loop
- Verify row selectors in `UploadInvoicePage`
- Check api-traffic for upload/parse endpoints
- **Observed `error` but test needed `completed`:** do not patch waits or helpers. Use `debug-error-file-status` — download the error file, print all Errors-column records (`printErrorWorkbookMessages` / `error_excel_reader.py list_comments`), and propose a solution with **no code changes**.

### TIN missing in header

- Dashboard re-entry in upload flow
- Worker TIN slot: `Helpers/parallelWorkerSubmitIdentity.ts`

### Site unavailable / tests skipped

- Markers: `site-unavailable.json`, `site-unavailable-w*.json`
- Fix `BASE_URL`/network, then `npm run clean` or delete markers

### Stale login

- Delete `storageState.json`, rerun tests (global setup re-authenticates)

### Python / Excel errors

```bash
pip install -r requirements.txt
```

- Run from repo root; Windows: `pythonRunner.ts` tries `py` and `python`
- Verify `INVOICE_TEMPLATE_PATH` points at the expected workbook (default `template.xlsx`)

## Step 3 — Fix in the right layer

| Symptom | Fix layer |
|---------|-----------|
| Selector / wait / refresh | `pageObjects/` |
| Flow orchestration | `Helpers/` |
| Wrong totals / tax / headers | `utils/invoiceExcel.ts` (+ Python) |
| Wrong test data | `testData/` |
| Attachments / worker cleanup | `Src/baseTest.ts` (careful) |

## Step 4 — Re-run targeted

```bash
npx playwright test <spec> --grep "fragment" --project=chromium
# UI:
npx playwright test tests/KISHOR_UI/OMN_UIInvoiceCreation_Manual_Test.spec.ts --project=chromium-ui --grep "fragment"
```

Use `--headed` or `--debug` for local reproduction.

## Anti-patterns

- Adding unbounded `waitForTimeout` in specs
- Increasing delivery/upload timeout without evidence of backend delay
- Fixing flakes by disabling parallel workers without root cause
- Changing tax/recalculation logic to make one test pass

## Checklist

- [ ] Read console + api attachments
- [ ] Identified layer (PO / helper / utils / data)
- [ ] Bounded retry with clear error if recovery exhausted
- [ ] Targeted grep run passes
- [ ] No unrelated spec changes
