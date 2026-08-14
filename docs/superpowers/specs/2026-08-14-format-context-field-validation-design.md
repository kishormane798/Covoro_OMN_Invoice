# Design: Format/context field validation (skipped VATIN, UUID, rate, FX)

**Date:** 2026-08-14  
**Status:** Approved (user chose C + matrix mutations A + approach 1)

## Goal

Close the field-validation gap for columns that were skipped because random `AAAA…` text cannot satisfy Oman format or extra invoice context. Keep existing PINT-OM **conditional** tests (`IBR-003`, `IBR-002` for Unique Identifier Number, tax rate, FX, `IBR-058`, `IBR-013`). Add matrix-style **field validation** with real values and the required overlays. Do not add a second UUID-v5 conditional suite for prepayment/supporting document (those columns have no `IBR-002-OM` mapping).

## Non-goals

- Other matrix-only items: extra dates, security injection (`=1+1` / HTML), dropdown blank/casing/trim
- Replaying static `testcase/field_validation/TestData2/TC-*.xlsx` packs (they still use `AAAA…` VATINs)
- Putting these fields back into the generic `updateExcelField(field, length)` AAAA loops
- Mixing min/max format cases into `ConditionalValidation.ts` except the UUID gaps named below

## Why they were skipped

`tests/OMN_FieldValidation_CovoroTemplate_Test.spec.ts` filters:

- `CONDITIONAL_LENGTH_SKIP`: Seller/Buyer/Third Party VATIN, Unique Identifier Number, Prepayment invoice UUID, Supporting document UUID, Tax Rate
- `NUMERIC_CONTEXT_SKIP`: Currency Exchange Rate, Invoice total tax amount in tax accounting currency, Total amount due (profit margin)

Those filters stay. New describes use format-aware builders instead of unskipping the AAAA loops.

## Approach

Runtime Excel (same as the rest of the Covoro upload specs): seed a valid Oman full-tax row, apply a **context overlay**, patch **one** target field, upload.

- Positive: `uploadAndVerify`
- Negative: `runErrorValidation` with the Excel header as `field`

Do not upload pre-generated matrix packs.

## Layers

| Layer | Path | Change |
|---|---|---|
| Spec | `tests/OMN_FieldValidation_CovoroTemplate_Test.spec.ts` | New describe blocks; do not remove skip sets |
| Spec | `tests/OMN_ConditionalValidation_CovoroTemplate_Test.spec.ts` | Thin loop for new UUID scenarios |
| Config | `testData/FieldValidations/` (new small module or extend existing) | Mutation rows: field, value, overlay, expect |
| Config | `testData/FieldValidations/ConditionalValidation.ts` | Prepayment + supporting-document UUID scenarios |
| Helper | `Helpers/fieldValidationHelper.ts` and/or overlay reuse from `Helpers/fieldValidationExcelPackHelper.ts` | Build workbook: overlay + single-field patch |
| Helper | `Helpers/conditionalValidationHelper.ts` | Builders for the two new UUID fields if not already generic |

Prefer reusing `applyDependentOverlay` / `generateInvoiceFromSubmitData` / `patchInvoiceTextCellInFile` over a second overlay engine.

## Field validation mutations

Matrix shape: empty, whitespace, valid min, valid max, too short, too long — with **Oman-real** values. Skip a mutation when an existing **conditional** title already asserts the same condition.

UUIDs: template max is 108 (unique/prepayment) or 64 (supporting document). A valid UUID is 36 characters. Positive cases use a real UUID **v5**, never 108× `A`.

### VATIN (IBR-003-OM pattern: `OM` + 10 digits = 12 chars)

Overlay: none extra for seller/buyer (seed already has Oman VATIN). Third Party: Third-party Invoice + third-party block; VATIN values must use `OM` + 10 digits (not `200009191900`).

| Mutation | Example | Outcome |
|---|---|---|
| valid (min = max = 12) | Seller `OM1108202600`, Buyer `OM1000091919`, Third Party `OM2000091919` | accepted |
| empty | `""` | error file |
| whitespace | `"   "` | error file |
| too short (11) | `OM` + 9 digits | error file |
| too long (13) | `OM` + 11 digits | error file |

Skip: wrong prefix (`XX…`), `OM` + non-digit — already `VATIN_PATTERN_SCENARIOS`.

### Unique Identifier Number (credit note)

Overlay: Credit note type + preceding invoice reference/date + reason code.

