# Oman Submit Multi-Item Matrix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace UAE Excel-upload submit rows with a generated Oman matrix of 32 invoice types × 15 transaction types, each case a 4-line invoice (2 Goods + 2 Services, all 4 tax categories, OMR), living in the main framework spec + FieldValidations data.

**Architecture:** Generate `multiItemInvoiceCases` at import time from `buildValidOmanFullTaxInvoiceRow()` plus type/txn overlays that do not wipe the four tax lines. Thin Playwright spec in `tests/` loops the array into `runSubmitInvoiceMultiItemCase`. Skip `kishorsubmit` submit describes so `test:covoro` does not run UAE or duplicate the matrix.

**Tech Stack:** Playwright + TypeScript, existing submit helper (`generateInvoiceFromSubmitRows`), Oman masters in `Master.omnCore.ts` / `ConditionalValidation.ts`.

**Spec:** `docs/superpowers/specs/2026-08-21-oman-submit-multiitem-matrix-design.md`

## Global Constraints

- Do not run Playwright, npm, npx, or shell until the user says **run** / **execute** / **go ahead and run** (`wait-for-explicit-run`). Write/edit only.
- Do not commit unless the user explicitly asks (skip every Commit step until then).
- Main suite only: new spec at `tests/OMN_SubmitInvoice_MultiItem_CovoroTemplate_Test.spec.ts`; generator at `testData/FieldValidations/SubmitInvoiceMultiItem.ts`. Do not put the new 480-case suite under `kishorsubmit` or `sanitysubmit`.
- 32 × 15 = 480 cases. Do not shrink the matrix.
- Each case: exactly 4 lines — Goods/Standard, Goods/Zero rated, Services/Exempt, Services/outside scope. Not two cases for goods vs service.
- Keep mixed 2 Goods + 2 Services even for Import of Goods / Import of Services (RCM). Failures are accepted.
- OMR only. Empty `Currency Exchange Rate`. No AED/USD loop.
- Do not call `applyCnDnSelfBilledInvoiceType` (it overwrites transaction type).
- Do not call `buildInvoiceRowFromDrivers` as-is (profit-margin/export overlays force one tax category on the whole row).
- Do not hand-set calculated totals; `runSubmitInvoiceMultiItemCase` recalculates.
- Do not change `runSubmitInvoiceMultiItemCase` unless a row-shape bug appears.
- User already approved this file batch in the design spec (multi-file OK for this plan). Still prefer one file per agent turn when executing.

---

## File map

| File | Responsibility |
|------|----------------|
| Modify: `testData/FieldValidations/index.ts` | Export ConditionalValidation before SubmitInvoice* so the generator can import the helper without a circular undefined-constant load |
| Modify: `testData/FieldValidations/SubmitInvoiceMultiItem.ts` | Generate `multiItemInvoiceCases` (480). No compact JSON |
| Modify: `testData/FieldValidations/SubmitInvoice.ts` | `invoiceData = []` (no UAE re-export) |
| Create: `tests/OMN_SubmitInvoice_MultiItem_CovoroTemplate_Test.spec.ts` | Shape assert + delivery loop |
| Modify: `tests/kishorsubmit/OMN_SubmitInvoice_CovoroTemplate_Test.spec.ts` | `test.describe.skip` |
| Modify: `tests/kishorsubmit/OMN_SubmitInvoice_MultiItem_CovoroTemplate_Test.spec.ts` | `test.describe.skip` |
| Modify: `tests/kishorsubmit/testData/SubmitInvoice.ts` | Empty `invoiceData` |
| Delete: `tests/kishorsubmit/testData/SubmitInvoiceMultiItem.compact.json` | UAE compact dataset |
| Modify: `tests/kishorsubmit/testData/SubmitInvoiceMultiItem.ts` | Re-export FieldValidations generator |
| Modify: `tests/sanitysubmit/OMN_SubmitInvoice_Sanity_Test.spec.ts` | Use `multiItemInvoiceCases[0]` instead of `invoiceData[0]` |

---

### Task 1: Barrel export order (cycle-safe)

**Files:**
- Modify: `testData/FieldValidations/index.ts`

**Interfaces:**
- Consumes: existing barrel exports
- Produces: `ConditionalValidation` constants available on `import * as FV from "../testData/FieldValidations"` before `SubmitInvoiceMultiItem.ts` evaluates

