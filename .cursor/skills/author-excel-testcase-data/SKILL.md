---
name: author-excel-testcase-data
description: >-
  Author or extend Excel testcase payloads and rows (camelCase formula data vs
  Excel header-key submit rows) in testData and kishorsubmit datasets. Use when
  adding invoice row data for workbook generation, mapping fields to template
  headers, or fixing wrong key shape before generateInvoiceExcel /
  generateInvoiceFromSubmitData.
---

# Author Excel Testcase Data

## When to use

- New or edited dataset row used to **generate** an invoice `.xlsx`
- Fixing wrong keys (camelCase vs `"Invoice Type Code"` headers)
- Aligning field names with template headers / `INVOICE_EXCEL_FIELD_TO_HEADER`

After the data exists, use `generate-excel-from-testcase` to wire the generator. For a full scenario (upload assert, delivery, UI), continue with the matching `add-*-case` skill.

## Decision: which shape?

| Downstream API | Key style | Example keys |
|----------------|-----------|--------------|
| `generateInvoiceExcel` | camelCase | `taxCategory`, `itemGrossPrice`, `invoicedQty` |
| `generateInvoiceFromSubmitData` / `FromSubmitRows` | Exact Excel headers | `"Tax Category"`, `"Item gross price"` |
| `updateExcelField*` | One Excel header string | `"Invoice Number"` |

Copy an existing row in the same file — do not invent header wording. Confirm against template row 4 or `getCachedInvoiceTemplateHeaders()`.

## Formula / min-max payload (camelCase)

Base: `defaultInvoiceData` in `testData/FieldValidations/Min_max_field_validation.ts`.

```ts
const fields = {
  taxCategory: "Standard rate",
  itemGrossPrice: 1000,
  invoicedQty: 1.65,
  // overlay only what the scenario changes
};
const payload = { ...defaultInvoiceData, ...fields };
```

Map to headers inside `generateInvoiceExcel` via `INVOICE_EXCEL_FIELD_TO_HEADER`. Prefer logical camelCase keys in tests; do not duplicate raw header strings unless patching cells post-generate (`patchInvoiceDataCellInFile`).

## Submit / conditional row (Excel headers)

Place rows next to peers:

- Single-item: `tests/kishorsubmit/testData/SubmitInvoice.ts` (`invoiceData`)
- Multi-item: `SubmitInvoiceMultiItem.ts` / `multiItemInvoiceCases` (array of rows per case)
- Field validation configs: `testData/FieldValidations/` with `field` = header text

Minimal shape (extend from a full existing row — do not ship a sparse invent):

```ts
{
  "Invoice Type Code": "Commercial Invoice",
  "Invoice Transaction Type Code": "Standard Tax Invoice",
  "Invoice Currency Code": "OMR", // or suite currency
  "Tax Category": "Standard rate.",
  "Tax Rate": 5,
  // … remainder copied from nearest valid peer row
}
```

Rules:

- **Do not** set calculated total columns expecting them to stick — submit generation recalculates.
- Tax: non–standard-rate categories → effective 0%; leave rate handling to `applySubmitTaxCategoryAndRateRules` / generator.
- Prefer unique business fields per case; invoice number is stamped at generate time.

## Field-validation config

```ts
{
  field: "Invoice Number", // must match Errors column / template header
  min: 1,
  max: 64,
  // …
}
```

Used with `updateExcelField(config.field, config.min)` — not with camelCase payloads.

## Checklist

- [ ] Shape matches the generator the helper will call
- [ ] Headers match template (no typos / UAE-only leftover labels unless still on sheet)
- [ ] Copied from nearest valid peer, then changed scenario fields only
- [ ] No hardcoded colliding `Invoice Number`
- [ ] Data lives in `testData/` or `tests/**/testData/`, not inline mega-objects in the spec

## Related

- Generate workbook: [../generate-excel-from-testcase/SKILL.md](../generate-excel-from-testcase/SKILL.md)
- Header map: `tests/kishorsubmit/testData/submitInvoiceExcelHeaderMap.ts`
