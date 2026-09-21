# Local one-shot generators

These CLIs are **not in git**. They live under gitignored `local/` on a developer machine.
Live Playwright generation still uses `utils/excel/` and `Helpers/excel/`.

Copy this folder from a machine that already has it, or restore from backup, then run from the **repo root**.

## Layout

| Folder | What |
|--------|------|
| `local/excel-packs/` | Field / formula / conditional / submit / dropdown / matrix / driver CLIs |
| `local/bulk-submit/` | Bulk and many-items Python generators |
| `local/audit/` | Coverage, unmapped, alignment, reorg |

CI stays in `scripts/` (`ci_*.sh`, `playwright_json_summary.py`, `run-test-suite.mjs`, `verify_consecutive_fail_skip.ts`).

## Excel packs

```bash
npx tsx local/excel-packs/generate_field_validation_oman_excels.ts --all
npx tsx local/excel-packs/generate_formula_validation_oman_excels.ts --all
npx tsx local/excel-packs/generate_conditional_validation_oman_excels.ts --all
npx tsx local/excel-packs/generate_dropdown_field_packs.ts
npx tsx local/excel-packs/generate_submit_invoice_excels.ts --all --limit 2
npx tsx local/excel-packs/generate_valid_oman_invoice.ts
npx tsx local/excel-packs/generate_copy_validation_matrix.ts
npx tsx local/excel-packs/generate_simplified_validation_matrix.ts
npx tsx local/excel-packs/generate_excel_from_drivers.ts
```

## Bulk submit

If `local/bulk-submit/generate_bulk_submit_multiline.py` is missing, restore the **real** generator (not the old `scripts/` shim) into that folder.

```bash
python local/bulk-submit/generate_one_invoice_1000_items.py
python local/bulk-submit/prepare_parallel_perf_excels.py
```

## Audit

```bash
npx tsx local/audit/audit_conditional_pack_coverage.ts
python local/audit/list_unmapped_conditional_rules.py
```