`Helpers/conditionalValidationHelper.ts` does `import * as FV from "../testData/FieldValidations"`. If `SubmitInvoiceMultiItem.ts` imports that helper while the barrel is still evaluating `SubmitInvoiceMultiItem` *before* `ConditionalValidation`, `FV.TXN_FULL_TAX_INVOICE` is undefined.

- [ ] **Step 1: Move the two SubmitInvoice re-exports below ConditionalValidation**

Replace the whole file with:

```ts
export * from "./InvoiceIssueDateValidation";
export * from "./Min_max_field_validation";
export * from "./TestDataConfig";
export * from "./submitInvoiceExcelHeaderMap";
export * from "./ConditionalValidation";
export * from "./FormatContextFieldValidation";
export * from "./partyIdentifierCompanionLength";
export * from "./cl06OmBuyerSellerIdentifierScheme";
export * from "./SubmitInvoice";
export * from "./SubmitInvoiceMultiItem";
```

Keep every existing export. Only the order of `SubmitInvoice` / `SubmitInvoiceMultiItem` vs `ConditionalValidation` changes.

- [ ] **Step 2: Do not run anything**

Visual check: `ConditionalValidation` appears above `SubmitInvoiceMultiItem`.

- [ ] **Step 3: Commit** (skip unless the user asked)

```bash
git add testData/FieldValidations/index.ts
git commit -m "fix: export ConditionalValidation before submit datasets to avoid barrel cycle"
```

---

### Task 2: Oman multi-item generator

**Files:**
- Modify: `testData/FieldValidations/SubmitInvoiceMultiItem.ts` (replace the kishorsubmit re-export entirely)

**Interfaces:**
- Consumes: `buildValidOmanFullTaxInvoiceRow`, `applyOmanDeliveryOverlay`, `applyPartyIdentifiersByTxnType` from `Helpers/conditionalValidationHelper.ts`; labels/constants from `./ConditionalValidation` and `./Master.omnCore`
- Produces:
  - `export type MultiItemSubmitInvoiceCase = { name: string; rows: Array<Record<string, string>> }`
  - `export function isCreditOrDebitInvoiceType(invoiceTypeCode: string): boolean`
  - `export function buildOmanMultiItemSubmitCases(): MultiItemSubmitInvoiceCase[]`
  - `export const multiItemInvoiceCases: MultiItemSubmitInvoiceCase[]`

- [ ] **Step 1: Write the failing consumer first (next task’s spec).** In this task, replace the file with the generator below. After Task 3’s spec exists, the shape test is the failing/passing gate.

- [ ] **Step 2: Replace `testData/FieldValidations/SubmitInvoiceMultiItem.ts` with this implementation**

