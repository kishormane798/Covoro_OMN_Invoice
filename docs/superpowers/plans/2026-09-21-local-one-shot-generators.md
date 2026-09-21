# Local One-Shot Generators Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. REQUIRED BACKGROUND: `wait-for-explicit-run` — do not run Playwright / npm / `npx tsx` / Python generators until the user says **run**. Do not commit unless the user explicitly asks. File copies and edits may use Read/Write/Delete; do not use Shell for `git` unless the user asked to commit or said **run**.

**Goal:** Move one-shot Excel pack, bulk-submit, and audit/reorg CLIs onto a gitignored `local/` tree; leave CI in `scripts/` and live Excel APIs in `utils/` / `Helpers/`; document commands in `docs/local-generators.md`.

**Architecture:** Copy CLIs into `local/excel-packs/`, `local/bulk-submit/`, and `local/audit/` with one extra `../` on TypeScript imports. Delete the same files from `scripts/`. No shims. Pack helpers stay; only README command strings change.

**Tech Stack:** Existing `npx tsx` CLIs, Python 3 one-shots, Playwright framework unchanged.

## Global Constraints

- `local/` is gitignored and never committed
- Clean break: no `scripts/generate_*` wrappers
- `scripts/` after the move contains only: `ci_queue_next.sh`, `ci_queue_next_test.sh`, `ci_playwright_shard_plan.sh`, `playwright_json_summary.py`, `run-test-suite.mjs`, `verify_consecutive_fail_skip.ts`
- Do not refactor `Helpers/excel/*` APIs or Playwright specs
- Do not rewrite historical `docs/superpowers/plans/` or old specs
- Do not commit unless the user explicitly asks
- Do not run generators or Playwright until the user says **run**
- Approved batch: moved CLIs under `local/`, deletions from `scripts/`, `.gitignore`, three pack-helper README strings, generate-excel skill examples, `docs/local-generators.md`

## File map

| Path | Responsibility |
|------|----------------|
| `local/excel-packs/*.ts` | One-shot pack / matrix / driver CLIs (gitignored) |
| `local/bulk-submit/*.py` | Bulk / many-items / parallel-perf generators (gitignored) |
| `local/audit/*` | Coverage, unmapped, alignment, reorg (gitignored) |
| `scripts/` | CI + consecutive-fail-skip verify only |
| `.gitignore` | `/local/` |
| `Helpers/excel/fieldValidationExcelPackHelper.ts` | `writePackReadme` regenerate commands |
| `Helpers/excel/formulaValidationExcelPackHelper.ts` | `writeFormulaPackReadme` regenerate commands |
| `Helpers/excel/conditionalValidationExcelPackHelper.ts` | `writeConditionalPackReadme` regenerate commands |
| `.cursor/skills/generate-excel-from-testcase/SKILL.md` | Example CLI path |
| `.cursor/skills/generate-excel-from-testcase/reference.md` | Example CLI path |
| `docs/local-generators.md` | Committed catalog |
| `docs/superpowers/specs/2026-09-21-local-one-shot-generators-design.md` | Spec (already written) |

GitNexus: `writePackReadme`, `writeFormulaPackReadme`, `writeConditionalPackReadme` are string-only edits (LOW). Do not change generator function signatures.

---

### Task 1: `local/excel-packs` TypeScript CLIs

**Files:**
- Create (gitignored copies): `local/excel-packs/` — the 13 files listed below, copied from `scripts/`
- Delete from git tree: the same 13 files under `scripts/` after the copies are written

**Interfaces:**
- Consumes: existing `Helpers/excel/*`, `utils/*`, `testData/*` modules (unchanged exports)
- Produces: same CLI argv as today, invoked as `npx tsx local/excel-packs/<file>.ts`

Copy these files from `scripts/` to `local/excel-packs/`:

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

- [ ] **Step 1: Write copies and apply the import hop**

In every copied `.ts` file, replace import specifiers:

- `"../Helpers/` → `"../../Helpers/`
- `'../Helpers/` → `'../../Helpers/`
- `"../utils/` → `"../../utils/`
- `'../utils/` → `'../../utils/`
- `"../testData/` → `"../../testData/`
- `'../testData/` → `'../../testData/`

Leave `import "dotenv/config"` unchanged.

- [ ] **Step 2: Rewrite usage comments and spawn path**

Comment / usage string replacements (exact):

| Old | New |
|-----|-----|
| `npx tsx scripts/generate_field_validation_oman_excels.ts` | `npx tsx local/excel-packs/generate_field_validation_oman_excels.ts` |
| `npx tsx scripts/generate_formula_validation_oman_excels.ts` | `npx tsx local/excel-packs/generate_formula_validation_oman_excels.ts` |
| `npx tsx scripts/generate_conditional_validation_oman_excels.ts` | `npx tsx local/excel-packs/generate_conditional_validation_oman_excels.ts` |
| `npx tsx scripts/generate_submit_invoice_excels.ts` | `npx tsx local/excel-packs/generate_submit_invoice_excels.ts` |
| `npx tsx scripts/generate_valid_oman_invoice.ts` | `npx tsx local/excel-packs/generate_valid_oman_invoice.ts` |
| `npx ts-node scripts/generate_excel_from_drivers.ts` | `npx tsx local/excel-packs/generate_excel_from_drivers.ts` |
| `npx tsx scripts/regen_multi_value_pack_expand.ts` | `npx tsx local/excel-packs/regen_multi_value_pack_expand.ts` |

