/**
 * **Two Excel generation pipelines** (keep separate; do not route formula payloads through submit, or vice versa):
 *
 * 1. **`generateInvoiceExcel`** — Formula / min–max style tests only. CamelCase generator payload → thin column set +
 *    calculated totals; **`Helpers/formulaValidationHelper`** is the only caller. Uses `clearRow: false` + template clone.
 *
 * 2. **`generateInvoiceFromSubmitData`** — Full Covoro row (Excel header keys) for real upload shape. Used by
 *    **`runSubmitInvoiceCase` / SubmitInvoice specs** and **`ConditionalValidation_*`** after row builders run.
 *    Clears data row first, then applies submit-time rules here (e.g. payment block for credit note / deemed supply,
 *    VAT reverse-charge document clears, forced calculated totals). IBT-003 / credit-note / profit-margin *scenario*
 *    shaping stays in **`Helpers/conditionalValidationHelper`** (not in this file).
 *
 * VAT reverse-charge document columns cleared on every submit-shaped write are defined in
 * `ConditionalValidation.ts` (`DOCUMENT_LEVEL_FIELDS_CLEARED_FOR_VAT_REVERSE_CHARGE`).
 */
import fs from "fs";
import path from "path";
import {
  DOCUMENT_LEVEL_FIELDS_CLEARED_FOR_VAT_REVERSE_CHARGE,
  INVOICE_TYPE_CODE_INVOICE_OUT_OF_SCOPE_OF_TAX,
  PAYMENT_MEANS_TYPE_CODE_INVOICE_OUT_OF_SCOPE_OF_TAX,
} from "../testData/FieldValidations/ConditionalValidation";
import { INVOICE_EXCEL_FIELD_TO_HEADER } from "../testData/FieldValidations/submitInvoiceExcelHeaderMap";
import { applyCounterpartyElectronicAddressOverrides } from "./envPartyIdentity";
import { runPythonForStatus, runPythonForStdout } from "./pythonRunner";

const DEFAULT_TEMPLATE_RELATIVE = path.join("testData", "uploads", "template.xlsx");
const GENERATED_INVOICE_EXCEL_RELATIVE = path.join("testData", "generated", "excel");
const UPLOADS_RESERVED_TEMPLATE_BASENAMES = ["template.xlsx"] as const;

const SHEET_NAME = "E Invoice";
const HEADER_ROW = 4;
/** Template data row (Excel row 6). Submit-generated files always clear this row before writing test data. */
export const INVOICE_TEMPLATE_DATA_ROW = 6;
const DATA_ROW = INVOICE_TEMPLATE_DATA_ROW;
// Master dropdown batch files: row count must cover the longest shared list (e.g. country ≈251) so one workbook can hold a full sweep without splitting.
const BATCH_SIZE = 275;

export const generatedFiles: string[] = [];

let submitInvoiceNumberSeq = 0;

/** Parallel-safe numeric invoice # (`INV-{timestamp}{worker}{seq}`; max 64 chars). */
export function buildUniqueSubmitInvoiceNumber(): string {
  submitInvoiceNumberSeq += 1;
  const worker = Number(
    process.env.TEST_PARALLEL_INDEX?.trim() ||
      process.env.UAE_EINVOICE_WORKER_INDEX?.trim() ||
      "0"
  );
  const suffix = `${Math.max(0, worker)}${String(submitInvoiceNumberSeq).padStart(3, "0")}`;
  const raw = `INV-${Date.now()}${suffix}`;
  return raw.length <= 64 ? raw : raw.slice(0, 64);
}

type CommentPayload = {
  field: string;
  row: number;
  comment: string;
  cell_value?: string;
};

export type ErrorFieldExcelDetails = {
  comment: string;
  cellValue: string;
};

// Resolve bundled Covoro/OMN template path and per-worker generated Excel directories (pw-<n>).
export function getInvoiceTemplatePath(): string {
  const raw = process.env.INVOICE_TEMPLATE_PATH?.trim();
  if (!raw) {
    return path.join(process.cwd(), DEFAULT_TEMPLATE_RELATIVE);
  }
  return path.isAbsolute(raw) ? raw : path.join(process.cwd(), raw);
}

/**
 * When Playwright runs multiple workers, each shares `testData/generated/excel` unless isolated.
 * `beforeEach` calls `deleteGeneratedExcelFiles()` — without per-worker dirs, worker A deletes worker B's fresh file → ENOENT on upload.
 */
function parallelGeneratedExcelSubdir(): string | null {
  const raw = process.env.TEST_PARALLEL_INDEX?.trim();
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return `pw-${Math.floor(n)}`;
}

export function getGeneratedInvoiceExcelDir(): string {
  const override = process.env.INVOICE_EXCEL_OUTPUT_DIR?.trim();
  const base = !override
    ? path.join(process.cwd(), GENERATED_INVOICE_EXCEL_RELATIVE)
    : path.isAbsolute(override)
      ? override
      : path.join(process.cwd(), override);
  const sub = parallelGeneratedExcelSubdir();
  return sub ? path.join(base, sub) : base;
}

export function getInvoiceTemplateReservedBasenames(): Set<string> {
  const reserved = new Set<string>(UPLOADS_RESERVED_TEMPLATE_BASENAMES);
  reserved.add(path.basename(getInvoiceTemplatePath()));
  return reserved;
}

// Cache row-4 "E Invoice" headers per template path and normalize labels for stable column matching.
const TEMPLATE_HEADER_ROW = 4;
let cachedTemplatePath: string | null = null;
let cachedTemplateHeaders: string[] | null = null;

function parseHeadersJson(stdout: string): string[] {
  const parsed = JSON.parse(stdout.trim()) as { headers?: unknown };
  if (!parsed || !Array.isArray(parsed.headers)) {
    throw new Error(`Invalid read_e_invoice_headers output: ${stdout.slice(0, 500)}`);
  }
  return parsed.headers.map((h) => String(h ?? ""));
}

async function readEInvoiceSheetHeaders(absolutePath: string): Promise<string[]> {
  return readInvoiceTemplateHeadersSync(absolutePath);
}

/**
 * Row-4 headers on sheet "E Invoice" from a workbook (same source as submit Excel generation).
 * Use this when filtering test rows/configs for a template so lists stay aligned with the actual .xlsx,
 * not only `invoiceColumnMapping.ts`.
 */
export function readInvoiceTemplateHeadersSync(absoluteTemplatePath: string): string[] {
  const scriptPath = path.join(process.cwd(), "utils", "invoice_excel_writer.py");
  const stdout = runPythonForStdout(scriptPath, [
    "read_e_invoice_headers",
    absoluteTemplatePath,
    String(TEMPLATE_HEADER_ROW),
  ]);
  return parseHeadersJson(stdout);
}

/**
 * Key for matching config `field` names and row keys to template column titles.
 * Collapses whitespace only; case is preserved so legacy test keys can still
 * disambiguate duplicate Title Case columns in the Python writer
 * (`Scheme identifier` → buyer/first, `Scheme Identifier` → payment/last).
 */
export function normalizeInvoiceHeader(name: string): string {
  return name.replace(/\s+/g, " ").trim();
}

/** Case-insensitive match key for filtering configs/rows against template headers. */
function invoiceHeaderMatchKey(name: string): string {
  return normalizeInvoiceHeader(name).toLowerCase();
}

export async function getCachedInvoiceTemplateHeaders(): Promise<string[]> {
  const p = getInvoiceTemplatePath();
  if (cachedTemplatePath === p && cachedTemplateHeaders) {
    return cachedTemplateHeaders;
  }
  cachedTemplateHeaders = await readEInvoiceSheetHeaders(p);
  cachedTemplatePath = p;
  return cachedTemplateHeaders;
}

export function clearInvoiceTemplateHeaderCache(): void {
  cachedTemplatePath = null;
  cachedTemplateHeaders = null;
}

export function filterSubmitRowToTemplateHeaders(
  row: Record<string, unknown>,
  templateHeaders: readonly string[]
): Record<string, unknown> {
  const allowed = new Set(templateHeaders.map((h) => invoiceHeaderMatchKey(h)));
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (allowed.has(invoiceHeaderMatchKey(key))) {
      out[key] = value;
    }
  }
  return out;
}

/** Headers set from CLI in `write_row_json`, not from the row JSON payload. */
const SUBMIT_ROW_PYTHON_OWNED_HEADER_NORM = new Set([
  normalizeInvoiceHeader("Invoice Number"),
  normalizeInvoiceHeader("Invoice Issue Date"),
]);

/**
 * One value per sheet header; missing headers → `""`. Skips invoice # / issue date (owned by Python writer).
 * Explicit `null` on a matched key omits that header from the payload so Python does not write the cell
 * (row stays cleared after `clear_row`), instead of writing an empty string via `set_text_value`.
 */