| Mutation | Example | Outcome |
|---|---|---|
| valid | UUID v5 (36 chars), e.g. existing `a1b2c3d4-e5f6-5a90-8bcd-ef1234567890` | accepted |
| empty / whitespace | | error file |
| too long | 109 chars | error file |

Skip: UUID v4 and non-UUID garbage — already `UUID_VERSION5_SCENARIOS` / `IBR-002-OM`.

### Prepayment invoice UUID

Overlay: Invoice Transaction Type = Prepayment Invoice + prepayment invoice number.

Same mutation set as Unique Identifier Number (valid v5, empty, whitespace, 109 chars). No conditional duplicate today.

### Supporting document UUID

Overlay: supporting document reference filled (and export/supporting context if the template requires it).

Valid UUID v5; empty; whitespace; 65 chars (above template max 64). No conditional duplicate today.

### Tax Rate

Overlay: Tax Category = Standard rate.

| Mutation | Example | Outcome |
|---|---|---|
| valid min/max (1 char) | `5` | accepted |
| above max (2 chars) | `55` | error file |

Skip: empty, whitespace, `0` — already `STANDARD_TAX_RATE_SCENARIOS`.

### Currency Exchange Rate

Overlay: Invoice Currency USD, Source currency set, tax amount in accounting currency filled so IBR-004/034 do not fire on companions.

| Mutation | Example | Outcome |
|---|---|---|
| min digits | 1 integer digit + 7 decimal places | accepted |
| max digits | 7 integer digits + 7 decimal places | accepted |
| above max | 8 integer digits | error file |

Skip: empty FX when USD (`IBR-004-OM`); 8 decimal places (`IBR-005-OM` / `IBR-DEC-03-OM`).

### Invoice total tax amount in tax accounting currency

Same USD + FX overlay. Digit-count min/max accepted; above-max error. Skip empty — already `IBR-034-OM`.

### Total amount due (profit margin)

Overlay: Profit Margin Invoice (and tax-category dependents the seed already uses for that txn). Digit-count min/max accepted; empty and above-max error. No existing digit-count conditional to skip.

## Conditional extras

PINT inventory (do not invent rule IDs):

| Column | Format / length | Presence / if-then | Already in Playwright? |
|---|---|---|---|
| Unique Identifier Number | `IBR-002-OM` (UUID v5) — typed FIELD | Credit-note preceding overlay | Yes — `UUID_VERSION5_SCENARIOS` |
| Seller / Buyer / Third Party VATIN | `IBR-003-OM` | — | Yes — `VATIN_PATTERN_SCENARIOS` |
| Prepayment invoice UUID | **Field validation only** (no separate UUID-v5 rule id) | `IBR-058-OM` if paid amount present | Yes — `PREPAYMENT_PAID_AMOUNT_SCENARIOS` |
| Supporting document UUID | **Field validation only** | `IBR-013-OM` if export txn | Yes — `EXPORT_SUPPORTING_DOCUMENT_SCENARIOS` |

**No new conditional describes** for UUID v5 on prepayment/supporting (that would misuse `IBR-002-OM`). Option C is: new **field-validation** format/length cases + keep the presence conditionals above. Add a conditional row only if a later audit finds an `IBR-058-OM` / `IBR-013-OM` matrix TC still missing from those scenario arrays.

Do not copy existing VATIN prefix/non-digit, Unique Identifier v4/garbage, Tax Rate empty/whitespace/`0`, or FX empty/8-decimals titles.

## Test titles

Field validation (existing Covoro upload style in this spec):

```
Verify Excel upload is accepted for Covoro {Section} – {Field} ({condition}).
Verify Excel upload returns an error file for Covoro {Section} – {Field} ({condition}).
```

Conditional:

```
Excel upload · Covoro | {ruleId} | {condition} → {accepted|error file}
```

## Success criteria

- Playwright field-validation spec still skips AAAA loops for these columns
- New tests use `OM`+digits, UUID v5, tax rate `5`, USD+FX, or profit-margin txn as specified
- No duplicate titles vs current `OMN_ConditionalValidation_CovoroTemplate_Test.spec.ts` cases listed in Skip rows
- Worker-isolated Excel output under `testData/generated/excel/pw-<index>/`
- Targeted run: `--grep` on field name (e.g. `Seller VAT`, `Prepayment invoice UUID`)

## Out of scope follow-ups

- Import date, payment due date, invoicing period, preceding invoice issue date
- Security formula/HTML mutations
- Dropdown blank / whitespace / casing / trim as separate field-validation tests
- Regenerating Oman field-validation Excel packs with OM VATIN instead of `AAAA…`
