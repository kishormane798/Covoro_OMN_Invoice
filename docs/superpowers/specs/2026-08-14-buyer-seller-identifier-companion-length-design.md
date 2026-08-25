# Design: Buyer/Seller identifier — XOR scheme/code companions

**Date:** 2026-08-14  
**Status:** Approved (field-validation matrix + conditional XOR; user chose expand to conditional)

## Goal

1. **Scheme** and **textual code** are never both set on the same Excel row (only one companion is applicable).
2. Both companions are **dropdowns** — Master labels only, not free-text length strings.
3. Identifier alone (value with neither companion) is **not allowed**.
4. **Field validation:** identifier length is verified as min / max / min−1 (empty) / max+1 under each companion mode (`none` | `scheme` | `code`).
5. **Conditional validation:** Oman builders/overlays that currently dual-fill scheme + code must use **XOR** instead.

## Non-goals

- Replacing or expanding the existing **dropdown** sweeps for scheme / textual code (`dropdownFieldMasterConfig`).
- Adding a new companion × length matrix inside the PINT-OM conditional **spec** (that matrix stays in field validation).
- Length-testing scheme or textual code with random `AAAA…` strings (they are dropdowns).
- Payment column `Scheme Identifier` (Title Case, last duplicate) — not buyer/seller party identifier.
- Changing IBR rule *intent* (allowed/not-allowed outcomes stay as today); only fix companion dual-fill.

## Problem today

### Field validation

`applyDependentOverlay` → `fillBuyerPartyIdentifierCompanions` / `fillSellerPartyIdentifierCompanions` fills **scheme + textual code + identifier** together. Empty-identifier “accepted” cases fail because scheme/code make identifier mandatory.

### Conditional validation

`applyPartyIdentifiersByTxnType`, `buildBuyerIdentifierSchemeScenarioRow`, and seller-identifier scenario builders set **scheme and textual code to the same label**. That violates XOR and can hide or invent dual-dropdown state the UI does not allow.

## Rules (field validation matrix)

| Companion mode | Scheme dropdown | Textual-code dropdown | Identifier | Expected |
|---|---|---|---|---|
| `none` | empty | empty | empty | **accepted** |
| `none` | empty | empty | min / max / max+1 | **error** (identifier alone not allowed) |
| `scheme` | valid Master label | empty | empty | **error** |
| `scheme` | valid Master label | empty | min / max | **accepted** |
| `scheme` | valid Master label | empty | max+1 | **error** |
| `code` | empty | valid Master label | empty | **error** |
| `code` | empty | valid Master label | min / max | **accepted** |
| `code` | empty | valid Master label | max+1 | **error** |

Same matrix for **buyer** and **seller**.

Length rule (unchanged): `min: 1`, `max: 30`, `belowMin: 0`, `aboveMax: 31`.

## Rules (conditional XOR)

When a conditional scenario needs a party identifier:

- Set **exactly one** of scheme or textual code (never both).
- Prefer **scheme only** when the rule text / scenario names a scheme (e.g. IBR-152/153 Special Zone License Number, Importer Customs ID; IBR-007 seller scheme overlays). Clear the textual-code column.
- Keep identifier empty only for intentional **error** cases already in the suite.
- Seed Full Tax rows continue to leave the whole trio empty unless a txn-type overlay requires identifiers.

Do **not** add separate “code only” variants to every conditional rule in this change unless a rule explicitly requires textual code rather than scheme.

## Dropdown sources (companions only)

| Party | Scheme field (Excel key) | Scheme Master | Code field | Code Master |
|---|---|---|---|---|
| Buyer | `Scheme identifier` (sentence case → first `Scheme Identifier` column) | `schemeIdentifierValidTestData` (`Master.ts`) | `Buyer Identifier (textual code)` | `buyerSellerIdentifierCodeValidTestData` (`Master.omnCore.ts`) |
| Seller | `Seller identifier - Scheme identifier` | `schemeIdentifierValidTestData` (`Master.ts`) | `Seller Identifier (textual code)` | `buyerSellerIdentifierCodeValidTestData` (`Master.omnCore.ts`) |

