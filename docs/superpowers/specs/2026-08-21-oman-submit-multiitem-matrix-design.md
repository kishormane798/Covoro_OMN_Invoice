# Design: Oman submit multi-item matrix (main framework)

**Date:** 2026-08-21  
**Status:** Approved (Approach 1 + main `tests/` placement)

## Goal

Replace the leftover **UAE** Excel-upload submit dataset with an **Oman** multi-item matrix: every **Invoice Type Code** × every **Invoice Transaction Type Code**, each invoice having **4 lines** (2 Goods + 2 Services covering all 4 Oman tax categories), **OMR only**. Spec and data live in the main framework (`tests/`, `testData/FieldValidations/`), not in `kishorsubmit` or `sanitysubmit`.

## Non-goals

- Single-item cartesian (no 3,840 one-line cases; no USD/AED currency loop)
- Separate Goods vs Services as two test cases
- Forcing item type to match transaction type (Import of Goods / RCM keep mixed 2+2 lines; failures are accepted)
- Rewriting `kishorsubmit` / `sanitysubmit` into the new Oman suite
- Changing `runSubmitInvoiceMultiItemCase` unless a row-shape bug appears
- UI Create Invoice submit (`tests/KISHOR_UI/`)

## Matrix

| Dimension | Source | Count |
|-----------|--------|-------|
| Invoice Type Code | `invoiceTypeCodeValidTestData` in `testData/FieldValidations/Master.omnCore.ts` | 32 |
| Invoice Transaction Type Code | `invoiceTransactionTypeValidTestData` in the same file | 15 |
| Currency | `OMAN_CURRENCY_OMR` (`OMR`); empty `Currency Exchange Rate` | 1 |

**480 cases.** Generated at module load time. No committed compact JSON.

## Line layout (same 4 lines on every case)

| Line id | Item Type | Tax Category | Tax Rate | Companions |
|---------|-----------|--------------|----------|------------|
| LINE-S-001 | Goods | Standard rate | `5` | HS classification; no exemption; no Service Type Code |
| LINE-S-002 | Goods | Zero rated | `0` | HS classification; `TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE` on code + text |
| LINE-S-003 | Services | Exempt from tax | empty | `SERVICE_TYPE_CODE_SAMPLE`; `TAX_EXEMPTION_REASON_SAMPLE` on code + text; no HS |
| LINE-S-004 | Services | Services outside scope of tax / Not subject to tax | empty | `SERVICE_TYPE_CODE_SAMPLE`; no exemption; no HS |

Labels come from `Master.omnCore.ts` / `ConditionalValidation.ts` constants (`ITEM_TYPE_GOODS`, `ITEM_TYPE_SERVICES`, `STANDARD_TAX_CATEGORY_CODE`, etc.). Do **not** use UAE `Standard rate.` (trailing period) or `VAT Reverse Charge`.

## Builder

```
for each invoiceType in invoiceTypeCodeValidTestData
  for each txnType in invoiceTransactionTypeValidTestData
    seed = buildValidOmanFullTaxInvoiceRow()
    set Invoice Type Code + Invoice Transaction Type Code
    apply txn extras that do not overwrite the four tax/item lines
    apply CN/DN preceding fields when the invoice type is a credit/debit/self-billed credit
    clone seed into 4 rows; overlay the line table above
    emit { name, rows }
```

**Transaction extras (fill only; never replace the 4-line tax map):**

| Transaction type | Extra fields |
|------------------|--------------|
| Import of Goods | Import date, Customs Declaration number, Incoterms (lines stay 2 Goods + 2 Services) |
| Export Invoice | Delivery-to sample for a non-OM destination; do **not** force all lines to Zero rated |
| Third-party Invoice | Third-party name / VATIN / address block |
| Prepayment Invoice | Prepayment number + UUID |
| Summary Invoice / Continuous Supply | Invoicing period start/end |
| Special Zone Supplies | CL-13 subdivision on seller/buyer as existing special-zone overlay does |
| Profit Margin Invoice / Profit Margin Self-Invoice | Profit margin item type on goods lines only; do **not** force all lines to not-subject |
| Import of Services (RCM) | No item-type rewrite; keep 2 Goods + 2 Services |

**Invoice type extras (do not change the matrix transaction type):**

When Invoice Type Code is any credit note, debit note, or self-billed credit note (including “related to goods or services / financial adjustments”, factored, forwarders):

- `Credit note or Debit Note reason code` = `CREDIT_DEBIT_REASON_SAMPLE`
- Preceding invoice reference, issue date, UUID (`PRECEDING_INVOICE_UUID_SAMPLE`)

