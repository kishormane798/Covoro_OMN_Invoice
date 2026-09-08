# Oman UI 1:1 Excel catalog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. REQUIRED BACKGROUND: `wait-for-explicit-run` — do not run Playwright / npm until the user says **run**. Do not commit unless the user explicitly asks. REQUIRED: GitNexus `impact({target, direction: "upstream"})` before editing a function. REQUIRED: `add-ui-invoice-test` + `improve-testcase-title` when adding or rewriting a UI title. One Excel `describe` converted from skip→run per agent turn after Task 5.

**Goal:** Every active Covoro Excel field, formula, and conditional row appears in the six Oman Create / Edit / Copy UI specs; the form selects or types (never uploads); undriveable rows are skipped with a named Allure reason.

**Architecture:** Excel arrays stay the source of truth. A data-only catalog (`OmnUiCatalogRow`) lists every Excel `describe` group as `run` or `skip`. Specs loop the catalog. Helpers in `Helpers/ui/` select/type on `OMN_UIInvoiceManualPage`. Existing min/max and mapped conditionals stay; new groups start as skip stubs, then one group per turn gains a runner.

**Tech Stack:** Playwright + TypeScript (`chromium-ui`), `Src/baseTest.ts` `test`, Allure via `test.skip(true, reason)`.

## Global Constraints

- Excel data files remain the source of truth. UI does not invent extra rows or opposite polarities.
- UI actions are `selectAutocomplete` / `replaceInput` / date pickers only. No Excel generate/upload in these six specs.
- Create uses **Save**. Edit and Copy use **Update**.
- Specs stay thin data loops. No `uiTestTitle` helper.
- Do not modify `Helpers/excel/**`, `utils/excel/**`, or the Excel specs.
- `tests/KISHOR_UI/OMN_UIInvoice_Attachment_Test.spec.ts` is out of scope.
- Commented-out Excel `describe` blocks (txn mutual-exclusion IBR-138–149) stay out.
- Do not replay full HS / UOM / currency master lists on the form.
- Do not run Playwright until the user says **run**.
- Do not commit unless the user explicitly asks.
- One Excel `describe` group converted from `skip` to `run` per agent turn after titles + skip stubs.

## File map

| File | Responsibility |
|---|---|
| `testData/ui/omnUiInvoiceValidation.ts` | Title builders, catalog types, field/formula/conditional catalog rows |
| `tests/KISHOR_UI/OMN_UIInvoice_Create_Test.spec.ts` | Create field + formula loops |
| `tests/KISHOR_UI/OMN_UIInvoice_Edit_Test.spec.ts` | Edit field + formula loops |
| `tests/KISHOR_UI/OMN_UIInvoice_Copy_Test.spec.ts` | Copy field + formula loops |
| `tests/KISHOR_UI/OMN_UIInvoice_Conditional_Create_Test.spec.ts` | Create conditional loops |
| `tests/KISHOR_UI/OMN_UIInvoice_Conditional_Edit_Test.spec.ts` | Edit conditional loops |
| `tests/KISHOR_UI/OMN_UIInvoice_Conditional_Copy_Test.spec.ts` | Copy conditional loops |
| `Helpers/ui/omnUiInvoiceHelper.ts` | `runOmnUi*` select/type runners |
| `pageObjects/OMN_UIInvoiceManualPage.ts` | Locators only, after snapshot/MCP |
| `docs/superpowers/specs/2026-09-08-ui-excel-1to1-catalog-design.md` | Approved spec (already committed) |

If `omnUiInvoiceValidation.ts` exceeds ~2000 lines after skip stubs, split catalogs into `testData/ui/omnUiFieldCatalog.ts`, `omnUiFormulaCatalog.ts`, `omnUiConditionalCatalog.ts` and re-export from `omnUiInvoiceValidation.ts`. Do not split in Task 1.

---

### Task 1: Catalog types (data only)

**Files:**
- Modify: `testData/ui/omnUiInvoiceValidation.ts` (append after `OmnUiEntry` types, around line 141)

**Interfaces:**
- Consumes: `OmnUiEntry`, existing `OmnUiSection`
- Produces:
  - `OmnUiCatalogMode = "run" | "skip"`
  - `OmnUiCatalogRow` (below)
  - `OMN_UI_SKIP` string constants
  - `omnUiCatalogRowsFor(rows, entry, group)`

- [ ] **Step 1: GitNexus impact**

Run impact on `omnUiMinMaxWhatEntered` (read-only this task). Report callers. Do not edit helpers yet.

- [ ] **Step 2: Add types and skip-reason constants**

Append:

```ts
export type OmnUiCatalogMode = "run" | "skip";

export const OMN_UI_SKIP = {
  noControl: (field: string) => `No Create Invoice control for ${field}.`,
  masterList:
    "UI does not replay the full Excel master list; one representative value is used on the form.",
  calculated: "This amount is calculated; the form does not let you enter it.",
  createOnly: "Create-only: Edit/Copy cannot set this the same way.",
  partyIdentity: "Excel worker identity is covered by the party-identity UI cases.",
  twentyLine:
    "UI does not replay the 20-line Excel sweep; two lines cover multi-line entry.",
} as const;

export type OmnUiCatalogKind =
  | "pending"
  | "issueDate"
  | "numeric"
  | "partyIdentifierCompanion"
  | "cl06"
  | "dropdownInvalid"
  | "exemptionCompanion"
  | "formatContext"
  | "formulaNegative"
  | "formulaProfitMargin"
  | "formulaNonOmr"
  | "formulaTwoLine"
  | "formulaMismatch";

export type OmnUiCatalogRow = {
  group: string;
  title: string;
  entries?: readonly OmnUiEntry[];
  mode: OmnUiCatalogMode;
  skipReason?: string;
  kind: OmnUiCatalogKind;
  field?: string;
  excelTitle?: string;
};

export function omnUiCatalogRowsFor(
  rows: readonly OmnUiCatalogRow[],
  entry: OmnUiEntry,
  group: string
): OmnUiCatalogRow[] {
  return rows.filter(
    (row) =>
      row.group === group && (!row.entries || row.entries.includes(entry))
  );
}
```

