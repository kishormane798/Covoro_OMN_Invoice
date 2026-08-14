# Design: Invoice driver profile → Excel (Approach A)

**Date:** 2026-08-12  
**Status:** Approved (user chose A + setup)

## Goal

Create invoice Excel from a **valid Oman seed** driven by three fields only:

1. `Invoice Transaction Type Code`
2. `Invoice Type Code`
3. `Tax Category`

Then optionally mutate **one** target field (empty / wrong / valid) for positive or negative cases.

## Non-goals (this setup)

- Filtering which conditional rules to run (Approach B) — later phase
- Rewriting existing pack helpers or live Playwright specs
- Formula camelCase pipeline (`generateInvoiceExcel`) — submit header-key path only

## Flow

```
drivers { txn, invoiceType, taxCategory }
  → buildValidOmanFullTaxInvoiceRow() seed
  → apply tax-category dependents (rate / exemption)
  → apply transaction-type dependents (import, CN period, third party, …)
  → apply invoice-type dependents (CN/DN preceding + reason)
  → optional fieldOverrides
  → generateInvoiceFromSubmitData(row)
```

## API

| Function | Role |
|----------|------|
| `buildInvoiceRowFromDrivers(drivers, fieldOverrides?)` | Header-key submit row |
| `generateExcelFromDrivers(drivers, fieldOverrides?)` | Write `.xlsx` under worker generated dir |
| CLI `scripts/generate_excel_from_drivers.ts` | Smoke / Downloads copy |

## Dependent fills (valid profile)

| Driver | Dependents filled when needed |
|--------|-------------------------------|
| Tax = Standard | Tax Rate `5`; clear exemption |
| Tax = Zero rated | Rate `0` + zero-rated exemption reason |
| Tax = Exempt | Blank rate + exempt reason |
| Tax = Not subject | Blank rate; clear exemption |
| Txn = Import of Goods | Import date, customs, Incoterms, Goods + HS |
| Txn = Export Invoice | Prefer Zero-rated line + sample delivery country if still OM-only |
| Txn = Third-party | Third-party block |
| Txn = Prepayment | Prepayment number/UUID |
| Txn = Summary / Continuous | Invoicing period |
| Txn = Profit margin* | Not-subject tax category + blank rate |
| Type = Credit / Debit / Self billed CN | Preceding invoice + reason (existing helpers) |

## Success criteria

- Default drivers (Full Tax + Commercial + Standard) produce an uploadable workbook
- Changing only the three drivers changes profile dependents correctly
- `fieldOverrides` can blank or set a single column without rebuilding the whole seed by hand

## Out of scope follow-ups

- Wire Approach B filter on conditional matrix
- Reuse this profile inside field/conditional Excel pack helpers
