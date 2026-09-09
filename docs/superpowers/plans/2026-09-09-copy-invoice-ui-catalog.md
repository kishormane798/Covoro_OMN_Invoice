# Copy Invoice UI + Covoro catalog Excel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. The user asked to execute in one session without per-task approval.

**Goal:** Extend the Copy-only blank-identity Playwright case to Invoice Number **and** Invoice Issue Date, and generate one catalog Excel that copies all Covoro/Oman Field / Formula / Conditional FullMatrix rows.

**Architecture:** Playwright stays TypeScript-driven (`ENTRY = "copy"`). Catalog generation loads the three Oman FullMatrices, keeps every Test Case ID, and Python/openpyxl copies full source rows into `EINV_OMAN_Copy_FullMatrix.xlsx`. Tests never read the catalog.

**Tech Stack:** TypeScript (`npx tsx`), Playwright helpers, Python openpyxl, `runPythonForStdout`.

**Spec:** `docs/superpowers/specs/2026-09-09-copy-invoice-ui-catalog-design.md`

## Global Constraints

- Do not run Playwright, Python, npm, tsx, or the catalog generator until the user says **run** / **execute** / **go ahead and run**.
- Do not commit unless the user explicitly asks.
- No new Playwright spec files. Do not edit `tests/KISHOR_UI/OMN_UIInvoice_*_Copy_Test.spec.ts`.
- Preceding-invoice conditionals stay Create-only.
- No per-case `TC-*.xlsx` packs. Do not add the Copy identity case as a catalog row.
- Output path is gitignored: `testcase/copy_invoice/EINV_OMAN_Copy_FullMatrix.xlsx`.
- Do not reuse or generalize the Simplified keep/drop helper.
- Incremental-agent-edits: user approved a batch (“go in one go”).

---

## File map

| File | Responsibility |
|---|---|
| Modify: `Helpers/ui/omnUiInvoiceHelper.ts` | Assert copied `invNum` and `invDate` empty |
| Modify: `testData/ui/omnUiInvoiceValidation.ts` | Source title + display-title branch |
| Create: `testData/ui/omnUiConditionalDisplayTitle.test.ts` | tsx asserts for Copy display title |
| Create: `Helpers/excel/copyValidationMatrixHelper.ts` | Keep-all IDs + write plan |
| Create: `Helpers/excel/copyValidationMatrixHelper.test.ts` | tsx asserts for keep-all / missing source |
| Create: `utils/excel/write_copy_validation_matrix.py` | Copy full rows into three sheets |
| Create: `utils/excel/test_write_copy_validation_matrix.py` | Python unittest |
| Create: `scripts/generate_copy_validation_matrix.ts` | CLI |

---

### Task 1: Copy display title + blank date assertion

**Files:**
- Create: `testData/ui/omnUiConditionalDisplayTitle.test.ts`
- Modify: `testData/ui/omnUiInvoiceValidation.ts` (source title ~2850, `COPY_INVOICE_NUMBER_EMPTY_SOURCE` ~2970, `omnUiConditionalDisplayTitle`)
- Modify: `Helpers/ui/omnUiInvoiceHelper.ts` (`runOmnUiConditionalScenario` copy branch ~2301)

**GitNexus:** `impact({target: "runOmnUiConditionalScenario", direction: "upstream"})` — LOW. Kind is Copy-only.

**Interfaces:**
- Consumes: `readInputValue`, `omnUiConditionalDisplayTitle`
- Produces: display title string below; both fields asserted `""`

- [x] **Step 1: Write the failing title assertions**

Create `testData/ui/omnUiConditionalDisplayTitle.test.ts`:

```ts
import { omnUiConditionalDisplayTitle } from "./omnUiInvoiceValidation";

function assert(cond: unknown, message: string): void {
  if (!cond) throw new Error(message);
}

const SOURCE = "Copied invoice number and invoice date are empty until filled";
const EXPECTED =
  "Given a copied invoice — When the copied form opens — Then Invoice Number and Invoice Issue Date should be empty. (Invoice Number, Invoice Issue Date)";

assert(
  omnUiConditionalDisplayTitle("copy", SOURCE) === EXPECTED,
  `Copy identity title mismatch: ${omnUiConditionalDisplayTitle("copy", SOURCE)}`
);
assert(
  omnUiConditionalDisplayTitle("create", SOURCE) === EXPECTED,
  "Create entry must still use the Copy-only special case when the source title matches"
);

console.log("omnUiConditionalDisplayTitle.test.ts ok");
```

