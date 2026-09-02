# Design: Oman Create / Edit / Copy UI validation (from scratch)

**Date:** 2026-09-02  
**Status:** Approved — write new Oman files; use UAE suite only as a pattern reference. Do not uncomment disabled UAE-port files.

## Goal

Manual Create Invoice UI coverage for field (min/max), conditional, and formula on **Create**, **Edit**, and **Copy**, for **every invoice section**, using live Oman locators from the form HTML.

## Approach

New files under `testData/ui/`, `pageObjects/` (`OMN_UIInvoiceManualPage.ts`), `Helpers/ui/`, and `tests/KISHOR_UI/`. Reuse live `DashboardPage` (open dashboard, Create Invoice, Edit, Copy, validation helper text). Locators are scoped to `section[data-id]` or `[data-testid="modalBody"]`.

Helpers take `{ entry: "create" | "edit" | "copy" }`. Specs (one concern each):

- Field min/max (dropdown fields skipped) + formula:
  - `OMN_UIInvoice_Create_Test.spec.ts`
  - `OMN_UIInvoice_Edit_Test.spec.ts`
  - `OMN_UIInvoice_Copy_Test.spec.ts`
- Conditional (text/date **and** dropdown-style rows in the same file; every Excel row is its own test):
  - `OMN_UIInvoice_Conditional_Create_Test.spec.ts`
  - `OMN_UIInvoice_Conditional_Edit_Test.spec.ts`
  - `OMN_UIInvoice_Conditional_Copy_Test.spec.ts`

## Sections

| Area | `data-id` |
|------|-----------|
| Document | `1` |
| Seller | `A` |
| Third Party | `B` |
| Buyer | `C` |
| Shipping | `D` |
| Item (modal) | `3` + `[data-testid="modalBody"]` |
| Invoice Details | `4` |
| Payment | `5` |
| Custom | `6` |

Formula runs on Item + Invoice Details only.

## Excel helpers / utils

Do **not** modify `Helpers/excel/**` or `utils/excel/**` for this UI suite. UI files may call existing upload/generate APIs as-is for Edit/Copy when no dashboard row is reusable.

## Out of scope

- Uncommenting `OMN_UIInvoiceCreation_Manual_Test.spec.ts` and related disabled helpers
- Attachment (sidebar 7)
