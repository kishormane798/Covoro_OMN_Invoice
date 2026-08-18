# Design: Multi-line formula validation (same tax, all categories, invoice-level totals)

**Date:** 2026-08-18  
**Status:** Approved (2-line replay + same tax both lines + all tax categories + invoice-level fields)

## Goal

Keep the existing **1-line** Excel formula suite (~171 tests). Add a **2-line** parallel suite that:

1. Uses **the same tax category on line 1 and line 2**
2. Copies **all other columns from line 1** (only Invoice Line Identifier differs) so invoice totals must be aggregates (`2 ×` line 1)
3. Covers **all Oman tax categories**
4. Asserts **every invoice-level calculated field** (mismatch + tolerance)
5. Replays the current valid/invalid/mismatch/tolerance/Zero-VAT/IBR-075/IBR-071 cases as 2-line
6. Keeps USD calculated-field mismatch/tolerance on **IBT-111 only** (the one FX-dependent column)

## Non-goals

- Mixed tax on one invoice (line 1 Standard + line 2 Zero rated) — rejected
- Cartesian of every min/max formula row × every tax category (would be 600+ extra tests)
- 3+ line invoices
- Enabling Create Invoice UI formula tests
- Duplicating USD mismatch/tolerance for non-FX columns (line net, VAT, amount due, …)
- **Item Custom 1** / **Item Custom 2** length or presence checks — already covered in Excel field validation (`fieldValidationOptional` in `OMN_FieldValidation_CovoroTemplate_Test.spec.ts`). They are optional free-text, not calculated totals. 2-line formula rows may copy those cells from line 1 if the seed has them; do not add formula mismatch/tolerance cases for them.

## Why 1-line is not enough

Current formula Playwright cases call a **single-row** generator. Invoice-level cells are still filled, but on one line:

`Sum of Invoice line net amount` = that line’s net.

Aggregation (`line1 + line2`) is never proven. `generateInvoiceFromSubmitRows` already forces invoice-level totals across lines (submit/pack); the live formula spec does not use it.

## Tax categories (all four)

From `taxCategoryValidTestData` / `Master.omnCore.ts`:

| Tax category | Tax Rate (both lines) | Line VAT | Companions (both lines) |
|---|---|---|---|
| Standard rate | **5** | 5% of line net | none extra |
| Zero rated | **0** (written zero) | 0 | exemption reason (e.g. Qualifying Food Items) |
| Exempt from tax | **blank** (empty cell, not `0`) | blank/0 | exemption + out-of-scope invoice type / payment means (same as existing Zero-VAT cases) |
| Services outside scope of tax / Not subject to tax | **blank** (empty cell, not `0`) | blank/0 | same companions as existing Not-subject cases |

**Tax Rate rule:** Exempt and Not subject must leave **Tax Rate empty** on line 1 and line 2. Do not write `0` or `0.00`. Zero rated still writes `0`. Standard still writes `5`. Use `taxRate: null` in the formula payload so the Excel cell stays blank (same as current 1-line Exempt / Not-subject rows).

Profit Margin is an **invoice transaction type**, not a tax category. 2-line Profit Margin rows keep that txn on **both** lines and still use the scenario’s tax category on both lines.

## Workbook shape

One invoice number, two Excel data rows.

| Line | Tax | Amounts |
|---|---|---|
| **Line 1** | Scenario tax (or sweep tax) | Scenario amounts (or mismatch baseline) |
| **Line 2** | **Same** tax + same Tax Rate + **all other columns copied from line 1** | Same amounts/charges/item text as line 1; only **Invoice Line Identifier** is `2` |

Do not mix categories on a workbook.

Generator: `generateInvoiceFromSubmitRows` so these **invoice-level** headers are sums across both lines:

- Sum of Invoice line net amount
- Invoice total amount without tax
- Invoice total tax amount
- Invoice total amount with tax
- Amount due for payment
- Total amount due (profit margin)
- Invoice total tax amount in tax accounting currency (USD / IBT-111 only)

**Line-level** (written per row, not summed): Item net price, Invoice line net amount, Line item VAT amount, Total amount including VAT.

## Spec loops

Keep the existing 1-line describes unchanged.

Add `test.describe("Multi-line (2 items) — same tax category")` in `tests/OMN_FormulaValidation_CovoroTemplate_Test.spec.ts`.

### A — Replay current tables as 2-line

Same `CURRENCY_SUITES` + `isScenarioApplicableForMode` as 1-line (all general rows in OMR and USD; `nonOmrOnly` still OMR-skipped).

| Source | 2-line behavior |
|---|---|
| Valid / invalid formula rows | Both lines use the **scenario** tax category and companions |
| Calculated mismatch / tolerance | Same targets as 1-line; 2-row workbook |
| Zero Line Item VAT forced non-zero | Both lines that zero-VAT category; force non-zero VAT on **line 1** |
| IBR-075-OM / IBR-071-OM | Line 1 = named scenario; line 2 = same tax, different amounts |

Line-level mismatch/tolerance: patch **line 1 only**.  
Invoice-level mismatch/tolerance: patch the field on **every data row** so line 2 cannot still hold the correct total.

USD mismatch/tolerance: **IBT-111 only**.

### B — All tax categories on invoice-level fields

Replay A alone leaves most mismatch baselines on **Standard rate**. Add a sweep so **each of the four tax categories** gets 2-line coverage of invoice-level fields:

For each tax category (both lines that category, different amounts):

- OMR: one accepted 2-line upload + mismatch + within/outside tolerance for every **non-FX invoice-level** target except Profit Margin due
- USD: one accepted 2-line upload + mismatch + within/outside tolerance for **IBT-111 only**

**Total Amount Due (Profit Margin)** stays on the existing IBR-082-OM companions (Profit Margin txn + Not subject) on **both** lines. Do not run that column under Standard 5% / Zero rated / Exempt; the generator only fills it for Profit Margin invoices.

Do **not** re-run the full min/max valid/invalid table under Zero/Exempt/Not subject.

## Layers

| Layer | Path | Change |
|---|---|---|
| Helper | `Helpers/formulaValidationHelper.ts` | 2-line row builder (same tax, different amounts, category companions); `generateInvoiceFromSubmitRows`; invoice-level patch on all rows; tax-category sweep list |
| Spec | `tests/OMN_FormulaValidation_CovoroTemplate_Test.spec.ts` | New multi-line describes; 1-line suite untouched |
| Data | Reuse `invoiceFormulaScenarios` + `ZERO_LINE_VAT_CATEGORY_CASES` + `CALCULATED_FIELD_*_TARGETS` | No mixed-tax fixtures |

Do not add a second spec file.

## Expected count (order of magnitude)

| Block | Approx. |
|---|---|
| Existing 1-line | 171 |
| Replay A as 2-line | ~164 |
| Tax-category sweep B (4 categories × invoice-level) | ~90 |
| **Listed total** | **~425** |

Exact number is verified with `npx playwright test tests/OMN_FormulaValidation_CovoroTemplate_Test.spec.ts --project=chromium --list` after implementation.

## Out of scope later

- Mixed-tax 2-line invoices
- UI formula 2-line
- Extra tax labels beyond the four Master.omnCore values
- Item Custom 1 / Item Custom 2 field validation (already in the optional-length field suite)