function buildSubmitRowValuesExplicitPerTemplateHeader(
  sparseRow: Record<string, unknown>,
  templateHeaders: readonly string[]
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const templateMatchKeys = buildNormalizedHeaderSet(templateHeaders);
  const owned = new Set(
    [...SUBMIT_ROW_PYTHON_OWNED_HEADER_NORM].map((h) => h.toLowerCase())
  );

  // Preserve sparse key casing so Python can disambiguate duplicate Title Case columns
  // (e.g. buyer `Scheme identifier` → first col, payment `Scheme Identifier` → last).
  for (const [key, value] of Object.entries(sparseRow)) {
    const matchKey = invoiceHeaderMatchKey(key);
    if (!matchKey || owned.has(matchKey) || !templateMatchKeys.has(matchKey)) {
      continue;
    }
    if (value == null) {
      continue;
    }
    out[key] = value;
  }

  const presentMatchKeys = new Set(
    Object.keys(out).map((k) => invoiceHeaderMatchKey(k))
  );
  const filledMissing = new Set<string>();
  for (const header of templateHeaders) {
    const matchKey = invoiceHeaderMatchKey(header);
    if (!matchKey || owned.has(matchKey) || presentMatchKeys.has(matchKey)) {
      continue;
    }
    if (filledMissing.has(matchKey)) {
      continue;
    }
    filledMissing.add(matchKey);
    out[header] = "";
  }
  return out;
}

// Filter test configs / matrix rows to headers that exist on the active template (renames / alternate columns).
/** Set of case-insensitive match keys for template labels (Title Case vs legacy sentence case). */
function buildNormalizedHeaderSet(headerLabels: readonly string[]): Set<string> {
  const s = new Set<string>();
  for (const h of headerLabels) {
    const n = invoiceHeaderMatchKey(h);
    if (n) s.add(n);
  }
  return s;
}

export function filterConfigsByHeaderLabels<T extends { field: string }>(
  configs: T[],
  headerLabels: readonly string[]
): T[] {
  const allowed = buildNormalizedHeaderSet(headerLabels);
  return configs.filter((c) => allowed.has(invoiceHeaderMatchKey(c.field)));
}

export function filterNegativeFormulaRowsByErrorField<
  T extends { errorField?: string },
>(rows: T[], headerLabels: readonly string[]): T[] {
  const allowed = buildNormalizedHeaderSet(headerLabels);
  return rows.filter(
    (r) => Boolean(r.errorField) && allowed.has(invoiceHeaderMatchKey(String(r.errorField)))
  );
}

/** Narrow rows to columns present on the template; drop empty rows; dedupe by stable JSON of the narrowed row. */
export function filterSubmitInvoiceRowsByTemplateHeaders(
  rows: ReadonlyArray<Record<string, string>>,
  headerLabels: readonly string[]
): Record<string, string>[] {
  const allowed = buildNormalizedHeaderSet(headerLabels);

  const seen = new Set<string>();
  const result: Record<string, string>[] = [];

  for (const row of rows) {
    const narrowed: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      if (!allowed.has(invoiceHeaderMatchKey(key))) continue;
      narrowed[key] = value;
    }
    if (Object.keys(narrowed).length === 0) continue;

    const stable = Object.keys(narrowed)
      .sort((a, b) => a.localeCompare(b))
      .reduce<Record<string, string>>((acc, k) => {
        acc[k] = narrowed[k];
        return acc;
      }, {});
    const signature = JSON.stringify(stable);
    if (seen.has(signature)) continue;
    seen.add(signature);
    result.push(narrowed);
  }

  return result;
}

export function hasHeaderLabel(
  headerLabels: readonly string[],
  fieldName: string
): boolean {
  return buildNormalizedHeaderSet(headerLabels).has(invoiceHeaderMatchKey(fieldName));
}

/** Whether the workbook has every column `generateInvoiceExcel` fills (skip formula positives on thin templates). */
export function templateSupportsGenerateInvoiceExcel(headerLabels: readonly string[]): boolean {
  const allowed = buildNormalizedHeaderSet(headerLabels);
  for (const excelHeader of Object.values(INVOICE_EXCEL_FIELD_TO_HEADER)) {
    if (!excelHeader) continue;
    if (!allowed.has(invoiceHeaderMatchKey(excelHeader))) {
      return false;
    }
  }
  return true;
}

// Read server error workbook: cell value + comment for a field (field-validation vs edit-dialog alignment).
export async function getErrorFieldExcelDetails(
  errorFilePath: string,
  fieldName: string,
  row = 6
): Promise<ErrorFieldExcelDetails> {
  const scriptPath = path.join(process.cwd(), "utils", "error_excel_reader.py");
  if (!fs.existsSync(scriptPath)) {
    throw new Error(`Comment reader script not found at: ${scriptPath}`);
  }
  const output = runPythonForStdout(scriptPath, [
    "comment",
    errorFilePath,
    fieldName,
    String(row),
  ]).trim();

  let parsed: CommentPayload;
  try {
    parsed = JSON.parse(output) as CommentPayload;
  } catch {
    throw new Error(`Invalid JSON from error_excel_reader.py: ${output}`);
  }
  if (!parsed.comment || !parsed.comment.trim()) {
    throw new Error(
      `No Excel cell comment for field '${fieldName}' in row ${row} (field not listed in Errors column or Errors empty).`
    );
  }
  return {
    comment: parsed.comment,
    cellValue: parsed.cell_value ?? "",
  };
}

type ErrorWorkbookFieldComment = {
  field: string;
  comment?: string;
  cell_value?: string;
};

type ErrorWorkbookCommentsPayload = {
  errors_column?: string;
  fields?: ErrorWorkbookFieldComment[];
};

