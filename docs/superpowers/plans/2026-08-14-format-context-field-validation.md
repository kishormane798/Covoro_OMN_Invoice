# Format-context field validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Playwright field-validation cases for VATIN, UUID, Tax Rate, FX, tax-in-accounting-currency, and profit-margin due amount using real Oman values and invoice overlays — not `AAAA…`.

**Architecture:** Config rows describe field, overlay, value, and expected outcome. A helper clones `buildValidOmanFullTaxInvoiceRow()`, applies one overlay, generates Excel via `generateInvoiceFromSubmitData`, patches the target cell, then upload/error-assert like the existing spec.

**Tech Stack:** Playwright + TypeScript, existing Covoro Excel submit pipeline (`generateInvoiceFromSubmitData`, `patchInvoiceTextCellInFile`).

## Global Constraints

- Do not unskip `CONDITIONAL_LENGTH_SKIP` / `NUMERIC_CONTEXT_SKIP` AAAA loops.
- Do not duplicate conditional titles (IBR-003 prefix/non-digit, IBR-002 v4/garbage, tax rate empty/whitespace/`0`, FX empty / 8 decimals, IBR-034 empty accounting tax).
- Seller VATIN **accepted** must not overwrite worker identity; seller **error** values patch after generate.
- UUID positives use UUID v5 (`PRECEDING_INVOICE_UUID_SAMPLE`), never 108× `A`.
- Titles: `Verify Excel upload is accepted|returns an error file for Covoro {Section} – {Field} ({condition}).`
- Worker Excel under `testData/generated/excel/pw-<index>/`.
- No new conditional describes (IBR-058 / IBR-013 / IBR-002 already exist).

---

### Task 1: Config + helper + spec loop

**Files:**
- Create: `testData/FieldValidations/FormatContextFieldValidation.ts`
- Create: `Helpers/formatContextFieldValidationHelper.ts`
- Modify: `testData/FieldValidations/index.ts`
- Modify: `tests/OMN_FieldValidation_CovoroTemplate_Test.spec.ts` (append describes before closing of outer describe)

**Interfaces:**
- Consumes: `buildValidOmanFullTaxInvoiceRow`, `applyPartyIdentifiersByTxnType`, `generateInvoiceFromSubmitData`, `patchInvoiceTextCellInFile`, `uploadAndVerify`, `runErrorValidation`
- Produces: `formatContextFieldValidationCases`, `generateFormatContextFieldExcel(tc)`

- [x] **Step 1: Write config cases and spec loop**
- [x] **Step 2: Write helper overlays + generate/patch**
- [x] **Step 3: Export config from index.ts**
- [x] **Step 4: Verify cases load (39 rows via tsx import). Playwright `--list` needs login globalSetup — run locally with `--grep "Format / context"`.**
- [ ] **Step 5: Commit** — skip unless user asks (workspace is not a git repo)
