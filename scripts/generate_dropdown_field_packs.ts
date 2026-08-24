/**
 * Generate Oman dropdown pack Excels with **full** Oman-valid invoice rows:
 * - dropdown_positive: one multi-invoice workbook per field with ALL master labels
 *   plus casing variants (abc / Abc / ABC / Title)
 * - dropdown_negative: one multi-invoice workbook per field with blank, whitespace,
 *   and InvalidTestData labels
 *
 * Each invoice row = full seed (buildValidOmanFullTaxInvoiceRow + identity + dependent
 * overlay); only the target dropdown column changes across rows.
 *
 * Layout: TestData/<SECTION>/dropdown_positive|dropdown_negative/<Field>_….xlsx
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import {
  dropdownFieldMasterConfig,
  conditionalDropdownFieldMasterConfig,
  mergeDropdownFieldConfigs,
} from "../testData/FieldValidations/TestDataConfig";
import { InvalidTestData } from "../testData/Master";
import { generateFullRowDropdownFieldExcel } from "../utils/invoiceExcel";
import {
  PACK_ROOT,
  sectionFolderName,
  buildOmanDropdownBaseRow,
  dropdownFieldSection,
  resolveDropdownTemplateField,
} from "../Helpers/fieldValidationExcelPackHelper";

function casingVariants(label: string): string[] {
  const s = String(label ?? "").trim();
  if (!s) return [];
  const out = new Set<string>();
  out.add(s);
  out.add(s.toLowerCase());
  out.add(s.toUpperCase());
  // Skip heavy variants for very long labels (keeps one multi-invoice file manageable).
  if (s.length <= 64) {
    out.add(
      s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    );
    const parts = s.split(/\s+/);
    if (parts[0]) {
      const w = parts[0];
      const rest = parts.slice(1).join(" ");
      const abc = w.toLowerCase();
      const Abc = w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      out.add(rest ? `${abc} ${rest}` : abc);
      out.add(rest ? `${Abc} ${rest}` : Abc);
    }
  }
  return [...out];
}

function safeFilePart(name: string): string {
  return name.replace(/[^\w\-]+/g, "_").replace(/_+/g, "_").slice(0, 80);
}

function templateFieldName(matrixOrConfigField: string): string {
  return resolveDropdownTemplateField(matrixOrConfigField);
}

async function writePackWorkbook(opts: {
  section: string;
  fieldForWrite: string;
  values: string[];
  bucket: "dropdown_positive" | "dropdown_negative";
  fileStem: string;
  packRoot?: string;
}): Promise<number> {
  const { section, fieldForWrite, values, bucket, fileStem } = opts;
  const root = opts.packRoot ?? PACK_ROOT;
  const dir = path.join(root, sectionFolderName(section), bucket);
  fs.mkdirSync(dir, { recursive: true });

  const baseRow = buildOmanDropdownBaseRow(fieldForWrite);
  const files = await generateFullRowDropdownFieldExcel(
    fieldForWrite,
    values.map((label) => ({ label })),
    baseRow,
    { fileNamePrefix: `${safeFilePart(fieldForWrite)}_${bucket}_${Date.now()}` }
  );

  let written = 0;
  for (let i = 0; i < files.length; i++) {
    const dest = path.join(
      dir,
      `${safeFilePart(fieldForWrite)}_${fileStem}${files.length > 1 ? `_part${i + 1}` : ""}.xlsx`
    );
    fs.copyFileSync(files[i].filePath, dest);
    written += 1;
    console.log(
      `[${bucket === "dropdown_positive" ? "dropdown+" : "dropdown-"}] ${section} / ${fieldForWrite} → ${path.basename(dest)} (${values.length} values, part ${i + 1}/${files.length})`
    );
  }
  return written;
}

function parseCli(argv: string[]): {
  section?: string;
  fields?: string[];
  packRoot: string;
} {
  let section: string | undefined;
  let fields: string[] | undefined;
  let packRoot = PACK_ROOT;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--section") section = argv[++i];
    else if (a === "--field" || a === "--fields") {
      fields = (argv[++i] || "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
    } else if (a === "--out") {
      packRoot = argv[++i];
    }
  }
  return { section, fields, packRoot };
}

async function main(): Promise<void> {
  process.env.UAE_EINVOICE_DISABLE_WORKER_IDENTITY = "1";
  process.env.UAE_EINVOICE_COUNTERPARTY_ELECTRONIC = "om-receiver-dev";

  const cli = parseCli(process.argv.slice(2));

  const configs = mergeDropdownFieldConfigs(
    dropdownFieldMasterConfig,
    conditionalDropdownFieldMasterConfig
  );

  let written = 0;
  const errors: Array<{ field: string; error: string }> = [];

  for (const config of configs) {
    const section = dropdownFieldSection(config.field) || "DOCUMENT DETAILS";
    if (cli.section && cli.section.toLowerCase() !== section.toLowerCase()) {
      continue;
    }
    if (cli.fields?.length) {
      const fieldNorm = config.field.replace(/\s+/g, " ").trim().toLowerCase();
      const hit = cli.fields.some((f) => {
        const n = f.replace(/\s+/g, " ").trim().toLowerCase();
        return fieldNorm === n || fieldNorm.includes(n);
      });
      if (!hit) continue;
    }

    const fieldForWrite = templateFieldName(config.field);
    const labels = (config.master ?? [])
      .map((x) => String(x.label ?? "").trim())
      .filter(Boolean);

    // Positive: all labels + casing variants (deduped)
    const positiveValues: string[] = [];
    const seen = new Set<string>();
    for (const label of labels) {
      for (const v of casingVariants(label)) {
        if (seen.has(v)) continue;
        seen.add(v);
        positiveValues.push(v);
      }
    }

    const negValues: string[] = [
      "",
      "   ",
      ...InvalidTestData.map((x) => String(x.label)),
    ];

    try {
      written += await writePackWorkbook({
        section,
        fieldForWrite,
        values: positiveValues,
        bucket: "dropdown_positive",
        fileStem: "all_values",
        packRoot: cli.packRoot,
      });
      written += await writePackWorkbook({
        section,
        fieldForWrite,
        values: negValues,
        bucket: "dropdown_negative",
        fileStem: "invalid",
        packRoot: cli.packRoot,
      });
    } catch (err) {
      errors.push({
        field: config.field,
        error: err instanceof Error ? err.message : String(err),
      });
      console.error(`[dropdown FAIL] ${config.field}:`, err);
    }
  }

  console.log(
    JSON.stringify({ out: cli.packRoot, written, errors }, null, 2)
  );
  if (errors.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