```ts
/**
 * Oman submit multi-item matrix (Excel header keys).
 * 32 invoice types × 15 transaction types; each case 4 lines
 * (2 Goods + 2 Services, all 4 Oman tax categories, OMR).
 */
import {
  buildValidOmanFullTaxInvoiceRow,
  applyOmanDeliveryOverlay,
  applyPartyIdentifiersByTxnType,
} from "../../Helpers/conditionalValidationHelper";
import * as FV from "./ConditionalValidation";
import {
  invoiceTypeCodeValidTestData,
  invoiceTransactionTypeValidTestData,
} from "./Master.omnCore";

export type MultiItemSubmitInvoiceCase = {
  name: string;
  rows: Array<Record<string, string>>;
};

function asStringRow(
  row: Record<string, string | null>
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(row)) {
    out[key] = value === null || value === undefined ? "" : String(value);
  }
  return out;
}

export function isCreditOrDebitInvoiceType(invoiceTypeCode: string): boolean {
  const n = invoiceTypeCode.trim().toLowerCase();
  return n.includes("credit note") || n.includes("debit note");
}

type LineDef = {
  lineId: string;
  itemType: string;
  taxCategory: string;
  taxRate: string;
  exemption: string;
  serviceTypeCode: string;
  hsCode: string;
};

const LINE_DEFS: readonly LineDef[] = [
  {
    lineId: "LINE-S-001",
    itemType: FV.ITEM_TYPE_GOODS,
    taxCategory: FV.STANDARD_TAX_CATEGORY_CODE,
    taxRate: FV.TAX_RATE_STANDARD_OMAN,
    exemption: "",
    serviceTypeCode: "",
    hsCode: FV.OMAN_HS_CODE_12,
  },
  {
    lineId: "LINE-S-002",
    itemType: FV.ITEM_TYPE_GOODS,
    taxCategory: FV.ZERO_RATED_TAX_CATEGORY_CODE,
    taxRate: FV.TAX_RATE_ZERO,
    exemption: FV.TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE,
    serviceTypeCode: "",
    hsCode: FV.OMAN_HS_CODE_12,
  },
  {
    lineId: "LINE-S-003",
    itemType: FV.ITEM_TYPE_SERVICES,
    taxCategory: FV.EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
    taxRate: "",
    exemption: FV.TAX_EXEMPTION_REASON_SAMPLE,
    serviceTypeCode: FV.SERVICE_TYPE_CODE_SAMPLE,
    hsCode: "",
  },
  {
    lineId: "LINE-S-004",
    itemType: FV.ITEM_TYPE_SERVICES,
    taxCategory: FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
    taxRate: "",
    exemption: "",
    serviceTypeCode: FV.SERVICE_TYPE_CODE_SAMPLE,
    hsCode: "",
  },
];

function applySubmitTxnExtras(
  row: Record<string, string | null>,
  txn: string
): Record<string, string | null> {
  let next: Record<string, string | null> = {
    ...row,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]: txn,
    [FV.INVOICE_CURRENCY_CODE_FIELD]: FV.OMAN_CURRENCY_OMR,
    [FV.SOURCE_CURRENCY_CODE_FIELD]: FV.OMAN_CURRENCY_OMR,
    [FV.EXCHANGE_RATE_FIELD]: "",
  };

  if (txn === FV.TXN_IMPORT_OF_GOODS) {
    next["Import date"] = next["Import date"] || "2026-06-15";
    next["Customs Declaration number"] =
      next["Customs Declaration number"] || "CUST-OMN-001";
    next["Incoterms"] = next["Incoterms"] || "Cost, Insurance, and Freight";
  }

  if (txn === FV.TXN_EXPORT_INVOICE) {
    next = applyOmanDeliveryOverlay(next, "export");
  }

  if (txn === FV.TXN_THIRD_PARTY_INVOICE) {
    next["Third Party Name"] = next["Third Party Name"] || "Oman Third Party LLC";
    next["Third Party VATIN"] =
      next["Third Party VATIN"] || FV.IBR_003_VALID_THIRD_PARTY_VATIN;
    next["Third Party Address Line 1"] =
      next["Third Party Address Line 1"] || "TP Building 1";
    next["Third Party Address Line 2"] =
      next["Third Party Address Line 2"] || "TP Street";
    next["Third Party Address Line 3"] =
      next["Third Party Address Line 3"] || "TP Area";
    next["Third Party City"] = next["Third Party City"] || "Muscat";
    next["Third Party Postal Code - PO Box Number"] =
      next["Third Party Postal Code - PO Box Number"] || "100";
    next["Third Party Country Code"] =
      next["Third Party Country Code"] || FV.OMAN_COUNTRY_CODE;
  }

  if (txn === FV.TXN_PREPAYMENT_INVOICE) {
    next["Prepayment invoice number"] =
      next["Prepayment invoice number"] || "PRE-OMN-001";
    next["Prepayment invoice UUID"] =
      next["Prepayment invoice UUID"] || FV.PRECEDING_INVOICE_UUID_SAMPLE;
  }

  if (txn === FV.TXN_SUMMARY_INVOICE || txn === FV.TXN_CONTINUOUS_SUPPLY) {
    next["Invoicing period start date"] =
      next["Invoicing period start date"] || "2026-01-01";
    next["Invoicing period end date"] =
      next["Invoicing period end date"] || "2026-01-31";
  }

  if (txn === FV.TXN_SPECIAL_ZONE_SUPPLIES) {
    next["Seller country subdivision code"] =
      FV.SPECIAL_ZONE_COUNTRY_SUBDIVISION_CL13;
    next["Buyer country subdivision code"] =
      FV.SPECIAL_ZONE_COUNTRY_SUBDIVISION_CL13;
  }

  return applyPartyIdentifiersByTxnType(next);
}

function applySubmitInvoiceTypeExtras(
  row: Record<string, string | null>,
  invoiceTypeCode: string
): Record<string, string | null> {
  const next: Record<string, string | null> = {
    ...row,
    [FV.INVOICE_TYPE_CODE_FIELD]: invoiceTypeCode,
  };
  if (!isCreditOrDebitInvoiceType(invoiceTypeCode)) {
    next[FV.CREDIT_DEBIT_NOTE_REASON_CODE_FIELD] = "";
    next[FV.PRECEDING_INVOICE_REFERENCE_FIELD] = "";
    next[FV.PRECEDING_INVOICE_ISSUE_DATE_FIELD] = "";
    next[FV.PRECEDING_INVOICE_UUID_FIELD] = "";
    return next;
  }
  next[FV.CREDIT_DEBIT_NOTE_REASON_CODE_FIELD] = FV.CREDIT_DEBIT_REASON_SAMPLE;
  next[FV.PRECEDING_INVOICE_REFERENCE_FIELD] = "PREV-OMN-001";
  next[FV.PRECEDING_INVOICE_ISSUE_DATE_FIELD] = "2026-06-01";
  next[FV.PRECEDING_INVOICE_UUID_FIELD] = FV.PRECEDING_INVOICE_UUID_SAMPLE;
  return next;
}

function overlayLine(
  common: Record<string, string>,
  def: LineDef,
  txn: string
): Record<string, string> {
  const line: Record<string, string> = {
    ...common,
    "Invoice line identifier": def.lineId,
    [FV.ITEM_TYPE_FIELD]: def.itemType,
    [FV.TAX_CATEGORY_FIELD]: def.taxCategory,
    [FV.INVOICED_ITEM_TAX_RATE_FIELD]: def.taxRate,
    [FV.TAX_EXEMPTION_REASON_CODE_FIELD]: def.exemption,
    [FV.TAX_EXEMPTION_REASON_TEXT_FIELD]: def.exemption,
    [FV.SERVICE_TYPE_CODE_FIELD]: def.serviceTypeCode,
    [FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD]: def.hsCode,
    [FV.PROFIT_MARGIN_ITEM_TYPE_CODE_FIELD]: "",
  };
  if (
    (txn === FV.TXN_PROFIT_MARGIN_INVOICE ||
      txn === FV.TXN_PROFIT_MARGIN_SELF_INVOICE) &&
    def.itemType === FV.ITEM_TYPE_GOODS
  ) {
    line[FV.PROFIT_MARGIN_ITEM_TYPE_CODE_FIELD] =
      FV.PROFIT_MARGIN_ITEM_TYPE_SAMPLE;
  }
  return line;
}

export function buildOmanMultiItemSubmitCases(): MultiItemSubmitInvoiceCase[] {
  const cases: MultiItemSubmitInvoiceCase[] = [];
  for (const typeEntry of invoiceTypeCodeValidTestData) {
    for (const txnEntry of invoiceTransactionTypeValidTestData) {
      const invoiceTypeCode = typeEntry.label;
      const txn = txnEntry.label;
      let common: Record<string, string | null> = {
        ...buildValidOmanFullTaxInvoiceRow(),
      };
      common = applySubmitTxnExtras(common, txn);
      common = applySubmitInvoiceTypeExtras(common, invoiceTypeCode);
      const commonStr = asStringRow(common);
      const rows = LINE_DEFS.map((def) => overlayLine(commonStr, def, txn));
      cases.push({
        name: `${invoiceTypeCode} | ${txn} | OMR | 4 items`,
        rows,
      });
    }
  }
  return cases;
}

export const multiItemInvoiceCases: MultiItemSubmitInvoiceCase[] =
  buildOmanMultiItemSubmitCases();
```

