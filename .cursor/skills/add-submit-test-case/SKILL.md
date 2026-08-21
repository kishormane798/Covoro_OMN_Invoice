---
name: add-submit-test-case
description: Add or extend submit and delivery test cases for Covoro/OMN templates. Use when adding submit tests, multi-item submit cases, delivery polling scenarios, or extending SubmitInvoice datasets.
---

# Add Submit Test Case

## When to use

- Adding a new submit + delivery scenario (single or multi-item)
- Extending `testData/FieldValidations/SubmitInvoice.ts`, `SubmitInvoiceMultiItem.ts`, or related datasets
- Covoro / OMN primary template submit flows

## Prerequisites

- Read `Helpers/submitInvoiceCaseHelper.ts` and the target spec (e.g. `tests/OMN_SubmitInvoice_CovoroTemplate_Test.spec.ts`).
- Confirm template: Covoro/OMN primary (`template.xlsx`).

## Workflow

### 1. Choose the spec and dataset

| Template | Spec example | Dataset |
|----------|--------------|---------|
| Covoro | `tests/OMN_SubmitInvoice_CovoroTemplate_Test.spec.ts` | `testData/FieldValidations/SubmitInvoice.ts` |
| Multi-item | `tests/OMN_SubmitInvoice_MultiItem_CovoroTemplate_Test.spec.ts` | `SubmitInvoiceMultiItem.ts` / `multiItemInvoiceCases` |

### 2. Add test data using Excel header keys

Submit rows must use Excel column names, not camelCase:

- `Invoice Type Code`, `Invoice Transaction Type Code`, `Invoice Currency Code`
- `Tax Category`, `Tax Rate`
- Item and document fields as defined in existing rows

**Do not manually set calculated totals** — `generateInvoiceFromSubmitData` recalculates them.

### 3. Single-item case

Spec pattern:

```ts
import { test } from "../Src/baseTest";
import { invoiceData } from "../testData/FieldValidations/SubmitInvoice";
import { runSubmitInvoiceCase } from "../Helpers/submitInvoiceCaseHelper";

test("Excel upload · Covoro | Submit | ... → delivered", async ({ page }) => {
  await runSubmitInvoiceCase(page, row);
});
```

Tax rules are applied in the helper via `applySubmitTaxCategoryAndRateRules` — do not rewrite `Tax Rate` for non-standard categories except where helper already clears it (outside-scope).

### 4. Multi-item case

Each case is an **array of rows**. Spec calls:

```ts
await runSubmitInvoiceMultiItemCase(page, tc.rows);
```

Totals are computed across lines in `generateInvoiceFromSubmitRows`.

### 5. Upload-only sanity (no delivery wait)

Use `runSubmitInvoiceUploadSanityCase` when asserting upload `completed` only.

### 6. Run and verify

```bash
npm run test:covoro
# single case:
npx playwright test tests/OMN_SubmitInvoice_CovoroTemplate_Test.spec.ts --grep "your title fragment"
```

Delivery timeout: `SUBMIT_INVOICE_DELIVERY_TIMEOUT_MS` (default 2–4 min).

## Checklist

- [ ] Row uses Excel header keys consistent with template
- [ ] No manual total overrides that fight recalculation
- [ ] Test title includes type code, currency, tax dimensions
- [ ] Spec stays thin — logic in `Helpers/submitInvoiceCaseHelper.ts`
- [ ] Parallel-safe invoice numbers (no hardcoded collisions)
- [ ] Targeted npm script or grep run passes