- [ ] **Step 2: Run to verify fail** — skip until the user says **run**.

- [ ] **Step 3: Update titles and helper**

In `omnUiInvoiceValidation.ts`:

```ts
  {
    title: "Copied invoice number and invoice date are empty until filled",
    section: "document",
    kind: "copyInvoiceNumberEmpty",
    shouldError: false,
    assertInputId: "invNum",
    entries: ["copy"],
  },
```

```ts
const COPY_INVOICE_NUMBER_EMPTY_SOURCE =
  "Copied invoice number and invoice date are empty until filled";

export function omnUiConditionalDisplayTitle(entry: OmnUiEntry, sourceTitle: string): string {
  if (sourceTitle === COPY_INVOICE_NUMBER_EMPTY_SOURCE) {
    return "Given a copied invoice — When the copied form opens — Then Invoice Number and Invoice Issue Date should be empty. (Invoice Number, Invoice Issue Date)";
  }
  // existing replace chain unchanged
}
```

In `omnUiInvoiceHelper.ts` inside `kind === "copyInvoiceNumberEmpty"`:

```ts
    const invNum = await invoice.readInputValue("document", "invNum");
    const invDate = await invoice.readInputValue("document", "invDate", [
      "issueDate",
      "invIssueDate",
    ]);
    expect(invNum, "copied invoice number should be empty").toBe("");
    expect(invDate, "copied invoice date should be empty").toBe("");
    return;
```

- [ ] **Step 4: Run title test** — skip until **run**.
- [ ] **Step 5: Commit** — skip unless the user asks.

---

### Task 2: Keep-all catalog helper

**Files:**
- Create: `Helpers/excel/copyValidationMatrixHelper.test.ts`
- Create: `Helpers/excel/copyValidationMatrixHelper.ts`

**Interfaces:**
- Consumes: `loadFieldValidationMatrix`, `loadFormulaValidationMatrix`, `loadConditionalValidationMatrix`, `MATRIX_DEFAULT_PATH` from each pack helper
- Produces:
  - `export type CopyMatrixSheetName = "Field" | "Formula" | "Conditional"`
  - `export type CopyMatrixSheetPlan = { name: CopyMatrixSheetName; sourcePath: string; keepIds: string[]; kept: number; dropped: number }`
  - `export type CopyMatrixBuildResult = { outputPath: string; sheets: CopyMatrixSheetPlan[] }`
  - `export const COPY_MATRIX_OUTPUT_RELATIVE_PATH = path.join("testcase", "copy_invoice", "EINV_OMAN_Copy_FullMatrix.xlsx")`
  - `export function classifyAllMatrixCases<T extends { id: string }>(cases: T[]): { keepIds: string[]; kept: number; dropped: number }`
  - `export function buildCopyValidationMatrixPlan(options?: { fieldMatrixPath?: string; formulaMatrixPath?: string; conditionalMatrixPath?: string; outputPath?: string }): CopyMatrixBuildResult`

- [ ] **Step 1: Write failing tsx assertions**

```ts
import {
  classifyAllMatrixCases,
  COPY_MATRIX_OUTPUT_RELATIVE_PATH,
  buildCopyValidationMatrixPlan,
} from "./copyValidationMatrixHelper";

function assert(cond: unknown, message: string): void {
  if (!cond) throw new Error(message);
}

assert(
  COPY_MATRIX_OUTPUT_RELATIVE_PATH.replace(/\\/g, "/").endsWith(
    "testcase/copy_invoice/EINV_OMAN_Copy_FullMatrix.xlsx"
  ),
  "output relative path"
);

const classified = classifyAllMatrixCases([{ id: "TC-1" }, { id: " TC-2 " }, { id: "" }]);
assert(classified.kept === 2, "kept count");
assert(classified.dropped === 0, "keep-all dropped is 0");
assert(classified.keepIds.join(",") === "TC-1,TC-2", "ids trimmed, blanks dropped");

let threw = false;
try {
  buildCopyValidationMatrixPlan({
    fieldMatrixPath: "testcase/_missing_copy_field.xlsx",
    formulaMatrixPath: "testcase/_missing_copy_formula.xlsx",
    conditionalMatrixPath: "testcase/_missing_copy_conditional.xlsx",
  });
} catch (err) {
  threw = String(err instanceof Error ? err.message : err).includes("Source matrix not found");
}
assert(threw, "missing source must throw");

console.log("copyValidationMatrixHelper.test.ts ok");
```

