# Single-line invoice Excel round-trip Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** After a completed single-line Excel upload, wait for the invoice list row **Ready to Submit**, click the invoice number, **Options → Download → Excel**, and fail if any filled upload column is missing or mismatched (ignore date format).

**Architecture:** Pure Python read/compare (openpyxl + unittest) is the source of truth. A small TS wrapper calls Python. A helper drives dashboard + download. `uploadAndVerify` calls the helper only after upload **completed** and only when the workbook has one data row.

**Tech Stack:** Playwright + TypeScript helpers/page objects, Python openpyxl via `runPythonForStdout`, existing `DashboardPage` download locators.

**Spec:** `docs/superpowers/specs/2026-08-21-single-line-excel-roundtrip-design.md`

## Global Constraints

- Do not run Playwright, Python unittest, npm, or shell until the user says **run** / **execute** / **go ahead and run** (`wait-for-explicit-run`).
- Do not commit unless the user explicitly asks (skip every Commit step until then).
- Specs stay selector-free; new locators only in `pageObjects/OMN_DashboardPage.ts`.
- Hook only after `uploadAndVerify` (completed). Do not change `uploadAndVerifyError` / `uploadAndVerifyStatus(..., 'error')`.
- Multi-line workbooks skip round-trip. Delivered is out of scope.
- Click invoice number on the **list row** (do not Options → View).
- `uploadAndVerify` blast radius is HIGH (formula / conditional / field completed cases). Keep the extra work behind the single-line gate.
- Incremental-agent-edits: one agreed file per turn unless the user already approved this batch (`yes do it`).

---

## File map

| File | Responsibility |
|---|---|
| Create: `utils/invoice_excel_roundtrip.py` | Read header+rows; skip multi-line; compare filled cells |
| Create: `utils/test_invoice_excel_roundtrip.py` | Python unittest for compare/read/skip |
| Create: `utils/invoiceExcelRoundTrip.ts` | TS types + `runPythonForStdout` wrapper + failure formatter |
| Modify: `pageObjects/OMN_DashboardPage.ts` | Public `clickInvoiceNumberOnRow(row)` |
| Create: `Helpers/invoiceExcelRoundTripHelper.ts` | Dashboard wait → click number → Download Excel → compare |
| Modify: `Helpers/uploadHelper.ts` | After completed, call round-trip when single-line |

---

### Task 1: Python compare + read (TDD)

**Files:**
- Create: `utils/test_invoice_excel_roundtrip.py`
- Create: `utils/invoice_excel_roundtrip.py`

**Interfaces:**
- Consumes: openpyxl; template layout header row 4 / data from row 6; download files may use a detected header row that contains `Invoice Number`.
- Produces:
  - `normalize_header(value: object) -> str`
  - `cell_to_text(value: object, header: str) -> str`
  - `values_match(uploaded: str, downloaded: str, header: str) -> bool`
  - `compare_filled_columns(uploaded: dict[str, str], downloaded: dict[str, str]) -> list[str]`
  - `read_invoice_rows(file_path: str) -> dict` JSON-serializable: `{ "dataRowCount": int, "invoiceNumber": str, "filled": {header: value} }`
  - CLI: `python utils/invoice_excel_roundtrip.py read <xlsx>` and `... compare <upload.xlsx> <download.xlsx>` stdout JSON.

- [ ] **Step 1: Write the failing tests** (file `utils/test_invoice_excel_roundtrip.py` only first)

