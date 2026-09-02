/**
 * Build accepted Oman Full Tax invoice(s) from mandatory + Master + conditional
 * rules, then copy to the user Downloads folder.
 *
 *   npx tsx scripts/generate_valid_oman_invoice.ts
 *   npx tsx scripts/generate_valid_oman_invoice.ts --rows 10000
 *   npx tsx scripts/generate_valid_oman_invoice.ts --invoices 10000
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { buildValidOmanFullTaxInvoiceRow } from "../Helpers/excel/conditionalValidationHelper";
import { fieldValidationMandatory } from "../testData/FieldValidations/Min_max_field_validation";
import {
  generateInvoiceFromSubmitData,
  INVOICE_TEMPLATE_DATA_ROW,
} from "../utils/excel/invoiceExcel";
import { runPythonForStdout } from "../utils/pythonRunner";

const SHEET_NAME = "E Invoice";
const HEADER_ROW = 4;
const EXPAND_TIMEOUT_MS = 1_200_000;

function assertMandatoryFilled(row: Record<string, string>): void {
  const missing: string[] = [];
  for (const rule of fieldValidationMandatory) {
    const value = String(row[rule.field] ?? "").trim();
    if (value.length < rule.min) {
      missing.push(`${rule.field} (need min ${rule.min}, got ${value.length})`);
    }
  }
  if (missing.length) {
    throw new Error(`Mandatory fields incomplete:\n- ${missing.join("\n- ")}`);
  }
}

function parseCountToken(raw: string, flag: string): number {
  const text = raw.trim().toLowerCase().replace(/,/g, "");
  const k = /^(\d+(?:\.\d+)?)k$/.exec(text);
  const value = k ? Math.round(Number(k[1]) * 1000) : Number(text);
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`Invalid ${flag} '${raw}'. Use e.g. 1, 10000, 10k`);
  }
  return value;
}

function readFlagCount(argv: string[], flag: string): number | undefined {
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === flag) {
      const raw = argv[i + 1];
      if (!raw) {
        throw new Error(`Missing value for ${flag}`);
      }
      return parseCountToken(raw, flag);
    }
    if (arg.startsWith(`${flag}=`)) {
      return parseCountToken(arg.slice(flag.length + 1), flag);
    }
  }
  return undefined;
}

function parseArgs(argv: string[]): { lineCount: number; invoiceCount: number } {
  const lineCount = readFlagCount(argv, "--rows") ?? 1;
  const invoiceCount = readFlagCount(argv, "--invoices") ?? 1;
  if (lineCount > 1 && invoiceCount > 1) {
    throw new Error("Use either --rows or --invoices, not both.");
  }
  return { lineCount, invoiceCount };
}

function countLabel(n: number): string {
  if (n % 1000 === 0 && n >= 1000) {
    return `${n / 1000}k`;
  }
  return String(n);
}

function downloadFileName(lineCount: number, invoiceCount: number): string {
  if (invoiceCount > 1) {
    return `OMAN_Valid_Invoice_${countLabel(invoiceCount)}_invoices.xlsx`;
  }
  if (lineCount > 1) {
    return `OMAN_Valid_Invoice_${countLabel(lineCount)}_rows.xlsx`;
  }
  return "OMAN_Valid_Invoice.xlsx";
}

function pythonWriterPath(): string {
  const scriptPath = path.join(
    process.cwd(),
    "utils",
    "excel",
    "invoice_excel_writer.py"
  );
  if (!fs.existsSync(scriptPath)) {
    throw new Error(`Python writer script not found at: ${scriptPath}`);
  }
  return scriptPath;
}

function parseExpandJson(stdout: string, command: string): Record<string, unknown> {
  const lastLine = stdout
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith("{"))
    .pop();
  if (!lastLine) {
    throw new Error(`${command} produced no JSON: ${stdout}`);
  }
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(lastLine) as Record<string, unknown>;
  } catch {
    throw new Error(`Invalid ${command} output: ${stdout}`);
  }
  if (!parsed.ok) {
    throw new Error(`${command} failed: ${stdout}`);
  }
  return parsed;
}

function expandInvoiceLines(filePath: string, lineCount: number): {
  lineCount: number;
  sumOfInvoiceLineNetAmount?: number;
  invoiceTotalAmountWithTax?: number;
} {
  const stdout = runPythonForStdout(
    pythonWriterPath(),
    [
      "expand_invoice_lines",
      filePath,
      SHEET_NAME,
      String(HEADER_ROW),
      String(INVOICE_TEMPLATE_DATA_ROW),
      String(lineCount),
    ],
    EXPAND_TIMEOUT_MS
  );
  const parsed = parseExpandJson(stdout, "expand_invoice_lines");
  return {
    lineCount: Number(parsed.lineCount ?? lineCount),
    sumOfInvoiceLineNetAmount:
      parsed.sumOfInvoiceLineNetAmount === undefined
        ? undefined
        : Number(parsed.sumOfInvoiceLineNetAmount),
    invoiceTotalAmountWithTax:
      parsed.invoiceTotalAmountWithTax === undefined
        ? undefined
        : Number(parsed.invoiceTotalAmountWithTax),
  };
}

function expandSingleItemInvoices(filePath: string, invoiceCount: number): {
  invoiceCount: number;
  firstInvoiceNumber?: string;
  lastInvoiceNumber?: string;
  batchPrefix?: string;
} {
  const stdout = runPythonForStdout(
    pythonWriterPath(),
    [
      "expand_single_item_invoices",
      filePath,
      SHEET_NAME,
      String(HEADER_ROW),
      String(INVOICE_TEMPLATE_DATA_ROW),
      String(invoiceCount),
    ],
    EXPAND_TIMEOUT_MS
  );
  const parsed = parseExpandJson(stdout, "expand_single_item_invoices");
  return {
    invoiceCount: Number(parsed.invoiceCount ?? invoiceCount),
    firstInvoiceNumber:
      parsed.firstInvoiceNumber === undefined
        ? undefined
        : String(parsed.firstInvoiceNumber),
    lastInvoiceNumber:
      parsed.lastInvoiceNumber === undefined
        ? undefined
        : String(parsed.lastInvoiceNumber),
    batchPrefix:
      parsed.batchPrefix === undefined ? undefined : String(parsed.batchPrefix),
  };
}

async function main(): Promise<void> {
  // Keep Oman 12-digit VAT / electronic values; do not overwrite with worker identity.
  process.env.UAE_EINVOICE_DISABLE_WORKER_IDENTITY = "1";

  const { lineCount, invoiceCount } = parseArgs(process.argv.slice(2));
  const row = buildValidOmanFullTaxInvoiceRow();
  assertMandatoryFilled(row);

  const { filePath, invoiceNumber } = await generateInvoiceFromSubmitData(row);
  const expandedLines =
    lineCount > 1 ? expandInvoiceLines(filePath, lineCount) : { lineCount: 1 };
  const expandedInvoices =
    invoiceCount > 1
      ? expandSingleItemInvoices(filePath, invoiceCount)
      : { invoiceCount: 1, firstInvoiceNumber: invoiceNumber };

  const downloads = path.join(
    process.env.USERPROFILE || process.env.HOME || process.cwd(),
    "Downloads"
  );
  fs.mkdirSync(downloads, { recursive: true });
  const dest = path.join(downloads, downloadFileName(lineCount, invoiceCount));
  fs.copyFileSync(filePath, dest);

  console.log(
    JSON.stringify(
      {
        profile: "Full Tax Invoice + Commercial invoice + OMR + Standard rate + Goods",
        invoiceNumber:
          expandedInvoices.firstInvoiceNumber ?? invoiceNumber,
        lastInvoiceNumber: expandedInvoices.lastInvoiceNumber,
        invoiceCount: expandedInvoices.invoiceCount,
        lineCount: expandedLines.lineCount,
        itemsPerInvoice: invoiceCount > 1 ? 1 : expandedLines.lineCount,
        sumOfInvoiceLineNetAmount: expandedLines.sumOfInvoiceLineNetAmount,
        invoiceTotalAmountWithTax: expandedLines.invoiceTotalAmountWithTax,
        generated: filePath,
        download: dest,
        sample: {
          txn: row["Invoice Transaction Type Code"],
          type: row["Invoice Type Code"],
          currency: row["Invoice Currency Code"],
          taxCategory: row["Tax Category"],
          taxRate: row["Tax Rate"],
          itemType: row["Item Type"],
          hs: row["Item classification identifier"],
          sellerCountry: row["Seller country code"],
          buyerCountry: row["Buyer country code"],
        },
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
