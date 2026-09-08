# Shared UI / Excel Invoice Number Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every test that mints a unique Invoice Number (UI `invNum` or Excel Invoice Number cell) calls `buildUniqueSubmitInvoiceNumber()` so UI and Excel share one parallel-safe format.

**Architecture:** Do not change `buildUniqueSubmitInvoiceNumber` in `utils/excel/invoiceExcel.ts`. UI document baseline imports and calls it. Specs that currently call `buildDynamicInvoiceNumber` switch to the same function. Drop Playwright `testInfo.testId` plumbing (`uniqueKey`) that only existed for the old `UI-{testId}` builder.

**Tech Stack:** Playwright + TypeScript E2E helpers. Generator lives in `utils/excel/invoiceExcel.ts` (`INV-OM-{YYYYMMDD}{HHmmss}{worker}{seq}`).

## Global Constraints

- Do **not** modify `buildUniqueSubmitInvoiceNumber` itself (Excel pipelines already call it).
- Do **not** edit `utils/excel/invoiceExcel.ts`.
- GitNexus: `ensureDocumentBaseline` is **CRITICAL** hub — change only the invoice-number string and `uniqueKey` parameters.
- Min/max Invoice Number values, preceding invoice refs (`INV-PREV-*`), and prepayment invoice numbers stay as test fixtures.
- `wait-for-explicit-run`: do not run Playwright, npm, or tsc until the user says **run**.
- Do not commit unless the user explicitly asks.
- Leave `buildOmnUiInvoiceNumber` and `buildDynamicInvoiceNumber` in place unused (follow-up delete).

**Spec:** `docs/superpowers/specs/2026-09-07-shared-ui-excel-invoice-number-design.md`

---

## File map

| File | Role |
|------|------|
| `Helpers/ui/omnUiInvoiceHelper.ts` | Fill `invNum` with shared generator; remove `uniqueKey` |
| Six `tests/KISHOR_UI/OMN_UIInvoice_*_Test.spec.ts` | Stop passing `testInfo.testId` |
| `tests/OMN_FieldValidation_CovoroTemplate_Test.spec.ts` | Issue Date unique # via shared generator |
| `tests/OMN_FieldValidation_SimplifiedTemplate_Test.spec.ts` | Same |

---

### Task 1: UI helper uses the Excel invoice-number generator

**Files:**
- Modify: `Helpers/ui/omnUiInvoiceHelper.ts`

**Interfaces:**
- Consumes: `buildUniqueSubmitInvoiceNumber(): string` from `utils/excel/invoiceExcel.ts`
- Produces: `ensureDocumentBaseline(invoice, entry, excludeInputIds)` with no `uniqueKey`; exported `runOmnUiMinMaxCase`, `runOmnUiExcelPartyIdentityCase`, `runOmnUiConditionalScenario`, `runOmnUiFormulaScenario` drop the last `uniqueKey?: string` argument

- [ ] **Step 1: Replace the UI invoice-number import**

In `Helpers/ui/omnUiInvoiceHelper.ts`, add:

```ts
import { buildUniqueSubmitInvoiceNumber } from "../../utils/excel/invoiceExcel";
```

Remove `buildOmnUiInvoiceNumber` from the `testData/ui/omnUiInvoiceValidation` import list.

- [ ] **Step 2: Fill invNum from the shared generator**

Change `ensureDocumentBaseline` to drop `uniqueKey` and call the Excel generator:

```ts
async function ensureDocumentBaseline(
  invoice: OMN_UIInvoiceManualPage,
  entry: OmnUiEntry,
  excludeInputIds: Set<string>
): Promise<void> {
  if (!excludeInputIds.has("invNum")) {
    const current = await invoice.readInputValue("document", "invNum");
    if (entry !== "edit" || !current) {
      await invoice.replaceInput("document", "invNum", buildUniqueSubmitInvoiceNumber());
    }
  }
  // ... invTxnType / invType unchanged ...
}
```

Keep Create / empty-Edit / Copy fill rules. Do not change txn type or invoice type baseline.

- [ ] **Step 3: Strip uniqueKey from every helper in this file**

Remove the `uniqueKey?: string` parameter and every argument that passed it. Exact signatures after the change:

```ts
async function ensureSectionBaseline(
  invoice: OMN_UIInvoiceManualPage,
  section: OmnUiSection,
  entry: OmnUiEntry,
  excludeInputIds: Set<string>
): Promise<void>

async function ensureThisSectionBaseline(
  invoice: OMN_UIInvoiceManualPage,
  section: OmnUiSection,
  entry: OmnUiEntry,
  excludeInputIds: Set<string>,
  knownTypes?: { invoiceTypeCode?: string; invoiceTransactionTypeCode?: string }
): Promise<void>

export async function runOmnUiMinMaxCase(
  page: Page,
  entry: OmnUiEntry,
  rule: OmnUiFieldRule,
  variant: OmnUiMinMaxVariant
): Promise<void>

export async function runOmnUiExcelPartyIdentityCase(
  page: Page,
  entry: OmnUiEntry,
  identityCase: OmnUiExcelPartyIdentityCase
): Promise<void>

export async function runOmnUiConditionalScenario(
  page: Page,
  entry: OmnUiEntry,
  scenario: OmnUiConditionalScenario
): Promise<void>

export async function runOmnUiFormulaScenario(
  page: Page,
  entry: OmnUiEntry,
  scenario: InvoiceFormulaScenario
): Promise<void>
```

Call-site pattern inside the helper (no fourth/fifth uniqueKey):

