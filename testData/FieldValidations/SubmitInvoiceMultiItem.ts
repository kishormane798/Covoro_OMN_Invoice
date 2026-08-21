/**
 * Oman submit multi-item matrix (Excel header keys).
 * 32 invoice types × 15 transaction types; each case 4 lines
 * (2 Goods + 2 Services, all 4 Oman tax categories, OMR).
 */
import {
  buildValidOmanFullTaxInvoiceRow,
  applyOmanDeliveryOverlay,
  applyPartyIdentifiersByTxnType,
} from "../../Helpers/conditionalValidationHelper";
import * as FV from "./ConditionalValidation";
import {
  invoiceTypeCodeValidTestData,
  invoiceTransactionTypeValidTestData,
} from "./Master.omnCore";

export type MultiItemSubmitInvoiceCase = {
  name: string;
  rows: Array<Record<string, string>>;
};

function asStringRow(
  row: Record<string, string | null>
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(row)) {
    out[key] = value === null || value === undefined ? "" : String(value);
  }
  return out;
}

export function isCreditOrDebitInvoiceType(invoiceTypeCode: string): boolean {
  const n = invoiceTypeCode.trim().toLowerCase();
  return n.includes("credit note") || n.includes("debit note");
}

type LineDef = {
  lineId: string;
  itemType: string;
  taxCategory: string;
  taxRate: string;
  exemption: string;
  serviceTypeCode: string;
  hsCode: string;
};

const LINE_DEFS: readonly LineDef[] = [
  {
    lineId: "LINE-S-001",
    itemType: FV.ITEM_TYPE_GOODS,
    taxCategory: FV.STANDARD_TAX_CATEGORY_CODE,
    taxRate: FV.TAX_RATE_STANDARD_OMAN,
    exemption: "",
    serviceTypeCode: "",
    hsCode: FV.OMAN_HS_CODE_12,
  },
  {
    lineId: "LINE-S-002",
    itemType: FV.ITEM_TYPE_GOODS,
    taxCategory: FV.ZERO_RATED_TAX_CATEGORY_CODE,
    taxRate: FV.TAX_RATE_ZERO,
    exemption: FV.TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE,
    serviceTypeCode: "",
    hsCode: FV.OMAN_HS_CODE_12,
  },
  {
    lineId: "LINE-S-003",
    itemType: FV.ITEM_TYPE_SERVICES,
    taxCategory: FV.EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
    taxRate: "",
    exemption: FV.TAX_EXEMPTION_REASON_SAMPLE,
    serviceTypeCode: FV.SERVICE_TYPE_CODE_SAMPLE,
    hsCode: "",
  },
  {
    lineId: "LINE-S-004",
    itemType: FV.ITEM_TYPE_SERVICES,
    taxCategory: FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
    taxRate: "",
    exemption: "",
    serviceTypeCode: FV.SERVICE_TYPE_CODE_SAMPLE,
    hsCode: "",
  },
];

function applySubmitTxnExtras(
  row: Record<string, string | null>,
  txn: string
): Record<string, string | null> {
  let next: Record<string, string | null> = {
    ...row,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]: txn,
    [FV.INVOICE_CURRENCY_CODE_FIELD]: FV.OMAN_CURRENCY_OMR,
    [FV.SOURCE_CURRENCY_CODE_FIELD]: FV.OMAN_CURRENCY_OMR,
    [FV.EXCHANGE_RATE_FIELD]: "",
  };

  if (txn === FV.TXN_IMPORT_OF_GOODS) {
    next["Import date"] = next["Import date"] || "2026-06-15";
    next["Customs Declaration number"] =
      next["Customs Declaration number"] || "CUST-OMN-001";
    next["Incoterms"] = next["Incoterms"] || "Cost, Insurance, and Freight";
  }

  if (txn === FV.TXN_EXPORT_INVOICE) {
    next = applyOmanDeliveryOverlay(next, "export");
  }

  if (txn === FV.TXN_THIRD_PARTY_INVOICE) {
    next["Third Party Name"] = next["Third Party Name"] || "Oman Third Party LLC";
    next["Third Party VATIN"] =
      next["Third Party VATIN"] || FV.IBR_003_VALID_THIRD_PARTY_VATIN;
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
  }

  if (txn === FV.TXN_PREPAYMENT_INVOICE) {
    next["Prepayment invoice number"] =
      next["Prepayment invoice number"] || "PRE-OMN-001";
    next["Prepayment invoice UUID"] =
      next["Prepayment invoice UUID"] || FV.PRECEDING_INVOICE_UUID_SAMPLE;
  }

  if (txn === FV.TXN_SUMMARY_INVOICE || txn === FV.TXN_CONTINUOUS_SUPPLY) {
    next["Invoicing period start date"] =
      next["Invoicing period start date"] || "2026-01-01";
    next["Invoicing period end date"] =
      next["Invoicing period end date"] || "2026-01-31";
  }

  if (txn === FV.TXN_SPECIAL_ZONE_SUPPLIES) {
    next["Seller country subdivision code"] =
      FV.SPECIAL_ZONE_COUNTRY_SUBDIVISION_CL13;
    next["Buyer country subdivision code"] =
      FV.SPECIAL_ZONE_COUNTRY_SUBDIVISION_CL13;
  }

  return applyPartyIdentifiersByTxnType(next);
}

