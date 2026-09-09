# Simplified validation FullMatrix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate one Simplified catalog Excel (`Field` / `Formula` / `Conditional` sheets) by filtering the three Oman FullMatrix workbooks to columns that exist on `SimplifiedTemplate.xlsx`.

**Architecture:** TypeScript keep/drop uses existing Oman field aliases and `SIMPLIFIED_TEMPLATE_HEADER_LABELS`. Python/openpyxl copies full source rows for kept Test Case IDs into the combined workbook so Preconditions/Steps/Expected are not lost.

**Tech Stack:** TypeScript (`npx tsx`), Python openpyxl, existing matrix loaders in `Helpers/excel/*ExcelPackHelper.ts`, `runPythonForStdout`.

**Spec:** `docs/superpowers/specs/2026-09-09-simplified-validation-matrix-design.md`

## Global Constraints

- Do not run Playwright, Python, npm, tsx, or shell until the user says **run** / **execute** / **go ahead and run** (`wait-for-explicit-run`).
- Do not commit unless the user explicitly asks (skip every Commit step until then).
- No new Playwright spec. Do not edit `tests/**`.
- No per-case `TC-*.xlsx` packs. Do not call `generateFieldValidationExcelPack` / formula / conditional pack generators.
- Do not apply Playwright-only skips (`isSimplifiedIgnoredPartyField`, `CONDITIONAL_LENGTH_SKIP`, third-party-only VATIN).
- Do not add buyer-master or self-billed TIN-swap rows.
- Do not modify `SIMPLIFIED_TEMPLATE_HEADER_LABELS` unless generation proves a mapping bug.
- Do not change existing pack helpers except exporting a symbol if keep/drop cannot reuse public APIs (prefer new helper only).
- Output path is gitignored: `testcase/simplified_validation/EINV_OMAN_Simplified_FullMatrix.xlsx`. Do not force-add it to git.
- Incremental-agent-edits: one primary file per task unless the user asks to execute the whole plan.

---

## File map

| File | Responsibility |
|---|---|
| Create: `Helpers/excel/simplifiedValidationMatrixHelper.ts` | Keep/drop + load Oman matrices + kept Test Case IDs per sheet |
| Create: `Helpers/excel/simplifiedValidationMatrixHelper.test.ts` | tsx assertions for keep/drop (no Jest) |
| Create: `utils/excel/write_simplified_validation_matrix.py` | Copy full source rows into the three-sheet output workbook |
| Create: `utils/excel/test_write_simplified_validation_matrix.py` | Python unittest for copy/filter/missing-column |
| Create: `scripts/generate_simplified_validation_matrix.ts` | CLI: missing-source fail, write plan JSON, invoke Python, print counts |

---

### Task 1: Keep/drop helper (pure header matching)

**Files:**
- Create: `Helpers/excel/simplifiedValidationMatrixHelper.test.ts`
- Create: `Helpers/excel/simplifiedValidationMatrixHelper.ts`

**Interfaces:**
- Consumes: `SIMPLIFIED_TEMPLATE_HEADER_LABELS`, `hasHeaderLabel`, `MATRIX_FIELD_TO_ROW_KEY`, `normalizeMatrixFieldLabel`, `matrixFieldLookupCandidates`, `resolveEffectiveMatrixField`, `resolveConditionalRowKey`, `buildValidOmanFullTaxInvoiceRow`, `loadFieldValidationMatrix`, `loadFormulaValidationMatrix`, `loadConditionalValidationMatrix`, `MATRIX_DEFAULT_PATH` from each pack helper
- Produces:
  - `export type SimplifiedMatrixSheetName = "Field" | "Formula" | "Conditional"`
  - `export type SimplifiedMatrixSheetPlan = { name: SimplifiedMatrixSheetName; sourcePath: string; keepIds: string[]; kept: number; dropped: number }`
  - `export type SimplifiedMatrixBuildResult = { outputPath: string; sheets: SimplifiedMatrixSheetPlan[] }`
  - `export const SIMPLIFIED_MATRIX_OUTPUT_RELATIVE_PATH = path.join("testcase", "simplified_validation", "EINV_OMAN_Simplified_FullMatrix.xlsx")`
  - `export function matrixFieldOnSimplified(matrixField: string): boolean`
  - `export function conditionalCaseOnSimplified(tc: { field: string; title?: string; description?: string; ruleId?: string }): boolean`
  - `export function classifyMatrixCases<T extends { id: string }>(cases: T[], fieldOf: (tc: T) => string): { keepIds: string[]; kept: number; dropped: number }`
  - `export function buildSimplifiedValidationMatrixPlan(options?: { fieldMatrixPath?: string; formulaMatrixPath?: string; conditionalMatrixPath?: string; outputPath?: string }): SimplifiedMatrixBuildResult`

