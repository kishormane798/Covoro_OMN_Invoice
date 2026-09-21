# Excel suite ownership dedupe Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Each Excel Field / Formula / Conditional check runs in exactly one suite; IBR-082-OM empty moves to Conditional; Field keeps min/max/dropdown/Issue Date only.

**Architecture:** Prune in place. Filter Field format-context and companion describes. Add IBR-082-OM empty (patch after generate) to Conditional. Remove IBR-082 empty from Formula. Formula keeps Σ / IBR-071 / IBR-075 / ALIGNED-IBRP-*-08. No helper-layer rename.

**Tech Stack:** Playwright + TypeScript Excel upload specs, existing `verifyConditionalScenario` + `patchInvoiceTextCellInFile`.

**Spec:** `docs/superpowers/specs/2026-09-21-excel-suite-ownership-dedupe-design.md`

## Global Constraints

- Do not run Playwright, npm, or shell until the user says **run** / **execute** / **go ahead and run**.
- Do not commit unless the user explicitly asks (skip every Commit step until then).
- Incremental-agent-edits: one primary file per task unless this plan’s task lists two files that must change together (then stop after that pair and wait for review).
- Before editing an exported function/const, GitNexus `impact({target, direction: "upstream"})` and warn if HIGH/CRITICAL.
- Do not edit UI Create Invoice, Submit, or matrix pack generators.
- Formula may still **set** tax category / tax rate as calculation **inputs**. Do not add -05 or IBR-137 Formula asserts (none exist today).
- Conditional wins: do not copy IBR-003 / IBR-002 / IBR-069/070 / IBR-006/017 / IBR-007 / PARTY-ID / -05 / IBR-137 into Field.

---

## File map

| File | Responsibility |
|---|---|
| `testData/FieldValidations/FormatContextFieldValidation.ts` | Field length/digit extras only (no VATIN/UUID pattern) |
| `tests/OMN_FieldValidation_CovoroTemplate_Test.spec.ts` | Drop exemption companion + unused negative numeric tests |
| `tests/OMN_FieldValidation_SimplifiedTemplate_Test.spec.ts` | Same Field prune |
| `testData/FieldValidations/ConditionalValidation.ts` | IBR-082-OM empty scenarios |
| `Helpers/excel/conditionalValidationHelper.ts` | Profit-margin seed row for IBR-082 |
| `Helpers/excel/conditionalValidationSpecHelpers.ts` | Patch Total Amount Due empty after generate |
| `tests/OMN_ConditionalValidation_CovoroTemplate_Test.spec.ts` | IBR-082-OM describe |
| `tests/OMN_ConditionalValidation_SimplifiedTemplate_Test.spec.ts` | Same describe |
| `tests/OMN_FormulaValidation_CovoroTemplate_Test.spec.ts` | Remove IBR-082 empty describe |
| `tests/OMN_FormulaValidation_SimplifiedTemplate_Test.spec.ts` | Remove IBR-082 empty describe |
| `Helpers/excel/formulaValidationHelper.ts` | Remove `IBR_082_OM_CASES` / `runIbr082OmScenario` |
| `.cursor/skills/add-field-validation-case/SKILL.md` | Ownership note |
| `.cursor/skills/add-formula-validation-case/SKILL.md` | Ownership note |
| `.cursor/skills/add-conditional-validation-case/SKILL.md` | Ownership note |

---

### Task 1: Field format-context — length only

**Files:**
- Modify: `testData/FieldValidations/FormatContextFieldValidation.ts`

**Interfaces:**
- Consumes: `vatinCases`, `uuidCases`, `formatContextFieldValidationCases`
- Produces: same `FormatContextFieldCase[]` with pattern cases removed; length/digit cases kept

- [ ] **Step 1: GitNexus impact**

`impact({target: "formatContextFieldValidationCases", direction: "upstream"})`  
Expect Field specs + format helper only. If HIGH/CRITICAL, stop and report.

- [ ] **Step 2: Stop emitting VATIN/UUID pattern rows**

In `vatinCases`, delete the `whitespace only` object from the `cases.push(...)` list. Keep 11-char and 13-char. Leave `includeValid` default `false`. Leave Buyer `includeEmpty: true` (min−1; not IBR-006).

In `uuidCases`, change defaults to:

```ts
const { includeValid = false, includeEmpty = false } = opts;
```

Delete the `whitespace only` object from `uuidCases` `cases.push(...)`. Keep above-max length.

