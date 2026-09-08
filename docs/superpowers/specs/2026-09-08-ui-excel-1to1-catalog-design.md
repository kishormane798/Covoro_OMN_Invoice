# Design: Oman UI 1:1 catalog from Excel field, formula, and conditional

**Date:** 2026-09-08  
**Status:** Approved  

**Parents:**

- `docs/superpowers/specs/2026-09-02-omn-ui-create-edit-copy-design.md`
- `docs/superpowers/specs/2026-09-04-omn-ui-testcase-title-design.md`
- `docs/superpowers/specs/2026-08-20-improve-testcase-title-design.md`

**Excel sources (Covoro only, not Simplified):**

- `tests/OMN_FieldValidation_CovoroTemplate_Test.spec.ts`
- `tests/OMN_FormulaValidation_CovoroTemplate_Test.spec.ts`
- `tests/OMN_ConditionalValidation_CovoroTemplate_Test.spec.ts`

## Goal

Every active Excel field, formula, and conditional row appears in the Oman Create / Edit / Copy UI suite. The tester reads the same business case as Excel. The form **selects or types**; it never uploads a workbook. Rows the form cannot drive are still listed in Allure as skipped tests with a named reason.

## Non-negotiables

1. Excel data files remain the source of truth. UI does not invent extra rows or opposite polarities.
2. UI actions are `selectAutocomplete` / `replaceInput` / date pickers only. No Excel generate/upload in these six specs.
3. Create uses **Save**. Edit and Copy use **Update**.
4. Specs stay thin data loops. No `uiTestTitle` helper.
5. Do not modify `Helpers/excel/**`, `utils/excel/**`, or the Excel specs.
6. `tests/KISHOR_UI/OMN_UIInvoice_Attachment_Test.spec.ts` is out of scope.
7. Commented-out Excel `describe` blocks (txn mutual-exclusion) stay out until those Excel loops are uncommented.
8. One Excel `describe` group per agent turn after the title pass. GitNexus `impact` before editing a symbol. Do not run Playwright until the user says **run**.

## UI specs (keep these six)

| Spec | Concern | Entry |
|---|---|---|
| `tests/KISHOR_UI/OMN_UIInvoice_Create_Test.spec.ts` | field + formula | create |
| `tests/KISHOR_UI/OMN_UIInvoice_Edit_Test.spec.ts` | field + formula | edit |
| `tests/KISHOR_UI/OMN_UIInvoice_Copy_Test.spec.ts` | field + formula | copy |
| `tests/KISHOR_UI/OMN_UIInvoice_Conditional_Create_Test.spec.ts` | conditional | create |
| `tests/KISHOR_UI/OMN_UIInvoice_Conditional_Edit_Test.spec.ts` | conditional | edit |
| `tests/KISHOR_UI/OMN_UIInvoice_Conditional_Copy_Test.spec.ts` | conditional | copy |

## Catalog shape

Each Covoro Excel `describe` group maps to a UI catalog in `testData/ui/omnUiInvoiceValidation.ts`. If that file grows too large, split by concern into siblings under `testData/ui/` (`omnUiFieldCatalog.ts`, `omnUiFormulaCatalog.ts`, `omnUiConditionalCatalog.ts`) imported by the same specs.

Every Excel row becomes one UI object:

| Field | Meaning |
|---|---|
| `title` | Human Playwright/Allure title (recipes below) |
| `entry` | Filtered by the spec: `create` / `edit` / `copy` |
| `mode` | `run` or `skip` |
| `skipReason` | Required when `mode === "skip"`; passed to `test.skip(true, skipReason)` |
| `run` | Helper to call when `mode === "run"` |

Spec loop (conceptual):

```ts
for (const row of catalogFor(ENTRY, group)) {
  test(row.title, async ({ page }) => {
    if (row.mode === "skip") test.skip(true, row.skipReason);
    await row.run(page);
  });
}
```

### Skip reason vocabulary (use these strings)

| When | Reason |
|---|---|
| No form control | `No Create Invoice control for {field}.` |
| Full valid master list (HS, UOM, currency, other `dropdownMasterOnCovoro` casings) | `UI does not replay the full Excel master list; one representative value is used on the form.` |
| Calculated / read-only amount | `This amount is calculated; the form does not let you enter it.` |
| Edit/Copy cannot set the same way | `Create-only: Edit/Copy cannot set this the same way.` |
| Worker TIN / electronic identity already covered | `Excel worker identity is covered by the party-identity UI cases.` |
| 20-line formula sweep | `UI does not replay the 20-line Excel sweep; two lines cover multi-line entry.` |
| Control disabled on this entry | `{Field} is disabled on {entry}.` (already used by min/max helper) |

## Phase 1 — Titles only

No new Excel rows. Rewrite existing UI titles so they match Excel wording, with Save/Update instead of accepted/rejected.

### Min/max

Change `omnUiMinMaxWhatEntered` and the spec template.

| Variant | Title |
|---|---|
| min | `{Field} at minimum length ({n} character(s)) — Save should succeed. ({Field})` |
| max | `{Field} at maximum length ({n} characters) — Save should succeed. ({Field})` |
| belowMin, empty, required | `An empty {Field} — the form should show an error. ({Field})` |
| belowMin, empty, optional | `An empty {Field} — Save should succeed. ({Field})` |
| belowMin, n > 0 | `{Field} of {n} characters — the form should show an error. ({Field})` |
| aboveMax | `{Field} of {n} characters — the form should show an error. ({Field})` |

Edit/Copy: `Update should succeed` instead of `Save should succeed`. Use `character` when n is 1, else `characters`. Outcome still comes from `omnUiMinMaxExpectsError` (do not invert pass/fail).

### Formula (existing positive OMR rows)