Every `mode === "skip"` row must set `skipReason` from `OMN_UI_SKIP` (or the disabled-on-entry pattern `{Field} is disabled on {entry}.`). Reject rows that skip with an empty reason.

- [ ] **Step 3: Do not run Playwright**

Wait until the user says **run**. This task is types only.

---

### Task 2: Phase 1 titles

**Files:**
- Modify: `testData/ui/omnUiInvoiceValidation.ts` (`omnUiMinMaxWhatEntered` ~686–702, `omnUiConditionalDisplayTitle` ~1668–1683)
- Modify: `tests/KISHOR_UI/OMN_UIInvoice_Create_Test.spec.ts` (min/max + formula `test(` titles)
- Modify: `tests/KISHOR_UI/OMN_UIInvoice_Edit_Test.spec.ts` (same)
- Modify: `tests/KISHOR_UI/OMN_UIInvoice_Copy_Test.spec.ts` (same)

**Interfaces:**
- Consumes: `OmnUiEntry`, `OmnUiMinMaxVariant`, `OmnUiFieldRule`, `omnUiMinMaxExpectsError`
- Produces:
  - `omnUiMinMaxWhatEntered(variant, rule): string` (Excel length wording)
  - `omnUiMinMaxDisplayTitle(entry, variant, rule): string`
  - `omnUiFormulaDisplayTitle(entry, name, expectsError): string`
  - `omnUiConditionalDisplayTitle` copy-invoice branch (Given/When/Then)

- [ ] **Step 1: GitNexus impact**

`impact({target: "omnUiMinMaxWhatEntered", direction: "upstream"})` and `omnUiConditionalDisplayTitle`. Expected callers: the three field/formula specs and three conditional specs.

- [ ] **Step 2: Replace min/max title builders**

Replace `charsPhrase` / `omnUiMinMaxWhatEntered` with:

```ts
function lengthNoun(n: number): string {
  return n === 1 ? "character" : "characters";
}

export function omnUiMinMaxWhatEntered(
  variant: OmnUiMinMaxVariant,
  rule: OmnUiFieldRule
): string {
  switch (variant) {
    case "min":
      return `${rule.field} at minimum length (${rule.min} ${lengthNoun(rule.min)})`;
    case "max":
      return `${rule.field} at maximum length (${rule.max} characters)`;
    case "belowMin":
      return rule.belowMin === 0
        ? `An empty ${rule.field}`
        : `${rule.field} of ${rule.belowMin} characters`;
    case "aboveMax":
      return `${rule.field} of ${rule.aboveMax} characters`;
  }
}

export function omnUiMinMaxDisplayTitle(
  entry: OmnUiEntry,
  variant: OmnUiMinMaxVariant,
  rule: OmnUiFieldRule
): string {
  const expectsError = omnUiMinMaxExpectsError(rule, variant);
  const persist =
    expectsError
      ? "the form should show an error"
      : entry === "create"
        ? "Save should succeed"
        : "Update should succeed";
  return `${omnUiMinMaxWhatEntered(variant, rule)} — ${persist}. (${rule.field})`;
}

export function omnUiFormulaDisplayTitle(
  entry: OmnUiEntry,
  name: string,
  expectsError = false
): string {
  const when = expectsError
    ? "When calculated totals do not match"
    : "When calculated totals match";
  const then = expectsError
    ? "Then the form should show an error."
    : entry === "create"
      ? "Then Save should succeed."
      : "Then Update should succeed.";
  return `Given ${name} — ${when} — ${then} (${name})`;
}
```

In `omnUiConditionalDisplayTitle`, replace the copy-invoice branch:

```ts
if (sourceTitle === COPY_INVOICE_NUMBER_EMPTY_SOURCE) {
  return "Given a copied invoice — When invoice number is left empty — Then Update should succeed. (Invoice Number)";
}
```

Leave the upload→Save/Update replacements as they are. Do not edit `ConditionalValidation.ts`.

- [ ] **Step 3: Wire the three field/formula specs**

Create spec min/max loop (Edit/Copy: same with `ENTRY` already `"edit"` / `"copy"`):

```ts
test(
  omnUiMinMaxDisplayTitle(ENTRY, variant, rule),
  async ({ page }) => {
    await runOmnUiMinMaxCase(page, ENTRY, rule, variant);
  }
);
```

Formula loop:

```ts
test(
  omnUiFormulaDisplayTitle(ENTRY, scenario.name),
  async ({ page }) => {
    await runOmnUiFormulaScenario(page, ENTRY, scenario);
  }
);
```

Import `omnUiMinMaxDisplayTitle` and `omnUiFormulaDisplayTitle`. Remove the inline `` `${omnUiMinMaxWhatEntered(...)} — ${outcome}. (${rule.field})` `` and `` `Calculated totals should match the formula. (${scenario.name})` ``. Do not change party-identity titles or `Opening the editor should show the invoice form.`

- [ ] **Step 4: Verify titles (only after the user says run)**

```bash
npx playwright test tests/KISHOR_UI/OMN_UIInvoice_Create_Test.spec.ts --list
```

Expected: min/max names like `Invoice Number at minimum length (1 character) — Save should succeed. (Invoice Number)`; formula names like `Given Base Minimum values — When calculated totals match — Then Save should succeed. (Base Minimum values)`. No `Excel upload`, pipes, or `error file`.

---

### Task 3: Field skip-stub catalog + spec loops

**Files:**
- Modify: `testData/ui/omnUiInvoiceValidation.ts` (add `OMN_UI_FIELD_CATALOG_GROUPS` + `OMN_UI_FIELD_CATALOG`)
- Modify: `tests/KISHOR_UI/OMN_UIInvoice_Create_Test.spec.ts`
- Modify: `tests/KISHOR_UI/OMN_UIInvoice_Edit_Test.spec.ts`
- Modify: `tests/KISHOR_UI/OMN_UIInvoice_Copy_Test.spec.ts`
- Modify: `Helpers/ui/omnUiInvoiceHelper.ts` (add `runOmnUiFieldCatalogRow` that throws if `kind !== "pending"` and mode is run; skip is handled in the spec)