```ts
await ensureDocumentBaseline(invoice, entry, new Set());
await ensureDocumentBaseline(invoice, entry, excludeInputIds);
await ensureSectionBaseline(invoice, rule.section, entry, new Set());
await ensureThisSectionBaseline(
  invoice,
  section,
  entry,
  excludeIdsForConditional(scenario, section),
  {
    invoiceTypeCode: scenario.invoiceTypeCode,
    invoiceTransactionTypeCode: scenario.invoiceTransactionTypeCode,
  }
);
```

`grep uniqueKey Helpers/ui/omnUiInvoiceHelper.ts` must return no matches. `grep buildOmnUiInvoiceNumber Helpers/ui/omnUiInvoiceHelper.ts` must return no matches.

- [ ] **Step 4: Do not run tests yet**

Wait for the user to say **run**. Ready check: helper compiles in the editor (no unused `uniqueKey`, import of `buildUniqueSubmitInvoiceNumber` resolves).

---

### Task 2: UI specs stop passing Playwright testId

**Files:**
- Modify: `tests/KISHOR_UI/OMN_UIInvoice_Create_Test.spec.ts`
- Modify: `tests/KISHOR_UI/OMN_UIInvoice_Edit_Test.spec.ts`
- Modify: `tests/KISHOR_UI/OMN_UIInvoice_Copy_Test.spec.ts`
- Modify: `tests/KISHOR_UI/OMN_UIInvoice_Conditional_Create_Test.spec.ts`
- Modify: `tests/KISHOR_UI/OMN_UIInvoice_Conditional_Edit_Test.spec.ts`
- Modify: `tests/KISHOR_UI/OMN_UIInvoice_Conditional_Copy_Test.spec.ts`

**Interfaces:**
- Consumes: Task 1 exported `runOmnUi*` signatures without `uniqueKey`
- Produces: specs that only pass `page`, `ENTRY`, and scenario/rule data

- [ ] **Step 1: Drop testInfo from Create / Edit / Copy field+formula specs**

In each of Create, Edit, Copy, change the three call patterns:

```ts
async ({ page }) => {
  await runOmnUiExcelPartyIdentityCase(page, ENTRY, identityCase);
}
```

```ts
async ({ page }) => {
  await runOmnUiMinMaxCase(page, ENTRY, rule, variant);
}
```

```ts
async ({ page }) => {
  await runOmnUiFormulaScenario(page, ENTRY, scenario);
}
```

Do not change titles, timeouts, or `ENTRY`.

- [ ] **Step 2: Drop testInfo from Conditional Create / Edit / Copy specs**

In each Conditional spec:

```ts
test(
  omnUiConditionalDisplayTitle(ENTRY, scenario.title),
  async ({ page }) => {
    await runOmnUiConditionalScenario(page, ENTRY, scenario);
  }
);
```

- [ ] **Step 3: Confirm no leftover testId wiring**

`grep testInfo.testId tests/KISHOR_UI` must return no matches. Opening-editor tests that already use `async ({ page })` stay unchanged.

- [ ] **Step 4: Do not run tests yet**

Wait for **run**. TypeScript excess-argument errors on `runOmnUi*` should be gone.

---

### Task 3: Field-validation Issue Date specs use the shared generator

**Files:**
- Modify: `tests/OMN_FieldValidation_CovoroTemplate_Test.spec.ts`
- Modify: `tests/OMN_FieldValidation_SimplifiedTemplate_Test.spec.ts`

**Interfaces:**
- Consumes: `buildUniqueSubmitInvoiceNumber(): string` from `utils/excel/invoiceExcel.ts`
- Produces: Issue Date tests that write Invoice Number with the same generator as submit/UI

- [ ] **Step 1: Import the shared generator in both field-validation specs**

Add to each spec (with the other helper imports):

```ts
import { buildUniqueSubmitInvoiceNumber } from "../utils/excel/invoiceExcel";
```

- [ ] **Step 2: Replace buildDynamicInvoiceNumber at the Issue Date loop**

Covoro (`tests/OMN_FieldValidation_CovoroTemplate_Test.spec.ts`, Invoice Issue Date describe) and Simplified (same describe) currently:

```ts
const invoiceNumber = FV.buildDynamicInvoiceNumber(scenario.invoicePrefix);
```

Change to:

```ts
const invoiceNumber = buildUniqueSubmitInvoiceNumber();
```

Leave `generateOmanIssueDateExcel(invoiceNumber, scenario.issueDateValue, scenario.issueDateFormat)` as-is. Leave the too-long Invoice Number case on `buildInvoiceNumber(tooLong, 65)` unchanged.

- [ ] **Step 3: Confirm leftover builders**

`grep buildDynamicInvoiceNumber tests` must return no matches. `grep buildOmnUiInvoiceNumber tests Helpers` must return no matches except the unused export in `testData/ui/omnUiInvoiceValidation.ts`.

- [ ] **Step 4: Do not run tests yet**

When the user says **run**, suggested checks (do not start them in this plan):

```bash
npx playwright test tests/KISHOR_UI/OMN_UIInvoice_Create_Test.spec.ts --project=chromium-ui --grep "Opening the editor"
npx playwright test tests/OMN_FieldValidation_CovoroTemplate_Test.spec.ts --grep "Invoice Issue Date in correct YYYY-MM-DD"
```

---

## Self-review

1. **Spec coverage:** UI generator swap → Task 1. uniqueKey + six UI specs → Tasks 1–2. Issue Date unique numbers → Task 3. Excel generator function itself untouched. Min/max and preceding refs untouched.
2. **Placeholders:** none.
3. **Types:** exported `runOmnUi*` drop `uniqueKey`; specs drop `testInfo.testId`; Issue Date uses `buildUniqueSubmitInvoiceNumber()`.
