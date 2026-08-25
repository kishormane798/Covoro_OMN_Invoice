# Design: Thin Covoro Excel specs (tests-only)

**Date:** 2026-08-24  
**Status:** Approved  
**Scope:** Covoro Excel upload specs only (`Field` / `Formula` / `Conditional` / `Submit` / `Submit MultiItem`)

## Goal

Each Covoro Excel `*.spec.ts` keeps only Playwright tests (imports + `test.describe` / `test`). Non-test setup moves out:

- **Datasets** → `testData/` (already mostly there; do not duplicate)
- **Orchestration constants / filters / timeouts / skip sets** → `Helpers/excel/*SpecSupport.ts`

## Approach

One support module per flow under `Helpers/excel/` (not spec-local `tests/*_support.ts`, not stuffing every constant into existing large helpers).

## Target files

| Spec | Support module |
|------|----------------|
| `OMN_FieldValidation_CovoroTemplate_Test.spec.ts` | `Helpers/excel/fieldValidationSpecSupport.ts` |
| `OMN_SubmitInvoice_CovoroTemplate_Test.spec.ts` | `Helpers/excel/submitInvoiceSpecSupport.ts` |
| `OMN_SubmitInvoice_MultiItem_CovoroTemplate_Test.spec.ts` | same support (multi-item exports) |
| `OMN_FormulaValidation_CovoroTemplate_Test.spec.ts` | `Helpers/excel/formulaValidationSpecSupport.ts` |
| `OMN_ConditionalValidation_CovoroTemplate_Test.spec.ts` | no new file unless leftovers found |

## Spec rules after change

- Allowed: imports, `test.describe` / `test`, loops that only call helpers using imported support values
- Not allowed in specs: local skip `Set`s, filtered config arrays, timeout constants, expected-count math, merged dropdown configs

## Implementation order

1. FieldValidation  
2. Submit + MultiItem  
3. Formula  
4. Conditional (verify / fix leftovers)

## Out of scope

- UI / KishorLocal specs  
- Behavior changes  
- Symbol renames unrelated to the move

## Risk

Low–medium: import path churn only; no logic changes if moved verbatim.