**Interfaces:**
- Consumes: `OmnUiCatalogRow`, `OMN_UI_SKIP`, Excel group titles from `OMN_FieldValidation_CovoroTemplate_Test.spec.ts`
- Produces: `OMN_UI_FIELD_CATALOG_GROUPS`, `OMN_UI_FIELD_CATALOG`, `runOmnUiFieldCatalogRow(page, entry, row)`

Do **not** duplicate groups already executed by min/max + party-identity:

- Invoice Number — valid length
- Invoice Number — invalid values
- Mandatory / Optional / Conditional fields — valid/invalid length

- [ ] **Step 1: Add one skip row per remaining Excel field describe**

`group` must equal the Excel `test.describe` string exactly:

```ts
export const OMN_UI_FIELD_CATALOG_GROUPS = [
  "Invoice Issue Date",
  "Party identifier — companion length",
  "CL-06-OM — Scheme Identifier and textual code masters",
  "Numeric fields — valid digit count",
  "Numeric fields — invalid digit count",
  "Invoice Currency dropdown",
  "Dropdown — valid values",
  "Dropdown — valid HS codes",
  "Dropdown — valid tax exemption reason (Zero rated)",
  "Dropdown — invalid values",
  "Dropdown — invalid tax exemption reason (charges/allowances companions)",
  "Tax exemption reason — code / text companion",
  "Format / context fields — VATIN, UUID, rate, FX, profit margin",
] as const;

export const OMN_UI_FIELD_CATALOG: OmnUiCatalogRow[] = [
  {
    group: "Invoice Issue Date",
    title: "Invoice Issue Date scenarios pending UI date entry. (Invoice Issue Date)",
    mode: "skip",
    skipReason: OMN_UI_SKIP.noControl("Invoice Issue Date picker runner"),
    kind: "pending",
    field: "Invoice Issue Date",
  },
  {
    group: "Party identifier — companion length",
    title: "Party identifier companion length pending UI entry. (Seller identifier)",
    mode: "skip",
    skipReason: OMN_UI_SKIP.noControl("Party identifier companion runner"),
    kind: "pending",
  },
  {
    group: "CL-06-OM — Scheme Identifier and textual code masters",
    title: "CL-06 scheme and textual code pending UI select. (Scheme identifier)",
    mode: "skip",
    skipReason: OMN_UI_SKIP.masterList,
    kind: "pending",
  },
  {
    group: "Numeric fields — valid digit count",
    title: "Numeric digit-count cases pending UI entry. (numeric)",
    mode: "skip",
    skipReason: OMN_UI_SKIP.noControl("numeric digit runner"),
    kind: "pending",
  },
  {
    group: "Numeric fields — invalid digit count",
    title: "Numeric invalid digit-count cases pending UI entry. (numeric)",
    mode: "skip",
    skipReason: OMN_UI_SKIP.noControl("numeric digit runner"),
    kind: "pending",
  },
  {
    group: "Invoice Currency dropdown",
    title: "Invoice Currency master list. (Invoice Currency Code)",
    mode: "skip",
    skipReason: OMN_UI_SKIP.masterList,
    kind: "pending",
    field: "Invoice Currency Code",
  },
  {
    group: "Dropdown — valid values",
    title: "Valid dropdown master lists. (dropdown)",
    mode: "skip",
    skipReason: OMN_UI_SKIP.masterList,
    kind: "pending",
  },
  {
    group: "Dropdown — valid HS codes",
    title: "HS code master list. (Item classification identifier)",
    mode: "skip",
    skipReason: OMN_UI_SKIP.masterList,
    kind: "pending",
    field: "Item classification identifier",
  },
  {
    group: "Dropdown — valid tax exemption reason (Zero rated)",
    title: "Zero rated exemption reason master list. (Tax exemption reason code)",
    mode: "skip",
    skipReason: OMN_UI_SKIP.masterList,
    kind: "pending",
    field: "Tax exemption reason code",
  },
  {
    group: "Dropdown — invalid values",
    title: "Invalid dropdown values pending UI select. (dropdown)",
    mode: "skip",
    skipReason: OMN_UI_SKIP.noControl("invalid dropdown runner"),
    kind: "pending",
  },
  {
    group: "Dropdown — invalid tax exemption reason (charges/allowances companions)",
    title: "Invalid charge/allowance exemption reason pending UI select. (Tax exemption reason - charges)",
    mode: "skip",
    skipReason: OMN_UI_SKIP.noControl("exemption companion dropdown runner"),
    kind: "pending",
  },
  {
    group: "Tax exemption reason — code / text companion",
    title: "Exemption code and text companion pending UI entry. (Tax exemption reason code)",
    mode: "skip",
    skipReason: OMN_UI_SKIP.noControl("exemption companion runner"),
    kind: "pending",
  },
  {
    group: "Format / context fields — VATIN, UUID, rate, FX, profit margin",
    title: "Format/context fields pending UI entry. (format)",
    mode: "skip",
    skipReason: OMN_UI_SKIP.noControl("format context runner"),
    kind: "pending",
  },
];
```

Placeholder titles above are skip stubs. When a group is converted (Tasks 6+), replace the single stub with one catalog row per Excel test title, using the field/min-max recipe (`{What we entered} — Save should succeed. ({Field})`).

Seller/Buyer VATIN and electronic-address **length** Excel rows stay skipped with `OMN_UI_SKIP.partyIdentity` when those groups are expanded; do not add them in this stub task.

- [ ] **Step 2: Add helper**

In `omnUiInvoiceHelper.ts`:

```ts
export async function runOmnUiFieldCatalogRow(
  page: Page,
  entry: OmnUiEntry,
  row: OmnUiCatalogRow
): Promise<void> {
  if (row.mode === "skip") {
    throw new Error(`runOmnUiFieldCatalogRow called for skip row: ${row.group}`);
  }
  throw new Error(`No UI runner for field catalog kind ${row.kind} (${row.group})`);
}
```

- [ ] **Step 3: Loop catalog in Create / Edit / Copy specs** after the existing formula describe:

```ts
for (const group of OMN_UI_FIELD_CATALOG_GROUPS) {
  test.describe(`Create Invoice UI — ${group}`, () => {
    for (const row of omnUiCatalogRowsFor(OMN_UI_FIELD_CATALOG, ENTRY, group)) {
      test(row.title, async ({ page }) => {
        if (row.mode === "skip") {
          test.skip(true, row.skipReason ?? "missing skip reason");
        }
        await runOmnUiFieldCatalogRow(page, ENTRY, row);
      });
    }
  });
}
```

Edit/Copy: same with their `ENTRY`. Import `OMN_UI_FIELD_CATALOG_GROUPS`, `OMN_UI_FIELD_CATALOG`, `omnUiCatalogRowsFor`, `runOmnUiFieldCatalogRow`.

- [ ] **Step 4: List tests only after the user says run**

```bash
npx playwright test tests/KISHOR_UI/OMN_UIInvoice_Create_Test.spec.ts --list
```

Expected: each `OMN_UI_FIELD_CATALOG_GROUPS` name appears; skipped tests still listed.

---

### Task 4: Formula skip-stub catalog

**Files:**
- Modify: `testData/ui/omnUiInvoiceValidation.ts`
- Modify: `Helpers/ui/omnUiInvoiceHelper.ts` (`runOmnUiFormulaCatalogRow`)
- Modify: the three field/formula specs (loop after field catalog)

**Interfaces:**
- Consumes: `invoiceFormulaTestData`, `invoiceNegativeFormulaTestData`, `OMN_UI_SKIP`
- Produces: `OMN_UI_FORMULA_CATALOG_GROUPS`, `OMN_UI_FORMULA_CATALOG`, `runOmnUiFormulaCatalogRow`

Existing `OMN_UI_FORMULA_SCENARIOS` loop stays (positive single-line OMR). Do not duplicate those names in the skip catalog.

- [ ] **Step 1: Add groups matching Excel formula describes**

```ts
export const OMN_UI_FORMULA_CATALOG_GROUPS = [
  "Invalid inputs",
  "Calculated field mismatch",
  "Calculated field tolerance",
  "Exempt VAT category taxable amount (ALIGNED-IBRP-E-08-OM)",
  "Not subject VAT category taxable amount (ALIGNED-IBRP-O-08-OM)",
  "Standard VAT category taxable amount (ALIGNED-IBRP-S-08-OM)",
  "Zero rated VAT category taxable amount (ALIGNED-IBRP-Z-08-OM)",
  "Profit Margin Total Amount Due (IBR-082-OM)",
  "Item net price and line net formulas (IBR-075-OM / IBR-071-OM)",
  "Multi-line (2 lines) — same tax category",
  "Multi-line (20 lines) — positive (OMR)",
] as const;
```

One skip stub per group:

| group | skipReason | later kind |
|---|---|---|
| Invalid inputs | `OMN_UI_SKIP.noControl("negative formula runner")` | `formulaNegative` |
| Calculated field mismatch | `OMN_UI_SKIP.calculated` | `formulaMismatch` |
| Calculated field tolerance | `OMN_UI_SKIP.calculated` | `formulaMismatch` |
| ALIGNED-IBRP-E/O/S/Z-08-OM | `OMN_UI_SKIP.calculated` | stay skip unless taxable amount is typed |
| Profit Margin Total Amount Due (IBR-082-OM) | `OMN_UI_SKIP.noControl("profit margin formula runner")` | `formulaProfitMargin` |
| IBR-075/071 | `OMN_UI_SKIP.noControl("line net formula runner")` | `formulaNegative` / existing keys |
| Multi-line (2 lines) | `OMN_UI_SKIP.noControl("two-line Add Item runner")` | `formulaTwoLine` |
| Multi-line (20 lines) | `OMN_UI_SKIP.twentyLine` | stay skip |

Titles: `Given {group} — When calculated totals match — Then Save should succeed. ({group})` for skip stubs (Create). Spec uses `omnUiFormulaDisplayTitle(ENTRY, group, false)` if you store `excelTitle` as the group name; otherwise hardcode Create wording in the catalog and let Edit/Copy specs pass `ENTRY` into a small `omnUiCatalogDisplayTitle(entry, row)` that swaps Save/Update.

Add:

```ts
export function omnUiCatalogDisplayTitle(entry: OmnUiEntry, row: OmnUiCatalogRow): string {
  if (entry === "create") return row.title;
  return row.title
    .replaceAll("Then Save should succeed.", "Then Update should succeed.")
    .replaceAll(" — Save should succeed.", " — Update should succeed.");
}
```

Use `omnUiCatalogDisplayTitle(ENTRY, row)` in all catalog spec loops (including Task 3 — update those loops in this task if still using `row.title` raw).

- [ ] **Step 2: Helper**

```ts
export async function runOmnUiFormulaCatalogRow(
  page: Page,
  entry: OmnUiEntry,
  row: OmnUiCatalogRow
): Promise<void> {
  if (row.mode === "skip") {
    throw new Error(`runOmnUiFormulaCatalogRow called for skip row: ${row.group}`);
  }
  throw new Error(`No UI runner for formula catalog kind ${row.kind} (${row.group})`);
}
```

- [ ] **Step 3: Spec loop** (Create shown; Edit/Copy same)

