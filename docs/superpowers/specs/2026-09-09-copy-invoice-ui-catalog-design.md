# Design: Copy Invoice UI (field / formula / conditional) + Covoro catalog Excel

**Date:** 2026-09-09  
**Status:** Approved  
**Story:** E Invoice || OMAN || As a user I should be able to Copy the E Invoice to create the new E Invoice  
**Approach:** Keep existing Copy Playwright suites; extend the Copy-only blank-identity case; add one catalog Excel that copies the three Covoro/Oman FullMatrices (Approach 1 + catalog option A)

## Goal

Two independent tracks:

1. **Playwright Copy UI** — keep the existing Copy field, formula, and conditional specs. They already loop the same Covoro-style cases as Create/Edit. Extend the one Copy-only case so Invoice Number **and** Invoice Issue Date are empty after Create Copy → Yes.
2. **Catalog Excel** — one workbook with sheets `Field`, `Formula`, and `Conditional`, copying **every** row from the three Covoro/Oman FullMatrix files (no Simplified header filter). This is a QA catalog. Playwright does **not** read it.

## Constraints (locked)

- No new Playwright spec files.
- No change to Copy spec loops except the generated title of the existing Copy-only case.
- Preceding-invoice conditionals stay **Create-only** (`PRECEDING_INVOICE_SCENARIOS` and profit-margin preceding). Do not enable them on Copy.
- No popup-text, Yes/No, status-gating, or “rest of details match original” cases (story AC leftovers; out of this increment).
- No per-case `TC-*.xlsx` packs.
- Catalog output lives under gitignored `testcase/`.
- Do not add the Copy blank-identity case as a catalog row (it is not a Covoro matrix row).
- Do not run Playwright, the catalog generator, npm, or Python until the user says **run**.

## Track 1 — Playwright Copy UI

### Coverage that already exists (keep as-is)

| Suite | Spec | Data / helper |
|---|---|---|
| Field min/max | `tests/KISHOR_UI/OMN_UIInvoice_Copy_Test.spec.ts` | `omnUiFieldRulesForSection` + `runOmnUiMinMaxCase` |
| Field catalog | same | `OMN_UI_FIELD_CATALOG` + `runOmnUiFieldCatalogRow` |
| Formula | same | `OMN_UI_FORMULA_SCENARIOS` + `OMN_UI_FORMULA_CATALOG` |
| Conditional | `tests/KISHOR_UI/OMN_UIInvoice_Conditional_Copy_Test.spec.ts` | `omnUiConditionalScenariosFor("copy", section)` + `runOmnUiConditionalScenario` |

Each of those cases still: reuse a dashboard row → Options → Create Copy → Yes → change the field(s) under test → Update (Create uses Save; Copy uses Update).

`openOmnUiInvoiceEditor(page, "copy")` already implements that entry. Reuse statuses stay `delivered` / `delivered to c5` / `delivered to c3` / `ready to submit`.

### Copy-only identity case (this increment)

Existing scenario kind `copyInvoiceNumberEmpty` (`entries: ["copy"]`) already asserts `invNum` is empty and **does not** click Update.

**Change:** also assert Invoice Issue Date is empty, using the same locators as field date tests: `invDate` with aliases `issueDate`, `invIssueDate`. Both values must be `""` after trim (same as `readInputValue`).

Keep the kind name `copyInvoiceNumberEmpty` (no rename).

**Source title** in `OMN_UI_CONDITIONAL_SCENARIOS_ALL`:  
`Copied invoice number and invoice date are empty until filled`

**Display title** from `omnUiConditionalDisplayTitle` (Copy suite only):  
`Given a copied invoice — When the copied form opens — Then Invoice Number and Invoice Issue Date should be empty. (Invoice Number, Invoice Issue Date)`

The title must describe the actual assertion (fields empty on open). Do not say Update should succeed; this case still does not click Update.

### Files to change (Playwright)

| Path | Change |
|---|---|
| `Helpers/ui/omnUiInvoiceHelper.ts` | In `runOmnUiConditionalScenario`, when `kind === "copyInvoiceNumberEmpty"`, also read `invDate` (aliases above) and expect `""` |
| `testData/ui/omnUiInvoiceValidation.ts` | Source title string + `COPY_INVOICE_NUMBER_EMPTY_SOURCE` constant + display-title branch |

Do not edit the Copy spec files. They already bind `omnUiConditionalDisplayTitle(ENTRY, scenario.title)`.

Blast radius: `runOmnUiConditionalScenario` is shared, but this kind is Copy-only (`entries: ["copy"]`). Create and Edit never hit the branch.

## Track 2 — Catalog Excel

Same sources as the Simplified FullMatrix design, but **keep every Test Case ID** (dropped count is always 0 unless a source sheet has no data rows).

### Architecture

