# Document-level charge/allowance companions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline; user asked to implement immediately).

**Goal:** Fill VAT category and exemption companions when document charges/allowances are present, keep them identical on every multi-item row, count amounts once in invoice totals, and add empty-category Excel error cases.

**Architecture:** One submit-row applier at the end of `buildFormulaSubmitRow` (after Profit Margin tax rewrite) so category always matches the final item Tax Category. Conditional scenarios set companions explicitly and leave VAT category blank for error cases. 2-line formula overlay uses non-zero charges/allowances; `pickCorrectTwoLine` already zeros line-2 document amounts for expected totals.

**Tech Stack:** Playwright, TypeScript, Covoro Excel submit-row generator.

## Global Constraints

- Oman `*-OM` rule IDs only; template headers from `ConditionalValidation.ts` field constants
- Do not auto-fill companions in Python `write_row_json` (breaks empty-category negatives)
- Document amounts counted once from row 1 in `generateInvoiceFromSubmitRows`
- No category-mismatch error case vs item

---

### Task 1: Formula submit-row companions + 2-line overlay

**Files:**
- Modify: `Helpers/excel/formulaValidationHelper.ts`
- Modify: `tests/OMN_FormulaValidation_CovoroTemplate_Test.spec.ts`

**Interfaces:**
- Produces: `applyDocumentLevelCompanionsToSubmitRow(row)` (internal), `FORMULA_TWO_LINE_DOC_LEVEL_OVERLAY`, `documentLevelInvoiceTargetsForMode(mode)`

- [x] **Step 1: Implement companions on the final submit row**
- [x] **Step 2: Add 2-line spec block (accepted per tax + Standard invoice-level mismatch)**

### Task 2: Conditional empty VAT category + Standard charge accepted

**Files:**
- Modify: `testData/FieldValidations/ConditionalValidation.ts`
- Modify: `Helpers/excel/conditionalValidationHelper.ts`

**Interfaces:**
- Consumes: existing `DocumentAllowanceChargeVatScenario` / `buildDocumentAllowanceChargeVatScenarioRow`
- Produces: extra rows in `DOCUMENT_ALLOWANCE_CHARGE_VAT_SCENARIOS` and `DOCUMENT_ALLOWANCE_CHARGE_RATE_SCENARIOS`

- [x] **Step 1: Empty document VAT category must keep item Tax Category Standard**
- [x] **Step 2: Add error/accepted scenarios; existing spec loops pick them up**

### Task 3: Targeted Playwright verification

- [ ] Run IBR-062/064/045/047 grep + 2-line document-charge formula grep
