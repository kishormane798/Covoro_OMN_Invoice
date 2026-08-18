# Multi-line formula validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 2-line Excel formula suite (same tax on both lines, all four Oman tax categories, invoice-level aggregation) beside the existing 1-line ~171 tests.

**Architecture:** Extend `formulaValidationHelper.ts` with `lineCount: 2` generation via `generateInvoiceFromSubmitRows`. Line 1 is the scenario; line 2 copies every column from line 1 except Invoice Line Identifier (`2`). Spec adds a parallel describe; 1-line tests stay unchanged.

**Tech Stack:** Playwright, TypeScript, existing formula helper + `generateInvoiceFromSubmitRows`.

## Global Constraints

- Same tax category on line 1 and line 2 (no mixed tax)
- Exempt / Not subject: Tax Rate blank (`null`), never `0`
- Zero rated: Tax Rate `0`; Standard: Tax Rate `5`
- USD mismatch/tolerance: IBT-111 only
- Profit Margin due column: Profit Margin txn + Not subject only (not in the 4-category sweep)
- Do not cartesian every min/max row × 4 tax categories
- Item Custom 1 / Item Custom 2 stay in field validation only (optional length 1–300); no formula cases
- Files: `Helpers/formulaValidationHelper.ts` + `tests/OMN_FormulaValidation_CovoroTemplate_Test.spec.ts` only

---

## File map

| File | Responsibility |
|------|----------------|
| `Helpers/formulaValidationHelper.ts` | 2-line builder, runners with `{ lineCount?: 1 \| 2 }`, tax sweep list, invoice-level patch on rows 6 and 7 |
| `tests/OMN_FormulaValidation_CovoroTemplate_Test.spec.ts` | New `Multi-line (2 items) — same tax category` describes |

---

### Task 1: Helper 2-line generation + tax sweep

**Files:**
- Modify: `Helpers/formulaValidationHelper.ts`

- [ ] Export `FORMULA_TAX_CATEGORY_SWEEP` (4 categories with companions + taxRate 5 / 0 / null)
- [ ] Export `INVOICE_LEVEL_CALCULATED_HEADERS` and `invoiceLevelTargetsForMode` (exclude Profit Margin due from sweep)
- [ ] `buildSameTaxSecondLine(line1)` → same tax, valid line-2 amounts (500 / 2 / 0)
- [ ] `generateFormulaWorkbook(row, mode, lineCount)` uses `generateInvoiceFromSubmitRows` when `lineCount === 2`
- [ ] Patch invoice-level cells on data rows 6 and 7; line-level on row 6 only
- [ ] Optional `{ lineCount?: 1 | 2 }` on existing run* functions (default 1)

### Task 2: Spec loops

**Files:**
- Modify: `tests/OMN_FormulaValidation_CovoroTemplate_Test.spec.ts`

- [ ] Replay valid/invalid/mismatch/tolerance/Zero-VAT/IBR as 2-line with `{ lineCount: 2 }`
- [ ] Sweep B: each tax category, 2-line accepted + invoice-level mismatch/tolerance (OMR all invoice-level except PM; USD IBT-111 only)
- [ ] One 2-line Profit Margin due mismatch (existing PM companions)

### Task 3: Verify list count

- [ ] `npx playwright test tests/OMN_FormulaValidation_CovoroTemplate_Test.spec.ts --project=chromium --list`
- [ ] Expect ~425 listed tests (171 1-line + replay + sweep)
