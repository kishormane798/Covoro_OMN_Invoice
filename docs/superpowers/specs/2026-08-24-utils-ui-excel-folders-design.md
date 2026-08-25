# Design: Split `utils/` into `ui/` and `excel/`

**Date:** 2026-08-24  
**Status:** Approved  
**Approach:** Flat subfolders (no barrel `index.ts`, no renames)

## Goal

Organize `utils/` the same way as `Helpers/ui/` and `pageObjects/ui/`: Excel infrastructure under `utils/excel/`, UI utilities under `utils/ui/`, shared infra stays at `utils/` root.

## Target layout

```
utils/
  appConfig.ts
  app_config.py
  global-setup.ts
  siteUnavailableMarker.ts
  envPartyIdentity.ts
  pythonRunner.ts
  excel/
    invoiceExcel.ts
    invoiceExcelRoundTrip.ts
    invoice_excel_writer.py
    error_excel_reader.py
    invoice_excel_roundtrip.py
    test_invoice_excel_roundtrip.py
    invoice_excel_header_lookup_test.py
    read_*_validation_matrix.py
    batch_*.py
    fast_patch_source_currency.py
  ui/
    uiAttachmentFiles.ts
```

## Rules

- Filenames unchanged.
- No barrel re-exports; no shims at old paths.
- Shared root files stay put (`pythonRunner`, `appConfig`, env/outage/setup).
- `app_config.py` stays at `utils/` root; Excel Python adds parent `utils/` to `sys.path` so `from app_config import …` still works.

## Required updates

1. Move Excel TS/Python into `utils/excel/`.
2. Fix relative imports in moved TS (`../pythonRunner`, `../envPartyIdentity`, `../../testData/...`).
3. Update hardcoded `process.cwd()/utils/*.py` paths to `utils/excel/*.py` in TS call sites.
4. Update consumer imports to `utils/excel/...` and `utils/ui/...`.
5. Update docs/skills/rules that cite old paths.

## Out of scope

- Behavior / calculation / API changes
- Renaming symbols or stripping `ui` prefixes
- Moving shared root utils into a third folder

## Risk

Medium import/path blast radius; logic unchanged. Verify by compile/import resolution after move (run only when user says **run**).