```ts
for (const group of OMN_UI_FORMULA_CATALOG_GROUPS) {
  test.describe(`Create Invoice UI — ${group}`, () => {
    for (const row of omnUiCatalogRowsFor(OMN_UI_FORMULA_CATALOG, ENTRY, group)) {
      test(omnUiCatalogDisplayTitle(ENTRY, row), async ({ page }) => {
        if (row.mode === "skip") {
          test.skip(true, row.skipReason ?? "missing skip reason");
        }
        await runOmnUiFormulaCatalogRow(page, ENTRY, row);
      });
    }
  });
}
```

- [ ] **Step 4: List tests only after the user says run**

---

### Task 5: Conditional skip-stub catalog (unmapped groups only)

**Files:**
- Modify: `testData/ui/omnUiInvoiceValidation.ts`
- Modify: the three conditional specs
- Modify: `Helpers/ui/omnUiInvoiceHelper.ts` (`runOmnUiUnmappedConditionalRow` or reuse `runOmnUiConditionalScenario` only for `mode === "run"`)

**Interfaces:**
- Consumes: active Excel describes in `OMN_ConditionalValidation_CovoroTemplate_Test.spec.ts`
- Produces: `OMN_UI_CONDITIONAL_PENDING_GROUPS`, `OMN_UI_CONDITIONAL_PENDING_CATALOG`

Do **not** stub groups already in `OMN_UI_CONDITIONAL_SCENARIOS_ALL` (VAT category rate, exemption, preceding, exchange rate, import of goods, seller VAT/address, third party, buyer id/VATIN/address, deliver-to, industrial classification, prepayment, buyer identifier scheme, item attribute, credit/debit reason, invoicing period, copy invoice number).

- [ ] **Step 1: Pending groups (exact Excel describe titles)**

```ts
export const OMN_UI_CONDITIONAL_PENDING_GROUPS = [
  "Tax accounting currency amount required (ibr-053)",
  "Amount decimal precision (IBR-DEC-03-OM)",
  "VAT rate numeric format (IBR-046-OM)",
  "Item Type required (IBR-078-OM)",
  "Classification identifier for goods lines (IBR-079-OM)",
  "HS Code from ROP Customs list for goods lines (IBR-174-OM)",
  "Profit Margin Self-Invoice (IBR-086/087-OM)",
  "Summary Invoice period (IBR-037-OM)",
  "Summary Invoice period same calendar month (IBR-036-OM)",
  "Document allowance/charge VAT category and exemption (IBR-062/064-OM)",
  "Document level charge reason code (IBR-042-OM)",
  "Export Deliver to country (IBR-014-OM)",
  "Export Service Type (IBR-155-OM / CL-12)",
  "Export deliver country must not be Oman (IBR-012-OM)",
  "Export supporting documents (IBR-013-OM)",
  "Special Zone country subdivision (IBR-150-OM)",
  "Special Zone seller identifier (IBR-151-OM)",
  "Self-billed / RCM Buyer VATIN (IBR-017-OM)",
  "Seller / Buyer / Third Party VATIN pattern (IBR-003-OM)",
  "Self-billed / RCM Buyer country must be Oman (IBR-020-OM)",
  "Self-billed document transaction constraint (IBR-177-OM)",
  "Prepayment cannot combine with Summary, Deemed, or Profit Margin Self-Invoice (IBR-176-OM)",
  "Document charge/allowance category rate (IBR-045/047/094-OM)",
  "VAT breakdown category presence (ALIGNED-IBRP-E/O/S/Z-01-OM)",
  "Line item VAT amount required (IBR-038-OM)",
  "Line VAT amount zero for Exempt (IBR-039-OM)",
  "Line VAT amount zero for Not subject and Zero rated (IBR-054/077-OM)",
  "Exempt VAT category tax amount must be zero (ALIGNED-IBRP-E-09-OM)",
  "Not subject VAT category tax amount must be zero (ALIGNED-IBRP-O-09-OM)",
  "Zero rated VAT category tax amount must be zero (ALIGNED-IBRP-Z-09-OM)",
  "Seller identifier + scheme mandatory (IBR-007-OM)",
  "HS code must be 12 digits (IBR-080-OM)",
  "Document allowance exemption reason codelist (IBR-CL-05-OM / IBR-CL-10-OM)",
  "RCM seller country must not be Oman (IBR-160-OM)",
  "Profit Margin preceding invoice (IBR-175-OM)",
  "Profit Margin HS prefix ban (IBR-091-OM)",
  "Profit Margin item type code (CL-11-OM)",
  "Buyer/Seller identifier scheme and textual code (PARTY-ID)",
  "Amounts and quantities non-negative except rounding (IBR-137-OM)",
] as const;
```

Permanent skip reasons at stub time:

- IBR-038, IBR-039, IBR-054/077, ALIGNED-IBRP-E/O/Z-09-OM → `OMN_UI_SKIP.calculated`
- HS Code from ROP (IBR-174-OM) → `OMN_UI_SKIP.masterList`
- All other pending groups → `OMN_UI_SKIP.noControl("{group} runner")` until converted

Each stub `title` is the Excel `scenario.title` if you expand to one row per scenario; for this task one stub per group is enough. Conversion tasks expand to one row per Excel scenario using `omnUiConditionalDisplayTitle(entry, scenario.title)`.

- [ ] **Step 2: Conditional spec loop** after the existing section loops:

```ts
for (const group of OMN_UI_CONDITIONAL_PENDING_GROUPS) {
  test.describe(`Create Invoice UI — ${group}`, () => {
    for (const row of omnUiCatalogRowsFor(
      OMN_UI_CONDITIONAL_PENDING_CATALOG,
      ENTRY,
      group
    )) {
      test(omnUiCatalogDisplayTitle(ENTRY, row), async ({ page }) => {
        if (row.mode === "skip") {
          test.skip(true, row.skipReason ?? "missing skip reason");
        }
      });
    }
  });
}
```

Do not call `runOmnUiConditionalScenario` for pending skip stubs.

- [ ] **Step 3: List tests only after the user says run**

---

### Task 6: Convert Invoice Issue Date (skip → run)

