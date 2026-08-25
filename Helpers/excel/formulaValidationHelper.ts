/**
 * **Formula validation** — full Oman seed (same as field/conditional) + formula input overlay.
 * Workbooks: `generateInvoiceFromSubmitData` (clears row 6, writes seed + overlay, recalculates totals).
 * CamelCase `buildFormulaExcelPayload` stays for calculated-field baselines / pack helper.
 *
 * Excel artifacts: generator registers paths in `generatedFiles`; `Src/baseTest`
 * attaches workbooks only on failure/timeout in `afterEach`, then deletes them from disk.
 */
import type { Page } from "@playwright/test";
import {
  calculateInvoiceValuesForGeneratorPayload,
  generateInvoiceFromSubmitData,
  generateInvoiceFromSubmitRows,
  INVOICE_TEMPLATE_DATA_ROW,
  OMAN_HOME_CURRENCY,
  patchInvoiceDataCellInFile,
  patchInvoiceTextCellInFile,
} from "../../utils/excel/invoiceExcel";
import { uploadAndVerify } from "./uploadHelper";
import { runErrorValidation } from "./excelEditMessageCheck";
import { defaultInvoiceData } from "../../testData/FieldValidations/Min_max_field_validation";
import * as FV from "../../testData/FieldValidations/ConditionalValidation";
import {
  applyPartyIdentifiersByTxnType,
} from "./conditionalValidationHelper";
import {
  applyPaidAmountPrepaymentCompanions,
  buildOmanFullTaxSubmitSeedRow,
  OMAN_BUYER_ELECTRONIC,
  OMAN_BUYER_VAT,
} from "./fieldValidationExcelPackHelper";
import { applyParallelWorkerIdentityToSubmitRow } from "../worker/parallelWorkerSubmitIdentity";

export const FOREIGN_CURRENCY_CODE = "USD";
export const DEFAULT_FOREIGN_EXCHANGE_RATE = 3.67;

/** Offset added to a valid calculated value to force a validation error. */
const CALCULATED_FIELD_MISMATCH_DELTA = 12345;

/**
 * Oman Peppol / conditional-matrix residual tolerance (u:slack).
 * IBR-168-OM / IBR-168-OM-WARN: ±0.001 OMR (baisa) per line for Line Item VAT Amount.
 * IBR-157-OM and most other monetary formula rules: ±0.01.
 */
export const FORMULA_BAISA_TOLERANCE = 0.001;
export const FORMULA_MONETARY_TOLERANCE = 0.01;

type InvoiceCalcSnapshot = ReturnType<typeof calculateInvoiceValuesForGeneratorPayload>;

/**
 * Calculated numeric columns written after formula workbook generation.
 * `foreignOnly` marks columns used only for non-OMR invoices.
 */
export type CalculatedFieldMismatchTarget = {
  shortName: string;
  /** Exact template header text on row 4. */
  excelHeader: string;
  pickCorrect: (calc: InvoiceCalcSnapshot) => number | null;
  foreignOnly?: boolean;
};

/** Same targets plus Peppol/conditional residual tolerance for within/outside cases. */
export type CalculatedFieldToleranceTarget = CalculatedFieldMismatchTarget & {
  /** Max |actual − expected| still accepted (`u:slack` / baisa). */
  tolerance: number;
};

export const CALCULATED_FIELD_MISMATCH_TARGETS: CalculatedFieldMismatchTarget[] = [
  {
    shortName: "Item net price",
    excelHeader: "Item Net Price",
    pickCorrect: (c) => c.itemNetPrice,
  },
  {
    shortName: "Invoice line net amount",
    excelHeader: "Invoice Line Net Amount",
    pickCorrect: (c) => c.invoiceLineNetAmount,
  },
  {
    shortName: "Line Item VAT Amount",
    excelHeader: "Line Item VAT Amount",
    pickCorrect: (c) => c.lineItemVatAmount,
  },
  {
    shortName: "Total Amount Including VAT",
    excelHeader: "Total Amount Including VAT",
    pickCorrect: (c) => c.totalAmountIncludingVat,
  },
  {
    shortName: "Sum of Invoice line net amount",
    excelHeader: "Sum Of Invoice Line Net Amount",
    pickCorrect: (c) => c.sumInvoiceLineNetAmount,
  },
  {
    shortName: "Invoice total amount without tax",
    excelHeader: "Invoice Total Amount Without Tax",
    pickCorrect: (c) => c.invoiceTotalWithoutTax,
  },
  {
    shortName: "Invoice total tax amount",
    excelHeader: "Invoice Total Tax Amount",
    pickCorrect: (c) => c.invoiceTotalTax,
  },
  {
    shortName: "Invoice total tax amount in tax accounting currency",
    excelHeader: "Invoice Total Tax Amount In Tax Accounting Currency",
    pickCorrect: (c) => c.invoiceTotalTaxAccountingCurrency,
    foreignOnly: true,
  },
  {
    shortName: "Invoice total amount with tax",
    excelHeader: "Invoice Total Amount With Tax",
    pickCorrect: (c) => c.invoiceTotalWithTax,
  },
  {
    shortName: "Amount due for payment",
    excelHeader: "Amount Due For Payment",
    pickCorrect: (c) => c.amountDue,
  },
  {
    shortName: "Total Amount Due (Profit Margin)",
    excelHeader: "Total Amount Due (Profit Margin)",
    pickCorrect: (c) => c.totalAmountDueProfitMargin,
  },
];

/** Per-field residual tolerances aligned with PINT-OM / conditional matrix. */
export const CALCULATED_FIELD_TOLERANCE_TARGETS: CalculatedFieldToleranceTarget[] =
  CALCULATED_FIELD_MISMATCH_TARGETS.map((t) => ({
    ...t,
    tolerance:
      t.excelHeader === "Line Item VAT Amount"
        ? FORMULA_BAISA_TOLERANCE
        : FORMULA_MONETARY_TOLERANCE,
  }));

export type CurrencyMode = "omr" | "foreign";

export type FormulaDataRow = {
  name: string;
  errorField?: string;
  nonOmrOnly?: boolean;
  currencyRate?: number | null;
  [key: string]: unknown;
};

export type FormulaLineCount = 1 | 2;

export type FormulaRunOptions = {
  lineCount?: FormulaLineCount;
  taxOverlay?: Partial<FormulaDataRow>;
};

export type FormulaTaxCategorySweepCase = {
  shortName: string;
  taxCategory: string;
  taxRate: number | null;
  taxExemptionReasonCode?: string;
  invoiceTypeCode?: string;
  paymentMeansTypeCode?: string;
};

/** All Oman line tax categories (Master.omnCore). Same tax on both 2-line rows. */
export const FORMULA_TAX_CATEGORY_SWEEP: FormulaTaxCategorySweepCase[] = [
  {
    shortName: "Standard rate",
    taxCategory: FV.STANDARD_TAX_CATEGORY_CODE,
    taxRate: 5,
  },
  {
    shortName: "Zero rated",
    taxCategory: FV.ZERO_RATED_TAX_CATEGORY_CODE,
    taxRate: 0,
    taxExemptionReasonCode: FV.TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE,
  },
  {
    shortName: "Exempt from tax",
    taxCategory: FV.EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
    taxRate: null,
    taxExemptionReasonCode: FV.TAX_EXEMPTION_REASON_SAMPLE,
    invoiceTypeCode: "Invoice out of scope of tax",
    paymentMeansTypeCode: "Instrument not defined",
  },
  {
    shortName: "Not subject to tax",
    taxCategory: FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
    taxRate: null,
    taxExemptionReasonCode: "",
    invoiceTypeCode: "Invoice out of scope of tax",
    paymentMeansTypeCode: "Instrument not defined",
  },
];

const LINE_LEVEL_CALCULATED_HEADERS = new Set([
  "Item Net Price",
  "Invoice Line Net Amount",
  "Line Item VAT Amount",
  "Total Amount Including VAT",
]);

