/**
 * **Formula validation** — full Oman seed (same as field/conditional) + formula input overlay.
 * Workbooks: `generateInvoiceFromSubmitData` (clears row 6, writes seed + overlay, recalculates totals).
 * CamelCase `buildFormulaExcelPayload` stays for calculated-field baselines / pack helper.
 *
 * Excel artifacts: generator registers paths in `generatedFiles`; `Src/baseTest`
 * attaches workbooks only on failure/timeout in `afterEach`, then deletes them from disk.
 */
import type { Page } from "@playwright/test";
import { uploadAndVerify } from "./uploadHelper";
import {
  runErrorValidation,
  runErrorValidationForAllDataRows,
} from "./excelEditMessageCheck";
import { defaultInvoiceData } from "../../testData/FieldValidations/Min_max_field_validation";
import * as FV from "../../testData/FieldValidations/ConditionalValidation";
import {
  applyPartyIdentifiersByTxnType,
  buildVatCategoryTaxAmountE09ScenarioRow,
  buildVatCategoryTaxAmountO09ScenarioRow,
  buildVatCategoryTaxAmountZ09ScenarioRow,
} from "./conditionalValidationHelper";
import {
  applyPaidAmountPrepaymentCompanions,
  buildOmanFullTaxSubmitSeedRow,
  OMAN_BUYER_ELECTRONIC,
  OMAN_BUYER_VAT,
} from "./fieldValidationExcelPackHelper";
import { applyParallelWorkerIdentityToSubmitRow } from "../worker/parallelWorkerSubmitIdentity";
import {
  taxExemptionReasonExemptValidTestData,
  taxExemptionReasonZeroRatedValidTestData,
} from "../../testData/Master/Master.omnCore";
import {
  calculateInvoiceValuesForGeneratorPayload,
  generateInvoiceFromSubmitData,
  generateInvoiceFromSubmitRows,
  generateDistinctSubmitInvoices,
  INVOICE_TEMPLATE_DATA_ROW,
  OMAN_HOME_CURRENCY,
  patchInvoiceDataCellInFile,
  patchInvoiceTextCellInFile,
} from "../../utils/excel/invoiceExcel";

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
 * ALIGNED-IBRP-E-08-OM: Exempt (E) VAT category taxable amount (IBT-116) must equal
 * Σ IBT-131(E) − Σ IBT-092(E) + Σ IBT-099(E). Covoro has no IBG-23 column — proxy for
 * Σ mismatch is Invoice Total Amount Without Tax. VAT breakdown (IBG-23) is UI/backend
 * and auto-maps by transaction type; Excel cases provide totals and assert upload status.
 * Simplified + E: provide values (do not blank IBT-116 proxy) → accepted.
 * Non-Simplified txn matrix reuses E09_OM_NON_SIMPLIFIED_TXN_TYPES (excludes Profit Margin
 * Self-Invoice — IBR-086-OM → O only).
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
  invoiceTransactionTypeCode: string;
};

export const ALIGNED_IBRP_E_08_OM_ALLOWED_CASES: AlignedIbrpE08OmCase[] = [
  ...FV.expandAcrossE09OmNonSimplifiedTxnTypes<AlignedIbrpE08OmCase>({
    ruleId: "ALIGNED-IBRP-E-08-OM",
    polarity: "allowed_line",
    title:
      "Given Exempt VAT on a {txn} — When the line taxable amount matches — Then the invoice should be accepted. (ALIGNED-IBRP-E-08-OM)",
    shouldError: false,
  }),
  {
    ruleId: "ALIGNED-IBRP-E-08-OM",
    polarity: "allowed_line_allowance_charge",
    title:
      "Given Exempt VAT on a Full Tax invoice — When line, allowance, and charge taxable amounts match — Then the invoice should be accepted. (ALIGNED-IBRP-E-08-OM)",
    shouldError: false,
    invoiceTransactionTypeCode: FV.TXN_FULL_TAX_INVOICE,
  },
  {
    ruleId: "ALIGNED-IBRP-E-08-OM",
    polarity: "exception_simplified_e_accepted",
    title:
      "Given Exempt VAT on a Simplified invoice — When a taxable amount is provided — Then the invoice should be accepted. (ALIGNED-IBRP-E-08-OM)",
    shouldError: false,
    invoiceTransactionTypeCode: FV.TXN_SIMPLIFIED_TAX_INVOICE,
  },
];

export const ALIGNED_IBRP_E_08_OM_NOT_ALLOWED_CASES: AlignedIbrpE08OmCase[] =
  FV.expandAcrossE09OmNonSimplifiedTxnTypes<AlignedIbrpE08OmCase>({
    ruleId: "ALIGNED-IBRP-E-08-OM",
    polarity: "not_allowed_mismatch",
    title:
      "Given Exempt VAT on a {txn} — When the taxable amount does not match — Then the invoice should be rejected with an error. (ALIGNED-IBRP-E-08-OM)",
    shouldError: true,
  });

