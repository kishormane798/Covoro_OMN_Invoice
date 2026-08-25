/**
 * Approach A smoke: build Excel from Invoice Transaction Type / Type / Tax Category.
 *
 * Examples:
 *   npx ts-node scripts/generate_excel_from_drivers.ts
 *   npx ts-node scripts/generate_excel_from_drivers.ts --txn "Import of Goods" --tax "Standard rate."
 *   npx ts-node scripts/generate_excel_from_drivers.ts --type "Credit note" --blank "Invoice Number"
 *   npx ts-node scripts/generate_excel_from_drivers.ts --override "Tax Rate=99"
 */
import "dotenv/config";
import assert from "assert";
import fs from "fs";
import path from "path";
import {
  DEFAULT_INVOICE_DRIVERS,
  buildInvoiceRowFromDrivers,
  generateExcelFromDrivers,
  type InvoiceDriverFieldOverrides,
  type InvoiceDriverProfile,
} from "../Helpers/excel/invoiceDriverProfileHelper";
import * as FV from "../testData/FieldValidations/ConditionalValidation";

function parseArgs(argv: string[]): {
  drivers: InvoiceDriverProfile;
  overrides: InvoiceDriverFieldOverrides;
  skipExcel: boolean;
} {
  const drivers: InvoiceDriverProfile = { ...DEFAULT_INVOICE_DRIVERS };
  const overrides: InvoiceDriverFieldOverrides = {};
  let skipExcel = false;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--txn" && argv[i + 1]) {
      drivers.invoiceTransactionTypeCode = argv[++i]!;
    } else if (a === "--type" && argv[i + 1]) {
      drivers.invoiceTypeCode = argv[++i]!;
    } else if (a === "--tax" && argv[i + 1]) {
      drivers.taxCategory = argv[++i]!;
    } else if (a === "--blank" && argv[i + 1]) {
      overrides[argv[++i]!] = "";
    } else if (a === "--override" && argv[i + 1]) {
      const raw = argv[++i]!;
      const eq = raw.indexOf("=");
      if (eq <= 0) {
        throw new Error(`--override expects Field=Value, got: ${raw}`);
      }
      overrides[raw.slice(0, eq)] = raw.slice(eq + 1);
    } else if (a === "--row-only") {
      skipExcel = true;
    }
  }

  return { drivers, overrides, skipExcel };
}

function assertDefaultProfile(row: Record<string, string | null>): void {
  assert.strictEqual(
    row[FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD],
    FV.TXN_FULL_TAX_INVOICE
  );
  assert.strictEqual(
    row[FV.INVOICE_TYPE_CODE_FIELD],
    FV.INVOICE_TYPE_COMMERCIAL_INVOICE
  );
  assert.strictEqual(row[FV.TAX_CATEGORY_FIELD], FV.STANDARD_TAX_CATEGORY_CODE);
  assert.strictEqual(
    row[FV.INVOICED_ITEM_TAX_RATE_FIELD],
    FV.TAX_RATE_STANDARD_OMAN
  );
}

function assertCreditNoteProfile(row: Record<string, string | null>): void {
  assert.strictEqual(
    row[FV.INVOICE_TYPE_CODE_FIELD],
    FV.INVOICE_TYPE_CREDIT_NOTE
  );
  assert.ok(
    String(row[FV.PRECEDING_INVOICE_REFERENCE_FIELD] ?? "").trim().length > 0,
    "Credit note must fill preceding invoice reference"
  );
  assert.ok(
    String(row[FV.CREDIT_DEBIT_NOTE_REASON_CODE_FIELD] ?? "").trim().length > 0,
    "Credit note must fill reason code"
  );
}

function assertExemptOverride(row: Record<string, string | null>): void {
  assert.strictEqual(
    row[FV.TAX_CATEGORY_FIELD],
    FV.EXEMPT_FROM_TAX_TAX_CATEGORY_CODE
  );
  assert.strictEqual(String(row[FV.INVOICED_ITEM_TAX_RATE_FIELD] ?? ""), "");
  assert.ok(
    String(row[FV.TAX_EXEMPTION_REASON_CODE_FIELD] ?? "").trim().length > 0
  );
}

async function main(): Promise<void> {
  process.env.UAE_EINVOICE_DISABLE_WORKER_IDENTITY = "1";

  const { drivers, overrides, skipExcel } = parseArgs(process.argv.slice(2));

  // Built-in checks for default / alternate profiles (row-level, no browser).
  if (
    drivers.invoiceTransactionTypeCode ===
      DEFAULT_INVOICE_DRIVERS.invoiceTransactionTypeCode &&
    drivers.invoiceTypeCode === DEFAULT_INVOICE_DRIVERS.invoiceTypeCode &&
    drivers.taxCategory === DEFAULT_INVOICE_DRIVERS.taxCategory &&
    Object.keys(overrides).length === 0
  ) {
    assertDefaultProfile(buildInvoiceRowFromDrivers(drivers));
    assertCreditNoteProfile(
      buildInvoiceRowFromDrivers({
        ...DEFAULT_INVOICE_DRIVERS,
        invoiceTypeCode: FV.INVOICE_TYPE_CREDIT_NOTE,
      })
    );
    assertExemptOverride(
      buildInvoiceRowFromDrivers({
        ...DEFAULT_INVOICE_DRIVERS,
        taxCategory: FV.EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      })
    );
  }

  const row = buildInvoiceRowFromDrivers(drivers, overrides);

  if (skipExcel) {
    console.log(
      JSON.stringify(
        {
          ok: true,
          mode: "row-only",
          drivers,
          overrides,
          sample: {
            txn: row[FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD],
            type: row[FV.INVOICE_TYPE_CODE_FIELD],
            taxCategory: row[FV.TAX_CATEGORY_FIELD],
            taxRate: row[FV.INVOICED_ITEM_TAX_RATE_FIELD],
          },
        },
        null,
        2
      )
    );
    return;
  }

  const { filePath, invoiceNumber } = await generateExcelFromDrivers(
    drivers,
    overrides
  );

  const downloads = path.join(
    process.env.USERPROFILE || process.env.HOME || process.cwd(),
    "Downloads"
  );
  fs.mkdirSync(downloads, { recursive: true });
  const dest = path.join(downloads, "OMAN_Driver_Profile_Invoice.xlsx");
  fs.copyFileSync(filePath, dest);

  console.log(
    JSON.stringify(
      {
        ok: true,
        drivers,
        overrides,
        invoiceNumber,
        generated: filePath,
        download: dest,
        sample: {
          txn: row[FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD],
          type: row[FV.INVOICE_TYPE_CODE_FIELD],
          taxCategory: row[FV.TAX_CATEGORY_FIELD],
          taxRate: row[FV.INVOICED_ITEM_TAX_RATE_FIELD],
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
