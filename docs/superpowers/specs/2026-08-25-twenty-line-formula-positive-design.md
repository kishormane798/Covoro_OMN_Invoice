# 20-line formula positive suite (OMR)

**Date:** 2026-08-25  
**Status:** Approved for implementation

## Goal

Add five **positive (accept only)** Excel-upload formula cases with **exactly 20 invoice lines**, **OMR only**. Prove totals recalculation and per-line tax companions (including distinct cycling Z/E exemption reasons) succeed.

## Non-goals

- Non-OMR / USD currency suites for these cases
- Mismatch / error-file polarity
- Changing existing 1-line or 2-line formula suites
- Submit/delivery matrix coverage (stays in submit multi-item)

## Cases (5)

| # | Name | Tax categories | Exemption reasons |
|---|---|---|---|
| 1 | Mixed | 5× Standard, 5× Zero, 5× Exempt, 5× Not subject | Z/E: cycle masters; S/O: empty |
| 2 | Same — Standard | Standard × 20 | empty |
| 3 | Same — Zero | Zero × 20 | cycle `taxExemptionReasonZeroRatedValidTestData` (16 → restart at 1) |
| 4 | Same — Exempt | Exempt × 20 | cycle `taxExemptionReasonExemptValidTestData` (12 → restart at 1) |
| 5 | Same — Not subject | Not subject × 20 | empty |

## Line construction

- Line identifiers `1`…`20`.
- Shared money baseline per line (same as `FORMULA_TWO_LINE_SWEEP_BASE_ROW` amounts); document charges/allowances/paid/rounding counted once on line 1 only (other lines 0).
- Per-line tax companions: category, rate, item type / HS / service type, and exemption reason where required — same patterns as existing formula tax sweep / submit multi-item.
- Invoice type / payment means for Exempt and Not subject: use existing sweep companions (`Invoice out of scope of tax` / `Instrument not defined`) on those lines (and on whole invoice when Same-Exempt / Same-Not-subject).
- Workbook via `generateInvoiceFromSubmitRows` so invoice-level totals aggregate across 20 lines.
- Assert via existing `uploadAndVerify` (completed / no error file).

## Reason cycling

```
reasons[i % reasons.length]  // 0-based line index i
```

Zero masters: 16 labels. Exempt masters: 12 labels. After last, restart from first.

## Files

| Path | Responsibility |
|---|---|
| `Helpers/excel/formulaValidationHelper.ts` | Build 20 submit rows; `runPositiveTwentyLineFormulaScenario` |
| `tests/OMN_FormulaValidation_CovoroTemplate_Test.spec.ts` | Describe + 5 OMR positive tests |

## Approach

Extend formula helper (Approach 1). Do not put these cases in the submit multi-item matrix.