Remove the `includeValid: false, includeEmpty: false` override on Credit Note UUID (defaults now match). Keep Prepayment and Supporting `uuidCases(...)` calls with no extra opts so they only emit above-max.

Keep Tax Rate 2-char, FX min/max/max+1, Profit Margin due min/max/max+1. Do **not** add Profit Margin due empty (Conditional IBR-082-OM).

- [ ] **Step 3: Verify by search (do not run Playwright)**

Grep `FormatContextFieldValidation.ts`:

- Must **not** contain `whitespace only`
- Must **not** contain `valid OM + 10 digits`
- Must **not** contain `valid UUID v5`
- Must still contain `11 chars (below minimum)`, `13 chars (above maximum)`, `109 chars (above maximum)`, `minimum value (0.0000001)`, `14 digits (above maximum)`

- [ ] **Step 4: Commit** (only if the user asked)

```bash
git add testData/FieldValidations/FormatContextFieldValidation.ts
git commit -m "test: drop Field VATIN/UUID pattern cases owned by Conditional"
```

---

### Task 2: Covoro Field spec — drop companion if-then and dead negative loop

**Files:**
- Modify: `tests/OMN_FieldValidation_CovoroTemplate_Test.spec.ts`

**Interfaces:**
- Consumes: remaining `formatContextFieldValidationCases`, `PARTY_IDENTIFIER_LENGTH_CASES`, dropdown configs, Issue Date
- Produces: Covoro Field spec without exemption code+text companion and without `allowsNegative` tests

- [ ] **Step 1: Delete the exemption companion describe**

Remove the entire block (comments + `test.describe("Tax exemption reason — code / text companion"` through its closing `});`) that currently includes:

- `Exempt VAT with exemption code and no text should be accepted`
- `Exempt VAT with exemption text and no code should be rejected`

Keep `Dropdown — valid tax exemption reason` and `Dropdown — invalid tax exemption reason`.

- [ ] **Step 2: Delete dead IBR-137 duplicate hook**

In `Numeric fields — valid digit count`, delete the whole:

```ts
      if (config.allowsNegative) {
          const negativeValue = `-${FV.formatOmanNumericBoundaryValue(config.min, config.decimals ?? 3)}`;
        test(`${config.field} with negative value (${negativeValue}) should be accepted. (${config.field})`, async ({ page }) => {
          const { filePath } = await generateOmanSeededFieldExcel(config.field, negativeValue);
          await uploadAndVerifyFieldAccepted(page, filePath);
        });
      }
```

Keep empty-as-min−1 (`belowMin === 0 && !config.omitEmptyTest`). Keep Issue Date describe. Keep Party identifier companion **length** describe. Keep CL-06 dropdown describes.

- [ ] **Step 3: Verify by search (do not run Playwright)**

Grep the Covoro Field spec:

- Must **not** contain `code / text companion`
- Must **not** contain `allowsNegative`
- Must still contain `Invoice Issue Date`
- Must still contain `Party identifier — companion length`
- Must still contain `CL-06-OM`
- Must still contain `Format / context fields`

- [ ] **Step 4: Commit** (only if the user asked)

```bash
git add tests/OMN_FieldValidation_CovoroTemplate_Test.spec.ts
git commit -m "test: Field Covoro keeps min/max/dropdown; drop exemption companion"
```

---

### Task 3: Simplified Field spec — same prune

**Files:**
- Modify: `tests/OMN_FieldValidation_SimplifiedTemplate_Test.spec.ts`

**Interfaces:**
- Consumes: same Field data as Task 1–2
- Produces: Simplified Field spec matching Covoro ownership

- [ ] **Step 1: Delete exemption companion describe**

Remove `test.describe("Tax exemption reason — code / text companion"` and both tests inside it (same titles as Covoro). Keep exemption **dropdown** describes.

- [ ] **Step 2: Delete `allowsNegative` block**

Delete the `if (config.allowsNegative) { ... }` test in `Numeric fields — valid digit count`, same body as Covoro.

- [ ] **Step 3: Verify by search (do not run Playwright)**

Grep the Simplified Field spec:

- Must **not** contain `code / text companion`
- Must **not** contain `allowsNegative`
- Must still contain `Invoice Issue Date`

- [ ] **Step 4: Commit** (only if the user asked)

```bash
git add tests/OMN_FieldValidation_SimplifiedTemplate_Test.spec.ts
git commit -m "test: Field Simplified matches Covoro ownership prune"
```

