/**
 * Build one accepted Oman Full Tax invoice from mandatory + Master + conditional
 * rules, then copy it to the user Downloads folder.
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { buildValidOmanFullTaxInvoiceRow } from "../Helpers/conditionalValidationHelper";
import { fieldValidationMandatory } from "../testData/FieldValidations/Min_max_field_validation";
import { generateInvoiceFromSubmitData } from "../utils/invoiceExcel";

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

async function main(): Promise<void> {
  // Keep Oman 12-digit VAT / electronic values; do not overwrite with worker identity.
  process.env.UAE_EINVOICE_DISABLE_WORKER_IDENTITY = "1";

  const row = buildValidOmanFullTaxInvoiceRow();
  assertMandatoryFilled(row);

  const { filePath, invoiceNumber } = await generateInvoiceFromSubmitData(row);

  const downloads = path.join(
    process.env.USERPROFILE || process.env.HOME || process.cwd(),
    "Downloads"
  );
  fs.mkdirSync(downloads, { recursive: true });
  const dest = path.join(downloads, "OMAN_Valid_Invoice.xlsx");
  fs.copyFileSync(filePath, dest);

  console.log(
    JSON.stringify(
      {
        profile: "Full Tax Invoice + Commercial invoice + OMR + Standard rate + Goods",
        invoiceNumber,
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