- [ ] **Step 1: Write the failing tsx assertions**

Create `Helpers/excel/simplifiedValidationMatrixHelper.test.ts` with this exact body (imports will fail until Step 3):

```ts
import {
  classifyMatrixCases,
  conditionalCaseOnSimplified,
  matrixFieldOnSimplified,
} from "./simplifiedValidationMatrixHelper";

function assert(cond: unknown, message: string): void {
  if (!cond) throw new Error(message);
}

assert(
  matrixFieldOnSimplified("Invoice Number") === true,
  "Invoice Number is on Simplified"
);
assert(
  matrixFieldOnSimplified("Seller Name") === true,
  "Seller Name is on Simplified"
);
assert(
  matrixFieldOnSimplified("Buyer Electronic Address") === true,
  "Buyer Electronic Address is on Simplified"
);
assert(
  matrixFieldOnSimplified("Seller Address Line 1") === false,
  "Seller address is full-template only"
);
assert(
  matrixFieldOnSimplified("Buyer VAT identifier") === false,
  "Buyer VAT TIN is full-template only"
);
assert(
  matrixFieldOnSimplified("Scheme Identifier") === false,
  "Buyer Scheme Identifier is full-template only"
);
assert(
  matrixFieldOnSimplified("Invoice Number (IBT-001)") === true,
  "Peppol token must strip before match"
);
assert(
  matrixFieldOnSimplified("VAT Category") === true,
  "VAT Category aliases to Tax Category"
);
assert(
  conditionalCaseOnSimplified({
    field: "Simplified Tax Invoice",
    title: "[ALIGNED-IBRP-O-01-OM] Simplified Tax Invoice exception",
    ruleId: "ALIGNED-IBRP-O-01-OM",
  }) === true,
  "Simplified Tax Invoice maps to Invoice Transaction Type Code"
);

const classified = classifyMatrixCases(
  [
    { id: "TC-KEEP", field: "Invoice Number" },
    { id: "TC-DROP", field: "Seller Address Line 1" },
  ],
  (tc) => tc.field
);
assert(classified.keepIds.join(",") === "TC-KEEP", "keepIds order preserved");
assert(classified.kept === 1, "kept count");
assert(classified.dropped === 1, "dropped count");

console.log("simplifiedValidationMatrixHelper.test.ts ok");
```

- [ ] **Step 2: Run the assertions to verify they fail** (only after the user says **run**)

Run: `npx tsx Helpers/excel/simplifiedValidationMatrixHelper.test.ts`

Expected: FAIL — `Cannot find module './simplifiedValidationMatrixHelper'`

- [ ] **Step 3: Write the helper**

Create `Helpers/excel/simplifiedValidationMatrixHelper.ts`:

```ts
import fs from "fs";
import path from "path";
import { SIMPLIFIED_TEMPLATE_HEADER_LABELS } from "../../testData/invoiceTemplateHeaders/invoiceColumnMapping";
import { hasHeaderLabel } from "../../utils/excel/invoiceExcel";
import { buildValidOmanFullTaxInvoiceRow } from "./conditionalValidationHelper";
import {
  loadConditionalValidationMatrix,
  MATRIX_DEFAULT_PATH as CONDITIONAL_MATRIX_DEFAULT_PATH,
  normalizeMatrixFieldLabel,
  matrixFieldLookupCandidates,
  resolveConditionalRowKey,
  resolveEffectiveMatrixField,
  type ConditionalMatrixCase,
} from "./conditionalValidationExcelPackHelper";
import {
  loadFieldValidationMatrix,
  MATRIX_DEFAULT_PATH as FIELD_MATRIX_DEFAULT_PATH,
  MATRIX_FIELD_TO_ROW_KEY,
} from "./fieldValidationExcelPackHelper";
import {
  loadFormulaValidationMatrix,
  MATRIX_DEFAULT_PATH as FORMULA_MATRIX_DEFAULT_PATH,
} from "./formulaValidationExcelPackHelper";

export type SimplifiedMatrixSheetName = "Field" | "Formula" | "Conditional";

export type SimplifiedMatrixSheetPlan = {
  name: SimplifiedMatrixSheetName;
  sourcePath: string;
  keepIds: string[];
  kept: number;
  dropped: number;
};

export type SimplifiedMatrixBuildResult = {
  outputPath: string;
  sheets: SimplifiedMatrixSheetPlan[];
};

export const SIMPLIFIED_MATRIX_OUTPUT_RELATIVE_PATH = path.join(
  "testcase",
  "simplified_validation",
  "EINV_OMAN_Simplified_FullMatrix.xlsx"
);

export function matrixFieldOnSimplified(matrixField: string): boolean {
  const labels = SIMPLIFIED_TEMPLATE_HEADER_LABELS;
  if (!matrixField.trim()) return false;
  if (hasHeaderLabel(labels, matrixField)) return true;
  const stripped = normalizeMatrixFieldLabel(matrixField);
  if (stripped && hasHeaderLabel(labels, stripped)) return true;
  const aliasedDirect = MATRIX_FIELD_TO_ROW_KEY[matrixField] ?? MATRIX_FIELD_TO_ROW_KEY[stripped];
  if (aliasedDirect && hasHeaderLabel(labels, aliasedDirect)) return true;
  for (const candidate of matrixFieldLookupCandidates(matrixField)) {
    if (hasHeaderLabel(labels, candidate)) return true;
    const aliased = MATRIX_FIELD_TO_ROW_KEY[candidate];
    if (aliased && hasHeaderLabel(labels, aliased)) return true;
  }
  return false;
}

export function conditionalCaseOnSimplified(tc: {
  field: string;
  title?: string;
  description?: string;
  ruleId?: string;
}): boolean {
  const effective = resolveEffectiveMatrixField({
    id: "",
    priority: "",
    polarity: "",
    section: "",
    field: tc.field,
    title: tc.title ?? "",
    description: tc.description ?? "",
    ruleId: tc.ruleId ?? "",
  } as ConditionalMatrixCase);
  if (matrixFieldOnSimplified(effective) || matrixFieldOnSimplified(tc.field)) {
    return true;
  }
  const seed = buildValidOmanFullTaxInvoiceRow();
  const rowKey = resolveConditionalRowKey(effective, seed);
  return hasHeaderLabel(SIMPLIFIED_TEMPLATE_HEADER_LABELS, rowKey);
}

export function classifyMatrixCases<T extends { id: string }>(
  cases: T[],
  fieldOf: (tc: T) => string
): { keepIds: string[]; kept: number; dropped: number } {
  const keepIds: string[] = [];
  let dropped = 0;
  for (const tc of cases) {
    if (matrixFieldOnSimplified(fieldOf(tc))) {
      keepIds.push(tc.id);
    } else {
      dropped += 1;
    }
  }
  return { keepIds, kept: keepIds.length, dropped };
}

function requireExistingFile(filePath: string): string {
  const resolved = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Source matrix not found: ${resolved}`);
  }
  return resolved;
}