```python
import unittest
from datetime import datetime

from invoice_excel_roundtrip import (
    cell_to_text,
    compare_filled_columns,
    values_match,
)


class ValuesMatchTests(unittest.TestCase):
    def test_same_calendar_day_different_format_matches(self):
        self.assertTrue(
            values_match("2026-08-21", "21/08/2026", "Invoice Issue Date")
        )

    def test_excel_datetime_matches_iso_date(self):
        self.assertTrue(
            values_match(
                cell_to_text(datetime(2026, 8, 21), "Invoice Issue Date"),
                "2026-08-21",
                "Invoice Issue Date",
            )
        )

    def test_numbers_match_ignoring_trailing_zeros(self):
        self.assertTrue(values_match("100", "100.00", "Item Gross Price"))

    def test_text_is_case_sensitive(self):
        self.assertFalse(values_match("ACME", "acme", "Buyer Name"))

    def test_empty_uploaded_columns_are_skipped(self):
        mismatches = compare_filled_columns(
            {"Buyer Name": "ACME", "Tax Rate": ""},
            {"Buyer Name": "ACME"},
        )
        self.assertEqual(mismatches, [])

    def test_missing_header_is_mismatch(self):
        mismatches = compare_filled_columns(
            {"Buyer Name": "ACME", "Tax Rate": "5"},
            {"Buyer Name": "ACME"},
        )
        self.assertTrue(any("Tax Rate" in m and "column not found" in m for m in mismatches))

    def test_empty_download_is_mismatch(self):
        mismatches = compare_filled_columns(
            {"Buyer Name": "ACME"},
            {"Buyer Name": ""},
        )
        self.assertTrue(any("downloaded empty" in m for m in mismatches))

    def test_reports_all_mismatches(self):
        mismatches = compare_filled_columns(
            {"Buyer Name": "ACME", "Tax Rate": "5"},
            {},
        )
        self.assertEqual(len(mismatches), 2)


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run tests to verify they fail**

Run (only after user says **run**): `python -m unittest utils.test_invoice_excel_roundtrip -v`  
Expected: FAIL with `ModuleNotFoundError: invoice_excel_roundtrip` (or import error).  
Until then: write the tests only; do not execute.

- [ ] **Step 3: Write minimal implementation** (`utils/invoice_excel_roundtrip.py`)

```python
"""Read a Covoro/OMN invoice workbook and compare filled upload columns to a download."""
from __future__ import annotations

import json
import re
import sys
from datetime import date, datetime
from pathlib import Path

from openpyxl import load_workbook
from openpyxl.utils.datetime import from_excel

HEADER_ROW_TEMPLATE = 4
DATA_ROW_TEMPLATE = 6
INVOICE_NUMBER_HEADER = "invoice number"
SHEET_CANDIDATES = ("E Invoice",)

_DATE_HEADER_RE = re.compile(r"date", re.I)


def normalize_header(value: object) -> str:
    if value is None:
        return ""
    return re.sub(r"\s+", " ", str(value).strip())


def _header_key(value: object) -> str:
    return normalize_header(value).lower()


def _looks_like_date_header(header: str) -> bool:
    return bool(_DATE_HEADER_RE.search(header))


def _parse_date(text: str) -> date | None:
    raw = text.strip()
    if not raw:
        return None
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%Y/%m/%d", "%d.%m.%Y"):
        try:
            return datetime.strptime(raw[:10] if len(raw) >= 10 and fmt.startswith("%Y-%m") else raw, fmt).date()
        except ValueError:
            continue
    try:
        return datetime.fromisoformat(raw.replace("Z", "")).date()
    except ValueError:
        return None


def _parse_number(text: str) -> float | None:
    raw = text.strip().replace(",", "")
    if raw == "" or not re.fullmatch(r"-?\d+(\.\d+)?", raw):
        return None
    try:
        return float(raw)
    except ValueError:
        return None


def cell_to_text(value: object, header: str) -> str:
    if value is None:
        return ""
    if isinstance(value, datetime):
        return value.date().isoformat()
    if isinstance(value, date):
        return value.isoformat()
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        if _looks_like_date_header(header) and 1 <= float(value) < 100000:
            try:
                return from_excel(float(value)).date().isoformat()
            except Exception:
                pass
        if float(value).is_integer():
            return str(int(value))
        return format(value, "g")
    return str(value).strip()


def values_match(uploaded: str, downloaded: str, header: str) -> bool:
    left = (uploaded or "").strip()
    right = (downloaded or "").strip()
    if left == right:
        return True
    left_date = _parse_date(left)
    right_date = _parse_date(right)
    if left_date and right_date and left_date == right_date:
        return True
    if _looks_like_date_header(header) and left_date and right_date:
        return left_date == right_date
    left_num = _parse_number(left)
    right_num = _parse_number(right)
    if left_num is not None and right_num is not None:
        return abs(left_num - right_num) < 1e-9
    return False


