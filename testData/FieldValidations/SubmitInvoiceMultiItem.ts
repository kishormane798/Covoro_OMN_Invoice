/**
 * Oman submit multi-item matrix (Excel header keys).
 * 32 invoice types × 14 transaction types (Profit Margin Self-Invoice
 * omitted — IBR-086-OM requires every line tax category O, which this
 * mixed 4-category matrix cannot satisfy); IBR-177-OM further limits
 * Self billed credit note / Self-billed invoice to Self-billed Invoice,
 * Import of Services (RCM), and Import of Goods (Profit Margin
 * Self-Invoice already omitted). IBR-138-OM further drops any BTOM-001
 * cell that combines Self-billed with Third-party / Export / RCM /
 * Profit margin / Profit Margin Self-Invoice / Import of Goods.
 * IBR-139-OM further drops Self-billed combined with Third-party
 * Invoice on BTOM-001. IBR-140-OM further drops any BTOM-001 cell that
 * combines Summary with Continuous / Export / Profit margin / Profit
 * Margin Self-Invoice / Import of Goods. IBR-141-OM further drops any
 * BTOM-001 cell that combines Continuous Supply with Summary / Deemed
 * Supply / Profit margin / Profit Margin Self-Invoice / Import of Goods.
 * IBR-142-OM … IBR-149-OM further drop subject ⊕ named partner
 * combinations (single Master labels never violate these pair rules).
 * Each case 4 lines
 * (2 Goods + 2 Services, all 4 Oman tax categories, OMR).
 */
import {
  buildValidOmanFullTaxInvoiceRow,
  applyOmanDeliveryOverlay,
  applyPartyIdentifiersByTxnType,
} from "../../Helpers/excel/conditionalValidationHelper";
import {
  applySelfBilledPartyIdentitySwap,
  isSelfBilledInvoiceType,
} from "../../utils/envPartyIdentity";
import * as FV from "./ConditionalValidation";
import {
  invoiceTypeCodeValidTestData,
  invoiceTransactionTypeValidTestData,
} from "../Master/Master.omnCore";

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
    // IBR-084-OM: origin is mandatory on every line for Import of Goods.
    next[FV.ITEM_COUNTRY_OF_ORIGIN_FIELD] =
      next[FV.ITEM_COUNTRY_OF_ORIGIN_FIELD] || FV.UAE_COUNTRY_CODE;
  }

  if (txn === FV.TXN_IMPORT_OF_SERVICES_RCM) {
    // IBR-160-OM: seller country must not be OM.
    next[FV.SELLER_COUNTRY_CODE_FIELD] = FV.UAE_COUNTRY_CODE;
  }

  if (txn === FV.TXN_EXPORT_INVOICE) {
    next = applyOmanDeliveryOverlay(next, "export");
  }

  // IBR-040-OM: Deliver To address (line 1–3, city, post code, country code)
  // MUST be present when Invoice transaction type is E-commerce supplies.
  if (txn === FV.TXN_ECOMMERCE_TRANSACTION) {
    next = applyOmanDeliveryOverlay(next, "domestic");
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

  // IBR-175-OM: Profit Margin Invoice → IBT-025 + BTOM-031 MUST be present.
  if (txn === FV.TXN_PROFIT_MARGIN_INVOICE) {
    next[FV.PRECEDING_INVOICE_REFERENCE_FIELD] =
      next[FV.PRECEDING_INVOICE_REFERENCE_FIELD] || "PREV-OMN-001";
    next[FV.PRECEDING_INVOICE_UUID_FIELD] =
      next[FV.PRECEDING_INVOICE_UUID_FIELD] || FV.PRECEDING_INVOICE_UUID_SAMPLE;
    next[FV.PRECEDING_INVOICE_ISSUE_DATE_FIELD] =
      next[FV.PRECEDING_INVOICE_ISSUE_DATE_FIELD] || "2026-06-01";
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
  common["Buyer electronic address"] = "om-receiver-dev";
  let row = asStringRow(common);
  if (isSelfBilledInvoiceType(invoiceTypeCode)) {
    row = applySelfBilledPartyIdentitySwap(row);
  }
  return row;
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
    const txn = String(
      next[FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD] ?? ""
    ).trim();
    // Keep IBR-175-OM preceding fields for Profit Margin Invoice.
    if (txn !== FV.TXN_PROFIT_MARGIN_INVOICE) {
      next[FV.PRECEDING_INVOICE_REFERENCE_FIELD] = "";
      next[FV.PRECEDING_INVOICE_ISSUE_DATE_FIELD] = "";
      next[FV.PRECEDING_INVOICE_UUID_FIELD] = "";
    }
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
  // CL-11-OM: BTOM-025 required on every line for Profit Margin txn types
  // (goods and services).
  if (
    txn === FV.TXN_PROFIT_MARGIN_INVOICE ||
    txn === FV.TXN_PROFIT_MARGIN_SELF_INVOICE
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
      // IBR-086-OM: Profit Margin Self-Invoice MUST be tax category O on
      // every line — skip this txn from the mixed 4-category matrix.
      if (txn === FV.TXN_PROFIT_MARGIN_SELF_INVOICE) {
        continue;
      }
      // IBR-177-OM: 261/389 may only use Self-billed / RCM / Import of Goods.
      if (!FV.isIbr177CompatibleInvoiceTxnPair(invoiceTypeCode, txn)) {
        continue;
      }
      // IBR-138-OM: drop Self-billed ⊕ Third-party/Export/RCM/PM/Import bits.
      if (FV.txnViolatesIbr138Om(txn)) {
        continue;
      }
      // IBR-139-OM: drop Self-billed ⊕ Third-party bits.
      if (FV.txnViolatesIbr139Om(txn)) {
        continue;
      }
      // IBR-140-OM: drop Summary ⊕ Continuous/Export/PM/Import bits.
      if (FV.txnViolatesIbr140Om(txn)) {
        continue;
      }
      // IBR-141-OM: drop Continuous ⊕ Summary/Deemed/PM/Import descriptions.
      if (FV.txnViolatesIbr141Om(txn)) {
        continue;
      }
      // IBR-142-OM … IBR-149-OM: drop subject ⊕ named partner combinations.
      if (FV.txnViolatesIbr142Om(txn)) {
        continue;
      }
      if (FV.txnViolatesIbr143Om(txn)) {
        continue;
      }
      if (FV.txnViolatesIbr144Om(txn)) {
        continue;
      }
      if (FV.txnViolatesIbr145Om(txn)) {
        continue;
      }
      if (FV.txnViolatesIbr146Om(txn)) {
        continue;
      }
      if (FV.txnViolatesIbr147Om(txn)) {
        continue;
      }
      if (FV.txnViolatesIbr148Om(txn)) {
        continue;
      }
      if (FV.txnViolatesIbr149Om(txn)) {
        continue;
      }
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