export function buildSimplifiedValidationMatrixPlan(options?: {
  fieldMatrixPath?: string;
  formulaMatrixPath?: string;
  conditionalMatrixPath?: string;
  outputPath?: string;
}): SimplifiedMatrixBuildResult {
  const fieldPath = requireExistingFile(options?.fieldMatrixPath ?? FIELD_MATRIX_DEFAULT_PATH);
  const formulaPath = requireExistingFile(
    options?.formulaMatrixPath ?? FORMULA_MATRIX_DEFAULT_PATH
  );
  const conditionalPath = requireExistingFile(
    options?.conditionalMatrixPath ?? CONDITIONAL_MATRIX_DEFAULT_PATH
  );
  const outputPath = options?.outputPath
    ? path.isAbsolute(options.outputPath)
      ? options.outputPath
      : path.join(process.cwd(), options.outputPath)
    : path.join(process.cwd(), SIMPLIFIED_MATRIX_OUTPUT_RELATIVE_PATH);

  const fieldClassified = classifyMatrixCases(loadFieldValidationMatrix(fieldPath), (tc) => tc.field);
  const formulaClassified = classifyMatrixCases(
    loadFormulaValidationMatrix(formulaPath),
    (tc) => tc.field
  );
  const conditionalCases = loadConditionalValidationMatrix(conditionalPath);
  const conditionalKeepIds: string[] = [];
  let conditionalDropped = 0;
  for (const tc of conditionalCases) {
    if (conditionalCaseOnSimplified(tc)) {
      conditionalKeepIds.push(tc.id);
    } else {
      conditionalDropped += 1;
    }
  }

  return {
    outputPath,
    sheets: [
      {
        name: "Field",
        sourcePath: fieldPath,
        keepIds: fieldClassified.keepIds,
        kept: fieldClassified.kept,
        dropped: fieldClassified.dropped,
      },
      {
        name: "Formula",
        sourcePath: formulaPath,
        keepIds: formulaClassified.keepIds,
        kept: formulaClassified.kept,
        dropped: formulaClassified.dropped,
      },
      {
        name: "Conditional",
        sourcePath: conditionalPath,
        keepIds: conditionalKeepIds,
        kept: conditionalKeepIds.length,
        dropped: conditionalDropped,
      },
    ],
  };
}
```

If `resolveEffectiveMatrixField` requires extra ConditionalMatrixCase fields at compile time, add empty strings for `preconditions` / `steps` / `expected` rather than changing the pack helper.

- [ ] **Step 4: Run the assertions to verify they pass** (only after the user says **run**)

Run: `npx tsx Helpers/excel/simplifiedValidationMatrixHelper.test.ts`

Expected: stdout `simplifiedValidationMatrixHelper.test.ts ok` and exit 0.

- [ ] **Step 5: Commit** — skip unless the user asks.

---

### Task 2: Python row copier

**Files:**
- Create: `utils/excel/test_write_simplified_validation_matrix.py`
- Create: `utils/excel/write_simplified_validation_matrix.py`

**Interfaces:**
- Consumes: openpyxl; plan JSON from stdin path argument
- Produces:
  - `def load_plan(path: str) -> dict`
  - `def copy_kept_rows(source_path: str, keep_ids: set[str], dest_ws) -> dict` with keys `copied`, `source_sheet`
  - CLI: `python utils/excel/write_simplified_validation_matrix.py <plan.json>`
  - stdout JSON: `{ "ok": true, "outputPath": "...", "sheets": [{ "name": "Field", "copied": 2, "sourceSheet": "All Testcases" }] }`
  - On missing source / missing `Test Case ID` column: `{ "ok": false, "error": "..." }` and exit 1
  - Zero keep IDs: still write header row; `copied` is 0

- [ ] **Step 1: Write the failing Python tests**

Create `utils/excel/test_write_simplified_validation_matrix.py`:

```python
from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path

from openpyxl import Workbook, load_workbook

_UTILS = Path(__file__).resolve().parent
if str(_UTILS) not in sys.path:
    sys.path.insert(0, str(_UTILS))

from write_simplified_validation_matrix import (  # noqa: E402
    copy_kept_rows,
    write_combined_workbook,
)


def _matrix_xlsx(path: Path, rows: list[tuple[str, str, str]]) -> None:
    wb = Workbook()
    ws = wb.active
    ws.title = "All Testcases"
    ws.append(["Test Case ID", "Filed name", "Testcase Title"])
    for row in rows:
        ws.append(list(row))
    wb.save(path)
    wb.close()


