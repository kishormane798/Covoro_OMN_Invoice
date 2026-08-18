/**
 * Approach A — Excel profile from three drivers:
 * Invoice Transaction Type Code, Invoice Type Code, Tax Category.
 *
 * Start from valid Oman Full Tax seed → apply dependents for those drivers →
 * optional fieldOverrides → generateInvoiceFromSubmitData.
 */
import {
  applyCnDnSelfBilledInvoiceType,
  applyOmanDeliveryOverlay,
  applySelfBilledDocumentInvoiceType,
  buildValidOmanFullTaxInvoiceRow,
} from "./conditionalValidationHelper";
import * as FV from "../testData/FieldValidations/ConditionalValidation";
import { generateInvoiceFromSubmitData } from "../utils/invoiceExcel";

export type InvoiceDriverProfile = {
  invoiceTransactionTypeCode: string;
  invoiceTypeCode: string;
  taxCategory: string;
};

/** Default valid drivers (matches Full Tax Oman seed). */
export const DEFAULT_INVOICE_DRIVERS: InvoiceDriverProfile = {
  invoiceTransactionTypeCode: FV.TXN_FULL_TAX_INVOICE,
  invoiceTypeCode: FV.INVOICE_TYPE_COMMERCIAL_INVOICE,
  taxCategory: FV.STANDARD_TAX_CATEGORY_CODE,
};

export type InvoiceDriverFieldOverrides = Record<
  string,
  string | null | undefined
>;

function applyTaxCategoryDependents(
  row: Record<string, string | null>,
  taxCategory: string
): Record<string, string | null> {
  const next: Record<string, string | null> = {
    ...row,
    [FV.TAX_CATEGORY_FIELD]: taxCategory,
    "Vat category - allowances": taxCategory,
    "Vat category - charges": taxCategory,
  };

  if (taxCategory === FV.STANDARD_TAX_CATEGORY_CODE) {
    next[FV.INVOICED_ITEM_TAX_RATE_FIELD] = FV.TAX_RATE_STANDARD_OMAN;
    next[FV.TAX_EXEMPTION_REASON_CODE_FIELD] = "";
    next[FV.TAX_EXEMPTION_REASON_TEXT_FIELD] = "";
    return next;
  }

  if (taxCategory === FV.ZERO_RATED_TAX_CATEGORY_CODE) {
    next[FV.INVOICED_ITEM_TAX_RATE_FIELD] = FV.TAX_RATE_ZERO;
    next[FV.TAX_EXEMPTION_REASON_CODE_FIELD] =
      FV.TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE;
    next[FV.TAX_EXEMPTION_REASON_TEXT_FIELD] =
      FV.TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE;
    return next;
  }

  if (taxCategory === FV.EXEMPT_FROM_TAX_TAX_CATEGORY_CODE) {
    next[FV.INVOICED_ITEM_TAX_RATE_FIELD] = "";
    next[FV.TAX_EXEMPTION_REASON_CODE_FIELD] = FV.TAX_EXEMPTION_REASON_SAMPLE;
    next[FV.TAX_EXEMPTION_REASON_TEXT_FIELD] = FV.TAX_EXEMPTION_REASON_SAMPLE;
    return next;
  }

  if (taxCategory === FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE) {
    next[FV.INVOICED_ITEM_TAX_RATE_FIELD] = "";
    next[FV.TAX_EXEMPTION_REASON_CODE_FIELD] = "";
    next[FV.TAX_EXEMPTION_REASON_TEXT_FIELD] = "";
    return next;
  }

  return next;
}

function applyTransactionTypeDependents(
  row: Record<string, string | null>,
  txn: string
): Record<string, string | null> {
  const next: Record<string, string | null> = {
    ...row,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]: txn,
  };

  if (txn === FV.TXN_IMPORT_OF_GOODS) {
    next["Import date"] = next["Import date"] || "2026-06-15";
    next["Customs Declaration number"] =
      next["Customs Declaration number"] || "CUST-OMN-001";
    next["Incoterms"] = next["Incoterms"] || "Cost, Insurance, and Freight";
    next[FV.ITEM_TYPE_FIELD] = FV.ITEM_TYPE_GOODS;
    next[FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD] = FV.OMAN_HS_CODE_12;
    return next;
  }

  if (txn === FV.TXN_EXPORT_INVOICE) {
    // Valid export profile: Zero-rated line + non-OM delivery sample.
    if (
      !next[FV.TAX_CATEGORY_FIELD] ||
      next[FV.TAX_CATEGORY_FIELD] === FV.STANDARD_TAX_CATEGORY_CODE
    ) {
      Object.assign(
        next,
        applyTaxCategoryDependents(next, FV.ZERO_RATED_TAX_CATEGORY_CODE)
      );
    }
    Object.assign(next, applyOmanDeliveryOverlay(next, "export"));
    return next;
  }

  if (txn === FV.TXN_THIRD_PARTY_INVOICE) {
    next["Third Party Name"] = next["Third Party Name"] || "Oman Third Party LLC";
    next["Third Party VATIN"] = next["Third Party VATIN"] || FV.IBR_003_VALID_THIRD_PARTY_VATIN;
    next["Third Party Address Line 1"] =
      next["Third Party Address Line 1"] || "TP Building 1";
    next["Third Party Address Line 2"] =
      next["Third Party Address Line 2"] || "TP Street";
    next["Third Party Address Line 3"] =
      next["Third Party Address Line 3"] || "TP Area";
    next["Third Party City"] = next["Third Party City"] || "Muscat";
    next["Third Party Postal Code - PO Box Number"] =
      next["Third Party Postal Code - PO Box Number"] || "100";
    next["Third Party Country Code"] =
      next["Third Party Country Code"] || FV.OMAN_COUNTRY_CODE;
    return next;
  }

  if (txn === FV.TXN_PREPAYMENT_INVOICE) {
    next["Prepayment invoice number"] =
      next["Prepayment invoice number"] || "PRE-OMN-001";
    next["Prepayment invoice UUID"] =
      next["Prepayment invoice UUID"] || "prepay-uuid-oman-001";
    return next;
  }

  if (txn === FV.TXN_SUMMARY_INVOICE || txn === FV.TXN_CONTINUOUS_SUPPLY) {
    next["Invoicing period start date"] =
      next["Invoicing period start date"] || "2026-01-01";
    next["Invoicing period end date"] =
      next["Invoicing period end date"] || "2026-01-31";
    return next;
  }

  if (
    txn === FV.TXN_PROFIT_MARGIN_INVOICE ||
    txn === FV.TXN_PROFIT_MARGIN_SELF_INVOICE
  ) {
    Object.assign(
      next,
      applyTaxCategoryDependents(next, FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE)
    );
    return next;
  }

  if (txn === FV.TXN_SELF_BILLED_INVOICE) {
    // Keep caller invoice type; ensure self-billed txn label is set.
    return next;
  }

  return next;
}

