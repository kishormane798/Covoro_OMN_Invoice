# Design: UI Invoice Transaction Type multi-select (IBR-138-OM … IBR-149-OM)

**Date:** 2026-09-09  
**Status:** Approved  
**Scope:** Create / Edit / Copy Invoice UI only. Excel upload describes stay commented.

## Goal

`#invTxnType` is a checkbox multi-select. Tests must (1) check options instead of treating it as a single autocomplete, (2) select the Invoice Type that enables those options, (3) cover IBR-138-OM … IBR-149-OM in the **field** and **formula** UI catalogs.

## Why Create Save failed

Live Document Details: Invoice Transaction Type is `aria-multiselectable="true"`. Save shows `Please select the invoice transaction type.` With Commercial invoice and nothing checked, only Full Tax Invoice and Simplified Tax Invoice are enabled. `selectAutocomplete` fills and clicks a list option; it does not check the box.

## Invoice type companion

| Transaction types | Invoice Type first |
|---|---|
| Full Tax / Simplified | Commercial invoice |
| Self-billed Invoice, Import of Services (RCM), Profit Margin Self-Invoice, Import of Goods | Self-billed invoice |
| Other Commercial extras (Third-party, Summary, Export, Prepayment, …) | Commercial invoice, then check Full Tax, then the extra type |

## IBR-138-OM … IBR-149-OM

Excel scenario arrays already exist; combination describes are commented (one Excel cell cannot hold two types). UI catalogs run one representative Invoice Type per unique txn cell (no Master invoice-type cartesian).

| Polarity | UI |
|---|---|
| Allowed (subject alone / partner alone) | Select required Invoice Type + txn checkbox(es) → Save/Update succeeds |
| Not Allowed (subject + named partner) | Partner stays disabled, or Save keeps the section in edit with a field error |

Field catalog: all polarities. Formula catalog: Allowed only, then fill the default formula line.

## Files

- `pageObjects/OMN_UIInvoiceManualPage.ts` — `selectTransactionTypes` (checkbox listbox `#invTxnType-listbox`)
- `Helpers/ui/omnUiInvoiceHelper.ts` — companion + all `invTxnType` writes; field/formula runners
- `testData/ui/omnUiInvoiceValidation.ts` — field + formula catalog groups/rows

Do not change generic `selectAutocomplete` (CRITICAL hub). Do not uncomment Excel IBR-138…149 describes.