const PROFIT_MARGIN_DUE_HEADER = "Total Amount Due (Profit Margin)";

export function isInvoiceLevelCalculatedTarget(
  target: CalculatedFieldMismatchTarget
): boolean {
  return !LINE_LEVEL_CALCULATED_HEADERS.has(target.excelHeader);
}

export function invoiceLevelSweepTargetsForMode(
  mode: CurrencyMode
): CalculatedFieldMismatchTarget[] {
  return mismatchTargetsForMode(mode).filter(
    (t) =>
      isInvoiceLevelCalculatedTarget(t) && t.excelHeader !== PROFIT_MARGIN_DUE_HEADER
  );
}

export function invoiceLevelSweepToleranceTargetsForMode(
  mode: CurrencyMode
): CalculatedFieldToleranceTarget[] {
  return toleranceTargetsForMode(mode).filter(
    (t) =>
      isInvoiceLevelCalculatedTarget(t) && t.excelHeader !== PROFIT_MARGIN_DUE_HEADER
  );
}

export function taxSweepOverlay(
  category: FormulaTaxCategorySweepCase
): Partial<FormulaDataRow> {
  const overlay: Partial<FormulaDataRow> = {
    taxCategory: category.taxCategory,
    taxRate: category.taxRate,
  };
  if (category.taxExemptionReasonCode !== undefined) {
    overlay.taxExemptionReasonCode = category.taxExemptionReasonCode;
  }
  if (category.invoiceTypeCode !== undefined) {
    overlay.invoiceTypeCode = category.invoiceTypeCode;
  }
  if (category.paymentMeansTypeCode !== undefined) {
    overlay.paymentMeansTypeCode = category.paymentMeansTypeCode;
  }
  return overlay;
}

/** Line 1 amounts for tax-category 2-line aggregation (line 2 copies the same columns). */
export const FORMULA_TWO_LINE_SWEEP_BASE_ROW: FormulaDataRow = {
  name: "Two-line same-tax aggregation",
  itemPriceBaseQty: 1,
  itemGrossPrice: 1000,
  itemPriceDiscount: 0,
  invoicedQty: 1,
  lineCharge: 0,
  lineAllowance: 0,
  taxRate: 5,
  docCharges: 0,
  docAllowances: 0,
  paidAmount: 0,
  roundingAmount: 0,
};

/** Non-zero document charges/allowances; companions match item tax on every 2-line row. */
export const FORMULA_TWO_LINE_DOC_LEVEL_OVERLAY: Partial<FormulaDataRow> = {
  name: "Two-line document charges and allowances",
  docCharges: 50,
  docAllowances: 25,
};

const DOCUMENT_LEVEL_INVOICE_TOTAL_HEADERS = new Set([
  "Invoice Total Amount Without Tax",
  "Invoice Total Tax Amount",
  "Invoice Total Amount With Tax",
  "Amount Due For Payment",
  "Invoice Total Tax Amount In Tax Accounting Currency",
]);

/** Invoice-level totals that change when document charges/allowances are present. */
export function documentLevelInvoiceTargetsForMode(
  mode: CurrencyMode
): CalculatedFieldMismatchTarget[] {
  return invoiceLevelSweepTargetsForMode(mode).filter((t) =>
    DOCUMENT_LEVEL_INVOICE_TOTAL_HEADERS.has(t.excelHeader)
  );
}

/**
 * Optional amount inputs. A written `0` is “present” (IBR-058-OM paid amount,
 * charge/allowance reason rules, etc.). Keep `0` only when this scenario is
 * actually testing that field; otherwise leave the cell empty.
 */
const OPTIONAL_AMOUNT_ZERO_HINTS: Record<string, readonly string[]> = {
  itemPriceDiscount: ["discount"],
  lineCharge: ["line charge", "invoice line charge"],
  lineAllowance: ["line allowance", "invoice line allowance"],
  docCharges: ["document charge", "charges on document"],
  docAllowances: ["document allowance", "allowances on document"],
  paidAmount: ["paid amount"],
  roundingAmount: ["rounding"],
};

function isNumericZero(value: unknown): boolean {
  if (value === 0 || value === "0") return true;
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  return trimmed !== "" && Number(trimmed) === 0;
}

function scenarioTargetsOptionalAmount(
  row: FormulaDataRow,
  hints: readonly string[]
): boolean {
  const haystack = `${row.name ?? ""} ${row.errorField ?? ""}`.toLowerCase();
  return hints.some((hint) => haystack.includes(hint));
}

/** Replace filler `0` with `null` so Excel cells stay blank (not present). */
function blankUntestedZeroOptionalAmounts(
  payload: Record<string, unknown>,
  row: FormulaDataRow
): void {
  for (const [key, hints] of Object.entries(OPTIONAL_AMOUNT_ZERO_HINTS)) {
    if (!isNumericZero(payload[key])) continue;
    if (scenarioTargetsOptionalAmount(row, hints)) continue;
    payload[key] = null;
  }
}

function applyToleranceDelta(base: number, delta: number): number {
  const places = Math.abs(delta) > 0 && Math.abs(delta) < 0.01 ? 3 : 2;
  return Number((base + delta).toFixed(places));
}

function formulaMismatchBaseRow(shortName: string): FormulaDataRow {
  const base: FormulaDataRow = {
    name: `Mismatch ${shortName}`,
    itemPriceBaseQty: 1,
    itemGrossPrice: 100,
    itemPriceDiscount: 0,
    invoicedQty: 1,
    lineCharge: 0,
    lineAllowance: 0,
    taxRate: 5,
    docCharges: 0,
    docAllowances: 0,
    paidAmount: 0,
    roundingAmount: 0,
  };
  // IBR-082-OM: this calculated column is only populated for Profit Margin txn types.
  if (shortName === "Total Amount Due (Profit Margin)") {
    base.invoiceTransactionTypeCode = FV.TXN_PROFIT_MARGIN_INVOICE;
    // Align camelCase baseline with Excel companions (Not subject → 0% VAT).
    base.taxCategory = FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE;
    base.taxRate = 0;
  }
  return base;
}

function headerKey(
  row: Record<string, string>,
  wanted: string
): string | undefined {
  const norm = wanted.trim().toLowerCase();
  return Object.keys(row).find((key) => key.trim().toLowerCase() === norm);
}

function headerGet(row: Record<string, string>, wanted: string): string {
  const key = headerKey(row, wanted);
  return key ? String(row[key] ?? "") : "";
}

function headerSet(
  row: Record<string, string>,
  wanted: string,
  value: string
): void {
  const key = headerKey(row, wanted) ?? wanted;
  row[key] = value;
}

function isPresentAmount(value: string): boolean {
  return value.trim() !== "";
}

function documentExemptionReasonForItemCategory(itemCategory: string): string {
  const cat = itemCategory.replace(/\s+/g, " ").trim();
  if (cat === FV.ZERO_RATED_TAX_CATEGORY_CODE) {
    return FV.TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE;
  }
  if (cat === FV.EXEMPT_FROM_TAX_TAX_CATEGORY_CODE) {
    return FV.TAX_EXEMPTION_REASON_SAMPLE;
  }
  return "";
}

/**
 * When Charges/Allowances On Document Level are present, VAT category matches the
 * item Tax Category and Z/E requires an exemption reason. Values are copied onto
 * every multi-item row by calling this per submit row. Amounts stay counted once
 * in `generateInvoiceFromSubmitRows` (row 1).
 */
