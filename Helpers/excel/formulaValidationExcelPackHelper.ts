/**
 * Build static Oman formula-validation Excel packs from
 * `testcase/formula_validation/EINV_OMAN_FormulaValidation_FullMatrix.xlsx`.
 *
 * Each workbook = Oman submit seed (tax/currency/lines from matrix) + optional calculated-field mutation.
 * Uses `generateInvoiceFromSubmitData` (1-line) / `generateInvoiceFromSubmitRows` (multi-item),
 * then `batch_clone_patch_invoice.py` per overlay profile.
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { sectionFolderName } from "./fieldValidationExcelPackHelper";
import {
  CALCULATED_FIELD_MISMATCH_TARGETS,
  CALCULATED_FIELD_TOLERANCE_TARGETS,
  DEFAULT_FOREIGN_EXCHANGE_RATE,
  FOREIGN_CURRENCY_CODE,
  FORMULA_BAISA_TOLERANCE,
  FORMULA_MONETARY_TOLERANCE,
  buildFormulaExcelPayload,
  buildFormulaSubmitRow,
  type FormulaDataRow,
} from "./formulaValidationHelper";
import {
  calculateInvoiceValuesForGeneratorPayload,
  generateInvoiceFromSubmitData,
  generateInvoiceFromSubmitRows,
  applyInvoiceCalculationsToFile,
  OMAN_HOME_CURRENCY,
} from "../../utils/excel/invoiceExcel";
import { createPackProgressReporter, packOutputAlreadyExists } from "../packProgressReporter";
import { runPythonForStdout } from "../../utils/pythonRunner";
import {
  TAX_EXEMPTION_REASON_SAMPLE,
  TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE,
} from "../../testData/FieldValidations/ConditionalValidation";

export type FormulaMatrixCase = {
  id: string;
  priority: string;
  polarity: string;
  section: string;
  field: string;
  taxCategory: string;
  currency: string;
  lines: string;
  ruleId: string;
  title: string;
  description: string;
  preconditions?: string;
  steps?: string;
  expected?: string;
  automationStatus?: string;
};

export type FormulaMutationKind =
  | "gap"
  | "positive_keep"
  | "mismatch_12345"
  | "within_tolerance"
  | "outside_tolerance"
  | "forced_nonzero_vat"
  | "blank_gross"
  | "non_numeric_gross"
  | "blank_discount"
  | "tax_rate_percent"
  | "tax_rate_wrong"
  | "blank_exchange_rate"
  | "valid_inputs";

export type FormulaGeneratePackResult = {
  id: string;
  section: string;
  field: string;
  title: string;
  ruleId: string;
  polarity: "positive" | "negative" | "gap" | "unknown";
  mutation: FormulaMutationKind;
  status: "ok" | "skipped" | "error";
  reason?: string;
  destPath?: string;
  invoiceNumber?: string;
  mutatedValue?: string;
  excelHeader?: string;
};

export const MATRIX_DEFAULT_PATH = path.join(
  process.cwd(),
  "testcase",
  "formula_validation",
  "EINV_OMAN_FormulaValidation_FullMatrix.xlsx"
);

export const PACK_ROOT = path.join(
  process.cwd(),
  "testcase",
  "formula_validation",
  "TestData"
);

const MISMATCH_DELTA = 12345;

/** Matrix field label → template header used for patch / assert. */
const FIELD_TO_EXCEL_HEADER: Record<string, string> = {
  "Item Net Price": "Item Net Price",
  "Invoice Line Net Amount": "Invoice Line Net Amount",
  "Line Item VAT Amount": "Line Item VAT Amount",
  "Total Amount Including VAT": "Total Amount Including VAT",
  "Sum Of Invoice Line Net Amount": "Sum Of Invoice Line Net Amount",
  "Invoice Total Amount Without Tax": "Invoice Total Amount Without Tax",
  "Invoice Total Tax Amount": "Invoice Total Tax Amount",
  "Invoice Total Tax Amount In Tax Accounting Currency":
    "Invoice Total Tax Amount In Tax Accounting Currency",
  "Invoice Total Amount With Tax": "Invoice Total Amount With Tax",
  "Amount Due For Payment": "Amount Due For Payment",
  "Total Amount Due (Profit Margin)": "Total Amount Due (Profit Margin)",
  "Item Gross Price": "Item Gross Price",
  "Item Price Discount": "Item Price Discount",
  "Tax Rate": "Tax Rate",
  "Currency Exchange Rate": "Currency Exchange Rate",
};