Rules baked into this file (do not “improve”):

- Do not force `Item Type` from Import of Goods / RCM on the common row; `overlayLine` always writes the four-line map.
- Do not force Zero rated / not-subject on all lines for Export or Profit Margin.
- After overlays, `Invoice Transaction Type Code` must still equal the matrix `txn`.

- [ ] **Step 3: Do not run Playwright.** If the user later says **run**, the shape test in Task 4 is the check.

- [ ] **Step 4: Commit** (skip unless asked)

```bash
git add testData/FieldValidations/SubmitInvoiceMultiItem.ts
git commit -m "feat: generate Oman 32x15 multi-item submit matrix"
```

---

### Task 3: Empty FieldValidations single-item UAE list

**Files:**
- Modify: `testData/FieldValidations/SubmitInvoice.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `export const invoiceData: Record<string, string>[] = []`

- [ ] **Step 1: Replace the file**

```ts
/** Single-item UAE submit rows removed. Oman submit is multi-item only. */
export const invoiceData: Record<string, string>[] = [];
```

- [ ] **Step 2: Commit** (skip unless asked)

```bash
git add testData/FieldValidations/SubmitInvoice.ts
git commit -m "chore: drop UAE single-item submit invoiceData from FieldValidations"
```

---

### Task 4: Main framework spec (shape + delivery)

**Files:**
- Create: `tests/OMN_SubmitInvoice_MultiItem_CovoroTemplate_Test.spec.ts`

**Interfaces:**
- Consumes: `multiItemInvoiceCases` from `../testData/FieldValidations/SubmitInvoiceMultiItem`; `runSubmitInvoiceMultiItemCase` from `../Helpers/submitInvoiceCaseHelper`; `test` from `../Src/baseTest`
- Produces: 1 no-page shape test + 480 delivery tests

- [ ] **Step 1: Create the spec**

```ts
import { expect } from "@playwright/test";
import { test } from "../Src/baseTest";
import * as FV from "../testData/FieldValidations";
import { multiItemInvoiceCases } from "../testData/FieldValidations/SubmitInvoiceMultiItem";
import { runSubmitInvoiceMultiItemCase } from "../Helpers/submitInvoiceCaseHelper";