function applyDocumentLevelCompanionsToSubmitRow(
  row: Record<string, string>
): Record<string, string> {
  const next = { ...row };
  const itemCategory = headerGet(next, FV.TAX_CATEGORY_FIELD);

  const applySide = (
    amountHeader: string,
    vatHeader: string,
    exemptionHeader: string
  ) => {
    if (!isPresentAmount(headerGet(next, amountHeader))) {
      headerSet(next, vatHeader, "");
      headerSet(next, exemptionHeader, "");
      return;
    }
    headerSet(next, vatHeader, itemCategory);
    headerSet(
      next,
      exemptionHeader,
      documentExemptionReasonForItemCategory(itemCategory)
    );
  };

  applySide(
    FV.CHARGES_ON_DOCUMENT_LEVEL_FIELD,
    FV.VAT_CATEGORY_CHARGES_FIELD,
    FV.TAX_EXEMPTION_REASON_CHARGES_FIELD
  );
  applySide(
    FV.ALLOWANCES_ON_DOCUMENT_LEVEL_FIELD,
    FV.VAT_CATEGORY_ALLOWANCES_FIELD,
    FV.TAX_EXEMPTION_REASON_ALLOWANCES_FIELD
  );
  applyPaidAmountPrepaymentCompanions(
    next,
    "Paid amount",
    headerGet(next, "Paid amount")
  );
  return next;
}

/**
 * Profit Margin Invoice / Self-Invoice require companions the Full Tax seed does not have:
 * CL-11 item type, IBR-175-OM preceding ref/UUID (invoice only), tax category O.
 */
function applyProfitMarginRequiredFields(
  row: Record<string, string>
): Record<string, string> {
  const txn = (row[FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD] || "").trim();
  if (
    txn !== FV.TXN_PROFIT_MARGIN_INVOICE &&
    txn !== FV.TXN_PROFIT_MARGIN_SELF_INVOICE
  ) {
    return row;
  }

  const next = { ...row };
  next[FV.TAX_CATEGORY_FIELD] = FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE;
  next[FV.INVOICED_ITEM_TAX_RATE_FIELD] = "";
  next[FV.TAX_EXEMPTION_REASON_CODE_FIELD] = "";
  next[FV.TAX_EXEMPTION_REASON_TEXT_FIELD] = "";
  next["Profit margin item type code"] =
    next["Profit margin item type code"] || "Tangible Movable Property";
  if (txn === FV.TXN_PROFIT_MARGIN_INVOICE) {
    next[FV.PRECEDING_INVOICE_REFERENCE_FIELD] =
      next[FV.PRECEDING_INVOICE_REFERENCE_FIELD] || "PREV-OMN-001";
    next[FV.PRECEDING_INVOICE_UUID_FIELD] =
      next[FV.PRECEDING_INVOICE_UUID_FIELD] || FV.PRECEDING_INVOICE_UUID_SAMPLE;
    next[FV.PRECEDING_INVOICE_ISSUE_DATE_FIELD] =
      next[FV.PRECEDING_INVOICE_ISSUE_DATE_FIELD] || "2026-06-01";
  }
  return next;
}

function mergeTaxOverlay(
  row: FormulaDataRow,
  overlay?: Partial<FormulaDataRow>
): FormulaDataRow {
  return overlay ? { ...row, ...overlay } : row;
}

/**
 * Line 2 copies every formula column from line 1 (tax, amounts, charges, item text).
 * Only Invoice Line Identifier differs so the two Excel rows stay distinct.
 */
function buildSameTaxSecondLine(line1: FormulaDataRow): FormulaDataRow {
  return {
    ...line1,
    name: `${line1.name} — line 2`,
    invoiceLineIdentifier: "2",
  };
}

function roundMoney2(n: number): number {
  return Number((Math.round(n * 100) / 100).toFixed(2));
}

/** IBR-065-OM: IBT-111 = ceil2(fix6(IBT-110 × FX)); aligned with `calculateInvoiceValues`. */
function ibt111FromInvoiceTotalTax(totalTax: number, currencyRate: number): number {
  const fix6 = (n: number) => Number(n.toFixed(6));
  const ceil2 = (n: number) => Math.ceil(n * 100 - 1e-12) / 100;
  return ceil2(fix6(totalTax * currencyRate));
}

const IBT111_EXCEL_HEADER = "Invoice Total Tax Amount In Tax Accounting Currency";

function pickCorrectTwoLine(
  target: CalculatedFieldMismatchTarget,
  c1: InvoiceCalcSnapshot,
  c2: InvoiceCalcSnapshot,
  currencyRate?: number
): number | null {
  if (!isInvoiceLevelCalculatedTarget(target)) {
    return target.pickCorrect(c1);
  }
  const line2Vat = c2.lineItemVatAmount ?? 0;
  const sumNet = roundMoney2(c1.invoiceLineNetAmount + c2.invoiceLineNetAmount);
  const totalWithoutTax = roundMoney2(c1.invoiceTotalWithoutTax + c2.invoiceLineNetAmount);
  const totalTax = roundMoney2(c1.invoiceTotalTax + line2Vat);
  const totalWithTax = roundMoney2(totalWithoutTax + totalTax);
  const ibt111 =
    target.excelHeader === IBT111_EXCEL_HEADER && currencyRate !== undefined && currencyRate > 0
      ? ibt111FromInvoiceTotalTax(totalTax, currencyRate)
      : c1.invoiceTotalTaxAccountingCurrency === null
        ? null
        : roundMoney2(
            (c1.invoiceTotalTaxAccountingCurrency / Math.max(c1.invoiceTotalTax, 0.000001)) *
              totalTax
          );
  const snapshot: InvoiceCalcSnapshot = {
    ...c1,
    sumInvoiceLineNetAmount: sumNet,
    invoiceTotalWithoutTax: totalWithoutTax,
    invoiceTotalTax: totalTax,
    invoiceTotalWithTax: totalWithTax,
    amountDue: roundMoney2(c1.amountDue + c2.invoiceLineNetAmount + line2Vat),
    invoiceTotalTaxAccountingCurrency: ibt111,
    totalAmountDueProfitMargin:
      c1.totalAmountDueProfitMargin === null
        ? null
        : roundMoney2(
            (c1.totalAmountIncludingVat ?? 0) + (c2.totalAmountIncludingVat ?? 0)
          ),
  };
  return target.pickCorrect(snapshot);
}

function pickCorrectForWorkbook(
  target: CalculatedFieldMismatchTarget,
  mode: CurrencyMode,
  baseRow: FormulaDataRow,
  lineCount: FormulaLineCount
): number | null {
  const payload1 = buildFormulaExcelPayload(baseRow, mode);
  const c1 = calculateInvoiceValuesForGeneratorPayload(payload1);
  if (lineCount !== 2) {
    return target.pickCorrect(c1);
  }
  const line2 = buildSameTaxSecondLine(baseRow);
  const payload2 = buildFormulaExcelPayload(line2, mode);
  payload2.docCharges = 0;
  payload2.docAllowances = 0;
  payload2.paidAmount = 0;
  payload2.roundingAmount = 0;
  const c2 = calculateInvoiceValuesForGeneratorPayload(payload2);
  const fx =
    mode === "foreign"
      ? Number(payload1.currencyRate) > 0
        ? Number(payload1.currencyRate)
        : DEFAULT_FOREIGN_EXCHANGE_RATE
      : undefined;
  return pickCorrectTwoLine(target, c1, c2, fx);
}

function patchCalculatedFieldCells(
  filePath: string,
  target: CalculatedFieldMismatchTarget,
  patched: number,
  lineCount: FormulaLineCount
): void {
  patchInvoiceDataCellInFile(
    filePath,
    target.excelHeader,
    patched,
    INVOICE_TEMPLATE_DATA_ROW
  );
  if (lineCount === 2 && isInvoiceLevelCalculatedTarget(target)) {
    patchInvoiceDataCellInFile(
      filePath,
      target.excelHeader,
      patched,
      INVOICE_TEMPLATE_DATA_ROW + 1
    );
  }
}

