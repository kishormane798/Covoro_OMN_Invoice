# Design: Oman UI testcase titles (Create / Edit / Copy)

**Date:** 2026-09-04  
**Status:** Approved  

**Parent:** `docs/superpowers/specs/2026-08-20-improve-testcase-title-design.md`  
**Suites:** all six Oman UI specs (field + formula, and conditional, for Create / Edit / Copy)

## Goal

Playwright / Allure titles for the Oman Create Invoice UI suite must be readable by a non-technical person. From the title alone they can tell what was tried and whether Save/Update should succeed or the form should show an error.

Assertions, locators, helpers, and Excel upload titles do not change.

## Scope

| Spec | Shape |
|---|---|
| `tests/KISHOR_UI/OMN_UIInvoice_Create_Test.spec.ts` | describe + min/max, formula, identity loops (`create`, Save) |
| `tests/KISHOR_UI/OMN_UIInvoice_Edit_Test.spec.ts` | same (`edit`, Update) |
| `tests/KISHOR_UI/OMN_UIInvoice_Copy_Test.spec.ts` | same (`copy`, Update) |
| `tests/KISHOR_UI/OMN_UIInvoice_Conditional_Create_Test.spec.ts` | describe + conditional loops (`create`) |
| `tests/KISHOR_UI/OMN_UIInvoice_Conditional_Edit_Test.spec.ts` | same (`edit`) |
| `tests/KISHOR_UI/OMN_UIInvoice_Conditional_Copy_Test.spec.ts` | same (`copy`) |

Those files contain `test.describe` + data loops + `test(\`title\`, …)` like Covoro Excel specs. Shared `runOmnUi*` helpers stay in `Helpers/ui/`.

**Already improved (UI Playwright names):** none. Every reported UI name still uses pipes, arrows, or an Excel “uploaded” wrapper.

## Approach

Adapt the existing title wording. Specs follow the Covoro Excel pattern: `test.describe` + data loops + `test(\`title\`, …)` in the spec file. Do not unroll hundreds of loop-generated tests into one hardcoded `test()` per row without a loop. Do not add a new `uiTestTitle` module.

Create uses **Save**. Edit and Copy use **Update**. `describe()` headings stay as they are (`Create Invoice UI — field and formula`, etc.). The test name itself must not repeat `Create Invoice UI |`.

## Title recipes

Forbidden in the title body: `Excel upload`, `Covoro`, `error file`, pipe `|`, `→`, `field error` as a bare arrow suffix, IBT numbers.

Rule id or field name stays at the end in parentheses.

### Min/max (field)

```
{What we entered} — Save should succeed. ({Field})
{What we entered} — the form should show an error. ({Field})
```

Edit/Copy: `Update should succeed` instead of `Save should succeed`.

| Variant | What we entered |
|---|---|
| min | `A {n}-character {Field}` (`1-character` when n is 1) |
| max | `{Field} at maximum length ({n} characters)` |
| belowMin, empty | `An empty {Field}` |
| belowMin, n > 0 | `A {n}-character {Field} (below minimum)` |
| aboveMax | `A {n}-character {Field} (above maximum)` |

Example: `A 1-character Invoice Number — Save should succeed. (Invoice Number)`

### Conditional (UI wrapper only)

Excel rows in `ConditionalValidation.ts` keep `When the invoice is uploaded`. At UI bind time, rewrite the displayed title:

- Drop any `Create Invoice UI |` / `Edit Invoice UI |` / `Copy Invoice UI |` prefix
- Replace only these Excel phrases when they appear (leave any other When/Then clause as-is):
  - `When the invoice is uploaded` → `When the form is saved` (Create) or `When the form is updated` (Edit/Copy)
  - `Then the invoice should be accepted.` → `Then Save should succeed.` or `Then Update should succeed.`
  - `Then the invoice should be rejected with an error.` → `Then the form should show an error.`
- Keep the Given clause and `({ruleId})`

Copy-only source `Copied invoice number is empty until filled` has no GWT yet. Display as `An empty invoice number on a copied invoice — Update should succeed. (Invoice Number)` (Copy suite only; exact outcome must match the existing assertion, not invert it).

### Formula

```
Calculated totals should match the formula. ({scenarioName})
```

### Party identity

```
{Seller|Buyer} VAT Identifier and electronic address from Excel identity — Save should succeed. (VAT Identifier)
```

Self-billed buyer: `from self-billed Excel worker TIN` instead of `from Excel identity`. Edit/Copy use Update.

### Navigation

```
Opening the editor should show the invoice form.
```

## Files

| File | Change |
|---|---|
| `testData/ui/omnUiInvoiceValidation.ts` | Scenario data, `omnUiMinMaxWhatEntered`, `omnUiConditionalDisplayTitle` |
| `tests/KISHOR_UI/OMN_UIInvoice_*_Test.spec.ts` | Covoro-style `test.describe` / loops / title template strings |
| `.cursor/skills/add-ui-invoice-test/SKILL.md` | Replace the pipe title snippet with this recipe so new UI cases do not regress. |

## Non-goals

- Changing assertions, locators, timeouts, or `runOmnUi*` behavior
- Editing `testData/FieldValidations/ConditionalValidation.ts` (Excel titles stay “uploaded”)
- Changing `describe()` headings
- Excel upload / submit / formula-Excel specs
- A new TypeScript `uiTestTitle` helper module
- Unrolling loop-generated tests into per-case string literals

## Success

A non-tech person reading only the Playwright title can say what was entered (or which business rule) and whether Save/Update should succeed or the form should show an error. Grep still finds the field name or PINT-OM rule id in parentheses.