const TEMPLATE = "Covoro";
const SUBMIT_INVOICE_TEST_TIMEOUT_MS = 8 * 60 * 1000;
const EXPECTED_CASE_COUNT =
  FV.OMAN_INVOICE_TYPES.length * FV.OMAN_TXN_TYPES.length;

test.describe(`Excel upload — submit invoice (multi-item) (${TEMPLATE})`, () => {
  test.describe.configure({ mode: "parallel" });

  test("Oman submit matrix shape: 32 types × 15 txns × 4 lines (2 Goods + 2 Services)", () => {
    expect(multiItemInvoiceCases.length).toBe(EXPECTED_CASE_COUNT);
    expect(EXPECTED_CASE_COUNT).toBe(480);
    const first = multiItemInvoiceCases[0];
    expect(first?.rows).toHaveLength(4);
    expect(first?.rows.map((r) => r["Item Type"])).toEqual([
      FV.ITEM_TYPE_GOODS,
      FV.ITEM_TYPE_GOODS,
      FV.ITEM_TYPE_SERVICES,
      FV.ITEM_TYPE_SERVICES,
    ]);
    expect(first?.rows.map((r) => r["Tax Category"])).toEqual([
      FV.STANDARD_TAX_CATEGORY_CODE,
      FV.ZERO_RATED_TAX_CATEGORY_CODE,
      FV.EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
    ]);
    for (const tc of multiItemInvoiceCases) {
      expect(tc.rows).toHaveLength(4);
      expect(tc.rows[0]?.["Invoice Currency Code"]).toBe(FV.OMAN_CURRENCY_OMR);
      expect(tc.rows[0]?.["Currency Exchange Rate"] ?? "").toBe("");
      expect(tc.rows[0]?.["Invoice Type Code"]).toBeTruthy();
      expect(tc.rows[0]?.["Invoice Transaction Type Code"]).toBeTruthy();
      for (const row of tc.rows) {
        expect(row["Invoice Type Code"]).toBe(tc.rows[0]?.["Invoice Type Code"]);
        expect(row["Invoice Transaction Type Code"]).toBe(
          tc.rows[0]?.["Invoice Transaction Type Code"]
        );
      }
    }
  });

  for (const tc of multiItemInvoiceCases) {
    const first = tc.rows[0] ?? {};
    test(
      `Excel upload · ${TEMPLATE} | Submit multi-item | ${first["Invoice Type Code"] ?? ""} | ${first["Invoice Transaction Type Code"] ?? ""} | OMR | 4 items (2 Goods + 2 Services) → delivered`,
      async ({ page }) => {
        test.setTimeout(SUBMIT_INVOICE_TEST_TIMEOUT_MS);
        await runSubmitInvoiceMultiItemCase(page, tc.rows);
      }
    );
  }
});
```

Import `multiItemInvoiceCases` from the **file path**, not only the barrel, so the shape test still works if barrel order is wrong.

- [ ] **Step 2: Run shape test only — skip until the user says `run`**

```bash
npx playwright test tests/OMN_SubmitInvoice_MultiItem_CovoroTemplate_Test.spec.ts --project=chromium --grep "matrix shape"
```

Expected when run: PASS (`multiItemInvoiceCases.length === 480`). Do not run the 480 delivery tests unless the user asks.

- [ ] **Step 3: Commit** (skip unless asked)

```bash
git add tests/OMN_SubmitInvoice_MultiItem_CovoroTemplate_Test.spec.ts
git commit -m "test: add Oman multi-item submit matrix spec"
```

---

### Task 5: Skip kishorsubmit UAE submit specs

**Files:**
- Modify: `tests/kishorsubmit/OMN_SubmitInvoice_CovoroTemplate_Test.spec.ts`
- Modify: `tests/kishorsubmit/OMN_SubmitInvoice_MultiItem_CovoroTemplate_Test.spec.ts`

**Why two files:** both match `tests/**/*CovoroTemplate*.spec.ts` and would still run UAE (or duplicate 480 Oman cases after Task 7).

**Interfaces:**
- Consumes: existing `test` import
- Produces: describes that Playwright skips

- [ ] **Step 1: Single-item spec — change the describe to skip**

In `tests/kishorsubmit/OMN_SubmitInvoice_CovoroTemplate_Test.spec.ts`, change only the outer describe:

```ts
test.describe.skip(`Excel upload — submit invoice (${TEMPLATE})`, () => {
```

Leave the inner loops as they are. Do not add Oman cases here.

- [ ] **Step 2: Multi-item spec — change the describe to skip**

In `tests/kishorsubmit/OMN_SubmitInvoice_MultiItem_CovoroTemplate_Test.spec.ts`:

```ts
test.describe.skip(`Excel upload — submit invoice (multi-item) (${TEMPLATE})`, () => {
```

- [ ] **Step 3: Commit** (skip unless asked)

```bash
git add tests/kishorsubmit/OMN_SubmitInvoice_CovoroTemplate_Test.spec.ts tests/kishorsubmit/OMN_SubmitInvoice_MultiItem_CovoroTemplate_Test.spec.ts
git commit -m "test: skip kishorsubmit UAE submit describes"
```

---

### Task 6: Delete UAE kishorsubmit single-item rows

**Files:**
- Modify: `tests/kishorsubmit/testData/SubmitInvoice.ts` (replace the ~15k-line UAE array)

**Interfaces:**
- Produces: `export const invoiceData: Record<string, string>[] = []`

- [ ] **Step 1: Replace the file**

```ts
/** UAE single-item submit rows removed. Oman matrix is in testData/FieldValidations. */
export const invoiceData: Record<string, string>[] = [];
```

- [ ] **Step 2: Commit** (skip unless asked)

```bash
git add tests/kishorsubmit/testData/SubmitInvoice.ts
git commit -m "chore: remove UAE kishorsubmit invoiceData"
```

---

### Task 7: Delete compact JSON; re-export Oman cases from kishorsubmit path

**Files:**
- Delete: `tests/kishorsubmit/testData/SubmitInvoiceMultiItem.compact.json`
- Modify: `tests/kishorsubmit/testData/SubmitInvoiceMultiItem.ts`

**Interfaces:**
- Produces: same `multiItemInvoiceCases` symbol as FieldValidations (re-export)

- [ ] **Step 1: Replace `tests/kishorsubmit/testData/SubmitInvoiceMultiItem.ts`**

```ts
/** Re-export Oman generator. kishorsubmit multi-item spec is skipped. */
export {
  multiItemInvoiceCases,
  buildOmanMultiItemSubmitCases,
  isCreditOrDebitInvoiceType,
} from "../../../testData/FieldValidations/SubmitInvoiceMultiItem";
export type { MultiItemSubmitInvoiceCase } from "../../../testData/FieldValidations/SubmitInvoiceMultiItem";
```

- [ ] **Step 2: Delete the compact JSON file**

Delete `tests/kishorsubmit/testData/SubmitInvoiceMultiItem.compact.json`. Do not leave an empty JSON array behind.

- [ ] **Step 3: Commit** (skip unless asked)

```bash
git add tests/kishorsubmit/testData/SubmitInvoiceMultiItem.ts
git rm tests/kishorsubmit/testData/SubmitInvoiceMultiItem.compact.json
git commit -m "chore: drop UAE multi-item compact JSON; re-export Oman matrix"
```

---

### Task 8: Sanity uses first generated multi-item case

**Files:**
- Modify: `tests/sanitysubmit/OMN_SubmitInvoice_Sanity_Test.spec.ts`

**Why:** Task 6 empties `invoiceData`, so `rowAt(0)` and `expect(invoiceData.length).toBeGreaterThan(0)` throw. Do not copy the 480-case suite into sanitysubmit.

**Interfaces:**
- Consumes: `multiItemInvoiceCases` (already imported from `./testData/SubmitInvoiceMultiItem`, which after Task 7 is the Oman generator)
- Produces: single-item sanity + bulk sanity use `multiItemInvoiceCases[0].rows[0]`; multi-item sanity uses `multiItemInvoiceCases[0].rows`

- [ ] **Step 1: Replace `rowAt` and the fixture assert; drop the USD sanity loop**

Keep the file in `tests/sanitysubmit/`. Change these pieces only:

1. Remove `import { invoiceData } from "./testData/SubmitInvoice";` if nothing else needs it.

2. Replace `rowAt`:

```ts
function rowAt(index: number): Record<string, string> {
  const tc = multiItemInvoiceCases[index];
  const row = tc?.rows?.[0];
  if (!row) {
    throw new Error(`Submit sanity: multiItemInvoiceCases[${index}].rows[0] is missing`);
  }
  return row;
}
```

3. Delete the entire `test.describe("Other than AED — single Commercial Invoice (USD)", …)` block (OMR only).

4. Rename the AED describe title to OMR:

```ts
test.describe("OMR — first generated multi-item header row", () => {
```

5. Change the fixture test:

```ts
test("Post-deploy sanity fixtures are present", () => {
  expect(AED_ONE_PER_TYPE_INDICES).toEqual([0]);
  expect(MULTI_ONE_PER_TYPE_INDICES).toEqual([0]);
  expect(multiItemInvoiceCases.length).toBeGreaterThan(0);
  expect(multiItemInvoiceCases[0]?.rows.length).toBe(4);
});
```

Leave `runSubmitInvoiceCase` / `runBulkSubmitInvoiceCase` / `runSubmitInvoiceMultiItemCase` call sites as they are (they now receive Oman OMR rows).

- [ ] **Step 2: Commit** (skip unless asked)

```bash
git add tests/sanitysubmit/OMN_SubmitInvoice_Sanity_Test.spec.ts
git commit -m "test: point submit sanity at Oman multi-item seed"
```

---

## Self-review vs spec

| Spec requirement | Task |
|------------------|------|
| 32 × 15 generated cases | Task 2 |
| 4 lines, 2 Goods + 2 Services, 4 tax cats | Task 2 `LINE_DEFS` + Task 4 shape test |
| OMR only, no FX | Task 2 extras + Task 4 assert + Task 8 drop USD |
| Mixed lines even for Import/RCM | Task 2: no item-type rewrite on txn extras |
| CN/DN preceding without overwriting txn | Task 2 `applySubmitInvoiceTypeExtras` |
| Txn extras without wiping tax lines | Task 2 `applySubmitTxnExtras` + `overlayLine` |
| Spec in `tests/` not kishorsubmit | Task 4 |
| Empty FieldValidations `invoiceData` | Task 3 |
| Skip kishorsubmit describes | Task 5 |
| Remove UAE kishorsubmit data + compact JSON | Tasks 6–7 |
| Sanity does not crash | Task 8 |
| Barrel cycle | Task 1 |

No TBD. Signatures: `buildOmanMultiItemSubmitCases(): MultiItemSubmitInvoiceCase[]` is defined in Task 2 and re-exported in Task 7.