Pick one stable valid Master label for fills. Never invent free text. Rule-specific labels (`Special Zone License Number`, `Importer Customs ID`) stay as today but only on the **scheme** column under XOR.

## Approach

### A — Field validation

Dedicated **companion × length** matrix for identifier free-text only. Remove identifier and textual-code fields from the generic conditional length loop.

Runtime Excel:

1. Seed valid Oman Full Tax row.
2. Apply companion mode (exactly zero or one dropdown companion; clear the other).
3. Patch identifier to the length under test.
4. Upload: `uploadAndVerify` or `runErrorValidation`.

### B — Conditional validation

Update shared party-identifier helpers so every row they produce obeys XOR (scheme only by default for existing overlays). Scenario builders that currently assign the same value to both columns must assign scheme only and clear textual code (or the reverse only if a scenario is explicitly code-driven).

## Layers

| Layer | Path | Change |
|---|---|---|
| Config | `testData/FieldValidations/` (new module or extend `Min_max_field_validation.ts`) | Companion modes + expected outcomes for field-validation matrix |
| Config | `testData/FieldValidations/Min_max_field_validation.ts` | Remove `Buyer Identifier (textual code)` and `Seller Identifier (textual code)` from `fieldValidationConditional` |
| Spec | `tests/OMN_FieldValidation_CovoroTemplate_Test.spec.ts` | Skip buyer/seller identifier from generic length loop; add companion-matrix describe |
| Helper | `Helpers/excel/omanFieldValidationExcelHelper.ts` | `generateOmanPartyIdentifierLengthExcel({ party, companion, length })` |
| Helper | `Helpers/excel/fieldValidationExcelPackHelper.ts` | Stop dual-filling party-identifier companions |
| Helper | `Helpers/excel/conditionalValidationHelper.ts` | XOR in `applyPartyIdentifiersByTxnType` and buyer/seller identifier scenario builders |
| Spec | `tests/OMN_ConditionalValidation_CovoroTemplate_Test.spec.ts` | No new matrix; existing IBR-007 / IBR-152/153 (and any overlay consumers) re-verified after helper XOR |

## Spec titles — field validation (examples)

```
Verify Excel upload is accepted for Covoro Conditional – Buyer identifier (empty, no scheme/code).
Verify Excel upload returns an error file for Covoro Conditional – Buyer identifier (minimum length (1 char), no scheme/code).
Verify Excel upload is accepted for Covoro Conditional – Buyer identifier (minimum length (1 char), scheme only).
Verify Excel upload returns an error file for Covoro Conditional – Buyer identifier (empty, scheme only).
Verify Excel upload is accepted for Covoro Conditional – Buyer identifier (maximum length (30 chars), code only).
…
```

Same pattern for Seller. Conditional titles stay PINT-OM style (`Excel upload · Covoro | {ruleId} | …`).

## Test count

- Field validation: 3 companion modes × 4 lengths × 2 parties = **24** tests.
- Conditional: existing scenarios only; helper XOR is a behavior fix, not a new scenario dump.

## Out of field-validation length suite after change

| Field | Where it lives instead |
|---|---|
| Buyer/Seller scheme dropdowns | Existing dropdown master/invalid suites |
| Buyer/Seller textual-code dropdowns | Existing dropdown master/invalid suites |
| Buyer/Seller identifier free-text length | New companion matrix only |

## Verification

```bash
npx playwright test tests/OMN_FieldValidation_CovoroTemplate_Test.spec.ts --project=chromium --grep "Buyer identifier"
npx playwright test tests/OMN_FieldValidation_CovoroTemplate_Test.spec.ts --project=chromium --grep "Seller identifier"
npx playwright test tests/OMN_ConditionalValidation_CovoroTemplate_Test.spec.ts --project=chromium --grep "IBR-152-OM|IBR-153-OM|IBR-007-OM"
```

Optional smoke: generate one workbook per companion mode and assert Excel cells (scheme XOR code, identifier length).