class CopyKeptRowsTests(unittest.TestCase):
    def test_copies_only_keep_ids_and_preserves_order(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            src = Path(tmp) / "src.xlsx"
            _matrix_xlsx(
                src,
                [
                    ("TC-1", "Invoice Number", "keep first"),
                    ("TC-2", "Seller Address Line 1", "drop"),
                    ("TC-3", "Tax Category", "keep second"),
                ],
            )
            dest = Workbook()
            ws = dest.active
            ws.title = "Field"
            result = copy_kept_rows(str(src), {"TC-1", "TC-3"}, ws)
            self.assertEqual(result["copied"], 2)
            self.assertEqual(result["sourceSheet"], "All Testcases")
            self.assertEqual(ws.cell(1, 1).value, "Test Case ID")
            self.assertEqual(ws.cell(2, 1).value, "TC-1")
            self.assertEqual(ws.cell(3, 1).value, "TC-3")
            self.assertIsNone(ws.cell(4, 1).value)

    def test_zero_keep_ids_writes_header_only(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            src = Path(tmp) / "src.xlsx"
            _matrix_xlsx(src, [("TC-1", "Invoice Number", "x")])
            dest = Workbook()
            ws = dest.active
            result = copy_kept_rows(str(src), set(), ws)
            self.assertEqual(result["copied"], 0)
            self.assertEqual(ws.cell(1, 1).value, "Test Case ID")
            self.assertIsNone(ws.cell(2, 1).value)

    def test_missing_test_case_id_raises(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            src = Path(tmp) / "src.xlsx"
            wb = Workbook()
            ws = wb.active
            ws.title = "All Testcases"
            ws.append(["Filed name", "Testcase Title"])
            ws.append(["Invoice Number", "x"])
            wb.save(src)
            wb.close()
            dest = Workbook()
            with self.assertRaisesRegex(ValueError, "Test Case ID"):
                copy_kept_rows(str(src), {"TC-1"}, dest.active)

    def test_write_combined_three_sheets(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            field = Path(tmp) / "field.xlsx"
            formula = Path(tmp) / "formula.xlsx"
            conditional = Path(tmp) / "conditional.xlsx"
            _matrix_xlsx(field, [("F-1", "Invoice Number", "f")])
            _matrix_xlsx(formula, [("P-1", "Item Net Price", "p")])
            _matrix_xlsx(conditional, [("C-1", "Tax Category", "c")])
            out = Path(tmp) / "out.xlsx"
            plan = {
                "outputPath": str(out),
                "sheets": [
                    {"name": "Field", "sourcePath": str(field), "keepIds": ["F-1"]},
                    {"name": "Formula", "sourcePath": str(formula), "keepIds": ["P-1"]},
                    {"name": "Conditional", "sourcePath": str(conditional), "keepIds": ["C-1"]},
                ],
            }
            write_combined_workbook(plan)
            wb = load_workbook(out, read_only=True, data_only=True)
            try:
                self.assertEqual(wb.sheetnames, ["Field", "Formula", "Conditional"])
                self.assertEqual(wb["Field"].cell(2, 1).value, "F-1")
                self.assertEqual(wb["Formula"].cell(2, 1).value, "P-1")
                self.assertEqual(wb["Conditional"].cell(2, 1).value, "C-1")
            finally:
                wb.close()


if __name__ == "__main__":
    raise SystemExit(unittest.main())
```

- [ ] **Step 2: Run tests to verify they fail** (only after the user says **run**)

Run: `python utils/excel/test_write_simplified_validation_matrix.py`

Expected: FAIL — `ModuleNotFoundError: write_simplified_validation_matrix`

- [ ] **Step 3: Write the copier**

Create `utils/excel/write_simplified_validation_matrix.py`:

```python
#!/usr/bin/env python3
"""Copy kept FullMatrix rows into one Simplified catalog workbook (3 sheets)."""
from __future__ import annotations

import json
import sys
from pathlib import Path

try:
    import openpyxl
    from openpyxl import Workbook
except ImportError as exc:  # pragma: no cover
    print(json.dumps({"ok": False, "error": f"openpyxl required: {exc}"}))
    sys.exit(1)


def _source_sheet(wb: openpyxl.Workbook):
    if "All Testcases" in wb.sheetnames:
        return wb["All Testcases"]
    return wb[wb.sheetnames[0]]


def _header_index(headers: list[str], name: str) -> int | None:
    want = name.strip().lower()
    for i, h in enumerate(headers):
        if (h or "").strip().lower() == want:
            return i
    return None


def copy_kept_rows(source_path: str, keep_ids: set[str], dest_ws) -> dict:
    path = Path(source_path)
    if not path.is_file():
        raise FileNotFoundError(f"Source matrix not found: {path}")

    src_wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    try:
        src_ws = _source_sheet(src_wb)
        rows_iter = src_ws.iter_rows(values_only=True)
        try:
            header_row = next(rows_iter)
        except StopIteration as exc:
            raise ValueError(f"Empty sheet in {path}") from exc
        headers = ["" if c is None else str(c) for c in header_row]
        id_idx = _header_index(headers, "Test Case ID")
        if id_idx is None:
            raise ValueError(f"Test Case ID column missing on sheet {src_ws.title}")

        for col, header in enumerate(headers, start=1):
            dest_ws.cell(1, col, header)

        copied = 0
        dest_row = 2
        for row in rows_iter:
            if not row or id_idx >= len(row):
                continue
            tc_id = "" if row[id_idx] is None else str(row[id_idx]).strip()
            if not tc_id or tc_id not in keep_ids:
                continue
            for col, value in enumerate(row, start=1):
                dest_ws.cell(dest_row, col, value)
            copied += 1
            dest_row += 1
        return {"copied": copied, "sourceSheet": src_ws.title}
    finally:
        src_wb.close()


def write_combined_workbook(plan: dict) -> dict:
    output_path = Path(plan["outputPath"])
    output_path.parent.mkdir(parents=True, exist_ok=True)
    dest_wb = Workbook()
    default = dest_wb.active
    dest_wb.remove(default)
    sheets_out = []
    for sheet in plan["sheets"]:
        ws = dest_wb.create_sheet(sheet["name"])
        keep_ids = {str(x).strip() for x in sheet.get("keepIds") or [] if str(x).strip()}
        result = copy_kept_rows(sheet["sourcePath"], keep_ids, ws)
        sheets_out.append(
            {
                "name": sheet["name"],
                "copied": result["copied"],
                "sourceSheet": result["sourceSheet"],
            }
        )
    dest_wb.save(output_path)
    dest_wb.close()
    return {"ok": True, "outputPath": str(output_path), "sheets": sheets_out}


def main() -> int:
    if len(sys.argv) < 2:
        print(json.dumps({"ok": False, "error": "Usage: write_simplified_validation_matrix.py <plan.json>"}))
        return 1
    plan_path = Path(sys.argv[1])
    if not plan_path.is_file():
        print(json.dumps({"ok": False, "error": f"Plan not found: {plan_path}"}))
        return 1
    try:
        plan = json.loads(plan_path.read_text(encoding="utf-8"))
        payload = write_combined_workbook(plan)
    except Exception as exc:
        print(json.dumps({"ok": False, "error": str(exc)}))
        return 1
    print(json.dumps(payload, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
```

- [ ] **Step 4: Run tests to verify they pass** (only after the user says **run**)

Run: `python utils/excel/test_write_simplified_validation_matrix.py`

Expected: `OK` / exit 0.

- [ ] **Step 5: Commit** — skip unless the user asks.

---

### Task 3: CLI script

**Files:**
- Create: `scripts/generate_simplified_validation_matrix.ts`

**Interfaces:**
- Consumes: `buildSimplifiedValidationMatrixPlan`, `runPythonForStdout`
- Produces: CLI with no required flags; optional `--field`, `--formula`, `--conditional`, `--out`
- Exit 1 if a source xlsx is missing (message includes the path)
- Writes plan JSON to `testcase/simplified_validation/_tmp/simplified-matrix-plan.json`
- Calls `utils/excel/write_simplified_validation_matrix.py` with timeout **180000** ms
- Prints JSON summary: `{ output, sheets: [{ name, kept, dropped, copied }] }`
- If `kept === 0` for a sheet, print a `warn` line `Field: 0 kept rows (header only)` but continue
- Overwrite output if it already exists (Python `save` overwrites)

- [ ] **Step 1: Write the CLI**

Create `scripts/generate_simplified_validation_matrix.ts`:

```ts
import "dotenv/config";
import fs from "fs";
import path from "path";
import {
  buildSimplifiedValidationMatrixPlan,
} from "../Helpers/excel/simplifiedValidationMatrixHelper";
import { runPythonForStdout } from "../utils/pythonRunner";

function argValue(argv: string[], flag: string): string | undefined {
  const i = argv.indexOf(flag);
  if (i < 0) return undefined;
  return argv[i + 1];
}

function main(): void {
  const argv = process.argv.slice(2);
  let plan;
  try {
    plan = buildSimplifiedValidationMatrixPlan({
      fieldMatrixPath: argValue(argv, "--field"),
      formulaMatrixPath: argValue(argv, "--formula"),
      conditionalMatrixPath: argValue(argv, "--conditional"),
      outputPath: argValue(argv, "--out"),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(message);
    process.exit(1);
  }

  for (const sheet of plan.sheets) {
    if (sheet.kept === 0) {
      console.warn(`${sheet.name}: 0 kept rows (header only)`);
    }
  }

  const tmpDir = path.join(process.cwd(), "testcase", "simplified_validation", "_tmp");
  fs.mkdirSync(tmpDir, { recursive: true });
  const planPath = path.join(tmpDir, "simplified-matrix-plan.json");
  fs.writeFileSync(
    planPath,
    JSON.stringify(
      {
        outputPath: plan.outputPath,
        sheets: plan.sheets.map((s) => ({
          name: s.name,
          sourcePath: s.sourcePath,
          keepIds: s.keepIds,
        })),
      },
      null,
      2
    ),
    "utf8"
  );

  const script = path.join(
    process.cwd(),
    "utils",
    "excel",
    "write_simplified_validation_matrix.py"
  );
  const stdout = runPythonForStdout(script, [planPath], 180_000);
  const parsed = JSON.parse(stdout.trim()) as {
    ok?: boolean;
    error?: string;
    outputPath?: string;
    sheets?: Array<{ name: string; copied: number }>;
  };
  if (!parsed.ok) {
    console.error(parsed.error || stdout);
    process.exit(1);
  }

  const copiedByName = new Map(
    (parsed.sheets ?? []).map((s) => [s.name, s.copied] as const)
  );
  const summary = {
    output: parsed.outputPath ?? plan.outputPath,
    sheets: plan.sheets.map((s) => ({
      name: s.name,
      kept: s.kept,
      dropped: s.dropped,
      copied: copiedByName.get(s.name) ?? 0,
    })),
  };
  console.log(JSON.stringify(summary, null, 2));
}

main();
```

Do not add an npm script.

- [ ] **Step 2: Run the CLI against missing sources** (only after the user says **run**)

Run:

```bash
npx tsx scripts/generate_simplified_validation_matrix.ts --field "testcase/_missing_field.xlsx"
```

Expected: exit 1, stderr contains `Source matrix not found` and `_missing_field.xlsx`.

- [ ] **Step 3: Generate the real catalog** (only after the user says **run**)

Requires the three Oman FullMatrix files on disk.

Run: `npx tsx scripts/generate_simplified_validation_matrix.ts`

Expected: exit 0; file `testcase/simplified_validation/EINV_OMAN_Simplified_FullMatrix.xlsx` exists; stdout JSON has three sheets; `kept + dropped` equals the Oman matrix row counts; `copied === kept` per sheet; Field `dropped` includes seller/buyer address and identifier cases.

- [ ] **Step 4: Commit** — skip unless the user asks. Do not git-add the generated `.xlsx`.

---

## Spec coverage (self-review)

| Spec requirement | Task |
|---|---|
| One combined workbook, 3 sheets Field/Formula/Conditional | Task 2 + 3 |
| Filter Oman FullMatrix rows to Simplified headers | Task 1 `matrixFieldOnSimplified` / `conditionalCaseOnSimplified` |
| Keep Seller/Buyer Name + electronic identity | Task 1 assertions |
| Drop full-template-only address / identifier / VAT TIN / Scheme Identifier | Task 1 assertions |
| Peppol token strip + aliases | Task 1 |
| Full source row copy (not trimmed JSON) | Task 2 |
| Missing source fails with path | Task 1 `requireExistingFile` + Task 3 Step 2 |
| Missing Test Case ID column fails | Task 2 |
| Zero kept rows: header only + warn | Task 2 + Task 3 `console.warn` |
| Create output directory | Task 2 `mkdir(parents=True)` |
| Overwrite existing output | Task 2 `save` |
| No Playwright / no TC packs / no buyer-master extras | Global Constraints |
| CLI `npx tsx scripts/generate_simplified_validation_matrix.ts` | Task 3 |

No placeholders. Types (`SimplifiedMatrixSheetPlan`, `keepIds`, `copied`) are consistent across tasks.