async function generatePatchedCalculatedFieldWorkbook(
  mode: CurrencyMode,
  target: CalculatedFieldMismatchTarget,
  deltaFromCorrect: number,
  options?: FormulaRunOptions
): Promise<{ filePath: string; invoiceNumber: string; correct: number; patched: number }> {
  if (target.foreignOnly && mode === "omr") {
    throw new Error(
      `Calculated field "${target.shortName}" is foreign-only; do not run in OMR mode.`
    );
  }
  const lineCount = options?.lineCount ?? 1;
  const baseRow = mergeTaxOverlay(
    formulaMismatchBaseRow(target.shortName),
    options?.taxOverlay
  );
  const { filePath, invoiceNumber } = await generateFormulaWorkbook(
    baseRow,
    mode,
    lineCount
  );
  const correctRaw = pickCorrectForWorkbook(target, mode, baseRow, lineCount);
  if (correctRaw === null || Number.isNaN(Number(correctRaw))) {
    throw new Error(
      `No numeric baseline for "${target.shortName}" (correct=${String(correctRaw)})`
    );
  }
  const correct = Number(correctRaw);
  const patched = applyToleranceDelta(correct, deltaFromCorrect);
  patchCalculatedFieldCells(filePath, target, patched, lineCount);
  return { filePath, invoiceNumber, correct, patched };
}

export function buildFormulaExcelPayload(
  row: FormulaDataRow,
  mode: CurrencyMode
): Record<string, unknown> {
  const { name: _n, errorField: _ef, nonOmrOnly: _no, ...fields } = row;
  const payload: Record<string, unknown> = { ...defaultInvoiceData, ...fields };
  blankUntestedZeroOptionalAmounts(payload, row);

  if (mode === "omr") {
    payload.invoiceCurrencyCode = OMAN_HOME_CURRENCY;
    delete payload.currencyRate;
  } else {
    payload.invoiceCurrencyCode = FOREIGN_CURRENCY_CODE;
    if (!Object.prototype.hasOwnProperty.call(row, "currencyRate")) {
      payload.currencyRate = DEFAULT_FOREIGN_EXCHANGE_RATE;
    } else {
      payload.currencyRate = row.currencyRate;
    }
  }

  return payload;
}

/** CamelCase formula payload keys → Excel header text (row 4). */
const FORMULA_CAMEL_TO_HEADER: Record<string, string> = {
  invoiceCurrencyCode: "Invoice Currency Code",
  currencyRate: "Currency Exchange Rate",
  invoiceTransactionTypeCode: "Invoice Transaction Type Code",
  itemPriceBaseQty: "Item Price Base Quantity",
  itemGrossPrice: "Item Gross Price",
  itemPriceDiscount: "Item Price Discount",
  invoicedQty: "Invoiced Quantity",
  lineCharge: "Invoice Line Charge Amount",
  lineAllowance: "Invoice Line Allowance Amount",
  taxCategory: "Tax Category",
  taxRate: "Tax Rate",
  taxExemptionReasonCode: "Tax Exemption Reason Code",
  taxExemptionReasonText: "Tax Exemption Reason Text",
  invoiceTypeCode: "Invoice Type Code",
  paymentMeansTypeCode: "Payment Means Type Code",
  docCharges: "Charges On Document Level",
  docAllowances: "Allowances On Document Level",
  paidAmount: "Paid Amount",
  roundingAmount: "Rounding Amount",
  invoiceLineIdentifier: "Invoice Line Identifier",
  itemName: "Item Name",
  itemDescription: "Item Description",
  itemClassificationIdentifier: "Item Classification Identifier",
};

const BUYER_VAT_FIELD = "Buyer VAT identifier";
const BUYER_EL_FIELD = "Buyer electronic address";

function asStringRow(row: Record<string, string | null>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(row)) {
    out[key] = value ?? "";
  }
  return out;
}

function overlayHeaderValues(
  seed: Record<string, string>,
  overlay: Record<string, string>
): Record<string, string> {
  const next = { ...seed };
  const byNorm = new Map(
    Object.keys(next).map((key) => [key.trim().toLowerCase(), key])
  );
  for (const [header, value] of Object.entries(overlay)) {
    const existing = byNorm.get(header.trim().toLowerCase());
    if (existing) {
      next[existing] = value;
    } else {
      next[header] = value;
      byNorm.set(header.trim().toLowerCase(), header);
    }
  }
  return next;
}

function formulaPayloadToHeaderOverlay(
  payload: Record<string, unknown>
): Record<string, string> {
  const overlay: Record<string, string> = {};
  for (const [camel, header] of Object.entries(FORMULA_CAMEL_TO_HEADER)) {
    if (!Object.prototype.hasOwnProperty.call(payload, camel)) continue;
    const value = payload[camel];
    if (value === undefined) continue;
    overlay[header] = value === null ? "" : String(value);
  }
  return overlay;
}

/**
 * Full Oman Full Tax Invoice seed (same as field/conditional), then overlay formula inputs.
 */
export type BuildFormulaSubmitRowOptions = {
  /** Parallel Playwright runs patch worker TIN slots (default). TestData packs disable this. */
  applyWorkerIdentity?: boolean;
};

export function buildFormulaSubmitRow(
  row: FormulaDataRow,
  mode: CurrencyMode,
  options?: BuildFormulaSubmitRowOptions
): Record<string, string> {
  const payload = buildFormulaExcelPayload(row, mode);
  const overlay = formulaPayloadToHeaderOverlay(payload);
  if (mode === "omr") {
    overlay["Currency Exchange Rate"] = overlay["Currency Exchange Rate"] ?? "";
  } else {
    overlay["Source currency code"] = overlay["Source currency code"] ?? OMAN_HOME_CURRENCY;
  }

  const seed = buildOmanFullTaxSubmitSeedRow();
  const merged = overlayHeaderValues(seed, overlay);
  const withTxn = asStringRow(applyPartyIdentifiersByTxnType(merged));
  const applyWorkerIdentity = options?.applyWorkerIdentity !== false;
  const identified = applyWorkerIdentity
    ? applyParallelWorkerIdentityToSubmitRow(withTxn)
    : withTxn;
  if (applyWorkerIdentity) {
    identified[BUYER_VAT_FIELD] = OMAN_BUYER_VAT;
    identified[BUYER_EL_FIELD] = OMAN_BUYER_ELECTRONIC;
  }
  // Re-apply formula inputs after identity so discount/qty/rate feed generate totals.
  // Then fill Profit Margin companions (overlay only has camelCase formula keys).
  // Document-level VAT/exemption must run last so they match the final item tax.
  return applyDocumentLevelCompanionsToSubmitRow(
    applyProfitMarginRequiredFields(overlayHeaderValues(identified, overlay))
  );
}

async function generateFormulaWorkbook(
  row: FormulaDataRow,
  mode: CurrencyMode,
  lineCount: FormulaLineCount = 1
): Promise<{ filePath: string; invoiceNumber: string }> {
  if (lineCount !== 2) {
    const generated = await generateInvoiceFromSubmitData(buildFormulaSubmitRow(row, mode));
    patchInvoiceTextCellInFile(generated.filePath, BUYER_VAT_FIELD, OMAN_BUYER_VAT);
    patchInvoiceTextCellInFile(generated.filePath, BUYER_EL_FIELD, OMAN_BUYER_ELECTRONIC);
    return generated;
  }

  const line1: FormulaDataRow = {
    ...row,
    invoiceLineIdentifier: row.invoiceLineIdentifier ?? "1",
  };
  const line2 = buildSameTaxSecondLine(line1);
  const generated = await generateInvoiceFromSubmitRows([
    buildFormulaSubmitRow(line1, mode),
    buildFormulaSubmitRow(line2, mode),
  ]);
  patchInvoiceTextCellInFile(
    generated.filePath,
    BUYER_VAT_FIELD,
    OMAN_BUYER_VAT,
    INVOICE_TEMPLATE_DATA_ROW
  );
  patchInvoiceTextCellInFile(
    generated.filePath,
    BUYER_EL_FIELD,
    OMAN_BUYER_ELECTRONIC,
    INVOICE_TEMPLATE_DATA_ROW
  );
  patchInvoiceTextCellInFile(
    generated.filePath,
    BUYER_VAT_FIELD,
    OMAN_BUYER_VAT,
    INVOICE_TEMPLATE_DATA_ROW + 1
  );
  patchInvoiceTextCellInFile(
    generated.filePath,
    BUYER_EL_FIELD,
    OMAN_BUYER_ELECTRONIC,
    INVOICE_TEMPLATE_DATA_ROW + 1
  );
  return generated;
}

