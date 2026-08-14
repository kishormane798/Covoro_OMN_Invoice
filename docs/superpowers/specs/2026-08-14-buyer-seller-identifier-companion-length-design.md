# Design: Buyer/Seller identifier length with XOR scheme/code companions

**Date:** 2026-08-14  
**Status:** Approved (user confirmed companion matrix + dropdown companions)

## Goal

Fix Covoro Excel field-validation for **Buyer identifier** and **Seller identifier** so:

1. **Scheme** and **textual code** are never both set on the same row (only one companion is applicable).
2. Both companions are **dropdowns** — values come from Master lists, not free-text length strings.
3. Identifier alone (value with neither companion) is **not allowed**.
4. Identifier length is verified as min / max / min−1 (empty) / max+1 under each companion mode.

## Non-goals

- Replacing or expanding the existing **dropdown** sweeps for scheme / textual code (`dropdownFieldMasterConfig`).
- Changing PINT-OM conditional suites (`IBR-016-OM`, `IBR-007-OM`, `IBR-152/153-OM`, etc.).
- Length-testing scheme or textual code with random `AAAA…` strings (they are dropdowns).
- Payment column `Scheme Identifier` (Title Case, last duplicate) — not buyer/seller party identifier.

## Problem today

`applyDependentOverlay` → `fillBuyerPartyIdentifierCompanions` / `fillSellerPartyIdentifierCompanions` fills **scheme + textual code + identifier** together whenever any party-identifier field is under test. Empty-identifier “accepted” cases then fail because scheme/code make identifier mandatory. Scheme and code must not both be present.

## Rules

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

## Dropdown sources (companions only)

| Party | Scheme field (Excel key) | Scheme Master | Code field | Code Master |
|---|---|---|---|---|
| Buyer | `Scheme identifier` (sentence case → first `Scheme Identifier` column) | `schemeIdentifierValidTestData` (`Master.ts`) | `Buyer Identifier (textual code)` | `buyerSellerIdentifierCodeValidTestData` (`Master.omnCore.ts`) |
| Seller | `Seller identifier - Scheme identifier` | `schemeIdentifierValidTestData` (`Master.ts`) | `Seller Identifier (textual code)` | `buyerSellerIdentifierCodeValidTestData` (`Master.omnCore.ts`) |

Pick one stable valid label per Master list for companion fills (e.g. first label containing “Tax Identification”, or the first list entry if that is absent). Never invent free text.

## Approach

Dedicated **companion × length** matrix for identifier free-text only. Remove identifier and textual-code fields from the generic conditional length loop so the old “fill both companions” path cannot run for those cases.

Runtime Excel (same pattern as format-context / seeded field validation):

1. Seed valid Oman Full Tax row (`buildValidOmanFullTaxInvoiceRow`).
2. Apply companion mode (patch exactly zero or one dropdown companion; clear the other).
3. Patch identifier to the length under test.
4. Upload: `uploadAndVerify` or `runErrorValidation`.

Do not upload static packs for this suite.

## Layers

| Layer | Path | Change |
|---|---|---|
| Config | `testData/FieldValidations/` (new small module or extend `Min_max_field_validation.ts`) | Companion modes + expected outcomes; reuse existing min/max numbers |
| Config | `testData/FieldValidations/Min_max_field_validation.ts` | Remove `Buyer Identifier (textual code)` and `Seller Identifier (textual code)` from `fieldValidationConditional` |
| Spec | `tests/OMN_FieldValidation_CovoroTemplate_Test.spec.ts` | Skip buyer/seller identifier from generic conditional length; add dedicated describe for companion matrix |
| Helper | `Helpers/omanFieldValidationExcelHelper.ts` | `generateOmanPartyIdentifierLengthExcel({ party, companion, length })` |
| Helper | `Helpers/fieldValidationExcelPackHelper.ts` | Stop filling scheme **and** code together in party-identifier companions (XOR or leave companion selection to the new generator) |

## Spec titles (examples)

```
Verify Excel upload is accepted for Covoro Conditional – Buyer identifier (empty, no scheme/code).
Verify Excel upload returns an error file for Covoro Conditional – Buyer identifier (minimum length (1 char), no scheme/code).
Verify Excel upload is accepted for Covoro Conditional – Buyer identifier (minimum length (1 char), scheme only).
Verify Excel upload returns an error file for Covoro Conditional – Buyer identifier (empty, scheme only).
Verify Excel upload is accepted for Covoro Conditional – Buyer identifier (maximum length (30 chars), code only).
…
```

Same pattern for Seller.

## Test count

3 companion modes × 4 lengths × 2 parties = **24** tests.

## Out of suite after change

| Field | Where it lives instead |
|---|---|
| Buyer/Seller scheme dropdowns | Existing dropdown master/invalid suites |
| Buyer/Seller textual-code dropdowns | Existing dropdown master/invalid suites |
| Buyer/Seller identifier free-text length | New companion matrix only |

## Verification

```bash
npx playwright test tests/OMN_FieldValidation_CovoroTemplate_Test.spec.ts --project=chromium --grep "Buyer identifier"
npx playwright test tests/OMN_FieldValidation_CovoroTemplate_Test.spec.ts --project=chromium --grep "Seller identifier"
```

Optional smoke: generate one workbook per companion mode and assert Excel cells (scheme XOR code, identifier length).