def compare_filled_columns(
    uploaded: dict[str, str], downloaded: dict[str, str]
) -> list[str]:
    down_by_key = {_header_key(k): (k, (v or "").strip()) for k, v in downloaded.items()}
    mismatches: list[str] = []
    for header, raw in uploaded.items():
        uploaded_val = (raw or "").strip()
        if not uploaded_val:
            continue
        found = down_by_key.get(_header_key(header))
        if found is None:
            mismatches.append(f'"{header}": column not found')
            continue
        _dl_header, downloaded_val = found
        if not downloaded_val:
            mismatches.append(
                f'"{header}": uploaded "{uploaded_val}", downloaded empty'
            )
            continue
        if not values_match(uploaded_val, downloaded_val, header):
            mismatches.append(
                f'"{header}": uploaded "{uploaded_val}", downloaded "{downloaded_val}"'
            )
    return mismatches


def _pick_sheet(wb):
    for name in SHEET_CANDIDATES:
        if name in wb.sheetnames:
            return wb[name]
    return wb[wb.sheetnames[0]]


def _header_row_index(ws) -> int:
    for row_idx in range(1, 11):
        values = [normalize_header(c.value) for c in ws[row_idx]]
        if any(_header_key(v) == INVOICE_NUMBER_HEADER for v in values if v):
            return row_idx
    return HEADER_ROW_TEMPLATE


def _row_map(ws, header_row: int, data_row: int) -> dict[str, str]:
    headers = [normalize_header(c.value) for c in ws[header_row]]
    cells = list(ws[data_row])
    out: dict[str, str] = {}
    for i, header in enumerate(headers):
        if not header:
            continue
        value = cells[i].value if i < len(cells) else None
        out[header] = cell_to_text(value, header)
    return out


def _row_is_empty(row_map: dict[str, str]) -> bool:
    return not any((v or "").strip() for v in row_map.values())


def read_invoice_rows(file_path: str) -> dict:
    wb = load_workbook(file_path, data_only=True, read_only=False)
    try:
        ws = _pick_sheet(wb)
        header_row = _header_row_index(ws)
        start = DATA_ROW_TEMPLATE if header_row == HEADER_ROW_TEMPLATE else header_row + 1
        rows: list[dict[str, str]] = []
        max_row = ws.max_row or start
        for data_row in range(start, max_row + 1):
            mapped = _row_map(ws, header_row, data_row)
            if _row_is_empty(mapped):
                if rows:
                    break
                continue
            rows.append(mapped)
        invoice_number = ""
        filled: dict[str, str] = {}
        if rows:
            first = rows[0]
            for k, v in first.items():
                if _header_key(k) == INVOICE_NUMBER_HEADER:
                    invoice_number = v
                if (v or "").strip():
                    filled[k] = v
        return {
            "dataRowCount": len(rows),
            "invoiceNumber": invoice_number,
            "filled": filled,
        }
    finally:
        wb.close()


def compare_workbooks(upload_path: str, download_path: str) -> dict:
    uploaded = read_invoice_rows(upload_path)
    downloaded = read_invoice_rows(download_path)
    mismatches = compare_filled_columns(uploaded["filled"], downloaded.get("filled") or {})
    return {
        "invoiceNumber": uploaded["invoiceNumber"],
        "dataRowCount": uploaded["dataRowCount"],
        "mismatches": mismatches,
    }


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print("Usage: read <xlsx> | compare <upload.xlsx> <download.xlsx>", file=sys.stderr)
        return 2
    cmd = argv[0]
    if cmd == "read":
        print(json.dumps(read_invoice_rows(argv[1])))
        return 0
    if cmd == "compare":
        print(json.dumps(compare_workbooks(argv[1], argv[2])))
        return 0
    print(f"Unknown command: {cmd}", file=sys.stderr)
    return 2


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
```

Fix the unittest import for running as `python -m unittest utils.test_invoice_excel_roundtrip` by adding the `utils` directory to `sys.path` at the top of the test file:

```python
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
```

- [ ] **Step 4: Run tests to verify they pass**

Run (only after user says **run**): `python -m unittest utils.test_invoice_excel_roundtrip -v`  
Expected: PASS.

- [ ] **Step 5: Commit** — skip unless the user asks.

---

### Task 2: TypeScript Python wrapper

**Files:**
- Create: `utils/invoiceExcelRoundTrip.ts`

**Interfaces:**
- Consumes: `runPythonForStdout` from `utils/pythonRunner.ts`; CLI from Task 1.
- Produces:
  - `export type InvoiceExcelRoundTripRead = { dataRowCount: number; invoiceNumber: string; filled: Record<string, string> }`
  - `export type InvoiceExcelRoundTripCompare = { invoiceNumber: string; dataRowCount: number; mismatches: string[] }`
  - `export function readInvoiceExcelRoundTrip(filePath: string): InvoiceExcelRoundTripRead`
  - `export function compareInvoiceExcelRoundTrip(uploadPath: string, downloadPath: string): InvoiceExcelRoundTripCompare`
  - `export function formatRoundTripMismatchMessage(invoiceNumber: string, mismatches: string[]): string`

- [ ] **Step 1: Write failing unit assertions as a small Node script comment in the wrapper file’s JSDoc examples** — this repo has no Jest/Vitest. Behavior is covered by Task 1 Python tests. Implement the wrapper directly; do not add a Playwright spec.

- [ ] **Step 2: Implement**

```typescript
import path from "node:path";
import { runPythonForStdout } from "./pythonRunner";

