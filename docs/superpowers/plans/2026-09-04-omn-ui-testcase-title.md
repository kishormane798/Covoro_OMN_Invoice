# Oman UI Testcase Titles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. REQUIRED BACKGROUND: `wait-for-explicit-run` — do not run Playwright / npm until the user says **run**. Do not commit unless the user explicitly asks.

**Goal:** Make every Oman Create / Edit / Copy UI Playwright title readable by a non-tech person (Save/Update vs form error), without changing assertions or Excel titles.

**Architecture:** Adapt the existing title builders in `omnUiInvoiceValidation.ts` so they take `entry` and emit the Superpower recipe. `omnUiInvoiceSpec.ts` stops prefixing `Create Invoice UI |`. Excel `ConditionalValidation.ts` is unchanged; a UI-only transform rewrites “uploaded” at bind time.

**Tech Stack:** Playwright + TypeScript E2E titles; Cursor skill `add-ui-invoice-test`.

## Global Constraints

- Litmus: a non-tech person reading only the title knows what was tried and whether Save/Update should succeed or the form should show an error
- Create uses **Save**; Edit and Copy use **Update**
- Forbidden in title body: `Excel upload`, `Covoro`, `error file`, pipe `|`, `→`, bare `field error` after an arrow, IBT numbers
- Field name or rule id stays at the end in parentheses
- Do not unroll loop-generated tests into string literals; do not add a new `uiTestTitle` module
- Do not edit `tests/KISHOR_UI/*.spec.ts`, `ConditionalValidation.ts`, page objects, or `runOmnUi*` behavior
- Do not change `describe()` headings
- One approved batch: the files listed below
- Do not commit unless the user explicitly asks
- Do not run Playwright until the user says **run**

## File map

| File | Responsibility |
|---|---|
| `testData/ui/omnUiInvoiceValidation.ts` | Title builders + Excel→UI conditional display transform |
| `Helpers/ui/omnUiInvoiceSpec.ts` | Bind titles into Playwright `test()` names |
| `.cursor/skills/add-ui-invoice-test/SKILL.md` | Stop teaching the old pipe format |
| `docs/superpowers/specs/2026-09-04-omn-ui-testcase-title-design.md` | Mark Approved after implementation |

Callers of the builders: only `Helpers/ui/omnUiInvoiceSpec.ts` (which the six KISHOR_UI specs import). GitNexus was not ready at plan time; grep confirms no other TS callers.

---

### Task 1: Title builders

**Files:**
- Modify: `testData/ui/omnUiInvoiceValidation.ts` (`omnUiExcelPartyIdentityTitle` ~667–677, `omnUiMinMaxCondition` ~679–690, `omnUiTestTitle` / `omnUiFormulaTestTitle` ~1528–1540)

**Interfaces:**
- Consumes: `OmnUiEntry`, `OmnUiFieldRule`, `OmnUiMinMaxVariant`, `OmnUiExcelPartyIdentityCase`
- Produces:
  - `omnUiPersistOutcome(entry: OmnUiEntry, expectsError: boolean): string`
  - `omnUiMinMaxWhatEntered(variant: OmnUiMinMaxVariant, rule: OmnUiFieldRule): string`
  - `omnUiTestTitle(entry: OmnUiEntry, field: string, whatEntered: string, expectsError: boolean): string`
  - `omnUiFormulaTestTitle(scenarioName: string): string`
  - `omnUiExcelPartyIdentityTitle(entry: OmnUiEntry, identityCase: OmnUiExcelPartyIdentityCase): string`
  - `omnUiConditionalDisplayTitle(entry: OmnUiEntry, sourceTitle: string): string`
  - `omnUiNavigationTestTitle(): string` (constant string is fine; function optional)

- [x] **Step 1: Replace party-identity and min/max title helpers**

Replace `omnUiExcelPartyIdentityTitle` and `omnUiMinMaxCondition` with:

```ts
export function omnUiPersistOutcome(entry: OmnUiEntry, expectsError: boolean): string {
  if (expectsError) return "the form should show an error";
  return entry === "create" ? "Save should succeed" : "Update should succeed";
}

function charsPhrase(n: number): string {
  return n === 1 ? "1-character" : `${n}-character`;
}

export function omnUiMinMaxWhatEntered(
  variant: OmnUiMinMaxVariant,
  rule: OmnUiFieldRule
): string {
  switch (variant) {
    case "min":
      return `A ${charsPhrase(rule.min)} ${rule.field}`;
    case "max":
      return `${rule.field} at maximum length (${rule.max} characters)`;
    case "belowMin":
      return rule.belowMin === 0
        ? `An empty ${rule.field}`
        : `A ${charsPhrase(rule.belowMin)} ${rule.field} (below minimum)`;
    case "aboveMax":
      return `A ${charsPhrase(rule.aboveMax)} ${rule.field} (above maximum)`;
  }
}

export function omnUiExcelPartyIdentityTitle(
  entry: OmnUiEntry,
  identityCase: OmnUiExcelPartyIdentityCase
): string {
  const party = identityCase.section === "seller" ? "Seller" : "Buyer";
  const source =
    identityCase.invoiceType === "selfBilled"
      ? "from self-billed Excel worker TIN"
      : "from Excel identity";
  return `${party} VAT Identifier and electronic address ${source} — ${omnUiPersistOutcome(entry, false)}. (VAT Identifier)`;
}
```

Delete `omnUiMinMaxCondition` (only caller is the spec binder, updated in Task 2).

- [x] **Step 2: Replace suite title helpers and add the conditional display transform**

Replace `omnUiTestTitle` and `omnUiFormulaTestTitle` (end of file) with:

```ts
export function omnUiTestTitle(
  entry: OmnUiEntry,
  field: string,
  whatEntered: string,
  expectsError: boolean
): string {
  return `${whatEntered} — ${omnUiPersistOutcome(entry, expectsError)}. (${field})`;
}

export function omnUiFormulaTestTitle(scenarioName: string): string {
  return `Calculated totals should match the formula. (${scenarioName})`;
}

export function omnUiNavigationTestTitle(): string {
  return "Opening the editor should show the invoice form.";
}

const COPY_INVOICE_NUMBER_EMPTY_SOURCE = "Copied invoice number is empty until filled";

export function omnUiConditionalDisplayTitle(entry: OmnUiEntry, sourceTitle: string): string {
  if (sourceTitle === COPY_INVOICE_NUMBER_EMPTY_SOURCE) {
    return "An empty invoice number on a copied invoice — Update should succeed. (Invoice Number)";
  }
  const when =
    entry === "create" ? "When the form is saved" : "When the form is updated";
  const accepted =
    entry === "create" ? "Then Save should succeed." : "Then Update should succeed.";
  return sourceTitle
    .replace(/^(?:(?:Create|Edit|Copy) Invoice UI \| )+/, "")
    .replace("When the invoice is uploaded", when)
    .replace("Then the invoice should be accepted.", accepted)
    .replace(
      "Then the invoice should be rejected with an error.",
      "Then the form should show an error."
    );
}
```

- [x] **Step 3: Verify builders by inspection (do not run Playwright)**

Expected examples:

- create + Invoice Number + min 1 + no error → `A 1-character Invoice Number — Save should succeed. (Invoice Number)`
- edit + empty belowMin + error → `An empty Invoice Number — the form should show an error. (Invoice Number)`
- GWT uploaded accepted + create → `Given … — When the form is saved — Then Save should succeed. (RULE)`
- copy empty invoice number source → `An empty invoice number on a copied invoice — Update should succeed. (Invoice Number)`

- [ ] **Step 4: Do not commit** unless the user asked

---

### Task 2: Spec binder titles

**Files:**
- Modify: `Helpers/ui/omnUiInvoiceSpec.ts`

**Interfaces:**
- Consumes: `omnUiTestTitle`, `omnUiMinMaxWhatEntered`, `omnUiFormulaTestTitle`, `omnUiExcelPartyIdentityTitle`, `omnUiConditionalDisplayTitle`, `omnUiNavigationTestTitle` from Task 1
- Produces: Playwright test names for all six KISHOR_UI specs (no spec file edits)