/** All E-08 cases (allowed batch + not-allowed batch polarities). */
export const ALIGNED_IBRP_E_08_OM_CASES: AlignedIbrpE08OmCase[] = [
  ...ALIGNED_IBRP_E_08_OM_ALLOWED_CASES,
  ...ALIGNED_IBRP_E_08_OM_NOT_ALLOWED_CASES,
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

/**
 * E-08 submit row: E-09 txn companions (keeps Exempt on Profit Margin Invoice) +
 * formula amount overlay. Avoids buildFormulaSubmitRow's Profit Margin → O force.
 */
function buildE08OmSubmitRow(
  polarity: AlignedIbrpE08OmPolarity,
  txn: string
): Record<string, string> {
  const formulaRow = e08OmExemptBaseRow(polarity, txn);
  const companions = buildVatCategoryTaxAmountE09ScenarioRow({
    ruleId: "ALIGNED-IBRP-E-08-OM",
    title: formulaRow.name,
    invoiceTransactionTypeCode: txn,
    taxCategory: FV.EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
    taxRate: null,
    taxExemptionReasonCode: FV.TAX_EXEMPTION_REASON_SAMPLE,
    vatCategoryTaxAmount: "0",
    shouldError: false,
    expectedErrorField: E08_OM_IBT116_PROXY_HEADER,
  });
  const amountOverlay = formulaPayloadToHeaderOverlay(
    buildFormulaExcelPayload(formulaRow, "omr")
  );
  let row = overlayHeaderValues(asStringRow(companions), amountOverlay);
  row = applyParallelWorkerIdentityToSubmitRow(row);
  row[BUYER_VAT_FIELD] = OMAN_BUYER_VAT;
  row[BUYER_EL_FIELD] = OMAN_BUYER_ELECTRONIC;
  row[FV.TAX_CATEGORY_FIELD] = FV.EXEMPT_FROM_TAX_TAX_CATEGORY_CODE;
  row[FV.INVOICED_ITEM_TAX_RATE_FIELD] = "";
  row[FV.TAX_EXEMPTION_REASON_CODE_FIELD] = FV.TAX_EXEMPTION_REASON_SAMPLE;
  row[FV.INVOICE_TYPE_CODE_FIELD] =
    FV.INVOICE_TYPE_CODE_INVOICE_OUT_OF_SCOPE_OF_TAX;
  return applyDocumentLevelCompanionsToSubmitRow(row);
}

function clearSimplifiedTxnCompanions(
  filePath: string,
  dataRow = INVOICE_TEMPLATE_DATA_ROW
): void {
  patchInvoiceTextCellInFile(filePath, FV.ITEM_TYPE_FIELD, "", dataRow);
  patchInvoiceTextCellInFile(
    filePath,
    FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD,
    "",
    dataRow
  );
  patchInvoiceTextCellInFile(
    filePath,
    FV.INDUSTRIAL_CLASSIFICATION_CODE_FIELD,
    "",
    dataRow
  );
}

/**
 * ALIGNED-IBRP-E-08-OM Allowed: one workbook, one invoice row per scenario
 * (all non-Simplified txns + Full Tax line/allowance/charge + Simplified).
 */
export async function verifyAlignedIbrpE08OmAllowedBatch(
  page: Page,
  scenarios: readonly AlignedIbrpE08OmCase[] = ALIGNED_IBRP_E_08_OM_ALLOWED_CASES
): Promise<void> {
  if (!scenarios.length) {
    throw new Error("verifyAlignedIbrpE08OmAllowedBatch: no allowed scenarios");
  }
  const rows = scenarios.map((scenario) =>
    buildE08OmSubmitRow(scenario.polarity, scenario.invoiceTransactionTypeCode)
  );
  const { filePath } = await generateDistinctSubmitInvoices(rows, {
    fileName: `ALIGNED-IBRP-E-08-OM-allowed-${Date.now()}.xlsx`,
  });
  for (let i = 0; i < scenarios.length; i++) {
    if (
      scenarios[i]!.invoiceTransactionTypeCode === FV.TXN_SIMPLIFIED_TAX_INVOICE
    ) {
      clearSimplifiedTxnCompanions(filePath, INVOICE_TEMPLATE_DATA_ROW + i);
    }
  }
  await uploadAndVerify(page, filePath);
}

/**
 * ALIGNED-IBRP-E-08-OM Not Allowed: same batch shape as Allowed — one workbook,
 * mismatch IBT-116 proxy on every non-Simplified txn row. Fails if fewer rows
 * than uploaded show an error on Invoice Total Amount Without Tax.
 */
export async function verifyAlignedIbrpE08OmNotAllowedBatch(
  page: Page,
  scenarios: readonly AlignedIbrpE08OmCase[] = ALIGNED_IBRP_E_08_OM_NOT_ALLOWED_CASES
): Promise<void> {
  if (!scenarios.length) {
    throw new Error(
      "verifyAlignedIbrpE08OmNotAllowedBatch: no not-allowed scenarios"
    );
  }
  const rows = scenarios.map((scenario) =>
    buildE08OmSubmitRow(scenario.polarity, scenario.invoiceTransactionTypeCode)
  );
  const { filePath } = await generateDistinctSubmitInvoices(rows, {
    fileName: `ALIGNED-IBRP-E-08-OM-not-allowed-${Date.now()}.xlsx`,
  });

  const mismatchTarget = CALCULATED_FIELD_MISMATCH_TARGETS.find(
    (t) => t.excelHeader === E08_OM_IBT116_PROXY_HEADER
  )!;
  for (let i = 0; i < scenarios.length; i++) {
    const scenario = scenarios[i]!;
    const formulaRow = e08OmExemptBaseRow(
      scenario.polarity,
      scenario.invoiceTransactionTypeCode
    );
    const correctRaw = pickCorrectForWorkbook(
      mismatchTarget,
      "omr",
      formulaRow,
      1
    );
    if (correctRaw === null || Number.isNaN(Number(correctRaw))) {
      throw new Error(
        `ALIGNED-IBRP-E-08-OM: no baseline for ${E08_OM_IBT116_PROXY_HEADER} (${scenario.invoiceTransactionTypeCode})`
      );
    }
    patchInvoiceDataCellInFile(
      filePath,
      E08_OM_IBT116_PROXY_HEADER,
      applyToleranceDelta(Number(correctRaw), CALCULATED_FIELD_MISMATCH_DELTA),
      INVOICE_TEMPLATE_DATA_ROW + i
    );
  }

  await runErrorValidationForAllDataRows(page, {
    filePath,
    field: E08_OM_IBT116_PROXY_HEADER,
    expectedDataRowCount: scenarios.length,
    checkEdit: false,
  });
}

export async function runAlignedIbrpE08OmScenario(
  page: Page,
  scenario: AlignedIbrpE08OmCase
) {
  const txn = scenario.invoiceTransactionTypeCode;
  const formulaRow = e08OmExemptBaseRow(scenario.polarity, txn);
  const submitRow = buildE08OmSubmitRow(scenario.polarity, txn);
  const { filePath, invoiceNumber } = await generateInvoiceFromSubmitData(
    submitRow
  );
  patchInvoiceTextCellInFile(filePath, BUYER_VAT_FIELD, OMAN_BUYER_VAT);
  patchInvoiceTextCellInFile(filePath, BUYER_EL_FIELD, OMAN_BUYER_ELECTRONIC);

  if (txn === FV.TXN_SIMPLIFIED_TAX_INVOICE) {
    clearSimplifiedTxnCompanions(filePath);
  }

  if (scenario.polarity === "not_allowed_mismatch") {
    const correctRaw = pickCorrectForWorkbook(
      CALCULATED_FIELD_MISMATCH_TARGETS.find(
        (t) => t.excelHeader === E08_OM_IBT116_PROXY_HEADER
      )!,
      "omr",
      formulaRow,
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
 * Non-Simplified txn matrix reuses O09_OM_NON_SIMPLIFIED_TXN_TYPES (includes Profit
 * Margin Self-Invoice — IBR-086-OM → O).
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
  invoiceTransactionTypeCode: string;
};

export const ALIGNED_IBRP_O_08_OM_ALLOWED_CASES: AlignedIbrpO08OmCase[] = [
  ...FV.expandAcrossO09OmNonSimplifiedTxnTypes<AlignedIbrpO08OmCase>({
    ruleId: "ALIGNED-IBRP-O-08-OM",
    polarity: "allowed_line",
    title:
      "Given Not subject to VAT on a {txn} — When the line taxable amount matches — Then the invoice should be accepted. (ALIGNED-IBRP-O-08-OM)",
    shouldError: false,
  }),
  {
    ruleId: "ALIGNED-IBRP-O-08-OM",
    polarity: "allowed_line_allowance_charge",
    title:
      "Given Not subject to VAT on a Full Tax invoice — When line, allowance, and charge taxable amounts match — Then the invoice should be accepted. (ALIGNED-IBRP-O-08-OM)",
    shouldError: false,
    invoiceTransactionTypeCode: FV.TXN_FULL_TAX_INVOICE,
  },
  {
    ruleId: "ALIGNED-IBRP-O-08-OM",
    polarity: "exception_simplified_o_accepted",
    title:
      "Given Not subject to VAT on a Simplified invoice — When a taxable amount is provided — Then the invoice should be accepted. (ALIGNED-IBRP-O-08-OM)",
    shouldError: false,
    invoiceTransactionTypeCode: FV.TXN_SIMPLIFIED_TAX_INVOICE,
  },
];

export const ALIGNED_IBRP_O_08_OM_NOT_ALLOWED_CASES: AlignedIbrpO08OmCase[] =
  FV.expandAcrossO09OmNonSimplifiedTxnTypes<AlignedIbrpO08OmCase>({
    ruleId: "ALIGNED-IBRP-O-08-OM",
    polarity: "not_allowed_mismatch",
    title:
      "Given Not subject to VAT on a {txn} — When the taxable amount does not match — Then the invoice should be rejected with an error. (ALIGNED-IBRP-O-08-OM)",
    shouldError: true,
  });

/** All O-08 cases (allowed batch + not-allowed batch polarities). */
export const ALIGNED_IBRP_O_08_OM_CASES: AlignedIbrpO08OmCase[] = [
  ...ALIGNED_IBRP_O_08_OM_ALLOWED_CASES,
  ...ALIGNED_IBRP_O_08_OM_NOT_ALLOWED_CASES,
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

/**
 * O-08 submit row: O-09 txn companions + formula amount overlay.
 */
function buildO08OmSubmitRow(
  polarity: AlignedIbrpO08OmPolarity,
  txn: string
): Record<string, string> {
  const formulaRow = o08OmNotSubjectBaseRow(polarity, txn);
  const companions = buildVatCategoryTaxAmountO09ScenarioRow({
    ruleId: "ALIGNED-IBRP-O-08-OM",
    title: formulaRow.name,
    invoiceTransactionTypeCode: txn,
    taxCategory: FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
    taxRate: null,
    taxExemptionReasonCode: "",
    vatCategoryTaxAmount: "0",
    shouldError: false,
    expectedErrorField: O08_OM_IBT116_PROXY_HEADER,
  });
  const amountOverlay = formulaPayloadToHeaderOverlay(
    buildFormulaExcelPayload(formulaRow, "omr")
  );
  let row = overlayHeaderValues(asStringRow(companions), amountOverlay);
  row = applyParallelWorkerIdentityToSubmitRow(row);
  row[BUYER_VAT_FIELD] = OMAN_BUYER_VAT;
  row[BUYER_EL_FIELD] = OMAN_BUYER_ELECTRONIC;
  row[FV.TAX_CATEGORY_FIELD] = FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE;
  row[FV.INVOICED_ITEM_TAX_RATE_FIELD] = "";
  row[FV.TAX_EXEMPTION_REASON_CODE_FIELD] = "";
  row[FV.INVOICE_TYPE_CODE_FIELD] =
    FV.INVOICE_TYPE_CODE_INVOICE_OUT_OF_SCOPE_OF_TAX;
  return applyDocumentLevelCompanionsToSubmitRow(row);
}

/**
 * ALIGNED-IBRP-O-08-OM Allowed: one workbook, one invoice row per scenario
 * (all non-Simplified txns + Full Tax line/allowance/charge + Simplified).
 */
export async function verifyAlignedIbrpO08OmAllowedBatch(
  page: Page,
  scenarios: readonly AlignedIbrpO08OmCase[] = ALIGNED_IBRP_O_08_OM_ALLOWED_CASES
): Promise<void> {
  if (!scenarios.length) {
    throw new Error("verifyAlignedIbrpO08OmAllowedBatch: no allowed scenarios");
  }
  const rows = scenarios.map((scenario) =>
    buildO08OmSubmitRow(scenario.polarity, scenario.invoiceTransactionTypeCode)
  );
  const { filePath } = await generateDistinctSubmitInvoices(rows, {
    fileName: `ALIGNED-IBRP-O-08-OM-allowed-${Date.now()}.xlsx`,
  });
  for (let i = 0; i < scenarios.length; i++) {
    if (
      scenarios[i]!.invoiceTransactionTypeCode === FV.TXN_SIMPLIFIED_TAX_INVOICE
    ) {
      clearSimplifiedTxnCompanions(filePath, INVOICE_TEMPLATE_DATA_ROW + i);
    }
  }
  await uploadAndVerify(page, filePath);
}

/**
 * ALIGNED-IBRP-O-08-OM Not Allowed: same batch shape as Allowed — one workbook,
 * mismatch IBT-116 proxy on every non-Simplified txn row. Fails if fewer rows
 * than uploaded show an error on Invoice Total Amount Without Tax.
 */
export async function verifyAlignedIbrpO08OmNotAllowedBatch(
  page: Page,
  scenarios: readonly AlignedIbrpO08OmCase[] = ALIGNED_IBRP_O_08_OM_NOT_ALLOWED_CASES
): Promise<void> {
  if (!scenarios.length) {
    throw new Error(
      "verifyAlignedIbrpO08OmNotAllowedBatch: no not-allowed scenarios"
    );
  }
  const rows = scenarios.map((scenario) =>
    buildO08OmSubmitRow(scenario.polarity, scenario.invoiceTransactionTypeCode)
  );
  const { filePath } = await generateDistinctSubmitInvoices(rows, {
    fileName: `ALIGNED-IBRP-O-08-OM-not-allowed-${Date.now()}.xlsx`,
  });

  const mismatchTarget = CALCULATED_FIELD_MISMATCH_TARGETS.find(
    (t) => t.excelHeader === O08_OM_IBT116_PROXY_HEADER
  )!;
  for (let i = 0; i < scenarios.length; i++) {
    const scenario = scenarios[i]!;
    const formulaRow = o08OmNotSubjectBaseRow(
      scenario.polarity,
      scenario.invoiceTransactionTypeCode
    );
    const correctRaw = pickCorrectForWorkbook(
      mismatchTarget,
      "omr",
      formulaRow,
      1
    );
    if (correctRaw === null || Number.isNaN(Number(correctRaw))) {
      throw new Error(
        `ALIGNED-IBRP-O-08-OM: no baseline for ${O08_OM_IBT116_PROXY_HEADER} (${scenario.invoiceTransactionTypeCode})`
      );
    }
    patchInvoiceDataCellInFile(
      filePath,
      O08_OM_IBT116_PROXY_HEADER,
      applyToleranceDelta(Number(correctRaw), CALCULATED_FIELD_MISMATCH_DELTA),
      INVOICE_TEMPLATE_DATA_ROW + i
    );
  }

  await runErrorValidationForAllDataRows(page, {
    filePath,
    field: O08_OM_IBT116_PROXY_HEADER,
    expectedDataRowCount: scenarios.length,
    checkEdit: false,
  });
}

export async function runAlignedIbrpO08OmScenario(
  page: Page,
  scenario: AlignedIbrpO08OmCase
) {
  const txn = scenario.invoiceTransactionTypeCode;
  const formulaRow = o08OmNotSubjectBaseRow(scenario.polarity, txn);
  const submitRow = buildO08OmSubmitRow(scenario.polarity, txn);
  const { filePath, invoiceNumber } = await generateInvoiceFromSubmitData(
    submitRow
  );
  patchInvoiceTextCellInFile(filePath, BUYER_VAT_FIELD, OMAN_BUYER_VAT);
  patchInvoiceTextCellInFile(filePath, BUYER_EL_FIELD, OMAN_BUYER_ELECTRONIC);

  if (txn === FV.TXN_SIMPLIFIED_TAX_INVOICE) {
    clearSimplifiedTxnCompanions(filePath);
  }

  if (scenario.polarity === "not_allowed_mismatch") {
    const correctRaw = pickCorrectForWorkbook(
      CALCULATED_FIELD_MISMATCH_TARGETS.find(
        (t) => t.excelHeader === O08_OM_IBT116_PROXY_HEADER
      )!,
      "omr",
      formulaRow,
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
 * Non-Simplified txn matrix reuses E09_OM_NON_SIMPLIFIED_TXN_TYPES (excludes Profit Margin
 * Self-Invoice — IBR-086-OM → O only).
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
  invoiceTransactionTypeCode: string;
};

export const ALIGNED_IBRP_Z_08_OM_ALLOWED_CASES: AlignedIbrpZ08OmCase[] = [
  ...FV.expandAcrossE09OmNonSimplifiedTxnTypes<AlignedIbrpZ08OmCase>({
    ruleId: "ALIGNED-IBRP-Z-08-OM",
    polarity: "allowed_line",
    title:
      "Given Zero rated VAT on a {txn} — When the line taxable amount matches — Then the invoice should be accepted. (ALIGNED-IBRP-Z-08-OM)",
    shouldError: false,
  }),
  {
    ruleId: "ALIGNED-IBRP-Z-08-OM",
    polarity: "allowed_line_allowance_charge",
    title:
      "Given Zero rated VAT on a Full Tax invoice — When line, allowance, and charge taxable amounts match — Then the invoice should be accepted. (ALIGNED-IBRP-Z-08-OM)",
    shouldError: false,
    invoiceTransactionTypeCode: FV.TXN_FULL_TAX_INVOICE,
  },
  {
    ruleId: "ALIGNED-IBRP-Z-08-OM",
    polarity: "exception_simplified_z_accepted",
    title:
      "Given Zero rated VAT on a Simplified invoice — When a taxable amount is provided — Then the invoice should be accepted. (ALIGNED-IBRP-Z-08-OM)",
    shouldError: false,
    invoiceTransactionTypeCode: FV.TXN_SIMPLIFIED_TAX_INVOICE,
  },
];

export const ALIGNED_IBRP_Z_08_OM_NOT_ALLOWED_CASES: AlignedIbrpZ08OmCase[] =
  FV.expandAcrossE09OmNonSimplifiedTxnTypes<AlignedIbrpZ08OmCase>({
    ruleId: "ALIGNED-IBRP-Z-08-OM",
    polarity: "not_allowed_mismatch",
    title:
      "Given Zero rated VAT on a {txn} — When the taxable amount does not match — Then the invoice should be rejected with an error. (ALIGNED-IBRP-Z-08-OM)",
    shouldError: true,
  });

/** All Z-08 cases (allowed batch + not-allowed batch polarities). */
export const ALIGNED_IBRP_Z_08_OM_CASES: AlignedIbrpZ08OmCase[] = [
  ...ALIGNED_IBRP_Z_08_OM_ALLOWED_CASES,
  ...ALIGNED_IBRP_Z_08_OM_NOT_ALLOWED_CASES,
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

/**
 * Z-08 submit row: Z-09 txn companions (keeps Zero rated on Profit Margin Invoice) +
 * formula amount overlay. Avoids buildFormulaSubmitRow's Profit Margin → O force.
 */
function buildZ08OmSubmitRow(
  polarity: AlignedIbrpZ08OmPolarity,
  txn: string
): Record<string, string> {
  const formulaRow = z08OmZeroRatedBaseRow(polarity, txn);
  const companions = buildVatCategoryTaxAmountZ09ScenarioRow({
    ruleId: "ALIGNED-IBRP-Z-08-OM",
    title: formulaRow.name,
    invoiceTransactionTypeCode: txn,
    taxCategory: FV.ZERO_RATED_TAX_CATEGORY_CODE,
    taxRate: FV.TAX_RATE_ZERO,
    taxExemptionReasonCode: FV.TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE,
    vatCategoryTaxAmount: "0",
    shouldError: false,
    expectedErrorField: Z08_OM_IBT116_PROXY_HEADER,
  });
  const amountOverlay = formulaPayloadToHeaderOverlay(
    buildFormulaExcelPayload(formulaRow, "omr")
  );
  let row = overlayHeaderValues(asStringRow(companions), amountOverlay);
  row = applyParallelWorkerIdentityToSubmitRow(row);
  row[BUYER_VAT_FIELD] = OMAN_BUYER_VAT;
  row[BUYER_EL_FIELD] = OMAN_BUYER_ELECTRONIC;
  row[FV.TAX_CATEGORY_FIELD] = FV.ZERO_RATED_TAX_CATEGORY_CODE;
  row[FV.INVOICED_ITEM_TAX_RATE_FIELD] = FV.TAX_RATE_ZERO;
  row[FV.TAX_EXEMPTION_REASON_CODE_FIELD] =
    FV.TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE;
  return applyDocumentLevelCompanionsToSubmitRow(row);
}

/**
 * ALIGNED-IBRP-Z-08-OM Allowed: one workbook, one invoice row per scenario
 * (all non-Simplified txns + Full Tax line/allowance/charge + Simplified).
 */
export async function verifyAlignedIbrpZ08OmAllowedBatch(
  page: Page,
  scenarios: readonly AlignedIbrpZ08OmCase[] = ALIGNED_IBRP_Z_08_OM_ALLOWED_CASES
): Promise<void> {
  if (!scenarios.length) {
    throw new Error("verifyAlignedIbrpZ08OmAllowedBatch: no allowed scenarios");
  }
  const rows = scenarios.map((scenario) =>
    buildZ08OmSubmitRow(scenario.polarity, scenario.invoiceTransactionTypeCode)
  );
  const { filePath } = await generateDistinctSubmitInvoices(rows, {
    fileName: `ALIGNED-IBRP-Z-08-OM-allowed-${Date.now()}.xlsx`,
  });
  for (let i = 0; i < scenarios.length; i++) {
    if (
      scenarios[i]!.invoiceTransactionTypeCode === FV.TXN_SIMPLIFIED_TAX_INVOICE
    ) {
      clearSimplifiedTxnCompanions(filePath, INVOICE_TEMPLATE_DATA_ROW + i);
    }
  }
  await uploadAndVerify(page, filePath);
}

/**
 * ALIGNED-IBRP-Z-08-OM Not Allowed: same batch shape as Allowed — one workbook,
 * mismatch IBT-116 proxy on every non-Simplified txn row. Fails if fewer rows
 * than uploaded show an error on Invoice Total Amount Without Tax.
 */
export async function verifyAlignedIbrpZ08OmNotAllowedBatch(
  page: Page,
  scenarios: readonly AlignedIbrpZ08OmCase[] = ALIGNED_IBRP_Z_08_OM_NOT_ALLOWED_CASES
): Promise<void> {
  if (!scenarios.length) {
    throw new Error(
      "verifyAlignedIbrpZ08OmNotAllowedBatch: no not-allowed scenarios"
    );
  }
  const rows = scenarios.map((scenario) =>
    buildZ08OmSubmitRow(scenario.polarity, scenario.invoiceTransactionTypeCode)
  );
  const { filePath } = await generateDistinctSubmitInvoices(rows, {
    fileName: `ALIGNED-IBRP-Z-08-OM-not-allowed-${Date.now()}.xlsx`,
  });

  const mismatchTarget = CALCULATED_FIELD_MISMATCH_TARGETS.find(
    (t) => t.excelHeader === Z08_OM_IBT116_PROXY_HEADER
  )!;
  for (let i = 0; i < scenarios.length; i++) {
    const scenario = scenarios[i]!;
    const formulaRow = z08OmZeroRatedBaseRow(
      scenario.polarity,
      scenario.invoiceTransactionTypeCode
    );
    const correctRaw = pickCorrectForWorkbook(
      mismatchTarget,
      "omr",
      formulaRow,
      1
    );
    if (correctRaw === null || Number.isNaN(Number(correctRaw))) {
      throw new Error(
        `ALIGNED-IBRP-Z-08-OM: no baseline for ${Z08_OM_IBT116_PROXY_HEADER} (${scenario.invoiceTransactionTypeCode})`
      );
    }
    patchInvoiceDataCellInFile(
      filePath,
      Z08_OM_IBT116_PROXY_HEADER,
      applyToleranceDelta(Number(correctRaw), CALCULATED_FIELD_MISMATCH_DELTA),
      INVOICE_TEMPLATE_DATA_ROW + i
    );
  }

  await runErrorValidationForAllDataRows(page, {
    filePath,
    field: Z08_OM_IBT116_PROXY_HEADER,
    expectedDataRowCount: scenarios.length,
    checkEdit: false,
  });
}

export async function runAlignedIbrpZ08OmScenario(
  page: Page,
  scenario: AlignedIbrpZ08OmCase
) {
  const txn = scenario.invoiceTransactionTypeCode;
  const formulaRow = z08OmZeroRatedBaseRow(scenario.polarity, txn);
  const submitRow = buildZ08OmSubmitRow(scenario.polarity, txn);
  const { filePath, invoiceNumber } = await generateInvoiceFromSubmitData(
    submitRow
  );
  patchInvoiceTextCellInFile(filePath, BUYER_VAT_FIELD, OMAN_BUYER_VAT);
  patchInvoiceTextCellInFile(filePath, BUYER_EL_FIELD, OMAN_BUYER_ELECTRONIC);

  if (txn === FV.TXN_SIMPLIFIED_TAX_INVOICE) {
    clearSimplifiedTxnCompanions(filePath);
  }

  if (scenario.polarity === "not_allowed_mismatch") {
    const correctRaw = pickCorrectForWorkbook(
      CALCULATED_FIELD_MISMATCH_TARGETS.find(
        (t) => t.excelHeader === Z08_OM_IBT116_PROXY_HEADER
      )!,
      "omr",
      formulaRow,
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

// ---------------------------------------------------------------------------
// 20-line positive suite (OMR only) — mixed + same-category × 4
// ---------------------------------------------------------------------------

export const FORMULA_TWENTY_LINE_COUNT = 20;

export type TwentyLineFormulaCaseKind =
  | "mixed"
  | "same_standard"
  | "same_zero"
  | "same_exempt"
  | "same_not_subject";

export type TwentyLineFormulaCase = {
  kind: TwentyLineFormulaCaseKind;
  shortName: string;
  title: string;
};

/** Five OMR accept-only cases: mixed tax + one category for all 20 lines. */
export const TWENTY_LINE_FORMULA_CASES: TwentyLineFormulaCase[] = [
  {
    kind: "mixed",
    shortName: "Mixed tax categories",
    title:
      "Given 20 lines with all four tax categories and distinct cycling Z/E reasons in OMR — When calculated totals match — Then the invoice should be accepted. (20-line mixed)",
  },
  {
    kind: "same_standard",
    shortName: "Same — Standard",
    title:
      "Given 20 Standard rate lines in OMR — When calculated totals match — Then the invoice should be accepted. (20-line Standard)",
  },
  {
    kind: "same_zero",
    shortName: "Same — Zero rated",
    title:
      "Given 20 Zero rated lines with cycling exemption reasons in OMR — When calculated totals match — Then the invoice should be accepted. (20-line Zero)",
  },
  {
    kind: "same_exempt",
    shortName: "Same — Exempt",
    title:
      "Given 20 Exempt from tax lines with cycling exemption reasons in OMR — When calculated totals match — Then the invoice should be accepted. (20-line Exempt)",
  },
  {
    kind: "same_not_subject",
    shortName: "Same — Not subject",
    title:
      "Given 20 Not subject to tax lines in OMR — When calculated totals match — Then the invoice should be accepted. (20-line Not subject)",
  },
];

type TwentyLineTaxDef = {
  taxCategory: string;
  taxRate: number | null;
  taxExemptionReasonCode: string;
  itemType: string;
  serviceTypeCode: string;
  hsCode: string;
  invoiceTypeCode?: string;
  paymentMeansTypeCode?: string;
};

function cycleMasterLabel(
  masters: ReadonlyArray<{ label: string }>,
  index: number
): string {
  if (masters.length === 0) {
    throw new Error("cycleMasterLabel: empty master list");
  }
  return masters[index % masters.length]!.label;
}

function twentyLineTaxDef(
  kind: TwentyLineFormulaCaseKind,
  lineIndex: number
): TwentyLineTaxDef {
  const outOfScope = {
    invoiceTypeCode: FV.INVOICE_TYPE_CODE_INVOICE_OUT_OF_SCOPE_OF_TAX,
    paymentMeansTypeCode: "Instrument not defined",
  };

  const standard = (): TwentyLineTaxDef => ({
    taxCategory: FV.STANDARD_TAX_CATEGORY_CODE,
    taxRate: 5,
    taxExemptionReasonCode: "",
    itemType: FV.ITEM_TYPE_GOODS,
    serviceTypeCode: "",
    hsCode: FV.OMAN_HS_CODE_12,
  });

  const zero = (reasonIndex: number): TwentyLineTaxDef => ({
    taxCategory: FV.ZERO_RATED_TAX_CATEGORY_CODE,
    taxRate: 0,
    taxExemptionReasonCode: cycleMasterLabel(
      taxExemptionReasonZeroRatedValidTestData,
      reasonIndex
    ),
    itemType: FV.ITEM_TYPE_GOODS,
    serviceTypeCode: "",
    hsCode: FV.OMAN_HS_CODE_12,
  });

  const exempt = (
    reasonIndex: number,
    withOutOfScopeDoc: boolean
  ): TwentyLineTaxDef => ({
    taxCategory: FV.EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
    taxRate: null,
    taxExemptionReasonCode: cycleMasterLabel(
      taxExemptionReasonExemptValidTestData,
      reasonIndex
    ),
    itemType: FV.ITEM_TYPE_SERVICES,
    serviceTypeCode: FV.SERVICE_TYPE_CODE_SAMPLE,
    hsCode: "",
    ...(withOutOfScopeDoc ? outOfScope : {}),
  });

  const notSubject = (withOutOfScopeDoc: boolean): TwentyLineTaxDef => ({
    taxCategory: FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
    taxRate: null,
    taxExemptionReasonCode: "",
    itemType: FV.ITEM_TYPE_SERVICES,
    serviceTypeCode: FV.SERVICE_TYPE_CODE_SAMPLE,
    hsCode: "",
    ...(withOutOfScopeDoc ? outOfScope : {}),
  });

  if (kind === "same_standard") return standard();
  if (kind === "same_zero") return zero(lineIndex);
  if (kind === "same_exempt") return exempt(lineIndex, true);
  if (kind === "same_not_subject") return notSubject(true);

  // Mixed: blocks of 5 — Standard, Zero, Exempt, Not subject (document stays Full Tax)
  const block = Math.floor(lineIndex / 5);
  const withinBlock = lineIndex % 5;
  if (block === 0) return standard();
  if (block === 1) return zero(withinBlock);
  if (block === 2) return exempt(withinBlock, false);
  return notSubject(false);
}

function applyTwentyLineItemCompanions(
  row: Record<string, string>,
  def: TwentyLineTaxDef
): Record<string, string> {
  const next = { ...row };
  headerSet(next, FV.ITEM_TYPE_FIELD, def.itemType);
  headerSet(next, FV.SERVICE_TYPE_CODE_FIELD, def.serviceTypeCode);
  headerSet(next, FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD, def.hsCode);
  headerSet(
    next,
    FV.TAX_EXEMPTION_REASON_TEXT_FIELD,
    def.taxExemptionReasonCode
  );
  if (def.invoiceTypeCode) {
    headerSet(next, FV.INVOICE_TYPE_CODE_FIELD, def.invoiceTypeCode);
  }
  if (def.paymentMeansTypeCode) {
    headerSet(next, "Payment Means Type Code", def.paymentMeansTypeCode);
  }
  return next;
}

/**
 * Build 20 submit rows for a twenty-line positive formula case.
 * Doc charges/allowances/paid/rounding stay on line 1 only (other lines blanked).
 */
export function buildTwentyLineFormulaSubmitRows(
  kind: TwentyLineFormulaCaseKind
): Record<string, string>[] {
  const rows: Record<string, string>[] = [];
  for (let i = 0; i < FORMULA_TWENTY_LINE_COUNT; i++) {
    const def = twentyLineTaxDef(kind, i);
    const formulaRow: FormulaDataRow = {
      ...FORMULA_TWO_LINE_SWEEP_BASE_ROW,
      name: `20-line ${kind} — line ${i + 1}`,
      invoiceLineIdentifier: String(i + 1),
      taxCategory: def.taxCategory,
      taxRate: def.taxRate,
      taxExemptionReasonCode: def.taxExemptionReasonCode,
      ...(def.invoiceTypeCode ? { invoiceTypeCode: def.invoiceTypeCode } : {}),
      ...(def.paymentMeansTypeCode
        ? { paymentMeansTypeCode: def.paymentMeansTypeCode }
        : {}),
      ...(i === 0
        ? {}
        : {
            docCharges: 0,
            docAllowances: 0,
            paidAmount: 0,
            roundingAmount: 0,
          }),
    };
    rows.push(
      applyTwentyLineItemCompanions(buildFormulaSubmitRow(formulaRow, "omr"), def)
    );
  }
  return rows;
}

async function generateTwentyLineFormulaWorkbook(
  kind: TwentyLineFormulaCaseKind
): Promise<{ filePath: string; invoiceNumber: string }> {
  const rows = buildTwentyLineFormulaSubmitRows(kind);
  const generated = await generateInvoiceFromSubmitRows(rows);
  for (let i = 0; i < FORMULA_TWENTY_LINE_COUNT; i++) {
    const excelRow = INVOICE_TEMPLATE_DATA_ROW + i;
    patchInvoiceTextCellInFile(
      generated.filePath,
      BUYER_VAT_FIELD,
      OMAN_BUYER_VAT,
      excelRow
    );
    patchInvoiceTextCellInFile(
      generated.filePath,
      BUYER_EL_FIELD,
      OMAN_BUYER_ELECTRONIC,
      excelRow
    );
  }
  return generated;
}

/** OMR accept-only: 20-line workbook → uploadAndVerify. */
export async function runPositiveTwentyLineFormulaScenario(
  page: Page,
  kind: TwentyLineFormulaCaseKind
) {
  const { filePath } = await generateTwentyLineFormulaWorkbook(kind);
  await uploadAndVerify(page, filePath);
}