```
Given {name} — When calculated totals match — Then Save should succeed. ({name})
```

Edit/Copy: `Then Update should succeed.`

### Copy invoice number

```
Given a copied invoice — When invoice number is left empty — Then Update should succeed. (Invoice Number)
```

### Conditional

Keep `omnUiConditionalDisplayTitle`: swap upload → Save/Update. Do not change Excel `title` strings in `ConditionalValidation.ts`.

### Unchanged

- `Opening the editor should show the invoice form.`
- Party-identity titles already using Save/Update

## Phase 2 — Field coverage

Source: each `test.describe` in `OMN_FieldValidation_CovoroTemplate_Test.spec.ts`. One group per turn. Create / Edit / Copy share the same catalog.

**Run** when the form has an `inputId` (or date/autocomplete already on `OMN_UI_FIELD_RULES`): type length/numeric/format values; select a **single** invalid dropdown option; pick Invoice Issue Date cases; party-identifier companion and CL-06 when those controls exist; tax exemption code/text companion when those controls exist.

**Skip** (row still listed):

- Full valid master lists (HS, UOM, currency, other dropdown master casings) — master-list skip reason
- No form control
- Seller/Buyer electronic address + VATIN length that must match the logged-in worker — skip duplicate Excel length rows; keep existing party-identity UI tests

Existing min/max loops stay; add catalog rows only for Excel field groups not already covered.

## Phase 3 — Formula coverage

Source: each `test.describe` in `OMN_FormulaValidation_CovoroTemplate_Test.spec.ts`.

**Run** means: select invoice type / txn / currency / tax category; type quantities, prices, charges, allowances; then read calculated totals or expect a form error. Use existing `OMN_UI_ITEM_FORMULA_KEYS` / `OMN_UI_INVOICE_FORMULA_KEYS`. Add a second line with **Add Item** for 2-line Excel cases.

**Run (do not skip just because Excel used a workbook):**

- Existing positive OMR rows (`OMN_UI_FORMULA_SCENARIOS`)
- Negative rows (`invoiceNegativeFormulaTestData`) that use the same typed keys
- Profit-margin total due when txn is Profit Margin Invoice / Self-Invoice (select txn, then type)
- Non-OMR / IBT-111 when Tax Accounting Currency is not OMR and the amount is visible (select currency, then type)
- 2-line cases via Add Item
- Mismatch rows **only if** that total field is editable; type the wrong amount and expect a form error

**Skip:**

- Read-only calculated totals (cannot type a wrong Amount Due) — calculated-amount reason
- Missing or disabled control
- 20-line sweep — 20-line skip reason
- ALIGNED-IBRP-E/O/S/Z-08-OM taxable-amount batches when the taxable amount is not typed — calculated-amount reason

Error titles:

```
Given {name} — When calculated totals do not match — Then the form should show an error. ({name})
```

## Phase 4 — Conditional coverage

Source: **active** `test.describe` groups in `OMN_ConditionalValidation_CovoroTemplate_Test.spec.ts`.

**Already mapped** — keep `runOmnUiConditionalScenario` and `omnUiConditionalDisplayTitle`: exchange rate, credit/debit reason, preceding invoice, invoicing period, import of goods, seller VAT/address, third party, buyer id/VATIN/address, deliver-to, industrial classification, exemption reason, VAT category rate, prepayment, buyer identifier scheme, item attribute, copy invoice number.

**New groups** — one Excel `describe` per turn. Add a `kind` and helper only when that group is implemented. **Run** when the driving fields can be selected or typed.

Examples of groups to catalog: Item Type; goods classification / HS length; export country/service/docs; Special Zone subdivision / seller identifier; Self-billed / RCM buyer VATIN and buyer country; VATIN pattern; seller identifier+scheme; document allowance/charge VAT + reason; Summary period (IBR-036/037); Profit Margin self-invoice, HS prefix, item type (CL-11); document charge/allowance rate; VAT breakdown presence.

**Skip:** calculated line/document VAT amounts (IBR-038/039, E/O/Z-09, line taxable) when not typed; no control; disabled until a gate that cannot be set; Edit/Copy create-only limitation (same as preceding invoice today).

## Asserts

| Outcome | UI check |
|---|---|
| Success | Section Save (create) or Update (edit/copy); no field error |
| Failure | Visible helper / validation message via existing `readFieldError` |
| Formula success | After typing/selecting, read calculated totals and compare |
| Skip | `test.skip(true, skipReason)` so Allure lists the row |

## Files we may touch

| Layer | Path |
|---|---|
| Catalog + titles | `testData/ui/omnUiInvoiceValidation.ts` (or `testData/ui/` siblings if split) |
| Specs | the six UI specs above |
| Helpers | `Helpers/ui/omnUiInvoiceHelper.ts`, `Helpers/ui/omnUiInvoiceEntryHelper.ts` |
| Locators | `pageObjects/OMN_UIInvoiceManualPage.ts` only, after snapshot/MCP |

## Implementation order

1. Phase 1 titles (min/max helper + formula + copy titles). Touch only `omnUiInvoiceValidation.ts` plus the six UI specs if a title string lives in the spec.
2. At the start of phase 2, 3, and 4: add catalog rows for **every** Excel `describe` in that phase as `skip` with a named reason (Allure lists the full set).
3. Then convert one Excel `describe` group per turn from `skip` to `run` (field, then formula, then conditional).

Skip stubs without a named reason are not allowed. Do not add a runner for a second group in the same turn.

## Out of scope

- Attachment UI spec
- Simplified Excel template specs
- Changing Excel titles or Excel helpers
- Uncommenting txn mutual-exclusion Excel describes
- Replaying full HS / UOM / currency master lists on the form
- Running Playwright until the user says **run**
