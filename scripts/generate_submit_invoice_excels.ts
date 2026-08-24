/**
 * Pack Oman submit invoices into one single-item workbook and/or one multi-item workbook.
 *
 * Check (small):
 *   npx tsx scripts/generate_submit_invoice_excels.ts --single --limit 5
 *   npx tsx scripts/generate_submit_invoice_excels.ts --multi --limit 2
 *
 * Full matrix (slow — 1920 single invoices / 480 multi-item invoices):
 *   npx tsx scripts/generate_submit_invoice_excels.ts --single
 *   npx tsx scripts/generate_submit_invoice_excels.ts --multi
 *   npx tsx scripts/generate_submit_invoice_excels.ts --all
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { invoiceData } from "../testData/FieldValidations/SubmitInvoice";
import { multiItemInvoiceCases } from "../testData/FieldValidations/SubmitInvoiceMultiItem";
import {
  generateDistinctMultiItemSubmitInvoices,
  generateDistinctSubmitInvoices,
} from "../utils/invoiceExcel";

const FORMULA_INPUT_OVERRIDES: Record<string, string> = {
  "Item price base quantity": "1",
  "Item gross price": "9980",
  "Item price discount": "1",
  "Invoiced quantity": "10",
  "Invoice line charge amount": "",
  "Invoice line allowance amount": "",
  "Charges on document level": "",
  "Allowances on document level": "",
  "Paid amount": "",
  "Rounding amount": "",
};

function applySubmitTaxCategoryAndRateRules(
  data: Record<string, string>
): Record<string, string> {
  const taxCategory = String(data["Tax Category"] ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  if (!taxCategory) {
    return { ...data };
  }
  const next: Record<string, string> = { ...data };
  if (
    taxCategory === "services outside scope of tax / not subject to tax" ||
    taxCategory === "services outside scope of tax"
  ) {
    next["Tax Rate"] = "";
  }
  return next;
}

function prepareSubmitRow(data: Record<string, string>): Record<string, string> {
  return {
    ...applySubmitTaxCategoryAndRateRules(data),
    ...FORMULA_INPUT_OVERRIDES,
  };
}

function printUsage(): void {
  console.log(`Pack Oman submit invoices into 1 single-item file and/or 1 multi-item file.

Usage:
  npx tsx scripts/generate_submit_invoice_excels.ts --single [--limit N]
  npx tsx scripts/generate_submit_invoice_excels.ts --multi [--limit N]
  npx tsx scripts/generate_submit_invoice_excels.ts --all [--limit N]

Options:
  --single       All single-line invoices in one workbook (${invoiceData.length} invoices)
  --multi        All multi-line invoices in one workbook (${multiItemInvoiceCases.length} invoices, 4 lines each)
  --all          Both files
  --limit N      First N invoices only (use this to check generation)
  --no-copy      Do not copy to Downloads
  --out DIR      Extra copy directory (in addition to generated excel dir)

Output:
  testData/generated/excel/
  %USERPROFILE%\\Downloads\\OMAN_Submit_SingleItem.xlsx
  %USERPROFILE%\\Downloads\\OMAN_Submit_MultiItem.xlsx
`);
}

function parseArgs(argv: string[]): {
  single: boolean;
  multi: boolean;
  limit?: number;
  copyDownloads: boolean;
  extraOut?: string;
} {
  let single = false;
  let multi = false;
  let limit: number | undefined;
  let copyDownloads = true;
  let extraOut: string | undefined;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--single") {
      single = true;
    } else if (a === "--multi") {
      multi = true;
    } else if (a === "--all") {
      single = true;
      multi = true;
    } else if (a === "--limit") {
      const raw = argv[++i];
      const n = Number.parseInt(String(raw ?? ""), 10);
      if (!Number.isInteger(n) || n < 1) {
        throw new Error(`--limit expects an integer >= 1, got: ${raw}`);
      }
      limit = n;
    } else if (a === "--no-copy") {
      copyDownloads = false;
    } else if (a === "--out") {
      extraOut = argv[++i];
      if (!extraOut) {
        throw new Error("--out expects a directory path");
      }
    } else if (a === "--help" || a === "-h") {
      printUsage();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${a}`);
    }
  }

  return { single, multi, limit, copyDownloads, extraOut };
}

function writeTimeoutMs(rowCount: number): number {
  return Math.min(10_800_000, Math.max(1_200_000, rowCount * 2_000));
}

function downloadsDir(): string {
  return path.join(
    process.env.USERPROFILE || process.env.HOME || process.cwd(),
    "Downloads"
  );
}

function copyWorkbook(src: string, destPath: string): string {
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.copyFileSync(src, destPath);
  return destPath;
}

function stableFileName(kind: "single" | "multi", limit?: number): string {
  const base =
    kind === "single" ? "OMAN_Submit_SingleItem" : "OMAN_Submit_MultiItem";
  return limit ? `${base}_limit${limit}.xlsx` : `${base}.xlsx`;
}

async function generateSingle(limit?: number): Promise<{
  filePath: string;
  invoiceCount: number;
  invoiceNumbers: string[];
}> {
  const rows = (limit ? invoiceData.slice(0, limit) : invoiceData).map(prepareSubmitRow);
  console.log(`[single] building ${rows.length} invoices (1 line each)…`);
  const generated = await generateDistinctSubmitInvoices(rows, {
    fileName: stableFileName("single", limit),
    timeoutMs: writeTimeoutMs(rows.length),
    skipApplyCalculations: rows.length > 500,
  });
  return {
    filePath: generated.filePath,
    invoiceCount: rows.length,
    invoiceNumbers: generated.invoiceNumbers,
  };
}

async function generateMulti(limit?: number): Promise<{
  filePath: string;
  invoiceCount: number;
  rowCount: number;
  invoiceNumbers: string[];
}> {
  const cases = (limit ? multiItemInvoiceCases.slice(0, limit) : multiItemInvoiceCases).map(
    (tc) => tc.rows.map(prepareSubmitRow)
  );
  const lineCount = cases.reduce((acc, rows) => acc + rows.length, 0);
  console.log(
    `[multi] building ${cases.length} invoices (${lineCount} lines, 4 per invoice)…`
  );
  const generated = await generateDistinctMultiItemSubmitInvoices(cases, {
    fileName: stableFileName("multi", limit),
    timeoutMs: writeTimeoutMs(lineCount),
  });
  return {
    filePath: generated.filePath,
    invoiceCount: cases.length,
    rowCount: generated.rowCount,
    invoiceNumbers: generated.invoiceNumbers,
  };
}

async function main(): Promise<void> {
  process.env.UAE_EINVOICE_DISABLE_WORKER_IDENTITY = "1";
  process.env.UAE_EINVOICE_COUNTERPARTY_ELECTRONIC = "om-receiver-dev";

  const opts = parseArgs(process.argv.slice(2));
  if (!opts.single && !opts.multi) {
    printUsage();
    process.exit(1);
  }

  const copies: string[] = [];
  const results: Record<string, unknown> = {
    limit: opts.limit ?? null,
    singleMatrix: invoiceData.length,
    multiMatrix: multiItemInvoiceCases.length,
  };

  if (opts.single) {
    const generated = await generateSingle(opts.limit);
    results.single = {
      invoices: generated.invoiceCount,
      generated: generated.filePath,
      firstInvoice: generated.invoiceNumbers[0],
      lastInvoice: generated.invoiceNumbers[generated.invoiceNumbers.length - 1],
    };
    const name = stableFileName("single", opts.limit);
    if (opts.copyDownloads) {
      copies.push(copyWorkbook(generated.filePath, path.join(downloadsDir(), name)));
    }
    if (opts.extraOut) {
      copies.push(copyWorkbook(generated.filePath, path.join(opts.extraOut, name)));
    }
  }

  if (opts.multi) {
    const generated = await generateMulti(opts.limit);
    results.multi = {
      invoices: generated.invoiceCount,
      rows: generated.rowCount,
      generated: generated.filePath,
      firstInvoice: generated.invoiceNumbers[0],
      lastInvoice: generated.invoiceNumbers[generated.invoiceNumbers.length - 1],
    };
    const name = stableFileName("multi", opts.limit);
    if (opts.copyDownloads) {
      copies.push(copyWorkbook(generated.filePath, path.join(downloadsDir(), name)));
    }
    if (opts.extraOut) {
      copies.push(copyWorkbook(generated.filePath, path.join(opts.extraOut, name)));
    }
  }

  results.copies = copies;
  console.log(JSON.stringify(results, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
