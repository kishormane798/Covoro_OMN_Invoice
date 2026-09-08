# Design: Shared UI / Excel invoice number generator

**Date:** 2026-09-07  
**Status:** Approved — UI and every spec that *writes a unique invoice number* use `buildUniqueSubmitInvoiceNumber()`. Strip unused `uniqueKey`.

## Goal

Any test that mints a unique Invoice Number (UI form `invNum` or Excel cell) must call `buildUniqueSubmitInvoiceNumber()` in `utils/excel/invoiceExcel.ts`. Shape: `INV-OM-{YYYYMMDD}{HHmmss}{worker}{seq}` (example `INV-OM-20260907154822001001`). Length 65 is only the Invoice Number 64+1 overflow case.

## Current split

| Path | Function | Format |
|------|----------|--------|
| Excel generate / submit | `buildUniqueSubmitInvoiceNumber()` in `utils/excel/invoiceExcel.ts` | `INV-OM-{YYYYMMDD}{HHmmss}{worker}{seq}` |
| UI document baseline | `buildOmnUiInvoiceNumber(uniqueKey)` in `testData/ui/omnUiInvoiceValidation.ts` | `UI-{playwrightTestId}` (max 64) |

UI fill site: `ensureDocumentBaseline` in `Helpers/ui/omnUiInvoiceHelper.ts`. Specs pass `testInfo.testId` as `uniqueKey` into the exported `runOmnUi*` helpers.

## Decision

Call `buildUniqueSubmitInvoiceNumber()` from the UI helper. Do not wrap it, do not keep a `UI-` prefix, do not embed Playwright test id.

Uniqueness stays worker-safe via `TEST_PARALLEL_INDEX` / `UAE_EINVOICE_WORKER_INDEX` plus an in-process sequence, same as Excel.

## GitNexus impact (warn before edit)

- `ensureDocumentBaseline` — **CRITICAL** (hub for Create / Edit / Copy UI). Direct callers: `ensureSectionBaseline`, `runOmnUiExcelPartyIdentityCase`, `runOmnUiConditionalScenario`, `runOmnUiFormulaScenario`.
- `buildOmnUiInvoiceNumber` — **HIGH** (single caller: `ensureDocumentBaseline`).

Behavior change is the invoice-number string only. Do not change section fill, Save/Update, or min/max assertion logic.

Do **not** modify `buildUniqueSubmitInvoiceNumber` itself (Excel pipelines all call it).

## Specs that write a unique invoice number

Use `buildUniqueSubmitInvoiceNumber()` (not a second builder):

- UI Create / Edit / Copy helpers fill `invNum` via `ensureDocumentBaseline` (today: `buildOmnUiInvoiceNumber`).
- Field validation Invoice Issue Date specs (Covoro + Simplified) currently call `FV.buildDynamicInvoiceNumber(prefix)` then patch the workbook.

Do **not** route these through the unique generator (they are the *value under test*, not uniqueness):

- Min/max Invoice Number (empty, too long, exact length).
- Preceding invoice reference (`INV-PREV-*`).
- Prepayment invoice number fields.
- Placeholder `OMN-VALID-001` in conditional row templates (overwritten by `generateInvoiceFromSubmitData`).

Excel generate / submit pipelines already call `buildUniqueSubmitInvoiceNumber()`. Do not change that function.

## Files

**This change (approved batch):**

1. `Helpers/ui/omnUiInvoiceHelper.ts` (primary)
   - Import `buildUniqueSubmitInvoiceNumber` from `utils/excel/invoiceExcel.ts`.
   - `ensureDocumentBaseline`: fill `invNum` with `buildUniqueSubmitInvoiceNumber()` when Create, or Edit with empty `invNum`. Same skip when `excludeInputIds` has `invNum`.
   - Drop `buildOmnUiInvoiceNumber` import.
   - Remove `uniqueKey` from internal and exported helper signatures. It is unused once the Excel generator owns uniqueness.

2. Six UI specs — drop the last `testInfo.testId` argument (TypeScript excess-arg error if exports lose `uniqueKey`):
   - `tests/KISHOR_UI/OMN_UIInvoice_Create_Test.spec.ts`
   - `tests/KISHOR_UI/OMN_UIInvoice_Edit_Test.spec.ts`
   - `tests/KISHOR_UI/OMN_UIInvoice_Copy_Test.spec.ts`
   - `tests/KISHOR_UI/OMN_UIInvoice_Conditional_Create_Test.spec.ts`
   - `tests/KISHOR_UI/OMN_UIInvoice_Conditional_Edit_Test.spec.ts`
   - `tests/KISHOR_UI/OMN_UIInvoice_Conditional_Copy_Test.spec.ts`

3. Invoice Issue Date specs — replace `FV.buildDynamicInvoiceNumber(scenario.invoicePrefix)` with `buildUniqueSubmitInvoiceNumber()`:
   - `tests/OMN_FieldValidation_CovoroTemplate_Test.spec.ts`
   - `tests/OMN_FieldValidation_SimplifiedTemplate_Test.spec.ts`

**Not this change:**

- Do not edit `utils/excel/invoiceExcel.ts`.
- Leave `buildOmnUiInvoiceNumber` and `buildDynamicInvoiceNumber` as unused follow-up deletes.
- Min/max Invoice Number variants still type their own values (empty, over-max, etc.). `buildInvoiceNumber(tooLong)` stays for the length-overflow case.
- Copy scenario `copyInvoiceNumberEmpty` still asserts empty `invNum` before fill.

## Fill rules (unchanged except generator)

- Create: always replace `invNum` unless the case excluded that id.
- Edit: keep existing `invNum` when already filled; generate only when empty.
- Copy: generate a new number (copy leaves `invNum` empty until filled), except the dedicated empty-assert case.

## Out of scope

- Python writer fallback `INV-{epoch_ms}` when TypeScript does not pass a number.
- `buildInvoiceNumber` truncation helper for Invoice Number *too long* cases.
- Preceding / prepayment invoice number fixtures.
- Dashboard filtering by `UI-` prefix (those numbers will look like Excel `INV-…`).