**Files:**
- Modify: `testData/ui/omnUiInvoiceValidation.ts` (`OMN_UI_FIELD_CATALOG` rows for `"Invoice Issue Date"`)
- Modify: `Helpers/ui/omnUiInvoiceHelper.ts` (`runOmnUiIssueDateCase`)
- Modify: `runOmnUiFieldCatalogRow` switch
- Locators: only if `invDate` is missing — `pageObjects/OMN_UIInvoiceManualPage.ts` after snapshot/MCP

**Interfaces:**
- Consumes: `createInvoiceIssueDateScenarios()` from `testData/FieldValidations/InvoiceIssueDateValidation.ts`
- Produces: `runOmnUiIssueDateCase(page, entry, scenario)`

- [ ] **Step 1: Expand catalog to one row per Excel issue-date scenario**

```ts
import { createInvoiceIssueDateScenarios } from "../FieldValidations/InvoiceIssueDateValidation";

const issueDateRows: OmnUiCatalogRow[] = createInvoiceIssueDateScenarios().map((s) => {
  const outcome = s.shouldError
    ? "the form should show an error"
    : "Save should succeed";
  return {
    group: "Invoice Issue Date",
    title: `Invoice Issue Date in ${s.name.trim()} — ${outcome}. (Invoice Issue Date)`,
    mode: "run",
    kind: "issueDate",
    field: "Invoice Issue Date",
    excelTitle: s.name,
  };
});
```

Use `omnUiCatalogDisplayTitle` so Edit/Copy swap Save→Update. Store `shouldError` by keeping `excelTitle === scenario.name` and looking up the scenario in the helper (do not invent dates).

- [ ] **Step 2: Runner (select/type only)**

```ts
export async function runOmnUiIssueDateCase(
  page: Page,
  entry: OmnUiEntry,
  scenarioName: string
): Promise<void> {
  const scenario = createInvoiceIssueDateScenarios().find((s) => s.name === scenarioName);
  if (!scenario) throw new Error(`Unknown issue date scenario ${scenarioName}`);
  const invoice = await openOmnUiInvoiceEditor(page, entry);
  await ensureSectionBaseline(invoice, "document", entry, new Set());
  const value =
    typeof scenario.issueDateValue === "string"
      ? scenario.issueDateValue
      : String(scenario.issueDateValue);
  await invoice.replaceInput("document", "invDate", value, ["issueDate", "invIssueDate"]);
  if (scenario.shouldError) {
    const err = await invoice.readFieldError("document", "invDate", ["issueDate"]);
    expect(err.length).toBeGreaterThan(0);
    return;
  }
  await invoice.clickSectionCommit("document", entry);
}
```

Use the existing section commit method name from `OMN_UIInvoiceManualPage` (Save vs Update). If the date picker will not accept a typed ISO string, stop and add a page-object date helper after MCP snapshot — do not upload Excel.

- [ ] **Step 3: Dispatch**

```ts
if (row.kind === "issueDate") {
  await runOmnUiIssueDateCase(page, entry, row.excelTitle ?? "");
  return;
}
```

- [ ] **Step 4: Run only after the user says run**

```bash
npx playwright test tests/KISHOR_UI/OMN_UIInvoice_Create_Test.spec.ts --grep "Invoice Issue Date"
```

---

### Task 7: Convert numeric digit-count (skip → run)

**Files:**
- Modify: `testData/ui/omnUiInvoiceValidation.ts`
- Modify: `Helpers/ui/omnUiInvoiceHelper.ts`

**Interfaces:**
- Consumes: `fieldValidationNumeric` / `numericFieldConfigs` from `Helpers/excel/fieldValidationSpecSupport.ts` **imported only for the field list and min/max numbers** — do not call Excel generate functions
- Produces: `runOmnUiNumericCase(page, entry, field, digits, expectsError)`

- [ ] **Step 1: One catalog row per Excel numeric title** (valid min/max/empty/negative and invalid aboveMax). Title recipe:

```
{Field} at minimum value ({min}) — Save should succeed. ({Field})
{Field} of {aboveMax} digits — the form should show an error. ({Field})
```

`mode: "run"` only when `CV_FIELD_LOC` or `OMN_UI_FIELD_RULES` has an `inputId`. Else keep `mode: "skip"` with `OMN_UI_SKIP.noControl(field)`.

- [ ] **Step 2: Runner types the digit string** via `replaceInput` on that `inputId`. Assert helper text vs section Save/Update. Never `generateOmanNumericFieldExcel`.

- [ ] **Step 3: Run after user says run** — grep `Numeric fields`.

---

### Task 8: Convert party-identifier companion length

**Files:** `omnUiInvoiceValidation.ts`, `omnUiInvoiceHelper.ts`

**Interfaces:**
- Consumes: `testData/FieldValidations/partyIdentifierCompanionLength.ts` scenarios
- Produces: `runOmnUiPartyIdentifierCompanionCase`

- [ ] Map each Excel companion scenario to select scheme (autocomplete) and type identifier length. Skip VATIN/electronic rows with `OMN_UI_SKIP.partyIdentity`.
- [ ] Runner: `selectAutocomplete` + `replaceInput` only.
- [ ] Run after user says run.

---

### Task 9: Convert CL-06 scheme / textual code

**Files:** `omnUiInvoiceValidation.ts`, `omnUiInvoiceHelper.ts`

- [ ] Do **not** loop the full master. One representative valid select per field (`Scheme identifier`, `Buyer Identifier (textual code)`, seller equivalents) as `mode: "run"`. Keep a skip row with `OMN_UI_SKIP.masterList` for the rest of the master.
- [ ] Runner: `selectAutocomplete` on existing dropdown `inputId`s from `OMN_UI_FIELD_RULES`.
- [ ] Run after user says run.

---

### Task 10: Convert invalid dropdown values

**Files:** `omnUiInvoiceValidation.ts`, `omnUiInvoiceHelper.ts`

**Interfaces:**
- Consumes: `dropdownInvalidOnCovoro` **labels only** (do not generate Excel)
- Produces: `runOmnUiInvalidDropdownCase(page, entry, field, label)`

