/**
 * Patch seller/buyer OM identity onto all field-validation pack Excels
 * (skips files whose testcase mutates that same identity field).
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import {
  loadFieldValidationMatrix,
  resolveRowKey,
  sectionFolderName,
  outcomeBucketFromTitle,
  PACK_ROOT,
  MATRIX_DEFAULT_PATH,
  OMAN_SELLER_VAT,
  OMAN_BUYER_VAT,
  OMAN_SELLER_ELECTRONIC,
  OMAN_BUYER_ELECTRONIC,
  OMAN_ELECTRONIC_SCHEME,
} from "../Helpers/excel/fieldValidationExcelPackHelper";
import { buildValidOmanFullTaxInvoiceRow } from "../Helpers/excel/conditionalValidationHelper";
import { execSync } from "child_process";

const IDENTITY_PATCHES: Array<{ header: string; value: string; rowKeys: string[] }> = [
  {
    header: "Seller VAT Identifier (TRN / TIN)",
    value: OMAN_SELLER_VAT,
    rowKeys: ["Seller VAT Identifier (TRN / TIN)", "Seller VAT Identifier"],
  },
  {
    header: "Seller Electronic Address",
    value: OMAN_SELLER_ELECTRONIC,
    rowKeys: ["Seller electronic address"],
  },
  {
    header: "Seller Electronic Address Scheme",
    value: OMAN_ELECTRONIC_SCHEME,
    rowKeys: ["Seller electronic address Scheme", "Seller electronic address scheme"],
  },
  {
    header: "Buyer VAT Identifier",
    value: OMAN_BUYER_VAT,
    rowKeys: ["Buyer VAT identifier"],
  },
  {
    header: "Buyer Electronic Address",
    value: OMAN_BUYER_ELECTRONIC,
    rowKeys: ["Buyer electronic address"],
  },
  {
    header: "Buyer Electronic Address Scheme",
    value: OMAN_ELECTRONIC_SCHEME,
    rowKeys: ["Buyer electronic address Scheme", "Buyer electronic scheme identifier"],
  },
];

function norm(s: string): string {
  return s.replace(/\s+/g, " ").trim().toLowerCase();
}

function main(): void {
  process.env.UAE_EINVOICE_DISABLE_WORKER_IDENTITY = "1";
  const seed = buildValidOmanFullTaxInvoiceRow();
  const cases = loadFieldValidationMatrix(MATRIX_DEFAULT_PATH);
  const jobs: Array<{ destPath: string; field: string; value: string }> = [];

  for (const tc of cases) {
    const dest = path.join(
      PACK_ROOT,
      sectionFolderName(tc.section),
      outcomeBucketFromTitle(tc.title),
      `${tc.id}.xlsx`
    );
    if (!fs.existsSync(dest)) continue;
    const targetKey = norm(resolveRowKey(tc.field, seed));
    for (const patch of IDENTITY_PATCHES) {
      if (patch.rowKeys.some((k) => norm(k) === targetKey)) continue;
      jobs.push({ destPath: dest, field: patch.header, value: patch.value });
    }
  }

  const tmp = path.join(PACK_ROOT, "_tmp");
  fs.mkdirSync(tmp, { recursive: true });
  // Reuse one existing file as "base" for the batch script API — but our batch script
  // clones from base. For identity patch we need in-place patch per file.
  // Write a dedicated jobs file for in-place multi-patch python.
  const jobsFile = path.join(tmp, "identity-patches.json");
  fs.writeFileSync(jobsFile, JSON.stringify({ jobs }, null, 2), "utf8");

  const script = path.join(process.cwd(), "utils", "excel", "batch_patch_identity_inplace.py");
  const out = execSync(`python "${script}" "${jobsFile}"`, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 1_800_000,
    windowsHide: true,
  });
  console.log(out.trim());
}

main();