export const CURRENCY_SUITES: { mode: CurrencyMode; label: string }[] = [
  { mode: "omr", label: "OMR — invoice currency" },
  {
    mode: "foreign",
    label: "Non-OMR — USD invoice currency",
  },
];

export type FormulaScenarioRow = FormulaDataRow & {
  name: string;
  errorField?: string;
  nonOmrOnly?: boolean;
};

/**
 * OMR: general formula rows (skip `nonOmrOnly` FX / IBT-111 cases).
 * Non-OMR: every formula row — line/tax/totals math is the same as OMR, with USD + FX rate.
 *
 * The one exchange-rate-dependent calculated column is still isolated in
 * mismatchTargetsForMode / toleranceTargetsForMode (IBT-111 only).
 */
export function isScenarioApplicableForMode(
  mode: CurrencyMode,
  row: FormulaScenarioRow
): boolean {
  if (mode === "omr") {
    return !row.nonOmrOnly;
  }
  return true;
}

/** Mismatch targets for a currency mode (non-OMR → IBT-111 only). */
export function mismatchTargetsForMode(
  mode: CurrencyMode
): CalculatedFieldMismatchTarget[] {
  if (mode === "foreign") {
    return CALCULATED_FIELD_MISMATCH_TARGETS.filter((t) => t.foreignOnly);
  }
  return CALCULATED_FIELD_MISMATCH_TARGETS.filter((t) => !t.foreignOnly);
}

/** Tolerance targets for a currency mode (non-OMR → IBT-111 only). */
export function toleranceTargetsForMode(
  mode: CurrencyMode
): CalculatedFieldToleranceTarget[] {
  if (mode === "foreign") {
    return CALCULATED_FIELD_TOLERANCE_TARGETS.filter((t) => t.foreignOnly);
  }
  return CALCULATED_FIELD_TOLERANCE_TARGETS.filter((t) => !t.foreignOnly);
}

export async function runPositiveFormulaScenario(
  page: Page,
  mode: CurrencyMode,
  row: FormulaScenarioRow,
  options?: FormulaRunOptions
) {
  const merged = mergeTaxOverlay(row as FormulaDataRow, options?.taxOverlay);
  const { filePath } = await generateFormulaWorkbook(
    merged,
    mode,
    options?.lineCount ?? 1
  );
  await uploadAndVerify(page, filePath);
}

/**
 * Create a valid invoice, corrupt one calculated field by a large delta, expect error file.
 */
export async function runCalculatedFieldMismatchErrorScenario(
  page: Page,
  mode: CurrencyMode,
  target: CalculatedFieldMismatchTarget,
  options?: FormulaRunOptions
) {
  const { filePath, invoiceNumber } = await generatePatchedCalculatedFieldWorkbook(
    mode,
    target,
    CALCULATED_FIELD_MISMATCH_DELTA,
    options
  );
  await runErrorValidation(page, {
    filePath,
    field: target.excelHeader,
    invoiceNumber,
    checkEdit: true,
  });
}

/**
 * Conditional-matrix pattern: difference at allowed residual tolerance → accepted
 * (IBR-168 baisa ±0.001 / other monetary ±0.01).
 */
export async function runCalculatedFieldWithinToleranceAcceptedScenario(
  page: Page,
  mode: CurrencyMode,
  target: CalculatedFieldToleranceTarget,
  options?: FormulaRunOptions
) {
  const { filePath } = await generatePatchedCalculatedFieldWorkbook(
    mode,
    target,
    target.tolerance,
    options
  );
  await uploadAndVerify(page, filePath);
}

/**
 * Conditional-matrix pattern: difference just outside residual tolerance → error file.
 */
export async function runCalculatedFieldOutsideToleranceErrorScenario(
  page: Page,
  mode: CurrencyMode,
  target: CalculatedFieldToleranceTarget,
  options?: FormulaRunOptions
) {
  const outsideDelta = target.tolerance + target.tolerance;
  const { filePath, invoiceNumber } = await generatePatchedCalculatedFieldWorkbook(
    mode,
    target,
    outsideDelta,
    options
  );
  await runErrorValidation(page, {
    filePath,
    field: target.excelHeader,
    invoiceNumber,
    checkEdit: true,
  });
}

/**
 * ALIGNED-IBRP-E/O/Z-09 + IBR-039/054/077: categories where Line Item VAT must be 0/blank.
 * Force a non-zero Line Item VAT Amount and expect an error file.
 */
export type ZeroLineVatCategoryCase = {
  ruleId: string;
  shortName: string;
  taxCategory: string;
  taxRate?: number | null;
  taxExemptionReasonCode?: string;
  invoiceTypeCode?: string;
  paymentMeansTypeCode?: string;
};

export const ZERO_LINE_VAT_CATEGORY_CASES: ZeroLineVatCategoryCase[] = [
  {
    ruleId: "ALIGNED-IBRP-Z-09-OM / IBR-077-OM",
    shortName: "Zero rated",
    taxCategory: "Zero rated",
    taxRate: 0,
    taxExemptionReasonCode: FV.TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE,
  },
  {
    ruleId: "ALIGNED-IBRP-E-09-OM / IBR-039-OM",
    shortName: "Exempt from tax",
    taxCategory: "Exempt from tax",
    taxRate: null,
    taxExemptionReasonCode: FV.TAX_EXEMPTION_REASON_SAMPLE,
    invoiceTypeCode: "Invoice out of scope of tax",
    paymentMeansTypeCode: "Instrument not defined",
  },
  {
    ruleId: "ALIGNED-IBRP-O-09-OM / IBR-054-OM",
    shortName: "Not subject to VAT",
    taxCategory: "Services outside scope of tax / Not subject to tax",
    taxRate: null,
    taxExemptionReasonCode: "",
    invoiceTypeCode: "Invoice out of scope of tax",
    paymentMeansTypeCode: "Instrument not defined",
  },
];

export async function runZeroLineVatForcedNonZeroErrorScenario(
  page: Page,
  mode: CurrencyMode,
  categoryCase: ZeroLineVatCategoryCase,
  options?: FormulaRunOptions
) {
  if (mode !== "omr") {
    throw new Error("Zero Line Item VAT category cases run in OMR mode only.");
  }
  const row: FormulaDataRow = {
    name: `Force non-zero VAT ${categoryCase.shortName}`,
    taxCategory: categoryCase.taxCategory,
    taxRate: categoryCase.taxRate ?? null,
    taxExemptionReasonCode: categoryCase.taxExemptionReasonCode,
    invoiceTypeCode: categoryCase.invoiceTypeCode,
    paymentMeansTypeCode: categoryCase.paymentMeansTypeCode,
    itemPriceBaseQty: 1,
    itemGrossPrice: 1000,
    itemPriceDiscount: 0,
    invoicedQty: 1,
    lineCharge: 0,
    lineAllowance: 0,
    docCharges: 0,
    docAllowances: 0,
    paidAmount: 0,
    roundingAmount: 0,
  };
  const { filePath, invoiceNumber } = await generateFormulaWorkbook(
    row,
    mode,
    options?.lineCount ?? 1
  );
  patchInvoiceDataCellInFile(filePath, "Line Item VAT Amount", 1);
  await runErrorValidation(page, {
    filePath,
    field: "Line Item VAT Amount",
    invoiceNumber,
    checkEdit: true,
  });
}