---

### Task 4: Conditional data — IBR-082-OM empty

**Files:**
- Modify: `testData/FieldValidations/ConditionalValidation.ts`

**Interfaces:**
- Consumes: `OmanConditionalScenario`, `TXN_PROFIT_MARGIN_INVOICE`, `TOTAL_AMOUNT_DUE_PROFIT_MARGIN_FIELD`
- Produces:
  - `export type Ibr082OmEmptyDueScenario = OmanConditionalScenario & { omitDueAfterGenerate: boolean }`
  - `export const IBR_082_OM_EMPTY_DUE_SCENARIOS: Ibr082OmEmptyDueScenario[]`

Place the new type and array immediately after `TOTAL_AMOUNT_DUE_PROFIT_MARGIN_FIELD` (around line 190) **or** after existing Profit Margin scenario arrays (near IBR-086). Prefer next to other Profit Margin scenario exports so Field/Formula files stay untouched.

- [ ] **Step 1: GitNexus impact**

`impact({target: "OmanConditionalScenario", direction: "upstream"})`  
Adding a new array is low risk. Stop only if the tool reports CRITICAL on unrelated symbols you would have to edit.

- [ ] **Step 2: Add scenarios**

```ts
export type Ibr082OmEmptyDueScenario = OmanConditionalScenario & {
  /** Writer fills BTOM-020 for Profit Margin; true = blank the cell after generate. */
  omitDueAfterGenerate: boolean;
};

export const IBR_082_OM_EMPTY_DUE_SCENARIOS: Ibr082OmEmptyDueScenario[] = [
  {
    ruleId: "IBR-082-OM",
    title:
      "Given a Profit Margin invoice — When Total Amount Due is provided — Then the invoice should be accepted. (IBR-082-OM)",
    shouldError: false,
    omitDueAfterGenerate: false,
    expectedErrorField: TOTAL_AMOUNT_DUE_PROFIT_MARGIN_FIELD,
  },
  {
    ruleId: "IBR-082-OM",
    title:
      "Given a Profit Margin invoice — When Total Amount Due is left empty — Then the invoice should be rejected with an error. (IBR-082-OM)",
    shouldError: true,
    omitDueAfterGenerate: true,
    expectedErrorField: TOTAL_AMOUNT_DUE_PROFIT_MARGIN_FIELD,
  },
];
```

Do **not** add Formula Σ mismatch here. Allowed row is presence (cell filled by writer).

- [ ] **Step 3: Verify by search (do not run Playwright)**

Grep `ConditionalValidation.ts` for `IBR_082_OM_EMPTY_DUE_SCENARIOS` — two objects, `ruleId: "IBR-082-OM"`.

- [ ] **Step 4: Commit** (only if the user asked)

```bash
git add testData/FieldValidations/ConditionalValidation.ts
git commit -m "test: add IBR-082-OM empty Total Amount Due conditional scenarios"
```

---

### Task 5: Conditional builder + empty-due patch

**Files:**
- Modify: `Helpers/excel/conditionalValidationHelper.ts`
- Modify: `Helpers/excel/conditionalValidationSpecHelpers.ts`

(Two files required: row seed + post-generate patch. Stop after this pair.)

**Interfaces:**
- Consumes: `getSeedInvoiceRow` (file-private in helper), `applyPartyIdentifiersByTxnType`, `TXN_PROFIT_MARGIN_INVOICE`, `IBR_082_OM_EMPTY_DUE_SCENARIOS`, `patchInvoiceTextCellInFile`, `TOTAL_AMOUNT_DUE_PROFIT_MARGIN_FIELD`
- Produces:
  - `export function buildIbr082OmEmptyDueScenarioRow(scenario: FV.Ibr082OmEmptyDueScenario): Record<string, string | null>`
  - `export function patchProfitMarginDueBlank(filePath: string): void`

- [ ] **Step 1: GitNexus impact**

`impact({target: "buildProfitMarginSelfInvoiceScenarioRow", direction: "upstream"})`  
You are adding a sibling, not editing that function. Proceed unless the new name collides.

- [ ] **Step 2: Add builder in `conditionalValidationHelper.ts`**

Place immediately after `buildProfitMarginSelfInvoiceScenarioRow`:

