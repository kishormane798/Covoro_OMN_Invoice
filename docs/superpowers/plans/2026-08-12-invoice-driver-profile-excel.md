# Invoice Driver Profile Excel — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Approach A helper + CLI so Excel is built from Invoice Transaction Type Code, Invoice Type Code, and Tax Category (valid seed + dependents + optional field override).

**Architecture:** New focused helper wraps `buildValidOmanFullTaxInvoiceRow` and existing CN/self-billed helpers; writes via `generateInvoiceFromSubmitData`. No changes to live specs or pack helpers in this setup.

**Tech Stack:** TypeScript, existing `Helpers/` + `utils/invoiceExcel.ts`, `npx ts-node` CLI.

## Global Constraints

- Submit header keys only (not camelCase formula payload)
- Do not hardcode colliding invoice numbers (generator stamps unique #)
- Reuse Oman labels from `ConditionalValidation.ts` / Master
- One new helper file + one script; do not refactor pack helpers yet

---

## File map

| File | Responsibility |
|------|----------------|
| `Helpers/invoiceDriverProfileHelper.ts` | Drivers type, row builder, Excel generate |
| `scripts/generate_excel_from_drivers.ts` | CLI smoke + optional Downloads copy |
| Spec (already written) | `docs/superpowers/specs/2026-08-12-invoice-driver-profile-excel-design.md` |

---

### Task 1: Driver profile helper

**Files:**
- Create: `Helpers/invoiceDriverProfileHelper.ts`

- [x] Add `InvoiceDriverProfile` type with the three driver fields
- [x] Implement `applyTaxCategoryDependents`, `applyTransactionTypeDependents`, `applyInvoiceTypeDependents`
- [x] Implement `buildInvoiceRowFromDrivers(drivers, fieldOverrides?)`
- [x] Implement `generateExcelFromDrivers(drivers, fieldOverrides?)` → `generateInvoiceFromSubmitData`
- [x] Export defaults: Full Tax + Commercial + Standard rate

### Task 2: CLI smoke script

**Files:**
- Create: `scripts/generate_excel_from_drivers.ts`

- [x] Parse optional `--txn`, `--type`, `--tax`, and `--override Field=Value` / `--blank Field`
- [x] Call `generateExcelFromDrivers`
- [x] Print JSON with path + driver sample; copy to Downloads like `generate_valid_oman_invoice.ts`
- [x] Run default smoke: `npx ts-node scripts/generate_excel_from_drivers.ts`

### Task 3: Verify

- [x] Default run exits 0 and prints `filePath`
- [x] One alternate profile (e.g. Credit note + Full Tax + Standard) builds without throw
