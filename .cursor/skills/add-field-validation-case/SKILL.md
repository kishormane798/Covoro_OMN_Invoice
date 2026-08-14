---
name: add-field-validation-case
description: Add Excel upload field validation tests (accept or error file). Use when adding min/max, dropdown, date, or null/empty field validation for Covoro/OMN templates. For if-then PINT-OM conditionals, use add-conditional-validation-case instead.
---

# Add Field Validation Case

## When to use

- New field validation scenario via Excel upload (not UI form)
- Valid upload accepted, or invalid upload → error workbook
- **Not** for Oman if-then conditionals (`ALIGNED-IBRP-*-OM` / `IBR-*-OM`) — use `add-conditional-validation-case`

## Key files

| Purpose | Path |
|---------|------|
| Covoro spec | `tests/FieldValidation_CovoroTemplate_Test.spec.ts` |
| Configs | `testData/FieldValidations/` |
| Upload flow | `Helpers/uploadHelper.ts` |
| Error assert | `Helpers/excelEditMessageCheck.ts`, `Helpers/fieldValidationHelper.ts` |
| Excel utils | `utils/invoiceExcel.ts` |

## Workflow

### 1. Add or extend config in `testData/FieldValidations/`

Follow the existing file for that field (e.g. `uiInvoiceCreationFieldMinMax.ts`, `Min_max_field_validation.ts`, dropdown configs in `index.ts`).

Field names must match **template Excel headers** used by `updateExcelField` / writer.

### 2. Wire into spec with data-driven loop

**Valid (accepted):**

```ts
const filePath = await updateExcelField(config.field, config.min);
await uploadAndVerify(page, filePath);
```

**Invalid (error file):**

```ts
await runErrorValidation(page, {
  filePath,
  field: "Invoice Number",
  invoiceNumber,
  checkEdit: true,
});
```

Or use `verifyErrorFile(page, field)` from `fieldValidationHelper.ts`.

### 3. Test title format

```
Excel upload · {Template} | {Section} | {Field} | {condition} → {accepted|error file}
```

Example:

```
Excel upload · Covoro | Document | Invoice Number | empty → error file
```

### 4. Template handling

- Covoro/OMN: `const TEMPLATE = "Covoro"` in spec (default `template.xlsx`)

### 5. Run

```bash
npm run test:covoro
npx playwright test tests/FieldValidation_CovoroTemplate_Test.spec.ts --grep "Invoice Number"
```

Error validation uses `validateErrorFileColumn` via Python reader — field string must match Errors column expectations.

## Checklist

- [ ] Config in `testData/`, not hardcoded in spec
- [ ] Field name matches template header mapping
- [ ] Title states condition and outcome clearly
- [ ] Long dropdown suites use appropriate timeout (see existing specs, e.g. 6–10 min)
- [ ] Error cases attach/download workbook correctly on failure