```ts
export function buildIbr082OmEmptyDueScenarioRow(
  _scenario: FV.Ibr082OmEmptyDueScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  return applyPartyIdentifiersByTxnType({
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]: FV.TXN_PROFIT_MARGIN_INVOICE,
    [FV.TAX_CATEGORY_FIELD]: FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
    [FV.INVOICED_ITEM_TAX_RATE_FIELD]: null,
    [FV.TAX_EXEMPTION_REASON_CODE_FIELD]: "",
  });
}
```

`_scenario` is unused on purpose: both cases share the same seed; omit vs keep is the patch.

- [ ] **Step 3: Add patch in `conditionalValidationSpecHelpers.ts`**

Import `TOTAL_AMOUNT_DUE_PROFIT_MARGIN_FIELD` from ConditionalValidation (add to the existing named import). Add:

```ts
export function patchProfitMarginDueBlank(filePath: string): void {
  patchInvoiceTextCellInFile(
    filePath,
    TOTAL_AMOUNT_DUE_PROFIT_MARGIN_FIELD,
    ""
  );
}
```

Task 6 calls this from `options.patchFile` only when `scenario.omitDueAfterGenerate` is true. Do not put omit flags on the submit row.

- [ ] **Step 4: Verify by search (do not run Playwright)**

Grep:

- `buildIbr082OmEmptyDueScenarioRow` in `conditionalValidationHelper.ts`
- `patchProfitMarginDueBlank` in `conditionalValidationSpecHelpers.ts`

- [ ] **Step 5: Commit** (only if the user asked)

```bash
git add Helpers/excel/conditionalValidationHelper.ts Helpers/excel/conditionalValidationSpecHelpers.ts
git commit -m "test: wire IBR-082-OM profit-margin row and blank-due patch"
```

---

### Task 6: Covoro Conditional spec — IBR-082-OM

**Files:**
- Modify: `tests/OMN_ConditionalValidation_CovoroTemplate_Test.spec.ts`

**Interfaces:**
- Consumes: `FV.IBR_082_OM_EMPTY_DUE_SCENARIOS`, `ConditionalRows.buildIbr082OmEmptyDueScenarioRow`, `verifyConditionalScenario`, `patchProfitMarginDueBlank`
- Produces: Covoro Conditional describe for IBR-082-OM

- [ ] **Step 1: Add imports**

Add `patchProfitMarginDueBlank` to the `conditionalValidationSpecHelpers` import.

- [ ] **Step 2: Add describe after Profit Margin Self-Invoice (IBR-086/087-OM)**

```ts
  test.describe("Profit Margin Total Amount Due mandatory (IBR-082-OM)", () => {
    for (const scenario of FV.IBR_082_OM_EMPTY_DUE_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData = ConditionalRows.buildIbr082OmEmptyDueScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.TOTAL_AMOUNT_DUE_PROFIT_MARGIN_FIELD,
          scenario.shouldError,
          scenario.omitDueAfterGenerate
            ? { patchFile: (filePath) => patchProfitMarginDueBlank(filePath) }
            : undefined
        );
      });
    }
  });
```

- [ ] **Step 3: Verify by search (do not run Playwright)**

Grep Covoro Conditional spec for `IBR-082-OM` — one `test.describe`. Formula Covoro spec still has IBR-082 until Task 8; that duplicate is expected for one task only. Do Task 8 next in the same session if the user is executing the plan.

- [ ] **Step 4: Commit** (only if the user asked)

```bash
git add tests/OMN_ConditionalValidation_CovoroTemplate_Test.spec.ts
git commit -m "test: Conditional Covoro owns IBR-082-OM empty Total Amount Due"
```

---

### Task 7: Simplified Conditional spec — IBR-082-OM

**Files:**
- Modify: `tests/OMN_ConditionalValidation_SimplifiedTemplate_Test.spec.ts`

**Interfaces:**
- Consumes: same as Task 6
- Produces: Simplified Conditional IBR-082 describe

- [ ] **Step 1: Add the same import and describe as Task 6**

Insert after `Profit Margin Self-Invoice (IBR-086/087-OM)` (line ~354). Use the same loop body as Task 6 (copy the block; do not write “same as Task 6” only).

If Simplified template has no `Total Amount Due (Profit Margin)` column, wrap the test body with:

```ts
        const headers = await getCachedInvoiceTemplateHeaders();
        test.skip(
          !hasHeaderLabel(headers, FV.TOTAL_AMOUNT_DUE_PROFIT_MARGIN_FIELD),
          "Simplified template has no Total Amount Due (Profit Margin) column"
        );
```