/**
 * ALIGNED-IBRP-E-08-OM: Exempt (E) VAT category taxable amount (IBT-116) must equal
 * Σ IBT-131(E) − Σ IBT-092(E) + Σ IBT-099(E). Covoro has no IBG-23 column — proxy for
 * Σ mismatch is Invoice Total Amount Without Tax. VAT breakdown (IBG-23) is UI/backend
 * and auto-maps by transaction type; Excel cases provide totals and assert upload status.
 * Simplified + E: provide values (do not blank IBT-116 proxy) → accepted.
 */
export const E08_OM_IBT116_PROXY_HEADER = "Invoice Total Amount Without Tax";

export type AlignedIbrpE08OmPolarity =
  | "allowed_line"
  | "allowed_line_allowance_charge"
  | "not_allowed_mismatch"
  | "exception_simplified_e_accepted";

export type AlignedIbrpE08OmCase = {
  ruleId: "ALIGNED-IBRP-E-08-OM";
  polarity: AlignedIbrpE08OmPolarity;
  title: string;
  shouldError: boolean;
};

export const ALIGNED_IBRP_E_08_OM_CASES: AlignedIbrpE08OmCase[] = [
  {
    ruleId: "ALIGNED-IBRP-E-08-OM",
    polarity: "allowed_line",
    title:
      "Given Exempt VAT on a Full Tax invoice — When the line taxable amount matches — Then the invoice should be accepted. (ALIGNED-IBRP-E-08-OM)",
    shouldError: false,
  },
  {
    ruleId: "ALIGNED-IBRP-E-08-OM",
    polarity: "allowed_line_allowance_charge",
    title:
      "Given Exempt VAT on a Full Tax invoice — When line, allowance, and charge taxable amounts match — Then the invoice should be accepted. (ALIGNED-IBRP-E-08-OM)",
    shouldError: false,
  },
  {
    ruleId: "ALIGNED-IBRP-E-08-OM",
    polarity: "not_allowed_mismatch",
    title:
      "Given Exempt VAT on a Full Tax invoice — When the taxable amount does not match — Then the invoice should be rejected with an error. (ALIGNED-IBRP-E-08-OM)",
    shouldError: true,
  },
  {
    ruleId: "ALIGNED-IBRP-E-08-OM",
    polarity: "exception_simplified_e_accepted",
    title:
      "Given Exempt VAT on a Simplified invoice — When a taxable amount is provided — Then the invoice should be accepted. (ALIGNED-IBRP-E-08-OM)",
    shouldError: false,
  },
];

function e08OmExemptBaseRow(
  polarity: AlignedIbrpE08OmPolarity,
  txn: string
): FormulaDataRow {
  const withDoc =
    polarity === "allowed_line_allowance_charge" ||
    polarity === "not_allowed_mismatch";
  return {
    name: withDoc
      ? `ALIGNED-IBRP-E-08-OM document charges and allowances (${polarity})`
      : `ALIGNED-IBRP-E-08-OM (${polarity})`,
    invoiceTransactionTypeCode: txn,
    taxCategory: FV.EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
    taxRate: null,
    taxExemptionReasonCode: FV.TAX_EXEMPTION_REASON_SAMPLE,
    invoiceTypeCode: FV.INVOICE_TYPE_CODE_INVOICE_OUT_OF_SCOPE_OF_TAX,
    paymentMeansTypeCode: "Instrument not defined",
    itemPriceBaseQty: 1,
    itemGrossPrice: 1000,
    itemPriceDiscount: 0,
    invoicedQty: 1,
    lineCharge: 0,
    lineAllowance: 0,
    docCharges: withDoc ? 50 : 0,
    docAllowances: withDoc ? 25 : 0,
    paidAmount: 0,
    roundingAmount: 0,
  };
}

function clearSimplifiedTxnCompanions(filePath: string): void {
  patchInvoiceTextCellInFile(filePath, FV.ITEM_TYPE_FIELD, "");
  patchInvoiceTextCellInFile(filePath, FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD, "");
  patchInvoiceTextCellInFile(filePath, FV.INDUSTRIAL_CLASSIFICATION_CODE_FIELD, "");
}

export async function runAlignedIbrpE08OmScenario(
  page: Page,
  scenario: AlignedIbrpE08OmCase
) {
  const txn =
    scenario.polarity === "exception_simplified_e_accepted"
      ? FV.TXN_SIMPLIFIED_TAX_INVOICE
      : FV.TXN_FULL_TAX_INVOICE;
  const row = e08OmExemptBaseRow(scenario.polarity, txn);
  const { filePath, invoiceNumber } = await generateFormulaWorkbook(row, "omr", 1);

  if (txn === FV.TXN_SIMPLIFIED_TAX_INVOICE) {
    clearSimplifiedTxnCompanions(filePath);
  }

  if (scenario.polarity === "not_allowed_mismatch") {
    const correctRaw = pickCorrectForWorkbook(
      CALCULATED_FIELD_MISMATCH_TARGETS.find(
        (t) => t.excelHeader === E08_OM_IBT116_PROXY_HEADER
      )!,
      "omr",
      row,
      1
    );
    if (correctRaw === null || Number.isNaN(Number(correctRaw))) {
      throw new Error(
        `ALIGNED-IBRP-E-08-OM: no baseline for ${E08_OM_IBT116_PROXY_HEADER}`
      );
    }
    patchInvoiceDataCellInFile(
      filePath,
      E08_OM_IBT116_PROXY_HEADER,
      applyToleranceDelta(Number(correctRaw), CALCULATED_FIELD_MISMATCH_DELTA)
    );
  }

  if (scenario.shouldError) {
    await runErrorValidation(page, {
      filePath,
      field: E08_OM_IBT116_PROXY_HEADER,
      invoiceNumber,
      checkEdit: true,
    });
    return;
  }
  await uploadAndVerify(page, filePath);
}

/**
 * ALIGNED-IBRP-O-08-OM: Not subject (O) VAT category taxable amount (IBT-116) must equal
 * Σ IBT-131(O) − Σ IBT-092(O) + Σ IBT-099(O). Covoro has no IBG-23 column — proxy for
 * Σ mismatch is Invoice Total Amount Without Tax. VAT breakdown (IBG-23) is UI/backend
 * and auto-maps by transaction type; Excel cases provide totals and assert upload status.
 * Simplified + O: provide values (do not blank IBT-116 proxy) → accepted.
 */
export const O08_OM_IBT116_PROXY_HEADER = "Invoice Total Amount Without Tax";

export type AlignedIbrpO08OmPolarity =
  | "allowed_line"
  | "allowed_line_allowance_charge"
  | "not_allowed_mismatch"
  | "exception_simplified_o_accepted";

export type AlignedIbrpO08OmCase = {
  ruleId: "ALIGNED-IBRP-O-08-OM";
  polarity: AlignedIbrpO08OmPolarity;
  title: string;
  shouldError: boolean;
};

export const ALIGNED_IBRP_O_08_OM_CASES: AlignedIbrpO08OmCase[] = [
  {
    ruleId: "ALIGNED-IBRP-O-08-OM",
    polarity: "allowed_line",
    title:
      "Given Not subject to VAT on a Full Tax invoice — When the line taxable amount matches — Then the invoice should be accepted. (ALIGNED-IBRP-O-08-OM)",
    shouldError: false,
  },
  {
    ruleId: "ALIGNED-IBRP-O-08-OM",
    polarity: "allowed_line_allowance_charge",
    title:
      "Given Not subject to VAT on a Full Tax invoice — When line, allowance, and charge taxable amounts match — Then the invoice should be accepted. (ALIGNED-IBRP-O-08-OM)",
    shouldError: false,
  },
  {
    ruleId: "ALIGNED-IBRP-O-08-OM",
    polarity: "not_allowed_mismatch",
    title:
      "Given Not subject to VAT on a Full Tax invoice — When the taxable amount does not match — Then the invoice should be rejected with an error. (ALIGNED-IBRP-O-08-OM)",
    shouldError: true,
  },
  {
    ruleId: "ALIGNED-IBRP-O-08-OM",
    polarity: "exception_simplified_o_accepted",
    title:
      "Given Not subject to VAT on a Simplified invoice — When a taxable amount is provided — Then the invoice should be accepted. (ALIGNED-IBRP-O-08-OM)",
    shouldError: false,
  },
];

