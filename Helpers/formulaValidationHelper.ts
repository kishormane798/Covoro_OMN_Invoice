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
  OMAN_HOME_CURRENCY,
  patchInvoiceDataCellInFile,
  patchInvoiceTextCellInFile,
} from "../utils/invoiceExcel";
import { uploadAndVerify } from "./uploadHelper";
import { runErrorValidation } from "./excelEditMessageCheck";
import { defaultInvoiceData } from "../testData/FieldValidations/Min_max_field_validation";
import {
  applyPartyIdentifiersByTxnType,
  buildValidOmanFullTaxInvoiceRow,
} from "./conditionalValidationHelper";
import {
  applyOmanSellerBuyerIdentity,
  OMAN_BUYER_ELECTRONIC,
  OMAN_BUYER_VAT,
} from "./fieldValidationExcelPackHelper";
import { applyParallelWorkerIdentityToSubmitRow } from "./parallelWorkerSubmitIdentity";

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
    base.invoiceTransactionTypeCode = "Profit Margin Invoice";
  }
  return base;
}

async function generatePatchedCalculatedFieldWorkbook(
  mode: CurrencyMode,
  target: CalculatedFieldMismatchTarget,
  deltaFromCorrect: number
): Promise<{ filePath: string; invoiceNumber: string; correct: number; patched: number }> {
  if (target.foreignOnly && mode === "omr") {
    throw new Error(
      `Calculated field "${target.shortName}" is foreign-only; do not run in OMR mode.`
    );
  }
  const baseRow = formulaMismatchBaseRow(target.shortName);
  const payload = buildFormulaExcelPayload(baseRow, mode);
  const { filePath, invoiceNumber } = await generateFormulaWorkbook(baseRow, mode);
  const calc = calculateInvoiceValuesForGeneratorPayload(payload);
  const correctRaw = target.pickCorrect(calc);
  if (correctRaw === null || Number.isNaN(Number(correctRaw))) {
    throw new Error(
      `No numeric baseline for "${target.shortName}" (correct=${String(correctRaw)})`
    );
  }
  const correct = Number(correctRaw);
  const patched = applyToleranceDelta(correct, deltaFromCorrect);
  patchInvoiceDataCellInFile(filePath, target.excelHeader, patched);
  return { filePath, invoiceNumber, correct, patched };
}

export function buildFormulaExcelPayload(
  row: FormulaDataRow,
  mode: CurrencyMode
): Record<string, unknown> {
  const { name: _n, errorField: _ef, nonOmrOnly: _no, ...fields } = row;
  const payload: Record<string, unknown> = { ...defaultInvoiceData, ...fields };

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
    overlay[header] = value === null || value === undefined ? "" : String(value);
  }
  return overlay;
}

/**
 * Full Oman Full Tax Invoice seed (same as field/conditional), then overlay formula inputs.
 */
export function buildFormulaSubmitRow(
  row: FormulaDataRow,
  mode: CurrencyMode
): Record<string, string> {
  const payload = buildFormulaExcelPayload(row, mode);
  const overlay = formulaPayloadToHeaderOverlay(payload);
  if (mode === "omr") {
    overlay["Currency Exchange Rate"] = overlay["Currency Exchange Rate"] ?? "";
  } else {
    overlay["Source currency code"] = overlay["Source currency code"] ?? OMAN_HOME_CURRENCY;
  }

  const seed = applyOmanSellerBuyerIdentity(buildValidOmanFullTaxInvoiceRow());
  const merged = overlayHeaderValues(seed, overlay);
  const withTxn = asStringRow(applyPartyIdentifiersByTxnType(merged));
  const identified = applyParallelWorkerIdentityToSubmitRow(withTxn);
  identified[BUYER_VAT_FIELD] = OMAN_BUYER_VAT;
  identified[BUYER_EL_FIELD] = OMAN_BUYER_ELECTRONIC;
  // Re-apply formula inputs after identity so discount/qty/rate feed generate totals.
  return overlayHeaderValues(identified, overlay);
}

