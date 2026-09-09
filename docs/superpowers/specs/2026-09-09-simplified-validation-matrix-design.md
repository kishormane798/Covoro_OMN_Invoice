# Design: Simplified validation FullMatrix (Field / Formula / Conditional)

**Date:** 2026-09-09  
**Status:** Approved (awaiting implementation plan)  
**Story:** E Invoice || OMAN || As a system, it should validate the COVORO Simplified template considering all Validations  
**Approach:** Filter the three Oman FullMatrix workbooks into one Simplified catalog Excel (Approach 1)

## Goal

Produce a single testcase catalog for the Covoro Simplified template that mirrors the Oman field, formula, and conditional matrices, keeping only rows whose field exists on `SimplifiedTemplate.xlsx`.

This is a **QA catalog**, not an upload workbook. The portal still reads one invoice sheet (`E Invoice`). Existing Simplified Playwright specs stay unchanged.

## Constraints (locked)

- No new Playwright spec.
- No per-case `TC-*.xlsx` pack generation.
- Output lives under gitignored `testcase/` (same as Oman matrices).
- Buyer-master mismatch and self-billed TIN swap from the Jira AC are out of this file (they are not field/formula/conditional matrix rows).

## Architecture

```
Oman Field FullMatrix.xlsx ──┐
Oman Formula FullMatrix.xlsx ─┼─► keep/drop by Simplified headers ─► EINV_OMAN_Simplified_FullMatrix.xlsx
Oman Conditional FullMatrix.xlsx ┘         (sheets: Field, Formula, Conditional)
```

1. Read the three local Oman FullMatrix workbooks (must already exist).
2. Keep a row only if its matrix field maps to a Simplified row-4 header.
3. Write one workbook with three sheets, copying **full source rows** for kept Test Case IDs.

## Sources (required on disk)

| Sheet in output | Source workbook |
|---|---|
| Field | `testcase/field_validation/EINV_OMAN_FullMatrix_AllColumns_sectionCategory.xlsx` |
| Formula | `testcase/formula_validation/EINV_OMAN_FormulaValidation_FullMatrix.xlsx` |
| Conditional | `testcase/conditional_validation/EINV_OMAN_ConditionalValidation_FullMatrix.xlsx` |

Source sheet inside each Oman file: `All Testcases` if present, otherwise the first sheet (same rule as the existing matrix readers).

If any source file is missing, the generator fails and prints that path. It does not invent rows.

## Output

**Path:** `testcase/simplified_validation/EINV_OMAN_Simplified_FullMatrix.xlsx`

| Sheet | Contents |
|---|---|
| Field | Kept field-validation matrix rows (length, mandatory, dropdown, format, numeric) |
| Formula | Kept formula-validation matrix rows |
| Conditional | Kept PINT-OM conditional matrix rows |

Each sheet keeps the **same columns** as its Oman source (Test Case ID, Priority, Section, Filed name / Field name, Title, Description, plus Formula/Conditional extras such as Polarity, RuleId, Preconditions, Steps, Expected Results).

Dropped rows are not written to a fourth sheet. The CLI prints kept vs dropped counts per sheet.

Overwrite the output file if it already exists.

## Keep / drop rules

**Keep** when the matrix field (`Filed name` or `Field name`):

1. Is stripped of Peppol tokens such as `(IBT-…)`, `(BTOM-…)`, `(IBG-…)` via existing `normalizeMatrixFieldLabel`.
2. Is aliased through the existing Oman maps (`MATRIX_FIELD_TO_ROW_KEY`, formula `FIELD_TO_EXCEL_HEADER`, conditional `resolveEffectiveMatrixField` / `CONDITIONAL_FIELD_TO_ROW_KEY`).
3. Matches a label in `SIMPLIFIED_TEMPLATE_HEADER_LABELS` (case and spacing insensitive).

That includes Simplified identity columns: Seller/Buyer Name, Electronic Address Scheme, Electronic Address, plus third-party and delivery columns that exist on Simplified.

**Drop** when the field exists only on the full Covoro template, including:

- Seller/Buyer address lines, city, post code, country
- Seller/Buyer identifier, VAT TIN, buyer `Scheme Identifier`
- Any other header not in `SIMPLIFIED_TEMPLATE_HEADER_LABELS`

Do **not** apply Playwright-only extra skips (`isSimplifiedIgnoredPartyField`, `CONDITIONAL_LENGTH_SKIP`, third-party-only VATIN filters). Those belong to the existing specs, not this catalog.

Empty sheet after filtering: still write the header row and warn; do not fail the run.

## Files to add

| Path | Responsibility |
|---|---|
| `Helpers/excel/simplifiedValidationMatrixHelper.ts` | Load the three Oman matrices with existing loaders; decide keep/drop; return kept Test Case IDs per sheet plus counts |
| `utils/excel/write_simplified_validation_matrix.py` | Copy full source rows whose Test Case ID is in the keep set into the three-sheet output workbook |
| `scripts/generate_simplified_validation_matrix.ts` | CLI: validate sources exist, call helper, invoke Python writer, print summary |

No changes to `tests/**`, pack generators, or `SIMPLIFIED_TEMPLATE_HEADER_LABELS` unless a mapping bug is found during generation.

## Data flow

1. TypeScript loads cases via `loadFieldValidationMatrix`, `loadFormulaValidationMatrix`, `loadConditionalValidationMatrix`.
2. Helper classifies each case keep/drop and collects Test Case IDs.
3. Python opens each source workbook, copies the header row plus kept data rows (match `Test Case ID`) onto the corresponding output sheet.
4. Python saves the combined workbook.

This split exists so keep/drop uses the same TypeScript field aliases as Oman packs, while the written Excel retains columns the JSON loaders do not expose.

## CLI

```bash
npx tsx scripts/generate_simplified_validation_matrix.ts
```

Do not add an npm script unless a later plan asks for one. Do not run the generator until the user says **run**.

## Error handling

| Condition | Behavior |
|---|---|
| Source xlsx missing | Exit non-zero; print the missing path |
| Source has no `Test Case ID` column | Exit non-zero; print sheet name |
| Zero kept rows on a sheet | Write headers only; warn in summary; continue |
| Output directory missing | Create `testcase/simplified_validation/` |

## Out of scope

- Playwright specs (`OMN_*_SimplifiedTemplate_Test.spec.ts` and Covoro equivalents)
- Per-case Simplified `TC-*.xlsx` packs under `TestData/`
- Buyer not in Buyer Master / self-billed TIN swap cases
- Committing the generated `.xlsx` (`/testcase/` is gitignored)
- Changing Simplified vs full template header catalogs except bugfix

## Risk

Low. Read-only on Oman matrices; new files only; no runtime test behavior change. Generation depends on local gitignored Oman FullMatrix files being present.