- [ ] One catalog row per Excel invalid option title: `{Field} with invalid value "{label}" — the form should show an error. ({Field})`.
- [ ] Runner: type/select that label in the autocomplete. If MUI ignores invalid text, assert the field does not accept it or shows helper text. Skip a field with `OMN_UI_SKIP.noControl(field)` if there is no input.
- [ ] Charge/allowance exemption invalid companions: same runner with those `inputId`s (`docLevelCharges[0].exemptionRsn`, allowances).
- [ ] Run after user says run.

---

### Task 11: Convert tax exemption code/text companion

**Files:** `omnUiInvoiceValidation.ts`, `omnUiInvoiceHelper.ts`

- [ ] Expand Excel companion scenarios into catalog rows. Select Tax Category, select/type reason code, type reason text. `kind: "exemptionCompanion"`.
- [ ] Reuse patterns already in `runOmnUiConditionalScenario` exemption kind where possible; do not upload.
- [ ] Run after user says run.

---

### Task 12: Convert format/context fields

**Files:** `omnUiInvoiceValidation.ts`, `omnUiInvoiceHelper.ts`, `pageObjects/OMN_UIInvoiceManualPage.ts` only if MCP shows a missing control

- [ ] For each Excel format/context case: if `inputId` exists, type the VATIN/UUID/rate/FX/profit-margin value (`mode: "run"`). If the control is calculated or missing, `mode: "skip"` with `OMN_UI_SKIP.calculated` or `noControl`.
- [ ] Titles follow the field recipe with Save/Update.
- [ ] Run after user says run.

---

### Task 13: Convert negative formula rows

**Files:** `omnUiInvoiceValidation.ts`, `omnUiInvoiceHelper.ts`

**Interfaces:**
- Consumes: `invoiceNegativeFormulaTestData`
- Produces: dispatch `kind: "formulaNegative"` → `runOmnUiFormulaScenario` then expect a form error **or** a dedicated `runOmnUiNegativeFormulaScenario` that fills the same keys and asserts `readFieldError`

- [ ] Replace the "Invalid inputs" stub with one row per negative scenario:

```ts
title: omnUiFormulaDisplayTitle("create", row.name, true)
mode: "run"
kind: "formulaNegative"
excelTitle: row.name
```

- [ ] Fill via existing `OMN_UI_ITEM_FORMULA_KEYS` / `OMN_UI_INVOICE_FORMULA_KEYS` (`replaceInput` / select tax category). Do not patch Excel cells.
- [ ] Run after user says run.

---

### Task 14: Convert profit-margin and non-OMR formula

**Files:** `omnUiInvoiceValidation.ts`, `omnUiInvoiceHelper.ts`

- [ ] Profit margin: `selectAutocomplete` txn to Profit Margin Invoice / Self-Invoice, fill keys, read `OMN_UI_PROFIT_MARGIN_TOTAL_DUE.inputIds`. Use `OMN_UI_PROFIT_MARGIN_FORMULA_SCENARIOS`.
- [ ] Non-OMR: select Invoice Currency / Tax Accounting Currency to a non-OMR value, fill keys, read `OMN_UI_TAX_IN_ACCOUNTING_CURRENCY_AMOUNT.inputIds` when visible. Use `OMN_UI_NON_OMR_FORMULA_SCENARIOS`.
- [ ] Leave E/O/S/Z-08 catalog rows as `skip` + `OMN_UI_SKIP.calculated` unless MCP shows a typed taxable-amount control.
- [ ] Run after user says run.

---

### Task 15: Convert 2-line formula; keep 20-line skipped

**Files:** `pageObjects/OMN_UIInvoiceManualPage.ts` (only if Add Item / second-row edit needs a new locator — MCP first), `omnUiInvoiceHelper.ts`, catalog

**Interfaces:**
- Produces: `runOmnUiTwoLineFormulaScenario(page, entry, scenario)`

- [ ] Runner: commit first line (`clickItemCommit`), `openItemEditor(false)` so **Add Item** opens a second line, fill the same keys, commit, read invoice totals.
- [ ] Expand 2-line Excel valid/invalid/mismatch-if-editable rows to `kind: "formulaTwoLine"` `mode: "run"`.
- [ ] 20-line group stays `mode: "skip"` with `OMN_UI_SKIP.twentyLine`.
- [ ] Mismatch/tolerance: if total inputs are disabled, keep `OMN_UI_SKIP.calculated`. If MCP shows they are editable, type the wrong amount and expect a form error (`kind: "formulaMismatch"`).
- [ ] Run after user says run.

---

### Task 16+: Convert one pending conditional Excel describe per turn

Work **in the order listed in `OMN_UI_CONDITIONAL_PENDING_GROUPS`**. Each turn:

**Files:** `omnUiInvoiceValidation.ts` (expand stub → one row per Excel scenario), `omnUiInvoiceHelper.ts` (new `OmnUiConditionalKind` + branch in `runOmnUiConditionalScenario` **or** move rows into `OMN_UI_CONDITIONAL_SCENARIOS_ALL`), locators only after MCP.

**Rule:** map from the named array in `ConditionalValidation.ts`. Select/type driving fields. Titles via `omnUiConditionalDisplayTitle`. Do not invent opposite polarities.