export type InvoiceExcelRoundTripRead = {
  dataRowCount: number;
  invoiceNumber: string;
  filled: Record<string, string>;
};

export type InvoiceExcelRoundTripCompare = {
  invoiceNumber: string;
  dataRowCount: number;
  mismatches: string[];
};

const SCRIPT = path.join(__dirname, "invoice_excel_roundtrip.py");

function parseJson<T>(stdout: string, label: string): T {
  try {
    return JSON.parse(stdout.trim()) as T;
  } catch {
    throw new Error(`Invalid ${label} JSON: ${stdout.slice(0, 500)}`);
  }
}

export function readInvoiceExcelRoundTrip(filePath: string): InvoiceExcelRoundTripRead {
  const stdout = runPythonForStdout(SCRIPT, ["read", filePath]);
  const parsed = parseJson<InvoiceExcelRoundTripRead>(stdout, "round-trip read");
  return {
    dataRowCount: Number(parsed.dataRowCount) || 0,
    invoiceNumber: String(parsed.invoiceNumber ?? ""),
    filled: parsed.filled && typeof parsed.filled === "object" ? parsed.filled : {},
  };
}

export function compareInvoiceExcelRoundTrip(
  uploadPath: string,
  downloadPath: string
): InvoiceExcelRoundTripCompare {
  const stdout = runPythonForStdout(SCRIPT, ["compare", uploadPath, downloadPath]);
  const parsed = parseJson<InvoiceExcelRoundTripCompare>(stdout, "round-trip compare");
  return {
    invoiceNumber: String(parsed.invoiceNumber ?? ""),
    dataRowCount: Number(parsed.dataRowCount) || 0,
    mismatches: Array.isArray(parsed.mismatches) ? parsed.mismatches.map(String) : [],
  };
}

export function formatRoundTripMismatchMessage(
  invoiceNumber: string,
  mismatches: string[]
): string {
  const lines = mismatches.map((m) => `- ${m}`).join("\n");
  return `Downloaded Excel missing or mismatch for invoice ${invoiceNumber}:\n${lines}`;
}
```

- [ ] **Step 3: Commit** — skip unless the user asks.

---

### Task 3: Click invoice number on the list row

**Files:**
- Modify: `pageObjects/OMN_DashboardPage.ts` (near `readRowInvoiceNumber` / `clickRowOptions`)

**Interfaces:**
- Consumes: existing `row.locator("td").nth(2).locator(".ellipsis-text")` used by `readRowInvoiceNumber`.
- Produces: `async clickInvoiceNumberOnRow(row: Locator): Promise<void>` — public. Does not open View. Confirm locator with snapshot/MCP before merge (locator-verification). Until a live snapshot is available, reuse the same cell `readRowInvoiceNumber` already uses.

- [ ] **Step 1: Add method**

```typescript
  /** Click the invoice-number cell on a list row (select; do not open Options → View). */
  async clickInvoiceNumberOnRow(row: Locator): Promise<void> {
    await expect(row).toBeVisible({ timeout: 30_000 });
    const invoiceCell = row.locator("td").nth(2).locator(".ellipsis-text").first();
    const fallback = row.locator(SELECTORS.invoiceTableCell).first();
    const target = (await invoiceCell.count()) > 0 ? invoiceCell : fallback;
    await expect(target).toBeVisible({ timeout: 15_000 });
    await target.scrollIntoViewIfNeeded().catch(() => {});
    try {
      await target.click({ timeout: 8_000 });
    } catch {
      await target.click({ timeout: 8_000, force: true });
    }
  }
