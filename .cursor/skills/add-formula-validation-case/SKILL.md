---
name: add-formula-validation-case
description: Add formula, min-max, and calculated-totals validation tests. Use when extending formula validation suites for Excel upload or Create Invoice UI formula scenarios.
---

# Add Formula Validation Case

## When to use

- Validating spreadsheet formulas, line totals, document totals, tax calculations
- Min/max numeric boundary tests that use the **formula Excel pipeline**

## Critical distinction

| Pipeline | Function | Use for |
|----------|----------|---------|
| Formula / min-max | `generateInvoiceExcel` | Field & formula validation (camelCase payload) |
| Submit | `generateInvoiceFromSubmitData` | Submit + delivery only |

**Do not use the submit pipeline for formula validation tests.**

Excel formulas do not auto-recalculate in all paths — framework helpers enforce calculated values.

## Key files

| Area | Path |
|------|------|
| Excel upload formula specs | `tests/OMN_FormulaValidation_CovoroTemplate_Test.spec.ts` |
| Helper | `Helpers/formulaValidationHelper.ts` |
| Excel bridge | `utils/invoiceExcel.ts`, `utils/invoice_excel_writer.py` |
| Test data | `testData/FieldValidations/Min_max_field_validation.ts`, formula configs |
| UI formula | `testData/ui/uiInvoiceCreationFormulaValidation.ts` |
| UI helper | `Helpers/uiInvoiceCreationFormulaHelper.ts` |

## Workflow — Excel upload formula test

### 1. Add scenario data

Extend configs in `testData/FieldValidations/` following existing formula/min-max structures.

### 2. Generate workbook via formula pipeline

Use helpers that call `generateInvoiceExcel` (see `formulaValidationHelper.ts` and existing spec loops).

### 3. Upload and assert

Follow patterns in `FormulaValidation_*_Test.spec.ts`:

- Generate file with controlled inputs
- Upload via `uploadHelper` / `uploadAndVerify` or formula-specific helper
- Assert UI outcome or error workbook as required

### 4. Test title

Include field, inputs, and expected calculation outcome:

```
Excel upload · Covoro | Formula | {field} | {inputs} → {outcome}
```

## Workflow — UI formula test

### 1. Add scenario to `uiInvoiceCreationFormulaValidation.ts`

Use `CREATE_INVOICE_FORMULA_SCENARIOS`, `CURRENCY_SUITES`, `isScenarioApplicableForMode` as existing specs do.

### 2. Call UI helper

```ts
await runUiInvoiceCreationFormulaScenario(page, scenario);
```

### 3. Run

```bash
npm run test:ui
npx playwright test tests/KISHOR_UI/OMN_UIInvoiceCreation_Manual_Test.spec.ts --grep "Formula"
```

## Tax / rounding notes

- Effective VAT rate logic lives in `invoiceExcel.ts` — only `Standard rate.` uses sheet rate
- Do not change rounding rules to fix a single test without reviewing impact on submit suite

## Checklist

- [ ] Using `generateInvoiceExcel`, not submit pipeline
- [ ] Scenario data in `testData/FieldValidations/`
- [ ] Totals driven by framework calculation, not manual Excel formulas alone
- [ ] Spec delegates to `formulaValidationHelper` or UI formula helper
- [ ] Targeted run passes (`test:covoro` or `test:ui`)
