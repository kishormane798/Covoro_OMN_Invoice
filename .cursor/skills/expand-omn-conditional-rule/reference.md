# Dimension maps (load only while filling the coverage card)

## Parse tokens → dimension

| Rule text | Dimension value |
|---|---|
| Invoice line / IBG-25 / IBT-151 | `source: line` |
| Document level allowance / IBG-20 / IBT-95 / IBT-095 | `source: allowance` |
| Document level charge / IBG-21 / IBT-102 | `source: charge` |
| VAT breakdown / IBG-23 / IBT-118 | THEN: line `Tax Category` (Covoro has no IBG-23 column) |
| `"S"` / Standard | `STANDARD_TAX_CATEGORY_CODE` |
| `"E"` / Exempt | `EXEMPT_FROM_TAX_TAX_CATEGORY_CODE` |
| `"Z"` / Zero rated | `ZERO_RATED_TAX_CATEGORY_CODE` |
| `"O"` / Not subject | `NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE` |
| Credit note 381 / Debit note 383 / Self billed credit note 261 | `expandAcrossCnDnSelfBilledTypes` |
| Self billed 261 + 389 | `expandAcrossSelfBilledDocumentTypes` |
| Simplified / `X1XXXXXXXXXXXXXXXXXX` | `TXN_SIMPLIFIED_TAX_INVOICE` exception |
| unless / except / not required / not present | extra **accepted** polarity |

`or` between IBG-25 / IBG-20 / IBG-21 = **all listed sources**, not one.

## IBT → Covoro header (row 4)

| IBT / BTOM | Header |
|---|---|
| IBT-151 / IBT-118 | `Tax Category` |
| IBT-152 / IBT-119 | `Tax Rate` |
| IBT-095 | `Vat category - allowances` |
| IBT-102 | `Vat category - charges` |
| IBT-196 | `Tax exemption reason - allowances` |
| IBT-198 | `Tax exemption reason - charges` |
| IBT-121 | `Tax exemption reason code` |
| IBG-20 amount | `Allowances on document level` |
| IBG-21 amount | `Charges on document level` |
| BTOM-001 | `Invoice Transaction Type Code` |
| IBT-003 | `Invoice Type Code` |

## Helpers (`testData/FieldValidations/ConditionalValidation.ts`)

| Dimension | Helper |
|---|---|
| CN / DN / 261 | `expandAcrossCnDnSelfBilledTypes` |
| 261 + 389 | `expandAcrossSelfBilledDocumentTypes` |
| Self-billed / RCM txn set | `expandAcrossSelfBilledOrRcmTxnTypes` |
| Summary / Continuous | `expandAcrossSummaryOrContinuousTxnTypes` |
| Prepayment exclusion partners | `expandAcrossPrepaymentExclusionPartners` |
| Doc allowance/charge E+Z | `expandAcrossDocEzTaxCategories` |
| Line vs allowance vs charge | `source` + `breakdownMatches` on `VatBreakdownCategoryPresenceScenario` |

## Polarities per named cell

1. **Allowed** — IF X true and THEN satisfied → `shouldError: false`
2. **Not Allowed** — IF X true and THEN violated → `shouldError: true`
3. **Each exception** — documented unless/except on X → `shouldError: false`
4. **Wrong-target** — same treatment T allowed only for X, applied to sibling Y → `shouldError: true`

Clone Allowed(X, T); change only the scoped dimension to Y. One Y per X-scope. If Not Allowed is already T on Y, reuse it.

Do not add tax categories or txn types the rule does not name, except that **one** sibling Y for the wrong-target error.