```

- [ ] **Step 2: Commit** — skip unless the user asks.

---

### Task 4: Round-trip helper (dashboard + download + compare)

**Files:**
- Create: `Helpers/invoiceExcelRoundTripHelper.ts`

**Interfaces:**
- Consumes: `DashboardPage.openDashboard`, `refreshDashboardForInvoiceTable`, `waitForInvoiceReadyToSubmitStatus`, `chooseInvoiceRowForSubmit` or `invoiceTableRow` — use `chooseInvoiceRowForSubmit` if public; otherwise add a thin public `invoiceRowForDownload(invoiceNumber)` that returns the same row `waitForInvoiceReadyToSubmitStatus` uses. Also `clickInvoiceNumberOnRow`, `openInvoiceDownloadSubmenuOnRow`, `clickDownloadFormatInSubmenu`, `INVOICE_DOWNLOAD_FORMAT_LABEL.excel`.
- Consumes: `readInvoiceExcelRoundTrip`, `compareInvoiceExcelRoundTrip`, `formatRoundTripMismatchMessage`, `generatedFiles`, `getGeneratedInvoiceExcelDir`.
- Consumes: `parallelWorkerDashboardOpenOpts`.
- Produces: `export async function assertSingleLineUploadedExcelRoundTrip(page: Page, uploadFilePath: string): Promise<void>`
  - If `dataRowCount !== 1`, return (no throw).
  - If invoice number empty, throw with file path.

Need a public row getter. `chooseInvoiceRowForSubmit` is public (line ~398). After RTS wait, call:

```typescript
const row = await dashboard.chooseInvoiceRowForSubmit(invoiceNumber);
await dashboard.clickInvoiceNumberOnRow(row);
const submenu = await dashboard.openInvoiceDownloadSubmenuOnRow(row);
const downloaded = await dashboard.clickDownloadFormatInSubmenu(
  submenu,
  INVOICE_DOWNLOAD_FORMAT_LABEL.excel
);
```

Save buffer:

```typescript
const dir = getGeneratedInvoiceExcelDir();
fs.mkdirSync(dir, { recursive: true });
const downloadPath = path.join(dir, `${invoiceNumber}-downloaded.xlsx`);
fs.writeFileSync(downloadPath, downloaded.buffer);
if (!generatedFiles.includes(downloadPath)) generatedFiles.push(downloadPath);
```

If `mismatches.length > 0`, `throw new Error(formatRoundTripMismatchMessage(...))`.

- [ ] **Step 1: Implement helper**

```typescript
import fs from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import {
  DashboardPage,
  INVOICE_DOWNLOAD_FORMAT_LABEL,
} from "../pageObjects/OMN_DashboardPage";
import { parallelWorkerDashboardOpenOpts } from "./parallelWorkerSubmitIdentity";
import { flowLog } from "./diagnosticLog";
import {
  compareInvoiceExcelRoundTrip,
  formatRoundTripMismatchMessage,
  readInvoiceExcelRoundTrip,
} from "../utils/invoiceExcelRoundTrip";
import { generatedFiles, getGeneratedInvoiceExcelDir } from "../utils/invoiceExcel";

