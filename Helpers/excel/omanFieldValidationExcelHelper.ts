/**
 * Runtime field-validation Excel: full Oman seed (same as testcase packs), then
 * current worker seller + buyer identity, then patch one target field.
 */
import * as FV from "../../testData/FieldValidations";
import type {
  PartyIdentifierCompanion,
  PartyIdentifierParty,
} from "../../testData/FieldValidations/partyIdentifierCompanionLength";
import {
  applyDependentOverlay,
  applyPaidAmountPrepaymentCompanions,
  applyTaxExemptionReasonDocumentCompanions,
  buildOmanDropdownBaseRow,
  resolveDropdownTemplateField,
  OMAN_BUYER_ELECTRONIC,
  OMAN_BUYER_VAT,
  type TaxExemptionVatContext,
} from "./fieldValidationExcelPackHelper";
import {
  applyOmanDeliveryOverlay,
  applyPartyIdentifiersByTxnType,
  buildValidOmanFullTaxInvoiceRow,
  isOmanDeliveryField,
  OMAN_DELIVERY_FIELD_KEYS,
  applyServiceTypeDropdownValidationContext,
} from "./conditionalValidationHelper";
import { randomAlphaNumeric } from "./fieldValidationHelper";
import { applyParallelWorkerIdentityToSubmitRow } from "../worker/parallelWorkerSubmitIdentity";
import { isSimplifiedTemplateEnv } from "./simplifiedTemplateContext";
import {
  buyerSellerIdentifierCodeValidTestData,
  omanCountrySubdivisionValidTestData,
  profitMarginItemTypeValidTestData,
  schemeIdentifierValidTestData,
} from "../../testData/Master";
import {
  generateDistinctSubmitInvoices,
  generateFullRowDropdownFieldExcel,
  generateInvoiceFromSubmitData,
  INVOICE_TEMPLATE_DATA_ROW,
  patchInvoiceTextCellInFile,
  patchInvoiceTextCellsInFile,
  readInvoiceTextCellFromFile,
} from "../../utils/excel/invoiceExcel";
import {
  formatOmanNumericBoundaryValue,
  type FieldLengthRule,
  type FieldNumericRule,
} from "../../testData/FieldValidations/Min_max_field_validation";

function lengthValue(length: number): string {
  if (length === 0) return "";
  if (length === -1) return " ";
  if (length === -2) return FV.WHITESPACE_ONLY_FIELD_VALUE;
  return randomAlphaNumeric(length);
}

/** @deprecated Use `formatOmanNumericBoundaryValue` from Min_max_field_validation. */
export function formatNumericDigitCount(digitCount: number, decimals = 2): string {
  return formatOmanNumericBoundaryValue(digitCount, decimals);
}

