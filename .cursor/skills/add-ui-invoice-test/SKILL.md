---
name: add-ui-invoice-test
description: Add Create Invoice UI tests (manual form, not Excel upload). Use when adding UI field validation, min/max, dropdowns, formula, conditional, or master buyer/item scenarios.
---

# Add UI Invoice Test

## When to use

- Testing the Create Invoice UI (manual entry), not Excel upload flows
- Field validation, min/max, dropdowns, formulas, conditional rules on the SPA form

## Project and entry specs

- UI specs run on Playwright project **`chromium-ui`** (see `playwright.config.ts`).
- Main specs:
  - `tests/KISHOR_UI/OMN_UIInvoiceCreation_Manual_Test.spec.ts`
  - `tests/KISHOR_UI/OMN_UIMaster_BuyerAndItem_Test.spec.ts`
  - `tests/KISHOR_UI/OMN_UISubmitInvoice_Test.spec.ts`, `OMN_UISubmitInvoice_MultiItem_Test.spec.ts`

```bash
npm run test:ui
npm run test:ui:submit
```

## Layer map

| Concern | Location |
|---------|----------|
| Locators & UI actions | `pageObjects/OMN_UIInvoiceCreationManualPage.ts`, `UIMasterBuyerAndItemPage.ts` |
| Flow orchestration | `Helpers/ui*Helper.ts` (e.g. `uiMinMaxHelper`, `uiDropdownHelper`, `uiInvoiceCreationConditionalHelper`) |
| Scenarios & rules | `testData/ui/uiInvoiceCreation*.ts`, `uiMaster*.ts` |
| MUI autocomplete | `Helpers/uiMuiAutocompleteHelper.ts` |
| Submit from UI | `Helpers/uiSubmitInvoiceHelper.ts` |

## Workflow

### 1. Add scenario data first

Put configs in the appropriate `testData/ui/ui*` file:

- Min/max: `uiInvoiceCreationConfig.ts`, `uiMasterFieldMinMax.ts`
- Conditional: `uiInvoiceCreationConditionalValidation.ts`
- Formula: `uiInvoiceCreationFormulaValidation.ts`
- Dropdowns: `uiInvoiceCreationDropdowns.ts`

### 2. Add or reuse helper function

Specs should call one helper, e.g.:

- `runUiInvoiceCreationMinMaxCase`
- `runUiInvoiceCreationConditionalScenario`
- `runUiInvoiceCreationFormulaScenario`
- `runUiInvoiceCreationBuyerDropdownsSaveCase`

New UI interaction logic goes in **Page Object**, not spec.

### 3. Spec pattern

```ts
import { test } from "../Src/baseTest";
import { UIInvoiceCreationManualPage } from "../pageObjects/OMN_UIInvoiceCreationManualPage";

test.describe("Create Invoice UI — ...", () => {
  test.describe.configure({
    mode: "parallel",
    timeout: UI_INVOICE_CREATION_TEST_TIMEOUT_MS,
  });

  test("Create Invoice UI | Section | condition → outcome", async ({ page }) => {
    await runUiInvoiceCreationMinMaxCase(page, rule, variant);
  });
});
```

### 4. Test title format

```
Create Invoice UI | {Section/Area} | {field or rule} | {condition} → {outcome}
```

### 5. Large page object

`UIInvoiceCreationManualPage.ts` is large — add methods there for new locators; keep specs and helpers thin.

## Checklist

- [ ] Scenario data in `testData/FieldValidations/`
- [ ] New selectors only in `pageObjects/`
- [ ] Describe uses `UI_INVOICE_CREATION_TEST_TIMEOUT_MS` where needed
- [ ] MUI fields use existing autocomplete helpers
- [ ] Run `npm run test:ui` or grep single test