Import `getCachedInvoiceTemplateHeaders` and `hasHeaderLabel` from `utils/excel/invoiceExcel` only if that skip is used. Check `SIMPLIFIED_TEMPLATE_HEADER_LABELS` / Simplified template headers first; if the column exists, do **not** add skip.

- [ ] **Step 2: Verify by search (do not run Playwright)**

Grep Simplified Conditional spec for `IBR-082-OM`.

- [ ] **Step 3: Commit** (only if the user asked)

```bash
git add tests/OMN_ConditionalValidation_SimplifiedTemplate_Test.spec.ts
git commit -m "test: Conditional Simplified owns IBR-082-OM empty Total Amount Due"
```

---

### Task 8: Formula Covoro spec — drop IBR-082 empty

**Files:**
- Modify: `tests/OMN_FormulaValidation_CovoroTemplate_Test.spec.ts`

**Interfaces:**
- Consumes: remaining Formula helpers (mismatch, -08, 071/075)
- Produces: Formula Covoro spec with no IBR-082 empty describe

- [ ] **Step 1: Remove imports**

From the `formulaValidationHelper` import, delete `IBR_082_OM_CASES` and `runIbr082OmScenario`.

- [ ] **Step 2: Delete the describe**

Delete the whole `test.describe("Profit Margin Total Amount Due (IBR-082-OM)"` block (comment + loop). Keep `Item net price and line net formulas (IBR-075-OM / IBR-071-OM)` and all `ALIGNED-IBRP-*-08-OM` describes. Keep calculated mismatch on header `Total Amount Due (Profit Margin)` — that is Σ equality, not empty presence.

- [ ] **Step 3: Verify by search (do not run Playwright)**

Grep Covoro Formula spec:

- Must **not** contain `IBR_082_OM_CASES`
- Must **not** contain `runIbr082OmScenario`
- Must still contain `ALIGNED-IBRP-E-08-OM`
- Must still contain `IBR-075-OM`
- Must still contain `IBR-071-OM`

- [ ] **Step 4: Commit** (only if the user asked)

```bash
git add tests/OMN_FormulaValidation_CovoroTemplate_Test.spec.ts
git commit -m "test: Formula Covoro drops IBR-082-OM empty presence"
```

---

### Task 9: Formula Simplified spec — drop IBR-082 empty

**Files:**
- Modify: `tests/OMN_FormulaValidation_SimplifiedTemplate_Test.spec.ts`

**Interfaces:**
- Consumes: remaining Formula helpers
- Produces: Formula Simplified spec with no IBR-082 empty describe

- [ ] **Step 1: Remove `IBR_082_OM_CASES` and `runIbr082OmScenario` from imports**

- [ ] **Step 2: Delete `test.describe("Profit Margin Total Amount Due (IBR-082-OM)"` and its loop**

Keep -08 / 071 / 075 / mismatch.

- [ ] **Step 3: Verify by search (do not run Playwright)**

Grep Simplified Formula spec: must not contain `runIbr082OmScenario`; must still contain `IBR-075-OM`.

- [ ] **Step 4: Commit** (only if the user asked)

```bash
git add tests/OMN_FormulaValidation_SimplifiedTemplate_Test.spec.ts
git commit -m "test: Formula Simplified drops IBR-082-OM empty presence"
```

---

### Task 10: Formula helper — remove IBR-082 empty runner

**Files:**
- Modify: `Helpers/excel/formulaValidationHelper.ts`

**Interfaces:**
- Consumes: remaining `CALCULATED_FIELD_MISMATCH_TARGETS` Profit Margin equality
- Produces: helper without `Ibr082OmCase` / `IBR_082_OM_CASES` / `runIbr082OmScenario`

- [ ] **Step 1: GitNexus impact**

`impact({target: "runIbr082OmScenario", direction: "upstream"})`  
After Tasks 8–9, callers should be none. If any spec still imports it, stop and finish Tasks 8–9 first.

- [ ] **Step 2: Delete the IBR-082 empty API**

Delete from the comment `IBR-082-OM: when BTOM-001 is Profit Margin Invoice` through the end of `runIbr082OmScenario` (types `Ibr082OmPolarity`, `Ibr082OmCase`, `IBR_082_OM_CASES`, and the function). Keep `PROFIT_MARGIN_DUE_HEADER` and `formulaMismatchBaseRow` Profit Margin txn overlay (Σ mismatch still needs it).