In `local/excel-packs/regen_multi_value_pack_expand.ts`, the `spawn` argv file must be:

```ts
"local/excel-packs/generate_conditional_validation_oman_excels.ts",
```

not `"scripts/generate_conditional_validation_oman_excels.ts"`.

- [ ] **Step 3: Delete the 13 files from `scripts/`**

Use Delete on each `scripts/<name>.ts` listed above. Do not leave shims.

- [ ] **Step 4: Static check (no Shell until user says run)**

Grep the new files: no remaining `"../Helpers/`, `"../utils/`, `"../testData/`, or `scripts/generate_`.  
Grep `scripts/*.ts`: the 13 names must be gone; `verify_consecutive_fail_skip.ts` must still import `../utils/consecutiveFailSkip`.

---

### Task 2: `local/audit` and `local/bulk-submit`

**Files:**
- Create: `local/audit/` copies of the 10 audit/reorg files
- Create: `local/bulk-submit/generate_one_invoice_1000_items.py`, `local/bulk-submit/prepare_parallel_perf_excels.py`
- Delete from `scripts/`: those files plus the two bulk **shims**

**Interfaces:**
- Consumes: colocated `list_unmapped_conditional_rules.py` via `Path(__file__).with_name(...)` (keep same filenames in `local/audit/`)
- Produces: same Python CLIs, run from repo root as `python local/audit/<file>.py` / `python local/bulk-submit/<file>.py`

Copy to `local/audit/`:

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

- [ ] **Step 1: Copy audit TypeScript and apply the same import hop as Task 1**

`audit_conditional_pack_coverage.ts`: `"../Helpers/` → `"../../Helpers/`.

Usage comment:

```
Usage: npx tsx local/audit/audit_conditional_pack_coverage.ts
```

Sync comment:

```
// Keep in sync with local/audit/list_unmapped_conditional_rules.py /
```

- [ ] **Step 2: Copy audit Python; rewrite `scripts/` comments only**

In `list_unmapped_conditional_exact_titles.py` and `update_conditional_plain_language_guide.py`:

- `scripts/list_unmapped_conditional_rules.py` → `local/audit/list_unmapped_conditional_rules.py`

Do not change `Path("testcase/...")` or hardcoded Downloads paths in `oman_alignment_check.py`.

- [ ] **Step 3: Copy bulk Python that is real code; do not copy shims**

`scripts/generate_bulk_submit_single_line.py` and `scripts/generate_bulk_submit_multiline.py` are **shims** (`runpy` into `tests/kishorsubmit/scripts/...`). Delete them from `scripts/`. Do **not** write those shims into `local/bulk-submit/`.

If real generators already exist at `tests/kishorsubmit/scripts/generate_bulk_submit_multiline.py` (or `single_line`), copy those real files into `local/bulk-submit/` and then leave `tests/kishorsubmit` alone (out of scope to delete that tree). If they do not exist, skip creating fake bulk generators; the catalog in Task 5 states they must be restored from backup into `local/bulk-submit/`.

Copy `generate_one_invoice_1000_items.py` and `prepare_parallel_perf_excels.py`.

In `local/bulk-submit/generate_one_invoice_1000_items.py` set:

```python
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
BULK_MULTILINE_PATH = os.path.join(
    REPO_ROOT, "local", "bulk-submit", "generate_bulk_submit_multiline.py"
)
```

(`REPO_ROOT` must use two `..` hops: `local/bulk-submit` → repo root. Today it uses one hop because the file lives in `scripts/`.)

Usage comments:

```
  python local/bulk-submit/generate_one_invoice_1000_items.py
```

In `prepare_parallel_perf_excels.py` usage:

```
  python local/bulk-submit/prepare_parallel_perf_excels.py
```

- [ ] **Step 4: Delete the moved/shim files from `scripts/`**

Delete every file copied in this task, plus the two bulk shims, from `scripts/`.

---

### Task 3: `.gitignore`

**Files:**
- Modify: `.gitignore` (block starting `# Local one-off data generation scripts`)

**Interfaces:**
- Consumes: Task 1–2 file locations
- Produces: `/local/` ignored; obsolete `/scripts/generate_bulk_*` lines removed

- [ ] **Step 1: Replace the one-off scripts ignore block**

Replace:

