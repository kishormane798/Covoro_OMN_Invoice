---
name: add-ui-invoice-test
description: Add Create Invoice UI tests (manual form, not Excel upload). Use when adding UI field validation, min/max, formula, or conditional on Create / Edit / Copy.
---

# Add UI Invoice Test

## When to use

- Testing the Create / Edit / Copy Invoice UI (manual entry), not Excel upload flows
- Field validation, min/max, formulas, or conditional rules on the SPA form

## Project and entry specs

- UI specs run on Playwright project **`chromium-ui`** (see `playwright.config.ts`).
- Specs:
  - Field min/max (no dropdowns) + formula: `OMN_UIInvoice_{Create,Edit,Copy}_Test.spec.ts`
  - Conditional (including dropdown-style; all Excel rows, one test each): `OMN_UIInvoice_Conditional_{Create,Edit,Copy}_Test.spec.ts`

```bash
npm run test:ui
```

## Layer map

| Concern | Location |
|---------|----------|
| Locators & UI actions | `pageObjects/OMN_UIInvoiceManualPage.ts` |
| Flow orchestration | `Helpers/ui/omnUiInvoiceHelper.ts`, `omnUiInvoiceEntryHelper.ts` |
| Binders | `Helpers/ui/omnUiInvoiceSpec.ts` |
| Min/max + mapped conditionals | `testData/ui/omnUiInvoiceValidation.ts` |
| Conditional rules source | `testData/FieldValidations/ConditionalValidation.ts` |

Section persist uses the same **Save** / **Update** `.form-footer` pattern as UAE (Create → Save, Edit/Copy → Update).

## Workflow

### 1. Add scenario data first

- Min/max: `omnUiInvoiceValidation.ts` (Excel length rows). Mark dropdown fields with `dropdown: true` so they are skipped.
- Conditional: map from `ConditionalValidation.ts` into `OMN_UI_CONDITIONAL_SCENARIOS` (dropdown-style rows included; every row is a test in the same Conditional spec).
- Formula: `invoiceFormulaTestData` filtered in `omnUiInvoiceValidation.ts`

### 2. Add or reuse helper function

Specs call `bindOmnUiInvoiceSuite(entry)` / `bindOmnUiConditionalSuite(entry)`.

New UI interaction logic goes in the **page object**, not the spec.

### 3. Spec pattern

```ts
import { bindOmnUiConditionalSuite } from "../../Helpers/ui/omnUiInvoiceSpec";

bindOmnUiConditionalSuite("create");
```

### 4. Test title format

```
Create Invoice UI | {Section} | {field or rule} | {condition} → {outcome}
```

## Checklist

- [ ] Conditional cases come from `ConditionalValidation.ts` (do not invent opposite polarities)
- [ ] Empty/blank UI cases clear the field if it already has a value (Edit/Copy prefill)
- [ ] Whitespace uses real space characters, never Excel `="        "` formulas
- [ ] Dropdown-style Excel rows each get their own test in the same Conditional spec
- [ ] New selectors only in `pageObjects/`
- [ ] Section commit uses Save (create) or Update (edit/copy)
- [ ] Do not modify `Helpers/excel/**` or `utils/excel/**` for UI work