export async function assertSingleLineUploadedExcelRoundTrip(
  page: Page,
  uploadFilePath: string
): Promise<void> {
  const uploaded = readInvoiceExcelRoundTrip(uploadFilePath);
  if (uploaded.dataRowCount !== 1) {
    flowLog(
      "ExcelRoundTrip",
      `Skip round-trip: ${uploaded.dataRowCount} data row(s) in ${uploadFilePath}`
    );
    return;
  }
  const invoiceNumber = uploaded.invoiceNumber.trim();
  if (!invoiceNumber) {
    throw new Error(
      `Single-line Excel round-trip: no Invoice Number in ${uploadFilePath}`
    );
  }

  const dashboard = new DashboardPage(page);
  await dashboard.openDashboard(parallelWorkerDashboardOpenOpts());
  await dashboard.refreshDashboardForInvoiceTable(invoiceNumber);
  await dashboard.waitForInvoiceReadyToSubmitStatus(invoiceNumber);

  const row = await dashboard.chooseInvoiceRowForSubmit(invoiceNumber);
  await dashboard.clickInvoiceNumberOnRow(row);
  const submenu = await dashboard.openInvoiceDownloadSubmenuOnRow(row);
  const downloaded = await dashboard.clickDownloadFormatInSubmenu(
    submenu,
    INVOICE_DOWNLOAD_FORMAT_LABEL.excel
  );

  const dir = getGeneratedInvoiceExcelDir();
  fs.mkdirSync(dir, { recursive: true });
  const downloadPath = path.join(dir, `${invoiceNumber}-downloaded.xlsx`);
  fs.writeFileSync(downloadPath, downloaded.buffer);
  if (!generatedFiles.includes(downloadPath)) {
    generatedFiles.push(downloadPath);
  }

  const result = compareInvoiceExcelRoundTrip(uploadFilePath, downloadPath);
  if (result.mismatches.length > 0) {
    throw new Error(
      formatRoundTripMismatchMessage(invoiceNumber, result.mismatches)
    );
  }
  flowLog("ExcelRoundTrip", `Filled columns match for ${invoiceNumber}`);
}
```

If `chooseInvoiceRowForSubmit` is not exported as returning a Locator that still works after click, keep the same `row` variable from that call for Options (do not re-query after navigation). If clicking the number navigates away from the list, stop and report — spec forbids View; the click must stay on the list.

- [ ] **Step 2: Commit** — skip unless the user asks.

---

### Task 5: Hook `uploadAndVerify`

**Files:**
- Modify: `Helpers/uploadHelper.ts`

**GitNexus:** `uploadAndVerify` upstream is HIGH/MEDIUM (direct: `runPositiveFormulaScenario`, `verifyConditionalScenario`, `verifyConditionalScenarioAnyOf`, plus field specs that call `uploadAndVerify` directly). Extra work must stay behind `dataRowCount === 1`.

**Interfaces:**
- Consumes: `assertSingleLineUploadedExcelRoundTrip`
- Produces: same `uploadAndVerify(page, filePath)` signature. After `uploadAndVerifyStatus(..., 'completed')`, `await assertSingleLineUploadedExcelRoundTrip(page, filePath)`.

- [ ] **Step 1: Change `uploadAndVerify` only**

```typescript
export async function uploadAndVerify(
    page: Page,
    filePath: string
) {
    await uploadAndVerifyStatus(page, filePath, 'completed');
    await assertSingleLineUploadedExcelRoundTrip(page, filePath);
}
```

Do not add the call inside `uploadAndVerifyStatus` (error path would inherit it).

- [ ] **Step 2: Targeted Playwright** (only after user says **run**)

```bash
npx playwright test tests/OMN_FormulaValidation_CovoroTemplate_Test.spec.ts --project=chromium --grep "Valid inputs" --workers=1
```

Pick one known single-line positive title fragment, not the whole suite first.

Expected: case reaches Ready to Submit, downloads Excel, passes compare or fails with named columns.

- [ ] **Step 3: Commit** — skip unless the user asks.

---

## Spec coverage check

| Spec requirement | Task |
|---|---|
| Hook after completed `uploadAndVerify` | 5 |
| Skip multi-line | 1 (`dataRowCount`) + 4 (early return) |
| Wait Ready to Submit (Completed ≡ RTS) | 4 (`waitForInvoiceReadyToSubmitStatus`) |
| Click invoice number, not View | 3 + 4 |
| Options → Download → Excel | 4 |
| Compare filled columns only | 1 |
| Ignore date format | 1 |
| Number 100 vs 100.00 | 1 |
| Fail with all missing columns | 1 + 4 throw |
| No new specs | 5 |
| Error uploads unchanged | 5 (only `uploadAndVerify`) |

## Placeholder scan

No TBD / TODO / “handle later” left in tasks.