function normKey(s: string): string {
  return s.replace(/\s+/g, " ").trim().toLowerCase();
}

function polarityOf(tc: FormulaMatrixCase): FormulaGeneratePackResult["polarity"] {
  const p = normKey(tc.polarity);
  if (p === "positive") return "positive";
  if (p === "negative") return "negative";
  if (p === "gap") return "gap";
  return "unknown";
}

export function classifyFormulaMutation(tc: FormulaMatrixCase): FormulaMutationKind {
  if (polarityOf(tc) === "gap" || /not excel-testable|documented gap/i.test(tc.title)) {
    return "gap";
  }
  const t = tc.title.toLowerCase();
  if (/\+12345|large amount/.test(t)) return "mismatch_12345";
  // Check outside before within — titles share "tolerance ±0.01" wording.
  if (/outside tolerance|beyond tolerance|rejected outside/.test(t)) {
    return "outside_tolerance";
  }
  if (/within tolerance|inside tolerance|accepted within/.test(t)) {
    return "within_tolerance";
  }
  if (/non-zero line item vat|non zero line item vat|forced.*non-zero|rejected for tax category/.test(t) &&
      /line item vat/i.test(tc.field + " " + t)) {
    return "forced_nonzero_vat";
  }
  if (/leave item gross price blank|without gross price|gross price is required/.test(t)) {
    return "blank_gross";
  }
  if (/letters \(abc\)|enter letters|must be numeric/.test(t) && /gross/i.test(tc.field)) {
    return "non_numeric_gross";
  }
  if (/leave discount blank|blank item price discount|blank→0|blank->0/.test(t)) {
    return "blank_discount";
  }
  if (/type 5%|5% in tax rate|without a % symbol/.test(t)) return "tax_rate_percent";
  if (/set tax rate to 4|tax rate must be exactly 5/.test(t)) return "tax_rate_wrong";
  if (/leave exchange rate blank|exchange rate is mandatory/.test(t)) {
    return "blank_exchange_rate";
  }
  if (
    /keep the system-calculated|keep calculated|unchanged and upload must pass|set gross 1000|set currency=usd and exchange rate=3\.67|valid gross and discount|valid fx allows/i.test(
      t
    )
  ) {
    return polarityOf(tc) === "negative" ? "mismatch_12345" : "positive_keep";
  }
  if (/wrong multi-item|wrong .* is rejected|change the calculated/.test(t)) {
    return "mismatch_12345";
  }
  if (polarityOf(tc) === "positive") return "positive_keep";
  if (polarityOf(tc) === "negative") return "mismatch_12345";
  return "valid_inputs";
}

function resolveExcelHeader(field: string): string | null {
  if (FIELD_TO_EXCEL_HEADER[field]) return FIELD_TO_EXCEL_HEADER[field];
  const hit = CALCULATED_FIELD_MISMATCH_TARGETS.find(
    (t) => normKey(t.shortName) === normKey(field) || normKey(t.excelHeader) === normKey(field)
  );
  return hit?.excelHeader ?? (field.trim() ? field : null);
}

function toleranceForField(excelHeader: string): number {
  const hit = CALCULATED_FIELD_TOLERANCE_TARGETS.find(
    (t) => normKey(t.excelHeader) === normKey(excelHeader)
  );
  if (hit) return hit.tolerance;
  return normKey(excelHeader) === "line item vat amount"
    ? FORMULA_BAISA_TOLERANCE
    : FORMULA_MONETARY_TOLERANCE;
}

function isMultiItem(tc: FormulaMatrixCase): boolean {
  return /2\s*lines|multi-item/i.test(tc.lines);
}

function isForeignCurrency(tc: FormulaMatrixCase): boolean {
  const c = normKey(tc.currency);
  return Boolean(c) && c !== "omr" && c !== "n/a";
}