```
Oman Field FullMatrix.xlsx ──┐
Oman Formula FullMatrix.xlsx ─┼─► copy all rows ─► EINV_OMAN_Copy_FullMatrix.xlsx
Oman Conditional FullMatrix.xlsx ┘         (sheets: Field, Formula, Conditional)
```

1. Require the three local Oman FullMatrix workbooks.
2. Copy **full source rows** (same Test Case IDs and field columns).
3. Rewrite narrative columns (Title, Description, Preconditions, Steps, Expected) from Covoro **Excel upload** wording to **Copy Invoice UI** (Create Copy → Yes, blank Invoice Number and Invoice Issue Date, then Update). Do not leave upload / error-file steps in the catalog.
4. Do not apply Simplified header keep/drop. Do not apply Playwright-only skips.

### Sources (required on disk)

| Sheet in output | Source workbook |
|---|---|
| Field | `testcase/field_validation/EINV_OMAN_FullMatrix_AllColumns_sectionCategory.xlsx` |
| Formula | `testcase/formula_validation/EINV_OMAN_FormulaValidation_FullMatrix.xlsx` |
| Conditional | `testcase/conditional_validation/EINV_OMAN_ConditionalValidation_FullMatrix.xlsx` |

Source sheet inside each Oman file: `All Testcases` if present, otherwise the first sheet (same rule as the existing matrix readers).

If any source file is missing, the generator fails and prints that path. It does not invent rows.

### Output

**Path:** `testcase/copy_invoice/EINV_OMAN_Copy_FullMatrix.xlsx`

| Sheet | Contents |
|---|---|
| Field | All field-validation matrix rows |
| Formula | All formula-validation matrix rows |
| Conditional | All PINT-OM conditional matrix rows |

Each sheet keeps source identity columns (Test Case ID, Field, RuleId, …) and **always** has Copy Invoice `Preconditions`, `Steps of Test case`, and `Expected Results` — including Field, even when the Oman Field FullMatrix has no those columns.

Do not copy Excel-upload Preconditions/Steps. Replace them on Field, Formula, and Conditional.

### Files to add (catalog)

| Path | Responsibility |
|---|---|
| `Helpers/excel/copyValidationMatrixHelper.ts` | Resolve default source paths, count rows via existing loaders, return a write plan (all Test Case IDs per sheet) |
| `utils/excel/write_copy_validation_matrix.py` | Copy source rows and rewrite Title / Preconditions / Steps / Expected to Copy Invoice UI |
| `scripts/generate_copy_validation_matrix.ts` | CLI: validate sources exist, invoke Python writer, print counts |

Do not change pack generators, `tests/**`, or Simplified keep/drop helpers except to reuse public `MATRIX_DEFAULT_PATH` / loaders.

Do not generalize the unfinished Simplified writer into this work. Copy catalog is keep-all; Simplified remains a separate filtered catalog.

### Data flow

1. TypeScript loads cases via `loadFieldValidationMatrix`, `loadFormulaValidationMatrix`, `loadConditionalValidationMatrix`.
2. Helper collects **all** Test Case IDs per sheet (no field-on-Simplified check).
3. Python copies identity columns, **adds** `Preconditions` / `Steps of Test case` / `Expected Results` if missing (Field FullMatrix has none).
4. Python **replaces** those three columns on Field, Formula, and Conditional with Copy Invoice UI text (Create Copy → Yes, blank number/date, apply this case, Update). Source upload steps are discarded.
5. Python saves the combined workbook.

### CLI

```bash
npx tsx scripts/generate_copy_validation_matrix.ts
```

Do not add an npm script unless a later plan asks for one. Do not run the generator until the user says **run**.

### Error handling

| Condition | Behavior |
|---|---|
| Source xlsx missing | Exit non-zero; print the missing path |
| Source has no `Test Case ID` column | Exit non-zero; print sheet name |
| Source has zero data rows | Write headers only; warn in summary; continue |
| Output directory missing | Create `testcase/copy_invoice/` |

## Out of scope

- New Copy spec files or unrolling catalog Excel into Playwright
- Enabling Create-only preceding conditionals on Copy
- Copy option status gating (Disregard, Submit, Error in records, Submission Error)
- Confirmation modal wording / No-click
- Prefill equality of every other field vs the original invoice
- Per-case `TC-*.xlsx` packs
- Committing the generated `.xlsx` (`/testcase/` is gitignored)
- Simplified header filtering (that is `2026-09-09-simplified-validation-matrix-design.md`)

## Risk

- **Playwright:** Low. Copy-only branch; Create/Edit unchanged. Date control may use a hidden input; use the same `invDate` aliases as existing date field tests.
- **Catalog:** Low. Read-only on Oman matrices; new files only. Generation depends on local gitignored FullMatrix files being present.