| Turn | Excel describe | Excel array | UI action | Skip instead if |
|---|---|---|---|---|
| 16 | Tax accounting currency amount (ibr-053) | `TAX_ACCOUNTING_CURRENCY_AMOUNT_SCENARIOS` | type amount if editable | calculated |
| 17 | Amount decimal precision | `AMOUNT_DECIMAL_PRECISION_SCENARIOS` | type amount | no control |
| 18 | VAT rate numeric format (IBR-046-OM) | `VAT_RATE_FORMAT_SCENARIOS` | type Tax Rate | no control |
| 19 | Item Type required (IBR-078-OM) | `ITEM_TYPE_REQUIRED_SCENARIOS` | select Item Type | — |
| 20 | Classification identifier goods (IBR-079-OM) | `GOODS_CLASSIFICATION_SCENARIOS` | select/type classification | — |
| 21 | HS from ROP (IBR-174-OM) | `HS_CODE_FROM_ROP_LIST_SCENARIOS` | keep masterList skip; one representative HS run | full list |
| 22 | Profit Margin Self-Invoice | `PROFIT_MARGIN_SELF_INVOICE_SCENARIOS` | select txn + tax category | — |
| 23 | Summary period IBR-037 | `SUMMARY_INVOICE_PERIOD_SCENARIOS` | select txn + period dates | — |
| 24 | Summary same month IBR-036 | `SUMMARY_PERIOD_SAME_CALENDAR_MONTH_SCENARIOS` | period dates | — |
| 25 | Doc allowance/charge VAT | `DOCUMENT_ALLOWANCE_CHARGE_VAT_SCENARIOS` | select vat category charges/allowances | — |
| 26 | Doc charge reason IBR-042 | `DOCUMENT_CHARGE_REASON_SCENARIOS` | select/type reason | — |
| 27 | Export deliver country IBR-014 | `EXPORT_DELIVERY_SCENARIOS` | select txn + shipping country | — |
| 28 | Export Service Type | `EXPORT_SERVICE_TYPE_SCENARIOS` | select Service Type Code | — |
| 29 | Export country not Oman IBR-012 | `EXPORT_DELIVER_COUNTRY_FORBIDDEN_OM_SCENARIOS` | select country | — |
| 30 | Export supporting docs IBR-013 | `EXPORT_SUPPORTING_DOCUMENT_SCENARIOS` | type supporting ref/UUID | — |
| 31 | Special Zone subdivision | `SPECIAL_ZONE_COUNTRY_SUBDIVISION_SCENARIOS` | select subdivision | — |
| 32 | Special Zone seller | `SPECIAL_ZONE_SELLER_SCENARIOS` | type seller identifier + select scheme | — |
| 33 | Self-billed / RCM Buyer VATIN | `SELF_BILLED_BUYER_VAT_SCENARIOS` | select type/txn + type buyer VATIN | — |
| 34 | VATIN pattern IBR-003 | `VATIN_PATTERN_SCENARIOS` | type VATIN | — |
| 35 | Self-billed / RCM buyer country | `SELF_BILLED_RCM_BUYER_COUNTRY_SCENARIOS` | select buyer country | — |
| 36 | Self-billed txn constraint IBR-177 | `SELF_BILLED_TXN_CONSTRAINT_SCENARIOS` | select invoice type + txn | — |
| 37 | Prepayment combine IBR-176 | `PREPAYMENT_TXN_EXCLUSION_SCENARIOS` | select txn pair | — |
| 38 | Doc charge/allowance rate | `DOCUMENT_ALLOWANCE_CHARGE_RATE_SCENARIOS` | type/select rate on charge line | — |
| 39 | VAT breakdown presence | `VAT_BREAKDOWN_CATEGORY_PRESENCE_SCENARIOS` | select tax category | — |
| 40 | Seller identifier + scheme IBR-007 | `SELLER_IDENTIFIER_SCHEME_SCENARIOS` | select scheme + type identifier | — |
| 41 | HS 12 digits IBR-080 | `HS_CODE_LENGTH_SCENARIOS` | type classification identifier | — |
| 42 | Allowance exemption codelist | `IBR_CL_05_DOC_ALLOWANCE_SCENARIOS` | select exemption on allowances | — |
| 43 | RCM seller country IBR-160 | `SELLER_COUNTRY_RCM_SCENARIOS` | select seller country | — |
| 44 | Profit Margin preceding IBR-175 | `PROFIT_MARGIN_PRECEDING_SCENARIOS` (rows not already mapped) | type preceding ref/UUID; `entries: ["create"]` if Edit/Copy cannot | createOnly |
| 45 | Profit Margin HS prefix IBR-091 | `PROFIT_MARGIN_HS_PREFIX_SCENARIOS` | type HS | — |
| 46 | Profit Margin item type CL-11 | `PROFIT_MARGIN_ITEM_TYPE_SCENARIOS` | select `profitMarginItemType` | — |
| 47 | PARTY-ID | `PARTY_IDENTIFIER_COMPANION_SCENARIOS` | select scheme + textual code (extend `mapUiBuyerIdentifierScheme`) | — |
| 48 | IBR-137 non-negative | `AMOUNT_QUANTITY_SIGN_SCENARIOS` | type negative in editable amount fields | calculated/read-only |

Leave IBR-038/039/E09/O09/Z09 as calculated skips unless MCP shows a typed VAT amount.

Each of these turns must:

```ts
// expand: one OmnUiCatalogRow or OmnUiConditionalScenario per Excel scenario
// title: omnUiConditionalDisplayTitle(ENTRY, scenario.title)
// run: selectAutocomplete / replaceInput only
```

- [ ] **After each turn, run only if the user says run:**

```bash
npx playwright test tests/KISHOR_UI/OMN_UIInvoice_Conditional_Create_Test.spec.ts --grep "{ruleId}"
```

---

## Self-review (plan vs spec)

| Spec requirement | Task |
|---|---|
| Catalog shape + skip vocabulary | Task 1 |
| Phase 1 titles (min/max, formula, copy invoice) | Task 2 |
| Field skip stubs then convert | Tasks 3, 6–12 |
| Formula skip stubs; negative; PM; non-OMR; 2-line; 20-line skip; mismatch if editable | Tasks 4, 13–15 |
| Conditional pending stubs; mapped groups unchanged | Task 5 |
| One describe per turn; select/type; no Excel upload | Tasks 6–48 + Global Constraints |
| Attachment / Simplified / commented txn-exclusion out of scope | Global Constraints |
| Allure skip with named reason | Tasks 3–5 stubs |

No TBD/TODO remaining in task steps. `run` functions are named. Save/Update swap is `omnUiCatalogDisplayTitle`.
