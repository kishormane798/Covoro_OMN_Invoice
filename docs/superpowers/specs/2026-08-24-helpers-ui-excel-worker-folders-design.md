# Design: Split `Helpers/` into `ui/`, `excel/`, `worker/` (+ shared root)

**Date:** 2026-08-24  
**Status:** Approved + implemented  
**Approach:** Flat subfolders (no barrel `index.ts`, no renames, no shims)

## Goal

Mirror the `utils/excel` + `utils/ui` split: group Helpers by domain so upload/Excel flows, UI flows, and parallel-worker identity stay easy to find.

## Target layout

```
Helpers/
  ui/                 # already present — left in place
  excel/
    fieldValidationHelper.ts
    fieldValidationExcelPackHelper.ts
    formulaValidationHelper.ts
    formulaValidationExcelPackHelper.ts
    conditionalValidationHelper.ts
    conditionalValidationExcelPackHelper.ts
    conditionalValidationSpecHelpers.ts
    omanFieldValidationExcelHelper.ts
    formatContextFieldValidationHelper.ts
    excelEditMessageCheck.ts
    invoiceExcelRoundTripHelper.ts
    simplifiedTemplateContext.ts
    invoiceDriverProfileHelper.ts
    uploadHelper.ts
    submitInvoiceCaseHelper.ts
  worker/
    parallelWorkerSubmitIdentity.ts
  # shared root
  diagnosticLog.ts
  waitForWithPageRefresh.ts
  packProgressReporter.ts
```

## Rules

- Filenames unchanged.
- No barrels / no re-export shims at old paths.
- Shared helpers stay at `Helpers/` root (option C — no `other/`).
- `uploadHelper` + `submitInvoiceCaseHelper` live under `excel/` (option B).

## Required updates

1. Move listed files into `Helpers/excel/` and `Helpers/worker/`.
2. Fix relative imports inside moved files (`../utils` → `../../utils`, sibling helpers, `../worker/...`, `../diagnosticLog`, etc.).
3. Update all consumers (tests, scripts, `Src/`, pageObjects, testData, commented imports).
4. Update docs/skills/rules that cite old `Helpers/<file>` paths.

## Out of scope

- Behavior changes
- Renaming symbols or stripping prefixes
- Moving or renaming anything under `Helpers/ui/` (except import path fixes to moved siblings)
- Updating `previous-code/` archive

## Risk

Medium import blast radius; logic unchanged.
