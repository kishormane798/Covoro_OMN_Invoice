---
name: add-conditional-validation-case
description: >-
  Add Oman PINT-OM Excel upload conditional validation tests (ALIGNED-IBRP-*-OM /
  IBR-*-OM). Use when adding if-then conditional rules, replacing UAE conditional
  cases, or extending ConditionalValidation_CovoroTemplate_Test. Not for simple
  min/max field validation or formula totals.
---

# Add Oman Conditional Validation Case

## When to use

- New **if-then** Excel upload rule from Conditional Validations / PINT OM
- Extending [`tests/OMN_ConditionalValidation_CovoroTemplate_Test.spec.ts`](../../tests/OMN_ConditionalValidation_CovoroTemplate_Test.spec.ts)

**Do not use** for min/max/dropdown-only (`add-field-validation-case`) or Σ/totals (`add-formula-validation-case`).

## Key files

| Purpose | Path |
|---------|------|
| Scenarios | `testData/FieldValidations/ConditionalValidation.ts` |
| Row builders | `Helpers/conditionalValidationHelper.ts` |
| Spec helpers | `Helpers/conditionalValidationSpecHelpers.ts` |
| Spec | `tests/OMN_ConditionalValidation_CovoroTemplate_Test.spec.ts` |
| Rule inventory | [reference.md](reference.md) |
| Oman labels | `testData/FieldValidations/Master.omnCore.ts` |

## Workflow

0. **REQUIRED SUB-SKILL:** Use `expand-omn-conditional-rule`. Fill the coverage card. Do not add scenarios while **Missing** is non-empty.
1. Pick one `ruleId` from [reference.md](reference.md). Confirm triage = **COND**.
2. If sheet text is truncated, open Peppol: `https://test-docs.peppol.eu/pint/pint-om/2026-Q2-v1.0.1/pint-om/trn-invoice/rule/{ruleId}/`
3. Map IBT/BTOM fields → Covoro template headers (row 4) via `expand-omn-conditional-rule` reference.
4. Add scenarios with required `ruleId`, `title`, `shouldError`, driving fields, `expectedErrorField`.
5. Add `build*ScenarioRow` using Oman seed defaults (OMR, Full Tax Invoice, Oman tax labels).
6. Wire one `test.describe` loop → `verifyConditionalScenario` / `verifyConditionalScenarioAnyOf`.
7. Run: `npx playwright test tests/OMN_ConditionalValidation_CovoroTemplate_Test.spec.ts --grep "{ruleId}"`

## Scenario shape

```ts
export type OmanConditionalScenario = {
  ruleId: string;
  title: string;
  shouldError: boolean;
  expectedErrorField?: string;
};
```

Title format:

```
Excel upload · Covoro | {ruleId} | {short condition} → {accepted|error file}
```

## Checklist

- [ ] `ruleId` is `*-OM` (no BTUAE / Emirates / UAE TIN)
- [ ] Coverage card complete (every named source / category / type / exception)
- [ ] Allowed + Not Allowed + each exception + wrong-target (T on Y → error)
- [ ] Field names match template headers
- [ ] No formula/Σ assertion in this suite
- [ ] One rule group per agent turn