async function generateFormulaWorkbook(
  row: FormulaDataRow,
  mode: CurrencyMode
): Promise<{ filePath: string; invoiceNumber: string }> {
  const generated = await generateInvoiceFromSubmitData(buildFormulaSubmitRow(row, mode));
  patchInvoiceTextCellInFile(generated.filePath, BUYER_VAT_FIELD, OMAN_BUYER_VAT);
  patchInvoiceTextCellInFile(generated.filePath, BUYER_EL_FIELD, OMAN_BUYER_ELECTRONIC);
  return generated;
}

export const CURRENCY_SUITES: { mode: CurrencyMode; label: string }[] = [
  { mode: "omr", label: "OMR — invoice currency" },
  {
    mode: "foreign",
    label: "Non-OMR — Invoice Total Tax Amount In Tax Accounting Currency only",
  },
];

export type FormulaScenarioRow = FormulaDataRow & {
  name: string;
  errorField?: string;
  nonOmrOnly?: boolean;
};

/**
 * OMR: all general formula rows (skip `nonOmrOnly`).
 * Non-OMR: only FX / IBT-111 rows (`nonOmrOnly`) — the sole foreign-specific calculated
 * column is Invoice Total Tax Amount In Tax Accounting Currency.
 */
export function isScenarioApplicableForMode(
  mode: CurrencyMode,
  row: FormulaScenarioRow
): boolean {
  if (mode === "omr") {
    return !row.nonOmrOnly;
  }
  return Boolean(row.nonOmrOnly);
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
  row: FormulaScenarioRow
) {
  const { filePath } = await generateFormulaWorkbook(row as FormulaDataRow, mode);
  await uploadAndVerify(page, filePath);
}

/**
 * Create a valid invoice, corrupt one calculated field by a large delta, expect error file.
 */
export async function runCalculatedFieldMismatchErrorScenario(
  page: Page,
  mode: CurrencyMode,
  target: CalculatedFieldMismatchTarget
) {
  const { filePath, invoiceNumber } = await generatePatchedCalculatedFieldWorkbook(
    mode,
    target,
    CALCULATED_FIELD_MISMATCH_DELTA
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
  target: CalculatedFieldToleranceTarget
) {
  const { filePath } = await generatePatchedCalculatedFieldWorkbook(
    mode,
    target,
    target.tolerance
  );
  await uploadAndVerify(page, filePath);
}

/**
 * Conditional-matrix pattern: difference just outside residual tolerance → error file.
 */
export async function runCalculatedFieldOutsideToleranceErrorScenario(
  page: Page,
  mode: CurrencyMode,
  target: CalculatedFieldToleranceTarget
) {
  const outsideDelta = target.tolerance + target.tolerance;
  const { filePath, invoiceNumber } = await generatePatchedCalculatedFieldWorkbook(
    mode,
    target,
    outsideDelta
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
    taxExemptionReasonCode: "Qualifying Food Items",
  },
  {
    ruleId: "ALIGNED-IBRP-E-09-OM / IBR-039-OM",
    shortName: "Exempt from tax",
    taxCategory: "Exempt from tax",
    taxRate: null,
    taxExemptionReasonCode: "Qualifying Financial Services",
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
  categoryCase: ZeroLineVatCategoryCase
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
  const { filePath, invoiceNumber } = await generateFormulaWorkbook(row, mode);
  patchInvoiceDataCellInFile(filePath, "Line Item VAT Amount", 1);
  await runErrorValidation(page, {
    filePath,
    field: "Line Item VAT Amount",
    invoiceNumber,
    checkEdit: true,
  });
}

export async function runNegativeFormulaScenario(
  page: Page,
  mode: CurrencyMode,
  row: FormulaScenarioRow
) {
  if (!row.errorField) {
    throw new Error(`Negative row "${row.name}" is missing errorField`);
  }

  const { filePath, invoiceNumber } = await generateFormulaWorkbook(
    row as FormulaDataRow,
    mode
  );
  await runErrorValidation(page, {
    filePath,
    field: row.errorField,
    invoiceNumber,
    checkEdit: true,
  });
}