/** Print every Errors-column field comment from a downloaded error workbook (comma-separated fields each get a line). */
export function printErrorWorkbookMessages(
  errorFilePath: string,
  row: number = INVOICE_TEMPLATE_DATA_ROW
): void {
  const scriptPath = path.join(process.cwd(), "utils", "error_excel_reader.py");
  const lines: string[] = [];
  try {
    const output = runPythonForStdout(scriptPath, [
      "list_comments",
      errorFilePath,
      String(row),
    ]).trim();
    const parsed = JSON.parse(output) as ErrorWorkbookCommentsPayload;
    const fields = parsed.fields ?? [];
    if (fields.length === 0) {
      lines.push(
        `[ErrorValidation] Errors column: ${parsed.errors_column?.trim() || "(empty)"}`
      );
    } else {
      for (const item of fields) {
        const message = item.comment?.trim() || "(no cell comment)";
        lines.push(`[ErrorValidation] ${item.field}: ${message}`);
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    lines.push(`[ErrorValidation] Could not print error-file comments: ${message}`);
  }
  for (const line of lines) {
    console.log(line);
  }
}

/** Oman home / tax-accounting currency for formula + submit totals. */
export const OMAN_HOME_CURRENCY = "OMR";

/** Covoro / PINT-OM labels that require BTOM-020 (IBR-082-OM). */
const PROFIT_MARGIN_TRANSACTION_TYPE_LABELS = new Set([
  "profit margin invoice",
  "profit margin self-invoice",
]);

/**
 * IBR-082-OM: Total Amount Due (Profit Margin) applies only for Profit Margin Invoice
 * or Profit Margin Self-Invoice (BTOM-001).
 */
export function isProfitMarginTransactionType(value: unknown): boolean {
  const normalized = String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  return PROFIT_MARGIN_TRANSACTION_TYPE_LABELS.has(normalized);
}

/**
 * Line-item and document totals: intermediate math at **6 dp**, written amounts **ceil to 2 dp**.
 * Must stay aligned with Python `apply_invoice_calculations_to_data_row` in `invoice_excel_writer.py`.
 * Pass an effective `taxRate` (0 for non–Standard rate categories; see submit helpers / formula path resolvers).
 * Non-OMR: sets invoice total tax in tax accounting currency via `currencyRate`; omits it when currency is OMR.
 */
export function calculateInvoiceValues(data: any) {
  /** Stabilise intermediate values to 6 decimal places (matches exchange-rate / quantity precision). */
  const fix6 = (num: number) => Number(num.toFixed(6));
  /** Monetary outputs: round **up** to 2 decimal places (half-cent and above goes up). */
  const ceil2 = (num: number) => {
    if (!Number.isFinite(num)) return 0;
    return Math.ceil(num * 100 - 1e-12) / 100;
  };

  const itemPriceBaseQty = Number(data.itemPriceBaseQty ?? 1);
  const itemGrossPrice = Number(data.itemGrossPrice ?? 0);
  const itemPriceDiscount = Number(data.itemPriceDiscount ?? 0);
  const invoicedQty = Number(data.invoicedQty ?? 0);
  const lineCharge = Number(data.lineCharge ?? 0);
  const lineAllowance = Number(data.lineAllowance ?? 0);
  const taxRate = Number(data.taxRate ?? 0);
  const docCharges = Number(data.docCharges ?? 0);
  const docAllowances = Number(data.docAllowances ?? 0);
  const paidAmount = Number(data.paidAmount ?? 0);
  const roundingAmount = Number(data.roundingAmount ?? 0);
  const currencyCode = data.invoiceCurrencyCode ?? OMAN_HOME_CURRENCY;
  const currencyRate = Number(data.currencyRate) > 0 ? Number(data.currencyRate) : 1;

  const rawItemNet = fix6(itemGrossPrice - itemPriceDiscount);
  const rawLineNet = fix6(
    itemPriceBaseQty > 0
      ? (rawItemNet * invoicedQty) / itemPriceBaseQty + lineCharge - lineAllowance
      : lineCharge - lineAllowance
  );
  const rawVatBase = fix6(rawLineNet * (taxRate / 100));
  const docChargeTax = fix6(docCharges * (taxRate / 100));
  const docAllowanceTax = fix6(docAllowances * (taxRate / 100));
  const rawInvoiceTotalTax = fix6(rawVatBase + docChargeTax - docAllowanceTax);

  const isExemptLine = isExemptFromTaxTaxCategory(data.taxCategory);
  const rawLinePlusVat = fix6(rawLineNet + rawVatBase);

  const itemNetPrice = ceil2(rawItemNet);
  const invoiceLineNetAmount = ceil2(rawLineNet);
  /** Line Item VAT Amount (BTOM-016) in invoice currency. */
  const lineItemVatAmount = isExemptLine ? null : ceil2(rawVatBase);
  /** Total Amount Including VAT (BTOM-017) = line net + line VAT. */
  const totalAmountIncludingVat = ceil2(rawLinePlusVat);
  const sumInvoiceLineNetAmount = ceil2(rawLineNet);

  const rawTotalWithoutTax = fix6(rawLineNet + docCharges - docAllowances);
  const invoiceTotalWithoutTax = ceil2(rawTotalWithoutTax);
  const invoiceTotalTax = ceil2(rawInvoiceTotalTax);
  const invoiceTotalTaxAccountingCurrency =
    currencyCode === OMAN_HOME_CURRENCY
      ? null
      : ceil2(fix6(rawInvoiceTotalTax * currencyRate));
  const rawTotalWithTax = fix6(rawTotalWithoutTax + rawInvoiceTotalTax);
  const invoiceTotalWithTax = ceil2(rawTotalWithTax);
  const amountDue = ceil2(fix6(rawTotalWithTax - paidAmount + roundingAmount));
  /**
   * IBR-082-OM: fill only for Profit Margin Invoice / Profit Margin Self-Invoice.
   * When applicable, value = Σ Total Amount Including VAT (single-line = that line).
   */
  const totalAmountDueProfitMargin = isProfitMarginTransactionType(
    data.invoiceTransactionTypeCode
  )
    ? totalAmountIncludingVat
    : null;

  return {
    itemNetPrice,
    invoiceLineNetAmount,
    /** Line VAT in invoice currency (BTOM-016). */
    lineItemVatAmount,
    vatLineAmount: lineItemVatAmount,
    /** Line total including VAT in invoice currency (BTOM-017). */
    totalAmountIncludingVat,
    invoiceLineAmount: totalAmountIncludingVat,
    sumInvoiceLineNetAmount,
    invoiceTotalWithoutTax,
    invoiceTotalTax,
    invoiceTotalTaxAccountingCurrency,
    invoiceTotalWithTax,
    amountDue,
    totalAmountDueProfitMargin,
  };
}

/**
 * Same effective tax resolution and totals as `generateInvoiceExcel` (camelCase generator payload).
 */
export function calculateInvoiceValuesForGeneratorPayload(
  data: Record<string, unknown>
) {
  const toNumber = (value: unknown, fallback = 0): number => {
    if (value === null || value === undefined || String(value).trim() === "") {
      return fallback;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  const effectiveTaxRate = resolveEffectiveTaxRate(
    data.taxCategory,
    data.taxRate,
    toNumber
  );
  return calculateInvoiceValues({
    ...data,
    taxCategory: data.taxCategory,
    taxRate: effectiveTaxRate,
  });
}

/**
 * Overwrite one cell on an existing generated workbook (e.g. break a calculated total). Saves in place.
 * `exactHeaderTitle` must match row-4 header text on the template (e.g. `Invoice total amount with tax`).
 */
export function patchInvoiceDataCellInFile(
  filePath: string,
  exactHeaderTitle: string,
  value: number,
  dataRow = INVOICE_TEMPLATE_DATA_ROW
): void {
  const scriptPath = path.join(process.cwd(), "utils", "invoice_excel_writer.py");
  if (!fs.existsSync(scriptPath)) {
    throw new Error(`Python writer script not found at: ${scriptPath}`);
  }
  const stdout = runPythonForStdout(scriptPath, [
    "patch_invoice_cell",
    filePath,
    SHEET_NAME,
    String(HEADER_ROW),
    String(dataRow),
    exactHeaderTitle,
    String(value),
  ]);
  let parsed: { ok?: boolean };
  try {
    parsed = JSON.parse(stdout.trim()) as { ok?: boolean };
  } catch {
    throw new Error(`Invalid patch_invoice_cell output: ${stdout}`);
  }
  if (!parsed.ok) {
    throw new Error(`patch_invoice_cell failed: ${stdout}`);
  }
}

export function patchInvoiceTextCellInFile(
  filePath: string,
  exactHeaderTitle: string,
  value: string,
  dataRow = INVOICE_TEMPLATE_DATA_ROW,
  timeoutMs = 300_000
): void {
  const scriptPath = path.join(process.cwd(), "utils", "invoice_excel_writer.py");
  if (!fs.existsSync(scriptPath)) {
    throw new Error(`Python writer script not found at: ${scriptPath}`);
  }
  const stdout = runPythonForStdout(scriptPath, [
    "patch_invoice_text_cell",
    filePath,
    SHEET_NAME,
    String(HEADER_ROW),
    String(dataRow),
    exactHeaderTitle,
    value,
  ], timeoutMs);
  let parsed: { ok?: boolean };
  try {
    parsed = JSON.parse(stdout.trim()) as { ok?: boolean };
  } catch {
    throw new Error(`Invalid patch_invoice_text_cell output: ${stdout}`);
  }
  if (!parsed.ok) {
    throw new Error(`patch_invoice_text_cell failed: ${stdout}`);
  }
}

function getTodayDate(): Date {
  const today = new Date();
  // Slightly past dates avoid “future issue date” validation noise; still recent enough for business rules.
  const randomDays =
    Math.floor(Math.random() * 10) + 1;
  today.setDate(today.getDate() - randomDays);
  today.setHours(0,0,0,0);
  return today;
}

function normalizeTaxCategory(value: unknown): string {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** True for Oman `Standard rate` or legacy `Standard rate.` (normalized). Any other category → tax % treated as null/0. */
function isStandardTaxCategory(taxCategory: unknown): boolean {
  const cat = normalizeTaxCategory(taxCategory);
  return cat === "standard rate" || cat === "standard rate.";
}

/** Line **Tax Category** `Exempt from tax` (normalized). */
export function isExemptFromTaxTaxCategory(taxCategory: unknown): boolean {
  return normalizeTaxCategory(taxCategory) === "exempt from tax";
}

const EXEMPT_BLANK_TAX_FIELD_HEADERS = [
  "Tax Rate",
  "Standard Tax Rate",
  "Line Item VAT Amount",
  "Line item VAT amount",
] as const;

/** IBG-30: exempt lines keep tax-rate and VAT-line columns unset (not 0 / not ""). */
export function applyExemptFromTaxBlankTaxFields(
  row: Record<string, unknown>,
  taxCategory: unknown
): void {
  if (!isExemptFromTaxTaxCategory(taxCategory)) {
    return;
  }
  for (const header of EXEMPT_BLANK_TAX_FIELD_HEADERS) {
    if (!(header in row)) {
      continue;
    }
    const raw = row[header];
    if (raw === null || raw === undefined) {
      continue;
    }
    // Clear any stored value (0, 5, "", etc.) so submit write omits the cell.
    row[header] = null;
  }
}

/** Sheet value `VAT Reverse Charge` (normalized). */
function isVatReverseChargeTaxCategory(taxCategory: unknown): boolean {
  return normalizeTaxCategory(taxCategory) === "vat reverse charge";
}

function resolveEffectiveTaxRate(
  taxCategory: unknown,
  rawTaxRate: unknown,
  toNumber: (value: unknown, fallback?: number) => number
): number {
  // Non–Standard rate.: ignore `Tax Rate` / split columns for VAT math (same as null / 0 %).
  if (!isStandardTaxCategory(taxCategory)) {
    return 0;
  }
  return toNumber(rawTaxRate, 0);
}

function resolveEffectiveTaxRateFromSplitTaxColumns(
  rowData: Record<string, any>,
  toNumber: (value: unknown, fallback?: number) => number
): number {
  if (!isStandardTaxCategory(rowData["Tax Category"])) {
    return 0;
  }

  // Full template: first non-empty split-tax column wins; else fall back to Tax Category + Tax Rate.
  const standardTaxRate = rowData["Standard Tax Rate"];
  const standardAdditionalVat = rowData["Standard rate additional VAT"];
  const zeroRatedTaxRate = rowData["Zero rated Tax Rate"];
  const reverseChargeRate = rowData["VAT Reverse Charge Rate"];
  const exemptFromTax = String(rowData["Exempt from tax"] ?? "")
    .trim()
    .toLowerCase();
  const outsideScope = String(
    rowData["Services outside scope of tax / Not subject to tax"] ?? ""
  )
    .trim()
    .toLowerCase();

  if (String(standardTaxRate ?? "").trim() !== "") {
    return toNumber(standardTaxRate, 0);
  }
  if (String(standardAdditionalVat ?? "").trim() !== "") {
    return toNumber(standardAdditionalVat, 0);
  }
  if (String(zeroRatedTaxRate ?? "").trim() !== "") {
    return toNumber(zeroRatedTaxRate, 0);
  }
  if (String(reverseChargeRate ?? "").trim() !== "") {
    return toNumber(reverseChargeRate, 0);
  }
  if (exemptFromTax === "yes" || outsideScope === "yes") {
    return 0;
  }

  // Backward compatibility with legacy Tax Category + Tax Rate payloads.
  const rawTaxRateValue = rowData["Tax Rate"] ?? rowData["Standard Tax Rate"];
  return resolveEffectiveTaxRate(rowData["Tax Category"], rawTaxRateValue, toNumber);
}

function parsePythonWriterResult(stdout: string): { filePath: string; invoiceNumber: string } {
  // Writer commands print one JSON object per invocation (path + invoice id when applicable).
  try {
    return JSON.parse(stdout.trim()) as { filePath: string; invoiceNumber: string };
  } catch {
    throw new Error(`Invalid Python writer output: ${stdout}`);
  }
}

function runPythonTemplateWriter(
  command: "update_field" | "update_number_field" | "update_field_with_invoice",
  fieldName: string,
  value: string
): { filePath: string; invoiceNumber: string } {
  // Clones template, writes one cell (or invoice+field variant), returns new file path + invoice id.
  const scriptPath = path.join(process.cwd(), "utils", "invoice_excel_writer.py");
  if (!fs.existsSync(scriptPath)) {
    throw new Error(`Python writer script not found at: ${scriptPath}`);
  }
  const templatePath = getInvoiceTemplatePath();
  const stdout = runPythonForStdout(scriptPath, [
    command,
    templatePath,
    SHEET_NAME,
    String(HEADER_ROW),
    String(DATA_ROW),
    fieldName,
    value,
  ]);
  return parsePythonWriterResult(stdout);
}

/**
 * Clone template and write data row via Python `write_row_json`.
 * `clearRow`: wipe row 6 before write (submit only). Otherwise merge `rowValues` onto the template row (field/formula tests).
 */
function writeTemplateRowWithPython(input: {
  invoiceNumber: string;
  issueDate: Date;
  issueDateFormat?: string;
  fileName: string;
  rowValues: Record<string, unknown>;
  clearRow?: boolean;
  strictHeaders?: boolean;
}): { filePath: string; invoiceNumber: string } {
  const scriptPath = path.join(process.cwd(), "utils", "invoice_excel_writer.py");
  if (!fs.existsSync(scriptPath)) {
    throw new Error(`Python writer script not found at: ${scriptPath}`);
  }
  const templatePath = getInvoiceTemplatePath();
  // Row object is base64 JSON so we can pass arbitrary Unicode header names via argv safely.
  const stdout = runPythonForStdout(
    scriptPath,
    [
      "write_row_json",
      templatePath,
      SHEET_NAME,
      String(HEADER_ROW),
      String(DATA_ROW),
      input.invoiceNumber,
      input.issueDate.toISOString(),
      input.issueDateFormat ?? "yyyy-mm-dd",
      input.fileName,
      input.clearRow ? "1" : "0",
      Buffer.from(JSON.stringify(input.rowValues), "utf8").toString("base64"),
      input.strictHeaders ? "1" : "0",
    ],
    180_000
  );
  return parsePythonWriterResult(stdout);
}

/** Submit path: clear row 6, strict headers, then write invoice #, dates, and row values from test data + `calculateInvoiceValues`. */
function writeSubmitFlowRowWithPython(input: {
  invoiceNumber: string;
  issueDate: Date;
  issueDateFormat?: string;
  fileName: string;
  rowValues: Record<string, unknown>;
}): { filePath: string; invoiceNumber: string } {
  return writeTemplateRowWithPython({
    invoiceNumber: input.invoiceNumber,
    issueDate: input.issueDate,
    issueDateFormat: input.issueDateFormat,
    fileName: input.fileName,
    rowValues: input.rowValues,
    clearRow: true,
    strictHeaders: true,
  });
}

function writeSubmitFlowRowsWithPython(input: {
  invoiceNumber: string;
  issueDate: Date;
  issueDateFormat?: string;
  fileName: string;
  rows: Array<Record<string, unknown>>;
  /** openpyxl multi-row writes often exceed the default 45s bridge timeout. */
  timeoutMs?: number;
}): { filePath: string; invoiceNumber: string } {
  const scriptPath = path.join(process.cwd(), "utils", "invoice_excel_writer.py");
  if (!fs.existsSync(scriptPath)) {
    throw new Error(`Python writer script not found at: ${scriptPath}`);
  }
  const templatePath = getInvoiceTemplatePath();
  const outDir = getGeneratedInvoiceExcelDir();
  fs.mkdirSync(outDir, { recursive: true });
  const rowsJsonPath = path.join(
    outDir,
    `_submit_multi_rows_${Date.now()}_${Math.random().toString(36).slice(2, 10)}.json`
  );
  fs.writeFileSync(rowsJsonPath, JSON.stringify(input.rows), "utf8");
  let stdout: string;
  // Multi-invoice writes must never fall through to the 45s pythonRunner default.
  const multiWriteTimeoutMs = Math.max(input.timeoutMs ?? 300_000, 300_000);
  try {
    stdout = runPythonForStdout(
      scriptPath,
      [
        "write_rows_json_from_file",
        templatePath,
        SHEET_NAME,
        String(HEADER_ROW),
        String(DATA_ROW),
        input.invoiceNumber,
        input.issueDate.toISOString(),
        input.issueDateFormat ?? "yyyy-mm-dd",
        input.fileName,
        "1", // clearRow: submit flow always clears the template data row(s)
        rowsJsonPath,
        "1", // strictHeaders
      ],
      multiWriteTimeoutMs
    );
  } finally {
    try {
      fs.unlinkSync(rowsJsonPath);
    } catch {}
  }
  return parsePythonWriterResult(stdout);
}

export function applyInvoiceCalculationsToFile(
  filePath: string,
  dataRow = DATA_ROW,
  timeoutMs?: number
): void {
  // Same numeric rules as calculateInvoiceValues; Python writers do not evaluate Excel formulas.
  const scriptPath = path.join(process.cwd(), "utils", "invoice_excel_writer.py");
  if (!fs.existsSync(scriptPath)) {
    throw new Error(`Python writer script not found at: ${scriptPath}`);
  }
  const stdout = runPythonForStdout(
    scriptPath,
    [
      "apply_calculations",
      filePath,
      SHEET_NAME,
      String(HEADER_ROW),
      String(dataRow),
    ],
    timeoutMs
  );
  let parsed: { ok?: boolean };
  try {
    parsed = JSON.parse(stdout.trim()) as { ok?: boolean };
  } catch {
    throw new Error(`Invalid apply_calculations output: ${stdout}`);
  }
  if (!parsed.ok) {
    throw new Error(`apply_calculations failed: ${stdout}`);
  }
}

export async function updateExcelField(
  fieldName: string,
  length: number
): Promise<string> {
  // Builds a string of `length` chars in the given column (field validation min/max tests).
  const { filePath: savedPath } = runPythonTemplateWriter(
    "update_field",
    fieldName,
    String(length)
  );
  applyInvoiceCalculationsToFile(savedPath);
  generatedFiles.push(savedPath);
  return savedPath;
}

export async function validateErrorFileColumn(
  errorFilePath: string,
  expectedField: string
) {
  const pythonScript = path.join(process.cwd(), "utils", "error_excel_reader.py");
  if (!fs.existsSync(pythonScript)) {
    throw new Error(`Error reader script not found at: ${pythonScript}`);
  }

  // Python checks the Errors column lists this field (or equivalent) for the downloaded error file.
  const errorMessage = runPythonForStatus(pythonScript, ["validate", errorFilePath, expectedField]);
  if (errorMessage) {
    throw new Error(
      `Validation failed for field: ${expectedField}. ${errorMessage}`
    );
  }
}

export async function generateInvoiceExcel(
  data: any,
  testFiles?: string[]
): Promise<{ filePath: string; invoiceNumber: string }> {
  const invoiceNumber = buildUniqueSubmitInvoiceNumber();
  const todayDate = getTodayDate();
  // Formula pipeline: camelCase payload → `INVOICE_EXCEL_FIELD_TO_HEADER` → `calculateInvoiceValues` → Python clones template and writes row 6.
  const toNumber = (value: unknown, fallback = 0): number => {
    if (value === null || value === undefined || String(value).trim() === "") {
      return fallback;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  const effectiveTaxRate = resolveEffectiveTaxRate(
    data.taxCategory,
    data.taxRate,
    toNumber
  );
  const calc = calculateInvoiceValues({
    ...data,
    taxCategory: data.taxCategory,
    taxRate: effectiveTaxRate,
  });
  const rowValues: Record<string, unknown> = {};
  // Map logical test keys to exact Excel header text (or passthrough if already a header).
  const setCell = (header: string, value: unknown) => {
    const excelHeader = INVOICE_EXCEL_FIELD_TO_HEADER[header] || header;
    rowValues[excelHeader] = value;
  };

  /**
   * Formula suite uses `clearRow: false` when cloning the template. Python `write_row_json`
   * skips keys whose JSON value is `null`, so the template's existing row 6 values would remain.
   * Map null/undefined → "" so scenarios like "Empty Gross Price" actually blank the cell.
   */
  const formulaInputCell = (v: unknown) =>
    v === null || v === undefined ? "" : v;

  setCell("Invoice Currency Code", formulaInputCell(data.invoiceCurrencyCode));
  setCell("Currency Exchange Rate", formulaInputCell(data.currencyRate));
  if (data.invoiceTransactionTypeCode !== undefined) {
    setCell(
      "Invoice Transaction Type Code",
      formulaInputCell(data.invoiceTransactionTypeCode)
    );
  }
  setCell("Item Price Base Quantity", formulaInputCell(data.itemPriceBaseQty));
  setCell("Item Gross Price", formulaInputCell(data.itemGrossPrice));
  setCell("Item Price Discount", formulaInputCell(data.itemPriceDiscount));
  setCell("Invoiced Quantity", formulaInputCell(data.invoicedQty));
  setCell("Line Charge", formulaInputCell(data.lineCharge));
  setCell("Line Allowance", formulaInputCell(data.lineAllowance));
  setCell("Tax Category", formulaInputCell(data.taxCategory));
  if (isExemptFromTaxTaxCategory(data.taxCategory)) {
    setCell("Tax Rate", null);
  } else {
    setCell("Tax Rate", formulaInputCell(data.taxRate));
  }
  if (data.taxExemptionReasonCode !== undefined) {
    setCell(
      "Tax Exemption Reason Code",
      formulaInputCell(data.taxExemptionReasonCode)
    );
  }
  if (data.taxExemptionReasonText !== undefined) {
    setCell(
      "Tax Exemption Reason Text",
      formulaInputCell(data.taxExemptionReasonText)
    );
  }
  if (data.invoiceTypeCode !== undefined) {
    setCell("Invoice Type Code", formulaInputCell(data.invoiceTypeCode));
  }
  if (data.paymentMeansTypeCode !== undefined) {
    setCell(
      "Payment Means Type Code",
      formulaInputCell(data.paymentMeansTypeCode)
    );
  }
  setCell("Document Charges", formulaInputCell(data.docCharges));
  setCell("Document Allowances", formulaInputCell(data.docAllowances));
  setCell("Paid Amount", formulaInputCell(data.paidAmount));
  setCell("Rounding Amount", formulaInputCell(data.roundingAmount));
  if (data.invoiceLineIdentifier !== undefined) {
    setCell("Invoice line identifier", formulaInputCell(data.invoiceLineIdentifier));
  }
  if (data.itemName !== undefined) {
    setCell("Item name", formulaInputCell(data.itemName));
  }
  if (data.itemDescription !== undefined) {
    setCell("Item description", formulaInputCell(data.itemDescription));
  }
  if (data.itemClassificationIdentifier !== undefined) {
    setCell(
      "Item classification identifier",
      formulaInputCell(data.itemClassificationIdentifier)
    );
  }
  setCell("Item Net Price", calc.itemNetPrice);
  setCell("Invoice Line Net Amount", calc.invoiceLineNetAmount);
  setCell(
    "Line Item VAT Amount",
    isExemptFromTaxTaxCategory(data.taxCategory) ? null : calc.lineItemVatAmount
  );
  setCell("Total Amount Including VAT", calc.totalAmountIncludingVat);
  setCell("Sum Invoice Line Net Amount", calc.sumInvoiceLineNetAmount);
  setCell("Invoice Total Without Tax", calc.invoiceTotalWithoutTax);
  setCell("Invoice Total Tax", calc.invoiceTotalTax);
  if (calc.invoiceTotalTaxAccountingCurrency !== null) {
    setCell(
      "Invoice total tax amount in tax accounting currency",
      calc.invoiceTotalTaxAccountingCurrency
    );
  }
  setCell("Invoice Total With Tax", calc.invoiceTotalWithTax);
  setCell("Amount Due", calc.amountDue);
  // Non-PM: write "" so clearRow:false formula clones blank the template cell (null would skip).
  setCell(
    "Total Amount Due (Profit Margin)",
    calc.totalAmountDueProfitMargin === null ? "" : calc.totalAmountDueProfitMargin
  );

  // Omit columns missing on the active (alternate) template.
  const templateHeaders = await getCachedInvoiceTemplateHeaders();
  const rowValuesForWrite = filterSubmitRowToTemplateHeaders(
    rowValues,
    templateHeaders
  );

  const { filePath } = writeTemplateRowWithPython({
    invoiceNumber,
    issueDate: todayDate,
    fileName: `${invoiceNumber}.xlsx`,
    rowValues: rowValuesForWrite,
    strictHeaders: true,
    clearRow: false,
  });
  // Recompute calculated columns from the saved row (fix6 / ceil2 in Python) for every template,
  // Same rules as `calculateInvoiceValues` in TS; runs after worker TIN patch when enabled.
  applyInvoiceCalculationsToFile(filePath);
  generatedFiles.push(filePath);
  if (testFiles) testFiles.push(filePath);
  return { filePath, invoiceNumber };

}

export function deleteGeneratedExcelFiles(): void {
  const reserved = getInvoiceTemplateReservedBasenames();

  const wipeXlsxExceptReserved = (dir: string) => {
    if (!fs.existsSync(dir)) return;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith(".xlsx")) continue;
      if (reserved.has(file)) continue;
      try {
        fs.unlinkSync(path.join(dir, file));
      } catch {}
    }
  };

  // Primary output: cloned workbooks from Python writer (uploads/ is templates only).
  wipeXlsxExceptReserved(getGeneratedInvoiceExcelDir());

  // Legacy: older runs wrote INV-*.xlsx next to templates.
  const uploadsDir = path.join(process.cwd(), "testData", "uploads");
  wipeXlsxExceptReserved(uploadsDir);
}

export type DropdownGeneratedWorkbook = {
  filePath: string;
  /** First data row invoice # (matches Python `save_result` after dropdown batch). */
  invoiceNumber: string;
};

/**
 * Dropdown batch for RCM clears Item Type; batch for Item Type clears RCM — both via unset cells
 * (not empty strings) so template leftovers do not trigger combination rules. Set a flag to `false`
 * when a negative test must keep the other field populated. Row-based `generateInvoiceFromSubmitData`
 * flows are unaffected.
 *
 * Batching **Type of goods or services subject to RCM** also sets **Tax Category** to `VAT Reverse Charge`
 * and **Tax Rate** to `5` on every generated row (Python writer). Line VAT math still uses 0% unless category
 * is Standard rate. (`effective_tax_rate` in Python / `resolveEffectiveTaxRate` in TS.)
 *
 * Batching **Vat category - charges** / **- allowances** or document **Tax exemption reason - *** sets document
 * charge/allowance amounts and aligns line **Tax Category** (Python writer). Exempt / Not subject batch rows
 * set **Invoice out of scope of tax** so Commercial invoice / Credit note “only exempt/not subject lines” rule passes.
 */
export type GenerateDropdownMasterExcelOptions = {
  clearItemTypeWhenRcmField?: boolean;
  clearRcmWhenItemTypeField?: boolean;
  /**
   * When set, Python clones this workbook's data row (must already be a full Oman/submit
   * invoice) instead of the blank Covoro template — use for dropdown packs.
   */
  seedWorkbookPath?: string;
};

export type CurrencyExchangeBatchMode = "allowed" | "invalid_blank_non_aed";

export async function generateDropdownMasterExcel(
  fieldName: string,
  masterData: any[] | any,
  options?: GenerateDropdownMasterExcelOptions
): Promise<DropdownGeneratedWorkbook[]> {
  const values = Array.isArray(masterData) ? masterData : [masterData];
  const files: DropdownGeneratedWorkbook[] = [];
  const scriptPath = path.join(process.cwd(), "utils", "invoice_excel_writer.py");
  if (!fs.existsSync(scriptPath)) {
    throw new Error(`Python writer script not found at: ${scriptPath}`);
  }
  const templatePath =
    options?.seedWorkbookPath && fs.existsSync(options.seedWorkbookPath)
      ? options.seedWorkbookPath
      : getInvoiceTemplatePath();

  // One file per batch: template has one data column area; we duplicate rows per dropdown value inside Python.
  // Pass values via a JSON file — base64 on argv exceeds Windows command-line limits for large batches / long labels.
  const outDir = getGeneratedInvoiceExcelDir();
  fs.mkdirSync(outDir, { recursive: true });
  for (let i = 0; i < values.length; i += BATCH_SIZE) {
    const batch = values.slice(i, i + BATCH_SIZE).map((item) => item?.label ?? item?.value ?? item);
    const fileName = `${fieldName.replace(/\s/g, "_")}_${Date.now()}_${i}.xlsx`;
    const valuesJsonPath = path.join(
      outDir,
      `_dropdown_batch_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 10)}.json`
    );
    fs.writeFileSync(valuesJsonPath, JSON.stringify(batch), "utf8");
    let stdout: string;
    const clearItemTypeForRcmFlag =
      options?.clearItemTypeWhenRcmField === false ? "0" : "1";
    const clearRcmForItemTypeFlag =
      options?.clearRcmWhenItemTypeField === false ? "0" : "1";
    try {
      stdout = runPythonForStdout(
        scriptPath,
        [
          "write_dropdown_batch_from_file",
          templatePath,
          SHEET_NAME,
          String(HEADER_ROW),
          String(DATA_ROW),
          fieldName,
          valuesJsonPath,
          fileName,
          clearItemTypeForRcmFlag,
          clearRcmForItemTypeFlag,
        ],
        300_000
      );
    } finally {
      try {
        fs.unlinkSync(valuesJsonPath);
      } catch {}
    }
    const { filePath, invoiceNumber } = parsePythonWriterResult(stdout);
    // Calculations + worker TIN columns applied inside Python writer before save.
    generatedFiles.push(filePath);
    files.push({ filePath, invoiceNumber });
  }
  return files;
}

export async function generateInvoiceCurrencyExchangeBatchExcel(
  currencyCodes: readonly string[],
  mode: CurrencyExchangeBatchMode
): Promise<DropdownGeneratedWorkbook> {
  if (currencyCodes.length === 0) {
    throw new Error("currencyCodes cannot be empty");
  }
  const scriptPath = path.join(process.cwd(), "utils", "invoice_excel_writer.py");
  if (!fs.existsSync(scriptPath)) {
    throw new Error(`Python writer script not found at: ${scriptPath}`);
  }
  const templatePath = getInvoiceTemplatePath();
  const outDir = getGeneratedInvoiceExcelDir();
  fs.mkdirSync(outDir, { recursive: true });

  const fileName = `InvoiceCurrencyExchangeBatch_${mode}_${Date.now()}.xlsx`;
  const valuesJsonPath = path.join(
    outDir,
    `_currency_exchange_batch_${Date.now()}_${Math.random().toString(36).slice(2, 10)}.json`
  );
  fs.writeFileSync(valuesJsonPath, JSON.stringify(currencyCodes), "utf8");

  let stdout: string;
  try {
    stdout = runPythonForStdout(scriptPath, [
      "write_currency_exchange_batch_from_file",
      templatePath,
      SHEET_NAME,
      String(HEADER_ROW),
      String(DATA_ROW),
      valuesJsonPath,
      fileName,
      mode,
    ]);
  } finally {
    try {
      fs.unlinkSync(valuesJsonPath);
    } catch {}
  }

  const { filePath, invoiceNumber } = parsePythonWriterResult(stdout);
  generatedFiles.push(filePath);
  return { filePath, invoiceNumber };
}

export async function updateExcelFieldWithInvoice(fieldName: string,length: number): Promise<{ filePath: string; invoiceNumber: string }> {
  // Like update_field but keeps a real invoice number on the row (needed for edit UI + error flows).
  const { filePath, invoiceNumber } = runPythonTemplateWriter(
    "update_field_with_invoice",
    fieldName,
    String(length)
  );
  applyInvoiceCalculationsToFile(filePath);
  generatedFiles.push(filePath);
  return { filePath, invoiceNumber };
}

/**
 * Build submit-flow cell payload (totals recalculated). Invoice # / issue date stay Python-owned
 * unless the caller adds `Invoice Number` after this (bulk multi-invoice files).
 */
async function buildSubmitFlowRowValuesForWrite(
  rowData: Record<string, any>,
  requiredColumns?: string[]
): Promise<Record<string, unknown>> {
  const templateHeaders = await getCachedInvoiceTemplateHeaders();
  const allowedColumnNames = new Set(
    (requiredColumns && requiredColumns.length > 0
      ? requiredColumns
      : Object.keys(rowData))
  );
  allowedColumnNames.add("Invoice Number");
  allowedColumnNames.add("Invoice Issue Date");
  const allowedColumnsMatchKeys = new Set(
    Array.from(allowedColumnNames, (name) => invoiceHeaderMatchKey(name))
  );
  const rowValues: Record<string, unknown> = {};

  for (const [header, value] of Object.entries(rowData)) {
    if (!allowedColumnsMatchKeys.has(invoiceHeaderMatchKey(header))) continue;
    rowValues[header] = value;
  }
  Object.assign(
    rowValues,
    applyCounterpartyElectronicAddressOverrides(rowValues as Record<string, unknown>)
  );
  applyExemptFromTaxBlankTaxFields(rowValues, rowData["Tax Category"]);

  const normalizeRuleText = (value: unknown): string =>
    String(value ?? "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  const isCreditNoteType = (value: unknown): boolean =>
    normalizeRuleText(value).replace(/-/g, " ").includes("credit note");
  const isDeemedSupplyTxn = (value: unknown): boolean => {
    const normalized = normalizeRuleText(value);
    return normalized.includes("deemed supply") || normalized.includes("x1xxxxxx");
  };
  const isOutOfScopeInvoiceType = (value: unknown): boolean =>
    normalizeRuleText(value).replace(/-/g, " ").includes("out of scope");
  if (isOutOfScopeInvoiceType(rowData["Invoice Type Code"])) {
    rowValues["Payment means type code"] = PAYMENT_MEANS_TYPE_CODE_INVOICE_OUT_OF_SCOPE_OF_TAX;
  }
  if (
    isCreditNoteType(rowData["Invoice Type Code"]) ||
    isDeemedSupplyTxn(rowData["Invoice Transaction Type Code"])
  ) {
    rowValues["Payment means type code"] = "";
    rowValues["Scheme Identifier"] = "";
    rowValues["Payment account identifier"] = "";
    rowValues["Payment account name"] = "";
    rowValues["Payment service provider identifier"] = "";
    rowValues["Payment card primary account number"] = "";
  }

  const hasBuyerSchemeValue =
    Object.prototype.hasOwnProperty.call(rowData, "Scheme identifier") &&
    allowedColumnsMatchKeys.has(invoiceHeaderMatchKey("Scheme identifier"));
  if (hasBuyerSchemeValue) {
    rowValues["Scheme identifier"] = rowData["Scheme identifier"];
    rowValues["Scheme Identifier"] = "";
  }

  const calcSourceRow = isVatReverseChargeTaxCategory(rowData["Tax Category"])
    ? {
        ...rowData,
        ...Object.fromEntries(
          [...DOCUMENT_LEVEL_FIELDS_CLEARED_FOR_VAT_REVERSE_CHARGE].map((h) => [h, ""])
        ),
      }
    : rowData;

  if (isVatReverseChargeTaxCategory(rowData["Tax Category"])) {
    for (const h of DOCUMENT_LEVEL_FIELDS_CLEARED_FOR_VAT_REVERSE_CHARGE) {
      rowValues[h] = "";
    }
  }

  const toNumber = (value: any, fallback = 0): number => {
    if (value === null || value === undefined || String(value).trim() === "") {
      return fallback;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const effectiveTaxRate = resolveEffectiveTaxRateFromSplitTaxColumns(calcSourceRow, toNumber);

  const submissionCalcInput = {
    invoiceCurrencyCode: calcSourceRow["Invoice Currency Code"] ?? OMAN_HOME_CURRENCY,
    currencyRate: toNumber(calcSourceRow["Currency Exchange Rate"], 1),
    invoiceTransactionTypeCode:
      calcSourceRow["Invoice Transaction Type Code"] ?? "",
    itemPriceBaseQty: toNumber(calcSourceRow["Item price base quantity"], 1),
    itemGrossPrice: toNumber(calcSourceRow["Item gross price"], 0),
    itemPriceDiscount: toNumber(calcSourceRow["Item price discount"], 0),
    invoicedQty: toNumber(calcSourceRow["Invoiced quantity"], 0),
    lineCharge: toNumber(calcSourceRow["Invoice line charge amount"], 0),
    lineAllowance: toNumber(calcSourceRow["Invoice line allowance amount"], 0),
    taxRate: effectiveTaxRate,
    docCharges: toNumber(calcSourceRow["Charges on document level"], 0),
    docAllowances: toNumber(calcSourceRow["Allowances on document level"], 0),
    paidAmount: toNumber(calcSourceRow["Paid amount"], 0),
    roundingAmount: toNumber(calcSourceRow["Rounding amount"], 0),
  };

  const calc = calculateInvoiceValues({
    ...submissionCalcInput,
    taxCategory: calcSourceRow["Tax Category"],
  });
  const setCalculated = (header: string, value: number | null) => {
    if (value === null) {
      rowValues[header] = null;
      return;
    }
    rowValues[header] = value;
  };

  setCalculated("Item net price", calc.itemNetPrice);
  setCalculated("Invoice line net amount", calc.invoiceLineNetAmount);
  setCalculated("Line item VAT amount", calc.lineItemVatAmount);
  setCalculated("Total amount including VAT", calc.totalAmountIncludingVat);
  setCalculated("Sum of Invoice line net amount", calc.sumInvoiceLineNetAmount);
  setCalculated("Invoice total amount without tax", calc.invoiceTotalWithoutTax);
  setCalculated("Invoice total tax amount", calc.invoiceTotalTax);
  setCalculated("Invoice total amount with tax", calc.invoiceTotalWithTax);
  setCalculated("Amount due for payment", calc.amountDue);
  setCalculated(
    "Total amount due (profit margin)",
    calc.totalAmountDueProfitMargin
  );
  setCalculated(
    "Invoice total tax amount in tax accounting currency",
    calc.invoiceTotalTaxAccountingCurrency
  );
  applyExemptFromTaxBlankTaxFields(rowValues, calcSourceRow["Tax Category"]);

  const sparseForTemplate = filterSubmitRowToTemplateHeaders(rowValues, templateHeaders);
  return buildSubmitRowValuesExplicitPerTemplateHeader(sparseForTemplate, templateHeaders);
}

export async function generateInvoiceFromSubmitData(
  rowData: Record<string, any>,
  requiredColumns?: string[],
  testFiles?: string[]
): Promise<{ filePath: string; invoiceNumber: string }> {
  const invoiceNumber = buildUniqueSubmitInvoiceNumber();
  const todayDate = getTodayDate();

  // Submit pipeline: Python clears data row 6, stamps invoice # / issue date, then writes each template column from
  // `calculateInvoiceValues` output via `buildSubmitRowValuesExplicitPerTemplateHeader` (missing keys → "", explicit null → omit cell).
  const rowValuesForWrite = await buildSubmitFlowRowValuesForWrite(rowData, requiredColumns);

  const { filePath } = writeSubmitFlowRowWithPython({
    invoiceNumber,
    issueDate: todayDate,
    fileName: `${invoiceNumber}.xlsx`,
    rowValues: rowValuesForWrite,
  });
  // Apply Python row calculations so templates get the same fix6 / ceil2 totals on disk.
  // Pack regen under load routinely exceeds the 45s pythonRunner default.
  applyInvoiceCalculationsToFile(filePath, DATA_ROW, 300_000);
  generatedFiles.push(filePath);
  if (testFiles) testFiles.push(filePath);
  return { filePath, invoiceNumber };
}

/**
 * One workbook with `count` distinct single-item invoices (same line data, unique invoice #s).
 * Numbers look like `{base}-1` … `{base}-N` so a shared prefix search can isolate the batch.
 */
export async function generateBulkSingleItemSubmitInvoices(
  rowData: Record<string, any>,
  count: number,
  testFiles?: string[]
): Promise<{ filePath: string; invoiceNumbers: string[]; batchPrefix: string }> {
  if (!Number.isInteger(count) || count < 1) {
    throw new Error(`generateBulkSingleItemSubmitInvoices: count must be >= 1, got ${count}`);
  }

  const batchPrefix = buildUniqueSubmitInvoiceNumber();
  const todayDate = getTodayDate();
  const invoiceNumbers = Array.from({ length: count }, (_, i) => `${batchPrefix}-${i + 1}`);

  const rowPayloads: Array<Record<string, unknown>> = [];
  for (const invoiceNumber of invoiceNumbers) {
    const rowValuesForWrite = await buildSubmitFlowRowValuesForWrite(rowData);
    // Python stamps the batch prefix first; per-row Invoice Number overwrites for distinct invoices.
    rowValuesForWrite["Invoice Number"] = invoiceNumber;
    rowPayloads.push(rowValuesForWrite);
  }

  const { filePath } = writeSubmitFlowRowsWithPython({
    invoiceNumber: batchPrefix,
    issueDate: todayDate,
    fileName: `${batchPrefix}-bulk-${count}.xlsx`,
    rows: rowPayloads,
    timeoutMs: 300_000,
  });

  for (let i = 0; i < count; i++) {
    applyInvoiceCalculationsToFile(filePath, DATA_ROW + i, 300_000);
  }

  generatedFiles.push(filePath);
  if (testFiles) testFiles.push(filePath);
  return { filePath, invoiceNumbers, batchPrefix };
}

/**
 * One workbook with N **distinct** single-item invoices from **differing** submit rows
 * (e.g. Credit note + Debit note + Self billed credit note, same polarity mutation).
 * Unlike `generateBulkSingleItemSubmitInvoices` (clones one row) and
 * `generateInvoiceFromSubmitRows` (one invoice #, multi-line), each row gets its own
 * invoice number and is run through `buildSubmitFlowRowValuesForWrite` independently.
 */
export async function generateDistinctSubmitInvoices(
  rows: Array<Record<string, any>>,
  options?: { fileName?: string; testFiles?: string[]; timeoutMs?: number }
): Promise<{ filePath: string; invoiceNumbers: string[]; batchPrefix: string }> {
  if (!rows.length) {
    throw new Error("generateDistinctSubmitInvoices: rows cannot be empty");
  }

  const batchPrefix = buildUniqueSubmitInvoiceNumber();
  const todayDate = getTodayDate();
  const invoiceNumbers = rows.map((_, i) => `${batchPrefix}-${i + 1}`);

  const rowPayloads: Array<Record<string, unknown>> = [];
  for (let i = 0; i < rows.length; i++) {
    const rowValuesForWrite = await buildSubmitFlowRowValuesForWrite(rows[i]);
    rowValuesForWrite["Invoice Number"] = invoiceNumbers[i];
    rowPayloads.push(rowValuesForWrite);
  }

  const fileName =
    options?.fileName?.trim() ||
    `${batchPrefix}-multi-${rows.length}.xlsx`;

  // Multi-row openpyxl writes on the Covoro template routinely exceed the 45s default;
  // large conditional multi-OR packs (6–9 invoice types) need 15–20 minutes under load.
  const writeTimeoutMs = options?.timeoutMs ?? 1_200_000;
  const { filePath } = writeSubmitFlowRowsWithPython({
    invoiceNumber: batchPrefix,
    issueDate: todayDate,
    fileName,
    rows: rowPayloads,
    timeoutMs: writeTimeoutMs,
  });

  for (let i = 0; i < rows.length; i++) {
    applyInvoiceCalculationsToFile(filePath, DATA_ROW + i, writeTimeoutMs);
  }

  generatedFiles.push(filePath);
  if (options?.testFiles) options.testFiles.push(filePath);
  return { filePath, invoiceNumbers, batchPrefix };
}

/** Fields whose value changes line/doc totals — rebuild seed workbook per batch. */
function dropdownFieldRequiresRecalc(fieldName: string): boolean {
  const n = normalizeInvoiceHeader(fieldName);
  return (
    n.includes("tax category") ||
    n.includes("tax rate") ||
    n.includes("currency") ||
    n.includes("exchange rate") ||
    n.includes("quantity") ||
    n.includes("price") ||
    n.includes("allowance") ||
    n.includes("charge")
  );
}

/**
 * Multi-invoice workbook for Oman dropdown packs: each row is a **full** submit-shaped
 * invoice. Builds one Oman seed via `generateInvoiceFromSubmitData`, then clones that
 * data row with `generateDropdownMasterExcel` (only the target dropdown column changes).
 */
export async function generateFullRowDropdownFieldExcel(
  fieldName: string,
  values: Array<string | { label?: string; value?: unknown }>,
  baseRow: Record<string, any>,
  options?: { batchSize?: number; fileNamePrefix?: string }
): Promise<DropdownGeneratedWorkbook[]> {
  const labels = values.map((item) =>
    typeof item === "string" || typeof item === "number"
      ? String(item)
      : String(item?.label ?? item?.value ?? "")
  );
  if (labels.length === 0) {
    throw new Error("generateFullRowDropdownFieldExcel: values cannot be empty");
  }

  // Seed workbook: full Oman row on template data row; dropdown batch copies it per value.
  const seed = await generateInvoiceFromSubmitData({
    ...baseRow,
    "Invoice Number": buildUniqueSubmitInvoiceNumber(),
  });

  return generateDropdownMasterExcel(
    fieldName,
    labels.map((label) => ({ label })),
    {
      seedWorkbookPath: seed.filePath,
      // Keep Item Type / RCM as on the Oman seed unless this batch is testing those fields.
      clearItemTypeWhenRcmField: false,
      clearRcmWhenItemTypeField: false,
    }
  );
}

export async function generateInvoiceFromSubmitRows(
  rows: Array<Record<string, any>>,
  testFiles?: string[]
): Promise<{ filePath: string; invoiceNumber: string }> {
  if (!rows.length) {
    throw new Error("generateInvoiceFromSubmitRows: rows cannot be empty");
  }

  const invoiceNumber = buildUniqueSubmitInvoiceNumber();
  const todayDate = getTodayDate();
  const templateHeaders = await getCachedInvoiceTemplateHeaders();

  // Reuse the single-row submit rules, but apply totals across all line-rows.
  const toNumber = (value: any, fallback = 0): number => {
    if (value === null || value === undefined || String(value).trim() === "") {
      return fallback;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const currencyCode = rows[0]["Invoice Currency Code"] ?? OMAN_HOME_CURRENCY;
  const currencyRate = toNumber(rows[0]["Currency Exchange Rate"], 1) || 1;

  // Document-level charges/allowances are taken from the first row (if present).
  const docCharges = toNumber(rows[0]["Charges on document level"], 0);
  const docAllowances = toNumber(rows[0]["Allowances on document level"], 0);
  const paidAmount = toNumber(rows[0]["Paid amount"], 0);
  const roundingAmount = toNumber(rows[0]["Rounding amount"], 0);

  // Line-level calcs (raw + rounded) for aggregation.
  const fix6 = (n: number) => Number(n.toFixed(6));
  const ceil2 = (num: number) => Math.ceil(num * 100 - 1e-12) / 100;

  const firstEffectiveTaxRate = resolveEffectiveTaxRateFromSplitTaxColumns(
    rows[0],
    toNumber
  );
  const docChargeTaxRaw = fix6(docCharges * (firstEffectiveTaxRate / 100));
  const docAllowanceTaxRaw = fix6(docAllowances * (firstEffectiveTaxRate / 100));

  const perLine = rows.map((r) => {
    const effectiveTaxRate = resolveEffectiveTaxRateFromSplitTaxColumns(r, toNumber);
    const itemPriceBaseQty = toNumber(r["Item price base quantity"], 1);
    const itemGrossPrice = toNumber(r["Item gross price"], 0);
    const itemPriceDiscount = toNumber(r["Item price discount"], 0);
    const invoicedQty = toNumber(r["Invoiced quantity"], 0);
    const lineCharge = toNumber(r["Invoice line charge amount"], 0);
    const lineAllowance = toNumber(r["Invoice line allowance amount"], 0);

    const rawItemNet = fix6(itemGrossPrice - itemPriceDiscount);
    const rawLineNet =
      itemPriceBaseQty > 0
        ? fix6((rawItemNet * invoicedQty) / itemPriceBaseQty + lineCharge - lineAllowance)
        : fix6(lineCharge - lineAllowance);
    const rawVat = fix6(rawLineNet * (effectiveTaxRate / 100));
    const rawLinePlusVat = fix6(rawLineNet + rawVat);
    const isExempt = isExemptFromTaxTaxCategory(r["Tax Category"]);

    return {
      rawLineNet,
      rawVat,
      itemNetPrice: ceil2(rawItemNet),
      invoiceLineNetAmount: ceil2(rawLineNet),
      lineItemVatAmount: isExempt ? null : ceil2(rawVat),
      totalAmountIncludingVat: ceil2(rawLinePlusVat),
    };
  });

  const rawSumLineNet = fix6(perLine.reduce((acc, l) => acc + l.rawLineNet, 0));
  const rawSumVat = fix6(perLine.reduce((acc, l) => acc + l.rawVat, 0));
  const rawTotalWithoutTax = fix6(rawSumLineNet + docCharges - docAllowances);
  const rawTotalTax = fix6(rawSumVat + docChargeTaxRaw - docAllowanceTaxRaw);
  const rawTotalWithTax = fix6(rawTotalWithoutTax + rawTotalTax);

  const invoiceTotalWithoutTax = ceil2(rawTotalWithoutTax);
  const invoiceTotalTax = ceil2(rawTotalTax);
  const invoiceTotalWithTax = ceil2(rawTotalWithTax);
  const amountDue = ceil2(fix6(rawTotalWithTax - paidAmount + roundingAmount));
  const sumInvoiceLineNetAmount = ceil2(rawSumLineNet);
  const invoiceTotalTaxAccountingCurrency =
    currencyCode === OMAN_HOME_CURRENCY
      ? null
      : ceil2(fix6(rawTotalTax * currencyRate));
  /** IBR-082-OM: document-level PM total only when txn type is Profit Margin / Self-Invoice. */
  const profitMarginTxn = isProfitMarginTransactionType(
    rows[0]?.["Invoice Transaction Type Code"]
  );
  const totalAmountDueProfitMargin = profitMarginTxn
    ? ceil2(fix6(perLine.reduce((acc, l) => acc + l.rawLineNet + l.rawVat, 0)))
    : null;

  const rowPayloads: Array<Record<string, unknown>> = rows.map((row, idx) => {
    const rowValues: Record<string, unknown> = {};
    for (const [header, value] of Object.entries(row)) {
      rowValues[header] = value;
    }

    Object.assign(
      rowValues,
      applyCounterpartyElectronicAddressOverrides(rowValues as Record<string, unknown>)
    );
    applyExemptFromTaxBlankTaxFields(rowValues, row["Tax Category"]);

    // Force per-line calculated values.
    rowValues["Item net price"] = perLine[idx].itemNetPrice;
    rowValues["Invoice line net amount"] = perLine[idx].invoiceLineNetAmount;
    rowValues["Line item VAT amount"] = perLine[idx].lineItemVatAmount;
    rowValues["Total amount including VAT"] = perLine[idx].totalAmountIncludingVat;

    // Force invoice-level totals across all lines.
    rowValues["Sum of Invoice line net amount"] = sumInvoiceLineNetAmount;
    rowValues["Invoice total amount without tax"] = invoiceTotalWithoutTax;
    rowValues["Invoice total tax amount"] = invoiceTotalTax;
    rowValues["Invoice total amount with tax"] = invoiceTotalWithTax;
    rowValues["Amount due for payment"] = amountDue;
    rowValues["Total amount due (profit margin)"] = totalAmountDueProfitMargin;
    rowValues["Invoice total tax amount in tax accounting currency"] =
      invoiceTotalTaxAccountingCurrency;

    // Narrow to active template headers and expand to per-header payload.
    const sparse = filterSubmitRowToTemplateHeaders(rowValues, templateHeaders);
    return buildSubmitRowValuesExplicitPerTemplateHeader(sparse, templateHeaders);
  });

  const { filePath } = writeSubmitFlowRowsWithPython({
    invoiceNumber,
    issueDate: todayDate,
    fileName: `${invoiceNumber}.xlsx`,
    rows: rowPayloads,
    // Multi-row openpyxl writes regularly exceed the default 45s bridge timeout.
    timeoutMs: 180_000,
  });

  // Python writer already applies calculations for each written row before saving.
  generatedFiles.push(filePath);
  if (testFiles) testFiles.push(filePath);
  return { filePath, invoiceNumber };
}