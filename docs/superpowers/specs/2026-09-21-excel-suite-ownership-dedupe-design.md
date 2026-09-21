# Design: Excel Field / Formula / Conditional ownership (no duplicate cases)

**Date:** 2026-09-21  
**Status:** Implemented (awaiting Playwright after user says **run**)  
**Scope:** Covoro and Simplified Excel upload suites only (`OMN_FieldValidation_*`, `OMN_FormulaValidation_*`, `OMN_ConditionalValidation_*`)

## Goal

Each Excel check runs in **exactly one** suite. Unique coverage is kept. Duplicates are removed, not left as “belt and suspenders.”

## Hard rule

If Conditional already owns an if-then rule, **do not** add or keep the same check in Field or Formula.

“Covered” means Field **or** Conditional (or Formula for Σ). Ignore a suite when another suite already asserts that rule.

## Suite ownership

### Field

Keep only:

- Length and digit-count **min**, **max**, **min−1** (empty counts as min−1), **max+1**
- **Valid dropdown** and **invalid dropdown** (Invoice Currency, HS codes, CL-06 scheme/textual lists, tax exemption **code list** values, other master dropdowns)
- **Invoice Issue Date** rules (format / calendar cases in `createInvoiceIssueDateScenarios`) — these are not the same as Conditional invoicing-period if-then (`IBR-029` / `IBR-CO-19`)

Do **not** keep in Field when Conditional already has the rule:

| Field leftover today | Owner instead |
|---|---|
| VATIN **pattern** (valid OM+10, IBR-003 extras) | Conditional **IBR-003-OM** |
| UUID **pattern** (IBR-002 / credit-note UUID) | Conditional **IBR-002-OM** / **IBR-032-OM** |
| Exemption **code + text together**; Exempt/Zero requires reason; Standard forbids reason | Conditional **IBR-069/070-OM**, **ALIGNED-IBRP-S-10-OM** |
| Party **scheme-when-id**; seller id+scheme always mandatory | Conditional **PARTY-ID**, **IBR-007-OM**, **IBR-152/153-OM** |
| Seller VATIN always required; Buyer VATIN on self-billed / RCM | Conditional **IBR-006-OM**, **IBR-017-OM** |
| Tax rate **if-then** by VAT category (**-05**) | Conditional **ALIGNED-IBRP-E/O/S/Z-05-OM** (and related rate rules) |
| Amount **sign** (negative forbidden except rounding) | Conditional **IBR-137-OM** |
| Line item VAT **empty** presence | Conditional **IBR-038-OM** (already omitted from Field empty loop) |

Field **may** still test VATIN / UUID / identifier / Tax Rate / exemption **length or dropdown** only (min/max/min−1/max+1 or valid/invalid list). That is not the pattern or if-then rule.

Field numeric `allowsNegative` “negative should be accepted” duplicates **IBR-137-OM** rounding exception. Drop those Field tests; Conditional keeps rounding negative allowed.

Empty of amount columns stays in Field as **min−1**, except columns already owned by Conditional presence (e.g. Line item VAT empty → IBR-038-OM).

### Conditional

Keep all if-then PINT-OM cases already in `OMN_ConditionalValidation_*`, including:

- **IBR-069/070-OM** (and ALIGNED-IBRP-S-10-OM): Exempt/Zero requires reason; Standard forbids reason
- **IBR-006-OM** / **IBR-017-OM**: Seller VATIN always required; Buyer VATIN required on self-billed / RCM
- **IBR-007-OM**: Seller identifier + scheme always mandatory
- **ALIGNED-IBRP-E/O/S/Z-05-OM** (and IBR-053/061/067/046/104 as already coded): tax rate if-then
- **IBR-137-OM**: zero allowed; negative error except rounding

**Add** (missing today as if-then): **IBR-082-OM empty** — if Profit Margin invoice, Total Amount Due is mandatory. Move this from Formula. Do not add it to Field.

Do **not** assert Σ / calculated totals (`ALIGNED-IBRP-*-08-OM`, IBR-071, IBR-075, mismatch, tolerance).

Do **not** copy Field min/max/dropdown cases.

### Formula

Keep only calculated-total behaviour:

- Positive / negative formula rows
- Calculated field mismatch and tolerance
- **IBR-071-OM** (line net), **IBR-075-OM** (item net = gross − discount)
- **ALIGNED-IBRP-E/O/S/Z-08-OM** (category taxable amount Σ)
- 1-line, 2-line, 20-line; OMR and USD

**Drop** from Formula:

- **IBR-082-OM empty** (move to Conditional)
- Tax rate **if-then** (**-05**) as a Formula assertion
- **IBR-137-OM** sign rules

Formula **may** still **set** tax category and tax rate as **inputs** so totals calculate. That is not a -05 or IBR-137 test.

Formula **may** still keep **IBR-082-OM** equality (Total Amount Due = Σ Total amount including VAT) if that is Σ, not empty-presence. Empty-presence is Conditional only.

## Approach

Prune in place (no test-data package split):

1. Filter Field specs / support so loops match the Field keep-list; remove format-context pattern cases that duplicate IBR-003/002; remove exemption companion describes; remove party scheme-when-id if-then; remove `allowsNegative` Field tests.
2. Move IBR-082-OM empty scenarios + spec describe from Formula helper/spec into Conditional data + Covoro/Simplified conditional specs.
3. Remove IBR-082 empty, -05, and IBR-137 describes from Formula specs (keep -08 and 071/075).
4. Apply the same filters to Simplified specs.
5. Update `add-field-validation-case`, `add-formula-validation-case`, and `add-conditional-validation-case` so agents do not re-add duplicates.

## Target files (implementation)

| Layer | Paths |
|---|---|
| Specs | `tests/OMN_FieldValidation_CovoroTemplate_Test.spec.ts`, `tests/OMN_FieldValidation_SimplifiedTemplate_Test.spec.ts`, `tests/OMN_FormulaValidation_CovoroTemplate_Test.spec.ts`, `tests/OMN_FormulaValidation_SimplifiedTemplate_Test.spec.ts`, `tests/OMN_ConditionalValidation_CovoroTemplate_Test.spec.ts`, `tests/OMN_ConditionalValidation_SimplifiedTemplate_Test.spec.ts` |
| Data | `testData/FieldValidations/FormatContextFieldValidation.ts`, `testData/FieldValidations/ConditionalValidation.ts`, `testData/FieldValidations/Min_max_field_validation.ts` (only if `allowsNegative` / comments) |
| Helpers | `Helpers/excel/fieldValidationSpecSupport.ts`, `Helpers/excel/formulaValidationHelper.ts`, `Helpers/excel/conditionalValidationHelper.ts` / `conditionalValidationSpecHelpers.ts` |
| Skills | `.cursor/skills/add-*-validation-case/SKILL.md` |

One spec (or one rule group) per implementation turn, per `incremental-agent-edits`.

## Out of scope

- UI Create Invoice suites
- Submit / delivery / copy / simplified **matrix Excel packs** regeneration unless a pack row would reintroduce a dropped case
- Renaming helpers or moving layers
- Running Playwright until the user says **run**

## Success

- No Excel case is asserted as the same rule in two of Field / Formula / Conditional
- IBR-082-OM empty exists in Conditional and not in Formula
- Field still covers Issue Date and min/max/dropdown including empty as min−1
- Conditional still covers IBR-069/070, IBR-006/017, IBR-007, -05, IBR-137
- Formula still covers Σ and IBR-071/075/-08