/** Shared Oman document seed for submit matrices (OMR + type/txn extras). */
export function buildOmanSubmitDocumentRow(
  invoiceTypeCode: string,
  txn: string
): Record<string, string> {
  let common: Record<string, string | null> = {
    ...buildValidOmanFullTaxInvoiceRow(),
  };
  common = applySubmitTxnExtras(common, txn);
  common = applySubmitInvoiceTypeExtras(common, invoiceTypeCode);
  return asStringRow(common);
}

function applySubmitInvoiceTypeExtras(
  row: Record<string, string | null>,
  invoiceTypeCode: string
): Record<string, string | null> {
  const next: Record<string, string | null> = {
    ...row,
    [FV.INVOICE_TYPE_CODE_FIELD]: invoiceTypeCode,
  };
  if (!isCreditOrDebitInvoiceType(invoiceTypeCode)) {
    next[FV.CREDIT_DEBIT_NOTE_REASON_CODE_FIELD] = "";
    next[FV.PRECEDING_INVOICE_REFERENCE_FIELD] = "";
    next[FV.PRECEDING_INVOICE_ISSUE_DATE_FIELD] = "";
    next[FV.PRECEDING_INVOICE_UUID_FIELD] = "";
    return next;
  }
  next[FV.CREDIT_DEBIT_NOTE_REASON_CODE_FIELD] = FV.CREDIT_DEBIT_REASON_SAMPLE;
  next[FV.PRECEDING_INVOICE_REFERENCE_FIELD] = "PREV-OMN-001";
  next[FV.PRECEDING_INVOICE_ISSUE_DATE_FIELD] = "2026-06-01";
  next[FV.PRECEDING_INVOICE_UUID_FIELD] = FV.PRECEDING_INVOICE_UUID_SAMPLE;
  return next;
}

function overlayLine(
  common: Record<string, string>,
  def: LineDef,
  txn: string
): Record<string, string> {
  const line: Record<string, string> = {
    ...common,
    "Invoice line identifier": def.lineId,
    [FV.ITEM_TYPE_FIELD]: def.itemType,
    [FV.TAX_CATEGORY_FIELD]: def.taxCategory,
    [FV.INVOICED_ITEM_TAX_RATE_FIELD]: def.taxRate,
    [FV.TAX_EXEMPTION_REASON_CODE_FIELD]: def.exemption,
    [FV.TAX_EXEMPTION_REASON_TEXT_FIELD]: def.exemption,
    [FV.SERVICE_TYPE_CODE_FIELD]: def.serviceTypeCode,
    [FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD]: def.hsCode,
    [FV.PROFIT_MARGIN_ITEM_TYPE_CODE_FIELD]: "",
  };
  if (
    (txn === FV.TXN_PROFIT_MARGIN_INVOICE ||
      txn === FV.TXN_PROFIT_MARGIN_SELF_INVOICE) &&
    def.itemType === FV.ITEM_TYPE_GOODS
  ) {
    line[FV.PROFIT_MARGIN_ITEM_TYPE_CODE_FIELD] =
      FV.PROFIT_MARGIN_ITEM_TYPE_SAMPLE;
  }
  return line;
}

export function buildOmanMultiItemSubmitCases(): MultiItemSubmitInvoiceCase[] {
  const cases: MultiItemSubmitInvoiceCase[] = [];
  for (const typeEntry of invoiceTypeCodeValidTestData) {
    for (const txnEntry of invoiceTransactionTypeValidTestData) {
      const invoiceTypeCode = typeEntry.label;
      const txn = txnEntry.label;
      const commonStr = buildOmanSubmitDocumentRow(invoiceTypeCode, txn);
      const rows = LINE_DEFS.map((def) => overlayLine(commonStr, def, txn));
      cases.push({
        name: `${invoiceTypeCode} | ${txn} | OMR | 4 items`,
        rows,
      });
    }
  }
  return cases;
}

export const multiItemInvoiceCases: MultiItemSubmitInvoiceCase[] =
  buildOmanMultiItemSubmitCases();

export const MULTI_ITEM_SUBMIT_CASE_COUNT = multiItemInvoiceCases.length;