- [ ] **Step 1: Update imports**

Replace the title-related imports with:

```ts
  omnUiConditionalDisplayTitle,
  omnUiExcelPartyIdentityTitle,
  omnUiFieldRulesForSection,
  omnUiFormulaTestTitle,
  omnUiMinMaxExpectsError,
  omnUiMinMaxWhatEntered,
  omnUiNavigationTestTitle,
  omnUiTestTitle,
```

Remove `omnUiMinMaxCondition`. Keep `headingForEntry` for `describe()` headings only.

- [ ] **Step 2: Navigation smoke**

```ts
function bindNavigationSmoke(heading: string, entry: OmnUiEntry): void {
  test(omnUiNavigationTestTitle(), async ({ page }) => {
```

Leave the function body unchanged.

- [ ] **Step 3: Party identity, min/max, formula**

```ts
        test(omnUiExcelPartyIdentityTitle(entry, identityCase), async ({ page }, testInfo) => {
```

```ts
            const expectsError = omnUiMinMaxExpectsError(rule, variant);
            test(
              omnUiTestTitle(
                entry,
                rule.field,
                omnUiMinMaxWhatEntered(variant, rule),
                expectsError
              ),
              async ({ page }, testInfo) => {
                await runOmnUiMinMaxCase(page, entry, rule, variant, testInfo.testId);
              }
            );
```

```ts
        test(omnUiFormulaTestTitle(scenario.name), async ({ page }, testInfo) => {
```

- [ ] **Step 4: Conditional titles**

```ts
          test(omnUiConditionalDisplayTitle(entry, scenario.title), async ({ page }, testInfo) => {
```

Do not use `` `${heading} | ${scenario.title}` ``.

- [ ] **Step 5: Verify by grep (do not run Playwright)**

In `Helpers/ui/omnUiInvoiceSpec.ts` there must be no `heading} |` inside `test(`. `describe()` may still use `heading`.

- [ ] **Step 6: Do not commit** unless the user asked

---

### Task 3: Skill snippet so new UI cases do not regress

**Files:**
- Modify: `.cursor/skills/add-ui-invoice-test/SKILL.md` (section “### 4. Test title format”)

**Interfaces:**
- Consumes: recipes from the design spec
- Produces: agents writing new UI tests use Save/Update wording, not pipes

- [ ] **Step 1: Replace the title format section**

Replace:

```
### 4. Test title format

```
Create Invoice UI | {Section} | {field or rule} | {condition} → {outcome}
```
```

with:

```
### 4. Test title format

REQUIRED SUB-SKILL: `improve-testcase-title`. Use the builders in `omnUiInvoiceValidation.ts` (`omnUiTestTitle`, `omnUiConditionalDisplayTitle`, …). Do not prefix `Create Invoice UI |`.

Field: `{What we entered} — Save should succeed. ({Field})` (Edit/Copy: Update). Errors: `the form should show an error`.
Conditional: keep Excel `title` in `ConditionalValidation.ts`; UI display rewrites uploaded → form saved/updated.
```

- [ ] **Step 2: Do not commit** unless the user asked

---

### Task 4: Mark design approved + grep gate

**Files:**
- Modify: `docs/superpowers/specs/2026-09-04-omn-ui-testcase-title-design.md` status line

- [ ] **Step 1: Set status**

Change `**Status:** Draft — awaiting user review` to `**Status:** Approved`.

- [ ] **Step 2: Grep gate (do not run Playwright)**

Search `Helpers/ui/omnUiInvoiceSpec.ts` and the title helpers in `testData/ui/omnUiInvoiceValidation.ts` for:

- `→` in title return strings (must be gone)
- `` `${heading} |` `` in `test(` calls (must be gone)
- `When the invoice is uploaded` inside `omnUiConditionalDisplayTitle` only as the *search* string being replaced

Confirm `testData/FieldValidations/ConditionalValidation.ts` still contains `When the invoice is uploaded`.

- [ ] **Step 3: Do not commit** unless the user asked