```
# Local one-off data generation scripts (not framework code)
/scripts/covoro_batch/
/scripts/generate_bulk_submit_single_line.py
/scripts/generate_bulk_submit_multiline.py
/scripts/generate_bulk_submit_invoices.py
/scripts/generate_one_invoice_1000_items.py
/scripts/prepare_parallel_perf_excels.py
```

with:

```
# Local one-off data generation (Excel packs, bulk submit, audit CLIs)
/local/

# Local one-off Covoro batch extras (not framework code)
/scripts/covoro_batch/
```

Keep `/tests/KishorLocal/` and `/testcase/` unchanged.

- [ ] **Step 2: Static check**

`.gitignore` contains `/local/`. It does not list individual `scripts/generate_bulk_submit_*.py` paths.

---

### Task 4: Pack README strings and generate-excel skill

**Files:**
- Modify: `Helpers/excel/fieldValidationExcelPackHelper.ts` (`writePackReadme` regenerate bash block)
- Modify: `Helpers/excel/formulaValidationExcelPackHelper.ts` (`writeFormulaPackReadme` regenerate bash block)
- Modify: `Helpers/excel/conditionalValidationExcelPackHelper.ts` (`writeConditionalPackReadme` regenerate bash block)
- Modify: `.cursor/skills/generate-excel-from-testcase/SKILL.md`
- Modify: `.cursor/skills/generate-excel-from-testcase/reference.md`

**Interfaces:**
- Consumes: Task 1 CLI paths
- Produces: regenerated pack README text that points at `local/excel-packs/`

GitNexus before edit: `impact` on `writePackReadme`, `writeFormulaPackReadme`, `writeConditionalPackReadme` (upstream). Expect LOW (string arrays only). Stop if HIGH/CRITICAL.

- [ ] **Step 1: Field pack README commands**

In `writePackReadme`, the bash fence must be:

```
npx tsx local/excel-packs/generate_field_validation_oman_excels.ts --section "DOCUMENT DETAILS"
npx tsx local/excel-packs/generate_field_validation_oman_excels.ts --all
npx tsx local/excel-packs/generate_dropdown_field_packs.ts
```

- [ ] **Step 2: Formula pack README commands**

In `writeFormulaPackReadme`:

```
npx tsx local/excel-packs/generate_formula_validation_oman_excels.ts --section "ITEM PRICE"
npx tsx local/excel-packs/generate_formula_validation_oman_excels.ts --all
```

- [ ] **Step 3: Conditional pack README commands**

In `writeConditionalPackReadme`:

```
npx tsx local/excel-packs/generate_conditional_validation_oman_excels.ts --all
npx tsx local/excel-packs/generate_conditional_validation_oman_excels.ts --rule ALIGNED-IBRP-028-OM
```

- [ ] **Step 4: Skill examples**

`SKILL.md` smoke block:

```bash
npx tsx local/excel-packs/generate_valid_oman_invoice.ts
```

`reference.md` table row: `` `local/excel-packs/generate_valid_oman_invoice.ts` `` (not `scripts/generate_valid_oman_invoice.ts`).

- [ ] **Step 5: Static check**

Grep `Helpers/excel/*PackHelper.ts` and `.cursor/skills/generate-excel-from-testcase/`: no `scripts/generate_`.

---

### Task 5: Catalog doc

**Files:**
- Create: `docs/local-generators.md`
- Modify: `docs/superpowers/specs/2026-09-21-local-one-shot-generators-design.md` — set Status to `Approved — plan written`

**Interfaces:**
- Consumes: final `local/` layout from Tasks 1–2
- Produces: committed command catalog (no generator source)

- [ ] **Step 1: Write `docs/local-generators.md`**

```markdown
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
```

- [ ] **Step 2: Update spec status line**

Change Status to: `Approved — plan written` (implementation follows this plan).

- [ ] **Step 3: Verification after the user says run**

Expected:

- `git status`: deletions under `scripts/` for one-shot files; `local/` ignored; `docs/local-generators.md` and helper/skill/gitignore diffs unstaged
- `scripts/` listing: only CI + `verify_consecutive_fail_skip.ts`
- Optional import smoke: `npx tsx local/excel-packs/generate_field_validation_oman_excels.ts` prints usage or runs argparse (do **not** pass `--all` unless asked)

- [ ] **Step 4: Commit only if the user asks**

If asked:

```
docs/local-generators.md
docs/superpowers/specs/2026-09-21-local-one-shot-generators-design.md
docs/superpowers/plans/2026-09-21-local-one-shot-generators.md
.gitignore
Helpers/excel/fieldValidationExcelPackHelper.ts
Helpers/excel/formulaValidationExcelPackHelper.ts
Helpers/excel/conditionalValidationExcelPackHelper.ts
.cursor/skills/generate-excel-from-testcase/SKILL.md
.cursor/skills/generate-excel-from-testcase/reference.md
```

plus the `scripts/` deletions. Do **not** add `local/`.

Message:

```
chore: move one-shot generators out of scripts into gitignored local/

Keep CI scripts in scripts/; document commands in docs/local-generators.md.
```