function o08OmNotSubjectBaseRow(
  polarity: AlignedIbrpO08OmPolarity,
  txn: string
): FormulaDataRow {
  const withDoc =
    polarity === "allowed_line_allowance_charge" ||
    polarity === "not_allowed_mismatch";
  return {
    name: withDoc
      ? `ALIGNED-IBRP-O-08-OM document charges and allowances (${polarity})`
      : `ALIGNED-IBRP-O-08-OM (${polarity})`,
    invoiceTransactionTypeCode: txn,
    taxCategory: FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
    taxRate: null,
    taxExemptionReasonCode: "",
    invoiceTypeCode: FV.INVOICE_TYPE_CODE_INVOICE_OUT_OF_SCOPE_OF_TAX,
    paymentMeansTypeCode: "Instrument not defined",
    itemPriceBaseQty: 1,
    itemGrossPrice: 1000,
    itemPriceDiscount: 0,
    invoicedQty: 1,
    lineCharge: 0,
    lineAllowance: 0,
    docCharges: withDoc ? 50 : 0,
    docAllowances: withDoc ? 25 : 0,
    paidAmount: 0,
    roundingAmount: 0,
  };
}

export async function runAlignedIbrpO08OmScenario(
  page: Page,
  scenario: AlignedIbrpO08OmCase
) {
  const txn =
    scenario.polarity === "exception_simplified_o_accepted"
      ? FV.TXN_SIMPLIFIED_TAX_INVOICE
      : FV.TXN_FULL_TAX_INVOICE;
  const row = o08OmNotSubjectBaseRow(scenario.polarity, txn);
  const { filePath, invoiceNumber } = await generateFormulaWorkbook(row, "omr", 1);

  if (txn === FV.TXN_SIMPLIFIED_TAX_INVOICE) {
    clearSimplifiedTxnCompanions(filePath);
  }

  if (scenario.polarity === "not_allowed_mismatch") {
    const correctRaw = pickCorrectForWorkbook(
      CALCULATED_FIELD_MISMATCH_TARGETS.find(
        (t) => t.excelHeader === O08_OM_IBT116_PROXY_HEADER
      )!,
      "omr",
      row,
      1
    );
    if (correctRaw === null || Number.isNaN(Number(correctRaw))) {
      throw new Error(
        `ALIGNED-IBRP-O-08-OM: no baseline for ${O08_OM_IBT116_PROXY_HEADER}`
      );
    }
    patchInvoiceDataCellInFile(
      filePath,
      O08_OM_IBT116_PROXY_HEADER,
      applyToleranceDelta(Number(correctRaw), CALCULATED_FIELD_MISMATCH_DELTA)
    );
  }

  if (scenario.shouldError) {
    await runErrorValidation(page, {
      filePath,
      field: O08_OM_IBT116_PROXY_HEADER,
      invoiceNumber,
      checkEdit: true,
    });
    return;
  }
  await uploadAndVerify(page, filePath);
}

/**
 * ALIGNED-IBRP-S-08-OM: for each Standard (S) VAT category rate (IBT-119), the VAT
 * category taxable amount (IBT-116) must equal Σ IBT-131(S) + Σ IBT-099(S) − Σ IBT-092(S)
 * at the matching rate (IBT-152 / IBT-103 / IBT-096). Covoro has no IBG-23 column — proxy
 * for Σ mismatch is Invoice Total Amount Without Tax. VAT breakdown is UI/backend and
 * auto-maps; Excel cases provide totals and assert upload status. Oman Standard rate is 5.
 */
export const S08_OM_IBT116_PROXY_HEADER = "Invoice Total Amount Without Tax";

export type AlignedIbrpS08OmPolarity =
  | "allowed_line"
  | "allowed_line_allowance_charge"
  | "not_allowed_mismatch";

export type AlignedIbrpS08OmCase = {
  ruleId: "ALIGNED-IBRP-S-08-OM";
  polarity: AlignedIbrpS08OmPolarity;
  title: string;
  shouldError: boolean;
};

export const ALIGNED_IBRP_S_08_OM_CASES: AlignedIbrpS08OmCase[] = [
  {
    ruleId: "ALIGNED-IBRP-S-08-OM",
    polarity: "allowed_line",
    title:
      "Given Standard rate VAT on a Full Tax invoice — When the line taxable amount matches — Then the invoice should be accepted. (ALIGNED-IBRP-S-08-OM)",
    shouldError: false,
  },
  {
    ruleId: "ALIGNED-IBRP-S-08-OM",
    polarity: "allowed_line_allowance_charge",
    title:
      "Given Standard rate VAT on a Full Tax invoice — When line, allowance, and charge taxable amounts match — Then the invoice should be accepted. (ALIGNED-IBRP-S-08-OM)",
    shouldError: false,
  },
  {
    ruleId: "ALIGNED-IBRP-S-08-OM",
    polarity: "not_allowed_mismatch",
    title:
      "Given Standard rate VAT on a Full Tax invoice — When the taxable amount does not match — Then the invoice should be rejected with an error. (ALIGNED-IBRP-S-08-OM)",
    shouldError: true,
  },
];

function s08OmStandardBaseRow(
  polarity: AlignedIbrpS08OmPolarity,
  txn: string
): FormulaDataRow {
  const withDoc =
    polarity === "allowed_line_allowance_charge" ||
    polarity === "not_allowed_mismatch";
  return {
    name: withDoc
      ? `ALIGNED-IBRP-S-08-OM document charges and allowances (${polarity})`
      : `ALIGNED-IBRP-S-08-OM (${polarity})`,
    invoiceTransactionTypeCode: txn,
    taxCategory: FV.STANDARD_TAX_CATEGORY_CODE,
    taxRate: 5,
    itemPriceBaseQty: 1,
    itemGrossPrice: 1000,
    itemPriceDiscount: 0,
    invoicedQty: 1,
    lineCharge: 0,
    lineAllowance: 0,
    docCharges: withDoc ? 50 : 0,
    docAllowances: withDoc ? 25 : 0,
    paidAmount: 0,
    roundingAmount: 0,
  };
}

export async function runAlignedIbrpS08OmScenario(
  page: Page,
  scenario: AlignedIbrpS08OmCase
) {
  const row = s08OmStandardBaseRow(scenario.polarity, FV.TXN_FULL_TAX_INVOICE);
  const { filePath, invoiceNumber } = await generateFormulaWorkbook(row, "omr", 1);

  if (scenario.polarity === "not_allowed_mismatch") {
    const correctRaw = pickCorrectForWorkbook(
      CALCULATED_FIELD_MISMATCH_TARGETS.find(
        (t) => t.excelHeader === S08_OM_IBT116_PROXY_HEADER
      )!,
      "omr",
      row,
      1
    );
    if (correctRaw === null || Number.isNaN(Number(correctRaw))) {
      throw new Error(
        `ALIGNED-IBRP-S-08-OM: no baseline for ${S08_OM_IBT116_PROXY_HEADER}`
      );
    }
    patchInvoiceDataCellInFile(
      filePath,
      S08_OM_IBT116_PROXY_HEADER,
      applyToleranceDelta(Number(correctRaw), CALCULATED_FIELD_MISMATCH_DELTA)
    );
  }

  if (scenario.shouldError) {
    await runErrorValidation(page, {
      filePath,
      field: S08_OM_IBT116_PROXY_HEADER,
      invoiceNumber,
      checkEdit: true,
    });
    return;
  }
  await uploadAndVerify(page, filePath);
}