function applyInvoiceTypeDependents(
  row: Record<string, string | null>,
  invoiceTypeCode: string
): Record<string, string | null> {
  if (invoiceTypeCode === FV.INVOICE_TYPE_SELF_BILLED_CREDIT_NOTE) {
    return applySelfBilledDocumentInvoiceType(row, invoiceTypeCode);
  }

  if (
    invoiceTypeCode === FV.INVOICE_TYPE_CREDIT_NOTE ||
    invoiceTypeCode === FV.INVOICE_TYPE_DEBIT_NOTE
  ) {
    const withType = applyCnDnSelfBilledInvoiceType(row, invoiceTypeCode);
    return {
      ...withType,
      [FV.CREDIT_DEBIT_NOTE_REASON_CODE_FIELD]:
        withType[FV.CREDIT_DEBIT_NOTE_REASON_CODE_FIELD] ||
        FV.CREDIT_DEBIT_REASON_SAMPLE,
      [FV.PRECEDING_INVOICE_REFERENCE_FIELD]:
        withType[FV.PRECEDING_INVOICE_REFERENCE_FIELD] || "PREV-OMN-001",
      [FV.PRECEDING_INVOICE_ISSUE_DATE_FIELD]:
        withType[FV.PRECEDING_INVOICE_ISSUE_DATE_FIELD] || "2026-06-01",
      [FV.PRECEDING_INVOICE_UUID_FIELD]:
        withType[FV.PRECEDING_INVOICE_UUID_FIELD] ||
        FV.PRECEDING_INVOICE_UUID_SAMPLE,
    };
  }

  if (invoiceTypeCode === FV.INVOICE_TYPE_SELF_BILLED_INVOICE) {
    return applySelfBilledDocumentInvoiceType(row, invoiceTypeCode);
  }

  return {
    ...row,
    [FV.INVOICE_TYPE_CODE_FIELD]: invoiceTypeCode,
  };
}

/**
 * Build a submit-shaped row from the three drivers (+ optional cell overrides).
 * Order: seed → tax → txn → invoice type → overrides (overrides win).
 */
export function buildInvoiceRowFromDrivers(
  drivers: InvoiceDriverProfile,
  fieldOverrides?: InvoiceDriverFieldOverrides
): Record<string, string | null> {
  let row: Record<string, string | null> = {
    ...buildValidOmanFullTaxInvoiceRow(),
  };

  row = applyTaxCategoryDependents(row, drivers.taxCategory);
  row = applyTransactionTypeDependents(
    row,
    drivers.invoiceTransactionTypeCode
  );
  row = applyInvoiceTypeDependents(row, drivers.invoiceTypeCode);

  if (fieldOverrides) {
    for (const [key, value] of Object.entries(fieldOverrides)) {
      row[key] = value === undefined ? null : value;
    }
  }

  return row;
}

/** Generate Excel from driver profile (submit pipeline). */
export async function generateExcelFromDrivers(
  drivers: InvoiceDriverProfile = DEFAULT_INVOICE_DRIVERS,
  fieldOverrides?: InvoiceDriverFieldOverrides
): Promise<{ filePath: string; invoiceNumber: string; row: Record<string, string | null> }> {
  const row = buildInvoiceRowFromDrivers(drivers, fieldOverrides);
  const stringRow: Record<string, string> = {};
  for (const [k, v] of Object.entries(row)) {
    stringRow[k] = v === null || v === undefined ? "" : String(v);
  }
  const { filePath, invoiceNumber } =
    await generateInvoiceFromSubmitData(stringRow);
  return { filePath, invoiceNumber, row };
}