- [ ] **Step 2: Run fail** — skip until **run**.

- [ ] **Step 3: Implement helper**

```ts
import fs from "fs";
import path from "path";
import {
  loadConditionalValidationMatrix,
  MATRIX_DEFAULT_PATH as CONDITIONAL_MATRIX_DEFAULT_PATH,
} from "./conditionalValidationExcelPackHelper";
import {
  loadFieldValidationMatrix,
  MATRIX_DEFAULT_PATH as FIELD_MATRIX_DEFAULT_PATH,
} from "./fieldValidationExcelPackHelper";
import {
  loadFormulaValidationMatrix,
  MATRIX_DEFAULT_PATH as FORMULA_MATRIX_DEFAULT_PATH,
} from "./formulaValidationExcelPackHelper";

export type CopyMatrixSheetName = "Field" | "Formula" | "Conditional";

export type CopyMatrixSheetPlan = {
  name: CopyMatrixSheetName;
  sourcePath: string;
  keepIds: string[];
  kept: number;
  dropped: number;
};

export type CopyMatrixBuildResult = {
  outputPath: string;
  sheets: CopyMatrixSheetPlan[];
};

export const COPY_MATRIX_OUTPUT_RELATIVE_PATH = path.join(
  "testcase",
  "copy_invoice",
  "EINV_OMAN_Copy_FullMatrix.xlsx"
);

export function classifyAllMatrixCases<T extends { id: string }>(
  cases: T[]
): { keepIds: string[]; kept: number; dropped: number } {
  const keepIds = cases.map((tc) => String(tc.id).trim()).filter(Boolean);
  return { keepIds, kept: keepIds.length, dropped: 0 };
}

function requireExistingFile(filePath: string): string {
  const resolved = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Source matrix not found: ${resolved}`);
  }
  return resolved;
}