/**
 * ALIGNED-IBRP-Z-08-OM: Zero rated (Z) VAT category taxable amount (IBT-116) must equal
 * Σ IBT-131(Z) − Σ IBT-092(Z) + Σ IBT-099(Z). Covoro has no IBG-23 column — proxy for
 * Σ mismatch is Invoice Total Amount Without Tax. VAT breakdown (IBG-23) is UI/backend
 * and auto-maps by transaction type; Excel cases provide totals and assert upload status.
 * Simplified + Z: provide values (do not blank IBT-116 proxy) → accepted.
 */
export const Z08_OM_IBT116_PROXY_HEADER = "Invoice Total Amount Without Tax";

export type AlignedIbrpZ08OmPolarity =
  | "allowed_line"
  | "allowed_line_allowance_charge"
  | "not_allowed_mismatch"
  | "exception_simplified_z_accepted";

export type AlignedIbrpZ08OmCase = {
  ruleId: "ALIGNED-IBRP-Z-08-OM";
  polarity: AlignedIbrpZ08OmPolarity;
  title: string;
  shouldError: boolean;
};

export const ALIGNED_IBRP_Z_08_OM_CASES: AlignedIbrpZ08OmCase[] = [
  {
    ruleId: "ALIGNED-IBRP-Z-08-OM",
    polarity: "allowed_line",
    title:
      "Given Zero rated VAT on a Full Tax invoice — When the line taxable amount matches — Then the invoice should be accepted. (ALIGNED-IBRP-Z-08-OM)",
    shouldError: false,
  },
  {
    ruleId: "ALIGNED-IBRP-Z-08-OM",
    polarity: "allowed_line_allowance_charge",
    title:
      "Given Zero rated VAT on a Full Tax invoice — When line, allowance, and charge taxable amounts match — Then the invoice should be accepted. (ALIGNED-IBRP-Z-08-OM)",
    shouldError: false,
  },
  {
    ruleId: "ALIGNED-IBRP-Z-08-OM",
    polarity: "not_allowed_mismatch",
    title:
      "Given Zero rated VAT on a Full Tax invoice — When the taxable amount does not match — Then the invoice should be rejected with an error. (ALIGNED-IBRP-Z-08-OM)",
    shouldError: true,
  },
  {
    ruleId: "ALIGNED-IBRP-Z-08-OM",
    polarity: "exception_simplified_z_accepted",
    title:
      "Given Zero rated VAT on a Simplified invoice — When a taxable amount is provided — Then the invoice should be accepted. (ALIGNED-IBRP-Z-08-OM)",
    shouldError: false,
  },
];

function z08OmZeroRatedBaseRow(
  polarity: AlignedIbrpZ08OmPolarity,
  txn: string
): FormulaDataRow {
  const withDoc =
    polarity === "allowed_line_allowance_charge" ||
    polarity === "not_allowed_mismatch";
  return {
    name: withDoc
      ? `ALIGNED-IBRP-Z-08-OM document charges and allowances (${polarity})`
      : `ALIGNED-IBRP-Z-08-OM (${polarity})`,
    invoiceTransactionTypeCode: txn,
    taxCategory: FV.ZERO_RATED_TAX_CATEGORY_CODE,
    taxRate: 0,
    taxExemptionReasonCode: FV.TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE,
    itemPriceBaseQty: 1,
    itemGrossPrice: 1000,
    itemPriceDiscount: 0,
    invoicedQty: 1,
    lineCharge: 0,
    lineAllowance: 0,
    docCharges: withDoc ? 50 : 0,
    docAllowances: withDoc ? 25 : 0,
    paidAmount: 0,
    roundingAmount: 0,
  };
}

export async function runAlignedIbrpZ08OmScenario(
  page: Page,
  scenario: AlignedIbrpZ08OmCase
) {
  const txn =
    scenario.polarity === "exception_simplified_z_accepted"
      ? FV.TXN_SIMPLIFIED_TAX_INVOICE
      : FV.TXN_FULL_TAX_INVOICE;
  const row = z08OmZeroRatedBaseRow(scenario.polarity, txn);
  const { filePath, invoiceNumber } = await generateFormulaWorkbook(row, "omr", 1);

  if (txn === FV.TXN_SIMPLIFIED_TAX_INVOICE) {
    clearSimplifiedTxnCompanions(filePath);
  }

  if (scenario.polarity === "not_allowed_mismatch") {
    const correctRaw = pickCorrectForWorkbook(
      CALCULATED_FIELD_MISMATCH_TARGETS.find(
        (t) => t.excelHeader === Z08_OM_IBT116_PROXY_HEADER
      )!,
      "omr",
      row,
      1
    );
    if (correctRaw === null || Number.isNaN(Number(correctRaw))) {
      throw new Error(
        `ALIGNED-IBRP-Z-08-OM: no baseline for ${Z08_OM_IBT116_PROXY_HEADER}`
      );
    }
    patchInvoiceDataCellInFile(
      filePath,
      Z08_OM_IBT116_PROXY_HEADER,
      applyToleranceDelta(Number(correctRaw), CALCULATED_FIELD_MISMATCH_DELTA)
    );
  }

  if (scenario.shouldError) {
    await runErrorValidation(page, {
      filePath,
      field: Z08_OM_IBT116_PROXY_HEADER,
      invoiceNumber,
      checkEdit: true,
    });
    return;
  }
  await uploadAndVerify(page, filePath);
}

/**
 * IBR-082-OM: when BTOM-001 is Profit Margin Invoice, Total Amount Due (BTOM-020)
 * is mandatory and must equal Σ Total amount including VAT (BTOM-017).
 * Match + mismatch already live in the calculated-field suite; this covers omit.
 */
export type Ibr082OmPolarity = "not_allowed_omit";

export type Ibr082OmCase = {
  ruleId: "IBR-082-OM";
  polarity: Ibr082OmPolarity;
  title: string;
  shouldError: true;
};

export const IBR_082_OM_CASES: Ibr082OmCase[] = [
  {
    ruleId: "IBR-082-OM",
    polarity: "not_allowed_omit",
    title:
      "Given a Profit Margin invoice — When Total Amount Due is left empty — Then the invoice should be rejected with an error. (IBR-082-OM)",
    shouldError: true,
  },
];

export async function runIbr082OmScenario(page: Page, scenario: Ibr082OmCase) {
  const row = formulaMismatchBaseRow("Total Amount Due (Profit Margin)");
  const { filePath, invoiceNumber } = await generateFormulaWorkbook(row, "omr", 1);

  if (scenario.polarity === "not_allowed_omit") {
    patchInvoiceTextCellInFile(filePath, PROFIT_MARGIN_DUE_HEADER, "");
  }

  await runErrorValidation(page, {
    filePath,
    field: PROFIT_MARGIN_DUE_HEADER,
    invoiceNumber,
    checkEdit: true,
  });
}

export async function runNegativeFormulaScenario(
  page: Page,
  mode: CurrencyMode,
  row: FormulaScenarioRow,
  options?: FormulaRunOptions
) {
  if (!row.errorField) {
    throw new Error(`Negative row "${row.name}" is missing errorField`);
  }

  const merged = mergeTaxOverlay(row as FormulaDataRow, options?.taxOverlay);
  const { filePath, invoiceNumber } = await generateFormulaWorkbook(
    merged,
    mode,
    options?.lineCount ?? 1
  );
  await runErrorValidation(page, {
    filePath,
    field: row.errorField,
    invoiceNumber,
    checkEdit: true,
  });
}
