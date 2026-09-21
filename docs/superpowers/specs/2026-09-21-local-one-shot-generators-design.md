# Design: Local one-shot generators

**Date:** 2026-09-21  
**Status:** Approved — plan written; implementation in workspace  
**Approach:** Gitignored `local/` for one-shot CLIs; `scripts/` stays CI-only; live Excel APIs stay in `utils/` and `Helpers/`.

## Goal

Keep the shared repo limited to framework + CI. Bulk invoice generation, Excel pack generation, and audit/reorg/alignment CLIs live on the developer machine under `local/`, not in git. Teammates still see **how** to run those tools via a short committed catalog.

## Decisions (locked)

| Topic | Choice |
|-------|--------|
| Root folder | Gitignored `local/` at repo root (not `tests/KishorLocal/`) |
| Old `scripts/generate_*` commands | Clean break — no shims |
| What moves | Generation **and** audit/reorg/alignment |
| What stays in `scripts/` | CI only |
| Helper/API refactor | Out of scope — relocate + path/comment updates only |
| Catalog | Committed `docs/local-generators.md` (commands only, no generator source) |

## Layout

```
local/                          # gitignored — never committed
  excel-packs/                  # field / formula / conditional / submit / dropdown / matrix CLIs
  bulk-submit/                  # bulk + many-items + parallel-perf Python
  audit/                        # coverage, alignment, unmapped, reorg

scripts/                        # git — CI only
  ci_queue_next.sh
  ci_queue_next_test.sh
  ci_playwright_shard_plan.sh
  playwright_json_summary.py
  run-test-suite.mjs
  verify_consecutive_fail_skip.ts

utils/excel/                    # git — live generation used by Playwright
Helpers/excel/                  # git — pack helpers used by tests and by local CLIs
```

Playwright tests continue to call `generateInvoiceExcel`, `generateInvoiceFromSubmitData`, `generateBulkSingleItemSubmitInvoices`, and pack helpers from `utils/` / `Helpers/`. Those APIs do not move.

## Files to move onto disk under `local/` then `git rm` from `scripts/`

### `local/excel-packs/`

- `generate_field_validation_oman_excels.ts`
- `generate_formula_validation_oman_excels.ts`
- `generate_conditional_validation_oman_excels.ts`
- `generate_submit_invoice_excels.ts`
- `generate_dropdown_field_packs.ts`
- `generate_excel_from_drivers.ts`
- `generate_valid_oman_invoice.ts`
- `generate_copy_validation_matrix.ts`
- `generate_simplified_validation_matrix.ts`
- `_refresh_formula_pack_readme.ts`
- `reorganize_field_validation_pack.ts`
- `regen_multi_value_pack_expand.ts`
- `patch_field_validation_identity.ts`

### `local/bulk-submit/`

- `generate_bulk_submit_single_line.py`
- `generate_bulk_submit_multiline.py`
- `generate_one_invoice_1000_items.py`
- `prepare_parallel_perf_excels.py`

Drop leftover shims that forwarded to `tests/kishorsubmit`. After the move, those Python files are real generators only.

### `local/audit/`

- `audit_conditional_pack_coverage.ts`
- `list_unmapped_conditional_rules.py`
- `list_unmapped_conditional_exact_titles.py`
- `export_conditional_skip_and_unmapped.py`
- `export_conditional_matrix_mapped_filed_names.py`
- `update_conditional_plain_language_guide.py`
- `oman_alignment_check.py`
- `oman_alignment_check2.py`
- `oman_rule_coverage.py`
- `_reorg_formula_testdata_by_field.py`

## Changes inside moved files

- TypeScript imports from repo root modules: `../Helpers` → `../../Helpers` (same for `utils/`, `testData/`).
- Header usage comments: `npx tsx scripts/...` → `npx tsx local/excel-packs/...` or `local/audit/...`; `python scripts/...` → `python local/bulk-submit/...` or `local/audit/...`.
- Cross-CLI spawn paths (example: `regen_multi_value_pack_expand.ts` invoking the conditional generator) point at the new `local/` path.
- Python files that stay in the same `local/` subfolder keep relative imports to each other.

## Shared-repo edits (git)

| Path | Change |
|------|--------|
| `.gitignore` | Add `/local/`. Remove obsolete `/scripts/generate_bulk_*` and `prepare_parallel_perf_excels.py` ignores after those files leave `scripts/`. Keep `/scripts/covoro_batch/` if that folder is still used. |
| `docs/local-generators.md` | New catalog: folder map + example commands. No source copies. |
| `Helpers/excel/fieldValidationExcelPackHelper.ts` | Pack README command strings → `local/excel-packs/` |
| `Helpers/excel/formulaValidationExcelPackHelper.ts` | Same |
| `Helpers/excel/conditionalValidationExcelPackHelper.ts` | Same |
| `.cursor/skills/generate-excel-from-testcase/SKILL.md` | Example CLI path |
| `.cursor/skills/generate-excel-from-testcase/reference.md` | Example CLI path |

## Git mechanics

1. Copy (or `git mv` then untrack) files onto disk under `local/`.
2. `git rm` the same files from `scripts/` so they leave the shared repo.
3. Do not `git add local/`.
4. No thin wrappers left in `scripts/`.

After the change, a fresh clone has no generators until the operator copies `local/` from a machine that already has it (or restores from backup). The catalog documents commands for that local copy.

## Out of scope

- Refactoring pack helpers or Excel writer APIs
- Playwright spec changes
- CI workflow edits (`scripts/ci_*` and `playwright_json_summary.py` stay)
- Rewriting historical `docs/superpowers/plans/` or `specs/` that mention old `scripts/generate_*` paths
- DRY / shared argv parser for the generate CLIs

## Error handling

- Missing `local/` on a teammate machine: documented as expected; catalog explains the folder is gitignored.
- Broken relative imports after the extra directory hop: fail at CLI start (`Cannot find module`); fix imports as part of the move, not at runtime.
- Accidental `git add local/`: `.gitignore` `/local/` is the control.

## Verification (only after the user says **run**)

- `git status`: `scripts/` contains only CI leftovers; `local/` is untracked/ignored.
- Spot-check one TypeScript CLI: `npx tsx local/excel-packs/generate_field_validation_oman_excels.ts` (help/usage or `--help` if present) resolves imports.
- Do not run full pack generation or Playwright unless the user says **run**.

## Implementation order (for the follow-on plan)

1. Create `local/` tree and copy scripts; fix imports and comments.
2. `git rm` from `scripts/`; update `.gitignore`.
3. Update helper README strings and generate-excel skill examples.
4. Add `docs/local-generators.md`.