/** Map matrix Tax Category + extras onto camelCase formula payload overlays. */
function taxCategoryOverlay(taxCategory: string): Partial<FormulaDataRow> {
  const t = normKey(taxCategory);
  if (t.includes("zero rated")) {
    return {
      taxCategory: "Zero rated",
      taxRate: 0,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE,
    };
  }
  if (t.includes("exempt")) {
    return {
      taxCategory: "Exempt from tax",
      taxRate: null,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_SAMPLE,
      invoiceTypeCode: "Invoice out of scope of tax",
      paymentMeansTypeCode: "Instrument not defined",
    };
  }
  if (t.includes("not subject") || t.includes("outside scope")) {
    return {
      taxCategory: "Services outside scope of tax / Not subject to tax",
      taxRate: null,
      taxExemptionReasonCode: "",
      invoiceTypeCode: "Invoice out of scope of tax",
      paymentMeansTypeCode: "Instrument not defined",
    };
  }
  // Standard (and mixed multi-item seed starts as Standard on line 1)
  return {
    taxCategory: "Standard rate",
    taxRate: 5,
  };
}

function baseFormulaRow(tc: FormulaMatrixCase): FormulaDataRow {
  const overlay = taxCategoryOverlay(tc.taxCategory);
  const row: FormulaDataRow = {
    name: tc.id,
    itemPriceBaseQty: 1,
    itemGrossPrice: 1000,
    itemPriceDiscount: 100,
    invoicedQty: 1,
    lineCharge: 0,
    lineAllowance: 0,
    docCharges: 0,
    docAllowances: 0,
    paidAmount: 0,
    roundingAmount: 0,
    ...overlay,
  };
  if (normKey(tc.field).includes("profit margin")) {
    row.invoiceTransactionTypeCode = "Profit Margin Invoice";
  }
  return row;
}

function outcomeBucket(tc: FormulaMatrixCase): "positive" | "negative" | "gap" {
  const p = polarityOf(tc);
  if (p === "positive") return "positive";
  if (p === "gap") return "gap";
  return "negative";
}

/** Folder name from matrix Field name (e.g. Item Net Price → ITEM_NET_PRICE). */
export function fieldFolderName(field: string): string {
  const cleaned = (field || "UNKNOWN_FIELD")
    .replace(/[()[\]{}]/g, " ")
    .replace(/[^\w\s.-]+/g, " ")
    .trim();
  return sectionFolderName(cleaned || "UNKNOWN_FIELD");
}

export function caseOutputDir(
  packRoot: string,
  tc: FormulaMatrixCase
): string {
  return path.join(packRoot, fieldFolderName(tc.field), outcomeBucket(tc));
}

/** Map matrix input mutation → formula scenario row (same shape runtime specs use). */
function matrixCaseToFormulaRow(
  tc: FormulaMatrixCase,
  mutation: FormulaMutationKind
): FormulaDataRow {
  const row = baseFormulaRow(tc);
  switch (mutation) {
    case "blank_gross":
      row.itemGrossPrice = "";
      break;
    case "non_numeric_gross":
      row.itemGrossPrice = "ABC";
      break;
    case "blank_discount":
      row.itemPriceDiscount = "";
      break;
    case "tax_rate_percent":
      row.taxRate = "5%";
      break;
    case "tax_rate_wrong":
      row.taxRate = "4";
      break;
    case "blank_exchange_rate":
      row.currencyRate = null;
      break;
    default:
      break;
  }
  return row;
}

/** Single-line Oman seed with formula matrix tax/currency/line overlays (submit headers). */
function buildSingleLineSubmitRow(
  tc: FormulaMatrixCase,
  mutation: FormulaMutationKind
): Record<string, string> {
  const mode = isForeignCurrency(tc) ? "foreign" : "omr";
  return buildFormulaSubmitRow(matrixCaseToFormulaRow(tc, mutation), mode, {
    applyWorkerIdentity: false,
  });
}

function pickCorrectCalculated(
  excelHeader: string,
  calc: ReturnType<typeof calculateInvoiceValuesForGeneratorPayload>
): number | null {
  const target = CALCULATED_FIELD_MISMATCH_TARGETS.find(
    (t) => normKey(t.excelHeader) === normKey(excelHeader)
  );
  if (!target) return null;
  const v = target.pickCorrect(calc);
  return v === null || Number.isNaN(Number(v)) ? null : Number(v);
}

function applyToleranceDelta(base: number, delta: number): number {
  const places = Math.abs(delta) > 0 && Math.abs(delta) < 0.01 ? 3 : 2;
  return Number((base + delta).toFixed(places));
}