function toLocalDateOnlyString(value: Date): string {
  const yyyy = value.getFullYear();
  const mm = String(value.getMonth() + 1).padStart(2, "0");
  const dd = String(value.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatIssueDateValue(
  issueDateValue: Date | string | number,
  issueDateFormat: string
): string {
  if (!(issueDateValue instanceof Date)) {
    return String(issueDateValue);
  }
  const ymd = toLocalDateOnlyString(issueDateValue);
  if (issueDateFormat === "dd-mm-yyyy") {
    const [y, m, d] = ymd.split("-");
    return `${d}-${m}-${y}`;
  }
  return ymd;
}

const BUYER_VAT_FIELD = "Buyer VAT identifier";
const BUYER_EL_FIELD = "Buyer electronic address";

function withRuntimeBuyerIdentity<T extends Record<string, string>>(row: T): T {
  if (isSimplifiedTemplateEnv()) {
    return row;
  }
  return {
    ...row,
    [BUYER_VAT_FIELD]: OMAN_BUYER_VAT,
    [BUYER_EL_FIELD]: OMAN_BUYER_ELECTRONIC,
  };
}

function patchRuntimeBuyerIdentity(filePath: string, field: string): void {
  if (isSimplifiedTemplateEnv()) {
    return;
  }
  if (field !== BUYER_VAT_FIELD) {
    patchInvoiceTextCellInFile(filePath, BUYER_VAT_FIELD, OMAN_BUYER_VAT);
  }
  if (field !== BUYER_EL_FIELD) {
    patchInvoiceTextCellInFile(filePath, BUYER_EL_FIELD, OMAN_BUYER_ELECTRONIC);
  }
}

const BUYER_SCHEME_FIELD = "Scheme identifier";
const BUYER_CODE_FIELD = "Buyer Identifier (textual code)";
const BUYER_IDENTIFIER_FIELD = "Buyer identifier";

const SELLER_SCHEME_FIELD = "Seller identifier - Scheme identifier";
const SELLER_CODE_FIELD = "Seller Identifier (textual code)";
const SELLER_IDENTIFIER_FIELD = "Seller identifier";

function masterLabel(
  list: readonly { label: string }[] | undefined,
  match: string,
  fallback: string
): string {
  const hit = list?.find((x) =>
    x.label.toLowerCase().includes(match.toLowerCase())
  );
  const fromHit = hit?.label?.trim();
  if (fromHit) return fromHit;
  const first = list?.[0]?.label?.trim();
  return first || fallback;
}

function buildOmanDropdownRuntimeBaseRow(field: string): Record<string, string> {
  const packBase = buildOmanDropdownBaseRow(field);
  return withRuntimeBuyerIdentity(applyParallelWorkerIdentityToSubmitRow(packBase));
}

function dropdownValueLabel(item: unknown): string {
  if (typeof item === "string" || typeof item === "number") return String(item);
  if (item && typeof item === "object") {
    const rec = item as { label?: unknown; value?: unknown };
    return String(rec.label ?? rec.value ?? "");
  }
  return "";
}

function asStringRow(
  row: Record<string, string | null | undefined>
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(row)) {
    out[key] = value == null ? "" : String(value);
  }
  return out;
}

function isInvoiceTransactionTypeCodeField(field: string): boolean {
  return (
    field.replace(/\s+/g, " ").trim().toLowerCase() ===
    "invoice transaction type code"
  );
}

function isInvoiceTypeCodeField(field: string): boolean {
  return (
    field.replace(/\s+/g, " ").trim().toLowerCase() === "invoice type code"
  );
}

function isTaxCategoryField(field: string): boolean {
  return field.replace(/\s+/g, " ").trim().toLowerCase() === "tax category";
}

function isInvoiceCurrencyCodeField(field: string): boolean {
  return (
    field.replace(/\s+/g, " ").trim().toLowerCase() ===
    FV.INVOICE_CURRENCY_CODE_FIELD.toLowerCase()
  );
}

function isOmanHomeCurrency(value: string): boolean {
  const n = value.replace(/\s+/g, " ").trim().toLowerCase();
  return n === "omr" || n === "rial omani";
}

/**
 * Companion columns for Invoice Currency Code dropdown rows:
 * - OMR / Rial Omani → Currency Exchange Rate blank (IBR-172-OM)
 * - any other allowed code/name → Currency Exchange Rate 0.385 (IBR-004-OM)
 * Source currency stays OMR (tax accounting currency).
 */
function applyInvoiceCurrencyDropdownColumns(
  seed: Record<string, string>,
  invoiceCurrency: string
): Record<string, string> {
  const isOmr = isOmanHomeCurrency(invoiceCurrency);
  return asStringRow({
    ...seed,
    [FV.INVOICE_CURRENCY_CODE_FIELD]: invoiceCurrency,
    [FV.SOURCE_CURRENCY_CODE_FIELD]:
      seed[FV.SOURCE_CURRENCY_CODE_FIELD] || FV.OMAN_CURRENCY_OMR,
    [FV.EXCHANGE_RATE_FIELD]: isOmr ? "" : "0.385",
  });
}

function taxCategoryKey(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

/**
 * Companion columns for Tax Category dropdown master rows:
 * - Standard rate → Tax Rate 5, no exemption reason
 * - Zero rated → Tax Rate 0 + Zero-rated exemption code/text + document
 *   charges/allowances VAT + Tax exemption reason - charges/allowances
 * - Exempt from tax → Tax Rate omitted + Exemption-* reason code/text
 *   + the same document charges/allowances companions
 * - Not subject to tax → Tax Rate omitted, no exemption reason,
 *   Line Item VAT Amount 0 (must not keep Full Tax seed 50 / Total 1050)
 * Exempt / not-subject lines also use Invoice out of scope of tax
 * (Commercial invoice cannot contain only E/O lines).
 */
function applyTaxCategoryDropdownColumns(
  seed: Record<string, string>,
  taxCategory: string
): Record<string, string | null> {
  const row: Record<string, string | null> = {
    ...seed,
    [FV.TAX_CATEGORY_FIELD]: taxCategory,
  };
  const cat = taxCategoryKey(taxCategory);
  const isStandard = cat === "standard rate" || cat === "standard rate.";
  const isZero = cat === taxCategoryKey(FV.ZERO_RATED_TAX_CATEGORY_CODE);
  const isExempt = cat === taxCategoryKey(FV.EXEMPT_FROM_TAX_TAX_CATEGORY_CODE);
  const isNotSubject =
    cat === taxCategoryKey(FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE) ||
    cat.includes("not subject");

  if (isStandard) {
    row[FV.INVOICED_ITEM_TAX_RATE_FIELD] = FV.TAX_RATE_STANDARD_OMAN;
    row[FV.TAX_EXEMPTION_REASON_CODE_FIELD] = "";
    row[FV.TAX_EXEMPTION_REASON_TEXT_FIELD] = "";
    row[FV.TAX_EXEMPTION_REASON_CHARGES_FIELD] = "";
    row[FV.TAX_EXEMPTION_REASON_ALLOWANCES_FIELD] = "";
    return row;
  }
  if (isZero) {
    const next = applyTaxExemptionReasonDocumentCompanions(
      asStringRow(row),
      "zero"
    );
    next[FV.TAX_CATEGORY_FIELD] = taxCategory;
    return next;
  }
  if (isExempt) {
    const next = applyTaxExemptionReasonDocumentCompanions(
      asStringRow(row),
      "exempt"
    );
    next[FV.TAX_CATEGORY_FIELD] = taxCategory;
    next[FV.INVOICED_ITEM_TAX_RATE_FIELD] = "";
    return next;
  }
  if (isNotSubject) {
    row[FV.INVOICE_TYPE_CODE_FIELD] =
      FV.INVOICE_TYPE_CODE_INVOICE_OUT_OF_SCOPE_OF_TAX;
    row[FV.INVOICED_ITEM_TAX_RATE_FIELD] = null;
    row[FV.TAX_EXEMPTION_REASON_CODE_FIELD] = "";
    row[FV.TAX_EXEMPTION_REASON_TEXT_FIELD] = "";
    // Companion patch after generateDistinctSubmitInvoices rewrites Line Item VAT
    // from this object — must not keep Full Tax seed "50" (Total stays calc'd net).
    row[FV.LINE_ITEM_VAT_AMOUNT_FIELD] = "0";
  }
  return row;
}

function specialZoneSubdivisionLabel(): string {
  const hit = omanCountrySubdivisionValidTestData.find((x) =>
    x.label.toLowerCase().includes("sohar")
  );
  return hit?.label?.trim() || "Sohar Free Zone.";
}

function profitMarginItemTypeLabel(): string {
  return (
    profitMarginItemTypeValidTestData[0]?.label?.trim() ||
    "Tangible Movable Property"
  );
}

/**
 * Fill companion columns required by each Invoice Transaction Type Code so a
 * dropdown master sweep is a valid Oman invoice for that type (not a Full Tax clone).
 */
export function applyInvoiceTransactionTypeDropdownColumns(
  seed: Record<string, string>,
  txn: string
): Record<string, string> {
  let row: Record<string, string | null> = {
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]: txn,
  };

  if (txn === FV.TXN_IMPORT_OF_GOODS) {
    row["Import date"] = row["Import date"] || "2026-06-15";
    row["Customs Declaration number"] =
      row["Customs Declaration number"] || "CUST-OMN-001";
    row["Incoterms"] = row["Incoterms"] || "Cost, Insurance, and Freight";
    row[FV.ITEM_TYPE_FIELD] = FV.ITEM_TYPE_GOODS;
    row[FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD] = FV.OMAN_HS_CODE_12;
    row[FV.ITEM_COUNTRY_OF_ORIGIN_FIELD] =
      row[FV.ITEM_COUNTRY_OF_ORIGIN_FIELD] || FV.UAE_COUNTRY_CODE;
  } else if (txn === FV.TXN_EXPORT_INVOICE) {
    row[FV.TAX_CATEGORY_FIELD] = FV.ZERO_RATED_TAX_CATEGORY_CODE;
    row[FV.INVOICED_ITEM_TAX_RATE_FIELD] = FV.TAX_RATE_ZERO;
    row[FV.TAX_EXEMPTION_REASON_CODE_FIELD] =
      FV.TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE;
    row[FV.TAX_EXEMPTION_REASON_TEXT_FIELD] =
      FV.TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE;
    row = applyOmanDeliveryOverlay(row, "export");
  } else if (txn === FV.TXN_THIRD_PARTY_INVOICE) {
    row["Third Party Name"] = row["Third Party Name"] || "Oman Third Party LLC";
    row["Third Party VATIN"] =
      row["Third Party VATIN"] || FV.IBR_003_VALID_THIRD_PARTY_VATIN;
    row["Third Party Address Line 1"] =
      row["Third Party Address Line 1"] || "TP Building 1";
    row["Third Party Address Line 2"] =
      row["Third Party Address Line 2"] || "TP Street";
    row["Third Party Address Line 3"] =
      row["Third Party Address Line 3"] || "TP Area";
    row["Third Party City"] = row["Third Party City"] || "Muscat";
    row["Third Party Postal Code - PO Box Number"] =
      row["Third Party Postal Code - PO Box Number"] || "100";
    row["Third Party Country Code"] =
      row["Third Party Country Code"] || FV.OMAN_COUNTRY_CODE;
  } else if (txn === FV.TXN_PREPAYMENT_INVOICE) {
    row["Prepayment invoice number"] =
      row["Prepayment invoice number"] || "PRE-OMN-001";
    row["Prepayment invoice UUID"] =
      row["Prepayment invoice UUID"] || "prepay-uuid-oman-001";
  } else if (
    txn === FV.TXN_SUMMARY_INVOICE ||
    txn === FV.TXN_CONTINUOUS_SUPPLY
  ) {
    row["Invoicing period start date"] =
      row["Invoicing period start date"] || "2026-01-01";
    row["Invoicing period end date"] =
      row["Invoicing period end date"] || "2026-01-31";
  } else if (
    txn === FV.TXN_PROFIT_MARGIN_INVOICE ||
    txn === FV.TXN_PROFIT_MARGIN_SELF_INVOICE
  ) {
    row[FV.TAX_CATEGORY_FIELD] = FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE;
    row[FV.INVOICED_ITEM_TAX_RATE_FIELD] = "";
    row[FV.TAX_EXEMPTION_REASON_CODE_FIELD] = "";
    row[FV.TAX_EXEMPTION_REASON_TEXT_FIELD] = "";
    row["Profit margin item type code"] =
      row["Profit margin item type code"] || profitMarginItemTypeLabel();
    if (txn === FV.TXN_PROFIT_MARGIN_INVOICE) {
      row[FV.PRECEDING_INVOICE_REFERENCE_FIELD] =
        row[FV.PRECEDING_INVOICE_REFERENCE_FIELD] || "PREV-OMN-001";
      row[FV.PRECEDING_INVOICE_UUID_FIELD] =
        row[FV.PRECEDING_INVOICE_UUID_FIELD] || FV.PRECEDING_INVOICE_UUID_SAMPLE;
      row[FV.PRECEDING_INVOICE_ISSUE_DATE_FIELD] =
        row[FV.PRECEDING_INVOICE_ISSUE_DATE_FIELD] || "2026-06-01";
    }
  } else if (txn === FV.TXN_SELF_BILLED_INVOICE) {
    row[FV.INVOICE_TYPE_CODE_FIELD] = FV.INVOICE_TYPE_SELF_BILLED_INVOICE;
  } else if (txn === FV.TXN_SIMPLIFIED_TAX_INVOICE) {
    row[FV.ITEM_TYPE_FIELD] = "";
    row[FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD] = "";
    row[FV.INDUSTRIAL_CLASSIFICATION_CODE_FIELD] = "";
  } else if (txn === FV.TXN_IMPORT_OF_SERVICES_RCM) {
    row[FV.SELLER_COUNTRY_CODE_FIELD] = FV.UAE_COUNTRY_CODE;
    row[FV.ITEM_TYPE_FIELD] = FV.ITEM_TYPE_SERVICES;
    row[FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD] = "";
  } else if (txn === FV.TXN_ECOMMERCE_TRANSACTION) {
    row = applyOmanDeliveryOverlay(row, "domestic");
  } else if (txn === FV.TXN_SPECIAL_ZONE_SUPPLIES) {
    const subdivision = specialZoneSubdivisionLabel();
    row["Seller country subdivision code"] = subdivision;
    row["Buyer country subdivision code"] = subdivision;
  }

  return asStringRow(applyPartyIdentifiersByTxnType(row));
}

function fillCreditDebitNoteCompanions(row: Record<string, string>): void {
  row[FV.CREDIT_DEBIT_NOTE_REASON_CODE_FIELD] =
    row[FV.CREDIT_DEBIT_NOTE_REASON_CODE_FIELD] || FV.CREDIT_DEBIT_REASON_SAMPLE;
  row[FV.PRECEDING_INVOICE_REFERENCE_FIELD] =
    row[FV.PRECEDING_INVOICE_REFERENCE_FIELD] || "PREV-OMN-001";
  row[FV.PRECEDING_INVOICE_ISSUE_DATE_FIELD] =
    row[FV.PRECEDING_INVOICE_ISSUE_DATE_FIELD] || "2026-06-01";
  row[FV.PRECEDING_INVOICE_UUID_FIELD] =
    row[FV.PRECEDING_INVOICE_UUID_FIELD] || FV.PRECEDING_INVOICE_UUID_SAMPLE;
}

/**
 * Invoice Type Code dropdown sweep companions:
 * - IBR-177-OM: 261 / 389 must use an allowed self-bill txn (Self-billed Invoice,
 *   Import of Services (RCM), Profit Margin Self-Invoice, or Import of Goods).
 *   Sweep uses Self-billed Invoice (simplest valid companions).
 * - IBR-023-OM: 381 / 383 / 261 must provide Credit note or Debit Note reason code.
 *   IBR-032-OM preceding-invoice fields are filled so the valid workbook is accepted.
 */
function applyInvoiceTypeCodeDropdownColumns(
  seed: Record<string, string>,
  invoiceType: string
): Record<string, string> {
  const isSelfBilledDocument =
    invoiceType === FV.INVOICE_TYPE_SELF_BILLED_CREDIT_NOTE ||
    invoiceType === FV.INVOICE_TYPE_SELF_BILLED_INVOICE;
  const needsCreditDebitReason =
    invoiceType === FV.INVOICE_TYPE_CREDIT_NOTE ||
    invoiceType === FV.INVOICE_TYPE_DEBIT_NOTE ||
    invoiceType === FV.INVOICE_TYPE_SELF_BILLED_CREDIT_NOTE;

  let row: Record<string, string> = {
    ...seed,
    [FV.INVOICE_TYPE_CODE_FIELD]: invoiceType,
  };

  if (isSelfBilledDocument) {
    row = applyInvoiceTransactionTypeDropdownColumns(
      row,
      FV.TXN_SELF_BILLED_INVOICE
    );
    // Txn overlay sets type 389 for Self-billed Invoice; restore 261 when needed.
    row[FV.INVOICE_TYPE_CODE_FIELD] = invoiceType;
  }

  if (needsCreditDebitReason) {
    fillCreditDebitNoteCompanions(row);
  } else if (invoiceType === FV.INVOICE_TYPE_SELF_BILLED_INVOICE) {
    row[FV.CREDIT_DEBIT_NOTE_REASON_CODE_FIELD] = "";
    row[FV.PRECEDING_INVOICE_REFERENCE_FIELD] = "";
    row[FV.PRECEDING_INVOICE_ISSUE_DATE_FIELD] = "";
    row[FV.PRECEDING_INVOICE_UUID_FIELD] = "";
  }

  return asStringRow(applyPartyIdentifiersByTxnType(row));
}

export type DropdownWriteCasing = "exact" | "lower" | "upper";

function applyDropdownWriteCasing(
  label: string,
  casing: DropdownWriteCasing
): string {
  if (casing === "lower") return label.toLowerCase();
  if (casing === "upper") return label.toUpperCase();
  return label;
}

/**
 * Dropdown master / invalid batches — same pipeline as TestData dropdown packs
 * (`buildOmanDropdownBaseRow` + `generateFullRowDropdownFieldExcel`), with worker
 * TIN identity layered on for parallel Playwright runs.
 *
 * Invoice Transaction Type Code builds one full invoice row per master label with
 * type-specific companion columns (import, export, period, third party, …).
 *
 * Invoice Type Code builds one full invoice row per master label with IBR-177
 * txn + IBR-023/032 credit-note companions where those types require them.
 *
 * Tax Category builds one full invoice row per master label with matching
 * Tax Rate (5 / 0 / omitted) and Tax exemption reason code for Exempt / Zero.
 *
 * Invoice Currency Code pairs Currency Exchange Rate on every row (blank for
 * OMR / Rial Omani, 0.385 otherwise).
 *
 * Invalid (single-value) cases for other fields use the min/max path: one workbook,
 * invalid label written on the target column. Do not build a valid seed plus a
 * second batch file.
 */
export async function generateOmanDropdownMasterExcel(
  field: string,
  masterData: unknown[] | unknown,
  options?: {
    writeCasing?: DropdownWriteCasing;
    vatContext?: TaxExemptionVatContext;
    batchSize?: number;
  }
): Promise<Array<{ filePath: string; invoiceNumber: string }>> {
  const values = Array.isArray(masterData) ? masterData : [masterData];
  const fieldForWrite = resolveDropdownTemplateField(field);
  const originalLabels = values.map(dropdownValueLabel);
  const writeCasing = options?.writeCasing ?? "exact";
  const labels = originalLabels.map((label) =>
    applyDropdownWriteCasing(label, writeCasing)
  );
  const baseRow = buildOmanDropdownRuntimeBaseRow(field);
  if (options?.vatContext) {
    applyTaxExemptionReasonDocumentCompanions(baseRow, options.vatContext);
  }

  const perRowTxnType =
    isInvoiceTransactionTypeCodeField(field) ||
    isInvoiceTransactionTypeCodeField(fieldForWrite);
  const perRowInvoiceType =
    isInvoiceTypeCodeField(field) || isInvoiceTypeCodeField(fieldForWrite);
  const perRowTaxCategory =
    isTaxCategoryField(field) || isTaxCategoryField(fieldForWrite);
  const perRowInvoiceCurrency =
    isInvoiceCurrencyCodeField(field) ||
    isInvoiceCurrencyCodeField(fieldForWrite);

  if (perRowInvoiceCurrency) {
    const files = await generateFullRowDropdownFieldExcel(
      fieldForWrite,
      originalLabels.map((label) => ({ label })),
      baseRow
    );
    let labelOffset = 0;
    for (const file of files) {
      const patches: Array<{ header: string; value: string; dataRow: number }> =
        [];
      // One data row per remaining label, starting at template row 6.
      const remainingOriginal = originalLabels.slice(labelOffset);
      const remainingWritten = labels.slice(labelOffset);
      for (let i = 0; i < remainingOriginal.length; i++) {
        const original = remainingOriginal[i];
        const written = remainingWritten[i];
        const dataRow = INVOICE_TEMPLATE_DATA_ROW + i;
        const companions = applyInvoiceCurrencyDropdownColumns(
          { ...baseRow },
          original
        );
        patches.push({ header: fieldForWrite, value: written, dataRow });
        const fx = String(companions[FV.EXCHANGE_RATE_FIELD] ?? "").trim();
        // OMR / Rial Omani: leave exchange rate unset (IBR-172-OM). Do not write "".
        if (fx) {
          patches.push({
            header: FV.EXCHANGE_RATE_FIELD,
            value: fx,
            dataRow,
          });
        }
      }
      patchInvoiceTextCellsInFile(file.filePath, patches);
      labelOffset += remainingOriginal.length;
    }
    return files;
  }

  if (perRowTxnType || perRowInvoiceType || perRowTaxCategory) {
    const rows = originalLabels.map((original, i) => {
      const row = perRowInvoiceType
        ? applyInvoiceTypeCodeDropdownColumns({ ...baseRow }, original)
        : perRowTxnType
          ? applyInvoiceTransactionTypeDropdownColumns({ ...baseRow }, original)
          : applyTaxCategoryDropdownColumns({ ...baseRow }, original);
      row[fieldForWrite] = labels[i];
      return row;
    });
    const fileNamePrefix = perRowInvoiceType
      ? "invoice-type"
      : perRowTxnType
        ? "txn-type"
        : "tax-category";
    const generated = await generateDistinctSubmitInvoices(rows, {
      fileName: `${fileNamePrefix}-dropdown-${Date.now()}.xlsx`,
    });
    const patches: Array<{ header: string; value: string; dataRow: number }> =
      [];
    for (let i = 0; i < labels.length; i++) {
      const dataRow = INVOICE_TEMPLATE_DATA_ROW + i;
      patches.push({ header: fieldForWrite, value: labels[i], dataRow });
      if (!perRowTaxCategory) continue;
      const companions = applyTaxCategoryDropdownColumns(
        { ...baseRow },
        originalLabels[i]
      );
      const rate = companions[FV.INVOICED_ITEM_TAX_RATE_FIELD];
      if (rate != null && String(rate).trim() !== "") {
        patches.push({
          header: FV.INVOICED_ITEM_TAX_RATE_FIELD,
          value: String(rate),
          dataRow,
        });
      }
      patches.push({
        header: FV.TAX_EXEMPTION_REASON_CODE_FIELD,
        value: String(companions[FV.TAX_EXEMPTION_REASON_CODE_FIELD] ?? ""),
        dataRow,
      });
      patches.push({
        header: FV.TAX_EXEMPTION_REASON_TEXT_FIELD,
        value: String(companions[FV.TAX_EXEMPTION_REASON_TEXT_FIELD] ?? ""),
        dataRow,
      });
      const invoiceType = companions[FV.INVOICE_TYPE_CODE_FIELD];
      if (invoiceType) {
        patches.push({
          header: FV.INVOICE_TYPE_CODE_FIELD,
          value: invoiceType,
          dataRow,
        });
      }
      const lineVat = companions[FV.LINE_ITEM_VAT_AMOUNT_FIELD];
      if (lineVat != null && String(lineVat).trim() !== "") {
        patches.push({
          header: FV.LINE_ITEM_VAT_AMOUNT_FIELD,
          value: String(lineVat),
          dataRow,
        });
        // Zero / Exempt / Not subject force VAT 0; keep BTOM-017 = line net after this patch.
        if (String(lineVat).trim() === "0") {
          const lineNet = String(
            companions["Invoice line net amount"] ??
              companions["Item net price"] ??
              ""
          ).trim();
          if (lineNet) {
            patches.push({
              header: "Total amount including VAT",
              value: lineNet,
              dataRow,
            });
          }
        }
      }
      for (const header of [
        FV.CHARGES_ON_DOCUMENT_LEVEL_FIELD,
        FV.ALLOWANCES_ON_DOCUMENT_LEVEL_FIELD,
        FV.VAT_CATEGORY_CHARGES_FIELD,
        FV.VAT_CATEGORY_ALLOWANCES_FIELD,
        FV.TAX_EXEMPTION_REASON_CHARGES_FIELD,
        FV.TAX_EXEMPTION_REASON_ALLOWANCES_FIELD,
      ]) {
        const value = companions[header];
        if (value == null) continue;
        patches.push({ header, value: String(value), dataRow });
      }
    }
    patchInvoiceTextCellsInFile(generated.filePath, patches);
    if (labels.length === 1) {
      const saved = readInvoiceTextCellFromFile(
        generated.filePath,
        fieldForWrite
      );
      if (saved.value !== labels[0]) {
        throw new Error(
          `Dropdown Excel did not keep invalid value for ${fieldForWrite}: ` +
            `saved ${JSON.stringify(saved.value)} expected ${JSON.stringify(labels[0])}`
        );
      }
    }
    return [
      {
        filePath: generated.filePath,
        invoiceNumber: generated.invoiceNumbers[0],
      },
    ];
  }

  if (labels.length === 1) {
    baseRow[fieldForWrite] = labels[0];
    const generated = await generateInvoiceFromSubmitData(baseRow);
    patchInvoiceTextCellInFile(generated.filePath, fieldForWrite, labels[0]);
    const saved = readInvoiceTextCellFromFile(generated.filePath, fieldForWrite);
    if (saved.value !== labels[0]) {
      throw new Error(
        `Dropdown Excel did not keep invalid value for ${fieldForWrite}: ` +
          `saved ${JSON.stringify(saved.value)} expected ${JSON.stringify(labels[0])}`
      );
    }
    return [generated];
  }

  return generateFullRowDropdownFieldExcel(
    fieldForWrite,
    labels.map((label) => ({ label })),
    baseRow,
    { batchSize: options?.batchSize }
  );
}

/**
 * Full Oman row + worker seller TIN + Oman buyer. The value under test is applied
 * on the row before generate so formula inputs (discount, qty, charges, …) are
 * included in totals; then patched again so identity/writer cannot overwrite it.
 * Calculated outputs are overwritten during generate and restored by that patch.
 */
export async function generateOmanSeededFieldExcel(
  field: string,
  value: string,
  options?: { skipDependentOverlay?: boolean }
): Promise<{ filePath: string; invoiceNumber: string }> {
  const seed = buildValidOmanFullTaxInvoiceRow();
  const isServiceTypeCodeField =
    field.replace(/\s+/g, " ").trim().toLowerCase() ===
    FV.SERVICE_TYPE_CODE_FIELD.toLowerCase();
  let overlaid: Record<string, string>;
  if (isServiceTypeCodeField) {
    // IBR-155-OM: Export invoice + Export of Services + full delivery/supporting docs.
    overlaid = applyServiceTypeDropdownValidationContext(seed, {
      serviceTypeCode: value,
    });
  } else {
    overlaid = options?.skipDependentOverlay
      ? seed
      : applyDependentOverlay("", field, seed);
  }
  const identified = withRuntimeBuyerIdentity(
    applyParallelWorkerIdentityToSubmitRow(overlaid)
  );
  identified[field] = value;
  const prepaidCompanions = applyPaidAmountPrepaymentCompanions(
    identified,
    field,
    value
  );
  const generated = await generateInvoiceFromSubmitData(identified);
  patchRuntimeBuyerIdentity(generated.filePath, field);
  patchInvoiceTextCellInFile(generated.filePath, field, value);
  for (const companion of prepaidCompanions) {
    if (companion !== field) {
      patchInvoiceTextCellInFile(
        generated.filePath,
        companion,
        identified[companion]
      );
    }
  }
  const invoiceNumber = field === "Invoice Number" ? value : generated.invoiceNumber;
  return { filePath: generated.filePath, invoiceNumber };
}

/**
 * Exempt-from-tax line with explicit reason code + text (IBG-30 interdependency).
 * Overlay sets Tax Category = Exempt from tax; both cells are patched afterward.
 */
export async function generateOmanExemptReasonExcel(
  reasonCode: string,
  reasonText: string
): Promise<{ filePath: string; invoiceNumber: string }> {
  const generated = await generateOmanSeededFieldExcel(
    FV.TAX_EXEMPTION_REASON_TEXT_FIELD,
    reasonText
  );
  patchInvoiceTextCellInFile(
    generated.filePath,
    FV.TAX_EXEMPTION_REASON_CODE_FIELD,
    reasonCode
  );
  patchInvoiceTextCellInFile(
    generated.filePath,
    FV.TAX_EXEMPTION_REASON_TEXT_FIELD,
    reasonText
  );
  return generated;
}

const PREPAY_NUMBER_FIELD = "Prepayment invoice number";

/**
 * Buyer/Seller identifier length with scheme/code companions
 * (none, scheme, code, or both).
 */
export async function generateOmanPartyIdentifierLengthExcel(opts: {
  party: PartyIdentifierParty;
  companion: PartyIdentifierCompanion;
  length: number;
}): Promise<{ filePath: string; invoiceNumber: string }> {
  const identifierField =
    opts.party === "buyer" ? BUYER_IDENTIFIER_FIELD : SELLER_IDENTIFIER_FIELD;
  const schemeField =
    opts.party === "buyer" ? BUYER_SCHEME_FIELD : SELLER_SCHEME_FIELD;
  const codeField =
    opts.party === "buyer" ? BUYER_CODE_FIELD : SELLER_CODE_FIELD;

  const schemeLabel = masterLabel(
    schemeIdentifierValidTestData,
    "Oman Value Added Tax",
    masterLabel(schemeIdentifierValidTestData, "Tax Identification", "Organisationsnummer")
  );
  const codeLabel = masterLabel(
    buyerSellerIdentifierCodeValidTestData,
    "Tax Identification",
    "Tax Identification Number"
  );

  let schemeValue = "";
  let codeValue = "";
  if (opts.companion === "scheme" || opts.companion === "both") {
    schemeValue = schemeLabel;
  }
  if (opts.companion === "code" || opts.companion === "both") {
    codeValue = codeLabel;
  }
  const identifierValue = lengthValue(opts.length);

  const generated = await generateOmanSeededFieldExcel(identifierField, identifierValue, {
    skipDependentOverlay: true,
  });
  patchInvoiceTextCellInFile(generated.filePath, schemeField, schemeValue);
  patchInvoiceTextCellInFile(generated.filePath, codeField, codeValue);
  patchInvoiceTextCellInFile(generated.filePath, identifierField, identifierValue);
  return generated;
}

/**
 * CL-06-OM positive pack: multi-row Excel (dropdown-style) — one invoice row per
 * master label on the companion column; XOR clears the other companion; identifier
 * stays set on every cloned row.
 */
export async function generateOmanCl06IdentifierMasterExcel(opts: {
  party: "buyer" | "seller";
  companion: "scheme" | "code";
  companionField: string;
  companionValues: Array<string | { label: string }>;
  identifier: string;
}): Promise<Array<{ filePath: string; invoiceNumber: string }>> {
  const identifierField =
    opts.party === "buyer" ? BUYER_IDENTIFIER_FIELD : SELLER_IDENTIFIER_FIELD;
  const schemeField =
    opts.party === "buyer" ? BUYER_SCHEME_FIELD : SELLER_SCHEME_FIELD;
  const codeField =
    opts.party === "buyer" ? BUYER_CODE_FIELD : SELLER_CODE_FIELD;

  const labels = opts.companionValues.map((item) =>
    typeof item === "string" ? item : item.label
  );
  if (labels.length === 0) {
    throw new Error("generateOmanCl06IdentifierMasterExcel: companionValues empty");
  }

  const seed = buildValidOmanFullTaxInvoiceRow();
  const baseRow = withRuntimeBuyerIdentity(
    applyParallelWorkerIdentityToSubmitRow(seed)
  );
  baseRow[identifierField] = opts.identifier;
  baseRow[schemeField] = opts.companion === "scheme" ? labels[0] : "";
  baseRow[codeField] = opts.companion === "code" ? labels[0] : "";

  return generateFullRowDropdownFieldExcel(
    opts.companionField,
    labels.map((label) => ({ label })),
    baseRow
  );
}

/**
 * CL-06-OM single companion value (used for invalid/negative cases).
 */
export async function generateOmanCl06IdentifierSchemeExcel(opts: {
  party: "buyer" | "seller";
  companion: "scheme" | "code";
  companionValue: string;
  identifier: string;
}): Promise<{ filePath: string; invoiceNumber: string }> {
  const identifierField =
    opts.party === "buyer" ? BUYER_IDENTIFIER_FIELD : SELLER_IDENTIFIER_FIELD;
  const schemeField =
    opts.party === "buyer" ? BUYER_SCHEME_FIELD : SELLER_SCHEME_FIELD;
  const codeField =
    opts.party === "buyer" ? BUYER_CODE_FIELD : SELLER_CODE_FIELD;

  const schemeValue =
    opts.companion === "scheme" ? opts.companionValue : "";
  const codeValue = opts.companion === "code" ? opts.companionValue : "";

  const generated = await generateOmanSeededFieldExcel(
    identifierField,
    opts.identifier,
    { skipDependentOverlay: true }
  );
  patchInvoiceTextCellInFile(generated.filePath, schemeField, schemeValue);
  patchInvoiceTextCellInFile(generated.filePath, codeField, codeValue);
  patchInvoiceTextCellInFile(
    generated.filePath,
    identifierField,
    opts.identifier
  );
  return generated;
}

/** IBR-CO-21: name and value are both-or-neither. Length tests must not leave a dash/empty companion. */
function itemAttributeCompanion(
  field: string
): { field: string; value: string } | null {
  const n = field.replace(/\s+/g, " ").trim().toLowerCase();
  if (n === FV.ITEM_ATTRIBUTE_NAME_FIELD.toLowerCase()) {
    return { field: FV.ITEM_ATTRIBUTE_VALUE_FIELD, value: "Black" };
  }
  if (n === FV.ITEM_ATTRIBUTE_VALUE_FIELD.toLowerCase()) {
    return { field: FV.ITEM_ATTRIBUTE_NAME_FIELD, value: "Color" };
  }
  return null;
}

export async function generateOmanFieldLengthExcel(
  field: string,
  length: number
): Promise<{ filePath: string; invoiceNumber: string }> {
  // Empty prepayment reference is valid in the baseline non-prepayment context.
  // Dedicated prepayment suites cover the transaction-type-required behavior.
  if (field === PREPAY_NUMBER_FIELD && length === 0) {
    return generateOmanSeededFieldExcel(field, "", { skipDependentOverlay: true });
  }
  // Empty customs declaration is valid on Full Tax (no Import date, not Import of Goods).
  // Overlay fillImport() would set both, making empty an IBR-085-OM error
  // (covered by ConditionalValidation IMPORT_OF_GOODS_SCENARIOS).
  if (field === FV.CUSTOMS_DECLARATION_NUMBER_FIELD && length === 0) {
    return generateOmanSeededFieldExcel(field, "", { skipDependentOverlay: true });
  }
  // IBR-079-OM: Goods requires Item classification identifier except Simplified Tax Invoice.
  // Empty (below minimum) is accepted on Simplified; Full Tax + Goods keeps a value (min/max).
  if (field === FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD && length === 0) {
    const generated = await generateOmanSeededFieldExcel(field, "", {
      skipDependentOverlay: true,
    });
    patchInvoiceTextCellInFile(
      generated.filePath,
      FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD,
      FV.TXN_SIMPLIFIED_TAX_INVOICE
    );
    patchInvoiceTextCellInFile(
      generated.filePath,
      FV.ITEM_TYPE_FIELD,
      FV.ITEM_TYPE_GOODS
    );
    patchInvoiceTextCellInFile(generated.filePath, field, "");
    return generated;
  }
  // When testing any deliver-to field empty (below minimum), the overlay
  // populates ALL delivery fields (IBR-040-OM: any one field present → all required).
  // Skip the overlay and clear every delivery field so the entire section is absent.
  if (isOmanDeliveryField(field) && length === 0) {
    const generated = await generateOmanSeededFieldExcel(field, "", { skipDependentOverlay: true });
    for (const df of OMAN_DELIVERY_FIELD_KEYS) {
      patchInvoiceTextCellInFile(generated.filePath, df, "");
    }
    return generated;
  }
  // Empty exemption text is valid on Standard rate. Overlay would switch to
  // Exempt and make empty an error (covered by the Exempt interdependency suite).
  if (field === FV.TAX_EXEMPTION_REASON_TEXT_FIELD && length === 0) {
    return generateOmanSeededFieldExcel(field, "", { skipDependentOverlay: true });
  }
  // Item attribute name/value: empty both is accepted; a non-empty name needs a real
  // value companion (not "-"/blank) and vice versa.
  const attributeCompanion = itemAttributeCompanion(field);
  if (attributeCompanion && length === 0) {
    return generateOmanSeededFieldExcel(field, "", { skipDependentOverlay: true });
  }
  const generated = await generateOmanSeededFieldExcel(field, lengthValue(length));
  if (attributeCompanion && length > 0) {
    patchInvoiceTextCellInFile(
      generated.filePath,
      attributeCompanion.field,
      attributeCompanion.value
    );
  }
  return generated;
}

export async function generateOmanNumericFieldExcel(
  field: string,
  digitCount: number,
  decimals?: number
): Promise<{ filePath: string; invoiceNumber: string }> {
  return generateOmanSeededFieldExcel(
    field,
    formatNumericDigitCount(digitCount, decimals ?? 2)
  );
}

export type OmanAllFieldsBoundaryVariant = "min" | "max";

/**
 * Dummy min/max strings are not valid on these columns (login TIN, IBR format,
 * UUID, tax rate). Dropdowns stay on the Oman seed — they have no char min/max.
 */
const ALL_FIELDS_BOUNDARY_SKIP = new Set([
  "Seller electronic address",
  "Buyer electronic address",
  "Seller VAT Identifier (TRN / TIN)",
  "Buyer VAT identifier",
  "Third Party VATIN",
  "Unique Identifier Number",
  "Prepayment invoice UUID",
  "Supporting document UUID",
  "Tax Rate",
  "Invoice total tax amount in tax accounting currency",
  "Buyer identifier",
  "Seller identifier",
]);

function normBoundaryField(s: string): string {
  return s.replace(/\s+/g, " ").trim().toLowerCase();
}

function dropdownBoundaryFieldNames(): Set<string> {
  const configs = FV.mergeDropdownFieldConfigs(
    FV.dropdownFieldMasterConfig,
    FV.conditionalDropdownFieldMasterConfig
  );
  return new Set(configs.map((c) => normBoundaryField(c.field)));
}

type AllFieldsBoundaryCase = { field: string; value: string };

function allFieldsBoundaryCases(
  variant: OmanAllFieldsBoundaryVariant
): AllFieldsBoundaryCase[] {
  const dropdowns = dropdownBoundaryFieldNames();
  const skip = new Set(
    [...ALL_FIELDS_BOUNDARY_SKIP].map((field) => normBoundaryField(field))
  );
  const seen = new Set<string>();
  const cases: AllFieldsBoundaryCase[] = [];

  const pushLength = (rule: FieldLengthRule) => {
    const key = normBoundaryField(rule.field);
    if (seen.has(key) || skip.has(key) || dropdowns.has(key)) return;
    seen.add(key);
    const length = variant === "min" ? rule.min : rule.max;
    cases.push({ field: rule.field, value: lengthValue(length) });
  };

  const pushNumeric = (rule: FieldNumericRule) => {
    const key = normBoundaryField(rule.field);
    if (seen.has(key) || skip.has(key) || dropdowns.has(key)) return;
    seen.add(key);
    const digits = variant === "min" ? rule.min : rule.max;
    cases.push({
      field: rule.field,
      value: formatOmanNumericBoundaryValue(digits, rule.decimals ?? 2),
    });
  };

  for (const rule of FV.fieldInvoice_number) pushLength(rule);
  for (const rule of FV.fieldValidationMandatory) pushLength(rule);
  for (const rule of FV.fieldValidationOptional) pushLength(rule);
  for (const rule of FV.fieldValidationConditional) pushLength(rule);
  for (const rule of FV.fieldValidationNumeric) pushNumeric(rule);
  return cases;
}

function identifiedBoundarySeedRow(field: string): Record<string, string> {
  const seed = buildValidOmanFullTaxInvoiceRow();
  const overlaid = applyDependentOverlay("", field, seed);
  const identified = withRuntimeBuyerIdentity(
    applyParallelWorkerIdentityToSubmitRow(overlaid)
  );
  return identified;
}

/**
 * One workbook, one invoice row per non-dropdown length/numeric field.
 * Row 1 = Invoice Number at min or max; row 2 = Purchase Order Number; etc.
 * Dropdowns remain valid Oman seed values on every row.
 */
export async function generateOmanAllFieldsBoundaryPackExcel(
  variant: OmanAllFieldsBoundaryVariant
): Promise<{ filePath: string; invoiceNumbers: string[] }> {
  const cases = allFieldsBoundaryCases(variant);
  if (!cases.length) {
    throw new Error("generateOmanAllFieldsBoundaryPackExcel: no boundary fields");
  }

  const rows = cases.map((tc) => {
    const row = identifiedBoundarySeedRow(tc.field);
    row[tc.field] = tc.value;
    applyPaidAmountPrepaymentCompanions(row, tc.field, tc.value);
    return row;
  });

  const generated = await generateDistinctSubmitInvoices(rows, {
    fileName: `all-fields-${variant}-${Date.now()}.xlsx`,
  });

  const patches: Array<{ header: string; value: string; dataRow: number }> = [];
  for (let i = 0; i < cases.length; i++) {
    const dataRow = INVOICE_TEMPLATE_DATA_ROW + i;
    if (!isSimplifiedTemplateEnv()) {
      if (cases[i].field !== BUYER_VAT_FIELD) {
        patches.push({ header: BUYER_VAT_FIELD, value: OMAN_BUYER_VAT, dataRow });
      }
      if (cases[i].field !== BUYER_EL_FIELD) {
        patches.push({
          header: BUYER_EL_FIELD,
          value: OMAN_BUYER_ELECTRONIC,
          dataRow,
        });
      }
    }
    patches.push({ header: cases[i].field, value: cases[i].value, dataRow });
    const prepaidCompanions = applyPaidAmountPrepaymentCompanions(
      rows[i],
      cases[i].field,
      cases[i].value
    );
    for (const companion of prepaidCompanions) {
      if (companion !== cases[i].field) {
        patches.push({
          header: companion,
          value: rows[i][companion],
          dataRow,
        });
      }
    }
  }
  patchInvoiceTextCellsInFile(generated.filePath, patches);

  return { filePath: generated.filePath, invoiceNumbers: generated.invoiceNumbers };
}

export async function generateOmanIssueDateExcel(
  invoiceNumber: string,
  issueDateValue: Date | string | number,
  issueDateFormat: string
): Promise<{ filePath: string; invoiceNumber: string }> {
  const generated = await generateOmanSeededFieldExcel(
    "Invoice Issue Date",
    formatIssueDateValue(issueDateValue, issueDateFormat)
  );
  patchInvoiceTextCellInFile(generated.filePath, "Invoice Number", invoiceNumber);
  return { filePath: generated.filePath, invoiceNumber };
}