- [ ] **Step 3: Verify by search (do not run Playwright)**

Grep `formulaValidationHelper.ts` and `tests/`:

- Must **not** contain `runIbr082OmScenario`
- Must **not** contain `IBR_082_OM_CASES`
- Conditional specs must still contain `IBR-082-OM`

- [ ] **Step 4: Commit** (only if the user asked)

```bash
git add Helpers/excel/formulaValidationHelper.ts
git commit -m "test: remove Formula IBR-082-OM empty runner"
```

---

### Task 11: Skills — stop agents re-adding duplicates

**Files:**
- Modify: `.cursor/skills/add-field-validation-case/SKILL.md`
- Modify: `.cursor/skills/add-formula-validation-case/SKILL.md`
- Modify: `.cursor/skills/add-conditional-validation-case/SKILL.md`

(Three skill files, one ownership paragraph each. One review after the trio.)

**Interfaces:**
- Consumes: spec `docs/superpowers/specs/2026-09-21-excel-suite-ownership-dedupe-design.md`
- Produces: skills that point agents at the ownership table

- [ ] **Step 1: Field skill — add after “When to use”**

```markdown
## Excel suite ownership

Keep min / max / min−1 (empty) / max+1, valid+invalid dropdown, and Invoice Issue Date.
Do not add VATIN/UUID **pattern**, exemption **code+text**, party **scheme-when-id**, **-05** tax-rate if-then, or **IBR-137-OM** sign tests — Conditional already owns those.
See `docs/superpowers/specs/2026-09-21-excel-suite-ownership-dedupe-design.md`.
```

- [ ] **Step 2: Formula skill — add after “When to use”**

```markdown
## Excel suite ownership

Keep Σ / calculated mismatch / tolerance, IBR-071-OM, IBR-075-OM, ALIGNED-IBRP-E/O/S/Z-08-OM.
Do not add IBR-082-OM **empty** (Conditional), tax-rate **if-then (-05)** (Conditional), or IBR-137-OM sign (Conditional).
Setting tax category/rate as **inputs** for totals is allowed.
See `docs/superpowers/specs/2026-09-21-excel-suite-ownership-dedupe-design.md`.
```

- [ ] **Step 3: Conditional skill — add after “When to use”**

```markdown
## Excel suite ownership

If-then only. IBR-082-OM empty Total Amount Due lives here (patch after generate).
Do not add min/max/dropdown or Σ (ALIGNED-IBRP-*-08, IBR-071, IBR-075).
Do not copy a case that Field already covers as length/dropdown.
See `docs/superpowers/specs/2026-09-21-excel-suite-ownership-dedupe-design.md`.
```

- [ ] **Step 4: Commit** (only if the user asked)

```bash
git add .cursor/skills/add-field-validation-case/SKILL.md .cursor/skills/add-formula-validation-case/SKILL.md .cursor/skills/add-conditional-validation-case/SKILL.md
git commit -m "docs: record Excel Field/Formula/Conditional ownership in skills"
```

---

## Playwright (only after the user says **run**)

After all tasks:

```bash
npx playwright test tests/OMN_FieldValidation_CovoroTemplate_Test.spec.ts --list
npx playwright test tests/OMN_FormulaValidation_CovoroTemplate_Test.spec.ts --list
npx playwright test tests/OMN_ConditionalValidation_CovoroTemplate_Test.spec.ts --grep "IBR-082-OM"
```

Expect: Field list has Issue Date, dropdowns, min/max; no exemption companion titles. Formula list has no “Total Amount Due is left empty”. Conditional grep shows IBR-082-OM titles.

Do not run these until the user says **run**.

---

## Plan self-review

| Spec requirement | Task |
|---|---|
| Field min/max/dropdown/Issue Date | Keep in Tasks 2–3; format-context length in Task 1 |
| No Field VATIN/UUID pattern | Task 1 |
| No Field exemption companion | Tasks 2–3 |
| Party length stays; scheme-when-id stays Conditional | No file change (`partyIdentifierCompanionLength.ts` already length-only) |
| IBR-082 empty → Conditional | Tasks 4–7 |
| Formula drops IBR-082 empty | Tasks 8–10 |
| Formula keeps -08 / 071 / 075 | Tasks 8–9 verify steps |
| No Formula -05 / IBR-137 asserts | Already absent; skills Task 11 |
| Covoro + Simplified | Tasks 2–3, 6–9 |
| Skills prevent re-add | Task 11 |