/** Multi-item worked example from formula_validation README (Standard rate). */
function buildMultiItemSubmitRows(tc: FormulaMatrixCase): Record<string, string>[] {
  const mode = isForeignCurrency(tc) ? "foreign" : "omr";
  const seed = buildFormulaSubmitRow(baseFormulaRow(tc), mode, {
    applyWorkerIdentity: false,
  });

  const line1: Record<string, string> = {
    ...seed,
    "Item gross price": "1000",
    "Item price discount": "100",
    "Item price base quantity": "1",
    "Invoiced quantity": "1",
  };
  const line2: Record<string, string> = {
    ...seed,
    "Item description": "Second line item — Oman multi-item formula",
    "Item gross price": "500",
    "Item price discount": "0",
    "Item price base quantity": "1",
    "Invoiced quantity": "2",
  };

  // Mixed Standard + Zero rated multi-item (matrix Tax Category).
  if (/standard\s*\+\s*zero/i.test(tc.taxCategory)) {
    line2["Tax Category"] = "Zero rated";
    line2["Tax Rate"] = "0";
    line2["Tax exemption reason code"] = TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE;
  }

  return [line1, line2];
}

async function generateSingleLineWorkbook(
  tc: FormulaMatrixCase,
  mutation: FormulaMutationKind
): Promise<{ filePath: string; invoiceNumber: string }> {
  const row = buildSingleLineSubmitRow(tc, mutation);
  return generateInvoiceFromSubmitData(row);
}

async function generateMultiItemWorkbook(
  tc: FormulaMatrixCase,
  _mutation: FormulaMutationKind
): Promise<{ filePath: string; invoiceNumber: string }> {
  const rows = buildMultiItemSubmitRows(tc);
  return generateInvoiceFromSubmitRows(rows);
}

export function loadFormulaValidationMatrix(
  matrixPath = MATRIX_DEFAULT_PATH
): FormulaMatrixCase[] {
  const script = path.join(process.cwd(), "utils", "excel", "read_formula_validation_matrix.py");
  const stdout = runPythonForStdout(script, [matrixPath]);
  const parsed = JSON.parse(stdout.trim()) as {
    ok?: boolean;
    error?: string;
    cases?: FormulaMatrixCase[];
  };
  if (!parsed.ok || !parsed.cases) {
    throw new Error(parsed.error || `Failed to read formula matrix: ${stdout}`);
  }
  return parsed.cases;
}

const INPUT_MUTATIONS = new Set<FormulaMutationKind>([
  "blank_gross",
  "non_numeric_gross",
  "blank_discount",
  "tax_rate_percent",
  "tax_rate_wrong",
  "blank_exchange_rate",
]);

function inputMutationPatch(
  mutation: FormulaMutationKind
): { header: string; value: string } | null {
  switch (mutation) {
    case "blank_gross":
      return { header: "Item Gross Price", value: "" };
    case "non_numeric_gross":
      return { header: "Item Gross Price", value: "ABC" };
    case "blank_discount":
      return { header: "Item Price Discount", value: "" };
    case "tax_rate_percent":
      return { header: "Tax Rate", value: "5%" };
    case "tax_rate_wrong":
      return { header: "Tax Rate", value: "4" };
    case "blank_exchange_rate":
      return { header: "Currency Exchange Rate", value: "" };
    default:
      return null;
  }
}

type BaseCacheEntry = { filePath: string; invoiceNumber: string };

function profileKey(tc: FormulaMatrixCase, mutation: FormulaMutationKind): string {
  const pm = normKey(tc.field).includes("profit margin") ? "pm" : "std";
  const lines = isMultiItem(tc) ? "multi" : "single";
  const cur = isForeignCurrency(tc) ? "fx" : "omr";
  const tax = normKey(tc.taxCategory) || "n/a";
  if (INPUT_MUTATIONS.has(mutation)) {
    return `input|${mutation}|${lines}|${cur}|${tax}|${pm}|${tc.id}`;
  }
  // Shared calculated baseline (positive / mismatch / tolerance / forced VAT).
  return `calc|${lines}|${cur}|${tax}|${pm}`;
}

