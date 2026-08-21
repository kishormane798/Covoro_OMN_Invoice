---
name: generate-excel-from-testcase
description: >-
  Generate invoice Excel workbooks from a test or testcase using the correct
  pipeline (formula camelCase, field patch, or submit header-key rows). Use when
  the user asks to generate Excel from a test case, wire workbook creation into a
  helper/spec, choose generateInvoiceExcel vs generateInvoiceFromSubmitData, or
  produce .xlsx under testData/generated/excel.
---

# Generate Excel from Test / Testcase

## When to use

- Produce a workbook from an existing or new testcase payload
- Decide which generator API a helper/spec should call
- Debug “wrong columns / totals overwritten / thin template” generation issues

**Not for:** UI Create Invoice (no Excel) — use `add-ui-invoice-test`. Full new validation/submit scenarios — use the matching `add-*-case` skill after generation is clear.

## Step 0 — Choose pipeline

```
What is the test asserting?
├─ Formula / line & doc totals / camelCase numeric inputs
│    → generateInvoiceExcel (+ formulaValidationHelper)
├─ Single field length / empty / min-max on one column
│    → updateExcelField / updateExcelFieldWithInvoice
├─ Submit, delivery, or PINT-OM conditional upload (full row)
│    → generateInvoiceFromSubmitData
├─ Multi-line invoice (array of rows)
│    → generateInvoiceFromSubmitRows
└─ Many invoices, same line data
     → generateBulkSingleItemSubmitInvoices
```

**Never** pass submit header-key rows into `generateInvoiceExcel`, or camelCase formula payloads into `generateInvoiceFromSubmitData`.

## Step 1 — Locate or author the testcase data

| Pipeline | Typical data location | Shape |
|----------|----------------------|--------|
| Formula | `testData/FieldValidations/Min_max_field_validation.ts` (`defaultInvoiceData`) + scenario overlays | camelCase |
| Field patch | `testData/FieldValidations/*` configs with `field` = Excel header | header + value/length |
| Submit | `testData/FieldValidations/SubmitInvoice.ts` (etc.) | Excel header keys |
| Conditional | builders in `Helpers/conditionalValidationHelper.ts` + configs | header keys after prepare |

For authoring a new row/payload, also load `author-excel-testcase-data`.

## Step 2 — Generate in the helper (not the spec)

Prefer an existing helper entry point:

```ts
// Formula
import { generateInvoiceExcel } from "../utils/invoiceExcel";
import { defaultInvoiceData } from "../testData/FieldValidations/Min_max_field_validation";

const payload = { ...defaultInvoiceData, ...fields };
const { filePath, invoiceNumber } = await generateInvoiceExcel(payload);
```

```ts
// Field length
const filePath = await updateExcelField("Invoice Number", config.min);
// or need the stamped invoice #:
const { filePath, invoiceNumber } = await updateExcelFieldWithInvoice(field, length);
```

```ts
// Submit / conditional (header keys)
const { filePath, invoiceNumber } = await generateInvoiceFromSubmitData(row);
```

```ts
// Multi-item
const { filePath, invoiceNumber } = await generateInvoiceFromSubmitRows(rows);
```

Register path via returned `filePath`; generators push to `generatedFiles` for `baseTest` cleanup.

## Step 3 — Template & output constraints

- Template: `testData/uploads/template.xlsx` (override: `INVOICE_TEMPLATE_PATH`)
- Output: `testData/generated/excel/pw-<index>/` (override: `INVOICE_EXCEL_OUTPUT_DIR`)
- Invoice #: `buildUniqueSubmitInvoiceNumber()` only — no hardcoded colliding numbers
- Formula suite: confirm `templateSupportsGenerateInvoiceExcel(headers)` before positives on thin templates
- Submit: filter unknown headers with `filterSubmitRowToTemplateHeaders` / existing prepare helpers

## Step 4 — Tax & totals (do not reinvent)

- Only **Standard rate** (and mapped variants) use sheet Tax Rate for effective VAT; other categories → 0% in calcs
- Submit write path recalculates totals after Python write (`applyInvoiceCalculationsToFile`)
- Exempt-from-tax blanks tax fields via `applyExemptFromTaxBlankTaxFields`

## Step 5 — Verify generation (optional smoke)

Standalone script pattern (already used in repo):

```bash
npx ts-node scripts/generate_valid_oman_invoice.ts
```

Or run the single Playwright case that uploads the generated file:

```bash
npx playwright test path/to/Spec.spec.ts --grep "title fragment"
```

## Checklist

- [ ] Correct API for the assertion type
- [ ] Payload shape matches API (camelCase vs Excel headers)
- [ ] Spec stays thin — generation inside helper
- [ ] Path under worker-isolated generated dir
- [ ] No manual totals fighting submit recalculation
- [ ] Field/header strings match template row 4

## Related

- Payload/header authoring: [../author-excel-testcase-data/SKILL.md](../author-excel-testcase-data/SKILL.md)
- Pipeline details: [reference.md](reference.md)
- Scenario skills: `add-formula-validation-case`, `add-field-validation-case`, `add-submit-test-case`, `add-conditional-validation-case`