export function buildCopyValidationMatrixPlan(options?: {
  fieldMatrixPath?: string;
  formulaMatrixPath?: string;
  conditionalMatrixPath?: string;
  outputPath?: string;
}): CopyMatrixBuildResult {
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
    : path.join(process.cwd(), COPY_MATRIX_OUTPUT_RELATIVE_PATH);

  const field = classifyAllMatrixCases(loadFieldValidationMatrix(fieldPath));
  const formula = classifyAllMatrixCases(loadFormulaValidationMatrix(formulaPath));
  const conditional = classifyAllMatrixCases(loadConditionalValidationMatrix(conditionalPath));

  return {
    outputPath,
    sheets: [
      { name: "Field", sourcePath: fieldPath, keepIds: field.keepIds, kept: field.kept, dropped: 0 },
      {
        name: "Formula",
        sourcePath: formulaPath,
        keepIds: formula.keepIds,
        kept: formula.kept,
        dropped: 0,
      },
      {
        name: "Conditional",
        sourcePath: conditionalPath,
        keepIds: conditional.keepIds,
        kept: conditional.kept,
        dropped: 0,
      },
    ],
  };
}
```

- [ ] **Step 4: Run pass** — skip until **run**.
- [ ] **Step 5: Commit** — skip unless asked.

---

### Task 3: Python row copier

**Files:**
- Create: `utils/excel/test_write_copy_validation_matrix.py`
- Create: `utils/excel/write_copy_validation_matrix.py`

**Interfaces:**
- CLI: `python utils/excel/write_copy_validation_matrix.py <plan.json>`
- `copy_kept_rows(source_path, keep_ids, dest_ws) -> { copied, sourceSheet }`
- `write_combined_workbook(plan) -> { ok, outputPath, sheets }`
- Missing `Test Case ID` column → ValueError
- Zero keep IDs → header only
- Source sheet: `All Testcases` if present else first sheet

- [ ] **Step 1: Write failing Python tests** — same structure as Simplified copier tests, importing `write_copy_validation_matrix`.

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

from write_copy_validation_matrix import (  # noqa: E402
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
    def test_copies_keep_ids_preserves_order(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            src = Path(tmp) / "src.xlsx"
            _matrix_xlsx(
                src,
                [
                    ("TC-1", "Invoice Number", "first"),
                    ("TC-2", "Seller Name", "second"),
                    ("TC-3", "Tax Category", "third"),
                ],
            )
            dest = Workbook()
            ws = dest.active
            ws.title = "Field"
            result = copy_kept_rows(str(src), {"TC-1", "TC-2", "TC-3"}, ws)
            self.assertEqual(result["copied"], 3)
            self.assertEqual(result["sourceSheet"], "All Testcases")
            self.assertEqual(ws.cell(1, 1).value, "Test Case ID")
            self.assertEqual(ws.cell(2, 1).value, "TC-1")
            self.assertEqual(ws.cell(4, 1).value, "TC-3")

    def test_zero_keep_ids_writes_header_only(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            src = Path(tmp) / "src.xlsx"
            _matrix_xlsx(src, [("TC-1", "Invoice Number", "x")])
            dest = Workbook()
            result = copy_kept_rows(str(src), set(), dest.active)
            self.assertEqual(result["copied"], 0)
            self.assertEqual(dest.active.cell(1, 1).value, "Test Case ID")
            self.assertIsNone(dest.active.cell(2, 1).value)

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

- [ ] **Step 2: Run fail** — skip until **run**.

- [ ] **Step 3: Implement writer** — copy `write_simplified_validation_matrix.py` logic with Copy usage string and module name `write_copy_validation_matrix.py`.

- [ ] **Step 4: Run pass** — skip until **run**.
- [ ] **Step 5: Commit** — skip unless asked.

---

### Task 4: CLI

**Files:**
- Create: `scripts/generate_copy_validation_matrix.ts`

**Interfaces:**
- Optional `--field`, `--formula`, `--conditional`, `--out`
- Plan JSON: `testcase/copy_invoice/_tmp/copy-matrix-plan.json`
- Python timeout **180000** ms
- Print JSON `{ output, sheets: [{ name, kept, dropped, copied }] }`
- Warn when `kept === 0`
- No npm script

- [ ] **Step 1: Write CLI**

```ts
import "dotenv/config";
import fs from "fs";
import path from "path";
import { buildCopyValidationMatrixPlan } from "../Helpers/excel/copyValidationMatrixHelper";
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
    plan = buildCopyValidationMatrixPlan({
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

  const tmpDir = path.join(process.cwd(), "testcase", "copy_invoice", "_tmp");
  fs.mkdirSync(tmpDir, { recursive: true });
  const planPath = path.join(tmpDir, "copy-matrix-plan.json");
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

  const script = path.join(process.cwd(), "utils", "excel", "write_copy_validation_matrix.py");
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

  const copiedByName = new Map((parsed.sheets ?? []).map((s) => [s.name, s.copied] as const));
  console.log(
    JSON.stringify(
      {
        output: parsed.outputPath ?? plan.outputPath,
        sheets: plan.sheets.map((s) => ({
          name: s.name,
          kept: s.kept,
          dropped: s.dropped,
          copied: copiedByName.get(s.name) ?? 0,
        })),
      },
      null,
      2
    )
  );
}

main();
```

- [ ] **Step 2: Run CLI** — skip until **run**.
- [ ] **Step 3: Commit** — skip unless asked.

---

## Self-review

| Spec requirement | Task |
|---|---|
| Copy field/formula/conditional loops unchanged | No spec file edits |
| Blank invNum + invDate | Task 1 |
| Display title GWT | Task 1 |
| Keep-all catalog Excel | Tasks 2–4 |
| No Copy identity row in Excel | Tasks 2–3 copy matrix IDs only |
| Missing source fails | Task 2 + 4 |
| Do not run until user says run | Global Constraints |

No TBD/TODO remaining.