function resolvePatchValue(
  tc: FormulaMatrixCase,
  mutation: FormulaMutationKind,
  excelHeader: string
): string {
  if (mutation === "forced_nonzero_vat") return "1";

  let baseCorrect: number | null = null;
  if (isMultiItem(tc)) {
    baseCorrect = multiItemWorkedCorrect(tc, excelHeader);
  } else {
    const mode = isForeignCurrency(tc) ? "foreign" : "omr";
    const payload = buildFormulaExcelPayload(baseFormulaRow(tc), mode);
    if (mutation === "blank_exchange_rate") {
      payload.invoiceCurrencyCode = FOREIGN_CURRENCY_CODE;
      payload.currencyRate = null;
    }
    const calc = calculateInvoiceValuesForGeneratorPayload(payload);
    baseCorrect = pickCorrectCalculated(excelHeader, calc);
  }

  if (mutation === "positive_keep" || mutation === "valid_inputs") {
    // Idempotent patch so batch_clone always has a field/value.
    return baseCorrect === null ? "0" : String(baseCorrect);
  }

  if (baseCorrect === null) baseCorrect = 0;
  let delta = MISMATCH_DELTA;
  if (mutation === "within_tolerance") delta = toleranceForField(excelHeader);
  if (mutation === "outside_tolerance") {
    const tol = toleranceForField(excelHeader);
    delta = tol + tol;
  }
  return String(applyToleranceDelta(baseCorrect, delta));
}

function multiItemWorkedCorrect(
  tc: FormulaMatrixCase,
  excelHeader: string
): number | null {
  const key = normKey(excelHeader);
  // Line 1 of README worked example (Standard rate).
  const line1: Record<string, number> = {
    "item net price": 900,
    "invoice line net amount": 900,
    "line item vat amount": 45,
    "total amount including vat": 945,
  };
  const doc: Record<string, number> = {
    "sum of invoice line net amount": 1900,
    "invoice total amount without tax": 1900,
    "invoice total tax amount": 95,
    "invoice total amount with tax": 1995,
    "amount due for payment": 1995,
  };
  if (/standard\s*\+\s*zero/i.test(tc.taxCategory)) {
    doc["invoice total tax amount"] = 45;
    doc["invoice total amount with tax"] = 1945;
    doc["amount due for payment"] = 1945;
  }
  if (/zero rated|exempt|not subject|outside scope/i.test(tc.taxCategory) &&
      !/standard\s*\+\s*zero/i.test(tc.taxCategory)) {
    line1["line item vat amount"] = 0;
    line1["total amount including vat"] = 900;
    doc["invoice total tax amount"] = 0;
    doc["invoice total amount with tax"] = 1900;
    doc["amount due for payment"] = 1900;
  }
  if (isForeignCurrency(tc) && key.includes("tax accounting currency")) {
    const tax = doc["invoice total tax amount"] ?? 95;
    return Number((tax * DEFAULT_FOREIGN_EXCHANGE_RATE).toFixed(2));
  }
  return line1[key] ?? doc[key] ?? null;
}

async function createFormulaBase(
  tc: FormulaMatrixCase,
  mutation: FormulaMutationKind
): Promise<BaseCacheEntry> {
  // Input mutations bake into the generator payload; calculated mutations use a clean baseline.
  const baseMutation = INPUT_MUTATIONS.has(mutation) ? mutation : "positive_keep";
  const generated = isMultiItem(tc)
    ? await generateMultiItemWorkbook(tc, "positive_keep")
    : await generateSingleLineWorkbook(tc, baseMutation);
  return {
    filePath: generated.filePath,
    invoiceNumber: generated.invoiceNumber,
  };
}

