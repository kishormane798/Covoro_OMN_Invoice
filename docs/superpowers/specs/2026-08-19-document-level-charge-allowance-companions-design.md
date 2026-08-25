# Design: Document-level charge/allowance companions

**Date:** 2026-08-19  
**Status:** Approved (generator companions + empty-category error cases + 2-line totals counted once)

## Goal

When **Charges On Document Level** or **Allowances On Document Level** are present on a Covoro Excel invoice, fill their companions, keep them identical on every item row, and count the amounts **once** in invoice-level totals.

| Amount field | VAT category | Exemption reason |
|---|---|---|
| Charges On Document Level | VAT Category - Charges | Tax Exemption Reason - Charges |
| Allowances On Document Level | VAT Category - Allowances | Tax Exemption Reason - Allowances |

## Rules

1. **Fill when amount is present** (non-empty cell, including a written `0` that the scenario is testing).
2. **VAT category = item Tax Category** on generated happy-path rows (Covoro test data; Peppol allows a different category — do not add a mismatch error case).
3. **Zero rated or Exempt** → exemption reason required (IBR-062-OM allowances, IBR-064-OM charges). Standard / Not subject → reason empty.
4. **Empty VAT category** while amount is present → error file (item tax stays Standard).
5. **Multi-item:** copy the same six document-level cells onto every data row. Totals read charges/allowances from row 1 only.

## Totals (count once)

- Invoice total without tax = Σ line nets + charges − allowances  
- Invoice total tax = Σ line VAT + (charges × rate) − (allowances × rate)  
- With tax / amount due follow from that  
- Rate is 5% for Standard, else 0  

2-line expected math: line 1 invoice total (charges already included) + line 2 **line** net/VAT only.

## Layers

| Layer | Path | Change |
|---|---|---|
| Formula helper | `Helpers/excel/formulaValidationHelper.ts` | After Profit Margin companions, fill/clear document VAT category + exemption from the final item tax; 2-line overlay with non-zero charges/allowances |
| Formula spec | `tests/OMN_FormulaValidation_CovoroTemplate_Test.spec.ts` | 2-line Standard accepted (OMR/USD) + Standard invoice-level mismatch; Zero/Exempt 2-line with charges not in this slice (no error-file, invoice `Error`) |
| Conditional data | `testData/FieldValidations/ConditionalValidation.ts` | Empty VAT category error cases; Standard charge accepted (IBR-045-OM) |
| Conditional builder | `Helpers/excel/conditionalValidationHelper.ts` | Empty document VAT category must not blank item Tax Category |
| Conditional spec | existing IBR-062/064 and IBR-047/094 loops | No new describe required |

## Non-goals

- Category-mismatch error vs item (Peppol allows it)
- Python writer auto-fill (would overwrite empty-category negatives)
- Changing the existing 2-line tax sweep (`docCharges: 0`)
- Create Invoice UI
- Mixed tax on one invoice