Do **not** call `applyCnDnSelfBilledInvoiceType` as-is: it overwrites transaction type to Full Tax / Self-billed. Set type + preceding fields only.

Commercial / tax invoice / self-billed invoice (389) and other non-CN types: leave preceding + reason empty.

**Money/qty:** leave to `runSubmitInvoiceMultiItemCase` (`FORMULA_INPUT_OVERRIDES` + `generateInvoiceFromSubmitRows` recalculation). Do not hand-set invoice totals.

## Spec

**Path:** `tests/OMN_SubmitInvoice_MultiItem_CovoroTemplate_Test.spec.ts`

Pattern (same as field/conditional Covoro specs):

- `import { test } from "../Src/baseTest"`
- `import { multiItemInvoiceCases } from "../testData/FieldValidations"`
- `import { runSubmitInvoiceMultiItemCase } from "../Helpers/submitInvoiceCaseHelper"`
- `const TEMPLATE = "Covoro"`
- `test.describe.configure({ mode: "parallel" })`
- Timeout: existing multi-item submit timeout (8 minutes)

**Title:**

`Excel upload · Covoro | Submit multi-item | {Invoice Type Code} | {Invoice Transaction Type Code} | OMR | 4 items (2 Goods + 2 Services) → delivered`

Picked up by `npm run test:covoro` (`tests/**/*CovoroTemplate*.spec.ts`).

## Files

| Path | Action |
|------|--------|
| `testData/FieldValidations/SubmitInvoiceMultiItem.ts` | Replace kishorsubmit re-export with a generator that exports `multiItemInvoiceCases` (480). Type: `{ name: string; rows: Array<Record<string, string>> }`. No compact JSON. |
| `testData/FieldValidations/SubmitInvoice.ts` | Stop re-exporting UAE `invoiceData`. Export `invoiceData: Record<string, string>[] = []`. |
| `tests/OMN_SubmitInvoice_MultiItem_CovoroTemplate_Test.spec.ts` | **Create** — thin loop over generated cases. |
| `tests/kishorsubmit/OMN_SubmitInvoice_CovoroTemplate_Test.spec.ts` | **Skip** the describe (UAE single-item + USD loop must not run under `test:covoro`). |
| `tests/kishorsubmit/OMN_SubmitInvoice_MultiItem_CovoroTemplate_Test.spec.ts` | **Skip** the describe (do not double-run 480 cases). |
| `tests/kishorsubmit/testData/SubmitInvoice.ts` | Replace UAE blob: `export const invoiceData: Record<string, string>[] = []`. |
| `tests/kishorsubmit/testData/SubmitInvoiceMultiItem.compact.json` | **Delete**. |
| `tests/kishorsubmit/testData/SubmitInvoiceMultiItem.ts` | Stop loading compact JSON; re-export `multiItemInvoiceCases` from `testData/FieldValidations/SubmitInvoiceMultiItem.ts`. |
| `tests/sanitysubmit/OMN_SubmitInvoice_Sanity_Test.spec.ts` | Keep the file in sanitysubmit; switch `invoiceData[0]` to `multiItemInvoiceCases[0]` (FieldValidations generator) so empty `invoiceData` does not crash sanity. Do **not** copy the 480-case suite into that folder. |

`Helpers/submitInvoiceCaseHelper.ts` stays a re-export of the existing runner.

## Success criteria

- No AED / UAE TIN / Dubai / `Standard Tax Invoice` / `Free Trade zone` / `VAT Reverse Charge` rows in FieldValidations submit datasets.
- `multiItemInvoiceCases.length === 32 * 15` (480).
- Every case has exactly 4 rows; item types are Goods, Goods, Services, Services; tax categories are the four Oman labels.
- Currency is OMR on every row.
- Main spec lives at `tests/OMN_SubmitInvoice_MultiItem_CovoroTemplate_Test.spec.ts`.
- `kishorsubmit` submit describes are skipped so `test:covoro` does not run UAE cases or duplicate the Oman matrix.
- Existing helper still generates Excel via `generateInvoiceFromSubmitRows` and waits for delivery.

## Runtime note

480 delivery tests (minutes each, parallel workers) is an intentional full matrix. Do not shrink counts without an explicit follow-up.

## Out of scope follow-ups

- Single-item Oman submit spec
- Second currency (USD/AED + FX)
- Skipping or rewriting mixed lines for Import of Goods / RCM after failures are measured