export async function generateFormulaValidationExcelPack(options: {
  matrixPath?: string;
  packRoot?: string;
  section?: string;
  ids?: string[];
  ruleId?: string;
  /** When true (default), skip cases whose TC-*.xlsx already exists under packRoot. */
  skipExisting?: boolean;
}): Promise<FormulaGeneratePackResult[]> {
  const all = loadFormulaValidationMatrix(options.matrixPath);
  let selected = all;
  if (options.section) {
    const want = normKey(options.section);
    selected = selected.filter((c) => normKey(c.section) === want);
  }
  if (options.ruleId) {
    const want = options.ruleId.trim().toUpperCase();
    selected = selected.filter((c) => c.ruleId.toUpperCase().includes(want));
  }
  if (options.ids?.length) {
    const idSet = new Set(options.ids.map((x) => x.trim().toUpperCase()));
    selected = selected.filter((c) => idSet.has(c.id.toUpperCase()));
  }

  const packRoot = options.packRoot ?? PACK_ROOT;
  const skipExisting = options.skipExisting !== false;
  fs.mkdirSync(packRoot, { recursive: true });
  const results: FormulaGeneratePackResult[] = [];
  const progress = createPackProgressReporter(
    selected.length,
    "formula-validation-pack"
  );

  console.log(
    `[formula-validation-pack] starting ${selected.length} matrix cases → ${packRoot}`
  );

  type Prepared = {
    tc: FormulaMatrixCase;
    polarity: FormulaGeneratePackResult["polarity"];
    mutation: FormulaMutationKind;
    excelHeader: string;
    patchValue: string;
    profile: string;
  };

  const prepared: Prepared[] = [];
  for (const tc of selected) {
    const polarity = polarityOf(tc);
    const mutation = classifyFormulaMutation(tc);

    if (mutation === "gap" || polarity === "gap") {
      results.push({
        id: tc.id,
        section: tc.section,
        field: tc.field,
        title: tc.title,
        ruleId: tc.ruleId,
        polarity: "gap",
        mutation: "gap",
        status: "skipped",
        reason: "documented gap / not Excel-testable",
      });
      progress.tick();
      continue;
    }

    if (/ibt-116|allowance = base/i.test(tc.field)) {
      results.push({
        id: tc.id,
        section: tc.section,
        field: tc.field,
        title: tc.title,
        ruleId: tc.ruleId,
        polarity,
        mutation,
        status: "skipped",
        reason: "unmapped / not Excel-testable field",
      });
      progress.tick();
      continue;
    }

    const excelHeader =
      resolveExcelHeader(tc.field) ||
      (mutation === "forced_nonzero_vat" ? "Line Item VAT Amount" : "");
    if (!excelHeader && !INPUT_MUTATIONS.has(mutation)) {
      results.push({
        id: tc.id,
        section: tc.section,
        field: tc.field,
        title: tc.title,
        ruleId: tc.ruleId,
        polarity,
        mutation,
        status: "skipped",
        reason: "unmapped Excel header",
      });
      progress.tick();
      continue;
    }

    try {
      const destPath = path.join(caseOutputDir(packRoot, tc), `${tc.id}.xlsx`);
      if (skipExisting && packOutputAlreadyExists(destPath)) {
        results.push({
          id: tc.id,
          section: tc.section,
          field: tc.field,
          title: tc.title,
          ruleId: tc.ruleId,
          polarity,
          mutation,
          status: "skipped",
          reason: "already exists",
          destPath,
        });
        progress.tick();
        continue;
      }
      const headerForPatch =
        excelHeader ||
        resolveExcelHeader("Item Net Price") ||
        "Item Net Price";
      const inputPatch = INPUT_MUTATIONS.has(mutation)
        ? inputMutationPatch(mutation)
        : null;
      const patchValue = inputPatch
        ? inputPatch.value
        : resolvePatchValue(tc, mutation, headerForPatch);
      prepared.push({
        tc,
        polarity,
        mutation,
        excelHeader: inputPatch?.header ?? headerForPatch,
        patchValue,
        profile: profileKey(tc, mutation),
      });
    } catch (err) {
      results.push({
        id: tc.id,
        section: tc.section,
        field: tc.field,
        title: tc.title,
        ruleId: tc.ruleId,
        polarity,
        mutation,
        status: "error",
        reason: err instanceof Error ? err.message : String(err),
      });
      progress.tick();
    }
  }

  const byProfile = new Map<string, Prepared[]>();
  for (const p of prepared) {
    const list = byProfile.get(p.profile) ?? [];
    list.push(p);
    byProfile.set(p.profile, list);
  }

  console.log(
    `[formula-validation-pack] ${prepared.length} to generate, ${results.filter((r) => r.reason === "already exists").length} already exist, ${byProfile.size} profiles`
  );

  const batchScript = path.join(process.cwd(), "utils", "excel", "batch_clone_patch_invoice.py");
  const tmpDir = path.join(packRoot, "_tmp");
  fs.mkdirSync(tmpDir, { recursive: true });
  const baseCache = new Map<string, BaseCacheEntry>();

  let profileIndex = 0;
  for (const [profile, group] of byProfile) {
    profileIndex += 1;
    console.log(
      `[formula-validation-pack] profile ${profileIndex}/${byProfile.size} (${group.length} files) ${profile}`
    );
    const sample = group[0];
    let base: BaseCacheEntry;
    try {
      const cached = baseCache.get(profile);
      if (cached && fs.existsSync(cached.filePath)) {
        base = cached;
      } else {
        base = await createFormulaBase(sample.tc, sample.mutation);
        baseCache.set(profile, base);
      }
    } catch (err) {
      for (const p of group) {
        results.push({
          id: p.tc.id,
          section: p.tc.section,
          field: p.tc.field,
          title: p.tc.title,
          ruleId: p.tc.ruleId,
          polarity: p.polarity,
          mutation: p.mutation,
          status: "error",
          reason: err instanceof Error ? err.message : String(err),
          excelHeader: p.excelHeader,
        });
        progress.tick();
      }
      continue;
    }

    const jobs = group.map((p) => {
      const folder = caseOutputDir(packRoot, p.tc);
      fs.mkdirSync(folder, { recursive: true });
      return {
        destPath: path.join(folder, `${p.tc.id}.xlsx`),
        field: p.excelHeader,
        value: p.patchValue,
        meta: p,
      };
    });

    const jobsFile = path.join(tmpDir, `jobs-${profileIndex}-0.json`);
    fs.writeFileSync(
      jobsFile,
      JSON.stringify({
        basePath: base.filePath,
        sheetName: "E Invoice",
        headerRow: 4,
        dataRow: 6,
        jobs: jobs.map(({ destPath, field, value }) => ({
          destPath,
          field,
          value,
        })),
      }),
      "utf8"
    );

    try {
      const stdout = runPythonForStdoutLong(batchScript, [jobsFile], 1_800_000);
      const parsedOut = JSON.parse(stdout.trim()) as {
        ok?: boolean;
        written?: number;
        errors?: Array<{ destPath: string; error: string }>;
      };
      const errByDest = new Map(
        (parsedOut.errors ?? []).map((e) => [
          path.normalize(e.destPath),
          e.error,
        ])
      );
      for (const job of jobs) {
        const err = errByDest.get(path.normalize(job.destPath));
        if (err) {
          results.push({
            id: job.meta.tc.id,
            section: job.meta.tc.section,
            field: job.meta.tc.field,
            title: job.meta.tc.title,
            ruleId: job.meta.tc.ruleId,
            polarity: job.meta.polarity,
            mutation: job.meta.mutation,
            status: "error",
            reason: err,
            excelHeader: job.meta.excelHeader,
            mutatedValue: job.meta.patchValue,
          });
        } else {
          try {
            if (INPUT_MUTATIONS.has(job.meta.mutation)) {
              applyInvoiceCalculationsToFile(job.destPath);
            }
          } catch (calcErr) {
            results.push({
              id: job.meta.tc.id,
              section: job.meta.tc.section,
              field: job.meta.tc.field,
              title: job.meta.tc.title,
              ruleId: job.meta.tc.ruleId,
              polarity: job.meta.polarity,
              mutation: job.meta.mutation,
              status: "error",
              reason:
                calcErr instanceof Error ? calcErr.message : String(calcErr),
              excelHeader: job.meta.excelHeader,
              mutatedValue: job.meta.patchValue,
            });
            progress.tick();
            continue;
          }
          results.push({
            id: job.meta.tc.id,
            section: job.meta.tc.section,
            field: job.meta.tc.field,
            title: job.meta.tc.title,
            ruleId: job.meta.tc.ruleId,
            polarity: job.meta.polarity,
            mutation: job.meta.mutation,
            status: "ok",
            destPath: job.destPath,
            invoiceNumber: base.invoiceNumber,
            excelHeader: job.meta.excelHeader,
            mutatedValue: job.meta.patchValue,
          });
        }
        progress.tick();
      }
    } catch (err) {
      for (const p of group) {
        results.push({
          id: p.tc.id,
          section: p.tc.section,
          field: p.tc.field,
          title: p.tc.title,
          ruleId: p.tc.ruleId,
          polarity: p.polarity,
          mutation: p.mutation,
          status: "error",
          reason: err instanceof Error ? err.message : String(err),
          excelHeader: p.excelHeader,
        });
        progress.tick();
      }
    }
  }

  progress.forceComplete();
  return results;
}

