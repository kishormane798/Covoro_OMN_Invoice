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
| Specs (describe, loops, titles) | `tests/KISHOR_UI/OMN_UIInvoice_*_Test.spec.ts` |
| Min/max + mapped conditionals | `testData/ui/omnUiInvoiceValidation.ts` |
| Conditional rules source | `testData/FieldValidations/ConditionalValidation.ts` |

Section persist uses the same **Save** / **Update** `.form-footer` pattern as UAE (Create → Save, Edit/Copy → Update).

## Workflow

### 1. Add scenario data first

- Min/max: `omnUiInvoiceValidation.ts` (Excel length rows). Mark dropdown fields with `dropdown: true` so they are skipped.
- Conditional: map from `ConditionalValidation.ts` into `OMN_UI_CONDITIONAL_SCENARIOS` (dropdown-style rows included; every row is a test in the same Conditional spec).
- Formula: `invoiceFormulaTestData` filtered in `omnUiInvoiceValidation.ts`

### 2. Add or reuse helper function

New UI interaction logic goes in the **page object**, not the spec. Specs call `runOmnUiMinMaxCase` / `runOmnUiConditionalScenario` / `runOmnUiFormulaScenario`.

### 3. Spec pattern

Same shape as Covoro Excel specs: `test.describe` + data loop + `test(\`title\`, …)` in the spec file.

```ts
import { test } from "../../Src/baseTest";
import { runOmnUiConditionalScenario } from "../../Helpers/ui/omnUiInvoiceHelper";
import {
  OMN_UI_SECTION_ORDER,
  omnUiConditionalDisplayTitle,
  omnUiConditionalScenariosFor,
} from "../../testData/ui/omnUiInvoiceValidation";

const ENTRY = "create" as const;

test.describe("Create Invoice UI — conditional", () => {
  test.describe.configure({ mode: "parallel" });
  for (const section of OMN_UI_SECTION_ORDER) {
    test.describe(`Create Invoice UI — ${section} conditional`, () => {
      for (const scenario of omnUiConditionalScenariosFor(ENTRY, section)) {
        test(omnUiConditionalDisplayTitle(ENTRY, scenario.title), async ({ page }, testInfo) => {
          await runOmnUiConditionalScenario(page, ENTRY, scenario, testInfo.testId);
        });
      }
    });
  }
});
```

### 4. Test title format

REQUIRED SUB-SKILL: `improve-testcase-title`. Write the title as a template string **in the spec** (Covoro style). Do not prefix `Create Invoice UI |`. Do not add a `uiTestTitle` helper.

Field: `{What we entered} — Save should succeed. ({Field})` (Edit/Copy: Update). Errors: `the form should show an error`.
Conditional: keep Excel `title` in `ConditionalValidation.ts`; UI spec uses `omnUiConditionalDisplayTitle` so uploaded becomes form saved/updated.

## Checklist

- [ ] Conditional cases come from `ConditionalValidation.ts` (do not invent opposite polarities)
- [ ] Empty/blank UI cases clear the field if it already has a value (Edit/Copy prefill)
- [ ] Whitespace uses real space characters, never Excel `="        "` formulas
- [ ] Dropdown-style Excel rows each get their own test in the same Conditional spec
- [ ] New selectors only in `pageObjects/`
- [ ] Section commit uses Save (create) or Update (edit/copy)
- [ ] Do not modify `Helpers/excel/**` or `utils/excel/**` for UI work