export function writeFormulaPackReadme(
  results: FormulaGeneratePackResult[],
  packRoot = PACK_ROOT
): string {
  const byField = new Map<string, FormulaGeneratePackResult[]>();
  for (const r of results) {
    const key = r.field || "(unknown field)";
    const list = byField.get(key) ?? [];
    list.push(r);
    byField.set(key, list);
  }

  const lines: string[] = [
    "# Oman Formula Validation — Generated Excel TestData",
    "",
    "Generated from `EINV_OMAN_FormulaValidation_FullMatrix.xlsx`.",
    "Each file is an Oman invoice with formula inputs set from the matrix (Tax Category / Currency / Lines),",
    "then optionally a calculated-field or input mutation for negative / tolerance cases.",
    "",
    "## Seller / Buyer identity",
    "",
    "- Seller / Buyer electronic address Scheme: `Oman Value Added Tax Identification Number (VATIN)`",
    "- Seller VAT Identifier (TRN / TIN): `OM1108202600`",
    "- Seller electronic address: `om1108202600`",
    "- Buyer VAT identifier: `OM1000091919`",
    "- Buyer electronic address: `om-receiver-dev`",
    "",
    "## Folder layout",
    "",
    "```",
    "TestData/<FIELD_NAME>/",
    "  positive/             # Polarity=positive (TC-*.xlsx)",
    "  negative/             # Polarity=negative (TC-*.xlsx)",
    "```",
    "",
    "Folder name = matrix **Field name** (spaces → `_`, uppercased), e.g. `ITEM_NET_PRICE`.",
    "Gap rows are skipped (listed under Skips).",
    "",
    "## Regenerate",
    "",
    "```bash",
    'npx tsx scripts/generate_formula_validation_oman_excels.ts --section "ITEM PRICE"',
    "npx tsx scripts/generate_formula_validation_oman_excels.ts --all",
    "```",
    "",
    "## Summary",
    "",
    `| Status | Count |`,
    `|---|---:|`,
    `| ok | ${results.filter((r) => r.status === "ok").length} |`,
    `| skipped | ${results.filter((r) => r.status === "skipped").length} |`,
    `| error | ${results.filter((r) => r.status === "error").length} |`,
    "",
  ];

  for (const [field, list] of [...byField.entries()].sort((a, b) =>
    a[0].localeCompare(b[0])
  )) {
    lines.push(`## ${field}`, "");
    lines.push(`| Test Case ID | RuleId | Section | Mutation | Status | File |`);
    lines.push(`|---|---|---|---|---|---|`);
    for (const r of list.sort((a, b) =>
      a.id.localeCompare(b.id, undefined, { numeric: true })
    )) {
      const rel = r.destPath
        ? path.relative(packRoot, r.destPath).replace(/\\/g, "/")
        : r.reason ?? "";
      lines.push(
        `| ${r.id} | ${r.ruleId || "-"} | ${r.section} | ${r.mutation} | ${r.status} | ${rel} |`
      );
    }
    lines.push("");
  }

  const skipped = results.filter((r) => r.status !== "ok");
  if (skipped.length) {
    lines.push("## Skips / errors", "");
    for (const r of skipped) {
      lines.push(`- ${r.id}: ${r.status} — ${r.reason ?? r.mutation}`);
    }
    lines.push("");
  }

  const readmePath = path.join(packRoot, "README.md");
  fs.mkdirSync(packRoot, { recursive: true });
  fs.writeFileSync(readmePath, lines.join("\n"), "utf8");
  return readmePath;
}

/** Kept for parity with field/conditional helpers (unused in per-case path). */
export function runPythonForStdoutLong(
  script: string,
  args: string[],
  timeoutMs: number
): string {
  const cmd = process.platform === "win32" ? "python" : "python3";
  const quoted = [script, ...args].map((a) => `"${a}"`).join(" ");
  try {
    return execSync(`${cmd} ${quoted}`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: timeoutMs,
      windowsHide: true,
    });
  } catch (error: unknown) {
    const stderr =
      error && typeof error === "object" && "stderr" in error
        ? String((error as { stderr?: string }).stderr || "")
        : String(error);
    throw new Error(stderr.trim() || "Python execution failed");
  }
}
